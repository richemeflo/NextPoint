import type {
  AppLanguage,
  CoachProfileInput,
  Tables,
} from '@nextpoint/shared';

import { supabase } from '@/lib/supabase/client';

type CoachProfileRow = Tables<'coach_profiles'>;

export type CoachProfile = CoachProfileInput & {
  userId: string;
  updatedAt: string;
};

export type CoachProfileResult =
  | { ok: true; data: CoachProfile | null }
  | { ok: false };

function mapCoachProfile(row: CoachProfileRow): CoachProfile {
  return {
    userId: row.user_id,
    displayName: row.display_name,
    bio: row.bio,
    phone: row.phone,
    email: row.email,
    preferredLanguage: row.preferred_language as AppLanguage,
    updatedAt: row.updated_at,
  };
}

export async function getPublicCoachProfile(): Promise<CoachProfileResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase
    .from('coach_profiles')
    .select('*')
    .limit(1)
    .maybeSingle();

  if (error) return { ok: false };
  return { ok: true, data: data ? mapCoachProfile(data) : null };
}

export async function getCoachProfile(userId: string): Promise<CoachProfileResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase
    .from('coach_profiles')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) return { ok: false };
  return { ok: true, data: data ? mapCoachProfile(data) : null };
}

export async function saveCoachProfile(
  userId: string,
  profile: CoachProfileInput
): Promise<CoachProfileResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase
    .from('coach_profiles')
    .upsert(
      {
        user_id: userId,
        display_name: profile.displayName,
        bio: profile.bio,
        phone: profile.phone,
        email: profile.email,
        preferred_language: profile.preferredLanguage,
      },
      { onConflict: 'user_id' }
    )
    .select('*')
    .single();

  if (error) return { ok: false };
  return { ok: true, data: mapCoachProfile(data) };
}
