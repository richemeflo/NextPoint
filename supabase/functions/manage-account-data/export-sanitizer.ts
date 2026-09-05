type JsonRecord = Record<string, unknown>;

const UUID_PATTERN = /\b[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi;

function normalizeKey(key: string) {
  return key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase();
}

export function isAccountExportKeyAllowed(key: string) {
  const normalizedKey = normalizeKey(key);

  if (
    normalizedKey === 'id' ||
    normalizedKey.startsWith('id_') ||
    normalizedKey.endsWith('_id') ||
    normalizedKey.endsWith('_ids') ||
    normalizedKey.endsWith('_by')
  ) {
    return false;
  }

  return !(
    normalizedKey.includes('password') ||
    normalizedKey.includes('token') ||
    normalizedKey.includes('secret') ||
    normalizedKey.includes('nonce') ||
    normalizedKey === 'otp' ||
    normalizedKey.endsWith('_otp') ||
    normalizedKey === 'authorization' ||
    normalizedKey === 'cookie' ||
    normalizedKey === 'device' ||
    normalizedKey.startsWith('device_')
  );
}

export function sanitizeAccountExport(value: unknown): unknown {
  if (typeof value === 'string') {
    return value.replace(UUID_PATTERN, '[redacted]');
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeAccountExport);
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value as JsonRecord)
      .filter(([key]) => isAccountExportKeyAllowed(key))
      .map(([key, nestedValue]) => [key, sanitizeAccountExport(nestedValue)])
  );
}
