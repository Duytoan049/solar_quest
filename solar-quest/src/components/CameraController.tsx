// CameraController.tsx
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function CameraController({
  targetPosition,
}: {
  targetPosition: [number, number, number] | null;
}) {
  const { camera } = useThree();

  useFrame(() => {
    if (targetPosition) {
      const currentPos = camera.position;
      const target = new THREE.Vector3(...targetPosition);

      if (currentPos.distanceTo(target) < 0.1) return;

      const newPos = new THREE.Vector3().lerpVectors(currentPos, target, 0.05);
      camera.position.set(newPos.x, newPos.y, newPos.z);
      camera.lookAt(target);
    }
  });

  return null;
}
