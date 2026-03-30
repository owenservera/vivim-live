/**
 * TRANSLATION JOB QUEUE SYSTEM - DESIGN SPECIFICATION
 * 
 * A priority-based queue system for translation jobs that considers:
 * 1. Content hierarchy (element importance)
 * 2. Viewport visibility (above/below fold)
 * 3. User interaction patterns
 * 4. Request urgency
 * 
 * ARCHITECTURE:
 * ┌─────────────────────────────────────────────────────────────────┐
 │                        JOB QUEUE MANAGER                          │
 ├─────────────────────────────────────────────────────────────────┤
 │                                                                  │
 │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
 │  │  CRITICAL    │    │  HIGH        │    │  NORMAL      │      │
 │  │  PRIORITY    │    │  PRIORITY    │    │  PRIORITY    │      │
 │  │  (0-10)     │    │  (11-20)    │    │  (21-30)    │      │
 │  └──────┬───────┘    └──────┬───────┘    └──────┬───────┘      │
 │         │                    │                    │              │
 │  ┌──────▼────────────────────▼────────────────────▼───────┐    │
 │  │              PRIORITY QUEUE (Min-Heap)                  │    │
 │  │  - O(log n) insert                                      │    │
 │  │  - O(log n) extract-min                                 │    │
 │  │  - O(1) peek                                            │    │
 │  └──────────────────────────┬───────────────────────────────┘    │
 │                             │                                    │
 │  ┌──────────────────────────▼───────────────────────────────┐   │
 │  │              SCHEDULER (Round-Robin + Priority)           │   │
 │  │  - Processes jobs based on:                               │   │
 │  │    a) Priority (primary)                                  │   │
 │  │    b) Visibility (secondary)                             │   │
 │  │    c) Age (tertiary - prevents starvation)               │   │
 │  └──────────────────────────┬───────────────────────────────┘   │
 │                             │                                    │
 └─────────────────────────────┼────────────────────────────────────┘
                              │
                              ▼
                 ┌────────────────────────┐
                 │    WORKER POOL        │
                 ├────────────────────────┤
                 │ maxConcurrent: 3      │
                 │ - Worker 1 (critical) │
                 │ - Worker 2 (high)     │
                 │ - Worker 3 (normal)   │
                 └────────────────────────┘
*/

// ============================================================================
// CONTENT HIERARCHY DEFINITION
// ============================================================================

/**
 * Content hierarchy levels define the importance of different content types
 * on a webpage. Higher values = more important = higher priority.
 */

export const CONTENT_HIERARCHY = {
  // CRITICAL (Priority 0-10): Must-translate immediately
  // - Navigation: Users see this first
  // - Interactive elements: Affects functionality
  // - Above-fold headings: Sets context
  NAVIGATION: 1,
  NAV_MENU: 1,
  BREADCRUMB: 2,
  ABOVE_FOLD_H1: 3,
  ABOVE_FOLD_H2: 4,
  ABOVE_FOLD_BUTTON: 5,
  ABOVE_FOLD_LINK: 6,
  INTERACTIVE_ELEMENT: 7, // buttons, inputs, selects
  
  // HIGH (Priority 11-20): Should-translate soon
  // - Above-fold body content
  // - Section headings
  ABOVE_FOLD_PARAGRAPH: 11,
  SECTION_HEADING: 12,
  ABOVE_FOLD_LIST: 13,
  CARD_TITLE: 14,
  MODAL_CONTENT: 15,
  
  // NORMAL (Priority 21-30): Can-translate later
  // - Below-fold content
  // - Footer content
  BELOW_FOLD_PARAGRAPH: 21,
  BELOW_FOLD_HEADING: 22,
  FOOTER_CONTENT: 25,
  HIDDEN_CONTENT: 28,
  
  // LOW (Priority 31+): Defer when possible
  // - Very low visibility
  // - Expandable/accordion content
  ACCORDION_CONTENT: 31,
  TAB_CONTENT: 32,
  LAZY_LOADED: 35,
} as const;

