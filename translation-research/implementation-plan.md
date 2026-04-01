# VIVIM Translation Implementation Plan

## Phase 1: Translation File Design

### 1.1 File Structure Strategy

The translation files will be organized by **section** rather than language, enabling:
- Easy parallel translation workflow
- Independent updates per section
- Clear ownership and review process
- Git-friendly diffs

```
messages/
├── en/                      # Source language (reference)
│   ├── common.json          # Shared elements
│   ├── hero.json            # Hero section
│   ├── sections.json        # All other sections
│   └── components.json      # Reusable UI components
│
└── es/                      # Target language
    ├── common.json
    ├── hero.json
    ├── sections.json
    └── components.json
```

### 1.2 Translation Key Architecture

**Naming Convention**: `section.subsection.element`

```json
// Example structure
{
  "hero": {
    "tagline": "Sovereign • Portable • Personal",
    "title": "The Living Memory",
    "titleHighlight": "for Your AI",
    "description": "A memory layer that...",
    "cta": {
      "tryDemo": "Try Live Demo",
      "viewGithub": "View on GitHub"
    }
  },
  "providers": {
    "title": "Works with {highlight}",
    "highlight": "Any AI Provider",
    "description": "VIVIM is provider-agnostic..."
  }
}
```

### 1.3 Variable Interpolation

Support for dynamic content using i18next interpolation:

```json
{
  "providers": {
    "title": "Works with {highlight}",
    "description": "{name} is provider-agnostic..."
  }
}
```

Usage in code:
```typescript
t('providers.title', { highlight: 'Any AI Provider' })
```

### 1.4 Pluralization Rules

```json
{
  "memory": {
    "item_one": "{count} memory",
    "item_other": "{count} memories"
  }
}
```

---

## Phase 2: Content Extraction

### 2.1 Text Inventory by Section

| Section | File | Approx. Strings | Priority |
|---------|------|------------------|----------|
| Hero | hero.json | 15 | Critical |
| Providers | sections.json | 10 | High |
| Problem | sections.json | 50 | High |
| Solution | sections.json | 20 | High |
| Demos | sections.json | 30 | High |
| ACUs | sections.json | 20 | Medium |
| Rights Layer | sections.json | 35 | Medium |
| Sentinel | sections.json | 25 | Medium |
| Marketplace | sections.json | 20 | Medium |
| Principles | sections.json | 15 | Medium |
| Context Layers | sections.json | 25 | Low |
| Memory Types | sections.json | 20 | Low |
| Developers | sections.json | 15 | Low |
| Footer | common.json | 10 | Medium |

### 2.2 Text Categories

1. **Static Text** - Fixed strings that never change
   - Section titles, headings
   - Navigation items
   - Footer links

2. **Dynamic Text** - Content that might update
   - Blog posts
   - Feature descriptions
   - Demo descriptions

3. **UI Elements** - Reusable components
   - Buttons, links
   - Form labels
   - Error messages

---

## Phase 3: Spanish Translation File Creation

### 3.1 common.json

```json
{
  "nav": {
    "github": "GitHub",
    "discord": "Discord",
    "docs": "Docs"
  },
  "cta": {
    "tryLiveDemo": "Try Live Demo",
    "viewOnGithub": "View on GitHub"
  },
  "footer": {
    "tagline": "Your memory. Your rules. Everywhere.",
    "philosophy": "The philosophy that guides everything we build.",
    "copyright": "© 2026 VIVIM • AGPL v3 • Open Source"
  }
}
```

### 3.2 hero.json

```json
{
  "tagline": "Sovereign • Portable • Personal",
  "title": "The Living Memory",
  "titleHighlight": "for Your AI",
  "description": "A memory layer that you own, that works with any AI provider, and goes wherever you go.",
  "quote": "It's not just technology — it's a philosophy about who owns your AI memory.",
  "descriptionExtended": "A sovereign, portable, personal memory and dynamic context engine that works with all AI providers — your single, AI-native database.",
  "cta": {
    "tryLiveDemo": "Try Live Demo",
    "viewOnGithub": "View on GitHub"
  }
}
```

### 3.3 sections.json (Main content)

Organized by major sections:

