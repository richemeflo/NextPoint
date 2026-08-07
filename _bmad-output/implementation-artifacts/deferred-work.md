# Travaux différés

## Dépendances npm

- Examiner et traiter séparément les 11 vulnérabilités modérées signalées par `npm ci`.
- Vérifier les deux scripts d'installation signalés comme nécessitant une approbation avant toute activation.

## Planning élève

- Ajouter les filtres par statut prévus par la story 4.11 (`pending`, `confirmed`, `refused`, `expired`, `cancelled`, `modified`) ; cette exigence préexistante n'appartient pas au correctif d'annulation avec motif obligatoire.

## Dette d’architecture des réservations

- Aligner les mutations critiques existantes (`request_booking`, approbation, refus, annulation, modification) avec la frontière Edge Functions décrite dans l’architecture, ou formaliser l’usage actuel des RPC transactionnelles comme décision d’architecture.
- Internationaliser côté serveur les notifications et historiques de réservation actuellement persistés en français, idéalement via des codes/templates rendus selon `preferred_language`.
- Recalculer le tarif lorsqu’un cours confirmé passe de 60 à 90 minutes (ou inversement) dans `modify_booking`; ce comportement préexistait à la sélection élève dans une plage.
