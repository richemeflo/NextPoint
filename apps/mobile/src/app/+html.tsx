import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

function getSupabaseConnectSources() {
  const sources = new Set(["'self'"]);

  for (const value of [
    process.env.EXPO_PUBLIC_SUPABASE_URL,
    process.env.EXPO_PUBLIC_SUPABASE_URL_WEB,
  ]) {
    if (!value) continue;

    try {
      const url = new URL(value);
      if (url.protocol !== 'https:' && url.protocol !== 'http:') continue;

      sources.add(url.origin);
      const websocketUrl = new URL(url.origin);
      websocketUrl.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      sources.add(websocketUrl.origin);
    } catch {
      // Invalid runtime URLs are rejected by the Supabase configuration guard.
    }
  }

  return [...sources];
}

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  `connect-src ${getSupabaseConnectSources().join(' ')}`,
  "font-src 'self' data:",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "img-src 'self' data: blob:",
  "object-src 'none'",
  "script-src 'self' 'sha256-67fhrP0+BkBqmgGGXTtgiVO/9EQs3QruYNU/7fnRkI8='",
  "style-src 'self' 'unsafe-inline'",
].join('; ');

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="fr">
      <head>
        <meta charSet="utf-8" />
        <title>Equation Padel</title>
        <meta
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
          name="viewport"
        />
        <meta content={contentSecurityPolicy} httpEquiv="Content-Security-Policy" />
        <meta content="no-referrer" name="referrer" />
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
