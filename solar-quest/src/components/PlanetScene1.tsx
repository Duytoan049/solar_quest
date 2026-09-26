import React, { useState, useRef, useEffect, useMemo } from "react"; // Xóa Suspense khỏi import
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber"; // Thêm useLoader
import * as THREE from "three";
import { useTranslation } from "react-i18next";
import { useGameManager } from "../core/engine/GameContext";
import { useAudio } from "@/hooks/useAudio";
import { OrbitControls, Stars, Ring } from "@react-three/drei";
import { planets as planetData } from "./planets";
import PlanetMenu from "./PlanetMenu";
import Planet from "./Planet";
import Sun from "./Sun";
import AsteroidBelt from "./AsteroidBelt"; // <-- Import Vành đai Tiểu hành tinh
import PlanetInfoPanel from "./PlanetInfoPanel";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Activity, ArrowLeft, Crosshair, MousePointer2, Orbit, Radio, ScanLine } from "lucide-react";
import AudioSettings from "@/components/AudioSettings";

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
  const { t } = useTranslation();
  const { setScene, sceneParams } = useGameManager();
  const { play, playMusic, stopMusic } = useAudio();
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetData | null>(null);
  const [isManualCamera, setIsManualCamera] = useState(true);
  const [isLoading, setIsLoading] = useState(true); // Thêm state loading

  // FIX 4: Khởi tạo ref để chứa các ref của hành tinh
  const planetRefs = useRef<Record<string, THREE.Group>>({});

  const earthPosition = React.useRef(new THREE.Vector3());
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  // Play solar system music on mount
  useEffect(() => {
    playMusic("solar-system", true);

    return () => {
      stopMusic(true);
    };
  }, [playMusic, stopMusic]);

  const handlePlanetSelect = (planet: PlanetData) => {
    play("click", { category: "ui" });
    setSelectedPlanet(planet);
    setIsManualCamera(false);
  };

  const handleStartMission = () => {
    if (selectedPlanet) {
      play("transition", { category: "ui" });
      // Truyền planetId vào params và giữ lại guestMode nếu có
      setScene("game", {
        planetId: selectedPlanet.name.toLowerCase(),
        ...(sceneParams?.guestMode ? { guestMode: true } : {}),
      });
    }
  };

  const handleClosePanel = () => {
    play("click", { category: "ui" });
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
    <div className="relative h-screen w-full overflow-hidden bg-[#03050a] font-sans text-white">
      <div className="pointer-events-none absolute inset-0 z-[2] bg-[radial-gradient(circle_at_50%_46%,rgba(103,232,249,0.055),transparent_27%),linear-gradient(180deg,rgba(3,5,10,0.1),rgba(3,5,10,0.42))]" />
      <div className="pointer-events-none absolute inset-0 z-[2] opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.25)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.25)_1px,transparent_1px)] [background-size:84px_84px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 z-[3] h-24 bg-gradient-to-b from-black/55 to-transparent" />
      <button
        onClick={() =>
          setScene(
            "menu",
            sceneParams?.guestMode ? { guestMode: true } : undefined
          )
        }
        className="group absolute left-5 top-5 z-50 flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/35 px-3.5 py-2.5 text-white/80 shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-2xl transition-all duration-300 hover:border-white/20 hover:bg-white/[0.06] hover:text-white"
      >
        <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">{t("mainMenu.backToMenu")}</span>
      </button>
      {/* Premium loading HUD */}
      {isLoading && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-[#03050a]/95 backdrop-blur-sm">
          <div className="relative w-[min(420px,calc(100vw-2rem))] overflow-hidden rounded-3xl border border-white/10 bg-[#07101c]/75 p-7 text-center shadow-[0_30px_100px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-200/15 bg-cyan-200/[0.06]">
              <Orbit className="h-5 w-5 animate-pulse text-cyan-100/80" />
            </div>
            <p className="mt-5 text-[9px] font-semibold uppercase tracking-[0.3em] text-cyan-100/45">
              Mission control
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-[0.08em] text-white">
              Initializing Solar System
            </h2>
            <p className="mt-2 text-xs leading-6 text-white/35">
              Calibrating orbital map and planetary navigation systems.
            </p>
            <div className="mx-auto mt-6 h-1 w-full overflow-hidden rounded-full bg-white/6">
              <div className="h-full w-2/3 animate-pulse rounded-full bg-gradient-to-r from-cyan-200/20 via-cyan-200/70 to-blue-300/30" />
            </div>
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

      {/* Mission HUD */}
      <div className="pointer-events-none absolute left-1/2 top-5 z-40 hidden -translate-x-1/2 md:block">
        <div className="flex items-center gap-5 rounded-full border border-white/8 bg-black/25 px-4 py-2 shadow-[0_16px_50px_rgba(0,0,0,0.3)] backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(74,222,128,0.65)]" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/45">System online</span>
          </div>
          <span className="h-3 w-px bg-white/10" />
          <div className="flex items-center gap-2 text-white/35">
            <Activity className="h-3.5 w-3.5 text-cyan-200/60" />
            <span className="text-[9px] font-mono uppercase tracking-[0.18em]">Orbital map</span>
          </div>
          <span className="h-3 w-px bg-white/10" />
          <span className="text-[9px] font-mono uppercase tracking-[0.18em] text-white/30">08 bodies</span>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-5 left-1/2 z-40 hidden -translate-x-1/2 lg:block">
        <div className="flex items-center gap-3 rounded-full border border-white/8 bg-black/25 px-4 py-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/30 backdrop-blur-xl">
          <MousePointer2 className="h-3.5 w-3.5 text-cyan-200/50" />
          Select a planet to open its mission dossier
        </div>
      </div>

      {hoveredPlanet && !selectedPlanet && (
        <div className="pointer-events-none absolute bottom-16 left-1/2 z-40 -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full border border-cyan-200/15 bg-[#07101c]/75 px-3 py-2 shadow-[0_18px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl">
            <Crosshair className="h-3.5 w-3.5 text-cyan-200/70" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.22em] text-white/70">
              {t(`planets.${hoveredPlanet.id}.name`)}
            </span>
          </div>
        </div>
      )}

      <Canvas camera={{ position: [0, 25, 80], fov: 60 }} className="relative z-0">
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

      <div className="pointer-events-none absolute bottom-5 right-5 z-40 hidden xl:block">
        <div className="flex items-center gap-2 rounded-full border border-white/8 bg-black/25 px-3 py-2 text-[9px] font-mono uppercase tracking-[0.15em] text-white/20 backdrop-blur-xl">
          <ScanLine className="h-3.5 w-3.5" />
          <span>Telemetry</span>
          <span className="text-emerald-300/50">Stable</span>
        </div>
      </div>

      {/* Audio Settings */}
      <AudioSettings />
    </div>
  );
}
