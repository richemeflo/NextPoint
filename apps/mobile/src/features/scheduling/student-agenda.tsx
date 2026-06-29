import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { Spacing } from '@/constants/theme';
import { AgendaGrid } from '@/features/scheduling/agenda-grid';
import {
  getStudentRequestableAvailabilitySlotsInRange,
  type AvailabilitySlot,
} from '@/features/scheduling/availability-service';
import {
  getPlanningWindow,
  getSlotDateKey,
  movePlanningAnchor,
  type PlanningViewMode,
} from '@/features/scheduling/planning-window';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation, type TranslationKey } from '@/i18n';

function formatLocalDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const today = () => formatLocalDate(new Date());

export function StudentAgenda() {
  const { locale, t } = useTranslation();
  const theme = useTheme();
  const [mode, setMode] = useState<PlanningViewMode>('week');
  const [displayMode, setDisplayMode] = useState<'agenda' | 'list'>('agenda');
  const [anchorDate, setAnchorDate] = useState(today);
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const window = useMemo(
    () => getPlanningWindow(anchorDate, mode),
    [anchorDate, mode]
  );

  useEffect(() => {
    let active = true;

    void Promise.resolve().then(async () => {
      setIsRefreshing(true);
      const result = await getStudentRequestableAvailabilitySlotsInRange(
        window.startsAt,
        window.endsAt
      );

      if (!active) return;

      if (!result.ok) {
        setLoadState('error');
        setIsRefreshing(false);
        return;
      }

      setSlots(result.data);
      setLoadState('ready');
      setIsRefreshing(false);
    });

    return () => {
      active = false;
    };
  }, [window.endsAt, window.startsAt]);

  const slotsByDay = useMemo(() => {
    const grouped = new Map<string, AvailabilitySlot[]>();

    for (const slot of slots) {
      const key = getSlotDateKey(slot.startsAt);
      const current = grouped.get(key) ?? [];
      current.push(slot);
      grouped.set(key, current);
    }

    return grouped;
  }, [slots]);

  const formatDay = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
    }).format(new Date(`${value}T00:00:00Z`));

  const formatTime = (value: string) =>
    new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));

  const move = (direction: -1 | 1) =>
    setAnchorDate((current) => movePlanningAnchor(current, mode, direction));

  const renderSlotContent = (slot: AvailabilitySlot) => (
    <>
      <ThemedText type="smallBold">
        {t('planning.slotTime', {
          start: formatTime(slot.startsAt),
          end: formatTime(slot.endsAt),
        })}
      </ThemedText>
      <ThemedText type="small" themeColor="textMuted">
        {t('studentAgenda.slotDetail', {
          date: formatDay(getSlotDateKey(slot.startsAt)),
          duration: t(
            `availability.duration.${slot.durationMinutes}` as TranslationKey
          ),
          location: slot.location,
        })}
      </ThemedText>
      <ThemedText type="smallBold" themeColor="primary">
        {t('studentAgenda.requestableStatus')}
      </ThemedText>
    </>
  );

  const renderAgendaSlotContent = (slot: AvailabilitySlot) => (
    <>
      <ThemedText type="smallBold">
        {t('planning.slotTime', {
          start: formatTime(slot.startsAt),
          end: formatTime(slot.endsAt),
        })}
      </ThemedText>
      <ThemedText type="small" themeColor="textMuted">
        {slot.location}
      </ThemedText>
      <ThemedText type="smallBold" themeColor="primary">
        {t('studentAgenda.requestableStatus')}
      </ThemedText>
    </>
  );

  if (loadState === 'loading') {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={theme.primary} size="small" />
        <ThemedText type="small" themeColor="textMuted">
          {t('studentAgenda.loading')}
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.heading}>
          <ThemedText type="subtitle">{t('studentAgenda.title')}</ThemedText>
          <ThemedText type="small" themeColor="textMuted">
            {t('studentAgenda.body')}
          </ThemedText>
        </View>
        {isRefreshing ? (
          <ThemedText type="small" themeColor="textMuted">
            {t('planning.refreshing')}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.toolbar}>
        <View style={styles.segmented}>
          {(['agenda', 'list'] as const).map((candidate) => (
            <Button
              key={candidate}
              label={t(`planning.display.${candidate}` as TranslationKey)}
              onPress={() => setDisplayMode(candidate)}
              variant={displayMode === candidate ? 'primary' : 'secondary'}
            />
          ))}
        </View>
        <View style={styles.segmented}>
          {(['week', 'day'] as const).map((candidate) => (
            <Button
              key={candidate}
              label={t(`planning.mode.${candidate}` as TranslationKey)}
              onPress={() => setMode(candidate)}
              variant={mode === candidate ? 'primary' : 'secondary'}
            />
          ))}
        </View>
        <View style={styles.periodActions}>
          <Button
            label={t('planning.previousAction')}
            onPress={() => move(-1)}
            variant="secondary"
          />
          <Button
            label={t('planning.todayAction')}
            onPress={() => setAnchorDate(today())}
            variant="secondary"
          />
          <Button
            label={t('planning.nextAction')}
            onPress={() => move(1)}
            variant="secondary"
          />
        </View>
      </View>

      {loadState === 'error' ? (
        <Feedback
          message={t('studentAgenda.loadErrorBody')}
          title={t('studentAgenda.loadErrorTitle')}
          tone="error"
        />
      ) : null}

      {displayMode === 'agenda' ? (
        <AgendaGrid
          days={window.days}
          formatDay={formatDay}
          renderSlot={renderAgendaSlotContent}
          slots={slots}
        />
      ) : (
        <View style={styles.days}>
          {window.days.map((day) => {
            const daySlots = slotsByDay.get(day.date) ?? [];

            return (
              <View key={day.date} style={styles.daySection}>
                <ThemedText type="smallBold">{formatDay(day.date)}</ThemedText>
                {daySlots.length === 0 ? (
                  <Feedback
                    message={t('studentAgenda.emptyDayBody')}
                    title={t('studentAgenda.emptyDayTitle')}
                    tone="info"
                  />
                ) : (
                  <View style={styles.slotGrid}>
                    {daySlots.map((slot) => (
                      <Card key={slot.id} style={styles.slotCard}>
                        {renderSlotContent(slot)}
                      </Card>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  loading: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
  header: {
    gap: Spacing.one,
  },
  heading: {
    gap: Spacing.one,
  },
  toolbar: {
    gap: Spacing.three,
  },
  segmented: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  periodActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  days: {
    gap: Spacing.four,
  },
  daySection: {
    gap: Spacing.two,
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  slotCard: {
    minHeight: 112,
    minWidth: 220,
    flex: 1,
    gap: Spacing.two,
  },
});
