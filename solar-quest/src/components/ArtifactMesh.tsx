import React, { useRef, useMemo, Suspense } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import type { Artifact, ArtifactRarity } from "../types/artifact";

interface ArtifactMeshProps {
  artifact: Artifact;
  onClick: (artifact: Artifact) => void;
  isCollected?: boolean;
}

// Rarity color mapping
const RARITY_COLORS: Record<ArtifactRarity, string> = {
  common: "#ffffff",
  uncommon: "#1eff00",
  rare: "#0070dd",
  epic: "#a335ee",
  legendary: "#ff8000",
};

// Rarity glow intensity
const RARITY_GLOW: Record<ArtifactRarity, number> = {
  common: 0.5,
  uncommon: 0.8,
  rare: 1.2,
  epic: 1.8,
  legendary: 2.5,
};

// Component to load and display GLTF model
const ModelMesh: React.FC<{ modelPath: string; scale?: number }> = ({
  modelPath,
  scale = 1,
}) => {
  const { scene } = useGLTF(modelPath);
  const clonedScene = useMemo(() => scene.clone(), [scene]);

  return <primitive object={clonedScene} scale={scale} />;
};

export const ArtifactMesh: React.FC<ArtifactMeshProps> = ({
  artifact,
  onClick,
  isCollected = false,
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  const glowColor = artifact.glowColor || RARITY_COLORS[artifact.rarity];
  const glowIntensity = RARITY_GLOW[artifact.rarity];

  // Animation
  useFrame((state) => {
    if (!glowRef.current) return;

    const time = state.clock.getElapsedTime();
    const targetRef = artifact.modelUrl ? groupRef.current : meshRef.current;

    if (targetRef) {
      // Float animation only - no rotation
      targetRef.position.y = Math.sin(time * 2) * 0.1;
    }

    // Pulsing glow
    const pulseScale = 1 + Math.sin(time * 3) * 0.15;
    glowRef.current.scale.setScalar(pulseScale);

    // Glow opacity animation
    if (glowRef.current.material instanceof THREE.MeshBasicMaterial) {
      glowRef.current.material.opacity = 0.3 + Math.sin(time * 2) * 0.2;
    }
  });

  // Create geometry based on category
  const geometry = useMemo(() => {
    switch (artifact.category) {
      case "spacecraft-debris":
        return <boxGeometry args={[0.3, 0.3, 0.1]} />;
      case "scientific-equipment":
        return <cylinderGeometry args={[0.15, 0.15, 0.4, 8]} />;
      case "natural-object":
        return <dodecahedronGeometry args={[0.2, 0]} />;
      case "mystery-artifact":
        return <octahedronGeometry args={[0.25, 0]} />;
      case "historical-relic":
        return <torusGeometry args={[0.2, 0.08, 16, 32]} />;
      default:
        return <sphereGeometry args={[0.2, 16, 16]} />;
    }
  }, [artifact.category]);

  // Material based on rarity
  const material = useMemo(() => {
    const color = new THREE.Color(glowColor);
    return (
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={isCollected ? 0.1 : glowIntensity * 0.5}
        metalness={0.8}
        roughness={0.2}
        transparent={isCollected}
        opacity={isCollected ? 0.3 : 1}
      />
    );
  }, [glowColor, glowIntensity, isCollected]);

  if (isCollected) {
    return null; // Don't render collected artifacts
  }

  return (
    <group
      position={[0, 0, 0]}
      scale={artifact.scale || 1}
      onClick={(e) => {
        e.stopPropagation();
        onClick(artifact);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        document.body.style.cursor = "auto";
      }}
    >
      {/* Main artifact - GLTF model or fallback geometry */}
      {artifact.modelUrl ? (
        <Suspense fallback={null}>
          <group
            ref={groupRef}
            castShadow
            rotation={artifact.initialRotation || [0, 0, 0]}
          >
            <ModelMesh modelPath={artifact.modelUrl} scale={1} />
          </group>
        </Suspense>
      ) : (
        <mesh ref={meshRef} castShadow>
          {geometry}
          {material}
        </mesh>
      )}

      {/* Outer glow sphere */}
      <mesh ref={glowRef} scale={1.5}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial
          color={glowColor}
          transparent
          opacity={0.3}
          blending={THREE.AdditiveBlending}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Particle ring for legendary items */}
      {artifact.rarity === "legendary" && <ParticleRing color={glowColor} />}
    </group>
  );
};

// Particle ring for legendary artifacts
const ParticleRing: React.FC<{ color: string }> = ({ color }) => {
  const particlesRef = useRef<THREE.Points>(null);

  const particlesGeometry = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(50 * 3);

    for (let i = 0; i < 50; i++) {
      const angle = (i / 50) * Math.PI * 2;
      const radius = 0.5;
      positions[i * 3] = Math.cos(angle) * radius;
      positions[i * 3 + 1] = Math.sin(angle) * radius * 0.1;
      positions[i * 3 + 2] = Math.sin(angle) * radius;
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geometry;
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    particlesRef.current.rotation.y = state.clock.getElapsedTime() * 0.5;
  });

  return (
    <points ref={particlesRef} geometry={particlesGeometry}>
      <pointsMaterial
        size={0.05}
        color={color}
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default ArtifactMesh;
