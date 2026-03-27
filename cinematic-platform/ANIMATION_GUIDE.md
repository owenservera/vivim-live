# Animation Guide

## Philosophy

Animations in the Cinematic Platform are not decorations — they are **narrative instruments**. Every animation serves a purpose: guiding attention, revealing information, creating emotional resonance, or providing feedback.

---

## Animation Architecture

### Three Animation Systems

| System | Purpose | Tool |
|--------|---------|------|
| **Theatre.js** | Scripted, choreographed sequences | Keyframes + timeline |
| **GSAP ScrollTrigger** | Scroll-reactive, continuous motion | Scrub, pin, parallax |
| **CSS Transitions** | Simple state changes | Hover, focus, mount |

**Decision Rule**:
- "This plays once when user reaches this section" → Theatre.js
- "This tracks scroll position continuously" → GSAP ScrollTrigger
- "This responds to user input (hover, focus)" → CSS transitions

**Never use CSS `@keyframes`** for significant animations — they're not controllable, reversible, or inspectable.

---

## Theatre.js Patterns

### Setup

```typescript
// lib/engine/theatre.ts
import { getProject, types as t } from '@theatre/core';

export const project = getProject('Cinematic Experience');

// Load saved state in production, dev mode uses Studio
const state = import.meta.env.DEV 
  ? undefined 
  : await import('./theatre-state.json');

export const experience = getProject('Cinematic Experience', { state });

export const sheets = {
  gate: experience.sheet('Gate'),
  problem: experience.sheet('Problem'),
  vision: experience.sheet('Vision'),
  product: experience.sheet('Product'),
  market: experience.sheet('Market'),
  model: experience.sheet('Model'),
  team: experience.sheet('Team'),
  ask: experience.sheet('Ask')
};
```

### Creating Sequences

```typescript
// In a chapter component
import { sheets } from '$engine/theatre';
import { onMount } from 'svelte';

let headLine: HTMLElement;
let subhead: HTMLElement;

onMount(() => {
  const sheet = sheets.gate;
  
  // Create animated objects
  const headlineObj = sheet.object('headline', {
    opacity: t.number(0, { range: [0, 1] }),
    translateY: t.number(40, { range: [-100, 100] })
  });
  
  const subheadObj = sheet.object('subhead', {
    opacity: t.number(0, { range: [0, 1] }),
    translateY: t.number(20, { range: [-50, 50] })
  });
  
  // Sync with DOM
  headlineObj.onValuesChange(({ opacity, translateY }) => {
    if (headLine) {
      headLine.style.opacity = String(opacity);
      headLine.style.transform = `translateY(${translateY}px)`;
    }
  });
  
  subheadObj.onValuesChange(({ opacity, translateY }) => {
    if (subhead) {
      subhead.style.opacity = String(opacity);
      subhead.style.transform = `translateY(${translateY}px)`;
    }
  });
  
  // Play sequence
  sheet.sequence.play({ range: [0, 4], loop: false });
  
  return () => {
    sheet.sequence.stop();
  };
});
```

### Connecting to Scroll

```typescript
// When you want Theatre.js to respond to scroll instead of time
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { gsap } from 'gsap';

// In onMount:
ScrollTrigger.create({
  trigger: chapterElement,
  start: 'top bottom',
  end: 'bottom top',
  onUpdate: (self) => {
    const sheet = sheets.gate;
    // Map scroll progress to sequence position
    sheet.sequence.position = self.progress * sheet.sequence.duration;
  }
});
```

---

## GSAP ScrollTrigger Patterns

### Scroll-Linked Animation

```typescript
// Basic scroll-linked animation
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// In onMount of a chapter:
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: sectionElement,
    start: 'top 70%',
    end: 'top 30%',
    scrub: true,
    markers: false // Set true for debugging
  }
});

// Animate elements through the timeline
tl.to('.stat-1', { opacity: 1, y: 0, duration: 0.5 })
  .to('.stat-2', { opacity: 1, y: 0, duration: 0.5 }, '-=0.3')
  .to('.stat-3', { opacity: 1, y: 0, duration: 0.5 }, '-=0.3');

return () => {
  tl.kill();
  ScrollTrigger.getAll().forEach(t => t.kill());
};
```

### Counter Animation

```typescript
// Animated number counter tied to scroll
import { gsap } from 'gsap';

function animateCounter(element: HTMLElement, from: number, to: number, duration: number) {
  const obj = { value: from };
  
  gsap.to(obj, {
    value: to,
    duration,
    ease: 'power3.out',
    onUpdate: () => {
      element.textContent = Math.round(obj.value).toLocaleString();
    }
  });
}

// Usage with ScrollTrigger
ScrollTrigger.create({
  trigger: metricElement,
  start: 'top 80%',
  onEnter: () => {
    animateCounter(valueElement, 0, 4500000, 2.5);
  }
});
```

### Degradation Line (Backwards Counter)

```typescript
// Special case: backwards counter (counts DOWN)
// This is the ONLY counter in the platform that goes backwards
// Used in Problem chapter to show quality degradation

gsap.to(obj, {
  innerText: 43, // Target value (43%)
  snap: { innerText: 1 },
  duration: 2.5,
  ease: 'none',
  scrollTrigger: {
    trigger: problemSection,
    start: 'top 60%'
  }
});
```

### Pinning

