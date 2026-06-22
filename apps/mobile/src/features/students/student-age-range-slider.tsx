import { RangeSlider } from '@react-native-assets/slider';
import { Platform, StyleSheet, View, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTranslation } from '@/i18n';

export const STUDENT_MIN_AGE = 5;
export const STUDENT_MAX_AGE = 100;

const webGestureStyle =
  Platform.OS === 'web'
    ? ({ touchAction: 'none' } as unknown as ViewStyle)
    : undefined;

export function StudentAgeRangeSlider({
  value,
  onChange,
  onInteractionChange,
}: {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  onInteractionChange?: (isInteracting: boolean) => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={styles.field}>
      <ThemedText type="smallBold">
        {t('students.ageRangeSliderLabel')}
      </ThemedText>
      <View style={styles.values}>
        <ThemedText type="small" themeColor="textMuted">
          {t('students.ageMin', { age: value[0] })}
        </ThemedText>
        <ThemedText type="small" themeColor="textMuted">
          {t('students.ageMax', { age: value[1] })}
        </ThemedText>
      </View>
      <RangeSlider
        crossingAllowed={false}
        inboundColor={theme.primary}
        maximumValue={STUDENT_MAX_AGE}
        minimumRange={0}
        minimumValue={STUDENT_MIN_AGE}
        onSlidingComplete={() => onInteractionChange?.(false)}
        onSlidingStart={() => onInteractionChange?.(true)}
        onValueChange={onChange}
        outboundColor={theme.border}
        range={value}
        slideOnTap
        step={1}
        style={[styles.slider, webGestureStyle]}
        thumbSize={24}
        thumbTintColor={theme.primary}
        trackHeight={4}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    gap: Spacing.two,
  },
  values: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  slider: {
    width: '100%',
    height: 48,
  },
});
