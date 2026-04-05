// apps/server/src/routes/ai-chat.js
// ═══════════════════════════════════════════════════════════════════════════
// FRESH AI CHAT - Database-backed conversations with optional context system
// ═══════════════════════════════════════════════════════════════════════════
//
// This route handles FRESH conversations with full database persistence.
// Supports personas, provider switching, streaming, and context integration.
// Uses Prisma ORM for Supabase database integration.

import { Router } from 'express';
import { unifiedProvider } from '../ai/unified-provider.js';
import { systemPromptManager } from '../ai/system-prompts.js';
import { unifiedContextService } from '../services/unified-context-service.js';
import { logger } from '../lib/logger.js';
import { ProviderConfig, getDefaultProvider } from '../types/ai.js';
import { freshChatSchema } from '../validators/ai.js';
import { executeZAIAction, isMCPConfigured } from '../services/zai-mcp-service.js';
import { executeRtrvrAction } from '../services/rtrvr-service.js';
import { getPrismaClient } from '../lib/database.js';
import * as crypto from 'crypto';

const router = Router();
const prisma = getPrismaClient();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get userId from request
 */
function getUserId(req) {
  if (req.isAuthenticated && req.isAuthenticated() && req.user?.userId) {
    return req.user.userId;
  }
  return req.headers['x-user-id'] || null;
}

/**
 * Get or create virtual user for the request
 */
async function getOrCreateVirtualUser(req) {
  const userId = getUserId(req);
  const fingerprint = req.headers['x-fingerprint'] || `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Try to find existing virtual user by fingerprint
  let virtualUser = await prisma.virtualUser.findUnique({
    where: { fingerprint },
  });
  
  if (!virtualUser) {
    // Create new virtual user
    virtualUser = await prisma.virtualUser.create({
      data: {
        fingerprint,
        displayName: generateDisplayName(),
        fingerprintSignals: {
          userAgent: req.headers['user-agent'],
          ip: req.ip || req.headers['x-forwarded-for'],
        },
        consentGiven: false,
      },
    });
    
    logger.info({ virtualUserId: virtualUser.id, fingerprint }, 'New virtual user created');
  }
  
  // Update last seen
  await prisma.virtualUser.update({
    where: { id: virtualUser.id },
    data: { lastSeenAt: new Date() },
  });
  
  return virtualUser;
}

/**
 * Generate display name for new virtual users
 */
function generateDisplayName() {
  const adjectives = ['Curious', 'Friendly', 'Smart', 'Creative', 'Thoughtful', 'Enthusiastic'];
  const nouns = ['Explorer', 'Learner', 'Thinker', 'Creator', 'Seeker', 'Dreamer'];
  const num = Math.floor(Math.random() * 10000);
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]} #${num}`;
}

/**
 * Parse Z.AI MCP action from message
 */
function parseZAIAction(message) {
  const trimmed = message.trim();
  if (!trimmed.startsWith('!')) return null;

  const parts = trimmed.slice(1).split(/\s+/);
  const action = parts[0]?.toLowerCase();
  const args = parts.slice(1).join(' ');

  const actionMap = {
    websearch: { action: 'websearch', params: { query: args } },
    read: { action: 'readurl', params: { url: args } },
    readurl: { action: 'readurl', params: { url: args } },
    github: { action: 'github', params: parseGithubArgs(args) },
    githubtree: { action: 'github', params: { repo: args, structure: true } },
    githubfile: { action: 'github', params: parseGithubFileArgs(args) },
    rtrvr: { action: 'rtrvr', params: { prompt: args } },
  };

  return actionMap[action] || null;
}

function parseGithubArgs(args) {
  const match = args.match(/^([^/]+\/[^\s]+)?\s*(.*)$/);
  if (!match) return { repo: args, query: '' };
  return { repo: match[1] || '', query: match[2] || '' };
}

function parseGithubFileArgs(args) {
  const match = args.match(/^([^/]+\/[^\s]+)\s+(.+)$/);
  if (!match) return { repo: args, file: '' };
  return { repo: match[1], file: match[2] };
}

