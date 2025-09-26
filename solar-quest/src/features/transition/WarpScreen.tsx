import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useMemo, useRef, useEffect } from "react";
import "../../styles/warp.css";
import ShinyText from "../../ui/ShinyText";
import { useGameManager } from "@/core/engine/GameManager";
function WarpTunnel({ speed = 50 }) {
  const pointsRef = useRef<THREE.Points>(null!);
  const { camera } = useThree();
  const { setScene } = useGameManager();
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
    const timer = setTimeout(() => setScene("planetdetail"), 7000);
    return () => clearTimeout(timer);
  }, []);

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
  return (
    <div className="warp-container">
      <Canvas camera={{ position: [0, 0, 0], fov: 75 }}>
        <WarpTunnel />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white/90 drop-shadow-lg">
          <h2 className="text-3xl md:text-5xl font-semibold tracking-wider">
            Entering hyperspace
          </h2>
          <ShinyText
            text="LOADING SCENE"
            disabled={false}
            speed={5}
            className="text-2xl font-bold mt-4"
          />
        </div>
      </div>
    </div>
  );
}
