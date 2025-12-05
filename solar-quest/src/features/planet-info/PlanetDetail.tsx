import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Html, OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { useGameManager } from "@/core/engine/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import { useArtifactCollection } from "@/hooks/useArtifactCollection";
import { useAudio } from "@/hooks/useAudio";
import { useTranslation } from "react-i18next";
import {
  ArrowLeft,
  Play,
  Pause,
  Info,
  Award,
  Loader2,
  Camera,
  BookOpen,
  Package,
} from "lucide-react";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import {
  getPlanetInfo,
  type PlanetInfo,
  getMarsRoverPhoto,
  getEarthImagery,
  getPlanetImagery,
  getMarkerImagery,
} from "@/services/nasaApi";
import {
  getProfile,
  updateLastVisited,
  unlockBadge,
} from "@/services/profileStorage";
import { ROLE_INFO } from "@/types/profile";
import { motion, AnimatePresence } from "framer-motion";
import {
  getCachedPlanetData,
  getCachedTexture,
  getCachedMarkerImagery,
} from "@/utils/planetPreloader";
import ChatbotPanel from "@/features/chatbot/ChatbotPanel";
import QuizPanel from "@/features/quiz/QuizPanel";
import ArtifactSpawner from "@/components/ArtifactSpawner";
import ArtifactCollectionModal from "@/components/ArtifactCollectionModal";
import AudioSettings from "@/components/AudioSettings";
import type { Artifact } from "@/types/artifact";
import { aiCompanions } from "@/data/aiCompanions";
import {
  getPlanetHistory,
  formatMass,
  formatVolume,
  kelvinToCelsius,
  formatNumber,
  type PlanetHistoryData,
} from "@/services/solarSystemApi";
import {
  marsMarkers,
  earthMarkers,
  venusMarkers,
  jupiterMarkers,
  saturnMarkers,
  uranusMarkers,
  neptuneMarkers,
  mercuryMarkers,
  sunMarkers,
} from "./planetMarkers";
import {
  getCachedTranslation,
  clearOldCache,
} from "@/services/cachedTranslation";
import { PLANET_ARTIFACTS } from "@/data/planetArtifacts";

// Marker type definition
interface MarkerData {
  id: number;
  name: string;
  label?: string;
  position: [number, number, number];
  description: string;
  type?: string;
  height?: string;
  depth?: string;
  diameter?: string;
  coordinates?: { latitude: number; longitude: number };
  namedAfter?: string;
  discoveryDate?: string;
}

// Convert imported markers to MarkerData format
const convertMarkers = (markers: Partial<MarkerData>[]): MarkerData[] => {
  return markers.map((m) => ({
    ...m,
    label: m.name,
    position: m.position as [number, number, number],
  })) as MarkerData[];
};

// Planet markers data from centralized config
const planetMarkersData: Record<string, MarkerData[]> = {
  mars: convertMarkers(marsMarkers),
  earth: convertMarkers(earthMarkers),
  venus: convertMarkers(venusMarkers),
  jupiter: convertMarkers(jupiterMarkers),
  saturn: convertMarkers(saturnMarkers),
  uranus: convertMarkers(uranusMarkers),
  neptune: convertMarkers(neptuneMarkers),
  mercury: convertMarkers(mercuryMarkers),
  sun: convertMarkers(sunMarkers),
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
    dayLength: "12 hours",
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
  hideLabel?: boolean; // Hide label when modal is open
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
  hideLabel = false,
}: MarkerProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      // Only animate if active or hovered for better performance
      if (isActive || isHovered) {
        const scale = isActive ? 1.5 : 1.3;
        meshRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
      } else if (meshRef.current.scale.x !== 1.0) {
        // Return to normal size
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }

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
      {!hideLabel && (
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
      )}
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

// Rotating Planet Component - Optimized with texture caching
function RotatingPlanet({ textureUrl }: { textureUrl: string }) {
  const meshRef = useRef<THREE.Mesh>(null);

  // 🚀 Try cached texture first (instant if preloaded), fallback to loading
  const texture = useMemo(() => {
    const cached = getCachedTexture(textureUrl);
    if (cached) {
      console.log(`✅ Planet: Using cached texture for ${textureUrl}`);
      return cached;
    }

    console.log(`🔄 Planet: Loading texture ${textureUrl}`);
    return new THREE.TextureLoader().load(textureUrl);
  }, [textureUrl]);

  // DISABLED: Rotation animation to reduce lag
  // useFrame((_state, delta) => {
  //   if (meshRef.current) {
  //     meshRef.current.rotation.y += delta * 0.1; // Slow rotation
  //   }
  // });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[2, 64, 64]} />
      <meshStandardMaterial map={texture} />
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
    // CHỈ animate khi isAnimating = true (giống isManualCamera logic)
    if (!isAnimating || targetMarkerId === null || !controlsRef.current) return;

    const camera = state.camera;
    const controls = controlsRef.current;
    const markerObject = markerRefs.current[targetMarkerId];

    if (!markerObject) return;

    // Lấy vị trí thực tế của marker object
    const markerPosition = new THREE.Vector3();
    markerObject.getWorldPosition(markerPosition);

    // Tính vector từ tâm hành tinh đến marker (radial direction)
    const direction = markerPosition.clone().normalize();

    // Tính toán vị trí camera: đẩy ra ngoài theo hướng radial
    const cameraDistance = 1.5; // Khoảng cách từ marker đến camera

    // Vị trí camera: từ marker, đẩy ra ngoài theo hướng radial + offset nhỏ để góc nhìn đẹp hơn
    const targetCameraPosition = markerPosition
      .clone()
      .add(direction.clone().multiplyScalar(cameraDistance)) // Đẩy camera ra theo hướng từ tâm
      .add(new THREE.Vector3(0, 0.3, 0)); // Nâng camera lên một chút để góc nhìn đẹp hơn

    // Smooth lerp - GIỐNG PLANETSCENE1 (0.05 cho mượt mà)
    camera.position.lerp(targetCameraPosition, 0.05);
    controls.target.lerp(markerPosition, 0.05);

    // Check completion - GIỐNG PLANETSCENE1
    const distance = camera.position.distanceTo(targetCameraPosition);
    if (distance < 0.1) {
      // Animation hoàn thành - CHO PHÉP user tự do điều khiển
      onAnimationComplete();
    }
  });

  return null;
}

