import { useEffect, useState } from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { ResponsivePageTitle } from '@/components/ui/responsive-page-title';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { getStudentAgendaInitialStartsAt } from '@/features/bookings/booking-service';
import { getSlotDateKey } from '@/features/scheduling/planning-window';
import { StudentAgenda } from '@/features/scheduling/student-agenda';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n';

type AgendaState =
  | { status: 'loading' }
  | { status: 'ready'; initialDate: string | null }
  | { status: 'error' };

export default function ElevePlanningScreen() {
  const { startsAt: linkedStartsAt } = useLocalSearchParams<{
    startsAt?: string;
  }>();
  const { t } = useTranslation();
  const theme = useTheme();
  const [agendaState, setAgendaState] = useState<AgendaState>({
    status: 'loading',
  });
  const linkedInitialDate =
    typeof linkedStartsAt === 'string' &&
    !Number.isNaN(new Date(linkedStartsAt).getTime())
      ? getSlotDateKey(linkedStartsAt)
      : null;

  useEffect(() => {
    if (linkedInitialDate) return undefined;

    let active = true;

    void getStudentAgendaInitialStartsAt()
      .then((result) => {
        if (!active) return;
        setAgendaState(
          result.ok
            ? {
                status: 'ready',
                initialDate: result.startsAt
                  ? getSlotDateKey(result.startsAt)
                  : null,
              }
            : { status: 'error' }
        );
      })
      .catch(() => {
        if (active) setAgendaState({ status: 'error' });
      });

    return () => {
      active = false;
    };
  }, [linkedInitialDate]);

  const resolvedAgendaState: AgendaState = linkedInitialDate
    ? { status: 'ready', initialDate: linkedInitialDate }
    : agendaState;

  const isEmpty =
    resolvedAgendaState.status === 'ready' &&
    resolvedAgendaState.initialDate === null;

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.heading}>
            {isEmpty ? (
              <ThemedText type="subtitle">
                {t('booking.studentListTitle')}
              </ThemedText>
            ) : (
              <ResponsivePageTitle
                context={t('role.eleveLabel')}
                title={t('booking.studentPageTitle')}
              />
            )}
            <ThemedText type="default" themeColor="textMuted">
              {t(
                isEmpty
                  ? 'booking.studentListBody'
                  : 'booking.studentPageBody'
              )}
            </ThemedText>
          </View>
          {resolvedAgendaState.status === 'loading' ? (
            <View style={styles.loading}>
              <ActivityIndicator color={theme.primary} />
            </View>
          ) : isEmpty ? null : (
            <StudentAgenda
              initialAnchorDate={
                resolvedAgendaState.status === 'ready'
                  ? resolvedAgendaState.initialDate ?? undefined
                  : undefined
              }
              surface="bookings"
            />
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    gap: Spacing.four,
  },
  heading: {
    maxWidth: 720,
    gap: Spacing.two,
  },
  loading: {
    minHeight: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
