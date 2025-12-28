"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { authApi } from "@/lib/api-client";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): string => {
    if (!email.trim()) return "Email không được để trống";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email không hợp lệ";
    return "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const emailError = validateEmail(email);
    if (emailError) {
      setError(emailError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      await authApi.authControllerForgotPassword({ email });
      setSuccess(true);
    } catch (err: any) {
      console.error('Forgot password error:', err);
      
      let errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại.';
      
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.message) {
          errorMessage = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        }
      }

      // Don't reveal if email exists or not for security
      // Just show generic success message
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Breadcrumb title="Quên Mật Khẩu" pages={["Quên Mật Khẩu"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
              <div className="text-center">
                <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="font-semibold text-xl sm:text-2xl text-dark mb-3">
                  Kiểm Tra Email Của Bạn
                </h2>
                <p className="text-dark-5 mb-6">
                  Nếu email <span className="font-medium text-dark">{email}</span> đã được đăng ký, 
                  chúng tôi đã gửi hướng dẫn đặt lại mật khẩu đến email đó.
                </p>
                <p className="text-sm text-dark-5 mb-6">
                  Link đặt lại mật khẩu sẽ hết hạn sau 1 giờ.
                </p>
                <div className="flex flex-col gap-3">
                  <Link
                    href="/signin"
                    className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue"
                  >
                    Quay lại đăng nhập
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setSuccess(false);
                      setEmail("");
                    }}
                    className="text-dark-4 ease-out duration-200 hover:text-dark"
                  >
                    Gửi lại email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="Quên Mật Khẩu" pages={["Quên Mật Khẩu"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Quên Mật Khẩu?
              </h2>
              <p className="text-dark-5">
                Nhập email đã đăng ký để nhận link đặt lại mật khẩu
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-700 font-medium flex-1">{error}</p>
                  </div>
                </div>
              )}

              <div className="mb-5">
                <label htmlFor="email" className="block mb-2.5 font-medium">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="Nhập địa chỉ email của bạn"
                  className={`rounded-lg border ${
                    error
                      ? 'border-red-500 focus:ring-red-500/20'
                      : 'border-gray-3 focus:ring-blue/20'
                  } bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2`}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang gửi...' : 'Gửi Link Đặt Lại Mật Khẩu'}
              </button>

              <p className="text-center mt-6">
                Nhớ mật khẩu?
                <Link
                  href="/signin"
                  className="text-dark ease-out duration-200 hover:text-blue pl-2"
                >
                  Đăng nhập
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

export default ForgotPassword;
