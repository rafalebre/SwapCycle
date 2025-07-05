// API configuration and base setup - FIXED VERSION
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export const api = axios.create({
 baseURL: API_BASE_URL,
 headers: {
   'Content-Type': 'application/json',
 },
});

// FIX: Interceptor to include token automatically
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

// FIX: Interceptor to handle error responses (auto logout on invalid token)
api.interceptors.response.use(
 (response) => {
   return response;
 },
 (error) => {
   if (error.response?.status === 401) {
     // Invalid or expired token
     localStorage.removeItem('token');
     localStorage.removeItem('user');
     
     // If not on login page, redirect
     if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
       window.location.href = '/login';
     }
   }
   return Promise.reject(error);
 }
);

export default api;
