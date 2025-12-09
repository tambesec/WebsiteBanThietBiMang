# 📋 API CONTRACT - Website Bán Thiết Bị Mạng

> **Document Version:** 1.0  
> **Last Updated:** December 2024  
> **Base URL (Dev):** `http://localhost:5000`  
> **Base URL (Prod):** `https://api.nettechpro.me`

---

## 📌 Mục Lục

1. [Thông Tin Chung](#-thông-tin-chung)
2. [Authentication - Client](#-1-authentication---client)
3. [User Profile](#-2-user-profile)
4. [Products](#-3-products)
5. [Categories](#-4-categories)
6. [Brands](#-5-brands)
7. [Shopping Cart](#-6-shopping-cart)
8. [Orders](#-7-orders)
9. [Addresses](#-8-addresses)
10. [Wishlist](#-9-wishlist)
11. [Reviews](#-10-reviews)
12. [Shipping Methods](#-11-shipping-methods)
13. [Payment Methods](#-12-payment-methods)
14. [Discounts](#-13-discounts)
15. [Admin Authentication](#-14-admin-authentication)
16. [Admin Dashboard](#-15-admin-dashboard)
17. [Admin Products](#-16-admin-products)
18. [Admin Categories](#-17-admin-categories)
19. [Admin Brands](#-18-admin-brands)
20. [Admin Orders](#-19-admin-orders)
21. [Admin Users](#-20-admin-users)
22. [Admin Reviews](#-21-admin-reviews)
23. [Admin Shipping Methods](#-22-admin-shipping-methods)
24. [Admin Payment Methods](#-23-admin-payment-methods)
25. [Admin Discounts](#-24-admin-discounts)
26. [Admin Upload](#-25-admin-upload)
27. [APIs Cần Backend Implement](#-apis-cần-backend-implement)

---

## 🔧 Thông Tin Chung

### Headers Mặc Định

```http
Content-Type: application/json
Authorization: Bearer {accessToken}
```

### Response Format Chuẩn

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description",
  "statusCode": 400
}
```

### Pagination Params (Query)

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Trang hiện tại |
| `limit` | number | 10 | Số items mỗi trang |
| `search` | string | - | Từ khóa tìm kiếm |
| `sort` | string | - | Field để sort |
| `order` | 'asc' \| 'desc' | 'desc' | Thứ tự sort |

---

## 🔐 1. Authentication - Client

### 1.1 Đăng Ký

```http
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "username": "string (required, min 3 chars)",
  "email": "string (required, valid email)",
  "password": "string (required, min 12 chars, 1 uppercase, 1 lowercase, 1 number, 1 special)",
  "phone": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  },
  "message": "Đăng ký thành công"
}
```

---

### 1.2 Đăng Nhập

```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "username": "username",
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

---

### 1.3 Đăng Nhập Google

```http
POST /api/v1/auth/google
```

**Request Body:**
```json
{
  "credential": "google_id_token"
}
```

**Response:** Tương tự response đăng nhập

---

### 1.4 Đăng Xuất

```http
POST /api/v1/auth/logout
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Response:**
```json
{
  "success": true,
  "message": "Đăng xuất thành công"
}
```

---

### 1.5 Lấy Thông Tin User Hiện Tại

```http
GET /api/v1/auth/profile
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "username": "string",
    "firstName": "string | null",
    "lastName": "string | null",
    "fullName": "string | null",
    "phone": "string | null",
    "avatar": "string | null",
    "role": "customer | admin",
    "createdAt": "ISO date string",
    "updatedAt": "ISO date string"
  }
}
```

---

### 1.6 Refresh Token

```http
POST /api/v1/auth/refresh
```

**Request Body:**
```json
{
  "refreshToken": "string (optional - có thể lấy từ cookie)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_access_token",
    "refreshToken": "new_jwt_refresh_token"
  }
}
```

---

### 1.7 Đổi Mật Khẩu

```http
POST /api/v1/auth/change-password
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Request Body:**
```json
{
  "oldPassword": "string",
  "password": "string (new password)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công"
}
```

---

### 1.8 Quên Mật Khẩu ⚠️ *Cần implement*

```http
POST /api/v1/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email đặt lại mật khẩu đã được gửi"
}
```

---

### 1.9 Reset Mật Khẩu ⚠️ *Cần implement*

```http
POST /api/v1/auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "string"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Đặt lại mật khẩu thành công"
}
```

---

## 👤 2. User Profile

### 2.1 Cập Nhật Profile

```http
PUT /api/v1/users/profile
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Request Body:**
```json
{
  "firstName": "string (optional)",
  "lastName": "string (optional)",
  "phone": "string (optional)",
  "avatar": "string URL (optional)",
  "email": "string (optional)"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "email": "string",
    "username": "string",
    "firstName": "string",
    "lastName": "string",
    "phone": "string",
    "avatar": "string",
    "updatedAt": "ISO date string"
  }
}
```

---

## 📦 3. Products

### 3.1 Lấy Danh Sách Sản Phẩm

```http
GET /api/v1/products
```

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Trang |
| `limit` | number | Số sản phẩm/trang |
| `search` | string | Tìm kiếm theo tên |
| `category` | string | Filter theo category ID/slug |
| `categoryId` | string | Filter theo category ID |
| `brand` | string | Filter theo brand |
| `minPrice` | number | Giá tối thiểu |
| `maxPrice` | number | Giá tối đa |
| `color` | string | Filter theo màu |
| `size` | string | Filter theo size |
| `rating` | number | Filter theo rating tối thiểu |
| `isActive` | boolean | Filter sản phẩm active |
| `isFeatured` | boolean | Filter sản phẩm nổi bật |
| `sortBy` | string | 'price' \| 'name' \| 'createdAt' \| 'rating' |
| `sortOrder` | string | 'asc' \| 'desc' |

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "string",
        "name": "TP-Link Archer C6",
        "slug": "tp-link-archer-c6",
        "description": "Router WiFi AC1200",
        "price": 850000,
        "salePrice": 650000,
        "images": ["url1", "url2"],
        "category": "router",
        "brand": "TP-Link",
        "stock": 50,
        "rating": 4.5,
        "reviews": 89,
        "specifications": {
          "speed": "AC1200",
          "ports": "4x LAN + 1x WAN"
        },
        "tags": ["wifi", "router", "dual-band"],
        "createdAt": "ISO date",
        "updatedAt": "ISO date"
      }
    ],
    "meta": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  }
}
```

---

### 3.2 Lấy Sản Phẩm Bán Chạy ⚠️ *Cần xác nhận*

```http
GET /api/v1/products/best-sellers
```

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `limit` | number | 6 | Số sản phẩm |

**Response:**
```json
{
  "success": true,
  "data": [
    { "...Product object" }
  ]
}
```

---

### 3.3 Lấy Chi Tiết Sản Phẩm

```http
GET /api/products/{id}
```

**Path Parameters:**
- `id`: Product ID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "slug": "string",
    "description": "string",
    "price": 850000,
    "salePrice": 650000,
    "images": ["url1", "url2"],
    "category": "string",
    "brand": "string",
    "stock": 50,
    "rating": 4.5,
    "reviews": 89,
    "specifications": {},
    "tags": [],
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

---

### 3.4 Lấy Reviews Của Sản Phẩm

```http
GET /api/v1/products/{productId}/reviews
```

**Path Parameters:**
- `productId`: Product ID

**Query Parameters:**
- `page`, `limit`

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": 1,
        "userId": 1,
        "productId": 1,
        "rating": 5,
        "comment": "Sản phẩm tốt",
        "isApproved": true,
        "createdAt": "ISO date",
        "user": {
          "id": 1,
          "username": "user1",
          "avatar": "url"
        }
      }
    ],
    "meta": { "...pagination" }
  }
}
```

---

## 📁 4. Categories

### 4.1 Lấy Tất Cả Danh Mục

```http
GET /api/v1/categories
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "Router",
      "slug": "router",
      "description": "Các loại router",
      "image": "url",
      "parentId": null,
      "order": 1,
      "productsCount": 25
    }
  ]
}
```

---

### 4.2 Lấy Chi Tiết Danh Mục

```http
GET /api/categories/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "name": "string",
    "slug": "string",
    "description": "string",
    "image": "string",
    "parentId": "string | null",
    "order": 1,
    "productsCount": 25
  }
}
```

---

## 🏷️ 5. Brands

### 5.1 Lấy Tất Cả Thương Hiệu

```http
GET /api/v1/brands
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "name": "TP-Link",
      "slug": "tp-link",
      "logo": "url",
      "description": "Thương hiệu thiết bị mạng",
      "website": "https://tp-link.com",
      "productsCount": 35
    }
  ]
}
```

---

### 5.2 Lấy Chi Tiết Thương Hiệu

```http
GET /api/brands/{name}
```

**Response:** Tương tự item trong danh sách

---

## 🛒 6. Shopping Cart

### 6.1 Lấy Giỏ Hàng

```http
GET /api/v1/cart
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "userId": "string",
    "items": [
      {
        "id": "string",
        "productId": "string",
        "product": { "...Product object" },
        "quantity": 2,
        "price": 650000
      }
    ],
    "totalItems": 2,
    "totalPrice": 1300000,
    "updatedAt": "ISO date"
  }
}
```

---

### 6.2 Thêm Sản Phẩm Vào Giỏ

```http
POST /api/v1/cart/items
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Request Body:**
```json
{
  "productItemId": 1,
  "quantity": 1
}
```

**Response:** Cart object (như 6.1)

---

### 6.3 Cập Nhật Số Lượng

```http
PUT /api/v1/cart/items/{itemId}
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response:** Cart object

---

### 6.4 Xóa Sản Phẩm Khỏi Giỏ

```http
DELETE /api/v1/cart/items/{itemId}
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Response:** Cart object

---

### 6.5 Xóa Toàn Bộ Giỏ Hàng

```http
DELETE /api/v1/cart
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Response:**
```json
{
  "success": true,
  "message": "Đã xóa giỏ hàng"
}
```

---

## 📋 7. Orders

### 7.1 Tạo Đơn Hàng

```http
POST /api/v1/orders
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Request Body:**
```json
{
  "addressId": 1,
  "paymentMethodId": 1,
  "shippingMethodId": 1,
  "discountId": null,
  "notes": "Giao giờ hành chính"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "orderNumber": "ORD-20241209-001",
    "userId": "string",
    "items": [
      {
        "productId": "string",
        "product": { "...Product object" },
        "quantity": 2,
        "price": 650000
      }
    ],
    "totalAmount": 1330000,
    "shippingAddress": {
      "fullName": "Nguyễn Văn A",
      "phone": "0901234567",
      "address": "123 Đường ABC",
      "city": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường Bến Nghé"
    },
    "billingAddress": null,
    "paymentMethod": "cod",
    "shippingMethod": "standard",
    "shippingFee": 30000,
    "status": "pending",
    "note": "Giao giờ hành chính",
    "createdAt": "ISO date",
    "updatedAt": "ISO date"
  }
}
```

---

### 7.2 Lấy Danh Sách Đơn Hàng Của User

```http
GET /api/v1/orders/my-orders
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Trang |
| `limit` | number | Số đơn/trang |
| `status` | string | Filter theo trạng thái |

**Response:**
```json
{
  "success": true,
  "data": {
    "data": [
      { "...Order object" }
    ],
    "meta": { "...pagination" }
  }
}
```

---

### 7.3 Lấy Thống Kê Đơn Hàng ⚠️ *Cần xác nhận*

```http
GET /api/v1/orders/stats
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 24,
    "pending": 2,
    "processing": 3,
    "delivered": 18,
    "cancelled": 1
  }
}
```

---

### 7.4 Tracking Đơn Hàng ⚠️ *Cần xác nhận*

```http
GET /api/v1/orders/track/{orderNumber}
```

**Path Parameters:**
- `orderNumber`: Mã đơn hàng (VD: ORD-20241209-001)

**Response:** Order object

---

### 7.5 Chi Tiết Đơn Hàng

```http
GET /api/v1/orders/{id}
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Response:** Order object

---

### 7.6 Hủy Đơn Hàng ⚠️ *Cần xác nhận*

```http
POST /api/v1/orders/{id}/cancel
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Request Body:**
```json
{
  "reason": "Đổi ý không muốn mua nữa"
}
```

**Response:** Order object với status = 'cancelled'

---

## 📍 8. Addresses

### 8.1 Lấy Danh Sách Địa Chỉ

```http
GET /api/v1/users/addresses
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "recipientName": "Nguyễn Văn A",
      "phone": "0901234567",
      "address": "123 Đường ABC",
      "city": "Hồ Chí Minh",
      "district": "Quận 1",
      "ward": "Phường Bến Nghé",
      "isDefault": true,
      "createdAt": "ISO date",
      "updatedAt": "ISO date"
    }
  ]
}
```

---

### 8.2 Lấy Chi Tiết Địa Chỉ

```http
GET /api/v1/users/addresses/{id}
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Response:** Address object

---

### 8.3 Tạo Địa Chỉ Mới

```http
POST /api/v1/users/addresses
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Request Body:**
```json
{
  "recipientName": "Nguyễn Văn A",
  "phone": "0901234567",
  "address": "123 Đường ABC",
  "city": "Hồ Chí Minh",
  "district": "Quận 1",
  "ward": "Phường Bến Nghé",
  "isDefault": false
}
```

**Response:** Address object

---

### 8.4 Cập Nhật Địa Chỉ

```http
PUT /api/v1/users/addresses/{id}
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Request Body:** Partial Address object

**Response:** Address object

---

### 8.5 Xóa Địa Chỉ

```http
DELETE /api/v1/users/addresses/{id}
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Response:**
```json
{
  "success": true,
  "message": "Đã xóa địa chỉ"
}
```

---

## ❤️ 9. Wishlist

### 9.1 Lấy Wishlist

```http
GET /api/v1/wishlist
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "productItemId": 1,
      "product": { "...Product object" },
      "addedAt": "ISO date"
    }
  ]
}
```

---

### 9.2 Thêm Vào Wishlist

```http
POST /api/v1/wishlist/items
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Request Body:**
```json
{
  "productItemId": 1
}
```

