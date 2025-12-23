import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng Ký - NetTechPro Admin",
  description: "Trang đăng ký tài khoản hệ thống quản trị NetTechPro",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
