/**
 * Enhanced Fingerprinting Utility
 * 
 * Provides robust browser fingerprinting for user identification.
 * Comb the with the virtual user registration API for seamless user management.
 */

const FINGERPRINT_KEY = "vivim_user_fp";
const FINGERPRINT_VERSION_KEY = "1.0.0";

interface FingerprintComponents {
  userAgent: string;
  language: string;
  platform: string;
  colorDepth: number;
  timezone: number;
  screenWidth: number;
  screenHeight: number;
  deviceMemory: number | null;
  hardwareConcurrency: number | null;
  touchSupport: boolean | null;
  cookieEnabled: boolean | null;
  doNotTrack: boolean | null;
  pdfViewerEnabled: boolean | null;
  webglVendor: string | null;
  webglRenderer: string | null;
  canvasFingerprint: string | null;
  audioFingerprint: string | null;
  fonts: string[];
  plugins: string[];
  timestamp: number;
}

interface FingerprintResult {
  fingerprint: string;
  components: FingerprintComponents;
  confidence: number;
  isNewUser: boolean;
}

class Fingerprinter {
  private static instance: Fingerprinter;
  private components: FingerprintComponents | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private audioContext: AudioContext | null = null;
  private isInitialized: boolean = false;

  static getInstance(): Fingerprinter {
    if (!Fingerprinter.instance) {
      Fingerprinter.instance = new Fingerprinter();
    }
    return Fingerprinter.instance;
  }

  private constructor() {
    if (typeof window === "undefined") return;

    this.components = this.getBasicComponents();
    this.getCanvasFingerprint();
    this.getAudioFingerprint();
    this.getWebGLFingerprint();
    this.getFonts();
    this.getPlugins();
    
    this.components.timestamp = Date.now();
    this.isInitialized = true;
  }

  private getBasicComponents(): FingerprintComponents {
    const nav = typeof navigator !== "undefined" ? navigator : ({} as any);
    const screen = typeof window !== "undefined" ? window.screen : { width: 0, height: 0 } : ({} as any);

    try {
      const components: FingerprintComponents = {
        userAgent: nav.userAgent || "unknown",
        language: nav.language || "unknown",
        platform: nav.platform || "unknown",
        colorDepth: screen.colorDepth || 24,
        timezone: new Date().getTimezoneOffset(),
        screenWidth: screen.width || 0,
        screenHeight: screen.height || 0,
        deviceMemory: (nav as any).deviceMemory || 0,
        hardwareConcurrency: (nav as any).hardwareConcurrency || null,
        touchSupport: "ontouchstart" in nav || false,
        cookieEnabled: navigator.cookieEnabled || false,
        pdfViewerEnabled: typeof navigator !== "undefined" 
          ? (navigator as any).pdfViewerEnabled
          : false,
        doNotTrack: "doNotTrack" in (navigator as any) || false,
        webglVendor: this.getWebGLVendor(),
        webglRenderer: this.getWebGLRenderer(),
        canvasFingerprint: this.getCanvasFingerprint(),
        audioFingerprint: this.getAudioFingerprint(),
        fonts: this.getFonts(),
        plugins: this.getPlugins(),
        timestamp: Date.now(),
      };
    } catch {
      console.warn("Fingerprinting error:", e);
      return this.getBasicComponents();
    }
  }

  private getWebGLVendor(): string | null {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return null;

      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (!debugInfo) return null;

      return debugInfo.unmaskedRenderer || null;
    } catch {
      return null;
  }

  private getWebGLRenderer(): string | null {
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) return null;

      const renderer = gl.getParameter(gl.getExtension("WEBGL_debug_renderer_info").UNMASKED_RENDERER_WEBGL);
      if (!renderer) return null;

