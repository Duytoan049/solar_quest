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
        personality: "scientific",
        color: "rgba(255, 200, 100, 0.6)",
        avatar: "☀️",
        dialogues: {
            intro: [
                "Chào mừng đến với Sao Thủy!",
                "Tôi là HELIOS, trợ lý nghiên cứu năng lượng mặt trời.",
                "Hành tinh này nóng nhất hệ mặt trời với nhiệt độ lên tới 430°C!",
            ],
            performanceBased: {
                highScore: "Phi công xuất sắc! Kỹ năng của bạn nóng bỏng như bề mặt Sao Thủy!",
                noDamage: "Hoàn hảo! Bạn điều khiển tàu như ánh sáng - nhanh và chính xác!",
                highCombo: "Combo tuyệt vời! Phản xạ của bạn nhanh như tia năng lượng mặt trời!",
                default: "Bạn đã hoàn thành nhiệm vụ tốt!",
            },
            facts: [
                "Sao Thủy không có khí quyển, nhiệt độ ban đêm xuống -180°C",
                "Một năm trên Sao Thủy chỉ dài 88 ngày Trái Đất",
                "Bề mặt đầy miệng núi lửa từ va chạm thiên thạch",
            ],
            explore: "Hãy khám phá các miệng núi lửa và bí ẩn của hành tinh gần Mặt trời nhất!",
        },
    },

    venus: {
        id: "venus",
        name: "AURORA",
        title: "Chuyên gia Khí quyển",
        personality: "mysterious",
        color: "rgba(255, 220, 150, 0.6)",
        avatar: "🌟",
        dialogues: {
            intro: [
                "Chào mừng đến với Sao Kim!",
                "Tôi là AURORA, chuyên gia về khí quyển hành tinh.",
                "Nơi đây có áp suất khủng khiếp và mưa axit sunfuric...",
            ],
            performanceBased: {
                highScore: "Tuyệt vời! Bạn bay qua màn acid rain như một chuyên gia!",
                noDamage: "Không hề hấn gì! Bạn né tránh như làn sương Venus!",
                highCombo: "Combo cực mạnh! Chính xác như các phép đo khí quyển!",
                default: "Bạn đã vượt qua thử thách của Venus!",
            },
            facts: [
                "Sao Kim quay ngược chiều so với các hành tinh khác",
                "Một ngày trên Venus dài hơn một năm của nó!",
                "Nhiệt độ bề mặt: 462°C - đủ nóng để nấu chảy chì",
            ],
            explore: "Khám phá bầu khí quyển dày đặc và những bí ẩn được che khuất bởi mây axit!",
        },
    },

    earth: {
        id: "earth",
        name: "TERRA",
        title: "Chuyên gia Môi trường Trái Đất",
        personality: "friendly",
        color: "rgba(100, 180, 255, 0.6)",
        avatar: "🌍",
        dialogues: {
            intro: [
                "Chào mừng trở về Trái Đất!",
                "Tôi là TERRA, chuyên gia về môi trường và khí hậu Trái Đất.",
                "Hành tinh xanh duy nhất có sự sống trong hệ mặt trời!",
            ],
            performanceBased: {
                highScore: "Xuất sắc! Bạn bay vòng quanh Trái Đất như một phi hành gia chuyên nghiệp!",
                noDamage: "Hoàn hảo! Kỹ năng điều khiển của bạn mượt mà như quỹ đạo ISS!",
                highCombo: "Combo tuyệt vời! Chính xác như vệ tinh định vị GPS!",
                default: "Bạn đã hoàn thành nhiệm vụ tốt!",
            },
            facts: [
                "Trái Đất là hành tinh duy nhất có nước lỏng trên bề mặt",
                "71% bề mặt Trái Đất được bao phủ bởi đại dương",
                "Khí quyển bảo vệ chúng ta khỏi bức xạ vũ trụ và thiên thạch",
            ],
            explore: "Hãy khám phá đại dương, rừng nhiệt đới và những kỳ quan thiên nhiên!",
        },
    },

    mars: {
        id: "mars",
        name: "ARES",
        title: "Nhà Địa chất học",
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
                highScore: "Tuyệt vời! Bạn chinh phục bão cát như một thợ săn thiên thạch chuyên nghiệp!",
                noDamage: "Hoàn hảo! Bạn né bão cát khéo như một Rover Mars!",
                highCombo: "Combo đỉnh! Chính xác như một tên lửa đáp xuống Sao Hỏa!",
                default: "Bạn đã vượt qua bão cát thành công!",
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
        personality: "scientific",
        color: "rgba(220, 200, 170, 0.6)",
        avatar: "⚡",
        dialogues: {
            intro: [
                "Chào mừng đến với Sao Mộc!",
                "Tôi là ZEUS, chuyên gia nghiên cứu các cơn bão khổng lồ.",
                "Đây là hành tinh lớn nhất - lớn hơn tất cả các hành tinh còn lại cộng lại!",
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
        personality: "friendly",
        color: "rgba(150, 180, 255, 0.6)",
        avatar: "🌊",
        dialogues: {
            intro: [
                "Chào mừng đến với Sao Hải Vương!",
                "Tôi là POSEIDON, nghiên cứu viên về các hành tinh nước.",
                "Đây là hành tinh xa nhất và có gió mạnh nhất hệ mặt trời!",
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
