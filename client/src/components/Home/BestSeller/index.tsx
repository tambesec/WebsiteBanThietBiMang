"use client";
import React, { useState, useEffect } from "react";
import SingleItem from "./SingleItem";
import Image from "next/image";
import Link from "next/link";
import { productsApi } from "@/services/api";
import { Product, transformProduct } from "@/types/product";

const BestSeller = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Try to get best sellers first, fallback to featured products
        let data;
        try {
          data = await productsApi.getBestSellers(6);
        } catch {
          // If best-sellers endpoint doesn't exist, get featured products
          data = await productsApi.getFeatured(6);
        }
        
        // Transform backend data to frontend format
        const transformedProducts = Array.isArray(data) 
          ? data.map(transformProduct)
          : [];
        setProducts(transformedProducts);
      } catch (error) {
        console.error('Error fetching best sellers:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <section className="overflow-hidden">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue"></div>
          </div>
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

        {products.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Chưa có sản phẩm bán chạy
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7.5">
            {/* <!-- Bán chạy nhất item --> */}
            {products.map((item, key) => (
              <SingleItem item={item} key={key} />
            ))}
          </div>
        )}

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
