import { LayerBudget, BudgetConfig, BudgetResult } from '@/types/demo';

export function calculateContextBudget(config: BudgetConfig): BudgetResult {
  const BASE_LAYERS: LayerBudget[] = [
    { id: 'L0', label: 'Identity Core', maxTokens: 500, priority: 'LOCKED' },
    { id: 'L1', label: 'Response Style', maxTokens: 800, priority: 'HIGH' },
    { id: 'L2', label: 'Topic Context', maxTokens: 3000, priority: 'HIGH' },
    { id: 'L3', label: 'Entity Context', maxTokens: 2000, priority: 'MEDIUM' },
    { id: 'L4', label: 'Conversation Arc', maxTokens: 4000, priority: 'HIGH' },
    { id: 'L5', label: 'JIT Retrieval', maxTokens: 2000, priority: 'MEDIUM' },
    { id: 'L6', label: 'Message History', maxTokens: 10000, priority: 'STANDARD' },
    { id: 'L7', label: 'Live Input', maxTokens: 500, priority: 'LOCKED' },
  ];

  const activeLayers = BASE_LAYERS.filter(layer => {
    if (layer.id === 'L0' && !config.privacy.includeIdentity) return false;
    if (layer.id === 'L2' && !config.privacy.includeTopic) return false;
    if (layer.id === 'L3' && !config.privacy.includeEntity) return false;
    if (layer.id === 'L4' && !config.privacy.includeArc) return false;
    if (layer.id === 'L5' && !config.privacy.includeJIT) return false;
    return true;
  });

  const layersWithTokens = activeLayers.map(layer => {
    const customBudget = config.layers[layer.id];
    const tokens = customBudget !== undefined
      ? Math.min(customBudget, layer.maxTokens)
      : Math.floor(layer.maxTokens * (0.3 + Math.random() * 0.4));

    return { ...layer, tokens } as LayerBudget;
  });

  const totalTokens = layersWithTokens.reduce((sum, layer) => sum + (layer.tokens || 0), 0);
  const efficiencyScore = Math.min(100, Math.max(0,
    100 - Math.abs((totalTokens - config.totalBudget) / config.totalBudget * 100)
  ));

  return {
    layers: layersWithTokens,
    totalTokens,
    efficiencyScore,
    overBudget: totalTokens > config.totalBudget,
  };
}
