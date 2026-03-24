"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProviderLogo } from "@/components/provider-logos";
import {
  Brain,
  Layers,
  Database,
  Sparkles,
  ArrowRight,
  Shield,
  Globe,
  Download,
  Code2,
  Zap,
  MessageSquare,
  Settings,
  Timer,
  Target,
  Users,
  Key,
  ChevronRight,
  CheckCircle2,
  BarChart3,
  Lock,
  History,
  Network,
  Zap as BrainZap,
} from "lucide-react";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Navbar } from "@/components/navbar";
import { NeuralBackground } from "@/components/neural-bg";
import { HeroVisual } from "@/components/hero-visual";
import { ReadingProgress } from "@/components/reading-progress";
import { AnimatedCounter, useScrollAnimation } from "@/components/animated-counter";

const LAYER_DATA = [
  { name: "L0", label: "Identity Core", desc: "Who you are — permanent context", tokens: "~300", color: "from-violet-600 to-purple-700" },
  { name: "L1", label: "Global Preferences", desc: "How AI should respond to you", tokens: "~500", color: "from-indigo-500 to-blue-600" },
  { name: "L2", label: "Topic Context", desc: "Deep knowledge about current topics", tokens: "~1,500", color: "from-fuchsia-500 to-pink-600" },
  { name: "L3", label: "Entity Context", desc: "People, projects, and tools you discuss", tokens: "~1,000", color: "from-cyan-500 to-blue-600" },
  { name: "L4", label: "Conversation Arc", desc: "Thread of current discussion", tokens: "~2,000", color: "from-emerald-500 to-teal-600" },
  { name: "L5", label: "JIT Retrieval", desc: "Real-time relevant knowledge", tokens: "~2,500", color: "from-amber-500 to-orange-600" },
  { name: "L6", label: "Message History", desc: "Recent conversation messages", tokens: "~3,500", color: "from-rose-500 to-pink-600" },
  { name: "L7", label: "User Message", desc: "Your current input", tokens: "Variable", color: "from-red-500 to-pink-600" },
];

const MEMORY_TYPES = [
  { name: "Episodic", icon: Timer, color: "from-violet-500 to-purple-600", example: "\"Last week we discussed...\"" },
  { name: "Semantic", icon: Database, color: "from-cyan-500 to-blue-600", example: "\"Python is your primary language\"" },
  { name: "Procedural", icon: Settings, color: "from-emerald-500 to-teal-600", example: "\"You prefer TDD methodology\"" },
  { name: "Factual", icon: Target, color: "from-amber-500 to-orange-600", example: "\"You work as a senior engineer\"" },
  { name: "Preference", icon: Sparkles, color: "from-rose-500 to-pink-600", example: "\"Prefers dark mode interface\"" },
  { name: "Identity", icon: Brain, color: "from-indigo-500 to-blue-600", example: "\"Full-stack developer\"" },
  { name: "Relationship", icon: Users, color: "from-fuchsia-500 to-pink-600", example: "\"John is your tech lead\"" },
  { name: "Goal", icon: Target, color: "from-lime-500 to-green-600", example: "\"Launch MVP by Q2\"" },
  { name: "Project", icon: Layers, color: "from-sky-500 to-cyan-600", example: "\"E-commerce uses Next.js\"" },
];

const PRINCIPLES = [
  { icon: Shield, title: "Sovereign", desc: "You own your memory data completely. VIVIM never claims ownership — your AI memory belongs to you, not the platform.", color: "from-violet-500 to-purple-600" },
  { icon: Users, title: "Personal", desc: "Your memory is yours alone. Unlike shared databases, VIVIM creates an individual memory layer unique to each user.", color: "from-cyan-500 to-blue-600" },
  { icon: Globe, title: "Provider Agnostic", desc: "Switch between GPT-4, Claude, Gemini, or any AI model — your memory stays intact. No vendor lock-in, ever.", color: "from-emerald-500 to-teal-600" },
  { icon: Download, title: "Portable", desc: "Export your entire memory at any time in standard formats. Take your AI memory wherever you go.", color: "from-amber-500 to-orange-600" },
  { icon: Code2, title: "Use-Case Agnostic", desc: "Works for coding assistants, customer support, education, healthcare — any application that benefits from memory.", color: "from-rose-500 to-pink-600" },
  { icon: Zap, title: "Dynamically Generated", desc: "Context isn't static — it's built fresh for each interaction based on what you're doing right now.", color: "from-indigo-500 to-blue-600" },
];

