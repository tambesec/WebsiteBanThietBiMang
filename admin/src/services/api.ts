/**
 * API Service cho Admin Dashboard
 * Backend sử dụng role-based access control - Admin dùng chung endpoint với client
 * Các endpoint cần auth sẽ check role='admin' từ JWT token
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Tạo axios instance
const apiClient: AxiosInstance = axios.create({
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

// Response interceptor - xử lý lỗi và unwrap response
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    
    // Xử lý 401 - Token hết hạn, thử refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      const refreshToken = localStorage.getItem('admin_refresh_token');
      if (refreshToken) {
        try {
          // 🔄 Call ADMIN refresh endpoint (not client endpoint)
          const response = await axios.post(`${API_BASE_URL}/api/v1/auth/admin/refresh`, {
            refreshToken: refreshToken
          });
          
          const data = response.data;
          if (data.accessToken) {
            localStorage.setItem('admin_token', data.accessToken);
            
            // 🔄 TOKEN ROTATION: Update refresh_token if backend returns new one
            if (data.refreshToken) {
              localStorage.setItem('admin_refresh_token', data.refreshToken);
            }
            
            originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
            return apiClient(originalRequest);
          }
        } catch (refreshError) {
          // Refresh failed
          localStorage.removeItem('admin_token');
          localStorage.removeItem('admin_refresh_token');
          localStorage.removeItem('admin_user');
          window.location.href = '/auth/signin';
          return Promise.reject(refreshError);
        }
      }
      
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_refresh_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/auth/signin';
    }
    
    return Promise.reject(error);
  }
);

// Helper to unwrap response
const unwrap = <T>(response: any): T => {
  return response.data.data || response.data;
};

// ==================== TYPES ====================
export interface Product {
  id: number;
  name: string;
  slug: string;
  brand?: string;
  model?: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  sku: string;
  stock_quantity: number;
  category_id: number;
  category?: Category;
  specifications?: string;
  primary_image?: string;
  images?: ProductImage[];
  is_active: boolean;
  is_featured: boolean;
  warranty_months: number;
  meta_title?: string;
  meta_description?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text?: string;
  display_order: number;
}

export interface Category {
  id: number;
  parent_id?: number;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  display_order: number;
  is_active: boolean;
  children?: Category[];
  products_count?: number;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: 'customer' | 'admin';
  is_active: boolean;
  is_email_verified: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: number;
  order_number: string;
  user_id: number;
  user?: User;
  status_id: number;
  status?: OrderStatus;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: string;
  shipping_city: string;
  shipping_district?: string;
  shipping_ward?: string;
  payment_method: string;
  payment_status: 'unpaid' | 'paid' | 'refunded';
  shipping_method: string;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  discount_code?: string;
  tax_amount: number;
  total_amount: number;
  customer_note?: string;
  admin_note?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface OrderStatus {
  id: number;
  name: string;
  description?: string;
  display_order: number;
  color?: string;
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  product_sku: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  order_id?: number;
  rating: number;
  title?: string;
  comment?: string;
  images?: string;
  is_verified_purchase: boolean;
  is_approved: boolean;
  helpful_count: number;
  admin_reply?: string;
  replied_at?: string;
  created_at: string;
  updated_at: string;
  user?: User;
  product?: Product;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface DashboardStats {
  overview: {
    total_revenue: number;
    total_orders: number;
    total_products: number;
    total_customers: number;
    pending_orders: number;
    low_stock_products: number;
  };
  revenue_by_period: Array<{ period: string; revenue: number }>;
  orders_by_status: Array<{ status: string; count: number }>;
  top_products: Array<{ product: Product; total_sold: number; revenue: number }>;
  recent_orders: Order[];
}

// ==================== ADMIN AUTH API ====================
export const adminAuthApi = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/api/v1/auth/admin/login', { email, password });
    const data = unwrap<any>(response);
    
    // Backend admin endpoint already verifies role
    // Store tokens (Backend returns camelCase)
    if (data.accessToken) {
      localStorage.setItem('admin_token', data.accessToken);
    }
    if (data.refreshToken) {
      localStorage.setItem('admin_refresh_token', data.refreshToken);
    }
    if (data.user) {
      localStorage.setItem('admin_user', JSON.stringify(data.user));
    }
    
    return data;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('admin_refresh_token');
    if (refreshToken) {
      try {
        await apiClient.post('/api/v1/auth/admin/logout', { refreshToken });
      } catch (e) {
        console.error('Logout error:', e);
      }
    }
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
  },

  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/api/v1/auth/profile');
    return unwrap<User>(response);
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    await apiClient.post('/api/v1/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },
};

// ==================== ADMIN PRODUCTS API ====================
export const adminProductsApi = {
  getAll: async (params?: PaginationParams & {
    category_id?: number;
    brand?: string;
    is_active?: boolean;
    is_featured?: boolean;
  }): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get('/api/v1/products', { params });
    const data = unwrap<any>(response);
    return {
      data: data.products || data.data || [],
      pagination: data.pagination || { page: 1, limit: 10, total: 0, total_pages: 1 },
    };
  },

  getById: async (id: number): Promise<Product> => {
    const response = await apiClient.get(`/api/v1/products/${id}`);
    return unwrap<Product>(response);
  },

  getBySlug: async (slug: string): Promise<Product> => {
    const response = await apiClient.get(`/api/v1/products/slug/${slug}`);
    return unwrap<Product>(response);
  },

  create: async (productData: {
    name: string;
    category_id: number;
    price: number;
    sku: string;
    brand?: string;
    model?: string;
    description?: string;
    compare_at_price?: number;
    stock_quantity?: number;
    specifications?: string;
    primary_image?: string;
    is_active?: boolean;
    is_featured?: boolean;
    warranty_months?: number;
    meta_title?: string;
    meta_description?: string;
  }): Promise<Product> => {
    const response = await apiClient.post('/api/v1/products', productData);
    return unwrap<Product>(response);
  },

  update: async (id: number, productData: Partial<Product>): Promise<Product> => {
    const response = await apiClient.patch(`/api/v1/products/${id}`, productData);
    return unwrap<Product>(response);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/products/${id}`);
  },

  updateStock: async (id: number, quantity: number): Promise<Product> => {
    const response = await apiClient.patch(`/api/v1/products/${id}/stock`, { quantity });
    return unwrap<Product>(response);
  },

  toggleFeatured: async (id: number): Promise<Product> => {
    const response = await apiClient.patch(`/api/v1/products/${id}/toggle-featured`);
    return unwrap<Product>(response);
  },

  getFilterOptions: async () => {
    const response = await apiClient.get('/api/v1/products/filters/options');
    return unwrap<any>(response);
  },
};

// ==================== ADMIN CATEGORIES API ====================
export const adminCategoriesApi = {
  getAll: async (params?: PaginationParams & {
    parent_id?: number;
    is_active?: boolean;
  }): Promise<PaginatedResponse<Category>> => {
    const response = await apiClient.get('/api/v1/categories', { params });
    const data = unwrap<any>(response);
    // Categories might return array directly or wrapped
    const categories = Array.isArray(data) ? data : (data.categories || data.data || []);
    return {
      data: categories,
      pagination: data.pagination || { page: 1, limit: 100, total: categories.length, total_pages: 1 },
    };
  },

  getTree: async (): Promise<Category[]> => {
    const response = await apiClient.get('/api/v1/categories/tree');
    return unwrap<Category[]>(response);
  },

  getById: async (id: number): Promise<Category> => {
    const response = await apiClient.get(`/api/v1/categories/${id}`);
    return unwrap<Category>(response);
  },

  create: async (categoryData: {
    name: string;
    parent_id?: number;
    description?: string;
    image_url?: string;
    display_order?: number;
    is_active?: boolean;
  }): Promise<Category> => {
    const response = await apiClient.post('/api/v1/categories', categoryData);
    return unwrap<Category>(response);
  },

  update: async (id: number, categoryData: Partial<Category>): Promise<Category> => {
    const response = await apiClient.patch(`/api/v1/categories/${id}`, categoryData);
    return unwrap<Category>(response);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/categories/${id}`);
  },

  reorder: async (categories: { id: number; display_order: number }[]): Promise<void> => {
    await apiClient.post('/api/v1/categories/reorder', { categories });
  },
};

// ==================== ADMIN ORDERS API ====================
export const adminOrdersApi = {
  getAll: async (params?: PaginationParams & {
    status_id?: number;
    payment_status?: string;
    user_id?: number;
  }): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get('/api/v1/orders/admin/all', { params });
    const data = unwrap<any>(response);
    return {
      data: data.orders || data.data || [],
      pagination: data.pagination || { page: 1, limit: 20, total: 0, total_pages: 1 },
    };
  },

  getById: async (id: number): Promise<Order> => {
    const response = await apiClient.get(`/api/v1/orders/${id}`);
    return unwrap<Order>(response);
  },

  getByOrderNumber: async (orderNumber: string): Promise<Order> => {
    const response = await apiClient.get(`/api/v1/orders/number/${orderNumber}`);
    return unwrap<Order>(response);
  },

  updateStatus: async (id: number, statusData: {
    status_id: number;
    note?: string;
    tracking_number?: string;
  }): Promise<Order> => {
    const response = await apiClient.patch(`/api/v1/orders/${id}/status`, statusData);
    return unwrap<Order>(response);
  },

  getStatistics: async () => {
    const response = await apiClient.get('/api/v1/orders/admin/statistics');
    return unwrap<any>(response);
  },
};

// ==================== ADMIN REVIEWS API ====================
export const adminReviewsApi = {
  getAll: async (params?: PaginationParams & {
    product_id?: number;
    user_id?: number;
    is_approved?: boolean;
    rating?: number;
  }): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get('/api/v1/reviews', { params });
    const data = unwrap<any>(response);
    return {
      data: data.reviews || data.data || [],
      pagination: data.pagination || { page: 1, limit: 20, total: 0, total_pages: 1 },
    };
  },

  getById: async (id: number): Promise<Review> => {
    const response = await apiClient.get(`/api/v1/reviews/${id}`);
    return unwrap<Review>(response);
  },

  approve: async (id: number): Promise<Review> => {
    const response = await apiClient.post(`/api/v1/reviews/${id}/approve`);
    return unwrap<Review>(response);
  },

  reject: async (id: number): Promise<Review> => {
    const response = await apiClient.post(`/api/v1/reviews/${id}/reject`);
    return unwrap<Review>(response);
  },

  addReply: async (id: number, reply: string): Promise<Review> => {
    const response = await apiClient.post(`/api/v1/reviews/${id}/reply`, { reply });
    return unwrap<Review>(response);
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/reviews/${id}`);
  },
};

// ==================== ADMIN DASHBOARD API ====================
export const adminDashboardApi = {
  getStats: async (params?: { period?: 'day' | 'week' | 'month' | 'year' }): Promise<DashboardStats> => {
    const response = await apiClient.get('/api/v1/dashboard/stats', { params });
    return unwrap<DashboardStats>(response);
  },

  getRevenueChart: async (params?: { period?: 'day' | 'week' | 'month' | 'year' }) => {
    const response = await apiClient.get('/api/v1/dashboard/revenue', { params });
    return unwrap<any>(response);
  },

  getOrdersChart: async (params?: { period?: 'day' | 'week' | 'month' | 'year' }) => {
    const response = await apiClient.get('/api/v1/dashboard/orders-chart', { params });
    return unwrap<any>(response);
  },
};

// ==================== ADMIN DISCOUNTS API ====================
export const adminDiscountsApi = {
  getAll: async (params?: PaginationParams & { is_active?: boolean }) => {
    const response = await apiClient.get('/api/v1/discounts', { params });
    const data = unwrap<any>(response);
    return {
      data: data.discounts || data.data || [],
      pagination: data.pagination || { page: 1, limit: 20, total: 0, total_pages: 1 },
    };
  },

  getById: async (id: number) => {
    const response = await apiClient.get(`/api/v1/discounts/${id}`);
    return unwrap<any>(response);
  },

  create: async (discountData: {
    code: string;
    description?: string;
    discount_type: 'percentage' | 'fixed_amount';
    discount_value: number;
    min_order_amount?: number;
    max_discount_amount?: number;
    max_uses?: number;
    max_uses_per_user?: number;
    starts_at: string;
    ends_at: string;
    is_active?: boolean;
  }) => {
    const response = await apiClient.post('/api/v1/discounts', discountData);
    return unwrap<any>(response);
  },

  update: async (id: number, discountData: any) => {
    const response = await apiClient.patch(`/api/v1/discounts/${id}`, discountData);
    return unwrap<any>(response);
  },

  delete: async (id: number) => {
    await apiClient.delete(`/api/v1/discounts/${id}`);
  },

  validate: async (code: string, orderAmount: number) => {
    const response = await apiClient.post('/api/v1/discounts/validate', { code, order_amount: orderAmount });
    return unwrap<any>(response);
  },
};

// Export default object chứa tất cả API
const adminApi = {
  auth: adminAuthApi,
  products: adminProductsApi,
  categories: adminCategoriesApi,
  orders: adminOrdersApi,
  reviews: adminReviewsApi,
  dashboard: adminDashboardApi,
  discounts: adminDiscountsApi,
  client: apiClient,
};

export default adminApi;
