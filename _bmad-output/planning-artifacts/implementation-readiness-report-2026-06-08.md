---
stepsCompleted:
  - step-01-document-discovery
  - step-02-prd-analysis
  - step-03-epic-coverage-validation
  - step-04-ux-alignment
  - step-05-epic-quality-review
  - step-06-final-assessment
includedFiles:
  prd:
    primary:
      - _bmad-output/planning-artifacts/prd.md
    auxiliary:
      - _bmad-output/planning-artifacts/prd-validation-report.md
  architecture:
    primary:
      - _bmad-output/planning-artifacts/architecture.md
  epics:
    primary:
      - _bmad-output/planning-artifacts/epics.md
  ux:
    primary:
      - _bmad-output/planning-artifacts/ux-screen-inventory.md
    auxiliary:
      - _bmad-output/planning-artifacts/ux-designs/ux-NextPoint-2026-06-07/DESIGN.md
      - _bmad-output/planning-artifacts/ux-designs/ux-NextPoint-2026-06-07/EXPERIENCE.md
      - _bmad-output/planning-artifacts/ux-designs/ux-NextPoint-2026-06-07/.decision-log.md
---

# Rapport d'evaluation de preparation a l'implementation

**Date :** 2026-06-08
**Projet :** NextPoint

## Etape 1 - Decouverte des documents

### PRD

**Documents entiers :**
- `_bmad-output/planning-artifacts/prd.md` (54 799 octets, modifie 2026-06-08 01:14)
- `_bmad-output/planning-artifacts/prd-validation-report.md` (8 381 octets, modifie 2026-06-07 12:30) - artefact auxiliaire

**Documents shardes :**
- Aucun `index.md` PRD trouve

### Architecture

**Documents entiers :**
- `_bmad-output/planning-artifacts/architecture.md` (40 083 octets, modifie 2026-06-08 01:16)

**Documents shardes :**
- Aucun `index.md` architecture trouve

### Epics & Stories

**Documents entiers :**
- `_bmad-output/planning-artifacts/epics.md` (91 979 octets, modifie 2026-06-08 01:13)

**Documents shardes :**
- Aucun `index.md` epic trouve

### UX

**Documents entiers :**
- `_bmad-output/planning-artifacts/ux-screen-inventory.md` (12 798 octets, modifie 2026-06-08 01:15)

**Artefacts UX additionnels :**
- Dossier `_bmad-output/planning-artifacts/ux-designs/ux-NextPoint-2026-06-07/`
  - `.decision-log.md` (1 571 octets, modifie 2026-06-07 16:14)
  - `DESIGN.md` (9 681 octets, modifie 2026-06-07 16:13)
  - `EXPERIENCE.md` (20 345 octets, modifie 2026-06-07 16:13)

### Issues

- Aucun doublon critique whole + sharded detecte.
- Aucun document requis manquant detecte.

## PRD Analysis

### Functional Requirements

