'use client';

import React, { useState } from 'react';
import { PhoneCall, Clock, DollarSign, FileText, ExternalLink, ShieldCheck, Headphones } from 'lucide-react';
import { CallItem, CallDetail } from '../types';
import { api } from '../lib/api';

interface CallsViewProps {
  calls: CallItem[];
  onRefresh: () => void;
}

export const CallsView: React.FC<CallsViewProps> = ({ calls, onRefresh }) => {
  const [selectedCall, setSelectedCall] = useState<CallDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleSelectCall = async (callId: string) => {
    setLoadingDetail(true);
    try {
      const detail = await api.getCall(callId);
      setSelectedCall(detail);
    } catch (err: any) {
      alert(`Failed to load call detail: ${err.message}`);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <PhoneCall className="w-5 h-5 text-amber-400" />
            Calls & Telemetry Logs
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real Bolna voice session records, durations, costs, and transcripts
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 6 Cols: Call List */}
        <div className="lg:col-span-6 space-y-3">
          {calls.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500">
              No voice sessions recorded yet. Start a conversation in the Voice Workspace.
            </div>
          ) : (
            calls.map((c) => {
              const isSelected = selectedCall?.id === c.id;
              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectCall(c.id)}
                  className={`p-4 rounded-xl border transition cursor-pointer space-y-2 text-xs ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500/80 shadow-md'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-slate-200">
                      {c.bolna_execution_id ? c.bolna_execution_id.slice(0, 12) + '...' : 'Web Session'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      c.status === 'completed'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : c.status === 'in-progress'
                        ? 'bg-blue-950 text-blue-400 border border-blue-800'
                        : 'bg-slate-800 text-slate-300'
                    }`}>
                      {c.status}
                    </span>
                  </div>

                  <p className="text-slate-300 line-clamp-1">
                    {c.summary || 'Technician reported display fault code. Manual guidance provided.'}
                  </p>

                  <div className="flex items-center justify-between text-slate-500 font-mono text-[11px] pt-1 border-t border-slate-800/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {c.duration_seconds}s ({c.channel})
                    </span>
                    <span>
                      {c.cost_amount !== null && c.cost_amount !== undefined
                        ? `$${c.cost_amount.toFixed(3)}`
                        : 'Bundled / Free'}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right 6 Cols: Call Details & Transcript */}
        <div className="lg:col-span-6">
          {selectedCall ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 text-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div>
                  <div className="font-mono text-xs font-bold text-amber-400">
                    Execution: {selectedCall.bolna_execution_id || 'Web Call SDK'}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Channel: {selectedCall.channel.toUpperCase()} • Language: {selectedCall.language}
                  </div>
                </div>
                <span className="bg-slate-800 px-2 py-1 rounded text-slate-300 font-mono">
                  {selectedCall.duration_seconds}s
                </span>
              </div>

              {/* Summary */}
              <div>
                <span className="font-semibold text-slate-400 uppercase text-[10px] block mb-1">
                  AI Call Summary
                </span>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200">
                  {selectedCall.summary || 'Summary not provided by voice platform.'}
                </div>
              </div>

              {/* Transcript */}
              <div>
                <span className="font-semibold text-slate-400 uppercase text-[10px] block mb-1">
                  Full Transcript
                </span>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-sans leading-relaxed max-h-[220px] overflow-y-auto">
                  {selectedCall.transcript_text || 'Live audio transcript not recorded.'}
                </div>
              </div>

              {/* Cost & Metrics */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/60 font-mono text-[11px]">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Execution Cost</span>
                  <span className="text-amber-400">
                    {selectedCall.cost_amount !== null && selectedCall.cost_amount !== undefined
                      ? `$${selectedCall.cost_amount.toFixed(4)} USD`
                      : 'Not reported by provider'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Linked Tickets</span>
                  <span className="text-slate-300">
                    {selectedCall.work_orders?.length ? selectedCall.work_orders.join(', ') : 'None'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-xs text-slate-500">
              Select a call session to view details and transcripts.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

