# Design System

## Philosophy

The Cinematic design system prioritizes **dark-first aesthetics** with high contrast, intentional typography, and motion as a core design element. Every visual decision reinforces the platform's cinematic, immersive nature.

---

## Color System

### Core Palette

```css
:root {
  /* Backgrounds - Dark First */
  --color-void: #050507;          /* Primary background - near-black, blue-tinted */
  --color-surface: #0b0b10;       /* Cards, elevated surfaces */
  --color-bg-elevated: #16161c;   /* Modals, overlays */
  --color-bg-hover: #1e1e26;      /* Hover states */

  /* Text */
  --color-text-primary: #f0eff4; /* Headlines, primary content */
  --color-text-secondary: #9896a4; /* Body copy, descriptions */
  --color-text-muted: #5a5868;    /* Captions, hints */

  /* Accent Colors */
  --color-accent-teal: #3ecfb2;    /* Primary accent - memory, connection */
  --color-accent-gold: #d4a94a;    /* Secondary - financial, CTA */
  --color-accent-coral: #e86848;   /* Tertiary - problems, alerts */
  --color-accent-purple: #7c6ef7; /* Visual - particles, glow */

  /* Semantic Colors */
  --color-success: #3ecfb2;
  --color-warning: #d4a94a;
  --color-error: #e86848;
  --color-info: #7c6ef7;
}
```

### Color Usage Guide

| Color | Usage | Never Use For |
|-------|-------|---------------|
| `--color-void` | Page background | Content (no contrast) |
| `--color-surface` | Cards, sections | High-priority UI |
| `--color-text-primary` | Headlines, CTAs | Backgrounds |
| `--color-text-secondary` | Body copy | Emphasis |
| `--color-accent-teal` | Primary actions, positive metrics | Error states |
| `--color-accent-gold` | Financial numbers, key stats | General UI |
| `--color-accent-coral` | Problems, degradation, churn | Success states |

---

## Typography

### Type Scale

```css
:root {
  /* Fonts */
  --font-display: 'Clash Display', sans-serif;   /* Chapter titles */
  --font-body: 'Inter Variable', sans-serif;     /* Body copy */
  --font-mono: 'JetBrains Mono', monospace;      /* Numbers, code */

  /* Scale */
  --text-xs: 0.75rem;      /* 12px - captions */
  --text-sm: 0.875rem;      /* 14px - labels */
  --text-base: 1rem;        /* 16px - body */
  --text-lg: 1.125rem;     /* 18px - lead */
  --text-xl: 1.25rem;      /* 20px - subheads */
  --text-2xl: 1.5rem;      /* 24px - heads */
  --text-3xl: 1.875rem;    /* 30px - titles */
  --text-4xl: 2.25rem;     /* 36px - chapters */
  
  /* Fluid typography - clamp for responsive */
  --text-display: clamp(2.5rem, 7vw, 6rem);     /* Hero headlines */
  --text-title: clamp(2rem, 5vw, 4rem);          /* Chapter titles */
  --text-headline: clamp(1.5rem, 4vw, 3rem);     /* Section headers */
  --text-body: clamp(1rem, 2vw, 1.25rem);       /* Body copy */
  
  /* Weights */
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  
  /* Line Heights */
  --leading-tight: 1.1;
  --leading-normal: 1.5;
  --leading-relaxed: 1.7;
  
  /* Letter Spacing */
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.05em;
}
```

### Typography Rules

1. **Numbers always use monospace** — `font-family: var(--font-mono)` and `font-variant-numeric: tabular-nums`
2. **Headlines use display font** — Never use body font for chapter titles
3. **No font weight above 600** — Heavy weights look panicked; confidence is in negative space
4. **Fluid sizing** — Use `clamp()` for responsive text that scales gracefully

---

## Spacing System

```css
:root {
  /* Base spacing unit: 4px */
  --space-1: 0.25rem;    /* 4px */
  --space-2: 0.5rem;     /* 8px */
  --space-3: 0.75rem;    /* 12px */
  --space-4: 1rem;       /* 16px */
  --space-5: 1.25rem;    /* 20px */
  --space-6: 1.5rem;     /* 24px */
  --space-8: 2rem;       /* 32px */
  --space-10: 2.5rem;    /* 40px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */
  --space-20: 5rem;      /* 80px */
  --space-24: 6rem;      /* 96px */
}
```

### Spacing Principles

- **Consistent rhythm** — All spacing is a multiple of 4px
- **Generous whitespace** — Default to larger spacing; compress deliberately
- **Section padding** — Minimum `var(--space-8)` on desktop, `var(--space-4)` on mobile

