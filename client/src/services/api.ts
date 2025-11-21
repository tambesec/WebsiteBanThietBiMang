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
  username: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  avatar?: string;
  role?: 'customer' | 'admin';
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: number;
  userId: number;
  recipientName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: number;
  userId: number;
  productItemId: number;
  rating: number;
  comment?: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
  product?: Product;
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
    search?: string;
  }): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get('/api/v1/products', { params });
    // Backend returns: { success: true, data: { data: [...], meta: {...} } }
    const result = response.data.data || response.data;
    return {
      data: result.data || result,
      pagination: result.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }
    };
  },

  // Lấy chi tiết sản phẩm
  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/api/products/${id}`);
    return response.data.data || response.data;
  },

  // Lấy sản phẩm theo slug (backend không hỗ trợ, dùng search thay thế)
  getBySlug: async (slug: string): Promise<Product> => {
    const response = await apiClient.get('/api/v1/products', { 
      params: { search: slug, limit: 1 } 
    });
    const result = response.data.data || response.data;
    const products = result.data || result;
    if (!products || products.length === 0) {
      throw new Error('Product not found');
    }
    return products[0];
  },

  // Lấy sản phẩm liên quan (dựa trên category)
  getRelated: async (id: string, limit: number = 4): Promise<Product[]> => {
    // Lấy product detail để biết category
    const product = await productsApi.getById(id);
    const response = await apiClient.get('/api/v1/products', { 
      params: { category: product.category, limit, page: 1 } 
    });
    const result = response.data.data || response.data;
    const products = (result.data || result) as Product[];
    // Filter out current product
    return products.filter(p => p.id !== id).slice(0, limit);
  },

  // Tìm kiếm sản phẩm
  search: async (query: string, params?: PaginationParams): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get('/api/v1/products', { 
      params: { ...params, search: query } 
    });
    const result = response.data.data || response.data;
    return {
      data: result.data || result,
      pagination: result.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }
    };
  },
};

// ==================== CATEGORIES API ====================
export const categoriesApi = {
  // Lấy tất cả danh mục
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get('/api/v1/categories');
    return response.data.data || response.data;
  },

  // Lấy chi tiết danh mục
  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get(`/api/categories/${id}`);
    return response.data.data || response.data;
  },

  // Lấy danh mục theo slug (backend không hỗ trợ, search by name)
  getBySlug: async (slug: string): Promise<Category> => {
    const response = await apiClient.get('/api/v1/categories');
    const categories = response.data.data || response.data;
    const category = categories.find((c: Category) => c.slug === slug);
    if (!category) {
      throw new Error('Category not found');
    }
    return category;
  },

  // Lấy sản phẩm theo danh mục
  getProducts: async (id: string, params?: PaginationParams): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get('/api/v1/products', { 
      params: { ...params, categoryId: id } 
    });
    const result = response.data.data || response.data;
    return {
      data: result.data || result,
      pagination: result.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }
    };
  },
};

// ==================== BRANDS API ====================
export const brandsApi = {
  // Lấy tất cả thương hiệu
  getAll: async (): Promise<Brand[]> => {
    const response = await apiClient.get('/api/v1/brands');
    return response.data.data || response.data;
  },

  // Lấy chi tiết thương hiệu (backend trả về brand name, không phải ID)
  getById: async (name: string): Promise<Brand> => {
    const response = await apiClient.get(`/api/brands/${name}`);
    return response.data.data || response.data;
  },

  // Lấy sản phẩm theo thương hiệu
  getProducts: async (name: string, params?: PaginationParams): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get('/api/v1/products', { 
      params: { ...params, brand: name } 
    });
    const result = response.data.data || response.data;
    return {
      data: result.data || result,
      pagination: result.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }
    };
  },
};

// ==================== CART API ====================
export const cartApi = {
  // Lấy giỏ hàng hiện tại
  get: async (): Promise<Cart> => {
    const response = await apiClient.get('/api/v1/cart');
    return response.data.data || response.data;
  },

  // Thêm sản phẩm vào giỏ (backend sử dụng productItemId)
  addItem: async (productItemId: number, quantity: number = 1): Promise<Cart> => {
    const response = await apiClient.post('/api/v1/cart/items', { 
      productItemId, 
      quantity 
    });
    return response.data.data || response.data;
  },

  // Cập nhật số lượng
  updateItem: async (itemId: string, quantity: number): Promise<Cart> => {
    const response = await apiClient.put(`/api/v1/cart/items/${itemId}`, { 
      quantity 
    });
    return response.data.data || response.data;
  },

  // Xóa sản phẩm khỏi giỏ
  removeItem: async (itemId: string): Promise<Cart> => {
    const response = await apiClient.delete(`/api/v1/cart/items/${itemId}`);
    return response.data.data || response.data;
  },

  // Xóa toàn bộ giỏ hàng
  clear: async (): Promise<void> => {
    await apiClient.delete('/api/v1/cart');
  },
};

// ==================== ORDERS API ====================
export const ordersApi = {
  // Tạo đơn hàng mới (backend tự động lấy items từ cart)
  create: async (orderData: {
    addressId: number;
    paymentMethodId: number;
    shippingMethodId: number;
    discountId?: number;
    notes?: string;
  }): Promise<Order> => {
    const response = await apiClient.post('/api/v1/orders', orderData);
    return response.data.data || response.data;
  },

  // Lấy danh sách đơn hàng của user
  getMyOrders: async (params?: PaginationParams): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get('/api/v1/orders/my-orders', { params });
    const result = response.data.data || response.data;
    return {
      data: result.data || result,
      pagination: result.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }
    };
  },

  // Lấy chi tiết đơn hàng
  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get(`/api/v1/orders/${id}`);
    return response.data.data || response.data;
  },

  // Hủy đơn hàng (backend chưa có endpoint này, có thể thêm sau)
  cancel: async (id: string, reason?: string): Promise<Order> => {
    const response = await apiClient.post(`/api/v1/orders/${id}/cancel`, { reason });
    return response.data.data || response.data;
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

  // Đăng nhập bằng Google
  loginWithGoogle: async (credential: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/v1/auth/google', { credential });
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
    const response = await apiClient.get('/api/v1/auth/profile');
    return response.data.data || response.data;
  },

  // Refresh access token
  refreshToken: async (refreshToken: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/v1/auth/refresh', { refreshToken });
    const data = response.data.data || response.data;
    if (data.accessToken) {
      localStorage.setItem('token', data.accessToken);
    }
    return data;
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

// ==================== ADDRESSES API ====================
export const addressesApi = {
  // Lấy danh sách địa chỉ của user
  getAll: async (): Promise<Address[]> => {
    const response = await apiClient.get('/api/v1/users/addresses');
    return response.data.data || response.data;
  },

  // Lấy chi tiết địa chỉ
  getById: async (id: number): Promise<Address> => {
    const response = await apiClient.get(`/api/v1/users/addresses/${id}`);
    return response.data.data || response.data;
  },

  // Tạo địa chỉ mới
  create: async (addressData: {
    recipientName: string;
    phone: string;
    address: string;
    city: string;
    district: string;
    ward: string;
    isDefault?: boolean;
  }): Promise<Address> => {
    const response = await apiClient.post('/api/v1/users/addresses', addressData);
    return response.data.data || response.data;
  },

  // Cập nhật địa chỉ
  update: async (id: number, addressData: Partial<Address>): Promise<Address> => {
    const response = await apiClient.put(`/api/v1/users/addresses/${id}`, addressData);
    return response.data.data || response.data;
  },

  // Xóa địa chỉ
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/users/addresses/${id}`);
  },

  // Đặt địa chỉ mặc định
  setDefault: async (id: number): Promise<Address> => {
    const response = await apiClient.put(`/api/v1/users/addresses/${id}`, { isDefault: true });
    return response.data.data || response.data;
  },
};

