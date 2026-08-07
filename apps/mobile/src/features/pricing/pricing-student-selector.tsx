import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { TextField } from '@/components/ui/text-field';
import { Radii, Spacing } from '@/constants/theme';
import {
  filterPricingStudentOptions,
  type PricingStudentSearchOption,
} from '@/features/pricing/pricing-student-search';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n';

type PricingStudentSelectorProps = {
  label: string;
  onChange: (values: string[]) => void;
  onQueryChange: (query: string) => void;
  options: PricingStudentSearchOption[];
  query: string;
  values: string[];
};

export function PricingStudentSelector({
  label,
  onChange,
  onQueryChange,
  options,
  query,
  values,
}: PricingStudentSelectorProps) {
  const theme = useTheme();
  const { t } = useTranslation();
  const selectedOptions = options.filter((option) =>
    values.includes(option.value)
  );
  const matchingOptions = filterPricingStudentOptions(options, query);

  const toggle = (value: string) =>
    onChange(
      values.includes(value)
        ? values.filter((candidate) => candidate !== value)
        : [...values, value]
    );

  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">{label}</ThemedText>

      {selectedOptions.length > 0 ? (
        <View style={styles.selectedSection}>
          <ThemedText type="small" themeColor="textMuted">
            {t('pricing.selectedStudentsLabel', {
              count: selectedOptions.length,
            })}
          </ThemedText>
          <View style={styles.selectedOptions}>
            {selectedOptions.map((option) => (
              <Pressable
                accessibilityLabel={t('pricing.removeStudentAction', {
                  name: option.label,
                })}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: true }}
                key={option.value}
                onPress={() => toggle(option.value)}
                style={[
                  styles.selectedOption,
                  {
                    backgroundColor: theme.backgroundSelected,
                    borderColor: theme.primary,
                  },
                ]}>
                <ThemedText type="smallBold" themeColor="primary">
                  {option.label} ×
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      <TextField
        autoCapitalize="words"
        autoCorrect={false}
        label={t('pricing.studentSearchLabel')}
        onChangeText={onQueryChange}
        placeholder={t('pricing.studentSearchPlaceholder')}
        value={query}
      />

      {query.trim().length === 0 ? (
        <ThemedText type="small" themeColor="textMuted">
          {t('pricing.studentSearchHint')}
        </ThemedText>
      ) : matchingOptions.length === 0 ? (
        <ThemedText type="small" themeColor="textMuted">
          {t('pricing.studentSearchEmpty')}
        </ThemedText>
      ) : (
        <View style={styles.results}>
          {matchingOptions.map((option) => {
            const selected = values.includes(option.value);

            return (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                key={option.value}
                onPress={() => toggle(option.value)}
                style={[
                  styles.result,
                  {
                    backgroundColor: selected
                      ? theme.backgroundSelected
                      : theme.surface,
                    borderColor: selected ? theme.primary : theme.border,
                  },
                ]}>
                <View style={styles.resultCopy}>
                  <ThemedText type="smallBold">{option.label}</ThemedText>
                  {option.description ? (
                    <ThemedText type="small" themeColor="textMuted">
                      {option.description}
                    </ThemedText>
                  ) : null}
                </View>
                <ThemedText
                  type="smallBold"
                  themeColor={selected ? 'primary' : 'textMuted'}>
                  {t(
                    selected
                      ? 'pricing.selectedStudentAction'
                      : 'pricing.selectStudentAction'
                  )}
                </ThemedText>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.three,
  },
  selectedSection: {
    gap: Spacing.two,
  },
  selectedOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  selectedOption: {
    minHeight: 40,
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.three,
  },
  results: {
    gap: Spacing.two,
  },
  result: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    borderWidth: 1,
    borderRadius: Radii.medium,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  resultCopy: {
    flex: 1,
    gap: Spacing.one,
  },
});
