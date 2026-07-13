---
baseline_commit: 33328ed046deb7484224d1d5144c879ac7de1c7b
---

# Story 6.3: Filtrer les statistiques par période et afficher les élèves actifs

Status: review

<!-- Note: Validation optionnelle. Lancer validate-create-story pour controle qualite avant dev-story. -->

## Story

As a coach,
I want consulter mes statistiques par période et voir mes élèves les plus actifs si possible,
so that je puisse comprendre mon activité sans tableau analytique complexe.

## Acceptance Criteria

1. Given la page Stats When le coach l’ouvre Then la période mois est prioritaire par défaut And les périodes trimestre et année sont disponibles si les données le permettent.
2. Given une période sélectionnée When le coach change de période Then les indicateurs sont recalculés pour cette période And l’interface garde un état de chargement cohérent.
3. Given des données suffisantes sur les élèves When les statistiques sont affichées Then les élèves les plus actifs peuvent être présentés And l’absence de données suffisantes affiche un état discret plutôt qu’une erreur.
4. Given la période semaine When son implémentation est coûteuse ou secondaire Then elle peut rester hors affichage initial And mois, trimestre et année restent prioritaires.
5. Given les statistiques coach When elles sont affichées Then elles restent légères et centrées sur les besoins P0 And elles n’introduisent pas de suivi de progression sportive élève.

## Tasks / Subtasks

- [x] Verifier les preconditions et dependances de Story 6.3 (AC: tous)
  - [x] Relire les stories precedentes pertinentes et confirmer que leurs fichiers/contrats existent reellement.
  - [x] Identifier les fichiers UPDATE avant modification et les lire completement.
  - [x] Noter toute dependance manquante dans le Dev Agent Record avant de coder.
- [x] Implementer read model/affichage stats selon la story (AC: tous)
  - [x] Calculer depuis reservations confirmees et tarifs disponibles uniquement.
  - [x] Utiliser le libelle exact `revenu estime` dans les traductions sans suggerer paiement.
  - [x] Garder la page legere et mobile-first.
- [x] Tester periode, autorisation et donnees vides (AC: securite/UX)
  - [x] Couvrir coach connecte, utilisateur non coach et absence de donnees.

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

- Les reservations confirmees, tarifs et donnees coach doivent exister avant calcul statistique reel.
- Les stats ne doivent pas introduire de paiement ni de suivi sportif eleve.
- Les queries doivent rester limitees au coach connecte.

Le fichier precedent le plus proche est `6-2-afficher-les-indicateurs-p0-de-statistiques-coach.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Garde-fous d'architecture

- Utiliser Supabase/PostgreSQL comme source de verite pour les donnees metier.
- Respecter `snake_case` en base et `camelCase` dans les contrats TypeScript.
- Utiliser les contrats et schemas Zod partages dans `packages/shared/src/contracts` quand une entree/sortie API est concernee.
- Les mutations critiques passent par fonctions serveur transactionnelles; pas de CRUD client direct pour contourner les regles.
- Les dates/heures API sont en ISO 8601 UTC; le fuseau local reste a la frontiere UI.
- Les libelles visibles sont externalises FR/EN/ES quand une UI est modifiee.
- Les couleurs et valeurs visuelles applicatives viennent des tokens/theme, pas de valeurs hardcodees.

### Notes specifiques a cette story

Les statistiques restent legeres, coach-only et derivees des reservations confirmees. Le libelle `revenu estime` est obligatoire et non lie a paiement.

### Tests et verification minimum

- Lancer lint/typecheck/tests disponibles pour les packages touches.
- Ajouter ou mettre a jour les tests RLS, contrats, hooks, composants ou commandes selon le risque de la story.
- Verifier mobile-first et webapp pour toute surface UI.
- Verifier qu'aucun secret reel n'est present dans les fichiers suivis par git.
- Documenter toute verification impossible dans le Dev Agent Record.

### Previous Story Intelligence

Le fichier precedent le plus proche est `6-2-afficher-les-indicateurs-p0-de-statistiques-coach.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Git Intelligence

Les derniers commits connus sont documentaires et ne fournissent pas encore de pattern code applicatif stable. Appliquer les conventions de l'architecture BMAD et les patterns etablis par les stories precedemment implementees.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 6.3`
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

- Ajouter un sélecteur accessible limité à mois, trimestre et année, avec mois sélectionné par défaut et aucune période semaine P0.
- Recharger le read model à chaque changement en conservant un état de chargement explicite et en ignorant les réponses devenues obsolètes.
- Afficher au maximum cinq élèves actifs issus des cours de la période, avec un état discret quand la liste est vide.

### Debug Log References

- 2026-07-13: Story 6.2 relue intégralement; écran P0, service, périodes et données `activeStudents` disponibles.
- 2026-07-13: Baseline enregistrée au commit `33328ed046deb7484224d1d5144c879ac7de1c7b`; story passée à `in-progress`.
- 2026-07-13: Aucune dépendance bloquante manquante; la semaine est explicitement hors affichage initial conformément à l'AC 4.
- 2026-07-13: Test RED confirmé avant implémentation: options de période et présentation d'élève actif absentes.
- 2026-07-13: Sélecteur mois/trimestre/année et liste des élèves actifs ajoutés; les réponses obsolètes sont ignorées lors d'un changement rapide.
- 2026-07-13: Gate final validé: 84 tests TypeScript, 246 assertions pgTAP, tous les typechecks, ESLint sans erreur ni avertissement, export Android et `git diff --check` passent.

### Completion Notes List

- Story creee par generation BMAD create-story le 2026-06-21.
- Analyse de contexte: epics, architecture, PRD, UX, design tokens, sprint status et story precedente disponible.
- Préconditions validées: périodes month/quarter/year, recalcul RPC et top élèves sont déjà supportés par le read model 6.1.
- Le mois est sélectionné par défaut; trimestre et année déclenchent chacun un recalcul borné par le service existant.
- La semaine reste volontairement hors affichage initial, conformément à sa priorité secondaire P0.
- Le chargement remplace les indicateurs pendant le changement de période et les réponses devenues obsolètes ne peuvent pas écraser la sélection courante.
- Jusqu'à cinq élèves actifs sont affichés par nombre de cours sur la période; aucun indicateur de progression sportive n'est introduit.
- L'absence d'élèves actifs affiche une phrase discrète dans la carte, jamais une erreur.
- Export Android final validé. Le bundle Web avait compilé lors de la 6.2; le rendu statique reste bloqué par le décalage de versions Expo préexistant documenté dans cette story précédente.

### File List

- `_bmad-output/implementation-artifacts/6-3-filtrer-les-statistiques-par-periode-et-afficher-les-eleves-actifs.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/mobile/src/app/coach/stats.tsx`
- `apps/mobile/src/features/stats/coach-stats-view.test.ts`
- `apps/mobile/src/features/stats/coach-stats-view.ts`
- `apps/mobile/src/i18n/translations.ts`
- `package.json`
- `tsconfig.tests.json`

### Change Log

- 2026-07-13: Ajout du filtre mois/trimestre/année avec recalcul et chargement cohérent.
- 2026-07-13: Ajout de la liste légère des élèves actifs et de son état sans données.

## Completion Note

Ultimate context engine analysis completed - comprehensive developer guide created.
