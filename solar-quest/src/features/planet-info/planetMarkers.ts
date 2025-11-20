// Helper function to convert lat/lon to 3D position on sphere
// radius = 2 (standard planet size in scene)
const latLonToPosition = (
    lat: number,
    lon: number,
    radius: number = 2
): [number, number, number] => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lon + 180) * (Math.PI / 180);

    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);

    return [x, y, z];
};

// Marker dữ liệu cho Mars với vị trí thực tế
export const marsMarkers = [
    {
        id: 1,
        name: "Olympus Mons",
        description:
            "Ngọn núi lửa lớn nhất Hệ Mặt Trời, cao 21.9 km - gấp 3 lần Everest.",
        position: latLonToPosition(18.65, -133.8), // 18.65°N, 133.8°W
        type: "volcano",
        height: "21.9 km",
        diameter: "600 km",
        coordinates: { latitude: 18.65, longitude: -133.8 },
        discoveryDate: "1971",
        namedAfter: "Mount Olympus in Greek mythology",
    },
    {
        id: 2,
        name: "Valles Marineris",
        description: "Hẻm núi khổng lồ dài 4,000 km, sâu 7 km - lớn nhất Hệ Mặt Trời.",
        position: latLonToPosition(-14, -59), // 14°S, 59°W
        type: "canyon",
        depth: "7 km",
        diameter: "4,000 km long × 200 km wide",
        coordinates: { latitude: -14, longitude: -59 },
        discoveryDate: "1971-1972",
        namedAfter: "Mariner 9 spacecraft",
    },
    {
        id: 3,
        name: "Polar Ice Caps",
        description: "Chỏm băng cực gồm nước đá và CO2 đông cứng.",
        position: latLonToPosition(85, 0), // Cực Bắc
        type: "ice cap",
        diameter: "~1,000 km (North)",
        coordinates: { latitude: 85, longitude: 0 },
        namedAfter: "Geographic poles",
    },
    {
        id: 4,
        name: "Gale Crater",
        description:
            "Miệng núi lửa nơi tàu Curiosity đang khám phá, có dấu vết nước cổ đại.",
        position: latLonToPosition(-5.4, 137.8), // 5.4°S, 137.8°E
        type: "crater",
        diameter: "154 km",
        height: "Mount Sharp: 5.5 km",
        coordinates: { latitude: -5.4, longitude: 137.8 },
        discoveryDate: "2012 (landing)",
        namedAfter: "Walter Frederick Gale, amateur astronomer",
    },
    {
        id: 5,
        name: "Tharsis Region",
        description: "Vùng núi lửa khổng lồ với 3 ngọn núi lửa khiên cao nhất.",
        position: latLonToPosition(0, -100), // Xích đạo, 100°W
        type: "volcanic plateau",
        diameter: "~4,000 km",
        coordinates: { latitude: 0, longitude: -100 },
        discoveryDate: "1970s",
        namedAfter: "Tharsis in ancient geography",
    },
    {
        id: 6,
        name: "Hellas Basin",
        description: "Hố va chạm khổng lồ sâu 9 km, rộng 2,300 km.",
        position: latLonToPosition(-42.7, 70), // 42.7°S, 70°E
        type: "impact basin",
        depth: "9 km",
        diameter: "2,300 km",
        coordinates: { latitude: -42.7, longitude: 70 },
        namedAfter: "Hellas (ancient name for Greece)",
    },
    {
        id: 7,
        name: "Jezero Crater",
        description: "Nơi tàu Perseverance đang tìm kiếm dấu vết sự sống cổ đại.",
        position: latLonToPosition(18.38, 77.58), // 18.38°N, 77.58°E
        type: "crater",
        diameter: "45 km",
        coordinates: { latitude: 18.38, longitude: 77.58 },
        discoveryDate: "2021 (landing)",
        namedAfter: "Jezero (Croatian for 'lake')",
    },
    {
        id: 8,
        name: "Phobos Transit",
        description: "Vệ tinh Phobos bay rất thấp, chỉ cách bề mặt 6,000 km.",
        position: latLonToPosition(0, 0), // Xích đạo
        type: "moon observation point",
        coordinates: { latitude: 0, longitude: 0 },
    },
    {
        id: 9,
        name: "Ascraeus Mons",
        description: "Núi lửa khiên cao thứ 2, cao 18 km.",
        position: latLonToPosition(11.9, -104.5), // 11.9°N, 104.5°W
        type: "volcano",
        height: "18 km",
        diameter: "460 km",
        coordinates: { latitude: 11.9, longitude: -104.5 },
        namedAfter: "Ascraeus Lacus (albedo feature)",
    },
    {
        id: 10,
        name: "Victoria Crater",
        description: "Miệng hố nơi tàu Opportunity khám phá 2 năm.",
        position: latLonToPosition(-2.05, -5.5), // 2.05°S, 5.5°W
        type: "crater",
        diameter: "750 m",
        depth: "70 m",
        coordinates: { latitude: -2.05, longitude: -5.5 },
        discoveryDate: "2006",
        namedAfter: "Victoria (Magellan's ship)",
    },
]; export const earthMarkers = [
    {
        id: 1,
        name: "Mount Everest",
        description: "Đỉnh núi cao nhất Trái Đất (8,849m) thuộc dãy Himalaya.",
        position: latLonToPosition(27.98, 86.92), // 27.98°N, 86.92°E
        type: "mountain",
        height: "8.849 km",
        coordinates: { latitude: 27.98, longitude: 86.92 },
        namedAfter: "Sir George Everest, British surveyor",
        discoveryDate: "1852",
    },
    {
        id: 2,
        name: "Amazon Rainforest",
        description: "Lá phổi xanh của Trái Đất, rừng mưa nhiệt đới lớn nhất.",
        position: latLonToPosition(-3.4, -62.2), // 3.4°S, 62.2°W
        type: "rainforest",
        diameter: "5.5 million km²",
        coordinates: { latitude: -3.4, longitude: -62.2 },
        namedAfter: "Amazon River",
    },
    {
        id: 3,
        name: "Great Barrier Reef",
        description: "Rạn san hô lớn nhất thế giới, nhìn thấy từ vũ trụ.",
        position: latLonToPosition(-18.2, 147.7), // 18.2°S, 147.7°E
        type: "coral reef",
        diameter: "2,300 km long",
        coordinates: { latitude: -18.2, longitude: 147.7 },
        discoveryDate: "1770",
        namedAfter: "Great Barrier (protective reef)",
    },
    {
        id: 4,
        name: "Sahara Desert",
        description: "Sa mạc nóng lớn nhất thế giới, rộng 9 triệu km².",
        position: latLonToPosition(23.4, 25.6), // 23.4°N, 25.6°E
        type: "desert",
        diameter: "9 million km²",
        coordinates: { latitude: 23.4, longitude: 25.6 },
        namedAfter: "Arabic 'ṣaḥrā' (desert)",
    },
    {
        id: 5,
        name: "Antarctica",
        description: "Lục địa băng giá, chứa 90% băng của Trái Đất.",
        position: latLonToPosition(-82.86, 135), // Cực Nam
        type: "ice sheet",
        diameter: "14 million km²",
        coordinates: { latitude: -82.86, longitude: 135 },
        discoveryDate: "1820",
        namedAfter: "Greek 'antarktikos' (opposite to Arctic)",
    },
    {
        id: 6,
        name: "Pacific Ocean",
        description: "Đại dương lớn nhất, chiếm 1/3 bề mặt Trái Đất.",
        position: latLonToPosition(0, -160), // Giữa Thái Bình Dương
        type: "ocean",
        diameter: "165 million km²",
        depth: "10.994 km (deepest point)",
        coordinates: { latitude: 0, longitude: -160 },
        namedAfter: "Latin 'pacificus' (peaceful)",
    },
    {
        id: 7,
        name: "Grand Canyon",
        description: "Hẻm núi kỳ vĩ sâu 1.8 km, dài 446 km.",
        position: latLonToPosition(36.1, -112.1), // 36.1°N, 112.1°W
        type: "canyon",
        depth: "1.8 km",
        diameter: "446 km long × 29 km wide",
        coordinates: { latitude: 36.1, longitude: -112.1 },
        discoveryDate: "1540",
        namedAfter: "Spanish 'Gran Cañón'",
    },
    {
        id: 8,
        name: "Great Wall of China",
        description: "Công trình nhân tạo duy nhất nhìn thấy từ quỹ đạo thấp.",
        position: latLonToPosition(40.4, 116.6), // 40.4°N, 116.6°E
        type: "man-made structure",
        diameter: "21,196 km long",
        coordinates: { latitude: 40.4, longitude: 116.6 },
        discoveryDate: "7th century BC",
        namedAfter: "Chinese 'Wànlǐ Chángchéng' (Long Wall)",
    },
    {
        id: 9,
        name: "Mariana Trench",
        description: "Vực sâu nhất đại dương (10,994m dưới mực nước biển).",
        position: latLonToPosition(11.37, 142.6), // 11.37°N, 142.6°E
        type: "oceanic trench",
        depth: "10.994 km",
        coordinates: { latitude: 11.37, longitude: 142.6 },
        discoveryDate: "1875",
        namedAfter: "Mariana Islands",
    },
    {
        id: 10,
        name: "Aurora Borealis",
        description: "Cực quang phương Bắc - hiện tượng từ trường tuyệt đẹp.",
        position: latLonToPosition(67, -26), // Iceland/Norway
        type: "atmospheric phenomenon",
        height: "100-500 km altitude",
        coordinates: { latitude: 67, longitude: -26 },
        namedAfter: "Aurora (Roman goddess of dawn)",
    },
];

