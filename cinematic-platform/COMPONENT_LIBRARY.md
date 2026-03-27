# Component Library

## Overview

The Cinematic Platform provides a library of reusable components designed for scroll-driven cinematic experiences. Each component handles its own animations, cleanup, and lifecycle.

---

## Base Components

### ChapterBase

The foundation for all chapters. Handles lifecycle, analytics, and positioning.

```svelte
<script lang="ts" generics="T = unknown">
  import type { ChapterProps } from '$config/types';
  import { trackChapterEnter, trackChapterExit } from '$engine/analytics';
  import { onMount, onDestroy } from 'svelte';

  let { 
    id,
    progress = 0,
    chapterProgress = 0,
    active = false,
    index = 0,
    data,
    context,
    children
  }: ChapterProps<T> = $props();

  let enterTime = 0;

  $effect(() => {
    if (active && !enterTime) {
      enterTime = Date.now();
      trackChapterEnter(index);
    }
  });

  onDestroy(() => {
    if (enterTime) {
      trackChapterExit(index, Date.now() - enterTime);
    }
  });
</script>

<div 
  class="chapter-base"
  class:active
  data-chapter={id}
  style="--progress: {chapterProgress}"
>
  {@render children?.()}
</div>

<style>
  .chapter-base {
    width: 100%;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-8);
    opacity: 0;
    transition: opacity var(--duration-slow) var(--ease-cinematic);
  }

  .chapter-base.active {
    opacity: 1;
  }
</style>
```

---

## UI Components

### Counter

Animated number counter with configurable direction, prefix, suffix, and easing.

```svelte
<script lang="ts">
  import { gsap } from 'gsap';

  interface Props {
    value: number;
    start?: number;
    duration?: number;
    decimals?: number;
    prefix?: string;
    suffix?: string;
    direction?: 'up' | 'down';
    easing?: string;
  }

  let { 
    value, 
    start = 0, 
    duration = 2.5, 
    decimals = 0, 
    prefix = '',
    suffix = '',
    direction = 'up',
    easing = 'power3.out'
  }: Props = $props();

  let displayValue = $state(start);
  let element: HTMLElement;

  $effect(() => {
    if (!element) return;
    
    const target = direction === 'down' ? start - value + value : value;
    const startVal = direction === 'down' ? start : displayValue;
    
    gsap.to(displayValue, {
      value: target,
      duration,
      ease: easing,
      onUpdate: () => {
        displayValue = Math.round(displayValue.value * Math.pow(10, decimals)) / Math.pow(10, decimals);
      }
    });
  });
</script>

<span bind:this={element} class="counter" class:tabular-nums={true}>
  {prefix}{displayValue.toFixed(decimals)}{suffix}
</span>

<style>
  .counter {
    font-family: var(--font-mono);
    font-variant-numeric: tabular-nums;
  }
</style>
```

**Usage:**
```svelte
<Counter value={4500000} prefix="$" decimals={0} />
<Counter value={43} suffix="%" direction="down" />
<Counter value={12.3} decimals={1} suffix="hrs" />
```

---

### Slider

Range slider for financial models and interactive inputs.

```svelte
<script lang="ts">
  interface Props {
    label: string;
    min: number;
    max: number;
    step?: number;
    value?: number;
    format?: (v: number) => string;
    onchange?: (v: number) => void;
  }

  let { 
    label, 
    min, 
    max, 
    step = 1, 
    value = $bindable(min),
    format = (v) => String(v),
    onchange
  }: Props = $props();

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = Number(target.value);
    onchange?.(value);
  }
</script>

<div class="slider-container">
  <label class="slider-label">{label}</label>
  <input 
    type="range" 
    {min} {max} {step} 
    bind:value 
    oninput={handleInput}
    class="slider-input"
  />
  <span class="slider-value tabular-nums">{format(value)}</span>
</div>

<style>
  .slider-container {
    display: flex;
    align-items: center;
    gap: var(--space-4);
    padding: var(--space-2) 0;
  }

  .slider-label {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    min-width: 120px;
  }

  .slider-input {
    flex: 1;
    height: 4px;
    appearance: none;
    background: var(--color-surface);
    border-radius: 2px;
    cursor: pointer;
  }

  .slider-input::-webkit-slider-thumb {
    appearance: none;
    width: 16px;
    height: 16px;
    background: var(--color-accent-teal);
    border-radius: 50%;
    cursor: grab;
    transition: transform 0.2s;
  }

  .slider-input::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  .slider-value {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--color-text-primary);
    min-width: 80px;
    text-align: right;
  }
</style>
```

---

### MetricCard

Displays a key metric with animated counter and optional trend indicator.

