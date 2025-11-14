// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  // Auth
  REGISTER_SUCCESS: 'Đăng ký thành công',
  LOGIN_SUCCESS: 'Đăng nhập thành công',
  LOGOUT_SUCCESS: 'Đăng xuất thành công',
  PASSWORD_CHANGED_SUCCESS: 'Đổi mật khẩu thành công',
  TOKEN_REFRESHED: 'Token đã được làm mới',

  // CRUD
  CREATED_SUCCESS: 'Tạo mới thành công',
  UPDATED_SUCCESS: 'Cập nhật thành công',
  DELETED_SUCCESS: 'Xóa thành công',
  FETCHED_SUCCESS: 'Lấy dữ liệu thành công',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Auth
  EMAIL_ALREADY_EXISTS: 'Email đã được sử dụng',
  USERNAME_ALREADY_EXISTS: 'Tên đăng nhập đã được sử dụng',
  INVALID_CREDENTIALS: 'Email hoặc mật khẩu không đúng',
  USER_NOT_FOUND: 'Người dùng không tồn tại',
  ACCOUNT_DISABLED: 'Tài khoản đã bị vô hiệu hóa',
  INCORRECT_PASSWORD: 'Mật khẩu không đúng',
  TOKEN_INVALID: 'Token không hợp lệ',
  TOKEN_EXPIRED: 'Token đã hết hạn',
  UNAUTHORIZED: 'Bạn không có quyền truy cập',

  // Validation
  INVALID_INPUT: 'Dữ liệu không hợp lệ',
  REQUIRED_FIELD: 'Trường này là bắt buộc',
  INVALID_EMAIL: 'Email không hợp lệ',
  PASSWORD_TOO_SHORT: 'Mật khẩu phải có ít nhất 6 ký tự',
  INVALID_PHONE: 'Số điện thoại không hợp lệ',

  // Generic
  NOT_FOUND: 'Không tìm thấy',
  INTERNAL_ERROR: 'Lỗi hệ thống',
  BAD_REQUEST: 'Yêu cầu không hợp lệ',
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;
