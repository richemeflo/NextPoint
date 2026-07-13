---
baseline_commit: 2394e5eebd254df02a8af3d4d4f038e28fa10407
---

# Story 5.2: Gérer les permissions et jetons de notification push

Status: review

<!-- Note: Validation optionnelle. Lancer validate-create-story pour controle qualite avant dev-story. -->

## Story

As a utilisateur NextPoint,
I want pouvoir accepter ou refuser les notifications push système,
so that l’application respecte mes préférences tout en gardant l’historique in-app.

## Acceptance Criteria

1. Given un utilisateur connecté sur un appareil compatible When l’application demande l’autorisation push Then l’utilisateur peut accepter ou refuser And son choix ne bloque pas l’accès aux notifications in-app.
2. Given un utilisateur qui accepte les notifications push When un jeton push est obtenu Then le jeton est associé à l’utilisateur courant And il peut être utilisé par les événements fonctionnels.
3. Given un utilisateur qui refuse les notifications push When un événement important le concerne Then aucune hypothèse de livraison push n’est faite And une notification in-app est quand même créée.
4. Given un changement de jeton ou d’appareil When l’application détecte le nouveau jeton Then l’enregistrement est mis à jour de façon sécurisée And les anciens états incohérents sont évités autant que possible.
5. Given l’app cliente When elle gère les notifications push Then aucun secret fournisseur ou service-role n’est exposé côté client And les détails du fournisseur push restent encapsulés.

## Tasks / Subtasks

- [x] Verifier les preconditions et dependances de Story 5.2 (AC: tous)
  - [x] Relire les stories precedentes pertinentes et confirmer que leurs fichiers/contrats existent reellement.
  - [x] Identifier les fichiers UPDATE avant modification et les lire completement.
  - [x] Noter toute dependance manquante dans le Dev Agent Record avant de coder.
- [x] Implementer permissions et jetons push (AC: tous)
  - [x] Utiliser le fournisseur push retenu seulement apres decision explicite si absent.
  - [x] Stocker les jetons associes a l'utilisateur courant sans secret cote client.
  - [x] Garder l'in-app fonctionnelle si permission push refusee.
- [x] Tester acceptation/refus/changement de jeton (AC: securite/UX)
  - [x] Couvrir appareil compatible et environnement web si push non disponible.

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

### 4. Choix du fournisseur push

Intervention possible: choisir ou confirmer le fournisseur de notification push.

Etapes ultra precises:

1. Si aucun fournisseur n'est decide, le dev agent propose l'option compatible Expo la plus simple et documente l'alternative.
2. Flo confirme le fournisseur avant tout code irreversible ou configuration externe.
3. Les secrets fournisseur restent hors app cliente et hors fichiers suivis par git.
4. Si la validation push physique est impossible, le dev agent valide au moins le fallback notification in-app.


## Dev Notes

### Execution locale dans ce workspace

Dans ce repo, lancer les commandes depuis WSL a la racine `/mnt/c/Users/Richeme/Playground/NextPoint` et respecter `RTK.md`: prefixer les commandes shell avec `rtk`. Les snippets issus de docs officielles indiquent la commande outil; dans ce workspace, les executer via `rtk` sauf cas necessitant `rtk proxy`.

### Preconditions et dependances

- Les evenements de booking de l'Epic 4 doivent exister pour les notifications fonctionnelles.
- Le centre in-app doit rester source de verite meme si le push echoue.
- Aucun secret fournisseur push ne doit etre expose cote client.

