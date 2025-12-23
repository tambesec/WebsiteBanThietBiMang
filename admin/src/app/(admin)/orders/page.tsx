import { Metadata } from "next";
import OrdersTable from "@/components/ecommerce/OrdersTable";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

export const metadata: Metadata = {
  title: "Quản Lý Đơn Hàng | NetTechPro Admin",
  description: "Quản lý đơn hàng và theo dõi giao dịch",
};

export default function OrdersPage() {
  return (
    <>
      <PageBreadCrumb pageTitle="Quản Lý Đơn Hàng" />
      
      <div className="flex flex-col gap-6">
        <OrdersTable />
      </div>
    </>
  );
}
