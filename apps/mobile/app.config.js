const staticConfig = require('./app.json').expo;

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
      // Invalid Supabase URLs are reported by the runtime configuration guard.
    }
  }

  return [...sources];
}

function getWebSecurityHeaders(hasHttpsAppOrigin) {
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
  const headers = {
    'Content-Security-Policy': contentSecurityPolicy,
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Referrer-Policy': 'no-referrer',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
  };

  if (hasHttpsAppOrigin) {
    headers['Strict-Transport-Security'] =
      'max-age=31536000; includeSubDomains';
  }

  return headers;
}

function withWebSecurityHeaders(plugins, hasHttpsAppOrigin) {
  return plugins.map((plugin) =>
    plugin === 'expo-router'
      ? [
          'expo-router',
          { headers: getWebSecurityHeaders(hasHttpsAppOrigin) },
        ]
      : plugin
  );
}

function getAppLinkHost(value) {
  if (!value) return null;

  try {
    const url = new URL(value);
    if (
      url.protocol !== 'https:' ||
      url.pathname !== '/' ||
      url.search !== '' ||
      url.hash !== '' ||
      url.username !== '' ||
      url.password !== ''
    ) {
      throw new Error('invalid public application URL');
    }

    return url.hostname;
  } catch {
    throw new Error(
      'EXPO_PUBLIC_APP_URL must be an HTTPS origin without path, query, or fragment'
    );
  }
}

module.exports = () => {
  const appLinkHost = getAppLinkHost(process.env.EXPO_PUBLIC_APP_URL);
  const baseConfig = {
    ...staticConfig,
    plugins: withWebSecurityHeaders(staticConfig.plugins, Boolean(appLinkHost)),
  };
  if (!appLinkHost) return baseConfig;

  return {
    ...baseConfig,
    ios: {
      ...baseConfig.ios,
      associatedDomains: [`applinks:${appLinkHost}`],
    },
    android: {
      ...baseConfig.android,
      intentFilters: [
        {
          action: 'VIEW',
          autoVerify: true,
          category: ['BROWSABLE', 'DEFAULT'],
          data: [
            {
              scheme: 'https',
              host: appLinkHost,
              pathPrefix: '/reset-password',
            },
            {
              scheme: 'https',
              host: appLinkHost,
              pathPrefix: '/activate-student',
            },
          ],
        },
      ],
    },
  };
};
