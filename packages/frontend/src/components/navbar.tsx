"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";

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
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Github, Menu, X, BookOpen, Cpu, Brain, Lock, History, Network, Users, Zap } from "lucide-react";
import LanguageSwitcher from "./LanguageSwitcher";

const sectionToId = (section: string): string =>
  section.toLowerCase().split(" ").join("-");

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

function MobileMenu({
  isOpen,
  onClose,
  sections,
  activeSection,
  scrollToSection,
}: {
  isOpen: boolean;
  onClose: () => void;
  sections: { label: string; id: string }[];
  activeSection: number;
  scrollToSection: (id: string) => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (e.key !== "Tab") return;

      const focusableElements = menuRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    };

    closeButtonRef.current?.focus();
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  const handleNavClick = (section: { label: string; id: string }) => {
    scrollToSection(section.id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />

          <motion.div
            ref={menuRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 280 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-72 flex flex-col md:hidden bg-slate-950"
            style={{
              backdropFilter: "blur(24px)",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5">
              <img src="/nav-logo.png" alt="VIVIM" className="w-9 h-9 rounded-xl object-contain" />
              <button
                type="button"
                ref={closeButtonRef}
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors p-1"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1" aria-label="Mobile navigation">
              {sections.map((section, i) => (
                <motion.button
                  key={section.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleNavClick(section)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    activeSection === i
                      ? "bg-violet-500/15 text-violet-300 border border-violet-500/20"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                  aria-current={activeSection === i ? "page" : undefined}
                >
                  {section.label}
                </motion.button>
              ))}
            </nav>

            <div className="p-4 border-t border-white/5 space-y-2">
              <Link
                href="/demos/live-memory"
                onClick={onClose}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Play className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-white">Live Memory Demo</span>
              </Link>
              <Link
                href="/demos/context-engine"
                onClick={onClose}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-white/10 text-white text-sm hover:bg-white/5 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Context Engine Demo
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function DemosDropdown() {
  const demos = [
    { href: "/demos/live-memory", label: "Live Memory", desc: "See extraction in action", icon: Brain, iconColor: "text-cyan-400" },
    { href: "/demos/context-engine", label: "Context Engine", desc: "Watch memory assembly live", icon: Cpu, iconColor: "text-violet-400" },
    { href: "/demos/zero-knowledge-privacy", label: "Zero-Knowledge Privacy", desc: "Your keys never leave your device", icon: Lock, iconColor: "text-emerald-400" },
    { href: "/demos/sovereign-history", label: "Sovereign History", desc: "Complete ownership of your data", icon: History, iconColor: "text-amber-400" },
    { href: "/demos/decentralized-network", label: "Decentralized Network", desc: "Peer-to-peer sync without servers", icon: Network, iconColor: "text-blue-400" },
    { href: "/demos/secure-collaboration", label: "Secure Collaboration", desc: "Team sharing with sovereignty", icon: Users, iconColor: "text-rose-400" },
    { href: "/demos/dynamic-intelligence", label: "Dynamic Intelligence", desc: "Adaptive context evolution", icon: Zap, iconColor: "text-lime-400" },
  ];

  return (
    <div className="relative group/demos">
      <button
        type="button"
        className="px-4 py-1.5 rounded-full text-sm font-medium text-slate-400 hover:text-white transition-colors hover:bg-white/5 flex items-center gap-1"
      >
        <Play className="w-3.5 h-3.5" />
        Demos
      </button>

      <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover/demos:opacity-100 group-hover/demos:visible transition-all duration-200">
        <div className="bg-slate-900 border border-white/10 rounded-xl p-2 min-w-[240px] shadow-xl">
          {demos.map((demo) => {
            const Icon = demo.icon;
            return (
              <Link
                key={demo.href}
                href={demo.href}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <Icon className={`w-4 h-4 ${demo.iconColor}`} />
                <div>
                  <p className="text-sm text-white">{demo.label}</p>
                  <p className="text-xs text-slate-500">{demo.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  const sections = useMemo(
    () => [
      { label: "Overview", id: "overview" },
      { label: "Problem", id: "the-problem" },
      { label: "Solution", id: "the-solution" },
      { label: "ACUs", id: "acus" },
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
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/nav-logo.png" alt="VIVIM" className="w-9 h-9 rounded-xl object-contain" />
          </Link>

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

          <div className="hidden md:flex items-center gap-1.5 flex-shrink-0">
            <DemosDropdown />
            <LanguageSwitcher />

            <div className="relative group/github">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors hover:bg-white/5 whitespace-nowrap"
              >
                <Github className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">GitHub</span>
              </button>

              <div className="absolute top-full right-0 pt-2 opacity-0 invisible group-hover/github:opacity-100 group-hover/github:visible transition-all duration-200">
                <div className="bg-slate-900 border border-white/10 rounded-xl p-2 min-w-[200px] shadow-xl">
                  <a
                    href="https://github.com/owenservera/vivim-server"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <span className="text-sm text-white">Backend</span>
                  </a>
                  <a
                    href="https://github.com/owenservera/vivim-pwa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <span className="text-sm text-white">App</span>
                  </a>
                  <a
                    href="https://github.com/owenservera/vivim-network"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <span className="text-sm text-white">Network</span>
                  </a>
                  <a
                    href="https://github.com/owenservera/vivim-sdk"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                  >
                    <span className="text-sm text-white">SDK</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="md:hidden text-slate-300 hover:text-white p-1"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <MobileMenu
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          sections={sections}
          activeSection={activeSection}
          scrollToSection={scrollToSection}
        />
      </nav>
    </>
  );
}
