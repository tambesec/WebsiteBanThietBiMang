/**
 * Utility functions cho Admin API services
 */

import { AxiosResponse } from 'axios';

/**
 * Unwrap API response để lấy data
 */
export function unwrapResponse<T>(response: AxiosResponse): T {
  return response.data.data || response.data;
}

/**
 * Handle API errors và convert thành messages tiếng Việt
 */
export function getErrorMessage(error: any): string {
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.response.data?.error;

    switch (status) {
      case 400:
        return message || 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại thông tin.';
      case 401:
        return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
      case 403:
        return 'Bạn không có quyền thực hiện thao tác này.';
      case 404:
        return message || 'Không tìm thấy dữ liệu yêu cầu.';
      case 409:
        return message || 'Dữ liệu đã tồn tại trong hệ thống.';
      case 422:
        return message || 'Dữ liệu không đúng định dạng.';
      case 429:
        return 'Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau.';
      case 500:
        return 'Lỗi máy chủ. Vui lòng thử lại sau.';
      case 502:
      case 503:
      case 504:
        return 'Máy chủ đang bảo trì. Vui lòng thử lại sau.';
      default:
        return message || 'Đã xảy ra lỗi. Vui lòng thử lại.';
    }
  } else if (error.request) {
    return 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
  } else {
    return error.message || 'Đã xảy ra lỗi không xác định.';
  }
}
