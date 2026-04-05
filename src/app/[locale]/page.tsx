"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations, useFormatters } from 'next-intl';
import Link from 'next/link';
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
  Settings,
  Timer,
  Target,
  Users,
  ChevronRight,
  CheckCircle2,
  BarChart3,
  Lock,
  History,
  Network,
  Zap as BrainZap,
  Lock as Sentinel,
  ShoppingCart,
  FileKey,
  Scale,
  Radar,
  ScanEye,
  FileCheck,
  DollarSign,
  Handshake,
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
import { NeuralBackground } from "@/components/neural-bg";
import { HeroVisual } from "@/components/hero-visual";
import { ReadingProgress } from "@/components/reading-progress";
import { AnimatedCounter, useScrollAnimation } from "@/components/animated-counter";

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

const MEMORY_COLORS = [
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-blue-600",
  "from-fuchsia-500 to-pink-600",
  "from-lime-500 to-green-600",
  "from-sky-500 to-cyan-600",
];

const PRINCIPLE_COLORS = [
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-blue-600",
];

const DEMO_COLORS = [
  "from-violet-500 to-purple-600",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-blue-500 to-indigo-600",
  "from-rose-500 to-pink-600",
  "from-lime-500 to-green-600",
  "from-amber-500 to-orange-600",
  "from-red-500 to-rose-600",
  "from-emerald-500 to-teal-600",
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
  {
    slug: "rights-layer",
    title: "Rights Layer",
    desc: "Granular ownership tiers with co-governance for your data",
    icon: ShieldCheck,
    color: "from-amber-500 to-orange-600",
  },
  {
    slug: "sentinel-detection",
    title: "Sentinel Detection",
    desc: "13 algorithms that detect if your data was used without permission",
    icon: Radar,
    color: "from-red-500 to-rose-600",
  },
  {
    slug: "marketplace",
    title: "Marketplace",
    desc: "Monetize your intelligence on your terms",
    icon: ShoppingCart,
    color: "from-emerald-500 to-teal-600",
  },
];

interface Problem {
  rank: number;
  key: string;
  category: "memory" | "portability" | "trust" | "developer";
  scores: { P: number; T: number; E: number; M: number };
  vivimScore: number;
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
  const t = useTranslations('hero');
  const tproviders = useTranslations('providers');
  const tp = useTranslations('principles');
  const tc = useTranslations('contextLayers');
  const tm = useTranslations('memoryTypes');
  const td = useTranslations('demos');
  const ts = useTranslations('solution');
  const tpr = useTranslations('problem');
  const tsentinel = useTranslations('sentinel');
  const tmarketplace = useTranslations('marketplace');
  const tacus = useTranslations('acus');
  const trl = useTranslations('rightsLayer');
  const tdc = useTranslations('demos');
  const tCommon = useTranslations('common');
  const tFooter = useTranslations('footer');
  const tScorecard = useTranslations('scorecard');
  const tDevelopers = useTranslations('developers');
  const { number, percent, currency } = useFormatters();
  const [scrolled, setScrolled] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [showFullScorecard, setShowFullScorecard] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  useScrollAnimation();

  const layersData = useMemo(() => {
    const keys = ['l0', 'l1', 'l2', 'l3', 'l4', 'l5', 'l6', 'l7'];
    return keys.map((key, i) => ({
      name: key.toUpperCase(),
      label: tc(`layers.${key}.label`),
      desc: tc(`layers.${key}.desc`),
      tokens: tc(`layers.${key}.tokens`),
      color: LAYER_COLORS[i],
    }));
  }, [tc]);

  const memoryTypesData = useMemo(() => {
    const keys = ['episodic', 'semantic', 'procedural', 'factual', 'preference', 'identity', 'relationship', 'goal', 'project'];
    const icons = [Timer, Database, Settings, Target, Sparkles, Brain, Users, Target, Layers];
    return keys.map((key, i) => ({
      name: tm(`types.${key}.name`),
      icon: icons[i],
      color: MEMORY_COLORS[i],
      example: tm(`types.${key}.example`),
    }));
  }, [tm]);

