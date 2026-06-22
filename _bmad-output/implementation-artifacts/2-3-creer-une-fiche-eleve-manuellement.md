---
baseline_commit: 6d518a4ff53f9f03a4d8eed46b25a2d1549b50ed
---

# Story 2.3: Créer une fiche élève manuellement

Status: review

<!-- Note: Validation optionnelle. Lancer validate-create-story pour controle qualite avant dev-story. -->

## Story

As a coach,
I want créer une fiche élève et provisionner son compte non activé,
so that je puisse la suivre immédiatement et lui transmettre ensuite un accès sécurisé.

## Acceptance Criteria

1. Given un coach connecté When il ouvre la création manuelle Then il peut renseigner nom, téléphone, email, niveau, âge et sexe And sauvegarder.
2. Given un email ou téléphone déjà utilisé When le coach sauvegarde Then une erreur traduite est affichée And aucun doublon ou compte partiel n’est créé.
3. Given des données valides When le coach sauvegarde Then un utilisateur Auth `eleve`, un profil `pending_activation` et une relation active sont provisionnés And l’élève apparaît dans la liste.
4. Given le compte provisionné When il n’est pas encore activé Then il ne peut pas se connecter aux surfaces privées And aucun mot de passe temporaire n’est exposé.
5. Given le cycle de vie du compte Then les états `pending_activation`, `active`, `suspended`, `deleted` sont stockés et contrôlés And ils restent distincts du statut de relation.
6. Given un utilisateur non coach When il tente de provisionner un élève Then l’accès est refusé And aucun compte, profil ou relation n’est créé.
7. Given une erreur pendant le provisionnement When la commande échoue Then une compensation supprime le compte Auth créé And aucun enregistrement orphelin ne subsiste.
8. Given un lien d’activation valide et non expiré When l’élève définit et confirme un mot de passe valide Then le mot de passe Auth est mis à jour And le compte passe à `active`.
9. Given un lien invalide, expiré, consommé ou révoqué When il est soumis Then aucun mot de passe ni état n’est modifié And une erreur traduite est affichée.
10. Given un nouveau lien généré pour le même compte When il est créé Then les anciens liens sont révoqués And le nouveau lien expire après 24 heures.

## Tasks / Subtasks

- [x] Verifier les preconditions et dependances de Story 2.3 (AC: tous)
  - [x] Relire les stories precedentes pertinentes et confirmer que leurs fichiers/contrats existent reellement.
  - [x] Identifier les fichiers UPDATE avant modification et les lire completement.
  - [x] Noter toute dependance manquante dans le Dev Agent Record avant de coder.
- [x] Implementer provisionnement et cycle de compte eleve (AC: tous)
  - [x] Garantir unicite email/telephone et etat de compte en base.
  - [x] Provisionner le compte Auth via commande serveur sans secret client.
  - [x] Ajouter jetons d'activation hashes, expiration 24h, revocation et consommation unique.
  - [x] Ajouter la page publique de definition du mot de passe et bloquer les comptes non actifs.
- [x] Implementer liste/fiche eleve selon la story (AC: tous)
  - [x] Filtrer par relation coach/eleve via RLS et queries typees.
  - [x] Gerer recherche, filtres niveau/age et etats vides mobile-first.
  - [x] Ne jamais exposer note privee cote eleve.
- [x] Tester provisionnement, activation et refus (AC: securite/UX)
  - [x] Couvrir doublons email/telephone, non-coach, lien expire/revoque/consomme et activation reussie.
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

Le fichier precedent le plus proche est `2-2-consulter-et-filtrer-la-liste-des-eleves.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

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

Le fichier precedent le plus proche est `2-2-consulter-et-filtrer-la-liste-des-eleves.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Git Intelligence

Les derniers commits connus sont documentaires et ne fournissent pas encore de pattern code applicatif stable. Appliquer les conventions de l'architecture BMAD et les patterns etablis par les stories precedemment implementees.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 2.3`
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

- Conserver `auth.users.id` comme identifiant eleve afin de rester compatible avec les relations et tarifs existants.
- Provisionner le compte Auth cote serveur, puis creer transactionnellement le profil `pending_activation` et la relation coach.
- Stocker uniquement le hash des jetons d'activation, revoquer les anciens jetons et imposer une expiration de 24 heures.
- Exposer une page publique qui definit le mot de passe, consomme le jeton une seule fois et active le compte.
- Bloquer les surfaces privees tant que le compte eleve n'est pas `active`.
- Reutiliser les contrats Zod, composants themes et traductions FR/EN/ES.

