export const appLanguages = ['fr', 'en', 'es'] as const;

export type AppLanguage = (typeof appLanguages)[number];
