"use client";

import { AssistantRuntimeProvider, useLocalRuntime, type ChatModelAdapter } from "@assistant-ui/react";
import { ReactNode, useCallback, useEffect, useState } from "react";
import type { ChatMessage, DualContext } from "@/types/chat";
import { getFingerprint } from "@/lib/fingerprint";

interface ChatProviderProps {
  children: ReactNode;
  threadId?: string;
}

export function ChatProvider({ children, threadId }: ChatProviderProps) {
  const [userId, setUserId] = useState<string>("anonymous");
  const [conversationId, setConversationId] = useState<string>(threadId || "new-chat");

  useEffect(() => {
    const fp = getFingerprint();
    setUserId(fp);
    
    if (!threadId) {
      setConversationId(`conv_${Date.now()}_${fp.slice(-6)}`);
    }
  }, [threadId]);

  const adapter: any = useCallback(
    async function* ({ messages, abortSignal }: any) {
      // Build dual context (stub for now, will be replaced with backend context)
      const context: DualContext = {
        user: {
          id: userId,
          preferences: {
            language: typeof navigator !== "undefined" ? navigator.language : "en",
            responseStyle: "balanced",
            expertise: "intermediate",
          },
          sessionContext: {
            currentPage: typeof window !== "undefined" ? window.location.pathname : "/chat",
            recentActions: [],
            timeZone: typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC",
          },
          memory: {
            recentTopics: [],
          },
        },
        docs: {
          corpusId: "vivim-knowledge-base",
          relevantDocs: [],
          semanticSearch: {
            enabled: true,
            threshold: 0.7,
            maxResults: 5,
          },
        },
      };

      const formattedMessages: ChatMessage[] = messages.map((m: any) => ({
        role: m.role as "user" | "assistant",
        content:
          m.content
            .filter((p: any) => p.type === "text")
            .map((p: any) => (p as { type: "text"; text: string }).text)
            .join(""),
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-fingerprint": userId,
        },
        body: JSON.stringify({
          messages: formattedMessages,
          context,
          threadId: conversationId,
        }),
        signal: abortSignal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Chat API error: ${response.status} - ${errorText.substring(0, 200)}`);
      }

      response.headers.get("x-context-engine");

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let fullContent = "";
      let lastYieldTime = Date.now();
      const YIELD_INTERVAL = 50; // Yield every 50ms for smooth UI

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                
                // Yield more frequently for smooth streaming
                const now = Date.now();
                if (now - lastYieldTime > YIELD_INTERVAL) {
                  lastYieldTime = now;
                  yield {
                    content: [
                      {
                        type: "text" as const,
                        text: fullContent,
                      },
                    ],
                  };
                }
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      // Final yield
      yield {
        content: [
          {
            type: "text" as const,
            text: fullContent,
          },
        ],
      };
    },
    [userId, conversationId]
  );

  const runtime = useLocalRuntime(adapter);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
