---
baseline_commit: e9240e4b6deca2e3e7c32f8ce7a19c8d39639ab9
---

# Story 3.3: Gérer les récurrences de disponibilités P0

Status: review

<!-- Note: Validation optionnelle. Lancer validate-create-story pour controle qualite avant dev-story. -->

## Story

As a coach,
I want créer des disponibilités ponctuelles, quotidiennes ou hebdomadaires,
so that je puisse publier rapidement mes créneaux récurrents.

## Acceptance Criteria

1. Given le formulaire de disponibilité When le coach choisit une récurrence Then les options P0 disponibles sont ponctuelle, quotidienne et hebdomadaire And aucune récurrence avancée hors P0 n’est proposée.
2. Given une disponibilité récurrente valide When le coach la sauvegarde Then le système demande l’horizon de génération à l’utilisateur et propose 1 mois par défaut And les créneaux générés restent liés à leur plage ou règle source.
3. Given une disponibilité ponctuelle When elle est sauvegardée Then seuls les créneaux de la date sélectionnée sont générés And aucune règle récurrente n’est créée.
4. Given une règle récurrente When ses occurrences apparaissent dans le planning coach Then le coach peut identifier les créneaux issus de cette règle And les informations date, heure, durée et lieu restent cohérentes sur chaque occurrence.
5. Given une récurrence invalide ou impossible When le coach tente de sauvegarder Then l’action est refusée avec un message clair And aucun créneau incohérent n’est généré.

## Tasks / Subtasks

- [x] Verifier les preconditions et dependances de Story 3.3 (AC: tous)
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

Le fichier precedent le plus proche est `3-2-generer-les-creneaux-depuis-une-plage.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

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

Le fichier precedent le plus proche est `3-2-generer-les-creneaux-depuis-une-plage.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Git Intelligence

Les derniers commits connus sont documentaires et ne fournissent pas encore de pattern code applicatif stable. Appliquer les conventions de l'architecture BMAD et les patterns etablis par les stories precedemment implementees.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 3.3`
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

- Etendre la commande transactionnelle Supabase `create_availability_range` avec un horizon `recurrence_ends_on`.
- Generer les occurrences `none`, `daily` et `weekly` cote base en conservant le lien `availability_range_id` sur chaque slot.
- Exposer l'horizon dans le formulaire coach avec un defaut a un mois et afficher les occurrences generees dans la liste existante.

### Debug Log References

- 2026-06-29: Activation `bmad-dev-story` effectuee; workflow personnalise resolu sans etapes prepend/append.
- 2026-06-29: Preconditions confirmees: stories 3.1 et 3.2 en review, contrats `availability-range`, service scheduling, migrations `availability_ranges`/`availability_slots`, tests DB et script d'integration presents.
- 2026-06-29: Documentation Expo SDK 56 consultee avant modifications mobile, conformement a `apps/mobile/AGENTS.md`.
- 2026-06-29: Tests RED confirmes: export shared `getDefaultAvailabilityRecurrenceEndsOn`, colonne `recurrence_ends_on`, signature RPC avec horizon et contrainte anti-chevauchement de slots absents.
- 2026-06-29: Migration `0015_availability_recurrences.sql` appliquee localement via `npx supabase migration up`; types Supabase regeneres.
- 2026-06-29: `npm test`, `npm run typecheck`, `npm run lint`, `npm run supabase:test:db`, `npm run test:availability-ranges`, `npx expo install --check` depuis `apps/mobile` et `git diff --check` passent.
- 2026-06-29: Expo Web lance sur `http://localhost:8091`; `GET /coach/availability` verifie en HTTP 200 apres compilation.
- 2026-06-29: Scan motifs sensibles effectue; resultats restants limites aux usages/placeholders attendus (`service_role`, `SECRET_KEY` issu de `supabase status -o env`, package-lock), aucun secret reel detecte.

### Completion Notes List

- Story creee par generation BMAD create-story le 2026-06-21.
- Analyse de contexte: epics, architecture, PRD, UX, design tokens, sprint status et story precedente disponible.
- Implementation demarree avec baseline git `e9240e4b6deca2e3e7c32f8ce7a19c8d39639ab9`.
- Aucune dependance bloquante manquante: les stories 3.1 et 3.2 fournissent les plages, slots, contrat shared, service mobile et tests d'integration necessaires.
- Les options P0 restent limitees a ponctuelle, quotidienne et hebdomadaire dans le contrat partage et le formulaire.
- Les disponibilites recurrentes demandent un horizon `recurrence_ends_on`; l'UI propose un mois par defaut et la base lie chaque slot genere a sa plage source.
- Les disponibilites ponctuelles envoient `recurrence_ends_on = null` et ne generent que les slots complets de la date selectionnee.
- La generation quotidienne/hebdomadaire reste transactionnelle: une recurrence invalide ou un conflit de slot annule la creation coheremment.
- Les slots recurrents affiches cote coach conservent date, heure, duree, lieu, statut et lien source `availability_range_id`.
- Les commandes de booking Epic 4 ne sont pas implementees; les tests couvrent seulement le blocage des mutations directes client sur plages/slots et le statut `booked` deja prepare.
- Validation visuelle authentifiee complete non confirmee automatiquement; la route web compile et repond HTTP 200, mais la session coach connectee doit etre verifiee manuellement si besoin sur appareil/navigateur.

### File List

- `_bmad-output/implementation-artifacts/3-3-gerer-les-recurrences-de-disponibilites-p0.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/mobile/src/app/coach/availability.tsx`
- `apps/mobile/src/features/scheduling/availability-service.ts`
- `apps/mobile/src/i18n/translations.ts`
- `packages/shared/src/contracts/availability-range.test.ts`
- `packages/shared/src/contracts/availability-range.ts`
- `packages/shared/src/index.ts`
- `packages/shared/src/types/database.types.ts`
- `scripts/verify-availability-ranges.mjs`
- `supabase/migrations/0015_availability_recurrences.sql`
- `supabase/tests/database/0011_availability_ranges.sql`
- `supabase/tests/database/0012_availability_slots.sql`

### Change Log

- 2026-06-29: Ajout de l'horizon `recurrence_ends_on`, validation shared et generation transactionnelle des occurrences `none/daily/weekly`.
- 2026-06-29: Ajout de la contrainte anti-chevauchement des slots actifs et verification d'atomicite en integration.
- 2026-06-29: Mise a jour de l'ecran coach pour demander l'horizon, proposer un mois par defaut et afficher les occurrences generees.

## Completion Note

Ultimate context engine analysis completed - comprehensive developer guide created.
