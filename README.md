# Website Bán Thiết Bị Mạng - Full Stack E-commerce Platform

## 🚀 Tổng quan dự án

Đây là dự án website bán thiết bị mạng hoàn chỉnh (Router, Switch, Access Point, Firewall) với 3 phần chính:
- **Backend Server (NestJS)**: API RESTful với bảo mật cao
- **Client Frontend (Next.js)**: Giao diện người dùng e-commerce
- **Admin Dashboard (Next.js)**: Quản trị sản phẩm, đơn hàng, người dùng

## ⚡ Cài đặt nhanh

### Cài tất cả dependencies một lần (Khuyến nghị)

**Windows (PowerShell):**
```powershell
.\install-all.ps1
```

**Linux/Mac:**
```bash
chmod +x install-all.sh
./install-all.sh
```

Script này sẽ tự động cài đặt dependencies cho cả 3 ứng dụng (Server, Client, Admin).

### Hoặc cài thủ công từng ứng dụng

```bash
# Backend Server
cd server
npm install

# Client Frontend
cd ../client
npm install

# Admin Dashboard
cd ../admin
npm install
```

## 📁 Cấu trúc dự án

```
WebBanThietBiMang/
├── server/                    # Backend NestJS
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Sample data seed
│   ├── src/
│   │   ├── modules/          # Feature modules
│   │   │   ├── auth/         # JWT authentication
│   │   │   ├── products/     # Product management
│   │   │   ├── cart/         # Shopping cart
│   │   │   ├── orders/       # Order processing
│   │   │   ├── brands/       # Brand aggregation
│   │   │   └── categories/   # Category hierarchy
│   │   ├── middleware/       # Custom middleware
│   │   └── main.ts           # App entry point
│   ├── API_DOCUMENTATION.md  # API docs
│   └── DEPLOYMENT_GUIDE.md   # Production deployment
│
├── client/                   # Client Next.js
│   ├── src/
│   │   ├── app/              # Next.js 13+ App Router
│   │   ├── components/       # UI components
│   │   ├── contexts/         # React contexts (Auth)
│   │   ├── redux/            # Redux store & slices
│   │   └── services/         # API service layer
│   └── .env.local            # Environment variables
│
└── admin/                    # Admin Next.js
    ├── src/
    │   ├── app/              # Admin pages
    │   ├── components/       # Admin UI components
    │   └── services/         # Admin API service
    └── .env.local            # Admin environment

```

## 🛠️ Công nghệ sử dụng

### Backend (NestJS)
- **Framework**: NestJS 10.3.0 + TypeScript
- **Database**: MySQL 8.0+ với Prisma ORM 5.11.0
- **Authentication**: JWT (access token 7 days + refresh token)
- **Security**: 
  - Helmet (HTTP security headers)
  - Throttler (rate limiting: 10 requests/60s)
  - bcryptjs (password hashing)
  - RBAC (Role-Based Access Control)
  - Input validation (class-validator)
  - SQL injection prevention (Prisma)
- **Documentation**: Swagger UI
- **Performance**: Compression middleware

### Frontend (Client & Admin)
- **Framework**: Next.js 14+ (App Router)
- **UI**: React 18+ với TypeScript
- **State Management**: Redux Toolkit
- **API Client**: Axios với interceptors
- **Styling**: Tailwind CSS
- **Auth**: Custom AuthContext với JWT

## ⚙️ Cài đặt và Chạy

### 1. Backend Server

```powershell
# Di chuyển vào thư mục server
cd server

# Cài đặt dependencies
npm install

# Tạo file .env từ template
cp .env.example .env

# Cập nhật .env với thông tin database:
DATABASE_URL="mysql://username:password@localhost:3306/network_store"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"

# Chạy migration để tạo database schema
npx prisma migrate dev

# Seed database với dữ liệu mẫu
npx prisma db seed

# Chạy development server
npm run dev
```

Backend sẽ chạy tại: **http://localhost:5000**
Swagger docs: **http://localhost:5000/docs**

### 2. Client Frontend

```powershell
# Di chuyển vào thư mục client
cd client

# Cài đặt dependencies
npm install

# Tạo file .env.local
# Nội dung:
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SITE_URL=http://localhost:5173

# Chạy development server
npm run dev
```

Client sẽ chạy tại: **http://localhost:5173**

### 3. Admin Dashboard

```powershell
# Di chuyển vào thư mục admin
cd admin

# Cài đặt dependencies
npm install

# Tạo file .env.local
# Nội dung:
NEXT_PUBLIC_API_URL=http://localhost:5000

# Chạy development server
npm run dev
```

Admin sẽ chạy tại: **http://localhost:3000**

## 🔐 Dữ liệu mẫu sau khi seed

