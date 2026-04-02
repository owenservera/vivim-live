"use client";

import { useTranslations } from "next-intl";
import { ArrowLeft, Database } from "lucide-react";
import Link from "next/link";
import { SovereignHistoryDemo } from "@/components/sovereign-history-demo";

export default function SovereignHistoryPage() {
  const t = useTranslations('demos.sovereignHistory');
  const tCommon = useTranslations('demos.common');
  
  const td = useTranslations('demos');
  
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="grain-overlay" />
      <div className="aura-glow" />

      <header className="relative z-10 p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {tCommon('backToHome')}
        </Link>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-6 pb-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-blue-500/30 mb-6">
            <Database className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-slate-300">{t('title')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-blue-400">
              {t('ownYourArchives')}
            </span>
            <br />
            <span className="text-white">{t('universalExport')}</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <SovereignHistoryDemo />
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-slate-500 mb-6">
            {t('localNodes')}{" "}
            <Link href="/demos/decentralized-network" className="text-blue-400 hover:text-blue-300">
              {td('items.decentralizedNetwork.title')}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
