---
baseline_commit: b3c847b37e5c7a4d2fb5d806bed934e2431b356e
---

# Story 1.5: Gérer les rôles, routes protégées et navigation coach/élève

Status: review

<!-- Note: Validation optionnelle. Lancer validate-create-story pour controle qualite avant dev-story. -->

## Story

As a utilisateur authentifié,
I want accéder uniquement aux écrans correspondant à mon rôle,
so that les parcours coach et élève restent clairs et protégés.

## Acceptance Criteria

1. Given un utilisateur authentifié avec le rôle `coach` When il ouvre l’application Then il est dirigé vers l’espace coach And il voit la navigation mobile coach avec Planning, Disponibilités, Élèves, Stats, Notifications, Messagerie et Profil.
2. Given un utilisateur authentifié avec le rôle `élève` When il ouvre l’application Then il est dirigé vers l’espace élève And il voit la navigation mobile élève avec Accueil, Planning/Demandes, Notifications et Compte.
3. Given un utilisateur non authentifié When il tente d’ouvrir une route coach ou élève protégée Then il est redirigé vers l’espace public ou auth And les données privées ne sont pas chargées.
4. Given un élève authentifié When il tente d’accéder à une route coach Then l’accès est refusé And aucune fonction coach n’est disponible.
5. Given un coach authentifié When il tente d’accéder à une route élève non pertinente Then l’accès est refusé ou redirigé selon la règle de navigation And les responsabilités de rôle restent séparées.
6. Given un visiteur non inscrit When il ouvre la page publique Then il voit une présentation courte du coach et le bouton principal `S’inscrire` And les disponibilités ne sont pas affichées avant inscription.

## Tasks / Subtasks

- [x] Verifier les preconditions et dependances de Story 1.5 (AC: tous)
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

Le fichier precedent le plus proche est `1-4-creer-lauthentification-email-password-et-les-sessions.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

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

Le fichier precedent le plus proche est `1-4-creer-lauthentification-email-password-et-les-sessions.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Git Intelligence

Les derniers commits connus sont documentaires et ne fournissent pas encore de pattern code applicatif stable. Appliquer les conventions de l'architecture BMAD et les patterns etablis par les stories precedemment implementees.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 1.5`
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
- 2026-06-21: Story 1.4 confirmee en review et validee sur telephone physique par Flo.
- 2026-06-21: Worktree contenant les changements non commites de Story 1.4; implementation 1.5 poursuivie par-dessus sans revert.
- 2026-06-21: Perimetre confirme: role source de verite en base, guards distincts coach/eleve, page publique sans disponibilites.
- 2026-06-21: Story 1.4 commitee en parallele par Flo au commit `b3c847b37e5c7a4d2fb5d806bed934e2431b356e`; baseline 1.5 alignee sur ce commit.
- 2026-06-21: Migrations appliquees avec `supabase migration up` sans reset afin de conserver les comptes locaux; les comptes existants sans role sont repris comme `eleve`.
- 2026-06-21: `npm run typecheck`, `npm run lint`, `npm test`, `npm run supabase:test:db`, `npm run test:auth:roles` et `npx expo install --check` passent.
- 2026-06-21: Les 14 routes publiques/auth/coach/eleve compilent sur Expo Web et retournent HTTP 200.
- 2026-06-21: Validation physique de la nouvelle navigation 1.5 non executee; la validation telephone confirmee par Flo concernait Story 1.4.

### Completion Notes List

