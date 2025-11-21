/**
 * Reviews API Service
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
    avatar?: string;
  };
  product?: {
    id: number;
    name: string;
    slug: string;
  };
}

export interface CreateReviewDto {
  productId: number;
  rating: number;
  comment: string;
}

export const reviewsApi = {
  /**
   * Tạo review mới cho sản phẩm
   */
  create: async (reviewData: CreateReviewDto): Promise<Review> => {
    const response = await apiClient.post('/api/v1/users/reviews', reviewData);
    return unwrapResponse<Review>(response);
  },

  /**
   * Lấy danh sách reviews của user hiện tại
   */
  getMyReviews: async (params?: PaginationParams): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get('/api/v1/users/reviews', { params });
    const result = unwrapResponse<any>(response);
    return {
      data: result.data || result,
      pagination: result.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }
    };
  },

  /**
   * Lấy reviews của một sản phẩm (public)
   */
  getProductReviews: async (
    productId: number,
    params?: PaginationParams
  ): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get(`/api/v1/products/${productId}/reviews`, { params });
    const result = unwrapResponse<any>(response);
    return {
      data: result.data || result,
      pagination: result.meta || { total: 0, page: 1, limit: 10, totalPages: 1 }
    };
  },

  /**
   * Cập nhật review
   */
  update: async (id: number, reviewData: Partial<CreateReviewDto>): Promise<Review> => {
    const response = await apiClient.put(`/api/v1/users/reviews/${id}`, reviewData);
    return unwrapResponse<Review>(response);
  },

  /**
   * Xóa review
   */
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/v1/users/reviews/${id}`);
  },
};

export default reviewsApi;
