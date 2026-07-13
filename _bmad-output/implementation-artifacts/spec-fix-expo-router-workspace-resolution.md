---
title: 'Réparer la résolution Expo Router dans le workspace npm'
type: 'bugfix'
created: '2026-07-13'
status: 'done'
baseline_commit: 'aeef8ce0ba2cbc5ddb3fff7f90185533d84117fa'
context:
  - '{project-root}/apps/mobile/AGENTS.md'
  - '{project-root}/_bmad-output/implementation-artifacts/investigations/expo-router-ctx-shared-investigation.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** `npm run mobile -- --lan` échoue pendant la génération des routes typées, car le lockfile racine place Expo et son Router Server dans `node_modules` tout en laissant Expo Router uniquement sous `apps/mobile/node_modules`. Le dépôt maintient aussi deux lockfiles npm concurrents et le script racine n'achemine pas `--lan` jusqu'au CLI Expo.

**Approach:** Faire du workspace racine l'unique source de vérité npm, garantir qu'Expo Router est résolvable depuis l'Expo hoisté, régénérer l'installation depuis la racine et transmettre explicitement les arguments du script racine au script mobile.

## Boundaries & Constraints

**Always:** Conserver Expo SDK 56 et Expo Router dans le manifeste mobile ; conserver `apps/mobile` comme application Expo ; effectuer les installations workspace depuis la racine ; produire un seul `package-lock.json` autoritatif ; préserver `typedRoutes: true` ; utiliser les versions compatibles documentées pour SDK 56.

**Ask First:** Tout changement de version majeure/mineure Expo, changement de gestionnaire de paquets, modification de la structure des workspaces ou correction nécessitant un patch d'un paquet tiers.

**Never:** Modifier `node_modules` à la main ; ajouter un contournement `NODE_PATH` ou un lien symbolique postinstall ; désactiver les routes typées ; masquer l'erreur en ignorant la génération de types ; supprimer Expo Router du manifeste mobile.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Démarrage LAN | `npm run mobile -- --lan` depuis la racine | Le script exécuté devient `expo start --lan` et Metro reste démarré sans `MODULE_NOT_FOUND` | Toute exception avant l'état d'attente échoue la vérification |
| Installation propre | Aucun `node_modules`, lockfile racine conservé | `npm install` depuis la racine recrée un arbre où Router Server résout `expo-router/_ctx-shared` | Ne pas restaurer le lockfile mobile ni patcher l'arbre après installation |
| Résolution SDK | Versions Expo SDK 56 déclarées | Une seule version compatible de chaque paquet critique est utilisée | Arrêter avant toute mise à niveau hors SDK 56 |

</frozen-after-approval>

## Code Map

- `package.json` -- configuration workspace, dépendances de tooling racine et scripts de lancement.
- `apps/mobile/package.json` -- propriétaire des dépendances runtime Expo/Expo Router et scripts Expo.
- `package-lock.json` -- unique graphe npm autoritatif à régénérer depuis la racine.
- `apps/mobile/package-lock.json` -- lockfile autonome concurrent à retirer.
- `apps/mobile/app.json` -- garde-fou : `typedRoutes` doit rester activé.

## Tasks & Acceptance

**Execution:**
- [x] `package.json` -- assurer une résolution racine explicite d'Expo Router compatible SDK 56 et ajouter le séparateur nécessaire au passage des arguments vers le script mobile.
- [x] `apps/mobile/package-lock.json` -- supprimer la seconde source de vérité npm du workspace.
- [x] `package-lock.json` -- régénérer depuis la racine et vérifier que `expo` et `expo-router` sont accessibles sur la chaîne de résolution de Router Server.
- [x] `node_modules` -- reconstruire l'installation à partir du lockfile racine sans modification manuelle.
- [x] Démarrage et contrôles statiques -- valider la matrice, le typecheck et le lint mobile.

**Acceptance Criteria:**
- Given le dépôt après installation racine, when Router Server résout `expo-router/_ctx-shared`, then la résolution pointe vers le paquet SDK 56 attendu sans mécanisme de contournement.
- Given les manifests suivis par Git, when les sources de vérité npm sont inventoriées, then seul le `package-lock.json` racine subsiste.
- Given `typedRoutes: true`, when le projet mobile atteint Metro, then aucune exception de génération des routes typées n'arrête le processus.
- Given le correctif appliqué, when les contrôles existants sont exécutés, then typecheck et lint mobile restent passants.

## Spec Change Log

## Design Notes

Expo recommande d'installer les dépendances d'un monorepo depuis sa racine. La dépendance reste déclarée par l'application mobile ; la déclaration racine sert uniquement à rendre le peer optionnel d'Expo Router visible au CLI Expo hoisté et à stabiliser la topologie produite par npm.

## Verification

**Commands:**
- `npm install` -- expected: installation workspace terminée depuis la racine et lockfile unique mis à jour.
- `npm ls expo expo-router @expo/router-server --all` -- expected: versions SDK 56 cohérentes, sans dépendance invalide.
- `npm ls expo-constants expo-font react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-screens react-native-worklets --all` -- expected: une seule version SDK 56 de chaque module et code de sortie 0.
- `npx expo-modules-autolinking verify --project-root apps/mobile --platform all --json` -- expected: `"duplicates":[]`.
- `node -e "const path=require('node:path'); const server=path.resolve('node_modules/expo/node_modules/@expo/cli/node_modules/@expo/router-server/package.json'); console.log(require.resolve('expo-router/_ctx-shared', { paths: [path.dirname(server)] }))"` -- expected: sous-chemin résolu depuis l'emplacement réel de Router Server.
- `npm run typecheck` -- expected: succès.
- `npm run mobile:lint` -- expected: succès.
- `npm run mobile -- --lan` -- expected: Expo exécute le mode LAN et reste en attente sans exception de routes typées.

**Résultats:**
- Installation racine et `npm ci` propre réussis ; un seul lockfile subsiste.
- Expo `56.0.12`, Expo Router `56.2.11`, Expo Constants `56.0.20`, Expo Font `56.0.7` et Router Server `56.0.14` sont dédupliqués sur la chaîne utile.
- Les peers natifs d'Expo Router sont alignés sur les versions SDK 56 du mobile ; l'autolinking retourne `duplicates: []`.
- Résolution `_ctx-shared`, graphe npm, typecheck complet, lint mobile et `git diff --check` réussis.
- `npm run mobile -- --lan` transmet bien `expo start --lan`, atteint `Waiting on http://localhost:8081` sans exception, puis est arrêté proprement.

## Suggested Review Order

**Entrée et topologie workspace**

- Transmet les arguments CLI au script Expo imbriqué.
  [`package.json:12`](../../package.json#L12)

- Hoiste les paquets SDK 56 requis par Router Server.
  [`package.json:44`](../../package.json#L44)

- Aligne les peers natifs pour éviter tout doublon d'autolinking.
  [`package.json:51`](../../package.json#L51)

**Graphe npm régénéré**

- Rend Expo Router accessible depuis la chaîne du CLI racine.
  [`package-lock.json:6883`](../../package-lock.json#L6883)

- Déduplique Reanimated, Screens et Worklets sur les versions mobiles.
  [`package-lock.json:10859`](../../package-lock.json#L10859)

**Preuves et transmission**

- Regroupe les commandes et résultats de vérification reproductibles.
  [`spec-fix-expo-router-workspace-resolution.md:67`](spec-fix-expo-router-workspace-resolution.md#L67)

- Résume la cause racine et l'état conclu de l'enquête.
  [`expo-router-ctx-shared-investigation.md:3`](investigations/expo-router-ctx-shared-investigation.md#L3)
