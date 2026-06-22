---
name: NextPoint
status: draft
created: 2026-06-07
updated: 2026-06-07
document_language: french
design_reference: DESIGN.md
sources:
  - ../../prd.md
  - ../../product-brief.md
  - ../../ux-screen-inventory.md
  - ../../design-tokens.md
---

# NextPoint — Experience Spine

Fast path UX draft. Les decisions issues des sources sont engagees; les points encore supposes sont marques `[ASSUMPTION]`. `DESIGN.md` est la reference visuelle; ce document specifie l'architecture d'information, les comportements, les etats, les interactions et l'accessibilite.

## Foundation

Application mobile-first avec webapp complementaire. Le telephone est la surface prioritaire pour coach et eleve; la webapp doit couvrir les parcours P0 sans viser la meme finesse de micro-interactions.

[ASSUMPTION] Aucun UI system n'est nomme dans les sources ni present dans le repo. Les composants ci-dessous sont donc decrits comme patterns produit. Si une bibliotheque est choisie en architecture, elle herite de `DESIGN.md` pour les tokens et de ce document pour les comportements.

Contexte produit P0:

| Decision | Contract UX |
|---|---|
| Single-coach | Pas de recherche marketplace, pas de choix de coach en P0. |
| Padel-only | Vocabulaire, niveaux 1 a 10, lieux et types de cours restent padel. |
| Coach prioritaire | Les surfaces coach optimisent planning, demandes, eleves et disponibilites. |
| Eleve direct | Un eleve inscrit accede automatiquement a l'espace du coach unique. |
| i18n FR/EN/ES | Tous les libelles front doivent etre externalises; pas de texte dur dans les composants. |
| Light/dark theme | Les roles visuels referencent les tokens de `DESIGN.md`. |

## Information Architecture

### Surfaces Eleve

| Surface | Source | Reached from | Purpose |
|---|---|---|---|
| Page publique avant inscription | E-STUDENT-001 | URL publique | Presenter le coach, afficher les tarifs, pousser `S'inscrire`; aucune disponibilite visible. |
| Inscription / Connexion | E-STUDENT-002 | Page publique / session expiree | Creer ou retrouver un compte, collecter profil minimal. |
| Activation Compte Eleve | E-STUDENT-002b | Lien transmis par le coach | Definir le mot de passe d'un compte provisionne; gerer expiration et jeton invalide. |
| Accueil Eleve / Disponibilites Coach | E-STUDENT-003 | App open eleve | Voir tarifs puis agenda hebdomadaire des creneaux demandables et cours propres. |
| Detail Creneau / Demande | E-STUDENT-004 | Tap creneau | Verifier date, heure, duree, lieu, tarif, type individuel/collectif, commentaire libre, envoi. |
| Planning Eleve / Demandes | E-STUDENT-005 | Tab Planning | Suivre demandes et reservations avec filtres, sans separer demandes/planning. |
| Notifications Eleve | E-STUDENT-007 | Tab Notifications | Voir les notifications in-app meme sans permission push. |
| Compte Eleve | E-STUDENT-006 | Tab Compte | Profil, langue, parametres notification; Google Agenda en P1. |

Navigation mobile eleve: `Accueil`, `Planning`, `Notifications`, `Compte`.

### Surfaces Coach

| Surface | Source | Reached from | Purpose |
|---|---|---|---|
| Accueil Coach / Planning | E-COACH-001 | App open coach | Vue semaine par defaut, demandes pending visibles, reservations confirmees, creation rapide. |
| Detail Demande depuis Planning | E-COACH-002 | Tap demande pending | Valider ou refuser depuis le detail; commentaire optionnel au refus. |
| Gestion Disponibilites | E-COACH-003 | Tab Disponibilites / CTA planning | Creer plages, duree, lieu, recurrence; visualiser creneaux generes; modifier une occurrence ou une serie via confirmation. |
| Creation Cours Individuel | E-COACH-003b | Disponibilites / Planning | Creer cours individuel, option recurrence hebdomadaire. |
| Eleves / Recherche | E-COACH-004 | Tab Eleves | Rechercher, filtrer, creer fiche eleve manuelle. |
| Fiche Eleve | E-COACH-005 | Liste eleves | Profil, etat du compte, generation conditionnelle du lien d'activation, note privee, historique, packs, actions contact. |
| Profil Coach / Parametres | E-COACH-006 | Tab Profil | Compte, langue, notifications, acces tarifs/disponibilites. |
| Gestion Tarifs | E-COACH-007 | Profil / Parametres | Tarifs individuels/collectifs par duree, activation/desactivation. |
| Statistiques Coach | E-COACH-008 | Tab Stats | Cours, heures, `revenu estime`, eleves actifs; mois prioritaire. |
| Notifications Coach | E-COACH-009 | Tab Notifications | Nouvelles demandes, annulations, modifications, liens vers details. |
| Messagerie Coach | E-COACH-010 | Tab Messagerie | Discussions liees aux creneaux, demandes, reservations ou evenements; le coach peut lire et repondre. |
| Annulation / Modification Reservation | E-P0-001 | Detail reservation | Annuler cote coach ou eleve; modifier uniquement cote coach; notifier l'autre partie. |

