import {
  getSchedulingDateKey,
  schedulingLocalDateTimeToIso,
} from '@nextpoint/shared';

import { agendaEndHour, agendaStartHour } from './planning-window';

type AgendaGridSelectionInput = {
  startsAt: string;
  endsAt: string;
  height: number;
  locationY: number | undefined;
};

const quarterHourMs = 15 * 60_000;

export function getAgendaGridSelection({
  startsAt,
  endsAt,
  height,
  locationY,
}: AgendaGridSelectionInput): string | null {
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return null;
  }

  const date = getSchedulingDateKey(start);
  const agendaStart = schedulingLocalDateTimeToIso(
    date,
    `${String(agendaStartHour).padStart(2, '0')}:00`
  );
  const agendaEnd = schedulingLocalDateTimeToIso(
    date,
    `${String(agendaEndHour).padStart(2, '0')}:00`
  );
  if (!agendaStart || !agendaEnd) return null;

  const visibleStart = Math.max(start, new Date(agendaStart).getTime());
  const visibleEnd = Math.min(end, new Date(agendaEnd).getTime());
  if (
    !Number.isFinite(visibleStart) ||
    !Number.isFinite(visibleEnd) ||
    visibleEnd <= visibleStart
  ) {
    return null;
  }

  const ratio =
    typeof locationY === 'number' &&
    Number.isFinite(locationY) &&
    Number.isFinite(height) &&
    height > 0
      ? Math.max(0, Math.min(1, locationY / height))
      : 0;
  const raw = visibleStart + ratio * (visibleEnd - visibleStart);
  const firstQuarter = Math.ceil(visibleStart / quarterHourMs) * quarterHourMs;
  const lastQuarter = Math.floor(visibleEnd / quarterHourMs) * quarterHourMs;
  if (firstQuarter > lastQuarter) return null;

  const roundedToQuarter = Math.floor(raw / quarterHourMs) * quarterHourMs;
  const selection = Math.max(
    firstQuarter,
    Math.min(lastQuarter, roundedToQuarter)
  );

  return Number.isFinite(selection) ? new Date(selection).toISOString() : null;
}
