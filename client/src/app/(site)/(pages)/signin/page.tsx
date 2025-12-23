import Signin from "@/components/Auth/Signin";
import React from "react";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Đăng Nhập - NetTechPro",
  description: "Đăng nhập vào tài khoản NetTechPro để quản lý đơn hàng và nhận ưu đãi đặc biệt",
  // other metadata
};

const SigninPage = () => {
  return (
    <main>
      <Signin />
    </main>
  );
};

export default SigninPage;