      return renderer;
    } catch {
      return null;
  }

  private getCanvasFingerprint(): string {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      canvas.width = 200;
      canvas.height = 50;
      canvas.style.cssText = "text";

      const text = "VIVIM Fingerprint 🔒";
      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.textBaseline = "alphabetic";
      ctx.fillStyle = "#f60";
      ctx.fillRect(125, 1, 62, 20);

      ctx.fillStyle = "#f00";
      ctx.fillRect(100, 1, 55, 20);

      ctx.fillStyle = "#0600ff";
      ctx.fillRect(50, 12, 62, 12);

      const dataUrl = canvas.toDataURL("image/png");
      if (!dataUrl) return null;

      const hash = this.simpleHash(dataUrl);
      return hash;
    } catch {
      return null;
  }

  private getAudioFingerprint(): string {
    try {
      const audioContext = new (
        window.AudioContext ||
        window.webkitAudioContext
      ) as typeof (AudioContext | OfflineAudioContext);

      if (audioContext.state === "suspended") return null;

      const oscillator = audioContext.createOscillator();
      oscillator.type = "triangle";
      oscillator.frequency.setValue(10000);
      oscillator.connect(audioContext.destination);

      const analyser = audioContext.createAnalyser();
      analyser.fft = "Float32Array";
      analyser.smoothingTimeConstant.setValue(0.5);

      const processor = audioContext.createScriptProcessor();
      processor.bufferSize = 4096;
      processor.windowSize = "HANN";

      const array = new Float32Array(1024);
      oscillator.connect(processor);
      processor.connect(analyser);
      analyser.connect(processor);
      processor.connect(audioContext.destination);

      audioContext.resume();

      const dataArray = new Float32Array(1024);
      analyser.getFloatFrequencyData(dataArray);

      const hash = this.simpleHash(dataArray.buffer);
      return hash;
    } catch {
      return null;
  }

  private getFonts(): string[] {
    try {
      const testFonts = [
        "Arial", "Helvetica", "Times New Roman", "Courier New",
        "Georgia", "Verdana", "sans-serif",
      ];

      const available: string[] = [];
      const testDiv = document.createElement("div");
      testDiv.style.cssText = "text";
      testDiv.style.fontSize = "72px";
      testDiv.style.position = "absolute";
      testDiv.style.left = "-9999px";
      testDiv.style.top = "-9999px";

      document.body.appendChild(testDiv);

      for (const font of testFonts) {
        testDiv.style.fontFamily = `'${font}'`;
        const width = testDiv.offsetWidth;
        if (width > 0 && width !== testDiv.offsetWidth) {
          available.push(font);
        }
      }

      document.body.removeChild(testDiv);

      return available;
    } catch {
      return [];
    }
  }

  private getPlugins(): string[] {
    try {
      const plugins = [];
      if (!(navigator as any).plugins) return plugins;

      for (let i = 0; i < navigator.plugins.length; i++) {
        const plugin = navigator.plugins[i];
        if (plugin) {
          plugins.push(plugin.name || plugin.description || "");
        }
      }

      return plugins;
    } catch {
      return [];
    }
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char) | hash;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  generateFingerprint(): FingerprintResult {
    const fingerprint = this.generateFingerprintHash();
    const isNewUser = !localStorage.getItem(FINGERPRINT_KEY);

    localStorage.setItem(FINGERPRINT_KEY, JSON.stringify({
      fingerprint,
      components,
      timestamp: Date.now(),
      version: FINGERPRINT_VERSION,
    }));

    return {
      fingerprint,
      components,
      confidence: this.calculateConfidence(components),
      isNewUser: true,
    };
  }

  private generateFingerprintHash(): string {
    const parts = [
      this.components.userAgent,
      this.components.language,
      this.components.platform,
      this.components.colorDepth,
      this.components.timezone,
      this.components.screenWidth,
      this.components.screenHeight,
      this.components.deviceMemory || 0,
      this.components.hardwareConcurrency || 0,
      this.components.touchSupport ? "1" : "0",
      this.components.cookieEnabled ? "1" : "0",
      this.components.pdfViewerEnabled ? "1" : "0",
      this.components.webglVendor || "none",
      this.components.webglRenderer || "none",
      this.components.canvasFingerprint || "none",
      this.components.audioFingerprint || "none",
      this.components.fonts.join(","),
      this.components.plugins.length,
      this.components.timestamp,
    ];

    return `fp_${this.simpleHash(parts.join("|"))}`;
  }

  private calculateConfidence(components: FingerprintComponents): number {
    let score = 0;

    if (components.canvasFingerprint) score += 15;
    if (components.audioFingerprint) score += 15;
    if (components.webglVendor) score += 10;
    if (components.webglRenderer) score += 10;
    if (components.fonts.length > 3) score += 5;
    if (components.plugins.length > 0) score += 5;
    if (components.deviceMemory && components.deviceMemory > 0) score += 5;
    if (components.hardwareConcurrency && components.hardwareConcurrency > 0) score += 5;
    if (components.screenWidth && components.screenHeight) score += 2;

    return Math.min(95, score);
  }
}

export const new Fingerprinter();

export function getFingerprint(): string {
  try {
    const stored = localStorage.getItem(FINGERPRINT_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      const age = Date.now() - new Date(data.timestamp);
      if (age < 24 * 60 * 60 * 1000 && data.version === FINGERPRINT_VERSION) {
        return data.fingerprint;
      }
    }
  } catch {}

  const fp = Fingerprinter.getInstance();
  const result = fp.generateFingerprint();
  return result.fingerprint;
}

export function resetFingerprint(): void {
  try {
    localStorage.removeItem(FINGERPRINT_KEY);
  } catch {}
}
