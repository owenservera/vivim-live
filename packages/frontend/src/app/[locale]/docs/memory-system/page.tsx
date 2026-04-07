import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Database,
  Timer,
  Settings,
  Target,
  Sparkles,
  Brain,
  Users,
  Layers,
  FileText,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Memory System - 9 Types of AI Memory | VIVIM Documentation",
  description: "Deep dive into VIVIM's 9 memory types: Episodic, Semantic, Procedural, Factual, Preference, Identity, Relationship, Goal, and Project memory. Learn how each type stores, retrieves, and manages AI context.",
  keywords: [
    "VIVIM memory system",
    "AI memory types",
    "episodic memory AI",
    "semantic memory AI",
    "procedural memory AI",
    "context management",
    "memory storage AI",
    "vector database memory",
    "pgvector memory",
    "personal AI memory",
    "memory retrieval",
    "ACU atomic chat units",
  ],
  alternates: {
    canonical: "https://vivim.live/docs/memory-system",
  },
};

const MEMORY_TYPES = [
  {
    name: "Episodic",
    icon: Timer,
    color: "from-violet-500 to-purple-600",
    description: "Time-based event memory that captures specific experiences and conversations",
    example: '"Last week we discussed your React component architecture"',
    useCases: [
      "Recalling previous conversation topics",
      "Remembering when decisions were made",
      "Tracking conversation chronology",
      "Building on past discussions",
    ],
    technicalDetails: {
      storage: "Timestamped ACU sequences with temporal indexing",
      retrieval: "Time-range queries + semantic similarity search",
      tokenBudget: "~2,000-4,000 tokens depending on recency",
      decayStrategy: "Recency-weighted decay with important events preserved",
    },
  },
  {
    name: "Semantic",
    icon: Database,
    color: "from-cyan-500 to-blue-600",
    description: "Factual knowledge and conceptual understanding about the user and their domain",
    example: '"Python is your primary language for backend development"',
    useCases: [
      "Technical stack preferences",
      "Domain expertise areas",
      "Conceptual frameworks you use",
      "Industry knowledge and terminology",
    ],
    technicalDetails: {
      storage: "Vector embeddings in pgvector with semantic indexing",
      retrieval: "Cosine similarity search with threshold filtering",
      tokenBudget: "~1,500-3,000 tokens based on relevance scores",
      decayStrategy: "Confidence-based retention, high-confidence facts persist",
    },
  },
  {
    name: "Procedural",
    icon: Settings,
    color: "from-emerald-500 to-teal-600",
    description: "Process and methodology memory — how you prefer to work and solve problems",
    example: '"You prefer TDD methodology with 90% test coverage"',
    useCases: [
      "Development methodologies",
      "Workflow preferences",
      "Problem-solving approaches",
      "Quality standards and practices",
    ],
    technicalDetails: {
      storage: "Pattern extraction from repeated behaviors and explicit preferences",
      retrieval: "Context-aware matching based on current task type",
      tokenBudget: "~800-1,500 tokens for active procedures",
      decayStrategy: "Frequency-based reinforcement, unused procedures fade",
    },
  },
  {
    name: "Factual",
    icon: Target,
    color: "from-amber-500 to-orange-600",
    description: "Biographical and demographic facts about the user",
    example: '"You work as a senior engineer at a tech company"',
    useCases: [
      "Job title and role",
      "Location and timezone",
      "Education and certifications",
      "Professional experience level",
    ],
    technicalDetails: {
      storage: "Structured fields with validation and user confirmation",
      retrieval: "Direct lookup with privacy tier checking",
      tokenBudget: "~300-600 tokens for core identity facts",
      decayStrategy: "Persistent until explicitly updated by user",
    },
  },
  {
    name: "Preference",
    icon: Sparkles,
    color: "from-rose-500 to-pink-600",
    description: "User preferences for how AI should interact and present information",
    example: '"Prefers dark mode interface with concise responses"',
    useCases: [
      "UI/UX preferences",
      "Communication style",
      "Response format preferences",
      "Tone and formality level",
    ],
    technicalDetails: {
      storage: "Key-value pairs with confidence scores from explicit and inferred signals",
      retrieval: "Context-weighted preference matching",
      tokenBudget: "~500-1,000 tokens for active preferences",
      decayStrategy: "Signal strength decay, reinforced by repeated behavior",
    },
  },
  {
    name: "Identity",
    icon: Brain,
    color: "from-indigo-500 to-blue-600",
    description: "Core identity markers — who you are at a fundamental level",
    example: '"Full-stack developer with focus on AI/ML systems"',
    useCases: [
      "Professional identity",
      "Personal values and principles",
      "Core interests and passions",
      "Self-concept and aspirations",
    ],
    technicalDetails: {
      storage: "L0 Identity Core layer with highest persistence",
      retrieval: "Always included in context assembly (~300 token budget)",
      tokenBudget: "~300 tokens (L0 layer)",
      decayStrategy: "Near-permanent, only changes with explicit user input",
    },
  },
  {
    name: "Relationship",
    icon: Users,
    color: "from-fuchsia-500 to-pink-600",
    description: "Social connections and interpersonal context",
    example: '"John is your tech lead, Sarah handles design"',
    useCases: [
      "Team member roles and relationships",
      "Collaboration patterns",
      "Communication preferences with specific people",
      "Organizational structure context",
    ],
    technicalDetails: {
      storage: "Entity graphs with relationship attributes and trust levels",
      retrieval: "Entity-aware context matching with relationship strength",
      tokenBudget: "~800-1,500 tokens for active relationships",
      decayStrategy: "Interaction frequency-based, dormant relationships archive",
    },
  },
  {
    name: "Goal",
    icon: Target,
    color: "from-lime-500 to-green-600",
    description: "Objectives, targets, and aspirations you're working toward",
    example: '"Launch MVP by Q2, achieve 1000 users in first month"',
    useCases: [
      "Short-term objectives",
      "Long-term aspirations",
      "Milestone tracking",
      "Priority alignment",
    ],
    technicalDetails: {
      storage: "Goal objects with status, priority, and deadline attributes",
      retrieval: "Relevance-based matching to current conversation context",
      tokenBudget: "~600-1,200 tokens for active goals",
      decayStrategy: "Completion or expiration-based archival",
    },
  },
  {
    name: "Project",
    icon: Layers,
    color: "from-sky-500 to-cyan-600",
    description: "Project-specific context, decisions, and progress",
    example: '"E-commerce platform uses Next.js 15 with Stripe integration"',
    useCases: [
      "Tech stack decisions",
      "Architecture patterns",
      "Progress and milestones",
      "Project-specific constraints and requirements",
    ],
    technicalDetails: {
      storage: "Project objects with nested ACU sequences and metadata",
      retrieval: "Project-context matching with temporal relevance",
      tokenBudget: "~1,500-3,000 tokens per active project",
      decayStrategy: "Completion or expiration-based archival",
    },
  },
];

