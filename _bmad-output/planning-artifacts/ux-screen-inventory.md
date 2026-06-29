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
- bouton principal `S’inscrire`;
- éventuellement message de valeur simple: réserver plus facilement un cours.

Décisions:
- La page publique n’affiche pas les disponibilités avant inscription.
- La page publique affiche seulement les tarifs et un bouton principal `S’inscrire`.

#### E-STUDENT-002 — Inscription / Connexion

Objectif: permettre à l’élève d’accéder à l’application.

Contenu:
- création compte;
- connexion;
- profil minimal: nom, téléphone, email, niveau, âge.
- si l’email correspond à un compte provisionné, ne pas créer de doublon et demander d’utiliser le lien d’activation.

#### E-STUDENT-002b — Activation du Compte Élève

Objectif: permettre à un élève provisionné par le coach de définir son mot de passe.

Contenu:
- nouveau mot de passe;
- confirmation du mot de passe;
- états lien invalide, expiré, déjà utilisé ou compte non activable;
- confirmation de succès et retour vers la connexion.

#### E-STUDENT-003 — Accueil Élève / Disponibilités Coach

Objectif: permettre à l’élève de voir rapidement les disponibilités du coach par défaut.

Contenu:
- agenda hebdomadaire par défaut des disponibilités;
- bouton pour passer en vue jour;
- créneaux disponibles et demandables uniquement;
- cours propres à l’élève connecté;
- tarifs individuels et collectifs mis en évidence;
- bannière tarifaire au-dessus de l’agenda;
- action principale: demander un créneau.

Décision:
- L’agenda principal élève affiche exclusivement les disponibilités demandables et les cours de cet élève.
- Les tarifs sont affichés au-dessus de l’agenda.
- La vue agenda élève est hebdomadaire par défaut, avec possibilité de passer en vue jour.

#### E-STUDENT-004 — Détail Créneau / Demande

Objectif: confirmer la demande de réservation.

Contenu:
- date;
- heure;
- durée;
- lieu `Les Bruyères Centre Sportif`;
- tarif applicable;
- tarif applicable sélectionné automatiquement selon type de cours et durée;
- bouton de demande;
- message indiquant validation coach nécessaire.
- champ commentaire libre pour préciser une demande de cours, par exemple un thème de travail.

Cas collectif:
- l’élève peut choisir une demande de cours collectif;
- l’élève peut sélectionner des joueurs de l’application avec qui il veut faire le collectif;
- le demandeur reçoit une notification push quand le coach valide ou refuse.

Décisions:
- Le tarif applicable est sélectionné automatiquement selon le choix individuel/collectif et la durée.
- Si un pack de cours individuels est disponible et applicable, le système doit afficher l’impact sur les sessions restantes.

#### E-STUDENT-005 — Planning Élève / Demandes

Objectif: permettre à l’élève de suivre ses demandes et réservations validées.

Contenu:
- demandes en attente;
- demandes confirmées;
- demandes refusées;
- demandes expirées;
- réservations annulées ou modifiées;
- vue proche d’un emploi du temps personnel.

Décision:
- Ne pas séparer `Demandes` et `Planning`: une seule page avec filtres.

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
- bouton de switch vue semaine / vue jour;
- créneaux disponibles;
- demandes en attente visibles directement dans le planning;
- demandes en attente affichées dans une couleur distincte ou en surbrillance;
- jusqu’à 2 demandes en attente possibles sur un même créneau;
- réservations confirmées;
- accès rapide à création de plage/créneau;
- indicateur de nouvelles demandes.

Décision:
- Le planning coach propose une vue semaine prioritaire/par défaut et une vue jour secondaire, avec un bouton pour changer de mode.

#### E-COACH-002 — Détail Demande depuis Planning

Objectif: traiter une demande `pending` ouverte depuis le planning.

Contenu:
- élève;
- date/heure;
- durée;
- lieu;
- tarif;
- actions: valider, refuser;
- champ commentaire optionnel en cas de refus;
- badge nouveau;
- temps restant avant expiration 7 jours.

Décisions:
- La validation/refus se fait depuis l’écran de détail de la demande.
- Le refus ne demande pas de confirmation.
- Le commentaire de refus, s’il existe, est repris dans la notification envoyée à l’élève.

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
- créer un cours individuel récurrent hebdomadaire.
- créer un cours collectif en sélectionnant les élèves concernés.
- demander l’horizon de génération des récurrences, avec 1 mois comme valeur par défaut.

Questions critiques:
- La gestion des disponibilités est un écran dédié en plus du planning coach.
- La récurrence P0 est limitée à ponctuelle, quotidienne ou hebdomadaire.
- La récurrence de cours P0 est réservée au coach et limitée à hebdomadaire.
- L’élève ne peut pas créer de demande récurrente.
- Le coach doit-il pouvoir modifier une série entière ou seulement une occurrence ?

