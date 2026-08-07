import {
  defaultLocale,
  dictionaries,
  supportedLocales,
  type SupportedLocale,
  type TranslationKey,
} from './translations';

function normalizeLocale(locale: string | undefined): SupportedLocale {
  const language = locale?.split('-')[0]?.toLowerCase();
  return (
    supportedLocales.find((supportedLocale) => supportedLocale === language) ??
    defaultLocale
  );
}

export function getDeviceLocale(): SupportedLocale {
  return normalizeLocale(Intl.DateTimeFormat().resolvedOptions().locale);
}

export type TranslationParams = Record<string, string | number>;

export function translate(
  key: TranslationKey,
  locale: SupportedLocale = getDeviceLocale(),
  params: TranslationParams = {}
) {
  const template =
    dictionaries[locale][key] ?? dictionaries[defaultLocale][key];
  if (typeof template !== 'string') return String(key);

  return template.replace(/\{\{(\w+)\}\}/g, (match, name: string) =>
    Object.hasOwn(params, name) ? String(params[name]) : match
  );
}
