import type { SupportedLocale } from '@/i18n';

import {
  legalConfiguration,
  privacyPolicyVersion,
  productName,
  termsVersion,
} from './legal-config';

export type LegalPageId =
  | 'privacy'
  | 'terms'
  | 'legal'
  | 'support'
  | 'data-rights';

export type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalPageCopy = {
  title: string;
  subtitle: string;
  versionLabel?: string;
  sections: LegalSection[];
};

export type LegalUiCopy = {
  home: string;
  privacy: string;
  terms: string;
  legal: string;
  support: string;
  dataRights: string;
  deleteAccount: string;
  configurationWarningTitle: string;
  configurationWarningBody: string;
  accountToolsTitle: string;
  accountToolsBody: string;
  openDataRights: string;
  openDeleteAccount: string;
  supportEmailAction: string;
  privacyEmailAction: string;
};

const controllerDescription = `${legalConfiguration.publisherName}, ${legalConfiguration.legalForm}, ${legalConfiguration.registration}, ${legalConfiguration.postalAddress}.`;

const uiByLocale: Record<SupportedLocale, LegalUiCopy> = {
  fr: {
    home: 'Accueil',
    privacy: 'Confidentialité',
    terms: 'CGU',
    legal: 'Mentions légales',
    support: 'Support',
    dataRights: 'Vos données',
    deleteAccount: 'Supprimer mon compte',
    configurationWarningTitle: 'Informations éditeur à finaliser',
    configurationWarningBody:
      'Certaines coordonnées légales utilisent encore des valeurs de développement. Configurez les variables EXPO_PUBLIC_LEGAL_* et EXPO_PUBLIC_*_EMAIL avant la mise en production.',
    accountToolsTitle: 'Confidentialité et données',
    accountToolsBody:
      'Consultez vos droits, exportez vos données, demandez une rectification ou supprimez définitivement votre compte.',
    openDataRights: 'Gérer mes données',
    openDeleteAccount: 'Supprimer mon compte',
    supportEmailAction: 'Écrire au support',
    privacyEmailAction: 'Contacter le référent confidentialité',
  },
  en: {
    home: 'Home',
    privacy: 'Privacy',
    terms: 'Terms',
    legal: 'Legal notice',
    support: 'Support',
    dataRights: 'Your data',
    deleteAccount: 'Delete my account',
    configurationWarningTitle: 'Publisher information must be completed',
    configurationWarningBody:
      'Some legal contact details still use development values. Configure the EXPO_PUBLIC_LEGAL_* and EXPO_PUBLIC_*_EMAIL variables before production.',
    accountToolsTitle: 'Privacy and data',
    accountToolsBody:
      'Review your rights, export your data, request a correction, or permanently delete your account.',
    openDataRights: 'Manage my data',
    openDeleteAccount: 'Delete my account',
    supportEmailAction: 'Email support',
    privacyEmailAction: 'Contact privacy',
  },
  es: {
    home: 'Inicio',
    privacy: 'Privacidad',
    terms: 'Condiciones',
    legal: 'Aviso legal',
    support: 'Soporte',
    dataRights: 'Tus datos',
    deleteAccount: 'Eliminar mi cuenta',
    configurationWarningTitle: 'Falta completar la información del editor',
    configurationWarningBody:
      'Algunos datos legales siguen usando valores de desarrollo. Configura las variables EXPO_PUBLIC_LEGAL_* y EXPO_PUBLIC_*_EMAIL antes de producción.',
    accountToolsTitle: 'Privacidad y datos',
    accountToolsBody:
      'Consulta tus derechos, exporta tus datos, solicita una rectificación o elimina definitivamente tu cuenta.',
    openDataRights: 'Gestionar mis datos',
    openDeleteAccount: 'Eliminar mi cuenta',
    supportEmailAction: 'Escribir a soporte',
    privacyEmailAction: 'Contactar con privacidad',
  },
};