export const venusMarkers = [
    {
        id: 1,
        name: "Maxwell Montes",
        description: "Dãy núi cao nhất Sao Kim, cao 11 km.",
        position: latLonToPosition(65, 3), // 65°N, 3°E
        type: "mountain range",
        height: "11 km",
        coordinates: { latitude: 65, longitude: 3 },
        namedAfter: "James Clerk Maxwell, physicist",
    },
    {
        id: 2,
        name: "Ishtar Terra",
        description: "Cao nguyên rộng lớn, tương đương Australia.",
        position: latLonToPosition(70, 27), // 70°N, 27°E
        type: "highland region",
        diameter: "~5,600 km",
        coordinates: { latitude: 70, longitude: 27 },
        namedAfter: "Ishtar (Babylonian goddess)",
    },
    {
        id: 3,
        name: "Aphrodite Terra",
        description: "Vùng đất cao nhất, lớn hơn châu Phi.",
        position: latLonToPosition(-5, 105), // 5°S, 105°E
        type: "highland region",
        diameter: "~10,000 km",
        coordinates: { latitude: -5, longitude: 105 },
        namedAfter: "Aphrodite (Greek goddess of love)",
    },
    {
        id: 4,
        name: "Maat Mons",
        description: "Núi lửa hoạt động cao 8 km.",
        position: latLonToPosition(0.5, 194.6), // 0.5°N, 194.6°E
        type: "volcano",
        height: "8 km",
        coordinates: { latitude: 0.5, longitude: 194.6 },
        namedAfter: "Maat (Egyptian goddess of truth)",
    },
    {
        id: 5,
        name: "Lava Plains",
        description: "Đồng bằng dung nham phủ 80% bề mặt.",
        position: latLonToPosition(-10, 180),
        type: "volcanic plains",
        diameter: "Covers 80% of surface",
        coordinates: { latitude: -10, longitude: 180 },
    },
    {
        id: 6,
        name: "Lakshmi Planum",
        description: "Cao nguyên cao 3-4 km, có dung nham tươi.",
        position: latLonToPosition(68.6, 339.3), // 68.6°N, 339.3°E
        type: "plateau",
        height: "3-4 km",
        coordinates: { latitude: 68.6, longitude: 339.3 },
        namedAfter: "Lakshmi (Hindu goddess of wealth)",
    },
    {
        id: 7,
        name: "Cleopatra Crater",
        description: "Miệng núi lửa kép sâu với đáy dung nham.",
        position: latLonToPosition(65.9, 7), // 65.9°N, 7°E
        type: "impact crater",
        diameter: "105 km",
        coordinates: { latitude: 65.9, longitude: 7 },
        namedAfter: "Cleopatra VII of Egypt",
    },
    {
        id: 8,
        name: "Beta Regio",
        description: "Vùng núi lửa hoạt động mạnh với dòng dung nham.",
        position: latLonToPosition(25.3, 282.8), // 25.3°N, 282.8°E
        type: "volcanic region",
        height: "~4 km",
        coordinates: { latitude: 25.3, longitude: 282.8 },
        namedAfter: "Beta (Greek letter)",
    },
];

