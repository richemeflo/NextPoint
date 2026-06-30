---
baseline_commit: db3a736cf15779dbcf2f764b627b214480e879d2
---

# Story 3.4: Modifier ou supprimer une disponibilité sans conflit

Status: review

<!-- Note: Validation optionnelle. Lancer validate-create-story pour controle qualite avant dev-story. -->

## Story

As a coach,
I want modifier ou supprimer une disponibilité uniquement quand cela ne crée pas de conflit,
so that mon planning reste fiable pour les élèves et les réservations.

## Acceptance Criteria

1. Given une plage ou un créneau sans demande active ni réservation confirmée When le coach modifie ses informations Then la modification est sauvegardée And les créneaux concernés sont mis à jour de façon cohérente.
2. Given une plage ou un créneau avec demande active ou réservation confirmée When le coach tente de modifier ou supprimer l’élément Then l’action est refusée ou limitée selon la règle métier applicable And le message explique clairement pourquoi la modification n’est pas disponible.
3. Given une occurrence issue d’une récurrence When le coach demande une modification Then la modification s’applique par défaut à l’occurrence sélectionnée And l’interface ne modifie pas silencieusement toute la série.
4. Given une modification d’occurrence qui peut aussi s’appliquer à la série récurrente When le coach valide la modification Then une popup demande s’il veut appliquer la modification à la récurrence And le choix du coach détermine si seule l’occurrence ou la série est mise à jour.
5. Given une modification qui ne peut pas être appliquée à toute la série When le coach modifie l’occurrence Then aucune option d’application à la récurrence n’est proposée And seule l’occurrence sélectionnée est modifiée.
6. Given une suppression autorisée When le coach confirme la suppression Then la plage ou le créneau concerné n’est plus visible comme disponible And les élèves ne peuvent plus le demander.

## Tasks / Subtasks

- [x] Verifier les preconditions et dependances de Story 3.4 (AC: tous)
  - [x] Relire les stories precedentes pertinentes et confirmer que leurs fichiers/contrats existent reellement.
  - [x] Identifier les fichiers UPDATE avant modification et les lire completement.
  - [x] Noter toute dependance manquante dans le Dev Agent Record avant de coder.
- [x] Implementer disponibilites/planning selon la story (AC: tous)
  - [x] Utiliser date/heure API en ISO 8601 UTC; timezone locale seulement a la frontiere UI.
  - [x] Garder durees 1h/1h30, lieu initial `Les Bruyeres Centre Sportif` et recurrence P0 limitee.
  - [x] Ne pas dupliquer les commandes de booking de l'Epic 4.
- [x] Tester conflits, recurrence et affichage (AC: integrite/UX)
  - [x] Couvrir modification/suppression sans demande active ni reservation confirmee selon la story.

## Interventions utilisateur requises

Le dev agent doit executer tout ce qui peut l'etre localement et sans secret. Il ne doit solliciter Flo que dans les cas ci-dessous.

### 1. Preconditions non remplies

Intervention possible: confirmer l'ordre de travail si une story dependante n'est pas encore implementee.

Etapes ultra precises:

1. Le dev agent verifie les dossiers et fichiers requis par les stories precedentes.
2. Si une dependance bloquante manque, il note exactement le fichier ou contrat absent.
3. Il demande a Flo s'il faut implementer la story dependante d'abord ou limiter le travail a la preparation documentaire.
4. Sans reponse, il ne cree pas de structure parallele et ne simule pas une dependance metier.

### 2. Donnees, comptes et secrets

Intervention possible: fournir des comptes de test ou valeurs d'environnement seulement si une validation locale l'exige.

Etapes ultra precises:

1. Le dev agent utilise d'abord des fixtures locales et placeholders documentes.
2. Il ne demande jamais de service-role key, token personnel ou mot de passe DB pour du code client.
3. Si une validation avec Supabase Cloud est explicitement voulue, Flo configure les secrets dans l'environnement local ou GitHub Actions; les vraies valeurs ne sont pas commitees.
4. Si une vraie cle apparait dans un fichier suivi par git, le dev agent s'arrete, signale le chemin, et remplace par placeholder apres accord.

### 3. Validation visuelle mobile/web

