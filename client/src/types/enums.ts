/**
 * Enums and Constants
 * Maps backend values to frontend display needs
 */

// ============================================================================
// ORDER STATUS
// ============================================================================

/**
 * Order Status IDs from backend database
 * These are the actual IDs in the order_statuses table
 */
export enum OrderStatusId {
  PENDING = 1,
  CONFIRMED = 2,
  PROCESSING = 3,
  SHIPPED = 4,
  DELIVERED = 5,
  CANCELLED = 6,
  RETURNED = 7,
}

/**
 * Order Status Names (as returned by backend)
 * Backend returns title case names like "Pending", "Delivered"
 */
export enum OrderStatusName {
  PENDING = 'Pending',
  CONFIRMED = 'Confirmed',
  PROCESSING = 'Processing',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
  RETURNED = 'Returned',
}

/**
 * Frontend Display Status
 * Lowercase versions for UI logic
 */
export type OrderStatusDisplay = 
  | 'pending' 
  | 'confirmed' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'cancelled' 
  | 'returned';

/**
 * Map backend status ID to display status
 */
export const statusIdToDisplay: Record<OrderStatusId, OrderStatusDisplay> = {
  [OrderStatusId.PENDING]: 'pending',
  [OrderStatusId.CONFIRMED]: 'confirmed',
  [OrderStatusId.PROCESSING]: 'processing',
  [OrderStatusId.SHIPPED]: 'shipped',
  [OrderStatusId.DELIVERED]: 'delivered',
  [OrderStatusId.CANCELLED]: 'cancelled',
  [OrderStatusId.RETURNED]: 'returned',
};

/**
 * Map backend status name to display status
 */
export const statusNameToDisplay = (name: string): OrderStatusDisplay => {
  return name.toLowerCase() as OrderStatusDisplay;
};

/**
 * Status Badge Colors
 */
export const statusColors: Record<OrderStatusDisplay, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  shipped: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  returned: 'bg-gray-100 text-gray-800',
};

/**
 * Status Vietnamese Labels
 */
export const statusLabels: Record<OrderStatusDisplay, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  processing: 'Đang xử lý',
  shipped: 'Đang giao',
  delivered: 'Đã giao',
  cancelled: 'Đã hủy',
  returned: 'Đã trả hàng',
};

/**
 * Check if order can be cancelled by customer
 */
export function canCustomerCancelOrder(statusId: number): boolean {
  return [OrderStatusId.PENDING, OrderStatusId.CONFIRMED].includes(statusId);
}

/**
 * Check if order is in processing state (for stats)
 */
export function isProcessingStatus(statusId: number): boolean {
  return [
    OrderStatusId.CONFIRMED,
    OrderStatusId.PROCESSING,
    OrderStatusId.SHIPPED,
  ].includes(statusId);
}

/**
 * Check if order is completed (for stats)
 */
export function isCompletedStatus(statusId: number): boolean {
  return statusId === OrderStatusId.DELIVERED;
}

// ============================================================================
// PAYMENT METHOD
// ============================================================================

export enum PaymentMethod {
  COD = 'cod',
  BANK_TRANSFER = 'bank_transfer',
  MOMO = 'momo',
  ZALOPAY = 'zalopay',
  VNPAY = 'vnpay',
}

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  [PaymentMethod.COD]: 'Thanh toán khi nhận hàng',
  [PaymentMethod.BANK_TRANSFER]: 'Chuyển khoản ngân hàng',
  [PaymentMethod.MOMO]: 'Ví MoMo',
  [PaymentMethod.ZALOPAY]: 'ZaloPay',
  [PaymentMethod.VNPAY]: 'VNPay',
};

// ============================================================================
// PAYMENT STATUS
// ============================================================================

export enum PaymentStatus {
  UNPAID = 'unpaid',
  PAID = 'paid',
  REFUNDED = 'refunded',
}

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  [PaymentStatus.UNPAID]: 'Chưa thanh toán',
  [PaymentStatus.PAID]: 'Đã thanh toán',
  [PaymentStatus.REFUNDED]: 'Đã hoàn tiền',
};

export const paymentStatusColors: Record<PaymentStatus, string> = {
  [PaymentStatus.UNPAID]: 'bg-yellow-100 text-yellow-800',
  [PaymentStatus.PAID]: 'bg-green-100 text-green-800',
  [PaymentStatus.REFUNDED]: 'bg-gray-100 text-gray-800',
};

// ============================================================================
// SHIPPING METHOD
// ============================================================================

export enum ShippingMethod {
  STANDARD = 'standard',
  EXPRESS = 'express',
  SAME_DAY = 'same_day',
}

export const shippingMethodLabels: Record<ShippingMethod, string> = {
  [ShippingMethod.STANDARD]: 'Giao hàng tiêu chuẩn',
  [ShippingMethod.EXPRESS]: 'Giao hàng nhanh',
  [ShippingMethod.SAME_DAY]: 'Giao hàng trong ngày',
};

// ============================================================================
// ADDRESS TYPE
// ============================================================================

export enum AddressType {
  HOME = 'home',
  OFFICE = 'office',
  OTHER = 'other',
}

export const addressTypeLabels: Record<AddressType, string> = {
  [AddressType.HOME]: 'Nhà riêng',
  [AddressType.OFFICE]: 'Văn phòng',
  [AddressType.OTHER]: 'Khác',
};

// ============================================================================
// REVIEW STATUS
// ============================================================================

export enum ReviewStatus {
  ALL = 'all',
  APPROVED = 'approved',
  PENDING = 'pending',
  REJECTED = 'rejected',
}

export const reviewStatusLabels: Record<ReviewStatus, string> = {
  [ReviewStatus.ALL]: 'Tất cả',
  [ReviewStatus.APPROVED]: 'Đã duyệt',
  [ReviewStatus.PENDING]: 'Chờ duyệt',
  [ReviewStatus.REJECTED]: 'Đã từ chối',
};

export const reviewStatusColors: Record<ReviewStatus, string> = {
  [ReviewStatus.ALL]: 'bg-gray-100 text-gray-800',
  [ReviewStatus.APPROVED]: 'bg-green-100 text-green-800',
  [ReviewStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
  [ReviewStatus.REJECTED]: 'bg-red-100 text-red-800',
};

// ============================================================================
// DISCOUNT TYPE
// ============================================================================

export enum DiscountType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
  FREE_SHIPPING = 'free_shipping',
}

export const discountTypeLabels: Record<DiscountType, string> = {
  [DiscountType.PERCENTAGE]: 'Giảm theo phần trăm',
  [DiscountType.FIXED_AMOUNT]: 'Giảm số tiền cố định',
  [DiscountType.FREE_SHIPPING]: 'Miễn phí vận chuyển',
};

// ============================================================================
// USER ROLE
// ============================================================================

export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
}

export const userRoleLabels: Record<UserRole, string> = {
  [UserRole.CUSTOMER]: 'Khách hàng',
  [UserRole.ADMIN]: 'Quản trị viên',
};