```typescript
// Pin a section while animations play
ScrollTrigger.create({
  trigger: pinSection,
  start: 'top top',
  end: '+=2000', // Pin for 2000px of scroll
  pin: true,
  scrub: true,
  anticipatePin: 1
});
```

---

## Particle Animations

### Particle Assembly

```typescript
// Three.js particle system - connected via chapter progress
// From Chapter 00 (Gate) to Chapter 02 (Vision)

const PARTICLE_COUNT = 150;
const CONNECTION_DISTANCE = 100;

let connectionWeight = $state(0);

$effect(() => {
  // Drive connection from chapter progress
  connectionWeight = chapterProgress;
});

// In animation loop:
particles.forEach(p => {
  // Drift when disconnected
  p.x += p.vx;
  p.y += p.vy;
  
  // Converge toward center as connection increases
  p.x += (centerX - p.x) * 0.001 * connectionWeight;
  p.y += (centerY - p.y) * 0.001 * connectionWeight;
  
  // Draw connections
  particles.forEach(p2 => {
    const dist = distance(p, p2);
    if (dist < CONNECTION_DISTANCE * (1 + connectionWeight)) {
      ctx.globalAlpha = (1 - dist / CONNECTION_DISTANCE) * 0.3 * connectionWeight;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }
  });
});
```

---

## Audio-Driven Animations

### Audio Mood Transitions

```typescript
// Sync visuals with audio mood changes
import { setMood } from '$engine/audio';
import { gsap } from 'gsap';

let currentMood = -1;

$effect(() => {
  if (chapter !== currentMood) {
    currentMood = chapter;
    
    // Visual transition triggered by audio mood
    const moodColors = {
      0: '#3ecfb2', // Teal - tension
      1: '#e86848', // Coral - problem
      2: '#3ecfb2', // Teal - vision resolves
      // ... etc
    };
    
    gsap.to('body', {
      '--color-accent-active': moodColors[chapter] || '#3ecfb2',
      duration: 2,
      ease: 'power2.inOut'
    });
    
    // Set the audio mood
    setMood(chapter);
  }
});
```

---

## Timing Patterns

### Stagger

```typescript
// Staggered entrance - 60ms between each element
gsap.to('.card', {
  opacity: 1,
  y: 0,
  stagger: 0.06, // 60ms - the maximum stagger allowed
  duration: 0.8,
  ease: 'power3.out',
  scrollTrigger: {
    trigger: cardsContainer,
    start: 'top 70%'
  }
});
```

### Sequence Timing

```typescript
// Choreographed sequence - multiple elements at specific times
const sequence = gsap.timeline({
  scrollTrigger: {
    trigger: sectionElement,
    start: 'top 60%',
    end: 'top 20%',
    scrub: false
  }
});

// Headline: 0-1s
sequence.to(headline, { opacity: 1, y: 0, duration: 1 })
// Stats: 1-2.5s (staggered)
  .to('.stat', { opacity: 1, y: 0, duration: 0.5, stagger: 0.15 }, '-=0.5')
// CTA: 2.5-3s
  .to(cta, { opacity: 1, y: 0, duration: 0.5 }, '-=0.25');
```

---

## Performance Considerations

### GPU Acceleration

```css
/* Always promote animated elements to GPU */
.animated-element {
  will-change: transform, opacity;
  transform: translateZ(0); /* Force GPU layer */
}
```

### Cleanup

```typescript
// Always clean up animations on component destroy
onDestroy(() => {
  // Kill GSAP tweens
  tl?.kill();
  
  // Kill ScrollTriggers
  ScrollTrigger.getAll()
    .filter(t => t.vars.trigger === sectionElement)
    .forEach(t => t.kill());
  
  // Dispose Three.js resources
  scene?.traverse(obj => {
    if (obj.geometry) obj.geometry.dispose();
    if (obj.material) {
      if (Array.isArray(obj.material)) {
        obj.material.forEach(m => m.dispose());
      } else {
        obj.material.dispose();
      }
    }
  });
  renderer?.dispose();
});
```

### Mobile Considerations

```typescript
// Detect mobile/low-end and reduce animations
const isMobile = window.matchMedia('(max-width: 768px)').matches;
const isLowEnd = navigator.hardwareConcurrency < 4;

const particleCount = isMobile ? 30000 : isLowEnd ? 60000 : 150000;
const useWebGPU = !isMobile && !!navigator.gpu;
const useComplexAnimations = !isMobile && !isLowEnd;
```

---

## Accessibility

### Respect `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

```typescript
// In JavaScript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Skip complex animations
  element.style.opacity = '1';
  element.style.transform = 'none';
} else {
  // Run animations normally
  gsap.to(element, { opacity: 1, duration: 1 });
}
```

---

## Best Practices Checklist

- [ ] Every animation has a clear purpose (reveal, guide, feedback)
- [ ] No animations on initial page load before user interaction
- [ ] Maximum stagger is 60ms
- [ ] Easing is always `cubic-bezier(0.16, 1, 0.3, 1)` (cinematic) or similar
- [ ] All animations clean up in `onDestroy`
- [ ] Mobile has reduced particle counts and simplified animations
- [ ] `prefers-reduced-motion` is respected
- [ ] Numbers count UP (except the degradation counter in Problem chapter)
- [ ] 3D scenes dispose() properly on unmount

---

*Next: [Deployment Guide](DEPLOYMENT.md)*