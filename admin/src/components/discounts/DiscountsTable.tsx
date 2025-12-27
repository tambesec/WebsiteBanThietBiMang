"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Badge from "@/components/ui/badge/Badge";

interface Discount {
  id: number;
  code: string;
  type: string;
  value: number;
  min_order_value: number | null;
  max_discount: number | null;
  usage_limit: number | null;
  usage_count: number;
  start_date: string;
  end_date: string | null;
  is_active: number;
  created_at: string;
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

interface Statistics {
  total: number;
  active: number;
  expired: number;
  inactive: number;
  totalUsage: number;
}

export default function DiscountsTable() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasMore: false,
  });

  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<Discount | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    min_order_amount: "",
    max_discount_amount: "",
    max_uses: "",
    max_uses_per_user: "1",
    starts_at: "",
    ends_at: "",
  });

  const fetchDiscounts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (statusFilter !== "all") params.append("status", statusFilter);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/discounts?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error("Fetch discounts error:", response.status, error);
        throw new Error(error.message || `Failed to fetch discounts (${response.status})`);
      }

      const result = await response.json();
      const data = result.data || result;

      setDiscounts(data.data || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error("Error fetching discounts:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/discounts/statistics`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error("Fetch statistics error:", response.status, error);
        throw new Error(error.message || `Failed to fetch statistics (${response.status})`);
      }

      const result = await response.json();
      setStatistics(result.data || result);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  useEffect(() => {
    fetchDiscounts();
    fetchStatistics();
  }, [pagination.page, statusFilter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: any = {
      code: formData.code,
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      starts_at: new Date(formData.starts_at).toISOString(),
      ends_at: new Date(formData.ends_at).toISOString(),
    };

    if (formData.description) payload.description = formData.description;
    if (formData.min_order_amount) payload.min_order_amount = parseFloat(formData.min_order_amount);
    if (formData.max_discount_amount) payload.max_discount_amount = parseFloat(formData.max_discount_amount);
    if (formData.max_uses) payload.max_uses = parseInt(formData.max_uses);
    if (formData.max_uses_per_user) payload.max_uses_per_user = parseInt(formData.max_uses_per_user);

    try {
      const token = localStorage.getItem("admin_token");
      const url = editingDiscount
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/discounts/${editingDiscount.id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/v1/discounts`;

      const response = await fetch(url, {
        method: editingDiscount ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save discount");
      }

      alert(`✅ ${editingDiscount ? "Cập nhật" : "Tạo"} mã giảm giá thành công!`);
      setShowModal(false);
      resetForm();
      fetchDiscounts();
      fetchStatistics();
    } catch (error: any) {
      alert(`❌ Lỗi: ${error.message}`);
    }
  };

  const handleDelete = async (discountId: number) => {
    if (!confirm("Bạn có chắc muốn xóa mã giảm giá này?")) return;

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/discounts/${discountId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete discount");
      }

      alert("✅ Xóa mã giảm giá thành công!");
      fetchDiscounts();
      fetchStatistics();
    } catch (error: any) {
      alert(`❌ Lỗi: ${error.message}`);
    }
  };

  const handleEdit = (discount: Discount) => {
    setEditingDiscount(discount);
    setFormData({
      code: discount.code,
      description: "",
      discount_type: discount.type,
      discount_value: discount.value.toString(),
      min_order_amount: discount.min_order_value?.toString() || "",
      max_discount_amount: discount.max_discount?.toString() || "",
      max_uses: discount.usage_limit?.toString() || "",
      max_uses_per_user: "1",
      starts_at: discount.start_date.split("T")[0],
      ends_at: discount.end_date ? discount.end_date.split("T")[0] : "",
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingDiscount(null);
    setFormData({
      code: "",
      description: "",
      discount_type: "percentage",
      discount_value: "",
      min_order_amount: "",
      max_discount_amount: "",
      max_uses: "",
      max_uses_per_user: "1",
      starts_at: "",
      ends_at: "",
    });
  };

  const getStatusBadge = (discount: Discount) => {
    if (discount.is_active === 0) {
      return <Badge color="dark">Vô hiệu</Badge>;
    }
    if (discount.end_date && new Date(discount.end_date) < new Date()) {
      return <Badge color="error">Hết hạn</Badge>;
    }
    if (discount.usage_limit && discount.usage_count >= discount.usage_limit) {
      return <Badge color="warning">Đã hết lượt</Badge>;
    }
    return <Badge color="success">Đang hoạt động</Badge>;
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Không giới hạn";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  const formatValue = (discount: Discount) => {
    return discount.type === "percentage"
      ? `${discount.value}%`
      : `${discount.value.toLocaleString()} ₫`;
  };

  return (
    <div className="space-y-4">
      {/* Statistics */}
      {statistics && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-sm text-gray-500 dark:text-gray-400">Tổng mã</p>
            <p className="mt-1 text-2xl font-semibold text-gray-800 dark:text-white">
              {statistics.total}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-sm text-gray-500 dark:text-gray-400">Đang hoạt động</p>
            <p className="mt-1 text-2xl font-semibold text-green-600">
              {statistics.active}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-sm text-gray-500 dark:text-gray-400">Hết hạn</p>
            <p className="mt-1 text-2xl font-semibold text-red-600">
              {statistics.expired}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-sm text-gray-500 dark:text-gray-400">Vô hiệu</p>
            <p className="mt-1 text-2xl font-semibold text-gray-600">
              {statistics.inactive}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-white/[0.03]">
            <p className="text-sm text-gray-500 dark:text-gray-400">Tổng lượt dùng</p>
            <p className="mt-1 text-2xl font-semibold text-blue-600">
              {statistics.totalUsage}
            </p>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header */}
        <div className="border-b border-gray-200 p-5 dark:border-gray-800 lg:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Quản Lý Mã Giảm Giá
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Tổng số: {pagination.total} mã giảm giá
              </p>
            </div>

            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
              >
                <option value="all">Tất cả</option>
                <option value="active">Đang hoạt động</option>
                <option value="expired">Hết hạn</option>
                <option value="inactive">Vô hiệu</option>
              </select>
              <Button
                onClick={() => {
                  resetForm();
                  setShowModal(true);
                }}
              >
                + Tạo mã mới
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800">
                <th className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Mã code
                </th>
                <th className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Loại / Giá trị
                </th>
                <th className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Điều kiện
                </th>
                <th className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Sử dụng
                </th>
                <th className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Thời hạn
                </th>
                <th className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Trạng thái
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
              ) : discounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-gray-500">
                    Không có mã giảm giá nào
                  </td>
                </tr>
              ) : (
                discounts.map((discount) => (
                  <tr
                    key={discount.id}
                    className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-5 py-4">
                      <p className="font-mono font-semibold text-gray-800 dark:text-white/90">
                        {discount.code}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {discount.type === "percentage" ? "Phần trăm" : "Số tiền"}
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {formatValue(discount)}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <p>
                        Min:{" "}
                        {discount.min_order_value?.toLocaleString() || "0"} ₫
                      </p>
                      {discount.max_discount && (
                        <p>Max: {discount.max_discount.toLocaleString()} ₫</p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {discount.usage_count} /{" "}
                      {discount.usage_limit || "∞"}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                      <p>{formatDate(discount.start_date)}</p>
                      <p>→ {formatDate(discount.end_date)}</p>
                    </td>
                    <td className="px-5 py-4">{getStatusBadge(discount)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(discount)}
                          className="rounded-md bg-blue-100 px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(discount.id)}
                          className="rounded-md bg-red-100 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400"
                        >
                          Xóa
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
              onClick={() =>
                setPagination({ ...pagination, page: pagination.page - 1 })
              }
              disabled={pagination.page === 1}
            >
              ← Trước
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setPagination({ ...pagination, page: pagination.page + 1 })
              }
              disabled={!pagination.hasMore}
            >
              Sau →
            </Button>
          </div>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">
              {editingDiscount ? "Sửa mã giảm giá" : "Tạo mã giảm giá mới"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Mã code"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData({ ...formData, code: e.target.value })
                  }
                  required
                />
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Loại giảm giá <span className="ml-1 text-red-500">*</span>
                  </label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) =>
                      setFormData({ ...formData, discount_type: e.target.value })
                    }
                    className="h-11 w-full rounded-lg border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                    required
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed_amount">Số tiền cố định (₫)</option>
                    <option value="free_shipping">Miễn phí vận chuyển</option>
                  </select>
                </div>
              </div>

              <Input
                label="Mô tả"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Mô tả về mã giảm giá (tùy chọn)"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Giá trị"
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) =>
                    setFormData({ ...formData, discount_value: e.target.value })
                  }
                  placeholder={formData.discount_type === 'percentage' ? '0-100' : 'Số tiền VND'}
                  required
                />
                <Input
                  label="Giá trị đơn tối thiểu"
                  type="number"
                  value={formData.min_order_amount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      min_order_amount: e.target.value,
                    })
                  }
                  placeholder="VND (tùy chọn)"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="Giảm tối đa"
                  type="number"
                  value={formData.max_discount_amount}
                  onChange={(e) =>
                    setFormData({ ...formData, max_discount_amount: e.target.value })
                  }
                  placeholder="VND (tùy chọn)"
                />
                <Input
                  label="Tổng lượt dùng"
                  type="number"
                  value={formData.max_uses}
                  onChange={(e) =>
                    setFormData({ ...formData, max_uses: e.target.value })
                  }
                  placeholder="Không giới hạn"
                />
                <Input
                  label="Lượt dùng/người"
                  type="number"
                  value={formData.max_uses_per_user}
                  onChange={(e) =>
                    setFormData({ ...formData, max_uses_per_user: e.target.value })
                  }
                  placeholder="1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Ngày bắt đầu"
                  type="date"
                  value={formData.starts_at}
                  onChange={(e) =>
                    setFormData({ ...formData, starts_at: e.target.value })
                  }
                  required
                />
                <Input
                  label="Ngày kết thúc"
                  type="date"
                  value={formData.ends_at}
                  onChange={(e) =>
                    setFormData({ ...formData, ends_at: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                >
                  Hủy
                </Button>
                <Button type="submit">
                  {editingDiscount ? "Cập nhật" : "Tạo mới"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