const PROVIDERS = [
  { name: "OpenAI" },
  { name: "Google Gemini" },
  { name: "Claude" },
  { name: "Grok" },
  { name: "Z.ai" },
  { name: "Qwen" },
  { name: "Kimi" },
];

const SOLUTION_FEATURES = [
  { icon: Brain, title: "Remembers Everything", desc: "Every conversation, preference, and detail is stored and organized intelligently." },
  { icon: Target, title: "Intelligent Retrieval", desc: "Finds exactly what's relevant using semantic search — no more repeating yourself." },
  { icon: Globe, title: "Works with Any AI", desc: "Model-agnostic design means you can switch providers without losing your memory." },
];

const DEMOS = [
  {
    slug: "live-memory",
    title: "Live Memory",
    desc: "Watch your memory get extracted from real conversations in real-time",
    icon: Brain,
    color: "from-violet-500 to-purple-600",
  },
  {
    slug: "context-engine",
    title: "Context Engine",
    desc: "See the 8-layer context assembly system build context from scratch",
    icon: Layers,
    color: "from-cyan-500 to-blue-600",
  },
  {
    slug: "zero-knowledge-privacy",
    title: "Zero-Knowledge Privacy",
    desc: "Your encryption keys never leave your device — even we can't see your data",
    icon: Lock,
    color: "from-emerald-500 to-teal-600",
  },
  {
    slug: "sovereign-history",
    title: "Sovereign History",
    desc: "Complete ownership of your conversation history with portable exports",
    icon: History,
    color: "from-amber-500 to-orange-600",
  },
  {
    slug: "decentralized-network",
    title: "Decentralized Network",
    desc: "Peer-to-peer memory sync without central servers or lock-in",
    icon: Network,
    color: "from-blue-500 to-indigo-600",
  },
  {
    slug: "secure-collaboration",
    title: "Secure Collaboration",
    desc: "Share memory context with your team while preserving individual sovereignty",
    icon: Users,
    color: "from-rose-500 to-pink-600",
  },
  {
    slug: "dynamic-intelligence",
    title: "Dynamic Intelligence",
    desc: "Adaptive context that evolves based on your usage patterns",
    icon: BrainZap,
    color: "from-lime-500 to-green-600",
  },
];

interface Problem {
  rank: number;
  title: string;
  hook: string;
  category: "memory" | "portability" | "trust" | "developer";
  scores: { P: number; T: number; E: number; M: number };
  vivimAnswer: string;
  vivimScore: number;
  vivimGap: string;
}

