# Hướng Dẫn Sử Dụng Đa Ngôn Ngữ (i18n)

## Tổng Quan

Dự án Solar Quest đã được tích hợp hệ thống đa ngôn ngữ sử dụng `react-i18next`, hỗ trợ chuyển đổi giữa tiếng Anh (EN) và tiếng Việt (VI).

## Cấu Trúc File

```
src/
├── config/
│   └── i18n.ts                 # Cấu hình i18next
├── contexts/
│   └── LanguageContext.tsx     # Context quản lý ngôn ngữ
├── components/
│   └── LanguageToggle.tsx      # Component chuyển đổi ngôn ngữ
└── locales/
    ├── en.json                 # Bản dịch tiếng Anh
    └── vi.json                 # Bản dịch tiếng Việt
```

## Cách Sử Dụng Trong Component

### 1. Import hook useTranslation

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

### 2. Sử dụng với biến động

```tsx
function WelcomeMessage({ username }: { username: string }) {
  const { t } = useTranslation();

  return <h1>{t("welcome", { name: username })}</h1>;
}

// Trong file JSON:
// en.json: "welcome": "Welcome, {{name}}!"
// vi.json: "welcome": "Chào mừng, {{name}}!"
```

### 3. Sử dụng với số nhiều (Pluralization)

```tsx
function ArtifactCount({ count }: { count: number }) {
  const { t } = useTranslation();

  return <p>{t("artifact.count", { count })}</p>;
}

// Trong file JSON:
// en.json:
// "artifact": {
//   "count_one": "{{count}} artifact",
//   "count_other": "{{count}} artifacts"
// }
```

### 4. Truy cập ngôn ngữ hiện tại

```tsx
import { useLanguage } from "../contexts/LanguageContext";

function MyComponent() {
  const { language, changeLanguage } = useLanguage();

  return (
    <div>
      <p>Current language: {language}</p>
      <button onClick={() => changeLanguage("vi")}>Tiếng Việt</button>
      <button onClick={() => changeLanguage("en")}>English</button>
    </div>
  );
}
```

## Thêm Bản Dịch Mới

### 1. Thêm vào file JSON

Mở `src/locales/en.json` và `src/locales/vi.json`, thêm key mới:

```json
// en.json
{
  "newSection": {
    "title": "New Section",
    "description": "This is a new section"
  }
}

// vi.json
{
  "newSection": {
    "title": "Phần Mới",
    "description": "Đây là phần mới"
  }
}
```

### 2. Sử dụng trong component

```tsx
function NewSection() {
  const { t } = useTranslation();

  return (
    <div>
      <h2>{t("newSection.title")}</h2>
      <p>{t("newSection.description")}</p>
    </div>
  );
}
```

## Các Key Translation Có Sẵn

### Common

- `common.loading` - "Loading..." / "Đang tải..."
- `common.error` - "Error" / "Lỗi"
- `common.save` - "Save" / "Lưu"

### Menu

- `menu.title` - "Solar Quest" / "Hành Trình Mặt Trời"
- `menu.start` - "Start Journey" / "Bắt Đầu Hành Trình"
- `menu.collection` - "My Collection" / "Bộ Sưu Tập"

### Auth

- `auth.login` - "Login" / "Đăng Nhập"
- `auth.register` - "Register" / "Đăng Ký"
- `auth.email` - "Email" / "Email"

### Planet

- `planet.explore` - "Explore" / "Khám Phá"
- `planet.facts` - "Interesting Facts" / "Sự Thật Thú Vị"
- `planet.quiz` - "Take Quiz" / "Làm Câu Đố"

### Artifact

- `artifact.found` - "Artifact Found!" / "Tìm Thấy Hiện Vật!"
- `artifact.collected` - "Collected" / "Đã Thu Thập"
- `artifact.rarity` - "Rarity" / "Độ Hiếm"

### Quiz

- `quiz.title` - "Planet Quiz" / "Câu Đố Hành Tinh"
- `quiz.correct` - "Correct!" / "Đúng!"
- `quiz.score` - "Score" / "Điểm"

### Profile

- `profile.title` - "Profile" / "Hồ Sơ"
- `profile.username` - "Username" / "Tên Người Dùng"
- `profile.level` - "Level" / "Cấp Độ"

### Settings

- `settings.title` - "Settings" / "Cài Đặt"
- `settings.graphics` - "Graphics" / "Đồ Họa"
- `settings.language` - "Language" / "Ngôn Ngữ"

## Ví Dụ Component Hoàn Chỉnh

```tsx
import React from "react";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../contexts/LanguageContext";

const ExampleComponent: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguage();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">{t("menu.title")}</h1>

      <p className="text-gray-600 mb-2">{t("common.loading")}</p>

      <button className="bg-blue-500 text-white px-4 py-2 rounded">
        {t("menu.start")}
      </button>

      <div className="mt-4">
        <p>Current language: {language}</p>
      </div>
    </div>
  );
};

export default ExampleComponent;
```

## Component LanguageToggle

Component `LanguageToggle` đã được thêm vào ứng dụng và hiển thị ở góc trên bên phải màn hình. Người dùng có thể click vào để chuyển đổi giữa tiếng Anh và tiếng Việt.

### Tùy chỉnh vị trí LanguageToggle

Mở file `src/components/LanguageToggle.tsx` và thay đổi class CSS:

```tsx
// Thay đổi vị trí
className = "fixed top-4 right-4 z-50..."; // Góc trên phải
className = "fixed bottom-4 right-4 z-50..."; // Góc dưới phải
className = "fixed top-4 left-4 z-50..."; // Góc trên trái
```

## Lưu Trữ Ngôn Ngữ

Ngôn ngữ được chọn sẽ tự động lưu vào `localStorage` và được khôi phục khi người dùng quay lại trang web.

## Best Practices

1. **Sử dụng key có cấu trúc rõ ràng**: `section.subsection.key`
2. **Giữ bản dịch đồng bộ**: Luôn thêm key vào cả 2 file `en.json` và `vi.json`
3. **Tránh hardcode text**: Luôn sử dụng `t()` function thay vì viết text trực tiếp
4. **Test cả 2 ngôn ngữ**: Kiểm tra hiển thị trên cả tiếng Anh và tiếng Việt
5. **Sử dụng namespace**: Cho các phần lớn của ứng dụng

## Troubleshooting

### Translation không hiển thị

1. Kiểm tra key có tồn tại trong file JSON
2. Kiểm tra import `i18n.ts` trong `index.tsx`
3. Kiểm tra `LanguageProvider` đã wrap ứng dụng

### Ngôn ngữ không thay đổi

1. Kiểm tra localStorage có lưu được không
2. Clear cache và reload trang
3. Kiểm tra console có lỗi không

## Mở Rộng

### Thêm ngôn ngữ mới (ví dụ: tiếng Nhật)

1. Tạo file `src/locales/ja.json`
2. Thêm vào config trong `src/config/i18n.ts`:

```tsx
import ja from "../locales/ja.json";

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    vi: { translation: vi },
    ja: { translation: ja }, // Thêm dòng này
  },
  // ...
});
```

3. Cập nhật type trong `LanguageContext.tsx`:

```tsx
type Language = "en" | "vi" | "ja";
```

---

Chúc bạn phát triển thành công! 🚀
