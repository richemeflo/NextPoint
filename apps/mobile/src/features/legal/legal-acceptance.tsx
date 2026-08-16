import { Link, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n';

const copy = {
  fr: {
    checkbox: "J'accepte les conditions générales d'utilisation et je reconnais avoir lu la politique de confidentialité.",
    error: "Vous devez accepter les CGU et prendre connaissance de la politique de confidentialité.",
    terms: 'Lire les CGU',
    privacy: 'Lire la politique de confidentialité',
  },
  en: {
    checkbox: 'I accept the terms of use and acknowledge that I have read the privacy policy.',
    error: 'You must accept the terms and review the privacy policy.',
    terms: 'Read the terms',
    privacy: 'Read the privacy policy',
  },
  es: {
    checkbox: 'Acepto las condiciones de uso y confirmo que he leído la política de privacidad.',
    error: 'Debes aceptar las condiciones y leer la política de privacidad.',
    terms: 'Leer las condiciones',
    privacy: 'Leer la política de privacidad',
  },
};

export function LegalAcceptance({
  accepted,
  showError = false,
  onChange,
}: {
  accepted: boolean;
  showError?: boolean;
  onChange: (accepted: boolean) => void;
}) {
  const theme = useTheme();
  const { locale } = useTranslation();
  const labels = copy[locale];

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: accepted }}
        onPress={() => onChange(!accepted)}
        style={styles.checkboxRow}>
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: accepted ? theme.primary : theme.surface,
              borderColor: accepted ? theme.primary : theme.border,
            },
          ]}>
          {accepted ? (
            <ThemedText style={styles.checkmark} themeColor="surface" type="smallBold">
              ✓
            </ThemedText>
          ) : null}
        </View>
        <ThemedText style={styles.checkboxLabel} type="small">
          {labels.checkbox}
        </ThemedText>
      </Pressable>
      <View style={styles.links}>
        <Link href={'/terms' as Href}>
          <ThemedText type="linkPrimary">{labels.terms}</ThemedText>
        </Link>
        <Link href={'/privacy' as Href}>
          <ThemedText type="linkPrimary">{labels.privacy}</ThemedText>
        </Link>
      </View>
      {showError && !accepted ? (
        <ThemedText themeColor="error" type="small">
          {labels.error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.two,
  },
  checkboxRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: Spacing.two,
    minHeight: 44,
  },
  checkbox: {
    alignItems: 'center',
    borderRadius: Radii.small,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    marginTop: 2,
    width: 24,
  },
  checkmark: {
    lineHeight: 20,
  },
  checkboxLabel: {
    flex: 1,
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
    paddingLeft: 32,
  },
});
