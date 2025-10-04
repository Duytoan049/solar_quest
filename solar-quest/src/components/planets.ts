export const planets = [
    {
        name: 'Sun',
        texture: 'src/assets/textures/sun.jpg',
        description: 'Ngôi sao trung tâm của hệ mặt trời, cung cấp ánh sáng và năng lượng.',
        position: [-10, 0, 0],
        isLightSource: true,
        size: 4,
        speed: 0 // Sun does not orbit
    },
    {
        name: 'Mercury',
        texture: 'src/assets/textures/mercury.jpg',
        description: 'Hành tinh gần Mặt Trời nhất, nhỏ nhất trong hệ mặt trời.',
        position: [0, 0, 0],
        size: 0.3,
        speed: 0.4
    },
    {
        name: 'Venus',
        texture: 'src/assets/textures/venus.jpg',
        description: 'Hành tinh giống Trái Đất nhưng có khí hậu cực kỳ khắc nghiệt.',
        position: [5, 0, 0],
        size: 0.9,
        speed: 0.3
    },
    {
        name: 'Earth',
        texture: 'src/assets/textures/Albedo.jpeg',
        description: 'Hành tinh xanh - nơi con người đang sinh sống.',
        position: [10, 0, 0],
        size: 1,
        speed: 0.2
    },
    {
        name: 'Moon',
        texture: 'src/assets/textures/moon.jpg',
        description: 'Vệ tinh tự nhiên duy nhất của Trái Đất.',
        position: [11.5, 0.5, 0.5],
        isMoon: true,
        size: 0.27,
        speed: 0.5
    },
    {
        name: 'Mars',
        texture: 'src/assets/textures/mars.jpg',
        description: 'Hành tinh đỏ, có thể là tương lai của nhân loại.',
        position: [15, 0, 0],
        size: 0.53,
        speed: 0.15
    },
    {
        name: 'Jupiter',
        texture: 'src/assets/textures/jupiter.png',
        description: 'Hành tinh khí khổng lồ với cơn bão Great Red Spot.',
        position: [20, 0, 0],
        size: 2.5,
        speed: 0.1
    },
    {
        name: 'Uranus',
        texture: 'src/assets/textures/Uranus.jpeg',
        description: 'Hành tinh nghiêng 98 độ, có màu xanh lam đặc trưng.',
        position: [30, 0, 0],
        size: 1.7,
        speed: 0.07
    },
    {
        name: 'Neptune',
        texture: 'src/assets/textures/neptune.jpg',
        description: 'Hành tinh xa nhất trong hệ mặt trời, với màu xanh đặc trưng.',
        position: [35, 0, 0],
        size: 1.5,
        speed: 0.05
    }
];

export default planets;
