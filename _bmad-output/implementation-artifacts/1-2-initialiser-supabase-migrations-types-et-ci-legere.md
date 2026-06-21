# Story 1.2: Initialiser Supabase, migrations, types et CI légère

Status: ready-for-dev

<!-- Note: Validation optionnelle. Lancer validate-create-story pour controle qualite avant dev-story. -->

## Story

As a developpeur NextPoint,
I want un socle Supabase, migrations, types partages et CI legere initialises,
so that les stories metier puissent s'appuyer sur une base backend testable et reproductible.

## Acceptance Criteria

1. Given le depot NextPoint initialise, when le socle backend est cree, then le dossier `supabase/` contient la configuration locale attendue, un emplacement `migrations/`, un emplacement `functions/` et un emplacement `tests/`, and aucune cle service-role ou secret reel n'est commite.
2. Given le projet Supabase local ou cloud configure, when les variables d'environnement sont documentees, then le depot contient des fichiers `.env.example` pour les surfaces necessaires, and chaque variable indique clairement si elle est publique client ou reservee serveur.
3. Given les migrations initiales, when elles sont appliquees sur un environnement vierge, then elles peuvent s'executer sans erreur, and la structure prepare les tables, politiques RLS et tests qui seront detailles par les stories metier suivantes.
4. Given le workflow TypeScript, when les types Supabase sont generes ou simules en local, then les types sont disponibles pour l'app et/ou `packages/shared`, and la procedure de regeneration est documentee.
5. Given une contribution au depot, when la CI legere s'execute, then elle lance au minimum lint, typecheck et tests disponibles, and elle echoue si une commande critique retourne une erreur.

## Tasks / Subtasks

- [ ] Verifier les preconditions issues de Story 1.1 (AC: 1)
  - [ ] Confirmer que `apps/mobile`, `packages/shared`, `supabase`, `package.json`, `pnpm-workspace.yaml` ou le workspace equivalent existent reellement.
  - [ ] Si Story 1.1 n'est pas implementee, s'arreter et implementer Story 1.1 d'abord; ne pas creer un deuxieme socle concurrent.
  - [ ] Identifier le package manager reel depuis le lockfile (`pnpm-lock.yaml`, `package-lock.json`, `yarn.lock`) et aligner les scripts/CI dessus.
- [ ] Initialiser ou completer Supabase local (AC: 1, 3)
  - [ ] Installer la CLI Supabase comme dependance dev du workspace si elle n'existe pas: `npm install --save-dev supabase` ou equivalent package manager detecte.
  - [ ] Executer `npx supabase init` seulement si `supabase/config.toml` n'existe pas deja.
  - [ ] Garantir la presence de `supabase/migrations/`, `supabase/functions/` et `supabase/tests/`.
  - [ ] Creer une migration initiale minimale, par exemple `supabase/migrations/0001_initial_schema.sql`, qui s'applique sur base vierge sans inventer le modele metier complet.
  - [ ] Ajouter une structure de tests database minimale compatible Supabase CLI, par exemple `supabase/tests/database/`, avec un test smoke pgTAP si le CLI local le permet.
- [ ] Documenter les variables d'environnement sans secrets (AC: 2)
  - [ ] Creer ou mettre a jour `.env.example` a la racine avec les variables communes.
  - [ ] Creer ou mettre a jour `apps/mobile/.env.example` avec uniquement les variables publiques Expo, prefixees `EXPO_PUBLIC_`.
  - [ ] Documenter clairement les variables reservees serveur, qui ne doivent jamais etre exposees a l'app mobile/web.
  - [ ] Ne jamais recopier `.env`, cle service-role, token Supabase personnel, mot de passe DB ou secret GitHub dans un fichier suivi par git.
- [ ] Generer ou simuler les types Supabase (AC: 4)
  - [ ] Ajouter un script `supabase:types` qui cible la sortie convenue, par exemple `packages/shared/src/types/database.types.ts` ou `apps/mobile/src/types/supabase.ts`.
  - [ ] Si la stack locale tourne, executer `npx supabase gen types typescript --local > <fichier-types>`.
  - [ ] Si Docker/Supabase local n'est pas disponible, creer un fichier de types placeholder explicite et documenter la commande exacte de regeneration.
  - [ ] Exporter ou rendre consommable le fichier de types depuis l'app et/ou `packages/shared`.
