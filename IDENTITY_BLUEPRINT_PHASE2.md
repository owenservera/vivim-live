# VIVIM Identity & Intelligence Blueprint - Phase 2 Implementation Plan

> **Status Analysis**: 80% structural readiness, 30% logic readiness
> **Generated**: 2026-03-29

---

## Executive Summary

This document outlines the optimal solution to close the gaps between the current implementation and the full requirements specified in INFERRED_IDENTITY_CORE_LOGIC.md and INTELLIGENCE_BLUEPRINT.md.

### Gap Assessment

| Category | Current State | Gap |
|----------|--------------|-----|
| Identity Scoring | Basic formula implemented | Missing: Typing rhythm, navigation paths, strict weight adherence |
| Behavioral Branching | None | Context assembler doesn't branch on avatar state |
| Eviction Logging | Traces exist but... | Not fully populated with reasons |
| Zero-Login Challenges | None | No UI/API for identity verification |
| Legacy Sunset | Parity logging added | Shadow run pending |

---

## 1. Identity Ripening - The "Zero-Login" Core

### 1.1 Signal Weight Refinement

**Problem**: Current formula implementation doesn't strictly adhere to $(0.2 \cdot S_f) + (0.3 \cdot S_b) + (0.5 \cdot S_c)$

**Solution**:

```typescript
// services/identity-scoring-service.ts - STRICT IMPLEMENTATION
const WEIGHTS: ScoringWeights = {
  fingerprint: 0.2,  // W_f
  behavioral: 0.3,    // W_b
  contextual: 0.5,    // W_c - carries MOST weight
};

// Each signal must be normalized to 0-100 BEFORE multiplication
// S_f: Device/IP consistency score (0-100)
// S_b: Typing rhythm + navigation patterns (0-100)  
// S_c: Identity memories + personal facts (0-100)

// FINAL: ics = (0.2 * S_f) + (0.3 * S_b) + (0.5 * S_c)
// Maximum possible: 20 + 30 + 50 = 100
```

### 1.2 Behavioral Capture Middleware

**Problem**: Typing rhythm ($S_b$) and navigation paths not captured

**Solution**: Create behavioral signal capture service

```typescript
// services/behavior-signal-service.ts (NEW FILE)
export interface BehavioralSignals {
  typingRhythm: number;      // ms between keystrokes (consistency)
  navigationPatterns: string[]; // path hops
  sessionTimes: number[];    // time-of-day patterns
  interactionPace: number;    // messages per hour
}

export class BehavioralSignalCapture {
  // Frontend sends: typing cadence, page transitions
  // Backend aggregates into behavioral score
}
```

**API Endpoint**: `POST /api/v2/identity/behavioral-signal`
```json
{
  "virtualUserId": "uuid",
  "typingCadence": [120, 135, 110, ...],
  "navigationPath": ["/chat", "/notebooks", "/visualize"],
  "sessionDurationMs": 345000
}
```

### 1.3 Librarian Identity Signal Detection

**Problem**: Librarian extracts identity insights but doesn't specifically target "Personal Facts"

**Solution**: Enhance LibrarianWorker with identity-focused prompts

```typescript
// context/librarian-worker.ts - ENHANCED
private generateIdentityPrompts(acus: AtomicChatUnit[]): string {
  return `Analyze these messages for IDENTITY-SIGNAL:
    
    Look for:
    1. "I am a..." / "I work as..." / "My name is..."
    2. Personal facts: "I live in...", "I prefer..."
    3. Professional: "At my company...", "My team..."
    4. Relationships: "My wife/husband...", "My friend..."
    
    Extract and categorize each finding with confidence 0-1.
    
    Messages: ${acus.map(a => a.content).join('\n')}`;
}
```

### 1.4 Zero-Login Challenge System

**Problem**: No mechanism for AI to verify identity through conversation

**Solution**: Add challenge generation to context assembly

