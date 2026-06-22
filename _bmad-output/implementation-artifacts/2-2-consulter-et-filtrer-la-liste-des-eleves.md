---
baseline_commit: e27b1cdb14583f25ffb8ae13368fe0e15b60998c
---

# Story 2.2: Consulter et filtrer la liste des élèves

Status: review

<!-- Note: Validation optionnelle. Lancer validate-create-story pour controle qualite avant dev-story. -->

## Story

As a coach,
I want consulter et filtrer la liste de mes élèves,
so that je puisse retrouver rapidement le bon élève avant un cours ou une action de suivi.

## Acceptance Criteria

1. Given un coach connecté avec des élèves associés When il ouvre l’écran Élèves Then il voit uniquement les élèves associés à son profil And aucun élève non autorisé n’est affiché.
2. Given la liste élèves When le coach recherche par nom Then la liste est filtrée selon la recherche And un état vide clair est affiché si aucun résultat ne correspond.
3. Given la liste élèves When le coach applique un filtre de niveau Then seuls les élèves correspondant au niveau sélectionné sont affichés And le niveau utilise une liste fermée de niveaux padel.
4. Given la liste élèves When le coach applique un filtre par âge Then les tranches enfants de 2 ans à partir de 5 ans et les tranches adultes par dizaines sont disponibles And le filtre peut être réinitialisé.
5. Given un élève ou utilisateur non coach When il tente d’accéder à la liste élèves coach Then l’accès est refusé And aucune donnée de liste élèves n’est exposée.

## Tasks / Subtasks

- [x] Verifier les preconditions et dependances de Story 2.2 (AC: tous)
  - [x] Relire les stories precedentes pertinentes et confirmer que leurs fichiers/contrats existent reellement.
  - [x] Identifier les fichiers UPDATE avant modification et les lire completement.
  - [x] Noter toute dependance manquante dans le Dev Agent Record avant de coder.
- [x] Implementer liste/fiche eleve selon la story (AC: tous)
  - [x] Filtrer par relation coach/eleve via RLS et queries typees.
  - [x] Gerer recherche, filtres niveau/age et etats vides mobile-first.
  - [x] Ne jamais exposer note privee cote eleve.
- [x] Tester visibilite et filtrage (AC: securite/UX)
  - [x] Couvrir coach proprietaire, eleve concerne et utilisateur non autorise.

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

- Epic 1 doit fournir auth, roles, profils et association coach/eleve.
- Story 1.2 doit fournir la base Supabase, migrations, types et CI.
- Les notes privees et donnees eleves exigent RLS et tests dedies.

Le fichier precedent le plus proche est `2-1-gerer-les-tarifs-coach-visibles-par-les-eleves.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Garde-fous d'architecture

- Utiliser Supabase/PostgreSQL comme source de verite pour les donnees metier.
- Respecter `snake_case` en base et `camelCase` dans les contrats TypeScript.
- Utiliser les contrats et schemas Zod partages dans `packages/shared/src/contracts` quand une entree/sortie API est concernee.
- Les mutations critiques passent par fonctions serveur transactionnelles; pas de CRUD client direct pour contourner les regles.
- Les dates/heures API sont en ISO 8601 UTC; le fuseau local reste a la frontiere UI.
- Les libelles visibles sont externalises FR/EN/ES quand une UI est modifiee.
- Les couleurs et valeurs visuelles applicatives viennent des tokens/theme, pas de valeurs hardcodees.

### Notes specifiques a cette story

La liste et fiche eleve sont cote coach et doivent etre limitees a la relation autorisee. Les notes privees ne sortent jamais vers les surfaces eleve.

### Tests et verification minimum

- Lancer lint/typecheck/tests disponibles pour les packages touches.
- Ajouter ou mettre a jour les tests RLS, contrats, hooks, composants ou commandes selon le risque de la story.
- Verifier mobile-first et webapp pour toute surface UI.
- Verifier qu'aucun secret reel n'est present dans les fichiers suivis par git.
- Documenter toute verification impossible dans le Dev Agent Record.

### Previous Story Intelligence

Le fichier precedent le plus proche est `2-1-gerer-les-tarifs-coach-visibles-par-les-eleves.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Git Intelligence

Les derniers commits connus sont documentaires et ne fournissent pas encore de pattern code applicatif stable. Appliquer les conventions de l'architecture BMAD et les patterns etablis par les stories precedemment implementees.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 2.2`
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

- Reutiliser la relation active et la RLS Story 1.8 comme unique source d'autorisation de la liste.
- Isoler recherche, niveau et tranches d'age dans une logique pure testable.
- Remplacer l'ecran vide coach par une liste mobile-first dense, sans read model de note privee.

