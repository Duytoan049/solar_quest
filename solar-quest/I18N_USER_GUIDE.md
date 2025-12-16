# 🌍 Hướng Dẫn Sử Dụng Đa Ngôn Ngữ - Solar Quest

## ✅ Đã Hoàn Thành

Hệ thống đa ngôn ngữ (i18n) đã được tích hợp thành công vào dự án với các tính năng:

- ✅ **Hỗ trợ 2 ngôn ngữ**: Tiếng Anh 🇬🇧 và Tiếng Việt 🇻🇳
- ✅ **Language Toggle Button**: Chuyển đổi ngôn ngữ dễ dàng
- ✅ **Tích hợp vào UI chính**: MainMenu, AuthPage, ProfileCreation
- ✅ **160+ translation keys**: Đầy đủ cho toàn bộ ứng dụng

## 🎮 Cách Sử Dụng

### Đối với Người Dùng

1. **Chuyển đổi ngôn ngữ**: Nhấn vào nút 🌍 ở góc trên bên phải màn hình
2. **Chọn ngôn ngữ**: 🇬🇧 EN hoặc 🇻🇳 VI
3. **Tất cả text sẽ tự động thay đổi** theo ngôn ngữ đã chọn

### Đối với Developer

#### 1. Sử dụng trong Component

```tsx
import { useTranslation } from "react-i18next";

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t("menu.title")}</h1>
      <button>{t("common.save")}</button>
    </div>
  );
}
```

#### 2. Translation với Biến Động

```tsx
// Trong translation file:
// "subtitle": "Create your character on {{planetName}}"

<p>{t("profileCreation.subtitle", { planetName: "Mars" })}</p>
// Output: "Create your character on Mars" (EN)
// Output: "Tạo nhân vật của bạn trên Mars" (VI)
```

#### 3. Thêm Translation Key Mới

**Bước 1**: Thêm vào `src/locales/en.json`

```json
{
  "mySection": {
    "title": "My Title",
    "description": "My Description"
  }
}
```

**Bước 2**: Thêm vào `src/locales/vi.json`

```json
{
  "mySection": {
    "title": "Tiêu Đề Của Tôi",
    "description": "Mô Tả Của Tôi"
  }
}
```

**Bước 3**: Sử dụng trong component

```tsx
const { t } = useTranslation();
<h1>{t("mySection.title")}</h1>;
```

## 📁 Cấu Trúc File

```
src/
├── config/
│   └── i18n.ts                 # Cấu hình i18next
├── locales/
│   ├── en.json                 # Translation tiếng Anh
│   └── vi.json                 # Translation tiếng Việt
├── contexts/
│   └── LanguageContext.tsx     # Context quản lý ngôn ngữ
└── components/
    └── LanguageToggle.tsx      # Button chuyển đổi ngôn ngữ
```

## 🔑 Translation Keys Có Sẵn

### Common

- `common.loading` - "Loading..." / "Đang tải..."
- `common.error` - "Error" / "Lỗi"
- `common.save` - "Save" / "Lưu"
- `common.cancel` - "Cancel" / "Hủy"

### Menu

- `menu.title` - "Solar Quest" / "Hành Trình Mặt Trời"
- `menu.start` - "Start Journey" / "Bắt Đầu Hành Trình"
- `menu.leaderboard` - "Leaderboard" / "Bảng Xếp Hạng"

### Auth

- `auth.login` - "Login" / "Đăng Nhập"
- `auth.register` - "Register" / "Đăng Ký"
- `auth.email` - "Email" / "Email"
- `auth.password` - "Password" / "Mật Khẩu"

### Main Menu

- `mainMenu.title` - "SOLAR QUEST" / "HÀNH TRÌNH MẶT TRỜI"
- `mainMenu.welcome1` - Thông điệp chào mừng
- `mainMenu.startExplore` - "Start Explore" / "Bắt Đầu Khám Phá"

### Profile Creation

- `profileCreation.title` - "Create Citizen Profile" / "Tạo Profile Công Dân"
- `profileCreation.chooseRole` - "Choose your role" / "Chọn vai trò của bạn"
- `profileCreation.scientist` - "Scientist" / "Nhà Khoa Học"
- `profileCreation.explorer` - "Explorer" / "Nhà Thám Hiểm"

**Xem file đầy đủ tại**: `src/locales/en.json` và `src/locales/vi.json`

## 🧪 Test I18n

Để test tất cả translation keys, sử dụng component test:

```tsx
import I18nTestPage from "@/components/I18nTestPage";

// Hiển thị tất cả translation keys trong 1 trang
<I18nTestPage />;
```

## 🎨 UI Components

### LanguageToggle

```tsx
import LanguageToggle from "@/components/LanguageToggle";

function MyPage() {
  return (
    <div>
      <LanguageToggle />
      {/* Nút toggle sẽ hiển thị ở góc trên phải */}
    </div>
  );
}
```

**Đặc điểm**:

- Fixed position ở góc trên phải
- Z-index 50 (luôn hiển thị trên cùng)
- Icon Globe với animation
- Hiển thị cờ quốc gia (🇬🇧 / 🇻🇳)

## 📊 Component Đã Được I18n

✅ **MainMenu** - Menu chính  
✅ **AuthPage** - Trang đăng nhập/đăng ký  
✅ **ProfileCreation** - Tạo profile người dùng  
✅ **LanguageToggle** - Nút chuyển đổi ngôn ngữ

## 🚀 Next Steps (Tùy chọn)

Nếu muốn mở rộng, bạn có thể cập nhật thêm:

1. VictorySequence - Màn hình chiến thắng
2. ChatbotPanel - Panel chat với AI
3. GameMechanicsInfo - Hướng dẫn game
4. LeaderboardPage - Bảng xếp hạng
5. UserProfilePage - Trang profile
6. AICompanion - AI companion
7. geminiChatbot.ts - Suggested questions

## 💡 Tips

1. **Luôn dùng translation keys** thay vì hardcoded text
2. **Test cả 2 ngôn ngữ** trước khi commit
3. **Giữ keys nhất quán** giữa en.json và vi.json
4. **Sử dụng nested keys** để tổ chức tốt hơn

## ❓ FAQ

**Q: Làm sao để thay đổi ngôn ngữ mặc định?**  
A: Sửa file `src/config/i18n.ts`, thay `lng: 'en'` thành `lng: 'vi'`

**Q: Làm sao để thêm ngôn ngữ thứ 3?**  
A:

1. Tạo file `src/locales/fr.json` (ví dụ tiếng Pháp)
2. Thêm vào `i18n.ts`: `fr: { translation: fr }`
3. Cập nhật LanguageToggle để hỗ trợ thêm option

**Q: Translation keys không hiển thị?**  
A: Kiểm tra:

1. Key có tồn tại trong cả en.json và vi.json không?
2. Component đã import `useTranslation` chưa?
3. App đã được wrap trong `I18nextProvider` chưa?

## 📞 Support

Nếu có vấn đề, kiểm tra:

- File cấu hình: `src/config/i18n.ts`
- Translation files: `src/locales/*.json`
- Context: `src/contexts/LanguageContext.tsx`

---

**Version**: 1.0  
**Last Updated**: December 4, 2025  
**Status**: ✅ Production Ready
