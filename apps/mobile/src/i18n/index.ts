import { useMemo } from 'react';

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

export function translate(key: TranslationKey, locale: SupportedLocale = getDeviceLocale()) {
  return dictionaries[locale][key] ?? dictionaries[defaultLocale][key];
}

export function useTranslation() {
  const locale = getDeviceLocale();

  return useMemo(
    () => ({
      locale,
      t: (key: TranslationKey) => translate(key, locale),
    }),
    [locale]
  );
}

export type { SupportedLocale, TranslationKey };
