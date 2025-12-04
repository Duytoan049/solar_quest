# 🌍 Hướng dẫn Dịch Tự Động từ NASA API

## Tính năng mới: Cache + Gemini AI Translation

Hệ thống giờ đã tự động dịch **mô tả hành tinh từ NASA API** sang tiếng Việt bằng AI!

---

## 🚀 Cách hoạt động

### 1. **Lần đầu truy cập (Dịch mới)**

```
Người dùng chọn Sao Hỏa → Đổi sang tiếng Việt
↓
Hệ thống kiểm tra cache → Không có
↓
Gọi Gemini AI để dịch description từ NASA
↓
Lưu vào localStorage cache
↓
Hiển thị bản dịch tiếng Việt
```

**Console log:**

```
🔄 Translating with Gemini: Mars is the fourth planet from...
```

### 2. **Lần sau (Lấy từ cache - tức thì)**

```
Người dùng quay lại Sao Hỏa → Tiếng Việt
↓
Hệ thống kiểm tra cache → Có rồi!
↓
Hiển thị ngay lập tức (không cần gọi API)
```

**Console log:**

```
✅ Using cached translation for: Mars is the fourth planet from...
```

---

## 📂 Các file đã thêm

### 1. **src/services/geminiTranslator.ts**

- Dịch text bằng Gemini AI
- Prompt được tối ưu cho học sinh
- Tự động loại bỏ markdown formatting

### 2. **src/services/cachedTranslation.ts**

- Lưu trữ bản dịch trong localStorage
- Cache valid trong 30 ngày
- Tự động xóa cache cũ

### 3. **PlanetDetail.tsx (đã cập nhật)**

- Thêm state `translatedDescription`
- Tự động dịch khi đổi ngôn ngữ
- Hiển thị loading indicator khi đang dịch

---

## 🎯 Ưu điểm

| Tính năng          | Mô tả                               |
| ------------------ | ----------------------------------- |
| **Miễn phí**       | Dùng Gemini API (60 requests/phút)  |
| **Nhanh**          | Lần 2 trở đi load tức thì từ cache  |
| **Chất lượng cao** | AI context-aware, phù hợp học sinh  |
| **Tự động**        | Không cần maintain translation keys |
| **Tiết kiệm**      | Cache 30 ngày, ít phải dịch lại     |

---

## 📊 So sánh: Trước vs Sau

### ❌ **Trước (Static translation)**

```tsx
// Phải viết sẵn trong vi.json
"planets": {
  "mars": {
    "description": "Hành tinh đỏ, có thể là tương lai của nhân loại."
  }
}

// Code
{t(`planets.${planetId}.description`)} // Luôn hiển thị văn bản cố định
```

**Vấn đề:**

- Nội dung ngắn gọn, thiếu chi tiết
- Không cập nhật khi NASA có thông tin mới
- Phải maintain 2 bản EN + VI

---

### ✅ **Sau (Dynamic translation)**

```tsx
// NASA API trả về (full detail)
planetInfo.description = "Mars is the fourth planet from the Sun,
known as the Red Planet due to iron oxide on its surface. It has
the largest volcano and canyon in the solar system."

// Gemini AI dịch tự động
translatedDescription = "Sao Hỏa là hành tinh thứ tư từ Mặt Trời,
được biết đến là Hành Tinh Đỏ do oxide sắt trên bề mặt. Nó có
núi lửa lớn nhất và hẻm núi lớn nhất trong hệ mặt trời."

// Hiển thị
{translatedDescription} // Hiển thị bản dịch AI chất lượng cao
```

**Ưu điểm:**

- ✅ Nội dung đầy đủ, chi tiết từ NASA
- ✅ Tự động cập nhật khi NASA thay đổi
- ✅ Dịch tự nhiên, phù hợp ngữ cảnh

---

## 🧪 Cách test

### 1. **Test lần đầu (Translation mới)**

```
1. Mở DevTools Console (F12)
2. Xóa localStorage: localStorage.clear()
3. Vào trang chi tiết Sao Hỏa
4. Đổi sang tiếng Việt (🇻🇳 VI)
5. Xem console log: "🔄 Translating with Gemini..."
6. Đợi 1-2 giây → Hiển thị bản dịch
```

### 2. **Test cache (Lần 2)**

```
1. Reload trang (F5)
2. Vào lại Sao Hỏa
3. Đổi sang tiếng Việt
4. Xem console log: "✅ Using cached translation..."
5. Hiển thị ngay lập tức (không đợi)
```

