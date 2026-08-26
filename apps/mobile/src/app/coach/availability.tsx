import { ActivityIndicator, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Feedback } from '@/components/ui/feedback';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { AvailabilityAgenda } from '@/features/scheduling/availability-agenda';
import { AvailabilityCreateCard } from '@/features/scheduling/availability-create-card';
import { AvailabilitySlotEditorModal } from '@/features/scheduling/availability-slot-editor-modal';
import { useAvailabilityManagement } from '@/features/scheduling/use-availability-management';
import { useCoachAvailabilityData } from '@/features/scheduling/use-coach-availability-data';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n';

export default function CoachAvailabilityScreen() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();
  const { loadState, ranges, refresh, slots } = useCoachAvailabilityData(
    user?.id
  );
  const {
    cancelEditing,
    cancelMutationScope,
    confirmMutationScope,
    createRange,
    editingSlotId,
    feedback,
    mutationPending,
    requestMutationScope,
    scopeSelectionAction,
    selectedRange,
    selectedSlot,
    startEditing,
  } = useAvailabilityManagement({ ranges, refresh, slots });

  if (loadState === 'loading') {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={theme.primary} size="large" />
        <ThemedText type="small" themeColor="textMuted">
          {t('availability.loading')}
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.content}>
          <View style={styles.heading}>
            <ThemedText type="smallBold" themeColor="primary">
              {t('role.coachLabel')}
            </ThemedText>
            <ThemedText type="title">{t('availability.manageTitle')}</ThemedText>
            <ThemedText themeColor="textMuted">
              {t('availability.manageBody')}
            </ThemedText>
          </View>

          {loadState === 'error' ? (
            <Feedback
              message={t('availability.loadErrorBody')}
              title={t('availability.loadErrorTitle')}
              tone="error"
            />
          ) : null}

          <AvailabilityCreateCard
            feedback={feedback}
            loadError={loadState === 'error'}
            mutationPending={mutationPending}
            onCreate={createRange}
          />

          <AvailabilityAgenda
            editingSlotId={editingSlotId}
            onCancelEditing={cancelEditing}
            onEdit={startEditing}
            slots={slots}
          />
        </View>
      </ScrollView>

      <AvailabilitySlotEditorModal
        feedback={feedback}
        onClose={cancelEditing}
        onDelete={(slot) => requestMutationScope(slot, 'delete')}
        onScopeCancel={cancelMutationScope}
        onScopeSelect={confirmMutationScope}
        onSave={(slot, values) =>
          requestMutationScope(slot, 'save', values)
        }
        pending={mutationPending}
        range={selectedRange}
        scopeSelectionAction={scopeSelectionAction}
        slot={selectedSlot}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.three,
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
});
