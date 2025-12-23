import { Metadata } from "next";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import ProductForm from "@/components/ecommerce/ProductForm";

export const metadata: Metadata = {
  title: "Thêm Sản Phẩm | NetTechPro Admin",
  description: "Thêm sản phẩm mới vào hệ thống",
};

export default function AddProductPage() {
  return (
    <>
      <PageBreadCrumb pageTitle="Thêm Sản Phẩm Mới" />
      
      <div className="flex flex-col gap-6">
        <ProductForm mode="add" />
      </div>
    </>
  );
}
