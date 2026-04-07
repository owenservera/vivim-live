/**
 * Translation-aware data hooks for the home page
 *
 * Replaces hardcoded English arrays with hooks that pull
 * translatable content from the i18n system while keeping
 * visual config (icons, colors) defined once in code.
 */

import type { ComponentType } from 'react';
import {
  Shield, Users, Globe, Download, Code2, Zap,
  Brain, Database, Layers, Target, Sparkles, Timer,
  History, Network, Lock as LockIcon, ShoppingCart,
  Radar, ShieldCheck,
  type LucideIcon,
} from 'lucide-react';

/* ─── Types ─── */

interface TierData {
  label: string;
  desc: string;
}

interface StepData {
  label: string;
  desc: string;
}

interface LayerData {
  label: string;
  desc: string;
  tokens: string;
}

interface MemoryData {
  name: string;
  example: string;
}

interface DemoData {
  title: string;
  desc: string;
}

interface DeveloperData {
  title: string;
  desc: string;
}

interface PrincipleData {
  icon: ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  color: string;
}

interface SolutionFeature {
  icon: LucideIcon;
  title: string;
  desc: string;
}

interface SentinelAlgorithm {
  id: string;
  name: string;
}

interface RevenueBreak {
  label: string;
  value: string;
  color: string;
}

/* ─── Type-safe translation accessor ─── */

type StringFn = (key: string) => string;
type ArrayFn = (key: string) => string[];

/* ─── Rights Tier Data ─── */

export function useRightsTierData(t: StringFn): Record<string, TierData> {
  return {
    t0: { label: t('tiers.t0.label'), desc: t('tiers.t0.desc') },
    t1: { label: t('tiers.t1.label'), desc: t('tiers.t1.desc') },
    t2: { label: t('tiers.t2.label'), desc: t('tiers.t2.desc') },
    t3: { label: t('tiers.t3.label'), desc: t('tiers.t3.desc') },
    t4: { label: t('tiers.t4.label'), desc: t('tiers.t4.desc') },
    t5: { label: t('tiers.t5.label'), desc: t('tiers.t5.desc') },
  };
}

/* ─── Sentinel Algorithms ─── */

export function useSentinelAlgorithms(t: StringFn): SentinelAlgorithm[] {
  const names = [
    'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'A9', 'A10', 'A11', 'A12', 'A13',
  ];
  const keys = [
    'algorithms.0', 'algorithms.1', 'algorithms.2', 'algorithms.3', 'algorithms.4',
    'algorithms.5', 'algorithms.6', 'algorithms.7', 'algorithms.8', 'algorithms.9',
    'algorithms.10', 'algorithms.11', 'algorithms.12',
  ];
  return keys.map((key, i) => ({
    id: names[i],
    name: t(key),
  }));
}

/* ─── Marketplace Steps ─── */

export function useMarketplaceSteps(t: StringFn): StepData[] {
  return [
    { label: t('steps.step1.label'), desc: t('steps.step1.desc') },
    { label: t('steps.step2.label'), desc: t('steps.step2.desc') },
    { label: t('steps.step3.label'), desc: t('steps.step3.desc') },
    { label: t('steps.step4.label'), desc: t('steps.step4.desc') },
    { label: t('steps.step5.label'), desc: t('steps.step5.desc') },
  ];
}

/* ─── Marketplace Revenue Breaks ─── */

export function useRevenueBreaks(t: StringFn): RevenueBreak[] {
  return [
    { label: t('features.revenue.platform'), value: '$150', color: 'slate' },
    { label: t('features.revenue.human'), value: '$240', color: 'slate' },
    { label: t('features.revenue.company'), value: '$240', color: 'slate' },
    { label: t('features.revenue.totalSale'), value: '$1,000', color: 'emerald' },
  ];
}

/* ─── Context Layers ─── */

export function useContextLayersData(t: StringFn): LayerData[] {
  return [
    { label: t('layers.l0.label'), desc: t('layers.l0.desc'), tokens: t('layers.l0.tokens') },
    { label: t('layers.l1.label'), desc: t('layers.l1.desc'), tokens: t('layers.l1.tokens') },
    { label: t('layers.l2.label'), desc: t('layers.l2.desc'), tokens: t('layers.l2.tokens') },
    { label: t('layers.l3.label'), desc: t('layers.l3.desc'), tokens: t('layers.l3.tokens') },
    { label: t('layers.l4.label'), desc: t('layers.l4.desc'), tokens: t('layers.l4.tokens') },
    { label: t('layers.l5.label'), desc: t('layers.l5.desc'), tokens: t('layers.l5.tokens') },
    { label: t('layers.l6.label'), desc: t('layers.l6.desc'), tokens: t('layers.l6.tokens') },
    { label: t('layers.l7.label'), desc: t('layers.l7.desc'), tokens: t('layers.l7.tokens') },
  ];
}

/* ─── Memory Types ─── */

const MEMORY_ICONS: Record<string, ComponentType<{ className?: string }>> = {
  episodic: Timer,
  semantic: Database,
  procedural: Sparkles,
  factual: Target,
  preference: Sparkles,
  identity: Brain,
  relationship: Users,
  goal: Target,
  project: Layers,
};

