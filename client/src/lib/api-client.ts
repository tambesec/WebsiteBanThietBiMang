/**
 * ═══════════════════════════════════════════════════════════════
 * API CLIENT - "Control Center" cho Generated API
 * ═══════════════════════════════════════════════════════════════
 * 
 * 🎯 MỤC ĐÍCH:
 * File này là TRUNG TÂM duy nhất để:
 * - Cấu hình Generated API từ swagger.json
 * - Tự động refresh token khi 401
 * - Export các API instances đã config sẵn
 * - Components CHỈ import từ file này, KHÔNG import trực tiếp từ generated-api/
 * 
 * 📐 KIẾN TRÚC 3 LỚP:
 * ┌─────────────────────────────────────────┐
 * │  1. CONFIGURATION                        │  ← Cấu hình basePath, auth
 * │     new Configuration({ basePath })      │
 * └──────────────┬──────────────────────────┘
 *                ↓
 * ┌─────────────────────────────────────────┐
 * │  2. GENERATED API CLASSES                │  ← Từ điển các function API
 * │     new AuthApi(config, basePath, axios) │
 * └──────────────┬──────────────────────────┘
 *                ↓
 * ┌─────────────────────────────────────────┐
 * │  3. COMPONENTS                           │  ← Gọi API như gọi món
 * │     authApi.authControllerLogin(...)     │
 * └─────────────────────────────────────────┘
 * 
 * 🔐 AUTHENTICATION:
 * - Dùng HTTP-only cookies (access_token & refresh_token)
 * - KHÔNG có localStorage tokens
 * - Auto refresh khi 401, queue requests để tránh race condition
 * 
 * 🔗 BASE URL ARCHITECTURE:
 * - NEXT_PUBLIC_API_URL = http://localhost:3000/api/v1 (từ .env)
 * - Swagger paths = "/api/v1/categories" (đã có prefix)
 * - baseURL = http://localhost:3000 (KHÔNG có /api/v1)
 * - Final URL = baseURL + swagger path ✅
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

// ═══════════════════════════════════════════════════════════════
// BƯỚC 1: CẤU HÌNH BASE URL
// ═══════════════════════════════════════════════════════════════

/**
 * NEXT_PUBLIC_API_URL từ .env
 * Production: https://api.netcompro.tech/api/v1
 * Development: http://localhost:3000/api/v1
 */
const FULL_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

/**
 * ⚠️ QUAN TRỌNG: Generated API paths đã có /api/v1
 * 
 * Swagger.json định nghĩa:
 * - "/api/v1/categories" 
 * - "/api/v1/products"
 * 
 * Vì vậy axios baseURL KHÔNG được có /api/v1
 * Final URL = baseURL + swagger path
 * Ví dụ: http://localhost:3000 + /api/v1/categories = ✅
 */
const API_BASE_URL = FULL_API_URL.replace(/\/api\/v1$/, '');

/**
 * Legacy axios baseURL (cho backward compatibility)
 * Dùng cho components cũ vẫn gọi axiosInstance.get('/products')
 * ⚠️ Deprecated: Nên dùng generated API thay vì axiosInstance
 */
const AXIOS_BASE_URL = FULL_API_URL;

// ═══════════════════════════════════════════════════════════════
// BƯỚC 2: TẠO AXIOS INSTANCES
// ═══════════════════════════════════════════════════════════════

/**
 * ⚠️ Legacy Axios Instance (DEPRECATED)
 * 
 * Dùng cho backward compatibility với components cũ
 * Ví dụ: axiosInstance.get('/products')
 * 
 * 🚫 KHÔNG KHUYẾN NGHỊ: Nên migrate sang generated API
 */
export const axiosInstance = axios.create({
  baseURL: AXIOS_BASE_URL,
  withCredentials: true, // Tự động gửi cookies
});

/**
 * ✅ Generated API Axios Instance (RECOMMENDED)
 * 
 * Đây là axios instance CHÍNH cho tất cả generated API
 * BaseAPI constructor: new BaseAPI(configuration?, basePath?, axios?)
 * 
 * Constructor signature từ generated-api/base.ts:
 * constructor(
 *   configuration?: Configuration,
 *   basePath: string = BASE_PATH,
 *   axios: AxiosInstance = globalAxios
 * )
 */
