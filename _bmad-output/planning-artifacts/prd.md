# PRD — NextPoint

Date: 2026-06-06  
Workflow BMAD: `bmad-prd`  
Phase BMAD: 2 — Planning  
Statut: version produit structurée, à valider avant UX/architecture  
Sources:
- `_bmad-output/planning-artifacts/product-brief.md`
- `_bmad-output/planning-artifacts/decision-log.md`

## 1. Résumé Exécutif

NextPoint est une application mobile-first avec webapp complémentaire pour un coach de padel désigné et ses élèves. Elle permet au coach de publier ses disponibilités, créer des cours individuels ou collectifs, gérer ses tarifs, voir ses demandes/réservations, suivre ses élèves et conserver une note privée par élève. Elle permet à l’élève de créer son profil, rejoindre l’espace du coach, consulter les disponibilités pertinentes et demander une réservation sans échange manuel.

Le MVP doit résoudre un problème précis: réduire la friction de coordination entre les disponibilités du coach et celles de l’élève. Toute fonctionnalité qui ne renforce pas directement la réservation ou le suivi coach est hors MVP.

## 2. Objectifs Produit

### Objectifs

- Permettre à un coach de gérer ses créneaux disponibles depuis son téléphone.
- Permettre à un élève de réserver un créneau disponible sans discussion préalable.
- Rendre les nouvelles réservations immédiatement visibles côté coach.
- Centraliser les tarifs, élèves et notes privées du coach.
- Livrer une expérience cohérente entre app mobile et webapp.

### Non-Objectifs MVP

- Ne pas créer une marketplace publique de coachs.
- Ne pas gérer les clubs, académies ou structures multi-coachs.
- Ne pas intégrer le paiement.
- Ne pas construire une messagerie générale hors contexte de réservation.
- Ne pas synchroniser avec Google Calendar, Apple Calendar ou Outlook en P0.
- Ne pas traiter l’analyse vidéo, la performance sportive ou les statistiques avancées.
- Ne pas gérer plusieurs coachs visibles par un même élève en P0.
- Ne pas adapter le produit à d’autres sports en P0.

## 3. Utilisateurs Cibles

### Coach Indépendant

Utilisateur prioritaire du produit.

**Contexte:** donne des cours de padel, coordonne ses créneaux par message ou agenda personnel, doit suivre ses élèves et éviter les oublis.

**Besoins principaux:**
- publier rapidement des disponibilités;
- recevoir les réservations sans va-et-vient;
- identifier les nouveaux créneaux réservés;
- modifier ses tarifs;
- retrouver ses élèves;
- ajouter des notes privées sur chaque élève.

**Critère de succès:** le coach peut ouvrir l’app, comprendre ses prochaines réservations et gérer son planning sans outil externe.

### Élève

Utilisateur prioritaire du parcours de réservation.

**Contexte:** veut prendre un cours avec un coach connu ou recommandé, sans attendre une réponse par message.

**Besoins principaux:**
- créer un profil simple;
- accéder à l’espace du coach;
- voir les créneaux disponibles;
- connaître le prix;
- réserver un créneau.

**Critère de succès:** l’élève peut demander un cours en quelques étapes depuis téléphone et suivre son statut.

## 4. Jobs To Be Done

- Quand je suis coach et que je connais mes disponibilités, je veux les publier rapidement afin que mes élèves puissent réserver sans me contacter.
- Quand je suis élève et que je veux prendre un cours, je veux voir les créneaux disponibles afin de choisir celui qui me convient.
- Quand une réservation arrive, je veux qu’elle ressorte clairement afin de ne pas la manquer.
- Quand je prépare un cours, je veux revoir mes notes sur l’élève afin d’adapter la séance.
- Quand mes tarifs changent, je veux les modifier simplement afin que les élèves voient une information fiable.
- Quand une nouvelle demande arrive, je veux recevoir une notification push afin de ne pas la manquer.

## 5. Hypothèses MVP

Ces hypothèses cadrent le MVP. Si elles changent, le PRD doit être mis à jour avant architecture.