**Response:** WishlistItem object

---

### 9.3 Xóa Khỏi Wishlist

```http
DELETE /api/v1/wishlist/items/{productItemId}
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Response:**
```json
{
  "success": true,
  "message": "Đã xóa khỏi wishlist"
}
```

---

### 9.4 Xóa Toàn Bộ Wishlist

```http
DELETE /api/v1/wishlist
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

---

### 9.5 Chuyển Sang Giỏ Hàng ⚠️ *Cần implement*

```http
POST /api/v1/wishlist/items/{productItemId}/move-to-cart
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Request Body:**
```json
{
  "quantity": 1
}
```

---

### 9.6 Kiểm Tra Trong Wishlist ⚠️ *Cần implement*

```http
GET /api/v1/wishlist/check/{productItemId}
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Response:**
```json
{
  "success": true,
  "data": {
    "inWishlist": true
  }
}
```

---

## ⭐ 10. Reviews

### 10.1 Lấy Reviews Của User

```http
GET /api/v1/users/reviews
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "productItemId": 1,
      "rating": 5,
      "comment": "Sản phẩm rất tốt",
      "isApproved": true,
      "createdAt": "ISO date",
      "updatedAt": "ISO date",
      "product": { "...Product summary" }
    }
  ]
}
```

---

### 10.2 Tạo Review Mới

