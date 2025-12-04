import React, { useEffect, useState, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Artifact, SpawnedArtifact } from "../types/artifact";
import ArtifactMesh from "./ArtifactMesh";

interface ArtifactSpawnerProps {
  planetId: string;
  planetRadius: number;
  artifacts: Artifact[];
  onCollect: (artifact: Artifact) => void;
  collectedIds: string[];
}

export const ArtifactSpawner: React.FC<ArtifactSpawnerProps> = ({
  planetRadius,
  artifacts,
  onCollect,
  collectedIds,
}) => {
  const [spawnedArtifacts, setSpawnedArtifacts] = useState<SpawnedArtifact[]>(
    []
  );

  useEffect(() => {
    // Spawn artifacts based on their location
    const spawned = artifacts
      .filter((artifact) => !collectedIds.includes(artifact.id))
      .map((artifact) => {
        const position = calculateArtifactPosition(artifact, planetRadius);
        return {
          ...artifact,
          position: {
            ...artifact.position,
            ...position,
          },
          isVisible: true,
        } as SpawnedArtifact;
      });

    setSpawnedArtifacts(spawned);
  }, [artifacts, planetRadius, collectedIds]);

  return (
    <group>
      {/* Surface artifacts */}
      {spawnedArtifacts
        .filter((a) => a.location === "surface")
        .map((artifact) => (
          <SurfaceArtifact
            key={artifact.id}
            artifact={artifact}
            planetRadius={planetRadius}
            onCollect={onCollect}
          />
        ))}

      {/* Orbital artifacts */}
      {spawnedArtifacts
        .filter((a) => a.location !== "surface")
        .map((artifact) => (
          <OrbitalArtifact
            key={artifact.id}
            artifact={artifact}
            planetRadius={planetRadius}
            onCollect={onCollect}
          />
        ))}

      {/* Orbital zones visualization (optional debug) */}
      {/* <OrbitalZonesHelper planetRadius={planetRadius} /> */}
    </group>
  );
};

// Surface artifact component
const SurfaceArtifact: React.FC<{
  artifact: SpawnedArtifact;
  planetRadius: number;
  onCollect: (artifact: Artifact) => void;
}> = ({ artifact, planetRadius, onCollect }) => {
  const groupRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (
      !groupRef.current ||
      !artifact.position.latitude ||
      !artifact.position.longitude
    ) {
      return;
    }

    // Convert lat/long to 3D position on sphere
    const lat = (artifact.position.latitude || 0) * (Math.PI / 180);
    const lon = (artifact.position.longitude || 0) * (Math.PI / 180);
    const altitude = artifact.position.altitude || 0;
    const radius = planetRadius + altitude;

    const x = radius * Math.cos(lat) * Math.cos(lon);
    const y = radius * Math.sin(lat);
    const z = radius * Math.cos(lat) * Math.sin(lon);

    groupRef.current.position.set(x, y, z);

    // Make artifact face outward from planet
    groupRef.current.lookAt(x * 2, y * 2, z * 2);
  }, [artifact, planetRadius]);

  return (
    <group ref={groupRef}>
      <ArtifactMesh
        artifact={artifact}
        onClick={onCollect}
        isCollected={false}
      />
    </group>
  );
};

// Orbital artifact component
const OrbitalArtifact: React.FC<{
  artifact: SpawnedArtifact;
  planetRadius: number;
  onCollect: (artifact: Artifact) => void;
}> = ({ artifact, planetRadius, onCollect }) => {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();

    // Orbital motion - orbitalRadius is multiplier of planetRadius
    const radiusMultiplier = artifact.position.orbitalRadius || 2;
    const radius = planetRadius * radiusMultiplier;
    const angle =
      ((artifact.position.orbitalAngle || 0) + time * 10) * (Math.PI / 180);
    const inclination = (artifact.position.inclination || 0) * (Math.PI / 180);

    const x = radius * Math.cos(angle) * Math.cos(inclination);
    const y = radius * Math.sin(inclination);
    const z = radius * Math.sin(angle) * Math.cos(inclination);

    groupRef.current.position.set(x, y, z);
  });

  return (
    <group ref={groupRef}>
      <ArtifactMesh
        artifact={artifact}
        onClick={onCollect}
        isCollected={false}
      />
    </group>
  );
};

// Helper to calculate artifact 3D position
function calculateArtifactPosition(
  artifact: Artifact,
  planetRadius: number
): { x?: number; y?: number; z?: number } {
  if (artifact.location === "surface") {
    const lat = (artifact.position.latitude || 0) * (Math.PI / 180);
    const lon = (artifact.position.longitude || 0) * (Math.PI / 180);
    const altitude = artifact.position.altitude || 0;
    const radius = planetRadius + altitude;

    return {
      x: radius * Math.cos(lat) * Math.cos(lon),
      y: radius * Math.sin(lat),
      z: radius * Math.cos(lat) * Math.sin(lon),
    };
  } else {
    // Orbital position
    const radius = artifact.position.orbitalRadius || planetRadius * 2;
    const angle = (artifact.position.orbitalAngle || 0) * (Math.PI / 180);
    const inclination = (artifact.position.inclination || 0) * (Math.PI / 180);

    return {
      x: radius * Math.cos(angle) * Math.cos(inclination),
      y: radius * Math.sin(inclination),
      z: radius * Math.sin(angle) * Math.cos(inclination),
    };
  }
}

export default ArtifactSpawner;
