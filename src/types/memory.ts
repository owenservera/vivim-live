// Memory Types for VIVIM Demos

export type MemoryType =
  | "IDENTITY"
  | "PREFERENCE"
  | "DECISION"
  | "FACT"
  | "REASONING"
  | "CODE"
  | "QUESTION"
  | "GOAL"
  | "EPISODIC"
  | "SEMANTIC"
  | "PROCEDURAL"
  | "FACTUAL";

export interface ExtractedMemory {
  id: string;
  content: string;
  type: MemoryType;
  confidence: number;
  connections: string[];
  timestamp?: Date;
  source?: string;
  pinned?: boolean;
  cacheHit?: boolean;
  layer?: string;
}

export interface ACU {
  id: string;
  type: MemoryType;
  content: string;
  confidence: number;
  layer: string;
  source: string;
  pinned: boolean;
  cacheHit: boolean;
}

export interface JitAcu {
  id: string;
  name: string;
  type: string;
  confidence: number;
}

export interface GraphNode {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  label: string;
  type?: string;
}

export interface GraphEdge {
  from: string;
  to: string;
  strength: number; // 0-1 for opacity/width
}

// Memory Type Metadata
export const MEMORY_TYPES: Record<MemoryType, {
  label: string;
  color: string;
  bg: string;
  border: string;
  description: string;
}> = {
  IDENTITY: {
    label: 'Identity',
    color: 'text-violet-400',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/30',
    description: 'User identity and profile information'
  },
  PREFERENCE: {
    label: 'Preference',
    color: 'text-indigo-400',
    bg: 'bg-indigo-500/10',
    border: 'border-indigo-500/30',
    description: 'User preferences and choices'
  },
  DECISION: {
    label: 'Decision',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    description: 'Decisions and choices made'
  },
  FACT: {
    label: 'Fact',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    description: 'Factual information'
  },
  REASONING: {
    label: 'Reasoning',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    description: 'Reasoning and thought processes'
  },
  CODE: {
    label: 'Code',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    description: 'Code snippets and patterns'
  },
  QUESTION: {
    label: 'Question',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    description: 'Questions and queries'
  },
  GOAL: {
    label: 'Goal',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    description: 'Goals and objectives'
  },
  EPISODIC: {
    label: 'Episodic',
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/30',
    description: 'Episodic memories and events'
  },
  SEMANTIC: {
    label: 'Semantic',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-500/30',
    description: 'Semantic knowledge'
  },
  PROCEDURAL: {
    label: 'Procedural',
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    description: 'Procedural knowledge'
  },
  FACTUAL: {
    label: 'Factual',
    color: 'text-blue-400',
    bg: 'bg-blue-500/15',
    border: 'border-blue-500/30',
    description: 'Factual statements'
  }
};