export const jupiterMarkers = [
    {
        id: 1,
        name: "Great Red Spot",
        description: "Cơn bão khổng lồ lớn hơn Trái Đất, tồn tại 400 năm.",
        position: latLonToPosition(-22, 0), // 22°S
        type: "storm system",
        diameter: "16,350 km",
        coordinates: { latitude: -22, longitude: 0 },
        discoveryDate: "1665",
        namedAfter: "Distinctive red coloration",
    },
    {
        id: 2,
        name: "North Pole Storms",
        description: "8 cơn bão xoáy tròn quanh cực Bắc.",
        position: latLonToPosition(89, 0), // Cực Bắc
        type: "cyclone cluster",
        diameter: "~4,000 km each",
        coordinates: { latitude: 89, longitude: 0 },
        discoveryDate: "2017",
    },
    {
        id: 3,
        name: "Cloud Bands",
        description: "Dải mây sọc ngang do gió mạnh 640 km/h.",
        position: latLonToPosition(23, 180),
        type: "atmospheric feature",
        coordinates: { latitude: 23, longitude: 180 },
    },
    {
        id: 4,
        name: "Io's Volcanic Plume",
        description: "Vệ tinh Io có núi lửa phun cao 500 km.",
        position: latLonToPosition(0, 90),
        type: "moon observation",
        height: "500 km plumes",
        coordinates: { latitude: 0, longitude: 90 },
    },
    {
        id: 5,
        name: "Europa's Ice Shell",
        description: "Vệ tinh Europa phủ băng dày 15-25 km.",
        position: latLonToPosition(15, -90),
        type: "moon observation",
        depth: "15-25 km ice",
        coordinates: { latitude: 15, longitude: -90 },
    },
    {
        id: 6,
        name: "Oval BA",
        description: "Cơn bão đỏ nhỏ hơn, được gọi là 'Red Spot Jr'.",
        position: latLonToPosition(-33, 60), // 33°S
        type: "storm system",
        diameter: "~5,600 km",
        coordinates: { latitude: -33, longitude: 60 },
        discoveryDate: "2000",
    },
    {
        id: 7,
        name: "South Temperate Belt",
        description: "Dải mây bão động mạnh ở bán cầu Nam.",
        position: latLonToPosition(-30, 270),
        type: "atmospheric band",
        coordinates: { latitude: -30, longitude: 270 },
    },
    {
        id: 8,
        name: "Ganymede Surface",
        description: "Vệ tinh lớn nhất Hệ Mặt Trời, lớn hơn Sao Thủy.",
        position: latLonToPosition(45, 180),
        type: "moon observation",
        diameter: "5,268 km",
        coordinates: { latitude: 45, longitude: 180 },
    },
];

