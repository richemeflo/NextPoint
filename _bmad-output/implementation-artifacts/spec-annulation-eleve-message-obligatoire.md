---
title: 'Permettre à l’élève d’annuler avec un message obligatoire'
type: 'feature'
created: '2026-08-05'
status: 'done'
baseline_commit: '9d0c75d48250df1484c74043e46c3d9f989f73d5'
context:
  - '{project-root}/apps/mobile/AGENTS.md'
  - '{project-root}/_bmad-output/implementation-artifacts/4-10-annuler-ou-modifier-une-reservation-confirmee.md'
  - '{project-root}/_bmad-output/implementation-artifacts/4-11-consulter-les-demandes-et-reservations-cote-eleve.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** L’élève ne peut pas annuler une demande en attente et ne trouve l’annulation d’un cours confirmé que dans la vue liste. L’action actuelle est immédiate et ne recueille aucun message, alors qu’un motif doit obligatoirement être transmis au coach.

**Approach:** Fournir le même parcours d’annulation depuis les vues agenda et liste pour toute demande `pending` ou réservation `confirmed|modified` future. Une saisie non vide de 500 caractères maximum est obligatoire côté UI et serveur ; l’unique commande transactionnelle annule puis publie le motif au coach dans la notification, l’historique élève et le fil de messagerie existant.

## Boundaries & Constraints

**Always:** Seul l’élève propriétaire peut annuler sa demande/réservation ; le cours doit être futur ; le message est trimé, non vide et limité à 500 caractères ; `pending` n’altère pas un créneau qu’il n’a pas réservé ; `confirmed|modified` libère les ressources selon les règles existantes ; l’annulation, l’historique, la notification et le message coach sont atomiques ; l’élément annulé reste consultable avec son statut.

**Ask First:** Rendre le motif obligatoire pour une annulation effectuée par le coach ; autoriser une annulation après le début ; ajouter une nouvelle colonne persistée au booking ; modifier les règles de remboursement ou de pack.

**Never:** Effectuer un `update` direct depuis le client ; appeler séparément une commande de messagerie après l’annulation ; ouvrir `send_coach_message` aux élèves ; permettre un contournement serveur avec un message blanc ; dupliquer le flux entre agenda et liste.

## I/O & Edge-Case Matrix

| Scénario | Entrée / état | Résultat attendu | Gestion d’erreur |
|---|---|---|---|
| Demande future | `pending`, élève propriétaire, motif valide | Statut `cancelled`, aucune ressource libérée, coach informé du motif | N/A |
| Cours futur | `confirmed|modified`, élève propriétaire, motif valide | Statut `cancelled`, ressource libérée, coach informé du motif | N/A |
| Motif blanc | espaces uniquement | Aucune mutation | Erreur traduite et confirmation désactivée |
| Motif trop long | plus de 500 caractères | Aucune mutation | Erreur traduite avec limite visible |
| Cours commencé | début passé ou présent | Aucun changement | Erreur `past_booking` existante |
| Mauvais élève | booking d’un autre élève | Aucun changement | Refus serveur sans fuite de données |
| Annulation répétée | booking déjà annulé/refusé/expiré | Aucun nouvel événement/message | Erreur d’état existante |

</frozen-after-approval>

## Code Map

- `apps/mobile/src/features/scheduling/student-agenda.tsx` -- vues agenda/liste, éligibilité, panneau de motif et rafraîchissement après annulation.
- `packages/shared/src/contracts/booking.ts` -- schéma du message d’annulation et règle d’éligibilité `pending|confirmed|modified`.
- `apps/mobile/src/features/bookings/booking-service.ts` -- appel typé de l’unique RPC d’annulation.
- `supabase/migrations/0023_notifications.sql` -- dernière définition actuelle de `cancel_booking`; ne pas la modifier rétroactivement.
- `supabase/migrations/0026_student_cancellation_message.sql` -- nouvelle définition transactionnelle et suppression de l’ancienne signature.
- `supabase/migrations/0024_coach_messaging.sql` -- thread/message existant à réutiliser dans la transaction.
- `apps/mobile/src/i18n/translations.ts` -- libellés et validations FR/EN/ES.
- `packages/shared/src/types/database.types.ts` -- signature RPC régénérée.

## Tasks & Acceptance

