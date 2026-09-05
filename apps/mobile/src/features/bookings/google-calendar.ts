type CalendarBooking = {
  startsAt: string;
  endsAt: string;
  location: string;
  status: string;
};

type CalendarEventCopy = {
  title: string;
  details: string;
};

function toGoogleDate(value: string) {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

export function canAddBookingToGoogleCalendar(
  booking: CalendarBooking,
  now = Date.now()
) {
  const endsAt = new Date(booking.endsAt).getTime();
  return (
    (booking.status === 'confirmed' || booking.status === 'modified') &&
    Number.isFinite(endsAt) &&
    endsAt > now
  );
}

export function buildGoogleCalendarUrl(
  booking: CalendarBooking,
  copy: CalendarEventCopy
) {
  const startsAt = toGoogleDate(booking.startsAt);
  const endsAt = toGoogleDate(booking.endsAt);
  if (!startsAt || !endsAt || new Date(booking.endsAt) <= new Date(booking.startsAt)) {
    return null;
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: copy.title,
    dates: `${startsAt}/${endsAt}`,
    details: copy.details,
    location: booking.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
