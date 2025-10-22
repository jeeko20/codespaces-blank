import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8001';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// AUTH API
// ============================================================================

export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await api.post('/auth/logout');
    localStorage.removeItem('token');
    return response.data;
  },
};

// ============================================================================
// USER API
// ============================================================================

export const userAPI = {
  getUser: async (userId) => {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/users/${userId}`, userData);
    return response.data;
  },
};

// ============================================================================
// SUBJECT API
// ============================================================================

export const subjectAPI = {
  getAll: async () => {
    const response = await api.get('/subjects');
    return response.data;
  },

  getById: async (subjectId) => {
    const response = await api.get(`/subjects/${subjectId}`);
    return response.data;
  },

  create: async (subjectData) => {
    const response = await api.post('/subjects', subjectData);
    return response.data;
  },
};

// ============================================================================
// RESOURCE API
// ============================================================================

export const resourceAPI = {
  getAll: async (filters = {}) => {
    const response = await api.get('/resources', { params: filters });
    return response.data;
  },

  getById: async (resourceId) => {
    const response = await api.get(`/resources/${resourceId}`);
    return response.data;
  },

  create: async (resourceData) => {
    const response = await api.post('/resources', resourceData);
    return response.data;
  },

  update: async (resourceId, resourceData) => {
    const response = await api.put(`/resources/${resourceId}`, resourceData);
    return response.data;
  },

  delete: async (resourceId) => {
    const response = await api.delete(`/resources/${resourceId}`);
    return response.data;
  },

  like: async (resourceId) => {
    const response = await api.post(`/resources/${resourceId}/like`);
    return response.data;
  },
};

// ============================================================================
// DISCUSSION/COMMUNITY API
// ============================================================================

export const discussionAPI = {
  getAll: async (filters = {}) => {
    const response = await api.get('/discussions', { params: filters });
    return response.data;
  },

  getById: async (discussionId) => {
    const response = await api.get(`/discussions/${discussionId}`);
    return response.data;
  },

  create: async (discussionData) => {
    const response = await api.post('/discussions', discussionData);
    return response.data;
  },

  update: async (discussionId, discussionData) => {
    const response = await api.put(`/discussions/${discussionId}`, discussionData);
    return response.data;
  },

  delete: async (discussionId) => {
    const response = await api.delete(`/discussions/${discussionId}`);
    return response.data;
  },

  addComment: async (discussionId, commentData) => {
    const response = await api.post(`/discussions/${discussionId}/comments`, commentData);
    return response.data;
  },
};

// ============================================================================
// QUIZ API
// ============================================================================

export const quizAPI = {
  getAll: async (filters = {}) => {
    const response = await api.get('/quizzes', { params: filters });
    return response.data;
  },

  getById: async (quizId) => {
    const response = await api.get(`/quizzes/${quizId}`);
    return response.data;
  },

  create: async (quizData) => {
    const response = await api.post('/quizzes', quizData);
    return response.data;
  },

  recordAttempt: async (quizId) => {
    const response = await api.post(`/quizzes/${quizId}/attempt`);
    return response.data;
  },
};

// ============================================================================
// FLASHCARD API
// ============================================================================

export const flashcardAPI = {
  getAll: async (filters = {}) => {
    const response = await api.get('/flashcards', { params: filters });
    return response.data;
  },

  getById: async (flashcardId) => {
    const response = await api.get(`/flashcards/${flashcardId}`);
    return response.data;
  },

  create: async (flashcardData) => {
    const response = await api.post('/flashcards', flashcardData);
    return response.data;
  },
};

// ============================================================================
// NOTIFICATION API
// ============================================================================

export const notificationAPI = {
  getAll: async () => {
    const response = await api.get('/notifications');
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  },

  delete: async (notificationId) => {
    const response = await api.delete(`/notifications/${notificationId}`);
    return response.data;
  },
};

// ============================================================================
// STATISTICS API
// ============================================================================

export const statisticsAPI = {
  getAll: async () => {
    const response = await api.get('/statistics');
    return response.data;
  },
};

export default api;
