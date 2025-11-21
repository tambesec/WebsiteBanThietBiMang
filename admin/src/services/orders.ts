/**
 * Admin Orders API Service
 */

import { apiClient } from './client';
import { unwrapResponse } from './utils';
import { Order, PaginatedResponse, PaginationParams } from './types';

export const adminOrdersApi = {
  /**
   * Lấy danh sách đơn hàng
   */
  getAll: async (params?: PaginationParams & { 
    status?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get('/api/v1/admin/orders', { params });
    return unwrapResponse<PaginatedResponse<Order>>(response);
  },

  /**
   * Lấy chi tiết đơn hàng
   */
  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get(`/api/v1/admin/orders/${id}`);
    return unwrapResponse<Order>(response);
  },

  /**
   * Cập nhật trạng thái đơn hàng
   */
  updateStatus: async (id: string, status: string): Promise<Order> => {
    const response = await apiClient.patch(`/api/v1/admin/orders/${id}/status`, { status });
    return unwrapResponse<Order>(response);
  },

  /**
   * Cập nhật thông tin đơn hàng
   */
  update: async (id: string, orderData: Partial<Order>): Promise<Order> => {
    const response = await apiClient.put(`/api/v1/admin/orders/${id}`, orderData);
    return unwrapResponse<Order>(response);
  },

  /**
   * Xóa đơn hàng
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/orders/${id}`);
  },

  /**
   * Hủy đơn hàng
   */
  cancel: async (id: string, reason?: string): Promise<Order> => {
    const response = await apiClient.post(`/api/v1/admin/orders/${id}/cancel`, { reason });
    return unwrapResponse<Order>(response);
  },

  /**
   * Xác nhận đơn hàng
   */
  confirm: async (id: string): Promise<Order> => {
    const response = await apiClient.post(`/api/v1/admin/orders/${id}/confirm`);
    return unwrapResponse<Order>(response);
  },

  /**
   * Export đơn hàng ra Excel
   */
  export: async (params?: { 
    startDate?: string; 
    endDate?: string;
    status?: string;
  }): Promise<Blob> => {
    const response = await apiClient.get('/api/v1/admin/orders/export', { 
      params,
      responseType: 'blob',
    });
    return response.data;
  },
};

export default adminOrdersApi;