```http
POST /api/v1/users/reviews
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Request Body:**
```json
{
  "productItemId": 1,
  "rating": 5,
  "comment": "Sản phẩm rất tốt, giao hàng nhanh"
}
```

**Response:** Review object

---

### 10.3 Cập Nhật Review

```http
PUT /api/v1/users/reviews/{id}
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Updated comment"
}
```

**Response:** Review object

---

### 10.4 Xóa Review

```http
DELETE /api/v1/users/reviews/{id}
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

---

## 🚚 11. Shipping Methods

### 11.1 Lấy Danh Sách Phương Thức Vận Chuyển

```http
GET /api/v1/shipping-methods
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Giao hàng tiêu chuẩn",
      "code": "standard",
      "basePrice": 30000,
      "pricePerKg": 5000,
      "estimatedDays": 5,
      "isActive": true
    },
    {
      "id": 2,
      "name": "Giao hàng nhanh",
      "code": "express",
      "basePrice": 50000,
      "pricePerKg": 8000,
      "estimatedDays": 2,
      "isActive": true
    }
  ]
}
```

---

### 11.2 Chi Tiết Phương Thức

```http
GET /api/v1/shipping-methods/{id}
```

---

### 11.3 Tính Phí Ship ⚠️ *Cần implement*

```http
POST /api/v1/shipping-methods/calculate
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Request Body:**
```json
{
  "shippingMethodId": 1,
  "addressId": 1,
  "weight": 2.5
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fee": 42500,
    "estimatedDays": 5
  }
}
```

---

## 💳 12. Payment Methods

### 12.1 Lấy Danh Sách Phương Thức Thanh Toán

```http
GET /api/v1/payment-methods
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Thanh toán khi nhận hàng",
      "code": "cod",
      "isActive": true
    },
    {
      "id": 2,
      "name": "Chuyển khoản ngân hàng",
      "code": "bank_transfer",
      "isActive": true
    },
    {
      "id": 3,
      "name": "Ví MoMo",
      "code": "momo",
      "isActive": true
    },
    {
      "id": 4,
      "name": "VNPay",
      "code": "vnpay",
      "isActive": true
    }
  ]
}
```

---

### 12.2 Chi Tiết Phương Thức

```http
GET /api/v1/payment-methods/{id}
```

---

## 🎫 13. Discounts

### 13.1 Validate Mã Giảm Giá

```http
POST /api/v1/discounts/validate
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Request Body:**
```json
{
  "code": "SALE50",
  "cartTotal": 1500000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "valid": true,
    "discount": {
      "id": 1,
      "code": "SALE50",
      "description": "Giảm 50,000đ",
      "discountType": "fixed_amount",
      "discountValue": 50000,
      "minOrderAmount": 500000,
      "startsAt": "ISO date",
      "endsAt": "ISO date"
    },
    "discountAmount": 50000,
    "message": "Áp dụng thành công"
  }
}
```