```json
{
  "providers": {
    "title": "Works with {highlight}",
    "highlight": "Any AI Provider",
    "description": "VIVIM is provider-agnostic. Connect your favorite models instantly.",
    "logos": {
      "openai": "OpenAI",
      "googleGemini": "Google Gemini",
      "claude": "Claude",
      "grok": "Grok",
      "zai": "Z.ai",
      "qwen": "Qwen",
      "kimi": "Kimi"
    }
  },
  "problem": {
    "title": "The Problem",
    "heading": "Every AI Conversation",
    "highlight": "Starts Broken",
    "description": "The context window isn't just limited — it's actively working against you. And most 'solutions' make it worse.",
    "stats": {
      "accuracyDrop": "Accuracy drop as context grows",
      "frontierModels": "Frontier models degrade with context",
      "vectorMarket": "Vector DB market validates the problem"
    },
    "cards": {
      "contextWipe": {
        "title": "The Context Wipe",
        "hook": "AI forgets everything, every session",
        "stat": "Conversations degrade after 15–20 messages, even with 1M token windows.",
        "desc": "Users rebuild context from scratch on every conversation. 3 years of domain knowledge, preferences, and decisions vanish the moment a tab closes."
      }
      // ... more problem cards
    }
  },
  "solution": {
    "title": "The Solution",
    "heading": "What If AI Could",
    "highlight": "Truly Remember?",
    "description": "Not just store — but understand, connect, and retrieve what matters — across every conversation, with every AI.",
    "features": {
      "remembersEverything": {
        "title": "Remembers Everything",
        "desc": "Every conversation, preference, and detail is stored and organized intelligently."
      },
      "intelligentRetrieval": {
        "title": "Intelligent Retrieval",
        "desc": "Finds exactly what's relevant using semantic search — no more repeating yourself."
      },
      "worksWithAnyAI": {
        "title": "Works with Any AI",
        "desc": "Model-agnostic design means you can switch providers without losing your memory."
      }
    }
  },
  "demos": {
    "title": "Interactive Demos",
    "description": "Explore VIVIM's capabilities through these live, interactive demonstrations",
    "items": {
      "liveMemory": {
        "title": "Live Memory",
        "desc": "Watch your memory get extracted from real conversations in real-time"
      },
      "contextEngine": {
        "title": "Context Engine",
        "desc": "See the 8-layer context assembly system build context from scratch"
      }
      // ... all demo items
    }
  }
  // ... more sections
}
```

### 3.4 components.json

```json
{
  "languageSwitcher": {
    "label": "Select language",
    "autoSuggested": "Auto-suggested"
  },
  "buttons": {
    "learnMore": "Learn More",
    "getStarted": "Get Started",
    "submit": "Submit",
    "cancel": "Cancel"
  },
  "errors": {
    "somethingWrong": "Something went wrong",
    "tryAgain": "Try again"
  }
}
```

---

## Phase 4: Implementation Steps

### Step 1: Install Dependencies
```bash
npm install next-intl
```

### Step 2: Create i18n Configuration
```
src/i18n/
├── routing.ts      # Locale routing config
├── config.ts       # next-intl config
└── request.ts      # Request-based config
```

### Step 3: Create Middleware
```
src/middleware.ts
```
Handles locale detection and routing.

### Step 4: Update Directory Structure
```
src/app/
├── [locale]/      # NEW: locale-based routing
│   ├── page.tsx
│   ├── layout.tsx
│   └── demos/
│       └── [...slug]/
│           └── page.tsx
└── page.tsx       # REMOVE (moved to [locale])
```

### Step 5: Create Translation Files
- Create `messages/en/` with all translation keys
- Create `messages/es/` with Spanish translations
- Validate JSON structure

### Step 6: Update Components

**Before (hardcoded):**
```tsx
<h1>The Living Memory</h1>
<button>Try Live Demo</button>
```

**After (translated):**
```tsx
import { useTranslations } from 'next-intl';

const t = useTranslations('hero');

<h1>{t('title')}</h1>
<button>{t('cta.tryLiveDemo')}</button>
```

### Step 7: Simplify LanguageSwitcher

The new LanguageSwitcher just changes the URL:
```tsx
const router = useRouter();
const pathname = usePathname();

// Switch from /en/page to /es/page
const newPath = pathname.replace(`/${currentLocale}`, `/${newLocale}`);
router.push(newPath);
```

---

## Phase 5: Migration Checklist

### Pre-Migration
- [ ] Audit all text content in current pages
- [ ] Create translation key structure
- [ ] Translate to Spanish (human or AI-assisted)
- [ ] Validate translation completeness

### Implementation
- [ ] Install next-intl
- [ ] Configure i18n routing
- [ ] Create middleware
- [ ] Update app directory structure
- [ ] Move all pages to [locale] directory
- [ ] Replace hardcoded text with t() calls
- [ ] Test language switching

### Post-Migration
- [ ] Remove old translation library code
- [ ] Update deployment configuration
- [ ] Add SEO metadata (hreflang)
- [ ] Performance testing

---

## Phase 6: File Organization Summary

### Final Directory Structure

