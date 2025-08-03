import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Workflow API
export const workflowAPI = {
  // Get all workflows
  getWorkflows: () => api.get('/workflows'),

  // Get workflow by ID
  getWorkflow: (id) => api.get(`/workflows/${id}`),

  // Create workflow
  createWorkflow: (data) => api.post('/workflows', data),

  // Update workflow
  updateWorkflow: (id, data) => api.put(`/workflows/${id}`, data),

  // Delete workflow
  deleteWorkflow: (id) => api.delete(`/workflows/${id}`),

  // Add component to workflow
  addComponent: (workflowId, data) => api.post(`/workflows/${workflowId}/components`, data),

  // Update component
  updateComponent: (componentId, data) => api.put(`/workflows/components/${componentId}`, data),

  // Validate workflow
  validateWorkflow: (id) => api.get(`/workflows/${id}/validate`),

  // Execute workflow
  executeWorkflow: (id, query, sessionId) => api.post(`/workflows/${id}/execute`, { query, session_id: sessionId }),
};

// Document API
export const documentAPI = {
  // Upload document
  uploadDocument: (file, workflowId = null) => {
    const formData = new FormData();
    formData.append('file', file);
    if (workflowId) {
      formData.append('workflow_id', workflowId);
    }
    return api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // Get documents
  getDocuments: (workflowId = null) => {
    const params = workflowId ? { workflow_id: workflowId } : {};
    return api.get('/documents', { params });
  },

  // Get document by ID
  getDocument: (id) => api.get(`/documents/${id}`),

  // Delete document
  deleteDocument: (id) => api.delete(`/documents/${id}`),

  // Process document
  processDocument: (id) => api.post(`/documents/${id}/process`),
};

// Chat API
export const chatAPI = {
  // Send message
  sendMessage: (workflowId, message, sessionId = null) =>
    api.post(`/chat/${workflowId}/send`, { message, session_id: sessionId }),

  // Get chat history
  getChatHistory: (workflowId, sessionId = null, limit = 50) =>
    api.get(`/chat/${workflowId}/history`, { params: { session_id: sessionId, limit } }),

  // Get session messages
  getSessionMessages: (sessionId) => api.get(`/chat/sessions/${sessionId}`),

  // Get session summary
  getSessionSummary: (sessionId) => api.get(`/chat/sessions/${sessionId}/summary`),

  // Delete session
  deleteSession: (sessionId) => api.delete(`/chat/sessions/${sessionId}`),

  // Create new session
  createSession: () => api.post('/chat/sessions/new'),
};

// LLM API
export const llmAPI = {
  // Get available models
  getModels: () => api.get('/llm/models'),

  // Generate response
  generateResponse: (data) => api.post('/llm/generate', data),

  // Web search
  webSearch: (data) => api.post('/llm/web-search', data),

  // Generate with context
  generateWithContext: (params) => api.post('/llm/generate-with-context', null, { params }),
};

export default api; 