const MEMORY_COLORS: Record<string, string> = {
  episodic: 'from-violet-500 to-purple-600',
  semantic: 'from-cyan-500 to-blue-600',
  procedural: 'from-emerald-500 to-teal-600',
  factual: 'from-amber-500 to-orange-600',
  preference: 'from-rose-500 to-pink-600',
  identity: 'from-indigo-500 to-blue-600',
  relationship: 'from-fuchsia-500 to-pink-600',
  goal: 'from-lime-500 to-green-600',
  project: 'from-sky-500 to-cyan-600',
};

export function useMemoryTypesData(t: StringFn): {
  icon: ComponentType<{ className?: string }>;
  name: string;
  example: string;
  color: string;
}[] {
  const keys = ['episodic', 'semantic', 'procedural', 'factual', 'preference', 'identity', 'relationship', 'goal', 'project'];
  return keys.map((key) => ({
    icon: MEMORY_ICONS[key] || Brain,
    name: t(`types.${key}.name`),
    example: t(`types.${key}.example`),
    color: MEMORY_COLORS[key] || 'from-slate-500 to-gray-600',
  }));
}

/* ─── Demo Data ─── */

const DEMO_ICONS: Record<string, LucideIcon> = {
  liveMemory: Brain,
  contextEngine: Layers,
  zeroKnowledgePrivacy: LockIcon,
  sovereignHistory: History,
  decentralizedNetwork: Network,
  secureCollaboration: Users,
  dynamicIntelligence: Zap,
  rightsLayer: ShieldCheck,
  sentinelDetection: Radar,
  marketplace: ShoppingCart,
};

const DEMO_COLORS: Record<string, string> = {
  liveMemory: 'from-violet-500 to-purple-600',
  contextEngine: 'from-cyan-500 to-blue-600',
  zeroKnowledgePrivacy: 'from-emerald-500 to-teal-600',
  sovereignHistory: 'from-amber-500 to-orange-600',
  decentralizedNetwork: 'from-blue-500 to-indigo-600',
  secureCollaboration: 'from-rose-500 to-pink-600',
  dynamicIntelligence: 'from-lime-500 to-green-600',
  rightsLayer: 'from-amber-500 to-orange-600',
  sentinelDetection: 'from-red-500 to-rose-600',
  marketplace: 'from-emerald-500 to-teal-600',
};

export function useDemoData(t: StringFn): {
  slug: string;
  title: string;
  desc: string;
  icon: LucideIcon;
  color: string;
}[] {
  const keys = [
    'liveMemory', 'contextEngine', 'zeroKnowledgePrivacy', 'sovereignHistory',
    'decentralizedNetwork', 'secureCollaboration', 'dynamicIntelligence',
    'rightsLayer', 'sentinelDetection', 'marketplace',
  ];
  return keys.map((key) => ({
    slug: key,
    title: t(`items.${key}.title`),
    desc: t(`items.${key}.desc`),
    icon: DEMO_ICONS[key] || Brain,
    color: DEMO_COLORS[key] || 'from-slate-500 to-gray-600',
  }));
}

/* ─── Developers Data ─── */

export function useDevelopersData(t: StringFn): DeveloperData[] {
  return [
    { title: t('features.identity.title'), desc: t('features.identity.desc') },
    { title: t('features.contextEngine.title'), desc: t('features.contextEngine.desc') },
    { title: t('features.storage.title'), desc: t('features.storage.desc') },
    { title: t('features.zeroKnowledge.title'), desc: t('features.zeroKnowledge.desc') },
  ];
}

/* ─── Principles Data ─── */

const PRINCIPLE_ICONS: Record<string, LucideIcon> = {
  sovereign: Shield,
  personal: Users,
  providerAgnostic: Globe,
  portable: Download,
  useCaseAgnostic: Code2,
  dynamicallyGenerated: Zap,
};

const PRINCIPLE_COLORS: Record<string, string> = {
  sovereign: 'from-violet-500 to-purple-600',
  personal: 'from-cyan-500 to-blue-600',
  providerAgnostic: 'from-emerald-500 to-teal-600',
  portable: 'from-amber-500 to-orange-600',
  useCaseAgnostic: 'from-rose-500 to-pink-600',
  dynamicallyGenerated: 'from-indigo-500 to-blue-600',
};

export function usePrinciplesData(t: StringFn): PrincipleData[] {
  const keys = ['sovereign', 'personal', 'providerAgnostic', 'portable', 'useCaseAgnostic', 'dynamicallyGenerated'];
  return keys.map((key) => ({
    icon: PRINCIPLE_ICONS[key] || Brain,
    title: t(`items.${key}.title`),
    desc: t(`items.${key}.desc`),
    color: PRINCIPLE_COLORS[key] || 'from-slate-500 to-gray-600',
  }));
}

/* ─── Solution Features ─── */

const SOLUTION_ICONS: Record<string, LucideIcon> = {
  remembersEverything: Brain,
  intelligentRetrieval: Target,
  worksWithAnyAi: Globe,
};

export function useSolutionFeatures(t: StringFn): SolutionFeature[] {
  const keys = ['remembersEverything', 'intelligentRetrieval', 'worksWithAnyAi'];
  return keys.map((key) => ({
    icon: SOLUTION_ICONS[key] || Brain,
    title: t(`features.${key}.title`),
    desc: t(`features.${key}.desc`),
  }));
}