- H1 — Le MVP cible un coach indépendant désigné, pas une marketplace multi-coachs.
- H2 — En P0, l’association élève/coach est directe: comme il n’y a qu’un coach, tous les élèves de l’application sont visibles par ce coach.
- H3 — Une réservation élève crée une demande que le coach doit valider ou refuser.
- H4 — Un créneau peut recevoir jusqu’à 2 demandes en attente; une réservation confirmée bloque ensuite définitivement le créneau pour les autres élèves.
- H5 — Les annulations et modifications de réservation sont P0.
- H6 — Les notifications push coach sont P0 pour les nouvelles demandes.
- H7 — Le paiement intégré est hors MVP.
- H8 — L’app mobile est prioritaire; la webapp doit couvrir les parcours critiques sans viser la même finesse UX.
- H9 — La connexion à Google Agenda est P1.
- H10 — La messagerie contextualisée sur une réservation est P1.
- H11 — Une page légère de statistiques coach est P0.
- H12 — Le coach crée des plages de disponibilités qui génèrent des créneaux.
- H13 — Les durées de créneau supportées sont 1h et 1h30, avec 1h30 comme durée de référence.
- H14 — Les disponibilités P0 peuvent être ponctuelles, quotidiennes ou hebdomadaires.
- H15 — Un lieu/club est associé à une disponibilité via une liste simple, avec `Les Bruyères Centre Sportif` comme valeur initiale.
- H16 — Le produit est padel-only en P0, mais doit rester adaptable à d’autres sports plus tard.
- H17 — L’interface doit être préparée pour français, anglais et espagnol.
- H18 — Un élève n’a qu’un seul coach en P0.
- H19 — La priorité produit est l’expérience coach, avec rapidité de réservation et simplicité de planning.
- H20 — Une demande expire automatiquement après 7 jours si le coach ne répond pas.
- H21 — Un élève peut avoir plusieurs demandes en parallèle, avec une limite P0 de 10 demandes en attente (`pending`) auprès du coach.
- H21b — Un même créneau peut avoir au maximum 2 demandes en attente (`pending`) avant décision coach.
- H22 — En P1/futur, le coach pourra donner un lien d’invitation ou un code pour que l’élève l’ajoute dans l’application.
- H23 — Le libellé affiché côté élève après envoi d’une demande est `demande envoyée`.
- H24 — Un élève peut demander un cours collectif en sélectionnant des joueurs de l’application.
- H25 — Le coach peut créer un cours collectif en sélectionnant les élèves concernés.
- H26 — Quand le coach valide ou refuse une demande, le demandeur reçoit une notification push.
- H27 — Coach et élève disposent d’un onglet Notifications listant les notifications in-app, même si l’utilisateur refuse les notifications push système.
- H27b — Toute notification push déclenchée doit aussi créer une notification in-app visible dans l’onglet Notifications.
- H28 — L’interface utilise une identité visuelle Roland-Garros premium avec ocre terre battue, vert profond et fonds chauds.
- H29 — Le planning coach P0 propose deux vues: semaine et jour, avec la vue semaine prioritaire/par défaut et un bouton pour changer de mode.
- H30 — La validation ou le refus d’une demande `pending` se fait depuis l’écran de détail de la demande.
- H31 — Le revenu affiché dans les statistiques coach doit être explicitement libellé `revenu estimé`.
- H32 — Côté élève, l’agenda de la page principale affiche exclusivement les disponibilités demandables et les cours de cet élève.
- H33 — En P1, le coach pourra limiter l’horizon de visibilité des disponibilités côté élève: 1 semaine, 2 semaines, 3 semaines, 1 mois, 2 mois, 3 mois ou non défini (`pas set`).
- H34 — Le coach peut créer un cours individuel en P0, en plus des cours collectifs.
- H35 — Le coach peut créer un cours récurrent hebdomadaire en P0; l’élève ne peut pas créer de demande récurrente.
- H36 — Le profil élève côté coach doit afficher un historique exploitable des cours, demandes, annulations, modifications et packs.
- H37 — Le coach peut rattacher un pack de cours individuels à un élève en P0 pour suivre les crédits/consommations, sans paiement intégré.
- H38 — La génération de facture est une évolution V2, hors P0/P1.
- H39 — Seul le coach peut donner/rattacher un pack de cours individuels à un élève.
- H40 — La page publique avant inscription affiche uniquement les tarifs et un bouton principal `S’inscrire`, sans disponibilités.
- H41 — Côté élève, les tarifs sont affichés au-dessus de l’agenda et l’agenda est hebdomadaire par défaut avec bascule jour.
- H42 — Le tarif applicable est sélectionné automatiquement selon type de cours et durée; l’élève ne choisit pas manuellement une ligne tarifaire.
- H43 — Une demande de réservation peut inclure un commentaire libre de l’élève.
- H44 — Un refus coach ne demande pas de confirmation et peut inclure un commentaire transmis à l’élève dans la notification.
- H45 — Les heures pleines/heures creuses sont hors P0.
- H46 — Les statistiques coach priorisent le mois; trimestre et année sont utiles, semaine est secondaire.

## 6. Périmètre MVP

### Inclus P0

- Authentification coach et élève.
- Profils coach et élève.
- Association directe élève/coach, car le MVP contient un seul coach.
- Création et gestion de créneaux disponibles par le coach.
- Consultation par l’élève des disponibilités demandables et de ses propres cours sur l’agenda principal.
- Demande de réservation d’un créneau libre par l’élève.
- Validation ou refus de la demande par le coach.
- Blocage des doubles réservations.
- Jusqu’à 2 demandes en attente possibles sur un même créneau avant validation coach.
- Tableau de bord coach avec nouvelles réservations mises en évidence.
- Notifications push coach pour nouvelle demande.
- Notification in-app créée en parallèle de chaque notification push.
- Onglet Notifications coach et élève.
- Historique in-app des notifications importantes, indépendant de l’autorisation push système.
- Statistiques coach simples.
- Annulation et modification de réservation.
- Gestion des tarifs coach.
- Liste des élèves côté coach.
- Notes privées coach sur élèves.
- Historique élève visible par le coach sur la fiche élève.
- Pack de cours individuels rattaché à un élève pour suivi simple des crédits/consommations.
- Création de fiche élève par le coach sans inscription élève.
- Plages de disponibilité générant des créneaux.
- Disponibilités récurrentes.
- Lieu/club simple sur disponibilité/réservation, avec `Les Bruyères Centre Sportif` comme valeur initiale.
- Statuts visibles élève: en attente, confirmé, refusé.
- Demande de cours collectif avec sélection de joueurs de l’application.
- Création de cours individuel par le coach.
- Création de cours récurrent hebdomadaire par le coach.
- Création de cours collectif par le coach avec sélection d’élèves.
- Support d’interface français, anglais, espagnol.
- Light theme et dark theme basés sur les tokens de design validés.
- App mobile-first.
- Webapp couvrant les fonctionnalités P0.

