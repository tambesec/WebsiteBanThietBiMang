
# 🚀 Hướng dẫn Cài đặt - Backend Cửa hàng Thiết bị Mạng

**Hướng dẫn cài đặt và triển khai dự án Backend**

---

## 📋 Yêu cầu hệ thống

### **💻 Phần mềm cần thiết**
| Phần mềm | Phiên bản | Ghi chú |
|----------|-----------|---------|
| **Node.js** | v20.16.0+ | Môi trường chạy |
| **npm** | v10.6.0+ | Trình quản lý gói |
| **MySQL** | v8.0+ | Cơ sở dữ liệu chính |
| **Git** | Mới nhất | Kiểm soát phiên bản |
| **VS Code** | Mới nhất | IDE được khuyến nghị |

### **🔧 Tiện ích mở rộng VS Code khuyến nghị**
- Prisma
- TypeScript
- ESLint
- Thunder Client (Kiểm thử API)

---

## 🛠️ Cài đặt chi tiết

### **1️⃣ Sao chép Repository**
```bash
# Sao chép dự án
git clone https://github.com/your-organization/network-store-backend.git

# Di chuyển vào thư mục
cd network-store-backend/backend

# Kiểm tra nhánh hiện tại
git branch
```

### **2️⃣ Cài đặt Dependencies**
```bash
# Cài đặt tất cả packages
npm install

# Kiểm tra cài đặt thành công
npm list --depth=0
```

### **3️⃣ Cấu hình Biến Môi trường**

Tạo file `.env` trong thư mục gốc:
```bash
cp .env.example .env
```

**Nội dung file `.env`:**
```env
# Cấu hình Cơ sở dữ liệu
DATABASE_URL="mysql://username:password@localhost:3306/network_store_db"

# Cấu hình JWT
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_EXPIRES_IN="1h"
JWT_REFRESH_EXPIRES_IN="7d"

# Cấu hình Máy chủ
PORT=3000
NODE_ENV="development"
API_VERSION="v1"

# Cấu hình CORS
CORS_ORIGIN="http://localhost:3000,http://localhost:3001"

# Giới hạn Tốc độ
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Tải lên File
MAX_FILE_SIZE="10mb"

# Cấu hình Email (Tùy chọn)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
EMAIL_FROM="noreply@networkstore.com"

# Cấu hình Redis (Tùy chọn - cho bộ nhớ đệm)
REDIS_URL="redis://localhost:6379"

# Ghi log
LOG_LEVEL="info"
```

### **4️⃣ Cấu hình Cơ sở dữ liệu**

#### **A. Cài đặt MySQL**
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mysql-server

# MacOS (với Homebrew)
brew install mysql

# Windows: Tải xuống từ https://dev.mysql.com/downloads/mysql/
```

#### **B. Tạo Cơ sở dữ liệu**
```sql
-- Đăng nhập MySQL
mysql -u root -p

-- Tạo cơ sở dữ liệu
CREATE DATABASE network_store_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Tạo người dùng cho ứng dụng
CREATE USER 'network_store_user'@'localhost' IDENTIFIED BY 'your_strong_password';

-- Cấp quyền
GRANT ALL PRIVILEGES ON network_store_db.* TO 'network_store_user'@'localhost';
FLUSH PRIVILEGES;

-- Thoát
EXIT;
```

#### **C. Chạy Migrations**
```bash
# Tạo Prisma client
npm run prisma:generate

# Chạy migrations để tạo bảng
npm run prisma:migrate

# Mở Prisma Studio để xem cơ sở dữ liệu (tùy chọn)
npm run prisma:studio
```

### **5️⃣ Khởi động ứng dụng**

#### **🔥 Chế độ Development**
```bash
# Khởi động máy chủ development với hot-reload
npm run dev

# Máy chủ sẽ chạy tại: http://localhost:3000
# URL gốc API: http://localhost:3000/api/v1
```

#### **🏗️ Build cho Production**
```bash
# Build TypeScript thành JavaScript
npm run build

# Khởi động máy chủ production
npm start

# Hoặc với PM2
npm install -g pm2
pm2 start dist/index.js --name "network-store-api"
```

---

## ✅ Kiểm tra cài đặt

### **🔍 Kiểm tra Sức khỏe**
```bash
# Kiểm tra máy chủ đang chạy
curl http://localhost:3000/api/v1/health

# Phản hồi mong đợi:
# {"status": "OK"}
```

### **🧪 Kiểm thử API**
```bash
# Kiểm thử đăng ký người dùng mới
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## 🎯 Scripts có sẵn

```bash
# Development
npm run dev              # Khởi động máy chủ development
npm run build           # Build TypeScript thành JavaScript  
npm start              # Khởi động máy chủ production

# Cơ sở dữ liệu
npm run prisma:generate    # Tạo Prisma client
npm run prisma:migrate     # Chạy database migrations
npm run prisma:push       # Đẩy thay đổi schema lên DB
npm run prisma:studio     # Mở giao diện Prisma Studio

# Chất lượng Code
npm run lint             # Chạy ESLint
npm run test            # Chạy Jest tests
npm run test:watch      # Chạy tests trong chế độ watch
```

---

## 🐳 Cài đặt Docker (Tùy chọn)

### **📦 Dockerfile**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### **🐙 docker-compose.yml**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=mysql://root:password@db:3306/network_store_db
    depends_on:
      - db

  db:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: network_store_db
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
```

### **🚀 Chạy với Docker**
```bash
# Build và khởi động tất cả services
docker-compose up -d

# Chạy migrations trong container
docker-compose exec app npm run prisma:migrate

# Xem logs
docker-compose logs -f app
```

---

## 🔧 Khắc phục Sự cố

### **❌ Lỗi thường gặp**

#### **Lỗi Kết nối Cơ sở dữ liệu**
```bash
# Kiểm tra MySQL đang chạy
sudo systemctl status mysql

# Kiểm tra DATABASE_URL đúng định dạng
echo $DATABASE_URL
```

#### **Cổng 3000 đã được sử dụng**
```bash
# Tìm process đang sử dụng cổng 3000
lsof -i :3000

# Dừng process
kill -9 <PID>

# Hoặc đổi cổng trong .env
PORT=3001
```

#### **Prisma Generate Thất bại**
```bash
# Xóa node_modules và cài đặt lại
rm -rf node_modules package-lock.json
npm install

# Tạo lại Prisma client
npm run prisma:generate
```

### **🔍 Chế độ Debug**
```bash
# Chạy với debug logging
NODE_ENV=development DEBUG=* npm run dev

# Chỉ log database queries
DEBUG=prisma:query npm run dev
```

---

## 📚 Tài liệu tham khảo

- [Tài liệu Node.js](https://nodejs.org/docs/)
- [Tài liệu Prisma](https://www.prisma.io/docs/)
- [Hướng dẫn Express.js](https://expressjs.com/)
- [Sổ tay TypeScript](https://www.typescriptlang.org/docs/)
- [Tài liệu MySQL](https://dev.mysql.com/doc/)

---

## 🆘 Hỗ trợ

Nếu gặp vấn đề trong quá trình cài đặt:

1. 📖 Kiểm tra logs chi tiết
2. 🔍 Tìm kiếm trong Issues của repository
3. 💬 Tạo Issue mới với thông tin chi tiết
4. 📧 Liên hệ team phát triển

**Chúc bạn lập trình vui vẻ! 🚀**
