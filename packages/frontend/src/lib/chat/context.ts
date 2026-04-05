// Real Context Engine for VIVIM Chatbot
// Fetches context from backend API instead of returning stub data

import type { DualContext, UserContext, DocsContext } from "@/types/chat";

const API_BASE = typeof window !== 'undefined'
  ? `${window.location.origin}/api`
  : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api');

/**
 * Fetch user profile and preferences from backend
 */
async function fetchUserProfile(virtualUserId: string): Promise<Partial<UserContext>> {
  try {
    const res = await fetch(`${API_BASE}/v1/virtual/${virtualUserId}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) return {};

    const data = await res.json();
    const user = data.data || data;

    return {
      preferences: {
        language: user.language || 'en',
        responseStyle: user.responseStyle || 'balanced',
        expertise: user.expertiseLevel || 'intermediate',
      },
      memory: {
        recentTopics: user.recentTopics || [],
        preferredFormat: user.preferredFormat || 'markdown',
      },
    };
  } catch {
    return {};
  }
}

/**
 * Fetch context assembly from backend context engine
 */
async function fetchContextAssembly(virtualUserId: string, message?: string) {
  try {
    const res = await fetch(`${API_BASE}/v2/context-engine/assemble`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        virtualUserId,
        message: message || '',
        budget: 12000,
      }),
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/**
 * Fetch recent memories for the user
 */
async function fetchRecentMemories(virtualUserId: string, limit = 10): Promise<string[]> {
  try {
    const res = await fetch(
      `${API_BASE}/v1/memories?virtualUserId=${virtualUserId}&limit=${limit}&status=active`,
      { method: 'GET', headers: { 'Content-Type': 'application/json' } }
    );

    if (!res.ok) return [];

    const data = await res.json();
    const memories = data.data?.memories || data.memories || [];

    return memories.map((m: any) => {
      const content = m.content || m.text || m.summary || '';
      const type = m.type || 'factual';
      return `[${type}] ${content}`;
    }).filter(Boolean).slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * Search doc corpus for knowledge base content
 */
async function searchDocCorpus(query: string, limit = 5): Promise<string[]> {
  try {
    const res = await fetch(`${API_BASE}/v1/doc-corpus/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit }),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const docs = data.data?.results || data.results || [];

    return docs.map((d: any) => d.content || d.text || d.chunk || '').filter(Boolean).slice(0, limit);
  } catch {
    return [];
  }
}

/**
 * Build dual context for a chat request
 * Uses real backend API when available, falls back to minimal defaults
 */
export async function buildDualContext(
  virtualUserId?: string,
  userMessage?: string
): Promise<DualContext> {
  const userId = virtualUserId || 'anonymous';
  const currentPage = typeof window !== 'undefined' ? window.location.pathname : '/chat';
  const timeZone = typeof Intl !== 'undefined'
    ? Intl?.DateTimeFormat?.().resolvedOptions?.().timeZone || 'UTC'
    : 'UTC';

  // Fetch real data from backend (parallel requests)
  const [userProfile, contextAssembly, recentMemories] = await Promise.all([
    fetchUserProfile(userId),
    fetchContextAssembly(userId, userMessage),
    fetchRecentMemories(userId, 8),
  ]);

  // Build user context from real profile
  const userContext: UserContext = {
    id: userId,
    preferences: {
      language: userProfile.preferences?.language || 'en',
      responseStyle: userProfile.preferences?.responseStyle || 'balanced',
      expertise: userProfile.preferences?.expertise || 'intermediate',
    },
    sessionContext: {
      currentPage,
      recentActions: [],
      timeZone,
    },
    memory: {
      recentTopics: userProfile.memory?.recentTopics || [],
      preferredFormat: userProfile.memory?.preferredFormat || 'markdown',
    },
  };

  // Build docs context from memories and corpus
  const docsContext: DocsContext = {
    corpusId: 'vivim-knowledge-base',
    relevantDocs: recentMemories.length > 0
      ? recentMemories
      : ['VIVIM is a sovereign, portable, personal AI memory system.'],
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
 * Search the docs corpus
 * Uses backend semantic search when available
 */
export async function searchDocsCorpus(query: string): Promise<string[]> {
  if (!query?.trim()) return [];

  // Try backend semantic search first
  const results = await searchDocCorpus(query, 5);
  if (results.length > 0) return results;

  // Fallback: minimal response
  return ['VIVIM is a sovereign, portable, personal AI memory system.'];
}

/**
 * Build system prompt from dual context
 */
export function buildSystemPrompt(context: DualContext): string {
  const { user, docs } = context;

  if (!user) {
    return buildDefaultSystemPrompt();
  }

  return `You are VIVIM Assistant, an intelligent memory companion.

## USER CONTEXT
- User ID: ${user.id ?? 'anonymous'}
- Language: ${user.preferences?.language ?? 'en'}
- Expertise Level: ${user.preferences?.expertise ?? 'intermediate'}
- Response Style: ${user.preferences?.responseStyle ?? 'balanced'}
- Current Page: ${user.sessionContext?.currentPage ?? '/chat'}
- Time Zone: ${user.sessionContext?.timeZone ?? 'UTC'}
${user.memory?.recentTopics?.length ? `- Recent Topics: ${user.memory.recentTopics.join(', ')}` : ''}

## KNOWLEDGE BASE
${docs?.relevantDocs?.length
    ? docs.relevantDocs.map((doc, i) => `${i + 1}. ${doc}`).join('\n')
    : 'No knowledge base documents available.'}

## INSTRUCTIONS
- Be helpful, accurate, and friendly
- Adapt your responses to the user's expertise level (${user.preferences?.expertise ?? 'intermediate'})
- Match the user's preferred response style (${user.preferences?.responseStyle ?? 'balanced'})
- Reference the knowledge base when relevant
- Use markdown formatting for clarity when appropriate
- If you don't know something, say so honestly
- Keep responses focused and actionable`;
}

/**
 * Build a default system prompt when context is unavailable
 */
function buildDefaultSystemPrompt(): string {
  return `You are VIVIM Assistant, an intelligent memory companion.

## USER CONTEXT
- User ID: anonymous
- Language: en
- Expertise Level: intermediate
- Response Style: balanced

## KNOWLEDGE BASE
No knowledge base available.

## INSTRUCTIONS
- Be helpful, accurate, and friendly
- Use clear, concise language
- If you don't know something, say so honestly
- Keep responses focused and actionable`;
}
