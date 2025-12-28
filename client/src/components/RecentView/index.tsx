"use client";

import Breadcrumb from "@/components/Common/Breadcrumb";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface RecentProduct {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  slug: string;
  viewedAt: number;
}

const RecentView = () => {
  const [recentProducts, setRecentProducts] = useState<RecentProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Lấy danh sách sản phẩm đã xem từ localStorage
    const getRecentlyViewed = () => {
      try {
        const stored = localStorage.getItem('recentlyViewed');
        if (stored) {
          const products = JSON.parse(stored);
          // Sắp xếp theo thời gian xem (mới nhất trước)
          const sorted = products.sort((a: RecentProduct, b: RecentProduct) => b.viewedAt - a.viewedAt);
          
          // Sanitize image URLs - replace external URLs with local fallback
          const sanitized = sorted.map((p: RecentProduct) => {
            let imageUrl = p.image;
            if (imageUrl && (imageUrl.startsWith('http://') || imageUrl.startsWith('https://'))) {
              try {
                const url = new URL(imageUrl);
                // Only allow localhost
                if (!url.hostname.includes('localhost') && !url.hostname.includes('127.0.0.1')) {
                  imageUrl = '/images/products/product-01.png';
                }
              } catch {
                imageUrl = '/images/products/product-01.png';
              }
            }
            return { ...p, image: imageUrl };
          });
          
          setRecentProducts(sanitized);
        }
      } catch (error) {
        console.error('Error loading recently viewed products:', error);
      } finally {
        setLoading(false);
      }
    };

    getRecentlyViewed();
  }, []);

  const clearRecentlyViewed = () => {
    if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử xem sản phẩm?')) {
      localStorage.removeItem('recentlyViewed');
      setRecentProducts([]);
    }
  };

  const removeProduct = (productId: number) => {
    const updated = recentProducts.filter(p => p.id !== productId);
    setRecentProducts(updated);
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Vừa xem';
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString('vi-VN');
  };

  if (loading) {
    return (
      <>
        <Breadcrumb title="Đã Xem" pages={["Đã Xem"]} />
        <section className="overflow-hidden py-20 bg-gray-2">
          <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue"></div>
              <p className="mt-4 text-dark-4">Đang tải...</p>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <Breadcrumb title="Sản Phẩm Đã Xem" pages={["Đã Xem"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-xl shadow-1 p-4 sm:p-7.5 xl:p-11">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-semibold text-xl sm:text-2xl xl:text-heading-5 text-dark mb-1.5">
                  Sản Phẩm Đã Xem
                </h2>
                <p className="text-dark-4">
                  {recentProducts.length} sản phẩm trong lịch sử xem
                </p>
              </div>
              {recentProducts.length > 0 && (
                <button
                  onClick={clearRecentlyViewed}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                >
                  Xóa tất cả
                </button>
              )}
            </div>

            {recentProducts.length === 0 ? (
              <div className="text-center py-16">
                <svg
                  className="mx-auto h-24 w-24 text-gray-400 mb-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-dark mb-2">
                  Chưa có sản phẩm nào
                </h3>
                <p className="text-dark-4 mb-6">
                  Bạn chưa xem sản phẩm nào. Hãy khám phá cửa hàng của chúng tôi!
                </p>
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center px-6 py-3 bg-blue text-white rounded-lg hover:bg-blue/90 transition-colors"
                >
                  Khám phá sản phẩm
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {recentProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex flex-col sm:flex-row gap-4 p-4 border border-gray-3 rounded-lg hover:shadow-md transition-shadow"
                  >
                    <div className="relative w-full sm:w-32 h-32 flex-shrink-0 bg-gray-1 rounded-lg overflow-hidden">
                      <Image
                        src={product.image || '/images/products/product-01.png'}
                        alt={product.name}
                        fill
                        className="object-cover"
                        unoptimized
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/products/product-01.png';
                        }}
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <Link
                            href={`/shop/${product.slug}`}
                            className="font-semibold text-dark hover:text-blue transition-colors line-clamp-2"
                          >
                            {product.name}
                          </Link>
                          <button
                            onClick={() => removeProduct(product.id)}
                            className="flex-shrink-0 p-1 text-dark-4 hover:text-red-600 transition-colors"
                            title="Xóa khỏi lịch sử"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                        <p className="text-sm text-dark-4 mb-2">{product.category}</p>
                        <p className="text-lg font-semibold text-blue mb-1">
                          {formatPrice(product.price)}
                        </p>
                        <p className="text-xs text-dark-4">
                          Xem {formatDate(product.viewedAt)}
                        </p>
                      </div>
                      <div className="flex gap-3 mt-4">
                        <Link
                          href={`/shop/${product.slug}`}
                          className="inline-flex items-center justify-center px-4 py-2 bg-blue text-white text-sm rounded-lg hover:bg-blue/90 transition-colors"
                        >
                          Xem chi tiết
                        </Link>
                        <button
                          onClick={() => {
                            // TODO: Add to cart logic
                            alert('Chức năng thêm vào giỏ hàng đang được phát triển');
                          }}
                          className="inline-flex items-center justify-center px-4 py-2 border border-gray-3 text-dark text-sm rounded-lg hover:bg-gray-1 transition-colors"
                        >
                          Thêm vào giỏ
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default RecentView;