- FR-001 — Le système doit permettre à un utilisateur de créer un compte.
- FR-002 — Le système doit permettre à un utilisateur de se connecter et se déconnecter.
- FR-003 — Le système doit distinguer les rôles `coach` et `élève`.
- FR-004 — Un compte coach doit accéder aux fonctions coach.
- FR-005 — Un compte élève doit accéder aux fonctions élève.
- FR-006 — Un utilisateur ne doit pas accéder aux données privées d’un autre utilisateur sans relation autorisée.
- FR-007 — Le MVP doit supporter un seul coach désigné comme contexte principal de réservation.
- FR-010 — Le coach doit pouvoir créer et modifier son profil.
- FR-011 — Le profil coach doit exposer les informations nécessaires à la réservation.
- FR-012 — En P0, le coach n’a pas besoin de partager un lien/code pour associer un élève.
- FR-013 — Le coach doit pouvoir voir les élèves associés à son profil.
- FR-014 — Le coach doit pouvoir créer une fiche élève sans que l’élève ait déjà créé son compte.
- FR-020 — L’élève doit pouvoir créer et modifier son profil.
- FR-021 — En P0, l’élève doit être automatiquement associé au coach unique de l’application.
- FR-022 — L’élève doit pouvoir consulter ses réservations.
- FR-023 — L’élève ne doit pas voir les notes privées du coach.
- FR-024 — Le profil élève doit contenir au minimum nom, téléphone, email, niveau padel de 1 à 10 et âge.
- FR-025 — L’élève doit voir le statut de chaque demande: en attente, confirmé, refusé ou expiré.
- FR-030 — Le système doit créer une relation coach/élève lorsqu’un élève rejoint un coach.
- FR-031 — Le coach doit voir uniquement ses élèves associés.
- FR-032 — L’élève doit être associé à un seul coach en P0.
- FR-033 — La relation doit permettre au coach de consulter les réservations et notes liées à l’élève.
- FR-034 — Le mécanisme de lien/code d’invitation coach est réservé à une évolution future.
- FR-040 — Le coach doit pouvoir créer une plage de disponibilité avec date, heure de début, heure de fin, durée de créneau et lieu/club.
- FR-041 — Le système doit générer des créneaux à partir d’une plage de disponibilité.
- FR-042 — Le coach doit pouvoir choisir une durée de créneau parmi 1h et 1h30.
- FR-043 — Le coach doit pouvoir choisir une récurrence de disponibilité parmi ponctuelle, quotidienne ou hebdomadaire.
- FR-044 — Le coach doit pouvoir modifier une plage ou un créneau sans demande active ni réservation confirmée.
- FR-045 — Le coach doit pouvoir supprimer une plage ou un créneau sans demande active ni réservation confirmée.
- FR-046 — L’élève doit voir uniquement les créneaux disponibles et demandables, ainsi que ses propres cours sur l’agenda de la page principale.
- FR-047 — Le lieu/club doit être visible dans le détail du créneau.
- FR-048 — Le système doit fournir une liste simple de lieux/clubs, avec `Les Bruyères Centre Sportif` comme valeur initiale.
- FR-049 — Un créneau avec une réservation confirmée ne doit plus être proposé comme disponible.
- FR-050 — Le système doit refuser une demande si le créneau n’est plus disponible ou s’il a déjà 2 demandes en attente.
- FR-051 — Le coach doit pouvoir consulter ses créneaux à venir.
- FR-060 — L’élève doit pouvoir demander un créneau disponible.
- FR-061 — Le système doit créer une demande liée au coach, à l’élève et au créneau.
- FR-062 — Le système doit confirmer à l’élève que la demande a été envoyée.
- FR-063 — Le coach doit voir la demande dans son planning.
- FR-064 — Une nouvelle demande doit avoir un état visible `nouveau`.
- FR-065 — Le coach doit recevoir une notification push lors d’une nouvelle demande.
- FR-066 — Le coach doit pouvoir valider une demande depuis l’écran de détail de la demande.
- FR-067 — Le coach doit pouvoir refuser une demande depuis l’écran de détail de la demande, sans proposer d’autre créneau et sans confirmation supplémentaire.
- FR-067b — Le coach doit pouvoir ajouter un commentaire optionnel lors d’un refus.
- FR-068 — Le système doit empêcher plus de 2 demandes en attente ou plus d’une réservation confirmée sur le même créneau.
- FR-069 — Le détail d’une demande/réservation doit afficher au minimum l’élève, la date, l’heure, le lieu et le statut.
- FR-070 — L’élève doit voir le statut de sa demande: en attente, confirmée, refusée ou expirée.
- FR-071 — Une demande en attente doit expirer automatiquement après 7 jours.
- FR-072 — Un élève ne doit pas pouvoir avoir plus de 10 demandes en attente (`pending`) auprès du coach.
- FR-072b — Un même créneau ne doit pas pouvoir avoir plus de 2 demandes en attente (`pending`).
- FR-073 — Quand le coach valide une demande, le demandeur doit recevoir une notification push.
- FR-074 — Quand le coach refuse une demande, le demandeur doit recevoir une notification push.
- FR-074b — Si le coach saisit un commentaire de refus, ce commentaire doit être visible dans la notification et le détail de la demande côté élève.
- FR-075 — L’élève doit pouvoir demander un cours collectif.
- FR-076 — Lors d’une demande de cours collectif, l’élève doit pouvoir sélectionner des joueurs de l’application.
- FR-077 — Le coach doit pouvoir créer un cours collectif en sélectionnant des élèves de l’application.
- FR-078 — Une réservation collective doit conserver la liste des participants.
- FR-079 — Le coach doit pouvoir créer un cours individuel lié à un élève, une date, une heure, une durée, un lieu et un tarif.
- FR-079a — Le coach doit pouvoir créer un cours individuel récurrent hebdomadaire.
- FR-079a-2 — L’élève ne doit pas pouvoir créer de demande de cours récurrente.
- FR-079b — Le coach doit pouvoir annuler ou modifier une réservation confirmée en P0; l’élève doit pouvoir annuler une réservation confirmée mais ne doit pas voir d’action de modification.
- FR-079c — L’élève doit pouvoir annuler une réservation jusqu’à l’heure de début du cours.
- FR-079d — Lorsqu’une annulation ou modification est initiée par une partie, l’autre partie doit recevoir une notification push et une notification in-app.
- FR-080 — Le coach doit pouvoir créer plusieurs tarifs.
- FR-081 — Le coach doit pouvoir modifier un tarif.
- FR-082 — Le coach doit pouvoir désactiver ou supprimer un tarif.
- FR-083 — L’élève doit voir les tarifs publiés du coach avant de demander un créneau.
- FR-084 — Un tarif doit contenir au minimum un libellé, un prix, une durée, un type et, si nécessaire, des critères d’applicabilité définis par le coach.
- FR-085 — Les types de tarifs P0 doivent couvrir au minimum individuel et groupe.
- FR-086 — Les tarifs P0 doivent être attachés à des durées précises et peuvent cibler certains élèves ou contextes, par exemple tarif étudiant, tarif senior, week-end ou jour férié.
- FR-087 — Le MVP ne doit pas masquer les tarifs par élève.
- FR-088 — Le MVP affiche les prix, mais aucun message de paiement ni paiement intégré.
- FR-088b — Les heures pleines/heures creuses sont hors P0.
- FR-089 — Le coach doit pouvoir donner/rattacher un pack de cours individuels à un élève.
- FR-089b — Un pack de cours individuels doit permettre de suivre au minimum le nombre de cours inclus, utilisés et restants.
- FR-089c — L’élève ne doit pas pouvoir créer, acheter ou s’attribuer lui-même un pack de cours.
- FR-089d — Le coach doit pouvoir marquer une session de pack individuel comme consommée, ce qui décrémente le nombre de cours restants du pack associé.
- FR-089e — Les sessions restantes du pack doivent être visibles sur la fiche élève.
- FR-090 — Le coach doit pouvoir consulter la liste de ses élèves.
- FR-091 — Le coach doit pouvoir ouvrir une fiche élève.
- FR-092 — Le coach doit pouvoir créer une fiche élève manuellement.
- FR-093 — Le coach doit pouvoir ajouter une note privée unique sur un élève.
- FR-094 — Le coach doit pouvoir modifier la note privée unique.
- FR-095 — Une note privée doit être accessible uniquement au coach qui l’a créée.
- FR-096 — Le MVP ne doit pas suivre la progression sportive de l’élève.
- FR-097 — La fiche élève côté coach doit afficher un historique des demandes, cours confirmés, annulations, modifications et packs associés.
- FR-100 — Les parcours P0 doivent être disponibles sur app mobile.
- FR-101 — Les parcours P0 doivent être disponibles sur webapp.
- FR-102 — Les données affichées dans l’app et la webapp doivent être synchronisées.
- FR-103 — Le design des parcours doit prioriser l’usage téléphone.
- FR-104 — L’interface doit supporter français, anglais et espagnol.
- FR-105 — Les textes front doivent être externalisés pour permettre un changement de langue simple.
- FR-106 — Le front doit utiliser les tokens de design définis dans `design-tokens.md`.
- FR-107 — Le front doit supporter un light theme et un dark theme cohérents avec l’identité Roland-Garros premium.
- FR-108 — Les couleurs ne doivent pas être codées en dur dans les composants.
- FR-109 — Le planning coach doit proposer une vue semaine prioritaire/par défaut et une vue jour secondaire.
- FR-110 — Le planning coach doit permettre de changer de vue via un bouton de switch semaine/jour.
- FR-111 — Le coach doit pouvoir consulter une page légère de statistiques.
- FR-112 — Les statistiques P0 doivent afficher au minimum le nombre de cours effectués.
- FR-113 — Les statistiques P0 doivent afficher le nombre d’heures effectuées.
- FR-114 — Les statistiques P0 doivent afficher un indicateur explicitement libellé `revenu estimé`, calculé à partir des tarifs et heures.
- FR-115 — Les statistiques P0 doivent pouvoir afficher les élèves les plus actifs si les données disponibles le permettent.
- FR-116 — Les statistiques P0 ne doivent pas dépendre d’un paiement intégré.
- FR-120 — Le coach doit disposer d’un onglet Notifications.
- FR-121 — L’élève doit disposer d’un onglet Notifications.
- FR-122 — L’onglet Notifications doit lister les notifications liées aux événements importants.
- FR-123 — Une notification in-app doit être créée même si l’utilisateur n’a pas accepté les notifications push système.
- FR-124 — Les notifications in-app doivent permettre de retrouver l’événement concerné si applicable.
- FR-125 — Le système doit distinguer notification in-app et notification push système.
- FR-126 — L’utilisateur doit pouvoir voir les notifications récentes dans l’application.
- FR-127 — Le coach doit disposer en P0 d’un onglet Messagerie listant les discussions liées aux créneaux, demandes, réservations ou événements.
- FR-128 — Le coach doit pouvoir répondre dans une discussion liée à un créneau, une demande, une réservation ou un événement.