Navigation mobile coach: `Planning`, `Disponibilites`, `Eleves`, `Stats`, `Notifications`, `Messagerie`, `Profil`.

La messagerie coach liee aux creneaux, demandes, reservations ou evenements est P0. La messagerie eleve et les comportements avances de conversation restent P1.

## Voice and Tone

Microcopy fonctionnelle, courte et explicite. Le ton de marque vit dans `DESIGN.md`.

| Do | Don't |
|---|---|
| `Demande envoyee` | `Reservation confirmee` apres un simple envoi eleve |
| `Ce creneau n'est plus disponible.` | `Erreur inconnue` |
| `Validation du coach requise.` | `Paiement a venir` ou vocabulaire checkout |
| `Revenu estime` | `Revenu`, `CA`, `Encaisse` |
| `Note privee coach` | `Note eleve` si l'eleve pourrait croire qu'il la voit |
| `1 demande sur 2` | `Slot partiellement occupe` |

Les messages de refus peuvent inclure le commentaire coach. Ils doivent rester factuels et ne pas suggerer un autre creneau en P0.

## Component Patterns

Les specs visuelles vivent dans `DESIGN.md.Components`.

| Component | Use | Behavioral rules |
|---|---|---|
| Bottom tab bar | Mobile coach/eleve | 4 onglets eleve, 7 onglets coach maximum. Badge unread sur Notifications. Pas d'onglet P1 en MVP. |
| Week/day switch | Plannings coach et eleve | Vue semaine par defaut. Le switch conserve le jour/semaine courant et ne recharge pas toute la navigation. |
| Calendar slot | Planning coach/eleve | Tap ouvre detail. Etats: available, pending, booked, expired, cancelled. Sur eleve, seuls available et ses propres cours apparaissent. |
| Pending request marker | Planning coach | Affiche `nouveau` jusqu'a action coach. Si 2 demandes sur creneau, afficher le compteur. |
| Request detail panel | Detail demande | Montre eleve, date, heure, duree, lieu, tarif, commentaire eleve, statut, expiration. Actions coach: valider/refuser. |
| Refusal comment field | Detail demande coach | Visible lors du refus; optionnel; si rempli, transmis a la notification et au detail eleve. Pas de confirmation supplementaire. |
| Availability editor | Gestion disponibilites | Date/recurrence, heure debut/fin, duree 1h/1h30, lieu, preview creneaux generes avant enregistrement. A la modification d'une recurrence, ouvrir une popup demandant si le changement s'applique a cette occurrence seule ou a toute la serie. |
| Course creation form | Coach | Selection eleve(s), type individuel/collectif, date/heure, duree, lieu, tarif auto, recurrence hebdomadaire pour coach uniquement. |
| Price card | Public + accueil eleve | Affiche libelle, prix, duree, type. Aucun CTA de paiement. |
| Student row | Eleves coach | Nom, niveau padel 1 a 10, age/tranche, dernier cours ou prochaine reservation si disponible. Tap ouvre fiche. |
| Private note editor | Fiche eleve coach | Pas d'autosave. Bouton `Modifier`, puis `Enregistrer`. Note jamais exposee eleve. |
| Student activation action | Fiche eleve coach | Visible en haut a droite uniquement pour `pending_activation`; regeneration invalide l'ancien lien; afficher copie/partage et expiration. |
| Pack tracker | Fiche eleve coach | Cours inclus, utilises, restants. Action coach pour marquer une session consommee. Eleve ne peut ni creer ni acheter. |
| Notification row | Onglets Notifications | Etat lu/non lu, type evenement, horodatage, lien vers demande/reservation. Push refuse n'affecte pas l'in-app. |
| Coach message thread | Onglet Messagerie coach | Liste et detail des discussions liees a un creneau, une demande, une reservation ou un evenement. Le coach peut repondre; la messagerie eleve et les comportements avances restent P1. |
| Stat card | Stats coach | Mois prioritaire. `revenu estime` explicitement libelle et non lie a paiement. |
| Empty state | Toute liste | Explique quoi faire ensuite avec une seule action primaire si action utile existe. |

