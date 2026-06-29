---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-screen-inventory.md
workflowType: 'epics-and-stories'
lastStep: 3
status: 'complete'
completedAt: '2026-06-08'
project_name: 'NextPoint'
user_name: 'Flo'
date: '2026-06-07'
---

# NextPoint - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for NextPoint, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

- FR-001: Le système doit permettre à un utilisateur de créer un compte.
- FR-002: Le système doit permettre à un utilisateur de se connecter et se déconnecter.
- FR-003: Le système doit distinguer les rôles `coach` et `élève`.
- FR-004: Un compte coach doit accéder aux fonctions coach.
- FR-005: Un compte élève doit accéder aux fonctions élève.
- FR-006: Un utilisateur ne doit pas accéder aux données privées d’un autre utilisateur sans relation autorisée.
- FR-007: Le MVP doit supporter un seul coach désigné comme contexte principal de réservation.
- FR-010: Le coach doit pouvoir créer et modifier son profil.
- FR-011: Le profil coach doit exposer les informations nécessaires à la réservation.
- FR-012: En P0, le coach n’a pas besoin de partager un lien/code pour associer un élève.
- FR-013: Le coach doit pouvoir voir les élèves associés à son profil.
- FR-014: Le coach doit pouvoir créer une fiche et provisionner un compte élève non activé.
- FR-014a: La création est refusée si email ou téléphone normalisé existe déjà.
- FR-014b: Le compte élève utilise les états `pending_activation`, `active`, `suspended`, `deleted`.
- FR-020: L’élève doit pouvoir créer et modifier son profil.
- FR-021: En P0, l’élève doit être automatiquement associé au coach unique de l’application.
- FR-022: L’élève doit pouvoir consulter ses réservations.
- FR-023: L’élève ne doit pas voir les notes privées du coach.
- FR-024: Le profil élève doit contenir au minimum nom, téléphone, email, niveau et âge; le niveau padel utilise une liste fermée de 1 à 10.
- FR-025: L’élève doit voir le statut de chaque demande: en attente, confirmé, refusé ou expiré.
- FR-030: Le système doit créer une relation coach/élève lorsqu’un élève rejoint un coach.
- FR-031: Le coach doit voir uniquement ses élèves associés.
- FR-032: L’élève doit être associé à un seul coach en P0.
- FR-033: La relation doit permettre au coach de consulter les réservations et notes liées à l’élève.
- FR-034: Le coach peut générer/régénérer un lien d’activation de 24 heures pour un compte `pending_activation`.
- FR-034a: La régénération invalide l’ancien lien et chaque lien est à usage unique.
- FR-034b: Le lien permet à l’élève de définir son mot de passe et d’activer son compte.
- FR-040: Le coach doit pouvoir créer une plage de disponibilité avec date, heure de début, heure de fin, durée de créneau et lieu/club.
- FR-041: Le système doit générer des créneaux à partir d’une plage de disponibilité.
- FR-042: Le coach doit pouvoir choisir une durée de créneau parmi 1h et 1h30.
- FR-043: Le coach doit pouvoir choisir une récurrence de disponibilité parmi ponctuelle, quotidienne ou hebdomadaire.
- FR-044: Le coach doit pouvoir modifier une plage ou un créneau sans demande active ni réservation confirmée.
- FR-045: Le coach doit pouvoir supprimer une plage ou un créneau sans demande active ni réservation confirmée.
- FR-046: L’élève doit voir uniquement les créneaux disponibles et demandables, ainsi que ses propres cours sur l’agenda de la page principale.
- FR-047: Le lieu/club doit être visible dans le détail du créneau.
- FR-048: Le système doit fournir une liste simple de lieux/clubs, avec `Les Bruyères Centre Sportif` comme valeur initiale.
- FR-049: Un créneau avec une réservation confirmée ne doit plus être proposé comme disponible.
- FR-050: Le système doit refuser une demande si le créneau n’est plus disponible ou s’il a déjà 2 demandes en attente.
- FR-051: Le coach doit pouvoir consulter ses créneaux à venir.
- FR-060: L’élève doit pouvoir demander un créneau disponible.
- FR-061: Le système doit créer une demande liée au coach, à l’élève et au créneau.
- FR-062: Le système doit confirmer à l’élève que la demande a été envoyée.
- FR-063: Le coach doit voir la demande dans son planning.
- FR-064: Une nouvelle demande doit avoir un état visible `nouveau`.
- FR-065: Le coach doit recevoir une notification push lors d’une nouvelle demande.
- FR-066: Le coach doit pouvoir valider une demande depuis l’écran de détail de la demande.
- FR-067: Le coach doit pouvoir refuser une demande depuis l’écran de détail de la demande, sans proposer d’autre créneau et sans confirmation supplémentaire.
- FR-067b: Le coach doit pouvoir ajouter un commentaire optionnel lors d’un refus.
- FR-068: Le système doit empêcher plus de 2 demandes en attente ou plus d’une réservation confirmée sur le même créneau.
- FR-069: Le détail d’une demande/réservation doit afficher au minimum l’élève, la date, l’heure, le lieu et le statut.
- FR-070: L’élève doit voir le statut de sa demande: en attente, confirmée, refusée ou expirée.
- FR-071: Une demande en attente doit expirer automatiquement après 7 jours.
- FR-072: Un élève ne doit pas pouvoir avoir plus de 10 demandes en attente (`pending`) auprès du coach.
- FR-072b: Un même créneau ne doit pas pouvoir avoir plus de 2 demandes en attente (`pending`).
- FR-073: Quand le coach valide une demande, le demandeur doit recevoir une notification push.
- FR-074: Quand le coach refuse une demande, le demandeur doit recevoir une notification push.
- FR-074b: Si le coach saisit un commentaire de refus, ce commentaire doit être visible dans la notification et le détail de la demande côté élève.
- FR-075: L’élève doit pouvoir demander un cours collectif.
- FR-076: Lors d’une demande de cours collectif, l’élève doit pouvoir sélectionner des joueurs de l’application.
- FR-077: Le coach doit pouvoir créer un cours collectif en sélectionnant des élèves de l’application.
- FR-078: Une réservation collective doit conserver la liste des participants.
- FR-079: Le coach doit pouvoir créer un cours individuel lié à un élève, une date, une heure, une durée, un lieu et un tarif.
- FR-079a: Le coach doit pouvoir créer un cours individuel récurrent hebdomadaire.
- FR-079a-2: L’élève ne doit pas pouvoir créer de demande de cours récurrente.
- FR-079b: Le coach doit pouvoir annuler ou modifier une réservation confirmée en P0; l’élève doit pouvoir annuler une réservation confirmée mais ne doit pas voir d’action de modification.
- FR-079c: L’élève doit pouvoir annuler une réservation jusqu’à l’heure de début du cours.
- FR-079d: Lorsqu’une annulation est initiée par le coach ou l’élève, ou lorsqu’une modification est initiée par le coach, l’autre partie doit recevoir une notification push et une notification in-app.
- FR-080: Le coach doit pouvoir créer plusieurs tarifs.
- FR-081: Le coach doit pouvoir modifier un tarif.
- FR-082: Le coach doit pouvoir désactiver ou supprimer un tarif.
- FR-083: L’élève doit voir les tarifs publiés du coach avant de demander un créneau.
- FR-084: Un tarif doit contenir au minimum un libellé, un prix, une durée, un type et, si nécessaire, des critères d’applicabilité définis par le coach.
- FR-085: Les types de tarifs P0 doivent couvrir au minimum individuel et groupe.
- FR-086: Les tarifs P0 doivent être attachés à des durées précises et peuvent cibler certains élèves ou contextes, par exemple tarif étudiant, tarif senior, week-end ou jour férié.
- FR-087: Le MVP ne doit pas masquer les tarifs par élève.
- FR-088: Le MVP affiche les prix, mais aucun message de paiement ni paiement intégré.
- FR-088b: Les heures pleines/heures creuses sont hors P0.
- FR-089: Le coach doit pouvoir donner/rattacher un pack de cours individuels à un élève.
- FR-089b: Un pack de cours individuels doit permettre de suivre au minimum le nombre de cours inclus, utilisés et restants.
- FR-089c: L’élève ne doit pas pouvoir créer, acheter ou s’attribuer lui-même un pack de cours.
- FR-089d: Le coach doit pouvoir marquer une session de pack individuel comme consommée, ce qui décrémente le nombre de cours restants du pack associé.
- FR-089e: Les sessions restantes du pack doivent être visibles sur la fiche élève.
- FR-090: Le coach doit pouvoir consulter la liste de ses élèves.
- FR-091: Le coach doit pouvoir ouvrir une fiche élève.
- FR-092: Le coach doit pouvoir créer une fiche élève manuellement.
- FR-093: Le coach doit pouvoir ajouter une note privée unique sur un élève.
- FR-094: Le coach doit pouvoir modifier la note privée unique.
- FR-095: Une note privée doit être accessible uniquement au coach qui l’a créée.
- FR-096: Le MVP ne doit pas suivre la progression sportive de l’élève.
- FR-097: La fiche élève côté coach doit afficher un historique des demandes, cours confirmés, annulations, modifications et packs associés.
- FR-100: Les parcours P0 doivent être disponibles sur app mobile.
- FR-101: Les parcours P0 doivent être disponibles sur webapp.
- FR-102: Les données affichées dans l’app et la webapp doivent être synchronisées.
- FR-103: Le design des parcours doit prioriser l’usage téléphone.
- FR-104: L’interface doit supporter français, anglais et espagnol.
- FR-105: Les textes front doivent être externalisés pour permettre un changement de langue simple.
- FR-106: Le front doit utiliser les tokens de design définis dans `design-tokens.md`.
- FR-107: Le front doit supporter un light theme et un dark theme cohérents avec l’identité Roland-Garros premium.
- FR-108: Les couleurs ne doivent pas être codées en dur dans les composants.
- FR-109: Le planning coach doit proposer une vue semaine prioritaire/par défaut et une vue jour secondaire.
- FR-110: Le planning coach doit permettre de changer de vue via un bouton de switch semaine/jour.
- FR-111: Le coach doit pouvoir consulter une page légère de statistiques.
- FR-112: Les statistiques P0 doivent afficher au minimum le nombre de cours effectués.
- FR-113: Les statistiques P0 doivent afficher le nombre d’heures effectuées.
- FR-114: Les statistiques P0 doivent afficher un indicateur explicitement libellé `revenu estimé`, calculé à partir des tarifs et heures.
- FR-115: Les statistiques P0 doivent pouvoir afficher les élèves les plus actifs si les données disponibles le permettent.
- FR-116: Les statistiques P0 ne doivent pas dépendre d’un paiement intégré.
- FR-120: Le coach doit disposer d’un onglet Notifications.
- FR-121: L’élève doit disposer d’un onglet Notifications.
- FR-122: L’onglet Notifications doit lister les notifications liées aux événements importants.
- FR-123: Une notification in-app doit être créée même si l’utilisateur n’a pas accepté les notifications push système.
- FR-124: Les notifications in-app doivent permettre de retrouver l’événement concerné si applicable.
- FR-125: Le système doit distinguer notification in-app et notification push système.
- FR-126: L’utilisateur doit pouvoir voir les notifications récentes dans l’application.
- FR-127: Le coach doit disposer en P0 d’un onglet Messagerie listant les discussions liées aux créneaux, demandes, réservations ou événements.
- FR-128: Le coach doit pouvoir répondre dans une discussion liée à un créneau, une demande, une réservation ou un événement.

