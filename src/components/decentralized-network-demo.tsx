'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import { Wifi, WifiOff, Server, Globe, RefreshCw, Activity, HardDrive, Cpu, ArrowUp, ArrowDown, Users, Shield, CheckCircle } from 'lucide-react';

type Peer = {
  id: string;
  name: string;
  status: 'connected' | 'syncing' | 'offline';
  distance: string;
  dataSynced: string;
};

type SyncEvent = {
  id: string;
  action: string;
  peers: number;
  timestamp: string;
};

const INITIAL_PEERS: Peer[] = [
  { id: '1', name: 'Your Device', status: 'connected', distance: 'Local', dataSynced: '50,234' },
  { id: '2', name: 'Peer Alpha', status: 'connected', distance: '2 hops', dataSynced: '45,123' },
  { id: '3', name: 'Peer Beta', status: 'syncing', distance: '3 hops', dataSynced: '12,456' },
  { id: '4', name: 'Peer Gamma', status: 'connected', distance: '1 hop', dataSynced: '67,890' },
  { id: '5', name: 'Peer Delta', status: 'connected', distance: '4 hops', dataSynced: '23,789' },
  { id: '6', name: 'Peer Epsilon', status: 'offline', distance: '2 hops', dataSynced: '0' },
];

const SYNC_EVENTS: SyncEvent[] = [
  { id: '1', action: 'Synced memories from Peer Beta', peers: 3, timestamp: 'Just now' },
  { id: '2', action: 'New peer discovered: Peer Zeta', peers: 7, timestamp: '2 min ago' },
  { id: '3', action: 'CRDT merge completed', peers: 5, timestamp: '5 min ago' },
  { id: '4', action: 'Federated with home server', peers: 2, timestamp: '10 min ago' },
];

