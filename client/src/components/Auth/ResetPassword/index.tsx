"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api-client";

const ResetPasswordContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    password: "",
    confirmPassword: "",
    general: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [touched, setTouched] = useState({
    password: false,
    confirmPassword: false,
  });

  useEffect(() => {
    if (!token) {
      setErrors(prev => ({
        ...prev,
        general: "Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn."
      }));
    }
  }, [token]);

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 20;
    if (password.length >= 12) strength += 10;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 25;
    return Math.min(strength, 100);
  };

  const validatePassword = (password: string): string => {
    if (!password) return "Mật khẩu không được để trống";
    if (password.length < 12) return "Mật khẩu phải có ít nhất 12 ký tự";
    if (!/[A-Z]/.test(password)) return "Mật khẩu phải có ít nhất 1 chữ hoa";
    if (!/[a-z]/.test(password)) return "Mật khẩu phải có ít nhất 1 chữ thường";
    if (!/[0-9]/.test(password)) return "Mật khẩu phải có ít nhất 1 chữ số";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return "Mật khẩu phải có ít nhất 1 ký tự đặc biệt";
    return "";
  };

  const validateConfirmPassword = (password: string, confirmPassword: string): string => {
    if (!confirmPassword) return "Vui lòng xác nhận mật khẩu";
    if (password !== confirmPassword) return "Mật khẩu không khớp";
    return "";
  };

  const getPasswordStrengthColor = (): string => {
    if (passwordStrength >= 80) return "#22c55e";
    if (passwordStrength >= 50) return "#eab308";
    return "#ef4444";
  };

  const getPasswordStrengthText = (): string => {
    if (passwordStrength >= 80) return "Mạnh";
    if (passwordStrength >= 50) return "Trung bình";
    if (passwordStrength > 0) return "Yếu";
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    if (touched[name as keyof typeof touched]) {
      let fieldError = "";
      if (name === 'password') {
        fieldError = validatePassword(value);
      } else if (name === 'confirmPassword') {
        fieldError = validateConfirmPassword(formData.password, value);
      }
      setErrors(prev => ({ ...prev, [name]: fieldError, general: "" }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    let fieldError = "";
    if (name === 'password') {
      fieldError = validatePassword(value);
    } else if (name === 'confirmPassword') {
      fieldError = validateConfirmPassword(formData.password, value);
    }
    setErrors(prev => ({ ...prev, [name]: fieldError }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setErrors(prev => ({
        ...prev,
        general: "Link đặt lại mật khẩu không hợp lệ."
      }));
      return;
    }

    const passwordError = validatePassword(formData.password);
    const confirmError = validateConfirmPassword(formData.password, formData.confirmPassword);

    if (passwordError || confirmError) {
      setErrors({
        password: passwordError,
        confirmPassword: confirmError,
        general: "",
      });
      setTouched({ password: true, confirmPassword: true });
      return;
    }

    setLoading(true);
    setErrors({ password: "", confirmPassword: "", general: "" });

    try {
      await authApi.authControllerResetPassword({
        token,
        new_password: formData.password,
      });
      setSuccess(true);
    } catch (err: any) {
      console.error('Reset password error:', err);
      
      let errorMessage = 'Có lỗi xảy ra. Vui lòng thử lại.';
      
      if (err.response?.data) {
        const data = err.response.data;
        if (typeof data === 'string') {
          errorMessage = data;
        } else if (data.message) {
          errorMessage = Array.isArray(data.message) ? data.message.join(', ') : data.message;
        }
      }

      if (errorMessage.toLowerCase().includes('token') || 
          errorMessage.toLowerCase().includes('expired') ||
          errorMessage.toLowerCase().includes('invalid')) {
        setErrors({
          password: "",
          confirmPassword: "",
          general: "Link đặt lại mật khẩu đã hết hạn hoặc không hợp lệ. Vui lòng yêu cầu link mới.",
        });
      } else if (errorMessage.toLowerCase().includes('password')) {
        setErrors({
          password: errorMessage,
          confirmPassword: "",
          general: "",
        });
      } else {
        setErrors({
          password: "",
          confirmPassword: "",
          general: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        <Breadcrumb title="Đặt Lại Mật Khẩu" pages={["Đặt Lại Mật Khẩu"]} />
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
                  Đặt Lại Mật Khẩu Thành Công!
                </h2>
                <p className="text-dark-5 mb-6">
                  Mật khẩu của bạn đã được cập nhật. Bạn có thể đăng nhập với mật khẩu mới.
                </p>
                <Link
                  href="/signin"
                  className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue"
                >
                  Đăng nhập ngay
                </Link>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="Đặt Lại Mật Khẩu" pages={["Đặt Lại Mật Khẩu"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Đặt Lại Mật Khẩu
              </h2>
              <p className="text-dark-5">
                Nhập mật khẩu mới cho tài khoản của bạn
              </p>
              <p className="text-sm text-dark-5 mt-2">
                Mật khẩu phải có ít nhất 12 ký tự: chữ HOA, chữ thường, chữ số và ký tự đặc biệt (!@#$...)
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              {errors.general && (
                <div className="mb-5 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-red-700 font-medium">{errors.general}</p>
                      {errors.general.includes('hết hạn') && (
                        <Link href="/forgot-password" className="text-red-600 underline text-sm mt-1 inline-block">
                          Yêu cầu link mới
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="mb-5">
                <label htmlFor="password" className="block mb-2.5 font-medium">
                  Mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Nhập mật khẩu mới"
                  className={`rounded-lg border ${
                    errors.password && touched.password
                      ? 'border-red-500 focus:ring-red-500/20'
                      : 'border-gray-3 focus:ring-blue/20'
                  } bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2`}
                  required
                  disabled={!token}
                />
                {formData.password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-dark-5">Độ mạnh mật khẩu:</span>
                      <span style={{ color: getPasswordStrengthColor() }} className="font-medium">
                        {getPasswordStrengthText()}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${passwordStrength}%`,
                          backgroundColor: getPasswordStrengthColor(),
                        }}
                      />
                    </div>
                  </div>
                )}
                {errors.password && touched.password && (
                  <div className="flex items-start gap-2 mt-2 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-md">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-700 text-sm font-medium">{errors.password}</p>
                  </div>
                )}
              </div>

              <div className="mb-5">
                <label htmlFor="confirmPassword" className="block mb-2.5 font-medium">
                  Xác nhận mật khẩu <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="Nhập lại mật khẩu mới"
                  className={`rounded-lg border ${
                    errors.confirmPassword && touched.confirmPassword
                      ? 'border-red-500 focus:ring-red-500/20'
                      : 'border-gray-3 focus:ring-blue/20'
                  } bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2`}
                  required
                  disabled={!token}
                />
                {errors.confirmPassword && touched.confirmPassword && (
                  <div className="flex items-start gap-2 mt-2 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-md">
                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-700 text-sm font-medium">{errors.confirmPassword}</p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || !token}
                className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue mt-7.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
              </button>

              <p className="text-center mt-6">
                <Link
                  href="/signin"
                  className="text-dark ease-out duration-200 hover:text-blue"
                >
                  Quay lại đăng nhập
                </Link>
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
};

const ResetPassword = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPassword;
