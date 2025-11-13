/**
 * API Service cho Client
 * Kết nối với backend API tại http://localhost:5000 (dev) hoặc https://api.nettechpro.me (production)
 */

import axios, { AxiosInstance, AxiosError } from 'axios';

// API Base URL - tự động lấy từ environment variable hoặc mặc định localhost
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Tạo axios instance với config mặc định
const apiClient: AxiosInstance = axios.create({
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

// Response interceptor - xử lý lỗi chung
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
  brand: string;
  stock: number;
  rating: number;
  reviews: number;
  specifications?: Record<string, string>;
  tags?: string[];
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
  productsCount?: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  productsCount?: number;
}

export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  updatedAt: string;
}

export interface Order {
  id: string;
  userId: string;
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
  shippingMethod: 'standard' | 'express';
  shippingFee: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  note?: string;
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
  createdAt: string;
}

export interface AuthResponse {
  id: number;
  email: string;
  username: string;
  accessToken: string;
  refreshToken: string;
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

// ==================== PRODUCTS API ====================
export const productsApi = {
  // Lấy danh sách sản phẩm
  getAll: async (params?: PaginationParams & { 
    category?: string; 
    brand?: string; 
    minPrice?: number; 
    maxPrice?: number;
    tags?: string[];
  }): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get('/api/products', { params });
    return response.data;
  },

  // Lấy chi tiết sản phẩm
  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/api/products/${id}`);
    return response.data;
  },

  // Lấy sản phẩm theo slug
  getBySlug: async (slug: string): Promise<Product> => {
    const response = await apiClient.get(`/api/products/slug/${slug}`);
    return response.data;
  },

  // Lấy sản phẩm liên quan
  getRelated: async (id: string, limit: number = 4): Promise<Product[]> => {
    const response = await apiClient.get(`/api/products/${id}/related`, { 
      params: { limit } 
    });
    return response.data;
  },

  // Tìm kiếm sản phẩm
  search: async (query: string, params?: PaginationParams): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get('/api/products/search', { 
      params: { ...params, q: query } 
    });
    return response.data;
  },
};

// ==================== CATEGORIES API ====================
export const categoriesApi = {
  // Lấy tất cả danh mục
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get('/api/categories');
    return response.data;
  },

  // Lấy chi tiết danh mục
  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get(`/api/categories/${id}`);
    return response.data;
  },

  // Lấy danh mục theo slug
  getBySlug: async (slug: string): Promise<Category> => {
    const response = await apiClient.get(`/api/categories/slug/${slug}`);
    return response.data;
  },

  // Lấy sản phẩm theo danh mục
  getProducts: async (id: string, params?: PaginationParams): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get(`/api/categories/${id}/products`, { params });
    return response.data;
  },
};

// ==================== BRANDS API ====================
export const brandsApi = {
  // Lấy tất cả thương hiệu
  getAll: async (): Promise<Brand[]> => {
    const response = await apiClient.get('/api/brands');
    return response.data;
  },

  // Lấy chi tiết thương hiệu
  getById: async (id: string): Promise<Brand> => {
    const response = await apiClient.get(`/api/brands/${id}`);
    return response.data;
  },

  // Lấy sản phẩm theo thương hiệu
  getProducts: async (id: string, params?: PaginationParams): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get(`/api/brands/${id}/products`, { params });
    return response.data;
  },
};

// ==================== CART API ====================
export const cartApi = {
  // Lấy giỏ hàng hiện tại
  get: async (): Promise<Cart> => {
    const response = await apiClient.get('/api/cart');
    return response.data;
  },

  // Thêm sản phẩm vào giỏ
  addItem: async (productId: string, quantity: number = 1): Promise<Cart> => {
    const response = await apiClient.post('/api/cart/items', { 
      productId, 
      quantity 
    });
    return response.data;
  },

  // Cập nhật số lượng
  updateItem: async (itemId: string, quantity: number): Promise<Cart> => {
    const response = await apiClient.put(`/api/cart/items/${itemId}`, { 
      quantity 
    });
    return response.data;
  },

  // Xóa sản phẩm khỏi giỏ
  removeItem: async (itemId: string): Promise<Cart> => {
    const response = await apiClient.delete(`/api/cart/items/${itemId}`);
    return response.data;
  },

  // Xóa toàn bộ giỏ hàng
  clear: async (): Promise<void> => {
    await apiClient.delete('/api/cart');
  },
};

// ==================== ORDERS API ====================
export const ordersApi = {
  // Tạo đơn hàng mới
  create: async (orderData: {
    items: { productId: string; quantity: number; price: number }[];
    shippingAddress: Order['shippingAddress'];
    billingAddress?: Order['billingAddress'];
    paymentMethod: Order['paymentMethod'];
    shippingMethod: Order['shippingMethod'];
    note?: string;
  }): Promise<Order> => {
    const response = await apiClient.post('/api/orders', orderData);
    return response.data;
  },

  // Lấy danh sách đơn hàng của user
  getMyOrders: async (params?: PaginationParams): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get('/api/orders/my', { params });
    return response.data;
  },

  // Lấy chi tiết đơn hàng
  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get(`/api/orders/${id}`);
    return response.data;
  },

  // Hủy đơn hàng
  cancel: async (id: string, reason?: string): Promise<Order> => {
    const response = await apiClient.post(`/api/orders/${id}/cancel`, { reason });
    return response.data;
  },
};

// ==================== AUTH API ====================
export const authApi = {
  // Đăng ký
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/v1/auth/register', userData);
    // Response từ backend: { success: true, data: { id, email, username, accessToken, refreshToken }, message }
    const data = response.data.data || response.data;
    return data;
  },

  // Đăng nhập
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/v1/auth/login', { email, password });
    // Response từ backend: { success: true, data: { id, email, username, accessToken, refreshToken }, message }
    const data = response.data.data || response.data;
    return data;
  },

  // Đăng xuất
  logout: async (): Promise<void> => {
    await apiClient.post('/api/v1/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Lấy thông tin user hiện tại
  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/api/v1/users/profile');
    return response.data.data || response.data;
  },

  // Cập nhật thông tin user
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await apiClient.put('/api/v1/users/profile', userData);
    const data = response.data.data || response.data;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...user, ...data }));
    return data;
  },

  // Đổi mật khẩu
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/api/v1/auth/change-password', { 
      oldPassword, 
      password: newPassword 
    });
  },

  // Quên mật khẩu (chưa implement backend)
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/api/v1/auth/forgot-password', { email });
  },

  // Reset mật khẩu (chưa implement backend)
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post('/api/v1/auth/reset-password', { token, newPassword });
  },
};

// Export default object chứa tất cả API
const api = {
  products: productsApi,
  categories: categoriesApi,
  brands: brandsApi,
  cart: cartApi,
  orders: ordersApi,
  auth: authApi,
  client: apiClient, // Export axios instance để sử dụng trực tiếp nếu cần
};

export default api;
