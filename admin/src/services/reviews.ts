/**
 * Reviews Management API Service (Admin)
 */

import { apiClient } from './client';
import { unwrapResponse } from './utils';
import { PaginatedResponse, PaginationParams } from './types';

export interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  comment: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    username: string;
    email: string;
    avatar?: string;
  };
  product?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface UpdateReviewStatusDto {
  isApproved: boolean;
}

export const reviewsApi = {
  /**
   * Lấy danh sách tất cả reviews (Admin)
   */
  getAll: async (params?: PaginationParams & { productId?: number; isApproved?: boolean }): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get('/api/v1/admin/reviews', { params });
    const result = unwrapResponse<any>(response);
    return {
      data: result.data || result,
      pagination: result.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }
    };
  },

  /**
   * Lấy review theo ID
   */
  getById: async (id: number): Promise<Review> => {
    const response = await apiClient.get(`/api/v1/admin/reviews/${id}`);
    return unwrapResponse<Review>(response);
  },

  /**
   * Cập nhật trạng thái phê duyệt review
   */
  updateStatus: async (id: number, statusData: UpdateReviewStatusDto): Promise<Review> => {
    const response = await apiClient.put(`/api/v1/admin/reviews/${id}/status`, statusData);
    return unwrapResponse<Review>(response);
  },

  /**
   * Phê duyệt review
   */
  approve: async (id: number): Promise<Review> => {
    return reviewsApi.updateStatus(id, { isApproved: true });
  },

  /**
   * Từ chối review
   */
  reject: async (id: number): Promise<Review> => {
    return reviewsApi.updateStatus(id, { isApproved: false });
  },

  /**
   * Xóa review
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/reviews/${id}`);
  },
};

export default reviewsApi;
