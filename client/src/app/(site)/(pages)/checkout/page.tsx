import React from "react";
import Checkout from "@/components/Checkout";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Thanh Toán - NetTechPro",
  description: "Hoàn tất thanh toán đơn hàng thiết bị mạng an toàn và nhanh chóng",
  // other metadata
};

const CheckoutPage = () => {
  return (
    <main>
      <Checkout />
    </main>
  );
};

export default CheckoutPage;
