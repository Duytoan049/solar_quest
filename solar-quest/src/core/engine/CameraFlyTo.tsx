import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function CameraFlyTo({
  target,
}: {
  target: [number, number, number] | null;
}) {
  const { camera } = useThree();

  useFrame(() => {
    if (!target) return;
    const current = camera.position;
    const dest = new THREE.Vector3(...target).multiplyScalar(2); // đứng xa marker
    const next = new THREE.Vector3().lerpVectors(current, dest, 0.05);
    camera.position.copy(next);
    camera.lookAt(...target);
  });

  return null;
}
