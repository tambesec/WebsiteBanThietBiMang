"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ordersApi } from "@/lib/api-client";
import type { OrderDto } from "@/generated-api";

const OrdersTable = () => {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const limit = 10;

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "pending", label: "Chờ xác nhận" },
    { value: "confirmed", label: "Đã xác nhận" },
    { value: "processing", label: "Đang xử lý" },
    { value: "shipped", label: "Đang giao" },
    { value: "delivered", label: "Đã giao" },
    { value: "cancelled", label: "Đã hủy" },
  ];

  useEffect(() => {
    fetchOrders();
  }, [currentPage, filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersApi.ordersControllerFindAllAdmin(
        filterStatus === "all" ? undefined : filterStatus as any, // status
        searchTerm || undefined, // search
        'created_at', // sortBy
        'desc', // sortOrder
        currentPage, // page
        limit // limit
      );

      setOrders(response.data.data?.orders || []);
      setTotalPages(response.data.data?.pagination?.total_pages || 1);
      setTotalOrders(response.data.data?.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchOrders();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return '0đ';
    return new Intl.NumberFormat("vi-VN").format(price) + 'đ';
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
      pending: {
        bg: "bg-warning bg-opacity-10",
        text: "text-warning",
        label: "Chờ xác nhận",
      },
      confirmed: {
        bg: "bg-blue-500 bg-opacity-10",
        text: "text-blue-500",
        label: "Đã xác nhận",
      },
      processing: {
        bg: "bg-primary bg-opacity-10",
        text: "text-primary",
        label: "Đang xử lý",
      },
      shipped: {
        bg: "bg-blue-600 bg-opacity-10",
        text: "text-blue-600",
        label: "Đang giao",
      },
      delivered: {
        bg: "bg-success bg-opacity-10",
        text: "text-success",
        label: "Đã giao",
      },
      cancelled: {
        bg: "bg-danger bg-opacity-10",
        text: "text-danger",
        label: "Đã hủy",
      },
    };

    const config = statusConfig[status?.toLowerCase()] || statusConfig.pending;
    return (
      <span
        className={`inline-flex rounded-full ${config.bg} px-3 py-1 text-sm font-medium ${config.text}`}
      >
        {config.label}
      </span>
    );
  };

  const getPaymentBadge = (method?: string) => {
    if (!method) return null;
    const methodConfig: Record<string, { label: string; color: string }> = {
      cod: { label: "Tiền mặt", color: "bg-gray-500" },
      vnpay: { label: "VNPay", color: "bg-blue-500" },
      momo: { label: "MoMo", color: "bg-pink-500" },
      zalopay: { label: "ZaloPay", color: "bg-blue-400" },
      bank_transfer: { label: "Chuyển khoản", color: "bg-green-500" },
    };

    const config = methodConfig[method.toLowerCase()] || { label: method, color: "bg-gray-500" };
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
            {totalOrders}
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex items-center gap-2">
            <input
              type="text"
              placeholder="Tìm đơn hàng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
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
            <button
              onClick={handleSearch}
              className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-opacity-90"
            >
              Tìm
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                Mã đơn hàng
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Khách hàng
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Sản phẩm
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Tổng tiền
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Thanh toán
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Trạng thái
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Ngày đặt
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
                  </div>
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  Không tìm thấy đơn hàng nào
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-b border-stroke dark:border-strokedark">
                  <td className="px-4 py-5 pl-9 xl:pl-11">
                    <Link
                      href={`/orders/${order.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      #{order.order_number}
                    </Link>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-black dark:text-white">
                        {order.customer_name || 'N/A'}
                      </p>
                      <p className="text-xs text-gray-500">{order.customer_email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <p className="text-sm text-black dark:text-white">
                      {order.items_count} sản phẩm
                    </p>
                    <p className="text-xs text-gray-500">
                      SL: {order.total_quantity}
                    </p>
                  </td>
                  <td className="px-4 py-5">
                    <p className="font-medium text-black dark:text-white">
                      {formatPrice(order.total_amount)}
                    </p>
                  </td>
                  <td className="px-4 py-5">
                    {getPaymentBadge(order.payment_method)}
                  </td>
                  <td className="px-4 py-5">
                    {getStatusBadge(order.status?.name || order.status as string)}
                  </td>
                  <td className="px-4 py-5">
                    <p className="text-sm text-black dark:text-white">
                      {formatDate(order.created_at)}
                    </p>
                  </td>
                  <td className="px-4 py-5">
                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex rounded bg-primary px-3 py-1 text-sm font-medium text-white hover:bg-opacity-90"
                    >
                      Chi tiết
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-stroke px-4 py-4 dark:border-strokedark sm:px-6">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-md border border-stroke px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-strokedark dark:text-white"
            >
              Trước
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-stroke px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-strokedark dark:text-white"
            >
              Sau
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Trang <span className="font-medium">{currentPage}</span> /{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md border border-stroke px-2 py-2 text-gray-400 hover:bg-gray-50 disabled:opacity-50 dark:border-strokedark"
                >
                  <span className="sr-only">Trước</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md border border-stroke px-2 py-2 text-gray-400 hover:bg-gray-50 disabled:opacity-50 dark:border-strokedark"
                >
                  <span className="sr-only">Sau</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersTable;
