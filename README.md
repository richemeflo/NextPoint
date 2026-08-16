# Equation Padel

Equation Padel est une application mobile-first, accompagnée d'une webapp, pensée pour simplifier la gestion de l'activite d'un coach de padel et la reservation de cours par ses eleves.

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
- `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_URL_WEB` et `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: variables publiques client, utilisables par l'app Expo.
- `EXPO_PUBLIC_APP_URL`: origine HTTPS publique de l'application, fixee a `https://equationpadel.fr`. Elle est utilisee pour les callbacks PKCE et configure les Universal Links iOS et App Links Android.
- `SUPABASE_ACCESS_TOKEN`, `SUPABASE_PROJECT_REF`, `SUPABASE_DB_PASSWORD`: variables serveur/CI uniquement. Les vraies valeurs restent dans l'environnement local ou les secrets GitHub Actions, jamais dans l'app cliente ni dans le depot.
- `EXPO_PUBLIC_LEGAL_*`, `EXPO_PUBLIC_SUPPORT_EMAIL`, `EXPO_PUBLIC_PRIVACY_EMAIL` et `EXPO_PUBLIC_HOSTING_*`: informations publiques affichees dans les mentions legales, les CGU, la politique de confidentialite et les pages de support. Remplacer tous les exemples avant le build de production.

Pour activer les liens verifies en production, ajouter `${EXPO_PUBLIC_APP_URL}/reset-password` aux Redirect URLs du projet Supabase et publier les associations de plateforme sur le meme domaine. Les deux chemins `/reset-password` et `/activate-student` doivent etre declares dans:

- `/.well-known/apple-app-site-association` pour `com.nextpoint.app` et l'identifiant d'equipe Apple;
- `/.well-known/assetlinks.json` pour `com.nextpoint.app` et chaque empreinte SHA-256 de signature Android.

Le fallback natif utilise le schema unique `com.nextpoint.app`. Le client Supabase utilise PKCE; les callbacks implicites contenant des access/refresh tokens sont refuses. Les liens d'activation placent leur jeton dans un fragment type, valide sur une origine autorisee puis retire immediatement de l'historique Web.

### Deploiement securise

- Dans Supabase Auth, reproduire les valeurs de `supabase/config.toml`: confirmation email activee, changement de mot de passe securise, minimum 12 caracteres avec majuscule, minuscule et chiffre.
- Definir le secret Edge Function avec `supabase secrets set NEXTPOINT_PUBLIC_APP_URL=https://equationpadel.fr`.
- Deployer `send-pending-push-notifications`, puis l'appeler depuis un cron serveur de confiance avec une requete `POST` et `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>`. Ne jamais placer cette cle dans Expo ni declencher ce worker depuis le client. Le worker utilise une reclamation atomique avec bail de 15 minutes, ce qui empeche deux executions concurrentes d'envoyer la meme notification.
- Deployer `manage-account-data` pour l'export et la suppression de compte, ainsi que `purge-retained-data` pour appliquer les durees de conservation. Appeler `purge-retained-data` une fois par jour depuis un cron serveur de confiance avec la cle `service_role`; ne jamais exposer cette cle dans Expo.
- Les sessions natives sont conservees dans iOS Keychain/Android Keystore via SecureStore; l'ancienne session AsyncStorage est migree puis supprimee au premier acces.
- La webapp statique embarque une CSP dans son HTML. Les en-tetes additionnels declares dans `app.config.js` (`HSTS`, anti-framing, `nosniff`, politique de permissions et de referrer) doivent aussi etre servis par l'hebergeur statique; ils sont appliques automatiquement lorsque la sortie est servie par Expo Server.
- Garder le pipeline de build sur des assets controles et surveiller la publication d'une version corrigee de la dependance transitive `image-size` utilisee par Metro.

### Mise en production des pages legales

- L'origine canonique est `https://equationpadel.fr`. `https://www.equationpadel.fr` redirige vers le domaine sans `www` via le fichier `public/.htaccess` copie dans l'export Expo.
- Les routes publiques sont `/privacy`, `/terms`, `/legal`, `/support`, `/data-rights` et `/delete-account`. Le fichier `.htaccess` fournit les reecritures necessaires a Expo Router sur OVH.
- Dans Supabase Auth, configurer `Site URL` sur `https://equationpadel.fr` et ajouter exactement `https://equationpadel.fr/reset-password` aux Redirect URLs.
- Generer le site avec `npm --prefix apps/mobile exec expo export -- --platform web`, puis envoyer tout le contenu de `apps/mobile/dist/` dans le dossier OVH `www`, y compris le fichier cache `.htaccess`. Activer le certificat SSL pour `equationpadel.fr` et `www.equationpadel.fr` avant de tester la redirection canonique.
- Verifier que les emails de support et de confidentialite sont releves, que l'identite de l'editeur est complete et que la region Supabase ainsi que les sous-traitants correspondent au texte publie.
- Programmer la purge quotidienne. Elle supprime les notifications et diagnostics push apres 6 mois, les jetons push inactifs apres 90 jours, les jetons d'activation apres 7 jours, les disponibilites et tarifs desactives apres 12 mois, et les donnees de preuve apres 5 ans.
- Configurer chez chaque prestataire les journaux techniques a 6 mois (12 mois uniquement si la securite le justifie) et le cycle de sauvegarde vise a 30 jours. Ces deux durees ne peuvent pas etre appliquees par la base applicative.
- Tester en production un export JSON, une rectification de profil et la suppression d'un compte de test. Conserver la preuve des tests et des executions de purge.

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