Total FRs: 112

### Non-Functional Requirements

- NFR-001 — Mobile-first: les parcours P0 doivent être utilisables confortablement sur téléphone.
- NFR-002 — Performance: les écrans critiques doivent charger rapidement sur connexion mobile standard.
- NFR-003 — Intégrité: la réservation doit être atomique pour éviter les doubles bookings.
- NFR-004 — Sécurité: les rôles et relations doivent contrôler l’accès aux données.
- NFR-005 — Confidentialité: les notes privées ne doivent jamais être exposées à l’élève.
- NFR-006 — Maintenabilité: le MVP doit rester simple, sans logique marketplace ou club.
- NFR-007 — Clarté UX: une erreur de réservation doit expliquer que le créneau n’est plus disponible.
- NFR-008 — Cohérence: app mobile et webapp doivent utiliser la même source de données.
- NFR-009 — Internationalisation: les libellés front doivent pouvoir être traduits en français, anglais et espagnol.
- NFR-010 — Priorité UX: les décisions d’interface doivent favoriser l’expérience coach, la rapidité de réservation et la simplicité de gestion planning.
- NFR-011 — Les statistiques coach P0 doivent rester légères et ne pas ralentir le développement du parcours planning/réservation.
- NFR-012 — Design system: l’interface doit limiter le noir pur et le blanc pur, et utiliser les fonds chauds définis dans les tokens.

Total NFRs: 12

### Additional Requirements

#### Business Rules

- BR-001 — Un créneau peut avoir jusqu’à 2 demandes en attente, mais une seule réservation confirmée.
- BR-002 — Un élève ne peut demander que les créneaux visibles d’un coach associé.
- BR-003 — Une demande nouvellement créée reste `nouvelle` côté coach jusqu’à validation ou refus.
- BR-004 — Le coach peut modifier un créneau uniquement s’il n’a pas de demande active ou réservation confirmée.
- BR-005 — Les notes coach sont privées et ne sont jamais visibles par l’élève.
- BR-006 — Les tarifs affichés à l’élève doivent être ceux publiés par le coach au moment de la consultation.
- BR-007 — Le MVP ne gère pas les paiements; un prix affiché n’implique pas transaction.
- BR-008 — Si plusieurs élèves tentent de demander le même créneau, les 2 premières demandes en attente peuvent réussir; les suivantes doivent échouer avec un message clair.
- BR-009 — Une demande en attente occupe une des 2 places de demande du créneau; une réservation confirmée bloque le créneau.
- BR-010 — Une demande en attente expire automatiquement après 7 jours.
- BR-011 — Un refus coach libère le créneau.
- BR-012 — Une validation coach transforme la demande en réservation confirmée.
- BR-012b — Quand le coach valide une demande sur un créneau, les autres demandes en attente du même créneau doivent être automatiquement refusées avec le message `Désolé, le créneau n'est plus disponible, veuillez essayer un autre créneau.`
- BR-013 — Le coach ne propose pas d’autre créneau dans le workflow P0.
- BR-014 — Un élève peut avoir au maximum 10 demandes en attente (`pending`) auprès du coach.
- BR-014b — Un même créneau peut avoir au maximum 2 demandes en attente (`pending`).
- BR-015 — Les créneaux P0 sont générés depuis des plages de disponibilité.
- BR-016 — Les disponibilités peuvent être ponctuelles ou récurrentes en P0.
- BR-016b — Les cours créés par le coach peuvent être récurrents hebdomadaires en P0.
- BR-016c — Les élèves ne peuvent pas demander de cours récurrent en P0.
- BR-022 — Les récurrences P0 autorisées sont ponctuelle, quotidienne et hebdomadaire.
- BR-023 — Après envoi d’une demande, le statut/libellé principal visible côté élève est `demande envoyée`.
- BR-017 — Le MVP a un seul coach désigné; tous les élèves de l’application sont visibles par ce coach.
- BR-018 — Les tarifs publiés sont visibles de la même façon pour tous les élèves associés.
- BR-019 — Les notes élève sont une note libre unique par fiche élève, pas un historique daté.
- BR-020 — Les notifications email sont hors P0.
- BR-021 — Le lien/code d’invitation coach est hors P0 et réservé à une évolution future.
- BR-024 — Une demande collective initiée par un élève inclut le demandeur et les joueurs sélectionnés.
- BR-025 — Un cours collectif créé par le coach inclut les élèves sélectionnés par le coach.
- BR-026 — Une validation coach notifie le demandeur.
- BR-027 — Un refus coach notifie le demandeur.
- BR-028 — Toute notification push fonctionnelle doit aussi créer une notification in-app visible dans l’onglet Notifications.
- BR-029 — Le refus des permissions push système ne doit pas empêcher l’affichage des notifications in-app.
- BR-030 — Une annulation P0 libère le créneau ou la place selon le type de cours.
- BR-031 — Une modification P0 doit notifier la partie qui n’a pas initié l’action.
- BR-032 — L’agenda principal élève ne doit pas exposer les cours d’autres élèves.
- BR-033 — Le tarif d’une demande est sélectionné automatiquement à partir du type de cours, de la durée, des tarifs actifs et des critères d’applicabilité définis par le coach.
- BR-034 — Seul le coach peut attribuer un pack de cours individuels à un élève.
- BR-035 — Un pack de cours individuels ne représente pas un paiement intégré en P0.
- BR-036 — Les heures pleines/heures creuses ne doivent pas être implémentées en P0.

