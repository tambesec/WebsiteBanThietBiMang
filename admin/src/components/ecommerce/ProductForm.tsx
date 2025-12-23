"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { categoriesApi } from "@/lib/api-client";

interface ProductFormProps {
  mode: "add" | "edit";
  productData?: any;
}

const ProductForm: React.FC<ProductFormProps> = ({ mode, productData }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: productData?.name || "",
    category_id: productData?.category_id || "",
    brand: productData?.brand || "",
    model: productData?.model || "",
    sku: productData?.sku || "",
    price: productData?.price || "",
    compare_at_price: productData?.compare_at_price || "",
    stock_quantity: productData?.stock_quantity || "",
    warranty_months: productData?.warranty_months || "12",
    description: productData?.description || "",
    specifications: productData?.specifications || "",
    meta_title: productData?.meta_title || "",
    meta_description: productData?.meta_description || "",
    is_active: productData?.is_active ?? true,
  });

  const [primaryImage, setPrimaryImage] = useState<string>(productData?.primary_image || "");
  const [additionalImages, setAdditionalImages] = useState<string[]>(
    productData?.product_images?.map((img: any) => img.image_url) || []
  );
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [imageUrl, setImageUrl] = useState("");

  // Load categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await categoriesApi.categoriesControllerFindAll(
          undefined, // search
          undefined, // parentId
          true, // isActive - only active categories
          false, // includeProductsCount
          "name", // sortBy
          "asc", // sortOrder
          1, // page
          100 // limit - get all active categories
        );
        setCategories(response.data.data?.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, isPrimary: boolean = false) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const imageUrls = Array.from(files).map((file) =>
        URL.createObjectURL(file)
      );
      
      if (isPrimary) {
        setPrimaryImage(imageUrls[0]);
      } else {
        setAdditionalImages((prev) => [...prev, ...imageUrls]);
      }
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddImageUrl = (isPrimary: boolean = false) => {
    if (imageUrl.trim()) {
      if (isPrimary) {
        setPrimaryImage(imageUrl.trim());
      } else {
        setAdditionalImages((prev) => [...prev, imageUrl.trim()]);
      }
      setImageUrl("");
    }
  };

  const handleImageUrlKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, isPrimary: boolean = false) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddImageUrl(isPrimary);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: API call to save product
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      alert(
        mode === "add"
          ? "Thêm sản phẩm thành công!"
          : "Cập nhật sản phẩm thành công!"
      );
      router.push("/products");
    } catch (error) {
      alert("Có lỗi xảy ra. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  const brands = [
    "TP-Link",
    "Asus",
    "D-Link",
    "Tenda",
    "Mercusys",
    "Cisco",
    "Ubiquiti",
    "Aruba",
    "Commscope",
    "AMP",
  ];

  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
        <h3 className="font-medium text-black dark:text-white">
          {mode === "add" ? "Thông tin sản phẩm mới" : "Chỉnh sửa sản phẩm"}
        </h3>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="p-6.5">
          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            {/* Product Name */}
            <div className="w-full xl:w-1/2">
              <label className="mb-2.5 block text-black dark:text-white">
                Tên sản phẩm <span className="text-meta-1">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Nhập tên sản phẩm"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              />
            </div>

            {/* Brand */}
            <div className="w-full xl:w-1/2">
              <label className="mb-2.5 block text-black dark:text-white">
                Thương hiệu <span className="text-meta-1">*</span>
              </label>
              <select
                name="brand"
                value={formData.brand}
                onChange={handleChange}
                required
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              >
                <option value="">Chọn thương hiệu</option>
                {brands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            {/* Category */}
            <div className="w-full xl:w-1/2">
              <label className="mb-2.5 block text-black dark:text-white">
                Danh mục <span className="text-meta-1">*</span>
              </label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                required
                disabled={loadingCategories}
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              >
                <option value="">
                  {loadingCategories ? "Đang tải..." : "Chọn danh mục"}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div className="w-full xl:w-1/2">
              <label className="mb-2.5 block text-black dark:text-white">
                Model
              </label>
              <input
                type="text"
                name="model"
                value={formData.model}
                onChange={handleChange}
                placeholder="Nhập model sản phẩm"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              />
            </div>
          </div>

          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            {/* SKU */}
            <div className="w-full xl:w-1/2">
              <label className="mb-2.5 block text-black dark:text-white">
                SKU <span className="text-meta-1">*</span>
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
                placeholder="Mã SKU (duy nhất)"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              />
            </div>

            {/* Status */}
            <div className="w-full xl:w-1/2">
              <label className="mb-2.5 block text-black dark:text-white">
                Trạng thái <span className="text-meta-1">*</span>
              </label>
              <select
                name="is_active"
                value={formData.is_active ? "true" : "false"}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.value === "true" }))}
                required
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              >
                <option value="true">Đang bán</option>
                <option value="false">Ngừng bán</option>
              </select>
            </div>
          </div>

          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            {/* Price */}
            <div className="w-full xl:w-1/3">
              <label className="mb-2.5 block text-black dark:text-white">
                Giá bán (VNĐ) <span className="text-meta-1">*</span>
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                placeholder="0"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              />
            </div>

            {/* Compare at Price */}
            <div className="w-full xl:w-1/3">
              <label className="mb-2.5 block text-black dark:text-white">
                Giá gốc (VNĐ)
              </label>
              <input
                type="number"
                name="compare_at_price"
                value={formData.compare_at_price}
                onChange={handleChange}
                min="0"
                placeholder="0"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              />
            </div>

            {/* Stock Quantity */}
            <div className="w-full xl:w-1/3">
              <label className="mb-2.5 block text-black dark:text-white">
                Số lượng tồn kho <span className="text-meta-1">*</span>
              </label>
              <input
                type="number"
                name="stock_quantity"
                value={formData.stock_quantity}
                onChange={handleChange}
                required
                min="0"
                placeholder="0"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              />
            </div>
          </div>

          {/* Warranty Months */}
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              Thời hạn bảo hành (tháng)
            </label>
            <input
              type="number"
              name="warranty_months"
              value={formData.warranty_months}
              onChange={handleChange}
              min="0"
              placeholder="12"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            />
          </div>

          {/* Description */}
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              Mô tả chi tiết
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={6}
              placeholder="Mô tả chi tiết về sản phẩm"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            ></textarea>
          </div>

          {/* Specifications */}
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              Thông số kỹ thuật (JSON)
            </label>
            <textarea
              name="specifications"
              value={formData.specifications}
              onChange={handleChange}
              rows={4}
              placeholder='{"speed": "AC1200", "ports": "4x LAN + 1x WAN"}'
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-mono text-sm outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            ></textarea>
          </div>

          {/* SEO Fields */}
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              SEO Meta Title
            </label>
            <input
              type="text"
              name="meta_title"
              value={formData.meta_title}
              onChange={handleChange}
              maxLength={200}
              placeholder="Tiêu đề tối ưu SEO"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            />
          </div>

          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              SEO Meta Description
            </label>
            <textarea
              name="meta_description"
              value={formData.meta_description}
              onChange={handleChange}
              maxLength={500}
              rows={2}
              placeholder="Mô tả tối ưu SEO"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            ></textarea>
          </div>

          {/* Primary Image */}
          <div className="mb-6">
            <label className="mb-2.5 block text-black dark:text-white">
              Ảnh chính sản phẩm
            </label>
            
            {/* Upload Primary Image */}
            <div className="mb-4">
              <label className="mb-2 block text-sm text-bodydark">
                Tải lên từ máy tính
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e, true)}
                className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent font-medium outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:px-5 file:py-3 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
              />
            </div>

            {/* Add Primary Image URL */}
            <div className="mb-4">
              <label className="mb-2 block text-sm text-bodydark">
                Hoặc nhập URL ảnh
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyPress={(e) => handleImageUrlKeyPress(e, true)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => handleAddImageUrl(true)}
                  className="rounded bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-95"
                >
                  Thêm
                </button>
              </div>
            </div>

            {/* Primary Image Preview */}
            {primaryImage && (
              <div className="relative group w-48">
                <Image
                  src={primaryImage}
                  alt="Primary"
                  width={200}
                  height={200}
                  className="h-40 w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPrimaryImage("")}
                  className="absolute top-2 right-2 rounded-full bg-danger p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
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
                      d="M12.225 3.775L8 8L3.775 3.775L3.062 4.488L7.287 8.713L3.062 12.938L3.775 13.651L8 9.426L12.225 13.651L12.938 12.938L8.713 8.713L12.938 4.488L12.225 3.775Z"
                      fill=""
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Additional Images */}
          <div className="mb-6">
            <label className="mb-2.5 block text-black dark:text-white">
              Ảnh bổ sung (nhiều ảnh)
            </label>
            
            {/* Upload Additional Images */}
            <div className="mb-4">
              <label className="mb-2 block text-sm text-bodydark">
                Tải lên từ máy tính
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handleImageUpload(e, false)}
                className="w-full cursor-pointer rounded-lg border-[1.5px] border-stroke bg-transparent font-medium outline-none transition file:mr-5 file:border-collapse file:cursor-pointer file:border-0 file:border-r file:border-solid file:border-stroke file:bg-whiter file:px-5 file:py-3 file:hover:bg-primary file:hover:bg-opacity-10 focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:file:border-form-strokedark dark:file:bg-white/30 dark:file:text-white dark:focus:border-primary"
              />
            </div>

            {/* Add Additional Image URL */}
            <div className="mb-4">
              <label className="mb-2 block text-sm text-bodydark">
                Hoặc nhập URL ảnh
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  onKeyPress={(e) => handleImageUrlKeyPress(e, false)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                />
                <button
                  type="button"
                  onClick={() => handleAddImageUrl(false)}
                  className="rounded bg-primary px-6 py-3 font-medium text-white hover:bg-opacity-95"
                >
                  Thêm
                </button>
              </div>
            </div>

            {/* Additional Images Preview */}
            {additionalImages.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {additionalImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <Image
                      src={image}
                      alt={`Additional ${index + 1}`}
                      width={150}
                      height={150}
                      className="h-32 w-full rounded-lg object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeAdditionalImage(index)}
                      className="absolute top-2 right-2 rounded-full bg-danger p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100"
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
                          d="M12.225 3.775L8 8L3.775 3.775L3.062 4.488L7.287 8.713L3.062 12.938L3.775 13.651L8 9.426L12.225 13.651L12.938 12.938L8.713 8.713L12.938 4.488L12.225 3.775Z"
                          fill=""
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex justify-center rounded bg-primary px-6 py-2 font-medium text-gray hover:bg-opacity-95 disabled:opacity-50"
            >
              {loading ? "Đang xử lý..." : mode === "add" ? "Thêm sản phẩm" : "Cập nhật"}
            </button>
            
            <Link
              href="/products"
              className="flex justify-center rounded border border-stroke px-6 py-2 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
            >
              Hủy
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
