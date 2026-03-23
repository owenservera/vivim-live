'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Users, Link2, Lock, Clock, Eye, Edit3, Share2, Copy, X, Check } from 'lucide-react';

type Permission = 'view' | 'annotate' | 'remix' | 'reshare';
type ShareItem = {
  id: string;
  title: string;
  sharedWith: string;
  permissions: Permission[];
  views: number;
  expiresIn: string;
  type: 'circle' | 'link';
};

type Circle = {
  id: string;
  name: string;
  color: string;
  members: number;
  activeShares: number;
};

const CIRCLES: Circle[] = [
  { id: 'engineering', name: 'Engineering Team', color: '#10B981', members: 8, activeShares: 23 },
  { id: 'design', name: 'Design Collaborators', color: '#8B5CF6', members: 4, activeShares: 12 },
  { id: 'research', name: 'Research Group', color: '#06B6D4', members: 6, activeShares: 8 },
  { id: 'advisors', name: 'Advisors', color: '#F59E0B', members: 3, activeShares: 4 },
];

const PERMISSION_LABELS: Record<Permission, { label: string; icon: typeof Eye }> = {
  view: { label: 'View', icon: Eye },
  annotate: { label: 'Annotate', icon: Edit3 },
  remix: { label: 'Remix', icon: Copy },
  reshare: { label: 'Reshare', icon: Share2 },
};

export function SecureCollaborationDemo() {
  const [activeTab, setActiveTab] = useState<'circles' | 'shares' | 'link'>('circles');
  const [selectedCircle, setSelectedCircle] = useState<string | null>(null);
  const [shares, setShares] = useState<ShareItem[]>([
    { id: '1', title: 'Authentication Patterns', sharedWith: 'Engineering Team', permissions: ['view', 'annotate'], views: 23, expiresIn: '2 days', type: 'circle' },
    { id: '2', title: 'Database Schema Design', sharedWith: 'Public Link', permissions: ['view'], views: 8, expiresIn: 'Never', type: 'link' },
    { id: '3', title: 'API Documentation', sharedWith: 'Design Team', permissions: ['view', 'annotate', 'remix'], views: 15, expiresIn: '1 week', type: 'circle' },
  ]);

  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-slate-900/50">
      <div className="flex border-b border-white/5">
        {[
          { id: 'circles', label: 'Circles', icon: Users },
          { id: 'shares', label: 'Active Shares', icon: Link2 },
          { id: 'link', label: 'Create Link', icon: Lock },
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
        {activeTab === 'circles' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-white">Your Circles</span>
              <span className="text-xs text-slate-500">{CIRCLES.reduce((a, c) => a + c.members, 0)} total members</span>
            </div>
            
            {CIRCLES.map(circle => (
              <motion.div
                key={circle.id}
                whileHover={{ scale: 1.01 }}
                onClick={() => setSelectedCircle(selectedCircle === circle.id ? null : circle.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-colors ${
                  selectedCircle === circle.id 
                    ? 'bg-violet-600/10 border-violet-500/30' 
                    : 'bg-slate-800/30 border-white/5 hover:border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: circle.color }}
                  />
                  <span className="text-sm font-medium text-white">{circle.name}</span>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span>{circle.members} members</span>
                  <span>{circle.activeShares} active shares</span>
                </div>

                <AnimatePresence>
                  {selectedCircle === circle.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-3 pt-3 border-t border-white/5"
                    >
                      <div className="flex gap-2">
                        {(['view', 'annotate', 'remix'] as Permission[]).map(perm => (
                          <span 
                            key={perm}
                            className="px-2 py-1 rounded bg-white/10 text-xs text-slate-400"
                          >
                            {PERMISSION_LABELS[perm].label}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'shares' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-sm font-medium text-white">Active Shares</span>
            </div>

            {shares.map(share => (
              <div
                key={share.id}
                className="p-3 rounded-xl bg-slate-800/30 border border-white/5"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="text-sm font-medium text-white">{share.title}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Shared with: <span className="text-cyan-400">{share.sharedWith}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="p-1 rounded hover:bg-red-500/20 text-slate-500 hover:text-red-400"
                    title="Revoke access"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex items-center gap-4 mt-3 text-xs">
                  <div className="flex items-center gap-1 text-slate-500">
                    <Eye className="w-3 h-3" />
                    {share.views} views
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3 h-3" />
                    {share.expiresIn}
                  </div>
                  <div className="flex gap-1 ml-auto">
                    {share.permissions.map(perm => (
                      <span 
                        key={perm}
                        className="px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-400 text-[10px]"
                      >
                        {PERMISSION_LABELS[perm].label}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'link' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-violet-600/10 to-cyan-600/10 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Lock className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-medium text-white">Create Secure Link</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Generate an encrypted link that only recipients can decrypt
              </p>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Permissions</label>
                  <div className="flex gap-2">
                    {(['view', 'annotate'] as Permission[]).map(perm => (
                      <label key={perm} className="flex items-center gap-1.5 text-xs text-slate-300">
                        <input type="checkbox" defaultChecked={perm === 'view'} className="rounded border-slate-600 bg-slate-800" />
                        {PERMISSION_LABELS[perm].label}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Expires</label>
                  <select className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none">
                    <option>1 hour</option>
                    <option>1 day</option>
                    <option>1 week</option>
                    <option>Never</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Max Views</label>
                  <input 
                    type="number" 
                    defaultValue={100}
                    className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none"
                  />
                </div>

                <label className="flex items-center gap-2 text-xs text-slate-300">
                  <input type="checkbox" defaultChecked className="rounded border-slate-600 bg-slate-800" />
                  Enable watermark
                </label>

                <button
                  type="button"
                  className="w-full py-2.5 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-600 text-white text-sm font-medium"
                >
                  Generate Secure Link
                </button>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="flex items-center gap-2 text-emerald-400 text-xs">
                <Shield className="w-4 h-4" />
                End-to-end encrypted - VIVIM never sees your data
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}