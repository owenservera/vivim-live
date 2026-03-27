# Migration Design Documents

## Overview

This folder contains the complete migration design for transforming the VIVIM landing page into a cinematic, scroll-driven experience based on the Cinematic Platform specifications.

## Documents

| Document | Purpose |
|----------|---------|
| [MIGRATION_OVERVIEW.md](MIGRATION_OVERVIEW.md) | High-level strategy, phases, and bun commands |
| [ARCHITECTURE_MIGRATION.md](ARCHITECTURE_MIGRATION.md) | Technical architecture changes |
| [COMPONENT_MAPPING.md](COMPONENT_MAPPING.md) | Cinematic → Next.js component equivalents |
| [ANIMATION_MIGRATION.md](ANIMATION_MIGRATION.md) | Theatre.js/GSAP → Framer Motion patterns |
| [DATA_MIGRATION.md](DATA_MIGRATION.md) | Schema and API design |
| [DESIGN_SYSTEM_MIGRATION.md](DESIGN_SYSTEM_MIGRATION.md) | Design tokens adaptation |
| [DEPENDENCY_MATRIX.md](DEPENDENCY_MATRIX.md) | Package changes required |
| [SCAFFOLDING.md](SCAFFOLDING.md) | Project structure and file creation order |
| [ORIGINAL_SOURCES.md](ORIGINAL_SOURCES.md) | Source files to reference while building |
| [PERFORMANCE_TESTING.md](PERFORMANCE_TESTING.md) | Performance budgets, testing strategy, error handling |
| [DEPLOYMENT_STRATEGY.md](DEPLOYMENT_STRATEGY.md) | CI/CD, environment vars, rollback |
| [SEO_ACCESSIBILITY.md](SEO_ACCESSIBILITY.md) | SEO for scroll-based experience, a11y |
| [DECISIONS_LOG.md](DECISIONS_LOG.md) | Recorded decisions & gaps |

## Quick Reference

### Key Transformations

| From | To |
|------|-----|
| SvelteKit 5 | Next.js 15 |
| Theatre.js + GSAP | Framer Motion |
| Three.js (full) | Canvas (enhanced) |
| Tone.js | Tone.js |
| Hono + Turso | Next.js API Routes + Static Config |
| Static sections | Chapter-based scroll |

### New Dependencies (Bun)

```bash
# Phase 1: Foundation
bun add lenis zustand

# Phase 2: Visual System
bun add three @react-three/fiber @react-three/drei tone

# Phase 3: Data & API
bun add zod @libsql/client
```

### Key Decisions Made

1. ✅ Single-page scroll with chapters
2. ✅ Framer Motion only (no GSAP/Theatre.js)
3. ✅ Zustand for state management
4. ✅ Enhance existing particles, defer Three.js
5. ✅ Keep VIVIM color palette
6. ✅ Static config + analytics API

### Open Questions

- Audio default behavior (prompt vs auto)
- Mobile animation level (full vs simplified)

## Source Reference

**IMPORTANT**: See [ORIGINAL_SOURCES.md](ORIGINAL_SOURCES.md) for the complete list of files to reference while building. This includes:
- Cinematic Platform specifications (11 files)
- Current VIVIM implementation (14 files)
- Key code patterns to copy
- Reading order recommendations

## Related Resources

- [Cinematic Platform Specs](../cinematic-platform/)
- [Current Implementation](../src/)