- [ ] Ajouter une CI legere GitHub Actions (AC: 5)
  - [ ] Creer `.github/workflows/ci.yml`.
  - [ ] Utiliser Node 20.x sauf contrainte explicite du template Expo genere.
  - [ ] Installer les dependances avec la commande stricte du package manager detecte (`npm ci`, `pnpm install --frozen-lockfile`, ou equivalent).
  - [ ] Lancer les scripts disponibles sans inventer de faux succes: `lint`, `typecheck`, `test` si presents; sinon ajouter des scripts no-op seulement s'ils sont clairement documentes comme temporaires et remplacables.
  - [ ] Si des tests Supabase database existent et Docker est disponible en CI, lancer `supabase db start` puis `supabase test db`; sinon documenter pourquoi le check Supabase est limite au lint/typecheck pour cette story.
- [ ] Mettre a jour la documentation developpeur (AC: 2, 3, 4, 5)
  - [ ] Ajouter au README ou `docs/development.md` les commandes Supabase locales: init, start, stop, db reset, test db, generation de types.
  - [ ] Documenter la difference entre variables publiques client, variables serveur et secrets GitHub Actions.
  - [ ] Documenter le workflow CI et les commandes a lancer avant PR.
- [ ] Valider et consigner (AC: 1, 3, 4, 5)
  - [ ] Lancer les commandes possibles localement et noter les resultats dans le Dev Agent Record.
  - [ ] Confirmer que `git diff` ne contient aucun secret.
  - [ ] Noter explicitement toute verification non faite faute de Docker, Supabase local, lockfile ou dependance issue de Story 1.1.

## Interventions utilisateur requises

Le dev agent doit avancer seul tant que les actions restent locales et sans secret. Il doit solliciter Flo uniquement dans les cas ci-dessous.

### 1. Preconditions Story 1.1 non remplies

Intervention possible: choisir l'ordre de travail si le socle Expo/monorepo n'existe pas encore.

Etapes ultra precises:

1. Le dev agent verifie:

   ```bash
   test -d apps/mobile
   test -d packages/shared
   test -d supabase
   test -f package.json
   ```

2. Si ces elements manquent parce que Story 1.1 n'a pas encore ete implementee, le dev agent doit s'arreter avant de faire Story 1.2.
3. Flo doit alors choisir explicitement:
   - implementer Story 1.1 maintenant;
   - ou demander seulement la preparation documentaire de Story 1.2 sans toucher au code.
4. Sans reponse de Flo, le dev agent ne doit pas inventer une structure parallele.

### 2. Docker Desktop / Supabase local

Intervention possible: demarrer Docker Desktop ou accepter que les validations Supabase locales soient reportees.

Etapes ultra precises:

1. Le dev agent teste Docker:

   ```bash
   docker --version
   docker info
   ```

2. Si `docker info` echoue, Flo doit ouvrir Docker Desktop et attendre que le statut indique que Docker est running.
3. Le dev agent relance ensuite:

   ```bash
   npx supabase start
   npx supabase db reset
   npx supabase test db
   ```

4. Si Flo ne veut pas demarrer Docker maintenant, le dev agent peut terminer la story avec:
   - structure Supabase creee;
   - scripts documentes;
   - types placeholder ou generation reportee;
   - note claire dans le Dev Agent Record indiquant que la validation locale Supabase n'a pas ete executee.
5. Le dev agent ne doit pas installer ou modifier Docker a la place de Flo.

### 3. Projet Supabase Cloud et secrets

Intervention possible: fournir des identifiants Cloud uniquement si Flo veut lier un projet reel pendant cette story.

Etapes ultra precises:

