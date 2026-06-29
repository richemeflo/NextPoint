import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type Option<T extends string> = {
  value: T;
  label: string;
};

export function PricingMultiSelector<T extends string>({
  label,
  options,
  values,
  onChange,
}: {
  label: string;
  options: Option<T>[];
  values: T[];
  onChange: (values: T[]) => void;
}) {
  const theme = useTheme();

  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <View style={styles.options}>
        {options.map((option) => {
          const selected = values.includes(option.value);

          return (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              key={option.value}
              onPress={() =>
                onChange(
                  selected
                    ? values.filter((value) => value !== option.value)
                    : [...values, option.value]
                )
              }
              style={[
                styles.option,
                {
                  backgroundColor: selected
                    ? theme.backgroundSelected
                    : theme.surface,
                  borderColor: selected ? theme.primary : theme.border,
                },
              ]}>
              <ThemedText
                type="smallBold"
                themeColor={selected ? 'primary' : 'textMuted'}>
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.two,
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  option: {
    minHeight: 44,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radii.small,
    paddingHorizontal: Spacing.three,
  },
});
