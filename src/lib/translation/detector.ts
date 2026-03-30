import { detectLocation, getRecommendedLanguage } from "./geolocation";
import { detectLanguage } from "./langDetect";

export type DetectionSource = "explicit" | "url" | "geo" | "browser" | "history";

export interface DetectionSignal {
  source: DetectionSource;
  lang: string;
  confidence: number;
}

const STORAGE_KEY = "vivim_lang";
const HISTORY_KEY = "vivim_lang_history";

const SUPPORTED = ["en", "es", "zh", "fr", "de", "pt", "ja", "ar", "ru", "ko"];

const CONFIDENCE = {
  explicit: 1.0,
  url: 0.95,
  geo: 0.7,
  browser: 0.5,
  history: 0.3,
} as const;

export async function getDetectionSignals(): Promise<DetectionSignal[]> {
  const signals: DetectionSignal[] = [];

  const explicit = localStorage.getItem(STORAGE_KEY);
  if (explicit && SUPPORTED.includes(explicit)) {
    signals.push({ source: "explicit", lang: explicit, confidence: CONFIDENCE.explicit });
  }

  const urlMatch = window.location.pathname.match(/\/(es|fr|de|zh|ja|ko|ar|ru|pt)\/?/);
  if (urlMatch && SUPPORTED.includes(urlMatch[1])) {
    signals.push({ source: "url", lang: urlMatch[1], confidence: CONFIDENCE.url });
  }

  try {
    const geo = await detectLocation();
    if (geo?.countryCode) {
      const recommended = getRecommendedLanguage(geo.countryCode);
      if (recommended && SUPPORTED.includes(recommended)) {
        signals.push({ source: "geo", lang: recommended, confidence: CONFIDENCE.geo });
      }
    }
  } catch {}

  const browser = navigator.language?.split("-")[0]?.toLowerCase();
  if (browser && SUPPORTED.includes(browser)) {
    signals.push({ source: "browser", lang: browser, confidence: CONFIDENCE.browser });
  }

  const history = localStorage.getItem(HISTORY_KEY);
  if (history && SUPPORTED.includes(history)) {
    signals.push({ source: "history", lang: history, confidence: CONFIDENCE.history });
  }

  return signals.sort((a, b) => b.confidence - a.confidence);
}

export async function detectLanguageMultiSignal(): Promise<string> {
  const signals = await getDetectionSignals();
  
  if (signals.length === 0) {
    return "en";
  }

  const top = signals[0];
  
  addToHistory(top.lang);
  
  return top.lang;
}

export function setLanguagePreference(lang: string): void {
  if (SUPPORTED.includes(lang)) {
    localStorage.setItem(STORAGE_KEY, lang);
  }
}

function addToHistory(lang: string): void {
  try {
    const existing = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]") as string[];
    const filtered = existing.filter((l) => l !== lang);
    const updated = [lang, ...filtered].slice(0, 5);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    localStorage.setItem(HISTORY_KEY, JSON.stringify([lang]));
  }
}

export function isRTL(lang: string): boolean {
  return ["ar", "he", "fa", "ur"].includes(lang);
}
