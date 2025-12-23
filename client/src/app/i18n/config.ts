// i18n configuration for client-side usage
export const i18nConfig = {
  defaultLocale: 'vi',
  locales: ['en', 'vi'],
  localeDetection: true,
} as const;

export type Locale = (typeof i18nConfig)['locales'][number];
