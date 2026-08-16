export function isValidSupabaseUrl(value: string | undefined) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function resolveSupabaseUrl({
  defaultUrl,
  platform,
  webUrl,
}: {
  defaultUrl: string | undefined;
  platform: string;
  webUrl: string | undefined;
}) {
  if (platform === 'web' && isValidSupabaseUrl(webUrl)) return webUrl;
  return defaultUrl;
}
