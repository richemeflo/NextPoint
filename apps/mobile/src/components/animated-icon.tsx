import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
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

const logoKeyframe = new Keyframe({
  0: { opacity: 0, transform: [{ scale: 0.9 }] },
  100: { opacity: 1, transform: [{ scale: 1 }], easing: Easing.elastic(0.7) },
});

export function AnimatedIcon() {
  return (
    <View style={styles.iconFrame}>
      <Animated.Image
        entering={logoKeyframe.duration(DURATION)}
        resizeMode="contain"
        source={require('../../assets/images/equation-padel-logo.png')}
        style={styles.icon}
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