---

### 13.2 Áp Dụng Mã Giảm Giá

```http
POST /api/v1/discounts/apply
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

**Request Body:**
```json
{
  "code": "SALE50"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "discountAmount": 50000,
    "discount": { "...Discount object" }
  }
}
```

---

### 13.3 Lấy Mã Giảm Giá Có Thể Dùng ⚠️ *Cần implement*

```http
GET /api/v1/discounts/available
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

---

### 13.4 Lấy Mã Giảm Giá Đang Active ⚠️ *Cần implement*

```http
GET /api/v1/discounts/active
```

---

### 13.5 Xóa Mã Giảm Giá Khỏi Cart ⚠️ *Cần implement*

```http
DELETE /api/v1/discounts/remove
```

**Headers:** `Authorization: Bearer {accessToken}` ✅

---

## 🔐 14. Admin Authentication

### 14.1 Admin Login

```http
POST /api/v1/admin/auth/login
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "jwt_admin_token",
  "user": {
    "id": "string",
    "email": "admin@example.com",
    "fullName": "Admin User",
    "role": "admin",
    "avatar": "url",
    "permissions": ["products.manage", "orders.manage"]
  }
}
```

---

### 14.2 Admin Logout

```http
POST /api/v1/admin/auth/logout
```

**Headers:** `Authorization: Bearer {admin_token}` ✅

