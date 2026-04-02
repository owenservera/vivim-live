const FINGERPRINT_KEY = "vivim_user_fp";
const FINGERPRINT_VERSION = "1.0.0";

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
  touchSupport: boolean;
  cookieEnabled: boolean;
  pdfViewerEnabled: boolean;
  webglVendor: string | null;
  webglRenderer: string | null;
  canvasFingerprint: string | null;
  fonts: string[];
  plugins: string[];
  timestamp: number;
}

function getBasicComponents(): FingerprintComponents {
  const nav = typeof navigator !== "undefined" ? navigator : ({} as Navigator);
  const screen = typeof window !== "undefined" ? window.screen : { width: 0, height: 0 };

  return {
    userAgent: nav.userAgent || "unknown",
    language: nav.language || "unknown",
    platform: nav.platform || "unknown",
    colorDepth: (screen as any).colorDepth || 24,
    timezone: new Date().getTimezoneOffset(),
    screenWidth: (screen as any).width || 0,
    screenHeight: (screen as any).height || 0,
    deviceMemory: (nav as any).deviceMemory || null,
    hardwareConcurrency: (nav as any).hardwareConcurrency || null,
    touchSupport: "ontouchstart" in (typeof window !== "undefined" ? window : {}),
    cookieEnabled: typeof navigator !== "undefined" ? navigator.cookieEnabled : false,
    pdfViewerEnabled: (nav as any).pdfViewerEnabled || false,
    webglVendor: null,
    webglRenderer: null,
    canvasFingerprint: null,
    fonts: [],
    plugins: [],
    timestamp: Date.now(),
  };
}

function getWebGLInfo(): { vendor: string | null; renderer: string | null } {
  try {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const gl = canvas.getContext("webgl");
    if (!gl) return { vendor: null, renderer: null };

    const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
    if (!debugInfo) return { vendor: null, renderer: null };

    return {
      vendor: gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
      renderer: gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
    };
  } catch {
    return { vendor: null, renderer: null };
  }
}

function getCanvasFingerprint(): string | null {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    canvas.width = 200;
    canvas.height = 50;

    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#f00";
    ctx.fillRect(100, 1, 55, 20);
    ctx.fillStyle = "#0600ff";
    ctx.fillRect(50, 12, 62, 12);

    const dataUrl = canvas.toDataURL("image/png");
    return simpleHash(dataUrl);
  } catch {
    return null;
  }
}

function getFonts(): string[] {
  try {
    const testFonts = ["Arial", "Helvetica", "Times New Roman", "Courier New", "Georgia", "Verdana"];
    const available: string[] = [];
    const testDiv = document.createElement("div");
    testDiv.style.cssText = "position:absolute;left:-9999px;top:-9999px;font-size:72px";
    document.body.appendChild(testDiv);

    for (const font of testFonts) {
      testDiv.style.fontFamily = font;
      if (testDiv.offsetWidth > 0) available.push(font);
    }

    document.body.removeChild(testDiv);
    return available;
  } catch {
    return [];
  }
}

function getPlugins(): string[] {
  try {
    const plugins: string[] = [];
    if (navigator && navigator.plugins) {
      for (let i = 0; i < navigator.plugins.length; i++) {
        const p = navigator.plugins[i];
        if (p) plugins.push(p.name || "");
      }
    }
    return plugins;
  } catch {
    return [];
  }
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

function generateFingerprintHash(components: FingerprintComponents): string {
  const parts = [
    components.userAgent,
    components.language,
    components.platform,
    components.colorDepth,
    components.timezone,
    components.screenWidth,
    components.screenHeight,
    components.deviceMemory || 0,
    components.hardwareConcurrency || 0,
    components.touchSupport ? "1" : "0",
    components.cookieEnabled ? "1" : "0",
    components.pdfViewerEnabled ? "1" : "0",
    components.webglVendor || "none",
    components.webglRenderer || "none",
    components.canvasFingerprint || "none",
    components.fonts.join(","),
    components.plugins.length,
    components.timestamp,
  ];

  return `fp_${simpleHash(parts.join("|"))}`;
}

export function getFingerprint(): string {
  try {
    const stored = localStorage.getItem(FINGERPRINT_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      const age = Date.now() - (data.timestamp || 0);
      if (age < 24 * 60 * 60 * 1000 && data.version === FINGERPRINT_VERSION) {
        return data.fingerprint;
      }
    }
  } catch {}

  const components = getBasicComponents();
  const webgl = getWebGLInfo();
  components.webglVendor = webgl.vendor;
  components.webglRenderer = webgl.renderer;
  components.canvasFingerprint = getCanvasFingerprint();
  components.fonts = getFonts();
  components.plugins = getPlugins();
  components.timestamp = Date.now();

  const fingerprint = generateFingerprintHash(components);

  try {
    localStorage.setItem(FINGERPRINT_KEY, JSON.stringify({
      fingerprint,
      components,
      timestamp: Date.now(),
      version: FINGERPRINT_VERSION,
    }));
  } catch {}

  return fingerprint;
}

export function resetFingerprint(): void {
  try {
    localStorage.removeItem(FINGERPRINT_KEY);
  } catch {}
}