```svelte
<script lang="ts">
  import Counter from './Counter.svelte';

  interface Props {
    label: string;
    value: number;
    prefix?: string;
    suffix?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: number;
    color?: string;
  }

  let { 
    label, 
    value, 
    prefix = '', 
    suffix = '',
    trend,
    trendValue,
    color = 'var(--color-accent-teal)'
  }: Props = $props();
</script>

<div class="metric-card" style="--metric-color: {color}">
  <span class="metric-label">{label}</span>
  <div class="metric-value">
    <Counter {value} {prefix} {suffix} />
    {#if trend && trendValue}
      <span class="metric-trend" class:up={trend === 'up'} class:down={trend === 'down'}>
        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}{trendValue}%
      </span>
    {/if}
  </div>
</div>

<style>
  .metric-card {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    padding: var(--space-4);
    background: var(--color-surface);
    border-radius: var(--radius-lg);
    border-left: 3px solid var(--metric-color);
  }

  .metric-label {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .metric-value {
    font-family: var(--font-mono);
    font-size: var(--text-3xl);
    font-weight: 600;
    color: var(--color-text-primary);
    display: flex;
    align-items: baseline;
    gap: var(--space-2);
  }

  .metric-trend {
    font-size: var(--text-sm);
    padding: 2px 6px;
    border-radius: 4px;
  }

  .metric-trend.up {
    background: rgba(62, 207, 178, 0.2);
    color: var(--color-accent-teal);
  }

  .metric-trend.down {
    background: rgba(232, 104, 72, 0.2);
    color: var(--color-accent-coral);
  }
</style>
```

---

### ProgressDots

Visual chapter navigation indicator.

```svelte
<script lang="ts">
  import { scrollToChapter } from '$engine/scroll.svelte';

  interface Props {
    total: number;
    current: number;
    labels?: string[];
  }

  let { total, current, labels = [] }: Props = $props();

  function handleDotClick(index: number) {
    scrollToChapter(index);
  }
</script>

<div class="progress-dots">
  {#each Array(total) as _, i}
    <button 
      class="dot"
      class:active={i === current}
      class:completed={i < current}
      onclick={() => handleDotClick(i)}
      title={labels[i] || `Chapter ${i + 1}`}
      aria-label="Go to chapter {i + 1}"
    />
  {/each}
</div>

<style>
  .progress-dots {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    position: fixed;
    right: var(--space-6);
    top: 50%;
    transform: translateY(-50%);
    z-index: 100;
  }

  .dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    border: 2px solid var(--color-text-muted);
    background: transparent;
    cursor: pointer;
    transition: all var(--duration-base) var(--ease-cinematic);
  }

  .dot:hover {
    border-color: var(--color-text-secondary);
  }

  .dot.active {
    background: var(--color-accent-teal);
    border-color: var(--color-accent-teal);
    transform: scale(1.3);
  }

  .dot.completed {
    background: var(--color-text-muted);
    border-color: var(--color-text-muted);
  }
</style>
```

---

### AudioToggle

Mute/unmute control for the audio experience.

```svelte
<script lang="ts">
  import { getIsMuted, toggleMute } from '$engine/audio';

  let isMuted = $derived(getIsMuted());
</script>

<button class="audio-toggle" onclick={toggleMute} aria-label={isMuted ? 'Unmute audio' : 'Mute audio'}>
  {#if isMuted}
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M11 5L6 9H2v6h4l5 4V5z"/>
      <line x1="23" y1="9" x2="17" y2="15"/>
      <line x1="17" y1="9" x2="23" y2="15"/>
    </svg>
  {:else}
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M11 5L6 9H2v6h4l5 4V5z"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  {/if}
</button>

<style>
  .audio-toggle {
    position: fixed;
    top: var(--space-4);
    right: var(--space-4);
    width: 44px;
    height: 44px;
    padding: var(--space-2);
    background: var(--color-surface);
    border: 1px solid var(--color-surface);
    border-radius: var(--radius-full);
    color: var(--color-text-secondary);
    cursor: pointer;
    z-index: 1000;
    transition: all var(--duration-base);
  }

  .audio-toggle:hover {
    background: var(--color-bg-elevated);
    color: var(--color-text-primary);
  }

  .audio-toggle svg {
    width: 100%;
    height: 100%;
  }
</style>
```

---

### VideoHover

Team member or profile card with hover-to-play video.

