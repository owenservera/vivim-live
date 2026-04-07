import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, HelpCircle, Brain, Shield, DollarSign, Code2, Zap, Lock, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Frequently Asked Questions - VIVIM Documentation",
  description: "Answers to common questions about VIVIM's technology, pricing, security, integrations, AI memory, context engine, and use cases.",
  keywords: [
    "VIVIM FAQ",
    "VIVIM frequently asked questions",
    "VIVIM pricing",
    "is VIVIM free",
    "VIVIM security",
    "VIVIM API",
    "VIVIM integrations",
    "VIVIM use cases",
    "VIVIM vs competitors",
    "AI memory FAQ",
  ],
  alternates: {
    canonical: "https://vivim.live/docs/faq",
  },
};

const FAQS = [
  {
    category: "General",
    icon: HelpCircle,
    questions: [
      {
        q: "What is VIVIM?",
        a: "VIVIM is a sovereign, portable, personal AI memory layer that gives you complete ownership of your AI conversation context across all providers. It stores your conversations as Atomic Chat Units (ACUs) and assembles optimal context for each interaction using our 8-Layer Context Engine.",
      },
      {
        q: "How is VIVIM different from ChatGPT's memory feature?",
        a: "Unlike ChatGPT's simple memory, VIVIM: (1) Works across all AI providers (OpenAI, Anthropic, Google, xAI), (2) Gives you full ownership and export rights, (3) Uses 9 specialized memory types, (4) Dynamically assembles context per interaction, (5) Has a 6-tier privacy model, and (6) Can be self-hosted.",
      },
      {
        q: "Is VIVIM open source?",
        a: "Yes! VIVIM is licensed under AGPL-3.0 and the source code is available at https://github.com/owenservera/vivim-live. You can audit, modify, and self-host the platform.",
      },
      {
        q: "Can I self-host VIVIM?",
        a: "Absolutely. VIVIM is designed to be self-hostable. You'll need a server with Node.js 18+, Bun, and PostgreSQL with pgvector. See our Getting Started guide for deployment instructions.",
      },
    ],
  },
  {
    category: "Technology",
    icon: Brain,
    questions: [
      {
        q: "What AI providers does VIVIM support?",
        a: "VIVIM currently supports OpenAI (GPT-4, GPT-4o), Anthropic (Claude 3, Claude 3.5), Google (Gemini Pro, Gemini Ultra), and xAI (Grok). You can switch between providers seamlessly — your memory stays intact.",
      },
      {
        q: "What are Atomic Chat Units (ACUs)?",
        a: "ACUs are the fundamental data primitive in VIVIM. They're granular, timestamped memory objects extracted from your conversations. Each ACU contains content, metadata (confidence, source, privacy tier), and a vector embedding for semantic search.",
      },
      {
        q: "How does the 8-Layer Context Engine work?",
        a: "The Context Engine assembles context dynamically for each interaction through 8 layers: L0 (Identity Core), L1 (Preferences), L2 (Topic Context), L3 (Entity Context), L4 (Conversation Arc), L5 (JIT Retrieval), L6 (Message History), and L7 (Your Message). Each layer has a token budget and retrieves relevant memories automatically.",
      },
      {
        q: "What database does VIVIM use?",
        a: "PostgreSQL with the pgvector extension. Vector embeddings enable semantic similarity search across your memories, while relational tables handle structured data like users, conversations, and rights management.",
      },
      {
        q: "Can I bring my own AI model?",
        a: "Yes! VIVIM's architecture is provider-agnostic. If you have a custom model or want to use a local model (like Llama 3 via Ollama), you can integrate it through our API. Contact us for custom integration support.",
      },
    ],
  },
  {
    category: "Privacy & Security",
    icon: Shield,
    questions: [
      {
        q: "Who owns my memory data?",
        a: "You do. VIVIM never claims ownership of your memory data. You can export, delete, or modify it at any time. Our 6-tier Rights Layer (T0-T5) gives you granular control over who can access which memories.",
      },
      {
        q: "Can VIVIM staff read my conversations?",
        a: "No. Your personal memories (T0 tier) are encrypted and strictly isolated to your account. Even VIVIM operators cannot access T0 data without your explicit consent. Only anonymized (T4) or publicly shared (T5) memories leave your control, and you're notified when this happens.",
      },
      {
        q: "What is the Sentinel Detection System?",
        a: "It's a suite of 13 algorithms that continuously monitor for unauthorized access patterns, data leakage, rate limit abuse, and other security threats. When a threat is detected, the system blocks the request, logs the event, and alerts administrators.",
      },
      {
        q: "Is my data encrypted?",
        a: "Yes. All data is encrypted at rest using AES-256 and in transit using TLS 1.3. Each user's data is encrypted with a unique key derived from their user ID and a master key.",
      },
      {
        q: "Can I delete my data permanently?",
        a: "Yes. You can delete individual memories, entire conversations, or your entire account at any time. Deletions are immediate and irreversible. We comply with GDPR's right to erasure.",
      },
    ],
  },
  {
    category: "Pricing & Plans",
    icon: DollarSign,
    questions: [
      {
        q: "Is VIVIM free?",
        a: "VIVIM offers a free tier with limited memory storage and API calls. Paid plans unlock unlimited memory, priority processing, advanced analytics, and team features. See our pricing page for details.",
      },
      {
        q: "What's included in the free tier?",
        a: "The free tier includes: 1,000 ACUs, 50 API calls/day, 1 AI provider, basic memory management, and community support. It's perfect for personal use and testing.",
      },
      {
        q: "Can I use VIVIM for commercial projects?",
        a: "Yes! Our paid plans support commercial use with higher rate limits, team features, priority support, and SLA guarantees. The AGPL-3.0 license also allows commercial self-hosting.",
      },
      {
        q: "Do you offer discounts for nonprofits or education?",
        a: "Yes, we offer discounted pricing for nonprofits, educational institutions, and open-source projects. Contact us at pricing@vivim.live for details.",
      },
    ],
  },
  {
    category: "Integration & Development",
    icon: Code2,
    questions: [
      {
        q: "How do I integrate VIVIM into my app?",
        a: "Use our REST API or upcoming SDK. The API supports memory CRUD operations, context assembly, and chat management. See our API Reference and SDK Guide for detailed documentation.",
      },
      {
        q: "Is there a JavaScript/TypeScript SDK?",
        a: "Yes! Our SDK is available for JavaScript/TypeScript. Install it via npm/bun: `bun add @vivim/sdk`. Python and other language SDKs are in development.",
      },
      {
        q: "Can I use VIVIM with LangChain or LlamaIndex?",
        a: "Yes! VIVIM's API can serve as a memory layer for LangChain, LlamaIndex, or any other AI framework. Use our context assembly endpoint to retrieve memories and inject them into your framework's prompt.",
      },
      {
        q: "How do I contribute to VIVIM?",
        a: "We welcome contributions! Fork the repo at https://github.com/owenservera/vivim-live, create a feature branch, and submit a PR. Check our CONTRIBUTING.md for guidelines.",
      },
      {
        q: "Is there an API rate limit?",
        a: "Yes. Free tier: 50 calls/day. Pro tier: 10,000 calls/day. Enterprise: custom limits. Rate limits are enforced per-user to ensure fair usage.",
      },
    ],
  },
  {
    category: "Performance & Scalability",
    icon: Zap,
    questions: [
      {
        q: "How much memory can VIVIM store?",
        a: "There's no hard limit. VIVIM uses PostgreSQL with efficient indexing and vector search, so it scales to millions of ACUs. Performance depends on your database hardware and configuration.",
      },
      {
        q: "How fast is context retrieval?",
        a: "Context assembly typically takes <100ms for most users. pgvector's similarity search is highly optimized, and our caching layer ensures frequently accessed memories are retrieved instantly.",
      },
      {
        q: "Can VIVIM handle thousands of concurrent users?",
        a: "Yes. The architecture is designed for horizontal scaling. Backend instances can be load-balanced, and PostgreSQL with proper indexing handles high concurrency efficiently.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <article className="prose prose-invert prose-lg max-w-none">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-slate-400">
          <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
          <li>/</li>
          <li className="text-white" aria-current="page">FAQ</li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <HelpCircle className="w-8 h-8 text-violet-400" />
          <h1 className="text-4xl lg:text-5xl font-bold text-white">Frequently Asked Questions</h1>
        </div>
        <p className="text-xl text-slate-300 leading-relaxed">
          Find answers to common questions about VIVIM's technology, pricing, security, and integrations.
        </p>
      </header>

      {/* Quick Links */}
      <section className="mb-12" aria-labelledby="quick-links">
        <h2 id="quick-links" className="text-2xl font-bold text-white mb-6">Quick Links</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: "/docs/getting-started", label: "Getting Started", icon: Code2 },
            { href: "/docs/api-reference", label: "API Reference", icon: Code2 },
            { href: "/docs/memory-system", label: "Memory System", icon: Brain },
            { href: "/docs/privacy-security", label: "Security", icon: Shield },
          ].map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-violet-500/30 transition-colors flex items-center gap-3">
                <Icon className="w-5 h-5 text-violet-400 flex-shrink-0" />
                <span className="text-sm text-slate-300">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* FAQ Sections */}
      {FAQS.map((section) => {
        const SectionIcon = section.icon;
        return (
          <section key={section.category} className="mb-12" aria-labelledby={`faq-${section.category.toLowerCase()}`}>
            <h2 id={`faq-${section.category.toLowerCase()}`} className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <SectionIcon className="w-7 h-7 text-violet-400" />
              {section.category}
            </h2>
            <div className="space-y-6">
              {section.questions.map((faq) => (
                <div key={faq.q} className="p-6 rounded-xl bg-white/5 border border-white/10">
                  <h3 className="text-lg font-semibold text-white mb-3">{faq.q}</h3>
                  <p className="text-slate-300 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* Still Have Questions */}
      <section className="mb-12" aria-labelledby="contact">
        <div className="p-8 rounded-xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 border border-violet-500/20">
          <h2 id="contact" className="text-2xl font-bold text-white mb-4">Still Have Questions?</h2>
          <p className="text-slate-300 leading-relaxed mb-6">
            Can't find what you're looking for? Reach out to our team or explore the documentation.
          </p>
          <div className="flex flex-wrap gap-4">
            <a href="mailto:support@vivim.live" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-white font-medium transition-colors">
              <HelpCircle className="w-5 h-5" />
              <span>Contact Support</span>
            </a>
            <Link href="/docs" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium transition-colors border border-white/10">
              <ArrowRight className="w-5 h-5" />
              <span>Browse Documentation</span>
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
