export const productName = 'Equation Padel';
export const termsVersion = '2026-08-19';
export const privacyPolicyVersion = '2026-08-19';

function publicValue(value: string | undefined, fallback: string) {
  const normalized = value?.trim();
  return normalized && normalized !== 'replace_me' ? normalized : fallback;
}

export const legalConfiguration = {
  publisherName: publicValue(
    process.env.EXPO_PUBLIC_LEGAL_PUBLISHER_NAME,
    'Equation Padel — éditeur à renseigner'
  ),
  legalForm: publicValue(
    process.env.EXPO_PUBLIC_LEGAL_FORM,
    'Forme juridique à renseigner'
  ),
  registration: publicValue(
    process.env.EXPO_PUBLIC_LEGAL_REGISTRATION,
    'SIREN/RCS à renseigner'
  ),
  postalAddress: publicValue(
    process.env.EXPO_PUBLIC_LEGAL_ADDRESS,
    'Adresse du siège à renseigner'
  ),
  publicationDirector: publicValue(
    process.env.EXPO_PUBLIC_PUBLICATION_DIRECTOR,
    'Directeur de la publication à renseigner'
  ),
  supportEmail: publicValue(
    process.env.EXPO_PUBLIC_SUPPORT_EMAIL,
    'support@equation-padel.example'
  ),
  privacyEmail: publicValue(
    process.env.EXPO_PUBLIC_PRIVACY_EMAIL,
    'privacy@equation-padel.example'
  ),
  hostingName: publicValue(
    process.env.EXPO_PUBLIC_HOSTING_NAME,
    'OVHcloud'
  ),
  hostingAddress: publicValue(
    process.env.EXPO_PUBLIC_HOSTING_ADDRESS,
    '2 rue Kellermann, 59100 Roubaix, France'
  ),
};

const placeholderFragments = [
  'à renseigner',
  '.example',
];

export const missingLegalConfiguration = Object.entries(legalConfiguration)
  .filter(([, value]) =>
    placeholderFragments.some((fragment) => value.includes(fragment))
  )
  .map(([key]) => key);

export const isLegalConfigurationComplete =
  missingLegalConfiguration.length === 0;
