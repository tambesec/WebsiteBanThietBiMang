/**
 * API Client Wrapper cho Client Store
 * 
 * File này wrap generated API clients với configuration phù hợp cho Client
 * Uses HTTP-only cookies for authentication (no localStorage tokens)
 * 
 * REFRESH TOKEN ARCHITECTURE:
 * - All requests use access_token from HTTP-only cookie
 * - On 401: Queue all failed requests, refresh once, retry all queued requests
 * - Only one refresh request at a time (prevents race conditions)
 */

import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import {
  Configuration,
  ConfigurationParameters,
  AddressesApi,
  AuthApi,
  CartApi,
  CategoriesApi,
  OrdersApi,
  ProductsApi,
  ReviewsApi,
  DiscountsApi,
} from '@/generated-api';

// API Base URL
// For production: Use full domain (e.g., https://api.yourdomain.com)
// For development: Use relative path to leverage Next.js proxy (solves cookie cross-origin)
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000')
  : ''; // Empty = same origin, Next.js will proxy to localhost:3000

// For direct axios calls (not generated API), need full path with /api/v1
const AXIOS_BASE_URL = API_BASE_URL + '/api/v1';

/**
 * Create axios instance with baseURL and credentials
 * This instance will be used for direct API calls (not generated API)
 */
export const axiosInstance = axios.create({
  baseURL: AXIOS_BASE_URL,
  withCredentials: true,
});

/**
 * Create axios instance for generated API (without /api/v1 since it's in paths)
 * Export this so components can pass it to Generated API constructors
 */
export const generatedApiAxios = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// ============================================================================
// REFRESH TOKEN QUEUE MECHANISM
// ============================================================================

interface QueuedRequest {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
  config: AxiosRequestConfig;
}

let isRefreshing = false;
let isLoggingOut = false;
let failedQueue: QueuedRequest[] = [];

/**
 * Process all queued requests after token refresh
 */
const processQueue = (error: Error | null = null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      // Retry the original request
      promise.resolve(generatedApiAxios(promise.config));
    }
  });
  failedQueue = [];
};

/**
 * Set logout state to prevent refresh attempts during logout
 */
export const setLoggingOut = (state: boolean) => {
  isLoggingOut = state;
  if (state) {
    // When logging out, reject all queued requests
    processQueue(new Error('Logging out'));
  }
};

// ============================================================================
// RESPONSE INTERCEPTOR - AUTO REFRESH ON 401
// ============================================================================

