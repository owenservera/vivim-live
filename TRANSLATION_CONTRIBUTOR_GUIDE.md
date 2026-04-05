# Translation Contributor Guide

**Purpose:** Add a new language to VIVIM in under 30 minutes  
**Target Audience:** Developers and translators  
**Last Updated:** 2026-04-05

---

## Quick Start — Add a New Language (10 Steps)

### Step 1: Choose Your Locale Code

Use [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) language codes:
- French → `fr`
- German → `de`
- Portuguese → `pt`
- Italian → `it`
- Japanese → `ja`
- Chinese (Simplified) → `zh`
- Korean → `ko`
- Russian → `ru`

**Example:** We'll use `fr` (French) throughout this guide.

---

### Step 2: Create Messages Directory

```bash
cd packages/frontend/src/messages
mkdir fr
```

---

### Step 3: Create Translation File

```bash
cd fr
touch index.json
```

---

### Step 4: Copy English as Base

```bash
# Copy English file as starting point
cp ../en/index.json ./index.json
```

---

### Step 5: Translate All Values

Open `index.json` and translate **all string values** from English to your language.

**Structure:**
```json
{
  "common": {
    "nav": {
      "github": "GitHub",        // ← Keep brand names
      "discord": "Discord",
      "docs": "Documentation"    // ← Translate UI labels
    },
    "demos": "Démonstrations",   // ← Translate
    // ... 792 keys total
  }
}
```

**Translation Rules:**
1. ✅ **Translate:** UI labels, headings, descriptions, button text
2. ❌ **Don't translate:** Brand names (GitHub, Discord, OpenAI, etc.)
3. ❌ **Don't translate:** Code examples (`npm install @vivim/sdk`)
4. ⚠️ **Keep variables:** `{highlight}`, `{count}`, etc.
5. ⚠️ **Keep HTML:** Any HTML tags or entities
6. ⚠️ **Keep JSON structure:** Don't add/remove keys

**Example:**
```json
// English
{
  "hero": {
    "title": "The Living Memory",
    "description": "A memory layer that you own..."
  }
}

// French
{
  "hero": {
    "title": "La Mémoire Vivante",
    "description": "Une couche de mémoire que vous possédez..."
  }
}
```

---

### Step 6: Update Routing Configuration

**File:** `packages/frontend/src/i18n/routing.ts`

Add your locale to the `locales` array:

```typescript
export const routing = defineRouting({
  locales: ['en', 'es', 'ca', 'ar', 'fr'],  // ← Add 'fr'
  defaultLocale: 'en',
  localePrefix: 'always',
  localeDetection: true,
});
```

---

### Step 7: Add Locale Metadata

**Same file:** `packages/frontend/src/i18n/routing.ts`

Add display metadata:

```typescript
export const LOCALE_METADATA: Record<string, { name: string; flag: string }> = {
  en: { name: 'English', flag: '🇺🇸' },
  es: { name: 'Español', flag: '🇪🇸' },
  ca: { name: 'Català', flag: '🏳️' },
  ar: { name: 'العربية', flag: '🇸🇦' },
  fr: { name: 'Français', flag: '🇫🇷' },  // ← Add this
};
```

---

### Step 8: Update i18n Index

**File:** `packages/frontend/src/i18n/index.ts`

#### 8a. Update `getHtmlLang()` function:

```typescript
export function getHtmlLang(locale: string): string {
  const langMap: Record<string, string> = {
    en: 'en-US',
    es: 'es-ES',
    ca: 'ca-ES',
    ar: 'ar-SA',
    fr: 'fr-FR',  // ← Add this
  };
  return langMap[locale] || locale;
}
```

#### 8b. Update `SUPPORTED_LOCALES` array:

```typescript
export const SUPPORTED_LOCALES = [
  { code: 'en', name: 'English', flag: '🇺🇸', direction: 'ltr' as const },
  { code: 'es', name: 'Español', flag: '🇪🇸', direction: 'ltr' as const },
  { code: 'ca', name: 'Català', flag: '🏳️', direction: 'ltr' as const },
  { code: 'ar', name: 'العربية', flag: '🇸🇦', direction: 'rtl' as const },
  { code: 'fr', name: 'Français', flag: '🇫🇷', direction: 'ltr' as const },  // ← Add this
] as const;
```

#### 8c. Update `isSupportedLocale()` type:

```typescript
export function isSupportedLocale(locale: string): locale is 'en' | 'es' | 'ca' | 'ar' | 'fr' {
  return SUPPORTED_LOCALES.some(l => l.code === locale);
}
```

---

### Step 9: Update Types Configuration

**File:** `packages/frontend/src/types/i18n.ts`

Add to `LOCALES` record:

