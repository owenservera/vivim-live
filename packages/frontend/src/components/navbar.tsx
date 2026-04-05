"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Play, Github, Menu,
  Cpu, Brain, Lock, History, Network, Users, Zap,
  ChevronDown, ExternalLink, Layers, Shield,
} from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";

function throttle<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let lastCall = 0;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return ((...args: unknown[]) => {
    const now = Date.now();
    const remaining = delay - (now - lastCall);

    if (remaining <= 0) {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = null;
      }
      lastCall = now;
      fn(...args);
    } else if (!timeoutId) {
      timeoutId = setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        fn(...args);
      }, remaining);
    }
  }) as T;
}

/* ─── Data ─── */

const DEMOS = [
  { href: "/demos/live-memory", label: "Live Memory", desc: "See extraction in action", icon: Brain, iconColor: "text-cyan-400" },
  { href: "/demos/context-engine", label: "Context Engine", desc: "Watch memory assembly live", icon: Cpu, iconColor: "text-violet-400" },
  { href: "/demos/zero-knowledge-privacy", label: "Zero-Knowledge", desc: "Your keys never leave your device", icon: Shield, iconColor: "text-emerald-400" },
  { href: "/demos/sovereign-history", label: "Sovereign History", desc: "Complete ownership of your data", icon: History, iconColor: "text-amber-400" },
  { href: "/demos/decentralized-network", label: "Decentralized", desc: "Peer-to-peer sync without servers", icon: Network, iconColor: "text-blue-400" },
  { href: "/demos/secure-collaboration", label: "Secure Collaboration", desc: "Team sharing with sovereignty", icon: Users, iconColor: "text-rose-400" },
  { href: "/demos/dynamic-intelligence", label: "Dynamic Intelligence", desc: "Adaptive context evolution", icon: Zap, iconColor: "text-lime-400" },
];

const GITHUB_LINKS = [
  { href: "https://github.com/owenservera/vivim-server", label: "Backend", desc: "Server infrastructure" },
  { href: "https://github.com/owenservera/vivim-pwa", label: "App", desc: "Mobile application" },
  { href: "https://github.com/owenservera/vivim-network", label: "Network", desc: "P2P protocol" },
  { href: "https://github.com/owenservera/vivim-sdk", label: "SDK", desc: "Developer kit" },
];

/* ─── Progress Indicator (desktop only) ─── */

function ProgressIndicator({
  sections,
  activeSection,
  scrollToSection,
}: {
  sections: { label: string; id: string }[];
  activeSection: number;
  scrollToSection: (id: string) => void;
}) {
  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-8 items-end">
      <div className="absolute right-[3px] top-0 bottom-0 w-[1px] bg-white/5" />

      {sections.map((section, i) => (
        <button
          type="button"
          key={section.id}
          onClick={() => scrollToSection(section.id)}
          className="group flex items-center justify-end relative h-2"
          aria-label={`Scroll to ${section.label}`}
        >
          <span
            className={`
              absolute right-10 text-[10px] font-bold tracking-[0.2em] uppercase whitespace-nowrap
              transition-all duration-500 select-none pointer-events-none
              opacity-0 -translate-x-4
              group-hover:opacity-100 group-hover:translate-x-0
              ${activeSection === i ? "text-violet-400" : "text-slate-500"}
            `}
          >
            {section.label}
          </span>

          <div
            className={`
              relative z-10 w-2 h-2 rounded-full transition-all duration-500
              ${
                activeSection === i
                  ? "bg-violet-400 scale-150 shadow-[0_0_20px_rgba(167,139,250,0.8)]"
                  : "bg-slate-700 group-hover:bg-slate-400 shadow-none"
              }
            `}
          />

          {activeSection === i && (
            <div className="absolute -inset-1 blur-sm bg-violet-400/20 rounded-full animate-pulse" />
          )}
        </button>
      ))}
    </div>
  );
}

/* ─── Desktop Dropdown: Demos ─── */

