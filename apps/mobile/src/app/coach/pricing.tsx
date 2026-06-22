import { zodResolver } from '@hookform/resolvers/zod';
import {
  pricingRateSchema,
  toPricingRateInput,
  type PricingApplicabilityContext,
  type PricingRateFormInput,
} from '@nextpoint/shared';
import { Controller, useForm } from 'react-hook-form';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { StatusBadge } from '@/components/ui/status-badge';
import { TextField } from '@/components/ui/text-field';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import {
  deletePricingRate,
  getCoachPricingRates,
  savePricingRate,
  type PricingRate,
} from '@/features/pricing/pricing-service';
import { PricingMultiSelector } from '@/features/pricing/pricing-multi-selector';
import { ProfileOptionSelector } from '@/features/profiles/profile-option-selector';
import {
  getAssociatedStudents,
  type AssociatedStudent,
} from '@/features/students/student-coach-service';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation, type TranslationKey } from '@/i18n';

const defaultValues: PricingRateFormInput = {
  label: '',
  amountEuros: '',
  durationMinutes: '60',
  lessonType: 'individual',
  isActive: true,
  applicabilityContexts: [],
  targetStudentIds: [],
};

export default function CoachPricingScreen() {
  const { user } = useAuth();
  const { locale, t } = useTranslation();
  const theme = useTheme();
  const [rates, setRates] = useState<PricingRate[]>([]);
  const [students, setStudents] = useState<AssociatedStudent[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [feedback, setFeedback] = useState<'none' | 'saved' | 'error'>('none');
  const {
    control,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<PricingRateFormInput>({
    resolver: zodResolver(pricingRateSchema),
    defaultValues,
  });

  const loadData = useCallback(async () => {
    if (!user) return;

    const [ratesResult, studentsResult] = await Promise.all([
      getCoachPricingRates(user.id),
      getAssociatedStudents(user.id),
    ]);

    if (!ratesResult.ok || !studentsResult.ok) {
      setLoadState('error');
      return;
    }

    setRates(ratesResult.data);
    setStudents(studentsResult.data);
    setLoadState('ready');
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let active = true;

    void Promise.all([
      getCoachPricingRates(user.id),
      getAssociatedStudents(user.id),
    ]).then(([ratesResult, studentsResult]) => {
      if (!active) return;

      if (!ratesResult.ok || !studentsResult.ok) {
        setLoadState('error');
        return;
      }

      setRates(ratesResult.data);
      setStudents(studentsResult.data);
      setLoadState('ready');
    });

    return () => {
      active = false;
    };
  }, [user]);

  const validationKeys: Record<string, TranslationKey> = {
    label_too_short: 'pricing.validation.labelTooShort',
    label_too_long: 'pricing.validation.labelTooLong',
    invalid_amount: 'pricing.validation.invalidAmount',
    invalid_student: 'pricing.validation.invalidStudent',
  };
  const translateError = (message: string | undefined) =>
    message ? t(validationKeys[message] ?? 'auth.validation.invalid') : undefined;

  const onSubmit = handleSubmit(async (form) => {
    setFeedback('none');
    const result = await savePricingRate(editingId, toPricingRateInput(form));

    if (!result.ok) {
      setFeedback('error');
      return;
    }

    setEditingId(null);
    reset(defaultValues);
    setFeedback('saved');
    await loadData();
  });

  const startEditing = (rate: PricingRate) => {
    setEditingId(rate.id);
    setFeedback('none');
    reset({
      label: rate.label,
      amountEuros: (rate.amountCents / 100).toFixed(2),
      durationMinutes: String(rate.durationMinutes) as '60' | '90',
      lessonType: rate.lessonType,
      isActive: rate.isActive,
      applicabilityContexts: rate.applicabilityContexts,
      targetStudentIds: rate.targetStudentIds,
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setFeedback('none');
    reset(defaultValues);
  };

  const confirmDelete = async (rate: PricingRate) => {
    const deleted = await deletePricingRate(rate.id);
    if (!deleted) {
      setFeedback('error');
      return;
    }

    setPendingDeleteId(null);
    if (editingId === rate.id) cancelEditing();
    await loadData();
  };

  const contextOptions: {
    value: PricingApplicabilityContext;
    label: string;
  }[] = [
    { value: 'student', label: t('pricing.context.student') },
    { value: 'senior', label: t('pricing.context.senior') },
    { value: 'weekend', label: t('pricing.context.weekend') },
    { value: 'public_holiday', label: t('pricing.context.public_holiday') },
  ];

  if (loadState === 'loading') {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator color={theme.primary} size="large" />
        <ThemedText type="small" themeColor="textMuted">
          {t('pricing.loading')}
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
            <ThemedText type="title">{t('pricing.manageTitle')}</ThemedText>
            <ThemedText type="default" themeColor="textMuted">
              {t('pricing.manageBody')}
            </ThemedText>
          </View>

          {loadState === 'error' ? (
            <Feedback
              message={t('pricing.loadErrorBody')}
              title={t('pricing.loadErrorTitle')}
              tone="error"
            />
          ) : null}

          <Card elevated style={styles.form}>
            <ThemedText type="subtitle">
              {t(editingId ? 'pricing.editTitle' : 'pricing.createTitle')}
            </ThemedText>
            <Controller
              control={control}
              name="label"
              render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
                <TextField
                  error={translateError(error?.message)}
                  label={t('pricing.labelLabel')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder={t('pricing.labelPlaceholder')}
                  value={value}
                />
              )}
            />
            <Controller
              control={control}
              name="amountEuros"
              render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
                <TextField
                  error={translateError(error?.message)}
                  inputMode="decimal"
                  keyboardType="decimal-pad"
                  label={t('pricing.amountLabel')}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  placeholder={t('pricing.amountPlaceholder')}
                  value={value}
                />
              )}
            />
            <Controller
              control={control}
              name="lessonType"
              render={({ field: { onChange, value } }) => (
                <ProfileOptionSelector
                  label={t('pricing.typeLabel')}
                  onChange={onChange}
                  options={[
                    { value: 'individual', label: t('pricing.type.individual') },
                    { value: 'group', label: t('pricing.type.group') },
                  ]}
                  value={value}
                />
              )}
            />
            <Controller
              control={control}
              name="durationMinutes"
              render={({ field: { onChange, value } }) => (
                <ProfileOptionSelector
                  label={t('pricing.durationLabel')}
                  onChange={onChange}
                  options={[
                    { value: '60', label: t('pricing.duration.60') },
                    { value: '90', label: t('pricing.duration.90') },
                  ]}
                  value={value}
                />
              )}
            />
            <Controller
              control={control}
              name="isActive"
              render={({ field: { onChange, value } }) => (
                <ProfileOptionSelector
                  label={t('pricing.statusLabel')}
                  onChange={(next) => onChange(next === 'active')}
                  options={[
                    { value: 'active', label: t('status.active') },
                    { value: 'inactive', label: t('status.inactive') },
                  ]}
                  value={value ? 'active' : 'inactive'}
                />
              )}
            />
            <Controller
              control={control}
              name="applicabilityContexts"
              render={({ field: { onChange, value } }) => (
                <PricingMultiSelector
                  label={t('pricing.contextLabel')}
                  onChange={onChange}
                  options={contextOptions}
                  values={value}
                />
              )}
            />
            {students.length > 0 ? (
              <Controller
                control={control}
                name="targetStudentIds"
                render={({ field: { onChange, value } }) => (
                  <PricingMultiSelector
                    label={t('pricing.studentsLabel')}
                    onChange={onChange}
                    options={students.map((student) => ({
                      value: student.userId,
                      label: student.fullName,
                    }))}
                    values={value}
                  />
                )}
              />
            ) : (
              <ThemedText type="small" themeColor="textMuted">
                {t('pricing.noStudentsBody')}
              </ThemedText>
            )}

            {feedback === 'saved' ? (
              <Feedback
                message={t('pricing.saveSuccessBody')}
                title={t('pricing.saveSuccessTitle')}
                tone="success"
              />
            ) : null}
            {feedback === 'error' ? (
              <Feedback
                message={t('pricing.saveErrorBody')}
                title={t('pricing.saveErrorTitle')}
                tone="error"
              />
            ) : null}

            <View style={styles.actions}>
              <Button
                disabled={isSubmitting || loadState === 'error'}
                label={
                  isSubmitting
                    ? t('pricing.saving')
                    : t(editingId ? 'pricing.updateAction' : 'pricing.createAction')
                }
                onPress={() => void onSubmit()}
              />
              {editingId ? (
                <Button
                  label={t('pricing.cancelAction')}
                  onPress={cancelEditing}
                  variant="secondary"
                />
              ) : null}
            </View>
          </Card>

          <View style={styles.catalog}>
            <ThemedText type="subtitle">{t('pricing.catalogTitle')}</ThemedText>
            {rates.length === 0 ? (
              <Feedback
                message={t('pricing.emptyCoachBody')}
                title={t('pricing.emptyCoachTitle')}
                tone="info"
              />
            ) : (
              <View style={styles.grid}>
                {rates.map((rate) => {
                  const price = new Intl.NumberFormat(locale, {
                    style: 'currency',
                    currency: rate.currency,
                  }).format(rate.amountCents / 100);
                  const contextLabels = rate.applicabilityContexts.map(
                    (context) =>
                      t(`pricing.context.${context}` as TranslationKey)
                  );

                  return (
                    <Card key={rate.id} style={styles.rateCard}>
                      <View style={styles.rateHeader}>
                        <View style={styles.rateCopy}>
                          <ThemedText type="smallBold">{rate.label}</ThemedText>
                          <ThemedText type="subtitle">{price}</ThemedText>
                        </View>
                        <StatusBadge status={rate.isActive ? 'active' : 'inactive'} />
                      </View>
                      <ThemedText type="small" themeColor="textMuted">
                        {t(`pricing.type.${rate.lessonType}` as TranslationKey)} ·{' '}
                        {t(
                          `pricing.duration.${rate.durationMinutes}` as TranslationKey
                        )}
                      </ThemedText>
                      <ThemedText type="small" themeColor="textMuted">
                        {contextLabels.length > 0
                          ? contextLabels.join(' · ')
                          : t('pricing.noContext')}
                      </ThemedText>
                      <View style={styles.actions}>
                        <Button
                          label={t('pricing.editAction')}
                          onPress={() => startEditing(rate)}
                          variant="secondary"
                        />
                        <Button
                          label={t('pricing.deleteAction')}
                          onPress={() => setPendingDeleteId(rate.id)}
                          variant="secondary"
                        />
                      </View>
                      {pendingDeleteId === rate.id ? (
                        <View style={styles.deleteConfirmation}>
                          <ThemedText type="small" themeColor="textMuted">
                            {t('pricing.deleteBody')}
                          </ThemedText>
                          <View style={styles.actions}>
                            <Button
                              label={t('pricing.confirmDeleteAction')}
                              onPress={() => void confirmDelete(rate)}
                            />
                            <Button
                              label={t('pricing.cancelAction')}
                              onPress={() => setPendingDeleteId(null)}
                              variant="secondary"
                            />
                          </View>
                        </View>
                      ) : null}
                    </Card>
                  );
                })}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
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
  form: {
    gap: Spacing.four,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  catalog: {
    gap: Spacing.three,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  rateCard: {
    minWidth: 280,
    flex: 1,
    gap: Spacing.two,
  },
  rateHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  rateCopy: {
    flex: 1,
    gap: Spacing.one,
  },
  deleteConfirmation: {
    gap: Spacing.two,
  },
});
