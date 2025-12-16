# 🎵 Audio System - Solar Quest

Hệ thống âm thanh đã được triển khai đầy đủ với 36 file âm thanh.

## 📁 Cấu trúc thư mục

Bạn cần tạo các thư mục sau trong `public/sounds/`:

```
public/sounds/
├── effects/        (6 files - Game sound effects)
├── ui/            (8 files - UI interaction sounds)
├── achievements/  (3 files - Achievement unlocks)
└── music/         (11 files - Background music)
```

## 📋 Danh sách file cần tải

### 1️⃣ EFFECTS (public/sounds/effects/)

- ✅ `shoot.mp3` - Tiếng bắn laser
- ✅ `hit.mp3` - Tiếng đạn trúng asteroid
- ✅ `explosion.mp3` - Tiếng asteroid phát nổ
- ✅ `powerup.mp3` - Nhặt vật phẩm tăng sức mạnh
- ✅ `shield.mp3` - Kích hoạt khiên
- ✅ `warning.mp3` - Cảnh báo nguy hiểm

### 2️⃣ UI SOUNDS (public/sounds/ui/)

- ✅ `click.mp3` - Click nút bấm
- ✅ `hover.mp3` - Di chuột qua nút
- ✅ `success.mp3` - Hoàn thành nhiệm vụ
- ✅ `error.mp3` - Thao tác sai
- ✅ `collect.mp3` - Thu thập artifact
- ✅ `notification.mp3` - Thông báo mới
- ✅ `transition.mp3` - Chuyển scene
- ✅ `whoosh.mp3` - Hiệu ứng di chuyển nhanh

### 3️⃣ ACHIEVEMENTS (public/sounds/achievements/)

- ✅ `badge-unlock.mp3` - Mở khóa huy hiệu
- ✅ `level-up.mp3` - Lên cấp/Tier
- ✅ `fanfare.mp3` - Hoàn thành 100%

### 4️⃣ MUSIC (public/sounds/music/)

**Planet Themes:**

- ✅ `mercury_theme.mp3`
- ✅ `venus_theme.mp3`
- ✅ `earth_theme.mp3`
- ✅ `mars_theme.mp3`
- ✅ `jupiter_theme.mp3`
- ✅ `saturn_theme.mp3`
- ✅ `uranus_theme.mp3`
- ✅ `neptune_theme.mp3`

**Menu Music:**

- ✅ `main-menu.mp3`
- ✅ `solar-system.mp3`
- ✅ `victory-theme.mp3`

## 🔍 Hướng dẫn tìm file

### Nguồn tải miễn phí:

1. **Freesound.org** - Âm thanh CC License
2. **OpenGameArt.org** - Tài nguyên game miễn phí
3. **Incompetech.com** - Nhạc nền (Kevin MacLeod)
4. **ZapSplat.com** - Sound effects (cần đăng ký)

### Keywords tìm kiếm (xem file AUDIO_KEYWORDS.md để biết chi tiết)

## ✅ Tính năng đã implement

### 🎮 Core Audio System

- ✅ `useAudio` hook - Quản lý âm thanh toàn cục
- ✅ Volume controls (Master, Music, SFX)
- ✅ Mute/Unmute
- ✅ Fade in/out cho music
- ✅ Error handling graceful (không crash nếu file thiếu)
- ✅ localStorage persistence

### 🎵 Tích hợp vào Components

- ✅ **MainMenu**: Menu music + UI click sounds
- ✅ **WarpScreen**: Whoosh sound + Solar System theme
- ✅ **PlanetDetail**: Planet themes + collect sound
- ✅ **VictorySequence**: Victory fanfare + theme music
- ✅ **QuizPanel**: Success/Error sounds cho câu trả lời
- ✅ **AudioSettings**: Panel điều chỉnh âm lượng

### 🎚️ Audio Settings Panel

- ✅ Master Volume slider
- ✅ Music Volume slider
- ✅ SFX Volume slider
- ✅ Mute All button
- ✅ Floating panel (bottom-left)
- ✅ Hiển thị ở MainMenu và PlanetDetail

## 📝 Cách sử dụng

### Trong component:

```tsx
import { useAudio } from "@/hooks/useAudio";

function MyComponent() {
  const { play, playMusic, stopMusic } = useAudio();

  // Play sound effect
  play("click", { volume: 0.7, category: "ui" });

  // Play background music
  playMusic("mars_theme", true); // true = fade in

  // Stop music
  stopMusic(true); // true = fade out
}
```

### Sound categories:

- `music` - Nhạc nền (áp dụng Music Volume)
- `sfx` - Game effects (áp dụng SFX Volume)
- `ui` - UI sounds (áp dụng SFX Volume)
- `achievement` - Achievement sounds (áp dụng SFX Volume)

## 🔧 Xử lý lỗi

Hệ thống tự động xử lý:

- ❌ File không tồn tại → Console warning, không phát âm thanh
- ❌ File tải lỗi → Console error, xóa khỏi cache
- ❌ Playback failed → Console warning, không crash app
- ✅ Graceful degradation - App vẫn chạy bình thường nếu thiếu audio

## 🚀 Tối ưu

- ✅ Audio caching - Load 1 lần, tái sử dụng
- ✅ Fade in/out smooth (2 giây fade in, 1 giây fade out)
- ✅ Volume được lưu trong localStorage
- ✅ Chỉ load file khi cần (lazy loading)
- ✅ Cleanup khi component unmount

## 📊 Trạng thái

**Đã tải:** Phần 1-5 (27 files)

- ✅ Effects (6 files)
- ✅ UI Sounds (8 files)
- ✅ Achievements (3 files)
- ✅ Planet Themes (8 files)
- ✅ Menu Music (3 files - bao gồm victory-theme)

**Chưa tải:** Phần 6 (8 files) - KHÔNG SỬ DỤNG

- ❌ Ambient sounds (đã bỏ qua theo yêu cầu)

## 🎉 Kết quả

Hệ thống âm thanh hoàn chỉnh cho Solar Quest:

- 🎮 Game effects phản hồi hành động người chơi
- 🖱️ UI sounds cho mọi tương tác
- 🏆 Achievement sounds khi mở khóa badge
- 🎵 Background music cho từng hành tinh
- 🎚️ Điều chỉnh âm lượng linh hoạt
- 🔇 Mute/Unmute nhanh chóng

Tất cả đã được tích hợp và sẵn sàng sử dụng! 🚀