// ==================== REVIEWS API ====================
export const reviewsApi = {
  // Lấy danh sách review của user
  getMyReviews: async (): Promise<Review[]> => {
    const response = await apiClient.get('/api/v1/users/reviews');
    return response.data.data || response.data;
  },

  // Lấy reviews của một sản phẩm
  getByProduct: async (productId: string, params?: PaginationParams): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get(`/api/v1/products/${productId}/reviews`, { params });
    const result = response.data.data || response.data;
    return {
      data: result.data || result,
      pagination: result.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }
    };
  },

  // Tạo review cho sản phẩm
  create: async (reviewData: {
    productItemId: number;
    rating: number;
    comment?: string;
  }): Promise<Review> => {
    const response = await apiClient.post('/api/v1/users/reviews', reviewData);
    return response.data.data || response.data;
  },

  // Cập nhật review
  update: async (id: number, reviewData: { rating: number; comment?: string }): Promise<Review> => {
    const response = await apiClient.put(`/api/v1/users/reviews/${id}`, reviewData);
    return response.data.data || response.data;
  },

  // Xóa review
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/users/reviews/${id}`);
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
  addresses: addressesApi,
  reviews: reviewsApi,
  client: apiClient, // Export axios instance để sử dụng trực tiếp nếu cần
};

export default api;
