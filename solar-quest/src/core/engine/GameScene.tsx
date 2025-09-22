import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

export default function GameScene() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <OrbitControls />
      {/* Thêm Planet, PlayerShip… ở đây */}
    </Canvas>
  );
}
