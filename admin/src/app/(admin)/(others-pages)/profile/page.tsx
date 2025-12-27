import UserMetaCard from "@/components/user-profile/UserMetaCard";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Hồ Sơ Admin | Network Store",
  description: "Trang quản lý thông tin cá nhân của quản trị viên Network Store",
};

export default function Profile() {
  return (
    <div>
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] lg:p-6">
        <h3 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
          Hồ Sơ Cá Nhân
        </h3>
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg dark:bg-blue-900/20 dark:border-blue-800">
          <p className="text-sm text-blue-700 dark:text-blue-400">
            <strong>Lưu ý bảo mật:</strong> Bạn chỉ có thể cập nhật tên và số điện thoại. 
            Email và vai trò không thể thay đổi vì lý do bảo mật.
          </p>
        </div>
        <div className="space-y-6">
          <UserMetaCard />
        </div>
      </div>
    </div>
  );
}
