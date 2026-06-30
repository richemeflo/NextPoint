---
baseline_commit: e685136c8b6023dbc73a4899953d3cd80eedf3db
---

# Story 4.3: Afficher les demandes nouvelles dans le planning coach

Status: review

<!-- Note: Validation optionnelle. Lancer validate-create-story pour controle qualite avant dev-story. -->

## Story

As a coach,
I want voir les nouvelles demandes directement dans mon planning,
so that je ne manque pas les réservations à traiter.

## Acceptance Criteria

1. Given une nouvelle demande pending When le coach ouvre son planning Then la demande est visible dans le planning And elle possède un état ou badge `nouveau`.
2. Given plusieurs demandes pending sur un même créneau When le coach consulte le planning Then le créneau indique clairement les demandes à traiter And il reste compréhensible sur mobile.
3. Given une demande pending When elle est affichée dans le planning coach Then elle utilise une couleur distincte ou une surbrillance And cette représentation vient des tokens de design.
4. Given une demande depuis le planning When le coach la sélectionne Then il ouvre le détail de la demande And le détail contient au minimum élève, date, heure, lieu, durée, tarif et statut.
5. Given une demande déjà traitée When le planning est rechargé Then elle n’est plus affichée comme nouvelle pending And son statut visible reflète son état réel.

## Tasks / Subtasks

- [x] Verifier les preconditions et dependances de Story 4.3 (AC: tous)
  - [x] Relire les stories precedentes pertinentes et confirmer que leurs fichiers/contrats existent reellement.
  - [x] Identifier les fichiers UPDATE avant modification et les lire completement.
  - [x] Noter toute dependance manquante dans le Dev Agent Record avant de coder.
- [x] Implementer la commande/lecture booking selon la story (AC: tous)
  - [x] Passer par Edge Function ou fonction serveur transactionnelle; pas de CRUD client direct.
  - [x] Respecter le format `{ ok: true, data }` / `{ ok: false, error }`.
  - [x] Invalider les query keys TanStack Query ciblees apres mutation.
- [x] Tester invariants critiques (AC: integrite/securite)
  - [x] Couvrir 2 pending max par creneau, 10 pending max par eleve, reservation confirmee unique, expiration/annulation/modification selon la story.

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

- Epic 1 doit fournir auth, roles et relation coach/eleve.
- Epic 2 doit fournir tarifs/eleves/packs selon la story.
- Epic 3 doit fournir disponibilites, creneaux et planning demandable.

Le fichier precedent le plus proche est `4-2-appliquer-les-limites-et-conflits-de-demandes.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Garde-fous d'architecture

- Utiliser Supabase/PostgreSQL comme source de verite pour les donnees metier.
- Respecter `snake_case` en base et `camelCase` dans les contrats TypeScript.
- Utiliser les contrats et schemas Zod partages dans `packages/shared/src/contracts` quand une entree/sortie API est concernee.
- Les mutations critiques passent par fonctions serveur transactionnelles; pas de CRUD client direct pour contourner les regles.
- Les dates/heures API sont en ISO 8601 UTC; le fuseau local reste a la frontiere UI.
- Les libelles visibles sont externalises FR/EN/ES quand une UI est modifiee.
- Les couleurs et valeurs visuelles applicatives viennent des tokens/theme, pas de valeurs hardcodees.

### Notes specifiques a cette story

Les bookings sont des commandes transactionnelles serveur. Ne jamais confirmer/refuser/annuler par CRUD client direct ou optimistic update qui mentirait a l'utilisateur.

### Tests et verification minimum

- Lancer lint/typecheck/tests disponibles pour les packages touches.
- Ajouter ou mettre a jour les tests RLS, contrats, hooks, composants ou commandes selon le risque de la story.
- Verifier mobile-first et webapp pour toute surface UI.
- Verifier qu'aucun secret reel n'est present dans les fichiers suivis par git.
- Documenter toute verification impossible dans le Dev Agent Record.

### Previous Story Intelligence

Le fichier precedent le plus proche est `4-2-appliquer-les-limites-et-conflits-de-demandes.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Git Intelligence

Les derniers commits connus sont documentaires et ne fournissent pas encore de pattern code applicatif stable. Appliquer les conventions de l'architecture BMAD et les patterns etablis par les stories precedemment implementees.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 4.3`
- `_bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules`
- `_bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries`
- `_bmad-output/planning-artifacts/prd.md#Exigences Fonctionnelles`
- `_bmad-output/planning-artifacts/ux-screen-inventory.md`
- `_bmad-output/planning-artifacts/ux-designs/ux-NextPoint-2026-06-07/EXPERIENCE.md`
- `_bmad-output/planning-artifacts/design-tokens.md`

## Dev Agent Record

### Agent Model Used

Codex GPT-5

### Debug Log References

- 2026-06-29: Implementation Epic 4 via booking contracts, Supabase transactional RPCs, mobile coach/student booking surfaces.
- Validations: npm test, npm run typecheck, npm run lint.

### Completion Notes List

- Post-review UX adjustments: student Planning page now shows only pending requests and approved lessons; requestable slots stay on student home; slot tap opens the request form; mobile role navigation moves to bottom; bookings no longer fail when no matching pricing rate exists.
- Story creee par generation BMAD create-story le 2026-06-21.
- Analyse de contexte: epics, architecture, PRD, UX, design tokens, sprint status et story precedente disponible.

- Epic 4 implementation completed: booking lifecycle, pending limits, approval/refusal, expiration, group participants, direct coach creation, weekly recurrence, cancellation/modification, and student booking overview.
- TanStack Query is not installed in this repo; targeted reloads are used after mutations following the existing service pattern.
- Supabase Cloud/local DB reset was not run; migration 0019 was applied to the local database with `npx supabase migration up --local` and types were regenerated from local DB.

### File List

- `_bmad-output/implementation-artifacts/4-3-afficher-les-demandes-nouvelles-dans-le-planning-coach.md`
- `apps/mobile/src/app/coach/index.tsx`
- `apps/mobile/src/app/eleve/planning.tsx`
- `apps/mobile/src/features/bookings/booking-service.ts`
- `apps/mobile/src/features/navigation/role-navigation.tsx`
- `apps/mobile/src/features/scheduling/student-agenda.tsx`
- `apps/mobile/src/i18n/translations.ts`
- `package.json`
- `packages/shared/src/contracts/booking.test.ts`
- `packages/shared/src/contracts/booking.ts`
- `packages/shared/src/index.ts`
- `packages/shared/src/types/database.types.ts`
- `supabase/migrations/0019_bookings.sql`
- `supabase/migrations/0020_optional_booking_pricing.sql`

### Change Log

- 2026-06-29: Implemented Epic 4 booking workflows and moved story to review.
- 2026-06-30: Addressed post-review UX and pricing feedback for student booking flow and role navigation.

## Completion Note

Ultimate context engine analysis completed - comprehensive developer guide created.
