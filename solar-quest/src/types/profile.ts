// Profile System Types

export interface PlanetProfile {
    planetId: string;
    planetName: string;
    citizenName: string;
    role: "scientist" | "explorer" | "engineer" | "pilot";
    avatar: string; // Emoji avatar
    badges: string[];
    quizScore: number;
    quizTier: "bronze" | "silver" | "gold";
    createdAt: Date;
    lastVisited: Date;
}

export interface ProfileCreationData {
    citizenName: string;
    role: "scientist" | "explorer" | "engineer" | "pilot";
    avatar: string;
}

export const ROLE_INFO: Record<
    "scientist" | "explorer" | "engineer" | "pilot",
    {
        title: string;
        titleEn?: string;
        description: string;
        descriptionEn?: string;
        icon: string;
        color: string;
    }
> = {
    scientist: {
        title: "Nhà Khoa Học",
        titleEn: "Scientist",
        description: "Nghiên cứu sâu về địa chất, khí quyển và các hiện tượng",
        descriptionEn: "Researches geology, atmosphere and scientific phenomena",
        icon: "🔬",
        color: "#3b82f6", // blue
    },
    explorer: {
        title: "Nhà Thám Hiểm",
        titleEn: "Explorer",
        description: "Khám phá các vùng đất mới và bí ẩn",
        descriptionEn: "Explores new and mysterious regions",
        icon: "🧭",
        color: "#f59e0b", // amber
    },
    engineer: {
        title: "Kỹ Sư",
        titleEn: "Engineer",
        description: "Xây dựng và bảo trì cơ sở hạ tầng",
        descriptionEn: "Builds and maintains infrastructure",
        icon: "⚙️",
        color: "#8b5cf6", // purple
    },
    pilot: {
        title: "Phi Công",
        titleEn: "Pilot",
        description: "Điều khiển tàu vũ trụ và vận chuyển",
        descriptionEn: "Pilots spacecraft and handles transport",
        icon: "✈️",
        color: "#ec4899", // pink
    },
};

export const AVATAR_OPTIONS = [
    "👨‍🚀",
    "👩‍🚀",
    "🧑‍🚀",
    "👨‍🔬",
    "👩‍🔬",
    "🧑‍🔬",
    "🤖",
    "👽",
    "🛸",
    "🌟",
    "⭐",
    "💫",
];
