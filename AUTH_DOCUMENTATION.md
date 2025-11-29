# NetworkStore API - Authentication System

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

**IMPORTANT**: Generate secure JWT secrets:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Run Migrations (if needed)
```bash
npx prisma db push
```

### 5. Start Development Server
```bash
npm run start:dev
```

The API will be available at: `http://localhost:3000/api/v1`

---

## 🔐 Authentication Endpoints

Base URL: `http://localhost:3000/api/v1/auth`

### 1. Register New User
**POST** `/auth/register`

```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "phone": "0123456789",
  "password": "StrongPass123!"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "john@example.com",
      "full_name": "John Doe",
      "phone": "0123456789",
      "role": "customer",
      "created_at": "2025-11-28T10:00:00.000Z"
    }
  }
}
```

---

### 2. Login
**POST** `/auth/login`

```json
{
  "email": "john@example.com",
  "password": "StrongPass123!"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "john@example.com",
      "full_name": "John Doe",
      "role": "customer"
    }
  }
}
```

---

### 3. Refresh Token
**POST** `/auth/refresh`

```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 4. Get Profile (Protected)
**GET** `/auth/profile`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "id": 1,
    "email": "john@example.com",
    "full_name": "John Doe",
    "phone": "0123456789",
    "role": "customer",
    "is_active": 1,
    "is_email_verified": 0,
    "last_login": "2025-11-28T10:00:00.000Z",
    "created_at": "2025-11-28T09:00:00.000Z"
  }
}
```

---

### 5. Change Password (Protected)
**POST** `/auth/change-password`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "current_password": "StrongPass123!",
  "new_password": "NewStrongPass456!"
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Password changed successfully. Please login again."
}
```

---

### 6. Logout (Protected)
**POST** `/auth/logout`

**Headers:**
```
Authorization: Bearer <access_token>
```

**Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Logged out successfully"
}
```

---

## 🔒 Security Features

### 1. **Password Requirements**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (@$!%*?&)

### 2. **Account Locking**
- After 5 failed login attempts
- Account locked for 30 minutes
- Automatic unlock after duration

### 3. **Password History**
- Prevents reusing last 5 passwords
- Tracked in `password_history` table

### 4. **Security Logging**
- All auth events logged in `security_logs`
- Tracks: registration, login, logout, failed attempts, account locks

### 5. **Token Management**
- Access token: 15 minutes
- Refresh token: 7 days
- Refresh tokens stored in `user_sessions` table
- Can invalidate sessions on logout

### 6. **Rate Limiting**
- 10 requests per 60 seconds per IP
- Prevents brute force attacks

---

## 🛡️ Using Guards & Decorators

### Protect Routes (Default)
All routes are protected by default via global `JwtAuthGuard`.

### Make Route Public
```typescript
@Public()
@Get('public-route')
publicRoute() {
  return 'This is public';
}
```

### Restrict by Role
```typescript
@Roles('admin')
@UseGuards(RolesGuard)
@Get('admin-only')
adminRoute() {
  return 'Admin only';
}
```

### Access Current User
```typescript
@Get('profile')
getProfile(@Req() req: any) {
  const userId = req.user.sub;
  const email = req.user.email;
  const role = req.user.role;
  // ...
}
```

---

## 📁 Project Structure

```
src/
├── auth/
│   ├── decorators/
│   │   ├── public.decorator.ts       # @Public() decorator
│   │   └── roles.decorator.ts        # @Roles() decorator
│   ├── dto/
│   │   └── auth.dto.ts               # DTOs with validation
│   ├── guards/
│   │   ├── jwt-auth.guard.ts         # JWT authentication guard
│   │   └── roles.guard.ts            # Role-based authorization guard
│   ├── strategies/
│   │   └── jwt.strategy.ts           # Passport JWT strategy
│   ├── auth.controller.ts            # Auth endpoints
│   ├── auth.service.ts               # Auth business logic
│   └── auth.module.ts                # Auth module
├── common/
│   ├── filters/
│   │   └── http-exception.filter.ts  # Global exception handler
│   └── interceptors/
│       ├── logging.interceptor.ts    # Request/response logging
│       └── transform.interceptor.ts  # Response transformation
├── config/
│   └── configuration.ts              # Environment config
├── prisma/
│   ├── prisma.module.ts              # Prisma module
│   └── prisma.service.ts             # Database service
├── app.module.ts                     # Root module
└── main.ts                           # Application bootstrap
```

---

## 🧪 Testing with cURL

### Register
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "phone": "0123456789",
    "password": "StrongPass123!"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "StrongPass123!"
  }'
```

### Get Profile (with token)
```bash
curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production/test) | development |
| `PORT` | Server port | 3000 |
| `DATABASE_URL` | MySQL connection string | - |
| `JWT_ACCESS_SECRET` | Secret for access tokens | - |
| `JWT_ACCESS_EXPIRATION` | Access token expiration | 15m |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | - |
| `JWT_REFRESH_EXPIRATION` | Refresh token expiration | 7d |
| `BCRYPT_ROUNDS` | Password hashing rounds | 10 |
| `MAX_LOGIN_ATTEMPTS` | Max failed logins before lock | 5 |
| `LOCK_DURATION_MINUTES` | Account lock duration | 30 |
| `PASSWORD_HISTORY_COUNT` | Previous passwords to check | 5 |
| `THROTTLE_TTL` | Rate limit window (seconds) | 60 |
| `THROTTLE_LIMIT` | Max requests per window | 10 |

---

## 📝 Database Tables Used

- `users` - User accounts
- `user_sessions` - Active sessions/refresh tokens
- `password_history` - Password change history
- `security_logs` - Security event logging
- `verification_tokens` - Email/password reset tokens (ready for future use)

---

## 🚨 Error Handling

All errors are formatted consistently:

```json
{
  "statusCode": 401,
  "timestamp": "2025-11-28T10:00:00.000Z",
  "path": "/api/v1/auth/login",
  "method": "POST",
  "error": "Unauthorized",
  "message": "Invalid credentials"
}
```

Common error codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid credentials/token)
- `403` - Forbidden (insufficient permissions)
- `409` - Conflict (email already exists)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## 🎯 Next Steps

1. ✅ Auth module is complete and production-ready
2. 🔜 Add email verification flow
3. 🔜 Add password reset flow
4. 🔜 Add OAuth2 providers (Google, Facebook)
5. 🔜 Build other modules (Products, Orders, Cart, etc.)

---

## 📞 Support

For issues or questions, please check the code comments or create an issue in the repository.
