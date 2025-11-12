# 📂 Cấu Trúc Dự Án Backend - Visualization

## 🎯 Project Tree

```
backend/
│
├── 📁 src/                          # Source Code
│   ├── 📄 index.ts                 # Entry point
│   ├── 📄 app.ts                   # Express app configuration
│   ├── 📄 server.ts                # Server startup
│   │
│   ├── 📁 config/                  # Configuration
│   │   ├── 📄 env.ts              # Environment variables
│   │   ├── 📄 database.ts         # Prisma client instance
│   │   └── 📄 constants.ts        # Constants, enums, messages
│   │
│   ├── 📁 controllers/             # HTTP Request Handlers
│   │   ├── 📄 authController.ts
│   │   ├── 📄 productController.ts
│   │   ├── 📄 orderController.ts
│   │   ├── 📄 cartController.ts
│   │   ├── 📄 userController.ts
│   │   └── 📄 reviewController.ts
│   │
│   ├── 📁 services/                # Business Logic
│   │   ├── 📄 authService.ts
│   │   ├── 📄 productService.ts
│   │   ├── 📄 orderService.ts
│   │   ├── 📄 cartService.ts
│   │   ├── 📄 userService.ts
│   │   └── 📄 reviewService.ts
│   │
│   ├── 📁 routes/                  # API Endpoints
│   │   ├── 📄 auth.ts
│   │   ├── 📄 products.ts
│   │   ├── 📄 orders.ts
│   │   ├── 📄 cart.ts
│   │   ├── 📄 users.ts
│   │   ├── 📄 reviews.ts
│   │   └── 📄 index.ts            # Combine all routes
│   │
│   ├── 📁 middleware/              # Express Middleware
│   │   ├── 📄 auth.ts             # JWT authentication & authorization
│   │   ├── 📄 errorHandler.ts     # Global error handling
│   │   └── 📄 pagination.ts       # Pagination helper
│   │
│   ├── 📁 validators/              # Input Validation Schemas
│   │   ├── 📄 auth.ts
│   │   ├── 📄 product.ts
│   │   ├── 📄 order.ts
│   │   ├── 📄 cart.ts
│   │   ├── 📄 user.ts
│   │   └── 📄 review.ts
│   │
│   ├── 📁 utils/                   # Utility Functions
│   │   ├── 📄 jwt.ts              # JWT token generation/verification
│   │   ├── 📄 hash.ts             # Password hashing/comparison
│   │   ├── 📄 response.ts         # API response formatting
│   │   └── 📄 pagination.ts       # Pagination helpers
│   │
│   └── 📁 types/                   # TypeScript Type Definitions
│       ├── 📄 api.ts              # API request/response types
│       └── 📄 express.d.ts        # Express type extensions
│
├── 📁 prisma/                       # Database & ORM
│   ├── 📄 schema.prisma           # Prisma schema (23 models)
│   ├── 📁 migrations/             # Database migrations
│   └── 📄 .env                    # Database connection URL
│
├── 📁 tests/                        # Test Files
│   ├── 📁 unit/                   # Unit tests
│   ├── 📁 integration/            # Integration tests
│   └── 📁 fixtures/               # Test data/mocks
│
├── 📁 uploads/                      # User uploaded files (gitignored)
│
├── 📄 .env                         # Development environment
├── 📄 .env.example                # Environment template
├── 📄 .gitignore                  # Git ignore
│
├── 📄 package.json                # Dependencies & scripts
├── 📄 tsconfig.json               # TypeScript config
├── 📄 jest.config.js              # Jest test config
│
├── 📄 README.md                   # Project overview
├── 📄 SETUP_GUIDE.md              # Quick start
├── 📄 PROJECT_STRUCTURE.md        # Detailed structure
├── 📄 API_DOCUMENTATION.md        # API endpoints
├── 📄 IMPLEMENTATION_SUMMARY.md   # Implementation summary
│
└── 📄 script2310.sql              # Original database schema
```

---

## 🔄 Request/Response Flow