export const saturnMarkers = [
    {
        id: 1,
        name: "Ring System",
        description: "Vành đai khổng lồ rộng 282,000 km nhưng chỉ dày 10m.",
        position: latLonToPosition(0, 0),
        type: "ring system",
        diameter: "282,000 km wide",
        depth: "10 m thick",
        coordinates: { latitude: 0, longitude: 0 },
    },
    {
        id: 2,
        name: "Hexagon Storm",
        description: "Cơn bão hình lục giác kỳ lạ ở cực Bắc.",
        position: latLonToPosition(78, 0), // 78°N
        type: "polar storm",
        diameter: "30,000 km",
        coordinates: { latitude: 78, longitude: 0 },
        discoveryDate: "1981",
    },
    {
        id: 3,
        name: "Cassini Division",
        description: "Khe hở rộng 4,800 km trong vành đai.",
        position: latLonToPosition(0, 90),
        type: "ring gap",
        diameter: "4,800 km wide",
        coordinates: { latitude: 0, longitude: 90 },
        namedAfter: "Giovanni Cassini, astronomer",
    },
    {
        id: 4,
        name: "Titan's Atmosphere",
        description: "Vệ tinh Titan có khí quyển dày hơn Trái Đất.",
        position: latLonToPosition(26, 180),
        type: "moon observation",
        diameter: "5,150 km",
        coordinates: { latitude: 26, longitude: 180 },
    },
    {
        id: 5,
        name: "Enceladus Geysers",
        description: "Vệ tinh Enceladus phun nước từ đại dương ngầm.",
        position: latLonToPosition(-54, 270), // Cực Nam
        type: "moon observation",
        height: "200 km plumes",
        coordinates: { latitude: -54, longitude: 270 },
    },
    {
        id: 6,
        name: "South Pole Vortex",
        description: "Cơn bão xoáy khổng lồ ở cực Nam có mắt bão rõ.",
        position: latLonToPosition(-88, 0), // Cực Nam
        type: "polar storm",
        diameter: "8,000 km",
        coordinates: { latitude: -88, longitude: 0 },
    },
    {
        id: 7,
        name: "Encke Gap",
        description: "Khe hở 325 km do vệ tinh Pan tạo ra.",
        position: latLonToPosition(0, 180),
        type: "ring gap",
        diameter: "325 km wide",
        coordinates: { latitude: 0, longitude: 180 },
        namedAfter: "Johann Encke, astronomer",
    },
    {
        id: 8,
        name: "Dragon Storm",
        description: "Cơn bão tạo sóng radio mạnh, phát hiện từ Trái Đất.",
        position: latLonToPosition(-35, 90), // 35°S
        type: "storm system",
        coordinates: { latitude: -35, longitude: 90 },
        discoveryDate: "2004",
    },
];

