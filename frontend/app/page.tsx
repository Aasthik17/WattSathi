'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '../components/Sidebar';
import { Header } from '../components/Header';
import { OverviewView } from '../components/OverviewView';
import { VoiceWorkspaceView } from '../components/VoiceWorkspaceView';
import { SitesAssetsView } from '../components/SitesAssetsView';
import { KnowledgeBaseView } from '../components/KnowledgeBaseView';
import { WorkOrdersView } from '../components/WorkOrdersView';
import { CallsView } from '../components/CallsView';
import { SettingsView } from '../components/SettingsView';
import { SafetyModal } from '../components/SafetyModal';
import { api } from '../lib/api';
import {
  Site,
  Asset,
  DocumentItem,
  WorkOrder,
  CallItem,
  AnalyticsOverview,
} from '../types';

export default function Home() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [safetyModalOpen, setSafetyModalOpen] = useState<boolean>(false);

  const [sites, setSites] = useState<Site[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [calls, setCalls] = useState<CallItem[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      // Auto-authenticate with demo admin if needed
      try {
        await api.getMe();
      } catch {
        await api.login('admin@example.com', 'wattsathi_admin_password_2026');
      }

      const [sitesData, assetsData, docsData, woData, callsData, anData] =
        await Promise.all([
          api.getSites().catch(() => []),
          api.getAssets().catch(() => []),
          api.getDocuments().catch(() => []),
          api.getWorkOrders().catch(() => []),
          api.getCalls().catch(() => []),
          api.getAnalyticsOverview().catch(() => null),
        ]);

      setSites(sitesData);
      setAssets(assetsData);
      setDocuments(docsData);
      setWorkOrders(woData);
      setCalls(callsData);
      setAnalytics(anData);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleWorkOrderCreated = (wo: WorkOrder) => {
    setWorkOrders((prev) => [wo, ...prev]);
    loadData();
  };

  return (
    <div className="flex bg-[#090d16] min-h-screen text-slate-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Left Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        openSafetyModal={() => setSafetyModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          bolnaConnected={analytics?.bolna_connected ?? false}
          walletBalance={analytics?.wallet_balance}
          openSafetyModal={() => setSafetyModalOpen(true)}
        />

        <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {currentTab === 'overview' && (
            <OverviewView
              analytics={analytics}
              calls={calls}
              workOrders={workOrders}
              onStartVoice={() => setCurrentTab('voice')}
              onOpenSafetyModal={() => setSafetyModalOpen(true)}
              onSelectWorkOrder={(wo) => {
                setCurrentTab('work_orders');
              }}
            />
          )}

          {currentTab === 'voice' && (
            <VoiceWorkspaceView
              sites={sites}
              assets={assets}
              onWorkOrderCreated={handleWorkOrderCreated}
              openSafetyModal={() => setSafetyModalOpen(true)}
            />
          )}

          {currentTab === 'sites' && (
            <SitesAssetsView
              sites={sites}
              assets={assets}
              onRefresh={loadData}
            />
          )}

          {currentTab === 'knowledge' && (
            <KnowledgeBaseView
              documents={documents}
              onRefresh={loadData}
            />
          )}

          {currentTab === 'work_orders' && (
            <WorkOrdersView
              workOrders={workOrders}
              onRefresh={loadData}
            />
          )}

          {currentTab === 'calls' && (
            <CallsView
              calls={calls}
              onRefresh={loadData}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              analytics={analytics}
              openSafetyModal={() => setSafetyModalOpen(true)}
            />
          )}
        </main>
      </div>

      {/* Safety Policy Modal */}
      <SafetyModal
        isOpen={safetyModalOpen}
        onClose={() => setSafetyModalOpen(false)}
      />
    </div>
  );
}
