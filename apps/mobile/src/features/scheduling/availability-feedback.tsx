import { Feedback } from '@/components/ui/feedback';
import type { AvailabilityFeedback as AvailabilityFeedbackValue } from '@/features/scheduling/use-availability-management';
import { useTranslation, type TranslationKey } from '@/i18n';

type FeedbackTone = 'error' | 'success' | 'warning';

const copyByFeedback: Record<
  Exclude<AvailabilityFeedbackValue, 'none'>,
  { body: TranslationKey; title: TranslationKey; tone: FeedbackTone }
> = {
  saved: {
    body: 'availability.saveSuccessBody',
    title: 'availability.saveSuccessTitle',
    tone: 'success',
  },
  updated: {
    body: 'availability.updateSuccessBody',
    title: 'availability.updateSuccessTitle',
    tone: 'success',
  },
  deleted: {
    body: 'availability.deleteSuccessBody',
    title: 'availability.deleteSuccessTitle',
    tone: 'success',
  },
  conflict: {
    body: 'availability.conflictBody',
    title: 'availability.conflictTitle',
    tone: 'warning',
  },
  blocked: {
    body: 'availability.blockedBody',
    title: 'availability.blockedTitle',
    tone: 'warning',
  },
  forbidden: {
    body: 'availability.forbiddenBody',
    title: 'availability.forbiddenTitle',
    tone: 'error',
  },
  error: {
    body: 'availability.saveErrorBody',
    title: 'availability.saveErrorTitle',
    tone: 'error',
  },
};

export function AvailabilityFeedback({
  value,
}: {
  value: AvailabilityFeedbackValue;
}) {
  const { t } = useTranslation();

  if (value === 'none') return null;

  const copy = copyByFeedback[value];
  return <Feedback message={t(copy.body)} title={t(copy.title)} tone={copy.tone} />;
}