### NonFunctional Requirements

- NFR-001: Mobile-first: les parcours P0 doivent être utilisables confortablement sur téléphone.
- NFR-002: Performance: les écrans critiques doivent charger rapidement sur connexion mobile standard.
- NFR-003: Intégrité: la réservation doit être atomique pour éviter les doubles bookings.
- NFR-004: Sécurité: les rôles et relations doivent contrôler l’accès aux données.
- NFR-005: Confidentialité: les notes privées ne doivent jamais être exposées à l’élève.
- NFR-006: Maintenabilité: le MVP doit rester simple, sans logique marketplace ou club.
- NFR-007: Clarté UX: une erreur de réservation doit expliquer que le créneau n’est plus disponible.
- NFR-008: Cohérence: app mobile et webapp doivent utiliser la même source de données.
- NFR-009: Internationalisation: les libellés front doivent pouvoir être traduits en français, anglais et espagnol.
- NFR-010: Priorité UX: les décisions d’interface doivent favoriser l’expérience coach, la rapidité de réservation et la simplicité de gestion planning.
- NFR-011: Les statistiques coach P0 doivent rester légères et ne pas ralentir le développement du parcours planning/réservation.
- NFR-012: Design system: l’interface doit limiter le noir pur et le blanc pur, et utiliser les fonds chauds définis dans les tokens.

### Additional Requirements

- Initialiser le projet avec Expo React Native TypeScript via `npx create-expo-app@latest apps/mobile --template default@sdk-56`; cette initialisation doit être la première story d’implémentation.
- Utiliser Expo Router pour les routes mobile/web, avec des groupes de routes par frontière d’accès: public, auth, coach, élève.
- Utiliser Supabase avec PostgreSQL comme source de vérité, Supabase Auth pour l’authentification et Row Level Security pour l’autorisation.
- Implémenter les mutations métier critiques via fonctions serveur transactionnelles, pas via CRUD direct client.
- Créer les commandes serveur `request-booking`, `approve-booking`, `refuse-booking`, `cancel-booking`, `modify-booking` coach-only et `consume-lesson-pack`.
- Garantir côté backend/base de données les invariants de réservation: limite de 2 demandes pending par créneau, une seule réservation confirmée, expiration 7 jours, annulation/modification et conflits.
- Créer systématiquement une notification in-app miroir pour chaque notification push fonctionnelle.
- Protéger les notes privées coach avec RLS et tests dédiés; elles ne doivent jamais être exposées aux élèves.
- Utiliser TanStack Query pour le server state côté client, React Hook Form et Zod pour les formulaires et validations.
- Externaliser les contrats partagés et schémas Zod dans `packages/shared/src/contracts`.
- Respecter le format de réponse Edge Function `{ ok: true, data }` ou `{ ok: false, error: { code, message, fieldErrors?, retryable? } }`.
- Utiliser des dates/heures API en ISO 8601 UTC; gérer le fuseau horaire local uniquement à la frontière UI.
- Représenter les montants en unités mineures et devise, par exemple `{ amountCents: 4500, currency: "EUR" }`.
- Utiliser `snake_case` en base de données, `camelCase` dans les contrats TypeScript, et des helpers typés pour le mapping.
- Organiser le code en monorepo avec `apps/mobile`, `packages/shared` et `supabase`.
- Placer les migrations dans `supabase/migrations`, les Edge Functions dans `supabase/functions/{command-name}`, les tests RLS/booking dans `supabase/tests`.
- Mettre en place une CI légère avec lint, typecheck et tests.
- Prévoir Supabase Cloud, Expo/EAS, Expo Web et Vercel Hobby ou équivalent comme infrastructure compatible free tier.
- Ajouter ou maintenir une documentation repo pour les commandes API, le modèle de données, les groupes de routes Expo Router et le fonctionnement de développement.
- Ajouter des tests pour les conflits de réservation, l’expiration, les limites pending, les politiques RLS et la confidentialité des notes privées.
- Garder le P0 online-first; les mutations de réservation doivent nécessiter le réseau.
- Utiliser Supabase Realtime seulement de manière sélective pour planning coach, badges notifications ou états de réservation lorsque la valeur UX est claire.
- Sélectionner ultérieurement le fournisseur de push notification au moment de l’implémentation notifications.
- Produire un modèle de base de données détaillé et des politiques RLS exactes pendant les stories de setup Supabase.

### UX Design Requirements

- UX-DR1: La page publique avant inscription doit présenter le coach, afficher seulement les tarifs et proposer le bouton principal `S’inscrire`, sans afficher les disponibilités.
- UX-DR2: L’inscription/connexion élève doit collecter le profil minimal: nom, téléphone, email, niveau et âge.
- UX-DR3: L’accueil élève doit afficher un agenda hebdomadaire par défaut, avec bascule jour, contenant uniquement les disponibilités demandables et les cours de l’élève connecté.
- UX-DR4: L’accueil élève doit afficher les tarifs individuels et collectifs au-dessus de l’agenda dans une bannière ou zone de tarifs visible.
- UX-DR5: Le détail créneau/demande élève doit afficher date, heure, durée, lieu, tarif applicable automatiquement, message de validation coach nécessaire et champ commentaire libre.
- UX-DR6: Le détail créneau/demande doit permettre à l’élève de demander un cours collectif et de sélectionner des joueurs de l’application.
- UX-DR7: Si un pack de cours individuels applicable existe, l’interface élève doit afficher l’impact sur les sessions restantes.
- UX-DR8: Le planning élève doit regrouper demandes et réservations sur une seule page avec filtres, couvrant états en attente, confirmé, refusé, expiré, annulé ou modifié.
- UX-DR9: Le compte élève doit permettre de gérer nom, téléphone, email, niveau, âge et langue préférée.
- UX-DR10: L’onglet Notifications élève doit lister les notifications in-app, état lu/non lu et lien vers l’événement concerné, même si les notifications push système sont refusées.
- UX-DR11: Le planning coach doit être l’accueil coach, avec vue semaine prioritaire/par défaut, bascule jour, créneaux disponibles, réservations confirmées et demandes pending visibles directement.
- UX-DR12: Les demandes pending dans le planning coach doivent utiliser une couleur distincte ou une surbrillance et un indicateur de nouvelles demandes.
- UX-DR13: Le détail demande coach doit afficher élève, date/heure, durée, lieu, tarif, badge nouveau, temps restant avant expiration 7 jours, actions valider/refuser et champ commentaire optionnel en cas de refus.
- UX-DR14: Le refus coach ne doit pas demander de confirmation supplémentaire; si un commentaire est saisi, il doit être repris dans la notification élève.
- UX-DR15: La gestion des disponibilités doit être un écran dédié permettant de créer une plage, choisir date ou récurrence, heure début/fin, durée 1h ou 1h30, lieu, activation de récurrence et visualisation des créneaux générés.
- UX-DR16: La gestion disponibilités doit permettre au coach de créer un cours individuel, un cours individuel récurrent hebdomadaire et un cours collectif en sélectionnant les élèves concernés.
- UX-DR17: La création de cours individuel coach doit demander élève, date/heure, durée 1h ou 1h30, lieu, tarif applicable et option de récurrence hebdomadaire; le cours créé directement par le coach est `confirmed` par défaut.
- UX-DR18: La liste élèves coach doit proposer recherche par nom, filtre par niveau, filtre par tranche d’âge, création manuelle d’élève et accès fiche élève.
- UX-DR19: Les filtres d’âge coach doivent supporter des tranches enfants de 2 ans à partir de 5 ans et des tranches adultes par dizaines.
- UX-DR20: Le niveau élève doit utiliser une liste fermée de niveaux padel de 1 à 10.
- UX-DR21: La fiche élève coach doit afficher profil, note privée unique, historique demandes/réservations/annulations/modifications/packs, pack de cours individuels, action de consommation de pack, téléphone et email cliquables.
- UX-DR22: La note privée élève ne doit pas être en autosave; elle doit se modifier via `Modifier` puis se sauvegarder via `Enregistrer`.
- UX-DR23: Le profil coach/paramètres doit contenir informations du compte, langue, accès gestion tarifs, accès gestion disponibilités et paramètres de notification push.
- UX-DR24: La gestion tarifs doit être un écran dédié permettant tarifs individuels, tarifs collectifs, durée 1h/1h30, prix, activation/désactivation, suppression et critères d’applicabilité définis par le coach.
- UX-DR25: L’onglet Notifications coach doit lister nouvelles demandes, annulations initiées par l’élève, événements de réservation, état lu/non lu et lien vers l’événement concerné.
- UX-DR26: Les statistiques coach P0 doivent afficher une version légère avec nombre de cours, nombre d’heures, `revenu estimé`, élèves les plus actifs si possible, et périodes mois prioritaire, trimestre/année utiles, semaine secondaire.
- UX-DR27: L’annulation/modification de réservation P0 doit permettre au coach d’annuler ou modifier une réservation confirmée, et à l’élève d’annuler une réservation confirmée sans action de modification. L’autre partie doit être notifiée en push et in-app.
- UX-DR28: La navigation mobile élève P0 doit contenir Accueil, Planning/Demandes, Notifications et Compte.
- UX-DR29: La navigation mobile coach P0 doit contenir Planning, Disponibilités, Élèves, Stats, Notifications, Messagerie et Profil.
- UX-DR30: L’interface doit appliquer l’identité Roland-Garros premium avec terre battue, ocre, vert profond, fonds chauds et tokens de référence définis dans `design-tokens.md`.
- UX-DR31: Le design doit prioriser le téléphone tout en gardant une webapp fonctionnelle pour les parcours P0.
- UX-DR32: La modification d’une récurrence coach s’applique d’abord à l’occurrence sélectionnée; si la modification peut être appliquée à la série, une popup doit demander au coach s’il veut appliquer la modification à la récurrence.
- UX-DR33: L’onglet Messagerie coach P0 doit lister les discussions liées aux créneaux, demandes, réservations ou événements, et permettre au coach de répondre.

### FR Coverage Map

