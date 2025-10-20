import React, { useRef, useMemo } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { Ring } from "@react-three/drei";
// FIX 2: Import cả PlanetProps và PlanetData từ PlanetScene1
import type { PlanetProps, PlanetData } from "./PlanetScene1";

// --- SHADER CODE FOR ATMOSPHERE ---
const atmosphereVertexShader = `
  varying vec3 vNormal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const atmosphereFragmentShader = `
  varying vec3 vNormal;
  uniform vec3 glowColor; // <-- Sửa lại tên uniform cho khớp với code JS
  void main() {
    float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    gl_FragColor = vec4(glowColor, 1.0) * intensity;
  }
`;
// --- END SHADER CODE ---

const useConditionalLoader = <T,>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  loader: new (...args: any[]) => THREE.Loader<T>,
  path: string | undefined
) => {
  // Luôn gọi useLoader. Nếu path không tồn tại, truyền vào một mảng rỗng.
  // useLoader sẽ trả về một mảng các đối tượng đã tải.
  const loadedItems = useLoader(loader, path ? [path] : []);

  // Trả về đối tượng đầu tiên trong mảng nếu nó tồn tại, ngược lại trả về null.
  return loadedItems.length > 0 ? loadedItems[0] : null;
};

export default function Planet({
  planetData,
  onSelect,
  onHover,
  isSelected,
  isHovered,
  earthPositionRef,
  onPositionUpdate,
}: PlanetProps) {
  const meshRef = useRef<THREE.Group>(null!);
  const texture = useConditionalLoader(THREE.TextureLoader, planetData.texture);
  const ringTexture = useConditionalLoader(
    THREE.TextureLoader,
    planetData.ringTexture
  );
  const ringAlphaMap = useConditionalLoader(
    THREE.TextureLoader,
    planetData.ringAlphaMap
  );

  // FIX: Khai báo kiểu dữ liệu tường minh cho uniforms
  const uniforms = useMemo(
    () => ({
      glowColor: {
        value: new THREE.Color(planetData.atmosphereColor || "white"),
      },
    }),
    [planetData.atmosphereColor]
  );

  const atmosphereMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: atmosphereVertexShader,
        fragmentShader: atmosphereFragmentShader,
        uniforms: uniforms, // <-- Truyền đối tượng uniforms đã được định kiểu
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        transparent: true,
      }),
    [uniforms] // Phụ thuộc vào uniforms
  );

  // Animation loop
  useFrame(({ clock }) => {
    if (!meshRef.current) return; // Thêm kiểm tra an toàn

    const elapsedTime = clock.getElapsedTime();
    const speed = planetData.speed;
    const orbitRadius = planetData.distance;

    if (planetData.isMoon && earthPositionRef?.current) {
      const moonOrbitRadius = planetData.distance;
      const moonX = Math.cos(elapsedTime * speed) * moonOrbitRadius;
      const moonZ = Math.sin(elapsedTime * speed) * moonOrbitRadius;

      meshRef.current.position.set(
        earthPositionRef.current.x + moonX,
        earthPositionRef.current.y,
        earthPositionRef.current.z + moonZ
      );
    } else {
      meshRef.current.position.x = Math.cos(elapsedTime * speed) * orbitRadius;
      meshRef.current.position.z = Math.sin(elapsedTime * speed) * orbitRadius;
    }

    meshRef.current.rotation.y += 0.002;

    // FIX 4: Xóa bỏ optional chaining vì onPositionUpdate là bắt buộc
    onPositionUpdate(meshRef.current.position);
  });
  if (!texture) return null;
  return (
    <group
      ref={meshRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(planetData);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(planetData);
      }}
      onPointerOut={() => onHover(null)}
    >
      <mesh castShadow>
        <sphereGeometry args={[planetData.radius, 64, 64]} />
        <meshStandardMaterial
          map={texture}
          metalness={0.1}
          roughness={0.9}
          emissive={isHovered || isSelected ? "#ffddaa" : "black"}
          emissiveIntensity={isHovered || isSelected ? 0.5 : 0}
        />
      </mesh>

      {/* Add atmosphere if the planet has one */}
      {planetData.hasAtmosphere && (
        <mesh scale={[1.1, 1.1, 1.1]}>
          <sphereGeometry args={[planetData.radius, 64, 64]} />
          <primitive object={atmosphereMaterial} />
        </mesh>
      )}

      {/* === NÂNG CẤP VÀNH ĐAI SAO THỔ === */}
      {/* FIX: Loại bỏ điều kiện ringTexture && ringAlphaMap */}
      {planetData.name === "Saturn" && (
        <mesh rotation-x={Math.PI / 2.5} receiveShadow>
          <ringGeometry args={[6, 10, 64]} />
          <meshStandardMaterial
            map={ringTexture} // Truyền thẳng, kể cả khi là null ban đầu
            alphaMap={ringAlphaMap} // Truyền thẳng, kể cả khi là null ban đầu
            transparent={true}
            side={THREE.DoubleSide}
            opacity={0.9}
          />
        </mesh>
      )}
      {/* === KẾT THÚC NÂNG CẤP VÀNH ĐAI === */}

      {/* <FeedbackCircle
        position={meshRef.current.position}
        isSelected={isSelected}
        isHovered={isHovered}
      /> */}
    </group>
  );
}
