import Signup from "@/components/Auth/Signup";
import React from "react";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Đăng Ký - NetTechPro",
  description: "Tạo tài khoản NetTechPro để nhận ưu đãi và trải nghiệm mua sắm tốt nhất",
  // other metadata
};

const SignupPage = () => {
  return (
    <main>
      <Signup />
    </main>
  );
};

export default SignupPage;
