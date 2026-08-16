export const passwordRecoveryPath = '/reset-password';
export const passwordRecoveryScheme = 'com.nextpoint.app';

export type PasswordRecoveryUrlPolicy = {
  allowedHttpsOrigins: readonly string[];
  allowDevelopmentUrls?: boolean;
};

function normalizeOrigin(value: string | undefined) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.origin : null;
  } catch {
    return null;
  }
}

export function getPasswordRecoveryRedirectUrl({
  fallbackUrl,
  publicAppUrl,
}: {
  fallbackUrl: string;
  publicAppUrl: string | undefined;
}) {
  const publicOrigin = normalizeOrigin(publicAppUrl);
  return publicOrigin
    ? new URL(passwordRecoveryPath, `${publicOrigin}/`).toString()
    : fallbackUrl;
}

export function getPasswordRecoveryAllowedHttpsOrigins(
  ...values: (string | undefined)[]
) {
  return [...new Set(values.map(normalizeOrigin).filter((value): value is string => !!value))];
}

function isExpectedRecoveryPath(url: URL) {
  return url.pathname === passwordRecoveryPath;
}

function isExpectedCustomSchemeUrl(url: URL) {
  if (url.protocol !== `${passwordRecoveryScheme}:`) return false;

  return (
    (url.hostname === 'reset-password' && (url.pathname === '' || url.pathname === '/')) ||
    (url.hostname === '' && isExpectedRecoveryPath(url))
  );
}

function isAllowedDevelopmentUrl(url: URL) {
  if (url.protocol === 'exp:') {
    return url.pathname === `/--${passwordRecoveryPath}`;
  }

  return (
    url.protocol === 'http:' &&
    (url.hostname === '127.0.0.1' || url.hostname === 'localhost') &&
    isExpectedRecoveryPath(url)
  );
}

function isAllowedRecoveryCallback(url: URL, policy: PasswordRecoveryUrlPolicy) {
  if (isExpectedCustomSchemeUrl(url)) return true;

  if (
    url.protocol === 'https:' &&
    isExpectedRecoveryPath(url) &&
    policy.allowedHttpsOrigins.includes(url.origin)
  ) {
    return true;
  }

  return policy.allowDevelopmentUrls === true && isAllowedDevelopmentUrl(url);
}

export function getSanitizedPasswordRecoveryPath(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    const fragment = new URLSearchParams(parsedUrl.hash.replace(/^#/, ''));

    parsedUrl.searchParams.delete('code');
    parsedUrl.searchParams.delete('token');
    parsedUrl.searchParams.delete('token_hash');

    if (fragment.has('access_token') || fragment.has('refresh_token')) {
      parsedUrl.hash = '';
    }

    return `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
  } catch {
    return null;
  }
}

export function parsePasswordRecoveryUrl(
  url: string,
  policy: PasswordRecoveryUrlPolicy
): string | null {
  try {
    const parsedUrl = new URL(url);
    if (!isAllowedRecoveryCallback(parsedUrl, policy)) return null;

    const code = parsedUrl.searchParams.get('code')?.trim();
    return code || null;
  } catch {
    return null;
  }
}
