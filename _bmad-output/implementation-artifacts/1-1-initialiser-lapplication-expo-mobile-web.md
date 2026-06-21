---
baseline_commit: 69ea5dafeafa90a9f5eb8f3e0069af48b2d75dd3
---

# Story 1.1: Initialiser l’application Expo mobile/web

Status: review

<!-- Note: Validation optionnelle. Lancer validate-create-story pour controle qualite avant dev-story. -->

## Story

As a utilisateur NextPoint,
I want une application mobile-first avec webapp complementaire initialisee,
so that les parcours P0 puissent etre construits sur une base technique coherente et partagee.

## Acceptance Criteria

1. Given un depot NextPoint vide ou pret pour l'implementation, when le projet est initialise, then l'application Expo est creee dans `apps/mobile` avec `create-expo-app` et le template `default@sdk-56`, and le projet utilise TypeScript.
2. Given l'application Expo initialisee, when le developpeur lance l'app en mode developpement, then l'app peut demarrer sur mobile et web via les commandes Expo documentees, and la structure supporte Expo Router.
3. Given la structure projet cible, when les fichiers de base sont crees, then le depot contient les emplacements attendus pour `apps/mobile`, `packages/shared` et `supabase`, and les fichiers d'exemple d'environnement ne contiennent aucun secret reel.
4. Given un developpeur qui decouvre le projet, when il lit le README, then il comprend comment lancer l'app Expo, and il comprend que les groupes de routes Expo Router comme `(coach)` et `(auth)` n'apparaissent pas dans l'URL.

## Tasks / Subtasks

- [x] Initialiser l'app Expo TypeScript dans `apps/mobile` (AC: 1, 2)
  - [x] Executer depuis la racine: `npx create-expo-app@latest apps/mobile --template default@sdk-56`.
  - [x] Conserver Expo Router installe/configure par le template par defaut; ne pas remplacer par React Navigation manuel.
  - [x] Verifier que `apps/mobile` demarre en TypeScript et contient la structure Expo Router generee.
- [x] Mettre en place le squelette monorepo attendu (AC: 3)
  - [x] Ajouter les fichiers racine minimaux pour workspace TypeScript: `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json` si absents.
  - [x] Creer `packages/shared/src/contracts/` et un `packages/shared/package.json` minimal sans y ajouter de logique metier.
  - [x] Creer `supabase/migrations/`, `supabase/functions/` et `supabase/tests/` comme emplacements vides/prets pour la story 1.2.
  - [x] Garder les secrets hors depot; corriger/renommer les exemples d'environnement si necessaire en `.env.example` ou fichier equivalent documente.
- [x] Aligner la documentation developpeur (AC: 2, 4)
  - [x] Mettre a jour le README racine avec les commandes pour installer, lancer mobile et lancer web depuis `apps/mobile`.
  - [x] Documenter explicitement les groupes Expo Router: les dossiers entre parentheses organisent routes/layouts mais ne sont pas dans l'URL, par exemple `app/(coach)/planning/index.tsx -> /planning`.
  - [x] Documenter les emplacements `apps/mobile`, `packages/shared` et `supabase`, et le fait que Supabase est prepare mais pas implemente dans cette story.
- [x] Valider l'initialisation (AC: 1, 2, 3, 4)
  - [x] Lancer au minimum les commandes de verification disponibles du template: installation, typecheck/lint si presents, et demarrage Expo web.
  - [x] Confirmer qu'aucun secret reel n'est present dans les fichiers d'exemple d'environnement.
  - [x] Noter toute limite de verification dans le Dev Agent Record.

## Interventions utilisateur requises

Le dev agent doit executer tout ce qui peut l'etre sans intervention. Il ne doit solliciter Flo que dans les cas listés ci-dessous. Si une situation non listee apparait, le dev agent doit choisir l'option la moins risquee si elle ne modifie pas de donnees externes, sinon demander confirmation avant de continuer.

### 1. Validation avant installation de dependances

Intervention possible: autoriser l'installation reseau de dependances npm/Expo si l'environnement le demande.

Etapes ultra precises:

1. Le dev agent lance depuis la racine du repo:

   ```bash
   npx create-expo-app@latest apps/mobile --template default@sdk-56
   ```

2. Si `npx` affiche une question du type `Need to install the following packages: create-expo-app@... Ok to proceed?`, repondre `y`.
3. Si le terminal demande de choisir un package manager, choisir `npm` uniquement pour laisser le template s'initialiser, puis le dev agent mettra ensuite en place le workspace racine selon l'architecture. Ne pas choisir `bun` ou `yarn` sans demande explicite de Flo.
4. Si la commande echoue parce que Node.js ou npm est absent/incompatible, le dev agent doit s'arreter et demander a Flo d'installer ou d'activer une version Node LTS compatible Expo. Il doit indiquer la version detectee avec:

   ```bash
   node --version
   npm --version
   ```

