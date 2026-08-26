export const supportedLocales = ['fr', 'en', 'es'] as const;

export type SupportedLocale = (typeof supportedLocales)[number];

export const defaultLocale: SupportedLocale = 'fr';

export const dictionaries = {
  fr: {
    'nav.home': 'Accueil',
    'nav.mainLabel': 'Navigation principale',
    'nav.foundation': 'Fondations',
    'common.docs': 'Docs',
    'common.nextpoint': 'Equation Padel',
    'errorBoundary.rootTitle': 'Une erreur inattendue est survenue',
    'errorBoundary.rootBody':
      'Equation Padel ne peut pas afficher cet écran pour le moment. Réessayez pour reprendre votre navigation.',
    'errorBoundary.planningTitle': 'Le planning a rencontré un problème',
    'errorBoundary.planningBody':
      'Le reste de votre espace reste disponible. Réessayez pour recharger le planning.',
    'errorBoundary.messagingTitle': 'La messagerie a rencontré un problème',
    'errorBoundary.messagingBody':
      'Le reste de votre espace reste disponible. Réessayez pour recharger vos discussions.',
    'errorBoundary.retryAction': 'Réessayer',
    'auth.sessionLoading': 'Restauration de votre session...',
    'auth.roleLabel': 'Je crée un compte comme',
    'auth.roleCoach': 'Coach',
    'auth.roleEleve': 'Élève',
    'access.errorTitle': 'Rôle introuvable',
    'access.errorBody':
      'Votre session est valide mais aucun rôle sécurisé ne lui est associé. Déconnectez-vous puis recréez le compte si nécessaire.',
    'public.eyebrow': 'Padel, simplement',
    'public.title': 'Equation Padel',
    'public.subtitle':
      'Réservez plus facilement un cours avec votre coach et suivez vos demandes dans un espace sécurisé.',
    'public.signUpAction': 'S’inscrire',
    'public.signInAction': 'Se connecter',
    'public.coachTitle': 'Votre coach de padel',
    'public.coachBody':
      'Une présentation courte du coach, de son approche et de son accompagnement sera publiée ici.',
    'public.coachPendingName': 'Profil coach bientôt disponible',
    'public.coachContactTitle': 'Contact',
    'public.coachLoadErrorTitle': 'Profil coach indisponible',
    'public.coachLoadErrorBody':
      'Impossible de charger les informations du coach pour le moment.',
    'public.pricingTitle': 'Tarifs transparents',
    'public.pricingBody':
      'Les tarifs individuels, duo et collectifs configurés par le coach seront visibles avant toute demande.',
    'public.noAvailabilityTitle': 'Inscription requise',
    'public.noAvailabilityBody':
      'Les disponibilités restent privées jusqu’à la création de votre compte.',
    'role.coachLabel': 'Espace coach',
    'role.eleveLabel': 'Espace élève',
    'role.coachSubtitle': 'Coach · gestion et planning',
    'role.eleveSubtitle': 'Élève · cours et demandes',
    'role.screenProtectedTitle': 'Accès protégé par votre rôle',
    'role.screenProtectedBody':
      'Cette destination est réservée à votre espace et ne charge aucune donnée de l’autre rôle.',
    'role.screenPlaceholder':
      'Le contenu métier de cette section sera ajouté par sa story dédiée.',
    'nav.coach.planning': 'Planning',
    'nav.coach.availability': 'Disponibilités',
    'nav.coach.pricing': 'Tarifs',
    'nav.coach.students': 'Élèves',
    'nav.coach.stats': 'Stats',
    'stats.loading': 'Chargement des statistiques...',
    'stats.title': 'Statistiques',
    'stats.subtitle':
      'Suivez vos cours terminés et votre activité sur la période.',
    'stats.period.month': 'Mois',
    'stats.period.quarter': 'Trimestre',
    'stats.period.year': 'Année',
    'stats.periodRange': 'Du {{start}} au {{end}}',
    'stats.lastUpdated': 'Actualisé à {{time}}',
    'stats.activityAvailable': 'Activité enregistrée',
    'stats.activityEmpty': 'Période sans activité',
    'stats.completedCourses': 'Cours effectués',
    'stats.completedHours': 'Heures effectuées',
    'stats.averageDuration': 'Durée moyenne',
    'stats.estimatedRevenue': 'Revenu estimé',
    'stats.averageRevenue': 'Revenu moyen par cours',
    'stats.estimatedRevenueHint':
      'Estimation calculée depuis les tarifs appliqués, sans paiement intégré.',
    'stats.emptyTitle': 'Aucune activité sur cette période',
    'stats.emptyBody': 'Les cours confirmés et terminés apparaîtront ici.',
    'stats.activeStudentsTitle': 'Élèves les plus actifs',
    'stats.activeStudentsEmpty':
      'Pas encore assez de cours pour afficher des élèves actifs.',
    'stats.activeStudentCourses': '{{count}} cours',
    'stats.openStudentAction': 'Ouvrir la fiche de {{name}}',
    'stats.unknownStudent': 'Élève',
    'stats.loadErrorTitle': 'Statistiques indisponibles',
    'stats.loadErrorBody':
      'Impossible de charger les statistiques pour le moment. Réessayez.',
    'stats.accessDenied': 'Les statistiques sont réservées au coach.',
    'stats.invalidPeriod': 'La période demandée est invalide.',
    'stats.retryAction': 'Réessayer',
    'nav.coach.notifications': 'Notifications',
    'nav.coach.messaging': 'Messagerie',
    'nav.coach.profile': 'Profil',
    'nav.eleve.home': 'Accueil',
    'nav.eleve.planning': 'Mon agenda',
    'nav.eleve.notifications': 'Notifications',
    'nav.eleve.account': 'Compte',
    'notifications.loading': 'Chargement des notifications...',
    'notifications.loadingMore': 'Chargement des notifications précédentes...',
    'notifications.title': 'Notifications',
    'notifications.subtitle':
      'Retrouvez les demandes, validations, refus et changements de réservation.',
    'notifications.pushTitle': 'Notifications push',
    'notifications.pushBody':
      'Recevoir les alertes même lorsque l’application est fermée.',
    'notifications.pushAcceptAction': 'Autoriser',
    'notifications.pushRefuseAction': 'Refuser',
    'notifications.pushStatus.granted': 'autorisées',
    'notifications.pushStatus.denied': 'refusées',
    'notifications.pushStatus.undetermined': 'non défini',
    'notifications.pushStatus.unavailable': 'indisponible',
    'notifications.pushStatus.unavailableWeb': 'indisponible sur le web',
    'notifications.listTitle': 'Récentes',
    'notifications.unreadCount': '{{count}} non lue(s)',
    'notifications.markAllReadAction': 'Tout marquer comme lu',
    'notifications.deleteAction': 'Supprimer la notification',
    'notifications.deleteConfirm': 'Supprimer cette notification ?',
    'notifications.confirmDeleteAction': 'Confirmer la suppression',
    'notifications.cancelDeleteAction': 'Annuler la suppression',
    'notifications.deleteErrorTitle': 'Suppression impossible',
    'notifications.deleteErrorBody':
      'La notification n’a pas pu être supprimée. Réessayez.',
    'notifications.emptyTitle': 'Aucune notification',
    'notifications.emptyBody':
      'Les événements importants apparaîtront ici même si le push système est refusé.',
    'notifications.read': 'Lu',
    'notifications.unread': 'Non lu',
    'notifications.loadErrorTitle': 'Notifications indisponibles',
    'notifications.loadErrorBody':
      'Impossible de charger vos notifications pour le moment.',
    'notifications.saveErrorTitle': 'Action impossible',
    'notifications.saveErrorBody':
      'Le changement n’a pas été enregistré. Vérifiez votre connexion puis réessayez.',
    'notifications.linkMissingTitle': 'Lien indisponible',
    'notifications.linkMissingBody':
      'L’événement lié n’est plus accessible ou n’existe plus.',
    'messaging.loading': 'Chargement des discussions...',
    'messaging.loadingMessages': 'Chargement des messages...',
    'messaging.loadingMore': 'Chargement...',
    'messaging.loadMoreThreads': 'Charger plus de discussions',
    'messaging.loadOlderMessages': 'Charger les messages précédents',
    'messaging.title': 'Messagerie',
    'messaging.subtitle':
      'Retrouvez les échanges rattachés à vos créneaux, demandes et réservations.',
    'messaging.listTitle': 'Discussions de planning',
    'messaging.emptyTitle': 'Aucune discussion',
    'messaging.emptyBody':
      'Les discussions apparaîtront ici lorsqu’une demande ou une réservation existera.',
    'messaging.read': 'Lu',
    'messaging.unread': 'Non lu',
    'messaging.unknownStudent': 'Élève',
    'messaging.noMessages': 'Aucun message dans cette discussion.',
    'messaging.responseLabel': 'Votre réponse',
    'messaging.responsePlaceholder':
      'Répondez au sujet de ce créneau ou de cette réservation.',
    'messaging.sendAction': 'Envoyer',
    'messaging.sending': 'Envoi...',
    'messaging.backAction': 'Retour aux discussions',
    'messaging.openContextAction': 'Voir dans le planning',
    'messaging.linkedContextTitle': 'Événement lié',
    'messaging.linkedContextBody':
      'La réservation de {{student}} est ciblée dans le planning.',
    'messaging.coachAuthor': 'Coach',
    'messaging.studentAuthor': 'Élève',
    'messaging.selectThreadTitle': 'Sélectionnez une discussion',
    'messaging.selectThreadBody':
      'Ouvrez une discussion pour consulter son contexte et répondre.',
    'messaging.loadErrorTitle': 'Messagerie indisponible',
    'messaging.loadErrorBody':
      'Impossible de charger vos discussions pour le moment.',
    'messaging.saveErrorTitle': 'Action impossible',
    'messaging.saveErrorBody':
      'La réponse ou l’état de lecture n’a pas été enregistré. Réessayez.',
    'messaging.invalidMessageTitle': 'Message invalide',
    'messaging.invalidMessageBody':
      'Saisissez un message non vide de 1 000 caractères maximum.',
    'messaging.contextUnavailableTitle': 'Événement inaccessible',
    'messaging.contextUnavailableBody':
      'Le créneau ou la réservation liée n’est plus accessible.',
    'messaging.accessDeniedTitle': 'Accès refusé',
    'messaging.accessDeniedBody':
      'La messagerie de planning est réservée au coach.',
    'planning.loading': 'Chargement du planning...',
    'planning.refreshing': 'Mise à jour des créneaux...',
    'planning.coachTitle': 'Planning coach',
    'planning.coachBody':
      'Consultez vos créneaux et vos cours, passés ou à venir, en vue semaine ou jour.',
    'planning.display.agenda': 'Agenda',
    'planning.display.list': 'Liste',
    'planning.mode.week': 'Semaine',
    'planning.mode.day': 'Jour',
    'planning.filtersLabel': 'Filtrer le planning',
    'planning.availabilityFilter': 'Disponibilités',
    'planning.confirmedLessonsFilter': 'Cours confirmés',
    'planning.previousAction': 'Précédent',
    'planning.todayAction': 'Aujourd’hui',
    'planning.nextAction': 'Suivant',
    'planning.nowLabel': 'Maintenant',
    'planning.weekRange': '{{start}} - {{end}}',
    'planning.loadErrorTitle': 'Planning indisponible',
    'planning.loadErrorBody':
      'Impossible de charger vos créneaux pour cette période.',
    'planning.emptyDayTitle': 'Aucun créneau',
    'planning.emptyDayBody': 'Aucune disponibilité visible sur cette journée.',
    'planning.slotTime': '{{start}}-{{end}}',
    'planning.slotMeta': '{{duration}} · {{location}}',
    'profile.title': 'Mon profil',
    'profile.subtitle':
      'Renseignez les informations utiles au coach pour organiser vos prochains cours.',
    'profile.loading': 'Chargement de votre profil...',
    'profile.fullNameLabel': 'Nom complet',
    'profile.fullNamePlaceholder': 'Prénom et nom',
    'profile.phoneLabel': 'Téléphone',
    'profile.phonePlaceholder': '+33 6 12 34 56 78',
    'profile.emailLabel': 'Email de contact',
    'profile.ageLabel': 'Âge',
    'profile.agePlaceholder': 'Ex. 29',
    'profile.levelLabel': 'Niveau padel',
    'profile.sexLabel': 'Sexe',
    'profile.sex.female': 'Femme',
    'profile.sex.male': 'Homme',
    'profile.sex.other': 'Autre',
    'profile.sex.notSpecified': 'Préfère ne pas répondre',
    'profile.languageLabel': 'Langue préférée',
    'profile.language.fr': 'Français',
    'profile.language.en': 'Anglais',
    'profile.language.es': 'Espagnol',
    'profile.themeTitle': 'Apparence',
    'profile.themeBody':
      'Le mode Défaut suit automatiquement la préférence de votre navigateur ou de votre appareil.',
    'profile.themeLabel': 'Thème de l’application',
    'profile.theme.system': 'Défaut (préférence du navigateur)',
    'profile.theme.light': 'Clair',
    'profile.theme.dark': 'Sombre',
    'profile.saveAction': 'Enregistrer mon profil',
    'profile.saving': 'Enregistrement...',
    'profile.saveSuccessTitle': 'Profil enregistré',
    'profile.saveSuccessBody':
      'Vos informations sont à jour et resteront disponibles lors de votre prochaine connexion.',
    'profile.saveErrorTitle': 'Enregistrement impossible',
    'profile.saveErrorBody':
      'Vos informations n’ont pas été modifiées. Vérifiez votre connexion puis réessayez.',
    'profile.loadErrorTitle': 'Profil indisponible',
    'profile.loadErrorBody':
      'Impossible de charger votre profil pour le moment. Réessayez après avoir relancé l’application.',
    'profile.validation.nameTooShort':
      'Saisissez un nom d’au moins 2 caractères.',
    'profile.validation.nameTooLong':
      'Le nom ne peut pas dépasser 100 caractères.',
    'profile.validation.invalidPhone':
      'Saisissez un numéro de téléphone valide.',
    'profile.validation.invalidNumber': 'Saisissez un nombre valide.',
    'profile.validation.invalidLevel':
      'Choisissez un niveau compris entre 1 et 10.',
    'profile.validation.invalidAge':
      'Saisissez un âge compris entre 5 et 100 ans.',
    'coachProfile.loading': 'Chargement de votre profil coach...',
    'coachProfile.title': 'Mon profil coach',
    'coachProfile.subtitle':
      'Présentez votre accompagnement et les coordonnées utiles avant une demande de cours.',
    'coachProfile.displayNameLabel': 'Nom affiché',
    'coachProfile.displayNamePlaceholder': 'Votre nom ou nom professionnel',
    'coachProfile.bioLabel': 'Présentation',
    'coachProfile.bioPlaceholder':
      'Décrivez brièvement votre approche, votre expérience et les joueurs que vous accompagnez.',
    'coachProfile.validation.bioTooShort':
      'La présentation doit contenir au moins 20 caractères.',
    'coachProfile.validation.bioTooLong':
      'La présentation ne peut pas dépasser 500 caractères.',
    'coachProfile.loadErrorTitle': 'Profil indisponible',
    'coachProfile.loadErrorBody':
      'Impossible de charger votre profil coach. Relancez l’application puis réessayez.',
    'coachProfile.saveSuccessTitle': 'Profil coach enregistré',
    'coachProfile.saveSuccessBody':
      'Les nouvelles informations sont maintenant visibles dans les espaces public et élève.',
    'coachProfile.saveErrorTitle': 'Enregistrement impossible',
    'coachProfile.saveErrorBody':
      'Le profil n’a pas été modifié. Vérifiez votre connexion puis réessayez.',
    'coachProfile.saveAction': 'Enregistrer le profil coach',
    'coachProfile.availabilityTitle': 'Disponibilités',
    'coachProfile.availabilityBody':
      'Définissez les créneaux qui pourront être proposés aux élèves.',
    'coachProfile.openAvailability': 'Gérer les disponibilités',
    'coachProfile.pricingTitle': 'Tarifs',
    'coachProfile.pricingBody':
      'Configurez les tarifs individuels, duo et collectifs présentés avant réservation.',
    'coachProfile.openPricing': 'Gérer les tarifs',
    'coachProfile.notificationsTitle': 'Notifications push',
    'coachProfile.notificationsBody':
      'Choisissez les alertes reçues pour les demandes et changements de cours.',
    'coachProfile.comingSoon': 'Bientôt disponible',
    'studentHome.title': 'Votre espace de réservation',
    'studentHome.subtitle':
      'Consultez le profil de votre coach avant de préparer une demande de cours.',
    'studentAgenda.loading': 'Chargement de l’agenda...',
    'studentAgenda.title': 'Agenda élève',
    'studentAgenda.body':
      'Les créneaux affichés sont disponibles et demandables auprès de votre coach.',
    'studentAgenda.loadErrorTitle': 'Agenda indisponible',
    'studentAgenda.loadErrorBody':
      'Impossible de charger les créneaux ou les participants disponibles pour le moment.',
    'studentAgenda.retryAction': 'Réessayer',
    'studentAgenda.emptyDayTitle': 'Aucun créneau demandable',
    'studentAgenda.emptyDayBody':
      'Aucun créneau disponible n’est proposé sur cette journée.',
    'studentAgenda.slotDetail': '{{date}} · {{duration}} · {{location}}',
    'studentAgenda.requestableStatus': 'Demandable',
    'studentAgenda.calendarTitle': 'Choisissez un jour',
    'studentAgenda.calendarBody':
      'Les jours mis en évidence proposent au moins une plage disponible.',
    'studentAgenda.previousMonthAction': 'Voir le mois précédent',
    'studentAgenda.nextMonthAction': 'Voir le mois suivant',
    'studentAgenda.currentMonthAction': 'Revenir à ce mois-ci',
    'studentAgenda.availableLegend': 'Jour avec une disponibilité',
    'studentAgenda.availableDayLabel':
      '{{date}}, une plage disponible',
    'studentAgenda.availableDayLabelPlural':
      '{{date}}, {{count}} plages disponibles',
    'studentAgenda.selectedDateTitle': 'Disponibilités du {{date}}',
    'studentAgenda.availableRangeCount':
      'Une plage disponible pour réserver',
    'studentAgenda.availableRangeCountPlural':
      '{{count}} plages disponibles pour réserver',
    'studentAgenda.selectRangeLabel':
      'Choisir une heure entre {{start}} et {{end}}, {{location}}',
    'studentAgenda.chooseTimeAction': 'Choisir une heure',
    'studentAgenda.emptyMonthTitle': 'Aucune disponibilité ce mois-ci',
    'studentAgenda.emptyMonthBody':
      'Passez au mois suivant pour consulter les prochaines disponibilités.',
    'pricing.loading': 'Chargement des tarifs...',
    'pricing.loadErrorTitle': 'Tarifs indisponibles',
    'pricing.loadErrorBody':
      'Impossible de charger les tarifs pour le moment. Réessayez après avoir relancé l’application.',
    'pricing.publishedTitle': 'Tarifs du coach',
    'pricing.publishedBody':
      'Prix affichés à titre informatif avant toute demande de cours.',
    'pricing.emptyPublishedTitle': 'Tarifs bientôt disponibles',
    'pricing.emptyPublishedBody':
      'Le coach n’a encore publié aucun tarif actif.',
    'pricing.manageTitle': 'Gestion des tarifs',
    'pricing.manageBody':
      'Créez les tarifs individuels, duo et collectifs proposés avant une demande.',
    'pricing.createTitle': 'Nouveau tarif',
    'pricing.editTitle': 'Modifier le tarif',
    'pricing.catalogTitle': 'Catalogue coach',
    'pricing.labelLabel': 'Libellé',
    'pricing.labelPlaceholder': 'Ex. Cours individuel standard',
    'pricing.amountLabel': 'Prix en euros',
    'pricing.amountPlaceholder': 'Ex. 45,00',
    'pricing.typeLabel': 'Type de cours',
    'pricing.type.individual': 'Individuel',
    'pricing.type.duo': 'Duo',
    'pricing.type.group': 'Collectif',
    'pricing.durationLabel': 'Durée',
    'pricing.duration.60': '1 heure',
    'pricing.duration.90': '1 h 30',
    'pricing.statusLabel': 'Publication',
    'pricing.contextLabel': 'Critères d’applicabilité',
    'pricing.noContext': 'Aucun critère spécifique',
    'pricing.context.student': 'Tarif étudiant',
    'pricing.context.senior': 'Tarif senior',
    'pricing.context.weekend': 'Week-end',
    'pricing.context.public_holiday': 'Jour férié',
    'pricing.studentsLabel': 'Élèves ciblés',
    'pricing.studentSearchLabel': 'Recherche par nom',
    'pricing.studentSearchPlaceholder': 'Nom de l’élève',
    'pricing.studentSearchHint':
      'Saisissez un nom pour trouver un élève.',
    'pricing.studentSearchEmpty':
      'Aucun élève ne correspond à cette recherche.',
    'pricing.selectedStudentsLabel': 'Élèves sélectionnés ({{count}})',
    'pricing.selectStudentAction': 'Sélectionner',
    'pricing.selectedStudentAction': 'Sélectionné',
    'pricing.removeStudentAction': 'Retirer {{name}} de la sélection',
    'pricing.noStudentsBody':
      'Aucun élève associé n’est disponible pour un ciblage spécifique.',
    'pricing.createAction': 'Créer le tarif',
    'pricing.updateAction': 'Enregistrer les modifications',
    'pricing.saving': 'Enregistrement...',
    'pricing.cancelAction': 'Annuler',
    'pricing.editAction': 'Modifier',
    'pricing.deleteAction': 'Supprimer',
    'pricing.confirmDeleteAction': 'Confirmer la suppression',
    'pricing.deleteTitle': 'Supprimer ce tarif ?',
    'pricing.deleteBody':
      'Il ne sera plus proposé aux nouvelles demandes. Les futures références historiques resteront conservées.',
    'pricing.saveSuccessTitle': 'Tarif enregistré',
    'pricing.saveSuccessBody':
      'Le catalogue et les surfaces élève utilisent maintenant la version à jour.',
    'pricing.saveErrorTitle': 'Enregistrement impossible',
    'pricing.saveErrorBody':
      'Le tarif n’a pas été modifié. Vérifiez les informations puis réessayez.',
    'pricing.emptyCoachTitle': 'Aucun tarif',
    'pricing.emptyCoachBody':
      'Créez un premier tarif individuel, duo ou collectif.',
    'pricing.validation.labelTooShort':
      'Le libellé doit contenir au moins 2 caractères.',
    'pricing.validation.labelTooLong':
      'Le libellé ne peut pas dépasser 100 caractères.',
    'pricing.validation.invalidAmount':
      'Saisissez un prix positif avec au maximum deux décimales.',
    'pricing.validation.invalidStudent': 'Un élève ciblé n’est pas valide.',
    'availability.loading': 'Chargement des disponibilités...',
    'availability.manageTitle': 'Gestion des disponibilités',
    'availability.manageBody': 'Gérez ses plages horaires.',
    'availability.createTitle': 'Nouvelle plage',
    'availability.dateLabel': 'Date',
    'availability.datePlaceholder': 'AAAA-MM-JJ',
    'availability.startsAtLabel': 'Heure de début',
    'availability.endsAtLabel': 'Heure de fin',
    'availability.timePlaceholder': 'HH:MM',
    'availability.durationLabel': 'Durée du créneau',
    'availability.duration.60': '1 heure',
    'availability.duration.90': '1 h 30',
    'availability.continuousRange': 'Plage disponible',
    'availability.locationLabel': 'Lieu',
    'availability.recurrenceLabel': 'Récurrence',
    'availability.recurrence.none': 'Ponctuelle',
    'availability.recurrence.daily': 'Quotidienne',
    'availability.recurrence.weekly': 'Hebdomadaire',
    'availability.recurrenceEndsOnLabel': 'Générer jusqu’au',
    'availability.recurrenceUntil': 'Générée jusqu’au {{date}}',
    'availability.previewTitle': 'Aperçu de la plage',
    'availability.previewEmpty':
      'Complétez une plage cohérente pour afficher l’aperçu.',
    'availability.previewSlot': '{{start}}–{{end}} · {{location}}',
    'availability.createAction': 'Créer la disponibilité',
    'availability.editAction': 'Modifier',
    'availability.updateAction': 'Enregistrer',
    'availability.deleteAction': 'Supprimer',
    'availability.cancelAction': 'Annuler',
    'availability.saving': 'Enregistrement...',
    'availability.saveSuccessTitle': 'Disponibilité créée',
    'availability.saveSuccessBody':
      'La plage continue est enregistrée avec ses heures et son lieu.',
    'availability.updateSuccessTitle': 'Créneau modifié',
    'availability.updateSuccessBody':
      'La disponibilité sélectionnée a été mise à jour sans conflit.',
    'availability.deleteSuccessTitle': 'Créneau supprimé',
    'availability.deleteSuccessBody':
      'Le créneau n’est plus visible comme disponible.',
    'availability.saveErrorTitle': 'Création impossible',
    'availability.saveErrorBody':
      'Aucune disponibilité n’a été créée. Vérifiez les informations puis réessayez.',
    'availability.updateErrorTitle': 'Modification impossible',
    'availability.updateErrorBody':
      'La disponibilité n’a pas été modifiée. Vérifiez la date et les horaires puis réessayez.',
    'availability.conflictTitle': 'Plage en conflit',
    'availability.conflictBody':
      'Cette plage chevauche une disponibilité existante. Ajustez les horaires.',
    'availability.blockedTitle': 'Modification indisponible',
    'availability.blockedBody':
      'Ce créneau contient déjà une demande active ou une réservation confirmée.',
    'availability.forbiddenTitle': 'Accès refusé',
    'availability.forbiddenBody':
      'Seul un compte coach peut créer une disponibilité.',
    'availability.loadErrorTitle': 'Disponibilités indisponibles',
    'availability.loadErrorBody':
      'Impossible de charger vos disponibilités pour le moment.',
    'availability.listTitle': 'Plages enregistrées',
    'availability.emptyTitle': 'Aucune disponibilité',
    'availability.emptyBody':
      'Créez une première plage pour préparer les créneaux réservables.',
    'availability.emptyPeriodTitle': 'Aucune plage sur cette période',
    'availability.emptyPeriodBody':
      'Utilisez les boutons de navigation pour consulter une autre période.',
    'availability.rangeTime': '{{start}}–{{end}}',
    'availability.rangeMeta': '{{location}}',
    'availability.generatedSlotsTitle': 'Occurrences disponibles',
    'availability.generatedSlot': '{{date}}–{{end}} · {{location}}',
    'availability.slotStatus.available': 'Disponible',
    'availability.slotStatus.booked': 'Réservé',
    'availability.slotStatus.cancelled': 'Annulé',
    'availability.scopeDialogTitle': 'Appliquer la modification',
    'availability.scopeDeleteDialogTitle': 'Appliquer la suppression',
    'availability.scopeDialogBody':
      'Choisissez si l’action concerne uniquement cette occurrence ou toute la série récurrente.',
    'availability.scopeOccurrenceAction': 'Cette occurrence',
    'availability.scopeSeriesAction': 'Toute la série',
    'availability.validation.invalidDate':
      'Saisissez une date au format AAAA-MM-JJ.',
    'availability.validation.invalidTime':
      'Saisissez une heure au format HH:MM.',
    'availability.validation.endBeforeStart':
      'L’heure de fin doit être après l’heure de début.',
    'availability.validation.rangeTooShort':
      'La plage doit contenir au moins un créneau complet.',
    'availability.validation.recurrenceEndRequired':
      'Saisissez un horizon de génération.',
    'availability.validation.recurrenceEndBeforeStart':
      'L’horizon doit être le jour de départ ou après.',
    'students.loading': 'Chargement des élèves...',
    'students.title': 'Élèves',
    'students.subtitle':
      'Retrouvez uniquement les élèves actuellement associés à votre espace coach.',
    'students.createAction': 'Créer une fiche élève',
    'students.createTitle': 'Nouvelle fiche élève',
    'students.createBody':
      'Ajoutez un élève et préparez son compte non activé. Son accès sera finalisé avec un lien valable 24 heures.',
    'students.optionalPhoneLabel': 'Téléphone (facultatif)',
    'students.optionalEmailLabel': 'Email (facultatif)',
    'students.optionalAgeLabel': 'Âge (facultatif)',
    'students.noContact': 'Aucun contact renseigné',
    'students.createSubmitAction': 'Créer la fiche',
    'students.createCancelAction': 'Annuler',
    'students.creating': 'Création...',
    'students.createSuccessTitle': 'Fiche élève créée',
    'students.createSuccessBody':
      '{{name}} est maintenant associé à votre espace coach.',
    'students.createErrorTitle': 'Création impossible',
    'students.createErrorBody':
      'Aucune fiche n’a été créée. Vérifiez les informations puis réessayez.',
    'students.createDuplicateTitle': 'Élève déjà existant',
    'students.createDuplicateBody':
      'Un élève utilise déjà cet email ou ce téléphone. Ouvrez sa fiche existante.',
    'students.loadErrorTitle': 'Liste indisponible',
    'students.loadErrorBody':
      'Impossible de charger les élèves pour le moment. Relancez l’application puis réessayez.',
    'students.searchLabel': 'Recherche par nom ou email',
    'students.searchPlaceholder': 'Nom ou email de l’élève',
    'students.incompleteProfile': 'Profil incomplet',
    'students.levelFilterLabel': 'Niveau padel',
    'students.allLevels': 'Tous les niveaux',
    'students.sexFilterLabel': 'Sexe de l’élève',
    'students.allSexes': 'Tous',
    'students.ageRangeSliderLabel': 'Plage d’âge',
    'students.ageMin': 'Minimum : {{age}} ans',
    'students.ageMax': 'Maximum : {{age}} ans',
    'students.ageFilterLabel': 'Tranche d’âge',
    'students.allAges': 'Tous les âges',
    'students.ageRange': '{{min}}–{{max}} ans',
    'students.ageSingle': '{{age}} ans',
    'students.resetFilters': 'Réinitialiser les filtres',
    'students.resultsTitle': 'Résultats',
    'students.resultCount': '{{count}} élève(s)',
    'students.pageStatus': 'Page {{current}} sur {{total}}',
    'students.previousPage': 'Page précédente',
    'students.nextPage': 'Page suivante',
    'students.levelValue': 'Niveau {{level}}',
    'students.ageValue': '{{age}} ans',
    'students.emptyListTitle': 'Aucun élève associé',
    'students.emptyListBody':
      'Les élèves apparaîtront ici après leur association à votre espace.',
    'students.emptyFilterTitle': 'Aucun résultat',
    'students.emptyFilterBody':
      'Aucun élève ne correspond à cette recherche et à ces filtres.',
    'studentDetail.loading': 'Chargement de la fiche élève...',
    'studentDetail.eyebrow': 'Fiche élève',
    'studentDetail.backAction': 'Retour aux élèves',
    'studentDetail.notFoundTitle': 'Fiche inaccessible',
    'studentDetail.notFoundBody':
      'Cette fiche n’existe pas ou cet élève n’est pas associé à votre espace coach.',
    'studentDetail.loadErrorTitle': 'Fiche indisponible',
    'studentDetail.loadErrorBody':
      'Impossible de charger cette fiche pour le moment.',
    'studentDetail.profileTitle': 'Informations élève',
    'studentDetail.incompleteProfileBody':
      'Cet élève n’a pas encore terminé sa fiche. Son email reste disponible pour le contacter.',
    'studentDetail.historyTitle': 'Historique',
    'studentDetail.historyCount': '{{count}} élément(s)',
    'studentDetail.historyFilter.label': 'Filtrer par statut',
    'studentDetail.historyFilter.all': 'Tous',
    'studentDetail.historyFilter.cancelled': 'Annulé',
    'studentDetail.historyFilter.confirmed': 'Confirmé',
    'studentDetail.historyFilter.refused': 'Refusé',
    'studentDetail.historyFilterEmptyTitle': 'Aucun résultat',
    'studentDetail.historyFilterEmptyBody':
      'Aucun événement ne correspond à ce filtre.',
    'studentDetail.historyEmptyTitle': 'Aucun historique',
    'studentDetail.historyEmptyBody':
      'Les demandes, cours, annulations, modifications et packs apparaîtront ici.',
    'studentDetail.historyLoading': 'Chargement de l’historique...',
    'studentDetail.historyLoadingMore':
      'Chargement des événements précédents...',
    'studentDetail.historyLoadMoreAction': 'Réessayer le chargement',
    'studentDetail.historyLoadErrorTitle': 'Historique indisponible',
    'studentDetail.historyLoadErrorBody':
      'Impossible de charger l’historique de cet élève pour le moment.',
    'studentDetail.historyType.bookingRequested': 'Demande de cours',
    'studentDetail.historyType.lessonConfirmed': 'Cours confirmé',
    'studentDetail.historyType.bookingCancelled': 'Annulation',
    'studentDetail.historyType.bookingModified': 'Modification',
    'studentDetail.historyType.lessonPackAssigned': 'Pack attribué',
    'studentDetail.historyType.lessonPackConsumed': 'Session de pack consommée',
    'studentDetail.historyType.lessonPackAdjusted': 'Crédit de pack ajouté',
    'studentDetail.activationGenerateAction': 'Générer le lien d’activation',
    'studentDetail.activationRegenerateAction': 'Régénérer le lien',
    'studentDetail.activationGenerating': 'Génération...',
    'studentDetail.activationReadyTitle': 'Lien d’activation prêt',
    'studentDetail.activationExpiresAt': 'Expire le {{date}}.',
    'studentDetail.activationCopyAction': 'Copier le lien',
    'studentDetail.activationShareAction': 'Partager le lien',
    'studentDetail.activationShareMessage':
      'Activez votre compte Equation Padel avec ce lien valable 24 heures : {{link}}',
    'studentDetail.activationCopiedTitle': 'Lien copié',
    'studentDetail.activationCopiedBody':
      'Vous pouvez maintenant le transmettre à l’élève.',
    'studentDetail.activationNoEmailTitle': 'Aucun email renseigné',
    'studentDetail.activationNoEmailBody':
      'Le lien reste disponible : copiez-le ou partagez-le manuellement. Il ne peut pas être envoyé par email depuis cette fiche.',
    'studentDetail.activationErrorTitle': 'Lien indisponible',
    'studentDetail.activationErrorBody':
      'Le lien n’a pas pu être généré ou partagé. Vérifiez l’état du compte puis réessayez.',
    'studentDetail.deleteTitle': 'Supprimer cette fiche élève',
    'studentDetail.deleteBody':
      'Cette action est disponible uniquement avant l’activation du compte. Elle supprime définitivement le compte provisoire et toutes ses données associées.',
    'studentDetail.deleteAction': 'Supprimer l’élève',
    'studentDetail.deleteConfirmTitle': 'Confirmer la suppression',
    'studentDetail.deleteConfirmBody':
      'Voulez-vous vraiment supprimer définitivement la fiche de {{name}} ?',
    'studentDetail.deleteConfirmAction': 'Supprimer définitivement',
    'studentDetail.deleteCancelAction': 'Annuler',
    'studentDetail.deleting': 'Suppression...',
    'studentDetail.deleteErrorTitle': 'Suppression impossible',
    'studentDetail.deleteErrorBody':
      'La fiche n’a pas été supprimée. Le compte a peut-être déjà été activé ou n’est plus associé à votre espace.',
    'studentPrivateNote.loading': 'Chargement de la note privée...',
    'studentPrivateNote.title': 'Note privée coach',
    'studentPrivateNote.privateHint':
      'Visible uniquement dans votre espace coach.',
    'studentPrivateNote.addAction': 'Ajouter une note',
    'studentPrivateNote.editAction': 'Modifier',
    'studentPrivateNote.fieldLabel': 'Note privée',
    'studentPrivateNote.placeholder':
      'Ajoutez un rappel utile pour préparer les prochains cours.',
    'studentPrivateNote.characterCount': '{{count}} / 2000 caractères',
    'studentPrivateNote.saveAction': 'Enregistrer',
    'studentPrivateNote.saving': 'Enregistrement...',
    'studentPrivateNote.cancelAction': 'Annuler',
    'studentPrivateNote.emptyBody':
      'Aucune note privée n’a encore été enregistrée.',
    'studentPrivateNote.validationRequired':
      'Saisissez une note avant d’enregistrer.',
    'studentPrivateNote.validationTooLong':
      'La note ne peut pas dépasser 2000 caractères.',
    'studentPrivateNote.loadErrorTitle': 'Note indisponible',
    'studentPrivateNote.loadErrorBody':
      'Impossible de charger la note privée pour le moment.',
    'studentPrivateNote.saveSuccessTitle': 'Note enregistrée',
    'studentPrivateNote.saveSuccessBody':
      'La note privée est à jour dans votre espace coach.',
    'studentPrivateNote.saveErrorTitle': 'Enregistrement impossible',
    'studentPrivateNote.saveErrorBody':
      'La note existante n’a pas été modifiée. Réessayez.',
    'lessonPack.loading': 'Chargement des packs...',
    'lessonPack.loadMoreAction': 'Réessayer le chargement',
    'lessonPack.studentTitle': 'Mes packs de tickets',
    'lessonPack.readonlyHint':
      'Consultez vos crédits de cours. Seul votre coach peut les modifier.',
    'lessonPack.studentEmptyBody':
      'Aucun pack de tickets ne vous a encore été attribué.',
    'lessonPack.title': 'Pack de cours individuels',
    'lessonPack.trackingOnlyHint':
      'Suivi de crédits uniquement, sans achat ni paiement intégré.',
    'lessonPack.assignAction': 'Attribuer un pack',
    'lessonPack.includedLabel': 'Nombre de cours inclus',
    'lessonPack.includedPlaceholder': 'Ex. 10',
    'lessonPack.confirmAssignAction': 'Confirmer l’attribution',
    'lessonPack.assigning': 'Attribution...',
    'lessonPack.cancelAction': 'Annuler',
    'lessonPack.individualTitle': 'Pack individuel',
    'lessonPack.includedMetric': 'Inclus',
    'lessonPack.usedMetric': 'Utilisés',
    'lessonPack.remainingMetric': 'Restants',
    'lessonPack.emptyBody':
      'Aucun pack individuel n’est encore rattaché à cet élève.',
    'lessonPack.validationInvalidCount':
      'Saisissez un nombre entier compris entre 1 et 100.',
    'lessonPack.saveSuccessTitle': 'Pack attribué',
    'lessonPack.saveSuccessBody':
      'Les crédits de cours sont maintenant suivis sur cette fiche.',
    'lessonPack.activeExistsTitle': 'Pack actif existant',
    'lessonPack.activeExistsBody':
      'Terminez le pack actif avant d’en attribuer un nouveau.',
    'lessonPack.saveErrorTitle': 'Attribution impossible',
    'lessonPack.saveErrorBody':
      'Aucun pack n’a été créé. Vérifiez la relation élève puis réessayez.',
    'lessonPack.loadErrorTitle': 'Packs indisponibles',
    'lessonPack.loadErrorBody':
      'Impossible de charger les crédits de cours pour le moment.',
    'lessonPack.consumeAction': 'Marquer une session consommée',
    'lessonPack.consuming': 'Consommation...',
    'lessonPack.consumeSuccessTitle': 'Session consommée',
    'lessonPack.consumeSuccessBody':
      'Les compteurs du pack sont à jour et l’historique élève a été alimenté.',
    'lessonPack.decrementAccessibilityLabel': 'Retirer un cours restant',
    'lessonPack.incrementAccessibilityLabel': 'Ajouter un cours restant',
    'lessonPack.adjusting': 'Mise à jour du pack...',
    'lessonPack.increaseSuccessTitle': 'Cours ajouté',
    'lessonPack.increaseSuccessBody':
      'Le pack dispose maintenant d’un cours restant supplémentaire.',
    'lessonPack.decreaseSuccessTitle': 'Cours retiré',
    'lessonPack.decreaseSuccessBody':
      'Le total du pack a été corrigé sans modifier le nombre de cours utilisés.',
    'lessonPack.noRemainingTitle': 'Pack épuisé',
    'lessonPack.noRemainingBody':
      'Aucune session ne peut être consommée: ce pack n’a plus de cours restants.',
    'lessonPack.consumeErrorTitle': 'Consommation impossible',
    'lessonPack.consumeErrorBody':
      'Aucun cours restant n’a été modifié. Le pack est peut-être épuisé ou l’accès refusé.',
    'lessonPack.maximumTitle': 'Maximum atteint',
    'lessonPack.maximumBody': 'Un pack ne peut pas dépasser 100 cours inclus.',
    'lessonPack.minimumTitle': 'Minimum atteint',
    'lessonPack.minimumBody':
      'Un pack doit conserver au moins un cours inclus.',
    'lessonPack.adjustErrorTitle': 'Modification impossible',
    'lessonPack.adjustErrorBody':
      'Le compteur n’a pas été modifié. Rechargez la fiche puis réessayez.',
    'booking.openRequestAction': 'Demander',
    'booking.requestAction': 'Envoyer la demande',
    'booking.startTimeLabel': 'Heure de début',
    'booking.startTimePlaceholder': 'HH:mm',
    'booking.invalidStartTime':
      'Saisissez une heure par quart d’heure, par exemple 11:00 ou 11:15.',
    'booking.durationLabel': 'Durée du cours',
    'booking.proposedTime': 'Créneau proposé : {{start}}–{{end}}',
    'booking.noDurationFitTitle': 'Aucun créneau adapté',
    'booking.noDurationFitBody':
      'Cette durée ne tient dans aucune portion libre de la plage.',
    'booking.lessonTypeLabel': 'Type de cours',
    'booking.commentLabel': 'Commentaire',
    'booking.commentPlaceholder':
      'Précisez votre besoin ou vos disponibilités.',
    'booking.participantsLabel': 'Participants',
    'booking.duoParticipantRequired':
      'Sélectionnez exactement un partenaire pour former le duo.',
    'booking.requesterIncluded': 'Vous êtes inclus',
    'booking.unknownStudent': 'Élève',
    'booking.priceLabel': 'Tarif : {{price}}',
    'booking.studentPageTitle': 'Demandes et cours',
    'booking.studentPageBody':
      'Suivez le statut de vos demandes et cours, y compris après une annulation.',
    'booking.studentListTitle': 'Vos demandes et cours',
    'booking.studentListBody':
      'Aucun créneau disponible n’est affiché ici. Les nouvelles demandes se font depuis l’accueil.',
    'booking.studentEmptyTitle': 'Aucune demande',
    'booking.studentEmptyBody':
      'Vos demandes envoyées et l’historique de vos cours apparaîtront ici.',
    'booking.coachListTitle': 'Demandes et cours',
    'booking.coachEmptyTitle': 'Aucune demande à traiter',
    'booking.coachEmptyBody':
      'Les demandes élèves et cours planifiés apparaîtront ici.',
    'booking.coachCreateTitle': 'Créer un cours',
    'booking.createPricingRequiredTitle': 'Tarif requis',
    'booking.createPricingRequiredBody':
      'Ajoutez ou activez un tarif compatible avec cet élève, ce type de cours et cette durée.',
    'booking.studentLabel': 'Élève',
    'booking.recurrenceEndsOnLabel': 'Récurrence hebdomadaire jusqu’au',
    'booking.recurrenceEndsOnPlaceholder': 'AAAA-MM-JJ, optionnel',
    'booking.createAction': 'Créer le cours',
    'booking.creating': 'Création du cours...',
    'booking.createSuccessButton': 'Cours créé ✓',
    'booking.createAnotherAction': 'Créer un autre cours',
    'booking.approveAction': 'Valider',
    'booking.refuseAction': 'Refuser',
    'booking.refusalCommentLabel': 'Commentaire de refus',
    'booking.refusalCommentPlaceholder': 'Message optionnel pour l’élève',
    'booking.cancelAction': 'Annuler la demande ou le cours',
    'booking.cancelLessonAction': 'Annuler le cours',
    'booking.cancellationTitle': 'Annuler la demande ou le cours',
    'booking.cancellationBody':
      'Expliquez la raison de l’annulation. Ce message sera transmis au coach.',
    'booking.cancellationMessageLabel': 'Message au coach',
    'booking.cancellationMessagePlaceholder':
      'Indiquez la raison de votre annulation.',
    'booking.cancellationMessageCount': '{{count}} / {{max}} caractères',
    'booking.cancellationMessageRequired':
      'Un message au coach est obligatoire.',
    'booking.cancellationMessageTooLong':
      'Le message ne peut pas dépasser 500 caractères.',
    'booking.cancellationConfirmAction': 'Confirmer l’annulation',
    'booking.cancellationSubmitting': 'Annulation...',
    'booking.cancellationCloseAction': 'Fermer la fenêtre d’annulation',
    'booking.modifyAction': 'Modifier',
    'booking.expiresAt': 'Expire le {{date}}',
    'booking.participantNames': 'Participants : {{names}}',
    'booking.inlineRequest': '{{student}} · {{status}}',
    'booking.requestSuccessTitle': 'Demande envoyée',
    'booking.requestSuccessBody':
      'Le coach peut maintenant valider ou refuser la demande.',
    'booking.approveSuccessTitle': 'Demande validée',
    'booking.approveSuccessBody':
      'Le cours est confirmé et le créneau n’est plus demandable.',
    'booking.refuseSuccessTitle': 'Demande refusée',
    'booking.refuseSuccessBody':
      'Le statut et le commentaire sont visibles côté élève.',
    'booking.createSuccessTitle': 'Cours créé',
    'booking.createSuccessBody':
      'Le cours confirmé est visible dans les plannings.',
    'booking.cancelSuccessTitle': 'Réservation annulée',
    'booking.cancelSuccessBody':
      'Le statut est mis à jour et la disponibilité est libérée si applicable.',
    'booking.studentCancelSuccessTitle': 'Réservation annulée',
    'booking.studentCancelSuccessBody':
      'Le statut est mis à jour et votre message a été transmis au coach.',
    'booking.modifySuccessTitle': 'Réservation modifiée',
    'booking.modifySuccessBody':
      'La nouvelle date ou durée est visible dans les plannings.',
    'booking.errorTitle': 'Action impossible',
    'booking.slotUnavailable':
      'Ce créneau n’est plus disponible. Essayez un autre créneau.',
    'booking.pendingLimit':
      'Ce créneau a déjà atteint la limite de demandes en attente.',
    'booking.studentPendingLimit':
      'Vous avez déjà 10 demandes en attente auprès du coach.',
    'booking.studentScheduleConflict':
      'Vous avez déjà une demande ou un cours qui chevauche cet horaire.',
    'booking.alreadyProcessed': 'Cette demande a déjà été traitée.',
    'booking.pastBooking':
      'Ce créneau est déjà passé et ne peut plus être demandé ou annulé.',
    'booking.invalidParticipants':
      'La sélection de participants n’est pas autorisée.',
    'booking.invalidInput':
      'Vérifiez le format et les valeurs des champs avant de réessayer.',
    'booking.pricingMissing':
      'Aucun tarif actif ne correspond au type et à la durée du cours.',
    'booking.unauthorized': 'Votre rôle ne permet pas cette action.',
    'booking.unknownError': 'Vérifiez votre connexion puis réessayez.',
    'auth.signInTitle': 'Retrouvez votre espace.',
    'auth.signInSubtitle':
      'Connectez-vous avec votre email et votre mot de passe pour accéder à Equation Padel.',
    'auth.signUpTitle': 'Créez votre compte.',
    'auth.signUpSubtitle':
      'Inscrivez-vous pour préparer votre profil et accéder aux parcours Equation Padel.',
    'auth.emailLabel': 'Email',
    'auth.emailPlaceholder': 'vous@exemple.fr',
    'auth.passwordLabel': 'Mot de passe',
    'auth.passwordPlaceholder': 'Votre mot de passe',
    'auth.passwordCreatePlaceholder': '12 caractères, majuscule, minuscule et chiffre',
    'auth.passwordShowAction': 'Afficher le mot de passe',
    'auth.passwordHideAction': 'Masquer le mot de passe',
    'auth.confirmPasswordLabel': 'Confirmer le mot de passe',
    'auth.confirmPasswordPlaceholder': 'Répétez votre mot de passe',
    'auth.signInAction': 'Se connecter',
    'auth.signingIn': 'Connexion...',
    'auth.signUpAction': 'Créer mon compte',
    'auth.signingUp': 'Création du compte...',
    'auth.goToSignUp': 'Créer un compte',
    'auth.goToSignIn': 'J’ai déjà un compte',
    'auth.forgotPasswordAction': 'J’ai oublié mon mot de passe',
    'auth.forgotPasswordTitle': 'Réinitialisez votre mot de passe.',
    'auth.forgotPasswordSubtitle':
      'Saisissez votre email pour recevoir un lien de réinitialisation sécurisé.',
    'auth.resetPasswordTitle': 'Choisissez un nouveau mot de passe.',
    'auth.resetPasswordSubtitle':
      'Utilisez le lien reçu par email pour sécuriser à nouveau votre compte.',
    'auth.passwordResetEmailSentTitle': 'Vérifiez votre email',
    'auth.passwordResetEmailSentBody':
      'Si un compte correspond à cette adresse, un lien de réinitialisation vient d’être envoyé.',
    'auth.passwordResetSending': 'Envoi...',
    'auth.passwordResetSendAction': 'Envoyer le lien',
    'auth.passwordResetLinkLoadingTitle': 'Vérification du lien',
    'auth.passwordResetLinkLoadingBody':
      'Nous vérifions votre lien de réinitialisation.',
    'auth.passwordResetInvalidTitle': 'Lien invalide ou expiré',
    'auth.passwordResetInvalidBody':
      'Demandez un nouveau lien de réinitialisation pour continuer.',
    'auth.passwordResetRequestAnotherAction': 'Demander un nouveau lien',
    'auth.passwordResetCompleteTitle': 'Mot de passe modifié',
    'auth.passwordResetCompleteBody':
      'Votre nouveau mot de passe est enregistré. Vous pouvez maintenant vous connecter.',
    'auth.newPasswordLabel': 'Nouveau mot de passe',
    'auth.confirmNewPasswordLabel': 'Confirmer le nouveau mot de passe',
    'auth.passwordResetUpdating': 'Modification...',
    'auth.passwordResetUpdateAction': 'Modifier mon mot de passe',
    'auth.confirmationTitle': 'Vérifiez votre email',
    'auth.confirmationMessage':
      'Votre compte est créé. Ouvrez le message reçu pour confirmer votre adresse avant de vous connecter.',
    'activation.title': 'Activez votre compte élève',
    'activation.subtitle':
      'Définissez votre mot de passe pour accéder à l’espace préparé par votre coach.',
    'activation.emailLabel': 'Email de connexion (si nécessaire)',
    'activation.emailHint':
      'Saisissez votre email si votre coach ne l’a pas renseigné. Sinon, laissez ce champ vide.',
    'activation.passwordLabel': 'Nouveau mot de passe',
    'activation.confirmPasswordLabel': 'Confirmer le nouveau mot de passe',
    'activation.submitAction': 'Activer mon compte',
    'activation.activating': 'Activation...',
    'activation.successTitle': 'Compte activé',
    'activation.successBody':
      'Votre mot de passe est enregistré. Vous pouvez maintenant vous connecter.',
    'activation.redirectingBody':
      'Votre mot de passe est enregistré. Vous allez être redirigé vers votre espace élève.',
    'activation.signingIn': 'Connexion à votre espace...',
    'activation.autoSignInErrorTitle': 'Connexion automatique impossible',
    'activation.autoSignInErrorBody':
      'Votre compte est bien activé. Connectez-vous maintenant avec votre email et votre nouveau mot de passe.',
    'activation.signInAction': 'Se connecter',
    'activation.invalidTitle': 'Lien invalide',
    'activation.invalidBody':
      'Ce lien a expiré, a déjà été utilisé ou a été remplacé. Demandez un nouveau lien à votre coach.',
    'activation.emailRequiredTitle': 'Email requis pour se connecter',
    'activation.emailRequiredBody':
      'Votre fiche ne contient pas encore d’email. Saisissez votre adresse pour activer le compte.',
    'activation.emailInUseTitle': 'Email déjà utilisé',
    'activation.emailInUseBody':
      'Cette adresse appartient déjà à un compte. Utilisez une autre adresse ou contactez votre coach.',
    'activation.errorTitle': 'Activation impossible',
    'activation.errorBody':
      'Le compte n’a pas été activé. Vérifiez votre connexion puis réessayez.',
    'auth.validation.required': 'Ce champ est requis.',
    'auth.validation.invalidEmail': 'Saisissez une adresse email valide.',
    'auth.validation.passwordTooShort':
      'Le mot de passe doit contenir au moins 12 caractères.',
    'auth.validation.passwordTooWeak':
      'Ajoutez au moins une majuscule, une minuscule et un chiffre.',
    'auth.validation.passwordMismatch':
      'Les mots de passe ne correspondent pas.',
    'auth.validation.invalid': 'Vérifiez la valeur saisie.',
    'auth.error.title': 'Impossible de continuer',
    'auth.error.configuration':
      'La connexion Supabase n’est pas configurée. Ajoutez les variables publiques Expo prévues.',
    'auth.error.invalidCredentials': 'Email ou mot de passe incorrect.',
    'auth.error.emailInUse':
      'Un compte utilise déjà cette adresse email. Si votre coach l’a créé, utilisez son lien d’activation.',
    'auth.error.weakPassword': 'Choisissez un mot de passe plus robuste.',
    'auth.error.emailNotConfirmed':
      'Confirmez votre adresse email avant de vous connecter.',
    'auth.error.rateLimited':
      'Trop de tentatives. Réessayez dans quelques minutes.',
    'auth.error.network': 'Vérifiez votre connexion internet puis réessayez.',
    'auth.error.generic': 'Une erreur est survenue. Réessayez plus tard.',
    'auth.sessionTitle': 'Session active',
    'auth.sessionDescription': 'Vous êtes connecté avec {{email}}.',
    'auth.signOutAction': 'Se déconnecter',
    'auth.signingOut': 'Déconnexion...',
    'home.eyebrow': 'Socle mobile-first',
    'home.title':
      'Réserver, valider et suivre les cours de padel sans friction.',
    'home.subtitle':
      'Une base UI premium, chaude et traduisible pour construire les parcours coach et élève.',
    'home.primaryAction': 'Demander un créneau',
    'home.secondaryAction': 'Voir les fondations',
    'home.previewTitle': 'Aperçu parcours P0',
    'home.previewDescription':
      'Les prochains écrans utiliseront les mêmes primitives pour les demandes, disponibilités et profils.',
    'home.metricRequests': 'Demandes en attente',
    'home.metricStudents': 'Élèves actifs',
    'home.metricSlots': 'Créneaux cette semaine',
    'home.formLabel': 'Recherche élève ou créneau',
    'home.formPlaceholder': 'Nom, date ou note coach',
    'home.feedbackTitle': 'Base prête pour les stories métier',
    'home.feedbackMessage':
      'Les textes visibles passent par i18n et les couleurs viennent des tokens Equation Padel.',
    'foundation.eyebrow': 'Design system P0',
    'foundation.title': 'Tokens, thèmes et primitives réutilisables.',
    'foundation.subtitle':
      'La palette terre battue, ocre et vert profond est exposée en light et dark theme.',
    'foundation.tokensTitle': 'Tokens actifs',
    'foundation.themeTitle': 'Thème',
    'foundation.i18nTitle': 'Internationalisation',
    'foundation.i18nBody':
      'Français, anglais et espagnol sont disponibles via le même helper.',
    'foundation.primitiveTitle': 'Primitives UI',
    'foundation.primitiveBody':
      'Boutons, champs, cartes, statuts et feedback partagent les tokens du thème courant.',
    'foundation.token.primary': 'Primaire',
    'foundation.token.secondary': 'Secondaire',
    'foundation.token.background': 'Fond',
    'foundation.token.surface': 'Surface',
    'foundation.token.darkBackground': 'Fond sombre',
    'foundation.token.darkSurface': 'Surface sombre',
    'status.pending': 'En attente',
    'status.pendingActivation': 'À activer',
    'status.active': 'Actif',
    'status.inactive': 'Inactif',
    'status.confirmed': 'Confirmé',
    'status.refused': 'Refusé',
    'status.expired': 'Expiré',
    'status.cancelled': 'Annulé',
    'status.modified': 'Modifié',
    'status.exhausted': 'Épuisé',
    'status.suspended': 'Suspendu',
    'status.deleted': 'Supprimé',
    'theme.light': 'Clair',
    'theme.dark': 'Sombre',
  },
  en: {
    'nav.home': 'Home',
    'nav.mainLabel': 'Main navigation',
    'nav.foundation': 'Foundations',
    'common.docs': 'Docs',
    'common.nextpoint': 'Equation Padel',
    'errorBoundary.rootTitle': 'Something unexpected happened',
    'errorBoundary.rootBody':
      'Equation Padel cannot display this screen right now. Try again to resume navigation.',
    'errorBoundary.planningTitle': 'The schedule encountered a problem',
    'errorBoundary.planningBody':
      'The rest of your space is still available. Try again to reload the schedule.',
    'errorBoundary.messagingTitle': 'Messages encountered a problem',
    'errorBoundary.messagingBody':
      'The rest of your space is still available. Try again to reload your discussions.',
    'errorBoundary.retryAction': 'Try again',
    'auth.sessionLoading': 'Restoring your session...',
    'auth.roleLabel': 'I am creating an account as',
    'auth.roleCoach': 'Coach',
    'auth.roleEleve': 'Student',
    'access.errorTitle': 'Role not found',
    'access.errorBody':
      'Your session is valid but no trusted role is associated with it. Sign out and recreate the account if needed.',
    'public.eyebrow': 'Padel, made simple',
    'public.title': 'Equation Padel',
    'public.subtitle':
      'Book lessons with your coach more easily and track requests in a secure space.',
    'public.signUpAction': 'Sign up',
    'public.signInAction': 'Sign in',
    'public.coachTitle': 'Your padel coach',
    'public.coachBody':
      'A short presentation of the coach, their approach, and support will be published here.',
    'public.coachPendingName': 'Coach profile coming soon',
    'public.coachContactTitle': 'Contact',
    'public.coachLoadErrorTitle': 'Coach profile unavailable',
    'public.coachLoadErrorBody':
      'The coach information cannot be loaded right now.',
    'public.pricingTitle': 'Transparent pricing',
    'public.pricingBody':
      'Individual, duo and group rates configured by the coach will be visible before any request.',
    'public.noAvailabilityTitle': 'Registration required',
    'public.noAvailabilityBody':
      'Availability remains private until you create your account.',
    'role.coachLabel': 'Coach space',
    'role.eleveLabel': 'Student space',
    'role.coachSubtitle': 'Coach · management and schedule',
    'role.eleveSubtitle': 'Student · lessons and requests',
    'role.screenProtectedTitle': 'Access protected by your role',
    'role.screenProtectedBody':
      'This destination is reserved for your space and does not load data from the other role.',
    'role.screenPlaceholder':
      'The business content for this section will be added by its dedicated story.',
    'nav.coach.planning': 'Schedule',
    'nav.coach.availability': 'Availability',
    'nav.coach.pricing': 'Pricing',
    'nav.coach.students': 'Students',
    'nav.coach.stats': 'Stats',
    'stats.loading': 'Loading statistics...',
    'stats.title': 'Statistics',
    'stats.subtitle': 'Track completed lessons and activity for the period.',
    'stats.period.month': 'Month',
    'stats.period.quarter': 'Quarter',
    'stats.period.year': 'Year',
    'stats.periodRange': '{{start}} to {{end}}',
    'stats.lastUpdated': 'Updated at {{time}}',
    'stats.activityAvailable': 'Activity recorded',
    'stats.activityEmpty': 'No activity in period',
    'stats.completedCourses': 'Completed lessons',
    'stats.completedHours': 'Completed hours',
    'stats.averageDuration': 'Average duration',
    'stats.estimatedRevenue': 'Estimated revenue',
    'stats.averageRevenue': 'Average revenue per lesson',
    'stats.estimatedRevenueHint':
      'Estimated from applied rates, with no integrated payment.',
    'stats.emptyTitle': 'No activity for this period',
    'stats.emptyBody': 'Confirmed and completed lessons will appear here.',
    'stats.activeStudentsTitle': 'Most active students',
    'stats.activeStudentsEmpty':
      'There are not enough lessons to show active students yet.',
    'stats.activeStudentCourses': '{{count}} lessons',
    'stats.openStudentAction': 'Open {{name}}’s profile',
    'stats.unknownStudent': 'Student',
    'stats.loadErrorTitle': 'Statistics unavailable',
    'stats.loadErrorBody': 'Statistics cannot be loaded right now. Try again.',
    'stats.accessDenied': 'Statistics are restricted to the coach.',
    'stats.invalidPeriod': 'The requested period is invalid.',
    'stats.retryAction': 'Try again',
    'nav.coach.notifications': 'Notifications',
    'nav.coach.messaging': 'Messages',
    'nav.coach.profile': 'Profile',
    'nav.eleve.home': 'Home',
    'nav.eleve.planning': 'My schedule',
    'nav.eleve.notifications': 'Notifications',
    'nav.eleve.account': 'Account',
    'notifications.loading': 'Loading notifications...',
    'notifications.loadingMore': 'Loading earlier notifications...',
    'notifications.title': 'Notifications',
    'notifications.subtitle':
      'Find requests, approvals, refusals and booking changes.',
    'notifications.pushTitle': 'Push notifications',
    'notifications.pushBody': 'Receive alerts even when the app is closed.',
    'notifications.pushAcceptAction': 'Allow',
    'notifications.pushRefuseAction': 'Refuse',
    'notifications.pushStatus.granted': 'allowed',
    'notifications.pushStatus.denied': 'refused',
    'notifications.pushStatus.undetermined': 'not set',
    'notifications.pushStatus.unavailable': 'unavailable',
    'notifications.pushStatus.unavailableWeb': 'unavailable on the web',
    'notifications.listTitle': 'Recent',
    'notifications.unreadCount': '{{count}} unread',
    'notifications.markAllReadAction': 'Mark all read',
    'notifications.deleteAction': 'Delete notification',
    'notifications.deleteConfirm': 'Delete this notification?',
    'notifications.confirmDeleteAction': 'Confirm deletion',
    'notifications.cancelDeleteAction': 'Cancel deletion',
    'notifications.deleteErrorTitle': 'Unable to delete',
    'notifications.deleteErrorBody':
      'The notification could not be deleted. Try again.',
    'notifications.emptyTitle': 'No notifications',
    'notifications.emptyBody':
      'Important events will appear here even when system push is refused.',
    'notifications.read': 'Read',
    'notifications.unread': 'Unread',
    'notifications.loadErrorTitle': 'Notifications unavailable',
    'notifications.loadErrorBody':
      'Your notifications cannot be loaded right now.',
    'notifications.saveErrorTitle': 'Action unavailable',
    'notifications.saveErrorBody':
      'The change was not saved. Check your connection and try again.',
    'notifications.linkMissingTitle': 'Link unavailable',
    'notifications.linkMissingBody':
      'The linked event is no longer accessible or no longer exists.',
    'messaging.loading': 'Loading discussions...',
    'messaging.loadingMessages': 'Loading messages...',
    'messaging.loadingMore': 'Loading...',
    'messaging.loadMoreThreads': 'Load more discussions',
    'messaging.loadOlderMessages': 'Load earlier messages',
    'messaging.title': 'Messages',
    'messaging.subtitle':
      'Find conversations attached to your slots, requests, and bookings.',
    'messaging.listTitle': 'Schedule discussions',
    'messaging.emptyTitle': 'No discussions',
    'messaging.emptyBody':
      'Discussions will appear here when a request or booking exists.',
    'messaging.read': 'Read',
    'messaging.unread': 'Unread',
    'messaging.unknownStudent': 'Student',
    'messaging.noMessages': 'No messages in this discussion.',
    'messaging.responseLabel': 'Your reply',
    'messaging.responsePlaceholder': 'Reply about this slot or booking.',
    'messaging.sendAction': 'Send',
    'messaging.sending': 'Sending...',
    'messaging.backAction': 'Back to discussions',
    'messaging.openContextAction': 'View in schedule',
    'messaging.linkedContextTitle': 'Linked event',
    'messaging.linkedContextBody':
      '{{student}}’s booking is highlighted in the schedule.',
    'messaging.coachAuthor': 'Coach',
    'messaging.studentAuthor': 'Student',
    'messaging.selectThreadTitle': 'Select a discussion',
    'messaging.selectThreadBody':
      'Open a discussion to review its context and reply.',
    'messaging.loadErrorTitle': 'Messages unavailable',
    'messaging.loadErrorBody': 'Your discussions cannot be loaded right now.',
    'messaging.saveErrorTitle': 'Action unavailable',
    'messaging.saveErrorBody':
      'The reply or read state was not saved. Try again.',
    'messaging.invalidMessageTitle': 'Invalid message',
    'messaging.invalidMessageBody':
      'Enter a non-empty message of no more than 1,000 characters.',
    'messaging.contextUnavailableTitle': 'Event unavailable',
    'messaging.contextUnavailableBody':
      'The linked slot or booking is no longer accessible.',
    'messaging.accessDeniedTitle': 'Access denied',
    'messaging.accessDeniedBody':
      'Schedule messaging is reserved for the coach.',
    'planning.loading': 'Loading planning...',
    'planning.refreshing': 'Updating slots...',
    'planning.coachTitle': 'Coach schedule',
    'planning.coachBody':
      'Review past and upcoming slots and lessons by week or day.',
    'planning.display.agenda': 'Agenda',
    'planning.display.list': 'List',
    'planning.mode.week': 'Week',
    'planning.mode.day': 'Day',
    'planning.filtersLabel': 'Filter the schedule',
    'planning.availabilityFilter': 'Availability',
    'planning.confirmedLessonsFilter': 'Confirmed lessons',
    'planning.previousAction': 'Previous',
    'planning.todayAction': 'Today',
    'planning.nextAction': 'Next',
    'planning.nowLabel': 'Now',
    'planning.weekRange': '{{start}} - {{end}}',
    'planning.loadErrorTitle': 'Schedule unavailable',
    'planning.loadErrorBody': 'Unable to load your slots for this period.',
    'planning.emptyDayTitle': 'No slots',
    'planning.emptyDayBody': 'No availability visible on this day.',
    'planning.slotTime': '{{start}}-{{end}}',
    'planning.slotMeta': '{{duration}} · {{location}}',
    'profile.title': 'My profile',
    'profile.subtitle':
      'Provide the information your coach needs to organize your upcoming lessons.',
    'profile.loading': 'Loading your profile...',
    'profile.fullNameLabel': 'Full name',
    'profile.fullNamePlaceholder': 'Your first and last name',
    'profile.phoneLabel': 'Phone',
    'profile.phonePlaceholder': '+1 555 123 4567',
    'profile.emailLabel': 'Contact email',
    'profile.ageLabel': 'Age',
    'profile.agePlaceholder': 'E.g. 29',
    'profile.levelLabel': 'Padel level',
    'profile.sexLabel': 'Sex',
    'profile.sex.female': 'Woman',
    'profile.sex.male': 'Man',
    'profile.sex.other': 'Other',
    'profile.sex.notSpecified': 'Prefer not to say',
    'profile.languageLabel': 'Preferred language',
    'profile.language.fr': 'French',
    'profile.language.en': 'English',
    'profile.language.es': 'Spanish',
    'profile.themeTitle': 'Appearance',
    'profile.themeBody':
      'Default mode automatically follows your browser or device preference.',
    'profile.themeLabel': 'Application theme',
    'profile.theme.system': 'Default (browser preference)',
    'profile.theme.light': 'Light',
    'profile.theme.dark': 'Dark',
    'profile.saveAction': 'Save my profile',
    'profile.saving': 'Saving...',
    'profile.saveSuccessTitle': 'Profile saved',
    'profile.saveSuccessBody':
      'Your information is up to date and will remain available the next time you sign in.',
    'profile.saveErrorTitle': 'Unable to save',
    'profile.saveErrorBody':
      'Your information was not changed. Check your connection and try again.',
    'profile.loadErrorTitle': 'Profile unavailable',
    'profile.loadErrorBody':
      'Your profile cannot be loaded right now. Try again after restarting the application.',
    'profile.validation.nameTooShort':
      'Enter a name with at least 2 characters.',
    'profile.validation.nameTooLong': 'The name cannot exceed 100 characters.',
    'profile.validation.invalidPhone': 'Enter a valid phone number.',
    'profile.validation.invalidNumber': 'Enter a valid number.',
    'profile.validation.invalidLevel': 'Choose a level between 1 and 10.',
    'profile.validation.invalidAge': 'Enter an age between 5 and 100.',
    'coachProfile.loading': 'Loading your coach profile...',
    'coachProfile.title': 'My coach profile',
    'coachProfile.subtitle':
      'Present your coaching approach and useful contact details before a lesson request.',
    'coachProfile.displayNameLabel': 'Display name',
    'coachProfile.displayNamePlaceholder': 'Your name or professional name',
    'coachProfile.bioLabel': 'Introduction',
    'coachProfile.bioPlaceholder':
      'Briefly describe your approach, experience, and the players you coach.',
    'coachProfile.validation.bioTooShort':
      'The introduction must contain at least 20 characters.',
    'coachProfile.validation.bioTooLong':
      'The introduction cannot exceed 500 characters.',
    'coachProfile.loadErrorTitle': 'Profile unavailable',
    'coachProfile.loadErrorBody':
      'Your coach profile cannot be loaded. Restart the application and try again.',
    'coachProfile.saveSuccessTitle': 'Coach profile saved',
    'coachProfile.saveSuccessBody':
      'The new information is now visible in the public and student spaces.',
    'coachProfile.saveErrorTitle': 'Unable to save',
    'coachProfile.saveErrorBody':
      'The profile was not changed. Check your connection and try again.',
    'coachProfile.saveAction': 'Save coach profile',
    'coachProfile.availabilityTitle': 'Availability',
    'coachProfile.availabilityBody':
      'Define the time slots that can be offered to students.',
    'coachProfile.openAvailability': 'Manage availability',
    'coachProfile.pricingTitle': 'Pricing',
    'coachProfile.pricingBody':
      'Configure individual, duo and group rates shown before booking.',
    'coachProfile.openPricing': 'Manage pricing',
    'coachProfile.notificationsTitle': 'Push notifications',
    'coachProfile.notificationsBody':
      'Choose the alerts you receive for lesson requests and changes.',
    'coachProfile.comingSoon': 'Coming soon',
    'studentHome.title': 'Your booking space',
    'studentHome.subtitle':
      'Review your coach profile before preparing a lesson request.',
    'studentAgenda.loading': 'Loading agenda...',
    'studentAgenda.title': 'Student agenda',
    'studentAgenda.body':
      'Visible slots are available and requestable with your coach.',
    'studentAgenda.loadErrorTitle': 'Agenda unavailable',
    'studentAgenda.loadErrorBody':
      'Unable to load requestable slots or available participants right now.',
    'studentAgenda.retryAction': 'Try again',
    'studentAgenda.emptyDayTitle': 'No requestable slots',
    'studentAgenda.emptyDayBody': 'No available slot is offered on this day.',
    'studentAgenda.slotDetail': '{{date}} · {{duration}} · {{location}}',
    'studentAgenda.requestableStatus': 'Requestable',
    'studentAgenda.calendarTitle': 'Choose a day',
    'studentAgenda.calendarBody':
      'Highlighted days have at least one available time range.',
    'studentAgenda.previousMonthAction': 'View previous month',
    'studentAgenda.nextMonthAction': 'View next month',
    'studentAgenda.currentMonthAction': 'Return to this month',
    'studentAgenda.availableLegend': 'Day with availability',
    'studentAgenda.availableDayLabel':
      '{{date}}, one available time range',
    'studentAgenda.availableDayLabelPlural':
      '{{date}}, {{count}} available time ranges',
    'studentAgenda.selectedDateTitle': 'Availability on {{date}}',
    'studentAgenda.availableRangeCount':
      'One available time range to book',
    'studentAgenda.availableRangeCountPlural':
      '{{count}} available time ranges to book',
    'studentAgenda.selectRangeLabel':
      'Choose a time between {{start}} and {{end}}, {{location}}',
    'studentAgenda.chooseTimeAction': 'Choose a time',
    'studentAgenda.emptyMonthTitle': 'No availability this month',
    'studentAgenda.emptyMonthBody':
      'Move to the next month to see upcoming availability.',
    'pricing.loading': 'Loading pricing...',
    'pricing.loadErrorTitle': 'Pricing unavailable',
    'pricing.loadErrorBody':
      'Pricing cannot be loaded right now. Restart the application and try again.',
    'pricing.publishedTitle': 'Coach pricing',
    'pricing.publishedBody':
      'Prices are shown for information before any lesson request.',
    'pricing.emptyPublishedTitle': 'Pricing coming soon',
    'pricing.emptyPublishedBody':
      'The coach has not published any active rate yet.',
    'pricing.manageTitle': 'Pricing management',
    'pricing.manageBody':
      'Create the individual, duo and group rates shown before a request.',
    'pricing.createTitle': 'New rate',
    'pricing.editTitle': 'Edit rate',
    'pricing.catalogTitle': 'Coach catalog',
    'pricing.labelLabel': 'Label',
    'pricing.labelPlaceholder': 'E.g. Standard individual lesson',
    'pricing.amountLabel': 'Price in euros',
    'pricing.amountPlaceholder': 'E.g. 45.00',
    'pricing.typeLabel': 'Lesson type',
    'pricing.type.individual': 'Individual',
    'pricing.type.duo': 'Duo',
    'pricing.type.group': 'Group',
    'pricing.durationLabel': 'Duration',
    'pricing.duration.60': '1 hour',
    'pricing.duration.90': '1 h 30',
    'pricing.statusLabel': 'Publication',
    'pricing.contextLabel': 'Applicability criteria',
    'pricing.noContext': 'No specific criteria',
    'pricing.context.student': 'Student rate',
    'pricing.context.senior': 'Senior rate',
    'pricing.context.weekend': 'Weekend',
    'pricing.context.public_holiday': 'Public holiday',
    'pricing.studentsLabel': 'Targeted students',
    'pricing.studentSearchLabel': 'Search by name',
    'pricing.studentSearchPlaceholder': 'Student name',
    'pricing.studentSearchHint':
      'Enter a name to find a student.',
    'pricing.studentSearchEmpty': 'No student matches this search.',
    'pricing.selectedStudentsLabel': 'Selected students ({{count}})',
    'pricing.selectStudentAction': 'Select',
    'pricing.selectedStudentAction': 'Selected',
    'pricing.removeStudentAction': 'Remove {{name}} from the selection',
    'pricing.noStudentsBody':
      'No associated student is available for specific targeting.',
    'pricing.createAction': 'Create rate',
    'pricing.updateAction': 'Save changes',
    'pricing.saving': 'Saving...',
    'pricing.cancelAction': 'Cancel',
    'pricing.editAction': 'Edit',
    'pricing.deleteAction': 'Delete',
    'pricing.confirmDeleteAction': 'Confirm deletion',
    'pricing.deleteTitle': 'Delete this rate?',
    'pricing.deleteBody':
      'It will no longer be offered for new requests. Future historical references will remain preserved.',
    'pricing.saveSuccessTitle': 'Rate saved',
    'pricing.saveSuccessBody':
      'The catalog and student surfaces now use the updated version.',
    'pricing.saveErrorTitle': 'Unable to save',
    'pricing.saveErrorBody':
      'The rate was not changed. Check the information and try again.',
    'pricing.emptyCoachTitle': 'No pricing',
    'pricing.emptyCoachBody':
      'Create your first individual, duo or group rate.',
    'pricing.validation.labelTooShort':
      'The label must contain at least 2 characters.',
    'pricing.validation.labelTooLong':
      'The label cannot exceed 100 characters.',
    'pricing.validation.invalidAmount':
      'Enter a positive price with no more than two decimals.',
    'pricing.validation.invalidStudent': 'A targeted student is invalid.',
    'availability.loading': 'Loading availability...',
    'availability.manageTitle': 'Availability management',
    'availability.manageBody':
      'Create continuous ranges with a start time, end time, location, and recurrence.',
    'availability.createTitle': 'New range',
    'availability.dateLabel': 'Date',
    'availability.datePlaceholder': 'YYYY-MM-DD',
    'availability.startsAtLabel': 'Start time',
    'availability.endsAtLabel': 'End time',
    'availability.timePlaceholder': 'HH:MM',
    'availability.durationLabel': 'Slot duration',
    'availability.duration.60': '1 hour',
    'availability.duration.90': '1 h 30',
    'availability.continuousRange': 'Available range',
    'availability.locationLabel': 'Location',
    'availability.recurrenceLabel': 'Recurrence',
    'availability.recurrence.none': 'One-off',
    'availability.recurrence.daily': 'Daily',
    'availability.recurrence.weekly': 'Weekly',
    'availability.recurrenceEndsOnLabel': 'Generate until',
    'availability.recurrenceUntil': 'Generated until {{date}}',
    'availability.previewTitle': 'Range preview',
    'availability.previewEmpty':
      'Complete a coherent range to display the preview.',
    'availability.previewSlot': '{{start}}–{{end}} · {{location}}',
    'availability.createAction': 'Create availability',
    'availability.editAction': 'Edit',
    'availability.updateAction': 'Save',
    'availability.deleteAction': 'Delete',
    'availability.cancelAction': 'Cancel',
    'availability.saving': 'Saving...',
    'availability.saveSuccessTitle': 'Availability created',
    'availability.saveSuccessBody':
      'The continuous range is saved with its times and location.',
    'availability.updateSuccessTitle': 'Slot updated',
    'availability.updateSuccessBody':
      'The selected availability was updated without conflict.',
    'availability.deleteSuccessTitle': 'Slot deleted',
    'availability.deleteSuccessBody':
      'The slot is no longer visible as available.',
    'availability.saveErrorTitle': 'Unable to create',
    'availability.saveErrorBody':
      'No availability was created. Check the information and try again.',
    'availability.updateErrorTitle': 'Unable to update',
    'availability.updateErrorBody':
      'The availability was not updated. Check the date and times, then try again.',
    'availability.conflictTitle': 'Range conflict',
    'availability.conflictBody':
      'This range overlaps an existing availability. Adjust the times.',
    'availability.blockedTitle': 'Change unavailable',
    'availability.blockedBody':
      'This slot already has an active request or confirmed booking.',
    'availability.forbiddenTitle': 'Access denied',
    'availability.forbiddenBody':
      'Only a coach account can create availability.',
    'availability.loadErrorTitle': 'Availability unavailable',
    'availability.loadErrorBody':
      'Your availability cannot be loaded right now.',
    'availability.listTitle': 'Saved ranges',
    'availability.emptyTitle': 'No availability',
    'availability.emptyBody':
      'Create a first range to prepare requestable slots.',
    'availability.emptyPeriodTitle': 'No availability in this period',
    'availability.emptyPeriodBody':
      'Use the navigation buttons to view another period.',
    'availability.rangeTime': '{{start}}–{{end}}',
    'availability.rangeMeta': '{{location}}',
    'availability.generatedSlotsTitle': 'Available occurrences',
    'availability.generatedSlot': '{{date}}–{{end}} · {{location}}',
    'availability.slotStatus.available': 'Available',
    'availability.slotStatus.booked': 'Booked',
    'availability.slotStatus.cancelled': 'Cancelled',
    'availability.scopeDialogTitle': 'Apply change',
    'availability.scopeDeleteDialogTitle': 'Apply deletion',
    'availability.scopeDialogBody':
      'Choose whether the action applies only to this occurrence or to the recurring series.',
    'availability.scopeOccurrenceAction': 'This occurrence',
    'availability.scopeSeriesAction': 'Whole series',
    'availability.validation.invalidDate': 'Enter a date using YYYY-MM-DD.',
    'availability.validation.invalidTime': 'Enter a time using HH:MM.',
    'availability.validation.endBeforeStart':
      'The end time must be after the start time.',
    'availability.validation.rangeTooShort':
      'The range must contain at least one complete slot.',
    'availability.validation.recurrenceEndRequired':
      'Enter a generation horizon.',
    'availability.validation.recurrenceEndBeforeStart':
      'The horizon must be on or after the start date.',
    'students.loading': 'Loading students...',
    'students.title': 'Students',
    'students.subtitle':
      'Find only the students currently associated with your coach space.',
    'students.createAction': 'Create a student record',
    'students.createTitle': 'New student record',
    'students.createBody':
      'Add a student and prepare an inactive account. Access will be completed through a 24-hour link.',
    'students.optionalPhoneLabel': 'Phone (optional)',
    'students.optionalEmailLabel': 'Email (optional)',
    'students.optionalAgeLabel': 'Age (optional)',
    'students.noContact': 'No contact details provided',
    'students.createSubmitAction': 'Create record',
    'students.createCancelAction': 'Cancel',
    'students.creating': 'Creating...',
    'students.createSuccessTitle': 'Student record created',
    'students.createSuccessBody':
      '{{name}} is now associated with your coach space.',
    'students.createErrorTitle': 'Unable to create',
    'students.createErrorBody':
      'No record was created. Check the information and try again.',
    'students.createDuplicateTitle': 'Student already exists',
    'students.createDuplicateBody':
      'A student already uses this email or phone number. Open the existing record.',
    'students.loadErrorTitle': 'List unavailable',
    'students.loadErrorBody':
      'Students cannot be loaded right now. Restart the application and try again.',
    'students.searchLabel': 'Search by name or email',
    'students.searchPlaceholder': 'Student name or email',
    'students.incompleteProfile': 'Incomplete profile',
    'students.levelFilterLabel': 'Padel level',
    'students.allLevels': 'All levels',
    'students.sexFilterLabel': 'Student sex',
    'students.allSexes': 'All',
    'students.ageRangeSliderLabel': 'Age range',
    'students.ageMin': 'Minimum: {{age}}',
    'students.ageMax': 'Maximum: {{age}}',
    'students.ageFilterLabel': 'Age range',
    'students.allAges': 'All ages',
    'students.ageRange': 'Ages {{min}}–{{max}}',
    'students.ageSingle': 'Age {{age}}',
    'students.resetFilters': 'Reset filters',
    'students.resultsTitle': 'Results',
    'students.resultCount': '{{count}} student(s)',
    'students.pageStatus': 'Page {{current}} of {{total}}',
    'students.previousPage': 'Previous page',
    'students.nextPage': 'Next page',
    'students.levelValue': 'Level {{level}}',
    'students.ageValue': 'Age {{age}}',
    'students.emptyListTitle': 'No associated students',
    'students.emptyListBody':
      'Students will appear here after they are associated with your space.',
    'students.emptyFilterTitle': 'No results',
    'students.emptyFilterBody':
      'No student matches this search and these filters.',
    'studentDetail.loading': 'Loading student record...',
    'studentDetail.eyebrow': 'Student record',
    'studentDetail.backAction': 'Back to students',
    'studentDetail.notFoundTitle': 'Record unavailable',
    'studentDetail.notFoundBody':
      'This record does not exist or the student is not associated with your coach space.',
    'studentDetail.loadErrorTitle': 'Record unavailable',
    'studentDetail.loadErrorBody':
      'This student record cannot be loaded right now.',
    'studentDetail.profileTitle': 'Student information',
    'studentDetail.incompleteProfileBody':
      'This student has not completed their profile yet. Their email remains available for contact.',
    'studentDetail.historyTitle': 'History',
    'studentDetail.historyCount': '{{count}} item(s)',
    'studentDetail.historyFilter.label': 'Filter by status',
    'studentDetail.historyFilter.all': 'All',
    'studentDetail.historyFilter.cancelled': 'Cancelled',
    'studentDetail.historyFilter.confirmed': 'Confirmed',
    'studentDetail.historyFilter.refused': 'Refused',
    'studentDetail.historyFilterEmptyTitle': 'No results',
    'studentDetail.historyFilterEmptyBody': 'No event matches this filter.',
    'studentDetail.historyEmptyTitle': 'No history',
    'studentDetail.historyEmptyBody':
      'Requests, lessons, cancellations, changes, and packs will appear here.',
    'studentDetail.historyLoading': 'Loading history...',
    'studentDetail.historyLoadingMore': 'Loading earlier events...',
    'studentDetail.historyLoadMoreAction': 'Retry loading',
    'studentDetail.historyLoadErrorTitle': 'History unavailable',
    'studentDetail.historyLoadErrorBody':
      'This student’s history cannot be loaded right now.',
    'studentDetail.historyType.bookingRequested': 'Lesson request',
    'studentDetail.historyType.lessonConfirmed': 'Confirmed lesson',
    'studentDetail.historyType.bookingCancelled': 'Cancellation',
    'studentDetail.historyType.bookingModified': 'Change',
    'studentDetail.historyType.lessonPackAssigned': 'Pack assigned',
    'studentDetail.historyType.lessonPackConsumed': 'Pack session used',
    'studentDetail.historyType.lessonPackAdjusted': 'Pack credit added',
    'studentDetail.activationGenerateAction': 'Generate activation link',
    'studentDetail.activationRegenerateAction': 'Regenerate link',
    'studentDetail.activationGenerating': 'Generating...',
    'studentDetail.activationReadyTitle': 'Activation link ready',
    'studentDetail.activationExpiresAt': 'Expires on {{date}}.',
    'studentDetail.activationCopyAction': 'Copy link',
    'studentDetail.activationShareAction': 'Share link',
    'studentDetail.activationShareMessage':
      'Activate your Equation Padel account with this 24-hour link: {{link}}',
    'studentDetail.activationCopiedTitle': 'Link copied',
    'studentDetail.activationCopiedBody': 'You can now send it to the student.',
    'studentDetail.activationNoEmailTitle': 'No email address provided',
    'studentDetail.activationNoEmailBody':
      'The link is still available: copy it or share it manually. It cannot be emailed from this record.',
    'studentDetail.activationErrorTitle': 'Link unavailable',
    'studentDetail.activationErrorBody':
      'The link could not be generated or shared. Check the account status and try again.',
    'studentDetail.deleteTitle': 'Delete this student record',
    'studentDetail.deleteBody':
      'This action is available only before account activation. It permanently deletes the provisional account and all associated data.',
    'studentDetail.deleteAction': 'Delete student',
    'studentDetail.deleteConfirmTitle': 'Confirm deletion',
    'studentDetail.deleteConfirmBody':
      'Do you really want to permanently delete {{name}}’s record?',
    'studentDetail.deleteConfirmAction': 'Delete permanently',
    'studentDetail.deleteCancelAction': 'Cancel',
    'studentDetail.deleting': 'Deleting...',
    'studentDetail.deleteErrorTitle': 'Unable to delete',
    'studentDetail.deleteErrorBody':
      'The record was not deleted. The account may already have been activated or may no longer be associated with your space.',
    'studentPrivateNote.loading': 'Loading private note...',
    'studentPrivateNote.title': 'Private coach note',
    'studentPrivateNote.privateHint': 'Visible only in your coach space.',
    'studentPrivateNote.addAction': 'Add a note',
    'studentPrivateNote.editAction': 'Edit',
    'studentPrivateNote.fieldLabel': 'Private note',
    'studentPrivateNote.placeholder':
      'Add a useful reminder for upcoming lessons.',
    'studentPrivateNote.characterCount': '{{count}} / 2000 characters',
    'studentPrivateNote.saveAction': 'Save',
    'studentPrivateNote.saving': 'Saving...',
    'studentPrivateNote.cancelAction': 'Cancel',
    'studentPrivateNote.emptyBody': 'No private note has been saved yet.',
    'studentPrivateNote.validationRequired': 'Enter a note before saving.',
    'studentPrivateNote.validationTooLong':
      'The note cannot exceed 2000 characters.',
    'studentPrivateNote.loadErrorTitle': 'Note unavailable',
    'studentPrivateNote.loadErrorBody':
      'The private note cannot be loaded right now.',
    'studentPrivateNote.saveSuccessTitle': 'Note saved',
    'studentPrivateNote.saveSuccessBody':
      'The private note is up to date in your coach space.',
    'studentPrivateNote.saveErrorTitle': 'Unable to save',
    'studentPrivateNote.saveErrorBody':
      'The existing note was not changed. Try again.',
    'lessonPack.loading': 'Loading lesson packs...',
    'lessonPack.loadMoreAction': 'Retry loading',
    'lessonPack.studentTitle': 'My ticket packs',
    'lessonPack.readonlyHint':
      'View your lesson credits. Only your coach can change them.',
    'lessonPack.studentEmptyBody':
      'No ticket pack has been assigned to you yet.',
    'lessonPack.title': 'Individual lesson pack',
    'lessonPack.trackingOnlyHint':
      'Credit tracking only, with no purchase or integrated payment.',
    'lessonPack.assignAction': 'Assign a pack',
    'lessonPack.includedLabel': 'Included lessons',
    'lessonPack.includedPlaceholder': 'E.g. 10',
    'lessonPack.confirmAssignAction': 'Confirm assignment',
    'lessonPack.assigning': 'Assigning...',
    'lessonPack.cancelAction': 'Cancel',
    'lessonPack.individualTitle': 'Individual pack',
    'lessonPack.includedMetric': 'Included',
    'lessonPack.usedMetric': 'Used',
    'lessonPack.remainingMetric': 'Remaining',
    'lessonPack.emptyBody':
      'No individual lesson pack is attached to this student yet.',
    'lessonPack.validationInvalidCount':
      'Enter a whole number between 1 and 100.',
    'lessonPack.saveSuccessTitle': 'Pack assigned',
    'lessonPack.saveSuccessBody':
      'Lesson credits are now tracked on this student record.',
    'lessonPack.activeExistsTitle': 'Active pack already exists',
    'lessonPack.activeExistsBody':
      'Finish the active pack before assigning a new one.',
    'lessonPack.saveErrorTitle': 'Unable to assign',
    'lessonPack.saveErrorBody':
      'No pack was created. Check the student relationship and try again.',
    'lessonPack.loadErrorTitle': 'Packs unavailable',
    'lessonPack.loadErrorBody': 'Lesson credits cannot be loaded right now.',
    'lessonPack.consumeAction': 'Mark one session used',
    'lessonPack.consuming': 'Marking used...',
    'lessonPack.consumeSuccessTitle': 'Session used',
    'lessonPack.consumeSuccessBody':
      'Pack counters are up to date and the student history was updated.',
    'lessonPack.decrementAccessibilityLabel': 'Remove one remaining lesson',
    'lessonPack.incrementAccessibilityLabel': 'Add one remaining lesson',
    'lessonPack.adjusting': 'Updating the pack...',
    'lessonPack.increaseSuccessTitle': 'Lesson added',
    'lessonPack.increaseSuccessBody':
      'The pack now has one additional remaining lesson.',
    'lessonPack.decreaseSuccessTitle': 'Lesson removed',
    'lessonPack.decreaseSuccessBody':
      'The pack total was corrected without changing the number of used lessons.',
    'lessonPack.noRemainingTitle': 'Pack exhausted',
    'lessonPack.noRemainingBody':
      'No session can be used: this pack has no remaining lessons.',
    'lessonPack.consumeErrorTitle': 'Unable to mark used',
    'lessonPack.consumeErrorBody':
      'No remaining lesson was changed. The pack may be exhausted or access denied.',
    'lessonPack.maximumTitle': 'Maximum reached',
    'lessonPack.maximumBody':
      'A pack cannot contain more than 100 included lessons.',
    'lessonPack.minimumTitle': 'Minimum reached',
    'lessonPack.minimumBody': 'A pack must keep at least one included lesson.',
    'lessonPack.adjustErrorTitle': 'Unable to update',
    'lessonPack.adjustErrorBody':
      'The counter was not changed. Reload the student record and try again.',
    'booking.openRequestAction': 'Request',
    'booking.requestAction': 'Send request',
    'booking.startTimeLabel': 'Start time',
    'booking.startTimePlaceholder': 'HH:mm',
    'booking.invalidStartTime':
      'Enter a quarter-hour time, for example 11:00 or 11:15.',
    'booking.durationLabel': 'Lesson duration',
    'booking.proposedTime': 'Proposed time: {{start}}–{{end}}',
    'booking.noDurationFitTitle': 'No suitable time',
    'booking.noDurationFitBody':
      'This duration does not fit in any free part of the range.',
    'booking.lessonTypeLabel': 'Lesson type',
    'booking.commentLabel': 'Comment',
    'booking.commentPlaceholder': 'Add your goal or scheduling context.',
    'booking.participantsLabel': 'Participants',
    'booking.duoParticipantRequired':
      'Select exactly one partner to form the duo.',
    'booking.requesterIncluded': 'You are included',
    'booking.unknownStudent': 'Student',
    'booking.priceLabel': 'Price: {{price}}',
    'booking.studentPageTitle': 'Requests and lessons',
    'booking.studentPageBody':
      'Track the status of your requests and lessons, including after cancellation.',
    'booking.studentListTitle': 'Your requests and lessons',
    'booking.studentListBody':
      'No available slots are shown here. New requests start from the home page.',
    'booking.studentEmptyTitle': 'No requests',
    'booking.studentEmptyBody':
      'Sent requests and your lesson history will appear here.',
    'booking.coachListTitle': 'Requests and lessons',
    'booking.coachEmptyTitle': 'No requests to handle',
    'booking.coachEmptyBody':
      'Student requests and planned lessons will appear here.',
    'booking.coachCreateTitle': 'Create a lesson',
    'booking.createPricingRequiredTitle': 'Rate required',
    'booking.createPricingRequiredBody':
      'Add or activate a rate compatible with this student, lesson type and duration.',
    'booking.studentLabel': 'Student',
    'booking.recurrenceEndsOnLabel': 'Weekly recurrence until',
    'booking.recurrenceEndsOnPlaceholder': 'YYYY-MM-DD, optional',
    'booking.createAction': 'Create lesson',
    'booking.creating': 'Creating lesson...',
    'booking.createSuccessButton': 'Lesson created ✓',
    'booking.createAnotherAction': 'Create another lesson',
    'booking.approveAction': 'Approve',
    'booking.refuseAction': 'Refuse',
    'booking.refusalCommentLabel': 'Refusal comment',
    'booking.refusalCommentPlaceholder': 'Optional message for the student',
    'booking.cancelAction': 'Cancel request or lesson',
    'booking.cancelLessonAction': 'Cancel lesson',
    'booking.cancellationTitle': 'Cancel request or lesson',
    'booking.cancellationBody':
      'Explain why you are cancelling. This message will be sent to your coach.',
    'booking.cancellationMessageLabel': 'Message to the coach',
    'booking.cancellationMessagePlaceholder':
      'Enter the reason for your cancellation.',
    'booking.cancellationMessageCount': '{{count}} / {{max}} characters',
    'booking.cancellationMessageRequired':
      'A message to the coach is required.',
    'booking.cancellationMessageTooLong':
      'The message cannot exceed 500 characters.',
    'booking.cancellationConfirmAction': 'Confirm cancellation',
    'booking.cancellationSubmitting': 'Cancelling...',
    'booking.cancellationCloseAction': 'Close cancellation dialog',
    'booking.modifyAction': 'Modify',
    'booking.expiresAt': 'Expires on {{date}}',
    'booking.participantNames': 'Participants: {{names}}',
    'booking.inlineRequest': '{{student}} · {{status}}',
    'booking.requestSuccessTitle': 'Request sent',
    'booking.requestSuccessBody':
      'The coach can now approve or refuse the request.',
    'booking.approveSuccessTitle': 'Request approved',
    'booking.approveSuccessBody':
      'The lesson is confirmed and the slot is no longer requestable.',
    'booking.refuseSuccessTitle': 'Request refused',
    'booking.refuseSuccessBody':
      'The status and comment are visible to the student.',
    'booking.createSuccessTitle': 'Lesson created',
    'booking.createSuccessBody':
      'The confirmed lesson is visible in schedules.',
    'booking.cancelSuccessTitle': 'Booking cancelled',
    'booking.cancelSuccessBody':
      'The status was updated and the slot is released when applicable.',
    'booking.studentCancelSuccessTitle': 'Booking cancelled',
    'booking.studentCancelSuccessBody':
      'The status was updated and your message was sent to the coach.',
    'booking.modifySuccessTitle': 'Booking modified',
    'booking.modifySuccessBody':
      'The new date or duration is visible in schedules.',
    'booking.errorTitle': 'Action unavailable',
    'booking.slotUnavailable':
      'This slot is no longer available. Try another slot.',
    'booking.pendingLimit':
      'This slot already reached its pending request limit.',
    'booking.studentPendingLimit':
      'You already have 10 pending requests with the coach.',
    'booking.studentScheduleConflict':
      'You already have a request or lesson that overlaps this time.',
    'booking.alreadyProcessed': 'This request has already been processed.',
    'booking.pastBooking':
      'This time slot has passed and can no longer be requested or cancelled.',
    'booking.invalidParticipants': 'The participant selection is not allowed.',
    'booking.invalidInput':
      'Check the field formats and values before trying again.',
    'booking.pricingMissing':
      'No active rate matches this lesson type and duration.',
    'booking.unauthorized': 'Your role cannot perform this action.',
    'booking.unknownError': 'Check your connection and try again.',
    'auth.signInTitle': 'Return to your space.',
    'auth.signInSubtitle':
      'Sign in with your email and password to access Equation Padel.',
    'auth.signUpTitle': 'Create your account.',
    'auth.signUpSubtitle':
      'Sign up to prepare your profile and access Equation Padel journeys.',
    'auth.emailLabel': 'Email',
    'auth.emailPlaceholder': 'you@example.com',
    'auth.passwordLabel': 'Password',
    'auth.passwordPlaceholder': 'Your password',
    'auth.passwordCreatePlaceholder': '12 characters, upper/lowercase and a number',
    'auth.passwordShowAction': 'Show password',
    'auth.passwordHideAction': 'Hide password',
    'auth.confirmPasswordLabel': 'Confirm password',
    'auth.confirmPasswordPlaceholder': 'Enter your password again',
    'auth.signInAction': 'Sign in',
    'auth.signingIn': 'Signing in...',
    'auth.signUpAction': 'Create my account',
    'auth.signingUp': 'Creating account...',
    'auth.goToSignUp': 'Create an account',
    'auth.goToSignIn': 'I already have an account',
    'auth.forgotPasswordAction': 'I forgot my password',
    'auth.forgotPasswordTitle': 'Reset your password.',
    'auth.forgotPasswordSubtitle':
      'Enter your email to receive a secure password reset link.',
    'auth.resetPasswordTitle': 'Choose a new password.',
    'auth.resetPasswordSubtitle':
      'Use the link received by email to secure your account again.',
    'auth.passwordResetEmailSentTitle': 'Check your email',
    'auth.passwordResetEmailSentBody':
      'If an account matches this address, a password reset link has just been sent.',
    'auth.passwordResetSending': 'Sending...',
    'auth.passwordResetSendAction': 'Send the link',
    'auth.passwordResetLinkLoadingTitle': 'Checking the link',
    'auth.passwordResetLinkLoadingBody':
      'We are checking your password reset link.',
    'auth.passwordResetInvalidTitle': 'Invalid or expired link',
    'auth.passwordResetInvalidBody':
      'Request a new password reset link to continue.',
    'auth.passwordResetRequestAnotherAction': 'Request a new link',
    'auth.passwordResetCompleteTitle': 'Password changed',
    'auth.passwordResetCompleteBody':
      'Your new password is saved. You can now sign in.',
    'auth.newPasswordLabel': 'New password',
    'auth.confirmNewPasswordLabel': 'Confirm new password',
    'auth.passwordResetUpdating': 'Updating...',
    'auth.passwordResetUpdateAction': 'Change my password',
    'auth.confirmationTitle': 'Check your email',
    'auth.confirmationMessage':
      'Your account was created. Open the message you received to confirm your address before signing in.',
    'activation.title': 'Activate your student account',
    'activation.subtitle':
      'Set your password to access the space prepared by your coach.',
    'activation.emailLabel': 'Sign-in email (if needed)',
    'activation.emailHint':
      'Enter your email if your coach did not provide it. Otherwise, leave this field blank.',
    'activation.passwordLabel': 'New password',
    'activation.confirmPasswordLabel': 'Confirm new password',
    'activation.submitAction': 'Activate my account',
    'activation.activating': 'Activating...',
    'activation.successTitle': 'Account activated',
    'activation.successBody': 'Your password is saved. You can now sign in.',
    'activation.redirectingBody':
      'Your password is saved. You will be redirected to your student space.',
    'activation.signingIn': 'Signing in to your space...',
    'activation.autoSignInErrorTitle': 'Unable to sign in automatically',
    'activation.autoSignInErrorBody':
      'Your account is activated. Sign in now with your email and new password.',
    'activation.signInAction': 'Sign in',
    'activation.invalidTitle': 'Invalid link',
    'activation.invalidBody':
      'This link expired, was already used, or was replaced. Ask your coach for a new link.',
    'activation.emailRequiredTitle': 'Email required to sign in',
    'activation.emailRequiredBody':
      'Your record does not have an email yet. Enter your address to activate the account.',
    'activation.emailInUseTitle': 'Email already in use',
    'activation.emailInUseBody':
      'This address belongs to another account. Use a different address or contact your coach.',
    'activation.errorTitle': 'Unable to activate',
    'activation.errorBody':
      'The account was not activated. Check your connection and try again.',
    'auth.validation.required': 'This field is required.',
    'auth.validation.invalidEmail': 'Enter a valid email address.',
    'auth.validation.passwordTooShort':
      'The password must contain at least 12 characters.',
    'auth.validation.passwordTooWeak':
      'Add at least one uppercase letter, one lowercase letter, and one number.',
    'auth.validation.passwordMismatch': 'The passwords do not match.',
    'auth.validation.invalid': 'Check the entered value.',
    'auth.error.title': 'Unable to continue',
    'auth.error.configuration':
      'Supabase is not configured. Add the expected public Expo variables.',
    'auth.error.invalidCredentials': 'Incorrect email or password.',
    'auth.error.emailInUse':
      'An account already uses this email address. If your coach created it, use the activation link.',
    'auth.error.weakPassword': 'Choose a stronger password.',
    'auth.error.emailNotConfirmed':
      'Confirm your email address before signing in.',
    'auth.error.rateLimited': 'Too many attempts. Try again in a few minutes.',
    'auth.error.network': 'Check your internet connection and try again.',
    'auth.error.generic': 'An error occurred. Try again later.',
    'auth.sessionTitle': 'Active session',
    'auth.sessionDescription': 'You are signed in as {{email}}.',
    'auth.signOutAction': 'Sign out',
    'auth.signingOut': 'Signing out...',
    'home.eyebrow': 'Mobile-first baseline',
    'home.title': 'Book, approve, and track padel lessons without friction.',
    'home.subtitle':
      'A warm, premium, translatable UI base for coach and student journeys.',
    'home.primaryAction': 'Request a slot',
    'home.secondaryAction': 'View foundations',
    'home.previewTitle': 'P0 journey preview',
    'home.previewDescription':
      'Upcoming screens will reuse these primitives for requests, availability, and profiles.',
    'home.metricRequests': 'Pending requests',
    'home.metricStudents': 'Active students',
    'home.metricSlots': 'Slots this week',
    'home.formLabel': 'Search student or slot',
    'home.formPlaceholder': 'Name, date, or coach note',
    'home.feedbackTitle': 'Ready for feature stories',
    'home.feedbackMessage':
      'Visible text uses i18n and colors come from Equation Padel tokens.',
    'foundation.eyebrow': 'P0 design system',
    'foundation.title': 'Tokens, themes, and reusable primitives.',
    'foundation.subtitle':
      'The clay, ochre, and deep green palette is exposed in light and dark themes.',
    'foundation.tokensTitle': 'Active tokens',
    'foundation.themeTitle': 'Theme',
    'foundation.i18nTitle': 'Internationalization',
    'foundation.i18nBody':
      'French, English, and Spanish are available through one helper.',
    'foundation.primitiveTitle': 'UI primitives',
    'foundation.primitiveBody':
      'Buttons, fields, cards, statuses, and feedback share the current theme tokens.',
    'foundation.token.primary': 'Primary',
    'foundation.token.secondary': 'Secondary',
    'foundation.token.background': 'Background',
    'foundation.token.surface': 'Surface',
    'foundation.token.darkBackground': 'Dark background',
    'foundation.token.darkSurface': 'Dark surface',
    'status.pending': 'Pending',
    'status.pendingActivation': 'Activation pending',
    'status.active': 'Active',
    'status.inactive': 'Inactive',
    'status.confirmed': 'Confirmed',
    'status.refused': 'Refused',
    'status.expired': 'Expired',
    'status.cancelled': 'Cancelled',
    'status.modified': 'Modified',
    'status.exhausted': 'Exhausted',
    'status.suspended': 'Suspended',
    'status.deleted': 'Deleted',
    'theme.light': 'Light',
    'theme.dark': 'Dark',
  },
  es: {
    'nav.home': 'Inicio',
    'nav.mainLabel': 'Navegación principal',
    'nav.foundation': 'Bases',
    'common.docs': 'Docs',
    'common.nextpoint': 'Equation Padel',
    'errorBoundary.rootTitle': 'Se produjo un error inesperado',
    'errorBoundary.rootBody':
      'Equation Padel no puede mostrar esta pantalla en este momento. Inténtalo de nuevo para continuar navegando.',
    'errorBoundary.planningTitle': 'La planificación encontró un problema',
    'errorBoundary.planningBody':
      'El resto de tu espacio sigue disponible. Inténtalo de nuevo para recargar la planificación.',
    'errorBoundary.messagingTitle': 'La mensajería encontró un problema',
    'errorBoundary.messagingBody':
      'El resto de tu espacio sigue disponible. Inténtalo de nuevo para recargar tus conversaciones.',
    'errorBoundary.retryAction': 'Intentar de nuevo',
    'auth.sessionLoading': 'Restaurando tu sesión...',
    'auth.roleLabel': 'Creo una cuenta como',
    'auth.roleCoach': 'Coach',
    'auth.roleEleve': 'Alumno',
    'access.errorTitle': 'Rol no encontrado',
    'access.errorBody':
      'Tu sesión es válida, pero no tiene un rol seguro asociado. Cierra la sesión y vuelve a crear la cuenta si es necesario.',
    'public.eyebrow': 'Pádel, sin complicaciones',
    'public.title': 'Equation Padel',
    'public.subtitle':
      'Reserva clases con tu coach más fácilmente y sigue tus solicitudes en un espacio seguro.',
    'public.signUpAction': 'Registrarse',
    'public.signInAction': 'Iniciar sesión',
    'public.coachTitle': 'Tu coach de pádel',
    'public.coachBody':
      'Aquí se publicará una breve presentación del coach, su enfoque y su acompañamiento.',
    'public.coachPendingName': 'Perfil del coach próximamente',
    'public.coachContactTitle': 'Contacto',
    'public.coachLoadErrorTitle': 'Perfil del coach no disponible',
    'public.coachLoadErrorBody':
      'No se puede cargar la información del coach en este momento.',
    'public.pricingTitle': 'Tarifas transparentes',
    'public.pricingBody':
      'Las tarifas individuales, dúo y colectivas configuradas por el coach serán visibles antes de solicitar.',
    'public.noAvailabilityTitle': 'Registro obligatorio',
    'public.noAvailabilityBody':
      'La disponibilidad permanece privada hasta que crees tu cuenta.',
    'role.coachLabel': 'Espacio coach',
    'role.eleveLabel': 'Espacio alumno',
    'role.coachSubtitle': 'Coach · gestión y planificación',
    'role.eleveSubtitle': 'Alumno · clases y solicitudes',
    'role.screenProtectedTitle': 'Acceso protegido por tu rol',
    'role.screenProtectedBody':
      'Este destino está reservado a tu espacio y no carga datos del otro rol.',
    'role.screenPlaceholder':
      'El contenido funcional de esta sección se añadirá en su historia específica.',
    'nav.coach.planning': 'Planificación',
    'nav.coach.availability': 'Disponibilidad',
    'nav.coach.pricing': 'Tarifas',
    'nav.coach.students': 'Alumnos',
    'nav.coach.stats': 'Estadísticas',
    'stats.loading': 'Cargando estadísticas...',
    'stats.title': 'Estadísticas',
    'stats.subtitle':
      'Consulta las clases terminadas y tu actividad del período.',
    'stats.period.month': 'Mes',
    'stats.period.quarter': 'Trimestre',
    'stats.period.year': 'Año',
    'stats.periodRange': 'Del {{start}} al {{end}}',
    'stats.lastUpdated': 'Actualizado a las {{time}}',
    'stats.activityAvailable': 'Actividad registrada',
    'stats.activityEmpty': 'Período sin actividad',
    'stats.completedCourses': 'Clases realizadas',
    'stats.completedHours': 'Horas realizadas',
    'stats.averageDuration': 'Duración media',
    'stats.estimatedRevenue': 'Ingresos estimados',
    'stats.averageRevenue': 'Ingreso medio por clase',
    'stats.estimatedRevenueHint':
      'Estimación calculada con las tarifas aplicadas, sin pago integrado.',
    'stats.emptyTitle': 'Sin actividad en este periodo',
    'stats.emptyBody': 'Las clases confirmadas y finalizadas aparecerán aquí.',
    'stats.activeStudentsTitle': 'Alumnos más activos',
    'stats.activeStudentsEmpty':
      'Todavía no hay suficientes clases para mostrar alumnos activos.',
    'stats.activeStudentCourses': '{{count}} clases',
    'stats.openStudentAction': 'Abrir la ficha de {{name}}',
    'stats.unknownStudent': 'Alumno',
    'stats.loadErrorTitle': 'Estadísticas no disponibles',
    'stats.loadErrorBody':
      'No se pueden cargar las estadísticas ahora. Inténtalo de nuevo.',
    'stats.accessDenied': 'Las estadísticas están reservadas al coach.',
    'stats.invalidPeriod': 'El periodo solicitado no es válido.',
    'stats.retryAction': 'Intentar de nuevo',
    'nav.coach.notifications': 'Notificaciones',
    'nav.coach.messaging': 'Mensajes',
    'nav.coach.profile': 'Perfil',
    'nav.eleve.home': 'Inicio',
    'nav.eleve.planning': 'Mi agenda',
    'nav.eleve.notifications': 'Notificaciones',
    'nav.eleve.account': 'Cuenta',
    'notifications.loading': 'Cargando notificaciones...',
    'notifications.loadingMore': 'Cargando notificaciones anteriores...',
    'notifications.title': 'Notificaciones',
    'notifications.subtitle':
      'Encuentra solicitudes, validaciones, rechazos y cambios de reserva.',
    'notifications.pushTitle': 'Notificaciones push',
    'notifications.pushBody':
      'Recibe alertas incluso cuando la aplicación esté cerrada.',
    'notifications.pushAcceptAction': 'Permitir',
    'notifications.pushRefuseAction': 'Rechazar',
    'notifications.pushStatus.granted': 'permitidas',
    'notifications.pushStatus.denied': 'rechazadas',
    'notifications.pushStatus.undetermined': 'sin definir',
    'notifications.pushStatus.unavailable': 'no disponible',
    'notifications.pushStatus.unavailableWeb': 'no disponible en la web',
    'notifications.listTitle': 'Recientes',
    'notifications.unreadCount': '{{count}} sin leer',
    'notifications.markAllReadAction': 'Marcar todo como leído',
    'notifications.deleteAction': 'Eliminar notificación',
    'notifications.deleteConfirm': '¿Eliminar esta notificación?',
    'notifications.confirmDeleteAction': 'Confirmar eliminación',
    'notifications.cancelDeleteAction': 'Cancelar eliminación',
    'notifications.deleteErrorTitle': 'No se puede eliminar',
    'notifications.deleteErrorBody':
      'No se pudo eliminar la notificación. Inténtalo de nuevo.',
    'notifications.emptyTitle': 'Sin notificaciones',
    'notifications.emptyBody':
      'Los eventos importantes aparecerán aquí aunque el push del sistema esté rechazado.',
    'notifications.read': 'Leída',
    'notifications.unread': 'Sin leer',
    'notifications.loadErrorTitle': 'Notificaciones no disponibles',
    'notifications.loadErrorBody':
      'No se pueden cargar tus notificaciones en este momento.',
    'notifications.saveErrorTitle': 'Acción no disponible',
    'notifications.saveErrorBody':
      'No se guardó el cambio. Revisa tu conexión e inténtalo de nuevo.',
    'notifications.linkMissingTitle': 'Enlace no disponible',
    'notifications.linkMissingBody':
      'El evento vinculado ya no es accesible o ya no existe.',
    'messaging.loading': 'Cargando conversaciones...',
    'messaging.loadingMessages': 'Cargando mensajes...',
    'messaging.loadingMore': 'Cargando...',
    'messaging.loadMoreThreads': 'Cargar más conversaciones',
    'messaging.loadOlderMessages': 'Cargar mensajes anteriores',
    'messaging.title': 'Mensajes',
    'messaging.subtitle':
      'Encuentra los intercambios vinculados a tus horarios, solicitudes y reservas.',
    'messaging.listTitle': 'Conversaciones de planificación',
    'messaging.emptyTitle': 'Sin conversaciones',
    'messaging.emptyBody':
      'Las conversaciones aparecerán cuando exista una solicitud o reserva.',
    'messaging.read': 'Leído',
    'messaging.unread': 'Sin leer',
    'messaging.unknownStudent': 'Alumno',
    'messaging.noMessages': 'No hay mensajes en esta conversación.',
    'messaging.responseLabel': 'Tu respuesta',
    'messaging.responsePlaceholder':
      'Responde sobre este horario o esta reserva.',
    'messaging.sendAction': 'Enviar',
    'messaging.sending': 'Enviando...',
    'messaging.backAction': 'Volver a conversaciones',
    'messaging.openContextAction': 'Ver en planificación',
    'messaging.linkedContextTitle': 'Evento vinculado',
    'messaging.linkedContextBody':
      'La reserva de {{student}} está resaltada en la planificación.',
    'messaging.coachAuthor': 'Coach',
    'messaging.studentAuthor': 'Alumno',
    'messaging.selectThreadTitle': 'Selecciona una conversación',
    'messaging.selectThreadBody':
      'Abre una conversación para consultar su contexto y responder.',
    'messaging.loadErrorTitle': 'Mensajes no disponibles',
    'messaging.loadErrorBody':
      'No se pueden cargar tus conversaciones en este momento.',
    'messaging.saveErrorTitle': 'Acción no disponible',
    'messaging.saveErrorBody':
      'La respuesta o el estado de lectura no se guardó. Inténtalo de nuevo.',
    'messaging.invalidMessageTitle': 'Mensaje no válido',
    'messaging.invalidMessageBody':
      'Introduce un mensaje no vacío de 1.000 caracteres como máximo.',
    'messaging.contextUnavailableTitle': 'Evento no disponible',
    'messaging.contextUnavailableBody':
      'El horario o la reserva vinculada ya no es accesible.',
    'messaging.accessDeniedTitle': 'Acceso denegado',
    'messaging.accessDeniedBody':
      'La mensajería de planificación está reservada al coach.',
    'planning.loading': 'Cargando planificación...',
    'planning.refreshing': 'Actualizando horarios...',
    'planning.coachTitle': 'Planificación del coach',
    'planning.coachBody':
      'Consulta tus horarios y clases, pasados o próximos, en vista semanal o diaria.',
    'planning.display.agenda': 'Agenda',
    'planning.display.list': 'Lista',
    'planning.mode.week': 'Semana',
    'planning.mode.day': 'Día',
    'planning.filtersLabel': 'Filtrar el horario',
    'planning.availabilityFilter': 'Disponibilidad',
    'planning.confirmedLessonsFilter': 'Clases confirmadas',
    'planning.previousAction': 'Anterior',
    'planning.todayAction': 'Hoy',
    'planning.nextAction': 'Siguiente',
    'planning.nowLabel': 'Ahora',
    'planning.weekRange': '{{start}} - {{end}}',
    'planning.loadErrorTitle': 'Planificación no disponible',
    'planning.loadErrorBody':
      'No se pueden cargar tus horarios para este periodo.',
    'planning.emptyDayTitle': 'Sin horarios',
    'planning.emptyDayBody': 'No hay disponibilidad visible en este día.',
    'planning.slotTime': '{{start}}-{{end}}',
    'planning.slotMeta': '{{duration}} · {{location}}',
    'profile.title': 'Mi perfil',
    'profile.subtitle':
      'Indica la información que necesita tu coach para organizar tus próximas clases.',
    'profile.loading': 'Cargando tu perfil...',
    'profile.fullNameLabel': 'Nombre completo',
    'profile.fullNamePlaceholder': 'Tu nombre y apellidos',
    'profile.phoneLabel': 'Teléfono',
    'profile.phonePlaceholder': '+34 612 345 678',
    'profile.emailLabel': 'Email de contacto',
    'profile.ageLabel': 'Edad',
    'profile.agePlaceholder': 'Ej. 29',
    'profile.levelLabel': 'Nivel de pádel',
    'profile.sexLabel': 'Sexo',
    'profile.sex.female': 'Mujer',
    'profile.sex.male': 'Hombre',
    'profile.sex.other': 'Otro',
    'profile.sex.notSpecified': 'Prefiero no responder',
    'profile.languageLabel': 'Idioma preferido',
    'profile.language.fr': 'Francés',
    'profile.language.en': 'Inglés',
    'profile.language.es': 'Español',
    'profile.themeTitle': 'Apariencia',
    'profile.themeBody':
      'El modo Predeterminado sigue automáticamente la preferencia de tu navegador o dispositivo.',
    'profile.themeLabel': 'Tema de la aplicación',
    'profile.theme.system': 'Predeterminado (preferencia del navegador)',
    'profile.theme.light': 'Claro',
    'profile.theme.dark': 'Oscuro',
    'profile.saveAction': 'Guardar mi perfil',
    'profile.saving': 'Guardando...',
    'profile.saveSuccessTitle': 'Perfil guardado',
    'profile.saveSuccessBody':
      'Tu información está actualizada y seguirá disponible la próxima vez que inicies sesión.',
    'profile.saveErrorTitle': 'No se puede guardar',
    'profile.saveErrorBody':
      'Tu información no se ha modificado. Comprueba tu conexión e inténtalo de nuevo.',
    'profile.loadErrorTitle': 'Perfil no disponible',
    'profile.loadErrorBody':
      'No se puede cargar tu perfil en este momento. Inténtalo después de reiniciar la aplicación.',
    'profile.validation.nameTooShort':
      'Introduce un nombre de al menos 2 caracteres.',
    'profile.validation.nameTooLong':
      'El nombre no puede superar los 100 caracteres.',
    'profile.validation.invalidPhone':
      'Introduce un número de teléfono válido.',
    'profile.validation.invalidNumber': 'Introduce un número válido.',
    'profile.validation.invalidLevel': 'Elige un nivel entre 1 y 10.',
    'profile.validation.invalidAge': 'Introduce una edad entre 5 y 100 años.',
    'coachProfile.loading': 'Cargando tu perfil de coach...',
    'coachProfile.title': 'Mi perfil de coach',
    'coachProfile.subtitle':
      'Presenta tu forma de acompañar y los datos de contacto útiles antes de una solicitud.',
    'coachProfile.displayNameLabel': 'Nombre visible',
    'coachProfile.displayNamePlaceholder': 'Tu nombre o nombre profesional',
    'coachProfile.bioLabel': 'Presentación',
    'coachProfile.bioPlaceholder':
      'Describe brevemente tu enfoque, tu experiencia y los jugadores que acompañas.',
    'coachProfile.validation.bioTooShort':
      'La presentación debe contener al menos 20 caracteres.',
    'coachProfile.validation.bioTooLong':
      'La presentación no puede superar los 500 caracteres.',
    'coachProfile.loadErrorTitle': 'Perfil no disponible',
    'coachProfile.loadErrorBody':
      'No se puede cargar tu perfil de coach. Reinicia la aplicación e inténtalo de nuevo.',
    'coachProfile.saveSuccessTitle': 'Perfil de coach guardado',
    'coachProfile.saveSuccessBody':
      'La nueva información ya está visible en los espacios público y alumno.',
    'coachProfile.saveErrorTitle': 'No se puede guardar',
    'coachProfile.saveErrorBody':
      'El perfil no se ha modificado. Comprueba tu conexión e inténtalo de nuevo.',
    'coachProfile.saveAction': 'Guardar el perfil de coach',
    'coachProfile.availabilityTitle': 'Disponibilidad',
    'coachProfile.availabilityBody':
      'Define los horarios que se podrán proponer a los alumnos.',
    'coachProfile.openAvailability': 'Gestionar disponibilidad',
    'coachProfile.pricingTitle': 'Tarifas',
    'coachProfile.pricingBody':
      'Configura las tarifas individuales, dúo y colectivas mostradas antes de reservar.',
    'coachProfile.openPricing': 'Gestionar tarifas',
    'coachProfile.notificationsTitle': 'Notificaciones push',
    'coachProfile.notificationsBody':
      'Elige las alertas que recibes para solicitudes y cambios de clase.',
    'coachProfile.comingSoon': 'Próximamente',
    'studentHome.title': 'Tu espacio de reserva',
    'studentHome.subtitle':
      'Consulta el perfil de tu coach antes de preparar una solicitud de clase.',
    'studentAgenda.loading': 'Cargando agenda...',
    'studentAgenda.title': 'Agenda del alumno',
    'studentAgenda.body':
      'Los horarios visibles están disponibles y se pueden solicitar a tu coach.',
    'studentAgenda.loadErrorTitle': 'Agenda no disponible',
    'studentAgenda.loadErrorBody':
      'No se pueden cargar los horarios ni los participantes disponibles en este momento.',
    'studentAgenda.retryAction': 'Reintentar',
    'studentAgenda.emptyDayTitle': 'Sin horarios solicitables',
    'studentAgenda.emptyDayBody': 'No hay horarios disponibles en este día.',
    'studentAgenda.slotDetail': '{{date}} · {{duration}} · {{location}}',
    'studentAgenda.requestableStatus': 'Solicitable',
    'studentAgenda.calendarTitle': 'Elige un día',
    'studentAgenda.calendarBody':
      'Los días destacados tienen al menos una franja disponible.',
    'studentAgenda.previousMonthAction': 'Ver el mes anterior',
    'studentAgenda.nextMonthAction': 'Ver el mes siguiente',
    'studentAgenda.currentMonthAction': 'Volver a este mes',
    'studentAgenda.availableLegend': 'Día con disponibilidad',
    'studentAgenda.availableDayLabel':
      '{{date}}, una franja disponible',
    'studentAgenda.availableDayLabelPlural':
      '{{date}}, {{count}} franjas disponibles',
    'studentAgenda.selectedDateTitle': 'Disponibilidad del {{date}}',
    'studentAgenda.availableRangeCount':
      'Una franja disponible para reservar',
    'studentAgenda.availableRangeCountPlural':
      '{{count}} franjas disponibles para reservar',
    'studentAgenda.selectRangeLabel':
      'Elegir una hora entre {{start}} y {{end}}, {{location}}',
    'studentAgenda.chooseTimeAction': 'Elegir una hora',
    'studentAgenda.emptyMonthTitle': 'Sin disponibilidad este mes',
    'studentAgenda.emptyMonthBody':
      'Pasa al mes siguiente para ver las próximas disponibilidades.',
    'pricing.loading': 'Cargando tarifas...',
    'pricing.loadErrorTitle': 'Tarifas no disponibles',
    'pricing.loadErrorBody':
      'No se pueden cargar las tarifas en este momento. Reinicia la aplicación e inténtalo de nuevo.',
    'pricing.publishedTitle': 'Tarifas del coach',
    'pricing.publishedBody':
      'Los precios se muestran como información antes de solicitar una clase.',
    'pricing.emptyPublishedTitle': 'Tarifas próximamente',
    'pricing.emptyPublishedBody':
      'El coach aún no ha publicado ninguna tarifa activa.',
    'pricing.manageTitle': 'Gestión de tarifas',
    'pricing.manageBody':
      'Crea las tarifas individuales, dúo y colectivas mostradas antes de una solicitud.',
    'pricing.createTitle': 'Nueva tarifa',
    'pricing.editTitle': 'Modificar tarifa',
    'pricing.catalogTitle': 'Catálogo del coach',
    'pricing.labelLabel': 'Nombre',
    'pricing.labelPlaceholder': 'Ej. Clase individual estándar',
    'pricing.amountLabel': 'Precio en euros',
    'pricing.amountPlaceholder': 'Ej. 45,00',
    'pricing.typeLabel': 'Tipo de clase',
    'pricing.type.individual': 'Individual',
    'pricing.type.duo': 'Dúo',
    'pricing.type.group': 'Colectiva',
    'pricing.durationLabel': 'Duración',
    'pricing.duration.60': '1 hora',
    'pricing.duration.90': '1 h 30',
    'pricing.statusLabel': 'Publicación',
    'pricing.contextLabel': 'Criterios de aplicación',
    'pricing.noContext': 'Sin criterios específicos',
    'pricing.context.student': 'Tarifa estudiante',
    'pricing.context.senior': 'Tarifa senior',
    'pricing.context.weekend': 'Fin de semana',
    'pricing.context.public_holiday': 'Día festivo',
    'pricing.studentsLabel': 'Alumnos seleccionados',
    'pricing.studentSearchLabel': 'Buscar por nombre',
    'pricing.studentSearchPlaceholder': 'Nombre del alumno',
    'pricing.studentSearchHint':
      'Escribe un nombre para encontrar un alumno.',
    'pricing.studentSearchEmpty': 'Ningún alumno coincide con esta búsqueda.',
    'pricing.selectedStudentsLabel': 'Alumnos seleccionados ({{count}})',
    'pricing.selectStudentAction': 'Seleccionar',
    'pricing.selectedStudentAction': 'Seleccionado',
    'pricing.removeStudentAction': 'Quitar a {{name}} de la selección',
    'pricing.noStudentsBody':
      'No hay alumnos asociados disponibles para una selección específica.',
    'pricing.createAction': 'Crear tarifa',
    'pricing.updateAction': 'Guardar cambios',
    'pricing.saving': 'Guardando...',
    'pricing.cancelAction': 'Cancelar',
    'pricing.editAction': 'Modificar',
    'pricing.deleteAction': 'Eliminar',
    'pricing.confirmDeleteAction': 'Confirmar eliminación',
    'pricing.deleteTitle': '¿Eliminar esta tarifa?',
    'pricing.deleteBody':
      'Ya no se propondrá para nuevas solicitudes. Las futuras referencias históricas se conservarán.',
    'pricing.saveSuccessTitle': 'Tarifa guardada',
    'pricing.saveSuccessBody':
      'El catálogo y los espacios alumno ya utilizan la versión actualizada.',
    'pricing.saveErrorTitle': 'No se puede guardar',
    'pricing.saveErrorBody':
      'La tarifa no se ha modificado. Revisa la información e inténtalo de nuevo.',
    'pricing.emptyCoachTitle': 'Sin tarifas',
    'pricing.emptyCoachBody':
      'Crea una primera tarifa individual, dúo o colectiva.',
    'pricing.validation.labelTooShort':
      'El nombre debe contener al menos 2 caracteres.',
    'pricing.validation.labelTooLong':
      'El nombre no puede superar los 100 caracteres.',
    'pricing.validation.invalidAmount':
      'Introduce un precio positivo con dos decimales como máximo.',
    'pricing.validation.invalidStudent':
      'Uno de los alumnos seleccionados no es válido.',
    'availability.loading': 'Cargando disponibilidades...',
    'availability.manageTitle': 'Gestión de disponibilidad',
    'availability.manageBody':
      'Crea franjas continuas con hora de inicio, hora de fin, lugar y recurrencia.',
    'availability.createTitle': 'Nueva franja',
    'availability.dateLabel': 'Fecha',
    'availability.datePlaceholder': 'AAAA-MM-DD',
    'availability.startsAtLabel': 'Hora de inicio',
    'availability.endsAtLabel': 'Hora de fin',
    'availability.timePlaceholder': 'HH:MM',
    'availability.durationLabel': 'Duración del horario',
    'availability.duration.60': '1 hora',
    'availability.duration.90': '1 h 30',
    'availability.continuousRange': 'Franja disponible',
    'availability.locationLabel': 'Lugar',
    'availability.recurrenceLabel': 'Recurrencia',
    'availability.recurrence.none': 'Puntual',
    'availability.recurrence.daily': 'Diaria',
    'availability.recurrence.weekly': 'Semanal',
    'availability.recurrenceEndsOnLabel': 'Generar hasta',
    'availability.recurrenceUntil': 'Generada hasta {{date}}',
    'availability.previewTitle': 'Vista previa de la franja',
    'availability.previewEmpty':
      'Completa una franja coherente para mostrar la vista previa.',
    'availability.previewSlot': '{{start}}–{{end}} · {{location}}',
    'availability.createAction': 'Crear disponibilidad',
    'availability.editAction': 'Modificar',
    'availability.updateAction': 'Guardar',
    'availability.deleteAction': 'Eliminar',
    'availability.cancelAction': 'Cancelar',
    'availability.saving': 'Guardando...',
    'availability.saveSuccessTitle': 'Disponibilidad creada',
    'availability.saveSuccessBody':
      'La franja continua está guardada con sus horas y su lugar.',
    'availability.updateSuccessTitle': 'Horario modificado',
    'availability.updateSuccessBody':
      'La disponibilidad seleccionada se actualizó sin conflicto.',
    'availability.deleteSuccessTitle': 'Horario eliminado',
    'availability.deleteSuccessBody':
      'El horario ya no aparece como disponible.',
    'availability.saveErrorTitle': 'No se puede crear',
    'availability.saveErrorBody':
      'No se ha creado ninguna disponibilidad. Revisa la información e inténtalo de nuevo.',
    'availability.updateErrorTitle': 'No se puede modificar',
    'availability.updateErrorBody':
      'No se ha modificado la disponibilidad. Revisa la fecha y los horarios e inténtalo de nuevo.',
    'availability.conflictTitle': 'Franja en conflicto',
    'availability.conflictBody':
      'Esta franja se solapa con una disponibilidad existente. Ajusta los horarios.',
    'availability.blockedTitle': 'Modificación no disponible',
    'availability.blockedBody':
      'Este horario ya tiene una solicitud activa o una reserva confirmada.',
    'availability.forbiddenTitle': 'Acceso denegado',
    'availability.forbiddenBody':
      'Solo una cuenta de coach puede crear disponibilidad.',
    'availability.loadErrorTitle': 'Disponibilidades no disponibles',
    'availability.loadErrorBody':
      'No se pueden cargar tus disponibilidades en este momento.',
    'availability.listTitle': 'Franjas guardadas',
    'availability.emptyTitle': 'Sin disponibilidad',
    'availability.emptyBody':
      'Crea una primera franja para preparar horarios reservables.',
    'availability.emptyPeriodTitle': 'No hay disponibilidad en este período',
    'availability.emptyPeriodBody':
      'Usa los botones de navegación para consultar otro período.',
    'availability.rangeTime': '{{start}}–{{end}}',
    'availability.rangeMeta': '{{location}}',
    'availability.generatedSlotsTitle': 'Ocurrencias disponibles',
    'availability.generatedSlot': '{{date}}–{{end}} · {{location}}',
    'availability.slotStatus.available': 'Disponible',
    'availability.slotStatus.booked': 'Reservado',
    'availability.slotStatus.cancelled': 'Cancelado',
    'availability.scopeDialogTitle': 'Aplicar el cambio',
    'availability.scopeDeleteDialogTitle': 'Aplicar la eliminación',
    'availability.scopeDialogBody':
      'Elige si la acción afecta solo a esta ocurrencia o a toda la serie recurrente.',
    'availability.scopeOccurrenceAction': 'Esta ocurrencia',
    'availability.scopeSeriesAction': 'Toda la serie',
    'availability.validation.invalidDate':
      'Introduce una fecha con formato AAAA-MM-DD.',
    'availability.validation.invalidTime':
      'Introduce una hora con formato HH:MM.',
    'availability.validation.endBeforeStart':
      'La hora de fin debe ser posterior a la hora de inicio.',
    'availability.validation.rangeTooShort':
      'La franja debe contener al menos un horario completo.',
    'availability.validation.recurrenceEndRequired':
      'Introduce un horizonte de generación.',
    'availability.validation.recurrenceEndBeforeStart':
      'El horizonte debe ser el día de inicio o posterior.',
    'students.loading': 'Cargando alumnos...',
    'students.title': 'Alumnos',
    'students.subtitle':
      'Encuentra únicamente los alumnos asociados actualmente a tu espacio de coach.',
    'students.createAction': 'Crear ficha de alumno',
    'students.createTitle': 'Nueva ficha de alumno',
    'students.createBody':
      'Añade un alumno y prepara su cuenta sin activar. El acceso se completará con un enlace válido durante 24 horas.',
    'students.optionalPhoneLabel': 'Teléfono (opcional)',
    'students.optionalEmailLabel': 'Email (opcional)',
    'students.optionalAgeLabel': 'Edad (opcional)',
    'students.noContact': 'No se han indicado datos de contacto',
    'students.createSubmitAction': 'Crear ficha',
    'students.createCancelAction': 'Cancelar',
    'students.creating': 'Creando...',
    'students.createSuccessTitle': 'Ficha de alumno creada',
    'students.createSuccessBody':
      '{{name}} ya está asociado a tu espacio de coach.',
    'students.createErrorTitle': 'No se puede crear',
    'students.createErrorBody':
      'No se ha creado ninguna ficha. Revisa la información e inténtalo de nuevo.',
    'students.createDuplicateTitle': 'El alumno ya existe',
    'students.createDuplicateBody':
      'Un alumno ya utiliza este email o teléfono. Abre la ficha existente.',
    'students.loadErrorTitle': 'Lista no disponible',
    'students.loadErrorBody':
      'No se pueden cargar los alumnos en este momento. Reinicia la aplicación e inténtalo de nuevo.',
    'students.searchLabel': 'Buscar por nombre o email',
    'students.searchPlaceholder': 'Nombre o email del alumno',
    'students.incompleteProfile': 'Perfil incompleto',
    'students.levelFilterLabel': 'Nivel de pádel',
    'students.allLevels': 'Todos los niveles',
    'students.sexFilterLabel': 'Sexo del alumno',
    'students.allSexes': 'Todos',
    'students.ageRangeSliderLabel': 'Rango de edad',
    'students.ageMin': 'Mínimo: {{age}} años',
    'students.ageMax': 'Máximo: {{age}} años',
    'students.ageFilterLabel': 'Franja de edad',
    'students.allAges': 'Todas las edades',
    'students.ageRange': '{{min}}–{{max}} años',
    'students.ageSingle': '{{age}} años',
    'students.resetFilters': 'Restablecer filtros',
    'students.resultsTitle': 'Resultados',
    'students.resultCount': '{{count}} alumno(s)',
    'students.pageStatus': 'Página {{current}} de {{total}}',
    'students.previousPage': 'Página anterior',
    'students.nextPage': 'Página siguiente',
    'students.levelValue': 'Nivel {{level}}',
    'students.ageValue': '{{age}} años',
    'students.emptyListTitle': 'Sin alumnos asociados',
    'students.emptyListBody':
      'Los alumnos aparecerán aquí después de asociarse a tu espacio.',
    'students.emptyFilterTitle': 'Sin resultados',
    'students.emptyFilterBody':
      'Ningún alumno coincide con esta búsqueda y estos filtros.',
    'studentDetail.loading': 'Cargando la ficha del alumno...',
    'studentDetail.eyebrow': 'Ficha del alumno',
    'studentDetail.backAction': 'Volver a alumnos',
    'studentDetail.notFoundTitle': 'Ficha no disponible',
    'studentDetail.notFoundBody':
      'Esta ficha no existe o el alumno no está asociado a tu espacio de coach.',
    'studentDetail.loadErrorTitle': 'Ficha no disponible',
    'studentDetail.loadErrorBody':
      'No se puede cargar esta ficha en este momento.',
    'studentDetail.profileTitle': 'Información del alumno',
    'studentDetail.incompleteProfileBody':
      'Este alumno aún no ha completado su perfil. Su email sigue disponible para contactarlo.',
    'studentDetail.historyTitle': 'Historial',
    'studentDetail.historyCount': '{{count}} elemento(s)',
    'studentDetail.historyFilter.label': 'Filtrar por estado',
    'studentDetail.historyFilter.all': 'Todos',
    'studentDetail.historyFilter.cancelled': 'Cancelado',
    'studentDetail.historyFilter.confirmed': 'Confirmado',
    'studentDetail.historyFilter.refused': 'Rechazado',
    'studentDetail.historyFilterEmptyTitle': 'Sin resultados',
    'studentDetail.historyFilterEmptyBody':
      'Ningún evento coincide con este filtro.',
    'studentDetail.historyEmptyTitle': 'Sin historial',
    'studentDetail.historyEmptyBody':
      'Las solicitudes, clases, cancelaciones, cambios y packs aparecerán aquí.',
    'studentDetail.historyLoading': 'Cargando el historial...',
    'studentDetail.historyLoadingMore': 'Cargando eventos anteriores...',
    'studentDetail.historyLoadMoreAction': 'Reintentar la carga',
    'studentDetail.historyLoadErrorTitle': 'Historial no disponible',
    'studentDetail.historyLoadErrorBody':
      'No se puede cargar el historial de este alumno en este momento.',
    'studentDetail.historyType.bookingRequested': 'Solicitud de clase',
    'studentDetail.historyType.lessonConfirmed': 'Clase confirmada',
    'studentDetail.historyType.bookingCancelled': 'Cancelación',
    'studentDetail.historyType.bookingModified': 'Modificación',
    'studentDetail.historyType.lessonPackAssigned': 'Pack asignado',
    'studentDetail.historyType.lessonPackConsumed': 'Sesión de pack consumida',
    'studentDetail.historyType.lessonPackAdjusted': 'Crédito de pack añadido',
    'studentDetail.activationGenerateAction': 'Generar enlace de activación',
    'studentDetail.activationRegenerateAction': 'Regenerar enlace',
    'studentDetail.activationGenerating': 'Generando...',
    'studentDetail.activationReadyTitle': 'Enlace de activación listo',
    'studentDetail.activationExpiresAt': 'Caduca el {{date}}.',
    'studentDetail.activationCopyAction': 'Copiar enlace',
    'studentDetail.activationShareAction': 'Compartir enlace',
    'studentDetail.activationShareMessage':
      'Activa tu cuenta Equation Padel con este enlace válido durante 24 horas: {{link}}',
    'studentDetail.activationCopiedTitle': 'Enlace copiado',
    'studentDetail.activationCopiedBody': 'Ya puedes enviárselo al alumno.',
    'studentDetail.activationNoEmailTitle': 'No se ha indicado ningún email',
    'studentDetail.activationNoEmailBody':
      'El enlace sigue disponible: cópialo o compártelo manualmente. No se puede enviar por email desde esta ficha.',
    'studentDetail.activationErrorTitle': 'Enlace no disponible',
    'studentDetail.activationErrorBody':
      'No se ha podido generar o compartir el enlace. Revisa el estado de la cuenta e inténtalo de nuevo.',
    'studentDetail.deleteTitle': 'Eliminar esta ficha de alumno',
    'studentDetail.deleteBody':
      'Esta acción solo está disponible antes de activar la cuenta. Elimina definitivamente la cuenta provisional y todos sus datos asociados.',
    'studentDetail.deleteAction': 'Eliminar alumno',
    'studentDetail.deleteConfirmTitle': 'Confirmar la eliminación',
    'studentDetail.deleteConfirmBody':
      '¿Quieres eliminar definitivamente la ficha de {{name}}?',
    'studentDetail.deleteConfirmAction': 'Eliminar definitivamente',
    'studentDetail.deleteCancelAction': 'Cancelar',
    'studentDetail.deleting': 'Eliminando...',
    'studentDetail.deleteErrorTitle': 'No se puede eliminar',
    'studentDetail.deleteErrorBody':
      'La ficha no se ha eliminado. Es posible que la cuenta ya esté activada o que ya no esté asociada a tu espacio.',
    'studentPrivateNote.loading': 'Cargando la nota privada...',
    'studentPrivateNote.title': 'Nota privada del coach',
    'studentPrivateNote.privateHint':
      'Visible únicamente en tu espacio de coach.',
    'studentPrivateNote.addAction': 'Añadir una nota',
    'studentPrivateNote.editAction': 'Modificar',
    'studentPrivateNote.fieldLabel': 'Nota privada',
    'studentPrivateNote.placeholder':
      'Añade un recordatorio útil para preparar las próximas clases.',
    'studentPrivateNote.characterCount': '{{count}} / 2000 caracteres',
    'studentPrivateNote.saveAction': 'Guardar',
    'studentPrivateNote.saving': 'Guardando...',
    'studentPrivateNote.cancelAction': 'Cancelar',
    'studentPrivateNote.emptyBody':
      'Todavía no se ha guardado ninguna nota privada.',
    'studentPrivateNote.validationRequired':
      'Introduce una nota antes de guardar.',
    'studentPrivateNote.validationTooLong':
      'La nota no puede superar los 2000 caracteres.',
    'studentPrivateNote.loadErrorTitle': 'Nota no disponible',
    'studentPrivateNote.loadErrorBody':
      'No se puede cargar la nota privada en este momento.',
    'studentPrivateNote.saveSuccessTitle': 'Nota guardada',
    'studentPrivateNote.saveSuccessBody':
      'La nota privada está actualizada en tu espacio de coach.',
    'studentPrivateNote.saveErrorTitle': 'No se puede guardar',
    'studentPrivateNote.saveErrorBody':
      'La nota existente no se ha modificado. Inténtalo de nuevo.',
    'lessonPack.loading': 'Cargando los packs...',
    'lessonPack.loadMoreAction': 'Reintentar la carga',
    'lessonPack.studentTitle': 'Mis packs de tickets',
    'lessonPack.readonlyHint':
      'Consulta tus créditos de clase. Solo tu coach puede modificarlos.',
    'lessonPack.studentEmptyBody':
      'Todavía no se te ha asignado ningún pack de tickets.',
    'lessonPack.title': 'Pack de clases individuales',
    'lessonPack.trackingOnlyHint':
      'Solo seguimiento de créditos, sin compra ni pago integrado.',
    'lessonPack.assignAction': 'Asignar un pack',
    'lessonPack.includedLabel': 'Número de clases incluidas',
    'lessonPack.includedPlaceholder': 'Ej. 10',
    'lessonPack.confirmAssignAction': 'Confirmar asignación',
    'lessonPack.assigning': 'Asignando...',
    'lessonPack.cancelAction': 'Cancelar',
    'lessonPack.individualTitle': 'Pack individual',
    'lessonPack.includedMetric': 'Incluidas',
    'lessonPack.usedMetric': 'Usadas',
    'lessonPack.remainingMetric': 'Restantes',
    'lessonPack.emptyBody':
      'Todavía no hay ningún pack individual asociado a este alumno.',
    'lessonPack.validationInvalidCount':
      'Introduce un número entero entre 1 y 100.',
    'lessonPack.saveSuccessTitle': 'Pack asignado',
    'lessonPack.saveSuccessBody':
      'Los créditos de clases ya se siguen en esta ficha.',
    'lessonPack.activeExistsTitle': 'Ya existe un pack activo',
    'lessonPack.activeExistsBody':
      'Finaliza el pack activo antes de asignar uno nuevo.',
    'lessonPack.saveErrorTitle': 'No se puede asignar',
    'lessonPack.saveErrorBody':
      'No se ha creado ningún pack. Revisa la relación con el alumno e inténtalo de nuevo.',
    'lessonPack.loadErrorTitle': 'Packs no disponibles',
    'lessonPack.loadErrorBody':
      'No se pueden cargar los créditos de clases en este momento.',
    'lessonPack.consumeAction': 'Marcar una sesión consumida',
    'lessonPack.consuming': 'Consumiendo...',
    'lessonPack.consumeSuccessTitle': 'Sesión consumida',
    'lessonPack.consumeSuccessBody':
      'Los contadores del pack están actualizados y el historial del alumno se ha completado.',
    'lessonPack.decrementAccessibilityLabel': 'Quitar una clase restante',
    'lessonPack.incrementAccessibilityLabel': 'Añadir una clase restante',
    'lessonPack.adjusting': 'Actualizando el pack...',
    'lessonPack.increaseSuccessTitle': 'Clase añadida',
    'lessonPack.increaseSuccessBody':
      'El pack ahora tiene una clase restante adicional.',
    'lessonPack.decreaseSuccessTitle': 'Clase retirada',
    'lessonPack.decreaseSuccessBody':
      'El total del pack se corrigió sin modificar el número de clases usadas.',
    'lessonPack.noRemainingTitle': 'Pack agotado',
    'lessonPack.noRemainingBody':
      'No se puede consumir ninguna sesión: este pack no tiene clases restantes.',
    'lessonPack.consumeErrorTitle': 'No se puede consumir',
    'lessonPack.consumeErrorBody':
      'No se ha modificado ninguna clase restante. Puede que el pack esté agotado o que el acceso esté denegado.',
    'lessonPack.maximumTitle': 'Máximo alcanzado',
    'lessonPack.maximumBody':
      'Un pack no puede contener más de 100 clases incluidas.',
    'lessonPack.minimumTitle': 'Mínimo alcanzado',
    'lessonPack.minimumBody':
      'Un pack debe conservar al menos una clase incluida.',
    'lessonPack.adjustErrorTitle': 'No se puede modificar',
    'lessonPack.adjustErrorBody':
      'El contador no se ha modificado. Recarga la ficha e inténtalo de nuevo.',
    'booking.openRequestAction': 'Solicitar',
    'booking.requestAction': 'Enviar solicitud',
    'booking.startTimeLabel': 'Hora de inicio',
    'booking.startTimePlaceholder': 'HH:mm',
    'booking.invalidStartTime':
      'Introduce una hora en cuartos, por ejemplo 11:00 u 11:15.',
    'booking.durationLabel': 'Duración de la clase',
    'booking.proposedTime': 'Horario propuesto: {{start}}–{{end}}',
    'booking.noDurationFitTitle': 'Sin horario adecuado',
    'booking.noDurationFitBody':
      'Esta duración no cabe en ninguna parte libre de la franja.',
    'booking.lessonTypeLabel': 'Tipo de clase',
    'booking.commentLabel': 'Comentario',
    'booking.commentPlaceholder': 'Añade tu objetivo o disponibilidad.',
    'booking.participantsLabel': 'Participantes',
    'booking.duoParticipantRequired':
      'Selecciona exactamente una pareja para formar el dúo.',
    'booking.requesterIncluded': 'Tú estás incluido',
    'booking.unknownStudent': 'Alumno',
    'booking.priceLabel': 'Tarifa: {{price}}',
    'booking.studentPageTitle': 'Solicitudes y clases',
    'booking.studentPageBody':
      'Consulta el estado de tus solicitudes y clases, incluso después de una cancelación.',
    'booking.studentListTitle': 'Tus solicitudes y clases',
    'booking.studentListBody':
      'Aquí no se muestran horarios disponibles. Las nuevas solicitudes se hacen desde el inicio.',
    'booking.studentEmptyTitle': 'Sin solicitudes',
    'booking.studentEmptyBody':
      'Tus solicitudes enviadas y el historial de tus clases aparecerán aquí.',
    'booking.coachListTitle': 'Solicitudes y clases',
    'booking.coachEmptyTitle': 'Sin solicitudes pendientes',
    'booking.coachEmptyBody':
      'Las solicitudes de alumnos y clases planificadas aparecerán aquí.',
    'booking.coachCreateTitle': 'Crear una clase',
    'booking.createPricingRequiredTitle': 'Tarifa obligatoria',
    'booking.createPricingRequiredBody':
      'Añade o activa una tarifa compatible con este alumno, tipo de clase y duración.',
    'booking.studentLabel': 'Alumno',
    'booking.recurrenceEndsOnLabel': 'Recurrencia semanal hasta',
    'booking.recurrenceEndsOnPlaceholder': 'AAAA-MM-DD, opcional',
    'booking.createAction': 'Crear clase',
    'booking.creating': 'Creando clase...',
    'booking.createSuccessButton': 'Clase creada ✓',
    'booking.createAnotherAction': 'Crear otra clase',
    'booking.approveAction': 'Validar',
    'booking.refuseAction': 'Rechazar',
    'booking.refusalCommentLabel': 'Comentario de rechazo',
    'booking.refusalCommentPlaceholder': 'Mensaje opcional para el alumno',
    'booking.cancelAction': 'Cancelar solicitud o clase',
    'booking.cancelLessonAction': 'Cancelar la clase',
    'booking.cancellationTitle': 'Cancelar solicitud o clase',
    'booking.cancellationBody':
      'Explica por qué cancelas. Este mensaje se enviará al coach.',
    'booking.cancellationMessageLabel': 'Mensaje al coach',
    'booking.cancellationMessagePlaceholder':
      'Indica el motivo de la cancelación.',
    'booking.cancellationMessageCount': '{{count}} / {{max}} caracteres',
    'booking.cancellationMessageRequired':
      'Es obligatorio enviar un mensaje al coach.',
    'booking.cancellationMessageTooLong':
      'El mensaje no puede superar los 500 caracteres.',
    'booking.cancellationConfirmAction': 'Confirmar cancelación',
    'booking.cancellationSubmitting': 'Cancelando...',
    'booking.cancellationCloseAction': 'Cerrar ventana de cancelación',
    'booking.modifyAction': 'Modificar',
    'booking.expiresAt': 'Caduca el {{date}}',
    'booking.participantNames': 'Participantes: {{names}}',
    'booking.inlineRequest': '{{student}} · {{status}}',
    'booking.requestSuccessTitle': 'Solicitud enviada',
    'booking.requestSuccessBody':
      'El coach puede validar o rechazar la solicitud.',
    'booking.approveSuccessTitle': 'Solicitud validada',
    'booking.approveSuccessBody':
      'La clase queda confirmada y el horario ya no se puede solicitar.',
    'booking.refuseSuccessTitle': 'Solicitud rechazada',
    'booking.refuseSuccessBody':
      'El estado y el comentario son visibles para el alumno.',
    'booking.createSuccessTitle': 'Clase creada',
    'booking.createSuccessBody':
      'La clase confirmada es visible en los calendarios.',
    'booking.cancelSuccessTitle': 'Reserva cancelada',
    'booking.cancelSuccessBody':
      'El estado se actualizó y el horario se libera cuando corresponde.',
    'booking.studentCancelSuccessTitle': 'Reserva cancelada',
    'booking.studentCancelSuccessBody':
      'El estado se actualizó y tu mensaje se envió al coach.',
    'booking.modifySuccessTitle': 'Reserva modificada',
    'booking.modifySuccessBody':
      'La nueva fecha o duración es visible en los calendarios.',
    'booking.errorTitle': 'Acción no disponible',
    'booking.slotUnavailable':
      'Este horario ya no está disponible. Prueba con otro.',
    'booking.pendingLimit':
      'Este horario ya alcanzó el límite de solicitudes pendientes.',
    'booking.studentPendingLimit':
      'Ya tienes 10 solicitudes pendientes con el coach.',
    'booking.studentScheduleConflict':
      'Ya tienes una solicitud o clase que se solapa con este horario.',
    'booking.alreadyProcessed': 'Esta solicitud ya ha sido tratada.',
    'booking.pastBooking':
      'Este horario ya ha pasado y no se puede solicitar ni cancelar.',
    'booking.invalidParticipants':
      'La selección de participantes no está permitida.',
    'booking.invalidInput':
      'Comprueba el formato y los valores de los campos antes de volver a intentarlo.',
    'booking.pricingMissing':
      'No hay una tarifa activa para este tipo y duración de clase.',
    'booking.unauthorized': 'Tu rol no permite esta acción.',
    'booking.unknownError': 'Revisa tu conexión e inténtalo de nuevo.',
    'auth.signInTitle': 'Vuelve a tu espacio.',
    'auth.signInSubtitle':
      'Inicia sesión con tu email y contraseña para acceder a Equation Padel.',
    'auth.signUpTitle': 'Crea tu cuenta.',
    'auth.signUpSubtitle':
      'Regístrate para preparar tu perfil y acceder a los recorridos de Equation Padel.',
    'auth.emailLabel': 'Email',
    'auth.emailPlaceholder': 'tu@ejemplo.es',
    'auth.passwordLabel': 'Contraseña',
    'auth.passwordPlaceholder': 'Tu contraseña',
    'auth.passwordCreatePlaceholder': '12 caracteres, mayúscula, minúscula y número',
    'auth.passwordShowAction': 'Mostrar contraseña',
    'auth.passwordHideAction': 'Ocultar contraseña',
    'auth.confirmPasswordLabel': 'Confirmar contraseña',
    'auth.confirmPasswordPlaceholder': 'Repite tu contraseña',
    'auth.signInAction': 'Iniciar sesión',
    'auth.signingIn': 'Iniciando sesión...',
    'auth.signUpAction': 'Crear mi cuenta',
    'auth.signingUp': 'Creando la cuenta...',
    'auth.goToSignUp': 'Crear una cuenta',
    'auth.goToSignIn': 'Ya tengo una cuenta',
    'auth.forgotPasswordAction': 'He olvidado mi contraseña',
    'auth.forgotPasswordTitle': 'Restablece tu contraseña.',
    'auth.forgotPasswordSubtitle':
      'Introduce tu email para recibir un enlace seguro de restablecimiento.',
    'auth.resetPasswordTitle': 'Elige una nueva contraseña.',
    'auth.resetPasswordSubtitle':
      'Utiliza el enlace recibido por email para proteger de nuevo tu cuenta.',
    'auth.passwordResetEmailSentTitle': 'Revisa tu email',
    'auth.passwordResetEmailSentBody':
      'Si existe una cuenta con esta dirección, acabamos de enviar un enlace de restablecimiento.',
    'auth.passwordResetSending': 'Enviando...',
    'auth.passwordResetSendAction': 'Enviar el enlace',
    'auth.passwordResetLinkLoadingTitle': 'Comprobando el enlace',
    'auth.passwordResetLinkLoadingBody':
      'Estamos comprobando tu enlace de restablecimiento.',
    'auth.passwordResetInvalidTitle': 'Enlace no válido o caducado',
    'auth.passwordResetInvalidBody':
      'Solicita un nuevo enlace de restablecimiento para continuar.',
    'auth.passwordResetRequestAnotherAction': 'Solicitar un nuevo enlace',
    'auth.passwordResetCompleteTitle': 'Contraseña modificada',
    'auth.passwordResetCompleteBody':
      'Tu nueva contraseña está guardada. Ya puedes iniciar sesión.',
    'auth.newPasswordLabel': 'Nueva contraseña',
    'auth.confirmNewPasswordLabel': 'Confirmar nueva contraseña',
    'auth.passwordResetUpdating': 'Modificando...',
    'auth.passwordResetUpdateAction': 'Cambiar mi contraseña',
    'auth.confirmationTitle': 'Revisa tu email',
    'auth.confirmationMessage':
      'Tu cuenta ha sido creada. Abre el mensaje recibido para confirmar tu dirección antes de iniciar sesión.',
    'activation.title': 'Activa tu cuenta de alumno',
    'activation.subtitle':
      'Define tu contraseña para acceder al espacio preparado por tu coach.',
    'activation.emailLabel': 'Email de acceso (si es necesario)',
    'activation.emailHint':
      'Introduce tu email si tu coach no lo indicó. En caso contrario, deja este campo vacío.',
    'activation.passwordLabel': 'Nueva contraseña',
    'activation.confirmPasswordLabel': 'Confirmar nueva contraseña',
    'activation.submitAction': 'Activar mi cuenta',
    'activation.activating': 'Activando...',
    'activation.successTitle': 'Cuenta activada',
    'activation.successBody':
      'Tu contraseña está guardada. Ya puedes iniciar sesión.',
    'activation.redirectingBody':
      'Tu contraseña está guardada. Se te redirigirá a tu espacio de alumno.',
    'activation.signingIn': 'Iniciando sesión en tu espacio...',
    'activation.autoSignInErrorTitle':
      'No se puede iniciar sesión automáticamente',
    'activation.autoSignInErrorBody':
      'Tu cuenta está activada. Inicia sesión ahora con tu email y tu nueva contraseña.',
    'activation.signInAction': 'Iniciar sesión',
    'activation.invalidTitle': 'Enlace no válido',
    'activation.invalidBody':
      'Este enlace ha caducado, ya se utilizó o fue reemplazado. Pide uno nuevo a tu coach.',
    'activation.emailRequiredTitle': 'Email necesario para iniciar sesión',
    'activation.emailRequiredBody':
      'Tu ficha todavía no contiene ningún email. Introduce tu dirección para activar la cuenta.',
    'activation.emailInUseTitle': 'Email ya utilizado',
    'activation.emailInUseBody':
      'Esta dirección pertenece a otra cuenta. Utiliza otra o contacta con tu coach.',
    'activation.errorTitle': 'No se puede activar',
    'activation.errorBody':
      'La cuenta no se ha activado. Comprueba tu conexión e inténtalo de nuevo.',
    'auth.validation.required': 'Este campo es obligatorio.',
    'auth.validation.invalidEmail': 'Introduce una dirección de email válida.',
    'auth.validation.passwordTooShort':
      'La contraseña debe tener al menos 12 caracteres.',
    'auth.validation.passwordTooWeak':
      'Añade al menos una mayúscula, una minúscula y un número.',
    'auth.validation.passwordMismatch': 'Las contraseñas no coinciden.',
    'auth.validation.invalid': 'Revisa el valor introducido.',
    'auth.error.title': 'No se puede continuar',
    'auth.error.configuration':
      'Supabase no está configurado. Añade las variables públicas de Expo previstas.',
    'auth.error.invalidCredentials': 'Email o contraseña incorrectos.',
    'auth.error.emailInUse':
      'Ya existe una cuenta con este email. Si tu coach la creó, utiliza el enlace de activación.',
    'auth.error.weakPassword': 'Elige una contraseña más segura.',
    'auth.error.emailNotConfirmed':
      'Confirma tu dirección de email antes de iniciar sesión.',
    'auth.error.rateLimited':
      'Demasiados intentos. Inténtalo de nuevo en unos minutos.',
    'auth.error.network':
      'Comprueba tu conexión a internet e inténtalo de nuevo.',
    'auth.error.generic': 'Se ha producido un error. Inténtalo más tarde.',
    'auth.sessionTitle': 'Sesión activa',
    'auth.sessionDescription': 'Has iniciado sesión como {{email}}.',
    'auth.signOutAction': 'Cerrar sesión',
    'auth.signingOut': 'Cerrando sesión...',
    'home.eyebrow': 'Base mobile-first',
    'home.title': 'Reservar, validar y seguir clases de pádel sin fricción.',
    'home.subtitle':
      'Una base UI premium, cálida y traducible para recorridos de coach y alumno.',
    'home.primaryAction': 'Pedir un horario',
    'home.secondaryAction': 'Ver bases',
    'home.previewTitle': 'Vista previa P0',
    'home.previewDescription':
      'Las próximas pantallas reutilizarán estas primitivas para solicitudes, disponibilidad y perfiles.',
    'home.metricRequests': 'Solicitudes pendientes',
    'home.metricStudents': 'Alumnos activos',
    'home.metricSlots': 'Horarios esta semana',
    'home.formLabel': 'Buscar alumno u horario',
    'home.formPlaceholder': 'Nombre, fecha o nota del coach',
    'home.feedbackTitle': 'Base lista para historias de producto',
    'home.feedbackMessage':
      'Los textos visibles usan i18n y los colores vienen de los tokens Equation Padel.',
    'foundation.eyebrow': 'Sistema de diseño P0',
    'foundation.title': 'Tokens, temas y primitivas reutilizables.',
    'foundation.subtitle':
      'La paleta tierra batida, ocre y verde profundo existe en tema claro y oscuro.',
    'foundation.tokensTitle': 'Tokens activos',
    'foundation.themeTitle': 'Tema',
    'foundation.i18nTitle': 'Internacionalización',
    'foundation.i18nBody':
      'Francés, inglés y español están disponibles con el mismo helper.',
    'foundation.primitiveTitle': 'Primitivas UI',
    'foundation.primitiveBody':
      'Botones, campos, tarjetas, estados y feedback comparten los tokens del tema actual.',
    'foundation.token.primary': 'Primario',
    'foundation.token.secondary': 'Secundario',
    'foundation.token.background': 'Fondo',
    'foundation.token.surface': 'Superficie',
    'foundation.token.darkBackground': 'Fondo oscuro',
    'foundation.token.darkSurface': 'Superficie oscura',
    'status.pending': 'Pendiente',
    'status.pendingActivation': 'Pendiente de activación',
    'status.active': 'Activo',
    'status.inactive': 'Inactivo',
    'status.confirmed': 'Confirmado',
    'status.refused': 'Rechazado',
    'status.expired': 'Caducado',
    'status.cancelled': 'Cancelado',
    'status.modified': 'Modificado',
    'status.exhausted': 'Agotado',
    'status.suspended': 'Suspendido',
    'status.deleted': 'Eliminado',
    'theme.light': 'Claro',
    'theme.dark': 'Oscuro',
  },
} as const;

export type TranslationKey = keyof typeof dictionaries.fr;
