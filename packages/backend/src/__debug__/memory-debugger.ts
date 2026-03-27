/**
 * Memory Debugger - Debug utility for memory operations
 * 
 * Traces memory retrieval, conflict detection, and ACU relationships
 * for debugging and optimization purposes.
 * 
 * @warning DO NOT USE IN PRODUCTION - Development/Debug only
 */

import { getPrismaClient } from '../lib/database';
import { createEmbeddingService } from '../context/utils/zai-service';
import { ConflictDetectionService } from '../services/memory-conflict-detection';
import { acuDeduplicationService } from '../services/acu-deduplication-service';
import { logger } from '../lib/logger';

export interface MemoryTrace {
  id: string;
  userId: string;
  content: string;
  category: string;
  memoryType: string;
  importance: number;
  embedding?: number[];
  similarityScore?: number;
  retrievalPath: string[];
  conflicts: Array<{
    memoryId: string;
    conflictType: string;
    confidence: number;
  }>;
  acuLinks: Array<{
    acuId: string;
    relationship: string;
  }>;
  metadata: Record<string, any>;
}

export interface ConflictAnalysis {
  userId: string;
  totalMemories: number;
  totalConflicts: number;
  conflictsByType: Record<string, number>;
  highConfidenceConflicts: Array<{
    memory1Id: string;
    memory1Content: string;
    memory2Id: string;
    memory2Content: string;
    conflictType: string;
    confidence: number;
  }>;
  recommendations: string[];
}

export class MemoryDebugger {
  private static prisma = getPrismaClient();
  private static embeddingService = createEmbeddingService();
  private static conflictService = new ConflictDetectionService();

