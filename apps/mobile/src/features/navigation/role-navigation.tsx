import type { AppRole } from '@nextpoint/shared';
import { Link, Slot, usePathname, type Href } from 'expo-router';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation, type TranslationKey } from '@/i18n';

type NavigationItem = {
  href: Href;
  labelKey: TranslationKey;
};

const coachItems: NavigationItem[] = [
  { href: '/coach', labelKey: 'nav.coach.planning' },
  { href: '/coach/availability', labelKey: 'nav.coach.availability' },
  { href: '/coach/pricing' as Href, labelKey: 'nav.coach.pricing' },
  { href: '/coach/students', labelKey: 'nav.coach.students' },
  { href: '/coach/stats', labelKey: 'nav.coach.stats' },
  { href: '/coach/notifications', labelKey: 'nav.coach.notifications' },
  { href: '/coach/messaging', labelKey: 'nav.coach.messaging' },
  { href: '/coach/profile', labelKey: 'nav.coach.profile' },
];

const eleveItems: NavigationItem[] = [
  { href: '/eleve', labelKey: 'nav.eleve.home' },
  { href: '/eleve/planning', labelKey: 'nav.eleve.planning' },
  { href: '/eleve/notifications', labelKey: 'nav.eleve.notifications' },
  { href: '/eleve/account', labelKey: 'nav.eleve.account' },
];

export function RoleNavigation({ role }: { role: AppRole }) {
  const pathname = usePathname();
  const { signOut, user } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const items = role === 'coach' ? coachItems : eleveItems;
  const isMobile = width < 768;
  const navigation = (
    <ScrollView
      contentContainerStyle={[
        styles.navigationContent,
        isMobile ? styles.navigationContentMobile : null,
      ]}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[
        isMobile ? styles.navigationMobile : styles.navigationDesktop,
        { borderColor: theme.border },
      ]}>
      {items.map((item) => {
        const href = typeof item.href === 'string' ? item.href : item.href.pathname;
        const selected =
          pathname === href || (href !== `/${role}` && pathname.startsWith(`${href}/`));

        return (
          <Link asChild href={item.href} key={String(href)}>
            <Pressable
              style={StyleSheet.flatten([
                styles.navigationItem,
                isMobile ? styles.navigationItemMobile : null,
                {
                  backgroundColor: selected
                    ? theme.backgroundSelected
                    : theme.surface,
                },
              ])}>
              <ThemedText
                numberOfLines={1}
                type="smallBold"
                themeColor={selected ? 'primary' : 'textMuted'}>
                {t(item.labelKey)}
              </ThemedText>
            </Pressable>
          </Link>
        );
      })}
    </ScrollView>
  );

  return (
    <ThemedView style={styles.shell}>
      <SafeAreaView edges={['top']} style={styles.safeHeader}>
        <View style={styles.header}>
          <View style={styles.identity}>
            <ThemedText type="smallBold" themeColor="primary">
              {t('common.nextpoint')}
            </ThemedText>
            <ThemedText type="small" themeColor="textMuted">
              {t(role === 'coach' ? 'role.coachSubtitle' : 'role.eleveSubtitle')}
            </ThemedText>
          </View>
          <View style={styles.account}>
            <ThemedText numberOfLines={1} type="small" themeColor="textMuted">
              {user?.email ?? ''}
            </ThemedText>
            <Button
              label={t('auth.signOutAction')}
              onPress={() => void signOut()}
              variant="secondary"
            />
          </View>
        </View>
        {isMobile ? null : navigation}
      </SafeAreaView>
      <View style={styles.content}>
        <Slot />
      </View>
      {isMobile ? (
        <SafeAreaView
          edges={['bottom']}
          style={[
            styles.safeBottomNavigation,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}>
          {navigation}
        </SafeAreaView>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  shell: {
    flex: 1,
  },
  safeHeader: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  identity: {
    flex: 1,
    gap: Spacing.half,
  },
  account: {
    maxWidth: 320,
    alignItems: 'flex-end',
    gap: Spacing.one,
  },
  navigationDesktop: {
    borderBottomWidth: 1,
  },
  navigationMobile: {
    borderTopWidth: 1,
    width: '100%',
  },
  navigationContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.two,
  },
  navigationContentMobile: {
    minWidth: '100%',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.two,
  },
  navigationItem: {
    minHeight: 40,
    justifyContent: 'center',
    borderRadius: Radii.small,
    paddingHorizontal: Spacing.three,
  },
  navigationItemMobile: {
    minHeight: 48,
    flexGrow: 1,
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  safeBottomNavigation: {
    width: '100%',
    borderTopWidth: 1,
  },
});
