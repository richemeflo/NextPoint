import { messageBodyMaxLength } from '@nextpoint/shared';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import {
  acquireMutationLock,
  releaseMutationLock,
} from '@/features/mutations/mutation-lock';
import { useTranslation } from '@/i18n';

export function CoachMessageComposer({
  disabled,
  invalid,
  onSend,
}: {
  disabled: boolean;
  invalid: boolean;
  onSend: (body: string) => Promise<boolean>;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const sendLock = useRef(false);

  const submit = async () => {
    if (!acquireMutationLock(sendLock)) return;

    setSending(true);
    try {
      if (await onSend(draft)) setDraft('');
    } finally {
      setSending(false);
      releaseMutationLock(sendLock);
    }
  };

  return (
    <View style={styles.composer}>
      <TextField
        editable={!disabled && !sending}
        error={invalid ? t('messaging.invalidMessageBody') : undefined}
        label={t('messaging.responseLabel')}
        maxLength={messageBodyMaxLength + 1}
        multiline
        onChangeText={setDraft}
        placeholder={t('messaging.responsePlaceholder')}
        style={styles.messageInput}
        value={draft}
      />
      <Button
        disabled={disabled || sending}
        label={t(sending ? 'messaging.sending' : 'messaging.sendAction')}
        onPress={() => void submit()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  composer: {
    gap: Spacing.three,
  },
  messageInput: {
    minHeight: 96,
    paddingVertical: Spacing.three,
    textAlignVertical: 'top',
  },
});