const PROBLEMS: Problem[] = [
  {
    rank: 1,
    title: "The Context Wipe",
    hook: "AI forgets everything, every session",
    category: "memory",
    scores: { P: 9.5, T: 9, E: 8.5, M: 10 },
    vivimAnswer: "The 8-layer context assembly engine + ACU persistent memory store. Every conversation is segmented into addressable memory units, classified across 9 types, and JIT-retrieved for every future interaction.",
    vivimScore: 9.5,
    vivimGap: "Requires onboarding friction — users must import history or begin building memory.",
  },
  {
    rank: 2,
    title: "The Provider Lock-in Trap",
    hook: "Your memory belongs to ChatGPT, not you",
    category: "portability",
    scores: { P: 9, T: 7, E: 9.5, M: 9.5 },
    vivimAnswer: "Provider-agnostic ACU store + import parsers for every major platform. ChatGPT history → VIVIM in one command. The same memory works across GPT-4, Claude, Gemini, Ollama.",
    vivimScore: 9,
    vivimGap: "Parser completeness is still growing. Full coverage requires community contributions.",
  },
  {
    rank: 3,
    title: "The Copy-Paste Tax",
    hook: "Hours lost rebuilding context weekly",
    category: "memory",
    scores: { P: 8.5, T: 10, E: 7, M: 9 },
    vivimAnswer: "L0–L3 layers (Identity Core, Preferences, Topic, Entity) pre-load permanent context before every interaction.",
    vivimScore: 8.5,
    vivimGap: "Efficiency gain is only realized post-memory-accumulation. Takes 2–4 weeks of use.",
  },
  {
    rank: 4,
    title: "The Middle Black Hole",
    hook: "AI ignores context you explicitly provided",
    category: "memory",
    scores: { P: 8, T: 7, E: 9, M: 9 },
    vivimAnswer: "JIT retrieval (L5) surgically selects only the most relevant ACUs for each message — not a monolithic dump.",
    vivimScore: 9,
    vivimGap: "Requires strong embedding quality. Model-dependent retrieval accuracy at the edges.",
  },
  {
    rank: 5,
    title: "The Data Hostage",
    hook: "You can't export what you built",
    category: "portability",
    scores: { P: 8, T: 6, E: 10, M: 8.5 },
    vivimAnswer: "Full ACU export to JSON, SQLite, or IPFS in documented open formats — readable without VIVIM.",
    vivimScore: 9.5,
    vivimGap: "Awareness gap — users don't feel this pain until they try to leave a platform.",
  },
  {
    rank: 6,
    title: "The Enterprise Compliance Wall",
    hook: "AI memory with no audit trail",
    category: "trust",
    scores: { P: 9, T: 5, E: 10, M: 8 },
    vivimAnswer: "Audit logging service + RBAC on memory collections + access grant manager. Enterprise tier adds compliance-grade audit log delivery.",
    vivimScore: 8,
    vivimGap: "SOC 2 Type II audit in progress. HIPAA BAA and FedRAMP are 12–18 months out.",
  },
  {
    rank: 7,
    title: "The AI Memory Surveillance Problem",
    hook: "Org memory vs individual privacy",
    category: "trust",
    scores: { P: 7.5, T: 3, E: 10, M: 7.5 },
    vivimAnswer: "VIVIM Teams preserves individual sovereignty by design — per-seat memory, selective opt-in sharing only.",
    vivimScore: 9,
    vivimGap: "Hard to sell a sovereignty argument to the buyer when sovereignty protects the seller's employees.",
  },
  {
    rank: 8,
    title: "The Local Model Gap",
    hook: "Self-hosted AI has no persistent memory layer",
    category: "developer",
    scores: { P: 8.5, T: 8, E: 6, M: 7 },
    vivimAnswer: "Provider-agnostic SDK with local SQLite + IPFS adapters. Self-hostable full stack in docker-compose.",
    vivimScore: 9,
    vivimGap: "Niche audience today. But this is the highest-conviction community for a sovereign tool.",
  },
  {
    rank: 9,
    title: "The Identity Collapse",
    hook: "AI has no persistent model of who you are",
    category: "memory",
    scores: { P: 7, T: 7.5, E: 7, M: 9 },
    vivimAnswer: "L0 Identity Core + DID-anchored user profile. Who you are is always loaded first.",
    vivimScore: 8.5,
    vivimGap: "Identity richness is proportional to usage depth. New users experience this minimally until enough ACUs accumulate.",
  },
  {
    rank: 10,
    title: "The Developer Infrastructure Gap",
    hook: "No open standard for AI memory",
    category: "developer",
    scores: { P: 7, T: 8, E: 5, M: 8 },
    vivimAnswer: "ACU specification is an open standard anyone can implement. @vivim/sdk drops into LangChain/LlamaIndex as a memory backend.",
    vivimScore: 8,
    vivimGap: "Standards adoption is slow. Requires the ACU spec to gain third-party adoption.",
  },
  {
    rank: 11,
    title: "The Multi-AI Fragmentation Problem",
    hook: "Memory siloed per tool",
    category: "portability",
    scores: { P: 7, T: 6, E: 7, M: 8 },
    vivimAnswer: "Single portable ACU database spans all providers. Import from every major platform.",
    vivimScore: 7.5,
    vivimGap: "Real-time bidirectional sync across live tool usage isn't shipped yet.",
  },
  {
    rank: 12,
    title: "The Conversation Context Decay",
    hook: "Accuracy drops as threads grow",
    category: "memory",
    scores: { P: 7.5, T: 6, E: 8, M: 8.5 },
    vivimAnswer: "Context thermodynamics + memory compression in the Cortex system. ACU decay model promotes reinforced memories.",
    vivimScore: 8,
    vivimGap: "The thermodynamics and Cortex system are implemented but underdocumented.",
  },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [showFullScorecard, setShowFullScorecard] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  useScrollAnimation();

  const filteredProblems = useMemo(() => {
    if (activeFilter === "all") return PROBLEMS;
    return PROBLEMS.filter((p) => p.category === activeFilter);
  }, [activeFilter]);

  const openScorecardModal = (problem: Problem) => {
    setSelectedProblem(problem);
    setShowFullScorecard(true);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white overflow-x-hidden">
      <ReadingProgress />
      <NeuralBackground />
      <div className="aura-glow" />
      <div className="grain-overlay" />
      <Navbar />

      <main className="flex-1 relative z-10">
        <section id="overview" className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden min-h-screen flex items-center">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/30 mb-8 glow-pulse">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-slate-300">Sovereign • Portable • Personal</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
                <span className="bg-gradient-to-r from-violet-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  The Living Memory
                </span>
              </h1>
              <h2 className="text-3xl sm:text-4xl font-medium text-white mb-4">
                for Your AI
              </h2>
              <p className="text-lg text-slate-400 max-w-xl mx-auto mb-6">
                A memory layer that <span className="text-violet-400">you own</span>, that works with{" "}
                <span className="text-cyan-400">any AI provider</span>, and goes <span className="text-emerald-400">wherever you go</span>.
              </p>
              <div className="max-w-2xl mx-auto mb-8 px-4 py-3 rounded-xl glass border border-violet-500/20">
                <p className="text-base text-slate-300 italic">
                  &ldquo;It&apos;s not just technology — it&apos;s a philosophy about who owns your AI memory.&rdquo;
                </p>
              </div>

              <p className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto mb-8">
                A <span className="text-violet-400 font-semibold">sovereign, portable, personal memory</span> and{" "}
                <span className="text-cyan-400 font-semibold">dynamic context engine</span> that works with{" "}
                <span className="text-emerald-400 font-semibold">all AI providers</span> — your single, AI-native database.
              </p>

              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 glass-card">
                  <Shield className="w-4 h-4 text-violet-400" />
                  <span className="text-sm text-violet-300">Full Control & Visibility</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 glass-card">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <span className="text-sm text-cyan-300">All Providers</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 glass-card">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-300">Single Portable Database</span>
                </div>
              </div>

              <div className="relative max-w-2xl mx-auto mb-12">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600/20 to-cyan-600/20 rounded-3xl blur-3xl" />
                <HeroVisual className="relative" />
              </div>

              <div className="mt-16 max-w-4xl mx-auto">
                <div className="p-8 rounded-2xl glass border border-violet-500/20 glow-violet text-center">
                  <p className="text-xl text-white font-semibold mb-4">
                    It&apos;s not just technology.
                  </p>
                  <p className="text-lg text-slate-300 leading-relaxed mb-4">
                    It&apos;s a <span className="text-violet-400 font-semibold">philosophy</span> about who owns your AI memory.
                  </p>
                  <p className="text-base text-slate-400 leading-relaxed">
                    VIVIM gives you <span className="text-violet-400">full control and visibility</span> of your AI memory.
                    Connect <span className="text-cyan-400">all providers</span> to your{" "}
                    <span className="text-emerald-400">single portable AI-native database</span> —
                    your memory, your rules, everywhere.
                  </p>
                </div>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-lg px-8 py-6 rounded-xl font-medium glow-violet">
                  <Link href="/demos/live-memory" className="flex items-center gap-2">
                    Try Live Demo
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <a
                  href="https://github.com/owenservera/vivim-live"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-violet-500/50 text-lg px-8 py-6 rounded-xl font-medium transition-all glass"
                >
                  <Code2 className="w-5 h-5" />
                  View on GitHub
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-20 lg:py-24 relative bg-slate-900/30">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12 scroll-animate">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Works with{" "}
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  Any AI Provider
                </span>
              </h2>
              <p className="text-slate-400">
                VIVIM is provider-agnostic. Connect your favorite models instantly.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              {PROVIDERS.map((provider) => (
                <div
                  key={provider.name}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl glass-card hover:border-violet-500/30 transition-colors min-w-[120px]"
                >
                  <div className="w-12 h-12 flex items-center justify-center">
                    <ProviderLogo name={provider.name} className="w-10 h-10" />
                  </div>
                  <span className="text-sm text-slate-400">{provider.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="the-problem" className="py-20 lg:py-32 relative scroll-animate">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16 animate-on-scroll">
              <Badge variant="outline" className="border-red-500/50 text-red-400 mb-6 text-base px-4 py-1">
                The Problem
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                Every AI Conversation
                <br />
                <span className="text-red-400">Starts Broken</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                The context window isn&apos;t just limited — it&apos;s actively working against you.
                And most &quot;solutions&quot; make it worse.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-12">
              {[
                { value: 85, suffix: "%", label: "Accuracy drop as context grows", source: "Stanford, Google, Anthropic, Meta" },
                { value: 18, suffix: "/18", label: "Frontier models degrade with context", source: "Chroma, March 2026" },
                { value: 13, suffix: "B", label: "Vector DB market validates the problem", source: "Kings Research 2026", prefix: "$" },
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 text-center">
                  <div className="text-2xl font-bold text-red-400 mb-1">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} prefix={stat.prefix || ""} />
                  </div>
                  <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
                  <p className="text-[10px] text-slate-600">{stat.source}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: "The Context Wipe",
                  hook: "AI forgets everything, every session",
                  stat: "Conversations degrade after 15–20 messages, even with 1M token windows.",
                  desc: "Users rebuild context from scratch on every conversation. 3 years of domain knowledge, preferences, and decisions vanish the moment a tab closes.",
                  color: "border-red-500/30",
                  category: "memory",
                  categoryColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
                  solutionLink: "#the-solution",
                },
                {
                  title: "The Provider Lock-in Trap",
                  hook: "Your memory belongs to ChatGPT, not you",
                  stat: "Switching AI providers means losing all accumulated context.",
                  desc: "Switching AI providers means losing all accumulated context. Users are held hostage by memory moats that providers built intentionally.",
                  color: "border-orange-500/30",
                  category: "portability",
                  categoryColor: "bg-green-500/10 text-green-400 border-green-500/30",
                  solutionLink: "#the-solution",
                },
                {
                  title: "The Copy-Paste Tax",
                  hook: "Hours lost rebuilding context weekly",
                  stat: "Hours every week rebuilding context from scratch.",
                  desc: "Knowledge workers spend 5–10 hours/week re-explaining their stack, preferences, team structure, and project history to AI tools that forgot everything overnight.",
                  color: "border-amber-500/30",
                  category: "memory",
                  categoryColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
                  solutionLink: "#the-solution",
                },
                {
                  title: "The Middle Black Hole",
                  hook: "AI ignores context you explicitly provided",
                  stat: "20+ percentage points worse accuracy for information in the middle of context.",
                  desc: "Stanford/Google/Anthropic research confirms 20+ percentage point accuracy drop for information in the middle of long context windows. Users unknowingly provide context the model never reads.",
                  color: "border-purple-500/30",
                  category: "memory",
                  categoryColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
                  solutionLink: "#the-solution",
                },
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className={`p-6 rounded-2xl bg-slate-900/60 border ${card.color} group hover:border-slate-600/60 transition-colors`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-2 py-0.5 border ${card.categoryColor} bg-transparent`}
                    >
                      {card.category === 'memory' && '🧠 Memory'}
                      {card.category === 'portability' && '🔄 Portability'}
                      {card.category === 'trust' && '🛡️ Trust'}
                      {card.category === 'developer' && '⚙️ Developer'}
                    </Badge>
                    <span className="text-xs text-slate-500">Rank #{i + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{card.title}</h3>
                  <p className="text-xs text-slate-400 mb-3 italic">{card.hook}</p>
                  <p className="text-sm text-red-400 mb-3 font-medium">{card.stat}</p>
                  <p className="text-sm text-slate-400 mb-4">{card.desc}</p>
                  <a 
                    href={card.solutionLink}
                    className="inline-flex items-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <span>How VIVIM solves this</span>
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                </motion.div>
              ))}
            </div>

            {/* Phase 2: Explore Problems Expandable Section */}
            <div className="mt-8">
              <Collapsible>
                <CollapsibleTrigger asChild>
                  <button className="flex items-center justify-center w-full py-3 text-sm text-slate-400 hover:text-slate-300 transition-colors">
                    <span>Explore all 12 problems</span>
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="pt-4 pb-2">
                    {/* Category Filter Pills */}
                    <div className="flex flex-wrap gap-2 justify-center mb-6">
                      {[
                        { id: 'all', label: 'All problems', color: 'border-slate-600 text-slate-400' },
                        { id: 'memory', label: '🧠 Memory', color: 'border-blue-500/50 text-blue-400' },
                        { id: 'portability', label: '🔄 Portability', color: 'border-green-500/50 text-green-400' },
                        { id: 'trust', label: '🛡️ Trust & Sovereignty', color: 'border-amber-500/50 text-amber-400' },
                        { id: 'developer', label: '⚙️ Developer', color: 'border-purple-500/50 text-purple-400' },
                      ].map((filter) => (
                        <button
                          key={filter.id}
                          onClick={() => setActiveFilter(filter.id)}
                          className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                            activeFilter === filter.id 
                              ? 'bg-slate-700 border-slate-500 text-white' 
                              : `${filter.color} hover:bg-slate-800/50`
                          }`}
                        >
                          {filter.label}
                        </button>
                      ))}
                    </div>

                    {/* Filtered Problems Grid */}
                    <div className="grid md:grid-cols-2 gap-4">
                      {filteredProblems.map((problem) => (
                        <motion.div
                          key={problem.rank}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-slate-700/50 transition-colors"
                        >
                          <div className="flex items-start gap-3 mb-2">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                              problem.rank <= 3 ? 'bg-amber-500/20 text-amber-400' :
                              problem.rank <= 6 ? 'bg-blue-500/20 text-blue-400' :
                              'bg-slate-700 text-slate-400'
                            }`}>
                              #{problem.rank}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`text-[10px] px-1.5 py-0 ${
                                problem.category === 'memory' ? 'border-blue-500/30 text-blue-400' :
                                problem.category === 'portability' ? 'border-green-500/30 text-green-400' :
                                problem.category === 'trust' ? 'border-amber-500/30 text-amber-400' :
                                'border-purple-500/30 text-purple-400'
                              } bg-transparent`}
                            >
                              {problem.category === 'memory' && '🧠 Memory'}
                              {problem.category === 'portability' && '🔄 Portability'}
                              {problem.category === 'trust' && '🛡️ Trust'}
                              {problem.category === 'developer' && '⚙️ Developer'}
                            </Badge>
                          </div>
                          <h4 className="text-sm font-semibold text-white mb-1">{problem.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2">{problem.hook}</p>
                          <button 
                            onClick={() => openScorecardModal(problem)}
                            className="mt-2 text-xs text-slate-500 hover:text-slate-300 flex items-center"
                          >
                            View scores →
                          </button>
                        </motion.div>
                      ))}
                    </div>

                    {/* Deep Dive Button */}
                    <div className="mt-6 text-center">
                      <Button 
                        variant="outline" 
                        className="border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800"
                        onClick={() => setShowFullScorecard(true)}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Open Full Scorecard
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </section>

        <section id="the-solution" className="py-20 lg:py-32 relative bg-slate-900/30 scroll-animate">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 mb-6 text-base px-4 py-1">
                The Solution
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                What If AI Could
                <br />
                <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  Truly Remember?
                </span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Not just store — but understand, connect, and retrieve what matters — 
                across every conversation, with every AI.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {SOLUTION_FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl glass-card text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400">{feature.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Link href="/demos/context-engine">
                <Button className="bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white text-lg px-8 py-6 rounded-xl font-medium glow-violet">
                  See the Context Engine
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Interactive Demos Section */}
            <div className="mt-20">
              <div className="text-center mb-12">
                <Badge variant="outline" className="border-violet-500/50 text-violet-400 mb-4 text-base px-4 py-1">
                  Try It Now
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Interactive Demos
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Explore VIVIM's capabilities through these live, interactive demonstrations
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DEMOS.map((demo) => {
                  const Icon = demo.icon;
                  return (
                    <Link key={demo.slug} href={`/demos/${demo.slug}`}>
                      <motion.div
                        whileHover={{ y: -4 }}
                        className="p-6 rounded-2xl glass-card border border-white/5 hover:border-violet-500/30 transition-all group"
                      >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${demo.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2 group-hover:text-violet-300 transition-colors">
                          {demo.title}
                        </h3>
                        <p className="text-sm text-slate-400">
                          {demo.desc}
                        </p>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="acus" className="py-20 lg:py-32 relative scroll-animate">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="outline" className="border-violet-500/50 text-violet-400 mb-6 text-base px-4 py-1">
                Core Innovation
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                Atomic Chat Units
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-4">
                The fundamental building block that makes persistent, multi-scenario AI context possible
              </p>
              <p className="text-base text-slate-500 max-w-xl mx-auto">
                Each conversation is broken into individually searchable, shareable units — giving you granular 
                control over what your AI remembers and how it connects knowledge.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">The Message Monolith Problem</h3>
                <div className="space-y-4">
                  {[
                    "Messages stored as giant blocks — like a whole chapter in one piece",
                    "Search for code, get entire 500-line response",
                    "Can&apos;t share just the solution without losing context",
                    "Insights buried in thousands of messages",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-red-500/20 border border-red-500/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-red-400 text-sm">✕</span>
                      </div>
                      <p className="text-slate-400">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">VIVIM Atomic Chat Units</h3>
                <div className="space-y-4">
                  {[
                    "Each thought is individually searchable & shareable",
                    "Find exactly the code snippet you need",
                    "Share granular insights with full context preserved",
                    "Knowledge connected, organized, and always accessible",
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      </div>
                      <p className="text-slate-300">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="principles" className="py-20 lg:py-32 relative bg-slate-900/30 scroll-animate">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/30 mb-6">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-slate-300">Our Philosophy</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  Sovereign AI Memory
                </span>
                <br />
                <span className="text-white">Belongs to You</span>
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-4">
                VIVIM isn&apos;t just technology — it&apos;s a philosophy about who owns your AI memory.
              </p>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                We believe your memories, preferences, and context should never be locked to a single provider.
                You should always have full control, visibility, and portability.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PRINCIPLES.map((principle, i) => (
                <motion.div
                  key={principle.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl glass-card"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${principle.color} flex items-center justify-center mb-4`}>
                    <principle.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{principle.title}</h3>
                  <p className="text-sm text-slate-400">{principle.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="context-layers" className="py-20 lg:py-32 relative scroll-animate">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="outline" className="border-violet-500/50 text-violet-400 mb-6 text-base px-4 py-1">
                The 8-Layer System
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                Intelligent Context Assembly
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Like CPU cache levels — each layer has different latency, specificity, and refresh rates.
              </p>
            </div>

            <div className="space-y-4">
              {LAYER_DATA.map((layer, i) => (
                <motion.div
                  key={layer.name}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 p-4 rounded-xl glass-card"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${layer.color} flex items-center justify-center shrink-0`}>
                    <span className="text-white font-bold text-sm">{layer.name}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-white font-medium">{layer.label}</span>
                      <span className="text-slate-500 text-sm">{layer.tokens} tokens</span>
                    </div>
                    <p className="text-slate-400 text-sm">{layer.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 text-center">
              <p className="text-slate-400">
                <span className="text-white font-medium">Total Context Window:</span> ~12,300 tokens
              </p>
            </div>
          </div>
        </section>

        <section id="memory-types" className="py-20 lg:py-32 relative bg-slate-900/30 scroll-animate">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                9 Types of{" "}
                <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                  Human-Like Memory
                </span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Hover to see examples of each memory type
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MEMORY_TYPES.map((memory, i) => (
                <motion.div
                  key={memory.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className={`p-5 rounded-xl bg-gradient-to-br ${memory.color} bg-opacity-10 border border-opacity-30 hover:scale-105 transition-transform`}
                  style={{ borderColor: `rgba(var(--${memory.name.toLowerCase()}-color), 0.3)` }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <memory.icon className="w-5 h-5" />
                    <span className="font-bold text-white">{memory.name}</span>
                  </div>
                  <p className="text-sm text-slate-300 italic">{memory.example}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="developers" className="py-20 lg:py-32 relative scroll-animate">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 mb-6 text-base px-4 py-1">
                For Developers
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                Build with{" "}
                <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                  @vivim/sdk
                </span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-4">
                Everything you need to create sovereign, privacy-first AI experiences
              </p>
              <p className="text-base text-slate-500 max-w-xl mx-auto">
                Because your users deserve memory that <span className="text-violet-400">they own</span>, 
                not memory that&apos;s locked to your platform.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {[
                { title: "Identity & DIDs", desc: "Decentralized identifiers with cryptographic key management" },
                { title: "Context Engine", desc: "8-layer dynamic context assembly powered by ACUs" },
                { title: "Storage Options", desc: "Local, SQLite, or IPFS with end-to-end encryption" },
                { title: "Zero-Knowledge", desc: "Encryption keys never leave the user&apos;s device" },
              ].map((feature, i) => (
                <div key={i} className="p-5 rounded-xl glass-card flex items-start gap-4">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-white font-bold mb-1">{feature.title}</h3>
                    <p className="text-slate-400 text-sm">{feature.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/60">
              <code className="text-sm text-slate-300">
                npm install @vivim/sdk
              </code>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-slate-800/50 py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <p className="text-lg text-white font-medium mb-1">
                Your memory. Your rules. Everywhere.
              </p>
              <p className="text-sm text-slate-500">
                The philosophy that guides everything we build.
              </p>
            </div>

            <div className="flex items-center gap-6">
              <a href="https://github.com/owenservera/vivim-live" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                GitHub
              </a>
              <a href="https://discord.gg/vivim" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                Discord
              </a>
              <a href="/docs" className="text-slate-400 hover:text-white transition-colors">
                Docs
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800/50 text-center">
            <p className="text-sm text-slate-500">
              © 2026 VIVIM • AGPL v3 • Open Source
            </p>
          </div>
        </div>
      </footer>

      <Dialog open={showFullScorecard} onOpenChange={setShowFullScorecard}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              {selectedProblem ? `${selectedProblem.title}` : "Problem Scorecard"}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProblem && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">{selectedProblem.hook}</p>
              
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Pain", value: selectedProblem.scores.P, color: selectedProblem.scores.P >= 8 ? "bg-red-500" : "bg-amber-500" },
                  { label: "Time Lost", value: selectedProblem.scores.T, color: selectedProblem.scores.T >= 8 ? "bg-red-500" : "bg-amber-500" },
                  { label: "Trust Erosion", value: selectedProblem.scores.E, color: selectedProblem.scores.E >= 8 ? "bg-red-500" : "bg-amber-500" },
                  { label: "Market Size", value: selectedProblem.scores.M, color: selectedProblem.scores.M >= 8 ? "bg-red-500" : "bg-amber-500" },
                ].map((dim) => (
                  <div key={dim.label} className="text-center p-3 rounded-lg bg-slate-800/50">
                    <div className="text-xs text-slate-500 mb-2">{dim.label}</div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                      <div className={`h-full ${dim.color}`} style={{ width: `${dim.value * 10}%` }} />
                    </div>
                    <div className="text-lg font-bold text-white">{dim.value}</div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-lg bg-slate-800/50 border-l-4 border-emerald-500">
                <div className="text-xs text-slate-500 mb-2">VIVIM Solution</div>
                <p className="text-sm text-slate-300">{selectedProblem.vivimAnswer}</p>
                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
                  Solution Fit: {selectedProblem.vivimScore}/10
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-800/30 border-l-4 border-amber-500/50">
                <div className="text-xs text-slate-500 mb-1">Gap Analysis</div>
                <p className="text-sm text-slate-400">{selectedProblem.vivimGap}</p>
              </div>
            </div>
          )}

          {!selectedProblem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: "P", desc: "Pain severity", color: "text-red-400" },
                  { label: "T", desc: "Time lost", color: "text-orange-400" },
                  { label: "E", desc: "Trust erosion", color: "text-amber-400" },
                  { label: "M", desc: "Market size", color: "text-blue-400" },
                ].map((dim) => (
                  <div key={dim.label} className="p-3 rounded-lg bg-slate-800/50 text-center">
                    <div className={`text-lg font-bold ${dim.color}`}>{dim.label}</div>
                    <div className="text-xs text-slate-500">{dim.desc}</div>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 max-h-[50vh] overflow-y-auto">
                {PROBLEMS.map((problem) => {
                  const avg = (problem.scores.P + problem.scores.T + problem.scores.E + problem.scores.M) / 4;
                  return (
                    <button
                      key={problem.rank}
                      type="button"
                      onClick={() => openScorecardModal(problem)}
                      className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 text-left transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          problem.rank <= 3 ? 'bg-amber-500/20 text-amber-400' :
                          problem.rank <= 6 ? 'bg-blue-500/20 text-blue-400' :
                          'bg-slate-700 text-slate-400'
                        }`}>
                          #{problem.rank}
                        </span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">{problem.title}</div>
                          <div className="text-xs text-slate-500 mt-1">Score: {avg.toFixed(1)}/10</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