### Prévu P1

- Limitation configurable par le coach de l’horizon de visibilité des disponibilités côté élève: 1 semaine, 2 semaines, 3 semaines, 1 mois, 2 mois, 3 mois ou non défini (`pas set`).
- Notifications push avancées hors événements P0 déjà couverts.
- Notification push paramétrable côté élève lorsqu’une place se libère sur un cours collectif.
- Connexion à Google Agenda pour synchroniser les réservations confirmées côté coach et côté élève si le compte est connecté.
- Messagerie contextualisée sur une réservation.
- Écran coach regroupant les messageries liées aux créneaux/réservations/événements.

### Prévu V2

- Génération de facture.

### Exclu P0

- Paiement.
- Messagerie générale hors réservation.
- Recherche publique de coachs.
- Multi-coach/club.
- Limitation de visibilité des disponibilités côté élève.
- Connexion à Google Agenda.
- Messagerie liée à une réservation.
- Récurrence avancée des disponibilités.
- Synchronisation calendrier externe.
- Analyse sportive.
- Paiement ou message de paiement; seul le prix est affiché.
- Masquage des tarifs par élève.
- Suivi de progression sportive de l’élève.
- Proposition d’un autre créneau par le coach lors d’un refus.

## 7. Parcours Utilisateurs

### P0-FLOW-001 — Onboarding Coach

1. Le coach crée son compte.
2. Le coach choisit le rôle `coach`.
3. Le coach complète son profil.
4. Le coach configure au moins un tarif.
5. Le coach crée une plage de disponibilité.
6. Le système génère des créneaux de 1h ou 1h30 selon le réglage choisi.

**Résultat attendu:** le coach est prêt à recevoir une demande de réservation.

### P0-FLOW-002 — Onboarding Élève

1. L’élève crée son compte.
2. L’élève choisit le rôle `élève`.
3. L’élève complète son profil minimal.
4. L’élève accède automatiquement à l’espace du coach unique.

**Résultat attendu:** l’élève peut consulter les disponibilités du coach.

### P0-FLOW-003 — Réservation Élève

1. L’élève ouvre l’espace du coach.
2. L’élève consulte les tarifs.
3. L’élève consulte les créneaux disponibles.
4. L’élève sélectionne un créneau.
5. L’élève envoie une demande de réservation.
6. Le système confirme que la demande a été envoyée.

**Résultat attendu:** la demande apparaît côté coach comme nouvelle, déclenche une notification push coach et occupe une des 2 places de demande en attente possibles sur ce créneau.

### P0-FLOW-004 — Traitement Réservation Coach

1. Le coach ouvre son planning.
2. Le coach voit les demandes `pending` directement dans son planning, dans une couleur distincte ou en surbrillance.
3. Le coach ouvre le détail d’une demande depuis le planning.
4. Le coach valide ou refuse la demande.
5. Si le coach valide, la réservation devient confirmée.
6. Si le coach refuse, le créneau redevient disponible.
7. Si le coach ne répond pas sous 7 jours, la demande expire et le créneau redevient disponible.

**Résultat attendu:** le coach garde le contrôle final sur son planning.

### P0-FLOW-005 — Suivi Élève

1. Le coach ouvre la liste de ses élèves.
2. Le coach sélectionne un élève.
3. Le coach consulte les informations utiles: nom, téléphone, email, niveau et âge.
4. Le coach ajoute ou modifie une note privée unique.

**Résultat attendu:** le coach conserve un suivi exploitable pour ses prochains cours.

## 8. Exigences Fonctionnelles

### 8.1 Comptes, Rôles et Accès

- FR-001 — Le système doit permettre à un utilisateur de créer un compte.
- FR-002 — Le système doit permettre à un utilisateur de se connecter et se déconnecter.
- FR-003 — Le système doit distinguer les rôles `coach` et `élève`.
- FR-004 — Un compte coach doit accéder aux fonctions coach.
- FR-005 — Un compte élève doit accéder aux fonctions élève.
- FR-006 — Un utilisateur ne doit pas accéder aux données privées d’un autre utilisateur sans relation autorisée.
- FR-007 — Le MVP doit supporter un seul coach désigné comme contexte principal de réservation.

### 8.2 Profil Coach

- FR-010 — Le coach doit pouvoir créer et modifier son profil.
- FR-011 — Le profil coach doit exposer les informations nécessaires à la réservation.
- FR-012 — En P0, le coach n’a pas besoin de partager un lien/code pour associer un élève.
- FR-013 — Le coach doit pouvoir voir les élèves associés à son profil.
- FR-014 — Le coach doit pouvoir créer une fiche élève sans que l’élève ait déjà créé son compte.

### 8.3 Profil Élève

- FR-020 — L’élève doit pouvoir créer et modifier son profil.
- FR-021 — En P0, l’élève doit être automatiquement associé au coach unique de l’application.
- FR-022 — L’élève doit pouvoir consulter ses réservations.
- FR-023 — L’élève ne doit pas voir les notes privées du coach.
- FR-024 — Le profil élève doit contenir au minimum nom, téléphone, email, niveau et âge.
- FR-025 — L’élève doit voir le statut de chaque demande: en attente, confirmé, refusé ou expiré.

