/**
 * i18n Formatters
 * Locale-aware number, date, currency, and list formatting
 * 
 * Usage:
 * ```tsx
 * import { useFormatters } from '@/i18n/formatters';
 * 
 * const { number, currency, date } = useFormatters();
 * 
 * <p>{currency(1234.56, 'USD')}</p>  // $1,234.56
 * <p>{number(1234567.89)}</p>        // 1,234,567.89
 * <p>{date(new Date())}</p>          // Jan 1, 2026
 * ```
 */

import { useMemo } from 'react';
import { useLocale } from 'next-intl';
import type { Formatters } from '@/types/i18n';

export type { Formatters };

/**
 * Hook to get locale-aware formatters
 */
export function useFormatters(): Formatters {
  const locale = useLocale();

  return useMemo(() => {
    const numberFormat = new Intl.NumberFormat(locale);
    const currencyFormatCache = new Map<string, Intl.NumberFormat>();
    const percentFormat = new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 2,
    });
    const relativeTimeFormat = new Intl.RelativeTimeFormat(locale, {
      numeric: 'auto',
    });
    const listFormat = new Intl.ListFormat(locale);

    return {
      /**
       * Format a number with locale-aware thousand separators and decimals
       * 
       * @param value - The number to format
       * @param options - Optional Intl.NumberFormatOptions
       * @example
       * number(1234567.89) // "1,234,567.89" (en-US)
       * number(1234567.89, { maximumFractionDigits: 0 }) // "1,234,568"
       */
      number: (value: number, options?: Intl.NumberFormatOptions): string => {
        if (!options) {
          return numberFormat.format(value);
        }
        return new Intl.NumberFormat(locale, options).format(value);
      },

      /**
       * Format a currency value
       * 
       * @param value - The number to format as currency
       * @param currency - Currency code (default: 'USD')
       * @param options - Optional Intl.NumberFormatOptions
       * @example
       * currency(1234.56, 'USD') // "$1,234.56"
       * currency(1234.56, 'EUR') // "€1.234,56" (de-DE)
       * currency(1234.56, 'JPY') // "¥1,235"
       */
      currency: (
        value: number,
        currency: string = 'USD',
        options?: Intl.NumberFormatOptions
      ): string => {
        const cacheKey = `${currency}-${JSON.stringify(options || {})}`;
        let formatter = currencyFormatCache.get(cacheKey);
        
        if (!formatter) {
          formatter = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency,
            ...options,
          });
          currencyFormatCache.set(cacheKey, formatter);
        }
        
        return formatter.format(value);
      },

      /**
       * Format a percentage value
       * 
       * @param value - The decimal value (0.75 = 75%)
       * @param options - Optional Intl.NumberFormatOptions
       * @example
       * percent(0.75) // "75%"
       * percent(0.756, { minimumFractionDigits: 2 }) // "75.60%"
       */
      percent: (value: number, options?: Intl.NumberFormatOptions): string => {
        if (!options) {
          return percentFormat.format(value);
        }
        return new Intl.NumberFormat(locale, {
          style: 'percent',
          ...options,
        }).format(value);
      },

      /**
       * Format a date
       * 
       * @param value - Date, timestamp, or date string
       * @param options - Optional Intl.DateTimeFormatOptions
       * @example
       * date(new Date()) // "Jan 1, 2026"
       * date(Date.now(), { dateStyle: 'full' }) // "Thursday, January 1, 2026"
       */
      date: (
        value: Date | string | number,
        options?: Intl.DateTimeFormatOptions
      ): string => {
        const date = typeof value === 'string' || typeof value === 'number'
          ? new Date(value)
          : value;
        
        if (!options) {
          return new Intl.DateTimeFormat(locale).format(date);
        }
        return new Intl.DateTimeFormat(locale, options).format(date);
      },

      /**
       * Format relative time (e.g., "2 days ago", "in 3 hours")
       * 
       * @param value - The numeric value
       * @param unit - The time unit
       * @example
       * relativeTime(-2, 'day') // "2 days ago"
       * relativeTime(3, 'hour') // "in 3 hours"
       * relativeTime(-1, 'week') // "last week"
       */
      relativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit): string => {
        return relativeTimeFormat.format(value, unit);
      },

      /**
       * Format a list of items with locale-aware conjunctions
       * 
       * @param items - Array of strings to join
       * @param options - Optional Intl.ListFormatOptions
       * @example
       * list(['A', 'B', 'C']) // "A, B, and C" (en-US)
       * list(['A', 'B'], { type: 'disjunction' }) // "A or B"
       */
      list: (items: string[], options?: Intl.ListFormatOptions): string => {
        if (!options) {
          return listFormat.format(items);
        }
        return new Intl.ListFormat(locale, options).format(items);
      },
    };
  }, [locale]);
}