```typescript
// When vu.currentAvatar transitions to FAMILIAR (60+)
// Generate a "Zero-Login Challenge" prompt:

const generateIdentityChallenge = (userId: string): string => {
  const facts = getRandomDeepFacts(userId, 2);
  return `CHALLENGE MODE: Ask the user about: "${facts[0].content}"`;
};
```

---

## 2. Intelligence Blueprint - Traceability & Control

### 2.1 Eviction Logging Fix

**Problem**: Traces array exists but eviction reasons not populated

**Solution**: Fix `generateTraces()` in context-assembler.ts

```typescript
private generateTraces(
  bundles: CompiledBundle[],
  jit: JITKnowledge,
  budget: ComputedBudget,
  detected: DetectedContext
): ContextTrace[] {
  const traces: ContextTrace[] = [];
  
  // PER LAYER: Track WHY items were evicted
  for (const [layer, layerBudget] of Object.entries(budget.layers)) {
    const evicted: ContextTrace['evictedItems'] = [];
    
    // REASON 1: Budget exhaustion
    if (layerBudget.allocated < layerBudget.idealTokens) {
      const deficit = layerBudget.idealTokens - layerBudget.allocated;
      evicted.push({
        id: `${layer}-budget-cap`,
        reason: 'budget',
        deficitTokens: deficit
      });
    }
    
    // REASON 2: Entropy threshold (from context-thermodynamics)
    const entropyThreshold = 0.3;
    if (this.getLayerEntropy(layer) < entropyThreshold) {
      evicted.push({
        id: `${layer}-entropy`,
        reason: 'entropy'
      });
    }
    
    // REASON 3: Relevance threshold (similarity < 0.5)
    const relevanceThreshold = 0.5;
    const lowRelevance = this.getLowRelevanceItems(layer, relevanceThreshold);
    evicted.push(...lowRelevance.map(id => ({ id, reason: 'relevance' })));
    
    traces.push({
      layer,
      includedItems: this.getIncludedItems(layer, bundles),
      evictedItems: evicted,
      tokensRequested: layerBudget.idealTokens,
      tokensAllocated: layerBudget.allocated,
    });
  }
  
  return traces;
}
```

### 2.2 Behavioral Branching (Avatar-Aware Context)

**Problem**: No branching logic based on currentAvatar

**Solution**: Add sovereign behavior in context-assembler.ts

```typescript
// context/assembler.ts - ASSEMBLY METHOD
async assemble(params: AssemblyParams): Promise<AssembledContext> {
  // FETCH USER AVATAR STATE
  const vu = await prisma.virtualUser.findUnique({
    where: { id: params.virtualUserId },
    select: { currentAvatar: true, confidenceScore: true }
  });
  
  const avatar = vu?.currentAvatar || 'STRANGER';
  const confidence = vu?.confidenceScore || 0;
  
  // BRANCH 1: STRANGER (0-29) - Conservative, safe-mode
  if (avatar === 'STRANGER') {
    return this.assembleStrangerMode(params);
  }
  
  // BRANCH 2: ACQUAINTANCE (30-59) - Basic L1 context
  if (avatar === 'ACQUAINTANCE') {
    return this.assembleAcquaintanceMode(params);
  }
  
  // BRANCH 3: FAMILIAR (60-84) - High-relevance L2/L3
  if (avatar === 'FAMILIAR') {
    return this.assembleFamiliarMode(params);
  }
  
  // BRANCH 4: KNOWN (85-100) - Full context, deep memory
  return this.assembleKnownMode(params);
}

private assembleStrangerMode(params: AssemblyParams): AssembledContext {
  // NO personal context
  // Generic VIVIM system prompt only
  // Maximum safety guards
  return {
    systemPrompt: getMinimalSystemPrompt(),
    budget: getMinimalBudget(),
    bundlesUsed: [],
    metadata: { 
      assemblyTimeMs: 0, 
      mode: 'STRANGER_SAFE',
      confidenceRequired: false
    }
  };
}

private assembleKnownMode(params: AssemblyParams): AssembledContext {
  // FULL context: L0, L1, L2, L3, L4, L5, L6
  // Deep memory retrieval
  // High token budget (up to model max)
  return this.fullAssembly(params);
}
```

