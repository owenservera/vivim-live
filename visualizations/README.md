# VIVIM Source Code Visualization Documents

This directory contains comprehensive Mermaid-based visualization documents covering the entire VIVIM source code.

## Visualization Documents

| # | File | Description |
|---|------|-------------|
| 01 | [01-project-structure.mmd](01-project-structure.mmd) | Complete project overview - directory structure, system architecture, database schema, context pipeline, API routes, components, memory system, security, data flow, rights layer |
| 02 | [02-detailed-structure.mmd](02-detailed-structure.mmd) | Detailed file tree - frontend, backend, shared packages with complete structure |
| 03 | [03-context-engine-deep-dive.mmd](03-context-engine-deep-dive.mmd) | Context engine - ParallelContextPipeline, stages, streaming, bundle types, budget algorithm, metrics |
| 04 | [04-memory-system-acu.mmd](04-memory-system-acu.mmd) | Memory system - ACU architecture, 9 memory categories, lifecycle, hybrid retrieval, decay, caching |
| 05 | [05-api-routes-services.mmd](05-api-routes-services.mmd) | API routes & services - all backend endpoints, service architecture, virtual user system, WebSocket |
| 06 | [06-frontend-components.mmd](06-frontend-components.mmd) | Frontend - component hierarchy, UI library, hooks, demo components, styling |
| 07 | [07-security-auth-rights.mmd](07-security-auth-rights.mmd) | Security & rights - auth flow, middleware, device management, ZK encryption, rights layer, sentinel |
| 08 | [08-data-flow-events.mmd](08-data-flow-events.mmd) | Data flow - event system, workers, telemetry, circuit breaker, hybrid retrieval |
| 09 | [09-database-schema.mmd](09-database-schema.mmd) | Database - ERD, models, indexes, migrations, seeding |
| 10 | [10-system-overview.mmd](10-system-overview.mmd) | Complete system overview - end-to-end architecture, lifecycle, tech stack |

## Quick Reference

### Key Architecture Patterns

**8-Layer Context Assembly:**
```
L0: Identity Core → L1: Preferences → L2: Topics → L3: Entities → 
L4: Conversation → L5: JIT Retrieval → L6: History → L7: User Message
```

**9 ACU Memory Types:**
```
Episodic | Semantic | Procedural | Factual | Preference | 
Identity | Relationship | Goal | Project
```

**Rights Layer Tiers (T0-T5):**
```
T0: Personal Only | T1: Personal-Likely | T2: Shared-Possibly | 
T3: Co-Governed | T4: Restricted | T5: Regulated
```

### Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, React 19, Tailwind v4, Framer Motion |
| Backend | Express 5, Bun Runtime |
| Database | PostgreSQL, Prisma ORM, pgVector, Redis |
| AI | @ai-sdk/* (OpenAI, Anthropic, Google, xAI, Ollama) |
| Auth | JWT, DID-based Virtual Users, Zero-Knowledge |

### File Locations

```
C:\0-BlackBoxProject-0\vivim-source-code\
├── packages/frontend/     # Next.js 15 frontend
├── packages/backend/      # Express API server
├── packages/shared/       # Shared types
├── visualizations/       # This directory
└── [docs directories]    # VIVIM.docs, chain-of-trust, cinematic-platform
```

---

*Visualization created: March 2026*
*Format: Mermaid diagrams for rendering in compatible viewers*