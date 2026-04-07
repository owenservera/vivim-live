import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, BookOpen, Brain, Database, Shield, Code2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Glossary - VIVIM AI Memory Platform Terminology",
  description: "Complete glossary of VIVIM terminology including ACU, context engine, memory types, rights layers, sentinel detection, and AI memory platform terms.",
  keywords: ["VIVIM glossary", "AI memory terminology", "ACU definition", "context engine terms", "VIVIM dictionary"],
  alternates: { canonical: "https://vivim.live/docs/glossary" },
};

const GLOSSARY = [
  { letter: "A", terms: [
    { term: "ACU (Atomic Chat Unit)", def: "The fundamental data primitive in VIVIM. A granular, timestamped memory object extracted from conversations, containing content, metadata, and vector embeddings for semantic search." },
    { term: "Anonymization (T4)", def: "The process of removing personally identifiable information (PII) from memory data so it can be used for algorithm improvement, research, or marketplace sales without compromising user privacy. Part of the T4 Rights Tier." },
    { term: "API Key", def: "A credential used for programmatic access to VIVIM's API. Can be scoped to specific endpoints, time-bound, and instantly revoked." },
  ]},
  { letter: "B", terms: [
    { term: "Bun", def: "The JavaScript runtime used to run VIVIM's backend and frontend. Provides fast package management and execution for the monorepo." },
  ]},
  { letter: "C", terms: [
    { term: "Context Assembly", def: "The process of dynamically gathering and formatting relevant memories from all 9 memory types into the 8-Layer Context Engine for each AI interaction." },
    { term: "Context Engine", def: "VIVIM's 8-layer system (L0-L7) that assembles optimal AI context per interaction. Layers range from Identity Core (L0) to User Message (L7), each with specific token budgets." },
  ]},
  { letter: "D", terms: [
    { term: "Dynamic Context", def: "VIVIM's approach where context is assembled fresh for each interaction based on relevance, rather than using a static window of recent messages." },
  ]},
  { letter: "E", terms: [
    { term: "Episodic Memory", def: "Time-based event memory that captures specific experiences and conversations. Example: 'Last week we discussed your React component architecture.'" },
    { term: "Escrow", def: "A payment protection mechanism in the Memory Marketplace where buyer funds are held temporarily during the review period before releasing to the seller." },
  ]},
  { letter: "F", terms: [
    { term: "Factual Memory", def: "Biographical and demographic facts about the user. Example: 'You work as a senior engineer at a tech company.'" },
  ]},
  { letter: "G", terms: [
    { term: "Goal Memory", def: "Objectives, targets, and aspirations the user is working toward. Example: 'Launch MVP by Q2, achieve 1000 users in first month.'" },
  ]},
  { letter: "I", terms: [
    { term: "Identity Core (L0)", def: "The first layer of the Context Engine containing core identity markers — who you are at a fundamental level. ~300 token budget, near-permanent persistence." },
    { term: "Identity Memory", def: "Core identity markers and professional/personal self-concept. Example: 'Full-stack developer with focus on AI/ML systems.'" },
  ]},
  { letter: "J", terms: [
    { term: "JWT (JSON Web Token)", def: "The authentication mechanism used by VIVIM. Tokens contain userId, permissions, and expiration, and are validated on every API request." },
    { term: "JIT Retrieval (L5)", def: "Just-in-time retrieval of semantically relevant memories from past interactions. Uses vector similarity search across all memory types. ~2,500 token budget." },
  ]},
  { letter: "L", terms: [
    { term: "Layer (L0-L7)", def: "One of the 8 hierarchical levels in VIVIM's Context Engine. Each layer serves a distinct purpose: L0=Identity, L1=Preferences, L2=Topic, L3=Entity, L4=Arc, L5=JIT, L6=History, L7=Input." },
  ]},
  { letter: "M", terms: [
    { term: "Memory Marketplace", def: "VIVIM's zero-knowledge proof-based marketplace where users buy and sell anonymized memory patterns and AI context packages." },
    { term: "Memory Types", def: "The 9 distinct categories of memory VIVIM manages: Episodic, Semantic, Procedural, Factual, Preference, Identity, Relationship, Goal, and Project." },
  ]},
  { letter: "P", terms: [
    { term: "pgvector", def: "PostgreSQL extension that enables vector similarity search. Used by VIVIM to store and retrieve semantic embeddings for memory matching." },
    { term: "Preference Memory", def: "User preferences for how AI should interact and present information. Example: 'Prefers dark mode interface with concise responses.'" },
    { term: "Prisma ORM", def: "The database ORM used by VIVIM to interact with PostgreSQL. Manages schema, migrations, and type-safe queries." },
    { term: "Procedural Memory", def: "Process and methodology memory — how you prefer to work. Example: 'You prefer TDD methodology with 90% test coverage.'" },
    { term: "Project Memory", def: "Project-specific context, decisions, and progress. Example: 'E-commerce platform uses Next.js 15 with Stripe integration.'" },
  ]},
  { letter: "R", terms: [
    { term: "Relationship Memory", def: "Social connections and interpersonal context. Example: 'John is your tech lead, Sarah handles design.'" },
    { term: "Rights Layer", def: "VIVIM's 6-tier ownership model (T0-T5) that governs data visibility and sharing, ensuring users maintain control over their memory." },
  ]},
  { letter: "S", terms: [
    { term: "Semantic Memory", def: "Factual knowledge and conceptual understanding. Example: 'Python is your primary language for backend development.'" },
    { term: "Sentinel Detection System", def: "13-algorithm security system that monitors for unauthorized access, data leakage, and abuse patterns in real-time." },
    { term: "Sovereign AI", def: "AI systems where users maintain complete ownership and control of their data, context, and memory. VIVIM's core principle." },
  ]},
  { letter: "T", terms: [
    { term: "Token Budget", def: "The maximum number of tokens allocated to each context layer. Total budget is ~11,300+ tokens across all 8 layers." },
    { term: "T0 (Personal Only)", def: "The most restrictive privacy tier. Data visible only to the user, never shared or accessed by others." },
    { term: "T5 (Regulated Public)", def: "The least restrictive tier. Data subject to regulatory disclosure requirements with user notification." },
  ]},
  { letter: "V", terms: [
    { term: "Vector Embedding", def: "A numerical representation of text meaning stored in pgvector. Enables semantic similarity search across memories." },
    { term: "VIVIM", def: "A sovereign, portable, personal AI memory layer that works across all providers. Pronounced 'VIV-im'." },
  ]},
  { letter: "Z", terms: [
    { term: "Zero-Knowledge Proof (ZKP)", def: "A cryptographic method that allows one party to prove knowledge of information without revealing the information itself. Used in VIVIM's Memory Marketplace." },
  ]},
];

