import { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import type { PlanetData } from "./PlanetScene1";

// --- SHADER SIÊU NHẸ CHO MẶT TRỜI ---
const sunVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Shader này vẫn nhẹ, nhưng được tăng cường để trông "rực cháy" hơn.
const sunFragmentShader = `
  uniform float uTime;
  uniform sampler2D uTexture;
  varying vec2 vUv;

  void main() {
    // Tạo 2 lớp UV cuộn theo 2 hướng khác nhau với tốc độ khác nhau
    vec2 uv1 = vUv;
    uv1.x += uTime * 0.015;

    vec2 uv2 = vUv;
    uv2.y += uTime * 0.025;

    // Lấy màu từ texture với 2 lớp UV
    vec4 color1 = texture2D(uTexture, uv1);
    vec4 color2 = texture2D(uTexture, uv2);

    // Trộn 2 lớp màu lại với nhau
    vec4 finalColor = mix(color1, color2, 0.5);

    // TĂNG CƯỜNG HIỆU ỨNG RỰC CHÁY:
    // Tạo một hiệu ứng "sóng nhiệt" gợn sóng từ tâm ra
    float heatWave = sin(length(vUv - 0.5) * 10.0 - uTime * 1.5) * 0.5 + 0.5;
    // Làm cho các "sóng" này sáng hơn
    float brightness = heatWave * 0.6 + 0.3; // Tăng độ sáng cơ bản và cường độ sóng

    // Kết hợp màu gốc với độ sáng rực cháy
    gl_FragColor = finalColor + finalColor * brightness;
    gl_FragColor.a = 1.0; // Đảm bảo alpha là 1
  }
`;

interface SunProps {
  planetData: PlanetData;
  sunRef: React.RefObject<THREE.Mesh>;
}

export default function Sun({ planetData, sunRef }: SunProps) {
  const texture = useLoader(THREE.TextureLoader, planetData.texture);

  const material = useRef<THREE.ShaderMaterial>(null!);

  useFrame(({ clock }) => {
    if (material.current) {
      material.current.uniforms.uTime.value = clock.getElapsedTime();
    }
  });

  return (
    <mesh ref={sunRef} name={planetData.name}>
      <sphereGeometry args={[planetData.radius, 64, 64]} />
      <shaderMaterial
        ref={material}
        vertexShader={sunVertexShader}
        fragmentShader={sunFragmentShader}
        uniforms={{
          uTime: { value: 0 },
          uTexture: { value: texture },
        }}
      />
    </mesh>
  );
}
