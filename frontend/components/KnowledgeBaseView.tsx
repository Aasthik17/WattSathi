'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  UploadCloud,
  Search,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ExternalLink,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { DocumentItem, SearchResponse } from '../types';
import { api } from '../lib/api';

interface KnowledgeBaseViewProps {
  documents: DocumentItem[];
  onRefresh: () => void;
}

export const KnowledgeBaseView: React.FC<KnowledgeBaseViewProps> = ({
  documents,
  onRefresh,
}) => {
  const [searchQuery, setSearchQuery] = useState('GRID-STATUS-WARN');
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null);
  const [searching, setSearching] = useState(false);

  // Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadModel, setUploadModel] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    try {
      const res = await api.searchManual(searchQuery.trim());
      setSearchResults(res);
    } catch (err: any) {
      alert(`Search failed: ${err.message}`);
    } finally {
      setSearching(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !uploadTitle.trim()) return;

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', uploadTitle.trim());
    if (uploadModel.trim()) formData.append('asset_model_scope', uploadModel.trim());

    setUploading(true);
    try {
      await api.uploadDocument(formData);
      setUploadFile(null);
      setUploadTitle('');
      setUploadModel('');
      onRefresh();
      alert('Document uploaded and indexed successfully!');
    } catch (err: any) {
      alert(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await api.deleteDocument(docId);
      onRefresh();
    } catch (err: any) {
      alert(`Delete failed: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notice Banner */}
      <div className="bg-amber-950/25 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-200/90 leading-relaxed">
          <strong className="text-amber-300 font-semibold uppercase">
            Grounded Retrieval Grounding Policy:
          </strong>{' '}
          WattSathi strictly prohibits inventing equipment models, fault-code meanings, or repair instructions. If a query finds no approved document, the system explicitly returns <code className="bg-amber-950 px-1 py-0.5 rounded text-amber-300 font-mono">no_reliable_match</code> and escalates to a qualified human.
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Upload & Document Coverage Table */}
        <div className="lg:col-span-7 space-y-6">
          {/* Upload card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <UploadCloud className="w-4 h-4 text-amber-400" />
                Upload Approved SOP or Manufacturer Manual
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">Max 20MB (.pdf, .md, .txt)</span>
            </div>

            <form onSubmit={handleUpload} className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-semibold block mb-1">Document Title</label>
                <input
                  type="text"
                  placeholder="e.g. DemoVolt DV-3K-SIM Service SOP v1.0"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Target Model Scope</label>
                  <input
                    type="text"
                    placeholder="e.g. DV-3K-SIM"
                    value={uploadModel}
                    onChange={(e) => setUploadModel(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-2 text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-400 font-semibold block mb-1">Select File</label>
                  <input
                    type="file"
                    accept=".pdf,.md,.txt"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-slate-300 text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-[11px] file:bg-slate-800 file:text-slate-200 hover:file:bg-slate-700"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading || !uploadFile || !uploadTitle}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-semibold text-xs transition flex items-center gap-1.5"
              >
                {uploading ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Chunking & Indexing...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>Index Document</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Document list table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                Indexed Approved Documents ({documents.length})
              </h3>
            </div>

            <div className="divide-y divide-slate-800/60">
              {documents.map((doc) => (
                <div key={doc.id} className="p-4 flex items-start justify-between gap-4 hover:bg-slate-800/30 transition text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{doc.title}</span>
                      {doc.is_simulated && (
                        <span className="bg-amber-950 border border-amber-800 text-amber-300 text-[10px] px-1.5 py-0.5 rounded font-mono">
                          Simulated Demo Fixture
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800/60 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    </div>
                    <div className="text-slate-400 text-[11px] flex items-center gap-3">
                      <span>File: {doc.original_filename}</span>
                      <span>•</span>
                      <span>Chunks: {doc.chunk_count ?? '—'}</span>
                      <span>•</span>
                      <span>{doc.created_at.slice(0, 10)}</span>
                    </div>
                  </div>

                  {!doc.is_simulated && (
                    <button
                      onClick={() => handleDelete(doc.id, doc.title)}
                      className="p-1.5 rounded hover:bg-red-950/50 text-slate-500 hover:text-red-400 transition"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Live Retrieval Verification Sandbox */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Search className="w-4 h-4 text-amber-400" />
                Retrieval Verification Sandbox
              </h3>
              <span className="text-[10px] text-emerald-400 font-medium">Postgres Full-Text</span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Test how the backend retrieves citations before the voice agent answers. Enter an error code or symptoms.
            </p>

            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. GRID-STATUS-WARN"
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                type="submit"
                disabled={searching || !searchQuery.trim()}
                className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-slate-950 font-semibold text-xs transition"
              >
                {searching ? 'Testing...' : 'Search'}
              </button>
            </form>

            {searchResults && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">
                    Results ({searchResults.matches.length})
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded ${
                    searchResults.no_reliable_match
                      ? 'bg-red-950 text-red-300 border border-red-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}>
                    {searchResults.no_reliable_match ? 'No Match / Escalate' : 'Matches Grounded'}
                  </span>
                </div>

                <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                  {searchResults.matches.map((m, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between font-bold text-slate-200">
                        <span>{m.source_title}</span>
                        {m.is_simulated && (
                          <span className="text-[10px] text-amber-400 font-mono bg-amber-950 px-1 py-0.5 rounded">
                            Simulated
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] font-mono text-amber-400">
                        Section: {m.page_or_section}
                      </div>
                      <p className="text-slate-400 leading-snug line-clamp-4">
                        {m.excerpt}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[11px] text-slate-400 font-mono">
                  Instruction: {searchResults.instruction}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

