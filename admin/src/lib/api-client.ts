/**
 * API Client Wrapper cho Admin Dashboard
 * 
 * File này wrap generated API clients với configuration phù hợp cho Admin
 * Uses localStorage for admin authentication tokens
 */

import axios from 'axios';
import {
  Configuration,
  ConfigurationParameters,
  AddressesApi,
  AuthApi,
  CartApi,
  CategoriesApi,
  DashboardApi,
  DiscountsApi,
  OrdersApi,
  ProductsApi,
  ReviewsApi,
} from '@/generated-api';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/**
 * Create axios instance for generated API
 * Export this so components can pass it to Generated API constructors
 * 
 * IMPORTANT: withCredentials = false to prevent sending client app cookies
 * Admin uses localStorage tokens via Authorization header instead
 */
export const generatedApiAxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false, // DO NOT send cookies from client app!
});

// Track if we're currently refreshing to avoid multiple refresh calls
let isRefreshing = false;
let isLoggingOut = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

// Export function to set logout state
export const setLoggingOut = (state: boolean) => {
  isLoggingOut = state;
  if (state) {
    processQueue(new Error('Logging out'));
  }
};

// Add request interceptor to add admin token
generatedApiAxios.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for token refresh
generatedApiAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Don't try to refresh if logging out or on login page
    if (isLoggingOut || (typeof window !== 'undefined' && window.location.pathname.includes('/auth'))) {
      return Promise.reject(error);
    }

    // Don't try to refresh if it's auth endpoint
    if (originalRequest.url?.includes('/auth/login') || 
        originalRequest.url?.includes('/auth/register') ||
        originalRequest.url?.includes('/auth/refresh') ||
        originalRequest.url?.includes('/auth/logout')) {
      return Promise.reject(error);
    }

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => generatedApiAxios(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('admin_refresh_token');
        if (!refreshToken) {
          throw new Error('No refresh token');
        }

        const refreshResponse = await axios.post(
          `${API_BASE_URL}/api/v1/auth/admin/refresh`,
          { refreshToken },
          { withCredentials: false } // Admin uses localStorage, NOT cookies
        );

        // Backend uses TransformInterceptor: { success, statusCode, message, data: { accessToken }, timestamp }
        const responseData = refreshResponse.data.data || refreshResponse.data;
        const accessToken = responseData.accessToken;
        
        if (!accessToken) {
          throw new Error('No access token in refresh response');
        }
        
        localStorage.setItem('admin_token', accessToken);

        processQueue();
        isRefreshing = false;

        // Update authorization header and retry
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return generatedApiAxios(originalRequest);
      } catch (refreshError: any) {
        console.error('[Token Refresh] Failed:', refreshError.response?.data || refreshError.message);
        processQueue(refreshError);
        isRefreshing = false;

        // Clear tokens and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_refresh_token');
          localStorage.removeItem('admin_user');
          
          if (!window.location.pathname.includes('/auth')) {
            window.location.href = '/auth/signin';
          }
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Configuration cho Generated API Client
 */
const apiConfig = new Configuration({
  basePath: API_BASE_URL,
});

// ==================== API INSTANCES ====================

/**
 * Auth API - Đăng nhập admin
 */
export const authApi = new AuthApi(apiConfig, API_BASE_URL, generatedApiAxios);

/**
 * Products API - Quản lý sản phẩm
 */
export const productsApi = new ProductsApi(apiConfig, API_BASE_URL, generatedApiAxios);

/**
 * Categories API - Quản lý danh mục
 */
export const categoriesApi = new CategoriesApi(apiConfig, API_BASE_URL, generatedApiAxios);

/**
 * Orders API - Quản lý đơn hàng
 */
export const ordersApi = new OrdersApi(apiConfig, API_BASE_URL, generatedApiAxios);

/**
 * Reviews API - Quản lý đánh giá
 */
export const reviewsApi = new ReviewsApi(apiConfig, API_BASE_URL, generatedApiAxios);

/**
 * Discounts API - Quản lý mã giảm giá
 */
export const discountsApi = new DiscountsApi(apiConfig, API_BASE_URL, generatedApiAxios);

/**
 * Dashboard API - Thống kê dashboard
 */
export const dashboardApi = new DashboardApi(apiConfig, API_BASE_URL, generatedApiAxios);

/**
 * Cart API - Xem giỏ hàng users (admin purpose)
 */
export const cartApi = new CartApi(apiConfig, API_BASE_URL, generatedApiAxios);

/**
 * Addresses API - Quản lý địa chỉ users
 */
export const addressesApi = new AddressesApi(apiConfig, API_BASE_URL, generatedApiAxios);

// ==================== EXPORTS ====================

// Export tất cả models/types để sử dụng
export * from '@/generated-api/models';

// Export Configuration nếu cần custom
export { Configuration } from '@/generated-api';

// ==================== HELPER FUNCTIONS ====================

/**
 * Update admin token after login
 */
export const updateAdminToken = (token: string, refreshToken?: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('admin_token', token);
    if (refreshToken) {
      localStorage.setItem('admin_refresh_token', refreshToken);
    }
  }
};

/**
 * Clear admin tokens on logout
 */
export const clearAdminTokens = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
  }
};

/**
 * Get admin token
 */
export const getAdminToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('admin_token');
  }
  return null;
};

/**
 * Check if admin is authenticated
 */
export const isAdminAuthenticated = (): boolean => {
  return !!getAdminToken();
};
