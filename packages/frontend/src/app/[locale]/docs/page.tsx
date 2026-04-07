import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  Brain,
  Layers,
  Database,
  Shield,
  Code2,
  Rocket,
  HelpCircle,
  Network,
  Key,
  ShoppingCart,
  ArrowRight,
  Zap,
  Lock,
  Globe,
  Users,
  Eye,
  FileText,
} from "lucide-react";

export const metadata: Metadata = {
  title: "VIVIM Documentation - Sovereign, Portable, Personal AI Memory",
  description: "Complete documentation for VIVIM, the sovereign AI memory platform. Learn about our 8-layer context engine, 9 memory types, rights layer, sentinel detection system, and provider-agnostic AI memory architecture.",
  keywords: [
    "VIVIM",
    "AI memory",
    "sovereign AI memory",
    "portable AI context",
    "personal memory layer",
    "provider agnostic AI",
    "context engine",
    "memory management AI",
    "AI privacy",
    "zero-knowledge AI",
    "ACU atomic chat units",
    "AI memory API",
    "context assembly",
    "memory marketplace",
    "sentinel detection",
    "rights layer AI",
  ],
  alternates: {
    canonical: "https://vivim.live/docs",
  },
};

const DOC_CARDS = [
  {
    href: "/docs/what-is-vivim",
    icon: BookOpen,
    title: "What is VIVIM",
    description: "Understand the core concept of sovereign AI memory, why it matters, and how VIVIM gives you complete ownership of your AI context across all providers.",
    color: "from-violet-500/10 to-purple-500/10 border-violet-500/20",
    iconColor: "text-violet-400",
  },
  {
    href: "/docs/getting-started",
    icon: Rocket,
    title: "Quick Start Guide",
    description: "Get up and running with VIVIM in minutes. Learn how to integrate the memory layer into your AI applications, set up authentication, and start managing context.",
    color: "from-cyan-500/10 to-blue-500/10 border-cyan-500/20",
    iconColor: "text-cyan-400",
  },
  {
    href: "/docs/architecture",
    icon: Network,
    title: "System Architecture",
    description: "Deep dive into VIVIM's architecture: the backend API, frontend application, shared authentication layer, PostgreSQL database with pgvector, and real-time Socket.io integration.",
    color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20",
    iconColor: "text-emerald-400",
  },
  {
    href: "/docs/memory-system",
    icon: Database,
    title: "Memory System",
    description: "Explore the 9 types of memory VIVIM manages: Episodic, Semantic, Procedural, Factual, Preference, Identity, Relationship, Goal, and Project memory with detailed technical specifications.",
    color: "from-amber-500/10 to-orange-500/10 border-amber-500/20",
    iconColor: "text-amber-400",
  },
  {
    href: "/docs/context-engine",
    icon: Layers,
    title: "8-Layer Context Engine",
    description: "Learn how VIVIM assembles context dynamically through 8 layers from L0 (Identity Core) to L7 (User Message), with token budgets and assembly algorithms.",
    color: "from-rose-500/10 to-pink-500/10 border-rose-500/20",
    iconColor: "text-rose-400",
  },
  {
    href: "/docs/rights-layer",
    icon: Key,
    title: "Rights Layer",
    description: "Understand the 6-tier ownership model (T0-T5) that governs data visibility and sharing, from personal-only memory to regulated public disclosure.",
    color: "from-indigo-500/10 to-blue-500/10 border-indigo-500/20",
    iconColor: "text-indigo-400",
  },
  {
    href: "/docs/privacy-security",
    icon: Shield,
    title: "Privacy & Security",
    description: "Comprehensive overview of VIVIM's zero-knowledge architecture, encryption standards, data isolation, and the sentinel detection system that prevents unauthorized data usage.",
    color: "from-fuchsia-500/10 to-pink-500/10 border-fuchsia-500/20",
    iconColor: "text-fuchsia-400",
  },
  {
    href: "/docs/api-reference",
    icon: Code2,
    title: "API Reference",
    description: "Complete REST API documentation with endpoints for memory management, chat operations, context assembly, authentication, and the memory marketplace.",
    color: "from-sky-500/10 to-cyan-500/10 border-sky-500/20",
    iconColor: "text-sky-400",
  },
  {
    href: "/docs/sdk-guide",
    icon: Code2,
    title: "SDK Integration Guide",
    description: "Step-by-step guide to integrating VIVIM into your applications using our SDK. Includes code examples for JavaScript, Python, and other languages.",
    color: "from-lime-500/10 to-green-500/10 border-lime-500/20",
    iconColor: "text-lime-400",
  },
  {
    href: "/docs/marketplace",
    icon: ShoppingCart,
    title: "Memory Marketplace",
    description: "Learn about VIVIM's zero-knowledge proof-based intelligence marketplace where users can monetize their AI memory while maintaining complete privacy.",
    color: "from-violet-500/10 to-indigo-500/10 border-violet-500/20",
    iconColor: "text-violet-400",
  },
  {
    href: "/docs/faq",
    icon: HelpCircle,
    title: "Frequently Asked Questions",
    description: "Answers to common questions about VIVIM's technology, pricing, security, integrations, and use cases.",
    color: "from-slate-500/10 to-slate-500/10 border-slate-500/20",
    iconColor: "text-slate-400",
  },
];

