import axios from 'axios';

// Automatically detect API baseURL (Localhost dev vs Production Render backend)
const isLocal = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const BACKEND_URL = isLocal 
  ? 'http://localhost:5000' 
  : (import.meta.env.VITE_API_URL || 'https://srv-da8iur4s728c73btl200.onrender.com');

const API = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

// Request interceptor to attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studylens_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
