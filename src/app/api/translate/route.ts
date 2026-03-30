import { NextRequest, NextResponse } from "next/server";
import { checkDistributedRateLimit } from "@/lib/translation/rate-limit";
import { fetchWithRetry } from "@/lib/translation/retry";
import { withDeduplication } from "@/lib/translation/deduplication";
import { 
  getServerCachedBatch, 
  setServerCachedBatch 
} from "@/lib/translation/server-cache";

const ZAI_API_KEY = process.env.ZAI_API_KEY!;
const ZAI_BASE_URL = process.env.ZAI_BASE_URL ?? "https://api.z.ai/api/coding/paas/v4";
const MODEL = process.env.ZAI_TRANSLATE_MODEL ?? "glm-4.7-flash";
const TEMPERATURE = parseFloat(process.env.TRANSLATE_TEMPERATURE ?? "0.1");
const MAX_STRINGS_PER_REQUEST = 30;

const RATE_LIMIT_MAX = 20;
const RATE_LIMIT_WINDOW = 60;

interface TranslateRequest {
  strings: string[];
  targetLang: string;
  sourceLang?: string;
  context?: string;
}

function log(level: string, message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const color = level === "ERROR" ? "\x1b[31m" : level === "WARN" ? "\x1b[33m" : level === "SUCCESS" ? "\x1b[32m" : "\x1b[36m";
  console.log(`\x1b[90m[${timestamp}]\x1b[0m ${color}${level}\x1b[0m ${message}`);
  if (data !== undefined) {
    console.log(JSON.stringify(data, null, 2));
  }
}

async function performTranslation(
  strings: string[],
  sourceLang: string,
  targetLang: string,
  context?: string
): Promise<string[]> {
  const numbered = strings.map((s, i) => `${i + 1}. ${s}`).join("\n");
  const systemPrompt = `You are a professional website localisation engine.
Translate the following numbered strings from ${sourceLang} to ${targetLang}.
${context ? `Page context: ${context}.` : ""}
Rules:
- Return ONLY a valid JSON array of translated strings, same order and count as input.
- Preserve HTML tags, placeholders like {{name}}, %s, {0}, and markdown formatting exactly.
- Keep proper nouns, brand names, and code snippets untranslated.
- Match the tone: concise, modern, web-UI appropriate.
- Do NOT add explanations, numbering, or any text outside the JSON array.`;
  const userPrompt = `Translate these ${strings.length} strings:\n${numbered}`;

  const result = await fetchWithRetry(async () => {
    const response = await fetch(`${ZAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ZAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: TEMPERATURE,
        stream: false,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      const waitTime = retryAfter ? parseInt(retryAfter, 10) * 1000 : 2000;
      throw new Error(`RATE_LIMIT:${waitTime}`);
    }

    if (!response.ok) {
      throw new Error(`ZAI_API_ERROR:${response.status}`);
    }

    return response.json();
  }, { 
    maxRetries: 5,
    baseDelay: 2000,
    maxDelay: 30000,
    backoffMultiplier: 2,
    retryableErrors: ["RATE_LIMIT", "429", "500", "502", "503", "504", "ECONNRESET", "ETIMEDOUT"],
  });

  if (!result.success || !result.data) {
    log("ERROR", "Translation failed after retries", { error: result.error });
    return strings;
  }

  const data = result.data as { choices?: Array<{ message: { content: string } }> };
  const raw = data.choices?.[0]?.message?.content ?? "[]";
  const clean = raw.replace(/```json|```/g, "").trim();

  try {
    const parsed = JSON.parse(clean);
    let translations = Array.isArray(parsed)
      ? parsed
      : parsed.translations ?? parsed.strings ?? Object.values(parsed);

    while (translations.length < strings.length) {
      translations.push(strings[translations.length]);
    }

    return translations.slice(0, strings.length);
  } catch {
    log("ERROR", "JSON parse failed, using fallback");
    return strings;
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 15);
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";

  log("INFO", `Translation request #${requestId}`, { ip, strings: "processing" });

  if (!ZAI_API_KEY) {
    return NextResponse.json({ error: "Translation API not configured" }, { status: 503 });
  }

  const rateLimit = await checkDistributedRateLimit(ip, {
    limit: RATE_LIMIT_MAX,
    windowSeconds: RATE_LIMIT_WINDOW,
  });

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded", retryAfter: rateLimit.resetAt },
      { status: 429, headers: { "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } }
    );
  }

  try {
    const body = await req.json() as TranslateRequest;
    const { strings, targetLang, sourceLang = "en", context } = body;

    if (!strings?.length || !targetLang) {
      return NextResponse.json({ error: "Missing strings or targetLang" }, { status: 400 });
    }

    if (strings.length > MAX_STRINGS_PER_REQUEST) {
      return NextResponse.json({ error: `Too many strings (max ${MAX_STRINGS_PER_REQUEST})` }, { status: 400 });
    }

    const serverCache = await getServerCachedBatch(sourceLang, targetLang, strings, context);
    const missingIndices: number[] = [];
    const results: (string | null)[] = [...serverCache];

    serverCache.forEach((cached, index) => {
      if (cached === null) {
        missingIndices.push(index);
      }
    });

    log("INFO", "Cache check", { 
      total: strings.length, 
      serverHits: serverCache.filter(c => c !== null).length,
      missing: missingIndices.length 
    });

    if (missingIndices.length > 0) {
      const missingStrings = missingIndices.map(i => strings[i]);

      const { result: freshTranslations } = await withDeduplication(
        missingStrings,
        targetLang,
        async () => {
          return performTranslation(missingStrings, sourceLang, targetLang, context);
        }
      );
      
      await setServerCachedBatch(
        sourceLang, 
        targetLang, 
        missingStrings, 
        freshTranslations, 
        context
      );

      missingIndices.forEach((idx, pos) => {
        results[idx] = freshTranslations[pos];
      });
    }

    const finalTranslations = results.map((t, i) => t ?? strings[i]);

    log("SUCCESS", `Request #${requestId} complete`, {
      duration: Date.now() - startTime,
      translated: finalTranslations.length,
    });

    return NextResponse.json({
      translations: finalTranslations,
      meta: {
        requestId,
        duration: Date.now() - startTime,
        serverCacheHits: serverCache.filter(c => c !== null).length,
      },
    });
  } catch (err) {
    log("ERROR", `Request #${requestId} failed`, {
      error: err instanceof Error ? err.message : String(err),
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "vivim-translation",
    model: MODEL,
    endpoint: ZAI_BASE_URL,
    features: {
      batchTranslation: true,
      caching: "multi-tier (client + server Redis)",
      rateLimit: "distributed (Redis)",
      retry: "exponential backoff",
      deduplication: true,
    },
    supportedLanguages: ["en", "es", "zh", "fr", "de", "pt", "ja", "ar", "ru", "ko"],
  });
}
