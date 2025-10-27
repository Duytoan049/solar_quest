# 🚀 NASA API Integration Guide

## 📡 Overview

Dự án Solar Quest đã tích hợp NASA API để lấy dữ liệu chính xác về các hành tinh, ảnh thực từ Mars Rover, và ảnh Trái Đất từ vệ tinh.

## 🔑 Setup NASA API Key

### Bước 1: Đăng ký API Key

1. Truy cập: https://api.nasa.gov/
2. Điền form đăng ký (email + tên)
3. Nhận API key qua email (miễn phí, không giới hạn)

### Bước 2: Cấu hình

Mở file `.env.local` và thay `DEMO_KEY` bằng API key của bạn:

```env
VITE_NASA_API_KEY=YOUR_ACTUAL_API_KEY_HERE
```

**Lưu ý**:

- `DEMO_KEY` có giới hạn 30 requests/hour
- API key thật có giới hạn 1000 requests/hour

## 📊 Dữ liệu có sẵn

### 1. **Planet Stats (Tất cả 8 hành tinh)**

```typescript
{
  temperature: "467°C (average)",
  gravity: "8.87 m/s² (90% of Earth)",
  diameter: "12,104 km",
  dayLength: "2,802 hours (116.75 Earth days)",
  mass: "4.867 × 10²⁴ kg",
  distanceFromSun: "108.2 million km",
  moons: 0,
  atmosphere: "CO₂ 96.5%, N₂ 3.5%"
}
```

### 2. **Planetary Features/Landmarks (NASA-Verified)** 🗺️

Dữ liệu địa lý chính xác từ NASA Planetary Nomenclature và IAU:

- **Mars**: 5 features (Olympus Mons, Valles Marineris, Polar Ice Caps, Tharsis Region, Gale Crater)
- **Mercury**: 2 features (Caloris Basin, Rachmaninoff Basin)
- **Venus**: 2 features (Maxwell Montes, Maat Mons)
- **Earth**: 3 features (Mount Everest, Pacific Ocean, Amazon Rainforest)
- **Jupiter**: 1 feature (Great Red Spot)
- **Saturn**: 2 features (Ring System, Hexagonal Storm)
- **Uranus**: 1 feature (Polar Region)
- **Neptune**: 1 feature (Great Dark Spot)

Mỗi feature bao gồm:

```typescript
{
  id: number;
  name: string;
  type: string; // volcano, crater, canyon, mountain, etc.
  position: [x, y, z];
  description: string;
  diameter?: string;
  height?: string;
  depth?: string;
  coordinates: { latitude: number; longitude: number };
  discoveryDate?: string;
  namedAfter?: string;
}
```

### 3. **Mars Rover Photos** 🔴

- Ảnh thực từ Curiosity/Perseverance Rover
- Cập nhật hàng ngày
- Camera types: NAVCAM, FHAZ, RHAZ, MAST, CHEMCAM

### 4. **Earth EPIC Imagery** 🌍

- Ảnh Trái Đất từ vệ tinh DSCOVR
- View toàn cầu realtime
- Cập nhật mỗi 2 giờ

### 5. **Near-Earth Asteroids** ☄️

- Dữ liệu thiên thạch gần Trái Đất
- Size, tốc độ, quỹ đạo
- Mức độ nguy hiểm

## 🎯 Sử dụng trong Code

### Import Service

```typescript
import {
  getPlanetInfo,
  getPlanetaryFeatures,
  getMarsRoverPhoto,
  getEarthImagery,
} from "@/services/nasaApi";
```

### Lấy thông tin hành tinh

```typescript
const planetInfo = await getPlanetInfo("mars");
console.log(planetInfo.stats.temperature); // "-63°C (average)"
console.log(planetInfo.stats.moons); // 2
```

### Lấy planetary features/landmarks

