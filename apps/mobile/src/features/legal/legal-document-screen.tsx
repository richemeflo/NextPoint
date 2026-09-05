import * as Linking from 'expo-linking';
import { Stack, useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button, type ButtonIcon } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { useTranslation } from '@/i18n';

import { getLegalPageCopy, getLegalUiCopy, type LegalPageId } from './legal-copy';
import {
  isLegalConfigurationComplete,
  legalConfiguration,
  productName,
} from './legal-config';
import { LegalFooter } from './legal-footer';

const homeIcon = {
  ios: 'house',
  android: 'home',
  web: 'home',
} satisfies ButtonIcon;

export function LegalDocumentScreen({ page }: { page: LegalPageId }) {
  const router = useRouter();
  const { role } = useAuth();
  const { locale } = useTranslation();
  const document = getLegalPageCopy(page, locale);
  const ui = getLegalUiCopy(locale);

  const openEmail = (email: string, subject: string) => {
    const query = new URLSearchParams({ subject });
    void Linking.openURL(`mailto:${email}?${query.toString()}`);
  };

  const returnHome = () => {
    const href: '/' | '/coach' | '/eleve' = role ? `/${role}` : '/';
    router.replace(href);
  };

  return (
    <ThemedView style={styles.screen}>
      <Stack.Screen options={{ title: productName }} />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <SafeAreaView style={styles.content}>
          <View style={styles.heading}>
            <ThemedText type="smallBold" themeColor="primary">
              {productName}
            </ThemedText>
            <ThemedText type="title">{document.title}</ThemedText>
            <ThemedText type="default" themeColor="textMuted">
              {document.subtitle}
            </ThemedText>
            {document.versionLabel ? (
              <ThemedText type="small" themeColor="textMuted">
                {document.versionLabel}
              </ThemedText>
            ) : null}
          </View>

          {!isLegalConfigurationComplete ? (
            <Feedback
              message={ui.configurationWarningBody}
              title={ui.configurationWarningTitle}
              tone="warning"
            />
          ) : null}

          <View style={styles.sections}>
            {document.sections.map((section) => (
              <Card key={section.title} style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  {section.title}
                </ThemedText>
                {section.paragraphs?.map((paragraph) => (
                  <ThemedText key={paragraph} type="default" themeColor="textMuted">
                    {paragraph}
                  </ThemedText>
                ))}
                {section.bullets?.map((bullet) => (
                  <View key={bullet} style={styles.bulletRow}>
                    <ThemedText type="default" themeColor="primary">
                      •
                    </ThemedText>
                    <ThemedText style={styles.bulletText} type="default" themeColor="textMuted">
                      {bullet}
                    </ThemedText>
                  </View>
                ))}
              </Card>
            ))}
          </View>

          {page === 'support' || page === 'data-rights' ? (
            <View style={styles.actions}>
              <Button
                label={ui.supportEmailAction}
                onPress={() =>
                  openEmail(
                    legalConfiguration.supportEmail,
                    `${productName} — demande de support`
                  )
                }
                variant="secondary"
              />
              <Button
                label={ui.privacyEmailAction}
                onPress={() =>
                  openEmail(
                    legalConfiguration.privacyEmail,
                    `${productName} — exercice de mes droits`
                  )
                }
                variant="secondary"
              />
            </View>
          ) : null}

          <Button
            icon={homeIcon}
            label={ui.home}
            onPress={returnHome}
            variant="secondary"
          />
          <LegalFooter />
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
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
  },
  content: {
    gap: Spacing.four,
    maxWidth: MaxContentWidth,
    width: '100%',
  },
  heading: {
    gap: Spacing.two,
    maxWidth: 760,
  },
  sections: {
    gap: Spacing.three,
  },
  section: {
    gap: Spacing.three,
  },
  sectionTitle: {
    fontSize: 24,
    lineHeight: 32,
  },
  bulletRow: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: Spacing.two,
  },
  bulletText: {
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
});
