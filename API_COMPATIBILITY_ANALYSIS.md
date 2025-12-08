# API Compatibility Analysis: Client vs Admin

## Summary

**Tình trạng:** ⚠️ **CHƯA HOÀN TOÀN TƯƠNG THÍCH** - Có sự khác biệt về interface và thiếu một số API quan trọng

## API Modules Comparison

| Module | Client | Admin | Notes |
|--------|--------|-------|-------|
| **Auth** | ✅ authApi | ✅ adminAuthApi | ⚠️ Admin có thêm updateProfile, refreshToken |
| **Products** | ✅ productsApi | ✅ adminProductsApi | ⚠️ Admin có thêm bulk operations, statistics |
| **Categories** | ✅ categoriesApi | ✅ adminCategoriesApi | ⚠️ Admin có thêm CRUD operations |
| **Brands** | ✅ brandsApi | ✅ adminBrandsApi | ⚠️ Admin có thêm CRUD operations |
| **Orders** | ✅ ordersApi | ✅ adminOrdersApi | ⚠️ Admin có thêm statistics, export |
| **Cart** | ✅ cartApi | ❌ | ✅ Client-only (đúng) |
| **Wishlist** | ✅ wishlistApi | ❌ | ❌ **THIẾU trong Admin** |
| **Reviews** | ✅ reviewsApi | ✅ adminReviewsApi | ⚠️ Khác nhau về chức năng |
| **Addresses** | ✅ addressesApi | ❌ | ❌ **THIẾU trong Admin** |
| **Shipping Methods** | ✅ shippingMethodsApi | ✅ adminShippingMethodsApi | ⚠️ Admin có CRUD, Client chỉ read |
| **Payment Methods** | ✅ paymentMethodsApi | ✅ adminPaymentMethodsApi | ⚠️ Admin có CRUD, Client chỉ read |
| **Discounts** | ✅ discountsApi | ✅ adminDiscountsApi | ⚠️ Admin có CRUD, Client có validate/apply |
| **Users** | ❌ | ✅ adminUsersApi | ✅ Admin-only (đúng) |
| **Dashboard** | ❌ | ✅ adminDashboardApi | ✅ Admin-only (đúng) |
| **Upload** | ❌ | ✅ adminUploadApi | ✅ Admin-only (đúng) |

## Critical Issues Found

### ❌ 1. Admin THIẾU Wishlist Management API
**Problem:** Admin không có cách quản lý wishlist của users
```typescript
// Client có:
export const wishlistApi = {
  getAll, addItem, removeItem, clear, moveToCart, checkItem
}

// Admin KHÔNG CÓ:
export const adminWishlistApi = {
  // MISSING: getAll (lấy tất cả wishlist của users)
  // MISSING: getUserWishlist (lấy wishlist của 1 user cụ thể)
  // MISSING: getStatistics (thống kê wishlist)
  // MISSING: clearUserWishlist (xóa wishlist của user)
}
```

### ❌ 2. Admin THIẾU Addresses Management API
**Problem:** Admin không có cách xem/quản lý địa chỉ của users
```typescript
// Client có:
export const addressesApi = {
  getAll, getById, create, update, delete, setDefault
}

// Admin KHÔNG CÓ:
export const adminAddressesApi = {
  // MISSING: getAllAddresses (lấy tất cả địa chỉ trong hệ thống)
  // MISSING: getUserAddresses (lấy địa chỉ của 1 user)
  // MISSING: deleteAddress (xóa địa chỉ không hợp lệ)
}
```

### ⚠️ 3. Interface Không Khớp Giữa Product

**Client Product:**
```typescript
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;        // ❌ Chỉ ID
  brand: string;           // ❌ Chỉ ID
  stock: number;
  rating: number;
  reviews: number;
  // THIẾU: isActive, isFeatured
}
```

**Admin Product:**
```typescript
export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  salePrice?: number;
  images: string[];
  category: string;
  categoryName?: string;   // ✅ Có tên category
  brand: string;
  brandName?: string;      // ✅ Có tên brand
  stock: number;
  rating: number;
  reviews: number;
  isActive: boolean;       // ✅ Có status
  isFeatured: boolean;     // ✅ Có featured flag
}
```

