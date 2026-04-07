import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Code2, Database, MessageSquare, Zap, Settings, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "SDK Integration Guide | VIVIM Documentation",
  description: "Comprehensive guide to integrating the VIVIM SDK into your application. Learn installation, authentication, memory operations, chat, and real-time updates.",
  canonical: "https://vivim.Live/docs/sdk-guide",
  openGraph: {
    title: "SDK Integration Guide | VIVIM Documentation",
    description: "Comprehensive guide to integrating the VIVIM SDK into your application.",
    type: "website",
    url: "https://vivim.Live/docs/sdk-guide",
  },
};

const sections = [
  { id: "installation", title: "Installation", icon: Settings },
  { id: "initialization", title: "Initialization & Configuration", icon: Settings },
  { id: "authentication", title: "Authentication Setup", icon: Shield },
  { id: "memory-operations", title: "Memory Operations", icon: Database },
  { id: "context-assembly", title: "Context Assembly Integration", icon: Code2 },
  { id: "chat-operations", title: "Chat Operations", icon: MessageSquare },
  { id: "error-handling", title: "Error Handling", icon: Shield },
  { id: "realtime-updates", title: "Real-Time Updates with Socket.io", icon: Zap },
  { id: "best-practices", title: "Best Practices", icon: Shield },
  { id: "examples", title: "Complete Code Examples", icon: Code2 },
];

