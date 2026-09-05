import { handleOptions, jsonResponse } from '../_shared/http.ts';
import { adminClient, isApiKeyRequest } from '../_shared/supabase.ts';

type EmailKind =
  | 'booking_confirmed'
  | 'booking_cancelled'
  | 'coach_student_cancelled'
  | 'coach_weekly_pending_reminder';

type EmailDelivery = {
  id: string;
  recipient_id: string;
  recipient_email: string | null;
  recipient_name: string;
  recipient_language: 'fr' | 'en' | 'es';
  kind: EmailKind;
  booking_id: string | null;
  payload: Record<string, unknown>;
  attempts: number;
  processing_started_at: string;
};

type RenderedEmail = {
  subject: string;
  text: string;
  html: string;
};

const resendApiKey = Deno.env.get('RESEND_API_KEY');
const emailFrom = Deno.env.get('EMAIL_FROM');
const emailWorkerSecret = Deno.env.get('EMAIL_WORKER_SECRET');
const appUrl = (Deno.env.get('APP_URL') ?? 'https://equationpadel.fr').replace(/\/$/, '');

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function textValue(payload: Record<string, unknown>, key: string, fallback = '') {
  const value = payload[key];
  return typeof value === 'string' ? value : fallback;
}

function countValue(payload: Record<string, unknown>, key: string) {
  const value = payload[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function formatLessonDate(value: string, language: EmailDelivery['recipient_language']) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat(language, {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Europe/Paris',
  }).format(date);
}

function emailShell(title: string, paragraphs: string[], actionLabel: string, actionUrl: string) {
  const safeTitle = escapeHtml(title);
  const body = paragraphs
    .map((paragraph) => `<p style="margin:0 0 14px;color:#292522;line-height:1.55">${escapeHtml(paragraph)}</p>`)
    .join('');

  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f4f2ef;font-family:Arial,sans-serif"><div style="max-width:600px;margin:0 auto;padding:32px 20px"><div style="background:#151311;color:#f7f4f1;padding:28px;border-radius:8px"><div style="color:#df824c;font-size:15px;font-weight:700;margin-bottom:18px">Equation Padel</div><h1 style="font-size:24px;line-height:1.25;margin:0 0 20px">${safeTitle}</h1><div style="background:#fff;color:#292522;padding:22px;border-radius:6px">${body}<a href="${escapeHtml(actionUrl)}" style="display:inline-block;margin-top:6px;background:#df824c;color:#151311;text-decoration:none;font-weight:700;padding:12px 18px;border-radius:6px">${escapeHtml(actionLabel)}</a></div></div></div></body></html>`;
}

function renderEmail(delivery: EmailDelivery): RenderedEmail {
  const language = delivery.recipient_language;
  const payload = delivery.payload ?? {};
  const startsAt = textValue(payload, 'startsAt');
  const location = textValue(payload, 'location');
  const date = startsAt ? formatLessonDate(startsAt, language) : '';
  const bookingUrl = delivery.booking_id
    ? `${appUrl}/${delivery.kind === 'coach_student_cancelled' ? 'coach' : 'eleve'}?bookingId=${encodeURIComponent(delivery.booking_id)}`
    : `${appUrl}/coach`;

  if (delivery.kind === 'booking_confirmed') {
    const coachName = textValue(payload, 'coachName', 'Votre coach');
    const translations = {
      fr: {
        subject: 'Votre cours est confirmé',
        title: 'Cours confirmé',
        paragraphs: [`Votre cours avec ${coachName} est confirmé.`, `Date : ${date}`, `Lieu : ${location}`],
        action: 'Voir mon agenda',
      },
      en: {
        subject: 'Your lesson is confirmed',
        title: 'Lesson confirmed',
        paragraphs: [`Your lesson with ${coachName} is confirmed.`, `Date: ${date}`, `Location: ${location}`],
        action: 'View my schedule',
      },
      es: {
        subject: 'Tu clase está confirmada',
        title: 'Clase confirmada',
        paragraphs: [`Tu clase con ${coachName} está confirmada.`, `Fecha: ${date}`, `Lugar: ${location}`],
        action: 'Ver mi agenda',
      },
    }[language];
    return {
      subject: translations.subject,
      text: [...translations.paragraphs, bookingUrl].join('\n'),
      html: emailShell(translations.title, translations.paragraphs, translations.action, bookingUrl),
    };
  }

  if (delivery.kind === 'booking_cancelled') {
    const translations = {
      fr: { subject: 'Votre cours a été annulé', title: 'Cours annulé', date: 'Date', location: 'Lieu', action: 'Voir mon agenda' },
      en: { subject: 'Your lesson was cancelled', title: 'Lesson cancelled', date: 'Date', location: 'Location', action: 'View my schedule' },
      es: { subject: 'Tu clase ha sido cancelada', title: 'Clase cancelada', date: 'Fecha', location: 'Lugar', action: 'Ver mi agenda' },
    }[language];
    const paragraphs = [`${translations.date} : ${date}`, `${translations.location} : ${location}`];
    return {
      subject: translations.subject,
      text: [...paragraphs, bookingUrl].join('\n'),
      html: emailShell(translations.title, paragraphs, translations.action, bookingUrl),
    };
  }

  if (delivery.kind === 'coach_student_cancelled') {
    const studentName = textValue(payload, 'studentName', 'Un élève');
    const translations = {
      fr: { subject: 'Un élève a annulé un cours', title: 'Cours annulé par un élève', body: `${studentName} a annulé un cours confirmé.`, date: 'Date', action: 'Ouvrir le planning' },
      en: { subject: 'A student cancelled a lesson', title: 'Lesson cancelled by a student', body: `${studentName} cancelled a confirmed lesson.`, date: 'Date', action: 'Open schedule' },
      es: { subject: 'Un alumno ha cancelado una clase', title: 'Clase cancelada por un alumno', body: `${studentName} ha cancelado una clase confirmada.`, date: 'Fecha', action: 'Abrir la agenda' },
    }[language];
    const paragraphs = [translations.body, `${translations.date} : ${date}`];
    return {
      subject: translations.subject,
      text: [...paragraphs, bookingUrl].join('\n'),
      html: emailShell(translations.title, paragraphs, translations.action, bookingUrl),
    };
  }

  const nextWeekCount = countValue(payload, 'nextWeekPendingCount');
  const laterCount = countValue(payload, 'laterPendingCount');
  const translations = {
    fr: {
      subject: 'Demandes de cours à traiter',
      title: 'Vos demandes en attente',
      paragraphs: [
        `${nextWeekCount} demande(s) sont en attente pour la semaine à venir.`,
        `${laterCount} autre(s) demande(s) sont en attente pour les semaines suivantes.`,
      ],
      action: 'Répondre aux demandes',
    },
    en: {
      subject: 'Lesson requests to review',
      title: 'Your pending requests',
      paragraphs: [
        `${nextWeekCount} request(s) are pending for next week.`,
        `${laterCount} other request(s) are pending for later weeks.`,
      ],
      action: 'Review requests',
    },
    es: {
      subject: 'Solicitudes de clase pendientes',
      title: 'Tus solicitudes pendientes',
      paragraphs: [
        `${nextWeekCount} solicitud(es) están pendientes para la próxima semana.`,
        `${laterCount} solicitud(es) adicionales están pendientes para las semanas siguientes.`,
      ],
      action: 'Revisar solicitudes',
    },
  }[language];
  return {
    subject: translations.subject,
    text: [...translations.paragraphs, bookingUrl].join('\n'),
    html: emailShell(translations.title, translations.paragraphs, translations.action, bookingUrl),
  };
}

async function updateFailedDelivery(delivery: EmailDelivery, errorCode: string) {
  const exhausted = delivery.attempts >= 5;
  const retryMinutes = Math.min(60, 2 ** Math.max(0, delivery.attempts - 1));
  const nextAttemptAt = new Date(Date.now() + retryMinutes * 60_000).toISOString();

  await adminClient
    .from('notification_email_deliveries')
    .update({
      status: exhausted ? 'failed' : 'pending',
      error_code: errorCode.slice(0, 120),
      next_attempt_at: nextAttemptAt,
      processing_started_at: null,
    })
    .eq('id', delivery.id)
    .eq('status', 'pending')
    .eq('processing_started_at', delivery.processing_started_at);

  return exhausted;
}

async function sendEmail(delivery: EmailDelivery) {
  if (!resendApiKey || !emailFrom) {
    return { sent: false, exhausted: await updateFailedDelivery(delivery, 'email_provider_not_configured') };
  }
  if (!delivery.recipient_email) {
    return { sent: false, exhausted: await updateFailedDelivery(delivery, 'recipient_email_missing') };
  }

  const rendered = renderEmail(delivery);
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
        'Idempotency-Key': delivery.id,
      },
      body: JSON.stringify({
        from: emailFrom,
        to: [delivery.recipient_email],
        subject: rendered.subject,
        text: rendered.text,
        html: rendered.html,
      }),
      signal: AbortSignal.timeout(15_000),
    });
    const responseBody = await response.json().catch(() => null);

    if (!response.ok || typeof responseBody?.id !== 'string') {
      return {
        sent: false,
        exhausted: await updateFailedDelivery(delivery, `resend_http_${response.status}`),
      };
    }

    await adminClient
      .from('notification_email_deliveries')
      .update({
        status: 'sent',
        sent_at: new Date().toISOString(),
        provider_message_id: responseBody.id,
        error_code: null,
      })
      .eq('id', delivery.id)
      .eq('status', 'pending')
      .eq('processing_started_at', delivery.processing_started_at);

    return { sent: true, exhausted: false };
  } catch {
    return { sent: false, exhausted: await updateFailedDelivery(delivery, 'email_request_failed') };
  }
}

