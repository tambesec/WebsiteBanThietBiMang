"use client";
import React from "react";
import Breadcrumb from "../Common/Breadcrumb";
import { useAppSelector, useAppDispatch } from "@/redux/store";
import { removeAllItemsFromWishlist } from "@/redux/features/wishlist-slice";
import SingleItem from "./SingleItem";
import Link from "next/link";

export const Wishlist = () => {
  const dispatch = useAppDispatch();
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);

  const handleClearAll = () => {
    if (confirm("Bạn có chắc muốn xóa tất cả sản phẩm khỏi danh sách yêu thích?")) {
      dispatch(removeAllItemsFromWishlist());
    }
  };

  return (
    <>
      <Breadcrumb title={"Danh Sách Yêu Thích"} pages={["Danh Sách Yêu Thích"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
            <h2 className="font-medium text-dark text-2xl">
              Danh Sách Yêu Thích Của Bạn ({wishlistItems.length} sản phẩm)
            </h2>
            {wishlistItems.length > 0 && (
              <button 
                onClick={handleClearAll}
                className="text-red hover:text-red-dark transition-colors"
              >
                Xóa Tất Cả
              </button>
            )}
          </div>

          {wishlistItems.length === 0 ? (
            <div className="bg-white rounded-[10px] shadow-1 p-10 text-center">
              <div className="flex justify-center mb-6">
                <svg
                  className="text-gray-4"
                  width="80"
                  height="80"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium text-dark mb-3">
                Danh sách yêu thích trống
              </h3>
              <p className="text-gray-5 mb-6">
                Bạn chưa thêm sản phẩm nào vào danh sách yêu thích. Hãy khám phá cửa hàng!
              </p>
              <Link 
                href="/shop"
                className="inline-flex bg-blue text-white py-3 px-6 rounded-md hover:bg-blue-dark transition-colors"
              >
                Khám Phá Sản Phẩm
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-[10px] shadow-1">
              <div className="w-full overflow-x-auto">
                <div className="min-w-[1170px]">
                  {/* <!-- table header --> */}
                  <div className="flex items-center py-5.5 px-10 border-b border-gray-3">
                    <div className="min-w-[83px]"></div>
                    <div className="min-w-[387px]">
                      <p className="text-dark font-medium">Sản Phẩm</p>
                    </div>

                    <div className="min-w-[205px]">
                      <p className="text-dark font-medium">Đơn Giá</p>
                    </div>

                    <div className="min-w-[265px]">
                      <p className="text-dark font-medium">Tình Trạng</p>
                    </div>

                    <div className="min-w-[150px]">
                      <p className="text-dark font-medium text-right">Hành Động</p>
                    </div>
                  </div>

                  {/* <!-- wish item --> */}
                  {wishlistItems.map((item, key) => (
                    <SingleItem item={item} key={key} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};
