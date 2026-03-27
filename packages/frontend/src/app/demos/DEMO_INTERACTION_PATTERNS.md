# VIVIM Demo Interactive Design Patterns

## Executive Summary

This document defines the interaction design patterns and user experience paradigms that should be applied consistently across all VIVIM demos to create realistic, engaging demonstrations that mirror actual product behavior.

---

## Core Interaction Principles

### 1. Immediate Feedback (100-300ms rule)
```
Every user action must provide visual feedback within 300ms
No user should wonder "did that work?"

Examples:
- Button click: immediate scale/opacity change + ripple effect
- Input focus: border color change + label elevation
- Loading state: skeleton appears within 150ms
- Success state: checkmark or confirmation appears instantly
```

### 2. Progressive Disclosure
```
Don't overwhelm users - reveal information progressively
Show what's relevant now, what can be expanded

Pattern:
- Level 1: Core visible (always show main UI)
- Level 2: Details on hover/tap (expandable sections)
- Level 3: Advanced behind toggle (power user features)
- Level 4: Debug/developer mode (hidden behind specific action)
```

### 3. Error Recovery
```
When things go wrong, don't just show an error
Provide a path forward

Pattern:
1. Clear problem statement
2. Suggested action (button)
3. Alternative path (link)
4. Retry capability (automatic or manual)
```

### 4. State Persistence
```
Demos should remember user's choices across sessions
Use localStorage for lightweight state

Pattern:
- Save user preferences (budget, privacy settings, filters)
- Save session progress (which tab, which flow step)
- Restore on page load with transition
- Show "Continue where you left off" indicator
```

---

## Demo-Specific Patterns

## Context Engine Demo

### Pattern: Live Assembly Watcher
```
Instead of static scenarios, show real-time context building

User Action: Type any message
System Response:
1. Show parsing indicator
2. Extract keywords/entities (animated chips)
3. Display relevant ACUs appearing one by one
4. Calculate and show token budget
5. Render final assembled context

Visual Feedback:
- Input field with char count
- Extracted items fly in with staggered animation (50ms delay each)
- Token bar fills progressively
- "Assembling..." progress indicator
- Final context appears with flash effect
```

### Pattern: Budget Playground
```
Let users experiment with context assembly

User Actions:
- Drag layer budget sliders
- Toggle privacy controls
- Click "Apply" to see effect

Visual Feedback:
- Sliders show real-time token count
- Total budget bar fills/empties
- "Over budget" warning when exceeded
- Preview updates live as changes happen
- Show "Efficiency Score" that recalculates

State Management:
- Budget config object
- Current tokens calculation
- Efficiency score algorithm (based on target budget)
```

## Live Memory Demo

### Pattern: Streaming Extraction
```
Show memories being extracted as AI thinks

User Action: Continue conversation or paste sample
System Response:
1. Show AI "thinking" state
2. Stream extracted memories one by one
3. Animate confidence scores building
4. Show classification decision process

Visual Feedback:
- Typing indicator with pulsing animation
- Memory cards slide in from side (staggered)
- Each memory type has unique color + animation
- Confidence score animates to final value (0 → 0.95)
- Type badge appears with bounce effect
```

### Pattern: Memory Timeline
```
Show memory formation over conversation

User Action: Review extracted memories
System Response:
- Timeline of memories with timestamps
- Filter controls by type/date
- Click memory to see details

Visual Feedback:
- Vertical timeline line
- Memory nodes positioned on timeline
- Connected memories show relationship lines
- Hover expands node to show metadata
```

## Knowledge Graph Demo

### Pattern: Interactive Exploration
```
Let users explore the graph, not just view it

User Actions:
- Click nodes to see details
- Drag to pan, scroll to zoom
- Click edges to see relationship strength
- Search within graph

Visual Feedback:
- Selected node highlights with glow
- Connected nodes highlight subtly
- Edge thickness shows relationship strength
- Tooltip on hover with node info
- Path highlighting when showing connections
```

