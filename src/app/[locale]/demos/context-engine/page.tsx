"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import {
  Brain, Zap, Shield, Layers, Lock, Pin, Trash2, Eye,
  Activity, ChevronRight, RefreshCw, Download, AlertCircle,
  CheckCircle2, Clock, Database, Cpu, User, Users, ArrowLeft
} from "lucide-react";
import Link from "next/link";

// ─── Types ───────────────────────────────────────────────────────────────────

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
  priority: "LOCKED" | "HIGH" | "MEDIUM" | "STANDARD";
}

interface Acu {
  id: string;
  type: AcuType;
  content: string;
  confidence: number;
  layer: string;
  source: string;
  pinned: boolean;
  cacheHit: boolean;
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

interface JitAcu {
  id: string;
  name: string;
  type: string;
  confidence: number;
}

// ─── Data ────────────────────────────────────────────────────────────────────

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
    id: "L0", label: "L0", sublabel: "Identity Core",
    color: "#8B5CF6", tokens: 280, maxTokens: 500,
    state: "locked", priority: "LOCKED",
    content: "## About This User\n- Owen Chen, Product Manager\n- Building B2B SaaS at Startco\n- 6 years in enterprise software",
  },
  {
    id: "L1", label: "L1", sublabel: "Response Style",
    color: "#6366F1", tokens: 340, maxTokens: 800,
    state: "locked", priority: "HIGH",
    content: "## Response Guidelines\n- Use bullet lists always\n- Concise, exec-level framing\n- No hand-holding",
  },
  {
    id: "L2", label: "L2",
    sublabel: scenario === "A" ? "Topic: Project Alpha Roadmap" : "Topic: Feature B Launch",
    color: "#06B6D4", tokens: scenario === "A" ? 1480 : 1220, maxTokens: 3000,
    state: "ready", priority: "HIGH",
    content: scenario === "A"
      ? "## Topic: Project Alpha\n- Q2 deadline: May 1st\n- Risk: engineering capacity\n- Stakeholders: Marcus, CTO"
      : "## Topic: Feature B Launch\n- Goal: Q2 launch, SMB target\n- Focus: positioning copy\n- Owner: Lena (marketing)",
  },
  {
    id: "L3", label: "L3",
    sublabel: scenario === "A" ? "Entity: Marcus (CEO)" : "Entity: Lena (Marketing Lead)",
    color: "#EC4899", tokens: scenario === "A" ? 680 : 520, maxTokens: 1200,
    state: "ready", priority: "MEDIUM",
    content: scenario === "A"
      ? "## Marcus Chen (CEO)\n- Relationship: direct report\n- Prefers executive summaries\n- Focus: risk and timeline"
      : "## Lena Park (Marketing Lead)\n- Relationship: cross-functional\n- Owns brand voice decisions\n- Prefers data-backed copy",
  },
  {
    id: "L4", label: "L4",
    sublabel: scenario === "A" ? "Arc: Q2 Planning Discussion" : "Arc: Feature B Kickoff",
    color: "#10B981", tokens: scenario === "A" ? 940 : 760, maxTokens: 2000,
    state: "ready", priority: "HIGH",
    content: scenario === "A"
      ? "## Conversation Arc\n- Started Q2 planning review\n- Discussed eng capacity risks\n- [OPEN] Final timeline not set"
      : "## Conversation Arc\n- Kicked off Feature B positioning\n- Reviewed 3 copy directions\n- [OPEN] Headline copy undecided",
  },
  {
    id: "L5", label: "L5", sublabel: "JIT Retrieval",
    color: "#F59E0B", tokens: scenario === "A" ? 580 : 620, maxTokens: 2000,
    state: "ready", priority: "MEDIUM",
    content: scenario === "A"
      ? "## Retrieved ACUs\n- eng-capacity-q2.acu\n- hiring-plan-2026.acu\n- risk-matrix-template.acu"
      : "## Retrieved ACUs\n- b2b-messaging-style.acu\n- feature-b-specs.acu\n- launch-copy-preference.acu",
  },
  {
    id: "L6", label: "L6", sublabel: "Message History (last 8)",
    color: "#3B82F6", tokens: 2100, maxTokens: 6000,
    state: "ready", priority: "STANDARD",
    content: "## Recent Messages\n[last 8 messages from current conversation thread]",
  },
  {
    id: "L7", label: "L7", sublabel: "Your Message",
    color: "#F1F5F9", tokens: scenario === "A" ? 120 : 140, maxTokens: 500,
    state: "locked", priority: "LOCKED",
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

const DEMO_ACUS: Acu[] = [
  { id: "1", type: "IDENTITY", content: "Owen Chen is a Product Manager at Startco, building a B2B SaaS tool for enterprise workflows.", confidence: 0.98, layer: "L0", source: "Profile setup", pinned: true, cacheHit: true },
  { id: "2", type: "PREFERENCE", content: "Always use bullet points over prose. Keep responses concise and executive-level.", confidence: 0.94, layer: "L1", source: "Global prefs", pinned: true, cacheHit: true },
  { id: "3", type: "DECISION", content: "Decided to delay Feature v2.0 to Q3 due to engineering capacity constraints.", confidence: 0.89, layer: "L2", source: "Marcus · Roadmap conv", pinned: false, cacheHit: true },
  { id: "4", type: "FACT", content: "Q2 engineering team is at 87% capacity. Two senior engineers on PTO in May.", confidence: 0.91, layer: "L5", source: "Planning session", pinned: false, cacheHit: false },
  { id: "5", type: "REASONING", content: "Feature B positioning should target SMB first because enterprise cycle is too long for Q2.", confidence: 0.77, layer: "L2", source: "Lena · Feature B kickoff", pinned: false, cacheHit: true },
  { id: "6", type: "PREFERENCE", content: "Lena prefers data-backed copy. Always include a stat or metric in the headline.", confidence: 0.86, layer: "L3", source: "Lena · Brand meeting", pinned: false, cacheHit: true },
  { id: "7", type: "FACT", content: "Marcus always wants risk summary first, then options, then recommendation.", confidence: 0.93, layer: "L3", source: "Marcus · Q1 review", pinned: true, cacheHit: true },
  { id: "8", type: "DECISION", content: "Chose Vercel for deployment over AWS to reduce ops overhead.", confidence: 0.88, layer: "L5", source: "Dev planning", pinned: false, cacheHit: false },
];

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

// ─── Sub-Components ───────────────────────────────────────────────────────────

const ACU_TYPE_META: Record<AcuType, { color: string; bg: string; border: string }> = {
  IDENTITY:   { color: "#8B5CF6", bg: "bg-violet-500/10",  border: "border-violet-500/30" },
  PREFERENCE: { color: "#6366F1", bg: "bg-indigo-500/10",  border: "border-indigo-500/30" },
  DECISION:   { color: "#10B981", bg: "bg-emerald-500/10", border: "border-emerald-500/30" },
  FACT:       { color: "#06B6D4", bg: "bg-cyan-500/10",    border: "border-cyan-500/30"   },
  REASONING:  { color: "#F59E0B", bg: "bg-amber-500/10",   border: "border-amber-500/30"  },
  CODE:       { color: "#EC4899", bg: "bg-pink-500/10",    border: "border-pink-500/30"   },
  QUESTION:   { color: "#3B82F6", bg: "bg-blue-500/10",    border: "border-blue-500/30"   },
};

function AcuTypeBadge({ type }: { type: AcuType }) {
  const meta = ACU_TYPE_META[type];
  return (
    <span
      className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-bold tracking-widest uppercase border ${meta.bg} ${meta.border}`}
      style={{ color: meta.color }}
    >
      {type}
    </span>
  );
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
          {isBuilding && (
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
                backgroundSize: "200% 100%",
                animation: "shimmer 1s ease infinite",
              }}
            />
          )}
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
      <span className="text-amber-500 font-mono text-[10px]">{Math.round(acu.confidence * 100)}%</span>
    </motion.div>
  );
}

// ─── TAB 1: Context Shift ────────────────────────────────────────────────────

function ContextShiftTab() {
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

    setStatusText("Detecting context shift...");
    setStatusColor("text-amber-400");
    setLayers((prev) =>
      prev.map((l) =>
        ["L2", "L3", "L4", "L5"].includes(l.id) ? { ...l, state: "clearing" } : l
      )
    );
    await sleep(500);

    setStatusText("Fetching pre-built bundles...");
    const nextLayers = BASE_LAYERS(next);
    setLayers((prev) =>
      prev.map((l) => {
        if (l.id === "L2") return { ...nextLayers.find((n) => n.id === "L2")!, state: "building" };
        if (l.id === "L3") return { ...nextLayers.find((n) => n.id === "L3")!, state: "building" };
        return l;
      })
    );
    await sleep(400);
    setLayers((prev) =>
      prev.map((l) => (l.id === "L2" || l.id === "L3" ? { ...l, state: "ready" } : l))
    );

    setLayers((prev) =>
      prev.map((l) =>
        l.id === "L4" ? { ...nextLayers.find((n) => n.id === "L4")!, state: "building" } : l
      )
    );
    await sleep(350);
    setLayers((prev) =>
      prev.map((l) => (l.id === "L4" ? { ...l, state: "ready" } : l))
    );

    setStatusText("Scanning ACU store...");
    setStatusColor("text-amber-400");
    setLayers((prev) =>
      prev.map((l) =>
        l.id === "L5" ? { ...nextLayers.find((n) => n.id === "L5")!, state: "scanning" } : l
      )
    );
    setShowJit(true);
    setJitAcus(JIT_ACUS[next]);
    await sleep(700);
    setLayers((prev) =>
      prev.map((l) => (l.id === "L5" ? { ...l, state: "ready" } : l))
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

  const totalBudget = 12000;
  const fillPct = Math.round((totalTokens / totalBudget) * 100);

  return (
    <div className="grid lg:grid-cols-[220px_1fr_260px] gap-4 min-h-[480px]">
      <div className="flex flex-col gap-3">
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Conversations</p>
        {(["A", "B"] as const).map((sid) => {
          const s = SCENARIOS[sid];
          const isActive = activeScenario === sid;
          return (
            <motion.div
              key={sid}
              animate={isActive ? { boxShadow: `0 0 20px ${s.color}30` } : { boxShadow: "0 0 0 transparent" }}
              className={`rounded-xl border p-3 transition-all duration-300 cursor-pointer ${
                isActive ? "border-white/15 bg-slate-800/60" : "border-white/5 bg-slate-800/20 opacity-60 hover:opacity-80"
              }`}
              style={isActive ? { borderColor: s.color + "50" } : {}}
              onClick={() => {
                if (!isActive && !isAnimating) switchScenario();
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{s.personEmoji}</span>
                <div>
                  <p className="text-white text-sm font-semibold leading-none">{s.person}</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">{s.role}</p>
                </div>
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: s.color }} />
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
          onClick={switchScenario}
          disabled={isAnimating}
          className="mt-1 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all
            bg-gradient-to-r from-violet-600/80 to-cyan-600/80 hover:from-violet-600 hover:to-cyan-600
            text-white border border-white/10 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isAnimating ? (
            <><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Building...</>
          ) : (
            <><ChevronRight className="w-3.5 h-3.5" /> Switch Context</>
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
        <div className="flex-1 px-4 py-3 space-y-0.5 overflow-y-auto relative">
          {layers.map((layer) => (
            <div key={layer.id}>
              <div
                className="cursor-pointer group"
                onClick={() => setExpandedLayer(expandedLayer === layer.id ? null : layer.id)}
              >
                <LayerBar layer={layer} />
              </div>
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
            {showJit && jitAcus.map((acu, i) => (
              <div key={acu.id} className="absolute right-4" style={{ top: '65%' }}>
                <AcuChip acu={acu} delay={i * 0.18} />
              </div>
            ))}
          </AnimatePresence>
        </div>
        <div className="px-4 py-2.5 border-t border-white/5 bg-slate-800/20">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-slate-500">Total context window</span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-white">{totalTokens.toLocaleString()}</span>
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
          {layers.filter((l) => l.state === "ready" || l.state === "locked").map((layer) => (
            <motion.div
              key={`${layer.id}-${activeScenario}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="group"
            >
              <div className="flex items-center gap-1.5 mb-1">
                <div className="w-0.5 h-full rounded-full self-stretch" style={{ backgroundColor: layer.color }} />
                <span className="text-[10px] font-mono font-bold" style={{ color: layer.color }}>{layer.id}</span>
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
          <p className="text-[10px] text-slate-600 text-center">Click any layer bar to expand full content</p>
        </div>
      </div>
    </div>
  );
}

// ─── TAB 2: ACU Memory Store ─────────────────────────────────────────────────

function AcuMemoryTab() {
  const [filter, setFilter] = useState<AcuType | "ALL">("ALL");
  const [acus, setAcus] = useState<Acu[]>(DEMO_ACUS);
  const [search, setSearch] = useState("");

  const filters: Array<AcuType | "ALL"> = ["ALL", "IDENTITY", "PREFERENCE", "DECISION", "FACT", "REASONING"];
  const filtered = acus
    .filter((a) => filter === "ALL" || a.type === filter)
    .filter((a) => !search || a.content.toLowerCase().includes(search.toLowerCase()));

  function togglePin(id: string) {
    setAcus((prev) => prev.map((a) => (a.id === id ? { ...a, pinned: !a.pinned } : a)));
  }
  function deleteAcu(id: string) {
    setAcus((prev) => prev.filter((a) => a.id !== id));
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
              filter === f ? "bg-violet-600 text-white" : "bg-slate-800/60 text-slate-400 hover:text-white border border-white/5"
            }`}
          >
            {f === "ALL" ? `All (${acus.length})` : f}
          </button>
        ))}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search ACUs..."
          className="ml-auto bg-slate-800/40 border border-white/5 rounded-lg px-3 py-1 text-xs text-slate-300
            placeholder:text-slate-600 outline-none focus:border-violet-500/40 w-40"
        />
      </div>

      <div className="flex items-center gap-4 text-xs text-slate-500">
        <span>{acus.length} ACUs total</span>
        <span>·</span>
        <span>{acus.filter((a) => a.pinned).length} pinned</span>
        <span>·</span>
        <span>{acus.filter((a) => a.cacheHit).length} in cache</span>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence>
          {filtered.map((acu) => {
            const meta = ACU_TYPE_META[acu.type];
            return (
              <motion.div
                key={acu.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className={`rounded-xl border p-3 group transition-all hover:shadow-lg ${
                  acu.pinned ? "ring-1 ring-violet-400/30" : ""
                } ${meta.bg} ${meta.border}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <AcuTypeBadge type={acu.type} />
                  <div className="ml-auto flex items-center gap-1.5">
                    {acu.pinned && <Pin className="w-3 h-3 text-violet-400" />}
                    {acu.cacheHit && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="In cache" />}
                  </div>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed line-clamp-3 mb-2">{acu.content}</p>
                <div className="flex items-center justify-between text-[10px] text-slate-600 mb-2">
                  <span>{acu.layer} · {acu.source}</span>
                  <span>{Math.round(acu.confidence * 100)}%</span>
                </div>
                <div className="h-0.5 bg-slate-700/50 rounded-full mb-2.5">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${acu.confidence * 100}%`, backgroundColor: meta.color }}
                  />
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => togglePin(acu.id)}
                    className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] transition-colors ${
                      acu.pinned ? "text-violet-400 bg-violet-500/20" : "text-slate-500 hover:text-violet-400"
                    }`}
                  >
                    <Pin className="w-3 h-3" />
                    {acu.pinned ? "Unpin" : "Pin"}
                  </button>
                  <button
                    onClick={() => deleteAcu(acu.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded text-[10px] text-slate-500 hover:text-red-400 transition-colors ml-auto"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-600 text-sm">No ACUs match your filter</div>
      )}
    </div>
  );
}