  /**
   * Trace memory retrieval for a query
   */
  static async traceMemoryRetrieval(
    userId: string,
    query: string,
    options: {
      limit?: number;
      minSimilarity?: number;
      includeEmbeddings?: boolean;
    } = {}
  ): Promise<MemoryTrace[]> {
    const traces: MemoryTrace[] = [];
    const startTime = Date.now();

    try {
      // Generate query embedding
      const queryEmbedding = await this.embeddingService.embed(query);

      // Retrieve memories using semantic search
      const memories = await this.prisma.memory.findMany({
        where: {
          userId,
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: options.limit || 20,
      });

      logger.debug({ count: memories.length }, 'Retrieved memories for tracing');

      // Calculate similarity for each memory
      for (const memory of memories) {
        const trace: MemoryTrace = {
          id: memory.id,
          userId: memory.userId,
          content: memory.content,
          category: memory.category,
          memoryType: memory.memoryType,
          importance: memory.importance,
          retrievalPath: ['query_embedding', 'similarity_calculation', 'ranking'],
          conflicts: [],
          acuLinks: [],
          metadata: {
            createdAt: memory.createdAt,
            updatedAt: memory.updatedAt,
          },
        };

        // Calculate similarity if embedding exists
        if (memory.embedding && Array.isArray(memory.embedding)) {
          const similarity = this.cosineSimilarity(queryEmbedding, memory.embedding);
          trace.similarityScore = similarity;

          if (options.includeEmbeddings) {
            trace.embedding = memory.embedding;
          }

          // Only include if above threshold
          if (similarity >= (options.minSimilarity || 0)) {
            // Check for conflicts
            const conflicts = await this.conflictService.checkForConflicts(
              userId,
              memory.content,
              memory.category,
              memory.id
            );

            trace.conflicts = conflicts.map(c => ({
              memoryId: c.conflictingMemoryIds[0],
              conflictType: c.conflictType,
              confidence: c.confidence,
            }));

            // Find related ACUs
            const acus = await this.prisma.atomicChatUnit.findMany({
              where: {
                OR: [
                  { memoryId: memory.id },
                  { content: { contains: memory.content.substring(0, 50) } },
                ],
                authorDid: userId,
              },
              take: 5,
            });

            trace.acuLinks = acus.map(acu => ({
              acuId: acu.id,
              relationship: acu.memoryId === memory.id ? 'direct' : 'semantic',
            }));

            traces.push(trace);
          }
        }
      }

      // Sort by similarity
      traces.sort((a, b) => (b.similarityScore || 0) - (a.similarityScore || 0));

      const duration = Date.now() - startTime;
      logger.info({ duration, traceCount: traces.length }, 'Memory retrieval trace complete');

      return traces;
    } catch (error) {
      logger.error({ error }, 'Memory retrieval tracing failed');
      throw error;
    }
  }

  /**
   * Analyze all memory conflicts for a user
   */
  static async analyzeConflicts(userId: string): Promise<ConflictAnalysis> {
    const startTime = Date.now();

    try {
      // Get all memories for user
      const memories = await this.prisma.memory.findMany({
        where: {
          userId,
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      const conflictsByType: Record<string, number> = {};
      const highConfidenceConflicts: ConflictAnalysis['highConfidenceConflicts'] = [];
      const recommendations: string[] = [];

      // Check each memory for conflicts
      for (let i = 0; i < memories.length; i++) {
        const memory1 = memories[i];
        const conflicts = await this.conflictService.checkForConflicts(
          userId,
          memory1.content,
          memory1.category,
          memory1.id
        );

        for (const conflict of conflicts) {
          // Count by type
          conflictsByType[conflict.conflictType] = (conflictsByType[conflict.conflictType] || 0) + 1;

          // Track high confidence conflicts
          if (conflict.confidence > 0.7) {
            const memory2 = await this.prisma.memory.findUnique({
              where: { id: conflict.conflictingMemoryIds[0] },
            });

            if (memory2) {
              highConfidenceConflicts.push({
                memory1Id: memory1.id,
                memory1Content: memory1.content,
                memory2Id: memory2.id,
                memory2Content: memory2.content,
                conflictType: conflict.conflictType,
                confidence: conflict.confidence,
              });
            }
          }
        }
      }

      // Generate recommendations
      if (highConfidenceConflicts.length > 0) {
        recommendations.push(
          `Found ${highConfidenceConflicts.length} high-confidence conflicts that should be reviewed`
        );
      }

      if (conflictsByType['contradiction'] > 5) {
        recommendations.push(
          'Many contradiction conflicts detected - consider implementing memory versioning'
        );
      }

      if (conflictsByType['outdated'] > 3) {
        recommendations.push(
          'Multiple outdated memories detected - consider implementing auto-archival'
        );
      }

      const duration = Date.now() - startTime;
      logger.info({ duration, conflictCount: highConfidenceConflicts.length }, 'Conflict analysis complete');

      return {
        userId,
        totalMemories: memories.length,
        totalConflicts: highConfidenceConflicts.length,
        conflictsByType,
        highConfidenceConflicts,
        recommendations,
      };
    } catch (error) {
      logger.error({ error }, 'Conflict analysis failed');
      throw error;
    }
  }

  /**
   * Visualize memory graph as SVG
   */
  static async visualizeMemoryGraph(
    userId: string,
    options: { width?: number; height?: number } = {}
  ): Promise<string> {
    const width = options.width || 800;
    const height = options.height || 600;

    try {
      // Get memories
      const memories = await this.prisma.memory.findMany({
        where: { userId, deletedAt: null },
        take: 50,
      });

      // Get conflicts
      const conflictAnalysis = await this.analyzeConflicts(userId);

      // Generate SVG
      const svgLines: string[] = [];
      svgLines.push(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">`);
      svgLines.push(`  <rect width="100%" height="100%" fill="#0f172a"/>`);
      svgLines.push(`  <text x="20" y="40" fill="#e2e8f0" font-size="20" font-family="monospace">Memory Graph - ${memories.length} memories</text>`);

      // Position memories in a circle
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) / 2 - 100;

      memories.forEach((memory, index) => {
        const angle = (2 * Math.PI * index) / memories.length;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        // Color by category
        const colors: Record<string, string> = {
          skills: '#3b82f6',
          preferences: '#8b5cf6',
          employment: '#10b981',
          education: '#f59e0b',
          default: '#64748b',
        };
        const color = colors[memory.category] || colors.default;

        // Draw node
        svgLines.push(`  <circle cx="${x}" cy="${y}" r="8" fill="${color}" opacity="0.8"/>`);
        svgLines.push(`  <text x="${x + 12}" y="${y + 4}" fill="#94a3b8" font-size="10" font-family="monospace">${memory.category}</text>`);
      });

      // Draw conflict lines
      conflictAnalysis.highConfidenceConflicts.slice(0, 10).forEach((conflict, index) => {
        const idx1 = memories.findIndex(m => m.id === conflict.memory1Id);
        const idx2 = memories.findIndex(m => m.id === conflict.memory2Id);

        if (idx1 !== -1 && idx2 !== -1) {
          const angle1 = (2 * Math.PI * idx1) / memories.length;
          const angle2 = (2 * Math.PI * idx2) / memories.length;

          const x1 = centerX + radius * Math.cos(angle1);
          const y1 = centerY + radius * Math.sin(angle1);
          const x2 = centerX + radius * Math.cos(angle2);
          const y2 = centerY + radius * Math.sin(angle2);

          const strokeColor = conflict.conflictType === 'contradiction' ? '#ef4444' : '#f59e0b';
          svgLines.push(`  <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${strokeColor}" stroke-width="2" opacity="0.5"/>`);
        }
      });

      // Legend
      svgLines.push(`  <rect x="20" y="${height - 120}" width="150" height="100" fill="#1e293b" stroke="#475569"/>`);
      svgLines.push(`  <text x="30" y="${height - 100}" fill="#e2e8f0" font-size="12" font-family="monospace">Legend:</text>`);
      svgLines.push(`  <circle cx="40" cy="${height - 80}" r="5" fill="#3b82f6"/>`);
      svgLines.push(`  <text x="55" y="${height - 76}" fill="#94a3b8" font-size="10" font-family="monospace">Skills</text>`);
      svgLines.push(`  <circle cx="40" cy="${height - 60}" r="5" fill="#8b5cf6"/>`);
      svgLines.push(`  <text x="55" y="${height - 56}" fill="#94a3b8" font-size="10" font-family="monospace">Preferences</text>`);
      svgLines.push(`  <line x1="30" y1="${height - 35}" x2="50" y2="${height - 35}" stroke="#ef4444" stroke-width="2"/>`);
      svgLines.push(`  <text x="55" y="${height - 31}" fill="#94a3b8" font-size="10" font-family="monospace">Contradiction</text>`);

      svgLines.push(`</svg>`);

      return svgLines.join('\n');
    } catch (error) {
      logger.error({ error }, 'Memory graph visualization failed');
      throw error;
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private static cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));

    if (magnitudeA === 0 || magnitudeB === 0) {
      return 0;
    }

    return dotProduct / (magnitudeA * magnitudeB);
  }

  /**
   * Export memory trace as JSON
   */
  static exportTrace(traces: MemoryTrace[]): string {
    return JSON.stringify(traces, null, 2);
  }
}