### 8.4 Relation Coach/Élève

- FR-030 — Le système doit créer une relation coach/élève lorsqu’un élève rejoint un coach.
- FR-031 — Le coach doit voir uniquement ses élèves associés.
- FR-032 — L’élève doit être associé à un seul coach en P0.
- FR-033 — La relation doit permettre au coach de consulter les réservations et notes liées à l’élève.
- FR-034 — Le mécanisme de lien/code d’invitation coach est réservé à une évolution future.

### 8.5 Disponibilités

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

### 8.6 Réservations

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
- FR-079b — Le coach et l’élève doivent pouvoir annuler ou modifier une réservation confirmée en P0.
- FR-079c — L’élève doit pouvoir annuler une réservation jusqu’à l’heure de début du cours.
- FR-079d — Lorsqu’une annulation ou modification est initiée par une partie, l’autre partie doit recevoir une notification push et une notification in-app.

### 8.7 Tarifs

- FR-080 — Le coach doit pouvoir créer plusieurs tarifs.
- FR-081 — Le coach doit pouvoir modifier un tarif.
- FR-082 — Le coach doit pouvoir désactiver ou supprimer un tarif.
- FR-083 — L’élève doit voir les tarifs publiés du coach avant de demander un créneau.
- FR-084 — Un tarif doit contenir au minimum un libellé, un prix, une durée et un type.
- FR-085 — Les types de tarifs P0 doivent couvrir au minimum individuel et groupe.
- FR-086 — Les tarifs P0 doivent être attachés à des durées précises.
- FR-087 — Le MVP ne doit pas masquer les tarifs par élève.
- FR-088 — Le MVP affiche les prix, mais aucun message de paiement ni paiement intégré.
- FR-088b — Les heures pleines/heures creuses sont hors P0.
- FR-089 — Le coach doit pouvoir donner/rattacher un pack de cours individuels à un élève.
- FR-089b — Un pack de cours individuels doit permettre de suivre au minimum le nombre de cours inclus, utilisés et restants.
- FR-089c — L’élève ne doit pas pouvoir créer, acheter ou s’attribuer lui-même un pack de cours.
- FR-089d — Le coach doit pouvoir marquer une session de pack individuel comme consommée, ce qui décrémente le nombre de cours restants du pack associé.
- FR-089e — Les sessions restantes du pack doivent être visibles sur la fiche élève.

### 8.8 Élèves et Notes Privées

- FR-090 — Le coach doit pouvoir consulter la liste de ses élèves.
- FR-091 — Le coach doit pouvoir ouvrir une fiche élève.
- FR-092 — Le coach doit pouvoir créer une fiche élève manuellement.
- FR-093 — Le coach doit pouvoir ajouter une note privée unique sur un élève.
- FR-094 — Le coach doit pouvoir modifier la note privée unique.
- FR-095 — Une note privée doit être accessible uniquement au coach qui l’a créée.
- FR-096 — Le MVP ne doit pas suivre la progression sportive de l’élève.
- FR-097 — La fiche élève côté coach doit afficher un historique des demandes, cours confirmés, annulations, modifications et packs associés.

### 8.9 App Mobile et Webapp

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

### 8.10 Statistiques Coach

- FR-111 — Le coach doit pouvoir consulter une page légère de statistiques.
- FR-112 — Les statistiques P0 doivent afficher au minimum le nombre de cours effectués.
- FR-113 — Les statistiques P0 doivent afficher le nombre d’heures effectuées.
- FR-114 — Les statistiques P0 doivent afficher un indicateur explicitement libellé `revenu estimé`, calculé à partir des tarifs et heures.
- FR-115 — Les statistiques P0 doivent pouvoir afficher les élèves les plus actifs si les données disponibles le permettent.
- FR-116 — Les statistiques P0 ne doivent pas dépendre d’un paiement intégré.

### 8.11 Notifications In-App

- FR-120 — Le coach doit disposer d’un onglet Notifications.
- FR-121 — L’élève doit disposer d’un onglet Notifications.
- FR-122 — L’onglet Notifications doit lister les notifications liées aux événements importants.
- FR-123 — Une notification in-app doit être créée même si l’utilisateur n’a pas accepté les notifications push système.
- FR-124 — Les notifications in-app doivent permettre de retrouver l’événement concerné si applicable.
- FR-125 — Le système doit distinguer notification in-app et notification push système.
- FR-126 — L’utilisateur doit pouvoir voir les notifications récentes dans l’application.

## 9. Règles Métier

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
- BR-012b — Quand le coach valide une demande sur un créneau, les autres demandes en attente du même créneau doivent être refusées ou expirées selon un traitement explicite côté produit.
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
- BR-033 — Le tarif d’une demande est sélectionné automatiquement à partir du type de cours, de la durée et des tarifs actifs.
- BR-034 — Seul le coach peut attribuer un pack de cours individuels à un élève.
- BR-035 — Un pack de cours individuels ne représente pas un paiement intégré en P0.
- BR-036 — Les heures pleines/heures creuses ne doivent pas être implémentées en P0.

## 10. États et Statuts

### Créneau

- `available`: visible et demandable.
- `pending`: une ou deux demandes envoyées par des élèves, en attente de validation coach.
- `booked`: validé par le coach, non réservable.
- `expired`: demande non traitée sous 7 jours, créneau libéré.
- `cancelled`: réservation annulée en P0 par le coach ou par l’élève.

