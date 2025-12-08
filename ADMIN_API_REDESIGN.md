# Admin API Redesign Analysis

## Overview
Phân tích và thiết kế lại API service cho Admin Dashboard, tương tự như đã làm với Client. Admin dashboard hiện đang sử dụng dữ liệu tĩnh (hardcoded data) thay vì fetch từ backend API.

## Problems Discovered

### 1. **Static Data Usage**
- **ProductsTable**: Sử dụng `productsData` array tĩnh với 8 sản phẩm hardcoded
- **OrdersTable**: Sử dụng `ordersData` array tĩnh với 5 đơn hàng hardcoded
- **EcommerceMetrics**: Hiển thị số liệu cố định (3,782 khách hàng, 5,359 đơn hàng)
- **RecentOrders**: Sử dụng `tableData` với dữ liệu sản phẩm mẫu (MacBook, iPhone, etc.)
- **MonthlySalesChart**: Sử dụng dữ liệu biểu đồ tĩnh

### 2. **Missing API Integration**
Các component admin không sử dụng API service đã được định nghĩa trong `admin/src/services/api.ts`:
- ProductsTable không gọi `adminProductsApi.getAll()`
- OrdersTable không gọi `adminOrdersApi.getAll()`
- Dashboard metrics không gọi `adminDashboardApi.getStats()`

### 3. **Incomplete API Coverage**
API service thiếu các endpoint quan trọng:
- Reviews management API
- Shipping methods management
- Payment methods management
- Discounts/Coupons management
- Analytics và reporting APIs
- Bulk operations APIs
- Export data APIs

## API Service Enhancements

### **New Interfaces Added**