### Tài khoản người dùng

#### Admin Account
- Email: `admin@nettechpro.com`
- Password: `admin123`
- Role: `admin`
- Quyền: Quản lý toàn bộ hệ thống

#### Test User Account
- Email: `user@example.com`
- Password: `user123`
- Role: `user`
- Quyền: Mua hàng, quản lý đơn hàng cá nhân

### Sản phẩm (5 sản phẩm mẫu)

1. **TP-Link Archer AX3000 WiFi 6 Router**
   - Giá: 2,990,000 VNĐ
   - Tồn kho: 50 chiếc
   - Danh mục: Router

2. **Cisco Catalyst 2960 24-Port Switch**
   - Giá: 15,900,000 VNĐ
   - Tồn kho: 20 chiếc
   - Danh mục: Switch

3. **Ubiquiti UniFi AP AC Pro**
   - Giá: 4,590,000 VNĐ
   - Tồn kho: 35 chiếc
   - Danh mục: Access Point

4. **Fortinet FortiGate 60F Firewall**
   - Giá: 24,900,000 VNĐ
   - Tồn kho: 10 chiếc
   - Danh mục: Firewall

5. **D-Link DGS-1210-28 Smart Switch**
   - Giá: 8,900,000 VNĐ
   - Tồn kho: 15 chiếc
   - Danh mục: Switch

### Danh mục (4 categories)
- Router
- Switch
- Access Point
- Firewall

### Phương thức thanh toán (5 methods)
- COD (Thanh toán khi nhận hàng)
- Bank Transfer (Chuyển khoản ngân hàng)
- Credit Card (Thẻ tín dụng)
- Momo (Ví điện tử Momo)
- ZaloPay (Ví điện tử ZaloPay)

### Phương thức vận chuyển (3 methods)
1. **Standard Shipping**: 30,000 VNĐ + 5,000 VNĐ/kg (3 ngày)
2. **Express Shipping**: 60,000 VNĐ + 10,000 VNĐ/kg (1 ngày)
3. **Same Day Delivery**: 100,000 VNĐ + 15,000 VNĐ/kg (trong ngày)

### Mã giảm giá
- Code: **WELCOME10**
- Giảm: 10%
- Đơn tối thiểu: 1,000,000 VNĐ
- Số lần sử dụng: 100

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Đăng ký tài khoản mới
- `POST /api/v1/auth/login` - Đăng nhập
- `POST /api/v1/auth/refresh` - Refresh token
- `POST /api/v1/auth/change-password` - Đổi mật khẩu
- `GET /api/v1/auth/profile` - Lấy thông tin user

### Products
- `GET /api/products` - Lấy danh sách sản phẩm (public, paginated, filterable)
- `GET /api/products/:id` - Lấy chi tiết sản phẩm (public)
- `POST /api/products` - Tạo sản phẩm mới (admin only)
- `PUT /api/products/:id` - Cập nhật sản phẩm (admin only)
- `DELETE /api/products/:id` - Xóa sản phẩm (admin only, soft delete)
- `POST /api/products/items` - Tạo SKU cho sản phẩm (admin only)

### Cart
- `GET /api/cart` - Lấy giỏ hàng hiện tại (authenticated)
- `POST /api/cart/items` - Thêm sản phẩm vào giỏ (authenticated)
- `PUT /api/cart/items/:id` - Cập nhật số lượng (authenticated)
- `DELETE /api/cart/items/:id` - Xóa sản phẩm khỏi giỏ (authenticated)
- `DELETE /api/cart` - Xóa toàn bộ giỏ hàng (authenticated)

### Orders
- `POST /api/orders` - Tạo đơn hàng từ giỏ (authenticated, uses transaction)
- `GET /api/orders/my-orders` - Lấy đơn hàng của user (authenticated)
- `GET /api/orders` - Lấy tất cả đơn hàng (admin only)
- `GET /api/orders/:id` - Chi tiết đơn hàng (owner or admin)
- `PUT /api/orders/:id/status` - Cập nhật trạng thái (admin only)

### Brands
- `GET /api/brands` - Lấy danh sách thương hiệu (aggregated from products)
- `GET /api/brands/:name` - Chi tiết thương hiệu và sản phẩm

### Categories
- `GET /api/categories` - Lấy tất cả danh mục
- `GET /api/categories/tree` - Lấy cây danh mục với parent-child
- `GET /api/categories/:id` - Chi tiết danh mục
- `POST /api/categories` - Tạo danh mục mới (admin only)
- `PUT /api/categories/:id` - Cập nhật danh mục (admin only)
- `DELETE /api/categories/:id` - Xóa danh mục (admin only, prevents if has products/children)

Chi tiết đầy đủ xem tại: `server/API_DOCUMENTATION.md`

