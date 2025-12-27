# 🚀 Hướng Dẫn Deploy Client Lên Vercel

> **Cập nhật:** 26/12/2024

## 📋 Tổng Quan

| Thông tin | Giá trị |
|-----------|---------|
| Framework | Next.js 15.5.9 (App Router) |
| Node.js | 18.x hoặc 20.x |
| Build time | ~2-3 phút |
| Hosting | Vercel (Free tier OK) |

---

## ✅ Checklist Trước Khi Deploy

### 1. Backend PHẢI Deploy Trước
- ❌ **KHÔNG** deploy client trước khi backend hoạt động
- ✅ Backend cần có URL production (VD: `https://api.nettechpro.me`)
- ✅ Test backend endpoints bằng Postman/Thunder Client

### 2. Kiểm Tra Environment Variables
Các biến sau **BẮT BUỘC** trong Vercel Dashboard:

```env
# Backend API URL (QUAN TRỌNG NHẤT)
NEXT_PUBLIC_API_URL=https://api.nettechpro.me

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://nettechpro.me
NEXT_PUBLIC_SITE_NAME=NetTechPro
NEXT_PUBLIC_SITE_DESCRIPTION=Cửa hàng thiết bị mạng chuyên nghiệp

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_CART=true
NEXT_PUBLIC_ENABLE_WISHLIST=true
NEXT_PUBLIC_ENABLE_COMPARE=true
```

### 3. Google OAuth Configuration
❌ **Redirect URI hiện tại** (chỉ hoạt động local):
```
http://localhost:3000/api/v1/auth/google/callback
http://localhost:3001/signin
```

✅ **Cần thêm URIs production** trong Google Console:
```
https://api.nettechpro.me/api/v1/auth/google/callback
https://nettechpro.me/signin
```

