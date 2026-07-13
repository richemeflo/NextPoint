import { handleOptions, jsonResponse } from '../_shared/http.ts';
import { adminClient, getRequestUser } from '../_shared/supabase.ts';

type PushAttempt = {
  id: string;
  notification_id: string;
  push_token_id: string | null;
  provider: 'expo' | 'web' | 'none' | null;
};

type AppNotification = {
  id: string;
  title: string;
  body: string;
  type: string;
  link_type: string | null;
  link_id: string | null;
  booking_id: string | null;
};

type PushToken = {
  id: string;
  token: string;
  provider: 'expo' | 'web' | 'none';
};

async function sendExpoPush(
  attempt: PushAttempt,
  notification: AppNotification,
  token: PushToken
) {
  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Accept-Encoding': 'gzip, deflate',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: token.token,
      title: notification.title,
      body: notification.body,
      sound: 'default',
      data: {
        notificationId: notification.id,
        type: notification.type,
        linkType: notification.link_type,
        linkId: notification.link_id,
        bookingId: notification.booking_id,
      },
    }),
  });

  const payload = await response.json().catch(() => null);
  const ticket = Array.isArray(payload?.data) ? payload.data[0] : payload?.data;
  const sent = response.ok && ticket?.status === 'ok';

  await adminClient
    .from('notification_push_delivery_attempts')
    .update({
      status: sent ? 'sent' : 'failed',
      error_code: sent
        ? null
        : ticket?.details?.error ?? ticket?.message ?? payload?.errors?.[0]?.message ?? 'expo_send_failed',
    })
    .eq('id', attempt.id);

  return sent;
}

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request);
  if (optionsResponse) return optionsResponse;

  const user = await getRequestUser(request);
  if (!user) {
    return jsonResponse({ ok: false, error: { code: 'unauthorized' } }, 401);
  }

  const attemptsResult = await adminClient
    .from('notification_push_delivery_attempts')
    .select('id, notification_id, push_token_id, provider')
    .eq('status', 'pending')
    .limit(100);

  if (attemptsResult.error || !attemptsResult.data?.length) {
    return jsonResponse({ ok: true, data: { processed: 0, sent: 0, failed: 0 } });
  }

  const attempts = attemptsResult.data as PushAttempt[];
  const notificationIds = [...new Set(attempts.map((attempt) => attempt.notification_id))];
  const tokenIds = [
    ...new Set(
      attempts
        .map((attempt) => attempt.push_token_id)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const [notificationsResult, tokensResult] = await Promise.all([
    adminClient
      .from('notifications')
      .select('id, title, body, type, link_type, link_id, booking_id')
      .in('id', notificationIds),
    tokenIds.length > 0
      ? adminClient
          .from('notification_push_tokens')
          .select('id, token, provider')
          .in('id', tokenIds)
          .eq('is_active', true)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (notificationsResult.error || tokensResult.error) {
    return jsonResponse({ ok: false, error: { code: 'load_failed' } }, 500);
  }

  const notifications = new Map(
    (notificationsResult.data as AppNotification[]).map((notification) => [
      notification.id,
      notification,
    ])
  );
  const tokens = new Map(
    (tokensResult.data as PushToken[]).map((token) => [token.id, token])
  );

  let sent = 0;
  let failed = 0;

  for (const attempt of attempts) {
    const notification = notifications.get(attempt.notification_id);
    const token = attempt.push_token_id
      ? tokens.get(attempt.push_token_id)
      : null;

    if (!notification || !token || token.provider !== 'expo') {
      failed += 1;
      await adminClient
        .from('notification_push_delivery_attempts')
        .update({
          status: 'failed',
          error_code: !notification
            ? 'notification_not_found'
            : !token
              ? 'push_token_not_found'
              : 'unsupported_provider',
        })
        .eq('id', attempt.id);
      continue;
    }

    if (await sendExpoPush(attempt, notification, token)) {
      sent += 1;
    } else {
      failed += 1;
    }
  }

  return jsonResponse({
    ok: true,
    data: { processed: attempts.length, sent, failed },
  });
});