async function processPendingEmailNotifications() {
  const reminderResult = await adminClient.rpc('enqueue_due_coach_weekly_email_reminders');
  if (reminderResult.error) {
    throw new Error('reminder_enqueue_failed');
  }

  const deliveriesResult = await adminClient.rpc('claim_pending_email_deliveries', {
    p_limit: 25,
  });
  if (deliveriesResult.error) {
    throw new Error('claim_failed');
  }

  const deliveries = (deliveriesResult.data ?? []) as EmailDelivery[];
  let sent = 0;
  let deferred = 0;
  let failed = 0;

  for (const delivery of deliveries) {
    const result = await sendEmail(delivery);
    if (result.sent) sent += 1;
    else if (result.exhausted) failed += 1;
    else deferred += 1;
  }

  console.log(JSON.stringify({
    event: 'email_worker_completed',
    queuedReminders: reminderResult.data ?? 0,
    processed: deliveries.length,
    sent,
    deferred,
    failed,
  }));
}

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request);
  if (optionsResponse) return optionsResponse;

  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: { code: 'method_not_allowed' } }, 405);
  }
  if (!(await isApiKeyRequest(request, emailWorkerSecret))) {
    console.warn('email_worker_forbidden');
    return jsonResponse({ ok: false, error: { code: 'forbidden' } }, 403);
  }

  console.log('email_worker_accepted');
  EdgeRuntime.waitUntil(
    processPendingEmailNotifications().catch((error) => {
      console.error('email_worker_failed', error instanceof Error ? error.message : 'unknown_error');
    }),
  );

  return jsonResponse({ ok: true, data: { processing: true } }, 202);
});
