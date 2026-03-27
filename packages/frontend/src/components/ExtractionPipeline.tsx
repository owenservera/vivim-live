import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ExtractionStage {
  id: string;
  name: string;
  status: 'pending' | 'active' | 'complete';
  icon: string;
}

const EXTRACTION_STAGES: ExtractionStage[] = [
  { id: 'segment', name: 'Segmenting conversation', status: 'pending', icon: '✂️' },
  { id: 'classify', name: 'Classifying ACU type', status: 'pending', icon: '🏷️' },
  { id: 'extract', name: 'Extracting entities', status: 'pending', icon: '🔍' },
  { id: 'embed', name: 'Generating embeddings', status: 'pending', icon: '📊' },
  { id: 'store', name: 'Storing in database', status: 'pending', icon: '💾' },
];

interface ExtractionPipelineProps {
  active: boolean;
  onComplete?: () => void;
}

export function ExtractionPipeline({ active, onComplete }: ExtractionPipelineProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!active) {
      setCurrentStage(0);
      setIsComplete(false);
      return;
    }

    let stage = 0;
    const interval = setInterval(() => {
      stage++;
      setCurrentStage(Math.min(stage, EXTRACTION_STAGES.length - 1));

      if (stage >= EXTRACTION_STAGES.length) {
        clearInterval(interval);
        setIsComplete(true);
        setTimeout(() => onComplete?.(), 300);
      }
    }, 400);

    return () => clearInterval(interval);
  }, [active, onComplete]);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {EXTRACTION_STAGES.map((stage, i) => (
        <motion.div
          key={stage.id}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: i === currentStage ? 1 : 0.4,
            scale: i === currentStage ? 1 : 0.9,
          }}
          transition={{ duration: 0.3 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs"
          style={{
            borderColor: i === currentStage ? '#F59E0B' : '#334155',
            backgroundColor: i === currentStage ? '#F59E0B15' : '#1e293b20',
          }}
        >
          <span className="text-lg">{stage.icon}</span>
          <span className="text-slate-300">{stage.name}</span>
          {i === currentStage && isComplete && (
            <motion.div
              className="w-2 h-2 rounded-full bg-emerald-400 ml-auto"
              initial={{ scale: [1, 1.2, 1] }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
          {i === currentStage && !isComplete && (
            <motion.div
              className="w-2 h-2 rounded-full bg-amber-400 ml-auto"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
        </motion.div>
      ))}
    </div>
  );
}
