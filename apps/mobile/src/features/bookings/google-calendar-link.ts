import * as Linking from 'expo-linking';

import type { Booking } from './booking-service';
import { buildGoogleCalendarUrl } from './google-calendar';

export async function openBookingInGoogleCalendar(
  booking: Booking,
  copy: { title: string; details: string }
) {
  const url = buildGoogleCalendarUrl(booking, copy);
  if (!url) return false;

  try {
    await Linking.openURL(url);
    return true;
  } catch {
    return false;
  }
}
