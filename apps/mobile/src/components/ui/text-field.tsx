import { useId } from 'react';
import {
  Platform,
  StyleSheet,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function TextField({
  label,
  error,
  containerStyle,
  style,
  ...props
}: TextFieldProps) {
  const theme = useTheme();
  const fieldId = `text-field-${useId().replaceAll(':', '')}`;
  const labelId = `${fieldId}-label`;
  const errorId = `${fieldId}-error`;
  const webErrorProps =
    Platform.OS === 'web'
      ? {
          'aria-describedby': error ? errorId : undefined,
          'aria-invalid': Boolean(error),
        }
      : {};

  return (
    <View style={[styles.wrapper, containerStyle]}>
      <ThemedText nativeID={labelId} type="smallBold">
        {label}
      </ThemedText>
      <TextInput
        accessibilityLabel={Platform.OS === 'web' ? undefined : label}
        accessibilityLabelledBy={Platform.OS === 'android' ? labelId : undefined}
        aria-labelledby={Platform.OS === 'web' ? labelId : undefined}
        placeholderTextColor={theme.textMuted}
        {...webErrorProps}
        style={[
          styles.input,
          {
            backgroundColor: theme.surface,
            borderColor: error ? theme.error : theme.border,
            color: theme.text,
          },
          style,
        ]}
        {...props}
      />
      {error ? (
        <ThemedText
          accessibilityLiveRegion="polite"
          accessibilityRole="alert"
          nativeID={errorId}
          type="small"
          themeColor="error">
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: Spacing.two,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.three,
    fontFamily: Fonts.sans,
    fontSize: 16,
  },
});
