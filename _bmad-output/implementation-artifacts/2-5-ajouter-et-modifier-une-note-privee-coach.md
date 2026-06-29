---
baseline_commit: 917d59ad5aec37f8a4016225cbc21574d4722d15
---

# Story 2.5: Ajouter et modifier une note privée coach

Status: review

<!-- Note: Validation optionnelle. Lancer validate-create-story pour controle qualite avant dev-story. -->

## Story

As a coach,
I want ajouter et modifier une note privée unique sur un élève,
so that je puisse conserver un rappel utile sans l’exposer à l’élève.

## Acceptance Criteria

1. Given un coach sur la fiche d’un élève associé When il ajoute une note privée et sauvegarde Then la note est persistée And elle reste visible uniquement par le coach propriétaire.
2. Given une note privée existante When le coach clique sur `Modifier` Then la note devient éditable And elle n’est sauvegardée qu’après action explicite `Enregistrer`.
3. Given une note en cours d’édition When le coach quitte sans enregistrer ou annule l’édition Then les changements non sauvegardés ne remplacent pas la note existante And l’interface ne fait pas d’autosave.
4. Given un élève connecté When il consulte ses données ou ses réservations Then aucune note privée coach n’est retournée ou affichée And ce comportement est couvert par un test d’autorisation/RLS.
5. Given un autre coach ou utilisateur non propriétaire When il tente de lire ou modifier la note privée Then l’accès est refusé côté backend And aucune donnée sensible n’est exposée dans la réponse.

## Tasks / Subtasks

- [x] Verifier les preconditions et dependances de Story 2.5 (AC: tous)
  - [x] Relire les stories precedentes pertinentes et confirmer que leurs fichiers/contrats existent reellement.
  - [x] Identifier les fichiers UPDATE avant modification et les lire completement.
  - [x] Noter toute dependance manquante dans le Dev Agent Record avant de coder.
- [x] Implementer note privee coach (AC: tous)
  - [x] Utiliser flux `Modifier` puis `Enregistrer`; pas d'autosave.
  - [x] Stocker et lire seulement pour le coach autorise via RLS.
  - [x] Ne jamais inclure la note dans les read models eleve.
- [x] Ajouter tests RLS obligatoires (AC: confidentialite)
  - [x] Prouver qu'un eleve ne peut ni lire ni modifier la note privee.

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

Le fichier precedent le plus proche est `2-4-consulter-la-fiche-eleve-avec-historique.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Garde-fous d'architecture

- Utiliser Supabase/PostgreSQL comme source de verite pour les donnees metier.
- Respecter `snake_case` en base et `camelCase` dans les contrats TypeScript.
- Utiliser les contrats et schemas Zod partages dans `packages/shared/src/contracts` quand une entree/sortie API est concernee.
- Les mutations critiques passent par fonctions serveur transactionnelles; pas de CRUD client direct pour contourner les regles.
- Les dates/heures API sont en ISO 8601 UTC; le fuseau local reste a la frontiere UI.
- Les libelles visibles sont externalises FR/EN/ES quand une UI est modifiee.
- Les couleurs et valeurs visuelles applicatives viennent des tokens/theme, pas de valeurs hardcodees.

### Notes specifiques a cette story

La confidentialite de la note privee est critique: RLS, tests et absence de projection cote eleve sont obligatoires.

### Tests et verification minimum

- Lancer lint/typecheck/tests disponibles pour les packages touches.
- Ajouter ou mettre a jour les tests RLS, contrats, hooks, composants ou commandes selon le risque de la story.
- Verifier mobile-first et webapp pour toute surface UI.
- Verifier qu'aucun secret reel n'est present dans les fichiers suivis par git.
- Documenter toute verification impossible dans le Dev Agent Record.

### Previous Story Intelligence

Le fichier precedent le plus proche est `2-4-consulter-la-fiche-eleve-avec-historique.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Git Intelligence

Les derniers commits connus sont documentaires et ne fournissent pas encore de pattern code applicatif stable. Appliquer les conventions de l'architecture BMAD et les patterns etablis par les stories precedemment implementees.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 2.5`
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

- Creer une table de note privee separee des profils et historiques eleve.
- Garantir une note unique par couple coach/eleve et proteger sa lecture par RLS.
- Interdire les mutations CRUD directes et exposer une commande explicite `save_student_private_note`.
- Separer contenu persiste et brouillon UI pour garantir l'absence d'autosave.
- Integrer ajout, modification, annulation et feedback traduit dans la fiche de Story 2.4.
- Couvrir contrat, transitions d'edition, schema, RLS et parcours d'autorisation.

