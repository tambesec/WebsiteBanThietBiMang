"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// Sample product data - sẽ thay bằng API call
const productsData = [
  {
    id: 1,
    name: "TP-Link TL-WN725N - USB WiFi Nano 150Mbps",
    category: "USB WiFi",
    brand: "TP-Link",
    price: 120000,
    salePrice: 85000,
    stock: 150,
    status: "active",
    image: "/images/products/product-1-sm-1.png",
    sold: 245,
  },
  {
    id: 2,
    name: "TP-Link Archer C6 - Router WiFi AC1200 MU-MIMO",
    category: "Router",
    brand: "TP-Link",
    price: 850000,
    salePrice: 650000,
    stock: 85,
    status: "active",
    image: "/images/products/product-2-sm-1.png",
    sold: 189,
  },
  {
    id: 3,
    name: "TP-Link TL-SG105 - Switch 5 cổng Gigabit",
    category: "Switch",
    brand: "TP-Link",
    price: 550000,
    salePrice: 450000,
    stock: 120,
    status: "active",
    image: "/images/products/product-3-sm-1.png",
    sold: 156,
  },
  {
    id: 4,
    name: "Asus RT-AX55 - Router WiFi 6 AX1800",
    category: "Router",
    brand: "Asus",
    price: 1500000,
    salePrice: 1200000,
    stock: 45,
    status: "active",
    image: "/images/products/product-4-sm-1.png",
    sold: 92,
  },
  {
    id: 5,
    name: "TP-Link EAP245 - Access Point WiFi AC1750 MU-MIMO",
    category: "Access Point",
    brand: "TP-Link",
    price: 2200000,
    salePrice: 1800000,
    stock: 35,
    status: "active",
    image: "/images/products/product-5-sm-1.png",
    sold: 67,
  },
  {
    id: 6,
    name: "Cáp mạng Cat6 UTP Commscope - 100m",
    category: "Cáp mạng",
    brand: "Commscope",
    price: 1200000,
    salePrice: 950000,
    stock: 200,
    status: "active",
    image: "/images/products/product-6-sm-1.png",
    sold: 312,
  },
  {
    id: 7,
    name: "Tenda AC10U - Router WiFi AC1200 Gigabit",
    category: "Router",
    brand: "Tenda",
    price: 750000,
    salePrice: 590000,
    stock: 75,
    status: "active",
    image: "/images/products/product-7-sm-1.png",
    sold: 134,
  },
  {
    id: 8,
    name: "Mercusys MW325R - Router WiFi N300",
    category: "Router",
    brand: "Mercusys",
    price: 300000,
    salePrice: 250000,
    stock: 180,
    status: "active",
    image: "/images/products/product-8-sm-1.png",
    sold: 276,
  },
];