### Pattern: Graph Animation
```
Show the graph growing and changing

System Response:
- New nodes animate in from center
- Edges grow from node to node
- Clusters pulsate when formed
- Re-layout animation on new connections

Visual Feedback:
- Elastic animation for new connections (spring physics)
- Node radius grows on connection count
- Color shift for different entity types
- Particle effects for major graph updates
```

## Provider Import Demo

### Pattern: Multi-Step Wizard
```
Guide users through import process

Steps:
1. Select provider
2. Upload file (drag-drop or picker)
3. Parse progress (with stage names)
4. Review extracted ACUs
5. Confirm import

Visual Feedback:
- Progress bar with current stage highlighted
- Animated counters (ACUs extracted, duplicates found)
- "Parsing..." with rotating loader
- Success screen with statistics
```

### Pattern: Cross-Provider Search
```
Unified search across all providers

User Actions:
- Type search query
- Filter by provider/type
- Sort by relevance/date

Visual Feedback:
- Real-time results appear
- Source tags on each result
- Relevance score badge
- Loading skeleton for next page
- "No results" empty state with helpful tips
```

## Network Demo

### Pattern: Live Peer Mesh
```
Show network state changing in real-time

User Actions:
- Toggle online/offline mode
- Manually connect to peer
- View sync status

Visual Feedback:
- Peers animate in/out of mesh
- Connection lines pulse when data transfers
- Latency shown with color coding (green/yellow/red)
- Bandwidth usage bars animate up/down
```

### Pattern: CRDT Conflict Simulation
```
Demonstrate conflict-free merging

User Actions:
- Create concurrent edit on same node
- Watch merge process step by step
- See final resolved state

Visual Feedback:
- Show original node with two edit indicators
- Merge animation with arrows pointing to resolution
- Final state highlights with success glow
- "Conflict resolved" toast notification
```

## Security Demo

### Pattern: Encryption Flow
```
Show end-to-end encryption visually

User Actions:
- Generate new key pair
- Encrypt sample data
- Try to decrypt

Visual Feedback:
- Key generation with spinning key icon
- Lock animates to locked state
- Data transforms to encrypted representation (random string)
- Decryption with key icon animating unlock
- Success checkmark when decrypted
```

### Pattern: Access Trail
```
Show comprehensive audit log

User Actions:
- Filter logs by date/type
- Export audit trail
- Revoke access

Visual Feedback:
- Log entries with icons (trusted/untrusted)
- Click to expand details
- "Verified" checkmark on signed entries
- Timestamps in relative time format
```

## Collaboration Demo

### Pattern: Circle Workspace
```
Interactive team space management

User Actions:
- Create new circle
- Add/remove members
- Set permissions matrix
- Share content to circle

Visual Feedback:
- Members slide in with animation
- Permission chips toggle with checkmark
- "Invite sent" toast notification
- Avatar grid for members
```

### Pattern: Share Creation Wizard
```
Guided secure share creation

Steps:
1. Select content
2. Configure permissions (view/annotate/remix/reshare)
3. Set expiration
4. Generate encrypted link
5. Copy to clipboard with success indicator

Visual Feedback:
- Permission pills with icons
- Expiration selector with relative time preview
- QR code for mobile scanning
- Link generation with progress
- "Copied" animation + tooltip
```

---

## Component Library Patterns

### Reusable Demo Components

```typescript
// Animated Counter
// Use for showing metrics building up
interface AnimatedCounter {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  animate?: boolean;
}

// Progress Stage
// Show multi-step processes
interface ProgressStage {
  name: string;
  status: 'pending' | 'active' | 'complete' | 'error';
  icon?: ReactNode;
  details?: string;
}

// Interactive Node
// For graph/network visualizations
interface InteractiveNode {
  id: string;
  label: string;
  data: any;
  onClick?: () => void;
  onHover?: () => void;
  selected?: boolean;
}

// Toast Notification
// Feedback for user actions
interface Toast {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}

// Modal Dialog
// For focused interactions
interface Modal {
  isOpen: boolean;
  title: string;
  children: ReactNode;
  onClose?: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}
```

