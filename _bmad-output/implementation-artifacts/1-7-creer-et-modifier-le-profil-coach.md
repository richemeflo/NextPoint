---
baseline_commit: cc6e87ce7bfea119fd25e567bc57c5ea753140ec
---

# Story 1.7: Créer et modifier le profil coach

Status: review

<!-- Note: Validation optionnelle. Lancer validate-create-story pour controle qualite avant dev-story. -->

## Story

As a coach,
I want créer et modifier mon profil public de réservation,
so that les élèves voient les informations nécessaires avant de demander un cours.

## Acceptance Criteria

1. Given un coach connecté sans profil complet When il ouvre son profil Then il peut renseigner les informations coach nécessaires à la réservation And il peut sauvegarder ces informations.
2. Given un coach avec un profil existant When il modifie son profil et sauvegarde Then les nouvelles informations sont persistées And elles sont disponibles pour les surfaces élève qui présentent le coach.
3. Given le MVP P0 single-coach When le profil coach est affiché côté élève ou public Then aucun lien ou code d’invitation coach n’est requis And le produit ne présente pas de marketplace multi-coachs.
4. Given le profil coach When le coach ouvre ses paramètres Then il voit les informations du compte, la langue, et les accès vers gestion tarifs, gestion disponibilités et paramètres de notification push And les écrans non encore implémentés peuvent afficher des états vides ou liens désactivés cohérents.
5. Given un utilisateur qui n’est pas le coach propriétaire When il tente de modifier le profil coach Then l’accès est refusé And la modification n’est pas persistée.

## Tasks / Subtasks

- [x] Verifier les preconditions et dependances de Story 1.7 (AC: tous)
  - [x] Relire les stories precedentes pertinentes et confirmer que leurs fichiers/contrats existent reellement.
  - [x] Identifier les fichiers UPDATE avant modification et les lire completement.
  - [x] Noter toute dependance manquante dans le Dev Agent Record avant de coder.
- [x] Implementer le modele et l'ecran profil/association concernes (AC: tous)
  - [x] Utiliser React Hook Form + Zod pour validation si formulaire.
  - [x] Persister via Supabase avec RLS, mapping snake_case/camelCase type.
  - [x] Conserver le contexte P0 single-coach sans invitation marketplace.
- [x] Tester confidentialite et proprietaire du profil (AC: securite)
  - [x] Verifier que l'utilisateur non proprietaire ne peut pas modifier les donnees.

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

### 4. Decisions produit non couvertes

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

- Story 1.1 doit avoir cree le workspace Expo/monorepo.
- Story 1.2 doit avoir prepare Supabase/types/CI avant les integrations backend.
- Story 1.3 doit etre presente avant tout ecran UI finalise.

Le fichier precedent le plus proche est `1-6-creer-et-modifier-le-profil-eleve.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Garde-fous d'architecture

- Utiliser Supabase/PostgreSQL comme source de verite pour les donnees metier.
- Respecter `snake_case` en base et `camelCase` dans les contrats TypeScript.
- Utiliser les contrats et schemas Zod partages dans `packages/shared/src/contracts` quand une entree/sortie API est concernee.
- Les mutations critiques passent par fonctions serveur transactionnelles; pas de CRUD client direct pour contourner les regles.
- Les dates/heures API sont en ISO 8601 UTC; le fuseau local reste a la frontiere UI.
- Les libelles visibles sont externalises FR/EN/ES quand une UI est modifiee.
- Les couleurs et valeurs visuelles applicatives viennent des tokens/theme, pas de valeurs hardcodees.

### Notes specifiques a cette story

Les profils et relations coach/eleve sont des donnees privees controlees par role et relation. Garder le P0 single-coach, sans marketplace ni invitation obligatoire.

### Tests et verification minimum

- Lancer lint/typecheck/tests disponibles pour les packages touches.
- Ajouter ou mettre a jour les tests RLS, contrats, hooks, composants ou commandes selon le risque de la story.
- Verifier mobile-first et webapp pour toute surface UI.
- Verifier qu'aucun secret reel n'est present dans les fichiers suivis par git.
- Documenter toute verification impossible dans le Dev Agent Record.

### Previous Story Intelligence

Le fichier precedent le plus proche est `1-6-creer-et-modifier-le-profil-eleve.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Git Intelligence

Les derniers commits connus sont documentaires et ne fournissent pas encore de pattern code applicatif stable. Appliquer les conventions de l'architecture BMAD et les patterns etablis par les stories precedemment implementees.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 1.7`
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

