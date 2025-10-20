import React, { useRef, useEffect, type JSX } from "react";
import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// FIX: Sử dụng `type` và toán tử giao `&` để kết hợp các kiểu dữ liệu
type SaturnModelProps = JSX.IntrinsicElements["group"] & {
  speed: number;
  distance: number;
};

export function SaturnModel({ speed, distance, ...props }: SaturnModelProps) {
  const modelRef = useRef<THREE.Group>(null!);

  // Tải model GLB từ thư mục public
  const { scene } = useGLTF("/models/saturn.glb");

  // Clone scene để tránh thay đổi model gốc và có thể dùng lại
  const clonedScene = React.useMemo(() => scene.clone(), [scene]);

  // Bật đổ bóng cho tất cả các mesh con bên trong model
  useEffect(() => {
    clonedScene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
  }, [clonedScene]);

  // Vòng lặp animation để cho model quay quanh mặt trời
  useFrame(({ clock }) => {
    if (modelRef.current) {
      const elapsedTime = clock.getElapsedTime();
      const angle = elapsedTime * speed;
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      modelRef.current.position.set(x, 0, z);
      modelRef.current.rotation.y += 0.001; // Tự quay quanh trục
    }
  });

  // Render model bằng <primitive>
  return <primitive ref={modelRef} object={clonedScene} {...props} />;
}

// Preload model để trình duyệt bắt đầu tải trước, giúp hiển thị nhanh hơn
useGLTF.preload("/models/saturn.glb");
