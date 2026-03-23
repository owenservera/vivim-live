"use client";

interface ProviderLogoProps {
  name: string;
  className?: string;
}

const CDN_BASE = "https://unpkg.com/@lobehub/icons-static-svg@latest/icons";

export function OpenAILogo({ className = "" }: { className?: string }) {
  return (
    <img 
      src={`${CDN_BASE}/openai.svg`} 
      alt="OpenAI" 
      className={className}
    />
  );
}

export function GoogleGeminiLogo({ className = "" }: { className?: string }) {
  return (
    <img 
      src={`${CDN_BASE}/gemini-color.svg`} 
      alt="Google Gemini" 
      className={className}
    />
  );
}

export function ClaudeLogo({ className = "" }: { className?: string }) {
  return (
    <img 
      src={`${CDN_BASE}/claude-color.svg`} 
      alt="Claude" 
      className={className}
    />
  );
}

export function GrokLogo({ className = "" }: { className?: string }) {
  return (
    <img 
      src={`${CDN_BASE}/grok.svg`} 
      alt="Grok" 
      className={className}
    />
  );
}

export function ZaiLogo({ className = "" }: { className?: string }) {
  return (
    <img 
      src={`${CDN_BASE}/zai.svg`} 
      alt="Z.ai" 
      className={className}
    />
  );
}

export function QwenLogo({ className = "" }: { className?: string }) {
  return (
    <img 
      src={`${CDN_BASE}/qwen-color.svg`} 
      alt="Qwen" 
      className={className}
    />
  );
}

export function KimiLogo({ className = "" }: { className?: string }) {
  return (
    <img 
      src={`${CDN_BASE}/kimi-color.svg`} 
      alt="Kimi" 
      className={className}
    />
  );
}

export function ProviderLogo({ name, className = "" }: ProviderLogoProps) {
  switch (name) {
    case "OpenAI":
      return <OpenAILogo className={className} />;
    case "Google Gemini":
      return <GoogleGeminiLogo className={className} />;
    case "Claude":
      return <ClaudeLogo className={className} />;
    case "Grok":
      return <GrokLogo className={className} />;
    case "Z.ai":
      return <ZaiLogo className={className} />;
    case "Qwen":
      return <QwenLogo className={className} />;
    case "Kimi":
      return <KimiLogo className={className} />;
    default:
      return null;
  }
}