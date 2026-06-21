import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  getPublicCoachProfile,
  type CoachProfile,
} from './coach-profile-service';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { Spacing } from '@/constants/theme';
import { useTranslation } from '@/i18n';

export function PublicCoachCard() {
  const { t } = useTranslation();
  const [profile, setProfile] = useState<CoachProfile | null>(null);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    let active = true;

    void getPublicCoachProfile().then((result) => {
      if (!active) return;

      if (!result.ok) {
        setLoadError(true);
        return;
      }

      setProfile(result.data);
      setLoadError(false);
    });

    return () => {
      active = false;
    };
  }, []);

  if (loadError) {
    return (
      <Feedback
        message={t('public.coachLoadErrorBody')}
        title={t('public.coachLoadErrorTitle')}
        tone="error"
      />
    );
  }

  return (
    <Card elevated style={styles.card}>
      <View style={styles.copy}>
        <ThemedText type="smallBold" themeColor="primary">
          {t('public.coachTitle')}
        </ThemedText>
        <ThemedText type="subtitle">
          {profile?.displayName ?? t('public.coachPendingName')}
        </ThemedText>
        <ThemedText type="small" themeColor="textMuted">
          {profile?.bio ?? t('public.coachBody')}
        </ThemedText>
      </View>
      {profile ? (
        <View style={styles.contact}>
          <ThemedText type="smallBold">{t('public.coachContactTitle')}</ThemedText>
          <ThemedText type="small" themeColor="textMuted">
            {profile.phone}
          </ThemedText>
          <ThemedText type="small" themeColor="textMuted">
            {profile.email}
          </ThemedText>
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 260,
    gap: Spacing.three,
  },
  copy: {
    gap: Spacing.two,
  },
  contact: {
    gap: Spacing.one,
  },
});
