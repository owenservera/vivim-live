# VIVIM i18n Translation Inventory

**Generated:** April 1, 2026  
**Status:** English Complete ✅ | Spanish Complete ✅  
**Total Keys:** ~400+ keys across 20+ namespaces

---

## Translation File Structure

```
src/messages/
├── en/
│   └── index.json    (Source language - complete)
└── es/
    └── index.json    (Spanish - complete)
```

---

## Namespace Inventory

### 1. `common` - Shared UI Elements
**Keys:** ~25  
**Purpose:** Navigation, footer, CTAs, misc shared strings

| Key Path | English | Spanish |
|----------|---------|---------|
| `common.nav.github` | GitHub | GitHub |
| `common.nav.discord` | Discord | Discord |
| `common.nav.docs` | Docs | Docs |
| `common.demos` | Demos | Demos |
| `common.cta.tryLiveDemo` | Try Live Demo | Prueba la Demo en Vivo |
| `common.cta.viewOnGithub` | View on GitHub | Ver en GitHub |
| `common.footer.tagline` | Your memory. Your rules. Everywhere. | Tu memoria. Tus reglas. En todas partes. |
| `common.footer.copyright` | © 2026 VIVIM • AGPL v3 • Open Source | © 2026 VIVIM • AGPL v3 • Código Abierto |
| `common.misc.rank` | Rank # | Puesto # |
| `common.misc.comingSoon` | Coming soon | Próximamente |

---

### 2. `hero` - Hero Section
**Keys:** ~8  
**Purpose:** Main landing hero messaging

| Key Path | English | Spanish |
|----------|---------|---------|
| `hero.tagline` | Sovereign • Portable • Personal | Soberano • Portátil • Personal |
| `hero.title` | The Living Memory | La Memoria Viva |
| `hero.titleHighlight` | for Your AI | para tu IA |
| `hero.description` | A memory layer that you own... | Una capa de memoria que es tuya... |

---

### 3. `problem` - Problem Section
**Keys:** ~60  
**Purpose:** 12 problem cards, stats, filters, scorecard

| Key Path | English | Spanish |
|----------|---------|---------|
| `problem.sectionBadge` | The Problem | El Problema |
| `problem.sectionHeading` | Every AI Conversation | Cada Conversación de IA |
| `problem.sectionHighlight` | Starts Broken | Comienza Rota |
| `problem.stats.accuracyDrop` | Accuracy drop as context grows | Caída de precisión a medida que crece el contexto |
| `problem.cards.contextWipe.title` | The Context Wipe | La Limpieza de Contexto |
| `problem.cards.providerLockIn.title` | The Provider Lock-in Trap | La Trampa del Lock-in del Proveedor |
| `problem.filterLabels.all` | All problems | Todos los problemas |
| `problem.filterLabels.memory` | 🧠 Memory | 🧠 Memoria |

**All 12 Problem Cards:**
1. Context Wipe
2. Provider Lock-in Trap
3. Copy-Paste Tax
4. Middle Black Hole
5. Data Hostage
6. Enterprise Compliance Wall
7. AI Memory Surveillance
8. Local Model Gap
9. Identity Collapse
10. Developer Infrastructure Gap
11. Multi-AI Fragmentation
12. Conversation Context Decay

---

### 4. `solution` - Solution Section
**Keys:** ~10  
**Purpose:** How VIVIM solves the problems

| Key Path | English | Spanish |
|----------|---------|---------|
| `solution.title` | The Solution | La Solución |
| `solution.heading` | What If AI Could | ¿Y Si la IA Pudiera |
| `solution.highlight` | Truly Remember? | Realmente Recordar? |
| `solution.features.remembersEverything.title` | Remembers Everything | Lo Recuerda Todo |

---

### 5. `demos` - Demo Sections & Pages
**Keys:** ~50  
**Purpose:** Interactive demo titles, descriptions, UI strings

| Key Path | English | Spanish |
|----------|---------|---------|
| `demos.sectionBadge` | Try It Now | Pruébalo Ahora |
| `demos.sectionTitle` | Interactive Demos | Demos Interactivas |
| `demos.items.liveMemory.title` | Live Memory | Memoria en Vivo |
| `demos.common.backToHome` | Back to Home | Volver al Inicio |
| `demos.liveMemory.watchMemory` | Watch Memory Being Born | Mira la Memoria Nacer |
| `demos.liveMemory.send` | Send | Enviar |

**Demo Pages Covered:**
- Live Memory Demo
- Context Engine Demo
- Zero-Knowledge Privacy Demo
- Sovereign History Demo
- Decentralized Network Demo
- Secure Collaboration Demo
- Dynamic Intelligence Demo
- Rights Layer Demo
- Sentinel Detection Demo
- Marketplace Demo

---

### 6. `acus` - Atomic Chat Units Section
**Keys:** ~15  
**Purpose:** ACU explanation, problem/solution lists