### Debug Log References

- 2026-06-23: Baseline HEAD `917d59ad5aec37f8a4016225cbc21574d4722d15`; worktree contenant la Story 2.4 conserve comme dependance directe.
- 2026-06-23: Preconditions confirmees: fiche eleve coach, relation active, Auth/RLS, composants de formulaire et tests Supabase locaux existent.
- 2026-06-23: Aucun modele de note privee n'existe; il sera cree dans une table separee pour ne jamais integrer les read models profil/historique eleve.
- 2026-06-23: Tests RED confirmes sur le contrat, la table, l'unicite et la commande de sauvegarde absents.
- 2026-06-23: Migration `0011` appliquee apres reset de la base Supabase locale uniquement; types TypeScript regeneres.
- 2026-06-23: La table autorise uniquement les lectures RLS du coach proprietaire; insert/update directs sont retires aux clients.
- 2026-06-23: La commande `save_student_private_note` deduit le coach depuis `auth.uid()`, exige le role coach et une relation active.
- 2026-06-23: L'integration a confirme la contrainte P0 de coach unique; le refus non-proprietaire est couvert avec un second utilisateur eleve.
- 2026-06-23: L'editeur maintient separement contenu persiste et brouillon; seule l'action `Enregistrer` remplace la valeur serveur.
- 2026-06-23: Validation finale: 38 tests TypeScript, 118 assertions SQL, neuf integrations Supabase, typecheck, lint et export Expo Web de 21 routes passent.
- 2026-06-23: Aucun secret reel detecte; validation sur telephone physique non executee.

### Completion Notes List

- Story creee par generation BMAD create-story le 2026-06-21.
- Analyse de contexte: epics, architecture, PRD, UX, design tokens, sprint status et story precedente disponible.
- La fiche eleve affiche une carte `Note privee coach`, chargee independamment du profil et de l'historique.
- Le coach peut ajouter une note, cliquer sur `Modifier`, changer un brouillon puis choisir explicitement `Enregistrer` ou `Annuler`.
- Annuler restaure la derniere valeur persistee; quitter sans sauvegarder ne declenche aucun appel backend.
- Le contenu est valide, normalise et limite a 2000 caracteres dans le contrat partage et en base.
- Une seule note existe par couple coach/eleve; les sauvegardes suivantes modifient la ligne existante.
- Les eleves, utilisateurs anonymes et utilisateurs non proprietaires ne peuvent ni lire ni modifier la note.
- Les projections `student_profiles` et `student_history_events` ne contiennent aucun champ ou contenu de note privee.
- Verification: 38 tests TypeScript, 118 assertions SQL, neuf integrations Supabase, typecheck, lint et export Expo Web de 21 routes.
- Verification restante non bloquante: rendu du champ multiligne et du clavier sur telephone physique.

### File List

- `_bmad-output/implementation-artifacts/2-5-ajouter-et-modifier-une-note-privee-coach.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/mobile/src/app/coach/students/[studentId].tsx`
- `apps/mobile/src/features/students/student-private-note-card.tsx`
- `apps/mobile/src/features/students/student-private-note-editor.test.ts`
- `apps/mobile/src/features/students/student-private-note-editor.ts`
- `apps/mobile/src/features/students/student-private-note-service.ts`
- `apps/mobile/src/i18n/translations.ts`
- `package.json`
- `packages/shared/src/contracts/student-private-note.test.ts`
- `packages/shared/src/contracts/student-private-note.ts`
- `packages/shared/src/index.ts`
- `packages/shared/src/types/database.types.ts`
- `scripts/verify-student-private-notes.mjs`
- `supabase/migrations/0011_student_private_notes.sql`
- `supabase/tests/database/0009_student_private_notes.sql`

### Change Log

- 2026-06-23: Ajout du modele de note privee unique et de sa commande de sauvegarde explicite.
- 2026-06-23: Ajout de l'editeur sans autosave dans la fiche eleve coach.
- 2026-06-23: Ajout des contrats, traductions et tests RLS de confidentialite proprietaire.

## Completion Note

Ultimate context engine analysis completed - comprehensive developer guide created.
