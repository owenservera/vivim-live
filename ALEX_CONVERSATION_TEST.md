# VIVIM End-to-End Integration Test: Multi-Turn Conversation

## Overview
This test simulates a real user having a multi-turn conversation with VIVIM to verify:
1. ✅ Frontend-backend integration works
2. ✅ Virtual user creation and fingerprinting works
3. ✅ User messages and AI responses are saved to database
4. ✅ Context engine assembles personalized context
5. ✅ Conversation threads are properly maintained

## Test Scenario: "Alex" Learning About AI Memory Systems

**Persona:** Alex is a software developer curious about AI memory systems and wants to understand how VIVIM works.

---

## Test Setup

### 1. Environment Setup
```bash
# Start backend server
cd packages/backend && bun src/server.js &
BACKEND_PID=$!

# Start frontend dev server
cd packages/frontend && npm run dev &
FRONTEND_PID=$!

# Wait for services to start
sleep 10

# Verify services are running
curl -s http://localhost:3001/health | head -5
curl -s http://localhost:3000/api/chat -X GET | head -5
```

### 2. Test User Identity
```javascript
// Alex's browser fingerprint (simulated)
const alexFingerprint = "alex-dev-browser-fingerprint-" + Date.now();
console.log("Alex's fingerprint:", alexFingerprint);
```

---

## Conversation Flow Test

### **Turn 1: Initial Greeting & Context Building**

**User Message:**
```
Hi! I'm Alex, a software developer. I've heard about AI memory systems and I'm curious how they work. Can you explain what makes VIVIM's memory system special?
```

**Expected Behavior:**
- Frontend sends fingerprint: `alex-dev-browser-fingerprint-...`
- Backend context engine assembles initial context (minimal since no history)
- AI responds helpfully about VIVIM's memory system
- Virtual user record created in database
- Conversation thread initialized

**API Calls:**
```bash
# Frontend -> Backend context assembly
POST http://localhost:3001/api/v2/context-engine/assemble
Headers: x-user-fingerprint: alex-dev-browser-fingerprint-...
Body: { "userMessage": "Hi! I'm Alex...", "conversationId": "alex-thread-1" }

# Frontend -> Z.AI API
POST https://api.z.ai/api/coding/paas/v4/chat-messages
Headers: Authorization: Bearer ***
Body: { "messages": [...], "model": "glm-4.7" }
```

**Database Expectations After Turn 1:**
```sql
-- Virtual user created
SELECT id, fingerprint, createdAt FROM virtual_users
WHERE fingerprint LIKE 'alex-dev-browser-fingerprint-%';

-- Conversation created
SELECT id, virtualUserId, title, messageCount FROM conversations
WHERE virtualUserId = (SELECT id FROM virtual_users WHERE fingerprint LIKE 'alex-dev-browser-fingerprint-%');

-- Messages stored
SELECT conversationId, role, content, createdAt FROM messages
WHERE conversationId = (SELECT id FROM conversations WHERE virtualUserId = (...))
ORDER BY createdAt;

-- Context settings created
SELECT virtualUserId, maxContextTokens, responseStyle FROM user_context_settings
WHERE virtualUserId = (SELECT id FROM virtual_users WHERE fingerprint LIKE 'alex-dev-browser-fingerprint-%');
```

---

### **Turn 2: Follow-up Question About Context Assembly**

**User Message:**
```
That sounds fascinating! You mentioned something about "context assembly" - can you explain how that works? Does it use my conversation history to build better responses?
```

**Expected Behavior:**
- Context engine now has conversation history to work with
- AI response incorporates knowledge of previous conversation
- Context assembly includes detected topics/entities from Turn 1
- Memory system begins building user profile

**Database Expectations After Turn 2:**
```sql
-- Conversation updated with second message pair
SELECT COUNT(*) as messageCount FROM messages
WHERE conversationId = (SELECT id FROM conversations WHERE virtualUserId = (...));

-- Context engine should detect topics like "AI memory", "context assembly"
-- Memory extraction may have started for the first conversation
SELECT COUNT(*) as memoryCount FROM memories
WHERE virtualUserId = (SELECT id FROM virtual_users WHERE fingerprint LIKE 'alex-dev-browser-fingerprint-%');
```

---

### **Turn 3: Technical Deep Dive**

