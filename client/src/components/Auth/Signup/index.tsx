"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { authApi } from "@/services/api";

const Signup = () => {
  const router = useRouter();
  const { register, loginWithGoogle } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [errors, setErrors] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    general: "",
  });
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
    phone: false,
  });
  const [passwordStrength, setPasswordStrength] = useState(0);

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

  const validateUsername = (username: string): string => {
    if (!username.trim()) return "Tên đăng nhập không được để trống";
    if (username.length < 3) return "Tên đăng nhập phải có ít nhất 3 ký tự";
    if (username.length > 30) return "Tên đăng nhập không được quá 30 ký tự";
    if (!/^[a-zA-Z0-9_]+$/.test(username)) return "Tên đăng nhập chỉ chứa chữ, số và dấu gạch dưới";
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
        case 'username':
          fieldError = validateUsername(value);
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
      case 'username':
        fieldError = validateUsername(value);
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
    const usernameError = validateUsername(formData.username);
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(formData.password, formData.confirmPassword);
    const phoneError = validatePhone(formData.phone);

    if (usernameError || emailError || passwordError || confirmPasswordError || phoneError) {
      setErrors({
        username: usernameError,
        email: emailError,
        password: passwordError,
        confirmPassword: confirmPasswordError,
        phone: phoneError,
        general: "",
      });
      setTouched({
        username: true,
        email: true,
        password: true,
        confirmPassword: true,
        phone: true,
      });
      return;
    }

    setLoading(true);
    setErrors({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      general: "",
    });

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
      });
      // Redirect after successful registration
      setTimeout(() => {
        router.push('/');
      }, 100);
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
          username: "",
          email: "Email này đã được sử dụng",
          password: "",
          confirmPassword: "",
          phone: "",
          general: "",
        });
      } else if (errorMessage.toLowerCase().includes('username') && 
                 (errorMessage.includes('đã tồn tại') || errorMessage.includes('already exists') || errorMessage.includes('taken'))) {
        setErrors({
          username: "Tên đăng nhập này đã được sử dụng",
          email: "",
          password: "",
          confirmPassword: "",
          phone: "",
          general: "",
        });
      } else if (errorMessage.toLowerCase().includes('password') ||
                 errorMessage.toLowerCase().includes('mật khẩu')) {
        setErrors({
          username: "",
          email: "",
          password: errorMessage,
          confirmPassword: "",
          phone: "",
          general: "",
        });
      } else {
        setErrors({
          username: "",
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

  const handleGoogleSignup = async (credentialResponse: CredentialResponse) => {
    if (!credentialResponse.credential) {
      setErrors({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        general: "Không nhận được token từ Google",
      });
      return;
    }

    try {
      setLoading(true);
      setErrors({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        general: "",
      });
      
      console.log('Sending Google credential to backend...');
      
      // Use loginWithGoogle from AuthContext
      await loginWithGoogle(credentialResponse.credential);
      
      console.log('Google signup successful, redirecting...');
      
      // Redirect to home
      router.push('/');
    } catch (error: any) {
      console.error('Google signup failed:', error);
      console.error('Error details:', error.response?.data);
      
      const errorMsg = error.message ||
                      error.response?.data?.message || 
                      "Đăng ký Google thất bại. Vui lòng thử lại.";
      
      setErrors({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        general: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setErrors({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      general: "Đăng ký Google thất bại. Vui lòng thử lại.",
    });
  };

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
                Mật khẩu phải có ít nhất 12 ký tự bao gồm: chữ hoa, chữ thường, số và ký tự đặc biệt
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

                {/* Username */}
                <div className="mb-5">
                  <label htmlFor="username" className="block mb-2.5 font-medium">
                    Tên đăng nhập <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="username"
                    id="username"
                    value={formData.username}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder="Nhập tên đăng nhập (3-30 ký tự)"
                    className={`rounded-lg border ${
                      errors.username && touched.username
                        ? 'border-red-500 focus:ring-red-500/20'
                        : 'border-gray-3 focus:ring-blue/20'
                    } bg-gray-1 placeholder:text-dark-5 w-full py-3 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2`}
                    required
                  />
                  {errors.username && touched.username && (
                    <div className="flex items-start gap-2 mt-2 p-3 bg-red-50 border-l-4 border-red-500 rounded-r-md animate-shake">
                      <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-red-700 text-sm font-medium">{errors.username}</p>
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
                  <div className="w-full flex justify-center">
                    <GoogleLogin
                      onSuccess={handleGoogleSignup}
                      onError={handleGoogleError}
                      theme="outline"
                      size="large"
                      text="signup_with"
                      width="100%"
                      useOneTap={false}
                      shape="rectangular"
                      logo_alignment="left"
                    />
                  </div>
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
