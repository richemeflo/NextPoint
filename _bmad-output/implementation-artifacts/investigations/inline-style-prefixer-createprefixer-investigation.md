# Investigation : résolution de `inline-style-prefixer/lib/createPrefixer`

## Hand-off Brief

1. **Ce qui s'est passé.** Le rendu serveur web Expo Router chargeait son bundle depuis le graphe racine, alors que `react-native-web@0.21.2` et `inline-style-prefixer@7.0.1` étaient installés uniquement sous `apps/mobile/node_modules`.
2. **Correction.** `react-native-web@0.21.2` est maintenant déclaré dans les `devDependencies` racine ; npm a hoisté React Native Web et son sous-graphe sans déclaration directe d'Inline Style Prefixer.
3. **État final.** Enquête conclue : installation propre, résolution depuis Router Server, autolinking, typecheck, lint et rendu SSR HTTP sont tous validés.

## Case Info

| Champ | Valeur |
| --- | --- |
| Ticket | N/A |
| Date d'ouverture | 2026-07-13 |
| Statut | Concluded |
| Système | WSL ; projet sous `/mnt/c` ; Expo SDK 56 ; commit correctif précédent `2c438fc` |
| Sources de preuve | Trace Server Error fournie ; manifests et lockfile ; installation reconstruite par `npm ci` ; résolutions Node ; sortie Expo/autolinking/typecheck/lint ; réponse HTTP réelle |

## Problem Statement

Après le correctif de résolution Expo Router, le serveur web affiche `Cannot find module 'inline-style-prefixer/lib/createPrefixer'`. La pile démarre dans le bundle Node de `@expo/router-server`, puis remonte par `@expo/require-utils`, `@expo/config` et le CLI Expo racine.

## Evidence Inventory

| Source | Statut | Notes |
| --- | --- | --- |
| Trace Server Error fournie | Available | Confirme le sous-chemin manquant et le contexte de rendu serveur web |
| `package.json` et manifests mobile | Available | Mobile conserve `~0.21.0` ; la racine déclare exactement `0.21.2` |
| `package-lock.json` | Available | React Native Web, Prefixer et leur sous-graphe sont hoistés à la racine |
| `node_modules` | Available | Installation reconstruite par `npm ci` en 7 minutes, sans correction manuelle |
| Historique Git | Available | Le commit `2c438fc` a modifié la topologie workspace immédiatement avant ce symptôme |

## Investigation Backlog

| # | Piste à explorer | Priorité | Statut | Notes |
| - | --- | --- | --- | --- |
| 1 | Relever les versions et emplacements de `react-native-web` et `inline-style-prefixer` | High | Done | `0.21.2` et `7.0.1`, initialement sous le mobile puis hoistés à la racine |
| 2 | Tester la résolution depuis la racine, le mobile et Router Server | High | Done | La frontière Router Server ne voyait pas le sous-graphe mobile ; elle voit désormais les fichiers racine |
| 3 | Comparer le lockfile avant/après `2c438fc` | High | Done | Le lockfile précédent conservait le sous-graphe web sous `apps/mobile/node_modules` |
| 4 | Reproduire le rendu web avec la commande utilisateur | Medium | Done | Premier bundle SSR suivi d'une réponse HTTP 200 |

## Timeline of Events

| Heure | Événement | Source | Confiance |
| --- | --- | --- | --- |
| 2026-07-13, après `2c438fc` | Le rendu web Router Server échoue sur `inline-style-prefixer/lib/createPrefixer` | Trace fournie | Confirmed |
| 2026-07-13 | La résolution isolée confirme que RN Web et Prefixer sont seulement visibles depuis le workspace mobile | Installation avant correction | Confirmed |
| 2026-07-13 | Le miroir racine de RN Web déplace le sous-graphe web complet dans `node_modules` racine | Diff du lockfile | Confirmed |
| 2026-07-13 | Le rendu serveur compile et `/` répond HTTP 200 avec 41 737 octets | Logs Expo et `curl` | Confirmed |

## Confirmed Findings

### Finding 1: le bundle serveur ne résout pas un sous-chemin d'Inline Style Prefixer

**Preuve :** trace fournie, première frame dans `@expo/router-server/node/render.js.bundle?...`.

**Détail :** l'erreur se produit côté Node pendant le rendu web, et non pendant la génération des routes typées désormais réparée.

### Finding 2: la dépendance propriétaire est React Native Web

**Preuve :** `react-native-web@0.21.2/dist/cjs/modules/prefixStyles/index.js` importe `inline-style-prefixer/lib/createPrefixer`, et son manifeste déclare `inline-style-prefixer@^7.0.1`.

