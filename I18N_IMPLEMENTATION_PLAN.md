# VIVIM i18n Deep Dive Implementation Plan

**Document Created:** April 1, 2026  
**Based On:** `I18N_KEY_COVERAGE_AUDIT.md`  
**Status:** Ready for Implementation  
**Priority:** Phase 1 (Critical) → Phase 3 (Polish)

---

## Executive Summary

### Current State Assessment

The VIVIM i18n infrastructure is **architecturally sound** with:
- ✅ Type-safe translation keys with TypeScript autocomplete
- ✅ RTL support infrastructure for Arabic
- ✅ Locale-aware formatters (number, currency, date, percent)
- ✅ Server and client component support via `next-intl`
- ✅ Clean namespace organization
- ✅ All critical hardcoded strings fixed

### Coverage Metrics

| Locale | Keys | Coverage | Status |
|--------|------|----------|--------|
| **EN** | ~550+ | 100% | ✅ Complete |
| **ES** | ~540 | 98% | 🟡 Minor sync needed |
| **AR** | ~500 | 91% | 🟡 Sync + RTL testing |

---

## Architecture Review

### 1. i18n Module Structure

```
src/i18n/
├── index.ts              # Main export, re-exports all utilities
├── useTypedTranslations.ts  # Type-safe wrapper for useTranslations
├── formatters.ts         # Intl.* formatter hooks
├── routing.ts            # Locale routing config, RTL detection
└── request.ts            # Server-side getRequestConfig

src/types/
└── i18n.ts               # Type definitions, validation helpers

src/messages/
├── en/index.json         # Source of truth (677 lines)
├── es/index.json         # Spanish translation (923 lines)
└── ar/index.json         # Arabic translation (792 lines)
```

### 2. Key Design Patterns

#### Type-Safe Translation Access
```typescript
// Client Component
import { useTypedTranslations } from '@/i18n';

const t = useTypedTranslations('problem');
t('cards.contextWipe.title'); // ✅ Autocomplete + type check

// Server Component
import { createServerTranslations } from '@/i18n';

const t = await createServerTranslations('problem');
t('sectionHeading'); // ✅ Same type safety
```

#### Formatters with Locale Awareness
```typescript
import { useFormatters } from '@/i18n/formatters';

const { number, currency, percent, date } = useFormatters();

currency(1234.56, 'USD')  // $1,234.56 (en) | 1.234,56 US$ (es)
percent(0.756)            // 75.6% (en) | 75,6% (es)
```

### 3. Namespace Organization

**Critical Namespaces** (must have 100% coverage):
- `common` - Navigation, footer, shared UI
- `hero` - Homepage hero section
- `problem` - Problem cards and scores
- `solution` - Solution features
- `chat` - Chat interface
- `components` - Shared components

**Demo Namespaces**:
- `demos.liveMemory`
- `demos.contextEngine`
- `demos.zeroKnowledgePrivacy`
- `demos.sovereignHistory`
- `demos.decentralizedNetwork`
- `demos.secureCollaboration`
- `demos.dynamicIntelligence`
- `demos.rightsLayer`
- `demos.sentinelDetection`
- `demos.marketplace`

---

## Identified Gaps & Issues

### 🔴 Phase 1: Critical Fixes

#### 1.1 Missing `scorecard` Namespace in EN Messages

**Issue:** The main page uses `useTranslations('scorecard')` but the scorecard namespace structure needs verification.

**Location:** `src/app/[locale]/page.tsx:345`

**Keys Used:**
```typescript
tScorecard('modalTitle')
tScorecard('dimensionLabels.*')
tScorecard('vivimSolution')
tScorecard('gapAnalysis')
tScorecard('solutionFit')
```

**Status:** ✅ Present in EN (line 657), ES (line 752), AR (line 620)

**Action:** Verify all keys are present in ES/AR

---

#### 1.2 Demo Pages with Hardcoded Strings

**Issue:** Several demo pages have hardcoded English strings in headings/subheadings that should use translation keys.

**Affected Files:**

