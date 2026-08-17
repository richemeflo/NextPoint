import { useRouter, type Href } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { Spacing } from '@/constants/theme';
import { useTranslation } from '@/i18n';

import { requestAccountExport, saveAccountExport } from './account-data-service';
import { getLegalUiCopy } from './legal-copy';

const exportCopy = {
  fr: {
    action: 'Exporter mes données (JSON)',
    loading: "Préparation de l'export…",
    successTitle: 'Export prêt',
    successBody: 'Le fichier a été téléchargé ou partagé depuis votre appareil.',
    errorTitle: 'Export impossible',
    errorBody: 'Réessayez ou contactez le référent confidentialité.',
  },
  en: {
    action: 'Export my data (JSON)',
    loading: 'Preparing export…',
    successTitle: 'Export ready',
    successBody: 'The file has been downloaded or shared from your device.',
    errorTitle: 'Export failed',
    errorBody: 'Try again or contact the privacy address.',
  },
  es: {
    action: 'Exportar mis datos (JSON)',
    loading: 'Preparando la exportación…',
    successTitle: 'Exportación lista',
    successBody: 'El archivo se ha descargado o compartido desde tu dispositivo.',
    errorTitle: 'No se pudo exportar',
    errorBody: 'Inténtalo de nuevo o contacta con privacidad.',
  },
};

export function AccountPrivacyCard() {
  const router = useRouter();
  const { locale } = useTranslation();
  const ui = getLegalUiCopy(locale);
  const labels = exportCopy[locale];
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const exportData = async () => {
    setStatus('loading');
    const exported = await requestAccountExport();
    if (!exported.ok) {
      setStatus('error');
      return;
    }

    const saved = await saveAccountExport(exported.data);
    setStatus(saved.ok ? 'success' : 'error');
  };

  return (
    <Card elevated style={styles.card}>
      <ThemedText type="subtitle">{ui.accountToolsTitle}</ThemedText>
      <ThemedText themeColor="textMuted" type="small">
        {ui.accountToolsBody}
      </ThemedText>
      {status === 'success' ? (
        <Feedback
          message={labels.successBody}
          title={labels.successTitle}
          tone="success"
        />
      ) : null}
      {status === 'error' ? (
        <Feedback
          message={labels.errorBody}
          title={labels.errorTitle}
          tone="error"
        />
      ) : null}
      <Button
        disabled={status === 'loading'}
        label={status === 'loading' ? labels.loading : labels.action}
        onPress={() => void exportData()}
      />
      <Button
        label={ui.openDataRights}
        onPress={() => router.navigate('/data-rights' as Href)}
        variant="secondary"
      />
      <Button
        label={ui.openDeleteAccount}
        onPress={() => router.navigate('/delete-account' as Href)}
        variant="secondary"
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
});
