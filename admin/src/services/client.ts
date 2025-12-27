/**
 * Axios client configuration cho Admin
 * Updated: 2025-12-09 - Dynamic API URL based on access hostname
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { getErrorMessage } from './utils';

// Function to determine API Base URL dynamically
const getApiBaseUrl = (): string => {
  // Priority 1: Environment variable
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // Priority 2: Dynamic based on current hostname (client-side only)
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    // If accessing via IP or domain, use same host for API
    if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:3000`;
    }
  }
  
  // Default: localhost
  return 'http://localhost:3000';
};

// API Base URL - dynamically determined
const API_BASE_URL = getApiBaseUrl();

// Tạo axios instance với config cho admin
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - thêm admin token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý lỗi
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Xử lý 401 - Token hết hạn
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/auth/signin';
    }

    // Log error message
    const errorMessage = getErrorMessage(error);
    console.error('Admin API Error:', errorMessage);

    // Có thể thêm toast notification ở đây
    // toast.error(errorMessage);

    return Promise.reject(error);
  }
);

export default apiClient;