  const principlesData = useMemo(() => {
    const keys = ['sovereign', 'personal', 'providerAgnostic', 'portable', 'useCaseAgnostic', 'dynamicallyGenerated'];
    const icons = [Shield, Users, Globe, Download, Code2, Zap];
    return keys.map((key, i) => ({
      icon: icons[i],
      title: tp(`items.${key}.title`),
      desc: tp(`items.${key}.desc`),
      color: PRINCIPLE_COLORS[i],
    }));
  }, [tp]);

  const demosData = useMemo(() => {
    const keys = ['liveMemory', 'contextEngine', 'zeroKnowledgePrivacy', 'sovereignHistory', 'decentralizedNetwork', 'secureCollaboration', 'dynamicIntelligence', 'rightsLayer', 'sentinelDetection', 'marketplace'];
    const icons = [Brain, Layers, Lock, History, Network, Users, BrainZap, ShieldCheck, Radar, ShoppingCart];
    const slugs = ['live-memory', 'context-engine', 'zero-knowledge-privacy', 'sovereign-history', 'decentralized-network', 'secure-collaboration', 'dynamic-intelligence', 'rights-layer', 'sentinel-detection', 'marketplace'];
    return keys.map((key, i) => ({
      slug: slugs[i],
      title: td(`items.${key}.title`),
      desc: td(`items.${key}.desc`),
      icon: icons[i],
      color: DEMO_COLORS[i],
    }));
  }, [td]);

  const solutionFeaturesData = useMemo(() => {
    const keys = ['remembersEverything', 'intelligentRetrieval', 'worksWithAnyAi'];
    const icons = [Brain, Target, Globe];
    return keys.map((key, i) => ({
      icon: icons[i],
      title: ts(`features.${key}.title`),
      desc: ts(`features.${key}.desc`),
    }));
  }, [ts]);

  const rightsLayerData = useMemo(() => {
    const tiers = ['t0', 't1', 't2', 't3', 't4', 't5'];
    const colors = [
      "from-emerald-500 to-green-600",
      "from-emerald-400 to-teal-500",
      "from-amber-400 to-orange-500",
      "from-orange-500 to-amber-600",
      "from-red-500 to-rose-600",
      "from-red-600 to-red-700"
    ];
    const borders = [
      "border-emerald-500/30",
      "border-emerald-400/30",
      "border-amber-400/30",
      "border-orange-500/30",
      "border-red-500/30",
      "border-red-600/30"
    ];
    return tiers.map((tier, i) => ({
      tier: tier.toUpperCase(),
      label: trl(`tiers.${tier}.label`),
      desc: trl(`tiers.${tier}.desc`),
      color: colors[i],
      border: borders[i],
    }));
  }, [trl]);

  const marketplaceStepsData = useMemo(() => {
    const steps = ['step1', 'step2', 'step3', 'step4', 'step5'];
    return steps.map((step, i) => ({
      step: (i + 1).toString(),
      label: tmarketplace(`steps.${step}.label`),
      desc: tmarketplace(`steps.${step}.desc`),
    }));
  }, [tmarketplace]);

  const sentinelAlgorithmsData = useMemo(() => {
    return tsentinel.raw('algorithms') as string[];
  }, [tsentinel]);

  const problemsData = useMemo(() => {
    return BASE_PROBLEMS.map(p => ({
      ...p,
      title: tpr(`cards.${p.key}.title`),
      hook: tpr(`cards.${p.key}.hook`),
      vivimAnswer: tpr(`cards.${p.key}.vivimAnswer`),
      vivimGap: tpr(`cards.${p.key}.vivimGap`),
    }));
  }, [tpr]);

