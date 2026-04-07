"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Brain,
  Layers,
  Database,
  Shield,
  Code2,
  Rocket,
  HelpCircle,
  Network,
  Key,
  ShoppingCart,
  FileText,
  ChevronRight,
  Home,
} from "lucide-react";

const DOCS_NAV = [
  {
    category: "Getting Started",
    icon: Rocket,
    items: [
      { href: "/docs", label: "Documentation Home", icon: Home },
      { href: "/docs/what-is-vivim", label: "What is VIVIM", icon: BookOpen },
      { href: "/docs/getting-started", label: "Quick Start Guide", icon: Rocket },
    ],
  },
  {
    category: "Core Concepts",
    icon: Brain,
    items: [
      { href: "/docs/architecture", label: "System Architecture", icon: Network },
      { href: "/docs/memory-system", label: "Memory System", icon: Database },
      { href: "/docs/context-engine", label: "Context Engine", icon: Layers },
      { href: "/docs/rights-layer", label: "Rights Layer", icon: Key },
    ],
  },
  {
    category: "Security & Privacy",
    icon: Shield,
    items: [
      { href: "/docs/privacy-security", label: "Privacy & Security", icon: Shield },
      { href: "/docs/sentinel-detection", label: "Sentinel Detection", icon: Shield },
    ],
  },
  {
    category: "Developer Resources",
    icon: Code2,
    items: [
      { href: "/docs/api-reference", label: "API Reference", icon: Code2 },
      { href: "/docs/sdk-guide", label: "SDK Integration Guide", icon: Code2 },
      { href: "/docs/marketplace", label: "Memory Marketplace", icon: ShoppingCart },
    ],
  },
  {
    category: "Support",
    icon: HelpCircle,
    items: [
      { href: "/docs/faq", label: "FAQ", icon: HelpCircle },
      { href: "/docs/glossary", label: "Glossary", icon: FileText },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <nav className="p-4 space-y-6" aria-label="Documentation navigation">
      <Link href="/" className="flex items-center gap-3 px-3 py-4 mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10">
          <svg
            width="24"
            height="24"
            viewBox="0 0 40 40"
            fill="none"
            className="text-violet-400"
            role="img"
            aria-label="VIVIM"
          >
            <path
              d="M20 4L4 12L20 20L36 12L20 4Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M4 20L20 28L36 20"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            <path
              d="M4 28L20 36L36 28"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div>
          <div className="text-lg font-bold text-white">VIVIM</div>
          <div className="text-xs text-slate-400">Documentation</div>
        </div>
      </Link>

      {DOCS_NAV.map((section) => {
        const SectionIcon = section.icon;
        return (
          <div key={section.category}>
            <div className="flex items-center gap-2 px-3 mb-2 text-sm font-semibold text-slate-300 uppercase tracking-wider">
              <SectionIcon className="w-4 h-4" />
              {section.category}
            </div>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const ItemIcon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
                        isActive
                          ? "bg-violet-500/10 text-violet-300 border-l-2 border-violet-400"
                          : "text-slate-400 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <ItemIcon className="w-4 h-4 flex-shrink-0" />
                      <span>{item.label}</span>
                      {isActive && <ChevronRight className="w-3 h-3 ml-auto" />}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </nav>
  );
}
