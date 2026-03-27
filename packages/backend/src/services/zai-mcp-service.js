/**
 * ZAI MCP Service
 * Stub implementation for development
 */

export function isMCPConfigured() {
  return false;
}

export async function executeZAIAction(action, params) {
  return { success: false, error: 'ZAI MCP not configured' };
}