/**
 * Admin Authentication API Service
 */

import { apiClient } from './client';
import { unwrapResponse } from './utils';
import { User, AdminAuthResponse } from './types';

export const adminAuthApi = {
  /**
   * Đăng nhập admin
   */
  login: async (email: string, password: string): Promise<AdminAuthResponse> => {
    const response = await apiClient.post('/api/v1/admin/auth/login', { email, password });
    return unwrapResponse<AdminAuthResponse>(response);
  },

  /**
   * Đăng xuất admin
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/api/v1/admin/auth/logout');
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  },

  /**
   * Lấy thông tin admin hiện tại
   */
  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/api/v1/admin/auth/me');
    return unwrapResponse<User>(response);
  },

  /**
   * Đổi mật khẩu admin
   */
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/api/v1/admin/auth/change-password', { 
      oldPassword, 
      newPassword 
    });
  },
};

export default adminAuthApi;