### Debug Log References

- 2026-06-22: Activation `bmad-dev-story` terminee sans etapes personnalisees prepend/append.
- 2026-06-22: Baseline HEAD `6d518a4ff53f9f03a4d8eed46b25a2d1549b50ed`; worktree propre.
- 2026-06-22: Preconditions confirmees: auth/roles, profils eleves, relation coach/eleve, liste filtree, RLS, contrats partages et tests locaux existent.
- 2026-06-22: Le modele existant dependait directement de `auth.users`; la migration doit introduire un identifiant profil stable et un `user_id` nullable pour permettre les fiches manuelles et un rapprochement futur non automatique.
- 2026-06-22: Tests RED confirmes sur les exports de contrat absents, la cle profil independante, `user_id` nullable et la commande SQL inexistante.
- 2026-06-22: Migration `0009` appliquee localement sans reset; l'integration a revele une recursion RLS entre profils et relations.
- 2026-06-22: Migration `0010` ajoutee avec helper d'autorisation `security definer`; les integrations RLS passent ensuite.
- 2026-06-22: `supabase db reset` execute uniquement sur la base locale Docker; migrations `0001` a `0010` et seed appliques avec succes.
- 2026-06-22: `npm test`, typecheck, lint, 83 assertions SQL et sept integrations Supabase passent.
- 2026-06-22: Expo Web exporte 19 routes statiques, dont `/coach/students`.
- 2026-06-22: Aucun secret reel detecte; la validation visuelle sur appareil physique n'a pas ete executee.
- 2026-06-22: Retour utilisateur: le formulaire manuel omettait le sexe et enregistrait implicitement `not_specified`; correction reprise en cours.
- 2026-06-22: Tests RED confirmes: le convertisseur manuel omettait `sex` et la signature SQL ne l'acceptait pas.
- 2026-06-22: Le formulaire manuel propose desormais le selecteur controle Femme/Homme/Autre/Prefere ne pas repondre et persiste la valeur choisie.
- 2026-06-22: Base locale resetee pour rejouer la migration corrigee; 27 tests TypeScript, 83 assertions SQL, sept integrations, typecheck, lint et export Web passent.
- 2026-06-22: Changement de sprint approuve: toute fiche manuelle provisionne desormais un compte Auth non active au lieu d'un profil sans compte.
- 2026-06-22: Le modele initial avec identifiant profil separe a ete retire; les identifiants `auth.users` existants restent la reference des profils, relations et tarifs.
- 2026-06-22: Migration `0009` remplacee par le cycle `pending_activation`, `active`, `suspended`, `deleted`, l'unicite normalisee email/telephone et les jetons d'activation hashes.
- 2026-06-22: Trois Edge Functions ajoutent le provisionnement coach, la generation/regeneration du lien et l'activation publique par nouveau mot de passe.
- 2026-06-22: Base Supabase locale resetee uniquement en local; migrations `0001` a `0009` et seed appliques avec succes.
- 2026-06-22: Validation finale: 29 tests TypeScript, 93 assertions SQL, sept integrations Supabase, typecheck, lint et export Expo Web de 20 routes passent.
- 2026-06-22: Aucun secret reel ajoute; le service role reste exclusivement dans les fonctions serveur.

### Completion Notes List

