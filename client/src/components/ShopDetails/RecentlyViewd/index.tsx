"use client";
import React, { useState, useEffect } from "react";
import ProductItem from "@/components/Common/ProductItem";
import Image from "next/image";
import { productsApi } from "@/lib/api-client";
import type { Product } from "@/components/Shop/shopData";

import { Swiper, SwiperSlide } from "swiper/react";
import { useCallback, useRef } from "react";
import "swiper/css/navigation";
import "swiper/css";

const RecentlyViewdItems = () => {
  const sliderRef = useRef(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        const response: any = await productsApi.productsControllerFindAll(
          1, // page
          4, // limit
          undefined, // search
          undefined, // category_id
          undefined, // min_price
          undefined, // max_price
          undefined, // brand
          'created_at', // sort_by
          'desc' // sort_order
        );
        
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
        console.error("Failed to load products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentProducts();
  }, []);

  const handlePrev = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slidePrev();
  }, []);

  const handleNext = useCallback(() => {
    if (!sliderRef.current) return;
    sliderRef.current.swiper.slideNext();
  }, []);

  if (loading) {
    return (
      <section className="overflow-hidden pt-17.5">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-15 border-b border-gray-3">
          <div className="text-center py-10">Đang tải...</div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden pt-17.5">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 pb-15 border-b border-gray-3">
        <div className="swiper categories-carousel common-carousel">
          {/* <!-- section title --> */}
          <div className="mb-10 flex items-center justify-between">
            <div>
              <span className="flex items-center gap-2.5 font-medium text-dark mb-1.5">
                <Image
                  src="/images/icons/icon-05.svg"
                  width={17}
                  height={17}
                  alt="icon"
                />
                Categories
              </span>
              <h2 className="font-semibold text-xl xl:text-heading-5 text-dark">
                Danh mục sản phẩm
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={handlePrev} className="swiper-button-prev">
                <svg
                  className="fill-current"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M15.4881 4.43057C15.8026 4.70014 15.839 5.17361 15.5694 5.48811L9.98781 12L15.5694 18.5119C15.839 18.8264 15.8026 19.2999 15.4881 19.5695C15.1736 19.839 14.7001 19.8026 14.4306 19.4881L8.43056 12.4881C8.18981 12.2072 8.18981 11.7928 8.43056 11.5119L14.4306 4.51192C14.7001 4.19743 15.1736 4.161 15.4881 4.43057Z"
                    fill=""
                  />
                </svg>
              </button>

              <button onClick={handleNext} className="swiper-button-next">
                <svg
                  className="fill-current"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M8.51192 4.43057C8.82641 4.161 9.29989 4.19743 9.56946 4.51192L15.5695 11.5119C15.8102 11.7928 15.8102 12.2072 15.5695 12.4881L9.56946 19.4881C9.29989 19.8026 8.82641 19.839 8.51192 19.5695C8.19743 19.2999 8.161 18.8264 8.43057 18.5119L14.0122 12L8.43057 5.48811C8.161 5.17361 8.19743 4.70014 8.51192 4.43057Z"
                    fill=""
                  />
                </svg>
              </button>
            </div>
          </div>

          <Swiper
            ref={sliderRef}
            slidesPerView={4}
            spaceBetween={20}
            className="justify-between"
          >
            {products.map((item, key) => (
              <SwiperSlide key={key}>
                <ProductItem item={item} />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewdItems;
