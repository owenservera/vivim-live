/**
 * i18n Translation Types for VIVIM
 * Provides type-safe access to all translation keys
 * 
 * Usage:
 * ```tsx
 * import { type TranslationKey } from '@/types/i18n';
 * import { useTranslations } from 'next-intl';
 * 
 * const t = useTranslations('problem');
 * const key: TranslationKey<'problem'> = 'cards.contextWipe.title';
 * ```
 */

// Import message files to extract types
import enMessages from '@/messages/en/index.json';

/**
 * Recursively extract all possible dot-notation keys from a nested object
 */
type ExtractKeys<T, Prefix extends string = ''> = T extends object
  ? {
      [K in keyof T]: T[K] extends object
        ? ExtractKeys<T[K], `${Prefix}${K & string}.`>
        : `${Prefix}${K & string}`;
    }[keyof T]
  : never;

/**
 * All available translation namespaces
 */
export type Namespace = keyof typeof enMessages;

/**
 * Type-safe translation keys for a specific namespace
 * 
 * @example
 * type ProblemKeys = TranslationKeys<'problem'>;
 * // "sectionBadge" | "sectionHeading" | "cards.contextWipe.title" | ...
 */
export type TranslationKeys<T extends Namespace> = ExtractKeys<(typeof enMessages)[T]>;

/**
 * Union of all possible translation keys across all namespaces
 * 
 * @example
 * const key: AllTranslationKeys = 'problem.cards.contextWipe.title';
 */
export type AllTranslationKeys = {
  [N in Namespace]: `${N}.${TranslationKeys<N>}`;
}[Namespace];

/**
 * Get the type of a translation value at a specific key path
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TranslationValue<
  N extends Namespace,
  K extends TranslationKeys<N>
> = K extends `${string}.${string}` ? string : string;

/**
 * Helper type to get namespace from a full key path
 */
export type GetNamespace<K extends AllTranslationKeys> = K extends `${infer N}.${string}`
  ? N extends Namespace
    ? N
    : never
  : never;

/**
 * Helper type to get the key within a namespace from a full key path
 */
export type GetKey<K extends AllTranslationKeys> = K extends `${string}.${infer Rest}`
  ? Rest
  : never;

/**
 * Formatters configuration type
 */
export interface Formatters {
  number: (value: number, options?: Intl.NumberFormatOptions) => string;
  currency: (value: number, currency?: string, options?: Intl.NumberFormatOptions) => string;
  percent: (value: number, options?: Intl.NumberFormatOptions) => string;
  date: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) => string;
  relativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit) => string;
  list: (items: string[], options?: Intl.ListFormatOptions) => string;
}

/**
 * Locale configuration type
 */
export interface LocaleConfig {
  code: string;
  name: string;
  direction: 'ltr' | 'rtl';
  flag: string;
}

/**
 * Available locales configuration
 */
export const LOCALES: Record<string, LocaleConfig> = {
  en: {
    code: 'en',
    name: 'English',
    direction: 'ltr',
    flag: '🇺🇸',
  },
  es: {
    code: 'es',
    name: 'Español',
    direction: 'ltr',
    flag: '🇪🇸',
  },
  ca: {
    code: 'ca',
    name: 'Català',
    direction: 'ltr',
    flag: '🏳️',
  },
  ar: {
    code: 'ar',
    name: 'العربية',
    direction: 'rtl',
    flag: '🇸🇦',
  },
} as const;

/**
 * Type for available locale codes
 */
export type LocaleCode = keyof typeof LOCALES;

/**
 * Check if a locale is RTL
 */
export function isRTL(locale: string): boolean {
  return LOCALES[locale as LocaleCode]?.direction === 'rtl';
}

/**
 * Get locale direction
 */
export function getDirection(locale: string): 'ltr' | 'rtl' {
  return LOCALES[locale as LocaleCode]?.direction ?? 'ltr';
}

/**
 * Message structure type for validation
 */
export type MessageStructure = typeof enMessages;

/**
 * Validate that a translation file matches the expected structure
 * This is a compile-time check helper
 */
export function validateMessageStructure(
  messages: unknown
): asserts messages is MessageStructure {
  if (process.env.NODE_ENV !== 'development') return;
  
  if (!messages || typeof messages !== 'object') {
    console.warn('[i18n] Messages must be an object');
    return;
  }

  const msg = messages as Record<string, unknown>;
  const expectedNamespaces = Object.keys(enMessages) as Namespace[];
  
  for (const ns of expectedNamespaces) {
    if (!(ns in msg)) {
      console.warn(`[i18n] Missing namespace: ${ns}`);
      continue;
    }
    
    if (!msg[ns] || typeof msg[ns] !== 'object') {
      console.warn(`[i18n] Namespace ${ns} must be an object`);
      continue;
    }
    
    // Recursively validate nested structure
    validateNestedKeys(ns, enMessages[ns] as Record<string, unknown>, msg[ns] as Record<string, unknown>);
  }
}

function validateNestedKeys(
  namespace: string,
  expected: Record<string, unknown>,
  actual: Record<string, unknown>,
  prefix = ''
): void {
  for (const key of Object.keys(expected)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    
    if (!(key in actual)) {
      console.warn(`[i18n] Missing key: ${namespace}.${fullKey}`);
      continue;
    }
    
    const expectedVal = expected[key];
    const actualVal = actual[key];
    
    if (typeof expectedVal === 'object' && expectedVal !== null && !Array.isArray(expectedVal)) {
      if (typeof actualVal !== 'object' || actualVal === null || Array.isArray(actualVal)) {
        console.warn(`[i18n] Key ${namespace}.${fullKey} should be an object`);
      } else {
        validateNestedKeys(namespace, expectedVal as Record<string, unknown>, actualVal as Record<string, unknown>, fullKey);
      }
    }
  }
}

/**
 * Fallback keys for missing translations
 * Used during development when a key exists in en but not in other locales
 */
export const FALLBACK_LOCALE = 'en' as const;

/**
 * Namespaces that are critical and must have 100% coverage
 */
export const CRITICAL_NAMESPACES = [
  'common',
  'hero',
  'problem',
  'solution',
  'chat',
  'components',
] as const;

/**
 * Type for critical namespace check
 */
export type CriticalNamespace = (typeof CRITICAL_NAMESPACES)[number];

/**
 * Check if a namespace is critical
 */
export function isCriticalNamespace(namespace: string): namespace is CriticalNamespace {
  return CRITICAL_NAMESPACES.includes(namespace as CriticalNamespace);
}
