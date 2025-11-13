// HTTP Status Codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
} as const;

// Error Messages
export const ERROR_MESSAGES = {
    INVALID_CREDENTIALS: 'Tên đăng nhập hoặc mật khẩu không đúng',
    USER_NOT_FOUND: 'Người dùng không tồn tại',
    EMAIL_ALREADY_EXISTS: 'Email đã được sử dụng',
    USERNAME_ALREADY_EXISTS: 'Tên đăng nhập đã được sử dụng',
    UNAUTHORIZED: 'Bạn không được phép truy cập',
    FORBIDDEN: 'Quyền truy cập bị từ chối',
    TOKEN_EXPIRED: 'Token đã hết hạn',
    INVALID_TOKEN: 'Token không hợp lệ',
    PRODUCT_NOT_FOUND: 'Sản phẩm không tồn tại',
    INVALID_QUANTITY: 'Số lượng không hợp lệ',
    OUT_OF_STOCK: 'Sản phẩm hết hàng',
    ORDER_NOT_FOUND: 'Đơn hàng không tồn tại',
    INVALID_DISCOUNT_CODE: 'Mã giảm giá không hợp lệ',
    DISCOUNT_EXPIRED: 'Mã giảm giá đã hết hạn',
    DISCOUNT_LIMIT_EXCEEDED: 'Mã giảm giá đã đạt giới hạn sử dụng',
    CART_EMPTY: 'Giỏ hàng trống',
    INTERNAL_ERROR: 'Lỗi nội bộ server',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
    LOGIN_SUCCESS: 'Đăng nhập thành công',
    LOGOUT_SUCCESS: 'Đăng xuất thành công',
    REGISTER_SUCCESS: 'Đăng ký thành công',
    CREATED: 'Tạo mới thành công',
    UPDATED: 'Cập nhật thành công',
    DELETED: 'Xóa thành công',
    PASSWORD_RESET_SUCCESS: 'Đặt lại mật khẩu thành công',
    PASSWORD_CHANGED_SUCCESS: 'Đổi mật khẩu thành công',
} as const;

// User Roles
export const USER_ROLES = {
    ADMIN: 'admin',
    CUSTOMER: 'customer',
    SELLER: 'seller',
} as const;

// Order Status
export const ORDER_STATUS = {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
    RETURNED: 'returned',
} as const;

// Discount Types
export const DISCOUNT_TYPES = {
    PERCENTAGE: 'percentage',
    FIXED_AMOUNT: 'fixed_amount',
} as const;

// Payment Methods
export const PAYMENT_METHODS = {
    CREDIT_CARD: 'credit_card',
    DEBIT_CARD: 'debit_card',
    BANK_TRANSFER: 'bank_transfer',
    E_WALLET: 'e_wallet',
    CASH_ON_DELIVERY: 'cod',
} as const;

// Shipping Methods
export const SHIPPING_METHODS = {
    STANDARD: 'standard',
    EXPRESS: 'express',
    OVERNIGHT: 'overnight',
    PICKUP: 'pickup',
} as const;

// Pagination Defaults
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
} as const;

// Cache Keys
export const CACHE_KEYS = {
    PRODUCTS: 'products',
    PRODUCT_DETAIL: 'product_detail',
    CATEGORIES: 'categories',
    USER_PROFILE: 'user_profile',
    CART: 'cart',
} as const;

// Token Types
export const TOKEN_TYPES = {
    ACCESS: 'access',
    REFRESH: 'refresh',
    VERIFICATION: 'verification',
    PASSWORD_RESET: 'password_reset',
} as const;

// Address Types
export const ADDRESS_TYPES = {
    SHIPPING: 'shipping',
    BILLING: 'billing',
} as const;

// Product Attributes
export const PRODUCT_ATTRIBUTES = {
    BRAND: 'brand',
    MODEL: 'model',
    WARRANTY: 'warranty',
    SPECIFICATIONS: 'specifications',
} as const;
