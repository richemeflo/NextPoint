---
baseline_commit: e27b1cdb14583f25ffb8ae13368fe0e15b60998c
---

# Story 2.1: Gérer les tarifs coach visibles par les élèves

Status: review

<!-- Note: Validation optionnelle. Lancer validate-create-story pour controle qualite avant dev-story. -->

## Story

As a coach,
I want créer, modifier, désactiver ou supprimer mes tarifs,
so that les élèves voient une information fiable avant de demander un cours.

## Acceptance Criteria

1. Given un coach connecté When il ouvre l’écran Gestion Tarifs Then il peut voir ses tarifs individuels et collectifs And chaque tarif affiche libellé, prix, durée, type et statut actif/inactif.
2. Given un coach connecté When il crée un tarif avec libellé, prix, durée et type valides Then le tarif est sauvegardé And il devient visible côté élève s’il est actif.
3. Given un tarif existant When le coach modifie son libellé, prix, durée, type ou statut Then la nouvelle valeur est persistée And l’espace élève utilise la version à jour.
4. Given un tarif actif When le coach le désactive ou le supprime Then ce tarif n’est plus proposé aux nouvelles demandes And les réservations existantes conservent leur tarif appliqué.
5. Given un coach qui crée ou modifie un tarif When il définit des critères d’applicabilité Then il peut cibler certains élèves ou contextes comme tarif étudiant, tarif senior, week-end ou jour férié And le tarif automatique utilise ces critères avec le type de cours, la durée et les tarifs actifs.
6. Given le MVP P0 When les tarifs sont affichés côté élève Then les prix sont visibles sans message de paiement ni paiement intégré And aucun masquage par élève ni logique heures pleines/heures creuses n’est disponible.

## Tasks / Subtasks

- [x] Verifier les preconditions et dependances de Story 2.1 (AC: tous)
  - [x] Relire les stories precedentes pertinentes et confirmer que leurs fichiers/contrats existent reellement.
  - [x] Identifier les fichiers UPDATE avant modification et les lire completement.
  - [x] Noter toute dependance manquante dans le Dev Agent Record avant de coder.
- [x] Implementer tarifs coach et lecture eleve selon la story (AC: tous)
  - [x] Representer les montants en `amountCents` + `currency` cote TypeScript.
  - [x] Ne jamais introduire paiement, checkout ou vocabulaire d'encaissement.
  - [x] Proteger creation/modification/desactivation cote coach uniquement.
- [x] Ajouter tests et etats UI (AC: securite/UX)
  - [x] Couvrir tarifs actifs/inactifs, duree 1h/1h30, individuel/groupe.

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

Les tarifs affichent des prix mais ne declenchent aucun paiement. Les montants doivent rester en unites mineures et devise.

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

- `_bmad-output/planning-artifacts/epics.md#Story 2.1`
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

- Ajouter un catalogue tarifaire relationnel en centimes EUR avec commandes transactionnelles coach.
- Construire l'ecran dedie de gestion et une liste publiee commune aux surfaces publique et eleve.
- Implementer la selection automatique par type, duree, statut, contextes et ciblage, puis couvrir RLS et suppression logique.

### Debug Log References

- 2026-06-21: Activation `bmad-dev-story` effectuee; workflow personnalise resolu sans etapes prepend/append.
- 2026-06-21: Baseline propre confirmee au commit `e27b1cdb14583f25ffb8ae13368fe0e15b60998c`.
- 2026-06-21: Preconditions confirmees: auth, role coach, profils, association coach/eleve, RLS et surfaces publique/eleve disponibles.
- 2026-06-21: Tests RED confirmes avant implementation: contrat partage et tables/commandes pricing absents.
- 2026-06-21: Migration `0007_pricing_rates.sql` appliquee sans reset et types Supabase regeneres.
- 2026-06-21: `npm run typecheck`, `npm run lint`, `npm test`, `npm run supabase:test:db`, les cinq integrations Supabase et `npx expo install --check` passent.
- 2026-06-21: Expo Web exporte 19 routes statiques, dont `/`, `/eleve` et `/coach/pricing`.
- 2026-06-21: Validation physique non executee; Flo devra verifier saisie du prix, scroll, selections et affichage des tarifs sur telephone.

### Completion Notes List

- Story creee par generation BMAD create-story le 2026-06-21.
- Analyse de contexte: epics, architecture, PRD, UX, design tokens, sprint status et story precedente disponible.
- Implementation demarree avec baseline git `e27b1cdb14583f25ffb8ae13368fe0e15b60998c`.
- Tables `pricing_rates` et `pricing_rate_students` ajoutees avec montant en centimes, devise EUR, duree 60/90, type individuel/groupe, statut et criteres.
- Creation et modification passent par une commande transactionnelle coach; les ciblages sont remplaces atomiquement et verifies contre les eleves associes.
- La suppression est logique: le tarif disparait des nouvelles demandes tout en restant disponible pour les futures references historiques.
- RLS publie uniquement les tarifs actifs non supprimes; les lignes inactives restent visibles au coach et toutes les mutations directes sont interdites.
- Ecran coach dedie avec creation, edition, activation/desactivation, criteres, ciblage eleve et confirmation de suppression compatible Web/mobile.
- Le profil coach et la navigation ouvrent maintenant la gestion des tarifs.
- Les surfaces publique et eleve affichent le meme catalogue actif, sans masquage par eleve ni fonctionnalite d'encaissement.
- Selecteur partage ajoute pour determiner le tarif applicable selon type, duree, statut, contextes et ciblage.
- Textes et erreurs externalises en FR/EN/ES.
- Tests: 21 tests TypeScript, 74 assertions SQL et cinq scenarios d'integration Supabase sans regression.

### File List

- `_bmad-output/implementation-artifacts/2-1-gerer-les-tarifs-coach-visibles-par-les-eleves.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/mobile/src/app/coach/pricing.tsx`
- `apps/mobile/src/app/coach/profile.tsx`
- `apps/mobile/src/app/eleve/index.tsx`
- `apps/mobile/src/app/index.tsx`
- `apps/mobile/src/components/ui/status-badge.tsx`
- `apps/mobile/src/features/navigation/role-navigation.tsx`
- `apps/mobile/src/features/pricing/pricing-multi-selector.tsx`
- `apps/mobile/src/features/pricing/pricing-service.ts`
- `apps/mobile/src/features/pricing/published-pricing-list.tsx`
- `apps/mobile/src/i18n/translations.ts`
- `package.json`
- `packages/shared/src/contracts/pricing-rate.test.ts`
- `packages/shared/src/contracts/pricing-rate.ts`
- `packages/shared/src/index.ts`
- `packages/shared/src/types/database.types.ts`
- `scripts/verify-pricing-rates.mjs`
- `supabase/migrations/0007_pricing_rates.sql`
- `supabase/tests/database/0006_pricing_rates.sql`
- `tsconfig.tests.json`

### Change Log

- 2026-06-21: Ajout du modele tarifaire, des commandes transactionnelles coach, de la suppression logique et des politiques RLS.
- 2026-06-21: Ajout du contrat monetaire et du selecteur automatique de tarif applicable.
- 2026-06-21: Ajout de l'ecran Gestion Tarifs et du catalogue actif commun aux surfaces publique et eleve.
- 2026-06-21: Ajout des traductions FR/EN/ES et des tests contrats, SQL et integration.

## Completion Note

Ultimate context engine analysis completed - comprehensive developer guide created.