| Key Path | English | Spanish |
|----------|---------|---------|
| `acus.sectionBadge` | Core Innovation | Innovación Central |
| `acus.problemTitle` | The Message Monolith Problem | El Problema del Monolito de Mensajes |
| `acus.solutionTitle` | VIVIM Atomic Chat Units | Unidades Atómicas de Chat VIVIM |
| `acus.problemItems[0]` | Messages stored as giant blocks... | Mensajes almacenados como bloques gigantes... |

---

### 7. `rightsLayer` - Rights Layer Section
**Keys:** ~30  
**Purpose:** 6 ownership tiers, TDASS, TPDI features

| Key Path | English | Spanish |
|----------|---------|---------|
| `rightsLayer.sectionBadge` | The Rights Layer | La Capa de Derechos |
| `rightsLayer.heading` | Your Data, | Tus Datos, |
| `rightsLayer.highlight` | Your Rules | Tus Reglas |
| `rightsLayer.tiers.t0.label` | Personal Only | Solo Personal |
| `rightsLayer.tiers.t3.label` | Co-Governed | Co-Governado |
| `rightsLayer.features.tdass.title` | TDASS Co-Governance | Co-gobernanza TDASS |

**Tier Labels:**
- T0: Personal Only
- T1: Personal-Likely
- T2: Shared-Possibly
- T3: Co-Governed
- T4: Restricted
- T5: Regulated

---

### 8. `sentinel` - Sentinel Detection Section
**Keys:** ~25  
**Purpose:** 13 detection algorithms, evidence features

| Key Path | English | Spanish |
|----------|---------|---------|
| `sentinel.sectionBadge` | The Sentinel | El Sentinel |
| `sentinel.heading` | Know If Your Data | Saber Si Tus Datos |
| `sentinel.algorithms[0]` | Spectral Membership Inference | Inferencia de Membresía Espectral |
| `sentinel.features.canary.title` | Canary System | Sistema Canary |

**13 Algorithms:**
1. Spectral Membership Inference
2. Mutual Information Estimation
3. Kolmogorov Uniqueness
4. Photon Counting
5. Interference Pattern
6. Canary Wave Function
7. Boltzmann Calibration
8. Holographic Watermarking
9. Thermodynamic Flow
10. Fisher Fingerprinting
11. Entanglement Testing
12. Diffraction Grating
13. Conservation Law

---

### 9. `marketplace` - Marketplace Section
**Keys:** ~30  
**Purpose:** 5-step process, revenue split, ZK proofs

| Key Path | English | Spanish |
|----------|---------|---------|
| `marketplace.sectionBadge` | The Marketplace | El Mercado |
| `marketplace.heading` | Monetize Your | Monetiza Tu |
| `marketplace.highlight` | Intelligence | Inteligencia |
| `marketplace.steps.step1.label` | List | Publicar |
| `marketplace.features.revenue.platform` | Platform (15%) | Plataforma (15%) |

---

### 10. `principles` - Philosophy Section
**Keys:** ~15  
**Purpose:** 6 core principles

| Key Path | English | Spanish |
|----------|---------|---------|
| `principles.sectionLabel` | Our Philosophy | Nuestra Filosofía |
| `principles.heading` | Sovereign AI Memory | Memoria de IA Soberana |
| `principles.items.sovereign.title` | Sovereign | Soberano |
| `principles.items.personal.title` | Personal | Personal |

**6 Principles:**
1. Sovereign
2. Personal
3. Provider Agnostic
4. Portable
5. Use-Case Agnostic
6. Dynamically Generated

---

### 11. `contextLayers` - 8-Layer System
**Keys:** ~25  
**Purpose:** L0-L7 layer descriptions

| Key Path | English | Spanish |
|----------|---------|---------|
| `contextLayers.sectionBadge` | The 8-Layer System | El Sistema de 8 Capas |
| `contextLayers.heading` | Intelligent Context Assembly | Ensamblaje Inteligente de Contexto |
| `contextLayers.layers.l0.label` | Identity Core | Núcleo de Identidad |
| `contextLayers.layers.l5.label` | JIT Retrieval | Recuperación JIT |
| `contextLayers.totalLabel` | Total Context Window: | Ventana de Contexto Total: |

**8 Layers:**
- L0: Identity Core (~300 tokens)
- L1: Global Preferences (~500 tokens)
- L2: Topic Context (~1,500 tokens)
- L3: Entity Context (~1,000 tokens)
- L4: Conversation Arc (~2,000 tokens)
- L5: JIT Retrieval (~2,500 tokens)
- L6: Message History (~3,500 tokens)
- L7: User Message (Variable)

---

### 12. `memoryTypes` - 9 Memory Types
**Keys:** ~30  
**Purpose:** Memory type names and examples

| Key Path | English | Spanish |
|----------|---------|---------|
| `memoryTypes.title` | 9 Types of | 9 Tipos de |
| `memoryTypes.highlight` | Human-Like Memory | Memoria Humana |
| `memoryTypes.types.episodic.name` | Episodic | Episódica |
| `memoryTypes.types.semantic.example` | "Python is your primary language" | "Python es tu lenguaje principal" |

