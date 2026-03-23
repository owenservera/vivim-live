"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Zap,
  Shield,
  Layers,
  Lock,
  RefreshCw,
  Download,
  CheckCircle2,
  Database,
  Cpu,
  ChevronRight,
  Pin,
  Trash2,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type LayerState = "locked" | "ready" | "clearing" | "building" | "scanning";

type AcuType = "IDENTITY" | "PREFERENCE" | "DECISION" | "FACT" | "REASONING" | "CODE" | "QUESTION";

interface Layer {
  id: string;
  label: string;
  sublabel: string;
  color: string;
  tokens: number;
  maxTokens: number;
  state: LayerState;
  content: string;
}

interface JitAcu {
  id: string;
  name: string;
  type: string;
  confidence: number;
}

interface Scenario {
  id: "A" | "B";
  person: string;
  personEmoji: string;
  role: string;
  topic: string;
  topicEmoji: string;
  message: string;
  color: string;
  acuCount: number;
  bundleCount: number;
}

const SCENARIOS: Record<"A" | "B", Scenario> = {
  A: {
    id: "A",
    person: "Marcus",
    personEmoji: "💼",
    role: "CEO · Direct Report",
    topic: "Project Alpha",
    topicEmoji: "📊",
    message: '"What\'s our Q2 timeline risk?"',
    color: "#8B5CF6",
    acuCount: 6,
    bundleCount: 4,
  },
  B: {
    id: "B",
    person: "Lena",
    personEmoji: "📣",
    role: "Marketing Lead",
    topic: "Feature B Launch",
    topicEmoji: "🚀",
    message: '"Help me write positioning copy"',
    color: "#06B6D4",
    acuCount: 8,
    bundleCount: 5,
  },
};

const BASE_LAYERS = (scenario: "A" | "B"): Layer[] => [
  {
    id: "L0",
    label: "L0",
    sublabel: "Identity Core",
    color: "#8B5CF6",
    tokens: 280,
    maxTokens: 500,
    state: "locked",
    content:
      "## About This User\n- Owen Chen, Product Manager\n- Building B2B SaaS at Startco\n- 6 years in enterprise software",
  },
  {
    id: "L1",
    label: "L1",
    sublabel: "Response Style",
    color: "#6366F1",
    tokens: 340,
    maxTokens: 800,
    state: "locked",
    content:
      "## Response Guidelines\n- Use bullet lists always\n- Concise, exec-level framing\n- No hand-holding",
  },
  {
    id: "L2",
    label: "L2",
    sublabel: scenario === "A" ? "Topic: Project Alpha Roadmap" : "Topic: Feature B Launch",
    color: "#06B6D4",
    tokens: scenario === "A" ? 1480 : 1220,
    maxTokens: 3000,
    state: "ready",
    priority: "HIGH",
    content: scenario === "A"
      ? "## Topic: Project Alpha\n- Q2 deadline: May 1st\n- Risk: engineering capacity\n- Stakeholders: Marcus, CTO"
      : "## Topic: Feature B Launch\n- Goal: Q2 launch, SMB target\n- Focus: positioning copy\n- Owner: Lena (marketing)",
  },
  {
    id: "L3",
    label: "L3",
    sublabel: scenario === "A" ? "Entity: Marcus (CEO)" : "Entity: Lena (Marketing Lead)",
    color: "#EC4899",
    tokens: scenario === "A" ? 680 : 520,
    maxTokens: 1200,
    state: "ready",
    content: scenario === "A"
      ? "## Marcus Chen (CEO)\n- Relationship: direct report\n- Prefers executive summaries\n- Focus: risk and timeline"
      : "## Lena Park (Marketing Lead)\n- Relationship: cross-functional\n- Owns brand voice decisions\n- Prefers data-backed copy",
  },
  {
    id: "L4",
    label: "L4",
    sublabel: scenario === "A" ? "Arc: Q2 Planning Discussion" : "Arc: Feature B Kickoff",
    color: "#10B981",
    tokens: scenario === "A" ? 940 : 760,
    maxTokens: 2000,
    state: "ready",
    content: scenario === "A"
      ? "## Conversation Arc\n- Started Q2 planning review\n- Discussed eng capacity risks\n- [OPEN] Final timeline not set"
      : "## Conversation Arc\n- Kicked off Feature B positioning\n- Reviewed 3 copy directions\n- [OPEN] Headline copy undecided",
  },
  {
    id: "L5",
    label: "L5",
    sublabel: "JIT Retrieval",
    color: "#F59E0B",
    tokens: scenario === "A" ? 580 : 620,
    maxTokens: 2000,
    state: "ready",
    content: scenario === "A"
      ? "## Retrieved ACUs\n- eng-capacity-q2.acu\n- hiring-plan-2026.acu\n- risk-matrix-template.acu"
      : "## Retrieved ACUs\n- b2b-messaging-style.acu\n- feature-b-specs.acu\n- launch-copy-preference.acu",
  },
  {
    id: "L6",
    label: "L6",
    sublabel: "Message History (last 8)",
    color: "#3B82F6",
    tokens: 2100,
    maxTokens: 6000,
    state: "ready",
    content: "## Recent Messages\n[last 8 messages from current conversation thread]",
  },
  {
    id: "L7",
    label: "L7",
    sublabel: "Your Message",
    color: "#F1F5F9",
    tokens: scenario === "A" ? 120 : 140,
    maxTokens: 500,
    state: "locked",
    content: scenario === "A"
      ? '"What\'s our Q2 timeline risk?"'
      : '"Help me write positioning copy"',
  },
];