generatedApiAxios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Skip refresh if logging out or on auth pages
    if (isLoggingOut) {
      return Promise.reject(error);
    }

    // Skip refresh for auth endpoints
    const authEndpoints = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout', '/auth/session', '/auth/google'];
    const isAuthEndpoint = authEndpoints.some(endpoint => originalRequest.url?.includes(endpoint));
    
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // Handle 401 - Access token expired
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      // Mark as retry to prevent infinite loops
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        
        // Call refresh endpoint (uses refresh_token cookie)
        await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );

        // Process all queued requests with new token
        processQueue(null, 'refreshed');
        isRefreshing = false;

        // Retry original request
        return generatedApiAxios(originalRequest);
      } catch (refreshError: any) {
        // Refresh failed - reject all queued requests
        processQueue(refreshError);
        isRefreshing = false;

        // Redirect to signin only if not on public pages
        if (typeof window !== 'undefined') {
          const publicPages = ['/signin', '/signup', '/', '/shop', '/products', '/about', '/contact'];
          const currentPath = window.location.pathname;
          const isPublicPage = publicPages.some(page => currentPath === page || currentPath.startsWith('/products/'));
          
          if (!isPublicPage) {
            window.location.href = '/signin';
          }
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Add same interceptor to axiosInstance
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (isLoggingOut) {
      return Promise.reject(error);
    }

    const authEndpoints = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/logout', '/auth/session', '/auth/google'];
    const isAuthEndpoint = authEndpoints.some(endpoint => originalRequest.url?.includes(endpoint));
    
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(
          `${API_BASE_URL}/api/v1/auth/refresh`,
          {},
          { withCredentials: true }
        );

        processQueue(null, 'refreshed');
        isRefreshing = false;
        return axiosInstance(originalRequest);
      } catch (refreshError: any) {
        processQueue(refreshError);
        isRefreshing = false;

        if (typeof window !== 'undefined') {
          const publicPages = ['/signin', '/signup', '/', '/shop', '/products', '/about', '/contact'];
          const currentPath = window.location.pathname;
          const isPublicPage = publicPages.some(page => currentPath === page || currentPath.startsWith('/products/'));
          
          if (!isPublicPage) {
            window.location.href = '/signin';
          }
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// ============================================================================
// CONFIGURATION & API INSTANCES
// ============================================================================

/**
 * Configuration cho Generated API Client
 * Pass our axios instance to ensure withCredentials is used
 */
const apiConfig = new Configuration({
  basePath: API_BASE_URL,
  // No accessToken needed - cookies handle auth
});

// ==================== API INSTANCES ====================

/**
 * Auth API - Đăng nhập, đăng ký, quản lý tài khoản
 * Pass generatedApiAxios to ensure withCredentials is used
 */
export const authApi = new AuthApi(apiConfig, API_BASE_URL, generatedApiAxios);

/**
 * Products API - Xem sản phẩm, tìm kiếm, lọc
 */
export const productsApi = new ProductsApi(apiConfig, API_BASE_URL, generatedApiAxios);

/**
 * Categories API - Danh mục sản phẩm
 */
export const categoriesApi = new CategoriesApi(apiConfig, API_BASE_URL, generatedApiAxios);

/**
 * Cart API - Giỏ hàng
 */
export const cartApi = new CartApi(apiConfig, API_BASE_URL, generatedApiAxios);

/**
 * Orders API - Đặt hàng, xem đơn hàng
 */
export const ordersApi = new OrdersApi(apiConfig, API_BASE_URL, generatedApiAxios);

/**
 * Reviews API - Đánh giá sản phẩm
 */
export const reviewsApi = new ReviewsApi(apiConfig, API_BASE_URL, generatedApiAxios);

/**
 * Addresses API - Địa chỉ giao hàng
 */
export const addressesApi = new AddressesApi(apiConfig, API_BASE_URL, generatedApiAxios);

/**
 * Discounts API - Mã giảm giá
 */
export const discountsApi = new DiscountsApi(apiConfig, API_BASE_URL, generatedApiAxios);

// ==================== EXPORTS ====================

// Export tất cả models/types để sử dụng
export * from '@/generated-api/models';

// Export Configuration nếu cần custom
export { Configuration } from '@/generated-api';

// ==================== HELPER FUNCTIONS ====================

/**
 * DEPRECATED: Cookies handle auth automatically
 * Keeping for backward compatibility
 */
export const updateApiToken = (token: string) => {
  // Deprecated - cookies handle auth
};

/**
 * DEPRECATED: Backend clears cookies on logout
 * Keeping for backward compatibility
 */
export const clearApiToken = () => {
  // Deprecated - backend clears cookies
};

/**
 * Tạo API client mới với custom config (nếu cần)
 */
export const createCustomApiClient = <T>(
  ApiClass: new (config: Configuration) => T,
  customConfig?: Partial<ConfigurationParameters>
): T => {
  const config = new Configuration({
    basePath: API_BASE_URL,
    ...customConfig,
  });
  return new ApiClass(config);
};

// ==================== TYPE HELPERS ====================

/**
 * Helper type để extract response data từ Axios promise
 */
export type ApiResponse<T> = T extends (...args: any[]) => Promise<infer R>
  ? R extends { data: infer D }
    ? D
    : never
  : never;
