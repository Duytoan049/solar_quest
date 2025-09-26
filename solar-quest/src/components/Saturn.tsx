import React from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";
import { Mesh } from "three";

export default function Saturn({
  position = [0, 0, 0],
}: {
  position: [number, number, number];
}) {
  const surfaceTexture = useLoader(
    TextureLoader,
    "public/textures/Saturno.jpeg"
  );
  const ringTexture = useLoader(
    TextureLoader,
    "public/textures/saturn_ring_alpha.png"
  );

  return (
    <group position={position}>
      {/* Planet Sphere */}
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial map={surfaceTexture} />
      </mesh>

      {/* Saturn's Rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.5, 2.5, 32]} />
        <meshBasicMaterial map={ringTexture} side={2} transparent />
      </mesh>
    </group>
  );
}
