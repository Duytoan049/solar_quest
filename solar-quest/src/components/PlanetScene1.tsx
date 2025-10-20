import React, { useState, Suspense, useRef, useEffect, useMemo } from "react"; // Thêm Suspense
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber"; // Thêm useLoader
import * as THREE from "three";
import { useGameManager } from "../core/engine/GameManager";
import { OrbitControls, Stars, Ring } from "@react-three/drei";
import { planets as planetData } from "./planets";
import PlanetMenu from "./PlanetMenu";
import Planet from "./Planet";
import Sun from "./Sun";
import AsteroidBelt from "./AsteroidBelt"; // <-- Import Vành đai Tiểu hành tinh
import PlanetInfoPanel from "./PlanetInfoPanel";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { SaturnModel } from "./SaturnModel"; // 1. Import component model mới

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
  planetPositions: Record<string, THREE.Vector3>; // Pass dynamic positions
  handlePositionUpdate: (name: string, pos: THREE.Vector3) => void; // Pass updater function
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
  planetPositions,
  handlePositionUpdate,
}: SceneContentProps) {
  useFrame((state) => {
    // Camera follow logic
    if (!isManualCamera && selectedPlanet && controlsRef.current) {
      const controls = controlsRef.current;
      const camera = state.camera;

      // FIX: Get the planet's current dynamic position from the state
      const planetPosition = planetPositions[selectedPlanet.name];
      if (!planetPosition) return; // Don't do anything if position is not yet available

      // FIX: Use 'radius' instead of 'size'
      const offsetDistance = (selectedPlanet.radius || 1) * 4 + 2;
      const targetCameraPosition = new THREE.Vector3()
        .copy(planetPosition)
        .add(new THREE.Vector3(0, 3, offsetDistance));

      // Smoothly move camera and target
      camera.position.lerp(targetCameraPosition, 0.05);
      controls.target.lerp(planetPosition, 0.05);

      // Switch to manual control once close enough
      const distance = camera.position.distanceTo(targetCameraPosition);
      if (distance < 0.1) {
        setIsManualCamera(true);
      }
    }
  });

  const sunPosition: [number, number, number] = [0, 0, 0];
  const sunRef = useRef<THREE.Mesh>(null!);

  // 2. Lấy dữ liệu của Sao Thổ từ mảng
  const saturnData = useMemo(
    () => planetData.find((p) => p.name === "Saturn"),
    []
  );

  return (
    <>
      <ambientLight intensity={2.5} />
      {/* TẮT ĐỔ BÓNG: castShadow là một trong những thứ nặng nhất */}
      <directionalLight position={[10, 20, 10]} intensity={3} color="#ffffff" />
      <pointLight
        castShadow={false} // <-- TẮT ĐỔ BÓNG
        position={new THREE.Vector3(...sunPosition)}
        intensity={3000} // Giảm intensity vì không còn đổ bóng
        distance={1500}
        decay={2}
      />
      {/* THÊM TINH VÂN MỚI
      <NebulaSkybox /> */}
      <Stars
        radius={300}
        depth={50}
        count={2500}
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
                planet.distance - 0.1, // Bán kính trong (gần bằng bán kính ngoài)
                planet.distance + 0.1, // Bán kính ngoài
                256, // Tăng số đoạn để vòng tròn siêu mịn
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
        <AsteroidBelt />

        {planetData.map((planet) => {
          // Render component Sun đặc biệt cho Mặt Trời
          if (planet.name === "Sun") {
            return (
              <Sun key={planet.name} planetData={planet} sunRef={sunRef} />
            );
          }
          // Render các hành tinh khác như bình thường
          return (
            <Planet
              key={planet.name}
              planetData={planet}
              onSelect={handlePlanetSelect}
              onHover={setHoveredPlanet}
              isSelected={selectedPlanet?.name === planet.name}
              isHovered={hoveredPlanet?.name === planet.name}
              earthPositionRef={planet.isMoon ? earthPosition : undefined}
              onPositionUpdate={(pos: THREE.Vector3) => {
                handlePositionUpdate(planet.name, pos);
                if (planet.name === "Earth") {
                  earthPosition.current.copy(pos);
                }
              }}
            />
          );
        })}

        {/* 4. Render model GLB của Sao Thổ */}
        {saturnData && (
          <Suspense fallback={null}>
            <SaturnModel
              {...{
                scale: 0.1, // Điều chỉnh scale cho phù hợp với scene của bạn
                speed: saturnData.speed,
                distance: saturnData.distance,
                onClick: (e: ThreeEvent<PointerEvent>) => {
                  e.stopPropagation();
                  handlePlanetSelect(saturnData);
                },
                onPointerOver: (e: ThreeEvent<PointerEvent>) => {
                  e.stopPropagation();
                  setHoveredPlanet(saturnData);
                },
                onPointerOut: () => setHoveredPlanet(null),
              }}
            />
          </Suspense>
        )}
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
            intensity={1.5} // Tăng lại cường độ để vầng sáng rõ hơn
            luminanceThreshold={0.65} // Giảm nhẹ ngưỡng để "bắt" được ánh sáng của Sun
            luminanceSmoothing={0.5}
            width={512}
            height={512}
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
  const count = 10000;
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
  // State to store the dynamic positions of all planets
  const [planetPositions, setPlanetPositions] = useState<
    Record<string, THREE.Vector3>
  >({});

  const earthPosition = React.useRef(new THREE.Vector3());
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const handlePlanetSelect = (planet: PlanetData) => {
    setSelectedPlanet(planet);
    setIsManualCamera(false); // Trigger the camera fly-to animation
  };

  // Function to receive position updates from child Planet components
  const handlePositionUpdate = (name: string, pos: THREE.Vector3) => {
    setPlanetPositions((prev) => ({ ...prev, [name]: pos.clone() }));
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
        shadows
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
          planetPositions={planetPositions} // Pass positions down
          handlePositionUpdate={handlePositionUpdate} // Pass updater down
        />
      </Canvas>
    </div>
  );
}
