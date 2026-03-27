/**
 * Request Tracer - Debug utility for request tracing
 * 
 * Tracks operation timelines, performance bottlenecks, and error propagation
 * for debugging and optimization purposes.
 * 
 * @warning DO NOT USE IN PRODUCTION - Development/Debug only
 */

import { logger } from '../lib/logger';

export interface TraceSpan {
  id: string;
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  children: TraceSpan[];
  metadata: Record<string, any>;
  status: 'pending' | 'success' | 'error';
  error?: Error;
  tags?: string[];
}

export interface TraceSummary {
  traceId: string;
  rootSpan: TraceSpan;
  totalDuration: number;
  spanCount: number;
  errorCount: number;
  slowestSpans: Array<{ name: string; duration: number }>;
  timeline: string;
}

export class RequestTracer {
  private static activeTraces = new Map<string, TraceSpan>();
  private static completedTraces = new Map<string, TraceSummary>();
  private static maxCompletedTraces = 50;

  /**
   * Start a new trace
   */
  static startTrace(
    name: string,
    metadata?: Record<string, any>
  ): string {
    const traceId = `trace_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const rootSpan: TraceSpan = {
      id: traceId,
      name,
      startTime: Date.now(),
      children: [],
      metadata: metadata || {},
      status: 'pending',
      tags: ['root'],
    };

    this.activeTraces.set(traceId, rootSpan);

    logger.debug({ traceId, name }, 'Trace started');

    return traceId;
  }

  /**
   * Start a child span
   */
  static startSpan(
    traceId: string,
    name: string,
    metadata?: Record<string, any>,
    parentId?: string
  ): string {
    const trace = this.activeTraces.get(traceId);

    if (!trace) {
      logger.warn({ traceId }, 'Trace not found');
      return '';
    }

    const spanId = `span_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const span: TraceSpan = {
      id: spanId,
      name,
      startTime: Date.now(),
      children: [],
      metadata: metadata || {},
      status: 'pending',
    };

    // Find parent span
    let parentSpan = trace;
    if (parentId) {
      parentSpan = this.findSpan(trace, parentId) || trace;
    }

    parentSpan.children.push(span);

    return spanId;
  }

  /**
   * End a span
   */
  static endSpan(
    traceId: string,
    spanId?: string,
    error?: Error
  ): void {
    const trace = this.activeTraces.get(traceId);

    if (!trace) {
      logger.warn({ traceId }, 'Trace not found');
      return;
    }

    let span: TraceSpan | undefined = trace;
    if (spanId && spanId !== traceId) {
      span = this.findSpan(trace, spanId);
    }

    if (!span) {
      logger.warn({ traceId, spanId }, 'Span not found');
      return;
    }

    span.endTime = Date.now();
    span.duration = span.endTime - span.startTime;
    span.status = error ? 'error' : 'success';
    if (error) {
      span.error = error;
    }

    logger.debug({ traceId, spanId, duration: span.duration, status: span.status }, 'Span ended');
  }

  /**
   * End the entire trace
   */
  static endTrace(traceId: string, error?: Error): TraceSummary | undefined {
    const trace = this.activeTraces.get(traceId);

    if (!trace) {
      logger.warn({ traceId }, 'Trace not found');
      return undefined;
    }

    this.endSpan(traceId, undefined, error);

    // Generate summary
    const summary = this.generateSummary(trace);

    // Move to completed traces
    this.activeTraces.delete(traceId);
    this.completedTraces.set(traceId, summary);

    // Trim completed traces if needed
    if (this.completedTraces.size > this.maxCompletedTraces) {
      const firstKey = this.completedTraces.keys().next().value;
      if (firstKey) {
        this.completedTraces.delete(firstKey);
      }
    }

    logger.info({ traceId, duration: summary.totalDuration, spans: summary.spanCount }, 'Trace completed');

    return summary;
  }

  /**
   * Find a span by ID within a trace
   */
  private static findSpan(trace: TraceSpan, spanId: string): TraceSpan | undefined {
    if (trace.id === spanId) {
      return trace;
    }

    for (const child of trace.children) {
      const found = this.findSpan(child, spanId);
      if (found) {
        return found;
      }
    }

    return undefined;
  }

  /**
   * Generate trace summary
   */
  private static generateSummary(trace: TraceSpan): TraceSummary {
    const spans: Array<{ span: TraceSpan; duration: number }> = [];

    const collectSpans = (span: TraceSpan) => {
      if (span.duration !== undefined) {
        spans.push({ span, duration: span.duration });
      }
      span.children.forEach(collectSpans);
    };

    collectSpans(trace);

    // Find slowest spans
    const slowestSpans = spans
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 5)
      .map(({ span, duration }) => ({ name: span.name, duration }));

    // Count errors
    const errorCount = spans.filter(s => s.span.status === 'error').length;

