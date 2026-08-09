import { getSchedulingTime } from '@nextpoint/shared';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  useWindowDimensions,
  View,
  type GestureResponderEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BorderWidth, Radii, Spacing } from '@/constants/theme';
import { getAgendaGridSelection } from '@/features/scheduling/agenda-grid-selection';
import {
  agendaHourMarks,
  getAgendaSlotPosition,
  getAgendaTimePosition,
  getNonPastPlanningDays,
  getSlotDateKey,
  type PlanningDay,
} from '@/features/scheduling/planning-window';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n';

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
  const blockRef = useRef<View>(null);
  const Component = onPress ? Pressable : View;

  const selectAtPosition = (
    locationY: number | undefined,
    blockHeight: number
  ) => {
    if (!onPress) return;

    const desiredStartsAt = getAgendaGridSelection({
      startsAt: slot.startsAt,
      endsAt: slot.endsAt,
      height: blockHeight,
      locationY,
    });
    if (desiredStartsAt) onPress(slot, desiredStartsAt);
  };

  const handlePress = (event: GestureResponderEvent) => {
    const { locationY, pageY } = event.nativeEvent;
    if (Number.isFinite(locationY)) {
      selectAtPosition(locationY, height);
      return;
    }

    if (!Number.isFinite(pageY) || !blockRef.current) {
      selectAtPosition(undefined, height);
      return;
    }

    blockRef.current.measureInWindow((_x, pageTop, _width, measuredHeight) => {
      selectAtPosition(pageY - pageTop, measuredHeight);
    });
  };

  return (
    <Component
      accessibilityRole={onPress ? 'button' : undefined}
      onLayout={(event) => setHeight(event.nativeEvent.layout.height)}
      onPress={onPress ? handlePress : undefined}
      ref={blockRef}
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
  const { t } = useTranslation();
  const { width } = useWindowDimensions();
  const compact = width < 760;
  const [nowMs, setNowMs] = useState(Date.now);
  const currentDate = getSlotDateKey(new Date(nowMs).toISOString());
  const currentTimePosition = getAgendaTimePosition(nowMs);
  const currentTime = getSchedulingTime(nowMs);
  const visibleDays =
    compact && days.length === 7
      ? getNonPastPlanningDays(days, currentDate)
      : days;

  useEffect(() => {
    const timer = setInterval(() => setNowMs(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  const renderTemporalContext = (date: string) => {
    const pastHeight =
      date < currentDate
        ? '100%'
        : date === currentDate
          ? currentTimePosition
          : null;

    return (
      <>
        {pastHeight && pastHeight !== '0%' ? (
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            pointerEvents="none"
            style={[
              styles.pastOverlay,
              { backgroundColor: theme.background, height: pastHeight },
            ]}
          />
        ) : null}
        {date === currentDate ? (
          <View
            accessibilityLabel={`${t('planning.nowLabel')} ${currentTime}`}
            accessible
            pointerEvents="none"
            style={[styles.currentTimeMarker, { top: currentTimePosition }]}>
            <View
              style={[
                styles.currentTimeDot,
                { backgroundColor: theme.primary },
              ]}
            />
            <View
              style={[
                styles.currentTimeLine,
                { backgroundColor: theme.primary },
              ]}
            />
            <View
              style={[
                styles.currentTimeLabel,
                { backgroundColor: theme.primary },
              ]}>
              <ThemedText type="smallBold" themeColor="surface">
                {currentTime}
              </ThemedText>
            </View>
          </View>
        ) : null}
      </>
    );
  };

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
        {visibleDays.map((day) => {
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
                  {renderTemporalContext(day.date)}
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
              {renderTemporalContext(day.date)}
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
  pastOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    opacity: 0.58,
    zIndex: 2,
  },
  currentTimeMarker: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 2,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 3,
  },
  currentTimeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  currentTimeLine: {
    flex: 1,
    height: 2,
  },
  currentTimeLabel: {
    position: 'absolute',
    right: Spacing.one,
    top: -12,
    minHeight: 24,
    borderRadius: Radii.small,
    paddingHorizontal: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