- FR-001: Epic 1 - Création de compte.
- FR-002: Epic 1 - Connexion et déconnexion.
- FR-003: Epic 1 - Distinction des rôles coach/élève.
- FR-004: Epic 1 - Accès aux fonctions coach.
- FR-005: Epic 1 - Accès aux fonctions élève.
- FR-006: Epic 1 - Protection des données privées par relation autorisée.
- FR-007: Epic 1 - Contexte MVP single-coach.
- FR-010: Epic 1 - Création et modification du profil coach.
- FR-011: Epic 1 - Informations coach nécessaires à la réservation.
- FR-012: Epic 1 - Absence de lien/code coach en P0.
- FR-013: Epic 1 - Vue des élèves associés depuis le profil coach.
- FR-014: Epic 2 - Création de fiche élève par le coach sans compte élève préalable.
- FR-020: Epic 1 - Création et modification du profil élève.
- FR-021: Epic 1 - Association automatique au coach unique.
- FR-022: Epic 4 - Consultation des réservations élève.
- FR-023: Epic 2 - Non-exposition des notes privées coach à l’élève.
- FR-024: Epic 1 - Champs minimaux du profil élève.
- FR-025: Epic 4 - Statuts visibles des demandes côté élève.
- FR-030: Epic 1 - Création de relation coach/élève.
- FR-031: Epic 2 - Liste limitée aux élèves associés du coach.
- FR-032: Epic 1 - Association à un seul coach en P0.
- FR-033: Epic 2 - Consultation coach des réservations et notes liées à l’élève.
- FR-034: Epic 1 - Invitation coach repoussée hors P0.
- FR-040: Epic 3 - Création de plage de disponibilité.
- FR-041: Epic 3 - Génération de créneaux depuis une plage.
- FR-042: Epic 3 - Durées 1h et 1h30.
- FR-043: Epic 3 - Récurrences ponctuelle, quotidienne ou hebdomadaire.
- FR-044: Epic 3 - Modification d’une plage ou d’un créneau sans demande active ni réservation confirmée.
- FR-045: Epic 3 - Suppression d’une plage ou d’un créneau sans demande active ni réservation confirmée.
- FR-046: Epic 3 - Agenda élève limité aux créneaux demandables et à ses cours.
- FR-047: Epic 3 - Lieu visible dans le détail du créneau.
- FR-048: Epic 3 - Liste simple de lieux avec valeur initiale.
- FR-049: Epic 3 - Créneau confirmé non proposé comme disponible.
- FR-050: Epic 4 - Refus de demande si créneau indisponible ou limite pending atteinte.
- FR-051: Epic 3 - Consultation des créneaux à venir par le coach.
- FR-060: Epic 4 - Demande de créneau disponible par l’élève.
- FR-061: Epic 4 - Création de demande liée coach/élève/créneau.
- FR-062: Epic 4 - Confirmation d’envoi de demande à l’élève.
- FR-063: Epic 4 - Demande visible dans le planning coach.
- FR-064: Epic 4 - État visible `nouveau` sur nouvelle demande.
- FR-065: Epic 5 - Notification push coach lors d’une nouvelle demande.
- FR-066: Epic 4 - Validation depuis le détail de demande.
- FR-067: Epic 4 - Refus depuis le détail sans autre créneau ni confirmation.
- FR-067b: Epic 4 - Commentaire optionnel de refus.
- FR-068: Epic 4 - Limites de demandes pending et réservation confirmée unique.
- FR-069: Epic 4 - Détail demande/réservation complet.
- FR-070: Epic 4 - Statut demande visible côté élève.
- FR-071: Epic 4 - Expiration automatique après 7 jours.
- FR-072: Epic 4 - Limite de 10 demandes pending par élève.
- FR-072b: Epic 4 - Limite de 2 demandes pending par créneau.
- FR-073: Epic 5 - Notification push demandeur après validation.
- FR-074: Epic 5 - Notification push demandeur après refus.
- FR-074b: Epic 5 - Commentaire de refus visible dans notification et détail côté élève.
- FR-075: Epic 4 - Demande de cours collectif par l’élève.
- FR-076: Epic 4 - Sélection de joueurs pour demande collective.
- FR-077: Epic 4 - Création de cours collectif par le coach.
- FR-078: Epic 4 - Conservation des participants d’une réservation collective.
- FR-079: Epic 4 - Création de cours individuel par le coach.
- FR-079a: Epic 4 - Création de cours individuel récurrent hebdomadaire.
- FR-079a-2: Epic 4 - Interdiction de demande récurrente élève.
- FR-079b: Epic 4 - Annulation ou modification de réservation confirmée en P0.
- FR-079c: Epic 4 - Annulation élève jusqu’à l’heure de début.
- FR-079d: Epic 5 - Notifications push et in-app lors d’annulation/modification.
- FR-080: Epic 2 - Création de plusieurs tarifs.
- FR-081: Epic 2 - Modification de tarif.
- FR-082: Epic 2 - Désactivation ou suppression de tarif.
- FR-083: Epic 2 - Tarifs publiés visibles avant demande.
- FR-084: Epic 2 - Champs minimaux d’un tarif.
- FR-085: Epic 2 - Types individuel et groupe.
- FR-086: Epic 2 - Tarifs attachés à des durées précises.
- FR-087: Epic 2 - Pas de masquage des tarifs par élève.
- FR-088: Epic 2 - Prix affichés sans paiement intégré.
- FR-088b: Epic 2 - Heures pleines/heures creuses hors P0.
- FR-089: Epic 2 - Attribution de pack individuel par le coach.
- FR-089b: Epic 2 - Suivi inclus/utilisés/restants pour pack.
- FR-089c: Epic 2 - Interdiction d’auto-attribution de pack par l’élève.
- FR-089d: Epic 2 - Consommation de session de pack par le coach.
- FR-089e: Epic 2 - Sessions restantes visibles sur fiche élève.
- FR-090: Epic 2 - Consultation de la liste élèves.
- FR-091: Epic 2 - Ouverture de fiche élève.
- FR-092: Epic 2 - Création manuelle de fiche élève.
- FR-093: Epic 2 - Ajout de note privée unique.
- FR-094: Epic 2 - Modification de note privée unique.
- FR-095: Epic 2 - Accès note privée limité au coach propriétaire.
- FR-096: Epic 2 - Exclusion du suivi de progression sportive.
- FR-097: Epic 2 - Historique élève côté coach.
- FR-100: Epic 1 - Parcours P0 sur app mobile.
- FR-101: Epic 1 - Parcours P0 sur webapp.
- FR-102: Epic 1 - Synchronisation des données app/webapp.
- FR-103: Epic 1 - Design prioritaire téléphone.
- FR-104: Epic 1 - Support français, anglais et espagnol.
- FR-105: Epic 1 - Externalisation des textes front.
- FR-106: Epic 1 - Utilisation des tokens de design.
- FR-107: Epic 1 - Light theme et dark theme.
- FR-108: Epic 1 - Absence de couleurs codées en dur dans les composants.
- FR-109: Epic 3 - Planning coach semaine par défaut et jour secondaire.
- FR-110: Epic 3 - Switch semaine/jour du planning coach.
- FR-111: Epic 6 - Page légère de statistiques coach.
- FR-112: Epic 6 - Nombre de cours effectués.
- FR-113: Epic 6 - Nombre d’heures effectuées.
- FR-114: Epic 6 - Indicateur `revenu estimé`.
- FR-115: Epic 6 - Élèves les plus actifs si possible.
- FR-116: Epic 6 - Statistiques indépendantes du paiement intégré.
- FR-120: Epic 5 - Onglet Notifications coach.
- FR-121: Epic 5 - Onglet Notifications élève.
- FR-122: Epic 5 - Liste des notifications importantes.
- FR-123: Epic 5 - Notification in-app même sans autorisation push système.
- FR-124: Epic 5 - Lien depuis notification vers événement concerné.
- FR-125: Epic 5 - Distinction in-app/push système.
- FR-126: Epic 5 - Notifications récentes visibles dans l’application.
- FR-127: Epic 5 - Onglet Messagerie coach lié aux créneaux, demandes, réservations et événements.
- FR-128: Epic 5 - Réponse coach dans une discussion liée à un événement de planning/réservation.

## Epic List

### Epic 1: Accès, Profils et Expérience App/Web

Le coach et l’élève peuvent créer un compte, se connecter, accéder au bon espace, gérer leur profil, utiliser l’app mobile/webapp et bénéficier d’une base UI cohérente, traduisible et tokenisée.

**FRs covered:** FR-001, FR-002, FR-003, FR-004, FR-005, FR-006, FR-007, FR-010, FR-011, FR-012, FR-013, FR-020, FR-021, FR-024, FR-030, FR-032, FR-034, FR-100, FR-101, FR-102, FR-103, FR-104, FR-105, FR-106, FR-107, FR-108.

**Implementation notes:** Inclure l’initialisation Expo `default@sdk-56`, Expo Router, structure app/web, Supabase Auth, route guards, i18n FR/EN/ES, tokens design et thèmes light/dark.

### Epic 2: Tarifs, Élèves, Notes Privées et Packs

Le coach peut gérer les tarifs visibles, retrouver ou créer ses élèves, tenir une note privée, consulter l’historique élève et suivre les packs de cours individuels.

**FRs covered:** FR-014, FR-023, FR-031, FR-033, FR-080, FR-081, FR-082, FR-083, FR-084, FR-085, FR-086, FR-087, FR-088, FR-088b, FR-089, FR-089b, FR-089c, FR-089d, FR-089e, FR-090, FR-091, FR-092, FR-093, FR-094, FR-095, FR-096, FR-097.

**Implementation notes:** Couvrir les écrans de gestion tarifs, liste élèves, création manuelle, fiche élève, notes privées protégées par RLS, historique et packs. Ajouter des tests dédiés de confidentialité des notes et d’autorisation coach/élève.

### Epic 3: Disponibilités et Planning Demandable

Le coach peut créer des plages, générer des créneaux, gérer les récurrences simples, consulter son planning, et l’élève voit uniquement les créneaux demandables et ses propres cours.

**FRs covered:** FR-040, FR-041, FR-042, FR-043, FR-044, FR-045, FR-046, FR-047, FR-048, FR-049, FR-051, FR-109, FR-110.

**Implementation notes:** Regrouper l’écran disponibilités, la génération de créneaux, les contraintes de modification/suppression, les vues planning semaine/jour et les read models nécessaires à l’agenda élève.

### Epic 4: Demandes, Réservations et Traitement Coach

L’élève peut demander un cours individuel ou collectif, le coach peut valider/refuser, créer des cours, gérer les limites pending, l’expiration, les annulations et modifications P0.

**FRs covered:** FR-022, FR-025, FR-050, FR-060, FR-061, FR-062, FR-063, FR-064, FR-066, FR-067, FR-067b, FR-068, FR-069, FR-070, FR-071, FR-072, FR-072b, FR-075, FR-076, FR-077, FR-078, FR-079, FR-079a, FR-079a-2, FR-079b, FR-079c.

**Implementation notes:** Centraliser les commandes transactionnelles `request-booking`, `approve-booking`, `refuse-booking`, `cancel-booking` et `modify-booking` coach-only. Les invariants de réservation doivent être garantis côté serveur/base de données, pas seulement par l’UI.

### Epic 5: Notifications Push, Centre In-App et Messagerie Coach

Coach et élève reçoivent les notifications fonctionnelles nécessaires, disposent d’un historique in-app fiable même si les notifications push système sont refusées, et le coach dispose d’une messagerie P0 liée aux créneaux, demandes, réservations et événements.

