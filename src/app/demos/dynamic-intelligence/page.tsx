"use client";

import { ArrowLeft, Brain } from "lucide-react";
import Link from "next/link";
import { DynamicIntelligenceDemo } from "@/components/dynamic-intelligence-demo";

export default function DynamicIntelligencePage() {
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-amber-500/30 mb-6">
            <Brain className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-slate-300">Dynamic Intelligence Demo</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-amber-400 to-rose-400 bg-clip-text text-transparent">
              Continual Learning
            </span>
            <br />
            <span className="text-white">Knowledge Graph Extraction</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            VIVIM analyzes every interaction securely, extracting entities, preferences, and facts, 
            wiring them into a personal knowledge graph. It learns continually with zero manual configuration.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <DynamicIntelligenceDemo />
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500 mb-6">
            Want to see how memories are tracked in real time? Try the{" "}
            <Link href="/demos/live-memory" className="text-amber-400 hover:text-amber-300">
              Live Memory Demo
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