**Recommendation:** Client Product interface nên có thêm `categoryName`, `brandName` để giảm API calls

### ⚠️ 4. Category Interface Không Khớp

**Client Category:**
```typescript
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  order: number;
  productsCount?: number;
  // THIẾU: isActive, createdAt, updatedAt
}
```

**Admin Category:**
```typescript
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  order: number;
  isActive: boolean;       // ✅ Có status
  productsCount?: number;
  createdAt: string;       // ✅ Có timestamp
  updatedAt: string;       // ✅ Có timestamp
}
```

### ⚠️ 5. Brand Interface Không Khớp

**Client Brand:**
```typescript
export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  productsCount?: number;
  // THIẾU: isActive, createdAt, updatedAt
}
```

**Admin Brand:**
```typescript
export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  isActive: boolean;       // ✅ Có status
  productsCount?: number;
  createdAt: string;       // ✅ Có timestamp
  updatedAt: string;       // ✅ Có timestamp
}
```

### ⚠️ 6. Order Interface Có Thể Không Khớp

**Cần kiểm tra:** Order interface có thể khác nhau về:
- Admin Order có thể có thêm `adminNote`, `trackingNumber`
- Client Order có thể thiếu một số trường admin cần

## API Methods Comparison

### Products API

| Method | Client | Admin | Notes |
|--------|--------|-------|-------|
| getAll | ✅ (8 filters) | ✅ (6 filters) | ⚠️ Admin thiếu color, size, minPrice, maxPrice filters |
| getById | ✅ | ✅ | ✅ |
| getBySlug | ✅ | ❌ | ⚠️ Admin nên có |
| getFeatured | ✅ | ❌ | ⚠️ Admin nên có để preview |
| getNewArrivals | ✅ | ❌ | ⚠️ Admin nên có để preview |
| getBestSellers | ✅ | ❌ | ⚠️ Admin nên có để preview |
| search | ✅ | ❌ | ⚠️ Admin nên có |
| create | ❌ | ✅ | ✅ |
| update | ❌ | ✅ | ✅ |
| delete | ❌ | ✅ | ✅ |
| getStatistics | ❌ | ✅ | ✅ |
| getLowStock | ❌ | ✅ | ✅ |
| bulkDelete | ❌ | ✅ | ✅ |
| bulkUpdateStatus | ❌ | ✅ | ✅ |
| bulkUpdatePrice | ❌ | ✅ | ✅ |

**Recommendation:** 
- Admin nên có `getBySlug`, `search` để preview sản phẩm
- Client filters nên match với admin filters

### Orders API

| Method | Client | Admin | Notes |
|--------|--------|-------|-------|
| getAll / getMyOrders | ✅ | ✅ | ✅ |
| getById | ✅ | ✅ | ✅ |
| create | ✅ | ❌ | ✅ Client-only (đúng) |
| getOrderStats | ✅ | ✅ (getStatistics) | ⚠️ Tên khác nhau |
| trackOrder | ✅ | ❌ | ⚠️ Admin nên có |
| updateStatus | ❌ | ✅ | ✅ Admin-only (đúng) |
| updatePaymentStatus | ❌ | ✅ | ✅ Admin-only (đúng) |
| addNote | ❌ | ✅ | ✅ Admin-only (đúng) |
| cancel | ✅ | ✅ | ✅ |
| getRevenueByPeriod | ❌ | ✅ | ✅ Admin-only (đúng) |
| exportOrders | ❌ | ✅ | ✅ Admin-only (đúng) |
| bulkUpdateStatus | ❌ | ✅ | ✅ Admin-only (đúng) |

### Reviews API

| Method | Client | Admin | Notes |
|--------|--------|-------|-------|
| getMyReviews | ✅ | ❌ | ✅ Client-only (đúng) |
| getByProduct | ✅ | ❌ | ⚠️ Admin nên có để xem reviews |
| create | ✅ | ❌ | ✅ Client-only (đúng) |
| update | ✅ | ❌ | ✅ Client-only (đúng) |
| delete | ✅ | ✅ | ✅ |
| getAll | ❌ | ✅ | ✅ Admin-only (đúng) |
| getById | ❌ | ✅ | ✅ Admin-only (đúng) |
| updateStatus | ❌ | ✅ | ✅ Admin-only (đúng) |
| addReply | ❌ | ✅ | ✅ Admin-only (đúng) |
| bulkUpdateStatus | ❌ | ✅ | ✅ Admin-only (đúng) |
| bulkDelete | ❌ | ✅ | ✅ Admin-only (đúng) |