Total Business Rules: 40

#### Other Traceability Anchors

- Hypothèses MVP: H1-H47, incluant coach unique, validation/refus coach, limite de 2 demandes par créneau, expiration à 7 jours, annulation/modification P0, notifications push + in-app, packs individuels, i18n, thèmes, statistiques légères et messagerie coach P0.
- Parcours P0: P0-FLOW-001 à P0-FLOW-005.
- Critères d’acceptation: CA-001 à CA-037.
- États et statuts: `AvailabilitySlot`, `Booking`, `CoachStudentRelation`.
- Données conceptuelles: `User`, `CoachProfile`, `StudentProfile`, `CoachStudentRelation`, `AvailabilitySlot`, `AvailabilityRange`, `Booking`, `GroupBookingParticipant`, `StudentLessonPack`, `MessageThread`, `Invoice`, `Pricing`, `StudentNote`, `PushNotification`, `InAppNotification`.
- Matrice de permissions: actions coach/élève définies pour profils, disponibilités, réservations, notifications, tarifs, élèves, notes, historique et packs.

### PRD Completeness Assessment

Le PRD est riche et exploitable pour une validation de couverture: il contient des FR numérotées, des NFR numérotées, des règles métier détaillées, des critères d’acceptation, des flux P0, des états, des données conceptuelles et une matrice de permissions.

Points de vigilance initiaux avant validation contre les epics:
- Les identifiants FR utilisent des suffixes (`FR-067b`, `FR-079a-2`, etc.) et des sauts de numérotation; la couverture devra tracer les identifiants exacts plutôt qu’une séquence numérique supposée.
- Les règles métier `BR-017` à `BR-021` apparaissent après `BR-022`/`BR-023`; cela n’empêche pas l’analyse mais signale une numérotation non ordonnée.
- La messagerie coach est P0 dans `FR-127`/`FR-128`, tandis que la section P1 mentionne aussi des évolutions de messagerie; les epics devront distinguer clairement le périmètre coach P0 des capacités avancées P1.
- Les exigences d’annulation/modification P0 sont présentes mais le workflow de modification reste indiqué comme "à préciser" dans l’évolution P0-EXT; les stories devront lever cette ambiguïté.

## Epic Coverage Validation

### Epic FR Coverage Extracted

- Epic 1: FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-010, FR-011, FR-012, FR-013, FR-020, FR-021, FR-024, FR-030, FR-032, FR-034, FR-100, FR-101, FR-102, FR-103, FR-104, FR-105, FR-106, FR-107, FR-108.
- Epic 2: FR-014, FR-023, FR-031, FR-033, FR-080, FR-081, FR-082, FR-083, FR-084, FR-085, FR-086, FR-087, FR-088, FR-088b, FR-089, FR-089b, FR-089c, FR-089d, FR-089e, FR-090, FR-091, FR-092, FR-093, FR-094, FR-095, FR-096, FR-097.
- Epic 3: FR-040, FR-041, FR-042, FR-043, FR-044, FR-045, FR-046, FR-047, FR-048, FR-049, FR-051, FR-109, FR-110.
- Epic 4: FR-022, FR-025, FR-050, FR-060, FR-061, FR-062, FR-063, FR-064, FR-066, FR-067, FR-067b, FR-068, FR-069, FR-070, FR-071, FR-072, FR-072b, FR-075, FR-076, FR-077, FR-078, FR-079, FR-079a, FR-079a-2, FR-079b, FR-079c.
- Epic 5: FR-065, FR-073, FR-074, FR-074b, FR-079d, FR-120, FR-121, FR-122, FR-123, FR-124, FR-125, FR-126, FR-127, FR-128.
- Epic 6: FR-111, FR-112, FR-113, FR-114, FR-115, FR-116.

Total FRs in epics: 112

### Coverage Matrix

La colonne "PRD Requirement" renvoie au texte complet extrait dans la section "Functional Requirements" ci-dessus; la comparaison a été faite sur les identifiants exacts et le texte PRD source.

