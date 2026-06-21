import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import {
  defaultLocale,
  dictionaries,
  supportedLocales,
  type SupportedLocale,
  type TranslationKey,
} from './translations';

function normalizeLocale(locale: string | undefined): SupportedLocale {
  const language = locale?.split('-')[0]?.toLowerCase();
  return supportedLocales.find((supportedLocale) => supportedLocale === language) ?? defaultLocale;
}

export function getDeviceLocale(): SupportedLocale {
  return normalizeLocale(Intl.DateTimeFormat().resolvedOptions().locale);
}

type TranslationParams = Record<string, string | number>;
type TranslationContextValue = {
  locale: SupportedLocale;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: TranslationKey, params?: TranslationParams) => string;
};

const TranslationContext = createContext<TranslationContextValue | null>(null);

export function translate(
  key: TranslationKey,
  locale: SupportedLocale = getDeviceLocale(),
  params: TranslationParams = {}
) {
  const template = dictionaries[locale][key] ?? dictionaries[defaultLocale][key];

  return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
    Object.hasOwn(params, name) ? String(params[name]) : match
  );
}

export function I18nProvider({ children }: PropsWithChildren) {
  const [locale, setCurrentLocale] = useState<SupportedLocale>(getDeviceLocale);
  const setLocale = useCallback((nextLocale: SupportedLocale) => {
    setCurrentLocale(nextLocale);
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
