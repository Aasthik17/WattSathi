'use client';

import React from 'react';
import { Settings, ShieldCheck, Radio, Key, Globe, ExternalLink, ShieldAlert } from 'lucide-react';
import { AnalyticsOverview } from '../types';

interface SettingsViewProps {
  analytics: AnalyticsOverview | null;
  openSafetyModal: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  analytics,
  openSafetyModal,
}) => {
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
          <Settings className="w-5 h-5 text-amber-400" />
          System Settings & Platform Integration
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Bolna AI voice platform configuration, secure webhook endpoints, and safety compliance
        </p>
      </div>

      {/* Bolna Connection Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Radio className="w-4 h-4 text-amber-400" />
            Bolna Voice AI Integration
          </h3>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
            analytics?.bolna_connected
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : 'bg-amber-950 text-amber-300 border border-amber-800'
          }`}>
            {analytics?.bolna_connected ? 'Connected (API Key Verified)' : 'API Key Pending / Local Mode'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase text-[10px] font-semibold block">Configured Agent ID</span>
            <span className="font-mono text-slate-200">
              {analytics?.bolna_agent_id ? `${analytics.bolna_agent_id.slice(0, 14)}...` : 'Not Set in .env'}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="text-slate-500 uppercase text-[10px] font-semibold block">Bolna Wallet Balance</span>
            <span className="font-mono text-emerald-400 font-bold">
              {analytics?.wallet_balance !== null && analytics?.wallet_balance !== undefined
                ? `$${analytics.wallet_balance.toFixed(2)} USD`
                : '$5.00 Stated Balance'}
            </span>
          </div>
        </div>
      </div>

      {/* Webhook & Tool Endpoints */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Globe className="w-4 h-4 text-amber-400" />
            Backend Tool & Webhook Endpoints
          </h3>
          <span className="text-[10px] text-emerald-400 font-mono">Shared Secret Protected</span>
        </div>

        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Bolna Webhook Receiver URL</label>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-slate-200 text-[11px] select-all">
              POST https://your-domain.com/api/v1/webhooks/bolna
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Custom Function Tool: Manual Search</label>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-slate-200 text-[11px] select-all">
              POST https://your-domain.com/api/v1/bolna-tools/search-manual
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Custom Function Tool: Create Work Order</label>
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-slate-200 text-[11px] select-all">
              POST https://your-domain.com/api/v1/bolna-tools/create-work-order
            </div>
          </div>
        </div>
      </div>

      {/* Safety Policy & Escalation */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            Safety Policy & Escalation Rules
          </h3>
          <button
            onClick={openSafetyModal}
            className="text-xs text-amber-400 hover:underline"
          >
            View Full Policy Document
          </button>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          WattSathi is decision support for trained field personnel and does not replace certified electrical inspections.
          Under no circumstances does WattSathi direct technicians to open high-voltage enclosures, touch live conductors, or probe live circuits.
        </p>
      </div>
    </div>
  );
};

