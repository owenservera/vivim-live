const GEO_API = "https://ip-api.com/json";
const CACHE_KEY = "vivim_geo";
const CACHE_DURATION = 24 * 60 * 60 * 1000;

export interface GeoLocation {
  countryCode: string;
  country: string;
  timezone: string;
  fetchedAt: number;
}

export interface LanguageMapping {
  [countryCode: string]: string;
}

const COUNTRY_TO_LANGUAGE: LanguageMapping = {
  CN: "zh",
  ES: "es",
  FR: "fr",
  DE: "de",
  PT: "pt",
  BR: "pt",
  JP: "ja",
  KR: "ko",
  RU: "ru",
  AR: "ar",
  SA: "ar",
  AE: "ar",
  IT: "it",
  NL: "nl",
  PL: "pl",
  TR: "tr",
  TH: "th",
  VI: "vi",
  ID: "id",
  MS: "ms",
  UK: "uk",
  CZ: "cs",
  HU: "hu",
  RO: "ro",
  GR: "el",
  HE: "he",
  HI: "hi",
  BN: "bn",
  TA: "ta",
  TE: "te",
  MR: "mr",
  KN: "kn",
  ML: "ml",
  PA: "pa",
};

const SUPPORTED_LANGUAGES = ["en", "es", "zh", "fr", "de", "pt", "ja", "ar", "ru", "ko"];

function getCached(): GeoLocation | null {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    const data = JSON.parse(cached) as GeoLocation;
    if (Date.now() - data.fetchedAt > CACHE_DURATION) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCached(data: GeoLocation): void {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable
  }
}

export async function detectLocation(): Promise<GeoLocation | null> {
  const cached = getCached();
  if (cached) {
    return cached;
  }

  try {
    const res = await fetch(`${GEO_API}?fields=countryCode,country,timezone`, {
      method: "GET",
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json() as GeoLocation;
    data.fetchedAt = Date.now();

    setCached(data);
    return data;
  } catch {
    return null;
  }
}

export function getRecommendedLanguage(countryCode: string): string | null {
  const lang = COUNTRY_TO_LANGUAGE[countryCode.toUpperCase()];
  if (lang && SUPPORTED_LANGUAGES.includes(lang)) {
    return lang;
  }
  return null;
}

export function suggestLanguageFromLocation(): Promise<string | null> {
  return detectLocation().then((geo) => {
    if (!geo || !geo.countryCode) return null;
    return getRecommendedLanguage(geo.countryCode);
  });
}
