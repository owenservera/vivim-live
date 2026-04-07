import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Shield,
  Lock,
  Eye,
  Key,
  FileKey,
  Users,
  Code2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy & Security - Zero-Knowledge AI Architecture | VIVIM Documentation",
  description: "Comprehensive overview of VIVIM's security architecture: encryption, data isolation, authentication, access control, audit logging, and zero-knowledge AI memory protection.",
  keywords: [
    "VIVIM security",
    "AI memory encryption",
    "zero-knowledge AI",
    "data isolation",
    "JWT authentication",
    "access control AI",
    "audit logging",
    "AI privacy protection",
    "encryption at rest",
    "encryption in transit",
    "security architecture",
    "AI data protection",
  ],
  alternates: {
    canonical: "https://vivim.live/docs/privacy-security",
  },
};

export default function PrivacySecurityPage() {
  return (
    <article className="prose prose-invert prose-lg max-w-none">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex items-center gap-2 text-sm text-slate-400">
          <li>
            <Link href="/docs" className="hover:text-white transition-colors">
              Documentation
            </Link>
          </li>
          <li>/</li>
          <li className="text-white" aria-current="page">
            Privacy & Security
          </li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="w-8 h-8 text-violet-400" />
          <h1 className="text-4xl lg:text-5xl font-bold text-white">
            Privacy & Security
          </h1>
        </div>
        <p className="text-xl text-slate-300 leading-relaxed">
          VIVIM's security architecture ensures your AI memory remains private, encrypted, and under your control at all times with zero-knowledge protection.
        </p>
      </header>

      {/* Security Overview */}
      <section className="mb-12" aria-labelledby="security-overview">
        <h2 id="security-overview" className="text-2xl font-bold text-white mb-6">
          Security Architecture Overview
        </h2>
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            Security isn't an afterthought at VIVIM — it's foundational. From the ground up, VIVIM is designed with a <strong className="text-white">zero-knowledge architecture</strong> where possible, ensuring that even the platform operators cannot access your personal memory data without explicit consent.
          </p>
          <p>
            The security model is built on five pillars:
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {[
            {
              icon: Lock,
              title: "Encryption",
              description: "AES-256 encryption at rest, TLS 1.3 in transit",
              color: "from-violet-500 to-purple-600",
            },
            {
              icon: Users,
              title: "Data Isolation",
              description: "Strict user-level and tenant-level isolation",
              color: "from-cyan-500 to-blue-600",
            },
            {
              icon: Key,
              title: "Authentication",
              description: "JWT-based auth with shared package integration",
              color: "from-emerald-500 to-teal-600",
            },
            {
              icon: FileKey,
              title: "Access Control",
              description: "6-tier rights layer with granular permissions",
              color: "from-amber-500 to-orange-600",
            },
            {
              icon: Eye,
              title: "Audit Logging",
              description: "Immutable logs for all data access events",
              color: "from-rose-500 to-pink-600",
            },
            {
              icon: Shield,
              title: "Sentinel Detection",
              description: "13 algorithms preventing unauthorized usage",
              color: "from-fuchsia-500 to-pink-600",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.title} className="p-6 rounded-xl bg-white/5 border border-white/10">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${item.color} mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-slate-400">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Encryption */}
      <section className="mb-12" aria-labelledby="encryption">
        <h2 id="encryption" className="text-2xl font-bold text-white mb-6">
          Encryption
        </h2>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Encryption at Rest</h3>
            <p className="text-slate-300 leading-relaxed mb-4">
              All memory data stored in PostgreSQL is encrypted using <strong className="text-white">AES-256 encryption</strong>. This includes:
            </p>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">ACU Content:</strong> All memory content encrypted with per-user encryption keys</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Vector Embeddings:</strong> pgvector embeddings encrypted at rest</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Metadata:</strong> All metadata fields encrypted, including tags and confidence scores</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">User Credentials:</strong> Passwords hashed with bcrypt, API keys encrypted</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">Encryption in Transit</h3>
            <p className="text-slate-300 leading-relaxed mb-4">
              All data transmitted between client and server is protected with <strong className="text-white">TLS 1.3</strong>:
            </p>
            <ul className="space-y-2 text-slate-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">HTTPS Only:</strong> All API endpoints require HTTPS with HSTS headers</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">WebSocket Security:</strong> Socket.io connections use WSS (WebSocket Secure)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Certificate Pinning:</strong> Production deployments use certificate pinning for mobile clients</span>
              </li>
            </ul>
          </div>

          <div className="p-5 rounded-lg bg-slate-900/30 border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-2">Key Management</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Encryption keys are managed through environment variables and rotated regularly. In production, keys should be stored in a dedicated secrets manager (AWS Secrets Manager, HashiCorp Vault, etc.). Each user's data is encrypted with a unique key derived from their user ID and a master key, ensuring that even if one key is compromised, other users' data remains secure.
            </p>
          </div>
        </div>
      </section>

      {/* Data Isolation */}
      <section className="mb-12" aria-labelledby="data-isolation">
        <h2 id="data-isolation" className="text-2xl font-bold text-white mb-6">
          Data Isolation
        </h2>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <p className="text-slate-300 leading-relaxed">
            VIVIM implements <strong className="text-white">strict multi-tenant isolation</strong> at every layer of the stack:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
              <h3 className="text-lg font-semibold text-emerald-300 mb-3">Database Level</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Every query scoped to userId automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Row-level security policies in PostgreSQL</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>No cross-user queries possible without explicit share (T1)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-emerald-400 mt-1">•</span>
                  <span>Separate schema for system vs user data</span>
                </li>
              </ul>
            </div>
            <div className="p-5 rounded-lg bg-cyan-500/5 border border-cyan-500/20">
              <h3 className="text-lg font-semibold text-cyan-300 mb-3">Application Level</h3>
              <ul className="space-y-2 text-sm text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>Middleware enforces user context on every request</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>Shared package validates tenant identity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>API routes reject requests with mismatched userId</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>Rate limiting applied per-user to prevent abuse</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Authentication & Authorization */}
      <section className="mb-12" aria-labelledby="auth">
        <h2 id="auth" className="text-2xl font-bold text-white mb-6">
          Authentication & Authorization
        </h2>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-3">JWT Authentication</h3>
            <p className="text-slate-300 leading-relaxed mb-4">
              VIVIM uses <strong className="text-white">JSON Web Tokens (JWT)</strong> for authentication, managed through the shared package that both frontend and backend use. The authentication flow:
            </p>
            <ol className="space-y-3 text-slate-300 list-decimal list-inside">
              <li><strong className="text-white">User signs in</strong> through frontend (email/password, OAuth, or API key)</li>
              <li><strong className="text-white">Backend validates credentials</strong> and issues JWT with userId, rights, and expiration</li>
              <li><strong className="text-white">Token stored securely</strong> in httpOnly cookies (web) or secure storage (mobile)</li>
              <li><strong className="text-white">Every API request</strong> includes token in Authorization header</li>
              <li><strong className="text-white">Middleware validates token</strong> and extracts userId before route handler executes</li>
            </ol>
          </div>

          <div className="p-5 rounded-lg bg-slate-900/30 border border-white/5">
            <h3 className="text-sm font-semibold text-white mb-2">JWT Payload Structure</h3>
            <pre className="text-xs text-slate-300 font-mono overflow-x-auto">
{`{
  "userId": "user_a1b2c3d4",
  "email": "user@example.com",
  "rights": ["memory:read", "memory:write", "chat:create"],
  "iat": 1712500000,
  "exp": 1712586400,
  "iss": "vivim-live"
}`}
            </pre>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-3">API Key Authentication</h3>
            <p className="text-slate-300 leading-relaxed">
              For programmatic access, VIVIM supports API keys with granular permissions. API keys can be:
            </p>
            <ul className="space-y-2 text-slate-300 mt-3">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Scoped:</strong> Limited to specific endpoints (read-only, memory-only, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Time-bound:</strong> Expiration dates enforce temporary access</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span><strong className="text-white">Revocable:</strong> Instantly revoke any API key without affecting others</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Access Control & Audit */}
      <section className="mb-12" aria-labelledby="access-control">
        <h2 id="access-control" className="text-2xl font-bold text-white mb-6">
          Access Control & Audit Logging
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <FileKey className="w-5 h-5 text-violet-400" />
              Access Control
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              VIVIM's access control is governed by the <Link href="/docs/rights-layer" className="text-violet-400 hover:text-violet-300">6-tier Rights Layer</Link>, ensuring you control who sees what:
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-1">•</span>
                <span>Every ACU tagged with rights tier (T0-T5)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-1">•</span>
                <span>Context assembly filters by tier and requester</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-1">•</span>
                <span>Explicit shares (T1) are time-bound and revocable</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-1">•</span>
                <span>Trusted circles (T2) require mutual approval</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-violet-400 mt-1">•</span>
                <span>Anonymization pipeline for T4 data</span>
              </li>
            </ul>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-cyan-400" />
              Audit Logging
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">
              All data access events are logged to an <strong className="text-white">immutable audit trail</strong>:
            </p>
            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Who accessed what data and when</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Which rights tier was applied</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Purpose of access (context assembly, share, etc.)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Logs are append-only and cryptographically signed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-400 mt-1">•</span>
                <span>Users can view their own audit trail</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Sentinel Detection */}
      <section className="mb-12" aria-labelledby="sentinel">
        <h2 id="sentinel" className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Shield className="w-7 h-7 text-violet-400" />
          Sentinel Detection System
        </h2>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <p className="text-slate-300 leading-relaxed">
            VIVIM's <strong className="text-white">Sentinel Detection System</strong> employs 13 algorithms to detect and prevent unauthorized usage of your memory data. This system continuously monitors for:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "Unauthorized API access attempts",
              "Cross-user data leakage patterns",
              "Anomalous query behavior",
              "Rights tier violations",
              "Rate limit abuse",
              "Token manipulation attempts",
              "Session hijacking detection",
              "Data exfiltration patterns",
              "Brute force authentication attacks",
              "Replay attack detection",
              "Privilege escalation attempts",
              "Suspicious share patterns",
              "Automated scraping detection",
            ].map((item) => (
              <div key={item} className="flex items-start gap-2 p-3 rounded-lg bg-slate-900/30 border border-white/5">
                <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-300">{item}</span>
              </div>
            ))}
          </div>
          <p className="text-slate-300 leading-relaxed mt-4">
            When a sentinel detects a threat, it triggers immediate response: blocking the request, logging the event, notifying administrators, and in severe cases, temporarily suspending access while the threat is investigated.
          </p>
          <Link
            href="/docs/sentinel-detection"
            className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 transition-colors"
          >
            <span>Learn more about Sentinel Detection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Compliance */}
      <section className="mb-12" aria-labelledby="compliance">
        <h2 id="compliance" className="text-2xl font-bold text-white mb-6">
          Compliance & Regulatory Considerations
        </h2>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <p className="text-slate-300 leading-relaxed">
            VIVIM is designed to help users and organizations meet regulatory requirements for data privacy and protection:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: "GDPR",
                description: "Right to access, rectify, and erase personal data. Data portability through export functionality.",
              },
              {
                name: "CCPA",
                description: "Right to know what personal information is collected and how it's used. Right to deletion.",
              },
              {
                name: "HIPAA",
                description: "Healthcare data handled with appropriate safeguards. T5 tier enables regulated disclosure.",
              },
            ].map((reg) => (
              <div key={reg.name} className="p-4 rounded-lg bg-white/5 border border-white/5">
                <h4 className="text-sm font-semibold text-white mb-2">{reg.name}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{reg.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Best Practices */}
      <section className="mb-12" aria-labelledby="best-practices">
        <h2 id="best-practices" className="text-2xl font-bold text-white mb-6">
          Security Best Practices for Users
        </h2>
        <div className="p-6 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-4">
          <ol className="space-y-3 text-slate-300 list-decimal list-inside">
            <li><strong className="text-white">Use strong, unique passwords</strong> and enable two-factor authentication when available</li>
            <li><strong className="text-white">Review your rights tiers regularly</strong> — ensure memories are at appropriate privacy levels</li>
            <li><strong className="text-white">Audit your trusted circles</strong> — remove connections you no longer trust</li>
            <li><strong className="text-white">Rotate API keys</strong> periodically and revoke unused keys immediately</li>
            <li><strong className="text-white">Monitor your audit trail</strong> — review access logs for suspicious activity</li>
            <li><strong className="text-white">Export your data regularly</strong> — maintain your own backup of your memory</li>
            <li><strong className="text-white">Report vulnerabilities</strong> — use our responsible disclosure process</li>
          </ol>
        </div>
      </section>

      {/* Incident Response */}
      <section className="mb-12" aria-labelledby="incident-response">
        <h2 id="incident-response" className="text-2xl font-bold text-white mb-6">
          Incident Response & Vulnerability Disclosure
        </h2>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <p className="text-slate-300 leading-relaxed">
            If you discover a security vulnerability in VIVIM, we encourage <strong className="text-white">responsible disclosure</strong>:
          </p>
          <ul className="space-y-2 text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-violet-400 mt-1">•</span>
              <span><strong className="text-white">Email:</strong> security@vivim.live</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400 mt-1">•</span>
              <span><strong className="text-white">Response Time:</strong> We acknowledge reports within 48 hours</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400 mt-1">•</span>
              <span><strong className="text-white">Resolution:</strong> Critical vulnerabilities patched within 7 days</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-violet-400 mt-1">•</span>
              <span><strong className="text-white">Notification:</strong> Affected users notified within 72 hours of confirmed breach</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Next Steps */}
      <section className="mb-12" aria-labelledby="next-steps">
        <h2 id="next-steps" className="text-2xl font-bold text-white mb-6">
          Next Steps
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              href: "/docs/sentinel-detection",
              title: "Sentinel Detection",
              description: "Deep dive into the 13 algorithms that protect your data from unauthorized usage.",
              icon: Shield,
              color: "from-amber-500/10 to-orange-500/10 border-amber-500/20",
            },
            {
              href: "/docs/rights-layer",
              title: "Rights Layer",
              description: "Understand the 6-tier ownership model in detail.",
              icon: Key,
              color: "from-indigo-500/10 to-blue-500/10 border-indigo-500/20",
            },
            {
              href: "/docs/architecture",
              title: "System Architecture",
              description: "Explore the technical architecture that underpins our security model.",
              icon: Code2,
              color: "from-emerald-500/10 to-teal-500/10 border-emerald-500/20",
            },
            {
              href: "/docs/api-reference",
              title: "API Reference",
              description: "Learn about secure API authentication and authorization endpoints.",
              icon: Lock,
              color: "from-sky-500/10 to-cyan-500/10 border-sky-500/20",
            },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className={`group block p-6 rounded-xl bg-gradient-to-br ${card.color} border transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-violet-500/10`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/5 flex-shrink-0">
                    <Icon className="w-6 h-6 text-violet-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-violet-300 transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-sm text-slate-300 leading-relaxed mb-3">
                      {card.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-violet-400 group-hover:text-violet-300 transition-colors">
                      <span>Read more</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
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
