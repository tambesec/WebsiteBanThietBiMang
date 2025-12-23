/**
 * API Utility Functions
 * Helper để xử lý response từ backend
 */

/**
 * Extract data từ backend response
 * Backend wrap response: { success, statusCode, message, data, timestamp }
 */
export function extractData<T>(response: any): T {
  // Try multiple paths: response.data.data (TransformInterceptor) hoặc response.data (direct)
  return response?.data?.data ?? response?.data ?? response;
}

/**
 * Extract array data từ backend pagination response
 * Backend trả về: { data: [...], total, page, limit }
 */
export function extractArrayData<T>(response: any): T[] {
  const data = extractData(response);
  // Nếu data là object có property 'data' (pagination response)
  if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
    return data.data;
  }
  // Nếu data đã là array
  if (Array.isArray(data)) {
    return data;
  }
  return [];
}

/**
 * Extract pagination info từ response
 */
export function extractPagination(response: any): {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} | null {
  const data = extractData(response);
  if (data && typeof data === 'object' && 'total' in data) {
    return {
      total: data.total ?? 0,
      page: data.page ?? 1,
      limit: data.limit ?? 10,
      totalPages: data.totalPages ?? Math.ceil((data.total ?? 0) / (data.limit ?? 10)),
    };
  }
  return null;
}