**FRs covered:** FR-065, FR-073, FR-074, FR-074b, FR-079d, FR-120, FR-121, FR-122, FR-123, FR-124, FR-125, FR-126, FR-127, FR-128.

**Implementation notes:** Garder cet epic dédié comme validé. Toute notification push fonctionnelle doit créer une notification in-app miroir. Prévoir le centre de notifications coach/élève, l’état lu/non lu, les liens vers demandes/réservations et la messagerie coach P0 liée aux événements de planning/réservation.

### Epic 6: Statistiques Coach Légères

Le coach peut consulter une page simple d’activité avec cours, heures, revenu estimé et élèves actifs si les données le permettent.

**FRs covered:** FR-111, FR-112, FR-113, FR-114, FR-115, FR-116.

**Implementation notes:** Rester léger et dépendre des réservations confirmées et des tarifs existants. Le libellé `revenu estimé` est obligatoire et la fonctionnalité ne doit pas dépendre d’un paiement intégré.

## Epic 1: Accès, Profils et Expérience App/Web

Le coach et l’élève peuvent créer un compte, se connecter, accéder au bon espace, gérer leur profil, utiliser l’app mobile/webapp et bénéficier d’une base UI cohérente, traduisible et tokenisée.

### Story 1.1: Initialiser l’application Expo mobile/web

As a utilisateur NextPoint,
I want une application mobile-first avec webapp complémentaire initialisée,
So that les parcours P0 puissent être construits sur une base technique cohérente et partagée.

**Acceptance Criteria:**

**Given** un dépôt NextPoint vide ou prêt pour l’implémentation
**When** le projet est initialisé
**Then** l’application Expo est créée dans `apps/mobile` avec `create-expo-app` et le template `default@sdk-56`
**And** le projet utilise TypeScript.

**Given** l’application Expo initialisée
**When** le développeur lance l’app en mode développement
**Then** l’app peut démarrer sur mobile et web via les commandes Expo documentées
**And** la structure supporte Expo Router.

**Given** la structure projet cible
**When** les fichiers de base sont créés
**Then** le dépôt contient les emplacements attendus pour `apps/mobile`, `packages/shared` et `supabase`
**And** les fichiers d’exemple d’environnement ne contiennent aucun secret réel.

**Given** un développeur qui découvre le projet
**When** il lit le README
**Then** il comprend comment lancer l’app Expo
**And** il comprend que les groupes de routes Expo Router comme `(coach)` et `(auth)` n’apparaissent pas dans l’URL.

### Story 1.2: Initialiser Supabase, migrations, types et CI légère

As a développeur NextPoint,
I want un socle Supabase, migrations, types partagés et CI légère initialisés,
So that les stories métier puissent s’appuyer sur une base backend testable et reproductible.

**Acceptance Criteria:**

**Given** le dépôt NextPoint initialisé
**When** le socle backend est créé
**Then** le dossier `supabase/` contient la configuration locale attendue, un emplacement `migrations/`, un emplacement `functions/` et un emplacement `tests/`
**And** aucune clé service-role ou secret réel n’est commité.

**Given** le projet Supabase local ou cloud configuré
**When** les variables d’environnement sont documentées
**Then** le dépôt contient des fichiers `.env.example` pour les surfaces nécessaires
**And** chaque variable indique clairement si elle est publique client ou réservée serveur.

**Given** les migrations initiales
**When** elles sont appliquées sur un environnement vierge
**Then** elles peuvent s’exécuter sans erreur
**And** la structure prépare les tables, politiques RLS et tests qui seront détaillés par les stories métier suivantes.

**Given** le workflow TypeScript
**When** les types Supabase sont générés ou simulés en local
**Then** les types sont disponibles pour l’app et/ou `packages/shared`
**And** la procédure de régénération est documentée.

**Given** une contribution au dépôt
**When** la CI légère s’exécute
**Then** elle lance au minimum lint, typecheck et tests disponibles
**And** elle échoue si une commande critique retourne une erreur.

### Story 1.3: Mettre en place le socle UI, tokens, thèmes et i18n

As a utilisateur NextPoint,
I want une interface cohérente, mobile-first, traduisible et basée sur les tokens de design,
So that l’app soit utilisable en français, anglais et espagnol avec une identité visuelle stable sur mobile et web.

**Acceptance Criteria:**

**Given** l’application Expo initialisée
**When** le socle UI est mis en place
**Then** les tokens de design NextPoint sont disponibles dans une couche thème réutilisable
**And** les composants applicatifs n’utilisent pas de couleurs codées en dur.

**Given** le thème NextPoint
**When** l’utilisateur bascule entre light theme et dark theme
**Then** les couleurs proviennent des tokens validés
**And** l’interface limite le noir pur et le blanc pur conformément aux NFR.

**Given** les parcours P0
**When** du texte visible est ajouté à l’interface
**Then** ce texte est externalisé dans le système i18n
**And** les langues français, anglais et espagnol sont supportées.

**Given** un écran mobile et un écran web
**When** l’interface est rendue
**Then** la composition reste mobile-first
**And** la webapp conserve une expérience fonctionnelle pour les parcours P0.

**Given** l’identité visuelle NextPoint
**When** des primitives UI communes sont utilisées
**Then** elles appliquent l’esprit Roland-Garros premium avec terre battue, ocre, vert profond et fonds chauds via les tokens
**And** elles peuvent être réutilisées dans les futurs écrans coach et élève.

### Story 1.4: Créer l’authentification email/password et les sessions

As a coach ou élève,
I want créer un compte, me connecter et me déconnecter,
So that je puisse accéder à mon espace NextPoint de manière sécurisée.

**Acceptance Criteria:**

**Given** un nouvel utilisateur
**When** il crée un compte avec email et mot de passe valides
**Then** le compte est créé via Supabase Auth
**And** une session utilisateur est disponible dans l’application.

**Given** un utilisateur existant
**When** il saisit un email et un mot de passe valides
**Then** il est connecté
**And** sa session persiste selon le comportement attendu sur mobile et web.

**Given** un utilisateur connecté
**When** il choisit de se déconnecter
**Then** sa session est supprimée
**And** il est redirigé vers l’espace public ou auth.

**Given** un formulaire d’authentification
**When** l’utilisateur soumet des données invalides ou incomplètes
**Then** l’interface affiche une erreur claire et traduite
**And** aucun détail technique Supabase n’est exposé.

**Given** l’application cliente
**When** les variables Supabase sont configurées
**Then** seules les clés publiques nécessaires au client sont utilisées
**And** aucun secret service-role n’est présent dans l’app.

### Story 1.5: Gérer les rôles, routes protégées et navigation coach/élève

As a utilisateur authentifié,
I want accéder uniquement aux écrans correspondant à mon rôle,
So that les parcours coach et élève restent clairs et protégés.

**Acceptance Criteria:**

**Given** un utilisateur authentifié avec le rôle `coach`
**When** il ouvre l’application
**Then** il est dirigé vers l’espace coach
**And** il voit la navigation mobile coach avec Planning, Disponibilités, Élèves, Stats, Notifications, Messagerie et Profil.

**Given** un utilisateur authentifié avec le rôle `élève`
**When** il ouvre l’application
**Then** il est dirigé vers l’espace élève
**And** il voit la navigation mobile élève avec Accueil, Planning/Demandes, Notifications et Compte.

**Given** un utilisateur non authentifié
**When** il tente d’ouvrir une route coach ou élève protégée
**Then** il est redirigé vers l’espace public ou auth
**And** les données privées ne sont pas chargées.

**Given** un élève authentifié
**When** il tente d’accéder à une route coach
**Then** l’accès est refusé
**And** aucune fonction coach n’est disponible.

**Given** un coach authentifié
**When** il tente d’accéder à une route élève non pertinente
**Then** l’accès est refusé ou redirigé selon la règle de navigation
**And** les responsabilités de rôle restent séparées.

**Given** un visiteur non inscrit
**When** il ouvre la page publique
**Then** il voit une présentation courte du coach et le bouton principal `S’inscrire`
**And** les disponibilités ne sont pas affichées avant inscription.

### Story 1.6: Créer et modifier le profil élève

As a élève,
I want créer et modifier mon profil minimal,
So that le coach dispose des informations nécessaires pour organiser mes cours.

**Acceptance Criteria:**

**Given** un élève connecté sans profil complet
**When** il ouvre son compte
**Then** il peut renseigner nom, téléphone, email, niveau padel de 1 à 10 et âge
**And** il peut choisir sa langue préférée.

**Given** un élève avec un profil existant
**When** il modifie ses informations et sauvegarde
**Then** les nouvelles valeurs sont persistées
**And** elles restent visibles après rechargement de l’application.

**Given** le formulaire de profil élève
**When** les champs requis sont absents ou invalides
**Then** des erreurs traduites sont affichées
**And** les données invalides ne sont pas enregistrées.

**Given** un utilisateur qui n’est pas le propriétaire du profil
**When** il tente de modifier ce profil élève
**Then** l’accès est refusé par les règles d’autorisation
**And** la modification n’est pas persistée.

**Given** l’app mobile et la webapp
**When** l’élève consulte ou modifie son profil
**Then** le parcours reste utilisable sur téléphone
**And** la webapp couvre la même capacité P0.

### Story 1.7: Créer et modifier le profil coach

As a coach,
I want créer et modifier mon profil public de réservation,
So that les élèves voient les informations nécessaires avant de demander un cours.

**Acceptance Criteria:**

**Given** un coach connecté sans profil complet
**When** il ouvre son profil
**Then** il peut renseigner les informations coach nécessaires à la réservation
**And** il peut sauvegarder ces informations.

**Given** un coach avec un profil existant
**When** il modifie son profil et sauvegarde
**Then** les nouvelles informations sont persistées
**And** elles sont disponibles pour les surfaces élève qui présentent le coach.

**Given** le MVP P0 single-coach
**When** le profil coach est affiché côté élève ou public
**Then** aucun lien ou code d’invitation coach n’est requis
**And** le produit ne présente pas de marketplace multi-coachs.

**Given** le profil coach
**When** le coach ouvre ses paramètres
**Then** il voit les informations du compte, la langue, et les accès vers gestion tarifs, gestion disponibilités et paramètres de notification push
**And** les écrans non encore implémentés peuvent afficher des états vides ou liens désactivés cohérents.

**Given** un utilisateur qui n’est pas le coach propriétaire
**When** il tente de modifier le profil coach
**Then** l’accès est refusé
**And** la modification n’est pas persistée.

### Story 1.8: Associer automatiquement l’élève au coach unique en P0

As a élève nouvellement inscrit,
I want être associé automatiquement au coach unique,
So that je puisse accéder à l’espace de réservation sans lien ni code d’invitation.

**Acceptance Criteria:**

**Given** le MVP configuré avec un coach unique
**When** un élève termine son inscription ou son profil minimal
**Then** une relation coach/élève active est créée automatiquement
**And** l’élève est associé à un seul coach en P0.

