"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProviderLogo } from "@/components/provider-logos";
import { useTypedTranslations } from "@/i18n/useTypedTranslations";
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
  Lock as Sentinel,
  ShoppingCart,
  Eye,
  FileKey,
  Scale,
  Radar,
  ScanEye,
  FileCheck,
  DollarSign,
  TrendingUp,
  Handshake,
  FileWarning,
  ShieldCheck,
  ScanLine,
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
import { PricingSection } from "@/components/pricing-section";
import { NeuralBackground } from "@/components/neural-bg";
import { HeroVisual } from "@/components/hero-visual";
import { ReadingProgress } from "@/components/reading-progress";
import { AnimatedCounter, useScrollAnimation } from "@/components/animated-counter";
import { FloatingChat } from "@/components/floating-chat";

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

const DEMO_DATA: Record<string, { title: string; desc: string }> = {
  liveMemory: { title: "Live Memory", desc: "Watch your memory get extracted from real conversations in real-time" },
  contextEngine: { title: "Context Engine", desc: "See the 8-layer context assembly system build context from scratch" },
  zeroKnowledgePrivacy: { title: "Zero-Knowledge Privacy", desc: "Your encryption keys never leave your device — even we can't see your data" },
  sovereignHistory: { title: "Sovereign History", desc: "Complete ownership of your conversation history with portable exports" },
  decentralizedNetwork: { title: "Decentralized Network", desc: "Peer-to-peer memory sync without central servers or lock-in" },
  secureCollaboration: { title: "Secure Collaboration", desc: "Share memory context with your team while preserving individual sovereignty" },
  dynamicIntelligence: { title: "Dynamic Intelligence", desc: "Adaptive context that evolves based on your usage patterns" },
  rightsLayer: { title: "Rights Layer", desc: "Granular ownership tiers with co-governance for your data" },
  sentinelDetection: { title: "Sentinel Detection", desc: "13 algorithms that detect if your data was used without permission" },
  marketplace: { title: "Marketplace", desc: "Monetize your intelligence on your terms" },
};

const DEMO_ICON_MAP: Record<string, { icon: typeof Brain; color: string }> = {
  liveMemory: { icon: Brain, color: "from-violet-500 to-purple-600" },
  contextEngine: { icon: Layers, color: "from-cyan-500 to-blue-600" },
  zeroKnowledgePrivacy: { icon: Lock, color: "from-emerald-500 to-teal-600" },
  sovereignHistory: { icon: History, color: "from-amber-500 to-orange-600" },
  decentralizedNetwork: { icon: Network, color: "from-blue-500 to-indigo-600" },
  secureCollaboration: { icon: Users, color: "from-rose-500 to-pink-600" },
  dynamicIntelligence: { icon: BrainZap, color: "from-lime-500 to-green-600" },
  rightsLayer: { icon: ShieldCheck, color: "from-amber-500 to-orange-600" },
  sentinelDetection: { icon: Radar, color: "from-red-500 to-rose-600" },
  marketplace: { icon: ShoppingCart, color: "from-emerald-500 to-teal-600" },
};

const LAYER_COLORS = [
  "from-violet-600 to-purple-700",
  "from-indigo-500 to-blue-600",
  "from-fuchsia-500 to-pink-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-red-500 to-pink-600",
];

// Map translation keys to provider name keys for ProviderLogo component
const PROVIDER_NAME_KEYS: Record<string, string> = {
  "openai": "OpenAI",
  "googleGemini": "Google Gemini",
  "claude": "Claude",
  "grok": "Grok",
  "zai": "Z.ai",
  "qwen": "Qwen",
  "kimi": "Kimi",
};

const RIGHTS_TIER_DATA: Record<string, { label: string; desc: string }> = {
  t0: { label: "Personal Only", desc: "You own it completely. No sharing, no governance." },
  t1: { label: "Personal-Likely", desc: "Probably personal, but open to classification review." },
  t2: { label: "Shared-Possibly", desc: "Could be shared — ready for co-governance setup." },
  t3: { label: "Co-Governed", desc: "Company gets governance. Dual-key required for exports." },
  t4: { label: "Restricted", desc: "Enhanced protection. Limited access even for you." },
  t5: { label: "Regulated", desc: "Never exports. Medical, legal, financial lockbox." },
};

const RIGHTS_TIER_COLORS: Record<string, { color: string; border: string }> = {
  t0: { color: "from-emerald-500 to-green-600", border: "border-emerald-500/30" },
  t1: { color: "from-emerald-400 to-teal-500", border: "border-emerald-400/30" },
  t2: { color: "from-amber-400 to-orange-500", border: "border-amber-400/30" },
  t3: { color: "from-orange-500 to-amber-600", border: "border-orange-500/30" },
  t4: { color: "from-red-500 to-rose-600", border: "border-red-500/30" },
  t5: { color: "from-red-600 to-red-700", border: "border-red-600/30" },
};