Intervention possible: confirmer le rendu sur telephone ou navigateur si le dev agent ne peut pas inspecter l'interface.

Etapes ultra precises:

1. Le dev agent lance l'app depuis WSL avec les commandes du repo, via `rtk`.
2. Il verifie au moins une largeur mobile et une largeur desktop/web quand l'UI est concernee.
3. Flo intervient seulement si une validation sur appareil physique est necessaire.
4. Flo verifie alors absence d'ecran rouge, lisibilite mobile, navigation attendue, et absence de donnees privees visibles par le mauvais role.
5. Le resultat est note dans `Dev Agent Record > Completion Notes List`.

### 4. Mutations destructives ou donnees existantes

Intervention possible: autoriser une action qui supprime, reset ou migre des donnees locales/non locales.

Etapes ultra precises:

1. Le dev agent peut utiliser `supabase db reset` uniquement sur une base locale de developpement.
2. Il ne lance aucune migration destructive sur Supabase Cloud sans demande explicite de Flo.
3. Avant toute action destructive, il indique la cible exacte: local, preview, staging ou production.
4. Si la cible n'est pas clairement locale, Flo doit confirmer par ecrit avant execution.

### 5. Decisions produit non couvertes

Intervention possible: trancher uniquement si la story rencontre un choix produit absent des artefacts.

Etapes ultra precises:

1. Le dev agent cherche d'abord dans PRD, epics, architecture, UX et decision log.
2. S'il ne trouve pas la regle, il formule une question courte a Flo avec l'impact technique.
3. Il documente la reponse dans la story ou le Dev Agent Record si elle influence l'implementation.
4. Il ne transforme pas un non-objectif MVP en fonctionnalite implicite.


## Dev Notes

### Execution locale dans ce workspace

Dans ce repo, lancer les commandes depuis WSL a la racine `/mnt/c/Users/Richeme/Playground/NextPoint` et respecter `RTK.md`: prefixer les commandes shell avec `rtk`. Les snippets issus de docs officielles indiquent la commande outil; dans ce workspace, les executer via `rtk` sauf cas necessitant `rtk proxy`.

### Preconditions et dependances

- Epic 1 doit fournir les roles et profils.
- Story 2.1 doit fournir les tarifs si un tarif est affiche ou applique.
- Les disponibilites doivent preparer les commandes de reservation de l'Epic 4 sans les dupliquer.

Le fichier precedent le plus proche est `3-3-gerer-les-recurrences-de-disponibilites-p0.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Garde-fous d'architecture

- Utiliser Supabase/PostgreSQL comme source de verite pour les donnees metier.
- Respecter `snake_case` en base et `camelCase` dans les contrats TypeScript.
- Utiliser les contrats et schemas Zod partages dans `packages/shared/src/contracts` quand une entree/sortie API est concernee.
- Les mutations critiques passent par fonctions serveur transactionnelles; pas de CRUD client direct pour contourner les regles.
- Les dates/heures API sont en ISO 8601 UTC; le fuseau local reste a la frontiere UI.
- Les libelles visibles sont externalises FR/EN/ES quand une UI est modifiee.
- Les couleurs et valeurs visuelles applicatives viennent des tokens/theme, pas de valeurs hardcodees.

### Notes specifiques a cette story

Les disponibilites alimentent les creneaux demandables. Les mutations de reservation restent dans l'Epic 4; ne pas deplacer les invariants booking dans l'UI.

### Tests et verification minimum

- Lancer lint/typecheck/tests disponibles pour les packages touches.
- Ajouter ou mettre a jour les tests RLS, contrats, hooks, composants ou commandes selon le risque de la story.
- Verifier mobile-first et webapp pour toute surface UI.
- Verifier qu'aucun secret reel n'est present dans les fichiers suivis par git.
- Documenter toute verification impossible dans le Dev Agent Record.

### Previous Story Intelligence

Le fichier precedent le plus proche est `3-3-gerer-les-recurrences-de-disponibilites-p0.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Git Intelligence