| FR Number | Epic Coverage | Status |
| --- | --- | --- |
| FR-001 | Epic 1 - Création de compte. | Covered |
| FR-002 | Epic 1 - Connexion et déconnexion. | Covered |
| FR-003 | Epic 1 - Distinction des rôles coach/élève. | Covered |
| FR-004 | Epic 1 - Accès aux fonctions coach. | Covered |
| FR-005 | Epic 1 - Accès aux fonctions élève. | Covered |
| FR-006 | Epic 1 - Protection des données privées par relation autorisée. | Covered |
| FR-007 | Epic 1 - Contexte MVP single-coach. | Covered |
| FR-010 | Epic 1 - Création et modification du profil coach. | Covered |
| FR-011 | Epic 1 - Informations coach nécessaires à la réservation. | Covered |
| FR-012 | Epic 1 - Absence de lien/code coach en P0. | Covered |
| FR-013 | Epic 1 - Vue des élèves associés depuis le profil coach. | Covered |
| FR-014 | Epic 2 - Création de fiche élève par le coach sans compte élève préalable. | Covered |
| FR-020 | Epic 1 - Création et modification du profil élève. | Covered |
| FR-021 | Epic 1 - Association automatique au coach unique. | Covered |
| FR-022 | Epic 4 - Consultation des réservations élève. | Covered |
| FR-023 | Epic 2 - Non-exposition des notes privées coach à l’élève. | Covered |
| FR-024 | Epic 1 - Champs minimaux du profil élève. | Covered |
| FR-025 | Epic 4 - Statuts visibles des demandes côté élève. | Covered |
| FR-030 | Epic 1 - Création de relation coach/élève. | Covered |
| FR-031 | Epic 2 - Liste limitée aux élèves associés du coach. | Covered |
| FR-032 | Epic 1 - Association à un seul coach en P0. | Covered |
| FR-033 | Epic 2 - Consultation coach des réservations et notes liées à l’élève. | Covered |
| FR-034 | Epic 1 - Invitation coach repoussée hors P0. | Covered |
| FR-040 | Epic 3 - Création de plage de disponibilité. | Covered |
| FR-041 | Epic 3 - Génération de créneaux depuis une plage. | Covered |
| FR-042 | Epic 3 - Durées 1h et 1h30. | Covered |
| FR-043 | Epic 3 - Récurrences ponctuelle, quotidienne ou hebdomadaire. | Covered |
| FR-044 | Epic 3 - Modification d’une plage ou d’un créneau sans demande active ni réservation confirmée. | Covered |
| FR-045 | Epic 3 - Suppression d’une plage ou d’un créneau sans demande active ni réservation confirmée. | Covered |
| FR-046 | Epic 3 - Agenda élève limité aux créneaux demandables et à ses cours. | Covered |
| FR-047 | Epic 3 - Lieu visible dans le détail du créneau. | Covered |
| FR-048 | Epic 3 - Liste simple de lieux avec valeur initiale. | Covered |
| FR-049 | Epic 3 - Créneau confirmé non proposé comme disponible. | Covered |
| FR-050 | Epic 4 - Refus de demande si créneau indisponible ou limite pending atteinte. | Covered |
| FR-051 | Epic 3 - Consultation des créneaux à venir par le coach. | Covered |
| FR-060 | Epic 4 - Demande de créneau disponible par l’élève. | Covered |
| FR-061 | Epic 4 - Création de demande liée coach/élève/créneau. | Covered |
| FR-062 | Epic 4 - Confirmation d’envoi de demande à l’élève. | Covered |
| FR-063 | Epic 4 - Demande visible dans le planning coach. | Covered |
| FR-064 | Epic 4 - État visible `nouveau` sur nouvelle demande. | Covered |
| FR-065 | Epic 5 - Notification push coach lors d’une nouvelle demande. | Covered |
| FR-066 | Epic 4 - Validation depuis le détail de demande. | Covered |
| FR-067 | Epic 4 - Refus depuis le détail sans autre créneau ni confirmation. | Covered |
| FR-067b | Epic 4 - Commentaire optionnel de refus. | Covered |
| FR-068 | Epic 4 - Limites de demandes pending et réservation confirmée unique. | Covered |
| FR-069 | Epic 4 - Détail demande/réservation complet. | Covered |
| FR-070 | Epic 4 - Statut demande visible côté élève. | Covered |
| FR-071 | Epic 4 - Expiration automatique après 7 jours. | Covered |
| FR-072 | Epic 4 - Limite de 10 demandes pending par élève. | Covered |
| FR-072b | Epic 4 - Limite de 2 demandes pending par créneau. | Covered |
| FR-073 | Epic 5 - Notification push demandeur après validation. | Covered |
| FR-074 | Epic 5 - Notification push demandeur après refus. | Covered |
| FR-074b | Epic 5 - Commentaire de refus visible dans notification et détail côté élève. | Covered |
| FR-075 | Epic 4 - Demande de cours collectif par l’élève. | Covered |
| FR-076 | Epic 4 - Sélection de joueurs pour demande collective. | Covered |
| FR-077 | Epic 4 - Création de cours collectif par le coach. | Covered |
| FR-078 | Epic 4 - Conservation des participants d’une réservation collective. | Covered |
| FR-079 | Epic 4 - Création de cours individuel par le coach. | Covered |
| FR-079a | Epic 4 - Création de cours individuel récurrent hebdomadaire. | Covered |
| FR-079a-2 | Epic 4 - Interdiction de demande récurrente élève. | Covered |
| FR-079b | Epic 4 - Annulation ou modification de réservation confirmée en P0. | Covered |
| FR-079c | Epic 4 - Annulation élève jusqu’à l’heure de début. | Covered |
| FR-079d | Epic 5 - Notifications push et in-app lors d’annulation/modification. | Covered |
| FR-080 | Epic 2 - Création de plusieurs tarifs. | Covered |
| FR-081 | Epic 2 - Modification de tarif. | Covered |
| FR-082 | Epic 2 - Désactivation ou suppression de tarif. | Covered |
| FR-083 | Epic 2 - Tarifs publiés visibles avant demande. | Covered |
| FR-084 | Epic 2 - Champs minimaux d’un tarif. | Covered |
| FR-085 | Epic 2 - Types individuel et groupe. | Covered |
| FR-086 | Epic 2 - Tarifs attachés à des durées précises. | Covered |
| FR-087 | Epic 2 - Pas de masquage des tarifs par élève. | Covered |
| FR-088 | Epic 2 - Prix affichés sans paiement intégré. | Covered |
| FR-088b | Epic 2 - Heures pleines/heures creuses hors P0. | Covered |
| FR-089 | Epic 2 - Attribution de pack individuel par le coach. | Covered |
| FR-089b | Epic 2 - Suivi inclus/utilisés/restants pour pack. | Covered |
| FR-089c | Epic 2 - Interdiction d’auto-attribution de pack par l’élève. | Covered |
| FR-089d | Epic 2 - Consommation de session de pack par le coach. | Covered |
| FR-089e | Epic 2 - Sessions restantes visibles sur fiche élève. | Covered |
| FR-090 | Epic 2 - Consultation de la liste élèves. | Covered |
| FR-091 | Epic 2 - Ouverture de fiche élève. | Covered |
| FR-092 | Epic 2 - Création manuelle de fiche élève. | Covered |
| FR-093 | Epic 2 - Ajout de note privée unique. | Covered |
| FR-094 | Epic 2 - Modification de note privée unique. | Covered |
| FR-095 | Epic 2 - Accès note privée limité au coach propriétaire. | Covered |
| FR-096 | Epic 2 - Exclusion du suivi de progression sportive. | Covered |
| FR-097 | Epic 2 - Historique élève côté coach. | Covered |
| FR-100 | Epic 1 - Parcours P0 sur app mobile. | Covered |
| FR-101 | Epic 1 - Parcours P0 sur webapp. | Covered |
| FR-102 | Epic 1 - Synchronisation des données app/webapp. | Covered |
| FR-103 | Epic 1 - Design prioritaire téléphone. | Covered |
| FR-104 | Epic 1 - Support français, anglais et espagnol. | Covered |
| FR-105 | Epic 1 - Externalisation des textes front. | Covered |
| FR-106 | Epic 1 - Utilisation des tokens de design. | Covered |
| FR-107 | Epic 1 - Light theme et dark theme. | Covered |
| FR-108 | Epic 1 - Absence de couleurs codées en dur dans les composants. | Covered |
| FR-109 | Epic 3 - Planning coach semaine par défaut et jour secondaire. | Covered |
| FR-110 | Epic 3 - Switch semaine/jour du planning coach. | Covered |
| FR-111 | Epic 6 - Page légère de statistiques coach. | Covered |
| FR-112 | Epic 6 - Nombre de cours effectués. | Covered |
| FR-113 | Epic 6 - Nombre d’heures effectuées. | Covered |
| FR-114 | Epic 6 - Indicateur `revenu estimé`. | Covered |
| FR-115 | Epic 6 - Élèves les plus actifs si possible. | Covered |
| FR-116 | Epic 6 - Statistiques indépendantes du paiement intégré. | Covered |
| FR-120 | Epic 5 - Onglet Notifications coach. | Covered |
| FR-121 | Epic 5 - Onglet Notifications élève. | Covered |
| FR-122 | Epic 5 - Liste des notifications importantes. | Covered |
| FR-123 | Epic 5 - Notification in-app même sans autorisation push système. | Covered |
| FR-124 | Epic 5 - Lien depuis notification vers événement concerné. | Covered |
| FR-125 | Epic 5 - Distinction in-app/push système. | Covered |
| FR-126 | Epic 5 - Notifications récentes visibles dans l’application. | Covered |
| FR-127 | Epic 5 - Onglet Messagerie coach lié aux créneaux, demandes, réservations et événements. | Covered |
| FR-128 | Epic 5 - Réponse coach dans une discussion liée à un événement de planning/réservation. | Covered |

