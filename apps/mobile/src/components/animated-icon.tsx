import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Radii, Spacing } from '@/constants/theme';
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
  const theme = useTheme();

  return (
    <Animated.View entering={logoKeyframe.duration(DURATION)} style={styles.icon}>
      <View style={[styles.outerCourt, { backgroundColor: theme.primary }]}>
        <View style={[styles.innerCourt, { borderColor: theme.surface }]}>
          <View style={[styles.net, { backgroundColor: theme.surface }]} />
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  splash: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
  },
  icon: {
    width: 104,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCourt: {
    width: 92,
    height: 92,
    borderRadius: Radii.large,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-8deg' }],
  },
  innerCourt: {
    width: 64,
    height: 64,
    borderWidth: 2,
    borderRadius: Radii.medium,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.two,
  },
  net: {
    width: 2,
    height: '100%',
    opacity: 0.86,
  },
});
