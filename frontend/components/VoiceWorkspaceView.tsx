'use client';

import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  PhoneCall,
  ShieldAlert,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Send,
  Sparkles,
  Volume2,
  RefreshCw,
  PhoneForwarded,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { Asset, Site, SearchResponse, WorkOrder } from '../types';
import { api } from '../lib/api';

interface VoiceWorkspaceViewProps {
  sites: Site[];
  assets: Asset[];
  onWorkOrderCreated: (wo: WorkOrder) => void;
  openSafetyModal: () => void;
}

interface Message {
  role: 'assistant' | 'user' | 'system' | 'tool';
  text: string;
  metadata?: any;
}

export const VoiceWorkspaceView: React.FC<VoiceWorkspaceViewProps> = ({
  sites,
  assets,
  onWorkOrderCreated,
  openSafetyModal,
}) => {
  const [selectedSiteId, setSelectedSiteId] = useState<string>(
    sites[0]?.id || ''
  );
  const [selectedAssetId, setSelectedAssetId] = useState<string>(
    assets[0]?.id || ''
  );

  const [callState, setCallState] = useState<
    'idle' | 'connecting' | 'listening' | 'speaking' | 'emergency_stopped'
  >('idle');

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: 'Namaste, main WattSathi hoon — aapki solar maintenance support assistant. Main approved manual ke basis par safe checks mein help karunga. Pehle site ya inverter model aur visible issue confirm kijiye.',
    },
  ]);

  const [userInput, setUserInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [retrievedExcerpts, setRetrievedExcerpts] = useState<any[]>([]);
  const [pendingConfirmation, setPendingConfirmation] = useState<boolean>(false);
  const [createdTicket, setCreatedTicket] = useState<string | null>(null);

  // Phone Call test state
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [costAgreed, setCostAgreed] = useState<boolean>(false);
  const [phoneCallLoading, setPhoneCallLoading] = useState<boolean>(false);
  const [phoneCallMsg, setPhoneCallMsg] = useState<string | null>(null);

  const selectedAsset = assets.find((a) => a.id === selectedAssetId) || assets[0];
  const selectedSite = sites.find((s) => s.id === selectedSiteId) || sites[0];

  // Emergency safety keywords
  const safetyKeywords = ['smoke', 'fire', 'burning', 'shock', 'spark', 'arcing', 'water', 'flood', 'tingling', 'current', 'damaged cable', 'short circuit'];

  const checkSafetyHazards = (input: string): boolean => {
    const lower = input.toLowerCase();
    for (const kw of safetyKeywords) {
      if (lower.includes(kw)) {
        return true;
      }
    }
    return false;
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || userInput).trim();
    if (!text) return;

    setUserInput('');
    setMessages((prev) => [...prev, { role: 'user', text }]);

    // Check emergency hazard stop
    if (checkSafetyHazards(text)) {
      setCallState('emergency_stopped');
      setMessages((prev) => [
        ...prev,
        {
          role: 'system',
          text: 'EMERGENCY SAFETY STOP ACTIVATED: Hazard reported. Remote troubleshooting is terminated immediately.',
        },
        {
          role: 'assistant',
          text: 'Rukiye! Kripya upkaran se turant door hat jayiye aur kisi bhi cable ya cover ko bilkul na chhuein. Apne site electrical lead aur emergency contact ko inform kijiye.',
        },
      ]);
      return;
    }

    setLoading(true);
    setCallState('speaking');

    try {
      // If we are awaiting confirmation for a work order
      const isAffirmative = /^(haan|ha|yes|create|theek|kardo|kar do|confirm|bilkul)/i.test(text.toLowerCase());
      if (pendingConfirmation && isAffirmative) {
        // Call backend work order creation tool
        const toolSecret = 'wattsathi-tool-secret-key-change-in-prod';
        const woRes = await fetch('http://localhost:8000/api/v1/bolna-tools/create-work-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${toolSecret}`,
          },
          body: JSON.stringify({
            asset_code: selectedAsset?.asset_code || 'WS-DEMO-001',
            site_id: selectedSite?.id,
            issue_title: 'GRID-STATUS-WARN notification on inverter display',
            observations: [
              'Technician safely noted GRID-STATUS-WARN on display',
              'No smoke, flame, burning smell or electrical hazard reported',
            ],
            suspected_cause: null,
            recommended_safe_next_step: 'Qualified senior engineer review for grid voltage parameter check',
            priority: 'normal',
            caller_confirmed: true,
            idempotency_key: `voice-wo-${Date.now()}`,
          }),
        });

        if (!woRes.ok) {
          const errData = await woRes.json();
          throw new Error(errData.error?.message || 'Work order creation rejected');
        }

        const woData = await woRes.json();
        setCreatedTicket(woData.work_order_number);
        setPendingConfirmation(false);

        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: `Aapke confirmation ke basis par work order ${woData.work_order_number} create ho gaya hai. Status 'unverified' hai aur isse senior engineer review karenge. Display ke alawa kisi wiring ko na chhuein. Dhanyawaad!`,
            metadata: { work_order_number: woData.work_order_number },
          },
        ]);

        // Refresh work orders in parent
        const updatedOrders = await api.getWorkOrders();
        const created = updatedOrders.find((w) => w.work_order_number === woData.work_order_number);
        if (created) onWorkOrderCreated(created);

        setLoading(false);
        setCallState('idle');
        return;
      }

      // Normal turn: Query manual search tool
      const toolSecret = 'wattsathi-tool-secret-key-change-in-prod';
      const searchRes = await fetch('http://localhost:8000/api/v1/bolna-tools/search-manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${toolSecret}`,
        },
        body: JSON.stringify({
          query: text,
          asset_code: selectedAsset?.asset_code || 'WS-DEMO-001',
          model: selectedAsset?.model || 'DV-3K-SIM',
          language: 'hi-Latn',
        }),
      });

      const searchData = await searchRes.json();
      setRetrievedExcerpts(searchData.matches || []);

      if (searchData.no_reliable_match || !searchData.matches?.length) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: 'Is model ya fault ke liye approved manual guidance nahi mil rahi. Main guess nahi karunga; isse senior engineer ko escalate karte hain. Kya main escalation work order create kar doon?',
          },
        ]);
        setPendingConfirmation(true);
      } else {
        const topMatch = searchData.matches[0];
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            text: `Approved manual (${topMatch.source_title}, ${topMatch.page_or_section}) ke mutabik: ${topMatch.excerpt.slice(0, 220)}... Display text ko note karein, enclosure mat kholiye aur wiring ko touch mat kijiye. Kya main in details ke saath senior engineer ke review ke liye work order create kar doon?`,
            metadata: {
              source: topMatch.source_title,
              section: topMatch.page_or_section,
              is_simulated: topMatch.is_simulated,
            },
          },
        ]);
        setPendingConfirmation(true);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Action complete nahi ho saka: ${err.message}. Senior engineer se manually sampark karein.`,
        },
      ]);
    } finally {
      setLoading(false);
      setCallState('idle');
    }
  };

  const handleInitiatePhoneCall = async () => {
    if (!phoneNumber.trim()) {
      alert('Please enter a valid phone number in E.164 format (e.g. +919876543210)');
      return;
    }
    if (!costAgreed) {
      alert('Please check the confirmation box authorizing the test call.');
      return;
    }

    setPhoneCallLoading(true);
    setPhoneCallMsg(null);
    try {
      const res = await api.initiateTestCall(
        phoneNumber.trim(),
        selectedSite?.id || '',
        selectedAsset?.id || '',
        true
      );
      setPhoneCallMsg(`Call queued successfully! Execution ID: ${res.execution_id}`);
    } catch (err: any) {
      setPhoneCallMsg(`Call failed: ${err.message}`);
    } finally {
      setPhoneCallLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left 8 Cols: Interactive Voice Workspace */}
      <div className="lg:col-span-8 space-y-5">
        {/* Context bar: Site and Asset selection */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
                Selected Asset
              </label>
              <div className="font-mono text-sm font-bold text-amber-400">
                {selectedAsset?.asset_code} ({selectedAsset?.model})
              </div>
            </div>
            <div className="border-l border-slate-800 pl-3">
              <label className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
                Site
              </label>
              <div className="text-sm font-medium text-slate-200">
                {selectedSite?.name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
              callState === 'emergency_stopped'
                ? 'bg-red-950 text-red-300 border border-red-800'
                : callState === 'speaking'
                ? 'bg-amber-950 text-amber-300 border border-amber-800 animate-pulse'
                : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                callState === 'emergency_stopped' ? 'bg-red-400' : callState === 'speaking' ? 'bg-amber-400' : 'bg-emerald-400'
              }`} />
              {callState === 'emergency_stopped'
                ? 'Safety Stop'
                : callState === 'speaking'
                ? 'Agent Speaking'
                : 'Ready for Technician'}
            </span>
          </div>
        </div>

        {/* Conversation turns & transcript console */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col h-[480px]">
          <div className="flex-1 overflow-y-auto space-y-4 pr-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 px-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                    {msg.role === 'assistant'
                      ? 'WattSathi Voice Assistant'
                      : msg.role === 'user'
                      ? 'Technician (You)'
                      : 'System Guardrail'}
                  </span>
                </div>
                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-br-none shadow-sm'
                      : msg.role === 'system'
                      ? 'bg-red-950/80 border border-red-800 text-red-200 rounded-bl-none'
                      : 'bg-slate-800/80 border border-slate-700/80 text-slate-100 rounded-bl-none'
                  }`}
                >
                  <p>{msg.text}</p>
                  {msg.metadata?.work_order_number && (
                    <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between text-xs text-amber-300 font-mono">
                      <span>Ticket: {msg.metadata.work_order_number}</span>
                      <span className="bg-amber-500/20 px-2 py-0.5 rounded text-[10px]">Logged in Dashboard</span>
                    </div>
                  )}
                  {msg.metadata?.source && (
                    <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center gap-2 text-xs text-slate-400">
                      <FileText className="w-3.5 h-3.5 text-amber-400" />
                      <span>{msg.metadata.source} ({msg.metadata.section})</span>
                      {msg.metadata.is_simulated && (
                        <span className="bg-amber-950 border border-amber-800 text-amber-400 text-[10px] px-1.5 py-0.2 rounded font-mono">
                          Simulated
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-amber-400 font-medium animate-pulse p-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Searching approved manual & verifying grounded safety checks...</span>
              </div>
            )}
          </div>

          {/* Quick Demo Voice Prompts */}
          <div className="pt-3 border-t border-slate-800/80 mb-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Demo Prompts:
            </span>
            <button
              onClick={() =>
                handleSendMessage(
                  'Demo site par DemoVolt 3 kilowatt inverter hai. Display par GRID-STATUS-WARN likha aa raha hai. Iska approved manual kya batata hai?'
                )
              }
              className="text-xs px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition font-sans"
            >
              "Display par GRID-STATUS-WARN likha aa raha hai..."
            </button>
            <button
              onClick={() => handleSendMessage('Haan, work order create kar do.')}
              className="text-xs px-3 py-1.5 rounded-md bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 transition"
            >
              "Haan, work order create kar do."
            </button>
            <button
              onClick={() => handleSendMessage('Inverter se smoke aur burning smell aa rahi hai!')}
              className="text-xs px-3 py-1.5 rounded-md bg-red-950/40 hover:bg-red-950/60 text-red-300 border border-red-800/60 transition"
            >
              Test Hazard Stop: "Smoke aa rahi hai"
            </button>
          </div>

          {/* Spoken input box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Speak or type in Hindi/Hinglish (e.g., GRID-STATUS-WARN dikh raha hai)..."
              disabled={loading || callState === 'emergency_stopped'}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              disabled={loading || !userInput.trim() || callState === 'emergency_stopped'}
              className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-semibold text-sm transition flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>

      {/* Right 4 Cols: Grounded Citations & Outbound Phone Test */}
      <div className="lg:col-span-4 space-y-5">
        {/* Retrieved Citations Panel */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Grounded Excerpts ({retrievedExcerpts.length})
            </h3>
            <span className="text-[10px] text-emerald-400 font-medium">Source-Backed</span>
          </div>

          <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
            {retrievedExcerpts.length === 0 ? (
              <div className="text-xs text-slate-500 py-6 text-center">
                Ask a troubleshooting question to view live source excerpts.
              </div>
            ) : (
              retrievedExcerpts.map((ex, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-300 mb-1">
                    <span>{ex.source_title}</span>
                    {ex.is_simulated && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                        Simulated
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-amber-400 font-mono mb-1">
                    {ex.page_or_section}
                  </div>
                  <p className="text-slate-400 leading-snug line-clamp-3">
                    {ex.excerpt}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Live Phone Test Call Controller with $5 Credit Shield */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-amber-400" />
              Outbound Phone Call Test
            </h3>
            <span className="text-[10px] bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded font-mono">
              Credit Guard
            </span>
          </div>

          <div className="text-xs text-slate-400 leading-relaxed">
            Test a live call to your personal device. Under safety policy, calls are limited to 120s and require deliberate manual authorization.
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Recipient Phone Number (E.164)
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+919876543210"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300 select-none">
              <input
                type="checkbox"
                checked={costAgreed}
                onChange={(e) => setCostAgreed(e.target.checked)}
                className="mt-0.5 rounded bg-slate-950 border-slate-700 text-amber-500 focus:ring-0"
              />
              <span>
                I deliberately authorize placing this single paid test call and understand it will consume Bolna account credits.
              </span>
            </label>

            <button
              onClick={handleInitiatePhoneCall}
              disabled={phoneCallLoading || !costAgreed || !phoneNumber.trim()}
              className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 font-semibold text-xs transition border border-slate-700 flex items-center justify-center gap-2"
            >
              {phoneCallLoading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Connecting to Bolna...</span>
                </>
              ) : (
                <>
                  <PhoneForwarded className="w-3.5 h-3.5 text-amber-400" />
                  <span>Call My Phone</span>
                </>
              )}
            </button>

            {phoneCallMsg && (
              <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300">
                {phoneCallMsg}
              </div>
            )}
          </div>
        </div>

        {/* Safety Quick Rules Card */}
        <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-300 font-semibold text-xs mb-1.5">
            <ShieldAlert className="w-4 h-4 text-red-400" />
            Safety Policy Limits
          </div>
          <p className="text-[11px] text-red-200/80 leading-relaxed">
            WattSathi never directs technicians to open live enclosures, touch AC/DC wiring, or probe terminals. Diagnosis is marked unverified until certified by a human engineer.
          </p>
        </div>
      </div>
    </div>
  );
};

