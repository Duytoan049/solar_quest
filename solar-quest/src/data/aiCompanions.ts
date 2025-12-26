import type { AICompanionData } from "@/types/victory";

/**
 * AI Companions for each planet
 * Each AI has unique personality and planet-specific knowledge
 */
export const aiCompanions: Record<string, AICompanionData> = {
    mercury: {
        id: "mercury",
        name: "HELIOS",
        title: "Chuyên gia Năng lượng Mặt trời",
        titleEn: "Solar Energy Specialist",
        personality: "scientific",
        color: "rgba(255, 200, 100, 0.6)",
        avatar: "☀️",
        dialogues: {
            intro: [
                "Chào mừng đến với Sao Thủy!",
                "Tôi là HELIOS, trợ lý nghiên cứu năng lượng mặt trời.",
                "Hành tinh này nóng nhất hệ mặt trời với nhiệt độ lên tới 430°C!",
            ],
            introEn: [
                "Welcome to Mercury!",
                "I'm HELIOS, a solar energy research assistant.",
                "This planet is the hottest in the solar system with temperatures up to about 430°C!",
            ],
            performanceBased: {
                highScore: "Phi công xuất sắc! Kỹ năng của bạn nóng bỏng như bề mặt Sao Thủy!",
                noDamage: "Hoàn hảo! Bạn điều khiển tàu như ánh sáng - nhanh và chính xác!",
                highCombo: "Combo tuyệt vời! Phản xạ của bạn nhanh như tia năng lượng mặt trời!",
                default: "Bạn đã hoàn thành nhiệm vụ tốt!",
            },
            performanceBasedEn: {
                highScore: "Excellent pilot! Your skills are as scorching as Mercury's surface!",
                noDamage: "Perfect! You flew like a beam of light—fast and precise!",
                highCombo: "Great combo! Your reflexes are sharp like solar flares!",
                default: "You completed the mission successfully!",
            },
            facts: [
                "Sao Thủy không có khí quyển, nhiệt độ ban đêm xuống -180°C",
                "Một năm trên Sao Thủy chỉ dài 88 ngày Trái Đất",
                "Bề mặt đầy miệng núi lửa từ va chạm thiên thạch",
            ],
            factsEn: [
                "Mercury has almost no atmosphere; nighttime temperatures can drop to -180°C",
                "A year on Mercury is only 88 Earth days",
                "The surface is covered in impact craters",
            ],
            explore: "Hãy khám phá các miệng núi lửa và bí ẩn của hành tinh gần Mặt trời nhất!",
            exploreEn: "Explore the craters and mysteries of the planet closest to the Sun!",
        },
    },

    venus: {
        id: "venus",
        name: "AURORA",
        title: "Chuyên gia Khí quyển",
        titleEn: "Atmosphere Specialist",
        personality: "mysterious",
        color: "rgba(255, 220, 150, 0.6)",
        avatar: "🌟",
        dialogues: {
            intro: [
                "Chào mừng đến với Sao Kim!",
                "Tôi là AURORA, chuyên gia về khí quyển hành tinh.",
                "Nơi đây có áp suất khủng khiếp và mưa axit sunfuric...",
            ],
            introEn: [
                "Welcome to Venus!",
                "I'm AURORA, an expert on planetary atmospheres.",
                "This world has crushing pressure and sulfuric acid rain...",
            ],
            performanceBased: {
                highScore: "Tuyệt vời! Bạn bay qua màn acid rain như một chuyên gia!",
                noDamage: "Không hề hấn gì! Bạn né tránh như làn sương Venus!",
                highCombo: "Combo cực mạnh! Chính xác như các phép đo khí quyển!",
                default: "Bạn đã vượt qua thử thách của Venus!",
            },
            performanceBasedEn: {
                highScore: "Awesome! You navigated the acid rain like a pro!",
                noDamage: "Unharmed! You dodged like Venus' mist!",
                highCombo: "Powerful combo! Precise as atmospheric measurements!",
                default: "You've overcome Venus' challenge!",
            },
            facts: [
                "Sao Kim quay ngược chiều so với các hành tinh khác",
                "Một ngày trên Venus dài hơn một năm của nó!",
                "Nhiệt độ bề mặt: 462°C - đủ nóng để nấu chảy chì",
            ],
            factsEn: [
                "Venus rotates in the opposite direction to most planets",
                "A day on Venus is longer than its year",
                "Surface temperatures around 462°C—hot enough to melt lead",
            ],
            explore: "Khám phá bầu khí quyển dày đặc và những bí ẩn được che khuất bởi mây axit!",
            exploreEn: "Explore the dense atmosphere and mysteries hidden beneath the acid clouds!",
        },
    },

    earth: {
        id: "earth",
        name: "TERRA",
        title: "Chuyên gia Môi trường Trái Đất",
        titleEn: "Earth Environment Specialist",
        personality: "friendly",
        color: "rgba(100, 180, 255, 0.6)",
        avatar: "🌍",
        dialogues: {
            intro: [
                "Chào mừng trở về Trái Đất!",
                "Tôi là TERRA, chuyên gia về môi trường và khí hậu Trái Đất.",
                "Hành tinh xanh duy nhất có sự sống trong hệ mặt trời!",
            ],
            introEn: [
                "Welcome back to Earth!",
                "I'm TERRA, an expert on Earth's environment and climate.",
                "The only planet known to host life in the solar system!",
            ],
            performanceBased: {
                highScore: "Excellent! You orbited Earth like a pro astronaut!",
                noDamage: "Perfect! Your piloting is smooth like the ISS orbit!",
                highCombo: "Great combo! Precise like GPS satellites!",
                default: "You completed the mission successfully!",
            },
            performanceBasedEn: {
                highScore: "Excellent! You orbited Earth like a pro astronaut!",
                noDamage: "Perfect! Your piloting is smooth like the ISS orbit!",
                highCombo: "Great combo! Precise like GPS satellites!",
                default: "You completed the mission successfully!",
            },
            facts: [
                "Trái Đất là hành tinh duy nhất có nước lỏng trên bề mặt",
                "71% bề mặt Trái Đất được bao phủ bởi đại dương",
                "Khí quyển bảo vệ chúng ta khỏi bức xạ vũ trụ và thiên thạch",
            ],
            factsEn: [
                "Earth is the only planet with liquid water on its surface",
                "71% of Earth's surface is covered by oceans",
                "The atmosphere protects us from cosmic radiation and meteors",
            ],
            explore: "Hãy khám phá đại dương, rừng nhiệt đới và những kỳ quan thiên nhiên!",
            exploreEn: "Explore the oceans, rainforests, and Earth's natural wonders!",
        },
    },

    mars: {
        id: "mars",
        name: "ARES",
        title: "Nhà Địa chất học",
        titleEn: "Geologist",
        personality: "friendly",
        color: "rgba(255, 150, 150, 0.6)",
        avatar: "🔴",
        dialogues: {
            intro: [
                "Chào mừng đến với Sao Hỏa!",
                "Tôi là ARES, nhà địa chất học hành tinh đỏ.",
                "Hành tinh này từng có nước và có thể đã từng có sự sống!",
            ],
            introEn: [
                "Welcome to Mars!",
                "I'm ARES, a planetary geologist for the Red Planet.",
                "This world once held water and may have supported life!",
            ],
            performanceBased: {
                highScore: "Amazing! You conquered the sandstorm like a pro meteor hunter!",
                noDamage: "Perfect! You dodged the sandstorm like a Mars rover!",
                highCombo: "Sick combo! Precise like a rocket landing on Mars!",
                default: "You successfully navigated the sandstorm!",
            },
            performanceBasedEn: {
                highScore: "Amazing! You conquered the sandstorm like a pro meteor hunter!",
                noDamage: "Perfect! You dodged the sandstorm like a Mars rover!",
                highCombo: "Sick combo! Precise like a rocket landing on Mars!",
                default: "You successfully navigated the sandstorm!",
            },
            facts: [
                "Olympus Mons là núi lửa cao nhất hệ mặt trời - 21km!",
                "Valles Marineris dài hơn 4000km - hẻm núi khổng lồ nhất",
                "Sao Hỏa có 2 mặt trăng nhỏ: Phobos và Deimos",
            ],
            factsEn: [
                "Olympus Mons is the tallest volcano in the solar system at about 21 km",
                "Valles Marineris stretches over 4,000 km - one of the largest canyons",
                "Mars has two small moons: Phobos and Deimos",
            ],
            explore: "Hãy khám phá núi lửa khổng lồ và những dấu vết của nước cổ đại!",
            exploreEn: "Explore the giant volcanoes and the ancient signs of water!",
        },
    },

    jupiter: {
        id: "jupiter",
        name: "ZEUS",
        title: "Nhà Nghiên cứu Bão",
        titleEn: "Storm Researcher",
        personality: "scientific",
        color: "rgba(220, 200, 170, 0.6)",
        avatar: "⚡",
        dialogues: {
            intro: [
                "Chào mừng đến với Sao Mộc!",
                "Tôi là ZEUS, chuyên gia nghiên cứu các cơn bão khổng lồ.",
                "Đây là hành tinh lớn nhất - lớn hơn tất cả các hành tinh còn lại cộng lại!",
            ],
            introEn: [
                "Welcome to Jupiter!",
                "I'm ZEUS, a researcher of giant storms.",
                "This is the largest planet—bigger than all the others combined!",
            ],
            performanceBased: {
                highScore: "Phi thường! Bạn điều khiển qua lực hấp dẫn như một chuyên gia!",
                noDamage: "Không thể tin được! Bạn né tránh hoàn hảo trong trường hấp dẫn mạnh!",
                highCombo: "Combo thần thánh! Mạnh mẽ như Đại Vết Đỏ!",
                default: "Bạn đã chinh phục lực hấp dẫn của Sao Mộc!",
            },
            facts: [
                "Đại Vết Đỏ (Great Red Spot) là cơn bão lớn hơn Trái Đất!",
                "Sao Mộc có 95 mặt trăng được biết đến",
                "Lực hấp dẫn mạnh gấp 2.5 lần Trái Đất",
            ],
            explore: "Khám phá Đại Vết Đỏ và hệ thống mặt trăng khổng lồ!",
        },
    },

    saturn: {
        id: "saturn",
        name: "CRONOS",
        title: "Chuyên gia Vành đai",
        titleEn: "Ring Specialist",
        personality: "mysterious",
        color: "rgba(220, 200, 170, 0.6)",
        avatar: "💍",
        dialogues: {
            intro: [
                "Chào mừng đến với Sao Thổ!",
                "Tôi là CRONOS, nghiên cứu viên về hệ thống vành đai.",
                "Vành đai này làm từ hàng tỷ mảnh băng và đá!",
            ],
            performanceBased: {
                highScore: "Xuất sắc! Bạn bay qua vành đai như một tàu khảo sát chuyên nghiệp!",
                noDamage: "Kỳ diệu! Bạn tránh các hạt vành đai một cách hoàn hảo!",
                highCombo: "Combo lộng lẫy như vành đai Sao Thổ!",
                default: "Bạn đã vượt qua thử thách vành đai!",
            },
            facts: [
                "Vành đai rộng 282,000 km nhưng chỉ dày 10 mét!",
                "Sao Thổ có 146 mặt trăng - nhiều nhất hệ mặt trời",
                "Titan (mặt trăng của Sao Thổ) có khí quyển dày hơn Trái Đất",
            ],
            explore: "Hãy khám phá cấu trúc tuyệt đẹp của vành đai và các mặt trăng bí ẩn!",
        },
    },

    uranus: {
        id: "uranus",
        name: "GAIA",
        title: "Nhà Khoa học Băng",
        titleEn: "Ice Scientist",
        personality: "scientific",
        color: "rgba(180, 220, 255, 0.6)",
        avatar: "❄️",
        dialogues: {
            intro: [
                "Chào mừng đến với Sao Thiên Vương!",
                "Tôi là GAIA, chuyên gia nghiên cứu các hành tinh băng.",
                "Hành tinh này quay nghiêng 98° - gần như nằm ngang!",
            ],
            performanceBased: {
                highScore: "Tuyệt đỉnh! Bạn trượt băng trên không gian như một VĐV Olympic!",
                noDamage: "Lạnh lùng và chính xác! Hoàn hảo như tinh thể băng!",
                highCombo: "Combo lạnh lẽo và mạnh mẽ!",
                default: "Bạn đã vượt qua bão băng thành công!",
            },
            facts: [
                "Sao Thiên Vương quay nghiêng 98° - nằm ngang so với quỹ đạo",
                "Nhiệt độ: -224°C - lạnh nhất trong hệ mặt trời",
                "Có 13 vành đai mờ nhạt và 27 mặt trăng",
            ],
            explore: "Khám phá hành tinh băng kỳ lạ với trục quay độc đáo!",
        },
    },

    neptune: {
        id: "neptune",
        name: "POSEIDON",
        title: "Nhà Thám hiểm Đại dương",
        titleEn: "Ocean Explorer",
        personality: "friendly",
        color: "rgba(150, 180, 255, 0.6)",
        avatar: "🌊",
        dialogues: {
            intro: [
                "Chào mừng đến với Sao Hải Vương!",
                "Tôi là POSEIDON, nghiên cứu viên về các hành tinh nước.",
                "Đây là hành tinh xa nhất và có gió mạnh nhất hệ mặt trời!",
            ],
            introEn: [
                "Welcome to Neptune!",
                "I'm POSEIDON, a researcher of water-world planets.",
                "This is the farthest planet with some of the strongest winds in the solar system!",
            ],
            performanceBased: {
                highScore: "Tuyệt vời! Bạn lướt qua trường hấp dẫn như sóng biển!",
                noDamage: "Mượt mà! Di chuyển như dòng chảy đại dương sâu thẳm!",
                highCombo: "Combo dữ dội như cơn bão Neptune!",
                default: "Bạn đã chinh phục thế giới nước khổng lồ!",
            },
            facts: [
                "Gió trên Neptune thổi với tốc độ 2,100 km/h!",
                "Một năm trên Neptune = 165 năm Trái Đất",
                "Màu xanh đậm do khí methane trong khí quyển",
            ],
            explore: "Hãy khám phá đại dương sâu thẳm và những cơn bão khổng lồ!",
        },
    },
};

export const getAICompanion = (planetId: string): AICompanionData => {
    return (
        aiCompanions[planetId.toLowerCase()] || aiCompanions.mars
    );
};
