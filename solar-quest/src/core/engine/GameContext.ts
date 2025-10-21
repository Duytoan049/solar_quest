import { createContext, useContext } from "react";
import type { GameContextType } from "./types"; // Import type từ file mới

// Tạo và export Context
export const GameContext = createContext<GameContextType | undefined>(undefined);

// Tạo và export custom hook
export const useGameManager = () => {
    const context = useContext(GameContext);
    if (!context) {
        throw new Error("useGameManager must be used within a GameManagerProvider");
    }
    return context;
};