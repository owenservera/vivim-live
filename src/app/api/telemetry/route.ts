import { NextRequest, NextResponse } from "next/server";

interface TelemetryRequest {
  events: Array<{
    type: string;
    targetLang: string;
    stringCount?: number;
    duration?: number;
    cacheHit?: boolean;
    error?: string;
    source?: string;
    timestamp: number;
  }>;
}

interface AggregatedStats {
  totalRequests: number;
  totalStringsTranslated: number;
  cacheHitRate: number;
  avgLatency: number;
  languageDistribution: Record<string, number>;
  errorRate: number;
}

const WINDOW_MS = 60_000;
const events: Map<string, number> = new Map();

function sanitizeEvent(event: TelemetryRequest["events"][0]) {
  return {
    type: event.type,
    targetLang: event.targetLang,
    stringCount: event.stringCount || 0,
    duration: event.duration || 0,
    cacheHit: event.cacheHit || false,
    error: event.error?.slice(0, 100),
    source: event.source,
    timestamp: event.timestamp,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as TelemetryRequest;
    const { events: incomingEvents } = body;

    if (!incomingEvents?.length) {
      return NextResponse.json({ error: "No events provided" }, { status: 400 });
    }

    const now = Date.now();
    const windowStart = now - WINDOW_MS;

    for (const event of incomingEvents) {
      const key = `${event.type}:${event.targetLang}:${now}`;
      events.set(key, now);
    }

    const recentEvents = [...events.entries()]
      .filter(([, timestamp]) => timestamp > windowStart)
      .map(([key]) => key);

    events.clear();
    for (const key of recentEvents) {
      events.set(key, now);
    }

    const sanitized = incomingEvents.map(sanitizeEvent);

    return NextResponse.json({
      status: "ok",
      received: sanitized.length,
    });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    endpoint: "/api/telemetry",
    features: {
      batching: true,
      flushInterval: 5000,
      batchSize: 10,
    },
  });
}