function DemosDropdown() {
  return (
    <div className="relative group/demos">
      <button
        type="button"
        className="px-4 py-1.5 rounded-full text-sm font-medium text-slate-400 hover:text-white transition-colors hover:bg-white/5 flex items-center gap-1"
      >
        <Play className="w-3.5 h-3.5" />
        Demos
        <ChevronDown className="w-3 h-3 opacity-50" />
      </button>

      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover/demos:opacity-100 group-hover/demos:visible group-focus-within/demos:opacity-100 group-focus-within/demos:visible transition-all duration-200">
        <div className="bg-slate-900 border border-white/10 rounded-xl p-2 min-w-[260px] shadow-xl backdrop-blur-xl">
          {DEMOS.map((demo) => {
            const Icon = demo.icon;
            return (
              <Link
                key={demo.href}
                href={demo.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Icon className={`w-4 h-4 ${demo.iconColor}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium">{demo.label}</p>
                  <p className="text-xs text-slate-500 truncate">{demo.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── Desktop Dropdown: GitHub ─── */

function GithubDropdown() {
  return (
    <div className="relative group/github">
      <button
        type="button"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors hover:bg-white/5 whitespace-nowrap"
      >
        <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">GitHub</span>
        <ChevronDown className="w-3 h-3 opacity-50" />
      </button>

      <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover/github:opacity-100 group-hover/github:visible group-focus-within/github:opacity-100 group-focus-within/github:visible transition-all duration-200">
        <div className="bg-slate-900 border border-white/10 rounded-xl p-2 min-w-[200px] shadow-xl backdrop-blur-xl">
          {GITHUB_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
            >
              <div>
                <span className="text-sm text-white font-medium">{link.label}</span>
                <span className="block text-xs text-slate-500">{link.desc}</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Main Navbar ─── */

export function Navbar() {
  const [activeSection, setActiveSection] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const sections = useMemo(
    () => [
      { label: "Overview", id: "overview" },
      { label: "Problem", id: "the-problem" },
      { label: "Solution", id: "the-solution" },
      { label: "ACUs", id: "acus" },
      { label: "Pricing", id: "pricing" },
      { label: "Principles", id: "principles" },
      { label: "Developers", id: "developers" },
    ],
    []
  );

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setScrolled(scrollY > 20);

      const scrollPosition = scrollY + window.innerHeight / 3;
      const sectionIds = sections.map((s) => s.id);

      let currentSection = 0;
      sectionIds.forEach((id, i) => {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            currentSection = i;
          }
        }
      });

      setActiveSection(currentSection);
    };

    const throttledScroll = throttle(handleScroll, 16);
    window.addEventListener("scroll", throttledScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", throttledScroll);
  }, [sections]);

  return (
    <>
      <ProgressIndicator
        sections={sections}
        activeSection={activeSection}
        scrollToSection={scrollToSection}
      />

      <nav
        className={`fixed z-50 px-4 w-full max-w-[1400px] left-1/2 -translate-x-1/2 transition-all duration-500 ${
          scrolled ? "top-2" : "top-6"
        }`}
      >
        <div
          className={`rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 transition-all duration-500 ${
            scrolled
              ? "glass-strong shadow-[0_4px_30px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.08)]"
              : "glass"
          }`}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/nav-logo.png" alt="VIVIM" className="w-9 h-9 rounded-xl object-contain" />
          </Link>

          {/* Desktop: Section nav */}
          <div className="hidden md:flex items-center gap-0.5 flex-shrink-0">
            {sections.map((section, i) => (
              <button
                type="button"
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`px-2.5 py-1.5 rounded-full text-xs sm:text-sm font-medium relative transition-colors whitespace-nowrap ${
                  activeSection === i ? "text-white" : "text-slate-400 hover:text-white"
                }`}
                aria-current={activeSection === i ? "true" : undefined}
              >
                {activeSection === i && (
                  <motion.div
                    layoutId="nav-active"
                    className="absolute inset-0 bg-white/10 rounded-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{section.label}</span>
              </button>
            ))}
          </div>

          {/* Desktop: Right side actions */}
          <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
            <DemosDropdown />
            <LanguageSwitcher />
            <GithubDropdown />
          </div>

          {/* Mobile: Hamburger */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="md:hidden text-slate-300 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm bg-slate-950 border-l border-white/10 p-0 gap-0">
              <SheetHeader className="px-5 py-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <Link href="/" className="flex items-center gap-2.5">
                    <img src="/nav-logo.png" alt="VIVIM" className="w-8 h-8 rounded-lg object-contain" />
                    <SheetTitle className="text-white font-semibold tracking-tight">VIVIM</SheetTitle>
                  </Link>
                </div>
              </SheetHeader>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
                {/* Home */}
                <div>
                  <SheetClose asChild>
                    <Link
                      href="/"
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl font-medium text-sm text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all"
                    >
                      <Layers className="w-4 h-4" />
                      Home
                    </Link>
                  </SheetClose>
                </div>

                {/* Interactive Demos */}
                <div>
                  <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-3 px-1">
                    Interactive Demos
                  </div>
                  <div className="space-y-1">
                    {DEMOS.map((demo) => {
                      const Icon = demo.icon;
                      return (
                        <SheetClose key={demo.href} asChild>
                          <Link
                            href={demo.href}
                            className="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all group"
                          >
                            <div className={`w-9 h-9 rounded-lg bg-slate-900/60 border border-white/5 flex items-center justify-center flex-shrink-0 ${demo.iconColor}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{demo.label}</p>
                              <p className="text-xs text-slate-500 truncate">{demo.desc}</p>
                            </div>
                          </Link>
                        </SheetClose>
                      );
                    })}
                  </div>
                </div>

                {/* GitHub */}
                <div>
                  <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-3 px-1">
                    GitHub
                  </div>
                  <div className="space-y-1">
                    {GITHUB_LINKS.map((link) => (
                      <a
                        key={link.href}
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-3 px-3 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.04] transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <Github className="w-4 h-4 text-slate-500" />
                          <span className="text-sm font-medium">{link.label}</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Language */}
                <div>
                  <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-3 px-1">
                    Language
                  </div>
                  <LanguageSwitcher />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </>
  );
}
