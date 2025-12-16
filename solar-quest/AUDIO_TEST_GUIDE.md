# 🎵 Test Audio Files

Nếu bạn chưa có file âm thanh, có thể tạo file test tạm thời:

## Cách tạo file test nhanh

### Dùng online tool:

1. Truy cập: https://www.beepbox.co/ hoặc https://sfxr.me/
2. Tạo âm thanh đơn giản
3. Export thành .mp3
4. Đặt vào thư mục tương ứng

### Hoặc dùng file silent placeholder:

Bạn có thể tạo file .mp3 rỗng (silent) để test hệ thống không bị lỗi:

```bash
# Tạo file test bằng ffmpeg (nếu có cài)
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 1 -c:a libmp3lame public/sounds/ui/click.mp3
```

## ✅ Checklist test

- [ ] Mở browser console (F12)
- [ ] Vào MainMenu - xem có lỗi `[Audio] Failed to load: main-menu`?
- [ ] Click nút - xem có lỗi `[Audio] Failed to load: click`?
- [ ] Vào Solar System - xem có lỗi `[Audio] Failed to load: solar-system`?
- [ ] Mở Audio Settings - thử điều chỉnh volume
- [ ] Thử Mute/Unmute

## 🔍 Debug

Mở Console và chạy:

```javascript
// Test xem file có tồn tại không
fetch("/sounds/ui/click.mp3")
  .then((r) => console.log("✅ File exists:", r.status))
  .catch((e) => console.log("❌ File not found:", e));
```

Nếu thấy `404 Not Found` → File chưa được đặt vào thư mục
Nếu thấy `200 OK` → File đã có, kiểm tra volume settings
