# NextPoint

NextPoint est une application mobile-first, accompagnée d'une webapp, pensée pour simplifier la gestion de l'activite d'un coach de padel et la reservation de cours par ses eleves.

Le projet vise a centraliser en un seul endroit les disponibilites, les demandes de reservation pour un cours indiv ou collectif, les tarifs et le suivi simple des eleves. L'objectif du MVP est de reduire les echanges manuels entre coach et eleves et de rendre la prise de creneau plus directe.

## Ce que le produit permet

- Cote eleve: creer un profil, consulter les disponibilites d'un coach et demander un creneau.
- Cote coach: publier ses disponibilites, gerer ses tarifs, valider ou refuser des demandes et suivre ses eleves avec une note privee.
- Cote experience: proposer un usage prioritairement mobile, avec une webapp qui couvre les fonctions essentielles.

## Positionnement du MVP

Le MVP est concu d'abord pour un coach principal et ses eleves, avec une experience simple, rapide et lisible. La priorite n'est pas d'offrir un outil complet de gestion de club, mais un produit clair pour organiser les reservations et le planning au quotidien.

## Developpement

### Prerequis

- Node.js 22.13 ou plus recent pour Expo SDK 56.
- npm pour installer le workspace et lancer les commandes du template Expo genere dans `apps/mobile`.
- pnpm peut etre utilise plus tard au niveau monorepo; le fichier `pnpm-workspace.yaml` reference deja `apps/*` et `packages/*`.

### Installation

Depuis la racine du depot:

```bash
npm install
```

Le depot utilise npm comme package manager de reference parce que `package-lock.json` est le seul lockfile present.

### Lancer l'application Expo

Depuis la racine:

```bash
npm run mobile
npm run mobile:web
```

Depuis `apps/mobile`:

```bash
npm run start
npm run web
```

`npm run start` ouvre Expo pour mobile, simulateurs et Expo Go. `npm run web` demarre la webapp Expo.

Le script racine `npm run typecheck` lance le TypeScript check de l'application Expo.

### Supabase local

La CLI Supabase est installee comme dependance dev du workspace. Depuis la racine:

```bash
npm run supabase:start
npm run supabase:db:start
npm run supabase:db:reset
npm run supabase:test:db
npm run supabase:stop
```

Ces commandes demandent Docker. `supabase:db:start` demarre seulement Postgres pour les tests database; `supabase:start` demarre toute la stack locale.

La migration initiale `supabase/migrations/0001_initial_schema.sql` ne cree pas de modele metier. Elle pose seulement le baseline technique; les tables, policies RLS et tests metier seront ajoutes par les stories suivantes.

### Types Supabase

Le fichier `packages/shared/src/types/database.types.ts` contient un placeholder compatible avec la forme generee par Supabase. Quand Supabase local tourne:

```bash
npm run supabase:types
```

La commande regenere les types depuis la base locale avec `supabase gen types typescript --local`.

### Variables d'environnement

- `.env.example`: variables communes documentees pour le depot.
- `apps/mobile/.env.example`: variables publiques Expo uniquement.
- `EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_ANON_KEY`: variables publiques client, utilisables par l'app Expo.
- `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`: variables serveur/CI uniquement. Les vraies valeurs restent dans l'environnement local ou les secrets GitHub Actions, jamais dans l'app cliente ni dans le depot.

### CI

La CI legere GitHub Actions est definie dans `.github/workflows/ci.yml`. Elle utilise Node 20.x, installe avec `npm ci`, puis lance:

```bash
npm run lint
npm run typecheck
npm test
npm run supabase:db:start
npm run supabase:db:reset
npm run supabase:test:db
```

Le test Node verifie que les fichiers d'exemple d'environnement contiennent uniquement des placeholders. Le test database Supabase execute le smoke test pgTAP dans `supabase/tests/database/`.

### Structure du depot

- `apps/mobile`: application Expo React Native TypeScript, mobile-first avec support web.
- `packages/shared`: futur package partage; les contrats vivront dans `packages/shared/src/contracts`.
- `supabase`: configuration locale, migration baseline, fonctions et tests database prepares.
- `.env.example` et `env.example`: exemples de variables avec placeholders uniquement.

### Expo Router

L'application garde Expo Router fourni par le template SDK 56. Les routes vivent dans `apps/mobile/src/app`.

Les groupes de routes entre parentheses servent a organiser routes et layouts, mais ils ne sont pas visibles dans l'URL. Par exemple:

```text
app/(coach)/planning/index.tsx -> /planning
app/(auth)/login.tsx -> /login
```

Ces groupes seront ajoutes dans les stories dediees a l'authentification et aux parcours coach/eleve.
