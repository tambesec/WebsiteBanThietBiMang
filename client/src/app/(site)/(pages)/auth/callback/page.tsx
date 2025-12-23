'use client';

import { useEffect } from 'react';

/**
 * OAuth Callback Page
 * Handles redirect from backend after Google OAuth
 * Backend sets cookies and redirects here, just need to redirect to home
 */
export default function AuthCallbackPage() {
  useEffect(() => {
    // Backend already set cookies, just redirect to home
    // AuthContext will load session automatically
    window.location.href = '/';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        </div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          Đang xử lý đăng nhập...
        </h2>
        <p className="text-gray-600">
          Vui lòng đợi trong giây lát
        </p>
      </div>
    </div>
  );
}