- Ajouter un profil coach public unique, protege en ecriture par le role et la propriete Supabase.
- Construire le formulaire coach React Hook Form/Zod, synchroniser la langue et exposer le profil aux surfaces publique et eleve.
- Couvrir contraintes, persistance, lecture publique et refus cross-user par tests contrats, SQL et integration locale.

### Debug Log References

- 2026-06-21: Activation `bmad-dev-story` effectuee; workflow personnalise resolu sans etapes prepend/append.
- 2026-06-21: Story 1.6 en review mais non commitee; implementation 1.7 poursuivie par-dessus sans revert.
- 2026-06-21: Preconditions confirmees: roles, RLS, formulaires profils, i18n global et page publique disponibles.
- 2026-06-21: Champs coach retenus depuis le PRD: nom affiche, description courte, telephone, email et langue preferee.
- 2026-06-21: Migration `0005_coach_profiles.sql` appliquee sans reset de la base locale et types Supabase regeneres.
- 2026-06-21: `npm run typecheck`, `npm run lint`, `npm test`, `npm run supabase:test:db`, `npm run test:coach-profiles`, `npm run test:student-profiles`, `npm run test:auth:roles` et `npx expo install --check` passent.
- 2026-06-21: Expo Web compile et `/`, `/eleve`, `/coach/profile` retournent HTTP 200.
- 2026-06-21: Validation physique du formulaire coach non executee; Flo devra verifier saisie, scroll, changement de langue et affichage public sur telephone.

### Completion Notes List

- Story creee par generation BMAD create-story le 2026-06-21.
- Analyse de contexte: epics, architecture, PRD, UX, design tokens, sprint status et story precedente disponible.
- Implementation demarree sur la baseline committee Story 1.5 `cc6e87ce7bfea119fd25e567bc57c5ea753140ec`, avec Story 1.6 presente dans le worktree.
- Table `coach_profiles` ajoutee avec nom affiche, bio, telephone, email, langue et timestamps.
- Lecture publique autorisee; creation et modification reservees au coach proprietaire; suppression client interdite.
- Contrat Zod partage et mapping explicite entre formulaire `camelCase` et colonnes Supabase `snake_case`.
- Ecran Profil coach remplace par un formulaire responsive avec chargement, creation, modification et feedback FR/EN/ES.
- Les parametres exposent disponibilites, tarifs et notifications; seuls les acces non implementes restent desactives.
- Le profil coach est presente directement sur les surfaces publique et eleve sans code d'invitation ni marketplace.
- La synchronisation de langue est generalisee aux profils coach et eleve.
- Tests: 16 tests TypeScript, 36 assertions SQL et integrations locales couvrant persistance, lecture publique, single-coach et refus cross-user.

### File List

- `_bmad-output/implementation-artifacts/1-7-creer-et-modifier-le-profil-coach.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/mobile/src/app/_layout.tsx`
- `apps/mobile/src/app/coach/profile.tsx`
- `apps/mobile/src/app/eleve/account.tsx`
- `apps/mobile/src/app/eleve/index.tsx`
- `apps/mobile/src/app/index.tsx`
- `apps/mobile/src/features/coaches/coach-profile-service.ts`
- `apps/mobile/src/features/coaches/public-coach-card.tsx`
- `apps/mobile/src/features/profiles/profile-locale-sync.tsx`
- `apps/mobile/src/features/profiles/profile-option-selector.tsx`
- `apps/mobile/src/features/students/profile-option-selector.tsx` (supprime)
- `apps/mobile/src/features/students/student-locale-sync.tsx` (supprime)
- `apps/mobile/src/i18n/translations.ts`
- `package.json`
- `packages/shared/src/contracts/coach-profile.test.ts`
- `packages/shared/src/contracts/coach-profile.ts`
- `packages/shared/src/index.ts`
- `packages/shared/src/types/database.types.ts`
- `scripts/verify-coach-profiles.mjs`
- `supabase/migrations/0005_coach_profiles.sql`
- `supabase/tests/database/0004_coach_profiles.sql`
- `tsconfig.tests.json`

### Change Log

- 2026-06-21: Ajout du modele `coach_profiles`, contraintes, trigger `updated_at` et politiques RLS public/proprietaire.
- 2026-06-21: Ajout du contrat Zod, du service Supabase et du formulaire coach responsive FR/EN/ES.
- 2026-06-21: Publication du profil coach sur les accueils public et eleve dans le contexte single-coach.
- 2026-06-21: Generalisation de la langue preferee et ajout des tests contrats, SQL et integration.

## Completion Note

Ultimate context engine analysis completed - comprehensive developer guide created.
