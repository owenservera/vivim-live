import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Code2, Database, MessageSquare, Key, ShoppingCart, Users, Shield } from "lucide-react";

const CANONICAL_URL = "https://vivim.live/docs/api-reference";

export const metadata: Metadata = {
  title: "API Reference — VIVIM Developer Documentation",
  description:
    "Complete REST API reference for the VIVIM Sovereign AI Memory platform. Covers Memory CRUD, Chat & Conversations, Context Assembly, User Management, Marketplace, Authentication, and Rate Limiting endpoints.",
  keywords: [
    "VIVIM API",
    "REST API",
    "AI memory API",
    "episodic memory",
    "semantic memory",
    "chat API",
    "vector database",
    "pgvector",
    "AI agent API",
  ],
  alternates: {
    canonical: CANONICAL_URL,
  },
  openGraph: {
    title: "API Reference — VIVIM Developer Documentation",
    description:
      "Complete REST API reference for the VIVIM Sovereign AI Memory platform.",
    url: CANONICAL_URL,
    siteName: "VIVIM",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "API Reference — VIVIM Developer Documentation",
    description:
      "Complete REST API reference for the VIVIM Sovereign AI Memory platform.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const BASE_DEV = "http://localhost:3001/api/v1";
const BASE_PROD = "https://api.vivim.live/api/v1";

/* ------------------------------------------------------------------ */
/*  Inline sub-components                                              */
/* ------------------------------------------------------------------ */

function Breadcrumb() {
  return (
    <nav className="mb-8 text-sm text-slate-400" aria-label="Breadcrumb">
      <ol className="flex items-center gap-2 flex-wrap">
        <li><Link href="/docs" className="hover:text-violet-400 transition-colors">Docs</Link></li>
        <li aria-hidden="true">/</li>
        <li className="text-slate-200 font-medium">API Reference</li>
      </ol>
    </nav>
  );
}

function Badge({ children, color = "violet" }: { children: React.ReactNode; color?: "violet" | "cyan" | "green" | "red" | "amber" | "blue" }) {
  const cls: Record<string, string> = {
    violet: "bg-violet-500/10 text-violet-300 ring-violet-500/20",
    cyan: "bg-cyan-500/10 text-cyan-300 ring-cyan-500/20",
    green: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20",
    red: "bg-red-500/10 text-red-300 ring-red-500/20",
    amber: "bg-amber-500/10 text-amber-300 ring-amber-500/20",
    blue: "bg-blue-500/10 text-blue-300 ring-blue-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-mono font-medium rounded-md ring-1 ring-inset ${cls[color] || cls.violet}`}>
      {children}
    </span>
  );
}

function CodeBlock({ title, children }: { title?: string; children: string }) {
  return (
    <figure className="my-6 rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden">
      {title && (
        <figcaption className="flex items-center gap-2 px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-800">
          <Code2 className="w-3.5 h-3.5" />
          {title}
        </figcaption>
      )}
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-slate-300 font-mono">
        <code>{children}</code>
      </pre>
    </figure>
  );
}

function EndpointRow({ method, path, description }: { method: string; path: string; description: string }) {
  const colorMap: Record<string, string> = {
    GET: "green",
    POST: "cyan",
    PUT: "amber",
    PATCH: "amber",
    DELETE: "red",
  } as const;
  const c = (colorMap[method] || "violet") as "violet" | "cyan" | "green" | "red" | "amber" | "blue";
  return (
    <tr className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors">
      <td className="py-3 px-4 font-mono text-xs whitespace-nowrap"><Badge color={c}>{method}</Badge></td>
      <td className="py-3 px-4 font-mono text-sm text-slate-200 whitespace-nowrap">{path}</td>
      <td className="py-3 px-4 text-sm text-slate-400">{description}</td>
    </tr>
  );
}

function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-8">
      {children}
    </div>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 mb-16">
      <h2 className="text-2xl md:text-3xl font-bold text-slate-100 mb-6 pb-3 border-b border-slate-800">{title}</h2>
      <div className="prose prose-invert prose-slate max-w-none prose-headings:text-slate-100 prose-a:text-violet-400 prose-strong:text-slate-200 prose-code:text-cyan-300 prose-pre:bg-slate-900/80 prose-pre:border prose-pre:border-slate-800">
        {children}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function ApiReferencePage() {
  const navSections = [
    { id: "overview", label: "Overview", icon: Code2 },
    { id: "authentication", label: "Authentication", icon: Key },
    { id: "memory", label: "Memory", icon: Database },
    { id: "chat", label: "Chat", icon: MessageSquare },
    { id: "context", label: "Context Assembly", icon: Shield },
    { id: "users", label: "Users & Profile", icon: Users },
    { id: "marketplace", label: "Marketplace", icon: ShoppingCart },
    { id: "responses", label: "Response Formats", icon: Code2 },
    { id: "rate-limiting", label: "Rate Limiting", icon: Shield },
    { id: "errors", label: "Error Codes", icon: Shield },
  ];

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-950/30 via-slate-950 to-cyan-950/20" />
        <div className="relative max-w-5xl mx-auto px-6 py-16 md:py-24">
          <p className="text-sm font-mono text-violet-400 mb-3 tracking-wide uppercase">Developer Documentation</p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            API Reference
          </h1>
          <p className="text-lg md:text-xl text-slate-400 max-w-2xl leading-relaxed">
            A complete reference for every endpoint in the VIVIM Sovereign AI Memory platform.
            All endpoints return JSON, support versioned access via <code className="px-1.5 py-0.5 bg-slate-800 rounded text-cyan-300 text-sm font-mono">/api/v1</code>,
            and are backed by PostgreSQL with pgvector for semantic search.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12">
        <Breadcrumb />

        {/* Quick-nav card grid */}
        <h2 className="text-xl font-semibold text-slate-100 mb-4">Jump to Section</h2>
        <CardGrid>
          {navSections.map(({ id, label, icon: Icon }) => (
            <a
              key={id}
              href={`#${id}`}
              className="group flex items-center gap-3 p-4 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/50 hover:border-violet-500/40 transition-all duration-200"
            >
              <Icon className="w-5 h-5 text-violet-400 group-hover:text-violet-300 shrink-0" />
              <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">{label}</span>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 ml-auto transition-colors" />
            </a>
          ))}
        </CardGrid>

        {/* ================================================================ */}
        {/*  1. Overview                                                     */}
        {/* ================================================================ */}
        <Section id="overview" title="1. API Overview">
          <p>
            The VIVIM API is a RESTful interface built on Express.js 5 and backed by PostgreSQL
            with <code>pgvector</code> extensions. It provides programmatic access to all platform
            capabilities including memory management, conversational AI, context assembly,
            user administration, and the VIVIM marketplace.
          </p>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">Base URLs</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose mb-6">
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
              <p className="text-xs font-mono text-slate-500 mb-1">Development</p>
              <code className="text-sm font-mono text-cyan-300">{BASE_DEV}</code>
            </div>
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50">
              <p className="text-xs font-mono text-slate-500 mb-1">Production</p>
              <code className="text-sm font-mono text-cyan-300">{BASE_PROD}</code>
            </div>
          </div>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">Versioning</h3>
          <p>
            All endpoints are prefixed with <code>/api/v1</code>. When breaking changes are
            introduced, the version segment will increment (e.g., <code>/api/v2</code>).
            The current version is stable and production-ready.
          </p>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">Content Type</h3>
          <p>
            All request and response bodies use <code>application/json</code>. Always set the
            <code>Content-Type: application/json</code> header on POST, PUT, and PATCH requests.
          </p>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">Memory Types</h3>
          <p>VIVIM organizes memories into nine distinct types, each optimized for different use cases:</p>

          <div className="not-prose my-6 rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 text-slate-400">
                <tr>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wider">Type</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider">Description</th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wider">Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {[
                  ["episodic", "Time-stamped personal experiences and events", "I visited Tokyo in March 2024"],
                  ["semantic", "General knowledge and facts about the world", "Photosynthesis converts light to energy"],
                  ["procedural", "How-to knowledge and skill-based memories", "How to make sourdough bread"],
                  ["factual", "Concrete data points and verified information", "The capital of France is Paris"],
                  ["preference", "Likes, dislikes, and personal tastes", "Prefers black coffee over tea"],
                  ["identity", "Core self-concept and personality traits", "I identify as a creative person"],
                  ["relationship", "Interpersonal connections and social bonds", "Sarah is my mentor and friend"],
                  ["goal", "Aspirations, targets, and future intentions", "I want to learn Rust by June"],
                  ["project", "Work-related and collaborative endeavors", "Building the VIVIM platform"],
                ].map(([type, desc, ex]) => (
                  <tr key={type} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 px-4 font-mono text-violet-300">{type}</td>
                    <td className="py-2.5 px-4 text-slate-300">{desc}</td>
                    <td className="py-2.5 px-4 text-slate-500 italic text-xs">"{ex}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center gap-2 mt-6">
            <Link href="/docs/architecture" className="text-sm text-violet-400 hover:text-violet-300 inline-flex items-center gap-1 transition-colors">
              Learn about VIVIM architecture <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Section>

        {/* ================================================================ */}
        {/*  2. Authentication                                               */}
        {/* ================================================================ */}
        <Section id="authentication" title="2. Authentication">
          <p>
            VIVIM supports two authentication methods: <strong>JWT Bearer tokens</strong> for
            user sessions and <strong>API keys</strong> for server-to-server communication.
            Every authenticated endpoint requires one of these methods.
          </p>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">JWT Bearer Token</h3>
          <p>
            Obtain a JWT by authenticating via <code>POST /api/v1/auth/login</code> with your
            email and password. Include the token in the <code>Authorization</code> header:
          </p>
          <CodeBlock title="Authorization Header">
{`Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}
          </CodeBlock>

          <p>
            JWT tokens expire after <strong>15 minutes</strong> (access token) and can be
            refreshed using a refresh token valid for <strong>7 days</strong>. Use the
            <code>POST /api/v1/auth/refresh</code> endpoint to obtain a new access token.
          </p>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">API Keys</h3>
          <p>
            Generate API keys from the VIVIM dashboard under Settings {"→"} API Keys. API keys
            do not expire and are intended for server-side integrations. Include them using the
            <code>X-API-Key</code> header:
          </p>
          <CodeBlock title="API Key Header">
{`X-API-Key: vivim_sk_live_abc123def456...`}
          </CodeBlock>

          <div className="my-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 not-prose">
            <p className="text-sm text-amber-300">
              <strong className="text-amber-200">Security Note:</strong> Never expose API keys
              in client-side code or public repositories. Use environment variables and rotate
              keys immediately if compromised.
            </p>
          </div>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">Token Refresh Flow</h3>
          <CodeBlock title="Refresh Token Request">
{`POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "rt_abc123..."
}

// Response
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "rt_def456...",
  "expiresIn": 900
}`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">Scopes &amp; Permissions</h3>
          <p>
            API keys can be scoped to specific permissions. Available scopes include:
            <code>memory:read</code>, <code>memory:write</code>, <code>memory:delete</code>,
            <code>chat:read</code>, <code>chat:write</code>, <code>context:read</code>,
            <code>user:read</code>, <code>user:write</code>, and <code>marketplace:read</code>.
          </p>

          <div className="flex items-center gap-2 mt-6">
            <Link href="/docs/getting-started" className="text-sm text-violet-400 hover:text-violet-300 inline-flex items-center gap-1 transition-colors">
              Getting started guide <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </Section>

        {/* ================================================================ */}
        {/*  3. Memory Endpoints                                             */}
        {/* ================================================================ */}
        <Section id="memory" title="3. Memory Endpoints">
          <p>
            The Memory API provides full CRUD operations for all nine memory types. Memories are
            stored in PostgreSQL with vector embeddings (via <code>pgvector</code>) enabling
            semantic similarity search across all memory content.
          </p>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">All Memory Endpoints</h3>
          <div className="not-prose my-6 rounded-xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 text-slate-400">
                <tr>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wider">Method</th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wider">Endpoint</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody>
                <EndpointRow method="GET" path="/memories" description="List all memories (paginated, filterable)" />
                <EndpointRow method="POST" path="/memories" description="Create a new memory" />
                <EndpointRow method="GET" path="/memories/:id" description="Retrieve a specific memory" />
                <EndpointRow method="PUT" path="/memories/:id" description="Update an existing memory" />
                <EndpointRow method="PATCH" path="/memories/:id" description="Partially update a memory" />
                <EndpointRow method="DELETE" path="/memories/:id" description="Delete a memory" />
                <EndpointRow method="POST" path="/memories/search" description="Semantic search across all memories" />
                <EndpointRow method="GET" path="/memories/:id/similar" description="Find semantically similar memories" />
                <EndpointRow method="POST" path="/memories/bulk" description="Bulk create memories (up to 100)" />
                <EndpointRow method="DELETE" path="/memories" description="Bulk delete memories by filter" />
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">Create a Memory</h3>
          <CodeBlock title="POST /api/v1/memories">
{`{
  "type": "episodic",
  "content": "I attended the VIVIM launch event in San Francisco and met several AI researchers.",
  "metadata": {
    "timestamp": "2025-04-15T14:30:00Z",
    "location": "San Francisco, CA",
    "tags": ["event", "networking", "AI research"],
    "source": "manual",
    "confidence": 0.95
  }
}

// 201 Created Response
{
  "success": true,
  "data": {
    "id": "mem_9f8e7d6c5b4a",
    "type": "episodic",
    "content": "I attended the VIVIM launch event...",
    "metadata": {
      "timestamp": "2025-04-15T14:30:00Z",
      "location": "San Francisco, CA",
      "tags": ["event", "networking", "AI research"],
      "source": "manual",
      "confidence": 0.95
    },
    "embedding": "[128-dimensional vector, stored internally]",
    "createdAt": "2025-04-15T14:30:05Z",
    "updatedAt": "2025-04-15T14:30:05Z"
  }
}`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">Semantic Search</h3>
          <p>
            Search memories by semantic similarity using natural language queries. The API uses
            cosine similarity over the <code>pgvector</code> embeddings to return the most
            relevant results.
          </p>
          <CodeBlock title="POST /api/v1/memories/search">
{`{
  "query": "What conferences did I attend this year?",
  "filters": {
    "type": "episodic",
    "dateRange": {
      "from": "2025-01-01T00:00:00Z",
      "to": "2025-12-31T23:59:59Z"
    },
    "tags": ["event", "conference"]
  },
  "limit": 10,
  "threshold": 0.7
}

// Response
{
  "success": true,
  "data": {
    "results": [
      {
        "id": "mem_9f8e7d6c5b4a",
        "content": "I attended the VIVIM launch event...",
        "type": "episodic",
        "similarity": 0.92,
        "metadata": { ... }
      }
    ],
    "total": 3,
    "query": "What conferences did I attend this year?"
  }
}`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">Query Parameters for GET /memories</h3>
          <div className="not-prose my-6 rounded-xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 text-slate-400">
                <tr>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase">Parameter</th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase">Type</th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase">Default</th>
                  <th className="text-left py-3 px-4 text-xs uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-cyan-300">page</td>
                  <td className="py-2 px-4 text-slate-300">integer</td>
                  <td className="py-2 px-4 text-slate-400">1</td>
                  <td className="py-2 px-4 text-slate-400">Page number for pagination</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-cyan-300">limit</td>
                  <td className="py-2 px-4 text-slate-300">integer</td>
                  <td className="py-2 px-4 text-slate-400">25</td>
                  <td className="py-2 px-4 text-slate-400">Results per page (max 100)</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-cyan-300">type</td>
                  <td className="py-2 px-4 text-slate-300">string</td>
                  <td className="py-2 px-4 text-slate-400">—</td>
                  <td className="py-2 px-4 text-slate-400">Filter by memory type</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-cyan-300">sort</td>
                  <td className="py-2 px-4 text-slate-300">string</td>
                  <td className="py-2 px-4 text-slate-400">createdAt:desc</td>
                  <td className="py-2 px-4 text-slate-400">Sort field and direction</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-cyan-300">search</td>
                  <td className="py-2 px-4 text-slate-300">string</td>
                  <td className="py-2 px-4 text-slate-400">—</td>
                  <td className="py-2 px-4 text-slate-400">Full-text search query</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-cyan-300">tags</td>
                  <td className="py-2 px-4 text-slate-300">string[]</td>
                  <td className="py-2 px-4 text-slate-400">—</td>
                  <td className="py-2 px-4 text-slate-400">Comma-separated tags to filter</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">Find Similar Memories</h3>
          <p>
            Retrieve memories semantically similar to a given memory using vector distance calculations.
            This endpoint uses the stored embedding of the source memory to compute cosine similarity
            against all other memories.
          </p>
          <CodeBlock title="GET /api/v1/memories/:id/similar">
{`GET /api/v1/memories/mem_9f8e7d6c5b4a/similar?limit=5&threshold=0.6

// Response
{
  "success": true,
  "data": {
    "sourceMemory": "mem_9f8e7d6c5b4a",
    "results": [
      {
        "id": "mem_1a2b3c4d5e6f",
        "content": "I met AI researchers at a tech meetup...",
        "similarity": 0.87,
        "type": "episodic"
      },
      {
        "id": "mem_7g8h9i0j1k2l",
        "content": "Attended an AI research symposium...",
        "similarity": 0.81,
        "type": "episodic"
      }
    ],
    "total": 2
  }
}`}
          </CodeBlock>
        </Section>

        {/* ================================================================ */}
        {/*  4. Chat Endpoints                                               */}
        {/* ================================================================ */}
        <Section id="chat" title="4. Chat Endpoints">
          <p>
            The Chat API enables creating and managing conversations with VIVIM&apos;s AI agents.
            Each conversation maintains context through linked memories, enabling the AI to
            recall past interactions and relevant user information across sessions.
          </p>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">All Chat Endpoints</h3>
          <div className="not-prose my-6 rounded-xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 text-slate-400">
                <tr>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wider">Method</th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wider">Endpoint</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody>
                <EndpointRow method="GET" path="/chat/conversations" description="List all conversations" />
                <EndpointRow method="POST" path="/chat/conversations" description="Create a new conversation" />
                <EndpointRow method="GET" path="/chat/conversations/:id" description="Get conversation details" />
                <EndpointRow method="DELETE" path="/chat/conversations/:id" description="Delete a conversation" />
                <EndpointRow method="GET" path="/chat/conversations/:id/messages" description="Get messages in a conversation" />
                <EndpointRow method="POST" path="/chat/conversations/:id/messages" description="Send a message" />
                <EndpointRow method="POST" path="/chat/conversations/:id/messages/stream" description="Send a message (SSE streaming)" />
                <EndpointRow method="DELETE" path="/chat/conversations/:id/messages/:msgId" description="Delete a message" />
                <EndpointRow method="GET" path="/chat/conversations/:id/context" description="Get active context for conversation" />
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">Create a Conversation</h3>
          <CodeBlock title="POST /api/v1/chat/conversations">
{`{
  "title": "Project Planning Discussion",
  "agentId": "agent_default",
  "contextProfile": "default",
  "memoryTypes": ["episodic", "semantic", "project", "goal"]
}

// 201 Created
{
  "success": true,
  "data": {
    "id": "conv_a1b2c3d4e5f6",
    "title": "Project Planning Discussion",
    "agentId": "agent_default",
    "contextProfile": "default",
    "memoryTypes": ["episodic", "semantic", "project", "goal"],
    "createdAt": "2025-04-15T15:00:00Z",
    "updatedAt": "2025-04-15T15:00:00Z",
    "messageCount": 0
  }
}`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">Send a Message</h3>
          <CodeBlock title="POST /api/v1/chat/conversations/:id/messages">
{`{
  "role": "user",
  "content": "What progress have I made on the VIVIM platform this week?",
  "options": {
    "includeMemories": true,
    "memoryTypes": ["project", "goal", "episodic"],
    "maxContextMemories": 15,
    "temperature": 0.7,
    "maxTokens": 2048,
    "stream": false
  }
}

// Response
{
  "success": true,
  "data": {
    "message": {
      "id": "msg_x7y8z9a0b1c2",
      "role": "assistant",
      "content": "Based on your memory, this week you completed the memory search optimization...",
      "createdAt": "2025-04-15T15:05:00Z"
    },
    "context": {
      "memoriesUsed": 12,
      "memoryIds": ["mem_abc123", "mem_def456", ...],
      "contextProfile": "default"
    }
  }
}`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">Server-Sent Events (SSE) Streaming</h3>
          <p>
            For real-time token streaming, use the <code>/messages/stream</code> endpoint.
            It returns an SSE stream of tokens as the model generates its response, enabling
            progressive rendering in your UI.
          </p>
          <CodeBlock title="POST /api/v1/chat/conversations/:id/messages/stream">
{`POST /api/v1/chat/conversations/conv_a1b2c3d4e5f6/messages/stream
Content-Type: application/json

{
  "role": "user",
  "content": "Tell me about my goals."
}

// SSE Stream (text/event-stream)
event: token
data: {"token": "Based"}

event: token
data: {"token": " on"}

event: token
data: {"token": " your"}

event: done
data: {"messageId": "msg_x7y8z9a0b1c2", "memoriesUsed": 8}`}
          </CodeBlock>
        </Section>

        {/* ================================================================ */}
        {/*  5. Context Assembly                                             */}
        {/* ================================================================ */}
        <Section id="context" title="5. Context Assembly Endpoints">
          <p>
            Context Assembly is VIVIM&apos;s proprietary system for intelligently selecting and
            combining relevant memories to provide optimal AI context. It uses multi-strategy
            retrieval including semantic search, temporal recency, frequency analysis, and
            relationship-graph traversal.
          </p>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">All Context Endpoints</h3>
          <div className="not-prose my-6 rounded-xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 text-slate-400">
                <tr>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wider">Method</th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wider">Endpoint</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody>
                <EndpointRow method="POST" path="/context/assemble" description="Assemble context from query" />
                <EndpointRow method="POST" path="/context/profiles" description="Create a context profile" />
                <EndpointRow method="GET" path="/context/profiles" description="List all context profiles" />
                <EndpointRow method="PUT" path="/context/profiles/:id" description="Update a context profile" />
                <EndpointRow method="DELETE" path="/context/profiles/:id" description="Delete a context profile" />
                <EndpointRow method="GET" path="/context/profiles/:id" description="Get a specific context profile" />
                <EndpointRow method="POST" path="/context/explain" description="Explain why specific memories were selected" />
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">Assemble Context</h3>
          <p>
            The assembly endpoint orchestrates the full context retrieval pipeline, combining
            multiple retrieval strategies into a single ranked context window.
          </p>
          <CodeBlock title="POST /api/v1/context/assemble">
{`{
  "query": "What should I focus on this week for the platform launch?",
  "profile": "work",
  "strategies": ["semantic", "recency", "frequency", "relationship"],
  "weights": {
    "semantic": 0.5,
    "recency": 0.2,
    "frequency": 0.15,
    "relationship": 0.15
  },
  "maxMemories": 20,
  "memoryTypes": ["project", "goal", "episodic", "preference"]
}

// Response
{
  "success": true,
  "data": {
    "context": {
      "memories": [
        {
          "id": "mem_proj_launch_001",
          "content": "Platform launch target date: May 1, 2025",
          "type": "goal",
          "relevanceScore": 0.94,
          "strategies": ["semantic", "frequency"]
        }
      ],
      "totalMemories": 20,
      "contextSize": 4521,
      "profile": "work"
    },
    "metadata": {
      "assemblyTime": 142,
      "strategiesUsed": ["semantic", "recency", "frequency"],
      "vectorQueryTime": 38
    }
  }
}`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">Context Profiles</h3>
          <p>
            Context profiles are named configurations that define how memories are selected
            and weighted for different scenarios. Create separate profiles for work, personal,
            creative, or any domain-specific context needs.
          </p>
          <CodeBlock title="POST /api/v1/context/profiles">
{`{
  "name": "creative",
  "description": "Context for creative and ideation sessions",
  "defaultMemoryTypes": ["episodic", "semantic", "preference"],
  "defaultWeights": {
    "semantic": 0.4,
    "recency": 0.3,
    "frequency": 0.15,
    "relationship": 0.15
  },
  "maxMemories": 25,
  "filters": {
    "tags": ["creative", "ideas", "inspiration"]
  }
}`}
          </CodeBlock>
        </Section>

        {/* ================================================================ */}
        {/*  6. User & Profile                                               */}
        {/* ================================================================ */}
        <Section id="users" title="6. User &amp; Profile Endpoints">
          <p>
            Manage user accounts, profile information, preferences, and account settings
            through these endpoints.
          </p>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">All User Endpoints</h3>
          <div className="not-prose my-6 rounded-xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 text-slate-400">
                <tr>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wider">Method</th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wider">Endpoint</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody>
                <EndpointRow method="POST" path="/auth/register" description="Create a new user account" />
                <EndpointRow method="POST" path="/auth/login" description="Authenticate and receive JWT" />
                <EndpointRow method="POST" path="/auth/refresh" description="Refresh an access token" />
                <EndpointRow method="POST" path="/auth/logout" description="Invalidate tokens" />
                <EndpointRow method="GET" path="/users/me" description="Get current user profile" />
                <EndpointRow method="PUT" path="/users/me" description="Update user profile" />
                <EndpointRow method="GET" path="/users/me/stats" description="Get user memory and usage statistics" />
                <EndpointRow method="GET" path="/users/me/preferences" description="Get user preferences" />
                <EndpointRow method="PUT" path="/users/me/preferences" description="Update user preferences" />
                <EndpointRow method="GET" path="/users/me/api-keys" description="List API keys" />
                <EndpointRow method="POST" path="/users/me/api-keys" description="Create a new API key" />
                <EndpointRow method="DELETE" path="/users/me/api-keys/:keyId" description="Revoke an API key" />
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">User Profile Response</h3>
          <CodeBlock title="GET /api/v1/users/me">
{`{
  "success": true,
  "data": {
    "id": "usr_v1v2i3m4x5y6",
    "email": "developer@example.com",
    "displayName": "Alex Chen",
    "avatar": null,
    "plan": "pro",
    "createdAt": "2024-12-01T08:00:00Z",
    "lastLoginAt": "2025-04-15T14:22:00Z",
    "stats": {
      "totalMemories": 1247,
      "totalConversations": 38,
      "storageUsed": "2.4 MB"
    }
  }
}`}
          </CodeBlock>
        </Section>

        {/* ================================================================ */}
        {/*  7. Marketplace                                                  */}
        {/* ================================================================ */}
        <Section id="marketplace" title="7. Marketplace Endpoints">
          <p>
            The VIVIM Marketplace enables users to discover, purchase, and install AI agents,
            context profiles, memory templates, and integrations from the community.
          </p>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">All Marketplace Endpoints</h3>
          <div className="not-prose my-6 rounded-xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 text-slate-400">
                <tr>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wider">Method</th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase tracking-wider">Endpoint</th>
                  <th className="text-left py-3 px-4 text-xs uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody>
                <EndpointRow method="GET" path="/marketplace/items" description="Browse all marketplace items" />
                <EndpointRow method="GET" path="/marketplace/items/:id" description="Get item details" />
                <EndpointRow method="POST" path="/marketplace/items/:id/purchase" description="Purchase an item" />
                <EndpointRow method="GET" path="/marketplace/my-items" description="List purchased items" />
                <EndpointRow method="POST" path="/marketplace/items/:id/install" description="Install a purchased item" />
                <EndpointRow method="DELETE" path="/marketplace/installed/:id" description="Uninstall an item" />
                <EndpointRow method="GET" path="/marketplace/categories" description="List item categories" />
                <EndpointRow method="GET" path="/marketplace/items/:id/reviews" description="Get item reviews" />
                <EndpointRow method="POST" path="/marketplace/items/:id/reviews" description="Submit a review" />
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">Browse Marketplace</h3>
          <CodeBlock title="GET /api/v1/marketplace/items">
{`GET /api/v1/marketplace/items?category=agents&sort=popularity&limit=10

// Response
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "item_agent_researcher",
        "name": "Research Assistant Agent",
        "type": "agent",
        "category": "agents",
        "description": "A specialized agent for academic research and literature review",
        "author": "VIVIM Labs",
        "price": 0,
        "rating": 4.8,
        "installations": 2341,
        "tags": ["research", "academic", "literature"]
      }
    ],
    "total": 47,
    "page": 1,
    "hasMore": true
  }
}`}
          </CodeBlock>
        </Section>

        {/* ================================================================ */}
        {/*  8. Response Formats                                             */}
        {/* ================================================================ */}
        <Section id="responses" title="8. Response Formats">
          <p>
            All VIVIM API responses follow a consistent JSON envelope structure to make
            parsing predictable across all endpoints.
          </p>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">Standard Success Response</h3>
          <CodeBlock title="Response Envelope">
{`{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req_abc123",
    "timestamp": "2025-04-15T15:00:00Z"
  }
}`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">Paginated List Response</h3>
          <CodeBlock title="Pagination Envelope">
{`{
  "success": true,
  "data": {
    "items": [ ... ],
    "pagination": {
      "page": 1,
      "limit": 25,
      "total": 1247,
      "totalPages": 50,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "meta": {
    "requestId": "req_def456",
    "timestamp": "2025-04-15T15:00:00Z"
  }
}`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">HTTP Status Codes</h3>
          <div className="not-prose my-6 rounded-xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 text-slate-400">
                <tr>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase">Code</th>
                  <th className="text-left py-3 px-4 text-xs uppercase">Meaning</th>
                  <th className="text-left py-3 px-4 text-xs uppercase">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-emerald-300">200</td>
                  <td className="py-2 px-4 text-slate-300">OK</td>
                  <td className="py-2 px-4 text-slate-400">Successful GET, PUT, PATCH</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-emerald-300">201</td>
                  <td className="py-2 px-4 text-slate-300">Created</td>
                  <td className="py-2 px-4 text-slate-400">Successful POST resource creation</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-emerald-300">204</td>
                  <td className="py-2 px-4 text-slate-300">No Content</td>
                  <td className="py-2 px-4 text-slate-400">Successful DELETE</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-amber-300">400</td>
                  <td className="py-2 px-4 text-slate-300">Bad Request</td>
                  <td className="py-2 px-4 text-slate-400">Invalid input, missing required fields</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-amber-300">401</td>
                  <td className="py-2 px-4 text-slate-300">Unauthorized</td>
                  <td className="py-2 px-4 text-slate-400">Missing or invalid authentication</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-amber-300">403</td>
                  <td className="py-2 px-4 text-slate-300">Forbidden</td>
                  <td className="py-2 px-4 text-slate-400">Insufficient permissions for resource</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-red-300">404</td>
                  <td className="py-2 px-4 text-slate-300">Not Found</td>
                  <td className="py-2 px-4 text-slate-400">Resource does not exist</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-red-300">429</td>
                  <td className="py-2 px-4 text-slate-300">Too Many Requests</td>
                  <td className="py-2 px-4 text-slate-400">Rate limit exceeded</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-red-300">500</td>
                  <td className="py-2 px-4 text-slate-300">Internal Server Error</td>
                  <td className="py-2 px-4 text-slate-400">Unexpected server-side failure</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">Response Headers</h3>
          <div className="not-prose my-6 rounded-xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 text-slate-400">
                <tr>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase">Header</th>
                  <th className="text-left py-3 px-4 text-xs uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-cyan-300">X-Request-Id</td>
                  <td className="py-2 px-4 text-slate-400">Unique identifier for this request (for support)</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-cyan-300">X-RateLimit-Limit</td>
                  <td className="py-2 px-4 text-slate-400">Maximum requests allowed per window</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-cyan-300">X-RateLimit-Remaining</td>
                  <td className="py-2 px-4 text-slate-400">Remaining requests in current window</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-cyan-300">X-RateLimit-Reset</td>
                  <td className="py-2 px-4 text-slate-400">Unix timestamp when the rate limit resets</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* ================================================================ */}
        {/*  9. Rate Limiting                                                */}
        {/* ================================================================ */}
        <Section id="rate-limiting" title="9. Rate Limiting">
          <p>
            VIVIM implements a sliding-window rate limiter to ensure fair usage and platform
            stability. Limits vary by endpoint category and subscription tier. When a limit is
            reached, the API returns <code>429 Too Many Requests</code> with a
            <code>Retry-After</code> header indicating seconds to wait.
          </p>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">Rate Limits by Tier</h3>
          <div className="not-prose my-6 rounded-xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 text-slate-400">
                <tr>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase">Tier</th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase">Memory</th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase">Chat</th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase">Context</th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase">Burst</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-4 text-slate-300 font-medium">Free</td>
                  <td className="py-2.5 px-4 font-mono text-slate-400">60 / min</td>
                  <td className="py-2.5 px-4 font-mono text-slate-400">20 / min</td>
                  <td className="py-2.5 px-4 font-mono text-slate-400">30 / min</td>
                  <td className="py-2.5 px-4 font-mono text-slate-400">10 / sec</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-4 text-violet-300 font-medium">Pro</td>
                  <td className="py-2.5 px-4 font-mono text-slate-400">300 / min</td>
                  <td className="py-2.5 px-4 font-mono text-slate-400">100 / min</td>
                  <td className="py-2.5 px-4 font-mono text-slate-400">150 / min</td>
                  <td className="py-2.5 px-4 font-mono text-slate-400">30 / sec</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2.5 px-4 text-cyan-300 font-medium">Enterprise</td>
                  <td className="py-2.5 px-4 font-mono text-slate-400">1000 / min</td>
                  <td className="py-2.5 px-4 font-mono text-slate-400">500 / min</td>
                  <td className="py-2.5 px-4 font-mono text-slate-400">500 / min</td>
                  <td className="py-2.5 px-4 font-mono text-slate-400">100 / sec</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">Rate Limit Response</h3>
          <CodeBlock title="429 Too Many Requests">
{`HTTP/1.1 429 Too Many Requests
Retry-After: 30
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1713196800

{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Please retry after 30 seconds.",
    "retryAfter": 30
  }
}`}
          </CodeBlock>

          <div className="my-6 p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 not-prose">
            <p className="text-sm text-cyan-300">
              <strong className="text-cyan-200">Best Practice:</strong> Implement exponential
              backoff with jitter when handling 429 responses. Start with the
              <code>Retry-After</code> value and add random jitter (0-1s) to prevent thundering
              herd issues.
            </p>
          </div>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">Global Rate Limiter</h3>
          <p>
            VIVIM also enforces a global rate limit across all endpoints to protect the
            platform from abuse. This limit is calculated per-user over a 24-hour window.
            Exceeding the daily global limit results in a temporary 1-hour cooldown across
            all endpoints.
          </p>
        </Section>

        {/* ================================================================ */}
        {/*  10. Error Codes                                                 */}
        {/* ================================================================ */}
        <Section id="errors" title="10. Error Codes">
          <p>
            VIVIM uses conventional HTTP response codes to indicate the success or failure of
            API requests. Error responses include a machine-readable <code>code</code> field
            and a human-readable <code>message</code> field for debugging.
          </p>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">Error Response Format</h3>
          <CodeBlock title="Error Envelope">
{`{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "The 'type' field is required and must be one of: episodic, semantic, procedural, factual, preference, identity, relationship, goal, project",
    "details": {
      "field": "type",
      "value": null,
      "expected": ["episodic", "semantic", "procedural", "factual", "preference", "identity", "relationship", "goal", "project"]
    },
    "requestId": "req_abc123",
    "documentation": "https://vivim.live/docs/api-reference#memory"
  }
}`}
          </CodeBlock>

          <h3 className="text-lg font-semibold text-slate-100 mt-8 mb-3">Error Code Reference</h3>
          <div className="not-prose my-6 rounded-xl border border-slate-800 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-900/80 text-slate-400">
                <tr>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase">Error Code</th>
                  <th className="text-left py-3 px-4 font-mono text-xs uppercase">HTTP Status</th>
                  <th className="text-left py-3 px-4 text-xs uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-amber-300">INVALID_REQUEST</td>
                  <td className="py-2 px-4 font-mono text-slate-400">400</td>
                  <td className="py-2 px-4 text-slate-400">Request body is malformed or missing required fields</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-amber-300">VALIDATION_ERROR</td>
                  <td className="py-2 px-4 font-mono text-slate-400">400</td>
                  <td className="py-2 px-4 text-slate-400">Input validation failed; see details for specific field errors</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-red-300">UNAUTHORIZED</td>
                  <td className="py-2 px-4 font-mono text-slate-400">401</td>
                  <td className="py-2 px-4 text-slate-400">Authentication token is missing, expired, or invalid</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-red-300">TOKEN_EXPIRED</td>
                  <td className="py-2 px-4 font-mono text-slate-400">401</td>
                  <td className="py-2 px-4 text-slate-400">JWT access token has expired; use refresh token</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-red-300">FORBIDDEN</td>
                  <td className="py-2 px-4 font-mono text-slate-400">403</td>
                  <td className="py-2 px-4 text-slate-400">Authenticated user lacks permission for this resource</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-red-300">NOT_FOUND</td>
                  <td className="py-2 px-4 font-mono text-slate-400">404</td>
                  <td className="py-2 px-4 text-slate-400">The requested resource does not exist</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-red-300">CONFLICT</td>
                  <td className="py-2 px-4 font-mono text-slate-400">409</td>
                  <td className="py-2 px-4 text-slate-400">Request conflicts with current state of the resource</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-red-300">RATE_LIMIT_EXCEEDED</td>
                  <td className="py-2 px-4 font-mono text-slate-400">429</td>
                  <td className="py-2 px-4 text-slate-400">Too many requests; see Retry-After header</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-red-300">MEMORY_TYPE_INVALID</td>
                  <td className="py-2 px-4 font-mono text-slate-400">400</td>
                  <td className="py-2 px-4 text-slate-400">Specified memory type is not one of the nine valid types</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-red-300">EMBEDDING_ERROR</td>
                  <td className="py-2 px-4 font-mono text-slate-400">500</td>
                  <td className="py-2 px-4 text-slate-400">Failed to generate vector embedding for memory content</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-red-300">VECTOR_SEARCH_FAILED</td>
                  <td className="py-2 px-4 font-mono text-slate-400">500</td>
                  <td className="py-2 px-4 text-slate-400">Semantic search encountered an internal error</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-red-300">INTERNAL_ERROR</td>
                  <td className="py-2 px-4 font-mono text-slate-400">500</td>
                  <td className="py-2 px-4 text-slate-400">An unexpected server error occurred; contact support</td>
                </tr>
                <tr className="hover:bg-slate-800/30">
                  <td className="py-2 px-4 font-mono text-red-300">SERVICE_UNAVAILABLE</td>
                  <td className="py-2 px-4 font-mono text-slate-400">503</td>
                  <td className="py-2 px-4 text-slate-400">Service is temporarily unavailable; try again later</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Section>

        {/* ================================================================ */}
        {/*  Footer / Related Docs                                           */}
        {/* ================================================================ */}
        <div className="mt-20 pt-10 border-t border-slate-800">
          <h3 className="text-xl font-semibold text-slate-100 mb-6">Related Documentation</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: "/docs/sdk-guide", label: "SDK Guide", desc: "Official client libraries" },
              { href: "/docs/getting-started", label: "Getting Started", desc: "Quick start guide" },
              { href: "/docs/architecture", label: "Architecture", desc: "System overview" },
              { href: "/docs/memory-system", label: "Memory System", desc: "How VIVIM memory works" },
            ].map(({ href, label, desc }) => (
              <Link
                key={href}
                href={href}
                className="group block p-5 rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-800/50 hover:border-violet-500/40 transition-all duration-200"
              >
                <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">{label}</p>
                <p className="text-xs text-slate-500 mt-1">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
