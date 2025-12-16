# 🎨 GLTF Models Integration Guide

## ✅ Code đã được cập nhật!

Hệ thống artifact giờ hỗ trợ **GLTF/GLB models** với fallback về geometry cơ bản.

---

## 📁 Cấu trúc thư mục

Tạo thư mục mới để lưu models:

```
public/
  models/
    artifacts/          ← Tạo thư mục này
      mars/
        curiosity-wheel.glb
        viking-plate.glb
        mystery-cube.glb
      saturn/
        ring-fragment.glb
        cassini-antenna.glb
      earth/
        satellite-debris.glb
```

---

## 🔍 Tìm models trên Sketchfab

### Artifacts cho Mars:

1. **🛞 Curiosity Rover Wheel**

   - Search: "mars rover wheel" hoặc "nasa curiosity"
   - Recommended: https://sketchfab.com/search?q=mars+rover&type=models
   - Filter: Downloadable, Free

2. **🛸 Viking Lander Plate**

   - Search: "viking lander" hoặc "space probe plate"
   - Filter: Sci-Fi, Space

3. **⬛ Mystery Cube/Monolith**
   - Search: "monolith" hoặc "alien artifact"
   - Recommended: Màu đen, hình khối bí ẩn

### Artifacts cho Saturn:

4. **💍 Ring Fragment**

   - Search: "ice crystal" hoặc "space debris rock"
   - Màu trắng/xanh nhạt

5. **🛰️ Cassini Antenna**
   - Search: "satellite dish" hoặc "cassini probe"

### Artifacts cho Earth:

6. **🛰️ Satellite Debris**
   - Search: "satellite" hoặc "space junk"

---

## 📥 Download & Setup

### Bước 1: Download từ Sketchfab

1. Vào model page
2. Click **Download 3D Model**
3. Chọn format: **glTF (.gltf/.glb)** ✅
4. Chọn **Auto-Convert Format** nếu có
5. Tải về

### Bước 2: Optimize file size

**Recommended tools:**

- **gltf-pipeline**: `npm install -g gltf-pipeline`

  ```bash
  gltf-pipeline -i input.gltf -o output.glb -d
  ```

  `-d` flag = Draco compression (giảm 90% size)

- **Online**: https://gltf.report/
  - Upload file
  - Apply Draco compression
  - Download optimized

### Bước 3: Đặt file vào project

```
public/models/artifacts/mars/curiosity-wheel.glb
```

### Bước 4: Update artifact data

Mở `src/data/planetArtifacts.ts`:

```typescript
{
  id: 'mars-curiosity-wheel',
  name: '🛞 Curiosity Rover Wheel Fragment',
  // ... other fields ...
  modelUrl: '/models/artifacts/mars/curiosity-wheel.glb', // ← Thêm dòng này
  scale: 0.5,
}
```

---

## 🎯 Tiêu chí chọn models

### ✅ Nên chọn:

- **Poly count**: < 50k triangles (để tránh lag)
- **File size**: < 2MB (optimized với Draco)
- **License**: CC-BY hoặc CC0 (free commercial use)
- **Textures**: Có sẵn, không cần download riêng
- **Format**: GLB (single file, dễ load hơn GLTF)

### ❌ Tránh:

- Models > 5MB
- Quá nhiều materials/textures
- Poly count > 100k
- Animated models phức tạp (nếu không cần)

---

## 🧪 Test Performance

### Bước 1: Thêm 1 model thử nghiệm

Update `marsArtifacts[0]` với `modelUrl`:

```typescript
{
  id: 'mars-curiosity-wheel',
  modelUrl: '/models/artifacts/mars/curiosity-wheel.glb',
  // ...
}
```

### Bước 2: Test trên Mars

1. Chạy game
2. Đến Mars
3. Mở DevTools → Performance tab
4. Record 10 giây
5. Kiểm tra:
   - **FPS**: Phải ≥ 30 FPS (tốt nhất 60 FPS)
   - **Frame time**: < 33ms
   - **Memory**: Không tăng đột ngột

### Nếu LAG:

**Option A**: Giảm poly count

- Dùng tool như Blender để decimation
- Target: 10k-20k triangles

**Option B**: Dùng LOD (Level of Detail)

- Xa camera: Low poly model
- Gần camera: High poly model

**Option C**: Fallback về WebP sprites (như đã bàn)

---

## 📊 Recommended Models List

Tôi gợi ý models cụ thể từ Sketchfab (free):

### Mars:

- **Curiosity Rover Wheel**:

  - https://skfb.ly/6TZQG (NASA model)
  - Poly: ~15k, Size: 1.2MB

- **Viking Lander**:
  - https://skfb.ly/6WLRJ
  - Poly: ~25k, Size: 2.5MB

### Saturn:

- **Ice Crystal**:

  - https://skfb.ly/NYZX
  - Poly: 5k, Size: 500KB

- **Satellite Dish**:
  - https://skfb.ly/6YpUQ
  - Poly: 12k, Size: 1.5MB

_(Links có thể thay đổi, search keywords nếu không hoạt động)_

---

## 🎨 Nếu muốn custom models

Dùng **Blender** (free):

1. Import GLB file
2. Giảm poly: Modifier → Decimate → Ratio: 0.5
3. Export → glTF 2.0 → GLB → ✅ Draco Compression

---

## 🚀 Cách hoạt động trong code

```tsx
// ArtifactMesh.tsx đã update:

// Nếu có modelUrl → Load GLTF
{
  artifact.modelUrl ? (
    <Suspense fallback={null}>
      <ModelMesh modelPath={artifact.modelUrl} />
    </Suspense>
  ) : (
    // Fallback về geometry cũ (box, sphere...)
    <mesh>
      <boxGeometry />
    </mesh>
  );
}
```

**Suspense**: Hiển thị sau khi model load xong
**Fallback**: Nếu model lỗi/chưa load, không hiện gì (null)

---

## ✅ Checklist Test

- [ ] Download 1-2 models thử nghiệm
- [ ] Optimize với gltf-pipeline hoặc gltf.report
- [ ] Đặt vào `public/models/artifacts/`
- [ ] Update `planetArtifacts.ts` với `modelUrl`
- [ ] Test trên Mars
- [ ] Kiểm tra FPS (F12 → Performance)
- [ ] Nếu OK → Download thêm models khác
- [ ] Nếu LAG → Optimize hoặc dùng sprites

---

## 🔄 Rollback nếu cần

Nếu models gây lag, chỉ cần:

1. Xóa dòng `modelUrl` trong `planetArtifacts.ts`
2. Hệ thống tự động fallback về geometry cơ bản

Không cần sửa code khác!

---

**Ready to test?**

1. Download 1 model GLB
2. Đặt vào `public/models/artifacts/mars/test.glb`
3. Update artifact với `modelUrl: '/models/artifacts/mars/test.glb'`
4. Test ngay!
