# VIVIM Rights Layer, Sentinel Detection & Marketplace Implementation Plan

## Overview

This document details the implementation of three major features from the Chain-of-Trust documentation into the existing VIVIM website:
1. **The Rights Layer** - Ownership tiers, TPDI classifier, TDASS co-governance
2. **The Sentinel** - 13 detection algorithms, canary system, evidence generation
3. **The Marketplace** - Data monetization, ZK proofs, revenue sharing

## Current Website State

### Existing Structure
- **Main Landing Page** (`src/app/page.tsx`): Hero, problem/solution sections, 8-layer context, ACUs, principles, demos
- **Demo Pages** (7 total):
  - `/demos/live-memory`
  - `/demos/context-engine`
  - `/demos/zero-knowledge-privacy`
  - `/demos/sovereign-history`
  - `/demos/decentralized-network`
  - `/demos/secure-collaboration`
  - `/demos/dynamic-intelligence`

### Design System
- **Theme**: Dark slate (slate-950 background)
- **Style**: Glassmorphism with frosted glass cards
- **Colors**: Violet/cyan/emerald gradients, glass borders
- **Animations**: Framer Motion for reveals
- **Components**: shadcn/ui primitives

---

## Implementation Plan

### Phase 1: Main Landing Page Extensions

#### 1.1 Rights Layer Section (New)

**Location**: After "The Solution" section, before "Atomic Chat Units"

**Content Structure**:
```
Badge: "The Rights Layer"
Title: "Your Data, Your Rules"
Subtitle: Granular ownership tiers that adapt to context

Tier Grid (6 tiers):
- T0: Personal Only (green)
- T1: Personal-Likely (green)
- T2: Shared-Possibly (amber)
- T3: Co-Governed (orange) ← Dual key required
- T4: Restricted (red)
- T5: Regulated (red) ← Never exports

Co-Governance Card:
- TDASS visualization
- Human key + Company key iconography
- Sunset transition timeline

TPDI Classifier Preview:
- ML classifier input → tier output
- User feedback loop icon

CTA: "Try the Rights Layer Demo" → /demos/rights-layer
```

**Visual Design**:
- Match existing glassmorphism cards
- Tier cards with gradient backgrounds matching tier colors
- Interactive hover states showing tier descriptions

#### 1.2 Sentinel Detection Section (New)

**Location**: After Rights Layer section

**Content Structure**:
```
Badge: "The Sentinel"
Title: "Know If Your Data Was Used"
Subtitle: 13 detection algorithms verify data sovereignty

Detection Dashboard Mockup:
- 3x4 grid of algorithm cards
- Each with: name, icon, status indicator

Algorithms to showcase:
1. Spectral Membership Inference
2. Mutual Information Estimation
3. Kolmogorov Uniqueness Scoring
4. Photon Counting
5. Interference Pattern Detection
6. Canary Wave Function
7. Boltzmann Calibration
8. Holographic Watermarking
9. Thermodynamic Flow Tracing
10. Fisher Information Fingerprinting
11. Entanglement Testing
12. Diffraction Grating Analysis
13. Conservation Law Verification

Canary System Visualization:
- Quantum superposition visual
- Detection → collapse animation

Evidence Package Preview:
- Cryptographic proof card
- Legal-ready export format

CTA: "Try Sentinel Detection" → /demos/sentinel-detection
```

**Visual Design**:
- Pulsing/scanline effects for "detection" aesthetic
- Algorithm cards with status indicators (ready/scanning/detected)
- Animated radar/scan visuals

#### 1.3 Marketplace Preview Section (New)

**Location**: After Sentinel section, before footer

**Content Structure**:
```
Badge: "The Marketplace"
Title: "Monetize Your Intelligence"
Subtitle: Sell your data on your terms — or keep it private

How It Works Flow:
1. List → ZK Proof of properties
2. Discover → Browse listings
3. Purchase → Escrow payment
4. Exchange → Encrypted delivery
5. Verify → Proof verification

Pricing Models:
- Fixed Price
- Vickrey Auction
- Subscription
- Bonding Curve

Revenue Split Visualization:
- Platform: 15%
- Human (co-governed): 60% × 40% = 24%
- Company (co-governed): 60% × 40% = 24%
- Human (sole): 85%

ZK Proofs Card:
- "Prove properties without revealing content"
- Visual: encrypted proof icon

CTA: "Join the Waitlist" (for v3.0)
```