**Given** un élève déjà associé au coach unique
**When** il se reconnecte
**Then** la relation existante est réutilisée
**And** aucune relation dupliquée n’est créée.

**Given** un coach connecté
**When** il consulte les accès liés à ses élèves
**Then** les élèves associés au coach unique sont disponibles pour les futurs écrans coach
**And** les élèves non associés ne sont pas exposés.

**Given** un élève connecté
**When** il tente d’accéder aux données privées d’un autre élève ou d’un autre coach
**Then** l’accès est refusé par les règles d’autorisation
**And** seules ses données et les informations autorisées du coach unique sont accessibles.

**Given** le futur mécanisme de lien ou code d’invitation
**When** l’app fonctionne en P0
**Then** ce mécanisme reste absent du parcours utilisateur
**And** la structure de données ne bloque pas son ajout dans une évolution future.

## Epic 2: Tarifs, Élèves, Notes Privées et Packs

Le coach peut gérer les tarifs visibles, retrouver ou créer ses élèves, tenir une note privée, consulter l’historique élève et suivre les packs de cours individuels.

### Story 2.1: Gérer les tarifs coach visibles par les élèves

As a coach,
I want créer, modifier, désactiver ou supprimer mes tarifs,
So that les élèves voient une information fiable avant de demander un cours.

**Acceptance Criteria:**

**Given** un coach connecté
**When** il ouvre l’écran Gestion Tarifs
**Then** il peut voir ses tarifs individuels et collectifs
**And** chaque tarif affiche libellé, prix, durée, type et statut actif/inactif.

**Given** un coach connecté
**When** il crée un tarif avec libellé, prix, durée et type valides
**Then** le tarif est sauvegardé
**And** il devient visible côté élève s’il est actif.

**Given** un tarif existant
**When** le coach modifie son libellé, prix, durée, type ou statut
**Then** la nouvelle valeur est persistée
**And** l’espace élève utilise la version à jour.

**Given** un tarif actif
**When** le coach le désactive ou le supprime
**Then** ce tarif n’est plus proposé aux nouvelles demandes
**And** les réservations existantes conservent leur tarif appliqué.

**Given** un coach qui crée ou modifie un tarif
**When** il définit des critères d’applicabilité
**Then** il peut cibler certains élèves ou contextes comme tarif étudiant, tarif senior, week-end ou jour férié
**And** le tarif automatique utilise ces critères avec le type de cours, la durée et les tarifs actifs.

**Given** le MVP P0
**When** les tarifs sont affichés côté élève
**Then** les prix sont visibles sans message de paiement ni paiement intégré
**And** aucun masquage par élève ni logique heures pleines/heures creuses n’est disponible.

### Story 2.2: Consulter et filtrer la liste des élèves

As a coach,
I want consulter et filtrer la liste de mes élèves,
So that je puisse retrouver rapidement le bon élève avant un cours ou une action de suivi.

**Acceptance Criteria:**

**Given** un coach connecté avec des élèves associés
**When** il ouvre l’écran Élèves
**Then** il voit uniquement les élèves associés à son profil
**And** aucun élève non autorisé n’est affiché.

**Given** la liste élèves
**When** le coach recherche par nom
**Then** la liste est filtrée selon la recherche
**And** un état vide clair est affiché si aucun résultat ne correspond.

**Given** la liste élèves
**When** le coach applique un filtre de niveau
**Then** seuls les élèves correspondant au niveau sélectionné sont affichés
**And** le niveau utilise une liste fermée de niveaux padel.

**Given** la liste élèves
**When** le coach applique un filtre par âge
**Then** les tranches enfants de 2 ans à partir de 5 ans et les tranches adultes par dizaines sont disponibles
**And** le filtre peut être réinitialisé.

**Given** un élève ou utilisateur non coach
**When** il tente d’accéder à la liste élèves coach
**Then** l’accès est refusé
**And** aucune donnée de liste élèves n’est exposée.

### Story 2.3: Créer une fiche élève manuellement

As a coach,
I want créer une fiche élève et provisionner son compte non activé,
So that je puisse la suivre immédiatement et lui transmettre ensuite un accès sécurisé.

**Acceptance Criteria:**

**Given** un coach connecté
**When** il ouvre l’action de création manuelle d’élève
**Then** il peut renseigner nom, téléphone, email, niveau, âge et sexe
**And** il peut sauvegarder la fiche.

**Given** des informations élève valides
**When** le coach sauvegarde la fiche
**Then** un compte Auth élève, un profil `pending_activation` et la relation coach/élève sont créés
**And** l’élève apparaît dans la liste du coach.

**Given** un email ou téléphone déjà utilisé
**When** le coach tente de sauvegarder
**Then** des erreurs traduites sont affichées
**And** aucun doublon ni compte partiel n’est créé.

**Given** un lien d’activation valide
**When** l’élève définit et confirme son mot de passe
**Then** son compte passe à `active`
**And** le lien devient inutilisable.

**Given** un utilisateur non autorisé
**When** il tente de provisionner ou activer un compte hors du parcours autorisé
**Then** l’accès est refusé
**And** aucun état de compte incohérent n’est créé.

### Story 2.4: Consulter la fiche élève avec historique

As a coach,
I want consulter une fiche élève complète avec son historique,
So that je puisse préparer les cours et comprendre l’activité passée.

**Acceptance Criteria:**

**Given** un coach connecté
**When** il ouvre une fiche élève associée
**Then** il voit les informations de profil de l’élève
**And** téléphone et email sont cliquables pour appel ou email lorsque la plateforme le permet.

**Given** une fiche élève
**When** des demandes, cours confirmés, annulations, modifications ou packs existent
**Then** l’historique affiche ces éléments de manière exploitable
**And** les statuts sont lisibles et cohérents avec le reste de l’application.

**Given** une fiche élève sans historique
**When** le coach l’ouvre
**Then** un état vide clair est affiché
**And** la fiche reste utilisable pour les autres actions disponibles.

**Given** un élève connecté
**When** il tente d’accéder à la fiche coach détaillée contenant historique coach et note privée
**Then** l’accès est refusé
**And** la note privée n’est jamais exposée.

**Given** le MVP P0
**When** la fiche élève est affichée
**Then** aucun suivi de progression sportive n’est inclus
**And** l’historique reste centré sur demandes, cours, annulations, modifications et packs.

**Given** un compte élève `pending_activation`
**When** le coach ouvre la fiche
**Then** un bouton en haut à droite permet de générer ou régénérer un lien valable 24 heures
**And** l’expiration et une action copier/partager sont disponibles.

**Given** un compte `active`, `suspended` ou `deleted`
**When** le coach ouvre la fiche
**Then** aucun bouton de génération n’est affiché
**And** la commande serveur refuse aussi toute génération.

### Story 2.5: Ajouter et modifier une note privée coach

As a coach,
I want ajouter et modifier une note privée unique sur un élève,
So that je puisse conserver un rappel utile sans l’exposer à l’élève.

**Acceptance Criteria:**

**Given** un coach sur la fiche d’un élève associé
**When** il ajoute une note privée et sauvegarde
**Then** la note est persistée
**And** elle reste visible uniquement par le coach propriétaire.

**Given** une note privée existante
**When** le coach clique sur `Modifier`
**Then** la note devient éditable
**And** elle n’est sauvegardée qu’après action explicite `Enregistrer`.

**Given** une note en cours d’édition
**When** le coach quitte sans enregistrer ou annule l’édition
**Then** les changements non sauvegardés ne remplacent pas la note existante
**And** l’interface ne fait pas d’autosave.

**Given** un élève connecté
**When** il consulte ses données ou ses réservations
**Then** aucune note privée coach n’est retournée ou affichée
**And** ce comportement est couvert par un test d’autorisation/RLS.

**Given** un autre coach ou utilisateur non propriétaire
**When** il tente de lire ou modifier la note privée
**Then** l’accès est refusé côté backend
**And** aucune donnée sensible n’est exposée dans la réponse.

### Story 2.6: Attribuer et suivre un pack de cours individuels

As a coach,
I want rattacher un pack de cours individuels à un élève,
So that je puisse suivre les crédits sans paiement intégré.

**Acceptance Criteria:**

**Given** un coach sur la fiche d’un élève associé
**When** il crée ou rattache un pack de cours individuels
**Then** il renseigne au minimum le nombre de cours inclus
**And** le système calcule les cours utilisés et restants.

**Given** un pack attribué
**When** le coach ouvre la fiche élève
**Then** le pack affiche cours inclus, utilisés et restants
**And** son statut est visible.

**Given** un élève connecté
**When** il consulte son compte ou ses réservations
**Then** il ne peut pas créer, acheter ou s’attribuer lui-même un pack
**And** aucune interface de paiement intégré n’est proposée.

**Given** le MVP P0
**When** un pack est géré
**Then** il représente uniquement un suivi de crédits de cours individuels
**And** il ne crée pas de paiement, facture ou transaction.

**Given** un utilisateur non autorisé
**When** il tente de rattacher un pack à un élève
**Then** l’accès est refusé
**And** aucun pack n’est créé ou modifié.

### Story 2.7: Consommer une session de pack individuel

As a coach,
I want marquer une session de pack individuel comme consommée,
So that les cours restants de l’élève soient suivis correctement.

**Acceptance Criteria:**

**Given** un élève avec un pack individuel actif et des cours restants
**When** le coach marque une session comme consommée
**Then** le nombre de cours utilisés augmente de 1
**And** le nombre de cours restants diminue de 1.

**Given** un pack sans cours restants
**When** le coach tente de consommer une session
**Then** l’action est refusée avec un message clair et traduit
**And** les compteurs du pack ne changent pas.

**Given** une consommation de session réussie
**When** le coach rouvre la fiche élève
**Then** les compteurs mis à jour sont visibles
**And** l’historique de l’élève reflète l’événement de consommation.

**Given** une réservation ou un cours individuel concerné par un pack
**When** une session est consommée
**Then** la consommation est associée à l’élève et au coach
**And** aucune logique de paiement intégré n’est déclenchée.

**Given** un élève ou utilisateur non autorisé
**When** il tente de consommer une session du pack
**Then** l’accès est refusé
**And** les cours restants ne sont pas modifiés.

## Epic 3: Disponibilités et Planning Demandable

Le coach peut créer des plages, générer des créneaux, gérer les récurrences simples, consulter son planning, et l’élève voit uniquement les créneaux demandables et ses propres cours.

### Story 3.1: Créer une plage de disponibilité coach

As a coach,
I want créer une plage de disponibilité avec durée et lieu,
So that le système puisse proposer des créneaux réservables à mes élèves.

**Acceptance Criteria:**

**Given** un coach connecté
**When** il ouvre l’écran Gestion Disponibilités
**Then** il peut créer une plage avec date, heure de début, heure de fin, durée de créneau et lieu
**And** l’écran est dédié à la gestion des disponibilités.

