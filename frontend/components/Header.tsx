'use client';

import React from 'react';
import { ShieldCheck, PhoneForwarded, Radio } from 'lucide-react';

interface HeaderProps {
  bolnaConnected: boolean;
  walletBalance?: number;
  openSafetyModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  bolnaConnected,
  walletBalance,
  openSafetyModal,
}) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-slate-300">
          Demo Workspace
        </span>
        <span className="text-slate-600">/</span>
        <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700 font-mono">
          SITE-ROOFTOP-01 (15 kW)
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Bolna Status Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs">
          <Radio className={`w-3.5 h-3.5 ${bolnaConnected ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
          <span className="text-slate-300 font-medium">
            Bolna Voice:{' '}
            {bolnaConnected ? (
              <span className="text-emerald-400 font-semibold">Active</span>
            ) : (
              <span className="text-amber-400 font-semibold">Offline / Test Mode</span>
            )}
          </span>
          {walletBalance !== undefined && walletBalance !== null && (
            <span className="text-slate-400 border-l border-slate-700 pl-2 font-mono">
              ${walletBalance.toFixed(2)}
            </span>
          )}
        </div>

        {/* Electrical Safety Escalation Link */}
        <button
          onClick={openSafetyModal}
          className="flex items-center gap-1.5 text-xs text-slate-300 bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-md border border-slate-700 transition"
        >
          <PhoneForwarded className="w-3.5 h-3.5 text-amber-400" />
          <span>Emergency Lead</span>
        </button>
      </div>
    </header>
  );
};

