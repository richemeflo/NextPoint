---
baseline_commit: 917d59ad5aec37f8a4016225cbc21574d4722d15
---

# Story 2.4: Consulter la fiche élève avec historique

Status: review

<!-- Note: Validation optionnelle. Lancer validate-create-story pour controle qualite avant dev-story. -->

## Story

As a coach,
I want consulter une fiche élève complète avec son historique,
so that je puisse préparer les cours et comprendre l’activité passée.

## Acceptance Criteria

1. Given un coach connecté When il ouvre une fiche élève associée Then il voit les informations de profil de l’élève And téléphone et email sont cliquables pour appel ou email lorsque la plateforme le permet.
2. Given une fiche élève When des demandes, cours confirmés, annulations, modifications ou packs existent Then l’historique affiche ces éléments de manière exploitable And les statuts sont lisibles et cohérents avec le reste de l’application.
3. Given une fiche élève sans historique When le coach l’ouvre Then un état vide clair est affiché And la fiche reste utilisable pour les autres actions disponibles.
4. Given un élève connecté When il tente d’accéder à la fiche coach détaillée contenant historique coach et note privée Then l’accès est refusé And la note privée n’est jamais exposée.
5. Given le MVP P0 When la fiche élève est affichée Then aucun suivi de progression sportive n’est inclus And l’historique reste centré sur demandes, cours, annulations, modifications et packs.
6. Given une fiche élève When le coach l’ouvre Then l’état du compte est affiché avec un badge traduit.
7. Given un compte `pending_activation` When le coach ouvre la fiche Then un bouton en haut à droite permet de générer ou régénérer un lien d’activation de 24 heures.
8. Given un lien généré When la commande réussit Then le coach peut le copier ou le partager And sa date d’expiration est visible.
9. Given un nouveau lien généré When un lien précédent existe Then l’ancien lien devient immédiatement invalide.
10. Given un compte `active`, `suspended` ou `deleted` When la fiche est ouverte Then le bouton n’est pas affiché And la commande serveur refuse la génération.
11. Given un utilisateur non autorisé When il tente de générer un lien Then l’accès est refusé And aucun jeton ou lien n’est retourné.

## Tasks / Subtasks

- [x] Verifier les preconditions et dependances de Story 2.4 (AC: tous)
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

Le fichier precedent le plus proche est `2-3-creer-une-fiche-eleve-manuellement.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

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

Le fichier precedent le plus proche est `2-3-creer-une-fiche-eleve-manuellement.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Git Intelligence

Les derniers commits connus sont documentaires et ne fournissent pas encore de pattern code applicatif stable. Appliquer les conventions de l'architecture BMAD et les patterns etablis par les stories precedemment implementees.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 2.4`
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

- Ajouter une route coach dynamique ouverte depuis la liste eleves.
- Charger le profil et un historique type via des queries Supabase protegees par RLS.
- Introduire un read model d'evenements compatible avec les futures stories demandes, cours et packs.
- Afficher l'etat du compte et limiter l'action d'activation a `pending_activation`.
- Reutiliser la commande serveur de Story 2.3 pour generer, regenerer, copier ou partager le lien.
- Couvrir contrats, schema, RLS, parcours Auth et compilation mobile/web.

### Debug Log References

- 2026-06-23: Baseline HEAD `917d59ad5aec37f8a4016225cbc21574d4722d15`; Story 2.3 et son cycle d'activation sont disponibles.
- 2026-06-23: Les domaines demandes, cours et packs ne disposent pas encore de tables implementees; la fiche utilisera un read model d'evenements extensible afin de ne pas simuler leurs modeles futurs.
- 2026-06-23: Tests RED confirmes sur le contrat d'evenements et le schema d'historique absents.
- 2026-06-23: Migration `0010` appliquee apres reset de la base Supabase locale uniquement; types TypeScript regeneres.
- 2026-06-23: Le read model exclut notes privees et progression sportive, refuse toute mutation client et limite la lecture au coach activement associe.
- 2026-06-23: Les statuts `refused` et `expired` ont ete ajoutes pour rester coherents avec la machine d'etat des futures demandes.
- 2026-06-23: La route `/coach/students/[studentId]` affiche profil, contacts cliquables, badge compte, historique et etat vide.
- 2026-06-23: La generation d'activation est visible uniquement pour `pending_activation`; copie Web, partage natif/web et expiration sont affiches.
- 2026-06-23: Validation finale: 31 tests TypeScript, 106 assertions SQL, huit integrations Supabase, typecheck, lint et export Expo Web de 21 routes passent.
- 2026-06-23: Aucun secret reel detecte; validation sur telephone physique non executee.

### Completion Notes List

- Story creee par generation BMAD create-story le 2026-06-21.
- Analyse de contexte: epics, architecture, PRD, UX, design tokens, sprint status et story precedente disponible.
- Les lignes de la liste eleves ouvrent maintenant une fiche coach dynamique et conservent les filtres existants de Story 2.2.
- La fiche affiche nom, niveau, age, sexe, telephone et email; les coordonnees utilisent les actions natives `tel:` et `mailto:`.
- Le badge de compte traduit couvre `pending_activation`, `active`, `suspended` et `deleted`.
- Un read model `student_history_events` ordonne les demandes, cours, annulations, modifications et packs sans introduire de suivi de progression sportive.
- Les evenements sont ecrits uniquement par `service_role`; les eleves et utilisateurs anonymes ne peuvent pas lire l'historique coach.
- L'etat vide laisse le profil et les actions disponibles lorsque aucun evenement n'existe.
- Le bouton haut droit genere ou regenere un lien de 24 heures seulement avant activation; le lien, son expiration, la copie Web et le partage sont proposes.
- La commande serveur refuse la generation pour les comptes actifs, suspendus, supprimes et pour les utilisateurs non coach.
- Verification: 31 tests TypeScript, 106 assertions SQL, huit integrations Supabase, typecheck, lint et export Expo Web de 21 routes.
- Verification restante non bloquante: rendu et partage sur telephone physique.

### File List

- `_bmad-output/implementation-artifacts/2-4-consulter-la-fiche-eleve-avec-historique.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/mobile/src/app/coach/students.tsx`
- `apps/mobile/src/app/coach/students/[studentId].tsx`
- `apps/mobile/src/components/ui/status-badge.tsx`
- `apps/mobile/src/features/students/student-account-service.ts`
- `apps/mobile/src/features/students/student-coach-service.ts`
- `apps/mobile/src/i18n/translations.ts`
- `package.json`
- `packages/shared/src/contracts/student-history.test.ts`
- `packages/shared/src/contracts/student-history.ts`
- `packages/shared/src/index.ts`
- `packages/shared/src/types/database.types.ts`
- `scripts/verify-manual-student-creation.mjs`
- `scripts/verify-student-detail-access.mjs`
- `supabase/migrations/0010_student_detail_history.sql`
- `supabase/tests/database/0008_student_detail_history.sql`

### Change Log

- 2026-06-23: Ajout de la fiche eleve coach avec profil, contacts, badge de compte et historique.
- 2026-06-23: Ajout du read model historique et de sa politique RLS coach uniquement.
- 2026-06-23: Ajout de la generation/regeneration, copie et partage du lien d'activation depuis la fiche.
- 2026-06-23: Ajout des contrats et tests de visibilite, securite et refus selon l'etat du compte.

## Completion Note

Ultimate context engine analysis completed - comprehensive developer guide created.
