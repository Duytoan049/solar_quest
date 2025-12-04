/**
 * Planet Artifacts Database
 * Collectible objects on surfaces and in orbit around planets
 */

import type { Artifact } from '../types/artifact';

// Helper function: Convert degrees to radians for easier rotation adjustment
// Usage: initialRotation: [deg(90), deg(0), deg(180)]
const deg = (degrees: number) => (degrees * Math.PI) / 180;

// ======================================
// MARS ARTIFACTS
// ======================================

export const marsArtifacts: Artifact[] = [
  // Surface Artifacts
  {
    id: 'mars-curiosity-wheel',
    planetId: 'mars',
    name: ' Curiosity Rover Wheel Fragment',
    modelUrl: '/models/artifacts/mars/curiosity-wheel.glb',
    imageUrl: '/images/artifacts/mars/curiosity-wheel.jpg',
    category: 'spacecraft-debris',
    rarity: 'rare',
    description: 'Mảnh bánh xe bị hư từ robot Curiosity',
    story: 'Curiosity đã di chuyển hơn 30km trên Sao Hỏa từ 2012. Bánh xe bị mòn và rách do địa hình gồ ghề.',
    scientificValue: 'Chứng minh sự khắc nghiệt của bề mặt Sao Hỏa với kim loại Trái Đất',
    location: 'surface',
    position: {
      latitude: -5.5895,
      longitude: 137.4417,
      altitude: 0.05
    },
    spawnChance: 100, // Always spawn - difficulty = location visibility
    points: 100,
    badge: 'rover-hunter',
    glowColor: '#ff6b4a',
    scale: 0.002,
    // 90° on X-axis to point downward
    isCollected: false
  },

  {
    id: 'mars-viking-plate',
    planetId: 'mars',
    name: 'Viking Lander Commemorative Plate',
    modelUrl: '/models/artifacts/mars/viking_i_lander.glb',
    imageUrl: '/images/artifacts/mars/viking-plate.jpg',
    category: 'historical-relic',
    rarity: 'legendary',
    description: 'Tấm kỷ niệm từ tàu Viking 1 - tàu đầu tiên hạ cánh thành công (1976)',
    story: 'Viking 1 đã truyền ảnh đầu tiên về từ bề mặt Sao Hỏa. Tấm kim loại này có khắc thông điệp cho người ngoài hành tinh.',
    scientificValue: 'Biểu tượng của thời kỳ đầu khám phá Sao Hỏa',
    location: 'surface',
    position: {
      latitude: 22.48,
      longitude: -49.97,
      altitude: 0.9
    },
    spawnChance: 100, // Always spawn - legendary = hard to find location
    points: 250,
    badge: 'space-archaeologist',
    unlocks: ['viking-mission-story'],
    glowColor: '#ffd700',
    scale: 0.02,
    isCollected: false
  },

  {
    id: 'mars-hematite-blueberry',
    planetId: 'mars',
    name: '💎 Hematite "Blueberry"',
    modelUrl: '/models/artifacts/mars/hematite-specular.glb',
    imageUrl: '/images/artifacts/mars/hematite-blueberry.jpg',
    category: 'natural-object',
    rarity: 'uncommon',
    description: 'Viên bi sắt oxit tự nhiên hình thành dưới nước cổ đại',
    story: 'Opportunity rover phát hiện hàng nghìn viên bi khoáng vật này. Chúng chỉ hình thành khi có nước!',
    scientificValue: 'Bằng chứng Sao Hỏa từng có nước lỏng',
    location: 'surface',
    position: {
      latitude: -2.0,
      longitude: 5.5,
      altitude: 0.05
    },
    spawnChance: 100,
    points: 50,
    glowColor: '#4169e1',
    scale: 0.0008,
    isCollected: false
  },

  {
    id: 'mars-ice-shard',
    planetId: 'mars',
    name: '❄️ Crystallized Ice Shard',
    modelUrl: '/models/artifacts/mars/ice_cluster.glb',
    imageUrl: '/images/artifacts/mars/ice-shard.jpg',
    category: 'natural-object',
    rarity: 'rare',
    description: 'Mảnh băng tinh thể từ cực Bắc Sao Hỏa',
    story: 'Băng nước ở cực Sao Hỏa tồn tại hàng triệu năm, ẩn dưới lớp CO2 đông đặc.',
    scientificValue: 'Chứa thông tin về khí hậu Sao Hỏa trong quá khứ',
    location: 'surface',
    position: {
      latitude: 85.0, // Near North Pole - hard to reach!
      longitude: 1,
      altitude: 0.05
    },
    spawnChance: 100,
    points: 80,
    badge: 'ice-collector',
    glowColor: '#87ceeb',
    scale: 0.09,
    initialRotation: [deg(90), deg(0), deg(0)],
    isCollected: false
  },

  // Orbital Artifacts
  {
    id: 'mars-orbiter-panel',
    planetId: 'mars',
    name: '⚡ Mars Orbiter Solar Panel',
    modelUrl: '/models/artifacts/mars/solar_panel_low_poly.glb',
    imageUrl: '/images/artifacts/mars/solar-panel-mars.jpg',
    category: 'spacecraft-debris',
    rarity: 'rare',
    description: 'Tấm pin mặt trời bị rơi từ vệ tinh',
    story: 'Các vệ tinh quay quanh Sao Hỏa đôi khi bị va chạm với vi thiên thạch, làm rơi mảnh vỡ.',
    scientificValue: 'Nghiên cứu tác động của môi trường không gian',
    location: 'low-orbit',
    position: {
      orbitalRadius: 1.5, // 1.15x planet radius (just above surface)
      orbitalAngle: 20,
      inclination: 15
    },
    spawnChance: 100,
    points: 70,
    glowColor: '#00ffff',
    scale: 0.005, // Adjusted from 5 to match other artifacts

    initialRotation: [deg(90), deg(0), deg(0)],
    isCollected: false
  },

  {
    id: 'mars-phobos-rock',
    planetId: 'mars',
    name: '🌑 Phobos Rock Fragment',
    modelUrl: '/models/artifacts/mars/phobos_1_1000.glb',
    imageUrl: '/images/artifacts/mars/phobos-rock.jpg',
    category: 'natural-object',
    rarity: 'epic',
    description: 'Mảnh đá từ mặt trăng Phobos của Sao Hỏa',
    story: 'Phobos đang dần tiến gần Sao Hỏa và sẽ vỡ tan trong 50 triệu năm. Đây là mảnh vỡ sớm.',
    scientificValue: 'Hiếm gặp! Vật liệu từ mặt trăng của Sao Hỏa',
    location: 'medium-orbit',
    position: {
      orbitalRadius: 3.5, // 3.5x planet radius
      orbitalAngle: 120,
      inclination: 1
    },
    spawnChance: 100,
    points: 150,
    badge: 'moon-collector',
    glowColor: '#ff4500',
    scale: 0.15,
    isCollected: false
  },
];

