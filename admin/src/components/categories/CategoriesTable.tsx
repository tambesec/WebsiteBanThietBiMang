"use client";
import { useState, useEffect } from "react";
import { categoriesApi } from "@/lib/api-client";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number;
  display_order: number;
  is_active: boolean;
  image_url?: string;
  products_count?: number;
  parent?: {
    id: number;
    name: string;
  };
}

const CategoriesTable = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const limit = 10;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent_id: undefined as number | undefined,
    display_order: 0,
    is_active: true,
    image_url: "",
  });

  useEffect(() => {
    fetchCategories();
  }, [currentPage, filterStatus]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesApi.categoriesControllerFindAll(
        searchTerm || undefined,
        undefined, // parent_id
        filterStatus,
        true, // includeProductsCount
        'display_order',
        'asc',
        currentPage,
        limit
      );

      setCategories(response.data.data?.categories || []);
      setTotalPages(response.data.data?.pagination?.total_pages || 1);
      setTotalCategories(response.data.data?.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchCategories();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      description: "",
      parent_id: undefined,
      display_order: 0,
      is_active: true,
      image_url: "",
    });
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      parent_id: category.parent_id,
      display_order: category.display_order,
      image_url: category.image_url || "",
      is_active: category.is_active,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCategory) {
        // Update
        await categoriesApi.categoriesControllerUpdate(editingCategory.id, formData);
      } else {
        // Create
        await categoriesApi.categoriesControllerCreate(formData);
      }
      
      setShowModal(false);
      fetchCategories();
    } catch (error: any) {
      console.error('Failed to save category:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const handleDelete = async (categoryId: number) => {
    if (!confirm('Bạn có chắc muốn xóa danh mục này?')) return;
    
    try {
      await categoriesApi.categoriesControllerRemove(categoryId);
      fetchCategories();
    } catch (error: any) {
      console.error('Failed to delete category:', error);
      alert(error.response?.data?.message || 'Không thể xóa danh mục!');
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      await categoriesApi.categoriesControllerUpdate(category.id, {
        is_active: !category.is_active,
      });
      fetchCategories();
    } catch (error) {
      console.error('Failed to toggle category status:', error);
    }
  };

  return (
    <>
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Header */}
        <div className="flex flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-6 xl:px-7.5">
          <div className="flex items-center gap-3">
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Danh Sách Danh Mục
            </h4>
            <span className="inline-flex items-center justify-center rounded-full bg-primary px-2.5 py-0.5 text-sm font-medium text-white">
              {totalCategories}
            </span>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {/* Search */}
            <div className="relative flex items-center gap-2">
              <input
                type="text"
                placeholder="Tìm danh mục..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full rounded-lg border border-stroke bg-transparent py-2 pl-10 pr-4 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2">
                <svg className="fill-body" width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path fillRule="evenodd" clipRule="evenodd" d="M9.16666 3.33332C5.945 3.33332 3.33332 5.945 3.33332 9.16666C3.33332 12.3883 5.945 15 9.16666 15C12.3883 15 15 12.3883 15 9.16666C15 5.945 12.3883 3.33332 9.16666 3.33332ZM1.66666 9.16666C1.66666 5.02452 5.02452 1.66666 9.16666 1.66666C13.3088 1.66666 16.6667 5.02452 16.6667 9.16666C16.6667 13.3088 13.3088 16.6667 9.16666 16.6667C5.02452 16.6667 1.66666 13.3088 1.66666 9.16666Z" fill=""/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M13.2857 13.2857C13.6112 12.9603 14.1388 12.9603 14.4642 13.2857L18.0892 16.9107C18.4147 17.2362 18.4147 17.7638 18.0892 18.0892C17.7638 18.4147 17.2362 18.4147 16.9107 18.0892L13.2857 14.4642C12.9603 14.1388 12.9603 13.6112 13.2857 13.2857Z" fill=""/>
                </svg>
              </span>
              <button
                onClick={handleSearch}
                className="rounded-lg bg-primary px-4 py-2 text-white hover:bg-opacity-90"
              >
                Tìm
              </button>
            </div>

            {/* Filter Status */}
            <select
              value={filterStatus === undefined ? 'all' : filterStatus ? 'active' : 'inactive'}
              onChange={(e) => {
                const value = e.target.value;
                setFilterStatus(value === 'all' ? undefined : value === 'active');
                setCurrentPage(1);
              }}
              className="rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã ẩn</option>
            </select>

            {/* Add Button */}
            <button
              onClick={openAddModal}
              className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-blue-600 px-5 py-2.5 text-center font-semibold text-white shadow-md hover:bg-blue-700 hover:shadow-xl transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10 4.167V15.833" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M4.167 10H15.833" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Thêm Danh Mục
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="px-4 py-4 font-medium text-black dark:text-white xl:pl-7.5">
                  Tên Danh Mục
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Danh Mục Cha
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Số Sản Phẩm
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Thứ Tự
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Trạng Thái
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-10">
                    <div className="flex justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
                    </div>
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id} className="border-b border-stroke dark:border-strokedark">
                    <td className="px-4 py-5 xl:pl-7.5">
                      <h5 className="font-medium text-black dark:text-white">
                        {category.name}
                      </h5>
                      {category.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {category.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-5">
                      <p className="text-black dark:text-white">
                        {category.parent?.name || '-'}
                      </p>
                    </td>
                    <td className="px-4 py-5">
                      <p className="text-black dark:text-white">
                        {category.products_count || 0}
                      </p>
                    </td>
                    <td className="px-4 py-5">
                      <p className="text-black dark:text-white">
                        {category.display_order}
                      </p>
                    </td>
                    <td className="px-4 py-5">
                      <button
                        onClick={() => handleToggleActive(category)}
                        className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                          category.is_active
                            ? 'bg-success text-success'
                            : 'bg-danger text-danger'
                        }`}
                      >
                        {category.is_active ? 'Hoạt động' : 'Đã ẩn'}
                      </button>
                    </td>
                    <td className="px-4 py-5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(category)}
                          className="rounded-md bg-primary px-3.5 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                        >
                          ✏️ Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="rounded-md bg-danger px-3.5 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                        >
                          🗑️ Xóa
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
          <div className="flex justify-between items-center px-4 py-4 md:px-6 xl:px-7.5">
            <p className="text-sm text-gray-500">
              Trang {currentPage} / {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="rounded bg-gray px-3 py-1 text-sm font-medium text-black hover:bg-gray-2 disabled:opacity-50 dark:bg-meta-4 dark:text-white"
              >
                Trước
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="rounded bg-gray px-3 py-1 text-sm font-medium text-black hover:bg-gray-2 disabled:opacity-50 dark:bg-meta-4 dark:text-white"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-999999 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-2xl rounded-lg bg-white p-6 dark:bg-boxdark">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-semibold text-black dark:text-white">
                {editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Tên danh mục <span className="text-meta-1">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  placeholder="Nhập tên danh mục"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                />
              </div>

              <div className="mb-4">
                <label className="mb-2.5 block text-black dark:text-white">
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  placeholder="Nhập mô tả (không bắt buộc)"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                />
              </div>

              <div className="mb-4 flex gap-4">
                <div className="w-1/2">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Danh mục cha
                  </label>
                  <select
                    value={formData.parent_id || ''}
                    onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                  >
                    <option value="">-- Danh mục gốc --</option>
                    {categories.filter(c => !editingCategory || c.id !== editingCategory.id).map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="w-1/2">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Thứ tự hiển thị
                  </label>
                  <input
                    type="number"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                    min="0"
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-2.5 block text-black dark:text-white">
                  URL Ảnh Danh Mục
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  placeholder="https://res.cloudinary.com/..."
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                />
                <p className="mt-1 text-xs text-bodydark">
                  💡 Upload ảnh lên <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Cloudinary</a> rồi dán URL vào đây
                </p>
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="h-5 w-5 rounded border-stroke"
                  />
                  <span className="text-black dark:text-white">Kích hoạt danh mục</span>
                </label>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="rounded bg-primary px-6 py-2 font-medium text-white hover:bg-opacity-90"
                >
                  {editingCategory ? 'Cập Nhật' : 'Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CategoriesTable;
