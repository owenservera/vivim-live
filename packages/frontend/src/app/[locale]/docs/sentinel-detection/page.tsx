import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Shield, AlertTriangle, Eye, Lock, Radar, ScanEye, Code2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Sentinel Detection System - 13 Security Algorithms | VIVIM Documentation",
  description: "Deep dive into VIVIM's 13-algorithm sentinel detection system that protects AI memory from unauthorized access, data leakage, and security threats.",
  keywords: [
    "sentinel detection",
    "AI security algorithms",
    "unauthorized access detection",
    "data leakage prevention",
    "rate limit abuse",
    "session hijacking detection",
    "brute force protection",
    "AI memory security",
    "threat detection",
    "security monitoring",
  ],
  alternates: { canonical: "https://vivim.live/docs/sentinel-detection" },
};

const ALGORITHMS = [
  { id: 1, name: "Unauthorized API Access", icon: Lock, severity: "Critical", description: "Detects API calls without valid authentication tokens or with expired/revoked credentials." },
  { id: 2, name: "Cross-User Data Leakage", icon: Eye, severity: "Critical", description: "Monitors for patterns where one user's data appears in another user's context without proper rights tier authorization." },
  { id: 3, name: "Anomalous Query Patterns", icon: Radar, severity: "High", description: "Identifies unusual query patterns that suggest automated scraping or systematic data extraction attempts." },
  { id: 4, name: "Rights Tier Violations", icon: Shield, severity: "Critical", description: "Detects attempts to access memories above the requester's authorized rights tier (T0-T5 violations)." },
  { id: 5, name: "Rate Limit Abuse", icon: AlertTriangle, severity: "Medium", description: "Monitors for sustained attempts to exceed rate limits, indicating potential abuse or automated attacks." },
  { id: 6, name: "Token Manipulation", icon: Lock, severity: "High", description: "Detects forged, tampered, or replayed JWT tokens through signature validation and timestamp checks." },
  { id: 7, name: "Session Hijacking", icon: Eye, severity: "Critical", description: "Identifies session takeover attempts through IP changes, device fingerprint mismatches, or concurrent session anomalies." },
  { id: 8, name: "Data Exfiltration", icon: ScanEye, severity: "Critical", description: "Detects bulk data download patterns, unusual export requests, or systematic memory retrieval suggesting theft." },
  { id: 9, name: "Brute Force Authentication", icon: AlertTriangle, severity: "High", description: "Monitors for repeated failed login attempts, credential stuffing, and password guessing attacks." },
  { id: 10, name: "Replay Attack Detection", icon: Radar, severity: "High", description: "Identifies replayed API requests through nonce tracking, timestamp validation, and request signature analysis." },
  { id: 11, name: "Privilege Escalation", icon: Shield, severity: "Critical", description: "Detects attempts to gain elevated permissions, modify rights tiers, or access admin endpoints without authorization." },
  { id: 12, name: "Suspicious Share Patterns", icon: Eye, severity: "Medium", description: "Monitors for unusual memory sharing patterns that might indicate social engineering or unauthorized data distribution." },
  { id: 13, name: "Automated Scraping", icon: ScanEye, severity: "Medium", description: "Detects bot-like behavior: uniform request intervals, sequential ID enumeration, or pattern-based data extraction." },
];

