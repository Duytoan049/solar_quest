import React, { useState, Suspense, useRef, useEffect, useMemo } from "react"; // Thêm Suspense
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber"; // Thêm useLoader
import * as THREE from "three";
import { useGameManager } from "../core/engine/GameContext";
import { OrbitControls, Stars, Ring } from "@react-three/drei";
import { planets as planetData } from "./planets";
import PlanetMenu from "./PlanetMenu";
import Planet from "./Planet";
import Sun from "./Sun";
import AsteroidBelt from "./AsteroidBelt"; // <-- Import Vành đai Tiểu hành tinh
import PlanetInfoPanel from "./PlanetInfoPanel";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

// This type is now simpler as position is calculated dynamically
export type PlanetData = (typeof planetData)[0];

// FIX 1: Định nghĩa và export PlanetProps tại đây
export interface PlanetProps {
  planetData: PlanetData;
  onSelect: (planet: PlanetData) => void;
  onHover: (planet: PlanetData | null) => void;
  isSelected: boolean;
  isHovered: boolean;
  earthPositionRef?: React.MutableRefObject<THREE.Vector3>;
  onPositionUpdate: (position: THREE.Vector3) => void;
}

interface SceneContentProps {
  selectedPlanet: PlanetData | null;
  isManualCamera: boolean;
  setIsManualCamera: React.Dispatch<React.SetStateAction<boolean>>;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  earthPosition: React.MutableRefObject<THREE.Vector3>;
  handlePlanetSelect: (planet: PlanetData) => void;
  setHoveredPlanet: React.Dispatch<React.SetStateAction<PlanetData | null>>;
  hoveredPlanet: PlanetData | null;
  // FIX 1: Dùng một ref để lưu trữ các ref của hành tinh, thay vì state
  planetRefs: React.MutableRefObject<Record<string, THREE.Group>>;
}

function SceneContent({
  selectedPlanet,
  isManualCamera,
  setIsManualCamera,
  controlsRef,
  earthPosition,
  handlePlanetSelect,
  setHoveredPlanet,
  hoveredPlanet,
  planetRefs, // <-- Nhận ref
}: SceneContentProps) {
  useFrame((state) => {
    if (!isManualCamera && selectedPlanet && controlsRef.current) {
      const controls = controlsRef.current;
      const camera = state.camera;

      // FIX 2: Lấy vị trí trực tiếp từ ref của đối tượng 3D
      const planetObject = planetRefs.current[selectedPlanet.name];
      if (!planetObject) return;

      const planetPosition = new THREE.Vector3();
      planetObject.getWorldPosition(planetPosition); // Lấy vị trí toàn cục

      const offsetDistance = (selectedPlanet.radius || 1) * 4 + 2;
      const targetCameraPosition = new THREE.Vector3()
        .copy(planetPosition)
        .add(new THREE.Vector3(0, 3, offsetDistance));

      camera.position.lerp(targetCameraPosition, 0.05);
      controls.target.lerp(planetPosition, 0.05);

      const distance = camera.position.distanceTo(targetCameraPosition);
      if (distance < 0.1) {
        setIsManualCamera(true);
      }
    }
  });

  const sunRef = useRef<THREE.Mesh>(null!);

  return (
    <>
      <ambientLight intensity={2.5} />
      {/* TẮT ĐỔ BÓNG: castShadow là một trong những thứ nặng nhất */}
      <directionalLight position={[10, 20, 10]} intensity={3} color="#ffffff" />
      <pointLight
        castShadow={false} // <-- TẮT ĐỔ BÓNG
        position={new THREE.Vector3(0, 0, 0)}
        intensity={3000} // Giảm intensity vì không còn đổ bóng
        distance={1500}
        decay={2}
      />
      {/* THÊM TINH VÂN MỚI
      <NebulaSkybox /> */}
      <Stars
        radius={300}
        depth={50}
        count={1500}
        factor={6}
        saturation={1}
        fade
        speed={0.5}
      />
      <SpaceDust />
      {/* === SỬA LỖI VÀ VẼ LẠI CÁC ĐƯỜNG QUỸ ĐẠO === */}
      {planetData.map(
        (planet) =>
          planet.distance > 0 &&
          !planet.isMoon && (
            // Sử dụng <Ring> để tạo một đường kẻ mỏng
            <Ring
              key={`orbit_${planet.name}`}
              args={[
                planet.distance - 0.05, // Bán kính trong (gần bằng bán kính ngoài)
                planet.distance + 0.05, // Bán kính ngoài
                128, // Tăng số đoạn để vòng tròn siêu mịn
              ]}
              rotation-x={-Math.PI / 2}
            >
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.2} // Điều chỉnh độ mờ
                side={THREE.DoubleSide}
              />
            </Ring>
          )
      )}
      {/* === KẾT THÚC PHẦN SỬA LỖI === */}
      <Suspense fallback={null}>
        {/* THÊM VÀNH ĐAI TIỂU HÀNH TINH */}
        {/* <AsteroidBelt /> */}

        {planetData.map((planet) => {
          if (planet.name === "Sun") {
            return (
              <Sun
                key={planet.name}
                planetData={planet}
                sunRef={sunRef}
                onSelect={handlePlanetSelect}
                onHover={setHoveredPlanet}
                isSelected={selectedPlanet?.name === planet.name}
                isHovered={hoveredPlanet?.name === planet.name}
              />
            );
          }
          return (
            <Planet
              key={planet.name}
              planetData={planet}
              onSelect={handlePlanetSelect}
              onHover={setHoveredPlanet}
              isSelected={selectedPlanet?.name === planet.name}
              isHovered={hoveredPlanet?.name === planet.name}
              // FIX: Truyền earthPosition ref cho cả Trái Đất và Mặt Trăng
              earthPositionRef={
                planet.name === "Earth" || planet.isMoon
                  ? earthPosition
                  : undefined
              }
              onPositionUpdate={(position) => {
                console.log(`Position updated for ${planet.name}:`, position);
              }}
              ref={(el) => {
                if (el) planetRefs.current[planet.name] = el;
              }}
            />
          );
        })}
      </Suspense>
      <OrbitControls
        ref={controlsRef}
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        enableDamping={true}
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={200} // Increased max distance for better overview
      />
      {/* Post-processing Effects */}
      {sunRef.current && (
        <EffectComposer>
          {/* HIỆU CHỈNH LẠI BLOOM ĐỂ CÓ HÀO QUANG */}
          <Bloom
            intensity={0.6} // Tăng lại cường độ để vầng sáng rõ hơn
            luminanceThreshold={0.1} // Giảm nhẹ ngưỡng để "bắt" được ánh sáng của Sun
            luminanceSmoothing={0.2}
            width={512}
            height={300}
          />

          {/* Vẫn vô hiệu hóa GodRays để đảm bảo hiệu suất */}
          {/* <GodRays ... /> */}

          <Vignette eskil={false} offset={0.1} darkness={1.1} />
        </EffectComposer>
      )}
    </>
  );
}

