# Inventaire UX — NextPoint

Date: 2026-06-06  
Workflow BMAD: `bmad-ux`  
Statut: brouillon initial à valider  
Source: élicitation utilisateur du 2026-06-06

## Principes UX

- Priorité: expérience coach, rapidité de réservation et simplicité de gestion planning.
- Support principal: téléphone.
- Surface secondaire: webapp.
- MVP: single-coach, padel-only.
- Élève P0: accès automatique au coach unique.
- Coach P0: tous les élèves inscrits ou créés manuellement sont visibles par le coach.
- Direction visuelle: identité Roland-Garros premium, terre battue, ocre, vert profond, fonds chauds.
- Tokens de référence: `_bmad-output/planning-artifacts/design-tokens.md`.

## Navigation Élève

### Écrans Élève P0

#### E-STUDENT-001 — Page Publique Avant Inscription

Objectif: présenter le coach et pousser vers l’inscription.

Contenu:
- présentation courte du coach;
- tarifs visibles;
- bouton/lien vers inscription;
- éventuellement message de valeur simple: réserver plus facilement un cours.

Questions:
- La page publique doit-elle afficher les disponibilités avant inscription, ou seulement tarifs + inscription ?
- Le bouton principal doit-il dire `S’inscrire`, `Demander un cours`, ou `Voir les disponibilités` ?

#### E-STUDENT-002 — Inscription / Connexion

Objectif: permettre à l’élève d’accéder à l’application.

Contenu:
- création compte;
- connexion;
- profil minimal: nom, téléphone, email, niveau, âge.

#### E-STUDENT-003 — Accueil Élève / Disponibilités Coach

Objectif: permettre à l’élève de voir rapidement les disponibilités du coach par défaut.

Contenu:
- calendrier ou agenda des disponibilités;
- créneaux disponibles et demandables uniquement;
- cours propres à l’élève connecté;
- tarifs individuels et collectifs mis en évidence;
- bannière tarifaire au-dessus ou au-dessous de l’agenda;
- action principale: demander un créneau.

Décision:
- L’agenda principal élève affiche exclusivement les disponibilités demandables et les cours de cet élève.

Questions:
- Les tarifs doivent-ils être au-dessus de l’agenda pour rassurer avant choix, ou sous l’agenda pour ne pas ralentir la réservation ?
- Vue agenda: liste de créneaux par jour, calendrier hebdo, ou calendrier mensuel + détails ?

#### E-STUDENT-004 — Détail Créneau / Demande

Objectif: confirmer la demande de réservation.

Contenu:
- date;
- heure;
- durée;
- lieu `Les Bruyères Centre Sportif`;
- tarif applicable;
- bouton de demande;
- message indiquant validation coach nécessaire.

Cas collectif:
- l’élève peut choisir une demande de cours collectif;
- l’élève peut sélectionner des joueurs de l’application avec qui il veut faire le collectif;
- le demandeur reçoit une notification push quand le coach valide ou refuse.

Questions:
- Le tarif applicable doit-il être sélectionné automatiquement ou choisi par l’élève ?
- Faut-il un champ commentaire libre lors de la demande ?

#### E-STUDENT-005 — Planning Élève / Demandes

Objectif: permettre à l’élève de suivre ses demandes et réservations validées.

Contenu:
- demandes en attente;
- demandes confirmées;
- demandes refusées;
- demandes expirées;
- réservations annulées ou modifiées;
- vue proche d’un emploi du temps personnel.

Question:
- Faut-il séparer `Demandes` et `Planning`, ou faire une seule page avec filtres ?

#### E-STUDENT-006 — Compte Élève

Objectif: gérer les informations personnelles.

Contenu:
- nom;
- téléphone;
- email;
- niveau;
- âge;
- langue préférée.

Évolution P1:
- connexion Google Agenda si disponible;
- paramètre de notification push pour être averti lorsqu’une place se libère sur un cours collectif.

#### E-STUDENT-007 — Notifications Élève

Objectif: lister les notifications in-app même si les notifications push système sont refusées.

Contenu:
- validation ou refus d’une demande par le coach;
- événements de réservation pertinents;
- état lu/non lu;
- lien vers la demande ou réservation concernée.

### Écrans Élève P2 / Suspendu

#### E-STUDENT-P2-001 — Statistiques Élève

Statut: suspendu, pas P0 ni P1.

Idée:
- récapitulatif des cours;
- volume d’heures;
- éventuellement progression ou historique.

Décision: ne pas inclure tant que la valeur produit n’est pas claire.

## Navigation Coach

### Écrans Coach P0

#### E-COACH-001 — Accueil Coach / Planning

Objectif: donner au coach une vue immédiate de son planning.

Contenu:
- planning du coach;
- bouton de switch vue jour / vue semaine;
- créneaux disponibles;
- demandes en attente visibles directement dans le planning;
- demandes en attente affichées dans une couleur distincte ou en surbrillance;
- réservations confirmées;
- accès rapide à création de plage/créneau;
- indicateur de nouvelles demandes.

Décision:
- Le planning coach propose une vue jour et une vue semaine, avec un bouton pour changer de mode.

#### E-COACH-002 — Détail Demande depuis Planning

Objectif: traiter une demande `pending` ouverte depuis le planning.

Contenu:
- élève;
- date/heure;
- durée;
- lieu;
- tarif;
- actions: valider, refuser;
- badge nouveau;
- temps restant avant expiration 7 jours.

Décisions:
- La validation/refus se fait depuis l’écran de détail de la demande.

Question:
- Le refus doit-il demander une confirmation ?

#### E-COACH-003 — Gestion Disponibilités

Objectif: créer et gérer les plages qui génèrent les créneaux.