**Détail :** avant correction, `npm ls` situait React Native Web et Prefixer uniquement sous le workspace mobile. Router Server, exécuté depuis `node_modules/expo/...`, ne descend pas dans le `node_modules` d'un workspace frère.

### Finding 3: le miroir racine rétablit toute la chaîne de résolution

**Preuve :** après `npm ci`, `npm ls react-native-web inline-style-prefixer --all` retourne une seule copie dédupliquée. Un `createRequire` ancré sur le manifeste réel de Router Server résout :

- `/mnt/c/Users/Richeme/Playground/NextPoint/node_modules/react-native-web/dist/cjs/index.js`
- `/mnt/c/Users/Richeme/Playground/NextPoint/node_modules/inline-style-prefixer/lib/createPrefixer.js`

### Finding 4: le scénario utilisateur est réparé de bout en bout

**Preuve :** `CI=1 npm run mobile:web` atteint `Waiting on http://localhost:8081`, compile le bundle Node Router Server (1 754 modules) puis le bundle web (1 499 modules). `curl --fail http://localhost:8081/` retourne `HTTP 200`, 41 737 octets.

**Détail :** aucun `Cannot find module` ni `Server Error` n'apparaît dans les logs ; Metro est ensuite arrêté proprement avec Ctrl+C.

## Deduced Conclusions

### Deduction 1: le démarrage a franchi l'ancien point de panne

**Fondé sur :** Finding 1 et la nouvelle pile.

**Raisonnement :** Router Server a pu générer/exécuter son bundle de rendu avant de rencontrer ce nouvel import.

**Conclusion :** le périmètre prioritaire est désormais la branche React Native Web du graphe npm.

## Hypothesized Paths

### Hypothesis 1: React Native Web et Inline Style Prefixer ne sont plus colocalisés ou compatibles

**Statut :** Confirmed

**Théorie :** le hoisting du correctif précédent a placé React Native Web sur une branche qui ne voit pas la version attendue d'Inline Style Prefixer, ou npm a sélectionné une version dont le sous-chemin n'existe plus.

**Indicateurs :** l'import vise un chemin interne `lib/createPrefixer` et survient dans un bundle serveur chargé depuis le CLI racine.

**Confirmerait :** résolution impossible depuis Router Server, version incompatible ou fichier absent dans le paquet installé.

**Réfuterait :** sous-chemin présent et résolvable depuis l'emplacement exact du bundle, auquel cas le bundling Metro devient prioritaire.

**Résolution :** La version était compatible et le fichier existait. La panne provenait exclusivement de la séparation topologique entre le graphe racine de Router Server et le sous-graphe du workspace mobile.

## Missing Evidence

| Lacune | Impact | Moyen d'obtention |
| --- | --- | --- |
| Aucune lacune bloquante | La cause et le correctif sont validés de bout en bout | N/A |

## Source Code Trace

| Élément | Détail |
| --- | --- |
| Origine de l'erreur | Bundle `@expo/router-server/node/render.js.bundle` |
| Déclencheur | Rendu serveur web Expo Router |
| Condition | `inline-style-prefixer/lib/createPrefixer` n'est pas résolvable |
| Fichiers liés | Manifests de React Native Web/Inline Style Prefixer, lockfile, bundle Router Server |

## Conclusion

**Confiance : High**

La panne était causée par la topologie npm : Router Server s'exécutait depuis la branche racine, tandis que React Native Web et sa dépendance Inline Style Prefixer vivaient uniquement sous le workspace mobile. La déclaration racine exacte de `react-native-web@0.21.2` a hoisté le sous-graphe complet et réparé le rendu serveur sans dépendance transitive déclarée manuellement.

## Recommended Next Steps

### Direction de correction

Correction appliquée : miroir racine de `react-native-web@0.21.2`, plage mobile `~0.21.0` conservée, lockfile racine régénéré. Ne pas ajouter directement `inline-style-prefixer`.

### Diagnostic

Surveiller les futures mises à jour Expo/React Native Web afin de garder le miroir racine aligné sur la version résolue par le workspace mobile.

## Reproduction Plan

Exécuté avec succès : installation `npm ci`, résolution isolée depuis Router Server, `npm ls`, autolinking sans doublon, typecheck complet, lint mobile, démarrage Expo web et requête HTTP réelle.

## Side Findings

- Le symptôme précédent `_ctx-shared` n'apparaît plus dans cette pile.
- `npm ci` signale 11 vulnérabilités modérées et deux scripts d'installation à approuver ; ces avertissements sont hors du périmètre de ce correctif et n'empêchent ni l'installation ni les validations.
- Expo signale qu'une mise à jour `56.0.12 → ~56.0.15` existe ; aucune mise à niveau n'a été effectuée conformément au périmètre approuvé.
