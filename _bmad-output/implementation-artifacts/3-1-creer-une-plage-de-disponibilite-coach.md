---
baseline_commit: 453b5c086f915c1d21ed5e5fae4cefbf48dcd976
---

# Story 3.1: Créer une plage de disponibilité coach

Status: review

<!-- Note: Validation optionnelle. Lancer validate-create-story pour controle qualite avant dev-story. -->

## Story

As a coach,
I want créer une plage de disponibilité avec durée et lieu,
so that le système puisse proposer des créneaux réservables à mes élèves.

## Acceptance Criteria

1. Given un coach connecté When il ouvre l’écran Gestion Disponibilités Then il peut créer une plage avec date, heure de début, heure de fin, durée de créneau et lieu And l’écran est dédié à la gestion des disponibilités.
2. Given une nouvelle plage de disponibilité When le coach sélectionne une durée de créneau Then les durées disponibles sont 1h et 1h30 And 1h30 peut être proposée comme durée de référence.
3. Given une nouvelle plage de disponibilité When le coach sélectionne un lieu Then la liste de lieux inclut `Les Bruyères Centre Sportif` comme valeur initiale And le lieu est conservé pour les créneaux générés.
4. Given un formulaire de disponibilité incomplet ou incohérent When le coach tente de sauvegarder Then des erreurs traduites indiquent les champs à corriger And aucune plage invalide n’est créée.
5. Given un utilisateur non coach When il tente de créer une plage de disponibilité Then l’accès est refusé And aucune disponibilité n’est créée.

## Tasks / Subtasks

- [x] Verifier les preconditions et dependances de Story 3.1 (AC: tous)
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

Aucune story precedente applicable n'a ete trouvee dans les artefacts d'implementation.

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

Aucune story precedente applicable n'a ete trouvee dans les artefacts d'implementation.

### Git Intelligence

Les derniers commits connus sont documentaires et ne fournissent pas encore de pattern code applicatif stable. Appliquer les conventions de l'architecture BMAD et les patterns etablis par les stories precedemment implementees.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 3.1`
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

- Ajouter le contrat partage de plage de disponibilite avec validation locale, conversion UTC et apercu de creneaux.
- Ajouter le modele Supabase `availability_ranges`, RLS lecture coach, commande transactionnelle coach-only et contrainte de non-chevauchement.
- Remplacer l'ecran placeholder par l'ecran dedie Gestion Disponibilites, avec erreurs i18n FR/EN/ES et preview mobile/web.

### Debug Log References

- 2026-06-29: Activation `bmad-dev-story` effectuee; workflow personnalise resolu sans etapes prepend/append.
- 2026-06-29: Preconditions confirmees: roles/guards coach, profil coach, tarifs et patterns RPC/RLS existent dans les stories precedentes; aucun contrat scheduling existant avant 3.1.
- 2026-06-29: Documentation Expo SDK 56 consultee avant modification mobile, conformement a `apps/mobile/AGENTS.md`.
- 2026-06-29: Tests RED confirmes: contrat `availability-range` absent et table/RPC `availability_ranges` absents.
- 2026-06-29: Migration `0013_availability_ranges.sql` appliquee localement via `npx supabase migration up`; types Supabase regeneres.
- 2026-06-29: `npm test`, `npm run typecheck`, `npm run lint`, `npm run supabase:test:db`, `npm run test:availability-ranges` et `npx expo install --check` passent.
- 2026-06-29: Expo Web demarre et `/coach/availability` repond HTTP 200 sur `http://localhost:8081/coach/availability`.
- 2026-06-29: Captures Playwright mobile/desktop non authentifiees et avec storage injecte realisees; elles atteignent la page publique/session mais pas l'ecran coach authentifie. Validation visuelle authentifiee complete a faire dans une session navigateur/app connectee.

### Completion Notes List

- Story creee par generation BMAD create-story le 2026-06-21.
- Analyse de contexte: epics, architecture, PRD, UX, design tokens, sprint status et story precedente disponible.
- Implementation demarree avec baseline git `453b5c086f915c1d21ed5e5fae4cefbf48dcd976`.
- Contrat `availabilityRangeSchema` ajoute avec date, heure debut/fin, duree 60/90, lieu initial `Les Bruyeres Centre Sportif`, recurrence limitee `none/daily/weekly`, conversion ISO 8601 UTC et preview de creneaux.
- Table `availability_ranges` ajoutee avec source de verite Supabase, `snake_case`, RLS, commande RPC `create_availability_range` et mutation directe client interdite.
- Creation de disponibilite reservee au coach par RPC transactionnelle; un utilisateur eleve/non coach est refuse et aucune disponibilite n'est creee.
- Conflits de plages actives bloques par contrainte d'exclusion PostgreSQL; `deleted_at` prepare la suppression future sans exposer la commande de Story 3.4.
- Ecran Gestion Disponibilites remplace le placeholder coach avec formulaire dedie, duree 1h30 par defaut, lieu initial, recurrence limitee, feedback traduit et liste des plages.
- Les commandes de booking Epic 4 ne sont pas dupliquees; aucune demande/reservation n'est creee par cette story.
- Validation visuelle authentifiee complete non confirmee par Playwright car le contexte injecte a redirige vers la page publique; le serveur local repond toutefois sans ecran rouge/page blanche.

### File List

- `_bmad-output/implementation-artifacts/3-1-creer-une-plage-de-disponibilite-coach.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/mobile/src/app/coach/availability.tsx`
- `apps/mobile/src/features/scheduling/availability-service.ts`
- `apps/mobile/src/i18n/translations.ts`
- `package.json`
- `packages/shared/src/contracts/availability-range.test.ts`
- `packages/shared/src/contracts/availability-range.ts`
- `packages/shared/src/index.ts`
- `packages/shared/src/types/database.types.ts`
- `scripts/verify-availability-ranges.mjs`
- `supabase/migrations/0013_availability_ranges.sql`
- `supabase/tests/database/0011_availability_ranges.sql`
- `tsconfig.tests.json`

### Change Log

- 2026-06-29: Ajout du modele de plages de disponibilite, de la RPC coach-only, des contraintes RLS/non-chevauchement et des tests SQL/integration.
- 2026-06-29: Ajout du contrat partage de disponibilite avec conversion UTC et preview de creneaux.
- 2026-06-29: Remplacement de l'ecran Disponibilites par un formulaire dedie avec i18n FR/EN/ES.

## Completion Note

Ultimate context engine analysis completed - comprehensive developer guide created.
