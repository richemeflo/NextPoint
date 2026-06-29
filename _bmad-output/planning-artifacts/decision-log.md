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
- Un même créneau peut avoir au maximum 2 demandes `pending`; une réservation confirmée bloque ensuite le créneau.
- Une demande `pending` expire après 7 jours.
- Un élève peut avoir au maximum 10 demandes `pending`.
- Un créneau peut avoir au maximum 2 demandes `pending`.
- Le libellé élève après envoi est `demande envoyée`.
- L’agenda principal élève affiche exclusivement les disponibilités demandables et les cours de cet élève.
- Le coach peut créer un cours individuel.
- Le coach peut créer un cours individuel récurrent hebdomadaire.
- L’élève ne peut pas créer de demande récurrente.
- Le coach peut créer un cours collectif en sélectionnant des élèves.
- L’élève peut demander un cours collectif en sélectionnant des joueurs de l’application.
- L’annulation de réservation est P0 pour le coach et l’élève.
- La modification de réservation est P0 et réservée au coach.
- L’élève peut annuler jusqu’à l’heure de début du cours.
- Toute nouvelle demande déclenche une notification push coach en P0.
- Validation/refus par le coach déclenche une notification push au demandeur en P0.
- Annulation par le coach ou l’élève, et modification par le coach, déclenchent une notification push à la partie qui n’a pas initié l’action en P0.
- Chaque notification push crée aussi une notification in-app visible dans l’onglet Notifications.
- Coach et élève disposent d’un onglet Notifications.
- Les statistiques coach sont P0 en version légère, avec `revenu estimé` comme libellé explicite.
- Le planning coach utilise la vue semaine comme vue prioritaire/par défaut, avec vue jour secondaire.
- Le profil élève côté coach affiche l’historique des demandes, cours, annulations, modifications et packs.
- Le coach peut rattacher un pack de cours individuels à un élève pour suivre les cours inclus, utilisés et restants.
- Seul le coach peut donner/rattacher un pack de cours individuels à un élève.
- Un pack de cours individuels peut être décrémenté lorsqu’un cours individuel applicable est confirmé ou consommé.
- Les tarifs visibles couvrent individuel, collectif, durée et prix; le paiement est hors P0.
- Les tarifs sont attachés à une durée précise; heures pleines/heures creuses sont hors P0.
- Le tarif applicable est sélectionné automatiquement selon type de cours et durée.
- La page publique affiche uniquement les tarifs et le bouton `S’inscrire`, sans disponibilités.
- Côté élève, les tarifs sont affichés au-dessus de l’agenda hebdomadaire par défaut.
- Une demande élève peut contenir un commentaire libre.
- Un refus coach ne demande pas de confirmation et peut contenir un commentaire transmis à l’élève.
- La page élève `Planning/Demandes` reste unique avec filtres.
- Les filtres âge côté coach utilisent des tranches; le niveau est une liste fermée cible 1 à 10.
- La note privée se modifie via `Modifier` puis `Enregistrer`, sans autosave.
- La gestion des tarifs est dans un écran dédié.
- Les statistiques coach priorisent le mois, puis trimestre/année; semaine est secondaire.
- L’interface doit être préparée pour français, anglais et espagnol.
- L’identité visuelle suit la direction Roland-Garros premium définie dans `design-tokens.md`.
- Une fiche élève créée par le coach provisionne un compte Auth `pending_activation`.
- Le coach peut générer ou régénérer un lien d’activation valable 24 heures tant que le compte n’est pas activé.
- Le lien permet uniquement à l’élève de définir son mot de passe; la régénération invalide l’ancien lien.
- Les états de compte élève P0 sont `pending_activation`, `active`, `suspended`, `deleted`.
- Email ou téléphone déjà présent bloque la création d’un nouvel élève.
- `deleted` est une suppression logique terminale en P0 et conserve l’identité ainsi que l’historique.

## Décisions P1 Validées

- Google Agenda: synchronisation des réservations confirmées côté coach et élève si le compte est connecté.
- Messagerie contextualisée sur une réservation.
- Écran coach regroupant les messageries liées aux créneaux/réservations/événements.
- Notification paramétrable côté élève quand une place se libère sur un cours collectif.
- Horizon de visibilité des disponibilités côté élève configurable par le coach: 1 semaine, 2 semaines, 3 semaines, 1 mois, 2 mois, 3 mois ou non défini (`pas set`).

## Décisions V2 Validées

- Génération de facture.

## Décisions Hors P0

- Paiement intégré.
- Marketplace publique de coachs.
- Multi-coach/club.
- Messagerie générale hors réservation.
- Génération de facture avant la V2.
- Statistiques élève.
- Analyse sportive ou suivi de progression.
