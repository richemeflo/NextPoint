import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildGoogleCalendarUrl,
  canAddBookingToGoogleCalendar,
} from './google-calendar';

const booking = {
  startsAt: '2026-09-07T10:00:00.000Z',
  endsAt: '2026-09-07T11:30:00.000Z',
  location: 'Court 2',
  status: 'confirmed',
};

test('builds a prefilled Google Calendar URL without application identifiers', () => {
    const url = buildGoogleCalendarUrl(booking, {
      title: 'Padel lesson',
      details: 'Group lesson - 90 minutes',
    });

    assert.notEqual(url, null);
    const parsed = new URL(url!);
    assert.equal(parsed.origin, 'https://calendar.google.com');
    assert.equal(parsed.searchParams.get('dates'),
      '20260907T100000Z/20260907T113000Z'
    );
    assert.equal(parsed.search.includes('bookingId'), false);
    assert.equal(parsed.search.includes('student'), false);
});

test('only allows active confirmed or modified bookings', () => {
    assert.equal(canAddBookingToGoogleCalendar(booking, Date.parse('2026-09-07T09:00:00Z')), true);
    assert.equal(canAddBookingToGoogleCalendar({ ...booking, status: 'pending' }, 0), false);
    assert.equal(canAddBookingToGoogleCalendar(booking, Date.parse(booking.endsAt)), false);
});
