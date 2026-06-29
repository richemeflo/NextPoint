---
baseline_commit: db047c77435897589a1d35746f0b00ddddc907b3
---

# Story 2.6: Attribuer et suivre un pack de cours individuels

Status: review

<!-- Note: Validation optionnelle. Lancer validate-create-story pour controle qualite avant dev-story. -->

## Story

As a coach,
I want rattacher un pack de cours individuels à un élève,
so that je puisse suivre les crédits sans paiement intégré.

## Acceptance Criteria

1. Given un coach sur la fiche d’un élève associé When il crée ou rattache un pack de cours individuels Then il renseigne au minimum le nombre de cours inclus And le système calcule les cours utilisés et restants.
2. Given un pack attribué When le coach ouvre la fiche élève Then le pack affiche cours inclus, utilisés et restants And son statut est visible.
3. Given un élève connecté When il consulte son compte ou ses réservations Then il ne peut pas créer, acheter ou s’attribuer lui-même un pack And aucune interface de paiement intégré n’est proposée.
4. Given le MVP P0 When un pack est géré Then il représente uniquement un suivi de crédits de cours individuels And il ne crée pas de paiement, facture ou transaction.
5. Given un utilisateur non autorisé When il tente de rattacher un pack à un élève Then l’accès est refusé And aucun pack n’est créé ou modifié.

## Tasks / Subtasks

- [x] Verifier les preconditions et dependances de Story 2.6 (AC: tous)
  - [x] Relire les stories precedentes pertinentes et confirmer que leurs fichiers/contrats existent reellement.
  - [x] Identifier les fichiers UPDATE avant modification et les lire completement.
  - [x] Noter toute dependance manquante dans le Dev Agent Record avant de coder.
- [x] Implementer packs individuels selon la story (AC: tous)
  - [x] Restreindre attribution/consommation au coach.
  - [x] Maintenir inclus, utilises, restants avec invariants backend.
  - [x] Ne pas presenter achat ou paiement a l'eleve.
- [x] Tester decrementation et acces (AC: integrite/securite)
  - [x] Couvrir impossibilite de passer sous zero et refus cote eleve.

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

Le fichier precedent le plus proche est `2-5-ajouter-et-modifier-une-note-privee-coach.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Garde-fous d'architecture

- Utiliser Supabase/PostgreSQL comme source de verite pour les donnees metier.
- Respecter `snake_case` en base et `camelCase` dans les contrats TypeScript.
- Utiliser les contrats et schemas Zod partages dans `packages/shared/src/contracts` quand une entree/sortie API est concernee.
- Les mutations critiques passent par fonctions serveur transactionnelles; pas de CRUD client direct pour contourner les regles.
- Les dates/heures API sont en ISO 8601 UTC; le fuseau local reste a la frontiere UI.
- Les libelles visibles sont externalises FR/EN/ES quand une UI est modifiee.
- Les couleurs et valeurs visuelles applicatives viennent des tokens/theme, pas de valeurs hardcodees.

### Notes specifiques a cette story

Les packs sont attribues et consommes par le coach uniquement. Ils suivent des credits de cours, pas un achat ni un paiement.

### Tests et verification minimum

- Lancer lint/typecheck/tests disponibles pour les packages touches.
- Ajouter ou mettre a jour les tests RLS, contrats, hooks, composants ou commandes selon le risque de la story.
- Verifier mobile-first et webapp pour toute surface UI.
- Verifier qu'aucun secret reel n'est present dans les fichiers suivis par git.
- Documenter toute verification impossible dans le Dev Agent Record.

### Previous Story Intelligence

Le fichier precedent le plus proche est `2-5-ajouter-et-modifier-une-note-privee-coach.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Git Intelligence

Les derniers commits connus sont documentaires et ne fournissent pas encore de pattern code applicatif stable. Appliquer les conventions de l'architecture BMAD et les patterns etablis par les stories precedemment implementees.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 2.6`
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

- Creer un modele de pack individuel sans colonne financiere.
- Calculer les cours restants en base et proteger les compteurs par contraintes.
- Autoriser un seul pack actif par couple coach/eleve.
- Exposer des commandes SQL coach-only pour attribution et consommation atomique.
- Afficher attribution, statut et compteurs sur la fiche eleve coach.
- Laisser l'action UI de consommation a Story 2.7 tout en livrant ses invariants backend.
- Couvrir contrat, schema, RLS, plancher a zero et refus eleve/non-proprietaire.

