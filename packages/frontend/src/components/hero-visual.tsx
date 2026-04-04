"use client";

export function HeroVisual({ className = "" }: { className?: string }) {
  return (
    <div className={`relative w-full aspect-square max-w-xl mx-auto ${className}`}>
      <svg
        viewBox="0 0 400 400"
        className="w-full h-full brain-pulse"
        style={{ filter: "drop-shadow(0 0 30px rgba(139, 92, 246, 0.3))" }}
        role="img"
        aria-label="VIVIM neural network visualization"
      >
        <defs>
          <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6">
              <animate
                attributeName="stopColor"
                values="#8B5CF6;#06B6D4;#8B5CF6"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#06B6D4">
              <animate
                attributeName="stopColor"
                values="#06B6D4;#8B5CF6;#06B6D4"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
          <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <circle cx="200" cy="200" r="180" fill="url(#glowGradient)" className="pulse-ring" />

        <g className="connection-flow" stroke="url(#nodeGradient)" strokeWidth="1.5" fill="none" opacity="0.4">
          <path d="M200 80 Q 280 120 320 180" />
          <path d="M200 80 Q 120 120 80 180" />
          <path d="M320 180 Q 340 250 300 300" />
          <path d="M80 180 Q 60 250 100 300" />
          <path d="M300 300 Q 200 340 100 300" />
          <path d="M200 80 Q 200 150 200 200" />
          <path d="M80 180 Q 140 200 200 200" />
          <path d="M320 180 Q 260 200 200 200" />
          <path d="M100 300 Q 150 250 200 200" />
          <path d="M300 300 Q 250 250 200 200" />
        </g>

        <g filter="url(#glow)">
          {[
            { id: "node-1", cx: 200, cy: 80, r: 12 },
            { id: "node-2", cx: 80, cy: 180, r: 10 },
            { id: "node-3", cx: 320, cy: 180, r: 10 },
            { id: "node-4", cx: 100, cy: 300, r: 8 },
            { id: "node-5", cx: 300, cy: 300, r: 8 },
            { id: "node-6", cx: 200, cy: 200, r: 20 },
            { id: "node-7", cx: 140, cy: 140, r: 6 },
            { id: "node-8", cx: 260, cy: 140, r: 6 },
            { id: "node-9", cx: 150, cy: 260, r: 7 },
            { id: "node-10", cx: 250, cy: 260, r: 7 },
          ].map((node, idx) => (
            <g key={node.id}>
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.r}
                fill="url(#nodeGradient)"
                className="neuron-fire"
                style={{ animationDelay: `${idx * 0.2}s` }}
              />
              <circle
                cx={node.cx}
                cy={node.cy}
                r={node.r + 4}
                fill="none"
                stroke="url(#nodeGradient)"
                strokeWidth="2"
                opacity="0.5"
                className="pulse-ring"
                style={{ animationDelay: `${idx * 0.3}s` }}
              />
            </g>
          ))}
        </g>

        <g opacity="0.6">
          {[
            { id: "orbit-1", cx: 200, cy: 80 },
            { id: "orbit-2", cx: 80, cy: 180 },
            { id: "orbit-3", cx: 320, cy: 180 },
            { id: "orbit-4", cx: 100, cy: 300 },
            { id: "orbit-5", cx: 300, cy: 300 },
            { id: "orbit-6", cx: 140, cy: 140 },
            { id: "orbit-7", cx: 260, cy: 140 },
            { id: "orbit-8", cx: 150, cy: 260 },
            { id: "orbit-9", cx: 250, cy: 260 },
            { id: "orbit-10", cx: 200, cy: 200 },
          ].map((pos, idx) => (
            <circle
              key={pos.id}
              cx={pos.cx}
              cy={pos.cy}
              r="2"
              fill="#8B5CF6"
              opacity="0.3"
              className="float-particle"
              style={{
                animationDelay: `${idx * 0.5}s`,
                transformBox: "fill-box",
                transformOrigin: "center",
              }}
            />
          ))}
        </g>

        <text
          x="200"
          y="380"
          textAnchor="middle"
          fill="#64748B"
          fontSize="10"
          fontFamily="monospace"
          letterSpacing="2"
        >
          ACU NETWORK
        </text>
      </svg>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-violet-500/20 to-cyan-500/20 blur-3xl animate-pulse" />
      </div>

      <div className="absolute -top-4 -right-4 w-20 h-20">
        <svg viewBox="0 0 80 80" className="w-full h-full float-slow" role="img" aria-label="Decorative neural node">
          <circle cx="40" cy="40" r="30" fill="none" stroke="#8B5CF6" strokeWidth="1" opacity="0.3" />
          <circle cx="40" cy="40" r="20" fill="none" stroke="#06B6D4" strokeWidth="1" opacity="0.4" className="connection-flow" />
          <circle cx="40" cy="40" r="5" fill="#8B5CF6" className="neuron-fire" />
        </svg>
      </div>

      <div className="absolute -bottom-4 -left-4 w-16 h-16">
        <svg viewBox="0 0 64 64" className="w-full h-full float-delayed" role="img" aria-label="Decorative network pattern">
          <path d="M32 8 L32 56 M8 32 L56 32" stroke="#06B6D4" strokeWidth="1" opacity="0.2" />
          <circle cx="32" cy="32" r="20" fill="none" stroke="#06B6D4" strokeWidth="1" opacity="0.3" className="connection-flow" />
          <circle cx="32" cy="32" r="4" fill="#06B6D4" className="neuron-fire" />
        </svg>
      </div>
    </div>
  );
}

export function LayerVisualization({ 
  layers 
}: { 
  layers: Array<{ name: string; label: string; color: string }> 
}) {
  return (
    <div className="relative space-y-3">
      {layers.map((layer, i) => (
        <div
          key={layer.name}
          className="flex items-center gap-4 scroll-animate"
          style={{ transitionDelay: `${i * 100}ms` }}
        >
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${layer.color} flex items-center justify-center shrink-0 glow-pulse`}>
            <span className="text-white font-bold text-sm">{layer.name}</span>
          </div>
          <div className="flex-1 h-3 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${layer.color} rounded-full transition-all duration-1000`}
              style={{ 
                width: `${100 - (i * 10)}%`,
                animationDelay: `${i * 200}ms`
              }}
            />
          </div>
          <span className="text-slate-400 text-sm w-20 text-right">{layer.label}</span>
        </div>
      ))}
    </div>
  );
}
