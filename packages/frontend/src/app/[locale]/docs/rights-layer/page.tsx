import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Key,
  Shield,
  Users,
  Eye,
  Lock,
  Globe,
  FileKey,
  Scale,
  Code2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Rights Layer - 6-Tier AI Data Ownership Model | VIVIM Documentation",
  description: "Understand VIVIM's 6-tier ownership model (T0-T5) that governs AI memory data visibility and sharing, from personal-only privacy to regulated public disclosure.",
  keywords: [
    "rights layer",
    "data ownership AI",
    "AI privacy tiers",
    "memory visibility",
    "data sharing control",
    "T0 personal only",
    "T5 regulated public",
    "AI data sovereignty",
    "user data control",
    "privacy model AI",
  ],
  alternates: {
    canonical: "https://vivim.live/docs/rights-layer",
  },
};

const TIERS = [
  {
    tier: "T0",
    name: "Personal Only",
    icon: Lock,
    color: "from-red-500 to-rose-600",
    description: "Visible only to you — complete privacy",
    details: "Your memory data is strictly private and accessible only by you. No other user, application, or system component can view or use this data without your explicit action.",
    useCases: [
      "Personal conversations and reflections",
      "Sensitive biographical information",
      "Private goals and aspirations",
      "Confidential project details",
    ],
    technicalImplementation: "Strict user-scoped database queries with encryption at rest. No API endpoint exposes T0 data to other users.",
  },
  {
    tier: "T1",
    name: "Explicit Share",
    icon: FileKey,
    color: "from-orange-500 to-amber-600",
    description: "You choose specific recipients",
    details: "You manually select which memories to share and with whom. Each share action creates a time-bound, revocable grant of access to specific users or AI sessions.",
    useCases: [
      "Sharing project context with team members",
      "Providing background to a new AI assistant",
      "Collaborative problem-solving sessions",
      "Handing off work to colleagues",
    ],
    technicalImplementation: "Access control list (ACL) entries with expiry dates, revocation endpoints, and audit logging of all access events.",
  },
  {
    tier: "T2",
    name: "Trusted Circle",
    icon: Users,
    color: "from-yellow-500 to-lime-600",
    description: "Shared with approved connections",
    details: "Memories are accessible to users you've approved as trusted connections. You maintain a circle of trusted users who can access T2-tier memories by default.",
    useCases: [
      "Team-wide knowledge sharing",
      "Mentor-mentee relationship context",
      "Family or close friend shared memory",
      "Professional network context",
    ],
    technicalImplementation: "Graph database of trusted connections with mutual approval requirement. Circle members query T2 memories through filtered endpoints.",
  },
  {
    tier: "T3",
    name: "Community",
    icon: Globe,
    color: "from-emerald-500 to-teal-600",
    description: "Visible within defined communities",
    details: "Memories are visible to members of communities you've joined. Communities have their own governance rules, but you retain the ability to withdraw at any time.",
    useCases: [
      "Open-source project contributions",
      "Professional community knowledge",
      "Industry-specific insights",
      "Best practices and patterns",
    ],
    technicalImplementation: "Community-scoped memory tables with membership verification. Queries filtered by community membership and individual privacy overrides.",
  },
  {
    tier: "T4",
    name: "Anonymized",
    icon: Eye,
    color: "from-cyan-500 to-blue-600",
    description: "Stripped of PII, used for improvements",
    details: "Your memories are anonymized — all personally identifiable information (PII) is removed — and used to improve VIVIM's algorithms, train models, or provide aggregate insights.",
    useCases: [
      "Algorithm improvement and training",
      "Aggregate usage analytics",
      "Research and academic studies",
      "Product feature development",
    ],
    technicalImplementation: "Automated PII detection and removal pipeline. k-anonymity thresholds ensure no individual can be re-identified from anonymized datasets.",
  },
  {
    tier: "T5",
    name: "Regulated Public",
    icon: Scale,
    color: "from-indigo-500 to-violet-600",
    description: "Subject to regulatory disclosure",
    details: "Memories that may be subject to regulatory requirements, legal holds, or public disclosure mandates. You're notified before any T5 disclosure occurs.",
    useCases: [
      "Regulatory compliance documentation",
      "Legal discovery responses",
      "Public transparency reports",
      "Audit trail preservation",
    ],
    technicalImplementation: "Legal hold flags with disclosure logging. User notification system with grace periods. Immutable audit trail for all T5 access.",
  },
];

