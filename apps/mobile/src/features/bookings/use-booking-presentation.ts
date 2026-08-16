import type { Booking } from '@/features/bookings/booking-service';
import { useTheme } from '@/hooks/use-theme';
import type { TranslationKey } from '@/i18n';

export function useBookingPresentation(locale: string) {
  const theme = useTheme();

  const formatBookingPrice = (booking: Booking) => {
    if (!booking.pricing) return null;

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: booking.pricing.currency,
    }).format(booking.pricing.amountCents / 100);
  };

  const bookingStatusKey = (status: Booking['status']) =>
    `status.${status}` as TranslationKey;

  const getBookingStatusStyle = (status: Booking['status'] | undefined) => {
    if (status === 'pending') {
      return {
        backgroundColor: theme.warningSurface,
        borderColor: theme.warning,
      };
    }

    if (status === 'confirmed' || status === 'modified') {
      return {
        backgroundColor: theme.successSurface,
        borderColor: theme.success,
      };
    }

    if (status === 'refused') {
      return { backgroundColor: theme.errorSurface, borderColor: theme.error };
    }

    return undefined;
  };

  const bookingStatusThemeColor = (
    status: Booking['status']
  ): 'warning' | 'success' | 'error' | 'primary' => {
    if (status === 'pending') return 'warning';
    if (status === 'confirmed' || status === 'modified') return 'success';
    if (status === 'refused') return 'error';
    return 'primary';
  };

  return {
    bookingStatusKey,
    bookingStatusThemeColor,
    formatBookingPrice,
    getBookingStatusStyle,
  };
}
