import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { planningControlIcons } from '@/features/scheduling/planning-control-icons';
import type { PlanningViewMode } from '@/features/scheduling/planning-window';
import { useTranslation, type TranslationKey } from '@/i18n';

export type PlanningDisplayMode = 'agenda' | 'list';

export function PlanningControls({
  displayMode,
  filters,
  mode,
  onDisplayModeChange,
  onModeChange,
  onMove,
  onToday,
}: {
  displayMode: PlanningDisplayMode;
  filters?: ReactNode;
  mode: PlanningViewMode;
  onDisplayModeChange: (mode: PlanningDisplayMode) => void;
  onModeChange: (mode: PlanningViewMode) => void;
  onMove: (direction: -1 | 1) => void;
  onToday: () => void;
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.toolbar}>
      <View style={styles.segmented}>
        {(['agenda', 'list'] as const).map((candidate) => (
          <Button
            key={candidate}
            icon={planningControlIcons[candidate]}
            label={t(`planning.display.${candidate}` as TranslationKey)}
            onPress={() => onDisplayModeChange(candidate)}
            style={styles.toolbarButton}
            variant={displayMode === candidate ? 'primary' : 'secondary'}
          />
        ))}
      </View>
      <View style={styles.segmented}>
        {(['week', 'day'] as const).map((candidate) => (
          <Button
            key={candidate}
            label={t(`planning.mode.${candidate}` as TranslationKey)}
            onPress={() => onModeChange(candidate)}
            style={styles.toolbarButton}
            variant={mode === candidate ? 'primary' : 'secondary'}
          />
        ))}
      </View>
      {filters}
      <View style={styles.periodActions}>
        <Button
          icon={planningControlIcons.previous}
          label={t('planning.previousAction')}
          onPress={() => onMove(-1)}
          style={[styles.toolbarButton, styles.periodButton]}
          variant="secondary"
        />
        <Button
          label={t('planning.todayAction')}
          onPress={onToday}
          style={[styles.toolbarButton, styles.periodButton]}
          variant="secondary"
        />
        <Button
          icon={planningControlIcons.next}
          iconPosition="right"
          label={t('planning.nextAction')}
          onPress={() => onMove(1)}
          style={[styles.toolbarButton, styles.periodButton]}
          variant="secondary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    gap: Spacing.three,
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
  },
  periodButton: {
    paddingHorizontal: Spacing.one,
  },
});
