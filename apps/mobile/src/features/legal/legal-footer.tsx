import { Link, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTranslation } from '@/i18n';

import { getLegalUiCopy } from './legal-copy';
import { productName } from './legal-config';

const links: {
  href: Href;
  key: 'privacy' | 'terms' | 'legal' | 'support' | 'dataRights' | 'deleteAccount';
}[] = [
  { href: '/privacy' as Href, key: 'privacy' },
  { href: '/terms' as Href, key: 'terms' },
  { href: '/legal' as Href, key: 'legal' },
  { href: '/support' as Href, key: 'support' },
  { href: '/data-rights' as Href, key: 'dataRights' },
  { href: '/delete-account' as Href, key: 'deleteAccount' },
];

export function LegalFooter() {
  const { locale } = useTranslation();
  const copy = getLegalUiCopy(locale);

  return (
    <View style={styles.footer}>
      <View style={styles.links}>
        {links.map((link) => (
          <Link href={link.href} key={link.key}>
            <ThemedText type="linkPrimary">{copy[link.key]}</ThemedText>
          </Link>
        ))}
      </View>
      <ThemedText type="small" themeColor="textMuted">
        © {new Date().getFullYear()} {productName}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
  },
  links: {
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    justifyContent: 'center',
  },
});
