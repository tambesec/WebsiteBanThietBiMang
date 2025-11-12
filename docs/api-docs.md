# 📚 Tài liệu API
**API Backend cho Cửa hàng Thiết bị Mạng**

## 🔗 URL Gốc
```
http://localhost:3000/api/v1
```

---

## 🔐 API Xác thực

### 📝 POST `/auth/register`
**Đăng ký tài khoản mới**
```json
// Request Body
{
  "username": "string (required)",
  "email": "string (required, unique)",
  "password": "string (required, min 8 chars)",
  "phone": "string (optional)"
}

// Response (201)
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "isEmailVerified": false,
      "createdAt": "2025-11-04T10:00:00Z"
    }
  },
  "message": "Đăng ký thành công"
}
```

### 🔑 POST `/auth/login`
**Đăng nhập vào hệ thống**
```json
// Request Body
{
  "email": "string (required)",
  "password": "string (required)"
}

// Response (200)
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "refresh_token_here",
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com",
      "roles": ["user"]
    }
  },
  "message": "Đăng nhập thành công"
}
```

### 🔄 POST `/auth/refresh-token`
**Làm mới access token**
```json
// Request Body
{
  "refreshToken": "string (required)"
}
```

### 🚪 POST `/auth/logout`
**Đăng xuất (cần xác thực)**
```
Headers: Authorization: Bearer {token}
```

### 🔒 POST `/auth/change-password`
**Đổi mật khẩu (cần xác thực)**
```json
// Headers
Authorization: Bearer {token}

// Request Body
{
  "currentPassword": "string (required)",
  "newPassword": "string (required, min 8 chars)"
}
```

---

## 👤 API Người dùng

### 📋 GET `/users/profile`
**Lấy thông tin hồ sơ cá nhân**
```
Headers: Authorization: Bearer {token}

// Response (200)
{
  "success": true,
  "data": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "phone": "+84901234567",
    "isEmailVerified": true,
    "createdAt": "2025-11-04T10:00:00Z"
  }
}
```

### ✏️ PUT `/users/profile`
**Cập nhật thông tin hồ sơ**
```json
// Headers
Authorization: Bearer {token}

// Request Body
{
  "username": "string (optional)",
  "phone": "string (optional)"
}
```

### 🏠 GET `/users/addresses`
**Lấy danh sách địa chỉ**
```
Headers: Authorization: Bearer {token}
```

### ➕ POST `/users/addresses`
**Thêm địa chỉ mới**
```json
// Headers
Authorization: Bearer {token}

// Request Body
{
  "streetAddress": "string (required)",
  "city": "string (required)",
  "region": "string (optional)",
  "postalCode": "string (optional)",
  "country": "string (required)",
  "addressType": "shipping|billing",
  "isDefault": "boolean (optional)"
}
```

### 🔄 PUT `/users/addresses/:id`
**Cập nhật địa chỉ**

### ❌ DELETE `/users/addresses/:id`
**Xóa địa chỉ**

### 📌 PUT `/users/addresses/:id/set-default`
**Đặt làm địa chỉ mặc định**

### 💳 GET `/users/payment-methods`
**Lấy danh sách phương thức thanh toán**

---

## 📦 API Sản phẩm

### 📋 GET `/products`
**Lấy danh sách sản phẩm (có phân trang)**
```
Query Parameters:
- page: số (mặc định: 1)
- limit: số (mặc định: 10, tối đa: 100)
- sort: chuỗi (price_asc, price_desc, name_asc, name_desc, newest)
- category: số (ID danh mục)
- search: chuỗi (tìm kiếm theo tên/mô tả)
- brand: chuỗi
- minPrice: số
- maxPrice: số

// Response (200)
{
  "success": true,
  "data": {
    "products": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "totalPages": 15
    }
  }
}
```

### 🔍 GET `/products/search`
**Tìm kiếm sản phẩm nâng cao**
```
Query Parameters:
- q: chuỗi (từ khóa tìm kiếm)
- category: số
- brand: chuỗi
- minPrice: số
- maxPrice: số
```

### 📂 GET `/products/categories`
**Lấy danh sách danh mục sản phẩm**

### 👁️ GET `/products/:id`
**Lấy chi tiết sản phẩm theo ID**

### 🏷️ GET `/products/slug/:slug`
**Lấy chi tiết sản phẩm theo slug**

### 🖼️ GET `/products/:id/images`
**Lấy danh sách hình ảnh sản phẩm**

### 📋 GET `/products/:id/items`
**Lấy danh sách product items (variants)**

### ➕ POST `/products` (Chỉ Quản trị viên)
**Tạo sản phẩm mới**
```json
// Headers
Authorization: Bearer {token}

// Request Body
{
  "categoryId": "số (bắt buộc)",
  "name": "chuỗi (bắt buộc)",
  "brand": "chuỗi (tùy chọn)",
  "model": "chuỗi (tùy chọn)", 
  "description": "chuỗi (tùy chọn)",
  "images": ["chuỗi"] // URLs
}
```

### ✏️ PUT `/products/:id` (Chỉ Quản trị viên)
**Cập nhật thông tin sản phẩm**

### ❌ DELETE `/products/:id` (Chỉ Quản trị viên)
**Xóa sản phẩm**

---

## 🛒 API Giỏ hàng

### 📋 GET `/cart`
**Lấy giỏ hàng hiện tại**
```
Headers: Authorization: Bearer {token}

// Response (200)
{
  "success": true,
  "data": {
    "id": 1,
    "items": [
      {
        "id": 1,
        "productItem": {
          "id": 1,
          "sku": "NET-SW-24P-001",
          "price": "2500000.00",
          "product": {
            "name": "Switch 24 Port Gigabit"
          }
        },
        "quantity": 2
      }
    ],
    "totalItems": 2,
    "totalAmount": "5000000.00"
  }
}
```

