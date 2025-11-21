/**
 * Cart API Service
 */

import { apiClient } from './client';
import { unwrapResponse } from './utils';
import { Cart } from './types';

export const cartApi = {
  /**
   * Lấy giỏ hàng hiện tại
   */
  get: async (): Promise<Cart> => {
    const response = await apiClient.get('/api/v1/cart');
    return unwrapResponse<Cart>(response);
  },

  /**
   * Thêm sản phẩm vào giỏ hàng
   * @param productItemId - ID của product item (variant) cần thêm
   * @param quantity - Số lượng sản phẩm
   */
  addItem: async (productItemId: number, quantity: number = 1): Promise<Cart> => {
    const response = await apiClient.post('/api/v1/cart/items', { 
      productItemId, 
      quantity 
    });
    return unwrapResponse<Cart>(response);
  },

  /**
   * Cập nhật số lượng sản phẩm trong giỏ
   */
  updateItem: async (itemId: string, quantity: number): Promise<Cart> => {
    const response = await apiClient.put(`/api/v1/cart/items/${itemId}`, { 
      quantity 
    });
    return unwrapResponse<Cart>(response);
  },

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   */
  removeItem: async (itemId: string): Promise<Cart> => {
    const response = await apiClient.delete(`/api/v1/cart/items/${itemId}`);
    return unwrapResponse<Cart>(response);
  },

  /**
   * Xóa toàn bộ giỏ hàng
   */
  clear: async (): Promise<void> => {
    await apiClient.delete('/api/v1/cart');
  },
};

export default cartApi;
