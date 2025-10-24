import React from "react";

// Định nghĩa và export các kiểu dữ liệu
export type SceneType = "menu" | "warp" | "solar_system" | "mission" | "3dlook" | "game"; // Thêm các scene bạn có

export type GameContextType = {
    scene: SceneType;
    setScene: (name: SceneType, params?: Record<string, unknown>) => void; // Thay Dispatch<SetStateAction<SceneType>> bằng type này
    sceneParams?: Record<string, unknown>;
    // Chúng ta sẽ sử dụng isSolarSystemLoaded
    isSolarSystemLoaded: boolean;
    preloadSolarSystem: () => Promise<void>;
    // Các state khác nếu có...
    score: number;
    setScore: React.Dispatch<React.SetStateAction<number>>;
    loadingProgress: number;

};