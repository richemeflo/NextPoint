import { studentPrivateNoteSchema } from '@nextpoint/shared';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Feedback } from '@/components/ui/feedback';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import {
  beginPrivateNoteEdit,
  cancelPrivateNoteEdit,
  commitPrivateNoteSave,
  createPrivateNoteEditorState,
  updatePrivateNoteDraft,
} from '@/features/students/student-private-note-editor';
import {
  getStudentPrivateNote,
  saveStudentPrivateNote,
} from '@/features/students/student-private-note-service';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n';

export function StudentPrivateNoteCard({
  studentId,
}: {
  studentId: string;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [editor, setEditor] = useState(() =>
    createPrivateNoteEditorState(null)
  );
  const [loadState, setLoadState] = useState<'loading' | 'ready' | 'error'>(
    'loading'
  );
  const [saveState, setSaveState] = useState<
    'idle' | 'saving' | 'saved' | 'error'
  >('idle');
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    void getStudentPrivateNote(studentId).then((result) => {
      if (!active) return;
      if (!result.ok) {
        setLoadState('error');
        return;
      }
      setEditor(createPrivateNoteEditorState(result.data?.content ?? null));
      setLoadState('ready');
    });

    return () => {
      active = false;
    };
  }, [studentId]);

  const startEditing = () => {
    setValidationError(null);
    setSaveState('idle');
    setEditor(beginPrivateNoteEdit);
  };

  const cancelEditing = () => {
    setValidationError(null);
    setSaveState('idle');
    setEditor(cancelPrivateNoteEdit);
  };

  const saveNote = async () => {
    const parsed = studentPrivateNoteSchema.safeParse({
      content: editor.draft,
    });
    if (!parsed.success) {
      setValidationError(
        parsed.error.issues[0]?.message === 'note_too_long'
          ? t('studentPrivateNote.validationTooLong')
          : t('studentPrivateNote.validationRequired')
      );
      return;
    }

    setValidationError(null);
    setSaveState('saving');
    const result = await saveStudentPrivateNote(studentId, parsed.data);
    if (!result.ok) {
      setSaveState('error');
      return;
    }
    setEditor((current) =>
      commitPrivateNoteSave(current, result.data.content)
    );
    setSaveState('saved');
  };

  if (loadState === 'loading') {
    return (
      <Card elevated style={styles.card}>
        <View style={styles.loading}>
          <ActivityIndicator color={theme.primary} />
          <ThemedText type="small" themeColor="textMuted">
            {t('studentPrivateNote.loading')}
          </ThemedText>
        </View>
      </Card>
    );
  }

  if (loadState === 'error') {
    return (
      <Feedback
        message={t('studentPrivateNote.loadErrorBody')}
        title={t('studentPrivateNote.loadErrorTitle')}
        tone="error"
      />
    );
  }

  return (
    <Card elevated style={styles.card}>
      <View style={styles.heading}>
        <View style={styles.headingCopy}>
          <ThemedText type="subtitle">
            {t('studentPrivateNote.title')}
          </ThemedText>
          <ThemedText type="small" themeColor="textMuted">
            {t('studentPrivateNote.privateHint')}
          </ThemedText>
        </View>
        {!editor.isEditing ? (
          <Button
            label={
              editor.persistedContent
                ? t('studentPrivateNote.editAction')
                : t('studentPrivateNote.addAction')
            }
            onPress={startEditing}
            variant="secondary"
          />
        ) : null}
      </View>

      {editor.isEditing ? (
        <>
          <TextField
            error={validationError ?? undefined}
            label={t('studentPrivateNote.fieldLabel')}
            maxLength={2000}
            multiline
            numberOfLines={6}
            onChangeText={(draft) =>
              setEditor((current) => updatePrivateNoteDraft(current, draft))
            }
            placeholder={t('studentPrivateNote.placeholder')}
            style={styles.textArea}
            textAlignVertical="top"
            value={editor.draft}
          />
          <ThemedText type="small" themeColor="textMuted">
            {t('studentPrivateNote.characterCount', {
              count: editor.draft.length,
            })}
          </ThemedText>
          <View style={styles.actions}>
            <Button
              disabled={saveState === 'saving'}
              label={
                saveState === 'saving'
                  ? t('studentPrivateNote.saving')
                  : t('studentPrivateNote.saveAction')
              }
              onPress={() => void saveNote()}
            />
            <Button
              disabled={saveState === 'saving'}
              label={t('studentPrivateNote.cancelAction')}
              onPress={cancelEditing}
              variant="secondary"
            />
          </View>
        </>
      ) : editor.persistedContent ? (
        <ThemedText type="default">{editor.persistedContent}</ThemedText>
      ) : (
        <ThemedText type="default" themeColor="textMuted">
          {t('studentPrivateNote.emptyBody')}
        </ThemedText>
      )}

      {saveState === 'saved' ? (
        <Feedback
          message={t('studentPrivateNote.saveSuccessBody')}
          title={t('studentPrivateNote.saveSuccessTitle')}
          tone="success"
        />
      ) : null}
      {saveState === 'error' ? (
        <Feedback
          message={t('studentPrivateNote.saveErrorBody')}
          title={t('studentPrivateNote.saveErrorTitle')}
          tone="error"
        />
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.three,
  },
  loading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  heading: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  headingCopy: {
    flex: 1,
    minWidth: 220,
    gap: Spacing.one,
  },
  textArea: {
    minHeight: 144,
    paddingVertical: Spacing.three,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
});
