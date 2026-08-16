import type { AppRole } from '@nextpoint/shared';
import { Link, Slot, usePathname, useRouter, type Href } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button, type ButtonIcon } from '@/components/ui/button';
import { MaxContentWidth, Radii, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation, type TranslationKey } from '@/i18n';

type NavigationItem = {
  href: Href;
  labelKey: TranslationKey;
  icon: ButtonIcon;
};

const signOutIcon = {
  ios: 'rectangle.portrait.and.arrow.right',
  android: 'logout',
  web: 'logout',
} satisfies ButtonIcon;

const coachProfileIcon = {
  ios: 'person.crop.circle',
  android: 'account_circle',
  web: 'account_circle',
} satisfies ButtonIcon;

const coachItems: NavigationItem[] = [
  {
    href: '/coach',
    labelKey: 'nav.coach.planning',
    icon: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  },
  {
    href: '/coach/availability',
    labelKey: 'nav.coach.availability',
    icon: {
      ios: 'calendar.badge.plus',
      android: 'event_available',
      web: 'event_available',
    },
  },
  {
    href: '/coach/pricing' as Href,
    labelKey: 'nav.coach.pricing',
    icon: { ios: 'eurosign.circle', android: 'payments', web: 'payments' },
  },
  {
    href: '/coach/students',
    labelKey: 'nav.coach.students',
    icon: { ios: 'person.2', android: 'groups', web: 'groups' },
  },
  {
    href: '/coach/stats',
    labelKey: 'nav.coach.stats',
    icon: { ios: 'chart.bar', android: 'analytics', web: 'analytics' },
  },
  {
    href: '/coach/notifications',
    labelKey: 'nav.coach.notifications',
    icon: { ios: 'bell', android: 'notifications', web: 'notifications' },
  },
  {
    href: '/coach/messaging',
    labelKey: 'nav.coach.messaging',
    icon: {
      ios: 'bubble.left.and.bubble.right',
      android: 'chat',
      web: 'chat',
    },
  },
];

const eleveItems: NavigationItem[] = [
  {
    href: '/eleve',
    labelKey: 'nav.eleve.home',
    icon: { ios: 'house', android: 'home', web: 'home' },
  },
  {
    href: '/eleve/planning',
    labelKey: 'nav.eleve.planning',
    icon: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  },
  {
    href: '/eleve/notifications',
    labelKey: 'nav.eleve.notifications',
    icon: { ios: 'bell', android: 'notifications', web: 'notifications' },
  },
  {
    href: '/eleve/account',
    labelKey: 'nav.eleve.account',
    icon: {
      ios: 'person.crop.circle',
      android: 'account_circle',
      web: 'account_circle',
    },
  },
];

export function RoleNavigation({ role }: { role: AppRole }) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { t } = useTranslation();
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const items = role === 'coach' ? coachItems : eleveItems;
  const isMobile = width < 768;
  const navigation = (
    <View accessibilityLabel={t('nav.mainLabel')} role="navigation">
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
          const href =
            typeof item.href === 'string' ? item.href : item.href.pathname;
          const selected =
            pathname === href ||
            (href !== `/${role}` && pathname.startsWith(`${href}/`));

          return (
            <Link asChild href={item.href} key={String(href)}>
              <Pressable
                accessibilityLabel={t(item.labelKey)}
                accessibilityRole="link"
                accessibilityState={
                  Platform.OS === 'web' ? undefined : { selected }
                }
                aria-current={
                  Platform.OS === 'web' && selected ? 'page' : undefined
                }
                style={StyleSheet.flatten([
                  styles.navigationItem,
                  isMobile
                    ? styles.navigationItemMobile
                    : styles.navigationItemDesktop,
                  {
                    backgroundColor: selected
                      ? theme.backgroundSelected
                      : theme.surface,
                  },
                ])}>
                {isMobile ? (
                  <SymbolView
                    name={item.icon}
                    size={22}
                    weight={selected ? 'bold' : 'medium'}
                    tintColor={selected ? theme.primary : theme.textMuted}
                  />
                ) : (
                  <>
                    <SymbolView
                      name={item.icon}
                      size={18}
                      weight={selected ? 'bold' : 'medium'}
                      tintColor={selected ? theme.primary : theme.textMuted}
                    />
                    <ThemedText
                      numberOfLines={1}
                      type="smallBold"
                      themeColor={selected ? 'primary' : 'textMuted'}>
                      {t(item.labelKey)}
                    </ThemedText>
                  </>
                )}
              </Pressable>
            </Link>
          );
        })}
      </ScrollView>
    </View>
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
          <View style={[styles.account, isMobile ? styles.accountMobile : null]}>
            {isMobile ? null : (
              <ThemedText
                numberOfLines={1}
                style={styles.accountEmail}
                type="small"
                themeColor="textMuted">
                {user?.email ?? ''}
              </ThemedText>
            )}
            {isMobile ? (
              <View style={styles.mobileAccountActions}>
                <Pressable
                  accessibilityLabel={t('auth.signOutAction')}
                  accessibilityRole="button"
                  onPress={() => void signOut()}
                  style={({ pressed }) => [
                    styles.mobileAccountAction,
                    {
                      backgroundColor: theme.surface,
                      borderColor: theme.border,
                      opacity: pressed ? 0.72 : 1,
                    },
                  ]}>
                  <SymbolView
                    name={signOutIcon}
                    size={20}
                    weight="semibold"
                    tintColor={theme.text}
                  />
                </Pressable>
                {role === 'coach' ? (
                  <Pressable
                    accessibilityLabel={t('nav.coach.profile')}
                    accessibilityRole="button"
                    onPress={() => router.push('/coach/profile')}
                    style={({ pressed }) => [
                      styles.mobileAccountAction,
                      styles.mobileProfileAction,
                      {
                        backgroundColor: theme.surface,
                        borderColor: theme.border,
                        opacity: pressed ? 0.72 : 1,
                      },
                    ]}>
                    <SymbolView
                      name={coachProfileIcon}
                      size={20}
                      weight="semibold"
                      tintColor={theme.text}
                    />
                  </Pressable>
                ) : null}
              </View>
            ) : (
              <View style={styles.desktopAccountActions}>
                <Button
                  icon={signOutIcon}
                  label={t('auth.signOutAction')}
                  onPress={() => void signOut()}
                  variant="secondary"
                />
                {role === 'coach' ? (
                  <Button
                    icon={coachProfileIcon}
                    label={t('nav.coach.profile')}
                    onPress={() => router.push('/coach/profile')}
                    variant="secondary"
                  />
                ) : null}
              </View>
            )}
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
  accountMobile: {
    maxWidth: '58%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  accountEmail: {
    flexShrink: 1,
  },
  desktopAccountActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  mobileAccountActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  mobileAccountAction: {
    width: 44,
    height: 44,
    flexShrink: 0,
    alignSelf: 'center',
    borderWidth: 1,
    borderRadius: Radii.medium,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileProfileAction: {
    borderRadius: 22,
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
  navigationItemDesktop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  content: {
    flex: 1,
  },
  safeBottomNavigation: {
    width: '100%',
    borderTopWidth: 1,
  },
});
