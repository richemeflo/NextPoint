import {
  lessonPackSchema,
  schedulingTimeZone,
  type LessonPackAdjustment,
} from '@nextpoint/shared';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { StatusBadge } from '@/components/ui/status-badge';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import {
  adjustLessonPackSessions,
  assignLessonPack,
  consumeLessonPackSession,
  type LessonPack,
} from '@/features/lesson-packs/lesson-pack-service';
import {
  getLessonPackAdjustmentDisabledReason,
  getLessonPackConsumptionDisabledReason,
} from '@/features/lesson-packs/lesson-pack-state';
import { useStudentLessonPacks } from '@/features/lesson-packs/use-student-lesson-packs';
import {
  acquireMutationLock,
  releaseMutationLock,
} from '@/features/mutations/mutation-lock';
import {
  getCoachPricingRates,
  type PricingRate,
} from '@/features/pricing/pricing-service';
import { ProfileOptionSelector } from '@/features/profiles/profile-option-selector';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation, type TranslationKey } from '@/i18n';

export function StudentLessonPackCard({ studentId }: { studentId: string }) {
  return <StudentLessonPackCardContent key={studentId} studentId={studentId} />;
}

function StudentLessonPackCardContent({ studentId }: { studentId: string }) {
  const theme = useTheme();
  const { user } = useAuth();
  const { locale, t } = useTranslation();
  const { width } = useWindowDimensions();
  const {
    loadMore,
    loadMoreState,
    loadState,
    packs,
    prependPack,
    replacePack,
  } = useStudentLessonPacks(studentId);
  const packWidth = Math.max(240, Math.min(width - 96, 640));
  const [includedSessions, setIncludedSessions] = useState('');
  const [selectedRateId, setSelectedRateId] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pricingRates, setPricingRates] = useState<PricingRate[]>([]);
  const [pricingLoadState, setPricingLoadState] = useState<
    'loading' | 'ready' | 'error'
  >('loading');
  const [saveState, setSaveState] = useState<
    'idle' | 'saving' | 'saved' | 'duplicate' | 'error'
  >('idle');
  const [adjustmentState, setAdjustmentState] = useState<
    | 'idle'
    | 'adjusting'
    | 'increased'
    | 'decreased'
    | 'noRemaining'
    | 'minimum'
    | 'maximum'
    | 'error'
  >('idle');
  const [consumptionState, setConsumptionState] = useState<
    'idle' | 'consuming' | 'consumed' | 'noRemaining' | 'error'
  >('idle');
  const [validationError, setValidationError] = useState<string | null>(null);
  const mutationLock = useRef(false);

  const packPricingRates = useMemo(
    () =>
      pricingRates.filter(
        (rate) =>
          rate.isActive &&
          (rate.targetStudentIds.length === 0 ||
            rate.targetStudentIds.includes(studentId)),
      ),
    [pricingRates, studentId],
  );
  const selectedRate =
    packPricingRates.find((rate) => rate.id === selectedRateId) ??
    packPricingRates[0] ??
    null;
  const rateLabel = (
    rate: Pick<PricingRate, 'label' | 'lessonType' | 'durationMinutes'>,
  ) =>
    `${rate.label} · ${t(`pricing.type.${rate.lessonType}` as TranslationKey)} · ${t(
      `pricing.duration.${rate.durationMinutes}` as TranslationKey,
    )}`;

  useEffect(() => {
    if (!user?.id) return undefined;

    let active = true;
    void getCoachPricingRates(user.id)
      .then((result) => {
        if (!active) return;
        if (!result.ok) {
          setPricingLoadState('error');
          return;
        }
        setPricingRates(result.data);
        setPricingLoadState('ready');
      })
      .catch(() => {
        if (active) setPricingLoadState('error');
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  const assignPack = async () => {
    const parsed = lessonPackSchema.safeParse({
      includedSessions,
      pricingRateId: selectedRate?.id,
      lessonType: selectedRate?.lessonType,
      durationMinutes: String(selectedRate?.durationMinutes),
    });
    if (!parsed.success) {
      setValidationError(t('lessonPack.validationInvalidCount'));
      return;
    }

    if (!acquireMutationLock(mutationLock)) return;

    setValidationError(null);
    setSaveState('saving');
    try {
      const result = await assignLessonPack(studentId, parsed.data);
      if (!result.ok) {
        setSaveState(
          result.code === 'active_pack_exists' ? 'duplicate' : 'error',
        );
        return;
      }

      prependPack(result.data);
      setIncludedSessions('');
      setSelectedRateId('');
      setIsFormOpen(false);
      setSaveState('saved');
    } catch {
      setSaveState('error');
    } finally {
      releaseMutationLock(mutationLock);
    }
  };

  const adjustPack = async (
    pack: LessonPack,
    adjustment: LessonPackAdjustment,
  ) => {
    if (!acquireMutationLock(mutationLock)) return;

    const disabledReason = getLessonPackAdjustmentDisabledReason(
      pack,
      adjustment,
    );
    if (disabledReason === 'no_remaining_session') {
      setAdjustmentState('noRemaining');
      releaseMutationLock(mutationLock);
      return;
    }
    if (disabledReason === 'maximum_included_sessions') {
      setAdjustmentState('maximum');
      releaseMutationLock(mutationLock);
      return;
    }
    if (disabledReason === 'minimum_included_sessions') {
      setAdjustmentState('minimum');
      releaseMutationLock(mutationLock);
      return;
    }

    setConsumptionState('idle');
    setAdjustmentState('adjusting');
    try {
      const result = await adjustLessonPackSessions(pack.id, adjustment);
      if (!result.ok) {
        setAdjustmentState('error');
        return;
      }

      replacePack(result.data);
      setAdjustmentState(adjustment === 1 ? 'increased' : 'decreased');
    } catch {
      setAdjustmentState('error');
    } finally {
      releaseMutationLock(mutationLock);
    }
  };

  const consumePack = async (pack: LessonPack) => {
    if (!acquireMutationLock(mutationLock)) return;

    if (getLessonPackConsumptionDisabledReason(pack) !== null) {
      setConsumptionState('noRemaining');
      releaseMutationLock(mutationLock);
      return;
    }

    setAdjustmentState('idle');
    setConsumptionState('consuming');
    try {
      const result = await consumeLessonPackSession(pack.id);
      if (!result.ok) {
        setConsumptionState('error');
        return;
      }

      replacePack(result.data);
      setConsumptionState('consumed');
    } catch {
      setConsumptionState('error');
    } finally {
      releaseMutationLock(mutationLock);
    }
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
        {!isFormOpen ? (
          <Button
            label={t('lessonPack.assignAction')}
            onPress={() => {
              setSaveState('idle');
              setAdjustmentState('idle');
              setConsumptionState('idle');
              setIsFormOpen(true);
            }}
          />
        ) : null}
      </View>

      {isFormOpen ? (
        <View style={styles.form}>
          {pricingLoadState === 'error' ? (
            <Feedback
              message={t('lessonPack.pricingLoadErrorBody')}
              title={t('lessonPack.pricingLoadErrorTitle')}
              tone="error"
            />
          ) : null}
          {pricingLoadState === 'ready' && packPricingRates.length === 0 ? (
            <Feedback
              message={t('lessonPack.noApplicablePricingBody')}
              title={t('lessonPack.noApplicablePricingTitle')}
              tone="warning"
            />
          ) : null}
          {packPricingRates.length > 0 ? (
            <ProfileOptionSelector<string>
              label={t('lessonPack.pricingRateLabel')}
              onChange={setSelectedRateId}
              options={packPricingRates.map((rate) => ({
                value: rate.id,
                label: rateLabel(rate),
              }))}
              value={selectedRate?.id ?? ''}
            />
          ) : null}
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
              disabled={
                saveState === 'saving' ||
                pricingLoadState !== 'ready' ||
                !selectedRate
              }
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
                setSelectedRateId('');
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
      {adjustmentState === 'decreased' ? (
        <Feedback
          message={t('lessonPack.decreaseSuccessBody')}
          title={t('lessonPack.decreaseSuccessTitle')}
          tone="success"
        />
      ) : null}
      {adjustmentState === 'increased' ? (
        <Feedback
          message={t('lessonPack.increaseSuccessBody')}
          title={t('lessonPack.increaseSuccessTitle')}
          tone="success"
        />
      ) : null}
      {adjustmentState === 'noRemaining' ? (
        <Feedback
          message={t('lessonPack.noRemainingBody')}
          title={t('lessonPack.noRemainingTitle')}
          tone="warning"
        />
      ) : null}
      {adjustmentState === 'maximum' ? (
        <Feedback
          message={t('lessonPack.maximumBody')}
          title={t('lessonPack.maximumTitle')}
          tone="warning"
        />
      ) : null}
      {adjustmentState === 'minimum' ? (
        <Feedback
          message={t('lessonPack.minimumBody')}
          title={t('lessonPack.minimumTitle')}
          tone="warning"
        />
      ) : null}
      {adjustmentState === 'error' ? (
        <Feedback
          message={t('lessonPack.adjustErrorBody')}
          title={t('lessonPack.adjustErrorTitle')}
          tone="error"
        />
      ) : null}
      {consumptionState === 'consumed' ? (
        <Feedback
          message={t('lessonPack.consumeSuccessBody')}
          title={t('lessonPack.consumeSuccessTitle')}
          tone="success"
        />
      ) : null}
      {consumptionState === 'noRemaining' ? (
        <Feedback
          message={t('lessonPack.noRemainingBody')}
          title={t('lessonPack.noRemainingTitle')}
          tone="warning"
        />
      ) : null}
      {consumptionState === 'error' ? (
        <Feedback
          message={t('lessonPack.consumeErrorBody')}
          title={t('lessonPack.consumeErrorTitle')}
          tone="error"
        />
      ) : null}

      {packs.length === 0 ? (
        <ThemedText type="default" themeColor="textMuted">
          {t('lessonPack.emptyBody')}
        </ThemedText>
      ) : (
        <FlatList
          contentContainerStyle={styles.packListContent}
          data={packs}
          horizontal
          ItemSeparatorComponent={() => <View style={styles.packSeparator} />}
          keyExtractor={(pack) => pack.id}
          ListFooterComponent={
            loadMoreState === 'idle' ? null : (
              <View style={styles.loadMore}>
                {loadMoreState === 'loading' ? (
                  <ActivityIndicator color={theme.primary} />
                ) : (
                  <Button
                    label={t('lessonPack.loadMoreAction')}
                    onPress={() => void loadMore()}
                    variant="secondary"
                  />
                )}
              </View>
            )
          }
          onEndReached={() => void loadMore()}
          onEndReachedThreshold={0.4}
          renderItem={({ item: pack }) => (
            <Card style={[styles.pack, { width: packWidth }]}>
              <View style={styles.packHeading}>
                <View style={styles.packTitle}>
                  <ThemedText type="smallBold">
                    {t('lessonPack.packTitle', {
                      type: t(`pricing.type.${pack.lessonType}` as TranslationKey),
                      duration: t(
                        `pricing.duration.${pack.durationMinutes}` as TranslationKey,
                      ),
                    })}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textMuted">
                    {new Intl.DateTimeFormat(locale, {
                      dateStyle: 'medium',
                      timeZone: schedulingTimeZone,
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
                  <ThemedText type="subtitle">{pack.usedSessions}</ThemedText>
                  <ThemedText type="small" themeColor="textMuted">
                    {t('lessonPack.usedMetric')}
                  </ThemedText>
                </View>
                {pack.status === 'active' ? (
                  <View style={[styles.metric, styles.counterMetric]}>
                    <ThemedText type="small" themeColor="textMuted">
                      {t('lessonPack.remainingMetric')}
                    </ThemedText>
                    <View style={styles.counterControls}>
                      <Button
                        accessibilityLabel={t(
                          'lessonPack.decrementAccessibilityLabel',
                        )}
                        disabled={
                          adjustmentState === 'adjusting' ||
                          consumptionState === 'consuming' ||
                          getLessonPackAdjustmentDisabledReason(pack, -1) !==
                            null
                        }
                        label="−"
                        onPress={() => void adjustPack(pack, -1)}
                        style={styles.counterButton}
                        variant="secondary"
                      />
                      {adjustmentState === 'adjusting' ? (
                        <ActivityIndicator
                          accessibilityLabel={t('lessonPack.adjusting')}
                          color={theme.primary}
                          size="small"
                          style={styles.counterProgress}
                        />
                      ) : (
                        <ThemedText
                          accessibilityLiveRegion="polite"
                          style={styles.counterValue}
                          type="subtitle"
                        >
                          {pack.remainingSessions}
                        </ThemedText>
                      )}
                      <Button
                        accessibilityLabel={t(
                          'lessonPack.incrementAccessibilityLabel',
                        )}
                        disabled={
                          adjustmentState === 'adjusting' ||
                          consumptionState === 'consuming' ||
                          getLessonPackAdjustmentDisabledReason(pack, 1) !==
                            null
                        }
                        label="+"
                        onPress={() => void adjustPack(pack, 1)}
                        style={styles.counterButton}
                      />
                    </View>
                  </View>
                ) : (
                  <View style={styles.metric}>
                    <ThemedText type="subtitle">
                      {pack.remainingSessions}
                    </ThemedText>
                    <ThemedText type="small" themeColor="textMuted">
                      {t('lessonPack.remainingMetric')}
                    </ThemedText>
                  </View>
                )}
              </View>
              {pack.status === 'active' ? (
                <Button
                  disabled={
                    adjustmentState === 'adjusting' ||
                    consumptionState === 'consuming' ||
                    getLessonPackConsumptionDisabledReason(pack) !== null
                  }
                  label={
                    consumptionState === 'consuming'
                      ? t('lessonPack.consuming')
                      : t('lessonPack.consumeAction')
                  }
                  onPress={() => void consumePack(pack)}
                  variant="secondary"
                />
              ) : null}
            </Card>
          )}
          showsHorizontalScrollIndicator
          style={styles.packList}
          windowSize={5}
        />
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
    width: '100%',
  },
  packListContent: {
    paddingRight: Spacing.one,
  },
  packSeparator: {
    width: Spacing.three,
  },
  pack: {
    gap: Spacing.three,
  },
  loadMore: {
    minWidth: 160,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
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
  counterMetric: {
    minWidth: 180,
  },
  counterControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  counterButton: {
    minWidth: 44,
    paddingHorizontal: Spacing.two,
  },
  counterValue: {
    minWidth: 32,
    textAlign: 'center',
  },
  counterProgress: {
    minWidth: 32,
  },
});