const JIT_ACUS: Record<"A" | "B", JitAcu[]> = {
  A: [
    { id: "1", name: "eng-capacity-q2.acu", type: "FACT", confidence: 0.91 },
    { id: "2", name: "hiring-plan-2026.acu", type: "DECISION", confidence: 0.83 },
    { id: "3", name: "risk-matrix-template.acu", type: "REASONING", confidence: 0.77 },
  ],
  B: [
    { id: "1", name: "b2b-messaging-style.acu", type: "PREFERENCE", confidence: 0.94 },
    { id: "2", name: "feature-b-specs.acu", type: "FACT", confidence: 0.88 },
    { id: "3", name: "launch-copy-preference.acu", type: "PREFERENCE", confidence: 0.82 },
  ],
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function LayerBar({ layer }: { layer: Layer }) {
  const fillPct = Math.round((layer.tokens / layer.maxTokens) * 100);
  const isLocked = layer.state === "locked";
  const isBuilding = layer.state === "building" || layer.state === "scanning";
  const isClearing = layer.state === "clearing";

  return (
    <div className="flex items-center gap-3 py-1.5">
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 border"
        style={{
          color: layer.color,
          borderColor: layer.color + "40",
          backgroundColor: layer.color + "12",
        }}
      >
        {isLocked ? <Lock className="w-3 h-3" /> : layer.label}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1 gap-2">
          <span className="text-xs text-slate-400 truncate">{layer.sublabel}</span>
          <span className="text-xs font-mono text-slate-500 flex-shrink-0">
            {isBuilding ? "…" : isClearing ? "—" : `${layer.tokens.toLocaleString()}t`}
          </span>
        </div>
        <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden relative">
          {!isClearing && (
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ backgroundColor: isBuilding ? "#F59E0B" : layer.color }}
              animate={{ width: isBuilding ? "60%" : `${fillPct}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          )}
          {isBuilding && <div className="absolute inset-0 rounded-full shimmer-anim" />}
        </div>
      </div>

      <div className="flex-shrink-0 w-4 flex justify-center">
        {isLocked && <Lock className="w-3 h-3 text-violet-400/60" />}
        {layer.state === "ready" && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
        {isBuilding && <RefreshCw className="w-3 h-3 text-amber-400 animate-spin" />}
        {isClearing && <div className="w-2 h-2 rounded-full bg-slate-600" />}
      </div>
    </div>
  );
}

function AcuChip({ acu, delay }: { acu: JitAcu; delay: number }) {
  return (
    <motion.div
      initial={{ x: 160, opacity: 0, scale: 0.85 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      exit={{ x: -60, opacity: 0, scale: 0.5 }}
      transition={{ type: "spring", stiffness: 220, damping: 22, delay }}
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs"
    >
      <Zap className="w-3 h-3 text-amber-400 flex-shrink-0" />
      <span className="text-amber-300 font-mono truncate max-w-[140px]">{acu.name}</span>
      <span className="text-amber-500 font-mono text-[10px]">
        {Math.round(acu.confidence * 100)}%
      </span>
    </motion.div>
  );
}

export default function ContextEngineDemoPage() {
  const [activeScenario, setActiveScenario] = useState<"A" | "B">("A");
  const [isAnimating, setIsAnimating] = useState(false);
  const [layers, setLayers] = useState<Layer[]>(BASE_LAYERS("A"));
  const [assemblyMs, setAssemblyMs] = useState(108);
  const [totalTokens, setTotalTokens] = useState(0);
  const [statusText, setStatusText] = useState("Context ready");
  const [statusColor, setStatusColor] = useState("text-emerald-400");
  const [jitAcus, setJitAcus] = useState<JitAcu[]>([]);
  const [showJit, setShowJit] = useState(false);
  const [expandedLayer, setExpandedLayer] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const total = layers.reduce((s, l) => s + (l.state === "clearing" ? 0 : l.tokens), 0);
    setTotalTokens(total);
  }, [layers]);

  async function switchScenario() {
    if (isAnimating) return;
    const next = activeScenario === "A" ? "B" : "A";
    setIsAnimating(true);
    setShowJit(false);
    setJitAcus([]);

    setStatusText("Detecting context...");
    setStatusColor("text-amber-400");
    setLayers((prev) =>
      prev.map((l) =>
        ["L2", "L3", "L4", "L5"].includes(l.id) ? { ...l, state: "clearing" as LayerState } : l
      )
    );
    await sleep(500);

    setStatusText("Fetching bundles...");
    const nextLayers = BASE_LAYERS(next);
    setLayers((prev) =>
      prev.map((l) => {
        if (l.id === "L2") return { ...nextLayers.find((n) => n.id === "L2")!, state: "building" as LayerState };
        if (l.id === "L3") return { ...nextLayers.find((n) => n.id === "L3")!, state: "building" as LayerState };
        return l;
      })
    );
    await sleep(400);
    setLayers((prev) =>
      prev.map((l) =>
        l.id === "L2" || l.id === "L3" ? { ...l, state: "ready" as LayerState } : l
      )
    );

    setLayers((prev) =>
      prev.map((l) =>
        l.id === "L4" ? { ...nextLayers.find((n) => n.id === "L4")!, state: "building" as LayerState } : l
      )
    );
    await sleep(350);
    setLayers((prev) =>
      prev.map((l) =>
        l.id === "L4" ? { ...l, state: "ready" as LayerState } : l
      )
    );

    setStatusText("Scanning store...");
    setStatusColor("text-amber-400");
    setLayers((prev) =>
      prev.map((l) =>
        l.id === "L5" ? { ...nextLayers.find((n) => n.id === "L5")!, state: "scanning" as LayerState } : l
      )
    );
    setShowJit(true);
    setJitAcus(JIT_ACUS[next]);
    await sleep(700);
    setLayers((prev) =>
      prev.map((l) =>
        l.id === "L5" ? { ...l, state: "ready" as LayerState } : l
      )
    );
    setShowJit(false);

    setStatusText("Assembling context...");
    setActiveScenario(next);
    setAssemblyMs(next === "A" ? 108 : 114);
    await sleep(400);

    setStatusText("Context ready");
    setStatusColor("text-emerald-400");
    setIsAnimating(false);
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950">
        <div className="grain-overlay" />
        <div className="aura-glow" />
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="rounded-2xl bg-slate-900/50 border border-white/8 h-[600px] animate-pulse" />
        </div>
      </div>
    );
  }

  const totalBudget = 12000;
  const fillPct = Math.round((totalTokens / totalBudget) * 100);

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

      <main className="relative z-10 py-12 lg:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/30 mb-6">
              <Cpu className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-slate-300">Context Engine Demo</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                Watch Context
              </span>
              <br />
              <span className="text-white">Being Born</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Every message triggers a bespoke 8-layer context injection, assembled from your
              ACU memory store in real-time. Switch scenarios below to see it rebuild from scratch.
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/50 border border-white/8 overflow-hidden shadow-2xl shadow-violet-500/5">
            <div className="grid lg:grid-cols-[220px_1fr_260px] gap-4 min-h-[480px] p-4 sm:p-6">
              <div className="flex flex-col gap-3">
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                  Conversations
                </p>

                {(["A", "B"] as const).map((sid) => {
                  const s = SCENARIOS[sid];
                  const isActive = activeScenario === sid;
                  return (
                    <motion.div
                      key={sid}
                      animate={isActive ? { boxShadow: `0 0 20px ${s.color}30` } : { boxShadow: "0 0 0 transparent" }}
                      className={`rounded-xl border p-3 transition-all duration-300 cursor-pointer ${
                        isActive
                          ? "border-white/15 bg-slate-800/60"
                          : "border-white/5 bg-slate-800/20 opacity-60 hover:opacity-80"
                      }`}
                      style={isActive ? { borderColor: s.color + "50" } : {}}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xl">{s.personEmoji}</span>
                        <div>
                          <p className="text-white text-sm font-semibold leading-none">{s.person}</p>
                          <p className="text-slate-500 text-[10px] mt-0.5">{s.role}</p>
                        </div>
                        {isActive && (
                          <div
                            className="ml-auto w-2 h-2 rounded-full animate-pulse"
                            style={{ backgroundColor: s.color }}
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <span className="text-sm">{s.topicEmoji}</span>
                        <span className="text-slate-400 text-xs">{s.topic}</span>
                      </div>
                      <p className="text-slate-500 text-[10px] italic leading-relaxed">{s.message}</p>
                      <div className="flex items-center gap-3 mt-2 pt-2 border-t border-white/5">
                        <span className="text-[10px] text-slate-600">🧠 {s.acuCount} ACUs</span>
                        <span className="text-[10px] text-slate-600">📦 {s.bundleCount} bundles</span>
                      </div>
                    </motion.div>
                  );
                })}

                <button
                  type="button"
                  onClick={switchScenario}
                  disabled={isAnimating}
                  className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all
                    bg-gradient-to-r from-violet-600/80 to-cyan-600/80 hover:from-violet-600 hover:to-cyan-600
                    text-white border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isAnimating ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Building...
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-3.5 h-3.5" /> Switch Context
                    </>
                  )}
                </button>
              </div>

              <div className="rounded-xl bg-slate-900/60 border border-white/5 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/5 bg-slate-800/30">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-3.5 h-3.5 text-violet-400" />
                    <span className="text-xs font-medium text-slate-400">Context Assembly Engine</span>
                  </div>
                  <span className={`text-xs font-mono ${statusColor} transition-colors`}>{statusText}</span>
                </div>

                <div className="flex-1 px-4 py-3 space-y-0.5 overflow-y-auto">
                  {layers.map((layer) => (
                    <div key={layer.id}>
                      <button
                        type="button"
                        className="cursor-pointer group w-full text-left"
                        onClick={() => setExpandedLayer(expandedLayer === layer.id ? null : layer.id)}
                      >
                        <LayerBar layer={layer} />
                      </button>
                      <AnimatePresence>
                        {expandedLayer === layer.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="ml-11 mb-2 p-2.5 rounded-lg bg-slate-800/50 border border-white/5">
                              <pre className="text-[10px] text-slate-400 font-mono whitespace-pre-wrap leading-relaxed">
                                {layer.content}
                              </pre>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}

                  <AnimatePresence>
                    {showJit &&
                      jitAcus.map((acu, i) => <AcuChip key={acu.id} acu={acu} delay={i * 0.18} />)}
                  </AnimatePresence>
                </div>

                <div className="px-4 py-2.5 border-t border-white/5 bg-slate-800/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-slate-500">Total context window</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-white">
                        {totalTokens.toLocaleString()}
                      </span>
                      <span className="text-xs text-slate-600">/ {totalBudget.toLocaleString()} t</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                      animate={{ width: `${fillPct}%` }}
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-1.5">
                    <span className="text-[10px] text-slate-600">{fillPct}% used</span>
                    <span className="text-[10px] text-emerald-400 font-mono">⚡ {assemblyMs}ms</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-slate-900/60 border border-white/5 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/5 bg-slate-800/30">
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="text-xs font-medium text-slate-400">Injected Context</span>
                  </div>
                  <span className="text-[10px] text-slate-600">What the AI sees</span>
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
                  {layers
                    .filter((l) => l.state === "ready" || l.state === "locked")
                    .map((layer) => (
                      <motion.div
                        key={`${layer.id}-${activeScenario}`}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="group"
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <div
                            className="w-0.5 h-full rounded-full self-stretch"
                            style={{ backgroundColor: layer.color }}
                          />
                          <span
                            className="text-[10px] font-mono font-bold"
                            style={{ color: layer.color }}
                          >
                            {layer.id}
                          </span>
                          <span className="text-[10px] text-slate-600">{layer.sublabel}</span>
                        </div>
                        <div
                          className="pl-3 border-l text-[10px] font-mono text-slate-400 leading-relaxed whitespace-pre-wrap"
                          style={{ borderColor: layer.color + "30" }}
                        >
                          {layer.content.split("\n").slice(0, 3).join("\n")}
                          {layer.content.split("\n").length > 3 && "\n..."}
                        </div>
                      </motion.div>
                    ))}
                </div>
                <div className="px-3 py-2 border-t border-white/5 bg-slate-800/20">
                  <p className="text-[10px] text-slate-600 text-center">
                    Click any layer bar to expand full content
                  </p>
                </div>
              </div>
            </div>

            <div className="px-6 py-3 border-t border-white/5 bg-slate-800/10">
              <p className="text-xs text-slate-600 text-center">
                No black box. VIVIM gives you full visibility into what gets injected, why, and lets
                you edit any piece of it.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm text-slate-500 mb-6">
              Want to see live memory extraction? Try the{" "}
              <Link href="/demos/live-memory" className="text-violet-400 hover:text-violet-300">
                Live Memory Demo
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
