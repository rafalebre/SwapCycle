// Authentication API calls
import api from './api';

export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: (token) => api.get('/auth/profile', {
    headers: { Authorization: `Bearer ${token}` }
  })
};

export default authService;
