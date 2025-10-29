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
        description: string;
        icon: string;
        color: string;
    }
> = {
    scientist: {
        title: "Nhà Khoa Học",
        description: "Nghiên cứu sâu về địa chất, khí quyển và các hiện tượng",
        icon: "🔬",
        color: "#3b82f6", // blue
    },
    explorer: {
        title: "Nhà Thám Hiểm",
        description: "Khám phá các vùng đất mới và bí ẩn",
        icon: "🧭",
        color: "#f59e0b", // amber
    },
    engineer: {
        title: "Kỹ Sư",
        description: "Xây dựng và bảo trì cơ sở hạ tầng",
        icon: "⚙️",
        color: "#8b5cf6", // purple
    },
    pilot: {
        title: "Phi Công",
        description: "Điều khiển tàu vũ trụ và vận chuyển",
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
