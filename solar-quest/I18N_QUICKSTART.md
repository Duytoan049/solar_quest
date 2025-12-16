# 🌍 Quick Start - Đa Ngôn Ngữ

## Đã Tích Hợp ✅

Trang web Solar Quest giờ đã hỗ trợ **chuyển đổi giữa tiếng Anh 🇬🇧 và tiếng Việt 🇻🇳**!

## Sử Dụng Ngay

### 1. Người Dùng

- Tìm button **toggle ngôn ngữ** ở **góc trên phải** màn hình
- Click để chuyển đổi giữa EN và VI
- Ngôn ngữ được lưu tự động!

### 2. Developer - Sử Dụng trong Code

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();

  return <button>{t("menu.start")}</button>;
}
```

## Files Đã Tạo

```
✅ src/config/i18n.ts                 - Cấu hình
✅ src/contexts/LanguageContext.tsx   - Context
✅ src/components/LanguageToggle.tsx  - UI Toggle
✅ src/locales/en.json                - Tiếng Anh
✅ src/locales/vi.json                - Tiếng Việt
✅ src/components/I18nDemo.tsx        - Demo component
```

## Translations Có Sẵn (300+ keys)

- Common, Menu, Auth
- Planet, Artifact, Quiz
- Profile, Leaderboard, Settings
- HUD, Victory, Chatbot
- Game Mechanics

## Xem Thêm

- **I18N_IMPLEMENTATION.md** - Tài liệu đầy đủ
- **I18N_GUIDE.md** - Hướng dẫn sử dụng
- **EXAMPLES_I18N.tsx** - Ví dụ code

---

🚀 **Ready to use!** Chạy `npm run dev` và test ngay!