export default function SentinelDetectionPage() {
  return (
    <article className="prose prose-invert prose-lg max-w-none">
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-slate-400">
          <li><Link href="/docs" className="hover:text-white transition-colors">Documentation</Link></li>
          <li>/</li>
          <li className="text-white" aria-current="page">Sentinel Detection</li>
        </ol>
      </nav>

      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-violet-400" />
          <h1 className="text-4xl lg:text-5xl font-bold text-white">Sentinel Detection System</h1>
        </div>
        <p className="text-xl text-slate-300 leading-relaxed">
          VIVIM's 13-algorithm security system that continuously monitors, detects, and responds to threats against your AI memory data.
        </p>
      </header>

      <section className="mb-12" aria-labelledby="overview">
        <h2 id="overview" className="text-2xl font-bold text-white mb-6">Overview</h2>
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>The <strong className="text-white">Sentinel Detection System</strong> is VIVIM's proactive security layer that employs 13 specialized algorithms to identify and prevent unauthorized access, data leakage, and abuse. Operating in real-time, sentinels analyze every API request, context assembly, and memory access event.</p>
          <p>When a sentinel detects a threat, it triggers an automated response: <strong className="text-white">blocking the request</strong>, <strong className="text-white">logging the event</strong>, <strong className="text-white">notifying administrators</strong>, and in severe cases, <strong className="text-white">temporarily suspending access</strong> while the threat is investigated.</p>
        </div>
      </section>

      <section className="mb-12" aria-labelledby="algorithms">
        <h2 id="algorithms" className="text-2xl font-bold text-white mb-6">The 13 Sentinel Algorithms</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-slate-300">#</th>
                <th className="text-left py-3 px-4 text-slate-300">Algorithm</th>
                <th className="text-left py-3 px-4 text-slate-300">Severity</th>
                <th className="text-left py-3 px-4 text-slate-300">Description</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {ALGORITHMS.map((algo) => {
                const Icon = algo.icon;
                const severityColor = algo.severity === "Critical" ? "text-red-400 bg-red-500/10" : algo.severity === "High" ? "text-amber-400 bg-amber-500/10" : "text-yellow-400 bg-yellow-500/10";
                return (
                  <tr key={algo.id} className="border-b border-white/5">
                    <td className="py-3 px-4 font-mono text-violet-400">{algo.id}</td>
                    <td className="py-3 px-4 font-medium text-white flex items-center gap-2"><Icon className="w-4 h-4" />{algo.name}</td>
                    <td className="py-3 px-4"><span className={`px-2 py-1 rounded text-xs font-semibold ${severityColor}`}>{algo.severity}</span></td>
                    <td className="py-3 px-4 text-xs text-slate-400">{algo.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mb-12" aria-labelledby="detection-process">
        <h2 id="detection-process" className="text-2xl font-bold text-white mb-6">Detection & Response Process</h2>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <ol className="space-y-4 text-slate-300 list-decimal list-inside">
            <li><strong className="text-white">Monitor:</strong> Every API request and memory access is analyzed in real-time by all 13 algorithms</li>
            <li><strong className="text-white">Score:</strong> Each algorithm assigns a risk score (0-100) based on detected patterns</li>
            <li><strong className="text-white">Threshold:</strong> If combined score exceeds the threshold (default: 75), threat is flagged</li>
            <li><strong className="text-white">Block:</strong> Request is immediately blocked for Critical/High severity threats</li>
            <li><strong className="text-white">Log:</strong> Event is recorded in immutable audit trail with full context</li>
            <li><strong className="text-white">Notify:</strong> User and/or administrators are alerted via email, webhook, or dashboard</li>
            <li><strong className="text-white">Respond:</strong> Automated actions (IP ban, account suspension) or manual review based on severity</li>
          </ol>
        </div>
      </section>

      <section className="mb-12" aria-labelledby="next-steps">
        <h2 id="next-steps" className="text-2xl font-bold text-white mb-6">Next Steps</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { href: "/docs/privacy-security", title: "Privacy & Security", desc: "Full security architecture overview", icon: Shield, color: "from-fuchsia-500/10 to-pink-500/10 border-fuchsia-500/20" },
            { href: "/docs/rights-layer", title: "Rights Layer", desc: "6-tier ownership model", icon: Lock, color: "from-indigo-500/10 to-blue-500/10 border-indigo-500/20" },
            { href: "/docs/architecture", title: "Architecture", desc: "System design and infrastructure", icon: Code2, color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20" },
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
