---
name: NextPoint
description: Application mobile-first de planning et reservation pour un coach de padel designe et ses eleves.
status: draft
created: 2026-06-07
updated: 2026-06-07
document_language: french
sources:
  - ../../prd.md
  - ../../product-brief.md
  - ../../ux-screen-inventory.md
  - ../../design-tokens.md
colors:
  primary: '#C65A2E'
  primary-hover: '#A94B24'
  primary-dark: '#E17A42'
  primary-hover-dark: '#F08C56'
  secondary: '#2F5D50'
  secondary-dark: '#5F9B89'
  background: '#F5F0E8'
  background-dark: '#141210'
  surface: '#FCFAF7'
  surface-dark: '#1E1B18'
  surface-elevated-dark: '#27231F'
  border: '#DDD2C3'
  border-dark: '#3A342E'
  text: '#232323'
  text-dark: '#F4F0EA'
  text-muted: '#6E655E'
  text-muted-dark: '#B6ACA2'
  success: '#4C8B5F'
  success-dark: '#69B27C'
  warning: '#D89034'
  warning-dark: '#E6A64A'
  error: '#C7483D'
  error-dark: '#E06A5E'
  ocre-50: '#FFF4ED'
  ocre-100: '#FFE4D1'
  ocre-200: '#FFC6A0'
  ocre-300: '#F4A16B'
  ocre-400: '#E17A42'
  ocre-500: '#C65A2E'
  ocre-600: '#A94B24'
  ocre-700: '#873C1F'
  ocre-800: '#662D18'
  ocre-900: '#451F12'
  rg-green-50: '#EEF6F3'
  rg-green-100: '#D6E8E2'
  rg-green-200: '#A9CEC1'
  rg-green-300: '#7EB4A1'
  rg-green-400: '#5F9B89'
  rg-green-500: '#2F5D50'
  rg-green-600: '#284D43'
  rg-green-700: '#203E36'
  rg-green-800: '#182E29'
  rg-green-900: '#101F1C'
typography:
  display:
    fontFamily: 'var(--font-base)'
    fontSize: 34px
    fontWeight: '600'
    lineHeight: '1.08'
    letterSpacing: '-0.02em'
  title:
    fontFamily: 'var(--font-base)'
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.18'
    letterSpacing: '-0.01em'
  body:
    fontFamily: 'var(--font-base)'
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label:
    fontFamily: 'var(--font-base)'
    fontSize: 13px
    fontWeight: '600'
    lineHeight: '1.3'
    letterSpacing: '0.02em'
  caption:
    fontFamily: 'var(--font-base)'
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.35'
rounded:
  sm: 6px
  md: 10px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 20px
  '6': 24px
  '8': 32px
  '10': 40px
  '12': 48px
  mobile-margin: 16px
  desktop-margin: 48px
  calendar-row-min: 56px
components:
  button-primary:
    background: '{colors.primary}'
    background-hover: '{colors.primary-hover}'
    foreground: '{colors.surface}'
    radius: '{rounded.lg}'
    min-height: 48px
  button-secondary:
    background: '{colors.rg-green-50}'
    foreground: '{colors.secondary}'
    border: '{colors.rg-green-200}'
    radius: '{rounded.lg}'
    min-height: 44px
  surface-card:
    background: '{colors.surface}'
    border: '{colors.border}'
    radius: '{rounded.xl}'
  calendar-slot-available:
    background: '{colors.rg-green-50}'
    foreground: '{colors.rg-green-700}'
    border: '{colors.rg-green-200}'
  calendar-slot-pending:
    background: '{colors.ocre-100}'
    foreground: '{colors.ocre-800}'
    border: '{colors.ocre-400}'
  calendar-slot-booked:
    background: '{colors.secondary}'
    foreground: '{colors.surface}'
    border: '{colors.secondary}'
  status-chip:
    radius: '{rounded.full}'
    font: '{typography.caption}'
  price-card:
    background: '{colors.surface}'
    border: '{colors.border}'
    radius: '{rounded.lg}'
  stat-card:
    background: '{colors.surface}'
    border: '{colors.border}'
    radius: '{rounded.lg}'
  notification-badge:
    background: '{colors.primary}'
    foreground: '{colors.surface}'
    radius: '{rounded.full}'
---

## Brand & Style

NextPoint doit lire comme un outil de terrain premium: assez chaleureux pour rester proche du coach et de ses eleves, assez structure pour remplacer les messages et agendas disperses. L'identite validee est inspiree Roland-Garros: terre battue, ocre, vert profond, fonds chauds, tres peu de noir pur ou blanc pur.

La hierarchie visuelle sert d'abord le planning. Un coach doit reperer une nouvelle demande avant de lire le reste de l'ecran; un eleve doit comprendre quel creneau est demandable sans decoder une legende complexe.

La typographie utilise la police de base de l'application via `var(--font-base)`. Le code doit exposer cette variable comme point de changement unique afin de remplacer facilement la police plus tard sans modifier les composants ni la hierarchie typographique.

## Colors

