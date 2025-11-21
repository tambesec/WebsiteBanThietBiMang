/**
 * Products API Service
 */

import { apiClient } from './client';
import { unwrapResponse } from './utils';
import { Product, PaginatedResponse, PaginationParams } from './types';

export const productsApi = {
  /**
   * Lấy danh sách sản phẩm với pagination và filters
   */
  getAll: async (params?: PaginationParams & { 
    category?: string; 
    brand?: string; 
    minPrice?: number; 
    maxPrice?: number;
  }): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get('/api/v1/products', { params });
    const result = unwrapResponse<any>(response);
    return {
      data: result.data || result,
      pagination: result.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }
    };
  },

  /**
   * Lấy chi tiết sản phẩm theo ID
   */
  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/api/v1/products/${id}`);
    return unwrapResponse<Product>(response);
  },

  /**
   * Lấy sản phẩm theo slug (SEO-friendly URL)
   */
  getBySlug: async (slug: string): Promise<Product> => {
    const response = await apiClient.get(`/api/v1/products/slug/${slug}`);
    return unwrapResponse<Product>(response);
  },

  /**
   * Lấy sản phẩm liên quan (dựa trên category)
   */
  getRelated: async (id: string, limit: number = 4): Promise<Product[]> => {
    const product = await productsApi.getById(id);
    const response = await apiClient.get('/api/v1/products', { 
      params: { category: product.category, limit, page: 1 } 
    });
    const result = unwrapResponse<any>(response);
    const products = (result.data || result) as Product[];
    return products.filter(p => p.id !== id).slice(0, limit);
  },

  /**
   * Tìm kiếm sản phẩm
   */
  search: async (query: string, params?: PaginationParams): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get('/api/v1/products', { 
      params: { ...params, search: query } 
    });
    const result = unwrapResponse<any>(response);
    return {
      data: result.data || result,
      pagination: result.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }
    };
  },
};

export default productsApi;