// Component mới cho Tinh vân
// function NebulaSkybox() {
//   const texture = useLoader(
//     THREE.TextureLoader,
//     "src/assets/textures/nebula.jpg"
//   );
//   return (
//     <mesh position={[0, 0, -400]} scale={[800, 400, 1]}>
//       <planeGeometry args={[1, 1]} />
//       <meshBasicMaterial
//         map={texture}
//         transparent
//         opacity={0.3}
//         blending={THREE.AdditiveBlending}
//         depthWrite={false} // Không ảnh hưởng đến các vật thể khác
//       />
//     </mesh>
//   );
// }

// Component mới cho Bụi không gian
function SpaceDust() {
  const count = 5000;
  const positions = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 500; // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 500; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 500; // z
    }
    return positions;
  }, [count]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#ffffff" transparent opacity={0.5} />
    </points>
  );
}

export default function PlanetScene() {
  const { setScene } = useGameManager();
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetData | null>(null);
  const [isManualCamera, setIsManualCamera] = useState(true);

  // FIX 4: Khởi tạo ref để chứa các ref của hành tinh
  const planetRefs = useRef<Record<string, THREE.Group>>({});

  const earthPosition = React.useRef(new THREE.Vector3());
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const handlePlanetSelect = (planet: PlanetData) => {
    setSelectedPlanet(planet);
    setIsManualCamera(false);
  };

  const handleStartMission = () => {
    setScene("game");
  };

  const handleClosePanel = () => {
    setSelectedPlanet(null);
    setIsManualCamera(true);
  };

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const onManualControlStart = () => {
      setIsManualCamera(true);
    };

    controls.addEventListener("start", onManualControlStart);
    return () => {
      controls.removeEventListener("start", onManualControlStart);
    };
  }, [controlsRef.current]); // Dependency updated for reliability

  return (
    <div className="w-full h-screen bg-black relative font-sans">
      <PlanetMenu
        onSelectPlanet={(planetName: string) => {
          const planet = planetData.find((p) => p.name === planetName);
          if (planet) {
            handlePlanetSelect(planet);
          }
        }}
      />

      <PlanetInfoPanel
        planet={selectedPlanet}
        onClose={handleClosePanel}
        onStartMission={handleStartMission}
      />

      <Canvas
        camera={{ position: [0, 25, 80], fov: 60 }} // Adjusted initial camera
        className="relative"
        // shadows
      >
        <SceneContent
          selectedPlanet={selectedPlanet}
          isManualCamera={isManualCamera}
          setIsManualCamera={setIsManualCamera}
          controlsRef={controlsRef}
          earthPosition={earthPosition}
          handlePlanetSelect={handlePlanetSelect}
          setHoveredPlanet={setHoveredPlanet}
          hoveredPlanet={hoveredPlanet}
          // FIX 5: Truyền ref xuống
          planetRefs={planetRefs}
        />
      </Canvas>
    </div>
  );
}
