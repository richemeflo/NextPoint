declare module 'expo-router' {
  import type { ComponentType, ReactNode } from 'react';
  import type { GestureResponderEvent } from 'react-native';

  export type Href<T = string> = T;

  export type LinkProps = {
    href: Href;
    target?: string;
    asChild?: boolean;
    children?: ReactNode;
    onPress?: (event: GestureResponderEvent) => void | Promise<void>;
  };

  export const Link: ComponentType<LinkProps>;
  export const ThemeProvider: ComponentType<{ value: unknown; children?: ReactNode }>;
  export const DarkTheme: unknown;
  export const DefaultTheme: unknown;
}

declare module 'expo-router/unstable-native-tabs' {
  import type { ComponentType, ReactNode } from 'react';

  type NativeTabsComponent = ComponentType<{
    backgroundColor?: string;
    indicatorColor?: string;
    labelStyle?: unknown;
    children?: ReactNode;
  }> & {
    Trigger: ComponentType<{ name: string; children?: ReactNode }> & {
      Label: ComponentType<{ children?: ReactNode }>;
      Icon: ComponentType<{ src: unknown; renderingMode?: string }>;
    };
  };

  export const NativeTabs: NativeTabsComponent;
}

declare module 'expo-router/ui' {
  import type { ComponentType, ReactNode } from 'react';
  import type { PressableProps, StyleProp, ViewStyle } from 'react-native';
  import type { Href } from 'expo-router';

  export type TabTriggerSlotProps = PressableProps & {
    children?: ReactNode;
    isFocused?: boolean;
  };

  export type TabListProps = {
    children?: ReactNode;
    style?: StyleProp<ViewStyle>;
  };

  export const Tabs: ComponentType<{ children?: ReactNode }>;
  export const TabSlot: ComponentType<{ style?: StyleProp<ViewStyle> }>;
  export const TabList: ComponentType<{ asChild?: boolean; children?: ReactNode }>;
  export const TabTrigger: ComponentType<{
    name: string;
    href: Href;
    asChild?: boolean;
    children?: ReactNode;
  }>;
}

declare module 'react-native-reanimated' {
  import type { ComponentType } from 'react';
  import type { ViewProps } from 'react-native';

  export class Keyframe {
    constructor(definition: unknown);
    duration(durationMs: number): this;
    withCallback(callback: (finished?: boolean) => void): this;
  }

  export const Easing: {
    elastic(value: number): unknown;
  };
  export const FadeIn: {
    duration(durationMs: number): unknown;
  };

  const Animated: {
    View: ComponentType<ViewProps & { entering?: unknown }>;
  };

  export default Animated;
}

declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}