```svelte
<script lang="ts">
  import { onMount } from 'svelte';

  interface Props {
    name: string;
    role: string;
    thesis?: string;
    videoSrc?: string;
    imageSrc?: string;
    githubUsername?: string;
  }

  let { name, role, thesis = '', videoSrc, imageSrc, githubUsername }: Props = $props();

  let container: HTMLElement;
  let video: HTMLVideoElement;
  let isHovering = $state(false);

  function handleMouseEnter() {
    isHovering = true;
    if (video && videoSrc) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }
  }

  function handleMouseLeave() {
    isHovering = false;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  }
</script>

<div 
  class="video-hover-card"
  bind:this={container}
  onmouseenter={handleMouseEnter}
  onmouseleave={handleMouseLeave}
  role="article"
>
  <div class="media-container">
    {#if videoSrc && isHovering}
      <video bind:this={video} src={videoSrc} muted loop playsinline class="video" />
    {:else if imageSrc}
      <img src={imageSrc} alt={name} class="image" />
    {:else}
      <div class="placeholder" />
    {/if}
  </div>
  
  <div class="info">
    <h3 class="name">{name}</h3>
    <p class="role">{role}</p>
    {#if thesis}
      <p class="thesis">"{thesis}"</p>
    {/if}
    {#if githubUsername}
      <a href="https://github.com/{githubUsername}" target="_blank" class="github">
        @{githubUsername}
      </a>
    {/if}
  </div>
</div>

<style>
  .video-hover-card {
    position: relative;
    border-radius: var(--radius-lg);
    overflow: hidden;
    background: var(--color-surface);
    cursor: pointer;
    transition: transform var(--duration-base) var(--ease-cinematic);
  }

  .video-hover-card:hover {
    transform: scale(1.02);
  }

  .media-container {
    aspect-ratio: 16/9;
    background: var(--color-bg-elevated);
  }

  .video, .image, .placeholder {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .info {
    padding: var(--space-4);
  }

  .name {
    font-family: var(--font-display);
    font-size: var(--text-lg);
    font-weight: 500;
    color: var(--color-text-primary);
    margin: 0;
  }

  .role {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    margin: var(--space-1) 0;
  }

  .thesis {
    font-family: var(--font-body);
    font-size: var(--text-xs);
    color: var(--color-accent-teal);
    font-style: italic;
    margin: var(--space-2) 0;
  }

  .github {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
    text-decoration: none;
  }

  .github:hover {
    color: var(--color-text-secondary);
  }
</style>
```

---

### LayerStack

Visualization of hierarchical layers (like the L0-L7 context system).

```svelte
<script lang="ts">
  interface Layer {
    id: string;
    name: string;
    tokens?: number;
    latency?: string;
    filled?: boolean;
  }

  interface Props {
    layers: Layer[];
    activeLayer?: number;
  }

  let { layers, activeLayer = -1 }: Props = $props();
</script>

<div class="layer-stack">
  {#each layers as layer, i}
    <div 
      class="layer"
      class:active={i === activeLayer}
      class:filled={layer.filled}
    >
      <div class="layer-id">{layer.id}</div>
      <div class="layer-name">{layer.name}</div>
      {#if layer.tokens !== undefined}
        <div class="layer-tokens">{layer.tokens.toLocaleString()}</div>
      {/if}
      {#if layer.latency}
        <div class="layer-latency">{layer.latency}</div>
      {/if}
    </div>
  {/each}
</div>

<style>
  .layer-stack {
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    width: 100%;
    max-width: 400px;
  }

  .layer {
    display: grid;
    grid-template-columns: 40px 1fr auto auto;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-2) var(--space-3);
    background: var(--color-surface);
    border-radius: var(--radius-sm);
    border-left: 3px solid var(--color-text-muted);
    opacity: 0.6;
    transition: all var(--duration-base) var(--ease-cinematic);
  }

  .layer.active, .layer.filled {
    opacity: 1;
    border-left-color: var(--color-accent-teal);
  }

  .layer-id {
    font-family: var(--font-mono);
    font-size: var(--text-sm);
    color: var(--color-accent-teal);
    font-weight: 600;
  }

  .layer-name {
    font-family: var(--font-body);
    font-size: var(--text-sm);
    color: var(--color-text-primary);
  }

  .layer-tokens {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text-secondary);
  }

  .layer-latency {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    color: var(--color-text-muted);
  }
</style>
```

---

### Chart

Observable Plot wrapper with reactive updates.

```svelte
<script lang="ts">
  import { onMount } from 'svelte';
  import * as Plot from '@observablehq/plot';
  import type { PlotOptions } from '@observablehq/plot';

  interface Props {
    options: PlotOptions;
    width?: number;
    height?: number;
    redraw?: number;
  }

  let { options, width = 640, height = 400, redraw = 0 }: Props = $props();

  let container: HTMLElement;
  let chart: HTMLElement;

  $effect(() => {
    redraw; // Dependency
    if (!container) return;
    
    const plot = Plot.plot({
      ...options,
      width,
      height,
      style: {
        background: 'transparent',
        color: '#9896a4',
        fontSize: '12px',
        fontFamily: 'Inter Variable, sans-serif'
      }
    });
    
    if (chart) chart.remove();
    chart = plot;
    container.append(chart);
  });

  onMount(() => {
    return () => chart?.remove();
  });
</script>

<div bind:this={container} class="chart-container" />

<style>
  .chart-container {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  .chart-container :global(svg) {
    overflow: visible;
  }
</style>
```

