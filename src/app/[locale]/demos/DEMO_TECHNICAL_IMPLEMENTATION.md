# VIVIM Demo Technical Implementation Roadmap

## Executive Summary

This document provides the technical implementation roadmap for enhancing VIVIM demos, including specific code patterns, component architectures, and integration approaches for each proposed feature.

---

## Phase 1: Foundation Infrastructure

### 1.1 Demo State Management System

#### Shared Hooks Library
```typescript
// src/hooks/useDemoState.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { DemoError, DemoState, DemoPreferences, DemoSession } from '@/types/demo';

// Core demo state hook
export function useDemoState<T extends DemoState = any>(initialState: T) {
  const [state, setState] = useState<T>(initialState);

  // Persist preferences to localStorage
  const updatePreferences = useCallback((updater: Partial<DemoPreferences>) => {
    setState(prev => ({
      ...prev,
      preferences: { ...prev.preferences, ...updater }
    }));
    // Persist to localStorage
    localStorage.setItem(`demo-${initialState.id}-preferences`, JSON.stringify({
      ...state.preferences,
      ...updater
    }));
  }, [state.preferences]);

  // Manage session state (ephemeral)
  const updateSession = useCallback((updater: Partial<DemoSession>) => {
    setState(prev => ({
      ...prev,
      session: { ...prev.session, ...updater }
    }));
  }, []);

  // Error handling
  const setError = useCallback((error: DemoError | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  // Reset to initial
  const reset = useCallback(() => {
    setState(initialState);
    // Also clear localStorage preferences
    localStorage.removeItem(`demo-${initialState.id}-preferences`);
  }, [initialState]);

  return {
    state,
    setState,
    updatePreferences,
    updateSession,
    setError,
    reset,
  };
}

// Async operations hook
export function useDemoAsync<T, P = any[]>(
  asyncFn: (...args: P) => Promise<T>
) {
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: DemoError | null;
  }>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (...args: P) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const data = await asyncFn(...args);
      setState({ data, loading: false, error: null });
    } catch (err) {
      const error: DemoError = {
        type: 'validation',
        message: err.message,
        code: err.code,
        recoverable: true,
      };
      setState({ data: null, loading: false, error });
    }
  }, [asyncFn]);

  return { state, execute, reset: () => setState({ data: null, loading: false, error: null }) };
}
```

#### Event Bus for Demo Communication
```typescript
// src/utils/demoEventBus.ts
type DemoEvent =
  | 'tab-change'
  | 'preferences-update'
  | 'session-progress'
  | 'error-occurred'
  | 'feature-interaction';

type EventHandler = (payload: any) => void;

class DemoEventBus {
  private listeners = new Map<DemoEvent, Set<EventHandler>>();

  on(event: DemoEvent, handler: EventHandler): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(handler);
    };
  }

  emit(event: DemoEvent, payload: any): void {
    this.listeners.get(event)?.forEach(handler => {
      try {
        handler(payload);
      } catch (err) {
        console.error(`Event handler error for ${event}:`, err);
      }
    });
  }

  clear(event: DemoEvent): void {
    this.listeners.delete(event);
  }

  clearAll(): void {
    this.listeners.clear();
  }
}

export const demoBus = new DemoEventBus();
```

### 1.2 Animation System

#### Animation Configuration
```typescript
// src/utils/animations.ts
import { Transition, Variants } from 'framer-motion';

export const ANIMATION_CONFIG = {
  durations: {
    instant: 150,
    fast: 250,
    normal: 350,
    slow: 500,
    page: 600,
  },
  easings: {
    crisp: [0.25, 0.1, 0.25, 1],
    smooth: [0.4, 0, 0, 1],
    bounce: [0.68, -0.55, 0.265, 1.55],
  },
  spring: {
    gentle: [200, 25],
    bouncy: [300, 30],
    stiff: [400, 30],
  },
};

// Staggered list variants
export const staggeredListVariants: Variants = {
  container: {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.04,
        staggerDirection: 1, // 1 = forward, -1 = backward
      },
    },
  },
  item: {
    hidden: { opacity: 0, x: -20, scale: 0.95 },
    show: { opacity: 1, x: 0, scale: 1 },
  },
};

// Scale on hover variants
export const scaleOnHoverVariants: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

// Modal variants
export const modalVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
};
```

#### Custom Animation Hooks
```typescript
// src/hooks/useAnimation.ts
import { useEffect, useRef, useState } from 'react';
import { ANIMATION_CONFIG } from '@/utils/animations';

// Entrance animation trigger
export function useEntranceAnimation<T = HTMLElement>(
  delay: number = 0
) {
  const ref = useRef<T>(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || hasAnimated) return;

    const timer = setTimeout(() => {
      element.classList.add('animate-in');
      setHasAnimated(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay, hasAnimated]);

  return { ref, hasAnimated };
}

// Progress animation
export function useProgressAnimation(
  progress: number,
  duration: number = ANIMATION_CONFIG.durations.normal
) {
  const [currentProgress, setCurrentProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const calculatedProgress = Math.min((elapsed / duration) * 100, progress);
      setCurrentProgress(calculatedProgress);

      if (calculatedProgress >= progress) {
        clearInterval(timer);
      }
    }, 16); // ~60fps

    return () => clearInterval(timer);
  }, [progress, duration]);

  return currentProgress;
}
```

