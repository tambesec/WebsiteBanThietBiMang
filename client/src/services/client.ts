/**
 * Axios client configuration
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import { getErrorMessage } from './utils';

// API Base URL - tự động lấy từ environment variable hoặc mặc định localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Tạo axios instance với config mặc định
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Cho phép gửi cookies
});

// Request interceptor - thêm token vào header nếu có
apiClient.interceptors.request.use(
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

// Response interceptor - xử lý lỗi chung và hiển thị thông báo
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Xử lý 401 - Token hết hạn
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/signin';
    }

    // Log error message (có thể hiển thị toast notification ở đây)
    const errorMessage = getErrorMessage(error);
    console.error('API Error:', errorMessage);

    // Có thể thêm toast notification ở đây
    // toast.error(errorMessage);

    return Promise.reject(error);
  }
);

export default apiClient;
