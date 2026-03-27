"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingCart, ArrowLeft, DollarSign, Shield, CheckCircle2, Tag, Users, Key } from "lucide-react";
import Link from "next/link";

const MOCK_LISTINGS = [
  { id: "1", title: "Python ML Patterns", description: "60 conversations about machine learning workflows", price: 450, buyer: "AI Research Lab" },
  { id: "2", title: "Startup Strategy Sessions", description: "15 hours of business planning discussions", price: 280, buyer: "Consulting Firm" },
  { id: "3", title: "Technical Architecture Docs", description: "System design conversations", price: 620, buyer: "Enterprise Corp" },
];

const PRICING_MODELS = [
  { id: "fixed", label: "Fixed Price", desc: "Set price and wait for buyers" },
  { id: "auction", label: "Vickrey Auction", desc: "Highest bidder wins" },
  { id: "subscription", label: "Subscription", desc: "Ongoing access" },
  { id: "bonding", label: "Bonding Curve", desc: "Price adjusts with demand" },
];

export default function MarketplaceDemoPage() {
  const [step, setStep] = useState<"select" | "create" | "purchase" | "complete">("select");
  const [selectedListing, setSelectedListing] = useState<typeof MOCK_LISTINGS[0] | null>(null);
  const [salePrice, setSalePrice] = useState(1000);
  const [pricingModel, setPricingModel] = useState("fixed");
  const [purchaseStep, setPurchaseStep] = useState(0);

  const platformFee = salePrice * 0.15;
  const remaining = salePrice - platformFee;
  const humanShare = remaining * 0.6;
  const companyShare = remaining * 0.4;

  function handleSelect(listing: typeof MOCK_LISTINGS[0]) {
    setSelectedListing(listing);
    setStep("purchase");
    setPurchaseStep(0);
    setTimeout(() => setPurchaseStep(1), 1000);
    setTimeout(() => setPurchaseStep(2), 2000);
    setTimeout(() => setPurchaseStep(3), 3000);
  }

  function handleCreateListing() {
    setStep("complete");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-emerald-500/30 mb-6">
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-slate-300">Interactive Demo</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            The <span className="text-emerald-400">Marketplace</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            Monetize your intelligence — sell data on your terms with zero-knowledge proofs.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {step === "select" && (
              <div className="p-6 rounded-2xl glass-card">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-emerald-400" />
                  Browse Listings
                </h2>
                <div className="space-y-3">
                  {MOCK_LISTINGS.map((listing) => (
                    <button
                      key={listing.id}
                      type="button"
                      onClick={() => handleSelect(listing)}
                      className="w-full p-4 rounded-xl bg-slate-900/60 border border-slate-800/60 hover:border-emerald-500/30 transition-colors text-left"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white font-medium">{listing.title}</h3>
                        <span className="text-emerald-400 font-mono">${listing.price}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-2">{listing.description}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Users className="w-3 h-3" />
                        <span>{listing.buyer}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === "purchase" && selectedListing && (
              <div className="p-6 rounded-2xl glass-card">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-400" />
                  Purchase Flow
                </h2>
                
                <div className="space-y-4 mb-6">
                  {[
                    { num: 1, label: "Select Listing", status: purchaseStep >= 0 ? "complete" : "pending" },
                    { num: 2, label: "Escrow Payment", status: purchaseStep >= 1 ? "complete" : "pending" },
                    { num: 3, label: "Encrypted Delivery", status: purchaseStep >= 2 ? "complete" : "pending" },
                    { num: 4, label: "Verify & Complete", status: purchaseStep >= 3 ? "complete" : "pending" },
                  ].map((s) => (
                    <div key={s.num} className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        s.status === "complete" 
                          ? "bg-emerald-500/20 text-emerald-400" 
                          : s.status === "current"
                          ? "bg-orange-500/20 text-orange-400 animate-pulse"
                          : "bg-slate-800 text-slate-500"
                      }`}>
                        {s.status === "complete" ? <CheckCircle2 className="w-4 h-4" /> : s.num}
                      </div>
                      <span className={`text-sm ${s.status === "complete" ? "text-slate-300" : "text-slate-500"}`}>
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>

                {purchaseStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/30"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm text-emerald-400 font-medium">Purchase Complete!</span>
                    </div>
                    <p className="text-xs text-slate-400">
                      You now have encrypted access to "{selectedListing.title}"
                    </p>
                  </motion.div>
                )}
              </div>
            )}

            {step === "create" && (
              <div className="p-6 rounded-2xl glass-card">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5 text-emerald-400" />
                  Create Listing
                </h2>
                
                <div className="mb-4">
                  <label className="text-sm text-slate-400 mb-2 block">Sale Price ($)</label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(Number(e.target.value))}
                    className="w-full p-3 rounded-lg bg-slate-900/60 border border-slate-800/60 text-white"
                  />
                </div>

                <div className="mb-4">
                  <label className="text-sm text-slate-400 mb-2 block">Pricing Model</label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRICING_MODELS.map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => setPricingModel(model.id)}
                        className={`p-3 rounded-lg text-left text-sm transition-colors ${
                          pricingModel === model.id 
                            ? "bg-emerald-500/20 border border-emerald-500/30 text-emerald-400"
                            : "bg-slate-900/60 border border-slate-800/60 text-slate-400"
                        }`}
                      >
                        <div className="font-medium">{model.label}</div>
                        <div className="text-xs text-slate-500">{model.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCreateListing}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 font-medium text-white hover:from-emerald-400 hover:to-teal-500 transition-all"
                >
                  Publish Listing
                </button>
              </div>
            )}

            {step === "complete" && (
              <div className="p-6 rounded-2xl glass-card text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </motion.div>
                <h2 className="text-xl font-bold mb-2">Listing Published!</h2>
                <p className="text-sm text-slate-400 mb-4">
                  Your data is now available for purchase with ZK proofs.
                </p>
                <button
                  type="button"
                  onClick={() => setStep("select")}
                  className="text-emerald-400 text-sm hover:underline"
                >
                  Back to Browse
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-2xl glass-card">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-400" />
                Revenue Calculator
              </h2>
              
              <div className="mb-4">
                <label className="text-sm text-slate-400 mb-2 block">Sale Price: ${salePrice}</label>
                <input
                  type="range"
                  min="100"
                  max="10000"
                  value={salePrice}
                  onChange={(e) => setSalePrice(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/60 border border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="w-4 h-4 text-slate-500" />
                    <span className="text-sm text-slate-400">Platform (15%)</span>
                  </div>
                  <span className="text-white font-mono">${platformFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/60 border border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-slate-400">Human (60% × 40%)</span>
                  </div>
                  <span className="text-emerald-400 font-mono">${humanShare.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-slate-900/60 border border-slate-800/60">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-slate-400">Company (60% × 40%)</span>
                  </div>
                  <span className="text-amber-400 font-mono">${companyShare.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
                  <span className="text-sm text-white font-medium">Total</span>
                  <span className="text-white font-mono">${salePrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl glass-card">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                Zero-Knowledge Proofs
              </h2>
              
              <div className="space-y-3">
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">Ownership Proof</span>
                  </div>
                  <p className="text-xs text-slate-500">Prove you own the data without revealing it</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">Consent Validity</span>
                  </div>
                  <p className="text-xs text-slate-500">Prove valid consent exists for the data</p>
                </div>
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-400">Data Property Attestation</span>
                  </div>
                  <p className="text-xs text-slate-500">Prove data properties without exposure</p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl glass-card">
              <h2 className="text-xl font-bold mb-4">Marketplace Flow</h2>
              <div className="flex items-center justify-between text-sm">
                {[
                  { label: "List", icon: Tag },
                  { label: "Discover", icon: ShoppingCart },
                  { label: "Purchase", icon: DollarSign },
                  { label: "Exchange", icon: Shield },
                  { label: "Verify", icon: CheckCircle2 },
                ].map((s, i) => (
                  <div key={s.label} className="text-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 ${
                      step === "complete" && i <= 4 ? "bg-emerald-500/20" : "bg-slate-800"
                    }`}>
                      <s.icon className={`w-4 h-4 ${step === "complete" && i <= 4 ? "text-emerald-400" : "text-slate-500"}`} />
                    </div>
                    <span className="text-xs text-slate-500">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button
            type="button"
            onClick={() => setStep("create")}
            className="px-6 py-3 rounded-xl border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 transition-colors"
          >
            Create New Listing
          </button>
        </div>
      </div>
    </div>
  );
}