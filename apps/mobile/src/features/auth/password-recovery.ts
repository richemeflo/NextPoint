export type PasswordRecoveryCredentials =
  | { kind: 'code'; code: string }
  | { kind: 'tokens'; accessToken: string; refreshToken: string };

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
  url: string
): PasswordRecoveryCredentials | null {
  try {
    const parsedUrl = new URL(url);
    const query = parsedUrl.searchParams;
    const fragment = new URLSearchParams(parsedUrl.hash.replace(/^#/, ''));
    const code = query.get('code');

    if (code) return { kind: 'code', code };

    const accessToken = fragment.get('access_token');
    const refreshToken = fragment.get('refresh_token');

    if (
      fragment.get('type') !== 'recovery' ||
      !accessToken ||
      !refreshToken
    ) {
      return null;
    }

    return { kind: 'tokens', accessToken, refreshToken };
  } catch {
    return null;
  }
}
