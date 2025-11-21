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

  /**
   * Cập nhật thông tin profile admin
   */
  updateProfile: async (profileData: {
    firstName?: string;
    lastName?: string;
    phone?: string;
    avatar?: string;
  }): Promise<User> => {
    const response = await apiClient.put('/api/v1/admin/auth/profile', profileData);
    const data = unwrapResponse<User>(response);
    // Cập nhật localStorage
    const adminUser = JSON.parse(localStorage.getItem('admin_user') || '{}');
    localStorage.setItem('admin_user', JSON.stringify({ ...adminUser, ...data }));
    return data;
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<AdminAuthResponse> => {
    const response = await apiClient.post('/api/v1/admin/auth/refresh', { refreshToken });
    const data = unwrapResponse<AdminAuthResponse>(response);
    if (data.accessToken) {
      localStorage.setItem('admin_token', data.accessToken);
    }
    return data;
  },
};

export default adminAuthApi;
