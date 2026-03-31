import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { ReducedMotionWrapper } from "@/components/ReducedMotionWrapper";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vivim.live"),
  title: {
    default: "VIVIM - Sovereign, Portable, Personal AI Memory",
    template: "%s | VIVIM",
  },
  description: "Give your AI a brain that never forgets. VIVIM provides intelligent context management, persistent memory, and semantic storage that works with all AI providers.",
  keywords: ["VIVIM", "AI Memory", "LLM", "Context Engine", "ACU", "Atomic Chat Units", "Personal AI", "Memory Layer", "AI Context Management"],
  authors: [{ name: "VIVIM" }],
  creator: "VIVIM",
  publisher: "VIVIM",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://vivim.live",
  },
  openGraph: {
    title: "VIVIM - The Living Memory for Your AI",
    description: "Sovereign, portable, personal AI memory that works with all providers",
    url: "https://vivim.live",
    siteName: "VIVIM",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "https://vivim.live/og-image.png",
        width: 1200,
        height: 630,
        alt: "VIVIM - Sovereign, Portable, Personal AI Memory",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VIVIM - The Living Memory for Your AI",
    description: "Sovereign, portable, personal AI memory that works with all providers",
    creator: "@vivim",
    site: "@vivim",
    images: ["https://vivim.live/twitter-image.png"],
  },
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "VIVIM",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: "/manifest.json",
  other: {
    "theme-color": "#020617",
    "mask-icon": "/mask-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "VIVIM",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description: "Sovereign, portable, personal AI memory that works with all providers. Provides intelligent context management, persistent memory, and semantic storage.",
    url: "https://vivim.live",
    author: {
      "@type": "Organization",
      name: "VIVIM",
      url: "https://vivim.live",
    },
    programmingLanguage: ["TypeScript", "JavaScript"],
    softwareVersion: "1.0.0",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "42",
    },
  };

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-slate-950 text-white min-h-screen`}
      >
        <ReducedMotionWrapper>
          {children}
        </ReducedMotionWrapper>
      </body>
    </html>
  );
}