5. Si `apps/mobile` existe deja et contient des fichiers non generes par cette tentative, le dev agent doit s'arreter avant ecrasement et demander a Flo s'il faut conserver, fusionner ou supprimer ce dossier.

### 2. Choix lies aux secrets et variables d'environnement

Intervention possible: fournir de vraies valeurs Supabase ou confirmer qu'elles restent en placeholders.

Etapes ultra precises:

1. Pour cette story, le dev agent ne doit demander aucune vraie cle Supabase.
2. Les fichiers d'exemple doivent contenir uniquement des placeholders, par exemple:

   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://example.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=replace_me
   ```

3. Si un fichier `.env` local existe avec de vraies valeurs, le dev agent ne doit pas les lire dans la story ni les recopier dans un fichier suivi par git.
4. Si une verification necessite une variable absente, le dev agent doit documenter la limite dans le Dev Agent Record au lieu de demander un secret.
5. Si Flo veut tester avec un projet Supabase reel pendant cette story, Flo doit fournir explicitement les valeurs dans un canal approprie; sinon l'implementation doit rester sur exemples/placeholders.

### 3. Verification visuelle de l'app Expo

Intervention possible: confirmer que l'app s'affiche correctement sur le navigateur ou sur telephone.

Etapes ultra precises:

1. Le dev agent lance le web depuis `apps/mobile`:

   ```bash
   npm run web
   ```

   ou, si le script differe apres generation du template:

   ```bash
   npx expo start --web
   ```

2. Si Expo ouvre une URL locale automatiquement, le dev agent doit noter l'URL dans le Dev Agent Record.
3. Si Expo affiche seulement une URL locale, ouvrir l'URL web indiquee, generalement `http://localhost:8081` ou le port choisi par Expo.
4. Flo doit seulement intervenir si le dev agent ne peut pas inspecter le rendu local. Dans ce cas, Flo verifie:
   - la page web charge sans erreur rouge;
   - l'ecran du template Expo est visible;
   - aucune erreur Metro/Expo ne s'affiche dans le terminal;
   - le rechargement navigateur garde l'app fonctionnelle.
5. Si Flo veut valider sur telephone, scanner le QR code Expo avec Expo Go. Cette validation mobile physique est utile mais non bloquante pour cette story si le web fonctionne et que le dev agent documente la limite.

### 4. Conflits de ports ou serveur deja lance

Intervention possible: aucune sauf si tous les ports locaux echouent.

Etapes ultra precises:

1. Si Expo signale qu'un port est deja utilise et propose un autre port, accepter le port alternatif.
2. Noter le port final dans le Dev Agent Record.
3. Ne pas tuer un processus inconnu sans verifier qu'il appartient au projet NextPoint.
4. Si aucun port ne fonctionne, demander a Flo s'il faut arreter le processus qui occupe le port, en indiquant le PID et la commande detectee.

### 5. Decisions a ne pas demander a Flo dans cette story

Le dev agent doit appliquer ces choix directement:

- Garder Expo Router fourni par le template.
- Ne pas ajouter de UI kit lourd.
- Ne pas choisir de fournisseur push.
- Ne pas configurer Supabase Cloud.
- Ne pas creer de migrations SQL reelles.
- Ne pas implementer les groupes `(coach)`, `(student)`, `(auth)` en profondeur; seulement documenter leur fonctionnement dans le README si le template ne les cree pas encore.
- Ne pas ajouter Redux, Zustand, Tamagui ou autre dependance structurante sans story dediee ou validation explicite.

### 6. Sortie attendue apres intervention ou verification

Quand une intervention de Flo a ete necessaire, le dev agent doit ajouter dans `Dev Agent Record > Completion Notes List`:

- la question posee;
- la reponse de Flo;
- la commande relancee apres reponse;
- le resultat obtenu;
- toute limite restante.

## Dev Notes

### Portee exacte

Cette story est la premiere story d'implementation. Elle doit initialiser le socle technique et la structure de depot, pas commencer les fonctionnalites metier. Ne pas implementer auth, profils, Supabase local, migrations, RLS, UI tokens complete, i18n ou navigation coach/eleve finale dans cette story; ces sujets commencent dans les stories suivantes. [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.1`; `_bmad-output/planning-artifacts/architecture.md#Implementation Sequence`]

