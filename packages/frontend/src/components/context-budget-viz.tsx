'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

const DEFAULT_BUDGETS = {
  L0: 300, L1: 500, L2: 1500, L3: 1000,
  L4: 2000, L5: 2500, L6: 3500, L7: 700,
};

const LAYER_META = {
  L0: { label: 'Identity Core', color: '#8B5CF6', max: 600 },
  L1: { label: 'Global Preferences', color: '#06B6D4', max: 1000 },
  L2: { label: 'Topic Context', color: '#EC4899', max: 3000 },
  L3: { label: 'Entity Context', color: '#8B5CF6', max: 2000 },
  L4: { label: 'Conversation Arc', color: '#06B6D4', max: 4000 },
  L5: { label: 'JIT Retrieval', color: '#10B981', max: 5000 },
  L6: { label: 'Message History', color: '#F59E0B', max: 6000 },
  L7: { label: 'User Message', color: '#EF4444', max: 2000 },
};

export function ContextBudgetViz() {
  const [budgets, setBudgets] = useState(DEFAULT_BUDGETS);
  const total = useMemo(() => Object.values(budgets).reduce((a, b) => a + b, 0), [budgets]);
  const MAX_TOTAL = 16000;
  const efficiency = Math.min(100, Math.round((1 - Math.abs(total - 12000) / 12000) * 100));

  return (
    <div className="rounded-2xl bg-slate-800/50 border border-slate-700/50 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-white">Interactive Context Builder</h3>
        <div className="text-right">
          <div className="text-2xl font-mono font-bold text-cyan-400">{total.toLocaleString()}</div>
          <div className="text-xs text-slate-500">/ {MAX_TOTAL.toLocaleString()} tokens</div>
        </div>
      </div>

      <div className="mb-6 p-3 rounded-xl bg-slate-900/50 border border-slate-700/30">
        <div className="flex justify-between text-xs mb-2">
          <span className="text-slate-400">Context Efficiency</span>
          <span className={`font-bold ${efficiency > 70 ? 'text-emerald-400' : efficiency > 40 ? 'text-amber-400' : 'text-red-400'}`}>
            {efficiency}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-700">
          <motion.div
            className="h-full rounded-full"
            style={{ background: `linear-gradient(90deg, #8B5CF6, ${efficiency > 70 ? '#10B981' : efficiency > 40 ? '#F59E0B' : '#EF4444'})` }}
            animate={{ width: `${efficiency}%` }}
            transition={{ type: 'spring', stiffness: 100 }}
          />
        </div>
      </div>

      <div className="space-y-3">
        {(Object.keys(budgets) as Array<keyof typeof budgets>).map(layer => {
          const meta = LAYER_META[layer];
          const pct = (budgets[layer] / meta.max) * 100;
          return (
            <div key={layer} className="grid grid-cols-[60px_1fr_70px] items-center gap-3">
              <div className="text-xs font-mono font-bold" style={{ color: meta.color }}>
                {layer}
              </div>
              <div className="relative h-1.5 bg-slate-700 rounded-full">
                <motion.div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{ width: `${pct}%`, background: meta.color }}
                />
                <input
                  type="range"
                  min="0"
                  max={meta.max}
                  value={budgets[layer]}
                  onChange={e => setBudgets(prev => ({ ...prev, [layer]: +e.target.value }))}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full"
                />
              </div>
              <div className="text-xs text-slate-400 font-mono text-right">
                ~{budgets[layer].toLocaleString()}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-xs text-slate-500 text-center">
        Drag sliders to see how VIVIM balances your context budget
      </div>
    </div>
  );
}