**Given** une nouvelle plage de disponibilité
**When** le coach sélectionne une durée de créneau
**Then** les durées disponibles sont 1h et 1h30
**And** 1h30 peut être proposée comme durée de référence.

**Given** une nouvelle plage de disponibilité
**When** le coach sélectionne un lieu
**Then** la liste de lieux inclut `Les Bruyères Centre Sportif` comme valeur initiale
**And** le lieu est conservé pour les créneaux générés.

**Given** un formulaire de disponibilité incomplet ou incohérent
**When** le coach tente de sauvegarder
**Then** des erreurs traduites indiquent les champs à corriger
**And** aucune plage invalide n’est créée.

**Given** un utilisateur non coach
**When** il tente de créer une plage de disponibilité
**Then** l’accès est refusé
**And** aucune disponibilité n’est créée.

### Story 3.2: Générer les créneaux depuis une plage

As a coach,
I want que mes plages génèrent automatiquement des créneaux,
So that je n’aie pas à créer chaque créneau manuellement.

**Acceptance Criteria:**

**Given** une plage de disponibilité valide
**When** le coach la sauvegarde
**Then** le système génère les créneaux correspondants selon l’heure de début, l’heure de fin et la durée choisie
**And** chaque créneau conserve le coach, la date, les heures, la durée, le lieu et le statut initial.

**Given** une plage dont la durée totale ne permet pas un dernier créneau complet
**When** les créneaux sont générés
**Then** seuls les créneaux complets sont créés
**And** aucun créneau ne dépasse l’heure de fin de la plage.

**Given** des créneaux générés
**When** le coach consulte le détail d’un créneau
**Then** le lieu, la date, l’heure et la durée sont visibles
**And** le créneau est disponible tant qu’aucune réservation confirmée ne le bloque.

**Given** un créneau avec réservation confirmée
**When** les disponibilités demandables sont calculées
**Then** ce créneau n’est plus proposé comme disponible
**And** son statut empêche une nouvelle demande élève.

**Given** la génération de créneaux
**When** une erreur serveur se produit
**Then** la plage n’est pas partiellement créée sans cohérence de créneaux
**And** le coach reçoit une erreur claire et traduite.

### Story 3.3: Gérer les récurrences de disponibilités P0

As a coach,
I want créer des disponibilités ponctuelles, quotidiennes ou hebdomadaires,
So that je puisse publier rapidement mes créneaux récurrents.

**Acceptance Criteria:**

**Given** le formulaire de disponibilité
**When** le coach choisit une récurrence
**Then** les options P0 disponibles sont ponctuelle, quotidienne et hebdomadaire
**And** aucune récurrence avancée hors P0 n’est proposée.

**Given** une disponibilité récurrente valide
**When** le coach la sauvegarde
**Then** le système demande l’horizon de génération à l’utilisateur et propose 1 mois par défaut
**And** les créneaux générés restent liés à leur plage ou règle source.

**Given** une disponibilité ponctuelle
**When** elle est sauvegardée
**Then** seuls les créneaux de la date sélectionnée sont générés
**And** aucune règle récurrente n’est créée.

**Given** une règle récurrente
**When** ses occurrences apparaissent dans le planning coach
**Then** le coach peut identifier les créneaux issus de cette règle
**And** les informations date, heure, durée et lieu restent cohérentes sur chaque occurrence.

**Given** une récurrence invalide ou impossible
**When** le coach tente de sauvegarder
**Then** l’action est refusée avec un message clair
**And** aucun créneau incohérent n’est généré.

### Story 3.4: Modifier ou supprimer une disponibilité sans conflit

As a coach,
I want modifier ou supprimer une disponibilité uniquement quand cela ne crée pas de conflit,
So that mon planning reste fiable pour les élèves et les réservations.

**Acceptance Criteria:**

**Given** une plage ou un créneau sans demande active ni réservation confirmée
**When** le coach modifie ses informations
**Then** la modification est sauvegardée
**And** les créneaux concernés sont mis à jour de façon cohérente.

**Given** une plage ou un créneau avec demande active ou réservation confirmée
**When** le coach tente de modifier ou supprimer l’élément
**Then** l’action est refusée ou limitée selon la règle métier applicable
**And** le message explique clairement pourquoi la modification n’est pas disponible.

**Given** une occurrence issue d’une récurrence
**When** le coach demande une modification
**Then** la modification s’applique par défaut à l’occurrence sélectionnée
**And** l’interface ne modifie pas silencieusement toute la série.

**Given** une modification d’occurrence qui peut aussi s’appliquer à la série récurrente
**When** le coach valide la modification
**Then** une popup demande s’il veut appliquer la modification à la récurrence
**And** le choix du coach détermine si seule l’occurrence ou la série est mise à jour.

**Given** une modification qui ne peut pas être appliquée à toute la série
**When** le coach modifie l’occurrence
**Then** aucune option d’application à la récurrence n’est proposée
**And** seule l’occurrence sélectionnée est modifiée.

**Given** une suppression autorisée
**When** le coach confirme la suppression
**Then** la plage ou le créneau concerné n’est plus visible comme disponible
**And** les élèves ne peuvent plus le demander.

### Story 3.5: Afficher le planning coach en vues semaine et jour

As a coach,
I want consulter mon planning en vue semaine ou jour,
So that je puisse comprendre rapidement mes créneaux à venir.

**Acceptance Criteria:**

**Given** un coach connecté
**When** il ouvre son accueil coach ou planning
**Then** la vue semaine est affichée par défaut
**And** elle montre les créneaux à venir du coach.

**Given** le planning coach
**When** le coach utilise le bouton de switch semaine/jour
**Then** la vue change entre semaine et jour
**And** la sélection reste claire dans l’interface.

**Given** des créneaux disponibles
**When** le planning est affiché
**Then** les créneaux visibles présentent les informations utiles: heure, durée, lieu et statut
**And** les dimensions restent stables sur mobile et web.

**Given** une connexion mobile standard
**When** le coach change de semaine ou de jour
**Then** les données se chargent rapidement ou avec un état de chargement cohérent
**And** l’écran évite de vider brutalement les données déjà visibles pendant un refetch.

**Given** un utilisateur non coach
**When** il tente d’ouvrir le planning coach
**Then** l’accès est refusé
**And** aucun créneau privé coach n’est exposé.

### Story 3.6: Afficher l’agenda élève avec les créneaux demandables uniquement

As a élève,
I want voir uniquement les disponibilités demandables et mes propres cours,
So that je puisse choisir un créneau sans confusion.

**Acceptance Criteria:**

**Given** un élève connecté associé au coach unique
**When** il ouvre l’accueil élève
**Then** l’agenda hebdomadaire est affiché par défaut
**And** un bouton permet de passer en vue jour.

**Given** l’agenda élève
**When** les créneaux sont chargés
**Then** seuls les créneaux disponibles et demandables sont affichés
**And** les cours propres à l’élève connecté peuvent aussi être affichés.

**Given** des cours appartenant à d’autres élèves
**When** l’élève consulte son agenda
**Then** ces cours ne sont pas exposés
**And** aucune donnée personnelle d’un autre élève n’est visible.

**Given** un créneau confirmé, expiré, annulé ou non demandable
**When** l’agenda élève est rendu
**Then** ce créneau n’est pas proposé comme disponible
**And** l’élève ne peut pas initier de demande dessus.

**Given** un créneau visible dans l’agenda élève
**When** l’élève ouvre son détail
**Then** le lieu, la date, l’heure et la durée sont disponibles pour le futur parcours de demande
**And** les tarifs pourront être affichés au-dessus de l’agenda par l’epic tarifs déjà livré.

## Epic 4: Demandes, Réservations et Traitement Coach

L’élève peut demander un cours individuel ou collectif, le coach peut valider/refuser, créer des cours, gérer les limites pending, l’expiration, les annulations et modifications P0.

### Story 4.1: Demander un créneau individuel disponible

As a élève,
I want demander un créneau disponible avec un commentaire optionnel,
So that le coach puisse valider ou refuser ma demande de cours individuel.

**Acceptance Criteria:**

**Given** un élève connecté associé au coach unique
**When** il ouvre le détail d’un créneau disponible
**Then** il voit la date, l’heure, la durée, le lieu et le tarif applicable
**And** il comprend que la validation du coach est nécessaire.

**Given** un créneau disponible
**When** l’élève envoie une demande de cours individuel
**Then** une demande liée au coach, à l’élève et au créneau est créée
**And** l’élève voit le libellé principal `demande envoyée`.

**Given** une demande de réservation
**When** l’élève ajoute un commentaire libre
**Then** le commentaire est sauvegardé avec la demande
**And** il est visible dans le détail de demande côté coach.

**Given** le type de cours et la durée du créneau
**When** la demande est créée
**Then** le tarif applicable est sélectionné automatiquement
**And** l’élève ne choisit pas manuellement une ligne tarifaire.

**Given** un créneau qui n’est plus disponible
**When** l’élève tente d’envoyer une demande
**Then** la demande est refusée avec une erreur claire et traduite
**And** aucun booking invalide n’est créé.

### Story 4.2: Appliquer les limites et conflits de demandes

As a système de réservation,
I want appliquer les limites pending et les règles d’atomicité,
So that les créneaux ne puissent pas être surdemandés ou double-bookés.

**Acceptance Criteria:**

**Given** un créneau sans réservation confirmée et avec moins de 2 demandes pending
**When** un élève associé envoie une demande valide
**Then** la demande passe en `pending`
**And** elle occupe une place pending sur le créneau.

**Given** un créneau avec déjà 2 demandes pending
**When** un autre élève tente de demander ce créneau
**Then** l’action est refusée avec une erreur claire
**And** aucune troisième demande pending n’est créée.

**Given** un élève avec déjà 10 demandes pending auprès du coach
**When** il tente de créer une nouvelle demande
**Then** l’action est refusée avec un message clair
**And** le nombre de demandes pending ne change pas.

**Given** un créneau avec une réservation confirmée
**When** un élève tente de demander ce créneau
**Then** l’action est refusée
**And** le créneau reste non demandable.

**Given** plusieurs demandes concurrentes sur le même créneau
**When** elles sont traitées côté serveur
**Then** les contraintes sont appliquées de manière atomique
**And** les règles ne reposent pas uniquement sur l’état local du client.

### Story 4.3: Afficher les demandes nouvelles dans le planning coach

As a coach,
I want voir les nouvelles demandes directement dans mon planning,
So that je ne manque pas les réservations à traiter.

**Acceptance Criteria:**

**Given** une nouvelle demande pending
**When** le coach ouvre son planning
**Then** la demande est visible dans le planning
**And** elle possède un état ou badge `nouveau`.

**Given** plusieurs demandes pending sur un même créneau
**When** le coach consulte le planning
**Then** le créneau indique clairement les demandes à traiter
**And** il reste compréhensible sur mobile.

**Given** une demande pending
**When** elle est affichée dans le planning coach
**Then** elle utilise une couleur distincte ou une surbrillance
**And** cette représentation vient des tokens de design.

