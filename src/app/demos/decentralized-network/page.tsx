"use client";

import { ArrowLeft, Globe } from "lucide-react";
import Link from "next/link";
import { DecentralizedNetworkDemo } from "@/components/decentralized-network-demo";

export default function DecentralizedNetworkPage() {
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cyan-500/30 mb-6">
            <Globe className="w-4 h-4 text-cyan-400" />
            <span className="text-sm text-slate-300">Decentralized Network Demo</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">
              Local-First CRDT
            </span>
            <br />
            <span className="text-white">Peer-to-Peer Sync</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            VIVIM runs as a local-first node on your device. It synchronizes data natively across 
            your trusted devices and peers using CRDTs, ensuring conflict-free operations even when offline.
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <DecentralizedNetworkDemo />
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500 mb-6">
            Want to see how we manage privacy across devices? Try the{" "}
            <Link href="/demos/secure-collaboration" className="text-cyan-400 hover:text-cyan-300">
              Secure Collaboration Demo
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
