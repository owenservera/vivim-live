import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ShoppingCart, DollarSign, Shield, Eye, Zap, Star, Code2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Memory Marketplace - Zero-Knowledge Intelligence Exchange | VIVIM Documentation",
  description: "Learn about VIVIM's zero-knowledge proof-based memory marketplace where users can monetize AI memory patterns while maintaining complete privacy through anonymization and escrow.",
  keywords: [
    "memory marketplace",
    "AI intelligence marketplace",
    "zero-knowledge proofs",
    "sell AI memory",
    "buy AI context",
    "privacy-preserving marketplace",
    "escrow system",
    "anonymized data",
    "memory patterns",
  ],
  alternates: { canonical: "https://vivim.live/docs/marketplace" },
};

export default function MarketplacePage() {
  return (
    <article className="prose prose-invert prose-lg max-w-none">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-slate-400">
          <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
          <li>/</li>
          <li className="text-white" aria-current="page">Memory Marketplace</li>
        </ol>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <ShoppingCart className="w-8 h-8 text-violet-400" />
          <h1 className="text-4xl lg:text-5xl font-bold text-white">Memory Marketplace</h1>
        </div>
        <p className="text-xl text-slate-300 leading-relaxed">
          VIVIM's zero-knowledge proof-based intelligence marketplace where users can monetize their AI memory patterns while maintaining complete privacy.
        </p>
      </header>

      <section className="mb-12" aria-labelledby="overview">
        <h2 id="overview" className="text-2xl font-bold text-white mb-6">What is the Memory Marketplace?</h2>
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>The <strong className="text-white">Memory Marketplace</strong> is a unique feature of VIVIM that allows users to buy and sell anonymized memory patterns, context templates, and AI intelligence packages. It creates an economy where valuable AI context can be shared without compromising personal privacy.</p>
          <p>Using <strong className="text-white">zero-knowledge proofs (ZKPs)</strong>, sellers can prove their memory patterns are valuable and accurate without revealing the underlying personal data. Buyers receive functional context packages that enhance their AI interactions while sellers earn compensation for their contributions.</p>
          <div className="p-6 rounded-xl bg-violet-500/5 border border-violet-500/20 my-6">
            <h3 className="text-lg font-semibold text-violet-300 mb-3">Example Use Cases</h3>
            <ul className="space-y-2 text-slate-300">
              <li>• A senior developer sells their <strong className="text-white">React architecture decision-making context</strong> accumulated over years of projects</li>
              <li>• A medical researcher shares <strong className="text-white">domain-specific knowledge patterns</strong> stripped of patient data</li>
              <li>• A project manager offers <strong className="text-white">agile methodology context templates</strong> for AI assistants</li>
              <li>• A language tutor sells <strong className="text-white">language learning progression patterns</strong> for AI tutors</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="mb-12" aria-labelledby="how-it-works">
        <h2 id="how-it-works" className="text-2xl font-bold text-white mb-6">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-emerald-400" />For Sellers</h3>
            <ol className="space-y-3 text-sm text-slate-300 list-decimal list-inside">
              <li><strong className="text-white">Package your memory:</strong> Select T4 (Anonymized) memories that would be valuable to others</li>
              <li><strong className="text-white">Generate ZK proof:</strong> System creates proof that patterns are valid without revealing personal data</li>
              <li><strong className="text-white">Set price:</strong> Choose your price in credits or cryptocurrency</li>
              <li><strong className="text-white">List on marketplace:</strong> Your package appears in browseable catalog with anonymized preview</li>
              <li><strong className="text-white">Earn on sale:</strong> When purchased, funds go to escrow, then to your account after review period</li>
            </ol>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><ShoppingCart className="w-5 h-5 text-cyan-400" />For Buyers</h3>
            <ol className="space-y-3 text-sm text-slate-300 list-decimal list-inside">
              <li><strong className="text-white">Browse marketplace:</strong> Explore categorized memory packages with ZK-verified quality scores</li>
              <li><strong className="text-white">Preview anonymized sample:</strong> See structure and quality without personal data</li>
              <li><strong className="text-white">Purchase with escrow:</strong> Payment held in escrow during review period</li>
              <li><strong className="text-white">Install to your memory:</strong> Package integrates with your existing context engine</li>
              <li><strong className="text-white">Rate & review:</strong> Confirm quality, release escrow payment to seller</li>
            </ol>
          </div>
        </div>
      </section>

      <section className="mb-12" aria-labelledby="privacy">
        <h2 id="privacy" className="text-2xl font-bold text-white mb-6">Privacy Preservation</h2>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <p className="text-slate-300 leading-relaxed">The marketplace maintains privacy through multiple layers:</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <h4 className="text-sm font-semibold text-emerald-300 mb-2 flex items-center gap-2"><Shield className="w-4 h-4" />T4 Anonymization</h4>
              <p className="text-xs text-slate-400">All personal identifiers removed through automated PII detection pipeline before listing</p>
            </div>
            <div className="p-4 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
              <h4 className="text-sm font-semibold text-cyan-300 mb-2 flex items-center gap-2"><Eye className="w-4 h-4" />Zero-Knowledge Proofs</h4>
              <p className="text-xs text-slate-400">Sellers prove data quality and validity without revealing underlying personal information</p>
            </div>
            <div className="p-4 rounded-lg bg-violet-500/5 border border-violet-500/20">
              <h4 className="text-sm font-semibold text-violet-300 mb-2 flex items-center gap-2"><DollarSign className="w-4 h-4" />Escrow Protection</h4>
              <p className="text-xs text-slate-400">Buyer funds held in escrow during review period, ensuring quality before payment release</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12" aria-labelledby="quality">
        <h2 id="quality" className="text-2xl font-bold text-white mb-6">Quality & Ratings</h2>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <p className="text-slate-300 leading-relaxed">Marketplace quality is maintained through:</p>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2"><Star className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" /><span><strong className="text-white">ZK Verification:</strong> Automated proof validation ensures memory patterns are genuine and valuable</span></li>
            <li className="flex items-start gap-2"><Star className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" /><span><strong className="text-white">Community Ratings:</strong> Buyers rate packages 1-5 stars, affecting seller reputation and visibility</span></li>
            <li className="flex items-start gap-2"><Star className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" /><span><strong className="text-white">Review Period:</strong> 7-day window for buyers to evaluate before escrow payment releases</span></li>
            <li className="flex items-start gap-2"><Star className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" /><span><strong className="text-white">Dispute Resolution:</strong> VIVIM mediates disputes with anonymized data review</span></li>
          </ul>
        </div>
      </section>

      <section className="mb-12" aria-labelledby="next-steps">
        <h2 id="next-steps" className="text-2xl font-bold text-white mb-6">Next Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { href: "/docs/rights-layer", title: "Rights Layer", desc: "Understand T4 anonymization tier", icon: Shield, color: "from-indigo-500/10 to-blue-500/10 border-indigo-500/20" },
            { href: "/docs/privacy-security", title: "Privacy & Security", desc: "How privacy is maintained", icon: Eye, color: "from-fuchsia-500/10 to-pink-500/10 border-fuchsia-500/20" },
            { href: "/docs/api-reference", title: "API Reference", desc: "Marketplace API endpoints", icon: Code2, color: "from-sky-500/10 to-cyan-500/10 border-sky-500/20" },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href} className={`group block p-6 rounded-xl bg-gradient-to-br ${card.color} border transition-all hover:scale-[1.02]`}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/5 flex-shrink-0"><Icon className="w-6 h-6 text-violet-400" /></div>
                  <div><h3 className="text-lg font-semibold text-white mb-2">{card.title}</h3><p className="text-sm text-slate-300">{card.desc}</p>
                    <div className="flex items-center gap-2 text-sm text-violet-400 mt-2"><span>Read more</span><ArrowRight className="w-4 h-4" /></div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </article>
  );
}
