import { Metadata } from "next";
import ProductsTable from "@/components/products/ProductsTable";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

export const metadata: Metadata = {
  title: "Quản Lý Sản Phẩm | NetTechPro Admin",
  description: "Quản lý danh sách sản phẩm thiết bị mạng",
};

export default function ProductsPage() {
  return (
    <>
      <PageBreadCrumb pageTitle="Quản Lý Sản Phẩm" />
      
      <div className="flex flex-col gap-6">
        <ProductsTable />
      </div>
    </>
  );
}
