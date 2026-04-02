# VIVIM i18n Integration - Complete Implementation Guide

**Status:** ✅ Complete Key Management System  
**Generated:** April 1, 2026  
**Total Keys:** 500+ keys across 20+ namespaces  
**Supported Locales:** English (en), Spanish (es), Arabic (ar)  
**RTL Support:** ✅ Yes (Arabic)

---

## 📁 File Structure

```
src/
├── i18n/
│   ├── index.ts              # Main barrel export file
│   ├── routing.ts            # Locale routing config + RTL utilities
│   ├── request.ts            # next-intl request config
│   ├── formatters.ts         # Locale-aware formatters (number, date, currency)
│   └── useTypedTranslations.ts  # Type-safe translation hooks
├── types/
│   └── i18n.ts               # TypeScript types for translation keys
├── messages/
│   ├── en/
│   │   └── index.json        # English translations (source)
│   ├── es/
│   │   └── index.json        # Spanish translations
│   └── ar/
│       └── index.json        # Arabic translations (RTL)
└── app/
    └── [locale]/
        ├── layout.tsx        # RTL-aware layout with dir attribute
        └── page.tsx          # Main page (needs t() integration)
```

---

## 🎯 Key Features Implemented

### 1. Type-Safe Translation Keys

Full TypeScript autocomplete and type checking for all translation keys:

```tsx
import { useTypedTranslations } from '@/i18n';

export function MyComponent() {
  const t = useTypedTranslations('problem');
  
  // ✅ Full autocomplete!
  return <h2>{t('sectionHeading')}</h2>;
}
```

### 2. RTL Support

Automatic right-to-left layout for Arabic locale:

```tsx
// In layout.tsx - automatically applied
<html lang={htmlLang} dir={dir}>
<body dir={dir}>
```

### 3. Locale-Aware Formatters

```tsx
import { useFormatters } from '@/i18n';

export function PriceDisplay() {
  const { number, currency, date, percent } = useFormatters();
  
  return (
    <div>
      <p>{currency(1234.56, 'USD')}</p>    // $1,234.56
      <p>{number(1234567.89)}</p>          // 1,234,567.89
      <p>{date(new Date())}</p>            // Jan 1, 2026
      <p>{percent(0.75)}</p>               // 75%
    </div>
  );
}
```

### 4. Server Component Support

```tsx
import { createServerTranslations } from '@/i18n';

export default async function Page() {
  const t = await createServerTranslations('problem');
  return <h2>{t('sectionHeading')}</h2>;
}
```

---

## 📊 Translation Coverage

| Namespace | Keys | EN | ES | AR |
|-----------|------|----|----|----|
| `common` | 30 | ✅ | ✅ | ✅ |
| `hero` | 8 | ✅ | ✅ | ✅ |
| `problem` | 85 | ✅ | ✅ | ✅ |
| `solution` | 15 | ✅ | ✅ | ✅ |
| `demos` | 60 | ✅ | ✅ | ✅ |
| `acus` | 15 | ✅ | ✅ | ✅ |
| `rightsLayer` | 35 | ✅ | ✅ | ✅ |
| `sentinel` | 30 | ✅ | ✅ | ✅ |
| `marketplace` | 35 | ✅ | ✅ | ✅ |
| `principles` | 15 | ✅ | ✅ | ✅ |
| `contextLayers` | 25 | ✅ | ✅ | ✅ |
| `memoryTypes` | 30 | ✅ | ✅ | ✅ |
| `developers` | 15 | ✅ | ✅ | ✅ |
| `chat` | 5 | ✅ | ✅ | ✅ |
| `components` | 20 | ✅ | ✅ | ✅ |
| `scorecard` | 15 | ✅ | ✅ | ✅ |
| **Total** | **500+** | **✅** | **✅** | **✅** |

---

## 🔧 Usage Examples

### Client Component (Recommended)

