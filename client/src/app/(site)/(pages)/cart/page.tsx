import React from "react";
import Cart from "@/components/Cart";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Giỏ Hàng - NetTechPro",
  description: "Xem giỏ hàng và hoàn tất đơn đặt hàng thiết bị mạng tại NetTechPro",
  // other metadata
};

const CartPage = () => {
  return (
    <>
      <Cart />
    </>
  );
};

export default CartPage;
