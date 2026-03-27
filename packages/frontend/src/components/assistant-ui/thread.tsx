"use client";

import { ThreadPrimitive, ComposerPrimitive } from "@assistant-ui/react";
import { cn } from "@/lib/utils";
import { Circle } from "lucide-react";
import { AssistantMessage, UserMessage } from "./message";

export function Thread() {
  return (
    <ThreadPrimitive.Root
      className={cn(
        "flex flex-col h-full w-full",
        "bg-slate-900/50 backdrop-blur-xl",
        "border border-white/10 rounded-2xl",
        "overflow-hidden"
      )}
    >
      <ThreadPrimitive.Empty>
        <div className="flex flex-col items-center justify-center h-full text-center p-8">
          <div
            className={cn(
              "w-20 h-20 rounded-2xl mb-6",
              "bg-gradient-to-br from-violet-500/20 to-cyan-500/20",
              "border border-white/10",
              "flex items-center justify-center"
            )}
          >
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              className="text-violet-400"
              role="img"
              aria-label="VIVIM Logo"
            >
              <path
                d="M20 4L4 12L20 20L36 12L20 4Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M4 20L20 28L36 20"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M4 28L20 36L36 28"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            Start a conversation
          </h3>
          <p className="text-sm text-slate-400 max-w-sm">
            Ask me anything about VIVIM, your memory, or how I can help you today.
          </p>
        </div>
      </ThreadPrimitive.Empty>

      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-slate-900/50">
        <div className="flex items-center gap-2">
          <Circle className="w-2 h-2 fill-emerald-400 text-emerald-400 animate-pulse" />
          <span className="text-sm font-medium text-slate-300">VIVIM Assistant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500">Context:</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
            USER
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            DOCS
          </span>
        </div>
      </div>

      <ThreadPrimitive.Viewport className="flex-1 overflow-y-auto">
        <ThreadPrimitive.Messages
          components={{
            UserMessage,
            AssistantMessage,
          }}
        />
      </ThreadPrimitive.Viewport>

      <div className="p-4 border-t border-white/5 bg-slate-900/30">
        <Composer />
      </div>
    </ThreadPrimitive.Root>
  );
}

function Composer() {
  return (
    <ComposerPrimitive.Root
      className={cn(
        "flex items-end gap-2 p-2 rounded-xl",
        "bg-slate-800/50 border border-white/5"
      )}
    >
      <ComposerPrimitive.Input
        placeholder="Ask VIVIM anything..."
        className={cn(
          "flex-1 bg-transparent text-white placeholder:text-slate-500",
          "focus:outline-none text-sm resize-none min-h-[24px] max-h-[120px]"
        )}
        rows={1}
      />

      <ComposerPrimitive.Send
        className={cn(
          "p-2 rounded-lg transition-all",
          "bg-gradient-to-r from-violet-600 to-cyan-600",
          "hover:from-violet-500 hover:to-cyan-500",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "disabled:hover:from-violet-600 disabled:hover:to-cyan-600"
        )}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-white"
          role="img"
          aria-label="Send message"
        >
          <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" />
        </svg>
      </ComposerPrimitive.Send>
    </ComposerPrimitive.Root>
  );
}