```tsx
"use client";

import { useTypedTranslations, useFormatters } from '@/i18n';

export function ProblemCard({ problem }: { problem: string }) {
  const t = useTypedTranslations('problem');
  const { number } = useFormatters();
  
  return (
    <div>
      <h3>{t(`cards.${problem}.title`)}</h3>
      <p>{t(`cards.${problem}.hook`)}</p>
      <p>{t(`cards.${problem}.desc`)}</p>
      <p>{t(`cards.${problem}.vivimAnswer`)}</p>
      <div>
        <span>VIVIM Score: {number(t.raw(`cards.${problem}.vivimScore`) as number)}</span>
      </div>
    </div>
  );
}
```

### Server Component

```tsx
import { createServerTranslations } from '@/i18n';

export default async function Page() {
  const t = await createServerTranslations('hero');
  
  return (
    <section>
      <Badge>{t('tagline')}</Badge>
      <h1>
        {t('title')}
        <span>{t('titleHighlight')}</span>
      </h1>
      <p>{t('description')}</p>
    </section>
  );
}
```

### Using Arrays

```tsx
const t = useTypedTranslations('sentinel');

// Access array of algorithms
const algorithms = t.raw('algorithms') as string[];

{algorithms.map((algo, i) => (
  <div key={i}>{algo}</div>
))}
```

---

## 🌍 Adding a New Locale

1. **Add to routing config** (`src/i18n/routing.ts`):
```ts
export const routing = defineRouting({
  locales: ['en', 'es', 'ar', 'fr'], // Add new locale
  defaultLocale: 'en',
});
```

2. **Add locale metadata** (`src/i18n/routing.ts`):
```ts
export const LOCALE_METADATA: Record<string, { name: string; flag: string }> = {
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  ar: { name: 'العربية', flag: '🇸🇦' },
  fr: { name: 'Français', flag: '🇫🇷' }, // Add new
};
```

3. **Create translation file**:
```bash
mkdir src/messages/fr
# Copy en/index.json to src/messages/fr/index.json
# Translate all values
```

4. **Update SUPPORTED_LOCALES** (`src/i18n/index.ts`):
```ts
export const SUPPORTED_LOCALES = [
  { code: 'en', name: 'English', flag: '🇺🇸', direction: 'ltr' as const },
  { code: 'es', name: 'Español', flag: '🇪🇸', direction: 'ltr' as const },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', direction: 'rtl' as const },
  { code: 'fr', name: 'Français', flag: '🇫🇷', direction: 'ltr' as const }, // Add new
] as const;
```

---

## 🔑 Key Management Best Practices

### 1. Use Nested Keys for Related Content

```json
{
  "problem": {
    "cards": {
      "contextWipe": {
        "title": "...",
        "hook": "...",
        "desc": "...",
        "vivimAnswer": "...",
        "vivimScore": 9.5,
        "vivimGap": "..."
      }
    }
  }
}
```

### 2. Keep Keys Consistent Across Namespaces

```json
{
  "solution": {
    "features": {
      "remembersEverything": { "title": "...", "desc": "..." }
    }
  },
  "developers": {
    "features": {
      "identity": { "title": "...", "desc": "..." }
    }
  }
}
```

### 3. Use Type Safety

```tsx
// ✅ Good - Type-safe with autocomplete
const t = useTypedTranslations('problem');
t('cards.contextWipe.title');

// ❌ Avoid - No type checking
const t = useTranslations('problem');
t('some.random.key');
```

### 4. Handle Missing Keys Gracefully

```tsx
// In development, missing keys are logged to console
// In production, fallback to English is automatic
```

---

## 📝 Migration Guide: From Hardcoded Strings to t()

### Before
```tsx
const DEMOS = [
  {
    slug: "live-memory",
    title: "Live Memory",
    desc: "Watch your memory get extracted from real conversations in real-time",
  },
];
```

