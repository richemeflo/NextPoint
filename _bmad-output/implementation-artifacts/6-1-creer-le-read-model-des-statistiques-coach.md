---
baseline_commit: 33328ed046deb7484224d1d5144c879ac7de1c7b
---

# Story 6.1: Créer le read model des statistiques coach

Status: review

<!-- Note: Validation optionnelle. Lancer validate-create-story pour controle qualite avant dev-story. -->

## Story

As a coach,
I want que mes statistiques soient calculées depuis mes réservations confirmées,
so that les chiffres reflètent mon activité réelle sans dépendre d’un paiement intégré.

## Acceptance Criteria

1. Given des réservations confirmées pour un coach When les statistiques sont calculées Then seules les données du coach connecté sont prises en compte And les données d’autres coachs ou élèves non autorisés ne sont pas exposées.
2. Given des réservations annulées, refusées ou expirées When les statistiques sont calculées Then elles ne sont pas comptabilisées comme cours effectués And les règles de calcul restent documentées.
3. Given des tarifs associés aux réservations When le revenu estimé est calculé Then le calcul utilise les tarifs appliqués ou les données disponibles And il ne dépend d’aucun paiement intégré.
4. Given une période demandée When le read model est interrogé Then il retourne des valeurs cohérentes pour cette période And les erreurs sont normalisées et traduites côté client.
5. Given un utilisateur non coach When il tente d’accéder aux statistiques coach Then l’accès est refusé And aucune statistique privée n’est retournée.

## Tasks / Subtasks

- [x] Verifier les preconditions et dependances de Story 6.1 (AC: tous)
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

Les statistiques restent legeres, coach-only et derivees des reservations confirmees. Le libelle `revenu estime` est obligatoire et non lie a paiement.

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

- `_bmad-output/planning-artifacts/epics.md#Story 6.1`
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

- Ajouter un read model PostgreSQL borné par période qui agrège uniquement les cours confirmés ou confirmés puis modifiés du coach connecté, terminés au moment de la lecture.
- Exposer un contrat Zod partagé et un service client léger qui normalise les erreurs d'autorisation, de période et de chargement.
- Couvrir par tests TypeScript et pgTAP l'agrégation, les périodes, les données vides et l'isolation coach-only avant de construire l'interface des stories suivantes.

### Debug Log References

- 2026-07-13: Activation `bmad-dev-story` terminée; workflow personnalisé résolu sans étapes prepend/append.
- 2026-07-13: Baseline propre confirmée au commit `33328ed046deb7484224d1d5144c879ac7de1c7b`; story passée à `in-progress`.
- 2026-07-13: Préconditions confirmées dans les stories 2.1, 4.1 et 4.4 ainsi que dans les migrations: rôles, réservations, participants et tarifs appliqués existent.
- 2026-07-13: Aucune dépendance bloquante manquante; les réservations modifiées restent des cours confirmés dans le cycle métier et seront comptabilisées, contrairement aux statuts pending/refused/expired/cancelled.
- 2026-07-13: Tests RED confirmés avant implémentation: contrat, normalisation client et RPC `get_coach_stats` absents.
- 2026-07-13: Migration `0025_coach_stats_read_model.sql` appliquée uniquement à la base locale, sans reset ni action Cloud; types Supabase régénérés.
- 2026-07-13: GREEN et régression validées: 80 tests TypeScript, 246 assertions pgTAP, typechecks shared/mobile/tests, lint Expo et `git diff --check` passent.

### Completion Notes List

- Story creee par generation BMAD create-story le 2026-06-21.
- Analyse de contexte: epics, architecture, PRD, UX, design tokens, sprint status et story precedente disponible.
- Implémentation démarrée avec la baseline Git `33328ed046deb7484224d1d5144c879ac7de1c7b`.
- Préconditions validées: le modèle de réservation, les tarifs appliqués, les participants, l'authentification coach et la RLS existent; aucune dépendance bloquante n'est absente.
- RPC coach-only ajouté avec période explicite, isolation par `auth.uid()`, validation des bornes et refus des utilisateurs non coach.
- Le calcul compte les cours terminés aux statuts `confirmed` ou `modified`; pending, refused, expired et cancelled sont exclus. Une réservation modifiée reste confirmée dans le cycle métier.
- Le revenu est une estimation en centimes EUR issue du tarif appliqué encore disponible; aucune table, donnée ou formulation de paiement n'est utilisée.
- Contrat Zod partagé, périodes mois/trimestre/année, état vide et top 5 des élèves actifs ajoutés au read model.
- Service client léger ajouté avec validation stricte de la réponse et erreurs normalisées, traduites en FR/EN/ES.
- Validation visuelle non requise pour cette story de read model; la page visible est livrée par les stories 6.2 et 6.3.

### File List

- `_bmad-output/implementation-artifacts/6-1-creer-le-read-model-des-statistiques-coach.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/mobile/src/features/stats/coach-stats-error.test.ts`
- `apps/mobile/src/features/stats/coach-stats-error.ts`
- `apps/mobile/src/features/stats/coach-stats-service.ts`
- `apps/mobile/src/i18n/translations.ts`
- `package.json`
- `packages/shared/src/contracts/coach-stats.test.ts`
- `packages/shared/src/contracts/coach-stats.ts`
- `packages/shared/src/index.ts`
- `packages/shared/src/types/database.types.ts`
- `supabase/migrations/0025_coach_stats_read_model.sql`
- `supabase/tests/database/0015_coach_stats.sql`
- `tsconfig.tests.json`

### Change Log

- 2026-07-13: Ajout du read model SQL coach-only, de ses règles documentées et des tests d'autorisation/agrégation.
- 2026-07-13: Ajout du contrat partagé, des périodes statistiques, du service client et des erreurs traduites FR/EN/ES.

## Completion Note

Ultimate context engine analysis completed - comprehensive developer guide created.
