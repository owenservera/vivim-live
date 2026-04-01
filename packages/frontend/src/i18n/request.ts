import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';
import { validateMessageStructure } from '@/types/i18n';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  const messages = (await import(`../messages/${locale}/index.json`)).default;
  
  // Validate message structure in development
  if (process.env.NODE_ENV === 'development') {
    validateMessageStructure(messages);
  }

  return {
    locale,
    messages
  };
});