export const generatedApiAxios = axios.create({
  baseURL: API_BASE_URL, // Không có /api/v1 vì swagger paths đã có
  withCredentials: true, // Gửi HTTP-only cookies
});

/**
 * 🔄 Plain Axios cho Refresh (NO INTERCEPTORS)
 * 
 * Dùng riêng cho refresh endpoint để tránh circular dependency:
 * - authApi dùng generatedApiAxios
 * - generatedApiAxios interceptor cần gọi refresh
 * - Nếu dùng authApi trong interceptor → infinite loop!
 * 
 * Giải pháp: refreshApi dùng plain axios (không interceptor)
 */
const plainAxiosForRefresh = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

/**
 * Configuration riêng cho refreshApi
 */
const refreshApiConfig = new Configuration({
  basePath: API_BASE_URL,
  baseOptions: { withCredentials: true },
});

/**
 * AuthApi instance riêng cho refresh (dùng plain axios)
 * Tránh circular dependency với generatedApiAxios interceptor
 */
const refreshApi = new AuthApi(refreshApiConfig, API_BASE_URL, plainAxiosForRefresh);

// ═══════════════════════════════════════════════════════════════
// BƯỚC 3: REFRESH TOKEN QUEUE MECHANISM
// ═══════════════════════════════════════════════════════════════
/**
 * 🔄 AUTO REFRESH TOKEN FLOW:
 * 
 * 1. Request → 401 Unauthorized
 * 2. Nếu đang refresh: Queue request này
 * 3. Nếu chưa refresh: Gọi /auth/refresh với refresh_token cookie
 * 4. Refresh thành công: Retry tất cả queued requests
 * 5. Refresh thất bại: Reject all & redirect /signin
 * 
 * ⚡ Tránh race condition: Chỉ 1 refresh request tại 1 thời điểm
 */

interface QueuedRequest {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
  config: AxiosRequestConfig;
}

let isRefreshing = false;
let isLoggingOut = false;
let failedQueue: QueuedRequest[] = [];

/**
 * Xử lý hàng đợi requests sau khi refresh token
 * 
 * @param error - Nếu có lỗi, reject tất cả requests
 * @param token - Token mới (không dùng vì cookies auto handle)
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
 * Set trạng thái logout để ngăn auto refresh
 * 
 * @param state - true khi đang logout, false sau khi logout xong
 * 
 * Gọi trong logout flow:
 * setLoggingOut(true)
 * await authApi.authControllerLogout()
 * setLoggingOut(false)
 */
export const setLoggingOut = (state: boolean) => {
  isLoggingOut = state;
  if (state) {
    // When logging out, reject all queued requests
    processQueue(new Error('Logging out'));
  }
};

// ═══════════════════════════════════════════════════════════════
// BƯỚC 4: RESPONSE INTERCEPTOR - TỰ ĐỘNG REFRESH KHI 401
// ═══════════════════════════════════════════════════════════════

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
        // ✅ Call refresh endpoint using generated API
        // Uses refreshApi (plain axios) to avoid circular dependency
        await refreshApi.authControllerRefreshToken();

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
        // ✅ Call refresh endpoint using generated API
        await refreshApi.authControllerRefreshToken();

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

// ═══════════════════════════════════════════════════════════════
// BƯỚC 5: CONFIGURATION - Cấu Hình Generated API
// ═══════════════════════════════════════════════════════════════

/**
 * Configuration object cho Generated API Classes
 * 
 * ConfigurationParameters từ generated-api/configuration.ts:
 * - basePath: Base URL cho tất cả requests
 * - accessToken: Không cần (dùng cookies)
 * - baseOptions: Default options cho axios (withCredentials, headers, ...)
 * 
 * ⚠️ LƯU Ý:
 * - basePath = http://localhost:3000 (KHÔNG có /api/v1)
 * - Swagger paths đã có /api/v1 prefix
 * - Final URL = basePath + swagger path
 */
const apiConfig = new Configuration({
  basePath: API_BASE_URL,
  // Không cần accessToken - HTTP-only cookies tự động handle
  baseOptions: {
    withCredentials: true, // Đảm bảo cookies được gửi
  },
});

