import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "NetTechPro - Thiết Bị Mạng Chuyên Nghiệp | Router, Switch, WiFi",
  description: "NetTechPro cung cấp thiết bị mạng chất lượng cao: Router, Switch, WiFi, Card mạng, Hub với giá tốt nhất. Giao hàng nhanh toàn quốc, hỗ trợ 24/7.",
  keywords: "thiết bị mạng, router, switch, wifi, card mạng, hub, modem, nettechpro",
  // other metadata
};

export default function HomePage() {
  return (
    <>
      <Home />
    </>
  );
}
