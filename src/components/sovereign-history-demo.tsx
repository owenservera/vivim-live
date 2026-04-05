'use client';

import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Download, Code, Users, ArrowRight, Check, Database, Shield, Globe, Smartphone, Server } from 'lucide-react';

type Provider = {
  id: string;
  name: string;
  icon: string;
  color: string;
  connected: boolean;
  sessions: number;
};

type SearchResult = {
  id: string;
  provider: string;
  preview: string;
  timestamp: string;
};

const PROVIDERS: Provider[] = [
  { id: 'chatgpt', name: 'ChatGPT', icon: '🤖', color: '#10A37F', connected: true, sessions: 247 },
  { id: 'claude', name: 'Claude', icon: '🧠', color: '#D97706', connected: true, sessions: 183 },
  { id: 'gemini', name: 'Gemini', icon: '🌟', color: '#4285F4', connected: true, sessions: 89 },
  { id: 'grok', name: 'Grok', icon: '🚀', color: '#000000', connected: true, sessions: 56 },
  { id: 'deepseek', name: 'DeepSeek', icon: '🔮', color: '#7C3AED', connected: true, sessions: 34 },
  { id: 'kimi', name: 'Kimi', icon: '🌙', color: '#EC4899', connected: false, sessions: 0 },
];

const SEARCH_DEMOS = [
  {
    query: "authentication patterns I discussed",
    results: [
      { id: '1', provider: 'ChatGPT', preview: 'You worked on JWT auth with bcrypt implementation...', timestamp: '2 weeks ago' },
      { id: '2', provider: 'Claude', preview: 'OAuth2 flow with refresh tokens for your API...', timestamp: '1 month ago' },
      { id: '3', provider: 'ChatGPT', preview: 'Session management patterns using Redis...', timestamp: '3 weeks ago' },
    ]
  },
  {
    query: "database schema designs",
    results: [
      { id: '4', provider: 'Claude', preview: 'PostgreSQL schema for user management with relations...', timestamp: '1 week ago' },
      { id: '5', provider: 'Gemini', preview: 'MongoDB aggregation pipelines for analytics...', timestamp: '2 weeks ago' },
    ]
  }
];

export function SovereignHistoryDemo() {
  const t = useTranslations('demos.sovereignHistory');
  const tc = useTranslations('demos.sovereignHistory.component');
  const [activeTab, setActiveTab] = useState<'providers' | 'search' | 'export'>('providers');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [demoIndex, setDemoIndex] = useState(0);

  const handleSearch = () => {
    if (!searchQuery) return;
    setIsSearching(true);
    setTimeout(() => {
      const demo = SEARCH_DEMOS[demoIndex];
      setSearchResults(demo.results.map(r => ({ ...r, id: Math.random().toString() })));
      setIsSearching(false);
      setDemoIndex((demoIndex + 1) % SEARCH_DEMOS.length);
    }, 800);
  };

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-900/50">
      <div className="flex border-b border-white/5">
        {[
          { id: 'providers', label: t('tabs.providers'), icon: Globe },
          { id: 'search', label: t('tabs.search'), icon: Search },
          { id: 'export', label: t('tabs.export'), icon: Download },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-xs font-medium transition-colors ${
              activeTab === tab.id 
                ? 'bg-violet-600/20 text-violet-400 border-b-2 border-violet-500' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === 'providers' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Database className="w-4 h-4 text-cyan-400" />
              <span className="text-sm font-medium text-white">{t('labels.title')}</span>
              <span className="ml-auto text-xs text-slate-500">{t('labels.sessions', { count: 609 })}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {PROVIDERS.map(provider => (
                <motion.div
                  key={provider.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-xl border ${
                    provider.connected 
                      ? 'bg-slate-800/50 border-slate-700/50' 
                      : 'bg-slate-900/30 border-white/5 opacity-50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{provider.icon}</span>
                    <span className="text-sm font-medium text-white">{provider.name}</span>
                    {provider.connected && (
                      <Check className="w-3 h-3 text-emerald-400 ml-auto" />
                    )}
                  </div>
                  {provider.connected && (
                    <div className="text-xs text-slate-500">
                      {t('labels.sessionsSynced', { count: provider.sessions })}
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder={t('labels.searchPlaceholder')}
                className="w-full bg-slate-800/50 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-violet-500/50"
              />
            </div>

            {isSearching && (
              <div className="flex items-center justify-center py-8">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2 h-2 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                  ))}
                </div>
              </div>
            )}

            {!isSearching && searchResults.length > 0 && (
              <div className="space-y-2">
                <AnimatePresence>
                  {searchResults.map((result, i) => (
                    <motion.div
                      key={result.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className="p-3 rounded-lg bg-slate-800/30 border border-white/5 hover:border-violet-500/30 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-violet-400">{result.provider}</span>
                        <span className="text-xs text-slate-600">•</span>
                        <span className="text-xs text-slate-500">{result.timestamp}</span>
                      </div>
                      <p className="text-sm text-slate-300 italic">"{result.preview}"</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        )}

        {activeTab === 'export' && (
          <div className="space-y-4">
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                <Download className="w-8 h-8 text-emerald-400" />
              </div>
              <h4 className="text-sm font-medium text-white mb-2">{t('labels.exportReady')}</h4>
              <p className="text-xs text-slate-500 mb-6 max-w-[240px]">
                {t('labels.portableNotice')}
              </p>
              <button className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-2">
                <Download className="w-3.5 h-3.5" />
                {t('labels.downloadNow')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FileText({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
  );
}

function File({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}