// ═══════════════════════════════════════════════════════════════
// BƯỚC 6: KHỞI TẠO API INSTANCES - "Đàn Ông Hơi Nướng"
// ═══════════════════════════════════════════════════════════════

/**
 * Pattern khởi tạo Generated API:
 * new XxxApi(
 *   configuration,  // Configuration object với basePath
 *   basePath,       // Override basePath nếu cần
 *   axios           // Custom axios instance với interceptors
 * )
 * 
 * BaseAPI constructor từ generated-api/base.ts:
 * constructor(
 *   configuration?: Configuration,
 *   basePath: string = BASE_PATH,
 *   axios: AxiosInstance = globalAxios
 * )
 */

/**
 * 🔐 Auth API - Authentication & Authorization
 * 
 * Methods:
 * - authControllerLogin(loginDto)
 * - authControllerRegister(registerDto)
 * - authControllerLogout()
 * - authControllerGetProfile()
 * - authControllerUpdateProfile(updateDto)
 * - authControllerChangePassword(changePasswordDto)
 * - authControllerForgotPassword(forgotPasswordDto)
 * - authControllerResetPassword(resetPasswordDto)
 * - authControllerGetSession()
 * - authControllerRefresh()
 */
export const authApi = new AuthApi(apiConfig, API_BASE_URL, generatedApiAxios);

/**
 * 📦 Products API - Quản lý sản phẩm
 * 
 * Methods:
 * - productsControllerFindAll(search, category, minPrice, maxPrice, ...)
 * - productsControllerFindOne(id)
 * - productsControllerFindBySlug(slug)
 * - productsControllerSearch(searchDto)
 */
export const productsApi = new ProductsApi(apiConfig, API_BASE_URL, generatedApiAxios);

/**
 * 📂 Categories API - Danh mục sản phẩm
 * 
 * Methods:
 * - categoriesControllerFindAll(search, parentId, page, limit)
 * - categoriesControllerGetCategoryTree()
 * - categoriesControllerFindOne(id)
 * - categoriesControllerFindBySlug(slug)
 */
export const categoriesApi = new CategoriesApi(apiConfig, API_BASE_URL, generatedApiAxios);

/**
 * 🛒 Cart API - Giỏ hàng
 * 
 * Methods:
 * - cartControllerGetCart()
 * - cartControllerAddToCart(addToCartDto)
 * - cartControllerUpdateCartItem(id, updateDto)
 * - cartControllerRemoveCartItem(id)
 * - cartControllerClearCart()
 */
export const cartApi = new CartApi(apiConfig, API_BASE_URL, generatedApiAxios);

/**
 * 📋 Orders API - Quản lý đơn hàng
 * 
 * Methods:
 * - ordersControllerCreate(createOrderDto)
 * - ordersControllerFindAll(status, page, limit)
 * - ordersControllerFindOne(id)
 * - ordersControllerCancel(id)
 */
export const ordersApi = new OrdersApi(apiConfig, API_BASE_URL, generatedApiAxios);

/**
 * ⭐ Reviews API - Đánh giá sản phẩm
 * 
 * Methods:
 * - reviewsControllerCreate(createReviewDto)
 * - reviewsControllerFindAll(productId, rating, page, limit)
 * - reviewsControllerUpdate(id, updateDto)
 * - reviewsControllerRemove(id)
 */
export const reviewsApi = new ReviewsApi(apiConfig, API_BASE_URL, generatedApiAxios);

/**
 * 📍 Addresses API - Quản lý địa chỉ giao hàng
 * 
 * Methods:
 * - addressesControllerFindAll()
 * - addressesControllerCreate(createAddressDto)
 * - addressesControllerUpdate(id, updateDto)
 * - addressesControllerRemove(id)
 * - addressesControllerSetDefault(id)
 */
export const addressesApi = new AddressesApi(apiConfig, API_BASE_URL, generatedApiAxios);

/**
 * 🎟️ Discounts API - Mã giảm giá
 * 
 * Methods:
 * - discountsControllerValidate(validateDto)
 * - discountsControllerFindAll()
 */
export const discountsApi = new DiscountsApi(apiConfig, API_BASE_URL, generatedApiAxios);