**User Message:**
```
I'm really interested in the technical implementation. How does VIVIM extract and store memories from conversations? Do you use vector embeddings or some other approach?
```

**Expected Behavior:**
- Context assembly now includes technical knowledge from previous responses
- AI provides detailed technical explanation
- Memory extraction becomes more active
- Topic profiles may start forming around "AI", "memory systems", "technical implementation"

**Database Expectations After Turn 3:**
```sql
-- More messages accumulated
SELECT role, LENGTH(content) as contentLength FROM messages
WHERE conversationId = (SELECT id FROM conversations WHERE virtualUserId = (...))
ORDER BY createdAt DESC LIMIT 6;

-- Memory extraction should be more active
SELECT content, category, importance FROM memories
WHERE virtualUserId = (SELECT id FROM virtual_users WHERE fingerprint LIKE 'alex-dev-browser-fingerprint-%')
ORDER BY importance DESC LIMIT 5;
```

---

### **Turn 4: Personalization Test**

**User Message:**
```
This is really impressive! Earlier I mentioned I'm a software developer - can you tailor your explanation to how this would be useful for someone building AI applications?
```

**Expected Behavior:**
- Context engine should incorporate the "software developer" identity from Turn 1
- AI response becomes more personalized and technical
- Entity profile for "software developer" may emerge
- Context bundles optimized for developer use case

**Database Expectations After Turn 4:**
```sql
-- Check if identity information is captured
SELECT metadata FROM virtual_users
WHERE fingerprint LIKE 'alex-dev-browser-fingerprint-%';

-- Look for developer-related memories
SELECT content FROM memories
WHERE virtualUserId = (SELECT id FROM virtual_users WHERE fingerprint LIKE 'alex-dev-browser-fingerprint-%')
AND (content ILIKE '%developer%' OR content ILIKE '%software%');

-- Check context bundle creation
SELECT bundleType, compiledPrompt FROM context_bundles
WHERE virtualUserId = (SELECT id FROM virtual_users WHERE fingerprint LIKE 'alex-dev-browser-fingerprint-%')
LIMIT 3;
```

---

### **Turn 5: Memory Recall Test**

**User Message:**
```
Earlier you talked about vector embeddings - can you remind me what you said about how VIVIM uses them specifically?
```

**Expected Behavior:**
- Context engine should retrieve and incorporate information from earlier in the conversation
- AI response demonstrates memory recall capability
- Memory consolidation may occur
- Conversation linkage shows memory working across turns

**Database Expectations After Turn 5:**
```sql
-- Full conversation history
SELECT
  role,
  LEFT(content, 100) as contentPreview,
  createdAt
FROM messages
WHERE conversationId = (SELECT id FROM conversations WHERE virtualUserId = (...))
ORDER BY createdAt;

-- Memory consolidation check
SELECT
  content,
  category,
  importance,
  consolidationStatus
FROM memories
WHERE virtualUserId = (SELECT id FROM virtual_users WHERE fingerprint LIKE 'alex-dev-browser-fingerprint-%')
ORDER BY createdAt DESC LIMIT 10;
```

---

## Automated Test Script

```javascript
// test-alex-conversation.js
import { createTestUser, simulateConversation } from './test-helpers.js';

async function runAlexConversationTest() {
  console.log("🚀 Starting Alex Conversation Test");

  // Create test user identity
  const alex = await createTestUser("alex-dev-browser-fingerprint");

  // Conversation turns
  const conversation = [
    {
      user: "Hi! I'm Alex, a software developer. I've heard about AI memory systems and I'm curious how they work. Can you explain what makes VIVIM's memory system special?",
      expectContextAssembly: true,
      expectVirtualUserCreation: true,
      expectConversationCreation: true
    },
    {
      user: "That sounds fascinating! You mentioned something about 'context assembly' - can you explain how that works? Does it use my conversation history to build better responses?",
      expectContextWithHistory: true,
      expectMemoryExtraction: true
    },
    {
      user: "I'm really interested in the technical implementation. How does VIVIM extract and store memories from conversations? Do you use vector embeddings or some other approach?",
      expectTechnicalContext: true,
      expectTopicFormation: true
    },
    {
      user: "This is really impressive! Earlier I mentioned I'm a software developer - can you tailor your explanation to how this would be useful for someone building AI applications?",
      expectPersonalization: true,
      expectEntityProfiles: true
    },
    {
      user: "Earlier you talked about vector embeddings - can you remind me what you said about how VIVIM uses them specifically?",
      expectMemoryRecall: true,
      expectMemoryConsolidation: true
    }
  ];

  // Run conversation
  for (let i = 0; i < conversation.length; i++) {
    const turn = conversation[i];
    console.log(`\n📝 Turn ${i + 1}: ${turn.user.substring(0, 50)}...`);

    const result = await simulateConversation(alex.fingerprint, turn.user, `alex-thread-${i + 1}`);

    // Verify expectations
    await verifyTurnExpectations(alex, result, turn, i + 1);

    // Database verification
    await verifyDatabaseState(alex, i + 1);
  }

  console.log("\n🎉 Alex Conversation Test COMPLETED!");
  console.log("✅ All turns completed successfully");
  console.log("✅ Virtual user creation verified");
  console.log("✅ Conversation persistence verified");
  console.log("✅ Context assembly working");
  console.log("✅ Memory system operational");
}

runAlexConversationTest();
```

