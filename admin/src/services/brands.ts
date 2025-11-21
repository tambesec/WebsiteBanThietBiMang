/**
 * Admin Brands API Service
 */

import { apiClient } from './client';
import { unwrapResponse } from './utils';
import { Brand, PaginatedResponse, PaginationParams } from './types';

export const adminBrandsApi = {
  /**
   * Lấy danh sách thương hiệu
   */
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Brand>> => {
    const response = await apiClient.get('/api/v1/admin/brands', { params });
    return unwrapResponse<PaginatedResponse<Brand>>(response);
  },

  /**
   * Lấy chi tiết thương hiệu
   */
  getById: async (id: string): Promise<Brand> => {
    const response = await apiClient.get(`/api/v1/admin/brands/${id}`);
    return unwrapResponse<Brand>(response);
  },

  /**
   * Tạo thương hiệu mới
   */
  create: async (brandData: Partial<Brand>): Promise<Brand> => {
    const response = await apiClient.post('/api/v1/admin/brands', brandData);
    return unwrapResponse<Brand>(response);
  },

  /**
   * Cập nhật thương hiệu
   */
  update: async (id: string, brandData: Partial<Brand>): Promise<Brand> => {
    const response = await apiClient.put(`/api/v1/admin/brands/${id}`, brandData);
    return unwrapResponse<Brand>(response);
  },

  /**
   * Xóa thương hiệu
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/brands/${id}`);
  },

  /**
   * Toggle trạng thái active
   */
  toggleActive: async (id: string): Promise<Brand> => {
    const response = await apiClient.patch(`/api/v1/admin/brands/${id}/toggle-active`);
    return unwrapResponse<Brand>(response);
  },
};

export default adminBrandsApi;