### ➕ POST `/cart/items`
**Thêm sản phẩm vào giỏ hàng**
```json
// Headers
Authorization: Bearer {token}

// Request Body
{
  "productItemId": "số (bắt buộc)",
  "quantity": "số (bắt buộc, tối thiểu: 1)"
}
```

### 🔄 PUT `/cart/items/:id`
**Cập nhật số lượng sản phẩm trong giỏ**
```json
// Request Body
{
  "quantity": "số (bắt buộc, tối thiểu: 1)"
}
```

### ❌ DELETE `/cart/items/:id`
**Xóa sản phẩm khỏi giỏ hàng**

### 🗑️ DELETE `/cart`
**Xóa toàn bộ giỏ hàng**

---

## 🛍️ API Đơn hàng

### 📋 GET `/orders`
**Lấy danh sách đơn hàng của người dùng**
```
Headers: Authorization: Bearer {token}
Query Parameters:
- page: số
- limit: số
- status: chuỗi (pending, confirmed, shipped, delivered, cancelled)
```

### ➕ POST `/orders`
**Tạo đơn hàng mới**
```json
// Headers
Authorization: Bearer {token}

// Request Body
{
  "shippingAddressId": "số (bắt buộc)",
  "billingAddressId": "số (bắt buộc)",
  "paymentMethodId": "số (bắt buộc)",
  "shippingMethodId": "số (bắt buộc)",
  "discountCode": "chuỗi (tùy chọn)",
  "customerNote": "chuỗi (tùy chọn)"
}
```

### 👁️ GET `/orders/:id`
**Lấy chi tiết đơn hàng**

### 📋 GET `/orders/:id/items`
**Lấy danh sách sản phẩm trong đơn hàng**

### 📊 GET `/orders/:id/status-history`
**Lấy lịch sử thay đổi trạng thái đơn hàng**

### ❌ PUT `/orders/:id/cancel`
**Hủy đơn hàng**

### 🔄 PUT `/orders/:id/status` (Chỉ Quản trị viên)
**Cập nhật trạng thái đơn hàng**
```json
// Request Body
{
  "statusId": "số (bắt buộc)",
  "note": "chuỗi (tùy chọn)"
}
```

---

## ⭐ API Đánh giá

### 📋 GET `/reviews/products/:productId`
**Lấy đánh giá của sản phẩm**
```
Query Parameters:
- page: số
- limit: số
- rating: số (1-5)
- sort: chuỗi (newest, oldest, highest_rating, lowest_rating)
```

### 📋 GET `/reviews`
**Lấy đánh giá của người dùng hiện tại**
```
Headers: Authorization: Bearer {token}
```

### ➕ POST `/reviews`
**Tạo đánh giá mới**
```json
// Headers
Authorization: Bearer {token}

// Request Body
{
  "productId": "số (bắt buộc)",
  "orderItemId": "số (tùy chọn)",
  "rating": "số (bắt buộc, 1-5)",
  "comment": "chuỗi (tùy chọn)"
}
```

### ✏️ PUT `/reviews/:id`
**Cập nhật đánh giá**

### ❌ DELETE `/reviews/:id`
**Xóa đánh giá**

### 📋 GET `/reviews/admin/unapproved` (Chỉ Quản trị viên)
**Lấy danh sách đánh giá chưa duyệt**

### ✅ PUT `/reviews/:id/approve` (Chỉ Quản trị viên)
**Duyệt đánh giá**

### ❌ PUT `/reviews/:id/reject` (Chỉ Quản trị viên)
**Từ chối đánh giá**

---

## 💡 Kiểm tra Sức khỏe

### ❤️ GET `/health`
**Kiểm tra trạng thái máy chủ**
```json
// Response (200)
{
  "status": "OK"
}
```

---

## 📋 Định dạng Phản hồi

### ✅ Phản hồi Thành công
```json
{
  "success": true,
  "data": {
    // Dữ liệu trả về
  },
  "message": "Thông báo thành công",
  "pagination": {  // Chỉ có khi có phân trang
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### ❌ Phản hồi Lỗi
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Dữ liệu không hợp lệ",
    "details": {
      "field": "email",
      "value": "invalid-email",
      "message": "Email không đúng định dạng"
    }
  },
  "timestamp": "2025-11-04T10:00:00Z"
}
```

---

## 🔒 Xác thực & Phân quyền

### JWT Token
- **Access Token**: Có hiệu lực 1 giờ
- **Refresh Token**: Có hiệu lực 7 ngày
- **Định dạng Header**: `Authorization: Bearer {access_token}`

### Vai trò
- **user**: Người dùng thông thường
- **admin**: Quản trị viên

### Các endpoint được bảo vệ
- Tất cả endpoints có 🔒 yêu cầu xác thực
- Endpoints có **(Chỉ Quản trị viên)** yêu cầu vai trò admin

---

## 📝 Mã trạng thái

| Mã   | Ý nghĩa |
|------|---------|
| 200  | OK - Thành công |
| 201  | Created - Tạo mới thành công |
| 400  | Bad Request - Dữ liệu không hợp lệ |
| 401  | Unauthorized - Chưa xác thực |
| 403  | Forbidden - Không có quyền |
| 404  | Not Found - Không tìm thấy |
| 409  | Conflict - Xung đột dữ liệu |
| 422  | Validation Error - Lỗi validation |
| 500  | Internal Server Error - Lỗi máy chủ |