const SENTINEL_ALGORITHMS = [
  "Spectral Membership Inference",
  "Mutual Information Estimation",
  "Kolmogorov Uniqueness",
  "Photon Counting",
  "Interference Pattern",
  "Canary Wave Function",
  "Boltzmann Calibration",
  "Holographic Watermarking",
  "Thermodynamic Flow",
  "Fisher Fingerprinting",
  "Entanglement Testing",
  "Diffraction Grating",
  "Conservation Law",
];

const MARKETPLACE_STEPS = [
  { label: "List", desc: "Select ACUs, set price, generate ZK proof" },
  { label: "Discover", desc: "Buyers browse verified listings" },
  { label: "Purchase", desc: "Escrow payment secures transaction" },
  { label: "Exchange", desc: "Encrypted delivery via ECDH" },
  { label: "Verify", desc: "ZK proof validation" },
];

const PRINCIPLES_DATA = [
  { title: "Sovereign", desc: "You own your memory data completely. VIVIM never claims ownership — your AI memory belongs to you, not the platform." },
  { title: "Personal", desc: "Your memory is yours alone. Unlike shared databases, VIVIM creates an individual memory layer unique to each user." },
  { title: "Provider Agnostic", desc: "Switch between GPT-4, Claude, Gemini, or any AI model — your memory stays intact. No vendor lock-in, ever." },
  { title: "Portable", desc: "Export your entire memory at any time in standard formats. Take your AI memory wherever you go." },
  { title: "Use-Case Agnostic", desc: "Works for coding assistants, customer support, education, healthcare — any application that benefits from memory." },
  { title: "Dynamically Generated", desc: "Context isn't static — it's built fresh for each interaction based on what you're doing right now." },
];

const CONTEXT_LAYERS_DATA = [
  { label: "Identity Core", desc: "Who you are — permanent context", tokens: "~300" },
  { label: "Global Preferences", desc: "How AI should respond to you", tokens: "~500" },
  { label: "Topic Context", desc: "Deep knowledge about current topics", tokens: "~1,500" },
  { label: "Entity Context", desc: "People, projects, and tools you discuss", tokens: "~1,000" },
  { label: "Conversation Arc", desc: "Thread of current discussion", tokens: "~2,000" },
  { label: "JIT Retrieval", desc: "Real-time relevant knowledge", tokens: "~2,500" },
  { label: "Message History", desc: "Recent conversation messages", tokens: "~3,500" },
  { label: "User Message", desc: "Your current input", tokens: "Variable" },
];

const MEMORY_TYPES_DATA = [
  { name: "Episodic", example: "\"Last week we discussed...\"" },
  { name: "Semantic", example: "\"Python is your primary language\"" },
  { name: "Procedural", example: "\"You prefer TDD methodology\"" },
  { name: "Factual", example: "\"You work as a senior engineer\"" },
  { name: "Preference", example: "\"Prefers dark mode interface\"" },
  { name: "Identity", example: "\"Full-stack developer\"" },
  { name: "Relationship", example: "\"John is your tech lead\"" },
  { name: "Goal", example: "\"Launch MVP by Q2\"" },
  { name: "Project", example: "\"E-commerce uses Next.js\"" },
];

const MARKETPLACE_REVENUE_BREAKS = [
  { label: "Platform (15%)", value: "$150", color: "slate" },
  { label: "Human (60% × 40%)", value: "$240", color: "slate" },
  { label: "Company (60% × 40%)", value: "$240", color: "slate" },
  { label: "Total Sale", value: "$1,000", color: "emerald" },
];

const DEVELOPERS_DATA = [
  { title: "Simple SDK", desc: "Drop-in memory backend for LangChain, LlamaIndex, or custom" },
  { title: "Local First", desc: "CRDT-based sync with optional IPFS persistence" },
  { title: "Storage Options", desc: "Local, SQLite, or IPFS with end-to-end encryption" },
  { title: "Zero-Knowledge", desc: "Encryption keys never leave the user's device" },
];

interface Problem {
  rank: number;
  key: string;
  category: "memory" | "portability" | "trust" | "developer";
  scores: { P: number; T: number; E: number; M: number };
  vivimScore: number;
  title?: string;
  hook?: string;
  stat?: string;
  desc?: string;
  vivimAnswer?: string;
  vivimGap?: string;
}

