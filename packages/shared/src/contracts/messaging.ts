import { z } from 'zod';

import type { AppRole } from '../domain/roles';

export const messageBodyMaxLength = 1000;

export const coachMessageReplySchema = z.object({
  threadId: z.uuid(),
  body: z.string().trim().min(1).max(messageBodyMaxLength),
});

export type CoachMessageReplyInput = z.infer<typeof coachMessageReplySchema>;

export type CoachMessageThreadAccessCandidate = {
  actorId: string;
  actorRole: AppRole;
  coachId: string;
  contextAccessible: boolean;
};

export type CoachMessageThreadReadCandidate = {
  coachReadAt: string | null;
  lastMessageAt: string;
};

export function canAccessCoachMessageThread(
  candidate: CoachMessageThreadAccessCandidate
) {
  return (
    candidate.actorRole === 'coach' &&
    candidate.actorId === candidate.coachId &&
    candidate.contextAccessible
  );
}

export function isCoachMessageThreadUnread(
  candidate: CoachMessageThreadReadCandidate
) {
  return (
    candidate.coachReadAt === null ||
    new Date(candidate.lastMessageAt).getTime() >
      new Date(candidate.coachReadAt).getTime()
  );
}
