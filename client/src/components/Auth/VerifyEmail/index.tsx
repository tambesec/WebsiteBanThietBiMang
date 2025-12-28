"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { axiosInstance } from "@/lib/api-client";
import { useAuth } from "@/contexts/AuthContext";

const VerifyEmailContent = () => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const emailParam = searchParams.get("email");
  const success = searchParams.get("success");
  const error = searchParams.get("error");
  
  const { user } = useAuth();
  
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [hasAttemptedVerify, setHasAttemptedVerify] = useState(false);

  useEffect(() => {
    // Handle redirect from backend GET /auth/verify-email
    if (success === "true") {
      setStatus("success");
      setMessage("Email của bạn đã được xác thực thành công!");
      return;
    }
    
    if (error) {
      setStatus("error");
      setMessage(decodeURIComponent(error));
      return;
    }

    // If token is present and haven't attempted yet, verify it via POST
    if (token && !hasAttemptedVerify) {
      setHasAttemptedVerify(true);
      verifyEmail(token);
    }
  }, [token, success, error, hasAttemptedVerify]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const verifyEmail = async (verificationToken: string) => {
    setStatus("loading");
    
    try {
      await axiosInstance.post('/auth/verify-email', { token: verificationToken });
      setStatus("success");
      setMessage("Email của bạn đã được xác thực thành công!");
    } catch (err: any) {
      console.error('Verify email error:', err);
      setStatus("error");
      
      let errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại.';
      
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.message) {
          errorMessage = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        }
      }
      
      setMessage(errorMessage);
    }
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;
    
    const email = emailParam || user?.email;
    if (!email) {
      setMessage('Không tìm thấy email. Vui lòng đăng nhập hoặc thử lại.');
      return;
    }
    
    setResending(true);
    setResendSuccess(false);
    
    try {
      await axiosInstance.post('/auth/resend-verification', { email });
      setResendSuccess(true);
      setResendCooldown(120); // 2 minutes cooldown
    } catch (err: any) {
      console.error('Resend email error:', err);
      
      let errorMessage = 'Không thể gửi lại email. Vui lòng thử lại sau.';
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      // Show error but don't change main status
      alert(errorMessage);
    } finally {
      setResending(false);
    }
  };

  // No token, no success/error params - Show instruction page
  if (!token && !success && !error) {
    return (
      <>
        <Breadcrumb title="Xác Thực Email" pages={["Xác Thực Email"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
              <div className="text-center">
                <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="font-semibold text-xl sm:text-2xl text-dark mb-3">
                  Xác Thực Email Của Bạn
                </h2>
                
                {user && !user.is_email_verified ? (
                  <>
                    <p className="text-dark-5 mb-6">
                      Chúng tôi đã gửi email xác thực đến <span className="font-medium text-dark">{user.email}</span>.
                      Vui lòng kiểm tra hộp thư (bao gồm cả thư mục spam) và nhấn vào link xác thực.
                    </p>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                      <p className="text-yellow-800 text-sm">
                        <span className="font-medium">Lưu ý:</span> Link xác thực sẽ hết hạn sau 24 giờ.
                      </p>
                    </div>
                    
                    {resendSuccess && (
                      <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-700 text-sm">
                          ✅ Email xác thực đã được gửi lại thành công!
                        </p>
                      </div>
                    )}
                    
                    <button
                      onClick={handleResendEmail}
                      disabled={resending || resendCooldown > 0}
                      className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resending ? 'Đang gửi...' : 
                       resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 
                       'Gửi lại email xác thực'}
                    </button>
                  </>
                ) : user && user.is_email_verified ? (
                  <>
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-green-600 font-medium mb-6">
                      Email của bạn đã được xác thực!
                    </p>
                    <Link
                      href="/"
                      className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue"
                    >
                      Về trang chủ
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-dark-5 mb-6">
                      Vui lòng đăng nhập để xem trạng thái xác thực email của bạn.
                    </p>
                    <Link
                      href="/signin"
                      className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue"
                    >
                      Đăng nhập
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Loading state
  if (status === "loading") {
    return (
      <>
        <Breadcrumb title="Xác Thực Email" pages={["Xác Thực Email"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
              <div className="text-center">
                <div className="mx-auto w-20 h-20 flex items-center justify-center mb-6">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
                <h2 className="font-semibold text-xl sm:text-2xl text-dark mb-3">
                  Đang xác thực email...
                </h2>
                <p className="text-dark-5">Vui lòng đợi trong giây lát</p>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Success state
  if (status === "success") {
    return (
      <>
        <Breadcrumb title="Xác Thực Email" pages={["Xác Thực Email"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
              <div className="text-center">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="font-semibold text-xl sm:text-2xl text-dark mb-3">
                  Xác Thực Thành Công!
                </h2>
                <p className="text-dark-5 mb-6">{message}</p>
                <p className="text-sm text-dark-5 mb-6">
                  Bây giờ bạn có thể sử dụng đầy đủ các tính năng của NetTechPro.
                </p>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/"
                    className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue"
                  >
                    Bắt đầu mua sắm
                  </Link>
                  <Link
                    href="/my-account"
                    className="text-dark-4 ease-out duration-200 hover:text-dark"
                  >
                    Đi đến tài khoản
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  // Error state
  return (
    <>
      <Breadcrumb title="Xác Thực Email" pages={["Xác Thực Email"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center">
              <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="font-semibold text-xl sm:text-2xl text-dark mb-3">
                Xác Thực Thất Bại
              </h2>
              <p className="text-dark-5 mb-6">{message}</p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <p className="text-sm text-dark-5 mb-2">Điều này có thể xảy ra vì:</p>
                <ul className="text-sm text-dark-5 list-disc list-inside space-y-1">
                  <li>Link xác thực đã hết hạn (sau 24 giờ)</li>
                  <li>Link đã được sử dụng trước đó</li>
                  <li>Link không hợp lệ</li>
                </ul>
              </div>
              
              {user ? (
                <button
                  onClick={handleResendEmail}
                  disabled={resending || resendCooldown > 0}
                  className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue disabled:opacity-50 disabled:cursor-not-allowed mb-3"
                >
                  {resending ? 'Đang gửi...' : 
                   resendCooldown > 0 ? `Gửi lại sau ${resendCooldown}s` : 
                   'Gửi lại email xác thực'}
                </button>
              ) : (
                <Link
                  href="/signin"
                  className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mb-3"
                >
                  Đăng nhập để gửi lại email
                </Link>
              )}
              
              <Link
                href="/"
                className="text-dark-4 ease-out duration-200 hover:text-dark"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const VerifyEmail = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
};

export default VerifyEmail;
