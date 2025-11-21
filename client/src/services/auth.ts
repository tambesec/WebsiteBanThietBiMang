/**
 * Authentication API Service
 */

import { apiClient } from './client';
import { unwrapResponse } from './utils';
import { User, AuthResponse } from './types';

export const authApi = {
  /**
   * Đăng ký tài khoản mới
   */
  register: async (userData: {
    username: string;
    email: string;
    password: string;
    phone?: string;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/v1/auth/register', userData);
    return unwrapResponse<AuthResponse>(response);
  },

  /**
   * Đăng nhập
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/v1/auth/login', { email, password });
    return unwrapResponse<AuthResponse>(response);
  },

  /**
   * Đăng nhập bằng Google
   */
  loginWithGoogle: async (credential: string): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/v1/auth/google', { credential });
    return unwrapResponse<AuthResponse>(response);
  },

  /**
   * Đăng xuất
   */
  logout: async (): Promise<void> => {
    await apiClient.post('/api/v1/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Lấy thông tin user hiện tại
   */
  getMe: async (): Promise<User> => {
    const response = await apiClient.get('/api/v1/auth/profile');
    return unwrapResponse<User>(response);
  },

  /**
   * Cập nhật thông tin user
   */
  updateProfile: async (userData: Partial<User>): Promise<User> => {
    const response = await apiClient.put('/api/v1/users/profile', userData);
    const data = unwrapResponse<User>(response);
    
    // Cập nhật localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    localStorage.setItem('user', JSON.stringify({ ...user, ...data }));
    
    return data;
  },

  /**
   * Đổi mật khẩu
   */
  changePassword: async (oldPassword: string, newPassword: string): Promise<void> => {
    await apiClient.post('/api/v1/auth/change-password', { 
      oldPassword, 
      password: newPassword 
    });
  },

  /**
   * Quên mật khẩu - gửi email reset
   */
  forgotPassword: async (email: string): Promise<void> => {
    await apiClient.post('/api/v1/auth/forgot-password', { email });
  },

  /**
   * Reset mật khẩu với token
   */
  resetPassword: async (token: string, newPassword: string): Promise<void> => {
    await apiClient.post('/api/v1/auth/reset-password', { token, newPassword });
  },

  /**
   * Làm mới access token
   */
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/v1/auth/refresh');
    const result = unwrapResponse<AuthResponse>(response);
    if (result.accessToken) {
      localStorage.setItem('token', result.accessToken);
    }
    return result;
  },
};

export default authApi;
