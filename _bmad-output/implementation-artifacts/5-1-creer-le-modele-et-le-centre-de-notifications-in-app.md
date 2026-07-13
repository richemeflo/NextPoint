---
baseline_commit: 2394e5eebd254df02a8af3d4d4f038e28fa10407
---

# Story 5.1: Créer le modèle et le centre de notifications in-app

Status: review

<!-- Note: Validation optionnelle. Lancer validate-create-story pour controle qualite avant dev-story. -->

## Story

As a utilisateur NextPoint,
I want consulter mes notifications in-app récentes,
so that je retrouve les événements importants même sans notification push système.

## Acceptance Criteria

1. Given un coach connecté When il ouvre l’onglet Notifications Then il voit ses notifications in-app récentes And les notifications des autres utilisateurs ne sont pas exposées.
2. Given un élève connecté When il ouvre l’onglet Notifications Then il voit ses notifications in-app récentes And les notifications des autres utilisateurs ne sont pas exposées.
3. Given une notification in-app When elle est affichée Then elle contient un type, un titre ou contenu court, un état lu/non lu et une date And elle peut référencer un événement ou une réservation concernée.
4. Given une liste vide de notifications When l’utilisateur ouvre l’onglet Then un état vide clair est affiché And l’écran reste disponible même sans autorisation push système.
5. Given les règles d’accès When un utilisateur tente de lire les notifications d’un autre utilisateur Then l’accès est refusé côté backend And aucune donnée de notification privée n’est retournée.

## Tasks / Subtasks

- [x] Verifier les preconditions et dependances de Story 5.1 (AC: tous)
  - [x] Relire les stories precedentes pertinentes et confirmer que leurs fichiers/contrats existent reellement.
  - [x] Identifier les fichiers UPDATE avant modification et les lire completement.
  - [x] Noter toute dependance manquante dans le Dev Agent Record avant de coder.
- [x] Implementer modele/flux notification selon la story (AC: tous)
  - [x] Creer une notification in-app miroir pour chaque evenement fonctionnel.
  - [x] Lier notification a demande/reservation/evenement si applicable.
  - [x] Proteger lecture et etat lu/non lu par utilisateur destinataire.
- [x] Tester fallback sans push (AC: robustesse)
  - [x] Verifier que l'in-app reste creee meme si la livraison push echoue ou est refusee.

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

- Les evenements de booking de l'Epic 4 doivent exister pour les notifications fonctionnelles.
- Le centre in-app doit rester source de verite meme si le push echoue.
- Aucun secret fournisseur push ne doit etre expose cote client.

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

Toute notification push fonctionnelle doit avoir un miroir in-app. L'in-app reste disponible meme si le push est refuse ou echoue.

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

- `_bmad-output/planning-artifacts/epics.md#Story 5.1`
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
- Modele Supabase ajoute pour notifications in-app, preferences push, jetons push et journal de tentative push.
- Centre de notifications coach/eleve remplace les placeholders et reste utilisable sans autorisation push systeme.
- RLS et RPC protegent la lecture et les mutations de notification par destinataire.
- Validation: typecheck shared/mobile, tests Node, lint Expo, reset DB local et tests Supabase DB passent.

### File List

- `_bmad-output/implementation-artifacts/5-1-creer-le-modele-et-le-centre-de-notifications-in-app.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/mobile/app.json`
- `apps/mobile/package.json`
- `apps/mobile/src/app/_layout.tsx`
- `apps/mobile/src/app/coach/notifications.tsx`
- `apps/mobile/src/app/eleve/notifications.tsx`
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

- 2026-06-30: Implementation du modele notifications in-app, du centre UI et des validations associees.

## Completion Note

Ultimate context engine analysis completed - comprehensive developer guide created.