Le depot actuel ne contient pas encore `apps/`, `packages/` ni `supabase/`. Il contient surtout les artefacts BMAD, le README produit, `pyproject.toml`, `main.py`, `env.example`, `.env` vide et `.gitignore`. La story doit donc ajouter le socle sans supprimer les artefacts existants. [Source: inspection repo 2026-06-21]

### Commande d'initialisation obligatoire

Utiliser exactement:

```bash
npx create-expo-app@latest apps/mobile --template default@sdk-56
```

La documentation Expo officielle publie que, pendant la transition SDK 56, `create-expo-app@latest` sans `--template` peut creer un projet SDK 54; le template `default@sdk-56` doit donc rester explicite. Le template par defaut inclut TypeScript, une base de navigation et Expo Router. [Source: `_bmad-output/planning-artifacts/architecture.md#Selected Starter`; Expo docs `create-expo-app`, consulte le 2026-06-21: https://docs.expo.dev/more/create-expo/; Expo docs TypeScript: https://docs.expo.dev/guides/typescript/]

### Structure cible

La structure attendue par l'architecture est:

```text
nextpoint/
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── apps/
│   └── mobile/
├── packages/
│   └── shared/
│       └── src/
│           └── contracts/
└── supabase/
    ├── migrations/
    ├── functions/
    └── tests/
```

Les dossiers metier plus detailles (`features/auth`, `features/bookings`, contrats de commandes, migrations SQL, Edge Functions) sont documentes par l'architecture mais ne doivent pas etre remplis par anticipation dans cette story. [Source: `_bmad-output/planning-artifacts/architecture.md#Complete Project Directory Structure`; `_bmad-output/planning-artifacts/architecture.md#File Organization Patterns`]

### Expo Router et routes

Expo Router est le routeur retenu pour mobile et web. Les routes vivront dans `apps/mobile/app` ou `apps/mobile/src/app` selon le template genere; suivre le template au lieu de deplacer artificiellement les fichiers. Les groupes de routes comme `(public)`, `(auth)`, `(coach)` et `(student)` organisent layouts et frontieres d'acces sans apparaitre dans le chemin URL. Cette explication doit etre dans le README. [Source: `_bmad-output/planning-artifacts/architecture.md#Routing Strategy`; `_bmad-output/planning-artifacts/architecture.md#README Requirement`; Expo Router notation: https://docs.expo.dev/router/basics/notation/]

### Garde-fous d'architecture

- App mobile/web: Expo React Native TypeScript, mobile-first, webapp P0 fonctionnelle. [Source: `_bmad-output/planning-artifacts/prd.md#Hypotheses MVP`; `_bmad-output/planning-artifacts/architecture.md#Starter Template Evaluation`]
- Monorepo: `apps/mobile`, `packages/shared`, `supabase`; les contrats partages seront dans `packages/shared/src/contracts`. [Source: `_bmad-output/planning-artifacts/epics.md#Additional Requirements`; `_bmad-output/planning-artifacts/architecture.md#Project Organization`]
- Server state futur: TanStack Query; formulaires futurs: React Hook Form + Zod; ne pas ajouter Redux/Zustand en P0 sans besoin concret. [Source: `_bmad-output/planning-artifacts/architecture.md#Frontend Architecture`]
- Supabase est la source de verite future, mais la story 1.2 initialise migrations, types et CI. Dans cette story, creer seulement les emplacements Supabase si absents. [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.2`; `_bmad-output/planning-artifacts/architecture.md#Data Architecture`]
- Aucun secret service-role ou secret reel ne doit etre commite. Les apps clientes ne recevront plus tard que les URL et cles publiques necessaires. [Source: `_bmad-output/planning-artifacts/architecture.md#Authentication & Security`; `_bmad-output/planning-artifacts/architecture.md#Environment Configuration`]

### Contraintes UX a preparer sans sur-implementer

La base doit rester compatible avec une experience mobile-first, themes light/dark, i18n FR/EN/ES et tokens design NextPoint. Cette story peut documenter et reserver les emplacements, mais la couche UI/tokens/i18n complete appartient a la story 1.3. [Source: `_bmad-output/planning-artifacts/epics.md#Story 1.3`; `_bmad-output/planning-artifacts/design-tokens.md#Contraintes Front`; `_bmad-output/planning-artifacts/ux-designs/ux-NextPoint-2026-06-07/EXPERIENCE.md#Foundation`]

Ne pas coder de couleurs en dur dans des composants ajoutes manuellement. Si le template genere contient des exemples, ne pas transformer toute l'UI maintenant; limiter les ajustements au necessaire pour garder l'app demarrable. [Source: `_bmad-output/planning-artifacts/design-tokens.md#Contraintes Front`; `_bmad-output/planning-artifacts/architecture.md#Enforcement Guidelines`]

### Tests et verification

Apres initialisation, verifier au minimum:

- installation des dependances;
- demarrage Expo depuis `apps/mobile`;
- demarrage web Expo si l'environnement local le permet;
- typecheck/lint/tests si le template ou les scripts ajoutes les exposent;
- absence de secrets reels dans les fichiers d'exemple d'environnement.

Si un serveur interactif doit rester ouvert, noter la commande et le resultat plutot que de laisser une session bloquante. [Source: `_bmad-output/planning-artifacts/architecture.md#Development Workflow Integration`; `_bmad-output/planning-artifacts/architecture.md#README Requirement`]

### Informations techniques recentes

- Expo recommande explicitement `--template default@sdk-56` pour creer un projet SDK 56 pendant la transition actuelle; sans template, `create-expo-app@latest` peut creer un SDK 54. [Source: Expo docs `create-expo-app`, consulte le 2026-06-21: https://docs.expo.dev/more/create-expo/]
- Expo Router est le routeur recommande pour les projets Expo et transforme les fichiers du dossier app en routes pour native et web. [Source: Expo docs Navigation, consulte le 2026-06-21: https://docs.expo.dev/develop/app-navigation/]
- Les monorepos Expo sont officiellement supportes via workspaces; garder `apps/mobile` comme app Expo et `packages/shared` comme package workspace. [Source: Expo docs Monorepos, consulte le 2026-06-21: https://docs.expo.dev/guides/monorepos/]

### Previous Story Intelligence

Aucune story precedente: `1.1` est la premiere story de l'epic 1. Aucun apprentissage de developpement anterieur n'est disponible.

### Git Intelligence

Les 5 derniers commits sont documentaires: `Creation d'epics`, `creation epic et synchro des docs`, `Decision architecture + design - next step create stories`, `docs`, `Init project`. Aucun pattern de code applicatif existant ne precede cette story. Le changement doit donc suivre les artefacts BMAD plutot qu'un style d'application deja present.

### References

- `_bmad-output/planning-artifacts/epics.md#Story 1.1`
- `_bmad-output/planning-artifacts/architecture.md#Selected Starter`
- `_bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries`
- `_bmad-output/planning-artifacts/architecture.md#README Requirement`
- `_bmad-output/planning-artifacts/prd.md#Hypotheses MVP`
- `_bmad-output/planning-artifacts/design-tokens.md#Contraintes Front`
- `_bmad-output/planning-artifacts/ux-screen-inventory.md#Principes UX`
- `_bmad-output/planning-artifacts/ux-designs/ux-NextPoint-2026-06-07/EXPERIENCE.md#Foundation`
- Expo docs create-expo-app: https://docs.expo.dev/more/create-expo/
- Expo docs TypeScript: https://docs.expo.dev/guides/typescript/
- Expo Router notation: https://docs.expo.dev/router/basics/notation/
- Expo monorepos: https://docs.expo.dev/guides/monorepos/

## Dev Agent Record

### Agent Model Used

GPT-5 Codex

### Debug Log References

- 2026-06-21: Activation bmad-dev-story effectuee; workflow personnalise resolu sans etapes prepend/append.
- 2026-06-21: `apps/mobile` existe deja apres execution utilisateur de `npx create-expo-app@latest apps/mobile --template default@sdk-56`; template Expo SDK 56, TypeScript et Expo Router confirmes.
- 2026-06-21: `npm --prefix apps/mobile install` passe; npm signale 11 vulnerabilites moderees dans l'arbre du template, non corrigees automatiquement car `npm audit fix` est hors portee de cette story.
- 2026-06-21: Premier demarrage Expo web en workspace echoue en HTTP 500 car Metro cherche le `node_modules` racine; correction par `npm install` a la racine et ajout de `node_modules/` dans `.gitignore`.
- 2026-06-21: Expo web valide sur `http://localhost:8101` avec HTTP 200; serveur arrete apres verification.

### Completion Notes List

- Story creee par le workflow bmad-create-story le 2026-06-21.
- Analyse de contexte terminee: epics, PRD, architecture, design tokens, inventaire UX, experience UX, sprint status et git recent.
- Implementation demarree avec baseline git `69ea5dafeafa90a9f5eb8f3e0069af48b2d75dd3`.
- Application Expo SDK 56 TypeScript initialisee dans `apps/mobile` avec Expo Router conserve (`main: expo-router/entry`, routes sous `apps/mobile/src/app`).
- Squelette monorepo ajoute: workspace racine npm/pnpm, `packages/shared/src/contracts`, emplacements `supabase/migrations`, `supabase/functions` et `supabase/tests`.
- README racine complete avec installation, lancement mobile/web, structure du depot et explication des groupes Expo Router invisibles dans l'URL.
- `env.example` contient uniquement des placeholders publics; `.env` local non lu et non recopie.
- Validations executees: `npm install`, `npm --prefix apps/mobile install`, `npm run typecheck`, `npm --prefix apps/mobile run lint`, Expo web HTTP 200 sur `http://localhost:8101`.
- Limite restante: validation mobile physique non executee; non bloquante car la validation web Expo fonctionne. npm audit signale 11 vulnerabilites moderees du template, non corrigees dans cette story.

### File List

- `.gitignore`
- `README.md`
- `env.example`
- `_bmad-output/implementation-artifacts/1-1-initialiser-lapplication-expo-mobile-web.md`
- `_bmad-output/implementation-artifacts/sprint-status.yaml`
- `apps/mobile/.gitignore`
- `apps/mobile/CLAUDE.md`
- `apps/mobile/LICENSE`
- `apps/mobile/README.md`
- `apps/mobile/app.json`
- `apps/mobile/assets/expo.icon/Assets/expo-symbol 2.svg`
- `apps/mobile/assets/expo.icon/Assets/grid.png`
- `apps/mobile/assets/expo.icon/icon.json`
- `apps/mobile/assets/images/android-icon-background.png`
- `apps/mobile/assets/images/android-icon-foreground.png`
- `apps/mobile/assets/images/android-icon-monochrome.png`
- `apps/mobile/assets/images/expo-badge-white.png`
- `apps/mobile/assets/images/expo-badge.png`
- `apps/mobile/assets/images/expo-logo.png`
- `apps/mobile/assets/images/favicon.png`
- `apps/mobile/assets/images/icon.png`
- `apps/mobile/assets/images/logo-glow.png`
- `apps/mobile/assets/images/react-logo.png`
- `apps/mobile/assets/images/react-logo@2x.png`
- `apps/mobile/assets/images/react-logo@3x.png`
- `apps/mobile/assets/images/splash-icon.png`
- `apps/mobile/assets/images/tabIcons/explore.png`
- `apps/mobile/assets/images/tabIcons/explore@2x.png`
- `apps/mobile/assets/images/tabIcons/explore@3x.png`
- `apps/mobile/assets/images/tabIcons/home.png`
- `apps/mobile/assets/images/tabIcons/home@2x.png`
- `apps/mobile/assets/images/tabIcons/home@3x.png`
- `apps/mobile/assets/images/tutorial-web.png`
- `apps/mobile/eslint.config.js`
- `apps/mobile/expo-env.d.ts`
- `apps/mobile/package-lock.json`
- `apps/mobile/package.json`
- `apps/mobile/scripts/reset-project.js`
- `apps/mobile/src/app/_layout.tsx`
- `apps/mobile/src/app/explore.tsx`
- `apps/mobile/src/app/index.tsx`
- `apps/mobile/src/components/animated-icon.module.css`
- `apps/mobile/src/components/animated-icon.tsx`
- `apps/mobile/src/components/animated-icon.web.tsx`
- `apps/mobile/src/components/app-tabs.tsx`
- `apps/mobile/src/components/app-tabs.web.tsx`
- `apps/mobile/src/components/external-link.tsx`
- `apps/mobile/src/components/hint-row.tsx`
- `apps/mobile/src/components/themed-text.tsx`
- `apps/mobile/src/components/themed-view.tsx`
- `apps/mobile/src/components/ui/collapsible.tsx`
- `apps/mobile/src/components/web-badge.tsx`
- `apps/mobile/src/constants/theme.ts`
- `apps/mobile/src/global.css`
- `apps/mobile/src/hooks/use-color-scheme.ts`
- `apps/mobile/src/hooks/use-color-scheme.web.ts`
- `apps/mobile/src/hooks/use-theme.ts`
- `apps/mobile/tsconfig.json`
- `package-lock.json`
- `package.json`
- `packages/shared/package.json`
- `packages/shared/src/contracts/.gitkeep`
- `pnpm-workspace.yaml`
- `supabase/functions/.gitkeep`
- `supabase/migrations/.gitkeep`
- `supabase/tests/.gitkeep`
- `tsconfig.base.json`

### Change Log

- 2026-06-21: Initialisation Expo SDK 56 reprise depuis `apps/mobile`, workspace monorepo ajoute, documentation developpeur alignee, validations locales passees, story prete pour review.

## Completion Note

Ultimate context engine analysis completed - comprehensive developer guide created.