**Cách config:**
1. Vào [Google Cloud Console](https://console.cloud.google.com/)
2. Chọn project OAuth
3. APIs & Services → Credentials
4. Chọn OAuth 2.0 Client ID
5. Thêm URIs vào "Authorized redirect URIs"

---

## 🚀 Deploy Lên Vercel

### Phương pháp 1: Deploy qua GitHub (Khuyến nghị)

#### Bước 1: Push Code Lên GitHub
```bash
# Từ thư mục gốc project
git add .
git commit -m "Production ready for Vercel"
git push origin main
```

#### Bước 2: Import Project Vào Vercel
1. Đăng nhập [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. **Import Git Repository** → Chọn repo của bạn
4. **Configure Project:**

   | Setting | Value |
   |---------|-------|
   | **Root Directory** | `client` ⚠️ QUAN TRỌNG |
   | **Framework Preset** | Next.js (auto-detect) |
   | **Build Command** | `npm run build` |
   | **Output Directory** | `.next` |
   | **Install Command** | `npm install` |

   ![Root Directory Setting](https://i.imgur.com/example.png)

#### Bước 3: Configure Environment Variables
Trong cùng màn hình → Mở **"Environment Variables"**:

| Key | Value | Environments |
|-----|-------|--------------|
| `NEXT_PUBLIC_API_URL` | `https://your-api-domain.com` | Production, Preview |
| `NEXT_PUBLIC_SITE_URL` | `https://your-site.vercel.app` | Production |
| `NEXT_PUBLIC_SITE_NAME` | `NetTechPro` | All |

⚠️ **Lưu ý:** Thay `your-api-domain.com` bằng URL backend thực tế của bạn!

#### Bước 4: Deploy
Click **"Deploy"** → Chờ 2-3 phút

---

### Phương pháp 2: Deploy qua Vercel CLI

```bash
# 1. Cài đặt Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy từ thư mục client
cd client
vercel

# 4. Trả lời các câu hỏi:
# ? Set up and deploy? → Y
# ? Which scope? → Chọn account
# ? Link to existing project? → N (lần đầu)
# ? What's your project's name? → nettechpro-client
# ? In which directory is your code located? → ./
# ? Want to modify settings? → N

# 5. Deploy production
vercel --prod
```

---

## ⚙️ Vercel Configuration

### File vercel.json (đã có sẵn)

```json
{
  "buildCommand": "npm run build",
  "framework": "nextjs",
  "installCommand": "npm install",
  "outputDirectory": ".next"
}
```

**Lưu ý:** Rewrites trong `next.config.js` chỉ hoạt động development, production dùng `NEXT_PUBLIC_API_URL` trực tiếp.

---

## 🔍 Kiểm Tra Sau Deploy

### 1. Test API Connection
```bash
# Test từ browser console
fetch('https://nettechpro.me/api/v1/categories')
  .then(res => res.json())
  .then(data => console.log(data));
```

**Expected:**
- ❌ Nếu CORS error → Backend chưa config CORS cho domain production
- ✅ Nếu trả về categories → OK

### 2. Test Authentication
- Đăng ký tài khoản mới
- Đăng nhập
- Kiểm tra cookies (DevTools → Application → Cookies)
- Logout

### 3. Test Google OAuth
- Click "Đăng nhập với Google"
- Chọn tài khoản
- Kiểm tra redirect về `/signin` thành công
- Verify user logged in

---

## 🐛 Troubleshooting

### Problem: "Network Error" khi call API

**Nguyên nhân:**
- `NEXT_PUBLIC_API_URL` chưa set trong Vercel
- Backend chưa chạy
- CORS chưa config đúng

**Fix:**
```bash
# 1. Kiểm tra backend
curl https://api.nettechpro.me/api/v1/categories

# 2. Kiểm tra env variable trong Vercel
vercel env ls

# 3. Add CORS origin trong backend
# src/main.ts
app.enableCors({
  origin: ['https://nettechpro.me', 'http://localhost:3001'],
  credentials: true,
});
```

### Problem: Google OAuth không hoạt động

**Nguyên nhân:** Redirect URI chưa thêm vào Google Console

**Fix:**
1. Google Console → OAuth Client
2. Add: `https://api.nettechpro.me/api/v1/auth/google/callback`
3. Add: `https://nettechpro.me/signin`

### Problem: Images không hiển thị

**Nguyên nhân:** Domain chưa trong `next.config.js` remotePatterns

**Fix:**
```js
// next.config.js
images: {
  remotePatterns: [
    { hostname: 'cdn.tgdd.vn' },
    { hostname: 'res.cloudinary.com' },
    { hostname: 's3.amazonaws.com' },
    { hostname: 'your-cdn-domain.com' }, // Add domain của bạn
  ],
},
```

### Problem: 404 trên refresh page

**Nguyên nhân:** Next.js App Router cần config

**Fix:** Vercel tự động handle, nhưng nếu vẫn lỗi:
```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

---

## 📊 Environment Variables Reference

### Development (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SITE_URL=http://localhost:3001
```

### Production (Vercel Dashboard)
```env
NEXT_PUBLIC_API_URL=https://api.nettechpro.me
NEXT_PUBLIC_SITE_URL=https://nettechpro.me
```

**Lưu ý:** 
- Variables bắt đầu `NEXT_PUBLIC_` sẽ được expose ra browser
- Không để API keys nhạy cảm trong `NEXT_PUBLIC_*`
- Rebuild project sau khi thay đổi env vars

---

## 🔐 Security Checklist

- ✅ HTTPS enabled (Vercel tự động)
- ✅ Environment variables không hardcode trong code
- ✅ OAuth redirect URIs chỉ cho phép domains chính thức
- ✅ CORS backend chỉ allow production domain
- ✅ Cookie `sameSite: 'lax'` và `secure: true` trong production
- ✅ Debug pages (`/debug-auth`) bị disable trong production

---

## � Cấu hình Backend cho Production

### 1. Thêm CORS Origin cho Frontend

Trong backend `.env`:
```env
CORS_ORIGINS=https://your-site.vercel.app,https://your-custom-domain.com
```

### 2. Cập nhật Cookie Settings

Đảm bảo backend `src/main.ts` có:
```typescript
session({
  cookie: {
    httpOnly: true,
    secure: true,  // HTTPS only
    sameSite: 'none',  // Cross-site cookies
  },
})
```

### 3. Google OAuth (nếu sử dụng)

Thêm vào Google Console:
```
Authorized redirect URIs:
- https://your-api-domain.com/api/v1/auth/google/callback

Authorized JavaScript origins:
- https://your-site.vercel.app
```

---

## 📱 Custom Domain (Tùy chọn)

### Bước 1: Thêm Domain trong Vercel
1. Project → Settings → Domains
2. Add domain: `www.yourdomain.com`
3. Vercel sẽ hiển thị DNS records cần cấu hình

### Bước 2: Cấu hình DNS
Thêm record tại nhà cung cấp domain:

| Type | Name | Value |
|------|------|-------|
| CNAME | www | cname.vercel-dns.com |
| A | @ | 76.76.21.21 |

### Bước 3: Đợi SSL Certificate
- Vercel tự động cấp SSL (Let's Encrypt)
- Thường mất 5-10 phút

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề:
1. Check Vercel build logs: Project → Deployments → Click deployment → Logs
2. Check browser DevTools console (F12)
3. Test API endpoint riêng lẻ
4. Verify environment variables đã set đúng
5. Check CORS configuration ở backend

**Vercel Logs qua CLI:**
```bash
vercel logs [deployment-url]
```

**Useful Links:**
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)