### 2.3 Recipe Wiring Completion

**Problem**: EnhancedBudgetControls.tsx connected but missing recipe presets

**Solution**: Add seed data for default recipes

```typescript
// Add to context-recipes.js or migration
const DEFAULT_RECIPES = [
  {
    id: 'standard_default',
    name: 'Standard',
    description: 'Balanced context for general use',
    layerWeights: { identity_core: 1.0, global_prefs: 1.0, topic: 1.0, entity: 1.0 },
    excludedLayers: [],
    customBudget: 12000,
    isDefault: true
  },
  {
    id: 'research_deep',
    name: 'Deep Research',
    description: 'Maximize topic/entity context for research',
    layerWeights: { identity_core: 0.5, topic: 1.5, entity: 1.5, conversation: 0.5 },
    excludedLayers: [],
    customBudget: 20000
  },
  {
    id: 'creative_flexible',
    name: 'Creative',
    description: 'Flexible context for creative work',
    layerWeights: { identity_core: 1.2, global_prefs: 1.2, topic: 0.8, entity: 0.8 },
    excludedLayers: [],
    customBudget: 15000
  }
];
```

---

## 3. Technical Debt Resolution

### 3.1 CORS - VERIFIED DONE ✓

**Status**: ✅ COMPLETE in previous implementation
- `getDynamicOrigins()` added to config/index.js
- Dynamic regex patterns in server.js
- Hardcoded 192.168.0.173 removed

### 3.2 Legacy Sunset - PENDING

**Current State**: 
- Parity logging added (logs every 10th request)
- Still has fallback to old context-generator.js

**Required Action**:
1. Run shadow mode: `CONTEXT_ENGINE=new-only` for 48 hours
2. Monitor logs for divergence < 1%
3. Then remove:
   ```typescript
   // Remove from unified-context-service.ts:
   import * as oldContextGenerator from '../services/context-generator.js';
   // Remove fallback block (lines ~200-216)
   ```

---

## 4. Implementation Priority Matrix

| Priority | Task | Files | Effort |
|----------|------|-------|--------|
| P0 | Fix strict weight formula in IdentityScoringService | services/identity-scoring-service.ts | 1hr |
| P0 | Add avatar-aware branching in context-assembler | context/context-assembler.ts | 2hr |
| P1 | Create behavioral signal capture service | services/behavior-signal-service.ts | 3hr |
| P1 | Enhance Librarian identity prompts | context/librarian-worker.ts | 1hr |
| P1 | Fix eviction logging in generateTraces | context/context-assembler.ts | 1hr |
| P2 | Add recipe seed data | prisma/seed.ts | 1hr |
| P2 | Run legacy shadow mode | - | 48hr |

---

## 5. Success Criteria

- [ ] **Identity Scoring**: Strictly follows $(0.2 \cdot S_f) + (0.3 \cdot S_b) + (0.5 \cdot S_c)$
- [ ] **Behavioral Capture**: Typing rhythm + navigation paths captured
- [ ] **Avatar Branching**: STRANGER gets safe-mode, KNOWN gets full context
- [ ] **Eviction Logging**: Every trace shows specific reason (budget/entropy/relevance)
- [ ] **Zero-Login**: AI can challenge user with personal facts
- [ ] **Legacy Sunset**: Old generator removed after shadow run

---

## 6. File Manifest

### New Files
- `services/behavior-signal-service.ts` - Typing rhythm & navigation capture
- `services/identity-challenge-service.ts` - Zero-login challenge generation
- `types/identity.ts` - Shared identity types

### Modified Files
- `services/identity-scoring-service.ts` - Strict weight implementation
- `context/context-assembler.ts` - Avatar-aware branching + eviction reasons
- `context/librarian-worker.ts` - Enhanced identity prompts
- `prisma/schema.prisma` - Add IdentityState enum (optional)
- `routes/identity.js` - Behavioral signal endpoint

---

*This document should be reviewed and approved before Phase 2 implementation begins.*
