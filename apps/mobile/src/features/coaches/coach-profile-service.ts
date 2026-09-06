import type {
  AppLanguage,
  CoachProfileInput,
  Database,
  Tables,
} from '@nextpoint/shared';

import { supabase } from '@/lib/supabase/client';

type CoachProfileRow = Tables<'coach_profiles'>;
type PublicCoachProfileRow =
  Database['public']['Functions']['get_public_coach_profile']['Returns'][number];

export type PublicCoachProfile = Pick<
  CoachProfileInput,
  'displayName' | 'bio' | 'phone' | 'email'
>;

export type CoachProfile = CoachProfileInput & {
  userId: string;
  updatedAt: string;
};

export type CoachProfileResult =
  | { ok: true; data: CoachProfile | null }
  | { ok: false };

export type PublicCoachProfileResult =
  | { ok: true; data: PublicCoachProfile | null }
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

function mapPublicCoachProfile(row: PublicCoachProfileRow): PublicCoachProfile {
  return {
    displayName: row.display_name,
    bio: row.bio,
    phone: row.phone,
    email: row.email,
  };
}

export async function getPublicCoachProfile(): Promise<PublicCoachProfileResult> {
  if (!supabase) return { ok: false };

  const { data, error } = await supabase.rpc('get_public_coach_profile');

  if (error) return { ok: false };
  const profile = data[0];
  return { ok: true, data: profile ? mapPublicCoachProfile(profile) : null };
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
