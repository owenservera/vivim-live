import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  // Locales supported by the application
  locales: ['en', 'es', 'ar'],
  defaultLocale: 'en',
  
  // When a user visits the root URL, redirect to their preferred locale
  localePrefix: 'always',
  
  // Enable locale detection from Accept-Language header
  localeDetection: true,
});

/**
 * RTL locales that require right-to-left layout
 */
export const RTL_LOCALES = ['ar'] as const;

/**
 * Check if a locale requires RTL layout
 */
export function isRTL(locale: string): boolean {
  return RTL_LOCALES.includes(locale as typeof RTL_LOCALES[number]);
}

/**
 * Get the text direction for a locale
 */
export function getDirection(locale: string): 'ltr' | 'rtl' {
  return isRTL(locale) ? 'rtl' : 'ltr';
}

/**
 * Locale metadata for display purposes
 */
export const LOCALE_METADATA: Record<string, { name: string; flag: string }> = {
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  ar: { name: 'العربية', flag: '🇸🇦' },
};