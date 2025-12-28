'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, axiosInstance } from '@/lib/api-client';
import type { LoginDto, RegisterDto } from '@/lib/api-client';

// Re-define User type locally
interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string;
  role?: string;
  isOAuthUser?: boolean;
  hasPassword?: boolean;
  oauthProviders?: string[];
  emailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  register: (userData: {
    firstName: string;
    lastName?: string;
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

  /**
   * Load auth session on mount
   * Uses /auth/session endpoint which NEVER returns 401
   * Returns { authenticated: false } for guest or { authenticated: true, user } for logged-in user
   */
  useEffect(() => {
    const loadSession = async () => {
      try {
        // Call /auth/session - NEVER throws 401
        const response = await axiosInstance.get('/auth/session');
        const sessionData = response.data?.data || response.data;
        
        if (sessionData.authenticated && sessionData.user) {
          // SECURITY: Only allow 'customer' role on client app
          if (sessionData.user.role === 'admin') {
            setUser(null);
            // Clear admin cookies silently
            await axiosInstance.post('/auth/logout').catch(() => {});
            return;
          }
          
          setUser({
            id: sessionData.user.id.toString(),
            email: sessionData.user.email,
            username: sessionData.user.full_name || sessionData.user.email,
            firstName: sessionData.user.full_name?.split(' ')[0] || '',
            lastName: sessionData.user.full_name?.split(' ').slice(1).join(' ') || '',
            phone: sessionData.user.phone || '',
            avatar: '',
            role: sessionData.user.role,
            isOAuthUser: sessionData.user.is_oauth_user || false,
            hasPassword: sessionData.user.has_password || false,
            oauthProviders: sessionData.user.oauth_providers || [],
            emailVerified: sessionData.user.email_verified || false,
            createdAt: sessionData.user.created_at || new Date().toISOString(),
            updatedAt: sessionData.user.updated_at || new Date().toISOString(),
          });
        } else {
          setUser(null);
        }
      } catch (error: any) {
        // Should not happen with /auth/session, but handle gracefully
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Call backend API - let backend handle all validation
      const loginData: LoginDto = { email, password };
      const response = await authApi.authControllerLogin(loginData);
      
      // Reset logging out flag after successful login
      const { setLoggingOut } = await import('@/lib/api-client');
      setLoggingOut(false);
      
      // Backend wraps response: { data: { user } }
      const userData = response.data?.data?.user || response.data?.user;
      if (userData) {
        // SECURITY: Only allow 'customer' role on client app
        if (userData.role === 'admin') {
          await authApi.authControllerLogout({});
          throw new Error('Email hoặc mật khẩu không đúng');
        }
        
        setUser({
          id: userData.id.toString(),
          email: userData.email,
          username: userData.full_name || userData.email,
          firstName: userData.full_name?.split(' ')[0] || '',
          lastName: userData.full_name?.split(' ').slice(1).join(' ') || '',
          phone: userData.phone || '',
          avatar: '',
          role: userData.role,
          emailVerified: userData.email_verified || false,
          createdAt: userData.created_at || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        
        console.log('[AuthContext] Login successful, user state updated');
      }
    } catch (error: any) {
      setUser(null);
      
      // Backend returns error messages
      const message = error.response?.data?.message || error.message;
      const errorMessage = Array.isArray(message) ? message.join(', ') : message || 'Đăng nhập thất bại';
      
      // Log for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.error('[AuthContext] Login failed:', errorMessage);
      }
      
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: {
    firstName: string;
    lastName?: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    setIsLoading(true);
    try {
      // Call backend API - let backend handle all validation
      const registerData: RegisterDto = {
        full_name: `${userData.firstName} ${userData.lastName || ''}`.trim(),
        email: userData.email,
        password: userData.password,
        phone: userData.phone,
      };
      const response: any = await authApi.authControllerRegister(registerData);
      
      // Backend wraps response: { data: { user } }
      const newUser = response.data?.data?.user || response.data?.user;
      if (newUser) {
        // SECURITY: Verify customer role after registration
        if (newUser.role === 'admin') {
          await authApi.authControllerLogout({});
          throw new Error('Đăng ký thất bại. Vui lòng thử lại');
        }
        
        setUser({
          id: newUser.id.toString(),
          email: newUser.email,
          username: newUser.full_name || `${userData.firstName} ${userData.lastName}`.trim(),
          firstName: userData.firstName,
          lastName: userData.lastName || '',
          phone: userData.phone || '',
          avatar: '',
          role: newUser.role,
          emailVerified: newUser.email_verified || false,
          createdAt: newUser.created_at || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (error: any) {
      setUser(null);
      
      // Backend returns error messages
      const message = error.response?.data?.message || error.message;
      throw new Error(Array.isArray(message) ? message.join(', ') : message || 'Đăng ký thất bại');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // Set logging out flag to prevent refresh attempts
      const { axiosInstance, setLoggingOut } = await import('@/lib/api-client');
      setLoggingOut(true);
      
      // Call logout API using axios directly (no body needed - uses cookies)
      await axiosInstance.post('/auth/logout', {});
      
      // Clear user state immediately
      setUser(null);
      
      // Redirect to signin
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      }
    } catch (error) {
      // Ignore errors - logout anyway
      console.error('Logout API error:', error);
      setUser(null);
      
      // Redirect even on error
      if (typeof window !== 'undefined') {
        window.location.href = '/signin';
      }
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      // Call backend API to update profile
      const response = await axiosInstance.patch('/auth/profile', {
        full_name: userData.firstName && userData.lastName 
          ? `${userData.firstName} ${userData.lastName}`.trim()
          : undefined,
        email: userData.email,
        phone: userData.phone,
      });

      const updatedUserData = response.data?.user || response.data?.data?.user;
      
      // Update local user state with backend response
      if (updatedUserData) {
        setUser({
          id: updatedUserData.id.toString(),
          email: updatedUserData.email,
          username: updatedUserData.full_name || updatedUserData.email,
          firstName: updatedUserData.full_name?.split(' ')[0] || '',
          lastName: updatedUserData.full_name?.split(' ').slice(1).join(' ') || '',
          phone: updatedUserData.phone || '',
          avatar: user?.avatar || '',
          role: updatedUserData.role,
          emailVerified: updatedUserData.email_verified || user?.emailVerified || false,
          createdAt: updatedUserData.created_at || user?.createdAt || new Date().toISOString(),
          updatedAt: updatedUserData.updated_at || new Date().toISOString(),
        });
      }
    } catch (error: any) {
      console.error('Failed to update user:', error);
      const message = error.response?.data?.message || error.message || 'Failed to update profile';
      throw new Error(message);
    }
  };

  const loginWithGoogle = async (credential: string) => {
    setIsLoading(true);
    try {
      // Redirect to backend Google OAuth endpoint
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      window.location.href = `${backendUrl}/api/v1/auth/google`;
    } catch (error: any) {
      setUser(null);
      setIsLoading(false);
      const message = error.response?.data?.message || error.message;
      throw new Error(message || 'Đăng nhập Google thất bại');
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
