"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Radar, ArrowLeft, ScanEye, FileCheck, ScanLine, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";

const ALGORITHMS = [
  { id: "spectral-mi", name: "Spectral Membership Inference", description: "Primary detection via spectroscopy" },
  { id: "mutual-info", name: "Mutual Information Estimation", description: "Quantify retained information" },
  { id: "kolmogorov", name: "Kolmogorov Uniqueness Scoring", description: "Identify most-detectable content" },
  { id: "photon-counting", name: "Photon Counting", description: "Per-token attribution" },
  { id: "interference", name: "Interference Pattern Detection", description: "Cross-provider contamination" },
  { id: "canary", name: "Canary Wave Function", description: "Proactive detection" },
  { id: "boltzmann", name: "Boltzmann Calibration", description: "Statistical calibration" },
  { id: "holographic", name: "Holographic Watermarking", description: "Identity encoding" },
  { id: "thermodynamic", name: "Thermodynamic Flow Tracing", description: "Temporal absorption" },
  { id: "fisher", name: "Fisher Information Fingerprinting", description: "Parameter influence" },
  { id: "entanglement", name: "Entanglement Testing", description: "Hidden sharing detection" },
  { id: "diffraction", name: "Diffraction Grating Analysis", description: "Multi-scale analysis" },
  { id: "conservation", name: "Conservation Law Verification", description: "Complete accounting" },
];

const CANARY_TOKENS = [
  { id: "c1", phrase: "x7z9quantum21", status: "ready" },
  { id: "c2", phrase: "neuron-flux-omega", status: "ready" },
  { id: "c3", phrase: "alpha-entropy-99", status: "detected" },
];

