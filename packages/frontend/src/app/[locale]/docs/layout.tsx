import type { Metadata } from "next";
import { DocsSidebar } from "@/components/docs/docs-sidebar";

export const metadata: Metadata = {
  title: {
    default: "VIVIM Documentation - Sovereign AI Memory Platform",
    template: "%s | VIVIM Docs",
  },
  description: "Complete documentation for VIVIM - the sovereign, portable, personal AI memory layer that works across all providers. Learn about architecture, memory systems, context engine, privacy, APIs, and integration guides.",
  keywords: [
    "VIVIM documentation",
    "AI memory",
    "sovereign AI",
    "context engine",
    "memory layer",
    "AI context",
    "provider agnostic AI",
    "portable memory",
    "personal AI",
    "AI memory API",
    "context management",
    "AI privacy",
    "zero-knowledge AI",
    "memory marketplace",
    "sentinel detection",
    "rights layer",
  ],
  openGraph: {
    title: "VIVIM Documentation",
    description: "Complete documentation for the sovereign AI memory platform",
    type: "website",
    locale: "en_US",
    siteName: "VIVIM Documentation",
  },
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
};

interface DocsLayoutProps {
  children: React.ReactNode;
}

export default function DocsLayout({ children }: DocsLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/10 via-slate-950 to-cyan-900/10" />
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Sidebar */}
        <aside className="hidden lg:block w-72 border-r border-white/5 bg-slate-950/50 backdrop-blur-xl sticky top-0 h-screen overflow-y-auto">
          <DocsSidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="max-w-4xl mx-auto px-6 py-12 lg:px-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
