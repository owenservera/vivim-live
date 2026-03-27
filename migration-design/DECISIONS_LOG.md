# Decisions Log

## Document Purpose

This file tracks all design decisions, architectural choices, and identified gaps during the migration from Cinematic Platform specifications to the VIVIM Next.js implementation.

---

## Architecture Decisions

### AD-001: Scroll Architecture

**Decision**: Single-page scroll with chapters as positioned sections

**Date**: 2026-03-25

**Context**: The Cinematic Platform uses a continuous scroll with chapters positioned absolutely. We need to decide whether to use:
1. Single page with absolute positioning
2. Separate routes per chapter
3. Hybrid (sticky sections)

**Choice**: Option 1 - Single page with absolute positioning

**Rationale**:
- Maintains current user experience
- Simplifies analytics (single session)
- Framer Motion handles orchestration well
- No complex routing needed

**Status**: ✅ DECIDED

---

### AD-002: Animation Tooling

**Decision**: Framer Motion only (no GSAP or Theatre.js)

**Date**: 2026-03-25

**Context**: Cinematic Platform uses Theatre.js for choreographed sequences and GSAP for scroll-linked animations. We have Framer Motion already installed.

**Choice**: Framer Motion only

**Rationale**:
- Already in use on project
- `useScroll` + `useTransform` hooks replicate GSAP ScrollTrigger
- No need to add additional libraries
- Theatre.js complexity not justified for 9 chapters

**Status**: ✅ DECIDED

---

### AD-003: State Management

**Decision**: Zustand for global state

**Date**: 2026-03-25

**Context**: Need to share scroll progress, audio state, and viewer context across components.

**Choice**: Zustand

**Rationale**:
- Minimal boilerplate
- Works well with React 19
- No context provider nesting
- TypeScript support

**Status**: ✅ DECIDED

---

### AD-004: 3D/Particles

**Decision**: Enhance existing neural-bg, optionally add Three.js for advanced effects

**Date**: 2026-03-25

**Context**: Current neural-bg.tsx uses canvas. Cinematic Platform specifies Three.js with WebGPU.

**Choice**: Hybrid - enhance canvas, defer Three.js

**Rationale**:
- Current implementation works well
- Three.js adds significant bundle size
- WebGPU support is still limited
- Can add later if needed

**Status**: ✅ DECIDED

---

### AD-005: Audio Engine

**Decision**: Implement Tone.js audio

**Date**: 2026-03-25

**Context**: Cinematic Platform specifies ambient audio that changes with chapter. This is a key differentiator.

**Choice**: Implement Tone.js

**Rationale**:
- Creates immersive experience
- Chapter-specific moods add polish
- Can be disabled by user

**Status**: ✅ DECIDED (Deferred to Phase 2)

---

### AD-006: Data Strategy

**Decision**: Static configuration first, API routes for analytics

**Date**: 2026-03-25

**Context**: Cinematic Platform specifies Turso database with full CRUD. We don't need full persistence yet.

**Choice**: Static config + analytics API

**Rationale**:
- Experience content doesn't change often
- Analytics more valuable than full CMS
- Can add database later

**Status**: ✅ DECIDED

---

## Design Decisions

### DD-001: Color Palette

**Decision**: Keep VIVIM colors, add Cinematic accents

**Date**: 2026-03-25

**Context**: Cinematic Platform has specific colors (teal #3ecfb2, coral #e86848, gold #d4a94a). VIVIM uses violet/cyan/emerald.

**Choice**: Keep VIVIM palette, add missing accent tokens

**Rationale**:
- VIVIM brand is established
- Colors work well for current design
- Add coral for problem sections, gold for CTAs

**Status**: ✅ DECIDED

---

### DD-002: Typography

**Decision**: Keep Inter + JetBrains Mono, add fluid scaling

**Date**: 2026-03-25

**Context**: Cinematic specifies Clash Display for headlines. This requires font licensing/hosting.

**Choice**: Keep current fonts, enhance with fluid sizing

**Rationale**:
- Inter + JetBrains Mono already loaded
- Clash Display would add complexity
- Current typography is readable and on-brand

**Status**: ✅ DECIDED

---

### DD-003: Motion Easing

**Decision**: Add Cinematic easing tokens

**Date**: 2026-03-25

**Context**: Current animations use default easing. Cinematic specifies specific curve.

**Choice**: Add custom easing tokens

**Rationale**:
- Cinematic ease `[0.16, 1, 0.3, 1]` feels premium
- Easy to add to CSS variables
- Consistent feel across animations

**Status**: ✅ DECIDED

---

## Identified Gaps

### GAP-001: Scroll Engine

**Gap**: No smooth scrolling implementation

**Impact**: Medium

**Severity**: P1

**Description**: Current implementation uses native scroll. Cinematic specifies Lenis for smooth, inertial scrolling.

**Resolution**: Install and configure Lenis

**Status**: 🔲 OPEN

---

### GAP-002: Chapter Lifecycle

**Gap**: No chapter enter/exit tracking

**Impact**: Medium

**Severity**: P1

**Description**: Need to track when users enter/exit chapters for analytics.

**Resolution**: Create useChapterLifecycle hook

**Status**: 🔲 OPEN

---

### GAP-003: Audio Engine

**Gap**: No audio implementation

**Impact**: High (key feature)

**Severity**: P2

**Description**: Cinematic Platform has Tone.js audio engine. VIVIM has no audio.

**Resolution**: Implement basic audio with Tone.js

**Status**: 🔲 OPEN

---

### GAP-004: Mobile Particles

**Gap**: Particle performance on mobile

**Impact**: Low

**Severity**: P2

**Description**: Cinematic Platform specifies reduced particle counts on mobile.

**Resolution**: Add mobile detection and reduce particles

**Status**: 🔲 OPEN

---

### GAP-005: Viewer Personalization

**Gap**: No per-viewer customization

**Impact**: Medium

**Severity**: P3

**Description**: Cinematic Platform supports viewer profiles (VC names, personalization). VIVIM doesn't.

**Resolution**: Add viewer slug support for future personalization

**Status**: 🔲 OPEN

---

## Questions for Stakeholder Input

### Q-001: Audio Default

**Question**: Should audio be enabled by default or require user interaction?

**Options**:
1. Enabled by default (may annoy users)
2. Disabled by default, prompt to enable
3. Disabled by default, auto-enable after first interaction

**Recommendation**: Option 3

**Status**: ⏳ PENDING DECISION

---

### Q-001: Mobile Animation Level

**Question**: Should mobile have simplified animations or full experience?

**Options**:
1. Full animations (may impact performance)
2. Simplified animations (faster, less immersive)
3. Disable heavy effects only (particles, 3D)

**Recommendation**: Option 3

**Status**: ⏳ PENDING DECISION

---

## Action Items

- [ ] AD-001: Implement ChapterOrchestrator with absolute positioning
- [ ] AD-002: Create Framer Motion scroll patterns
- [ ] AD-003: Set up Zustand store
- [ ] AD-004: Enhance neural-bg component
- [ ] AD-005: Implement basic audio support
- [ ] AD-006: Create experience config structure

- [ ] GAP-001: Install and configure Lenis
- [ ] GAP-002: Create useChapterLifecycle hook
- [ ] GAP-003: Basic audio implementation
- [ ] GAP-004: Mobile particle optimization
- [ ] GAP-005: Add viewer slug support

- [ ] Q-001: Confirm audio default behavior
- [ ] Q-002: Confirm mobile animation strategy

---

*This log will be updated as decisions are made and gaps are resolved.*