---

### 14.3 Get Admin Profile

```http
GET /api/v1/admin/auth/me
```

**Headers:** `Authorization: Bearer {admin_token}` ✅

---

### 14.4 Admin Change Password

```http
POST /api/v1/admin/auth/change-password
```

**Headers:** `Authorization: Bearer {admin_token}` ✅

**Request Body:**
```json
{
  "oldPassword": "string",
  "newPassword": "string"
}
```

---

### 14.5 Admin Update Profile

```http
PUT /api/v1/admin/auth/profile
```

**Headers:** `Authorization: Bearer {admin_token}` ✅

---

### 14.6 Admin Refresh Token

```http
POST /api/v1/admin/auth/refresh-token
```

---

## 📊 15. Admin Dashboard

### 15.1 Get Dashboard Stats

```http
GET /api/v1/admin/dashboard/stats
```

**Headers:** `Authorization: Bearer {admin_token}` ✅

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `period` | string | 'month' | 'day' \| 'week' \| 'month' \| 'year' |

**Response:**
```json
{
  "totalRevenue": 125000000,
  "totalOrders": 156,
  "totalProducts": 89,
  "totalUsers": 523,
  "revenueGrowth": 12.5,
  "ordersGrowth": 8.3,
  "productsGrowth": 5.2,
  "usersGrowth": 15.7,
  "recentOrders": [],
  "topProducts": []
}
```

---

### 15.2 Revenue Chart

```http
GET /api/v1/admin/dashboard/revenue-chart
```

**Headers:** `Authorization: Bearer {admin_token}` ✅

**Query:** `period`

**Response:**
```json
{
  "labels": ["T1", "T2", "T3", ...],
  "data": [12000000, 15000000, 18000000, ...]
}
```

---

### 15.3 Orders Chart

```http
GET /api/v1/admin/dashboard/orders-chart
```

**Headers:** `Authorization: Bearer {admin_token}` ✅

---

### 15.4 Analytics

```http
GET /api/v1/admin/dashboard/analytics
```

**Headers:** `Authorization: Bearer {admin_token}` ✅

**Query:** `startDate`, `endDate`

---

### 15.5 Top Products

```http
GET /api/v1/admin/dashboard/top-products
```

**Headers:** `Authorization: Bearer {admin_token}` ✅

**Query:** `limit`, `period`

---

### 15.6 Top Customers

```http
GET /api/v1/admin/dashboard/top-customers
```

**Headers:** `Authorization: Bearer {admin_token}` ✅

**Query:** `limit`, `period`

---

### 15.7 Low Stock Alert

```http
GET /api/v1/admin/dashboard/low-stock-alert
```

**Headers:** `Authorization: Bearer {admin_token}` ✅

---

### 15.8 Recent Activities

```http
GET /api/v1/admin/dashboard/recent-activities
```

**Headers:** `Authorization: Bearer {admin_token}` ✅

**Query:** `limit`

---

## 📦 16. Admin Products

### 16.1 Get All Products

```http
GET /api/v1/admin/products
```

**Headers:** `Authorization: Bearer {admin_token}` ✅

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Trang |
| `limit` | number | Số sản phẩm/trang |
| `search` | string | Tìm kiếm |
| `category` | string | Filter category |
| `brand` | string | Filter brand |
| `isActive` | boolean | Filter active |
| `isFeatured` | boolean | Filter featured |

**Response:** `PaginatedResponse<Product>`

---

### 16.2 Get Product Detail

```http
GET /api/admin/products/{id}
```

**Headers:** `Authorization: Bearer {admin_token}` ✅

---

### 16.3 Create Product

```http
POST /api/v1/admin/products
```

**Headers:** `Authorization: Bearer {admin_token}` ✅

**Request Body:**
```json
{
  "name": "TP-Link Archer C6",
  "description": "Router WiFi AC1200",
  "price": 850000,
  "salePrice": 650000,
  "images": ["url1", "url2"],
  "category": "router",
  "brand": "TP-Link",
  "stock": 50,
  "specifications": {},
  "tags": ["wifi", "router"],
  "isActive": true,
  "isFeatured": false
}
```

---

### 16.4 Update Product

```http
PUT /api/admin/products/{id}
```

**Headers:** `Authorization: Bearer {admin_token}` ✅

---

### 16.5 Delete Product

```http
DELETE /api/admin/products/{id}
```

**Headers:** `Authorization: Bearer {admin_token}` ✅

---

