import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
// Thêm Suspense
import { useMemo, useRef, useEffect, useState, Suspense } from "react";
import "../../styles/warp.css";
import ShinyText from "../../ui/ShinyText";
import { useGameManager } from "@/core/engine/GameManager";
// Import component PreloadManager mới
import PreloadManager from "@/core/engine/PreloadManager";

function WarpTunnel({
  onAnimationComplete,
}: {
  onAnimationComplete: () => void;
}) {
  const pointsRef = useRef<THREE.Points>(null!);
  const { camera } = useThree();
  const speed = 50;

  // Tạo vị trí ngẫu nhiên cho các ngôi sao
  const positions = useMemo(() => {
    const starCount = 800;
    const pos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 400;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 400;
      pos[i * 3 + 2] = Math.random() * -800; // trước camera
    }
    return pos;
  }, []);

  useEffect(() => {
    // Đặt một bộ đếm thời gian tối thiểu cho hiệu ứng (ví dụ: 5 giây)
    // để đảm bảo hiệu ứng không kết thúc quá nhanh ngay cả khi tải xong sớm.
    const minAnimationTimer = setTimeout(() => {
      onAnimationComplete();
    }, 5000); // 5 giây

    return () => clearTimeout(minAnimationTimer);
  }, [onAnimationComplete]);

  useFrame((_, delta) => {
    // Camera lao về phía trước
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
  const { setScene, isPlanetSceneReady, setPlanetSceneReady } =
    useGameManager();
  const [isAnimationDone, setIsAnimationDone] = useState(false);

  // Reset trạng thái sẵn sàng khi vào màn warp
  useEffect(() => {
    setPlanetSceneReady(false);
  }, [setPlanetSceneReady]);

  // Logic chuyển cảnh không đổi
  useEffect(() => {
    if (isPlanetSceneReady && isAnimationDone) {
      setScene("planetdetail");
    }
  }, [isPlanetSceneReady, isAnimationDone, setScene]);

  return (
    <div className="warp-container">
      <Canvas camera={{ position: [0, 0, 0], fov: 75 }}>
        <WarpTunnel onAnimationComplete={() => setIsAnimationDone(true)} />
        {/* 
          Sử dụng Suspense để render PreloadManager.
          Nó sẽ "treo" ở đây cho đến khi tất cả texture được tải xong.
        */}
        <Suspense fallback={null}>
          <PreloadManager />
        </Suspense>
      </Canvas>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white/90 drop-shadow-lg">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-wider">
            Entering hyperspace
          </h2>
          <ShinyText
            text={
              isPlanetSceneReady ? "ARRIVAL IMMINENT" : "CALCULATING JUMP..."
            }
            disabled={false}
            speed={5}
            className="text-2xl font-bold mt-4"
          />
        </div>
      </div>
    </div>
  );
}
