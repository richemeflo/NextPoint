import type { AppRole } from '@nextpoint/shared';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { ProfileOptionSelector } from '@/features/profiles/profile-option-selector';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n';

import {
  defaultEmailNotificationPreferences,
  isValidReminderTime,
  type EmailNotificationPreferences,
} from './email-notification-preferences';
import {
  getEmailNotificationPreferences,
  saveCoachEmailNotificationPreferences,
  saveStudentEmailNotificationPreferences,
} from './email-notification-preferences-service';

type IsoWeekday = '1' | '2' | '3' | '4' | '5' | '6' | '7';

function PreferenceToggle({
  disabled,
  label,
  description,
  value,
  onValueChange,
}: {
  disabled: boolean;
  label: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const theme = useTheme();

  return (
    <View style={styles.preferenceRow}>
      <View style={styles.preferenceText}>
        <ThemedText type="smallBold">{label}</ThemedText>
        <ThemedText type="small" themeColor="textMuted">
          {description}
        </ThemedText>
      </View>
      <Switch
        accessibilityLabel={label}
        accessibilityState={{ checked: value, disabled }}
        disabled={disabled}
        onValueChange={onValueChange}
        trackColor={{ false: theme.border, true: theme.success }}
        value={value}
      />
    </View>
  );
}

export function EmailNotificationPreferencesCard({ role }: { role: AppRole }) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();
  const [preferences, setPreferences] = useState<EmailNotificationPreferences>(
    defaultEmailNotificationPreferences
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<'idle' | 'success' | 'error'>('idle');
  const validTime = isValidReminderTime(preferences.coachWeeklyReminderTime);
  const weekdayOptions: { value: IsoWeekday; label: string }[] = [
    { value: '1', label: t('emailPreferences.weekday.monday') },
    { value: '2', label: t('emailPreferences.weekday.tuesday') },
    { value: '3', label: t('emailPreferences.weekday.wednesday') },
    { value: '4', label: t('emailPreferences.weekday.thursday') },
    { value: '5', label: t('emailPreferences.weekday.friday') },
    { value: '6', label: t('emailPreferences.weekday.saturday') },
    { value: '7', label: t('emailPreferences.weekday.sunday') },
  ];

  useEffect(() => {
    if (!user) return;
    let active = true;

    void getEmailNotificationPreferences(user.id)
      .then((result) => {
        if (!active) return;
        if (!result.ok) {
          setState('error');
          return;
        }
        setPreferences(result.data);
      })
      .catch(() => {
        if (active) setState('error');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [user]);

  const updatePreference = <Key extends keyof EmailNotificationPreferences>(
    key: Key,
    value: EmailNotificationPreferences[Key]
  ) => {
    setState('idle');
    setPreferences((current) => ({ ...current, [key]: value }));
  };

  const save = async () => {
    if (role === 'coach' && !validTime) {
      setState('error');
      return;
    }

    setSaving(true);
    setState('idle');
    const result =
      role === 'eleve'
        ? await saveStudentEmailNotificationPreferences(preferences)
        : await saveCoachEmailNotificationPreferences(preferences);
    setSaving(false);

    if (!result.ok) {
      setState('error');
      return;
    }
    setPreferences(result.data);
    setState('success');
  };

  return (
    <Card style={styles.card}>
      <View style={styles.heading}>
        <ThemedText type="subtitle">{t('emailPreferences.title')}</ThemedText>
        <ThemedText type="small" themeColor="textMuted">
          {t('emailPreferences.body')}
        </ThemedText>
      </View>

      {loading ? (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={theme.primary} />
          <ThemedText type="small" themeColor="textMuted">
            {t('emailPreferences.loading')}
          </ThemedText>
        </View>
      ) : (
        <>
          {role === 'eleve' ? (
            <>
              <PreferenceToggle
                description={t('emailPreferences.studentConfirmedBody')}
                disabled={saving}
                label={t('emailPreferences.studentConfirmedTitle')}
                onValueChange={(value) =>
                  updatePreference('studentBookingConfirmed', value)
                }
                value={preferences.studentBookingConfirmed}
              />
              <PreferenceToggle
                description={t('emailPreferences.studentCancelledBody')}
                disabled={saving}
                label={t('emailPreferences.studentCancelledTitle')}
                onValueChange={(value) =>
                  updatePreference('studentBookingCancelled', value)
                }
                value={preferences.studentBookingCancelled}
              />
            </>
          ) : (
            <>
              <PreferenceToggle
                description={t('emailPreferences.coachCancellationBody')}
                disabled={saving}
                label={t('emailPreferences.coachCancellationTitle')}
                onValueChange={(value) =>
                  updatePreference('coachStudentCancellation', value)
                }
                value={preferences.coachStudentCancellation}
              />
              <View style={[styles.separator, { backgroundColor: theme.border }]} />
              <PreferenceToggle
                description={t('emailPreferences.weeklyReminderBody')}
                disabled={saving}
                label={t('emailPreferences.weeklyReminderTitle')}
                onValueChange={(value) =>
                  updatePreference('coachWeeklyReminderEnabled', value)
                }
                value={preferences.coachWeeklyReminderEnabled}
              />
              {preferences.coachWeeklyReminderEnabled ? (
                <View style={styles.scheduleFields}>
                  <ProfileOptionSelector
                    label={t('emailPreferences.weekdayLabel')}
                    onChange={(value) =>
                      updatePreference(
                        'coachWeeklyReminderIsoWeekday',
                        Number(value)
                      )
                    }
                    options={weekdayOptions}
                    value={String(
                      preferences.coachWeeklyReminderIsoWeekday
                    ) as IsoWeekday}
                  />
                  <TextField
                    autoCapitalize="none"
                    error={
                      validTime ? undefined : t('emailPreferences.invalidTime')
                    }
                    inputMode="numeric"
                    label={t('emailPreferences.timeLabel')}
                    maxLength={5}
                    onChangeText={(value) =>
                      updatePreference('coachWeeklyReminderTime', value)
                    }
                    placeholder="18:00"
                    value={preferences.coachWeeklyReminderTime}
                  />
                  <ThemedText type="small" themeColor="textMuted">
                    {t('emailPreferences.timezoneHint')}
                  </ThemedText>
                </View>
              ) : null}
            </>
          )}

          {state === 'success' ? (
            <Feedback
              message={t('emailPreferences.saveSuccessBody')}
              title={t('emailPreferences.saveSuccessTitle')}
              tone="success"
            />
          ) : null}
          {state === 'error' ? (
            <Feedback
              message={t('emailPreferences.saveErrorBody')}
              title={t('emailPreferences.saveErrorTitle')}
              tone="error"
            />
          ) : null}
          <Button
            disabled={saving || (role === 'coach' && !validTime)}
            label={saving ? t('profile.saving') : t('emailPreferences.saveAction')}
            onPress={() => void save()}
          />
        </>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.four,
  },
  heading: {
    gap: Spacing.one,
  },
  preferenceRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  preferenceText: {
    minWidth: 0,
    flex: 1,
    gap: Spacing.one,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
  },
  scheduleFields: {
    gap: Spacing.three,
  },
});