function frenchPages(): Record<LegalPageId, LegalPageCopy> {
  return {
    privacy: {
      title: 'Politique de confidentialité',
      subtitle:
        `Cette politique explique comment ${productName} traite vos données personnelles.`,
      versionLabel: `Version du ${privacyPolicyVersion}`,
      sections: [
        {
          title: 'Responsable du traitement',
          paragraphs: [
            controllerDescription,
            `Contact confidentialité : ${legalConfiguration.privacyEmail}.`,
          ],
        },
        {
          title: 'Données traitées',
          bullets: [
            'Compte et authentification : adresse email, identifiant utilisateur, dates de création et de connexion.',
            'Profil : nom, téléphone, email de contact, langue, âge facultatif, sexe facultatif, niveau de padel et biographie du coach.',
            'Service : relations coach-élève, disponibilités, réservations, participants, tarifs appliqués, forfaits et historique des cours.',
            'Contenus : commentaires de réservation, motifs de refus ou d’annulation, messages et notes privées du coach.',
            'Notifications : préférences, identifiant d’installation, jeton push, état et erreurs de livraison.',
            'Sécurité : journaux techniques nécessaires au fonctionnement, à la prévention des abus et au diagnostic.',
          ],
        },
        {
          title: 'Finalités et bases légales',
          bullets: [
            'Exécuter les CGU et fournir le compte, le planning, les réservations et la messagerie.',
            'Gérer les notifications choisies par l’utilisateur et mémoriser ses préférences.',
            'Sécuriser le service et prévenir les abus sur la base de l’intérêt légitime de l’éditeur.',
            'Répondre aux demandes d’exercice des droits et respecter les obligations légales.',
          ],
        },
        {
          title: 'Destinataires et sous-traitants',
          paragraphs: [
            'Les données sont accessibles aux utilisateurs autorisés selon leur rôle. Elles sont traitées par Supabase pour l’authentification et la base de données, Expo pour les services applicatifs et notifications, OVHcloud pour l’hébergement web, ainsi que par Apple ou Google pour la distribution et la remise des notifications.',
            'Aucune donnée n’est vendue et aucune publicité ciblée n’est réalisée.',
          ],
        },
        {
          title: 'Durées de conservation',
          bullets: [
            'Compte et profil : vie du compte, puis suppression dans un délai cible de 30 jours après une demande vérifiée.',
            'Disponibilités et tarifs opérationnels : 12 mois après leur fin ou désactivation.',
            'Réservations, forfaits et historique nécessaires à la preuve du service : jusqu’à 5 ans en archivage intermédiaire.',
            'Messages et commentaires liés aux réservations : jusqu’à 5 ans. Notes privées du coach : durée de la relation puis 12 mois, sauf nécessité liée à un litige.',
            'Notifications : 6 mois. Jetons push inactifs : 90 jours. Jetons d’activation expirés : 7 jours.',
            'Journaux techniques : 6 mois, jusqu’à 12 mois lorsque la sécurité le justifie. Sauvegardes : durée du cycle documenté par le prestataire, visée à 30 jours.',
          ],
        },
        {
          title: 'Transferts internationaux',
          paragraphs: [
            'Certains prestataires peuvent traiter des données hors de l’Espace économique européen. L’éditeur sélectionne les régions européennes lorsque disponibles et encadre les autres transferts par les mécanismes reconnus par le RGPD, notamment les clauses contractuelles types.',
          ],
        },
        {
          title: 'Vos droits',
          paragraphs: [
            `Vous pouvez demander l’accès, la rectification, l’effacement, la limitation, l’opposition et, lorsque les conditions sont réunies, la portabilité de vos données en écrivant à ${legalConfiguration.privacyEmail}. Une réponse est apportée en principe sous un mois. Vous pouvez également saisir la CNIL sur cnil.fr.`,
          ],
        },
        {
          title: 'Suppression et export',
          paragraphs: [
            'Les écrans « Vos données » et « Supprimer mon compte » permettent respectivement d’exporter les données fournies et de supprimer le compte. Les éléments dont la conservation reste légalement nécessaire sont isolés, limités et rendus indisponibles pour l’usage courant.',
          ],
        },
        {
          title: 'Mineurs',
          paragraphs: [
            'Pour un utilisateur de moins de 15 ans, l’intervention du titulaire de l’autorité parentale est requise lorsque le traitement repose sur le consentement. Les informations doivent être lues avec le représentant légal et les données facultatives peuvent être laissées vides.',
          ],
        },
        {
          title: 'Sécurité et stockage local',
          paragraphs: [
            'Les échanges utilisent HTTPS/TLS, les accès à la base sont limités par rôle et les secrets de session sont protégés sur l’appareil. La version web utilise uniquement les stockages indispensables à la session, à la sécurité et aux préférences ; aucun traceur publicitaire n’est installé.',
          ],
        },
      ],
    },
    terms: {
      title: 'Conditions générales d’utilisation',
      subtitle: `Règles d’utilisation du service ${productName}.`,
      versionLabel: `Version du ${termsVersion}`,
      sections: [
        {
          title: 'Éditeur et objet',
          paragraphs: [
            `${productName} est édité par ${controllerDescription}`,
            'Le service facilite la gestion des disponibilités d’un coach de padel, les demandes de cours, leur suivi, les forfaits, les notifications et les échanges liés au planning.',
          ],
        },
        {
          title: 'Création et sécurité du compte',
          bullets: [
            'L’utilisateur fournit des informations exactes et les maintient à jour.',
            'Le compte est personnel. Le mot de passe ne doit jamais être communiqué.',
            'Toute utilisation suspecte doit être signalée immédiatement au support.',
            'L’inscription ou l’activation vaut acceptation des présentes CGU et de la politique de confidentialité dans leur version indiquée.',
          ],
        },
        {
          title: 'Mineurs',
          paragraphs: [
            'Le représentant légal doit accompagner l’utilisation du service par un mineur et accepter les conditions lorsque cela est nécessaire. L’éditeur peut demander une vérification proportionnée ou suspendre un compte qui ne respecte pas ces règles.',
          ],
        },
        {
          title: 'Réservations et disponibilités',
          paragraphs: [
            'Une demande n’est confirmée qu’après validation du coach. Les horaires, lieux, participants, modifications, refus et annulations affichés dans l’application font foi pour l’organisation du cours. L’utilisateur doit prévenir dans les meilleurs délais en cas d’empêchement.',
          ],
        },
        {
          title: 'Tarifs et paiements',
          paragraphs: [
            'Les tarifs affichés sont ceux configurés par le coach pour la prestation concernée. La version actuelle de l’application ne collecte aucune carte bancaire et ne traite aucun paiement. Les modalités de règlement du cours sont convenues directement avec le coach.',
          ],
        },
        {
          title: 'Comportement et contenus',
          bullets: [
            'Les contenus doivent rester licites, respectueux et directement liés à l’organisation des cours.',
            'Il est interdit d’usurper une identité, de perturber le service, de tenter d’accéder aux données d’un tiers ou de transmettre un contenu dangereux.',
            'L’utilisateur reste responsable des textes qu’il saisit. Les contenus manifestement illicites ou abusifs peuvent être retirés et le compte suspendu.',
          ],
        },
        {
          title: 'Disponibilité et responsabilité',
          paragraphs: [
            'L’éditeur met en œuvre des moyens raisonnables pour maintenir le service sécurisé et disponible, sans garantir une disponibilité ininterrompue. Chaque utilisateur reste responsable de vérifier les informations importantes avec le coach. Les limitations prévues par les présentes ne s’appliquent pas lorsqu’elles sont interdites par la loi.',
          ],
        },
        {
          title: 'Suspension et fin du compte',
          paragraphs: [
            'Un compte peut être suspendu en cas de risque de sécurité, de fraude ou de violation grave des CGU. L’utilisateur peut demander sa suppression à tout moment depuis l’application ou la page web dédiée. Une simple désactivation ne remplace pas la suppression demandée.',
          ],
        },
        {
          title: 'Propriété intellectuelle',
          paragraphs: [
            `Le nom, l’interface, les textes, logiciels et éléments graphiques de ${productName} sont protégés. Aucun droit n’est transféré en dehors de l’autorisation personnelle d’utiliser le service conformément aux CGU.`,
          ],
        },
        {
          title: 'Évolution, droit applicable et contact',
          paragraphs: [
            `Les CGU peuvent évoluer ; la nouvelle version et sa date seront publiées avant son entrée en vigueur lorsqu’une nouvelle acceptation est nécessaire. Le droit français s’applique, sous réserve des règles impératives protégeant le consommateur. Contact : ${legalConfiguration.supportEmail}.`,
          ],
        },
      ],
    },
    legal: {
      title: 'Mentions légales',
      subtitle: `Informations relatives à l’édition de ${productName}.`,
      sections: [
        {
          title: 'Éditeur',
          paragraphs: [controllerDescription],
        },
        {
          title: 'Direction de la publication',
          paragraphs: [legalConfiguration.publicationDirector],
        },
        {
          title: 'Hébergement',
          paragraphs: [
            `${legalConfiguration.hostingName}, ${legalConfiguration.hostingAddress}.`,
            'Les services de données et d’authentification sont fournis par Supabase selon la région configurée par l’éditeur.',
          ],
        },
        {
          title: 'Contacts',
          bullets: [
            `Support : ${legalConfiguration.supportEmail}`,
            `Données personnelles : ${legalConfiguration.privacyEmail}`,
          ],
        },
        {
          title: 'Propriété intellectuelle',
          paragraphs: [
            'Toute reproduction ou réutilisation non autorisée des éléments du service est interdite, sous réserve des exceptions prévues par la loi.',
          ],
        },
      ],
    },
    support: {
      title: 'Support',
      subtitle: 'Une question sur le compte, le planning ou vos données ?',
      sections: [
        {
          title: 'Assistance générale',
          paragraphs: [
            `Écrivez à ${legalConfiguration.supportEmail} en indiquant l’adresse email du compte, la plateforme utilisée et une description précise du problème. Ne transmettez jamais votre mot de passe ni un jeton d’activation.`,
          ],
        },
        {
          title: 'Vie privée',
          paragraphs: [
            `Pour une demande d’accès, d’export, de rectification, d’opposition ou de suppression, utilisez ${legalConfiguration.privacyEmail} ou les outils de la page « Vos données ».`,
          ],
        },
        {
          title: 'Sécurité',
          paragraphs: [
            'En cas de suspicion d’accès non autorisé, changez immédiatement votre mot de passe et contactez le support avec l’objet « Sécurité du compte ».',
          ],
        },
      ],
    },
    'data-rights': {
      title: 'Vos données et vos droits',
      subtitle: 'Accéder, exporter, corriger ou supprimer vos données.',
      sections: [
        {
          title: 'Accès et export',
          paragraphs: [
            'Une fois connecté, vous pouvez télécharger un fichier JSON contenant les données de compte et les données que vous avez fournies ou générées dans le service. Pour une demande d’accès plus large, notamment lorsqu’elle nécessite de protéger les droits d’un tiers, contactez le référent confidentialité.',
          ],
        },
        {
          title: 'Rectification',
          paragraphs: [
            'Les informations courantes peuvent être corrigées dans le profil. Pour modifier une donnée historique ou l’adresse d’authentification, adressez une demande en précisant la donnée concernée et la correction attendue.',
          ],
        },
        {
          title: 'Suppression',
          paragraphs: [
            'La page « Supprimer mon compte » permet une suppression définitive après réauthentification. Elle efface le compte, les profils, réservations, messages, notes, jetons et autres données associées, sauf conservation strictement nécessaire et annoncée dans la politique de confidentialité.',
          ],
        },
        {
          title: 'Traitement d’une demande',
          bullets: [
            `Envoyez la demande depuis l’adresse du compte à ${legalConfiguration.privacyEmail}.`,
            'Décrivez précisément le droit exercé et les données concernées.',
            'Une vérification d’identité proportionnée peut être demandée en cas de doute raisonnable.',
            'Une réponse est apportée en principe sous un mois ; une prolongation motivée peut être annoncée dans ce délai pour une demande complexe.',
          ],
        },
        {
          title: 'Réclamation',
          paragraphs: [
            'Si la réponse ne vous satisfait pas, vous pouvez saisir la Commission nationale de l’informatique et des libertés (CNIL) sur cnil.fr.',
          ],
        },
      ],
    },
  };
}

