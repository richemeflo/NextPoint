import type { ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BorderWidth, Radii, Spacing } from '@/constants/theme';
import type { AvailabilitySlot } from '@/features/scheduling/availability-service';
import {
  agendaHourMarks,
  getAgendaSlotPosition,
  getSlotDateKey,
  type PlanningDay,
} from '@/features/scheduling/planning-window';
import { useTheme } from '@/hooks/use-theme';

type AgendaGridProps = {
  days: PlanningDay[];
  formatDay: (date: string) => string;
  renderSlot: (slot: AvailabilitySlot) => ReactNode;
  slots: AvailabilitySlot[];
};

export function AgendaGrid({
  days,
  formatDay,
  renderSlot,
  slots,
}: AgendaGridProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const compact = width < 760;

  const slotsByDay = new Map<string, AvailabilitySlot[]>();
  for (const slot of slots) {
    const key = getSlotDateKey(slot.startsAt);
    const current = slotsByDay.get(key) ?? [];
    current.push(slot);
    slotsByDay.set(key, current);
  }

  if (compact) {
    return (
      <View style={styles.compactDays}>
        {days.map((day) => {
          const daySlots = slotsByDay.get(day.date) ?? [];

          return (
            <View key={day.date} style={styles.compactDay}>
              <ThemedText type="smallBold">{formatDay(day.date)}</ThemedText>
              <View
                style={[
                  styles.dayTimeline,
                  { borderColor: theme.border, backgroundColor: theme.surface },
                ]}>
                <View style={styles.timeRail}>
                  {agendaHourMarks.map((hour) => (
                    <ThemedText key={hour} type="small" themeColor="textMuted">
                      {`${String(hour).padStart(2, '0')}:00`}
                    </ThemedText>
                  ))}
                </View>
                <View style={styles.timelineBody}>
                  {agendaHourMarks.map((hour, index) => (
                    <View
                      key={hour}
                      style={[
                        styles.hourLine,
                        {
                          borderColor: theme.border,
                          top: `${(index / (agendaHourMarks.length - 1)) * 100}%`,
                        },
                      ]}
                    />
                  ))}
                  {daySlots.map((slot) => (
                    <View
                      key={slot.id}
                      style={[
                        styles.slotBlock,
                        getAgendaSlotPosition(slot.startsAt, slot.endsAt),
                        {
                          backgroundColor: theme.surfaceElevated,
                          borderColor: theme.primary,
                        },
                      ]}>
                      {renderSlot(slot)}
                    </View>
                  ))}
                </View>
              </View>
            </View>
          );
        })}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.grid,
        { borderColor: theme.border, backgroundColor: theme.surface },
      ]}>
      <View style={styles.headerRow}>
        <View style={[styles.cornerCell, { borderColor: theme.border }]} />
        {days.map((day) => (
          <View
            key={day.date}
            style={[styles.headerCell, { borderColor: theme.border }]}>
            <ThemedText numberOfLines={2} type="smallBold">
              {formatDay(day.date)}
            </ThemedText>
          </View>
        ))}
      </View>
      <View style={styles.bodyRow}>
        <View style={[styles.desktopTimeRail, { borderColor: theme.border }]}>
          {agendaHourMarks.map((hour) => (
            <ThemedText key={hour} type="small" themeColor="textMuted">
              {`${String(hour).padStart(2, '0')}:00`}
            </ThemedText>
          ))}
        </View>
        {days.map((day) => {
          const daySlots = slotsByDay.get(day.date) ?? [];

          return (
            <View
              key={day.date}
              style={[styles.desktopDayColumn, { borderColor: theme.border }]}>
              {agendaHourMarks.map((hour, index) => (
                <View
                  key={hour}
                  style={[
                    styles.hourLine,
                    {
                      borderColor: theme.border,
                      top: `${(index / (agendaHourMarks.length - 1)) * 100}%`,
                    },
                  ]}
                />
              ))}
              {daySlots.map((slot) => (
                <View
                  key={slot.id}
                  style={[
                    styles.slotBlock,
                    getAgendaSlotPosition(slot.startsAt, slot.endsAt),
                    {
                      backgroundColor: theme.surfaceElevated,
                      borderColor: theme.primary,
                    },
                  ]}>
                  {renderSlot(slot)}
                </View>
              ))}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  compactDays: {
    gap: Spacing.four,
  },
  compactDay: {
    gap: Spacing.two,
  },
  dayTimeline: {
    borderWidth: BorderWidth.regular,
    borderRadius: Radii.medium,
    flexDirection: 'row',
    minHeight: 640,
    overflow: 'hidden',
  },
  timeRail: {
    width: 64,
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  timelineBody: {
    flex: 1,
    position: 'relative',
  },
  grid: {
    borderWidth: BorderWidth.regular,
    borderRadius: Radii.medium,
    overflow: 'hidden',
  },
  headerRow: {
    flexDirection: 'row',
    minHeight: 64,
  },
  cornerCell: {
    width: 64,
    borderRightWidth: BorderWidth.regular,
    borderBottomWidth: BorderWidth.regular,
  },
  headerCell: {
    flex: 1,
    justifyContent: 'center',
    borderRightWidth: BorderWidth.regular,
    borderBottomWidth: BorderWidth.regular,
    paddingHorizontal: Spacing.two,
  },
  bodyRow: {
    flexDirection: 'row',
    minHeight: 720,
  },
  desktopTimeRail: {
    width: 64,
    justifyContent: 'space-between',
    borderRightWidth: BorderWidth.regular,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.two,
  },
  desktopDayColumn: {
    flex: 1,
    position: 'relative',
    borderRightWidth: BorderWidth.regular,
  },
  hourLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  slotBlock: {
    position: 'absolute',
    left: Spacing.one,
    right: Spacing.one,
    borderLeftWidth: 3,
    borderRadius: Radii.small,
    padding: Spacing.two,
    justifyContent: 'center',
    minHeight: 52,
  },
});