const CORE_PRINCIPLES = [
  {
    icon: Shield,
    title: "Sovereign",
    description: "You own your memory data completely. VIVIM never claims ownership — your AI memory belongs to you, not the platform.",
    color: "from-violet-500 to-purple-600",
  },
  {
    icon: Users,
    title: "Personal",
    description: "Your memory is yours alone. Unlike shared databases, VIVIM creates an individual memory layer unique to each user.",
    color: "from-cyan-500 to-blue-600",
  },
  {
    icon: Globe,
    title: "Provider Agnostic",
    description: "Switch between GPT-4, Claude, Gemini, or any AI model — your memory stays intact. No vendor lock-in, ever.",
    color: "from-emerald-500 to-teal-600",
  },
  {
    icon: Zap,
    title: "Portable",
    description: "Export your entire memory at any time in standard formats. Take your AI memory wherever you go.",
    color: "from-amber-500 to-orange-600",
  },
];

const TECHNICAL_HIGHLIGHTS = [
  {
    label: "Memory Types",
    value: "9",
    description: "Episodic, Semantic, Procedural, Factual, Preference, Identity, Relationship, Goal, Project",
  },
  {
    label: "Context Layers",
    value: "8",
    description: "L0 Identity Core through L7 User Message, assembled dynamically per interaction",
  },
  {
    label: "Rights Tiers",
    value: "6",
    description: "T0 (Personal Only) through T5 (Regulated Public), governing data visibility",
  },
  {
    label: "AI Providers",
    value: "4+",
    description: "OpenAI, Anthropic, Google, xAI — switch freely without losing context",
  },
];

