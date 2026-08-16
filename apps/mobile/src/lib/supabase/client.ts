import { createClient, processLock, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@nextpoint/shared/types/database';
import { AppState, Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

import {
  isValidSupabaseUrl,
  resolveSupabaseUrl,
} from './supabase-url';
import { secureStorage } from './secure-storage';

const supabaseUrl = resolveSupabaseUrl({
  defaultUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
  platform: Platform.OS,
  webUrl: process.env.EXPO_PUBLIC_SUPABASE_URL_WEB,
});
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured =
  isValidSupabaseUrl(supabaseUrl) &&
  Boolean(supabasePublishableKey) &&
  supabasePublishableKey !== 'replace_me';

export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl!, supabasePublishableKey!, {
      auth: {
        ...(Platform.OS !== 'web' ? { storage: secureStorage } : {}),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        flowType: 'pkce',
        lock: processLock,
      },
    })
  : null;

if (supabase && Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}
