import { ExtractedMemory, MEMORY_TYPES } from '@/types/memory';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface GraphNodeDetailProps {
  node: ExtractedMemory | null;
  relatedNodes: ExtractedMemory[];
  onClose: () => void;
}

export function GraphNodeDetail({ node, relatedNodes, onClose }: GraphNodeDetailProps) {
  if (!node) return null;

  const meta = MEMORY_TYPES[node.type];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      className="absolute bottom-4 right-4 w-80 rounded-xl bg-slate-800/90 border border-white/10 p-4"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 p-1 rounded text-slate-400 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      <div className={`flex items-center gap-2 mb-3 px-3 py-2 rounded-lg ${meta.bg} ${meta.border}`}>
        <span className={`font-mono font-bold tracking-wide ${meta.color}`}>
          {meta.label}
        </span>
        <span className="text-slate-500">
          {Math.round(node.confidence * 100)}% conf
        </span>
      </div>

      <p className="text-sm text-slate-300 mb-4 leading-relaxed">{node.content}</p>

      <div className="mb-4">
        <h4 className="text-xs font-medium text-slate-400 mb-2">Connections</h4>
        <div className="flex flex-wrap gap-2">
          {node.connections.map((conn, i) => (
            <motion.span
              key={conn}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className="px-2 py-1 rounded bg-white/10 text-slate-500 text-xs"
            >
              {conn}
            </motion.span>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-xs font-medium text-slate-400 mb-2">Related Memories</h4>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          {relatedNodes.map((mem, i) => {
            const memMeta = MEMORY_TYPES[mem.type];
            return (
              <motion.div
                key={mem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`p-2 rounded-lg border text-xs ${memMeta.bg} ${memMeta.border}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`font-mono font-bold ${memMeta.color}`}>
                    {memMeta.label}
                  </span>
                  <span className="text-slate-500">{Math.round(mem.confidence * 100)}%</span>
                </div>
                <p className="text-slate-400 line-clamp-2">{mem.content}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-full py-2 rounded-lg bg-violet-600/20 text-violet-400 text-sm font-medium border border-violet-500/30"
      >
        View Full Context
      </button>
    </motion.div>
  );
}
