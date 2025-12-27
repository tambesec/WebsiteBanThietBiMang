import { Metadata } from "next";
import PageBreadCrumb from "@/components/common/PageBreadCrumb";
import ProductForm from "@/components/ecommerce/ProductForm";
import { productsApi } from "@/lib/api-client";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Chỉnh Sửa Sản Phẩm | NetTechPro Admin",
  description: "Chỉnh sửa thông tin sản phẩm",
};

export default async function EditProductPage({ params }: { params: { id: string } }) {
  // Next.js 15 requires awaiting params
  const { id } = await params;
  let productData = null;

  try {
    const response = await productsApi.productsControllerFindOne(Number(id));
    productData = response.data.data;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    notFound();
  }

  if (!productData) {
    notFound();
  }

  return (
    <>
      <PageBreadCrumb pageTitle="Chỉnh Sửa Sản Phẩm" />
      
      <div className="flex flex-col gap-6">
        <ProductForm mode="edit" productData={productData} />
      </div>
    </>
  );
}
