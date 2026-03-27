/**
 * Context Inspector - Debug utility for context assembly
 * 
 * Provides detailed inspection of the context assembly pipeline
 * for debugging and optimization purposes.
 * 
 * @warning DO NOT USE IN PRODUCTION - Development/Debug only
 */

import { DynamicContextAssembler } from '../context-assembler';
import { BudgetVisualizer } from './budget-visualizer';
import { logger } from '../../lib/logger';

export interface LayerInspection {
  name: string;
  itemsRetrieved: number;
  tokensUsed: number;
  retrievalTime: number;
  cacheHit: boolean;
  similarityScores?: number[];
}

export interface BudgetInspection {
  totalAvailable: number;
  totalUsed: number;
  remaining: number;
  breakdown: Record<string, number>;
  efficiency: number;
}

export interface ContextInspectionResult {
  assemblyId: string;
  timestamp: number;
  duration: number;
  userId: string;
  conversationId?: string;
  message: string;
  layers: LayerInspection[];
  budget: BudgetInspection;
  topics: Array<{ label: string; confidence: number; slug: string }>;
  entities: Array<{ name: string; type: string; confidence: number }>;
  memories: Array<{ id: string; content: string; similarity: number }>;
  warnings: string[];
  recommendations: string[];
  systemPrompt?: string;
}

export class ContextInspector {
  private static history: ContextInspectionResult[] = [];
  private static maxHistory = 100;