**Visual Design**:
- Green/amber gradients for "marketplace" feel
- Transaction flow visualization
- Revenue split pie chart

---

### Phase 2: New Demo Pages

#### 2.1 Rights Layer Demo (`/demos/rights-layer`)

**Purpose**: Interactive demonstration of ownership tiers and co-governance

**Interactive Elements**:
1. **Tier Classifier Demo**
   - Input: Sample conversation text
   - Output: Assigned tier (T0-T5) with confidence
   - Controls: Manual override slider

2. **TDASS Visualization**
   - Timeline slider: Active → Sunset → Post-Sunset
   - Shows key requirement changes
   - Tier 5 exception indicator

3. **Co-Governance Approval Flow**
   - Step-by-step: User request → Company review → Approval/Denial
   - Minimum Disclosure Review Packet preview

**Technical Implementation**:
- New component: `rights-layer-demo.tsx`
- Reuse existing demo infrastructure from `useDemoState`
- Mock classifier with predefined examples

#### 2.2 Sentinel Detection Demo (`/demos/sentinel-detection`)

**Purpose**: Interactive demonstration of detection algorithms

**Interactive Elements**:
1. **Detection Dashboard**
   - Real-time "scanning" animation
   - Algorithm toggle switches
   - Results visualization per algorithm

2. **Canary System Demo**
   - Generate canary tokens
   - Plant in vault (visual)
   - Probe model simulation
   - Detection result

3. **Evidence Package Generator**
   - Select detection events
   - Generate cryptographic proof
   - Export preview (JSON structure)

**Technical Implementation**:
- New component: `sentinel-detection-demo.tsx`
- Simulated scanning with progress indicators
- Evidence package JSON preview

#### 2.3 Marketplace Demo (`/demos/marketplace`)

**Purpose**: Interactive demonstration of the data marketplace

**Interactive Elements**:
1. **Listing Creator**
   - Select ACUs from mock vault
   - Set pricing model
   - Generate ZK proof (visual)

2. **Discovery Flow**
   - Browse mock listings
   - Filter by topic/price

3. **Purchase Simulation**
   - Select listing
   - Escrow visualization
   - Encrypted delivery

4. **Revenue Calculator**
   - Input: Sale price
   - Output: Breakdown (platform/human/company)

**Technical Implementation**:
- New component: `marketplace-demo.tsx`
- Mock data for listings
- Revenue split calculator

---

### Phase 3: Navigation Updates

**Navbar Updates**:
- Add new demo items to existing demo dropdown:
  - Rights Layer
  - Sentinel Detection
  - Marketplace

**Update existing DEMOS array in page.tsx**:
```typescript
// Add to existing DEMOS array
{
  slug: "rights-layer",
  title: "Rights Layer",
  desc: "Granular ownership tiers with co-governance",
  icon: Shield,
  color: "from-amber-500 to-orange-600",
},
{
  slug: "sentinel-detection",
  title: "Sentinel Detection",
  desc: "13 algorithms that detect data usage",
  icon: Radar,
  color: "from-red-500 to-rose-600",
},
{
  slug: "marketplace",
  title: "Marketplace",
  desc: "Monetize your intelligence on your terms",
  icon: ShoppingCart,
  color: "from-emerald-500 to-teal-600",
},
```

---

## File Structure After Implementation

```
src/
├── app/
│   ├── page.tsx                    [MODIFIED: 3 new sections]
│   ├── demos/
│   │   ├── rights-layer/
│   │   │   └── page.tsx            [NEW]
│   │   ├── sentinel-detection/
│   │   │   └── page.tsx            [NEW]
│   │   └── marketplace/
│   │       └── page.tsx            [NEW]
├── components/
│   ├── rights-layer-demo.tsx       [NEW]
│   ├── sentinel-detection-demo.tsx [NEW]
│   ├── marketplace-demo.tsx        [NEW]
│   ├── navbar.tsx                  [MODIFIED: add links]
```