Les derniers commits connus sont documentaires et ne fournissent pas encore de pattern code applicatif stable. Appliquer les conventions de l'architecture BMAD et les patterns etablis par les stories precedemment implementees.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 3.4`
- `_bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules`
- `_bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries`
- `_bmad-output/planning-artifacts/prd.md#Exigences Fonctionnelles`
- `_bmad-output/planning-artifacts/ux-screen-inventory.md`
- `_bmad-output/planning-artifacts/ux-designs/ux-NextPoint-2026-06-07/EXPERIENCE.md`
- `_bmad-output/planning-artifacts/design-tokens.md`

## Dev Agent Record

### Agent Model Used

Codex GPT-5

### Implementation Plan

- Ajouter des RPC transactionnelles coach-only pour modifier ou soft-delete un slot de disponibilite.
- Refuser les mutations sur slots non disponibles (`booked`/`cancelled`) et sur series contenant un slot bloque.
- Câbler l'ecran coach pour modifier/supprimer une occurrence, avec confirmation occurrence/serie seulement quand la serie est applicable.

### Debug Log References

- 2026-06-29: Activation `bmad-dev-story` effectuee; workflow personnalise resolu sans etapes prepend/append.
- 2026-06-29: Preconditions confirmees: stories 3.1, 3.2 et 3.3 en review, plages/slots/recurences, contrat shared, service mobile, tests DB et script d'integration presents.
- 2026-06-29: Documentation Expo SDK 56 consultee avant modifications mobile, conformement a `apps/mobile/AGENTS.md`.
- 2026-06-29: Tests RED confirmes: fonctions `update_availability_slot` et `delete_availability_slot` absentes.
- 2026-06-29: Migrations `0016_availability_slot_mutations.sql` et `0017_fix_availability_slot_update_constraint_scope.sql` appliquees localement; types Supabase regeneres.
- 2026-06-29: `npm test`, `npm run typecheck`, `npm run lint`, `npm run supabase:test:db`, `npm run test:availability-ranges`, `npx expo install --check` depuis `apps/mobile` et `git diff --check` passent.

### Completion Notes List

- Story creee par generation BMAD create-story le 2026-06-21.
- Analyse de contexte: epics, architecture, PRD, UX, design tokens, sprint status et story precedente disponible.
- Implementation demarree avec baseline git `db3a736cf15779dbcf2f764b627b214480e879d2`.
- Aucune dependance bloquante manquante: les stories 3.1 a 3.3 fournissent les plages, slots, recurrence et affichage coach necessaires.
- Les modifications/suppressions passent par RPC security-definer; le CRUD direct client reste refuse par RLS/grants.
- Une occurrence disponible peut etre modifiee ou supprimee seule; une serie recurrente peut etre modifiee/supprimee seulement si tous ses slots actifs sont disponibles.
- Les slots `booked` bloquent modification/suppression et servent de garde-fou P0 pour reservation confirmee tant que les vraies demandes/reservations Epic 4 ne sont pas livrees.
- L'interface demande de choisir occurrence ou serie uniquement pour une recurrence sans slot bloque; sinon elle applique l'occurrence selectionnee ou affiche le refus serveur.
- La suppression est un soft-delete: le slot n'est plus visible comme disponible ni lisible dans les listes coach standard.

### File List

- `_bmad-output/implementation-artifacts/3-4-modifier-ou-supprimer-une-disponibilite-sans-conflit.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/mobile/src/app/coach/availability.tsx`
- `apps/mobile/src/features/scheduling/availability-service.ts`
- `apps/mobile/src/i18n/translations.ts`
- `packages/shared/src/types/database.types.ts`
- `scripts/verify-availability-ranges.mjs`
- `supabase/migrations/0016_availability_slot_mutations.sql`
- `supabase/migrations/0017_fix_availability_slot_update_constraint_scope.sql`
- `supabase/tests/database/0012_availability_slots.sql`

### Change Log

- 2026-06-29: Ajout des RPC `update_availability_slot` et `delete_availability_slot`.
- 2026-06-29: Ajout des tests de modification/suppression occurrence et serie, avec refus des slots bloques.
- 2026-06-29: Ajout de l'edition/suppression inline dans l'ecran Disponibilites coach.

## Completion Note

Ultimate context engine analysis completed - comprehensive developer guide created.
