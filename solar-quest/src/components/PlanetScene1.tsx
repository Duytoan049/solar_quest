import React, { useState, useRef, useEffect, useMemo } from "react"; // Xóa Suspense khỏi import
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
  planetRefs,
  onLoadingComplete, // Thêm prop để báo khi load xong
}: SceneContentProps & { onLoadingComplete: () => void }) {
  const sunRef = useRef<THREE.Mesh>(null!);
  const [visiblePlanets, setVisiblePlanets] =
    useState<PlanetData[]>(planetData); // Load tất cả ngay lập tức

  // Load tất cả planets ngay lập tức thay vì lazy load
  useEffect(() => {
    // Đợi một chút để canvas render xong, sau đó tắt loading
    const timer = setTimeout(() => {
      onLoadingComplete();
    }, 100); // Chỉ 100ms thay vì hơn 2 giây

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame((state) => {
    if (!isManualCamera && selectedPlanet && controlsRef.current) {
      const controls = controlsRef.current;
      const camera = state.camera;
      const planetObject = planetRefs.current[selectedPlanet.name];
      if (!planetObject) return;

      const planetPosition = new THREE.Vector3();
      planetObject.getWorldPosition(planetPosition);

      const offsetDistance = (selectedPlanet.radius || 1) * 4 + 2;
      const targetCameraPosition = new THREE.Vector3()
        .copy(planetPosition)
        .add(new THREE.Vector3(0, 3, offsetDistance));

      camera.position.lerp(targetCameraPosition, 0.05);
      controls.target.lerp(planetPosition, 0.05);

      const distance = camera.position.distanceTo(targetCameraPosition);
      if (distance < 0.1) setIsManualCamera(true);
    }
  });

  return (
    <>
      <ambientLight intensity={2.5} />
      <directionalLight position={[10, 20, 10]} intensity={3} color="#ffffff" />
      <pointLight
        castShadow={false}
        position={new THREE.Vector3(0, 0, 0)}
        intensity={3000}
        distance={1500}
        decay={2}
      />

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

      {planetData.map(
        (planet) =>
          planet.distance > 0 &&
          !planet.isMoon && (
            <Ring
              key={`orbit_${planet.name}`}
              args={[planet.distance - 0.05, planet.distance + 0.05, 128]}
              rotation-x={-Math.PI / 2}
            >
              <meshBasicMaterial
                color="#ffffff"
                transparent
                opacity={0.2}
                side={THREE.DoubleSide}
              />
            </Ring>
          )
      )}

      {visiblePlanets
        .filter((planet): planet is PlanetData => !!planet) // đảm bảo không có undefined
        .map((planet, index) => {
          if (!planet) return null; // (phòng ngừa bổ sung)
          if (planet.name === "Sun") {
            return (
              <Sun
                key={`sun_${index}_${planet.name}`}
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
              key={`planet_${index}_${planet.name}`}
              planetData={planet}
              onSelect={handlePlanetSelect}
              onHover={setHoveredPlanet}
              isSelected={selectedPlanet?.name === planet.name}
              isHovered={hoveredPlanet?.name === planet.name}
              earthPositionRef={
                planet.name === "Earth" || planet.isMoon
                  ? earthPosition
                  : undefined
              }
              onPositionUpdate={() => {}}
              ref={(el) => {
                if (el) planetRefs.current[planet.name] = el;
              }}
            />
          );
        })}

      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        enableRotate
        enableDamping
        dampingFactor={0.05}
        minDistance={5}
        maxDistance={200}
      />

      {sunRef.current && (
        <EffectComposer>
          <Bloom
            intensity={0.6}
            luminanceThreshold={0.1}
            luminanceSmoothing={0.2}
            width={512}
            height={300}
          />
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
  const [isLoading, setIsLoading] = useState(true); // Thêm state loading

  // FIX 4: Khởi tạo ref để chứa các ref của hành tinh
  const planetRefs = useRef<Record<string, THREE.Group>>({});

  const earthPosition = React.useRef(new THREE.Vector3());
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  const handlePlanetSelect = (planet: PlanetData) => {
    setSelectedPlanet(planet);
    setIsManualCamera(false);
  };

  const handleStartMission = () => {
    if (selectedPlanet) {
      // Truyền planetId vào params
      setScene("game", { planetId: selectedPlanet.name.toLowerCase() });
    }
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

  const handleLoadingComplete = () => {
    setIsLoading(false); // Ẩn overlay khi load xong
  };

  return (
    <div className="w-full h-screen bg-black relative font-sans">
      {/* Overlay loading - Nhanh hơn */}
      {isLoading && (
        <div className="absolute inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-2 animate-pulse">
              Loading Solar System...
            </h2>
          </div>
        </div>
      )}
      {/* Bỏ "Warp Drive Complete" overlay để nhanh hơn */}

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

      <Canvas camera={{ position: [0, 25, 80], fov: 60 }} className="relative">
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
          onLoadingComplete={handleLoadingComplete} // Truyền callback
        />
      </Canvas>
    </div>
  );
}