export function DecentralizedNetworkDemo() {
  const t = useTranslations('demos.decentralizedNetwork');
  const [activeTab, setActiveTab] = useState<'network' | 'sync' | 'node'>('network');
  const [peers, setPeers] = useState(INITIAL_PEERS);
  const [isOnline, setIsOnline] = useState(true);
  const [networkStats, setNetworkStats] = useState({
    totalPeers: 47,
    dataSynced: '2.3 GB',
    bandwidthUp: '1.2 MB/s',
    bandwidthDown: '800 KB/s',
  });

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-900/50">
      <div className="flex border-b border-white/5">
        {[
          { id: 'network', label: t('tabs.network'), icon: Globe },
          { id: 'sync', label: t('tabs.sync'), icon: RefreshCw },
          { id: 'node', label: t('tabs.node'), icon: Server },
        ].map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-3 text-xs font-medium transition-colors ${
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
        {activeTab === 'network' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-cyan-500/20 to-violet-500/20 border border-cyan-500/30">
              {isOnline ? (
                <>
                  <Wifi className="w-6 h-6 text-cyan-400" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{t('labels.online')}</div>
                    <div className="text-xs text-slate-400">{t('labels.peersConnected', { count: networkStats.totalPeers })}</div>
                  </div>
                </>
              ) : (
                <>
                  <WifiOff className="w-6 h-6 text-amber-400" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{t('labels.offline')}</div>
                    <div className="text-xs text-slate-400">{t('labels.workingLocally')}</div>
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-lg bg-slate-800/30">
                <div className="text-xl font-bold text-cyan-400">{peers.filter(p => p.status !== 'offline').length}</div>
                <div className="text-xs text-slate-500">{t('labels.connected')}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/30">
                <div className="text-xl font-bold text-violet-400">{networkStats.dataSynced}</div>
                <div className="text-xs text-slate-500">{t('labels.dataSynced')}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/30">
                <div className="text-xl font-bold text-emerald-400">{peers.length}</div>
                <div className="text-xs text-slate-500">{t('labels.discovered')}</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-medium text-slate-400">{t('labels.meshVisualization')}</h4>
              <div className="relative h-32 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 200 100">
                  <defs>
                    <marker id="netArrow" markerWidth="4" markerHeight="4" refX="3" refY="2" orient="auto">
                      <path d="M0,0 L4,2 L0,4" fill="#64748B" />
                    </marker>
                  </defs>
                  
                  <line x1="100" y1="50" x2="40" y2="20" stroke="#8B5CF6" strokeWidth="1.5" opacity="0.6" />
                  <line x1="100" y1="50" x2="160" y2="20" stroke="#06B6D4" strokeWidth="1.5" opacity="0.6" />
                  <line x1="100" y1="50" x2="30" y2="80" stroke="#10B981" strokeWidth="1.5" opacity="0.6" />
                  <line x1="100" y1="50" x2="170" y2="80" stroke="#F59E0B" strokeWidth="1.5" opacity="0.6" />
                  <line x1="100" y1="50" x2="80" y2="20" stroke="#8B5CF6" strokeWidth="1" opacity="0.4" />
                  
                  <circle cx="100" cy="50" r="8" fill="#10B981" />
                  <text x="100" y="53" textAnchor="middle" fill="white" fontSize="6">{t('labels.you')}</text>
                  
                  <circle cx="40" cy="20" r="5" fill="#8B5CF6" />
                  <text x="40" y="23" textAnchor="middle" fill="white" fontSize="5">A</text>
                  
                  <circle cx="160" cy="20" r="5" fill="#06B6D4" />
                  <text x="160" y="23" textAnchor="middle" fill="white" fontSize="5">B</text>
                  
                  <circle cx="30" cy="80" r="5" fill="#10B981" />
                  <text x="30" y="83" textAnchor="middle" fill="white" fontSize="5">G</text>
                  
                  <circle cx="170" cy="80" r="5" fill="#F59E0B" />
                  <text x="170" y="83" textAnchor="middle" fill="white" fontSize="5">D</text>
                  
                  <circle cx="80" cy="20" r="4" fill="#EC4899" />
                  <text x="80" y="23" textAnchor="middle" fill="white" fontSize="4">?</text>
                </svg>
              </div>
            </div>

            <div className="space-y-1 max-h-[120px] overflow-y-auto pr-1 custom-scrollbar">
              {peers.slice(1).map(peer => (
                <div key={peer.id} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/20">
                  <div className={`w-2 h-2 rounded-full ${
                    peer.status === 'connected' ? 'bg-emerald-400' : 
                    peer.status === 'syncing' ? 'bg-amber-400 animate-pulse' : 'bg-slate-600'
                  }`} />
                  <span className="text-sm text-slate-300 flex-1">{peer.name}</span>
                  <span className="text-[10px] text-slate-500">{peer.distance}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'sync' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">{t('labels.syncStatus')}</span>
              <button
                type="button"
                onClick={() => setIsOnline(!isOnline)}
                className={`text-xs px-2 py-1 rounded ${isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}
              >
                {isOnline ? t('labels.online') : t('labels.offline')}
              </button>
            </div>

            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1 custom-scrollbar">
              {SYNC_EVENTS.map(event => (
                <div key={event.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
                  <RefreshCw className="w-4 h-4 text-cyan-400" />
                  <div className="flex-1">
                    <div className="text-xs text-slate-300">{event.action}</div>
                    <div className="text-[10px] text-slate-500">{event.peers} {t('labels.peersConnected', { count: event.peers })}</div>
                  </div>
                  <span className="text-[10px] text-slate-500">{event.timestamp}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/30">
              <div className="flex items-center gap-2 text-violet-400 text-xs">
                <Shield className="w-4 h-4" />
                CRDT ensures conflict-free sync - no data loss
              </div>
            </div>
          </div>
        )}

        {activeTab === 'node' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-800/30 border border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <Server className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium text-white">{t('labels.nodeHealth')}</span>
                <span className="ml-auto text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Running
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-slate-900/50">
                  <div className="flex items-center gap-2 mb-2">
                    <HardDrive className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-slate-400">{t('labels.storage')}</span>
                  </div>
                  <div className="text-lg font-bold text-white">50,234</div>
                  <div className="text-xs text-slate-500">local memories</div>
                </div>
                <div className="p-3 rounded-lg bg-slate-900/50">
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="w-4 h-4 text-violet-400" />
                    <span className="text-xs text-slate-400">Performance</span>
                  </div>
                  <div className="text-lg font-bold text-white">3%</div>
                  <div className="text-xs text-slate-500">CPU • 12% RAM</div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 py-2 rounded-lg bg-violet-600/20 text-violet-400 text-xs font-medium border border-violet-500/30"
              >
                View Logs
              </button>
              <button
                type="button"
                className="flex-1 py-2 rounded-lg bg-cyan-600/20 text-cyan-400 text-xs font-medium border border-cyan-500/30"
              >
                Configure
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}