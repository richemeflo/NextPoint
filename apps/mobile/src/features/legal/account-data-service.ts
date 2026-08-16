import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase/client';

export type AccountDataFailureCode =
  | 'configuration_error'
  | 'authentication_failed'
  | 'recent_authentication_required'
  | 'export_failed'
  | 'download_failed'
  | 'deletion_failed';

export type AccountDataResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; code: AccountDataFailureCode };

type AccountExportEnvelope = {
  ok: true;
  data: Record<string, unknown>;
};

function hasExportEnvelope(value: unknown): value is AccountExportEnvelope {
  return Boolean(
    value &&
      typeof value === 'object' &&
      'ok' in value &&
      value.ok === true &&
      'data' in value &&
      value.data &&
      typeof value.data === 'object'
  );
}

export async function requestAccountExport(): Promise<
  AccountDataResult<Record<string, unknown>>
> {
  if (!supabase) return { ok: false, code: 'configuration_error' };

  try {
    const { data, error } = await supabase.functions.invoke(
      'manage-account-data',
      { body: { action: 'export' } }
    );

    if (error || !hasExportEnvelope(data)) {
      return { ok: false, code: 'export_failed' };
    }

    return { ok: true, data: data.data };
  } catch {
    return { ok: false, code: 'export_failed' };
  }
}

export async function saveAccountExport(
  data: Record<string, unknown>
): Promise<AccountDataResult<string>> {
  const date = new Date().toISOString().slice(0, 10);
  const filename = `equation-padel-export-${date}.json`;
  const contents = JSON.stringify(data, null, 2);

  try {
    if (Platform.OS === 'web') {
      const blob = new Blob([contents], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
      return { ok: true, data: filename };
    }

    const [{ File, Paths }, Sharing] = await Promise.all([
      import('expo-file-system'),
      import('expo-sharing'),
    ]);
    const file = new File(Paths.cache, filename);
    file.create({ overwrite: true });
    file.write(contents);

    if (!(await Sharing.isAvailableAsync())) {
      return { ok: false, code: 'download_failed' };
    }

    await Sharing.shareAsync(file.uri, {
      dialogTitle: 'Exporter mes données Equation Padel',
      mimeType: 'application/json',
      UTI: 'public.json',
    });
    return { ok: true, data: filename };
  } catch {
    return { ok: false, code: 'download_failed' };
  }
}

export async function deleteAccount({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<AccountDataResult<undefined>> {
  if (!supabase) return { ok: false, code: 'configuration_error' };

  try {
    const authentication = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    if (authentication.error) {
      return { ok: false, code: 'authentication_failed' };
    }

    const { data, error } = await supabase.functions.invoke(
      'manage-account-data',
      { body: { action: 'delete', confirmation: 'DELETE' } }
    );
    if (error || !data || data.ok !== true || data.deleted !== true) {
      const code = data?.error?.code;
      return {
        ok: false,
        code:
          code === 'recent_authentication_required'
            ? 'recent_authentication_required'
            : 'deletion_failed',
      };
    }

    await supabase.auth.signOut({ scope: 'local' }).catch(() => undefined);
    return { ok: true, data: undefined };
  } catch {
    return { ok: false, code: 'deletion_failed' };
  }
}