```typescript
const marsFeatures = await getPlanetaryFeatures("mars");
console.log(marsFeatures[0].name); // "Olympus Mons"
console.log(marsFeatures[0].type); // "volcano"
console.log(marsFeatures[0].height); // "21.9 km"
console.log(marsFeatures[0].coordinates); // { latitude: 18.65, longitude: -133.8 }
```

### Lấy ảnh Mars Rover

```typescript
const marsPhoto = await getMarsRoverPhoto("curiosity", "NAVCAM");
console.log(marsPhoto.imageUrl);
console.log(marsPhoto.earthDate); // "2024-10-26"
```

### Lấy ảnh Trái Đất

```typescript
const earthImage = await getEarthImagery();
console.log(earthImage.imageUrl);
console.log(earthImage.caption); // "This image was taken by NASA's EPIC camera..."
```

## 🎨 Features đã tích hợp

### ✅ PlanetDetail Component

- Real-time stats từ NASA
- **NASA-verified planetary features/landmarks** (markers)
- Loading spinner khi fetch data
- Fallback data khi API unavailable
- Credit "Data from NASA" ở footer
- Detailed feature information (type, coordinates, height, diameter, etc.)

### ✅ Auto-fetch on Mount

```typescript
useEffect(() => {
  async function fetchPlanetData() {
    setIsLoadingPlanetInfo(true);
    setIsLoadingMarkers(true);

    // Fetch planet info
    const data = await getPlanetInfo(planetId);
    setPlanetInfo(data);

    // Fetch NASA planetary features/markers
    const features = await getPlanetaryFeatures(planetId);
    setNasaMarkers(features);

    setIsLoadingPlanetInfo(false);
    setIsLoadingMarkers(false);
  }
  fetchPlanetData();
}, [planetId]);
```

### ✅ Display Additional Data

- Mass (khối lượng)
- Distance from Sun (khoảng cách từ Mặt Trời)
- Number of Moons (số mặt trăng)
- Atmosphere composition (thành phần khí quyển)
- **Geographic features**: Type, coordinates, height, diameter, discovery date, named after

## 📱 UI Elements

### Stats Panel với NASA Data

```tsx
<div className="flex items-center justify-between">
  <h3>Planet Stats</h3>
  {isLoadingPlanetInfo && <Loader2 className="animate-spin" />}
</div>;

{
  planetInfo?.description && <p>{planetInfo.description}</p>;
}

{
  /* NASA Credit */
}
<p>📡 Data from NASA • Updated: {planetInfo.lastUpdated}</p>;
```

## 🔄 Rate Limits

| API Key Type | Limit                               |
| ------------ | ----------------------------------- |
| DEMO_KEY     | 30 requests/hour                    |
| Free API Key | 1,000 requests/hour                 |
| Registered   | 10,000 requests/hour (request form) |

## 🛠️ Troubleshooting

### Lỗi: "403 Forbidden"

→ API key không hợp lệ. Kiểm tra lại `.env.local`

### Lỗi: "429 Too Many Requests"

→ Vượt quá rate limit. Đợi 1 giờ hoặc upgrade API key

### Data không hiển thị

→ Kiểm tra console log và network tab

## 📚 Các API Endpoint đang dùng

1. **Mars Rover Photos**: `/mars-photos/api/v1/rovers/{rover}/latest_photos`
2. **Earth EPIC**: `/EPIC/api/natural`
3. **Asteroids NeoWs**: `/neo/rest/v1/feed`
4. **APOD**: `/planetary/apod` (backup cho planet images)

## 🚀 Next Steps

Có thể mở rộng thêm:

- [ ] Real-time Mars weather data
- [ ] Solar flares & space weather
- [ ] Satellite tracking
- [ ] Exoplanet data
- [ ] NASA Image & Video Library

## 📖 Documentation

- NASA API Docs: https://api.nasa.gov/
- Mars Rover Photos: https://github.com/chrisccerami/mars-photo-api
- EPIC API: https://epic.gsfc.nasa.gov/about/api
- Asteroids API: https://api.nasa.gov/neo/

---

**Made with ❤️ using NASA's Open Data**
