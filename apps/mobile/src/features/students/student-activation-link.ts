export const studentActivationPath = '/activate-student';
export const studentActivationScheme = 'com.nextpoint.app';

export type StudentActivationUrlPolicy = {
  allowedHttpsOrigins: readonly string[];
  allowDevelopmentUrls?: boolean;
};

function normalizeHttpsOrigin(value: string | undefined) {
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === 'https:' ? url.origin : null;
  } catch {
    return null;
  }
}

export function getStudentActivationAllowedHttpsOrigins(
  ...values: (string | undefined)[]
) {
  return [
    ...new Set(
      values
        .map(normalizeHttpsOrigin)
        .filter((value): value is string => Boolean(value))
    ),
  ];
}

function hasExpectedPath(url: URL) {
  return url.pathname === studentActivationPath;
}

function isExpectedCustomSchemeUrl(url: URL) {
  if (url.protocol !== `${studentActivationScheme}:`) return false;

  return (
    (url.hostname === 'activate-student' &&
      (url.pathname === '' || url.pathname === '/')) ||
    (url.hostname === '' && hasExpectedPath(url))
  );
}

function isAllowedDevelopmentUrl(url: URL) {
  if (url.protocol === 'exp:') {
    return url.pathname === `/--${studentActivationPath}`;
  }

  return (
    url.protocol === 'http:' &&
    (url.hostname === '127.0.0.1' || url.hostname === 'localhost') &&
    hasExpectedPath(url)
  );
}

function isAllowedActivationUrl(url: URL, policy: StudentActivationUrlPolicy) {
  if (isExpectedCustomSchemeUrl(url)) return true;

  if (
    url.protocol === 'https:' &&
    hasExpectedPath(url) &&
    policy.allowedHttpsOrigins.includes(url.origin)
  ) {
    return true;
  }

  return policy.allowDevelopmentUrls === true && isAllowedDevelopmentUrl(url);
}

export function parseStudentActivationUrl(
  value: string,
  policy: StudentActivationUrlPolicy
) {
  try {
    const url = new URL(value);
    if (!isAllowedActivationUrl(url, policy)) return null;

    const fragment = new URLSearchParams(url.hash.replace(/^#/, ''));
    if (fragment.get('type') !== 'student_activation') return null;

    return fragment.get('token')?.trim() || null;
  } catch {
    return null;
  }
}

export function getSanitizedStudentActivationPath(value: string) {
  try {
    const url = new URL(value);
    const fragment = new URLSearchParams(url.hash.replace(/^#/, ''));

    if (fragment.has('token') || fragment.has('type')) {
      url.hash = '';
    }
    url.searchParams.delete('token');

    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}