- **Ocre terre battue** (`{colors.primary}` / `{colors.primary-dark}`) porte les actions principales: demander un creneau, valider une demande, creer une disponibilite. Il ne sert pas de decoration de fond generique.
- **Vert profond** (`{colors.secondary}` / `{colors.secondary-dark}`) porte la structure coach, les accents secondaires et les etats confirmes lorsque le planning doit rester lisible.
- **Fonds chauds** (`{colors.background}`, `{colors.surface}`, `{colors.background-dark}`, `{colors.surface-dark}`) remplacent les blancs et noirs purs pour garder une sensation club/padel premium.
- **Warning** (`{colors.warning}`) et ocre clair signalent les demandes en attente. Les demandes `pending` doivent rester visibles dans le planning coach sans saturer tout l'ecran.
- **Success** (`{colors.success}`) confirme les actions terminees; **Error** (`{colors.error}`) signale refus, annulation critique ou impossibilite de reservation.

Contraste: les combinaisons chargees de decision doivent viser WCAG AA au minimum: boutons primaires, statuts de creneau, champs erreur, focus visible, badges de notification et libelles de planning.

## Typography

`{typography.display}` est reserve aux moments d'accueil, titres de surfaces publiques et grands vides utiles. `{typography.title}` nomme les surfaces fonctionnelles: Planning, Disponibilites, Eleves, Statistiques. `{typography.body}` est le role principal pour listes, formulaires, details de demande et fiche eleve.

Les libelles techniques restent simples: statut, duree, lieu, tarif, nombre de demandes restantes. Eviter les titres trop longs dans les slots calendrier; si l'espace manque, la date/heure et le statut gagnent sur le nom complet.

## Layout & Spacing

Mobile-first. La marge mobile minimale est `{spacing.mobile-margin}`. Les ecrans critiques sont en colonne unique, avec action principale dans la zone basse ou proche du contexte decisionnel.

Les vues planning semaine/jour utilisent une grille stable. La hauteur minimale d'une ligne de planning est `{spacing.calendar-row-min}` pour garder les creneaux touchables. Sur webapp, la largeur supplementaire sert a afficher des panneaux lateraux de detail, pas a multiplier les informations concurrentes.

Les tarifs eleve restent au-dessus de l'agenda comme une bande lisible ou un carousel horizontal sobre; l'agenda ne doit pas commencer avant que le prix applicable soit compréhensible.

## Elevation & Depth

La profondeur vient d'abord du contraste de surface et des bordures chaudes. Les ombres sont faibles, diffuses, teintees chaudement, et reservees aux panneaux superposes: detail de demande, modal de creation, menu de changement de vue, toast.

En dark theme, utiliser `{colors.surface-elevated-dark}` pour cartes, modales, menus et panneaux flottants. Ne pas compenser le dark theme par des contours froids ou bleutes.

## Shapes

La forme de base est arrondie mais sportive: `{rounded.md}` pour champs et chips, `{rounded.lg}` pour boutons et petites cartes, `{rounded.xl}` pour panneaux importants. Les pills (`{rounded.full}`) sont reservees aux statuts, badges et filtres actifs.

Eviter les coins trop mous sur les slots de planning: le calendrier doit rester un outil precis.

## Components

- **Button primary** — `{components.button-primary.background}` avec texte clair. Utilise pour `S'inscrire`, `Demander ce creneau`, `Valider`, `Creer une disponibilite`, `Enregistrer`.
- **Button secondary** — Vert clair, pour changer de vue, ouvrir filtres, modifier, actions non finales.
- **Surface card** — Carte standard pour tarifs, fiche eleve, resume de demande, stats. Fond `{colors.surface}`, bordure `{colors.border}`, rayon `{rounded.xl}`.
- **Calendar slot available** — Vert tres clair; tap ouvre le detail de creneau. Jamais utiliser le meme traitement pour `pending`.
- **Calendar slot pending** — Ocre clair + bordure ocre plus visible. Doit afficher le nombre de demandes si utile (`1/2`, `2/2`) et le badge `nouveau` cote coach.
- **Calendar slot booked** — Vert profond ou surface sombre selon theme; non demandable cote eleve.
- **Status chip** — Pill compacte pour `en attente`, `confirme`, `refuse`, `expire`, `annule`, `nouveau`.
- **Price card** — Carte tarifaire claire, prix et duree en priorite. Aucun vocabulaire de paiement.
- **Stat card** — Carte compacte pour nombre de cours, nombre d'heures, `revenu estime`, eleves actifs.
- **Notification badge** — Badge ocre sur onglet ou element de liste. Unread doit etre perceptible sans reposer uniquement sur la couleur.

## Do's and Don'ts

| Do | Don't |
|---|---|
| Utiliser les tokens de `design-tokens.md` et les references `{colors.*}` | Coder des couleurs en dur dans les composants |
| Faire ressortir les demandes `pending` dans le planning coach | Les cacher dans une page secondaire uniquement |
| Garder les tarifs visibles avant la demande eleve | Introduire un vocabulaire de paiement ou checkout |
| Supporter light et dark theme avec les memes roles | Creer deux interfaces divergentes par theme |
| Mettre les actions finales pres du contexte | Demander au coach de naviguer loin pour valider/refuser |
| Garder les notes privees visuellement distinctes et confidentielles | Melanger note privee coach et informations visibles eleve |