**Recommendation:** Admin nên có `getByProduct` để xem reviews của sản phẩm cụ thể

### Shipping Methods API

| Method | Client | Admin | Notes |
|--------|--------|-------|-------|
| getAll | ✅ | ✅ | ✅ |
| getById | ✅ | ✅ | ✅ |
| calculateFee | ✅ | ❌ | ⚠️ Admin nên có để test |
| create | ❌ | ✅ | ✅ Admin-only (đúng) |
| update | ❌ | ✅ | ✅ Admin-only (đúng) |
| delete | ❌ | ✅ | ✅ Admin-only (đúng) |
| toggleActive | ❌ | ✅ | ✅ Admin-only (đúng) |

### Payment Methods API

| Method | Client | Admin | Notes |
|--------|--------|-------|-------|
| getAll | ✅ | ✅ | ✅ |
| getById | ✅ | ✅ | ✅ |
| create | ❌ | ✅ | ✅ Admin-only (đúng) |
| update | ❌ | ✅ | ✅ Admin-only (đúng) |
| delete | ❌ | ✅ | ✅ Admin-only (đúng) |
| toggleActive | ❌ | ✅ | ✅ Admin-only (đúng) |

### Discounts API

| Method | Client | Admin | Notes |
|--------|--------|-------|-------|
| validate | ✅ | ❌ | ✅ Client-only (đúng) |
| apply | ✅ | ❌ | ✅ Client-only (đúng) |
| getAvailable | ✅ | ❌ | ✅ Client-only (đúng) |
| getActive | ✅ | ❌ | ⚠️ Admin nên có để preview |
| remove | ✅ | ❌ | ✅ Client-only (đúng) |
| getAll | ❌ | ✅ | ✅ Admin-only (đúng) |
| getById | ❌ | ✅ | ✅ Admin-only (đúng) |
| create | ❌ | ✅ | ✅ Admin-only (đúng) |
| update | ❌ | ✅ | ✅ Admin-only (đúng) |
| delete | ❌ | ✅ | ✅ Admin-only (đúng) |
| toggleActive | ❌ | ✅ | ✅ Admin-only (đúng) |
| getUsageStats | ❌ | ✅ | ✅ Admin-only (đúng) |

## Required Actions

### 🔴 CRITICAL - Must Add to Admin

1. **adminWishlistApi** - Quản lý wishlist của users
```typescript
export const adminWishlistApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Wishlist>>,
  getUserWishlist: async (userId: string): Promise<WishlistItem[]>,
  getStatistics: async (): Promise<{ totalWishlists: number; totalItems: number }>,
  clearUserWishlist: async (userId: string): Promise<void>,
  getMostWishlisted: async (limit?: number): Promise<Product[]>, // Top sản phẩm được yêu thích nhất
}
```

2. **adminAddressesApi** - Quản lý địa chỉ của users
```typescript
export const adminAddressesApi = {
  getAll: async (params?: PaginationParams): Promise<PaginatedResponse<Address>>,
  getUserAddresses: async (userId: string): Promise<Address[]>,
  getById: async (id: string): Promise<Address>,
  delete: async (id: string): Promise<void>,
}
```

### 🟡 IMPORTANT - Should Add to Admin

3. **adminProductsApi enhancements**
```typescript
// Thêm các methods:
getBySlug: async (slug: string): Promise<Product>
search: async (query: string, limit?: number): Promise<Product[]>
getFeatured: async (limit?: number): Promise<Product[]>
getNewArrivals: async (limit?: number): Promise<Product[]>
getBestSellers: async (limit?: number): Promise<Product[]>
```

4. **adminReviewsApi enhancements**
```typescript
// Thêm method:
getByProduct: async (productId: string, params?: PaginationParams): Promise<PaginatedResponse<Review>>
```

