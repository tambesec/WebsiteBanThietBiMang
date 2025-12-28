"use client";
import { useState, useEffect } from "react";
import Badge from "../ui/badge/Badge";
import { generatedApiAxios } from "@/lib/api-client";

interface NewsletterSubscriber {
  id: number;
  email: string;
  status: string;
  subscribed_at: string;
  unsubscribed_at?: string;
}

interface NewsletterStats {
  total: number;
  active: number;
  unsubscribed: number;
}

const NewsletterTable = () => {
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [stats, setStats] = useState<NewsletterStats>({ total: 0, active: 0, unsubscribed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSubscribers, setTotalSubscribers] = useState(0);
  const limit = 10;

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "active", label: "Đang hoạt động" },
    { value: "unsubscribed", label: "Đã hủy" },
  ];

  useEffect(() => {
    fetchSubscribers();
    fetchStats();
  }, [currentPage, filterStatus]);

  const fetchStats = async () => {
    try {
      const response = await generatedApiAxios.get("/api/v1/newsletter/stats");
      const statsData = response.data?.data?.data || response.data?.data || response.data;
      setStats(statsData);
    } catch (error: any) {
      console.error("Failed to fetch stats:", error);
    }
  };

  const fetchSubscribers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", limit.toString());
      if (filterStatus !== "all") params.append("status", filterStatus);

      const response = await generatedApiAxios.get(
        `/api/v1/newsletter?${params.toString()}`
      );

      let responseData = response.data?.data?.data || response.data?.data || response.data;
      
      const subscribersList = responseData?.subscribers || [];
      const paginationData = responseData?.pagination || {};
      
      setSubscribers(subscribersList);
      setTotalPages(paginationData.total_pages || 1);
      setTotalSubscribers(paginationData.total || 0);
    } catch (error: any) {
      console.error("Error fetching subscribers:", error);
      if (error.response?.status === 401) {
        setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      } else if (error.response?.status === 403) {
        setError("Bạn không có quyền truy cập chức năng này.");
      } else {
        setError(`Không thể tải danh sách: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa email này?")) return;

    try {
      await generatedApiAxios.delete(`/api/v1/newsletter/${id}`);
      fetchSubscribers();
      fetchStats();
    } catch (error: any) {
      alert(`Xóa thất bại: ${error.response?.data?.message || error.message}`);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "unsubscribed":
        return "error";
      default:
        return "warning";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Đang hoạt động";
      case "unsubscribed":
        return "Đã hủy";
      default:
        return status;
    }
  };

  if (loading && subscribers.length === 0) {
    return (
      <div className="rounded-[10px] bg-white px-7.5 pb-4 pt-7.5 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="flex items-center justify-center py-10">
          <p className="text-dark dark:text-white">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 p-7.5">
        <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-gray-700 dark:bg-gray-dark">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold text-dark dark:text-white">{stats.total}</h4>
              <span className="text-body-sm font-medium">Tổng số đăng ký</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-2 dark:bg-gray">
              <svg className="fill-primary" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-gray-700 dark:bg-gray-dark">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold text-green-600 dark:text-green-400">{stats.active}</h4>
              <span className="text-body-sm font-medium">Đang hoạt động</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50 dark:bg-green-900">
              <svg className="fill-green-600" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-stroke bg-white p-6 shadow-default dark:border-gray-700 dark:bg-gray-dark">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold text-red-600 dark:text-red-400">{stats.unsubscribed}</h4>
              <span className="text-body-sm font-medium">Đã hủy đăng ký</span>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50 dark:bg-red-900">
              <svg className="fill-red-600" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-t border-stroke px-7.5 py-4 dark:border-gray-700">
        <div className="flex flex-wrap items-center gap-4">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="rounded-md border border-stroke bg-white px-4 py-2 text-dark outline-none focus:border-primary dark:border-gray-700 dark:bg-gray-dark dark:text-white"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="border-t border-stroke px-7.5 py-4 dark:border-gray-700">
          <div className="rounded-lg bg-red-50 p-4 dark:bg-red-900/20">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="px-4 pb-4">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-gray-800">
                <th className="px-4 py-4 font-medium text-dark dark:text-white">ID</th>
                <th className="px-4 py-4 font-medium text-dark dark:text-white">Email</th>
                <th className="px-4 py-4 font-medium text-dark dark:text-white">Trạng thái</th>
                <th className="px-4 py-4 font-medium text-dark dark:text-white">Ngày đăng ký</th>
                <th className="px-4 py-4 font-medium text-dark dark:text-white">Ngày hủy</th>
                <th className="px-4 py-4 font-medium text-dark dark:text-white">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {subscribers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-dark dark:text-white">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                subscribers.map((subscriber, index) => (
                  <tr
                    key={subscriber.id}
                    className={`${
                      index !== subscribers.length - 1
                        ? "border-b border-stroke dark:border-gray-700"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-4">
                      <p className="text-dark dark:text-white">#{subscriber.id}</p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-dark dark:text-white">{subscriber.email}</p>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant="light" color={getStatusColor(subscriber.status)}>
                        {getStatusLabel(subscriber.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-dark dark:text-white">
                        {formatDate(subscriber.subscribed_at)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-dark dark:text-white">
                        {formatDate(subscriber.unsubscribed_at)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleDelete(subscriber.id)}
                        className="inline-flex rounded bg-red-500 px-4 py-2 font-medium text-white hover:bg-red-600"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between border-t border-stroke pt-4 dark:border-gray-700">
            <p className="text-sm text-dark dark:text-white">
              Trang {currentPage} / {totalPages} - Tổng số: {totalSubscribers} đăng ký
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded bg-gray-200 px-4 py-2 text-dark hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="rounded bg-gray-200 px-4 py-2 text-dark hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NewsletterTable;
