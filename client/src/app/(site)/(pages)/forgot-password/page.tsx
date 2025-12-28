import ForgotPassword from "@/components/Auth/ForgotPassword";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quên Mật Khẩu | NetTechPro",
  description: "Đặt lại mật khẩu tài khoản NetTechPro của bạn",
};

export default function ForgotPasswordPage() {
  return <ForgotPassword />;
}
