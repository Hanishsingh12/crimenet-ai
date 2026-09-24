import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Request interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('crimenet_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for session expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('crimenet_token');
        localStorage.removeItem('crimenet_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  getProfile: () => api.get('/auth/me'),
};

export const caseService = {
  getCases: (params) => api.get('/cases', { params }),
  getCase: (id) => api.get(`/cases/${id}`),
  createCase: (data) => api.post('/cases', data),
};

export const entityService = {
  getEntities: (params) => api.get('/entities', { params }),
  getEntity: (id) => api.get(`/entities/${id}`),
  searchEntities: (q, caseId) => api.get('/entities/search', { params: { q, case_id: caseId } }),
};

export const graphService = {
  getNetwork: (caseId, limit = 500) => api.get(`/graph/network/${caseId}`, { params: { limit } }),
  findPath: (data) => api.post('/graph/path', data),
  getNeighbors: (entityId, maxDepth = 1, caseId) => api.get(`/graph/neighbors/${entityId}`, { params: { max_depth: maxDepth, case_id: caseId } }),
};

export const analyticsService = {
  getCentrality: (caseId) => api.get(`/analytics/centrality/${caseId}`),
  getClusters: (caseId) => api.get(`/analytics/clusters/${caseId}`),
  getAnomalies: (caseId) => api.get(`/analytics/anomalies/${caseId}`),
  updateAlertStatus: (alertId, data) => api.patch(`/analytics/alerts/${alertId}`, data),
};

export const documentService = {
  getDocuments: (caseId) => api.get('/documents', { params: { case_id: caseId } }),
  uploadDocument: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  verifyIntegrity: (evidenceId) => api.get(`/documents/verify/${evidenceId}`),
};

export const aiService = {
  chat: (data) => api.post('/ai/chat', data),
  getStatus: () => api.get('/ai/status'),
  setModel: (modelName) => api.post('/ai/model', { model_name: modelName }),
};

export const reportService = {
  generateReport: (caseId, data) => api.post(`/reports/${caseId}/generate`, data),
  downloadReportUrl: (caseId, filename) => `${API_BASE}/reports/${caseId}/download/${filename}`,
};

export const auditService = {
  getLogs: (limit = 50) => api.get('/audit-logs', { params: { limit } }),
};

export const timelineService = {
  getTimeline: (caseId, params) => api.get(`/timeline/${caseId}`, { params }),
};

export const mapService = {
  getLocations: (caseId) => api.get(`/map/${caseId}`),
};

export const dashboardService = {
  getSummary: () => api.get('/dashboard/summary'),
  getHealth: () => api.get('/health'),
};

export default api;
