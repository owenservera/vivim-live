import { NextRequest, NextResponse } from "next/server";

const ZAI_API_KEY = process.env.ZAI_API_KEY!;
const ZAI_BASE_URL = process.env.ZAI_BASE_URL ?? "https://api.z.ai/api/coding/paas/v4";
const MODEL = process.env.ZAI_TRANSLATE_MODEL ?? "glm-4.7-flash"; // Fast model for translation
const TEMPERATURE = parseFloat(process.env.TRANSLATE_TEMPERATURE ?? "0.1");
const MAX_STRINGS_PER_REQUEST = 50; // Increased for flash model efficiency

interface TranslateRequest {
  strings: string[];
  targetLang: string;
  sourceLang?: string;
  context?: string;
}

const rateLimitMap = new Map<string, { count: number; ts: number }>();
const WINDOW_MS = 60_000;
const MAX_REQ = 20;

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
};

function log(level: string, message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  const color = level === "ERROR" ? colors.red : level === "WARN" ? colors.yellow : level === "SUCCESS" ? colors.green : colors.cyan;
  console.log(`${colors.gray}[${timestamp}]${colors.reset} ${color}${level}${colors.reset} ${message}`);
  if (data !== undefined) {
    console.log(JSON.stringify(data, null, 2));
  }
}

function logSection(title: string) {
  console.log(`\n${colors.bright}${colors.magenta}═══ ${title} ═══${colors.reset}\n`);
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now - record.ts > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, ts: now });
    log("INFO", "Rate limit: New window", { ip, remaining: MAX_REQ - 1 });
    return true;
  }

  if (record.count >= MAX_REQ) {
    log("WARN", "Rate limit: Exceeded", { ip, count: record.count });
    return false;
  }

  record.count++;
  log("INFO", "Rate limit: Allowed", { ip, count: record.count, remaining: MAX_REQ - record.count });
  return true;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 15);
  const ip = req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip") ?? "unknown";

  logSection(`TRANSLATION REQUEST #${requestId}`);
  log("INFO", "Incoming request", { ip, method: req.method, url: req.url });

  if (!ZAI_API_KEY) {
    log("ERROR", "ZAI_API_KEY not configured");
    return NextResponse.json({ error: "Translation API not configured" }, { status: 503 });
  }

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const body = await req.json() as TranslateRequest;
    const { strings, targetLang, sourceLang = "en", context } = body;

    log("INFO", "Request parsed", {
      stringsCount: strings?.length,
      targetLang,
      sourceLang,
      context: context ?? "none",
    });

    if (!strings?.length || !targetLang) {
      log("ERROR", "Missing required fields", { strings: strings?.length, targetLang });
      return NextResponse.json({ error: "Missing strings or targetLang" }, { status: 400 });
    }

    if (strings.length > MAX_STRINGS_PER_REQUEST) {
      log("WARN", "Too many strings", { count: strings.length, max: MAX_STRINGS_PER_REQUEST });
      return NextResponse.json({ error: `Too many strings (max ${MAX_STRINGS_PER_REQUEST})` }, { status: 400 });
    }

    logSection("PROMPTS");
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

    log("DEBUG", "System prompt", { prompt: systemPrompt });
    log("DEBUG", "User prompt", { prompt: userPrompt });

    logSection("ZAI API CALL");
    const apiStartTime = Date.now();
    log("INFO", "Sending request to ZAI", {
      endpoint: `${ZAI_BASE_URL}/chat/completions`,
      model: MODEL,
      temperature: TEMPERATURE,
      stringsCount: strings.length,
    });

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

    const apiDuration = Date.now() - apiStartTime;
    log("INFO", "ZAI response received", {
      status: response.status,
      statusText: response.statusText,
      duration: `${apiDuration}ms`,
    });

    if (!response.ok) {
      const err = await response.text();
      log("ERROR", "ZAI API error", { status: response.status, error: err });
      return NextResponse.json({ error: `ZAI API error: ${err}` }, { status: response.status });
    }

    const data = await response.json();
    log("DEBUG", "ZAI response data", { data });

    const raw = data.choices?.[0]?.message?.content ?? "[]";
    log("INFO", "Raw response", { content: raw.substring(0, 500) });

    logSection("PARSING");
    const clean = raw.replace(/```json|```/g, "").trim();
    let translations: string[];

    try {
      const parsed = JSON.parse(clean);
      translations = Array.isArray(parsed)
        ? parsed
        : parsed.translations ?? parsed.strings ?? Object.values(parsed);
      log("SUCCESS", "JSON parsed successfully", { translationsCount: translations.length });
    } catch (parseErr) {
      log("ERROR", "JSON parse failed, using fallback", { error: parseErr, raw: raw.substring(0, 200) });
      translations = strings;
    }

    while (translations.length < strings.length) {
      translations.push(strings[translations.length]);
    }

    const finalTranslations = translations.slice(0, strings.length);
    log("INFO", "Translation results", {
      inputCount: strings.length,
      outputCount: finalTranslations.length,
      sample: finalTranslations.slice(0, 3),
    });

    logSection("RESPONSE");
    const totalDuration = Date.now() - startTime;
    log("SUCCESS", "Request completed", {
      requestId,
      totalDuration: `${totalDuration}ms`,
      apiDuration: `${apiDuration}ms`,
      tokens: data.usage,
    });

    return NextResponse.json({
      translations: finalTranslations,
      usage: data.usage,
      meta: {
        requestId,
        duration: totalDuration,
        apiDuration,
      },
    });
  } catch (err) {
    log("ERROR", "Unhandled error", {
      requestId,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  logSection("HEALTH CHECK");
  log("INFO", "Translation API health check", {
    status: "healthy",
    model: MODEL,
    endpoint: ZAI_BASE_URL,
    configured: !!ZAI_API_KEY,
  });

  return NextResponse.json({
    status: "ok",
    service: "vivim-translation",
    model: MODEL,
    endpoint: ZAI_BASE_URL,
    features: {
      batchTranslation: true,
      caching: "client-sessionStorage",
      rateLimit: MAX_REQ,
    },
    supportedLanguages: ["en", "es", "zh", "fr", "de", "pt", "ja", "ar", "ru", "ko"],
  });
}
