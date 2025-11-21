/**
 * Categories API Service
 */

import { apiClient } from './client';
import { unwrapResponse } from './utils';
import { Category, Product, PaginatedResponse } from './types';

export const categoriesApi = {
  /**
   * Lấy tất cả danh mục
   */
  getAll: async (): Promise<Category[]> => {
    const response = await apiClient.get('/api/v1/categories');
    return unwrapResponse<Category[]>(response);
  },

  /**
   * Lấy chi tiết danh mục theo ID
   */
  getById: async (id: string): Promise<Category> => {
    const response = await apiClient.get(`/api/v1/categories/${id}`);
    return unwrapResponse<Category>(response);
  },

  /**
   * Lấy cây danh mục (category tree với parent-child relationship)
   */
  getTree: async (): Promise<Category[]> => {
    const response = await apiClient.get('/api/v1/categories/tree');
    return unwrapResponse<Category[]>(response);
  },

  /**
   * Lấy sản phẩm theo category
   */
  getProducts: async (categoryId: string, params?: { 
    page?: number; 
    limit?: number; 
    sortBy?: string; 
    sortOrder?: 'asc' | 'desc';
  }): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get('/api/v1/products', { 
      params: { ...params, categoryId } 
    });
    const result = unwrapResponse<any>(response);
    return {
      data: result.data || result,
      pagination: result.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }
    };
  },
};

export default categoriesApi;
