# Investigation : résolution impossible de `expo-router/_ctx-shared`

## Hand-off Brief

1. **Ce qui s'est passé.** Le lockfile workspace plaçait Expo/Router Server à la racine et Expo Router sous `apps/mobile`, rendant `_ctx-shared` invisible au démarrage.
2. **État du dossier.** Cause confirmée, correctif appliqué et vérifié sur une installation propre ; le graphe npm et l'autolinking ne contiennent plus de doublons critiques.
3. **Prochaine étape.** Aucune action diagnostique restante ; conserver le lockfile racine comme unique source de vérité lors des futures mises à jour Expo.

## Case Info

| Champ | Valeur |
| --- | --- |
| Ticket | N/A |
| Date d'ouverture | 2026-07-13 |
| Statut | Concluded |
| Système | WSL ; projet sous `/mnt/c` ; Node.js v24.12.0 d'après la trace |
| Sources de preuve | Trace d'exception fournie par l'utilisateur ; manifeste, lockfile et installation locale à examiner |

## Problem Statement

Au démarrage du projet, Expo lève `Error: Cannot find module 'expo-router/_ctx-shared'`. La pile passe par `@expo/router-server/build/typed-routes/index.js`, puis par la génération de routes typées du CLI Expo, et le processus s'arrête.

## Evidence Inventory

| Source | Statut | Notes |
| --- | --- | --- |
| Trace d'exception fournie | Available | Confirme le module manquant, la chaîne d'appel et Node.js v24.12.0 |
| Manifests npm | Available | `package.json` existe à la racine, ainsi que `apps/mobile/package.json` et `packages/shared/package.json` |
| Lockfiles npm | Available | `package-lock.json` à la racine (451 072 octets) et `apps/mobile/package-lock.json` (435 526 octets) |
| `node_modules` | Available | Expo est résolu à la racine tandis qu'Expo Router est résolu uniquement sous `apps/mobile` |
| `project-context.md` | Missing | Aucun fichier correspondant trouvé lors de l'activation du workflow |
| Historique Git | Available | Historique ciblé disponible ; derniers changements des manifests mobile dans `35da78d` puis `6d518a4` |
| Archives et journaux diagnostiques | Missing | Aucun `.log`, `.txt`, `.zip` ou `.tgz` hors dépendances n'a été trouvé |
| Tests et analyse statique | Partial | Tests TypeScript, configurations TypeScript et ESLint disponibles ; aucun test de démarrage Expo identifié |
| Issue tracker | Missing | Aucun ticket fourni ou associé au dossier |
| Configurations applicatives | Available | `apps/mobile/app.json` et les manifests de workspace sont disponibles |

## Investigation Backlog

| # | Piste à explorer | Priorité | Statut | Notes |
| - | --- | --- | --- | --- |
| 1 | Relever les versions déclarées et installées d'Expo et Expo Router | High | Done | Expo 56.0.12, Router 56.2.11, CLI 56.1.16 et Router Server 56.0.14 |
| 2 | Contrôler les résolutions des deux lockfiles et de `@expo/router-server` | High | Done | Le lockfile racine encode la topologie scindée ; le lockfile mobile en encode une autre |
| 3 | Vérifier les exports réellement publiés par l'instance installée de `expo-router` | High | Done | `_ctx-shared` est résolvable depuis `apps/mobile`, pas depuis la racine |
| 4 | Examiner les changements Git récents sur les dépendances | Medium | Done | Le commit `35da78d` a déplacé Expo vers la racine sans déplacer Expo Router |
| 5 | Évaluer l'influence de Node.js v24 | Low | Done | Réfuté comme cause immédiate ; la recherche CommonJS échoue par construction |
| 6 | Tracer l'appel source et vérifier une reproduction déterministe | High | Done | Commande exacte reproduite, sortie 7, pile identique |

## Timeline of Events

| Heure | Événement | Source | Confiance |
| --- | --- | --- | --- |
| 2026-07-13, heure inconnue | Le serveur Expo tente la génération des routes TypeScript et échoue à résoudre `expo-router/_ctx-shared` | Trace fournie | Confirmed |
| 2026-06-21 14:50:26 +0200 | Le commit initial `3e1f228` crée deux lockfiles ; le lockfile racine place encore Expo et Expo Router sous `apps/mobile` | Git et lockfiles | Confirmed |
| 2026-07-13 17:26:53 +0200 | Le commit `35da78d` régénère massivement le lockfile racine, déplace Expo à la racine et laisse Expo Router sous `apps/mobile` | Git et `package-lock.json` | Confirmed |

