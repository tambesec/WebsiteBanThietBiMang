/**
 * Axios client configuration cho Admin
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { getErrorMessage } from './utils';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
      window.location.href = '/signin';
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
