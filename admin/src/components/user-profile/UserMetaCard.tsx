"use client";
import React, { useState, useEffect } from "react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { useModal } from "../../hooks/useModal";
import { Modal } from "../ui/modal";
import Button from "../ui/button/Button";
import Input from "../form/input/InputField";
import Label from "../form/Label";
import Image from "next/image";

export default function UserMetaCard() {
  const { user } = useAdminAuth();
  const { isOpen, openModal, closeModal } = useModal();
  
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form data when modal opens or user changes
  useEffect(() => {
    if (isOpen && user) {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
      });
      setError(null);
    }
  }, [isOpen, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('admin_token');
      if (!token) {
        throw new Error('Không tìm thấy token xác thực');
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/admin/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Không thể cập nhật profile');
      }

      const result = await response.json();
      console.log('Profile updated successfully:', result);
      
      // Show success message
      alert('✅ Cập nhật thông tin thành công!');
      
      // Close modal and reload to refresh user data
      closeModal();
      window.location.reload();
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Đã xảy ra lỗi khi cập nhật profile');
    } finally {
      setLoading(false);
    }
  };

  // Generate initials from full_name for avatar
  const getInitials = (name: string | undefined) => {
    if (!name) return 'AD';
    const words = name.trim().split(' ');
    if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const initials = getInitials(user?.full_name);

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            {/* Avatar with Initials */}
            <div className="w-20 h-20 flex items-center justify-center border border-gray-200 rounded-full dark:border-gray-800 bg-gradient-to-br from-blue-500 to-blue-600 text-white text-2xl font-bold">
              {initials}
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {user?.full_name || 'Chưa cập nhật tên'}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user?.email || 'admin@networkstore.com'}
                </p>
              </div>
            </div>
          </div>
          <button
            onClick={openModal}
            className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
          >
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.0911 2.78206C14.2125 1.90338 12.7878 1.90338 11.9092 2.78206L4.57524 10.116C4.26682 10.4244 4.0547 10.8158 3.96468 11.2426L3.31231 14.3352C3.25997 14.5833 3.33653 14.841 3.51583 15.0203C3.69512 15.1996 3.95286 15.2761 4.20096 15.2238L7.29355 14.5714C7.72031 14.4814 8.11172 14.2693 8.42013 13.9609L15.7541 6.62695C16.6327 5.74827 16.6327 4.32365 15.7541 3.44497L15.0911 2.78206ZM12.9698 3.84272C13.2627 3.54982 13.7376 3.54982 14.0305 3.84272L14.6934 4.50563C14.9863 4.79852 14.9863 5.2734 14.6934 5.56629L14.044 6.21573L12.3204 4.49215L12.9698 3.84272ZM11.2597 5.55281L5.6359 11.1766C5.53309 11.2794 5.46238 11.4099 5.43238 11.5522L5.01758 13.5185L6.98394 13.1037C7.1262 13.0737 7.25666 13.003 7.35947 12.9002L12.9833 7.27639L11.2597 5.55281Z"
                fill=""
              />
            </svg>
            Chỉnh sửa
          </button>
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={closeModal} className="max-w-[700px] m-4">
        <div className="no-scrollbar relative w-full max-w-[700px] overflow-y-auto rounded-3xl bg-white p-4 dark:bg-gray-900 lg:p-11">
          <div className="px-2 pr-14">
            <h4 className="mb-2 text-2xl font-semibold text-gray-800 dark:text-white/90">
              Cập Nhật Thông Tin Cá Nhân
            </h4>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Chỉ có thể cập nhật họ tên và số điện thoại. Email và vai trò được bảo vệ vì lý do bảo mật.
            </p>
          </div>
          <form className="flex flex-col" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
            <div className="custom-scrollbar h-[450px] overflow-y-auto px-2 pb-3">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                  <strong>⚠️ Lỗi:</strong> {error}
                </div>
              )}
              
              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Thông tin được phép cập nhật
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2">
                    <Label>Họ tên đầy đủ <span className="text-red-500">*</span></Label>
                    <Input 
                      type="text" 
                      name="full_name"
                      value={formData.full_name} 
                      onChange={handleInputChange}
                      placeholder="Nhập họ tên đầy đủ"
                      minLength={2}
                      maxLength={150}
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      2-150 ký tự
                    </p>
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <Label>Số điện thoại</Label>
                    <Input 
                      type="text" 
                      name="phone"
                      value={formData.phone} 
                      onChange={handleInputChange}
                      placeholder="Nhập số điện thoại (10-20 chữ số)"
                      pattern="[0-9]{10,20}"
                      title="Số điện thoại phải có 10-20 chữ số"
                    />
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      10-20 chữ số
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-7">
                <h5 className="mb-5 text-lg font-medium text-gray-800 dark:text-white/90 lg:mb-6">
                  Thông tin tài khoản (Chỉ xem)
                </h5>

                <div className="grid grid-cols-1 gap-x-6 gap-y-5 lg:grid-cols-2">
                  <div className="col-span-2 lg:col-span-1">
                    <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                      Địa chỉ Email 🔒
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {user?.email || '—'}
                    </p>
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                      Email không thể thay đổi (định danh xác thực)
                    </p>
                  </div>

                  <div className="col-span-2 lg:col-span-1">
                    <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                      Vai trò 🔒
                    </p>
                    <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                      {user?.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                    </p>
                    <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">
                      Vai trò không thể tự thay đổi
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 mt-6 lg:justify-end">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={closeModal}
                type="button"
                disabled={loading}
              >
                Hủy
              </Button>
              <Button 
                size="sm" 
                type="submit"
                disabled={loading}
              >
                {loading ? '⏳ Đang lưu...' : '💾 Lưu thay đổi'}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}
