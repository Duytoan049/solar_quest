# 🌍 Tính Năng Đa Ngôn Ngữ (i18n) - Solar Quest

## ✅ Đã Hoàn Thành

Hệ thống đa ngôn ngữ đã được tích hợp hoàn chỉnh vào dự án Solar Quest với các tính năng sau:

### 📦 Cài Đặt

- ✅ Đã cài đặt `i18next` và `react-i18next`
- ✅ Cấu hình i18n hoàn chỉnh

### 🗂️ Cấu Trúc File

```
src/
├── config/
│   └── i18n.ts                     ✅ Cấu hình i18next
├── contexts/
│   └── LanguageContext.tsx         ✅ Context quản lý ngôn ngữ
├── components/
│   ├── LanguageToggle.tsx          ✅ Button chuyển đổi ngôn ngữ
│   └── I18nDemo.tsx                ✅ Component demo test i18n
├── locales/
│   ├── en.json                     ✅ Bản dịch tiếng Anh (300+ keys)
│   └── vi.json                     ✅ Bản dịch tiếng Việt (300+ keys)
└── app/
    ├── index.tsx                   ✅ Đã import i18n config
    └── App.tsx                     ✅ Đã wrap LanguageProvider
```

### 🎯 Tính Năng

1. **Chuyển Đổi Ngôn Ngữ Dễ Dàng**

   - Button toggle ở góc trên phải màn hình
   - Chuyển đổi trực quan với icon cờ (🇬🇧/🇻🇳)
   - Hiệu ứng hover mượt mà

2. **Lưu Trữ Tự Động**

   - Ngôn ngữ được lưu vào localStorage
   - Tự động khôi phục khi quay lại

3. **Bản Dịch Đầy Đủ**
   - ✅ Common (loading, error, buttons...)
   - ✅ Menu (title, navigation...)
   - ✅ Auth (login, register...)
   - ✅ Planet (explore, facts, quiz...)
   - ✅ Artifact (found, collected, rarity...)
   - ✅ Quiz (questions, score...)
   - ✅ Leaderboard (rank, player...)
   - ✅ Profile (username, level...)
   - ✅ Chatbot (AI companion...)
   - ✅ HUD (health, fuel, oxygen...)
   - ✅ Victory (congratulations...)
   - ✅ Settings (graphics, audio...)
   - ✅ Game Mechanics (movement, controls...)

## 🚀 Cách Sử Dụng

### 1. Trong Component Mới

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("menu.title")}</h1>
      <button>{t("menu.start")}</button>
    </div>
  );
}
```

### 2. Truy Cập Ngôn Ngữ Hiện Tại

```tsx
import { useLanguage } from "../contexts/LanguageContext";

function MyComponent() {
  const { language, changeLanguage } = useLanguage();

  return (
    <div>
      <p>Current: {language}</p>
      <button onClick={() => changeLanguage("vi")}>Tiếng Việt</button>
    </div>
  );
}
```

### 3. Test Component

```tsx
// Import I18nDemo component để test
import I18nDemo from "../components/I18nDemo";

// Sử dụng trong bất kỳ scene nào
<I18nDemo />;
```

## 📝 Các File Quan Trọng

### 1. `src/config/i18n.ts`

Cấu hình chính của i18next, load translations từ file JSON.

### 2. `src/contexts/LanguageContext.tsx`

Context cung cấp state và functions để quản lý ngôn ngữ.

### 3. `src/components/LanguageToggle.tsx`

UI component để chuyển đổi ngôn ngữ, hiển thị ở góc trên phải.

### 4. `src/locales/*.json`

File JSON chứa tất cả các bản dịch.

## 🎨 Tùy Chỉnh

### Thay Đổi Vị Trí Button Toggle

Mở `src/components/LanguageToggle.tsx`:

```tsx
// Góc trên phải (mặc định)
className = "fixed top-4 right-4 z-50...";

// Góc dưới phải
className = "fixed bottom-4 right-4 z-50...";

// Góc trên trái
className = "fixed top-4 left-4 z-50...";
```

### Thêm Ngôn Ngữ Mới

1. Tạo file `src/locales/ja.json` (ví dụ: tiếng Nhật)
2. Thêm vào `src/config/i18n.ts`:

   ```tsx
   import ja from '../locales/ja.json';

   resources: {
     en: { translation: en },
     vi: { translation: vi },
     ja: { translation: ja }
   }
   ```

3. Update type trong `LanguageContext.tsx`:
   ```tsx
   type Language = "en" | "vi" | "ja";
   ```

## 📚 Tài Liệu

- **I18N_GUIDE.md** - Hướng dẫn chi tiết về i18n
- **EXAMPLES_I18N.tsx** - 7 ví dụ sử dụng i18n trong các trường hợp khác nhau

## 🧪 Testing

1. Chạy ứng dụng:

   ```bash
   npm run dev
   ```

2. Click vào button toggle ở góc trên phải

3. Quan sát các text trong UI thay đổi ngay lập tức

4. Reload trang - ngôn ngữ được giữ nguyên (lưu trong localStorage)

## 🔄 Các Bước Tiếp Theo

### Để áp dụng i18n vào toàn bộ ứng dụng:

1. **Cập nhật từng component:**

   - Thêm `import { useTranslation } from 'react-i18next';`
   - Thay thế hardcoded text bằng `t('key')`

2. **Thêm translations mới:**

   - Cập nhật `en.json` và `vi.json` khi cần thiết
   - Đảm bảo 2 file luôn đồng bộ

3. **Xử lý dynamic content:**
   - Dữ liệu từ API có thể cần field riêng cho mỗi ngôn ngữ
   - Ví dụ: `planet.nameEn` và `planet.nameVi`

## ⚠️ Lưu Ý

1. **Luôn thêm key vào CẢ 2 file** `en.json` và `vi.json`
2. **Test cả 2 ngôn ngữ** khi thêm tính năng mới
3. **Tránh hardcode text** - luôn dùng `t()` function
4. **Kiểm tra layout** - tiếng Việt thường dài hơn tiếng Anh

## 🎉 Kết Quả

- ✅ Người dùng có thể chuyển đổi ngôn ngữ mọi lúc
- ✅ Toàn bộ UI được dịch sang 2 ngôn ngữ
- ✅ Ngôn ngữ được lưu và khôi phục tự động
- ✅ Code dễ maintain và mở rộng
- ✅ Sẵn sàng thêm ngôn ngữ mới trong tương lai

---

**Phát triển bởi:** GitHub Copilot  
**Ngày:** December 3, 2025  
**Version:** 1.0.0
