import { schedulingLocalDateTimeToIso } from '@nextpoint/shared';

export type StudentAvailabilityCalendarDay = {
  date: string;
  dayOfMonth: number;
  inCurrentMonth: boolean;
};

export type StudentAvailabilityMonth = {
  monthKey: string;
  startDate: string;
  endDate: string;
  startsAt: string;
  endsAt: string;
  days: StudentAvailabilityCalendarDay[];
};

function parseDate(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  return { year, monthIndex: month - 1, day };
}

function formatUtcDate(date: Date) {
  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, '0'),
    String(date.getUTCDate()).padStart(2, '0'),
  ].join('-');
}

function addUtcDays(date: Date, days: number) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function getSchedulingMidnight(date: Date) {
  const iso = schedulingLocalDateTimeToIso(formatUtcDate(date), '00:00');
  if (!iso) throw new RangeError('Invalid Europe/Paris calendar boundary');
  return iso;
}

export function getStudentAvailabilityMonth(
  anchorDate: string
): StudentAvailabilityMonth {
  const { year, monthIndex } = parseDate(anchorDate);
  const monthStart = new Date(Date.UTC(year, monthIndex, 1));
  const nextMonthStart = new Date(Date.UTC(year, monthIndex + 1, 1));
  const monthEnd = addUtcDays(nextMonthStart, -1);
  const mondayOffset = (monthStart.getUTCDay() + 6) % 7;
  const gridStart = addUtcDays(monthStart, -mondayOffset);
  const calendarDayCount = Math.ceil(
    (mondayOffset + monthEnd.getUTCDate()) / 7
  ) * 7;
  const monthKey = formatUtcDate(monthStart).slice(0, 7);

  return {
    monthKey,
    startDate: formatUtcDate(monthStart),
    endDate: formatUtcDate(monthEnd),
    startsAt: getSchedulingMidnight(monthStart),
    endsAt: getSchedulingMidnight(nextMonthStart),
    days: Array.from({ length: calendarDayCount }, (_, index) => {
      const date = addUtcDays(gridStart, index);
      const dateKey = formatUtcDate(date);

      return {
        date: dateKey,
        dayOfMonth: date.getUTCDate(),
        inCurrentMonth: dateKey.startsWith(monthKey),
      };
    }),
  };
}

export function moveStudentAvailabilityMonth(
  anchorDate: string,
  direction: -1 | 1
) {
  const { year, monthIndex } = parseDate(anchorDate);
  return formatUtcDate(new Date(Date.UTC(year, monthIndex + direction, 1)));
}

export function isSameStudentAvailabilityMonth(
  leftDate: string,
  rightDate: string
) {
  return leftDate.slice(0, 7) === rightDate.slice(0, 7);
}
