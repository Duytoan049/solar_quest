import React from "react";
import { Html } from "@react-three/drei";

interface MarkerProps {
  id: number;
  label: string;
  position: [number, number, number];
  onSelect: (pos: [number, number, number]) => void;
}

export default function Marker({ id, label, position, onSelect }: MarkerProps) {
  return (
    <group>
      {/* Hình cầu nhỏ để click */}
      <mesh position={position} onClick={() => onSelect(position)}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="yellow" emissive="orange" />
      </mesh>

      {/* Nhãn số nổi phía trên */}
      <Html position={position} distanceFactor={10}>
        <div className="bg-black/70 text-white px-1 rounded text-xs cursor-pointer">
          {id}
        </div>
      </Html>
    </group>
  );
}