1. Par defaut, cette story doit fonctionner en local et ne necessite aucun projet Supabase Cloud.
2. Le dev agent ne doit pas demander de `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, `SUPABASE_SERVICE_ROLE_KEY` ni token personnel pour satisfaire les AC de base.
3. Si Flo demande explicitement de lier un projet Cloud, Flo doit fournir via un canal approprie:

   ```bash
   SUPABASE_PROJECT_REF=...
   SUPABASE_ACCESS_TOKEN=...
   SUPABASE_DB_PASSWORD=...
   ```

4. Ces valeurs doivent etre configurees uniquement en local ou en secrets GitHub, jamais dans `.env.example`, README avec vraies valeurs, migration SQL ou fichier suivi par git.
5. Si le dev agent detecte une vraie cle dans un fichier suivi par git, il doit s'arreter et demander confirmation avant toute suite, puis proposer de remplacer par placeholder.

### 4. GitHub Actions et secrets de repository

Intervention possible: configurer les secrets GitHub si une CI connectee a Supabase Cloud est demandee.

Etapes ultra precises:

1. Pour la CI legere de cette story, aucun secret GitHub n'est requis si elle se limite a lint/typecheck/tests locaux.
2. Si Flo veut que la CI teste une base Supabase Cloud ou pousse des migrations, Flo doit creer dans GitHub repository settings les secrets requis, par exemple:
   - `SUPABASE_ACCESS_TOKEN`
   - `SUPABASE_PROJECT_REF`
   - `SUPABASE_DB_PASSWORD`
3. Le dev agent doit fournir les noms exacts attendus dans le README/CI, mais ne doit jamais demander que Flo colle les valeurs dans le chat si ce n'est pas necessaire.
4. Tant que ces secrets ne sont pas configures, la CI ne doit pas tenter de deployer ou migrer un projet Cloud.

### 5. Choix du package manager

Intervention possible: arbitrer uniquement si plusieurs lockfiles existent.

Etapes ultra precises:

1. Le dev agent inspecte:

   ```bash
   ls pnpm-lock.yaml package-lock.json yarn.lock 2>/dev/null
   ```

2. Si un seul lockfile existe, utiliser ce package manager.
3. Si aucun lockfile n'existe, utiliser le choix etabli par Story 1.1 et documente dans le README.
4. Si plusieurs lockfiles existent, le dev agent doit demander a Flo lequel conserver avant de modifier les scripts ou la CI.
5. Le dev agent ne doit pas supprimer un lockfile sans confirmation explicite.

### 6. Validation finale par Flo

Intervention possible: relire les fichiers d'exemple et confirmer l'absence de secrets.

Etapes ultra precises:

1. Le dev agent affiche la liste des fichiers d'environnement suivis par git:

   ```bash
   git ls-files '*env*' '*.env*'
   ```

2. Flo verifie uniquement que les fichiers suivis contiennent des placeholders et aucune vraie cle.
3. Le dev agent lance aussi une recherche locale de motifs sensibles et documente le resultat:

   ```bash
   grep -R "service_role\\|SUPABASE_ACCESS_TOKEN\\|SUPABASE_DB_PASSWORD\\|eyJ" -n . --exclude-dir=.git --exclude-dir=node_modules
   ```

4. Si un faux positif apparait dans une documentation, le dev agent l'explique dans le Dev Agent Record.

## Dev Notes

### Execution locale dans ce workspace

Dans ce repo, lancer les commandes depuis WSL a la racine `/mnt/c/Users/Richeme/Playground/NextPoint` et respecter `RTK.md`: prefixer les commandes shell avec `rtk`. Exemple:

```bash
rtk npx supabase init
rtk npx supabase start
rtk npx supabase db reset
rtk npx supabase test db
```

Les snippets sans `rtk` cites depuis la documentation officielle indiquent la commande outil; dans ce workspace, les executer via `rtk` sauf si `rtk proxy` est explicitement necessaire pour une commande non supportee.

### Portee exacte

Cette story installe le socle Supabase, la structure de migrations/tests/types et la CI legere. Elle ne doit pas implementer le schema metier complet, les policies RLS exactes, les Edge Functions de booking, l'authentification email/password, ni les commandes transactionnelles; ces sujets sont couverts par les stories suivantes. [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.2`; `_bmad-output/planning-artifacts/architecture.md#Implementation Sequence`]

Story 1.2 depend du resultat reel de Story 1.1: app Expo et workspace initialises. Comme Story 1.1 est actuellement `ready-for-dev` et pas `done`, le dev agent doit verifier l'existence des fichiers avant d'implementer. [Source: `_bmad-output/implementation-artifacts/sprint-status.yaml`; `_bmad-output/implementation-artifacts/1-1-initialiser-lapplication-expo-mobile-web.md`]

### Architecture Supabase

Supabase PostgreSQL est la source de verite. Supabase Auth et RLS porteront l'authentification/autorisation, mais cette story doit seulement preparer l'outillage reproductible: CLI, config locale, migrations versionnees, emplacements de tests et generation de types. [Source: `_bmad-output/planning-artifacts/architecture.md#Data Architecture`; `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`]

Les mutations metier critiques devront passer par fonctions serveur transactionnelles plus tard. Ne pas commencer ici `request-booking`, `approve-booking`, `refuse-booking`, `cancel-booking`, `modify-booking` ou `consume-lesson-pack`. [Source: `_bmad-output/planning-artifacts/architecture.md#API & Communication Patterns`; `_bmad-output/planning-artifacts/epics.md#Additional Requirements`]

### Structure cible

Respecter au minimum:

```text
supabase/
├── config.toml
├── migrations/
├── functions/
└── tests/
```

