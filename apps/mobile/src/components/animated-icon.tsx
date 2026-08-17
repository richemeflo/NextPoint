import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useTheme } from '@/hooks/use-theme';

const DURATION = 600;

export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);
  const theme = useTheme();

  if (!visible) return null;

  const splashKeyframe = new Keyframe({
    0: { opacity: 1 },
    70: { opacity: 0, easing: Easing.elastic(0.7) },
    100: { opacity: 0 },
  });

  return (
    <Animated.View
      entering={splashKeyframe.duration(DURATION).withCallback((finished?: boolean) => {
        'worklet';
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={[styles.splash, { backgroundColor: theme.background }]}
    />
  );
}

export function AnimatedIcon() {
  const theme = useTheme();

  return (
    <View style={styles.iconFrame}>
      <Image
        accessible={false}
        resizeMode="contain"
        source={require('../../assets/images/equation-padel-logo.png')}
        style={[styles.icon, { tintColor: theme.brandLogo }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
  },
  iconFrame: {
    width: 128,
    height: 128,
    flexShrink: 0,
  },
  icon: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
});
