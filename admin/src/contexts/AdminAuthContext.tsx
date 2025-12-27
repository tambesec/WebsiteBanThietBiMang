'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, updateAdminToken, clearAdminTokens, setLoggingOut } from '@/lib/api-client';
import type { LoginDto } from '@/generated-api';

interface AdminUser {
  id: number;
  email: string;
  username: string;
  full_name?: string;
  phone?: string;
  role?: string;
  roles: string[];
}

interface AdminAuthContextType {
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        
        if (token) {
          // Fetch latest profile data from backend instead of using stale localStorage
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/users/admin/profile`, {
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });

            if (response.ok) {
              const profileData = await response.json();
              // profileData might be wrapped in TransformInterceptor format
              const admin = profileData.data || profileData;
              
              const userData = {
                id: admin.id,
                email: admin.email,
                username: admin.full_name || admin.email,
                full_name: admin.full_name,
                phone: admin.phone,
                role: admin.role,
                roles: [admin.role],
              };
              
              // Update localStorage with fresh data
              localStorage.setItem('admin_user', JSON.stringify(userData));
              setUser(userData);
            } else {
              // Token is invalid, clear it
              clearAdminTokens();
            }
          } catch (error) {
            console.error('Failed to fetch admin profile:', error);
            // Network error - try using cached data
            const savedUser = localStorage.getItem('admin_user');
            if (savedUser) {
              setUser(JSON.parse(savedUser));
            } else {
              clearAdminTokens();
            }
          }
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        clearAdminTokens();
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const loginDto: LoginDto = { email, password };
      
      // Use admin-specific endpoint that returns tokens in body (no cookies)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/auth/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginDto),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Đăng nhập thất bại');
      }

      const response_json = await response.json();
      
      // DEBUG: Log response to check structure
      console.log('[AdminAuth] Login response:', response_json);
      
      // Backend uses TransformInterceptor which wraps response:
      // { success, statusCode, message, data: { accessToken, refreshToken, user }, timestamp }
      const data = response_json.data || response_json;
      
      console.log('[AdminAuth] Extracted data:', data);
      console.log('[AdminAuth] User object:', data.user);
      console.log('[AdminAuth] User role:', data.user?.role);
      
      // SECURITY: Verify admin role (backend already checked, but double-check)
      const userRole = data.user?.role;
      if (userRole !== 'admin') {
        console.error('[AdminAuth] Role check failed. Expected "admin", got:', userRole);
        throw new Error('Email hoặc mật khẩu không đúng');
      }
      
      // Save tokens to localStorage (NO cookies)
      updateAdminToken(data.accessToken, data.refreshToken);
      
      const userData = {
        id: data.user.id,
        email: data.user.email,
        username: data.user.full_name || data.user.email,
        full_name: data.user.full_name,
        phone: data.user.phone,
        role: userRole,
        roles: ['admin'],
      };
      
      localStorage.setItem('admin_user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setLoggingOut(true);
    
    try {
      const refreshToken = localStorage.getItem('admin_refresh_token');
      if (refreshToken) {
        // Call admin logout endpoint
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/v1/auth/admin/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken }),
        }).catch(() => {});
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
    
    clearAdminTokens();
    setUser(null);
    setLoggingOut(false);
    
    // Use router instead of window.location for proper Next.js navigation
    if (typeof window !== 'undefined') {
      window.location.replace('/auth/signin');
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
