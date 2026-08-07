---
title: 'Réserver librement dans une plage de disponibilité coach'
type: 'feature'
created: '2026-08-07'
status: 'done'
baseline_commit: '2328c2985a543105def98d538172fb49dcf548de'
context:
  - '{project-root}/_bmad-output/planning-artifacts/architecture.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Les « plages » coach sont actuellement réduites à un unique créneau de 60 ou 90 minutes décidé par le coach. L’élève ne peut donc pas placer son propre cours dans une disponibilité continue.

**Approach:** Le coach publie une vraie plage avec début, fin et lieu. Un clic élève ouvre le formulaire existant, préremplit l’heure visée (ou l’heure disponible la plus proche), puis l’élève choisit 60 ou 90 minutes; seules les réservations confirmées et les cours créés par le coach retirent les portions horaires concernées.

## Boundaries & Constraints

**Always:** Un sous-créneau tient entièrement dans une occurrence et dure 60 ou 90 minutes. Un clic à 15 h propose 15 h si possible, sinon le départ réalisable le plus proche. Les `pending` peuvent se chevaucher, avec deux demandes maximum aux bornes identiques; une confirmation refuse atomiquement tous les `pending` qui la chevauchent. Une occupation ne retire que sa portion: 14 h–18 h occupée de 15 h à 16 h laisse 14 h–15 h et 16 h–18 h demandables. Lieu hérité de la plage, récurrences et fuseau Europe/Paris sont conservés.

**Ask First:** Changer les durées 60/90, la limite de deux demandes identiques, la liste de lieux, ou empêcher le coach de créer un cours à l’horaire de son choix.

**Never:** Bloquer un cours coach, même hors disponibilité ou en chevauchement. Exposer les réservations d’autrui, traiter un `pending` comme une occupation, ou perdre réservations/historique existants.

## I/O & Edge-Case Matrix

| Scénario | Entrée / état | Résultat attendu | Gestion d’erreur |
|----------|----------------|------------------|------------------|
| Heure exacte libre | Clic 15 h, durée 60, plage 14 h–18 h | Formulaire prérempli 15 h–16 h | N/A |
| Heure occupée | Clic 15 h, occupation 15 h–16 h | Départ libre le plus proche; à égalité, préférer l’heure suivante | Message si aucun intervalle ne tient |
| Demandes | Deux `pending` identiques ou chevauchants | Autorisés; troisième identique refusé | Codes stables et traduits |
| Occupation | Confirmation ou cours coach 15 h–16 h dans 14 h–18 h | `pending` chevauchants refusés; fragments libres affichés | Revalidation serveur |

</frozen-after-approval>

## Code Map

- `supabase/migrations/0034_student_selected_availability.sql` -- occurrences continues, lecture anonymisée et RPC atomiques.
- `supabase/tests/database/0016_student_selected_availability.sql` -- invariants et concurrence.
- `packages/shared/src/contracts/availability-range.ts`, `packages/shared/src/contracts/booking.ts` -- contrats et départ libre le plus proche.
- `apps/mobile/src/features/scheduling/availability-service.ts` -- lecture des occurrences et occupations.
- `apps/mobile/src/features/scheduling/agenda-grid.tsx`, `apps/mobile/src/features/scheduling/student-agenda.tsx` -- clic horaire et modal élève.
- `apps/mobile/src/app/coach/availability.tsx` -- formulaire de plage continue.
- `apps/mobile/src/features/bookings/booking-service.ts` -- nouvelle commande de demande.
- `apps/mobile/src/i18n/translations.ts` -- textes FR/EN/ES.

## Tasks & Acceptance

**Execution:**
- [x] `supabase/migrations/0034_student_selected_availability.sql`, `supabase/tests/database/0016_student_selected_availability.sql` -- migrer sans perte et garantir inclusion, limites et chevauchements.
- [x] `packages/shared/src/contracts/availability-range.ts`, `packages/shared/src/contracts/availability-range.test.ts`, `packages/shared/src/contracts/booking.ts`, `packages/shared/src/contracts/booking.test.ts` -- adapter contrats et tester le départ le plus proche.
- [x] `apps/mobile/src/features/scheduling/availability-service.ts`, `apps/mobile/src/features/scheduling/agenda-grid.tsx`, `apps/mobile/src/features/scheduling/student-agenda.tsx`, `apps/mobile/src/features/bookings/booking-service.ts` -- brancher read model, clic et modal.
- [x] `apps/mobile/src/app/coach/availability.tsx`, `apps/mobile/src/i18n/translations.ts`, `packages/shared/src/types/database.types.ts` -- adapter le coach, traduire et régénérer les types.