- Story creee par generation BMAD create-story le 2026-06-21.
- Analyse de contexte: epics, architecture, PRD, UX, design tokens, sprint status et story precedente disponible.
- La creation manuelle provisionne un utilisateur Auth `eleve`, puis cree son profil `pending_activation` et sa relation active `manual`.
- L'email et le telephone sont uniques apres normalisation; un echec de profil compense la creation Auth pour eviter les comptes partiels.
- Le formulaire mobile-first reutilise React Hook Form, Zod, les composants themes et les traductions FR/EN/ES.
- Le coach renseigne explicitement le sexe avec la meme liste controlee que le profil eleve; la valeur est validee puis transmise a la commande transactionnelle.
- La fiche nouvellement creee est ajoutee immediatement a la liste coach sans exposer de note privee.
- Les comptes utilisent les etats distincts `pending_activation`, `active`, `suspended` et `deleted`; seuls les eleves actifs franchissent le garde d'acces prive.
- Les liens d'activation sont opaques, hashes en base, valables 24 heures, a usage unique et regenerables uniquement avant activation.
- La regeneration revoque les anciens liens; l'activation definit le mot de passe choisi par l'eleve et passe le compte a `active`.
- La page publique `/activate-student` gere mot de passe, confirmation et retours traduits sans exposer de secret serveur.
- Le bouton de generation en haut a droite de la fiche reste volontairement rattache a Story 2.4, dont les criteres ont ete mis a jour.
- Tests: 29 tests TypeScript, 93 assertions SQL, sept integrations Supabase et export Web de 20 routes sans regression.
- Verification restante non bloquante: controle visuel sur telephone physique du formulaire, du clavier et du retour succes.

### File List

- `_bmad-output/implementation-artifacts/2-3-creer-une-fiche-eleve-manuellement.md`
- `_bmad-output/implementation-artifacts/2-4-consulter-la-fiche-eleve-avec-historique.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/planning-artifacts/decision-log.md`
- `_bmad-output/planning-artifacts/epics.md`
- `_bmad-output/planning-artifacts/prd.md`
- `_bmad-output/planning-artifacts/product-brief.md`
- `_bmad-output/planning-artifacts/sprint-change-proposal-2026-06-22.md`
- `_bmad-output/planning-artifacts/ux-designs/ux-NextPoint-2026-06-07/EXPERIENCE.md`
- `_bmad-output/planning-artifacts/ux-screen-inventory.md`
- `apps/mobile/src/app/_layout.tsx`
- `apps/mobile/src/app/activate-student.tsx`
- `apps/mobile/src/app/coach/students.tsx`
- `apps/mobile/src/features/auth/auth-context.ts`
- `apps/mobile/src/features/auth/auth-provider.tsx`
- `apps/mobile/src/features/auth/role-service.ts`
- `apps/mobile/src/features/students/manual-student-form.tsx`
- `apps/mobile/src/features/students/student-account-service.ts`
- `apps/mobile/src/features/students/student-coach-service.ts`
- `apps/mobile/src/i18n/translations.ts`
- `package.json`
- `packages/shared/src/contracts/student-account.test.ts`
- `packages/shared/src/contracts/student-account.ts`
- `packages/shared/src/contracts/student-profile.test.ts`
- `packages/shared/src/contracts/student-profile.ts`
- `packages/shared/src/index.ts`
- `packages/shared/src/types/database.types.ts`
- `scripts/verify-manual-student-creation.mjs`
- `scripts/verify-student-list-access.mjs`
- `supabase/config.toml`
- `supabase/functions/_shared/http.ts`
- `supabase/functions/_shared/security.ts`
- `supabase/functions/_shared/supabase.ts`
- `supabase/functions/activate-student-account/index.ts`
- `supabase/functions/create-manual-student/index.ts`
- `supabase/functions/generate-student-activation-link/index.ts`
- `supabase/migrations/0009_manual_student_profiles.sql`
- `supabase/tests/database/0003_student_profiles.sql`
- `supabase/tests/database/0005_student_coach_relationships.sql`
- `supabase/tests/database/0007_student_account_activation.sql`

### Change Log

- 2026-06-22: Ajout du modele de fiche eleve sans compte et de la commande transactionnelle coach.
- 2026-06-22: Ajout du formulaire traduit de creation manuelle dans la liste des eleves.
- 2026-06-22: Migration des relations et ciblages tarifaires vers l'identifiant metier du profil.
- 2026-06-22: Ajout des tests de contrat, schema, RLS et integration de creation/refus/rapprochement futur.
- 2026-06-22: Correction apres retour utilisateur pour ajouter le sexe au formulaire, au contrat et a la commande SQL de creation manuelle.
- 2026-06-22: Remplacement du profil sans compte par un compte Auth `pending_activation` et ajout du cycle de vie de compte.
- 2026-06-22: Ajout des liens d'activation securises de 24 heures, regenerables avant activation et consommables une seule fois.
- 2026-06-22: Ajout de la page publique permettant a l'eleve de choisir son mot de passe et d'activer son compte.

## Completion Note

Ultimate context engine analysis completed - comprehensive developer guide created.