## Confirmed Findings

### Finding 1: échec de résolution pendant la génération des routes typées

**Preuve :** trace d'exception fournie par l'utilisateur, première frame applicative dans `@expo/router-server/build/typed-routes/index.js:8:23`.

**Détail :** l'échec survient avant que Metro ne puisse démarrer normalement, dans le chemin de génération de types du CLI Expo.

## Deduced Conclusions

### Deduction 1: l'installation contient des paquets Expo Router qui ne partagent pas le même contrat d'exports

**Fondé sur :** Finding 1.

**Raisonnement :** `@expo/router-server` demande explicitement un sous-chemin de `expo-router`; la résolution échoue alors que `expo-router` est suffisamment présent pour faire partie du projet. Il faut vérifier si le paquet installé est trop ancien, incomplet ou résolu depuis un graphe incohérent.

**Conclusion :** le périmètre prioritaire est le graphe de dépendances Expo Router, avant le code applicatif.

## Hypothesized Paths

### Hypothesis 1: décalage de versions entre `@expo/router-server` et `expo-router`

**Statut :** Refuted

**Théorie :** le CLI Expo a installé une version de `@expo/router-server` qui attend `_ctx-shared`, tandis que la version résolue de `expo-router` ne l'exporte pas.

**Indicateurs :** le module demandé est un sous-chemin interne de `expo-router` et l'appel vient d'un paquet serveur imbriqué sous le CLI Expo.

**Confirmerait :** versions installées incompatibles, ou absence de l'export dans `expo-router/package.json` alors qu'il est requis par la version de Router Server.

**Réfuterait :** versions officiellement compatibles et export présent sur disque, auquel cas la résolution Node ou l'intégrité de l'installation devient prioritaire.

**Résolution :** Les plages déclarées sont satisfaites ; Router Server accepte Expo Router `*`, les versions de développement sont adjacentes aux versions installées et `_ctx-shared.js` est bien publié (`apps/mobile/node_modules/expo-router/package.json:14`).

### Hypothesis 2: installation scindée par le lockfile workspace

**Statut :** Confirmed

**Théorie :** le lockfile racine place Expo/CLI/Router Server à la racine, mais Expo Router uniquement sous `apps/mobile`, hors du chemin de résolution ascendant du serveur.

**Indicateurs :** `package-lock.json:955` place Expo Router sous le workspace, tandis que `package-lock.json:7043` place Expo à la racine.

**Confirmerait :** la résolution depuis Router Server échoue, alors que le même sous-chemin se résout depuis `apps/mobile`.

**Réfuterait :** présence d'un `node_modules/expo-router` sur un répertoire ancêtre de Router Server.

**Résolution :** Confirmée par le lockfile, l'arbre physique et les diagnostics `require.resolve`. Aucune copie accessible d'Expo Router n'existe sur la chaîne ascendante de Router Server.

## Missing Evidence

| Lacune | Impact | Moyen d'obtention |
| --- | --- | --- |
| Aucun élément bloquant | — | La reproduction et la trace source sont complètes |

## Source Code Trace

| Élément | Détail |
| --- | --- |
| Origine de l'erreur | `node_modules/expo/node_modules/@expo/cli/node_modules/@expo/router-server/build/typed-routes/index.js:8` |
| Déclencheur | `npm run mobile -- --lan` → `package.json:12` → `apps/mobile/package.json:45` → `expo start` → `apps/mobile/app.json:41` (`typedRoutes: true`) |
| Condition | Router Server est chargé depuis l'Expo racine et `require('expo-router/_ctx-shared')` ne trouve aucune copie d'Expo Router dans ses répertoires ancêtres |
| Fichiers liés | `package.json:12`, `apps/mobile/package.json:45`, `apps/mobile/app.json:41`, `routes.js:69`, `routes.js:77`, `startTypescriptTypeGeneration.js:67`, `package-lock.json:955`, `package-lock.json:7043` |

## Conclusion

**Confiance : High**

La cause racine est confirmée et reproduite : le lockfile racine séparait Expo/Router Server d'Expo Router. Le correctif conserve un seul lockfile, hoiste les paquets requis avec les versions SDK 56, déduplique les modules natifs et transmet correctement `--lan`; Metro atteint désormais son état d'attente sans exception.

## Recommended Next Steps

### Direction de correction

Conserver les dépendances runtime dans le manifeste mobile et les pins racine nécessaires à la visibilité des peers du CLI hoisté. Régénérer exclusivement depuis la racine et contrôler `npm ls` ainsi que `expo-modules-autolinking verify` après toute mise à jour Expo.

