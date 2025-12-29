import VerifyEmail from "@/components/Auth/VerifyEmail";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Xác Thực Email | NetTechPro",
  description: "Xác thực địa chỉ email tài khoản NetTechPro của bạn",
};

export default function VerifyEmailPage() {
  return <VerifyEmail />;
}
