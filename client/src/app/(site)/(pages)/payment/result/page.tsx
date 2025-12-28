"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Breadcrumb from "@/components/Common/Breadcrumb";

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const orderId = searchParams.get("orderId");
  const status = searchParams.get("status");
  const transId = searchParams.get("transId");
  const message = searchParams.get("message");
  
  const isSuccess = status === "success";
  
  const [countdown, setCountdown] = useState(10);
  
  useEffect(() => {
    if (isSuccess) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push("/orders");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [isSuccess, router]);

  return (
    <>
      <Breadcrumb
        title={isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại"}
        pages={["Trang chủ", "Kết quả thanh toán"]}
      />

      <section className="overflow-hidden pb-25 pt-17.5">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-white rounded-xl shadow-1 p-8 md:p-12 max-w-2xl mx-auto text-center">
            {isSuccess ? (
              <>
                {/* Success Icon */}
                <div className="w-24 h-24 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-green-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-dark mb-4">
                  Thanh toán thành công!
                </h2>
                
                <p className="text-gray-600 mb-6">
                  Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đang được xử lý.
                </p>

                <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-500 text-sm">Mã đơn hàng</p>
                      <p className="font-semibold text-dark">#{orderId}</p>
                    </div>
                    {transId && (
                      <div>
                        <p className="text-gray-500 text-sm">Mã giao dịch MoMo</p>
                        <p className="font-semibold text-dark">{transId}</p>
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-sm text-gray-500 mb-6">
                  Tự động chuyển đến trang đơn hàng sau {countdown} giây...
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/orders"
                    className="inline-flex items-center justify-center bg-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-dark transition"
                  >
                    Xem đơn hàng
                  </Link>
                  <Link
                    href="/shop"
                    className="inline-flex items-center justify-center border border-gray-300 text-dark px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    Tiếp tục mua sắm
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Error Icon */}
                <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                  <svg
                    className="w-12 h-12 text-red-500"
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
                </div>

                <h2 className="text-2xl font-bold text-dark mb-4">
                  Thanh toán thất bại
                </h2>
                
                <p className="text-gray-600 mb-4">
                  Rất tiếc, giao dịch của bạn không thành công.
                </p>

                {message && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-600 text-sm">
                      Lý do: {decodeURIComponent(message)}
                    </p>
                  </div>
                )}

                {orderId && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-6">
                    <p className="text-gray-500 text-sm">Mã đơn hàng</p>
                    <p className="font-semibold text-dark">#{orderId}</p>
                  </div>
                )}

                <p className="text-sm text-gray-500 mb-6">
                  Đơn hàng của bạn đã được tạo nhưng chưa thanh toán. Bạn có thể thử thanh toán lại hoặc chọn phương thức thanh toán khác.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/orders"
                    className="inline-flex items-center justify-center bg-blue text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-dark transition"
                  >
                    Xem đơn hàng
                  </Link>
                  <Link
                    href="/checkout"
                    className="inline-flex items-center justify-center border border-gray-300 text-dark px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition"
                  >
                    Thử lại
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue"></div>
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
