"use client";

import { useEffect, useRef, useCallback } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  depth: number;
  baseOpacity: number;
  hue: number;
}

const DEPTH_CONFIGS = [
  { opacity: 0.12, parallax: 0.02, minR: 1,   maxR: 2   },
  { opacity: 0.22, parallax: 0.05, minR: 1.5, maxR: 3   },
  { opacity: 0.35, parallax: 0.10, minR: 2,   maxR: 4   },
];

const CONNECTION_MAX_DIST = 200;
const CONNECTION_OPACITY  = 0.06;
const MOUSE_RADIUS        = 120;
const MOUSE_FORCE         = 6;

export function NeuralBackground() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const nodesRef   = useRef<Node[]>([]);
  const mouseRef   = useRef({ x: -9999, y: -9999 });
  const scrollRef  = useRef(0);
  const rafRef     = useRef<number>(0);

  const initNodes = useCallback((w: number, h: number) => {
    const isMobile = w < 768;
    const count    = isMobile ? 8 : 15;
    const palette = [265, 190];

    nodesRef.current = Array.from({ length: count }, (_, i) => {
      const depth   = i % 3;
      const cfg     = DEPTH_CONFIGS[depth];

      return {
        x:           Math.random() * w,
        y:           Math.random() * h * 3,
        vx:          (Math.random() - 0.5) * 0.3,
        vy:          (Math.random() - 0.5) * 0.2,
        radius:      cfg.minR + Math.random() * (cfg.maxR - cfg.minR),
        depth,
        baseOpacity: cfg.opacity,
        hue:         palette[i % palette.length],
      };
    });
  }, []);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w   = canvas.width;
    const h   = canvas.height;
    const dpr = window.devicePixelRatio > 1 ? 0.5 : 1;

    ctx.clearRect(0, 0, w, h);

    const nodes  = nodesRef.current;
    const mx     = mouseRef.current.x;
    const my     = mouseRef.current.y;
    const scroll = scrollRef.current;

    for (let i = 0; i < nodes.length; i++) {
      const n   = nodes[i];
      const cfg = DEPTH_CONFIGS[n.depth];

      n.x += n.vx;
      n.y += n.vy;

      n.vx += (Math.random() - 0.5) * 0.02;
      n.vy += (Math.random() - 0.5) * 0.02;

      n.vx *= 0.99;
      n.vy *= 0.99;

      if (n.x < -20) n.x = w + 20;
      if (n.x > w + 20) n.x = -20;
      if (n.y < -20) n.y = h * 3 + 20;
      if (n.y > h * 3 + 20) n.y = -20;

      const drawY = n.y - scroll * cfg.parallax * 10;

      if (drawY < -50 || drawY > h + 50) continue;

      let fx = 0, fy = 0;
      const dx = n.x - mx;
      const dy = drawY - my;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MOUSE_RADIUS && dist > 1) {
        const force = (1 - dist / MOUSE_RADIUS) * MOUSE_FORCE;
        fx = (dx / dist) * force;
        fy = (dy / dist) * force;
      }

      const finalX = n.x + fx;
      const finalY = drawY + fy;

      ctx.beginPath();
      ctx.arc(finalX, finalY, n.radius, 0, Math.PI * 2);
      ctx.fillStyle = `hsla(${n.hue}, 70%, 65%, ${n.baseOpacity})`;
      ctx.fill();

      if (n.depth === 2) {
        ctx.beginPath();
        ctx.arc(finalX, finalY, n.radius * 3, 0, Math.PI * 2);
        const glow = ctx.createRadialGradient(
          finalX, finalY, 0, finalX, finalY, n.radius * 3
        );
        glow.addColorStop(0, `hsla(${n.hue}, 70%, 65%, 0.06)`);
        glow.addColorStop(1, `hsla(${n.hue}, 70%, 65%, 0)`);
        ctx.fillStyle = glow;
        ctx.fill();
      }

      let nearestDist = CONNECTION_MAX_DIST;
      let nearestJ    = -1;

      for (let j = i + 1; j < nodes.length; j++) {
        const m      = nodes[j];
        const mCfg   = DEPTH_CONFIGS[m.depth];
        const mDrawY = m.y - scroll * mCfg.parallax * 10;

        if (mDrawY < -50 || mDrawY > h + 50) continue;

        const cdx = finalX - m.x;
        const cdy = finalY - mDrawY;
        const cd  = Math.sqrt(cdx * cdx + cdy * cdy);

        if (cd < nearestDist) {
          nearestDist = cd;
          nearestJ    = j;
        }
      }

      if (nearestJ !== -1) {
        const m      = nodes[nearestJ];
        const mCfg   = DEPTH_CONFIGS[m.depth];
        const mDrawY = m.y - scroll * mCfg.parallax * 10;
        const opacity = (1 - nearestDist / CONNECTION_MAX_DIST) * CONNECTION_OPACITY;

        ctx.beginPath();
        ctx.moveTo(finalX, finalY);
        ctx.lineTo(m.x, mDrawY);
        ctx.strokeStyle = `hsla(${(n.hue + m.hue) / 2}, 60%, 60%, ${opacity})`;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }
    }

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr = window.devicePixelRatio > 1 ? 0.5 : 1;
      canvas.width  = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width  = "100%";
      canvas.style.height = "100%";
      initNodes(canvas.width, canvas.height);
    };

    const handleMouse = (e: MouseEvent) => {
      const dpr = window.devicePixelRatio > 1 ? 0.5 : 1;
      mouseRef.current = { x: e.clientX * dpr, y: e.clientY * dpr };
    };

    const handleScroll = () => {
      scrollRef.current = window.scrollY;
    };

    const handleMouseForCSS = (e: MouseEvent) => {
      document.documentElement.style.setProperty(
        "--mouse-x", `${(e.clientX / window.innerWidth) * 100}%`
      );
      document.documentElement.style.setProperty(
        "--mouse-y", `${(e.clientY / window.innerHeight) * 100}%`
      );
    };

    resize();
    handleScroll();

    window.addEventListener("resize",    resize,            { passive: true });
    window.addEventListener("mousemove", handleMouse,       { passive: true });
    window.addEventListener("mousemove", handleMouseForCSS, { passive: true });
    window.addEventListener("scroll",    handleScroll,      { passive: true });

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      window.removeEventListener("mousemove", handleMouseForCSS);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [animate, initNodes]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      tabIndex={-1}
    />
  );
}
