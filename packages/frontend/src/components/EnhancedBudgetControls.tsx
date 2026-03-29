import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Lock, Loader2 } from 'lucide-react';
import { calculateContextBudget } from '@/demo-engine/contextBudgetCalculator';
import { BudgetConfig, BudgetResult } from '@/types/demo';

const BASE_LAYERS = [
  { id: 'L0', label: 'Identity Core',     color: '#8B5CF6', tokens: 280,  max: 500,  locked: true  },
  { id: 'L1', label: 'Response Style',    color: '#6366F1', tokens: 340,  max: 800,  locked: false },
  { id: 'L2', label: 'Topic Context',     color: '#06B6D4', tokens: 1500, max: 3000, locked: false },
  { id: 'L3', label: 'Entity Context',    color: '#EC4899', tokens: 800,  max: 1200, locked: false },
  { id: 'L4', label: 'Conversation Arc',  color: '#10B981', tokens: 1200, max: 2000, locked: false },
  { id: 'L5', label: 'JIT Retrieval',     color: '#F59E0B', tokens: 600,  max: 2000, locked: false },
  { id: 'L6', label: 'Message History',   color: '#3B82F6', tokens: 7100, max: 10000, locked: false},
  { id: 'L7', label: 'Your Message',      color: '#F1F5F9', tokens: 280,  max: 500, locked: true  },
];

interface ContextRecipe {
  id: string;
  name: string;
  description?: string;
  layerWeights?: Record<string, number>;
}

interface EnhancedBudgetControlsProps {
  onBudgetChange?: (result: BudgetResult) => void;
  userId?: string;
}

