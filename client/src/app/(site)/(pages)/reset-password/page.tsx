import ResetPassword from "@/components/Auth/ResetPassword";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đặt Lại Mật Khẩu | NetTechPro",
  description: "Đặt lại mật khẩu tài khoản NetTechPro của bạn",
};

export default function ResetPasswordPage() {
  return <ResetPassword />;
}
