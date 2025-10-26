import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { useGameManager } from "@/core/engine/GameContext";
import { ArrowLeft } from "lucide-react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

// Marker type definition
interface MarkerData {
  id: number;
  label: string;
  position: [number, number, number];
  description: string;
}

// Planet markers data - TODO: Move to separate config file per planet
const planetMarkersData: Record<string, MarkerData[]> = {
  mars: [
    {
      id: 1,
      label: "Olympus Mons",
      position: [2, 2, 0] as [number, number, number],
      description: "Largest volcano in the solar system - 21km high!",
    },
    {
      id: 2,
      label: "Valles Marineris",
      position: [-2, 1, 0] as [number, number, number],
      description: "A vast canyon system over 4000km long.",
    },
    {
      id: 3,
      label: "Polar Ice Caps",
      position: [0, -2, 0] as [number, number, number],
      description: "Frozen water and CO2 at the poles.",
    },
    {
      id: 4,
      label: "Tharsis Region",
      position: [3, -1, 0] as [number, number, number],
      description: "Massive volcanic plateau.",
    },
  ],
  mercury: [
    {
      id: 1,
      label: "Caloris Basin",
      position: [2, 0, 0] as [number, number, number],
      description: "One of the largest impact craters in the solar system.",
    },
  ],
  venus: [
    {
      id: 1,
      label: "Maxwell Montes",
      position: [0, 2, 0] as [number, number, number],
      description: "Highest mountain on Venus - 11km tall.",
    },
  ],
  earth: [
    {
      id: 1,
      label: "Mount Everest",
      position: [0, 2, 0] as [number, number, number],
      description: "Highest mountain on Earth - 8.8km above sea level.",
    },
    {
      id: 2,
      label: "Pacific Ocean",
      position: [-2, 0, 0] as [number, number, number],
      description: "Largest ocean covering 46% of Earth's water surface.",
    },
  ],
  jupiter: [
    {
      id: 1,
      label: "Great Red Spot",
      position: [0, 0, 2] as [number, number, number],
      description: "Giant storm larger than Earth!",
    },
  ],
  saturn: [
    {
      id: 1,
      label: "Ring System",
      position: [0, 0, 3] as [number, number, number],
      description: "Spectacular ring system made of ice and rock.",
    },
  ],
  uranus: [
    {
      id: 1,
      label: "Polar Region",
      position: [0, 2, 0] as [number, number, number],
      description: "Unique tilted rotation axis at 98 degrees.",
    },
  ],
  neptune: [
    {
      id: 1,
      label: "Great Dark Spot",
      position: [0, 1, 2] as [number, number, number],
      description: "Massive storm system similar to Jupiter's.",
    },
  ],
};

// Planet textures - TODO: Move to config
const planetTextures: Record<string, string> = {
  mars: "/texture/mars-min.webp",
  mercury: "/texture/mercury-min.webp",
  venus: "/texture/venus-min.webp",
  earth: "/texture/Albedo-min.webp",
  jupiter: "/texture/jupiter-min.webp",
  saturn: "/texture/Saturno-min.webp",
  uranus: "/texture/Uranus-min.webp",
  neptune: "/texture/neptune-min.webp",
};

interface MarkerProps {
  id: number;
  label: string;
  position: [number, number, number];
  onClick: (id: number, position: [number, number, number]) => void;
  markerRef: (el: THREE.Mesh | null) => void;
}

function Marker({ id, label, position, onClick, markerRef }: MarkerProps) {
  return (
    <mesh position={position} ref={markerRef}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial color="yellow" />
      <Html position={[0, 0.2, 0]} center>
        <button
          onClick={() => onClick(id, position)}
          className="bg-black/70 text-white px-2 py-1 rounded text-xs hover:bg-black/90 transition-colors"
          style={{ cursor: "pointer" }}
        >
          {label}
        </button>
      </Html>
    </mesh>
  );
}

// Camera controller component - Giống y hệt PlanetScene1
interface CameraControllerProps {
  targetMarkerId: number | null;
  markerRefs: React.MutableRefObject<Record<number, THREE.Mesh>>;
  controlsRef: React.RefObject<OrbitControlsImpl | null>;
  isAnimating: boolean;
  onAnimationComplete: () => void;
}

