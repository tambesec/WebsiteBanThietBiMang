/**
 * API Service cho Admin Dashboard
 * Kết nối với backend API tại http://localhost:5000 (dev) hoặc https://api.nettechpro.me (production)
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

// API Base URL - tự động lấy từ environment variable hoặc mặc định localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Tạo axios instance với config mặc định
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor - thêm token vào header
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
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/signin';
    }
    return Promise.reject(error);
  }
);

// ==================== TYPES ====================
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  categoryName?: string;
  brand: string;
  brandName?: string;
  stock: number;
  rating: number;
  reviews: number;
  specifications?: Record<string, string>;
  tags?: string[];
  isActive: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  order: number;
  isActive: boolean;
  productsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  isActive: boolean;
  productsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'admin';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
  user?: User;
  items: {
    productId: string;
    product: Product;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    ward: string;
  };
  billingAddress?: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    ward: string;
  };
  paymentMethod: 'cod' | 'bank_transfer' | 'momo' | 'vnpay';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  shippingMethod: 'standard' | 'express';
  shippingFee: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  note?: string;
  adminNote?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'super_admin';
  avatar?: string;
  permissions?: string[];
}

export interface AuthResponse {
  token: string;
  user: AdminUser;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  revenueGrowth: number;
  ordersGrowth: number;
  productsGrowth: number;
  usersGrowth: number;
  recentOrders: Order[];
  topProducts: Product[];
}

export interface Review {
  id: string;
  userId: string;
  user?: User;
  productId: string;
  product?: Product;
  rating: number;
  comment: string;
  images?: string[];
  isVerified: boolean;
  adminReply?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnalyticsData {
  revenue: {
    daily: { date: string; amount: number }[];
    weekly: { week: string; amount: number }[];
    monthly: { month: string; amount: number }[];
    yearly: { year: string; amount: number }[];
  };
  orders: {
    byStatus: { status: string; count: number }[];
    byPaymentMethod: { method: string; count: number }[];
    trend: { date: string; count: number }[];
  };
  products: {
    topSelling: { productId: string; name: string; sold: number }[];
    lowStock: Product[];
    outOfStock: Product[];
  };
  customers: {
    new: number;
    returning: number;
    topSpenders: { userId: string; name: string; totalSpent: number }[];
  };
}

export interface ShippingMethod {
  id: string;
  name: string;
  code: string;
  basePrice: number;
  pricePerKg?: number;
  estimatedDays?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Discount {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ==================== ADMIN AUTH API ====================
export const adminAuthApi = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/v1/admin/auth/login', { email, password });
    localStorage.setItem('admin_token', response.data.token);
    localStorage.setItem('admin_user', JSON.stringify(response.data.user));
    return response.data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post('/api/v1/admin/auth/logout');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },

  getMe: async (): Promise<AdminUser> => {
    const response = await apiClient.get('/api/v1/admin/auth/me');
    return response.data;
  },

  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/api/v1/admin/auth/change-password', { 
      oldPassword, 
      newPassword 
    });
  },

  updateProfile: async (profileData: Partial<AdminUser>): Promise<AdminUser> => {
    const response = await apiClient.put('/api/v1/admin/auth/profile', profileData);
    return response.data;
  },

  refreshToken: async (): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/v1/admin/auth/refresh-token');
    if (response.data.token) {
      localStorage.setItem('admin_token', response.data.token);
      localStorage.setItem('admin_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
};

// ==================== ADMIN PRODUCTS API ====================
export const adminProductsApi = {
  getAll: async (params?: PaginationParams & { 
    category?: string; 
    brand?: string;
    isActive?: boolean;
    isFeatured?: boolean;
  }): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get('/api/v1/admin/products', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/api/admin/products/${id}`);
    return response.data;
  },

  create: async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'slug' | 'rating' | 'reviews'>): Promise<Product> => {
    const response = await apiClient.post('/api/v1/admin/products', productData);
    return response.data;
  },

  update: async (id: string, productData: Partial<Product>): Promise<Product> => {
    const response = await apiClient.put(`/api/admin/products/${id}`, productData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/products/${id}`);
  },

  bulkDelete: async (ids: string[]): Promise<void> => {
    await apiClient.post('/api/v1/admin/products/bulk-delete', { ids });
  },

  updateStock: async (id: string, stock: number): Promise<Product> => {
    const response = await apiClient.patch(`/api/admin/products/${id}/stock`, { stock });
    return response.data;
  },

  toggleActive: async (id: string): Promise<Product> => {
    const response = await apiClient.patch(`/api/admin/products/${id}/toggle-active`);
    return response.data;
  },

  toggleFeatured: async (id: string): Promise<Product> => {
    const response = await apiClient.patch(`/api/admin/products/${id}/toggle-featured`);
    return response.data;
  },

  uploadImages: async (id: string, images: File[]): Promise<string[]> => {
    const formData = new FormData();
    images.forEach((image) => {
      formData.append('images', image);
    });
    const response = await apiClient.post(`/api/admin/products/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getStatistics: async (): Promise<{
    total: number;
    active: number;
    inactive: number;
    lowStock: number;
    outOfStock: number;
  }> => {
    const response = await apiClient.get('/api/v1/admin/products/statistics');
    return response.data;
  },

  getLowStock: async (threshold: number = 10): Promise<Product[]> => {
    const response = await apiClient.get('/api/v1/admin/products/low-stock', { 
      params: { threshold } 
    });
    return response.data;
  },

  bulkUpdateStatus: async (ids: string[], isActive: boolean): Promise<void> => {
    await apiClient.post('/api/v1/admin/products/bulk-update-status', { ids, isActive });
  },

  bulkUpdatePrice: async (updates: { id: string; price?: number; salePrice?: number }[]): Promise<void> => {
    await apiClient.post('/api/v1/admin/products/bulk-update-price', { updates });
  },
};

// ==================== ADMIN CATEGORIES API ====================
export const adminCategoriesApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Category>> => {
    const response = await apiClient.get('/api/v1/admin/categories', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get(`/api/admin/categories/${id}`);
    return response.data;
  },

  create: async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'slug' | 'productsCount'>): Promise<Category> => {
    const response = await apiClient.post('/api/v1/admin/categories', categoryData);
    return response.data;
  },

  update: async (id: string, categoryData: Partial<Category>): Promise<Category> => {
    const response = await apiClient.put(`/api/admin/categories/${id}`, categoryData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/categories/${id}`);
  },

  reorder: async (categories: { id: string; order: number }[]): Promise<void> => {
    await apiClient.post('/api/v1/admin/categories/reorder', { categories });
  },

  toggleActive: async (id: string): Promise<Category> => {
    const response = await apiClient.patch(`/api/admin/categories/${id}/toggle-active`);
    return response.data;
  },
};

// ==================== ADMIN BRANDS API ====================
export const adminBrandsApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Brand>> => {
    const response = await apiClient.get('/api/v1/admin/brands', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Brand> => {
    const response = await apiClient.get(`/api/admin/brands/${id}`);
    return response.data;
  },

  create: async (brandData: Omit<Brand, 'id' | 'createdAt' | 'updatedAt' | 'slug' | 'productsCount'>): Promise<Brand> => {
    const response = await apiClient.post('/api/v1/admin/brands', brandData);
    return response.data;
  },

  update: async (id: string, brandData: Partial<Brand>): Promise<Brand> => {
    const response = await apiClient.put(`/api/admin/brands/${id}`, brandData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/brands/${id}`);
  },

  toggleActive: async (id: string): Promise<Brand> => {
    const response = await apiClient.patch(`/api/admin/brands/${id}/toggle-active`);
    return response.data;
  },
};

// ==================== ADMIN ORDERS API ====================
export const adminOrdersApi = {
  getAll: async (params?: PaginationParams & { 
    status?: string;
    paymentStatus?: string;
    paymentMethod?: string;
    userId?: string;
  }): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get('/api/v1/admin/orders', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get(`/api/admin/orders/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: Order['status'], note?: string): Promise<Order> => {
    const response = await apiClient.patch(`/api/admin/orders/${id}/status`, { 
      status, 
      adminNote: note 
    });
    return response.data;
  },

  updatePaymentStatus: async (id: string, paymentStatus: Order['paymentStatus']): Promise<Order> => {
    const response = await apiClient.patch(`/api/admin/orders/${id}/payment-status`, { 
      paymentStatus 
    });
    return response.data;
  },

  addNote: async (id: string, note: string): Promise<Order> => {
    const response = await apiClient.post(`/api/admin/orders/${id}/notes`, { note });
    return response.data;
  },

  cancel: async (id: string, reason: string): Promise<Order> => {
    const response = await apiClient.post(`/api/admin/orders/${id}/cancel`, { reason });
    return response.data;
  },

  getStatistics: async (period?: 'day' | 'week' | 'month' | 'year'): Promise<{
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    totalRevenue: number;
    averageOrderValue: number;
  }> => {
    const response = await apiClient.get('/api/v1/admin/orders/statistics', { params: { period } });
    return response.data;
  },

  getRevenueByPeriod: async (startDate: string, endDate: string): Promise<{
    labels: string[];
    data: number[];
  }> => {
    const response = await apiClient.get('/api/v1/admin/orders/revenue', { 
      params: { startDate, endDate } 
    });
    return response.data;
  },

  exportOrders: async (params?: { 
    startDate?: string; 
    endDate?: string; 
    status?: string; 
    format?: 'csv' | 'excel' 
  }): Promise<Blob> => {
    const response = await apiClient.get('/api/v1/admin/orders/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  bulkUpdateStatus: async (ids: string[], status: Order['status']): Promise<void> => {
    await apiClient.post('/api/v1/admin/orders/bulk-update-status', { ids, status });
  },
};

// ==================== ADMIN USERS API ====================
export const adminUsersApi = {
  getAll: async (params?: PaginationParams & { 
    role?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get('/api/v1/admin/users', { params });
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/api/admin/users/${id}`);
    return response.data;
  },

  create: async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password: string }): Promise<User> => {
    const response = await apiClient.post('/api/v1/admin/users', userData);
    return response.data;
  },

  update: async (id: string, userData: Partial<User>): Promise<User> => {
    const response = await apiClient.put(`/api/admin/users/${id}`, userData);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/admin/users/${id}`);
  },

  toggleActive: async (id: string): Promise<User> => {
    const response = await apiClient.patch(`/api/admin/users/${id}/toggle-active`);
    return response.data;
  },

  resetPassword: async (id: string, newPassword: string): Promise<void> => {
    await apiClient.post(`/api/admin/users/${id}/reset-password`, { newPassword });
  },
};

// ==================== ADMIN DASHBOARD API ====================
export const adminDashboardApi = {
  getStats: async (period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<DashboardStats> => {
    const response = await apiClient.get('/api/v1/admin/dashboard/stats', { 
      params: { period } 
    });
    return response.data;
  },

  getRevenueChart: async (period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    labels: string[];
    data: number[];
  }> => {
    const response = await apiClient.get('/api/v1/admin/dashboard/revenue-chart', { 
      params: { period } 
    });
    return response.data;
  },

  getOrdersChart: async (period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{
    labels: string[];
    data: number[];
  }> => {
    const response = await apiClient.get('/api/v1/admin/dashboard/orders-chart', { 
      params: { period } 
    });
    return response.data;
  },

  getAnalytics: async (startDate?: string, endDate?: string): Promise<AnalyticsData> => {
    const response = await apiClient.get('/api/v1/admin/dashboard/analytics', { 
      params: { startDate, endDate } 
    });
    return response.data;
  },

  getTopProducts: async (limit: number = 10, period?: string): Promise<Product[]> => {
    const response = await apiClient.get('/api/v1/admin/dashboard/top-products', { 
      params: { limit, period } 
    });
    return response.data;
  },

  getTopCustomers: async (limit: number = 10, period?: string): Promise<User[]> => {
    const response = await apiClient.get('/api/v1/admin/dashboard/top-customers', { 
      params: { limit, period } 
    });
    return response.data;
  },

  getLowStockAlert: async (): Promise<Product[]> => {
    const response = await apiClient.get('/api/v1/admin/dashboard/low-stock-alert');
    return response.data;
  },

  getRecentActivities: async (limit: number = 20): Promise<{
    id: string;
    type: 'order' | 'product' | 'user' | 'review';
    description: string;
    timestamp: string;
  }[]> => {
    const response = await apiClient.get('/api/v1/admin/dashboard/recent-activities', { 
      params: { limit } 
    });
    return response.data;
  },
};

// ==================== ADMIN REVIEWS API ====================
export const adminReviewsApi = {
  getAll: async (params?: PaginationParams & { 
    productId?: string;
    userId?: string;
    rating?: number;
    status?: 'pending' | 'approved' | 'rejected';
  }): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get('/api/v1/admin/reviews', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Review> => {
    const response = await apiClient.get(`/api/v1/admin/reviews/${id}`);
    return response.data;
  },

  updateStatus: async (id: string, status: 'approved' | 'rejected'): Promise<Review> => {
    const response = await apiClient.patch(`/api/v1/admin/reviews/${id}/status`, { status });
    return response.data;
  },

  addReply: async (id: string, reply: string): Promise<Review> => {
    const response = await apiClient.post(`/api/v1/admin/reviews/${id}/reply`, { reply });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/reviews/${id}`);
  },

  bulkUpdateStatus: async (ids: string[], status: 'approved' | 'rejected'): Promise<void> => {
    await apiClient.post('/api/v1/admin/reviews/bulk-update-status', { ids, status });
  },

  bulkDelete: async (ids: string[]): Promise<void> => {
    await apiClient.post('/api/v1/admin/reviews/bulk-delete', { ids });
  },
};

// ==================== ADMIN SHIPPING METHODS API ====================
export const adminShippingMethodsApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<ShippingMethod>> => {
    const response = await apiClient.get('/api/v1/admin/shipping-methods', { params });
    return response.data;
  },

  getById: async (id: string): Promise<ShippingMethod> => {
    const response = await apiClient.get(`/api/v1/admin/shipping-methods/${id}`);
    return response.data;
  },

  create: async (data: Omit<ShippingMethod, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShippingMethod> => {
    const response = await apiClient.post('/api/v1/admin/shipping-methods', data);
    return response.data;
  },

  update: async (id: string, data: Partial<ShippingMethod>): Promise<ShippingMethod> => {
    const response = await apiClient.put(`/api/v1/admin/shipping-methods/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/shipping-methods/${id}`);
  },

  toggleActive: async (id: string): Promise<ShippingMethod> => {
    const response = await apiClient.patch(`/api/v1/admin/shipping-methods/${id}/toggle-active`);
    return response.data;
  },
};

// ==================== ADMIN PAYMENT METHODS API ====================
export const adminPaymentMethodsApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<PaymentMethod>> => {
    const response = await apiClient.get('/api/v1/admin/payment-methods', { params });
    return response.data;
  },

  getById: async (id: string): Promise<PaymentMethod> => {
    const response = await apiClient.get(`/api/v1/admin/payment-methods/${id}`);
    return response.data;
  },

  create: async (data: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentMethod> => {
    const response = await apiClient.post('/api/v1/admin/payment-methods', data);
    return response.data;
  },

  update: async (id: string, data: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    const response = await apiClient.put(`/api/v1/admin/payment-methods/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/payment-methods/${id}`);
  },

  toggleActive: async (id: string): Promise<PaymentMethod> => {
    const response = await apiClient.patch(`/api/v1/admin/payment-methods/${id}/toggle-active`);
    return response.data;
  },
};

// ==================== ADMIN DISCOUNTS API ====================
export const adminDiscountsApi = {
  getAll: async (params?: PaginationParams & { 
    isActive?: boolean;
    discountType?: 'percentage' | 'fixed';
  }): Promise<PaginatedResponse<Discount>> => {
    const response = await apiClient.get('/api/v1/admin/discounts', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Discount> => {
    const response = await apiClient.get(`/api/v1/admin/discounts/${id}`);
    return response.data;
  },

  create: async (data: Omit<Discount, 'id' | 'usedCount' | 'createdAt' | 'updatedAt'>): Promise<Discount> => {
    const response = await apiClient.post('/api/v1/admin/discounts', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Discount>): Promise<Discount> => {
    const response = await apiClient.put(`/api/v1/admin/discounts/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/discounts/${id}`);
  },

  toggleActive: async (id: string): Promise<Discount> => {
    const response = await apiClient.patch(`/api/v1/admin/discounts/${id}/toggle-active`);
    return response.data;
  },

  getUsageStats: async (id: string): Promise<{
    totalUses: number;
    totalDiscount: number;
    orders: Order[];
  }> => {
    const response = await apiClient.get(`/api/v1/admin/discounts/${id}/usage-stats`);
    return response.data;
  },
};

// ==================== ADMIN UPLOAD API ====================
export const adminUploadApi = {
  uploadImage: async (file: File, type: 'product' | 'category' | 'brand' | 'user' = 'product'): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('type', type);
    const response = await apiClient.post('/api/v1/admin/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.url;
  },

  uploadImages: async (files: File[], type: 'product' | 'category' | 'brand' = 'product'): Promise<string[]> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('images', file);
    });
    formData.append('type', type);
    const response = await apiClient.post('/api/v1/admin/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.urls;
  },
};

// Export default object chứa tất cả API
const adminApi = {
  auth: adminAuthApi,
  products: adminProductsApi,
  categories: adminCategoriesApi,
  brands: adminBrandsApi,
  orders: adminOrdersApi,
  users: adminUsersApi,
  dashboard: adminDashboardApi,
  reviews: adminReviewsApi,
  shippingMethods: adminShippingMethodsApi,
  paymentMethods: adminPaymentMethodsApi,
  discounts: adminDiscountsApi,
  upload: adminUploadApi,
  client: apiClient, // Export axios instance
};

export default adminApi;