### Debug Log References

- 2026-06-23: Baseline HEAD `db047c77435897589a1d35746f0b00ddddc907b3`; les deux fichiers non commites de Story 2.5 sont conserves sans modification hors integration necessaire.
- 2026-06-23: Preconditions confirmees: fiche eleve coach, relation active, historique type, commandes SQL securisees et RLS sont disponibles.
- 2026-06-23: Story 2.6 livre le modele, l'attribution, l'affichage et les invariants de consommation; l'action UI de consommation reste reservee a Story 2.7.
- 2026-06-23: Tests RED confirmes sur le contrat, l'enum, la table et les commandes de pack absents.
- 2026-06-23: Migration `0012` appliquee apres reset de la base Supabase locale uniquement; types TypeScript regeneres.
- 2026-06-23: Le pack stocke inclus/utilises, calcule restants par colonne generee et interdit tout compteur negatif ou superieur au total.
- 2026-06-23: L'attribution exige le role coach et une relation active; un index partiel interdit deux packs actifs pour le meme eleve.
- 2026-06-23: La consommation backend est atomique, passe le statut a `exhausted` a zero et refuse toute consommation supplementaire.
- 2026-06-23: Attribution et consommation publient des evenements dans l'historique eleve existant, sans paiement ni transaction.
- 2026-06-23: Apres reset local, Kong conservait l'ancienne adresse du conteneur Auth; seul Kong local a ete redemarre, sans mutation de donnees.
- 2026-06-23: Validation finale: 41 tests TypeScript, 134 assertions SQL, dix integrations Supabase, typecheck, lint et export Expo Web de 21 routes passent.
- 2026-06-23: Aucun secret reel detecte; validation sur telephone physique non executee.

### Completion Notes List

- Story creee par generation BMAD create-story le 2026-06-21.
- Analyse de contexte: epics, architecture, PRD, UX, design tokens, sprint status et story precedente disponible.
- La fiche eleve affiche une carte de packs individuels avec cours inclus, utilises, restants et statut traduit.
- Le coach peut attribuer un pack de 1 a 100 cours lorsqu'aucun pack actif n'existe.
- Un pack actif unique est impose par la base; un nouveau pack peut etre attribue apres epuisement du precedent.
- Les compteurs ne sont jamais modifiables par CRUD client et le nombre restant est calcule par PostgreSQL.
- L'eleve peut consulter ses credits mais ne peut ni creer, acheter, s'attribuer ou consommer un pack.
- Aucune colonne, action ou interface de paiement, prix, facture ou transaction n'est presente.
- Les commandes de consommation et leurs invariants sont pretes pour Story 2.7; son bouton et ses feedbacks restent hors de cette story.
- Verification: 41 tests TypeScript, 134 assertions SQL, dix integrations Supabase, typecheck, lint et export Expo Web de 21 routes.
- Verification restante non bloquante: rendu mobile physique de la carte et du clavier numerique.

### File List

- `_bmad-output/implementation-artifacts/2-6-attribuer-et-suivre-un-pack-de-cours-individuels.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/mobile/src/app/coach/students/[studentId].tsx`
- `apps/mobile/src/features/lesson-packs/lesson-pack-service.ts`
- `apps/mobile/src/features/lesson-packs/student-lesson-pack-card.tsx`
- `apps/mobile/src/i18n/translations.ts`
- `package.json`
- `packages/shared/src/contracts/lesson-pack.test.ts`
- `packages/shared/src/contracts/lesson-pack.ts`
- `packages/shared/src/index.ts`
- `packages/shared/src/types/database.types.ts`
- `scripts/verify-lesson-packs.mjs`
- `supabase/migrations/0012_lesson_packs.sql`
- `supabase/tests/database/0010_lesson_packs.sql`

### Change Log

- 2026-06-23: Ajout du modele de packs individuels et des compteurs inclus/utilises/restants.
- 2026-06-23: Ajout de l'attribution coach-only et des invariants atomiques de consommation.
- 2026-06-23: Ajout de la carte de suivi des packs sur la fiche eleve, sans paiement integre.
- 2026-06-23: Ajout des contrats et tests de securite, plancher a zero et historique.

## Completion Note

Ultimate context engine analysis completed - comprehensive developer guide created.