function CameraController({
  targetMarkerId,
  markerRefs,
  controlsRef,
  isAnimating,
  onAnimationComplete,
}: CameraControllerProps) {
  useFrame((state) => {
    if (!isAnimating || targetMarkerId === null || !controlsRef.current) return;

    const camera = state.camera;
    const controls = controlsRef.current;
    const markerObject = markerRefs.current[targetMarkerId];

    if (!markerObject) return;

    // Lấy vị trí thực tế của marker object - GIỐNG PLANETSCENE1
    const markerPosition = new THREE.Vector3();
    markerObject.getWorldPosition(markerPosition);

    // Tính toán vị trí camera - GIỐNG PLANETSCENE1
    const offsetDistance = 3; // Khoảng cách phù hợp cho marker
    const targetCameraPosition = new THREE.Vector3()
      .copy(markerPosition)
      .add(new THREE.Vector3(0, 1, offsetDistance));

    // Smooth lerp - GIỐNG PLANETSCENE1
    camera.position.lerp(targetCameraPosition, 0.05);
    controls.target.lerp(markerPosition, 0.05);

    // Check completion - GIỐNG PLANETSCENE1
    const distance = camera.position.distanceTo(targetCameraPosition);
    if (distance < 0.1) {
      onAnimationComplete();
    }
  });

  return null;
}

export default function PlanetDetail() {
  const { sceneParams, setScene } = useGameManager();
  const planetId = (sceneParams?.planetId as string) || "mars";

  const [activeMarker, setActiveMarker] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const markerRefs = useRef<Record<number, THREE.Mesh>>({});

  const markers = planetMarkersData[planetId] || planetMarkersData.mars;
  const textureUrl = planetTextures[planetId] || planetTextures.mars;

  const handleMarkerClick = (
    id: number,
    position: [number, number, number]
  ) => {
    setActiveMarker(id);
    setIsAnimating(true);
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  // Khi user tự điều khiển camera, dừng animation
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const onManualControlStart = () => {
      setIsAnimating(false);
    };

    controls.addEventListener("start", onManualControlStart);
    return () => {
      controls.removeEventListener("start", onManualControlStart);
    };
  }, []);

  return (
    <div className="w-full h-screen bg-black relative">
      {/* Back button */}
      <button
        onClick={() => setScene("solar_system")}
        className="absolute top-4 left-4 z-50 px-4 py-2 bg-white/10 hover:bg-white/20 
          backdrop-blur-md rounded-lg text-white font-semibold transition-all duration-300
          border border-white/20 hover:border-white/40 flex items-center gap-2"
      >
        <ArrowLeft className="w-5 h-5" />
        Quay lại Solar System
      </button>

      {/* Planet name */}
      <div className="absolute top-4 right-4 z-50 px-6 py-3 bg-black/60 backdrop-blur-md rounded-lg">
        <h1 className="text-2xl font-bold text-white capitalize">{planetId}</h1>
      </div>

      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />

        <mesh>
          <sphereGeometry args={[2, 64, 64]} />
          <meshStandardMaterial
            map={new THREE.TextureLoader().load(textureUrl)}
          />
        </mesh>

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            id={marker.id}
            label={marker.label}
            position={marker.position}
            onClick={handleMarkerClick}
            markerRef={(el) => {
              if (el) markerRefs.current[marker.id] = el;
            }}
          />
        ))}

        <CameraController
          targetMarkerId={activeMarker}
          markerRefs={markerRefs}
          controlsRef={controlsRef}
          isAnimating={isAnimating}
          onAnimationComplete={handleAnimationComplete}
        />
        <OrbitControls
          ref={controlsRef}
          enablePan
          enableZoom
          enableRotate
          enableDamping
          dampingFactor={0.05}
          minDistance={3}
          maxDistance={10}
        />
      </Canvas>

      {activeMarker && (
        <div className="absolute bottom-10 left-10 bg-black/70 text-white p-4 rounded">
          <h2 className="text-lg font-bold">
            {markers.find((m) => m.id === activeMarker)?.label}
          </h2>
          <p>{markers.find((m) => m.id === activeMarker)?.description}</p>
        </div>
      )}
    </div>
  );
}
