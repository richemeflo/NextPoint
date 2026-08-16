import type { ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function SchedulingModal({
  children,
  closeLabel,
  onClose,
  pending = false,
  presentation = 'sheet',
  subtitle,
  title,
  visible,
}: {
  children: ReactNode;
  closeLabel: string;
  onClose: () => void;
  pending?: boolean;
  presentation?: 'dialog' | 'sheet';
  subtitle?: ReactNode;
  title: string;
  visible: boolean;
}) {
  const theme = useTheme();
  const close = () => {
    if (!pending) onClose();
  };

  return (
    <Modal
      animationType="fade"
      onRequestClose={close}
      transparent
      visible={visible}>
      <View
        style={[
          styles.root,
          presentation === 'dialog' ? styles.dialogRoot : styles.sheetRoot,
        ]}>
        <Pressable
          accessibilityElementsHidden
          disabled={pending}
          importantForAccessibility="no-hide-descendants"
          onPress={close}
          style={styles.backdrop}
        />
        <View
          accessibilityViewIsModal
          style={[
            styles.surface,
            presentation === 'dialog'
              ? styles.dialogSurface
              : styles.sheetSurface,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}>
          <View style={styles.header}>
            <View style={styles.title}>
              <ThemedText type="subtitle">{title}</ThemedText>
              {subtitle}
            </View>
            <Pressable
              accessibilityLabel={closeLabel}
              accessibilityRole="button"
              disabled={pending}
              onPress={close}
              style={[
                styles.close,
                { borderColor: theme.border, backgroundColor: theme.surface },
              ]}>
              <ThemedText type="smallBold">X</ThemedText>
            </Pressable>
          </View>
          <ScrollView
            contentContainerStyle={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  dialogRoot: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.three,
  },
  sheetRoot: {
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
  },
  surface: {
    borderWidth: 1,
    overflow: 'hidden',
    width: '100%',
  },
  dialogSurface: {
    borderRadius: Radii.medium,
    maxHeight: '90%',
    maxWidth: 720,
  },
  sheetSurface: {
    borderTopLeftRadius: Radii.medium,
    borderTopRightRadius: Radii.medium,
    maxHeight: '86%',
    paddingBottom: Spacing.one,
  },
  header: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    gap: Spacing.three,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
  },
  title: {
    flex: 1,
    gap: Spacing.one,
  },
  close: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    borderWidth: 1,
  },
  body: {
    gap: Spacing.three,
    padding: Spacing.four,
  },
});