### 1.3 Performance Optimization

#### Debounce & Throttle
```typescript
// src/utils/performance.ts
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  wait: number = 300
): T {
  let timeout: NodeJS.Timeout | null = null;
  let lastArgs: any[] | null = null;

  return ((...args: any[]) => {
    lastArgs = args;

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(() => {
      fn(...args);
    }, wait);
  }) as T;
}

export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number = 100
): T {
  let inThrottle = false;
  let lastResult: any;

  return ((...args: any[]) => {
    if (inThrottle) {
      return lastResult;
    }

    inThrottle = true;
    const result = fn(...args);
    lastResult = result;

    setTimeout(() => {
      inThrottle = false;
    }, limit);

    return result;
  }) as T;
}

export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator?: (...args: any[]) => string
): T {
  const cache = new Map<string, any>();

  return ((...args: any[]) => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
}
```

---

## Phase 2: Context Engine Demo Implementation

### 2.1 Live Input Processing

#### Mock Extraction Engine
```typescript
// src/demo-engine/mockExtractionEngine.ts
import { ExtractedMemory, MemoryType } from '@/types/memory';

interface ExtractionResult {
  keywords: string[];
  entities: string[];
  memories: ExtractedMemory[];
  confidence: number;
}

// Keyword extraction patterns
const KEYWORD_PATTERNS = [
  /\b(?:python|javascript|typescript|react|next\.js|node\.js|express|mongodb|postgres|redis)\b/gi,
  /\b(?:api|rest|graphql|webhook|endpoint|jwt|oauth|bcrypt)\b/gi,
];

// Entity extraction patterns
const ENTITY_PATTERNS = [
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g, // PascalCase class names
  /(?:@|npm:)[a-z0-9_-]+/gi, // Package names
];

// Classify memory type
function classifyMemory(content: string): MemoryType {
  const lower = content.toLowerCase();

  if (/^(i am|i'm|i have|my name is|i work as)/.test(lower)) {
    return 'IDENTITY';
  }
  if (/(?:prefer|like|want|should|always use)\b/i.test(lower)) {
    return 'PREFERENCE';
  }
  if (/^(building|creating|implementing|working on)/i.test(lower)) {
    return 'GOAL';
  }
  if (/^(debugged|fixed|solved|implemented)/i.test(lower)) {
    return 'PROCEDURAL';
  }

  // Check for factual statements
  if (/\b(?:is|are|was)\b/i.test(lower) && !/\bi\b/.test(lower)) {
    return 'FACTUAL';
  }

  // Default to episodic for conversation events
  return 'EPISODIC';
}

// Calculate confidence based on patterns
function calculateConfidence(content: string, keywords: string[]): number {
  let score = 0.5; // Base confidence

  // More keywords = higher confidence
  score += Math.min(keywords.length * 0.15, 0.3);

  // Longer statements = higher confidence
  score += Math.min(content.length / 500, 0.15);

  // Specific technical terms = higher confidence
  if (/\b(?:type|interface|function|class|const|let|var)\b/.test(content)) {
    score += 0.1;
  }

  return Math.min(score, 0.98);
}

export async function extractFromInput(input: string): Promise<ExtractionResult> {
  // Simulate async processing
  await new Promise(resolve => setTimeout(resolve, 800));

  const keywords = Array.from(new Set(
    input.match(KEYWORD_PATTERNS.flatMap(p => [...input.matchAll(p)])) || []
  ));

  const entities = Array.from(new Set(
    input.match(ENTITY_PATTERNS.flatMap(p => [...input.matchAll(p)])) || []
  ));

  const baseMemories: Omit<ExtractedMemory, 'id'>[] = [
    { content: input, type: classifyMemory(input), confidence: 0.9, connections: [] },
  ];

  // Generate contextual memories from keywords
  keywords.forEach((keyword, i) => {
    baseMemories.push({
      content: `User mentioned ${keyword}`,
      type: 'SEMANTIC',
      confidence: 0.85 + (i * 0.01),
      connections: [keyword],
    });
  });

  const memories = baseMemories.map((mem, i) => ({
    ...mem,
    id: `mem-${Date.now()}-${i}`,
  }));

  const confidence = calculateConfidence(input, keywords);

  return { keywords, entities, memories, confidence };
}
```