## State Patterns

| State | Surface | Treatment |
|---|---|---|
| Cold app load | Toutes surfaces critiques | Skeletons qui respectent la structure finale; pas de spinner plein ecran sauf auth initiale. |
| Aucun tarif coach | Page publique / Accueil eleve / Onboarding coach | Coach: CTA `Ajouter un tarif`. Eleve public: afficher message tarif indisponible seulement si le coach n'a pas publie. |
| Aucun creneau disponible | Accueil eleve | Message clair: `Aucun creneau disponible pour le moment.` Garder les tarifs visibles. |
| Creneau plus disponible | Detail demande eleve | Bloquer envoi, message `Ce creneau n'est plus disponible.` Retour agenda. |
| Limite 2 demandes atteinte | Detail demande eleve | Bloquer envoi, expliquer que le creneau a deja trop de demandes en attente. |
| Limite 10 demandes eleve atteinte | Envoi demande eleve | Bloquer envoi, inviter a attendre une reponse ou annuler une demande existante. |
| Demande envoyee | Apres envoi eleve | Confirmation `demande envoyee`; statut `en attente`; lien vers Planning/Demandes. |
| Nouvelle demande coach | Planning coach | Slot pending surligne + badge `nouveau`; notification in-app et push si permission. |
| Demande expiree | Planning eleve / coach | Statut `expire`; le creneau redevient disponible selon regles metier. |
| Refus avec commentaire | Planning eleve / Notifications | Commentaire visible dans notification et detail demande. |
| Push permission denied | Notifications | Aucune impasse. Les notifications in-app restent creees et listables. |
| Note privee vide | Fiche eleve coach | Afficher `Aucune note privee` + action `Modifier`. |
| Pack absent | Fiche eleve coach | Afficher action coach `Rattacher un pack`; ne pas afficher achat eleve. |
| Offline | Global | [ASSUMPTION] Lecture possible sur donnees cachees si disponible; creation/validation bloquee avec message explicite pour eviter incoherence booking. |
| Erreur reservation atomique | Envoi/validation | Message factuel, aucune double confirmation visuelle. L'etat serveur gagne. |
| Modification reservation | Detail reservation coach | Seul le coach peut modifier une reservation P0. L'eleve ne voit pas d'action de modification, seulement annulation si autorisee. La modification coach notifie l'eleve par push et in-app. |
| Modification recurrence | Gestion disponibilites | Popup obligatoire: `Appliquer cette modification a cette occurrence seulement ou a toute la serie ?` Les deux choix doivent etre disponibles. |

## Interaction Primitives

- Tap to act sur mobile; pas d'affordance hover-only.
- Les actions destructives ou fortement impactantes utilisent libelles explicites. Exception source: refus coach sans confirmation supplementaire.
- Les formulaires longs sont segmentes par intention: disponibilite, cours individuel, cours collectif, tarif, fiche eleve.
- La navigation ne doit jamais cacher une demande pending coach dans une page secondaire uniquement.
- Les notifications in-app sont navigables: tap row ouvre l'objet lie si applicable.
- Le retour systeme doit garder le contexte planning: apres validation/refus, revenir au planning ou au detail suivant sans perdre semaine/jour courant.
- [ASSUMPTION] Pull-to-refresh est autorise sur plannings et notifications; les mutations sensibles restent des actions explicites.

## Accessibility Floor

Behavioral; les contrastes visuels sont couverts par `DESIGN.md`.

- Cibles tactiles minimales: 44pt iOS / 48dp Android; les slots calendrier ne doivent pas descendre sous une hauteur utilisable.
- Tous les slots de planning annoncent role, heure, duree, statut et disponibilite: exemple `Mardi 18h, 1h30, disponible, Les Bruyeres Centre Sportif`.
- Les statuts ne reposent pas uniquement sur la couleur: texte ou badge obligatoire pour pending, confirmed, refused, expired, cancelled.
- Focus clavier visible sur webapp; ordre de tabulation suit l'ordre de lecture.
- Les notifications importantes doivent etre accessibles via l'onglet Notifications meme si les push systeme sont refuses.
- Les champs erreur doivent indiquer le probleme et l'action possible; ne pas utiliser uniquement un contour rouge.
- Respect `prefers-reduced-motion`; pas d'animation bloquante sur planning ou confirmation.
- Les libelles doivent rester externalisables FR/EN/ES sans concatener des phrases impossibles a traduire.

