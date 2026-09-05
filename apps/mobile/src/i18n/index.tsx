import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type PropsWithChildren,
} from 'react';

import {
  defaultLocale,
  type SupportedLocale,
  type TranslationKey,
} from './translations';
import {
  getDeviceLocale,
  translate,
  type TranslationParams,
} from './translate';
type TranslationContextValue = {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: TranslationKey, params?: TranslationParams) => string;
};

function subscribeToDeviceLocale() {
  return () => undefined;
}

const TranslationContext = createContext<TranslationContextValue | null>(null);

export function I18nProvider({ children }: PropsWithChildren) {
  const deviceLocale = useSyncExternalStore(
    subscribeToDeviceLocale,
    getDeviceLocale,
    () => defaultLocale
  );
  const [selectedLocale, setSelectedLocale] =
    useState<SupportedLocale | null>(null);
  const locale = selectedLocale ?? deviceLocale;

  const setLocale = useCallback((nextLocale: SupportedLocale) => {
    setSelectedLocale(nextLocale);
  }, []);

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      t: (key: TranslationKey, params?: TranslationParams) => translate(key, locale, params),
    }),
    [locale, setLocale]
  );

  return <TranslationContext.Provider value={value}>{children}</TranslationContext.Provider>;
}

export function useTranslation() {
  const context = useContext(TranslationContext);

  if (!context) {
    throw new Error('useTranslation must be used inside I18nProvider');
  }

  return context;
}

export type { SupportedLocale, TranslationKey };
export { getDeviceLocale, translate };