### Debug Log References

- 2026-06-21: Activation `bmad-dev-story` effectuee; workflow personnalise resolu sans etapes prepend/append.
- 2026-06-21: Baseline HEAD `e27b1cdb14583f25ffb8ae13368fe0e15b60998c`; changements Story 2.1 indexes mais non commites conserves sans revert.
- 2026-06-21: Preconditions confirmees: profils eleves, relation coach/eleve active, politique RLS coach associe et route protegee disponibles.
- 2026-06-21: Tranches retenues pour couvrir 5-100 sans chevauchement: 5-6 a 17-18, puis 19-29, dizaines 30-99 et 100.
- 2026-06-21: Tests RED confirmes avant implementation du module de filtrage.
- 2026-06-21: Aucun changement de schema requis; les politiques RLS existantes couvrent la lecture coach associee.
- 2026-06-21: `npm run typecheck`, `npm run lint`, `npm test`, `npm run supabase:test:db` et les six integrations Supabase passent.
- 2026-06-21: Expo Web exporte 19 routes statiques, dont `/coach/students`.
- 2026-06-21: Validation physique non executee; Flo devra verifier le scroll horizontal des filtres, le clavier de recherche et la lisibilite des lignes sur telephone.
- 2026-06-22: Extension approuvee avec sexe controle et slider d'age a deux poignees.
- 2026-06-22: Migration `0008` appliquee sans reset; les profils existants recoivent `not_specified`.
- 2026-06-22: Typecheck, lint, 25 tests TypeScript, 77 assertions SQL, six integrations Supabase et export Web passent.

### Completion Notes List

- Story creee par generation BMAD create-story le 2026-06-21.
- Analyse de contexte: epics, architecture, PRD, UX, design tokens, sprint status et story precedente disponible.
- Implementation demarree sur le worktree contenant Story 2.1, sans modifier ni annuler ses changements.
- L'ecran coach Eleves charge uniquement les profils lies par une relation active visible via RLS.
- Recherche par nom insensible a la casse et aux accents.
- Filtre niveau ferme de 1 a 10, filtre sexe et plage d'age 5-100 avec reinitialisation globale.
- Etats distincts pour chargement, erreur, aucune association et aucun resultat filtre.
- Les lignes affichent nom, niveau, age, telephone et email; aucun champ de note privee n'est lu ni expose.
- Le service trie les profils autorises par nom avant affichage.
- Le test d'integration rend une relation inactive et confirme que le coach ne voit plus ce profil.
- Un eleve ne peut lire que son propre profil et ne peut pas lister ses pairs.
- Tests: 25 tests TypeScript, 74 assertions SQL et six scenarios d'integration Supabase sans regression.

### File List

- `_bmad-output/implementation-artifacts/2-2-consulter-et-filtrer-la-liste-des-eleves.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/mobile/src/app/coach/students.tsx`
- `apps/mobile/src/features/students/student-coach-service.ts`
- `apps/mobile/src/features/students/student-age-range-slider.tsx`
- `apps/mobile/src/features/students/student-filter-selector.tsx`
- `apps/mobile/src/features/students/student-list-filters.test.ts`
- `apps/mobile/src/features/students/student-list-filters.ts`
- `apps/mobile/src/app/eleve/account.tsx`
- `apps/mobile/src/features/students/student-profile-service.ts`
- `apps/mobile/src/i18n/translations.ts`
- `apps/mobile/package.json`
- `package-lock.json`
- `package.json`
- `packages/shared/src/contracts/student-profile.test.ts`
- `packages/shared/src/contracts/student-profile.ts`
- `packages/shared/src/index.ts`
- `packages/shared/src/types/database.types.ts`
- `scripts/verify-student-list-access.mjs`
- `scripts/verify-student-profiles.mjs`
- `supabase/migrations/0008_student_profile_sex.sql`
- `supabase/tests/database/0003_student_profiles.sql`
- `tsconfig.tests.json`

### Change Log

- 2026-06-21: Remplacement de l'ecran vide Eleves par la liste coach RLS avec etats de chargement et etats vides.
- 2026-06-21: Ajout de la recherche normalisee et des filtres niveau 1-10 et tranches d'age.
- 2026-06-21: Ajout des traductions FR/EN/ES et des tests unitaires/integration de visibilite.
- 2026-06-22: Ajout du sexe au profil eleve et au filtre prive de la liste coach.
- 2026-06-22: Remplacement des tranches d'age par un slider min/max inclusif de 5 a 100 ans.

## Completion Note

Ultimate context engine analysis completed - comprehensive developer guide created.
