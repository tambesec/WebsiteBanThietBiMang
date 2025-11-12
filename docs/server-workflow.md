# 🚀 Tài liệu Luồng hoạt động Máy chủ
**Luồng hoạt động chi tiết của Backend Cửa hàng Thiết bị Mạng**

---

## 📋 Tổng quan Kiến trúc

```
Yêu cầu từ Client → Express Middleware → Router → Controller → Service → Prisma → Cơ sở dữ liệu
                                         ↓
Phản hồi cho Client ← Định dạng Phản hồi ← Dữ liệu đã xác thực ← Logic nghiệp vụ
```

---

## 🔄 1. Quy trình khởi động Máy chủ

### 📁 **Điểm khởi đầu: `src/index.ts`**
```typescript
// 1. Tải các biến môi trường
// 2. Import cấu hình ứng dụng  
// 3. Kết nối đến cơ sở dữ liệu
// 4. Khởi động máy chủ HTTP
```

### ⚙️ **Cấu hình ứng dụng: `src/app.ts`**
```typescript
// 1. Khởi tạo ứng dụng Express
// 2. Thiết lập Middleware Bảo mật (Helmet)
// 3. Cấu hình CORS
// 4. Phân tích Body (JSON/URL-encoded)
// 5. Ghi log (Morgan)
// 6. Middleware Phân trang
// 7. Định tuyến API routes
// 8. Middleware xử lý lỗi
```

### 🏗️ **Khởi động máy chủ: `src/server.ts`**
```typescript
// 1. Xác thực kết nối Prisma
// 2. Ràng buộc máy chủ HTTP
// 3. Xử lý tắt máy chịu được
// 4. Xử lý sự kiện lỗi
```

---

## 🌐 2. Vòng đời của một Yêu cầu HTTP

### **Bước 1: 📥 Tiếp nhận Yêu cầu**
```
Client → Máy chủ Express
├── Phân tích HTTP headers
├── Phân tích request body
└── Tạo đối tượng req/res
```

### **Bước 2: 🛡️ Pipeline Middleware**

#### **A. Middleware Bảo mật**
```typescript
helmet() // Đặt security headers
├── X-Content-Type-Options: nosniff
├── X-Frame-Options: DENY
├── X-XSS-Protection: 1; mode=block
└── Content-Security-Policy
```

#### **B. Middleware CORS**
```typescript
cors({
  origin: env.CORS_ORIGIN,
  credentials: true
})
├── Kiểm tra danh sách origin được phép
├── Đặt Access-Control headers
└── Xử lý preflight requests
```

#### **C. Phân tích Body**
```typescript
express.json({ limit: '10mb' })
├── Phân tích JSON payload
├── Xác thực content-type
└── Gắn vào req.body
```

#### **D. Ghi log**
```typescript
morgan('combined')
├── Ghi log chi tiết yêu cầu
├── Theo dõi thời gian phản hồi
└── Ghi log mã trạng thái
```

#### **E. Middleware Phân trang**
```typescript
paginationMiddleware
├── Phân tích ?page & ?limit
├── Đặt giá trị mặc định (page=1, limit=10)
├── Xác thực ranh giới
└── Gắn vào req.pagination
```

### **Bước 3: 🗺️ Định tuyến**

#### **Quy trình Khớp Route**
```
/api/v1/* → Router API Chính (src/routes/index.ts)
├── /auth/* → authRoutes
├── /products/* → productRoutes  
├── /orders/* → orderRoutes
├── /cart/* → cartRoutes
├── /users/* → userRoutes
├── /reviews/* → reviewRoutes
└── /health → Kiểm tra sức khỏe
```

#### **Middleware theo Route**
```typescript
// Ví dụ: /api/v1/products/*
├── Endpoints công khai (GET /products)
└── Endpoints được bảo vệ (POST /products)
    ├── authMiddleware → Xác thực JWT
    ├── authorizeRoles('admin') → Kiểm tra vai trò
    └── Validators → Xác thực yêu cầu
```

### **Bước 4: 🔐 Xác thực & Phân quyền**

#### **Luồng Xác thực JWT**
```typescript
authMiddleware
├── Trích xuất Bearer token từ headers
├── Xác minh chữ ký JWT
├── Kiểm tra hết hạn token
├── Giải mã payload người dùng
├── Gắn người dùng vào req.user
└── Tiếp tục hoặc trả về 401
```

#### **Phân quyền Vai trò**
```typescript
authorizeRoles(['admin', 'user'])
├── Kiểm tra req.user.roles
├── So khớp với vai trò yêu cầu
└── Tiếp tục hoặc trả về 403
```

### **Bước 5: ✅ Xác thực Yêu cầu**

#### **Pipeline Xác thực**
```typescript
// Ví dụ: createProductValidator
├── Quy tắc express-validator
├── Kiểm tra trường bắt buộc
├── Xác thực kiểu dữ liệu
├── Quy tắc nghiệp vụ tùy chỉnh
├── Làm sạch đầu vào
└── Trả về 422 nếu có lỗi
```

### **Bước 6: 🎯 Xử lý Controller**

#### **Trách nhiệm Controller**
```typescript
// Ví dụ: productController.createProduct
├── Trích xuất dữ liệu đã xác thực từ req.body
├── Gọi phương thức service phù hợp
├── Xử lý phản hồi service
├── Định dạng dữ liệu phản hồi
└── Gửi phản hồi HTTP
```

### **Bước 7: 💼 Xử lý Lớp Service**

