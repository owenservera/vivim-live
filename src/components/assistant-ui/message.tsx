"use client";

import { MessagePrimitive, ActionBarPrimitive } from "@assistant-ui/react";
import { cn } from "@/lib/utils";
import { Copy, RotateCcw } from "lucide-react";

export function UserMessage() {
  return (
    <MessagePrimitive.Root
      className={cn("flex justify-end mb-4 group", "data-[editing]:mb-2")}
    >
      <div
        className={cn(
          "max-w-[85%] px-4 py-3 rounded-2xl rounded-br-md",
          "bg-gradient-to-r from-violet-600 to-cyan-600",
          "text-white text-sm"
        )}
      >
        <MessagePrimitive.Content />
      </div>
    </MessagePrimitive.Root>
  );
}

export function AssistantMessage() {
  return (
    <MessagePrimitive.Root className={cn("flex justify-start mb-4 group")}>
      <div
        className={cn(
          "max-w-[85%] px-4 py-3 rounded-2xl rounded-bl-md",
          "bg-slate-800/80 border border-white/5",
          "text-slate-200 text-sm"
        )}
      >
        <MessagePrimitive.Content
          components={{
            Text: TextPart,
          }}
        />

        <ActionBarPrimitive.Root
          className={cn(
            "flex items-center gap-1 mt-2 pt-2 border-t border-white/5",
            "opacity-0 group-hover:opacity-100 transition-opacity"
          )}
          hideWhenRunning
        >
          <ActionBarPrimitive.Copy
            className={cn(
              "p-1.5 rounded-md",
              "text-slate-400 hover:text-white hover:bg-white/5",
              "transition-colors"
            )}
          >
            <Copy className="w-3.5 h-3.5" />
          </ActionBarPrimitive.Copy>

          <ActionBarPrimitive.Reload
            className={cn(
              "p-1.5 rounded-md",
              "text-slate-400 hover:text-white hover:bg-white/5",
              "transition-colors"
            )}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </ActionBarPrimitive.Reload>
        </ActionBarPrimitive.Root>
      </div>
    </MessagePrimitive.Root>
  );
}

function TextPart({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="whitespace-pre-wrap break-words [&_code]:bg-slate-700/50 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-cyan-300 [&_code]:font-mono [&_code]:text-xs">
      {lines.map((line, i) => (
        <span key={`line-${i}-${line.slice(0, 10)}`}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </div>
  );
}