#### E-COACH-003b — Création Cours Individuel

Objectif: permettre au coach de créer directement un cours individuel, en plus du collectif.

Contenu:
- sélection de l’élève;
- date/heure;
- durée 1h ou 1h30;
- lieu `Les Bruyères Centre Sportif`;
- tarif applicable;
- option de récurrence hebdomadaire;
- statut `confirmed` par défaut.

#### E-COACH-004 — Élèves / Recherche

Objectif: retrouver rapidement un élève.

Contenu:
- liste de tous les élèves;
- recherche par nom;
- filtre par niveau;
- filtre par tranche d’âge;
- création manuelle d’un élève;
- accès fiche élève.

Décisions:
- Le filtre âge est par tranches: enfants par tranches de 2 ans à partir de 5 ans, adultes par dizaines.
- Le niveau est une liste fermée de niveaux padel de 1 à 10.

#### E-COACH-005 — Fiche Élève

Objectif: consulter un profil élève et saisir une note privée.

Contenu:
- nom;
- téléphone;
- email;
- niveau;
- âge;
- note privée unique;
- historique des demandes, réservations, annulations, modifications et packs associés;
- pack de cours individuels donné par le coach: cours inclus, utilisés, restants;
- action coach pour marquer une session de pack comme consommée;
- téléphone et email cliquables pour appel/mail.
- badge d’état du compte;
- bouton supérieur droit `Générer le lien d’activation` ou `Régénérer le lien` uniquement pour `pending_activation`;
- action copier/partager et expiration visible après génération.

Décisions:
- La note privée n’est pas en autosave.
- La note se modifie via bouton `Modifier`, puis sauvegarde via bouton `Enregistrer`.
- Seul le coach peut donner/rattacher un pack de cours individuels à un élève.

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

Décision:
- La gestion des tarifs est dans un écran dédié.

#### E-COACH-007 — Gestion Tarifs

Objectif: gérer les tarifs visibles par les élèves.

Contenu:
- tarifs individuels;
- tarifs collectifs;
- durée 1h/1h30;
- prix;
- activation/désactivation;
- suppression;
- critères d’applicabilité définis par le coach, par exemple certains élèves, tarif étudiant, tarif senior, week-end ou jour férié.

Décisions:
- Les tarifs sont attachés à des durées précises.
- Heures pleines/heures creuses ne sont pas incluses en P0.

#### E-COACH-009 — Notifications Coach

Objectif: lister les notifications in-app même si les notifications push système sont refusées.

Contenu:
- nouvelles demandes;
- annulations ou modifications initiées par l’élève;
- événements de réservation pertinents;
- état lu/non lu;
- lien vers la demande ou réservation concernée.

#### E-COACH-010 — Messagerie Coach

Objectif: permettre au coach de retrouver et traiter les discussions liées aux créneaux, demandes, réservations ou événements.

Contenu:
- liste des discussions liées aux créneaux, demandes, réservations ou événements du coach;
- dernier message;
- statut lu/non lu;
- contexte lié;
- accès au détail du créneau, de la demande, de la réservation ou de l’événement concerné;
- réponse coach dans la discussion.

#### E-COACH-008 — Statistiques Coach

Statut: P0, version légère.

Objectif: donner une vue simple de l’activité coach.

Contenu envisagé:
- nombre de cours effectués;
- nombre d’heures;
- indicateur explicitement libellé `revenu estimé`, calculé à partir des tarifs et heures;
- élèves les plus actifs;
- taux de remplissage ou nombre de créneaux confirmés;
- périodes: mois prioritaire, trimestre et année, semaine en secondaire si faible coût.

Décision:
- Le mois est la période essentielle; trimestre et année sont utiles; semaine est accessoire.

### Écrans Transverses P0

#### E-P0-001 — Annulation / Modification Réservation

Objectif: permettre au coach d’annuler ou modifier une réservation confirmée en P0, et permettre à l’élève d’annuler une réservation confirmée sans action de modification.

Règles UX:
- l’élève peut annuler jusqu’à l’heure du cours;
- le coach peut annuler une réservation;
- la modification P0 est réservée au coach;
- l’élève ne voit pas d’action de modification, seulement l’annulation si elle est autorisée;
- la partie qui n’a pas initié l’action reçoit une notification push et une notification in-app;
- une annulation sur cours collectif peut libérer une place.

### Écrans Coach P1 Déjà Validés

- Google Agenda.
- Messagerie élève et fonctionnalités de messagerie avancées hors onglet Messagerie coach P0.
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

### Écrans V2 Validés

#### E-V2-001 — Génération de Facture

Objectif: permettre au coach de générer une facture à partir d’une réservation, d’un pack ou d’une période d’activité.

Statut:
- V2, hors P0/P1.

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
- Messagerie
- Profil

## Points UX À Trancher

1. Gestion d’une récurrence coach: modification d’une série entière, d’une occurrence seule, ou des deux ?
