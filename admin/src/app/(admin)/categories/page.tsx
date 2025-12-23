import { Metadata } from "next";
import CategoriesTable from "@/components/categories/CategoriesTable";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";

export const metadata: Metadata = {
  title: "Quản Lý Danh Mục | NetTechPro Admin",
  description: "Quản lý danh mục sản phẩm thiết bị mạng",
};

export default function CategoriesPage() {
  return (
    <>
      <PageBreadCrumb pageTitle="Quản Lý Danh Mục" />
      
      <div className="flex flex-col gap-6">
        <CategoriesTable />
      </div>
    </>
  );
}