**Acceptance Criteria:**
- Given une plage coach valide, when elle est enregistrée, then chaque occurrence apparaît continue, avec fin et lieu, sans prédécoupage.
- Given un élève associé, when il clique dans une plage, then le modal existant s’ouvre sur l’heure libre exacte ou la solution la plus proche et permet 60/90 minutes.
- Given une occupation confirmée, when les disponibilités sont relues, then son intersection disparaît mais chaque fragment assez long reste proposé.
- Given des mutations concurrentes, when une demande est créée ou confirmée, then le serveur revalide inclusion, limite exacte et chevauchements sans dépendre de l’état UI.
- Given un cours coach hors plage ou déjà occupé, when il est créé, then il reste accepté et bloque les nouvelles demandes élèves sur sa période.

## Design Notes

Conserver `availability_slots` comme occurrence technique protège les réservations existantes; la durée du cours reste dans `bookings`. Le client préremplit, le serveur revalide. À distance égale, proposer l’heure suivante.

## Verification

**Commands:**
- `npm test && npm run typecheck && npm run lint` -- tests, compilation et lint passent.
- `npm run supabase:test:db && npm run test:availability-ranges` -- invariants SQL/RLS et parcours Supabase passent.

**Manual checks:**
- Sur web et mobile, créer une plage 14 h–18 h, cliquer 15 h, demander 60/90 minutes, confirmer puis vérifier les fragments restants et la création coach libre.

## Suggested Review Order

**Modèle transactionnel**

- Point d’entrée : migration sûre des anciens créneaux vers des occurrences continues.
  [`0034_student_selected_availability.sql:28`](../../supabase/migrations/0034_student_selected_availability.sql#L28)

- Le read model expose uniquement des bornes occupées aux élèves associés.
  [`0034_student_selected_availability.sql:316`](../../supabase/migrations/0034_student_selected_availability.sql#L316)

- La demande revalide durée, inclusion, passé, limites et chevauchements sous verrou.
  [`0034_student_selected_availability.sql:391`](../../supabase/migrations/0034_student_selected_availability.sql#L391)

- L’approbation ordonne les verrous puis refuse atomiquement tous les chevauchements pending.
  [`0034_student_selected_availability.sql:519`](../../supabase/migrations/0034_student_selected_availability.sql#L519)

- Un cours coach reste libre tout en retirant sa période côté élèves.
  [`0034_student_selected_availability.sql:651`](../../supabase/migrations/0034_student_selected_availability.sql#L651)

**Sélection élève**

- Ces helpers soustraient les occupations et choisissent le départ réalisable le plus proche.
  [`availability-range.ts:273`](../../packages/shared/src/contracts/availability-range.ts#L273)

- Le service décode les occupations en échec fermé puis produit les fragments triés.
  [`availability-service.ts:176`](../../apps/mobile/src/features/scheduling/availability-service.ts#L176)

- Le clic agenda traduit précisément la position visible en minute souhaitée.
  [`agenda-grid.tsx:43`](../../apps/mobile/src/features/scheduling/agenda-grid.tsx#L43)

- Le modal recalcule la proposition lors du passage entre 60 et 90 minutes.
  [`student-agenda.tsx:342`](../../apps/mobile/src/features/scheduling/student-agenda.tsx#L342)

- La commande client valide son contrat avant la mutation serveur.
  [`booking-service.ts:229`](../../apps/mobile/src/features/bookings/booking-service.ts#L229)

**Gestion coach**

- Le formulaire crée désormais une vraie plage avec début, fin, lieu et récurrence.
  [`availability.tsx:79`](../../apps/mobile/src/app/coach/availability.tsx#L79)

**Preuves et périphériques**

- pgTAP couvre confidentialité, fragments, limites, édition et ordre des verrous.
  [`0016_student_selected_availability.sql:3`](../../supabase/tests/database/0016_student_selected_availability.sql#L3)

- L’intégration exerce deux approbations réellement concurrentes sans deadlock.
  [`verify-availability-ranges.mjs:507`](../../scripts/verify-availability-ranges.mjs#L507)

- Les textes du nouveau parcours existent en français, anglais et espagnol.
  [`translations.ts:360`](../../apps/mobile/src/i18n/translations.ts#L360)
