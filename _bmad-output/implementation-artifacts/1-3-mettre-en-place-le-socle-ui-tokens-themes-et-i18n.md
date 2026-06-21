# Story 1.3: Mettre en place le socle UI, tokens, thèmes et i18n

Status: ready-for-dev

<!-- Note: Validation optionnelle. Lancer validate-create-story pour controle qualite avant dev-story. -->

## Story

As a utilisateur NextPoint,
I want une interface cohérente, mobile-first, traduisible et basée sur les tokens de design,
so that l’app soit utilisable en français, anglais et espagnol avec une identité visuelle stable sur mobile et web.

## Acceptance Criteria

1. Given l’application Expo initialisée When le socle UI est mis en place Then les tokens de design NextPoint sont disponibles dans une couche thème réutilisable And les composants applicatifs n’utilisent pas de couleurs codées en dur.
2. Given le thème NextPoint When l’utilisateur bascule entre light theme et dark theme Then les couleurs proviennent des tokens validés And l’interface limite le noir pur et le blanc pur conformément aux NFR.
3. Given les parcours P0 When du texte visible est ajouté à l’interface Then ce texte est externalisé dans le système i18n And les langues français, anglais et espagnol sont supportées.
4. Given un écran mobile et un écran web When l’interface est rendue Then la composition reste mobile-first And la webapp conserve une expérience fonctionnelle pour les parcours P0.
5. Given l’identité visuelle NextPoint When des primitives UI communes sont utilisées Then elles appliquent l’esprit Roland-Garros premium avec terre battue, ocre, vert profond et fonds chauds via les tokens And elles peuvent être réutilisées dans les futurs écrans coach et élève.

## Tasks / Subtasks

- [ ] Verifier les preconditions et dependances de Story 1.3 (AC: tous)
  - [ ] Relire les stories precedentes pertinentes et confirmer que leurs fichiers/contrats existent reellement.
  - [ ] Identifier les fichiers UPDATE avant modification et les lire completement.
  - [ ] Noter toute dependance manquante dans le Dev Agent Record avant de coder.
- [ ] Mettre en place la couche theme/tokens/i18n (AC: tous)
  - [ ] Convertir les tokens de `design-tokens.md` en constantes/theme types.
  - [ ] Ajouter les dictionnaires FR/EN/ES et un helper de traduction reutilisable.
  - [ ] Brancher light/dark theme sans couleurs codees en dur dans les composants applicatifs.
- [ ] Ajouter primitives UI minimales et exemples d'usage (AC: tous)
  - [ ] Boutons, champs, cartes, statuts et feedback doivent utiliser les tokens.
  - [ ] Verifier mobile et web sur au moins une largeur mobile et une largeur desktop.

## Interventions utilisateur requises

Le dev agent doit executer tout ce qui peut l'etre localement et sans secret. Il ne doit solliciter Flo que dans les cas ci-dessous.

### 1. Preconditions non remplies

Intervention possible: confirmer l'ordre de travail si une story dependante n'est pas encore implementee.

Etapes ultra precises:

1. Le dev agent verifie les dossiers et fichiers requis par les stories precedentes.
2. Si une dependance bloquante manque, il note exactement le fichier ou contrat absent.
3. Il demande a Flo s'il faut implementer la story dependante d'abord ou limiter le travail a la preparation documentaire.
4. Sans reponse, il ne cree pas de structure parallele et ne simule pas une dependance metier.

### 2. Validation visuelle mobile/web

Intervention possible: confirmer le rendu sur telephone ou navigateur si le dev agent ne peut pas inspecter l'interface.

Etapes ultra precises:

1. Le dev agent lance l'app depuis WSL avec les commandes du repo, via `rtk`.
2. Il verifie au moins une largeur mobile et une largeur desktop/web quand l'UI est concernee.
3. Flo intervient seulement si une validation sur appareil physique est necessaire.
4. Flo verifie alors absence d'ecran rouge, lisibilite mobile, navigation attendue, et absence de donnees privees visibles par le mauvais role.
5. Le resultat est note dans `Dev Agent Record > Completion Notes List`.

### 3. Decisions produit non couvertes

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

Le fichier precedent le plus proche est `1-2-initialiser-supabase-migrations-types-et-ci-legere.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Garde-fous d'architecture

- Utiliser Supabase/PostgreSQL comme source de verite pour les donnees metier.
- Respecter `snake_case` en base et `camelCase` dans les contrats TypeScript.
- Utiliser les contrats et schemas Zod partages dans `packages/shared/src/contracts` quand une entree/sortie API est concernee.
- Les mutations critiques passent par fonctions serveur transactionnelles; pas de CRUD client direct pour contourner les regles.
- Les dates/heures API sont en ISO 8601 UTC; le fuseau local reste a la frontiere UI.
- Les libelles visibles sont externalises FR/EN/ES quand une UI est modifiee.
- Les couleurs et valeurs visuelles applicatives viennent des tokens/theme, pas de valeurs hardcodees.

### Notes specifiques a cette story

Priorite a la couche theme/tokens/i18n partagee. Aucun texte visible ne doit rester hardcode si l'ecran est applicatif; aucune couleur applicative ne doit etre codee en dur.

### Tests et verification minimum

- Lancer lint/typecheck/tests disponibles pour les packages touches.
- Ajouter ou mettre a jour les tests RLS, contrats, hooks, composants ou commandes selon le risque de la story.
- Verifier mobile-first et webapp pour toute surface UI.
- Verifier qu'aucun secret reel n'est present dans les fichiers suivis par git.
- Documenter toute verification impossible dans le Dev Agent Record.

### Previous Story Intelligence

Le fichier precedent le plus proche est `1-2-initialiser-supabase-migrations-types-et-ci-legere.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Git Intelligence

Les derniers commits connus sont documentaires et ne fournissent pas encore de pattern code applicatif stable. Appliquer les conventions de l'architecture BMAD et les patterns etablis par les stories precedemment implementees.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 1.3`
- `_bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules`
- `_bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries`
- `_bmad-output/planning-artifacts/prd.md#Exigences Fonctionnelles`
- `_bmad-output/planning-artifacts/ux-screen-inventory.md`
- `_bmad-output/planning-artifacts/ux-designs/ux-NextPoint-2026-06-07/EXPERIENCE.md`
- `_bmad-output/planning-artifacts/design-tokens.md`

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Story creee par generation BMAD create-story le 2026-06-21.
- Analyse de contexte: epics, architecture, PRD, UX, design tokens, sprint status et story precedente disponible.

### File List

- `_bmad-output/implementation-artifacts/1-3-mettre-en-place-le-socle-ui-tokens-themes-et-i18n.md`

## Completion Note

Ultimate context engine analysis completed - comprehensive developer guide created.
