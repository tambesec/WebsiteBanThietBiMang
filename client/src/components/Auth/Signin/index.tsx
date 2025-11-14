"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { authApi } from "@/services/api";

const Signin = () => {
  const router = useRouter();
  const { login, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    general: "",
  });
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const validateEmail = (email: string): string => {
    if (!email.trim()) return "Email không được để trống";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email không hợp lệ";
    return "";
  };

  const validatePassword = (password: string): string => {
    if (!password) return "Mật khẩu không được để trống";
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Clear errors when user types
    if (touched[name as keyof typeof touched]) {
      setErrors({
        ...errors,
        [name]: name === 'email' ? validateEmail(value) : validatePassword(value),
        general: "",
      });
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched({
      ...touched,
      [name]: true,
    });
    setErrors({
      ...errors,
      [name]: name === 'email' ? validateEmail(value) : validatePassword(value),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
        general: "",
      });
      setTouched({ email: true, password: true });
      return;
    }

    setLoading(true);
    setErrors({ email: "", password: "", general: "" });

    try {
      await login(formData.email, formData.password);
      // Redirect after successful login
      setTimeout(() => {
        router.push('/');
      }, 100);
    } catch (err: any) {
      console.error('Đăng nhập thất bại:', err);
      
      let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.message) {
          errorMessage = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        } else if (data.error) {
          errorMessage = data.error;
        }
      }

      // Categorize errors
      if (errorMessage.toLowerCase().includes('email') && 
          (errorMessage.includes('không tồn tại') || errorMessage.includes('not found'))) {
        setErrors({
          email: "Email này chưa được đăng ký",
          password: "",
          general: "",
        });
      } else if (errorMessage.toLowerCase().includes('password') || 
                 errorMessage.toLowerCase().includes('mật khẩu') ||
                 errorMessage.toLowerCase().includes('invalid')) {
        setErrors({
          email: "",
          password: "Mật khẩu không chính xác",
          general: "",
        });
      } else if (errorMessage.includes('khóa') || errorMessage.includes('locked')) {
        setErrors({
          email: "",
          password: "",
          general: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ.",
        });
      } else {
        setErrors({
          email: "",
          password: "",
          general: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setErrors({
        email: "",
        password: "",
        general: "Không nhận được token từ Google",
      });
      return;
    }

    try {
      setLoading(true);
      setErrors({ email: "", password: "", general: "" });
      
      console.log('Sending Google credential to backend...');
      
      // Use loginWithGoogle from AuthContext
      await loginWithGoogle(credentialResponse.credential);
      
      console.log('Google login successful, redirecting...');
      
      // Redirect to home
      router.push('/');
    } catch (error: any) {
      console.error('Google login failed:', error);
      console.error('Error details:', error.response?.data);
      
      const errorMsg = error.message || 
                      error.response?.data?.message || 
                      "Đăng nhập Google thất bại. Vui lòng thử lại.";
      
      setErrors({
        email: "",
        password: "",
        general: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrors({
      email: "",
      password: "",
      general: "Đăng nhập Google thất bại. Vui lòng thử lại.",
    });
  };

  return (
    <>
      <Breadcrumb title={"Đăng Nhập"} pages={["Đăng Nhập"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Đăng Nhập Tài Khoản
              </h2>
              <p>Nhập thông tin của bạn bên dưới</p>
            </div>

            <div>
              <form onSubmit={handleSubmit}>
                {errors.general && (
                  <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                    <div className="flex items-start gap-3">
                      <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-red-700 font-medium flex-1">{errors.general}</p>
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
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Nhập địa chỉ email của bạn"
                    className={`rounded-lg border ${
                      errors.email && touched.email
                        ? 'border-red-500 focus:ring-red-500/20'
                        : 'border-gray-3 focus:ring-blue/20'
                    } bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2`}
                    required
                  />
                  {errors.email && touched.email && (
                    <div className="flex items-start gap-2 mt-2 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-md">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-red-700 text-sm font-medium">{errors.email}</p>
                    </div>
                  )}
                </div>

                <div className="mb-5">
                  <label htmlFor="password" className="block mb-2.5 font-medium">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="password"
                    name="password"
                    id="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Nhập mật khẩu của bạn"
                    autoComplete="current-password"
                    className={`rounded-lg border ${
                      errors.password && touched.password
                        ? 'border-red-500 focus:ring-red-500/20'
                        : 'border-gray-3 focus:ring-blue/20'
                    } bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2`}
                    required
                  />
                  {errors.password && touched.password && (
                    <div className="flex items-start gap-2 mt-2 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-md">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-red-700 text-sm font-medium">{errors.password}</p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>

                <a
                  href="/forgot-password"
                  className="block text-center text-dark-4 mt-4.5 ease-out duration-200 hover:text-dark"
                >
                  Quên mật khẩu?
                </a>

                <div className="relative mt-6 mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-3"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-body-color font-medium">Hoặc đăng nhập với</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4.5">
                  <div className="w-full flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleLogin}
                      onError={handleGoogleError}
                      theme="outline"
                      size="large"
                      text="signin_with"
                      width="100%"
                      useOneTap={false}
                      shape="rectangular"
                      logo_alignment="left"
                    />
                  </div>

                  <button 
                    type="button" 
                    onClick={() => alert('Chức năng đăng nhập Zalo đang được phát triển')}
                    className="flex justify-center items-center gap-3.5 rounded-lg border border-gray-3 bg-gray-1 p-3 ease-out duration-200 hover:bg-gray-2"
                  >
                    <svg
                      width="22"
                      height="22"
                      viewBox="0 0 22 22"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11 0C4.925 0 0 4.925 0 11C0 17.075 4.925 22 11 22C17.075 22 22 17.075 22 11C22 4.925 17.075 0 11 0ZM16.5 8.8L15.4 14.3C15.4 14.3 15.125 15.125 14.3 14.85L10.45 12.1L8.8 11.275L6.05 10.45C6.05 10.45 5.5 10.175 5.5 9.625C5.5 9.075 6.05 8.8 6.05 8.8L15.95 5.5C15.95 5.5 16.5 5.225 16.5 5.775V8.8Z"
                        fill="#0088CC"
                      />
                    </svg>
                    Đăng nhập với Zalo
                  </button>
                </div>

                <p className="text-center mt-6">
                  Chưa có tài khoản?
                  <Link
                    href="/signup"
                    className="text-dark ease-out duration-200 hover:text-blue pl-2"
                  >
                    Đăng ký ngay!
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signin;
