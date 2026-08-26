import { getSchedulingDateLabelInstant, schedulingTimeZone } from '@nextpoint/shared';
import { SymbolView } from 'expo-symbols';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { BorderWidth, Radii, Spacing } from '@/constants/theme';
import type { AvailabilitySlot } from '@/features/scheduling/availability-service';
import { planningControlIcons } from '@/features/scheduling/planning-control-icons';
import type { StudentAvailabilityMonth } from '@/features/scheduling/student-availability-month';
import { getSlotDateKey } from '@/features/scheduling/planning-window';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n';

type StudentAvailabilityCalendarProps = {
  currentDate: string;
  disablePreviousMonth: boolean;
  formatTime: (value: string) => string;
  month: StudentAvailabilityMonth;
  onMoveMonth: (direction: -1 | 1) => void;
  onSelectDate: (date: string) => void;
  onSelectSlot: (slot: AvailabilitySlot) => void;
  onToday: () => void;
  selectedDate: string | null;
  slots: AvailabilitySlot[];
};

const weekdayReferenceDates = [
  '2026-08-24',
  '2026-08-25',
  '2026-08-26',
  '2026-08-27',
  '2026-08-28',
  '2026-08-29',
  '2026-08-30',
];

export function StudentAvailabilityCalendar({
  currentDate,
  disablePreviousMonth,
  formatTime,
  month,
  onMoveMonth,
  onSelectDate,
  onSelectSlot,
  onToday,
  selectedDate,
  slots,
}: StudentAvailabilityCalendarProps) {
  const { locale, t } = useTranslation();
  const theme = useTheme();
  const slotsByDate = useMemo(() => {
    const grouped = new Map<string, AvailabilitySlot[]>();

    for (const slot of slots) {
      const date = getSlotDateKey(slot.startsAt);
      const current = grouped.get(date) ?? [];
      current.push(slot);
      grouped.set(date, current);
    }

    return grouped;
  }, [slots]);
  const weekdayLabels = useMemo(
    () =>
      weekdayReferenceDates.map((date) =>
        new Intl.DateTimeFormat(locale, {
          weekday: 'short',
          timeZone: schedulingTimeZone,
        }).format(getSchedulingDateLabelInstant(date) ?? new Date(date))
      ),
    [locale]
  );
  const monthLabel = new Intl.DateTimeFormat(locale, {
    month: 'long',
    year: 'numeric',
    timeZone: schedulingTimeZone,
  }).format(
    getSchedulingDateLabelInstant(month.startDate) ?? new Date(month.startDate)
  );
  const selectedDayLabel = selectedDate
    ? new Intl.DateTimeFormat(locale, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        timeZone: schedulingTimeZone,
      }).format(
        getSchedulingDateLabelInstant(selectedDate) ?? new Date(selectedDate)
      )
    : null;
  const selectedSlots = selectedDate
    ? (slotsByDate.get(selectedDate) ?? [])
    : [];

  return (
    <Card elevated style={styles.calendarCard}>
      <View style={styles.introduction}>
        <ThemedText type="smallBold">
          {t('studentAgenda.calendarTitle')}
        </ThemedText>
        <ThemedText type="small" themeColor="textMuted">
          {t('studentAgenda.calendarBody')}
        </ThemedText>
      </View>

      <View style={styles.monthNavigation}>
        <CalendarNavigationButton
          accessibilityLabel={t('studentAgenda.previousMonthAction')}
          disabled={disablePreviousMonth}
          direction="previous"
          onPress={() => onMoveMonth(-1)}
        />
        <ThemedText style={styles.monthLabel} type="smallBold">
          {monthLabel}
        </ThemedText>
        <CalendarNavigationButton
          accessibilityLabel={t('studentAgenda.nextMonthAction')}
          direction="next"
          onPress={() => onMoveMonth(1)}
        />
      </View>

      {month.monthKey !== currentDate.slice(0, 7) ? (
        <Pressable
          accessibilityRole="button"
          onPress={onToday}
          style={({ pressed }) => [
            styles.currentMonthButton,
            {
              backgroundColor: theme.surface,
              borderColor: theme.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}>
          <ThemedText type="smallBold">
            {t('studentAgenda.currentMonthAction')}
          </ThemedText>
        </Pressable>
      ) : null}

      <View style={styles.calendarGrid}>
        {weekdayLabels.map((label, index) => (
          <View key={`${label}-${index}`} style={styles.calendarColumn}>
            <ThemedText
              numberOfLines={1}
              style={styles.weekdayLabel}
              type="smallBold"
              themeColor="textMuted">
              {label.replace('.', '')}
            </ThemedText>
          </View>
        ))}

        {month.days.map((day) => {
          const daySlots = slotsByDate.get(day.date) ?? [];
          const isAvailable = day.inCurrentMonth && daySlots.length > 0;
          const isSelected = day.date === selectedDate;
          const isToday = day.date === currentDate;
          const dateLabel = new Intl.DateTimeFormat(locale, {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            timeZone: schedulingTimeZone,
          }).format(
            getSchedulingDateLabelInstant(day.date) ?? new Date(day.date)
          );

          return (
            <View key={day.date} style={styles.calendarColumn}>
              <Pressable
                accessibilityLabel={
                  isAvailable
                    ? t(
                        daySlots.length === 1
                          ? 'studentAgenda.availableDayLabel'
                          : 'studentAgenda.availableDayLabelPlural',
                        {
                          count: daySlots.length,
                          date: dateLabel,
                        }
                      )
                    : dateLabel
                }
                accessibilityRole="button"
                accessibilityState={{
                  disabled: !isAvailable,
                  selected: isSelected,
                }}
                disabled={!isAvailable}
                onPress={() => onSelectDate(day.date)}
                style={({ pressed }) => [
                  styles.dayButton,
                  isToday && {
                    borderColor: theme.secondary,
                    borderWidth: BorderWidth.regular,
                  },
                  isAvailable && {
                    backgroundColor: theme.backgroundSelected,
                  },
                  isSelected && {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                  },
                  pressed && styles.pressed,
                ]}>
                <ThemedText
                  style={styles.dayNumber}
                  type={isAvailable ? 'smallBold' : 'small'}
                  themeColor={
                    isSelected
                      ? 'surface'
                      : day.inCurrentMonth
                        ? isAvailable
                          ? 'primary'
                          : 'text'
                        : 'textMuted'
                  }>
                  {day.dayOfMonth}
                </ThemedText>
                {isAvailable ? (
                  <View
                    style={[
                      styles.availabilityDot,
                      {
                        backgroundColor: isSelected
                          ? theme.surface
                          : theme.secondary,
                      },
                    ]}
                  />
                ) : null}
              </Pressable>
            </View>
          );
        })}
      </View>

      <View style={styles.legend}>
        <View
          style={[
            styles.legendMarker,
            { backgroundColor: theme.backgroundSelected },
          ]}
        />
        <ThemedText type="small" themeColor="textMuted">
          {t('studentAgenda.availableLegend')}
        </ThemedText>
      </View>

      <View style={[styles.dayAgenda, { borderTopColor: theme.border }]}>
        {selectedDate && selectedDayLabel ? (
          <>
            <View style={styles.selectedDayHeader}>
              <ThemedText type="smallBold">
                {t('studentAgenda.selectedDateTitle', {
                  date: selectedDayLabel,
                })}
              </ThemedText>
              <ThemedText type="small" themeColor="textMuted">
                {t(
                  selectedSlots.length === 1
                    ? 'studentAgenda.availableRangeCount'
                    : 'studentAgenda.availableRangeCountPlural',
                  { count: selectedSlots.length }
                )}
              </ThemedText>
            </View>
            <View style={styles.slotList}>
              {selectedSlots.map((slot) => (
                <Pressable
                  accessibilityLabel={t('studentAgenda.selectRangeLabel', {
                    end: formatTime(slot.endsAt),
                    location: slot.location,
                    start: formatTime(slot.startsAt),
                  })}
                  accessibilityRole="button"
                  key={`${slot.id}:${slot.startsAt}`}
                  onPress={() => onSelectSlot(slot)}
                  style={({ pressed }) => [
                    styles.slotButton,
                    {
                      backgroundColor: theme.surface,
                      borderColor: pressed ? theme.primary : theme.border,
                    },
                    pressed && styles.pressed,
                  ]}>
                  <View style={styles.slotCopy}>
                    <ThemedText type="smallBold">
                      {t('planning.slotTime', {
                        end: formatTime(slot.endsAt),
                        start: formatTime(slot.startsAt),
                      })}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textMuted">
                      {slot.location}
                    </ThemedText>
                  </View>
                  <ThemedText type="smallBold" themeColor="primary">
                    {t('studentAgenda.chooseTimeAction')}
                  </ThemedText>
                </Pressable>
              ))}
            </View>
          </>
        ) : (
          <Feedback
            message={t('studentAgenda.emptyMonthBody')}
            title={t('studentAgenda.emptyMonthTitle')}
            tone="info"
          />
        )}
      </View>
    </Card>
  );
}

function CalendarNavigationButton({
  accessibilityLabel,
  direction,
  disabled = false,
  onPress,
}: {
  accessibilityLabel: string;
  direction: 'previous' | 'next';
  disabled?: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.navigationButton,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          opacity: disabled ? 0.4 : pressed ? 0.8 : 1,
        },
      ]}>
      <SymbolView
        name={planningControlIcons[direction]}
        size={18}
        tintColor={theme.text}
        weight="semibold"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  calendarCard: {
    gap: Spacing.three,
    padding: Spacing.three,
  },
  introduction: {
    gap: Spacing.one,
  },
  monthNavigation: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  monthLabel: {
    flex: 1,
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  navigationButton: {
    alignItems: 'center',
    borderRadius: Radii.medium,
    borderWidth: BorderWidth.regular,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  currentMonthButton: {
    alignSelf: 'center',
    borderRadius: Radii.medium,
    borderWidth: BorderWidth.regular,
    minHeight: 40,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -Spacing.two,
  },
  calendarColumn: {
    alignItems: 'center',
    padding: Spacing.half,
    width: '14.285714%',
  },
  weekdayLabel: {
    paddingVertical: Spacing.two,
    textAlign: 'center',
    textTransform: 'capitalize',
    width: '100%',
  },
  dayButton: {
    alignItems: 'center',
    aspectRatio: 1,
    borderRadius: 999,
    justifyContent: 'center',
    maxWidth: 44,
    width: '100%',
  },
  dayNumber: {
    textAlign: 'center',
  },
  availabilityDot: {
    borderRadius: 999,
    bottom: 5,
    height: 4,
    position: 'absolute',
    width: 4,
  },
  legend: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  legendMarker: {
    borderRadius: 999,
    height: 12,
    width: 12,
  },
  dayAgenda: {
    borderTopWidth: BorderWidth.regular,
    gap: Spacing.three,
    paddingTop: Spacing.three,
  },
  selectedDayHeader: {
    gap: Spacing.one,
  },
  slotList: {
    gap: Spacing.two,
  },
  slotButton: {
    alignItems: 'center',
    borderRadius: Radii.medium,
    borderWidth: BorderWidth.regular,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    justifyContent: 'space-between',
    minHeight: 64,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  slotCopy: {
    flex: 1,
    gap: Spacing.one,
    minWidth: 150,
  },
  pressed: {
    opacity: 0.82,
  },
});
