import { NextRequest, NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/chat/context";
import type { ChatRequest } from "@/types/chat";
import { globalRateLimiter, RequestPriority } from "@/lib/rate-limiter";

const ZAI_API_KEY = process.env.ZAI_API_KEY;
const ZAI_BASE_URL = process.env.ZAI_BASE_URL ?? "https://api.z.ai/api/coding/paas/v4";
const ZAI_CHAT_MODEL = process.env.ZAI_CHAT_MODEL ?? process.env.ZAI_TRANSLATE_MODEL ?? "glm-4.7-flash";
const ZAI_CHAT_TEMPERATURE = parseFloat(process.env.ZAI_CHAT_TEMPERATURE ?? process.env.TRANSLATE_TEMPERATURE ?? "0.1");
const ZAI_MAX_TOKENS = parseInt(process.env.ZAI_MAX_TOKENS ?? "4096");

const DEBUG = process.env.DEBUG_CHAT === "true";

function log(level: string, message: string, data?: unknown) {
  const prefix = `[chat:${level.toLowerCase()}]`;
  const timestamp = new Date().toISOString();
  if (DEBUG || level === "ERROR") {
    console.log(`${prefix} ${timestamp}`, message, data ?? "");
  }
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const requestId = Math.random().toString(36).substring(2, 10);

  try {
    log("INFO", `Request ${requestId} started`);

  if (!ZAI_API_KEY) {
      log("ERROR", "ZAI_API_KEY not configured - check environment variables");
      return NextResponse.json(
        { 
          error: "Chat API not configured",
          details: "ZAI_API_KEY environment variable is not set. Please configure your API key.",
          debug: {
            apiKeyConfigured: false,
            model: ZAI_CHAT_MODEL,
            baseUrl: ZAI_BASE_URL,
            envVars: Object.keys(process.env).filter(k => k.startsWith('ZAI')),
          }
        },
        { status: 503 }
      );
    }

  const body: ChatRequest = await req.json();
    const { messages, context, threadId } = body;

    if (!messages?.length) {
      log("WARN", "No messages provided");
      return NextResponse.json(
        { error: "Messages required" },
        { status: 400 }
      );
    }

    log("INFO", "Processing request", {
      requestId,
      messageCount: messages.length,
      threadId: threadId ?? "new",
      userId: context?.user?.id ?? "anonymous",
    });

  const systemPrompt = buildSystemPrompt(context);

  const zaiMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content: m.content,
      })),
    ];

    log("DEBUG", "Calling Z.AI", {
      model: ZAI_CHAT_MODEL,
      temperature: ZAI_CHAT_TEMPERATURE,
      messageCount: zaiMessages.length,
    });

    // Use global rate limiter to enforce 2-second interval for all AI requests
    const zaiResponse = await globalRateLimiter.submit(
      async () => {
        const response = await fetch(`${ZAI_BASE_URL}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${ZAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: ZAI_CHAT_MODEL,
            messages: zaiMessages,
            stream: true,
            temperature: ZAI_CHAT_TEMPERATURE,
            max_tokens: ZAI_MAX_TOKENS,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          log("ERROR", "Z.AI API error", {
            status: response.status,
            error: errorText.substring(0, 500),
          });

          let errorDetail = `Z.AI API error: ${response.status}`;
          if (response.status === 401) {
            errorDetail = "Invalid or missing ZAI_API_KEY. Please check your API key.";
          } else if (response.status === 403) {
            errorDetail = "Access forbidden. Check your ZAI_API_KEY permissions.";
          } else if (response.status === 429) {
            errorDetail = "Rate limit exceeded. Please try again later.";
          }

          const errorResponse = Response.json(
            {
              error: errorDetail,
              details: errorText.substring(0, 500),
              debug: {
                model: ZAI_CHAT_MODEL,
                apiKeyConfigured: !!ZAI_API_KEY,
                baseUrl: ZAI_BASE_URL,
              }
            },
            { status: response.status }
          );
          throw errorResponse;
        }

        return response;
      },
      { priority: RequestPriority.HIGH, timeoutMs: 90000 }
    );

    log("INFO", "Z.AI streaming started", { requestId });

  const duration = Date.now() - startTime;
    log("SUCCESS", `Request ${requestId} completed`, { duration: `${duration}ms` });

    return new Response(zaiResponse.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    
    // Handle Response errors thrown from rate limiter
    if (error instanceof Response) {
      return error;
    }
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Handle queue-specific errors
    if (error.code === 'QUEUE_FULL') {
      log("WARN", `Request ${requestId} rejected - queue full`);
      return NextResponse.json(
        { 
          error: "Service busy", 
          details: "Too many requests queued. Please try again in a moment.",
          requestId 
        },
        { status: 503 }
      );
    }

    if (error.code === 'TIMEOUT') {
      log("ERROR", `Request ${requestId} timed out`);
      return NextResponse.json(
        { 
          error: "Request timeout", 
          details: "The request took too long to process. Please try again.",
          requestId 
        },
        { status: 504 }
      );
    }

    log("ERROR", "Unhandled error", {
      requestId,
      duration: `${duration}ms`,
      error: errorMessage,
      stack: errorStack,
    });

    let userMessage = "Internal server error";
    let details = "An unexpected error occurred";

    if (errorMessage.includes("fetch")) {
      if (errorMessage.includes("ECONNREFUSED")) {
        userMessage = "Backend service unavailable";
        details = "Cannot connect to backend. Please ensure the backend service is running.";
      } else if (errorMessage.includes("ENOTFOUND")) {
        userMessage = "Backend not found";
        details = "Cannot resolve backend URL. Check configuration.";
      } else {
        userMessage = "Network error";
        details = `Network error: ${errorMessage}`;
      }
    }

    return NextResponse.json(
      {
        error: userMessage,
        details: details,
        requestId,
        debug: {
          apiKeyConfigured: !!ZAI_API_KEY,
          model: ZAI_CHAT_MODEL,
        }
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "vivim-chat",
    model: ZAI_CHAT_MODEL,
    endpoint: ZAI_BASE_URL,
    configured: !!ZAI_API_KEY,
    features: {
      streaming: true,
      dualContext: true,
      stubContext: true,
    },
  });
}
