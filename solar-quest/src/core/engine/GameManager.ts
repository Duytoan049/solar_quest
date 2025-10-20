import { create } from "zustand";

type Scene = "menu" | "warp" | "planetdetail" | "game";

interface GameState {
    scene: Scene;
    isPlanetSceneReady: boolean;
    setScene: (scene: Scene) => void;
    setPlanetSceneReady: (isReady: boolean) => void; // <-- Hàm mới
}

export const useGameManager = create<GameState>((set) => ({
    scene: "menu",
    isPlanetSceneReady: false,

    setScene: (scene: Scene) => {
        set({ scene });
    },

    // Hàm này sẽ được gọi bởi PreloadManager khi tải xong
    setPlanetSceneReady: (isReady: boolean) => {
        if (isReady) {
            console.log("GameManager received: Planet scene is ready!");
        }
        set({ isPlanetSceneReady: isReady });
    },
}));

export type { Scene };