---

## Motion System

### Easing Curves

```css
:root {
  /* Cinematic ease - main transition curve */
  --ease-cinematic: cubic-bezier(0.16, 1, 0.3, 1);
  
  /* Snap - quick interactions */
  --ease-snap: cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Bounce - avoid (too playful) */
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
  
  /* Durations */
  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-base: 400ms;
  --duration-slow: 800ms;
  --duration-slower: 1200ms;
}
```

### Motion Principles

1. **Entrance only** — Elements reveal on enter; exits are scroll-driven fades
2. **Stagger max 60ms** — Longer staggers feel slow and dated
3. **No bouncing** — `spring` easing is for consumer apps; use cinematic ease
4. **Numbers count up** — Every metric enters as 0 and counts to value (except backwards counters)
5. **3D parallax** — Objects rotate toward cursor; max 8deg tilt

---

## Layout System

### Container

```css
.container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.container-narrow {
  max-width: 640px;
}

.container-wide {
  max-width: 1440px;
}
```

### Grid

```css
.grid {
  display: grid;
  gap: var(--space-6);
}

.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 768px) {
  .grid-2, .grid-3, .grid-4 {
    grid-template-columns: 1fr;
  }
}
```

### Chapter Layout

Each chapter should:
- Have `min-height: 100vh`
- Use flexbox for centering
- Have generous vertical padding (`var(--space-16)` minimum)
- Support `position: absolute` in orchestrator (stacked layout)

---

## Component Styles

### Cards

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

.card-elevated {
  background: var(--color-bg-elevated);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

### Buttons

```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-6);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: 500;
  border-radius: var(--radius-md);
  border: none;
  cursor: pointer;
  transition: all var(--duration-base) var(--ease-cinematic);
}

.btn-primary {
  background: var(--color-accent-teal);
  color: var(--color-void);
}

.btn-primary:hover {
  background: #4fe0c3;
  transform: translateY(-1px);
}

.btn-ghost {
  background: transparent;
  color: var(--color-text-secondary);
  border: 1px solid var(--color-text-muted);
}

.btn-ghost:hover {
  border-color: var(--color-text-secondary);
  color: var(--color-text-primary);
}
```

### Input

```css
.input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-body);
  font-size: var(--text-base);
  color: var(--color-text-primary);
  background: var(--color-surface);
  border: 1px solid var(--color-text-muted);
  border-radius: var(--radius-md);
  transition: border-color var(--duration-base);
}

.input:focus {
  outline: none;
  border-color: var(--color-accent-teal);
}

.input::placeholder {
  color: var(--color-text-muted);
}
```

---

## Radius & Shadows

```css
:root {
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

## Visual Effects

### Particle Glow

```css
.glow-teal {
  box-shadow: 0 0 20px var(--color-accent-teal), 0 0 40px rgba(62, 207, 178, 0.3);
}

.glow-gold {
  box-shadow: 0 0 20px var(--color-accent-gold), 0 0 40px rgba(212, 169, 74, 0.3);
}

.text-glow {
  text-shadow: 0 0 10px var(--color-accent-teal), 0 0 20px rgba(62, 207, 178, 0.5);
}
```

### Gradients

```css
.gradient-surface {
  background: linear-gradient(180deg, var(--color-surface) 0%, var(--color-void) 100%);
}

.gradient-accent {
  background: linear-gradient(135deg, var(--color-accent-teal) 0%, var(--color-accent-purple) 100%);
}
```

---

## Responsive Breakpoints

```css
:root {
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

/* Usage */
@media (max-width: 768px) {
  /* Mobile styles */
}
```

### Mobile Considerations

1. Reduce particle count to 30,000 max
2. Disable WebGPU, use WebGL2
3. Turn off audio by default (too intrusive)
4. Stack all grid layouts to single column
5. Reduce font sizes by 1 tier
6. Reduce padding by 50%

---

## Dark Mode (Primary)

The platform is **dark-first** by design. Light mode is not supported.

**Why dark?**
- Screen time is already high; dark reduces eye strain
- Particles and glow effects pop against dark backgrounds
- Premium, cinematic feel
- Reduces distraction, focuses attention on content

---

## Accessibility

1. **Contrast ratios** — Minimum 4.5:1 for text
2. **Focus states** — Visible outline on interactive elements
3. **Reduced motion** — Respect `prefers-reduced-motion`
4. **Screen reader** — Proper ARIA labels on all components
5. **Keyboard nav** — Full keyboard accessibility

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

*Next: [Data Schema](DATA_SCHEMA.md)*