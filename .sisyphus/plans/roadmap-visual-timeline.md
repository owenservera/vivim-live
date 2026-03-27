# VIVIM Development Roadmap - Visual Timeline Design

## Design Overview

A horizontally scrollable, interactive timeline showing VIVIM's 7-phase development across 30 months. Each phase is a "cell" that expands on hover to reveal deliverables. The timeline follows a biological metaphor — starting as a simple cell and evolving into a multicellular organism.

---

## Visual Concept

### Overall Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  VIVIM Development Timeline                                                                  │
│  "Building the sovereign memory organism"                                                   │
├─────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                              │
│  Month:    1       3       6       9      12      15      18      21      24      27      30 │
│            |-------|-------|-------|-------|-------|-------|-------|-------|-------|-------│
│                                                                                              │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │  GENESIS│ │FIRST    │ │INNATE   │ │DIFF     │ │ADAPTIVE │ │VESICLE  │ │SENTINEL │   │
│  │  (Phase0│ │BREATH   │ │IMMUNITY │ │ERATION  │ │IMMUNITY │ │MACHINERY│ │         │   │
│  │  Months │ │(Phase1) │ │(Phase2) │ │(Phase3) │ │(Phase4) │ │(Phase5) │ │(Phase6) │   │
│  │  1-6)   │ │ Months  │ │ Months  │ │ Months  │ │ Months  │ │ Months  │ │         │   │
│  │         │ │  4-9)   │ │  8-12)  │ │ 10-15)  │ │ 13-18)  │ │ 16-22)  │ │         │   │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘   │
│                                                                                              │
│  Phase 0 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│           ↑ Current Position                                                               │
│                                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────────────────┐   │
│  │ PHASE 0: GENESIS                                                                       │   │
│  │ "The cell with a functioning membrane"                                                │   │
│  ├────────────────────────────────────────────────────────────────────────────────────┤   │
│  │                                                                                      │   │
│  │  ✅ Vault Kernel - Encrypted memory store                                            │   │
│  │  ✅ The Membrane - VIVIM Gate, channel filters                                       │   │
│  │  ✅ Stream Protocol (VSP) - Canonical format, anti-replay                           │   │
│  │  🔄 Inner Gate - Staging area pipeline (In Progress)                                 │   │
│  │  ○ User Control Plane - Dashboard                                                    │   │
│  │                                                                                      │   │
│  └────────────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                              │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase Cell Design

### Collapsed State (Default)

```css
.phase-cell {
  width: 120px;
  height: 160px;
  background: linear-gradient(180deg, #1e1b4b 0%, #312e81 100%);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 16px;
  padding: 16px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.phase-cell:hover {
  transform: translateY(-8px) scale(1.05);
  box-shadow: 0 20px 40px rgba(139, 92, 246, 0.2);
  border-color: rgba(139, 92, 246, 0.6);
}

/* Status indicator dots */
.phase-cell::before {
  content: '';
  position: absolute;
  top: 12px;
  right: 12px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #22c55e; /* Complete */
  /* or: background: #f59e0b for in-progress */
  /* or: background: #6b7280 for not-started */
}
```

### Phase-Specific Colors

| Phase | Name | Color Theme | Status Dot Color |
|-------|------|-------------|------------------|
| 0 | Genesis | Violet → Indigo | Green (complete) |
| 1 | First Breath | Cyan → Blue | Green (complete) |
| 2 | Innate Immunity | Amber → Orange | Amber (in-progress) |
| 3 | Differentiation | Emerald → Teal | Slate (not started) |
| 4 | Adaptive Immunity | Rose → Pink | Slate (not started) |
| 5 | Vesicle Machinery | Emerald → Green | Slate (not started) |
| 6 | Sentinel | Red → Rose | Slate (not started) |
| 7 | Multicellular | Blue → Indigo | Slate (not started) |

---

## Expanded State (On Click)

When a phase is clicked, it expands to show deliverables:

```css
.phase-expanded {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 600px;
  max-height: 80vh;
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: 24px;
  padding: 32px;
  z-index: 100;
  overflow-y: auto;
}
```

### Expanded Content Structure

```tsx
<Card>
  <Header>
    <Badge variant={phaseStatus}>Phase 0: Genesis</Badge>
    <Title>Build the Vault Core and Membrane</Title>
    <Subtitle>"A cell with a functioning membrane, nuclear envelope, and basic internal organization"</Subtitle>
  </Header>
  
  <TimelineBar>
    <MonthMarkers months={[1, 3, 6]} />
    <ProgressBar progress={75} />  {/* 4 of 5 items complete */}
  </TimelineBar>
  
  <DeliverablesList>
    <Item status="complete">
      <Icon>✅</Icon>
      <Title>Vault Kernel</Title>
      <Description>Append-only encrypted memory store</Description>
    </Item>
    <Item status="complete">
      <Icon>✅</Icon>
      <Title>The Membrane</Title>
      <Description>VIVIM Gate, channel filters</Description>
    </Item>
    <Item status="in-progress">
      <Icon>🔄</Icon>
      <Title>Stream Protocol</Title>
      <Description>Canonical format, anti-replay</Description>
    </Item>
    <Item status="pending">
      <Icon>○</Icon>
      <Title>Inner Gate</Title>
      <Description>Staging area pipeline</Description>
    </Item>
  </DeliverablesList>
  
  <SuccessCriteria>
    <Title>Success Criteria</Title>
    <Checklist>
      <Item checked>Vault creates from mnemonic</Item>
      <Item checked>Key hierarchy generates</Item>
      <Item checked>Vault locks/unlocks</Item>
      <Item>Stream accepts droplets</Item>
    </Checklist>
  </SuccessCriteria>
  
  <CloseButton>×</CloseButton>
</Card>
```

