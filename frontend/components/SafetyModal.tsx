'use client';

import React from 'react';
import { X, ShieldAlert, AlertTriangle, CheckCircle2, PhoneCall } from 'lucide-react';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-red-950 border border-red-800 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4 text-red-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                WattSathi Safety Policy & Mandatory Escalation Rules
              </h2>
              <p className="text-xs text-slate-400">
                Governed by docs/SAFETY_POLICY.md
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Immediate Stop Triggers */}
        <div className="bg-red-950/30 border border-red-900/60 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-red-300 uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            Mandatory Emergency Stop Triggers
          </div>
          <p className="text-xs text-red-200/90 leading-relaxed">
            Any report of the following terminates remote troubleshooting immediately:
          </p>
          <ul className="text-xs text-red-200/80 space-y-1 list-disc list-inside">
            <li>Smoke, flame, burning smell, arcing, crackling, or unusual heat</li>
            <li>Electric shock, tingling sensation, or energised exposed conductor</li>
            <li>Damaged cables, melted DC connectors, or damaged enclosure</li>
            <li>Water ingress or flooding near electrical equipment</li>
            <li>Repeated breaker or fuse trips</li>
            <li>Uncertainty about a hazardous condition</li>
          </ul>
        </div>

        {/* Disallowed Instructions */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            Strictly Disallowed AI Guidance
          </h3>
          <p className="text-slate-400 leading-relaxed">
            The AI model will never instruct callers to open inverter enclosures, remove protective covers, probe live AC/DC terminals, measure live circuits, or bypass grounding/fuses.
          </p>
        </div>

        {/* Allowed Observations */}
        <div className="space-y-2 text-xs">
          <h3 className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
            Allowed Interaction Scope
          </h3>
          <p className="text-slate-400 leading-relaxed">
            Only safe, non-invasive observations visible from a safe position (external display error code, status LED colour, monitoring app status) explicitly grounded in approved manuals are permitted.
          </p>
        </div>

        {/* Evidence Levels */}
        <div className="grid grid-cols-2 gap-3 text-xs pt-2">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="font-bold text-slate-200 block mb-1">Source Backed</span>
            <span className="text-slate-400 text-[11px]">
              Specific statement appears in approved, indexed document.
            </span>
          </div>
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
            <span className="font-bold text-amber-400 block mb-1">Unverified Observation</span>
            <span className="text-slate-400 text-[11px]">
              Observations recorded from technician; root cause remains uncertified until human engineer review.
            </span>
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs"
          >
            I Understand & Comply
          </button>
        </div>
      </div>
    </div>
  );
};

