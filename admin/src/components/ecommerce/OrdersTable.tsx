"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { adminOrdersApi, Order } from "@/services/api";

const OrdersTable = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "pending", label: "Chờ xác nhận" },
    { value: "processing", label: "Đang xử lý" },
    { value: "shipping", label: "Đang giao" },
    { value: "completed", label: "Hoàn thành" },
    { value: "cancelled", label: "Đã hủy" },
  ];

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await adminOrdersApi.getAll({
          page,
          limit: 10,
          search: searchTerm || undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined,
        });
        setOrders(response.data);
        setTotalPages(response.pagination.totalPages);
      } catch (err: any) {
        console.error('Failed to fetch orders:', err);
        setError(err.message || 'Không thể tải danh sách đơn hàng');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [page, searchTerm, filterStatus]);

  // Filter orders locally
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user?.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      pending: {
        bg: "bg-warning bg-opacity-10",
        text: "text-warning",
        label: "Chờ xác nhận",
      },
      processing: {
        bg: "bg-primary bg-opacity-10",
        text: "text-primary",
        label: "Đang xử lý",
      },
      shipping: {
        bg: "bg-blue-500 bg-opacity-10",
        text: "text-blue-500",
        label: "Đang giao",
      },
      completed: {
        bg: "bg-success bg-opacity-10",
        text: "text-success",
        label: "Hoàn thành",
      },
      cancelled: {
        bg: "bg-danger bg-opacity-10",
        text: "text-danger",
        label: "Đã hủy",
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span
        className={`inline-flex rounded-full ${config.bg} px-3 py-1 text-sm font-medium ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const getPaymentBadge = (method: string) => {
    const methodConfig: Record<string, { label: string; color: string }> = {
      COD: { label: "Tiền mặt", color: "bg-gray-500" },
      vnpay: { label: "VNPay", color: "bg-blue-500" },
      momo: { label: "MoMo", color: "bg-pink-500" },
      zalopay: { label: "ZaloPay", color: "bg-blue-400" },
    };

    const config = methodConfig[method] || { label: method, color: "bg-gray-500" };
    return (
      <span
        className={`inline-flex rounded-full ${config.color} px-2.5 py-0.5 text-xs font-medium text-white`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* Header */}
      <div className="flex flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-6 xl:px-7.5">
        <div className="flex items-center gap-3">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Danh Sách Đơn Hàng
          </h4>
          <span className="inline-flex items-center justify-center rounded-full bg-primary px-2.5 py-0.5 text-sm font-medium text-white">
            {filteredOrders.length}
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm đơn hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-stroke bg-transparent py-2 pl-10 pr-4 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg
                className="fill-body"
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z"
                  fill=""
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z"
                  fill=""
                />
              </svg>
            </span>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Export Button */}
          <button className="inline-flex items-center justify-center gap-2 rounded-md border border-stroke px-6 py-2 text-center font-medium hover:shadow-1 dark:border-strokedark">
            <svg
              className="fill-current"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.5 10.5V13.5H2.5V10.5H0.5V13.5C0.5 14.6 1.4 15.5 2.5 15.5H13.5C14.6 15.5 15.5 14.6 15.5 13.5V10.5H13.5Z"
                fill=""
              />
              <path d="M8 11.5L11.5 8L10.09 6.59L9 7.67V0.5H7V7.67L5.91 6.59L4.5 8L8 11.5Z" fill="" />
            </svg>
            Xuất
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                Mã đơn hàng
              </th>
              <th className="min-w-[200px] px-4 py-4 font-medium text-black dark:text-white">
                Khách hàng
              </th>
              <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
                Số lượng
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                Tổng tiền
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                Thanh toán
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                Trạng thái
              </th>
              <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                Thời gian
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, key) => (
              <tr
                key={key}
                className="border-b border-[#eee] dark:border-strokedark"
              >
                <td className="px-4 py-5">
                  <Link
                    href={`/orders/${order.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {order.id}
                  </Link>
                </td>
                <td className="px-4 py-5">
                  <div>
                    <p className="text-sm font-medium text-black dark:text-white">
                      {order.customerName}
                    </p>
                    <p className="text-xs text-body">{order.customerEmail}</p>
                  </div>
                </td>
                <td className="px-4 py-5">
                  <p className="text-black dark:text-white">{order.items} sản phẩm</p>
                </td>
                <td className="px-4 py-5">
                  <p className="font-medium text-black dark:text-white">
                    {formatPrice(order.total)}
                  </p>
                </td>
                <td className="px-4 py-5">
                  {getPaymentBadge(order.paymentMethod)}
                </td>
                <td className="px-4 py-5">{getStatusBadge(order.status)}</td>
                <td className="px-4 py-5">
                  <p className="text-sm text-black dark:text-white">
                    {order.date}
                  </p>
                </td>
                <td className="px-4 py-5">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/orders/${order.id}`}
                      className="hover:text-primary"
                      title="Xem chi tiết"
                    >
                      <svg
                        className="fill-current"
                        width="18"
                        height="18"
                        viewBox="0 0 18 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M8.99981 14.8219C3.43106 14.8219 0.674805 9.50624 0.562305 9.28124C0.47793 9.11249 0.47793 8.88749 0.562305 8.71874C0.674805 8.49374 3.43106 3.20624 8.99981 3.20624C14.5686 3.20624 17.3248 8.49374 17.4373 8.71874C17.5217 8.88749 17.5217 9.11249 17.4373 9.28124C17.3248 9.50624 14.5686 14.8219 8.99981 14.8219ZM1.85605 8.99999C2.4748 10.0406 4.89356 13.5562 8.99981 13.5562C13.1061 13.5562 15.5248 10.0406 16.1436 8.99999C15.5248 7.95936 13.1061 4.44374 8.99981 4.44374C4.89356 4.44374 2.4748 7.95936 1.85605 8.99999Z"
                          fill=""
                        />
                        <path
                          d="M9 11.3906C7.67812 11.3906 6.60938 10.3219 6.60938 9C6.60938 7.67813 7.67812 6.60938 9 6.60938C10.3219 6.60938 11.3906 7.67813 11.3906 9C11.3906 10.3219 10.3219 11.3906 9 11.3906ZM9 7.875C8.38125 7.875 7.875 8.38125 7.875 9C7.875 9.61875 8.38125 10.125 9 10.125C9.61875 10.125 10.125 9.61875 10.125 9C10.125 8.38125 9.61875 7.875 9 7.875Z"
                          fill=""
                        />
                      </svg>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-body">Không tìm thấy đơn hàng nào</p>
        </div>
      )}

      {/* Summary */}
      {filteredOrders.length > 0 && (
        <div className="flex items-center justify-between border-t border-stroke px-6 py-4 dark:border-strokedark">
          <p className="text-sm text-body">
            Hiển thị {filteredOrders.length} đơn hàng
          </p>
          <p className="text-sm font-medium text-black dark:text-white">
            Tổng:{" "}
            {formatPrice(
              filteredOrders.reduce((sum, order) => sum + order.total, 0)
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default OrdersTable;
