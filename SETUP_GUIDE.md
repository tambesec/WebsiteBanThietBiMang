# 🚀 Hướng Dẫn Setup & Kết Nối Frontend - Backend

## 📋 Tổng Quan

```
WebsiteBanThietBiMang/
├── client/          # Frontend cho khách hàng (Next.js - Port 3000)
├── admin/           # Frontend cho admin (Next.js - Port 3001)
└── server/          # Backend API (NestJS - Port 5000)
```

---

## 🔧 Bước 1: Setup Database (MySQL)

### 1.1 Tạo Database

```sql
CREATE DATABASE networkstorev2 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 1.2 Cấu hình file `.env` trong thư mục `server/`

```bash
cd server
cp .env_example .env
```

Chỉnh sửa file `.env`:

```env
# Database - Thay đổi theo cấu hình MySQL của bạn
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/networkstorev2"

# JWT Secret (thay đổi trong production)
JWT_SECRET=your_super_secret_key_change_this_in_production

# Google OAuth (nếu dùng)
GOOGLE_CLIENT_ID=your_google_client_id
```

### 1.3 Chạy Migration

```bash
cd server
npx prisma migrate dev
npx prisma generate
```

---

## 🖥️ Bước 2: Chạy Backend Server

```bash
cd server

# Cài đặt dependencies (nếu chưa)
npm install

# Chạy development server
npm run start:dev
```

**✅ Server sẽ chạy tại:** `http://localhost:5000`
**📚 API Docs:** `http://localhost:5000/docs`

### Kiểm tra Server hoạt động

```bash
# Health check
curl http://localhost:5000/health

# Hoặc mở trình duyệt: http://localhost:5000/docs
```

---

## 🌐 Bước 3: Setup Frontend Client

### 3.1 Tạo file `.env.local` trong thư mục `client/`

```bash
cd client
```

Tạo file `.env.local`:

```env
# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:5000

# Google OAuth (nếu dùng)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

### 3.2 Cài đặt và chạy Client

```bash
cd client

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

**✅ Client sẽ chạy tại:** `http://localhost:3000`

---

## 🔐 Bước 4: Test Kết Nối Auth

### 4.1 Đăng ký tài khoản mới

Truy cập: `http://localhost:3000/signup`

Hoặc test với API:

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test@123456"
  }'
```

**Response mong đợi:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "test@example.com",
    "username": "testuser",
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### 4.2 Đăng nhập

Truy cập: `http://localhost:3000/signin`

Hoặc test với API:

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test@123456"
  }'
```

### 4.3 Lấy Profile (cần token)

```bash
curl http://localhost:5000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 👨‍💼 Bước 5: Setup Admin Panel

### 5.1 Tạo file `.env.local` trong thư mục `admin/`

```bash
cd admin
```

Tạo file `.env.local`:

```env
# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 5.2 Chạy Admin Panel

```bash
cd admin
npm install
npm run dev
```

**✅ Admin sẽ chạy tại:** `http://localhost:3001`

### 5.3 Tạo Admin User

Chạy seed để tạo admin user:

```bash
cd server
npx prisma db seed
```

Hoặc tạo thủ công bằng Prisma Studio:

```bash
npx prisma studio
```

**Admin mặc định:**
- Email: `admin@nettechpro.me`
- Password: `Admin@123456`

---

## 🔄 Chạy Đồng Thời Tất Cả

### Option 1: Sử dụng script PowerShell

```powershell
# Từ thư mục gốc
.\start-dev.ps1
```

### Option 2: Chạy thủ công

Mở 3 terminal:

**Terminal 1 - Backend:**
```bash
cd server && npm run start:dev
```

**Terminal 2 - Client:**
```bash
cd client && npm run dev
```

**Terminal 3 - Admin:**
```bash
cd admin && npm run dev
```

---

## 🔗 API Endpoints Đã Sẵn Sàng

### Authentication (Client)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/v1/auth/register` | Đăng ký |
| POST | `/api/v1/auth/login` | Đăng nhập |
| POST | `/api/v1/auth/google` | Đăng nhập Google |
| POST | `/api/v1/auth/logout` | Đăng xuất |
| GET | `/api/v1/auth/profile` | Lấy profile |
| PUT | `/api/v1/auth/profile` | Cập nhật profile |
| POST | `/api/v1/auth/change-password` | Đổi mật khẩu |
| POST | `/api/v1/auth/forgot-password` | Quên mật khẩu |
| POST | `/api/v1/auth/reset-password` | Reset mật khẩu |
| POST | `/api/v1/auth/refresh` | Refresh token |

### Authentication (Admin)

| Method | Endpoint | Mô tả |
|--------|----------|-------|
| POST | `/api/v1/admin/auth/login` | Admin đăng nhập |
| POST | `/api/v1/admin/auth/logout` | Admin đăng xuất |
| GET | `/api/v1/admin/auth/me` | Lấy profile admin |
| PUT | `/api/v1/admin/auth/profile` | Cập nhật profile |
| POST | `/api/v1/admin/auth/change-password` | Đổi mật khẩu |

---

## 🐛 Troubleshooting

### Lỗi CORS

Kiểm tra `CORS_ORIGIN` trong `server/.env`:

```env
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002
```

### Lỗi kết nối Database

1. Kiểm tra MySQL đang chạy
2. Kiểm tra DATABASE_URL đúng format
3. Kiểm tra database đã được tạo

```bash
npx prisma db push
```

### Lỗi Token Invalid

1. Xóa localStorage trong browser
2. Kiểm tra JWT_SECRET trong `.env`
3. Đăng nhập lại

### Lỗi "@nestjs/platform-express"

```bash
cd server
rm -rf node_modules package-lock.json
npm install
```

---

## 📱 Testing với Postman

Import collection từ Swagger:
1. Mở `http://localhost:5000/docs`
2. Click vào link JSON spec
3. Import vào Postman

---

## ✅ Checklist Setup

- [ ] MySQL đang chạy
- [ ] Database `networkstorev2` đã tạo
- [ ] File `server/.env` đã cấu hình
- [ ] Migration đã chạy (`npx prisma migrate dev`)
- [ ] Backend đang chạy (`http://localhost:5000`)
- [ ] File `client/.env.local` đã tạo
- [ ] Client đang chạy (`http://localhost:3000`)
- [ ] Test đăng ký/đăng nhập thành công

---

*Cập nhật: December 2024*