---

## Animation Library

### Standard Durations (ms)
```typescript
const DURATIONS = {
  instant: 150,      // Micro-interactions
  fast: 250,         // Hover effects
  normal: 350,       // Most transitions
  slow: 500,          // Panel expands
  page: 600,         // Page loads
};

const EASINGS = {
  crisp: 'easeOut',
  smooth: 'easeInOut',
  bounce: 'backOut',
  spring: [300, 30], // stiffness, damping
};
```

### Animation Patterns

```typescript
// StaggeredList - items appear one by one
<AnimatePresence>
  {items.map((item, i) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.08 }}
    />
  ))}
</AnimatePresence>

// ScaleOnHover - subtle grow on interaction
<motion.div
  whileHover={{ scale: 1.02 }}
  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
/>

// SlideInFromSide - directional entry
<motion.div
  initial={{ opacity: 0, x: direction === 'left' ? -50 : 50 }}
  animate={{ opacity: 1, x: 0 }}
/>

// PulseOnActive - breathing animation for active states
<motion.div
  animate={{
    scale: [1, 1.05, 1],
    opacity: [1, 0.7, 1],
  }}
  transition={{ duration: 2, repeat: Infinity }}
/>
```

---

## State Management Patterns

### Demo State Architecture

```typescript
// Each demo should have consistent state structure
interface DemoState {
  // Core demo state
  activeTab: string;
  isLoading: boolean;
  error: string | null;

  // User preferences (persisted)
  preferences: DemoPreferences;

  // Session data (ephemeral)
  session: DemoSession;
}

interface DemoPreferences {
  // What user has configured
  config: Record<string, any>;
  filters: Record<string, any>;
  settings: {
    animations: boolean;
    sounds: boolean;
    verbose: boolean;
  };
}

interface DemoSession {
  // Current demo session state
  currentStep: number;
  history: any[];
  tempData: Record<string, any>;
}

// Persistence hook
function useDemoPersistence<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(initial);

  useEffect(() => {
    // Load from localStorage
    const saved = localStorage.getItem(key);
    if (saved) setState(JSON.parse(saved));
  }, [key]);

  const save = useCallback((value: T) => {
    setState(value);
    localStorage.setItem(key, JSON.stringify(value));
  }, []);

  return [state, save];
}
```

---

## Error Handling Patterns

### Error Types

```typescript
enum DemoErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  EXTRACT = 'extract',
  SYNC = 'sync',
  DECRYPT = 'decrypt',
}

interface DemoError {
  type: DemoErrorType;
  message: string;
  code?: string;
  recoverable: boolean;
  action?: () => void;
}

// Error display component
function DemoErrorAlert({ error }: { error: DemoError }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-lg bg-red-500/10 border border-red-500/30"
    >
      <AlertCircle className="w-5 h-5 text-red-400 mb-2" />
      <h3 className="text-sm font-semibold text-red-400">{error.message}</h3>
      {error.recoverable && (
        <div className="flex gap-2 mt-3">
          <button onClick={error.action} className="text-xs text-red-400 underline">
            Try again
          </button>
        </div>
      )}
    </motion.div>
  );
}
```

### Recovery Strategies

```typescript
// Network errors
if (error.type === DemoErrorType.NETWORK) {
  // Retry with exponential backoff
  retryWithBackoff(request, 3);
}

// Validation errors
if (error.type === DemoErrorType.VALIDATION) {
  // Show inline error + fix suggestion
  showInlineError(error);
  highlightProblematicField();
}

// Extraction errors
if (error.type === DemoErrorType.EXTRACT) {
  // Fallback to mock data
  useMockData(true);
  showWarning("Using demo data due to extraction failure");
}

// Sync errors
if (error.type === DemoErrorType.SYNC) {
  // Queue for retry
  queueForRetry(operation);
}
```

