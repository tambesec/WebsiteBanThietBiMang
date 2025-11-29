# Quick Start Guide

## 🚀 Cách chạy dự án nhanh nhất

### ⚡ Chạy nhanh (nếu dependencies đã được cài)
```bash
# Generate Prisma Client
npx prisma generate

# Start server
npm run start:dev
```

### 1️⃣ Chạy script tự động (Setup đầy đủ)
```bash
chmod +x setup.sh
./setup.sh
```

### 2️⃣ Hoặc chạy từng bước thủ công

#### Bước 1: Cài đặt dependencies (nếu chưa có)
```bash
npm install
```

#### Bước 2: Generate Prisma Client ⚠️ **BẮT BUỘC**
```bash
npx prisma generate
```

#### Bước 3: Đồng bộ database schema (tùy chọn)
```bash
npx prisma db push
```

#### Bước 4: Khởi động server
```bash
npm run start:dev
```

---

## 📌 Thông tin quan trọng

- **API Base URL:** `http://localhost:3000/api/v1`
- **Auth Endpoints:** `http://localhost:3000/api/v1/auth`
- **Database:** MySQL (localhost:3306)
- **Port:** 3000

---

## 🔐 Test API nhanh

### 1. Đăng ký user mới
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "phone": "0123456789",
    "password": "Test123!@#"
  }'
```

### 2. Đăng nhập
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

### 3. Xem profile (cần access_token từ bước 2)
```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 📖 Tài liệu chi tiết

Xem file **AUTH_DOCUMENTATION.md** để biết:
- Tất cả API endpoints
- Request/Response examples
- Security features
- Error handling
- Best practices

---

## ⚠️ Lưu ý bảo mật

Trước khi deploy production, **PHẢI** thay đổi JWT secrets trong file `.env`:

```bash
# Tạo secret mới
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Copy kết quả vào .env
JWT_ACCESS_SECRET=<secret_mới>
JWT_REFRESH_SECRET=<secret_mới_khác>
```

---

## 🐛 Troubleshooting

### Lỗi: Cannot connect to MySQL
```bash
# Kiểm tra MySQL đang chạy
docker ps

# Khởi động lại MySQL container
docker restart mysql-server
```

### Lỗi: Prisma Client not generated
```bash
npx prisma generate
```

### Lỗi: Port 3000 đã được sử dụng
Thay đổi PORT trong file `.env`:
```
PORT=3001
```

---

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. MySQL đang chạy và accessible
2. DATABASE_URL trong .env đúng
3. Tất cả dependencies đã được cài đặt
4. Prisma client đã được generate