function englishPages(): Record<LegalPageId, LegalPageCopy> {
  const pages = frenchPages();
  return {
    ...pages,
    privacy: {
      title: 'Privacy policy',
      subtitle: `How ${productName} processes your personal data.`,
      versionLabel: `Version dated ${privacyPolicyVersion}`,
      sections: [
        { title: 'Controller', paragraphs: [controllerDescription, `Privacy contact: ${legalConfiguration.privacyEmail}.`] },
        { title: 'Data processed', bullets: ['Account and authentication data.', 'Profile and contact details, language, optional age and sex, padel level and coach biography.', 'Coach-student relationships, availability, bookings, participants, prices, lesson packs and lesson history.', 'Booking comments, cancellation reasons, messages and private coach notes.', 'Push preferences, installation identifiers, tokens and delivery diagnostics.', 'Technical and security logs.'] },
        { title: 'Purposes and legal bases', bullets: ['Perform the Terms and provide account, booking, planning and messaging features.', 'Deliver notifications selected by the user.', 'Secure the service and prevent abuse based on the publisher’s legitimate interests.', 'Answer data-rights requests and comply with legal obligations.'] },
        { title: 'Recipients and processors', paragraphs: ['Authorised users receive only the data permitted by their role. Supabase provides authentication and database services, Expo provides application and push services, OVHcloud hosts the website, and Apple or Google distribute the app and notifications.', 'Data is not sold and is not used for targeted advertising.'] },
        { title: 'Retention', bullets: ['Account and profile: account lifetime, then a target of 30 days after a verified deletion request.', 'Availability and operational prices: 12 months after expiry or deactivation.', 'Bookings, packs and evidence of the service: up to 5 years in restricted archives.', 'Booking messages and comments: up to 5 years. Private coach notes: relationship duration plus 12 months unless required for a dispute.', 'Notifications: 6 months; inactive push tokens: 90 days; expired activation tokens: 7 days.', 'Technical logs: 6 months, up to 12 months when justified by security; backups follow the provider’s documented cycle, targeted at 30 days.'] },
        { title: 'International transfers', paragraphs: ['Some processors may handle data outside the EEA. European regions are selected where available and other transfers are covered by GDPR-recognised safeguards, including standard contractual clauses.'] },
        { title: 'Your rights', paragraphs: [`You may request access, correction, deletion, restriction, objection and, where applicable, portability by emailing ${legalConfiguration.privacyEmail}. We normally answer within one month. You may also complain to the French CNIL at cnil.fr.`] },
        { title: 'Deletion and export', paragraphs: ['The “Your data” and “Delete my account” screens provide an export and a permanent deletion process. Any data that must legally remain is isolated and unavailable for normal use.'] },
        { title: 'Children', paragraphs: ['For users under 15, a parent or guardian must be involved when processing relies on consent. Optional data may be left blank.'] },
        { title: 'Security and local storage', paragraphs: ['Traffic uses HTTPS/TLS, database access is role-limited and session secrets are protected on the device. The web app uses only storage required for sessions, security and preferences, with no advertising tracker.'] },
      ],
    },
    terms: {
      title: 'Terms of use',
      subtitle: `Rules for using ${productName}.`,
      versionLabel: `Version dated ${termsVersion}`,
      sections: [
        { title: 'Publisher and service', paragraphs: [`${productName} is published by ${controllerDescription}`, 'The service manages coach availability, lesson requests, bookings, lesson packs, notifications and planning-related messages.'] },
        { title: 'Account', bullets: ['Provide accurate and current information.', 'Keep the personal account and password secure.', 'Report suspected misuse immediately.', 'Registration or activation records acceptance of these Terms and the privacy policy.'] },
        { title: 'Children', paragraphs: ['A parent or guardian must supervise a minor’s use and accept the terms where required.'] },
        { title: 'Bookings', paragraphs: ['A request is confirmed only after coach approval. Users must verify the displayed time, place and participants and report cancellations promptly.'] },
        { title: 'Prices and payments', paragraphs: ['Prices are configured by the coach. The current app does not collect card details or process payments; payment arrangements are made directly with the coach.'] },
        { title: 'Conduct and content', bullets: ['Content must be lawful, respectful and related to lessons.', 'Identity theft, unauthorised access, disruption and harmful content are prohibited.', 'Abusive or unlawful content may be removed and accounts may be suspended.'] },
        { title: 'Availability and liability', paragraphs: ['The publisher uses reasonable measures to keep the service secure and available but cannot guarantee uninterrupted availability. Statutory consumer protections remain unaffected.'] },
        { title: 'Suspension and termination', paragraphs: ['Accounts may be suspended for security, fraud or serious breaches. Users may permanently delete their account in the app or through the public deletion page.'] },
        { title: 'Intellectual property', paragraphs: [`The ${productName} name, interface, software and content are protected. The user receives only a personal right to use the service under these Terms.`] },
        { title: 'Changes, law and contact', paragraphs: [`Material changes are published with a new date and renewed acceptance where required. French law applies subject to mandatory consumer protections. Contact: ${legalConfiguration.supportEmail}.`] },
      ],
    },
    legal: { ...pages.legal, title: 'Legal notice', subtitle: `Publisher details for ${productName}.` },
    support: { ...pages.support, title: 'Support', subtitle: 'Questions about your account, planning or personal data?' },
    'data-rights': { ...pages['data-rights'], title: 'Your data and rights', subtitle: 'Access, export, correct or delete your data.' },
  };
}

function spanishPages(): Record<LegalPageId, LegalPageCopy> {
  const pages = englishPages();
  return {
    ...pages,
    privacy: { ...pages.privacy, title: 'Política de privacidad', subtitle: `Cómo trata ${productName} tus datos personales.`, versionLabel: `Versión de ${privacyPolicyVersion}` },
    terms: { ...pages.terms, title: 'Condiciones de uso', subtitle: `Reglas de uso de ${productName}.`, versionLabel: `Versión de ${termsVersion}` },
    legal: { ...pages.legal, title: 'Aviso legal', subtitle: `Información del editor de ${productName}.` },
    support: { ...pages.support, title: 'Soporte', subtitle: '¿Tienes una pregunta sobre tu cuenta, planificación o datos?' },
    'data-rights': { ...pages['data-rights'], title: 'Tus datos y derechos', subtitle: 'Acceder, exportar, corregir o eliminar tus datos.' },
  };
}

export function getLegalUiCopy(locale: SupportedLocale) {
  return uiByLocale[locale];
}

export function getLegalPageCopy(page: LegalPageId, locale: SupportedLocale) {
  if (locale === 'en') return englishPages()[page];
  if (locale === 'es') return spanishPages()[page];
  return frenchPages()[page];
}
