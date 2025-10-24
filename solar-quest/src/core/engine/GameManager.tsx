import React, { useState, useCallback, useEffect } from "react"; // Thêm useEffect
import { planets as planetData } from "../../components/planets";
import * as THREE from "three";
import { GameContext } from "./GameContext"; // Import Context
import type { SceneType, GameContextType } from "./types"; // Import các types
THREE.Cache.enabled = true;
type SceneState = {
  name: SceneType;
  params?: Record<string, unknown>;
};
// HÀM TẢI TRƯỚC TEXTURE
const preloadTextures = (paths: string[]): Promise<void[]> => {
  THREE.Cache.enabled = true; // 🔥 kích hoạt cache toàn cục
  const loader = new THREE.TextureLoader();
  const promises = paths.map((path) => {
    return new Promise<void>((resolve, reject) => {
      loader.load(
        path,
        (texture) => {
          THREE.Cache.add(path, texture); // 🔥 lưu vào cache
          resolve();
        },
        undefined,
        () => reject(`Failed to load ${path}`)
      );
    });
  });
  return Promise.all(promises);
};

// Bây giờ file này chỉ export duy nhất một component
export const GameManagerProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [sceneState, setSceneState] = useState<SceneState>({ name: "menu" });
  const [score, setScore] = useState(0);
  const [isSolarSystemLoaded, setIsSolarSystemLoaded] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const setScene = (name: SceneType, params?: Record<string, unknown>) => {
    setSceneState({ name, params });
  };
  const preloadSolarSystem = useCallback(async () => {
    if (isSolarSystemLoaded) return;

    console.log("Starting Solar System preload...");

    const texturePaths = planetData
      .flatMap((p) => [p.texture, p.ringTexture, p.ringAlphaMap]) // Đã thêm lại uiThumbnail
      .filter((path): path is string => !!path);

    try {
      await preloadTextures(texturePaths);
      console.log("Solar System assets preloaded successfully!");
      setIsSolarSystemLoaded(true);
    } catch (error) {
      console.error("Failed to preload assets:", error);
    }
  }, [isSolarSystemLoaded]);
  useEffect(() => {
    // Theo dõi tiến trình tải toàn cục
    THREE.DefaultLoadingManager.onProgress = (url, loaded, total) => {
      const percent = Math.floor((loaded / total) * 100);
      setLoadingProgress(percent);
    };

    THREE.DefaultLoadingManager.onError = (url) => {
      console.warn("❌ Error loading:", url);
    };
  }, []);

  // FIX: TỰ ĐỘNG TẢI TRƯỚC KHI APP VỪA MỞ
  useEffect(() => {
    // Hook này chỉ chạy một lần duy nhất khi GameManagerProvider được mount
    console.log("GameManager mounted. Starting background preload...");
    preloadSolarSystem();
  }, [preloadSolarSystem]); // Dependency để đảm bảo hàm được gọi đúng

  const value: GameContextType = {
    scene: sceneState.name,
    setScene,
    sceneParams: sceneState.params,
    score,
    setScore,
    isSolarSystemLoaded,
    preloadSolarSystem,
    loadingProgress,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
