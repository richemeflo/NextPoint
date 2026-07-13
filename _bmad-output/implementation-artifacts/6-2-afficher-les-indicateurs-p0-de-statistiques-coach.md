---
baseline_commit: 33328ed046deb7484224d1d5144c879ac7de1c7b
---

# Story 6.2: Afficher les indicateurs P0 de statistiques coach

Status: review

<!-- Note: Validation optionnelle. Lancer validate-create-story pour controle qualite avant dev-story. -->

## Story

As a coach,
I want voir mes cours, heures et revenu estimé,
so that je puisse suivre simplement mon activité.

## Acceptance Criteria

1. Given un coach connecté When il ouvre la page Stats Then il voit au minimum le nombre de cours effectués And il voit le nombre d’heures effectuées.
2. Given la page Stats When l’indicateur financier est affiché Then son libellé exact est `revenu estimé` And aucun message ne laisse croire qu’un paiement intégré a eu lieu.
3. Given aucune donnée statistique disponible When le coach ouvre la page Stats Then un état vide clair est affiché And l’écran reste utilisable.
4. Given une connexion mobile standard When la page Stats charge Then l’écran reste léger et rapide And il ne ralentit pas les parcours planning/réservation.
5. Given l’app mobile et la webapp When le coach consulte les statistiques Then la page est utilisable sur les deux supports And la composition reste mobile-first.

## Tasks / Subtasks

- [x] Verifier les preconditions et dependances de Story 6.2 (AC: tous)
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

Le fichier precedent le plus proche est `6-1-creer-le-read-model-des-statistiques-coach.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

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

Le fichier precedent le plus proche est `6-1-creer-le-read-model-des-statistiques-coach.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Git Intelligence

Les derniers commits connus sont documentaires et ne fournissent pas encore de pattern code applicatif stable. Appliquer les conventions de l'architecture BMAD et les patterns etablis par les stories precedemment implementees.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 6.2`
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

- Remplacer l'écran protégé générique par une surface Stats coach qui charge le read model de la 6.1 une seule fois par période.
- Présenter les trois indicateurs P0 dans des cartes adaptatives, avec formatage local des heures et du revenu estimé.
- Fournir des états de chargement, d'erreur et d'absence de données clairs, puis valider l'export Web et les règles mobile-first.

### Debug Log References

- 2026-07-13: Story 6.1 relue intégralement; RPC, contrat Zod, service, traductions et tests existent et sont en `review`.
- 2026-07-13: Baseline enregistrée au commit `33328ed046deb7484224d1d5144c879ac7de1c7b`; story passée à `in-progress`.
- 2026-07-13: Aucune dépendance bloquante manquante; l'écran Stats existant est un placeholder et les primitives Card/Feedback/tokens sont disponibles.
- 2026-07-13: Test RED confirmé avant implémentation: formateurs d'heures et de revenu absents.
- 2026-07-13: Écran P0 implémenté avec chargement unique du mois, cartes adaptatives, état vide, erreur traduite et nouvel essai.
- 2026-07-13: Régression validée: 82 tests TypeScript, 246 assertions pgTAP, typechecks shared/mobile/tests, lint Expo et `git diff --check` passent.
- 2026-07-13: Les bundles Android, iOS et Web compilent. Le rendu statique Web final reste bloqué par le décalage préexistant Expo (`expo-router` 56.2.11 installé, 56.2.14 attendu); aucune mise à niveau hors story n'a été effectuée.

### Completion Notes List

- Story creee par generation BMAD create-story le 2026-06-21.
- Analyse de contexte: epics, architecture, PRD, UX, design tokens, sprint status et story precedente disponible.
- Préconditions validées: le read model 6.1, son service client, les traductions et les primitives UI sont disponibles.
- La page Stats affiche cours effectués, heures effectuées et `revenu estimé` à partir du read model sécurisé de la 6.1.
- Les minutes et centimes EUR sont formatés selon la langue active, sans donnée ni vocabulaire de paiement.
- L'état vide garde les trois indicateurs visibles à zéro; chargement, erreur et nouvel essai sont explicites.
- Les cartes se composent d'abord en colonne puis se répartissent avec `flexWrap` selon la largeur, sans requête lourde ni nouvelle dépendance.
- Bundles Android/iOS/Web compilés. Le rendu statique Web est non vérifiable jusqu'à alignement des versions Expo existantes; validation sur appareil physique non exécutée.

### File List

- `_bmad-output/implementation-artifacts/6-2-afficher-les-indicateurs-p0-de-statistiques-coach.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/mobile/src/app/coach/stats.tsx`
- `apps/mobile/src/features/stats/coach-stats-format.test.ts`
- `apps/mobile/src/features/stats/coach-stats-format.ts`
- `apps/mobile/src/i18n/translations.ts`
- `package.json`
- `tsconfig.tests.json`

### Change Log

- 2026-07-13: Remplacement du placeholder Stats par les trois indicateurs P0 et leurs états de chargement/erreur/vide.
- 2026-07-13: Ajout du formatage localisé des heures et du `revenu estimé`, avec tests dédiés.

## Completion Note

Ultimate context engine analysis completed - comprehensive developer guide created.
