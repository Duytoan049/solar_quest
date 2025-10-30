# 🚀 Deploy Solar Quest lên Vercel

## Bước 1: Chuẩn bị

```bash
# Cài đặt dependencies
npm install

# Test build locally
npm run build

# Preview production build
npm run preview
```

## Bước 2: Deploy với Vercel CLI

### Cài đặt Vercel CLI
```bash
npm install -g vercel
```

### Login
```bash
vercel login
```

### Deploy
```bash
# Deploy preview
vercel

# Deploy production
vercel --prod
```

## Bước 3: Cấu hình Environment Variables trên Vercel

1. Truy cập Dashboard Vercel: https://vercel.com/dashboard
2. Chọn project `solar-quest`
3. Vào **Settings** → **Environment Variables**
4. Thêm các biến sau:

| Key | Value | Environment |
|-----|-------|-------------|
| `VITE_GEMINI_API_KEY` | Your Gemini API Key | Production, Preview, Development |
| `VITE_NASA_API_KEY` | Your NASA API Key (optional) | Production, Preview, Development |

### Lấy API Keys:
- **Gemini API**: https://aistudio.google.com/app/apikey
- **NASA API**: https://api.nasa.gov/

## Bước 4: Redeploy sau khi thêm Environment Variables

```bash
vercel --prod
```

Hoặc từ Dashboard:
- Vào tab **Deployments**
- Click nút **⋯** bên cạnh deployment mới nhất
- Click **Redeploy**

## 🎯 Deploy tự động với Git

Sau khi setup xong, mỗi khi bạn push code lên GitHub:
- Push lên branch `main` → Tự động deploy **Production**
- Push lên branch khác → Tự động tạo **Preview** deployment

## 🔧 Troubleshooting

### Build bị lỗi
```bash
# Xóa cache và rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Environment Variables không hoạt động
- Đảm bảo tên biến bắt đầu với `VITE_`
- Redeploy sau khi thêm biến mới
- Check logs trong Vercel Dashboard

### Lỗi 404 khi reload trang
- File `vercel.json` đã được tạo để xử lý SPA routing
- Đảm bảo file này có trong repository

## 📱 Kiểm tra Production

Sau khi deploy thành công:
1. Vercel sẽ cung cấp URL: `https://solar-quest.vercel.app`
2. Test tất cả tính năng
3. Check Console để đảm bảo không có lỗi

## 🌐 Custom Domain (Optional)

1. Vào **Settings** → **Domains**
2. Add domain của bạn
3. Cập nhật DNS records theo hướng dẫn
4. Chờ DNS propagation (~24h)

---

✨ **Happy Deploying!**
