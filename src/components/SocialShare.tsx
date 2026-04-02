"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Share2, Link2, Check, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SocialShare() {
  const t = useTranslations('components.socialShare');
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "https://vivim.live";
  const shareText = "Check out VIVIM - Sovereign, Portable, Personal AI Memory";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleWhatsApp = () => {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`;
    window.open(whatsappUrl, "_blank");
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "VIVIM - Sovereign, Portable, Personal AI Memory",
          text: shareText,
          url: shareUrl,
        });
      } catch (_) { /* empty */ }
    }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors hover:bg-white/5"
        aria-label={t('buttonLabel')}
      >
        <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="hidden sm:inline">{t('buttonLabel')}</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 pt-2"
          >
            <div className="bg-slate-900 border border-white/10 rounded-xl p-2 min-w-[180px] shadow-xl">
              <button
                type="button"
                onClick={handleNativeShare}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left"
              >
                <Share2 className="w-4 h-4 text-violet-400" />
                <span className="text-sm text-white">{t('shareGeneric')}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Link2 className="w-4 h-4 text-cyan-400" />
                )}
                <span className="text-sm text-white">{copied ? t('copied') : t('copyLink')}</span>
              </button>

              <button
                type="button"
                onClick={handleWhatsApp}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/5 transition-colors text-left"
              >
                <MessageCircle className="w-4 h-4 text-green-400" />
                <span className="text-sm text-white">{t('whatsapp')}</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}