export default function SDKGuidePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Hero Section */}
      <div className="border-b border-slate-800 bg-gradient-to-b from-violet-950/30 to-slate-950">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex items-center gap-3 text-violet-400 mb-4">
            <Code2 className="h-6 w-6" />
            <span className="text-sm font-medium tracking-wider uppercase">Developer Guide</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            VIVIM SDK Integration Guide
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl">
            Everything you need to integrate the VIVIM SDK into your application. From installation
            to advanced real-time features, this guide covers every aspect of the SDK with practical
            TypeScript and JavaScript examples.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/docs/getting-started"
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
            >
              Getting Started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/docs/api-reference"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
            >
              API Reference <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:col-span-1">
            <nav className="sticky top-8 space-y-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-3">
                On this page
              </p>
              {sections.map((section) => {
                const Icon = section.icon;
                return (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:text-cyan-400 hover:bg-slate-800/50 transition-colors"
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{section.title}</span>
                  </a>
                );
              })}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="lg:col-span-3 prose prose-invert prose-slate max-w-none">
            <h2 className="text-2xl font-bold text-white">Overview</h2>
            <p>
              The VIVIM SDK provides a comprehensive toolkit for integrating AI-powered memory and
              chat capabilities into your application. Built with TypeScript from the ground up, it
              offers type-safe access to memory operations, context assembly, real-time chat, and
              Socket.io-based live updates. Whether you are building a standalone AI assistant or
              embedding VIVIM capabilities into an existing platform, this guide walks you through
              every step.
            </p>
            <p>
              Before proceeding, ensure you have a VIVIM account and API credentials. If you are
              new to the platform, start with our{" "}
              <Link href="/docs/getting-started" className="text-cyan-400 hover:text-cyan-300">
                Getting Started guide
              </Link>{" "}
              to set up your project and obtain your API keys.
            </p>

            {/* Installation */}
            <h2 id="installation" className="text-2xl font-bold text-white mt-12">
              1. Installation
            </h2>
            <p>
              The SDK is distributed as an npm-compatible package. Install it alongside your other
              dependencies using bun, npm, yarn, or pnpm. We recommend bun for the fastest
              installation times.
            </p>

            <div className="not-prose rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden mb-8">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-500">Terminal</span>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
              </div>
              <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto">
                <code>{`# Install with bun (recommended)
bun add @vivim/sdk

# Or with npm
npm install @vivim/sdk

# Or with yarn
yarn add @vivim/sdk

# Or with pnpm
pnpm add @vivim/sdk`}</code>
              </pre>
            </div>

            <p>
              After installation, verify the package is in your <code>package.json</code> and that
              TypeScript can resolve the module. The SDK exports both CommonJS and ESM formats, so
              it works seamlessly with Next.js, Vite, Remix, and any modern build toolchain.
            </p>

            {/* Initialization */}
            <h2 id="initialization" className="text-2xl font-bold text-white mt-12">
              2. Initialization and Configuration
            </h2>
            <p>
              Before making any API calls, you must initialize the SDK with your credentials and
              desired configuration. The SDK exposes a singleton client that manages connections,
              retries, and authentication tokens automatically.
            </p>

            <div className="not-prose rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden mb-8">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-500">client.ts</span>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
              </div>
              <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto">
                <code>{`import { VivimClient } from "@vivim/sdk";

// Basic initialization
const client = new VivimClient({
  apiKey: process.env.VIVIM_API_KEY,
  baseUrl: process.env.VIVIM_BASE_URL || "https://api.vivim.live",
  timeout: 30_000,
  retries: 3,
  retryDelay: 1_000,
});

// For browser environments, use the browser-compatible client
import { VivimBrowserClient } from "@vivim/sdk/browser";

const browserClient = new VivimBrowserClient({
  apiKey: process.env.NEXT_PUBLIC_VIVIM_API_KEY,
  baseUrl: process.env.NEXT_PUBLIC_VIVIM_BASE_URL,
});`}</code>
              </pre>
            </div>

            <h3 className="text-xl font-semibold text-white">Configuration Options</h3>
            <ul>
              <li>
                <strong>apiKey</strong> (required): Your VIVIM API key. Never expose server-side
                keys in client bundles.
              </li>
              <li>
                <strong>baseUrl</strong>: The API endpoint. Defaults to{" "}
                <code>https://api.vivim.Live</code>.
              </li>
              <li>
                <strong>timeout</strong>: Request timeout in milliseconds. Default is 30 seconds.
              </li>
              <li>
                <strong>retries</strong>: Number of automatic retry attempts for failed requests.
              </li>
              <li>
                <strong>retryDelay</strong>: Base delay between retries in milliseconds. Uses
                exponential backoff.
              </li>
              <li>
                <strong>logger</strong>: Optional custom logger instance for debugging.
              </li>
            </ul>

            {/* Authentication */}
            <h2 id="authentication" className="text-2xl font-bold text-white mt-12">
              3. Authentication Setup
            </h2>
            <p>
              The VIVIM SDK supports multiple authentication strategies depending on your
              deployment context. Server-side applications typically use API key authentication,
              while browser-based clients should use session tokens or OAuth flows.
            </p>

            <div className="not-prose rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden mb-8">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-500">auth.ts</span>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
              </div>
              <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto">
                <code>{`import { VivimClient } from "@vivim/sdk";

// Strategy 1: API Key (server-side)
const serverClient = new VivimClient({
  apiKey: process.env.VIVIM_API_KEY,
});

// Strategy 2: Session Token (browser-side)
const browserClient = new VivimClient({
  sessionToken: getSessionToken(),
  tokenRefresh: async () => {
    // Called when the session token expires
    const newToken = await fetch("/api/refresh-token").then(r => r.json());
    return newToken.token;
  },
});

// Strategy 3: OAuth 2.0 flow
const oauthClient = new VivimClient({
  clientId: process.env.VIVIM_CLIENT_ID,
  clientSecret: process.env.VIVIM_CLIENT_SECRET,
  redirectUri: "https://yourapp.com/callback",
  scopes: ["memory:read", "memory:write", "chat:send"],
});

// Verify authentication
async function verifyAuth(client: VivimClient) {
  try {
    const { user } = await client.auth.verify();
    console.log("Authenticated as:", user.email);
    return true;
  } catch (error) {
    console.error("Authentication failed:", error);
    return false;
  }
}`}</code>
              </pre>
            </div>

            <p>
              The SDK automatically refreshes tokens before expiration when you configure a
              <code>tokenRefresh</code> callback. For OAuth flows, redirect users to the
              authorization URL and exchange the callback code for a session token.
            </p>

            {/* Memory Operations */}
            <h2 id="memory-operations" className="text-2xl font-bold text-white mt-12">
              4. Memory Operations
            </h2>
            <p>
              The memory system is the core of VIVIM&apos;s AI capabilities. It allows you to
              create, read, update, delete, and search through structured knowledge that
              contextualizes AI responses. Each memory entry can contain text, metadata, tags, and
              relationships to other entries.
            </p>

            <h3 className="text-xl font-semibold text-white">Create Memory</h3>
            <div className="not-prose rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden mb-6">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-500">memory-create.ts</span>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
              </div>
              <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto">
                <code>{`// Create a new memory entry
const memory = await client.memory.create({
  content: "VIVIM uses a multi-agent architecture with specialized agents for memory, chat, and context assembly.",
  category: "architecture",
  tags: ["agents", "system-design", "backend"],
  metadata: {
    source: "engineering-docs",
    version: "2.0",
    priority: "high",
  },
});

console.log("Created memory with ID:", memory.id);
// => "mem_a1b2c3d4e5f6"`}</code>
              </pre>
            </div>

            <h3 className="text-xl font-semibold text-white">Read Memory</h3>
            <div className="not-prose rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden mb-6">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-500">memory-read.ts</span>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
              </div>
              <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto">
                <code>{`// Read a specific memory by ID
const memory = await client.memory.get("mem_a1b2c3d4e5f6");

console.log(memory.content);
console.log(memory.category);
console.log(memory.tags);
console.log(memory.createdAt);
console.log(memory.updatedAt);

// Read multiple memories by IDs
const memories = await client.memory.getMany([
  "mem_a1b2c3d4e5f6",
  "mem_g7h8i9j0k1l2",
]);`}</code>
              </pre>
            </div>

            <h3 className="text-xl font-semibold text-white">Update Memory</h3>
            <div className="not-prose rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden mb-6">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-500">memory-update.ts</span>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
              </div>
              <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto">
                <code>{`// Update an existing memory
const updated = await client.memory.update("mem_a1b2c3d4e5f6", {
  content: "VIVIM v2.0 uses a multi-agent architecture with specialized agents for memory management, chat processing, and context assembly.",
  tags: ["agents", "system-design", "backend", "v2.0"],
  metadata: {
    priority: "critical",
    reviewedBy: "engineering-lead",
  },
});

// Partial update (only specified fields change)
await client.memory.patch("mem_a1b2c3d4e5f6", {
  metadata: { ...existing.metadata, reviewedBy: "qa-team" },
});`}</code>
              </pre>
            </div>

            <h3 className="text-xl font-semibold text-white">Delete Memory</h3>
            <div className="not-prose rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden mb-6">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-500">memory-delete.ts</span>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
              </div>
              <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto">
                <code>{`// Soft delete (marks as deleted, preserves history)
await client.memory.delete("mem_a1b2c3d4e5f6");

// Hard delete (permanent removal)
await client.memory.delete("mem_a1b2c3d4e5f6", { hard: true });

// Bulk delete by filter
const { deletedCount } = await client.memory.deleteMany({
  category: "deprecated",
  tags: ["outdated"],
});
console.log("Deleted", deletedCount, "memories");`}</code>
              </pre>
            </div>

            <h3 className="text-xl font-semibold text-white">Search Memory</h3>
            <div className="not-prose rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden mb-6">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-500">memory-search.ts</span>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
              </div>
              <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto">
                <code>{`// Semantic search with vector embeddings
const results = await client.memory.search({
  query: "How does the multi-agent architecture work?",
  limit: 10,
  category: "architecture",
  minScore: 0.7,
});

for (const result of results.hits) {
  console.log("Score:", result.score);
  console.log("Content:", result.memory.content);
  console.log("Tags:", result.memory.tags);
}

// Filter-based search
const filtered = await client.memory.search({
  query: "rate limiting implementation",
  filters: {
    tags: ["backend", "security"],
    metadata: { priority: "high" },
    createdAt: { gte: "2025-01-01" },
  },
  sortBy: "relevance", // or "createdAt", "updatedAt"
  sortOrder: "desc",
});`}</code>
              </pre>
            </div>

            <p>
              Search results include relevance scores powered by VIVIM&apos;s vector embedding
              engine. The <code>minScore</code> threshold filters out low-confidence matches. For
              detailed schema information, see the{" "}
              <Link href="/docs/memory-system" className="text-cyan-400 hover:text-cyan-300">
                Memory System documentation
              </Link>
              .
            </p>

            {/* Context Assembly */}
            <h2 id="context-assembly" className="text-2xl font-bold text-white mt-12">
              5. Context Assembly Integration
            </h2>
            <p>
              Context assembly is the process of gathering relevant memories, user history, and
              system state into a unified prompt context before generating AI responses. The SDK
              provides a high-level API for constructing and managing context assemblies.
            </p>

            <div className="not-prose rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden mb-8">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-500">context-assembly.ts</span>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
              </div>
              <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto">
                <code>{`import { ContextAssembler } from "@vivim/sdk";

// Create a context assembler
const assembler = new ContextAssembler(client, {
  maxTokens: 4000,
  memoryLimit: 15,
  includeUserHistory: true,
  includeSystemPrompt: true,
});

// Assemble context for a specific query
const context = await assembler.assemble({
  query: "How do I set up rate limiting?",
  userId: "user_123",
  sessionId: "session_456",
  categories: ["architecture", "security"],
});

console.log("Assembled context tokens:", context.tokenCount);
console.log("Memories included:", context.memories.length);
console.log("Full prompt:", context.prompt);

// With custom memory selection
const customContext = await assembler.assemble({
  query: "Explain the authentication flow",
  memoryIds: ["mem_auth_flow", "mem_security_overview"],
  includeRecentMemories: true,
  recentCount: 5,
});

// Get context statistics
const stats = assembler.getStats();
console.log("Total memories indexed:", stats.totalMemories);
console.log("Average relevance score:", stats.avgRelevanceScore);`}</code>
              </pre>
            </div>

            <p>
              The assembler automatically ranks memories by relevance, respects token limits, and
              deduplicates overlapping content. You can customize the ranking algorithm, set
              category priorities, and inject custom context fragments programmatically.
            </p>

            {/* Chat Operations */}
            <h2 id="chat-operations" className="text-2xl font-bold text-white mt-12">
              6. Chat Operations
            </h2>
            <p>
              The chat module provides methods for sending messages, managing conversations,
              streaming responses, and handling conversation history. It integrates seamlessly with
              the memory and context systems to produce informed AI responses.
            </p>

            <div className="not-prose rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden mb-8">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-500">chat.ts</span>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
              </div>
              <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto">
                <code>{`// Send a message and get a response
const response = await client.chat.sendMessage({
  message: "What is the VIVIM architecture?",
  conversationId: "conv_789",
  userId: "user_123",
  useContext: true,
  contextConfig: {
    categories: ["architecture"],
    memoryLimit: 10,
  },
});

console.log(response.reply);
console.log(response.sources); // Referenced memories
console.log(response.latencyMs);

// Streaming response (for real-time typing effect)
const stream = await client.chat.streamMessage({
  message: "Explain the memory system in detail",
  conversationId: "conv_789",
  userId: "user_123",
});

for await (const chunk of stream) {
  if (chunk.type === "token") {
    process.stdout.write(chunk.content);
  } else if (chunk.type === "sources") {
    console.log("\n\nSources:", chunk.sources);
  } else if (chunk.type === "done") {
    console.log("\n\nResponse complete. Latency:", chunk.latencyMs, "ms");
  }
}

// Manage conversations
const conversation = await client.chat.getConversation("conv_789");
const messages = await client.chat.getMessages("conv_789", {
  limit: 50,
  before: "msg_timestamp",
});

// Create a new conversation
const newConv = await client.chat.createConversation({
  title: "Architecture Discussion",
  userId: "user_123",
  metadata: { topic: "system-design" },
});`}</code>
              </pre>
            </div>

            <p>
              Streaming responses are ideal for real-time user interfaces. They deliver tokens as
              they are generated, enabling smooth typing animations. The non-streaming
              <code>sendMessage</code> method is better suited for server-side processing and batch
              operations. See the{" "}
              <Link href="/docs/api-reference" className="text-cyan-400 hover:text-cyan-300">
                API Reference
              </Link>{" "}
              for the complete conversation schema.
            </p>

            {/* Error Handling */}
            <h2 id="error-handling" className="text-2xl font-bold text-white mt-12">
              7. Error Handling
            </h2>
            <p>
              The SDK provides structured error types that make it easy to handle different failure
              scenarios appropriately. All errors extend from a base <code>VivimError</code> class
              and include detailed diagnostic information.
            </p>

            <div className="not-prose rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden mb-8">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-500">error-handling.ts</span>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
              </div>
              <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto">
                <code>{`import {
  VivimError,
  AuthenticationError,
  RateLimitError,
  NotFoundError,
  ValidationError,
  NetworkError,
} from "@vivim/sdk";

async function safeOperation() {
  try {
    const memory = await client.memory.create({
      content: "Important system configuration",
      category: "config",
    });
    return memory;
  } catch (error) {
    if (error instanceof AuthenticationError) {
      // Token expired or invalid - redirect to login
      console.error("Auth error:", error.message);
      await redirectToLogin();
    } else if (error instanceof RateLimitError) {
      // Rate limited - wait and retry
      console.warn("Rate limited. Retry after:", error.retryAfterMs, "ms");
      await sleep(error.retryAfterMs);
      return safeOperation();
    } else if (error instanceof NotFoundError) {
      // Resource does not exist
      console.error("Resource not found:", error.resourceId);
    } else if (error instanceof ValidationError) {
      // Invalid input data
      console.error("Validation failed:", error.details);
    } else if (error instanceof NetworkError) {
      // Network connectivity issue
      console.error("Network error:", error.message);
    } else if (error instanceof VivimError) {
      // Generic SDK error
      console.error("SDK error:", error.code, error.message);
    } else {
      // Unexpected error
      console.error("Unexpected error:", error);
    }
    throw error;
  }
}

// Global error handler for the SDK client
client.onError((error) => {
  console.error("[VIVIM SDK]", error);
  // Report to your error tracking service
  errorTracker.report(error);
});`}</code>
              </pre>
            </div>

            <p>
              The SDK implements automatic retry for transient errors (5xx responses, network
              timeouts). Rate limit errors include the <code>retryAfterMs</code> field so you can
              implement precise backoff without guessing. All errors include a unique
              <code>requestId</code> for correlating with server-side logs.
            </p>

            {/* Real-Time Updates */}
            <h2 id="realtime-updates" className="text-2xl font-bold text-white mt-12">
              8. Real-Time Updates with Socket.io
            </h2>
            <p>
              For applications that need live updates -- such as collaborative editing, real-time
              chat, or live memory synchronization -- the SDK provides a Socket.io integration that
              pushes events to connected clients without polling.
            </p>

            <div className="not-prose rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden mb-8">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-500">realtime.ts</span>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
              </div>
              <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto">
                <code>{`import { VivimSocketClient } from "@vivim/sdk/realtime";

// Initialize Socket.io client
const socketClient = new VivimSocketClient({
  client,
  url: process.env.VIVIM_WS_URL || "wss://ws.vivim.Live",
  autoReconnect: true,
  reconnectAttempts: 5,
  reconnectDelay: 2_000,
});

// Connect to the WebSocket server
await socketClient.connect();

// Subscribe to memory events
socketClient.on("memory:created", (data) => {
  console.log("New memory created:", data.memory.id);
  updateMemoryList(data.memory);
});

socketClient.on("memory:updated", (data) => {
  console.log("Memory updated:", data.memory.id);
  refreshMemory(data.memory.id);
});

socketClient.on("memory:deleted", (data) => {
  console.log("Memory deleted:", data.memoryId);
  removeFromUI(data.memoryId);
});

// Subscribe to chat events
socketClient.on("chat:message", (data) => {
  console.log("New message in conversation:", data.conversationId);
  appendMessage(data.message);
});

socketClient.on("chat:typing", (data) => {
  showTypingIndicator(data.userId);
});

socketClient.on("chat:stream", (data) => {
  // Real-time streaming chunks
  appendToStreamDisplay(data.token);
});

// Subscribe to a specific conversation
socketClient.joinConversation("conv_789");

// Subscribe to a category of memories
socketClient.watchCategory("architecture");

// Disconnect when done
socketClient.disconnect();

// Connection state monitoring
socketClient.on("connected", () => {
  console.log("WebSocket connected");
  setConnectionStatus("online");
});

socketClient.on("disconnected", (reason) => {
  console.log("WebSocket disconnected:", reason);
  setConnectionStatus("offline");
});`}</code>
              </pre>
            </div>

            <p>
              The real-time client supports automatic reconnection with exponential backoff. When
              the connection is restored, it automatically replays any missed events to ensure
              consistency. Use <code>joinConversation</code> and <code>watchCategory</code> to
              scope subscriptions to only the data the user needs, reducing bandwidth.
            </p>

            {/* Best Practices */}
            <h2 id="best-practices" className="text-2xl font-bold text-white mt-12">
              9. Best Practices
            </h2>
            <p>
              Follow these guidelines to ensure your integration is performant, secure, and
              maintainable. These recommendations are based on production usage patterns from
              hundreds of VIVIM integrations.
            </p>

            <h3 className="text-xl font-semibold text-white">Security</h3>
            <ul>
              <li>
                Never expose API keys in client-side code. Use environment variables prefixed with
                <code>NEXT_PUBLIC_</code> only for browser-safe tokens.
              </li>
              <li>
                Implement token refresh handlers to avoid authentication gaps during long sessions.
              </li>
              <li>
                Validate all user input before passing it to SDK methods. The SDK performs its own
                validation, but defense-in-depth prevents injection attacks.
              </li>
              <li>
                Use scoped API keys with minimum required permissions for each integration context.
              </li>
              <li>
                Enable request logging in development but disable it in production to prevent
                leaking sensitive data to logs.
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-white">Performance</h3>
            <ul>
              <li>
                Batch memory operations using <code>createMany</code> and <code>deleteMany</code>{" "}
                instead of individual calls to reduce round-trip latency.
              </li>
              <li>
                Use search filters to narrow results server-side instead of fetching and filtering
                client-side.
              </li>
              <li>
                Cache frequently accessed memories using your application&apos;s cache layer (Redis,
                in-memory, etc.) with appropriate TTL values.
              </li>
              <li>
                Prefer streaming for chat responses to improve perceived performance, even if
                total latency is the same.
              </li>
              <li>
                Limit context assembly to the most relevant memories. The default limit of 15 is a
                good starting point; adjust based on your model&apos;s context window.
              </li>
              <li>
                Use Socket.io subscriptions selectively -- watching too many categories can
                overwhelm clients and waste bandwidth.
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-white">Reliability</h3>
            <ul>
              <li>
                Always wrap SDK calls in try/catch blocks and handle each error type
                appropriately.
              </li>
              <li>
                Configure retries for production workloads. The default of 3 retries handles most
                transient failures.
              </li>
              <li>
                Implement circuit breakers for critical paths to prevent cascading failures when
                the API is degraded.
              </li>
              <li>
                Monitor SDK error rates and latency metrics through your observability platform.
              </li>
              <li>
                Test your integration against rate limits using the SDK&apos;s built-in simulation
                mode during development.
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-white">Memory Organization</h3>
            <ul>
              <li>
                Use consistent category naming conventions. Categories like{" "}
                <code>architecture</code>, <code>api-reference</code>, <code>user-guide</code> work
                well for most projects.
              </li>
              <li>
                Tag memories with multiple relevant keywords to improve search recall. Tags are
                cheaper than full-text search and should be used strategically.
              </li>
              <li>
                Include version metadata for memories that reference specific product versions.
                This prevents stale information from being served after updates.
              </li>
              <li>
                Periodically audit and prune memories that are no longer relevant. The{" "}
                <code>search</code> method with date filters is useful for finding old entries.
              </li>
            </ul>

            {/* Complete Code Examples */}
            <h2 id="examples" className="text-2xl font-bold text-white mt-12">
              10. Complete Code Examples
            </h2>
            <p>
              The following examples demonstrate end-to-end integrations for common use cases. Each
              example is production-ready and follows the best practices outlined above.
            </p>

            <h3 className="text-xl font-semibold text-white">Example: Full Chat Application</h3>
            <div className="not-prose rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden mb-8">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-500">chat-app.ts</span>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
              </div>
              <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto">
                <code>{`import { VivimClient, VivimSocketClient } from "@vivim/sdk";

class ChatApplication {
  private client: VivimClient;
  private socket: VivimSocketClient | null = null;

  constructor(apiKey: string) {
    this.client = new VivimClient({ apiKey, retries: 3 });
  }

  async initialize() {
    // Verify authentication
    await this.client.auth.verify();

    // Set up real-time connection
    this.socket = new VivimSocketClient({ client: this.client });
    await this.socket.connect();

    this.socket.on("chat:message", (data) => {
      this.onNewMessage(data.message);
    });

    console.log("Chat application initialized");
  }

  async sendMessage(conversationId: string, userId: string, text: string) {
    try {
      const response = await this.client.chat.sendMessage({
        message: text,
        conversationId,
        userId,
        useContext: true,
      });

      this.onNewMessage(response.reply);
      return response;
    } catch (error) {
      this.handleError(error);
      throw error;
    }
  }

  async streamMessage(
    conversationId: string,
    userId: string,
    text: string,
    onToken: (token: string) => void,
  ) {
    const stream = await this.client.chat.streamMessage({
      message: text,
      conversationId,
      userId,
    });

    let fullResponse = "";
    for await (const chunk of stream) {
      if (chunk.type === "token") {
        fullResponse += chunk.content;
        onToken(chunk.content);
      }
    }

    return fullResponse;
  }

  async loadConversationHistory(conversationId: string, limit = 50) {
    const messages = await this.client.chat.getMessages(conversationId, {
      limit,
    });
    return messages;
  }

  private onNewMessage(message: string) {
    console.log("New message:", message);
    // Update UI
  }

  private handleError(error: unknown) {
    if (error instanceof RateLimitError) {
      console.warn("Rate limited, retrying after", error.retryAfterMs, "ms");
    } else {
      console.error("Chat error:", error);
    }
  }

  destroy() {
    this.socket?.disconnect();
  }
}`}</code>
              </pre>
            </div>

            <h3 className="text-xl font-semibold text-white">Example: Memory Manager</h3>
            <div className="not-prose rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden mb-8">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-500">memory-manager.ts</span>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
              </div>
              <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto">
                <code>{`import { VivimClient, NotFoundError, ValidationError } from "@vivim/sdk";

interface MemoryEntry {
  id: string;
  content: string;
  category: string;
  tags: string[];
  metadata: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

class MemoryManager {
  private client: VivimClient;

  constructor(client: VivimClient) {
    this.client = client;
  }

  async addEntry(
    content: string,
    category: string,
    tags: string[],
    metadata: Record<string, unknown> = {},
  ): Promise<MemoryEntry> {
    if (!content || content.length < 10) {
      throw new ValidationError("Content must be at least 10 characters");
    }

    return this.client.memory.create({ content, category, tags, metadata });
  }

  async searchEntries(
    query: string,
    options?: { category?: string; limit?: number },
  ): Promise<MemoryEntry[]> {
    const results = await this.client.memory.search({
      query,
      limit: options?.limit ?? 20,
      ...(options?.category && { category: options.category }),
      minScore: 0.5,
    });

    return results.hits.map((hit) => hit.memory);
  }

  async updateEntry(
    id: string,
    updates: Partial<Pick<MemoryEntry, "content" | "tags" | "metadata">>,
  ): Promise<MemoryEntry> {
    try {
      return await this.client.memory.update(id, updates);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw new Error("Memory not found");
      }
      throw error;
    }
  }

  async deleteEntriesByCategory(category: string): Promise<number> {
    const { deletedCount } = await this.client.memory.deleteMany({
      category,
    });
    return deletedCount;
  }

  async getStaleEntries(beforeDate: Date): Promise<MemoryEntry[]> {
    const results = await this.client.memory.search({
      query: "",
      filters: {
        updatedAt: { lt: beforeDate.toISOString() },
      },
      limit: 100,
    });
    return results.hits.map((hit) => hit.memory);
  }
}`}</code>
              </pre>
            </div>

            <h3 className="text-xl font-semibold text-white">Example: Next.js API Route</h3>
            <div className="not-prose rounded-xl border border-slate-800 bg-slate-900/80 overflow-hidden mb-8">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800">
                <span className="text-xs font-mono text-slate-500">
                  app/api/chat/route.ts
                </span>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                </div>
              </div>
              <pre className="p-4 text-sm font-mono text-slate-300 overflow-x-auto">
                <code>{`import { VivimClient } from "@vivim/sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const { message, conversationId, userId } = await request.json();

  const client = new VivimClient({
    apiKey: process.env.VIVIM_API_KEY,
    timeout: 60_000,
  });

  try {
    const response = await client.chat.sendMessage({
      message,
      conversationId,
      userId,
      useContext: true,
    });

    return NextResponse.json({
      reply: response.reply,
      sources: response.sources,
      latency: response.latencyMs,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process message" },
      { status: 500 },
    );
  }
}`}</code>
              </pre>
            </div>

            {/* CTA Section */}
            <div className="not-prose mt-16 rounded-2xl border border-slate-800 bg-gradient-to-br from-violet-950/40 to-slate-900/60 p-8">
              <h3 className="text-xl font-bold text-white mb-3">
                Ready to integrate VIVIM into your project?
              </h3>
              <p className="text-slate-400 mb-6">
                Explore our additional documentation pages for more in-depth coverage of specific
                topics, or jump straight into the API reference for complete method signatures.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/docs/getting-started"
                  className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-500 transition-colors"
                >
                  Getting Started <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/docs/api-reference"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  API Reference <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/docs/memory-system"
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Memory System <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
