---
title: 'Étendre les filtres élèves par sexe et plage d’âge'
type: 'feature'
created: '2026-06-22'
status: 'done'
baseline_commit: '4e2be31b030664066e28b7647b5bd073bbd51ee9'
context:
  - '{project-root}/_bmad-output/implementation-artifacts/2-2-consulter-et-filtrer-la-liste-des-eleves.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Le profil élève ne contient actuellement aucun champ de sexe et le filtre d’âge repose sur une longue liste de tranches peu ergonomique.

**Approach:** Ajouter une valeur de sexe contrôlée au profil élève et au filtre coach. Remplacer les tranches d’âge par un slider à deux poignées permettant de régler directement l’âge minimum et maximum.

## Boundaries & Constraints

**Always:** Utiliser les valeurs fermées `female`, `male`, `other`, `not_specified`; traduire les libellés FR/EN/ES; préserver les politiques RLS existantes; appliquer une migration locale non destructive; utiliser un slider unique à deux poignées de 5 à 100 ans avec pas de 1; afficher les valeurs minimum et maximum sélectionnées; permettre la réinitialisation de tous les filtres.

**Ask First:** Toute autre liste de valeurs, rendre la donnée visible publiquement, modifier les permissions d’accès aux profils, ou remplacer le slider à deux poignées par deux contrôles séparés.

**Never:** Déduire le sexe depuis le nom, rendre la donnée anonyme/publique, supprimer ou réinitialiser les profils existants, réintroduire la liste de tranches d’âge.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Profil existant | Migration sans valeur connue | `not_specified` est appliqué | Aucune perte de profil |
| Modification élève | Valeur de la liste fermée | Valeur persistée et rechargée | Zod et PostgreSQL refusent les autres valeurs |
| Filtre coach | Sexe sélectionné | Seuls les élèves associés correspondants restent visibles | État vide si aucun résultat |
| Plage d’âge | Poignées positionnées sur 18 et 45 | Seuls les élèves âgés de 18 à 45 ans inclus apparaissent | Les poignées ne peuvent pas se croiser ni sortir de 5–100 |
| Plage complète | Slider sur 5–100 | Aucun filtrage par âge | N/A |
| Réinitialisation | Filtres sexe et âge actifs | Sexe revient à tous, slider revient à 5–100 | N/A |
| Accès non autorisé | Élève consultant ses pairs | Aucun profil tiers exposé | RLS conserve le refus |

</frozen-after-approval>

## Code Map

- `supabase/migrations/0008_student_profile_sex.sql` -- enum et colonne avec valeur sûre pour les profils existants.
- `packages/shared/src/contracts/student-profile.ts` -- validation et mapping du champ.
- `apps/mobile/src/app/eleve/account.tsx` -- saisie/modification côté élève.
- `apps/mobile/src/features/students/student-profile-service.ts` -- persistance et lecture.
- `apps/mobile/src/features/students/student-coach-service.ts` -- read model de la liste coach.
- `apps/mobile/src/features/students/student-list-filters.ts` -- filtres sexe et bornes min/max combinables.
- `apps/mobile/src/features/students/student-age-range-slider.tsx` -- slider à deux poignées compatible mobile/Web.
- `apps/mobile/src/app/coach/students.tsx` -- contrôles sexe et plage d’âge.
- `apps/mobile/package.json` -- dépendance `@react-native-assets/slider`.
- `apps/mobile/src/i18n/translations.ts` -- libellés FR/EN/ES.

## Tasks & Acceptance

**Execution:**
- [x] Ajouter l’enum et la colonne Supabase avec défaut `not_specified`, puis régénérer les types.
- [x] Étendre le contrat Zod, les tests et le service de profil élève.
- [x] Ajouter le sélecteur au formulaire élève et restaurer sa valeur au chargement.
- [x] Installer le slider de plage compatible Expo/Web et construire le contrôle min/max accessible.
- [x] Étendre le read model, remplacer les tranches par les bornes min/max, ajouter le filtre sexe et mettre à jour l’écran coach.
- [x] Adapter les fixtures d’intégration et exécuter typecheck, lint, tests SQL et Supabase.

**Acceptance Criteria:**
- Given un profil existant, when la migration est appliquée, then le profil est conservé avec `Préfère ne pas répondre`.
- Given un élève, when il sauvegarde son sexe, then la valeur reste visible après rechargement.
- Given la liste coach, when un sexe est sélectionné, then seuls les élèves associés correspondants apparaissent.
- Given le slider d’âge, when le coach déplace les deux poignées, then seuls les élèves compris entre les bornes inclusives apparaissent.
- Given le slider, when le coach utilise mobile ou Web, then les poignées restent utilisables, ordonnées et limitées à 5–100.
- Given des filtres actifs, when ils sont réinitialisés, then le sexe revient à tous et la plage d’âge à 5–100.
- Given un utilisateur non coach, when il tente de lister les profils, then la RLS ne lui expose aucun pair.

## Verification

**Commands:**
- `npm run typecheck`
- `npm run lint`
- `npm test`
- `npm run supabase:test:db`
- `npm run test:student-profiles`
- `npm run test:student-list-access`
- `npx expo export --platform web`

## Suggested Review Order

**Parcours coach**

- Point d’entrée réunissant sexe, plage d’âge et réinitialisation.
  [`students.tsx:64`](../../apps/mobile/src/app/coach/students.tsx#L64)

- Slider contrôlé, borné et utilisable sur mobile comme sur Web.
  [`student-age-range-slider.tsx:12`](../../apps/mobile/src/features/students/student-age-range-slider.tsx#L12)

- Prédicat pur combinant recherche, niveau, âge inclusif et sexe.
  [`student-list-filters.ts:28`](../../apps/mobile/src/features/students/student-list-filters.ts#L28)

**Profil et persistance**

- Formulaire élève initialisant, restaurant et sauvegardant la valeur.
  [`account.tsx:46`](../../apps/mobile/src/app/eleve/account.tsx#L46)

- Contrat partagé imposant la liste fermée avant persistance.
  [`student-profile.ts:7`](../../packages/shared/src/contracts/student-profile.ts#L7)

- Migration non destructive protégeant les profils existants.
  [`0008_student_profile_sex.sql:1`](../../supabase/migrations/0008_student_profile_sex.sql#L1)

- Service de profil transmettant le champ validé à Supabase.
  [`student-profile-service.ts:47`](../../apps/mobile/src/features/students/student-profile-service.ts#L47)

**Lecture privée et vérification**

- Read model coach limité aux profils associés autorisés par RLS.
  [`student-coach-service.ts:74`](../../apps/mobile/src/features/students/student-coach-service.ts#L74)

- Tests unitaires couvrant combinaison et bornes inclusives.
  [`student-list-filters.test.ts:1`](../../apps/mobile/src/features/students/student-list-filters.test.ts#L1)

- Tests SQL vérifiant enum, colonne et défaut sécurisé.
  [`0003_student_profiles.sql:1`](../../supabase/tests/database/0003_student_profiles.sql#L1)
