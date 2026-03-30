# REDESIGN 003 — Chatbot Chat Route: Replace Placeholder with Context-Aware LLM Call

> **Status:** Proposed  
> **Priority:** 🔴 Critical — the chatbot endpoint returns a hardcoded string  
> **Effort:** 1-2 days  
> **Stack:** Bun + TypeScript + Z.AI Chat API + Existing Context Engine

---

## Problem Statement

The chatbot route at `POST /api/v1/chatbot/:tenantSlug/chat` returns a **placeholder response**:

```typescript
// routes/chatbot/index.ts:276-281
// TODO: Integrate with DualEngineOrchestrator
const response = {
  role: 'assistant' as const,
  content: `Thank you for your message: "${message}". This is a placeholder response. The dual-engine orchestrator integration is pending.`,
};
```

The "DualEngineOrchestrator" it references doesn't exist. But the system already has everything needed to make this work:
- A context assembler (`DynamicContextAssembler`) that builds system prompts
- A Z.AI chat API that handles LLM calls
- A VirtualUser session model with memory and history

---

## Redesigned Chat Flow

```
User Message
    │
    ▼
┌────────────────────────────┐
│ 1. Get Virtual User Context │  ← Existing VirtualUser + session data
└─────────────┬──────────────┘
              ▼
┌────────────────────────────┐
│ 2. Assemble System Prompt   │  ← Use DynamicContextAssembler
│    (identity + memory +     │     Pass virtualUserId from session
│     topic + conversation)   │
└─────────────┬──────────────┘
              ▼
┌────────────────────────────┐
│ 3. Build Chat Messages      │  ← system prompt + last N messages
│    from conversation history│
└─────────────┬──────────────┘
              ▼
┌────────────────────────────┐
│ 4. Call Z.AI Chat           │  ← tenant.defaultModel or user override
│    (streaming or sync)      │
└─────────────┬──────────────┘
              ▼
┌────────────────────────────┐
│ 5. Save Response + Emit     │  ← Save to DB + fire event bus
│    Events for Librarian     │
└─────────────┬──────────────┘
              ▼
          Response
```

---

## Implementation

### Replace the placeholder block (lines 276-316)

```typescript
// routes/chatbot/index.ts — Replace lines 276-316

import { getOrCreateUnifiedContextService } from '../../services/unified-context-service';
import { createLLMService } from '../../context/utils/zai-service';

// Inside the POST handler, after saving user message:

// Step 1: Assemble context
const contextService = getOrCreateUnifiedContextService();
const contextResult = await contextService.assembleContext({
  virtualUserId: virtualUserId,
  conversationId: conv.id,
  userMessage: message,
  settings: {
    maxContextTokens: 8000,
  },
});

// Step 2: Build message history
const historyMessages = (conv.messages || [])
  .slice(-20)  // Last 20 messages for context window
  .map((m: any) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

// Step 3: Call LLM
const llm = createLLMService();
const chatModel = modelId || tenant.defaultModel || 'glm-4.7';

const llmResponse = await llm.chat({
  model: chatModel,
  messages: [
    { role: 'system', content: contextResult.systemPrompt },
    ...historyMessages,
    { role: 'user', content: message },
  ],
  temperature: 0.7,
  maxTokens: 2048,
});

const response = {
  role: 'assistant' as const,
  content: llmResponse.content,
};

// Step 4: Save assistant response
await prisma.virtualMessage.create({
  data: {
    conversationId: conv.id,
    role: 'assistant',
    content: response.content,
    metadata: {
      modelId: chatModel,
      contextEngine: contextResult.engineUsed,
      contextTokens: contextResult.stats?.totalTokens,
      topics: contextResult.stats?.detectedTopics,
    },
  },
});

// Step 5: Update conversation stats
await prisma.virtualConversation.update({
  where: { id: conv.id },
  data: {
    messageCount: { increment: 2 },
    metadata: {
      lastMessageAt: new Date().toISOString(),
      lastModel: chatModel,
    },
  },
});

// Return response with context metadata
res.json({
  response,
  conversationId: conv.id,
  context: {
    engineUsed: contextResult.engineUsed,
    topicsDetected: contextResult.stats?.detectedTopics?.length || 0,
    contextTokens: contextResult.stats?.totalTokens || 0,
    modelUsed: chatModel,
  },
});
```

### Add timeout protection

```typescript
// Wrap the LLM call with AbortController
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 15000); // 15s max

try {
  const llmResponse = await llm.chat({
    model: chatModel,
    messages: [...],
    signal: controller.signal,
  });
  clearTimeout(timeout);
} catch (error) {
  clearTimeout(timeout);
  if (error.name === 'AbortError') {
    return res.status(504).json({ error: 'Response generation timed out' });
  }
  throw error;
}
```

---

## Also Affected: `context-orchestrator.ts` Placeholder Methods

The `ContextOrchestrator` has two placeholder invalidation methods:

```typescript
// context-orchestrator.ts:199-212
async markDirty(): Promise<void> {
  logger.warn('markDirty called - not yet implemented');
}
async markDirtyWithId(userId: string, referenceId: string): Promise<void> {
  logger.warn({ userId, referenceId }, 'markDirtyWithId called - not yet implemented');
}
```

But `invalidateOnMemoryCreated` at line 222 **calls these methods with different signatures** (`this.markDirty(userId, 'identity_core')`) than what's defined — it passes arguments to a function that takes none. This is a silent bug.

### Fix

```typescript
async markDirty(userId: string, bundleType: string): Promise<void> {
  await this.prisma.contextBundle.updateMany({
    where: { userId, bundleType },
    data: { isDirty: true },
  });
}

async markDirtyWithId(userId: string, bundleType: string, referenceId: string): Promise<void> {
  await this.prisma.contextBundle.updateMany({
    where: {
      userId,
      bundleType,
      OR: [
        { topicProfileId: referenceId },
        { entityProfileId: referenceId },
        { conversationId: referenceId },
      ],
    },
    data: { isDirty: true },
  });
}
```

---

## Also Affected: Reranker Placeholder

The `CorpusReranker.applyCrossEncoder()` is a placeholder that uses length-based heuristics instead of actual cross-encoding.

### Redesign for Current Stack

Instead of waiting for an external cross-encoder model, use the existing LLM to do lightweight re-ranking:

```typescript
private async applyCrossEncoder(
  query: string,
  chunks: ScoredCorpusChunk[]
): Promise<ScoredCorpusChunk[]> {
  // Only re-rank top 10 to save LLM cost
  const topChunks = chunks.slice(0, 10);
  const rest = chunks.slice(10);

  const llm = createLLMService();
  const prompt = `Score each document's relevance to the query on a scale of 0-10.
Query: "${query}"

${topChunks.map((c, i) => `[Doc ${i}]: ${c.chunk.content.substring(0, 200)}`).join('\n')}

Return JSON: { "scores": [num, num, ...] }`;

  try {
    const response = await llm.chat({
      model: 'glm-4.7-flash',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0,
      maxTokens: 100,
    });

    const { scores } = JSON.parse(response.content);
    const reranked = topChunks.map((chunk, i) => ({
      ...chunk,
      scores: { ...chunk.scores, combined: (scores[i] || 5) / 10 },
    }));

    return [...reranked.sort((a, b) => b.scores.combined - a.scores.combined), ...rest];
  } catch {
    return chunks;  // Graceful fallback to original order
  }
}
```

**Cost**: ~$0.0005 per re-rank call (flash model, tiny input).
