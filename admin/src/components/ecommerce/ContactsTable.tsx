"use client";
import { useState, useEffect } from "react";
import Badge from "../ui/badge/Badge";
import { generatedApiAxios } from "@/lib/api-client";

interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  status: string;
  admin_note?: string;
  is_read: boolean;
  created_at: string;
  updated_at: string;
}

const ContactsTable = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNote, setAdminNote] = useState("");
  const limit = 10;

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "new", label: "Mới" },
    { value: "read", label: "Đã đọc" },
    { value: "replied", label: "Đã phản hồi" },
    { value: "resolved", label: "Đã xử lý" },
    { value: "spam", label: "Spam" },
  ];

  useEffect(() => {
    fetchContacts();
  }, [currentPage, filterStatus]);

  const fetchContacts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append("page", currentPage.toString());
      params.append("limit", limit.toString());
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (searchTerm) params.append("search", searchTerm);

      // Debug: Check token
      const token = localStorage.getItem('admin_token');
      console.log("=== CONTACTS FETCH DEBUG ===");
      console.log("Token from localStorage:", token ? token.substring(0, 50) + "..." : "NULL");
      console.log("Params:", params.toString());
      
      const response = await generatedApiAxios.get(
        `/api/v1/contacts?${params.toString()}`
      );

      console.log("Response status:", response.status);
      console.log("Response data:", response.data);

      // Response structure from axios + backend wrapper:
      // { success, statusCode, message, data: { data: { contacts, pagination } } }
      // OR { data: { contacts, pagination } }
      let responseData = response.data?.data?.data || response.data?.data || response.data;
      console.log("Parsed responseData:", responseData);
      
      const contactsList = responseData?.contacts || [];
      const paginationData = responseData?.pagination || {};
      
      console.log("Contacts list length:", contactsList.length);
      console.log("=== END DEBUG ===");
      
      setContacts(contactsList);
      setTotalPages(paginationData.total_pages || 1);
      setTotalContacts(paginationData.total || 0);
    } catch (error: any) {
      console.error("=== CONTACTS FETCH ERROR ===");
      console.error("Error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("=== END ERROR ===");
      
      // Set error message for UI
      if (error.response?.status === 401) {
        setError("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
      } else if (error.response?.status === 403) {
        setError("Bạn không có quyền truy cập chức năng này.");
      } else {
        setError(`Không thể tải danh sách liên hệ: ${error.response?.data?.message || error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchContacts();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
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

  const getStatusColor = (
    status: string
  ): "success" | "warning" | "error" | "info" => {
    const statusMap: Record<string, "success" | "warning" | "error" | "info"> =
      {
        new: "warning",
        read: "info",
        replied: "success",
        resolved: "success",
        spam: "error",
      };
    return statusMap[status?.toLowerCase()] || "warning";
  };

  const getStatusText = (status: string) => {
    const statusTextMap: Record<string, string> = {
      new: "Mới",
      read: "Đã đọc",
      replied: "Đã phản hồi",
      resolved: "Đã xử lý",
      spam: "Spam",
    };
    return statusTextMap[status?.toLowerCase()] || status;
  };

  const handleViewContact = async (contact: Contact) => {
    setSelectedContact(contact);
    setAdminNote(contact.admin_note || "");
    setShowModal(true);

    // Mark as read if it's new
    if (!contact.is_read) {
      try {
        await generatedApiAxios.patch(`/api/v1/contacts/${contact.id}/read`);
        // Update local state
        setContacts((prev) =>
          prev.map((c) =>
            c.id === contact.id
              ? { ...c, is_read: true, status: c.status === "new" ? "read" : c.status }
              : c
          )
        );
      } catch (error) {
        console.error("Failed to mark as read:", error);
      }
    }
  };

  const handleUpdateStatus = async (contactId: number, newStatus: string) => {
    try {
      await generatedApiAxios.patch(`/api/v1/contacts/${contactId}`, {
        status: newStatus,
        admin_note: adminNote,
      });

      // Update local state
      setContacts((prev) =>
        prev.map((c) =>
          c.id === contactId
            ? { ...c, status: newStatus, admin_note: adminNote }
            : c
        )
      );
      setShowModal(false);
    } catch (error) {
      console.error("Failed to update contact:", error);
    }
  };

  const handleDeleteContact = async (contactId: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa liên hệ này?")) return;

    try {
      await generatedApiAxios.delete(`/api/v1/contacts/${contactId}`);

      setContacts((prev) => prev.filter((c) => c.id !== contactId));
      setTotalContacts((prev) => prev - 1);
      setShowModal(false);
    } catch (error) {
      console.error("Failed to delete contact:", error);
    }
  };

  return (
    <>
      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        {/* Header */}
        <div className="border-b border-gray-200 p-5 dark:border-gray-800 lg:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Danh Sách Liên Hệ
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Tổng số: {totalContacts} liên hệ
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              {/* Search */}
              <div className="relative flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full rounded-lg border border-gray-300 bg-transparent py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-500 dark:border-gray-700 dark:bg-gray-800"
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
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900/50">
              <tr>
                <th className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  ID
                </th>
                <th className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Họ tên
                </th>
                <th className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Email
                </th>
                <th className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Chủ đề
                </th>
                <th className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Trạng thái
                </th>
                <th className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Ngày gửi
                </th>
                <th className="px-5 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <svg
                        className="h-8 w-8 animate-spin text-primary"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    </div>
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    {error ? (
                      <div className="text-red-500">
                        <p>{error}</p>
                        <button 
                          onClick={() => { setError(null); fetchContacts(); }}
                          className="mt-2 text-blue-500 hover:underline"
                        >
                          Thử lại
                        </button>
                      </div>
                    ) : (
                      "Không có liên hệ nào"
                    )}
                  </td>
                </tr>
              ) : (
                contacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-900/30 ${
                      !contact.is_read ? "bg-blue-50/30 dark:bg-blue-900/10" : ""
                    }`}
                  >
                    <td className="px-5 py-4 text-sm text-gray-800 dark:text-white/90">
                      #{contact.id}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        {!contact.is_read && (
                          <span className="h-2 w-2 rounded-full bg-blue-500"></span>
                        )}
                        <span className="text-sm font-medium text-gray-800 dark:text-white/90">
                          {contact.first_name} {contact.last_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {contact.email}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {contact.subject || "-"}
                    </td>
                    <td className="px-5 py-4">
                      <Badge variant="light" color={getStatusColor(contact.status)}>
                        {getStatusText(contact.status)}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {formatDate(contact.created_at)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewContact(contact)}
                          className="rounded bg-blue-500 px-3 py-1 text-xs text-white hover:bg-blue-600"
                        >
                          Xem
                        </button>
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="rounded bg-red-500 px-3 py-1 text-xs text-white hover:bg-red-600"
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
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-200 p-5 dark:border-gray-800">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Trang {currentPage} / {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-700"
              >
                Trước
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                className="rounded-lg border border-gray-300 px-3 py-1 text-sm disabled:opacity-50 dark:border-gray-700"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Modal */}
      {showModal && selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                Chi tiết liên hệ #{selectedContact.id}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Họ tên
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {selectedContact.first_name} {selectedContact.last_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Email
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {selectedContact.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Số điện thoại
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {selectedContact.phone || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Ngày gửi
                  </label>
                  <p className="text-gray-800 dark:text-white">
                    {formatDate(selectedContact.created_at)}
                  </p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Chủ đề
                </label>
                <p className="text-gray-800 dark:text-white">
                  {selectedContact.subject || "-"}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Nội dung
                </label>
                <p className="whitespace-pre-wrap rounded-lg bg-gray-50 p-3 text-gray-800 dark:bg-gray-800 dark:text-white">
                  {selectedContact.message}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Ghi chú admin
                </label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  rows={3}
                  className="mt-1 w-full rounded-lg border border-gray-300 p-3 dark:border-gray-700 dark:bg-gray-800"
                  placeholder="Thêm ghi chú..."
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Cập nhật trạng thái
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {statusOptions
                    .filter((s) => s.value !== "all")
                    .map((status) => (
                      <button
                        key={status.value}
                        onClick={() =>
                          handleUpdateStatus(selectedContact.id, status.value)
                        }
                        className={`rounded-lg px-3 py-1 text-sm ${
                          selectedContact.status === status.value
                            ? "bg-primary text-white"
                            : "border border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                        }`}
                      >
                        {status.label}
                      </button>
                    ))}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50 dark:border-gray-700"
                >
                  Đóng
                </button>
                <a
                  href={`mailto:${selectedContact.email}`}
                  className="rounded-lg bg-green-500 px-4 py-2 text-sm text-white hover:bg-green-600"
                >
                  Gửi email phản hồi
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ContactsTable;
