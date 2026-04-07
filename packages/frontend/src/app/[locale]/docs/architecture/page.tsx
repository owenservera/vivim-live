import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Network, Database, Code2, Shield, Layers, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "VIVIM System Architecture - Monorepo Structure, Tech Stack & Deployment",
  description: "Deep dive into VIVIM's system architecture: monorepo structure with frontend, backend, and shared packages. PostgreSQL with pgvector, Express.js 5, Next.js 15, Prisma ORM, Socket.io real-time communication, and Vercel deployment configuration.",
  keywords: [
    "VIVIM architecture",
    "VIVIM system design",
    "monorepo structure",
    "Next.js 15",
    "Express.js 5",
    "PostgreSQL",
    "Prisma ORM",
    "pgvector",
    "Socket.io",
    "Vercel deployment",
    "REST API architecture",
    "database schema",
    "vector search",
    "real-time communication",
    "TypeScript monorepo",
    "Bun runtime",
    "API route structure",
    "security architecture",
    "environment variables",
    "system design",
  ],
  alternates: {
    canonical: "https://vivim.live/docs/architecture",
  },
  openGraph: {
    title: "VIVIM System Architecture",
    description: "Deep dive into VIVIM's technical architecture: monorepo structure, database design, API routes, real-time communication, and deployment configuration.",
    type: "article",
    locale: "en_US",
    siteName: "VIVIM Documentation",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function ArchitecturePage() {
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
            System Architecture
          </li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Network className="w-8 h-8 text-violet-400" />
          <h1 className="text-4xl lg:text-5xl font-bold text-white">
            System Architecture
          </h1>
        </div>
        <p className="text-xl text-slate-300 leading-relaxed">
          A comprehensive deep dive into VIVIM&apos;s technical architecture: monorepo structure, tech stack, database design, API routes, real-time communication, and deployment configuration.
        </p>
      </header>

      {/* Overview */}
      <section className="mb-12" aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <Network className="w-5 h-5 text-violet-400" />
          </span>
          Architecture Overview
        </h2>
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            VIVIM is engineered as a <strong className="text-white">production-grade monorepo</strong> built with modern tooling and designed for horizontal scalability. The architecture follows a clean separation of concerns between the presentation layer (frontend), business logic layer (backend), and data persistence layer (PostgreSQL with pgvector), while sharing common utilities, types, and authentication logic through a dedicated shared package.
          </p>
          <p>
            The system processes and manages AI conversation context through a sophisticated pipeline: user interactions flow through the Next.js 15 frontend, are routed to the Express.js 5 backend API, processed through 48+ service modules, persisted in PostgreSQL with vector embeddings via pgvector, and delivered back to users in real-time through Socket.io connections. Every layer is instrumented with Sentry monitoring, structured logging, and comprehensive error handling.
          </p>

          <div className="p-6 rounded-xl bg-violet-500/5 border border-violet-500/20 my-8">
            <h3 className="text-lg font-semibold text-violet-300 mb-3">Key Architectural Principles</h3>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-1">•</span>
                <span><strong className="text-white">Separation of Concerns:</strong> Frontend handles UI/UX, backend handles business logic, database handles persistence</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-1">•</span>
                <span><strong className="text-white">Type Safety End-to-End:</strong> Shared TypeScript types ensure consistency across all layers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-1">•</span>
                <span><strong className="text-white">Zero-Trust Data Isolation:</strong> Strict tenant boundaries prevent cross-user data leakage</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-1">•</span>
                <span><strong className="text-white">Provider Agnosticism:</strong> Unified API abstraction layer supports multiple AI providers interchangeably</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-1">•</span>
                <span><strong className="text-white">Horizontal Scalability:</strong> Stateless API servers, connection-pooled database, CDN-served static assets</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Monorepo Structure */}
      <section className="mb-12" aria-labelledby="monorepo-heading">
        <h2 id="monorepo-heading" className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center">
            <Layers className="w-5 h-5 text-cyan-400" />
          </span>
          Monorepo Structure
        </h2>
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            VIVIM uses a <strong className="text-white">monorepo architecture</strong> managed with modern package tooling. This approach provides several advantages: shared type definitions, consistent versioning, atomic commits across packages, simplified dependency management, and unified CI/CD pipelines. The repository is organized into three primary packages plus supporting infrastructure.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Package</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Technology</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Responsibility</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Key Metrics</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-medium text-white">frontend</td>
                  <td className="py-3 px-4">Next.js 15, React 19, TypeScript</td>
                  <td className="py-3 px-4">UI presentation, routing, i18n, client-side state</td>
                  <td className="py-3 px-4">100+ components, 4 locales</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-medium text-white">backend</td>
                  <td className="py-3 px-4">Express.js 5, Bun, TypeScript</td>
                  <td className="py-3 px-4">REST API, business logic, AI provider integration</td>
                  <td className="py-3 px-4">35+ routes, 48 services</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-medium text-white">shared/auth</td>
                  <td className="py-3 px-4">TypeScript, JWT, bcrypt</td>
                  <td className="py-3 px-4">Authentication middleware, type definitions</td>
                  <td className="py-3 px-4">Shared across all packages</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-medium text-white">database</td>
                  <td className="py-3 px-4">Prisma ORM, PostgreSQL</td>
                  <td className="py-3 px-4">Schema definitions, migrations, seed data</td>
                  <td className="py-3 px-4">20+ models, pgvector</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-6 rounded-xl bg-slate-900/50 border border-white/10 my-8">
            <h3 className="text-lg font-semibold text-white mb-3">Directory Structure</h3>
            <pre className="text-sm text-slate-300 overflow-x-auto bg-slate-950/50 p-4 rounded-lg border border-white/5">
{`vivim/
├── packages/
│   ├── frontend/                 # Next.js 15 application
│   │   ├── src/
│   │   │   ├── app/              # App Router pages and layouts
│   │   │   │   └── [locale]/     # i18n route group (en, es, ca, ar)
│   │   │   ├── components/       # React components (100+)
│   │   │   ├── lib/              # Client-side utilities
│   │   │   ├── hooks/            # Custom React hooks
│   │   │   └── styles/           # Tailwind CSS 4 configuration
│   │   ├── public/               # Static assets, favicons, images
│   │   ├── messages/             # i18n translation files (JSON)
│   │   ├── next.config.ts        # Next.js configuration
│   │   └── package.json          # Frontend dependencies
│   │
│   ├── backend/                  # Express.js 5 API server
│   │   ├── src/
│   │   │   ├── routes/           # Route handlers (35+ endpoints)
│   │   │   ├── services/         # Business logic (48 modules)
│   │   │   ├── middleware/       # Express middleware
│   │   │   ├── lib/              # Server-side utilities
│   │   │   ├── sockets/          # Socket.io event handlers
│   │   │   ├── types/            # TypeScript type definitions
│   │   │   └── index.ts          # Application entry point
│   │   ├── prisma/               # Database schema and migrations
│   │   ├── openapi/              # OpenAPI specification
│   │   ├── sentry.config.ts      # Sentry error monitoring
│   │   └── package.json          # Backend dependencies
│   │
│   └── shared/                   # Shared utilities and types
│       ├── auth/                 # Authentication middleware
│       │   ├── jwt.ts            # JWT token generation/verification
│       │   ├── bcrypt.ts         # Password hashing utilities
│       │   └── middleware.ts     # Express auth middleware
│       └── types/                # Shared TypeScript types
│           ├── user.ts           # User type definitions
│           ├── memory.ts         # Memory type definitions
│           ├── acu.ts            # Atomic Chat Unit types
│           └── index.ts          # Type exports
│
├── docker/                       # Docker configuration
├── scripts/                      # Build and deployment scripts
├── .env.example                  # Environment variable template
├── turbo.json                    # Turborepo configuration
└── package.json                  # Root package.json (workspace)`}
            </pre>
          </div>
        </div>
      </section>

      {/* Tech Stack */}
      <section className="mb-12" aria-labelledby="tech-stack-heading">
        <h2 id="tech-stack-heading" className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-emerald-400" />
          </span>
          Technology Stack
        </h2>
        <div className="space-y-6 text-slate-300 leading-relaxed">
          <p>
            VIVIM&apos;s technology stack is carefully selected for <strong className="text-white">performance, type safety, developer experience, and production readiness</strong>. Every technology choice serves a specific architectural purpose.
          </p>

          {/* Frontend Stack */}
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-violet-400" />
              Frontend Stack
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  name: "Next.js 15",
                  desc: "React framework with App Router, Server Components, Server Actions, and automatic code splitting. Provides SSR/SSR for optimal performance and SEO.",
                  purpose: "Application framework",
                },
                {
                  name: "React 19",
                  desc: "Latest React with concurrent rendering, Suspense boundaries, Server Components, and Actions. Enables efficient UI updates and streaming rendering.",
                  purpose: "UI library",
                },
                {
                  name: "TypeScript 5.x",
                  desc: "Strict mode enabled with comprehensive type definitions. Ensures type safety across the entire frontend codebase with zero 'any' types in critical paths.",
                  purpose: "Type safety",
                },
                {
                  name: "Tailwind CSS 4",
                  desc: "Utility-first CSS framework with custom design tokens. Provides consistent spacing, colors, typography, and responsive breakpoints across all components.",
                  purpose: "Styling system",
                },
                {
                  name: "Framer Motion",
                  desc: "Production-ready animation library for React. Powers page transitions, layout animations, micro-interactions, and gesture-based interactions.",
                  purpose: "Animations",
                },
                {
                  name: "shadcn/ui",
                  desc: "Accessible, unstyled component primitives built on Radix UI. Provides dialog, dropdown, tooltip, toast, and form components with full keyboard navigation.",
                  purpose: "Component primitives",
                },
                {
                  name: "next-intl",
                  desc: "Internationalization framework for Next.js App Router. Supports 4 locales (en, es, ca, ar) with RTL layout for Arabic, message extraction, and type-safe translations.",
                  purpose: "i18n / l10n",
                },
              ].map((tech) => (
                <div key={tech.name} className="p-4 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white">{tech.name}</h4>
                    <span className="text-xs px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 font-mono">
                      {tech.purpose}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Backend Stack */}
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Code2 className="w-5 h-5 text-cyan-400" />
              Backend Stack
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  name: "Express.js 5",
                  desc: "Minimal, unopinionated web framework for Node.js. Provides routing, middleware pipeline, and request/response handling for 35+ REST API endpoints.",
                  purpose: "HTTP framework",
                },
                {
                  name: "Bun Runtime",
                  desc: "All-in-one JavaScript runtime, bundler, and package manager. Provides faster startup times, native TypeScript support, and built-in test runner compared to Node.js.",
                  purpose: "Runtime environment",
                },
                {
                  name: "Socket.io",
                  desc: "Real-time bidirectional event-based communication. Powers live chat, typing indicators, connection status, and real-time memory updates.",
                  purpose: "Real-time communication",
                },
                {
                  name: "Zod",
                  desc: "TypeScript-first schema validation with static type inference. Validates all API request bodies, query parameters, and response shapes at runtime.",
                  purpose: "Request validation",
                },
                {
                  name: "Sentry",
                  desc: "Application monitoring and error tracking. Captures exceptions, performance metrics, and user breadcrumbs across backend services.",
                  purpose: "Error monitoring",
                },
                {
                  name: "Winston / Pino",
                  desc: "Structured JSON logging with log levels, request IDs, and correlation IDs. Integrates with external log aggregation systems for production observability.",
                  purpose: "Logging",
                },
                {
                  name: "OpenAI / Anthropic SDKs",
                  desc: "Official SDKs for AI provider integration. Handles API calls, streaming responses, token counting, and error handling for multiple providers.",
                  purpose: "AI provider integration",
                },
              ].map((tech) => (
                <div key={tech.name} className="p-4 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white">{tech.name}</h4>
                    <span className="text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                      {tech.purpose}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Database Stack */}
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-400" />
              Database Stack
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                {
                  name: "PostgreSQL 15+",
                  desc: "Advanced open-source relational database with ACID compliance, row-level security, and extensibility. Serves as the primary data store for all VIVIM entities.",
                  purpose: "Primary database",
                },
                {
                  name: "pgvector",
                  desc: "PostgreSQL extension for vector similarity search. Stores and queries 1536-dimensional embeddings (OpenAI ada-002) for semantic memory retrieval across all 9 memory types.",
                  purpose: "Vector similarity search",
                },
                {
                  name: "Prisma ORM",
                  desc: "Type-safe database toolkit with auto-generated client. Provides schema migrations, type-safe queries, connection pooling, and database seeding for development.",
                  purpose: "ORM / Data access layer",
                },
                {
                  name: "Redis (optional)",
                  desc: "In-memory data store for caching frequently accessed context, session management, rate limiting counters, and Socket.io adapter for horizontal scaling.",
                  purpose: "Caching / Session store",
                },
              ].map((tech) => (
                <div key={tech.name} className="p-4 rounded-lg bg-white/5 border border-white/5">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-sm font-semibold text-white">{tech.name}</h4>
                    <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                      {tech.purpose}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{tech.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Database Architecture */}
      <section className="mb-12" aria-labelledby="database-heading">
        <h2 id="database-heading" className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Database className="w-5 h-5 text-amber-400" />
          </span>
          Database Architecture
        </h2>
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            VIVIM&apos;s database architecture is built around <strong className="text-white">PostgreSQL with the pgvector extension</strong>, providing both relational data integrity and vector similarity search capabilities in a single database. This unified approach eliminates the need for separate vector databases, reducing operational complexity and ensuring transactional consistency between metadata and embeddings.
          </p>

          {/* Core Schema Models */}
          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Core Database Models</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Model</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Purpose</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Key Fields</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Relations</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono text-violet-300">User</td>
                  <td className="py-3 px-4">Platform users with authentication</td>
                  <td className="py-3 px-4 font-mono text-xs">id, email, passwordHash, name</td>
                  <td className="py-3 px-4 text-xs">1:N Memories, 1:N Conversations</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono text-violet-300">Memory</td>
                  <td className="py-3 px-4">Core memory entities (9 types)</td>
                  <td className="py-3 px-4 font-mono text-xs">id, type, content, embedding, rightsTier</td>
                  <td className="py-3 px-4 text-xs">N:1 User, 1:N ACUs</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono text-violet-300">ACU</td>
                  <td className="py-3 px-4">Atomic Chat Units</td>
                  <td className="py-3 px-4 font-mono text-xs">id, content, timestamp, sessionRef</td>
                  <td className="py-3 px-4 text-xs">N:1 Memory, N:1 Conversation</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono text-violet-300">Conversation</td>
                  <td className="py-3 px-4">Chat sessions with AI providers</td>
                  <td className="py-3 px-4 font-mono text-xs">id, provider, model, status</td>
                  <td className="py-3 px-4 text-xs">N:1 User, 1:N Messages</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono text-violet-300">Message</td>
                  <td className="py-3 px-4">Individual chat messages</td>
                  <td className="py-3 px-4 font-mono text-xs">id, role, content, tokens</td>
                  <td className="py-3 px-4 text-xs">N:1 Conversation</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono text-violet-300">ContextAssembly</td>
                  <td className="py-3 px-4">Assembled context for AI requests</td>
                  <td className="py-3 px-4 font-mono text-xs">id, layers, totalTokens, timestamp</td>
                  <td className="py-3 px-4 text-xs">N:1 Conversation, N:N Memories</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono text-violet-300">RightsTier</td>
                  <td className="py-3 px-4">Data visibility and sharing rules</td>
                  <td className="py-3 px-4 font-mono text-xs">id, tier (T0-T5), scope, conditions</td>
                  <td className="py-3 px-4 text-xs">N:1 Memory</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono text-violet-300">SharedMemory</td>
                  <td className="py-3 px-4">Cross-user memory sharing records</td>
                  <td className="py-3 px-4 font-mono text-xs">id, owner, recipient, permissions</td>
                  <td className="py-3 px-4 text-xs">N:1 Memory (owner), N:1 User (recipient)</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono text-violet-300">SentinelEvent</td>
                  <td className="py-3 px-4">Detected security/policy violations</td>
                  <td className="py-3 px-4 font-mono text-xs">id, type, severity, metadata</td>
                  <td className="py-3 px-4 text-xs">N:1 User, N:1 Conversation</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Vector Search Architecture */}
          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Vector Search with pgvector</h3>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <p className="text-slate-300 leading-relaxed mb-4">
              The <strong className="text-white">pgvector extension</strong> is central to VIVIM&apos;s semantic memory retrieval. Each Memory record stores a vector embedding (typically 1536 dimensions from OpenAI&apos;s text-embedding-ada-002 model) that captures the semantic meaning of the memory content. This enables retrieval of semantically similar memories without exact keyword matching.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                <h4 className="text-sm font-semibold text-white mb-2">1. Embedding Generation</h4>
                <p className="text-xs text-slate-400">When a memory is created, its content is sent to the embedding model, which generates a dense vector representation capturing semantic meaning.</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                <h4 className="text-sm font-semibold text-white mb-2">2. Vector Storage</h4>
                <p className="text-xs text-slate-400">Embeddings are stored in a PostgreSQL vector column with HNSW or IVFFlat indexing for efficient approximate nearest-neighbor search at scale.</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                <h4 className="text-sm font-semibold text-white mb-2">3. Similarity Retrieval</h4>
                <p className="text-xs text-slate-400">During context assembly, queries use cosine similarity or L2 distance to find the top-K most relevant memories for the current interaction.</p>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-lg bg-slate-950/50 border border-white/5">
              <pre className="text-xs text-slate-300 overflow-x-auto">
{`-- Example: Semantic similarity query with pgvector
SELECT id, content, type, rights_tier,
       1 - (embedding <=> '[query_embedding]') AS similarity
FROM memories
WHERE user_id = 'current_user'
  AND rights_tier IN ('T0', 'T1', 'T2')
  AND type IN ('episodic', 'semantic', 'procedural')
ORDER BY embedding <=> '[query_embedding]'
LIMIT 20;`}
              </pre>
            </div>
          </div>

          {/* Prisma Schema Highlights */}
          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Prisma Schema Highlights</h3>
          <div className="p-6 rounded-xl bg-slate-900/50 border border-white/10">
            <p className="text-slate-300 leading-relaxed mb-4">
              VIVIM uses <strong className="text-white">Prisma ORM</strong> for type-safe database access. The schema defines models, relations, indexes, and constraints that enforce data integrity at the ORM level. Key schema features include:
            </p>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-1">•</span>
                <span><strong className="text-white">Relation cascades:</strong> onDelete: Cascade ensures that when a user is deleted, all their memories, ACUs, and conversations are automatically removed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-1">•</span>
                <span><strong className="text-white">Unique constraints:</strong> Email uniqueness, composite unique indexes on (userId, memoryType, rightsTier)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-1">•</span>
                <span><strong className="text-white">Enum types:</strong> MemoryType (9 variants), RightsTier (T0-T5), MessageRole (user/assistant/system)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-1">•</span>
                <span><strong className="text-white">JSON fields:</strong> Flexible metadata storage for AI provider responses, context assembly results, and sentinel event details</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-amber-400 mt-1">•</span>
                <span><strong className="text-white">Timestamps:</strong> createdAt and updatedAt auto-managed fields on all models for audit trails</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* API Architecture */}
      <section className="mb-12" aria-labelledby="api-heading">
        <h2 id="api-heading" className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
            <Code2 className="w-5 h-5 text-rose-400" />
          </span>
          API Architecture
        </h2>
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            VIVIM&apos;s backend exposes a <strong className="text-white">comprehensive RESTful API</strong> with 35+ route handlers organized into logical resource groups. The API follows REST conventions with JSON request/response bodies, standard HTTP status codes, and comprehensive error handling. All endpoints are authenticated via JWT bearer tokens (except auth endpoints) and validated with Zod schemas.
          </p>

          {/* API Route Structure */}
          <h3 className="text-xl font-semibold text-white mt-8 mb-4">API Route Structure</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Route Group</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Base Path</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Methods</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-medium text-white">Authentication</td>
                  <td className="py-3 px-4 font-mono text-xs text-violet-300">/api/auth</td>
                  <td className="py-3 px-4 font-mono text-xs">POST</td>
                  <td className="py-3 px-4 text-xs">Register, login, refresh token, logout, password reset</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-medium text-white">Memory</td>
                  <td className="py-3 px-4 font-mono text-xs text-violet-300">/api/memories</td>
                  <td className="py-3 px-4 font-mono text-xs">GET, POST, PUT, DELETE</td>
                  <td className="py-3 px-4 text-xs">CRUD operations for all 9 memory types with filtering and pagination</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-medium text-white">Chat</td>
                  <td className="py-3 px-4 font-mono text-xs text-violet-300">/api/chat</td>
                  <td className="py-3 px-4 font-mono text-xs">POST</td>
                  <td className="py-3 px-4 text-xs">Send messages to AI providers with assembled context, streaming support</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-medium text-white">Context</td>
                  <td className="py-3 px-4 font-mono text-xs text-violet-300">/api/context</td>
                  <td className="py-3 px-4 font-mono text-xs">GET, POST</td>
                  <td className="py-3 px-4 text-xs">Assemble context from 8 layers, retrieve assembled context for a conversation</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-medium text-white">Conversations</td>
                  <td className="py-3 px-4 font-mono text-xs text-violet-300">/api/conversations</td>
                  <td className="py-3 px-4 font-mono text-xs">GET, POST, DELETE</td>
                  <td className="py-3 px-4 text-xs">List, create, and manage conversation sessions with AI providers</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-medium text-white">ACU</td>
                  <td className="py-3 px-4 font-mono text-xs text-violet-300">/api/acus</td>
                  <td className="py-3 px-4 font-mono text-xs">GET, POST</td>
                  <td className="py-3 px-4 text-xs">Create and retrieve Atomic Chat Units from conversations</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-medium text-white">Shared Memory</td>
                  <td className="py-3 px-4 font-mono text-xs text-violet-300">/api/shared</td>
                  <td className="py-3 px-4 font-mono text-xs">GET, POST, DELETE</td>
                  <td className="py-3 px-4 text-xs">Share memories with other users, manage permissions, view received shares</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-medium text-white">Marketplace</td>
                  <td className="py-3 px-4 font-mono text-xs text-violet-300">/api/marketplace</td>
                  <td className="py-3 px-4 font-mono text-xs">GET, POST</td>
                  <td className="py-3 px-4 text-xs">List available memory products, purchase, and manage listings</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-medium text-white">Sentinel</td>
                  <td className="py-3 px-4 font-mono text-xs text-violet-300">/api/sentinel</td>
                  <td className="py-3 px-4 font-mono text-xs">GET</td>
                  <td className="py-3 px-4 text-xs">View detected security events, alerts, and violation history</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-medium text-white">User Profile</td>
                  <td className="py-3 px-4 font-mono text-xs text-violet-300">/api/users</td>
                  <td className="py-3 px-4 font-mono text-xs">GET, PUT</td>
                  <td className="py-3 px-4 text-xs">View and update user profile, preferences, and account settings</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-medium text-white">Export</td>
                  <td className="py-3 px-4 font-mono text-xs text-violet-300">/api/export</td>
                  <td className="py-3 px-4 font-mono text-xs">POST</td>
                  <td className="py-3 px-4 text-xs">Export all user data in JSON/CSV format for portability</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Middleware Pipeline */}
          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Middleware Pipeline</h3>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <p className="text-slate-300 leading-relaxed mb-4">
              Every API request passes through a <strong className="text-white">layered middleware pipeline</strong> that handles cross-cutting concerns before reaching the route handler:
            </p>
            <div className="space-y-3">
              {[
                { step: "1", name: "CORS Handling", desc: "Configures Cross-Origin Resource Sharing headers for browser-based clients" },
                { step: "2", name: "JSON Parsing", desc: "Parses request bodies with size limits (typically 10MB max)" },
                { step: "3", name: "Rate Limiting", desc: "Tracks request counts per IP/user with sliding window counters" },
                { step: "4", name: "Helmet Security Headers", desc: "Sets security headers: X-Content-Type-Options, X-Frame-Options, etc." },
                { step: "5", name: "Authentication", desc: "Validates JWT tokens, attaches user to request object (skipped for /auth routes)" },
                { step: "6", name: "Request Validation", desc: "Validates request body/query/params against Zod schemas" },
                { step: "7", name: "Route Handler", desc: "Executes business logic via service layer, returns response" },
                { step: "8", name: "Error Handler", desc: "Catches and formats errors, logs to Sentry, returns standardized error responses" },
              ].map((item) => (
                <div key={item.step} className="flex items-start gap-4 p-3 rounded-lg bg-white/5 border border-white/5">
                  <div className="px-3 py-1 rounded bg-rose-500/20 text-rose-300 text-xs font-mono font-bold flex-shrink-0">
                    {item.step}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white mb-1">{item.name}</div>
                    <div className="text-xs text-slate-400">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Response Format */}
          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Standard Response Format</h3>
          <div className="p-6 rounded-xl bg-slate-900/50 border border-white/10">
            <p className="text-slate-300 leading-relaxed mb-4">
              All API responses follow a <strong className="text-white">consistent JSON structure</strong>:
            </p>
            <pre className="text-xs text-slate-300 overflow-x-auto bg-slate-950/50 p-4 rounded-lg border border-white/5">
{`// Success response
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-04-07T12:00:00.000Z",
    "requestId": "req_abc123"
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": [
      { "field": "content", "issue": "Required" }
    ]
  },
  "meta": {
    "timestamp": "2025-04-07T12:00:00.000Z",
    "requestId": "req_abc123"
  }
}

// Paginated list response
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}`}
            </pre>
          </div>
        </div>
      </section>

      {/* Real-Time Communication */}
      <section className="mb-12" aria-labelledby="socket-heading">
        <h2 id="socket-heading" className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-blue-400" />
          </span>
          Real-Time Communication with Socket.io
        </h2>
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            VIVIM uses <strong className="text-white">Socket.io</strong> for bidirectional real-time communication between the frontend and backend, enabling features that require instant updates without HTTP polling. Socket.io provides automatic reconnection, fallback transports, and room-based event broadcasting.
          </p>

          {/* Socket Events */}
          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Socket.io Event Structure</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Event</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Direction</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Payload</th>
                  <th className="text-left py-3 px-4 text-slate-300 font-semibold">Description</th>
                </tr>
              </thead>
              <tbody className="text-slate-300">
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono text-violet-300">chat:message</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs">Server → Client</span></td>
                  <td className="py-3 px-4 font-mono text-xs">`message, conversationId`</td>
                  <td className="py-3 px-4 text-xs">Streams AI response tokens in real-time during generation</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono text-violet-300">chat:send</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-xs">Client → Server</span></td>
                  <td className="py-3 px-4 font-mono text-xs">`content, conversationId, provider`</td>
                  <td className="py-3 px-4 text-xs">Sends user message to initiate AI response streaming</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono text-violet-300">typing:start</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs">Server → Client</span></td>
                  <td className="py-3 px-4 font-mono text-xs">{conversationId}</td>
                  <td className="py-3 px-4 text-xs">Indicates AI is currently generating a response</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono text-violet-300">typing:stop</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs">Server → Client</span></td>
                  <td className="py-3 px-4 font-mono text-xs">{conversationId}</td>
                  <td className="py-3 px-4 text-xs">Indicates AI has finished generating a response</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono text-violet-300">memory:new</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs">Server → Client</span></td>
                  <td className="py-3 px-4 font-mono text-xs">{memory, type, rightsTier}</td>
                  <td className="py-3 px-4 text-xs">Notifies client when a new memory is extracted from conversation</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono text-violet-300">connection:status</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-xs">Bidirectional</span></td>
                  <td className="py-3 px-4 font-mono text-xs">`status: connected | disconnected`</td>
                  <td className="py-3 px-4 text-xs">Tracks WebSocket connection state for UI feedback</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-4 font-mono text-violet-300">sentinel:alert</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-xs">Server → Client</span></td>
                  <td className="py-3 px-4 font-mono text-xs">{type, severity, message}</td>
                  <td className="py-3 px-4 text-xs">Real-time notification when sentinel detects a policy violation</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Connection Flow */}
          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Connection Lifecycle</h3>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <ol className="space-y-3 text-slate-300 list-decimal list-inside">
              <li className="leading-relaxed"><strong className="text-white">Client connects:</strong> Frontend establishes Socket.io connection to backend, passing JWT token in auth payload for server-side verification</li>
              <li className="leading-relaxed"><strong className="text-white">Server authenticates:</strong> Backend validates the token, extracts user identity, and joins the client to their personal room (user:{userId})</li>
              <li className="leading-relaxed"><strong className="text-white">Conversation joins:</strong> When user opens a chat, client emits &apos;conversation:join&apos; with the conversation ID, server adds connection to that room</li>
              <li className="leading-relaxed"><strong className="text-white">Real-time streaming:</strong> AI provider responses are streamed token-by-token via &apos;chat:message&apos; events, updating the UI in real-time</li>
              <li className="leading-relaxed"><strong className="text-white">Memory extraction:</strong> After conversation ends, backend extracts ACUs, creates memories, and pushes &apos;memory:new&apos; events to update the UI</li>
              <li className="leading-relaxed"><strong className="text-white">Graceful disconnect:</strong> On page unload or network loss, Socket.io attempts automatic reconnection with exponential backoff</li>
            </ol>
          </div>
        </div>
      </section>

      {/* Deployment Configuration */}
      <section className="mb-12" aria-labelledby="deployment-heading">
        <h2 id="deployment-heading" className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
            <Globe className="w-5 h-5 text-green-400" />
          </span>
          Deployment Configuration
        </h2>
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            VIVIM is designed for deployment on <strong className="text-white">Vercel</strong> for the frontend and a <strong className="text-white">containerized backend</strong> (Docker) on any cloud provider. The deployment architecture supports horizontal scaling, zero-downtime deployments, and environment-specific configurations.
          </p>

          {/* Frontend Deployment */}
          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Frontend Deployment (Vercel)</h3>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <p className="text-slate-300 leading-relaxed mb-4">
              The Next.js 15 frontend deploys to <strong className="text-white">Vercel&apos;s Edge Network</strong> with automatic optimizations:
            </p>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span><strong className="text-white">Server-Side Rendering (SSR):</strong> Dynamic pages rendered on-demand at the edge for optimal performance and SEO</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span><strong className="text-white">Static Site Generation (SSG):</strong> Documentation and marketing pages pre-built at deploy time for instant loading</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span><strong className="text-white">Incremental Static Regeneration (ISR):</strong> Stale pages regenerated in the background without cache invalidation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span><strong className="text-white">Edge Middleware:</strong> Locale detection, geolocation headers, and authentication checks running at the edge</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-400 mt-1">•</span>
                <span><strong className="text-white">Automatic Image Optimization:</strong> Next.js Image component with WebP/AVIF conversion and responsive sizing</span>
              </li>
            </ul>
          </div>

          {/* Backend Deployment */}
          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Backend Deployment</h3>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <p className="text-slate-300 leading-relaxed mb-4">
              The Express.js backend deploys as a <strong className="text-white">containerized service</strong> with the following configuration:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                <h4 className="text-sm font-semibold text-white mb-2">Container Runtime</h4>
                <p className="text-xs text-slate-400">Multi-stage Dockerfile: build stage with full toolchain, production stage with Bun runtime only. Image size optimized for minimal attack surface.</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                <h4 className="text-sm font-semibold text-white mb-2">Process Manager</h4>
                <p className="text-xs text-slate-400">Orchestrated by Kubernetes, Docker Compose, or cloud container service. Health checks via /health endpoint, graceful shutdown on SIGTERM.</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                <h4 className="text-sm font-semibold text-white mb-2">Horizontal Scaling</h4>
                <p className="text-xs text-slate-400">Stateless API servers allow horizontal scaling behind a load balancer. Socket.io uses Redis adapter for cross-instance event broadcasting.</p>
              </div>
              <div className="p-4 rounded-lg bg-white/5 border border-white/5">
                <h4 className="text-sm font-semibold text-white mb-2">Zero-Downtime Deploys</h4>
                <p className="text-xs text-slate-400">Blue-green or rolling deployment strategy ensures no request is dropped during deployment. Health gate validates new instances before traffic shift.</p>
              </div>
            </div>
          </div>

          {/* Environment Variables */}
          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Environment Variables</h3>
          <div className="p-6 rounded-xl bg-slate-900/50 border border-white/10">
            <p className="text-slate-300 leading-relaxed mb-4">
              VIVIM requires the following environment variables across its services:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Variable</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Service</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Required</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {[
                    ["DATABASE_URL", "Backend", "Yes", "PostgreSQL connection string with pgvector extension"],
                    ["JWT_SECRET", "Backend + Shared", "Yes", "Secret key for JWT token signing (min 32 chars)"],
                    ["OPENAI_API_KEY", "Backend", "Conditional", "OpenAI API key for embeddings and chat"],
                    ["ANTHROPIC_API_KEY", "Backend", "Conditional", "Anthropic API key for Claude models"],
                    ["GOOGLE_API_KEY", "Backend", "Conditional", "Google AI API key for Gemini models"],
                    ["XAI_API_KEY", "Backend", "Conditional", "xAI API key for Grok models"],
                    ["REDIS_URL", "Backend", "Optional", "Redis connection string for caching and Socket.io adapter"],
                    ["SENTRY_DSN", "Backend", "Optional", "Sentry DSN for error tracking and monitoring"],
                    ["FRONTEND_URL", "Backend", "Yes", "Public frontend URL for CORS and redirect URIs"],
                    ["BACKEND_URL", "Frontend", "Yes", "Backend API base URL for client-side requests"],
                    ["NEXT_PUBLIC_APP_URL", "Frontend", "Yes", "Application URL for metadata and canonical URLs"],
                    ["NODE_ENV", "Both", "Yes", "Environment: development, staging, or production"],
                    ["RATE_LIMIT_MAX", "Backend", "No", "Max requests per window for rate limiting (default: 100)"],
                    ["RATE_LIMIT_WINDOW_MS", "Backend", "No", "Rate limit window in milliseconds (default: 900000)"],
                  ].map(([name, service, required, desc]) => (
                    <tr key={name} className="border-b border-white/5">
                      <td className="py-3 px-4 font-mono text-xs text-violet-300">{name}</td>
                      <td className="py-3 px-4 text-xs">{service}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded text-xs ${
                          required === "Yes"
                            ? "bg-red-500/20 text-red-300"
                            : required === "Optional"
                            ? "bg-yellow-500/20 text-yellow-300"
                            : "bg-slate-500/20 text-slate-300"
                        }`}>
                          {required}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Security Architecture */}
      <section className="mb-12" aria-labelledby="security-heading">
        <h2 id="security-heading" className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <span className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-400" />
          </span>
          Security Architecture
        </h2>
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            Security is woven throughout every layer of VIVIM&apos;s architecture. The platform implements a <strong className="text-white">defense-in-depth strategy</strong> with multiple overlapping security controls to protect user data, prevent unauthorized access, and maintain system integrity.
          </p>

          {/* Security Layers */}
          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Security Layers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                title: "Authentication & Authorization",
                items: [
                  "JWT-based authentication with short-lived access tokens (15min) and refresh tokens (7 days)",
                  "bcrypt password hashing with configurable work factor (minimum cost factor 12)",
                  "Role-based access control (RBAC) with user, admin, and system roles",
                  "Token blacklisting on logout and password change",
                ],
                color: "violet",
              },
              {
                title: "Data Isolation",
                items: [
                  "Strict tenant isolation: every query scoped to authenticated user ID",
                  "Row-level security policies in PostgreSQL for defense-in-depth",
                  "No cross-user queries except through explicit SharedMemory relations",
                  "Rights tier enforcement (T0-T5) at both API and database query level",
                ],
                color: "cyan",
              },
              {
                title: "API Security",
                items: [
                  "Helmet security headers: X-Content-Type-Options, X-Frame-Options, HSTS, CSP",
                  "Rate limiting with sliding window counters (IP-based and user-based)",
                  "Input validation with Zod schemas on every endpoint",
                  "SQL injection prevention via Prisma parameterized queries",
                  "XSS prevention via React auto-escaping and Content-Security-Policy",
                ],
                color: "emerald",
              },
              {
                title: "Monitoring & Detection",
                items: [
                  "Sentinel detection system with 13 algorithms for policy violation detection",
                  "Sentry error tracking with PII scrubbing and user context",
                  "Structured JSON logging with request correlation IDs",
                  "Audit trail for all data access and modification events",
                ],
                color: "amber",
              },
            ].map((layer) => (
              <div key={layer.title} className="p-6 rounded-xl bg-white/5 border border-white/10">
                <h4 className="text-lg font-semibold text-white mb-4">{layer.title}</h4>
                <ul className="space-y-2">
                  {layer.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className={`text-${layer.color}-400 mt-0.5 flex-shrink-0`}>•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Data Flow */}
          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Data Flow Architecture</h3>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <p className="text-slate-300 leading-relaxed mb-4">
              Understanding how data flows through VIVIM&apos;s architecture is essential for building integrations and debugging issues. The following table describes the complete lifecycle of a user message:
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Step</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Component</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Action</th>
                    <th className="text-left py-3 px-4 text-slate-300 font-semibold">Data Transform</th>
                  </tr>
                </thead>
                <tbody className="text-slate-300">
                  {[
                    ["1", "User (Frontend)", "Types message in chat UI", "Raw text input"],
                    ["2", "Socket.io Client", "Emits 'chat:send' event", "JSON payload: {content, conversationId}"],
                    ["3", "Express Route Handler", "Validates request, extracts ACU", "Zod validation, ACU decomposition"],
                    ["4", "Context Engine", "Assembles 8-layer context", "Queries 9 memory types, merges layers"],
                    ["5", "pgvector", "Semantic similarity search", "Vector embedding comparison, top-K retrieval"],
                    ["6", "AI Provider SDK", "Sends assembled prompt to AI", "Full system prompt + context + user message"],
                    ["7", "Socket.io Server", "Streams response tokens", "Token-by-token SSE/WebSocket events"],
                    ["8", "Frontend UI", "Renders streaming tokens", "React state updates, markdown rendering"],
                    ["9", "Memory Extractor", "Processes completed conversation", "Extracts memories, generates embeddings"],
                    ["10", "PostgreSQL", "Persists memories and ACUs", "ACID transaction, vector storage"],
                    ["11", "Sentinel System", "Scans for policy violations", "13 detection algorithms, event logging"],
                  ].map(([step, component, action, transform]) => (
                    <tr key={step} className="border-b border-white/5">
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 text-xs font-mono font-bold">
                          {step}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-white text-xs">{component}</td>
                      <td className="py-3 px-4 text-xs">{action}</td>
                      <td className="py-3 px-4 font-mono text-xs text-slate-400">{transform}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
              description: "Explore the 9 types of memory VIVIM manages: Episodic, Semantic, Procedural, Factual, Preference, Identity, Relationship, Goal, and Project.",
              icon: Database,
              color: "from-amber-500/10 to-orange-500/10 border-amber-500/20",
            },
            {
              href: "/docs/context-engine",
              title: "8-Layer Context Engine",
              description: "Learn how VIVIM assembles context dynamically through 8 layers from L0 Identity Core to L7 User Message with token budgets.",
              icon: Layers,
              color: "from-rose-500/10 to-pink-500/10 border-rose-500/20",
            },
            {
              href: "/docs/api-reference",
              title: "API Reference",
              description: "Complete REST API documentation with endpoints for memory management, chat, context assembly, authentication, and marketplace.",
              icon: Code2,
              color: "from-sky-500/10 to-cyan-500/10 border-sky-500/20",
            },
            {
              href: "/docs/privacy-security",
              title: "Privacy & Security",
              description: "Comprehensive overview of VIVIM&apos;s zero-knowledge architecture, encryption, data isolation, and sentinel detection system.",
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
