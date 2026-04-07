import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Layers,
  Brain,
  Database,
  Zap,
  Target,
  Settings,
  MessageSquare,
  Search,
  Code2,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  title: "8-Layer Context Engine - Dynamic AI Context Assembly | VIVIM Documentation",
  description: "Learn how VIVIM's context engine assembles AI context dynamically through 8 layers from L0 Identity Core to L7 User Message, with token budgets and intelligent assembly algorithms.",
  keywords: [
    "context engine",
    "8-layer context",
    "AI context assembly",
    "dynamic context",
    "context layers",
    "identity core L0",
    "user message L7",
    "token budget",
    "context retrieval",
    "AI context management",
    "VIVIM context engine",
  ],
  alternates: {
    canonical: "https://vivim.live/docs/context-engine",
  },
};

const LAYERS = [
  {
    layer: "L0",
    name: "Identity Core",
    description: "Who you are — permanent context that anchors all interactions",
    tokens: "~300",
    color: "from-violet-600 to-purple-700",
    memoryTypes: ["Identity"],
    persistence: "Near-permanent",
    retrievalStrategy: "Always included, direct lookup",
    example: "Full-stack developer specializing in AI/ML systems. Prefers TypeScript, values clean architecture, works in EST timezone.",
  },
  {
    layer: "L1",
    name: "Global Preferences",
    description: "How AI should respond to you — communication style and format preferences",
    tokens: "~500",
    color: "from-indigo-500 to-blue-600",
    memoryTypes: ["Preference"],
    persistence: "Long-term, evolves slowly",
    retrievalStrategy: "Context-weighted preference matching",
    example: "Prefers concise responses with code examples. Dark mode. Technical depth over surface explanations. Uses TDD methodology.",
  },
  {
    layer: "L2",
    name: "Topic Context",
    description: "Deep knowledge about the current topic — semantic understanding",
    tokens: "~1,500",
    color: "from-fuchsia-500 to-pink-600",
    memoryTypes: ["Semantic", "Factual"],
    persistence: "Medium to long-term",
    retrievalStrategy: "Vector similarity search with topic filtering",
    example: "Current discussion about React Server Components. User has intermediate React knowledge. Previous session covered client components.",
  },
  {
    layer: "L3",
    name: "Entity Context",
    description: "People, projects, and tools you discuss — relationship and project memory",
    tokens: "~1,000",
    color: "from-cyan-500 to-blue-600",
    memoryTypes: ["Relationship", "Project"],
    persistence: "Medium-term, activity-based",
    retrievalStrategy: "Entity mention detection + relationship graph traversal",
    example: "Working on e-commerce project with Sarah (designer) and John (backend). Tech stack: Next.js 15, Stripe, PostgreSQL.",
  },
  {
    layer: "L4",
    name: "Conversation Arc",
    description: "Thread of current discussion — where this conversation is heading",
    tokens: "~2,000",
    color: "from-emerald-500 to-teal-600",
    memoryTypes: ["Episodic", "Goal"],
    persistence: "Short-term, session-scoped",
    retrievalStrategy: "Session-scoped episodic retrieval with goal alignment",
    example: "Started discussing authentication, moved to authorization patterns. Goal: implement role-based access control for the project.",
  },
  {
    layer: "L5",
    name: "JIT Retrieval",
    description: "Just-in-time relevant knowledge — semantically similar past interactions",
    tokens: "~2,500",
    color: "from-amber-500 to-orange-600",
    memoryTypes: ["Episodic", "Semantic", "Procedural"],
    persistence: "Dynamic, query-dependent",
    retrievalStrategy: "Real-time vector similarity search across all memory types",
    example: "Retrieved similar discussion about middleware patterns from 3 weeks ago. Previous solution used decorator-based approach.",
  },
  {
    layer: "L6",
    name: "Message History",
    description: "Recent conversation messages — immediate context window",
    tokens: "~3,500",
    color: "from-rose-500 to-pink-600",
    memoryTypes: ["Episodic"],
    persistence: "Short-term, sliding window",
    retrievalStrategy: "Sliding window of last N messages with importance scoring",
    example: "Last 10-15 messages in current conversation. Important exchanges weighted higher, trivial messages compressed or omitted.",
  },
  {
    layer: "L7",
    name: "User Message",
    description: "Your current input — the message you just sent",
    tokens: "Variable",
    color: "from-red-500 to-pink-600",
    memoryTypes: [],
    persistence: "Ephemeral (becomes L6 after response)",
    retrievalStrategy: "Direct input, analyzed for layer assembly triggers",
    example: "Your current message: 'How do I implement role-based access control in Next.js 15?'",
  },
];

