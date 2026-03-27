# Animation Migration

## Theatre.js + GSAP → Framer Motion

The Cinematic Platform uses three animation systems:
1. **Theatre.js** - Scripted, choreographed sequences
2. **GSAP ScrollTrigger** - Scroll-reactive animations
3. **CSS Transitions** - Simple state changes

Since we're using Next.js with Framer Motion, we need to replicate these patterns.

---

## Animation System Mapping

| Cinematic Tool | Framer Motion Equivalent | Complexity |
|----------------|-------------------------|------------|
| Theatre.js sequences | `motion` variants + `AnimatePresence` | Medium |
| GSAP ScrollTrigger | `useScroll` + `useTransform` hooks | Medium |
| CSS transitions | `motion.div` with `transition` | Low |
| Three.js particles | Canvas/Three.js (keep) | High |

---

## Pattern 1: Scroll-Triggered Animations

### Cinematic (GSAP)

```typescript
// GSAP ScrollTrigger pattern
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: sectionElement,
    start: 'top 70%',
    end: 'top 30%',
    scrub: true
  }
});

tl.to('.stat-1', { opacity: 1, y: 0, duration: 0.5 })
  .to('.stat-2', { opacity: 1, y: 0, duration: 0.5 }, '-=0.3');
```

### Target (Framer Motion)

```typescript
// Framer Motion scroll pattern
import { motion, useScroll, useTransform } from 'framer-motion';

export function ScrollRevealedSection({ children }: { children: React.ReactNode }) {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'center center']
  });
  
  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [50, 0]);
  
  return (
    <motion.div
      ref={ref}
      style={{ opacity, y }}
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
```

---

## Pattern 2: Counter Animation

### Cinematic (GSAP)

```typescript
// Animated number counter
function animateCounter(element, from, to, duration) {
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
```

### Target (Framer Motion)

```typescript
// components/cinematic/AnimatedCounter.tsx
'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView, useSpring, useMotionValue, useTransform } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  start?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

export function AnimatedCounter({
  value,
  start = 0,
  duration = 2.5,
  prefix = '',
  suffix = '',
  decimals = 0
}: AnimatedCounterProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  
  const motionValue = useMotionValue(start);
  const springValue = useSpring(motionValue, {
    duration: duration * 1000,
    bounce: 0
  });
  
  const display = useTransform(springValue, (latest) => 
    `${prefix}${latest.toFixed(decimals)}${suffix}`
  );
  
  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);
  
  return (
    <motion.span ref={ref} className="tabular-nums">
      <motion.span>{display}</motion.span>
    </motion.span>
  );
}
```

---

## Pattern 3: Staggered Entrance

### Cinematic (GSAP)

```typescript
gsap.to('.card', {
  opacity: 1,
  y: 0,
  stagger: 0.06, // 60ms max
  duration: 0.8,
  ease: 'power3.out'
});
```

### Target (Framer Motion)

```typescript
// Staggered children animation
<motion.div
  variants={{
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.06 }
    }
  }}
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true }}
>
  {items.map((item) => (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
      {item}
    </motion.div>
  ))}
</motion.div>
```

---

## Pattern 4: Pinning

### Cinematic (GSAP)

```typescript
ScrollTrigger.create({
  trigger: pinSection,
  start: 'top top',
  end: '+=2000',
  pin: true,
  scrub: true
});
```

### Target (Framer Motion)

```typescript
// Use sticky positioning + scroll progress
import { useScroll, useTransform, motion } from 'framer-motion';

export function PinnedSection({ children }: { children: React.ReactNode }) {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '-100%']);
  
  return (
    <div ref={containerRef} className="h-[200vh] relative">
      <motion.div 
        style={{ y }}
        className="sticky top-0 h-screen"
      >
        {children}
      </motion.div>
    </div>
  );
}
```

---

## Pattern 5: Sequence Choreography

### Cinematic (Theatre.js)

```typescript
const headlineObj = sheet.object('headline', {
  opacity: t.number(0, { range: [0, 1] }),
  translateY: t.number(40, { range: [-100, 100] })
});

headlineObj.onValuesChange(({ opacity, translateY }) => {
  headLine.style.opacity = String(opacity);
  headLine.style.transform = `translateY(${translateY}px)`;
});

sheet.sequence.play({ range: [0, 4], loop: false });
```

### Target (Framer Motion)

```typescript
// Choreographed sequence with timeline
import { motion, useAnimationControls } from 'framer-motion';

export function ChoreographedHeadline({ headline, subhead }: Props) {
  const controls = useAnimationControls();
  
  useEffect(() => {
    const sequence = async () => {
      await controls.start({ opacity: 1, y: 0, transition: { duration: 1 } });
      await controls.start({ opacity: 1, y: 0, transition: { delay: 0.5, duration: 0.8 } });
    };
    sequence();
  }, [controls]);
  
  return (
    <>
      <motion.h1
        animate={controls}
        initial={{ opacity: 0, y: 40 }}
      >
        {headline}
      </motion.h1>
      <motion.p
        animate={controls}
        initial={{ opacity: 0, y: 20 }}
      >
        {subhead}
      </motion.p>
    </>
  );
}
```

---

## Cinematic Easing

### The Cinematic Curve

```typescript
// Framer Motion custom easing
const cinematicTransition = {
  duration: 0.8,
  ease: [0.16, 1, 0.3, 1] // Matches cubic-bezier(0.16, 1, 0.3, 1)
};

// Or use spring for bounce-less feel
const cinematicSpring = {
  type: 'spring',
  stiffness: 100,
  damping: 20,
  mass: 1
};
```

---

## Scroll-Linked Color Transitions

### Cinematic (GSAP + Audio)

```typescript
const moodColors = {
  0: '#3ecfb2', // Teal - tension
  1: '#e86848', // Coral - problem
  2: '#3ecfb2', // Teal - vision
};

gsap.to('body', {
  '--color-accent-active': moodColors[chapter],
  duration: 2,
  ease: 'power2.inOut'
});
```

### Target (Framer Motion)

```typescript
// Color transition tied to chapter
import { useScroll, useMotionValueEvent } from 'framer-motion';

export function ChapterColorTransition({ chapter }: { chapter: number }) {
  const accentColors = ['#3ecfb2', '#e86848', '#3ecfb2'];
  const backgroundColor = useTransform(
    () => chapter,
    [0, 1, 2],
    accentColors
  );
  
  return (
    <motion.div
      style={{ 
        backgroundColor,
        position: 'fixed',
        inset: 0,
        zIndex: -1
      }}
    />
  );
}
```

---

## Accessibility: Reduced Motion

```typescript
// Respect prefers-reduced-motion
import { motion, useReducedMotion } from 'framer-motion';

export function ReducedMotionWrapper({ children }: { children: React.ReactNode }) {
  const shouldReduceMotion = useReducedMotion();
  
  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0 }}
      animate={shouldReduceMotion ? false : { opacity: 1 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.8 }}
    >
      {children}
    </motion.div>
  );
}
```

---

## Animation Checklist

- [ ] Create `useScroll` hook with Lenis integration
- [ ] Build scroll-triggered animation patterns
- [ ] Implement AnimatedCounter with Framer Motion
- [ ] Create staggered entrance utilities
- [ ] Add pinning/sticky patterns
- [ ] Implement sequence choreography
- [ ] Add chapter color transitions
- [ ] Ensure `prefers-reduced-motion` support

---

*Next: [Data Migration](DATA_MIGRATION.md)*
