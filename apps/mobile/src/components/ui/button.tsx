import { SymbolView, type SymbolViewProps } from 'expo-symbols';
import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonIcon = SymbolViewProps['name'];

export type ButtonProps = Omit<PressableProps, 'style'> & {
  label: string;
  variant?: ButtonVariant;
  icon?: ButtonIcon;
  iconPosition?: 'left' | 'right';
  leading?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  label,
  variant = 'primary',
  icon,
  iconPosition = 'left',
  leading,
  style,
  disabled = false,
  ...props
}: ButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  const isEmphasized = isPrimary || isDanger;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: isDanger
            ? theme.error
            : isPrimary
              ? theme.primary
              : theme.surface,
          borderColor: isDanger
            ? theme.error
            : isPrimary
              ? theme.primary
              : theme.border,
          opacity: disabled ? 0.55 : pressed ? 0.82 : 1,
        },
        style,
      ]}
      {...props}>
      <View pointerEvents="none" style={styles.content}>
        {leading}
        {!leading && icon && iconPosition === 'left' ? (
          <SymbolView
            name={icon}
            size={18}
            weight="semibold"
            tintColor={isEmphasized ? theme.surface : theme.text}
          />
        ) : null}
        <ThemedText
          type="smallBold"
          themeColor={isEmphasized ? 'surface' : 'text'}>
          {label}
        </ThemedText>
        {icon && iconPosition === 'right' ? (
          <SymbolView
            name={icon}
            size={18}
            weight="semibold"
            tintColor={isEmphasized ? theme.surface : theme.text}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 44,
    borderWidth: 1,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: Spacing.one,
    justifyContent: 'center',
    maxWidth: '100%',
  },
});
