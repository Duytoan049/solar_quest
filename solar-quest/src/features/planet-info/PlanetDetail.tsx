import { useState, useRef, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useGameManager } from "@/core/engine/GameContext";
import {
  ArrowLeft,
  Play,
  Pause,
  Info,
  Award,
  Loader2,
  Camera,
} from "lucide-react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  getPlanetInfo,
  type PlanetInfo,
  getPlanetaryFeatures,
  type PlanetaryFeature,
  getMarsRoverPhoto,
  getEarthImagery,
  getPlanetImagery,
  getMarkerImagery,
} from "@/services/nasaApi";

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

// Planet atmosphere colors
const planetAtmosphereColors: Record<string, string> = {
  mars: "#ff6b4a",
  mercury: "#8c8c8c",
  venus: "#ffa500",
  earth: "#4a90ff",
  jupiter: "#d4a574",
  saturn: "#f4e4c1",
  uranus: "#4fd8eb",
  neptune: "#4169e1",
};

// Planet stats
const planetStats: Record<
  string,
  {
    temperature: string;
    gravity: string;
    diameter: string;
    dayLength: string;
  }
> = {
  mars: {
    temperature: "-63°C",
    gravity: "3.7 m/s²",
    diameter: "6,779 km",
    dayLength: "24.6 hours",
  },
  mercury: {
    temperature: "167°C",
    gravity: "3.7 m/s²",
    diameter: "4,879 km",
    dayLength: "4,222.6 hours",
  },
  venus: {
    temperature: "464°C",
    gravity: "8.9 m/s²",
    diameter: "12,104 km",
    dayLength: "2,802 hours",
  },
  earth: {
    temperature: "15°C",
    gravity: "9.8 m/s²",
    diameter: "12,742 km",
    dayLength: "24 hours",
  },
  jupiter: {
    temperature: "-110°C",
    gravity: "23.1 m/s²",
    diameter: "139,820 km",
    dayLength: "9.9 hours",
  },
  saturn: {
    temperature: "-140°C",
    gravity: "9.0 m/s²",
    diameter: "116,460 km",
    dayLength: "10.7 hours",
  },
  uranus: {
    temperature: "-195°C",
    gravity: "8.7 m/s²",
    diameter: "50,724 km",
    dayLength: "17.2 hours",
  },
  neptune: {
    temperature: "-200°C",
    gravity: "11.0 m/s²",
    diameter: "49,244 km",
    dayLength: "16.1 hours",
  },
};

interface MarkerProps {
  id: number;
  label: string;
  position: [number, number, number];
  onClick: (id: number) => void;
  markerRef: (el: THREE.Mesh | null) => void;
  isActive: boolean;
  isHovered: boolean;
  onHover: (id: number | null) => void;
}

