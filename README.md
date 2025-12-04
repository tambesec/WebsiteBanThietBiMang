# 🛒 NetworkStore API

**E-commerce REST API** for network equipment store built with **NestJS**, **Prisma**, and **MySQL**.

[![NestJS](https://img.shields.io/badge/NestJS-v11-E0234E?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748?logo=prisma)](https://www.prisma.io/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?logo=mysql)](https://www.mysql.com/)

---

## 🚀 Features

### 🔐 **Authentication & Authorization**
- ✅ **Email/Password Authentication** - Traditional registration and login
- ✅ **Google OAuth2** - One-click login with Google account
- ✅ **JWT-based Authorization** - Secure access and refresh tokens
- ✅ **Role-based Access Control** - Customer and Admin roles
- ✅ **Account Security** - Lockout after failed attempts, password history
- ✅ **Session Management** - Track and revoke active sessions

### 🛡️ **Security Features**
- ✅ **AES-256-GCM Encryption** - OAuth tokens encrypted at rest
- ✅ **Bcrypt Password Hashing** - Industry standard with configurable rounds
- ✅ **Rate Limiting** - Protection against brute force attacks
- ✅ **CORS Protection** - Configurable cross-origin policies
- ✅ **Helmet Security Headers** - XSS, clickjacking protection
- ✅ **Input Validation** - All endpoints validated with class-validator
- ✅ **Security Audit Logging** - Comprehensive event tracking

### 📊 **Database Schema**
13 tables covering complete e-commerce functionality:
- Users & Authentication (users, oauth_accounts, user_sessions)
- Products & Categories (products, categories, product_images, product_reviews)
- Shopping Cart (shopping_carts, cart_items)
- Orders & Payments (orders, order_items, order_statuses, order_history)
- Addresses & Shipping (addresses)
- Discounts (discount_codes, discount_usage)
- Security (security_logs, password_history, verification_tokens)

### 📖 **API Documentation**
- ✅ **Swagger/OpenAPI** - Interactive API documentation
- ✅ **JWT Bearer Auth** - Try endpoints directly in Swagger UI

---

## 📋 Description

NetworkStore API provides a complete backend solution for e-commerce applications with enterprise-grade security and scalability.

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Setup Database
```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push
```

### 4. Start Development Server
```bash
npm run start:dev
```

**API will be available at**: `http://localhost:3000/api/v1`  
**Swagger Documentation**: `http://localhost:3000/api`

---

## 🔐 OAuth2 Setup (Optional)

For Google OAuth authentication:

```bash
# Run automated setup
chmod +x setup-oauth.sh
./setup-oauth.sh
```

Or follow manual setup in [OAUTH_SETUP_GUIDE.md](./OAUTH_SETUP_GUIDE.md)

---

## 🛠️ Available Scripts

```bash
# Development
npm run start:dev      # Start with hot-reload

# Production
npm run build          # Build for production
npm run start:prod     # Start production server

# Testing
npm run test           # Run unit tests
npm run test:e2e       # Run e2e tests
npm run test:cov       # Generate coverage report

# Database
npx prisma generate    # Generate Prisma Client
npx prisma db push     # Push schema changes
npx prisma studio      # Open Prisma Studio GUI

# Code Quality
npm run lint           # Lint code
npm run format         # Format code with Prettier
npm audit              # Check for vulnerabilities
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [QUICKSTART.md](./QUICKSTART.md) | Quick start guide (Vietnamese) |
| [AUTH_DOCUMENTATION.md](./AUTH_DOCUMENTATION.md) | Authentication API endpoints |
| [OAUTH_SETUP_GUIDE.md](./OAUTH_SETUP_GUIDE.md) | Google OAuth2 setup guide |
| [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) | Security measures and audit |

---

## 🔒 Security

### Implemented Security Measures

- ✅ **JWT Authentication** - Access and refresh tokens
- ✅ **OAuth2 Google** - Secure third-party authentication
- ✅ **Password Security** - Bcrypt hashing, history tracking
- ✅ **Account Lockout** - After 5 failed attempts
- ✅ **Rate Limiting** - 10 requests per minute
- ✅ **Token Encryption** - AES-256-GCM for OAuth tokens
- ✅ **Security Logging** - All auth events tracked
- ✅ **Input Validation** - All endpoints validated
- ✅ **CORS Protection** - Configurable origins
- ✅ **Helmet Headers** - XSS, clickjacking protection

### Security Recommendations

```bash
# Generate secure secrets
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Run security audit
npm audit

# Check for vulnerabilities
npm outdated
```

**Important**: Read [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) before deploying to production.

---

## 🏗️ Architecture

```
src/
├── auth/                   # Authentication module
│   ├── strategies/        # Passport strategies (JWT, Google)
│   ├── guards/            # Auth guards (JWT, Roles)
│   ├── decorators/        # Custom decorators
│   └── dto/               # Data transfer objects
├── common/                 # Shared resources
│   ├── filters/           # Exception filters
│   └── interceptors/      # Response interceptors
├── config/                 # Configuration
├── prisma/                 # Database service
└── main.ts                 # Application entry point

prisma/
└── schema.prisma          # Database schema (13 tables)
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov

# Watch mode
npm run test:watch
```

---

## 🚀 Deployment

### Pre-deployment Checklist

- [ ] Update all secrets in `.env`
- [ ] Enable HTTPS
- [ ] Configure CORS for production domain
- [ ] Setup database backup
- [ ] Enable database encryption at rest
- [ ] Configure monitoring and alerts
- [ ] Review security audit report
- [ ] Test OAuth flow in production environment

### Environment Variables

Required for production:
```env
DATABASE_URL=mysql://user:pass@host:3306/db
JWT_ACCESS_SECRET=<generated-secret>
JWT_REFRESH_SECRET=<generated-secret>
ENCRYPTION_KEY=<generated-secret>
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/v1/auth/google/callback
FRONTEND_URL=https://yourdomain.com
NODE_ENV=production
```

---

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login with email/password
- `GET /api/v1/auth/google` - Login with Google
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/profile` - Get user profile
- `POST /api/v1/auth/change-password` - Change password
- `GET /api/v1/auth/oauth/accounts` - Get linked OAuth accounts
- `DELETE /api/v1/auth/oauth/:provider` - Unlink OAuth provider

**Full API documentation available at**: `http://localhost:3000/api`

---

## 🛣️ Roadmap

- [x] Authentication system (Email/Password)
- [x] OAuth2 Google integration
- [x] Security features (encryption, rate limiting)
- [ ] Products management module
- [ ] Shopping cart module
- [ ] Orders & checkout module
- [ ] Payment integration (Stripe/PayPal)
- [ ] Admin dashboard
- [ ] Email notifications
- [ ] Product reviews & ratings
- [ ] Advanced search & filters
- [ ] Image upload & CDN
- [ ] Analytics & reporting

---

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines first.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is [MIT licensed](LICENSE).

---

## 🙏 Acknowledgments

- Built with [NestJS](https://nestjs.com/) - Progressive Node.js framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Passport](http://www.passportjs.org/) - Authentication middleware
- Security best practices from [OWASP](https://owasp.org/)

---

## 📞 Support

For issues and questions:
- 📧 Email: support@networkstore.com
- 🔒 Security issues: security@networkstore.com
- 📖 Documentation: See docs folder

---

**Made with ❤️ for secure e-commerce**
