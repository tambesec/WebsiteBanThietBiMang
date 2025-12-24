"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { productsApi, categoriesApi } from "@/lib/api-client";

interface Product {
  id: number;
  name: string;
  slug: string;
  sku: string;
  brand: string;
  price: number;
  sale_price?: number;
  stock_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  primary_image?: string;
  category?: {
    id: number;
    name: string;
  };
  sold?: number;
}

interface Category {
  id: number;
  name: string;
}

const ProductsTable = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<number | undefined>();
  const [filterStatus, setFilterStatus] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [currentPage, filterCategory, filterStatus]);

  const fetchCategories = async () => {
    try {
      const response = await categoriesApi.categoriesControllerFindAll();
      setCategories(response.data.data?.categories || []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productsApi.productsControllerFindAll(
        searchTerm || undefined,
        filterCategory,
        undefined, // brand
        undefined, // minPrice
        undefined, // maxPrice
        undefined, // isFeatured
        filterStatus,
        'created_at',
        'desc',
        currentPage,
        limit
      );

      setProducts(response.data.data?.products || []);
      setTotalPages(response.data.data?.pagination?.total_pages || 1);
      setTotalProducts(response.data.data?.pagination?.total || 0);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleToggleActive = async (productId: number) => {
    try {
      await productsApi.productsControllerToggleActive(productId);
      fetchProducts(); // Refresh list
    } catch (error) {
      console.error('Failed to toggle product status:', error);
    }
  };

  const handleDelete = async (productId: number) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    
    try {
      await productsApi.productsControllerRemove(productId);
      fetchProducts(); // Refresh list
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const formatPrice = (price?: number) => {
    if (!price) return '0đ';
    return new Intl.NumberFormat("vi-VN").format(price) + 'đ';
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* Header with Add Button */}
      <div className="flex flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-6 xl:px-7.5">
        <div className="flex items-center gap-3">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Danh Sách Sản Phẩm
          </h4>
          <span className="inline-flex items-center justify-center rounded-full bg-primary px-2.5 py-0.5 text-sm font-medium text-white">
            {totalProducts}
          </span>
        </div>

        {/* Add Product Button */}
        <Link
          href="/products/add"
          className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-blue-600 px-6 py-3 text-center font-semibold text-white shadow-md hover:bg-blue-700 hover:shadow-xl transition-all"
        >
          <svg
            className="fill-white"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 4.16669V15.8334"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4.16699 10H15.8337"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Thêm Sản Phẩm
        </Link>
      </div>

      {/* Filters Section */}
      <div className="border-t border-stroke px-4 py-4 dark:border-strokedark md:px-6 xl:px-7.5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative flex items-center gap-2">
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full rounded-lg border border-stroke bg-transparent py-2 pl-10 pr-4 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2">
              <svg className="fill-body" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
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

          {/* Category Filter */}
          <select
            value={filterCategory || ''}
            onChange={(e) => {
              setFilterCategory(e.target.value ? Number(e.target.value) : undefined);
              setCurrentPage(1);
            }}
            className="rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus === undefined ? '' : filterStatus.toString()}
            onChange={(e) => {
              setFilterStatus(e.target.value === '' ? undefined : e.target.value === 'true');
              setCurrentPage(1);
            }}
            className="rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="true">Đang bán</option>
            <option value="false">Ngừng bán</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Sản phẩm
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Danh mục
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Giá
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Tồn kho
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Trạng thái
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
                  </div>
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  Không tìm thấy sản phẩm nào
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b border-stroke dark:border-strokedark">
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-3">
                      <div className="h-16 w-16 rounded-md overflow-hidden bg-gray-100">
                        {product.primary_image ? (
                          <Image
                            src={product.primary_image}
                            alt={product.name}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-gray-400">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M21 19V5C21 3.9 20.1 3 19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19ZM8.5 13.5L11 16.51L14.5 12L19 18H5L8.5 13.5Z" fill="currentColor"/>
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <Link
                          href={`/products/edit/${product.id}`}
                          className="font-medium text-black hover:text-primary dark:text-white"
                        >
                          {product.name}
                        </Link>
                        <span className="text-sm text-gray-500">SKU: {product.sku}</span>
                        <span className="text-xs text-gray-400">{product.brand}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <span className="text-sm text-black dark:text-white">
                      {product.category?.name || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex flex-col">
                      {product.sale_price && product.sale_price < product.price ? (
                        <>
                          <span className="font-medium text-danger">
                            {formatPrice(product.sale_price)}
                          </span>
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.price)}
                          </span>
                        </>
                      ) : (
                        <span className="font-medium text-black dark:text-white">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-5">
                    <span className={`text-sm font-medium ${product.stock_quantity < 10 ? 'text-danger' : 'text-black dark:text-white'}`}>
                      {product.stock_quantity}
                    </span>
                  </td>
                  <td className="px-4 py-5">
                    <button
                      onClick={() => handleToggleActive(product.id)}
                      className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
                        product.is_active
                          ? 'bg-success bg-opacity-10 text-success'
                          : 'bg-danger bg-opacity-10 text-danger'
                      }`}
                    >
                      {product.is_active ? 'Đang bán' : 'Ngừng bán'}
                    </button>
                  </td>
                  <td className="px-4 py-5">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/products/edit/${product.id}`}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
                      >
                        ✏️ Sửa
                      </Link>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="rounded-md bg-danger px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90"
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
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md border border-stroke px-2 py-2 text-gray-400 hover:bg-gray-50 disabled:opacity-50 dark:border-strokedark"
                >
                  <span className="sr-only">Sau</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
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

export default ProductsTable;