export default function SentinelDetectionDemoPage() {
  const t = useTranslations('demos.sentinelDetection');
  const [isScanning, setIsScanning] = useState(false);
  const [algorithmStates, setAlgorithmStates] = useState<Record<string, "ready" | "scanning" | "detected">>({});
  const [detectionResults, setDetectionResults] = useState<{algorithm: string; confidence: number; timestamp: string}[]>([]);
  const [canaries, setCanaries] = useState(CANARY_TOKENS);
  const [showEvidence, setShowEvidence] = useState(false);

  function startScan() {
    setIsScanning(true);
    setDetectionResults([]);
    const newStates: Record<string, "ready" | "scanning" | "detected"> = {};
    ALGORITHMS.forEach(algo => { newStates[algo.id] = "scanning"; });
    setAlgorithmStates(newStates);

    let completed = 0;
    ALGORITHMS.forEach((algo, index) => {
      setTimeout(() => {
        const detected = Math.random() > 0.7;
        const confidence = detected ? 0.75 + Math.random() * 0.24 : 0.1 + Math.random() * 0.3;
        setAlgorithmStates(prev => ({ ...prev, [algo.id]: detected ? "detected" : "ready" }));
        if (detected) {
          setDetectionResults(prev => [...prev, {
            algorithm: algo.name,
            confidence,
            timestamp: new Date().toISOString()
          }]);
        }
        completed++;
        if (completed === ALGORITHMS.length) {
          setIsScanning(false);
        }
      }, 800 + index * 200);
    });
  }

  function generateEvidence() {
    setShowEvidence(true);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t('backToHome')}
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-red-500/30 mb-6">
            <Radar className="w-4 h-4 text-red-400" />
            <span className="text-sm text-slate-300">{t('interactiveDemo')}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="text-red-400">{t('headline')}</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            {t('algorithms')}
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="p-6 rounded-2xl glass-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <ScanEye className="w-5 h-5 text-red-400" />
                  {t('detectionDashboard') || 'Detection Dashboard'}
                </h2>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isScanning 
                    ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                }`}>
                  {isScanning ? t('scanning') : t('ready')}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-6">
                {ALGORITHMS.slice(0, 8).map((algo, index) => (
                  <div 
                    key={algo.id}
                    className={`p-2 rounded-lg border transition-all ${
                      algorithmStates[algo.id] === "detected" 
                        ? "bg-red-500/20 border-red-500/50"
                        : algorithmStates[algo.id] === "scanning"
                        ? "bg-orange-500/20 border-orange-500/50 animate-pulse"
                        : "bg-slate-900/60 border-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <ScanLine className={`w-3 h-3 ${
                        algorithmStates[algo.id] === "detected" 
                          ? "text-red-400" 
                          : algorithmStates[algo.id] === "scanning"
                          ? "text-orange-400"
                          : "text-slate-500"
                      }`} />
                      <span className="text-xs text-slate-400 font-mono">A{index + 1}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-tight truncate">{t(`algorithmList.${algo.id}.name`).split(" ")[0]}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={startScan}
                disabled={isScanning}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-600 font-medium text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-red-400 hover:to-rose-500 transition-all"
              >
                {isScanning ? t('scanning') : t('startDetectionScan')}
              </button>

              {detectionResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-sm text-red-400 font-medium">
                      {t('detectionsFound', { count: detectionResults.length })}
                    </span>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {detectionResults.map((result, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-slate-300">{result.algorithm}</span>
                        <span className="text-red-400 font-mono">{(result.confidence * 100).toFixed(0)}%</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            <div className="p-6 rounded-2xl glass-card">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <ScanEye className="w-5 h-5 text-red-400" />
                {t('canarySystem')}
              </h2>
              
              <p className="text-sm text-slate-400 mb-4">
                {t('canaryDescription')}
              </p>

              <div className="space-y-2 mb-4">
                {canaries.map((canary) => (
                  <div 
                    key={canary.id}
                    className={`p-3 rounded-lg border ${
                      canary.status === "detected" 
                        ? "bg-red-500/20 border-red-500/50" 
                        : "bg-slate-900/60 border-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <code className="text-xs text-slate-300 font-mono">{canary.phrase}</code>
                      <div className={`w-2 h-2 rounded-full ${
                        canary.status === "detected" ? "bg-red-500 animate-pulse" : "bg-green-500"
                      }`} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/60">
                <p className="text-xs text-slate-500 font-mono">|canary⟩ = α|undetected⟩ + β|detected⟩</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl glass-card">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-red-400" />
                {t('allAlgorithms')}
              </h2>
              <div className="space-y-2">
                {ALGORITHMS.map((algo, i) => (
                  <div 
                    key={algo.id}
                    className={`p-3 rounded-lg border transition-colors ${
                      algorithmStates[algo.id] === "detected" 
                        ? "bg-red-500/20 border-red-500/50"
                        : algorithmStates[algo.id] === "scanning"
                        ? "bg-orange-500/20 border-orange-500/50"
                        : "bg-slate-900/60 border-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-red-400 font-mono">A{i + 1}</span>
                        <span className="text-sm text-slate-300">{algo.name}</span>
                      </div>
                      {algorithmStates[algo.id] === "detected" && (
                        <CheckCircle2 className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{algo.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-2xl glass-card">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-violet-400" />
                {t('evidencePackage')}
              </h2>
              
              <p className="text-sm text-slate-400 mb-4">
                {t('evidenceDescription')}
              </p>

              {detectionResults.length > 0 ? (
                <button
                  type="button"
                  onClick={generateEvidence}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 font-medium text-white hover:from-violet-400 hover:to-purple-500 transition-all"
                >
                  {t('generateEvidence')}
                </button>
              ) : (
                <div className="p-4 rounded-lg bg-slate-900/60 border border-slate-800/60 text-center">
                  <p className="text-sm text-slate-500">{t('runScanFirst')}</p>
                </div>
              )}

              {showEvidence && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 p-4 rounded-lg bg-slate-900/60 border border-violet-500/30"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">{t('evidenceGenerated')}</span>
                  </div>
                  <div className="text-xs font-mono text-slate-400 space-y-1">
                    <p>{"{"}</p>
                    <p className="pl-4">"evidence_id": "ev_7x9k2m3n",</p>
                    <p className="pl-4">"timestamp": "{new Date().toISOString()}",</p>
                    <p className="pl-4">"detections": [{detectionResults.length}],</p>
                    <p className="pl-4">"merkle_root": "0x8f3a...b7c2",</p>
                    <p className="pl-4">"export_formats": ["JSON", "PDF", "ZIP"]</p>
                    <p>{"}"}</p>
                  </div>
                </motion.div>
              )}
            </div>

            <div className="p-6 rounded-2xl glass-card">
              <h2 className="text-xl font-bold mb-4">{t('detectionPipeline')}</h2>
              <div className="flex items-center justify-between text-sm">
                <div className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center mx-auto mb-2">
                    <span className="text-slate-400 text-xs">{t('userData')}</span>
                  </div>
                  <p className="text-slate-500 text-xs">{t('userData')}</p>
                </div>
                <div className="flex-1 h-0.5 bg-slate-700 mx-1" />
                <div className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center mx-auto mb-2">
                    <Radar className="w-4 h-4 text-red-400" />
                  </div>
                  <p className="text-slate-500 text-xs">{t('algos')}</p>
                </div>
                <div className="flex-1 h-0.5 bg-slate-700 mx-1" />
                <div className="text-center">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center mx-auto mb-2">
                    <FileCheck className="w-4 h-4 text-violet-400" />
                  </div>
                  <p className="text-slate-500 text-xs">{t('evidence')}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}