## 🔒 Bảo mật

### Backend Security Features
1. **Helmet**: HTTP security headers (XSS, clickjacking, etc.)
2. **Throttler**: Rate limiting 10 requests/60 seconds
3. **JWT**: Access token (7 days) + Refresh token
4. **bcryptjs**: Password hashing với salt
5. **RBAC**: Role-based authorization (admin, user)
6. **Input Validation**: class-validator với DTO whitelist
7. **SQL Injection**: Prisma parameterized queries
8. **User Isolation**: Users only access their own data
9. **Soft Delete**: Data preservation for audit
10. **CORS**: Configured allowed origins

### Frontend Security
1. **Token Storage**: localStorage with auto-refresh
2. **Request Interceptor**: Auto-attach Bearer token
3. **Response Interceptor**: Handle 401 (redirect to login)
4. **Protected Routes**: AuthContext guards
5. **HTTPS**: Production deployment with SSL/TLS

## 🧪 Testing

### Test Authentication
```powershell
# Login với PowerShell
$body = @{email='user@example.com'; password='user123'} | ConvertTo-Json
$response = Invoke-RestMethod -Uri 'http://localhost:5000/api/v1/auth/login' -Method POST -Body $body -ContentType 'application/json'
$response.data
```

### Test Products API
```powershell
# Get all products
$response = Invoke-RestMethod -Uri 'http://localhost:5000/api/products?page=1&limit=5' -Method GET
$response.data.data
```

### Test Cart (requires authentication)
```powershell
# Login first to get token
$loginResponse = Invoke-RestMethod -Uri 'http://localhost:5000/api/v1/auth/login' -Method POST -Body (@{email='user@example.com'; password='user123'} | ConvertTo-Json) -ContentType 'application/json'
$token = $loginResponse.data.accessToken

# Add item to cart (productItemId=1 là SKU của TP-Link AX3000)
$headers = @{Authorization="Bearer $token"}
$body = @{productItemId=1; quantity=2} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:5000/api/cart/items' -Method POST -Body $body -ContentType 'application/json' -Headers $headers
```

## 📦 Deployment

### Production Checklist
- [ ] Update `JWT_SECRET` và `JWT_REFRESH_SECRET` với giá trị bảo mật
- [ ] Configure CORS với domain production
- [ ] Enable HTTPS/SSL
- [ ] Configure firewall rules
- [ ] Setup PM2 cho process management
- [ ] Configure nginx reverse proxy
- [ ] Setup monitoring (Sentry, New Relic)
- [ ] Configure backup strategy
- [ ] Setup CI/CD pipeline
- [ ] Configure rate limiting thích hợp
- [ ] Review security headers (Helmet config)

Chi tiết deployment xem tại: `server/DEPLOYMENT_GUIDE.md`

## 🐳 Docker Deployment

```powershell
# Build and run với Docker Compose
cd server
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

## 📊 Database Schema

Prisma schema với 26+ models:
- `SiteUser` - User accounts với role-based access
- `Role` - User roles (admin, user)
- `Product` - Product catalog với category, brand
- `ProductItem` - SKU/variants với giá, tồn kho
- `ProductImage` - Product images
- `Category` - Hierarchical categories
- `Cart` - Shopping carts
- `CartItem` - Items trong cart
- `ShopOrder` - Orders với transaction support
- `OrderLine` - Order line items
- `OrderStatus` - Order status (Pending, Processing, Shipped, Delivered, Cancelled)
- `OrderHistory` - Audit trail cho order status changes
- `Address` - User addresses
- `PaymentMethod` - Payment methods (COD, Bank, Card, Momo, ZaloPay)
- `ShippingMethod` - Shipping methods với pricing
- `Discount` - Discount codes với validation
- Và nhiều hơn...

## 🚀 Roadmap

- [x] Backend NestJS với 6 modules
- [x] Authentication với JWT + Refresh tokens
- [x] Products, Cart, Orders với full CRUD
- [x] Security middleware (Helmet, Throttler)
- [x] API Documentation
- [x] Deployment Guide
- [x] Database seed script
- [x] Client API integration
- [x] Auth Context
- [ ] Redux integration với backend
- [ ] Product listing page
- [ ] Cart functionality
- [ ] Checkout flow
- [ ] Admin dashboard integration
- [ ] Reviews module
- [ ] User management module
- [ ] Email notifications
- [ ] Payment gateway integration
- [ ] Search optimization
- [ ] Performance optimization

## 📝 License

ISC License

## 👥 Contributors

- Full-stack developer: [Your Name]

## 📧 Support

For support, email: support@nettechpro.com

---

**Developed with ❤️ for Network Equipment E-commerce**
#   N e t w o r k S t o r e V  
 