Le fichier precedent le plus proche est `5-1-creer-le-modele-et-le-centre-de-notifications-in-app.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Garde-fous d'architecture

- Utiliser Supabase/PostgreSQL comme source de verite pour les donnees metier.
- Respecter `snake_case` en base et `camelCase` dans les contrats TypeScript.
- Utiliser les contrats et schemas Zod partages dans `packages/shared/src/contracts` quand une entree/sortie API est concernee.
- Les mutations critiques passent par fonctions serveur transactionnelles; pas de CRUD client direct pour contourner les regles.
- Les dates/heures API sont en ISO 8601 UTC; le fuseau local reste a la frontiere UI.
- Les libelles visibles sont externalises FR/EN/ES quand une UI est modifiee.
- Les couleurs et valeurs visuelles applicatives viennent des tokens/theme, pas de valeurs hardcodees.

### Notes specifiques a cette story

Le push est un canal optionnel systeme; les secrets fournisseur restent serveur. Le refus de permission ne bloque jamais le centre in-app.

### Tests et verification minimum

- Lancer lint/typecheck/tests disponibles pour les packages touches.
- Ajouter ou mettre a jour les tests RLS, contrats, hooks, composants ou commandes selon le risque de la story.
- Verifier mobile-first et webapp pour toute surface UI.
- Verifier qu'aucun secret reel n'est present dans les fichiers suivis par git.
- Documenter toute verification impossible dans le Dev Agent Record.

### Previous Story Intelligence

Le fichier precedent le plus proche est `5-1-creer-le-modele-et-le-centre-de-notifications-in-app.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Git Intelligence

Les derniers commits connus sont documentaires et ne fournissent pas encore de pattern code applicatif stable. Appliquer les conventions de l'architecture BMAD et les patterns etablis par les stories precedemment implementees.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 5.2`
- `_bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules`
- `_bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries`
- `_bmad-output/planning-artifacts/prd.md#Exigences Fonctionnelles`
- `_bmad-output/planning-artifacts/ux-screen-inventory.md`
- `_bmad-output/planning-artifacts/ux-designs/ux-NextPoint-2026-06-07/EXPERIENCE.md`
- `_bmad-output/planning-artifacts/design-tokens.md`

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- `rtk npm run shared:typecheck`
- `rtk npm run mobile:typecheck`
- `rtk npm run test:auth`
- `rtk npm run mobile:lint`
- `rtk npm run supabase:db:reset`
- `rtk npm run supabase:test:db`

### Completion Notes List

- Story creee par generation BMAD create-story le 2026-06-21.
- Analyse de contexte: epics, architecture, PRD, UX, design tokens, sprint status et story precedente disponible.
- Preferences push et jetons sont geres par RPC serveur sans exposer de secret ni lecture directe des jetons cote client.
- Le client natif utilise Expo Notifications pour demander la permission et enregistrer un Expo push token; le web reste en preference sans token natif.
- Une Edge Function Supabase envoie les tentatives push `pending` vers l'API Expo apres les mutations booking.
- Le refus push desactive les jetons et ne bloque jamais les notifications in-app.
- Validation: typecheck shared/mobile, tests Node, lint Expo, reset DB local et tests Supabase DB passent.

### File List

- `_bmad-output/implementation-artifacts/5-2-gerer-les-permissions-et-jetons-de-notification-push.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/mobile/app.json`
- `apps/mobile/package.json`
- `apps/mobile/src/app/_layout.tsx`
- `apps/mobile/src/features/notifications/notification-center-screen.tsx`
- `apps/mobile/src/features/notifications/notification-service.ts`
- `apps/mobile/src/features/notifications/push-notification-handler.ts`
- `apps/mobile/src/features/notifications/push-permission.ts`
- `apps/mobile/src/i18n/translations.ts`
- `package-lock.json`
- `package.json`
- `packages/shared/src/contracts/notification.test.ts`
- `packages/shared/src/contracts/notification.ts`
- `packages/shared/src/index.ts`
- `packages/shared/src/types/database.types.ts`
- `supabase/config.toml`
- `supabase/functions/send-pending-push-notifications/index.ts`
- `supabase/migrations/0023_notifications.sql`
- `supabase/tests/database/0013_notifications.sql`

### Change Log

- 2026-06-30: Implementation preferences/jetons push Expo, sender Supabase et fallback in-app.

## Completion Note

Ultimate context engine analysis completed - comprehensive developer guide created.