function Marker({
  id,
  label,
  position,
  onClick,
  markerRef,
  isActive,
  isHovered,
  onHover,
}: MarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      // Pulse animation - Keep for interactivity
      const scale = isActive ? 1.5 : isHovered ? 1.3 : 1.0;
      meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);

      // DISABLED: Floating animation to reduce lag
      // const time = state.clock.getElapsedTime();
      // meshRef.current.position.y = position[1] + Math.sin(time * 2 + id) * 0.1;
    }
  });

  return (
    <mesh
      position={position}
      ref={(el) => {
        meshRef.current = el;
        markerRef(el);
      }}
      onPointerEnter={() => onHover(id)}
      onPointerLeave={() => onHover(null)}
    >
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial
        color={isActive ? "#00ff00" : isHovered ? "#ffff00" : "#ffa500"}
        emissive={isActive ? "#00ff00" : isHovered ? "#ffff00" : "#ff8800"}
        emissiveIntensity={isActive ? 2 : isHovered ? 1.5 : 0.8}
      />
      <Html position={[0, 0.2, 0]} center>
        <button
          onClick={() => onClick(id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 shadow-lg
            ${
              isActive
                ? "bg-green-600/90 text-white scale-110"
                : isHovered
                ? "bg-yellow-500/90 text-black scale-105"
                : "bg-black/70 text-white hover:bg-black/90"
            }`}
          style={{ cursor: "pointer", backdropFilter: "blur(10px)" }}
        >
          {label}
        </button>
      </Html>
    </mesh>
  );
}

// Atmosphere Glow Component
function AtmosphereGlow({ color }: { color: string }) {
  return (
    <mesh scale={[2.15, 2.15, 2.15]}>
      <sphereGeometry args={[1, 32, 32]} />
      <shaderMaterial
        transparent
        side={THREE.BackSide}
        vertexShader={`
          varying vec3 vNormal;
          void main() {
            vNormal = normalize(normalMatrix * normal);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 glowColor;
          varying vec3 vNormal;
          void main() {
            float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
            gl_FragColor = vec4(glowColor, 1.0) * intensity;
          }
        `}
        uniforms={{
          glowColor: { value: new THREE.Color(color) },
        }}
      />
    </mesh>
  );
}

// Rotating Planet Component
function RotatingPlanet({ textureUrl }: { textureUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  // DISABLED: Rotation animation to reduce lag
  // useFrame((_state, delta) => {
  //   if (meshRef.current) {
  //     meshRef.current.rotation.y += delta * 0.1; // Slow rotation
  //   }
  // });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial map={new THREE.TextureLoader().load(textureUrl)} />
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
  const [hoveredMarker, setHoveredMarker] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTourMode, setIsTourMode] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [visitedMarkers, setVisitedMarkers] = useState<Set<number>>(new Set());
  const [planetInfo, setPlanetInfo] = useState<PlanetInfo | null>(null);
  const [isLoadingPlanetInfo, setIsLoadingPlanetInfo] = useState(false);
  const [nasaMarkers, setNasaMarkers] = useState<PlanetaryFeature[]>([]);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(false);
  const [showImageGallery, setShowImageGallery] = useState(false);
  const [isLoadingImages, setIsLoadingImages] = useState(false);
  const [marsRoverImage, setMarsRoverImage] = useState<string | null>(null);
  const [earthImage, setEarthImage] = useState<string | null>(null);
  const [planetImage, setPlanetImage] = useState<string | null>(null);
  const [markerImage, setMarkerImage] = useState<{
    imageUrl: string;
    title?: string;
    explanation?: string;
  } | null>(null);
  const [isLoadingMarkerImage, setIsLoadingMarkerImage] = useState(false);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const markerRefs = useRef<Record<number, THREE.Mesh>>({});
  const tourIndexRef = useRef(0);

  const markers =
    nasaMarkers.length > 0
      ? nasaMarkers
      : planetMarkersData[planetId] || planetMarkersData.mars;
  const textureUrl = planetTextures[planetId] || planetTextures.mars;
  const atmosphereColor = planetAtmosphereColors[planetId] || "#ffffff";
  const stats = planetStats[planetId];

  // Fetch NASA planet data
  useEffect(() => {
    async function fetchPlanetData() {
      setIsLoadingPlanetInfo(true);
      setIsLoadingMarkers(true);
      try {
        // Fetch planet info
        const data = await getPlanetInfo(planetId);
        setPlanetInfo(data);

        // Fetch NASA planetary features/markers
        const features = await getPlanetaryFeatures(planetId);
        if (features && features.length > 0) {
          setNasaMarkers(features);
          console.log(
            `✅ Loaded ${features.length} NASA-verified features for ${planetId}:`,
            features
          );
        }
      } catch (error) {
        console.error("Error fetching planet data:", error);
      } finally {
        setIsLoadingPlanetInfo(false);
        setIsLoadingMarkers(false);
      }
    }

    fetchPlanetData();
  }, [planetId]);

  const handleMarkerClick = async (id: number) => {
    setActiveMarker(id);
    setIsAnimating(true);
    setVisitedMarkers((prev) => new Set(prev).add(id));
    setIsTourMode(false);

    // Fetch marker image
    const marker = markers.find((m) => m.id === id);
    if (marker) {
      const markerName = "name" in marker ? marker.name : marker.label;
      setIsLoadingMarkerImage(true);
      try {
        const imagery = await getMarkerImagery(markerName, planetId);
        if (imagery) {
          setMarkerImage({
            imageUrl: imagery.imageUrl,
            title: imagery.title,
            explanation: imagery.explanation,
          });
          console.log(`✅ Loaded image for marker: ${markerName}`);
        } else {
          setMarkerImage(null);
          console.log(`⚠️ No image found for marker: ${markerName}`);
        }
      } catch (error) {
        console.error("Error loading marker image:", error);
        setMarkerImage(null);
      } finally {
        setIsLoadingMarkerImage(false);
      }
    }
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  const startTourMode = () => {
    setIsTourMode(true);
    tourIndexRef.current = 0;
    setActiveMarker(markers[0].id);
    setIsAnimating(true);
  };

  const stopTourMode = () => {
    setIsTourMode(false);
  };

  // Tour mode auto-advance
  useEffect(() => {
    if (!isTourMode || isAnimating) return;

    const timer = setTimeout(() => {
      tourIndexRef.current = (tourIndexRef.current + 1) % markers.length;
      const nextMarker = markers[tourIndexRef.current];
      setActiveMarker(nextMarker.id);
      setIsAnimating(true);
      setVisitedMarkers((prev) => new Set(prev).add(nextMarker.id));
    }, 3000); // 3 seconds per marker

    return () => clearTimeout(timer);
  }, [isTourMode, isAnimating, markers]);

  const progress = (visitedMarkers.size / markers.length) * 100;

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

      {/* Planet name & Stats toggle */}
      <div className="absolute top-4 right-4 z-50 flex gap-2">
        <div className="px-6 py-3 bg-black/60 backdrop-blur-md rounded-lg flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white capitalize">
            {planetId}
          </h1>
          {isLoadingMarkers && (
            <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />
          )}
        </div>
        <button
          onClick={() => setShowImageGallery(!showImageGallery)}
          className="px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg 
            text-white transition-all duration-300 border border-white/20 hover:border-white/40"
          title="NASA Images"
        >
          <Camera className="w-5 h-5" />
        </button>
        <button
          onClick={() => setShowStats(!showStats)}
          className="px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg 
            text-white transition-all duration-300 border border-white/20 hover:border-white/40"
        >
          <Info className="w-5 h-5" />
        </button>
      </div>

      {/* Stats Panel */}
      {showStats && (
        <div
          className="absolute top-20 right-4 z-50 w-80 bg-black/80 backdrop-blur-md rounded-lg p-4 
          border border-white/20 animate-in slide-in-from-right duration-300"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-white">Planet Stats</h3>
            {isLoadingPlanetInfo && (
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
            )}
          </div>

          {/* NASA Image */}
          {planetInfo?.imageUrl && (
            <div className="mb-3 rounded-lg overflow-hidden border border-white/10">
              <img
                src={planetInfo.imageUrl}
                alt={`${planetId} from NASA`}
                className="w-full h-40 object-cover"
                onError={(e) => {
                  // Simply hide if image fails to load
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <p className="text-xs text-gray-500 p-2 bg-black/40">
                {planetId === "mars"
                  ? "📸 Latest from Mars Rover"
                  : planetId === "earth"
                  ? "🌍 EPIC Satellite Imagery"
                  : "NASA Image"}
              </p>
            </div>
          )}

          {planetInfo?.description && (
            <p className="text-gray-300 text-xs mb-3 leading-relaxed">
              {planetInfo.description}
            </p>
          )}

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Temperature:</span>
              <span className="text-white font-semibold text-xs">
                {planetInfo?.stats.temperature || stats.temperature}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Gravity:</span>
              <span className="text-white font-semibold text-xs">
                {planetInfo?.stats.gravity || stats.gravity}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Diameter:</span>
              <span className="text-white font-semibold">
                {planetInfo?.stats.diameter || stats.diameter}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Day Length:</span>
              <span className="text-white font-semibold text-xs">
                {planetInfo?.stats.dayLength || stats.dayLength}
              </span>
            </div>

            {/* Additional NASA data */}
            {planetInfo?.stats.mass && (
              <div className="flex justify-between">
                <span className="text-gray-400">Mass:</span>
                <span className="text-white font-semibold text-xs">
                  {planetInfo.stats.mass}
                </span>
              </div>
            )}
            {planetInfo?.stats.distanceFromSun && (
              <div className="flex justify-between">
                <span className="text-gray-400">Distance from Sun:</span>
                <span className="text-white font-semibold text-xs">
                  {planetInfo.stats.distanceFromSun}
                </span>
              </div>
            )}
            {planetInfo?.stats.moons !== undefined && (
              <div className="flex justify-between">
                <span className="text-gray-400">Moons:</span>
                <span className="text-white font-semibold">
                  {planetInfo.stats.moons}
                </span>
              </div>
            )}
            {planetInfo?.stats.atmosphere && (
              <div className="flex justify-between">
                <span className="text-gray-400">Atmosphere:</span>
                <span className="text-white font-semibold text-xs">
                  {planetInfo.stats.atmosphere}
                </span>
              </div>
            )}
          </div>

          {/* NASA Source credit */}
          {planetInfo && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <span>📡</span>
                <span>Data from NASA</span>
                {planetInfo.lastUpdated && (
                  <span className="text-gray-600">
                    {" "}
                    • Updated: {planetInfo.lastUpdated}
                  </span>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {/* NASA Image Gallery */}
      {showImageGallery && (
        <div
          className="absolute top-20 right-4 z-50 w-96 bg-black/90 backdrop-blur-md rounded-lg p-4 
          border border-white/20 animate-in slide-in-from-right duration-300 max-h-[80vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Camera className="w-5 h-5" />
              NASA Images
            </h3>
            <button
              onClick={() => setShowImageGallery(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Planet Info Image */}
          {planetInfo?.imageUrl && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-white mb-2">
                {planetId === "mars"
                  ? "🔴 Mars Rover Photo"
                  : planetId === "earth"
                  ? "🌍 Earth from EPIC Satellite"
                  : `${
                      planetId.charAt(0).toUpperCase() + planetId.slice(1)
                    } Image`}
              </h4>
              <div className="rounded-lg overflow-hidden border border-white/20">
                <img
                  src={planetInfo.imageUrl}
                  alt={`${planetId} from NASA`}
                  className="w-full h-64 object-cover"
                  onError={(e) => {
                    // Hide image if failed to load
                    const img = e.target as HTMLImageElement;
                    img.style.display = "none";
                    // Show error message
                    const parent = img.parentElement;
                    if (parent && !parent.querySelector(".error-msg")) {
                      const errorDiv = document.createElement("div");
                      errorDiv.className =
                        "error-msg p-4 bg-red-900/20 text-red-400 text-xs text-center";
                      errorDiv.textContent = "Failed to load image";
                      parent.appendChild(errorDiv);
                    }
                  }}
                />
                <div className="p-2 bg-black/60">
                  <p className="text-xs text-gray-400">
                    {planetInfo.lastUpdated
                      ? `Updated: ${planetInfo.lastUpdated}`
                      : "NASA Official Image"}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Additional planet-specific images from APOD */}
          {planetImage && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-white mb-2">
                🌌 NASA APOD -{" "}
                {planetId.charAt(0).toUpperCase() + planetId.slice(1)}
              </h4>
              <div className="rounded-lg overflow-hidden border border-white/20">
                <img
                  src={planetImage}
                  alt={`${planetId} from NASA APOD`}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>
          )}

          {/* Additional Images */}
          {marsRoverImage && planetId === "mars" && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-white mb-2">
                📸 Additional Mars Rover Photos
              </h4>
              <div className="rounded-lg overflow-hidden border border-white/20">
                <img
                  src={marsRoverImage}
                  alt="Mars Rover"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>
          )}

          {earthImage && planetId === "earth" && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-white mb-2">
                🛰️ Additional Earth Imagery
              </h4>
              <div className="rounded-lg overflow-hidden border border-white/20">
                <img
                  src={earthImage}
                  alt="Earth"
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            </div>
          )}

          {/* Load More Button - Works for ALL planets */}
          <button
            onClick={async () => {
              setIsLoadingImages(true);
              try {
                // Load APOD imagery for ANY planet
                const img = await getPlanetImagery(planetId);
                if (img?.imageUrl) setPlanetImage(img.imageUrl);

                // Also load planet-specific APIs if available
                if (planetId === "mars") {
                  const photo = await getMarsRoverPhoto();
                  if (photo?.imageUrl) setMarsRoverImage(photo.imageUrl);
                } else if (planetId === "earth") {
                  const earthImg = await getEarthImagery();
                  if (earthImg?.imageUrl) setEarthImage(earthImg.imageUrl);
                }
              } catch (error) {
                console.error("Error loading images:", error);
              } finally {
                setIsLoadingImages(false);
              }
            }}
            disabled={isLoadingImages}
            className={`w-full px-4 py-2 backdrop-blur-md rounded-lg 
              text-white font-semibold transition-all duration-300 border 
              flex items-center justify-center gap-2
              ${
                isLoadingImages
                  ? "bg-gray-600/20 border-gray-400/30 cursor-not-allowed"
                  : "bg-blue-600/20 hover:bg-blue-600/40 border-blue-400/30 hover:border-blue-400/60"
              }`}
          >
            {isLoadingImages ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading NASA Images...
              </>
            ) : (
              <>
                <Camera className="w-4 h-4" />
                Load More NASA Images
              </>
            )}
          </button>

          {!planetInfo?.imageUrl &&
            !marsRoverImage &&
            !earthImage &&
            !planetImage && (
              <div className="text-center py-8">
                <Camera className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">
                  No NASA images available for {planetId} yet.
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  Try loading images using the button below.
                </p>
              </div>
            )}

          {/* NASA Credit */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span>📡</span>
              <span>Images from NASA API</span>
            </p>
          </div>
        </div>
      )}

      {/* Tour Controls */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-2">
        <button
          onClick={isTourMode ? stopTourMode : startTourMode}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg 
            text-white font-semibold transition-all duration-300 border border-white/20 
            hover:border-white/40 flex items-center gap-2"
        >
          {isTourMode ? (
            <>
              <Pause className="w-4 h-4" />
              Stop Tour
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              Auto Tour
            </>
          )}
        </button>
      </div>

      {/* Progress & Achievement */}
      <div className="absolute bottom-4 right-4 z-50 flex flex-col items-end gap-2">
        {/* Progress bar */}
        <div className="bg-black/80 backdrop-blur-md rounded-lg p-3 border border-white/20">
          <div className="flex items-center gap-2 mb-2">
            <Award className="w-4 h-4 text-yellow-400" />
            <span className="text-white text-sm font-semibold">
              Explored: {visitedMarkers.size}/{markers.length}
            </span>
          </div>
          <div className="w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Achievement badge */}
        {progress === 100 && (
          <div
            className="bg-gradient-to-r from-yellow-400 to-orange-500 px-4 py-2 rounded-lg 
            shadow-lg animate-in zoom-in duration-500"
          >
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-white" />
              <span className="text-white font-bold">Master Explorer!</span>
            </div>
          </div>
        )}
      </div>

      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={0.5} />

        {/* Starfield background */}
        <Stars
          radius={100}
          depth={50}
          count={5000}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />

        {/* Planet with rotation */}
        <RotatingPlanet textureUrl={textureUrl} />

        {/* Atmosphere glow */}
        <AtmosphereGlow color={atmosphereColor} />

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            id={marker.id}
            label={"name" in marker ? marker.name : marker.label}
            position={marker.position}
            onClick={handleMarkerClick}
            markerRef={(el) => {
              if (el) markerRefs.current[marker.id] = el;
            }}
            isActive={activeMarker === marker.id}
            isHovered={hoveredMarker === marker.id}
            onHover={setHoveredMarker}
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
        <div
          className="absolute bottom-10 left-10 max-w-md bg-black/80 backdrop-blur-md 
          text-white p-6 rounded-lg border border-white/20 shadow-2xl
          animate-in slide-in-from-bottom duration-300"
        >
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              {(() => {
                const marker = markers.find((m) => m.id === activeMarker);
                return "name" in marker! ? marker!.name : marker!.label;
              })()}
              {isLoadingMarkerImage && (
                <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
              )}
            </h2>
            {visitedMarkers.has(activeMarker) && (
              <div className="bg-green-500/20 px-2 py-1 rounded-full flex items-center gap-1">
                <Award className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-400 font-semibold">
                  Visited
                </span>
              </div>
            )}
          </div>

          {/* Marker Image from NASA APOD */}
          {markerImage && (
            <div className="mb-4 rounded-lg overflow-hidden border border-white/20">
              <img
                src={markerImage.imageUrl}
                alt={markerImage.title || "Landmark"}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              {markerImage.title && (
                <div className="p-2 bg-black/60">
                  <p className="text-xs text-white font-semibold">
                    📸 {markerImage.title}
                  </p>
                  {markerImage.explanation && (
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                      {markerImage.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <p className="text-gray-300 leading-relaxed">
            {markers.find((m) => m.id === activeMarker)?.description}
          </p>

          {/* NASA verified feature details */}
          {(() => {
            const marker = markers.find((m) => m.id === activeMarker);
            if (marker && "type" in marker) {
              const feature = marker as PlanetaryFeature;
              return (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">Type:</span>
                    <span className="text-xs text-white font-semibold capitalize">
                      {feature.type}
                    </span>
                  </div>
                  {feature.height && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Height:</span>
                      <span className="text-xs text-white font-semibold">
                        {feature.height}
                      </span>
                    </div>
                  )}
                  {feature.diameter && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Diameter:</span>
                      <span className="text-xs text-white font-semibold">
                        {feature.diameter}
                      </span>
                    </div>
                  )}
                  {feature.depth && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Depth:</span>
                      <span className="text-xs text-white font-semibold">
                        {feature.depth}
                      </span>
                    </div>
                  )}
                  {feature.coordinates && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        Coordinates:
                      </span>
                      <span className="text-xs text-white font-semibold">
                        {feature.coordinates.latitude.toFixed(2)}°,{" "}
                        {feature.coordinates.longitude.toFixed(2)}°
                      </span>
                    </div>
                  )}
                  {feature.namedAfter && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-xs text-gray-400">
                        Named after:{" "}
                        <span className="text-white">{feature.namedAfter}</span>
                      </p>
                    </div>
                  )}
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-500 flex items-center gap-1">
                      <span>🛰️</span>
                      <span>NASA-verified planetary feature</span>
                    </p>
                  </div>
                </div>
              );
            }
            return null;
          })()}

          {isTourMode && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Play className="w-3 h-3" />
                <span>
                  Tour Mode: {tourIndexRef.current + 1}/{markers.length}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
