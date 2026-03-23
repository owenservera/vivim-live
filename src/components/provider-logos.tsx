"use client";

interface ProviderLogoProps {
  name: string;
  className?: string;
}

export function OpenAILogo({ className = "" }: ProviderLogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9809 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .51 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7427-7.0727zm-9.022 12.6089a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3926-.6815v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3695v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a6.0291 6.0291 0 0 1 3.43-2.5l-.139-.0807 4.7776-2.7579a.7959.7959 0 0 0 .3927-.6815V1.4632l1.9422 1.122a.0737.0737 0 0 1 .0427.0547v5.5794a4.4992 4.4992 0 0 1-6.0592 4.0127 4.4933 4.4933 0 0 1-2.8765-3.3357zm6.3052 5.0827l.121-.0698 4.7964-2.7673a.7863.7863 0 0 0 .3811-.6684v-5.5891l-2.0325-1.1742a.076.076 0 0 1-.0373-.0536V6.4572a4.4992 4.4992 0 0 1 6.1556-3.9461 4.4824 4.4824 0 0 1 2.8756 3.4704v4.5722a.7978.7978 0 0 0 .3887.6864l5.8149 3.3546-4.7963 2.7672a.7757.7757 0 0 0-.3846.6631l-.0002 5.5802-2.027-1.1715a.0832.0832 0 0 1-.0433-.0577V14.21a4.4992 4.4992 0 0 1-6.1566 3.9472 4.482 4.482 0 0 1-2.8703-3.1787z"/>
    </svg>
  );
}

export function AnthropicLogo({ className = "" }: ProviderLogoProps) {
  return (
    <svg viewBox="0 0 91 91" className={className}>
      <defs>
        <linearGradient id="anthropicGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4A574"/>
          <stop offset="100%" stopColor="#B8956F"/>
        </linearGradient>
      </defs>
      <circle cx="45.5" cy="45.5" r="40" fill="none" stroke="url(#anthropicGrad)" strokeWidth="6"/>
      <circle cx="45.5" cy="45.5" r="20" fill="url(#anthropicGrad)"/>
    </svg>
  );
}

export function GoogleLogo({ className = "" }: ProviderLogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-1 7.28-2.69l-3.57-2.77c-.97.65-2.21 1.03-3.71 1.03-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.65-.34-1.34-.34-2.09s.12-1.44.34-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

export function MistralLogo({ className = "" }: ProviderLogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="10" fill="#FF5000"/>
      <path d="M8 8l8 8M16 8l-8 8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function GroqLogo({ className = "" }: ProviderLogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="4" fill="#7B3FE4"/>
      <path d="M7 12h10M12 7v10" stroke="white" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

export function OllamaLogo({ className = "" }: ProviderLogoProps) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <circle cx="12" cy="12" r="10" fill="#800080"/>
      <circle cx="12" cy="12" r="6" fill="none" stroke="white" strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="3" fill="white"/>
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}

export function ProviderLogo({ name, className = "" }: ProviderLogoProps) {
  switch (name) {
    case "OpenAI":
      return <OpenAILogo className={className} />;
    case "Anthropic":
      return <AnthropicLogo className={className} />;
    case "Google":
      return <GoogleLogo className={className} />;
    case "Mistral":
      return <MistralLogo className={className} />;
    case "Groq":
      return <GroqLogo className={className} />;
    case "Ollama":
      return <OllamaLogo className={className} />;
    default:
      return null;
  }
}
