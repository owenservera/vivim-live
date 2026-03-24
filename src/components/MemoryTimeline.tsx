import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ExtractedMemory, MEMORY_TYPES } from '@/types/memory';
import { MemoryType } from '@/types/memory';

interface MemoryTimelineProps {
  memories: ExtractedMemory[];
  filter?: MemoryType | 'ALL';
}

export function MemoryTimeline({ memories, filter = 'ALL' }: MemoryTimelineProps) {
  const filteredMemories = useMemo(() => {
    if (filter === 'ALL') return memories;
    return memories.filter((m) => m.type === filter);
  }, [memories, filter]);

  const groupedByTime = useMemo(() => {
    const groups = new Map<string, ExtractedMemory[]>();
    filteredMemories.forEach((mem) => {
      const timeKey = new Date(mem.timestamp || Date.now()).toDateString();
      if (!groups.has(timeKey)) groups.set(timeKey, []);
      groups.get(timeKey)!.push(mem);
    });
    return Array.from(groups.entries());
  }, [filteredMemories]);

  return (
    <div className="space-y-4">
      {groupedByTime.map(([date, dayMemories], groupIndex) => (
        <motion.div
          key={date}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: groupIndex * 0.1 }}
        >
          <div className="text-xs font-medium text-slate-400 mb-2">{date}</div>
          <div className="relative pl-4 border-l-2 border-slate-700">
            {dayMemories.map((mem, memIndex) => {
              const meta = MEMORY_TYPES[mem.type];

              return (
                <motion.div
                  key={mem.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: memIndex * 0.08 }}
                  className="relative mb-3"
                >
                  <div
                    className={`absolute -left-4 top-0 w-2 h-full rounded-full ${meta.bg}`}
                  />
                  <div className={`p-3 rounded-lg border text-xs ${meta.bg} ${meta.border}`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-mono font-bold tracking-wide ${meta.color}`}>
                        {meta.label}
                      </span>
                      <span className="text-slate-500">
                        {Math.round(mem.confidence * 100)}% conf
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">{mem.content}</p>
                    {mem.connections.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {mem.connections.map((conn, connIndex) => (
                          <span
                            key={conn}
                            className="px-1.5 py-0.5 rounded bg-white/10 text-slate-500 text-[10px]"
                          >
                            {conn}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