export default function PlanetDetail() {
  const { sceneParams, setScene } = useGameManager();
  const { user } = useAuth();
  const { t, i18n } = useTranslation();
  const { play, playMusic, stopMusic } = useAudio();
  const planetId = (sceneParams?.planetId as string) || "mars";

  // Artifact collection hook
  const {
    availableArtifacts,
    collectedIds,
    handleCollect,
    loading: artifactsLoading,
  } = useArtifactCollection(planetId);

  // Calculate total artifacts for this planet
  const totalArtifacts = PLANET_ARTIFACTS[planetId]?.length || 0;

  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(
    null
  );
  const [showArtifactModal, setShowArtifactModal] = useState(false);

  const [activeMarker, setActiveMarker] = useState<number | null>(null);
  const [hoveredMarker, setHoveredMarker] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTourMode, setIsTourMode] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [visitedMarkers, setVisitedMarkers] = useState<Set<number>>(new Set());
  const [planetInfo, setPlanetInfo] = useState<PlanetInfo | null>(null);
  const [isLoadingPlanetInfo, setIsLoadingPlanetInfo] = useState(false);
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
  const [showProfileCard, setShowProfileCard] = useState(true);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showMarkers, setShowMarkers] = useState(true); // Toggle markers
  const [showArtifacts, setShowArtifacts] = useState(true); // Toggle artifacts
  const [showHistory, setShowHistory] = useState(false);
  const [planetHistory, setPlanetHistory] = useState<PlanetHistoryData | null>(
    null
  );
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [translatedDescription, setTranslatedDescription] =
    useState<string>("");
  const [isTranslating, setIsTranslating] = useState(false);
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const markerRefs = useRef<Record<number, THREE.Mesh>>({});
  const tourIndexRef = useRef(0);

  // Handle artifact collection
  const handleArtifactClick = async (artifact: Artifact) => {
    const success = await handleCollect(artifact);

    if (success) {
      setSelectedArtifact(artifact);
      setShowArtifactModal(true);

      // Play collect sound
      play("collect", { volume: 0.5, category: "ui" });
    }
  };

  // Load profile
  const profile = getProfile(planetId);

  // Get AI companion for this planet
  const aiCompanion = aiCompanions[planetId];

  // Update last visited when component mounts
  useEffect(() => {
    if (profile) {
      updateLastVisited(planetId);
    }
  }, [planetId, profile]);

  // Clean old cache on mount
  useEffect(() => {
    clearOldCache();
  }, []);

  // Play planet music
  useEffect(() => {
    const musicKey = `${planetId}_theme`;
    playMusic(musicKey, true);

    return () => {
      stopMusic(true);
    };
  }, [planetId, playMusic, stopMusic]);

  // Translate description when language changes or planetInfo updates
  useEffect(() => {
    const translateDescription = async () => {
      if (!planetInfo?.description) {
        setTranslatedDescription("");
        return;
      }

      // If English, use original
      if (i18n.language === "en") {
        setTranslatedDescription(planetInfo.description);
        return;
      }

      // For Vietnamese, translate with cache
      setIsTranslating(true);
      try {
        const translated = await getCachedTranslation(
          planetInfo.description,
          "vi"
        );
        setTranslatedDescription(translated);
      } catch (error) {
        console.error("Translation error:", error);
        setTranslatedDescription(planetInfo.description); // Fallback to original
      } finally {
        setIsTranslating(false);
      }
    };

    translateDescription();
  }, [planetInfo?.description, i18n.language]);

  // Always use planetMarkersData for accurate NASA-verified positions
  const markers = planetMarkersData[planetId] || planetMarkersData.mars;
  const textureUrl = planetTextures[planetId] || planetTextures.mars;
  const atmosphereColor = planetAtmosphereColors[planetId] || "#ffffff";
  const stats = planetStats[planetId];

  // Fetch NASA planet data
  useEffect(() => {
    async function fetchPlanetData() {
      setIsLoadingPlanetInfo(true);
      try {
        // 🚀 Try to get cached data first (instant if preloaded by VictorySequence)
        const cached = getCachedPlanetData(planetId);
        if (cached) {
          console.log(`✅ PlanetDetail: Using cached data for ${planetId}`);
          setPlanetInfo(cached);
          setIsLoadingPlanetInfo(false);
          return;
        }

        // Fallback to API if not cached
        console.log(`🔄 PlanetDetail: Fetching data for ${planetId}`);
        const data = await getPlanetInfo(planetId);
        setPlanetInfo(data);
      } catch (error) {
        console.error("Error fetching planet data:", error);
      } finally {
        setIsLoadingPlanetInfo(false);
      }
    }

    fetchPlanetData();
  }, [planetId]);

  // Fetch planet history when History panel is opened
  useEffect(() => {
    if (showHistory && !planetHistory) {
      async function fetchHistory() {
        setIsLoadingHistory(true);
        try {
          const history = await getPlanetHistory(planetId);
          setPlanetHistory(history);
        } catch (error) {
          console.error("Error fetching planet history:", error);
        } finally {
          setIsLoadingHistory(false);
        }
      }
      fetchHistory();
    }
  }, [showHistory, planetId, planetHistory]);

  const handleMarkerClick = useCallback(
    async (id: number) => {
      // Reset animation state trước khi bắt đầu animation mới
      setIsAnimating(false);

      // Chờ một frame để đảm bảo animation cũ đã dừng
      await new Promise((resolve) => setTimeout(resolve, 16));

      setActiveMarker(id);
      setIsAnimating(true);
      const newVisitedMarkers = new Set(visitedMarkers).add(id);
      setVisitedMarkers(newVisitedMarkers);
      setIsTourMode(false);

      // Check for Cartographer badge (visited all markers)
      if (newVisitedMarkers.size === markers.length && profile) {
        unlockBadge(planetId, "🗺️ Cartographer");
      }

      // Fetch marker image
      const marker = markers.find((m) => m.id === id);
      if (marker) {
        const markerName = marker.name;

        // 🚀 Try to get cached marker imagery first
        const cached = getCachedMarkerImagery(markerName, planetId);
        if (cached) {
          console.log(`✅ Using cached marker imagery: ${markerName}`);
          setMarkerImage({
            imageUrl: cached.imageUrl,
            title: cached.title,
            explanation: cached.explanation,
          });

          // Unlock Photographer badge if profile exists
          if (profile) {
            unlockBadge(planetId, "📸 Photographer");
          }
          return;
        }

        // Fallback to API if not cached
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

            // Unlock Photographer badge if profile exists
            if (profile) {
              unlockBadge(planetId, "📸 Photographer");
            }
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
    },
    [visitedMarkers, markers, profile, planetId]
  );

  const handleAnimationComplete = useCallback(() => {
    setIsAnimating(false);
  }, []);

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
      {/* Back button - Hide when Quiz is open */}
      {!showQuiz && (
        <button
          onClick={() =>
            setScene(
              "solar_system",
              sceneParams?.guestMode ? { guestMode: true } : undefined
            )
          }
          className="absolute top-4 left-4 z-50 px-4 py-2 bg-white/10 hover:bg-white/20 
            backdrop-blur-md rounded-lg text-white font-semibold transition-all duration-300
            border border-white/20 hover:border-white/40 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          {t("planetDetail.backToSolarSystem")}
        </button>
      )}

      {/* Profile Card - Hide when Quiz is open */}
      <AnimatePresence mode="wait">
        {profile && showProfileCard && !showQuiz && (
          <motion.div
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -100, opacity: 0 }}
            transition={{ type: "tween", duration: 0.2 }}
            className="absolute top-20 left-4 z-40 max-w-[280px]"
          >
            <div
              className="bg-black/80 backdrop-blur-xl rounded-2xl p-4 border border-white/20 
              shadow-2xl min-w-[280px] max-w-[320px]"
            >
              {/* Header with avatar and minimize button */}
              <div className="flex items-start gap-4 mb-3">
                {/* Avatar */}
                <div className="text-5xl flex-shrink-0">{profile.avatar}</div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-white truncate">
                    {profile.citizenName}
                  </h3>
                  <p className="text-sm text-gray-400 flex items-center gap-1">
                    <span>{ROLE_INFO[profile.role].icon}</span>
                    <span>{ROLE_INFO[profile.role].title}</span>
                  </p>
                </div>

                {/* Minimize button */}
                <button
                  onClick={() => setShowProfileCard(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                  title="Ẩn profile"
                >
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                </button>
              </div>

              {/* Quiz Score */}
              <div className="bg-white/5 rounded-lg p-2 mb-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">
                    {t("planetDetail.quizScore")}
                  </span>
                  <span className="font-bold text-white">
                    {profile.quizScore}/5
                  </span>
                </div>
                <div className="mt-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(profile.quizScore / 5) * 100}%`,
                      background:
                        profile.quizTier === "gold"
                          ? "linear-gradient(90deg, #FFD700, #FFA500)"
                          : profile.quizTier === "silver"
                          ? "linear-gradient(90deg, #C0C0C0, #A0A0A0)"
                          : "linear-gradient(90deg, #CD7F32, #8B4513)",
                    }}
                  />
                </div>
                {/* Retry Quiz Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowQuiz(true)}
                  className="w-full mt-2 px-3 py-1.5 bg-gradient-to-r from-purple-600/80 to-blue-600/80 
                    hover:from-purple-600 hover:to-blue-600 rounded-md text-xs font-semibold text-white
                    transition-all duration-300 flex items-center justify-center gap-1.5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                    />
                  </svg>
                  <span>{t("planetDetail.retakeQuiz")}</span>
                </motion.button>
              </div>

              {/* Badges */}
              {profile.badges.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs text-gray-400 font-semibold uppercase tracking-wide">
                    {t("planetDetail.badges")} ({profile.badges.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.badges.slice(0, 6).map((badge, i) => (
                      <motion.span
                        key={i}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="text-xs px-2 py-1 bg-white/10 rounded-md border border-white/20 
                          hover:bg-white/20 transition-colors cursor-default"
                        title={badge}
                      >
                        {badge.split(" ")[0]}
                      </motion.span>
                    ))}
                    {profile.badges.length > 6 && (
                      <span className="text-xs px-2 py-1 bg-white/10 rounded-md border border-white/20 text-gray-400">
                        +{profile.badges.length - 6}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Show profile button when hidden - Hide when Quiz is open */}
      {profile && !showProfileCard && !showQuiz && (
        <motion.button
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ type: "tween", duration: 0.2 }}
          onClick={() => setShowProfileCard(true)}
          className="absolute top-20 left-4 z-40 p-3 bg-black/80 backdrop-blur-xl 
            rounded-full border border-white/20 hover:bg-white/10 transition-all"
          title="Hiện profile"
        >
          <span className="text-2xl">{profile.avatar}</span>
        </motion.button>
      )}

      {/* Planet name & Stats toggle - Hide when Quiz is open */}
      {!showQuiz && (
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <div className="px-6 py-3 bg-black/60 backdrop-blur-md rounded-lg flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white capitalize">
              {t(`planets.${planetId}.name`)}
            </h1>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg 
            text-white transition-all duration-300 border border-white/20 hover:border-white/40"
            title={t("planetDetail.planetHistory")}
          >
            <BookOpen className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowImageGallery(!showImageGallery)}
            className="px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-lg 
            text-white transition-all duration-300 border border-white/20 hover:border-white/40"
            title={t("planetDetail.nasaImages")}
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
      )}

      {/* History Panel */}
      <AnimatePresence mode="wait">
        {showHistory && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: "tween", duration: 0.2 }}
            className="absolute top-20 right-4 z-[60] w-96 bg-black/80 backdrop-blur-md rounded-lg p-4 
          border border-white/20 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin"
          >
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {t("planetDetail.planetHistory")}
                </h3>
                <div className="flex items-center gap-2">
                  {isLoadingHistory && (
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                  )}
                  <button
                    onClick={() => setShowHistory(false)}
                    className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                    title={t("planetDetail.close")}
                  >
                    <svg
                      className="w-4 h-4 text-gray-400 hover:text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>
              {/* Planet Name Display */}
              <div className="px-3 py-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg">
                <h4 className="text-2xl font-bold text-white capitalize text-center">
                  {planetHistory?.englishName || planetId}
                </h4>
                {planetHistory?.name &&
                  planetHistory.name !== planetHistory.englishName && (
                    <p className="text-xs text-gray-400 text-center mt-1">
                      {planetHistory.name}
                    </p>
                  )}
              </div>
            </div>

            {/* Loading State */}
            {isLoadingHistory && (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-400 text-sm">{t("common.loading")}</p>
              </div>
            )}

            {/* History Data */}
            {!isLoadingHistory && planetHistory && (
              <div className="space-y-4">
                {/* Discovery Information */}
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <span>🔭</span>
                    {t("planetDetail.discoverySection")}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        {t("planetDetail.discoveredBy")}
                      </span>
                      <span className="text-white font-semibold">
                        {t(
                          `discoveryData.${planetHistory.discoveredBy.toLowerCase()}`,
                          planetHistory.discoveredBy
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        {t("planetDetail.discoveryDate")}
                      </span>
                      <span className="text-white font-semibold">
                        {t(
                          `discoveryData.${planetHistory.discoveryDate.toLowerCase()}`,
                          planetHistory.discoveryDate
                        )}
                      </span>
                    </div>
                    {planetHistory.alternativeName && (
                      <div className="flex justify-between">
                        <span className="text-gray-400">
                          {t("planetDetail.alternativeName")}
                        </span>
                        <span className="text-white font-semibold">
                          {planetHistory.alternativeName}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        {t("planetDetail.bodyType")}
                      </span>
                      <span className="text-white font-semibold">
                        {t(
                          `discoveryData.${planetHistory.bodyType.toLowerCase()}`,
                          planetHistory.bodyType
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Physical Characteristics */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <span>⚖️</span>
                    {t("planetDetail.physicalCharacteristics")}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">{t("planet.mass")}</span>
                      <span className="text-white font-semibold text-xs">
                        {formatMass(planetHistory.mass)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        {t("planetDetail.volume")}
                      </span>
                      <span className="text-white font-semibold text-xs">
                        {formatVolume(planetHistory.volume)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        {t("planetDetail.density")}
                      </span>
                      <span className="text-white font-semibold">
                        {planetHistory.density.toFixed(2)} g/cm³
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        {t("planetDetail.surfaceGravity")}
                      </span>
                      <span className="text-white font-semibold">
                        {planetHistory.gravity.toFixed(2)} m/s²
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        {t("planetDetail.meanRadius")}
                      </span>
                      <span className="text-white font-semibold">
                        {formatNumber(planetHistory.meanRadius)} km
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        {t("planetDetail.avgTemperature")}
                      </span>
                      <span className="text-white font-semibold">
                        {kelvinToCelsius(planetHistory.avgTemp)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        {t("planetDetail.axialTilt")}
                      </span>
                      <span className="text-white font-semibold">
                        {planetHistory.axialTilt.toFixed(2)}°
                      </span>
                    </div>
                  </div>
                </div>

                {/* Orbital Parameters */}
                <div className="bg-white/5 rounded-lg p-4">
                  <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                    <span>🌌</span>
                    {t("planetDetail.orbitalParameters")}
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        {t("planetDetail.semimajorAxis")}
                      </span>
                      <span className="text-white font-semibold text-xs">
                        {formatNumber(planetHistory.semimajorAxis)} km
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        {t("planetDetail.perihelion")}
                      </span>
                      <span className="text-white font-semibold text-xs">
                        {formatNumber(planetHistory.perihelion)} km
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        {t("planetDetail.aphelion")}
                      </span>
                      <span className="text-white font-semibold text-xs">
                        {formatNumber(planetHistory.aphelion)} km
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        {t("planetDetail.eccentricity")}
                      </span>
                      <span className="text-white font-semibold">
                        {planetHistory.eccentricity.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        {t("planetDetail.inclination")}
                      </span>
                      <span className="text-white font-semibold">
                        {planetHistory.inclination.toFixed(2)}°
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        {t("planetDetail.orbitalPeriod")}
                      </span>
                      <span className="text-white font-semibold">
                        {planetHistory.sideralOrbit.toFixed(2)} days
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">
                        {t("planetDetail.rotationPeriod")}
                      </span>
                      <span className="text-white font-semibold">
                        {planetHistory.sideralRotation.toFixed(2)} hours
                      </span>
                    </div>
                  </div>
                </div>

                {/* Moons */}
                {planetHistory.moons && planetHistory.moons.length > 0 && (
                  <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-lg p-4">
                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <span>🌙</span>
                      {t("planetDetail.moons")} ({planetHistory.moons.length})
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {planetHistory.moons.slice(0, 10).map((moon, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-white/10 rounded-md text-xs text-white border border-white/20"
                        >
                          {moon.moon}
                        </span>
                      ))}
                      {planetHistory.moons.length > 10 && (
                        <span className="px-2 py-1 bg-white/10 rounded-md text-xs text-gray-400 border border-white/20">
                          +{planetHistory.moons.length - 10}{" "}
                          {t("planetDetail.more")}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Data Source */}
                <div className="pt-3 border-t border-white/10">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span>🌐</span>
                    <span>{t("planetDetail.dataFromSolarSystemApi")}</span>
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {!isLoadingHistory && !planetHistory && (
              <div className="text-center py-8">
                <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <h4 className="text-white font-semibold mb-2">
                  {t("planetDetail.unableToLoadHistory")}
                </h4>
                <p className="text-gray-400 text-sm mb-4">
                  {t("planetDetail.failedToFetchData")}
                </p>
                <button
                  onClick={() => {
                    setPlanetHistory(null);
                    setShowHistory(true);
                  }}
                  className="px-4 py-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-400/30 
                    rounded-lg text-white text-sm transition-all"
                >
                  Retry
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats Panel */}
      <AnimatePresence mode="wait">
        {showStats && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: "tween", duration: 0.2 }} // Faster transition
            className="absolute top-20 right-4 z-[60] w-96 bg-black/80 backdrop-blur-md rounded-lg p-3 
          border border-white/20 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white">
                {t("planetDetail.planetStats")}
              </h3>
              <div className="flex items-center gap-2">
                {isLoadingPlanetInfo && (
                  <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                )}
                <button
                  onClick={() => setShowStats(false)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                  title={t("planetDetail.close")}
                >
                  <svg
                    className="w-4 h-4 text-gray-400 hover:text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* NASA Image */}
            {planetInfo?.imageUrl && (
              <div className="mb-2 rounded-lg overflow-hidden border border-white/10">
                <img
                  src={planetInfo.imageUrl}
                  alt={`${planetId} from NASA`}
                  className="w-full h-32 object-cover"
                  onError={(e) => {
                    // Simply hide if image fails to load
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <p className="text-xs text-gray-500 p-1.5 bg-black/40">
                  {planetId === "mars"
                    ? `📸 ${t("planetDetail.latestFromMarsRover")}`
                    : planetId === "earth"
                    ? `🌍 ${t("planetDetail.epicSatelliteImagery")}`
                    : t("planetDetail.nasaImage")}
                </p>
              </div>
            )}

            {/* Description - use translated version if available */}
            {(translatedDescription ||
              t(`planets.${planetId}.description`)) && (
              <p className="text-gray-300 text-xs mb-2 leading-relaxed">
                {isTranslating ? (
                  <span className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    {t("common.loading")}...
                  </span>
                ) : (
                  translatedDescription || t(`planets.${planetId}.description`)
                )}
              </p>
            )}

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">
                  {t("planet.temperature")}:
                </span>
                <span className="text-white font-semibold text-xs">
                  {planetInfo?.stats.temperature || stats.temperature}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{t("planet.gravity")}:</span>
                <span className="text-white font-semibold text-xs">
                  {planetInfo?.stats.gravity || stats.gravity}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{t("planet.diameter")}:</span>
                <span className="text-white font-semibold">
                  {planetInfo?.stats.diameter || stats.diameter}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">{t("planet.dayLength")}:</span>
                <span className="text-white font-semibold text-xs">
                  {planetInfo?.stats.dayLength || stats.dayLength}
                </span>
              </div>

              {/* Additional NASA data */}
              {planetInfo?.stats.mass && (
                <div className="flex justify-between">
                  <span className="text-gray-400">{t("planet.mass")}:</span>
                  <span className="text-white font-semibold text-xs">
                    {planetInfo.stats.mass}
                  </span>
                </div>
              )}
              {planetInfo?.stats.distanceFromSun && (
                <div className="flex justify-between">
                  <span className="text-gray-400">
                    {t("planet.distanceFromSun")}:
                  </span>
                  <span className="text-white font-semibold text-xs">
                    {planetInfo.stats.distanceFromSun}
                  </span>
                </div>
              )}
              {planetInfo?.stats.moons !== undefined && (
                <div className="flex justify-between">
                  <span className="text-gray-400">{t("planet.moons")}:</span>
                  <span className="text-white font-semibold">
                    {planetInfo.stats.moons}
                  </span>
                </div>
              )}
              {planetInfo?.stats.atmosphere && (
                <div className="flex justify-between">
                  <span className="text-gray-400">
                    {t("planet.atmosphere")}:
                  </span>
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
                  <span>{t("planetDetail.dataFromNasa")}</span>
                  {planetInfo.lastUpdated && (
                    <span className="text-gray-600">
                      {" "}
                      • {t("planetDetail.updated")}: {planetInfo.lastUpdated}
                    </span>
                  )}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* NASA Image Gallery */}
      <AnimatePresence mode="wait">
        {showImageGallery && (
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 100, opacity: 0 }}
            transition={{ type: "tween", duration: 0.2 }}
            className="absolute top-20 right-4 z-[60] w-96 bg-black/90 backdrop-blur-md rounded-lg p-3 
          border border-white/20 max-h-[calc(100vh-280px)] overflow-y-auto scrollbar-thin"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Camera className="w-4 h-4" />
                NASA Images
              </h3>
              <button
                onClick={() => setShowImageGallery(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title="Đóng"
              >
                <svg
                  className="w-4 h-4 text-gray-400 hover:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Planet Info Image */}
            {planetInfo?.imageUrl && (
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-white mb-1.5">
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
                    className="w-full h-40 object-cover"
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
                  <div className="p-1.5 bg-black/60">
                    <p className="text-xs text-gray-400">
                      {planetInfo.lastUpdated
                        ? `${t("planetDetail.updated")}: ${
                            planetInfo.lastUpdated
                          }`
                        : t("planetDetail.nasaOfficialImage")}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Additional planet-specific images from APOD */}
            {planetImage && (
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-white mb-1.5">
                  🌌 NASA APOD -{" "}
                  {planetId.charAt(0).toUpperCase() + planetId.slice(1)}
                </h4>
                <div className="rounded-lg overflow-hidden border border-white/20">
                  <img
                    src={planetImage}
                    alt={`${planetId} from NASA APOD`}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}

            {/* Additional Images */}
            {marsRoverImage && planetId === "mars" && (
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-white mb-1.5">
                  📸 Additional Mars Rover Photos
                </h4>
                <div className="rounded-lg overflow-hidden border border-white/20">
                  <img
                    src={marsRoverImage}
                    alt="Mars Rover"
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}

            {earthImage && planetId === "earth" && (
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-white mb-1.5">
                  🛰️ Additional Earth Imagery
                </h4>
                <div className="rounded-lg overflow-hidden border border-white/20">
                  <img
                    src={earthImage}
                    alt="Earth"
                    className="w-full h-32 object-cover"
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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tour Controls */}
      {/* <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 flex gap-2">
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
      </div> */}

      {/* Progress & Achievement - Hide when Quiz is open */}
      {!showQuiz && (
        <div className="absolute bottom-25 right-4 z-50 flex flex-col items-end gap-2">
          {/* Toggle Controls */}
          <div className="flex items-center gap-2">
            {/* Toggle Markers */}
            <button
              onClick={() => setShowMarkers(!showMarkers)}
              className={`px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-300 flex items-center gap-1.5 ${
                showMarkers
                  ? "bg-blue-600/80 text-white border border-blue-400/50"
                  : "bg-black/60 text-gray-400 border border-white/20 hover:bg-black/80"
              }`}
              title={
                showMarkers
                  ? t("planetDetail.hideMarkers")
                  : t("planetDetail.showMarkers")
              }
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                />
              </svg>
              {t("planetDetail.markers")}
            </button>

            {/* Toggle Artifacts */}
            {user && availableArtifacts.length > 0 && (
              <button
                onClick={() => setShowArtifacts(!showArtifacts)}
                className={`px-3 py-2 rounded-lg font-semibold text-xs transition-all duration-300 flex items-center gap-1.5 ${
                  showArtifacts
                    ? "bg-purple-600/80 text-white border border-purple-400/50"
                    : "bg-black/60 text-gray-400 border border-white/20 hover:bg-black/80"
                }`}
                title={
                  showArtifacts
                    ? t("planetDetail.hideArtifacts")
                    : t("planetDetail.showArtifacts")
                }
              >
                <Package className="w-4 h-4" />
                {t("planetDetail.artifacts")}
              </button>
            )}
          </div>

          {/* Artifact Collection Counter */}
          {user && (
            <div className="bg-black/80 backdrop-blur-md rounded-lg p-3 border border-purple-500/30">
              <div className="flex items-center gap-2 mb-2">
                <Package className="w-4 h-4 text-purple-400" />
                <span className="text-white text-sm font-semibold">
                  {t("planetDetail.artifacts")}: {collectedIds.length}/
                  {totalArtifacts}
                </span>
              </div>
              <div className="w-[180px] h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                  style={{
                    width: `${
                      totalArtifacts > 0
                        ? (collectedIds.length / totalArtifacts) * 100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          )}

          {/* Progress bar */}
          <div className="bg-black/80 backdrop-blur-md rounded-lg p-3 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Award className="w-4 h-4 text-yellow-400" />
              <span className="text-white text-sm font-semibold">
                {t("planetDetail.explored")}: {visitedMarkers.size}/
                {markers.length}
              </span>
            </div>
            <div className="w-[180px] h-2 bg-gray-700 rounded-full overflow-hidden">
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
                <span className="text-white font-bold">
                  {t("planetDetail.masterExplorer")}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hide Canvas when Quiz is open to prevent z-index conflicts */}
      {!showQuiz && (
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          gl={{
            antialias: false, // Disable for better performance
            powerPreference: "high-performance",
          }}
          dpr={[1, 1.5]} // Limit pixel ratio for performance
          frameloop="demand" // Only render when needed
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[5, 5, 5]} intensity={1} />
          <pointLight position={[10, 10, 10]} intensity={0.5} />

          {/* Starfield background */}
          <Stars
            radius={100}
            depth={50}
            count={1000}
            factor={4}
            saturation={0}
            fade
            speed={1}
          />

          {/* Planet with rotation */}
          <RotatingPlanet textureUrl={textureUrl} />

          {/* Atmosphere glow */}
          <AtmosphereGlow color={atmosphereColor} />

          {showMarkers &&
            markers.map((marker) => (
              <Marker
                key={marker.id}
                id={marker.id}
                label={marker.name}
                position={marker.position}
                onClick={handleMarkerClick}
                markerRef={(el) => {
                  if (el) markerRefs.current[marker.id] = el;
                }}
                isActive={activeMarker === marker.id}
                isHovered={hoveredMarker === marker.id}
                onHover={setHoveredMarker}
                hideLabel={showArtifactModal}
              />
            ))}

          {/* Artifact Collection System */}
          {user &&
            !artifactsLoading &&
            availableArtifacts.length > 0 &&
            showArtifacts && (
              <ArtifactSpawner
                planetId={planetId}
                planetRadius={2}
                artifacts={availableArtifacts}
                onCollect={handleArtifactClick}
                collectedIds={collectedIds}
              />
            )}

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
      )}

      {activeMarker && !showQuiz && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "tween", duration: 0.2 }}
          className="absolute bottom-4 left-4 max-w-sm bg-black/80 backdrop-blur-md 
          text-white p-4 rounded-lg border border-white/20 shadow-2xl"
        >
          <div className="flex items-start justify-between mb-2">
            <h2 className="text-base font-bold flex items-center gap-2">
              {(() => {
                const marker = markers.find((m) => m.id === activeMarker);
                return marker?.name || "";
              })()}
              {isLoadingMarkerImage && (
                <Loader2 className="w-3 h-3 text-blue-400 animate-spin" />
              )}
            </h2>
            <div className="flex items-center gap-1">
              {visitedMarkers.has(activeMarker) && (
                <div className="bg-green-500/20 px-2 py-1 rounded-full flex items-center gap-1">
                  <Award className="w-3 h-3 text-green-400" />
                  <span className="text-xs text-green-400 font-semibold">
                    {t("planetDetail.visited")}
                  </span>
                </div>
              )}
              <button
                onClick={() => setActiveMarker(null)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors ml-2"
                title={t("planetDetail.close")}
              >
                <svg
                  className="w-4 h-4 text-gray-400 hover:text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Marker Image from NASA APOD */}
          {markerImage && (
            <div className="mb-3 rounded-lg overflow-hidden border border-white/20">
              <img
                src={markerImage.imageUrl}
                alt={markerImage.title || "Landmark"}
                className="w-full h-32 object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
              {markerImage.title && (
                <div className="p-1.5 bg-black/60">
                  <p className="text-xs text-white font-semibold">
                    📸 {markerImage.title}
                  </p>
                  {markerImage.explanation && (
                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                      {markerImage.explanation}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <p className="text-sm text-gray-300 leading-relaxed mb-2">
            {markers.find((m) => m.id === activeMarker)?.description}
          </p>

          {/* Detailed marker information */}
          {(() => {
            const marker = markers.find((m) => m.id === activeMarker);
            if (!marker) return null;

            const hasDetails =
              marker.type ||
              marker.height ||
              marker.depth ||
              marker.diameter ||
              marker.coordinates ||
              marker.namedAfter;

            if (!hasDetails) return null;

            return (
              <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                {marker.type && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {t("planetDetail.type")}
                    </span>
                    <span className="text-xs text-white font-semibold capitalize">
                      {marker.type}
                    </span>
                  </div>
                )}
                {marker.height && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {t("planetDetail.height")}
                    </span>
                    <span className="text-xs text-white font-semibold">
                      {marker.height}
                    </span>
                  </div>
                )}
                {marker.depth && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {t("planetDetail.depth")}
                    </span>
                    <span className="text-xs text-white font-semibold">
                      {marker.depth}
                    </span>
                  </div>
                )}
                {marker.diameter && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {t("planetDetail.diameter")}
                    </span>
                    <span className="text-xs text-white font-semibold">
                      {marker.diameter}
                    </span>
                  </div>
                )}
                {marker.coordinates && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {t("planetDetail.coordinates")}
                    </span>
                    <span className="text-xs text-white font-semibold">
                      {marker.coordinates.latitude.toFixed(2)}°,{" "}
                      {marker.coordinates.longitude.toFixed(2)}°
                    </span>
                  </div>
                )}
                {marker.namedAfter && (
                  <div className="mt-3 pt-3 border-t border-white/10">
                    <p className="text-xs text-gray-400">
                      {t("planetDetail.namedAfter")}:{" "}
                      <span className="text-white">{marker.namedAfter}</span>
                    </p>
                  </div>
                )}
                {marker.discoveryDate && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {t("planetDetail.discovery")}
                    </span>
                    <span className="text-xs text-white font-semibold">
                      {marker.discoveryDate}
                    </span>
                  </div>
                )}
                <div className="mt-3 pt-3 border-t border-white/10">
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <span>🛰️</span>
                    <span>{t("planetDetail.nasaVerified")}</span>
                  </p>
                </div>
              </div>
            );
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
        </motion.div>
      )}

      {/* AI Chatbot Panel - Hide when Quiz is open */}
      {!showQuiz &&
        (aiCompanion ? (
          <ChatbotPanel
            planetId={planetId}
            planetName={planetId.charAt(0).toUpperCase() + planetId.slice(1)}
            ai={aiCompanion}
            profile={profile}
            isOpen={isChatbotOpen}
            onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
          />
        ) : (
          /* Debug: Show warning if AI companion not found */
          <div className="fixed bottom-8 right-6 z-50 p-4 bg-red-500/20 border border-red-500 rounded-lg text-white text-sm">
            ⚠️ AI Companion not found for: {planetId}
          </div>
        ))}

      {/* Quiz Panel */}
      <AnimatePresence>
        {showQuiz && aiCompanion && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black"
          >
            <QuizPanel
              planetId={planetId}
              ai={aiCompanion}
              onComplete={(result) => {
                console.log("Quiz completed:", result);
                // Save the result to profile if needed
                setShowQuiz(false);
              }}
            />
            {/* Close button */}
            <motion.button
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowQuiz(false)}
              className="fixed top-6 right-6 z-[101] p-3 bg-white/10 backdrop-blur-xl 
                rounded-full border border-white/20 hover:bg-white/20 transition-all"
              title="Đóng Quiz"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-6 h-6 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Artifact Collection Modal */}
      <ArtifactCollectionModal
        artifact={selectedArtifact}
        isOpen={showArtifactModal}
        onClose={() => {
          setShowArtifactModal(false);
          setSelectedArtifact(null);
        }}
      />

      {/* Audio Settings - Only show when Quiz is not open */}
      {!showQuiz && <AudioSettings />}
    </div>
  );
}