/**
 * Standalone formatter functions (for use outside React components)
 * 
 * @param locale - The locale to use for formatting
 * @example
 * const { number, currency } = createFormatters('en');
 * console.log(currency(1234.56)); // "$1,234.56"
 */
export function createFormatters(locale: string): Formatters {
  const numberFormat = new Intl.NumberFormat(locale);
  const currencyFormatCache = new Map<string, Intl.NumberFormat>();
  const percentFormat = new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 2,
  });
  const relativeTimeFormat = new Intl.RelativeTimeFormat(locale, {
    numeric: 'auto',
  });
  const listFormat = new Intl.ListFormat(locale);

  return {
    number: (value: number, options?: Intl.NumberFormatOptions): string => {
      if (!options) {
        return numberFormat.format(value);
      }
      return new Intl.NumberFormat(locale, options).format(value);
    },

    currency: (
      value: number,
      currency: string = 'USD',
      options?: Intl.NumberFormatOptions
    ): string => {
      const cacheKey = `${currency}-${JSON.stringify(options || {})}`;
      let formatter = currencyFormatCache.get(cacheKey);
      
      if (!formatter) {
        formatter = new Intl.NumberFormat(locale, {
          style: 'currency',
          currency,
          ...options,
        });
        currencyFormatCache.set(cacheKey, formatter);
      }
      
      return formatter.format(value);
    },

    percent: (value: number, options?: Intl.NumberFormatOptions): string => {
      if (!options) {
        return percentFormat.format(value);
      }
      return new Intl.NumberFormat(locale, {
        style: 'percent',
        ...options,
      }).format(value);
    },

    date: (
      value: Date | string | number,
      options?: Intl.DateTimeFormatOptions
    ): string => {
      const date = typeof value === 'string' || typeof value === 'number'
        ? new Date(value)
        : value;
      
      if (!options) {
        return new Intl.DateTimeFormat(locale).format(date);
      }
      return new Intl.DateTimeFormat(locale, options).format(date);
    },

    relativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit): string => {
      return relativeTimeFormat.format(value, unit);
    },

    list: (items: string[], options?: Intl.ListFormatOptions): string => {
      if (!options) {
        return listFormat.format(items);
      }
      return new Intl.ListFormat(locale, options).format(items);
    },
  };
}

/**
 * Predefined format configurations for common use cases
 */
export const PRESET_FORMATS = {
  // Number formats
  integer: { maximumFractionDigits: 0 } as Intl.NumberFormatOptions,
  compact: { notation: 'compact', compactDisplay: 'short' } as Intl.NumberFormatOptions,
  scientific: { notation: 'scientific' } as Intl.NumberFormatOptions,
  
  // Currency formats
  currencyNoDecimal: { minimumFractionDigits: 0, maximumFractionDigits: 0 } as Intl.NumberFormatOptions,
  currencyCompact: { 
    notation: 'compact', 
    compactDisplay: 'short',
    maximumFractionDigits: 1 
  } as Intl.NumberFormatOptions,
  
  // Date formats
  dateShort: { dateStyle: 'short' } as Intl.DateTimeFormatOptions,
  dateMedium: { dateStyle: 'medium' } as Intl.DateTimeFormatOptions,
  dateLong: { dateStyle: 'long' } as Intl.DateTimeFormatOptions,
  dateFull: { dateStyle: 'full' } as Intl.DateTimeFormatOptions,
  timeShort: { timeStyle: 'short' } as Intl.DateTimeFormatOptions,
  timeMedium: { timeStyle: 'medium' } as Intl.DateTimeFormatOptions,
  dateTime: { dateStyle: 'medium', timeStyle: 'short' } as Intl.DateTimeFormatOptions,
  dateTimeFull: { dateStyle: 'full', timeStyle: 'long' } as Intl.DateTimeFormatOptions,
  
  // Percent formats
  percentInteger: { minimumFractionDigits: 0, maximumFractionDigits: 0 } as Intl.NumberFormatOptions,
  percentPrecise: { minimumFractionDigits: 2, maximumFractionDigits: 4 } as Intl.NumberFormatOptions,
} as const;
