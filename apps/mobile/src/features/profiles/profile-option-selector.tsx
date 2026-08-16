import { useId, useRef, type ComponentRef } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { getOptionGroupKeyboardTarget } from '@/features/profiles/option-group-navigation';
import { useTheme } from '@/hooks/use-theme';

type Option<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

type AccessibleOptionGroupProps<T extends string> = {
  label: string;
  mode: 'multiple' | 'single';
  onActivate: (value: T) => void;
  options: Option<T>[];
  selectedValues: readonly T[];
  singleLine: boolean;
};

type WebKeyDownEvent = {
  nativeEvent: { key: string };
  preventDefault: () => void;
};

function AccessibleOptionGroup<T extends string>({
  label,
  mode,
  onActivate,
  options,
  selectedValues,
  singleLine,
}: AccessibleOptionGroupProps<T>) {
  const theme = useTheme();
  const optionRefs = useRef<Array<ComponentRef<typeof View> | null>>([]);
  const groupId = `option-group-${useId().replaceAll(':', '')}`;
  const labelId = `${groupId}-label`;
  const enabledOptions = options.map((option) => option.disabled !== true);
  const selectedEnabledIndex = options.findIndex(
    (option) =>
      option.disabled !== true && selectedValues.includes(option.value)
  );
  const firstEnabledIndex = enabledOptions.indexOf(true);

  const handleKeyDown = (index: number, event: WebKeyDownEvent) => {
    const targetIndex = getOptionGroupKeyboardTarget(
      enabledOptions,
      index,
      event.nativeEvent.key
    );
    if (targetIndex === null) return;

    event.preventDefault();
    optionRefs.current[targetIndex]?.focus();
    if (mode === 'single') onActivate(options[targetIndex].value);
  };

  return (
    <View style={styles.field}>
      <ThemedText nativeID={labelId} type="smallBold">
        {label}
      </ThemedText>
      <View
        accessibilityLabel={Platform.OS === 'ios' ? label : undefined}
        accessibilityLabelledBy={
          Platform.OS === 'android' ? labelId : undefined
        }
        aria-labelledby={Platform.OS === 'web' ? labelId : undefined}
        role={mode === 'single' ? 'radiogroup' : 'group'}
        style={[styles.options, singleLine && styles.optionsSingleLine]}>
        {options.map((option, index) => {
          const selected = selectedValues.includes(option.value);
          const disabled = option.disabled === true;
          const radioTabStop =
            index ===
            (selectedEnabledIndex === -1
              ? firstEnabledIndex
              : selectedEnabledIndex);
          const webKeyboardProps =
            Platform.OS === 'web'
              ? {
                  onKeyDown: (event: WebKeyDownEvent) =>
                    handleKeyDown(index, event),
                }
              : {};

          return (
            <Pressable
              accessibilityRole={mode === 'single' ? 'radio' : 'checkbox'}
              accessibilityState={{ checked: selected, disabled }}
              disabled={disabled}
              key={option.value}
              onPress={() => onActivate(option.value)}
              ref={(instance) => {
                optionRefs.current[index] = instance;
              }}
              style={[
                styles.option,
                singleLine && styles.optionSingleLine,
                {
                  backgroundColor: selected
                    ? theme.backgroundSelected
                    : theme.surface,
                  borderColor: selected ? theme.primary : theme.border,
                  opacity: disabled ? 0.45 : 1,
                },
              ]}
              tabIndex={
                Platform.OS === 'web' && mode === 'single'
                  ? radioTabStop
                    ? 0
                    : -1
                  : undefined
              }
              {...webKeyboardProps}>
              <ThemedText
                adjustsFontSizeToFit={singleLine}
                minimumFontScale={0.75}
                numberOfLines={singleLine ? 1 : undefined}
                style={singleLine ? styles.optionTextSingleLine : undefined}
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

export function ProfileOptionSelector<T extends string>({
  label,
  options,
  singleLine = false,
  value,
  onChange,
}: {
  label: string;
  options: Option<T>[];
  singleLine?: boolean;
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <AccessibleOptionGroup
      label={label}
      mode="single"
      onActivate={onChange}
      options={options}
      selectedValues={[value]}
      singleLine={singleLine}
    />
  );
}

export function ProfileMultiOptionSelector<T extends string>({
  label,
  options,
  selectedValues,
  singleLine = false,
  onToggle,
}: {
  label: string;
  options: Option<T>[];
  selectedValues: readonly T[];
  singleLine?: boolean;
  onToggle: (value: T) => void;
}) {
  return (
    <AccessibleOptionGroup
      label={label}
      mode="multiple"
      onActivate={onToggle}
      options={options}
      selectedValues={selectedValues}
      singleLine={singleLine}
    />
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
  optionsSingleLine: {
    flexWrap: 'nowrap',
  },
  option: {
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: Radii.small,
    paddingHorizontal: Spacing.three,
  },
  optionSingleLine: {
    minWidth: 0,
    flex: 1,
    paddingHorizontal: Spacing.two,
  },
  optionTextSingleLine: {
    flexShrink: 1,
    textAlign: 'center',
  },
});
