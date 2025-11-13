# 🏗️ Tài liệu Cấu trúc Dự án
**Cửa hàng Thiết bị Mạng - Kiến trúc Backend**

---

## 📁 Cấu trúc tổng quan

```
/backend                               # 🏠 Thư mục gốc
├── 📄 package.json                   # Dependencies & scripts
├── 📄 tsconfig.json                  # Cấu hình TypeScript
├── 📄 jest.config.js                 # Cấu hình Testing
├── 📄 ARCHITECTURE.md                # Tài liệu kiến trúc
├── 📄 script2310.sql                 # Scripts cơ sở dữ liệu
├── 📁 prisma/                        # 🗄️ Schema cơ sở dữ liệu & migrations
│   ├── 📄 schema.prisma              # Schema cơ sở dữ liệu chính
│   └── 📁 migrations/                # Files migration cơ sở dữ liệu
│       ├── 📄 migration_lock.toml    # File khóa migration
│       └── 📁 20251102050145_init/   # Migration khởi tạo
│           └── 📄 migration.sql      # Script migration SQL
├── 📁 src/                           # 💻 Mã nguồn
│   ├── 📄 index.ts                   # Điểm khởi đầu ứng dụng
│   ├── 📄 app.ts                     # Cấu hình ứng dụng Express
│   ├── 📄 server.ts                  # Thiết lập máy chủ HTTP
│   ├── 📁 config/                    # ⚙️ Files cấu hình
│   ├── 📁 controllers/               # 🎯 Xử lý yêu cầu
│   ├── 📁 middleware/                # 🛡️ Express middleware
│   ├── 📁 routes/                    # 🗺️ Định nghĩa route API
│   ├── 📁 services/                  # 💼 Lớp logic nghiệp vụ
│   ├── 📁 types/                     # 📝 Định nghĩa kiểu TypeScript
│   ├── 📁 utils/                     # 🔧 Hàm tiện ích
│   └── 📁 validators/                # ✅ Xác thực yêu cầu
├── 📁 tests/                         # 🧪 Files test
└── 📁 docs/                          # 📚 Tài liệu
    ├── 📄 api-docs.md                # Tài liệu API
        ├── 📄 server-workflow.md         # Hướng dẫn luồng máy chủ
            ├── 📄 setup-guide.md             # Hướng dẫn cài đặt
                └── 📄 project-structure.md       # File này
                ```

                ---

                ## 🏠 Files Cấp Gốc

                ### **📦 Quản lý Package**
                - **`package.json`** - Quản lý dependencies, scripts, metadata
                - **`package-lock.json`** - Lock file cho các lần cài đặt nhất quán

                ### **⚙️ Files Cấu hình**
                - **`tsconfig.json`** - Cấu hình trình biên dịch TypeScript
                - **`jest.config.js`** - Thiết lập framework test Jest
                - **`.env`** - Biến môi trường (không có trong git)
                - **`.env.example`** - Template cho biến môi trường

                ### **📚 Tài liệu**
                - **`ARCHITECTURE.md`** - Kiến trúc hệ thống tổng quan
                - **`README.md`** - Tổng quan dự án và bắt đầu nhanh

                ---

                ## 🗄️ Lớp Cơ sở dữ liệu (`/prisma`)

                ### **📋 Quản lý Schema**
                ```
                prisma/
                ├── 📄 schema.prisma           # Schema cơ sở dữ liệu chính
                │   ├── datasource db         # Cấu hình kết nối cơ sở dữ liệu
                │   ├── generator client      # Tạo Prisma client
                │   └── model definitions     # Tất cả models cơ sở dữ liệu
                └── 📁 migrations/            # Thay đổi schema có kiểm soát phiên bản
                    ├── 📄 migration_lock.toml # Đảm bảo tính nhất quán migration
                        └── 📁 {timestamp}_{name}/ # Thư mục migration riêng lẻ
                                └── 📄 migration.sql   # Lệnh SQL cho migration
                                ```

                                ### **🏢 Tổng quan Models Cơ sở dữ liệu**
                                | Nhóm Model | Models | Mục đích |
                                |-------------|--------|---------|
                                | **Quản lý Người dùng** | `SiteUser`, `Role`, `Permission`, `UserRole` | Xác thực & phân quyền |
                                | **Hệ thống Địa chỉ** | `Address`, `UserAddress` | Quản lý vị trí người dùng |
                                | **Catalog Sản phẩm** | `Product`, `ProductCategory`, `ProductItem` | Phân cấp sản phẩm |
                                | **Chi tiết Sản phẩm** | `ProductImage`, `CategoryAttribute`, `Variation` | Thông số sản phẩm |
                                | **Mua sắm** | `ShoppingCart`, `CartItem` | Chức năng giỏ hàng |
                                | **Đơn hàng** | `ShopOrder`, `OrderItem`, `OrderStatus` | Quản lý đơn hàng |
                                | **Đánh giá** | `ProductReview` | Phản hồi khách hàng |
                                | **Thanh toán** | `PaymentMethod`, `UserPayment`, `ShippingMethod` | Xử lý thanh toán |
                                | **Khuyến mãi** | `Discount`, `DiscountProduct` | Marketing & khuyến mãi |

                                ---

                                ## 💻 Mã nguồn (`/src`)

                                ### **🚀 Điểm Khởi đầu**

                                #### **`index.ts` - Bootstrap Ứng dụng**
                                ```typescript
                                // Trách nhiệm:
                                ├── Tải biến môi trường
                                ├── Khởi tạo kết nối cơ sở dữ liệu
                                ├── Khởi động máy chủ HTTP
                                ├── Xử lý tắt máy nhẹ nhàng
                                └── Thiết lập xử lý lỗi
                                ```

                                #### **`app.ts` - Ứng dụng Express**
                                ```typescript
                                // Pipeline Middleware:
                                ├── Bảo mật (Helmet)
                                ├── Cấu hình CORS
                                ├── Phân tích Body (JSON/URL-encoded)
                                ├── Ghi log yêu cầu (Morgan)
                                ├── Middleware phân trang
                                ├── Mount các route API
                                └── Middleware xử lý lỗi
                                ```

                                #### **`server.ts` - Máy chủ HTTP**
                                ```typescript
                                // Quản lý Máy chủ:
                                ├── Ràng buộc cổng
                                ├── Ghi log khởi động máy chủ
                                ├── Xử lý tắt máy nhẹ nhàng
                                └── Xử lý tín hiệu process
                                ```

                                ---

                                ### **⚙️ Cấu hình (`/config`)**

                                ```
                                config/
                                ├── 📄 constants.ts           # Hằng số ứng dụng
                                ├── 📄 database.ts            # Thiết lập kết nối cơ sở dữ liệu
                                └── 📄 env.ts                 # Xác thực biến môi trường
                                ```

                                **Mục đích của từng file:**
                                - **`constants.ts`** - Định nghĩa các hằng số ứng dụng
                                - **`database.ts`** - Khởi tạo Prisma client và kết nối
                                - **`env.ts`** - Xác thực và typing cho biến môi trường

                                ---

                                ### **🎯 Controllers (`/controllers`)**

                                ```
                                controllers/
                                ├── 📄 authController.ts      # Endpoints xác thực
                                ├── 📄 cartController.ts      # Thao tác giỏ hàng
                                ├── 📄 orderController.ts     # Quản lý đơn hàng
                                ├── 📄 productController.ts   # Catalog sản phẩm
                                ├── 📄 reviewController.ts    # Đánh giá sản phẩm
                                └── 📄 userController.ts      # Quản lý hồ sơ người dùng
                                ```

                                **Mẫu Controller:**
                                ```typescript
                                // Cấu trúc controller chuẩn
                                class Controller {
                                  async operation(req: Request, res: Response, next: NextFunction) {
                                      try {
                                            // 1. Trích xuất & xác thực dữ liệu yêu cầu
                                                  // 2. Gọi lớp service
                                                        // 3. Định dạng phản hồi
                                                              // 4. Gửi phản hồi
                                                                  } catch (error) {
                                                                        // 5. Chuyển lỗi cho error handler
                                                                              next(error);
                                                                                  }
                                                                                    }
                                                                                    }
                                                                                    ```

                                                                                    ---

                                                                                    ### **🛡️ Middleware (`/middleware`)**

                                                                                    ```
                                                                                    middleware/
                                                                                    ├── 📄 auth.ts               # Xác thực JWT & phân quyền
                                                                                    ├── 📄 errorHandler.ts       # Xử lý lỗi toàn cục
                                                                                    └── 📄 pagination.ts         # Phân tích tham số phân trang
                                                                                    ```

                                                                                    **Các hàm Middleware:**
                                                                                    - **`auth.ts`** - `authMiddleware()`, `authorizeRoles()`
                                                                                    - **`errorHandler.ts`** - Bộ xử lý lỗi toàn cục
                                                                                    - **`pagination.ts`** - Phân tích tham số `?page` & `?limit`

                                                                                    ---

                                                                                    ### **🗺️ Routes (`/routes`)**

                                                                                    ```
                                                                                    routes/
                                                                                    ├── 📄 index.ts              # Router chính - kết hợp tất cả routes
                                                                                    ├── 📄 auth.ts               # Routes xác thực
                                                                                    ├── 📄 cart.ts               # Routes giỏ hàng  
                                                                                    ├── 📄 orders.ts             # Routes quản lý đơn hàng
                                                                                    ├── 📄 products.ts           # Routes catalog sản phẩm
                                                                                    ├── 📄 reviews.ts            # Routes hệ thống đánh giá
                                                                                    └── 📄 users.ts              # Routes hồ sơ người dùng
                                                                                    ```

                                                                                    **Cấu trúc Route:**
                                                                                    ```typescript
                                                                                    // Mẫu: HTTP_METHOD /path -> middleware -> controller
                                                                                    router.get('/endpoint', middleware1, middleware2, controller.method);
                                                                                    router.post('/endpoint', validation, auth, controller.method);
                                                                                    ```

                                                                                    ---

                                                                                    ### **💼 Services (`/services`)**

                                                                                    ```
                                                                                    services/
                                                                                    ├── 📄 authService.ts        # Logic nghiệp vụ xác thực
                                                                                    ├── 📄 cartService.ts        # Logic giỏ hàng
                                                                                    ├── 📄 orderService.ts       # Logic xử lý đơn hàng  
                                                                                    ├── 📄 productService.ts     # Logic quản lý sản phẩm
                                                                                    ├── 📄 reviewService.ts      # Logic hệ thống đánh giá
                                                                                    └── 📄 userService.ts        # Logic quản lý người dùng
                                                                                    ```

                                                                                    **Trách nhiệm Lớp Service:**
                                                                                    - Triển khai logic nghiệp vụ
                                                                                    - Thao tác cơ sở dữ liệu qua Prisma
                                                                                    - Biến đổi dữ liệu
                                                                                    - Xác thực phức tạp
                                                                                    - Tích hợp với API bên ngoài

                                                                                    ---

                                                                                    ### **📝 Types (`/types`)**

                                                                                    ```
                                                                                    types/
                                                                                    ├── 📄 api.ts                # Kiểu API request/response
                                                                                    └── 📄 express.d.ts          # Mở rộng framework Express
                                                                                    ```

                                                                                    **Định nghĩa Kiểu:**
                                                                                    ```typescript
                                                                                    // api.ts - Giao diện API
                                                                                    interface ApiResponse<T> {
                                                                                      success: boolean;
                                                                                        data?: T;
                                                                                          error?: ApiError;
                                                                                            pagination?: PaginationInfo;
                                                                                            }

                                                                                            // express.d.ts - Mở rộng Express  
                                                                                            declare global {
                                                                                              namespace Express {
                                                                                                  interface Request {
                                                                                                        user?: User;
                                                                                                              pagination?: PaginationParams;
                                                                                                                  }
                                                                                                                    }
                                                                                                                    }
                                                                                                                    ```

                                                                                                                    ---

                                                                                                                    ### **🔧 Utils (`/utils`)**

                                                                                                                    ```
                                                                                                                    utils/
                                                                                                                    ├── 📄 hash.ts               # Tiện ích băm mật khẩu
                                                                                                                    ├── 📄 jwt.ts                # Tiện ích JWT token
                                                                                                                    ├── 📄 pagination.ts         # Helpers phân trang
                                                                                                                    └── 📄 response.ts           # Tiện ích định dạng phản hồi
                                                                                                                    ```

                                                                                                                    **Hàm Tiện ích:**
                                                                                                                    - **`hash.ts`** - `hashPassword()`, `comparePassword()`
                                                                                                                    - **`jwt.ts`** - `generateToken()`, `verifyToken()`
                                                                                                                    - **`pagination.ts`** - `calculatePagination()`, `buildPaginationQuery()`
                                                                                                                    - **`response.ts`** - `successResponse()`, `errorResponse()`

                                                                                                                    ---

                                                                                                                    ### **✅ Validators (`/validators`)**

                                                                                                                    ```
                                                                                                                    validators/
                                                                                                                    ├── 📄 auth.ts               # Quy tắc xác thực Authentication
                                                                                                                    ├── 📄 cart.ts               # Xác thực thao tác Cart
                                                                                                                    ├── 📄 order.ts              # Quy tắc xác thực Order
                                                                                                                    ├── 📄 product.ts            # Quy tắc xác thực Product
                                                                                                                    ├── 📄 review.ts             # Quy tắc xác thực Review
                                                                                                                    └── 📄 user.ts               # Xác thực dữ liệu User
                                                                                                                    ```

                                                                                                                    **Mẫu Validation:**
                                                                                                                    ```typescript
                                                                                                                    // Sử dụng express-validator
                                                                                                                    export const createProductValidator = [
                                                                                                                      body('name').notEmpty().withMessage('Tên sản phẩm là bắt buộc'),
                                                                                                                        body('price').isNumeric().withMessage('Giá phải là số'),
                                                                                                                          // ... các quy tắc khác
                                                                                                                          ];
                                                                                                                          ```

                                                                                                                          ---

                                                                                                                          ## 🧪 Testing (`/tests`)

                                                                                                                          ```
                                                                                                                          tests/
                                                                                                                          ├── 📁 unit/                 # Unit tests
                                                                                                                          ├── 📁 integration/          # Integration tests
                                                                                                                          ├── 📁 fixtures/             # Dữ liệu test
                                                                                                                          └── 📁 helpers/              # Tiện ích test
                                                                                                                          ```

                                                                                                                          **Chiến lược Testing:**
                                                                                                                          - **Unit Tests** - Các hàm/phương thức riêng lẻ
                                                                                                                          - **Integration Tests** - Các endpoint API
                                                                                                                          - **Database Tests** - Thao tác cơ sở dữ liệu
                                                                                                                          - **Authentication Tests** - JWT & phân quyền

                                                                                                                          ---

                                                                                                                          ## 📚 Tài liệu (`/docs`)

                                                                                                                          ```
                                                                                                                          docs/
                                                                                                                          ├── 📄 api-docs.md           # Tài liệu API hoàn chình
                                                                                                                          ├── 📄 server-workflow.md    # Luồng request/response máy chủ
                                                                                                                          ├── 📄 setup-guide.md        # Hướng dẫn cài đặt & triển khai
                                                                                                                          └── 📄 project-structure.md  # Tài liệu kiến trúc này
                                                                                                                          ```

                                                                                                                          ---

                                                                                                                          ## 🔄 Kiến trúc Luồng Dữ liệu

                                                                                                                          ```
                                                                                                                          📱 Yêu cầu từ Client
                                                                                                                              ↓
                                                                                                                              🛡️ Express Middleware (auth, validation, logging)
                                                                                                                                  ↓  
                                                                                                                                  🗺️ Router (khớp route)
                                                                                                                                      ↓
                                                                                                                                      🎯 Controller (xử lý yêu cầu)
                                                                                                                                          ↓
                                                                                                                                          💼 Service (logic nghiệp vụ)
                                                                                                                                              ↓
                                                                                                                                              🗄️ Prisma ORM (thao tác cơ sở dữ liệu)
                                                                                                                                                  ↓
                                                                                                                                                  💾 Cơ sở dữ liệu MySQL
                                                                                                                                                      ↓
                                                                                                                                                      📤 Phản hồi (JSON đã định dạng)
                                                                                                                                                          ↓
                                                                                                                                                          📱 Client
                                                                                                                                                          ```

                                                                                                                                                          ---

                                                                                                                                                          ## 🔧 Quy trình Phát triển

                                                                                                                                                          ### **📝 Thêm Tính năng Mới**
                                                                                                                                                          1. **Cơ sở dữ liệu**: Cập nhật `schema.prisma` nếu cần
                                                                                                                                                          2. **Migration**: Chạy `prisma migrate dev`
                                                                                                                                                          3. **Types**: Thêm/cập nhật giao diện TypeScript
                                                                                                                                                          4. **Validation**: Tạo quy tắc validation
                                                                                                                                                          5. **Service**: Triển khai logic nghiệp vụ
                                                                                                                                                          6. **Controller**: Xử lý yêu cầu HTTP
                                                                                                                                                          7. **Routes**: Định nghĩa endpoint API
                                                                                                                                                          8. **Tests**: Viết unit/integration tests
                                                                                                                                                          9. **Tài liệu**: Cập nhật tài liệu API

                                                                                                                                                          ### **🔄 Nguyên tắc Tổ chức Code**
                                                                                                                                                          - **Phân tách Quan tâm** - Mỗi lớp có trách nhiệm cụ thể
                                                                                                                                                          - **Trách nhiệm Đơn lẻ** - Mỗi file/hàm có một mục đích
                                                                                                                                                          - **Dependency Injection** - Services inject dependencies
                                                                                                                                                          - **An toàn Kiểu** - Phủ sóng TypeScript đầy đủ
                                                                                                                                                          - **Xử lý Lỗi** - Quản lý lỗi tập trung

                                                                                                                                                          ---

                                                                                                                                                          ## 📊 Metrics & Giám sát

                                                                                                                                                          ### **🔍 Điểm Ghi log**
                                                                                                                                                          - Ghi log Request/Response (Morgan)
                                                                                                                                                          - Ghi log lỗi (Winston/Console)
                                                                                                                                                          - Ghi log truy vấn cơ sở dữ liệu (Prisma)
                                                                                                                                                          - Sự kiện xác thực
                                                                                                                                                          - Lỗi logic nghiệp vụ

                                                                                                                                                          ### **📈 Cân nhắc Hiệu suất**
                                                                                                                                                          - Chiến lược lập chỉ mục cơ sở dữ liệu
                                                                                                                                                          - Tối ưu hóa truy vấn
                                                                                                                                                          - Triển khai bộ nhớ đệm
                                                                                                                                                          - Giới hạn tốc độ
                                                                                                                                                          - Nén phản hồi

                                                                                                                                                          ---

                                                                                                                                                          **🚀 Chúc bạn code vui vẻ với kiến trúc này!**