import { lessonPackSchema } from '@nextpoint/shared';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { StatusBadge } from '@/components/ui/status-badge';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import {
  assignLessonPack,
  getStudentLessonPacks,
  type LessonPack,
} from '@/features/lesson-packs/lesson-pack-service';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n';

export function StudentLessonPackCard({
  studentId,
}: {
  studentId: string;
}) {
  const theme = useTheme();
  const { locale, t } = useTranslation();
  const [packs, setPacks] = useState<LessonPack[]>([]);
  const [includedSessions, setIncludedSessions] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [saveState, setSaveState] = useState<
    'idle' | 'saving' | 'saved' | 'duplicate' | 'error'
  >('idle');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getStudentLessonPacks(studentId).then((result) => {
      if (!active) return;
      if (!result.ok) {
        setLoadState('error');
        return;
      }
      setPacks(result.data);
      setLoadState('ready');
    });

    return () => {
      active = false;
    };
  }, [studentId]);

  const activePack = packs.find((pack) => pack.status === 'active');

  const assignPack = async () => {
    const parsed = lessonPackSchema.safeParse({ includedSessions });
    if (!parsed.success) {
      setValidationError(t('lessonPack.validationInvalidCount'));
      return;
    }

    setValidationError(null);
    setSaveState('saving');
    const result = await assignLessonPack(studentId, parsed.data);
    if (!result.ok) {
      setSaveState(
        result.code === 'active_pack_exists' ? 'duplicate' : 'error'
      );
      return;
    }

    setPacks((current) => [result.data, ...current]);
    setIncludedSessions('');
    setIsFormOpen(false);
    setSaveState('saved');
  };

  if (loadState === 'loading') {
    return (
      <Card elevated style={styles.card}>
        <View style={styles.loading}>
          <ActivityIndicator color={theme.primary} />
          <ThemedText type="small" themeColor="textMuted">
            {t('lessonPack.loading')}
          </ThemedText>
        </View>
      </Card>
    );
  }

  if (loadState === 'error') {
    return (
      <Feedback
        message={t('lessonPack.loadErrorBody')}
        title={t('lessonPack.loadErrorTitle')}
        tone="error"
      />
    );
  }

  return (
    <Card elevated style={styles.card}>
      <View style={styles.heading}>
        <View style={styles.headingCopy}>
          <ThemedText type="subtitle">{t('lessonPack.title')}</ThemedText>
          <ThemedText type="small" themeColor="textMuted">
            {t('lessonPack.trackingOnlyHint')}
          </ThemedText>
        </View>
        {!activePack && !isFormOpen ? (
          <Button
            label={t('lessonPack.assignAction')}
            onPress={() => {
              setSaveState('idle');
              setIsFormOpen(true);
            }}
          />
        ) : null}
      </View>

      {isFormOpen ? (
        <View style={styles.form}>
          <TextField
            error={validationError ?? undefined}
            inputMode="numeric"
            keyboardType="number-pad"
            label={t('lessonPack.includedLabel')}
            onChangeText={setIncludedSessions}
            placeholder={t('lessonPack.includedPlaceholder')}
            value={includedSessions}
          />
          <View style={styles.actions}>
            <Button
              disabled={saveState === 'saving'}
              label={
                saveState === 'saving'
                  ? t('lessonPack.assigning')
                  : t('lessonPack.confirmAssignAction')
              }
              onPress={() => void assignPack()}
            />
            <Button
              disabled={saveState === 'saving'}
              label={t('lessonPack.cancelAction')}
              onPress={() => {
                setIncludedSessions('');
                setValidationError(null);
                setIsFormOpen(false);
              }}
              variant="secondary"
            />
          </View>
        </View>
      ) : null}

      {saveState === 'saved' ? (
        <Feedback
          message={t('lessonPack.saveSuccessBody')}
          title={t('lessonPack.saveSuccessTitle')}
          tone="success"
        />
      ) : null}
      {saveState === 'duplicate' ? (
        <Feedback
          message={t('lessonPack.activeExistsBody')}
          title={t('lessonPack.activeExistsTitle')}
          tone="warning"
        />
      ) : null}
      {saveState === 'error' ? (
        <Feedback
          message={t('lessonPack.saveErrorBody')}
          title={t('lessonPack.saveErrorTitle')}
          tone="error"
        />
      ) : null}

      {packs.length === 0 ? (
        <ThemedText type="default" themeColor="textMuted">
          {t('lessonPack.emptyBody')}
        </ThemedText>
      ) : (
        <View style={styles.packList}>
          {packs.map((pack) => (
            <View key={pack.id} style={styles.pack}>
              <View style={styles.packHeading}>
                <View style={styles.packTitle}>
                  <ThemedText type="smallBold">
                    {t('lessonPack.individualTitle')}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textMuted">
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: 'medium',
                    }).format(new Date(pack.createdAt))}
                  </ThemedText>
                </View>
                <StatusBadge status={pack.status} />
              </View>
              <View style={styles.metrics}>
                <View style={styles.metric}>
                  <ThemedText type="subtitle">
                    {pack.includedSessions}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textMuted">
                    {t('lessonPack.includedMetric')}
                  </ThemedText>
                </View>
                <View style={styles.metric}>
                  <ThemedText type="subtitle">
                    {pack.usedSessions}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textMuted">
                    {t('lessonPack.usedMetric')}
                  </ThemedText>
                </View>
                <View style={styles.metric}>
                  <ThemedText type="subtitle">
                    {pack.remainingSessions}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textMuted">
                    {t('lessonPack.remainingMetric')}
                  </ThemedText>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  heading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: Spacing.three,
  },
  headingCopy: {
    flex: 1,
    minWidth: 220,
    gap: Spacing.one,
  },
  form: {
    gap: Spacing.three,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  packList: {
    gap: Spacing.three,
  },
  pack: {
    gap: Spacing.three,
  },
  packHeading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  packTitle: {
    flex: 1,
    minWidth: 180,
    gap: Spacing.one,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  metric: {
    minWidth: 120,
    flex: 1,
    gap: Spacing.one,
  },
});
