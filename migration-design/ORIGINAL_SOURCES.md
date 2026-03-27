# Original Sources Reference

This document lists all source files that the builder should reference while implementing the cinematic migration. It includes:

1. **Cinematic Platform specifications** - The design system we're migrating TO
2. **VIVIM App (OG)** - The rich source codebase with full features  
3. **VIVIM Docs** - Comprehensive documentation and vision

---

## Source Locations

| Source | Path |
|--------|------|
| Cinematic Platform Specs | `C:\0-BlackBoxProject-0\vivim-source-code\cinematic-platform\` |
| VIVIM App (Full Source) | `C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\` |
| VIVIM Documentation | `C:\0-BlackBoxProject-0\vivim-app-og\VIVIM.docs\` |

---

## Part 1: Cinematic Platform Specifications

### Location: `C:\0-BlackBoxProject-0\vivim-source-code\cinematic-platform\`

| File | Purpose | Read When |
|------|---------|-----------|
| `ARCHITECTURE.md` | Core concepts, chapter system, scroll engine, registry | Understanding the platform philosophy |
| `TECH_STACK.md` | Complete technology stack, SvelteKit 5, Theatre.js, GSAP, Three.js, Tone.js, Turso | Selecting tools and understanding alternatives |
| `PROJECT_SCAFFOLD.md` | Project structure with code examples | Building file structure |
| `COMPONENT_LIBRARY.md` | Reusable components (ChapterBase, Counter, Slider, MetricCard, etc.) | Component implementations |
| `DESIGN_SYSTEM.md` | Color palette, typography, motion tokens, glassmorphism | Design tokens |
| `DATA_SCHEMA.md` | Database schema, API data models | Data layer design |
| `API_SPECIFICATION.md` | REST API endpoints and response formats | API design |
| `ANIMATION_GUIDE.md` | Theatre.js, GSAP ScrollTrigger patterns | Animation patterns |
| `DEPLOYMENT.md` | Cloudflare Pages + Workers deployment | Deployment strategy |
| `EXTENSIBILITY.md` | Custom chapters, themes, plugins | Extension points |

---

## Part 2: VIVIM App (Full Source Code)

### Location: `C:\0-BlackBoxProject-0\vivim-app-og\vivim-app\`

### Key Directories

| Directory | Purpose |
|-----------|---------|
| `server\` | Backend API, auth, context engine |
| `pwa\` | React PWA frontend |
| `sdk\` | VIVIM SDK for developers |
| `common\` | Shared types and utilities |
| `demo\` | Demo implementations |
| `network\` | Network architecture |
| `data\` | Data layer |

### Key Files

| File | Purpose |
|------|---------|
| `README.md` | Main project documentation |
| `package.json` | Dependencies and scripts |
| `CONVERSATION_RENDERING_SUMMARY.md` | Conversation rendering architecture |

### Server (`server\`)

| Directory | Purpose |
|-----------|---------|
| `server\src\` | Main server code |
| `server\src\api\` | API routes |
| `server\src\context\` | Context engine |
| `server\src\cortex\` | Cortex system |
| `server\src\auth\` | Authentication |

### PWA (`pwa\`)

| Directory | Purpose |
|-----------|---------|
| `pwa\src\` | React source code |
| `pwa\src\components\` | React components |
| `pwa\src\app\` | Next.js pages |

---

## Part 3: VIVIM Documentation

### Location: `C:\0-BlackBoxProject-0\vivim-app-og\VIVIM.docs\`

### Key Documentation Directories

| Directory | Purpose |
|-----------|---------|
| `ACU\` | Atomic Chat Units documentation |
| `AI_API\` | AI provider integrations |
| `BIZ\` | Business documents |
| `CONTEXT\` | Context engine documentation |
| `CORTEX\` | Cortex system documentation |
| `DATABASES\` | Database schemas |
| `DEMO\` | Demo documentation |
| `FRONTEND\` | Frontend documentation |
| `MEMORY\` | Memory system documentation |
| `NETWORK\` | Network architecture |
| `PITCH\` | Pitch deck materials |
| `SECURITY\` | Security documentation |
| `sovereign-memory\` | Sovereign memory specs |
| `sdk.docs\` | SDK documentation |
| `vivim-live\` | Landing page docs |

---

## Part 4: Key Patterns to Reference

### 1. Scroll Engine Pattern
**Source**: `cinematic-platform/PROJECT_SCAFFOLD.md` → Search for "Scroll Engine"

### 2. Chapter Lifecycle Pattern
**Source**: `cinematic-platform/PROJECT_SCAFFOLD.md` → Search for "ChapterBase"

### 3. Audio Mood Pattern
**Source**: `cinematic-platform/PROJECT_SCAFFOLD.md` → Search for "Audio Engine"

### 4. Counter Animation Pattern
**Source**: `cinematic-platform/COMPONENT_LIBRARY.md` → Search for "Counter"

### 5. Cinematic Easing
**Source**: `cinematic-platform/DESIGN_SYSTEM.md` → Search for "Motion System"

---

## Part 5: API Patterns to Reference

### Analytics Event Types
**Source**: `cinematic-platform/ANIMATION_GUIDE.md` → Search for "Event Types"

### API Response Format
**Source**: `cinematic-platform/API_SPECIFICATION.md` → Search for "Response Format"

---

## Part 6: Design Tokens to Reference

### Color System
**Source**: `cinematic-platform/DESIGN_SYSTEM.md` → Search for "Color System"

### Typography
**Source**: `cinematic-platform/DESIGN_SYSTEM.md` → Search for "Type Scale"

---

## Reading Order Recommendation

### Week 1: Foundation
1. Read `cinematic-platform/ARCHITECTURE.md` - Understand philosophy
2. Read `cinematic-platform/PROJECT_SCAFFOLD.md` - See code patterns
3. Read `vivim-app/README.md` - Know full app
4. Read `vivim-app/CONVERSATION_RENDERING_SUMMARY.md` - Understand architecture

### Week 2: Features
1. Read `VIVIM.docs/CONTEXT/` - Context engine
2. Read `VIVIM.docs/ACU/` - ACU system
3. Read `VIVIM.docs/CORTEX/` - Cortex
4. Read `VIVIM.docs/DEMO/` - Demo features

### Week 3: Technical Details
1. Explore `vivim-app/server/src/` - Backend
2. Explore `vivim-app/pwa/src/` - Frontend
3. Explore `vivim-app/sdk/` - SDK

### Week 4: Integration
1. Read `VIVIM.docs/AI_API/` - Integrations
2. Read `VIVIM.docs/SECURITY/` - Security
3. Read `VIVIM.docs/NETWORK/` - Infrastructure

---

## Quick Lookup Cheatsheet

| Need | Look In |
|------|---------|
| Chapter structure | `cinematic-platform/ARCHITECTURE.md` |
| Scroll implementation | `cinematic-platform/PROJECT_SCAFFOLD.md` |
| Animation patterns | `cinematic-platform/ANIMATION_GUIDE.md` |
| Component code | `cinematic-platform/COMPONENT_LIBRARY.md` |
| Design tokens | `cinematic-platform/DESIGN_SYSTEM.md` |
| API endpoints | `cinematic-platform/API_SPECIFICATION.md` |
| Database schema | `cinematic-platform/DATA_SCHEMA.md` |
| Full app architecture | `vivim-app/README.md` |
| Context engine | `VIVIM.docs/CONTEXT/` |
| ACU system | `VIVIM.docs/ACU/` |
| Cortex system | `VIVIM.docs/CORTEX/` |
| Memory system | `VIVIM.docs/MEMORY/` |
| Demo features | `VIVIM.docs/DEMO/` |
| AI integrations | `VIVIM.docs/AI_API/` |
| Security | `VIVIM.docs/SECURITY/` |

---

## For Deep Knowledge Extraction

See [EXTRACTION_PROMPTS.md](EXTRACTION_PROMPTS.md) for detailed prompts to extract:
- Complete system architecture
- All features (including unreleased)
- Data models
- Component library
- Integrations
- Product vision
- And more...
