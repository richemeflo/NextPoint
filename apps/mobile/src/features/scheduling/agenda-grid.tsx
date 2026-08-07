import { useState, type ReactNode } from 'react';
import {
  getSchedulingDateKey,
  schedulingLocalDateTimeToIso,
} from '@nextpoint/shared';
import {
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BorderWidth, Radii, Spacing } from '@/constants/theme';
import {
  agendaEndHour,
  agendaHourMarks,
  agendaStartHour,
  getAgendaSlotPosition,
  getSlotDateKey,
  type PlanningDay,
} from '@/features/scheduling/planning-window';
import { useTheme } from '@/hooks/use-theme';

type AgendaGridItem = {
  id: string;
  startsAt: string;
  endsAt: string;
};

type AgendaGridProps<TItem extends AgendaGridItem> = {
  days: PlanningDay[];
  formatDay: (date: string) => string;
  getSlotStyle?: (slot: TItem) => StyleProp<ViewStyle>;
  renderSlot: (slot: TItem) => ReactNode;
  slots: TItem[];
  onSlotPress?: (slot: TItem, desiredStartsAt: string) => void;
  isSlotPressable?: (slot: TItem) => boolean;
};

function AgendaSlotBlock<TItem extends AgendaGridItem>({
  children,
  onPress,
  slot,
  style,
}: {
  children: ReactNode;
  onPress?: (slot: TItem, desiredStartsAt: string) => void;
  slot: TItem;
  style: StyleProp<ViewStyle>;
}) {
  const [height, setHeight] = useState(0);
  const Component = onPress ? Pressable : View;

  return (
    <Component
      accessibilityRole={onPress ? 'button' : undefined}
      onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
      onPress={
        onPress
          ? (event) => {
              const start = new Date(slot.startsAt).getTime();
              const end = new Date(slot.endsAt).getTime();
              const date = getSchedulingDateKey(slot.startsAt);
              const agendaStart = schedulingLocalDateTimeToIso(
                date,
                `${String(agendaStartHour).padStart(2, '0')}:00`
              );
              const agendaEnd = schedulingLocalDateTimeToIso(
                date,
                `${String(agendaEndHour).padStart(2, '0')}:00`
              );
              if (height <= 0 || !agendaStart || !agendaEnd) return;

              const visibleStart = Math.max(start, new Date(agendaStart).getTime());
              const visibleEnd = Math.min(end, new Date(agendaEnd).getTime());
              if (visibleEnd <= visibleStart) return;

              const ratio = event.nativeEvent.locationY / height;
              const raw =
                visibleStart +
                Math.max(0, Math.min(1, ratio)) * (visibleEnd - visibleStart);
              const roundedToMinute = Math.round(raw / 60_000) * 60_000;
              onPress(
                slot,
                new Date(
                  Math.max(visibleStart, Math.min(visibleEnd, roundedToMinute))
                ).toISOString()
              );
            }
          : undefined
      }
      style={style}>
      {children}
    </Component>
  );
}

export function AgendaGrid<TItem extends AgendaGridItem>({
  days,
  formatDay,
  getSlotStyle,
  renderSlot,
  slots,
  onSlotPress,
  isSlotPressable,
}: AgendaGridProps<TItem>) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const compact = width < 760;

  const slotsByDay = new Map<string, TItem[]>();
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
                    <AgendaSlotBlock
                      key={slot.id}
                      onPress={
                        onSlotPress && (isSlotPressable?.(slot) ?? true)
                          ? onSlotPress
                          : undefined
                      }
                      slot={slot}
                      style={[
                        styles.slotBlock,
                        getAgendaSlotPosition(slot.startsAt, slot.endsAt),
                        {
                          backgroundColor: theme.surfaceElevated,
                          borderColor: theme.primary,
                        },
                        getSlotStyle?.(slot),
                      ]}>
                      {renderSlot(slot)}
                    </AgendaSlotBlock>
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
                <AgendaSlotBlock
                  key={slot.id}
                  onPress={
                    onSlotPress && (isSlotPressable?.(slot) ?? true)
                      ? onSlotPress
                      : undefined
                  }
                  slot={slot}
                  style={[
                    styles.slotBlock,
                    getAgendaSlotPosition(slot.startsAt, slot.endsAt),
                    {
                      backgroundColor: theme.surfaceElevated,
                      borderColor: theme.primary,
                    },
                    getSlotStyle?.(slot),
                  ]}>
                  {renderSlot(slot)}
                </AgendaSlotBlock>
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
    overflow: 'hidden',
  },
});
