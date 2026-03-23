"use client";

import { ArrowLeft, Database } from "lucide-react";
import Link from "next/link";
import { SovereignHistoryDemo } from "@/components/sovereign-history-demo";

export default function SovereignHistoryPage() {
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-blue-500/30 mb-6">
            <Database className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-slate-300">Sovereign History Demo</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              Own Your Archives
            </span>
            <br />
            <span className="text-white">Universal Export</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Break free from siloed AI providers. VIVIM syncs and centrally organizes your history 
            across ChatGPT, Claude, and Gemini, giving you true ownership over your digital footprint.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <SovereignHistoryDemo />
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500 mb-6">
            Want to see how this integrates with local nodes? Try the{" "}
            <Link href="/demos/decentralized-network" className="text-blue-400 hover:text-blue-300">
              Decentralized Network Demo
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
