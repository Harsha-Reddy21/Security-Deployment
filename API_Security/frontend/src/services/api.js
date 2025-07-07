import axios from 'axios';

const API_URL = 'http://localhost:8000';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // If error is 401 and we haven't tried to refresh the token yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Try to refresh the token
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          // No refresh token available, logout
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        const response = await axios.post(`${API_URL}/auth/refresh`, { token: refreshToken });
        
        if (response.data) {
          // Store the new tokens
          localStorage.setItem('token', response.data.access_token);
          localStorage.setItem('refreshToken', response.data.refresh_token);
          
          // Retry the original request with the new token
          originalRequest.headers['Authorization'] = `Bearer ${response.data.access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If refresh token is invalid, logout
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API functions
export const authApi = {
  login: async (username, password) => {
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);
    
    const response = await axios.post(`${API_URL}/auth/login`, formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    
    return response.data;
  },
  
  register: async (username, email, password) => {
    const response = await api.post('/auth/register', {
      username,
      email,
      password,
    });
    
    return response.data;
  },
  
  logout: async () => {
    const response = await api.post('/auth/logout');
    return response.data;
  },
  
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
};

// User API functions
export const userApi = {
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
  
  updateUser: async (data) => {
    const response = await api.put('/users/me/update', data);
    return response.data;
  },
};

// Health check API
export const systemApi = {
  healthCheck: async () => {
    const response = await api.get('/health');
    return response.data;
  },
};

export default api; 