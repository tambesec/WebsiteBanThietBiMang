/**
 * Admin Authentication API Service
 * Sử dụng chung API auth với client, admin chỉ là role khác
 */

import { apiClient } from './client';
import { unwrapResponse } from './utils';
import { User, AdminAuthResponse } from './types';

export const adminAuthApi = {
  /**
   * Đăng nhập admin (sử dụng chung endpoint với client)
   * Backend sẽ trả về user với role='admin'
   */
  login: async (email: string, password: string): Promise<AdminAuthResponse> => {
    const response = await apiClient.post('/api/v1/auth/login', { email, password });
    const data = unwrapResponse<AdminAuthResponse>(response);
    
    // Kiểm tra role admin
    if (data.user && data.user.role !== 'admin') {
      throw new Error('Access denied. Admin role required.');
    }
    
    // Lưu tokens
    if (data.access_token) {
      localStorage.setItem('admin_token', data.access_token);
    }
    if (data.refresh_token) {
      localStorage.setItem('admin_refresh_token', data.refresh_token);
    }
    if (data.user) {
      localStorage.setItem('admin_user', JSON.stringify(data.user));
    }
    
    return data;
  },

  /**
   * Đăng xuất admin
   */
  logout: async (): Promise<void> => {
    const refreshToken = localStorage.getItem('admin_refresh_token');
    if (refreshToken) {
      try {
        await apiClient.post('/api/v1/auth/logout', { refresh_token: refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_refresh_token');
    localStorage.removeItem('admin_user');
  },

  /**
   * Lấy thông tin admin hiện tại
   */
  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/api/v1/auth/profile');
    return unwrapResponse<User>(response);
  },

  /**
   * Đổi mật khẩu admin
   */
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/api/v1/auth/change-password', { 
      current_password: currentPassword, 
      new_password: newPassword 
    });
  },

  /**
   * Refresh access token
   */
  refreshToken: async (refreshToken: string): Promise<AdminAuthResponse> => {
    const response = await apiClient.post('/api/v1/auth/refresh', { refresh_token: refreshToken });
    const data = unwrapResponse<AdminAuthResponse>(response);
    if (data.access_token) {
      localStorage.setItem('admin_token', data.access_token);
    }
    return data;
  },
};

export default adminAuthApi;