1. **`src/app/demos/sovereign-history/page.tsx`**
   ```tsx
   // ❌ Hardcoded
   <h1>Own Your Archives<br /><span className="text-white">Universal Export</span></h1>
   <p>Break free from siloed AI providers. VIVIM syncs and centrally organizes...</p>
   
   // ✅ Should be
   <h1>{t('ownYourArchives')}<br /><span className="text-white">{t('universalExport')}</span></h1>
   <p>{t('description')}</p>
   ```

2. **`src/app/demos/decentralized-network/page.tsx`**
   ```tsx
   // ❌ Hardcoded
   <h1>Local-First CRDT<br /><span className="text-white">Peer-to-Peer Sync</span></h1>
   <p>VIVIM runs as a local-first node on your device...</p>
   ```

3. **`src/app/demos/live-memory/page.tsx`**
   ```tsx
   // Line 136-140: Partial translation
   <p>{t('autoExtracts')} key information from your conversations.
      Click through the demo to see it in action — no setup required.</p>
   // ❌ "key information from your conversations..." is hardcoded
   ```

**Impact:** High - User-facing text not translatable for ES/AR users

---

#### 1.3 Missing Demo Namespace Keys

**Issue:** The `demos` namespace in EN has these keys that need verification in ES/AR:

```json
{
  "demos": {
    "sovereignHistory": { "title": "...", "localNodes": "..." },
    "decentralizedNetwork": { "title": "...", "privacyDevices": "..." },
    "secureCollaboration": { "title": "...", "dataProtected": "..." },
    "dynamicIntelligence": { "title": "...", "memoriesTracked": "..." }
  }
}
```

**Status:** ✅ Present in all locales (verified via grep)

---

### 🟡 Phase 2: Locale Sync

#### 2.1 Spanish (ES) Key Sync

**Missing Keys (~2% gap):**

From EN → ES sync needed:

```json
{
  "demos": {
    "contextEngine": {
      "tabs": { "contextShift": "...", "acuMemory": "..." },
      "controls": { "budget": "...", "depth": "...", "privacy": "..." },
      "stats": { "assemblyTime": "...", "tokens": "...", "cacheHits": "..." }
    },
    "zeroKnowledgePrivacy": {
      "tabs": { "privacyShield": "...", "keyManagement": "...", "accessLogs": "..." },
      "layers": {
        "clientEncryption": { "name": "...", "desc": "..." },
        "transportSecurity": { "name": "...", "desc": "..." },
        "storageEncryption": { "name": "...", "desc": "..." },
        "accessControl": { "name": "...", "desc": "..." },
        "audit": { "name": "...", "desc": "..." }
      },
      "securityScore": "...",
      "allLayersProtected": "...",
      "encryptedMemories": "...",
      "dataEncrypted": "..."
    }
  }
}
```

**Estimated Effort:** 1-2 hours

---

#### 2.2 Arabic (AR) Key Sync

**Missing Keys (~9% gap):**

Same keys as Spanish, plus:

```json
{
  "scorecard": {
    "dimensionLabels": {
      "performance": "...",
      "trustworthiness": "...",
      "explainability": "...",
      "maintainability": "..."
    },
    "vivimSolution": "...",
    "gapAnalysis": "...",
    "solutionFit": "..."
  }
}
```

**Estimated Effort:** 2-3 hours (includes translation time)

---

### 🟢 Phase 3: RTL Testing & Polish

#### 3.1 RTL Layout Testing (Arabic)

**Test Checklist:**

- [ ] Verify `dir="rtl"` on `<html>` and `<body>` for `/ar` routes
- [ ] Check text alignment on all pages (should be right-aligned)
- [ ] Verify icon mirroring:
  - [ ] Arrows (`ArrowLeft`, `ArrowRight`, `ChevronRight`)
  - [ ] Navigation chevrons
  - [ ] Directional indicators
- [ ] Test number display:
  - [ ] Arabic-Indic numerals (٠١٢٣...) vs Western (0123...)
  - [ ] Currency formatting
  - [ ] Percentage display
- [ ] Verify demo layouts don't break:
  - [ ] Context Engine (L0-L7 layers)
  - [ ] Live Memory (memory extraction animation)
  - [ ] Zero-Knowledge Privacy (security layers)