- Story creee par generation BMAD create-story le 2026-06-21.
- Analyse de contexte: epics, architecture, PRD, UX, design tokens, sprint status et story precedente disponible.
- Implementation finalisee sur la baseline Story 1.4 `b3c847b37e5c7a4d2fb5d806bed934e2431b356e`.
- Role `coach`/`eleve` stocke dans `user_roles`, cree par trigger Auth, lisible uniquement par son proprietaire et non modifiable par le client.
- Contrainte P0 single-coach ajoutee en base; le role serveur reste lisible par execution de confiance sans exposer de cle privilegiee au client.
- Formulaire d'inscription enrichi d'un controle segmente de role; la session charge le role via RLS avant d'ouvrir une route privee.
- Guards Expo Router distincts pour `/coach/*` et `/eleve/*`; un mauvais role est redirige vers la page publique puis vers son propre espace.
- Navigation coach expose Planning, Disponibilites, Eleves, Stats, Notifications, Messagerie et Profil; navigation eleve expose Accueil, Planning/Demandes, Notifications et Compte.
- Page publique ajoutee avec presentation coach, tarifs en attente de configuration et bouton principal `S'inscrire`, sans disponibilites.
- Tests: 10 tests TypeScript, 13 assertions SQL et integration locale couvrant trigger, RLS propre utilisateur, refus cross-user, refus de mutation et coach unique.

### File List

- `_bmad-output/implementation-artifacts/1-5-gerer-les-roles-routes-protegees-et-navigation-coach-eleve.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/mobile/src/app/_layout.tsx`
- `apps/mobile/src/app/index.tsx`
- `apps/mobile/src/app/coach/_layout.tsx`
- `apps/mobile/src/app/coach/index.tsx`
- `apps/mobile/src/app/coach/availability.tsx`
- `apps/mobile/src/app/coach/students.tsx`
- `apps/mobile/src/app/coach/stats.tsx`
- `apps/mobile/src/app/coach/notifications.tsx`
- `apps/mobile/src/app/coach/messaging.tsx`
- `apps/mobile/src/app/coach/profile.tsx`
- `apps/mobile/src/app/eleve/_layout.tsx`
- `apps/mobile/src/app/eleve/index.tsx`
- `apps/mobile/src/app/eleve/planning.tsx`
- `apps/mobile/src/app/eleve/notifications.tsx`
- `apps/mobile/src/app/eleve/account.tsx`
- `apps/mobile/src/features/auth/access-policy.ts`
- `apps/mobile/src/features/auth/access-policy.test.ts`
- `apps/mobile/src/features/auth/auth-context.ts`
- `apps/mobile/src/features/auth/auth-provider.tsx`
- `apps/mobile/src/features/auth/auth-screen.tsx`
- `apps/mobile/src/features/auth/auth-service.ts`
- `apps/mobile/src/features/auth/role-service.ts`
- `apps/mobile/src/features/navigation/role-navigation.tsx`
- `apps/mobile/src/features/navigation/role-screen.tsx`
- `apps/mobile/src/i18n/translations.ts`
- `package.json`
- `packages/shared/src/contracts/auth.ts`
- `packages/shared/src/contracts/auth.test.ts`
- `packages/shared/src/domain/roles.ts`
- `packages/shared/src/index.ts`
- `packages/shared/src/types/database.types.ts`
- `scripts/verify-auth-roles.mjs`
- `supabase/migrations/0002_user_roles.sql`
- `supabase/migrations/0003_user_roles_service_access.sql`
- `supabase/tests/database/0002_user_roles.sql`
- `tsconfig.tests.json`
- Supprimes: `apps/mobile/src/app/(app)/_layout.tsx`, `apps/mobile/src/app/(app)/index.tsx`, `apps/mobile/src/app/(app)/explore.tsx`.
- Supprimes: `apps/mobile/src/components/app-tabs.tsx`, `apps/mobile/src/components/app-tabs.web.tsx`.

### Change Log

- 2026-06-21: Ajout du modele de roles, du trigger Auth, des grants et des politiques RLS.
- 2026-06-21: Ajout de la selection de role a l'inscription et du chargement de role dans la session.
- 2026-06-21: Ajout de la page publique et des espaces/navigations proteges coach et eleve.
- 2026-06-21: Ajout des tests SQL, unitaires et integration locale de securite des roles.

## Completion Note

Ultimate context engine analysis completed - comprehensive developer guide created.