export const uranusMarkers = [
    {
        id: 1,
        name: "Tilted Axis",
        description: "Trục quay nghiêng 98°, hành tinh 'lăn' quanh Mặt Trời.",
        position: latLonToPosition(0, 0),
        type: "axial feature",
        coordinates: { latitude: 0, longitude: 0 },
    },
    {
        id: 2,
        name: "Faint Rings",
        description: "13 vành đai mờ nhạt, khó quan sát.",
        position: latLonToPosition(0, 90),
        type: "ring system",
        diameter: "13 rings total",
        coordinates: { latitude: 0, longitude: 90 },
        discoveryDate: "1977",
    },
    {
        id: 3,
        name: "Miranda Cliff",
        description: "Vệ tinh Miranda có vách đá cao 20 km - cao nhất Hệ Mặt Trời.",
        position: latLonToPosition(-25, 180),
        type: "moon observation",
        height: "20 km cliff",
        coordinates: { latitude: -25, longitude: 180 },
        namedAfter: "Verona Rupes feature",
    },
    {
        id: 4,
        name: "Diamond Rain",
        description: "Áp suất cực lớn tạo mưa kim cương trong lòng đất.",
        position: latLonToPosition(-45, 270),
        type: "atmospheric phenomenon",
        coordinates: { latitude: -45, longitude: 270 },
    },
    {
        id: 5,
        name: "Dark Spot 1986",
        description: "Vùng mây tối phát hiện bởi Voyager 2.",
        position: latLonToPosition(-30, 60),
        type: "atmospheric feature",
        coordinates: { latitude: -30, longitude: 60 },
        discoveryDate: "1986",
    },
    {
        id: 6,
        name: "Ariel's Canyons",
        description: "Vệ tinh Ariel có hẻm núi sâu và vết nứt khổng lồ.",
        position: latLonToPosition(15, 300),
        type: "moon observation",
        diameter: "1,158 km (moon size)",
        coordinates: { latitude: 15, longitude: 300 },
    },
];

