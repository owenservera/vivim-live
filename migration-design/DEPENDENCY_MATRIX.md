# Dependency Matrix

## Current Dependencies

```json
{
  "dependencies": {
    "next": "^15.0.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "framer-motion": "^12.23.2",
    "lucide-react": "^0.525.0",
    "tailwindcss-animate": "^1.0.7",
    "tailwind-merge": "^3.3.1",
    "class-variance-authority": "^0.7.1",
    "sonner": "^2.0.6",
    "@radix-ui/react-*": "^1.1.x"
  },
  "devDependencies": {
    "tailwindcss": "^4",
    "@tailwindcss/postcss": "^4",
    "typescript": "^5"
  }
}
```

---

## Required New Dependencies

### Phase 1: Foundation

| Package | Version | Purpose | Priority |
|---------|---------|---------|----------|
| `lenis` | ^1.1.x | Smooth scroll engine | P0 |
| `zustand` | ^5.x | Global state management | P1 |

### Phase 2: Visual System

| Package | Version | Purpose | Priority |
|---------|---------|---------|----------|
| `three` | ^0.170.x | 3D/particle rendering | P1 |
| `@react-three/fiber` | ^8.x | React Three.js integration | P1 |
| `@react-three/drei` | ^9.x | Three.js helpers | P2 |
| `tone` | ^14.8.x | Audio engine | P2 |

### Phase 3: Data & API

| Package | Version | Purpose | Priority |
|---------|---------|---------|----------|
| `zod` | ^3.x | API validation | P1 |
| `@libsql/client` | ^0.6.x | Turso database (future) | P2 |

### Phase 4: Utilities

| Package | Version | Purpose | Priority |
|---------|---------|---------|----------|
| `@observablehq/plot` | ^0.6.x | Data visualization | P2 |
| `d3` | ^7.9.x | D3 utilities | P2 |

---

## Dependencies NOT Needed

The Cinematic Platform specifies these, but we have alternatives:

| Cinematic Spec | Our Alternative | Reason |
|----------------|-----------------|--------|
| `@theatre/core` | Framer Motion | Already have, simpler |
| `gsap` + `ScrollTrigger` | Framer Motion `useScroll` | Already have |
| `hono` | Next.js API Routes | Built-in |
| `@tursodatabase/serverless` | Local state / future | Not needed yet |

---

## Package Installation Order (Bun)

```bash
# Phase 1: Foundation
bun add lenis zustand

# Phase 2: Visual System
bun add three @react-three/fiber @react-three/drei tone

# Phase 3: Data & API
bun add zod @libsql/client

# Phase 4: Utilities
bun add @observablehq/plot d3
```

---

## Dev Dependencies to Remove

None expected. Current setup is compatible.

---

## Peer Dependencies

### Lenis

```typescript
// No peer dependencies required
```

### Three.js

```json
{
  "peerDependencies": {
    "three": ">=0.160.0"
  }
}
```

### Zustand

```json
{
  "peerDependencies": {
    "react": ">=18.0.0"
  }
}
```

---

## Bundle Size Impact

| Package | Bundle Size (gzip) | Impact |
|---------|---------------------|--------|
| `lenis` | ~2kb | Negligible |
| `zustand` | ~1kb | Negligible |
| `three` | ~600kb | Significant |
| `tone` | ~200kb | Moderate |
| `@react-three/fiber` | ~100kb | Moderate |

### Recommendation

- Load Three.js dynamically for particle backgrounds only
- Consider disabling Three.js on mobile (use canvas fallback)
- Audio (Tone.js) loaded on user interaction

---

## Dependency Checklist

- [ ] Install lenis for smooth scrolling
- [ ] Install zustand for state management
- [ ] (Optional) Install three.js for enhanced particles
- [ ] (Optional) Install tone.js for audio
- [ ] Remove unused Cinematic dependencies

---

*Next: [Decisions Log](DECISIONS_LOG.md)*