---

### DegradationLine

Animated red line showing degradation/quality drop.

```svelte
<script lang="ts">
  import { gsap } from 'gsap';

  interface Props {
    progress: number;  // 0 to 1
    direction?: 'left-to-right' | 'right-to-left';
    color?: string;
  }

  let { progress, direction = 'left-to-right', color = 'var(--color-accent-coral)' }: Props = $props();

  let line: HTMLElement;
  let dashOffset = $derived(progress * 1000);

  $effect(() => {
    if (line) {
      gsap.set(line, { 
        strokeDashoffset: direction === 'left-to-right' ? dashOffset : -dashOffset 
      });
    }
  });
</script>

<svg class="degradation-line" viewBox="0 0 100 2" preserveAspectRatio="none">
  <line 
    bind:this={line}
    x1="0" y1="1" x2="100" y2="1"
    stroke={color}
    stroke-width="2"
    stroke-dasharray="1000"
    stroke-dashoffset="0"
    class="line"
  />
</svg>

<style>
  .degradation-line {
    width: 100%;
    height: 2px;
  }

  .line {
    vector-effect: non-scaling-stroke;
  }
</style>
```

---

## Particle Components

### ParticleCanvas

Three.js-based particle system for visual effects.

```svelte
<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import * as THREE from 'three';

  interface Props {
    count?: number;
    color?: string;
    connectDistance?: number;
    connectionStrength?: number;
    mouseInfluence?: number;
  }

  let { 
    count = 150, 
    color = '#3ecfb2', 
    connectDistance = 100, 
    connectionStrength = 1,
    mouseInfluence = 0.001
  }: Props = $props();

  let container: HTMLDivElement;
  let renderer: THREE.WebGLRenderer;
  let scene: THREE.Scene;
  let particles: THREE.Points;
  let positions: Float32Array;
  let velocities: Float32Array;
  let animationId: number;
  let width = 0;
  let height = 0;

  onMount(() => {
    initThree();
    initParticles();
    animate();
    window.addEventListener('resize', handleResize);
  });

  onDestroy(() => {
    cancelAnimationFrame(animationId);
    renderer?.dispose();
    particles?.dispose();
    window.removeEventListener('resize', handleResize);
  });

  function initThree() {
    width = container.clientWidth;
    height = container.clientHeight;

    scene = new THREE.Scene();
    
    renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    
    container.appendChild(renderer.domElement);
  }

  function initParticles() {
    positions = new Float32Array(count * 3);
    velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = Math.random() * width;
      positions[i * 3 + 1] = Math.random() * height;
      positions[i * 3 + 2] = 0;
      
      velocities[i * 3] = (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.5;
      velocities[i * 3 + 2] = 0;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size: 2,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);
  }

  function animate() {
    if (!particles || !positions) return;

    const posArray = particles.geometry.attributes.position.array as Float32Array;
    const cx = width / 2;
    const cy = height / 2;

    for (let i = 0; i < count; i++) {
      posArray[i * 3] += velocities[i * 3];
      posArray[i * 3 + 1] += velocities[i * 3 + 1];

      // Bounce off edges
      if (posArray[i * 3] < 0 || posArray[i * 3] > width) velocities[i * 3] *= -1;
      if (posArray[i * 3 + 1] < 0 || posArray[i * 3 + 1] > height) velocities[i * 3 + 1] *= -1;

      // Pull toward center (connection strength)
      posArray[i * 3] += (cx - posArray[i * 3]) * mouseInfluence * connectionStrength;
      posArray[i * 3 + 1] += (cy - posArray[i * 3 + 1]) * mouseInfluence * connectionStrength;
    }

    particles.geometry.attributes.position.needsUpdate = true;
    renderer.render(scene, new THREE.OrthographicCamera(0, width, height, 0, -1, 1));
    
    animationId = requestAnimationFrame(animate);
  }

  function handleResize() {
    width = container.clientWidth;
    height = container.clientHeight;
    renderer.setSize(width, height);
  }
</script>

<div bind:this={container} class="particle-canvas" />

<style>
  .particle-canvas {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .particle-canvas :global(canvas) {
    display: block;
  }
</style>
```

---

*Next: [Design System](DESIGN_SYSTEM.md)*