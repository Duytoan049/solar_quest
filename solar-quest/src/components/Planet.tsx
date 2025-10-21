import React, { useRef, useMemo, forwardRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import type { PlanetProps } from "./PlanetScene1";
import { a, useSpring } from "@react-spring/three";

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
  uniform vec3 glowColor;
  void main() {
    float intensity = pow(0.6 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
    gl_FragColor = vec4(glowColor, 1.0) * intensity;
  }
`;

// --------------------------------------------------
// ⚙️ Sửa lại loader để dùng cache từ GameManager
// --------------------------------------------------
function useCachedTexture(path?: string) {
  // Luôn gọi useLoader, dù có path hay không
  const loaded = useLoader(THREE.TextureLoader, path ? [path] : []);

  // Texture nhận được (nếu path tồn tại)
  const texture = path ? loaded[0] : null;

  // Nếu preload đã thêm texture vào cache thì dùng luôn
  const cached = path ? THREE.Cache.get(path) : null;
  const finalTexture = cached || texture || null;

  // ⚡ Log để kiểm tra xem texture có được lấy từ cache không
  if (path) {
    console.log(
      `🔍 Texture check: ${path} →`,
      cached ? "✅ From cache" : "🆕 Loaded fresh"
    );
  }

  // Nếu texture vừa được tải, lưu lại vào cache
  if (path && texture && !cached) {
    THREE.Cache.add(path, texture);
  }

  return finalTexture;
}

// --------------------------------------------------

const Planet = forwardRef<THREE.Group, PlanetProps>(
  (
    { planetData, onSelect, onHover, isSelected, isHovered, earthPositionRef },
    ref
  ) => {
    const planetRef = useRef<THREE.Group>(null!);

    // ⚡ Dùng cache-aware loader cho toàn bộ texture
    const texture = useCachedTexture(planetData.texture);
    const ringTexture = useCachedTexture(planetData.ringTexture);
    const ringAlphaMap = useCachedTexture(planetData.ringAlphaMap);

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
          uniforms,
          side: THREE.BackSide,
          blending: THREE.AdditiveBlending,
          transparent: true,
        }),
      [uniforms]
    );

    const { scale, opacity } = useSpring({
      from: { scale: 0.3, opacity: 0 },
      to: { scale: 1, opacity: 1 },
      config: { tension: 120, friction: 18 },
      delay: 800, // delay chút để đồng bộ với fade overlay
    });

    useFrame(({ clock }) => {
      if (!planetRef.current) return;
      const elapsed = clock.getElapsedTime();
      const { speed, distance, isMoon } = planetData;

      if (isMoon && earthPositionRef?.current) {
        const moonX = Math.cos(elapsed * speed) * distance;
        const moonZ = Math.sin(elapsed * speed) * distance;
        planetRef.current.position.set(
          earthPositionRef.current.x + moonX,
          earthPositionRef.current.y,
          earthPositionRef.current.z + moonZ
        );
      } else {
        planetRef.current.position.x = Math.cos(elapsed * speed) * distance;
        planetRef.current.position.z = Math.sin(elapsed * speed) * distance;
      }

      if (planetData.name === "Earth" && earthPositionRef) {
        earthPositionRef.current.copy(planetRef.current.position);
      }

      planetRef.current.rotation.y += 0.002;
    });

    if (!texture) return null;

    return (
      <a.group
        // dùng group động (animated group)
        ref={(node) => {
          planetRef.current = node!;
          if (typeof ref === "function") ref(node);
          else if (ref) ref.current = node;
        }}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(planetData);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(planetData);
        }}
        onPointerOut={() => onHover(null)}
        scale={scale.to((s) => [s, s, s])}
      >
        {/* Planet */}
        <a.mesh>
          <sphereGeometry args={[planetData.radius, 32, 32]} />
          <a.meshStandardMaterial
            map={texture}
            transparent
            opacity={opacity}
            metalness={0.1}
            roughness={0.9}
            emissive={isHovered || isSelected ? "#ffddaa" : "black"}
            emissiveIntensity={isHovered || isSelected ? 0.5 : 0}
          />
        </a.mesh>

        {/* Atmosphere */}
        {planetData.hasAtmosphere && (
          <a.mesh scale={[1.1, 1.1, 1.1]}>
            <sphereGeometry args={[planetData.radius, 32, 32]} />
            <primitive object={atmosphereMaterial} />
          </a.mesh>
        )}

        {/* Saturn Rings */}
        {planetData.name === "Saturn" && ringTexture && ringAlphaMap && (
          <group rotation-x={Math.PI / 2.5}>
            {[
              [11, 16],
              [17, 20],
            ].map(([inner, outer], i) => (
              <a.mesh key={i}>
                <ringGeometry args={[inner, outer, 128]} />
                <a.meshStandardMaterial
                  map={ringTexture}
                  alphaMap={ringAlphaMap}
                  transparent
                  side={THREE.DoubleSide}
                  depthWrite={false}
                  opacity={opacity.to((o) => Math.min(o, 1))}
                  emissive={isHovered || isSelected ? "#ffddaa" : "black"}
                  emissiveIntensity={isHovered || isSelected ? 0.5 : 0}
                />
              </a.mesh>
            ))}
          </group>
        )}
      </a.group>
    );
  }
);

export default Planet;
