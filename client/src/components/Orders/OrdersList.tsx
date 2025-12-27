"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ordersApi } from "@/lib/api-client";

interface Order {
  id: number;
  order_number: string;
  created_at: string;
  total_amount: number;
  payment_status: string;
  status: {
    id: number;
    name: string;
    color?: string;
  };
}

const OrdersList = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.ordersControllerFindAll();
      setOrders(response.data.data?.orders || []);
    } catch (err: any) {
      console.error("Failed to fetch orders:", err);
      setError(err.response?.data?.message || "Không thể tải đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      shipping: "bg-purple-100 text-purple-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  const getPaymentStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      paid: "bg-green-100 text-green-800",
      unpaid: "bg-red-100 text-red-800",
      refunded: "bg-gray-100 text-gray-800",
    };
    return statusColors[status.toLowerCase()] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="py-20">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
          <div className="text-center">
            <p>Đang tải...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-800">{error}</p>
            <p className="mt-4 text-sm text-gray-600">
              Vui lòng{" "}
              <Link href="/signin" className="text-blue-600 hover:underline">
                đăng nhập
              </Link>{" "}
              để xem đơn hàng của bạn
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="py-20">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Bạn chưa có đơn hàng nào
            </h3>
            <p className="text-gray-600 mb-6">
              Hãy khám phá các sản phẩm tuyệt vời của chúng tôi
            </p>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center bg-blue text-white px-8 py-3 rounded-lg hover:bg-blue-dark transition"
            >
              Mua sắm ngay
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="py-20">
      <div className="max-w-[1170px] mx-auto px-4 sm:px-8 xl:px-0">
        <div className="grid gap-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="font-semibold text-lg text-gray-900">
                      Đơn hàng #{order.order_number}
                    </h3>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                        order.status.name
                      )}`}
                    >
                      {order.status.name}
                    </span>
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${getPaymentStatusColor(
                        order.payment_status
                      )}`}
                    >
                      {order.payment_status === "paid"
                        ? "Đã thanh toán"
                        : order.payment_status === "unpaid"
                        ? "Chưa thanh toán"
                        : "Đã hoàn tiền"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Ngày đặt: {formatDate(order.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600 mb-1">Tổng tiền</p>
                    <p className="text-xl font-bold text-blue">
                      {formatPrice(order.total_amount)}
                    </p>
                  </div>

                  <Link
                    href={`/orders/${order.id}`}
                    className="inline-flex items-center justify-center bg-blue text-white px-6 py-2.5 rounded-lg hover:bg-blue-dark transition text-sm font-medium"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default OrdersList;
