'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslations } from 'next-intl';
import { Shield, Lock, Key, Server, Wifi, WifiOff, CheckCircle, AlertCircle, Activity, Eye, EyeOff, Smartphone } from 'lucide-react';

type SecurityLayer = {
  id: number;
  name: string;
  description: string;
  status: 'active' | 'pending' | 'warning';
  icon: typeof Lock;
};

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
  const t = useTranslations('demos.zeroKnowledgePrivacy');
  const tc = useTranslations('demos.zeroKnowledgePrivacy.component');
  const [activeTab, setActiveTab] = useState<'shield' | 'keys' | 'logs'>('shield');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [showKeys, setShowKeys] = useState(false);

  const SECURITY_LAYERS: SecurityLayer[] = [
    { id: 1, name: t('layers.clientEncryption.name'), description: t('layers.clientEncryption.desc'), status: 'active', icon: Smartphone },
    { id: 2, name: t('layers.transportSecurity.name'), description: t('layers.transportSecurity.desc'), status: 'active', icon: Wifi },
    { id: 3, name: t('layers.storageEncryption.name'), description: t('layers.storageEncryption.desc'), status: 'active', icon: Lock },
    { id: 4, name: t('layers.accessControl.name'), description: t('layers.accessControl.desc'), status: 'active', icon: Key },
    { id: 5, name: t('layers.audit.name'), description: t('layers.audit.desc'), status: 'active', icon: Activity },
  ];

  const TABS = [
    { id: 'shield' as const, label: t('tabs.privacyShield'), icon: Shield },
    { id: 'keys' as const, label: t('tabs.keyManagement'), icon: Key },
    { id: 'logs' as const, label: t('tabs.accessLogs'), icon: Activity },
  ];

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-900/50">
      <div className="flex border-b border-white/5">
        {TABS.map(tab => (
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
                <div className="text-sm font-medium text-white">{t('securityScore')}</div>
                <div className="text-xs text-slate-400">{t('allLayersProtected')}</div>
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
                <div className="text-xs text-slate-500">{t('encryptedMemories')}</div>
              </div>
              <div className="p-3 rounded-lg bg-slate-800/30">
                <div className="text-xl font-bold text-white">100%</div>
                <div className="text-xs text-slate-500">{t('dataEncrypted')}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'keys' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-800/30 border border-white/5">
              <div className="flex items-center gap-2 mb-4">
                <Key className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium text-white">{t('yourEncryptionKeys')}</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm text-slate-300">{t('masterKey')}</span>
                  </div>
                  <span className="text-xs text-emerald-400">{t('generatedOnDevice')}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <Server className="w-4 h-4 text-violet-400" />
                    <span className="text-sm text-slate-300">{t('sessionKeys')}</span>
                  </div>
                  <span className="text-xs text-emerald-400">{t('uniquePerSession')}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50">
                  <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-400" />
                    <span className="text-sm text-slate-300">{t('contentKeys')}</span>
                  </div>
                  <span className="text-xs text-emerald-400">{t('perMemoryEncryption')}</span>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="flex items-center gap-2 text-amber-400 text-xs">
                  <AlertCircle className="w-4 h-4" />
                  {t('keysNeverLeaveDevice')}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                className="flex-1 py-2.5 rounded-lg bg-violet-600/20 text-violet-400 text-sm font-medium border border-violet-500/30"
              >
                {tc('exportKeysBackup')}
              </button>
              <button
                type="button"
                className="flex-1 py-2.5 rounded-lg bg-red-500/20 text-red-400 text-sm font-medium border border-red-500/30"
              >
                {tc('wipeAllData')}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-white">{tc('accessLog')}</span>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <span>{tc('todayAccesses', { count: ACCESS_LOGS.length })}</span>
                <span className="text-emerald-400">• {tc('allTrusted')}</span>
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
                {tc('seeEverything')}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}