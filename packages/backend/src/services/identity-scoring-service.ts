/**
 * Identity Scoring Service
 * 
 * Strictly implements: ICS = (0.2 * S_f) + (0.3 * S_b) + (0.5 * S_c)
 * 
 * Where:
 * - S_f: Fingerprint Signal (device/IP consistency) - normalized 0-100
 * - S_b: Behavioral Signal (typing rhythm, navigation) - normalized 0-100
 * - S_c: Contextual Signal (identity memories, personal facts) - normalized 0-100
 */

import { getPrismaClient } from '../lib/database.js';
import { logger } from '../lib/logger.js';

const prisma = getPrismaClient();

export type IdentityState = 'STRANGER' | 'ACQUAINTANCE' | 'FAMILIAR' | 'KNOWN';

export const IDENTITY_STATE_RANGES = {
  STRANGER: { min: 0, max: 29 },
  ACQUAINTANCE: { min: 30, max: 59 },
  FAMILIAR: { min: 60, max: 84 },
  KNOWN: { min: 85, max: 100 },
} as const;

export interface ScoringWeights {
  fingerprint: number;
  behavioral: number;
  contextual: number;
}

export interface IdentitySignals {
  fingerprintScore: number;
  behavioralScore: number;
  contextualScore: number;
}

export interface SignalBreakdown {
  fingerprint: { score: number; factors: string[] };
  behavioral: { score: number; factors: string[] };
  contextual: { score: number; factors: string[] };
}

export interface IdentityScoreResult {
  ics: number;
  state: IdentityState;
  signals: IdentitySignals;
  breakdown: SignalBreakdown;
  promotionNeeded: boolean;
}

const WEIGHTS: ScoringWeights = {
  fingerprint: 0.2,
  behavioral: 0.3,
  contextual: 0.5,
};

export class IdentityScoringService {
  async calculateScore(virtualUserId: string): Promise<IdentityScoreResult> {
    const vu = await prisma.virtualUser.findUnique({
      where: { id: virtualUserId },
    });

    if (!vu) {
      throw new Error('VirtualUser not found');
    }

    const fingerprintSignal = this.computeFingerprintSignal(vu);
    const behavioralSignal = await this.computeBehavioralSignal(vu.id);
    const contextualSignal = await this.computeContextualSignal(vu.id);

    const signals: IdentitySignals = {
      fingerprintScore: fingerprintSignal.score,
      behavioralScore: behavioralSignal.score,
      contextualScore: contextualSignal.score,
    };

    const breakdown: SignalBreakdown = {
      fingerprint: fingerprintSignal,
      behavioral: behavioralSignal,
      contextual: contextualSignal,
    };

    const ics = this.computeICS(signals);
    const state = this.getState(ics);
    const promotionNeeded = state === 'KNOWN' && vu.currentAvatar !== 'KNOWN';

    await this.updateVirtualUser(virtualUserId, ics, state);

    logger.info(
      { virtualUserId, ics, state, signals, weights: WEIGHTS },
      'Identity score calculated'
    );

    return { ics, state, signals, breakdown, promotionNeeded };
  }

  private computeFingerprintSignal(vu: any): { score: number; factors: string[] } {
    const factors: string[] = [];
    const ipHistory = (vu.ipHistory as any[]) || [];
    const userAgentHistory = (vu.userAgentHistory as any[]) || [];
    const deviceChars = (vu.deviceCharacteristics as any) || {};

    let score = 0;

    if (ipHistory.length > 0) {
      const ipScore = Math.min(ipHistory.length * 8, 30);
      score += ipScore;
      factors.push(`IP history: ${ipHistory.length} entries (+${ipScore})`);
    }

    if (userAgentHistory.length > 0) {
      const uaScore = Math.min(userAgentHistory.length * 5, 25);
      score += uaScore;
      factors.push(`UA history: ${userAgentHistory.length} entries (+${uaScore})`);
    }

    const deviceKeys = Object.keys(deviceChars).length;
    if (deviceKeys > 0) {
      const deviceScore = Math.min(deviceKeys * 5, 25);
      score += deviceScore;
      factors.push(`Device signals: ${deviceKeys} signals (+${deviceScore})`);
    }

    if (vu.lastIpAddress) {
      score += 10;
      factors.push('Current IP known (+10)');
    }

    const finalScore = Math.min(Math.round(score), 100);
    return { score: finalScore, factors };
  }