export function EnhancedBudgetControls({ onBudgetChange, userId }: EnhancedBudgetControlsProps) {
  const [budgets, setBudgets] = useState<Record<string, number>>(
    Object.fromEntries(BASE_LAYERS.map((l) => [l.id, l.tokens]))
  );
  const [depth, setDepth] = useState<'minimal' | 'standard' | 'deep'>('standard');
  const [privacy, setPrivacy] = useState({
    identity: true,
    topic: true,
    entity: true,
    arc: true,
    jit: true,
  });

  const [budgetResult, setBudgetResult] = useState<BudgetResult | null>(null);
  const [recipes, setRecipes] = useState<ContextRecipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<string>('default');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchRecipes() {
      if (!userId) return;
      try {
        const res = await fetch(`/api/v2/context-recipes?userId=${userId}`);
        const data = await res.json();
        if (data.recipes) {
          setRecipes(data.recipes);
          const defaultRecipe = data.recipes.find((r: ContextRecipe) => r.name === 'Standard');
          if (defaultRecipe) setSelectedRecipe(defaultRecipe.id);
        }
      } catch (err) {
        console.error('Failed to fetch recipes:', err);
      }
    }
    fetchRecipes();
  }, [userId]);

  const handleRecipeChange = async (recipeId: string) => {
    if (!userId) return;
    setLoading(true);
    setSelectedRecipe(recipeId);
    try {
      await fetch(`/api/v2/context-recipes/${recipeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
    } catch (err) {
      console.error('Failed to save recipe:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const config: BudgetConfig = {
      totalBudget: 12000,
      layers: budgets,
      privacy: {
        includeIdentity: privacy.identity,
        includeTopic: privacy.topic,
        includeEntity: privacy.entity,
        includeArc: privacy.arc,
        includeJIT: privacy.jit,
      },
    };

    const result = calculateContextBudget(config);
    setBudgetResult(result);
    onBudgetChange?.(result);
  }, [budgets, privacy, onBudgetChange]);

  const totalUsed = budgetResult?.totalTokens || 0;
  const totalMax = 50000;

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-white">Context Budget</h4>
            <div className="text-right">
              <span className="text-sm font-mono text-cyan-400">
                {totalUsed.toLocaleString()}
              </span>
              <span className="text-xs text-slate-600">
                {' '} / {totalMax.toLocaleString()} t
              </span>
            </div>
          </div>

          {budgetResult && (
            <div className="mb-4 p-3 rounded-xl bg-slate-800/40 border border-white/5">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Efficiency Score</span>
                <span className={`font-bold ${
                  budgetResult.efficiencyScore > 70 ? 'text-emerald-400' :
                  budgetResult.efficiencyScore > 40 ? 'text-amber-400' : 'text-red-400'
                }`}>
                  {Math.round(budgetResult.efficiencyScore)}%
                </span>
              </div>
              <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                  animate={{ width: `${budgetResult.efficiencyScore}%` }}
                  transition={{ type: 'spring', stiffness: 80 }}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            {BASE_LAYERS.map((layer) => {
              const val = budgets[layer.id];
              const max = layer.max;
              const pct = val / max;
              const isLocked = layer.locked;
              const isActive = privacy[layer.id.toLowerCase() as keyof typeof privacy];

              return (
                <div key={layer.id} className="grid grid-cols-[56px_1fr_52px] items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    {isLocked && <Lock className="w-2.5 h-2.5 text-slate-600" />}
                    <span className="text-[10px] font-mono font-bold" style={{ color: layer.color }}>
                      {layer.id}
                    </span>
                  </div>
                  <div className="relative h-1.5 bg-slate-700 rounded-full group">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full transition-all duration-100"
                      style={{
                        width: `${pct * 100}%`,
                        backgroundColor: isActive ? layer.color : '#475569',
                        opacity: isActive ? 1 : 0.4,
                      }}
                    />
                    {!isLocked && (
                      <input
                        type="range"
                        min={0}
                        max={max}
                        value={val}
                        onChange={(e) => setBudgets((prev) => ({ ...prev, [layer.id]: Number(e.target.value) }))}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full"
                        disabled={!isActive}
                      />
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 text-right">
                    {val >= 1000 ? `${(val / 1000).toFixed(1)}K` : val}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-2">Knowledge Depth</h4>
          <div className="flex gap-2">
            {(['minimal', 'standard', 'deep'] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDepth(d)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize border transition-all ${
                  depth === d
                    ? 'bg-violet-600/30 border-violet-500/50 text-violet-300'
                    : 'bg-slate-800/40 border-white/5 text-slate-500 hover:text-slate-300'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {recipes.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-white mb-2">Context Recipe</h4>
            <div className="relative">
              <select
                value={selectedRecipe}
                onChange={(e) => handleRecipeChange(e.target.value)}
                disabled={loading}
                className="w-full py-2 px-3 rounded-lg bg-slate-800/40 border border-white/5 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-50"
              >
                {recipes.map((recipe) => (
                  <option key={recipe.id} value={recipe.id}>
                    {recipe.name}
                  </option>
                ))}
              </select>
              {loading && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-violet-400" />
              )}
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Privacy Controls</h4>
          <div className="space-y-2">
            {[
              { key: 'identity', label: 'Include Identity Core' },
              { key: 'topic', label: 'Include Topic Context' },
              { key: 'entity', label: 'Include Entity Profiles' },
              { key: 'arc', label: 'Include Conversation Arc' },
              { key: 'jit', label: 'Include JIT Retrieval' },
            ].map((item) => {
              const isChecked = privacy[item.key as keyof typeof privacy];
              return (
                <label key={item.key} className="flex items-center gap-3 cursor-pointer group">
                  <button
                    type="button"
                    onClick={() => setPrivacy((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }))}
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                      isChecked ? 'bg-violet-600 border-violet-500' : 'border-slate-600 bg-transparent'
                    }`}
                  >
                    {isChecked && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                  </button>
                  <span className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                    {item.label}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {budgetResult && (
          <>
            <div className="rounded-xl bg-slate-800/40 border border-white/5 p-3">
              <h4 className="text-xs font-semibold text-slate-400 mb-2">Assembly Stats</h4>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'Assembly time', value: '112ms', color: 'text-emerald-400' },
                  { label: 'Tokens used', value: totalUsed.toLocaleString(), color: 'text-cyan-400' },
                  { label: 'Active layers', value: budgetResult.layers.length.toString(), color: 'text-violet-400' },
                  { label: 'Efficiency', value: `${Math.round(budgetResult.efficiencyScore)}%`, color: budgetResult.efficiencyScore > 70 ? 'text-emerald-400' : 'text-amber-400' },
                ].map((stat) => (
                  <div key={stat.label} className="p-2 rounded-lg bg-slate-900/40">
                    <p className={`text-sm font-mono font-bold ${stat.color}`}>{stat.value}</p>
                    <p className="text-[10px] text-slate-600 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {budgetResult.overBudget && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                <p className="text-xs text-red-400">
                  ⚠️ Warning: Total budget exceeded. Reduce layer allocations.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