### Diagnostic

Aucun diagnostic supplémentaire requis.

## Reproduction Plan

Rejouer le script de démarrage après l'inventaire, d'abord dans l'état actuel, puis après une éventuelle correction ciblée du graphe. Le résultat attendu est le démarrage du CLI sans exception durant `startTypescriptTypeGenerationAsync`.

## Side Findings

- Aucun `project-context.md` n'a été trouvé dans le projet lors de l'activation du workflow.

## Follow-up: 2026-07-13

### New Evidence

- Le runtime courant est Node.js `v24.12.0` avec npm `11.16.0`.
- Le workspace contient deux lockfiles npm : `package-lock.json` et `apps/mobile/package-lock.json`.
- Depuis la racine, `require.resolve('expo/package.json')` pointe vers `node_modules/expo/package.json`, tandis que `expo-router/package.json` et `expo-router/_ctx-shared` renvoient `MODULE_NOT_FOUND`.
- Depuis `apps/mobile`, Expo continue d'être résolu depuis le `node_modules` racine, mais Expo Router et `_ctx-shared` sont résolus depuis `apps/mobile/node_modules`.
- Aucun journal ou archive diagnostique autonome n'est disponible ; les tests existants ne couvrent pas le démarrage du CLI Expo.

### Additional Findings

#### Finding 2: le graphe d'exécution est physiquement scindé entre la racine et l'application mobile

**Preuve :** diagnostics `require.resolve` exécutés depuis la racine et `apps/mobile` le 2026-07-13.

**Détail :** le paquet `expo` chargé par l'application mobile appartient au graphe racine, alors que `expo-router` appartient au graphe local de `apps/mobile`. Un module exécuté sous `node_modules/expo/...` remonte les répertoires parents pour résoudre ses dépendances et ne descend pas dans `apps/mobile/node_modules`.

### Updated Hypotheses

L'hypothèse de décalage de versions reste ouverte, mais le périmètre est resserré : l'absence de `_ctx-shared` n'est pas celle du paquet mobile — le fichier y existe et s'y résout. Le défaut immédiat est que le CLI Expo racine ne peut pas voir le paquet Expo Router installé sous `apps/mobile`.

### Backlog Changes

La vérification de l'export `_ctx-shared` est terminée. La prochaine étape consiste à déterminer, à partir des manifests et lockfiles, pourquoi Expo et Expo Router ont été installés dans deux arbres différents et quel changement Git l'a produit.

### Updated Conclusion

**Confiance : Medium**

La condition qui déclenche l'erreur est confirmée : le processus mélange Expo à la racine et Expo Router sous `apps/mobile`, ce qui rend `_ctx-shared` invisible depuis le CLI. La cause de cet arbre scindé — déclarations de workspace, lockfiles concurrents ou installation partielle — reste à établir avant de prescrire la correction.

## Follow-up: 2026-07-13 #2

### New Evidence

- `apps/mobile/package.json:12` déclare Expo `~56.0.12` et `apps/mobile/package.json:20` déclare Expo Router `~56.2.11`.
- `node_modules/expo/package.json:2` confirme Expo `56.0.12`, dont le CLI installé est `56.1.16`.
- `apps/mobile/node_modules/expo-router/package.json:2` confirme Expo Router `56.2.11` et `apps/mobile/node_modules/expo-router/package.json:14` inclut `_ctx-shared.js`.
- `node_modules/expo/node_modules/@expo/cli/node_modules/@expo/router-server/package.json:26` déclare Expo Router comme peer optionnel ; npm peut donc accepter son absence sur le chemin de résolution du serveur.
- `node_modules/expo/node_modules/@expo/cli/node_modules/@expo/router-server/build/typed-routes/index.js:8` effectue pourtant un `require` direct de `expo-router/_ctx-shared` pendant la génération des routes typées.
- `package-lock.json:955` place Expo Router dans `apps/mobile/node_modules`, alors que `package-lock.json:7043` place Expo à la racine.
- `apps/mobile/package-lock.json:5728` et `apps/mobile/package-lock.json:5954` décrivent au contraire Expo et Expo Router ensemble dans l'arbre mobile.
- Le commit `35da78d` a modifié 15 646 lignes du lockfile racine ; avant ce commit, celui-ci plaçait Expo et Expo Router sous `apps/mobile`, puis il a déplacé seulement Expo à la racine.

### Additional Findings

#### Finding 3: le lockfile racine encode déterministement l'échec

**Preuve :** `package-lock.json:955`, `package-lock.json:7043`, `package-lock.json:7222` et `package-lock.json:7303`.

