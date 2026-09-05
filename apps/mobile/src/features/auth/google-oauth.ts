import { Platform } from 'react-native';
import * as Linking from 'expo-linking';

export const googleOAuthCallbackPath = 'google-auth-callback';

function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, '');
}

export function getGoogleOAuthRedirectUrl() {
  const publicAppUrl = process.env.EXPO_PUBLIC_APP_URL;

  if (Platform.OS === 'web' && publicAppUrl) {
    return `${normalizeBaseUrl(publicAppUrl)}/${googleOAuthCallbackPath}`;
  }

  if (Platform.OS === 'web' && typeof globalThis.location !== 'undefined') {
    return `${globalThis.location.origin}/${googleOAuthCallbackPath}`;
  }

  return Linking.createURL(googleOAuthCallbackPath);
}

export function sanitizeGoogleOAuthUrl() {
  if (Platform.OS !== 'web' || typeof globalThis.history === 'undefined') return;

  try {
    globalThis.history.replaceState(
      globalThis.history.state,
      '',
      `/${googleOAuthCallbackPath}`
    );
  } catch {
    // URL cleanup must not affect authentication.
  }
}
