"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";

const Signup = () => {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [errors, setErrors] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    general: "",
  });
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    fullName: false,
    email: false,
    password: false,
    confirmPassword: false,
    phone: false,
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 12) strength += 25;
    if (password.length >= 16) strength += 10;
    if (/[a-z]/.test(password)) strength += 15;
    if (/[A-Z]/.test(password)) strength += 15;
    if (/[0-9]/.test(password)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 20;
    return Math.min(strength, 100);
  };

  const validateFullName = (fullName: string): string => {
    if (!fullName.trim()) return "Họ tên không được để trống";
    if (fullName.trim().length < 3) return "Họ tên phải có ít nhất 3 ký tự";
    if (fullName.length > 100) return "Họ tên không được quá 100 ký tự";
    return "";
  };

  const validateEmail = (email: string): string => {
    if (!email.trim()) return "Email không được để trống";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Email không hợp lệ";
    return "";
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

  const validatePhone = (phone: string): string => {
    if (phone && !/^[0-9]{10,11}$/.test(phone)) return "Số điện thoại không hợp lệ";
    return "";
  };

  const getPasswordStrengthColor = (): string => {
    if (passwordStrength >= 80) return "#22c55e"; // green-500
    if (passwordStrength >= 50) return "#eab308"; // yellow-500
    return "#ef4444"; // red-500
  };

  const getPasswordStrengthText = (): string => {
    if (passwordStrength >= 80) return "Mạnh";
    if (passwordStrength >= 50) return "Trung bình";
    if (passwordStrength > 0) return "Yếu";
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Update password strength
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    // Realtime validation for touched fields
    if (touched[name as keyof typeof touched]) {
      let fieldError = "";
      switch (name) {
        case 'fullName':
          fieldError = validateFullName(value);
          break;
        case 'email':
          fieldError = validateEmail(value);
          break;
        case 'password':
          fieldError = validatePassword(value);
          break;
        case 'confirmPassword':
          fieldError = validateConfirmPassword(formData.password, value);
          break;
        case 'phone':
          fieldError = validatePhone(value);
          break;
      }
      setErrors({
        ...errors,
        [name]: fieldError,
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

    let fieldError = "";
    switch (name) {
      case 'fullName':
        fieldError = validateFullName(value);
        break;
      case 'email':
        fieldError = validateEmail(value);
        break;
      case 'password':
        fieldError = validatePassword(value);
        break;
      case 'confirmPassword':
        fieldError = validateConfirmPassword(formData.password, value);
        break;
      case 'phone':
        fieldError = validatePhone(value);
        break;
    }
    setErrors({
      ...errors,
      [name]: fieldError,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    const fullNameError = validateFullName(formData.fullName);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
    const phoneError = validatePhone(formData.phone);

    if (fullNameError || emailError || passwordError || confirmPasswordError || phoneError) {
      setErrors({
        fullName: fullNameError,
        email: emailError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
        phone: phoneError,
        general: "",
      });
      setTouched({
        fullName: true,
        email: true,
        password: true,
        confirmPassword: true,
        phone: true,
      });
      return;
    }

    setLoading(true);
    setErrors({
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      general: "",
    });

    try {
      await register({
        firstName: formData.fullName.split(' ')[0] || formData.fullName,
        lastName: formData.fullName.split(' ').slice(1).join(' ') || '',
        email: formData.email,
        password: formData.password,
        phone: formData.phone.trim() || undefined,
      });
      // Show email verification success screen
      setRegisteredEmail(formData.email);
      setRegistrationSuccess(true);
    } catch (err: any) {
      console.error('Đăng ký thất bại:', err);
      
      let errorMessage = 'Đăng ký thất bại. Vui lòng thử lại.';
      
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
          (errorMessage.includes('đã tồn tại') || errorMessage.includes('already exists') || errorMessage.includes('taken'))) {
        setErrors({
          fullName: "",
          email: "Email này đã được sử dụng",
          password: "",
          confirmPassword: "",
          phone: "",
          general: "",
        });
      } else if (errorMessage.toLowerCase().includes('password') ||
                 errorMessage.toLowerCase().includes('mật khẩu')) {
        setErrors({
          fullName: "",
          email: "",
          password: errorMessage,
          confirmPassword: "",
          phone: "",
          general: "",
        });
      } else {
        setErrors({
          fullName: "",
          email: "",
          password: "",
          confirmPassword: "",
          phone: "",
          general: errorMessage,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    // Redirect to backend Google OAuth endpoint
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    window.location.href = `${backendUrl}/api/v1/auth/google`;
  };

  // (Đã loại bỏ Facebook OAuth - chỉ giữ Google)

  // Registration Success Screen
  if (registrationSuccess) {
    return (
      <>
        <Breadcrumb title={"Đăng Ký Thành Công"} pages={["Đăng Ký", "Xác Thực Email"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
              <div className="text-center">
                {/* Success Icon */}
                <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                  <svg 
                    className="w-10 h-10 text-green-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
                    />
                  </svg>
                </div>

                <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-3">
                  Kiểm Tra Email Của Bạn
                </h2>
                
                <p className="text-dark-5 mb-4">
                  Chúng tôi đã gửi một email xác thực đến:
                </p>
                
                <p className="text-blue font-medium text-lg mb-6">
                  {registeredEmail}
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-medium text-dark mb-2">Bước tiếp theo:</h3>
                  <ol className="text-dark-5 text-sm space-y-2 list-decimal list-inside">
                    <li>Mở hộp thư email của bạn</li>
                    <li>Tìm email từ NetworkStore</li>
                    <li>Click vào liên kết xác thực trong email</li>
                    <li>Quay lại đây và đăng nhập</li>
                  </ol>
                </div>

                <p className="text-dark-5 text-sm mb-6">
                  Không nhận được email? Kiểm tra thư mục spam hoặc{" "}
                  <Link 
                    href={`/verify-email?email=${encodeURIComponent(registeredEmail)}`}
                    className="text-blue hover:underline"
                  >
                    yêu cầu gửi lại
                  </Link>
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/signin"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue py-3 px-6 text-white font-medium hover:bg-blue-dark transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Đi tới Đăng Nhập
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setRegistrationSuccess(false);
                      setFormData({
                        fullName: "",
                        email: "",
                        password: "",
                        confirmPassword: "",
                        phone: "",
                      });
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-3 py-3 px-6 text-dark font-medium hover:bg-gray-1 transition-colors"
                  >
                    Đăng ký tài khoản khác
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
      <Breadcrumb title={"Đăng Ký"} pages={["Đăng Ký"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="max-w-[570px] w-full mx-auto rounded-xl bg-white shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="text-center mb-11">
              <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                Tạo Tài Khoản
              </h2>
              <p>Nhập thông tin của bạn bên dưới</p>
              <p className="text-sm text-dark-5 mt-2">
                Mật khẩu phải có ít nhất 12 ký tự bao gồm: chữ HOA, chữ thường, chữ số và ký tự đặc biệt (!@#$...)
              </p>
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

                {/* Full Name */}
                <div className="mb-5">
                  <label htmlFor="fullName" className="block mb-2.5 font-medium">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    id="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Nhập họ và tên đầy đủ"
                    className={`rounded-lg border ${
                      errors.fullName && touched.fullName
                        ? 'border-red-500 focus:ring-red-500/20'
                        : 'border-gray-3 focus:ring-blue/20'
                    } bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2`}
                    required
                  />
                  {errors.fullName && touched.fullName && (
                    <div className="flex items-start gap-2 mt-2 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-md animate-shake">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-red-700 text-sm font-medium">{errors.fullName}</p>
                    </div>
                  )}
                </div>

                {/* Email */}
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
                    placeholder="Nhập địa chỉ email"
                    className={`rounded-lg border ${
                      errors.email && touched.email
                        ? 'border-red-500 focus:ring-red-500/20'
                        : 'border-gray-3 focus:ring-blue/20'
                    } bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2`}
                    required
                  />
                  {errors.email && touched.email && (
                    <div className="flex items-start gap-2 mt-2 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-md animate-shake">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-red-700 text-sm font-medium">{errors.email}</p>
                    </div>
                  )}
                </div>

                {/* Password */}
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
                    placeholder="Nhập mật khẩu (tối thiểu 12 ký tự)"
                    autoComplete="new-password"
                    className={`rounded-lg border ${
                      errors.password && touched.password
                        ? 'border-red-500 focus:ring-red-500/20'
                        : 'border-gray-3 focus:ring-blue/20'
                    } bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2`}
                    required
                  />
                  {/* Password strength indicator */}
                  {formData.password && (
                    <div className="mt-2">
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full transition-all duration-300"
                          style={{ 
                            width: `${passwordStrength}%`,
                            backgroundColor: getPasswordStrengthColor()
                          }}
                        />
                      </div>
                      <p className="text-xs text-dark-5 mt-1">
                        Độ mạnh: <span className="font-semibold">{getPasswordStrengthText()}</span>
                      </p>
                    </div>
                  )}
                  {errors.password && touched.password && (
                    <div className="flex items-start gap-2 mt-2 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-md animate-shake">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-red-700 text-sm font-medium">{errors.password}</p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
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
                    placeholder="Nhập lại mật khẩu"
                    autoComplete="new-password"
                    className={`rounded-lg border ${
                      errors.confirmPassword && touched.confirmPassword
                        ? 'border-red-500 focus:ring-red-500/20'
                        : 'border-gray-3 focus:ring-blue/20'
                    } bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2`}
                    required
                  />
                  {errors.confirmPassword && touched.confirmPassword && (
                    <div className="flex items-start gap-2 mt-2 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-md animate-shake">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-red-700 text-sm font-medium">{errors.confirmPassword}</p>
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div className="mb-5">
                  <label htmlFor="phone" className="block mb-2.5 font-medium">
                    Số điện thoại (Tùy chọn)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Nhập số điện thoại (10-11 số)"
                    className={`rounded-lg border ${
                      errors.phone && touched.phone
                        ? 'border-red-500 focus:ring-red-500/20'
                        : 'border-gray-3 focus:ring-blue/20'
                    } bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2`}
                  />
                  {errors.phone && touched.phone && (
                    <div className="flex items-start gap-2 mt-2 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-md animate-shake">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-red-700 text-sm font-medium">{errors.phone}</p>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center font-medium text-white bg-dark py-3 px-6 rounded-lg ease-out duration-200 hover:bg-blue disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                </button>

                <div className="relative mt-6 mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-3"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-body-color font-medium">Hoặc đăng ký với</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4.5">
                  <button
                    type="button"
                    onClick={handleGoogleSignup}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 border border-gray-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Đăng ký với Google</span>
                  </button>
                </div>

                <div className="text-center mt-6">
                  <p>
                    Đã có tài khoản?{" "}
                    <Link
                      href="/signin"
                      className="text-blue ease-out duration-200 hover:underline"
                    >
                      Đăng nhập ngay
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Signup;