### 16.6 Bulk Delete Products

```http
POST /api/v1/admin/products/bulk-delete
```

**Headers:** `Authorization: Bearer {admin_token}` ✅

**Request Body:**
```json
{
  "ids": ["id1", "id2", "id3"]
}
```

---

### 16.7 Update Stock

```http
PATCH /api/admin/products/{id}/stock
```

**Headers:** `Authorization: Bearer {admin_token}` ✅

**Request Body:**
```json
{
  "stock": 100
}
```

---

### 16.8 Toggle Active

```http
PATCH /api/admin/products/{id}/toggle-active
```

**Headers:** `Authorization: Bearer {admin_token}` ✅

---

### 16.9 Toggle Featured

```http
PATCH /api/admin/products/{id}/toggle-featured
```

**Headers:** `Authorization: Bearer {admin_token}` ✅

---

### 16.10 Upload Images

```http
POST /api/admin/products/{id}/images
```

**Headers:** 
- `Authorization: Bearer {admin_token}` ✅
- `Content-Type: multipart/form-data`

**Request Body:** FormData with `images` files

**Response:**
```json
{
  "success": true,
  "data": ["url1", "url2"]
}
```

---

### 16.11 Product Statistics

```http
GET /api/v1/admin/products/statistics
```

**Headers:** `Authorization: Bearer {admin_token}` ✅

**Response:**
```json
{
  "total": 89,
  "active": 75,
  "inactive": 14,
  "lowStock": 8,
  "outOfStock": 3
}
```

---

### 16.12 Low Stock Products

```http
GET /api/v1/admin/products/low-stock
```

**Headers:** `Authorization: Bearer {admin_token}` ✅

**Query:** `threshold` (default: 10)

---

### 16.13 Bulk Update Status

```http
POST /api/v1/admin/products/bulk-update-status
```

**Headers:** `Authorization: Bearer {admin_token}` ✅

**Request Body:**
```json
{
  "ids": ["id1", "id2"],
  "isActive": true
}
```

---

### 16.14 Bulk Update Price

```http
POST /api/v1/admin/products/bulk-update-price
```

**Headers:** `Authorization: Bearer {admin_token}` ✅

**Request Body:**
```json
{
  "updates": [
    { "id": "id1", "price": 850000, "salePrice": 750000 },
    { "id": "id2", "price": 650000 }
  ]
}
```

---

## 📁 17. Admin Categories

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/v1/admin/categories` | Danh sách (paginated) |
| GET | `/api/admin/categories/{id}` | Chi tiết |
| POST | `/api/v1/admin/categories` | Tạo mới |
| PUT | `/api/admin/categories/{id}` | Cập nhật |
| DELETE | `/api/admin/categories/{id}` | Xóa |
| POST | `/api/v1/admin/categories/reorder` | Sắp xếp lại |
| PATCH | `/api/admin/categories/{id}/toggle-active` | Toggle active |

**Create/Update Body:**
```json
{
  "name": "Router",
  "description": "Các loại router",
  "image": "url",
  "parentId": null,
  "order": 1,
  "isActive": true
}
```

---

## 🏷️ 18. Admin Brands

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/v1/admin/brands` | Danh sách (paginated) |
| GET | `/api/admin/brands/{id}` | Chi tiết |
| POST | `/api/v1/admin/brands` | Tạo mới |
| PUT | `/api/admin/brands/{id}` | Cập nhật |
| DELETE | `/api/admin/brands/{id}` | Xóa |
| PATCH | `/api/admin/brands/{id}/toggle-active` | Toggle active |

**Create/Update Body:**
```json
{
  "name": "TP-Link",
  "logo": "url",
  "description": "Thương hiệu thiết bị mạng",
  "website": "https://tp-link.com",
  "isActive": true
}
```

---

## 📋 19. Admin Orders

### 19.1 Get All Orders

```http
GET /api/v1/admin/orders
```

**Query Parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `page` | number | Trang |
| `limit` | number | Số đơn/trang |
| `search` | string | Tìm kiếm |
| `status` | string | Filter status |
| `paymentStatus` | string | Filter payment status |
| `paymentMethod` | string | Filter payment method |
| `userId` | string | Filter theo user |

---

### 19.2 Get Order Detail

```http
GET /api/admin/orders/{id}
```

---

### 19.3 Update Order Status

```http
PATCH /api/admin/orders/{id}/status
```

**Request Body:**
```json
{
  "status": "processing",
  "adminNote": "Đang chuẩn bị hàng"
}
```

---

### 19.4 Update Payment Status

```http
PATCH /api/admin/orders/{id}/payment-status
```

**Request Body:**
```json
{
  "paymentStatus": "paid"
}
```

---

### 19.5 Add Note

```http
POST /api/admin/orders/{id}/notes
```

**Request Body:**
```json
{
  "note": "Ghi chú admin"
}
```

---

### 19.6 Cancel Order