// ============================================================================
// CONVERSATION LIFECYCLE
// ============================================================================

/**
 * POST /start - Create a new database-backed conversation
 */
router.post('/start', async (req, res) => {
  try {
    const virtualUser = await getOrCreateVirtualUser(req);
    const {
      provider,
      model,
      title = 'New Conversation',
      personaId = 'default',
      messages: initialMessages = [],
    } = req.body;

    const conversationId = crypto.randomUUID();
    const resolvedProvider = provider || getDefaultProvider();
    const resolvedModel = model || ProviderConfig[resolvedProvider]?.defaultModel;

    // Create conversation in database
    const conversation = await prisma.virtualConversation.create({
      data: {
        id: conversationId,
        virtualUserId: virtualUser.id,
        title,
        provider: resolvedProvider,
        model: resolvedModel,
        metadata: { personaId, source: 'fresh-chat' },
        tags: personaId !== 'default' ? [personaId] : [],
      },
    });

    // Add initial messages if provided
    if (initialMessages.length > 0) {
      const messagesToCreate = initialMessages.map((m, index) => ({
        id: crypto.randomUUID(),
        conversationId,
        role: m.role,
        content: m.content,
        messageIndex: index,
        metadata: { imported: true, timestamp: new Date().toISOString() },
      }));
      
      await prisma.virtualMessage.createMany({ data: messagesToCreate });
      await prisma.virtualConversation.update({
        where: { id: conversationId },
        data: {
          messageCount: initialMessages.length,
          userMessageCount: initialMessages.filter(m => m.role === 'user').length,
          aiMessageCount: initialMessages.filter(m => m.role === 'assistant').length,
        },
      });
    }

    logger.info(
      { conversationId, virtualUserId: virtualUser.id, provider: resolvedProvider, personaId },
      'Fresh conversation started with DB persistence'
    );

    res.json({
      success: true,
      data: {
        conversationId,
        virtualUserId: virtualUser.id,
        provider: resolvedProvider,
        model: resolvedModel,
        personaId,
        title,
      },
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Failed to start conversation');
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /send - Send a message in a database-backed conversation
 */
router.post('/send', async (req, res) => {
  try {
    const { conversationId, message, provider: overrideProvider, model: overrideModel } = req.body;
    
    if (!conversationId || !message) {
      return res.status(400).json({ success: false, error: 'conversationId and message are required' });
    }

    // Get virtual user
    const virtualUser = await getOrCreateVirtualUser(req);

    // Get conversation from database
    const conv = await prisma.virtualConversation.findUnique({
      where: { id: conversationId },
      include: { messages: { orderBy: { messageIndex: 'asc' }, take: 50 } },
    });

    if (!conv) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    // Verify ownership
    if (conv.virtualUserId !== virtualUser.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Handle Z.AI MCP actions
    const zaiAction = parseZAIAction(message);
    if (zaiAction && (isMCPConfigured() || zaiAction.action === 'rtrvr')) {
      try {
        let result = {};
        if (zaiAction.action !== 'rtrvr') {
          result = await executeZAIAction(zaiAction.action, zaiAction.params);
        }

        let responseText = `🔍 **${zaiAction.action.toUpperCase()} Result**\n\n`;

        if (zaiAction.action === 'rtrvr') {
          executeRtrvrAction(zaiAction.params.prompt, virtualUser.id).catch(err => {
            logger.error({ error: err.message }, 'Background Rtrvr action failed');
          });
          responseText += `🚀 **Rtrvr Background Process Started!**\n\nThe AI agent is extracting the conversation securely in the background.`;
          Object.assign(result || {}, { count: 1, query: zaiAction.params.prompt });
        } else if (zaiAction.action === 'websearch') {
          responseText += `Found ${result.count} results for "${result.query}":\n\n`;
          result.results?.slice(0, 5).forEach((r, i) => {
            responseText += `${i + 1}. **${r.title || r.name || 'Result'}**\n   ${r.url || r.link || ''}\n   ${(r.content || r.description || '').slice(0, 200)}...\n\n`;
          });
        } else if (zaiAction.action === 'readurl') {
          responseText += `📄 **${result.title}**\n\n${result.content?.slice(0, 3000) || result.summary || 'No content'}`;
        } else if (zaiAction.action === 'github') {
          if (result.structure) {
            responseText += `📁 **${result.repo}**\n\n`;
            result.structure?.slice(0, 20).forEach((item) => {
              responseText += `${item.type === 'tree' ? '📁' : '📄'} ${item.path}\n`;
            });
          } else if (result.content) {
            responseText += `📄 **${result.file}** from ${result.repo}\n\n\`\`\`\n${result.content?.slice(0, 5000)}\n\`\`\``;
          } else {
            responseText += `Found ${result.count} results in **${result.repo}** for "${result.query}":\n\n`;
            result.results?.slice(0, 5).forEach((r, i) => {
              responseText += `${i + 1}. ${r.title || r.name || 'Result'}\n   ${r.content || r.description || ''}\n\n`;
            });
          }
        }

        // Save ZAI action response to database
        await prisma.virtualMessage.create({
          data: {
            id: crypto.randomUUID(),
            conversationId,
            role: 'assistant',
            content: responseText,
            messageIndex: conv.messageCount,
            metadata: { isZAIAction: true, tool: zaiAction.action },
          },
        });

        await prisma.virtualConversation.update({
          where: { id: conversationId },
          data: { messageCount: { increment: 1 }, aiMessageCount: { increment: 1 }, updatedAt: new Date() },
        });

        return res.json({
          success: true,
          data: { content: responseText, model: 'zai-mcp', provider: 'zai', isZAIAction: true, conversationId },
        });
      } catch (actionError) {
        logger.error({ error: actionError.message, action: zaiAction }, 'Z.AI MCP action failed');
        return res.json({
          success: true,
          data: { content: `❌ Error: ${actionError.message}`, model: 'zai-mcp', provider: 'zai', conversationId },
        });
      }
    }

    // Add user message to database
    await prisma.virtualMessage.create({
      data: {
        id: crypto.randomUUID(),
        conversationId,
        role: 'user',
        content: message,
        messageIndex: conv.messageCount,
      },
    });

    const provider = overrideProvider || conv.provider || getDefaultProvider();
    const model = overrideModel || conv.model || ProviderConfig[provider]?.defaultModel;

    // Get context from unified context service
    let contextResult = null;
    try {
      contextResult = await unifiedContextService.generateContextForChat(conversationId, {
        virtualUserId: virtualUser.id,
        userMessage: message,
        personaId: conv.metadata?.personaId || 'default',
      });
    } catch (ctxError) {
      logger.warn({ error: ctxError.message }, 'Context assembly failed for fresh chat');
    }

    const systemPrompt = contextResult?.systemPrompt || systemPromptManager.buildPrompt({
      mode: 'fresh',
      personaId: conv.metadata?.personaId || 'default',
      userId: virtualUser.id,
    });

    // Build message history for API
    const apiMessages = conv.messages.map((m) => ({ 
      role: m.role, 
      content: typeof m.parts === 'string' ? m.parts : m.content || JSON.stringify(m.parts) 
    }));
    apiMessages.push({ role: 'user', content: message });

    // Generate AI response
    const result = await unifiedProvider.generateCompletion({
      provider,
      model,
      messages: apiMessages,
      system: systemPrompt,
      userId: virtualUser.id,
    });

    // Save assistant response to database
    await prisma.virtualMessage.create({
      data: {
        id: crypto.randomUUID(),
        conversationId,
        role: 'assistant',
        content: result.text,
        messageIndex: conv.messageCount + 1,
        metadata: { model, provider, tokens: result.usage?.totalTokens, contextEngine: contextResult?.engineUsed },
      },
    });

    // Update conversation stats
    await prisma.virtualConversation.update({
      where: { id: conversationId },
      data: {
        messageCount: { increment: 2 },
        userMessageCount: { increment: 1 },
        aiMessageCount: { increment: 1 },
        totalTokens: { increment: result.usage?.totalTokens || 0 },
        updatedAt: new Date(),
        metadata: { ...conv.metadata, lastMessageAt: new Date().toISOString(), lastModel: model },
      },
    });

    // Auto-generate title from first exchange
    if (conv.messageCount === 0 && conv.title === 'New Conversation') {
      await prisma.virtualConversation.update({
        where: { id: conversationId },
        data: { title: message.substring(0, 60) + (message.length > 60 ? '...' : '') },
      });
    }

    res.json({
      success: true,
      data: {
        content: result.text,
        model,
        usage: result.usage,
        finishReason: result.finishReason,
        provider,
        conversationId,
        messageCount: conv.messageCount + 2,
        contextAllocation: contextResult?.layers || null,
        contextStats: contextResult?.stats || null,
      },
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Fresh chat send failed');
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// STREAMING
// ============================================================================

/**
 * POST /stream - Stream a fresh chat response
 */
router.post('/stream', async (req, res) => {
  try {
    const parsed = freshChatSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.errors });
    }

    const { message, provider: requestedProvider, model: requestedModel, personaId, options } = parsed.data;
    const virtualUser = await getOrCreateVirtualUser(req);

    const provider = requestedProvider || getDefaultProvider();
    const model = requestedModel || ProviderConfig[provider]?.defaultModel;

    // Create conversation for streaming
    const conversationId = crypto.randomUUID();
    await prisma.virtualConversation.create({
      data: {
        id: conversationId,
        virtualUserId: virtualUser.id,
        title: message.substring(0, 60) + (message.length > 60 ? '...' : ''),
        provider,
        model,
        metadata: { personaId: personaId || 'default' },
      },
    });

    let contextResult = null;
    try {
      contextResult = await unifiedContextService.generateContextForChat(conversationId, {
        virtualUserId: virtualUser.id,
        userMessage: message,
        personaId: personaId || 'default',
      });
    } catch (ctxError) {
      logger.warn({ error: ctxError.message }, 'Context assembly failed for fresh stream');
    }

    const systemPrompt = contextResult?.systemPrompt || systemPromptManager.buildPrompt({
      mode: 'fresh',
      personaId: personaId || 'default',
      userId: virtualUser.id,
    });

    const messages = [{ role: 'user', content: message }];

    // Save user message
    await prisma.virtualMessage.create({
      data: {
        id: crypto.randomUUID(),
        conversationId,
        role: 'user',
        content: message,
        messageIndex: 0,
      },
    });

    // Use Vercel AI SDK's streaming
    await unifiedProvider.streamCompletion({
      provider,
      model,
      messages,
      system: systemPrompt,
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
      userId: virtualUser.id,
      res,
      onComplete: async (content) => {
        // Save assistant response after streaming completes
        await prisma.virtualMessage.create({
          data: {
            id: crypto.randomUUID(),
            conversationId,
            role: 'assistant',
            content,
            messageIndex: 1,
            metadata: { model, provider },
          },
        });
        await prisma.virtualConversation.update({
          where: { id: conversationId },
          data: { messageCount: 2, userMessageCount: 1, aiMessageCount: 1 },
        });
      },
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Fresh chat stream failed');
    if (!res.headersSent) {
      res.status(error.statusCode || 500).json({ success: false, error: error.message });
    }
  }
});

// ============================================================================
// CONVERSATION MANAGEMENT
// ============================================================================

/**
 * GET /list - List database-backed conversations
 */
router.get('/list', async (req, res) => {
  try {
    const virtualUser = await getOrCreateVirtualUser(req);

    const conversations = await prisma.virtualConversation.findMany({
      where: { virtualUserId: virtualUser.id },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        title: true,
        provider: true,
        model: true,
        metadata: true,
        messageCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: {
        conversations: conversations.map((c) => ({
          id: c.id,
          title: c.title,
          provider: c.provider,
          model: c.model,
          personaId: c.metadata?.personaId,
          messageCount: c.messageCount,
          createdAt: c.createdAt,
          lastActivity: c.updatedAt,
        })),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /:id - Get full conversation with messages
 */
router.get('/:id', async (req, res) => {
  try {
    const virtualUser = await getOrCreateVirtualUser(req);
    const { id } = req.params;

    const conv = await prisma.virtualConversation.findUnique({
      where: { id },
      include: { messages: { orderBy: { messageIndex: 'asc' } } },
    });

    if (!conv) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    if (conv.virtualUserId !== virtualUser.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    res.json({ success: true, data: conv });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * DELETE /:id - Delete a conversation
 */
router.delete('/:id', async (req, res) => {
  try {
    const virtualUser = await getOrCreateVirtualUser(req);
    const { id } = req.params;

    const conv = await prisma.virtualConversation.findUnique({ where: { id } });
    if (!conv) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }

    if (conv.virtualUserId !== virtualUser.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    await prisma.virtualConversation.delete({ where: { id } });
    res.json({ success: true, data: { deleted: true } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /fork - Fork a conversation into a new one
 */
router.post('/fork', async (req, res) => {
  try {
    const { sourceId, prompt, provider, model } = req.body;
    const virtualUser = await getOrCreateVirtualUser(req);

    if (!sourceId) {
      return res.status(400).json({ success: false, error: 'sourceId is required' });
    }

    const source = await prisma.virtualConversation.findUnique({
      where: { id: sourceId },
      include: { messages: { orderBy: { messageIndex: 'asc' } } },
    });

    if (!source) {
      return res.status(404).json({ success: false, error: 'Source conversation not found' });
    }

    if (source.virtualUserId !== virtualUser.id) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const forkedId = crypto.randomUUID();
    const resolvedProvider = provider || source.provider || getDefaultProvider();
    const resolvedModel = model || source.model || ProviderConfig[resolvedProvider]?.defaultModel;

    // Create forked conversation
    await prisma.virtualConversation.create({
      data: {
        id: forkedId,
        virtualUserId: virtualUser.id,
        title: `Fork of: ${source.title}`,
        provider: resolvedProvider,
        model: resolvedModel,
        metadata: { ...source.metadata, forkedFrom: sourceId },
        tags: source.tags,
      },
    });

    // Copy messages
    if (source.messages.length > 0) {
      await prisma.virtualMessage.createMany({
        data: source.messages.map((m) => ({
          id: crypto.randomUUID(),
          conversationId: forkedId,
          role: m.role,
          content: m.content,
          messageIndex: m.messageIndex,
          metadata: { ...m.metadata, forked: true },
        })),
      });
    }

    // If a prompt was provided, send it in the forked conversation
    if (prompt) {
      const result = await unifiedProvider.generateCompletion({
        provider: resolvedProvider,
        model: resolvedModel,
        messages: [
          ...source.messages.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: prompt },
        ],
        system: systemPromptManager.buildPrompt({
          mode: 'fresh',
          personaId: source.metadata?.personaId || 'default',
          userId: virtualUser.id,
        }),
        userId: virtualUser.id,
      });

      await prisma.virtualMessage.create({
        data: {
          id: crypto.randomUUID(),
          conversationId: forkedId,
          role: 'user',
          content: prompt,
          messageIndex: source.messages.length,
        },
      });

      await prisma.virtualMessage.create({
        data: {
          id: crypto.randomUUID(),
          conversationId: forkedId,
          role: 'assistant',
          content: result.text,
          messageIndex: source.messages.length + 1,
          metadata: { model: resolvedModel, provider: resolvedProvider },
        },
      });

      await prisma.virtualConversation.update({
        where: { id: forkedId },
        data: {
          messageCount: source.messages.length + 2,
          userMessageCount: { increment: 1 },
          aiMessageCount: { increment: 1 },
        },
      });
    }

    logger.info({ forkedId, sourceId }, 'Conversation forked');

    res.json({
      success: true,
      data: { conversationId: forkedId, forkedFrom: sourceId, provider: resolvedProvider },
    });
  } catch (error) {
    logger.error({ error: error.message }, 'Fork failed');
    res.status(500).json({ success: false, error: error.message });
  }
});

export { router as aiChatRouter };
