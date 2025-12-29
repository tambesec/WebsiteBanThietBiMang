"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { axiosInstance } from '@/lib/api-client';
import type { Product } from "@/components/Shop/shopData";

const LatestProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLatestProducts = async () => {
      try {
        const response: any = await axiosInstance.get('/products', {
          params: { page: 1, limit: 3, sort_by: 'created_at', sort_order: 'desc' },
        });
        
        // Backend: { data: { products: [...], pagination: {...} } }
        const result = response.data?.data || response.data;
        const items = result?.products || [];
        if (!Array.isArray(items)) {
          console.error('Invalid response format:', response.data);
          return;
        }
        const mappedProducts: Product[] = items.map((p: any) => ({
          id: p.id,
          title: p.name,
          price: Number(p.compare_at_price) || Number(p.price) || 0,
          discountedPrice: Number(p.price) || 0,
          reviews: p.review_count || 0,
          imgs: {
            thumbnails: p.primary_image ? [p.primary_image] : ["/images/products/product-01.png"],
            previews: p.primary_image ? [p.primary_image] : ["/images/products/product-01.png"]
          }
        }));
        
        setProducts(mappedProducts);
      } catch (error) {
        console.error("Failed to load latest products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLatestProducts();
  }, []);

  if (loading) {
    return (
      <div className="shadow-1 bg-white rounded-xl mt-7.5">
        <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
          <h2 className="font-medium text-lg text-dark">Sản phẩm mới nhất</h2>
        </div>
        <div className="p-4 sm:p-6">
          <div className="text-center py-4">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="shadow-1 bg-white rounded-xl mt-7.5">
      <div className="px-4 sm:px-6 py-4.5 border-b border-gray-3">
        <h2 className="font-medium text-lg text-dark">Sản phẩm mới nhất</h2>
      </div>

      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-6">
          {/* <!-- product item --> */}
          {products.map((product, key) => (
            <div className="flex items-center gap-6" key={key}>
              <div className="flex items-center justify-center rounded-[10px] bg-gray-3 max-w-[90px] w-full h-22.5">
                <Image src={product.imgs?.thumbnails?.[0] || "/images/products/product-01.png"} alt="product" width={74} height={74} />
              </div>

              <div>
                <h3 className="font-medium text-dark mb-1 ease-out duration-200 hover:text-blue">
                  <Link href={`/shop-details/${product.id}`}> {product.title} </Link>
                </h3>
                <p className="text-custom-sm">Giá: {product.price.toLocaleString('vi-VN')}đ</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LatestProducts;