**Execution:**
- [x] `packages/shared/src/contracts/booking.ts`, `booking.test.ts`, `packages/shared/src/index.ts` -- ajouter le contrat d’annulation élève et couvrir statuts, trim et bornes 500/501.
- [x] `supabase/migrations/0026_student_cancellation_message.sql` -- étendre `cancel_booking` atomiquement, exiger le motif pour l’élève et réutiliser notifications, historique et thread coach.
- [x] `supabase/tests/database/0013_notifications.sql`, `0014_coach_messaging.sql` -- adapter la signature et tester pending/confirmed, autorisations, temps, validation, ressources et visibilité du motif.
- [x] `apps/mobile/src/features/bookings/booking-service.ts`, `packages/shared/src/types/database.types.ts` -- transmettre le motif et conserver le mapping d’erreurs.
- [x] `apps/mobile/src/features/scheduling/student-agenda.tsx`, `apps/mobile/src/i18n/translations.ts` -- exposer un panneau partagé agenda/liste, bloquer les saisies invalides et garder l’annulation visible après succès.

**Acceptance Criteria:**
- Given une demande ou réservation future annulable, when l’élève agit depuis l’agenda ou la liste, then le même formulaire de motif obligatoire est affiché.
- Given un motif valide, when l’élève confirme, then la commande serveur annule atomiquement et le coach voit le motif dans notification, historique et messagerie.
- Given une demande `pending`, when elle est annulée, then aucune place ni plage non réservée n’est modifiée.
- Given une annulation réussie, when les données sont rafraîchies, then l’élève voit l’élément au statut annulé et ne peut pas recommencer.
- Given une entrée invalide ou une règle serveur refusée, when la confirmation est tentée, then aucune mutation partielle n’existe et une erreur traduite est visible.

## Spec Change Log

## Design Notes

La migration remplace la signature appelable publiquement au lieu de conserver une surcharge sans motif. Le paramètre peut rester optionnel pour préserver l’annulation coach, mais la branche serveur `actor_role = 'eleve'` impose toujours un motif valide. L’insertion directe dans `coach_messages` est interne à la transaction et s’appuie sur le thread déjà créé pour le booking.

## Verification

**Commands:**
- `npm exec tsx -- --test packages/shared/src/contracts/booking.test.ts` -- contrat et règles passent.
- `npm run supabase:test:db` -- RPC, RLS, historique, notification et messagerie passent.
- `npm run supabase:types` puis `npm run typecheck` -- types synchronisés sans erreur.
- `npm run lint` -- lint sans erreur.

**Manual checks (if no CLI):**
- Depuis `/eleve/planning`, vérifier agenda et liste avec une demande pending et un cours confirmé futur ; le coach doit retrouver exactement le motif saisi.

## Suggested Review Order

**Parcours élève**

- Le modal partagé orchestre validation, soumission unique, mise à jour locale et rafraîchissement.
  [student-agenda.tsx:431](../../apps/mobile/src/features/scheduling/student-agenda.tsx#L431)

- Agenda et liste ouvrent le même flux sans dupliquer la logique.
  [student-agenda.tsx:809](../../apps/mobile/src/features/scheduling/student-agenda.tsx#L809)

- Le service transmet le motif à l’unique commande serveur typée.
  [booking-service.ts:361](../../apps/mobile/src/features/bookings/booking-service.ts#L361)

**Contrat et transaction**

- Le contrat partagé normalise le motif et compte correctement les caractères Unicode.
  [booking.ts:80](../../packages/shared/src/contracts/booking.ts#L80)

- La règle métier autorise l’élève sur `pending`, `confirmed` et `modified` futurs.
  [booking.ts:152](../../packages/shared/src/contracts/booking.ts#L152)

- La RPC verrouille, contrôle puis publie atomiquement motif, historique et notification.
  [0026_student_cancellation_message.sql:4](../../supabase/migrations/0026_student_cancellation_message.sql#L4)

**Présentation et garanties**

- Les trois langues expliquent le motif obligatoire et le succès spécifique élève.
  [translations.ts:594](../../apps/mobile/src/i18n/translations.ts#L594)

- Les tests SQL couvrent blancs, omission, droits, ressources et trois visibilités coach.
  [0014_coach_messaging.sql:386](../../supabase/tests/database/0014_coach_messaging.sql#L386)

- Les tests partagés verrouillent trim et bornes 500/501, y compris les emojis.
  [booking.test.ts:139](../../packages/shared/src/contracts/booking.test.ts#L139)

- La signature générée conserve l’appel coach optionnel sans ouvrir de contournement élève.
  [database.types.ts:891](../../packages/shared/src/types/database.types.ts#L891)