**Given** une demande depuis le planning
**When** le coach la sélectionne
**Then** il ouvre le détail de la demande
**And** le détail contient au minimum élève, date, heure, lieu, durée, tarif et statut.

**Given** une demande déjà traitée
**When** le planning est rechargé
**Then** elle n’est plus affichée comme nouvelle pending
**And** son statut visible reflète son état réel.

### Story 4.4: Valider une demande de réservation

As a coach,
I want valider une demande depuis son détail,
So that le cours soit confirmé et le créneau bloqué.

**Acceptance Criteria:**

**Given** une demande pending ouverte dans son détail
**When** le coach choisit de la valider
**Then** la demande devient `confirmed`
**And** le créneau associé n’est plus proposé comme disponible.

**Given** plusieurs demandes pending sur le même créneau
**When** le coach valide une demande
**Then** les autres demandes du même créneau sont automatiquement refusées
**And** le message visible côté élève est `Désolé, le créneau n'est plus disponible, veuillez essayer un autre créneau.`

**Given** une demande déjà expirée, refusée, annulée ou confirmée
**When** le coach tente de la valider
**Then** l’action est refusée
**And** l’état existant n’est pas écrasé.

**Given** la validation d’une demande
**When** la mutation est exécutée
**Then** elle passe par une commande serveur transactionnelle
**And** le client ne modifie pas directement le statut en base.

**Given** une validation réussie
**When** le coach et l’élève consultent leurs plannings
**Then** la réservation confirmée est visible avec le bon statut
**And** aucun critère de cette story ne valide la livraison ou l’affichage des notifications.

### Story 4.5: Refuser une demande avec commentaire optionnel

As a coach,
I want refuser une demande avec un commentaire optionnel,
So that l’élève comprenne la décision sans workflow lourd.

**Acceptance Criteria:**

**Given** une demande pending ouverte dans son détail
**When** le coach choisit de la refuser
**Then** aucune confirmation supplémentaire n’est demandée
**And** la demande passe en `refused`.

**Given** le refus d’une demande
**When** le coach saisit un commentaire optionnel
**Then** ce commentaire est sauvegardé avec la demande
**And** il est disponible côté élève dans le détail de la demande.

**Given** une demande refusée
**When** le créneau ne contient aucune autre réservation confirmée
**Then** le créneau peut redevenir disponible selon les autres demandes en attente
**And** le statut du créneau reste cohérent.

**Given** une demande déjà traitée
**When** le coach tente de la refuser
**Then** l’action est refusée
**And** aucun commentaire de refus tardif n’est appliqué.

**Given** un refus réussi
**When** l’élève consulte le statut de sa demande
**Then** il voit `refusée`
**And** aucun critère de cette story ne valide la livraison ou l’affichage des notifications.

### Story 4.6: Expirer automatiquement les demandes pending

As a coach et élève,
I want que les demandes sans réponse expirent automatiquement après 7 jours,
So that les créneaux ne restent pas bloqués indéfiniment.

**Acceptance Criteria:**

**Given** une demande pending créée depuis 7 jours sans action coach
**When** le processus d’expiration s’exécute
**Then** la demande passe en `expired`
**And** le créneau redevient disponible si aucune autre règle ne le bloque.

**Given** une demande pending non expirée
**When** le processus d’expiration s’exécute
**Then** la demande conserve son statut
**And** aucune libération prématurée du créneau n’a lieu.

**Given** une demande confirmée, refusée ou annulée
**When** le processus d’expiration s’exécute
**Then** son statut n’est pas modifié
**And** l’historique reste cohérent.

**Given** le détail d’une demande pending côté coach
**When** le coach l’ouvre
**Then** le temps restant avant expiration 7 jours est visible
**And** il aide le coach à prioriser le traitement.

**Given** une expiration automatique
**When** elle modifie une demande
**Then** l’opération est traçable côté données
**And** elle est couverte par un test de comportement.

### Story 4.7: Demander un cours collectif avec joueurs sélectionnés

As a élève,
I want demander un cours collectif en sélectionnant des joueurs,
So that je puisse proposer un collectif au coach.

**Acceptance Criteria:**

**Given** un élève connecté
**When** il choisit une demande de cours collectif
**Then** il peut sélectionner des joueurs de l’application
**And** le demandeur est inclus dans la demande collective.

**Given** une demande collective valide
**When** elle est envoyée
**Then** une réservation ou demande collective pending est créée
**And** la liste des participants est conservée.

**Given** une sélection de joueurs invalide ou non autorisée
**When** l’élève tente d’envoyer la demande
**Then** l’action est refusée avec une erreur claire
**And** aucune donnée participant incohérente n’est créée.

**Given** une demande collective
**When** le coach ouvre son détail
**Then** il voit le demandeur et les participants sélectionnés
**And** il peut traiter la demande comme les autres demandes pending.

**Given** le type collectif et la durée
**When** le tarif est déterminé
**Then** le tarif collectif applicable est sélectionné automatiquement
**And** aucun tarif individuel incompatible n’est appliqué.

### Story 4.8: Créer un cours individuel ou collectif par le coach

As a coach,
I want créer directement un cours individuel ou collectif,
So that je puisse organiser des cours sans attendre une demande élève.

**Acceptance Criteria:**

**Given** un coach connecté
**When** il crée un cours individuel
**Then** il sélectionne l’élève, la date, l’heure, la durée, le lieu et le tarif
**And** le cours est créé avec le statut `confirmed`.

**Given** un coach connecté
**When** il crée un cours collectif
**Then** il peut sélectionner les élèves concernés
**And** la liste des participants est conservée.

**Given** un cours créé par le coach
**When** il apparaît dans les plannings
**Then** il bloque le créneau ou la place concernée selon le type de cours
**And** il n’est pas proposé comme disponibilité demandable incompatible.

**Given** une création de cours avec données invalides
**When** le coach tente de sauvegarder
**Then** des erreurs traduites sont affichées
**And** aucun cours invalide n’est créé.

**Given** un élève ou utilisateur non coach
**When** il tente de créer directement un cours
**Then** l’accès est refusé
**And** aucun cours n’est créé.

### Story 4.9: Créer un cours individuel récurrent hebdomadaire par le coach

As a coach,
I want créer un cours individuel récurrent hebdomadaire,
So that je puisse gérer les cours réguliers sans les recréer un par un.

**Acceptance Criteria:**

**Given** un coach qui crée un cours individuel
**When** il active la récurrence hebdomadaire
**Then** le système crée la série ou les occurrences selon l’horizon retenu
**And** chaque occurrence conserve élève, durée, lieu, tarif et statut.

**Given** un élève connecté
**When** il demande un cours
**Then** aucune option de demande récurrente n’est disponible
**And** la récurrence de cours P0 reste réservée au coach.

**Given** une occurrence de cours récurrent
**When** elle est affichée dans le planning coach ou élève
**Then** elle est lisible comme un cours planifié
**And** elle n’est pas confondue avec une simple disponibilité.

**Given** des données de récurrence invalides
**When** le coach tente de créer le cours récurrent
**Then** l’action est refusée avec un message clair
**And** aucune série incohérente n’est créée.

**Given** une future modification d’occurrence récurrente
**When** le coach agit sur une occurrence
**Then** la règle UX de popup d’application à la récurrence, définie dans l’Epic 3, reste applicable si techniquement possible
**And** aucune modification silencieuse de série n’est faite.

### Story 4.10: Annuler ou modifier une réservation confirmée

As a coach ou élève,
I want utiliser uniquement les actions de réservation autorisées pour mon rôle,
So that les annulations et modifications P0 restent claires et contrôlées.

**Acceptance Criteria:**

**Given** une réservation confirmée
**When** le coach l’annule
**Then** la réservation passe en `cancelled`
**And** le créneau ou la place est libéré selon le type de cours.

**Given** une réservation confirmée
**When** le coach initie une modification
**Then** la modification est acceptée uniquement si les règles de disponibilité et de participants restent cohérentes
**And** l’élève est notifié par les mécanismes prévus.

**Given** une réservation confirmée
**When** l’élève l’annule avant l’heure de début du cours
**Then** la réservation passe en `cancelled`
**And** le créneau ou la place est libéré selon le type de cours.

**Given** une réservation confirmée dont l’heure de début est passée
**When** l’élève tente de l’annuler
**Then** l’action est refusée
**And** le statut de réservation ne change pas.

**Given** une réservation confirmée
**When** l’élève consulte les actions disponibles
**Then** aucune action de modification n’est affichée
**And** seule l’annulation est disponible si elle est encore autorisée.

**Given** une annulation ou modification
**When** la mutation est exécutée
**Then** elle passe par une commande serveur transactionnelle
**And** les règles de disponibilité et de participants restent cohérentes.

### Story 4.11: Consulter les demandes et réservations côté élève

As a élève,
I want consulter mes demandes et réservations avec leurs statuts,
So that je puisse suivre mes cours sans échange manuel.

**Acceptance Criteria:**

**Given** un élève connecté
**When** il ouvre Planning/Demandes
**Then** il voit une page unique avec ses demandes et réservations
**And** les filtres permettent de distinguer en attente, confirmé, refusé, expiré, annulé ou modifié.

**Given** une demande pending
**When** l’élève consulte son détail
**Then** le statut en attente est visible
**And** les informations date, heure, lieu, durée et tarif sont affichées.

**Given** une demande confirmée, refusée ou expirée
**When** l’élève consulte la page Planning/Demandes
**Then** le statut correspondant est affiché clairement
**And** le détail reste consultable.

**Given** des réservations d’autres élèves
**When** l’élève consulte son planning
**Then** elles ne sont pas affichées
**And** les règles d’accès empêchent leur exposition.

**Given** un changement de statut côté serveur
**When** la page est rechargée ou synchronisée
**Then** l’élève voit le statut à jour
**And** l’app mobile et la webapp restent cohérentes.

## Epic 5: Notifications Push, Centre In-App et Messagerie Coach

Coach et élève reçoivent les notifications fonctionnelles nécessaires, disposent d’un historique in-app fiable même si les notifications push système sont refusées, et le coach dispose d’une messagerie P0 liée aux créneaux, demandes, réservations et événements.

### Story 5.1: Créer le modèle et le centre de notifications in-app

As a utilisateur NextPoint,
I want consulter mes notifications in-app récentes,
So that je retrouve les événements importants même sans notification push système.

**Acceptance Criteria:**

**Given** un coach connecté
**When** il ouvre l’onglet Notifications
**Then** il voit ses notifications in-app récentes
**And** les notifications des autres utilisateurs ne sont pas exposées.

**Given** un élève connecté
**When** il ouvre l’onglet Notifications
**Then** il voit ses notifications in-app récentes
**And** les notifications des autres utilisateurs ne sont pas exposées.

**Given** une notification in-app
**When** elle est affichée
**Then** elle contient un type, un titre ou contenu court, un état lu/non lu et une date
**And** elle peut référencer un événement ou une réservation concernée.

**Given** une liste vide de notifications
**When** l’utilisateur ouvre l’onglet
**Then** un état vide clair est affiché
**And** l’écran reste disponible même sans autorisation push système.