export const neptuneMarkers = [
    {
        id: 1,
        name: "Great Dark Spot",
        description: "Cơn bão khổng lồ lớn bằng Trái Đất (đã biến mất 1994).",
        position: latLonToPosition(-22, 0), // 22°S
        type: "storm system",
        diameter: "13,000 km × 6,600 km",
        coordinates: { latitude: -22, longitude: 0 },
        discoveryDate: "1989",
    },
    {
        id: 2,
        name: "Supersonic Winds",
        description: "Gió mạnh nhất Hệ Mặt Trời: 2,100 km/h.",
        position: latLonToPosition(30, 180),
        type: "atmospheric feature",
        coordinates: { latitude: 30, longitude: 180 },
    },
    {
        id: 3,
        name: "Triton Geysers",
        description: "Vệ tinh Triton phun nitơ lỏng lên không trung.",
        position: latLonToPosition(-40, 90),
        type: "moon observation",
        height: "8 km plumes",
        coordinates: { latitude: -40, longitude: 90 },
    },
    {
        id: 4,
        name: "Ice Giant Core",
        description: "Lõi băng nóng 5,000°C dưới áp suất khủng khiếp.",
        position: latLonToPosition(0, 0),
        type: "internal structure",
        coordinates: { latitude: 0, longitude: 0 },
    },
    {
        id: 5,
        name: "Scooter Cloud",
        description: "Đám mây trắng di chuyển nhanh quanh hành tinh.",
        position: latLonToPosition(-42, 120),
        type: "cloud feature",
        coordinates: { latitude: -42, longitude: 120 },
        discoveryDate: "1989",
    },
    {
        id: 6,
        name: "Small Dark Spot",
        description: "Cơn bão nhỏ hơn, cũng biến mất bí ẩn.",
        position: latLonToPosition(-55, 240),
        type: "storm system",
        coordinates: { latitude: -55, longitude: 240 },
        discoveryDate: "1989",
    },
    {
        id: 7,
        name: "The Wizard's Eye",
        description: "Vùng mây tròn trắng giống mắt phù thủy.",
        position: latLonToPosition(-45, 300),
        type: "cloud feature",
        coordinates: { latitude: -45, longitude: 300 },
    },
];

export const mercuryMarkers = [
    {
        id: 1,
        name: "Caloris Basin",
        description: "Hố va chạm khổng lồ rộng 1,550 km.",
        position: latLonToPosition(30.5, -189.8), // 30.5°N, 189.8°W
        type: "impact basin",
        diameter: "1,550 km",
        coordinates: { latitude: 30.5, longitude: -189.8 },
        discoveryDate: "1974",
        namedAfter: "Latin 'calor' (heat)",
    },
    {
        id: 2,
        name: "Weird Terrain",
        description: "Địa hình kỳ lạ do sóng chấn va chạm tạo nên.",
        position: latLonToPosition(-30.5, 9.8), // Đối diện Caloris
        type: "chaotic terrain",
        coordinates: { latitude: -30.5, longitude: 9.8 },
    },
    {
        id: 3,
        name: "Ice in Craters",
        description: "Nước đá ẩn trong miệng hố cực Bắc/Nam.",
        position: latLonToPosition(85, 0), // Cực Bắc
        type: "ice deposit",
        coordinates: { latitude: 85, longitude: 0 },
        discoveryDate: "1992",
    },
    {
        id: 4,
        name: "Shrinking Planet",
        description: "Hành tinh co lại, tạo vách đá 'wrinkle ridges'.",
        position: latLonToPosition(0, 90),
        type: "geological feature",
        coordinates: { latitude: 0, longitude: 90 },
    },
    {
        id: 5,
        name: "Rachmaninoff Basin",
        description: "Hố va chạm kép có vòng núi bên trong.",
        position: latLonToPosition(27.6, -57.6), // 27.6°N, 57.6°W
        type: "impact basin",
        diameter: "306 km",
        coordinates: { latitude: 27.6, longitude: -57.6 },
        namedAfter: "Sergei Rachmaninoff, composer",
    },
    {
        id: 6,
        name: "Rembrandt Crater",
        description: "Miệng hố khổng lồ rộng 715 km.",
        position: latLonToPosition(-32.8, 88.3), // 32.8°S, 88.3°E
        type: "impact crater",
        diameter: "715 km",
        coordinates: { latitude: -32.8, longitude: 88.3 },
        namedAfter: "Rembrandt van Rijn, painter",
    },
    {
        id: 7,
        name: "The Spider",
        description: "Hệ thống vết nứt hình nhện rộng 200 km.",
        position: latLonToPosition(-22.85, -30.85), // Pantheon Fossae
        type: "radial fracture system",
        diameter: "~200 km",
        coordinates: { latitude: -22.85, longitude: -30.85 },
        namedAfter: "Pantheon Fossae feature",
    },
];

