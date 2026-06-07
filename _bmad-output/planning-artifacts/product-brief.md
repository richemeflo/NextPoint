# Brief Produit — NextPoint

Date: 2026-06-06
Phase BMAD: 1 — Analyse
Statut: brouillon initial

## Résumé

NextPoint est une application mobile-first, complétée par une webapp, destinée principalement à un coach de padel désigné et à ses élèves. Le produit facilite la mise en relation des disponibilités coach/élève, les demandes de réservation, la validation par le coach, la gestion des tarifs et le suivi des élèves via historique, notes privées et packs de cours individuels.

Le support prioritaire du MVP est le téléphone. La webapp doit exister dès le MVP, mais elle peut être plus simple si elle couvre les mêmes actions essentielles.

## Problème à Résoudre

Les coachs doivent coordonner leurs disponibilités avec celles de leurs élèves, gérer les réservations, rendre leurs tarifs visibles et garder un suivi individuel des élèves. Sans outil dédié, ces tâches se dispersent entre messages, agendas personnels, notes séparées et relances manuelles.

Pour les élèves, le problème principal est de voir simplement les créneaux disponibles d’un coach et de réserver sans échange inutile.

## Utilisateurs Cibles

### Coachs

Utilisateur principal côté produit.

Besoins:
- définir et modifier leurs disponibilités;
- définir et modifier leurs tarifs;
- recevoir une notification push lors d’une nouvelle demande;
- voir les nouvelles demandes mises en évidence;
- consulter la liste de leurs élèves;
- ajouter une note/remarque privée unique sur chaque élève;
- consulter l’historique d’un élève;
- suivre les packs de cours individuels d’un élève;
- donner un pack de cours individuels à un élève;
- gérer leur activité depuis le téléphone.

### Élèves

Utilisateur principal côté réservation.

Besoins:
- créer un profil;
- consulter les disponibilités du coach;
- demander un créneau;
- ajouter un commentaire libre lors d’une demande;
- suivre le statut en attente, confirmé, refusé ou expiré;
- retrouver ses informations de profil et ses réservations.

## Proposition de Valeur

Pour un coach de padel, NextPoint centralise les disponibilités, réservations, tarifs et informations élèves dans une expérience mobile simple, afin de réduire la coordination manuelle et rendre les nouveaux créneaux immédiatement visibles.

Pour un élève, NextPoint permet de demander un cours disponible sans passer par une discussion longue avec le coach.

## Objectif MVP

Permettre à un élève de créer un profil, consulter les disponibilités d’un coach et demander un créneau, puis permettre au coach de voir les demandes mises en évidence, gérer ses tarifs, créer des cours individuels ou collectifs, consulter l’historique de ses élèves, suivre leurs packs et ajouter des notes privées.

## Plateformes

Priorité:
1. App mobile — expérience principale du MVP.
2. Webapp — expérience complémentaire, utilisable sur ordinateur et navigateur mobile.

Orientation produit:
- mobile-first pour les parcours coach et élève;
- webapp fonctionnelle mais non prioritaire pour les micro-interactions avancées;
- cohérence de données entre app mobile et webapp.
- identité visuelle Roland-Garros premium: terre battue, ocre, vert profond, fonds chauds.

## Périmètre MVP

### Inclus

- Création de profil élève.
- Profil coach basique.
- Plages de disponibilités coach générant des créneaux.
- Disponibilités ponctuelles, quotidiennes ou hebdomadaires.
- Durées de créneau 1h et 1h30, avec 1h30 comme référence.
- Lieu/club simple sur disponibilité/réservation, avec `Les Bruyères Centre Sportif` comme valeur initiale.
- Demande de réservation de créneau par un élève.
- Validation ou refus de la demande par le coach.
- Maximum 2 demandes en attente possibles sur un même créneau; blocage définitif à la confirmation.
- Expiration automatique d’une demande après 7 jours.
- Mise en évidence des nouvelles demandes côté coach.
- Notification push coach pour nouvelle demande.
- Notification push demandeur lorsque le coach valide ou refuse.
- Onglet Notifications coach et élève.
- Historique in-app des notifications même si les push système sont refusées.
- Commentaire libre possible lors d’une demande.
- Commentaire optionnel du coach lors d’un refus, visible par l’élève.
- Demande de cours collectif avec sélection de joueurs de l’application.
- Création de cours individuel par le coach.
- Création de cours individuel récurrent hebdomadaire par le coach uniquement.
- Création de cours collectif par le coach avec sélection d’élèves.
- Gestion des tarifs par le coach.
- Liste des élèves côté coach.
- Création manuelle d’une fiche élève par le coach.
- Notes/remarques privées uniques du coach sur ses élèves.
- Historique élève visible par le coach sur la fiche élève.
- Pack de cours individuels donné par le coach à un élève pour suivre les cours inclus, utilisés et restants.
- Interface préparée pour français, anglais et espagnol.
- Light theme et dark theme définis via tokens de design.
- Page publique avant inscription limitée aux tarifs et au bouton `S’inscrire`.
- Agenda élève hebdomadaire par défaut, avec tarifs au-dessus de l’agenda.
- Planning coach avec vue semaine prioritaire, vue jour secondaire et bouton de switch.
- Validation/refus d’une demande depuis l’écran de détail.
- Statistiques coach avec indicateur explicitement libellé `revenu estimé`.
- Expérience mobile-first.
- Webapp couvrant les fonctions essentielles.

