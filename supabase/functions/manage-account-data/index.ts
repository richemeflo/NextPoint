import { handleOptions, jsonResponse } from '../_shared/http.ts';
import { adminClient, getRequestUser } from '../_shared/supabase.ts';

type Row = Record<string, unknown>;

type PaginatedQuery = {
  range: (
    from: number,
    to: number
  ) => PromiseLike<{ data: unknown; error: { message: string } | null }>;
};

async function selectRows(query: PaginatedQuery) {
  const rows: Row[] = [];
  const pageSize = 1000;

  for (let from = 0; ; from += pageSize) {
    const { data, error } = await query.range(from, from + pageSize - 1);
    if (error) throw new Error(error.message);

    const page = Array.isArray(data) ? (data as Row[]) : [];
    rows.push(...page);
    if (page.length < pageSize) return rows;
  }
}

function uniqueRows(rows: Row[]) {
  const seen = new Set<string>();
  return rows.filter((row) => {
    const key = typeof row.id === 'string' ? row.id : JSON.stringify(row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function redactForeignIdentifiers(rows: Row[], userId: string) {
  const identityKeys = new Set([
    'coach_id',
    'created_by',
    'recipient_id',
    'sender_id',
    'student_id',
    'user_id',
  ]);
  const secretKeys = new Set(['token', 'token_hash']);

  return rows.map((row) =>
    Object.fromEntries(
      Object.entries(row).filter(([key, value]) => {
        if (secretKeys.has(key)) return false;
        if (identityKeys.has(key) && typeof value === 'string' && value !== userId) {
          return false;
        }
        return true;
      })
    )
  );
}

async function collectAccountData(user: NonNullable<Awaited<ReturnType<typeof getRequestUser>>>) {
  const userId = user.id;
  const [
    roles,
    studentProfiles,
    coachProfiles,
    legalAcceptances,
    relationships,
    pricingRates,
    targetedPricingRates,
    history,
    privateNotes,
    lessonPacks,
    availabilityRanges,
    availabilitySlots,
    bookingParticipants,
    directBookings,
    notifications,
    pushPreferences,
    pushTokens,
    deliveryAttempts,
    messageThreads,
    sentMessages,
  ] = await Promise.all([
    selectRows(adminClient.from('user_roles').select('*').eq('user_id', userId)),
    selectRows(adminClient.from('student_profiles').select('*').eq('user_id', userId)),
    selectRows(adminClient.from('coach_profiles').select('*').eq('user_id', userId)),
    selectRows(adminClient.from('legal_acceptances').select('*').eq('user_id', userId)),
    selectRows(
      adminClient
        .from('student_coach_relationships')
        .select('*')
        .or(`coach_id.eq.${userId},student_id.eq.${userId}`)
    ),
    selectRows(adminClient.from('pricing_rates').select('*').eq('coach_id', userId)),
    selectRows(adminClient.from('pricing_rate_students').select('*').eq('student_id', userId)),
    selectRows(
      adminClient
        .from('student_history_events')
        .select('*')
        .or(`coach_id.eq.${userId},student_id.eq.${userId}`)
    ),
    selectRows(adminClient.from('student_private_notes').select('*').eq('coach_id', userId)),
    selectRows(
      adminClient
        .from('lesson_packs')
        .select('*')
        .or(`coach_id.eq.${userId},student_id.eq.${userId}`)
    ),
    selectRows(adminClient.from('availability_ranges').select('*').eq('coach_id', userId)),
    selectRows(adminClient.from('availability_slots').select('*').eq('coach_id', userId)),
    selectRows(adminClient.from('booking_participants').select('*').eq('student_id', userId)),
    selectRows(
      adminClient
        .from('bookings')
        .select('*')
        .or(`coach_id.eq.${userId},student_id.eq.${userId}`)
    ),
    selectRows(adminClient.from('notifications').select('*').eq('recipient_id', userId)),
    selectRows(adminClient.from('notification_push_preferences').select('*').eq('user_id', userId)),
    selectRows(adminClient.from('notification_push_tokens').select('*').eq('user_id', userId)),
    selectRows(
      adminClient
        .from('notification_push_delivery_attempts')
        .select('*')
        .eq('recipient_id', userId)
    ),
    selectRows(adminClient.from('coach_message_threads').select('*').eq('coach_id', userId)),
    selectRows(adminClient.from('coach_messages').select('*').eq('sender_id', userId)),
  ]);

  const participantBookingIds = bookingParticipants
    .map((row) => row.booking_id)
    .filter((id): id is string => typeof id === 'string');
  const participantBookings = participantBookingIds.length
    ? await selectRows(adminClient.from('bookings').select('*').in('id', participantBookingIds))
    : [];
  const allBookings = uniqueRows([...directBookings, ...participantBookings]);

  const threadIds = messageThreads
    .map((row) => row.id)
    .filter((id): id is string => typeof id === 'string');
  const threadMessages = threadIds.length
    ? await selectRows(adminClient.from('coach_messages').select('*').in('thread_id', threadIds))
    : [];

  return {
    formatVersion: '1.0',
    exportedAt: new Date().toISOString(),
    account: {
      id: user.id,
      email: user.email ?? null,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastSignInAt: user.last_sign_in_at ?? null,
    },
    data: {
      roles: redactForeignIdentifiers(roles, userId),
      profiles: redactForeignIdentifiers([...studentProfiles, ...coachProfiles], userId),
      legalAcceptances: redactForeignIdentifiers(legalAcceptances, userId),
      coachStudentRelationships: redactForeignIdentifiers(relationships, userId),
      pricingRates: redactForeignIdentifiers([...pricingRates, ...targetedPricingRates], userId),
      lessonHistory: redactForeignIdentifiers(history, userId),
      privateCoachNotes: redactForeignIdentifiers(privateNotes, userId),
      lessonPacks: redactForeignIdentifiers(lessonPacks, userId),
      availability: redactForeignIdentifiers([...availabilityRanges, ...availabilitySlots], userId),
      bookings: redactForeignIdentifiers(allBookings, userId),
      bookingParticipations: redactForeignIdentifiers(bookingParticipants, userId),
      notifications: redactForeignIdentifiers(notifications, userId),
      notificationPreferences: redactForeignIdentifiers(
        [...pushPreferences, ...pushTokens, ...deliveryAttempts],
        userId
      ),
      messaging: redactForeignIdentifiers(
        [...messageThreads, ...uniqueRows([...sentMessages, ...threadMessages])],
        userId
      ),
    },
  };
}

function chunks<T>(values: T[], size = 200) {
  const output: T[][] = [];
  for (let index = 0; index < values.length; index += size) {
    output.push(values.slice(index, index + size));
  }
  return output;
}

async function deleteBookingNotifications(userId: string) {
  const [directBookings, participations] = await Promise.all([
    selectRows(
      adminClient
        .from('bookings')
        .select('id')
        .or(`coach_id.eq.${userId},student_id.eq.${userId}`)
    ),
    selectRows(adminClient.from('booking_participants').select('booking_id').eq('student_id', userId)),
  ]);
  const bookingIds = [...new Set(
    [...directBookings.map((row) => row.id), ...participations.map((row) => row.booking_id)]
      .filter((id): id is string => typeof id === 'string')
  )];

  for (const bookingIdChunk of chunks(bookingIds)) {
    const byBooking = await adminClient
      .from('notifications')
      .delete()
      .in('booking_id', bookingIdChunk);
    if (byBooking.error) throw new Error(byBooking.error.message);

    const byLink = await adminClient
      .from('notifications')
      .delete()
      .in('link_id', bookingIdChunk);
    if (byLink.error) throw new Error(byLink.error.message);
  }
}

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request);
  if (optionsResponse) return optionsResponse;

  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: { code: 'method_not_allowed' } }, 405);
  }

  const user = await getRequestUser(request);
  if (!user) {
    return jsonResponse({ ok: false, error: { code: 'unauthorized' } }, 401);
  }

  const body = await request.json().catch(() => null);
  const action = body && typeof body.action === 'string' ? body.action : '';

  if (action === 'export') {
    try {
      return jsonResponse({ ok: true, data: await collectAccountData(user) });
    } catch {
      return jsonResponse({ ok: false, error: { code: 'export_failed' } }, 500);
    }
  }

  if (action === 'delete') {
    if (!body || body.confirmation !== 'DELETE') {
      return jsonResponse({ ok: false, error: { code: 'confirmation_required' } }, 400);
    }

    const lastSignInAt = Date.parse(user.last_sign_in_at ?? '');
    if (!Number.isFinite(lastSignInAt) || Date.now() - lastSignInAt > 5 * 60 * 1000) {
      return jsonResponse(
        { ok: false, error: { code: 'recent_authentication_required' } },
        401
      );
    }

    try {
      await deleteBookingNotifications(user.id);
      const deleted = await adminClient.auth.admin.deleteUser(user.id, false);
      if (deleted.error) throw deleted.error;
      return jsonResponse({ ok: true, deleted: true });
    } catch {
      return jsonResponse({ ok: false, error: { code: 'deletion_failed' } }, 500);
    }
  }

  return jsonResponse({ ok: false, error: { code: 'invalid_action' } }, 400);
});
