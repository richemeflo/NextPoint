---
title: 'Supprimer l’heure de fin de la création de disponibilité'
type: 'feature'
created: '2026-08-05'
status: 'done'
baseline_commit: 'cd78066fbf2620220cbd53e6f5734ba9635eaf78'
context:
  - '{project-root}/apps/mobile/AGENTS.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Le formulaire « Nouvelle plage » demande une heure de fin alors que le coach choisit déjà une heure de début et une durée de créneau. Cette saisie redondante alourdit l’écran et autorise des combinaisons incohérentes.

**Approach:** Retirer uniquement le champ « Heure de fin » du formulaire de création et calculer automatiquement la fin comme `heure de début + durée sélectionnée`. Conserver la valeur technique `endsAtLocalTime` attendue par le contrat et le backend afin de limiter le changement à la frontière UI.

## Boundaries & Constraints

**Always:** La création doit produire exactement un créneau dont la fin correspond à la durée choisie ; l’aperçu et la requête Supabase doivent utiliser la même fin calculée ; les durées restent limitées à 60 et 90 minutes ; les conversions UTC existantes restent la source de vérité ; le champ de modification d’un créneau existant reste inchangé.

**Ask First:** Toute modification du modèle Supabase, des RPC, du contrat public `AvailabilityRangeInput` ou du comportement de modification/suppression des créneaux.

**Never:** Supprimer `endsAt` des données persistées ; laisser la valeur cachée figée à `20:00` ; modifier la récurrence, le lieu, les réservations ou les autres écrans.

## I/O & Edge-Case Matrix

| Scénario | Entrée / état | Résultat attendu | Gestion d’erreur |
|----------|----------------|------------------|------------------|
| Créneau 1 h | Début `16:00`, durée `60` | Fin technique `17:00`, un seul créneau aperçu et créé | N/A |
| Créneau 1 h 30 | Début `16:00`, durée `90` | Fin technique `17:30`, un seul créneau aperçu et créé | N/A |
| Changement de durée | Début `16:00`, passage de `60` à `90` | Fin recalculée de `17:00` à `17:30` avant soumission | N/A |
| Heure invalide | Début non conforme à `HH:mm` | Aucune création | Validation existante affichée |
| Dépassement de minuit | Début et durée produisant une fin le lendemain | Aucune création dans le contrat actuel limité à une date | Validation de plage incohérente existante |

</frozen-after-approval>

## Code Map

- `apps/mobile/src/app/coach/availability.tsx` -- formulaire de création, synchronisation des champs React Hook Form, aperçu et soumission.
- `packages/shared/src/contracts/availability-range.ts` -- fonction pure de calcul de l’heure de fin locale et contrat de conversion UTC.
- `packages/shared/src/contracts/availability-range.test.ts` -- tests des durées, conversions et cas limites du calcul.
- `apps/mobile/src/i18n/translations.ts` -- le libellé de fin reste nécessaire au panneau de modification ; aucune suppression prévue.

## Tasks & Acceptance

**Execution:**
- [x] `packages/shared/src/contracts/availability-range.ts` -- ajouter un calcul pur et validable de la fin locale à partir du début et de la durée, sans changer les contrats persistés.
- [x] `packages/shared/src/contracts/availability-range.test.ts` -- couvrir les calculs 60/90 minutes, changement de durée, entrée invalide et dépassement de minuit.
- [x] `apps/mobile/src/app/coach/availability.tsx` -- retirer le contrôleur visible `endsAtLocalTime` de la création et synchroniser sa valeur cachée avec le calcul ; ne pas toucher au panneau d’édition.

**Acceptance Criteria:**
- Given le formulaire « Nouvelle plage », when il est affiché, then aucun champ « Heure de fin » n’apparaît dans la section de création.
- Given une heure de début valide et une durée sélectionnée, when l’aperçu ou la soumission est évalué, then la fin vaut exactement le début plus la durée et un seul créneau est produit.
- Given le panneau de modification d’un créneau existant, when il est ouvert, then son champ d’heure de fin reste disponible.
- Given le dépôt après modification, when les tests ciblés, le typecheck et le lint sont exécutés, then ils réussissent.

## Spec Change Log

- 2026-08-05 : implémentation terminée ; tests ciblés et typecheck réussis, lint interrompu sans sortie après plus de deux minutes.
- 2026-08-05 : revue — correction de l’erreur invisible au dépassement de minuit et calcul rendu sûr lors des changements d’heure ; conservation du champ de fin dans l’édition et des contrats persistés.
- 2026-08-05 : vérification finale réussie — 16 tests ciblés, typecheck complet et lint complet passent.

## Verification

**Commands:**
- `npm exec tsx -- --test packages/shared/src/contracts/availability-range.test.ts` -- tous les tests du contrat de disponibilité passent.
- `npm run typecheck` -- aucune erreur TypeScript.
- `npm run lint` -- aucune erreur de lint.

**Manual checks (if no CLI):**
- Sur `/coach/availability`, vérifier que la création affiche Date, Heure de début et Durée sans Heure de fin, puis que l’aperçu montre exactement un créneau de la durée choisie.

## Suggested Review Order

**Liaison du formulaire**

- Dérive la fin cachée de la date, du début et de la durée.
  [`availability.tsx:118`](../../apps/mobile/src/app/coach/availability.tsx#L118)

- Rend visible l’erreur lorsque la fin calculée est impossible.
  [`availability.tsx:479`](../../apps/mobile/src/app/coach/availability.tsx#L479)

- Préserve explicitement la modification manuelle des créneaux existants.
  [`availability.tsx:728`](../../apps/mobile/src/app/coach/availability.tsx#L728)

**Calcul temporel**

- Calcule une durée réelle, refuse minuit et les heures locales ambiguës.
  [`availability-range.ts:127`](../../packages/shared/src/contracts/availability-range.ts#L127)

- Expose le helper à l’application sans modifier le contrat persistant.
  [`index.ts:10`](../../packages/shared/src/index.ts#L10)

**Couverture**

- Vérifie 60/90 minutes, valeurs invalides et dépassement de minuit.
  [`availability-range.test.ts:26`](../../packages/shared/src/contracts/availability-range.test.ts#L26)

- Prouve qu’un changement d’heure produit exactement un seul créneau.
  [`availability-range.test.ts:106`](../../packages/shared/src/contracts/availability-range.test.ts#L106)