export const sunMarkers = [
    {
        id: 1,
        name: "Solar Flares",
        description: "Vụ nổ năng lượng mạnh gấp hàng tỷ lần bom nguyên tử.",
        position: latLonToPosition(15, 45),
        type: "magnetic explosion",
        height: "100,000+ km loops",
        coordinates: { latitude: 15, longitude: 45 },
        discoveryDate: "1859 (Carrington Event)",
    },
    {
        id: 2,
        name: "Sunspots",
        description: "Vết đen từ trường mạnh, nhiệt độ thấp hơn 1,500°C.",
        position: latLonToPosition(-20, 180),
        type: "magnetic region",
        diameter: "1,000-50,000 km typical",
        coordinates: { latitude: -20, longitude: 180 },
        discoveryDate: "1610 (Galileo Galilei)",
    },
    {
        id: 3,
        name: "Corona",
        description: "Tầng khí quyển ngoài nóng 1-3 triệu °C.",
        position: latLonToPosition(0, 0),
        type: "atmospheric layer",
        height: "extends millions of km",
        coordinates: { latitude: 0, longitude: 0 },
        discoveryDate: "Ancient (visible during eclipses)",
    },
    {
        id: 4,
        name: "Prominence Loops",
        description: "Vòng cung plasma khổng lồ cao hơn 100 Trái Đất.",
        position: latLonToPosition(25, 270),
        type: "plasma structure",
        height: "up to 1,000,000 km",
        coordinates: { latitude: 25, longitude: 270 },
        discoveryDate: "1860s (spectroscopy era)",
    },
    {
        id: 5,
        name: "Core Fusion",
        description: "Lõi hợp nhất 600 triệu tấn hydro/giây thành helium.",
        position: latLonToPosition(0, 0),
        type: "nuclear fusion zone",
        diameter: "~400,000 km core radius",
        coordinates: { latitude: 0, longitude: 0 },
        discoveryDate: "1938 (Hans Bethe theory)",
        namedAfter: "Nuclear fusion process",
    },
    {
        id: 6,
        name: "Photosphere",
        description: "Bề mặt nhìn thấy của Mặt Trời, nóng 5,500°C.",
        position: latLonToPosition(0, 90),
        type: "visible surface layer",
        depth: "~500 km thick",
        coordinates: { latitude: 0, longitude: 90 },
        namedAfter: "Greek 'photos' (light) + 'sphaira' (sphere)",
    },
    {
        id: 7,
        name: "Coronal Mass Ejection",
        description: "Phun tỷ tấn plasma vào không gian với tốc độ 3,000 km/s.",
        position: latLonToPosition(30, 135),
        type: "solar eruption",
        diameter: "billions of tons of plasma",
        coordinates: { latitude: 30, longitude: 135 },
        discoveryDate: "1971 (OSO-7 satellite)",
        namedAfter: "Coronal mass ejection phenomenon",
    },
    {
        id: 8,
        name: "Chromosphere",
        description: "Tầng khí quyển giữa, phát sáng đỏ khi nhật thực.",
        position: latLonToPosition(-15, 225),
        type: "atmospheric layer",
        depth: "~2,000 km thick",
        coordinates: { latitude: -15, longitude: 225 },
        namedAfter: "Greek 'chromos' (color) + 'sphaira' (sphere)",
    },
];

// Helper function to get markers for a planet
export function getPlanetMarkers(planetId: string): Array<{ name: string }> {
    const markersMap: Record<string, Array<{ name: string }>> = {
        mars: marsMarkers,
        earth: earthMarkers,
        venus: venusMarkers,
        jupiter: jupiterMarkers,
        saturn: saturnMarkers,
        uranus: uranusMarkers,
        neptune: neptuneMarkers,
        mercury: mercuryMarkers,
        sun: sunMarkers,
    };

    return markersMap[planetId.toLowerCase()] || marsMarkers;
}
