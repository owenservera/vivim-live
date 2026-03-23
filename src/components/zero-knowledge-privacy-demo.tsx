'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Key, Server, Wifi, WifiOff, CheckCircle, AlertCircle, Activity, Eye, EyeOff } from 'lucide-react';

type SecurityLayer = {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'pending' | 'warning';
  icon: typeof Lock;
};

const SECURITY_LAYERS: SecurityLayer[] = [
  { id: 1, name: 'Device Encryption', description: 'Keys generated locally, never leave device', status: 'active', icon: Smartphone },
  { id: 2, name: 'Transport Security', description: 'TLS 1.3 with perfect forward secrecy', status: 'active', icon: Wifi },
  { id: 3, name: 'Storage Encryption', description: 'AES-256-GCM encryption at rest', status: 'active', icon: Lock },
  { id: 4, name: 'Access Control', description: 'Cryptographic key-based permissions', status: 'active', icon: Key },
  { id: 5, name: 'Audit & Transparency', description: 'Full access logging & verification', status: 'active', icon: Activity },
];

type AccessLog = {
  id: string;
  device: string;
  action: string;
  timestamp: string;
  trusted: boolean;
};

const ACCESS_LOGS: AccessLog[] = [
  { id: '1', device: 'MacBook Pro', action: 'Decrypted memories', timestamp: '2 min ago', trusted: true },
  { id: '2', device: 'iPhone 15', action: 'Synced new conversation', timestamp: '15 min ago', trusted: true },
  { id: '3', device: 'MacBook Pro', action: 'Exported data (JSON)', timestamp: '1 hour ago', trusted: true },
  { id: '4', device: 'iPad Air', action: 'Shared with Engineering', timestamp: '3 hours ago', trusted: true },
];

export function ZeroKnowledgePrivacyDemo() {
  const [activeTab, setActiveTab] = useState<'shield' | 'keys' | 'logs'>('shield');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [showKeys, setShowKeys] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-900/50">
      <div className="flex border-b border-white/5">
        {[
          { id: 'shield', label: 'Privacy Shield', icon: Shield },
          { id: 'keys', label: 'Key Management', icon: Key },
          { id: 'logs', label: 'Access Logs', icon: Activity },
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
        {activeTab === 'shield' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30">
              <Shield className="w-8 h-8 text-emerald-400" />
              <div className="flex-1">
                <div className="text-sm font-medium text-white">Security Score</div>
                <div className="text-xs text-slate-400">100% - All layers protected</div>
              </div>
              <div className="text-2xl font-bold text-emerald-400">100%</div>
            </div>

            <div className="space-y-2">
              {SECURITY_LAYERS.map((layer, i) => (
                <motion.div
                  key={layer.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30 border border-white/5"
                >
                  <div className={`p-2 rounded-lg ${
                    layer.status === 'active' ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                  }`}>
                    <layer.icon className={`w-4 h-4 ${
                      layer.status === 'active' ? 'text-emerald-400' : 'text-amber-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white">{layer.name}</div>
                    <div className="text-xs text-slate-500">{layer.description}</div>
                  </div>
                  {layer.status === 'active' && (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  )}
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-lg bg-slate-800/30">
                <div className="text-xl font-bold text-white">2,847</div>
                <div className="text-xs text-slate-500">Encrypted Memories</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/30">
                <div className="text-xl font-bold text-white">100%</div>
                <div className="text-xs text-slate-500">Data Encrypted</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'keys' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-800/30 border border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium text-white">Your Encryption Keys</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-slate-300">Master Key</span>
                  </div>
                  <span className="text-xs text-emerald-400">Generated on device</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-violet-400" />
                    <span className="text-sm text-slate-300">Session Keys</span>
                  </div>
                  <span className="text-xs text-emerald-400">Unique per session</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-slate-300">Content Keys</span>
                  </div>
                  <span className="text-xs text-emerald-400">Per-memory encryption</span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center gap-2 text-amber-400 text-xs">
                  <AlertCircle className="w-4 h-4" />
                  Keys never leave your device - not even to VIVIM servers
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 py-2.5 rounded-lg bg-violet-600/20 text-violet-400 text-sm font-medium border border-violet-500/30"
              >
                Export Keys (Backup)
              </button>
              <button
                type="button"
                className="flex-1 py-2.5 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium border border-red-500/30"
              >
                Wipe All Data
              </button>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">Access Log</span>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>Today: {ACCESS_LOGS.length} accesses</span>
                <span className="text-emerald-400">• All trusted</span>
              </div>
            </div>

            <div className="space-y-2">
              {ACCESS_LOGS.map(log => (
                <div
                  key={log.id}
                  className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30"
                >
                  <div className={`p-1.5 rounded ${log.trusted ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                    {log.trusted ? (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-white">{log.device}</div>
                    <div className="text-xs text-slate-500">{log.action}</div>
                  </div>
                  <span className="text-xs text-slate-500">{log.timestamp}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-violet-500/10 border border-violet-500/30">
              <div className="flex items-center gap-2 text-violet-400 text-xs">
                <Eye className="w-4 h-4" />
                You see everything - VIVIM sees nothing
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Smartphone({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  );
}