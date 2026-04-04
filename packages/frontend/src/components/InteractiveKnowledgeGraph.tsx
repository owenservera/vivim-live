import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GraphNode, GraphEdge } from '@/types/memory';

interface CameraState {
  x: number;
  y: number;
  zoom: number;
}

export function InteractiveKnowledgeGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [camera, setCamera] = useState<CameraState>({ x: 0, y: 0, zoom: 1 });

  const width = 800;
  const height = 500;

  const generateInitialGraph = useCallback(() => {
    const initialNodes: GraphNode[] = [
      { id: 'you', x: 400, y: 250, radius: 20, color: '#10B981', label: 'You' },
      { id: 'express', x: 250, y: 180, radius: 12, color: '#8B5CF6', label: 'Express.js' },
      { id: 'postgres', x: 500, y: 400, radius: 12, color: '#06B6D4', label: 'PostgreSQL' },
      { id: 'auth', x: 350, y: 350, radius: 8, color: '#F59E0B', label: 'Auth' },
      { id: 'api', x: 420, y: 280, radius: 8, color: '#8B5CF6', label: 'API' },
      { id: 'node', x: 480, y: 320, radius: 8, color: '#EC4899', label: 'Node.js' },
      { id: 'jwt', x: 380, y: 420, radius: 6, color: '#6366F1', label: 'JWT' },
      { id: 'redis', x: 520, y: 200, radius: 6, color: '#EF4444', label: 'Redis' },
    ];

    const initialEdges: GraphEdge[] = [
      { from: 'you', to: 'express', strength: 0.8 },
      { from: 'you', to: 'postgres', strength: 0.6 },
      { from: 'express', to: 'auth', strength: 0.9 },
      { from: 'auth', to: 'api', strength: 0.7 },
      { from: 'api', to: 'node', strength: 0.6 },
      { from: 'api', to: 'jwt', strength: 0.5 },
      { from: 'postgres', to: 'redis', strength: 0.4 },
      { from: 'node', to: 'redis', strength: 0.5 },
    ];

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, []);

  useEffect(() => {
    generateInitialGraph();
  }, [generateInitialGraph]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);

    edges.forEach((edge) => {
      const fromNode = nodes.find((n) => n.id === edge.from);
      const toNode = nodes.find((n) => n.id === edge.to);
      if (!fromNode || !toNode) return;

      ctx.beginPath();
      ctx.moveTo(fromNode.x, fromNode.y);
      ctx.lineTo(toNode.x, toNode.y);

      ctx.strokeStyle = `rgba(100, 116, 139, ${edge.strength})`;
      ctx.lineWidth = 2 * edge.strength;
      ctx.stroke();
    });

    nodes.forEach((node) => {
      const isSelected = node.id === selectedNode;
      const radius = isSelected ? node.radius * 1.2 : node.radius;

      if (isSelected) {
        ctx.shadowColor = node.color;
        ctx.shadowBlur = 20;
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = node.color;
      ctx.fill();

      if (isSelected) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = '12px system-ui';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.label, node.x, node.y + radius + 15);
    });

    ctx.restore();
  }, [nodes, edges, selectedNode, camera]);

  useEffect(() => {
    let animationFrame: number;

    const animate = () => {
      draw();
      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrame);
  }, [draw]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / camera.zoom - camera.x;
    const y = (e.clientY - rect.top) / camera.zoom - camera.y;

    const clicked = nodes.find((node) => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) < node.radius;
    });

    setSelectedNode(clicked?.id || null);
  }, [nodes, camera]);

  const handleCanvasDrag = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const dx = e.movementX;
    const dy = e.movementY;
    setCamera((prev) => {
      const newCamera = { ...prev, x: prev.x + dx, y: prev.y + dy };
      return newCamera;
    });
  }, []);

  const handleZoom = useCallback((delta: number) => {
    setCamera((prev) => {
      const newCamera = { ...prev, zoom: Math.max(0.5, Math.min(2, prev.zoom + delta)) };
      return newCamera;
    });
  }, []);

  return (
    <div className="rounded-xl bg-slate-900/50 border border-white/5 overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-white/5">
        <span className="text-sm font-medium text-white">Interactive Knowledge Graph</span>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            type="button"
            onClick={() => handleZoom(-0.1)}
            className="hover:text-slate-300 transition-colors"
          >
            Zoom Out
          </button>
          <span>{Math.round(camera.zoom * 100)}%</span>
          <button
            type="button"
            onClick={() => handleZoom(0.1)}
            className="hover:text-slate-300 transition-colors"
          >
            Zoom In
          </button>
          <button
            type="button"
            onClick={() => setCamera({ x: 0, y: 0, zoom: 1 })}
            className="hover:text-slate-300 transition-colors"
          >
            Reset View
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        role="img"
        aria-label="Interactive knowledge graph. Click nodes to explore connections."
        tabIndex={0}
        onClick={handleCanvasClick}
        onMouseDown={handleCanvasDrag}
        className="w-full cursor-grab active:cursor-grabbing"
        style={{ imageRendering: 'pixelated' }}
      />
      {selectedNode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute bottom-4 left-4 p-3 rounded-lg bg-slate-800/90 border border-cyan-500/30"
        >
          <p className="text-sm text-white font-medium mb-2">
            {nodes.find((n) => n.id === selectedNode)?.label}
          </p>
          <p className="text-xs text-slate-400">
            Click anywhere to deselect
          </p>
        </motion.div>
      )}
    </div>
  );
}
