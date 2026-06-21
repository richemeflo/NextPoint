---
baseline_commit: e3820efc56c1822d6ea3299451f517306b6e3c29
---

# Story 1.4: Créer l’authentification email/password et les sessions

Status: review

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

- [x] Verifier les preconditions et dependances de Story 1.4 (AC: tous)
  - [x] Relire les stories precedentes pertinentes et confirmer que leurs fichiers/contrats existent reellement.
  - [x] Identifier les fichiers UPDATE avant modification et les lire completement.
  - [x] Noter toute dependance manquante dans le Dev Agent Record avant de coder.
- [x] Implementer le flux auth/roles/routes selon la story (AC: tous)
  - [x] Utiliser Supabase Auth et les contrats/types existants, sans service-role cote client.
  - [x] Ajouter les guards Expo Router dans les groupes de routes concernes.
  - [x] Externaliser tous les libelles visibles FR/EN/ES.
- [x] Tester les acces autorises et refuses (AC: securite)
  - [x] Couvrir utilisateur non connecte, coach, eleve et mauvais role.

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

Codex GPT-5

### Debug Log References

- 2026-06-21: Activation `bmad-dev-story` effectuee; workflow personnalise resolu sans etapes prepend/append.
- 2026-06-21: Baseline git propre confirmee au commit `e3820efc56c1822d6ea3299451f517306b6e3c29`.
- 2026-06-21: Preconditions confirmees: stories 1.1 a 1.3 en review, Supabase local initialise, variables publiques documentees, socle theme/i18n disponible.
- 2026-06-21: Perimetre confirme avec l'architecture: Story 1.4 gere identite, session et acces connecte/non connecte; l'autorisation par role reste dans Story 1.5.
- 2026-06-21: Aucune dependance bloquante manquante identifiee.
- 2026-06-21: Integration Supabase locale validee avec une fixture temporaire: inscription avec session, deconnexion, reconnexion avec session, puis suppression de la fixture.
- 2026-06-21: `npm run typecheck`, `npm run lint`, `npm test`, `npm run supabase:test:db` et `npx expo install --check` passent.
- 2026-06-21: Expo Web compile et retourne HTTP 200 pour `/`, `/sign-in` et `/sign-up`; validation sur appareil physique non executee.
- 2026-06-21: Audit npm: 11 vulnerabilites moderees transitives dans l'outillage Expo via `uuid`/`xcode`; la correction force Expo 46 et n'est pas appliquee.

### Completion Notes List

- Story creee par generation BMAD create-story le 2026-06-21.
- Analyse de contexte: epics, architecture, PRD, UX, design tokens, sprint status et story precedente disponible.
- Implementation demarree avec baseline git `e3820efc56c1822d6ea3299451f517306b6e3c29`.
- Client Supabase universel ajoute avec stockage AsyncStorage sur mobile, persistance de session, refresh au premier plan et cle publique uniquement.
- Provider auth ajoute pour restaurer la session et exposer inscription, connexion et deconnexion sans afficher les erreurs techniques Supabase.
- Routes reorganisees en groupes `(auth)` et `(app)` proteges par `Stack.Protected`; une deconnexion retire automatiquement l'acces au groupe applicatif.
- Formulaires React Hook Form + Zod ajoutes avec erreurs de champ et erreurs auth traduites en FR/EN/ES.
- Contrats et tests couvrent donnees invalides, mapping d'erreurs, utilisateur non connecte et frontiere applicative partagee pour `coach` et `eleve`.
- Le refus des routes d'un mauvais role n'est volontairement pas implemente dans cette story: la frontiere testee confirme que cette decision appartient a Story 1.5.
- Les trois fichiers d'exemple utilisent `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`; aucune cle secrete ou service-role n'est presente dans le client.

### File List

- `_bmad-output/implementation-artifacts/1-4-creer-lauthentification-email-password-et-les-sessions.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `.env.example`
- `env.example`
- `apps/mobile/.env.example`
- `apps/mobile/package.json`
- `apps/mobile/tsconfig.json`
- `apps/mobile/src/app/_layout.tsx`
- `apps/mobile/src/app/(app)/_layout.tsx`
- `apps/mobile/src/app/(app)/index.tsx`
- `apps/mobile/src/app/(app)/explore.tsx`
- `apps/mobile/src/app/(auth)/_layout.tsx`
- `apps/mobile/src/app/(auth)/sign-in.tsx`
- `apps/mobile/src/app/(auth)/sign-up.tsx`
- `apps/mobile/src/components/external-link.tsx`
- `apps/mobile/src/components/ui/button.tsx`
- `apps/mobile/src/components/ui/text-field.tsx`
- `apps/mobile/src/features/auth/access-policy.ts`
- `apps/mobile/src/features/auth/access-policy.test.ts`
- `apps/mobile/src/features/auth/auth-context.ts`
- `apps/mobile/src/features/auth/auth-error.ts`
- `apps/mobile/src/features/auth/auth-error.test.ts`
- `apps/mobile/src/features/auth/auth-provider.tsx`
- `apps/mobile/src/features/auth/auth-screen.tsx`
- `apps/mobile/src/features/auth/auth-service.ts`
- `apps/mobile/src/i18n/index.ts`
- `apps/mobile/src/i18n/translations.ts`
- `apps/mobile/src/lib/supabase/client.ts`
- `package.json`
- `package-lock.json`
- `packages/shared/package.json`
- `packages/shared/tsconfig.json`
- `packages/shared/src/contracts/auth.ts`
- `packages/shared/src/contracts/auth.test.ts`
- `packages/shared/src/index.ts`
- `scripts/verify-env-examples.mjs`
- `tsconfig.tests.json`
- Deplaces: `apps/mobile/src/app/index.tsx` et `apps/mobile/src/app/explore.tsx` vers `apps/mobile/src/app/(app)/`.
- Supprime: `apps/mobile/src/types/expo-template-shims.d.ts`.

### Change Log

- 2026-06-21: Ajout du client Supabase public, de la persistance de session et du provider auth.
- 2026-06-21: Ajout des formulaires inscription/connexion traduits et de la deconnexion.
- 2026-06-21: Reorganisation Expo Router en groupes auth/app avec routes protegees.
- 2026-06-21: Ajout des contrats Zod, tests auth/acces et validation d'integration Supabase locale.

## Completion Note

Ultimate context engine analysis completed - comprehensive developer guide created.