export default function GlossaryPage() {
  return (
    <article className="prose prose-invert prose-lg max-w-none">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-slate-400">
          <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
          <li>/</li>
          <li className="text-white" aria-current="page">Glossary</li>
        </ol>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-8 h-8 text-violet-400" />
          <h1 className="text-4xl lg:text-5xl font-bold text-white">Glossary</h1>
        </div>
        <p className="text-xl text-slate-300 leading-relaxed">Complete reference for VIVIM terminology and AI memory platform concepts.</p>
      </header>

      {/* Letter Navigation */}
      <nav aria-label="Glossary letters" className="mb-8">
        <div className="flex flex-wrap gap-2">
          {GLOSSARY.map((section) => (
            <a key={section.letter} href={`#letter-${section.letter}`} className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-sm text-slate-300 hover:bg-violet-500/10 hover:text-violet-300 hover:border-violet-500/30 transition-colors">
              {section.letter}
            </a>
          ))}
        </div>
      </nav>

      {/* Glossary Sections */}
      {GLOSSARY.map((section) => (
        <section key={section.letter} id={`letter-${section.letter}`} className="mb-12">
          <h2 id={section.letter} className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-300 text-xl font-bold">{section.letter}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {section.terms.map((item) => (
              <div key={item.term} className="p-5 rounded-xl bg-white/5 border border-white/10">
                <h3 className="text-base font-semibold text-white mb-2">{item.term}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.def}</p>
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="mb-12">
        <div className="p-8 rounded-xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/20">
          <h2 className="text-2xl font-bold text-white mb-4">Need More Help?</h2>
          <p className="text-slate-300 leading-relaxed mb-6">Explore our documentation for deeper understanding of VIVIM's technology and features.</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/docs/what-is-vivim" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors"><BookOpen className="w-5 h-5" /><span>What is VIVIM</span></Link>
            <Link href="/docs/faq" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors border border-white/10"><ArrowRight className="w-5 h-5" /><span>FAQ</span></Link>
          </div>
        </div>
      </section>
    </article>
  );
}
