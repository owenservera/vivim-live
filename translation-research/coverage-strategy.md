# Translation Coverage Strategy - VIVIM Website

## Objective
Achieve 100% translation coverage for all user-facing text across the VIVIM website.

---

## Phase 1: Audit - Missing Translation Detection

### 1.1 Hardcoded Text Categories Identified

The following categories of hardcoded text were found in `src/app/[locale]/page.tsx`:

#### A. Problem Section (Lines 500-690)
```
- Stat labels: "Accuracy drop as context grows", "Frontier models degrade with context", "Vector DB market validates the problem"
- Card titles: "The Context Wipe", "The Provider Lock-in Trap", "The Copy-Paste Tax", "The Middle Black Hole"
- Card hooks: "AI forgets everything, every session", etc.
- Card stats and descriptions
- Category badges: "🧠 Memory", "🔄 Portability", "🛡️ Trust", "⚙️ Developer"
- Buttons: "Explore all 12 problems", "How VIVIM solves this", "View scores →", "Open Full Scorecard"
- Filter labels: "All problems", "Memory", "Portability", "Trust & Sovereignty", "Developer"
```

#### B. Solution Section
- Section headings, descriptions
- Feature titles and descriptions

#### C. Demo Cards
- All 10 demo titles and descriptions

#### D. ACU Section
- Layer names and descriptions
- Problem/Solution bullet points

#### E. Rights Layer Section
- Tier labels and descriptions
- Feature descriptions

#### F. Sentinel Section
- Algorithm names (13 items)
- Feature descriptions

#### G. Marketplace Section
- Step labels
- Feature descriptions

#### H. Principles Section
- All 6 principle titles and descriptions

#### I. Context Layers Section
- All 8 layer names, labels, descriptions

#### J. Memory Types Section
- All 9 memory type names and examples

#### K. Developers Section
- Feature titles and descriptions
- Code example

#### L. Footer
- All footer text

---

## Phase 2: Translation File Structure Update

### 2.1 Updated Translation Keys Structure

