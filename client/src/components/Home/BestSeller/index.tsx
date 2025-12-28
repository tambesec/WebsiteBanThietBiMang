"use client";
import React, { useState, useEffect } from "react";
import SingleItem from "./SingleItem";
import Image from "next/image";
import Link from "next/link";
import { axiosInstance } from '@/lib/api-client';
import type { Product } from "@/components/Shop/shopData";

const BestSeller = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        const response: any = await axiosInstance.get('/products', {
          params: { page: 1, limit: 6, sort_by: 'created_at', sort_order: 'desc' },
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
        console.error("Failed to load best sellers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  if (loading) {
    return (
      <section className="overflow-hidden">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="text-center py-10">Đang tải...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        {/* <!-- section title --> */}
        <div className="mb-10 flex items-center justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
              <Image
                src="/images/icons/icon-07.svg"
                alt="icon"
                width={17}
                height={17}
              />
              Tháng này
            </span>
            <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
              Bán chạy nhất
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7.5">
          {/* <!-- Bán chạy nhất item --> */}
          {products.map((item, key) => (
            <SingleItem item={item} key={key} />
          ))}
        </div>

        <div className="text-center mt-12.5">
          <Link
            href="/shop"
            className="inline-flex font-medium text-custom-sm py-3 px-7 sm:px-12.5 rounded-md border-gray-3 border bg-gray-1 text-dark ease-out duration-200 hover:bg-dark hover:text-white hover:border-transparent"
          >
            Xem tất cả
          </Link>
        </div>
      </div>
    </section>
  );
};

export default BestSeller;
