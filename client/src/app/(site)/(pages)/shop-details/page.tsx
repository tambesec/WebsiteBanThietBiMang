import React from "react";
import ShopDetails from "@/components/ShopDetails";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chi Tiết Sản Phẩm - NetTechPro | Thiết Bị Mạng",
  description: "Xem thông tin chi tiết sản phẩm thiết bị mạng chất lượng cao tại NetTechPro",
  // other metadata
};

const ShopDetailsPage = () => {
  return (
    <main>
      <ShopDetails />
    </main>
  );
};

export default ShopDetailsPage;
