// Product type matching backend API response
export type Product = {
  id: number;
  title: string;  // mapped from 'name' in backend
  name?: string;
  slug: string;
  reviews: number; // mapped from 'reviewCount'
  reviewCount?: number;
  price: number;
  discountedPrice?: number; // mapped from 'salePrice'
  salePrice?: number;
  stock?: number;
  rating?: number; // mapped from 'avgRating'
  avgRating?: number;
  description?: string;
  shortDescription?: string;
  brand?: string;
  brandId?: number;
  categoryId?: number;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  isFeatured?: boolean;
  isActive?: boolean;
  specifications?: Record<string, string>;
  tags?: string[];
  viewCount?: number;
  soldCount?: number;
  createdAt?: string;
  updatedAt?: string;
  imgs?: {
    thumbnails: string[];
    previews: string[];
  };
  images?: ProductImage[];
  items?: ProductItem[];
};

export type ProductImage = {
  id: number;
  productId: number;
  imageUrl: string;
  displayOrder: number;
  isPrimary: boolean;
};

export type ProductItem = {
  id: number;
  productId: number;
  sku: string;
  price: number;
  salePrice?: number;
  color?: string;
  size?: string;
  qtyInStock: number;
  warrantyMonths: number;
  isActive: boolean;
};

// Default product images mapping for fallback
const DEFAULT_PRODUCT_IMAGES = [
  '/images/products/product-1-bg-1.png',
  '/images/products/product-2-bg-1.png',
  '/images/products/product-3-bg-1.png',
  '/images/products/product-4-bg-1.png',
  '/images/products/product-5-bg-1.png',
  '/images/products/product-6-bg-1.png',
  '/images/products/product-7-bg-1.png',
  '/images/products/product-8-bg-1.png',
];

// Helper function to transform backend product to frontend format
export function transformProduct(backendProduct: any): Product {
  const thumbnails = backendProduct.images?.map((img: ProductImage) => img.imageUrl) || [];
  const previews = thumbnails; // Use same images for previews
  
  // Get fallback image based on product id
  const fallbackIndex = (backendProduct.id || 1) % DEFAULT_PRODUCT_IMAGES.length;
  const fallbackImage = DEFAULT_PRODUCT_IMAGES[fallbackIndex];
  
  return {
    id: backendProduct.id,
    title: backendProduct.name,
    name: backendProduct.name,
    slug: backendProduct.slug,
    reviews: backendProduct.reviewCount || 0,
    reviewCount: backendProduct.reviewCount || 0,
    price: parseFloat(backendProduct.price) || 0,
    discountedPrice: backendProduct.salePrice ? parseFloat(backendProduct.salePrice) : undefined,
    salePrice: backendProduct.salePrice ? parseFloat(backendProduct.salePrice) : undefined,
    stock: backendProduct.stock || 0,
    rating: parseFloat(backendProduct.avgRating) || 0,
    avgRating: parseFloat(backendProduct.avgRating) || 0,
    description: backendProduct.description,
    shortDescription: backendProduct.shortDescription,
    brand: backendProduct.brand?.name || backendProduct.brand,
    brandId: backendProduct.brandId,
    categoryId: backendProduct.categoryId,
    category: backendProduct.category,
    isFeatured: backendProduct.isFeatured,
    isActive: backendProduct.isActive,
    specifications: backendProduct.specifications,
    tags: backendProduct.tags,
    viewCount: backendProduct.viewCount,
    soldCount: backendProduct.soldCount,
    createdAt: backendProduct.createdAt,
    updatedAt: backendProduct.updatedAt,
    imgs: {
      thumbnails: thumbnails.length > 0 ? thumbnails : [fallbackImage],
      previews: previews.length > 0 ? previews : [fallbackImage],
    },
    images: backendProduct.images,
    items: backendProduct.items,
  };
}
