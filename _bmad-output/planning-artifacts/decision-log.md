# Decision Log — NextPoint

Date: 2026-06-07  
Workflow BMAD: `bmad-prd`  
Statut: décisions produit structurantes à jour

## Décisions P0 Validées

- MVP single-coach, padel-only, mobile-first avec webapp complémentaire.
- Association élève/coach directe en P0: tous les élèves de l’application sont visibles par le coach unique.
- L’élève ne voit qu’un seul coach en P0.
- Le coach publie des plages de disponibilité générant des créneaux de 1h ou 1h30.
- Les disponibilités peuvent être ponctuelles, quotidiennes ou hebdomadaires.
- Le lieu initial est `Les Bruyères Centre Sportif`.
- L’élève envoie une demande de réservation; le coach valide ou refuse depuis le détail de la demande.
- Une demande `pending` bloque le créneau pour les autres élèves.
- Une demande `pending` expire après 7 jours.
- Un élève peut avoir au maximum 10 demandes `pending`.
- Le libellé élève après envoi est `demande envoyée`.
- L’agenda principal élève affiche exclusivement les disponibilités demandables et les cours de cet élève.
- Le coach peut créer un cours individuel.
- Le coach peut créer un cours collectif en sélectionnant des élèves.
- L’élève peut demander un cours collectif en sélectionnant des joueurs de l’application.
- L’annulation de réservation est P0.
- La modification de réservation est P0.
- L’élève peut annuler jusqu’à l’heure de début du cours.
- Toute nouvelle demande déclenche une notification push coach en P0.
- Validation/refus par le coach déclenche une notification push au demandeur en P0.
- Annulation/modification déclenche une notification push à la partie qui n’a pas initié l’action en P0.
- Chaque notification push crée aussi une notification in-app visible dans l’onglet Notifications.
- Coach et élève disposent d’un onglet Notifications.
- Les statistiques coach sont P0 en version légère, avec `revenu estimé` comme libellé explicite.
- Les tarifs visibles couvrent individuel, collectif, durée et prix; le paiement est hors P0.
- L’interface doit être préparée pour français, anglais et espagnol.
- L’identité visuelle suit la direction Roland-Garros premium définie dans `design-tokens.md`.
- Le planning coach propose une vue jour et une vue semaine avec bouton de switch.

## Décisions P1 Validées

- Google Agenda: synchronisation des réservations confirmées côté coach et élève si le compte est connecté.
- Messagerie contextualisée sur une réservation.
- Notification paramétrable côté élève quand une place se libère sur un cours collectif.
- Horizon de visibilité des disponibilités côté élève configurable par le coach: 1 semaine, 2 semaines, 3 semaines, 1 mois, 2 mois, 3 mois ou non défini (`pas set`).
- Lien/code d’invitation coach pour associer un élève dans une évolution future.

## Décisions Hors P0

- Paiement intégré.
- Marketplace publique de coachs.
- Multi-coach/club.
- Messagerie générale hors réservation.
- Statistiques élève.
- Analyse sportive ou suivi de progression.
