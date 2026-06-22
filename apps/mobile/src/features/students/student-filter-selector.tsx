import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type FilterValue = number | string | null;

type Option<T extends FilterValue> = {
  value: T;
  label: string;
};

export function StudentFilterSelector<T extends FilterValue>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}) {
  const theme = useTheme();

  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>
      <ScrollView
        contentContainerStyle={styles.options}
        horizontal
        showsHorizontalScrollIndicator={false}>
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              key={String(option.value)}
              onPress={() => onChange(option.value)}
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
                numberOfLines={1}
                type="smallBold"
                themeColor={selected ? 'primary' : 'textMuted'}>
                {option.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.two,
  },
  options: {
    gap: Spacing.two,
    paddingRight: Spacing.two,
  },
  option: {
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radii.small,
    paddingHorizontal: Spacing.three,
  },
});