## Responsive & Platform

| Surface | Mobile | Webapp |
|---|---|---|
| Planning coach | Semaine par defaut avec scroll horizontal ou vertical controle; jour secondaire | Semaine plus large, panneau detail lateral si espace suffisant |
| Agenda eleve | Tarifs au-dessus, semaine par defaut, switch jour | Tarifs + agenda visibles simultanement si largeur suffisante |
| Detail demande | Ecran/panneau plein, action basse | Panneau lateral ou modal; pas de stack de modales |
| Eleves | Liste + recherche en haut | Liste + detail cote a cote possible |
| Stats | Cartes empilees | Cartes en grille simple, mois prioritaire |

Breakpoints exacts a definir en architecture front. [ASSUMPTION] Le comportement minimal est: mobile `< 768px`, tablette `768-1023px`, desktop `>= 1024px`.

## Booking Rules UX

| Rule | UX obligation |
|---|---|
| 2 demandes pending par creneau | Afficher compteur cote coach; bloquer la 3e demande avec message clair. |
| 1 reservation confirmee par creneau | Une validation bloque le creneau; les autres demandes pending du meme creneau passent en `refused` avec la note par defaut `Creneau deja pris`. |
| Expiration 7 jours | Montrer temps restant dans detail coach; afficher `expire` apres echeance. |
| Annulation P0 | Montrer statut `annule`, notifier l'autre partie, liberer creneau/place selon type. |
| Modification P0 | Seul le coach peut modifier une reservation. L'eleve n'a pas d'action de modification P0; il peut annuler selon les regles P0. |
| Recurrent coach weekly | Coach peut creer hebdomadaire; eleve ne peut pas demander recurrent. |
| Modification recurrence | Lors d'une modification, popup de choix: occurrence seule ou serie entiere. |
| Pack individuel | Seul coach attribue et consomme; eleve ne voit jamais un achat ou paiement. |

## Inspiration & Anti-patterns

Sources internes mentionnent une identite Roland-Garros premium et rejettent explicitement marketplace, paiement, messagerie generale et multi-coach P0.

- **Lifted — planning comme surface principale:** le planning doit porter la coordination, pas un inbox cache.
- **Lifted — tarifs avant agenda:** l'eleve connait le prix avant de demander.
- **Rejected — marketplace coachs:** aucun browsing de coachs en P0.
- **Rejected — paiement:** afficher un prix ne doit jamais suggerer transaction.
- **Rejected — messagerie generale:** pas de conversation hors creneau, demande, reservation ou evenement. La messagerie coach liee a ces objets est P0; la messagerie eleve et les comportements avances restent P1.
- **Rejected — statistiques sportives eleve:** hors P0/P1 tant que la valeur n'est pas claire.

## Key Flows

### P0-FLOW-001 — Onboarding Coach (Antoine, coach de padel, dimanche soir)

1. Antoine cree son compte.
2. Il choisit le role `coach`.
3. Il complete son profil.
4. Il ajoute au moins un tarif individuel ou collectif.
5. Il ouvre Gestion Disponibilites.
6. Il cree une plage avec lieu `Les Bruyeres Centre Sportif`, duree 1h30 et recurrence si necessaire.
7. Le systeme affiche un apercu des creneaux generes.
8. **Climax:** Antoine revient au Planning et voit ses creneaux prets a recevoir des demandes.

Failure: aucun tarif configure -> le systeme permet de sauvegarder le profil mais garde un CTA visible `Ajouter un tarif` avant exposition eleve complete.

### P0-FLOW-002 — Onboarding Eleve (Lea, nouvelle eleve, sur son telephone)

1. Lea ouvre la page publique.
2. Elle lit les tarifs et tape `S'inscrire`.
3. Elle cree son compte.
4. Elle complete nom, telephone, email, niveau et age.
5. Elle arrive automatiquement dans l'espace du coach unique.
6. **Climax:** l'accueil affiche les tarifs au-dessus de l'agenda hebdomadaire des creneaux demandables.

Failure: session interrompue -> reprise sur Inscription / Connexion sans perdre le role eleve.

### P0-FLOW-003 — Reservation Eleve (Lea, pause de midi, veut un cours cette semaine)

