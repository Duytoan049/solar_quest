// FIX: Import các file texture trực tiếp để Vite có thể xử lý chúng
import sunTexture from '../assets/textures/sun.jpg';
import mercuryTexture from '../assets/textures/mercury.jpg';
import venusTexture from '../assets/textures/venus.jpg';
import earthTexture from '../assets/textures/Albedo.jpeg';
import moonTexture from '../assets/textures/moon.jpg';
import marsTexture from '../assets/textures/mars.jpg';
import jupiterTexture from '../assets/textures/jupiter.png';
import uranusTexture from '../assets/textures/Uranus.jpeg';
import neptuneTexture from '../assets/textures/neptune.jpg';

// Import các texture HD của Sao Thổ
import saturnSurfaceHd from '../assets/textures/Uv1_saturn1_diff.png';
import saturnRingColorHd from '../assets/textures/Uv1_saturn2_diff.png';
import saturnRingAlphaHd from '../assets/textures/Uv2_saturn2_bump.png';


export const planets = [
    {
        name: 'Sun',
        texture: sunTexture,
        description: 'Ngôi sao trung tâm của hệ mặt trời, cung cấp ánh sáng và năng lượng.',
        radius: 4,
        distance: 0,
        speed: 0,
        isLightSource: true,
        hasAtmosphere: false,
    },
    {
        name: 'Mercury',
        texture: mercuryTexture,
        description: 'Hành tinh gần Mặt Trời nhất, nhỏ nhất trong hệ mặt trời.',
        radius: 0.38,
        distance: 15,
        speed: 0.04,
        hasAtmosphere: false,
    },
    {
        name: 'Venus',
        texture: venusTexture,
        description: 'Hành tinh giống Trái Đất nhưng có khí hậu cực kỳ khắc nghiệt.',
        radius: 0.95,
        distance: 20,
        speed: 0.035,
        hasAtmosphere: true,
        atmosphereColor: "#ffc46e",
    },
    {
        name: 'Earth',
        texture: earthTexture,
        description: 'Hành tinh xanh - nơi con người đang sinh sống.',
        radius: 1,
        distance: 28,
        speed: 0.03,
        hasAtmosphere: true,
        atmosphereColor: "#87ceeb",
    },
    {
        name: 'Moon',
        texture: moonTexture,
        description: 'Vệ tinh tự nhiên duy nhất của Trái Đất.',
        radius: 0.27,
        distance: 2.5,
        speed: 0.8,
        isMoon: true,
        hasAtmosphere: false,
    },
    {
        name: 'Mars',
        texture: marsTexture,
        description: 'Hành tinh đỏ, có thể là tương lai của nhân loại.',
        radius: 0.53,
        distance: 38,
        speed: 0.024,
        hasAtmosphere: true,
        atmosphereColor: "#c1440e",
    },
    {
        name: 'Jupiter',
        texture: jupiterTexture,
        description: 'Hành tinh khí khổng lồ với cơn bão Great Red Spot.',
        radius: 11.2,
        distance: 60,
        speed: 0.013,
        hasAtmosphere: true,
        atmosphereColor: "#bcaea1",
    },
    {
        name: "Saturn",
        // FIX: Sử dụng các biến đã import thay vì chuỗi ký tự
        texture: saturnSurfaceHd,
        ringTexture: saturnRingColorHd,
        ringAlphaMap: saturnRingAlphaHd,
        description: 'Hành tinh với hệ thống vành đai nổi bật nhất.',
        radius: 9.45,
        distance: 100,
        speed: 0.009,
        hasAtmosphere: true,
        atmosphereColor: "#f0e68c",
    },
    {
        name: 'Uranus',
        texture: uranusTexture,
        description: 'Hành tinh nghiêng 98 độ, có màu xanh lam đặc trưng.',
        radius: 4.0,
        distance: 130,
        speed: 0.006,
        hasAtmosphere: true,
        atmosphereColor: "#aee5d8",
    },
    {
        name: 'Neptune',
        texture: neptuneTexture,
        description: 'Hành tinh xa nhất trong hệ mặt trời, với màu xanh đặc trưng.',
        radius: 3.88,
        distance: 160,
        speed: 0.005,
        hasAtmosphere: true,
        atmosphereColor: "#5b5ddf",
    },
];

export default planets;