```json
{
  "common": {
    "nav": { "github", "discord", "docs" },
    "cta": { "tryLiveDemo", "viewOnGithub" },
    "footer": { "tagline", "philosophy", "copyright" },
    "ui": {
      "learnMore": "Learn more",
      "viewAll": "View all",
      "comingSoon": "Coming soon",
      "rank": "Rank #"
    }
  },
  "hero": { /* Already done */ },
  "providers": { /* Already done */ },
  "problem": {
    "title": "The Problem",
    "heading": "Every AI Conversation",
    "highlight": "Starts Broken",
    "description": "...",
    "stats": {
      "accuracyDrop": "Accuracy drop as context grows",
      "frontierModels": "Frontier models degrade with context",
      "vectorMarket": "Vector DB market validates the problem"
    },
    "cards": {
      "contextWipe": { "title", "hook", "stat", "desc" },
      "providerLockIn": { "title", "hook", "stat", "desc" },
      "copyPasteTax": { "title", "hook", "stat", "desc" },
      "middleBlackHole": { "title", "hook", "stat", "desc" }
    },
    "exploreAll": "Explore all 12 problems",
    "howVivimSolves": "How VIVIM solves this",
    "viewScores": "View scores →",
    "openScorecard": "Open Full Scorecard",
    "categories": {
      "all": "All problems",
      "memory": "🧠 Memory",
      "portability": "🔄 Portability", 
      "trust": "🛡️ Trust",
      "developer": "⚙️ Developer"
    }
  },
  "solution": { /* Already done */ },
  "demos": { /* Already done */ },
  "acus": {
    "title": "Atomic Chat Units",
    "description": "...",
    "totalContext": "Total Context Window",
    "problem": { "title", "items": [] },
    "solution": { "title", "items": [] }
  },
  "rightsLayer": {
    "title": "The Rights Layer",
    "heading": "Your Data,",
    "highlight": "Your Rules",
    "description": "...",
    "tiers": {
      "t0": { "label", "desc" },
      "t1": { "label", "desc" },
      "t2": { "label", "desc" },
      "t3": { "label", "desc" },
      "t4": { "label", "desc" },
      "t5": { "label", "desc" }
    },
    "features": {
      "tdass": { "title", "desc", "activePeriod", "sunset", "postSunset" },
      "tpdi": { "title", "desc", "flow" }
    },
    "cta": "Try the Rights Layer"
  },
  "sentinel": {
    "title": "The Sentinel",
    "heading": "Know If Your Data",
    "highlight": "Was Used",
    "description": "...",
    "algorithms": [],
    "features": {
      "canary": { "title", "desc", "ready" },
      "evidence": { "title", "desc", "formats" }
    },
    "cta": "Try Sentinel Detection"
  },
  "marketplace": {
    "title": "The Marketplace",
    "heading": "Monetize Your",
    "highlight": "Intelligence",
    "description": "...",
    "steps": {
      "step1": { "label", "desc" },
      "step2": { "label", "desc" },
      "step3": { "label", "desc" },
      "step4": { "label", "desc" },
      "step5": { "label", "desc" }
    },
    "features": {
      "revenue": { "title", "desc" },
      "zkProofs": { "title", "desc", "items": [] }
    },
    "cta": "Join the Marketplace Waitlist",
    "comingSoon": "Coming in v3.0 (Month 15)"
  },
  "principles": {
    "title": "Our Philosophy",
    "heading": "Sovereign AI Memory",
    "highlight": "Belongs to You",
    "description": "...",
    "items": {
      "sovereign": { "title", "desc" },
      "personal": { "title", "desc" },
      "providerAgnostic": { "title", "desc" },
      "portable": { "title", "desc" },
      "useCaseAgnostic": { "title", "desc" },
      "dynamicallyGenerated": { "title", "desc" }
    }
  },
  "contextLayers": {
    "title": "The 8-Layer System",
    "heading": "Intelligent Context Assembly",
    "description": "...",
    "layers": {
      "l0": { "label", "desc", "tokens" },
      "l1": { "label", "desc", "tokens" },
      "l2": { "label", "desc", "tokens" },
      "l3": { "label", "desc", "tokens" },
      "l4": { "label", "desc", "tokens" },
      "l5": { "label", "desc", "tokens" },
      "l6": { "label", "desc", "tokens" },
      "l7": { "label", "desc", "tokens" }
    },
    "total": "Total Context Window: ~12,300 tokens"
  },
  "memoryTypes": {
    "title": "9 Types of",
    "highlight": "Human-Like Memory",
    "description": "Hover to see examples of each memory type",
    "types": {
      "episodic": { "name", "example" },
      "semantic": { "name", "example" },
      "procedural": { "name", "example" },
      "factual": { "name", "example" },
      "preference": { "name", "example" },
      "identity": { "name", "example" },
      "relationship": { "name", "example" },
      "goal": { "name", "example" },
      "project": { "name", "example" }
    }
  },
  "developers": {
    "title": "For Developers",
    "heading": "Build with",
    "highlight": "@vivim/sdk",
    "description": "...",
    "features": {
      "identity": { "title", "desc" },
      "contextEngine": { "title", "desc" },
      "storage": { "title", "desc" },
      "zeroKnowledge": { "title", "desc" }
    },
    "codeExample": "npm install @vivim/sdk"
  }
}
```

---

## Phase 3: Implementation Plan

### Step 1: Update Translation Files
1. Add all missing keys to `src/messages/en/index.json`
2. Add Spanish translations to `src/messages/es/index.json`
3. Add structure for future languages (fr, de, pt, zh, ja)

### Step 2: Update Page Component
1. Import additional translation namespaces
2. Replace all hardcoded strings with `t('key')` calls
3. Update data arrays to use translation keys

### Step 3: Demo Pages
1. Audit all demo pages for hardcoded text
2. Add demo-specific translations
3. Apply same pattern