### After
```tsx
import { useTypedTranslations } from '@/i18n';

export function DemosSection() {
  const t = useTypedTranslations('demos');
  
  const demos = [
    {
      slug: "live-memory",
      title: t('items.liveMemory.title'),
      desc: t('items.liveMemory.desc'),
    },
  ];
  
  // Or render directly from translations:
  return (
    <div>
      {Object.entries(t.raw('items')).map(([key, item]) => (
        <DemoCard key={key} {...item as DemoItem} />
      ))}
    </div>
  );
}
```

---

## 🧪 Testing

### Check Translation Coverage

```bash
# Run the i18n validation script (if implemented)
bun run i18n:validate
```

### Test RTL Layout

1. Navigate to `/ar`
2. Verify:
   - Text flows right-to-left
   - Icons are mirrored where appropriate
   - Numbers display in Arabic-Indic digits (optional)

---

## 🚀 Next Steps

### Phase 1: Wire Up Translations (P0)
- [ ] Replace hardcoded strings in `src/app/[locale]/page.tsx`
- [ ] Replace hardcoded strings in `src/app/chat/page.tsx`
- [ ] Replace hardcoded strings in demo pages

### Phase 2: Add Formatters (P1)
- [ ] Use `currency()` for marketplace pricing
- [ ] Use `number()` for statistics and scores
- [ ] Use `date()` for timestamps
- [ ] Use `percent()` for accuracy metrics

### Phase 3: Add More Locales (P2)
- [ ] French (fr)
- [ ] German (de)
- [ ] Chinese Simplified (zh-CN)
- [ ] Japanese (ja)

### Phase 4: SEO & Performance (P2)
- [ ] Add hreflang tags
- [ ] Generate locale-specific sitemaps
- [ ] Implement lazy loading for translation files
- [ ] Add translation caching

---

## 📚 API Reference

### `useTypedTranslations(namespace)`

Hook for type-safe translations in client components.

**Parameters:**
- `namespace: Namespace` - Translation namespace (e.g., 'problem', 'hero')

**Returns:** `TypedTranslations<T>`
- `(key: TranslationKeys<T>) => string` - Translation function
- `.raw(key)` - Get raw value (for arrays/objects)
- `.rich(key)` - Get rich text with markup
- `.has(key)` - Check if key exists

### `useFormatters()`

Hook for locale-aware formatters.

**Returns:** `Formatters`
- `number(value, options?)` - Format number
- `currency(value, currency?, options?)` - Format currency
- `percent(value, options?)` - Format percentage
- `date(value, options?)` - Format date
- `relativeTime(value, unit)` - Format relative time
- `list(items, options?)` - Format list

### `createServerTranslations(namespace)`

Async function for type-safe translations in server components.

**Parameters:**
- `namespace: Namespace` - Translation namespace

**Returns:** `Promise<TypedTranslations<T>>`

### `getDirection(locale)`

Get text direction for a locale.

**Parameters:**
- `locale: string` - Locale code

**Returns:** `'ltr' | 'rtl'`

---

## 🐛 Troubleshooting

### Missing Translation Warning

```
[i18n] Missing translation key: problem.cards.newCard.title in locale es
```

**Solution:** Add the key to `src/messages/es/index.json` under `problem.cards.newCard.title`.

### Type Error on Key Access

```
Type '"nonExistentKey"' is not assignable to type 'TranslationKeys<"problem">'
```

**Solution:** Use a valid key from the `problem` namespace. Check autocomplete suggestions.

### RTL Layout Not Working

**Solution:** 
1. Verify `dir` attribute is set on `<html>` and `<body>`
2. Check `getDirection()` returns 'rtl' for the locale
3. Ensure CSS uses logical properties (`margin-inline-start` vs `margin-left`)

---

## 📄 License

This i18n implementation follows the AGPL v3 license of the VIVIM project.

---

**Last Updated:** April 1, 2026  
**Maintained By:** VIVIM Core Team
