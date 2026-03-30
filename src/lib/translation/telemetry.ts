export type TelemetryEventType = 
  | "translate_start"
  | "translate_complete"
  | "translate_error"
  | "cache_hit"
  | "cache_miss"
  | "language_change"
  | "rate_limit_exceeded";

export interface TelemetryEvent {
  type: TelemetryEventType;
  targetLang: string;
  stringCount?: number;
  duration?: number;
  cacheHit?: boolean;
  error?: string;
  source?: string;
  timestamp: number;
}

const TELEMETRY_ENDPOINT = "/api/telemetry";
const BATCH_SIZE = 10;
const FLUSH_INTERVAL_MS = 5000;

let eventQueue: TelemetryEvent[] = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;

export function trackEvent(event: Omit<TelemetryEvent, "timestamp">): void {
  const fullEvent: TelemetryEvent = {
    ...event,
    timestamp: Date.now(),
  };

  eventQueue.push(fullEvent);

  if (eventQueue.length >= BATCH_SIZE) {
    flush();
  } else if (!flushTimeout) {
    flushTimeout = setTimeout(flush, FLUSH_INTERVAL_MS);
  }
}

export function trackTranslateStart(targetLang: string, stringCount: number): void {
  trackEvent({
    type: "translate_start",
    targetLang,
    stringCount,
  });
}

export function trackTranslateComplete(
  targetLang: string,
  stringCount: number,
  duration: number,
  cacheHit: boolean
): void {
  trackEvent({
    type: "translate_complete",
    targetLang,
    stringCount,
    duration,
    cacheHit,
  });
}

export function trackTranslateError(targetLang: string, error: string): void {
  trackEvent({
    type: "translate_error",
    targetLang,
    error,
  });
}

export function trackLanguageChange(targetLang: string, source: string): void {
  trackEvent({
    type: "language_change",
    targetLang,
    source,
  });
}

export function trackRateLimit(ip: string): void {
  trackEvent({
    type: "rate_limit_exceeded",
    targetLang: "unknown",
    error: ip,
  });
}

async function flush(): Promise<void> {
  if (eventQueue.length === 0) {
    return;
  }

  const events = [...eventQueue];
  eventQueue = [];

  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }

  try {
    await fetch(TELEMETRY_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ events }),
    });
  } catch {
    eventQueue.unshift(...events);
  }
}

export function getTelemetryStats(): {
  queued: number;
  supportedLanguages: string[];
} {
  return {
    queued: eventQueue.length,
    supportedLanguages: ["en", "es", "zh", "fr", "de", "pt", "ja", "ar", "ru", "ko"],
  };
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", flush);
}
