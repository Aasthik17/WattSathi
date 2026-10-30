import {
  User,
  Site,
  Asset,
  DocumentItem,
  DocumentDetail,
  SearchResponse,
  WorkOrder,
  CallItem,
  CallDetail,
  AnalyticsOverview
} from '../types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('wattsathi_token');
  }
  return null;
}

export function setToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('wattsathi_token', token);
  }
}

export function removeToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('wattsathi_token');
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string> || {}),
  };

  if (token && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorDetail = 'Request failed';
    try {
      const errJson = await res.json();
      errorDetail = errJson.error?.message || errJson.detail || JSON.stringify(errJson);
    } catch {
      errorDetail = `HTTP ${res.status}: ${res.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return res.json();
}

export const api = {
  // Health
  getHealth: () => request<{ status: string; database: string }>('/health'),

  // Auth
  login: async (email: string, password: string) => {
    const res = await request<{ access_token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setToken(res.access_token);
    return res;
  },
  logout: () => {
    removeToken();
    return request('/auth/logout', { method: 'POST' });
  },
  getMe: () => request<User>('/auth/me'),

  // Analytics
  getAnalyticsOverview: () => request<AnalyticsOverview>('/analytics/overview'),

  // Sites
  getSites: () => request<Site[]>('/sites'),
  getSite: (id: string) => request<Site>(`/sites/${id}`),
  createSite: (data: Partial<Site>) =>
    request<Site>('/sites', { method: 'POST', body: JSON.stringify(data) }),

  // Assets
  getAssets: (siteId?: string) => {
    const q = siteId ? `?site_id=${siteId}` : '';
    return request<Asset[]>(`/assets${q}`);
  },
  getAsset: (id: string) => request<Asset>(`/assets/${id}`),
  createAsset: (data: Partial<Asset>) =>
    request<Asset>('/assets', { method: 'POST', body: JSON.stringify(data) }),

  // Documents & Manuals
  getDocuments: (siteId?: string) => {
    const q = siteId ? `?site_id=${siteId}` : '';
    return request<DocumentItem[]>(`/documents${q}`);
  },
  getDocument: (id: string) => request<DocumentDetail>(`/documents/${id}`),
  deleteDocument: (id: string) => request<{ message: string }>(`/documents/${id}`, { method: 'DELETE' }),
  uploadDocument: (formData: FormData) =>
    request<DocumentItem>('/documents', {
      method: 'POST',
      body: formData,
    }),
  searchManual: (query: string, siteId?: string, model?: string) => {
    const params = new URLSearchParams({ q: query });
    if (siteId) params.append('site_id', siteId);
    if (model) params.append('model', model);
    return request<SearchResponse>(`/documents/search/query?${params.toString()}`);
  },

  // Work Orders
  getWorkOrders: (status?: string, priority?: string, siteId?: string) => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    if (siteId) params.append('site_id', siteId);
    return request<WorkOrder[]>(`/work-orders?${params.toString()}`);
  },
  getWorkOrder: (id: string) => request<WorkOrder>(`/work-orders/${id}`),
  createWorkOrder: (data: any) =>
    request<WorkOrder>('/work-orders', { method: 'POST', body: JSON.stringify(data) }),
  verifyWorkOrder: (id: string, verifiedCause: string, notes?: string) =>
    request<WorkOrder>(`/work-orders/${id}/verify`, {
      method: 'POST',
      body: JSON.stringify({ verified_cause: verifiedCause, notes }),
    }),

  // Calls
  getCalls: () => request<CallItem[]>('/calls'),
  getCall: (id: string) => request<CallDetail>(`/calls/${id}`),
  initiateTestCall: (phoneNumber: string, siteId: string, assetId: string, confirmed: boolean) =>
    request<{ call_id: string; execution_id: string; status: string; message: string }>('/calls/test', {
      method: 'POST',
      body: JSON.stringify({
        recipient_phone_number: phoneNumber,
        site_id: siteId,
        asset_id: assetId,
        explicit_cost_confirmed: confirmed,
      }),
    }),
};