**9 Types:**
1. Episodic
2. Semantic
3. Procedural
4. Factual
5. Preference
6. Identity
7. Relationship
8. Goal
9. Project

---

### 13. `developers` - Developer Section
**Keys:** ~10  
**Purpose:** SDK features, CTAs

| Key Path | English | Spanish |
|----------|---------|---------|
| `developers.sectionBadge` | For Developers | Para Desarrolladores |
| `developers.heading` | Build with | Construye con |
| `developers.highlight` | @vivim/sdk | @vivim/sdk |
| `developers.codeExample` | npm install @vivim/sdk | npm install @vivim/sdk |

---

### 14. `chat` - Chat Page
**Keys:** ~5  
**Purpose:** Chat header, footer, badges

| Key Path | English | Spanish |
|----------|---------|---------|
| `chat.header.title` | VIVIM Chat | Chat VIVIM |
| `chat.header.subtitle` | Powered by your personal memory | Impulsado por tu memoria personal |
| `chat.contextBadge` | Stub Context | Contexto de Prueba |
| `chat.footer` | VIVIM Assistant uses your personal context... | El Asistente VIVIM usa tu contexto personal... |

---

### 15. `components` - Reusable Components
**Keys:** ~15  
**Purpose:** SocialShare, Navbar, etc.

| Key Path | English | Spanish |
|----------|---------|---------|
| `components.socialShare.buttonLabel` | Share | Compartir |
| `components.socialShare.copied` | Copied! | ¡Copiado! |
| `components.navbar.github` | GitHub | GitHub |
| `components.navbar.liveMemoryDemo` | Live Memory Demo | Demo de Memoria en Vivo |

---

### 16. `scorecard` - Problem Scorecard Modal
**Keys:** ~12  
**Purpose:** Score dimensions, solution fit, gap analysis

| Key Path | English | Spanish |
|----------|---------|---------|
| `scorecard.pain` | Pain | Dolor |
| `scorecard.timeLost` | Time Lost | Tiempo Perdido |
| `scorecard.vivimSolution` | VIVIM Solution | Solución VIVIM |
| `scorecard.solutionFit` | Solution Fit: | Ajuste de Solución: |
| `scorecard.dimensionLabels.P` | Pain severity | Severidad del dolor |

---

## Coverage Summary

| Section | Keys | Status EN | Status ES |
|---------|------|-----------|-----------|
| common | 25 | ✅ | ✅ |
| hero | 8 | ✅ | ✅ |
| problem | 60 | ✅ | ✅ |
| solution | 10 | ✅ | ✅ |
| demos | 50 | ✅ | ✅ |
| acus | 15 | ✅ | ✅ |
| rightsLayer | 30 | ✅ | ✅ |
| sentinel | 25 | ✅ | ✅ |
| marketplace | 30 | ✅ | ✅ |
| principles | 15 | ✅ | ✅ |
| contextLayers | 25 | ✅ | ✅ |
| memoryTypes | 30 | ✅ | ✅ |
| developers | 10 | ✅ | ✅ |
| chat | 5 | ✅ | ✅ |
| components | 15 | ✅ | ✅ |
| scorecard | 12 | ✅ | ✅ |
| **Total** | **~400** | **✅** | **✅** |

---

## Next Steps

1. **Wire up translations in code** - Replace remaining hardcoded strings with `t()` calls
2. **Add type safety** - Create TypeScript types for translation keys
3. **Add formatters** - Implement locale-aware number/date/currency formatting
4. **RTL support** - Add Arabic (ar) locale with RTL layout support
5. **SEO** - Add hreflang tags and locale sitemaps

---

## Usage Example

```tsx
import { useTranslations } from 'next-intl';

export function MyComponent() {
  const t = useTranslations('problem');
  
  return (
    <div>
      <Badge>{t('sectionBadge')}</Badge>
      <h2>
        {t('sectionHeading')}
        <span>{t('sectionHighlight')}</span>
      </h2>
      <p>{t('sectionDescription')}</p>
      
      {/* Nested access */}
      <p>{t('cards.contextWipe.title')}</p>
      <p>{t('cards.contextWipe.hook')}</p>
      
      {/* Array access */}
      {t.raw('sentinel.algorithms').map((algo, i) => (
        <div key={i}>{algo}</div>
      ))}
    </div>
  );
}
```

---

## File Locations Requiring Updates

| File | Hardcoded Strings | Priority |
|------|-------------------|----------|
| `src/app/[locale]/page.tsx` | Problem section, ACUs, Rights Layer, Sentinel, Marketplace | P0 |
| `src/app/chat/page.tsx` | Header, footer, badges | P0 |
| `src/app/demos/*/page.tsx` | All 10 demo pages | P0 |
| `src/components/SocialShare.tsx` | Share buttons, labels | P1 |
| `src/components/navbar.tsx` | GitHub dropdown items | P1 |

---

**Document Status:** ✅ Complete Inventory  
**Last Updated:** April 1, 2026
