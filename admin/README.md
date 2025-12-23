# NetTechPro Admin Dashboard

Trang quản trị hệ thống bán thiết bị mạng, xây dựng với Next.js 15 và React 19.

## 🚀 Tính năng

- 📊 Dashboard với thống kê tổng quan
- 📦 Quản lý sản phẩm (CRUD, tìm kiếm, lọc)
- 🛒 Quản lý đơn hàng (xem, cập nhật trạng thái)
- 👥 Quản lý khách hàng
- 📈 Báo cáo doanh thu, sản phẩm bán chạy
- 🔔 Thông báo đơn hàng mới, sản phẩm sắp hết hàng
- 🔐 Xác thực admin

## 📋 Yêu cầu

- Node.js 18+ hoặc 20+
- npm hoặc yarn
- API Server đang chạy (xem hướng dẫn tại `/server`)

## 🛠️ Cài đặt

1. Di chuyển vào thư mục admin:
```powershell
cd admin
```

2. Cài đặt dependencies:
```powershell
npm install
```

3. Cấu hình môi trường:

**Development (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_ADMIN_URL=http://localhost:3001
NEXT_PUBLIC_SITE_NAME=NetTechPro Admin
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
```

**Production (.env.production):**
```env
NEXT_PUBLIC_API_URL=https://api.nettechpro.me/api
NEXT_PUBLIC_ADMIN_URL=https://admin.nettechpro.me
NEXT_PUBLIC_SITE_NAME=NetTechPro Admin
NEXT_PUBLIC_ENABLE_NOTIFICATIONS=true
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id
```

## 🏃‍♂️ Chạy ứng dụng

### Development
```powershell
npm run dev
```
Ứng dụng sẽ chạy tại http://localhost:3001

### Production Build
```powershell
# Build
npm run build

# Start production server
npm start
```

## 📁 Cấu trúc thư mục

```
admin/
├── public/
│   └── images/         # Static images
├── src/
│   ├── app/            # Next.js App Router
│   │   ├── (admin)/    # Admin layout group
│   │   │   ├── page.tsx              # Dashboard
│   │   │   ├── products/             # Quản lý sản phẩm
│   │   │   ├── orders/               # Quản lý đơn hàng
│   │   │   ├── customers/            # Quản lý khách hàng
│   │   │   └── settings/             # Cài đặt
│   │   └── login/      # Trang đăng nhập
│   ├── components/     # React components
│   │   ├── header/     # Admin header
│   │   ├── tables/     # Data tables
│   │   ├── charts/     # Charts & graphs
│   │   ├── form/       # Form components
│   │   └── common/     # Common UI components
│   ├── services/       # API services
│   │   └── api.ts      # Admin API client
│   ├── context/        # React Context
│   ├── hooks/          # Custom hooks
│   └── utils/          # Helpers
├── .env.local          # Environment (dev)
├── .env.production     # Environment (prod)
└── package.json
```

## 🔌 Sử dụng Admin API Service

### Import API service
```typescript
import adminApi from '@/services/api';
```

### Ví dụ sử dụng

**Dashboard metrics:**
```typescript
const { data } = await adminApi.dashboard.getMetrics();
console.log(data.totalRevenue, data.totalOrders);
```

**Quản lý sản phẩm:**
```typescript
// Lấy danh sách
const { data, pagination } = await adminApi.products.getProducts({
  page: 1,
  limit: 20,
  search: 'router',
  status: 'active'
});

// Tạo mới
const newProduct = await adminApi.products.createProduct({
  name: 'Router TP-Link Archer C6',
  sku: 'TL-AC6',
  price: 590000,
  category: 'routers',
  brand: 'TP-Link',
  stock: 50
});

// Cập nhật
await adminApi.products.updateProduct('prod-id', {
  stock: 45
});

// Xóa
await adminApi.products.deleteProduct('prod-id');
```

**Quản lý đơn hàng:**
```typescript
// Lấy danh sách
const { data } = await adminApi.orders.getOrders({
  page: 1,
  status: 'pending'
});

// Cập nhật trạng thái
await adminApi.orders.updateOrderStatus(
  'order-id',
  'shipping',
  'Đang giao hàng'
);
```

**Quản lý khách hàng:**
```typescript
const { data } = await adminApi.customers.getCustomers({
  page: 1,
  search: 'nguyen'
});
```

## 📦 Admin API Endpoints

### Products Management
- `GET /api/admin/products` - Danh sách sản phẩm
- `GET /api/admin/products/:id` - Chi tiết sản phẩm
- `POST /api/admin/products` - Tạo sản phẩm
- `PUT /api/admin/products/:id` - Cập nhật sản phẩm
- `DELETE /api/admin/products/:id` - Xóa sản phẩm
- `PATCH /api/admin/products/:id/toggle-status` - Bật/tắt sản phẩm

### Orders Management
- `GET /api/admin/orders` - Danh sách đơn hàng
- `GET /api/admin/orders/:id` - Chi tiết đơn hàng
- `PUT /api/admin/orders/:id/status` - Cập nhật trạng thái

### Customers Management
- `GET /api/admin/customers` - Danh sách khách hàng
- `GET /api/admin/customers/:id` - Chi tiết khách hàng

### Dashboard & Analytics
- `GET /api/admin/dashboard/metrics` - Thống kê tổng quan
- `GET /api/admin/dashboard/revenue-chart` - Biểu đồ doanh thu
- `GET /api/admin/dashboard/top-products` - Sản phẩm bán chạy
- `GET /api/admin/dashboard/recent-orders` - Đơn hàng gần đây
- `GET /api/admin/dashboard/low-stock` - Sản phẩm sắp hết

Xem chi tiết tại: http://localhost:3000/docs

## 🎨 UI Components

Admin sử dụng:
- **Tailwind CSS** - Styling framework
- **Headless UI** - Unstyled accessible components
- **Chart.js / Recharts** - Data visualization
- **React Hook Form** - Form management
- **React Table** - Data tables

## 🔐 Authentication

Admin dashboard yêu cầu xác thực:
1. Token admin lưu trong `localStorage` với key `adminToken`
2. Tự động redirect về `/login` nếu chưa đăng nhập
3. Token gửi qua header `Authorization: Bearer <token>`

```typescript
// Lưu token sau khi đăng nhập
adminApi.auth.setToken('your-admin-token');

// Lấy token
const token = adminApi.auth.getToken();

// Xóa token (logout)
adminApi.auth.clearToken();
```

## 🌐 Môi trường Deployment

### Development
- Admin: http://localhost:3001
- API: http://localhost:3000/api
- Docs: http://localhost:3000/docs

### Production
- Admin: https://admin.nettechpro.me
- API: https://api.nettechpro.me/api
- Docs: https://api.nettechpro.me/docs

## 🔧 Scripts

```powershell
npm run dev          # Development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Lint code
npm run format       # Format code
```

## 📊 Dashboard Features

### Metrics Cards
- Tổng doanh thu (Total Revenue)
- Tổng đơn hàng (Total Orders)
- Tổng sản phẩm (Total Products)
- Tổng khách hàng (Total Customers)
- Growth indicators (% so với tháng trước)

### Charts
- Revenue Chart: Biểu đồ doanh thu theo tuần/tháng/năm
- Top Products: Sản phẩm bán chạy nhất
- Order Status: Phân bố trạng thái đơn hàng

### Real-time Updates
- Đơn hàng mới
- Sản phẩm sắp hết hàng (stock < 10)
- Thông báo quan trọng

## 🛡️ Best Practices

1. **Authorization**: Luôn kiểm tra token trước khi gọi API
2. **Error Handling**: Xử lý lỗi và hiển thị thông báo rõ ràng
3. **Loading States**: Hiển thị loading khi fetch data
4. **Data Validation**: Validate form trước khi submit
5. **Responsive**: Đảm bảo UI hoạt động tốt trên mobile

## 🐛 Troubleshooting

**Không kết nối được API:**
- Kiểm tra server đang chạy: `cd server && npm run dev`
- Xác nhận `NEXT_PUBLIC_API_URL` trong .env
- Kiểm tra CORS configuration cho admin domain

**Lỗi authentication:**
- Xóa token cũ: `localStorage.clear()`
- Đăng nhập lại
- Kiểm tra token expiry

**Build error:**
```powershell
rm -rf .next
npm install
npm run build
```

## 📝 Lưu ý quan trọng

1. **Không deploy admin lên public** mà không có authentication
2. **Bảo vệ routes** bằng middleware kiểm tra token
3. **Rate limiting** cho API endpoints
4. **Logs**: Enable logging cho mọi admin actions
5. **Backup**: Backup database thường xuyên

## 📚 Tài liệu

- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com)
- [React Hook Form](https://react-hook-form.com)
- [Server API Docs](../server/README.md)

## 🔗 Links

- Client Site: https://nettechpro.me
- API Documentation: https://api.nettechpro.me/docs
- Server Repository: ../server

## 👥 Support

Liên hệ team development nếu gặp issues hoặc cần thêm features.
