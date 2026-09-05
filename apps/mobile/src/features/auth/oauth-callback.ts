export function getOAuthCode(url: string, expectedRedirectUrl: string) {
  try {
    const callback = new URL(url);
    const expected = new URL(expectedRedirectUrl);
    const sameDestination =
      callback.protocol === expected.protocol &&
      callback.host === expected.host &&
      callback.pathname.replace(/\/+$/, '') ===
        expected.pathname.replace(/\/+$/, '');

    if (!sameDestination || callback.searchParams.has('error')) return null;
    return callback.searchParams.get('code');
  } catch {
    return null;
  }
}