```
┌─────────────┐
│   Client    │
│  (Frontend) │
└──────┬──────┘
       │ HTTP Request
       │ GET/POST/PUT/DELETE /api/v1/...
       ▼
┌──────────────────────────────────────────┐
│           Express Server                 │
├──────────────────────────────────────────┤
│  ┌──────────────────────────────────┐   │
│  │      Routes (routes/*)           │   │ ← Matches URL pattern
│  └────────────────┬─────────────────┘   │
│                   │                      │
│  ┌────────────────▼─────────────────┐   │
│  │    Middleware Chain              │   │
│  │  • authMiddleware                │   │ ← JWT verification
│  │  • paginationMiddleware          │   │ ← Pagination setup
│  │  • validationMiddleware          │   │ ← Input validation
│  └────────────────┬─────────────────┘   │
│                   │                      │
│  ┌────────────────▼─────────────────┐   │
│  │  Controllers (controllers/*)      │   │ ← HTTP handler
│  │  • Extract request data          │   │
│  │  • Call service layer            │   │
│  │  • Format response               │   │
│  └────────────────┬─────────────────┘   │
│                   │                      │
│  ┌────────────────▼─────────────────┐   │
│  │  Services (services/*)           │   │ ← Business logic
│  │  • Data validation               │   │
│  │  • Complex calculations          │   │
│  │  • Call database layer           │   │
│  └────────────────┬─────────────────┘   │
│                   │                      │
│  ┌────────────────▼─────────────────┐   │
│  │  Prisma ORM (prisma/schema)      │   │ ← Database abstraction
│  └────────────────┬─────────────────┘   │
│                   │                      │
└───────────────────┼──────────────────────┘
                    │
                    ▼
            ┌──────────────────┐
            │  MySQL Database  │
            │  (networkstore)  │
            └──────────────────┘
                    │ Query Result
                    │
┌───────────────────▼──────────────────┐
│  Response Formatting (utils/response)│
│  • Success/Error wrapper             │
│  • Status code                       │
│  • Pagination metadata               │
│  • Timestamp                         │
└───────────────────┬──────────────────┘
                    │
                    ▼ JSON Response
            ┌──────────────────┐
            │     Client       │
            │   (Frontend)     │
            └──────────────────┘
```

---

## 📊 Database Schema Overview

### 👥 User Management (9 tables)
```
SiteUser
  ├── UserRole → Role → RolePermission → Permission
  ├── UserSession
  ├── UserAddress → Address
  ├── UserPayment → PaymentMethod
  ├── PasswordHistory
  ├── VerificationToken
  └── SecurityLog
```

### 📦 Products (10 tables)
```
ProductCategory (hierarchical)
  └── Product
       ├── ProductItem (SKU variants)
       │    ├── ProductConfiguration → VariationOption
       │    └── CartItem → ShoppingCart
       ├── ProductImage
       ├── ProductReview (← User)
       └── DiscountProduct ← Discount
       
CategoryAttribute
ProductAttributeValue

Variation → VariationOption
```

### 🛒 Orders & Shopping (6 tables)
```
ShoppingCart
  └── CartItem → ProductItem

ShopOrder
  ├── OrderItem → ProductItem
  ├── OrderItem → ProductReview
  ├── OrderStatusHistory → OrderStatus
  ├── Discount
  ├── ShippingMethod
  └── UserPayment
```

### 💳 Payments & Shipping (3 tables)
```
PaymentMethod ← UserPayment ← ShopOrder
ShippingMethod ← ShopOrder
```

### 🎟️ Other (3 tables)
```
Address ← UserAddress ← SiteUser
Address ← ShopOrder (shipping/billing)

Discount ← DiscountProduct ← Product
Discount ← ShopOrder
```

---

## 🔐 Authentication & Authorization

