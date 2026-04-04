"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, Settings, Check, X, Shield, BarChart3, Target } from "lucide-react";
import { cn } from "@/lib/utils";

type ConsentLevel = "all" | "essential" | "none";

interface ConsentState {
  necessary: boolean;
  analytics: boolean;
  personalization: boolean;
  timestamp?: string;
  version: string;
}

const CONSENT_KEY = "vivim_consent";
const CONSENT_VERSION = "1.0";

const defaultConsent: ConsentState = {
  necessary: true,
  analytics: false,
  personalization: false,
  version: CONSENT_VERSION,
};

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [consent, setConsent] = useState<ConsentState>(defaultConsent);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ConsentState;
        if (parsed.version !== CONSENT_VERSION) {
          setShowBanner(true);
        } else {
          setConsent(parsed);
          setShowBanner(false);
        }
      } catch {
        setShowBanner(true);
      }
    } else {
      setShowBanner(true);
    }
  }, []);

  const saveConsent = (newConsent: ConsentState) => {
    const finalConsent = {
      ...newConsent,
      timestamp: new Date().toISOString(),
      version: CONSENT_VERSION,
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(finalConsent));
    setConsent(finalConsent);
    setShowBanner(false);
    setShowSettings(false);

    window.dispatchEvent(
      new CustomEvent("consentChanged", { detail: finalConsent })
    );
  };

  const handleAcceptAll = () => {
    saveConsent({
      necessary: true,
      analytics: true,
      personalization: true,
      version: CONSENT_VERSION,
    });
  };

  const handleAcceptEssential = () => {
    saveConsent({
      necessary: true,
      analytics: false,
      personalization: false,
      version: CONSENT_VERSION,
    });
  };

  const handleSavePreferences = () => {
    saveConsent(consent);
  };

  const handleToggle = (key: "analytics" | "personalization") => {
    setConsent((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  if (!showBanner) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed bottom-0 left-0 right-0 z-[100] p-4"
      >
        <div className="max-w-4xl mx-auto">
          <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            {!showSettings ? (
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                    <Cookie className="w-6 h-6 text-violet-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Cookie & Privacy Preferences
                    </h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      We use cookies and local storage to provide you with a personalized experience,
                      remember your preferences, and improve our services. Your data stays on your
                      device by default with VIVIM's sovereign memory architecture.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-6">
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-medium text-sm hover:from-violet-500 hover:to-cyan-500 transition-all"
                  >
                    Accept All
                  </button>

                  <button
                    type="button"
                    onClick={handleAcceptEssential}
                    className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white font-medium text-sm hover:bg-white/10 transition-all"
                  >
                    Essential Only
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowSettings(true)}
                    className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-medium text-sm hover:bg-white/10 transition-all flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    Customize
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Settings className="w-5 h-5 text-violet-400" />
                    <h3 className="text-lg font-semibold text-white">
                      Privacy Settings
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-emerald-400" />
                        <div>
                          <p className="text-sm font-medium text-white">Necessary</p>
                          <p className="text-xs text-slate-500">Essential for the app to function</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                        Always On
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BarChart3 className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-sm font-medium text-white">Analytics</p>
                          <p className="text-xs text-slate-500">Help us understand usage patterns</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-pressed={consent.analytics}
                        aria-label="Analytics cookies"
                        onClick={() => handleToggle("analytics")}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          consent.analytics ? "bg-violet-600" : "bg-slate-700"
                        )}
                      >
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all",
                            consent.analytics ? "left-6" : "left-0.5"
                          )}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Target className="w-5 h-5 text-amber-400" />
                        <div>
                          <p className="text-sm font-medium text-white">Personalization</p>
                          <p className="text-xs text-slate-500">Remember your preferences and context</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-pressed={consent.personalization}
                        aria-label="Personalization cookies"
                        onClick={() => handleToggle("personalization")}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          consent.personalization ? "bg-violet-600" : "bg-slate-700"
                        )}
                      >
                        <div
                          className={cn(
                            "w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all",
                            consent.personalization ? "left-6" : "left-0.5"
                          )}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowSettings(false)}
                    className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-medium text-sm hover:bg-white/10 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSavePreferences}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-medium text-sm hover:from-violet-500 hover:to-cyan-500 transition-all flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            <div className="px-6 py-3 bg-white/[0.02] border-t border-white/[0.05]">
              <p className="text-xs text-slate-500 text-center">
                By using VIVIM, you agree to our{" "}
                <a href="/privacy" className="text-violet-400 hover:underline">
                  Privacy Policy
                </a>{" "}
                and{" "}
                <a href="/terms" className="text-violet-400 hover:underline">
                  Terms of Service
                </a>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function getConsentState(): ConsentState | null {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as ConsentState;
  } catch {
    return null;
  }
}

export function hasConsent(type: "analytics" | "personalization"): boolean {
  const consent = getConsentState();
  if (!consent) return false;
  return consent[type];
}
