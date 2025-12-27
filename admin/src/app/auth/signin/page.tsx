import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Đăng Nhập - NetTechPro Admin",
  description: "Trang đăng nhập vào hệ thống quản trị NetTechPro",
};

export default function SignIn() {
  return <SignInForm />;
}
