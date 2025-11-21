/**
 * Export all Admin API services
 * Sử dụng: import { adminProductsApi, adminAuthApi } from '@/services';
 */

export { apiClient } from './client';
export * from './types';
export * from './utils';

export { adminAuthApi } from './auth';
export { adminProductsApi } from './products';
export { adminCategoriesApi } from './categories';
export { adminBrandsApi } from './brands';
export { adminOrdersApi } from './orders';
export { adminUsersApi } from './users';
export { adminDashboardApi } from './dashboard';
export { adminUploadApi } from './upload';
export { reviewsApi } from './reviews';

// Export default object để tương thích với code cũ
import adminAuthApi from './auth';
import adminProductsApi from './products';
import adminCategoriesApi from './categories';
import adminBrandsApi from './brands';
import adminOrdersApi from './orders';
import adminUsersApi from './users';
import adminDashboardApi from './dashboard';
import adminUploadApi from './upload';
import reviewsApi from './reviews';
import { apiClient } from './client';

const api = {
  auth: adminAuthApi,
  products: adminProductsApi,
  categories: adminCategoriesApi,
  brands: adminBrandsApi,
  orders: adminOrdersApi,
  users: adminUsersApi,
  dashboard: adminDashboardApi,
  upload: adminUploadApi,
  reviews: reviewsApi,
  client: apiClient,
};

export default api;