```typescript
// Review Management
export interface Review {
  id: string;
  userId: string;
  user?: User;
  productId: string;
  product?: Product;
  rating: number;
  comment: string;
  images?: string[];
  isVerified: boolean;
  adminReply?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

// Address Management
export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Analytics Data
export interface AnalyticsData {
  revenue: {
    daily: { date: string; amount: number }[];
    weekly: { week: string; amount: number }[];
    monthly: { month: string; amount: number }[];
    yearly: { year: string; amount: number }[];
  };
  orders: {
    byStatus: { status: string; count: number }[];
    byPaymentMethod: { method: string; count: number }[];
    trend: { date: string; count: number }[];
  };
  products: {
    topSelling: { productId: string; name: string; sold: number }[];
    lowStock: Product[];
    outOfStock: Product[];
  };
  customers: {
    new: number;
    returning: number;
    topSpenders: { userId: string; name: string; totalSpent: number }[];
  };
}

// Shipping Method
export interface ShippingMethod {
  id: string;
  name: string;
  code: string;
  basePrice: number;
  pricePerKg?: number;
  estimatedDays?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Payment Method
export interface PaymentMethod {
  id: string;
  name: string;
  code: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Discount/Coupon
export interface Discount {
  id: string;
  code: string;
  description: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### **Enhanced adminAuthApi**

```typescript
export const adminAuthApi = {
  // ... existing methods
  
  // NEW: Update admin profile
  updateProfile: async (profileData: Partial<AdminUser>): Promise<AdminUser> => {
    const response = await apiClient.put('/api/v1/admin/auth/profile', profileData);
    return response.data;
  },

  // NEW: Refresh access token
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/v1/admin/auth/refresh-token');
    if (response.data.token) {
      localStorage.setItem('admin_token', response.data.token);
      localStorage.setItem('admin_user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
};
```

### **Enhanced adminProductsApi**

```typescript
export const adminProductsApi = {
  // ... existing methods
  
  // NEW: Get product statistics
  getStatistics: async (): Promise<{
    total: number;
    active: number;
    inactive: number;
    lowStock: number;
    outOfStock: number;
  }> => {
    const response = await apiClient.get('/api/v1/admin/products/statistics');
    return response.data;
  },

  // NEW: Get low stock products
  getLowStock: async (threshold: number = 10): Promise<Product[]> => {
    const response = await apiClient.get('/api/v1/admin/products/low-stock', { 
      params: { threshold } 
    });
    return response.data;
  },

  // NEW: Bulk update product status
  bulkUpdateStatus: async (ids: string[], isActive: boolean): Promise<void> => {
    await apiClient.post('/api/v1/admin/products/bulk-update-status', { ids, isActive });
  },

  // NEW: Bulk update product prices
  bulkUpdatePrice: async (updates: { id: string; price?: number; salePrice?: number }[]): Promise<void> => {
    await apiClient.post('/api/v1/admin/products/bulk-update-price', { updates });
  },
};
```

### **Enhanced adminOrdersApi**

```typescript
export const adminOrdersApi = {
  // ... existing methods
  
  // NEW: Get order statistics
  getStatistics: async (period?: 'day' | 'week' | 'month' | 'year'): Promise<{
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    totalRevenue: number;
    averageOrderValue: number;
  }> => {
    const response = await apiClient.get('/api/v1/admin/orders/statistics', { params: { period } });
    return response.data;
  },

  // NEW: Get revenue by period
  getRevenueByPeriod: async (startDate: string, endDate: string): Promise<{
    labels: string[];
    data: number[];
  }> => {
    const response = await apiClient.get('/api/v1/admin/orders/revenue', { 
      params: { startDate, endDate } 
    });
    return response.data;
  },

  // NEW: Export orders to CSV/Excel
  exportOrders: async (params?: { 
    startDate?: string; 
    endDate?: string; 
    status?: string; 
    format?: 'csv' | 'excel' 
  }): Promise<Blob> => {
    const response = await apiClient.get('/api/v1/admin/orders/export', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },

  // NEW: Bulk update order status
  bulkUpdateStatus: async (ids: string[], status: Order['status']): Promise<void> => {
    await apiClient.post('/api/v1/admin/orders/bulk-update-status', { ids, status });
  },
};
```

### **Enhanced adminDashboardApi**

```typescript
export const adminDashboardApi = {
  // ... existing methods
  
  // NEW: Get comprehensive analytics
  getAnalytics: async (startDate?: string, endDate?: string): Promise<AnalyticsData> => {
    const response = await apiClient.get('/api/v1/admin/dashboard/analytics', { 
      params: { startDate, endDate } 
    });
    return response.data;
  },

  // NEW: Get top selling products
  getTopProducts: async (limit: number = 10, period?: string): Promise<Product[]> => {
    const response = await apiClient.get('/api/v1/admin/dashboard/top-products', { 
      params: { limit, period } 
    });
    return response.data;
  },

  // NEW: Get top customers
  getTopCustomers: async (limit: number = 10, period?: string): Promise<User[]> => {
    const response = await apiClient.get('/api/v1/admin/dashboard/top-customers', { 
      params: { limit, period } 
    });
    return response.data;
  },

  // NEW: Get low stock alert
  getLowStockAlert: async (): Promise<Product[]> => {
    const response = await apiClient.get('/api/v1/admin/dashboard/low-stock-alert');
    return response.data;
  },

  // NEW: Get recent activities log
  getRecentActivities: async (limit: number = 20): Promise<{
    id: string;
    type: 'order' | 'product' | 'user' | 'review';
    description: string;
    timestamp: string;
  }[]> => {
    const response = await apiClient.get('/api/v1/admin/dashboard/recent-activities', { 
      params: { limit } 
    });
    return response.data;
  },
};
```

### **NEW: adminReviewsApi**

```typescript
export const adminReviewsApi = {
  // Get all reviews with filters
  getAll: async (params?: PaginationParams & { 
    productId?: string;
    userId?: string;
    rating?: number;
    status?: 'pending' | 'approved' | 'rejected';
  }): Promise<PaginatedResponse<Review>> => {
    const response = await apiClient.get('/api/v1/admin/reviews', { params });
    return response.data;
  },

  // Get review by ID
  getById: async (id: string): Promise<Review> => {
    const response = await apiClient.get(`/api/v1/admin/reviews/${id}`);
    return response.data;
  },

  // Update review status (approve/reject)
  updateStatus: async (id: string, status: 'approved' | 'rejected'): Promise<Review> => {
    const response = await apiClient.patch(`/api/v1/admin/reviews/${id}/status`, { status });
    return response.data;
  },

  // Add admin reply to review
  addReply: async (id: string, reply: string): Promise<Review> => {
    const response = await apiClient.post(`/api/v1/admin/reviews/${id}/reply`, { reply });
    return response.data;
  },

  // Delete review
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/reviews/${id}`);
  },

  // Bulk update review status
  bulkUpdateStatus: async (ids: string[], status: 'approved' | 'rejected'): Promise<void> => {
    await apiClient.post('/api/v1/admin/reviews/bulk-update-status', { ids, status });
  },

  // Bulk delete reviews
  bulkDelete: async (ids: string[]): Promise<void> => {
    await apiClient.post('/api/v1/admin/reviews/bulk-delete', { ids });
  },
};
```

### **NEW: adminShippingMethodsApi**

```typescript
export const adminShippingMethodsApi = {
  // Get all shipping methods
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<ShippingMethod>> => {
    const response = await apiClient.get('/api/v1/admin/shipping-methods', { params });
    return response.data;
  },

  // Get shipping method by ID
  getById: async (id: string): Promise<ShippingMethod> => {
    const response = await apiClient.get(`/api/v1/admin/shipping-methods/${id}`);
    return response.data;
  },

  // Create new shipping method
  create: async (data: Omit<ShippingMethod, 'id' | 'createdAt' | 'updatedAt'>): Promise<ShippingMethod> => {
    const response = await apiClient.post('/api/v1/admin/shipping-methods', data);
    return response.data;
  },

  // Update shipping method
  update: async (id: string, data: Partial<ShippingMethod>): Promise<ShippingMethod> => {
    const response = await apiClient.put(`/api/v1/admin/shipping-methods/${id}`, data);
    return response.data;
  },

  // Delete shipping method
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/shipping-methods/${id}`);
  },

  // Toggle active status
  toggleActive: async (id: string): Promise<ShippingMethod> => {
    const response = await apiClient.patch(`/api/v1/admin/shipping-methods/${id}/toggle-active`);
    return response.data;
  },
};
```

### **NEW: adminPaymentMethodsApi**

```typescript
export const adminPaymentMethodsApi = {
  // Get all payment methods
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<PaymentMethod>> => {
    const response = await apiClient.get('/api/v1/admin/payment-methods', { params });
    return response.data;
  },

  // Get payment method by ID
  getById: async (id: string): Promise<PaymentMethod> => {
    const response = await apiClient.get(`/api/v1/admin/payment-methods/${id}`);
    return response.data;
  },

  // Create new payment method
  create: async (data: Omit<PaymentMethod, 'id' | 'createdAt' | 'updatedAt'>): Promise<PaymentMethod> => {
    const response = await apiClient.post('/api/v1/admin/payment-methods', data);
    return response.data;
  },

  // Update payment method
  update: async (id: string, data: Partial<PaymentMethod>): Promise<PaymentMethod> => {
    const response = await apiClient.put(`/api/v1/admin/payment-methods/${id}`, data);
    return response.data;
  },

  // Delete payment method
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/payment-methods/${id}`);
  },

  // Toggle active status
  toggleActive: async (id: string): Promise<PaymentMethod> => {
    const response = await apiClient.patch(`/api/v1/admin/payment-methods/${id}/toggle-active`);
    return response.data;
  },
};
```

### **NEW: adminDiscountsApi**

```typescript
export const adminDiscountsApi = {
  // Get all discounts
  getAll: async (params?: PaginationParams & { 
    isActive?: boolean;
    discountType?: 'percentage' | 'fixed';
  }): Promise<PaginatedResponse<Discount>> => {
    const response = await apiClient.get('/api/v1/admin/discounts', { params });
    return response.data;
  },

  // Get discount by ID
  getById: async (id: string): Promise<Discount> => {
    const response = await apiClient.get(`/api/v1/admin/discounts/${id}`);
    return response.data;
  },

  // Create new discount
  create: async (data: Omit<Discount, 'id' | 'usedCount' | 'createdAt' | 'updatedAt'>): Promise<Discount> => {
    const response = await apiClient.post('/api/v1/admin/discounts', data);
    return response.data;
  },

  // Update discount
  update: async (id: string, data: Partial<Discount>): Promise<Discount> => {
    const response = await apiClient.put(`/api/v1/admin/discounts/${id}`, data);
    return response.data;
  },

  // Delete discount
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/admin/discounts/${id}`);
  },

  // Toggle active status
  toggleActive: async (id: string): Promise<Discount> => {
    const response = await apiClient.patch(`/api/v1/admin/discounts/${id}/toggle-active`);
    return response.data;
  },

  // Get discount usage statistics
  getUsageStats: async (id: string): Promise<{
    totalUses: number;
    totalDiscount: number;
    orders: Order[];
  }> => {
    const response = await apiClient.get(`/api/v1/admin/discounts/${id}/usage-stats`);
    return response.data;
  },
};
```

## Component Updates

### **ProductsTable.tsx** ✅ FIXED
**Before:**
```typescript
const productsData = [...]; // Hardcoded 8 products
const [products] = useState(productsData);
```

**After:**
```typescript
import { adminProductsApi, Product } from "@/services/api";