    return {
      traceId: trace.id,
      rootSpan: trace,
      totalDuration: trace.duration || 0,
      spanCount: spans.length,
      errorCount,
      slowestSpans,
      timeline: this.generateTimeline(trace),
    };
  }

  /**
   * Generate ASCII timeline visualization
   */
  static generateTimeline(trace: TraceSpan, depth: number = 0): string {
    const lines: string[] = [];
    const indent = '  '.repeat(depth);
    const barWidth = 30;

    const formatDuration = (ms: number): string => {
      if (ms < 1) return `${(ms * 1000).toFixed(0)}μs`;
      if (ms < 1000) return `${ms.toFixed(1)}ms`;
      return `${(ms / 1000).toFixed(2)}s`;
    };

    if (trace.duration !== undefined) {
      const filledBars = Math.min(
        barWidth,
        Math.max(1, Math.round((trace.duration / 1000) * barWidth))
      );
      const statusIcon = trace.status === 'error' ? '❌' : trace.status === 'success' ? '✅' : '⏳';

      lines.push(
        `${indent}${statusIcon} ${trace.name.padEnd(30)} ` +
        `[${'█'.repeat(filledBars)}${'░'.repeat(barWidth - filledBars)}] ` +
        `${formatDuration(trace.duration)}`
      );

      // Add metadata if present
      if (Object.keys(trace.metadata).length > 0) {
        const metaLines = Object.entries(trace.metadata)
          .slice(0, 3)
          .map(([key, value]) => `${indent}    ${key}: ${JSON.stringify(value)}`);
        lines.push(...metaLines);
      }
    } else {
      lines.push(`${indent}⏳ ${trace.name} (incomplete)`);
    }

    // Process children
    trace.children.forEach(child => {
      lines.push(...this.generateTimeline(child, depth + 1));
    });

    return lines.join('\n');
  }

  /**
   * Get active trace
   */
  static getTrace(traceId: string): TraceSpan | undefined {
    return this.activeTraces.get(traceId);
  }

  /**
   * Get completed trace summary
   */
  static getSummary(traceId: string): TraceSummary | undefined {
    return this.completedTraces.get(traceId);
  }

  /**
   * Export trace as JSON
   */
  static exportTrace(traceId: string): string | undefined {
    const trace = this.activeTraces.get(traceId) || this.completedTraces.get(traceId)?.rootSpan;

    if (!trace) {
      return undefined;
    }

    return JSON.stringify(trace, null, 2);
  }

  /**
   * Get all active traces
   */
  static getActiveTraces(): string[] {
    return Array.from(this.activeTraces.keys());
  }

  /**
   * Clear all traces
   */
  static clearAll(): void {
    this.activeTraces.clear();
    this.completedTraces.clear();
    logger.info('All traces cleared');
  }

  /**
   * Wrap a function with tracing
   */
  static async traceAsync<T>(
    traceId: string,
    name: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    const spanId = this.startSpan(traceId, name, metadata);

    try {
      const result = await fn();
      this.endSpan(traceId, spanId);
      return result;
    } catch (error) {
      this.endSpan(traceId, spanId, error as Error);
      throw error;
    }
  }

  /**
   * Get performance report
   */
  static getPerformanceReport(): string {
    const lines: string[] = [];

    lines.push('═'.repeat(80));
    lines.push('PERFORMANCE REPORT');
    lines.push('═'.repeat(80));

    const summaries = Array.from(this.completedTraces.values());

    if (summaries.length === 0) {
      lines.push('No completed traces available');
      return lines.join('\n');
    }

    // Overall stats
    const totalTraces = summaries.length;
    const avgDuration = summaries.reduce((sum, s) => sum + s.totalDuration, 0) / totalTraces;
    const totalErrors = summaries.reduce((sum, s) => sum + s.errorCount, 0);

    lines.push(`Total Traces: ${totalTraces}`);
    lines.push(`Average Duration: ${avgDuration.toFixed(2)}ms`);
    lines.push(`Total Errors: ${totalErrors}`);
    lines.push('');

    // Slowest traces
    lines.push('─'.repeat(80));
    lines.push('SLOWEST TRACES');
    lines.push('─'.repeat(80));

    const slowest = summaries
      .sort((a, b) => b.totalDuration - a.totalDuration)
      .slice(0, 5);

    slowest.forEach((summary, i) => {
      lines.push(`${i + 1}. ${summary.traceId} - ${summary.totalDuration.toFixed(2)}ms (${summary.spanCount} spans)`);
    });

    lines.push('');

    // Common bottlenecks
    lines.push('─'.repeat(80));
    lines.push('COMMON BOTTLENECKS');
    lines.push('─'.repeat(80));

    const spanDurations: Record<string, number[]> = {};

    summaries.forEach(summary => {
      const collectSpans = (span: TraceSpan) => {
        if (span.duration !== undefined) {
          if (!spanDurations[span.name]) {
            spanDurations[span.name] = [];
          }
          spanDurations[span.name].push(span.duration);
        }
        span.children.forEach(collectSpans);
      };
      collectSpans(summary.rootSpan);
    });

    const bottlenecks = Object.entries(spanDurations)
      .map(([name, durations]) => ({
        name,
        avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
        count: durations.length,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 5);

    bottlenecks.forEach((bottleneck, i) => {
      lines.push(`${i + 1}. ${bottleneck.name} - avg ${bottleneck.avgDuration.toFixed(2)}ms (${bottleneck.count} calls)`);
    });

    lines.push('═'.repeat(80));

    return lines.join('\n');
  }
}