### Missing Requirements

Aucun FR du PRD n’est absent de la coverage map des epics.

### Coverage Statistics

- Total PRD FRs: 112
- FRs covered in epics: 112
- Coverage percentage: 100%
- FRs in epics but not in PRD: 0

### Coverage Observations

- La couverture FR est complète au niveau de la map epics.
- Les stories contiennent des acceptance criteria détaillés pour chaque epic, mais la qualité de découpage et l’alignement UX restent à valider dans les étapes suivantes.
- Les exigences `FR-079b`/`FR-079c` sont couvertes dans Epic 4, tandis que `FR-079d` est couverte dans Epic 5; cette séparation est logique mais devra rester synchronisée pendant l’implémentation.

## UX Alignment Assessment

### UX Document Status

Found.

Documents UX lus:
- `_bmad-output/planning-artifacts/ux-screen-inventory.md`
- `_bmad-output/planning-artifacts/ux-designs/ux-NextPoint-2026-06-07/DESIGN.md`
- `_bmad-output/planning-artifacts/ux-designs/ux-NextPoint-2026-06-07/EXPERIENCE.md`

Architecture lue pour alignement:
- `_bmad-output/planning-artifacts/architecture.md`

### UX ↔ PRD Alignment

Alignements confirmés:
- Les parcours clés PRD sont couverts: onboarding coach/élève, agenda élève, demande de créneau, traitement coach, suivi élève, collectif, annulation, statistiques et notifications.
- Les surfaces mobiles proposées correspondent globalement aux besoins PRD: Accueil/Planning/Notifications/Compte côté élève; Planning/Disponibilités/Élèves/Stats/Notifications/Profil côté coach.
- Les exigences visuelles PRD sont reprises: identité Roland-Garros premium, ocre/terre battue, vert profond, fonds chauds, light/dark theme, tokens, pending visible dans le planning coach.
- Les exigences de confidentialité UX sont cohérentes avec le PRD: note privée coach non exposée à l’élève, pas d’autosave, action explicite `Modifier` puis `Enregistrer`.
- Les exigences de notifications sont alignées: in-app disponible même si push système refusé, lien vers événement, état lu/non lu.

### UX ↔ Architecture Alignment

Alignements confirmés:
- Expo Router et les groupes de routes prévus couvrent les surfaces UX élève/coach.
- Les features architecture (`scheduling`, `bookings`, `notifications`, `messaging`, `students`, `pricing`, `lesson-packs`, `stats`, `i18n`, `theme`) correspondent aux principaux écrans UX.
- Supabase Auth/RLS et les commandes transactionnelles supportent les obligations UX de sécurité, confidentialité, limites pending, validation/refus, annulation/modification et notifications miroir.
- TanStack Query, skeletons, conservation des données pendant refetch et realtime sélectif supportent les besoins de performance sur planning.
- Les tokens, thèmes light/dark et interdiction de couleurs hardcodées supportent `DESIGN.md`.

### Alignment Issues

#### Critical - Périmètre Messagerie Coach P0 contradictoire

- PRD: `FR-127`/`FR-128` placent l’onglet Messagerie coach en P0.
- UX inventory: `E-COACH-010 — Messagerie Coach` décrit un écran P0 et la navigation coach inclut `Messagerie`.
- Architecture: prévoit `features/messaging`, `app/(coach)/messaging.tsx` et les contrats messaging.
- EXPERIENCE.md: indique au contraire que `Messageries` est retiré de la navigation coach P0 car la messagerie réservation serait P1.

Impact: un agent d’implémentation peut soit livrer, soit exclure la messagerie coach P0 selon le document suivi.

Recommendation: corriger `EXPERIENCE.md` pour aligner le périmètre sur le PRD validé: messagerie coach liée aux créneaux/demandes/réservations/événements en P0; messagerie élève et comportements avancés en P1.

#### Critical - Modification de réservation côté élève contradictoire (résolu le 2026-06-08)

- PRD: corrigé pour indiquer que le coach peut annuler ou modifier une réservation confirmée en P0, tandis que l’élève peut seulement annuler et ne voit pas d’action de modification.
- UX inventory: corrigé pour indiquer que la modification P0 est réservée au coach et que l’élève dispose seulement de l’annulation si elle est autorisée.
- EXPERIENCE.md: déjà aligné sur cette décision.
- Architecture: corrigée pour préciser que `modifyBooking` est coach-only.