// ═══════════════════════════════════════════════════════════════
// BƯỚC 7: EXPORT TYPES - Re-export từ generated-api
// ═══════════════════════════════════════════════════════════════

/**
 * Export tất cả models/types từ generated-api/models/
 * 
 * Components import như sau:
 * import type { LoginDto, Product, CreateOrderDto } from '@/lib/api-client';
 * 
 * ✅ ĐÚNG: Import từ api-client.ts (file này)
 * ❌ SAI: Import từ @/generated-api/models (trực tiếp)
 */
export * from '@/generated-api/models';

/**
 * Export Configuration class để có thể tạo custom instances
 * 
 * Ví dụ advanced use case:
 * const customConfig = new Configuration({ basePath: 'https://other-api.com' })
 * const customAuthApi = new AuthApi(customConfig)
 */
export { Configuration } from '@/generated-api';

// ═══════════════════════════════════════════════════════════════
// HELPER FUNCTIONS (Deprecated - Giữ cho backward compatibility)
// ═══════════════════════════════════════════════════════════════

/**
 * @deprecated Cookies tự động handle authentication
 * Không cần set token manually
 */
export const updateApiToken = (token: string) => {
  // Deprecated - cookies handle auth
};

/**
 * @deprecated Backend tự động clear cookies khi logout
 * Không cần clear token manually
 */
export const clearApiToken = () => {
  // Deprecated - backend clears cookies
};

/**
 * Tạo custom API client instance (Advanced use case)
 * 
 * @param ApiClass - API class từ generated-api (AuthApi, ProductsApi, ...)
 * @param customConfig - Custom configuration parameters
 * @returns API instance với custom config
 * 
 * ⚠️ Hiếm khi cần dùng - Chỉ cho special cases
 * 
 * Ví dụ:
 * const customProductsApi = createCustomApiClient(
 *   ProductsApi,
 *   { basePath: 'https://staging-api.netcompro.tech' }
 * )
 */
export const createCustomApiClient = <T>(
  ApiClass: new (config: Configuration, basePath?: string, axios?: any) => T,
  customConfig?: Partial<ConfigurationParameters>
): T => {
  const config = new Configuration({
    basePath: API_BASE_URL,
    ...customConfig,
  });
  return new ApiClass(config, config.basePath || API_BASE_URL, generatedApiAxios);
};

// ═══════════════════════════════════════════════════════════════
// TYPE HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Extract response data type từ API method
 * 
 * Ví dụ:
 * type ProductsResponse = ApiResponse<typeof productsApi.productsControllerFindAll>;
 * 
 * Kết quả: ProductsResponse = AxiosResponse<Product[]>
 */
export type ApiResponse<T> = T extends (...args: any[]) => Promise<infer R>
  ? R extends { data: infer D }
    ? D
    : never
  : never;

// ═══════════════════════════════════════════════════════════════
// 📚 USAGE EXAMPLES
// ═══════════════════════════════════════════════════════════════

/**
 * ✅ CÁCH SỬ DỤNG ĐÚNG:
 * 
 * import { authApi, productsApi } from '@/lib/api-client';
 * import type { LoginDto, Product } from '@/lib/api-client';
 * 
 * // Login
 * const loginData: LoginDto = { email, password };
 * const response = await authApi.authControllerLogin(loginData);
 * 
 * // Get products
 * const { data } = await productsApi.productsControllerFindAll(
 *   undefined, // search
 *   undefined, // category
 *   undefined, // minPrice
 *   undefined, // maxPrice
 *   undefined, // brand
 *   undefined, // inStock
 *   undefined, // featured
 *   'created_at', // sortBy
 *   'desc', // sortOrder
 *   1, // page
 *   10 // limit
 * );
 * 
 * ❌ CÁCH SỬ DỤNG SAI:
 * 
 * // SAI: Import trực tiếp từ generated-api
 * import { AuthApi } from '@/generated-api';
 * const authApi = new AuthApi(); // Thiếu config, interceptors
 * 
 * // SAI: Dùng fetch/axios trực tiếp
 * const response = await fetch('/api/v1/products');
 * 
 * // SAI: Dùng axiosInstance (deprecated)
 * const response = await axiosInstance.get('/products');
 */
