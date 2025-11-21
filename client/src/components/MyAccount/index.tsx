"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import AddressModal from "./AddressModal";
import Orders from "../Orders";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { authApi } from "@/services/api";

const MyAccount = () => {
  const { user, logout, isLoading, updateUser } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [addressModal, setAddressModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isLoading && !user) {
      router.push("/signin");
    }
  }, [user, isLoading, router]);

  // Update formData when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedUser = await updateUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
      });
      alert('Cập nhật thông tin thành công!');
    } catch (error: any) {
      alert(error.message || 'Có lỗi xảy ra khi cập nhật thông tin');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    
    if (passwordData.newPassword.length < 12) {
      alert('Mật khẩu mới phải có ít nhất 12 ký tự!');
      return;
    }

    try {
      await authApi.changePassword(passwordData.oldPassword, passwordData.newPassword);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      alert('Đổi mật khẩu thành công!');
    } catch (error: any) {
      alert(error.response?.data?.message || error.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", { month: "long", year: "numeric" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Breadcrumb title={"Tài Khoản Của Tôi"} pages={["Tài Khoản"]} />

      <section className="overflow-hidden py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/* User Profile Header Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden ring-4 ring-blue-100">
                  <Image src="/images/users/user-04.jpg" alt="user" width={96} height={96} className="object-cover" />
                </div>
                <button className="absolute bottom-0 right-0 bg-blue text-white p-2 rounded-full shadow-lg hover:bg-blue-dark transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
              
              <div className="flex-1 text-center sm:text-left">
                <h2 className="font-bold text-2xl sm:text-3xl text-dark mb-2">
                  {user.fullName || user.username || `${user.firstName} ${user.lastName}`.trim() || "Người dùng"}
                </h2>
                <p className="text-dark-5 mb-4">
                  Thành viên từ {user.createdAt ? formatDate(user.createdAt) : "Tháng 9, 2020"}
                </p>
                <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-full text-sm font-medium">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Email đã xác thực
                  </span>
                  {user.phone && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-sm font-medium">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      SĐT đã xác thực
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="Thông báo">
                  <svg className="w-5 h-5 text-dark-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors" title="Cài đặt">
                  <svg className="w-5 h-5 text-dark-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-col xl:flex-row gap-7.5">
            {/* Sidebar Menu */}
            <div className="xl:max-w-[320px] w-full">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden sticky top-20">
                <div className="p-6 bg-gradient-to-br from-blue to-blue-dark">
                  <h3 className="text-white font-semibold text-lg mb-2">Menu Điều Khiển</h3>
                  <p className="text-blue-100 text-sm">Quản lý tài khoản và đơn hàng</p>
                </div>

                <div className="p-4">
                  <nav className="flex flex-col gap-2">
                    <button
                      onClick={() => setActiveTab("dashboard")}
                      className={`flex items-center rounded-xl gap-3 py-3.5 px-4 font-medium transition-all duration-200 ${
                        activeTab === "dashboard"
                          ? "text-white bg-gradient-to-r from-blue to-blue-dark shadow-md"
                          : "text-dark-2 bg-gray-50 hover:bg-blue hover:text-white"
                      }`}
                    >
                      <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 20 20">
                        <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                      </svg>
                      Bảng Điều Khiển
                    </button>

                    <button
                      onClick={() => setActiveTab("orders")}
                      className={`flex items-center rounded-xl gap-3 py-3.5 px-4 font-medium transition-all duration-200 ${
                        activeTab === "orders"
                          ? "text-white bg-gradient-to-r from-blue to-blue-dark shadow-md"
                          : "text-dark-2 bg-gray-50 hover:bg-blue hover:text-white"
                      }`}
                    >
                      <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                      </svg>
                      Đơn Hàng
                    </button>

                    <button
                      onClick={() => setActiveTab("addresses")}
                      className={`flex items-center rounded-xl gap-3 py-3.5 px-4 font-medium transition-all duration-200 ${
                        activeTab === "addresses"
                          ? "text-white bg-gradient-to-r from-blue to-blue-dark shadow-md"
                          : "text-dark-2 bg-gray-50 hover:bg-blue hover:text-white"
                      }`}
                    >
                      <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Địa Chỉ
                    </button>

                    <button
                      onClick={() => setActiveTab("account-details")}
                      className={`flex items-center rounded-xl gap-3 py-3.5 px-4 font-medium transition-all duration-200 ${
                        activeTab === "account-details"
                          ? "text-white bg-gradient-to-r from-blue to-blue-dark shadow-md"
                          : "text-dark-2 bg-gray-50 hover:bg-blue hover:text-white"
                      }`}
                    >
                      <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Chi Tiết Tài Khoản
                    </button>

                    <div className="border-t border-gray-200 my-2"></div>

                    <button
                      onClick={handleLogout}
                      className="flex items-center rounded-xl gap-3 py-3.5 px-4 font-medium text-red-600 bg-red-50 hover:bg-red-100 transition-all duration-200"
                    >
                      <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4.414l-4.293 4.293a1 1 0 01-1.414 0L4 7.414 5.414 6l3.293 3.293L13.586 4.586 15 6z" clipRule="evenodd" />
                      </svg>
                      Đăng Xuất
                    </button>
                  </nav>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1">
              {/* Dashboard Tab */}
              {activeTab === "dashboard" && (
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-dark mb-2">
                      Xin chào {user.fullName || user.username || user.firstName || "bạn"}!
                    </h3>
                    <p className="text-dark-5">
                      Từ bảng điều khiển tài khoản, bạn có thể xem đơn hàng gần đây, quản lý địa chỉ giao hàng và thanh toán, 
                      cũng như chỉnh sửa mật khẩu và chi tiết tài khoản của mình.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-blue rounded-lg">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-3xl font-bold text-blue">24</span>
                      </div>
                      <h4 className="font-semibold text-dark mb-1">Tổng Đơn Hàng</h4>
                      <p className="text-sm text-dark-5">Tất cả các đơn hàng</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-green-500 rounded-lg">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-3xl font-bold text-green-600">18</span>
                      </div>
                      <h4 className="font-semibold text-dark mb-1">Hoàn Thành</h4>
                      <p className="text-sm text-dark-5">Đã giao thành công</p>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-6 border border-yellow-200">
                      <div className="flex items-center justify-between mb-4">
                        <div className="p-3 bg-yellow-500 rounded-lg">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-3xl font-bold text-yellow-600">6</span>
                      </div>
                      <h4 className="font-semibold text-dark mb-1">Đang Xử Lý</h4>
                      <p className="text-sm text-dark-5">Đang chuẩn bị hàng</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div className="bg-white rounded-2xl shadow-lg">
                  <Orders />
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === "addresses" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                      <h3 className="font-bold text-xl text-dark">Địa Chỉ Giao Hàng</h3>
                      <button
                        onClick={() => setAddressModal(true)}
                        className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5 text-blue" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-medium text-dark">
                            {user.fullName || user.username || `${user.firstName} ${user.lastName}`.trim() || "Người dùng"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <p className="text-dark-5">{user.email}</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <p className="text-dark-5">{user.phone || 'Chưa cập nhật'}</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-dark-5">{user.address || 'Chưa cập nhật địa chỉ giao hàng'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
                      <h3 className="font-bold text-xl text-dark">Địa Chỉ Thanh Toán</h3>
                      <button
                        onClick={() => setAddressModal(true)}
                        className="p-2 hover:bg-purple-100 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="font-medium text-dark">
                            {user.fullName || user.username || `${user.firstName} ${user.lastName}`.trim() || "Người dùng"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                          <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                        </svg>
                        <p className="text-dark-5">{user.email}</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        <p className="text-dark-5">{user.phone || 'Chưa cập nhật'}</p>
                      </div>
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        <p className="text-dark-5">{user.billingAddress || user.address || 'Chưa cập nhật địa chỉ thanh toán'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Details Tab */}
              {activeTab === "account-details" && (
                <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                  <h3 className="text-2xl font-bold text-dark mb-6">Chi Tiết Tài Khoản</h3>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block mb-2.5 font-medium text-dark">
                          Tên <span className="text-red">*</span>
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                          className="rounded-lg border border-gray-300 bg-gray-50 w-full py-3 px-4 outline-none transition-all focus:border-blue focus:ring-2 focus:ring-blue/20"
                        />
                      </div>
                      <div>
                        <label className="block mb-2.5 font-medium text-dark">
                          Họ <span className="text-red">*</span>
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                          className="rounded-lg border border-gray-300 bg-gray-50 w-full py-3 px-4 outline-none transition-all focus:border-blue focus:ring-2 focus:ring-blue/20"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2.5 font-medium text-dark">
                        Email <span className="text-red">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="rounded-lg border border-gray-300 bg-gray-50 w-full py-3 px-4 outline-none transition-all focus:border-blue focus:ring-2 focus:ring-blue/20"
                      />
                    </div>

                    <div>
                      <label className="block mb-2.5 font-medium text-dark">
                        Số điện thoại
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="rounded-lg border border-gray-300 bg-gray-50 w-full py-3 px-4 outline-none transition-all focus:border-blue focus:ring-2 focus:ring-blue/20"
                      />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 font-medium text-white bg-gradient-to-r from-blue to-blue-dark py-3 px-8 rounded-lg hover:shadow-lg transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Lưu Thay Đổi
                    </button>
                  </form>

                  <div className="border-t border-gray-200 my-8"></div>

                  <h3 className="text-2xl font-bold text-dark mb-6">Thay Đổi Mật Khẩu</h3>
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div>
                      <label className="block mb-2.5 font-medium text-dark">Mật khẩu cũ</label>
                      <input
                        type="password"
                        name="oldPassword"
                        value={passwordData.oldPassword}
                        onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
                        className="rounded-lg border border-gray-300 bg-gray-50 w-full py-3 px-4 outline-none transition-all focus:border-blue focus:ring-2 focus:ring-blue/20"
                      />
                    </div>
                    <div>
                      <label className="block mb-2.5 font-medium text-dark">Mật khẩu mới</label>
                      <input
                        type="password"
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="rounded-lg border border-gray-300 bg-gray-50 w-full py-3 px-4 outline-none transition-all focus:border-blue focus:ring-2 focus:ring-blue/20"
                      />
                      <p className="text-sm text-dark-5 mt-1">Mật khẩu phải có ít nhất 12 ký tự</p>
                    </div>
                    <div>
                      <label className="block mb-2.5 font-medium text-dark">Xác nhận mật khẩu mới</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                        className="rounded-lg border border-gray-300 bg-gray-50 w-full py-3 px-4 outline-none transition-all focus:border-blue focus:ring-2 focus:ring-blue/20"
                      />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 font-medium text-white bg-gradient-to-r from-blue to-blue-dark py-3 px-8 rounded-lg hover:shadow-lg transition-all duration-200"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                      Đổi Mật Khẩu
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <AddressModal isOpen={addressModal} closeModal={() => setAddressModal(false)} />
    </>
  );
};

export default MyAccount;