Impact initial: les stories pouvaient implémenter une capacité élève exigée par le PRD ou l’exclure selon l’artefact UX utilisé.

Recommendation: conserver cette décision comme source de vérité: modification réservée au coach; élève sans action de modification, avec annulation seulement si autorisée.

#### High - Niveaux padel (résolu le 2026-06-08)

- PRD: `FR-024` demande un niveau padel de 1 à 10.
- UX inventory: `E-COACH-004` confirme une liste fermée de niveaux padel de 1 à 10.
- Epics: `Story 1.6` et `Story 2.2` utilisent également 1 à 10.
- EXPERIENCE.md: plusieurs sections indiquaient une ancienne plage erronée avant correction; elles sont maintenant alignées sur 1 à 10.

Impact initial: divergence de validation formulaire, filtres coach et libellés UX.

Recommendation: conserver 1 à 10 partout, sauf décision produit explicite inverse avec mise à jour PRD/epics.

#### High - Message de refus automatique divergent

- PRD `BR-012b`: les autres demandes pending du même créneau doivent être automatiquement refusées avec le message exact `Désolé, le créneau n'est plus disponible, veuillez essayer un autre créneau.`
- EXPERIENCE.md: utilise `Creneau deja pris` comme note par défaut dans Booking Rules UX et Key Flow P0-FLOW-004.

Impact: divergence de microcopy produit et tests d’acceptation possibles.

Recommendation: remplacer la note courte dans EXPERIENCE.md par le message exact du PRD, ou décider officiellement d’un nouveau texte et synchroniser PRD, epics et tests.

### Warnings

- `ux-screen-inventory.md` est marqué `brouillon initial à valider`; `DESIGN.md` et `EXPERIENCE.md` sont aussi en statut draft. Les décisions contradictoires ci-dessus doivent être stabilisées avant implémentation.
- `ux-screen-inventory.md` liste encore un point à trancher sur modification de récurrence; `EXPERIENCE.md` et les epics semblent le résoudre par popup occurrence/série. Le statut de décision devrait être consolidé dans l’inventaire UX.
- L’architecture déclare le style UI library intentionnellement indécis. Ce n’est pas bloquant, mais les premières stories UI devront établir les primitives tokenisées avant de produire beaucoup d’écrans.

### UX Alignment Summary

UX documentation exists and is broadly aligned with PRD and Architecture for the major P0 surfaces. However, the auto-refusal message conflict should be corrected before implementation starts, otherwise the implementation can satisfy one planning artifact while violating another. The niveaux padel, messagerie coach P0 and modification de réservation conflicts were corrected on 2026-06-08.

## Epic Quality Review

### Review Scope

Document reviewed:
- `_bmad-output/planning-artifacts/epics.md`

Structure reviewed:
- 6 epics
- 42 stories
- FR Coverage Map: 112/112 FRs covered
- Acceptance criteria format: broadly Given/When/Then with explicit error cases

### Epic Structure Validation

| Epic | User Value Focus | Independence | Assessment |
| --- | --- | --- | --- |
| Epic 1: Accès, Profils et Expérience App/Web | Mixed: user access/profiles plus setup foundation | Can stand alone as app/auth/profile base | Acceptable greenfield foundation, but contains technical setup stories |
| Epic 2: Tarifs, Élèves, Notes Privées et Packs | Strong coach value | Depends only on Epic 1 identity/access | Valid |
| Epic 3: Disponibilités et Planning Demandable | Strong coach/élève scheduling value | Depends on Epic 1 and can use Epic 2 tariffs already delivered | Valid |
| Epic 4: Demandes, Réservations et Traitement Coach | Core product value | Depends on previous identity, tariffs, slots | Valid |
| Epic 5: Notifications Push, Centre In-App et Messagerie Coach | Strong communication value | Depends on booking events from Epic 4 | Valid |
| Epic 6: Statistiques Coach Légères | Coach activity value | Depends on confirmed bookings/pricing from earlier epics | Valid |

### Critical Violations

None found in epic structure.

No epic is a pure technical milestone such as "Database Setup" or "API Development". Epic 1 includes technical setup stories, but this is acceptable for a greenfield project because the architecture explicitly requires Expo starter initialization as the first implementation story.

### Major Issues

#### Major - Story 1.2 risks violating database/entity creation timing

Story: `1.2: Initialiser Supabase, migrations, types et CI légère`

Problem:
- The story is correctly placed early for greenfield setup, but one AC says initial migrations prepare "tables, politiques RLS et tests qui seront détaillés par les stories métier suivantes."
- Best practice requires domain tables to be created when first needed by the story that uses them, not all upfront in an infrastructure story.

Impact:
- Implementation could create broad placeholder schema/RLS before domain requirements are exercised.
- Later stories may inherit schema decisions without validating them against concrete user workflows.

Recommendation:
- Constrain Story 1.2 to Supabase project plumbing, migration/test harness, env examples, generated types process and CI.
- Move concrete domain tables/RLS into the first story that needs each area: auth/profile tables in Epic 1, pricing tables in Story 2.1, student/private-note tables in Stories 2.2-2.5, availability tables in Story 3.1, booking tables/constraints in Story 4.1-4.2, notifications tables in Story 5.1, stats read model in Story 6.1.

#### Major - Reservation modification workflow remains under-specified

Story: `4.10: Annuler ou modifier une réservation confirmée`

Problem:
- The story previously said coach or élève could initiate a modification; it has been corrected so only the coach can initiate a modification and the élève only sees cancellation when authorized.
- It does not specify the modification lifecycle: requested vs accepted, whether coach approval is needed for student-initiated modification, whether slot availability is rechecked immediately, what fields can change, or how conflicting modifications are handled.
- This also intersects with the UX alignment conflict where `EXPERIENCE.md` says only the coach can modify.

Impact:
- Implementation can pass a vague AC while producing incompatible behavior.
- Tests cannot be written precisely for modification state transitions.

Recommendation:
- Split modification into explicit stories or add precise ACs:
  - coach-initiated modification;
  - student-initiated modification, if still P0;
  - status model during modification;
  - slot conflict checks;
  - notification behavior;
  - cancellation vs modification boundaries.

#### Major - Auto-refusal message must be made test-exact in stories

Stories: `4.4: Valider une demande de réservation`, `5.4: Notifier l’élève après validation ou refus`

