'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Sparkles, GitBranch, Zap, Target, Layers, ArrowRight, RefreshCw } from 'lucide-react';

type MemoryType = 'EPISODIC' | 'SEMANTIC' | 'PROCEDURAL' | 'FACTUAL' | 'PREFERENCE' | 'IDENTITY';

type ExtractedMemory = {
  id: string;
  content: string;
  type: MemoryType;
  confidence: number;
  connections: string[];
};

const MEMORY_TYPES: Record<MemoryType, { label: string; color: string; bg: string }> = {
  EPISODIC: { label: 'Episodic', color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30' },
  SEMANTIC: { label: 'Semantic', color: 'text-cyan-400', bg: 'bg-cyan-500/15 border-cyan-500/30' },
  PROCEDURAL: { label: 'Procedural', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30' },
  FACTUAL: { label: 'Factual', color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30' },
  PREFERENCE: { label: 'Preference', color: 'text-violet-400', bg: 'bg-violet-500/15 border-violet-500/30' },
  IDENTITY: { label: 'Identity', color: 'text-rose-400', bg: 'bg-rose-500/15 border-rose-500/30' },
};

const EXTRACTION_FLOWS = [
  {
    input: "I'm building a REST API with Node.js and need authentication",
    memories: [
      { content: 'Building REST API with Node.js', type: 'IDENTITY' as MemoryType, confidence: 0.94, connections: ['Node.js', 'REST API'] },
      { content: 'Express.js framework preference', type: 'PREFERENCE' as MemoryType, confidence: 0.97, connections: ['Express.js'] },
      { content: 'Authentication implementation needed', type: 'GOAL' as MemoryType, confidence: 0.89, connections: ['Security', 'JWT'] },
    ],
    contextAssembled: {
      relevantMemories: 12,
      contextTokens: 2400,
      prediction: 'Will need auth middleware pattern'
    }
  },
  {
    input: "Use bcrypt with cost factor 12 for password hashing",
    memories: [
      { content: 'bcrypt for password hashing', type: 'PROCEDURAL' as MemoryType, confidence: 0.99, connections: ['bcrypt', 'Security'] },
      { content: 'Cost factor 12 for passwords', type: 'FACTUAL' as MemoryType, confidence: 0.98, connections: ['Security Standards'] },
    ],
    contextAssembled: {
      relevantMemories: 8,
      contextTokens: 1800,
      prediction: 'Security standards established'
    }
  }
];

export function DynamicIntelligenceDemo() {
  const [activeTab, setActiveTab] = useState<'extraction' | 'context' | 'graph'>('extraction');
  const [input, setInput] = useState('');
  const [memories, setMemories] = useState<ExtractedMemory[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [flowIndex, setFlowIndex] = useState(0);
  const [contextStats, setContextStats] = useState({ relevantMemories: 0, contextTokens: 0, prediction: '' });
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleExtract = () => {
    const flow = EXTRACTION_FLOWS[flowIndex];
    const userInput = input || flow.input;
    
    setInput('');
    setIsExtracting(true);

    setTimeout(() => {
      const newMemories = flow.memories.map(m => ({
        ...m,
        id: Math.random().toString(36).slice(2),
      }));
      setMemories(prev => [...prev, ...newMemories]);
      setContextStats(flow.contextAssembled);
      setIsExtracting(false);
      setFlowIndex((flowIndex + 1) % EXTRACTION_FLOWS.length);
    }, 1200);
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-900/50">
      <div className="flex border-b border-white/5">
        {[
          { id: 'extraction', label: 'Memory Extraction', icon: Brain },
          { id: 'context', label: 'Context Assembly', icon: Layers },
          { id: 'graph', label: 'Knowledge Graph', icon: GitBranch },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 text-xs font-medium transition-colors ${
              activeTab === tab.id 
                ? 'bg-violet-600/20 text-violet-400 border-b-2 border-violet-500' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === 'extraction' && (
          <div className="space-y-4">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                aria-label="Describe what you're working on"
                onKeyDown={e => e.key === 'Enter' && handleExtract()}
                placeholder="Describe what you're working on..."
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-violet-500/50"
              />
              <button
                type="button"
                onClick={handleExtract}
                disabled={isExtracting}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-violet-600 text-white disabled:opacity-40"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {isExtracting && (
              <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
                <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
                <span className="text-sm text-slate-400">Extracting memories from conversation...</span>
              </div>
            )}

            <div className="space-y-2">
              <AnimatePresence>
                {memories.map((mem, i) => (
                  <motion.div
                    key={mem.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`p-3 rounded-lg border text-xs ${MEMORY_TYPES[mem.type].bg}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-mono font-bold ${MEMORY_TYPES[mem.type].color}`}>
                        {MEMORY_TYPES[mem.type].label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">{Math.round(mem.confidence * 100)}% conf</span>
                        <div className="w-16 h-1 bg-slate-700 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ width: `${mem.confidence * 100}%`, backgroundColor: MEMORY_TYPES[mem.type].color.replace('text-', '') }}
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-slate-300 mb-2">{mem.content}</p>
                    {mem.connections.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {mem.connections.map(conn => (
                          <span key={conn} className="px-1.5 py-0.5 rounded bg-white/10 text-slate-500 text-[10px]">
                            {conn}
                          </span>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {memories.length === 0 && !isExtracting && (
              <div className="text-center py-8 text-slate-500 text-sm">
                <Brain className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p>Type to see automatic memory extraction</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'context' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-violet-600/20 to-cyan-600/20 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-white">Context Assembly Engine</span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-cyan-400">{memories.length || '-'}</div>
                  <div className="text-xs text-slate-500">Memories</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-violet-400">{contextStats.contextTokens || '-'}</div>
                  <div className="text-xs text-slate-500">Tokens</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-emerald-400">{contextStats.relevantMemories || '-'}</div>
                  <div className="text-xs text-slate-500">Relevant</div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-medium text-slate-400">Context Layers</h4>
              {[
                { layer: 'L0', name: 'Identity Core', tokens: 300, max: 600 },
                { layer: 'L1', name: 'Global Preferences', tokens: 500, max: 1000 },
                { layer: 'L2', name: 'Topic Context', tokens: 800, max: 3000 },
                { layer: 'L3', name: 'Entity Context', tokens: 400, max: 2000 },
                { layer: 'L4', name: 'Conversation Arc', tokens: 600, max: 4000 },
              ].map(l => (
                <div key={l.layer} className="flex items-center gap-3 text-xs">
                  <span className="w-8 font-mono text-violet-400">{l.layer}</span>
                  <span className="w-24 text-slate-400 truncate">{l.name}</span>
                  <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
                      style={{ width: `${(l.tokens / l.max) * 100}%` }}
                    />
                  </div>
                  <span className="w-16 text-right text-slate-500">{l.tokens}/{l.max}</span>
                </div>
              ))}
            </div>

            {contextStats.prediction && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-emerald-400">Prediction: {contextStats.prediction}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'graph' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-800/30 border border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <GitBranch className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-medium text-white">Knowledge Graph</span>
              </div>
              
              <div className="relative h-40 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 200 120" role="img" aria-label="Knowledge graph showing connected memories and entities">
                  <defs>
                    <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                      <path d="M0,0 L6,3 L0,6" fill="#64748B" />
                    </marker>
                  </defs>
                  <line x1="100" y1="60" x2="40" y2="30" stroke="#64748B" strokeWidth="1" markerEnd="url(#arrow)" opacity="0.5" />
                  <line x1="100" y1="60" x2="160" y2="30" stroke="#64748B" strokeWidth="1" markerEnd="url(#arrow)" opacity="0.5" />
                  <line x1="40" y1="30" x2="60" y2="90" stroke="#64748B" strokeWidth="1" markerEnd="url(#arrow)" opacity="0.5" />
                  <line x1="160" y1="30" x2="140" y2="90" stroke="#64748B" strokeWidth="1" markerEnd="url(#arrow)" opacity="0.5" />
                  <line x1="100" y1="60" x2="100" y2="100" stroke="#64748B" strokeWidth="1" markerEnd="url(#arrow)" opacity="0.5" />
                  
                  <circle cx="100" cy="60" r="12" fill="#8B5CF6" opacity="0.8" />
                  <text x="100" y="64" textAnchor="middle" fill="white" fontSize="8">You</text>
                  
                  <circle cx="40" cy="30" r="8" fill="#06B6D4" opacity="0.7" />
                  <text x="40" y="34" textAnchor="middle" fill="white" fontSize="7">Express</text>
                  
                  <circle cx="160" cy="30" r="8" fill="#10B981" opacity="0.7" />
                  <text x="160" y="34" textAnchor="middle" fill="white" fontSize="7">PostgreSQL</text>
                  
                  <circle cx="60" cy="90" r="6" fill="#F59E0B" opacity="0.6" />
                  <text x="60" y="93" textAnchor="middle" fill="white" fontSize="6">Auth</text>
                  
                  <circle cx="140" cy="90" r="6" fill="#EC4899" opacity="0.6" />
                  <text x="140" y="93" textAnchor="middle" fill="white" fontSize="6">Schema</text>
                  
                  <circle cx="100" cy="100" r="6" fill="#8B5CF6" opacity="0.6" />
                  <text x="100" y="103" textAnchor="middle" fill="white" fontSize="6">API</text>
                </svg>
              </div>

              <div className="text-xs text-slate-500 text-center">
                {memories.length} memories connected in graph
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}