5. **adminShippingMethodsApi enhancements**
```typescript
// Thêm method:
calculateFee: async (shippingMethodId: string, weight: number, destination: string): Promise<{ fee: number }>
```

6. **adminDiscountsApi enhancements**
```typescript
// Thêm method:
getActive: async (): Promise<Discount[]> // Để preview active discounts
```

### 🟢 RECOMMENDED - Should Sync Interfaces

7. **Sync Product Interface** - Client nên có đầy đủ fields như Admin
```typescript
// Client Product nên thêm:
categoryName?: string;
brandName?: string;
isActive?: boolean;      // Để client có thể check
isFeatured?: boolean;    // Để client có thể hiển thị badge
```

8. **Sync Category Interface** - Client nên có đầy đủ fields
```typescript
// Client Category nên thêm:
isActive?: boolean;
createdAt?: string;
updatedAt?: string;
```

9. **Sync Brand Interface** - Client nên có đầy đủ fields
```typescript
// Client Brand nên thêm:
isActive?: boolean;
createdAt?: string;
updatedAt?: string;
```

10. **Sync Order Stats Method Name**
- Client: `ordersApi.getOrderStats()`
- Admin: `adminOrdersApi.getStatistics()`
- **Recommendation:** Đổi tên để giống nhau, ví dụ cả 2 đều dùng `getStatistics()`

### 🔵 OPTIONAL - Nice to Have

11. **adminOrdersApi enhancements**
```typescript
// Thêm method:
trackOrder: async (orderId: string): Promise<{ status: string; history: any[] }>
```

## Backend Implementation Priority

### Phase 1 (CRITICAL - Next 1-2 days)
- [ ] Implement `adminWishlistApi` endpoints (5 methods)
- [ ] Implement `adminAddressesApi` endpoints (4 methods)
- [ ] Update Product endpoints to return categoryName, brandName
- [ ] Sync Category/Brand interfaces with isActive field

### Phase 2 (IMPORTANT - Next 3-5 days)
- [ ] Add adminProductsApi: getBySlug, search, getFeatured, getNewArrivals, getBestSellers
- [ ] Add adminReviewsApi: getByProduct
- [ ] Add adminShippingMethodsApi: calculateFee
- [ ] Add adminDiscountsApi: getActive
- [ ] Sync Order getStatistics method name

### Phase 3 (RECOMMENDED - Next 1-2 weeks)
- [ ] Add adminOrdersApi: trackOrder
- [ ] Update all interfaces to include timestamps consistently
- [ ] Add more comprehensive statistics endpoints

## Endpoint Count Summary

| Type | Client | Admin | Total Unique |
|------|--------|-------|--------------|
| **Auth** | 6 | 6 | 10 |
| **Products** | 9 | 13 | 19 |
| **Categories** | 4 | 7 | 8 |
| **Brands** | 4 | 6 | 7 |
| **Orders** | 6 | 10 | 13 |
| **Reviews** | 5 | 7 | 10 |
| **Wishlist** | 6 | 0 | 6 |
| **Addresses** | 6 | 0 | 6 |
| **Shipping** | 3 | 6 | 7 |
| **Payment** | 2 | 6 | 6 |
| **Discounts** | 5 | 7 | 10 |
| **Cart** | 6 | 0 | 6 |
| **Users** | 0 | 7 | 7 |
| **Dashboard** | 0 | 8 | 8 |
| **Upload** | 0 | 2 | 2 |
| **TOTAL** | **62** | **85** | **125** |

## Conclusion

**Status:** ⚠️ APIs CHƯA HOÀN TOÀN TƯƠNG THÍCH

**Main Issues:**
1. ❌ Admin thiếu Wishlist management API (critical)
2. ❌ Admin thiếu Addresses management API (critical)
3. ⚠️ Interfaces không đồng nhất (Product, Category, Brand)
4. ⚠️ Admin thiếu một số helper methods (getBySlug, search, getFeatured, etc.)

**Recommendation:** Cần implement thêm 9 endpoints trong admin và sync interfaces giữa client/admin để đảm bảo tương thích hoàn toàn.