---

## Accessibility Patterns

### Keyboard Navigation
```typescript
// All interactive elements must be keyboard accessible
interface KeyboardNavigable {
  tab: string;
  nextTab: () => void;
  prevTab: () => void;
  escape: () => void;
  enter: () => void;
}

// Implement in demos
useEffect(() => {
  const handleKey = (e: KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowRight':
        nextTab?.();
        break;
      case 'ArrowLeft':
        prevTab?.();
        break;
      case 'Escape':
        escape?.();
        break;
      case 'Enter':
        enter?.();
        break;
    }
  };
  window.addEventListener('keydown', handleKey);
  return () => window.removeEventListener('keydown', handleKey);
}, [nextTab, prevTab, escape, enter]);
```

### Screen Reader Support
```typescript
// ARIA attributes for all interactive elements
<button
  aria-label="Switch to Context Assembly tab"
  aria-selected={activeTab === 'context'}
  role="tab"
>
  Context Assembly
</button>

// Live regions announcements
<motion.div
  role="status"
  aria-live="polite"
  aria-atomic="true"
>
  Processing 3 memories...
</motion.div>

// Error announcements
{error && (
  <div role="alert" aria-live="assertive">
    {error.message}
  </div>
)}
```

---

## Performance Guidelines

### Optimizations
```typescript
// Debounce expensive operations
function useDebounce<T>(fn: (arg: T) => void, delay: number) {
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  return useCallback((arg: T) => {
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => fn(arg), delay);
  }, [fn, delay]);
}

// Throttle frequent updates
function useThrottle<T>(fn: (arg: T) => void, limit: number) {
  const lastRun = useRef(0);
  return useCallback((arg: T) => {
    const now = Date.now();
    if (now - lastRun.current >= limit) {
      fn(arg);
      lastRun.current = now;
    }
  }, [fn, limit]);
}

// Memoize expensive calculations
const expensiveCalc = useMemo(() => {
  return data.reduce(/* complex logic */);
}, [data]);
```

### Rendering Optimizations
```typescript
// Virtualization for long lists
import { FixedSizeList as List } from 'react-window';

<List
  height={400}
  itemCount={items.length}
  itemSize={60}
  itemData={items}
>
  {({ index, style }) => (
    <div style={style}>
      {items[index]}
    </div>
  )}
</List>

// Code splitting for large demos
const ContextEngine = lazy(() => import('./context-engine'));
const LiveMemory = lazy(() => import('./live-memory'));
```

---

## Success Metrics

### Demo Quality Indicators
```
Each demo should demonstrate:

✅ Core Concept
  - What is the main feature VIVIM provides?
  - Can user explain it back?

✅ Real Interactivity
  - Can user input, configure, control?
  - Is there real feedback for every action?

✅ Progressive Disclosure
  - Simple state for beginners?
  - Advanced controls for explorers?
  - Clear path from basic to complex?

✅ Error Handling
  - What happens when things go wrong?
  - Is there a recovery path?

✅ Visual Feedback
  - Does user know their action registered?
  - Can they see the result of their input?

✅ Accessibility
  - Can keyboard users navigate?
  - Is screen reader content meaningful?

✅ Performance
  - Does it feel responsive?
  - No janky animations?
```

### Demo Completion Checklist
```
Before shipping each demo, verify:

□ Core concept is clear
□ First-time user understands within 10 seconds
□ All interactive elements provide feedback
□ Errors have recovery paths
□ Animations are 300ms or faster
□ Keyboard navigation works
□ Screen reader announcements present
□ State persists if appropriate
□ Performance is 60fps smooth
□ Works on mobile (responsive)
□ Works on dark/light mode (if applicable)
```

---

*Document Version: 1.0*
*Generated: March 2026*
*Reference: VIVIM Demo Enhancement Proposals*
