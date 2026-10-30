'use client';

import React, { useState } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Clock,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Filter
} from 'lucide-react';
import { WorkOrder } from '../types';
import { api } from '../lib/api';

interface WorkOrdersViewProps {
  workOrders: WorkOrder[];
  onRefresh: () => void;
}

export const WorkOrdersView: React.FC<WorkOrdersViewProps> = ({
  workOrders,
  onRefresh,
}) => {
  const [selectedWo, setSelectedWo] = useState<WorkOrder | null>(
    workOrders[0] || null
  );
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showVerifyModal, setShowVerifyModal] = useState<boolean>(false);
  const [verifiedCause, setVerifiedCause] = useState<string>('');
  const [verifyNotes, setVerifyNotes] = useState<string>('');
  const [verifying, setVerifying] = useState<boolean>(false);

  const filteredOrders = workOrders.filter((wo) => {
    if (statusFilter === 'all') return true;
    return wo.status === statusFilter;
  });

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWo || !verifiedCause.trim()) return;

    setVerifying(true);
    try {
      const updated = await api.verifyWorkOrder(
        selectedWo.id,
        verifiedCause.trim(),
        verifyNotes.trim() || undefined
      );
      setSelectedWo(updated);
      setShowVerifyModal(false);
      setVerifiedCause('');
      setVerifyNotes('');
      onRefresh();
    } catch (err: any) {
      alert(`Verification failed: ${err.message}`);
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and filter row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-amber-400" />
            Field Work Orders
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Created only after explicit technician confirmation during voice troubleshooting
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
          >
            <option value="all">All Statuses ({workOrders.length})</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Work Orders List */}
        <div className="lg:col-span-5 space-y-3">
          {filteredOrders.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center text-xs text-slate-500">
              No work orders match the current filter.
            </div>
          ) : (
            filteredOrders.map((wo) => {
              const isSelected = selectedWo?.id === wo.id;
              return (
                <div
                  key={wo.id}
                  onClick={() => setSelectedWo(wo)}
                  className={`p-4 rounded-xl border transition cursor-pointer space-y-2 ${
                    isSelected
                      ? 'bg-slate-800/90 border-amber-500/80 shadow-md'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-amber-400">
                      {wo.work_order_number}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        wo.priority === 'urgent'
                          ? 'bg-red-950 text-red-300 border border-red-800'
                          : wo.priority === 'high'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        {wo.priority}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                        wo.diagnosis_state === 'human_verified'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {wo.diagnosis_state === 'human_verified' ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-sm font-semibold text-slate-100 line-clamp-1">
                    {wo.issue_title}
                  </h3>

                  <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60 font-mono">
                    <span>{wo.asset_code || 'WS-DEMO-001'}</span>
                    <span>{wo.created_at.slice(0, 10)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right 7 Cols: Detailed Work Order Inspector */}
        <div className="lg:col-span-7">
          {selectedWo ? (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-5">
              <div className="flex items-start justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-base font-bold text-amber-400">
                      {selectedWo.work_order_number}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono uppercase">
                      {selectedWo.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100">
                    {selectedWo.issue_title}
                  </h3>
                </div>

                {selectedWo.diagnosis_state !== 'human_verified' && (
                  <button
                    onClick={() => setShowVerifyModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-bold transition shadow-sm"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Human Verify</span>
                  </button>
                )}
              </div>

              {/* Diagnosis State Alert Box */}
              <div className={`p-4 rounded-xl border text-xs flex items-start gap-3 ${
                selectedWo.diagnosis_state === 'human_verified'
                  ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                  : 'bg-amber-950/30 border-amber-800/60 text-amber-300'
              }`}>
                {selectedWo.diagnosis_state === 'human_verified' ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                )}
                <div>
                  <div className="font-bold uppercase tracking-wider text-[11px]">
                    {selectedWo.diagnosis_state === 'human_verified'
                      ? 'Root Cause Verified by Qualified Engineer'
                      : 'Unverified Observation — Pending Qualified Engineer Review'}
                  </div>
                  <div className="text-slate-300 text-[11px] mt-0.5">
                    {selectedWo.diagnosis_state === 'human_verified'
                      ? `Certified cause: ${selectedWo.suspected_cause}`
                      : 'The AI assistant collected technician observations only. Safety policy requires human inspection before root cause confirmation.'}
                  </div>
                </div>
              </div>

              {/* Observations */}
              <div className="space-y-2 text-xs">
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block">
                  Field Observations (Caller Verified)
                </span>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-1.5">
                  {selectedWo.observations?.map((obs, i) => (
                    <div key={i} className="text-slate-200 flex items-start gap-2">
                      <span className="text-amber-400">•</span>
                      <span>{obs}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Safe Next Step */}
              <div className="space-y-1.5 text-xs">
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block">
                  Safe Recommended Next Action
                </span>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-medium">
                  {selectedWo.recommended_safe_next_step}
                </div>
              </div>

              {/* Metadata details */}
              <div className="grid grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-800/60">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Asset</span>
                  <span className="text-slate-300 font-mono">{selectedWo.asset_code || 'WS-DEMO-001'} ({selectedWo.asset_model || 'DV-3K-SIM'})</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-semibold">Caller Confirmation</span>
                  <span className="text-emerald-400 font-medium">Explicitly Confirmed</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-12 text-center text-xs text-slate-500">
              Select a work order from the list to inspect details.
            </div>
          )}
        </div>
      </div>

      {/* Human Verification Modal */}
      {showVerifyModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-400" />
              Human Engineer Verification
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              As a qualified engineer, certify the verified root cause for <strong className="text-slate-200">{selectedWo?.work_order_number}</strong> after on-site or electrical diagram inspection.
            </p>

            <form onSubmit={handleVerify} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Verified Root Cause
                </label>
                <input
                  type="text"
                  value={verifiedCause}
                  onChange={(e) => setVerifiedCause(e.target.value)}
                  placeholder="e.g. Grid frequency dip outside inverter trip threshold"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-semibold block mb-1">
                  Inspection Notes & SOP Reference
                </label>
                <textarea
                  value={verifyNotes}
                  onChange={(e) => setVerifyNotes(e.target.value)}
                  placeholder="e.g. Tested grid supply voltage with multimeters after isolating safely. Grid frequency restored."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVerifyModal(false)}
                  className="px-4 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifying || !verifiedCause.trim()}
                  className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-slate-950 font-bold"
                >
                  {verifying ? 'Certifying...' : 'Certify & Verify Root Cause'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