Contenu:
- créer une plage;
- choisir date ou récurrence;
- choisir heure début/fin;
- choisir durée: 1h ou 1h30;
- choisir lieu: `Les Bruyères Centre Sportif`;
- activer/désactiver récurrence;
- visualiser créneaux générés.
- créer un cours individuel en sélectionnant l’élève concerné.
- créer un cours collectif en sélectionnant les élèves concernés.

Questions critiques:
- La gestion des disponibilités est un écran dédié en plus du planning coach.
- La récurrence P0 est limitée à ponctuelle, quotidienne ou hebdomadaire.
- Le coach doit-il pouvoir modifier une série entière ou seulement une occurrence ?

#### E-COACH-003b — Création Cours Individuel

Objectif: permettre au coach de créer directement un cours individuel, en plus du collectif.

Contenu:
- sélection de l’élève;
- date/heure;
- durée 1h ou 1h30;
- lieu `Les Bruyères Centre Sportif`;
- tarif applicable;
- statut confirmé par défaut ou demande associée selon règle à détailler.

#### E-COACH-004 — Élèves / Recherche

Objectif: retrouver rapidement un élève.

Contenu:
- liste de tous les élèves;
- recherche par nom;
- filtre par niveau;
- filtre par âge;
- création manuelle d’un élève;
- accès fiche élève.

Questions:
- Le filtre âge doit-il être par âge exact ou par tranches ?
- Le niveau est-il une liste fermée ou un champ libre ?

#### E-COACH-005 — Fiche Élève

Objectif: consulter un profil élève et saisir une note privée.

Contenu:
- nom;
- téléphone;
- email;
- niveau;
- âge;
- note privée unique;
- historique simple des demandes/réservations si disponible.

Questions:
- Le téléphone/email doivent-ils être cliquables pour appel/mail ?
- La note unique doit-elle sauvegarder automatiquement ou via bouton `Enregistrer` ?

#### E-COACH-006 — Profil Coach / Paramètres

Objectif: gérer les informations du compte coach.

Contenu:
- informations du compte;
- langue;
- accès gestion tarifs;
- accès gestion disponibilités;
- paramètres de notification push.

Évolution P1:
- paramètre d’horizon de visibilité des disponibilités côté élève.

Question:
- Les tarifs doivent-ils être dans le profil coach ou dans un écran dédié ?

#### E-COACH-007 — Gestion Tarifs

Objectif: gérer les tarifs visibles par les élèves.

Contenu:
- tarifs individuels;
- tarifs collectifs;
- heures pleines/heures creuses si retenues;
- durée 1h/1h30;
- prix;
- activation/désactivation.

Questions:
- Les tarifs doivent-ils être attachés à une durée précise ou affichés comme grille libre ?
- Heures pleines/heures creuses sont-elles P0 réel ou seulement prévues dans le modèle ?

#### E-COACH-009 — Notifications Coach

Objectif: lister les notifications in-app même si les notifications push système sont refusées.

Contenu:
- nouvelles demandes;
- annulations ou modifications initiées par l’élève;
- événements de réservation pertinents;
- état lu/non lu;
- lien vers la demande ou réservation concernée.

#### E-COACH-008 — Statistiques Coach

Statut: P0, version légère.

Objectif: donner une vue simple de l’activité coach.

Contenu envisagé:
- nombre de cours effectués;
- nombre d’heures;
- indicateur explicitement libellé `revenu estimé`, calculé à partir des tarifs et heures;
- élèves les plus actifs;
- taux de remplissage ou nombre de créneaux confirmés;
- période filtrable simple si possible.

Question:
- Quelles périodes sont nécessaires: semaine, mois, année ?

### Écrans Transverses P0

#### E-P0-001 — Annulation / Modification Réservation

Objectif: permettre au coach ou à l’élève d’annuler ou modifier une réservation confirmée en P0.

Règles UX:
- l’élève peut annuler jusqu’à l’heure du cours;
- la partie qui n’a pas initié l’action reçoit une notification push et une notification in-app;
- une annulation sur cours collectif peut libérer une place.

### Écrans Coach P1 Déjà Validés

- Google Agenda.
- Messagerie sur réservation.
- Notifications push avancées hors événements P0.
- Horizon de visibilité des disponibilités côté élève.

#### E-P1-002 — Paramètres Google Agenda

Objectif: connecter Google Agenda côté coach et côté élève.

Règles UX:
- si le coach connecte Google Agenda, les réservations confirmées peuvent y être ajoutées;
- si l’élève connecte Google Agenda, ses réservations confirmées peuvent y être ajoutées;
- l’interface doit gérer les états connecté/non connecté.

#### E-P1-003 — Notification Place Collective Disponible

Objectif: permettre à l’élève d’activer ou désactiver une notification push lorsqu’une place se libère sur un cours collectif.

Emplacement recommandé:
- compte élève;
- section notifications.

#### E-P1-004 — Horizon Disponibilités Élève

Objectif: permettre au coach de limiter la visibilité de ses disponibilités côté élève.

Options:
- 1 semaine;
- 2 semaines;
- 3 semaines;
- 1 mois;
- 2 mois;
- 3 mois;
- non défini (`pas set`, toutes les disponibilités visibles).

## Navigation Mobile Proposée

### Élève

- Accueil
- Planning/Demandes
- Notifications
- Compte

### Coach

- Planning
- Disponibilités
- Élèves
- Stats
- Notifications
- Profil

## Points UX À Trancher

1. Le refus doit-il demander une confirmation ?
2. Quelles périodes stats coach sont nécessaires: semaine, mois, année ?
3. Tarifs: écran dédié ou sous-section du profil coach ?
4. Élève: une page unique `Planning/Demandes` ou deux pages séparées ?
5. Page publique: afficher les disponibilités avant inscription ou seulement tarifs + bouton inscription ?