const ProductsTable = () => {
  const [products] = useState(productsData);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");

  // Filter products
  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === "all" || product.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = ["all", ...new Set(products.map((p) => p.category))];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getStockStatus = (stock: number) => {
    if (stock === 0) {
      return (
        <span className="inline-flex rounded-full bg-danger bg-opacity-10 px-3 py-1 text-sm font-medium text-danger">
          Hết hàng
        </span>
      );
    } else if (stock < 50) {
      return (
        <span className="inline-flex rounded-full bg-warning bg-opacity-10 px-3 py-1 text-sm font-medium text-warning">
          Sắp hết
        </span>
      );
    } else {
      return (
        <span className="inline-flex rounded-full bg-success bg-opacity-10 px-3 py-1 text-sm font-medium text-success">
          Còn hàng
        </span>
      );
    }
  };

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      {/* Header */}
      <div className="flex flex-col gap-4 px-4 py-6 md:flex-row md:items-center md:justify-between md:px-6 xl:px-7.5">
        <div className="flex items-center gap-3">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Danh Sách Sản Phẩm
          </h4>
          <span className="inline-flex items-center justify-center rounded-full bg-primary px-2.5 py-0.5 text-sm font-medium text-white">
            {filteredProducts.length}
          </span>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
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

          {/* Category Filter */}
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="rounded-lg border border-stroke bg-transparent px-4 py-2 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "all" ? "Tất cả danh mục" : cat}
              </option>
            ))}
          </select>

          {/* Add Product Button */}
          <Link
            href="/products/add"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-2 text-center font-medium text-white hover:bg-opacity-90"
          >
            <svg
              className="fill-current"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 7H9V1C9 0.4 8.6 0 8 0C7.4 0 7 0.4 7 1V7H1C0.4 7 0 7.4 0 8C0 8.6 0.4 9 1 9H7V15C7 15.6 7.4 16 8 16C8.6 16 9 15.6 9 15V9H15C15.6 9 16 8.6 16 8C16 7.4 15.6 7 15 7Z"
                fill=""
              />
            </svg>
            Thêm Sản Phẩm
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[50px] px-4 py-4 font-medium text-black dark:text-white">
                ID
              </th>
              <th className="min-w-[300px] px-4 py-4 font-medium text-black dark:text-white">
                Sản phẩm
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                Danh mục
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                Thương hiệu
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                Giá gốc
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                Giá KM
              </th>
              <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
                Tồn kho
              </th>
              <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
                Đã bán
              </th>
              <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                Trạng thái
              </th>
              <th className="px-4 py-4 font-medium text-black dark:text-white">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product, key) => (
              <tr key={key} className="border-b border-[#eee] dark:border-strokedark">
                <td className="px-4 py-5">
                  <p className="text-black dark:text-white">#{product.id}</p>
                </td>
                <td className="px-4 py-5">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 flex-shrink-0">
                      <Image
                        src={product.image}
                        width={48}
                        height={48}
                        alt={product.name}
                        className="rounded-md object-cover"
                      />
                    </div>
                    <p className="text-sm text-black dark:text-white">
                      {product.name}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-5">
                  <p className="text-black dark:text-white">
                    {product.category}
                  </p>
                </td>
                <td className="px-4 py-5">
                  <p className="text-black dark:text-white">{product.brand}</p>
                </td>
                <td className="px-4 py-5">
                  <p className="text-black dark:text-white">
                    {formatPrice(product.price)}
                  </p>
                </td>
                <td className="px-4 py-5">
                  <p className="font-medium text-success">
                    {formatPrice(product.salePrice)}
                  </p>
                </td>
                <td className="px-4 py-5">
                  <p className="text-black dark:text-white">{product.stock}</p>
                </td>
                <td className="px-4 py-5">
                  <p className="text-black dark:text-white">{product.sold}</p>
                </td>
                <td className="px-4 py-5">{getStockStatus(product.stock)}</td>
                <td className="px-4 py-5">
                  <div className="flex items-center gap-3">
                    <Link
                      href={`/products/edit/${product.id}`}
                      className="hover:text-primary"
                      title="Chỉnh sửa"
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
                          d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.0973C10.2379 1.74377 10.3504 1.85627 10.3504 1.9969V2.47502H7.70664V1.9969H7.67852ZM4.02227 3.96565C4.02227 3.85315 4.10664 3.74065 4.24727 3.74065H13.7535C13.866 3.74065 13.9785 3.82502 13.9785 3.96565V4.8094C13.9785 4.9219 13.8941 5.0344 13.7535 5.0344H4.24727C4.13477 5.0344 4.02227 4.95002 4.02227 4.8094V3.96565ZM11.7285 16.2563H6.27227C5.79414 16.2563 5.40039 15.8906 5.37227 15.3844L4.95039 6.2719H13.0785L12.6566 15.3844C12.6004 15.8625 12.2066 16.2563 11.7285 16.2563Z"
                          fill=""
                        />
                        <path
                          d="M9.00039 9.11255C8.66289 9.11255 8.35352 9.3938 8.35352 9.75942V13.3313C8.35352 13.6688 8.63477 13.9782 9.00039 13.9782C9.33789 13.9782 9.64727 13.6969 9.64727 13.3313V9.75942C9.64727 9.3938 9.33789 9.11255 9.00039 9.11255Z"
                          fill=""
                        />
                        <path
                          d="M11.2502 9.67504C10.8846 9.64692 10.6033 9.90004 10.5752 10.2657L10.4064 12.7407C10.3783 13.0782 10.6314 13.3875 10.9971 13.4157C11.0252 13.4157 11.0252 13.4157 11.0533 13.4157C11.3908 13.4157 11.6721 13.1625 11.6721 12.825L11.8408 10.35C11.8408 9.98442 11.5877 9.70317 11.2502 9.67504Z"
                          fill=""
                        />
                        <path
                          d="M6.72245 9.67504C6.38495 9.70317 6.1037 10.0125 6.13182 10.35L6.3287 12.825C6.35683 13.1625 6.63808 13.4157 6.94745 13.4157C6.97558 13.4157 6.97558 13.4157 7.0037 13.4157C7.3412 13.3875 7.62245 13.0782 7.59433 12.7407L7.39745 10.2657C7.39745 9.90004 7.08808 9.64692 6.72245 9.67504Z"
                          fill=""
                        />
                      </svg>
                    </Link>
                    <button
                      className="hover:text-danger"
                      title="Xóa"
                      onClick={() => {
                        if (
                          confirm(
                            `Bạn có chắc muốn xóa sản phẩm "${product.name}"?`
                          )
                        ) {
                          // Handle delete
                          alert("Chức năng xóa đang được phát triển");
                        }
                      }}
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
                          d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.0973C10.2379 1.74377 10.3504 1.85627 10.3504 1.9969V2.47502H7.70664V1.9969H7.67852ZM4.02227 3.96565C4.02227 3.85315 4.10664 3.74065 4.24727 3.74065H13.7535C13.866 3.74065 13.9785 3.82502 13.9785 3.96565V4.8094C13.9785 4.9219 13.8941 5.0344 13.7535 5.0344H4.24727C4.13477 5.0344 4.02227 4.95002 4.02227 4.8094V3.96565ZM11.7285 16.2563H6.27227C5.79414 16.2563 5.40039 15.8906 5.37227 15.3844L4.95039 6.2719H13.0785L12.6566 15.3844C12.6004 15.8625 12.2066 16.2563 11.7285 16.2563Z"
                          fill=""
                        />
                        <path
                          d="M9.00039 9.11255C8.66289 9.11255 8.35352 9.3938 8.35352 9.75942V13.3313C8.35352 13.6688 8.63477 13.9782 9.00039 13.9782C9.33789 13.9782 9.64727 13.6969 9.64727 13.3313V9.75942C9.64727 9.3938 9.33789 9.11255 9.00039 9.11255Z"
                          fill=""
                        />
                        <path
                          d="M11.2502 9.67504C10.8846 9.64692 10.6033 9.90004 10.5752 10.2657L10.4064 12.7407C10.3783 13.0782 10.6314 13.3875 10.9971 13.4157C11.0252 13.4157 11.0252 13.4157 11.0533 13.4157C11.3908 13.4157 11.6721 13.1625 11.6721 12.825L11.8408 10.35C11.8408 9.98442 11.5877 9.70317 11.2502 9.67504Z"
                          fill=""
                        />
                        <path
                          d="M6.72245 9.67504C6.38495 9.70317 6.1037 10.0125 6.13182 10.35L6.3287 12.825C6.35683 13.1625 6.63808 13.4157 6.94745 13.4157C6.97558 13.4157 6.97558 13.4157 7.0037 13.4157C7.3412 13.3875 7.62245 13.0782 7.59433 12.7407L7.39745 10.2657C7.39745 9.90004 7.08808 9.64692 6.72245 9.67504Z"
                          fill=""
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {filteredProducts.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-body">Không tìm thấy sản phẩm nào</p>
        </div>
      )}

      {/* Pagination */}
      {filteredProducts.length > 0 && (
        <div className="flex items-center justify-between border-t border-stroke px-6 py-4 dark:border-strokedark">
          <p className="text-sm text-body">
            Hiển thị {filteredProducts.length} sản phẩm
          </p>
          {/* Add pagination component here if needed */}
        </div>
      )}
    </div>
  );
};

export default ProductsTable;
