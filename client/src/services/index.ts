/**
 * Export all API services
 * Sử dụng: import { productsApi, authApi } from '@/services';
 */

export { apiClient } from './client';
export * from './types';
export * from './utils';

export { productsApi } from './products';
export { categoriesApi } from './categories';
export { brandsApi } from './brands';
export { cartApi } from './cart';
export { ordersApi } from './orders';
export { authApi } from './auth';
export { addressesApi } from './addresses';
export { reviewsApi } from './reviews';

// Export default object để tương thích với code cũ
import productsApi from './products';
import categoriesApi from './categories';
import brandsApi from './brands';
import cartApi from './cart';
import ordersApi from './orders';
import authApi from './auth';
import { apiClient } from './client';

const api = {
  products: productsApi,
  categories: categoriesApi,
  brands: brandsApi,
  cart: cartApi,
  orders: ordersApi,
  auth: authApi,
  client: apiClient,
};

export default api;
