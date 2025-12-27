"use client";
import React, { useState, useEffect } from "react";
import Button from "@/components/ui/button/Button";
import Input from "@/components/form/input/InputField";
import Badge from "@/components/ui/badge/Badge";

interface Customer {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  is_active: number;
  is_email_verified: number;
  last_login: string | null;
  created_at: string;
  _count: {
    orders: number;
    product_reviews: number;
  };
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export default function CustomersTable() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 0,
    hasMore: false,
  });
  
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("customer");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("admin_token");
      
      if (!token) {
        console.error("No admin token found!");
        alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
        window.location.href = "/auth/sign-in";
        return;
      }

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        role: roleFilter,
        status: statusFilter,
      });
      
      if (search) params.append("search", search);

      console.log("Fetching customers with token:", token.substring(0, 20) + "...");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users?${params}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          alert("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại!");
          localStorage.removeItem("admin_token");
          window.location.href = "/auth/sign-in";
          return;
        }
        throw new Error("Failed to fetch customers");
      }

      const result = await response.json();
      const data = result.data || result;
      
      setCustomers(data.data || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error("Error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [pagination.page, roleFilter, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPagination({ ...pagination, page: 1 });
    fetchCustomers();
  };

  const handleStatusToggle = async (customerId: number, currentStatus: number) => {
    if (!confirm(`Bạn có chắc muốn ${currentStatus === 1 ? "khóa" : "mở khóa"} tài khoản này?`)) {
      return;
    }

    try {
      const token = localStorage.getItem("admin_token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/users/${customerId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ is_active: currentStatus === 0 }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update status");
      }

      alert(`✅ ${currentStatus === 1 ? "Khóa" : "Mở khóa"} tài khoản thành công!`);
      fetchCustomers();
    } catch (error: any) {
      alert(`❌ Lỗi: ${error.message}`);
    }
  };

  const getRoleText = (role: string) => {
    return role === "admin" ? "Quản trị viên" : "Khách hàng";
  };

  const getStatusBadge = (isActive: number) => {
    return isActive === 1 ? (
      <Badge color="success">Hoạt động</Badge>
    ) : (
      <Badge color="error">Đã khóa</Badge>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "—";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Header */}
      <div className="border-b border-gray-200 p-5 dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
              Quản Lý Khách Hàng
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Tổng số: {pagination.total} khách hàng
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-col gap-3 lg:flex-row">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="text"
                placeholder="Tìm theo tên hoặc email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-64"
              />
              <Button type="submit" size="sm">
                Tìm kiếm
              </Button>
            </form>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-gray-800"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Đã khóa</option>
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
                Khách hàng
              </th>
              <th className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Email
              </th>
              <th className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Số điện thoại
              </th>
              <th className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Trạng thái
              </th>
              <th className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Đơn hàng
              </th>
              <th className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                Đánh giá
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
                <td colSpan={8} className="px-5 py-8 text-center text-gray-500">
                  Đang tải...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-gray-500">
                  Không có khách hàng nào
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-gray-200 hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-white/[0.02]"
                >
                  <td className="px-5 py-4">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white/90">
                        {customer.full_name || "—"}
                      </p>
                      {customer.is_email_verified === 1 && (
                        <span className="text-xs text-green-600">✓ Đã xác thực</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {customer.email}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {customer.phone || "—"}
                  </td>
                  <td className="px-5 py-4">{getStatusBadge(customer.is_active)}</td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {customer._count.orders}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {customer._count.product_reviews}
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {formatDate(customer.created_at)}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleStatusToggle(customer.id, customer.is_active)}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                          customer.is_active === 1
                            ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400"
                            : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/20 dark:text-green-400"
                        }`}
                      >
                        {customer.is_active === 1 ? "Khóa" : "Mở"}
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
    </div>
  );
}
