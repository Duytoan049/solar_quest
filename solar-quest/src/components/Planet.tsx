import React from "react";
import { useLoader } from "@react-three/fiber";
import { TextureLoader } from "three";

interface PlanetProps {
  textureUrl: string;
  position: [number, number, number];
  size: number;
}

export default function Planet({ textureUrl, position, size }: PlanetProps) {
  const texture = useLoader(TextureLoader, textureUrl);

  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}
