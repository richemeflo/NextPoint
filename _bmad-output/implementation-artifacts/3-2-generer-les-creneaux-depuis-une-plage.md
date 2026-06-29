---
baseline_commit: 8d3fc2126c154b6b7664f5bac8a1c2ab600a1b47
---

# Story 3.2: Générer les créneaux depuis une plage

Status: review

<!-- Note: Validation optionnelle. Lancer validate-create-story pour controle qualite avant dev-story. -->

## Story

As a coach,
I want que mes plages génèrent automatiquement des créneaux,
so that je n’aie pas à créer chaque créneau manuellement.

## Acceptance Criteria

1. Given une plage de disponibilité valide When le coach la sauvegarde Then le système génère les créneaux correspondants selon l’heure de début, l’heure de fin et la durée choisie And chaque créneau conserve le coach, la date, les heures, la durée, le lieu et le statut initial.
2. Given une plage dont la durée totale ne permet pas un dernier créneau complet When les créneaux sont générés Then seuls les créneaux complets sont créés And aucun créneau ne dépasse l’heure de fin de la plage.
3. Given des créneaux générés When le coach consulte le détail d’un créneau Then le lieu, la date, l’heure et la durée sont visibles And le créneau est disponible tant qu’aucune réservation confirmée ne le bloque.
4. Given un créneau avec réservation confirmée When les disponibilités demandables sont calculées Then ce créneau n’est plus proposé comme disponible And son statut empêche une nouvelle demande élève.
5. Given la génération de créneaux When une erreur serveur se produit Then la plage n’est pas partiellement créée sans cohérence de créneaux And le coach reçoit une erreur claire et traduite.

## Tasks / Subtasks

- [x] Verifier les preconditions et dependances de Story 3.2 (AC: tous)
  - [x] Relire les stories precedentes pertinentes et confirmer que leurs fichiers/contrats existent reellement.
  - [x] Identifier les fichiers UPDATE avant modification et les lire completement.
  - [x] Noter toute dependance manquante dans le Dev Agent Record avant de coder.
- [x] Implementer disponibilites/planning selon la story (AC: tous)
  - [x] Utiliser date/heure API en ISO 8601 UTC; timezone locale seulement a la frontiere UI.
  - [x] Garder durees 1h/1h30, lieu initial `Les Bruyeres Centre Sportif` et recurrence P0 limitee.
  - [x] Ne pas dupliquer les commandes de booking de l'Epic 4.
- [x] Tester conflits, recurrence et affichage (AC: integrite/UX)
  - [x] Couvrir modification/suppression sans demande active ni reservation confirmee selon la story.

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

- Epic 1 doit fournir les roles et profils.
- Story 2.1 doit fournir les tarifs si un tarif est affiche ou applique.
- Les disponibilites doivent preparer les commandes de reservation de l'Epic 4 sans les dupliquer.

Le fichier precedent le plus proche est `3-1-creer-une-plage-de-disponibilite-coach.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Garde-fous d'architecture

- Utiliser Supabase/PostgreSQL comme source de verite pour les donnees metier.
- Respecter `snake_case` en base et `camelCase` dans les contrats TypeScript.
- Utiliser les contrats et schemas Zod partages dans `packages/shared/src/contracts` quand une entree/sortie API est concernee.
- Les mutations critiques passent par fonctions serveur transactionnelles; pas de CRUD client direct pour contourner les regles.
- Les dates/heures API sont en ISO 8601 UTC; le fuseau local reste a la frontiere UI.
- Les libelles visibles sont externalises FR/EN/ES quand une UI est modifiee.
- Les couleurs et valeurs visuelles applicatives viennent des tokens/theme, pas de valeurs hardcodees.

### Notes specifiques a cette story

Les disponibilites alimentent les creneaux demandables. Les mutations de reservation restent dans l'Epic 4; ne pas deplacer les invariants booking dans l'UI.

### Tests et verification minimum

- Lancer lint/typecheck/tests disponibles pour les packages touches.
- Ajouter ou mettre a jour les tests RLS, contrats, hooks, composants ou commandes selon le risque de la story.
- Verifier mobile-first et webapp pour toute surface UI.
- Verifier qu'aucun secret reel n'est present dans les fichiers suivis par git.
- Documenter toute verification impossible dans le Dev Agent Record.

### Previous Story Intelligence

Le fichier precedent le plus proche est `3-1-creer-une-plage-de-disponibilite-coach.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Git Intelligence

