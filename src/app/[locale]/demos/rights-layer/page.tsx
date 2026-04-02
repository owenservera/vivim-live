"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Shield, ArrowLeft, FileKey, Scale, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import Link from "next/link";

type TierLevel = "T0" | "T1" | "T2" | "T3" | "T4" | "T5";

type SampleConversation = {
  text: string;
  expectedTier: TierLevel;
  description: string;
};

const SAMPLE_CONVERSATIONS: SampleConversation[] = [
  { text: "What should I make for dinner tonight?", expectedTier: "T0", description: "Personal, everyday question" },
  { text: "Here's the code for the new login flow...", expectedTier: "T3", description: "Work-related, company asset" },
  { text: "My medical symptoms have been...", expectedTier: "T5", description: "Health information, regulated" },
  { text: "I prefer dark mode in all my IDEs", expectedTier: "T1", description: "Personal preference" },
  { text: "The Q4 financial projections are ready", expectedTier: "T3", description: "Business confidential" },
  { text: "What are the best restaurants in Tokyo?", expectedTier: "T0", description: "General personal interest" },
];

const TIERS = [
  { tier: "T0", label: "Personal Only", desc: "Complete ownership, no sharing", color: "from-emerald-500 to-green-600", bg: "bg-emerald-500/20", border: "border-emerald-500/30" },
  { tier: "T1", label: "Personal-Likely", desc: "Probably personal, reviewable", color: "from-emerald-400 to-teal-500", bg: "bg-emerald-400/20", border: "border-emerald-400/30" },
  { tier: "T2", label: "Shared-Possibly", desc: "Ready for co-governance", color: "from-amber-400 to-orange-500", bg: "bg-amber-400/20", border: "border-amber-400/30" },
  { tier: "T3", label: "Co-Governed", desc: "Dual-key required for exports", color: "from-orange-500 to-amber-600", bg: "bg-orange-500/20", border: "border-orange-500/30" },
  { tier: "T4", label: "Restricted", desc: "Enhanced protection", color: "from-red-500 to-rose-600", bg: "bg-red-500/20", border: "border-red-500/30" },
  { tier: "T5", label: "Regulated", desc: "Never exports, lockbox", color: "from-red-600 to-red-700", bg: "bg-red-600/20", border: "border-red-600/30" },
];

