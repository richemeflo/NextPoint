# Story 1.8: Associer automatiquement l’élève au coach unique en P0

Status: ready-for-dev

<!-- Note: Validation optionnelle. Lancer validate-create-story pour controle qualite avant dev-story. -->

## Story

As a élève nouvellement inscrit,
I want être associé automatiquement au coach unique,
so that je puisse accéder à l’espace de réservation sans lien ni code d’invitation.

## Acceptance Criteria

1. Given le MVP configuré avec un coach unique When un élève termine son inscription ou son profil minimal Then une relation coach/élève active est créée automatiquement And l’élève est associé à un seul coach en P0.
2. Given un élève déjà associé au coach unique When il se reconnecte Then la relation existante est réutilisée And aucune relation dupliquée n’est créée.
3. Given un coach connecté When il consulte les accès liés à ses élèves Then les élèves associés au coach unique sont disponibles pour les futurs écrans coach And les élèves non associés ne sont pas exposés.
4. Given un élève connecté When il tente d’accéder aux données privées d’un autre élève ou d’un autre coach Then l’accès est refusé par les règles d’autorisation And seules ses données et les informations autorisées du coach unique sont accessibles.
5. Given le futur mécanisme de lien ou code d’invitation When l’app fonctionne en P0 Then ce mécanisme reste absent du parcours utilisateur And la structure de données ne bloque pas son ajout dans une évolution future. ## Epic 2: Tarifs, Élèves, Notes Privées et Packs Le coach peut gérer les tarifs visibles, retrouver ou créer ses élèves, tenir une note privée, consulter l’historique élève et suivre les packs de cours individuels.

## Tasks / Subtasks

- [ ] Verifier les preconditions et dependances de Story 1.8 (AC: tous)
  - [ ] Relire les stories precedentes pertinentes et confirmer que leurs fichiers/contrats existent reellement.
  - [ ] Identifier les fichiers UPDATE avant modification et les lire completement.
  - [ ] Noter toute dependance manquante dans le Dev Agent Record avant de coder.
- [ ] Implementer le modele et l'ecran profil/association concernes (AC: tous)
  - [ ] Utiliser React Hook Form + Zod pour validation si formulaire.
  - [ ] Persister via Supabase avec RLS, mapping snake_case/camelCase type.
  - [ ] Conserver le contexte P0 single-coach sans invitation marketplace.
- [ ] Tester confidentialite et proprietaire du profil (AC: securite)
  - [ ] Verifier que l'utilisateur non proprietaire ne peut pas modifier les donnees.

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

### 4. Decisions produit non couvertes

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

Le fichier precedent le plus proche est `1-7-creer-et-modifier-le-profil-coach.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Garde-fous d'architecture

- Utiliser Supabase/PostgreSQL comme source de verite pour les donnees metier.
- Respecter `snake_case` en base et `camelCase` dans les contrats TypeScript.
- Utiliser les contrats et schemas Zod partages dans `packages/shared/src/contracts` quand une entree/sortie API est concernee.
- Les mutations critiques passent par fonctions serveur transactionnelles; pas de CRUD client direct pour contourner les regles.
- Les dates/heures API sont en ISO 8601 UTC; le fuseau local reste a la frontiere UI.
- Les libelles visibles sont externalises FR/EN/ES quand une UI est modifiee.
- Les couleurs et valeurs visuelles applicatives viennent des tokens/theme, pas de valeurs hardcodees.

### Notes specifiques a cette story

Les profils et relations coach/eleve sont des donnees privees controlees par role et relation. Garder le P0 single-coach, sans marketplace ni invitation obligatoire.

### Tests et verification minimum

- Lancer lint/typecheck/tests disponibles pour les packages touches.
- Ajouter ou mettre a jour les tests RLS, contrats, hooks, composants ou commandes selon le risque de la story.
- Verifier mobile-first et webapp pour toute surface UI.
- Verifier qu'aucun secret reel n'est present dans les fichiers suivis par git.
- Documenter toute verification impossible dans le Dev Agent Record.

### Previous Story Intelligence

Le fichier precedent le plus proche est `1-7-creer-et-modifier-le-profil-coach.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Git Intelligence

Les derniers commits connus sont documentaires et ne fournissent pas encore de pattern code applicatif stable. Appliquer les conventions de l'architecture BMAD et les patterns etablis par les stories precedemment implementees.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 1.8`
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

- `_bmad-output/implementation-artifacts/1-8-associer-automatiquement-leleve-au-coach-unique-en-p0.md`

## Completion Note

Ultimate context engine analysis completed - comprehensive developer guide created.
