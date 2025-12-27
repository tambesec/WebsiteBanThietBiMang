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
  
  // Store initial data for comparison
  const [initialData] = useState({
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
    primary_image: productData?.primary_image || "",
    additional_images: productData?.product_images?.map((img: any) => img.image_url) || []
  });

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
  const [primaryImageUrl, setPrimaryImageUrl] = useState("");
  const [additionalImageUrl, setAdditionalImageUrl] = useState("");

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

  const handleAddImageUrl = (isPrimary: boolean = false) => {
    const url = isPrimary ? primaryImageUrl : additionalImageUrl;
    
    // Validate URL
    if (!url.trim()) {
      alert('Vui lòng nhập URL ảnh');
      return;
    }
    
    // Check if valid URL
    try {
      const urlObj = new URL(url);
      if (!urlObj.protocol.startsWith('http')) {
        alert('URL phải bắt đầu bằng http:// hoặc https://');
        return;
      }
    } catch (e) {
      alert('URL không hợp lệ. Vui lòng nhập URL đầy đủ (bắt đầu với https://)');
      return;
    }
    
    if (isPrimary) {
      console.log('Setting primary image:', url);
      setPrimaryImage(url.trim());
      setPrimaryImageUrl("");
    } else {
      console.log('Adding additional image:', url);
      setAdditionalImages((prev) => [...prev, url.trim()]);
      setAdditionalImageUrl("");
    }
  };

  const removeAdditionalImage = (index: number) => {
    setAdditionalImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleImageUrlKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, isPrimary: boolean = false) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddImageUrl(isPrimary);
    }
  };

  const validateForm = (): string | null => {
    // Validate required fields
    if (!formData.name.trim()) {
      return "Tên sản phẩm không được để trống";
    }
    if (!formData.category_id) {
      return "Vui lòng chọn danh mục";
    }
    if (!formData.brand) {
      return "Vui lòng chọn thương hiệu";
    }
    if (!formData.sku.trim()) {
      return "SKU không được để trống";
    }
    
    // Validate numbers
    const price = Number(formData.price);
    const comparePrice = formData.compare_at_price ? Number(formData.compare_at_price) : 0;
    const stock = Number(formData.stock_quantity);
    const warranty = formData.warranty_months ? Number(formData.warranty_months) : 0;

    if (isNaN(price) || price <= 0) {
      return "Giá bán phải lớn hơn 0";
    }
    
    if (comparePrice && (isNaN(comparePrice) || comparePrice <= 0)) {
      return "Giá gốc phải lớn hơn 0";
    }

    // Validate price logic: sale price must be <= compare price
    if (comparePrice > 0 && price > comparePrice) {
      return "Giá bán không được cao hơn giá gốc";
    }

    if (isNaN(stock) || stock < 0) {
      return "Số lượng tồn kho phải >= 0";
    }

    if (warranty && (isNaN(warranty) || warranty < 0)) {
      return "Thời hạn bảo hành phải >= 0";
    }

    // Validate JSON if provided
    if (formData.specifications && formData.specifications.trim()) {
      try {
        JSON.parse(formData.specifications);
      } catch {
        return "Thông số kỹ thuật phải là JSON hợp lệ";
      }
    }

    return null;
  };

  const hasChanges = (): boolean => {
    // Skip change detection for add mode
    if (mode === "add") {
      return true;
    }

    console.log('=== Checking for changes ===');
    console.log('Current primaryImage:', primaryImage);
    console.log('Initial primary_image:', initialData.primary_image);
    console.log('Current additionalImages:', additionalImages);
    console.log('Initial additionalImages:', initialData.additional_images);

    // Compare form data
    for (const key in formData) {
      const currentValue = String(formData[key as keyof typeof formData] ?? "");
      const initialValue = String(initialData[key as keyof typeof initialData] ?? "");
      if (currentValue !== initialValue) {
        console.log(`Changed field: ${key}`, { current: currentValue, initial: initialValue });
        return true;
      }
    }

    // Compare images - normalize empty strings and undefined
    const currentPrimaryImage = primaryImage || "";
    const initialPrimaryImage = initialData.primary_image || "";
    
    if (currentPrimaryImage !== initialPrimaryImage) {
      console.log('Primary image changed', { current: currentPrimaryImage, initial: initialPrimaryImage });
      return true;
    }

    // Compare additional images (check both length and content)
    if (additionalImages.length !== initialData.additional_images.length) {
      console.log('Additional images count changed', { 
        current: additionalImages.length, 
        initial: initialData.additional_images.length 
      });
      return true;
    }
    
    for (let i = 0; i < additionalImages.length; i++) {
      if (additionalImages[i] !== initialData.additional_images[i]) {
        console.log('Additional image changed at index', i, {
          current: additionalImages[i],
          initial: initialData.additional_images[i]
        });
        return true;
      }
    }

    console.log('No changes detected');
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Auto-add pending image URLs if user forgot to click "Thêm"
    if (primaryImageUrl.trim() && !primaryImage) {
      setPrimaryImage(primaryImageUrl.trim());
      alert("Đã tự động thêm ảnh chính từ URL bạn nhập. Vui lòng nhấn Cập nhật lại.");
      return;
    }
    
    if (additionalImageUrl.trim()) {
      setAdditionalImages((prev) => [...prev, additionalImageUrl.trim()]);
      setAdditionalImageUrl("");
      alert("Đã tự động thêm ảnh phụ từ URL bạn nhập. Vui lòng nhấn Cập nhật lại.");
      return;
    }

    // Validate form
    const validationError = validateForm();
    if (validationError) {
      alert(validationError);
      return;
    }

    // Check for changes (only in edit mode)
    if (mode === "edit" && !hasChanges()) {
      alert("Không có thay đổi nào để cập nhật!");
      return;
    }

    // Confirm before saving
    const confirmMessage = mode === "edit" 
      ? `Bạn có chắc muốn cập nhật sản phẩm "${formData.name}"?`
      : `Bạn có chắc muốn thêm sản phẩm "${formData.name}"?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        category_id: Number(formData.category_id),
        brand: formData.brand,
        model: formData.model || undefined,
        sku: formData.sku,
        price: Number(formData.price),
        compare_at_price: formData.compare_at_price ? Number(formData.compare_at_price) : undefined,
        stock_quantity: Number(formData.stock_quantity),
        warranty_months: formData.warranty_months ? Number(formData.warranty_months) : undefined,
        description: formData.description || undefined,
        specifications: formData.specifications || undefined,
        meta_title: formData.meta_title || undefined,
        meta_description: formData.meta_description || undefined,
        primary_image: primaryImage || undefined,
        additional_images: additionalImages.length > 0 ? additionalImages : undefined,
        is_active: formData.is_active,
      };

      const { productsApi } = await import("@/lib/api-client");

      if (mode === "edit" && productData?.id) {
        await productsApi.productsControllerUpdate(productData.id, payload);
      } else {
        // TODO: Add create product API call when ready
        await productsApi.productsControllerCreate(payload);
      }
      
      alert(
        mode === "add"
          ? "Thêm sản phẩm thành công!"
          : "Cập nhật sản phẩm thành công!"
      );
      router.push("/products");
    } catch (error: any) {
      console.error("Product save error:", error);
      alert(error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại!");
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
            
            {/* Add Primary Image URL */}
            <div className="mb-4">
              <label className="mb-2 block text-sm text-bodydark">
                Nhập URL ảnh (khuyến nghị dùng Cloudinary)
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={primaryImageUrl}
                    onChange={(e) => setPrimaryImageUrl(e.target.value)}
                    onKeyPress={(e) => handleImageUrlKeyPress(e, true)}
                    placeholder="https://res.cloudinary.com/your-cloud/image/upload/v1234567890/product.jpg"
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
                <p className="text-xs text-bodydark">
                  💡 Upload ảnh lên <a href="https://cloudinary.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Cloudinary</a> rồi copy URL vào đây
                </p>
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
            
            {/* Add Additional Image URL */}
            <div className="mb-4">
              <label className="mb-2 block text-sm text-bodydark">
                Nhập URL ảnh (khuyến nghị dùng Cloudinary)
              </label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={additionalImageUrl}
                    onChange={(e) => setAdditionalImageUrl(e.target.value)}
                    onKeyPress={(e) => handleImageUrlKeyPress(e, false)}
                    placeholder="https://res.cloudinary.com/your-cloud/image/upload/v1234567890/product.jpg"
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
                <p className="text-xs text-bodydark">
                  💡 Có thể thêm nhiều ảnh, mỗi ảnh 1 URL
                </p>
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
