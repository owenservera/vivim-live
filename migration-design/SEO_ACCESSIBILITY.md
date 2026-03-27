# SEO & Accessibility Strategy

## Current SEO Status

The current VIVIM site has excellent SEO:
- Complete metadata in `layout.tsx`
- JSON-LD structured data
- OpenGraph tags
- Twitter Card configuration
- Canonical URLs

---

## Challenge: Scroll-Based Experience

Single-page scroll experiences pose SEO challenges:
- Content not discoverable by traditional crawlers
- JavaScript-heavy rendering
- Hash navigation not indexed

---

## Strategy: Hybrid Approach

### 1. URL Structure

Use hash-based chapter navigation with server-rendered content:

```
https://vivim.live/                    → Overview chapter
https://vivim.live/#problem            → Problem chapter
https://vivim.live/#solution           → Solution chapter
https://vivim.live/#acus               → ACU section
https://vivim.live/#principles         → Principles section
```

### 2. Server-Rendered Fallback Content

```typescript
// For each chapter, include semantic HTML that crawlers can parse
<section id="overview" data-chapter="overview">
  <h1>The Living Memory for Your AI</h1>
  <p>Sovereign • Portable • Personal</p>
  <!-- Full content for crawlers -->
  <article>
    <h2>About VIVIM</h2>
    <p>Full description...</p>
  </article>
</section>
```

### 3. Progressive Enhancement

```typescript
// Client-side: Full cinematic experience
'use client';

export function ChapterSection({ chapter, children }) {
  const { progress } = useScroll();
  
  return (
    <motion.section
      style={{ opacity: progress > chapter.start ? 1 : 0 }}
    >
      {children}
    </motion.section>
  );
}

// Server-rendered: Semantic HTML (hidden visually, visible to crawlers)
export function ChapterContent({ chapter, children }) {
  return (
    <>
      {/* Visible to users with JS */}
      <div className="cinematic-content" aria-hidden="true">
        {children}
      </div>
      
      {/* Visible to crawlers, hidden from users */}
      <noscript>
        <div className="seo-content">
          {children}
        </div>
      </noscript>
    </>
  );
}
```

---

## Meta Tags Per Chapter

```typescript
// Dynamic metadata based on chapter
export async function generateMetadata({ hash }): Promise<Metadata> {
  const chapterMeta: Record<string, Partial<Metadata>> = {
    '': {
      title: 'VIVIM - Sovereign AI Memory',
      description: 'The living memory for your AI. Sovereign, portable, personal.',
    },
    'problem': {
      title: 'The Problem - AI Forgets Everything',
      description: 'Every AI conversation starts broken. Context windows are limited and actively work against you.',
    },
    'solution': {
      title: 'The Solution - VIVIM',
      description: 'VIVIM provides intelligent context management and persistent memory that works with all AI providers.',
    },
    // ...
  };
  
  return {
    ...chapterMeta[hash || ''],
    openGraph: {
      ...chapterMeta[hash || ''],
      url: `https://vivim.live/${hash ? `#${hash}` : ''}`,
    },
  };
}
```

---

## Structured Data

### Organization Schema

```typescript
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "VIVIM",
  "url": "https://vivim.live",
  "logo": "https://vivim.live/logo.png",
  "description": "Sovereign, portable, personal AI memory"
};
```

### SoftwareApplication Schema

```typescript
const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "VIVIM",
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Web",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
};
```

---

## Accessibility (a11y)

### Current State

- Basic accessibility (semantic HTML)
- Focus states in CSS

### Cinematic Challenges

1. **Scroll-jacking** - Can interfere with keyboard navigation
2. **Motion** - Must respect `prefers-reduced-motion`
3. **Focus Management** - Chapters need logical focus order
4. **Screen Readers** - Must announce chapter changes

### Implementation

#### 1. Reduced Motion

```typescript
// Respect user preference
import { useReducedMotion } from 'framer-motion';

function AnimatedSection() {
  const shouldReduceMotion = useReducedMotion();
  
  if (shouldReduceMotion) {
    return <StaticContent />;
  }
  
  return <AnimatedContent />;
}
```

#### 2. Keyboard Navigation

```typescript
// Allow skip to content
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>

// Keyboard-accessible chapter navigation
function ChapterNav() {
  return (
    <nav aria-label="Chapters">
      {chapters.map((chapter, i) => (
        <a
          key={chapter.id}
          href={`#${chapter.id}`}
          aria-current={isActive(chapter.id) ? 'step' : undefined}
        >
          {chapter.title}
        </a>
      ))}
    </nav>
  );
}
```

#### 3. Screen Reader Announcements

```typescript
// Announce chapter changes
import { useLiveRegion } from '@/hooks/useLiveRegion';

function ChapterOrchestrator() {
  const announce = useLiveRegion();
  
  useEffect(() => {
    if (chapter !== lastChapter) {
      announce(`Now viewing: ${chapters[chapter].title}`);
    }
  }, [chapter]);
  
  return (
    <>
      <div aria-live="polite" className="sr-only" />
      <Chapters />
    </>
  );
}
```

#### 4. Focus Management

```typescript
// Focus trap in modals/dialogs
function AudioModal() {
  return (
    <Dialog>
      <DialogTitle>Enable Audio</DialogTitle>
      {/* Focus automatically trapped in Dialog */}
    </Dialog>
  );
}
```

---

## ARIA Guidelines

### Chapter Structure

```html
<main id="main-content">
  <section id="overview" aria-labelledby="overview-heading" data-chapter="overview">
    <h1 id="overview-heading">The Living Memory for Your AI</h1>
    <!-- Content -->
  </section>
  
  <section id="problem" aria-labelledby="problem-heading" data-chapter="problem">
    <h2 id="problem-heading">Every AI Conversation Starts Broken</h2>
    <!-- Content -->
  </section>
</main>
```

### Progress Indicator

```html
<nav aria-label="Chapter progress">
  <ol role="list">
    <li>
      <a href="#overview" aria-current="true">
        <span class="sr-only">Chapter 1:</span>
        Overview
        <span class="sr-only">(current)</span>
      </a>
    </li>
    <!-- ... -->
  </ol>
</nav>
```

---

## Checklist

- [ ] Implement hash-based chapter navigation
- [ ] Add dynamic metadata per chapter
- [ ] Preserve JSON-LD structured data
- [ ] Add server-rendered fallback content
- [ ] Implement reduced motion support
- [ ] Add keyboard navigation
- [ ] Add screen reader announcements
- [ ] Test with axe-core
- [ ] Validate structured data (Schema.org)
- [ ] Test with Google Rich Results Test
- [ ] Verify with Lighthouse accessibility audit

---

## Testing Tools

| Tool | Purpose |
|------|---------|
| Google Rich Results Test | Validate structured data |
| Lighthouse | SEO & accessibility audit |
| axe DevTools | Automated accessibility testing |
| WAVE | Web accessibility evaluation |
| NVDA | Screen reader testing |
| Keyboard-only navigation | Test without mouse |

---

*Related: [DECISIONS_LOG.md](DECISIONS_LOG.md) for open decisions*
