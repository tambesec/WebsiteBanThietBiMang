import PageBreadcrumb from "@/components/common/PageBreadCrumb";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Trang Trống | NetTechPro Admin",
  description: "Trang Trống NetTechPro - Bảng Điều Khiển Quản Trị",
};

export default function BlankPage() {
  return (
    <div>
      <PageBreadcrumb pageTitle="Trang Trống" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full max-w-[630px] text-center">
          <h3 className="mb-4 font-semibold text-gray-800 text-theme-xl dark:text-white/90 sm:text-2xl">
            Tiêu Đề Thẻ Ở Đây
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-base">
            Bắt đầu đặt nội dung vào lưới hoặc bảng điều khiển, bạn cũng có thể sử dụng các
            kết hợp lưới khác nhau. Vui lòng kiểm tra bảng điều khiển và các trang khác
          </p>
        </div>
      </div>
    </div>
  );
}
