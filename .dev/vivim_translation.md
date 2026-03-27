# 🌐 vivim.live — LLM-Powered Runtime Translation
### Z.ai `glm-4.7` · Design & Implementation Guide

---

## 1. Architecture Overview

```
┌──────────────────────────────────────────────────────┐
│                    vivim.live (Browser)               │
│                                                        │
│  ┌─────────────┐   text nodes   ┌──────────────────┐  │
│  │  DOM Walker │ ─────────────▶ │  Translation     │  │
│  │  (MutationObs)│              │  Queue (batched) │  │
│  └─────────────┘                └────────┬─────────┘  │
│         ▲  translated strings            │             │
│         │                                ▼             │
│  ┌──────┴──────┐              ┌──────────────────┐    │
│  │  DOM Patcher│◀─────────────│  Cache Layer     │    │
│  │  (in-place) │              │  (session/Redis) │    │
│  └─────────────┘              └────────┬─────────┘    │
└─────────────────────────────────────────┼─────────────┘
                                          │ MISS
                                          ▼
                              ┌───────────────────────┐
                              │  /api/translate        │
                              │  (Next.js API Route /  │
                              │   Express proxy)       │
                              └───────────┬───────────┘
                                          │
                                          ▼
                              ┌───────────────────────┐
                              │  Z.ai API             │
                              │  POST /chat/completions│
                              │  model: glm-4.7        │
                              └───────────────────────┘
```

**Core principles:**
- API key **never** leaves the server — always proxy through your backend
- Translations are **batched** (up to 30 strings per request) to minimise API calls
- Two-tier cache: **sessionStorage** (client) + **Redis/KV** (server) for repeat visitors
- **MutationObserver** catches dynamically injected content (SPA-safe)
- Language auto-detected from `navigator.language`, overridable via UI toggle

---

## 2. Supported Languages (initial set)

| Code | Language | GLM-4.7 Quality |
|------|----------|-----------------|
| `en` | English (source) | — |
| `es` | Spanish | ★★★★★ |
| `zh` | Chinese (Simplified) | ★★★★★ |
| `fr` | French | ★★★★★ |
| `de` | German | ★★★★☆ |
| `pt` | Portuguese | ★★★★☆ |
| `ja` | Japanese | ★★★★★ |
| `ar` | Arabic | ★★★★☆ |
| `ru` | Russian | ★★★★☆ |
| `ko` | Korean | ★★★★☆ |

> Extend freely — glm-4.7 handles 26+ languages.

---

## 3. File Structure

```
vivim.live/
├── lib/
│   └── translation/
│       ├── client.ts          # DOM walker, batcher, patcher
│       ├── cache.ts           # Client-side session cache
│       └── langDetect.ts      # Browser language detection
├── pages/api/ (or app/api/)
│   └── translate/
│       └── route.ts           # Server proxy → Z.ai glm-4.7
├── components/
│   └── LanguageSwitcher.tsx   # UI toggle component
└── .env.local
    └── ZAI_API_KEY=...
```

---

## 4. Environment Variables

```bash
# .env.local
ZAI_API_KEY=your_z_ai_api_key_here
ZAI_MODEL=glm-4.7
ZAI_BASE_URL=https://api.z.ai/api/paas/v4
TRANSLATE_MAX_BATCH=30       # strings per API call
TRANSLATE_TEMPERATURE=0.1    # low = deterministic translations
```

---

## 5. Server: Translation API Proxy