---

## Interactive Features

### 1. Horizontal Scroll + Navigation

```tsx
// Arrow buttons on sides
<Button position="left" onClick={() => scrollBy(-200)}>
  <ChevronLeft />
</Button>

<TimelineContainer>
  <PhaseCell phase={0} />
  <PhaseCell phase={1} />
  <PhaseCell phase={2} />
  {/* ... */}
</TimelineContainer>

<Button position="right" onClick={() => scrollBy(200)}>
  <ChevronRight />
</Button>
```

### 2. Progress Indicator

A vertical line showing current position in timeline:

```css
.current-position-marker {
  position: absolute;
  left: 15%; /* Based on current month / 30 */
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(180deg, 
    #22c55e 0%,   /* Complete portion */
    #f59e0b 50%,  /* Current */
    transparent 50%
  );
}

.current-position-marker::before {
  content: 'You are here';
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
  background: #22c55e;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  white-space: nowrap;
}
```

### 3. Milestone Markers

Diamond shapes on the timeline for key milestones:

```
        M0.1
          ◇
          |
Month 1-3|
          |
        M1
          ◇
          |
Month 4-6|
          |
        M2
          ◇
```

### 4. Biological Iconography

Each phase has a biological icon:

| Phase | Icon | Meaning |
|-------|------|---------|
| 0 | 🧬 Cell | Basic cell structure |
| 1 | 💨 Bubble | First breath, exchange |
| 2 | 🛡️ Shield | Innate immunity |
| 3 | 🔬 Cell Division | Differentiation |
| 4 | 🧠 Brain | Adaptive learning |
| 5 | 📦 Package | Vesicle export |
| 6 | 👁️ Eye | Sentinel, detection |
| 7 | 🌐 Network | Multicellular coordination |

---

## Animation Specifications

### Phase Cell Hover

```css
@keyframes phase-hover {
  0% { transform: translateY(0) scale(1); }
  50% { transform: translateY(-12px) scale(1.08); }
  100% { transform: translateY(-8px) scale(1.05); }
}

.phase-cell:hover {
  animation: phase-hover 0.3s ease-out;
}
```

### Expand Transition

```css
@keyframes expand-in {
  0% { 
    transform: scale(0.9) translate(-50%, -50%);
    opacity: 0;
  }
  100% { 
    transform: scale(1) translate(-50%, -50%);
    opacity: 1;
  }
}
```

### Progress Glow

```css
@keyframes progress-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  50% { box-shadow: 0 0 20px 4px rgba(34, 197, 94, 0.2); }
}

.current-phase {
  animation: progress-pulse 2s ease-in-out infinite;
}
```

---

## Implementation Plan

### Files to Create

1. `src/components/roadmap-timeline.tsx` - Main timeline component
2. `src/components/phase-card.tsx` - Individual phase card
3. `src/components/milestone-marker.tsx` - Diamond milestone markers
4. `src/app/roadmap/page.tsx` - Standalone roadmap page (optional)

### Data Structure

```typescript
interface Phase {
  id: number;
  name: string;
  codeName: string;
  months: { start: number; end: number };
  biologicalEquivalent: string;
  objective: string;
  deliverables: Deliverable[];
  successCriteria: string[];
  status: 'complete' | 'in-progress' | 'pending';
  icon: string;
}

interface Deliverable {
  name: string;
  description: string;
  priority: 'P0' | 'P1' | 'P2';
  status: 'complete' | 'in-progress' | 'pending';
}
```

### Integration Points

- Add to main landing page as new section (`#roadmap`)
- Link from navbar ("Roadmap" nav item)
- Or create dedicated `/roadmap` page

---

## Acceptance Criteria

- [ ] Timeline displays all 7 phases with correct month ranges
- [ ] Phase cells have correct colors based on phase
- [ ] Status dots show complete/in-progress/pending
- [ ] Clicking a phase expands to show deliverables
- [ ] Current position marker shows progress
- [ ] Milestone diamonds display on timeline
- [ ] Hover animations work smoothly
- [ ] Responsive on mobile (stacks vertically)
- [ ] Scroll navigation arrows work
- [ ] Biological metaphors are visible
