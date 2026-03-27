"use client";

import { ChatProvider } from "@/components/chat/chat-provider";
import { Thread } from "@/components/assistant-ui";
import { cn } from "@/lib/utils";

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/20 via-slate-950 to-cyan-900/20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col h-screen">
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center",
                "bg-gradient-to-br from-violet-500/20 to-cyan-500/20",
                "border border-white/10"
              )}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 40 40"
                fill="none"
                className="text-violet-400"
                role="img"
                aria-label="VIVIM"
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
            <div>
              <h1 className="text-lg font-semibold text-white">VIVIM Chat</h1>
              <p className="text-xs text-slate-400">Powered by your personal memory</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Stub Context
            </span>
          </div>
        </header>

        <div className="flex-1 overflow-hidden p-4 md:p-6">
          <div className="max-w-4xl mx-auto h-full">
            <ChatProvider>
              <Thread />
            </ChatProvider>
          </div>
        </div>

        <footer className="px-6 py-3 border-t border-white/5">
          <p className="text-xs text-center text-slate-500">
            VIVIM Assistant uses your personal context to provide relevant responses
          </p>
        </footer>
      </div>
    </main>
  );
}