### Réservation

- `pending`: demande créée et non validée.
- `confirmed`: demande validée par le coach.
- `refused`: demande refusée par le coach.
- `expired`: demande expirée après 7 jours sans action coach.
- `cancelled`: réservation annulée en P0 par le coach ou par l’élève.

### Relation Coach/Élève

- `active`: relation utilisable.
- `inactive`: hors MVP P0, utile pour archivage futur.

## 11. Exigences Non Fonctionnelles

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

## 12. Critères d’Acceptation

### CA-001 — Publication d’un Créneau

Étant donné un coach connecté, quand il crée une plage de disponibilité avec une durée valide, alors le système génère des créneaux disponibles pour ses élèves associés.

### CA-002 — Demande de Créneau

Étant donné un élève associé à un coach, quand il demande un créneau disponible, alors une demande est créée, le créneau passe en attente et le coach la voit comme nouvelle.

### CA-003 — Limite de Demandes par Créneau

Étant donné un créneau sans réservation confirmée, quand deux élèves envoient une demande sur ce même créneau, alors les deux demandes peuvent passer en attente; une troisième demande échoue avec un message clair.

### CA-004 — Mise en Évidence Coach

Étant donné une nouvelle demande, quand le coach ouvre son planning, alors la demande est visuellement mise en évidence comme nouvelle.

### CA-005 — Validation Coach

Étant donné une demande nouvelle, quand le coach la valide, alors elle devient confirmée et apparaît dans le planning coach.

### CA-006 — Refus Coach

Étant donné une demande nouvelle, quand le coach la refuse, alors l’élève voit le refus, le commentaire de refus si renseigné, et le créneau peut redevenir disponible selon les autres demandes en attente.

### CA-007 — Expiration Automatique

Étant donné une demande en attente depuis 7 jours, quand aucune action coach n’a été faite, alors la demande devient expirée et le créneau redevient disponible.

### CA-008 — Notification Push Coach

Étant donné une nouvelle demande, quand elle est créée, alors le coach reçoit une notification push.

### CA-009 — Notification Push Demandeur

Étant donné une demande en attente, quand le coach la valide ou la refuse, alors le demandeur reçoit une notification push.

### CA-010 — Demande Collective Élève

Étant donné un élève connecté, quand il demande un cours collectif, alors il peut sélectionner des joueurs de l’application à associer à la demande.

### CA-011 — Création Collective Coach

Étant donné un coach connecté, quand il crée un cours collectif, alors il peut sélectionner les élèves concernés.

### CA-012 — Tarifs Visibles

Étant donné un coach ayant configuré ses tarifs, quand un élève consulte l’espace du coach, alors les tarifs sont visibles au-dessus de l’agenda avant réservation.

### CA-013 — Gestion des Tarifs

Étant donné un coach connecté, quand il modifie un tarif, alors la nouvelle valeur est visible dans son espace et côté élève.

### CA-014 — Liste Élèves

Étant donné un coach avec des élèves associés, quand il ouvre la section élèves, alors il voit la liste de ses élèves.

### CA-015 — Note Privée

Étant donné un coach sur une fiche élève, quand il ajoute ou modifie la note libre unique, alors cette note est sauvegardée et visible uniquement par ce coach.

### CA-016 — Création Manuelle d’Élève

Étant donné un coach connecté, quand il crée une fiche élève avec nom, téléphone, email, niveau et âge, alors l’élève apparaît dans sa liste.

### CA-017 — Séparation des Rôles

Étant donné un élève connecté, quand il accède à son espace, alors il ne peut pas accéder aux fonctions coach ni aux notes privées.

### CA-018 — Disponibilité App et Webapp

Étant donné les parcours P0, quand ils sont testés sur mobile et webapp, alors chaque parcours critique peut être terminé sur les deux supports.

### CA-019 — Internationalisation Front

Étant donné les écrans P0, quand la langue est changée entre français, anglais et espagnol, alors les libellés principaux s’affichent dans la langue choisie.

### CA-020 — Thèmes et Tokens

Étant donné le front NextPoint, quand le light theme ou le dark theme est actif, alors les couleurs utilisées proviennent des tokens définis dans `design-tokens.md`.

### CA-021 — Demandes Pending dans Planning Coach

Étant donné une demande en attente, quand le coach ouvre son planning, alors la demande apparaît dans le planning avec une couleur distincte ou une surbrillance.

### CA-022 — Statistiques Coach Légères

Étant donné un coach avec des réservations confirmées, quand il ouvre la page statistiques, alors il voit au minimum le nombre de cours, le nombre d’heures et un indicateur explicitement libellé `revenu estimé`.

### CA-023 — Onglet Notifications

Étant donné un coach ou un élève connecté, quand il ouvre l’onglet Notifications, alors il voit la liste de ses notifications in-app récentes.

### CA-024 — Notifications Sans Permission Push

Étant donné un utilisateur qui a refusé les notifications push système, quand un événement important le concerne, alors une notification in-app est quand même créée et visible dans l’onglet Notifications.

### CA-025 — Notification In-App Miroir

Étant donné un événement qui déclenche une notification push, quand la notification push est créée, alors une notification in-app correspondante est aussi créée dans l’onglet Notifications du destinataire.

### CA-026 — Annulation P0

