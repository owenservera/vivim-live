"use client";

import { AssistantRuntimeProvider, useLocalRuntime, type ChatModelAdapter } from "@assistant-ui/react";
import { ReactNode } from "react";
import { buildDualContext } from "@/lib/chat/context";
import type { ChatMessage, DualContext } from "@/types/chat";

interface ChatProviderProps {
  children: ReactNode;
  threadId?: string;
  userId?: string;
}

export function ChatProvider({ children, threadId, userId }: ChatProviderProps) {
  const adapter: ChatModelAdapter = {
    async *run({ messages, abortSignal }) {
      const context: DualContext = await buildDualContext(userId);

      const formattedMessages: ChatMessage[] = messages.map((m) => ({
        role: m.role as "user" | "assistant",
        content:
          m.content
            .filter((p) => p.type === "text")
            .map((p) => (p as { type: "text"; text: string }).text)
            .join(""),
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: formattedMessages,
          context,
          threadId,
        }),
        signal: abortSignal,
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
      }

      const text = await response.text();
      const lines = text.split("\n");

      let fullContent = "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") break;

          try {
            const chunk = JSON.parse(data);
            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
              yield {
                content: [
                  {
                    type: "text" as const,
                    text: fullContent,
                  },
                ],
              };
            }
          } catch {
            break;
          }
        }
      }

      yield {
        content: [
          {
            type: "text" as const,
            text: fullContent,
          },
        ],
      };
    },
  };

  const runtime = useLocalRuntime(adapter);

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      {children}
    </AssistantRuntimeProvider>
  );
}