Les derniers commits connus sont documentaires et ne fournissent pas encore de pattern code applicatif stable. Appliquer les conventions de l'architecture BMAD et les patterns etablis par les stories precedemment implementees.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 3.2`
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

- Ajouter une table `availability_slots` generee depuis `availability_ranges`, avec statut initial `available` et donnees denormalisees utiles au planning.
- Remplacer `create_availability_range` par une commande atomique qui cree la plage et ses creneaux complets dans la meme transaction.
- Exposer les creneaux cote coach dans l'ecran Disponibilites sans introduire les commandes de demande/reservation de l'Epic 4.

### Debug Log References

- 2026-06-29: Activation `bmad-dev-story` effectuee; workflow personnalise resolu sans etapes prepend/append.
- 2026-06-29: Preconditions confirmees: Story 3.1 en review, migration `availability_ranges`, contrat `availability-range`, service scheduling et ecran Disponibilites presents.
- 2026-06-29: Documentation Expo SDK 56 deja consultee avant modifications mobile, conformement a `apps/mobile/AGENTS.md`.
- 2026-06-29: Tests RED confirmes: exports shared `availabilitySlotStatuses`, table `availability_slots` et generation de slots absents.
- 2026-06-29: Migration `0014_availability_slots.sql` appliquee localement via `npx supabase migration up`; types Supabase regeneres.
- 2026-06-29: `npm test`, `npm run typecheck`, `npm run lint`, `npm run supabase:test:db`, `npm run test:availability-ranges`, `npx expo install --check` passent.
- 2026-06-29: Expo Web existant repond HTTP 200 sur `http://localhost:8081/coach/availability`.
- 2026-06-29: Captures Playwright mobile/desktop tentees avec storage Supabase injecte; elles restent sur la page publique, donc validation visuelle authentifiee complete non confirmee automatiquement.

### Completion Notes List

- Story creee par generation BMAD create-story le 2026-06-21.
- Analyse de contexte: epics, architecture, PRD, UX, design tokens, sprint status et story precedente disponible.
- Implementation demarree avec baseline git `8d3fc2126c154b6b7664f5bac8a1c2ab600a1b47`.
- Table `availability_slots` ajoutee avec `availability_range_id`, `coach_id`, bornes UTC, duree, lieu, statut `available/booked/cancelled`, timestamps et RLS.
- La RPC `create_availability_range` cree maintenant la plage et tous les creneaux complets dans une seule transaction; aucun dernier creneau incomplet ne depasse l'heure de fin.
- Les creneaux generes conservent coach, plage source, date/heure UTC, duree, lieu et statut initial `available`.
- Le statut `booked` prepare le blocage par reservation confirmee sans creer de commande de booking; les lectures demandables filtrent les creneaux `available`.
- L'ecran Disponibilites charge et affiche les creneaux generes sous chaque plage avec heure, duree, lieu et statut traduit.
- Les erreurs serveur restent atomiques: les tests verifient qu'une erreur de generation/validation ne laisse pas de plage ou creneaux partiels.
- Validation visuelle authentifiee complete non confirmee par Playwright; le rendu devra etre verifie dans une session coach connectee.

### File List

- `_bmad-output/implementation-artifacts/3-2-generer-les-creneaux-depuis-une-plage.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/mobile/src/app/coach/availability.tsx`
- `apps/mobile/src/features/scheduling/availability-service.ts`
- `apps/mobile/src/i18n/translations.ts`
- `packages/shared/src/contracts/availability-range.test.ts`
- `packages/shared/src/contracts/availability-range.ts`
- `packages/shared/src/index.ts`
- `packages/shared/src/types/database.types.ts`
- `scripts/verify-availability-ranges.mjs`
- `supabase/migrations/0014_availability_slots.sql`
- `supabase/tests/database/0012_availability_slots.sql`

### Change Log

- 2026-06-29: Ajout du modele `availability_slots`, de ses contraintes, RLS, indexes et statuts.
- 2026-06-29: Generation transactionnelle des creneaux complets dans `create_availability_range`.
- 2026-06-29: Ajout des helpers shared de statut/demandabilite et affichage des creneaux generes dans l'ecran coach.

## Completion Note

Ultimate context engine analysis completed - comprehensive developer guide created.
