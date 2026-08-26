import { handleOptions, jsonResponse } from '../_shared/http.ts';
import {
  adminClient,
  getRequestUser,
  isCoach,
} from '../_shared/supabase.ts';

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

async function deleteLinkedBookingNotifications(studentId: string) {
  const bookings = await adminClient
    .from('bookings')
    .select('id')
    .eq('student_id', studentId);
  if (bookings.error) throw bookings.error;

  const bookingIds = bookings.data.map((booking) => booking.id);
  if (bookingIds.length === 0) return;

  const byBooking = await adminClient
    .from('notifications')
    .delete()
    .in('booking_id', bookingIds);
  if (byBooking.error) throw byBooking.error;

  const byLink = await adminClient
    .from('notifications')
    .delete()
    .in('link_id', bookingIds);
  if (byLink.error) throw byLink.error;
}

Deno.serve(async (request) => {
  const optionsResponse = handleOptions(request);
  if (optionsResponse) return optionsResponse;

  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, error: { code: 'method_not_allowed' } }, 405);
  }

  const coach = await getRequestUser(request);
  if (!coach || !(await isCoach(coach.id))) {
    return jsonResponse({
      ok: false,
      error: { code: 'unauthorized', message: 'Coach role required' },
    });
  }

  const body = await request.json().catch(() => null);
  const studentId =
    body && typeof body.studentId === 'string' ? body.studentId : '';
  if (!uuidPattern.test(studentId)) {
    return jsonResponse({
      ok: false,
      error: { code: 'invalid_student', message: 'Student is required' },
    });
  }

  const [relationship, profile, authUser] = await Promise.all([
    adminClient
      .from('student_coach_relationships')
      .select('association_method, status')
      .eq('coach_id', coach.id)
      .eq('student_id', studentId)
      .maybeSingle(),
    adminClient
      .from('student_profiles')
      .select('account_status')
      .eq('user_id', studentId)
      .maybeSingle(),
    adminClient.auth.admin.getUserById(studentId),
  ]);

  if (relationship.error || profile.error || authUser.error) {
    return jsonResponse({
      ok: false,
      error: { code: 'deletion_failed', message: 'Unable to validate student' },
    });
  }

  const provisionedByCoach =
    authUser.data.user?.user_metadata?.provisioned_by_coach === true;
  const canDelete =
    relationship.data?.status === 'active' &&
    relationship.data.association_method === 'manual' &&
    profile.data?.account_status === 'pending_activation' &&
    provisionedByCoach;

  if (!canDelete) {
    return jsonResponse({
      ok: false,
      error: {
        code: 'account_not_deletable',
        message: 'Only an associated pending student account can be deleted',
      },
    });
  }

  try {
    await deleteLinkedBookingNotifications(studentId);
    const deleted = await adminClient.auth.admin.deleteUser(studentId, false);
    if (deleted.error) throw deleted.error;

    return jsonResponse({
      ok: true,
      data: { deletedStudentId: studentId },
    });
  } catch {
    return jsonResponse({
      ok: false,
      error: { code: 'deletion_failed', message: 'Unable to delete student' },
    });
  }
});
