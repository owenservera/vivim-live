import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, RefreshCw } from 'lucide-react';
import { extractFromInput } from '@/demo-engine/mockExtractionEngine';
import { JitAcu } from '@/types/memory';

interface LiveInputTabProps {
  onContextUpdate: (data: { memories: any[], tokens: number, jitAcus: JitAcu[] }) => void;
}

export function LiveInputTab({ onContextUpdate }: LiveInputTabProps) {
  const [input, setInput] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<{
    keywords: string[];
    memories: any[];
    jitAcus: JitAcu[];
  } | null>(null);

  const handleExtract = async () => {
    if (!input.trim() || isExtracting) return;

    setIsExtracting(true);
    setExtractedData(null);

    const result = await extractFromInput(input);

    const memories = result.memories;
    const jitAcus = result.keywords.map((keyword, i) => ({
      id: `jit-${i}`,
      name: `${keyword}.acu`,
      type: 'SEMANTIC',
      confidence: 0.85 + (i * 0.01),
    }));

    const estimatedTokens = 500 + (memories.length * 200) + (jitAcus.length * 150);

    setExtractedData({ keywords: result.keywords, memories, jitAcus });

    setTimeout(() => {
      onContextUpdate({ memories, tokens: estimatedTokens, jitAcus });
    }, 500);

    setIsExtracting(false);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          aria-label="Type a message to assemble context"
          onKeyDown={(e) => e.key === 'Enter' && handleExtract()}
          placeholder="Type any message to see context assemble in real-time..."
          disabled={isExtracting}
          className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-300 placeholder:text-slate-600 outline-none focus:border-violet-500/50 disabled:opacity-50"
        />
        <button
          type="button"
          onClick={handleExtract}
          disabled={!input.trim() || isExtracting}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isExtracting ? (
            <span className="flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Extracting...
            </span>
          ) : (
            'Extract & Build'
          )}
        </button>
      </div>

      <AnimatePresence>
        {extractedData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {extractedData.keywords.length > 0 && (
              <div className="p-3 rounded-lg bg-slate-800/40 border border-white/5">
                <h4 className="text-xs font-medium text-slate-400 mb-2">Extracted Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {extractedData.keywords.map((keyword, i) => (
                    <motion.span
                      key={keyword}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.05 }}
                      className="px-2 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs"
                    >
                      {keyword}
                    </motion.span>
                  ))}
                </div>
              </div>
            )}

            {extractedData.jitAcus.length > 0 && (
              <div className="p-3 rounded-lg bg-slate-800/40 border border-white/5">
                <h4 className="text-xs font-medium text-slate-400 mb-2">JIT Retrieved ACUs</h4>
                <div className="flex flex-wrap gap-2">
                  {extractedData.jitAcus.map((acu, i) => (
                    <motion.div
                      key={acu.id}
                      initial={{ x: 60, opacity: 0, scale: 0.85 }}
                      animate={{ x: 0, opacity: 1, scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 220,
                        damping: 22,
                        delay: i * 0.08,
                      }}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs"
                    >
                      <Zap className="w-3 h-3 text-amber-400 flex-shrink-0" />
                      <span className="text-amber-300 font-mono truncate max-w-[140px]">{acu.name}</span>
                      <span className="text-amber-500 font-mono text-[10px]">
                        {Math.round(acu.confidence * 100)}%
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {extractedData.memories.length > 0 && (
              <div className="p-3 rounded-lg bg-slate-800/40 border border-white/5">
                <h4 className="text-xs font-medium text-slate-400 mb-2">Extracted Memories</h4>
                <div className="space-y-2">
                  {extractedData.memories.map((mem, i) => (
                    <motion.div
                      key={mem.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-2.5 rounded-lg border bg-slate-900/40"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-slate-300">{mem.type}</span>
                        <span className="text-xs text-slate-500">{Math.round(mem.confidence * 100)}%</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{mem.content}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