### Step 4: Component Audit
1. Audit all UI components (Navbar, Footer, Buttons, etc.)
2. Ensure all user-facing text uses translations

### Step 5: Validation
1. Create a checklist to verify all text is translated
2. Test language switching
3. Verify no console errors from missing keys

---

## Phase 4: Coverage Checklist

### Main Page (page.tsx)
| Section | Hardcoded Items | Status | Translation Keys Needed |
|---------|-----------------|--------|------------------------|
| Problem stats | 3 | ❌ Missing | problem.stats.* |
| Problem cards | 4 × 4 fields | ❌ Missing | problem.cards.* |
| Category badges | 4 | ❌ Missing | problem.categories.* |
| Problem buttons | 3 | ❌ Missing | problem.exploreAll, problem.howVivimSolves, problem.viewScores |
| Solution features | 3 × 2 fields | ✅ Done | solution.features.* |
| Demo items | 10 × 2 fields | ❌ Missing | demos.items.* |
| ACU section | 4 + 4 items | ❌ Missing | acus.* |
| Rights tier | 6 × 2 fields | ❌ Missing | rightsLayer.tiers.* |
| Rights features | 2 × 4 fields | ❌ Missing | rightsLayer.features.* |
| Sentinel algorithms | 13 | ❌ Missing | sentinel.algorithms |
| Sentinel features | 2 × 3 fields | ❌ Missing | sentinel.features.* |
| Marketplace steps | 5 × 2 fields | ❌ Missing | marketplace.steps.* |
| Marketplace features | 2 × 5 fields | ❌ Missing | marketplace.features.* |
| Principles items | 6 × 2 fields | ❌ Missing | principles.items.* |
| Context layers | 8 × 3 fields | ❌ Missing | contextLayers.layers.* |
| Memory types | 9 × 2 fields | ❌ Missing | memoryTypes.types.* |
| Developers features | 4 × 2 fields | ❌ Missing | developers.features.* |

### Demo Pages
| Demo | Status | Translation Keys Needed |
|------|--------|------------------------|
| live-memory | ❌ Missing | Full demo content |
| context-engine | ❌ Missing | Full demo content |
| zero-knowledge-privacy | ❌ Missing | Full demo content |
| sovereign-history | ❌ Missing | Full demo content |
| decentralized-network | ❌ Missing | Full demo content |
| secure-collaboration | ❌ Missing | Full demo content |
| dynamic-intelligence | ❌ Missing | Full demo content |
| rights-layer | ❌ Missing | Full demo content |
| sentinel-detection | ❌ Missing | Full demo content |
| marketplace | ❌ Missing | Full demo content |

---

## Phase 5: Action Items

### Immediate (Today)
- [ ] Add all missing keys to English translation file
- [ ] Add all missing keys to Spanish translation file  
- [ ] Update page.tsx to use new translation keys

### Short-term (This Week)
- [ ] Audit and translate demo pages
- [ ] Audit and translate component text

### Ongoing
- [ ] Add new languages (fr, de, pt, zh, ja)
- [ ] Document translation workflow

---

## Total Translation Keys Count

| Category | Current Keys | Keys Needed | Total After |
|----------|--------------|--------------|-------------|
| common | ~15 | 0 | 15 |
| hero | ~9 | 0 | 9 |
| providers | ~10 | 0 | 10 |
| problem | 0 | ~40 | 40 |
| solution | ~5 | 0 | 5 |
| demos | ~20 | ~20 | 40 |
| acus | 0 | ~15 | 15 |
| rightsLayer | 0 | ~25 | 25 |
| sentinel | 0 | ~25 | 25 |
| marketplace | 0 | ~20 | 20 |
| principles | 0 | ~15 | 15 |
| contextLayers | 0 | ~30 | 30 |
| memoryTypes | 0 | ~20 | 20 |
| developers | ~10 | 0 | 10 |
| **TOTAL** | **~89** | **~210** | **~299** |

The translation system will have ~299 keys covering all user-facing content.