# Validation PRD — NextPoint

Date: 2026-06-06  
Workflow BMAD: `bmad-prd:validate`  
Document évalué: `_bmad-output/planning-artifacts/prd.md`  
Statut global: prêt pour UX détaillée et architecture

## Résumé

Le PRD est maintenant suffisamment structuré pour servir de base au workflow UX. Il contient le problème, les utilisateurs, le périmètre MVP, les exclusions, les parcours, les exigences fonctionnelles, les règles métier, les critères d’acceptation, les données conceptuelles, les permissions, les risques et le découpage fonctionnel préliminaire.

Les décisions structurantes sur validation coach, blocage du créneau, notification push coach P0, association directe P0, disponibilités, récurrence, libellé élève, tarifs, langues, périmètre single-coach, interaction validation/refus et libellé revenu estimé ont été tranchées.

## Contrôles BMAD

| Critère | Statut | Commentaire |
| --- | --- | --- |
| Problème utilisateur clair | OK | La friction coach/élève autour des disponibilités est explicite. |
| Utilisateurs identifiés | OK | Coach indépendant et élève sont séparés avec besoins distincts. |
| MVP cadré | OK | P0/P1/P2 et exclusions réduisent le risque de scope creep. |
| Parcours principaux couverts | OK | Onboarding, réservation, traitement coach et suivi élève sont décrits. |
| Exigences testables | OK | Les exigences sont numérotées et formulées comme capacités vérifiables. |
| Critères d’acceptation | OK | Les scénarios critiques ont des résultats attendus. |
| Règles métier | OK | Double booking, visibilité, notes privées et tarifs sont cadrés. |
| Confidentialité | OK | Notes privées et contrôle d’accès sont explicitement traités. |
| Mobile-first | OK | La priorité mobile est répétée dans objectifs, NFR et exigences. |
| Webapp | OK | La webapp est incluse comme surface P0 fonctionnelle. |
| Données conceptuelles | OK | Les entités nécessaires sont listées sans imposer d’architecture. |
| Design tokens | OK | Palette light/dark définie dans `design-tokens.md`. |
| Questions ouvertes | OK | Aucune question bloquante PRD restante. |
| Prêt pour UX | OK | Inventaire initial des écrans créé dans `ux-screen-inventory.md`. |
| Prêt pour architecture | OK | Les décisions structurantes nécessaires au cadrage architecture sont prises. |
| Prêt pour stories | Attention | Possible après UX ou décisions minimales sur réservation/disponibilités. |

## Décisions Structurantes Validées

- Réservation P0: validation ou refus par le coach.
- Créneau en attente: bloqué pour les autres élèves.
- Expiration demande: 7 jours.
- Association élève/coach P0: directe, tous les élèves sont visibles par le coach unique.
- Invitation lien/code coach: future évolution.
- Limite demandes: 10 demandes en attente (`pending`) par élève.
- Annulation et modification: P1.
- Notifications push coach sur nouvelle demande: P0.
- Notifications push demandeur sur validation/refus coach: P0.
- Onglet Notifications coach et élève: P0.
- Notifications in-app créées même si les push système sont refusées.
- Connexion Google Agenda: P1.
- Messagerie liée à une réservation: P1.
- Annulation élève P1: possible jusqu’à l’heure du cours.
- Notifications P1 annulation/modification: push à la partie qui n’a pas initié l’action.
- Notification P1 place collective disponible: paramétrable côté compte élève.
- Google Agenda P1: synchronisation des réservations confirmées côté coach et côté élève si connecté.
- Page de suivi des statistiques coach: P0, version légère.
- Gestion disponibilités coach: écran dédié en plus du planning.
- Demandes `pending`: visibles dans le planning coach avec couleur distincte ou surbrillance.
- Onglet demandes coach dédié: retiré du P0.
- Disponibilités P0: plages générant des créneaux, avec récurrence.
- Récurrence P0: ponctuelle, quotidienne ou hebdomadaire.
- Libellé élève après demande: `demande envoyée`.
- Durées P0: 1h et 1h30; 1h30 comme référence.
- Lieu/club: liste simple avec `Les Bruyères Centre Sportif` initial.
- Tarifs P0: plusieurs tarifs par durée/type.
- Profil élève P0: nom, téléphone, email, niveau, âge.
- Notes coach P0: note libre unique.
- Cours collectif P0: demande élève avec sélection de joueurs, création coach avec sélection d’élèves.
- Centre notifications P0: historique in-app pour coach et élève.
- Planning coach P0: vues jour/semaine avec bouton de switch.
- Design tokens: light/dark theme Roland-Garros premium validés.
- Langues front: français, anglais, espagnol.
- MVP: padel-only, single-coach, un coach par élève.

## Décisions Restantes Avant Architecture

Aucune décision bloquante restante identifiée.

## Recommandation Produit

Pour tenir un MVP strict et mobile-first:

- association directe élève/coach en P0;
- lien/code d’invitation coach en future évolution;
- validation coach des demandes;
- blocage du créneau pendant la demande;
- expiration automatique après 7 jours;
- plages générant des créneaux;
- récurrence P0 ponctuelle, quotidienne ou hebdomadaire;
- notification push coach P0 sur nouvelle demande;
- annulation/modification en P1;
- notifications avancées en P1;
- Google Agenda en P1;
- messagerie sur réservation en P1;
- statistiques coach P0 légères;
- tarifs par durée/type;
- interface i18n français/anglais/espagnol.

## Gaps Non Bloquants

- Pas encore de wireframes; liste d’écrans initiale créée.
- Pas encore d’architecture technique.
- Pas encore de backlog détaillé en stories.
- Pas encore de wireframes pour les écrans P1 annulation/modification, Google Agenda et notification place collective disponible.
- Pas encore de wireframes haute fidélité.

## Verdict

Le PRD est bon pour passer à `bmad-ux`. Il ne doit pas encore servir directement à coder toute l’application: il faut d’abord cadrer les écrans et valider les derniers détails de règles produit.
