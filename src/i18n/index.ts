/**
 * i18n Module - VIVIM Internationalization
 * 
 * Complete i18n solution with:
 * - Type-safe translation keys with autocomplete
 * - RTL support for Arabic locale
 * - Locale-aware formatters (number, currency, date, etc.)
 * - Server and client component support
 * 
 * @example
 * ```tsx
 * // Client Component
 * import { useTypedTranslations, useFormatters } from '@/i18n';
 * 
 * export function MyComponent() {
 *   const t = useTypedTranslations('problem');
 *   const { number, currency } = useFormatters();
 *   
 *   return (
 *     <div>
 *       <h2>{t('sectionHeading')}</h2>
 *       <p>{currency(1234.56, 'USD')}</p>
 *     </div>
 *   );
 * }
 * 
 * // Server Component
 * import { createServerTranslations } from '@/i18n';
 * 
 * export default async function Page() {
 *   const t = await createServerTranslations('problem');
 *   return <h2>{t('sectionHeading')}</h2>;
 * }
 * ```
 */

// Re-export routing utilities
export { 
  routing, 
  RTL_LOCALES, 
  isRTL, 
  getDirection,
  LOCALE_METADATA 
} from './routing';

// Re-export type-safe translations
export { 
  useTypedTranslations, 
  createServerTranslations,
  validateTranslationKey,
  type TypedTranslations,
  type AllNamespaces,
  type CurrentMessages,
} from './useTypedTranslations';

// Re-export formatters
export { 
  useFormatters, 
  createFormatters,
  PRESET_FORMATS,
  type Formatters,
} from './formatters';

// Re-export types
export type {
  Namespace,
  TranslationKeys,
  AllTranslationKeys,
  TranslationValue,
  GetNamespace,
  GetKey,
  LocaleConfig,
  LocaleCode,
  MessageStructure,
  CriticalNamespace,
} from '@/types/i18n';

// Re-export locale utilities
export {
  LOCALES,
  isRTL as isLocaleRTL,
  getDirection as getLocaleDirection,
  FALLBACK_LOCALE,
  CRITICAL_NAMESPACES,
  isCriticalNamespace,
  validateMessageStructure,
} from '@/types/i18n';

/**
 * Get the HTML lang attribute value for a locale
 * Includes script and region codes where appropriate
 */
export function getHtmlLang(locale: string): string {
  const langMap: Record<string, string> = {
    en: 'en-US',
    es: 'es-ES',
    ar: 'ar-SA',
  };
  return langMap[locale] || locale;
}

/**
 * Get CSS direction value for a locale
 * Use this to set dir attribute on HTML element
 */
export function getDirAttribute(locale: string): 'ltr' | 'rtl' {
  return getDirection(locale);
}

/**
 * Supported locales with metadata
 */
export const SUPPORTED_LOCALES = [
  { code: 'en', name: 'English', flag: '🇺🇸', direction: 'ltr' as const },
  { code: 'es', name: 'Español', flag: '🇪🇸', direction: 'ltr' as const },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', direction: 'rtl' as const },
] as const;

/**
 * Check if a locale is supported
 */
export function isSupportedLocale(locale: string): locale is 'en' | 'es' | 'ar' {
  return SUPPORTED_LOCALES.some(l => l.code === locale);
}
