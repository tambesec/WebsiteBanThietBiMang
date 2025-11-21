/**
 * Brands API Service
 */

import { apiClient } from './client';
import { unwrapResponse } from './utils';
import { Brand, Product, PaginatedResponse } from './types';

export const brandsApi = {
  /**
   * Lấy tất cả thương hiệu
   */
  getAll: async (): Promise<Brand[]> => {
    const response = await apiClient.get('/api/v1/brands');
    return unwrapResponse<Brand[]>(response);
  },

  /**
   * Lấy chi tiết thương hiệu theo tên
   */
  getByName: async (name: string): Promise<Brand> => {
    const response = await apiClient.get(`/api/v1/brands/${name}`);
    return unwrapResponse<Brand>(response);
  },

  /**
   * Lấy sản phẩm theo brand
   */
  getProducts: async (brand: string, params?: { 
    page?: number; 
    limit?: number; 
    sortBy?: string; 
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get('/api/v1/products', { 
      params: { ...params, brand } 
    });
    const result = unwrapResponse<any>(response);
    return {
      data: result.data || result,
      pagination: result.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }
    };
  },
};

export default brandsApi;