export default function ContextEnginePage() {
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
            Context Engine
          </li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Layers className="w-8 h-8 text-violet-400" />
          <h1 className="text-4xl lg:text-5xl font-bold text-white">
            8-Layer Context Engine
          </h1>
        </div>
        <p className="text-xl text-slate-300 leading-relaxed">
          VIVIM assembles AI context dynamically through 8 hierarchical layers, building from your core identity to your current message for optimal, personalized interactions.
        </p>
      </header>

      {/* Overview */}
      <section className="mb-12" aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="text-2xl font-bold text-white mb-6">
          Overview
        </h2>
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            Traditional AI systems treat context as a flat list of recent messages. <strong className="text-white">VIVIM's Context Engine</strong> takes a fundamentally different approach by organizing context into <strong className="text-white">8 hierarchical layers</strong>, each serving a distinct purpose and assembled dynamically for every interaction.
          </p>
          <p>
            Think of it like how humans build context: you don't just remember the last 10 things someone said — you bring in who they are (L0), how they communicate (L1), what you know about the topic (L2), who else is involved (L3), where this conversation is heading (L4), relevant past experiences (L5), recent messages (L6), and what they just said (L7).
          </p>

          <div className="p-6 rounded-xl bg-violet-500/5 border border-violet-500/20 my-8">
            <h3 className="text-lg font-semibold text-violet-300 mb-3">Why Layers?</h3>
            <p className="text-slate-300 leading-relaxed">
              Layers enable <strong className="text-white">intelligent token allocation</strong>. Your identity (L0) is always relevant and needs ~300 tokens. Recent messages (L6) need ~3,500 tokens for continuity. By separating concerns, VIVIM ensures the most relevant context fits within provider token limits while maintaining coherence and personalization.
            </p>
          </div>
        </div>
      </section>

      {/* Token Budget Overview */}
      <section className="mb-12" aria-labelledby="token-budget">
        <h2 id="token-budget" className="text-2xl font-bold text-white mb-6">
          Total Token Budget
        </h2>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <p className="text-slate-300 leading-relaxed mb-6">
            The Context Engine manages a total budget of <strong className="text-white">~11,300+ tokens</strong> across all layers, dynamically allocated based on conversation context and provider limits:
          </p>
          <div className="space-y-3">
            {LAYERS.map((item) => (
              <div key={item.layer} className="flex items-start gap-4">
                <div className={`px-3 py-1 rounded bg-gradient-to-r ${item.color} text-white text-xs font-mono font-bold flex-shrink-0`}>
                  {item.layer}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-semibold text-white">{item.name}</div>
                    <div className="text-xs text-slate-400 font-mono">{item.tokens} tokens</div>
                  </div>
                  <div className="text-xs text-slate-400">{item.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Layer Breakdown */}
      {LAYERS.map((layer, index) => (
        <section key={layer.layer} className="mb-12" aria-labelledby={`layer-${layer.layer}`}>
          <h2 id={`layer-${layer.layer}`} className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${layer.color}`}>
              <span className="text-white font-bold text-lg">{layer.layer}</span>
            </div>
            {layer.name}
          </h2>

          <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-6">
            {/* Description */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
              <p className="text-slate-300 leading-relaxed">{layer.description}</p>
            </div>

            {/* Example */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Example Context</h3>
              <div className="text-sm text-slate-400 font-mono bg-slate-900/50 rounded-lg px-4 py-3 border border-white/5">
                {layer.example}
              </div>
            </div>

            {/* Technical Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-slate-900/30 border border-white/5">
                <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Memory Types</div>
                <div className="flex flex-wrap gap-2">
                  {layer.memoryTypes.map((type) => (
                    <span key={type} className="px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-medium">
                      {type}
                    </span>
                  ))}
                  {layer.memoryTypes.length === 0 && (
                    <span className="text-slate-400 text-sm">Direct input (no memory retrieval)</span>
                  )}
                </div>
              </div>
              <div className="p-4 rounded-lg bg-slate-900/30 border border-white/5">
                <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Token Budget</div>
                <div className="text-violet-300 font-mono text-lg">{layer.tokens}</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-900/30 border border-white/5">
                <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Persistence</div>
                <div className="text-slate-300 text-sm">{layer.persistence}</div>
              </div>
              <div className="p-4 rounded-lg bg-slate-900/30 border border-white/5">
                <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Retrieval Strategy</div>
                <div className="text-slate-300 text-sm">{layer.retrievalStrategy}</div>
              </div>
            </div>
          </div>
        </section>
      ))}

      {/* Context Assembly Process */}
      <section className="mb-12" aria-labelledby="assembly-process">
        <h2 id="assembly-process" className="text-2xl font-bold text-white mb-6">
          Context Assembly Process
        </h2>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <p className="text-slate-300 leading-relaxed">
            When you send a message, VIVIM's Context Engine assembles context through an <strong className="text-white">8-step intelligent process</strong>:
          </p>

          <ol className="space-y-4 text-slate-300">
            {[
              {
                step: "1",
                icon: Brain,
                title: "Message Analysis",
                description: "Your message is analyzed to identify topics, entities, goals, and relevant context types. NLP extraction determines which layers need enrichment.",
              },
              {
                step: "2",
                icon: Target,
                title: "Layer Priority Assignment",
                description: "Based on message analysis, the engine determines which layers are most relevant. A technical question emphasizes L2-L3, while a personal check-in emphasizes L0-L1.",
              },
              {
                step: "3",
                icon: Database,
                title: "Memory Retrieval",
                description: "For each active layer, relevant memories are retrieved: vector search for semantic types, direct lookup for structured types, session-scoped queries for episodic types.",
              },
              {
                step: "4",
                icon: Search,
                title: "Relevance Scoring",
                description: "All retrieved memories are scored on relevance to current message, recency, confidence, and privacy tier. Low-scoring memories are filtered out.",
              },
              {
                step: "5",
                icon: Settings,
                title: "Token Budget Allocation",
                description: "Within each layer's budget, tokens are allocated to retrieved memories based on scores. Higher-scoring memories get more representation.",
              },
              {
                step: "6",
                icon: Layers,
                title: "Layer Assembly",
                description: "Memories are assembled into layers L0-L6 in order, with L7 being your current message. Each layer is formatted with appropriate context markers.",
              },
              {
                step: "7",
                icon: Zap,
                title: "Context Compression",
                description: "If total context exceeds provider limits, intelligent compression is applied: less relevant memories are summarized, redundant information is deduplicated.",
              },
              {
                step: "8",
                icon: MessageSquare,
                title: "Provider Dispatch",
                description: "Assembled context is formatted into the provider's expected format (system prompt, conversation history, etc.) and sent with your message.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.step} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-violet-400" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Dynamic vs Static Context */}
      <section className="mb-12" aria-labelledby="dynamic-vs-static">
        <h2 id="dynamic-vs-static" className="text-2xl font-bold text-white mb-6">
          Dynamic vs Static Context
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
            <h3 className="text-lg font-semibold text-emerald-300 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              VIVIM: Dynamic Context
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Assembled fresh for each interaction</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Relevance-based memory selection</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Token budget optimization</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Multi-layer context types</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Privacy-aware assembly</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 mt-1">✓</span>
                <span>Works across all providers</span>
              </li>
            </ul>
          </div>
          <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/20">
            <h3 className="text-lg font-semibold text-red-300 mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Traditional: Static Context
            </h3>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✗</span>
                <span>Last N messages only</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✗</span>
                <span>No relevance scoring</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✗</span>
                <span>Fixed window, wasteful</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✗</span>
                <span>Single context type</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✗</span>
                <span>Platform-controlled</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">✗</span>
                <span>Provider-specific format</span>
              </li>
            </ul>
          </div>
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
              href: "/docs/memory-system",
              title: "Memory System",
              description: "Explore the 9 memory types that feed into the Context Engine.",
              icon: Database,
              color: "from-amber-500/10 to-orange-500/10 border-amber-500/20",
            },
            {
              href: "/docs/rights-layer",
              title: "Rights Layer",
              description: "Understand how privacy tiers control which memories are included in context.",
              icon: Shield,
              color: "from-indigo-500/10 to-blue-500/10 border-indigo-500/20",
            },
            {
              href: "/docs/api-reference",
              title: "API Reference",
              description: "Learn how to retrieve and manage context through the REST API.",
              icon: Code2,
              color: "from-sky-500/10 to-cyan-500/10 border-sky-500/20",
            },
            {
              href: "/docs/getting-started",
              title: "Getting Started",
              description: "See the Context Engine in action with a hands-on tutorial.",
              icon: Zap,
              color: "from-cyan-500/10 to-blue-500/10 border-cyan-500/20",
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