export default function MemorySystemPage() {
  return (
    <article className="prose prose-invert prose-lg max-w-none">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-slate-400">
          <li>
            <Link href="/docs" className="hover:text-white transition-colors">
              Documentation
            </Link>
          </li>
          <li>/</li>
          <li className="text-white" aria-current="page">
            Memory System
          </li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-8 h-8 text-violet-400" />
          <h1 className="text-4xl lg:text-5xl font-bold text-white">
            Memory System
          </h1>
        </div>
        <p className="text-xl text-slate-300 leading-relaxed">
          VIVIM manages 9 distinct types of memory, each serving a specific purpose in building comprehensive AI context that belongs to you.
        </p>
      </header>

      {/* Overview */}
      <section className="mb-12" aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="text-2xl font-bold text-white mb-6">
          Overview
        </h2>
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            Human memory isn't a single monolithic system — it's a complex interplay of different memory types working together. <strong className="text-white">VIVIM mirrors this architecture</strong> by implementing 9 specialized memory types, each optimized for different kinds of information with distinct storage, retrieval, and decay strategies.
          </p>
          <p>
            Each memory type is stored as <strong className="text-white">Atomic Chat Units (ACUs)</strong> — granular, timestamped objects that capture specific pieces of information from your conversations. These ACUs are indexed in PostgreSQL with <strong className="text-white">pgvector embeddings</strong> for semantic similarity search, enabling VIVIM to retrieve the most relevant memories for any given context.
          </p>

          <div className="p-6 rounded-xl bg-violet-500/5 border border-violet-500/20 my-8">
            <h3 className="text-lg font-semibold text-violet-300 mb-3">Why 9 Memory Types?</h3>
            <p className="text-slate-300 leading-relaxed">
              Different information requires different handling. Your <strong className="text-white">identity</strong> (who you are) should persist nearly permanently, while <strong className="text-white">episodic</strong> memories (what happened last Tuesday) should fade naturally. Your <strong className="text-white">preferences</strong> (how you like responses) need different retrieval logic than your <strong className="text-white">project context</strong> (current work in progress). By separating these concerns, VIVIM assembles more relevant, appropriate context for each interaction.
            </p>
          </div>
        </div>
      </section>

      {/* Memory Types Overview Grid */}
      <section className="mb-12" aria-labelledby="memory-types-grid">
        <h2 id="memory-types-grid" className="text-2xl font-bold text-white mb-6">
          The 9 Memory Types
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {MEMORY_TYPES.map((memory) => {
            const Icon = memory.icon;
            return (
              <div
                key={memory.name}
                className="p-5 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${memory.color} flex-shrink-0`}
                  >
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">{memory.name}</h3>
                    <p className="text-xs text-slate-400">{memory.description}</p>
                  </div>
                </div>
                <div className="text-xs text-slate-500 font-mono bg-white/5 rounded px-2 py-1">
                  {memory.example}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Detailed Memory Type Breakdown */}
      {MEMORY_TYPES.map((memory, index) => {
        const Icon = memory.icon;
        return (
          <section key={memory.name} className="mb-12" aria-labelledby={`memory-${memory.name.toLowerCase()}`}>
            <h2 id={`memory-${memory.name.toLowerCase()}`} className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br ${memory.color}`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              {memory.name} Memory
            </h2>

            <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                <p className="text-slate-300 leading-relaxed">{memory.description}</p>
              </div>

              {/* Example */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Example</h3>
                <div className="text-sm text-slate-400 font-mono bg-slate-900/50 rounded-lg px-4 py-3 border border-white/5">
                  {memory.example}
                </div>
              </div>

              {/* Use Cases */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Use Cases</h3>
                <ul className="space-y-2 text-slate-300">
                  {memory.useCases.map((useCase) => (
                    <li key={useCase} className="flex items-start gap-2">
                      <span className="text-violet-400 mt-1">•</span>
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technical Details */}
              <div className="p-5 rounded-lg bg-slate-900/30 border border-white/5">
                <h3 className="text-lg font-semibold text-white mb-4">Technical Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Storage</div>
                    <div className="text-slate-300">{memory.technicalDetails.storage}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Retrieval</div>
                    <div className="text-slate-300">{memory.technicalDetails.retrieval}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Token Budget</div>
                    <div className="text-violet-300 font-mono">{memory.technicalDetails.tokenBudget}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-400 uppercase mb-1">Decay Strategy</div>
                    <div className="text-slate-300">{memory.technicalDetails.decayStrategy}</div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* Memory Retrieval */}
      <section className="mb-12" aria-labelledby="retrieval-heading">
        <h2 id="retrieval-heading" className="text-2xl font-bold text-white mb-6">
          Memory Retrieval Process
        </h2>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <p className="text-slate-300 leading-relaxed">
            When you send a message through VIVIM, the <strong className="text-white">Context Engine</strong> retrieves relevant memories across all 9 types using a multi-stage process:
          </p>

          <ol className="space-y-4 text-slate-300">
            {[
              {
                step: "1",
                title: "Query Analysis",
                description: "Your message is analyzed to determine which memory types are most relevant. A question about your project triggers Project and Entity Context, while a personal question triggers Identity and Preference memory.",
              },
              {
                step: "2",
                title: "Vector Search",
                description: "For semantic memory types (Semantic, Episodic, Project), pgvector performs cosine similarity search against stored embeddings, returning the top-k most relevant memories.",
              },
              {
                step: "3",
                title: "Direct Lookup",
                description: "For structured memory types (Identity, Factual, Preference), direct database queries retrieve the most relevant entries based on context tags and privacy tiers.",
              },
              {
                step: "4",
                title: "Temporal Filtering",
                description: "Episodic and Project memories are filtered by recency and activity. Recent, active memories are prioritized while dormant ones are archived.",
              },
              {
                step: "5",
                title: "Relevance Scoring",
                description: "All retrieved memories are scored on relevance, recency, confidence, and privacy tier. Low-scoring memories are filtered out to stay within token budgets.",
              },
              {
                step: "6",
                title: "Context Assembly",
                description: "Retrieved memories are assembled into the 8-Layer Context Engine (L0-L7), with each memory type mapped to appropriate layers based on relevance and type.",
              },
            ].map((item) => (
              <li key={item.step} className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-violet-300 font-bold text-sm">{item.step}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                  <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ACU Structure */}
      <section className="mb-12" aria-labelledby="acu-structure">
        <h2 id="acu-structure" className="text-2xl font-bold text-white mb-6">
          Atomic Chat Units (ACUs)
        </h2>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <p className="text-slate-300 leading-relaxed">
            All memories in VIVIM are stored as <strong className="text-white">Atomic Chat Units (ACUs)</strong> — the fundamental data primitive. An ACU is a granular, self-contained memory object extracted from your conversations.
          </p>

          <div className="p-5 rounded-lg bg-slate-900/30 border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-3">ACU Structure</h3>
            <pre className="text-xs text-slate-300 font-mono overflow-x-auto">
{`{
  "id": "acu_8f7e6d5c4b3a",
  "userId": "user_a1b2c3d4",
  "memoryType": "semantic",
  "layer": "L2",
  "content": "User prefers TypeScript for frontend development",
  "embedding": [0.123, -0.456, ...],  // pgvector embedding (1536 dimensions)
  "metadata": {
    "confidence": 0.95,
    "source": "explicit_statement",
    "timestamp": "2026-04-07T10:30:00Z",
    "conversationId": "conv_xyz123",
    "rightsTier": "T0",
    "tags": ["programming", "preferences", "typescript"]
  },
  "accessCount": 15,
  "lastAccessed": "2026-04-06T14:20:00Z",
  "expiresAt": null  // null = permanent
}`}
            </pre>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Key Fields</h4>
              <ul className="space-y-1 text-sm text-slate-300">
                <li><code className="text-violet-300">memoryType</code> — One of 9 memory types</li>
                <li><code className="text-violet-300">layer</code> — Context layer (L0-L7)</li>
                <li><code className="text-violet-300">content</code> — The actual memory content</li>
                <li><code className="text-violet-300">embedding</code> — Vector for similarity search</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-2">Metadata</h4>
              <ul className="space-y-1 text-sm text-slate-300">
                <li><code className="text-violet-300">confidence</code> — How certain VIVIM is (0-1)</li>
                <li><code className="text-violet-300">source</code> — Explicit or inferred</li>
                <li><code className="text-violet-300">rightsTier</code> — Privacy level (T0-T5)</li>
                <li><code className="text-violet-300">tags</code> — Categorization for retrieval</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Memory Management */}
      <section className="mb-12" aria-labelledby="memory-management">
        <h2 id="memory-management" className="text-2xl font-bold text-white mb-6">
          Memory Management
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Creation",
              description: "Memories are created from your conversations through automatic extraction (AI identifies potential memories) and explicit user input (you tell VIVIM to remember something).",
              icon: FileText,
              color: "from-violet-500 to-purple-600",
            },
            {
              title: "Validation",
              description: "Extracted memories go through a validation pipeline: duplicate detection, contradiction resolution, confidence scoring, and optional user review before storage.",
              icon: Target,
              color: "from-cyan-500 to-blue-600",
            },
            {
              title: "Maintenance",
              description: "Memories are continuously maintained: decay strategies apply, low-confidence memories are flagged, contradictions are resolved, and dormant memories are archived.",
              icon: Settings,
              color: "from-emerald-500 to-teal-600",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-6 rounded-xl bg-white/5 border border-white/10"
              >
                <div
                  className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${item.color} mb-4`}
                >
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Next Steps */}
      <section className="mb-12" aria-labelledby="next-steps">
        <h2 id="next-steps" className="text-2xl font-bold text-white mb-6">
          Next Steps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              href: "/docs/context-engine",
              title: "8-Layer Context Engine",
              description: "Learn how memories are assembled into the 8-layer context engine with token budgets and dynamic assembly.",
              icon: Layers,
              color: "from-rose-500/10 to-pink-500/10 border-rose-500/20",
            },
            {
              href: "/docs/rights-layer",
              title: "Rights Layer",
              description: "Understand the 6-tier ownership model that governs memory visibility and sharing.",
              icon: Shield,
              color: "from-indigo-500/10 to-blue-500/10 border-indigo-500/20",
            },
            {
              href: "/docs/api-reference",
              title: "API Reference",
              description: "Explore the REST API endpoints for managing memories, querying context, and integrating with AI providers.",
              icon: Code2,
              color: "from-sky-500/10 to-cyan-500/10 border-sky-500/20",
            },
            {
              href: "/docs/privacy-security",
              title: "Privacy & Security",
              description: "Learn how VIVIM protects your memory data with encryption, isolation, and sentinel detection.",
              icon: Shield,
              color: "from-fuchsia-500/10 to-pink-500/10 border-fuchsia-500/20",
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`group block p-6 rounded-xl bg-gradient-to-br ${card.color} border transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-violet-500/10`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/5 flex-shrink-0">
                    <Icon className="w-6 h-6 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-violet-300 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed mb-3">
                      {card.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-violet-400 group-hover:text-violet-300 transition-colors">
                      <span>Read more</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </article>
  );
}
