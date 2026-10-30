export interface User {
  id: string;
  workspace_id: string;
  email: string;
  display_name: string;
  role: string;
  is_active: boolean;
  created_at: string;
  last_login_at?: string;
}

export interface Site {
  id: string;
  workspace_id: string;
  site_code: string;
  name: string;
  address_text?: string;
  timezone: string;
  contact_name?: string;
  contact_phone?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  asset_count?: number;
}

export interface Asset {
  id: string;
  workspace_id: string;
  site_id: string;
  site_name?: string;
  asset_code: string;
  category: string;
  manufacturer: string;
  model: string;
  serial_number?: string;
  rated_capacity_kw?: number;
  installed_on?: string;
  warranty_end_date?: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentItem {
  id: string;
  workspace_id: string;
  site_id?: string;
  title: string;
  original_filename: string;
  mime_type: string;
  document_type: string;
  status: string;
  is_simulated: boolean;
  uploaded_by?: string;
  created_at: string;
  processed_at?: string;
  error_summary?: string;
  chunk_count?: number;
}

export interface ChunkItem {
  id: string;
  chunk_index: number;
  page_number?: number;
  section_heading?: string;
  content: string;
  token_count: number;
}

export interface DocumentDetail extends DocumentItem {
  chunks: ChunkItem[];
}

export interface SearchResultItem {
  document_id: string;
  source_title: string;
  page_or_section: string;
  excerpt: string;
  evidence_level: string;
  is_simulated: boolean;
  score: number;
}

export interface SearchResponse {
  matches: SearchResultItem[];
  no_reliable_match: boolean;
  instruction: string;
}

export interface WorkOrder {
  id: string;
  workspace_id: string;
  work_order_number: string;
  site_id: string;
  site_name?: string;
  asset_id: string;
  asset_code?: string;
  asset_model?: string;
  call_id?: string;
  created_by?: string;
  assigned_to?: string;
  issue_title: string;
  observations: string[];
  suspected_cause?: string;
  evidence_refs: any[];
  recommended_safe_next_step: string;
  priority: string;
  status: string;
  diagnosis_state: 'unverified' | 'human_verified' | 'not_applicable';
  caller_confirmed_at?: string;
  human_verified_by?: string;
  human_verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CallItem {
  id: string;
  workspace_id: string;
  bolna_execution_id?: string;
  bolna_agent_id?: string;
  site_id?: string;
  site_name?: string;
  asset_id?: string;
  asset_code?: string;
  channel: string;
  language: string;
  status: string;
  started_at?: string;
  ended_at?: string;
  duration_seconds: number;
  cost_amount?: number;
  cost_currency?: string;
  summary?: string;
  recording_url?: string;
  termination_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface CallDetail extends CallItem {
  transcript_text?: string;
  work_orders: string[];
}

export interface AnalyticsOverview {
  active_sites: number;
  active_assets: number;
  open_work_orders: number;
  total_calls: number;
  calls_this_week: number;
  ready_documents: number;
  failed_documents: number;
  bolna_connected: boolean;
  bolna_agent_id?: string;
  wallet_balance?: number;
}

