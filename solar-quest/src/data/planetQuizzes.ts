import type { PlanetQuiz } from "@/types/quiz";

// Quiz data for all 8 planets (5 questions each)
export const PLANET_QUIZZES: Record<string, PlanetQuiz> = {
  mercury: {
    planetId: "mercury",
    planetName: "Sao Thủy",
    passingScore: 3,
    questions: [
      {
        id: "mercury-q1",
        question: "Sao Thủy là hành tinh nào trong hệ mặt trời?",
        options: [
          "Hành tinh nhỏ nhất và gần Mặt trời nhất",
          "Hành tinh lớn nhất",
          "Hành tinh xa Mặt trời nhất",
          "Hành tinh có nhiều vệ tinh nhất"
        ],
        correctAnswer: 0,
        explanation: "Sao Thủy là hành tinh nhỏ nhất và gần Mặt trời nhất trong hệ mặt trời!",
        difficulty: "easy",
        category: "science"
      },
      {
        id: "mercury-q2",
        question: "Một ngày trên Sao Thủy dài bao lâu so với Trái Đất?",
        options: [
          "12 giờ",
          "24 giờ",
          "58.6 ngày Trái Đất",
          "365 ngày"
        ],
        correctAnswer: 2,
        explanation: "Một ngày trên Sao Thủy (tự quay 1 vòng) dài 58.6 ngày Trái Đất! Rất chậm!",
        difficulty: "medium",
        category: "science"
      },
      {
        id: "mercury-q3",
        question: "Nhiệt độ trên Sao Thủy dao động như thế nào?",
        options: [
          "Luôn nóng 400°C",
          "Luôn lạnh -200°C",
          "Ban ngày 430°C, ban đêm -180°C",
          "Ổn định như Trái Đất"
        ],
        correctAnswer: 2,
        explanation: "Sao Thủy có sự chênh lệch nhiệt độ cực lớn do không có khí quyển giữ nhiệt!",
        difficulty: "medium",
        category: "science"
      },
      {
        id: "mercury-q4",
        question: "Tàu thăm dò nào của NASA đã nghiên cứu Sao Thủy?",
        options: [
          "Voyager 1",
          "Cassini",
          "MESSENGER",
          "New Horizons"
        ],
        correctAnswer: 2,
        explanation: "MESSENGER (2004-2015) đã vẽ bản đồ toàn bộ bề mặt Sao Thủy!",
        difficulty: "hard",
        category: "history"
      },
      {
        id: "mercury-q5",
        question: "Sao Thủy có bao nhiêu mặt trăng?",
        options: [
          "0 (không có)",
          "1",
          "2",
          "79"
        ],
        correctAnswer: 0,
        explanation: "Sao Thủy không có mặt trăng nào do trọng lực yếu và gần Mặt trời!",
        difficulty: "easy",
        category: "science"
      }
    ],
    rewards: {
      bronze: {
        score: 1,
        title: "Người mới khám phá Sao Thủy",
        badges: ["🥉 Bronze Explorer"],
        message: "Bạn đã bắt đầu hành trình khám phá!"
      },
      silver: {
        score: 3,
        title: "Chuyên gia Sao Thủy",
        badges: ["🥈 Silver Expert", "🔓 Mở khóa: Bí mật ẩn"],
        message: "Bạn hiểu khá rõ về Sao Thủy rồi đấy!"
      },
      gold: {
        score: 5,
        title: "Bậc thầy Sao Thủy",
        badges: ["🥇 Gold Master", "⭐ Hoàn hảo", "🎓 Chuyên gia thiên văn"],
        message: "Xuất sắc! Bạn là chuyên gia về Sao Thủy!"
      }
    }
  },

  venus: {
    planetId: "venus",
    planetName: "Sao Kim",
    passingScore: 3,
    questions: [
      {
        id: "venus-q1",
        question: "Tại sao Sao Kim được gọi là 'hành tinh địa ngục'?",
        options: [
          "Có núi lửa hoạt động",
          "Nhiệt độ 462°C và áp suất gấp 92 lần Trái Đất",
          "Có bão lớn",
          "Màu đỏ như lửa"
        ],
        correctAnswer: 1,
        explanation: "Sao Kim có nhiệt độ và áp suất cực cao, đủ làm chảy chì!",
        difficulty: "medium",
        category: "science"
      },
      {
        id: "venus-q2",
        question: "Sao Kim quay theo hướng nào?",
        options: [
          "Cùng chiều với Trái Đất",
          "Ngược chiều (tự quay ngược)",
          "Không quay",
          "Quay nghiêng 90 độ"
        ],
        correctAnswer: 1,
        explanation: "Sao Kim là 1 trong 2 hành tinh quay ngược chiều! Mặt trời mọc ở phía Tây!",
        difficulty: "hard",
        category: "science"
      },
      {
        id: "venus-q3",
        question: "Khí quyển Sao Kim chủ yếu là gì?",
        options: [
          "Oxy và Nitơ",
          "Khí CO₂ (96.5%)",
          "Hydro",
          "Metan"
        ],
        correctAnswer: 1,
        explanation: "Khí quyển dày đặc CO₂ tạo hiệu ứng nhà kính mạnh nhất hệ mặt trời!",
        difficulty: "medium",
        category: "science"
      },
      {
        id: "venus-q4",
        question: "Một ngày trên Sao Kim dài hơn một năm Sao Kim?",
        options: [
          "Đúng",
          "Sai",
          "Bằng nhau",
          "Không thể đo được"
        ],
        correctAnswer: 0,
        explanation: "Một ngày Sao Kim = 243 ngày Trái Đất, một năm Sao Kim = 225 ngày Trái Đất!",
        difficulty: "hard",
        category: "fun"
      },
      {
        id: "venus-q5",
        question: "Tại sao Sao Kim sáng nhất trên bầu trời?",
        options: [
          "Gần Mặt trời nhất",
          "Phản chiếu ánh sáng qua lớp mây dày",
          "Tự phát sáng",
          "Có núi lửa phun"
        ],
        correctAnswer: 1,
        explanation: "Lớp mây axit sulfuric dày đặc phản chiếu 70% ánh sáng Mặt trời!",
        difficulty: "easy",
        category: "science"
      }
    ],
    rewards: {
      bronze: {
        score: 1,
        title: "Khám phá Sao Kim",
        badges: ["🥉 Venus Explorer"],
        message: "Bạn đã dám khám phá hành tinh nóng nhất!"
      },
      silver: {
        score: 3,
        title: "Chuyên gia Sao Kim",
        badges: ["🥈 Venus Expert", "☁️ Bậc thầy mây axit"],
        message: "Bạn hiểu rõ về hành tinh địa ngục này!"
      },
      gold: {
        score: 5,
        title: "Bậc thầy Sao Kim",
        badges: ["🥇 Venus Master", "🔥 Chiến binh địa ngục", "🌟 Ngôi sao buổi sáng"],
        message: "Hoàn hảo! Không gì có thể cản bước bạn!"
      }
    }
  },

  earth: {
    planetId: "earth",
    planetName: "Trái Đất",
    passingScore: 3,
    questions: [
      {
        id: "earth-q1",
        question: "Trái Đất có bao nhiêu phần trăm bề mặt là nước?",
        options: [
          "50%",
          "60%",
          "71%",
          "85%"
        ],
        correctAnswer: 2,
        explanation: "71% bề mặt Trái Đất là nước, vì vậy còn gọi là 'Hành tinh xanh'!",
        difficulty: "easy",
        category: "geography"
      },
      {
        id: "earth-q2",
        question: "Núi cao nhất trên Trái Đất là gì?",
        options: [
          "K2",
          "Mount Everest (8,849m)",
          "Kilimanjaro",
          "Mauna Kea"
        ],
        correctAnswer: 1,
        explanation: "Mount Everest cao 8,849m so với mực nước biển!",
        difficulty: "easy",
        category: "geography"
      },
      {
        id: "earth-q3",
        question: "Lớp nào của Trái Đất bảo vệ chúng ta khỏi bức xạ?",
        options: [
          "Tầng đối lưu",
          "Lớp Ozone (O₃)",
          "Từ trường",
          "Lớp khí quyển"
        ],
        correctAnswer: 1,
        explanation: "Lớp Ozone hấp thụ 97-99% tia UV có hại từ Mặt trời!",
        difficulty: "medium",
        category: "science"
      },
      {
        id: "earth-q4",
        question: "Trái Đất di chuyển quanh Mặt trời với tốc độ bao nhiêu?",
        options: [
          "10 km/s",
          "20 km/s",
          "30 km/s (108,000 km/h)",
          "50 km/s"
        ],
        correctAnswer: 2,
        explanation: "Trái Đất bay quanh Mặt trời với tốc độ 30 km/giây!",
        difficulty: "hard",
        category: "science"
      },
      {
        id: "earth-q5",
        question: "Trái Đất có tuổi bao nhiêu?",
        options: [
          "1 tỷ năm",
          "2.5 tỷ năm",
          "4.54 tỷ năm",
          "10 tỷ năm"
        ],
        correctAnswer: 2,
        explanation: "Trái Đất hình thành cách đây 4.54 tỷ năm!",
        difficulty: "medium",
        category: "science"
      }
    ],
    rewards: {
      bronze: {
        score: 1,
        title: "Công dân Trái Đất",
        badges: ["🥉 Earth Citizen"],
        message: "Chào mừng về nhà!"
      },
      silver: {
        score: 3,
        title: "Nhà địa lý học",
        badges: ["🥈 Geographer", "🌍 Người bảo vệ Trái Đất"],
        message: "Bạn hiểu rõ hành tinh quê hương!"
      },
      gold: {
        score: 5,
        title: "Bậc thầy Trái Đất",
        badges: ["🥇 Earth Master", "🌎 Chuyên gia môi trường", "💙 Người yêu Trái Đất"],
        message: "Tuyệt vời! Hãy bảo vệ hành tinh xanh này!"
      }
    }
  },

  mars: {
    planetId: "mars",
    planetName: "Sao Hỏa",
    passingScore: 3,
    questions: [
      {
        id: "mars-q1",
        question: "Núi lửa cao nhất trong hệ mặt trời nằm ở đâu?",
        options: [
          "Mount Everest trên Trái Đất",
          "Olympus Mons trên Sao Hỏa (21.9 km)",
          "Maxwell Montes trên Sao Kim",
          "Io Volcano trên sao Mộc"
        ],
        correctAnswer: 1,
        explanation: "Olympus Mons cao 21.9 km, gấp gần 3 lần Mount Everest!",
        difficulty: "easy",
        category: "geography"
      },
      {
        id: "mars-q2",
        question: "Màu của bầu trời Sao Hỏa vào ban ngày là gì?",
        options: [
          "Xanh dương như Trái Đất",
          "Đỏ/Cam do bụi sắt oxit",
          "Đen tối",
          "Xanh lá"
        ],
        correctAnswer: 1,
        explanation: "Bụi sắt oxit trong khí quyển làm bầu trời Sao Hỏa có màu đỏ cam!",
        difficulty: "medium",
        category: "science"
      },
      {
        id: "mars-q3",
        question: "Rover nào đang hoạt động trên Sao Hỏa hiện nay (2025)?",
        options: [
          "Spirit và Opportunity",
          "Viking 1 và 2",
          "Curiosity và Perseverance",
          "Pathfinder"
        ],
        correctAnswer: 2,
        explanation: "Curiosity (2012) và Perseverance (2021) vẫn đang khám phá Sao Hỏa!",
        difficulty: "medium",
        category: "history"
      },
      {
        id: "mars-q4",
        question: "Một ngày trên Sao Hỏa (sol) dài bao lâu?",
        options: [
          "24 giờ giống Trái Đất",
          "24 giờ 37 phút",
          "12 giờ",
          "48 giờ"
        ],
        correctAnswer: 1,
        explanation: "Một sol = 24 giờ 37 phút, chỉ dài hơn Trái Đất 37 phút!",
        difficulty: "easy",
        category: "science"
      },
      {
        id: "mars-q5",
        question: "Sao Hỏa có bao nhiêu mặt trăng?",
        options: [
          "0",
          "1",
          "2 (Phobos và Deimos)",
          "4"
        ],
        correctAnswer: 2,
        explanation: "Phobos và Deimos là 2 mặt trăng nhỏ, có thể là tiểu hành tinh bị bắt giữ!",
        difficulty: "easy",
        category: "science"
      }
    ],
    rewards: {
      bronze: {
        score: 1,
        title: "Khám phá Sao Hỏa",
        badges: ["🥉 Mars Explorer"],
        message: "Chào mừng đến hành tinh đỏ!"
      },
      silver: {
        score: 3,
        title: "Chuyên gia Sao Hỏa",
        badges: ["🥈 Mars Expert", "🤖 Người điều khiển Rover"],
        message: "Bạn sẵn sàng cho sứ mệnh lên Sao Hỏa!"
      },
      gold: {
        score: 5,
        title: "Bậc thầy Sao Hỏa",
        badges: ["🥇 Mars Master", "👨‍🚀 Người khai phá", "🔴 Chủ nhân hành tinh đỏ"],
        message: "Hoàn hảo! Bạn là chuyên gia Sao Hỏa thực thụ!"
      }
    }
  },

  jupiter: {
    planetId: "jupiter",
    planetName: "Sao Mộc",
    passingScore: 3,
    questions: [
      {
        id: "jupiter-q1",
        question: "Sao Mộc lớn gấp bao nhiêu lần Trái Đất?",
        options: [
          "10 lần",
          "100 lần",
          "1,300 lần về thể tích",
          "10,000 lần"
        ],
        correctAnswer: 2,
        explanation: "Sao Mộc lớn gấp 1,300 lần Trái Đất về thể tích! Hành tinh khổng lồ!",
        difficulty: "medium",
        category: "science"
      },
      {
        id: "jupiter-q2",
        question: "Great Red Spot trên Sao Mộc là gì?",
        options: [
          "Miệng núi lửa",
          "Cơn bão khổng lồ tồn tại hơn 300 năm",
          "Biển nước đỏ",
          "Vết va chạm thiên thạch"
        ],
        correctAnswer: 1,
        explanation: "Great Red Spot là cơn bão lớn gấp 2 lần Trái Đất, tồn tại hàng trăm năm!",
        difficulty: "easy",
        category: "science"
      },
      {
        id: "jupiter-q3",
        question: "Sao Mộc có bao nhiêu mặt trăng được xác nhận?",
        options: [
          "4",
          "27",
          "53",
          "95 (nhiều nhất hệ mặt trời)"
        ],
        correctAnswer: 3,
        explanation: "Sao Mộc có 95 mặt trăng, nhiều nhất hệ mặt trời (2025)!",
        difficulty: "hard",
        category: "science"
      },
      {
        id: "jupiter-q4",
        question: "Mặt trăng nào của Sao Mộc có thể có sự sống?",
        options: [
          "Io (núi lửa)",
          "Europa (đại dương dưới băng)",
          "Callisto",
          "Ganymede"
        ],
        correctAnswer: 1,
        explanation: "Europa có đại dương nước mặn dưới lớp băng dày, có thể chứa sự sống!",
        difficulty: "medium",
        category: "science"
      },
      {
        id: "jupiter-q5",
        question: "Một ngày trên Sao Mộc dài bao lâu?",
        options: [
          "10 giờ (nhanh nhất hệ mặt trời)",
          "24 giờ",
          "48 giờ",
          "100 giờ"
        ],
        correctAnswer: 0,
        explanation: "Sao Mộc tự quay cực nhanh, chỉ mất 10 giờ cho một ngày!",
        difficulty: "hard",
        category: "fun"
      }
    ],
    rewards: {
      bronze: {
        score: 1,
        title: "Khám phá Sao Mộc",
        badges: ["🥉 Jupiter Explorer"],
        message: "Bạn đã đến hành tinh lớn nhất!"
      },
      silver: {
        score: 3,
        title: "Chuyên gia Sao Mộc",
        badges: ["🥈 Jupiter Expert", "🌪️ Thợ săn bão"],
        message: "Bạn hiểu rõ về gã khổng lồ này!"
      },
      gold: {
        score: 5,
        title: "Bậc thầy Sao Mộc",
        badges: ["🥇 Jupiter Master", "👑 Vua hành tinh", "🛡️ Người bảo vệ hệ mặt trời"],
        message: "Tuyệt vời! Bạn là chuyên gia về vua của các hành tinh!"
      }
    }
  },

  saturn: {
    planetId: "saturn",
    planetName: "Sao Thổ",
    passingScore: 3,
    questions: [
      {
        id: "saturn-q1",
        question: "Vành đai của Sao Thổ được làm từ gì?",
        options: [
          "Đá và bụi",
          "Băng, đá và bụi",
          "Kim loại",
          "Khí"
        ],
        correctAnswer: 1,
        explanation: "Vành đai Sao Thổ chủ yếu là băng (99.9%), đá và bụi!",
        difficulty: "easy",
        category: "science"
      },
      {
        id: "saturn-q2",
        question: "Sao Thổ có thể nổi trên nước?",
        options: [
          "Đúng (mật độ thấp hơn nước)",
          "Sai",
          "Chỉ nổi một phần",
          "Tùy thuộc nhiệt độ"
        ],
        correctAnswer: 0,
        explanation: "Sao Thổ có mật độ thấp hơn nước, nếu có đại dương đủ lớn nó sẽ nổi!",
        difficulty: "medium",
        category: "fun"
      },
      {
        id: "saturn-q3",
        question: "Mặt trăng nào của Sao Thổ có mưa metan?",
        options: [
          "Enceladus",
          "Titan (có hồ và mưa hydrocacbon)",
          "Rhea",
          "Mimas"
        ],
        correctAnswer: 1,
        explanation: "Titan có khí quyển dày, mưa metan và hồ hydrocacbon lỏng!",
        difficulty: "medium",
        category: "science"
      },
      {
        id: "saturn-q4",
        question: "Tàu thăm dó nào đã nghiên cứu Sao Thổ từ 2004-2017?",
        options: [
          "Voyager",
          "Cassini-Huygens",
          "Galileo",
          "New Horizons"
        ],
        correctAnswer: 1,
        explanation: "Cassini-Huygens đã nghiên cứu Sao Thổ trong 13 năm, gửi về hàng nghìn hình ảnh!",
        difficulty: "hard",
        category: "history"
      },
      {
        id: "saturn-q5",
        question: "Sao Thổ có bão hình gì ở cực Bắc?",
        options: [
          "Hình tròn",
          "Hình tam giác",
          "Hình lục giác (hexagon)",
          "Hình ngôi sao"
        ],
        correctAnswer: 2,
        explanation: "Sao Thổ có cơn bão hình lục giác khổng lồ ở cực Bắc, rộng 30,000 km!",
        difficulty: "hard",
        category: "fun"
      }
    ],
    rewards: {
      bronze: {
        score: 1,
        title: "Khám phá Sao Thổ",
        badges: ["🥉 Saturn Explorer"],
        message: "Chào mừng đến hành tinh có vành đai đẹp nhất!"
      },
      silver: {
        score: 3,
        title: "Chuyên gia Sao Thổ",
        badges: ["🥈 Saturn Expert", "💍 Thợ kim hoàn vũ trụ"],
        message: "Bạn hiểu rõ về vẻ đẹp của Sao Thổ!"
      },
      gold: {
        score: 5,
        title: "Bậc thầy Sao Thổ",
        badges: ["🥇 Saturn Master", "👑 Chúa tể của vành đai", "✨ Bậc thầy thẩm mỹ"],
        message: "Hoàn hảo! Bạn là chuyên gia về hành tinh đẹp nhất!"
      }
    }
  },

  uranus: {
    planetId: "uranus",
    planetName: "Sao Thiên Vương",
    passingScore: 3,
    questions: [
      {
        id: "uranus-q1",
        question: "Điều gì đặc biệt về trục quay của Sao Thiên Vương?",
        options: [
          "Quay rất nhanh",
          "Nghiêng 98° (quay nằm nghiêng)",
          "Quay ngược chiều",
          "Không quay"
        ],
        correctAnswer: 1,
        explanation: "Sao Thiên Vương nghiêng 98°, như thể đang 'lăn' trên quỹ đạo!",
        difficulty: "medium",
        category: "science"
      },
      {
        id: "uranus-q2",
        question: "Màu của Sao Thiên Vương là gì?",
        options: [
          "Đỏ",
          "Vàng",
          "Xanh lam/lục do khí Metan",
          "Trắng"
        ],
        correctAnswer: 2,
        explanation: "Khí Metan trong khí quyển hấp thụ ánh sáng đỏ, tạo màu xanh lam!",
        difficulty: "easy",
        category: "science"
      },
      {
        id: "uranus-q3",
        question: "Ai là người phát hiện Sao Thiên Vương?",
        options: [
          "Galileo Galilei",
          "Isaac Newton",
          "William Herschel (1781)",
          "Nicolaus Copernicus"
        ],
        correctAnswer: 2,
        explanation: "William Herschel phát hiện Sao Thiên Vương năm 1781, hành tinh đầu tiên được tìm thấy bằng kính thiên văn!",
        difficulty: "hard",
        category: "history"
      },
      {
        id: "uranus-q4",
        question: "Sao Thiên Vương có bao nhiêu mặt trăng?",
        options: [
          "5",
          "13",
          "27",
          "53"
        ],
        correctAnswer: 2,
        explanation: "Sao Thiên Vương có 27 mặt trăng được đặt tên theo nhân vật Shakespeare và Alexander Pope!",
        difficulty: "medium",
        category: "science"
      },
      {
        id: "uranus-q5",
        question: "Nhiệt độ lạnh nhất trong hệ mặt trời là bao nhiêu?",
        options: [
          "-100°C",
          "-150°C",
          "-224°C (trên Sao Thiên Vương)",
          "-300°C"
        ],
        correctAnswer: 2,
        explanation: "Sao Thiên Vương có nhiệt độ thấp nhất hệ mặt trời: -224°C!",
        difficulty: "hard",
        category: "science"
      }
    ],
    rewards: {
      bronze: {
        score: 1,
        title: "Khám phá Sao Thiên Vương",
        badges: ["🥉 Uranus Explorer"],
        message: "Bạn đã đến hành tinh nghiêng nhất!"
      },
      silver: {
        score: 3,
        title: "Chuyên gia Sao Thiên Vương",
        badges: ["🥈 Uranus Expert", "❄️ Thợ săn băng"],
        message: "Bạn hiểu rõ về gã khổng lồ băng giá này!"
      },
      gold: {
        score: 5,
        title: "Bậc thầy Sao Thiên Vương",
        badges: ["🥇 Uranus Master", "🌀 Chúa tể xoáy", "🧊 Bậc thầy băng giá"],
        message: "Xuất sắc! Bạn là chuyên gia về hành tinh bí ẩn này!"
      }
    }
  },

  neptune: {
    planetId: "neptune",
    planetName: "Sao Hải Vương",
    passingScore: 3,
    questions: [
      {
        id: "neptune-q1",
        question: "Sao Hải Vương được phát hiện như thế nào?",
        options: [
          "Nhìn bằng mắt thường",
          "Tính toán toán học trước khi nhìn thấy",
          "Tàu thăm dò tìm thấy",
          "Ngẫu nhiên"
        ],
        correctAnswer: 1,
        explanation: "Các nhà toán học tính toán vị trí Sao Hải Vương dựa trên quỹ đạo Sao Thiên Vương trước khi quan sát được!",
        difficulty: "hard",
        category: "history"
      },
      {
        id: "neptune-q2",
        question: "Tốc độ gió trên Sao Hải Vương là bao nhiêu?",
        options: [
          "100 km/h",
          "500 km/h",
          "2,100 km/h (nhanh nhất hệ mặt trời)",
          "5,000 km/h"
        ],
        correctAnswer: 2,
        explanation: "Sao Hải Vương có gió nhanh nhất hệ mặt trời: 2,100 km/h!",
        difficulty: "medium",
        category: "science"
      },
      {
        id: "neptune-q3",
        question: "Great Dark Spot trên Sao Hải Vương là gì?",
        options: [
          "Hố đen",
          "Cơn bão khổng lồ (giống Great Red Spot)",
          "Biển sâu",
          "Bóng tối vĩnh cửu"
        ],
        correctAnswer: 1,
        explanation: "Great Dark Spot là cơn bão lớn bằng Trái Đất, nhưng đã biến mất năm 1994!",
        difficulty: "medium",
        category: "science"
      },
      {
        id: "neptune-q4",
        question: "Tàu thăm dò nào duy nhất đã bay qua Sao Hải Vương?",
        options: [
          "Cassini",
          "New Horizons",
          "Voyager 2 (1989)",
          "Pioneer"
        ],
        correctAnswer: 2,
        explanation: "Voyager 2 là tàu duy nhất bay qua Sao Hải Vương năm 1989!",
        difficulty: "hard",
        category: "history"
      },
      {
        id: "neptune-q5",
        question: "Mặt trăng lớn nhất của Sao Hải Vương là gì?",
        options: [
          "Europa",
          "Titan",
          "Triton (quay ngược chiều)",
          "Callisto"
        ],
        correctAnswer: 2,
        explanation: "Triton quay ngược chiều so với Sao Hải Vương, có thể là vật thể vành đai Kuiper bị bắt!",
        difficulty: "medium",
        category: "science"
      }
    ],
    rewards: {
      bronze: {
        score: 1,
        title: "Khám phá Sao Hải Vương",
        badges: ["🥉 Neptune Explorer"],
        message: "Bạn đã đến hành tinh xa nhất!"
      },
      silver: {
        score: 3,
        title: "Chuyên gia Sao Hải Vương",
        badges: ["🥈 Neptune Expert", "🌊 Thợ lặn vũ trụ"],
        message: "Bạn hiểu rõ về thần biển xanh này!"
      },
      gold: {
        score: 5,
        title: "Bậc thầy Sao Hải Vương",
        badges: ["🥇 Neptune Master", "🔱 Chúa tể đại dương", "💨 Bậc thầy gió bão"],
        message: "Hoàn hảo! Bạn là chuyên gia về hành tinh bí ẩn nhất!"
      }
    }
  }
};

// Helper function to get quiz for a planet
export function getPlanetQuiz(planetId: string): PlanetQuiz | undefined {
  return PLANET_QUIZZES[planetId.toLowerCase()];
}

// Helper function to calculate reward tier
export function getRewardTier(score: number, maxScore: number): "bronze" | "silver" | "gold" {
  const percentage = (score / maxScore) * 100;
  if (percentage === 100) return "gold";
  if (percentage >= 60) return "silver";
  return "bronze";
}
