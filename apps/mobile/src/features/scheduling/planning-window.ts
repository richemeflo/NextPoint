export const planningViewModes = ['week', 'day'] as const;

export type PlanningViewMode = (typeof planningViewModes)[number];

export type PlanningDay = {
  date: string;
};

export type PlanningWindow = {
  mode: PlanningViewMode;
  anchorDate: string;
  startDate: string;
  endDate: string;
  startsAt: string;
  endsAt: string;
  days: PlanningDay[];
};

export const agendaStartHour = 8;
export const agendaEndHour = 22;
export const agendaHourMarks = Array.from(
  { length: agendaEndHour - agendaStartHour + 1 },
  (_, index) => agendaStartHour + index
);

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

export function getPlanningWindow(
  anchorDate: string,
  mode: PlanningViewMode
): PlanningWindow {
  const { year, monthIndex, day } = parseDate(anchorDate);
  const anchor = new Date(Date.UTC(year, monthIndex, day));
  const mondayOffset = (anchor.getUTCDay() + 6) % 7;
  const start = mode === 'week' ? addUtcDays(anchor, -mondayOffset) : anchor;
  const dayCount = mode === 'week' ? 7 : 1;
  const end = addUtcDays(start, dayCount - 1);
  const exclusiveEnd = addUtcDays(start, dayCount);

  return {
    mode,
    anchorDate,
    startDate: formatUtcDate(start),
    endDate: formatUtcDate(end),
    startsAt: start.toISOString(),
    endsAt: exclusiveEnd.toISOString(),
    days: Array.from({ length: dayCount }, (_, index) => ({
      date: formatUtcDate(addUtcDays(start, index)),
    })),
  };
}

export function movePlanningAnchor(
  anchorDate: string,
  mode: PlanningViewMode,
  direction: -1 | 1
) {
  const { year, monthIndex, day } = parseDate(anchorDate);
  const anchor = new Date(Date.UTC(year, monthIndex, day));
  const days = mode === 'week' ? 7 : 1;

  return formatUtcDate(addUtcDays(anchor, days * direction));
}

export function getSlotDateKey(startsAt: string) {
  return startsAt.slice(0, 10);
}

export function getAgendaSlotPosition(
  startsAt: string,
  endsAt: string,
  startHour = agendaStartHour,
  endHour = agendaEndHour
) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const startMinutes = start.getHours() * 60 + start.getMinutes();
  const endMinutes = end.getHours() * 60 + end.getMinutes();
  const agendaStartMinutes = startHour * 60;
  const agendaEndMinutes = endHour * 60;
  const agendaDuration = agendaEndMinutes - agendaStartMinutes;
  const top =
    ((Math.max(startMinutes, agendaStartMinutes) - agendaStartMinutes) /
      agendaDuration) *
    100;
  const bottom =
    ((agendaEndMinutes - Math.min(endMinutes, agendaEndMinutes)) /
      agendaDuration) *
    100;

  const clampedTop = Math.max(0, Math.min(top, 100));
  const clampedHeight = Math.max(
    7,
    100 - Math.max(0, top) - Math.max(0, bottom)
  );

  return {
    top: `${clampedTop}%` as `${number}%`,
    height: `${clampedHeight}%` as `${number}%`,
  };
}
