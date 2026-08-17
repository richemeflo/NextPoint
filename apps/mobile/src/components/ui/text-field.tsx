import { SymbolView } from 'expo-symbols';
import { useId, useState } from 'react';
import {
  Platform,
  Pressable,
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
import { useTranslation } from '@/i18n';

export type TextFieldProps = TextInputProps & {
  label: string;
  error?: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export function TextField({
  label,
  error,
  containerStyle,
  secureTextEntry,
  style,
  ...props
}: TextFieldProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const isPasswordField = secureTextEntry === true;
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
      <View style={styles.inputFrame}>
        <TextInput
          accessibilityLabel={Platform.OS === 'web' ? undefined : label}
          accessibilityLabelledBy={
            Platform.OS === 'android' ? labelId : undefined
          }
          aria-labelledby={Platform.OS === 'web' ? labelId : undefined}
          placeholderTextColor={theme.textMuted}
          secureTextEntry={isPasswordField ? !passwordVisible : secureTextEntry}
          {...webErrorProps}
          style={[
            styles.input,
            isPasswordField && styles.passwordInput,
            {
              backgroundColor: theme.surface,
              borderColor: error ? theme.error : theme.border,
              color: theme.text,
            },
            style,
          ]}
          {...props}
        />
        {isPasswordField ? (
          <Pressable
            accessibilityLabel={t(
              passwordVisible
                ? 'auth.passwordHideAction'
                : 'auth.passwordShowAction'
            )}
            accessibilityRole="button"
            accessibilityState={{ checked: passwordVisible }}
            onPress={() => setPasswordVisible((visible) => !visible)}
            style={({ pressed }) => [
              styles.passwordVisibilityButton,
              { borderLeftColor: theme.border },
              pressed && styles.passwordVisibilityButtonPressed,
            ]}>
            <SymbolView
              name={
                passwordVisible
                  ? {
                      ios: 'eye.slash',
                      android: 'visibility_off',
                      web: 'visibility_off',
                    }
                  : {
                      ios: 'eye',
                      android: 'visibility',
                      web: 'visibility',
                    }
              }
              pointerEvents="none"
              size={20}
              tintColor={theme.textMuted}
              weight="semibold"
            />
          </Pressable>
        ) : null}
      </View>
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
  inputFrame: {
    position: 'relative',
    width: '100%',
    minWidth: 0,
  },
  input: {
    width: '100%',
    minHeight: 44,
    borderWidth: 1,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.three,
    fontFamily: Fonts.sans,
    fontSize: 16,
  },
  passwordInput: {
    paddingRight: 56,
  },
  passwordVisibilityButton: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 44,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderLeftWidth: 1,
  },
  passwordVisibilityButtonPressed: {
    opacity: 0.62,
  },
});
