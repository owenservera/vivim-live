import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Brain, Globe, Shield, Users, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "What is VIVIM - Sovereign AI Memory Platform Overview",
  description: "Learn what VIVIM is: a sovereign, portable, personal AI memory layer that gives you complete ownership of your AI conversation context across all providers. Understand the problem VIVIM solves and how it works.",
  keywords: [
    "what is VIVIM",
    "AI memory platform",
    "sovereign AI",
    "portable AI memory",
    "personal memory layer",
    "AI context ownership",
    "provider agnostic memory",
    "AI memory ownership",
    "VIVIM explained",
  ],
  alternates: {
    canonical: "https://vivim.live/docs/what-is-vivim",
  },
};

export default function WhatIsVivimPage() {
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
            What is VIVIM
          </li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-8 h-8 text-violet-400" />
          <h1 className="text-4xl lg:text-5xl font-bold text-white">
            What is VIVIM?
          </h1>
        </div>
        <p className="text-xl text-slate-300 leading-relaxed">
          VIVIM is a sovereign, portable, personal AI memory layer that gives you complete ownership of your AI conversation context across all providers.
        </p>
      </header>

      {/* The Problem */}
      <section className="mb-12" aria-labelledby="problem-heading">
        <h2 id="problem-heading" className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
            <span className="text-red-400 text-xl">!</span>
          </span>
          The Problem VIVIM Solves
        </h2>
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            Today's AI assistants suffer from a fundamental limitation: <strong className="text-white">ephemeral context</strong>. Every conversation starts from scratch. Your AI doesn't remember who you are, what you're working on, or what you discussed last week. This forces users to repeatedly explain themselves, fragmenting their AI interactions across sessions and providers.
          </p>
          <p>
            Worse, when context <em>is</em> maintained, it's locked into the provider's ecosystem. Switch from ChatGPT to Claude? You lose everything. Your AI memory belongs to the platform, not to you. This creates <strong className="text-white">vendor lock-in</strong> at the memory level — one of the most insidious forms of dependency because it's invisible until you try to leave.
          </p>
          <div className="p-6 rounded-xl bg-red-500/5 border border-red-500/20 my-8">
            <h3 className="text-lg font-semibold text-red-300 mb-3">Key Problems</h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span><strong className="text-white">No persistent memory:</strong> AI assistants forget everything between sessions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span><strong className="text-white">Vendor lock-in:</strong> Your AI memory is trapped in the provider's ecosystem</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span><strong className="text-white">No user ownership:</strong> Platforms claim ownership of your conversation data</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span><strong className="text-white">Fragmented context:</strong> Different providers maintain separate, incompatible memory systems</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span><strong className="text-white">Privacy concerns:</strong> No control over how your conversation data is used or shared</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="mb-12" aria-labelledby="solution-heading">
        <h2 id="solution-heading" className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-emerald-400" />
          </span>
          The VIVIM Solution
        </h2>
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            <strong className="text-white">VIVIM</strong> (pronounced "VIV-im") creates a <strong className="text-white">living memory layer</strong> that sits between you and AI providers, giving you complete ownership and control of your AI conversation context. Think of it as a personal memory database that works with any AI provider you choose.
          </p>
          <p>
            When you interact with an AI assistant through VIVIM, our system decomposes your conversation into <strong className="text-white">Atomic Chat Units (ACUs)</strong> — granular, storable memory objects. When you need context for your next interaction, our <strong className="text-white">8-Layer Context Engine</strong> dynamically assembles the optimal context package from 9 different memory types, all under your control.
          </p>

          <div className="p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20 my-8">
            <h3 className="text-lg font-semibold text-emerald-300 mb-3">How It Works</h3>
            <ol className="space-y-3 text-slate-300 list-decimal list-inside">
              <li><strong className="text-white">You interact</strong> with any AI provider (OpenAI, Anthropic, Google, xAI) through VIVIM's interface or API</li>
              <li><strong className="text-white">VIVIM stores</strong> your conversation as ACUs in your personal memory layer with PostgreSQL + pgvector</li>
              <li><strong className="text-white">Context Engine assembles</strong> optimal context from 9 memory types across 8 layers for each interaction</li>
              <li><strong className="text-white">AI provider receives</strong> rich, personalized context while you maintain full ownership</li>
              <li><strong className="text-white">You control</strong> what's stored, what's shared, and can export everything at any time</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Core Principles */}
      <section className="mb-12" aria-labelledby="principles-heading">
        <h2 id="principles-heading" className="text-2xl font-bold text-white mb-6">
          Core Principles
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              icon: Shield,
              title: "Sovereign",
              description: "You own your memory data completely. VIVIM never claims ownership — your AI memory belongs to you, not the platform. Every ACU, every context layer, every memory type is yours.",
              color: "from-violet-500 to-purple-600",
            },
            {
              icon: Users,
              title: "Personal",
              description: "Your memory is yours alone. Unlike shared databases where user data commingles, VIVIM creates an individual memory layer unique to each user with strict isolation boundaries.",
              color: "from-cyan-500 to-blue-600",
            },
            {
              icon: Globe,
              title: "Provider Agnostic",
              description: "Switch between GPT-4, Claude, Gemini, or xAI — your memory stays intact. VIVIM works with any AI provider through a unified API layer, ensuring no vendor lock-in at the memory level.",
              color: "from-emerald-500 to-teal-600",
            },
            {
              icon: Zap,
              title: "Portable",
              description: "Export your entire memory at any time in standard formats (JSON, CSV). Take your AI memory wherever you go. Your data, your choice, your control.",
              color: "from-amber-500 to-orange-600",
            },
          ].map((principle) => {
            const Icon = principle.icon;
            return (
              <div
                key={principle.title}
                className="p-6 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${principle.color} flex-shrink-0`}
                  >
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">{principle.title}</h3>
                </div>
                <p className="text-slate-300 leading-relaxed">{principle.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Technical Architecture */}
      <section className="mb-12" aria-labelledby="tech-architecture">
        <h2 id="tech-architecture" className="text-2xl font-bold text-white mb-6">
          Technical Architecture
        </h2>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <p className="text-slate-300 leading-relaxed">
            VIVIM is built as a modern, production-grade monorepo with three main packages:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-white/5 border border-white/5">
              <h4 className="text-sm font-semibold text-white mb-2">Frontend</h4>
              <p className="text-xs text-slate-400 mb-2">Next.js 15 • React 19 • TypeScript</p>
              <p className="text-xs text-slate-400">App Router, Tailwind CSS 4, Framer Motion, shadcn/ui, full i18n (EN, ES, CA, AR with RTL)</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/5">
              <h4 className="text-sm font-semibold text-white mb-2">Backend</h4>
              <p className="text-xs text-slate-400 mb-2">Express.js 5 • Bun • TypeScript</p>
              <p className="text-xs text-slate-400">35+ route handlers, 48 service modules, OpenAPI spec, Socket.io realtime, Sentry monitoring</p>
            </div>
            <div className="p-4 rounded-lg bg-white/5 border border-white/5">
              <h4 className="text-sm font-semibold text-white mb-2">Database</h4>
              <p className="text-xs text-slate-400 mb-2">PostgreSQL • Prisma ORM • pgvector</p>
              <p className="text-xs text-slate-400">Vector similarity search, 9 memory types, ACU storage, context retrieval, semantic embeddings</p>
            </div>
          </div>
          <p className="text-slate-300 leading-relaxed">
            The system supports <strong className="text-white">OpenAI, Anthropic, Google, and xAI</strong> providers out of the box, with a unified API that makes switching between providers seamless. All conversations are processed through our <strong className="text-white">sentinel detection system</strong> with 13 algorithms to prevent unauthorized data usage.
          </p>
        </div>
      </section>

      {/* Key Differentiators */}
      <section className="mb-12" aria-labelledby="differentiators">
        <h2 id="differentiators" className="text-2xl font-bold text-white mb-6">
          Key Differentiators
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-slate-300 font-semibold">Feature</th>
                <th className="text-center py-3 px-4 text-violet-400 font-semibold">VIVIM</th>
                <th className="text-center py-3 px-4 text-slate-400 font-semibold">Traditional AI</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {[
                ["Memory Ownership", "User owns all data", "Platform owns data"],
                ["Provider Portability", "Switch freely", "Locked to provider"],
                ["Context Persistence", "Permanent across sessions", "Ephemeral per session"],
                ["Memory Types", "9 specialized types", "Typically single-thread"],
                ["Context Assembly", "Dynamic, per-interaction", "Static or none"],
                ["Privacy Control", "6-tier rights layer", "Platform-controlled"],
                ["Data Export", "Full export anytime", "Limited or none"],
                ["Sentinel Protection", "13 detection algorithms", "Platform-dependent"],
              ].map(([feature, vivim, traditional], i) => (
                <tr key={i} className="border-b border-white/5">
                  <td className="py-3 px-4 font-medium text-white">{feature}</td>
                  <td className="py-3 px-4 text-center text-emerald-300">{vivim}</td>
                  <td className="py-3 px-4 text-center text-slate-400">{traditional}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Use Cases */}
      <section className="mb-12" aria-labelledby="use-cases">
        <h2 id="use-cases" className="text-2xl font-bold text-white mb-6">
          Use Cases
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: "AI Development Assistants",
              description: "Maintain context across coding sessions, projects, and team members. Your AI remembers your codebase preferences, architecture decisions, and development patterns.",
              icon: "💻",
            },
            {
              title: "Customer Support",
              description: "Provide personalized support that remembers previous interactions, preferences, and resolution history without relying on the provider's memory systems.",
              icon: "🎧",
            },
            {
              title: "Education & Tutoring",
              description: "Track student progress, learning styles, and knowledge gaps across sessions. AI tutors that actually remember what was covered and what needs reinforcement.",
              icon: "📚",
            },
            {
              title: "Healthcare & Wellness",
              description: "Maintain patient history, treatment plans, and preferences across different AI health tools while keeping data under patient control with strict privacy tiers.",
              icon: "🏥",
            },
            {
              title: "Research & Knowledge Work",
              description: "Build a persistent knowledge base that evolves with your research. AI assistants that understand your domain expertise and can build on previous discussions.",
              icon: "🔬",
            },
            {
              title: "Personal Productivity",
              description: "Your AI life coach, planner, and thinking partner that remembers your goals, projects, and personal context across all interactions and providers.",
              icon: "⚡",
            },
          ].map((useCase) => (
            <div
              key={useCase.title}
              className="p-6 rounded-xl bg-white/5 border border-white/10"
            >
              <div className="text-3xl mb-3">{useCase.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{useCase.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{useCase.description}</p>
            </div>
          ))}
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
              href: "/docs/getting-started",
              title: "Quick Start Guide",
              description: "Get up and running with VIVIM in minutes. Learn how to integrate the memory layer into your AI applications.",
              icon: Rocket,
              color: "from-cyan-500/10 to-blue-500/10 border-cyan-500/20",
            },
            {
              href: "/docs/architecture",
              title: "System Architecture",
              description: "Deep dive into VIVIM's technical architecture, database schema, API structure, and deployment configuration.",
              icon: Network,
              color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20",
            },
            {
              href: "/docs/memory-system",
              title: "Memory System",
              description: "Explore the 9 types of memory VIVIM manages and how they work together to create comprehensive AI context.",
              icon: Database,
              color: "from-amber-500/10 to-orange-500/10 border-amber-500/20",
            },
            {
              href: "/docs/context-engine",
              title: "8-Layer Context Engine",
              description: "Learn how VIVIM assembles context dynamically through 8 layers with token budgets and assembly algorithms.",
              icon: Layers,
              color: "from-rose-500/10 to-pink-500/10 border-rose-500/20",
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