---

## Detailed Component Specifications

### Rights Layer Demo Component

```typescript
interface RightsLayerDemoState {
  sampleText: string;
  detectedTier: TierLevel | null;
  confidence: number;
  manualOverride: boolean;
  tdassPhase: 'active' | 'sunset' | 'post-sunset';
  coGovernanceApproval: 'pending' | 'approved' | 'denied';
}

const SAMPLE_CONVERSATIONS = [
  { text: "What should I make for dinner?", tier: "T0" },
  { text: "Here's the code for the login flow...", tier: "T3" },
  { text: "My medical symptoms are...", tier: "T5" },
];
```

### Sentinel Demo Component

```typescript
interface SentinelDemoState {
  scanning: boolean;
  algorithmStatuses: Record<AlgorithmId, 'ready' | 'scanning' | 'detected'>;
  canaries: CanaryToken[];
  evidencePackage: EvidenceData | null;
}

const ALGORITHMS = [
  { id: 'spectral-mi', name: 'Spectral Membership Inference' },
  { id: 'mutual-info', name: 'Mutual Information Estimation' },
  // ... all 13
];
```

### Marketplace Demo Component

```typescript
interface MarketplaceDemoState {
  selectedACUs: string[];
  pricingModel: 'fixed' | 'auction' | 'subscription' | 'bonding';
  price: number;
  listingStatus: 'draft' | 'active' | 'sold';
  purchaseFlow: 'select' | 'escrow' | 'delivery' | 'complete';
}
```

---

## Design Guidelines

### Colors for New Sections

| Section | Primary Gradient | Accent | Border |
|---------|-----------------|--------|--------|
| Rights Layer | amber → orange | gold | amber/30 |
| Sentinel | red → rose | crimson | red/30 |
| Marketplace | emerald → teal | green | emerald/30 |

### Typography

- Match existing: font-sans, text-lg for body, text-xl for headings
- Section badges: uppercase, tracking-wide, text-xs
- Tier labels: font-mono for T0-T5

### Animations

- New sections: Use `scroll-animate` class like existing
- Detection scan: Radar pulse effect (CSS keyframes)
- Marketplace flow: Step transitions with framer-motion
- All demos: Reuse existing `fadeInUp` variants

---

## Acceptance Criteria

### Landing Page
- [ ] Rights Layer section appears with 6 tier cards
- [ ] Sentinel section shows 13-algorithm dashboard mockup
- [ ] Marketplace section displays revenue split visualization
- [ ] All new sections have proper scroll animations
- [ ] CTAs link to correct demo pages

### Demo Pages
- [ ] Rights Layer: Tier classifier works with sample inputs
- [ ] Rights Layer: TDASS timeline is interactive
- [ ] Sentinel: Detection scan animation plays
- [ ] Sentinel: Evidence package generates JSON preview
- [ ] Marketplace: Listing creation flow works
- [ ] Marketplace: Revenue calculator shows correct splits

### Navigation
- [ ] All 3 new demos appear in navbar/demos list
- [ ] Styling matches existing demo cards

### Technical
- [ ] Build passes without errors
- [ ] No TypeScript errors
- [ ] No console errors on page load
- [ ] Responsive on mobile (tested at 375px)

---

## Implementation Priority

1. **Must Have** (v1 of the update):
   - Rights Layer section on main page
   - Sentinel section on main page
   - Marketplace preview on main page
   - Rights Layer demo page
   - Demo links in navbar

2. **Should Have** (v2):
   - Sentinel demo page with full detection UI
   - Marketplace demo page

3. **Nice to Have**:
   - Animated detection scan in demo
   - Full ZK proof visualization

---

*This plan will be executed in phases, with each phase producing verifiable, working code.*
