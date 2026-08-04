import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE}/api`,
  headers: { 'Content-Type': 'application/json' }
});

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('vv_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('vv_token');
      localStorage.removeItem('vv_user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  collegeLogin: (data) => api.post('/auth/college/login', data),
  superAdminLogin: (data) => api.post('/auth/superadmin/login', data),
  verifySession: () => api.get('/auth/verify')
};

// Super Admin
export const superAdminAPI = {
  getColleges: (status) => api.get('/superadmin/colleges', { params: { status } }),
  approve: (id) => api.put(`/superadmin/colleges/${id}/approve`),
  reject: (id) => api.put(`/superadmin/colleges/${id}/reject`),
  suspend: (id) => api.put(`/superadmin/colleges/${id}/suspend`),
  deleteCollege: (id) => api.delete(`/superadmin/colleges/${id}`),
  getAnalytics: () => api.get('/superadmin/analytics')
};

// Students
export const studentsAPI = {
  getAll: (params) => api.get('/students', { params }),
  add: (data) => api.post('/students', data),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  import: (formData) => api.post('/students/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  export: () => api.get('/students/export', { responseType: 'blob' })
};

// Departments
export const departmentsAPI = {
  getAll: () => api.get('/departments'),
  add: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`)
};

// Positions
export const positionsAPI = {
  getAll: (params) => api.get('/positions', { params }),
  add: (data) => api.post('/positions', data),
  update: (id, data) => api.put(`/positions/${id}`, data),
  delete: (id) => api.delete(`/positions/${id}`)
};

// Candidates
export const candidatesAPI = {
  getAll: (params) => api.get('/candidates', { params }),
  add: (formData) => api.post('/candidates', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, formData) => api.put(`/candidates/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/candidates/${id}`)
};

// Elections
export const electionsAPI = {
  getAll: () => api.get('/elections'),
  get: (id) => api.get(`/elections/${id}`),
  create: (data) => api.post('/elections', data),
  update: (id, data) => api.put(`/elections/${id}`, data),
  delete: (id) => api.delete(`/elections/${id}`),
  changeStatus: (id, action) => api.put(`/elections/${id}/status`, { action })
};

// Booth
export const boothAPI = {
  getData: () => api.get('/booth/data'),
  verifyStudent: (data) => api.post('/booth/verify', data),
  castVote: (data) => api.post('/booth/vote', data),
  verifyPin: (data) => api.post('/booth/verify-pin', data),
  getStatus: () => api.get('/booth/status'),
  resetLock: () => api.post('/booth/reset-lock')
};

// Reports & Results
export const reportsAPI = {
  getResults: (electionId) => api.get(`/reports/results/${electionId}`),
  exportResults: (electionId) => api.get(`/reports/results/${electionId}/export`, { responseType: 'blob' }),
  getAuditLogs: (params) => api.get('/reports/audit-logs', { params }),
  getStudentReport: () => api.get('/reports/student-report'),
  getCandidateReport: () => api.get('/reports/candidate-report'),
  getElectionReport: () => api.get('/reports/election-report'),
  getVoteSummary: () => api.get('/reports/vote-summary'),
  getDashboardStats: () => api.get('/reports/dashboard-stats')
};

export default api;
