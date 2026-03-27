// Demo Types for VIVIM Demo System

export interface DemoState {
  id: string;
  activeTab: string;
  isLoading: boolean;
  error: DemoError | null;
  preferences: DemoPreferences;
  session: DemoSession;
}

export interface DemoPreferences {
  config: Record<string, any>;
  filters: Record<string, any>;
  settings: {
    animations: boolean;
    sounds: boolean;
    verbose: boolean;
  };
}

export interface DemoSession {
  currentStep: number;
  history: any[];
  tempData: Record<string, any>;
}

export interface DemoError {
  type: DemoErrorType;
  message: string;
  code?: string;
  recoverable: boolean;
  action?: () => void;
}

export enum DemoErrorType {
  NETWORK = 'network',
  VALIDATION = 'validation',
  EXTRACT = 'extract',
  SYNC = 'sync',
  DECRYPT = 'decrypt',
}

// Layer Budget Types
export interface Layer {
  id: string;
  label: string;
  sublabel: string;
  color: string;
  tokens: number;
  maxTokens: number;
  state: LayerState;
  content: string;
  priority: 'LOCKED' | 'HIGH' | 'MEDIUM' | 'STANDARD';
}

export type LayerState = 'locked' | 'ready' | 'clearing' | 'building' | 'scanning';

export interface LayerBudget {
  id: string;
  label: string;
  maxTokens: number;
  priority: 'LOCKED' | 'HIGH' | 'MEDIUM' | 'STANDARD';
  tokens?: number;
}

export interface BudgetConfig {
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

export interface BudgetResult {
  layers: LayerBudget[];
  totalTokens: number;
  efficiencyScore: number;
  overBudget: boolean;
}

// Animation Types
export interface AnimationConfig {
  durations: {
    instant: number;
    fast: number;
    normal: number;
    slow: number;
    page: number;
  };
  easings: {
    crisp: number[];
    smooth: number[];
    bounce: number[];
  };
  spring: {
    gentle: number[];
    bouncy: number[];
    stiff: number[];
  };
}

// Extraction Types
export interface ExtractionResult {
  keywords: string[];
  entities: string[];
  memories: import('./memory').ExtractedMemory[];
  confidence: number;
}
