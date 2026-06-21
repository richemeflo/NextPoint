import { useEffect } from 'react';

import { getCoachProfile } from '@/features/coaches/coach-profile-service';
import { useAuth } from '@/features/auth/auth-context';
import { getStudentProfile } from '@/features/students/student-profile-service';
import { useTranslation } from '@/i18n';

export function ProfileLocaleSync() {
  const { role, status, user } = useAuth();
  const { setLocale } = useTranslation();

  useEffect(() => {
    if (status !== 'authenticated' || !role || !user) return;

    let active = true;
    const profileRequest =
      role === 'coach' ? getCoachProfile(user.id) : getStudentProfile(user.id);

    void profileRequest.then((result) => {
      if (active && result.ok && result.data) {
        setLocale(result.data.preferredLanguage);
      }
    });

    return () => {
      active = false;
    };
  }, [role, setLocale, status, user]);

  return null;
}
