/**
 * Data Transformation Utilities
 * Consistent transformations between backend responses and frontend display
 */

import type {
  UserResponse,
  OrderSummary,
  OrderDetailed,
  ProductResponse,
  ReviewResponse,
  AddressInfo,
  CartItem,
} from '@/types/api-responses';

import {
  statusIdToDisplay,
  statusNameToDisplay,
  type OrderStatusDisplay,
} from '@/types/enums';

// ============================================================================
// USER TRANSFORMATIONS
// ============================================================================

export interface TransformedUser {
  id: string;
  email: string;
  username: string; // Derived from full_name or email
  firstName: string; // First part of full_name
  lastName: string; // Rest of full_name
  fullName: string; // Original full_name
  phone?: string;
  avatar?: string;
  role?: 'customer' | 'admin';
  createdAt: string;
  updatedAt: string;
}

/**
 * Transform backend user response to frontend format
 * Splits full_name into firstName/lastName
 */
export function transformUser(user: UserResponse): TransformedUser {
  const nameParts = (user.full_name || '').trim().split(' ');
  const firstName = nameParts[0] || '';
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

  return {
    id: String(user.id),
    email: user.email,
    username: user.full_name || user.email.split('@')[0],
    firstName,
    lastName,
    fullName: user.full_name,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };
}

/**
 * Get display name for user (fallback chain)
 */
export function getUserDisplayName(user: UserResponse | TransformedUser | null | undefined): string {
  if (!user) return 'Người dùng';
  
  if ('fullName' in user && user.fullName) return user.fullName;
  if ('full_name' in user && user.full_name) return user.full_name;
  if ('firstName' in user && user.firstName) return user.firstName;
  if (user.email) return user.email.split('@')[0];
  
  return 'Người dùng';
}

// ============================================================================
// ORDER TRANSFORMATIONS
// ============================================================================

export interface TransformedOrderSummary {
  orderId: string; // order_number
  orderIdNumeric: number; // id
  createdAt: string; // Formatted date
  status: OrderStatusDisplay; // Lowercase status
  statusColor: string; // Tailwind class
  statusLabel: string; // Vietnamese label
  total: string; // Formatted currency
  title: string; // Product names joined
  rawOrder: OrderSummary; // Original data
}

/**
 * Transform backend order to display format
 */
export function transformOrderSummary(order: OrderSummary): TransformedOrderSummary {
  const statusDisplay = order.status 
    ? statusNameToDisplay(order.status.name)
    : 'pending';

  // Format date to Vietnamese locale
  const formattedDate = new Date(order.created_at).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  // Get product names from items
  const productNames = order.items
    ? []
    : ['Đơn hàng'];

  return {
    orderId: order.order_number,
    orderIdNumeric: order.id,
    createdAt: formattedDate,
    status: statusDisplay,
    statusColor: getStatusColor(statusDisplay),
    statusLabel: getStatusLabel(statusDisplay),
    total: formatCurrency(order.total_amount),
    title: productNames.join(', '),
    rawOrder: order,
  };
}

/**
 * Get status badge color class
 */
export function getStatusColor(status: OrderStatusDisplay): string {
  const colors: Record<OrderStatusDisplay, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
    returned: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Get status Vietnamese label
 */
export function getStatusLabel(status: OrderStatusDisplay): string {
  const labels: Record<OrderStatusDisplay, string> = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    processing: 'Đang xử lý',
    shipped: 'Đang giao',
    delivered: 'Đã giao',
    cancelled: 'Đã hủy',
    returned: 'Đã trả hàng',
  };
  return labels[status] || 'Không xác định';
}

// ============================================================================
// PRODUCT TRANSFORMATIONS
// ============================================================================

export interface TransformedProduct {
  id: number;
  title: string; // name
  slug: string;
  price: number; // Selling price (actual price)
  regularPrice: number; // Original price (compare_at_price or price if no discount)
  hasDiscount: boolean; // Whether compare_at_price exists and is higher
  discountPercent?: number; // Calculated discount percentage
  stock: number;
  category?: string;
  description?: string;
  brand?: string;
  model?: string;
  specifications?: Record<string, any>;
  averageRating?: number;
  reviewCount?: number;
  imgs: {
    previews: string[];
    thumbnails: string[];
  };
  isActive: boolean;
  isFeatured: boolean;
}

/**
 * Transform backend product to display format
 * FIXES PRICE SEMANTICS:
 * - price = actual selling price (shown as main price)
 * - compare_at_price = original higher price (shown with strikethrough if exists)
 */
