/**
 * Behavioral Signal Capture Service
 * 
 * Captures and processes behavioral signals for identity scoring:
 * - Typing rhythm (keystroke timing)
 * - Navigation patterns (page transitions)
 * - Session timing patterns
 */

import { getPrismaClient } from '../lib/database.js';
import { logger } from '../lib/logger.js';

const prisma = getPrismaClient();

export interface BehavioralSignalPayload {
  virtualUserId: string;
  typingCadence?: number[];
  navigationPath?: string[];
  sessionDurationMs?: number;
  interactionPace?: number;
}

export interface BehavioralAnalysis {
  typingConsistency: number;
  navigationPatternScore: number;
  sessionPatternScore: number;
  overallScore: number;
}

export class BehavioralSignalCapture {
  async processSignal(payload: BehavioralSignalPayload): Promise<BehavioralAnalysis> {
    const { virtualUserId, typingCadence, navigationPath, sessionDurationMs, interactionPace } = payload;

    const analysis = await this.analyzeBehavioralSignals(
      typingCadence,
      navigationPath,
      sessionDurationMs,
      interactionPace
    );

    await this.storeBehavioralSignal(virtualUserId, payload, analysis);

    return analysis;
  }

  private async analyzeBehavioralSignals(
    typingCadence?: number[],
    navigationPath?: string[],
    sessionDurationMs?: number,
    interactionPace?: number
  ): Promise<BehavioralAnalysis> {
    let typingConsistency = 0;
    let navigationPatternScore = 0;
    let sessionPatternScore = 0;

    if (typingCadence && typingCadence.length > 3) {
      typingConsistency = this.calculateTypingConsistency(typingCadence);
    }

    if (navigationPath && navigationPath.length > 1) {
      navigationPatternScore = this.calculateNavigationScore(navigationPath);
    }

    if (sessionDurationMs || interactionPace) {
      sessionPatternScore = this.calculateSessionPattern(sessionDurationMs, interactionPace);
    }

    const overallScore = Math.round(
      (typingConsistency * 0.4) + 
      (navigationPatternScore * 0.3) + 
      (sessionPatternScore * 0.3)
    );

    return { typingConsistency, navigationPatternScore, sessionPatternScore, overallScore };
  }

  private calculateTypingConsistency(cadence: number[]): number {
    if (cadence.length < 3) return 0;

    const intervals = [];
    for (let i = 1; i < cadence.length; i++) {
      intervals.push(Math.abs(cadence[i] - cadence[i - 1]));
    }

    const avg = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, val) => sum + Math.pow(val - avg, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);

    const cv = avg > 0 ? stdDev / avg : 1;
    const consistency = Math.max(0, Math.round((1 - Math.min(cv, 1)) * 100));

    return consistency;
  }

  private calculateNavigationScore(path: string[]): number {
    const uniquePages = new Set(path).size;
    const depth = path.length;
    const repeats = depth - uniquePages;

    const diversityScore = Math.min(uniquePages / 5, 1) * 50;
    const depthScore = Math.min(depth / 10, 1) * 30;
    const repeatPenalty = Math.max(0, 20 - repeats * 5);

    return Math.round(diversityScore + depthScore + repeatPenalty);
  }

  private calculateSessionPattern(durationMs?: number, pace?: number): number {
    let score = 0;

    if (durationMs) {
      const optimalDuration = 15 * 60 * 1000;
      const ratio = Math.min(durationMs / optimalDuration, 1);
      score += ratio * 50;
    }

    if (pace) {
      score += Math.min(pace / 10, 1) * 50;
    }

    return Math.round(score);
  }

  private async storeBehavioralSignal(
    userId: string,
    payload: BehavioralSignalPayload,
    analysis: BehavioralAnalysis
  ): Promise<void> {
    try {
      const vu = await prisma.virtualUser.findUnique({
        where: { id: userId },
        select: { metadata: true },
      });

      const existingSignals = (vu?.metadata as any)?.behavioralSignals || [];

      const newSignal = {
        timestamp: new Date().toISOString(),
        typingConsistency: analysis.typingConsistency,
        navigationScore: analysis.navigationPatternScore,
        sessionScore: analysis.sessionPatternScore,
        overallScore: analysis.overallScore,
      };

      const updatedSignals = [...existingSignals, newSignal].slice(-20);

      await prisma.virtualUser.update({
        where: { id: userId },
        data: {
          metadata: {
            ...((vu?.metadata as object) || {}),
            behavioralSignals: updatedSignals,
          },
        },
      });

      logger.debug({ userId, analysis }, 'Behavioral signal stored');
    } catch (error) {
      logger.error({ error: (error as Error).message }, 'Failed to store behavioral signal');
    }
  }
}

export const behavioralSignalCapture = new BehavioralSignalCapture();
