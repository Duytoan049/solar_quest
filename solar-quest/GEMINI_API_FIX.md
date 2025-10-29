# 🔧 FIX LỖI GEMINI API - HƯỚNG DẪN CHI TIẾT

## ❌ VẤN ĐỀ

```
[GoogleGenerativeAI Error]: Error fetching from https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent: [404 Not Found]
```

## 🔍 NGUYÊN NHÂN

API key `AIzaSyD7eqXdSeJvQEj6dJ4nJnnjxy2-I3IWw4o` **KHÔNG HỢP LỆ** hoặc **HẾT HẠN**.

Test tất cả models đều bị lỗi 404 → API key cần thay thế.

## ✅ GIẢI PHÁP

### Bước 1: Lấy API Key mới (MIỄN PHÍ)

1. **Truy cập Google AI Studio:**

   ```
   https://aistudio.google.com/app/apikey
   ```

2. **Đăng nhập Google Account** (bất kỳ Gmail nào)

3. **Click "Create API Key"**

   - Nếu chưa có project → Click "Create API key in new project"
   - Nếu đã có project → Chọn project và click "Create API key"

4. **Copy API key mới**
   - Format: `AIzaSy...` (khoảng 39 ký tự)
   - LƯU Ý: Chỉ hiển thị 1 lần, copy ngay!

### Bước 2: Cập nhật file `.env`

Mở file `.env` trong thư mục gốc project và thay thế:

```properties
VITE_GEMINI_API_KEY=<YOUR_NEW_API_KEY_HERE>
```

Ví dụ:

```properties
VITE_GEMINI_API_KEY=AIzaSyABCDEF123456789...
```

### Bước 3: Restart Dev Server

1. **Stop dev server** (Ctrl+C trong terminal)
2. **Start lại:**
   ```bash
   npm run dev
   ```

### Bước 4: Test lại

1. Vào **PlanetDetail** (bất kỳ planet nào)
2. Click **nút chat** góc dưới phải
3. Gửi tin nhắn test: "Xin chào"
4. AI sẽ trả lời ngay! ✅

## 🎯 GIỚI HẠN MIỄN PHÍ

- ✅ **60 requests/phút** (rất đủ cho chatbot)
- ✅ **1500 requests/ngày**
- ✅ **1,000,000 tokens/tháng**
- ✅ **Không cần thẻ tín dụng**

## 🚨 NẾU VẪN LỖI

### Lỗi 429 (Rate Limit):

```
Đã vượt quá giới hạn API
```

→ Đợi 1 phút và thử lại

### Lỗi 400 (Bad Request):

```
Invalid API key
```

→ Kiểm tra lại API key có copy đầy đủ không

### Lỗi 403 (Forbidden):

```
API key not valid
```

→ Tạo lại API key mới

## 🔗 LINKS HỮU ÍCH

- **Tạo API Key:** https://aistudio.google.com/app/apikey
- **Gemini Docs:** https://ai.google.dev/gemini-api/docs
- **Model List:** https://ai.google.dev/gemini-api/docs/models/gemini

## 💡 LƯU Ý

- API key là **MIỄN PHÍ** và **KHÔNG HẾT HẠN** (trừ khi bạn xóa)
- Có thể tạo **nhiều API keys** cho nhiều projects
- **KHÔNG share** API key công khai (Git, Discord, ...)
- Nếu lộ key → Vào AI Studio và **Revoke** key cũ, tạo key mới
