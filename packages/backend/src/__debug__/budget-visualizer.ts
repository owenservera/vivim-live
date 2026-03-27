/**
 * Budget Visualizer - Debug utility for token budget visualization
 * 
 * Creates visual representations of token allocation and usage
 * for debugging and optimization purposes.
 * 
 * @warning DO NOT USE IN PRODUCTION - Development/Debug only
 */

import { logger } from '../lib/logger';

export interface BudgetVisualization {
  totalBudget: number;
  layers: Array<{
    name: string;
    allocated: number;
    used: number;
    percentage: number;
    items: number;
    efficiency: number;
  }>;
  overflow: Array<{
    layer: string;
    requested: number;
    granted: number;
    reason: string;
  }>;
  asciiChart: string;
  recommendations: string[];
}

export class BudgetVisualizer {
  /**
   * Visualize token budget from context assembly
   */
  static visualize(budget: any, layerStats?: any): BudgetVisualization {
    const layers: BudgetVisualization['layers'] = [];
    const overflow: BudgetVisualization['overflow'] = [];
    const recommendations: string[] = [];

    const totalBudget = budget.totalAvailable || 8000;
    const totalUsed = budget.totalUsed || 0;

    // Process layer breakdown
    if (layerStats) {
      for (const [layerName, stats] of Object.entries<any>(layerStats)) {
        const allocated = stats.allocated || 0;
        const used = stats.tokensUsed || 0;
        const items = stats.itemsRetrieved || 0;
        const requested = stats.requested || used;

        const layer = {
          name: layerName,
          allocated,
          used,
          percentage: (used / totalBudget) * 100,
          items,
          efficiency: allocated > 0 ? (used / allocated) * 100 : 0,
        };

        layers.push(layer);

        // Check for overflow
        if (requested > allocated && allocated > 0) {
          overflow.push({
            layer: layerName,
            requested,
            granted: allocated,
            reason: 'Layer exceeded allocated budget',
          });
        }

        // Generate recommendations
        if (layer.efficiency < 50 && allocated > 0) {
          recommendations.push(
            `Layer ${layerName} is underutilized (${layer.efficiency.toFixed(0)}% efficiency) - consider reducing allocation`
          );
        }

        if (layer.efficiency > 95) {
          recommendations.push(
            `Layer ${layerName} is at capacity - consider increasing allocation or optimizing retrieval`
          );
        }
      }
    }

    // Sort layers by token usage
    layers.sort((a, b) => b.used - a.used);

    // Generate ASCII chart
    const asciiChart = this.generateASCIIChart({ totalBudget, totalUsed, layers });

    return {
      totalBudget,
      layers,
      overflow,
      asciiChart,
      recommendations,
    };
  }

  /**
   * Generate ASCII chart for CLI display
   */
  private static generateASCIIChart(data: {
    totalBudget: number;
    totalUsed: number;
    layers: BudgetVisualization['layers'];
  }): string {
    const lines: string[] = [];
    const barWidth = 40;

    lines.push('╔' + '═'.repeat(78) + '╗');
    lines.push('║' + ' TOKEN BUDGET VISUALIZATION '.padEnd(39) + '║' + ' '.repeat(39) + '║');
    lines.push('╠' + '═'.repeat(78) + '╣');

    // Overall budget
    const overallPercent = (data.totalUsed / data.totalBudget) * 100;
    const filledBars = Math.round((overallPercent / 100) * barWidth);
    const emptyBars = barWidth - filledBars;

    lines.push('║ Total Budget:'.padEnd(20) +
      `[${'█'.repeat(filledBars)}${'░'.repeat(emptyBars)}] ` +
      `${data.totalUsed}/${data.totalBudget} tokens (${overallPercent.toFixed(1)}%)`.padEnd(50) + '║');

    lines.push('╠' + '═'.repeat(78) + '╣');
    lines.push('║ Layer Breakdown:'.padEnd(79) + '║');
    lines.push('╠' + '═'.repeat(78) + '╣');

    // Layer breakdown
    for (const layer of data.layers) {
      const layerPercent = (layer.used / data.totalBudget) * 100;
      const layerFilled = Math.round((layerPercent / 100) * barWidth);
      const layerEmpty = barWidth - layerFilled;

      const layerName = layer.name.substring(0, 18).padEnd(18);
      const layerInfo = `${layer.used} tokens`.padEnd(12);

      lines.push('║ ' + layerName + ' ' +
        `[${'█'.repeat(layerFilled)}${'░'.repeat(layerEmpty)}] ` +
        layerInfo.padEnd(43) + '║');
    }

    lines.push('╠' + '═'.repeat(78) + '╣');

    // Efficiency metrics
    const avgEfficiency = data.layers.length > 0
      ? data.layers.reduce((sum, l) => sum + l.efficiency, 0) / data.layers.length
      : 0;

    lines.push('║ Average Layer Efficiency:'.padEnd(30) +
      `${avgEfficiency.toFixed(1)}%`.padEnd(49) + '║');

    // Warnings
    if (overallPercent > 90) {
      lines.push('╠' + '═'.repeat(78) + '╣');
      lines.push('║ ⚠ WARNING: Budget usage above 90% - risk of context truncation'.padEnd(79) + '║');
    }

    lines.push('╚' + '═'.repeat(78) + '╝');

    return lines.join('\n');
  }