```typescript
export const LOCALES: Record<string, LocaleConfig> = {
  en: { code: 'en', name: 'English', direction: 'ltr', flag: '🇺🇸' },
  es: { code: 'es', name: 'Español', direction: 'ltr', flag: '🇪🇸' },
  ca: { code: 'ca', name: 'Català', direction: 'ltr', flag: '🏳️' },
  ar: { code: 'ar', name: 'العربية', direction: 'rtl', flag: '🇸🇦' },
  fr: { code: 'fr', name: 'Français', direction: 'ltr', flag: '🇫🇷' },  // ← Add this
} as const;
```

---

### Step 10: Update OpenGraph Locale Map

**File:** `packages/frontend/src/app/[locale]/layout.tsx`

Add to `OG_LOCALE_MAP`:

```typescript
const OG_LOCALE_MAP: Record<string, string> = {
  en: 'en_US',
  es: 'es_ES',
  ca: 'ca_ES',
  ar: 'ar_SA',
  fr: 'fr_FR',  // ← Add this
};
```

---

## Validation

### Check Coverage

```bash
node scripts/i18n-check.js
```

**Expected output:**
```
=== i18n Validation Report ===

Languages: en, es, ca, ar, fr
Total English keys: 792

--- Coverage ---
es: 100.0% ✓
ca: 100.0% ✓
fr: 100.0% ✓  ← Your language
ar: 35.0% ✗

--- Interpolation Variables ---
es: OK
ca: OK
fr: OK  ← Must be OK
ar: OK
```

### Check for Missing Keys

```bash
node scripts/i18n-check.js --missing
```

### Find Unused Keys

```bash
node scripts/find-unused-translations.js
```

---

## RTL Language Support (Arabic, Hebrew, etc.)

If your language is **Right-to-Left (RTL)**:

### Step A: Add to RTL Locales

**File:** `packages/frontend/src/i18n/routing.ts`

```typescript
export const RTL_LOCALES = ['ar', 'he'] as const;  // ← Add your locale
```

### Step B: Verify Direction in Types

**File:** `packages/frontend/src/types/i18n.ts`

```typescript
export const LOCALES: Record<string, LocaleConfig> = {
  // ...
  he: { code: 'he', name: 'עברית', direction: 'rtl', flag: '🇮🇱' },  // ← direction: 'rtl'
} as const;
```

### Step C: Add Font Support

**File:** `packages/frontend/src/app/[locale]/layout.tsx`

```typescript
import { Inter, JetBrains_Mono, Noto_Sans_Hebrew } from "next/font/google";

const notoSansHebrew = Noto_Sans_Hebrew({
  variable: "--font-noto-sans-hebrew",
  subsets: ["hebrew"],
  weight: ["400", "500", "600", "700"],
});
```

**Then in body className:**
```typescript
<body className={`${inter.variable} ${notoSansHebrew.variable} ...`}>
```

**And in CSS (`globals.css`):**
```css
[dir="rtl"] {
  font-family: var(--font-noto-sans-hebrew), var(--font-inter), sans-serif;
}
```

---

## Translation Quality Guidelines

### 1. Tone & Style

- **Professional but approachable** — VIVIM is technical but not corporate
- **Consistent terminology** — Use the same translation for the same concept
- **Active voice** — Prefer "Create" over "To be created"

### 2. Technical Terms

| English | Keep As | Translate To |
|---------|---------|--------------|
| ACU | ACU | (keep as acronym) |
| SDK | SDK | (keep as acronym) |
| Context Engine | — | Translate (e.g., "Motor de Contexto") |
| Zero-Knowledge | ZK | Translate concept (e.g., "Conocimiento Cero") |
| CRDT | CRDT | (keep as acronym) |
| Token | Token | (keep as loanword in most languages) |

### 3. Interpolation Variables

**Never translate variable names:**
```json
// ✅ Correct
"todayAccesses": "Hoy: {count} accesos"

// ❌ Wrong
"todayAccesses": "Hoy: {conteo} accesos"
```

**Common variables:**
- `{count}` — Number count
- `{highlight}` — Highlighted text segment
- `{value}` — Generic value

### 4. Pluralization

next-intl handles pluralization. Use ICU message format:

```json
{
  "detectionsFound": "{count, plural, =0 {No detections} one {# Detection} other {# Detections}} Found"
}
```

### 5. Punctuation

- **Spanish/Catalan:** Use `¿?` and `¡!` for questions/exclamations
- **French:** Space before `:` and `;` and `!` and `?`
- **Japanese:** Use `「」` for quotes instead of `""`
- **Arabic:** Use `؟` for question mark

---

## Testing Your Translation

### 1. Local Development

```bash
cd packages/frontend
bun run dev
```

Visit: `http://localhost:3000/fr` (replace `fr` with your locale)

### 2. Check All Pages

- ✅ Landing page (`/fr`)
- ✅ Interactive demos (`/fr/demos/*`)
- ✅ Language switcher works
- ✅ RTL layout (if applicable)
- ✅ Date/number formatting
- ✅ Currency formatting

