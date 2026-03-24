import { ExtractedMemory, MemoryType } from '@/types/memory';
import { ExtractionResult } from '@/types/demo';

interface ExtractionResultInternal {
  keywords: string[];
  entities: string[];
  memories: ExtractedMemory[];
  confidence: number;
}

// Keyword extraction patterns
const KEYWORD_PATTERNS = [
  /\b(?:python|javascript|typescript|react|next\.js|node\.js|express|mongodb|postgres|redis|api|rest|graphql|webhook|endpoint|jwt|oauth|bcrypt)\b/gi,
];

// Entity extraction patterns
const ENTITY_PATTERNS = [
  /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g,
  /(?:@|npm:)[a-z0-9_-]+/gi,
];

function classifyMemory(content: string): MemoryType {
  const lower = content.toLowerCase();

  if (/^(i am|i'm|i have|my name is|i work as)/.test(lower)) {
    return 'IDENTITY';
  }
  if (/(?:prefer|like|want|should|always use)\b/i.test(lower)) {
    return 'PREFERENCE';
  }
  if (/^(building|creating|implementing|working on)/i.test(lower)) {
    return 'GOAL';
  }
  if (/^(debugged|fixed|solved|implemented)/i.test(lower)) {
    return 'PROCEDURAL';
  }

  if (/\b(?:is|are|was)\b/i.test(lower) && !/\bi\b/.test(lower)) {
    return 'FACTUAL';
  }

  return 'EPISODIC';
}

function calculateConfidence(content: string, keywords: string[]): number {
  let score = 0.5;

  score += Math.min(keywords.length * 0.15, 0.3);
  score += Math.min(content.length / 500, 0.15);

  if (/\b(?:type|interface|function|class|const|let|var)\b/.test(content)) {
    score += 0.1;
  }

  return Math.min(score, 0.98);
}

export async function extractFromInput(input: string): Promise<ExtractionResult> {
  await new Promise(resolve => setTimeout(resolve, 800));

  const keywordMatches = KEYWORD_PATTERNS.flatMap(p => {
    const matches = input.matchAll(p);
    return matches ? Array.from(matches).map(m => m[0]) : [];
  });

  const keywords = Array.from(new Set(keywordMatches));

  const entityMatches = ENTITY_PATTERNS.flatMap(p => {
    const matches = input.matchAll(p);
    return matches ? Array.from(matches).map(m => m[0]) : [];
  });

  const entities = Array.from(new Set(entityMatches));

  const baseMemories: Omit<ExtractedMemory, 'id' | 'timestamp'>[] = [
    { content: input, type: classifyMemory(input), confidence: 0.9, connections: [] },
  ];

  keywords.forEach((keyword, i) => {
    baseMemories.push({
      content: `User mentioned ${keyword}`,
      type: 'SEMANTIC',
      confidence: 0.85 + (i * 0.01),
      connections: [keyword],
    });
  });

  const memories = baseMemories.map((mem, i) => ({
    ...mem,
    id: `mem-${Date.now()}-${i}`,
    timestamp: new Date(),
  }));

  const confidence = calculateConfidence(input, keywords);

  return { keywords, entities, memories, confidence };
}