Étant donné une réservation confirmée, quand le coach ou l’élève l’annule, alors la réservation passe en `cancelled`, l’autre partie reçoit une notification push et une notification in-app, et le créneau ou la place est libéré selon le type de cours.

### CA-027 — Modification P0

Étant donné une réservation confirmée, quand le coach ou l’élève initie une modification, alors l’autre partie reçoit une notification push et une notification in-app, et la réservation conserve un statut clair pendant le traitement.

### CA-028 — Agenda Principal Élève

Étant donné un élève connecté, quand il ouvre la page principale, alors l’agenda affiche uniquement les disponibilités demandables et les cours de cet élève.

### CA-029 — Création Cours Individuel Coach

Étant donné un coach connecté, quand il crée un cours individuel, alors il peut sélectionner l’élève, la date, l’heure, la durée, le lieu et le tarif.

### CA-030 — Cours Récurrent Hebdomadaire Coach

Étant donné un coach connecté, quand il crée un cours, alors il peut choisir une récurrence hebdomadaire; un élève ne peut pas créer de demande récurrente.

### CA-031 — Historique Élève Coach

Étant donné un coach connecté sur une fiche élève, quand il consulte le profil, alors il voit l’historique des demandes, cours confirmés, annulations, modifications et packs associés.

### CA-032 — Pack de Cours Individuels

Étant donné un coach connecté sur une fiche élève, quand il rattache un pack de cours individuels, alors le pack affiche le nombre de cours inclus, utilisés et restants.

### CA-033 — Attribution Pack Coach Uniquement

Étant donné un élève connecté, quand il consulte son compte ou ses réservations, alors il ne peut pas créer, acheter ou s’attribuer lui-même un pack de cours individuels.

### CA-034 — Décompte Pack Individuel

Étant donné un élève avec un pack de cours individuels applicable, quand le coach marque une session du pack comme consommée, alors le nombre de sessions restantes du pack est décrémenté.

### CA-035 — Commentaire de Demande

Étant donné un élève qui demande un créneau, quand il ajoute un commentaire libre, alors ce commentaire est visible dans le détail de la demande côté coach.

### CA-036 — Tarif Automatique

Étant donné un élève qui demande un cours individuel ou collectif, quand le type et la durée sont connus, alors le tarif applicable est sélectionné automatiquement.

## 13. Évolutions P1 Validées

### P0-EXT — Annulation et Modification

Le coach et/ou l’élève doivent pouvoir annuler ou modifier une réservation confirmée en P0. L’élève peut annuler jusqu’à l’heure du cours, car le MVP ne gère pas le paiement et laisse l’arrangement opérationnel à la discrétion du coach et de l’élève.

Règles P0:
- l’élève peut annuler jusqu’à l’heure de début du cours;
- le coach peut annuler une réservation;
- le coach ou l’élève peut initier une modification selon un workflow à préciser;
- une annulation libère la place ou le créneau selon le type de cours;
- pour un cours collectif, une annulation peut créer une place disponible;
- la partie qui n’a pas initié l’action reçoit une notification push et une notification in-app.

### P1-002 — Notifications Push Avancées

Le P0 couvre la notification push coach pour nouvelle demande, les notifications de validation/refus, et les notifications d’annulation/modification avec notification in-app miroir. Le P1 doit étendre les notifications aux places disponibles et aux règles avancées paramétrables.

Règles P1:
- les notifications d’annulation/modification sont déjà P0;
- les notifications in-app miroir sont déjà P0;
- le P1 ajoute les notifications paramétrables de place disponible;
- si une place se libère sur un cours collectif, les élèves abonnés à ce type d’alerte peuvent recevoir une notification push;
- toute notification push P1 doit aussi créer une notification in-app;
- l’élève peut activer/désactiver dans son compte une notification push lorsqu’une place se libère sur un cours collectif;
- les notifications de place disponible sont conditionnées au paramètre du compte élève.

### P1-003 — Connexion Google Agenda

Le coach et l’élève doivent pouvoir connecter Google Agenda afin de synchroniser les réservations confirmées, si l’intégration est disponible côté compte.

Règles P1:
- lorsqu’une demande est validée, la réservation confirmée peut être ajoutée au Google Agenda du coach si connecté;
- lorsqu’une demande est validée, la réservation confirmée peut être ajoutée au Google Agenda de l’élève si connecté;
- une annulation ou modification doit mettre à jour l’événement calendrier correspondant si l’événement a été créé par NextPoint;
- l’intégration doit gérer le cas où seul le coach, seul l’élève, les deux, ou aucun compte Google Agenda sont connectés.

### P1-004 — Messagerie sur Réservation

Le coach et l’élève doivent pouvoir échanger des messages contextualisés sur une réservation précise. Cette messagerie ne remplace pas une messagerie générale.

### P1-005 — Horizon de Visibilité des Disponibilités

Le coach doit pouvoir choisir jusqu’où les élèves peuvent voir ses disponibilités. Options: 1 semaine, 2 semaines, 3 semaines, 1 mois, 2 mois, 3 mois ou non défini (`pas set`, toutes les disponibilités visibles).

### P1-006 — Écran Coach de Messageries

Le coach doit disposer d’un écran regroupant les conversations liées aux créneaux, réservations et événements afin d’éviter de devoir ouvrir chaque réservation une par une.

### V2-001 — Génération de Facture

Le système doit permettre de générer une facture à partir d’une réservation, d’un pack ou d’une période d’activité. Cette capacité est V2 et reste hors P0/P1.

