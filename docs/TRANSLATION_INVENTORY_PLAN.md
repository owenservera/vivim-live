# VIVIM Translation Inventory & Implementation Plan

## Executive Summary

This document outlines the comprehensive plan to identify all untranslated English strings across the VIVIM website and systematically add translation keys for full i18n support.

**Current Status:**
- Main landing page (`[locale]/page.tsx`): ~70% translated
- Demo pages (10 pages): 0% translated
- Components: Partial translation coverage
- Total estimated untranslated strings: 500+

---

## Phase 1: Audit & Inventory

### 1.1 Files Requiring Translation

#### A. Main Landing Page (`src/app/[locale]/page.tsx`)
**Status: Partial** — Many sections translated, but some areas remain:

| Section | Status | Notes |
|---------|--------|-------|
| Hero | ✅ Translated | Using `hero` namespace |
| Providers | ✅ Translated | Using `providers` namespace |
| Problem | ✅ Translated | Using `problem` namespace |
| Solution | ✅ Translated | Using `solution` namespace |
| Demos | ✅ Translated | Using `demos` namespace |
| ACUs | ✅ Translated | Using `acus` namespace |
| **Footer** | ❌ Not translated | Hardcoded: "Your memory. Your rules...", "GitHub", "Discord", "Docs", "© 2026 VIVIM..." |
| **Scorecard Dialog** | ❌ Not translated | Hardcoded: "Pain", "Time Lost", "Trust Erosion", "Market Size", "VIVIM Solution", "Gap Analysis" |
| Principles | ❌ Not translated | Uses static array `PRINCIPLES` with hardcoded English |
| Context Layers | ❌ Not translated | Uses static `LAYER_DATA` array with hardcoded English |
| Memory Types | ❌ Not translated | Uses static `MEMORY_TYPES` array with hardcoded English |
| Developers | ❌ Not translated | Hardcoded: "Identity & DIDs", "Context Engine", etc. |

**Untranslated strings in page.tsx (~80 strings):**
- Footer: tagline, philosophy, nav links (GitHub, Discord, Docs), copyright
- Dialog: scorecard labels, dimension labels
- Static data: PRINCIPLES array, LAYER_DATA array, MEMORY_TYPES array, PROVIDERS array, DEMOS array, PROBLEMS array

#### B. Demo Pages (`src/app/[locale]/demos/*/page.tsx`)
**Status: 0% translated** — All 10 demo pages have entirely hardcoded English:

| Page | File | Strings Count |
|------|------|----------------|
| Live Memory | `live-memory/page.tsx` | ~45 strings |
| Context Engine | `context-engine/page.tsx` | ~60 strings |
| Zero-Knowledge Privacy | `zero-knowledge-privacy/page.tsx` | ~50 strings |
| Sovereign History | `sovereign-history/page.tsx` | ~35 strings |
| Decentralized Network | `decentralized-network/page.tsx` | ~35 strings |
| Secure Collaboration | `secure-collaboration/page.tsx` | ~30 strings |
| Dynamic Intelligence | `dynamic-intelligence/page.tsx` | ~30 strings |
| Rights Layer | `rights-layer/page.tsx` | ~40 strings |
| Sentinel Detection | `sentinel-detection/page.tsx` | ~40 strings |
| Marketplace | `marketplace/page.tsx` | ~35 strings |

**Total demo pages: ~400 untranslated strings**

**Example from live-memory/page.tsx:**
```tsx
// Hardcoded strings that need translation:
"Back to Home"
"Live Memory Demo"
"Watch Memory Being Born"
"VIVIM automatically extracts..."
"Click through the demo..."
"VIVIM Demo Chat"
"Send"
"Memory full — reload to restart"
"Live Memory Extraction"
"Memories will appear as you chat"
"Context Engine Demo"
"Want to see how the context engine works?"
```

#### C. Components
**Status: Partial** — Some components need investigation:

| Component | File | Status | Notes |
|-----------|------|--------|-------|
| Navbar | `components/navbar.tsx` | Needs review | Section labels likely hardcoded |
| LanguageSwitcher | `components/LanguageSwitcher.tsx` | ✅ OK | Labels in component |
| FloatingChat | `components/floating-chat.tsx` | Needs review | Chat UI strings |

---

## Phase 2: Translation Key Structure

### 2.1 Current Namespace Structure

The existing `src/messages/en/index.json` contains:
```
common
  nav.github, nav.discord, nav.demos
  cta.tryLiveDemo, cta.viewOnGithub
  footer.tagline, footer.philosophy, footer.copyright
hero
  tagline, title, titleHighlight, description, quote, descriptionExtended
providers
  title, description, logos.*
problem
  sectionBadge, sectionHeading, sectionHighlight, sectionDescription
  stats.*, sources.*, cards.* (12 problem cards)
solution
  sectionBadge, heading, highlight, description, cta, features.*
acus
  sectionBadge, title, description, descriptionExtended
  problemTitle, solutionTitle, problemItems[], solutionItems[]
rightsLayer
  title, sectionBadge, heading, highlight, description
  tiers.t0-t5 (labels, descriptions)
  features.tdass.*, features.tpdi.*
sentinel
  title, sectionBadge, heading, highlight, description
  algorithms[] (13 items)
  features.canary.*, features.evidence.*
marketplace
  title, sectionBadge, heading, highlight, description
  steps.step1-step5 (labels, descriptions)
  features.revenue.*, features.zkProofs.*
principles
  sectionLabel, heading, highlight, description, descriptionExtended
  items.sovereign.*, items.personal.*, etc.
contextLayers
  sectionBadge, heading, description
  layers.l0-l7 (labels, desc, tokens)
  totalLabel, totalTokens
memoryTypes
  title, highlight, description
  types.* (9 memory types)
developers
  sectionBadge, heading, highlight, description, descriptionExtended
  features.* (4 features)
  codeExample
demos
  title, sectionBadge, sectionTitle, sectionDescription, description
  items.* (10 demo items)
  common.*, liveMemory.*, contextEngine.*, etc.
footer
  tagline, philosophy, github, discord, docs
chat
  header.*, contextBadge, footer
scorecard
  pain, timeLost, trustErosion, marketSize
  vivimSolution, solutionFit, gapAnalysis, score
  modalTitle, solutionFitPrefix, scorePrefix, dimensionLabels.*
```