// ======================================
// SATURN ARTIFACTS
// ======================================

export const saturnArtifacts: Artifact[] = [
  {
    id: 'saturn-cassini-probe',
    planetId: 'saturn',
    name: '🛰️ Cassini Probe Fragment',
    category: 'spacecraft-debris',
    rarity: 'epic',
    description: 'Mảnh vỡ từ tàu Cassini đã lao vào Sao Thổ năm 2017',
    story: 'Cassini kết thúc sứ mệnh 20 năm bằng cách lao vào khí quyển Sao Thổ để tránh làm ô nhiễm các mặt trăng.',
    scientificValue: 'Kỷ niệm sứ mệnh vĩ đại nhất nghiên cứu Sao Thổ',
    location: 'surface',
    position: {
      latitude: -20,
      longitude: 80,
      altitude: 0
    },
    spawnChance: 100,
    points: 200,
    badge: 'cassini-memorial',
    glowColor: '#f4e4c1',
    scale: 0.15,
    isCollected: false
  },

  {
    id: 'saturn-ring-ice',
    planetId: 'saturn',
    name: '💎 Ring Ice Crystal',
    category: 'natural-object',
    rarity: 'rare',
    description: 'Tinh thể băng từ vành đai Sao Thổ',
    story: 'Vành đai Sao Thổ chứa 93% nước đá. Mỗi hạt băng như một viên kim cương nhỏ phản chiếu ánh sáng mặt trời.',
    scientificValue: 'Nghiên cứu thành phần vành đai hành tinh',
    location: 'low-orbit',
    position: {
      orbitalRadius: 2.2, // Inside ring system
      orbitalAngle: 90,
      inclination: 0
    },
    spawnChance: 100,
    points: 100,
    glowColor: '#ffffff',
    scale: 0.08,
    isCollected: false
  },

  {
    id: 'saturn-diamond-rain',
    planetId: 'saturn',
    name: '💎 Atmospheric Diamond',
    category: 'natural-object',
    rarity: 'legendary',
    description: 'Kim cương thật được tạo ra từ cơn bão Sao Thổ',
    story: 'Sét biến methane thành carbon, tạo kim cương "mưa" xuống bên trong hành tinh khí khổng lồ!',
    scientificValue: 'Hiện tượng tự nhiên kỳ diệu chỉ có ở hành tinh khí',
    location: 'medium-orbit',
    position: {
      orbitalRadius: 3.0, // In upper atmosphere
      orbitalAngle: 180,
      inclination: 5
    },
    spawnChance: 100, // Always spawn, but hard location
    points: 300,
    badge: 'diamond-collector',
    glowColor: '#ffff00',
    scale: 0.06,
    isCollected: false
  }
];