// Extended selector mapping for fine-grained control
export const PRIORITY_SELECTORS_V2: Array<{ selector: string; priority: number; category: string }> = [
  // CRITICAL - Navigation
  { selector: "nav, [role='navigation'], .navbar, .nav, .navigation", priority: CONTENT_HIERARCHY.NAVIGATION, category: "navigation" },
  { selector: ".breadcrumb, .breadcrumbs", priority: CONTENT_HIERARCHY.BREADCRUMB, category: "navigation" },
  
  // CRITICAL - Above fold, highest visibility
  { selector: "main h1, .hero h1, [class*='hero'] h1, header h1", priority: CONTENT_HIERARCHY.ABOVE_FOLD_H1, category: "heading" },
  { selector: "main h2, .hero h2, [class*='hero'] h2, header h2", priority: CONTENT_HIERARCHY.ABOVE_FOLD_H2, category: "heading" },
  { selector: "main button, button, [class*='btn']:not(.btn-secondary), .cta-button", priority: CONTENT_HIERARCHY.ABOVE_FOLD_BUTTON, category: "interactive" },
  { selector: "main a:not(.btn), .hero a, header a", priority: CONTENT_HIERARCHY.ABOVE_FOLD_LINK, category: "link" },
  
  // HIGH - Above fold, normal content
  { selector: "main p, .hero p, [class*='hero'] p, header p", priority: CONTENT_HIERARCHY.ABOVE_FOLD_PARAGRAPH, category: "paragraph" },
  { selector: "section h2, section h3, .section-title", priority: CONTENT_HIERARCHY.SECTION_HEADING, category: "heading" },
  { selector: "main li, .hero li", priority: CONTENT_HIERARCHY.ABOVE_FOLD_LIST, category: "list" },
  { selector: ".card h3, .card h4, .product-title, .article-title", priority: CONTENT_HIERARCHY.CARD_TITLE, category: "title" },
  { selector: ".modal-content, [role='dialog']", priority: CONTENT_HIERARCHY.MODAL_CONTENT, category: "modal" },
  
  // NORMAL - Below fold
  { selector: "footer p, footer li, footer h1, footer h2, footer h3, footer a", priority: CONTENT_HIERARCHY.FOOTER_CONTENT, category: "footer" },
  { selector: "main h3, main h4, main h5, main h6", priority: CONTENT_HIERARCHY.BELOW_FOLD_HEADING, category: "heading" },
  { selector: "main p:not(.hero p):not(header p)", priority: CONTENT_HIERARCHY.BELOW_FOLD_PARAGRAPH, category: "paragraph" },
  
  // LOW - Hidden/deferred
  { selector: "[hidden], [aria-hidden='true'], .hidden, .d-none", priority: CONTENT_HIERARCHY.HIDDEN_CONTENT, category: "hidden" },
  { selector: ".accordion-content, [data-accordion]", priority: CONTENT_HIERARCHY.ACCORDION_CONTENT, category: "accordion" },
  { selector: ".tab-content, [data-tab-content]", priority: CONTENT_HIERARCHY.TAB_CONTENT, category: "tabs" },
  { selector: "[loading='lazy'], .lazy-load", priority: CONTENT_HIERARCHY.LAZY_LOADED, category: "lazy" },
];

// ============================================================================
// JOB STATE DEFINITIONS
// ============================================================================

export enum JobStatus {
  PENDING = "pending",           // Waiting in queue
  WAITING_DEPENDENCY = "waiting", // Waiting for dependency
  PROCESSING = "processing",       // Currently being translated
  COMPLETED = "completed",         // Successfully translated
  FAILED = "failed",              // Translation failed
  CANCELLED = "cancelled",         // Manually cancelled
  EXPIRED = "expired",            // Timed out
}

export enum JobPriority {
  CRITICAL = 0,  // Must process immediately
  HIGH = 1,      // Process soon
  NORMAL = 2,    // Standard priority
  LOW = 3,       // Process when resources available
}

// Map numeric priority to JobPriority enum
export function numericToJobPriority(numeric: number): JobPriority {
  if (numeric <= 10) return JobPriority.CRITICAL;
  if (numeric <= 20) return JobPriority.HIGH;
  if (numeric <= 30) return JobPriority.NORMAL;
  return JobPriority.LOW;
}

// ============================================================================
// JOB INTERFACE
// ============================================================================

export interface TranslationJob {
  // Identity
  id: string;
  parentId?: string; // For batched jobs - parent batch ID
  
  // Content
  text: string;
  textHash: string;
  node?: Text;
  element?: HTMLElement;
  
  // Priority (computed from hierarchy + viewport + behavior)
  priority: number;
  jobPriority: JobPriority;
  
  // Metadata
  sourceLang: string;
  targetLang: string;
  context?: string;
  
  // State
  status: JobStatus;
  attempts: number;
  maxAttempts: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  lastAttemptAt?: number;
  