// ─── TAB 3: Your Controls ────────────────────────────────────────────────────

const BUDGET_LAYERS = [
  { id: "L0", label: "Identity Core",     color: "#8B5CF6", tokens: 280,  max: 500,  locked: true  },
  { id: "L1", label: "Response Style",    color: "#6366F1", tokens: 340,  max: 800,  locked: false },
  { id: "L2", label: "Topic Context",     color: "#06B6D4", tokens: 1500, max: 3000, locked: false },
  { id: "L3", label: "Entity Context",    color: "#EC4899", tokens: 800,  max: 1200, locked: false },
  { id: "L4", label: "Conversation Arc",  color: "#10B981", tokens: 1200, max: 2000, locked: false },
  { id: "L5", label: "JIT Retrieval",     color: "#F59E0B", tokens: 600,  max: 2000, locked: false },
  { id: "L6", label: "Message History",   color: "#3B82F6", tokens: 7100, max: 10000, locked: false},
  { id: "L7", label: "Your Message",      color: "#F1F5F9", tokens: 280,  max: 500,  locked: true  },
];

function YourControlsTab() {
  const [budgets, setBudgets] = useState(Object.fromEntries(BUDGET_LAYERS.map((l) => [l.id, l.tokens])));
  const [depth, setDepth] = useState<"minimal" | "standard" | "deep">("standard");
  const [privacy, setPrivacy] = useState({
    identity: true, topic: true, entity: true, arc: true, team: false,
  });

  const totalUsed = Object.values(budgets).reduce((s, v) => s + v, 0);
  const totalMax = 50000;
  const efficiency = Math.min(100, Math.round((1 - Math.abs(totalUsed - 12000) / 12000) * 100));

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-white">Context Budget</h4>
            <div className="text-right">
              <span className="text-sm font-mono text-cyan-400">{totalUsed.toLocaleString()}</span>
              <span className="text-xs text-slate-600"> / {totalMax.toLocaleString()} t</span>
            </div>
          </div>
          <div className="mb-4 p-3 rounded-xl bg-slate-800/40 border border-white/5">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-400">Efficiency Score</span>
              <span className={`font-bold ${efficiency > 70 ? "text-emerald-400" : efficiency > 40 ? "text-amber-400" : "text-red-400"}`}>
                {efficiency}%
              </span>
            </div>
            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                animate={{ width: `${efficiency}%` }}
                transition={{ type: "spring", stiffness: 80 }}
              />
            </div>
          </div>
          <div className="space-y-2">
            {BUDGET_LAYERS.map((layer) => {
              const val = budgets[layer.id];
              const pct = val / layer.max;
              return (
                <div key={layer.id} className="grid grid-cols-[56px_1fr_52px] items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    {layer.locked && <Lock className="w-2.5 h-2.5 text-slate-600" />}
                    <span className="text-[10px] font-mono font-bold" style={{ color: layer.color }}>{layer.id}</span>
                  </div>
                  <div className="relative h-1.5 bg-slate-700 rounded-full group">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
                      style={{ width: `${pct * 100}%`, backgroundColor: layer.color }}
                    />
                    {!layer.locked && (
                      <input
                        type="range" min={0} max={layer.max} value={val}
                        onChange={(e) => setBudgets((prev) => ({ ...prev, [layer.id]: +e.target.value }))}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full"
                      />
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 text-right">
                    {val >= 1000 ? `${(val / 1000).toFixed(1)}K` : val}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold text-white mb-2">Knowledge Depth</h4>
          <div className="flex gap-2">
            {(["minimal", "standard", "deep"] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDepth(d)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all ${
                  depth === d ? "bg-violet-600/30 border-violet-500/50 text-violet-300" : "bg-slate-800/40 border-white/5 text-slate-500 hover:text-slate-300"
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Privacy Controls</h4>
          <div className="space-y-2">
            {[
              { key: "identity", label: "Include Identity Core" },
              { key: "topic", label: "Include Topic Context" },
              { key: "entity", label: "Include Entity Profiles" },
              { key: "arc", label: "Include Conversation Arc" },
              { key: "team", label: "Share with Team Circle" },
            ].map((item) => (
              <label key={item.key} className="flex items-center gap-3 cursor-pointer group">
                <button
                  type="button"
                  onClick={() => setPrivacy((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                    privacy[item.key as keyof typeof privacy] ? "bg-violet-600 border-violet-500" : "border-slate-600 bg-transparent"
                  }`}
                >
                  {privacy[item.key as keyof typeof privacy] && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                </button>
                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">{item.label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-slate-800/40 border border-white/5 p-3">
          <h4 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5"><Activity className="w-3 h-3" /> Last Assembly</h4>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Assembly time", value: "112ms", color: "text-emerald-400" },
              { label: "Tokens used", value: "4,312", color: "text-cyan-400" },
              { label: "Bundle cache hits", value: "6 / 6", color: "text-violet-400" },
              { label: "Cache misses", value: "0", color: "text-emerald-400" },
            ].map((stat) => (
              <div key={stat.label} className="p-2 rounded-lg bg-slate-900/40">
                <p className={`text-sm font-mono font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl bg-slate-800/40 border border-white/5 p-3">
          <h4 className="text-xs font-semibold text-slate-400 mb-2 flex items-center gap-1.5"><Brain className="w-3 h-3" /> Memory Store</h4>
          <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
            <span>247 ACUs</span><span>·</span><span>15 Topics</span><span>·</span><span>8 Entities</span>
          </div>
          <div className="flex gap-2">
            <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-slate-400 bg-slate-700/40 hover:bg-slate-700/70 transition-colors border border-white/5">
              <Download className="w-3 h-3" />Export Memory
            </button>
            <button type="button" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 transition-colors border border-red-500/20 ml-auto">
              <Trash2 className="w-3 h-3" />Wipe & Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

const TABS = [
  { id: "shift",    label: "① Context Shift",    icon: Layers,   sub: "Watch the pipeline rebuild live" },
  { id: "memory",   label: "② ACU Memory Store",  icon: Brain,    sub: "Your knowledge, atomized" },
  { id: "controls", label: "③ Your Controls",      icon: Shield,   sub: "You own this system" },
] as const;

type TabId = typeof TABS[number]["id"];

export default function ContextEngineDemoPage() {
  const t = useTranslations('demos.contextEngine');
  const tCommon = useTranslations('demos.common');
  const [activeTab, setActiveTab] = useState<TabId>("shift");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

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
          {tCommon('backToHome')}
        </Link>
      </header>
      <main className="relative z-10 py-12 lg:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/30 mb-6">
              <Cpu className="w-4 h-4 text-violet-400" />
              <span className="text-sm text-slate-300">{t('title')}</span>
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-violet-400">
                {t('watchContext')}
              </span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              {t('description')}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900/50 border border-white/8 overflow-hidden shadow-2xl shadow-violet-500/5">
            <div className="flex border-b border-white/5 bg-slate-800/20 overflow-x-auto no-scrollbar">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                      isActive
                        ? "border-violet-500 text-white bg-violet-500/5"
                        : "border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/3"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="hidden sm:block">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.split(" ").slice(1).join(" ")}</span>
                  </button>
                );
              })}
            </div>

            <div className="p-4 sm:p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                >
                  {activeTab === "shift" && <ContextShiftTab />}
                  {activeTab === "memory" && <AcuMemoryTab />}
                  {activeTab === "controls" && <YourControlsTab />}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="px-6 py-3 border-t border-white/5 bg-slate-800/10">
              <p className="text-xs text-slate-600 text-center">
                No black box. VIVIM gives you full visibility into what gets injected, why, and lets you edit any piece of it.
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
