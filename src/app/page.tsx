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
} from "lucide-react";
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
  { name: "Anthropic" },
  { name: "Google" },
  { name: "Mistral" },
  { name: "Groq" },
  { name: "Ollama" },
];

const SOLUTION_FEATURES = [
  { icon: Brain, title: "Remembers Everything", desc: "Every conversation, preference, and detail is stored and organized intelligently." },
  { icon: Target, title: "Intelligent Retrieval", desc: "Finds exactly what's relevant using semantic search — no more repeating yourself." },
  { icon: Globe, title: "Works with Any AI", desc: "Model-agnostic design means you can switch providers without losing your memory." },
];

export default function Home() {
  const [scrolled, setScrolled] = useState(false);
  useScrollAnimation();

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
                  title: "The Memory Wipe",
                  stat: "Conversations degrade after 15–20 messages, even with 1M token windows.",
                  desc: "AI doesn&apos;t forget gradually — it forgets all at once. When the context window fills, everything before it vanishes. Every. Single. Time.",
                  color: "border-red-500/30",
                },
                {
                  title: "The Middle Black Hole",
                  stat: "20+ percentage points worse accuracy for information in the middle of context.",
                  desc: "You provided the context. The AI still missed it. Position matters — information buried in the middle gets actively ignored.",
                  color: "border-orange-500/30",
                },
                {
                  title: "The Copy-Paste Tax",
                  stat: "Hours every week rebuilding context from scratch.",
                  desc: "Every session: rebuild context manually. Every project: re-explain your stack, preferences, decisions. Every week: hours of repetitive setup — gone when you close the tab.",
                  color: "border-amber-500/30",
                },
                {
                  title: "The Vendor Cuffs",
                  stat: "$2.1B→$13B vector DB market proves enterprises are spending billions on this.",
                  desc: "Provider-specific memory means lock-in. Switch models, lose everything. Your context belongs to the platform — not to you.",
                  color: "border-purple-500/30",
                },
              ].map((card, i) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  viewport={{ once: true }}
                  className={`p-6 rounded-2xl bg-slate-900/60 border ${card.color}`}
                >
                  <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-sm text-red-400 mb-3 font-medium">{card.stat}</p>
                  <p className="text-sm text-slate-400">{card.desc}</p>
                </motion.div>
              ))}
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
    </div>
  );
}