Pour les tests executables par Supabase CLI, preferer un dossier compatible avec la documentation actuelle, par exemple `supabase/tests/database/`. Les sous-domaines `rls/` et `booking/` restent attendus pour les stories metier, mais ne doivent pas etre remplis avec de faux tests. [Source: `_bmad-output/planning-artifacts/architecture.md#Complete Project Directory Structure`; Supabase docs Testing and linting, consulte le 2026-06-21: https://supabase.com/docs/guides/local-development/cli/testing-and-linting]

### Types TypeScript

La generation cible doit produire un fichier de types consomme par l'app et/ou le package shared. Choisir un chemin stable et documente, par exemple:

```text
packages/shared/src/types/database.types.ts
```

Commande locale recommandee si Supabase local tourne:

```bash
npx supabase gen types typescript --local > packages/shared/src/types/database.types.ts
```

Si un projet Cloud est explicitement lie plus tard:

```bash
npx supabase gen types typescript --project-id "$SUPABASE_PROJECT_REF" --schema public > packages/shared/src/types/database.types.ts
```

[Source: Supabase docs Generating TypeScript Types, consulte le 2026-06-21: https://supabase.com/docs/guides/api/rest/generating-types]

### CI legere

La CI doit rester compatible free tier et echouer sur les commandes critiques. Utiliser GitHub Actions avec `actions/setup-node@v4`, Node 20.x sauf contrainte differente du template, et le package manager reel du repo. Les docs GitHub montrent `setup-node` avec cache npm/pnpm/yarn et des commandes identiques aux commandes locales. [Source: `_bmad-output/planning-artifacts/architecture.md#Infrastructure & Deployment`; GitHub docs Building and testing Node.js, consulte le 2026-06-21: https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs]

Pour Supabase en CI, la documentation officielle montre l'usage de `supabase/setup-cli` puis `supabase db start` et `supabase test db`. N'ajouter ce check que si les tests et la stack locale sont vraiment en place; sinon garder la CI Node legere et documenter le check Supabase comme prochaine extension. [Source: Supabase docs Automated testing using GitHub Actions, consulte le 2026-06-21: https://supabase.com/docs/guides/deployment/ci/testing]

### Securite et secrets

Ne jamais exposer de service-role key dans l'app. Les apps clientes n'utiliseront plus tard que l'URL projet et l'anon key publique. Les secrets serveur et tokens CI restent dans l'environnement local ou les GitHub Actions secrets. [Source: `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`; `_bmad-output/planning-artifacts/architecture.md#Environment Configuration`]

Les `.env.example` doivent expliquer le statut de chaque variable:

```bash
# Public client: safe to expose to Expo app
EXPO_PUBLIC_SUPABASE_URL=https://example.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=replace_me

# Server/CI only: never expose to client, never commit real value
SUPABASE_ACCESS_TOKEN=replace_me_in_github_secrets
SUPABASE_PROJECT_REF=replace_me
SUPABASE_DB_PASSWORD=replace_me_in_github_secrets
```

### Previous Story Intelligence

Story 1.1 a defini les regles utiles pour cette story:

- `apps/mobile`, `packages/shared` et `supabase` doivent venir du socle initial; ne pas creer de structure alternative.
- Les secrets restent hors depot; `.env.example` contient seulement des placeholders.
- Le dev agent doit documenter toute intervention de Flo dans `Dev Agent Record > Completion Notes List`.
- Si plusieurs choix de package manager apparaissent, ne pas improviser: inspecter le lockfile et demander en cas de conflit.

[Source: `_bmad-output/implementation-artifacts/1-1-initialiser-lapplication-expo-mobile-web.md#Interventions utilisateur requises`]

### Git Intelligence

Les 5 derniers commits sont documentaires: `Creation d'epics`, `creation epic et synchro des docs`, `Decision architecture + design - next step create stories`, `docs`, `Init project`. Aucun pattern backend ou CI existant n'est encore disponible; suivre l'architecture BMAD et le resultat de Story 1.1.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 1.2`
- `_bmad-output/planning-artifacts/architecture.md#Data Architecture`
- `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`
- `_bmad-output/planning-artifacts/architecture.md#Infrastructure & Deployment`
- `_bmad-output/planning-artifacts/architecture.md#Complete Project Directory Structure`
- `_bmad-output/implementation-artifacts/1-1-initialiser-lapplication-expo-mobile-web.md`
- Supabase local development: https://supabase.com/docs/guides/local-development/overview
- Supabase TypeScript types: https://supabase.com/docs/guides/api/rest/generating-types
- Supabase testing/linting: https://supabase.com/docs/guides/local-development/cli/testing-and-linting
- Supabase GitHub Actions testing: https://supabase.com/docs/guides/deployment/ci/testing
- GitHub Actions Node.js CI: https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- Story creee par le workflow bmad-create-story le 2026-06-21.
- Analyse de contexte terminee: epic 1, Story 1.2, architecture Supabase/CI, Story 1.1, sprint status, git recent et documentation officielle Supabase/GitHub.

### File List

- `_bmad-output/implementation-artifacts/1-2-initialiser-supabase-migrations-types-et-ci-legere.md`

## Completion Note

Ultimate context engine analysis completed - comprehensive developer guide created.
