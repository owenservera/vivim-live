# REDESIGN 001 — ACU Processor: Replace Rust Core with LLM-Powered Decomposition

> **Status:** Proposed  
> **Priority:** 🔴 Critical — the entire knowledge graph is built on mock data  
> **Effort:** 3-5 days  
> **Stack:** Bun + TypeScript + Z.AI (GLM-4.7-Flash) + Prisma

---

## Problem Statement

The `acu-processor.js` has a permanently mocked Rust core (`rustCore = null`). The mock implementation (`mockProcessCapture`) does naive paragraph splitting and regex-based type detection:

```js
// Current: Split on double-newlines, guess type by regex
const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 0);
if (paragraph.includes('```')) { type = 'code_snippet'; }
else if (paragraph.endsWith('?')) { type = 'question'; }
```

This produces low-quality ACUs that lack:
- Semantic boundary detection (a concept can span multiple paragraphs)
- Intent classification (instructions vs. explanations vs. opinions)
- Entity extraction (who/what is being discussed)
- Relationship detection (which ACUs are conceptually linked)
- Quality differentiation (all ACUs treated equally)

**The Rust core was designed for a future product. For a functional chatbot AI, we don't need native perf — we need semantic intelligence.**

---

## Redesigned Architecture

### Core Idea
Replace paragraph-splitting with **LLM-powered conversation decomposition**. Use the same Z.AI API the system already depends on (GLM-4.7-Flash) to intelligently decompose conversations into ACUs.

### Data Flow

```
Conversation Messages
        │
        ▼
┌──────────────────────┐
│  Message Chunker     │  ← Group messages into windows of ~4k tokens
│  (deterministic)     │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  LLM Decomposer     │  ← One LLM call per chunk → structured ACUs
│  (GLM-4.7-Flash)     │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  Quality Scorer      │  ← Heuristic + LLM-assigned scores
│  (no external call)  │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  Embedding Generator │  ← Batch embed all ACU contents
│  (Z.AI embedding)    │
└──────────┬───────────┘
           ▼
┌──────────────────────┐
│  Link Detector       │  ← Cosine similarity on embeddings
│  (vector math)       │
└──────────┬───────────┘
           ▼
       Save to DB
```

---

## Implementation

### 1. Message Chunker (deterministic, no LLM)

```typescript
// packages/backend/src/services/acu-decomposer.ts

interface MessageWindow {
  messages: Array<{ id: string; role: string; content: string; index: number }>;
  tokenCount: number;
}

function chunkConversation(messages: ConversationMessage[], maxTokens = 4000): MessageWindow[] {
  const windows: MessageWindow[] = [];
  let current: MessageWindow = { messages: [], tokenCount: 0 };

  for (const msg of messages) {
    const msgTokens = estimateTokens(msg.content);

    // If single message exceeds window, it gets its own window
    if (msgTokens > maxTokens) {
      if (current.messages.length > 0) windows.push(current);
      windows.push({ messages: [msg], tokenCount: msgTokens });
      current = { messages: [], tokenCount: 0 };
      continue;
    }

    // If adding this message would exceed window, start new window
    if (current.tokenCount + msgTokens > maxTokens) {
      windows.push(current);
      current = { messages: [], tokenCount: 0 };
    }

    current.messages.push(msg);
    current.tokenCount += msgTokens;
  }

  if (current.messages.length > 0) windows.push(current);
  return windows;
}
```

### 2. LLM Decomposer (one call per chunk)

```typescript
const DECOMPOSE_PROMPT = `You are an ACU (Atomic Chat Unit) decomposer. 
Analyze this conversation segment and extract distinct knowledge atoms.

Each ACU should be:
- Self-contained (understandable without the full conversation)
- Atomic (one concept per ACU)
- Classified by type and category

Return JSON array:
[
  {
    "content": "The self-contained knowledge statement",
    "type": "fact" | "opinion" | "instruction" | "question" | "answer" | "code_snippet" | "decision" | "preference",
    "category": "technical" | "personal" | "creative" | "business" | "general",
    "entities": ["named entities mentioned"],
    "topics": ["topic slugs"],
    "importance": 0.0-1.0,
    "sourceMessageIndices": [0, 1]
  }
]

Rules:
- Skip greetings, filler, and meta-commentary ("sure!", "let me help")
- Merge related statements into one ACU (don't split "X because Y" into two)
- Code blocks get their own ACU with surrounding explanation
- Questions paired with their answers become a single "answer" ACU
- Maximum 15 ACUs per chunk`;

