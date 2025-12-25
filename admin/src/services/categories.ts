/**
 * Admin Categories API Service
 */

import { apiClient } from './client';
import { unwrapResponse } from './utils';
import { Category, PaginatedResponse, PaginationParams } from './types';

export const adminCategoriesApi = {
  /**
   * Lấy danh sách danh mục
   */
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Category>> => {
    const response = await apiClient.get('/admin/categories', { params });
    return unwrapResponse<PaginatedResponse<Category>>(response);
  },

  /**
   * Lấy chi tiết danh mục
   */
  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get(`/api/v1/admin/categories/${id}`);
    return unwrapResponse<Category>(response);
  },

  /**
   * Tạo danh mục mới
   */
  create: async (categoryData: Partial<Category>): Promise<Category> => {
    const response = await apiClient.post('/admin/categories', categoryData);
    return unwrapResponse<Category>(response);
  },

  /**
   * Cập nhật danh mục
   */
  update: async (id: string, categoryData: Partial<Category>): Promise<Category> => {
    const response = await apiClient.put(`/api/v1/admin/categories/${id}`, categoryData);
    return unwrapResponse<Category>(response);
  },

  /**
   * Xóa danh mục
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/categories/${id}`);
  },

  /**
   * Sắp xếp lại thứ tự danh mục
   */
  reorder: async (categories: { id: string; order: number }[]): Promise<void> => {
    await apiClient.post('/admin/categories/reorder', { categories });
  },

  /**
   * Toggle trạng thái active
   */
  toggleActive: async (id: string): Promise<Category> => {
    const response = await apiClient.patch(`/api/v1/admin/categories/${id}/toggle-active`);
    return unwrapResponse<Category>(response);
  },
};

export default adminCategoriesApi;
