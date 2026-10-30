'use client';

import React from 'react';
import {
  LayoutDashboard,
  Mic,
  Cpu,
  BookOpen,
  ClipboardList,
  PhoneCall,
  Settings,
  ShieldAlert,
  Zap
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  openSafetyModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  openSafetyModal,
}) => {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'voice', label: 'Voice Workspace', icon: Mic, highlight: true },
    { id: 'sites', label: 'Sites & Assets', icon: Cpu },
    { id: 'knowledge', label: 'Knowledge Base', icon: BookOpen },
    { id: 'work_orders', label: 'Work Orders', icon: ClipboardList },
    { id: 'calls', label: 'Calls & Telemetry', icon: PhoneCall },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen sticky top-0 select-none">
      {/* Brand */}
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-slate-100 tracking-tight leading-tight">
              WattSathi
            </h1>
            <p className="text-xs text-amber-400/90 font-medium tracking-wide">
              Voice AI Field Engineer
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
          Field Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.highlight && (
                <span className="ml-auto flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Safety Policy Alert Button */}
      <div className="p-4 border-t border-slate-800">
        <button
          onClick={openSafetyModal}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 hover:bg-red-950/70 transition-colors text-xs font-medium"
        >
          <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
          <div className="text-left">
            <div className="font-semibold text-red-200">Safety Stop Rules</div>
            <div className="text-[10px] text-red-400/80">Hazard escalation policy</div>
          </div>
        </button>
      </div>
    </aside>
  );
};

