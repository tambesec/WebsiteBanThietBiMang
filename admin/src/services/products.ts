/**
 * Admin Products API Service
 */

import { apiClient } from './client';
import { unwrapResponse } from './utils';
import { Product, PaginatedResponse, PaginationParams } from './types';

export const adminProductsApi = {
  /**
   * Lấy danh sách sản phẩm (admin)
   */
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get('/api/v1/admin/products', { params });
    return unwrapResponse<PaginatedResponse<Product>>(response);
  },

  /**
   * Lấy chi tiết sản phẩm
   */
  getById: async (id: string): Promise<Product> => {
    const response = await apiClient.get(`/api/v1/admin/products/${id}`);
    return unwrapResponse<Product>(response);
  },

  /**
   * Tạo sản phẩm mới
   */
  create: async (productData: Partial<Product>): Promise<Product> => {
    const response = await apiClient.post('/api/v1/admin/products', productData);
    return unwrapResponse<Product>(response);
  },

  /**
   * Cập nhật sản phẩm
   */
  update: async (id: string, productData: Partial<Product>): Promise<Product> => {
    const response = await apiClient.put(`/api/v1/admin/products/${id}`, productData);
    return unwrapResponse<Product>(response);
  },

  /**
   * Xóa sản phẩm
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/products/${id}`);
  },

  /**
   * Xóa nhiều sản phẩm
   */
  bulkDelete: async (ids: string[]): Promise<void> => {
    await apiClient.post('/api/v1/admin/products/bulk-delete', { ids });
  },

  /**
   * Cập nhật tồn kho
   */
  updateStock: async (id: string, stock: number): Promise<Product> => {
    const response = await apiClient.patch(`/api/v1/admin/products/${id}/stock`, { stock });
    return unwrapResponse<Product>(response);
  },

  /**
   * Toggle trạng thái active
   */
  toggleActive: async (id: string): Promise<Product> => {
    const response = await apiClient.patch(`/api/v1/admin/products/${id}/toggle-active`);
    return unwrapResponse<Product>(response);
  },

  /**
   * Toggle trạng thái featured
   */
  toggleFeatured: async (id: string): Promise<Product> => {
    const response = await apiClient.patch(`/api/v1/admin/products/${id}/toggle-featured`);
    return unwrapResponse<Product>(response);
  },

  /**
   * Upload ảnh sản phẩm
   */
  uploadImages: async (id: string, files: File[]): Promise<string[]> => {
    const formData = new FormData();
    files.forEach(file => formData.append('images', file));
    
    const response = await apiClient.post(`/api/v1/admin/products/${id}/images`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrapResponse<string[]>(response);
  },

  /**
   * Tạo product item (variant)
   */
  createProductItem: async (productData: {
    productId: number;
    sku?: string;
    color?: string;
    size?: string;
    price: number;
    salePrice?: number;
    stock: number;
  }): Promise<any> => {
    const response = await apiClient.post('/api/v1/products/items', productData);
    return unwrapResponse<any>(response);
  },
};

export default adminProductsApi;
