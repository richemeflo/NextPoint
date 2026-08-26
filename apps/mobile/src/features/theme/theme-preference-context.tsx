import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  isThemePreference,
  resolveThemeName,
  type ThemePreference,
} from '@/features/theme/theme-preference';

const themePreferenceStorageKey = 'equation-padel:theme-preference';

type ThemePreferenceContextValue = {
  preference: ThemePreference;
  resolvedTheme: 'light' | 'dark';
  setPreference: (preference: ThemePreference) => void;
};

const ThemePreferenceContext =
  createContext<ThemePreferenceContextValue | null>(null);

export function ThemePreferenceProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [preference, setPreferenceState] =
    useState<ThemePreference>('system');
  const changedDuringRestore = useRef(false);

  useEffect(() => {
    let active = true;

    void AsyncStorage.getItem(themePreferenceStorageKey)
      .then((storedPreference) => {
        if (
          active &&
          !changedDuringRestore.current &&
          isThemePreference(storedPreference)
        ) {
          setPreferenceState(storedPreference);
        }
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const setPreference = useCallback((nextPreference: ThemePreference) => {
    changedDuringRestore.current = true;
    setPreferenceState(nextPreference);
    void AsyncStorage.setItem(themePreferenceStorageKey, nextPreference).catch(
      () => undefined
    );
  }, []);

  const value = useMemo<ThemePreferenceContextValue>(
    () => ({
      preference,
      resolvedTheme: resolveThemeName(preference, systemColorScheme),
      setPreference,
    }),
    [preference, setPreference, systemColorScheme]
  );

  return (
    <ThemePreferenceContext.Provider value={value}>
      {children}
    </ThemePreferenceContext.Provider>
  );
}

export function useThemePreference() {
  const context = useContext(ThemePreferenceContext);
  if (!context) {
    throw new Error('useThemePreference requires ThemePreferenceProvider');
  }
  return context;
}

export function useResolvedThemeName() {
  const context = useContext(ThemePreferenceContext);
  const systemColorScheme = useColorScheme();

  return (
    context?.resolvedTheme ?? resolveThemeName('system', systemColorScheme)
  );
}