### 3. Test Language Switching

1. Open page in your language
2. Use language switcher dropdown
3. Verify URL changes to `/fr` → `/en` → `/es` etc.
4. Verify content updates correctly

---

## Common Issues

### Issue: "Missing keys" error in console

**Cause:** Translation file doesn't have all 792 keys  
**Fix:** Run `node scripts/i18n-check.js --missing` and add missing keys

### Issue: Interpolation variables not working

**Cause:** Variable name mismatch  
**Fix:** Ensure `{count}` in translation matches English exactly

### Issue: RTL layout broken

**Cause:** Missing `direction: 'rtl'` in locale config  
**Fix:** Check `routing.ts` RTL_LOCALES and `types/i18n.ts` LOCALES

### Issue: Font looks wrong

**Cause:** Font doesn't support your script  
**Fix:** Add appropriate Google Font subset (e.g., Noto Sans Arabic)

### Issue: Build fails

**Cause:** JSON syntax error  
**Fix:** Validate JSON: `node -e "JSON.parse(require('fs').readFileSync('packages/frontend/src/messages/fr/index.json', 'utf-8')); console.log('Valid')"`

---

## File Structure Reference

```
packages/frontend/
├── src/
│   ├── i18n/
│   │   ├── routing.ts          ← Locale list & metadata
│   │   ├── index.ts            ← HTML lang, supported locales
│   │   ├── request.ts          ← Message loader
│   │   ├── formatters.ts       ← Number/date formatters
│   │   └── useTypedTranslations.ts
│   │
│   ├── types/
│   │   └── i18n.ts             ← Locale types & config
│   │
│   ├── messages/
│   │   ├── en/
│   │   │   └── index.json      ← English (792 keys)
│   │   ├── es/
│   │   │   └── index.json      ← Spanish (792 keys)
│   │   ├── ca/
│   │   │   └── index.json      ← Catalan (792 keys)
│   │   ├── ar/
│   │   │   └── index.json      ← Arabic (needs completion)
│   │   └── fr/                 ← Your new language
│   │       └── index.json
│   │
│   └── app/
│       └── [locale]/
│           └── layout.tsx      ← OpenGraph locale map
│
└── scripts/
    ├── i18n-check.js           ← Coverage validator
    └── find-unused-translations.js
```

---

## Translation Checklist

Use this checklist when adding a new language:

- [ ] Created `packages/frontend/src/messages/<locale>/index.json`
- [ ] Translated all 792 keys
- [ ] Updated `routing.ts` locales array
- [ ] Updated `routing.ts` LOCALE_METADATA
- [ ] Updated `i18n/index.ts` getHtmlLang()
- [ ] Updated `i18n/index.ts` SUPPORTED_LOCALES
- [ ] Updated `i18n/index.ts` isSupportedLocale() type
- [ ] Updated `types/i18n.ts` LOCALES
- [ ] Updated `layout.tsx` OG_LOCALE_MAP
- [ ] (RTL only) Updated RTL_LOCALES
- [ ] (RTL only) Added font support
- [ ] Validated: `node scripts/i18n-check.js` shows 100%
- [ ] Validated: Interpolation variables OK
- [ ] Tested: Local dev server loads correctly
- [ ] Tested: Language switcher works
- [ ] Tested: All pages render correctly

---

## Scripts Reference

### `scripts/i18n-check.js`

Validates translation coverage and interpolation variables.

```bash
node scripts/i18n-check.js              # Full report
node scripts/i18n-check.js --coverage  # Coverage only
node scripts/i18n-check.js --missing   # Missing keys only
```

### `scripts/find-unused-translations.js`

Finds keys in translation files not used in code.

```bash
node scripts/find-unused-translations.js
```

### `scripts/merge-missing-<locale>.js`

Auto-merges missing keys from English (helper script).

```bash
node scripts/merge-missing-fr.js  # Auto-fill missing keys
```

---

## Getting Help

- **Translation questions:** Check existing translations in `messages/es/index.json` and `messages/ca/index.json` for examples
- **Technical issues:** See "Common Issues" section above
- **RTL support:** See "RTL Language Support" section
- **Validation:** Run `node scripts/i18n-check.js` before submitting PR

---

## Current Language Status

| Locale | Name | Keys | Coverage | Status |
|--------|------|------|----------|--------|
| `en` | English | 792 | 100% | ✅ Source of truth |
| `es` | Español | 792 | 100% | ✅ Production ready |
| `ca` | Català | 792 | 100% | ✅ Production ready |
| `ar` | العربية | 277 | 35% | ⚠️ Needs completion |
| `fr` | Français | — | — | 📝 Add yours! |

---

**Thank you for contributing to VIVIM internationalization! 🌍**
