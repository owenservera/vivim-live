# API Endpoints Documentation

## Overview

This document lists all new API endpoints added by the integration.

---

## Base URL
```
Development: http://localhost:3001/api
Production: https://api.vivim.live/api
```

---

## Virtual User Endpoints

### Create Virtual User
```http
POST /api/virtual-user/create
Content-Type: application/json

{
  "fingerprint": {
    "browser": "chrome",
    "os": "windows",
    "device": "desktop",
    "screen": "1920x1080",
    "timezone": "America/New_York",
    "language": "en-US"
  }
}
```

**Response:**
```json
{
  "id": "uuid",
  "fingerprintHash": "hash",
  "createdAt": "2024-01-01T00:00:00Z",
  "visitCount": 1
}
```

### Get Virtual User
```http
GET /api/virtual-user/:id
```

**Response:**
```json
{
  "id": "uuid",
  "fingerprintHash": "hash",
  "createdAt": "2024-01-01T00:00:00Z",
  "lastSeenAt": "2024-01-02T00:00:00Z",
  "visitCount": 5,
  "preferences": {},
  "privacySettings": {
    "dataCollection": true,
    "personalization": true,
    "analytics": false
  },
  "consentGiven": true
}
```

### Update Privacy Settings
```http
PUT /api/virtual-user/:id/privacy
Content-Type: application/json

{
  "dataCollection": true,
  "personalization": true,
  "analytics": false,
  "thirdPartySharing": false
}
```

### Export User Data (GDPR)
```http
GET /api/virtual-user/:id/export
```

**Response:**
```json
{
  "user": { ... },
  "conversations": [ ... ],
  "memories": [ ... ],
  "exportedAt": "2024-01-01T00:00:00Z"
}
```

### Delete Virtual User
```http
DELETE /api/virtual-user/:id
```

---

## Memory Endpoints

### Store Memory
```http
POST /api/memory
Content-Type: application/json

{
  "virtualUserId": "uuid",
  "profileType": "preference",
  "category": "personal",
  "key": "favorite_color",
  "value": "blue",
  "confidence": 0.9,
  "sourceType": "conversation"
}
```

**Response:**
```json
{
  "id": "uuid",
  "key": "favorite_color",
  "value": "blue",
  "confidence": 0.9,
  "createdAt": "2024-01-01T00:00:00Z"
}
```

### Get User Memories
```http
GET /api/memory/:virtualUserId?profileType=preference&category=personal
```

**Response:**
```json
{
  "memories": [
    {
      "id": "uuid",
      "profileType": "preference",
      "category": "personal",
      "key": "favorite_color",
      "value": "blue",
      "confidence": 0.9,
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "total": 1
}
```

### Search Memories
```http
POST /api/memory-search
Content-Type: application/json

{
  "query": "color preferences",
  "virtualUserId": "uuid",
  "limit": 10,
  "minConfidence": 0.5
}
```

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "key": "favorite_color",
      "value": "blue",
      "confidence": 0.9,
      "relevanceScore": 0.95
    }
  ],
  "total": 1,
  "query": "color preferences"
}
```

### Get User Profile
```http
GET /api/memory/profile/:virtualUserId
```

**Response:**
```json
{
  "virtualUserId": "uuid",
  "preferences": {
    "favorite_color": "blue",
    "language": "en-US"
  },
  "facts": {
    "location": "New York"
  },
  "behaviors": {
    "active_hours": "9am-5pm"
  },
  "lastUpdated": "2024-01-01T00:00:00Z"
}
```

### Delete Memory
```http
DELETE /api/memory/:id
```

---

## Context Endpoints

### Get Conversation Context
```http
GET /api/context/conversation/:conversationId
```

**Response:**
```json
{
  "conversationId": "uuid",
  "context": {
    "systemPrompt": "...",
    "relevantMemories": [ ... ],
    "conversationSummary": "...",
    "recentMessages": [ ... ]
  },
  "tokens": 2500,
  "budgetUsed": 0.625,
  "qualityScore": 0.85
}
```

### Get User Context
```http
GET /api/context/user/:virtualUserId
```

**Response:**
```json
{
  "virtualUserId": "uuid",
  "context": {
    "preferences": { ... },
    "behaviors": { ... },
    "recentTopics": [ ... ]
  },
  "tokens": 500,
  "lastUpdated": "2024-01-01T00:00:00Z"
}
```

### Get Context Settings
```http
GET /api/context-settings
```

**Response:**
```json
{
  "budgetLimit": 4000,
  "decayEnabled": true,
  "decayRate": 0.1,
  "prefetchEnabled": true,
  "qualityThreshold": 0.7
}
```

### Update Context Settings
```http
PUT /api/context-settings
Content-Type: application/json

