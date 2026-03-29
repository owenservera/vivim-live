# Architecture Decision Records (ADRs)

## Decision Log

---

## ADR-001: Use Bun as Primary Runtime

### Context
Choosing JavaScript runtime for the project.

### Decision
Use **Bun** as the primary runtime (v1.0+).

### Rationale
- Faster startup time than Node.js
- Built-in package manager
- Native TypeScript support
- Compatible with existing Node.js code

### Status
✅ Implemented

### Consequences
- Must ensure all dependencies work with Bun
- Some Node.js APIs may behave differently
- May need Node.js fallback for some packages

---

## ADR-002: Use Prisma as ORM

### Context
Database access layer selection.

### Decision
Use **Prisma** with PostgreSQL.

### Rationale
- Type-safe database access
- Easy migrations
- Good IDE integration
- Supports PostgreSQL-specific features (vectors)

### Status
✅ Implemented

### Consequences
- Must run `prisma generate` after schema changes
- Migration files must be version controlled
- Some complex queries may need raw SQL

---

## ADR-003: Use pgvector for Embeddings

### Context
Vector storage for memory embeddings.

### Decision
Use **pgvector** extension with Prisma.

### Implementation
```prisma
model AtomicChatUnit {
  embedding Unsupported("vector(1536)")?
}
```

### Rationale
- Single database for all data
- Efficient similarity search
- Easier than separate vector DB

### Status
✅ Implemented

### Consequences
- Requires pgvector extension
- Embedding dimension fixed at 1536

---

## ADR-004: Use Socket.IO for Real-time

### Context
Real-time communication between frontend and backend.

### Decision
Use **Socket.IO** with WebSocket + polling fallback.

### Implementation
```javascript
const io = new SocketIOServer(httpServer, {
  transports: ['websocket', 'polling'],
  cors: { origin: '*' }
});
```

### Rationale
- Automatic reconnection
- Fallback to polling
- Room-based messaging
- Battle-tested

### Status
✅ Implemented

### Consequences
- Requires CORS configuration
- Need to handle connection cleanup
- May need Redis adapter for scaling

---

## ADR-005: Virtual User Architecture

### Context
User identification without traditional authentication.

### Decision
Use **device fingerprinting** with virtual users.

### Implementation
```
Device Fingerprint → Hash → Virtual User ID
```

### Rationale
- Privacy-preserving (no PII stored)
- No login required
- Works across sessions
- GDPR compliant with consent

### Status
✅ Implemented

### Consequences
- Fingerprint can change (new device/browser)
- Must handle fingerprint rotation
- Privacy settings per user

---

## ADR-006: Context Budget System

### Context
Managing token limits for AI context.

### Decision
Implement **token budget with decay**.

### Implementation
```typescript
const MAX_CONTEXT_TOKENS = 4000;

function calculateBudget(items: ContextItem[]): number {
  return items.reduce((sum, item) => sum + item.tokens, 0);
}
```

### Rationale
- Prevents exceeding model limits
- Optimizes costs
- Improves response quality

### Status
✅ Implemented

### Consequences
- Complex budget calculation
- May exclude relevant context
- Need to tune budget limits

---

## ADR-007: Memory Extraction Strategy

### Context
How to extract memories from conversations.

### Decision
Use **AI-powered extraction** with confidence scoring.

### Implementation
```typescript
interface ExtractedMemory {
  key: string;
  value: unknown;
  confidence: number;
  sourceType: 'conversation' | 'explicit' | 'inferred';
}
```

### Rationale
- Automatic memory discovery
- Quality control via confidence
- Multiple extraction sources

### Status
✅ Implemented

### Consequences
- Requires AI provider
- May extract irrelevant memories
- Need consolidation strategy

---

## ADR-008: Feature Flag Implementation

### Context
Phased rollout of new systems.

### Decision
Use **environment-based feature flags**.

### Implementation
```typescript
export const FEATURES = {
  VIRTUAL_USERS: process.env.FEATURE_VIRTUAL_USERS === 'true',
  // ...
};
```

### Rationale
- Safe rollout
- Easy disable if issues
- No code changes needed

### Status
✅ Implemented

### Consequences
- Must document all flags
- Need cleanup when features stabilize

---

## ADR-009: Dependency Injection

### Context
Managing complex service dependencies.

### Decision
Use **manual DI with lazy initialization**.

### Implementation
```typescript
class DIContainer {
  private services = new Map<string, any>();
  
  register<T>(name: string, factory: () => T): void {
    this.services.set(name, factory);
  }
  
  resolve<T>(name: string): T {
    return this.services.get(name)();
  }
}
```

### Rationale
- Breaks circular dependencies
- Testable
- Simple to understand

### Status
✅ Recommended for Phase 1

### Consequences
- Initial setup time
- Must register all services

---

## ADR-010: Rate Limiting Strategy

### Context
Protecting APIs from abuse.

### Decision
Use **Redis-backed rate limiting** with per-user limits.

### Implementation
```typescript
const limiter = rateLimit({
  store: new RedisStore({ sendCommand: (...args) => redis.call(...args) }),
  windowMs: 60000,
  max: 100,
});
```

### Rationale
- Distributed rate limiting
- Persistent across restarts
- Granular control

### Status
✅ Recommended for Phase 5

### Consequences
- Requires Redis
- Need to handle Redis failures

---

## ADR-011: Testing Strategy

### Context
How to test the integrated system.

### Decision
Use **multi-layer testing**:

| Layer | Tool | Coverage |
|-------|------|----------|
| Unit | Vitest | 80% |
| Integration | Supertest | 100% API |
| E2E | Playwright | Critical paths |

### Rationale
- Fast feedback for unit tests
- API contract via integration
- User flows via E2E

### Status
✅ Documented in Phase 7

### Consequences
- Test maintenance overhead
- May need test database

---

## ADR-012: Frontend State Management

### Context
How to manage chat state in frontend.

### Decision
Use **React Context + Socket.IO**.

### Implementation
```typescript
const ChatContext = createContext<ChatState>(null);

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([]);
  // Socket.IO connection management
}
```

### Rationale
- Simple for this use case
- No external state library needed
- Works with Next.js

### Status
✅ Recommended for Phase 6

### Consequences
- May need optimistic updates
- Reconnection handling

---

## Open Decisions

### OD-001: Caching Strategy
- Options: Redis, in-memory, CDN
- Pending: After Phase 3 complete

### OD-002: Search Implementation
- Options: PostgreSQL full-text, Elasticsearch, Meilisearch
- Pending: After memory system works

### OD-003: Authentication Future
- Options: Keep virtual users, add OAuth, add JWT
- Pending: Based on user feedback

---

## Decision Template

Use this format for new decisions:

```markdown
## ADR-XXX: [Title]

### Context
[What's the decision about]

### Decision
[What we decided]

### Rationale
[Why this choice]

### Implementation
[Code example if applicable]

### Status
Proposed / Accepted / Deprecated

### Consequences
- Positive: [Good outcomes]
- Negative: [Trade-offs]
```

---

## Review Schedule

Review open ADRs:
- Weekly during integration
- After each phase completion
- Monthly after full integration