### Non Inclus pour le MVP

- Paiement intégré.
- Messagerie complète coach/élève hors réservation.
- Analyse vidéo ou statistiques sportives avancées.
- Gestion multi-coachs pour club/structure complexe.
- Marketplace publique de coachs.
- Synchronisation avec Google Agenda, prévue en P1.
- Notifications push avancées, prévues en P1.
- Messagerie liée à une réservation, prévue en P1.
- Écran coach regroupant les messageries des créneaux/réservations/événements, prévu en P1.
- Génération de facture, prévue en V2.
- Annulation élève possible jusqu’à l’heure du cours en P0; modification de réservation réservée au coach en P0.
- Notification élève paramétrable lorsqu’une place se libère sur un cours collectif en P1.
- Synchronisation Google Agenda P1 côté coach et élève si connecté.
- Masquage des tarifs par élève.
- Heures pleines/heures creuses.
- Suivi de progression de l’élève.
- Adaptation tennis/squash.
- Gestion de plusieurs coachs par élève.

## Parcours MVP

### Parcours Élève

1. L’élève crée son profil.
2. L’élève accède à la fiche ou l’espace du coach.
3. L’élève consulte les disponibilités.
4. L’élève demande un créneau disponible.
5. L’élève voit la confirmation d’envoi de la demande.

### Parcours Coach

1. Le coach configure ses disponibilités.
2. Le coach configure ses tarifs.
3. Le coach reçoit ou voit une nouvelle demande mise en évidence.
4. Le coach valide ou refuse la demande.
5. Le coach consulte la liste de ses élèves.
6. Le coach ouvre une fiche élève.
7. Le coach ajoute ou modifie des notes/remarques privées.

## Exigences Produit Initiales

### Réservations

- Un créneau disponible peut recevoir jusqu’à 2 demandes en attente.
- Une demande doit être visible côté coach.
- Une demande peut contenir un commentaire libre.
- Le coach doit pouvoir valider ou refuser une demande.
- Le coach peut ajouter un commentaire optionnel lors d’un refus.
- Les nouvelles demandes doivent être visuellement distinguées jusqu’à action du coach.
- La confirmation d’une demande bloque le créneau et traite les autres demandes en attente du même créneau.

### Disponibilités

- Le coach doit pouvoir publier ses disponibilités.
- L’élève doit voir uniquement les créneaux réservables.
- Le système doit éviter les doubles réservations confirmées tout en autorisant jusqu’à 2 demandes en attente par créneau.

### Tarifs

- Le coach doit pouvoir saisir et modifier ses tarifs.
- Les tarifs doivent être attachés à une durée précise.
- Les tarifs doivent être visibles par l’élève avant réservation ou depuis la fiche coach.
- Le tarif applicable doit être sélectionné automatiquement selon le type de cours et la durée.
- Heures pleines/heures creuses sont hors P0.

### Élèves et Notes

- Le coach doit voir ses élèves.
- Le coach doit pouvoir ajouter des notes/remarques sur chaque élève.
- Le coach doit pouvoir consulter l’historique élève et suivre les packs de cours individuels.
- Les notes coach sont privées et non visibles par l’élève.

## Contraintes et Hypothèses

- Le produit démarre avec une logique coach individuel plutôt qu’une logique club.
- Le MVP démarre avec un seul coach désigné.
- En P0, l’association élève/coach est directe: tous les élèves de l’application sont visibles par le coach unique.
- En évolution future, le coach donnera probablement un lien d’invitation ou un code pour que l’élève l’ajoute dans l’application.
- Le téléphone est le support de décision prioritaire pour l’UX.
- Le MVP peut fonctionner sans paiement intégré.
- Le MVP peut fonctionner sans marketplace publique ni invitation, car il n’y a qu’un coach.
- La disponibilité exacte du coach est la source de vérité pour les réservations.
- La priorité produit est l’expérience coach, la rapidité de réservation et la simplicité de gestion planning.

## Risques Produit

- Si la gestion des disponibilités est trop lourde, les coachs ne maintiendront pas leur planning.
- Si l’élève ne comprend pas immédiatement quel créneau réserver, le gain par rapport aux messages manuels disparaît.
- Si les nouvelles réservations ne sont pas clairement mises en évidence, le coach risque de les manquer.
- Si l’app et la webapp divergent, le MVP deviendra coûteux à maintenir.

## Questions Ouvertes

Toutes les décisions bloquantes identifiées pour le PRD sont tranchées.

## Prochaine Étape BMAD

Passer à `bmad-prd` après validation ou correction de ce brief.