#### **Thực thi Logic Nghiệp vụ**
```typescript
// Ví dụ: productService.createProduct
├── Xác thực quy tắc nghiệp vụ
├── Biến đổi dữ liệu cho cơ sở dữ liệu
├── Thực hiện thao tác cơ sở dữ liệu
├── Xử lý mối quan hệ
├── Xử lý trường tính toán
└── Trả về dữ liệu đã xử lý
```

### **Bước 8: 🗄️ Thao tác Cơ sở dữ liệu**

#### **Luồng Prisma ORM**
```typescript
// Tương tác cơ sở dữ liệu
├── Phân tích truy vấn Prisma
├── Tạo SQL
├── Thực thi trên cơ sở dữ liệu (MySQL)
├── Xử lý giao dịch
├── Ánh xạ kết quả thành TypeScript
└── Trả về dữ liệu có kiểu
```

### **Bước 9: 📤 Tạo Phản hồi**

#### **Định dạng Phản hồi**
```typescript
// Định dạng phản hồi chuẩn
{
  "success": true/false,
  "data": {}, // Khi thành công
  "error": {}, // Khi có lỗi
  "message": "chuỗi",
  "pagination": {}, // Nếu có
  "timestamp": "Ngày ISO"
}
```

### **Bước 10: 🚫 Xử lý Lỗi**

#### **Pipeline Xử lý Lỗi**
```typescript
errorHandler middleware
├── Bắt tất cả lỗi chưa được xử lý
├── Ghi log chi tiết lỗi
├── Xác định loại lỗi
│   ├── Lỗi xác thực (422)
│   ├── Lỗi xác thực người dùng (401)
│   ├── Lỗi phân quyền (403)
│   ├── Lỗi không tìm thấy (404)
│   ├── Lỗi logic nghiệp vụ (400)
│   └── Lỗi máy chủ (500)
├── Định dạng phản hồi lỗi
└── Gửi cho client
```

---

## 🔄 3. Quy trình xử lý các loại Yêu cầu

### **📝 Luồng Xác thực**
```
POST /api/v1/auth/login
├── loginValidator → Xác thực định dạng email/password
├── authController.login
├── authService.login
│   ├── Tìm người dùng theo email
│   ├── Xác minh mã băm mật khẩu
│   ├── Tạo JWT tokens
│   └── Tạo phiên người dùng
└── Trả về tokens + thông tin người dùng
```

### **🛒 Luồng Thương mại điện tử**
```
POST /api/v1/orders
├── authMiddleware → Xác minh người dùng
├── createOrderValidator → Xác thực dữ liệu đơn hàng
├── orderController.createOrder
├── orderService.createOrder
│   ├── Xác thực các mục giỏ hàng
│   ├── Kiểm tra tồn kho
│   ├── Tính tổng tiền
│   ├── Áp dụng giảm giá
│   ├── Tạo bản ghi đơn hàng
│   ├── Cập nhật tồn kho
│   └── Xóa giỏ hàng
└── Trả về chi tiết đơn hàng
```

### **📦 Luồng Tìm kiếm Sản phẩm**
```
GET /api/v1/products?search=switch&category=1
├── paginationMiddleware → Phân tích page/limit
├── productController.getProducts
├── productService.getProducts
│   ├── Xây dựng truy vấn tìm kiếm
│   ├── Áp dụng bộ lọc
│   ├── Thêm sắp xếp
│   ├── Thực hiện phân trang
│   └── Tải mối quan hệ
└── Trả về sản phẩm + phân trang
```

---

## 💾 4. Quản lý Kết nối Cơ sở dữ liệu

### **Pool Kết nối**
```typescript
Prisma Client
├── Pooling kết nối
├── Tối ưu hóa truy vấn
├── Quản lý giao dịch
├── An toàn kiểu
└── Xử lý migration
```

### **Xử lý Giao dịch**
```typescript
// Các thao tác quan trọng được bọc trong giao dịch
prisma.$transaction([
  updateInventory,
  createOrder,
  clearCart
])
```

---

## 📊 5. Ghi log & Giám sát

### **Ghi log Yêu cầu**
```
Định dạng kết hợp Morgan:
:remote-addr - :remote-user [:date] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"
```

### **Ghi log Lỗi**
```typescript
console.error('Chi tiết lỗi:', {
  message: error.message,
  stack: error.stack,
  user: req.user?.id,
  path: req.path,
  method: req.method
})
```

---

## 🔄 6. Quy trình Tắt máy Nhẹ nhàng

```typescript
process.on('SIGTERM', async () => {
  console.log('SIGTERM nhận được, đang tắt máy nhẹ nhàng');
  
  // 1. Ngừng chấp nhận kết nối mới
  server.close(() => {
    // 2. Đóng kết nối cơ sở dữ liệu
    prisma.$disconnect();
    
    // 3. Thoát process
    process.exit(0);
  });
});
```

---

## ⚡ 7. Tối ưu hóa Hiệu suất

### **Chiến lược Bộ nhớ đệm**
- Bộ nhớ đệm cấp route cho catalog sản phẩm
- Tối ưu hóa truy vấn cơ sở dữ liệu
- Phân trang hiệu quả

### **Lập chỉ mục Cơ sở dữ liệu**
- Chỉ mục Primary/Foreign key
- Chỉ mục tối ưu cho tìm kiếm
- Chỉ mục tổng hợp cho lọc

### **Tối ưu hóa Phản hồi**
- Nén JSON
- Tải trường có chọn lọc
- Tải mối quan hệ lazy loading