```http
POST /api/admin/orders/{id}/cancel
```

**Request Body:**
```json
{
  "reason": "Hết hàng"
}
```

---

### 19.7 Order Statistics

```http
GET /api/v1/admin/orders/statistics
```

**Query:** `period`

**Response:**
```json
{
  "total": 156,
  "pending": 12,
  "processing": 8,
  "shipped": 15,
  "delivered": 118,
  "cancelled": 3,
  "totalRevenue": 125000000,
  "averageOrderValue": 801282
}
```

---

### 19.8 Revenue By Period

```http
GET /api/v1/admin/orders/revenue
```

**Query:** `startDate`, `endDate`

---

### 19.9 Export Orders

```http
GET /api/v1/admin/orders/export
```

**Query:** `startDate`, `endDate`, `status`, `format` (csv/excel)

**Response:** Blob file

---

### 19.10 Bulk Update Status

```http
POST /api/v1/admin/orders/bulk-update-status
```

**Request Body:**
```json
{
  "ids": ["id1", "id2"],
  "status": "shipped"
}
```

---

## 👥 20. Admin Users

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/v1/admin/users` | Danh sách (paginated) |
| GET | `/api/admin/users/{id}` | Chi tiết |
| POST | `/api/v1/admin/users` | Tạo user mới |
| PUT | `/api/admin/users/{id}` | Cập nhật |
| DELETE | `/api/admin/users/{id}` | Xóa |
| PATCH | `/api/admin/users/{id}/toggle-active` | Toggle active |
| POST | `/api/admin/users/{id}/reset-password` | Reset mật khẩu |

**Query (GET list):** `page`, `limit`, `search`, `role`, `isActive`

**Create User Body:**
```json
{
  "email": "user@example.com",
  "fullName": "Nguyễn Văn A",
  "phone": "0901234567",
  "role": "customer",
  "isActive": true,
  "password": "password123"
}
```

---

## ⭐ 21. Admin Reviews

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/v1/admin/reviews` | Danh sách |
| GET | `/api/v1/admin/reviews/{id}` | Chi tiết |
| PATCH | `/api/v1/admin/reviews/{id}/status` | Cập nhật status |
| POST | `/api/v1/admin/reviews/{id}/reply` | Thêm reply |
| DELETE | `/api/v1/admin/reviews/{id}` | Xóa |
| POST | `/api/v1/admin/reviews/bulk-update-status` | Bulk update status |
| POST | `/api/v1/admin/reviews/bulk-delete` | Bulk delete |

**Query (GET list):** `page`, `limit`, `productId`, `userId`, `rating`, `status`

**Update Status Body:**
```json
{
  "status": "approved"
}
```

**Add Reply Body:**
```json
{
  "reply": "Cảm ơn bạn đã đánh giá!"
}
```

---

## 🚚 22. Admin Shipping Methods

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/v1/admin/shipping-methods` | Danh sách |
| GET | `/api/v1/admin/shipping-methods/{id}` | Chi tiết |
| POST | `/api/v1/admin/shipping-methods` | Tạo mới |
| PUT | `/api/v1/admin/shipping-methods/{id}` | Cập nhật |
| DELETE | `/api/v1/admin/shipping-methods/{id}` | Xóa |
| PATCH | `/api/v1/admin/shipping-methods/{id}/toggle-active` | Toggle active |

**Create/Update Body:**
```json
{
  "name": "Giao hàng tiêu chuẩn",
  "code": "standard",
  "basePrice": 30000,
  "pricePerKg": 5000,
  "estimatedDays": "3-5 ngày",
  "isActive": true
}
```

---

## 💳 23. Admin Payment Methods

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/v1/admin/payment-methods` | Danh sách |
| GET | `/api/v1/admin/payment-methods/{id}` | Chi tiết |
| POST | `/api/v1/admin/payment-methods` | Tạo mới |
| PUT | `/api/v1/admin/payment-methods/{id}` | Cập nhật |
| DELETE | `/api/v1/admin/payment-methods/{id}` | Xóa |
| PATCH | `/api/v1/admin/payment-methods/{id}/toggle-active` | Toggle active |

**Create/Update Body:**
```json
{
  "name": "Thanh toán khi nhận hàng",
  "code": "cod",
  "description": "Thanh toán tiền mặt khi nhận hàng",
  "logo": "url",
  "isActive": true
}
```

---

## 🎫 24. Admin Discounts

| Method | URL | Description |
|--------|-----|-------------|
| GET | `/api/v1/admin/discounts` | Danh sách |
| GET | `/api/v1/admin/discounts/{id}` | Chi tiết |
| POST | `/api/v1/admin/discounts` | Tạo mới |
| PUT | `/api/v1/admin/discounts/{id}` | Cập nhật |
| DELETE | `/api/v1/admin/discounts/{id}` | Xóa |
| PATCH | `/api/v1/admin/discounts/{id}/toggle-active` | Toggle active |
| GET | `/api/v1/admin/discounts/{id}/usage-stats` | Thống kê sử dụng |

