import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function AsteroidBelt() {
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null!);
  const count = 2000; // Số lượng tiểu hành tinh

  // Tạo dữ liệu vị trí, quay và tốc độ cho mỗi tiểu hành tinh chỉ một lần
  const asteroids = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      // Vị trí trong một vành đai giữa Sao Hỏa và Sao Mộc
      const angle = Math.random() * Math.PI * 2;
      const radius = 45 + Math.random() * 10; // Khoảng cách từ 45 đến 55
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      const y = (Math.random() - 0.5) * 2; // Độ dày của vành đai

      // Tốc độ quỹ đạo ngẫu nhiên
      const speed = 0.01 + Math.random() * 0.02;

      temp.push({ position: new THREE.Vector3(x, y, z), speed });
    }
    return temp;
  }, []);

  // Cập nhật vị trí của các tiểu hành tinh trong mỗi khung hình
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    asteroids.forEach((asteroid, i) => {
      const { position, speed } = asteroid;
      const dummy = new THREE.Object3D();

      // Quỹ đạo quanh mặt trời
      const angle = time * speed;
      dummy.position.set(
        Math.cos(angle) * position.length(),
        position.y,
        Math.sin(angle) * position.length()
      );

      // Tự quay
      dummy.rotation.set(time * 0.1, time * 0.2, time * 0.3);
      dummy.updateMatrix();

      instancedMeshRef.current.setMatrixAt(i, dummy.matrix);
    });
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={instancedMeshRef} args={[undefined, undefined, count]}>
      {/* Sử dụng hình khối đa diện đơn giản cho tiểu hành tinh */}
      <icosahedronGeometry args={[0.1, 0]} />
      <meshStandardMaterial color="#888888" roughness={0.8} />
    </instancedMesh>
  );
}
