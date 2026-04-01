# Translation Files Quick Reference

## Created Files

```
translation-research/
├── messages/
│   ├── en/
│   │   ├── common.json      # Nav, CTA, footer, errors
│   │   ├── hero.json        # Hero section (tagline, title, description, CTA)
│   │   └── sections.json    # All other sections (providers, problem, solution, demos, etc.)
│   │
│   └── es/
│       ├── common.json      # Nav, CTA, footer, errors (Spanish)
│       ├── hero.json        # Hero section (Spanish)
│       └── sections.json    # All other sections (Spanish)
│
├── analysis-and-design.md   # Full analysis and design document
└── implementation-plan.md   # Implementation steps and checklist
```

## Translation Key Structure

### common.json
```
common.nav.github
common.nav.discord
common.nav.docs
common.cta.tryLiveDemo
common.cta.viewOnGithub
common.footer.tagline
common.footer.philosophy
common.footer.copyright
common.errors.somethingWrong
common.errors.tryAgain
common.misc.comingSoon
common.misc.learnMore
common.misc.viewAll
```

### hero.json
```
hero.tagline
hero.title
hero.titleHighlight
hero.description
hero.quote
hero.descriptionExtended
hero.cta.tryLiveDemo
hero.cta.viewOnGithub
```

### sections.json (Sample Keys)
```
providers.title (with {highlight} variable)
providers.highlight
providers.description
providers.logos.openai
...

problem.title
problem.heading
problem.highlight
problem.description
problem.stats.accuracyDrop
...

solution.title
solution.heading
solution.highlight
solution.description
solution.cta
...

demos.title
demos.description
demos.items.liveMemory.title
demos.items.liveMemory.desc
...
```

## Usage in Next.js Components

```tsx
import { useTranslations } from 'next-intl';

export default function Hero() {
  const t = useTranslations('hero');
  const tc = useTranslations('common');
  
  return (
    <section>
      <span>{t('tagline')}</span>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      
      {/* Using variable interpolation */}
      <h2>{t('providers.title', { highlight: t('providers.highlight') })}</h2>
      
      <button>{tc('cta.tryLiveDemo')}</button>
    </section>
  );
}
```

## Adding Variables in Keys

Keys with variables use i18next interpolation:
```json
{
  "providers": {
    "title": "Works with {highlight}",
    "highlight": "Any AI Provider"
  }
}
```

Usage:
```tsx
t('providers.title', { highlight: t('providers.highlight') })
// Output: "Works with Any AI Provider"
```

## Number of Translation Keys

| File | Approx. Keys | Status |
|------|-------------|--------|
| common.json | 15 | ✅ Complete |
| hero.json | 9 | ✅ Complete |
| sections.json | 150+ | ✅ Complete |
| **Total** | **175+** | **Ready for implementation** |

## Next Steps

1. Install `next-intl`: `npm install next-intl`
2. Configure routing in `src/i18n/routing.ts`
3. Create middleware in `src/middleware.ts`
4. Move app pages to `src/app/[locale]/`
5. Import translations in layouts
6. Replace hardcoded text with `t()` calls
7. Test language switching

## Files Ready for Copy

When implementing, copy the translation files from:
- `translation-research/messages/en/` → `src/messages/en/`
- `translation-research/messages/es/` → `src/messages/es/`