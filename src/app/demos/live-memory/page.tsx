"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

type MemoryItem = {
  id: string;
  content: string;
  type: "PREFERENCE" | "IDENTITY" | "GOAL" | "EPISODIC";
  timestamp: Date;
  confidence: number;
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

const DEMO_FLOWS = [
  {
    userInput: "I'm a Python developer building a data pipeline",
    memories: [
      { content: "User is a Python developer", type: "IDENTITY" as const, confidence: 0.95 },
      { content: "Working on data pipeline project", type: "GOAL" as const, confidence: 0.88 },
    ],
    response: "Got it! I'll remember you work with Python and are building a data pipeline. Want to talk about frameworks? Prefect, Airflow, or something lighter?",
  },
  {
    userInput: "I prefer Prefect and always use type hints",
    memories: [
      { content: "Prefers Prefect for orchestration", type: "PREFERENCE" as const, confidence: 0.97 },
      { content: "Always uses Python type hints", type: "PREFERENCE" as const, confidence: 0.99 },
    ],
    response: "Perfect — Prefect with strict typing. I'll build all future suggestions around this. Need help with a typed flow decorator?",
  },
  {
    userInput: "Yes! And make it work with pandas",
    memories: [
      { content: "Uses pandas for data manipulation", type: "PREFERENCE" as const, confidence: 0.91 },
    ],
    response: "Of course. Combining your Prefect preference with pandas — here's a typed flow that handles DataFrames...",
  },
];

export default function LiveMemoryDemoPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Hi! Tell me about what you're building. I'll remember everything." },
  ]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [flowIndex, setFlowIndex] = useState(0);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [newMemoryIds, setNewMemoryIds] = useState<Set<string>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const flow = DEMO_FLOWS[flowIndex];
    if (!flow) return;

    const userMsg = input || flow.userInput;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsTyping(true);

    setTimeout(() => {
      const newMems = flow.memories.map((m) => ({
        ...m,
        id: Math.random().toString(36).slice(2),
        timestamp: new Date(),
      }));
      setMemories((prev) => [...prev, ...newMems]);
      setNewMemoryIds(new Set(newMems.map((m) => m.id)));

      setTimeout(() => setNewMemoryIds(new Set()), 2000);
    }, 800);

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { role: "assistant", content: flow.response }]);
      setFlowIndex((i) => Math.min(i + 1, DEMO_FLOWS.length - 1));
    }, 1800);
  }

  const memoryTypeColors = {
    PREFERENCE: "text-violet-400 bg-violet-500/15 border-violet-500/30",
    IDENTITY: "text-cyan-400 bg-cyan-500/15 border-cyan-500/30",
    GOAL: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30",
    EPISODIC: "text-amber-400 bg-amber-500/15 border-amber-500/30",
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grain-overlay" />
      <div className="aura-glow" />

      <header className="relative z-10 p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/30 mb-6">
            <Brain className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-slate-300">Live Memory Demo</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Watch Memory
            </span>
            <br />
            <span className="text-white">Being Born</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            VIVIM automatically extracts and remembers key information from your conversations. 
            Click through the demo to see it in action — no setup required.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 rounded-2xl overflow-hidden border border-white/10 bg-slate-900/50">
          <div className="flex flex-col h-96">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-slate-800/40">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              </div>
              <span className="text-xs text-slate-500 ml-2">VIVIM Demo Chat</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-xl text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-violet-600/30 border border-violet-500/30 text-white"
                        : "bg-slate-800/60 border border-white/5 text-slate-300"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex gap-1.5 px-3 py-3"
                >
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce"
                      style={{ animationDelay: `${i * 150}ms` }}
                    />
                  ))}
                </motion.div>
              )}
              <div ref={scrollRef} />
            </div>

            <div className="border-t border-white/5 p-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder={
                    flowIndex < DEMO_FLOWS.length
                      ? DEMO_FLOWS[flowIndex].userInput
                      : "Memory full — reload to restart"
                  }
                  className="flex-1 bg-slate-800/50 border border-white/5 rounded-lg px-3 py-2 text-sm text-slate-300 placeholder:text-slate-600 outline-none focus:border-violet-500/50"
                />
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={flowIndex >= DEMO_FLOWS.length}
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40"
                >
                  Send
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col h-96 border-l border-white/5">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-slate-800/40">
              <Brain className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs text-slate-500">Live Memory Extraction</span>
              <span className="ml-auto text-xs text-violet-400 font-mono">
                {memories.length} ACUs
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              <AnimatePresence>
                {memories.map((mem) => (
                  <motion.div
                    key={mem.id}
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    className={`p-2.5 rounded-lg border text-xs ${memoryTypeColors[mem.type]} ${
                      newMemoryIds.has(mem.id) ? "ring-1 ring-violet-400/50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono font-bold tracking-wide">{mem.type}</span>
                      <span className="opacity-60">{Math.round(mem.confidence * 100)}% conf</span>
                    </div>
                    <p className="opacity-90 leading-relaxed">{mem.content}</p>
                  </motion.div>
                ))}
              </AnimatePresence>

              {memories.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 text-xs text-center">
                  <Sparkles className="w-6 h-6 mb-2 opacity-30" />
                  <p>Memories will appear as you chat</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500 mb-6">
            Want to see how the context engine works? Try the{" "}
            <Link href="/demos/context-engine" className="text-violet-400 hover:text-violet-300">
              Context Engine Demo
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
