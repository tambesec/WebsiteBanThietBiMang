import { Metadata } from "next";
import OrderDetail from "@/components/ecommerce/OrderDetail";

export const metadata: Metadata = {
  title: "Chi Tiết Đơn Hàng | NetTechPro Admin",
  description: "Xem và quản lý chi tiết đơn hàng",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-black dark:text-white">
          Chi Tiết Đơn Hàng
        </h2>
      </div>
      
      <OrderDetail orderId={id} />
    </>
  );
}
