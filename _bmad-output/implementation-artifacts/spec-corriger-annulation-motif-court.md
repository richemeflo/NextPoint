---
title: 'Corriger l’annulation avec un motif court'
type: 'bugfix'
created: '2026-08-05'
status: 'done'
baseline_commit: '9c7975a423addceb5b98cd4f5777588a0da18363'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/spec-annulation-eleve-message-obligatoire.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Un motif d’annulation d’un caractère, par exemple `"a"`, respecte le contrat non vide mais fait échouer la transaction sur `student_history_events_description_check`, qui exige encore deux caractères. Le code SQL `23514` est ensuite traduit à tort en limite de demandes en attente.

**Approach:** Aligner la contrainte d’historique sur la règle approuvée de 1 à 500 caractères et rendre le mapping client de `23514` dépendant du message réel. Verrouiller le scénario exact dans les tests du contrat, de la transaction et du mapping d’erreur.

## Boundaries & Constraints

**Always:** Le motif reste trimé, non blanc et limité à 500 caractères ; `"a"` doit annuler atomiquement puis apparaître exactement comme `"a"` dans l’historique, la notification et la messagerie coach ; une véritable limite de demandes conserve son message actuel.

**Ask First:** Relever la longueur minimale au-delà d’un caractère ; modifier les titres ou descriptions des autres événements d’historique ; changer les règles d’annulation définies dans la spec d’origine.

**Never:** Modifier rétroactivement les migrations 0010 ou 0026 déjà appliquées ; préfixer artificiellement le motif pour contourner la contrainte ; masquer toute violation `23514` sous l’erreur de limite de demandes.

## I/O & Edge-Case Matrix

| Scénario | Entrée / état | Résultat attendu | Gestion d’erreur |
|---|---|---|---|
| Motif minimal | `"a"` | Annulation atomique ; `"a"` visible dans les trois canaux coach | N/A |
| Motif minimal entouré | `"  a  "` | Même résultat avec valeur normalisée `"a"` | N/A |
| Limite pending réelle | `23514`, message `pending limit reached` | Message de limite existant | `pending_limit_reached` |
| Autre contrainte CHECK | `23514`, autre message | Pas de faux diagnostic de limite | `invalid_input` |

</frozen-after-approval>

## Code Map

- `supabase/migrations/0010_student_detail_history.sql` -- contrainte historique actuelle 2–500, référence uniquement.
- `supabase/migrations/0027_allow_single_character_history_description.sql` -- relaxation additive vers 1–500.
- `supabase/tests/database/0014_coach_messaging.sql` -- scénario transactionnel et trois visibilités du motif.
- `packages/shared/src/contracts/booking.test.ts` -- borne minimale publique du motif.
- `apps/mobile/src/features/bookings/booking-error.ts` -- mapping pur des erreurs de mutation.
- `apps/mobile/src/features/bookings/booking-service.ts` -- consommateur du mapping.
- `apps/mobile/src/features/bookings/booking-error.test.ts` -- régression du faux message `23514`.
- `package.json` -- inclusion du nouveau test pur dans la suite.

## Tasks & Acceptance

**Execution:**
- [x] `supabase/migrations/0027_allow_single_character_history_description.sql` -- remplacer la contrainte par une borne 1–500 sans autoriser le blanc.
- [x] `supabase/tests/database/0014_coach_messaging.sql` -- annuler avec `"  a  "` et vérifier exactement `"a"` dans historique, notification et messagerie.
- [x] `packages/shared/src/contracts/booking.test.ts` -- couvrir explicitement le motif minimal d’un caractère.
- [x] `apps/mobile/src/features/bookings/booking-error.ts`, `booking-service.ts`, `booking-error.test.ts`, `package.json` -- distinguer la limite pending des autres violations CHECK et tester le mapping.

**Acceptance Criteria:**
- Given un cours futur annulable, when l’élève confirme avec `"a"`, then la réservation est annulée sans violation SQL et le coach voit exactement ce motif dans les trois canaux.
- Given une violation CHECK sans rapport avec la limite pending, when le client reçoit `23514`, then il affiche l’erreur d’entrée invalide plutôt que la limite de demandes.
- Given une vraie limite pending, when le serveur renvoie `23514` avec son message métier, then le message de limite reste inchangé.

## Spec Change Log

## Design Notes

La nouvelle migration relaxe uniquement la longueur minimale de `description`. Les producteurs existants restent compatibles et `trim(description)` empêche toujours une valeur composée exclusivement d’espaces.

## Verification

**Commands:**
- `npm exec tsx -- --test packages/shared/src/contracts/booking.test.ts apps/mobile/src/features/bookings/booking-error.test.ts` -- bornes et mapping passent.
- `npx supabase test db supabase/tests/database/0014_coach_messaging.sql` -- scénario `"a"` atomique et visible.
- `npm run typecheck` -- types sans erreur.
- `npm run lint` -- lint sans erreur.

**Manual checks (if no CLI):**
- Depuis `/eleve/planning`, annuler avec `"a"` et vérifier le statut annulé sans alerte de limite pending.

## Suggested Review Order

**Cohérence des contraintes**

- La migration additive aligne l’historique sur la règle non vide 1–500.
  [0027_allow_single_character_history_description.sql:1](../../supabase/migrations/0027_allow_single_character_history_description.sql#L1)

- Le test transactionnel reproduit `"  a  "` puis vérifie exactement `"a"`.
  [0014_coach_messaging.sql:410](../../supabase/tests/database/0014_coach_messaging.sql#L410)

- Le contrat partagé verrouille explicitement la borne minimale d’un caractère.
  [booking.test.ts:149](../../packages/shared/src/contracts/booking.test.ts#L149)

**Diagnostic client**

- Le mapping distingue une vraie limite pending des autres contraintes CHECK.
  [booking-error.ts:14](../../apps/mobile/src/features/bookings/booking-error.ts#L14)

- Le service réutilise ce mapping pur pour toutes les mutations de réservation.
  [booking-service.ts:15](../../apps/mobile/src/features/bookings/booking-service.ts#L15)

- Les tests couvrent casse variable, contrainte historique et message absent.
  [booking-error.test.ts:6](../../apps/mobile/src/features/bookings/booking-error.test.ts#L6)

- La suite standard exécute désormais automatiquement la régression du mapping.
  [package.json:25](../../package.json#L25)
