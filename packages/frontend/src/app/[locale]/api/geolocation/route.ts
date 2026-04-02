import { NextRequest, NextResponse } from "next/server";

const GEO_API = "http://ip-api.com/json";

const COUNTRY_TO_LANGUAGE: Record<string, string> = {
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
};

const SUPPORTED_LANGUAGES = ["en", "es", "zh", "fr", "de", "pt", "ja", "ar", "ru", "ko"];

const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  green: "\x1b[32m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
  gray: "\x1b[90m",
};

function log(message: string, data?: unknown) {
  const timestamp = new Date().toISOString();
  console.log(`${colors.gray}[${timestamp}]${colors.reset} ${colors.cyan}[geo]${colors.reset} ${message}`);
  if (data) console.log(JSON.stringify(data, null, 2));
}

export async function GET(req: NextRequest) {
  const requestId = Math.random().toString(36).substring(2, 10);
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
    ?? req.headers.get("x-real-ip") 
    ?? req.headers.get("cf-connecting-ip")
    ?? "unknown";

  log(`Request #${requestId}`, { ip });

  try {
    const geoRes = await fetch(`${GEO_API}?fields=countryCode,country,timezone,city`, {
      headers: {
        "User-Agent": "vivim-translation/1.0",
      },
    });

    if (!geoRes.ok) {
      log(`GeoAPI error: ${geoRes.status}`);
      return NextResponse.json(
        { error: "Location detection unavailable" },
        { status: 502 }
      );
    }

    const geo = await geoRes.json();
    const countryCode = geo.countryCode;
    const recommendedLang = COUNTRY_TO_LANGUAGE[countryCode];
    const isSupported = recommendedLang && SUPPORTED_LANGUAGES.includes(recommendedLang);

    log(`Location resolved #${requestId}`, {
      country: geo.country,
      countryCode,
      city: geo.city,
      recommendedLang: recommendedLang ?? "none",
      supported: isSupported,
    });

    return NextResponse.json({
      countryCode,
      country: geo.country,
      city: geo.city,
      timezone: geo.timezone,
      recommendedLanguage: isSupported ? recommendedLang : null,
      isSupported,
    });
  } catch (err) {
    log(`Error #${requestId}`, { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