export default function RightsLayerPage() {
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
            Rights Layer
          </li>
        </ol>
      </nav>

      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Key className="w-8 h-8 text-violet-400" />
          <h1 className="text-4xl lg:text-5xl font-bold text-white">
            Rights Layer
          </h1>
        </div>
        <p className="text-xl text-slate-300 leading-relaxed">
          VIVIM's 6-tier ownership model (T0-T5) governs data visibility and sharing, ensuring you maintain complete control over your AI memory at all times.
        </p>
      </header>

      {/* Overview */}
      <section className="mb-12" aria-labelledby="overview-heading">
        <h2 id="overview-heading" className="text-2xl font-bold text-white mb-6">
          Overview
        </h2>
        <div className="space-y-4 text-slate-300 leading-relaxed">
          <p>
            Most AI platforms make a binary choice: your data is either completely private (and useless for collaboration) or shared with the platform (and out of your control). <strong className="text-white">VIVIM's Rights Layer</strong> introduces a nuanced, 6-tier model that gives you granular control over who can access which memories and under what conditions.
          </p>
          <p>
            Every piece of memory in VIVIM — every ACU — is tagged with a rights tier (T0-T5). When context is assembled for an AI interaction, the Rights Layer filters memories based on who's asking, why they're asking, and what you've allowed. This ensures <strong className="text-white">appropriate visibility without sacrificing privacy</strong>.
          </p>

          <div className="p-6 rounded-xl bg-violet-500/5 border border-violet-500/20 my-8">
            <h3 className="text-lg font-semibold text-violet-300 mb-3">Why 6 Tiers?</h3>
            <p className="text-slate-300 leading-relaxed">
              Not all information deserves the same level of privacy. Your <strong className="text-white">deepest personal reflections</strong> (T0) should never leave your control, while <strong className="text-white">professional best practices</strong> (T3) might benefit your entire community. The 6 tiers let you calibrate visibility precisely, rather than forcing an all-or-nothing choice.
            </p>
          </div>
        </div>
      </section>

      {/* Tier Overview Table */}
      <section className="mb-12" aria-labelledby="tier-overview">
        <h2 id="tier-overview" className="text-2xl font-bold text-white mb-6">
          Tier Overview
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-slate-300 font-semibold">Tier</th>
                <th className="text-left py-3 px-4 text-slate-300 font-semibold">Name</th>
                <th className="text-left py-3 px-4 text-slate-300 font-semibold">Visibility</th>
                <th className="text-left py-3 px-4 text-slate-300 font-semibold">Control</th>
              </tr>
            </thead>
            <tbody className="text-slate-300">
              {TIERS.map((item) => (
                <tr key={item.tier} className="border-b border-white/5">
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded bg-gradient-to-r ${item.color} text-white text-xs font-mono font-bold`}>
                      {item.tier}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-white">{item.name}</td>
                  <td className="py-3 px-4">{item.description}</td>
                  <td className="py-3 px-4 text-xs">{item.tier === "T0" ? "You only" : item.tier === "T5" ? "Regulatory" : "User-managed"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Detailed Tier Breakdown */}
      {TIERS.map((tier) => {
        const Icon = tier.icon;
        return (
          <section key={tier.tier} className="mb-12" aria-labelledby={`tier-${tier.tier}`}>
            <h2 id={`tier-${tier.tier}`} className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br ${tier.color}`}>
                <Icon className="w-6 h-6 text-white" />
              </div>
              <span className={`px-3 py-1 rounded bg-gradient-to-r ${tier.color} text-white text-sm font-mono font-bold`}>
                {tier.tier}
              </span>
              {tier.name}
            </h2>

            <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                <p className="text-slate-300 leading-relaxed">{tier.details}</p>
              </div>

              {/* Use Cases */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Common Use Cases</h3>
                <ul className="space-y-2 text-slate-300">
                  {tier.useCases.map((useCase) => (
                    <li key={useCase} className="flex items-start gap-2">
                      <span className="text-violet-400 mt-1">•</span>
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Technical Implementation */}
              <div className="p-5 rounded-lg bg-slate-900/30 border border-white/5">
                <h3 className="text-sm font-semibold text-white mb-2">Technical Implementation</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{tier.technicalImplementation}</p>
              </div>
            </div>
          </section>
        );
      })}

      {/* Rights Layer in Action */}
      <section className="mb-12" aria-labelledby="rights-in-action">
        <h2 id="rights-in-action" className="text-2xl font-bold text-white mb-6">
          Rights Layer in Action
        </h2>
        <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-4">
          <p className="text-slate-300 leading-relaxed">
            Here's how the Rights Layer works during a typical AI interaction:
          </p>

          <div className="space-y-4">
            {[
              {
                scenario: "You chat with your personal AI assistant",
                tiersIncluded: ["T0", "T1", "T2", "T3"],
                explanation: "Your assistant has access to your personal memories (T0), any explicitly shared context (T1), trusted circle memories (T2), and community knowledge (T3). T4 and T5 are not relevant for personal conversations.",
              },
              {
                scenario: "You share project context with a teammate",
                tiersIncluded: ["T1", "T2", "T3"],
                explanation: "You explicitly share specific memories (T1) with your teammate. They can also see any trusted circle (T2) and community (T3) memories you both have access to. Your T0 personal memories remain private.",
              },
              {
                scenario: "VIVIM improves algorithms with anonymized data",
                tiersIncluded: ["T4"],
                explanation: "Only T4 anonymized memories are used. All PII is stripped through automated detection, and k-anonymity thresholds ensure no individual can be re-identified from the dataset.",
              },
              {
                scenario: "Legal compliance requires disclosure",
                tiersIncluded: ["T5"],
                explanation: "T5 memories subject to regulatory requirements are disclosed with full audit logging. You're notified before disclosure with a grace period to contest if appropriate.",
              },
            ].map((item, i) => (
              <div key={i} className="p-5 rounded-lg bg-slate-900/30 border border-white/5">
                <h4 className="font-semibold text-white mb-3">{item.scenario}</h4>
                <div className="flex flex-wrap gap-2 mb-3">
                  {item.tiersIncluded.map((tier) => (
                    <span key={tier} className="px-2 py-1 rounded bg-violet-500/20 text-violet-300 text-xs font-mono font-bold">
                      {tier}
                    </span>
                  ))}
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{item.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rights Management */}
      <section className="mb-12" aria-labelledby="rights-management">
        <h2 id="rights-management" className="text-2xl font-bold text-white mb-6">
          Managing Your Rights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Setting Default Tiers",
              description: "Configure default rights tiers for different memory types. Personal reflections default to T0, professional knowledge to T3, etc. You can override defaults per-memory.",
              icon: Settings,
            },
            {
              title: "Changing Tier Membership",
              description: "Add or remove members from your Trusted Circle (T2), join or leave communities (T3), and manage explicit share grants (T1) at any time.",
              icon: Users,
            },
            {
              title: "Revoking Access",
              description: "Revoke any previously granted access instantly. T1 shares can be individually revoked. T2 circle members lose access when removed. All revocations are logged.",
              icon: Lock,
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-6 rounded-xl bg-white/5 border border-white/10"
              >
                <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
              </div>
            );
          })}
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
              href: "/docs/privacy-security",
              title: "Privacy & Security",
              description: "Learn how VIVIM protects your data with encryption, isolation, and sentinel detection systems.",
              icon: Shield,
              color: "from-fuchsia-500/10 to-pink-500/10 border-fuchsia-500/20",
            },
            {
              href: "/docs/sentinel-detection",
              title: "Sentinel Detection",
              description: "Explore the 13 algorithms that detect and prevent unauthorized data usage.",
              icon: Eye,
              color: "from-amber-500/10 to-orange-500/10 border-amber-500/20",
            },
            {
              href: "/docs/memory-system",
              title: "Memory System",
              description: "Understand how memories are tagged with rights tiers and managed throughout their lifecycle.",
              icon: Key,
              color: "from-cyan-500/10 to-blue-500/10 border-cyan-500/20",
            },
            {
              href: "/docs/api-reference",
              title: "API Reference",
              description: "Explore API endpoints for managing rights tiers, sharing, and access control.",
              icon: Code2,
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