1. Lea ouvre Accueil Eleve.
2. Elle consulte les tarifs visibles au-dessus de l'agenda.
3. Elle bascule en vue jour si la semaine est trop dense.
4. Elle tape un creneau disponible.
5. Le detail affiche date, heure, duree, lieu, tarif applicable et validation coach requise.
6. Elle ajoute un commentaire libre: `Travail vollee et placement`.
7. Elle envoie la demande.
8. **Climax:** le systeme affiche `demande envoyee`; la demande apparait dans Planning Eleve avec statut `en attente`.

Failure: le creneau vient d'atteindre 2 demandes pending -> envoi bloque, message clair, retour agenda actualise.

### P0-FLOW-004 — Traitement Reservation Coach (Antoine, entre deux cours)

1. Antoine recoit une notification push de nouvelle demande.
2. Il ouvre l'app sur Planning Coach en vue semaine.
3. Le creneau pending est surligne avec badge `nouveau`.
4. Il tape la demande.
5. Le detail affiche eleve, commentaire, date, heure, lieu, tarif et expiration.
6. Il valide la demande.
7. Le systeme marque la reservation `confirmee`, bloque le creneau et cree notification push + in-app pour Lea.
8. Les autres demandes pending du meme creneau passent automatiquement en `refused` avec la note par defaut `Creneau deja pris`.
9. **Climax:** Antoine revient au planning; le creneau n'est plus demandable et son planning est a jour.

Failure: une autre demande pending existait sur le meme creneau -> elle est refusee automatiquement avec la note par defaut `Creneau deja pris`, notification in-app et push si applicable.

### P0-FLOW-005 — Suivi Eleve (Antoine, prepare le cours de Lea)

1. Antoine ouvre Eleves.
2. Il recherche `Lea`.
3. Il ouvre la fiche eleve.
4. Il consulte niveau padel 1 a 10, age, contact, historique des cours/demandes et pack individuel.
5. Il tape `Modifier` sur la note privee.
6. Il ajoute une note de preparation.
7. Il tape `Enregistrer`.
8. **Climax:** la fiche confirme la sauvegarde; la note reste visible uniquement cote coach.

Failure: sauvegarde impossible -> la note reste dans le champ, message d'erreur explicite, aucune exposition eleve.

### P0-FLOW-006 — Creation Cours Collectif Coach (Antoine, organise un collectif samedi)

1. Antoine ouvre Disponibilites ou Planning.
2. Il choisit `Creer un cours collectif`.
3. Il selectionne date, heure, duree, lieu et eleves participants.
4. Le tarif collectif applicable est selectionne automatiquement.
5. Il enregistre.
6. **Climax:** le cours collectif apparait dans le planning coach avec la liste des participants et notifie les eleves concernes si requis par l'evenement.

Failure: un participant n'est pas selectionnable -> le formulaire indique pourquoi et laisse les autres selections intactes.

### P0-FLOW-007 — Annulation Reservation (Lea, empechement avant le cours)

1. Lea ouvre Planning Eleve.
2. Elle ouvre une reservation confirmee.
3. Elle choisit Annuler avant l'heure de debut.
4. Le systeme demande une action explicite d'annulation. [ASSUMPTION] Contrairement au refus coach, l'annulation peut demander confirmation car elle libere une place.
5. La reservation passe `annule`.
6. Antoine recoit notification push et in-app.
7. **Climax:** le planning de Lea et celui d'Antoine affichent le meme statut annule/libere.

Failure: le cours a deja commence -> annulation bloquee avec message clair.

### P0-FLOW-008 — Stats Coach (Antoine, fin de mois)

1. Antoine ouvre Stats.
2. La periode par defaut est le mois.
3. Il voit nombre de cours, nombre d'heures et `revenu estime`.
4. Il consulte les eleves les plus actifs si les donnees sont disponibles.
5. **Climax:** Antoine comprend son activite du mois sans exporter ni connecter un outil de paiement.

Failure: aucune donnee -> empty state explique que les stats apparaitront apres des cours confirmes/effectues.

## Closed Decisions

| Decision | UX contract |
|---|---|
| Modification d'une recurrence coach | Popup demandant d'appliquer le changement a l'occurrence seule ou a toute la serie. |
| Modification P0 d'une reservation | Modification reservee au coach; l'eleve ne modifie pas une reservation en P0. |
| Validation d'une demande quand d'autres pending existent sur le meme creneau | Les autres demandes passent en `refused` avec la note par defaut `Creneau deja pris`. |
| Liste fermee de niveaux padel | Niveaux 1 a 10 confirmes. |
| Police finale de marque | Utiliser la police de base via `var(--font-base)`, modifiable facilement cote code. |
