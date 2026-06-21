import { Redirect, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AnimatedIcon } from '@/components/animated-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { Feedback } from '@/components/ui/feedback';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { PublicCoachCard } from '@/features/coaches/public-coach-card';
import { PublishedPricingList } from '@/features/pricing/published-pricing-list';
import { useTranslation } from '@/i18n';

export default function PublicScreen() {
  const router = useRouter();
  const { role, status } = useAuth();
  const { t } = useTranslation();

  if (status === 'authenticated' && role) {
    return <Redirect href={role === 'coach' ? '/coach' : '/eleve'} />;
  }

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.hero}>
            <AnimatedIcon />
            <View style={styles.heroCopy}>
              <ThemedText type="smallBold" themeColor="primary">
                {t('public.eyebrow')}
              </ThemedText>
              <ThemedText type="title">{t('public.title')}</ThemedText>
              <ThemedText type="default" themeColor="textMuted">
                {t('public.subtitle')}
              </ThemedText>
            </View>
            <View style={styles.actions}>
              <Button
                label={t('public.signUpAction')}
                onPress={() => router.navigate('/sign-up')}
              />
              <Button
                label={t('public.signInAction')}
                onPress={() => router.navigate('/sign-in')}
                variant="secondary"
              />
            </View>
          </View>

          <View style={styles.publicGrid}>
            <PublicCoachCard />
            <PublishedPricingList />
          </View>

          <Feedback
            message={t('public.noAvailabilityBody')}
            title={t('public.noAvailabilityTitle')}
            tone="info"
          />
        </SafeAreaView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
  },
  safeArea: {
    width: '100%',
    maxWidth: MaxContentWidth,
    padding: Spacing.four,
    gap: Spacing.five,
  },
  hero: {
    minHeight: 420,
    justifyContent: 'center',
    gap: Spacing.four,
  },
  heroCopy: {
    maxWidth: 720,
    gap: Spacing.three,
  },
  actions: {
    maxWidth: 420,
    gap: Spacing.three,
  },
  publicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
});