  /**
   * Inspect context assembly for a given user message
   */
  static async inspect(
    assembler: DynamicContextAssembler,
    userId: string,
    message: string,
    options: {
      conversationId?: string;
      verbose?: boolean;
      includeEmbeddings?: boolean;
    } = {}
  ): Promise<ContextInspectionResult> {
    const startTime = Date.now();
    const assemblyId = `inspect_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const warnings: string[] = [];
    const recommendations: string[] = [];

    try {
      // Execute context assembly with instrumentation
      const result = await assembler.assemble({
        userId,
        conversationId: options.conversationId,
        userMessage: message,
        modelId: 'glm-4.7-flash',
      });

      const duration = Date.now() - startTime;

      // Analyze layers
      const layerInspections = this.analyzeLayers(result, warnings, recommendations);

      // Analyze budget efficiency
      const budgetInspection = this.analyzeBudget(result, warnings, recommendations);

      // Build inspection result
      const inspectionResult: ContextInspectionResult = {
        assemblyId,
        timestamp: Date.now(),
        duration,
        userId,
        conversationId: options.conversationId,
        message,
        layers: layerInspections,
        budget: budgetInspection,
        topics: result.metadata?.topics || [],
        entities: result.metadata?.entities || [],
        memories: result.context?.memories?.slice(0, 10).map(m => ({
          id: m.id,
          content: m.content.substring(0, 100),
          similarity: (m as any).similarity || 0,
        })) || [],
        warnings,
        recommendations,
        systemPrompt: options.verbose ? result.systemPrompt : undefined,
      };

      // Add to history
      this.addToHistory(inspectionResult);

      return inspectionResult;
    } catch (error) {
      logger.error({ error, assemblyId }, 'Context inspection failed');
      throw error;
    }
  }

  private static analyzeLayers(
    result: any,
    warnings: string[],
    recommendations: string[]
  ): LayerInspection[] {
    const layers: LayerInspection[] = [];

    if (!result.metadata?.layerStats) {
      return layers;
    }

    for (const [layerName, stats] of Object.entries<any>(result.metadata.layerStats)) {
      const layer: LayerInspection = {
        name: layerName,
        itemsRetrieved: stats.itemsRetrieved || 0,
        tokensUsed: stats.tokensUsed || 0,
        retrievalTime: stats.retrievalTime || 0,
        cacheHit: stats.cacheHit || false,
      };

      layers.push(layer);

      // Check for warnings
      if (layer.tokensUsed > 1000) {
        warnings.push(`Layer ${layerName} used excessive tokens (${layer.tokensUsed})`);
      }

      if (layer.retrievalTime > 2000) {
        warnings.push(`Layer ${layerName} had slow retrieval (${layer.retrievalTime}ms)`);
        recommendations.push(`Consider caching for layer ${layerName}`);
      }

      if (layer.itemsRetrieved === 0 && layer.name.includes('topic')) {
        recommendations.push('Topic detection returned no results - consider adjusting similarity threshold');
      }
    }

    return layers;
  }

  private static analyzeBudget(
    result: any,
    warnings: string[],
    recommendations: string[]
  ): BudgetInspection {
    const budget = result.budget;

    if (!budget) {
      return {
        totalAvailable: 0,
        totalUsed: 0,
        remaining: 0,
        breakdown: {},
        efficiency: 0,
      };
    }

    const efficiency = budget.totalUsed / budget.totalAvailable;

    const inspection: BudgetInspection = {
      totalAvailable: budget.totalAvailable,
      totalUsed: budget.totalUsed,
      remaining: budget.remaining || budget.totalAvailable - budget.totalUsed,
      breakdown: budget.breakdown || {},
      efficiency,
    };

    // Check for warnings
    if (efficiency > 0.95) {
      warnings.push('Budget usage is above 95% - risk of context truncation');
      recommendations.push('Consider increasing maxContextTokens or reducing layer weights');
    }

    if (efficiency < 0.5) {
      recommendations.push('Budget usage is low - could increase context depth');
    }

    return inspection;
  }

  private static addToHistory(result: ContextInspectionResult): void {
    this.history.push(result);

    // Trim history if exceeds max
    if (this.history.length > this.maxHistory) {
      this.history = this.history.slice(-this.maxHistory);
    }
  }

  /**
   * Get inspection history
   */
  static getHistory(): ContextInspectionResult[] {
    return this.history;
  }

  /**
   * Get last inspection
   */
  static getLast(): ContextInspectionResult | undefined {
    return this.history[this.history.length - 1];
  }

  /**
   * Clear inspection history
   */
  static clearHistory(): void {
    this.history = [];
  }

  /**
   * Export inspection report as JSON
   */
  static exportReport(): string {
    return JSON.stringify(this.history, null, 2);
  }

  /**
   * Generate ASCII visualization of inspection
   */
  static visualize(result: ContextInspectionResult): string {
    const lines: string[] = [];

    lines.push('═'.repeat(80));
    lines.push(`CONTEXT ASSEMBLY INSPECTION - ${result.assemblyId}`);
    lines.push('═'.repeat(80));
    lines.push(`Timestamp: ${new Date(result.timestamp).toISOString()}`);
    lines.push(`Duration: ${result.duration}ms`);
    lines.push(`User: ${result.userId}`);
    lines.push(`Message: "${result.message.substring(0, 50)}${result.message.length > 50 ? '...' : ''}"`);
    lines.push('');

    // Budget visualization
    lines.push('─'.repeat(80));
    lines.push('BUDGET');
    lines.push('─'.repeat(80));
    lines.push(`Total: ${result.budget.totalAvailable} tokens`);
    lines.push(`Used: ${result.budget.totalUsed} tokens (${(result.budget.efficiency * 100).toFixed(1)}%)`);
    lines.push(`Remaining: ${result.budget.remaining} tokens`);
    lines.push('');

    // Layer breakdown
    lines.push('─'.repeat(80));
    lines.push('LAYERS');
    lines.push('─'.repeat(80));

    for (const layer of result.layers) {
      const bar = '█'.repeat(Math.floor((layer.tokensUsed / result.budget.totalAvailable) * 40));
      lines.push(`${layer.name.padEnd(25)} ${bar.padEnd(40)} ${layer.tokensUsed} tokens (${layer.retrievalTime}ms)`);
    }

    lines.push('');

    // Topics
    if (result.topics.length > 0) {
      lines.push('─'.repeat(80));
      lines.push('TOPICS DETECTED');
      lines.push('─'.repeat(80));
      for (const topic of result.topics) {
        lines.push(`  • ${topic.label} (${(topic.confidence * 100).toFixed(0)}%)`);
      }
      lines.push('');
    }

    // Warnings
    if (result.warnings.length > 0) {
      lines.push('─'.repeat(80));
      lines.push('⚠ WARNINGS');
      lines.push('─'.repeat(80));
      for (const warning of result.warnings) {
        lines.push(`  ⚠ ${warning}`);
      }
      lines.push('');
    }

    // Recommendations
    if (result.recommendations.length > 0) {
      lines.push('─'.repeat(80));
      lines.push('💡 RECOMMENDATIONS');
      lines.push('─'.repeat(80));
      for (const rec of result.recommendations) {
        lines.push(`  💡 ${rec}`);
      }
      lines.push('');
    }

    lines.push('═'.repeat(80));

    return lines.join('\n');
  }
}
