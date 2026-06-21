import { useEffect } from 'react';

import { getStudentProfile } from './student-profile-service';

import { useAuth } from '@/features/auth/auth-context';
import { useTranslation } from '@/i18n';

export function StudentLocaleSync() {
  const { role, status, user } = useAuth();
  const { setLocale } = useTranslation();

  useEffect(() => {
    if (status !== 'authenticated' || role !== 'eleve' || !user) return;

    let active = true;

    void getStudentProfile(user.id).then((result) => {
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
