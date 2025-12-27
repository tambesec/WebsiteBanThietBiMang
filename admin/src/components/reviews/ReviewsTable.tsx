"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Badge from "@/components/ui/badge/Badge";

interface Review {
  id: number;
  rating: number;
  comment: string;
  is_approved: boolean;
  admin_reply: string | null;
  helpful_count?: number;
  created_at: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  product: {
    id: number;
    name: string;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export default function ReviewsTable() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasMore: false,
  });

  const [statusFilter, setStatusFilter] = useState("all");
  const [replyModal, setReplyModal] = useState<{
    show: boolean;
    reviewId: number | null;
    reply: string;
  }>({ show: false, reviewId: null, reply: "" });

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      // Only add status filter if not "all"
      if (statusFilter && statusFilter !== "all") {
        params.append("status", statusFilter);
      }

      console.log("Fetching reviews with params:", params.toString(), "statusFilter:", statusFilter);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/admin/all?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Reviews fetch error:", response.status, errorData);
        throw new Error(errorData.message || `Failed to fetch reviews (${response.status})`);
      }

      const result = await response.json();
      console.log("Reviews API Response:", result);
      const data = result.data || result;
      
      console.log("Parsed data:", data);
      console.log("Reviews array:", data.reviews);
      
      setReviews(data.reviews || []);
      setPagination({
        total: data.pagination?.total || 0,
        page: data.pagination?.page || 1,
        limit: data.pagination?.limit || 20,
        totalPages: data.pagination?.total_pages || 0,
        hasMore: data.pagination?.has_next_page || false,
      });
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [pagination.page, statusFilter]);

  const handleApprove = async (reviewId: number) => {
    if (!confirm("Bạn có chắc muốn duyệt đánh giá này?")) return;

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/${reviewId}/approve`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to approve review");
      }

      alert("✅ Đã duyệt đánh giá thành công!");
      fetchReviews();
    } catch (error: any) {
      alert(`❌ Lỗi: ${error.message}`);
    }
  };

  const handleReject = async (reviewId: number) => {
    if (!confirm("Bạn có chắc muốn từ chối đánh giá này?")) return;

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/${reviewId}/reject`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reject review");
      }

      alert("✅ Đã từ chối đánh giá thành công!");
      fetchReviews();
    } catch (error: any) {
      alert(`❌ Lỗi: ${error.message}`);
    }
  };

  const handleSubmitReply = async () => {
    if (!replyModal.reviewId || !replyModal.reply.trim()) {
      alert("Vui lòng nhập nội dung phản hồi!");
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/reviews/${replyModal.reviewId}/reply`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reply: replyModal.reply }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to add reply");
      }

      alert("✅ Đã thêm phản hồi thành công!");
      setReplyModal({ show: false, reviewId: null, reply: "" });
      fetchReviews();
    } catch (error: any) {
      alert(`❌ Lỗi: ${error.message}`);
    }
  };

  const getStatusBadge = (isApproved: boolean) => {
    return isApproved ? (
      <Badge color="success">Đã duyệt</Badge>
    ) : (
      <Badge color="warning">Chờ duyệt</Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const renderStars = (rating: number) => {
    return "⭐".repeat(rating);
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="border-b border-gray-200 p-5 dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Quản Lý Đánh Giá
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Tổng số: {pagination.total} đánh giá
            </p>
          </div>

          {/* Filters */}
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-800">
              <th className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Sản phẩm
              </th>
              <th className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Khách hàng
              </th>
              <th className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Đánh giá
              </th>
              <th className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Nội dung
              </th>
              <th className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Trạng thái
              </th>
              <th className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Ngày tạo
              </th>
              <th className="px-5 py-4 text-right text-sm font-medium text-gray-500 dark:text-gray-400">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-8 text-center text-gray-500">
                  Không có đánh giá nào
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr
                  key={review.id}
                  className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-800 dark:text-white/90">
                      {review.product.name}
                    </p>
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white/90">
                        {review.user.full_name}
                      </p>
                      <p className="text-xs text-gray-500">{review.user.email}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{renderStars(review.rating)}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {review.rating}/5
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="max-w-xs truncate text-sm text-gray-600 dark:text-gray-400">
                      {review.comment}
                    </p>
                    {review.admin_reply && (
                      <p className="mt-1 text-xs text-blue-600">
                        💬 Đã phản hồi
                      </p>
                    )}
                  </td>
                  <td className="px-5 py-4">{getStatusBadge(review.is_approved)}</td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(review.created_at)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {!review.is_approved && (
                        <>
                          <button
                            onClick={() => handleApprove(review.id)}
                            className="rounded-md bg-green-100 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400"
                          >
                            Duyệt
                          </button>
                          <button
                            onClick={() => handleReject(review.id)}
                            className="rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400"
                          >
                            Từ chối
                          </button>
                        </>
                      )}
                      <button
                        onClick={() =>
                          setReplyModal({
                            show: true,
                            reviewId: review.id,
                            reply: review.admin_reply || "",
                          })
                        }
                        className="rounded-md bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400"
                      >
                        Phản hồi
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4 dark:border-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Trang {pagination.page} / {pagination.totalPages}
        </p>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            disabled={pagination.page === 1}
          >
            ← Trước
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            disabled={!pagination.hasMore}
          >
            Sau →
          </Button>
        </div>
      </div>

      {/* Reply Modal */}
      {replyModal.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
              Phản hồi đánh giá
            </h3>
            <textarea
              value={replyModal.reply}
              onChange={(e) =>
                setReplyModal({ ...replyModal, reply: e.target.value })
              }
              className="w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-900"
              rows={4}
              placeholder="Nhập nội dung phản hồi..."
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() =>
                  setReplyModal({ show: false, reviewId: null, reply: "" })
                }
              >
                Hủy
              </Button>
              <Button onClick={handleSubmitReply}>Gửi phản hồi</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
