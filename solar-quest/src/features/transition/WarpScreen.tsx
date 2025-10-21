import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef, useEffect, useState } from "react";
import "../../styles/warp.css";
import ShinyText from "../../ui/ShinyText";
import { useGameManager } from "@/core/engine/GameContext";

function WarpTunnel({
  onAnimationComplete,
}: {
  onAnimationComplete: () => void;
}) {
  const pointsRef = useRef<THREE.Points>(null!);
  const { camera } = useThree();
  const speed = 50;

  const positions = useMemo(() => {
    const starCount = 800;
    const pos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 400;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 400;
      pos[i * 3 + 2] = Math.random() * -800;
    }
    return pos;
  }, []);

  useEffect(() => {
    const minAnimationTimer = setTimeout(() => {
      onAnimationComplete();
    }, 5000); // 5 giây
    return () => clearTimeout(minAnimationTimer);
  }, [onAnimationComplete]);

  useFrame((_, delta) => {
    camera.position.z -= delta * speed;
    if (camera.position.z < -800) camera.position.z = 0;
  });

  return (
    <Points
      ref={pointsRef}
      positions={positions}
      stride={3}
      frustumCulled={false}
    >
      <PointMaterial
        transparent
        color="#ffffff"
        size={1.5}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </Points>
  );
}

export default function WarpScreen() {
  const { setScene, isSolarSystemLoaded, preloadSolarSystem, loadingProgress } =
    useGameManager();
  const [isAnimationDone, setIsAnimationDone] = useState(false);

  useEffect(() => {
    preloadSolarSystem();
    // Logic chuyển cảnh: chỉ chạy khi cả 2 điều kiện đều đúng
    if (isSolarSystemLoaded && isAnimationDone) {
      // FIX 3: Chuyển đến đúng scene hệ mặt trời
      setScene("solar_system");
    }
  }, [isSolarSystemLoaded, isAnimationDone, preloadSolarSystem, setScene]);

  return (
    <div className="warp-container">
      <Canvas camera={{ position: [0, 0, 0], fov: 75 }}>
        <WarpTunnel onAnimationComplete={() => setIsAnimationDone(true)} />
        {/* XÓA: Không cần PreloadManager và Suspense nữa */}
      </Canvas>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white/90 drop-shadow-lg">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-wider">
            Entering hyperspace
          </h2>
          <ShinyText
            // FIX 4: Thay đổi text dựa trên isSolarSystemLoaded
            text={
              isSolarSystemLoaded
                ? "ARRIVAL IMMINENT"
                : "CALCULATING JUMP... ${loadingProgress}%"
            }
            disabled={false}
            speed={5}
            className="text-2xl font-bold mt-4"
          />
          <div className="mt-6 w-64 h-2 bg-white/20 rounded-full overflow-hidden mx-auto">
            <div
              className="h-full bg-gradient-to-r from-blue-400 to-cyan-300 transition-all duration-200"
              style={{ width: `${loadingProgress}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
