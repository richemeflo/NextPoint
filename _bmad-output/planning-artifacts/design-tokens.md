# Design Tokens — NextPoint

Date: 2026-06-06  
Workflow BMAD: `bmad-ux`  
Statut: décision UX validée

## Direction Visuelle

NextPoint conserve une identité inspirée de Roland-Garros: terre battue, élégance, chaleur et premium. Le light theme repose sur un fond sable/crème. Le dark theme repose sur un brun-noir chaud, sans gris bleuté.

Principes:
- Accent principal: ocre terre battue.
- Accent secondaire: vert profond Roland-Garros.
- Bordures discrètes et chaudes.
- Très peu de noir pur `#000` ou blanc pur `#FFF`.
- Rendu global: SaaS moderne, premium, chaleureux.

## Light Theme

| Token | Couleur |
| --- | --- |
| Primary | `#C65A2E` |
| Primary Hover | `#A94B24` |
| Secondary | `#2F5D50` |
| Background | `#F5F0E8` |
| Surface | `#FCFAF7` |
| Border | `#DDD2C3` |
| Text | `#232323` |
| Text Muted | `#6E655E` |
| Success | `#4C8B5F` |
| Warning | `#D89034` |
| Error | `#C7483D` |

## Dark Theme

| Token | Couleur |
| --- | --- |
| Primary | `#E17A42` |
| Primary Hover | `#F08C56` |
| Secondary | `#5F9B89` |
| Background | `#141210` |
| Surface | `#1E1B18` |
| Surface Elevated | `#27231F` |
| Border | `#3A342E` |
| Text | `#F4F0EA` |
| Text Muted | `#B6ACA2` |
| Success | `#69B27C` |
| Warning | `#E6A64A` |
| Error | `#E06A5E` |

## Palette Ocre

| Step | Couleur |
| --- | --- |
| 50 | `#FFF4ED` |
| 100 | `#FFE4D1` |
| 200 | `#FFC6A0` |
| 300 | `#F4A16B` |
| 400 | `#E17A42` |
| 500 | `#C65A2E` |
| 600 | `#A94B24` |
| 700 | `#873C1F` |
| 800 | `#662D18` |
| 900 | `#451F12` |

## Palette Vert Roland-Garros

| Step | Couleur |
| --- | --- |
| 50 | `#EEF6F3` |
| 100 | `#D6E8E2` |
| 200 | `#A9CEC1` |
| 300 | `#7EB4A1` |
| 400 | `#5F9B89` |
| 500 | `#2F5D50` |
| 600 | `#284D43` |
| 700 | `#203E36` |
| 800 | `#182E29` |
| 900 | `#101F1C` |

## Usage UX

- Utiliser `Primary` pour les actions principales: demander un créneau, valider, créer une disponibilité.
- Utiliser `Secondary` pour les accents secondaires, filtres actifs, éléments liés au coach ou à la structure.
- Utiliser `Surface Elevated` en dark theme pour cartes, modales, menus et panneaux au-dessus de la surface.
- Utiliser `Success`, `Warning`, `Error` pour états de réservation, validation, refus et erreurs.
- Les états pending doivent rester visibles avec une couleur/surbrillance accessible, sans surcharger le planning.

## Contraintes Front

- Les couleurs doivent être exposées sous forme de tokens, pas codées en dur dans les composants.
- Le front doit pouvoir changer de thème sans réécrire les composants.
- Les tokens doivent coexister avec l’internationalisation français/anglais/espagnol.