  // Dependencies
  dependsOn?: string[]; // Job IDs this job depends on
  
  // Result
  translatedText?: string;
  error?: string;
  
  // Visibility (computed at queue time)
  isAboveFold: boolean;
  viewportPosition?: number;
}

// ============================================================================
// BATCH INTERFACE
// ============================================================================

export interface TranslationBatch {
  id: string;
  jobs: TranslationJob[];
  
  // Batch metadata
  sourceLang: string;
  targetLang: string;
  context?: string;
  
  // Scheduling
  priority: number;
  jobPriority: JobPriority;
  createdAt: number;
  
  // State
  status: JobStatus;
  completedCount: number;
  failedCount: number;
  
  // Concurrency
  maxConcurrent: number;
  currentConcurrent: number;
}

// ============================================================================
// QUEUE STATISTICS
// ============================================================================

export interface QueueStats {
  // Counts by status
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  cancelled: number;
  
  // Counts by priority
  critical: number;
  high: number;
  normal: number;
  low: number;
  
  // Viewport
  aboveFoldPending: number;
  belowFoldPending: number;
  
  // Performance
  avgWaitTime: number;
  avgProcessTime: number;
  throughput: number; // jobs per second
  
  // Resource usage
  memoryUsage: number;
  activeWorkers: number;
}

// ============================================================================
// SCHEDULER CONFIGURATION
// ============================================================================

export interface SchedulerConfig {
  // Concurrency
  maxConcurrent: number;
  maxConcurrentPerPriority: number;
  
  // Timing
  batchDelayMs: number;
  maxWaitTimeMs: number;
  jobTimeoutMs: number;
  retryDelayMs: number;
  
  // Resource limits
  maxQueueSize: number;
  maxRetries: number;
  
  // Priority boost
  viewportBoost: number; // Extra priority for above-fold
  interactionBoost: number; // Boost for user-interacted elements
  ageWeight: number; // Prevent starvation - older jobs get priority boost
  
  // Behavior
  enableCoalescing: boolean;
  enableBatching: boolean;
  enablePrefetch: boolean;
}

export const DEFAULT_SCHEDULER_CONFIG: SchedulerConfig = {
  maxConcurrent: 3,
  maxConcurrentPerPriority: 2,
  batchDelayMs: 50,
  maxWaitTimeMs: 30000,
  jobTimeoutMs: 10000,
  retryDelayMs: 1000,
  maxQueueSize: 1000,
  maxRetries: 3,
  viewportBoost: 5, // Above-fold gets +5 priority boost
  interactionBoost: 3,
  ageWeight: 0.1, // Age factor in priority calculation
  enableCoalescing: true,
  enableBatching: true,
  enablePrefetch: true,
};

// ============================================================================
// WORKER INTERFACE
// ============================================================================

export interface Worker {
  id: string;
  status: "idle" | "busy" | "paused";
  currentJob?: TranslationJob;
  startedAt?: number;
  completedJobs: number;
  failedJobs: number;
}

// ============================================================================
// EVENT TYPES
// ============================================================================

export type QueueEventType = 
  | "job:added"
  | "job:started"
  | "job:completed"
  | "job:failed"
  | "job:cancelled"
  | "job:expired"
  | "batch:created"
  | "batch:completed"
  | "queue:full"
  | "worker:started"
  | "worker:completed"
  | "worker:failed";

export interface QueueEvent {
  type: QueueEventType;
  timestamp: number;
  jobId?: string;
  batchId?: string;
  workerId?: string;
  data?: unknown;
}

// ============================================================================
// EXAMPLE USAGE
// ============================================================================

/*
// Creating the queue manager
const queue = new TranslationQueueManager({
  maxConcurrent: 3,
  maxQueueSize: 500,
  viewportBoost: 5,
});

// Adding jobs with automatic priority calculation
await queue.addJob({
  text: "Welcome to our website",
  node: textNode,
  element: paragraphElement,
  sourceLang: "en",
  targetLang: "es",
  context: "homepage-hero"
});

// The system automatically:
// 1. Computes priority based on element type + viewport position
// 2. Inserts into correct priority bucket
// 3. Schedules based on worker availability
// 4. Handles retries and failures

// Listening to events
queue.on("job:completed", (event) => {
  console.log(`Job ${event.jobId} completed:`, event.data);
});

// Getting queue status
const stats = queue.getStats();
console.log(`Pending: ${stats.pending}, Processing: ${stats.processing}`);
*/
