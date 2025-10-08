import axios from 'axios';
import { Platform } from 'react-native';

// Configure base URL based on platform
// Android emulator uses 10.0.2.2 to access host machine's localhost
// iOS simulator can use localhost directly
// For physical devices, use your computer's local network IP
const getBaseURL = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api';
  } else if (Platform.OS === 'ios') {
    return 'http://localhost:3000/api';
  }
  // Fallback for web or other platforms
  return 'http://localhost:3000/api';
};

// Create axios instance
const apiClient = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // You can add auth token here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle common errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      // You can dispatch logout action here
      console.log('Unauthorized access');
    }
    
    return Promise.reject(error);
  }
);

// API methods
export const authAPI = {
  login: (credentials) => apiClient.post('/auth/login', credentials),
  register: (userData) => apiClient.post('/auth/register', userData),
  logout: () => apiClient.post('/auth/logout'),
  getMe: () => apiClient.get('/auth/me'),
  refreshToken: () => apiClient.post('/auth/refresh'),
};

export const customersAPI = {
  getAll: (params) => apiClient.get('/customers', { params }),
  getById: (id) => apiClient.get(`/customers/${id}`),
  create: (data) => apiClient.post('/customers', data),
  update: (id, data) => apiClient.put(`/customers/${id}`, data),
  delete: (id) => apiClient.delete(`/customers/${id}`),
};

export const pipelineAPI = {
  getAll: (params) => apiClient.get('/pipeline', { params }),
  getById: (id) => apiClient.get(`/pipeline/${id}`),
  create: (data) => apiClient.post('/pipeline', data),
  update: (id, data) => apiClient.put(`/pipeline/${id}`, data),
  delete: (id) => apiClient.delete(`/pipeline/${id}`),
  getOpportunities: (id, params) => apiClient.get(`/pipeline/${id}/opportunities`, { params }),
  getStats: (params) => apiClient.get('/pipeline/stats/overview', { params }),
};

export const activitiesAPI = {
  getAll: (params) => apiClient.get('/activities', { params }),
  getById: (id) => apiClient.get(`/activities/${id}`),
  create: (data) => apiClient.post('/activities', data),
  update: (id, data) => apiClient.put(`/activities/${id}`, data),
  delete: (id) => apiClient.delete(`/activities/${id}`),
};

export const teamsAPI = {
  getAll: (params) => apiClient.get('/teams', { params }),
  getById: (id) => apiClient.get(`/teams/${id}`),
  create: (data) => apiClient.post('/teams', data),
  update: (id, data) => apiClient.put(`/teams/${id}`, data),
  delete: (id) => apiClient.delete(`/teams/${id}`),
  addMember: (teamId, memberData) => apiClient.post(`/teams/${teamId}/members`, memberData),
  removeMember: (teamId, memberId) => apiClient.delete(`/teams/${teamId}/members/${memberId}`),
};

export const forecastAPI = {
  getOverview: (params) => apiClient.get('/forecast', { params }),
};

export const leadsAPI = {
  getAll: (params) => apiClient.get('/leads', { params }),
  getById: (id) => apiClient.get(`/leads/${id}`),
  create: (data) => apiClient.post('/leads', data),
  update: (id, data) => apiClient.put(`/leads/${id}`, data),
  delete: (id) => apiClient.delete(`/leads/${id}`),
};

export const configAPI = {
  getActivityTypes: () => apiClient.get('/config/activity-types'),
  getLeadSources: () => apiClient.get('/config/lead-sources'),
  getOpportunityStatuses: () => apiClient.get('/config/opportunity-statuses'),
};

export { apiClient };
export default apiClient;