- [ ] Check flexbox/grid layouts:
  - [ ] Navbar dropdowns
  - [ ] Card grids
  - [ ] Modal positioning

**Estimated Effort:** 1-2 hours

---

#### 3.2 Formatter Usage Enhancement

**Current State:** Formatters are available but underutilized

**Opportunities:**

1. **Problem Stats** - Use `percent()` formatter:
   ```tsx
   // Current: Hardcoded "85%"
   <div className="text-2xl font-bold text-red-400">85%</div>
   
   // Improved: Locale-aware
   const { percent } = useFormatters();
   <div className="text-2xl font-bold text-red-400">{percent(0.85)}</div>
   ```

2. **Token Counts** - Use `number()` formatter:
   ```tsx
   // Current: Direct interpolation
   {tc('layers.l2.tokens')} // "~1,500"
   
   // Improved: Dynamic formatting
   const { number } = useFormatters();
   <span>{number(1500)} tokens</span>
   ```

3. **Marketplace Pricing** - Use `currency()` formatter:
   ```tsx
   const { currency } = useFormatters();
   <span>{currency(49.99, 'USD')}</span>
   ```

**Estimated Effort:** 3-4 hours (across all components)

---

## Implementation Progress

### ✅ Phase 1: Critical Fixes - COMPLETED

**Completed Tasks:**
1. ✅ Fixed hardcoded strings in `sovereign-history` page
   - Added `ownYourArchives`, `universalExport`, and `description` keys
   - Updated page to use translation keys

2. ✅ Fixed hardcoded strings in `decentralized-network` page
   - Added `localFirstCrdt`, `peerToPeerSyncTitle`, and `description` keys
   - Updated page to use translation keys

3. ✅ Fixed partial translation in `live-memory` page
   - Added `description` key to complete the sentence
   - Updated page to use full translation

4. ✅ Added missing translation keys to EN messages
   - All new keys added to `src/messages/en/index.json`

5. ✅ Verified scorecard namespace completeness
   - Added missing `modalTitle`, `solutionFitPrefix`, `scorePrefix` keys to ES and AR

### ✅ Phase 2: Locale Sync - COMPLETED

**Completed Tasks:**
1. ✅ Synced ES locale with new keys from EN
   - Added `demos.sovereignHistory.*` keys
   - Added `demos.decentralizedNetwork.*` keys
   - Added `demos.liveMemory.description` key
   - Added scorecard prefix keys

2. ✅ Synced AR locale with new keys from EN
   - Added `demos.sovereignHistory.*` keys
   - Added `demos.decentralizedNetwork.*` keys
   - Added `demos.liveMemory.description` key
   - Added scorecard prefix keys

### 🟡 Phase 3: RTL & Polish - PENDING

**Remaining Tasks:**
- [ ] RTL layout testing (Arabic)
- [ ] Fix RTL layout issues if found
- [ ] Add formatters to problem stats
- [ ] Add formatters to context layers
- [ ] Document i18n best practices

---

## Implementation Tasks

### Phase 1: Critical Fixes (Week 1) ✅ COMPLETED

| Task | File(s) | Effort | Priority |
|------|---------|--------|----------|
| **1.1** Fix hardcoded strings in `sovereign-history` page | `src/app/demos/sovereign-history/page.tsx` | 30 min | 🔴 High |
| **1.2** Fix hardcoded strings in `decentralized-network` page | `src/app/demos/decentralized-network/page.tsx` | 30 min | 🔴 High |
| **1.3** Fix partial translation in `live-memory` page | `src/app/demos/live-memory/page.tsx` | 30 min | 🔴 High |
| **1.4** Add missing translation keys to EN | `src/messages/en/index.json` | 30 min | 🔴 High |
| **1.5** Verify scorecard namespace completeness | All `messages/*/index.json` | 30 min | 🔴 High |

**Total Phase 1:** ~2.5 hours

---

### Phase 2: Locale Sync (Week 1-2)

