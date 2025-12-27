import React from "react";
import OrdersList from "@/components/Orders/OrdersList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đơn Hàng Của Tôi | NetTechPro",
  description: "Xem và quản lý đơn hàng của bạn tại NetTechPro",
};

export default function OrdersPage() {
  return (
    <>
      <section className="bg-gray-2 py-7.5">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex items-center gap-2">
            <a href="/" className="text-gray-600 hover:text-blue">Trang chủ</a>
            <span className="text-gray-400">/</span>
            <span className="text-gray-900 font-medium">Đơn Hàng Của Tôi</span>
          </div>
        </div>
      </section>
      <OrdersList />
    </>
  );
}