### 2.2 Required Additions

**New namespaces needed:**

1. **demosLiveMemory** - Live Memory demo page
2. **demosContextEngine** - Context Engine demo page
3. **demosZeroKnowledge** - Zero-Knowledge demo page
4. **demosSovereignHistory** - Sovereign History demo page
5. **demosDecentralizedNetwork** - Decentralized Network demo page
6. **demosSecureCollaboration** - Secure Collaboration demo page
7. **demosDynamicIntelligence** - Dynamic Intelligence demo page
8. **demosRightsLayer** - Rights Layer demo page
9. **demosSentinelDetection** - Sentinel Detection demo page
10. **demosMarketplace** - Marketplace demo page

**Extensions to existing namespaces:**
- `common` - Add footer links, navbar items
- `scorecard` - Add dialog labels
- `footer` - Already exists but may need additions

---

## Phase 3: Implementation Roadmap

### 3.1 Priority Order

```
Phase 3A: Quick Wins (1-2 hours)
├── Fix footer on main page (6 strings)
├── Fix scorecard dialog (10 strings)
└── Add translations to navbar section labels

Phase 3B: Main Page Complete (3-4 hours)
├── Convert PRINCIPLES static array to translation keys
├── Convert LAYER_DATA static array to translation keys
├── Convert MEMORY_TYPES static array to translation keys
├── Convert PROVIDERS static array (names only)
└── Convert DEMOS static array (titles/descriptions)

Phase 3C: Demo Pages (8-16 hours)
├── Live Memory Demo (~45 strings)
├── Context Engine Demo (~60 strings)
├── Zero-Knowledge Privacy Demo (~50 strings)
├── Sovereign History Demo (~35 strings)
├── Decentralized Network Demo (~35 strings)
├── Secure Collaboration Demo (~30 strings)
├── Dynamic Intelligence Demo (~30 strings)
├── Rights Layer Demo (~40 strings)
├── Sentinel Detection Demo (~40 strings)
└── Marketplace Demo (~35 strings)

Phase 3D: Component Cleanup (2-3 hours)
├── Review Navbar component
├── Review FloatingChat component
└── Any other components with strings
```

### 3.2 Technical Approach

**For static data arrays (PRINCIPLES, LAYER_DATA, etc.):**

Option 1: Move data to translation files
```json
// In messages/en/index.json
"principles": {
  "items": {
    "sovereign": { "title": "Sovereign", "desc": "..." },
    "personal": { "title": "Personal", "desc": "..." }
  }
}
```

Option 2: Keep arrays in code, translate individual fields
```tsx
// In page.tsx
const principleKeys = ['sovereign', 'personal', 'providerAgnostic', ...];
{principleKeys.map((key) => (
  <div>
    <h3>{principles(`items.${key}.title`)}</h3>
    <p>{principles(`items.${key}.desc`)}</p>
  </div>
))}
```

**Recommended: Option 2** - Keeps type safety and easier maintenance

**For demo pages:**
Each demo page should get its own namespace:
```tsx
const t = useTypedTranslations('demosLiveMemory');
// or reuse from main demos namespace
const t = useTypedTranslations('demos');
```

---

## Phase 4: Translation Files

### 4.1 English (Source of Truth)

All English translations exist in `src/messages/en/index.json`. This is the source of truth.

### 4.2 Spanish (`es`)

Exists at `src/messages/es/index.json` with full translations (~683 lines).

**Coverage:** Complete for most namespaces. May need additions for new keys.

### 4.3 Arabic (`ar`)

Exists at `src/messages/ar/index.json`.

**Coverage:** Should be reviewed after English keys are finalized.

---

## Phase 5: Testing & Validation

### 5.1 Manual Testing Checklist

- [ ] Visit `/en` - All strings should be English
- [ ] Visit `/es` - All strings should be Spanish
- [ ] Visit `/ar` - All strings should be Arabic, layout should be RTL
- [ ] Language switcher works on all pages
- [ ] Demo pages work in all 3 languages
- [ ] No console errors related to missing translation keys

### 5.2 Automated Validation

Add a script to detect missing keys:
```typescript
// Pseudo-code for validation script
const enKeys = getAllKeys(enMessages);
const esKeys = getAllKeys(esMessages);
const missing = enKeys.filter(k => !esKeys.includes(k));
console.log('Missing Spanish keys:', missing);
```

---

## Appendix: String Count Summary

| Area | Untranslated Strings | Priority |
|------|---------------------|----------|
| Main page footer | ~10 | P0 |
| Main page scorecard | ~15 | P0 |
| Main page static arrays | ~50 | P1 |
| Demo: Live Memory | ~45 | P2 |
| Demo: Context Engine | ~60 | P2 |
| Demo: Zero-Knowledge | ~50 | P2 |
| Demo: Other 7 demos | ~210 | P2 |
| Components | ~20 | P3 |
| **TOTAL** | **~460** | |

---

## Next Steps

1. **Immediate**: Fix footer and scorecard on main page (P0)
2. **This session**: Complete main page static data translation (P1)
3. **Next session**: Begin demo page translations (P2)
4. **Ongoing**: Add new translation keys as new content is created

---

*Generated: April 2026*
*Last updated: 2026-04-01*