export function transformProduct(product: ProductResponse): TransformedProduct {
  // Parse specifications if string
  let specifications: Record<string, any> = {};
  if (product.specifications) {
    try {
      specifications = typeof product.specifications === 'string'
        ? JSON.parse(product.specifications)
        : product.specifications;
    } catch (e) {
      console.error('Failed to parse specifications:', e);
    }
  }

  // Determine if there's a discount
  const hasDiscount = !!(product.compare_at_price && product.compare_at_price > product.price);
  const regularPrice = hasDiscount ? product.compare_at_price! : product.price;
  
  // Calculate discount percentage
  const discountPercent = hasDiscount
    ? Math.round(((regularPrice - product.price) / regularPrice) * 100)
    : undefined;

  // Get images
  const imageUrls = product.images?.length
    ? product.images.map(img => img.image_url)
    : product.primary_image
    ? [product.primary_image]
    : ['/images/products/product-01.png'];

  return {
    id: product.id,
    title: product.name,
    slug: product.slug,
    price: product.price, // THIS IS THE SELLING PRICE
    regularPrice, // THIS IS THE ORIGINAL PRICE (if discount exists)
    hasDiscount,
    discountPercent,
    stock: product.stock_quantity,
    category: product.category?.name,
    description: product.description,
    brand: product.brand,
    model: product.model,
    specifications,
    averageRating: product.average_rating,
    reviewCount: product.review_count,
    imgs: {
      previews: imageUrls,
      thumbnails: imageUrls,
    },
    isActive: product.is_active,
    isFeatured: product.is_featured,
  };
}

/**
 * Get product display price string
 */
export function getProductPriceDisplay(product: TransformedProduct): {
  mainPrice: string;
  oldPrice?: string;
  discountBadge?: string;
} {
  const mainPrice = formatCurrency(product.price);
  
  if (product.hasDiscount) {
    return {
      mainPrice,
      oldPrice: formatCurrency(product.regularPrice),
      discountBadge: `-${product.discountPercent}%`,
    };
  }
  
  return { mainPrice };
}

// ============================================================================
// REVIEW TRANSFORMATIONS
// ============================================================================

export interface TransformedReview {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  isApproved: boolean;
  helpfulCount: number;
  createdAt: string; // Formatted date
  userName: string; // Derived from user.full_name or email
  userAvatar?: string;
}

/**
 * Transform backend review to display format
 */
export function transformReview(review: ReviewResponse): TransformedReview {
  const formattedDate = new Date(review.created_at).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const userName = review.user
    ? review.user.full_name || review.user.email.split('@')[0]
    : 'Người dùng';

  return {
    id: review.id,
    productId: review.product_id,
    userId: review.user_id,
    rating: review.rating,
    title: review.title,
    comment: review.comment,
    images: review.images,
    isVerifiedPurchase: review.is_verified_purchase,
    isApproved: review.is_approved,
    helpfulCount: review.helpful_count,
    createdAt: formattedDate,
    userName,
    userAvatar: review.user?.avatar,
  };
}

// ============================================================================
// CART TRANSFORMATIONS
// ============================================================================

export interface TransformedCartItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  subtotal: number;
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    image?: string;
  };
}

/**
 * Transform cart item
 */
export function transformCartItem(item: CartItem): TransformedCartItem {
  const subtotal = item.price * item.quantity;

  return {
    id: item.id,
    productId: item.product_id,
    quantity: item.quantity,
    price: item.price,
    subtotal,
    product: {
      id: item.product?.id || item.product_id,
      name: item.product?.name || 'Sản phẩm',
      slug: item.product?.slug || '',
      price: item.product?.price || item.price,
      image: item.product?.primary_image,
    },
  };
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format number as Vietnamese currency
 */
export function formatCurrency(amount: number): string {
  return `${amount.toLocaleString('vi-VN')}₫`;
}

/**
 * Format date to Vietnamese format
 */
export function formatDate(dateString: string, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  };
  
  return new Date(dateString).toLocaleDateString('vi-VN', options || defaultOptions);
}

/**
 * Format date with time
 */
export function formatDateTime(dateString: string): string {
  return new Date(dateString).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate average rating from reviews
 */
export function calculateAverageRating(reviews: ReviewResponse[]): number {
  if (!reviews || reviews.length === 0) return 0;
  
  const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
  return Number((sum / reviews.length).toFixed(1));
}

/**
 * Get rating distribution
 */
export function getRatingDistribution(reviews: ReviewResponse[]): Record<number, number> {
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  
  reviews.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      distribution[review.rating]++;
    }
  });
  
  return distribution;
}