### 3. **Test nhiều hành tinh**

```
Mars → Venus → Earth → Jupiter
- Mỗi hành tinh dịch 1 lần
- Lần sau lấy từ cache
- Cache riêng cho từng description
```

---

## 🔧 Cấu hình

### Cache Duration (Thời gian lưu cache)

```typescript
// src/services/cachedTranslation.ts
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 ngày

// Đổi thành 7 ngày:
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000;
```

### Translation Prompt (Tùy chỉnh cách dịch)

```typescript
// src/services/geminiTranslator.ts
const prompt = targetLang === 'vi'
  ? `Dịch đoạn văn khoa học sau sang tiếng Việt tự nhiên,
     dễ hiểu cho học sinh. Giữ nguyên các thuật ngữ khoa học...`
```

---

## 🧹 Quản lý Cache

### Xóa cache cũ (tự động)

```typescript
// Chạy tự động khi vào PlanetDetail
clearOldCache(); // Xóa cache > 30 ngày
```

### Xóa toàn bộ cache (manual)

```typescript
import { clearAllCache } from "@/services/cachedTranslation";

clearAllCache(); // Xóa tất cả translation cache
```

### Kiểm tra cache trong DevTools

```javascript
// Console
JSON.parse(localStorage.getItem('nasa_translations_v1'))

// Output:
{
  "TWFycyBpcyB0aGUgZm91cnRoIHBsYW5ldCBmcm9tIHRo_123": {
    "vi": "Sao Hỏa là hành tinh thứ tư...",
    "timestamp": 1733328000000
  }
}
```

---

## 🎨 UI States

### 1. **Loading (Đang dịch)**

```tsx
<span className="flex items-center gap-2 text-gray-500">
  <Loader2 className="w-3 h-3 animate-spin" />
  Đang tải...
</span>
```

### 2. **Translated (Đã dịch)**

```tsx
<p className="text-gray-300 text-xs mb-2 leading-relaxed">
  {translatedDescription}
</p>
```

### 3. **Fallback (Lỗi dịch)**

```tsx
// Nếu Gemini API lỗi, hiển thị bản gốc tiếng Anh
{
  planetInfo.description;
}
```

---

## 📈 Performance

| Metric          | Giá trị              |
| --------------- | -------------------- |
| **First load**  | ~1-2s (dịch mới)     |
| **Cached load** | <50ms (tức thì)      |
| **Cache size**  | ~2-5KB/planet        |
| **Total cache** | ~50KB (10 planets)   |
| **API calls**   | 10 lần đầu, sau đó 0 |

---

## 🐛 Troubleshooting

### Vấn đề: Không dịch được

```
✅ Check 1: VITE_GEMINI_API_KEY có trong .env không?
✅ Check 2: Internet connection ổn định?
✅ Check 3: Console có lỗi không?
```

### Vấn đề: Dịch sai

```
→ Sửa prompt trong geminiTranslator.ts
→ Xóa cache cũ: clearAllCache()
→ Refresh trang để dịch lại
```

### Vấn đề: Cache không hoạt động

```
→ Check localStorage không bị disable
→ Check browser không ở chế độ Incognito
→ Xem console log có "✅ Using cached" không
```

---

## 🚀 Next Steps (Tùy chọn)

### 1. **Dịch thêm các field khác**

```typescript
// Stats atmosphere
if (planetInfo.stats.atmosphere && currentLanguage === "vi") {
  const translatedAtmosphere = await getCachedTranslation(
    planetInfo.stats.atmosphere,
    "vi"
  );
}
```

### 2. **Dịch marker descriptions**

```typescript
const translatedMarkerDesc = await getCachedTranslation(
  marker.description,
  "vi"
);
```

### 3. **Batch translation (Tối ưu)**

```typescript
// Dịch nhiều texts cùng lúc
const translations = await Promise.all([
  getCachedTranslation(description, "vi"),
  getCachedTranslation(atmosphere, "vi"),
  getCachedTranslation(history, "vi"),
]);
```

---

## 📝 Summary

✅ **Đã implement:**

- Gemini AI translator service
- LocalStorage caching system
- Auto-translate description từ NASA API
- Loading states và error handling
- Auto cleanup old cache

✅ **Kết quả:**

- Miễn phí hoàn toàn
- Tự động dịch description từ NASA
- Cache 30 ngày, load tức thì
- Chất lượng dịch cao (AI context-aware)

🎉 **Giờ người dùng có thể thấy mô tả đầy đủ từ NASA bằng tiếng Việt!**