## 14. Inventaire UX Initial

Référence détaillée: `_bmad-output/planning-artifacts/ux-screen-inventory.md`.
Tokens de design: `_bmad-output/planning-artifacts/design-tokens.md`.

### Élève P0

- Page publique avant inscription: présentation coach, tarifs uniquement, bouton principal `S’inscrire`.
- Inscription / connexion.
- Accueil élève: disponibilités demandables du coach unique, cours de cet élève dans l’agenda hebdomadaire par défaut, tarifs individuels/collectifs au-dessus de l’agenda.
- Détail créneau / demande: date, heure, durée, lieu, tarif automatique, commentaire libre, demande de validation coach.
- Planning élève / demandes: page unique avec filtres, demandes en attente, confirmées, refusées et expirées.
- Notifications élève: historique in-app des notifications.
- Compte élève: nom, téléphone, email, niveau, âge, langue.

### Coach P0

- Accueil coach / planning: vue semaine prioritaire, vue jour secondaire.
- Demandes `pending` affichées directement dans le planning avec couleur distincte ou surbrillance, jusqu’à 2 demandes par créneau.
- Gestion disponibilités: plages, récurrence, durée 1h/1h30, lieu, créneaux générés, cours récurrent hebdomadaire coach.
- Élèves / recherche: liste, recherche par nom, filtres niveau/âge.
- Fiche élève: profil, historique des cours/demandes/annulations/modifications/packs, note privée unique.
- Statistiques coach légères: cours, heures, revenu estimé, élèves les plus actifs si possible.
- Notifications coach: historique in-app des notifications.
- Profil coach / paramètres.
- Gestion tarifs: écran dédié, tarifs individuels/collectifs attachés à une durée, prix, activation.
- Messageries coach P1: regroupement des conversations liées aux créneaux/réservations/événements.

### Écrans à Clarifier

- Statistiques élève: suspendu, plutôt P2 si la valeur produit devient claire.

## 15. Données Conceptuelles

### `User`

- identifiant;
- email ou identifiant de connexion;
- rôle;
- date de création.

### `CoachProfile`

- utilisateur lié;
- nom affiché;
- description courte;
- informations de contact ou réservation visibles selon choix produit;
- code/lien d’invitation futur, hors P0.

### `StudentProfile`

- utilisateur lié;
- nom;
- téléphone;
- email;
- niveau;
- âge.

### `CoachStudentRelation`

- coach;
- élève;
- statut;
- date d’association.

### `AvailabilitySlot`

- coach;
- plage de disponibilité source;
- date;
- heure de début;
- heure de fin;
- durée;
- lieu/club;
- statut;
- réservation liée si réservé;
- nombre de demandes en attente associées.

### `AvailabilityRange`

- coach;
- date ou règle de récurrence;
- heure de début;
- heure de fin;
- durée de créneau généré;
- lieu/club;
- statut.

### `Booking`

- coach;
- élève;
- créneau;
- type: individuel ou collectif;
- statut;
- récurrence hebdomadaire si créée par le coach;
- indicateur de demande nouvelle;
- date de création;
- date d’expiration;
- date d’annulation si applicable;
- date de modification si applicable;
- commentaire élève si fourni;
- commentaire de refus coach si fourni;
- tarif appliqué.

### `GroupBookingParticipant`

- réservation collective liée;
- élève participant;
- statut de participation.

### `StudentLessonPack`

- coach;
- élève;
- type: cours individuel;
- nombre de cours inclus;
- nombre de cours utilisés;
- nombre de cours restants;
- attribution par le coach;
- statut.

### `MessageThread`

- réservation, créneau ou événement lié;
- participants;
- dernier message;
- statut lu/non lu;
- date de dernière activité.

### `Invoice`

- réservation, pack ou période liée;
- destinataire;
- montant;
- statut;
- date de génération;
- statut produit: V2.

### `Pricing`

- coach;
- libellé;
- prix;
- devise;
- durée;
- type: individuel ou groupe;
- statut actif/inactif.

### `StudentNote`

- coach;
- élève;
- contenu;
- date de modification.

### `PushNotification`

- destinataire;
- demande/réservation liée;
- type;
- statut d’envoi;
- date de création.

### `InAppNotification`

- destinataire;
- type;
- titre;
- contenu court;
- événement lié;
- statut lu/non lu;
- date de création.

## 16. Matrice de Permissions

| Action | Coach | Élève |
| --- | --- | --- |
| Modifier son profil | Oui | Oui |
| Créer des disponibilités | Oui | Non |
| Voir les disponibilités d’un coach associé | Oui | Oui |
| Demander un créneau | Non | Oui |
| Demander un cours collectif | Non | Oui |
| Demander un cours récurrent | Non | Non |
| Créer un cours individuel | Oui | Non |
| Créer un cours récurrent hebdomadaire | Oui | Non |
| Créer un cours collectif | Oui | Non |
| Valider/refuser une demande | Oui | Non |
| Recevoir une notification push de nouvelle demande | Oui | Non |
| Recevoir une notification push de validation/refus | Non | Oui |
| Voir son onglet Notifications | Oui | Oui |
| Voir les nouvelles réservations coach | Oui | Non |
| Gérer les tarifs coach | Oui | Non |
| Voir les tarifs coach | Oui | Oui |
| Voir la liste élèves du coach | Oui | Non |
| Créer une fiche élève manuelle | Oui | Non |
| Créer une note privée | Oui | Non |
| Voir une note privée coach | Oui, propriétaire uniquement | Non |
| Voir l’historique d’un élève | Oui | Non |
| Gérer un pack de cours individuels élève | Oui | Non |