```
┌─────────────────────────────────────┐
│       User Login Request            │
│  POST /api/v1/auth/login            │
│  Body: { email, password }          │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Verify Email & Password            │
│  • Hash input password              │
│  • Compare with DB                  │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Generate Tokens                    │
│  • Access Token (7 days)            │
│  • Refresh Token (30 days)          │
│  • Store session in DB              │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Return Tokens to Client            │
│  {                                  │
│    accessToken: "jwt...",           │
│    refreshToken: "jwt..."           │
│  }                                  │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Protected Request with Token       │
│  GET /api/v1/user/profile           │
│  Header: Authorization: Bearer ...  │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  authMiddleware                     │
│  • Extract token from header        │
│  • Verify JWT signature             │
│  • Extract user info                │
│  • Attach to req.user               │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Check Authorization (if needed)    │
│  • Verify user role                 │
│  • Check permissions                │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Proceed to Handler                 │
└─────────────────────────────────────┘
```

---

## 📍 API Route Structure

```
/api/v1/
├── /auth
│   ├── POST /register
│   ├── POST /login
│   ├── POST /logout
│   ├── POST /refresh-token
│   ├── POST /forgot-password
│   ├── POST /reset-password
│   └── POST /verify-email
│
├── /products
│   ├── GET / (list)
│   ├── GET /:id
│   ├── GET /slug/:slug
│   ├── POST / (admin)
│   ├── PUT /:id (admin)
│   ├── DELETE /:id (admin)
│   ├── GET /categories
│   ├── GET /:id/images
│   ├── GET /:id/reviews
│   └── GET /search
│
├── /cart
│   ├── GET /
│   ├── POST /items
│   ├── PUT /items/:id
│   ├── DELETE /items/:id
│   └── DELETE /
│
├── /orders
│   ├── POST /
│   ├── GET /
│   ├── GET /:id
│   ├── GET /:id/items
│   ├── GET /:id/status-history
│   ├── PUT /:id/status (admin)
│   └── PUT /:id/cancel
│
├── /users
│   ├── GET /profile
│   ├── PUT /profile
│   ├── GET /addresses
│   ├── POST /addresses
│   ├── PUT /addresses/:id
│   ├── DELETE /addresses/:id
│   └── GET /payment-methods
│
└── /reviews
    ├── POST /
    ├── GET /
    ├── PUT /:id
    ├── DELETE /:id
    └── GET /admin (admin)
```

---

## 🎯 Development Workflow

```
1. Create Feature Branch
   git checkout -b feature/add-payment

2. Implement in Following Order:
   a) Database Model (schema.prisma)
      └─ prisma migrate dev

   b) Service Layer (services/*)
      └─ Business logic

   c) Controller Layer (controllers/*)
      └─ HTTP handling

   d) Validators (validators/*)
      └─ Input validation

   e) Routes (routes/*)
      └─ Endpoint registration

   f) Tests (tests/*)
      └─ Unit & integration tests

3. Run Checks:
   npm run lint
   npm run test
   npm run build

4. Commit & Push:
   git add .
   git commit -m "feat: add payment system"
   git push origin feature/add-payment

5. Create Pull Request
```

---

## 🚀 Deployment Checklist

- [ ] All tests passing
- [ ] No linting errors
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] JWT secrets changed
- [ ] CORS_ORIGIN updated
- [ ] Database connection verified
- [ ] Error logging configured
- [ ] Security headers enabled
- [ ] Rate limiting active
- [ ] Backups scheduled
- [ ] Monitoring setup

---

## 📚 File Purposes at a Glance

| File/Folder | Purpose |
|-------------|---------|
| `src/config/` | Load & manage configuration |
| `src/controllers/` | Handle HTTP requests/responses |
| `src/services/` | Core business logic |
| `src/routes/` | Define API endpoints |
| `src/middleware/` | Cross-cutting concerns |
| `src/validators/` | Input validation rules |
| `src/utils/` | Reusable utility functions |
| `src/types/` | TypeScript type definitions |
| `prisma/schema.prisma` | Database schema definition |
| `tests/` | Unit & integration tests |
| `.env` | Environment variables |
| `package.json` | Dependencies & scripts |
| `tsconfig.json` | TypeScript compiler options |

---

**Cấu trúc này tuân theo các best practices:**
- ✅ Separation of Concerns
- ✅ MVC/MVCS Pattern
- ✅ Type Safety (TypeScript)
- ✅ Scalability
- ✅ Maintainability
- ✅ Testability
- ✅ Security
- ✅ Performance