export default function RightsLayerDemoPage() {
  const t = useTranslations('demos.rightsLayer');
  const [selectedSample, setSelectedSample] = useState<SampleConversation | null>(null);
  const [detectedTier, setDetectedTier] = useState<TierLevel | null>(null);
  const [confidence, setConfidence] = useState<number>(0);
  const [isClassifying, setIsClassifying] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [tdassPhase, setTdassPhase] = useState<"active" | "sunset" | "post-sunset">("active");
  const [approvalStatus, setApprovalStatus] = useState<"pending" | "approved" | "denied">("pending");

  function classifyContent(text: string): { tier: TierLevel; confidence: number } {
    const lower = text.toLowerCase();
    if (lower.includes("medical") || lower.includes("symptoms") || lower.includes("diagnosis") || lower.includes("prescription")) {
      return { tier: "T5", confidence: 0.94 };
    }
    if (lower.includes("financial") || lower.includes("revenue") || lower.includes("projections") || lower.includes("quarter") || lower.includes("q4") || lower.includes("code") || lower.includes("login") || lower.includes("architecture")) {
      return { tier: "T3", confidence: 0.87 };
    }
    if (lower.includes("dinner") || lower.includes("restaurant") || lower.includes("movie") || lower.includes("hobby") || lower.includes("weekend")) {
      return { tier: "T0", confidence: 0.82 };
    }
    if (lower.includes("prefer") || lower.includes("like") || lower.includes("always") || lower.includes("never")) {
      return { tier: "T1", confidence: 0.79 };
    }
    return { tier: "T2", confidence: 0.65 };
  }

  function handleClassify() {
    if (!selectedSample) return;
    setIsClassifying(true);
    setTimeout(() => {
      const result = classifyContent(selectedSample.text);
      setDetectedTier(result.tier);
      setConfidence(result.confidence);
      setIsClassifying(false);
    }, 1200);
  }

  function handleExport() {
    if (detectedTier !== "T0" && detectedTier !== "T1") {
      if (detectedTier === "T5") {
        setApprovalStatus("denied");
      } else {
        setApprovalStatus("pending");
        setTimeout(() => {
          setApprovalStatus("approved");
        }, 2000);
      }
    } else {
      setApprovalStatus("approved");
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t('backToHome') || 'Back to Home'}
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-amber-500/30 mb-6">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-sm text-slate-300">{t('interactiveDemo') || 'Interactive Demo'}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            The <span className="text-amber-400">{t('title').replace(' Demo', '')}</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            {t('description')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="p-6 rounded-2xl glass-card">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileKey className="w-5 h-5 text-amber-400" />
                {t('tierClassifier') || 'Tier Classifier'}
              </h2>
              
              <div className="mb-4">
                <p className="text-sm text-slate-400 mb-2">{t('selectSample') || 'Select a sample conversation:'}</p>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_CONVERSATIONS.map((sample, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { setSelectedSample(sample); setDetectedTier(null); setApprovalStatus("pending"); }}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                        selectedSample === sample 
                          ? "bg-amber-500/20 border-amber-500/50 text-amber-400" 
                          : "bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-600"
                      }`}
                    >
                      {t('sample') || 'Sample'} {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              {selectedSample && (
                <div className="mb-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/60">
                  <p className="text-white mb-2">"{selectedSample.text}"</p>
                  <p className="text-xs text-slate-500">{t(`sampleConversations.${Object.keys(t.raw('sampleConversations') as object)[Object.keys(SAMPLE_CONVERSATIONS).findIndex(s => s.text === selectedSample.text)]}.description`) || selectedSample.description}</p>
                  <p className="text-xs text-slate-600 mt-1">{t('expected') || 'Expected'}: {selectedSample.expectedTier}</p>
                </div>
              )}

              <button
                type="button"
                onClick={handleClassify}
                disabled={!selectedSample || isClassifying}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-amber-400 hover:to-orange-500 transition-all"
              >
                {isClassifying ? (t('actions.classifying') || 'Classifying...') : (t('actions.classify') || 'Classify Content')}
              </button>

              {detectedTier && !isClassifying && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800/60"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-400">{t('actions.detectedTier') || 'Detected Tier'}:</span>
                    <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${TIERS.find(t => t.tier === detectedTier)?.color}`}>
                      <span className="font-bold text-white">{detectedTier}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-slate-400">{t('actions.confidence') || 'Confidence'}:</span>
                    <span className="text-white font-mono">{(confidence * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500" 
                      style={{ width: `${confidence * 100}%` }}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleExport}
                    className="mt-4 w-full py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sm text-slate-300 transition-colors"
                  >
                    {t('actions.simulateExport') || 'Simulate Export Request'}
                  </button>

                  {approvalStatus !== "pending" && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`mt-3 p-3 rounded-lg flex items-center gap-2 ${
                        approvalStatus === "approved" 
                          ? "bg-emerald-500/20 border border-emerald-500/30" 
                          : "bg-red-500/20 border border-red-500/30"
                      }`}
                    >
                      {approvalStatus === "approved" ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                      <span className={`text-sm ${approvalStatus === "approved" ? "text-emerald-400" : "text-red-400"}`}>
                        {approvalStatus === "approved" 
                          ? `Export approved (${detectedTier === "T3" ? t('actions.dualKeyRequired') : t('actions.noRestrictions')})`
                          : t('actions.exportDenied')}
                      </span>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>

            <div className="p-6 rounded-2xl glass-card">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Scale className="w-5 h-5 text-amber-400" />
                {t('actions.tdassTimeline') || 'TDASS Timeline'}
              </h2>
              
              <div className="flex gap-2 mb-6">
                {(["active", "sunset", "post-sunset"] as const).map((phase) => (
                  <button
                    key={phase}
                    type="button"
                    onClick={() => setTdassPhase(phase)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                      tdassPhase === phase 
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" 
                        : "bg-slate-800/50 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {phase === "active" ? t('actions.phaseActive') : phase === "sunset" ? t('actions.phaseSunset') : t('actions.phasePostSunset')}
                  </button>
                ))}
              </div>

              <div className="space-y-3">
                <div className={`p-3 rounded-lg flex items-center justify-between ${
                  tdassPhase === "active" ? "bg-amber-500/10 border border-amber-500/30" : "bg-slate-800/30"
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${tdassPhase === "active" ? "bg-amber-500" : "bg-slate-600"}`} />
                    <span className="text-sm text-slate-300">{t('actions.humanKey')}</span>
                  </div>
                  <span className="text-xs text-slate-500">{t('actions.keyRequired')}</span>
                </div>
                <div className={`p-3 rounded-lg flex items-center justify-between ${
                  tdassPhase === "active" ? "bg-amber-500/10 border border-amber-500/30" : "bg-slate-800/30"
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${tdassPhase === "active" ? "bg-blue-500" : tdassPhase === "sunset" ? "bg-orange-400 animate-pulse" : "bg-slate-600"}`} />
                    <span className="text-sm text-slate-300">{t('actions.companyKey')}</span>
                  </div>
                  <span className="text-xs text-slate-500">
                    {tdassPhase === "active" ? t('actions.keyRequired') : tdassPhase === "sunset" ? t('actions.keyFading') : t('actions.keyNotRequired')}
                  </span>
                </div>
                {tdassPhase === "sunset" && (
                  <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-orange-400" />
                    <span className="text-xs text-orange-400">{t('actions.companyDecaying')}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl glass-card">
              <h2 className="text-xl font-bold mb-4">{t('actions.ownershipTiers') || 'Ownership Tiers'}</h2>
              <div className="space-y-3">
                {[
                  { tier: "t0", color: "from-emerald-500 to-green-600", border: "border-emerald-500/30" },
                  { tier: "t1", color: "from-emerald-400 to-teal-500", border: "border-emerald-400/30" },
                  { tier: "t2", color: "from-amber-400 to-orange-500", border: "border-amber-400/30" },
                  { tier: "t3", color: "from-orange-500 to-amber-600", border: "border-orange-500/30" },
                  { tier: "t4", color: "from-red-500 to-rose-600", border: "border-red-500/30" },
                  { tier: "t5", color: "from-red-600 to-red-700", border: "border-red-600/30" },
                ].map((tier) => (
                  <div 
                    key={tier.tier}
                    className={`p-3 rounded-xl bg-slate-900/60 border ${tier.border} ${
                      detectedTier === tier.tier.toUpperCase() ? "ring-2 ring-amber-500/50" : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${tier.color} flex items-center justify-center`}>
                        <span className="text-white font-bold text-sm">{tier.tier.toUpperCase()}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-medium text-sm">{t(`tiers.${tier.tier}.label`)}</h3>
                        <p className="text-xs text-slate-500">{t(`tiers.${tier.tier}.desc`)}</p>
                      </div>
                      {detectedTier === tier.tier.toUpperCase() && (
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl glass-card">
              <h2 className="text-xl font-bold mb-4">How TPDI Works</h2>
              <div className="flex items-center justify-between text-sm">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-2">
                    <span className="text-slate-400 text-xs">Input</span>
                  </div>
                  <p className="text-slate-500 text-xs">Content</p>
                </div>
                <div className="flex-1 h-0.5 bg-slate-700 mx-2" />
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center mx-auto mb-2">
                    <Scale className="w-5 h-5 text-violet-400" />
                  </div>
                  <p className="text-slate-500 text-xs">ML Classifier</p>
                </div>
                <div className="flex-1 h-0.5 bg-slate-700 mx-2" />
                <div className="text-center">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mx-auto mb-2">
                    <span className="text-amber-400 text-xs">T3</span>
                  </div>
                  <p className="text-slate-500 text-xs">Tier + Confidence</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4 text-center">
                The classifier learns from user corrections to improve accuracy over time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}