  private async computeBehavioralSignal(virtualUserId: string): Promise<{ score: number; factors: string[] }> {
    const factors: string[] = [];
    let score = 0;

    const recentSessions = await prisma.virtualSession.findMany({
      where: { virtualUserId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    if (recentSessions.length > 0) {
      const sessionScore = Math.min(recentSessions.length * 6, 30);
      score += sessionScore;
      factors.push(`Sessions: ${recentSessions.length} (+${sessionScore})`);
    }

    const vu = await prisma.virtualUser.findUnique({
      where: { id: virtualUserId },
      select: { conversationCount: true, memoryCount: true },
    });

    if (vu) {
      if (vu.conversationCount > 0) {
        const convScore = Math.min(vu.conversationCount * 0.8, 35);
        score += convScore;
        factors.push(`Conversations: ${vu.conversationCount} (+${Math.round(convScore)})`);
      }

      if (vu.memoryCount > 0) {
        const memScore = Math.min(vu.memoryCount * 0.5, 25);
        score += memScore;
        factors.push(`Memories: ${vu.memoryCount} (+${Math.round(memScore)})`);
      }
    }

    const finalScore = Math.min(Math.round(score), 100);
    return { score: finalScore, factors };
  }

  private async computeContextualSignal(virtualUserId: string): Promise<{ score: number; factors: string[] }> {
    const factors: string[] = [];
    let score = 0;

    const identityMemories = await prisma.memory.findMany({
      where: {
        userId: virtualUserId,
        category: { in: ['IDENTITY', 'identity_core', 'FACTUAL', 'PERSONAL'] },
      },
      orderBy: { importance: 'desc' },
      take: 20,
    });

    if (identityMemories.length > 0) {
      const memScore = Math.min(identityMemories.length * 5, 50);
      score += memScore;
      factors.push(`Identity memories: ${identityMemories.length} (+${memScore})`);
    }

    const highImportance = identityMemories.filter((m) => m.importance > 0.7);
    if (highImportance.length > 0) {
      const impScore = highImportance.length * 5;
      score += impScore;
      factors.push(`High-importance facts: ${highImportance.length} (+${impScore})`);
    }

    const semanticMemories = await prisma.memory.findMany({
      where: {
        userId: virtualUserId,
        category: 'SEMANTIC',
      },
      take: 10,
    });

    if (semanticMemories.length > 5) {
      const semiScore = Math.min((semanticMemories.length - 5) * 3, 20);
      score += semiScore;
      factors.push(`Semantic knowledge: ${semanticMemories.length} (+${semiScore})`);
    }

    const finalScore = Math.min(Math.round(score), 100);
    return { score: finalScore, factors };
  }

  private computeICS(signals: IdentitySignals): number {
    const S_f = signals.fingerprintScore;
    const S_b = signals.behavioralScore;
    const S_c = signals.contextualScore;

    const ics = (WEIGHTS.fingerprint * S_f) + (WEIGHTS.behavioral * S_b) + (WEIGHTS.contextual * S_c);

    return Math.round(ics);
  }

  private getState(ics: number): IdentityState {
    if (ics >= IDENTITY_STATE_RANGES.KNOWN.min) return 'KNOWN';
    if (ics >= IDENTITY_STATE_RANGES.FAMILIAR.min) return 'FAMILIAR';
    if (ics >= IDENTITY_STATE_RANGES.ACQUAINTANCE.min) return 'ACQUAINTANCE';
    return 'STRANGER';
  }

  private async updateVirtualUser(
    virtualUserId: string,
    ics: number,
    state: IdentityState
  ): Promise<void> {
    await prisma.virtualUser.update({
      where: { id: virtualUserId },
      data: {
        confidenceScore: ics,
        currentAvatar: state,
        lastSeenAt: new Date(),
      },
    });
  }

  detectIdentityDrift(virtualUserId: string, newIp: string, newUserAgent: string): boolean {
    return false;
  }
}

export const identityScoringService = new IdentityScoringService();
