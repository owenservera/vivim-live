# VIVIM Cinematic Platform Migration Design

## Executive Summary

This document outlines the migration strategy to transform the current VIVIM landing page into a cinematic, scroll-driven experience inspired by the Cinematic Platform specifications. The current implementation uses Next.js 15 with Framer Motion, while the Cinematic Platform was designed for SvelteKit 5 with Theatre.js and GSAP.

### Key Transformation

| Aspect | Current State | Target State |
|--------|--------------|--------------|
| Navigation | Page-based routes | Continuous scroll-driven chapters |
| Animation | Framer Motion (basic scroll) | Theatre.js-style choreography + GSAP ScrollTrigger |
| 3D/Particles | Canvas-based neural background | Three.js particle system with scroll-reactive behavior |
| Audio | None | Tone.js ambient soundscapes |
| Data | Static | Dynamic (Turso/libSQL via API routes) |
| Personalization | None | Per-viewer context assembly |

---

## Migration Phases

### Phase 1: Foundation (Week 1)
- [ ] Scroll-driven chapter system architecture
- [ ] Lenis smooth scrolling integration
- [ ] Framer Motion upgrade to scroll-triggered animations
- [ ] Design system expansion

### Phase 2: Visual System (Week 2)
- [ ] Three.js particle background replacement
- [ ] Audio engine integration (Tone.js)
- [ ] Advanced animation components

### Phase 3: Data & Personalization (Week 3)
- [ ] API routes for experience data
- [ ] Viewer profile system
- [ ] Analytics tracking

### Phase 4: Polish & Deploy (Week 4)
- [ ] Performance optimization
- [ ] Mobile responsiveness
- [ ] Edge deployment

---

## Installation Commands (Bun)

All commands use **Bun** as the runtime:

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Build for production
bun run build

# Run type checking
bun run typecheck

# Run linting
bun run lint
```

### New Dependencies

```bash
# Phase 1: Foundation
bun add lenis zustand

# Phase 2: Visual System
bun add three @react-three/fiber @react-three/drei tone

# Phase 3: Data & API
bun add zod @libsql/client

# Phase 4: Visualization
bun add @observablehq/plot d3
```

---

## Document Structure

```
migration-design/
├── MIGRATION_OVERVIEW.md           # This file - high-level strategy
├── ARCHITECTURE_MIGRATION.md        # Technical architecture changes
├── COMPONENT_MAPPING.md             # Cinematic components → Next.js equivalents
├── ANIMATION_MIGRATION.md          # Theatre.js/GSAP → Framer Motion
├── DATA_MIGRATION.md                # Schema and API design
├── DESIGN_SYSTEM_MIGRATION.md       # Design tokens adaptation
├── DEPENDENCY_MATRIX.md            # Package changes required
└── DECISIONS_LOG.md                # Recorded design decisions & gaps
```

---

## Critical Decisions Required

1. **Scroll Architecture**: Should chapters be separate routes or single-page scroll?
2. **Animation Tooling**: Framer Motion can replicate Theatre.js, but at what complexity cost?
3. **3D Approach**: Replace neural-bg with full Three.js or enhance existing?
4. **Data Strategy**: Start with static config or build API first?

---

*Next: [Architecture Migration](ARCHITECTURE_MIGRATION.md)*
