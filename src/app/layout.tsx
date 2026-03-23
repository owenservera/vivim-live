import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VIVIM - Sovereign, Portable, Personal AI Memory",
  description: "Give your AI a brain that never forgets. VIVIM provides intelligent context management, persistent memory, and semantic storage that works with all AI providers.",
  keywords: ["VIVIM", "AI Memory", "LLM", "Context Engine", "ACU", "Atomic Chat Units", "Personal AI", "Memory Layer"],
  authors: [{ name: "VIVIM" }],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "VIVIM - The Living Memory for Your AI",
    description: "Sovereign, portable, personal AI memory that works with all providers",
    type: "website",
    siteName: "VIVIM",
  },
  twitter: {
    card: "summary_large_image",
    title: "VIVIM - The Living Memory for Your AI",
    description: "Sovereign, portable, personal AI memory that works with all providers",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased bg-slate-950 text-white min-h-screen`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
