export interface ChunkedTranslation {
  chunks: string[];
  results: string[];
}

const MAX_CHUNK_LENGTH = 2000;
const PLACEHOLDER_PREFIX = "__VIVIM_PLACEHOLDER_";
const PLACEHOLDER_REGEX = /__VIVIM_PLACEHOLDER_\d+__/g;

interface Placeholder {
  id: number;
  original: string;
}

const placeholders: Placeholder[] = [];

export function extractPlaceholders(text: string): { cleaned: string; placeholders: Placeholder[] } {
  const results: Placeholder[] = [];
  let id = 0;

  const cleaned = text.replace(/\{\{[^}]+\}\}|%s|%d|\{0\}|\{1\}|<[^>]+>/g, (match) => {
    results.push({ id: id++, original: match });
    return `${PLACEHOLDER_PREFIX}${id - 1}__`;
  });

  return { cleaned, placeholders: results };
}

export function restorePlaceholders(text: string, originalPlaceholders: Placeholder[]): string {
  return text.replace(PLACEHOLDER_REGEX, (match) => {
    const id = parseInt(match.replace(PLACEHOLDER_PREFIX, "").replace("__", ""), 10);
    const placeholder = originalPlaceholders.find(p => p.id === id);
    return placeholder ? placeholder.original : match;
  });
}

export function chunkLongText(text: string, maxLength: number = MAX_CHUNK_LENGTH): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxLength && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = sentence;
    } else {
      currentChunk += sentence;
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

export function detectScript(text: string): "latin" | "cjk" | "arabic" | "cyrillic" | "mixed" | "unknown" {
  const latin = /[a-zA-Z]/.test(text);
  const cjk = /[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff]/.test(text);
  const arabic = /[\u0600-\u06ff\u0750-\u077f]/.test(text);
  const cyrillic = /[\u0400-\u04ff]/.test(text);

  const scripts = [latin, cjk, arabic, cyrillic].filter(Boolean).length;

  if (scripts === 0) return "unknown";
  if (scripts > 1) return "mixed";
  if (latin) return "latin";
  if (cjk) return "cjk";
  if (arabic) return "arabic";
  if (cyrillic) return "cyrillic";
  return "unknown";
}

export function handlePluralization(text: string): string {
  const pluralForms = text.match(/\([^)]+\|([^)]+)\)/g);
  if (!pluralForms) return text;
  
  return text;
}

export function isRTLText(text: string): boolean {
  const rtlChars = /[\u0600-\u06ff\u0750-\u077f\u08a0-\u08ff\ufb50-\ufdff\ufe70-\ufefe]/.test(text);
  return rtlChars;
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateTranslation(
  original: string,
  translated: string,
  targetLang: string
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!translated || translated.trim().length === 0) {
    errors.push("Translation is empty");
  }

  if (translated.length > original.length * 3) {
    warnings.push("Translation is significantly longer than original");
  }

  if (translated.length < original.length * 0.3 && original.length > 50) {
    warnings.push("Translation is significantly shorter than original");
  }

  if (targetLang === "en" && /[\u4e00-\u9fff]/.test(translated)) {
    warnings.push("Non-English characters found in English translation");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
