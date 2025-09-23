import { create } from 'zustand';

type Scene = 'menu' | 'warp' | 'game';

export const useGameManager = create<{
    scene: Scene;
    setScene: (s: Scene) => void;
}>((set) => ({
    scene: 'menu',
    setScene: (s) => set({ scene: s }),
}));

export type { Scene };