async function decomposeChunk(
  llmService: ILLMService,
  window: MessageWindow,
  conversationId: string
): Promise<RawACU[]> {
  const messagesText = window.messages
    .map(m => `[${m.role}] (msg #${m.index}): ${m.content}`)
    .join('\n\n');

  const response = await llmService.chat({
    model: 'glm-4.7-flash',  // Fast + cheap, already in use
    messages: [
      { role: 'system', content: DECOMPOSE_PROMPT },
      { role: 'user', content: messagesText },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.1,  // Low temp for consistency
    maxTokens: 2000,
  });

  const parsed = JSON.parse(response.content);
  const acus = Array.isArray(parsed) ? parsed : parsed.acus || [];

  return acus.map((acu, i) => ({
    id: generateContentHash(`${conversationId}:${window.messages[0].index}:${i}:${acu.content}`),
    content: acu.content,
    type: acu.type || 'statement',
    category: acu.category || 'general',
    entities: acu.entities || [],
    topics: acu.topics || [],
    importance: acu.importance || 0.5,
    sourceMessageIds: acu.sourceMessageIndices?.map(
      (idx: number) => window.messages[idx]?.id
    ).filter(Boolean) || [],
    provenance: {
      conversation_id: conversationId,
      message_id: window.messages[0].id,
      message_index: window.messages[0].index,
      source_timestamp: new Date().toISOString(),
    },
  }));
}
```

### 3. Quality Scorer (enhanced heuristics, no external dependency)

```typescript
function scoreACUQuality(acu: RawACU): QualityScores {
  const content = acu.content;

  // Content richness: based on information density
  let richness = 0;
  const wordCount = content.split(/\s+/).length;
  const hasSpecifics = /\d+|"[^"]+"|'[^']+'/.test(content);  // Numbers, quotes
  const hasStructure = /\n|•|[-*]\s/.test(content);           // Lists, structure
  const hasCode = /```|`[^`]+`/.test(content);                // Code

  richness = Math.min(100, 
    (wordCount > 30 ? 40 : wordCount * 1.3) +
    (hasSpecifics ? 20 : 0) +
    (hasStructure ? 15 : 0) +
    (hasCode ? 25 : 0)
  );

  // Structural integrity: type was assigned by LLM, so inherently better
  const integrity = acu.type !== 'statement' ? 85 : 70;

  // Uniqueness: LLM already deduplicates within a chunk
  // Cross-chunk dedup happens at the embedding/link stage
  const uniqueness = 75; // Base score; refined after embedding comparison

  // LLM-assigned importance carries weight
  const llmImportance = (acu.importance || 0.5) * 100;

  const overall = richness * 0.3 + integrity * 0.2 + uniqueness * 0.2 + llmImportance * 0.3;

  return {
    overall: Math.round(overall),
    richness: Math.round(richness),
    integrity: Math.round(integrity),
    uniqueness: Math.round(uniqueness),
  };
}
```

### 4. Embedding + Link Detection (uses existing Z.AI service)

```typescript
async function generateEmbeddingsAndLinks(
  embeddingService: IEmbeddingService,
  acus: RawACU[]
): Promise<{ acus: EnrichedACU[]; links: ACULink[] }> {
  // Batch embed all ACU contents
  const contents = acus.map(a => a.content);
  const embeddings = await embeddingService.embedBatch(contents);

  const enrichedAcus = acus.map((acu, i) => ({
    ...acu,
    embedding: embeddings[i],
    embeddingModel: 'zai-embedding-2',
  }));

  // Detect semantic links via cosine similarity
  const links: ACULink[] = [];
  for (let i = 0; i < enrichedAcus.length; i++) {
    for (let j = i + 1; j < enrichedAcus.length; j++) {
      const similarity = cosineSimilarity(enrichedAcus[i].embedding, enrichedAcus[j].embedding);

      if (similarity > 0.75) {
        links.push({
          sourceId: enrichedAcus[i].id,
          targetId: enrichedAcus[j].id,
          relation: similarity > 0.9 ? 'duplicate' : 'related',
          weight: similarity,
          metadata: { type: 'semantic', similarity },
        });
      }
    }
  }

  // Also detect Q&A and explanation links from the LLM-assigned types
  for (let i = 0; i < enrichedAcus.length - 1; i++) {
    if (enrichedAcus[i].type === 'question' && enrichedAcus[i + 1].type === 'answer') {
      links.push({
        sourceId: enrichedAcus[i].id,
        targetId: enrichedAcus[i + 1].id,
        relation: 'answered_by',
        weight: 0.95,
        metadata: { type: 'structural' },
      });
    }
  }

  return { acus: enrichedAcus, links };
}
```

---

## Cost Analysis

| Component | Per Conversation (50 msgs) | Monthly (1,000 convs) |
|---|---|---|
| **Current Mock** | $0.00 | $0.00 |
| **LLM Decomposition** (3 chunks × ~2k tokens in + ~1k out) | ~$0.003 | ~$3.00 |
| **Embeddings** (~15 ACUs × 100 tokens avg) | ~$0.0002 | ~$0.20 |
| **Total** | **~$0.003** | **~$3.20** |

This is negligible. The Librarian worker already makes LLM calls for synthesis — decomposition is a much higher-value use of the same budget.

---

## Migration Plan

1. **Create** `packages/backend/src/services/acu-decomposer.ts` (new file)
2. **Modify** `acu-processor.js`:
   - Replace `mockProcessCapture` call with `decomposeConversation` from new service
   - Remove the dead `rustCore` import and conditional
   - Remove `generateEmbeddings` flag (always generate them now)
3. **Delete**: The `mockProcessCapture` function and all `rustCore` references
4. **Add env var**: `ACU_DECOMPOSER_MODEL=glm-4.7-flash` (configurable)
5. **Backfill**: Run `processAllConversations()` once to re-process existing conversations with the new decomposer

---

## What This Doesn't Replace

The Rust core served additional purposes beyond ACU decomposition:
- **Cryptographic signatures** — still placeholder (`Buffer.from([])`)
- **DID generation** — still using `did:key:anon_${userId}`
- **Content encryption** — still using mock `encryptString`

These are separate concerns and should be addressed in REDESIGN_003 (Identity & Crypto).