{
  "budgetLimit": 8000,
  "decayEnabled": true,
  "decayRate": 0.05
}
```

---

## AI Chat Endpoints

### Send Chat Message
```http
POST /api/ai-chat
Content-Type: application/json

{
  "message": "Hello, can you remember my preferences?",
  "virtualUserId": "uuid",
  "conversationId": "uuid",
  "options": {
    "stream": true,
    "includeContext": true
  }
}
```

**Response (non-streaming):**
```json
{
  "id": "uuid",
  "content": "Of course! Based on our conversations...",
  "role": "assistant",
  "tokens": 150,
  "contextUsed": {
    "memories": 5,
    "tokens": 500
  }
}
```

### Get Chat History
```http
GET /api/ai-chat/history/:conversationId?limit=50
```

**Response:**
```json
{
  "conversationId": "uuid",
  "messages": [
    {
      "id": "uuid",
      "role": "user",
      "content": "Hello",
      "createdAt": "2024-01-01T00:00:00Z"
    },
    {
      "id": "uuid",
      "role": "assistant",
      "content": "Hi there!",
      "createdAt": "2024-01-01T00:00:01Z"
    }
  ],
  "total": 2
}
```

### Get AI Settings
```http
GET /api/ai-settings
```

**Response:**
```json
{
  "provider": "openai",
  "model": "gpt-4o",
  "temperature": 0.7,
  "maxTokens": 4096,
  "streamingEnabled": true
}
```

### Update AI Settings
```http
PUT /api/ai-settings
Content-Type: application/json

{
  "provider": "anthropic",
  "model": "claude-3-opus",
  "temperature": 0.5
}
```

---

## Chatbot Endpoints

### Send Message to Chatbot
```http
POST /api/chatbot/message
Content-Type: application/json

{
  "message": "What do you know about me?",
  "sessionId": "session-uuid",
  "context": {
    "page": "/dashboard",
    "userAgent": "Mozilla/5.0..."
  }
}
```

**Response:**
```json
{
  "response": "Based on our conversations, I know that...",
  "sessionId": "session-uuid",
  "suggestions": [
    "Tell me more about my preferences",
    "What have we discussed recently?"
  ]
}
```

### Get Session History
```http
GET /api/chatbot/session/:sessionId
```

---

## WebSocket Events

### Connection
```javascript
const socket = io('http://localhost:3001');
```

### Events

#### Client → Server

**Send Message:**
```javascript
socket.emit('chat:message', {
  message: 'Hello',
  virtualUserId: 'uuid',
  conversationId: 'uuid'
});
```

#### Server → Client

**Receive Chunk:**
```javascript
socket.on('chat:chunk', (data) => {
  // data: { content: "partial text" }
});
```

**Chat Complete:**
```javascript
socket.on('chat:complete', () => {
  // Chat finished
});
```

**Chat Error:**
```javascript
socket.on('chat:error', (error) => {
  // error: { message: "Error description" }
});
```

**Context Update:**
```javascript
socket.on('context:update', (data) => {
  // data: { context: {...}, tokens: 500 }
});
```

**Memory Extracted:**
```javascript
socket.on('memory:extracted', (data) => {
  // data: { key: "preference", value: {...} }
});
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "virtualUserId",
      "reason": "must be a valid UUID"
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Access denied |
| `NOT_FOUND` | 404 | Resource not found |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `AI_PROVIDER_ERROR` | 502 | AI provider error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

---

## Rate Limits

| Endpoint Type | Limit | Window |
|---------------|-------|--------|
| Chat | 100 requests | 1 minute |
| Memory | 200 requests | 1 minute |
| Context | 300 requests | 1 minute |
| General | 1000 requests | 1 minute |

---

## Authentication

Most endpoints support optional authentication via:
1. **Cookie**: `virtual_user_id` cookie
2. **Header**: `X-Virtual-User-ID` header
3. **Body**: `virtualUserId` in request body

Priority: Header > Cookie > Body
