# Story 1.4: Créer l’authentification email/password et les sessions

Status: ready-for-dev

<!-- Note: Validation optionnelle. Lancer validate-create-story pour controle qualite avant dev-story. -->

## Story

As a coach ou élève,
I want créer un compte, me connecter et me déconnecter,
so that je puisse accéder à mon espace NextPoint de manière sécurisée.

## Acceptance Criteria

1. Given un nouvel utilisateur When il crée un compte avec email et mot de passe valides Then le compte est créé via Supabase Auth And une session utilisateur est disponible dans l’application.
2. Given un utilisateur existant When il saisit un email et un mot de passe valides Then il est connecté And sa session persiste selon le comportement attendu sur mobile et web.
3. Given un utilisateur connecté When il choisit de se déconnecter Then sa session est supprimée And il est redirigé vers l’espace public ou auth.
4. Given un formulaire d’authentification When l’utilisateur soumet des données invalides ou incomplètes Then l’interface affiche une erreur claire et traduite And aucun détail technique Supabase n’est exposé.
5. Given l’application cliente When les variables Supabase sont configurées Then seules les clés publiques nécessaires au client sont utilisées And aucun secret service-role n’est présent dans l’app.

## Tasks / Subtasks

- [ ] Verifier les preconditions et dependances de Story 1.4 (AC: tous)
  - [ ] Relire les stories precedentes pertinentes et confirmer que leurs fichiers/contrats existent reellement.
  - [ ] Identifier les fichiers UPDATE avant modification et les lire completement.
  - [ ] Noter toute dependance manquante dans le Dev Agent Record avant de coder.
- [ ] Implementer le flux auth/roles/routes selon la story (AC: tous)
  - [ ] Utiliser Supabase Auth et les contrats/types existants, sans service-role cote client.
  - [ ] Ajouter les guards Expo Router dans les groupes de routes concernes.
  - [ ] Externaliser tous les libelles visibles FR/EN/ES.
- [ ] Tester les acces autorises et refuses (AC: securite)
  - [ ] Couvrir utilisateur non connecte, coach, eleve et mauvais role.

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

Le fichier precedent le plus proche est `1-3-mettre-en-place-le-socle-ui-tokens-themes-et-i18n.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Garde-fous d'architecture

- Utiliser Supabase/PostgreSQL comme source de verite pour les donnees metier.
- Respecter `snake_case` en base et `camelCase` dans les contrats TypeScript.
- Utiliser les contrats et schemas Zod partages dans `packages/shared/src/contracts` quand une entree/sortie API est concernee.
- Les mutations critiques passent par fonctions serveur transactionnelles; pas de CRUD client direct pour contourner les regles.
- Les dates/heures API sont en ISO 8601 UTC; le fuseau local reste a la frontiere UI.
- Les libelles visibles sont externalises FR/EN/ES quand une UI est modifiee.
- Les couleurs et valeurs visuelles applicatives viennent des tokens/theme, pas de valeurs hardcodees.

### Notes specifiques a cette story

Supabase Auth porte l'identite; RLS et guards Expo Router portent l'autorisation. Les secrets service-role restent hors client.

### Tests et verification minimum

- Lancer lint/typecheck/tests disponibles pour les packages touches.
- Ajouter ou mettre a jour les tests RLS, contrats, hooks, composants ou commandes selon le risque de la story.
- Verifier mobile-first et webapp pour toute surface UI.
- Verifier qu'aucun secret reel n'est present dans les fichiers suivis par git.
- Documenter toute verification impossible dans le Dev Agent Record.

### Previous Story Intelligence

Le fichier precedent le plus proche est `1-3-mettre-en-place-le-socle-ui-tokens-themes-et-i18n.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Git Intelligence

Les derniers commits connus sont documentaires et ne fournissent pas encore de pattern code applicatif stable. Appliquer les conventions de l'architecture BMAD et les patterns etablis par les stories precedemment implementees.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 1.4`
- `_bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules`
- `_bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries`
- `_bmad-output/planning-artifacts/prd.md#Exigences Fonctionnelles`
- `_bmad-output/planning-artifacts/ux-screen-inventory.md`
- `_bmad-output/planning-artifacts/ux-designs/ux-NextPoint-2026-06-07/EXPERIENCE.md`
- `_bmad-output/planning-artifacts/design-tokens.md`

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Story creee par generation BMAD create-story le 2026-06-21.
- Analyse de contexte: epics, architecture, PRD, UX, design tokens, sprint status et story precedente disponible.

### File List

- `_bmad-output/implementation-artifacts/1-4-creer-lauthentification-email-password-et-les-sessions.md`

## Completion Note

Ultimate context engine analysis completed - comprehensive developer guide created.