```
project-root/
├── src/
│   ├── app/
│   │   └── [locale]/           # NEW: locale-based routing
│   │       ├── page.tsx
│   │       ├── layout.tsx
│   │       └── demos/
│   ├── components/
│   │   ├── LanguageSwitcher.tsx
│   │   └── ...
│   └── i18n/                   # NEW: i18n configuration
│       ├── routing.ts
│       └── request.ts
├── messages/                   # NEW: translation files
│   ├── en/
│   │   ├── common.json
│   │   ├── hero.json
│   │   ├── sections.json
│   │   └── components.json
│   └── es/
│       ├── common.json
│       ├── hero.json
│       ├── sections.json
│       └── components.json
├── middleware.ts              # NEW
└── translation-research/      # Keep for reference
    └── ...
```

### Code to Keep
- Components (UI unchanged)
- Demo pages (will need translation keys)
- Styling (Tailwind, CSS)

### Code to Remove After Migration
- `src/lib/translation/` (entire directory - 15 files)
- `public/translation-sw.js`
- Complex queue logic in components

---

## Phase 7: Spanish Translation Keys (Complete)

Below is the complete translation key structure ready for implementation:

```json
// messages/es/index.json - COMPLETE REFERENCE

{
  "common": {
    "nav": {
      "github": "GitHub",
      "discord": "Discord",
      "docs": "Docs"
    },
    "cta": {
      "tryLiveDemo": "Prueba la Demo en Vivo",
      "viewOnGithub": "Ver en GitHub"
    },
    "footer": {
      "tagline": "Tu memoria. Tus reglas. En todas partes.",
      "philosophy": "La filosofía que guía todo lo que construimos.",
      "copyright": "© 2026 VIVIM • AGPL v3 • Código Abierto"
    }
  },

  "hero": {
    "tagline": "Soberano • Portátil • Personal",
    "title": "La Memoria Viva",
    "titleHighlight": "para tu IA",
    "description": "Una capa de memoria que es tuya, que funciona con cualquier proveedor de IA, y va a donde quieras.",
    "quote": "No es solo tecnología — es una filosofía sobre quién posee tu memoria de IA.",
    "descriptionExtended": "Una memoria soberana, portátil y personal y un motor de contexto dinámico que funciona con todos los proveedores de IA — tu única base de datos nativa para IA."
  },

  "providers": {
    "title": "Funciona con {highlight}",
    "highlight": "Cualquier Proveedor de IA",
    "description": "VIVIM es agnóstico al proveedor. Conecta tus modelos favoritos al instante."
  },

  "problem": {
    "title": "El Problema",
    "heading": "Cada Conversación de IA",
    "highlight": "Comienza Rotta",
    "description": "La ventana de contexto no solo está limitada — está trabajando activamente contra ti. Y la mayoría de las 'soluciones' lo empeoran.",
    "stats": {
      "accuracyDrop": "Caída de precisión a medida que crece el contexto",
      "frontierModels": "Modelos frontier se degradan con el contexto",
      "vectorMarket": "El mercado de BD vectoriales valida el problema"
    }
  },

  "solution": {
    "title": "La Solución",
    "heading": "¿Y Si la IA Pudiera",
    "highlight": "Realmente Recordar?",
    "description": "No solo almacenar — pero entender, conectar y recuperar lo que importa — en cada conversación, con cada IA."
  },

  "demos": {
    "title": "Demos Interactivas",
    "description": "Explora las capacidades de VIVIM a través de estas demostraciones en vivo"
  },

  "acus": {
    "title": "Unidades Atómicas de Chat",
    "description": "El bloque fundamental de construcción que hace posible la memoria persistente multi-escenario"
  },

  "rightsLayer": {
    "title": "La Capa de Derechos",
    "heading": "Tus Datos,",
    "highlight": "Tus Reglas"
  },

  "sentinel": {
    "title": "El Sentinel",
    "heading": "Saber Si Tu Datos",
    "highlight": "Fueron Usados"
  },

  "marketplace": {
    "title": "El Mercado",
    "heading": "Monetiza Tu",
    "highlight": "Inteligencia"
  },

  "principles": {
    "title": "Nuestra Filosofía",
    "heading": "Memoria de IA Soberana",
    "highlight": "Te Pertenece"
  },

  "contextLayers": {
    "title": "El Sistema de 8 Capas",
    "heading": "Ensamblaje Inteligente de Contexto"
  },

  "memoryTypes": {
    "title": "9 Tipos de",
    "highlight": "Memoria Humana"
  },

  "developers": {
    "title": "Para Desarrolladores",
    "heading": "Construye con",
    "highlight": "@vivim/sdk"
  }
}
```

---

## Next Actions

1. **Approve this plan** - Confirm structure and approach
2. **Begin implementation** - Install next-intl and set up configuration
3. **Create translation files** - Use the structure above
4. **Migrate pages** - Update components to use translations
5. **Test** - Verify language switching works

The translation files are designed to be:
- **Scalable** - Easy to add more languages
- **Maintainable** - Clear structure, easy to find/edit
- **Developer-friendly** - Intuitive key naming
- **Translation-ready** - Clean JSON, no placeholders except intended variables