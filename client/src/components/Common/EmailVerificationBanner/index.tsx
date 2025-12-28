"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { axiosInstance } from "@/lib/api-client";

const EmailVerificationBanner = () => {
  const { user, isAuthenticated } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  // Don't show if not authenticated, already verified, or dismissed
  if (!isAuthenticated || !user || user.emailVerified || dismissed) {
    return null;
  }

  const handleResendEmail = async () => {
    if (resending || resent) return;
    
    setResending(true);
    try {
      await axiosInstance.post('/auth/resend-verification', { email: user.email });
      setResent(true);
      // Reset resent after 60 seconds
      setTimeout(() => setResent(false), 60000);
    } catch (error) {
      console.error('Error resending verification email:', error);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <svg 
                className="w-5 h-5 text-amber-600" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              <span className="text-amber-800 font-medium text-sm">
                Email chưa được xác thực.
              </span>
              <span className="text-amber-700 text-sm">
                Vui lòng kiểm tra email và xác thực để sử dụng đầy đủ tính năng.
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {resent ? (
              <span className="text-green-600 text-sm font-medium">
                Đã gửi!
              </span>
            ) : (
              <button
                onClick={handleResendEmail}
                disabled={resending}
                className="text-amber-700 hover:text-amber-900 text-sm font-medium underline disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {resending ? "Đang gửi..." : "Gửi lại email"}
              </button>
            )}
            
            <span className="text-amber-300">|</span>
            
            <Link
              href={`/verify-email?email=${encodeURIComponent(user.email)}`}
              className="text-amber-700 hover:text-amber-900 text-sm font-medium underline"
            >
              Xác thực ngay
            </Link>
            
            <button
              onClick={() => setDismissed(true)}
              className="ml-2 p-1 text-amber-600 hover:text-amber-800 hover:bg-amber-100 rounded transition-colors"
              title="Ẩn thông báo"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path 
                  fillRule="evenodd" 
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" 
                  clipRule="evenodd" 
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