// ======================================
// EARTH ARTIFACTS (for testing)
// ======================================

export const earthArtifacts: Artifact[] = [
  // Surface Artifacts
  {
    id: 'earth-apollo-plaque',
    planetId: 'earth',
    name: '🚀 Apollo 11 Landing Site Plaque',
    modelUrl: '/models/artifacts/earth/apollo_10_capsule.glb',
    imageUrl: '/images/artifacts/earth/apollo-plaque.jpg',
    category: 'historical-relic',
    rarity: 'legendary',
    description: 'Tấm kỷ niệm từ địa điểm hạ cánh Apollo 11 - bước chân đầu tiên trên Mặt Trăng',
    story: 'Ngày 20/7/1969, Neil Armstrong và Buzz Aldrin đã đặt chân lên Mặt Trăng, mở ra kỷ nguyên mới cho nhân loại.',
    scientificValue: 'Biểu tượng vĩ đại nhất của khám phá không gian',
    location: 'surface',
    position: {
      latitude: 0.6875, // Sea of Tranquility
      longitude: 23.4333,
      altitude: 0.05
    },
    spawnChance: 100,
    points: 300,
    badge: 'moon-walker',
    unlocks: ['apollo-mission-story'],
    glowColor: '#ffd700',
    scale: 0.08,
    isCollected: false
  },

  {
    id: 'earth-sputnik-fragment',
    planetId: 'earth',
    name: '🛰️ Sputnik 1 Fragment',
    modelUrl: '/models/artifacts/earth/sputnik_1.glb',
    imageUrl: '/images/artifacts/earth/sputnik-fragment.jpg',
    category: 'spacecraft-debris',
    rarity: 'epic',
    description: 'Mảnh vỡ từ vệ tinh nhân tạo đầu tiên của nhân loại (1957)',
    story: 'Sputnik 1 của Liên Xô mở đầu kỷ nguyên vũ trụ. Tiếng "beep beep" từ vũ trụ đã làm thay đổi thế giới.',
    scientificValue: 'Khởi đầu của thời đại vũ trụ',
    location: 'surface',
    position: {
      latitude: 48.0, // Somewhere in Kazakhstan
      longitude: 66.0,
      altitude: 0.05
    },
    spawnChance: 100,
    points: 200,
    badge: 'space-pioneer',
    glowColor: '#ff4444',
    scale: 0.06,
    isCollected: false
  },

  {
    id: 'earth-volcanic-rock',
    planetId: 'earth',
    name: '🌋 Volcanic Rock Sample',
    modelUrl: '/models/artifacts/earth/volcanic_rock.glb',
    imageUrl: '/images/artifacts/earth/volcanic-rock.jpg',
    category: 'natural-object',
    rarity: 'uncommon',
    description: 'Đá núi lửa từ lớp magma sâu trong lòng Trái Đất',
    story: 'Núi lửa mang vật chất từ lớp mantle lên bề mặt, giúp ta hiểu về cấu trúc bên trong hành tinh.',
    scientificValue: 'Nghiên cứu thành phần địa chất và hoạt động địa tầng',
    location: 'surface',
    position: {
      latitude: 19.4, // Hawaii - active volcanoes
      longitude: -155.3,
      altitude: 0.05
    },
    spawnChance: 100,
    points: 50,
    glowColor: '#ff6600',
    scale: 0.05,
    isCollected: false
  },

  // Orbital Artifacts
  {
    id: 'earth-hubble-part',
    planetId: 'earth',
    name: '🔭 Hubble Telescope Component',
    modelUrl: '/models/artifacts/earth/hubble_space_telescope.glb',
    imageUrl: '/images/artifacts/earth/hubble-component.jpg',
    category: 'scientific-equipment',
    rarity: 'epic',
    description: 'Linh kiện được thay thế từ kính thiên văn Hubble',
    story: 'Các phi hành gia đã 5 lần bay lên sửa chữa Hubble. Đây là phần cũ được thay thế.',
    scientificValue: 'Công nghệ vũ trụ thập niên 90',
    location: 'low-orbit',
    position: {
      orbitalRadius: 1.08, // Low Earth orbit (~547 km)
      orbitalAngle: 60,
      inclination: 28.5
    },
    spawnChance: 100,
    points: 150,
    badge: 'space-technician',
    glowColor: '#4a90ff',
    scale: 0.12,
    isCollected: false
  },

  {
    id: 'earth-iss-panel',
    planetId: 'earth',
    name: '🛰️ ISS Solar Panel Fragment',
    modelUrl: '/models/artifacts/earth/iss.glb',
    imageUrl: '/images/artifacts/earth/iss-panel.jpg',
    category: 'spacecraft-debris',
    rarity: 'rare',
    description: 'Tấm pin mặt trời từ Trạm Vũ Trụ Quốc Tế (ISS)',
    story: 'ISS bay ở độ cao 400km, hoàn thành một vòng quay Trái Đất chỉ trong 90 phút!',
    scientificValue: 'Công nghệ năng lượng mặt trời trong không gian',
    location: 'low-orbit',
    position: {
      orbitalRadius: 1.06, // ~400 km altitude
      orbitalAngle: 120,
      inclination: 51.6
    },
    spawnChance: 100,
    points: 100,
    badge: 'station-visitor',
    glowColor: '#00ccff',
    scale: 0.08,
    isCollected: false
  },

  {
    id: 'earth-gps-satellite',
    planetId: 'earth',
    name: '📡 GPS Satellite Component',
    modelUrl: '/models/artifacts/earth/space_satellite.glb',
    imageUrl: '/images/artifacts/earth/gps-satellite.jpg',
    category: 'scientific-equipment',
    rarity: 'rare',
    description: 'Linh kiện từ vệ tinh định vị toàn cầu',
    story: 'Hệ thống GPS gồm 31 vệ tinh giúp bạn biết vị trí chính xác đến từng mét!',
    scientificValue: 'Công nghệ định vị vệ tinh và đồng hồ nguyên tử',
    location: 'high-orbit',
    position: {
      orbitalRadius: 3.3, // ~20,200 km altitude
      orbitalAngle: 180,
      inclination: 55
    },
    spawnChance: 100,
    points: 120,
    badge: 'navigator',
    glowColor: '#44ff44',
    scale: 0.1,
    isCollected: false
  },
];

// ======================================
// EXPORT ALL
// ======================================

export const PLANET_ARTIFACTS: Record<string, Artifact[]> = {
  mars: marsArtifacts,
  saturn: saturnArtifacts,
  earth: earthArtifacts,

  // TODO: Add more planets
  mercury: [],
  venus: [],
  jupiter: [],
  uranus: [],
  neptune: []
};

// Orbit zones configuration
export const ORBIT_ZONES = {
  'low-orbit': {
    name: 'Low Orbit',
    minRadius: 1.1, // 1.1x planet radius
    maxRadius: 1.3,
    artifactDensity: 8,
    difficulty: 1
  },
  'medium-orbit': {
    name: 'Medium Orbit',
    minRadius: 1.5,
    maxRadius: 2.0,
    artifactDensity: 5,
    difficulty: 2
  },
  'high-orbit': {
    name: 'High Orbit',
    minRadius: 2.5,
    maxRadius: 4.0,
    artifactDensity: 3,
    difficulty: 3
  }
};
