# Performance & Testing Strategy

## Performance Targets

Based on Cinematic Platform specifications:

| Metric | Target | Priority |
|--------|--------|----------|
| First Contentful Paint (FCP) | < 1.2s | P0 |
| Largest Contentful Paint (LCP) | < 2.5s | P0 |
| Lighthouse Mobile Score | > 85 | P1 |
| Time to Interactive (TTI) | < 3.5s | P1 |
| Bundle Size (initial JS) | < 180kb gzipped | P1 |
| API Response Time | < 100ms | P2 |
| Analytics Write Latency | < 50ms | P2 |

---

## Performance Strategies

### 1. Code Splitting

```typescript
// Dynamic imports for heavy components
const ParticleBackground = dynamic(
  () => import('@/components/cinematic/ParticleBackground'),
  { ssr: false, loading: () => <div className="min-h-screen bg-void" /> }
);

const AudioEngine = dynamic(
  () => import('@/components/cinematic/AudioToggle'),
  { ssr: false }
);
```

### 2. Lazy Load Chapters

```typescript
// Don't load all chapters upfront
const CHAPTERS = {
  overview: () => import('@/components/cinematic/chapters/OverviewChapter'),
  problem: () => import('@/components/cinematic/chapters/ProblemChapter'),
  // ...
};

// Load current + next chapter only
const loadedChapters = useMemo(() => [
  CHAPTERS[currentChapter](),
  CHAPTERS[currentChapter + 1]?.()
].filter(Boolean), [currentChapter]);
```

### 3. Image Optimization

```typescript
// Use Next.js Image for all images
import Image from 'next/image';

<Image
  src="/hero.png"
  alt="VIVIM Hero"
  width={1200}
  height={630}
  priority
  loading="eager"
/>
```

### 4. Font Optimization

- Inter and JetBrains Mono already optimized via `next/font/google`
- Preload critical weights
- Subset to latin only (already done)

### 5. Particle System Limits

| Device | Max Particles |
|--------|--------------|
| Desktop | 150,000 |
| Tablet | 50,000 |
| Mobile | 30,000 |

---

## Testing Strategy

### Current State

- No existing tests
- Playwright in lockfile (unused)

### Recommended Approach

```bash
# Install testing dependencies
bun add -D vitest @testing-library/react @testing-library/jest-dom jsdom
bun add -D @playwright/test
```

### 1. Unit Tests (Vitest)

```typescript
// tests/unit/scroll-engine.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useScrollEngine } from '@/hooks/useScroll';

describe('useScrollEngine', () => {
  it('calculates chapter progress correctly', () => {
    const { result } = renderHook(() => useScrollEngine(9));
    
    // Simulate scroll to 50%
    act(() => {
      // Trigger scroll event
    });
    
    expect(result.current.chapter).toBe(4);
  });
});
```

### 2. Component Tests (Testing Library)

```typescript
// tests/components/ChapterNavigation.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { ChapterNavigation } from '@/components/cinematic/ChapterNavigation';

describe('ChapterNavigation', () => {
  it('renders correct number of dots', () => {
    render(<ChapterNavigation total={9} current={3} />);
    expect(screen.getAllByRole('button')).toHaveLength(9);
  });

  it('calls scrollToChapter on click', () => {
    const scrollTo = vi.fn();
    render(<ChapterNavigation total={9} current={3} onNavigate={scrollTo} />);
    
    fireEvent.click(screen.getAllByRole('button')[5]);
    expect(scrollTo).toHaveBeenCalledWith(5);
  });
});
```

### 3. E2E Tests (Playwright)

```typescript
// tests/e2e/cinematic-flow.spec.ts
import { test, expect } from '@playwright/test';

test('full cinematic experience', async ({ page }) => {
  await page.goto('/');
  
  // Verify hero loads
  await expect(page.locator('h1')).toContainText('Living Memory');
  
  // Scroll through chapters
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  
  // Verify chapter transitions
  await expect(page.locator('[data-chapter="overview"]')).toBeVisible();
  
  // Verify audio toggle works
  await page.click('[data-testid="audio-toggle"]');
});
```

### Test Coverage Targets

| Type | Target |
|------|--------|
| Unit Tests | 70% coverage |
| Component Tests | Key components covered |
| E2E Tests | Critical user flows |

---

## Error Handling

### 1. Error Boundaries

```typescript
// components/cinematic/ChapterErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ChapterErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };
  
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Chapter error:', error, info.componentStack);
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <p>Something went wrong loading this section.</p>
        </div>
      );
    }
    
    return this.props.children;
  }
}
```

### 2. Fallback Components

```typescript
// Graceful degradation for heavy features

// If particles fail to load
const ParticleFallback = () => (
  <div className="fixed inset-0 bg-void -z-10" />
);

// If audio fails
const AudioFallback = () => null; // Silent failure

// If chapter fails to load
const ChapterFallback = ({ chapterId }: { chapterId: string }) => (
  <section className="min-h-screen flex items-center justify-center">
    <div className="text-center">
      <h2 className="text-2xl font-bold mb-2">Loading {chapterId}...</h2>
      <p className="text-muted">Please wait</p>
    </div>
  </section>
);
```

### 3. Network Error Handling

```typescript
// API error responses
export function errorResponse(code: string, message: string, status = 400) {
  return NextResponse.json(
    { success: false, error: { code, message } },
    { status }
  );
}

// In API routes
export async function GET() {
  try {
    const data = await fetchExperience();
    return successResponse(data);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return errorResponse('NOT_FOUND', 'Experience not found', 404);
    }
    console.error('API Error:', error);
    return errorResponse('INTERNAL_ERROR', 'Something went wrong', 500);
  }
}
```

---

## Monitoring

### 1. Performance Monitoring

```typescript
// Track Core Web Vitals
'use client';

import { useEffect } from 'react';

export function useWebVitals() {
  useEffect(() => {
    import('web-vitals').then(({ onCLS, onLCP, onFCP, onTTFB }) => {
      onCLS(console.log);
      onLCP(console.log);
      onFCP(console.log);
      onTTFB(console.log);
    });
  }, []);
}
```

### 2. Error Tracking

```typescript
// Global error handler
if (typeof window !== 'undefined') {
  window.addEventListener('error', (event) => {
    // Send to analytics
    trackEvent({ type: 'error', data: { message: event.message } });
  });
  
  window.addEventListener('unhandledrejection', (event) => {
    trackEvent({ type: 'unhandled_error', data: { reason: event.reason } });
  });
}
```

---

## Checklist

- [ ] Install Vitest and Testing Library
- [ ] Set up Playwright
- [ ] Create test utilities
- [ ] Write unit tests for scroll engine
- [ ] Write component tests for ChapterNavigation
- [ ] Write E2E test for full flow
- [ ] Add error boundaries to chapters
- [ ] Add fallback components
- [ ] Implement web vitals tracking
- [ ] Set up error tracking
- [ ] Define performance budgets
- [ ] Add bundle analysis to build

---

*Related: [DECISIONS_LOG.md](DECISIONS_LOG.md) for open decisions*