export default function DocsIndexPage() {
  return (
    <article className="prose prose-invert prose-lg max-w-none">
      {/* Hero Section */}
      <header className="mb-16">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-8 h-8 text-violet-400" />
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            VIVIM Documentation
          </h1>
        </div>
        <p className="text-xl text-slate-300 leading-relaxed mb-6">
          Complete documentation for <strong className="text-white">VIVIM</strong> — the sovereign, portable, personal AI memory layer that works across all providers.
        </p>
        <p className="text-lg text-slate-400 leading-relaxed">
          VIVIM gives you complete ownership of your AI conversation memory with provider-agnostic portability. Whether you're building AI applications, integrating memory into existing workflows, or learning about our architecture, this documentation provides everything you need.
        </p>
      </header>

      {/* Technical Highlights */}
      <section className="mb-16" aria-labelledby="highlights-heading">
        <h2 id="highlights-heading" className="text-2xl font-bold text-white mb-6">
          Technical Highlights
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TECHNICAL_HIGHLIGHTS.map((highlight) => (
            <div
              key={highlight.label}
              className="p-6 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="text-3xl font-bold text-violet-400 mb-2">
                {highlight.value}
              </div>
              <div className="text-sm font-semibold text-white mb-1">
                {highlight.label}
              </div>
              <div className="text-xs text-slate-400">{highlight.description}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Principles */}
      <section className="mb-16" aria-labelledby="principles-heading">
        <h2 id="principles-heading" className="text-2xl font-bold text-white mb-6">
          Core Principles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {CORE_PRINCIPLES.map((principle) => {
            const Icon = principle.icon;
            return (
              <div
                key={principle.title}
                className="p-6 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${principle.color} flex-shrink-0`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {principle.title}
                    </h3>
                    <p className="text-slate-400 text-sm leading-relaxed">
                      {principle.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Documentation Sections */}
      <section className="mb-16" aria-labelledby="docs-heading">
        <h2 id="docs-heading" className="text-2xl font-bold text-white mb-6">
          Documentation Sections
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DOC_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`group block p-6 rounded-xl bg-gradient-to-br ${card.color} border transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-violet-500/10`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-white/5 ${card.iconColor} flex-shrink-0`}>
                    <Icon className="w-6 h-6" />
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

      {/* What is VIVIM Section */}
      <section className="mb-16" aria-labelledby="what-is-vivim">
        <h2 id="what-is-vivim" className="text-2xl font-bold text-white mb-6">
          What is VIVIM?
        </h2>
        <div className="p-8 rounded-xl bg-white/5 border border-white/10">
          <p className="text-slate-300 leading-relaxed mb-4">
            <strong className="text-white">VIVIM</strong> (pronounced "VIV-im") is a <strong className="text-white">living memory layer for AI</strong> that gives users complete ownership of their AI conversation memory with provider-agnostic portability. Unlike traditional AI systems where context is ephemeral and controlled by the provider, VIVIM creates a persistent, personal memory layer that belongs to the user.
          </p>
          <p className="text-slate-300 leading-relaxed mb-4">
            The platform works by decomposing conversations into <strong className="text-white">Atomic Chat Units (ACUs)</strong> — granular memory objects that can be stored, retrieved, and reassembled dynamically. When you interact with any AI provider through VIVIM, our <strong className="text-white">8-Layer Context Engine</strong> assembles the optimal context package in real-time, drawing from 9 different memory types.
          </p>
          <p className="text-slate-300 leading-relaxed mb-4">
            VIVIM's architecture is built on <strong className="text-white">PostgreSQL with pgvector</strong> for semantic similarity search, <strong className="text-white">Express.js</strong> for the backend API, <strong className="text-white">Next.js 15</strong> for the frontend, and supports <strong className="text-white">OpenAI, Anthropic, Google, and xAI</strong> providers out of the box. The system processes and manages context through a sophisticated <strong className="text-white">rights layer</strong> with 6 tiers of ownership and a <strong className="text-white">sentinel detection system</strong> with 13 algorithms to prevent unauthorized data usage.
          </p>
          <Link
            href="/docs/what-is-vivim"
            className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors mt-4"
          >
            <span>Learn more about VIVIM</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Architecture Overview */}
      <section className="mb-16" aria-labelledby="architecture-overview">
        <h2 id="architecture-overview" className="text-2xl font-bold text-white mb-6">
          Architecture Overview
        </h2>
        <div className="p-8 rounded-xl bg-white/5 border border-white/10">
          <p className="text-slate-300 leading-relaxed mb-4">
            VIVIM is structured as a <strong className="text-white">monorepo</strong> with three main packages:
          </p>
          <ul className="space-y-3 text-slate-300 mb-6">
            <li className="flex items-start gap-3">
              <Code2 className="w-5 h-5 text-violet-400 mt-1 flex-shrink-0" />
              <div>
                <strong className="text-white">Frontend (Next.js 15):</strong> React 19 application with App Router, TypeScript, Tailwind CSS 4, Framer Motion animations, shadcn/ui components, and full i18n support for English, Spanish, Catalan, and Arabic with RTL.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Database className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
              <div>
                <strong className="text-white">Backend (Express.js 5):</strong> RESTful API server running on Bun runtime with TypeScript, featuring 35+ route handlers, 48 service modules, and comprehensive OpenAPI specification.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-emerald-400 mt-1 flex-shrink-0" />
              <div>
                <strong className="text-white">Shared (Authentication & Types):</strong> Shared authentication layer and TypeScript type definitions used across both frontend and backend.
              </div>
            </li>
          </ul>
          <p className="text-slate-300 leading-relaxed">
            The database layer uses <strong className="text-white">Prisma ORM</strong> with PostgreSQL and pgvector extension for vector similarity search, enabling efficient retrieval of semantically similar memories across 9 distinct memory types.
          </p>
          <Link
            href="/docs/architecture"
            className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors mt-4"
          >
            <span>Explore full architecture</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Memory System */}
      <section className="mb-16" aria-labelledby="memory-system-overview">
        <h2 id="memory-system-overview" className="text-2xl font-bold text-white mb-6">
          Memory System
        </h2>
        <div className="p-8 rounded-xl bg-white/5 border border-white/10">
          <p className="text-slate-300 leading-relaxed mb-4">
            VIVIM manages <strong className="text-white">9 distinct types of memory</strong>, each serving a specific purpose in building comprehensive AI context:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {[
              { name: "Episodic", desc: "Time-based event memory — 'Last week we discussed...'" },
              { name: "Semantic", desc: "Factual knowledge — 'Python is your primary language'" },
              { name: "Procedural", desc: "Process memory — 'You prefer TDD methodology'" },
              { name: "Factual", desc: "Biographical facts — 'You work as a senior engineer'" },
              { name: "Preference", desc: "User preferences — 'Prefers dark mode interface'" },
              { name: "Identity", desc: "Core identity — 'Full-stack developer'" },
              { name: "Relationship", desc: "Social connections — 'John is your tech lead'" },
              { name: "Goal", desc: "Objectives — 'Launch MVP by Q2'" },
              { name: "Project", desc: "Project context — 'E-commerce uses Next.js'" },
            ].map((memory) => (
              <div key={memory.name} className="p-4 rounded-lg bg-white/5 border border-white/5">
                <div className="text-sm font-semibold text-white mb-1">{memory.name}</div>
                <div className="text-xs text-slate-400">{memory.desc}</div>
              </div>
            ))}
          </div>
          <Link
            href="/docs/memory-system"
            className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors"
          >
            <span>Explore memory system details</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Context Engine */}
      <section className="mb-16" aria-labelledby="context-engine-overview">
        <h2 id="context-engine-overview" className="text-2xl font-bold text-white mb-6">
          8-Layer Context Engine
        </h2>
        <div className="p-8 rounded-xl bg-white/5 border border-white/10">
          <p className="text-slate-300 leading-relaxed mb-4">
            VIVIM's context engine assembles context <strong className="text-white">dynamically per interaction</strong> through 8 hierarchical layers, each with specific token budgets and retrieval strategies:
          </p>
          <div className="space-y-3 mb-6">
            {[
              { layer: "L0", name: "Identity Core", tokens: "~300", desc: "Who you are — permanent context" },
              { layer: "L1", name: "Global Preferences", tokens: "~500", desc: "How AI should respond to you" },
              { layer: "L2", name: "Topic Context", tokens: "~1,500", desc: "Deep knowledge about current topic" },
              { layer: "L3", name: "Entity Context", tokens: "~1,000", desc: "People, projects, and tools you discuss" },
              { layer: "L4", name: "Conversation Arc", tokens: "~2,000", desc: "Thread of current discussion" },
              { layer: "L5", name: "JIT Retrieval", tokens: "~2,500", desc: "Real-time relevant knowledge" },
              { layer: "L6", name: "Message History", tokens: "~3,500", desc: "Recent conversation messages" },
              { layer: "L7", name: "User Message", tokens: "Variable", desc: "Your current input" },
            ].map((item) => (
              <div key={item.layer} className="flex items-start gap-4 p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="px-3 py-1 rounded bg-violet-500/20 text-violet-300 text-xs font-mono font-bold flex-shrink-0">
                  {item.layer}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-sm font-semibold text-white">{item.name}</div>
                    <div className="text-xs text-slate-400 font-mono">{item.tokens} tokens</div>
                  </div>
                  <div className="text-xs text-slate-400">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <Link
            href="/docs/context-engine"
            className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors"
          >
            <span>Learn about context assembly</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Rights Layer */}
      <section className="mb-16" aria-labelledby="rights-layer-overview">
        <h2 id="rights-layer-overview" className="text-2xl font-bold text-white mb-6">
          Rights Layer & Privacy
        </h2>
        <div className="p-8 rounded-xl bg-white/5 border border-white/10">
          <p className="text-slate-300 leading-relaxed mb-4">
            VIVIM implements a <strong className="text-white">6-tier ownership model</strong> (T0-T5) that governs data visibility and sharing, ensuring users maintain complete control over their memory:
          </p>
          <div className="space-y-3 mb-6">
            {[
              { tier: "T0", name: "Personal Only", desc: "Visible only to you — complete privacy" },
              { tier: "T1", name: "Explicit Share", desc: "You choose specific recipients" },
              { tier: "T2", name: "Trusted Circle", desc: "Shared with approved connections" },
              { tier: "T3", name: "Community", desc: "Visible within defined communities" },
              { tier: "T4", name: "Anonymized", desc: "Stripped of PII, used for improvements" },
              { tier: "T5", name: "Regulated Public", desc: "Subject to regulatory disclosure" },
            ].map((item) => (
              <div key={item.tier} className="flex items-start gap-4 p-3 rounded-lg bg-white/5 border border-white/5">
                <div className="px-3 py-1 rounded bg-cyan-500/20 text-cyan-300 text-xs font-mono font-bold flex-shrink-0">
                  {item.tier}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-white mb-1">{item.name}</div>
                  <div className="text-xs text-slate-400">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-slate-300 leading-relaxed mb-4">
            Additionally, VIVIM's <strong className="text-white">Sentinel Detection System</strong> employs 13 algorithms to detect and prevent unauthorized data usage, ensuring your memory remains under your control at all times.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/docs/rights-layer"
              className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors"
            >
              <span>Rights Layer details</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/docs/privacy-security"
              className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors"
            >
              <span>Privacy & Security</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* API & Integration */}
      <section className="mb-16" aria-labelledby="api-integration">
        <h2 id="api-integration" className="text-2xl font-bold text-white mb-6">
          API & Integration
        </h2>
        <div className="p-8 rounded-xl bg-white/5 border border-white/10">
          <p className="text-slate-300 leading-relaxed mb-4">
            VIVIM provides a comprehensive <strong className="text-white">RESTful API</strong> with endpoints for:
          </p>
          <ul className="space-y-2 text-slate-300 mb-6">
            <li className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-violet-400 mt-1 flex-shrink-0" />
              <span><strong className="text-white">Memory Management:</strong> CRUD operations for all 9 memory types with vector search capabilities</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-violet-400 mt-1 flex-shrink-0" />
              <span><strong className="text-white">Chat Operations:</strong> Create, manage, and query conversations with automatic ACU decomposition</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-violet-400 mt-1 flex-shrink-0" />
              <span><strong className="text-white">Context Assembly:</strong> Retrieve dynamically assembled context packages for AI provider integration</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-violet-400 mt-1 flex-shrink-0" />
              <span><strong className="text-white">Authentication:</strong> JWT-based auth with shared package integration across frontend and backend</span>
            </li>
            <li className="flex items-start gap-2">
              <FileText className="w-4 h-4 text-violet-400 mt-1 flex-shrink-0" />
              <span><strong className="text-white">Marketplace:</strong> Zero-knowledge proof-based intelligence marketplace with escrow</span>
            </li>
          </ul>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/docs/api-reference"
              className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors"
            >
              <span>API Reference</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/docs/sdk-guide"
              className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors"
            >
              <span>SDK Guide</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mb-16" aria-labelledby="get-started">
        <div className="p-8 rounded-xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/20">
          <h2 id="get-started" className="text-2xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-slate-300 leading-relaxed mb-6">
            Start building with VIVIM's sovereign AI memory layer. Whether you're integrating memory into your AI application or exploring the architecture, we have everything you need.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors"
            >
              <Rocket className="w-5 h-5" />
              <span>Quick Start Guide</span>
            </Link>
            <Link
              href="/docs/api-reference"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors border border-white/10"
            >
              <Code2 className="w-5 h-5" />
              <span>API Reference</span>
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