**Query (GET list):** `page`, `limit`, `isActive`, `discountType`

**Create/Update Body:**
```json
{
  "code": "SALE50",
  "description": "Giảm 50,000đ cho đơn từ 500,000đ",
  "discountType": "fixed",
  "discountValue": 50000,
  "minOrderAmount": 500000,
  "maxUses": 100,
  "startsAt": "2024-12-01T00:00:00Z",
  "endsAt": "2024-12-31T23:59:59Z",
  "isActive": true
}
```

---

## 📤 25. Admin Upload

### 25.1 Upload Single Image

```http
POST /api/v1/admin/upload/image
```

**Headers:**
- `Authorization: Bearer {admin_token}` ✅
- `Content-Type: multipart/form-data`

**Request Body:** FormData
- `image`: File
- `type`: 'product' | 'category' | 'brand' | 'user'

**Response:**
```json
{
  "url": "https://storage.example.com/images/xxx.jpg"
}
```

---

### 25.2 Upload Multiple Images

```http
POST /api/v1/admin/upload/images
```

**Headers:**
- `Authorization: Bearer {admin_token}` ✅
- `Content-Type: multipart/form-data`

**Request Body:** FormData
- `images`: File[]
- `type`: 'product' | 'category' | 'brand'

**Response:**
```json
{
  "urls": [
    "https://storage.example.com/images/xxx1.jpg",
    "https://storage.example.com/images/xxx2.jpg"
  ]
}
```

---

## ⚠️ APIs Cần Backend Implement

Các API sau đây được frontend gọi nhưng cần xác nhận hoặc chưa có ở backend:

| # | Endpoint | Method | Module | Priority |
|---|----------|--------|--------|----------|
| 1 | `/api/v1/auth/forgot-password` | POST | Auth | 🔴 High |
| 2 | `/api/v1/auth/reset-password` | POST | Auth | 🔴 High |
| 3 | `/api/v1/products/best-sellers` | GET | Products | 🟡 Medium |
| 4 | `/api/v1/orders/stats` | GET | Orders | 🟡 Medium |
| 5 | `/api/v1/orders/track/{orderNumber}` | GET | Orders | 🟡 Medium |
| 6 | `/api/v1/orders/{id}/cancel` | POST | Orders | 🔴 High |
| 7 | `/api/v1/wishlist/items/{id}/move-to-cart` | POST | Wishlist | 🟢 Low |
| 8 | `/api/v1/wishlist/check/{productItemId}` | GET | Wishlist | 🟢 Low |
| 9 | `/api/v1/shipping-methods/calculate` | POST | Shipping | 🟡 Medium |
| 10 | `/api/v1/discounts/available` | GET | Discounts | 🟢 Low |
| 11 | `/api/v1/discounts/active` | GET | Discounts | 🟢 Low |
| 12 | `/api/v1/discounts/remove` | DELETE | Discounts | 🟢 Low |
| 13 | `/api/v1/admin/dashboard/*` | GET | Dashboard | 🔴 High |
| 14 | `/api/v1/admin/products/bulk-update-status` | POST | Products | 🟡 Medium |
| 15 | `/api/v1/admin/products/bulk-update-price` | POST | Products | 🟡 Medium |
| 16 | `/api/v1/admin/reviews/bulk-update-status` | POST | Reviews | 🟡 Medium |
| 17 | `/api/v1/admin/reviews/bulk-delete` | POST | Reviews | 🟡 Medium |
| 18 | `/api/v1/admin/orders/export` | GET | Orders | 🟡 Medium |
| 19 | `/api/v1/admin/orders/bulk-update-status` | POST | Orders | 🟡 Medium |
| 20 | `/api/v1/admin/discounts/{id}/usage-stats` | GET | Discounts | 🟢 Low |

---

## 📊 Tổng Kết

| Loại | Số Lượng |
|------|----------|
| **Client APIs** | ~50 endpoints |
| **Admin APIs** | ~75 endpoints |
| **Tổng cộng** | ~125 endpoints |
| **APIs cần implement** | ~20 endpoints |

---

## 📝 Ghi Chú

1. **URL Pattern:**
   - Một số endpoint dùng `/api/v1/...` (versioned)
   - Một số endpoint dùng `/api/...` (không versioned)
   - Cần thống nhất pattern

2. **Token Storage:**
   - Client: `localStorage.token`
   - Admin: `localStorage.admin_token`

3. **Response Handling:**
   - Frontend unwrap data từ `response.data.data` hoặc `response.data`
   - Pagination meta từ `response.data.meta`

4. **Error Codes:**
   - 400: Bad Request
   - 401: Unauthorized (auto redirect to login)
   - 403: Forbidden
   - 404: Not Found
   - 500: Server Error

---

*Document generated from frontend code analysis*