```typescript
// pages/api/translate/route.ts  (Next.js App Router)
import { NextRequest, NextResponse } from "next/server";

const ZAI_API_KEY  = process.env.ZAI_API_KEY!;
const ZAI_BASE_URL = process.env.ZAI_BASE_URL ?? "https://api.z.ai/api/paas/v4";
const MODEL        = process.env.ZAI_MODEL    ?? "glm-4.7";
const TEMPERATURE  = parseFloat(process.env.TRANSLATE_TEMPERATURE ?? "0.1");

export interface TranslateRequest {
  strings: string[];   // array of source strings to translate
  targetLang: string;  // BCP-47 code, e.g. "es", "zh", "fr"
  sourceLang?: string; // defaults to "en"
  context?: string;    // optional: page type / tone hint
}

export async function POST(req: NextRequest) {
  const { strings, targetLang, sourceLang = "en", context }: TranslateRequest
    = await req.json();

  if (!strings?.length || !targetLang) {
    return NextResponse.json({ error: "Missing strings or targetLang" }, { status: 400 });
  }

  // Build numbered list prompt — preserves batch order, avoids hallucinating extras
  const numbered = strings
    .map((s, i) => `${i + 1}. ${s}`)
    .join("\n");

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

  try {
    const res = await fetch(`${ZAI_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${ZAI_API_KEY}`,
        "Accept-Language": "en-US,en",
      },
      body: JSON.stringify({
        model: MODEL,
        temperature: TEMPERATURE,
        stream: false,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: userPrompt   },
        ],
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ error: err }, { status: res.status });
    }

    const data = await res.json();
    const raw  = data.choices?.[0]?.message?.content ?? "[]";

    // Defensively parse — strip any accidental markdown fences
    const clean = raw.replace(/```json|```/g, "").trim();
    let translations: string[];
    try {
      const parsed = JSON.parse(clean);
      // glm-4.7 sometimes returns { "translations": [...] }
      translations = Array.isArray(parsed)
        ? parsed
        : parsed.translations ?? parsed.strings ?? Object.values(parsed);
    } catch {
      // Fallback: return originals if parse fails
      translations = strings;
    }

    // Safety: ensure same length
    while (translations.length < strings.length) {
      translations.push(strings[translations.length]);
    }

    return NextResponse.json({
      translations: translations.slice(0, strings.length),
      usage: data.usage,
    });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
```

---

## 6. Client: Cache Layer

```typescript
// lib/translation/cache.ts

const CACHE_PREFIX = "vivim_tx_";
const CACHE_VERSION = "v1";

function cacheKey(lang: string, text: string): string {
  // Simple hash to keep keys short
  const hash = btoa(encodeURIComponent(text)).slice(0, 32);
  return `${CACHE_PREFIX}${CACHE_VERSION}_${lang}_${hash}`;
}

export function getCached(lang: string, text: string): string | null {
  try {
    return sessionStorage.getItem(cacheKey(lang, text));
  } catch { return null; }
}

export function setCached(lang: string, text: string, translated: string): void {
  try {
    sessionStorage.setItem(cacheKey(lang, text), translated);
  } catch { /* storage full — no-op */ }
}

export function getCachedBatch(lang: string, texts: string[]): (string | null)[] {
  return texts.map(t => getCached(lang, t));
}

export function setCachedBatch(lang: string, texts: string[], translated: string[]): void {
  texts.forEach((t, i) => { if (translated[i]) setCached(lang, t, translated[i]); });
}
```

---

## 7. Client: Core Translation Engine

```typescript
// lib/translation/client.ts

import { getCachedBatch, setCachedBatch } from "./cache";

// ─── Configuration ─────────────────────────────────────────────────────────

const BATCH_SIZE   = 30;
const SKIP_SELECTORS = [
  "script", "style", "noscript", "code", "pre",
  "[data-notranslate]", "[contenteditable]", "input", "textarea",
];

// ─── Types ──────────────────────────────────────────────────────────────────

interface TranslationJob {
  node: Text;
  original: string;
}

// ─── Text Node Harvester ─────────────────────────────────────────────────────

function shouldSkip(el: Element): boolean {
  return SKIP_SELECTORS.some(sel => el.matches(sel) || el.closest(sel));
}

function harvestTextNodes(root: HTMLElement): TranslationJob[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const parent = node.parentElement;
      if (!parent || shouldSkip(parent)) return NodeFilter.FILTER_REJECT;
      const text = node.textContent?.trim();
      if (!text || text.length < 2) return NodeFilter.FILTER_REJECT;
      // Skip if already translated (marked by us)
      if (parent.dataset.txDone) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const jobs: TranslationJob[] = [];
  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    jobs.push({ node, original: node.textContent! });
  }
  return jobs;
}

// ─── API Call ────────────────────────────────────────────────────────────────

async function fetchTranslations(
  strings: string[],
  targetLang: string,
  context?: string
): Promise<string[]> {
  const res = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ strings, targetLang, context }),
  });
  if (!res.ok) throw new Error(`Translate API ${res.status}`);
  const data = await res.json();
  return data.translations as string[];
}

// ─── Batch Processor ─────────────────────────────────────────────────────────

async function processBatch(
  jobs: TranslationJob[],
  targetLang: string,
  context?: string
): Promise<void> {
  const originals = jobs.map(j => j.original);

  // 1. Check cache
  const cached = getCachedBatch(targetLang, originals);
  const missingIdx = cached
    .map((v, i) => (v === null ? i : -1))
    .filter(i => i !== -1);

  if (missingIdx.length > 0) {
    const missingStrings = missingIdx.map(i => originals[i]);
    try {
      const fresh = await fetchTranslations(missingStrings, targetLang, context);
      // Splice back
      missingIdx.forEach((idx, pos) => { cached[idx] = fresh[pos] ?? originals[idx]; });
      // Persist to cache
      setCachedBatch(targetLang, missingStrings, fresh);
    } catch (err) {
      console.error("[vivim translate] API error:", err);
      // Graceful: use originals
      missingIdx.forEach(i => { cached[i] = originals[i]; });
    }
  }

  // 2. Patch DOM
  jobs.forEach((job, i) => {
    const translated = cached[i];
    if (translated && translated !== job.original) {
      job.node.textContent = translated;
      if (job.node.parentElement) {
        job.node.parentElement.dataset.txDone = "1";
        // Store original for language-switch reversal
        job.node.parentElement.dataset.txOriginal = job.original;
      }
    }
  });
}

// ─── Main Translate Page Function ────────────────────────────────────────────

export async function translatePage(
  targetLang: string,
  root: HTMLElement = document.body,
  context?: string
): Promise<void> {
  if (targetLang === "en") {
    revertPage(root);
    return;
  }

  const jobs = harvestTextNodes(root);
  // Split into batches
  for (let i = 0; i < jobs.length; i += BATCH_SIZE) {
    await processBatch(jobs.slice(i, i + BATCH_SIZE), targetLang, context);
  }
}

// ─── Revert to Original ───────────────────────────────────────────────────────

export function revertPage(root: HTMLElement = document.body): void {
  root.querySelectorAll("[data-tx-done]").forEach((el) => {
    const orig = (el as HTMLElement).dataset.txOriginal;
    if (orig) el.textContent = orig;
    delete (el as HTMLElement).dataset.txDone;
    delete (el as HTMLElement).dataset.txOriginal;
  });
}

// ─── MutationObserver (SPA / Dynamic Content) ────────────────────────────────

let _activeLang = "en";
let _observer: MutationObserver | null = null;

export function startObserver(getLang: () => string): void {
  _observer?.disconnect();

  _observer = new MutationObserver((mutations) => {
    const lang = getLang();
    if (lang === "en") return;

    mutations.forEach((m) => {
      m.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          translatePage(lang, node as HTMLElement);
        }
      });
    });
  });

  _observer.observe(document.body, { childList: true, subtree: true });
}
```

---

## 8. Client: Language Detection

```typescript
// lib/translation/langDetect.ts

const SUPPORTED = ["en","es","zh","fr","de","pt","ja","ar","ru","ko"];
const STORAGE_KEY = "vivim_lang";

export function detectLanguage(): string {
  // 1. User preference
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED.includes(stored)) return stored;

  // 2. Browser language
  const browser = navigator.language?.split("-")[0]?.toLowerCase();
  if (browser && SUPPORTED.includes(browser)) return browser;

  return "en";
}

export function setLanguagePreference(lang: string): void {
  localStorage.setItem(STORAGE_KEY, lang);
}
```

---

## 9. Component: Language Switcher UI

```tsx
// components/LanguageSwitcher.tsx
"use client";
import { useState, useEffect } from "react";
import { translatePage, revertPage } from "@/lib/translation/client";
import { detectLanguage, setLanguagePreference } from "@/lib/translation/langDetect";
import { startObserver } from "@/lib/translation/client";

const LANGUAGES = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "es", label: "ES", flag: "🇪🇸" },
  { code: "zh", label: "ZH", flag: "🇨🇳" },
  { code: "fr", label: "FR", flag: "🇫🇷" },
  { code: "de", label: "DE", flag: "🇩🇪" },
  { code: "pt", label: "PT", flag: "🇧🇷" },
  { code: "ja", label: "JA", flag: "🇯🇵" },
  { code: "ar", label: "AR", flag: "🇸🇦" },
];

export default function LanguageSwitcher() {
  const [lang, setLang] = useState("en");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const detected = detectLanguage();
    setLang(detected);
    if (detected !== "en") translatePage(detected);
    startObserver(() => lang);
  }, []);

  const handleChange = async (code: string) => {
    setLoading(true);
    setLang(code);
    setLanguagePreference(code);

    if (code === "en") {
      revertPage();
    } else {
      revertPage(); // reset first, then apply fresh
      await translatePage(code, document.body, "vivim app UI");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center gap-1 text-sm" aria-label="Language switcher">
      {loading && <span className="animate-spin">⟳</span>}
      {LANGUAGES.map(({ code, label, flag }) => (
        <button
          key={code}
          onClick={() => handleChange(code)}
          disabled={loading}
          aria-pressed={lang === code}
          className={`px-2 py-1 rounded transition
            ${lang === code
              ? "bg-indigo-600 text-white font-semibold"
              : "text-gray-500 hover:text-gray-900"}`}
          title={`Switch to ${label}`}
        >
          {flag} {label}
        </button>
      ))}
    </div>
  );
}
```

---

## 10. Bootstrap: App Entry Point

```tsx
// In your root layout.tsx or _app.tsx
import LanguageSwitcher from "@/components/LanguageSwitcher";

// Add to your navbar/header:
<header>
  <nav>
    {/* ... your nav items ... */}
    <LanguageSwitcher />
  </nav>
</header>
```

---

## 11. Rate Limit & Cost Guard (Server Middleware)

```typescript
// middleware.ts  — simple in-memory rate limit for /api/translate
import { NextRequest, NextResponse } from "next/server";

const hits = new Map<string, { count: number; ts: number }>();
const WINDOW_MS = 60_000; // 1 min
const MAX_REQ   = 20;     // per IP per minute

export function middleware(req: NextRequest) {
  if (!req.nextUrl.pathname.startsWith("/api/translate")) {
    return NextResponse.next();
  }

  const ip  = req.headers.get("x-forwarded-for") ?? "unknown";
  const now = Date.now();
  const rec = hits.get(ip);

  if (!rec || now - rec.ts > WINDOW_MS) {
    hits.set(ip, { count: 1, ts: now });
  } else if (rec.count >= MAX_REQ) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  } else {
    rec.count++;
  }

  return NextResponse.next();
}
```

---

## 12. glm-4.7 Prompt Engineering Notes

| Concern | Strategy |
|--------|----------|
| **Hallucinated extras** | Numbered list input + JSON array output + count guard |
| **HTML tag preservation** | Explicitly instructed in system prompt |
| **Placeholder safety** | `{{name}}`, `%s`, `{0}` patterns called out in rules |
| **Tone consistency** | Pass `context` ("e-commerce product page", "dashboard UI", etc.) |
| **Low temperature** | `0.1` for deterministic, consistent output across sessions |
| **Thinking mode** | `disabled` — unnecessary for translation, saves tokens |

---

## 13. Performance Targets

| Metric | Target |
|--------|--------|
| First paint → translated | < 800ms |
| Cache hit ratio (return users) | > 85% |
| API calls per page load | ≤ 3 (batching) |
| Graceful fallback | Always show original on error |
| Bundle size impact | ~4 KB (client lib only) |

---

## 14. Rollout Plan

```
Phase 1  ·  Week 1
  ✅  Server proxy /api/translate live
  ✅  LanguageSwitcher component (EN + ES + ZH)
  ✅  Session cache client
  ✅  Static page content translated

Phase 2  ·  Week 2
  ⬜  MutationObserver active for dynamic/SPA content
  ⬜  Expand to full 8-language set
  ⬜  Redis cache server-side (Upstash recommended)
  ⬜  Analytics: track lang switch events

Phase 3  ·  Week 3+
  ⬜  RTL layout support (Arabic)
  ⬜  Locale-aware number/date formatting (Intl.NumberFormat)
  ⬜  A/B test translated CTAs for conversion impact
  ⬜  SEO: hreflang meta tags + static pre-translation for top langs
```

---

## 15. Quick Test Checklist

```bash
# 1. Smoke test the API proxy
curl -X POST http://localhost:3000/api/translate \
  -H "Content-Type: application/json" \
  -d '{"strings":["Welcome to vivim","Get started","Sign in"],"targetLang":"es"}'

# Expected:
# {"translations":["Bienvenido a vivim","Empezar","Iniciar sesión"],"usage":{...}}

# 2. Test batch limit
# Send 31 strings → should split into 2 API calls, all 31 returned correctly

# 3. Test cache hit
# Translate same strings twice → second call uses sessionStorage, 0 API requests

# 4. Test graceful fallback
# Kill ZAI_API_KEY → page should still render in original English
```

---

*Built for vivim.live · Powered by Z.ai `glm-4.7` · © 2026*