**Given** les règles d’accès
**When** un utilisateur tente de lire les notifications d’un autre utilisateur
**Then** l’accès est refusé côté backend
**And** aucune donnée de notification privée n’est retournée.

### Story 5.2: Gérer les permissions et jetons de notification push

As a utilisateur NextPoint,
I want pouvoir accepter ou refuser les notifications push système,
So that l’application respecte mes préférences tout en gardant l’historique in-app.

**Acceptance Criteria:**

**Given** un utilisateur connecté sur un appareil compatible
**When** l’application demande l’autorisation push
**Then** l’utilisateur peut accepter ou refuser
**And** son choix ne bloque pas l’accès aux notifications in-app.

**Given** un utilisateur qui accepte les notifications push
**When** un jeton push est obtenu
**Then** le jeton est associé à l’utilisateur courant
**And** il peut être utilisé par les événements fonctionnels.

**Given** un utilisateur qui refuse les notifications push
**When** un événement important le concerne
**Then** aucune hypothèse de livraison push n’est faite
**And** une notification in-app est quand même créée.

**Given** un changement de jeton ou d’appareil
**When** l’application détecte le nouveau jeton
**Then** l’enregistrement est mis à jour de façon sécurisée
**And** les anciens états incohérents sont évités autant que possible.

**Given** l’app cliente
**When** elle gère les notifications push
**Then** aucun secret fournisseur ou service-role n’est exposé côté client
**And** les détails du fournisseur push restent encapsulés.

### Story 5.3: Notifier le coach lors d’une nouvelle demande

As a coach,
I want être notifié lorsqu’une nouvelle demande arrive,
So that je puisse la traiter rapidement.

**Acceptance Criteria:**

**Given** une demande de réservation créée par un élève
**When** la demande est enregistrée
**Then** une notification in-app est créée pour le coach
**And** une notification push coach est déclenchée si possible.

**Given** le coach a refusé les permissions push système
**When** une nouvelle demande arrive
**Then** la notification in-app est quand même visible dans l’onglet Notifications
**And** le workflow de demande reste fonctionnel.

**Given** une notification de nouvelle demande
**When** le coach l’ouvre
**Then** elle permet de retrouver la demande concernée si applicable
**And** le lien mène au détail de demande ou à l’écran pertinent.

**Given** une erreur de livraison push
**When** la notification in-app a été créée
**Then** l’historique in-app reste disponible
**And** l’erreur push est journalisée sans exposer de détail technique au coach.

**Given** plusieurs nouvelles demandes
**When** elles arrivent
**Then** chaque événement important crée une notification traçable
**And** les notifications peuvent être distinguées par demande.

### Story 5.4: Notifier l’élève après validation ou refus

As a élève,
I want être notifié quand le coach valide ou refuse ma demande,
So that je connaisse rapidement le statut de mon cours.

**Acceptance Criteria:**

**Given** une demande pending
**When** le coach la valide
**Then** une notification in-app est créée pour le demandeur
**And** une notification push élève est déclenchée si possible.

**Given** une demande pending
**When** le coach la refuse
**Then** une notification in-app est créée pour le demandeur
**And** une notification push élève est déclenchée si possible.

**Given** un refus avec commentaire coach
**When** la notification élève est créée
**Then** le commentaire de refus est visible dans la notification ou son détail
**And** il reste aussi visible dans le détail de la demande côté élève.

**Given** un élève qui a refusé les permissions push système
**When** sa demande est validée ou refusée
**Then** la notification in-app est quand même créée
**And** l’élève peut la consulter dans l’onglet Notifications.

**Given** une notification de validation ou refus
**When** l’élève l’ouvre
**Then** elle permet de retrouver la demande ou réservation concernée
**And** le statut affiché est cohérent avec l’état serveur.

### Story 5.5: Notifier l’autre partie lors d’une annulation ou modification

As a coach ou élève,
I want que l’autre partie soit notifiée quand j’annule ou modifie une réservation,
So that personne ne manque un changement de planning.

**Acceptance Criteria:**

**Given** une réservation confirmée annulée par le coach
**When** l’annulation est sauvegardée
**Then** l’élève reçoit une notification in-app
**And** une notification push est déclenchée si possible.

**Given** une réservation confirmée annulée par l’élève
**When** l’annulation est sauvegardée
**Then** le coach reçoit une notification in-app
**And** une notification push est déclenchée si possible.

**Given** une modification initiée par le coach
**When** la modification est enregistrée ou mise en traitement
**Then** l’élève reçoit une notification in-app
**And** une notification push est déclenchée si possible.

**Given** un destinataire sans permission push système
**When** une annulation ou modification le concerne
**Then** la notification in-app est quand même créée
**And** l’onglet Notifications conserve l’historique de l’événement.

**Given** une notification d’annulation ou modification
**When** le destinataire l’ouvre
**Then** elle mène vers la réservation ou l’événement concerné si applicable
**And** le statut affiché est à jour.

### Story 5.6: Gérer l’état lu/non lu et les liens de notifications

As a utilisateur NextPoint,
I want marquer mes notifications comme lues et ouvrir l’événement lié,
So that mon centre de notifications reste exploitable.

**Acceptance Criteria:**

**Given** une notification non lue
**When** l’utilisateur l’ouvre ou la marque comme lue
**Then** son état passe à lu
**And** ce statut reste persistant après rechargement.

**Given** une notification liée à une demande ou réservation
**When** l’utilisateur active le lien
**Then** il est dirigé vers l’écran pertinent
**And** les règles d’accès sont vérifiées avant affichage.

**Given** une notification dont l’événement lié n’est plus accessible
**When** l’utilisateur tente de l’ouvrir
**Then** un message clair est affiché
**And** l’application ne plante pas.

**Given** plusieurs notifications
**When** l’utilisateur consulte la liste
**Then** les états lu/non lu sont visuellement distinguables
**And** la liste reste utilisable sur mobile et web.

**Given** une notification appartenant à un autre utilisateur
**When** un utilisateur tente de la marquer comme lue
**Then** l’accès est refusé
**And** l’état de notification ne change pas.

### Story 5.7: Utiliser la messagerie coach liée aux créneaux

As a coach,
I want voir et répondre aux discussions liées aux créneaux, demandes, réservations ou événements,
So that je puisse retrouver les échanges de planning sans ouvrir chaque écran séparément.

**Acceptance Criteria:**

**Given** un coach connecté
**When** il ouvre l’onglet Messagerie
**Then** il voit uniquement les discussions liées à ses créneaux, demandes, réservations ou événements
**And** aucune discussion d’un autre coach ou élève non autorisé n’est exposée.

**Given** une discussion liée à un créneau, une demande, une réservation ou un événement
**When** le coach l’ouvre
**Then** il voit les messages existants, le dernier état lu/non lu et le contexte lié
**And** il peut revenir vers l’événement concerné si applicable.

**Given** une discussion ouverte par le coach
**When** il saisit et envoie une réponse valide
**Then** le message est enregistré dans la discussion
**And** il reste lié au créneau, à la demande, à la réservation ou à l’événement concerné.

**Given** un message vide ou invalide
**When** le coach tente de l’envoyer
**Then** l’action est refusée avec une erreur claire et traduite
**And** aucun message vide n’est enregistré.

**Given** un élève connecté
**When** il tente d’accéder à l’onglet Messagerie coach
**Then** l’accès est refusé
**And** aucune liste de discussions coach n’est exposée.

## Epic 6: Statistiques Coach Légères

Le coach peut consulter une page simple d’activité avec cours, heures, revenu estimé et élèves actifs si les données le permettent.

### Story 6.1: Créer le read model des statistiques coach

As a coach,
I want que mes statistiques soient calculées depuis mes réservations confirmées,
So that les chiffres reflètent mon activité réelle sans dépendre d’un paiement intégré.

**Acceptance Criteria:**

**Given** des réservations confirmées pour un coach
**When** les statistiques sont calculées
**Then** seules les données du coach connecté sont prises en compte
**And** les données d’autres coachs ou élèves non autorisés ne sont pas exposées.

**Given** des réservations annulées, refusées ou expirées
**When** les statistiques sont calculées
**Then** elles ne sont pas comptabilisées comme cours effectués
**And** les règles de calcul restent documentées.

**Given** des tarifs associés aux réservations
**When** le revenu estimé est calculé
**Then** le calcul utilise les tarifs appliqués ou les données disponibles
**And** il ne dépend d’aucun paiement intégré.

**Given** une période demandée
**When** le read model est interrogé
**Then** il retourne des valeurs cohérentes pour cette période
**And** les erreurs sont normalisées et traduites côté client.

**Given** un utilisateur non coach
**When** il tente d’accéder aux statistiques coach
**Then** l’accès est refusé
**And** aucune statistique privée n’est retournée.

### Story 6.2: Afficher les indicateurs P0 de statistiques coach

As a coach,
I want voir mes cours, heures et revenu estimé,
So that je puisse suivre simplement mon activité.

**Acceptance Criteria:**

**Given** un coach connecté
**When** il ouvre la page Stats
**Then** il voit au minimum le nombre de cours effectués
**And** il voit le nombre d’heures effectuées.

**Given** la page Stats
**When** l’indicateur financier est affiché
**Then** son libellé exact est `revenu estimé`
**And** aucun message ne laisse croire qu’un paiement intégré a eu lieu.

**Given** aucune donnée statistique disponible
**When** le coach ouvre la page Stats
**Then** un état vide clair est affiché
**And** l’écran reste utilisable.

**Given** une connexion mobile standard
**When** la page Stats charge
**Then** l’écran reste léger et rapide
**And** il ne ralentit pas les parcours planning/réservation.

**Given** l’app mobile et la webapp
**When** le coach consulte les statistiques
**Then** la page est utilisable sur les deux supports
**And** la composition reste mobile-first.

### Story 6.3: Filtrer les statistiques par période et afficher les élèves actifs

As a coach,
I want consulter mes statistiques par période et voir mes élèves les plus actifs si possible,
So that je puisse comprendre mon activité sans tableau analytique complexe.

**Acceptance Criteria:**

**Given** la page Stats
**When** le coach l’ouvre
**Then** la période mois est prioritaire par défaut
**And** les périodes trimestre et année sont disponibles si les données le permettent.

**Given** une période sélectionnée
**When** le coach change de période
**Then** les indicateurs sont recalculés pour cette période
**And** l’interface garde un état de chargement cohérent.

**Given** des données suffisantes sur les élèves
**When** les statistiques sont affichées
**Then** les élèves les plus actifs peuvent être présentés
**And** l’absence de données suffisantes affiche un état discret plutôt qu’une erreur.

**Given** la période semaine
**When** son implémentation est coûteuse ou secondaire
**Then** elle peut rester hors affichage initial
**And** mois, trimestre et année restent prioritaires.

**Given** les statistiques coach
**When** elles sont affichées
**Then** elles restent légères et centrées sur les besoins P0
**And** elles n’introduisent pas de suivi de progression sportive élève.