  /**
   * Generate HTML visualization
   */
  static toHTML(viz: BudgetVisualization): string {
    const htmlLines: string[] = [];

    htmlLines.push(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Budget Visualization</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #0f172a;
            color: #e2e8f0;
            padding: 20px;
          }
          .container {
            max-width: 900px;
            margin: 0 auto;
          }
          h1 {
            color: #f1f5f9;
            border-bottom: 2px solid #475569;
            padding-bottom: 10px;
          }
          .budget-overview {
            background: #1e293b;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
          }
          .budget-bar {
            height: 30px;
            background: #334155;
            border-radius: 4px;
            overflow: hidden;
            margin: 10px 0;
          }
          .budget-fill {
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #8b5cf6);
            transition: width 0.3s;
          }
          .layer {
            background: #1e293b;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 10px;
          }
          .layer-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .layer-bar {
            height: 20px;
            background: #334155;
            border-radius: 4px;
            overflow: hidden;
          }
          .warning {
            background: #fef2f2;
            color: #dc2626;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
            border-left: 4px solid #dc2626;
          }
          .recommendation {
            background: #f0fdf4;
            color: #16a34a;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
            border-left: 4px solid #16a34a;
          }
          .overflow {
            background: #fffbeb;
            color: #d97706;
            padding: 10px;
            border-radius: 4px;
            margin: 10px 0;
            border-left: 4px solid #d97706;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📊 Token Budget Visualization</h1>
          
          <div class="budget-overview">
            <h2>Overall Budget</h2>
            <p>Total: ${viz.totalBudget.toLocaleString()} tokens</p>
            <div class="budget-bar">
              <div class="budget-fill" style="width: ${(viz.layers.reduce((sum, l) => sum + l.used, 0) / viz.totalBudget) * 100}%"></div>
            </div>
            <p>Used: ${viz.layers.reduce((sum, l) => sum + l.used, 0).toLocaleString()} tokens</p>
          </div>
    `);

    // Layers
    htmlLines.push('<h2>Layer Breakdown</h2>');
    for (const layer of viz.layers) {
      htmlLines.push(`
        <div class="layer">
          <div class="layer-header">
            <strong>${layer.name}</strong>
            <span>${layer.used.toLocaleString()} / ${layer.allocated.toLocaleString()} tokens</span>
          </div>
          <div class="layer-bar">
            <div class="budget-fill" style="width: ${(layer.used / viz.totalBudget) * 100}%; background: linear-gradient(90deg, #3b82f6, #10b981);"></div>
          </div>
          <p style="margin-top: 8px; font-size: 12px; color: #94a3b8;">
            ${layer.items} items • ${(layer.used / viz.totalBudget) * 100}% of total • ${layer.efficiency.toFixed(0)}% efficiency
          </p>
        </div>
      `);
    }

    // Overflow
    if (viz.overflow.length > 0) {
      htmlLines.push('<h2>⚠️ Overflow</h2>');
      for (const of of viz.overflow) {
        htmlLines.push(`
          <div class="overflow">
            <strong>${of.layer}</strong>: Requested ${of.requested.toLocaleString()} tokens, granted ${of.granted.toLocaleString()}
            <br><small>${of.reason}</small>
          </div>
        `);
      }
    }

    // Recommendations
    if (viz.recommendations.length > 0) {
      htmlLines.push('<h2>💡 Recommendations</h2>');
      for (const rec of viz.recommendations) {
        htmlLines.push(`<div class="recommendation">${rec}</div>`);
      }
    }

    htmlLines.push(`
        </div>
      </body>
      </html>
    `);

    return htmlLines.join('\n');
  }

  /**
   * Export visualization as JSON
   */
  static exportJSON(viz: BudgetVisualization): string {
    return JSON.stringify(viz, null, 2);
  }

  /**
   * Log visualization to console
   */
  static log(viz: BudgetVisualization): void {
    logger.info('\n' + viz.asciiChart);

    if (viz.recommendations.length > 0) {
      logger.info('\nRecommendations:');
      viz.recommendations.forEach(rec => logger.info('  • ' + rec));
    }
  }
}
