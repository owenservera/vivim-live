"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, CheckCircle2, XCircle, UserCheck, UserPlus, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';

type IdentityState = 'STRANGER' | 'ACQUAINTANCE' | 'FAMILIAR' | 'KNOWN';

interface IdentityCardProps {
  confidenceScore: number;
  currentAvatar: IdentityState;
  onPromote?: () => void;
  onDismiss?: () => void;
}

const STATE_CONFIG: Record<IdentityState, { label: string; color: string; description: string }> = {
  STRANGER: {
    label: 'Anonymous',
    color: 'text-slate-400',
    description: 'No identity established yet',
  },
  ACQUAINTANCE: {
    label: 'Personalized',
    color: 'text-blue-400',
    description: 'Basic preferences recognized',
  },
  FAMILIAR: {
    label: 'Recognized',
    color: 'text-purple-400',
    description: 'Topics and entities familiar',
  },
  KNOWN: {
    label: 'Confirmed',
    color: 'text-emerald-400',
    description: 'Full identity verified',
  },
};

export function IdentityCard({ confidenceScore, currentAvatar, onPromote, onDismiss }: IdentityCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const config = STATE_CONFIG[currentAvatar];

  const isPromotable = currentAvatar === 'FAMILIAR' && confidenceScore >= 80;

  return (
    <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className={`w-5 h-5 ${config.color}`} />
            <CardTitle className="text-sm font-medium text-slate-200">
              Identity Status
            </CardTitle>
          </div>
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-slate-500 hover:text-slate-400"
          >
            {showDetails ? 'Hide' : 'Show'} details
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {currentAvatar === 'KNOWN' ? (
              <UserCheck className="w-8 h-8 text-emerald-400" />
            ) : currentAvatar === 'FAMILIAR' ? (
              <UserPlus className="w-8 h-8 text-purple-400" />
            ) : (
              <UserPlus className="w-8 h-8 text-slate-500" />
            )}
            <div>
              <p className={`text-lg font-semibold ${config.color}`}>{config.label}</p>
              <p className="text-xs text-slate-500">{config.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{confidenceScore}%</p>
            <p className="text-xs text-slate-500">confidence</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-slate-400">Identity Progress</span>
            <span className="text-slate-500">{confidenceScore}/100</span>
          </div>
          <Progress value={confidenceScore} className="h-2" />
        </div>

        {showDetails && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-2 pt-2 border-t border-slate-700/50"
          >
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded bg-slate-800/50">
                <p className="text-slate-400">Fingerprint</p>
                <p className="text-slate-500">Device signals</p>
              </div>
              <div className="p-2 rounded bg-slate-800/50">
                <p className="text-slate-400">Behavioral</p>
                <p className="text-slate-500">Patterns</p>
              </div>
              <div className="p-2 rounded bg-slate-800/50">
                <p className="text-slate-400">Contextual</p>
                <p className="text-slate-500">Memory</p>
              </div>
            </div>
          </motion.div>
        )}

        {isPromotable && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={onPromote}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              size="sm"
              type="button"
            >
              <Lock className="w-4 h-4 mr-2" />
              Lock Identity
            </Button>
            <Button
              onClick={onDismiss}
              variant="outline"
              size="sm"
              className="border-slate-700"
              type="button"
            >
              <XCircle className="w-4 h-4" />
            </Button>
          </div>
        )}

        {currentAvatar === 'STRANGER' && (
          <p className="text-xs text-slate-500 text-center">
            Keep chatting to build your identity profile
          </p>
        )}
      </CardContent>
    </Card>
  );
}
