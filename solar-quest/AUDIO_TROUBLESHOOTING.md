# 🔧 Hướng dẫn khắc phục âm thanh không phát

## ❗ Nguyên nhân

Âm thanh không phát vì **file âm thanh chưa được đặt vào thư mục đúng**.

## ✅ Giải pháp

### Bước 1: Tạo cấu trúc thư mục

Mở terminal và chạy lệnh sau:

```bash
# Windows (CMD)
mkdir public\sounds\effects
mkdir public\sounds\ui
mkdir public\sounds\achievements
mkdir public\sounds\music

# Windows (PowerShell)
New-Item -ItemType Directory -Path "public\sounds\effects"
New-Item -ItemType Directory -Path "public\sounds\ui"
New-Item -ItemType Directory -Path "public\sounds\achievements"
New-Item -ItemType Directory -Path "public\sounds\music"
```

### Bước 2: Đặt file âm thanh vào đúng thư mục

Đặt các file bạn đã tải vào các thư mục tương ứng:

#### 📁 `public/sounds/effects/` (6 files)

- shoot.mp3
- hit.mp3
- explosion.mp3
- powerup.mp3
- shield.mp3
- warning.mp3

#### 📁 `public/sounds/ui/` (8 files)

- click.mp3
- hover.mp3
- success.mp3
- error.mp3
- collect.mp3
- notification.mp3
- transition.mp3
- whoosh.mp3

#### 📁 `public/sounds/achievements/` (3 files)

- badge-unlock.mp3
- level-up.mp3
- fanfare.mp3

#### 📁 `public/sounds/music/` (11 files)

- mercury_theme.mp3
- venus_theme.mp3
- earth_theme.mp3
- mars_theme.mp3
- jupiter_theme.mp3
- saturn_theme.mp3
- uranus_theme.mp3
- neptune_theme.mp3
- main-menu.mp3
- solar-system.mp3
- victory-theme.mp3

### Bước 3: Kiểm tra

Sau khi đặt file xong, mở trình duyệt và kiểm tra Console (F12):

1. **Nếu thấy lỗi 404**: File chưa được đặt đúng đường dẫn
2. **Nếu thấy warning**: File tồn tại nhưng có lỗi format
3. **Không có lỗi**: Âm thanh đã hoạt động! 🎉

### Bước 4: Test âm thanh

- **MainMenu**: Bật ngay khi vào menu (main-menu.mp3)
- **Solar System**: Phát khi vào màn hình chọn hành tinh (solar-system.mp3)
- **Click nút**: Tiếng click mỗi khi nhấn nút (click.mp3)
- **Planet Detail**: Theme riêng cho từng hành tinh

## 🎚️ Điều chỉnh âm lượng

Nhấn vào **icon loa** ở góc dưới bên trái để:

- Chỉnh Master Volume
- Chỉnh Music Volume
- Chỉnh SFX Volume
- Bật/Tắt Mute

## 🚨 Lỗi thường gặp

### 1. Không nghe thấy âm thanh

**Nguyên nhân**: File chưa được đặt vào thư mục
**Giải pháp**: Kiểm tra lại đường dẫn file

### 2. Âm thanh phát nhưng không rõ

**Nguyên nhân**: Volume quá nhỏ
**Giải pháp**: Tăng volume trong Audio Settings

### 3. Chỉ có music không có sound effects

**Nguyên nhân**: SFX Volume = 0
**Giải pháp**: Tăng SFX Volume lên

### 4. Console báo lỗi 404

**Nguyên nhân**: Tên file không đúng hoặc sai thư mục
**Giải pháp**: Kiểm tra lại tên file (phải đúng chính xác, lowercase)

## 📝 Lưu ý quan trọng

1. **Tên file phải đúng chính xác** (viết thường, không dấu cách)
2. **Định dạng file**: Nên dùng .mp3 (tương thích tốt nhất)
3. **Kích thước**: Nên dưới 2MB mỗi file để load nhanh
4. **Thư mục**: Phải đặt trong `public/sounds/` (không phải `src/`)

## ✅ Đã sửa

- ✅ Thêm âm thanh vào **MainMenu** (main-menu.mp3)
- ✅ Thêm âm thanh vào **Solar System** (solar-system.mp3)
- ✅ Thêm click sound cho tất cả buttons
- ✅ Thêm AudioSettings panel
- ✅ Xử lý graceful fallback (không crash nếu thiếu file)

## 🎵 Danh sách âm thanh đã tích hợp

### MainMenu

- Music: `main-menu.mp3` (loop)
- Button clicks: `click.mp3`

### Solar System (PlanetScene)

- Music: `solar-system.mp3` (loop)
- Planet selection: `click.mp3`
- Start mission: `transition.mp3`

### Planet Detail

- Music: `{planet}_theme.mp3` (ví dụ: mars_theme.mp3)
- Artifact collect: `collect.mp3`

### Victory Screen

- Fanfare: `fanfare.mp3`
- Music: `victory-theme.mp3`

### Quiz

- Correct answer: `success.mp3`
- Wrong answer: `error.mp3`

### Warp Screen

- Transition effect: `whoosh.mp3`
- Music: `solar-system.mp3`

Bây giờ chỉ cần đặt file âm thanh vào đúng thư mục là có thể nghe được! 🚀