  const statsData = useMemo(() => [
    { value: 85, display: percent(0.85), label: tpr('stats.accuracyDrop'), source: tpr('sources.accuracyDrop') },
    { value: 18, display: "18/18", label: tpr('stats.frontierModels'), source: tpr('sources.frontierModels') },
    { value: 13, display: currency(13, 'USD', { notation: 'compact', compactDisplay: 'short', maximumFractionDigits: 0 }), label: tpr('stats.vectorMarket'), source: tpr('sources.vectorMarket') },
  ], [percent, currency, tpr]);

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
                  <span className="text-sm text-slate-300">{t('tagline')}</span>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 hero-stagger-2"
              >
                <span className="text-white">
                  {t('title')}
                </span>
              </motion.h1>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-3xl sm:text-4xl font-medium text-white mb-4 hero-stagger-3"
              >
                {t('titleHighlight')}
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="text-lg text-slate-400 max-w-xl mx-auto mb-6 hero-stagger-3"
              >
                {t('description')}
              </motion.p>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="max-w-2xl mx-auto mb-8 px-4 py-3 rounded-xl glass border border-violet-500/20 hero-stagger-4"
              >
                <p className="text-base text-slate-300 italic">
                  &ldquo;{t('quote')}&rdquo;
                </p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45 }}
                className="text-lg sm:text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto mb-8 hero-stagger-4"
              >
                {t('descriptionExtended')}
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
                    {t('cta.tryLiveDemo')}
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
                  {t('cta.viewOnGithub')}
                </a>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="py-16 lg:py-20 relative bg-slate-900/30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10 scroll-animate">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                {tproviders('title', { highlight: tproviders('highlight') })}
              </h2>
              <p className="text-slate-400">
                {tproviders('description')}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              {PROVIDERS.map((provider) => (
                <div
                  key={provider.name}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl glass-card hover:border-violet-500/30 transition-colors min-w-[120px] card-lift cursor-pointer"
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

        <section id="the-problem" className="py-20 lg:py-28 relative scroll-animate">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16 animate-on-scroll max-w-2xl">
              <Badge variant="outline" className="border-red-500/50 text-red-400 mb-6 text-base px-4 py-1">
                {tpr('sectionBadge')}
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                {tpr('sectionHeading')}
                <br />
                <span className="text-red-400">{tpr('sectionHighlight')}</span>
              </h2>
              <p className="text-lg text-slate-400">
                {tpr('sectionDescription')}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-12">
              {statsData.map((stat, i) => (
                <div key={i} className={`p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 ${i === 0 ? 'text-left' : i === 1 ? 'text-center' : 'text-right'}`}>
                  <div className="text-2xl font-bold text-red-400 mb-1">
                    <AnimatedCounter value={stat.value} displayValue={stat.display} />
                  </div>
                  <p className="text-xs text-slate-400 mb-1">{stat.label}</p>
                  <p className="text-[10px] text-slate-600">{stat.source}</p>
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  title: tpr('cards.contextWipe.title'),
                  hook: tpr('cards.contextWipe.hook'),
                  stat: tpr('cards.contextWipe.stat'),
                  desc: tpr('cards.contextWipe.desc'),
                  color: "border-red-500/30",
                  category: "memory",
                  categoryColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
                  solutionLink: "#the-solution",
                },
                {
                  title: tpr('cards.providerLockIn.title'),
                  hook: tpr('cards.providerLockIn.hook'),
                  stat: tpr('cards.providerLockIn.stat'),
                  desc: tpr('cards.providerLockIn.desc'),
                  color: "border-orange-500/30",
                  category: "portability",
                  categoryColor: "bg-green-500/10 text-green-400 border-green-500/30",
                  solutionLink: "#the-solution",
                },
                {
                  title: tpr('cards.copyPasteTax.title'),
                  hook: tpr('cards.copyPasteTax.hook'),
                  stat: tpr('cards.copyPasteTax.stat'),
                  desc: tpr('cards.copyPasteTax.desc'),
                  color: "border-amber-500/30",
                  category: "memory",
                  categoryColor: "bg-blue-500/10 text-blue-400 border-blue-500/30",
                  solutionLink: "#the-solution",
                },
                {
                  title: tpr('cards.middleBlackHole.title'),
                  hook: tpr('cards.middleBlackHole.hook'),
                  stat: tpr('cards.middleBlackHole.stat'),
                  desc: tpr('cards.middleBlackHole.desc'),
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
                  className={`p-6 rounded-2xl bg-slate-900/60 border ${card.color} group hover:border-slate-600/60 transition-colors ${i % 2 === 0 ? 'text-left' : 'text-left'}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <Badge
                      variant="outline"
                      className={`text-xs px-2 py-0.5 border ${card.categoryColor} bg-transparent`}
                    >
                      {card.category === 'memory' && tpr('filterLabels.memory')}
                      {card.category === 'portability' && tpr('filterLabels.portability')}
                      {card.category === 'trust' && tpr('filterLabels.trust')}
                      {card.category === 'developer' && tpr('filterLabels.developer')}
                    </Badge>
                    <span className="text-xs text-slate-500">{tpr('rankPrefix')}{i + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white mb-1">{card.title}</h3>
                  <p className="text-xs text-slate-400 mb-3 italic">{card.hook}</p>
                  <p className="text-sm text-red-400 mb-3 font-medium">{card.stat}</p>
                  <p className="text-sm text-slate-400 mb-4">{card.desc}</p>
                  <a
                    href={card.solutionLink}
                    className="inline-flex items-center text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    <span>{tpr('howVivimSolves')}</span>
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
                    <span>{tpr('exploreAll')}</span>
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
                        { id: 'all', label: tpr('filterLabels.all'), color: 'border-slate-600 text-slate-400' },
                        { id: 'memory', label: tpr('filterLabels.memory'), color: 'border-blue-500/50 text-blue-400' },
                        { id: 'portability', label: tpr('filterLabels.portability'), color: 'border-green-500/50 text-green-400' },
                        { id: 'trust', label: tpr('filterLabels.trust'), color: 'border-amber-500/50 text-amber-400' },
                        { id: 'developer', label: tpr('filterLabels.developer'), color: 'border-purple-500/50 text-purple-400' },
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
                              {problem.category === 'memory' && tpr('filterLabels.memory')}
                              {problem.category === 'portability' && tpr('filterLabels.portability')}
                              {problem.category === 'trust' && tpr('filterLabels.trust')}
                              {problem.category === 'developer' && tpr('filterLabels.developer')}
                            </Badge>
                          </div>
                          <h4 className="text-sm font-semibold text-white mb-1">{problem.title}</h4>
                          <p className="text-xs text-slate-400 line-clamp-2">{problem.hook}</p>
                          <button
                            onClick={() => openScorecardModal(problem)}
                            className="mt-2 text-xs text-slate-500 hover:text-slate-300 flex items-center"
                          >
                            {tpr('viewScores')}
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
                        {tpr('openScorecard')}
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
                {ts('title')}
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                {ts('heading')}
                <br />
                <span className="text-emerald-400">
                  {ts('highlight')}
                </span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                {ts('description')}
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {solutionFeaturesData.map((feature, i) => (
                <motion.div
                  key={feature.title}
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
                  } ${i === 0 ? '' : ''}`}>
                    <feature.icon className={`text-white ${i === 0 ? 'w-10 h-10' : 'w-7 h-7'}`} />
                  </div>
                  <h3 className={`font-bold text-white mb-2 ${i === 0 ? 'text-2xl' : 'text-xl'}`}>{feature.title}</h3>
                  <p className="text-slate-400">{feature.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <Link href="/demos/context-engine">
                <Button className="bg-violet-600 hover:bg-violet-500 text-white text-lg px-8 py-6 rounded-xl font-medium glow-violet">
                  {ts('cta')}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </div>

            {/* Interactive Demos Section */}
            <div className="mt-16">
              <div className="text-center mb-10">
                <Badge variant="outline" className="border-violet-500/50 text-violet-400 mb-4 text-base px-4 py-1">
                  {tdc('sectionBadge')}
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  {tdc('sectionTitle')}
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  {tdc('sectionDescription')}
                </p>
              </div>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {demosData.map((demo, idx) => {
                  const Icon = demo.icon;
                  const isFeatured = idx === 0;
                  return (
                    <Link 
                      key={demo.slug} 
                      href={`/demos/${demo.slug}`}
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
                        <div className={`rounded-xl bg-gradient-to-br ${demo.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform ${
                          isFeatured ? "w-16 h-16 mb-6" : "w-12 h-12"
                        }`}>
                          <Icon className={`text-white ${isFeatured ? "w-8 h-8" : "w-6 h-6"}`} />
                        </div>
                        <h3 className={`font-bold text-white mb-2 group-hover:text-violet-300 transition-colors ${
                          isFeatured ? "text-2xl mb-3" : "text-lg"
                        }`}>
                          {demo.title}
                        </h3>
                        <p className={`text-slate-400 ${isFeatured ? "text-base" : "text-sm"}`}>
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

        <section id="acus" className="py-16 lg:py-24 relative scroll-animate">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="outline" className="border-violet-500/50 text-violet-400 mb-6 text-base px-4 py-1">
                {tacus('sectionBadge')}
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                {tacus('title')}
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-4">
                {tacus('description')}
              </p>
              <p className="text-base text-slate-500 max-w-xl mx-auto">
                {tacus('descriptionExtended')}
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold text-white mb-6">{tacus('problemTitle')}</h3>
                <div className="space-y-4">
                  {tacus.raw('problemItems').map((item, i) => (
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
                <h3 className="text-2xl font-bold text-white mb-6">{tacus('solutionTitle')}</h3>
                <div className="space-y-4">
                  {tacus.raw('solutionItems').map((item, i) => (
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
                {trl('sectionBadge')}
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                {trl('heading')}
                <span className="text-amber-400"> {trl('highlight')}</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                {trl('description')}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
              {rightsLayerData.map((tier) => (
                <motion.div
                  key={tier.tier}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`p-5 rounded-xl bg-slate-900/60 border ${tier.border} hover:scale-105 transition-transform`}
                >
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${tier.color} flex items-center justify-center mb-3`}>
                    <span className="text-white font-bold text-sm">{tier.tier}</span>
                  </div>
                  <h3 className="text-white font-bold mb-2">{tier.label}</h3>
                  <p className="text-sm text-slate-400">{tier.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 rounded-2xl glass-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                    <Handshake className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{trl('features.tdass.title')}</h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  {trl('features.tdass.desc')}
                </p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="text-slate-300">{trl('features.tdass.activePeriod')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-orange-400" />
                    <span className="text-slate-300">{trl('features.tdass.sunset')}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-slate-300">{trl('features.tdass.postSunset')}</span>
                  </div>
                </div>
              </div>
              <div className="p-6 rounded-2xl glass-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Scale className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{trl('features.tpdi.title')}</h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  {trl('features.tpdi.desc')}
                </p>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <FileKey className="w-4 h-4" />
                  <span>{trl('features.tpdi.flow')}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link href="/demos/rights-layer">
                <Button className="bg-amber-600 hover:bg-amber-500 text-white text-lg px-8 py-6 rounded-xl font-medium">
                  {trl('cta')}
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
                {tsentinel('sectionBadge')}
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                {tsentinel('heading')}
                <span className="text-red-400"> {tsentinel('highlight')}</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                {tsentinel('description')}
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-12">
              {sentinelAlgorithmsData.map((algo: string, i: number) => (
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
                  <h3 className="text-xl font-bold text-white">{tsentinel('features.canary.title')}</h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  {tsentinel('features.canary.desc')}
                </p>
                <div className="p-3 rounded-lg bg-slate-800/50 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-green-400">{tsentinel('features.canary.ready')}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">|canary⟩ = α|undetected⟩ + β|detected⟩</p>
                </div>
              </div>
              <div className="p-6 rounded-2xl glass-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{tsentinel('features.evidence.title')}</h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  {tsentinel('features.evidence.desc')}
                </p>
                <div className="p-3 rounded-lg bg-slate-800/50 border border-violet-500/20">
                  <div className="text-xs text-slate-400 mb-2">{tsentinel('features.evidence.exportFormat')}</div>
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
                  {tsentinel('cta')}
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
                {tmarketplace('sectionBadge')}
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                {tmarketplace('heading')}
                <span className="text-emerald-400"> {tmarketplace('highlight')}</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                {tmarketplace('description')}
              </p>
            </div>

            <div className="grid md:grid-cols-5 gap-4 mb-12">
              {marketplaceStepsData.map((item) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: parseInt(item.step) * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center mx-auto mb-3">
                    <span className="text-white font-bold">{item.step}</span>
                  </div>
                  <h3 className="text-white font-bold mb-1">{item.label}</h3>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="p-6 rounded-2xl glass-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{tmarketplace('features.revenue.title')}</h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  {tmarketplace('features.revenue.desc')}
                </p>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 rounded bg-slate-800/30">
                    <span className="text-sm text-slate-400">{tmarketplace('features.revenue.platform')}</span>
                    <span className="text-sm text-white font-mono">$150</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-slate-800/30">
                    <span className="text-sm text-slate-400">{tmarketplace('features.revenue.human')}</span>
                    <span className="text-sm text-emerald-400 font-mono">$204</span>
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-slate-800/30">
                    <span className="text-sm text-slate-400">{tmarketplace('features.revenue.company')}</span>
                    <span className="text-sm text-amber-400 font-mono">$204</span>
                  </div>
                  <div className="border-t border-slate-700 pt-2 flex justify-between items-center">
                    <span className="text-sm text-white font-medium">{tmarketplace('features.revenue.totalSale')}</span>
                    <span className="text-sm text-white font-mono">$1000</span>
                  </div>
                </div>
              </div>
              <div className="p-6 rounded-2xl glass-card">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white">{tmarketplace('features.zkProofs.title')}</h3>
                </div>
                <p className="text-slate-400 text-sm mb-4">
                  {tmarketplace('features.zkProofs.desc')}
                </p>
                <div className="space-y-2">
                  {tmarketplace.raw('features.zkProofs.items').map((item: string, i: number) => (
                    <div key={i} className="p-2 rounded bg-slate-800/30 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white text-lg px-8 py-6 rounded-xl font-medium">
                {tmarketplace('cta')}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-xs text-slate-500 mt-3">{tmarketplace('comingSoon')}</p>
            </div>
          </div>
        </section>

        <div className="relative h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent max-w-3xl mx-auto" />

        <section id="principles" className="py-16 lg:py-20 relative bg-slate-900/30 scroll-animate">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-violet-500/30 mb-6">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-slate-300">{tp('sectionLabel')}</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold mb-6">
                <span className="text-violet-400">
                  {tp('heading')}
                </span>
                <br />
                <span className="text-white">{tp('highlight')}</span>
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-4">
                {tp('description')}
              </p>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                {tp('descriptionExtended')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {principlesData.map((principle, i) => (
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

        <div className="relative h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent max-w-3xl mx-auto" />

        <section id="context-layers" className="py-16 lg:py-20 relative scroll-animate">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <Badge variant="outline" className="border-violet-500/50 text-violet-400 mb-6 text-base px-4 py-1">
                {tc('sectionBadge')}
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                {tc('heading')}
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                {tc('description')}
              </p>
            </div>

            <div className="space-y-4">
              {layersData.map((layer, i) => (
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
                <span className="text-white font-medium">{tc('totalLabel')}</span> {tc('totalTokens')}
              </p>
            </div>
          </div>
        </section>

        <section id="memory-types" className="py-16 lg:py-20 relative bg-slate-900/30 scroll-animate">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                {tm('title')}
                <span className="text-cyan-400">
                  {" "}{tm('highlight')}
                </span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                {tm('description')}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {memoryTypesData.map((memory, i) => (
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

        <section id="developers" className="py-16 lg:py-24 relative scroll-animate">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 mb-6 text-base px-4 py-1">
                {tDevelopers('sectionBadge')}
              </Badge>
              <h2 className="text-4xl sm:text-5xl font-bold mb-4">
                {tDevelopers('heading')}{" "}
                <span className="text-cyan-400">
                  {tDevelopers('highlight')}
                </span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-4">
                {tDevelopers('description')}
              </p>
              <p className="text-base text-slate-500 max-w-xl mx-auto">
                {tDevelopers('descriptionExtended')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {[
                { title: tDevelopers('features.identity.title'), desc: tDevelopers('features.identity.desc') },
                { title: tDevelopers('features.contextEngine.title'), desc: tDevelopers('features.contextEngine.desc') },
                { title: tDevelopers('features.storage.title'), desc: tDevelopers('features.storage.desc') },
                { title: tDevelopers('features.zeroKnowledge.title'), desc: tDevelopers('features.zeroKnowledge.desc') },
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
                {tDevelopers('codeExample')}
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
                {tFooter('tagline')}
              </p>
              <p className="text-sm text-slate-500">
                {tFooter('philosophy')}
              </p>
            </div>

            <div className="flex items-center gap-6">
              <a href="https://github.com/owenservera/vivim-live" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                {tFooter('github')}
              </a>
              <a href="https://discord.gg/vivim" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                {tFooter('discord')}
              </a>
              <a href="/docs" className="text-slate-400 hover:text-white transition-colors">
                {tFooter('docs')}
              </a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-800/50 text-center">
            <p className="text-sm text-slate-500">
              {tFooter('copyright')}
            </p>
          </div>
        </div>
      </footer>

      <Dialog open={showFullScorecard} onOpenChange={setShowFullScorecard}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              {selectedProblem ? `${selectedProblem.title}` : tScorecard('modalTitle')}
            </DialogTitle>
          </DialogHeader>

          {selectedProblem && (
            <div className="space-y-4">
              <p className="text-sm text-slate-400">{selectedProblem.hook}</p>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: tScorecard('pain'), value: selectedProblem.scores.P, color: selectedProblem.scores.P >= 8 ? "bg-red-500" : "bg-amber-500" },
                  { label: tScorecard('timeLost'), value: selectedProblem.scores.T, color: selectedProblem.scores.T >= 8 ? "bg-red-500" : "bg-amber-500" },
                  { label: tScorecard('trustErosion'), value: selectedProblem.scores.E, color: selectedProblem.scores.E >= 8 ? "bg-red-500" : "bg-amber-500" },
                  { label: tScorecard('marketSize'), value: selectedProblem.scores.M, color: selectedProblem.scores.M >= 8 ? "bg-red-500" : "bg-amber-500" },
                ].map((dim) => (
                  <div key={dim.label} className="text-center p-3 rounded-lg bg-slate-800/50">
                    <div className="text-xs text-slate-500 mb-2">{tScorecard(`dimensionLabels.${dim.label === tScorecard('pain') ? 'P' : dim.label === tScorecard('timeLost') ? 'T' : dim.label === tScorecard('trustErosion') ? 'E' : 'M'}`)}</div>
                    <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden mb-2">
                      <div className={`h-full ${dim.color}`} style={{ width: `${dim.value * 10}%` }} />
                    </div>
                    <div className="text-lg font-bold text-white">{dim.value}</div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-lg bg-slate-800/50 border-l-4 border-emerald-500">
                <div className="text-xs text-slate-500 mb-2">{tScorecard('vivimSolution')}</div>
                <p className="text-sm text-slate-300">{selectedProblem.vivimAnswer}</p>
                <div className="mt-3 inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium">
                  {tScorecard('solutionFit')} {selectedProblem.vivimScore}/10
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-800/30 border-l-4 border-amber-500/50">
                <div className="text-xs text-slate-500 mb-1">{tScorecard('gapAnalysis')}</div>
                <p className="text-sm text-slate-400">{selectedProblem.vivimGap}</p>
              </div>
            </div>
          )}

          {!selectedProblem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { label: "P", desc: tScorecard('dimensionLabels.P'), color: "text-red-400" },
                  { label: "T", desc: tScorecard('dimensionLabels.T'), color: "text-orange-400" },
                  { label: "E", desc: tScorecard('dimensionLabels.E'), color: "text-amber-400" },
                  { label: "M", desc: tScorecard('dimensionLabels.M'), color: "text-blue-400" },
                ].map((dim) => (
                  <div key={dim.label} className="p-3 rounded-lg bg-slate-800/50 text-center">
                    <div className={`text-lg font-bold ${dim.color}`}>{dim.label}</div>
                    <div className="text-xs text-slate-500">{dim.desc}</div>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 max-h-[50vh] overflow-y-auto">
                {problemsData.map((problem) => {
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
                          <div className="text-xs text-slate-500 mt-1">{tScorecard('scorePrefix')} {avg.toFixed(1)}/10</div>
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
