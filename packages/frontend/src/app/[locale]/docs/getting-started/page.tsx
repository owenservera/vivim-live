import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Rocket,
  CheckCircle2,
  AlertCircle,
  Code2,
  Database,
  MessageSquare,
  Settings,
  Layers,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Getting Started with VIVIM - Quick Start Guide",
  description: "Get up and running with VIVIM in minutes. Step-by-step guide to installing, configuring, and using the sovereign AI memory platform for the first time.",
  keywords: [
    "VIVIM getting started",
    "VIVIM quick start",
    "install VIVIM",
    "setup VIVIM",
    "VIVIM tutorial",
    "first VIVIM conversation",
    "VIVIM installation guide",
    "VIVIM configuration",
    "VIVIM environment setup",
  ],
  alternates: {
    canonical: "https://vivim.live/docs/getting-started",
  },
};

export default function GettingStartedPage() {
  return (
    <article className="prose prose-invert prose-lg max-w-none">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-slate-400">
          <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
          <li>/</li>
          <li className="text-white" aria-current="page">Getting Started</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Rocket className="w-8 h-8 text-violet-400" />
          <h1 className="text-4xl lg:text-5xl font-bold text-white">Getting Started</h1>
        </div>
        <p className="text-xl text-slate-300 leading-relaxed">
          Get up and running with VIVIM in minutes. This guide walks you through installation, configuration, and your first AI conversation with persistent memory.
        </p>
      </header>

      {/* Prerequisites */}
      <section className="mb-12" aria-labelledby="prerequisites">
        <h2 id="prerequisites" className="text-2xl font-bold text-white mb-6">Prerequisites</h2>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10">
          <p className="text-slate-300 leading-relaxed mb-4">Before you begin, ensure you have:</p>
          <ul className="space-y-3 text-slate-300">
            {[
              ["Node.js 18+", "Required for running the Next.js frontend"],
              ["Bun 1.0+", "Package manager and runtime for the monorepo"],
              ["PostgreSQL 14+", "Database with pgvector extension for memory storage"],
              ["Git", "For cloning the repository"],
              ["AI Provider API Key", "OpenAI, Anthropic, Google, or xAI credentials"],
            ].map(([item, desc]) => (
              <li key={item} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <div><strong className="text-white">{item}</strong> — <span className="text-sm text-slate-400">{desc}</span></div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Step 1: Clone */}
      <section className="mb-12" aria-labelledby="step-clone">
        <h2 id="step-clone" className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-300 font-bold">1</span>
          Clone the Repository
        </h2>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <p className="text-slate-300 leading-relaxed">Clone the VIVIM monorepo from GitHub:</p>
          <pre className="text-sm text-slate-300 font-mono bg-slate-900/50 rounded-lg px-4 py-3 border border-white/5 overflow-x-auto">
{`git clone https://github.com/owenservera/vivim-live.git
cd vivim-live`}
          </pre>
          <p className="text-slate-300 leading-relaxed">Install dependencies using Bun:</p>
          <pre className="text-sm text-slate-300 font-mono bg-slate-900/50 rounded-lg px-4 py-3 border border-white/5 overflow-x-auto">
{`bun install`}
          </pre>
        </div>
      </section>

      {/* Step 2: Environment */}
      <section className="mb-12" aria-labelledby="step-env">
        <h2 id="step-env" className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-300 font-bold">2</span>
          Configure Environment Variables
        </h2>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <p className="text-slate-300 leading-relaxed">Copy the example environment files and configure them:</p>
          <pre className="text-sm text-slate-300 font-mono bg-slate-900/50 rounded-lg px-4 py-3 border border-white/5 overflow-x-auto">
{`# Backend environment
cp packages/backend/.env.example packages/backend/.env

# Frontend environment  
cp packages/frontend/.env.local.example packages/frontend/.env.local`}
          </pre>
          <p className="text-slate-300 leading-relaxed mb-4">Key variables to configure:</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-2 px-3 text-slate-300 font-semibold">Variable</th>
                  <th className="text-left py-2 px-3 text-slate-300 font-semibold">Description</th>
                  <th className="text-left py-2 px-3 text-slate-300 font-semibold">Example</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                {[
                  ["DATABASE_URL", "PostgreSQL connection string", "postgresql://user:pass@localhost:5432/vivim"],
                  ["OPENAI_API_KEY", "Your OpenAI API key", "sk-proj-..."],
                  ["ANTHROPIC_API_KEY", "Your Anthropic API key", "sk-ant-..."],
                  ["JWT_SECRET", "Secret for signing JWT tokens", "your-super-secret-key-here"],
                  ["PORT", "Backend server port", "3001"],
                ].map(([var_, desc, example]) => (
                  <tr key={var_} className="border-b border-white/5">
                    <td className="py-2 px-3 font-mono text-xs text-violet-300">{var_}</td>
                    <td className="py-2 px-3 text-xs text-slate-400">{desc}</td>
                    <td className="py-2 px-3 font-mono text-xs text-slate-500">{example}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Step 3: Database */}
      <section className="mb-12" aria-labelledby="step-db">
        <h2 id="step-db" className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-300 font-bold">3</span>
          Setup Database
        </h2>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <p className="text-slate-300 leading-relaxed">Run Prisma migrations to create the database schema:</p>
          <pre className="text-sm text-slate-300 font-mono bg-slate-900/50 rounded-lg px-4 py-3 border border-white/5 overflow-x-auto">
{`cd packages/backend

# Run migrations (creates tables and pgvector extension)
bunx prisma migrate dev

# (Optional) Seed the database with sample data
bun run seed`}
          </pre>
          <div className="p-4 rounded-lg bg-amber-500/5 border border-amber-500/20 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-slate-300"><strong className="text-white">Note:</strong> Ensure PostgreSQL is running and the <code className="text-violet-300">pgvector</code> extension is available. The migration will attempt to create it automatically.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Step 4: Start Servers */}
      <section className="mb-12" aria-labelledby="step-start">
        <h2 id="step-start" className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-300 font-bold">4</span>
          Start Development Servers
        </h2>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <p className="text-slate-300 leading-relaxed">Start both the backend and frontend servers:</p>
          <pre className="text-sm text-slate-300 font-mono bg-slate-900/50 rounded-lg px-4 py-3 border border-white/5 overflow-x-auto">
{`# Terminal 1 - Backend (runs on port 3001)
cd packages/backend
bun dev

# Terminal 2 - Frontend (runs on port 3000)
cd packages/frontend
bun dev`}
          </pre>
          <p className="text-slate-300 leading-relaxed">Once both servers are running:</p>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span><strong className="text-white">Frontend:</strong> <a href="http://localhost:3000" className="text-violet-400 hover:text-violet-300">http://localhost:3000</a></span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
              <span><strong className="text-white">Backend API:</strong> <a href="http://localhost:3001" className="text-violet-400 hover:text-violet-300">http://localhost:3001</a></span>
            </li>
          </ul>
        </div>
      </section>

      {/* Step 5: First Account */}
      <section className="mb-12" aria-labelledby="step-account">
        <h2 id="step-account" className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-300 font-bold">5</span>
          Create Your First Account
        </h2>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <p className="text-slate-300 leading-relaxed">Navigate to <strong className="text-white">http://localhost:3000</strong> and create an account:</p>
          <ol className="space-y-3 text-slate-300 list-decimal list-inside">
            <li>Click <strong className="text-white">"Sign Up"</strong> on the landing page</li>
            <li>Enter your email and choose a strong password</li>
            <li>Verify your email (check your inbox for the verification link)</li>
            <li>Complete your profile setup (optional: add name, preferences)</li>
          </ol>
          <p className="text-slate-300 leading-relaxed">Once logged in, you'll see your <strong className="text-white">Memory Dashboard</strong> — your central hub for managing AI context.</p>
        </div>
      </section>

      {/* Step 6: Configure AI Provider */}
      <section className="mb-12" aria-labelledby="step-provider">
        <h2 id="step-provider" className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-300 font-bold">6</span>
          Configure Your AI Provider
        </h2>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <p className="text-slate-300 leading-relaxed">Before chatting, configure at least one AI provider:</p>
          <ol className="space-y-3 text-slate-300 list-decimal list-inside">
            <li>Go to <strong className="text-white">Settings → AI Providers</strong></li>
            <li>Select your preferred provider (OpenAI, Anthropic, Google, or xAI)</li>
            <li>Enter your API key (or use the one configured in <code className="text-violet-300">.env</code>)</li>
            <li>Choose a default model (e.g., GPT-4o, Claude 3.5 Sonnet)</li>
            <li>Click <strong className="text-white">"Save"</strong></li>
          </ol>
          <div className="p-4 rounded-lg bg-violet-500/5 border border-violet-500/20">
            <p className="text-sm text-slate-300"><strong className="text-white">💡 Pro Tip:</strong> You can switch providers at any time without losing your memory. VIVIM's portability means your context works with any AI model.</p>
          </div>
        </div>
      </section>

      {/* Step 7: First Conversation */}
      <section className="mb-12" aria-labelledby="step-conversation">
        <h2 id="step-conversation" className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-300 font-bold">7</span>
          Start Your First AI Conversation
        </h2>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <p className="text-slate-300 leading-relaxed">Now for the exciting part — your first conversation with persistent memory:</p>
          <ol className="space-y-3 text-slate-300 list-decimal list-inside">
            <li>Click <strong className="text-white">"Chat"</strong> in the navigation bar</li>
            <li>Send your first message (e.g., <em className="text-slate-400">"Hi! I'm a full-stack developer working with Next.js and TypeScript"</em>)</li>
            <li>Notice how the AI responds with context awareness</li>
            <li>Send another message about a different topic</li>
            <li>Refresh the page — the AI still remembers your context! 🎉</li>
          </ol>
          <p className="text-slate-300 leading-relaxed">Your conversation is being stored as <Link href="/docs/memory-system" className="text-violet-400 hover:text-violet-300">Atomic Chat Units (ACUs)</Link> and the <Link href="/docs/context-engine" className="text-violet-400 hover:text-violet-300">8-Layer Context Engine</Link> is assembling relevant memory for each interaction.</p>
        </div>
      </section>

      {/* Step 8: Memory Dashboard */}
      <section className="mb-12" aria-labelledby="step-dashboard">
        <h2 id="step-dashboard" className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-300 font-bold">8</span>
          Explore Your Memory Dashboard
        </h2>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <p className="text-slate-300 leading-relaxed">The Memory Dashboard gives you full visibility and control over your AI context:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { title: "Memory Browser", desc: "View and search all your stored memories across 9 memory types" },
              { title: "Context Viewer", desc: "See exactly what context is sent to AI providers for each interaction" },
              { title: "Rights Manager", desc: "Control privacy levels (T0-T5) for different memories" },
              { title: "Export Tools", desc: "Download your entire memory in JSON or CSV format" },
            ].map((item) => (
              <div key={item.title} className="p-4 rounded-lg bg-white/5 border border-white/5">
                <h4 className="text-sm font-semibold text-white mb-1">{item.title}</h4>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="mb-12" aria-labelledby="troubleshooting">
        <h2 id="troubleshooting" className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <AlertCircle className="w-7 h-7 text-amber-400" />
          Troubleshooting Common Issues
        </h2>
        <div className="space-y-4">
          {[
            {
              issue: "Backend won't start — 'DATABASE_URL not found'",
              solution: "Ensure you've copied .env.example to .env in packages/backend/ and set a valid PostgreSQL connection string. Check that PostgreSQL is running.",
            },
            {
              issue: "Frontend shows 'Failed to fetch' errors",
              solution: "Verify the backend is running on port 3001. Check that the frontend's API rewrite configuration in next.config.ts points to the correct backend URL.",
            },
            {
              issue: "Prisma migration fails",
              solution: "Ensure pgvector extension is installed in PostgreSQL. For local dev: CREATE EXTENSION vector; in your database. Check DATABASE_URL format.",
            },
            {
              issue: "AI responses don't include memory context",
              solution: "Verify your AI provider API key is configured correctly. Check browser console for errors. Ensure you have at least one message in your conversation history.",
            },
            {
              issue: "Port already in use errors",
              solution: "Another process is using port 3000 or 3001. Kill the existing process or change the PORT variable in your .env files.",
            },
          ].map((item) => (
            <div key={item.issue} className="p-5 rounded-lg bg-white/5 border border-white/10">
              <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-400" />
                {item.issue}
              </h4>
              <p className="text-sm text-slate-400 leading-relaxed">{item.solution}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Next Steps */}
      <section className="mb-12" aria-labelledby="next-steps">
        <h2 id="next-steps" className="text-2xl font-bold text-white mb-6">Next Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { href: "/docs/what-is-vivim", title: "What is VIVIM", desc: "Deep dive into VIVIM's core concepts and architecture", icon: Rocket, color: "from-violet-500/10 to-purple-500/10 border-violet-500/20" },
            { href: "/docs/memory-system", title: "Memory System", desc: "Explore the 9 memory types and how they work together", icon: Database, color: "from-cyan-500/10 to-blue-500/10 border-cyan-500/20" },
            { href: "/docs/context-engine", title: "Context Engine", desc: "Learn how VIVIM assembles context dynamically", icon: Layers, color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20" },
            { href: "/docs/rights-layer", title: "Rights Layer", desc: "Understand the 6-tier privacy model", icon: Shield, color: "from-amber-500/10 to-orange-500/10 border-amber-500/20" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href} className={`group block p-6 rounded-xl bg-gradient-to-br ${card.color} border transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-violet-500/10`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/5 flex-shrink-0">
                    <Icon className="w-6 h-6 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-violet-300 transition-colors">{card.title}</h3>
                    <p className="text-sm text-slate-300 leading-relaxed mb-3">{card.desc}</p>
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
