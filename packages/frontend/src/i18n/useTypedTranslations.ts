/**
 * Type-safe useTranslations wrapper
 * Provides autocomplete and type checking for translation keys
 * 
 * Usage:
 * ```tsx
 * import { useTypedTranslations } from '@/i18n/useTypedTranslations';
 * 
 * export function MyComponent() {
 *   const t = useTypedTranslations('problem');
 *   
 *   // Full autocomplete and type safety!
 *   return <h2>{t('sectionHeading')}</h2>;
 * }
 * ```
 */

import { useTranslations } from 'next-intl';
import type { Namespace, TranslationKeys } from '@/types/i18n';
import type enMessages from '@/messages/en/index.json';

/**
 * Type-safe translation function for a namespace
 */
export type TypedTranslations<T extends Namespace> = {
  /**
   * Get a translation by key
   * @param key - The translation key (with autocomplete)
   */
  (key: TranslationKeys<T>): string;
  
  /**
   * Get raw translation value (for arrays/objects)
   */
  raw: (key: TranslationKeys<T>) => unknown;
  
  /**
   * Get translation with rich text markup
   */
  rich: (key: TranslationKeys<T>) => React.ReactNode;
  
  /**
   * Check if a key exists
   */
  has: (key: TranslationKeys<T>) => boolean;
};

/**
 * Hook for type-safe translations with autocomplete
 * 
 * @param namespace - The translation namespace
 * @returns Type-safe translation function
 * 
 * @example
 * ```tsx
 * // Basic usage
 * const t = useTypedTranslations('problem');
 * return <h2>{t('sectionHeading')}</h2>;
 * 
 * // Nested keys
 * return <p>{t('cards.contextWipe.title')}</p>;
 * 
 * // Raw values (for arrays/objects)
 * const algorithms = t.raw('sentinel.algorithms') as string[];
 * 
 * // Rich text (with markup)
 * return <p>{t.rich('hero.description')}</p>;
 * ```
 */
export function useTypedTranslations<T extends Namespace>(
  namespace: T
): TypedTranslations<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = useTranslations(namespace) as any;
  
  return Object.assign(
    (key: TranslationKeys<T>): string => t(key),
    {
      raw: (key: TranslationKeys<T>) => t.raw(key),
      rich: (key: TranslationKeys<T>) => t.rich(key),
      has: (key: TranslationKeys<T>) => t.has(key),
    }
  ) as TypedTranslations<T>;
}

/**
 * Get all namespaces from the messages file
 */
export type AllNamespaces = Namespace;

/**
 * Helper to get the current locale's messages type
 */
export type CurrentMessages = typeof enMessages;

/**
 * Create a typed translation function for server components
 * 
 * Usage in server component:
 * ```tsx
 * import { getTranslations } from 'next-intl/server';
 * import { createServerTranslations } from '@/i18n/useTypedTranslations';
 * 
 * export default async function Page() {
 *   const t = await createServerTranslations('problem');
 *   return <h2>{t('sectionHeading')}</h2>;
 * }
 * ```
 */
export async function createServerTranslations<T extends Namespace>(
  namespace: T
): Promise<TypedTranslations<T>> {
  const { getTranslations } = await import('next-intl/server');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const t = await getTranslations(namespace) as any;
  
  return Object.assign(
    (key: TranslationKeys<T>): string => t(key),
    {
      raw: (key: TranslationKeys<T>) => t.raw(key),
      rich: (key: TranslationKeys<T>) => t.rich(key),
      has: (key: TranslationKeys<T>) => t.has(key),
    }
  ) as TypedTranslations<T>;
}

/**
 * Translation key validator for development
 * Logs warnings for missing translations in development mode
 */
export function validateTranslationKey(
  namespace: Namespace,
  key: string,
  locale: string
): void {
  if (process.env.NODE_ENV !== 'development') return;
  
  // Import is dynamic to avoid bundling the validation in production
  import('@/messages/en/index.json').then((en) => {
    const keys = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = en.default[namespace as keyof typeof en.default];
    
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        console.warn(
          `[i18n] Missing translation key: ${namespace}.${key} in locale ${locale}`
        );
        break;
      }
    }
  }).catch(() => {
    // Silently fail in case of import issues
  });
}
