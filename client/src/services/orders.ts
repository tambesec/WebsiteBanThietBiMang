/**
 * Orders API Service
 */

import { apiClient } from './client';
import { unwrapResponse } from './utils';
import { Order, PaginatedResponse, PaginationParams } from './types';

export const ordersApi = {
  /**
   * Tạo đơn hàng mới từ giỏ hàng
   */
  create: async (orderData: {
    addressId: number;
    paymentMethodId: number;
    shippingMethodId: number;
    discountId?: number;
    notes?: string;
  }): Promise<Order> => {
    const response = await apiClient.post('/api/v1/orders', orderData);
    return unwrapResponse<Order>(response);
  },

  /**
   * Lấy danh sách đơn hàng của user
   */
  getMyOrders: async (params?: PaginationParams): Promise<PaginatedResponse<Order>> => {
    const response = await apiClient.get('/api/v1/orders/my-orders', { params });
    const result = unwrapResponse<any>(response);
    return {
      data: result.data || result,
      pagination: result.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }
    };
  },

  /**
   * Lấy chi tiết đơn hàng
   */
  getById: async (id: string): Promise<Order> => {
    const response = await apiClient.get(`/api/v1/orders/${id}`);
    return unwrapResponse<Order>(response);
  },

  /**
   * Hủy đơn hàng
   */
  cancel: async (id: string, reason?: string): Promise<Order> => {
    const response = await apiClient.post(`/api/v1/orders/${id}/cancel`, { reason });
    return unwrapResponse<Order>(response);
  },
};

export default ordersApi;