const BASE_PROBLEMS: Problem[] = [
  { rank: 1, key: "contextWipe", category: "memory", scores: { P: 9.5, T: 9, E: 8.5, M: 10 }, vivimScore: 9.5 },
  { rank: 2, key: "providerLockIn", category: "portability", scores: { P: 9, T: 7, E: 9.5, M: 9.5 }, vivimScore: 9 },
  { rank: 3, key: "copyPasteTax", category: "memory", scores: { P: 8.5, T: 10, E: 7, M: 9 }, vivimScore: 8.5 },
  { rank: 4, key: "middleBlackHole", category: "memory", scores: { P: 8, T: 7, E: 9, M: 9 }, vivimScore: 9 },
  { rank: 5, key: "dataHostage", category: "portability", scores: { P: 8, T: 6, E: 10, M: 8.5 }, vivimScore: 9.5 },
  { rank: 6, key: "enterpriseCompliance", category: "trust", scores: { P: 9, T: 5, E: 10, M: 8 }, vivimScore: 8 },
  { rank: 7, key: "aiMemorySurveillance", category: "trust", scores: { P: 7.5, T: 3, E: 10, M: 7.5 }, vivimScore: 9 },
  { rank: 8, key: "localModelGap", category: "developer", scores: { P: 8.5, T: 8, E: 6, M: 7 }, vivimScore: 9 },
  { rank: 9, key: "identityCollapse", category: "memory", scores: { P: 7, T: 7.5, E: 7, M: 9 }, vivimScore: 8.5 },
  { rank: 10, key: "developerInfrastructureGap", category: "developer", scores: { P: 7, T: 8, E: 5, M: 8 }, vivimScore: 8 },
  { rank: 11, key: "multiAiFragmentation", category: "portability", scores: { P: 7, T: 6, E: 7, M: 8 }, vivimScore: 7.5 },
  { rank: 12, key: "contextDecay", category: "memory", scores: { P: 7.5, T: 6, E: 8, M: 8.5 }, vivimScore: 8 },
];

