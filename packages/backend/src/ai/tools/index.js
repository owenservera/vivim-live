// apps/server/src/ai/tools/index.js
// ═══════════════════════════════════════════════════════════════════════════
// AI TOOL REGISTRY - Centralized tool management
// ═══════════════════════════════════════════════════════════════════════════

import { buildSecondBrainTools, getToolDescriptions } from './second-brain-tools.js';
import { logger } from '../../lib/logger.js';

/**
 * Tool Sets - Curated groups of tools for different scenarios
 */
export const TOOL_SETS = {
  /**
   * Core second-brain tools - always available in context mode
   */
  secondBrain: 'second-brain',

  /**
   * Full toolkit - all tools available
   */
  full: 'full',

  /**
   * Minimal - just search and recall for lightweight interactions
   */
  minimal: 'minimal',
};

/**
 * Build tools for a given configuration
 */
export function buildToolkit({ userId, conversationId, toolSet = 'full' }) {
  const tools = {};

  if (toolSet === 'full' || toolSet === 'second-brain') {
    const brainTools = buildSecondBrainTools(userId, conversationId);
    Object.assign(tools, brainTools);
  }

  if (toolSet === 'minimal') {
    const brainTools = buildSecondBrainTools(userId, conversationId);
    tools.searchKnowledge = brainTools.searchKnowledge;
    tools.recallConversation = brainTools.recallConversation;
  }

  logger.debug(
    {
      userId,
      toolSet,
      toolCount: Object.keys(tools).length,
      tools: Object.keys(tools),
    },
    'Toolkit built'
  );

  return tools;
}

/**
 * Get descriptions of tools for system prompt
 */
export function getToolkitDescriptions(toolSet = 'full') {
  const descriptions = getToolDescriptions();

  if (toolSet === 'minimal') {
    return descriptions.filter((d) => ['searchKnowledge', 'recallConversation'].includes(d.name));
  }

  return descriptions;
}

export { buildSecondBrainTools, getToolDescriptions };