## 17. Mesure du Succès

### Métriques Produit MVP

- Taux de coachs qui créent au moins un créneau après inscription.
- Taux d’élèves qui envoient une demande après avoir ouvert l’espace coach.
- Temps médian entre ouverture de l’espace coach et envoi d’une demande.
- Temps médian de validation/refus par le coach.
- Nombre de réservations créées sans échange manuel.
- Taux d’erreurs ou conflits de réservation.
- Taux de demandes expirées après 7 jours.

### Signaux Qualitatifs

- Les coachs comprennent immédiatement les nouvelles demandes.
- Les élèves comprennent quel créneau est disponible.
- Les coachs trouvent la gestion des disponibilités moins pénible qu’un échange par message.

## 18. Risques et Contremesures

| Risque | Impact | Contremesure MVP |
| --- | --- | --- |
| Gestion de disponibilités trop lente pour le coach | Adoption faible | Créer des plages générant des créneaux et supporter la récurrence |
| Élève confus sur les disponibilités | Réservations faibles | UX mobile claire avec créneaux disponibles seulement |
| Double demande/réservation | Perte de confiance | Transaction atomique et contrainte d’unicité |
| Nouvelles demandes manquées | Produit inutile côté coach | Notification push coach + demandes `pending` visibles directement dans le planning |
| Notes privées exposées | Risque confidentialité | Contrôle d’accès strict et tests dédiés |
| MVP trop large | Retard et dette | Exclure paiement, marketplace, club, messagerie générale |
| Récurrence mal cadrée | Créneaux incorrects | Limiter les options de récurrence P0 et les tester explicitement |
| Internationalisation oubliée | Dette front rapide | Externaliser tous les libellés dès le départ |

## 19. Questions Ouvertes à Trancher

Ces décisions doivent être validées avant UX détaillée et architecture.

Toutes les décisions bloquantes identifiées pour le PRD sont tranchées.

## 20. Décisions Recommandées

Pour garder le MVP livrable:

- associer directement tous les élèves au coach unique en P0;
- garder le lien/code d’invitation coach pour une évolution future;
- faire valider chaque demande par le coach;
- autoriser jusqu’à 2 demandes en attente par créneau, puis bloquer à la confirmation;
- faire expirer une demande après 7 jours;
- générer les créneaux depuis des plages de disponibilité;
- inclure les récurrences ponctuelle, quotidienne et hebdomadaire en P0;
- utiliser `demande envoyée` comme libellé élève après demande;
- utiliser 1h30 comme durée par défaut, avec 1h disponible;
- inclure une liste simple de lieux avec `Les Bruyères Centre Sportif` comme première valeur;
- activer les notifications push coach pour nouvelle demande en P0;
- utiliser un planning coach avec vue semaine prioritaire, vue jour secondaire et bouton de switch;
- valider/refuser les demandes depuis l’écran de détail;
- libeller explicitement l’indicateur stats `revenu estimé`;
- inclure annulation/modification en P0;
- créer systématiquement une notification in-app pour chaque notification push;
- reporter Google Agenda en P1;
- reporter la messagerie liée à une réservation et l’écran coach de messageries en P1;
- reporter la génération de facture en V2;
- garder les statistiques coach en P0 dans une version légère;
- permettre plusieurs lignes tarifaires avec libellé, prix, durée et type;
- préparer l’interface en français, anglais et espagnol.

## 21. Découpage Fonctionnel Préliminaire

### Epic 1 — Authentification et Rôles

Créer les comptes coach/élève et sécuriser les accès.

### Epic 2 — Profil Coach, Tarifs, Élèves et Invitation

Permettre au coach de publier les informations nécessaires à la réservation, gérer ses tarifs, créer des fiches élèves, consulter l’historique élève et suivre les packs de cours individuels.

### Epic 3 — Disponibilités, Récurrence et Demandes

Permettre la création de plages, la génération de créneaux, la récurrence coach hebdomadaire, la demande élève avec maximum 2 demandes par créneau et la validation/refus coach sans double réservation confirmée.

### Epic 4 — Tableau de Bord Coach et Push

Mettre en évidence les nouvelles demandes dans le planning, notifier le coach par push et permettre leur traitement.

### Epic 5 — Élèves et Notes Privées

Permettre au coach de consulter ses élèves et conserver des notes privées.

### Epic 6 — Webapp et Cohérence Multi-Support

Garantir que les parcours P0 fonctionnent sur app mobile et webapp.

### Epic 7 — Internationalisation Front

Préparer les libellés et écrans pour français, anglais et espagnol.

### Epic 8 — Statistiques Coach Légères

Afficher les indicateurs P0 utiles au coach sans créer une page analytique lourde.

### Epic 9 — Centre de Notifications In-App

Lister les notifications importantes pour coach et élève, indépendamment de l’autorisation push système.

## 22. Prochaine Étape BMAD

1. Valider ou corriger les décisions ouvertes du PRD.
2. Lancer `bmad-ux` pour définir les écrans mobile-first.
3. Lancer `bmad-create-architecture` après validation UX et décisions produit.
4. Créer les epics/stories à partir du découpage fonctionnel.