export default function Home() {
  const common = useTypedTranslations('common');
  const hero = useTypedTranslations('hero');
  const providers = useTypedTranslations('providers');
  const problem = useTypedTranslations('problem');
  const solution = useTypedTranslations('solution');
  const acus = useTypedTranslations('acus');
  const acusItems = acus.raw as unknown as (key: 'problemItems' | 'solutionItems') => string[];
  const rightsLayer = useTypedTranslations('rightsLayer');
  const sentinel = useTypedTranslations('sentinel');
  const marketplace = useTypedTranslations('marketplace');
  const principles = useTypedTranslations('principles');
  const contextLayers = useTypedTranslations('contextLayers');
  const memoryTypes = useTypedTranslations('memoryTypes');
  const developers = useTypedTranslations('developers');
  const demos = useTypedTranslations('demos');
  const scorecard = useTypedTranslations('scorecard');
  const footer = useTypedTranslations('footer');

  const [scrolled, setScrolled] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [showFullScorecard, setShowFullScorecard] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  useScrollAnimation();

  const problemsData = useMemo(() => {
    return BASE_PROBLEMS.map(p => ({
      ...p,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      title: problem(`cards.${p.key}.title` as any),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      hook: problem(`cards.${p.key}.hook` as any),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      stat: problem(`cards.${p.key}.stat` as any),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      desc: problem(`cards.${p.key}.desc` as any),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vivimAnswer: problem(`cards.${p.key}.vivimAnswer` as any),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vivimGap: problem(`cards.${p.key}.vivimGap` as any),
    }));
  }, [problem]);

  const featuredProblems = useMemo(() => {
    return [
      {
        ...problemsData.find(p => p.key === "contextWipe")!,
        color: "border-red-500/30",
        categoryColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        solutionLink: "#the-solution",
      },
      {
        ...problemsData.find(p => p.key === "providerLockIn")!,
        color: "border-orange-500/30",
        categoryColor: "bg-green-500/10 text-green-400 border-green-500/30",
        solutionLink: "#the-solution",
      },
      {
        ...problemsData.find(p => p.key === "copyPasteTax")!,
        color: "border-amber-500/30",
        categoryColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        solutionLink: "#the-solution",
      },
      {
        ...problemsData.find(p => p.key === "middleBlackHole")!,
        color: "border-purple-500/30",
        categoryColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        solutionLink: "#the-solution",
      },
    ];
  }, [problemsData]);

  const filteredProblems = useMemo(() => {
    if (activeFilter === "all") return problemsData;
    return problemsData.filter((p) => p.category === activeFilter);
  }, [activeFilter, problemsData]);

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
        <section id="overview" className="relative pt-24 pb-16 lg:pt-32 lg:pb-24 overflow-hidden">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="hero-stagger-1"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/30 mb-8 glow-pulse">
                  <Sparkles className="w-4 h-4 text-violet-400" />
                  <span className="text-sm text-slate-300">{hero('tagline')}</span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 hero-stagger-2"
              >
                <span className="text-white">
                  {hero('title')}
                </span>
              </motion.h1>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-3xl sm:text-4xl font-medium text-white mb-4 hero-stagger-3"
              >
                {hero('titleHighlight')}
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="text-lg text-slate-400 max-w-xl mx-auto mb-6 hero-stagger-3"
              >
                A memory layer that <span className="text-violet-400">you own</span>, that works with{" "}
                <span className="text-cyan-400">any AI provider</span>, and goes <span className="text-emerald-400">wherever you go</span>.
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="max-w-2xl mx-auto mb-8 px-4 py-3 rounded-xl glass border border-violet-500/20 hero-stagger-4"
              >
                <p className="text-base text-slate-300 italic">
                  &ldquo;{hero('quote')}&rdquo;
                </p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto mb-8 hero-stagger-4"
              >
                A <span className="text-violet-400 font-semibold">sovereign, portable, personal memory</span> and{" "}
                <span className="text-cyan-400 font-semibold">dynamic context engine</span> that works with{" "}
                <span className="text-emerald-400 font-semibold">all AI providers</span> — your single, AI-native database.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="relative max-w-2xl mx-auto mb-12 hero-stagger-5"
              >
                <div className="absolute inset-0 bg-violet-600/10 rounded-3xl blur-3xl" />
                <HeroVisual className="relative" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55 }}
                className="mt-12 flex flex-col sm:flex-row gap-4 justify-center hero-stagger-6"
              >
                <Button className="bg-violet-600 hover:bg-violet-500 text-white text-lg px-8 py-6 rounded-xl font-medium glow-violet btn-animate">
                  <Link href="/demos/live-memory" className="flex items-center gap-2">
                    {common('cta.tryLiveDemo')}
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                </Button>
                <a
                  href="https://github.com/owenservera/vivim-live"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 border border-slate-600 text-slate-300 hover:bg-slate-800 hover:border-violet-500/50 text-lg px-8 py-6 rounded-xl font-medium transition-all glass btn-animate"
                >
                  <Code2 className="w-5 h-5" />
                  {common('cta.viewOnGithub')}
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 lg:py-20 relative bg-slate-900/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 scroll-animate">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {providers('title')}
              </h2>
              <p className="text-slate-400">
                {providers('description')}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              {Object.entries(PROVIDER_NAME_KEYS).map(([key, name]) => (
                <div
                  key={key}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl glass-card hover:border-violet-500/30 transition-colors min-w-[120px] card-lift cursor-pointer"
                >
                  <div className="w-12 h-12 flex items-center justify-center">
                    <ProviderLogo name={name} className="w-10 h-10" />
                  </div>
                  <span className="text-sm text-slate-400">{providers(`logos.${key}` as any)}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="the-problem" className="py-20 lg:py-28 relative scroll-animate">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 animate-on-scroll max-w-2xl">
              <Badge variant="outline" className="border-red-500/50 text-red-400 mb-6 text-base px-4 py-1">
                {problem('sectionBadge')}
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                {problem('sectionHeading')}
                <br />
                <span className="text-red-400">{problem('sectionHighlight')}</span>
              </h2>
              <p className="text-lg text-slate-400">
                {problem('sectionDescription')}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-12">
              {[
                { value: 85, suffix: "%", label: problem('stats.accuracyDrop'), source: problem('sources.accuracyDrop') },
                { value: 18, suffix: "/18", label: problem('stats.frontierModels'), source: problem('sources.frontierModels') },
                { value: 13, suffix: "B", label: problem('stats.vectorMarket'), source: problem('sources.vectorMarket'), prefix: "$" },
              ].map((stat, i) => (
                <div key={i} className={`p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 ${i === 0 ? 'text-left' : i === 1 ? 'text-center' : 'text-right'}`}>
                  <div className="text-2xl font-bold text-red-400 mb-1">
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} prefix={stat.prefix || ""} />
                  </div>
                  <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
                  <p className="text-[10px] text-slate-600">{stat.source}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {featuredProblems.map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className={`p-6 rounded-2xl bg-slate-900/60 border ${card.color} group hover:border-slate-600/60 transition-colors ${i % 2 === 0 ? 'text-left' : 'text-left'}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-2 py-0.5 border ${card.categoryColor} bg-transparent`}
                    >
                      {card.category === 'memory' && problem('filterLabels.memory')}
                      {card.category === 'portability' && problem('filterLabels.portability')}
                      {card.category === 'trust' && problem('filterLabels.trust')}
                      {card.category === 'developer' && problem('filterLabels.developer')}
                    </Badge>
                    <span className="text-xs text-slate-500">{problem('rankPrefix')}{card.rank}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{card.title}</h3>
                  <p className="text-xs text-slate-400 mb-3 italic">{card.hook}</p>
                  <p className="text-sm text-red-400 mb-3 font-medium">{card.stat}</p>
                  <p className="text-sm text-slate-400 mb-4">{card.desc}</p>
                  <a 
                    href={card.solutionLink}
                    className="inline-flex items-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <span>{problem('howVivimSolves')}</span>
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
                    <span>{problem('exploreAll')}</span>
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
                        { id: 'all', label: problem('filterLabels.all'), color: 'border-slate-600 text-slate-400' },
                        { id: 'memory', label: problem('filterLabels.memory'), color: 'border-blue-500/50 text-blue-400' },
                        { id: 'portability', label: problem('filterLabels.portability'), color: 'border-green-500/50 text-green-400' },
                        { id: 'trust', label: problem('filterLabels.trust'), color: 'border-amber-500/50 text-amber-400' },
                        { id: 'developer', label: problem('filterLabels.developer'), color: 'border-purple-500/50 text-purple-400' },
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
                      {filteredProblems.map((problemItem) => (
                        <motion.div
                          key={problemItem.rank}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-slate-700/50 transition-colors"
                        >
                          <div className="flex items-start gap-3 mb-2">
                            <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                              problemItem.rank <= 3 ? 'bg-amber-500/20 text-amber-400' :
                              problemItem.rank <= 6 ? 'bg-blue-500/20 text-blue-400' :
                              'bg-slate-700 text-slate-400'
                            }`}>
                              #{problemItem.rank}
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`text-[10px] px-1.5 py-0 ${
                                problemItem.category === 'memory' ? 'border-blue-500/30 text-blue-400' :
                                problemItem.category === 'portability' ? 'border-green-500/30 text-green-400' :
                                problemItem.category === 'trust' ? 'border-amber-500/30 text-amber-400' :
                                'border-purple-500/30 text-purple-400'
                              } bg-transparent`}
                            >
                              {problemItem.category === 'memory' && problem('filterLabels.memory')}
                              {problemItem.category === 'portability' && problem('filterLabels.portability')}
                              {problemItem.category === 'trust' && problem('filterLabels.trust')}
                              {problemItem.category === 'developer' && problem('filterLabels.developer')}
                            </Badge>
                          </div>
                          <h4 className="text-sm font-semibold text-white mb-1">{problemItem.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2">{problemItem.hook}</p>
                          <button 
                            onClick={() => openScorecardModal(problemItem)}
                            className="mt-2 text-xs text-slate-500 hover:text-slate-300 flex items-center"
                          >
                            {problem('viewScores')} →
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
                        {problem('openFullScorecard')}
                      </Button>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </div>
          </div>
        </section>

        {/* Section Divider */}
        <div className="relative h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent max-w-3xl mx-auto" />

        <section id="the-solution" className="py-20 lg:py-32 relative bg-slate-900/30 scroll-animate">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 mb-6 text-base px-4 py-1">
                {solution('sectionBadge')}
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                {solution('heading')}
                <br />
                <span className="text-emerald-400">
                  {solution('highlight')}
                </span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                {solution('description')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: Brain, titleKey: 'features.remembersEverything.title', descKey: 'features.remembersEverything.desc' },
                { icon: Target, titleKey: 'features.intelligentRetrieval.title', descKey: 'features.intelligentRetrieval.desc' },
                { icon: Globe, titleKey: 'features.worksWithAnyAi.title', descKey: 'features.worksWithAnyAi.desc' },
              ].map((feature, i) => (
                <motion.div
                  key={feature.titleKey}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className={`p-6 rounded-2xl glass-card ${
                    i === 0 ? 'md:col-span-3 text-center max-w-2xl mx-auto' : 'text-center'
                  }`}
                >
                  <div className={`rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center mb-4 ${
                    i === 0 ? 'w-20 h-20' : 'w-14 h-14 mx-auto'
                  }`}>
                    <feature.icon className={`text-white ${i === 0 ? 'w-10 h-10' : 'w-7 h-7'}`} />
                  </div>
                  <h3 className={`font-bold text-white mb-2 ${i === 0 ? 'text-2xl' : 'text-xl'}`}>{solution(feature.titleKey as any)}</h3>
                  <p className="text-slate-400">{solution(feature.descKey as any)}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Link href="/demos/context-engine">
                <Button className="bg-violet-600 hover:bg-violet-500 text-white text-lg px-8 py-6 rounded-xl font-medium glow-violet">
                  {solution('cta')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Pricing Section */}
            <PricingSection />

            {/* Interactive Demos Section */}
            <div className="mt-16">
              <div className="text-center mb-10">
                <Badge variant="outline" className="border-violet-500/50 text-violet-400 mb-4 text-base px-4 py-1">
                  {demos('sectionBadge')}
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  {demos('sectionTitle')}
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  {demos('sectionDescription')}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.keys(DEMO_ICON_MAP).map((slug, idx) => {
                  const demoData = DEMO_DATA[slug];
                  const demoConfig = DEMO_ICON_MAP[slug];
                  const Icon = demoConfig?.icon;
                  const isFeatured = idx === 0;
                  const href = `/demos/${slug.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
                  return (
                    <Link 
                      key={slug} 
                      href={href}
                      className={isFeatured ? "md:col-span-2 lg:col-span-2" : ""}
                    >
                      <motion.div
                        whileHover={{ y: -4 }}
                        className={`p-6 rounded-2xl glass-card border transition-all group ${
                          isFeatured 
                            ? "border-violet-500/30 hover:border-violet-500/60 h-full" 
                            : "border-white/5 hover:border-violet-500/30"
                        }`}
                      >
                        <div className={`rounded-xl bg-gradient-to-br ${demoConfig?.color || 'from-violet-500 to-purple-600'} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${
                          isFeatured ? "w-16 h-16 mb-6" : "w-12 h-12"
                        }`}>
                          {Icon && <Icon className={`text-white ${isFeatured ? "w-8 h-8" : "w-6 h-6"}`} />}
                        </div>
                        <h3 className={`font-bold text-white mb-2 group-hover:text-violet-300 transition-colors ${
                          isFeatured ? "text-2xl mb-3" : "text-lg"
                        }`}>
                          {demoData?.title}
                        </h3>
                        <p className={`text-slate-400 ${isFeatured ? "text-base" : "text-sm"}`}>
                          {demoData?.desc}
                        </p>
                      </motion.div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        <section id="acus" className="py-16 lg:py-24 relative scroll-animate">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="outline" className="border-violet-500/50 text-violet-400 mb-6 text-base px-4 py-1">
                {acus('sectionBadge')}
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                {acus('title')}
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-4">
                {acus('description')}
              </p>
              <p className="text-base text-slate-500 max-w-xl mx-auto">
                {acus('descriptionExtended')}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">{acus('problemTitle')}</h3>
                <div className="space-y-4">
                  {acusItems('problemItems').map((item, i) => (
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
                <h3 className="text-2xl font-bold text-white mb-6">{acus('solutionTitle')}</h3>
                <div className="space-y-4">
                  {acusItems('solutionItems').map((item, i) => (
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

        <div className="relative h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent max-w-3xl mx-auto" />

        {/* Rights Layer Section */}
        <section id="rights-layer" className="py-16 lg:py-24 relative bg-slate-900/30 scroll-animate">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="outline" className="border-amber-500/50 text-amber-400 mb-6 text-base px-4 py-1">
                {rightsLayer('sectionBadge')}
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                {rightsLayer('heading')}
                <span className="text-amber-400"> {rightsLayer('highlight')}</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                {rightsLayer('description')}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
              {Object.keys(RIGHTS_TIER_DATA).map((tierKey) => {
                const tier = RIGHTS_TIER_DATA[tierKey];
                const tierStyle = RIGHTS_TIER_COLORS[tierKey] || RIGHTS_TIER_COLORS.t0;
                return (
                  <motion.div
                    key={tierKey}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`p-5 rounded-xl bg-slate-900/60 border ${tierStyle.border} hover:scale-105 transition-transform`}
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tierStyle.color} flex items-center justify-center mb-3`}>
                      <span className="text-white font-bold text-sm">{tierKey.toUpperCase()}</span>
                    </div>
                    <h3 className="text-white font-bold mb-2">{tier.label}</h3>
                    <p className="text-sm text-slate-400">{tier.desc}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 rounded-2xl glass-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Handshake className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{rightsLayer('features.tdass.title')}</h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  {rightsLayer('features.tdass.desc')}
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-slate-300">{rightsLayer('features.tdass.activePeriod')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-orange-400" />
                    <span className="text-slate-300">{rightsLayer('features.tdass.sunset')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-300">{rightsLayer('features.tdass.postSunset')}</span>
                  </div>
                </div>
              </div>
              <div className="p-6 rounded-2xl glass-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Scale className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{rightsLayer('features.tpdi.title')}</h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  {rightsLayer('features.tpdi.desc')}
                </p>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <FileKey className="w-4 h-4" />
                  <span>{rightsLayer('features.tpdi.flow')}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link href="/demos/rights-layer">
                <Button className="bg-amber-600 hover:bg-amber-500 text-white text-lg px-8 py-6 rounded-xl font-medium">
                  {rightsLayer('cta')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Sentinel Detection Section */}
        <section id="sentinel" className="py-16 lg:py-20 relative scroll-animate">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="outline" className="border-red-500/50 text-red-400 mb-6 text-base px-4 py-1">
                {sentinel('sectionBadge')}
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                {sentinel('heading')}
                <span className="text-red-400"> {sentinel('highlight')}</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                {sentinel('description')}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-12">
              {SENTINEL_ALGORITHMS.map((algo, i) => (
                <motion.div
                  key={algo}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.03 }}
                  viewport={{ once: true }}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-red-500/30 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <ScanLine className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-red-400 font-mono">A{i + 1}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-tight">{algo}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 rounded-2xl glass-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center">
                    <ScanEye className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{sentinel('features.canary.title')}</h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  {sentinel('features.canary.desc')}
                </p>
                <div className="p-3 rounded-lg bg-slate-800/50 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-green-400">{sentinel('features.canary.ready')}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">|canary⟩ = α|undetected⟩ + β|detected⟩</p>
                </div>
              </div>
              <div className="p-6 rounded-2xl glass-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{sentinel('features.evidence.title')}</h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  {sentinel('features.evidence.desc')}
                </p>
                <div className="p-3 rounded-lg bg-slate-800/50 border border-violet-500/20">
                  <div className="text-xs text-slate-400 mb-2">{sentinel('features.evidence.exportFormat')}</div>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">JSON</span>
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">PDF</span>
                    <span className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded">ZIP</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link href="/demos/sentinel-detection">
                <Button className="bg-red-600 hover:bg-red-500 text-white text-lg px-8 py-6 rounded-xl font-medium">
                  {sentinel('cta')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Marketplace Section */}
        <section id="marketplace" className="py-16 lg:py-24 relative bg-slate-900/30 scroll-animate">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 mb-6 text-base px-4 py-1">
                {marketplace('sectionBadge')}
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                {marketplace('heading')}
                <span className="text-emerald-400"> {marketplace('highlight')}</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                {marketplace('description')}
              </p>
            </div>

            <div className="grid md:grid-cols-5 gap-4 mb-12">
              {MARKETPLACE_STEPS.map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">{i + 1}</span>
                  </div>
                  <h3 className="text-white font-bold mb-1">{step.label}</h3>
                  <p className="text-xs text-slate-500">{step.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 rounded-2xl glass-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{marketplace('features.revenue.title')}</h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  {marketplace('features.revenue.desc')}
                </p>
                <div className="space-y-3">
                  {MARKETPLACE_REVENUE_BREAKS.map((item, idx) => (
                    <div key={idx} className={`flex justify-between items-center p-2 rounded bg-slate-800/30 ${idx === MARKETPLACE_REVENUE_BREAKS.length - 1 ? 'border-t border-slate-700 pt-2' : ''}`}>
                      <span className={`text-sm ${idx === MARKETPLACE_REVENUE_BREAKS.length - 1 ? 'text-white font-medium' : 'text-slate-400'}`}>{item.label}</span>
                      <span className={`text-sm font-mono ${item.color === 'emerald' ? 'text-emerald-400' : item.color === 'amber' ? 'text-amber-400' : idx === MARKETPLACE_REVENUE_BREAKS.length - 1 ? 'text-white' : 'text-white'}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-6 rounded-2xl glass-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{marketplace('features.zkp.title')}</h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  Prove data properties without revealing content:
                </p>
                <div className="space-y-2">
                  <div className="p-2 rounded bg-slate-800/30 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-slate-300">Ownership proof</span>
                  </div>
                  <div className="p-2 rounded bg-slate-800/30 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-slate-300">Consent validity</span>
                  </div>
                  <div className="p-2 rounded bg-slate-800/30 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-slate-300">Data property attestation</span>
                  </div>
                  <div className="p-2 rounded bg-slate-800/30 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-slate-300">Aggregate statistics</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white text-lg px-8 py-6 rounded-xl font-medium">
                {marketplace('cta')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-xs text-slate-500 mt-3">{marketplace('comingSoon')}</p>
            </div>
          </div>
        </section>

        <div className="relative h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent max-w-3xl mx-auto" />

        <section id="principles" className="py-16 lg:py-20 relative bg-slate-900/30 scroll-animate">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/30 mb-6">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-slate-300">{principles('sectionLabel')}</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                <span className="text-violet-400">
                  {principles('heading')}
                </span>
                <br />
                <span className="text-white">{principles('highlight')}</span>
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-4">
                {principles('description')}
              </p>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                {principles('descriptionExtended')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PRINCIPLES_DATA.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-2xl glass-card"
                >
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <div className="relative h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent max-w-3xl mx-auto" />

        <section id="context-layers" className="py-16 lg:py-20 relative scroll-animate">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <Badge variant="outline" className="border-violet-500/50 text-violet-400 mb-6 text-base px-4 py-1">
                {contextLayers('sectionBadge')}
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                {contextLayers('heading')}
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                {contextLayers('description')}
              </p>
            </div>

            <div className="space-y-4">
              {Object.entries(CONTEXT_LAYERS_DATA).map(([key, layer], i) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="flex items-center gap-4 p-4 rounded-xl glass-card"
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${LAYER_COLORS[i % LAYER_COLORS.length]} flex items-center justify-center shrink-0`}>
                    <span className="text-white font-bold text-sm">{key.toUpperCase()}</span>
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
                <span className="text-white font-medium">{contextLayers('totalLabel')}</span> {contextLayers('totalTokens')}
              </p>
            </div>
          </div>
        </section>

        <section id="memory-types" className="py-16 lg:py-20 relative bg-slate-900/30 scroll-animate">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                {memoryTypes('title')}{" "}
                <span className="text-cyan-400">
                  {memoryTypes('highlight')}
                </span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                {memoryTypes('description')}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MEMORY_TYPES_DATA.map((memory, i) => (
                <motion.div
                  key={memory.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  viewport={{ once: true }}
                  className="p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:scale-105 transition-transform"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="font-bold text-white">{memory.name}</span>
                  </div>
                  <p className="text-sm text-slate-300 italic">{memory.example}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section id="developers" className="py-16 lg:py-24 relative scroll-animate">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 mb-6 text-base px-4 py-1">
                {developers('sectionBadge')}
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                {developers('heading')}{" "}
                <span className="text-cyan-400">
                  {developers('highlight')}
                </span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-4">
                {developers('description')}
              </p>
              <p className="text-base text-slate-500 max-w-xl mx-auto">
                {developers('descriptionExtended')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {DEVELOPERS_DATA.map((feature, i) => (
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
                {developers('codeExample')}
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
                {footer('tagline')}
              </p>
              <p className="text-sm text-slate-500">
                {footer('philosophy')}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <a href="https://github.com/owenservera/vivim-live" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                {footer('github')}
              </a>
              <a href="https://discord.gg/vivim" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                {footer('discord')}
              </a>
              <a href="/docs" className="text-slate-400 hover:text-white transition-colors">
                {footer('docs')}
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800/50 text-center">
            <p className="text-sm text-slate-500">
              {common('footer.copyright')}
            </p>
          </div>
        </div>
      </footer>

      <Dialog open={showFullScorecard} onOpenChange={setShowFullScorecard}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              {selectedProblem ? `${selectedProblem.title}` : scorecard('modalTitle')}
            </DialogTitle>
          </DialogHeader>
          
          {selectedProblem && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">{selectedProblem.hook}</p>
              
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: scorecard('pain'), value: selectedProblem.scores.P, color: selectedProblem.scores.P >= 8 ? "bg-red-500" : "bg-amber-500" },
                  { label: scorecard('timeLost'), value: selectedProblem.scores.T, color: selectedProblem.scores.T >= 8 ? "bg-red-500" : "bg-amber-500" },
                  { label: scorecard('trustErosion'), value: selectedProblem.scores.E, color: selectedProblem.scores.E >= 8 ? "bg-red-500" : "bg-amber-500" },
                  { label: scorecard('marketSize'), value: selectedProblem.scores.M, color: selectedProblem.scores.M >= 8 ? "bg-red-500" : "bg-amber-500" },
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
                <div className="text-xs text-slate-500 mb-2">{scorecard('vivimSolution')}</div>
                <p className="text-sm text-slate-300">{selectedProblem.vivimAnswer}</p>
                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
                  {scorecard('solutionFitPrefix')} {selectedProblem.vivimScore}/10
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-800/30 border-l-4 border-amber-500/50">
                <div className="text-xs text-slate-500 mb-1">{scorecard('gapAnalysis')}</div>
                <p className="text-sm text-slate-400">{selectedProblem.vivimGap}</p>
              </div>
            </div>
          )}

          {!selectedProblem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: "P", desc: scorecard('dimensionLabels.P'), color: "text-red-400" },
                  { label: "T", desc: scorecard('dimensionLabels.T'), color: "text-orange-400" },
                  { label: "E", desc: scorecard('dimensionLabels.E'), color: "text-amber-400" },
                  { label: "M", desc: scorecard('dimensionLabels.M'), color: "text-blue-400" },
                ].map((dim) => (
                  <div key={dim.label} className="p-3 rounded-lg bg-slate-800/50 text-center">
                    <div className={`text-lg font-bold ${dim.color}`}>{dim.label}</div>
                    <div className="text-xs text-slate-500">{dim.desc}</div>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 max-h-[50vh] overflow-y-auto">
                {problemsData.map((p) => {
                  const avg = (p.scores.P + p.scores.T + p.scores.E + p.scores.M) / 4;
                  return (
                    <button
                      key={p.rank}
                      type="button"
                      onClick={() => openScorecardModal(p)}
                      className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 hover:border-slate-600 text-left transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          p.rank <= 3 ? 'bg-amber-500/20 text-amber-400' :
                          p.rank <= 6 ? 'bg-blue-500/20 text-blue-400' :
                          'bg-slate-700 text-slate-400'
                        }`}>
                          #{p.rank}
                        </span>
                        <div className="flex-1">
                          <div className="text-sm font-medium text-white">{p.title}</div>
                          <div className="text-xs text-slate-500 mt-1">{scorecard('scorePrefix')} {avg.toFixed(1)}/10</div>
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

      <FloatingChat />
    </div>
  );
}
