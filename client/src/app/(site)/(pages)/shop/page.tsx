import React, { Suspense } from "react";
import ShopWithSidebar from "@/components/ShopWithSidebar";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Cửa Hàng - NetTechPro | Thiết Bị Mạng Chuyên Nghiệp",
  description: "Khám phá bộ sưu tập thiết bị mạng đa dạng tại NetTechPro: Router, Switch, WiFi, Card mạng với giá tốt nhất",
  // other metadata
};

// Loading skeleton for shop content
function ShopLoading() {
  return (
    <div className="py-10">
      <div className="max-w-[1170px] mx-auto px-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7.5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="h-[270px] bg-gray-200 rounded-lg"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const ShopWithSidebarPage = () => {
  return (
    <main>
      <Suspense fallback={<ShopLoading />}>
        <ShopWithSidebar />
      </Suspense>
    </main>
  );
};

export default ShopWithSidebarPage;
