# Story 5.7: Utiliser la messagerie coach liée aux créneaux

Status: ready-for-dev

<!-- Note: Validation optionnelle. Lancer validate-create-story pour controle qualite avant dev-story. -->

## Story

As a coach,
I want voir et répondre aux discussions liées aux créneaux, demandes, réservations ou événements,
so that je puisse retrouver les échanges de planning sans ouvrir chaque écran séparément.

## Acceptance Criteria

1. Given un coach connecté When il ouvre l’onglet Messagerie Then il voit uniquement les discussions liées à ses créneaux, demandes, réservations ou événements And aucune discussion d’un autre coach ou élève non autorisé n’est exposée.
2. Given une discussion liée à un créneau, une demande, une réservation ou un événement When le coach l’ouvre Then il voit les messages existants, le dernier état lu/non lu et le contexte lié And il peut revenir vers l’événement concerné si applicable.
3. Given une discussion ouverte par le coach When il saisit et envoie une réponse valide Then le message est enregistré dans la discussion And il reste lié au créneau, à la demande, à la réservation ou à l’événement concerné.
4. Given un message vide ou invalide When le coach tente de l’envoyer Then l’action est refusée avec une erreur claire et traduite And aucun message vide n’est enregistré.
5. Given un élève connecté When il tente d’accéder à l’onglet Messagerie coach Then l’accès est refusé And aucune liste de discussions coach n’est exposée. ## Epic 6: Statistiques Coach Légères Le coach peut consulter une page simple d’activité avec cours, heures, revenu estimé et élèves actifs si les données le permettent.

## Tasks / Subtasks

- [ ] Verifier les preconditions et dependances de Story 5.7 (AC: tous)
  - [ ] Relire les stories precedentes pertinentes et confirmer que leurs fichiers/contrats existent reellement.
  - [ ] Identifier les fichiers UPDATE avant modification et les lire completement.
  - [ ] Noter toute dependance manquante dans le Dev Agent Record avant de coder.
- [ ] Implementer messagerie coach liee aux evenements (AC: tous)
  - [ ] Limiter les discussions aux creneaux, demandes, reservations ou evenements autorises.
  - [ ] Autoriser la reponse coach; refuser message vide ou utilisateur non coach.
  - [ ] Ne pas creer messagerie generale hors contexte.
- [ ] Tester acces et liens de contexte (AC: securite/UX)
  - [ ] Couvrir coach autorise, eleve non autorise et objet lie inaccessible.

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

- Les evenements de booking de l'Epic 4 doivent exister pour les notifications fonctionnelles.
- Le centre in-app doit rester source de verite meme si le push echoue.
- Aucun secret fournisseur push ne doit etre expose cote client.

Le fichier precedent le plus proche est `5-6-gerer-letat-lu-non-lu-et-les-liens-de-notifications.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Garde-fous d'architecture

- Utiliser Supabase/PostgreSQL comme source de verite pour les donnees metier.
- Respecter `snake_case` en base et `camelCase` dans les contrats TypeScript.
- Utiliser les contrats et schemas Zod partages dans `packages/shared/src/contracts` quand une entree/sortie API est concernee.
- Les mutations critiques passent par fonctions serveur transactionnelles; pas de CRUD client direct pour contourner les regles.
- Les dates/heures API sont en ISO 8601 UTC; le fuseau local reste a la frontiere UI.
- Les libelles visibles sont externalises FR/EN/ES quand une UI est modifiee.
- Les couleurs et valeurs visuelles applicatives viennent des tokens/theme, pas de valeurs hardcodees.

### Notes specifiques a cette story

La messagerie P0 est coach-only et liee a un contexte de planning/reservation/evenement. Ne pas creer une messagerie generale.

### Tests et verification minimum

- Lancer lint/typecheck/tests disponibles pour les packages touches.
- Ajouter ou mettre a jour les tests RLS, contrats, hooks, composants ou commandes selon le risque de la story.
- Verifier mobile-first et webapp pour toute surface UI.
- Verifier qu'aucun secret reel n'est present dans les fichiers suivis par git.
- Documenter toute verification impossible dans le Dev Agent Record.

### Previous Story Intelligence

Le fichier precedent le plus proche est `5-6-gerer-letat-lu-non-lu-et-les-liens-de-notifications.md`; le lire avant implementation pour reprendre conventions, scripts, decisions et limites deja documentees.

### Git Intelligence

Les derniers commits connus sont documentaires et ne fournissent pas encore de pattern code applicatif stable. Appliquer les conventions de l'architecture BMAD et les patterns etablis par les stories precedemment implementees.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 5.7`
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

- `_bmad-output/implementation-artifacts/5-7-utiliser-la-messagerie-coach-liee-aux-creneaux.md`

## Completion Note

Ultimate context engine analysis completed - comprehensive developer guide created.
