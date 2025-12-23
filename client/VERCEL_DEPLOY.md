# Hướng Dẫn Deploy Client Lên Vercel

## 📋 Checklist Trước Khi Deploy

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

### Bước 1: Push Code Lên GitHub
```bash
cd client
git add .
git commit -m "Production ready for Vercel"
git push origin main
```

### Bước 2: Import Project Vào Vercel
1. Vào [vercel.com](https://vercel.com) → New Project
2. Import GitHub repository
3. **Root Directory:** `client`
4. **Framework Preset:** Next.js
5. **Build Command:** `npm run build` (mặc định)
6. **Output Directory:** `.next` (mặc định)

### Bước 3: Configure Environment Variables
Trong Vercel Dashboard → Settings → Environment Variables:

| Key | Value | Environments |
|-----|-------|--------------|
| `NEXT_PUBLIC_API_URL` | `https://api.nettechpro.me` | Production |
| `NEXT_PUBLIC_SITE_URL` | `https://nettechpro.me` | Production |
| `NEXT_PUBLIC_SITE_NAME` | `NetTechPro` | All |
| `NEXT_PUBLIC_SITE_DESCRIPTION` | `Cửa hàng thiết bị mạng` | All |

### Bước 4: Deploy
Click **Deploy** → Chờ build thành công

---

## ⚙️ Vercel Configuration (vercel.json)

File `vercel.json` đã được config để support Next.js App Router:

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

## 📱 Mobile Testing

Sau khi deploy, test trên:
- Chrome DevTools mobile emulator
- Safari iOS
- Chrome Android
- Responsive breakpoints: 375px, 768px, 1024px, 1440px

---

## 🔄 CI/CD Auto Deploy

Vercel tự động deploy khi:
- Push lên branch `main` → Deploy production
- Push lên branch khác → Deploy preview
- Create PR → Deploy preview với URL riêng

**Configure:**
Vercel Dashboard → Git → Production Branch → `main`

---

## 📞 Support

Nếu gặp vấn đề:
1. Check Vercel build logs
2. Check browser DevTools console
3. Test API endpoint riêng lẻ
4. Verify environment variables
5. Check CORS configuration

**Vercel Logs:**
```bash
vercel logs [deployment-url]
```
