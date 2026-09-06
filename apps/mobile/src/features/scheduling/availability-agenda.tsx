import {
  getSchedulingDateLabelInstant,
  schedulingTimeZone,
  type AvailabilityRecurrenceType,
} from '@nextpoint/shared';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Feedback } from '@/components/ui/feedback';
import { Spacing } from '@/constants/theme';
import { AgendaGrid } from '@/features/scheduling/agenda-grid';
import type {
  AvailabilityRange,
  AvailabilitySlot,
} from '@/features/scheduling/availability-service';
import { isCoachPlanningSlotVisible } from '@/features/scheduling/coach-planning-visibility';
import { planningControlIcons } from '@/features/scheduling/planning-control-icons';
import { ProfileOptionSelector } from '@/features/profiles/profile-option-selector';
import { usePlanningView } from '@/features/scheduling/use-planning-view';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation, type TranslationKey } from '@/i18n';

export function AvailabilityAgenda({
  editingSlotId,
  onCancelEditing,
  onEdit,
  ranges,
  slots,
}: {
  editingSlotId: string | null;
  onCancelEditing: () => void;
  onEdit: (slot: AvailabilitySlot) => void;
  ranges: AvailabilityRange[];
  slots: AvailabilitySlot[];
}) {
  const { locale, t } = useTranslation();
  const theme = useTheme();
  const { goToToday, mode, move, setMode, window } = usePlanningView();
  const [recurrenceFilter, setRecurrenceFilter] = useState<
    'all' | AvailabilityRecurrenceType
  >('all');
  const availableSlots = useMemo(
    () => slots.filter((slot) => isCoachPlanningSlotVisible(slot.status)),
    [slots]
  );
  const visibleSlots = useMemo(() => {
    if (recurrenceFilter === 'all') return availableSlots;

    const recurrenceByRangeId = new Map(
      ranges.map((range) => [range.id, range.recurrenceType])
    );
    return availableSlots.filter(
      (slot) => recurrenceByRangeId.get(slot.rangeId) === recurrenceFilter
    );
  }, [availableSlots, ranges, recurrenceFilter]);
  const agendaSlots = useMemo(() => {
    const startsAt = new Date(window.startsAt).getTime();
    const endsAt = new Date(window.endsAt).getTime();

    return visibleSlots.filter((slot) => {
      const slotStartsAt = new Date(slot.startsAt).getTime();
      return slotStartsAt >= startsAt && slotStartsAt < endsAt;
    });
  }, [visibleSlots, window.endsAt, window.startsAt]);

  const formatAgendaDay = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      timeZone: schedulingTimeZone,
    }).format(getSchedulingDateLabelInstant(value) ?? new Date(value));

  const formatTime = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: schedulingTimeZone,
    }).format(new Date(value));

  const changeMode = (nextMode: typeof mode) => {
    onCancelEditing();
    setMode(nextMode);
  };
  const changePeriod = (direction: -1 | 1) => {
    onCancelEditing();
    move(direction);
  };
  const returnToToday = () => {
    onCancelEditing();
    goToToday();
  };

  return (
    <View style={styles.list}>
      <ThemedText type="subtitle">{t('availability.listTitle')}</ThemedText>
      {availableSlots.length > 0 ? (
        <ProfileOptionSelector<'all' | AvailabilityRecurrenceType>
          label={t('availability.filterLabel')}
          onChange={setRecurrenceFilter}
          options={[
            { value: 'all', label: t('availability.filter.all') },
            { value: 'none', label: t('availability.filter.none') },
            { value: 'daily', label: t('availability.filter.daily') },
            { value: 'weekly', label: t('availability.filter.weekly') },
          ]}
          value={recurrenceFilter}
        />
      ) : null}
      {availableSlots.length === 0 ? (
        <Feedback
          message={t('availability.emptyBody')}
          title={t('availability.emptyTitle')}
          tone="info"
        />
      ) : (
        <View style={styles.savedAgenda}>
          <View style={styles.toolbar}>
            <View style={styles.segmented}>
              {(['week', 'day'] as const).map((candidate) => (
                <Button
                  key={candidate}
                  label={t(`planning.mode.${candidate}` as TranslationKey)}
                  onPress={() => changeMode(candidate)}
                  style={styles.toolbarButton}
                  variant={mode === candidate ? 'primary' : 'secondary'}
                />
              ))}
            </View>
            <View style={styles.periodActions}>
              <Button
                icon={planningControlIcons.previous}
                label={t('planning.previousAction')}
                onPress={() => changePeriod(-1)}
                style={[styles.toolbarButton, styles.periodButton]}
                variant="secondary"
              />
              <Button
                label={t('planning.todayAction')}
                onPress={returnToToday}
                style={[styles.toolbarButton, styles.periodButton]}
                variant="secondary"
              />
              <Button
                icon={planningControlIcons.next}
                iconPosition="right"
                label={t('planning.nextAction')}
                onPress={() => changePeriod(1)}
                style={[styles.toolbarButton, styles.periodButton]}
                variant="secondary"
              />
            </View>
          </View>

          {agendaSlots.length === 0 ? (
            <Feedback
              message={t('availability.emptyPeriodBody')}
              title={t('availability.emptyPeriodTitle')}
              tone="info"
            />
          ) : null}

          <AgendaGrid
            days={window.days}
            formatDay={formatAgendaDay}
            getSlotStyle={(slot) => ({
              backgroundColor:
                editingSlotId === slot.id
                  ? theme.backgroundSelected
                  : theme.successSurface,
              borderColor:
                editingSlotId === slot.id ? theme.primary : theme.success,
              borderLeftWidth: 5,
            })}
            onSlotPress={onEdit}
            renderSlot={(slot) => (
              <>
                <ThemedText numberOfLines={1} type="smallBold">
                  {t('availability.rangeTime', {
                    start: formatTime(slot.startsAt),
                    end: formatTime(slot.endsAt),
                  })}
                </ThemedText>
                <ThemedText
                  numberOfLines={1}
                  type="small"
                  themeColor="textMuted">
                  {`${slot.location} · ${t(
                    `availability.slotStatus.${slot.status}` as TranslationKey
                  )}`}
                </ThemedText>
              </>
            )}
            slots={agendaSlots}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: Spacing.three,
  },
  savedAgenda: {
    gap: Spacing.three,
  },
  toolbar: {
    gap: Spacing.two,
  },
  segmented: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  periodActions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  toolbarButton: {
    flex: 1,
    paddingHorizontal: Spacing.one,
  },
  periodButton: {
    minWidth: 0,
  },
});