const [products, setProducts] = useState<Product[]>([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await adminProductsApi.getAll({
        page, limit: 10, search, category
      });
      setProducts(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      setError('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };
  fetchProducts();
}, [page, searchTerm, filterCategory]);
```

### **OrdersTable.tsx** ✅ FIXED
**Before:**
```typescript
const ordersData = [...]; // Hardcoded 5 orders
const [orders] = useState(ordersData);
```

**After:**
```typescript
import { adminOrdersApi, Order } from "@/services/api";

const [orders, setOrders] = useState<Order[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await adminOrdersApi.getAll({
        page, limit: 10, search, status
      });
      setOrders(response.data);
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };
  fetchOrders();
}, [page, searchTerm, filterStatus]);
```

### **EcommerceMetrics.tsx** ✅ FIXED
**Before:**
```typescript
// Hardcoded values
<h4>3,782</h4> // Users
<h4>5,359</h4> // Orders
```

**After:**
```typescript
import { adminDashboardApi } from "@/services/api";

const [stats, setStats] = useState({ totalUsers: 0, totalOrders: 0 });
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchStats = async () => {
    try {
      const data = await adminDashboardApi.getStats('month');
      setStats({
        totalUsers: data.totalUsers,
        usersGrowth: data.usersGrowth,
        totalOrders: data.totalOrders,
        ordersGrowth: data.ordersGrowth,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };
  fetchStats();
}, []);
```

### **RecentOrders.tsx** ⚠️ NEEDS UPDATE
**Current Issue:** Component hiển thị static product data (MacBook, iPhone) thay vì recent orders

**Should Update To:**
```typescript
import { adminDashboardApi, Order } from "@/services/api";

const [orders, setOrders] = useState<Order[]>([]);

useEffect(() => {
  const fetchRecentOrders = async () => {
    try {
      const stats = await adminDashboardApi.getStats('month');
      setOrders(stats.recentOrders || []);
    } catch (error) {
      console.error('Failed to fetch recent orders:', error);
    }
  };
  fetchRecentOrders();
}, []);
```

### **MonthlySalesChart.tsx** ⚠️ NEEDS UPDATE
**Current Issue:** Using static chart data

**Should Update To:**
```typescript
import { adminDashboardApi } from "@/services/api";

useEffect(() => {
  const fetchChartData = async () => {
    try {
      const data = await adminDashboardApi.getRevenueChart('month');
      setSeries([{ name: 'Bán Hàng', data: data.data }]);
    } catch (error) {
      console.error('Failed to fetch chart data:', error);
    }
  };
  fetchChartData();
}, []);
```

## Backend Implementation Checklist

### **Auth Module** ✅ MOSTLY COMPLETE
- [x] POST /api/v1/admin/auth/login
- [x] POST /api/v1/admin/auth/logout
- [x] GET /api/v1/admin/auth/me
- [x] POST /api/v1/admin/auth/change-password
- [ ] PUT /api/v1/admin/auth/profile
- [ ] POST /api/v1/admin/auth/refresh-token

### **Products Module** ⚠️ NEEDS ENHANCEMENT
- [x] GET /api/v1/admin/products (với pagination & filters)
- [ ] GET /api/v1/admin/products/statistics
- [ ] GET /api/v1/admin/products/low-stock
- [ ] POST /api/v1/admin/products/bulk-update-status
- [ ] POST /api/v1/admin/products/bulk-update-price

### **Orders Module** ⚠️ NEEDS ENHANCEMENT
- [x] GET /api/v1/admin/orders (với pagination & filters)
- [ ] GET /api/v1/admin/orders/statistics
- [ ] GET /api/v1/admin/orders/revenue
- [ ] GET /api/v1/admin/orders/export
- [ ] POST /api/v1/admin/orders/bulk-update-status

### **Dashboard Module** ⚠️ NEEDS ENHANCEMENT
- [x] GET /api/v1/admin/dashboard/stats
- [x] GET /api/v1/admin/dashboard/revenue-chart
- [x] GET /api/v1/admin/dashboard/orders-chart
- [ ] GET /api/v1/admin/dashboard/analytics
- [ ] GET /api/v1/admin/dashboard/top-products
- [ ] GET /api/v1/admin/dashboard/top-customers
- [ ] GET /api/v1/admin/dashboard/low-stock-alert
- [ ] GET /api/v1/admin/dashboard/recent-activities

### **Reviews Module** ❌ MISSING
- [ ] GET /api/v1/admin/reviews
- [ ] GET /api/v1/admin/reviews/:id
- [ ] PATCH /api/v1/admin/reviews/:id/status
- [ ] POST /api/v1/admin/reviews/:id/reply
- [ ] DELETE /api/v1/admin/reviews/:id
- [ ] POST /api/v1/admin/reviews/bulk-update-status
- [ ] POST /api/v1/admin/reviews/bulk-delete

### **Shipping Methods Module** ❌ MISSING
- [ ] GET /api/v1/admin/shipping-methods
- [ ] GET /api/v1/admin/shipping-methods/:id
- [ ] POST /api/v1/admin/shipping-methods
- [ ] PUT /api/v1/admin/shipping-methods/:id
- [ ] DELETE /api/v1/admin/shipping-methods/:id
- [ ] PATCH /api/v1/admin/shipping-methods/:id/toggle-active

### **Payment Methods Module** ❌ MISSING
- [ ] GET /api/v1/admin/payment-methods
- [ ] GET /api/v1/admin/payment-methods/:id
- [ ] POST /api/v1/admin/payment-methods
- [ ] PUT /api/v1/admin/payment-methods/:id
- [ ] DELETE /api/v1/admin/payment-methods/:id
- [ ] PATCH /api/v1/admin/payment-methods/:id/toggle-active

### **Discounts Module** ❌ MISSING
- [ ] GET /api/v1/admin/discounts
- [ ] GET /api/v1/admin/discounts/:id
- [ ] POST /api/v1/admin/discounts
- [ ] PUT /api/v1/admin/discounts/:id
- [ ] DELETE /api/v1/admin/discounts/:id
- [ ] PATCH /api/v1/admin/discounts/:id/toggle-active
- [ ] GET /api/v1/admin/discounts/:id/usage-stats

## Priority Roadmap

### **Phase 1: Critical (Next 1-2 Days)**
1. ✅ Fix ProductsTable to fetch from API
2. ✅ Fix OrdersTable to fetch from API
3. ✅ Fix EcommerceMetrics to fetch from API
4. ⏳ Update RecentOrders component
5. ⏳ Update MonthlySalesChart component
6. ⏳ Implement missing Dashboard API endpoints

### **Phase 2: Important (Next 3-5 Days)**
1. Implement Reviews management (full CRUD)
2. Implement Shipping Methods management
3. Implement Payment Methods management
4. Implement Discounts management
5. Add analytics endpoints
6. Add export functionality

### **Phase 3: Enhancement (Next 1-2 Weeks)**
1. Add bulk operations for all modules
2. Add real-time notifications
3. Add activity logging
4. Add advanced reporting
5. Add data visualization enhancements

## API Endpoints Summary

**Total New Endpoints: 45+**

| Module | Existing | New | Total |
|--------|----------|-----|-------|
| Auth | 4 | 2 | 6 |
| Products | 9 | 4 | 13 |
| Orders | 6 | 4 | 10 |
| Dashboard | 3 | 5 | 8 |
| Reviews | 0 | 7 | 7 |
| Shipping Methods | 0 | 6 | 6 |
| Payment Methods | 0 | 6 | 6 |
| Discounts | 0 | 7 | 7 |
| **TOTAL** | **22** | **41** | **63** |

## Notes

- Backend cần implement **41 endpoints mới**
- Frontend components đã được fix: ProductsTable, OrdersTable, EcommerceMetrics
- Còn cần update: RecentOrders, MonthlySalesChart, StatisticsChart
- Database schema (Prisma) cần add tables: Review, ShippingMethod, PaymentMethod, Discount
- Swagger documentation cần được update với tất cả endpoints mới
