'use client';

import React from 'react';
import {
  Building2,
  Cpu,
  ClipboardList,
  PhoneCall,
  Mic,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { AnalyticsOverview, CallItem, WorkOrder } from '../types';

interface OverviewViewProps {
  analytics: AnalyticsOverview | null;
  calls: CallItem[];
  workOrders: WorkOrder[];
  onStartVoice: () => void;
  onOpenSafetyModal: () => void;
  onSelectWorkOrder: (wo: WorkOrder) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  analytics,
  calls,
  workOrders,
  onStartVoice,
  onOpenSafetyModal,
  onSelectWorkOrder,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner: Statement & Vision */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/20 border border-slate-800 rounded-xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-2">
            Rooftop Solar O&M Intelligence
          </div>
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight">
            Expert guidance for every field technician.
          </h2>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            WattSathi pairs frontline solar technicians with real-time, Hindi/Hinglish voice troubleshooting grounded strictly in manufacturer manuals and safety SOPs.
          </p>
        </div>
        <button
          onClick={onStartVoice}
          className="flex items-center gap-2 px-5 py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-sm transition-colors shadow-lg shadow-amber-500/10 shrink-0"
        >
          <Mic className="w-4 h-4 text-slate-950" />
          <span>Talk to WattSathi</span>
          <ArrowRight className="w-4 h-4 text-slate-950" />
        </button>
      </div>

      {/* Mandatory Simulated Training Fixture Notice */}
      <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <strong className="text-amber-300 font-semibold uppercase tracking-wide">
            SIMULATED TRAINING FIXTURE ACTIVE — NOT A REAL MANUFACTURER MANUAL:
          </strong>{' '}
          The indexed manual (<code className="bg-amber-950/60 px-1 py-0.5 rounded text-amber-200 font-mono">DemoVolt DV-3K-SIM</code>) and display fault code (<code className="bg-amber-950/60 px-1 py-0.5 rounded text-amber-200 font-mono">GRID-STATUS-WARN</code>) are fictional fixtures for system demonstration and safety validation. Never use demo documents to service live electrical equipment.
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Active Sites</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold text-slate-100 font-mono">
            {analytics?.active_sites ?? 1}
          </div>
          <div className="text-xs text-slate-500 mt-1">100% operational coverage</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Monitored Inverters</span>
            <Cpu className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold text-slate-100 font-mono">
            {analytics?.active_assets ?? 1}
          </div>
          <div className="text-xs text-emerald-400/90 flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> DemoVolt DV-3K-SIM
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Open Work Orders</span>
            <ClipboardList className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold text-amber-400 font-mono">
            {analytics?.open_work_orders ?? workOrders.filter(w => w.status === 'open').length}
          </div>
          <div className="text-xs text-slate-500 mt-1">Pending human engineer review</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Voice Calls</span>
            <PhoneCall className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-3xl font-bold text-slate-100 font-mono">
            {analytics?.total_calls ?? calls.length}
          </div>
          <div className="text-xs text-slate-500 mt-1">
            {analytics?.calls_this_week ?? calls.length} this week
          </div>
        </div>
      </div>

      {/* Two Column Grid: Priority Work Orders & Recent Calls */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Open Work Orders */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-200">
                Work Orders Needing Attention
              </h3>
              <p className="text-xs text-slate-400">
                Created strictly after explicit technician confirmation
              </p>
            </div>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              {workOrders.length} total
            </span>
          </div>

          <div className="space-y-3">
            {workOrders.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No work orders logged yet. Start a voice session to create one.
              </div>
            ) : (
              workOrders.slice(0, 4).map((wo) => (
                <div
                  key={wo.id}
                  onClick={() => onSelectWorkOrder(wo)}
                  className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition cursor-pointer flex items-start justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-slate-200">
                        {wo.work_order_number}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        wo.priority === 'urgent'
                          ? 'bg-red-950/80 text-red-300 border border-red-800/60'
                          : wo.priority === 'high'
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {wo.priority}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        wo.diagnosis_state === 'human_verified'
                          ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                          : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                      }`}>
                        {wo.diagnosis_state === 'human_verified' ? 'Human Verified' : 'Unverified'}
                      </span>
                    </div>
                    <div className="text-xs text-slate-300 font-medium">
                      {wo.issue_title}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">
                      Safe next step: {wo.recommended_safe_next_step}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-500 shrink-0 mt-2" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Calls */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-200">
                Recent Voice Sessions
              </h3>
              <p className="text-xs text-slate-400">
                Grounded Bolna voice interactions & transcripts
              </p>
            </div>
            <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              {calls.length} logs
            </span>
          </div>

          <div className="space-y-3">
            {calls.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500">
                No calls recorded yet. Open the Voice Workspace to initiate a test turn.
              </div>
            ) : (
              calls.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-slate-400">
                        {c.bolna_execution_id ? c.bolna_execution_id.slice(0, 8) + '...' : 'Web Session'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        c.status === 'completed'
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60'
                          : c.status === 'in-progress'
                          ? 'bg-blue-950 text-blue-400 border border-blue-800/60'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {c.status}
                      </span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        {c.language}
                      </span>
                    </div>
                    <div className="text-slate-300 line-clamp-1">
                      {c.summary || 'Technician inquired about solar inverter fault code.'}
                    </div>
                  </div>
                  <div className="text-right text-slate-400 shrink-0">
                    <div className="flex items-center gap-1 justify-end font-mono">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {c.duration_seconds}s
                    </div>
                    {c.cost_amount !== null && c.cost_amount !== undefined && (
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        ${c.cost_amount.toFixed(3)}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

