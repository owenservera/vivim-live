"use client";

import React, { useState, useEffect, useRef } from "react";
import { translatePage, revertPage, startObserver, prefetchTranslations, clearPrefetch } from "@/lib/translation/client";
import { detectLanguage, setLanguagePreference } from "@/lib/translation/langDetect";
import { suggestLanguageFromLocation, detectLocation } from "@/lib/translation/geolocation";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, ChevronDown, MapPin } from "lucide-react";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "pt", label: "Português", flag: "🇧🇷" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
];

interface LocationHint {
  country?: string;
  recommendedLang?: string;
}

export default function LanguageSwitcher() {
  const [lang, setLang] = useState("en");
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [locationHint, setLocationHint] = useState<LocationHint | null>(null);
  const [showLocationBanner, setShowLocationBanner] = useState(false);
  const [userCountry, setUserCountry] = useState<string | null>(null);
  const [prefetchedLang, setPrefetchedLang] = useState<string | null>(null);
  const langRef = useRef(lang);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    langRef.current = lang;
  }, [lang]);

  useEffect(() => {
    const detected = detectLanguage();
    setLang(detected);

    detectLocation().then((geo) => {
      if (geo?.country) {
        setUserCountry(geo.country);
      }
      suggestLanguageFromLocation().then((suggested) => {
        if (suggested && suggested !== detected && suggested !== "en") {
          setLocationHint({ recommendedLang: suggested });
          setShowLocationBanner(true);
          console.log("[LanguageSwitcher] Location-based recommendation", suggested);
        }
      });
    });

    if (detected !== "en") {
      translatePage(detected);
    }
    startObserver(() => langRef.current);
  }, []);

  const handleDropdownOpen = () => {
    setIsOpen(true);
    
    if (locationHint?.recommendedLang && locationHint.recommendedLang !== "en") {
      prefetchTranslations(locationHint.recommendedLang, document.body, "vivim landing page");
      setPrefetchedLang(locationHint.recommendedLang);
    }
  };

  const handleLanguageHover = (code: string) => {
    if (code === "en" || code === prefetchedLang || loading) return;
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    hoverTimeoutRef.current = setTimeout(() => {
      prefetchTranslations(code, document.body, "vivim landing page");
      setPrefetchedLang(code);
    }, 150);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleChange = async (code: string) => {
    setLoading(true);
    setLang(code);
    setLanguagePreference(code);
    setIsOpen(false);
    setShowLocationBanner(false);
    clearPrefetch();

    if (code === "en") {
      revertPage();
    } else {
      revertPage();
      await translatePage(code, document.body, "vivim landing page");
    }
    setLoading(false);
  };

  const acceptRecommendation = () => {
    if (locationHint?.recommendedLang) {
      handleChange(locationHint.recommendedLang);
    }
  };

  const dismissRecommendation = () => {
    setShowLocationBanner(false);
  };

  const currentLang = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];
  const recommendedLanguage = locationHint?.recommendedLang
    ? LANGUAGES.find((l) => l.code === locationHint.recommendedLang)
    : null;

  return (
    <div className="relative">
      <AnimatePresence>
        {showLocationBanner && recommendedLanguage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="absolute right-0 top-full mt-2 z-50 bg-violet-500/10 border border-violet-500/30 rounded-xl px-4 py-2 min-w-[280px] shadow-2xl backdrop-blur-sm"
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <MapPin className="w-4 h-4 text-violet-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  We detected you might prefer <span className="text-violet-300"> {recommendedLanguage.label}</span>
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  Based on your location{locationHint?.country ? ` (${locationHint.country})` : ""}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    type="button"
                    onClick={acceptRecommendation}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500 text-white text-xs font-medium hover:bg-violet-400 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Switch to {recommendedLanguage.code.toUpperCase()}
                  </button>
                  <button
                    type="button"
                    onClick={dismissRecommendation}
                    className="text-xs text-slate-400 hover:text-white transition-colors px-2 py-1"
                  >
                    Keep English
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative">
        <button
          type="button"
          onClick={() => isOpen ? setIsOpen(false) : handleDropdownOpen()}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors hover:bg-white/5"
          aria-label="Select language"
          aria-expanded={isOpen}
        >
          {loading ? (
            <motion.span
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Globe className="w-3.5 h-3.5" />
            </motion.span>
          ) : (
            <Globe className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">{currentLang.flag}</span>
          <span className="hidden sm:inline">{currentLang.code.toUpperCase()}</span>
          <ChevronDown
            className={`w-3 h-3 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-40"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                onMouseLeave={handleMouseLeave}
                className="absolute right-0 top-full mt-2 z-50 bg-slate-900 border border-white/10 rounded-xl p-1 min-w-[200px] shadow-xl"
              >
                {locationHint?.recommendedLang && (
                  <div className="mb-2 px-3 py-1.5 bg-violet-500/5 border-b border-white/5">
                    <p className="text-xs text-violet-300 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3" />
                      Location recommends
                    </p>
                  </div>
                )}

                {LANGUAGES.map((language) => (
                  <button
                    key={language.code}
                    type="button"
                    onClick={() => handleChange(language.code)}
                    onMouseEnter={() => handleLanguageHover(language.code)}
                    disabled={loading}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                      lang === language.code
                        ? "bg-violet-500/15 text-violet-300"
                        : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span>{language.flag}</span>
                    <span className="flex-1 text-left">{language.label}</span>
                    {locationHint?.recommendedLang === language.code && (
                      <span className="text-xs bg-violet-500/20 text-violet-400 px-1.5 py-0.5 rounded">Auto-suggested</span>
                    )}
                    {prefetchedLang === language.code && lang !== language.code && (
                      <span className="text-xs text-emerald-400">✓</span>
                    )}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