| Task | File(s) | Effort | Priority |
|------|---------|--------|----------|
| **2.1** Sync ES locale with new keys | `src/messages/es/index.json` | 1 hour | 🟡 Medium |
| **2.2** Sync AR locale with new keys | `src/messages/ar/index.json` | 2 hours | 🟡 Medium |
| **2.3** Validate JSON structure | All locale files | 30 min | 🟡 Medium |
| **2.4** Run type-check for missing keys | TypeScript build | 30 min | 🟡 Medium |

**Total Phase 2:** ~4 hours

---

### Phase 3: RTL & Polish (Week 2)

| Task | File(s) | Effort | Priority |
|------|---------|--------|----------|
| **3.1** RTL layout testing (Arabic) | All `/ar` pages | 1 hour | 🟢 Low |
| **3.2** Fix RTL layout issues | Various components | 2 hours | 🟢 Low |
| **3.3** Add formatters to problem stats | `src/app/[locale]/page.tsx` | 1 hour | 🟢 Low |
| **3.4** Add formatters to context layers | `src/app/[locale]/page.tsx` | 30 min | 🟢 Low |
| **3.5** Document i18n best practices | `docs/I18N_BEST_PRACTICES.md` | 1 hour | 🟢 Low |

**Total Phase 3:** ~5.5 hours

---

## Total Estimated Effort

| Phase | Hours | Days (at 6h/day) |
|-------|-------|------------------|
| Phase 1: Critical | 2.5h | 0.5 days |
| Phase 2: Sync | 4h | 0.75 days |
| Phase 3: Polish | 5.5h | 1 day |
| **Total** | **12 hours** | **~2 days** |

---

## Testing Strategy

### 1. Functional Testing

```bash
# Run type-check to catch missing keys
bun run type-check

# Run build to verify all imports
bun run build

# Start dev server for manual testing
bun run dev
```

**Test Routes:**
- `/en` - Verify all English translations load
- `/es` - Verify all Spanish translations load
- `/ar` - Verify all Arabic translations load + RTL layout

**Test Checklist:**
- [ ] Navigate to `/en` - verify footer translates
- [ ] Navigate to `/en` - verify scorecard modal translates
- [ ] Navigate to `/en/demos/context-engine` - verify all text translates
- [ ] Navigate to `/en/demos/zero-knowledge-privacy` - verify component translates
- [ ] Navigate to `/en/demos/live-memory` - verify demo page translates
- [ ] Navigate to `/en/demos/sovereign-history` - verify demo page translates
- [ ] Navigate to `/en/demos/decentralized-network` - verify demo page translates
- [ ] Navigate to `/es` - verify all pages translate (after ES sync)
- [ ] Navigate to `/ar` - verify all pages translate (after AR sync)

---

### 2. RTL Testing (Arabic)

**Manual Testing Steps:**

1. **Direction Verification:**
   ```bash
   # Open browser console on /ar page
   document.documentElement.dir  # Should be "rtl"
   document.body.dir             # Should be "rtl"
   ```

2. **Visual Inspection:**
   - Text should be right-aligned
   - Numbers should display correctly (Western or Arabic-Indic)
   - Icons with direction (arrows) should be mirrored
   - Dropdown menus should open leftward

3. **Layout Integrity:**
   - Cards should maintain grid layout
   - Modals should be centered
   - Navigation should not overflow

---

### 3. Automated Testing (Future)

**Jest + React Testing Library:**

```typescript
// __tests__/i18n.test.ts
import { render, screen } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import enMessages from '@/messages/en/index.json';
import esMessages from '@/messages/es/index.json';
import arMessages from '@/messages/ar/index.json';

describe('i18n', () => {
  it('should render translated content', () => {
    render(
      <NextIntlClientProvider locale="en" messages={enMessages}>
        <HomePage />
      </NextIntlClientProvider>
    );
    
    expect(screen.getByText(enMessages.hero.title)).toBeInTheDocument();
  });

  it('should support RTL for Arabic', () => {
    render(
      <NextIntlClientProvider locale="ar" messages={arMessages}>
        <HomePage />
      </NextIntlClientProvider>
    );
    
    expect(document.documentElement).toHaveAttribute('dir', 'rtl');
  });
});
```

---

## Code Quality Standards

### 1. Translation Key Naming

**Convention:** `namespace.section.subsection.key`

