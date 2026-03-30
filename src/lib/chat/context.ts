// Stub Context Engine for VIVIM Chatbot
// This will be replaced with real Supabase integration later

import type { DualContext, UserContext, DocsContext } from "@/types/chat";

// Simulated knowledge base for stub
const STUB_KNOWLEDGE_BASE = [
  "VIVIM is a sovereign, portable, personal AI memory system.",
  "VIVIM works with all AI providers including OpenAI, Anthropic, Google, and more.",
  "ACUs (Atomic Chat Units) are the fundamental building blocks of VIVIM's memory system.",
  "VIVIM provides intelligent context management and semantic storage.",
  "The dual context system combines user preferences with relevant documentation.",
  "VIVIM supports zero-knowledge privacy - your keys never leave your device.",
  "Memory extraction in VIVIM uses advanced NLP to identify key information.",
  "Context budget management ensures optimal token usage for AI interactions.",
];

// Simulated user profiles
const STUB_USERS: Record<string, Partial<UserContext>> = {
  default: {
    preferences: {
      language: "en",
      responseStyle: "balanced",
      expertise: "intermediate",
    },
    memory: {
      recentTopics: ["memory systems", "AI assistants", "context management"],
      preferredFormat: "markdown",
    },
  },
};

/**
 * Build dual context for a chat request
 * STUB: Uses simulated data, will be replaced with Supabase queries
 */
export async function buildDualContext(userId?: string): Promise<DualContext> {
  // Get user context (stub)
  const userStub = STUB_USERS[userId ?? "default"] ?? STUB_USERS.default;

  // Build user context
  const userContext: UserContext = {
    id: userId ?? "anonymous",
    preferences: {
      language: userStub.preferences?.language ?? navigator?.language ?? "en",
      responseStyle: userStub.preferences?.responseStyle ?? "balanced",
      expertise: userStub.preferences?.expertise ?? "intermediate",
    },
    sessionContext: {
      currentPage: typeof window !== "undefined" ? window.location.pathname : "/chat",
      recentActions: [],
      timeZone: Intl?.DateTimeFormat?.().resolvedOptions?.().timeZone ?? "UTC",
    },
    memory: userStub.memory,
  };

  // Build docs context (stub - returns random subset of knowledge base)
  const docsContext: DocsContext = {
    corpusId: "vivim-knowledge-base",
    relevantDocs: STUB_KNOWLEDGE_BASE.slice(0, 5),
    semanticSearch: {
      enabled: true,
      threshold: 0.7,
      maxResults: 5,
    },
  };

  return {
    user: userContext,
    docs: docsContext,
  };
}

/**
 * Search the docs corpus (stub)
 * Returns relevant documents based on query
 */
export async function searchDocsCorpus(query: string): Promise<string[]> {
  // STUB: Simple keyword matching
  // TODO: Replace with pgvector semantic search via Supabase
  const queryLower = query.toLowerCase();
  
  const relevant = STUB_KNOWLEDGE_BASE.filter(doc => 
    doc.toLowerCase().includes(queryLower) ||
    queryLower.split(" ").some(word => doc.toLowerCase().includes(word))
  );

  // Return at least 2 docs, or random if no match
  if (relevant.length >= 2) {
    return relevant.slice(0, 5);
  }
  
  return STUB_KNOWLEDGE_BASE.slice(0, 3);
}

/**
 * Build system prompt from dual context
 */
export function buildSystemPrompt(context: DualContext | undefined): string {
  // Defensive: handle undefined or incomplete context
  const user = context?.user ?? {
    id: "anonymous",
    preferences: { language: "en", responseStyle: "balanced", expertise: "intermediate" },
    sessionContext: { currentPage: "/chat", recentActions: [], timeZone: "UTC" },
    memory: { recentTopics: [], preferredFormat: "markdown" },
  };
  const docs = context?.docs ?? { corpusId: "none", relevantDocs: [], semanticSearch: { enabled: false, threshold: 0.7, maxResults: 0 } };

  return `You are VIVIM Assistant, an intelligent memory companion.

## USER CONTEXT
- User ID: ${user.id}
- Language: ${user.preferences.language}
- Expertise Level: ${user.preferences.expertise}
- Response Style: ${user.preferences.responseStyle}
- Current Page: ${user.sessionContext.currentPage}
- Time Zone: ${user.sessionContext.timeZone}
${user.memory?.recentTopics?.length ? `- Recent Topics: ${user.memory.recentTopics.join(", ")}` : ""}

## KNOWLEDGE BASE
${docs.relevantDocs.map((doc, i) => `${i + 1}. ${doc}`).join("\n")}

## INSTRUCTIONS
- Be helpful, accurate, and friendly
- Adapt your responses to the user's expertise level (${user.preferences.expertise})
- Match the user's preferred response style (${user.preferences.responseStyle})
- Reference the knowledge base when relevant
- Use markdown formatting for clarity when appropriate
- If you don't know something, say so honestly
- Keep responses focused and actionable`;
}
