---
title: 'Réparer la résolution React Native Web du rendu serveur Expo'
type: 'bugfix'
created: '2026-07-13'
status: 'done'
baseline_commit: '2c438fca69b8ba15e0e99d029fe09306f495b1ec'
context:
  - '{project-root}/apps/mobile/AGENTS.md'
  - '{project-root}/_bmad-output/implementation-artifacts/spec-fix-expo-router-workspace-resolution.md'
  - '{project-root}/_bmad-output/implementation-artifacts/investigations/inline-style-prefixer-createprefixer-investigation.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Après le correctif de hoisting Expo Router, une requête web atteint le bundle de rendu serveur mais échoue sur `inline-style-prefixer/lib/createPrefixer`. React Native Web et son sous-graphe existent uniquement sous `apps/mobile/node_modules`, hors du chemin de résolution du Router Server racine.

**Approach:** Miroiter à la racine la version React Native Web SDK 56 déjà résolue par l'application afin que npm hoiste son sous-graphe complet, puis vérifier la résolution depuis Router Server et une vraie requête web.

## Boundaries & Constraints

**Always:** Conserver Expo SDK 56, React Native Web `~0.21.0` dans le manifeste mobile et le lockfile racine unique ; utiliser `0.21.2`, déjà résolu et compatible avec la plage SDK ; préserver les pins natifs et l'autolinking sans doublon du correctif `2c438fc` ; valider le rendu par une requête HTTP, pas seulement par le démarrage de Metro.

**Ask First:** Toute mise à niveau Expo/React Native Web hors des plages actuelles, modification du mode de rendu web, changement de gestionnaire de paquets ou patch d'un paquet tiers.

**Never:** Déclarer directement `inline-style-prefixer` à la racine ; modifier `node_modules` ; ajouter `NODE_PATH`, lien symbolique ou postinstall de copie ; désactiver le rendu serveur ou revenir sur la résolution Expo Router précédente.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Résolution serveur | `require` depuis Router Server racine | React Native Web et `inline-style-prefixer/lib/createPrefixer` se résolvent dans le graphe racine | Tout `MODULE_NOT_FOUND` échoue la vérification |
| Requête web | Serveur Expo web prêt, requête HTTP sur `/` | Réponse HTTP réussie et aucune Server Error dans les logs | Capturer logs/statut puis arrêter le serveur proprement |
| Installation propre | `npm ci` depuis le lockfile final | Une copie de React Native Web et Prefixer, aucun doublon natif | Refuser tout correctif manuel après installation |

</frozen-after-approval>

## Code Map

- `package.json` -- miroir des dépendances nécessaires au CLI/Router Server hoisté.
- `apps/mobile/package.json` -- propriétaire de la plage runtime React Native Web SDK 56, à préserver.
- `package-lock.json` -- topologie npm unique à régénérer et contrôler.
- `_bmad-output/implementation-artifacts/investigations/inline-style-prefixer-createprefixer-investigation.md` -- preuve causale et état final.

## Tasks & Acceptance

**Execution:**
- [x] `package.json` -- ajouter React Native Web `0.21.2` aux devDependencies racine sans déclarer sa dépendance transitive.
- [x] `package-lock.json` -- régénérer depuis la racine et confirmer le hoisting unique de React Native Web/Prefixer.
- [x] Installation et contrôles -- exécuter une reconstruction propre, les contrôles npm/autolinking/typecheck/lint et une requête web réelle.
- [x] Rapport d'investigation -- enregistrer la cause confirmée, la correction et les résultats reproductibles.

**Acceptance Criteria:**
- Given l'installation issue du lockfile final, when Router Server résout les imports web, then React Native Web et `inline-style-prefixer/lib/createPrefixer` pointent vers des fichiers racine existants.
- Given une requête sur l'application web, when Expo exécute le rendu serveur, then la réponse réussit sans `Cannot find module` ni Server Error.
- Given le nouveau hoisting, when les graphes npm et d'autolinking sont contrôlés, then aucune version invalide ni aucun doublon natif n'est introduit.
- Given le correctif appliqué, when les contrôles existants sont exécutés, then typecheck et lint mobile restent passants.

## Spec Change Log

## Design Notes

Le paquet propriétaire de l'import est `react-native-web@0.21.2`. Le déclarer à la racine permet à npm de déplacer avec lui ses dépendances transitives cohérentes ; déclarer seulement Inline Style Prefixer masquerait la première erreur sans rendre le reste du sous-graphe web visible au serveur.

## Verification

**Commands:**
- `npm ci` -- expected: installation propre depuis l'unique lockfile.
- `npm ls react-native-web inline-style-prefixer --all` -- expected: une seule copie de chaque paquet, code 0.
- `node -e "const {createRequire}=require('node:module'),p=require('node:path'); const r=createRequire(p.resolve('node_modules/expo/node_modules/@expo/cli/node_modules/@expo/router-server/package.json')); console.log(r.resolve('react-native-web')); console.log(r.resolve('inline-style-prefixer/lib/createPrefixer'))"` -- expected: deux chemins racine existants.
- `npx expo-modules-autolinking verify --project-root apps/mobile --platform all --json` -- expected: `"duplicates":[]`.
- `npm run typecheck` -- expected: succès.
- `npm run mobile:lint` -- expected: succès.
- `npm run mobile:web` puis `curl --fail http://localhost:8081/` -- expected: HTTP réussi, aucun Server Error, puis arrêt propre.

**Résultats :**
- `npm ci` réussit depuis le lockfile racine et installe 868 paquets ; le patch existant du slider est appliqué.
- `npm ls` retourne une seule copie de React Native Web `0.21.2` et d'Inline Style Prefixer `7.0.1`, hoistées à la racine.
- Router Server résout React Native Web et `inline-style-prefixer/lib/createPrefixer` vers des fichiers racine existants.
- Expo Modules Autolinking retourne `duplicates: []` ; typecheck complet et lint mobile réussissent.
- Expo web compile le bundle serveur et le bundle navigateur ; la requête sur `/` retourne HTTP 200 avec 41 737 octets, sans `Cannot find module` ni `Server Error`, puis Metro est arrêté proprement.

## Suggested Review Order

**Topologie de résolution**

- Miroite React Native Web à l'entrée racine visible par Router Server.
  [`package.json:55`](../../package.json#L55)

- Enregistre le sous-graphe React Native Web hoisté dans le lockfile unique.
  [`package-lock.json:10855`](../../package-lock.json#L10855)

- Place Inline Style Prefixer sur le même chemin de résolution racine.
  [`package-lock.json:8043`](../../package-lock.json#L8043)

**Validation de bout en bout**

- Documente les résolutions exactes observées depuis Router Server après reconstruction.
  [`inline-style-prefixer-createprefixer-investigation.md:65`](investigations/inline-style-prefixer-createprefixer-investigation.md#L65)

- Confirme le rendu SSR réel par compilation et réponse HTTP 200.
  [`inline-style-prefixer-createprefixer-investigation.md:72`](investigations/inline-style-prefixer-createprefixer-investigation.md#L72)

**Suivi périphérique**

- Isole les alertes npm préexistantes sans élargir le correctif fonctionnel.
  [`deferred-work.md:3`](deferred-work.md#L3)
