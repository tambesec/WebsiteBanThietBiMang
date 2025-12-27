/**
 * API Response Type Definitions
 * Matches backend response structures EXACTLY
 * All fields use snake_case as returned by backend
 */

// ============================================================================
// COMMON TYPES
// ============================================================================

export interface PaginationResponse {
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

// ============================================================================
// AUTH & USER TYPES
// ============================================================================

export interface UserResponse {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  avatar?: string;
  role: 'customer' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface LoginResponse {
  message: string;
  user: UserResponse;
  // Tokens in HTTP-only cookies, not in response
}

export interface RegisterResponse {
  message: string;
  user: UserResponse;
}

// ============================================================================
// ORDER STATUS TYPES
// ============================================================================

export interface OrderStatus {
  id: number;
  name: string;
  description?: string;
  display_order: number;
  color: string;
}

// ============================================================================
// ORDER TYPES
// ============================================================================

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name: string;
  sku: string;
  quantity: number;
  price_at_purchase: number;
  subtotal: number;
  product?: ProductBasicInfo; // Optional nested product info
}

export interface OrderSummary {
  id: number;
  order_number: string;
  user_id: number;
  status: OrderStatus;
  status_id: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  items_count: number;
  total_quantity: number;
  subtotal: number;
  shipping_fee: number;
  discount_amount: number;
  total_amount: number;
  payment_method: 'cod' | 'bank_transfer' | 'momo' | 'zalopay' | 'vnpay';
  payment_status: 'unpaid' | 'paid' | 'refunded';
  shipping_method: 'standard' | 'express' | 'same_day';
  created_at: string;
  updated_at: string;
}

export interface OrderDetailed extends OrderSummary {
  items: OrderItem[];
  shipping_address: AddressInfo;
  billing_address?: AddressInfo;
  customer_note?: string;
  discount_code?: string;
  status_history?: OrderStatusHistory[];
}

export interface OrderStatusHistory {
  id: number;
  order_id: number;
  status_id: number;
  status_name: string;
  note?: string;
  created_at: string;
  created_by?: number;
}

export interface OrdersListResponse {
  orders: OrderSummary[];
  pagination: PaginationResponse;
}

// ============================================================================
// PRODUCT TYPES
// ============================================================================

export interface ProductBasicInfo {
  id: number;
  name: string;
  slug: string;
  price: number;
  compare_at_price?: number;
  primary_image?: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  display_order: number;
  is_primary: boolean;
}

export interface CategoryInfo {
  id: number;
  name: string;
  slug: string;
}

export interface ProductResponse {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  brand?: string;
  model?: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  sku: string;
  stock_quantity: number;
  low_stock_threshold: number;
  is_featured: boolean;
  is_active: boolean;
  primary_image?: string;
  specifications?: string; // JSON string
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  created_at: string;
  updated_at: string;
  
  // Relations
  category?: CategoryInfo;
  images?: ProductImage[];
  
  // Computed fields
  average_rating?: number;
  review_count?: number;
}

export interface ProductsListResponse {
  products: ProductResponse[];
  pagination: PaginationResponse;
}

// ============================================================================
// CART TYPES
// ============================================================================

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  quantity: number;
  price: number; // Price at time of adding to cart
  product?: ProductBasicInfo; // Nested product info
}

export interface CartSummary {
  subtotal: number;
  total: number;
  items_count: number;
  discount_amount?: number;
}

export interface CartResponse {
  id: number;
  user_id?: number;
  session_id?: string;
  items: CartItem[];
  summary: CartSummary;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// REVIEW TYPES
// ============================================================================

export interface ReviewUser {
  id: number;
  full_name: string;
  email: string;
  avatar?: string;
}

export interface ReviewResponse {
  id: number;
  user_id: number;
  product_id: number;
  order_id?: number;
  rating: number;
  title?: string;
  comment?: string;
  images?: string[];
  is_verified_purchase: boolean;
  is_approved: boolean;
  admin_reply?: string;
  admin_reply_at?: string;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  
  // Relations
  user?: ReviewUser;
  product?: ProductBasicInfo;
}

export interface ReviewsListResponse {
  reviews: ReviewResponse[];
  pagination?: PaginationResponse;
  summary?: {
    average_rating: number;
    total_reviews: number;
    rating_distribution: {
      [key: string]: number; // "1": 5, "2": 10, etc.
    };
  };
}

// ============================================================================
// ADDRESS TYPES
// ============================================================================

export interface AddressInfo {
  id: number;
  user_id: number;
  recipient_name: string;
  phone: string;
  address_line: string;
  city: string;
  district?: string;
  ward?: string;
  postal_code?: string;
  address_type: 'home' | 'office' | 'other';
  is_default: boolean;
  full_address: string; // Computed by backend
  created_at: string;
  updated_at: string;
}

export type AddressesListResponse = AddressInfo[];

// ============================================================================
// DISCOUNT TYPES
// ============================================================================

export interface DiscountResponse {
  id: number;
  code: string;
  description?: string;
  discount_type: 'percentage' | 'fixed_amount' | 'free_shipping';
  discount_value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  max_uses?: number;
  max_uses_per_user: number;
  current_uses: number;
  is_active: boolean;
  starts_at: string;
  ends_at: string;
  created_at: string;
  updated_at: string;
}

export interface ValidateDiscountResponse {
  valid: boolean;
  discount?: DiscountResponse;
  discount_amount?: number;
  message?: string;
}

// ============================================================================
// DASHBOARD TYPES (Admin)
// ============================================================================

export interface DashboardOverview {
  total_revenue: number;
  total_orders: number;
  total_products: number;
  total_customers: number;
  pending_orders: number;
  low_stock_products: number;
}

export interface RevenueDataPoint {
  period: string;
  revenue: number;
  orders: number;
}

export interface OrdersByStatus {
  status: string;
  count: number;
  color: string;
}

export interface DashboardResponse {
  overview: DashboardOverview;
  revenue_by_period: RevenueDataPoint[];
  orders_by_status: OrdersByStatus[];
  top_products?: Array<{
    product: ProductBasicInfo;
    total_sold: number;
    revenue: number;
  }>;
  recent_orders?: OrderSummary[];
}