Problem:
- Story 4.4 includes auto-refusal of other pending requests and the PRD message text.
- UX `EXPERIENCE.md` uses a shorter different message.
- Notification story 5.4 covers refusal notifications, but does not explicitly call out the auto-refusal path for other pending requests on the same slot.

Impact:
- The direct demandeur may be notified correctly, but students auto-refused because another request was accepted could be missed or receive inconsistent copy.

Recommendation:
- Add AC to Story 5.4 or 4.4 confirming that auto-refused pending request owners receive in-app + push notification with the exact product message from PRD `BR-012b`.

### Minor Concerns

#### Minor - Epic 1 is broad

Epic 1 combines starter setup, Supabase setup, UI/theme/i18n, auth, route guards, profiles and coach association.

This is acceptable for a greenfield foundation, but implementation sequencing should avoid treating Epic 1 as one large undifferentiated platform milestone. The current story breakdown mitigates most of the risk.

#### Minor - Story 3.6 contains a "future parcours de demande" reference

Story `3.6` says slot detail exposes data "pour le futur parcours de demande" and tariffs will be displayed by Epic 2 already delivered.

This is not a forward dependency violation because Epic 4 follows Epic 3 and Epic 2 precedes it. However, acceptance should ensure Story 3.6 is still independently useful as a read-only agenda before request creation exists.

#### Minor - P1/future compatibility language appears in P0 stories

Examples:
- future invitation code in Story 1.8;
- future student account matching in Story 2.3;
- future recurrence occurrence modification in Story 4.9.

These are phrased as non-blocking structural compatibility, not required future functionality. Keep them as guardrails only; do not let them expand P0 scope.

### Story Quality Assessment

Strengths:
- Stories generally use real user/value framing: coach, élève, utilisateur NextPoint, système de réservation where system value is required for invariants.
- Acceptance criteria are mostly testable and include error/authorization cases.
- Core booking stories correctly emphasize server-side transactional commands and avoid client-only state.
- Notifications are separated into a dedicated epic without making earlier booking stories depend on future notification delivery for their local success.
- Greenfield starter requirement is satisfied by Story 1.1 with Expo `default@sdk-56`.

Risks to monitor:
- Ensure database and RLS work is introduced alongside the relevant domain stories rather than front-loaded.
- Clarify modification workflow before implementation.
- Synchronize the UX contradictions identified in the previous section before generating implementation stories/tasks.

### Best Practices Compliance Checklist

| Check | Status |
| --- | --- |
| Epics deliver user value | Pass |
| Epics can function in sequence without forward dependency | Pass |
| Stories appropriately sized | Mostly pass; Story 1.2 and Story 4.10 need tightening |
| No critical forward dependencies | Pass |
| Database tables created when needed | Risk in Story 1.2; requires correction |
| Clear acceptance criteria | Mostly pass; modification workflow needs specificity |
| Traceability to FRs maintained | Pass |

### Epic Quality Summary

The epic/story document is implementation-ready in structure, but not yet clean enough to start coding without corrections. The required corrections are scoped: tighten Story 1.2 to avoid premature schema creation, clarify Story 4.10 modification semantics, and synchronize notification copy/auto-refusal behavior with PRD and UX.

## Summary and Recommendations

### Overall Readiness Status

NEEDS WORK

The planning set is close: required documents exist, PRD requirements are explicit, epics cover 112/112 PRD FRs, architecture supports the main product/UX needs, and the story structure is mostly implementation-ready.

However, implementation should not start until the contradictions below are resolved. The current artifacts can lead two implementation agents to build different P0 scopes while both appearing to follow the docs.

### Critical Issues Requiring Immediate Action

1. Messagerie coach P0 conflict
   - PRD, UX inventory, epics and architecture include coach messaging in P0.
   - `EXPERIENCE.md` removes `Messageries` from coach P0 navigation and treats reservation messaging as P1.
   - Required action: update `EXPERIENCE.md` to keep coach messaging P0, or formally update PRD/epics/architecture to demote it.

2. Modification workflow under-specified
   - Story 4.10 does not define who approves a modification, what fields can change, which statuses exist during modification, how slot conflicts are checked, or how concurrent changes behave.
   - Required action: split or expand Story 4.10 before implementation.

### High-Priority Issues

3. Niveaux padel mismatch
   - PRD, UX inventory and epics use levels 1 to 10.
   - `EXPERIENCE.md` uses 1 to 9.
   - Required action: standardize to 1 to 10 unless product decision changes.

4. Auto-refusal message mismatch
   - PRD requires exact message: `Désolé, le créneau n'est plus disponible, veuillez essayer un autre créneau.`
   - `EXPERIENCE.md` uses `Creneau deja pris`.
   - Required action: align UX copy and notification acceptance criteria with PRD.

5. Auto-refusal notification path needs explicit AC
   - Story 4.4 covers auto-refusal of other pending requests.
   - Story 5.4 covers direct validation/refusal notifications but does not explicitly cover auto-refused students after another request is approved.
   - Required action: add AC for push + in-app notification to auto-refused pending request owners.

6. Story 1.2 may front-load schema too early
   - It risks preparing domain tables/RLS before domain stories need them.
   - Required action: constrain Story 1.2 to Supabase plumbing, migration/test harness and CI; create domain tables/RLS in the stories that first use them.

### Recommended Next Steps

1. Patch `EXPERIENCE.md` for the four concrete contradictions: coach messaging P0, student modification rights, padel levels, and auto-refusal message.
2. Patch `epics.md` Story 4.10 to define the coach-only modification workflow precisely.
3. Patch `epics.md` Story 5.4 or 4.4 to include notification behavior for automatically refused pending requests.
4. Patch `epics.md` Story 1.2 to avoid premature domain schema creation.
5. Re-run implementation readiness after those edits; expected result should be READY if no new contradictions are introduced.

### Final Note

This assessment initially identified 7 issues requiring attention across 3 categories; the niveaux padel issue has since been corrected to 1 à 10:
- artifact alignment conflicts;
- story quality/specification gaps;
- implementation sequencing risk.

The strongest signal is positive: FR coverage is complete and architecture is coherent. The blocker is not missing scope; it is conflicting scope. Resolve those conflicts before starting implementation to avoid rework.

**Assessment date:** 2026-06-08  
**Assessor:** BMAD Implementation Readiness workflow via Codex