#### Context Budget Calculator
```typescript
// src/demo-engine/contextBudgetCalculator.ts
interface LayerBudget {
  id: string;
  label: string;
  tokens: number;
  maxTokens: number;
  priority: 'LOCKED' | 'HIGH' | 'MEDIUM' | 'STANDARD';
}

interface BudgetConfig {
  totalBudget: number;
  layers: Record<string, number>;
  privacy: {
    includeIdentity: boolean;
    includeTopic: boolean;
    includeEntity: boolean;
    includeArc: boolean;
    includeJIT: boolean;
  };
}

export function calculateContextBudget(config: BudgetConfig): {
  layers: LayerBudget[];
  totalTokens: number;
  efficiencyScore: number;
  overBudget: boolean;
} {
  const BASE_LAYERS: LayerBudget[] = [
    { id: 'L0', label: 'Identity Core', maxTokens: 500, priority: 'LOCKED' },
    { id: 'L1', label: 'Response Style', maxTokens: 800, priority: 'HIGH' },
    { id: 'L2', label: 'Topic Context', maxTokens: 3000, priority: 'HIGH' },
    { id: 'L3', label: 'Entity Context', maxTokens: 2000, priority: 'MEDIUM' },
    { id: 'L4', label: 'Conversation Arc', maxTokens: 4000, priority: 'HIGH' },
    { id: 'L5', label: 'JIT Retrieval', maxTokens: 2000, priority: 'MEDIUM' },
    { id: 'L6', label: 'Message History', maxTokens: 10000, priority: 'STANDARD' },
    { id: 'L7', label: 'Live Input', maxTokens: 500, priority: 'LOCKED' },
  ];

  const activeLayers = BASE_LAYERS.filter(layer => {
    // Check privacy settings
    if (layer.id === 'L0' && !config.privacy.includeIdentity) return false;
    if (layer.id === 'L2' && !config.privacy.includeTopic) return false;
    if (layer.id === 'L3' && !config.privacy.includeEntity) return false;
    if (layer.id === 'L4' && !config.privacy.includeArc) return false;
    if (layer.id === 'L5' && !config.privacy.includeJIT) return false;
    return true;
  });

  // Calculate tokens per layer (mock for demo)
  const layersWithTokens = activeLayers.map(layer => {
    const customBudget = config.layers[layer.id];
    const tokens = customBudget !== undefined
      ? Math.min(customBudget, layer.maxTokens)
      : Math.floor(layer.maxTokens * (0.3 + Math.random() * 0.4));

    return { ...layer, tokens };
  });

  const totalTokens = layersWithTokens.reduce((sum, layer) => sum + layer.tokens, 0);
  const efficiencyScore = Math.min(100, Math.max(0,
    100 - Math.abs((totalTokens - config.totalBudget) / config.totalBudget * 100)
  ));

  return {
    layers: layersWithTokens,
    totalTokens,
    efficiencyScore,
    overBudget: totalTokens > config.totalBudget,
  };
}
```

### 2.2 Context Assembly Visualization

#### Layer Animation Component
```typescript
// src/components/LayerProgressBar.tsx
import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface LayerProgressBarProps {
  current: number;
  max: number;
  color: string;
  label: string;
  building?: boolean;
  onEdit?: (value: number) => void;
}

export function LayerProgressBar({
  current,
  max,
  color,
  label,
  building = false,
  onEdit,
}: LayerProgressBarProps) {
  const fillPercent = useMemo(() => Math.min((current / max) * 100, 100), [current, max]);
  const isOver = current > max;

  return (
    <div className="flex items-center gap-3 py-1.5">
      <div className="flex-shrink-0">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 border"
          style={{
            color,
            borderColor: `${color}40`,
            backgroundColor: `${color}12`,
          }}
        >
          {label}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1 gap-2">
          <span className="text-xs text-slate-400 truncate">{label}</span>
          <span className="text-xs font-mono text-slate-500 flex-shrink-0">
            {isOver ? `${current.toLocaleString()} / ${max.toLocaleString()}` : `${current.toLocaleString()}t`}
          </span>
        </div>

        <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden relative">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            initial={{ width: `${fillPercent}%` }}
            animate={{ width: `${fillPercent}%` }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            style={{
              backgroundColor: building ? '#F59E0B' : color,
            }}
          />
          {building && (
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1s ease infinite',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
```

#### JIT Retrieval Animation
```typescript
// src/components/JITAcuChip.tsx
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

interface JITAcuChipProps {
  name: string;
  type: string;
  confidence: number;
  delay: number;
}

export function JITAcuChip({ name, type, confidence, delay }: JITAcuChipProps) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: 160, opacity: 0, scale: 0.85 }}
        animate={{ x: 0, opacity: 1, scale: 1 }}
        exit={{ x: -60, opacity: 0, scale: 0.5 }}
        transition={{
          type: 'spring',
          stiffness: 220,
          damping: 22,
          delay,
        }}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs"
      >
        <Zap className="w-3 h-3 text-amber-400 flex-shrink-0" />
        <span className="text-amber-300 font-mono truncate max-w-[140px]">{name}</span>
        <span className="text-amber-500 font-mono text-[10px]">
          {Math.round(confidence * 100)}%
        </span>
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## Phase 3: Live Memory Demo Implementation

### 3.1 Streaming Extraction Visualization

#### Extraction Pipeline Component
```typescript
// src/components/ExtractionPipeline.tsx
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExtractionStage {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'complete';
  icon: ReactNode;
}

const EXTRACTION_STAGES: ExtractionStage[] = [
  { id: 'segment', name: 'Segmenting conversation', status: 'pending', icon: '✂️' },
  { id: 'classify', name: 'Classifying ACU type', status: 'pending', icon: '🏷️' },
  { id: 'extract', name: 'Extracting entities', status: 'pending', icon: '🔍' },
  { id: 'embed', name: 'Generating embeddings', status: 'pending', icon: '📊' },
  { id: 'store', name: 'Storing in database', status: 'pending', icon: '💾' },
];