**Détail :** Expo, son CLI et Router Server sont dans l'arbre racine. Expo Router est latéral sous `apps/mobile/node_modules`. La résolution CommonJS depuis Router Server remonte ses ancêtres et ne descend jamais dans ce répertoire latéral.

#### Finding 4: la divergence a été introduite par `35da78d`

**Preuve :** diff Git de `35da78d` et comparaison de son parent avec le lockfile courant.

**Détail :** avant ce commit, le lockfile racine encodait `apps/mobile/node_modules/expo` et `apps/mobile/node_modules/expo-router`. Après sa régénération, Expo est hoisté vers `node_modules/expo`, tandis qu'Expo Router demeure sous le workspace.

### Updated Hypotheses

- **Décalage de versions : Refuted.** Les versions satisfont les plages, le peer accepte `*` et le fichier demandé existe.
- **Installation aléatoirement corrompue : Refuted comme cause primaire.** L'arbre installé correspond au lockfile racine.
- **Node.js 24 : Refuted comme cause immédiate.** La même topologie échoue avec la recherche ascendante CommonJS indépendamment de cette version.
- **Topologie npm scindée : Confirmed.** Le lockfile et les résolutions observées concordent.

### Backlog Changes

Les versions, les deux lockfiles, l'historique causal et les hypothèses alternatives sont traités. Il reste à tracer formellement le chemin source et à reproduire l'échec avant de finaliser le rapport et la direction de correction.

### Updated Conclusion

**Confiance : High**

La cause racine est confirmée : le lockfile workspace racine place Expo/CLI/Router Server à la racine mais Expo Router uniquement sous `apps/mobile`. Le peer Expo Router optionnel permet à npm d'accepter cette topologie, puis le `require` direct de Router Server échoue parce que Node ne cherche pas dans le `node_modules` latéral du workspace. Le second lockfile mobile représente une source de vérité concurrente, mais une réinstallation fondée sur le lockfile racine inchangé reproduirait la panne.

## Follow-up: 2026-07-13 #3

### New Evidence

- L'utilisateur confirme la commande exacte : `npm run mobile -- --lan`, lancée depuis la racine du dépôt sous WSL.
- La commande a été rejouée sans modification via RTK ; elle démarre le projet `apps/mobile`, atteint Metro, puis se termine avec le code 7 et la même exception `MODULE_NOT_FOUND`.
- `package.json:12` développe la commande en `npm --prefix apps/mobile run start --lan`, puis `apps/mobile/package.json:45` exécute `expo start`.
- Le drapeau `--lan` n'est pas transmis au script Expo par ce second appel npm ; il est absorbé comme option npm. Ce défaut secondaire ne cause pas l'exception Router.
- `apps/mobile/app.json:41` active `typedRoutes`, ce qui appelle `startTypescriptTypeGeneration.js:67`, puis `routes.js:69` et `routes.js:77`, avant l'échec au premier import de Router Server.

### Additional Findings

#### Finding 5: reproduction déterministe avec la commande utilisateur

**Preuve :** exécution de `npm run mobile -- --lan` le 2026-07-13, code de sortie 7.

**Détail :** la pile reproduite correspond frame pour frame à celle fournie. Le CLI utilisé est `/node_modules/expo/bin/cli`, et l'origine est le Router Server imbriqué sous ce même Expo racine.

#### Finding 6: l'activation des routes typées rend le peer optionnel effectivement requis

**Preuve :** `apps/mobile/app.json:41`, `startTypescriptTypeGeneration.js:67`, `routes.js:69`, `routes.js:77` et `@expo/router-server/build/typed-routes/index.js:8`.

**Détail :** Expo Router est optionnel pour le paquet Router Server au niveau npm, mais la branche `typedRoutes: true` importe immédiatement ses modules internes. La topologie scindée devient donc fatale au démarrage.

### Updated Hypotheses

La reproduction confirme définitivement l'hypothèse 2. Aucun élargissement vers Metro, le code applicatif ou le réseau LAN n'est nécessaire.

### Backlog Changes

Toutes les pistes de diagnostic sont terminées. Le rapport peut être finalisé avec une correction visant une seule source de vérité npm et la colocation résoluble d'Expo et Expo Router.

### Updated Conclusion

**Confiance : High**

La cause racine, le commit d'introduction, la chaîne d'appel et la reproduction exacte sont confirmés. Le correctif doit modifier la topologie npm ; désactiver temporairement `typedRoutes` contournerait seulement le point de déclenchement et ne réparerait pas le graphe de dépendances.
