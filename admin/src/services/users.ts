/**
 * Admin Users API Service
 */

import { apiClient } from './client';
import { unwrapResponse } from './utils';
import { User, PaginatedResponse, PaginationParams } from './types';

export const adminUsersApi = {
  /**
   * Lấy danh sách users
   */
  getAll: async (params?: PaginationParams & { 
    role?: string;
    isActive?: boolean;
  }): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get('/api/v1/admin/users', { params });
    return unwrapResponse<PaginatedResponse<User>>(response);
  },

  /**
   * Lấy chi tiết user
   */
  getById: async (id: string): Promise<User> => {
    const response = await apiClient.get(`/api/v1/admin/users/${id}`);
    return unwrapResponse<User>(response);
  },

  /**
   * Tạo user mới
   */
  create: async (userData: Partial<User> & { password: string }): Promise<User> => {
    const response = await apiClient.post('/api/v1/admin/users', userData);
    return unwrapResponse<User>(response);
  },

  /**
   * Cập nhật user
   */
  update: async (id: string, userData: Partial<User>): Promise<User> => {
    const response = await apiClient.put(`/api/v1/admin/users/${id}`, userData);
    return unwrapResponse<User>(response);
  },

  /**
   * Xóa user
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/users/${id}`);
  },

  /**
   * Toggle trạng thái active
   */
  toggleActive: async (id: string): Promise<User> => {
    const response = await apiClient.put(`/api/v1/admin/users/${id}/toggle-status`);
    return unwrapResponse<User>(response);
  },

  /**
   * Đổi mật khẩu user
   */
  changePassword: async (id: string, newPassword: string): Promise<void> => {
    await apiClient.post(`/api/v1/admin/users/${id}/change-password`, { newPassword });
  },

  /**
   * Reset mật khẩu user
   */
  resetPassword: async (id: string): Promise<{ temporaryPassword: string }> => {
    const response = await apiClient.post(`/api/v1/admin/users/${id}/reset-password`);
    return unwrapResponse<{ temporaryPassword: string }>(response);
  },
};

export default adminUsersApi;