export function ExtractionPipeline({ active }: { active: boolean }) {
  const [currentStage, setCurrentStage] = useState(0);

  useEffect(() => {
    if (!active) {
      setCurrentStage(0);
      return;
    }

    // Animate through stages
    let stage = 0;
    const interval = setInterval(() => {
      stage++;
      setCurrentStage(Math.min(stage, EXTRACTION_STAGES.length - 1));

      if (stage >= EXTRACTION_STAGES.length) {
        clearInterval(interval);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [active]);

  return (
    <div className="flex items-center gap-2">
      {EXTRACTION_STAGES.map((stage, i) => (
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: i === currentStage ? 1 : 0.4,
            scale: i === currentStage ? 1 : 0.9,
          }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border"
          style={{
            borderColor: i === currentStage ? '#F59E0B' : '#334155',
            backgroundColor: i === currentStage ? '#F59E0B15' : '#1e293b20',
          }}
        >
          <span className="text-lg">{stage.icon}</span>
          <span className="text-xs text-slate-300">{stage.name}</span>
          {i === currentStage && (
            <motion.div
              className="w-2 h-2 rounded-full bg-emerald-400"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}
```

#### Memory Timeline Component
```typescript
// src/components/MemoryTimeline.tsx
import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExtractedMemory, MEMORY_TYPES } from '@/types/memory';

interface MemoryTimelineProps {
  memories: ExtractedMemory[];
  filter?: MemoryType | 'ALL';
}

export function MemoryTimeline({ memories, filter = 'ALL' }: MemoryTimelineProps) {
  const filteredMemories = useMemo(() => {
    if (filter === 'ALL') return memories;
    return memories.filter(m => m.type === filter);
  }, [memories, filter]);

  const groupedByTime = useMemo(() => {
    const groups = new Map<string, ExtractedMemory[]>();
    filteredMemories.forEach(mem => {
      const timeKey = new Date(mem.timestamp).toDateString();
      if (!groups.has(timeKey)) groups.set(timeKey, []);
      groups.get(timeKey)!.push(mem);
    });
    return Array.from(groups.entries());
  }, [filteredMemories]);

  return (
    <div className="space-y-4">
      {groupedByTime.map(([date, dayMemories], i) => (
        <motion.div
          key={date}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="text-xs font-medium text-slate-400 mb-2">{date}</div>
          <div className="relative pl-4 border-l-2 border-slate-700">
            {dayMemories.map((mem, j) => {
              const meta = MEMORY_TYPES[mem.type];

              return (
                <motion.div
                  key={mem.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: j * 0.08 }}
                  className="relative mb-3"
                >
                  <div
                    className={`absolute -left-4 top-0 w-2 h-full rounded-full ${meta.bg}`}
                  />
                  <div className={`p-3 rounded-lg border text-xs ${meta.bg} ${meta.border}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-mono font-bold tracking-wide ${meta.color}`}>
                        {meta.label}
                      </span>
                      <span className="text-slate-500">{Math.round(mem.confidence * 100)}% conf</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{mem.content}</p>
                    {mem.connections.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {mem.connections.map(conn => (
                          <span
                            key={conn}
                            className="px-1.5 py-0.5 rounded bg-white/10 text-slate-500 text-[10px]"
                          >
                            {conn}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
```

---

## Phase 4: Knowledge Graph Demo Implementation

### 4.1 Interactive Graph Visualization

#### Canvas-Based Graph Component
```typescript
// src/components/InteractiveKnowledgeGraph.tsx
import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';

interface GraphNode {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  label: string;
}

interface GraphEdge {
  from: string;
  to: string;
  strength: number; // 0-1 for opacity/width
}

export function InteractiveKnowledgeGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [camera, setCamera] = useState({ x: 0, y: 0, zoom: 1 });

  // Generate initial graph
  useEffect(() => {
    const initialNodes: GraphNode[] = [
      { id: 'you', x: 400, y: 300, radius: 20, color: '#10B981', label: 'You' },
      { id: 'express', x: 250, y: 200, radius: 12, color: '#8B5CF6', label: 'Express.js' },
      { id: 'postgres', x: 500, y: 400, radius: 12, color: '#06B6D4', label: 'PostgreSQL' },
      { id: 'auth', x: 350, y: 350, radius: 8, color: '#F59E0B', label: 'Auth' },
      { id: 'api', x: 420, y: 280, radius: 8, color: '#8B5CF6', label: 'API' },
    ];

    const initialEdges: GraphEdge[] = [
      { from: 'you', to: 'express', strength: 0.8 },
      { from: 'you', to: 'postgres', strength: 0.6 },
      { from: 'express', to: 'auth', strength: 0.9 },
      { from: 'auth', to: 'api', strength: 0.7 },
    ];

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, []);

  // Drawing function
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Apply camera transform
    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);

    // Draw edges first
    edges.forEach(edge => {
      const fromNode = nodes.find(n => n.id === edge.from);
      const toNode = nodes.find(n => n.id === edge.to);
      if (!fromNode || !toNode) return;

      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);

      ctx.strokeStyle = `rgba(100, 116, 139, ${edge.strength})`;
      ctx.lineWidth = 2 * edge.strength;
      ctx.stroke();
    });

    // Draw nodes
    nodes.forEach(node => {
      const isSelected = node.id === selectedNode;
      const radius = isSelected ? node.radius * 1.2 : node.radius;

      // Glow effect for selected
      if (isSelected) {
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 20;
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // Draw label
      ctx.fillStyle = '#ffffff';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y + radius + 15);
    });

    ctx.restore();
  }, [nodes, edges, selectedNode, camera]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrame: number;

    const animate = () => {
      draw();
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [draw]);

  // Click handler
  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / camera.zoom - camera.x;
    const y = (e.clientY - rect.top) / camera.zoom - camera.y;

    // Find clicked node
    const clicked = nodes.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < node.radius;
    });

    setSelectedNode(clicked?.id || null);
  }, [nodes, camera]);

  // Drag handler for panning
  const handleCanvasDrag = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const dx = e.movementX;
    const dy = e.movementY;
    setCamera(prev => ({ x: prev.x + dx, y: prev.y + dy }));
  }, []);

  return (
    <div className="rounded-xl bg-slate-900/50 border border-white/5 overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-white/5">
        <span className="text-sm font-medium text-white">Interactive Knowledge Graph</span>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button onClick={() => setCamera(prev => ({ ...prev, zoom: Math.max(0.5, prev.zoom - 0.1) }))}>
            Zoom Out
          </button>
          <span>{Math.round(camera.zoom * 100)}%</span>
          <button onClick={() => setCamera(prev => ({ ...prev, zoom: Math.min(2, prev.zoom + 0.1) }))}>
            Zoom In
          </button>
          <button onClick={() => setCamera({ x: 0, y: 0, zoom: 1 })}>
            Reset View
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        onClick={handleCanvasClick}
        onMouseDown={handleCanvasDrag}
        className="w-full cursor-grab active:cursor-grabbing"
        style={{ imageRendering: 'pixelated' }}
      />
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-4 left-4 p-3 rounded-lg bg-slate-800/90 border border-cyan-500/30"
        >
          <p className="text-sm text-white font-medium mb-2">
            {nodes.find(n => n.id === selectedNode)?.label}
          </p>
          <div className="text-xs text-slate-400">
            Click anywhere to deselect
          </div>
        </motion.div>
      )}
    </div>
  );
}
```

### 4.2 Node Detail Panel
```typescript
// src/components/GraphNodeDetail.tsx
import { ExtractedMemory, MEMORY_TYPES } from '@/types/memory';
import { motion } from 'framer-motion';

interface GraphNodeDetailProps {
  node: ExtractedMemory | null;
  relatedNodes: ExtractedMemory[];
  onClose: () => void;
}

export function GraphNodeDetail({ node, relatedNodes, onClose }: GraphNodeDetailProps) {
  if (!node) return null;

  const meta = MEMORY_TYPES[node.type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="absolute bottom-4 right-4 w-80 rounded-xl bg-slate-800/90 border border-white/10 p-4"
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 rounded text-slate-400 hover:text-white"
      >
        ×
      </button>

      <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg ${meta.bg} ${meta.border}`}>
        <span className={`font-mono font-bold tracking-wide ${meta.color}`}>
          {meta.label}
        </span>
        <span className="text-slate-500">{Math.round(node.confidence * 100)}% conf</span>
      </div>

      <p className="text-sm text-slate-300 mb-4">{node.content}</p>

      <div className="mb-4">
        <h4 className="text-xs font-medium text-slate-400 mb-2">Connections</h4>
        <div className="flex flex-wrap gap-2">
          {node.connections.map((conn, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="px-2 py-1 rounded bg-white/10 text-slate-400 text-xs"
            >
              {conn}
            </motion.span>
          ))}
        </div>
      </div>

      <button
        onClick={onClose}
        className="w-full py-2 rounded-lg bg-violet-600/20 text-violet-400 text-sm font-medium border border-violet-500/30"
      >
        View Full Context
      </button>
    </motion.div>
  );
}
```

---

## Phase 5: Provider Import Demo Implementation

### 5.1 Import Wizard Component

```typescript
// src/components/ImportWizard.tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type ImportStep = 'select-provider' | 'upload-file' | 'parse-progress' | 'review-acus' | 'confirm';

interface ImportWizardProps {
  onComplete: () => void;
}

export function ImportWizard({ onComplete }: ImportWizardProps) {
  const [currentStep, setCurrentStep] = useState<ImportStep>('select-provider');
  const [progress, setProgress] = useState(0);
  const [extractedACUs, setExtractedACUs] = useState(0);
  const [duplicates, setDuplicates] = useState(0);

  const steps = [
    { id: 'select-provider', label: 'Select Provider', icon: '🔌' },
    { id: 'upload-file', label: 'Upload File', icon: '📁' },
    { id: 'parse-progress', label: 'Parse Progress', icon: '⚙️' },
    { id: 'review-acus', label: 'Review ACUs', icon: '📊' },
    { id: 'confirm', label: 'Confirm Import', icon: '✓' },
  ];

  const nextStep = () => {
    const stepOrder = ['select-provider', 'upload-file', 'parse-progress', 'review-acus', 'confirm'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1] as ImportStep);
    }
  };

  // Simulate parsing progress
  useEffect(() => {
    if (currentStep !== 'parse-progress') return;

    const interval = setInterval(() => {
      setProgress(prev => Math.min(prev + 2, 100));
    }, 50);

    // Complete parsing after reaching 100%
    const timeout = setTimeout(() => {
      clearInterval(interval);
      setExtractedACUs(2847);
      setDuplicates(23);
      setCurrentStep('review-acus');
    }, 3000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [currentStep]);

  return (
    <div className="max-w-2xl mx-auto">
      {/* Step indicators */}
      <div className="flex items-center justify-between mb-8">
        {steps.map((step, i) => {
          const isCompleted = steps.indexOf(step.id) < steps.indexOf(currentStep);
          const isCurrent = step.id === currentStep;
          const isPending = !isCompleted && !isCurrent;

          return (
            <div key={step.id} className="flex-1 flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                  isCompleted ? 'bg-emerald-500' : isCurrent ? 'bg-violet-500' : 'bg-slate-700'
                }`}
              >
                {isCompleted && <span>✓</span>}
                {!isCompleted && step.icon}
              </div>
              <span
                className={`text-xs mt-2 ${
                  isCompleted ? 'text-emerald-400' : isCurrent ? 'text-white font-medium' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
              {/* Connection line */}
              {i < steps.length - 1 && (
                <div className={`h-0.5 flex-1 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-700'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {currentStep === 'parse-progress' && (
            <div className="text-center py-12">
              <div className="text-6xl font-bold text-violet-400 mb-4">{progress}%</div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden max-w-md mx-auto">
                <motion.div
                  className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-sm text-slate-400 mt-4">Extracting ACUs from {progress.toFixed(0)}% complete...</p>
            </div>
          )}

          {currentStep === 'review-acus' && (
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="p-6 rounded-xl bg-slate-800/50">
                <div className="text-4xl font-bold text-emerald-400">{extractedACUs}</div>
                <div className="text-xs text-slate-500 mt-1">ACUs Extracted</div>
              </div>
              <div className="p-6 rounded-xl bg-slate-800/50">
                <div className="text-4xl font-bold text-cyan-400">{duplicates}</div>
                <div className="text-xs text-slate-500 mt-1">Duplicates Found</div>
              </div>
              <div className="p-6 rounded-xl bg-slate-800/50">
                <div className="text-4xl font-bold text-violet-400">{extractedACUs - duplicates}</div>
                <div className="text-xs text-slate-500 mt-1">Unique ACUs</div>
              </div>
            </div>
          )}

          {currentStep === 'confirm' && (
            <div className="text-center py-8">
              <button
                onClick={onComplete}
                className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium"
              >
                Import {extractedACUs - duplicates} ACUs
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
```

---

## Phase 6: Network Demo Implementation

### 6.1 Live Network Visualization

```typescript
// src/components/LiveNetworkVisualization.tsx
import { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Peer {
  id: string;
  name: string;
  x: number;
  y: number;
  status: 'connected' | 'syncing' | 'offline';
  lastSync: string;
}

export function LiveNetworkVisualization() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [peers, setPeers] = useState<Peer[]>([]);
  const [transferActive, setTransferActive] = useState(false);

  // Generate initial peer mesh
  useEffect(() => {
    const initialPeers: Peer[] = [
      { id: 'you', name: 'Your Device', x: 400, y: 250, status: 'connected', lastSync: '2 min ago' },
      { id: 'peer-a', name: 'Peer Alpha', x: 250, y: 180, status: 'connected', lastSync: '1 min ago' },
      { id: 'peer-b', name: 'Peer Beta', x: 500, y: 300, status: 'syncing', lastSync: '5 min ago' },
      { id: 'peer-c', name: 'Peer Gamma', x: 350, y: 380, status: 'connected', lastSync: '10 min ago' },
      { id: 'peer-d', name: 'Peer Delta', x: 450, y: 200, status: 'connected', lastSync: 'Just now' },
    ];
    setPeers(initialPeers);
  }, []);

  // Animation loop for network visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrame: number;
    let pulsePhase = 0;

    const animate = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connections
      peers.forEach((peer, i) => {
        if (i === 0) return; // Skip first peer (you)
        peers.slice(0, i).forEach(other => {
          const opacity = 0.3 + Math.sin(pulsePhase) * 0.2;
          ctx.beginPath();
          ctx.moveTo(peer.x, peer.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = `rgba(100, 116, 139, ${opacity})`;
          ctx.lineWidth = 2;
          ctx.stroke();

          // Data transfer animation
          if (transferActive && Math.random() > 0.95) {
            const progress = (Date.now() % 1000) / 1000;
            const startX = peer.x + (other.x - peer.x) * progress;
            const startY = peer.y + (other.y - peer.y) * progress;

            ctx.beginPath();
            ctx.arc(startX, startY, 3, 0, Math.PI * 2);
            ctx.fillStyle = '#10B981';
            ctx.fill();
          }
        });
      });

      // Draw peers
      peers.forEach(peer => {
        const isOnline = peer.status !== 'offline';
        const isPulsing = peer.status === 'syncing';
        const radius = isOnline ? 15 : 10;

        // Status color
        let color = '#ef4444'; // offline (red)
        if (peer.status === 'connected') color = '#10B981'; // online (green)
        if (peer.status === 'syncing') color = '#F59E0B'; // syncing (amber)

        // Glow for online peers
        if (isOnline) {
          const glowSize = 20 + Math.sin(pulsePhase) * 5;
          const gradient = ctx.createRadialGradient(color, radius, 0, glowSize, 0, glowSize);
          gradient.addColorStop(0, color);
          gradient.addColorStop(1, 'transparent');
          ctx.beginPath();
          ctx.arc(peer.x, peer.y, glowSize, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
        }

        // Pulsing ring for syncing peers
        if (isPulsing) {
          const pulseRadius = radius + 3 + Math.sin(pulsePhase) * 2;
          ctx.beginPath();
          ctx.arc(peer.x, peer.y, pulseRadius, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(245, 158, 11, ${0.3 + Math.sin(pulsePhase) * 0.2})`;
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Main node
        ctx.beginPath();
        ctx.arc(peer.x, peer.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();

        // Status dot
        ctx.beginPath();
        ctx.arc(peer.x, peer.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = '11px system-ui';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(peer.name, peer.x, peer.y + radius + 12);
      });

      pulsePhase += 0.05;
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [peers, transferActive]);

  // Simulate data transfer
  useEffect(() => {
    const interval = setInterval(() => {
      setTransferActive(true);
      setTimeout(() => setTransferActive(false), 2000);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="rounded-xl bg-slate-900/50 border border-white/5 overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-white/5">
        <span className="text-sm font-medium text-white">Live Network Mesh</span>
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${transferActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
            Data Transfer
          </span>
          <button onClick={() => setPeers(prev => [...prev])}>Add Peer</button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="w-full"
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}
```

---

## Phase 7: Security Demo Implementation

### 7.1 Encryption Flow Visualization

```typescript
// src/components/EncryptionFlowVisualization.tsx
import { useState } from 'react';
import { motion } from 'framer-motion';

type EncryptionStage = 'idle' | 'generating-keys' | 'encrypting' | 'decrypting' | 'complete';

export function EncryptionFlowVisualization() {
  const [stage, setStage] = useState<EncryptionStage>('idle');
  const [progress, setProgress] = useState(0);
  const [encryptedData, setEncryptedData] = useState('');
  const [decryptedData, setDecryptedData] = useState('');

  const handleGenerateKeys = async () => {
    setStage('generating-keys');
    setProgress(0);

    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 50));
      setProgress(i);
    }

    setStage('idle');
    setEncryptedData('');
    setDecryptedData('');
  };

  const handleEncrypt = async () => {
    setStage('encrypting');
    setProgress(0);

    // Simulate encryption
    await new Promise(r => setTimeout(r, 1000));

    const data = 'Sample sensitive data: User prefers TypeScript, uses Next.js, works at VIVIM Inc.';
    const encrypted = Array.from(data).map(char => {
      const code = char.charCodeAt(0).toString(16).padStart(2, '0');
      return Math.random() > 0.5 ? code : '••';
    }).join('');

    setEncryptedData(encrypted);
    setStage('complete');
    setProgress(100);
  };

  const handleDecrypt = async () => {
    setStage('decrypting');
    setProgress(0);

    // Simulate decryption
    await new Promise(r => setTimeout(r, 1000));

    const original = 'Sample sensitive data: User prefers TypeScript, uses Next.js, works at VIVIM Inc.';
    const decrypted = encrypted.split('').map(char => {
      const code = char.charCodeAt(0).toString(16).padStart(2, '0');
      return code === code ? String.fromCharCode(parseInt(code, 16)) : char;
    }).join('');

    setDecryptedData(decrypted);
    setStage('complete');
    setProgress(100);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">End-to-End Encryption Flow</h2>
        <p className="text-sm text-slate-400">Watch encryption and decryption happen client-side</p>
      </div>

      <div className="space-y-6">
        {/* Progress indicator */}
        {stage !== 'idle' && (
          <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white capitalize">{stage.replace('-', ' ')}</span>
              <span className="text-2xl font-bold text-violet-400">{progress}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={handleGenerateKeys}
            disabled={stage !== 'idle'}
            className="p-4 rounded-xl bg-violet-600/20 text-violet-400 text-sm font-medium border border-violet-500/30 disabled:opacity-40"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔑</span>
              <span>Generate Keys</span>
            </div>
          </button>

          <button
            onClick={handleEncrypt}
            disabled={stage !== 'idle' || encryptedData === ''}
            className="p-4 rounded-xl bg-cyan-600/20 text-cyan-400 text-sm font-medium border border-cyan-500/30 disabled:opacity-40"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔒</span>
              <span>Encrypt Data</span>
            </div>
          </button>

          <button
            onClick={handleDecrypt}
            disabled={stage !== 'idle' || decryptedData !== ''}
            className="p-4 rounded-xl bg-emerald-600/20 text-emerald-400 text-sm font-medium border border-emerald-500/30 disabled:opacity-40"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">🔓</span>
              <span>Decrypt Data</span>
            </div>
          </button>
        </div>

        {/* Results display */}
        {(encryptedData || decryptedData) && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
              <h3 className="text-xs font-medium text-amber-400 mb-2">Encrypted Output</h3>
              <p className="text-xs font-mono text-slate-300 break-all leading-relaxed">{encryptedData}</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5">
              <h3 className="text-xs font-medium text-emerald-400 mb-2">Decrypted Output</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{decryptedData}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## Implementation Priority Order

### Phase 1: Foundation (Week 1-2)
```
1. Implement useDemoState hook across all demos
2. Create demoEventBus for cross-demo communication
3. Build animation configuration and custom hooks
4. Add performance utilities (debounce, throttle, memoize)
5. Set up TypeScript types for demo-specific interfaces
```

### Phase 2: Context Engine (Week 3-4)
```
1. Build mock extraction engine with classification
2. Implement context budget calculator
3. Create LayerProgressBar with animation
4. Build JITAcuChip component
5. Add live input processing to context engine demo
6. Connect budget sliders to real calculator
7. Implement ACU Memory Store with real-time updates
```

### Phase 3: Live Memory (Week 5-6)
```
1. Create ExtractionPipeline component with stages
2. Build MemoryTimeline with filters
3. Add streaming extraction visualization
4. Implement memory quality scoring display
5. Add confidence animation for extracted memories
6. Connect to mock extraction engine
```

### Phase 4: Knowledge Graph (Week 7-8)
```
1. Build canvas-based InteractiveKnowledgeGraph
2. Implement pan/zoom functionality
3. Add node selection and detail panel
4. Create edge visualization with strength
5. Add graph animation system
6. Implement node clustering for entities
```

### Phase 5: Provider Import (Week 9-10)
```
1. Create multi-step ImportWizard component
2. Build file upload with drag-drop
3. Implement parsing progress simulation
4. Add ACU review interface
5. Create cross-provider search component
6. Implement deduplication visualization
7. Add export format selection
```

### Phase 6: Network (Week 11-12)
```
1. Build LiveNetworkVisualization with animated mesh
2. Implement peer status indicators
3. Add data transfer visualization
4. Create CRDT conflict simulation
5. Build latency/bandwidth metrics display
6. Add federation protocol demo
```

### Phase 7: Security (Week 13-14)
```
1. Create EncryptionFlowVisualization
2. Implement key generation animation
3. Build encryption/decryption flow
4. Add access control interface
5. Create audit log viewer
6. Implement permission management
7. Add privacy controls dashboard
```

---

## Testing Strategy

### Unit Testing
```typescript
// Test hooks
describe('useDemoState', () => {
  it('should initialize with provided state', () => {
    const { state } = useDemoState({ id: 'test', activeTab: 'overview' });
    expect(state.id).toBe('test');
  });

  it('should persist preferences to localStorage', () => {
    const { updatePreferences } = useDemoState({ id: 'test', activeTab: 'overview' });
    updatePreferences({ animations: true });

    const saved = localStorage.getItem('demo-test-preferences');
    expect(saved).toBeTruthy();
  });
});

// Test components
describe('LayerProgressBar', () => {
  it('should display correct fill percentage', () => {
    render(<LayerProgressBar current={500} max={1000} color="#8B5CF6" label="L2" />);
    expect(screen.getByText('500/1000t')).toBeInTheDocument();
  });

  it('should show warning when over budget', () => {
    render(<LayerProgressBar current={1200} max={1000} color="#8B5CF6" label="L2" />);
    expect(screen.getByText('1200 / 1000')).toBeInTheDocument();
  });
});
```

### E2E Testing
```typescript
// Demo flow tests
describe('Context Engine Demo Flow', () => {
  it('should complete full extraction workflow', async () => {
    render(<ContextEngineDemo />);

    // Type input
    const input = screen.getByPlaceholderText('Type to see extraction...');
    fireEvent.change(input, { target: { value: 'I am a Python developer' } });

    // Trigger extraction
    const extractBtn = screen.getByText('Extract');
    fireEvent.click(extractBtn);

    // Wait for extraction to complete
    await waitFor(() => {
      expect(screen.getByText(/Python/i)).toBeInTheDocument();
    });
  });

  it('should handle budget slider changes', () => {
    render(<ContextEngineDemo />);

    const slider = screen.getByRole('slider');
    fireEvent.change(slider, { target: { value: 500 } });

    expect(screen.getByText(/500t/)).toBeInTheDocument();
  });
});
```

---

## Success Metrics

### Demo Readiness Criteria
```
Each demo must achieve:

✅ Foundation
  - State management implemented
  - Animation system ready
  - Performance utilities available
  - TypeScript types complete

✅ Interactive Features
  - User can input real data
  - Visual feedback for all actions
  - Progressive disclosure implemented
  - Error handling in place

✅ OpenCore Alignment
  - Maps to documented features
  - Shows real algorithm behavior
  - Demonstrates unique differentiators

✅ Performance
  - 60fps animations
  - No layout thrashing
  - Efficient re-renders
  - Proper debouncing

✅ Accessibility
  - Keyboard navigation works
  - Screen reader announcements
  - Focus management correct
  - ARIA labels present

✅ Code Quality
  - TypeScript strict mode
  - No any types
  - Comprehensive tests
  - Documentation complete
```

---

*Document Version: 1.0*
*Generated: March 2026*
*Reference: VIVIM Demo Enhancement Proposals*
