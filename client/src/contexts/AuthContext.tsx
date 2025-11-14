'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User, AuthResponse } from '@/services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (userData: {
    username: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          // Verify token and get user info
          const userData = await authApi.getMe();
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        // Token invalid, clear storage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Validate input
      if (!email || !email.trim()) {
        throw new Error('Email không được để trống');
      }
      if (!password || !password.trim()) {
        throw new Error('Mật khẩu không được để trống');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error('Email không hợp lệ');
      }

      const response: AuthResponse = await authApi.login(email.trim(), password);
      
      if (!response || !response.accessToken) {
        throw new Error('Phản hồi không hợp lệ từ máy chủ');
      }

      // Save token and user to localStorage
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('user', JSON.stringify({
        id: response.id,
        email: response.email,
        username: response.username,
      }));

      // Set user state
      setUser({
        id: response.id.toString(),
        email: response.email,
        username: response.username,
        firstName: '',
        lastName: '',
        phone: '',
        avatar: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      // Clear any stale data on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      
      // Re-throw with user-friendly message
      if (error.response) {
        const message = error.response.data?.message || error.response.data?.error;
        if (Array.isArray(message)) {
          throw new Error(message.join(', '));
        }
        throw new Error(message || 'Đăng nhập thất bại');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    username: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    setIsLoading(true);
    try {
      // Validate input
      if (!userData.username || userData.username.trim().length < 3) {
        throw new Error('Tên đăng nhập phải có ít nhất 3 ký tự');
      }
      if (!userData.email || !userData.email.trim()) {
        throw new Error('Email không được để trống');
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
        throw new Error('Email không hợp lệ');
      }
      if (!userData.password || userData.password.length < 12) {
        throw new Error('Mật khẩu phải có ít nhất 12 ký tự');
      }
      if (!/[A-Z]/.test(userData.password)) {
        throw new Error('Mật khẩu phải có ít nhất 1 chữ hoa');
      }
      if (!/[a-z]/.test(userData.password)) {
        throw new Error('Mật khẩu phải có ít nhất 1 chữ thường');
      }
      if (!/[0-9]/.test(userData.password)) {
        throw new Error('Mật khẩu phải có ít nhất 1 chữ số');
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(userData.password)) {
        throw new Error('Mật khẩu phải có ít nhất 1 ký tự đặc biệt');
      }

      const cleanedData = {
        username: userData.username.trim(),
        email: userData.email.trim(),
        password: userData.password,
        phone: userData.phone?.trim(),
      };

      const response: AuthResponse = await authApi.register(cleanedData);
      
      if (!response || !response.accessToken) {
        throw new Error('Phản hồi không hợp lệ từ máy chủ');
      }

      // Save token and user to localStorage
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('user', JSON.stringify({
        id: response.id,
        email: response.email,
        username: response.username,
      }));

      // Set user state
      setUser({
        id: response.id.toString(),
        email: response.email,
        username: response.username,
        firstName: '',
        lastName: '',
        phone: userData.phone || '',
        avatar: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error: any) {
      // Clear any stale data on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      
      // Re-throw with user-friendly message
      if (error.response) {
        const message = error.response.data?.message || error.response.data?.error;
        if (Array.isArray(message)) {
          throw new Error(message.join(', '));
        }
        throw new Error(message || 'Đăng ký thất bại');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Try to logout from server, but continue even if it fails
      try {
        await authApi.logout();
      } catch (error) {
        console.warn('Logout API call failed, continuing with local cleanup:', error);
      }
    } finally {
      // Always clear local data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      setUser(null);
      setIsLoading(false);
      
      // Redirect to signin
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      }
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      const updatedUser = await authApi.updateProfile(userData);
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  const loginWithGoogle = async (credential: string) => {
    setIsLoading(true);
    try {
      const response: AuthResponse = await authApi.loginWithGoogle(credential);
      
      if (!response || !response.accessToken) {
        throw new Error('Phản hồi không hợp lệ từ máy chủ');
      }

      // Save token and user to localStorage
      localStorage.setItem('token', response.accessToken);
      localStorage.setItem('user', JSON.stringify({
        id: response.id,
        email: response.email,
        username: response.username,
      }));

      // Get full user info from server
      const userData = await authApi.getMe();
      setUser(userData);
      
    } catch (error: any) {
      // Clear any stale data on error
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      
      // Re-throw with user-friendly message
      if (error.response) {
        const message = error.response.data?.message || error.response.data?.error;
        throw new Error(message || 'Đăng nhập Google thất bại');
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    loginWithGoogle,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