## Success Criteria

### ✅ **Functional Success**
- [ ] All 5 conversation turns complete successfully
- [ ] Virtual user created with correct fingerprint
- [ ] All messages (user + AI) saved to database
- [ ] Context assembly working (not falling back to basic prompt)
- [ ] AI responses are coherent and contextually appropriate

### ✅ **Data Persistence Success**
- [ ] Virtual user record exists in `virtual_users` table
- [ ] Conversation record exists in `conversations` table
- [ ] All 10 messages (5 user, 5 AI) exist in `messages` table
- [ ] Context settings created in `user_context_settings` table
- [ ] Memories extracted and stored in `memories` table
- [ ] Topic/entity profiles formed around conversation themes

### ✅ **Context Intelligence Success**
- [ ] Context assembly improves with conversation history
- [ ] AI responses show memory of previous turns
- [ ] Personalization based on user identity ("software developer")
- [ ] Technical depth increases appropriately
- [ ] Memory recall demonstrated in final turn

### ✅ **System Integration Success**
- [ ] Frontend-backend API communication working
- [ ] Z.AI integration functional
- [ ] Database connections stable
- [ ] SSL certificate handling working
- [ ] Error handling graceful

## Post-Test Database Analysis

```sql
-- Complete conversation audit
SELECT
  vu.fingerprint,
  c.title,
  c.messageCount,
  COUNT(m.id) as actualMessages,
  COUNT(mem.id) as extractedMemories
FROM virtual_users vu
JOIN conversations c ON c.virtualUserId = vu.id
LEFT JOIN messages m ON m.conversationId = c.id
LEFT JOIN memories mem ON mem.virtualUserId = vu.id
WHERE vu.fingerprint LIKE 'alex-dev-browser-fingerprint-%'
GROUP BY vu.id, vu.fingerprint, c.id, c.title, c.messageCount;

-- Context bundle analysis
SELECT
  bundleType,
  LENGTH(compiledPrompt) as promptLength,
  compiledAt
FROM context_bundles
WHERE virtualUserId = (SELECT id FROM virtual_users WHERE fingerprint LIKE 'alex-dev-browser-fingerprint-%')
ORDER BY compiledAt DESC;

-- Memory quality analysis
SELECT
  category,
  AVG(importance) as avgImportance,
  COUNT(*) as memoryCount,
  MAX(createdAt) as latestMemory
FROM memories
WHERE virtualUserId = (SELECT id FROM virtual_users WHERE fingerprint LIKE 'alex-dev-browser-fingerprint-%')
GROUP BY category
ORDER BY avgImportance DESC;
```

## Expected Test Results

**Database State After Complete Test:**
- 1 virtual user record
- 5 conversations (one per turn, or 1 conversation with 5 message pairs)
- 10 message records (5 user, 5 AI)
- 5+ memory records extracted
- 3+ context bundles created
- Topic profiles for: "AI memory systems", "context assembly", "vector embeddings"
- Entity profile for: "software developer"

**Context Assembly Evolution:**
- Turn 1: Basic VIVIM introduction
- Turn 2: Context assembly explanation with history awareness
- Turn 3: Technical implementation details
- Turn 4: Developer-tailored explanations
- Turn 5: Perfect memory recall and synthesis

This comprehensive test will verify that VIVIM's complete memory and context system is working end-to-end with real user interactions.