# Design System Migration

## Current Design System (VIVIM)

The current VIVIM landing page uses:
- Tailwind CSS 4 with CSS variables
- Custom glassmorphism effects
- Slate color palette with violet/cyan/emerald accents
- Custom animations in globals.css

### Current CSS Variables

```css
:root {
  /* Backgrounds - Dark First */
  --background: oklch(0.145 0 0);      /* #0f172a - slate-950 */
  --foreground: oklch(0.985 0 0);      /* white */
  
  /* Colors */
  --primary: oklch(0.922 0 0);        /* violet */
  --primary-foreground: oklch(0.205 0 0);
  --accent: oklch(0.269 0 0);         /* slate */
  --accent-foreground: oklch(0.985 0 0);
  
  /* Cards */
  --card: oklch(0.205 0 0);
  --card-foreground: oklch(0.985 0 0);
}
```

---

## Cinematic Design System

The Cinematic Platform specifies:

### Color Palette

```css
:root {
  /* Backgrounds - Dark First */
  --color-void: #050507;           /* Primary background - near-black, blue-tinted */
  --color-surface: #0b0b10;         /* Cards, elevated surfaces */
  --color-bg-elevated: #16161c;    /* Modals, overlays */
  --color-bg-hover: #1e1e26;       /* Hover states */
  
  /* Text */
  --color-text-primary: #f0eff4;   /* Headlines, primary content */
  --color-text-secondary: #9896a4;  /* Body copy, descriptions */
  --color-text-muted: #5a5868;     /* Captions, hints */
  
  /* Accent Colors */
  --color-accent-teal: #3ecfb2;     /* Primary accent - memory, connection */
  --color-accent-gold: #d4a94a;    /* Secondary - financial, CTA */
  --color-accent-coral: #e86848;   /* Tertiary - problems, alerts */
  --color-accent-purple: #7c6ef7;  /* Visual - particles, glow */
}
```

---

## Design Token Mapping

| Cinematic Token | Current VIVIM Equivalent | Adaptation |
|----------------|------------------------|------------|
| `--color-void` | `--background` | Keep current |
| `--color-surface` | `--card` | Keep current |
| `--color-text-primary` | `--foreground` | Keep current |
| `--color-accent-teal` | Custom accent | Current: violet-500 `#8b5cf6` |
| `--color-accent-coral` | red-400 `#f87171` | Add coral token |
| `--color-accent-gold` | amber-400 `#fbbf24` | Add gold token |

### Recommendation

**Keep current VIVIM palette** but add missing tokens:

```css
:root {
  /* Existing (keep) */
  --color-void: oklch(0.145 0 0);
  --color-surface: oklch(0.205 0 0);
  
  /* Add from Cinematic */
  --color-accent-teal: #3ecfb2;     /* For "connection" metaphors */
  --color-accent-coral: #e86848;   /* For problem sections */
  --color-accent-gold: #d4a94a;    /* For financial/CTA */
}
```

---

## Typography

### Current

```css
--font-sans: var(--font-inter);
--font-mono: var(--font-jetbrains-mono);
```

### Cinematic

```css
--font-display: 'Clash Display', sans-serif;   /* Chapter titles */
--font-body: 'Inter Variable', sans-serif;      /* Body copy */
--font-mono: 'JetBrains Mono', monospace;      /* Numbers, code */
```

### Typography Scale

| Token | Current | Cinematic |
|-------|---------|-----------|
| Display | text-5xl | text-display: clamp(2.5rem, 7vw, 6rem) |
| Title | text-4xl | text-title: clamp(2rem, 5vw, 4rem) |
| Headline | text-3xl | text-headline: clamp(1.5rem, 4vw, 3rem) |
| Body | text-lg | text-body: clamp(1rem, 2vw, 1.25rem) |

### Recommendation

**Keep current typography** but add fluid scaling:

```css
:root {
  /* Add fluid typography */
  --text-display: clamp(2.5rem, 7vw, 6rem);
  --text-title: clamp(2rem, 5vw, 4rem);
  --text-headline: clamp(1.5rem, 4vw, 3rem);
  --text-body: clamp(1rem, 2vw, 1.25rem);
}
```

---

## Motion Tokens

### Current

```css
/* Limited custom animations */
transition: all 0.3s ease;
```

### Cinematic

```css
:root {
  /* Cinematic ease - main transition curve */
  --ease-cinematic: cubic-bezier(0.16, 1, 0.3, 1);
  
  /* Snap - quick interactions */
  --ease-snap: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Durations */
  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-base: 400ms;
  --duration-slow: 800ms;
  --duration-slower: 1200ms;
}
```

### Recommendation

**Add Cinematic motion tokens**:

```css
:root {
  /* Easing */
  --ease-cinematic: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-snap: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Durations */
  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-base: 400ms;
  --duration-slow: 800ms;
  --duration-slower: 1200ms;
}
```

---

## Spacing System

Current VIVIM uses Tailwind spacing (4px base). Cinematic uses the same.

```css
:root {
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-4: 1rem;      /* 16px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
}
```

**No change needed** — Tailwind spacing is compatible.

---

## Component Styles

### Glassmorphism (Current)

```css
.glass {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### Cinematic Card

```css
.card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  border: 1px solid transparent;
  transition: all var(--duration-base) var(--ease-cinematic);
}

.card:hover {
  border-color: var(--color-text-muted);
  transform: translateY(-2px);
}
```

### Recommendation

**Enhance existing glassmorphism** with Cinematic tokens:

```css
.glass {
  background: rgba(15, 23, 42, 0.6);
  backdrop-filter: blur(16px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all var(--duration-base) var(--ease-cinematic);
}

.glass:hover {
  border-color: rgba(255, 255, 255, 0.15);
}
```

---

## Radius & Shadows

```css
:root {
  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 24px var(--color-accent-teal);
}
```

---

## Responsive Breakpoints

Current VIVIM uses Tailwind default. Cinematic specifies:

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}
```

**No change needed** — Tailwind defaults match.

---

## Mobile Considerations

Cinematic specifies:
- Reduce particle count to 30,000 max
- Disable WebGPU, use WebGL2
- Turn off audio by default
- Stack all grids to single column
- Reduce font sizes by 1 tier
- Reduce padding by 50%

### Recommendation

Add responsive utilities:

```css
@media (max-width: 768px) {
  :root {
    --text-display: clamp(2rem, 6vw, 4rem);
    --text-title: clamp(1.5rem, 4vw, 3rem);
  }
}
```

---

## Design System Migration Checklist

- [ ] Add accent color tokens (teal, coral, gold)
- [ ] Add fluid typography tokens
- [ ] Add motion tokens (easing, duration)
- [ ] Add shadow tokens
- [ ] Enhance glassmorphism with transitions
- [ ] Add mobile responsive adjustments

---

*Next: [Dependency Matrix](DEPENDENCY_MATRIX.md)*
