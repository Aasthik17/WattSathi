'use client';

import React, { useState } from 'react';
import { Building2, Cpu, Plus, CheckCircle2, ShieldCheck, MapPin, Calendar, Wrench } from 'lucide-react';
import { Site, Asset } from '../types';
import { api } from '../lib/api';

interface SitesAssetsViewProps {
  sites: Site[];
  assets: Asset[];
  onRefresh: () => void;
}

export const SitesAssetsView: React.FC<SitesAssetsViewProps> = ({
  sites,
  assets,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'assets' | 'sites'>('assets');
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [newAssetCode, setNewAssetCode] = useState('');
  const [newManufacturer, setNewManufacturer] = useState('');
  const [newModel, setNewModel] = useState('');
  const [newCapacity, setNewCapacity] = useState('5.0');
  const [selectedSiteId, setSelectedSiteId] = useState(sites[0]?.id || '');

  const handleCreateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssetCode || !newManufacturer || !newModel) return;

    try {
      await api.createAsset({
        site_id: selectedSiteId,
        asset_code: newAssetCode.trim(),
        category: 'inverter',
        manufacturer: newManufacturer.trim(),
        model: newModel.trim(),
        rated_capacity_kw: parseFloat(newCapacity) || 3.0,
        is_active: true,
      });
      setShowAssetModal(false);
      setNewAssetCode('');
      setNewManufacturer('');
      setNewModel('');
      onRefresh();
    } catch (err: any) {
      alert(`Failed to create asset: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher & Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition ${
              activeTab === 'assets'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Monitored Assets ({assets.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('sites')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-semibold transition ${
              activeTab === 'sites'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Solar Sites ({sites.length})</span>
          </button>
        </div>

        {activeTab === 'assets' && (
          <button
            onClick={() => setShowAssetModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition"
          >
            <Plus className="w-4 h-4 text-amber-400" />
            <span>Register Asset</span>
          </button>
        )}
      </div>

      {activeTab === 'assets' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Asset Code</th>
                  <th className="py-3 px-4">Equipment Model</th>
                  <th className="py-3 px-4">Manufacturer</th>
                  <th className="py-3 px-4">Capacity</th>
                  <th className="py-3 px-4">Site</th>
                  <th className="py-3 px-4">Warranty End</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-800/30 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                      {asset.asset_code}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-200">
                      {asset.model}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {asset.manufacturer}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      {asset.rated_capacity_kw ? `${asset.rated_capacity_kw} kW` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      {asset.site_name || 'Primary Site'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-mono">
                      {asset.warranty_end_date ? asset.warranty_end_date.slice(0, 10) : '2030-06-14'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Operational
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sites.map((site) => (
            <div
              key={site.id}
              className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {site.site_code}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {site.timezone}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-100">{site.name}</h3>
              <p className="text-xs text-slate-400 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                <span>{site.address_text || 'Industrial Area, Rooftop'}</span>
              </p>
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>Field Lead: {site.contact_name || 'Site Manager'}</span>
                <span className="font-mono text-slate-300">{site.contact_phone || '+919876543210'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Register Asset */}
      {showAssetModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md w-full space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-slate-100">Register New Inverter</h3>
            <form onSubmit={handleCreateAsset} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Asset Code</label>
                <input
                  type="text"
                  placeholder="e.g. WS-INV-002"
                  value={newAssetCode}
                  onChange={(e) => setNewAssetCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Manufacturer</label>
                <input
                  type="text"
                  placeholder="e.g. Sungrow / Growatt / DemoVolt"
                  value={newManufacturer}
                  onChange={(e) => setNewManufacturer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Model</label>
                <input
                  type="text"
                  placeholder="e.g. SG5.0RS-ADA"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100"
                  required
                />
              </div>
              <div>
                <label className="text-slate-400 block mb-1 font-semibold">Rated Capacity (kW)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 font-mono"
                  required
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssetModal(false)}
                  className="px-4 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold"
                >
                  Save Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

