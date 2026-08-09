import type { ButtonIcon } from '@/components/ui/button';

export const planningControlIcons = {
  agenda: { ios: 'calendar', android: 'calendar_month', web: 'calendar_month' },
  list: { ios: 'list.bullet', android: 'list', web: 'list' },
  previous: { ios: 'arrow.left', android: 'arrow_back', web: 'arrow_back' },
  next: { ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' },
} satisfies Record<'agenda' | 'list' | 'previous' | 'next', ButtonIcon>;