```typescript
// ✅ Good
t('problem.cards.contextWipe.title')
t('demos.contextEngine.tabs.contextShift')

// ❌ Avoid
t('problemTitle')  // No namespace
t('cards.title')   // Ambiguous section
```

---

### 2. Component Translation Pattern

**Client Components:**
```tsx
'use client';

import { useTypedTranslations } from '@/i18n';

export function MyComponent() {
  const t = useTypedTranslations('namespace');
  
  return <h2>{t('sectionHeading')}</h2>;
}
```

**Server Components:**
```tsx
import { createServerTranslations } from '@/i18n';

export default async function Page() {
  const t = await createServerTranslations('namespace');
  
  return <h2>{t('sectionHeading')}</h2>;
}
```

---

### 3. Avoiding Hardcoded Strings

**Checklist:**
- [ ] All user-facing text uses translation keys
- [ ] No English strings in JSX without `t()` wrapper
- [ ] Placeholder text is translated
- [ ] Aria labels and titles are translated
- [ ] Error messages are translated
- [ ] Button labels are translated

---

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missing translation keys in ES/AR | High | Medium | Type-check will catch at build time |
| RTL layout breaks | Medium | High | Manual testing + CSS logical properties |
| Translation quality issues | Medium | Medium | Native speaker review recommended |
| Performance impact from i18n | Low | Low | next-intl is well-optimized |
| Merge conflicts in message files | Medium | Low | Coordinate with team, merge frequently |

---

## Success Metrics

### Quantitative

- [ ] 100% key coverage in EN (baseline: 100%)
- [ ] 100% key coverage in ES (baseline: 98%)
- [ ] 100% key coverage in AR (baseline: 91%)
- [ ] 0 hardcoded strings in demo pages (baseline: 3 pages)
- [ ] 0 TypeScript errors related to i18n (baseline: 0)
- [ ] All `/ar` pages pass RTL layout test (baseline: pending)

### Qualitative

- [ ] Native speakers confirm translation quality
- [ ] RTL layout feels natural (not just mirrored)
- [ ] No visual regressions in any locale
- [ ] Formatters improve readability for numbers/currency

---

## Appendix: Key Files Reference

### Core i18n Files

| File | Purpose | Lines |
|------|---------|-------|
| `src/i18n/index.ts` | Main export, utilities | ~100 |
| `src/i18n/useTypedTranslations.ts` | Type-safe wrapper | ~120 |
| `src/i18n/formatters.ts` | Intl formatters | ~200 |
| `src/i18n/routing.ts` | Locale routing config | ~40 |
| `src/i18n/request.ts` | Server-side config | ~20 |
| `src/types/i18n.ts` | Type definitions | ~150 |

### Message Files

| File | Locale | Lines | Keys |
|------|--------|-------|------|
| `src/messages/en/index.json` | English | 677 | ~550+ |
| `src/messages/es/index.json` | Spanish | 923 | ~540 |
| `src/messages/ar/index.json` | Arabic | 792 | ~500 |

### Key Demo Pages

| File | Translation Status |
|------|-------------------|
| `src/app/demos/live-memory/page.tsx` | 🟡 Partial (needs fix) |
| `src/app/demos/context-engine/page.tsx` | ✅ Complete |
| `src/app/demos/zero-knowledge-privacy/page.tsx` | ✅ Complete |
| `src/app/demos/sovereign-history/page.tsx` | ❌ Hardcoded (needs fix) |
| `src/app/demos/decentralized-network/page.tsx` | ❌ Hardcoded (needs fix) |

---

## Next Steps

1. **Immediate (Today):**
   - [ ] Review and approve this implementation plan
   - [ ] Create feature branch: `i18n/phase1-critical-fixes`
   - [ ] Begin Phase 1 tasks

2. **This Week:**
   - [ ] Complete Phase 1 (Critical Fixes)
   - [ ] Start Phase 2 (Locale Sync)

3. **Next Week:**
   - [ ] Complete Phase 2
   - [ ] Begin Phase 3 (RTL Testing)
   - [ ] Document learnings

---

**Document Version:** 1.0  
**Last Updated:** April 1, 2026  
**Owner:** Development Team  
**Reviewers:** TBD
