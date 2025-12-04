/**
 * Artifact Collection System Types
 * Defines collectible objects on planet surfaces and in orbit
 */

import type * as THREE from 'three';

export type ArtifactLocation = 'surface' | 'low-orbit' | 'medium-orbit' | 'high-orbit';

export type ArtifactCategory =
  | 'spacecraft-debris'    // Mảnh vỡ tàu vũ trụ
  | 'scientific-equipment' // Thiết bị khoa học
  | 'natural-object'       // Vật thể tự nhiên
  | 'mystery-artifact'     // Đồ vật bí ẩn
  | 'historical-relic';    // Di vật lịch sử

export type ArtifactRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface ArtifactPosition {
  // For surface artifacts
  latitude?: number;  // -90 to 90
  longitude?: number; // -180 to 180
  altitude?: number;  // Height above surface

  // For orbital artifacts
  orbitalRadius?: number; // Distance from planet center
  orbitalAngle?: number;  // 0 to 360 degrees
  inclination?: number;   // Orbital plane tilt
}

export interface Artifact {
  id: string;
  planetId: string;

  // Basic Info
  name: string;
  category: ArtifactCategory;
  rarity: ArtifactRarity;

  // Description
  description: string;
  story: string; // Backstory/lore
  scientificValue: string; // Giá trị khoa học

  // Location
  location: ArtifactLocation;
  position: ArtifactPosition;
  spawnChance: number; // 0-100%, for random spawns

  // Visual
  modelUrl?: string; // Path to 3D model
  iconUrl?: string;
  glowColor?: string; // For space artifacts
  scale?: number;
  initialRotation?: [number, number, number]; // [x, y, z] rotation in radians

  // Rewards
  points: number;
  badge?: string;
  unlocks?: string[]; // Unlock other content

  // Collection Status
  isCollected: boolean;
  collectedAt?: Date;
  collectionCount?: number; // How many times collected
}

export interface OrbitZone {
  name: string;
  minRadius: number;
  maxRadius: number;
  artifactDensity: number; // Number of artifacts in this zone
  difficulty: number; // 1-5, how hard to navigate
}

export interface ArtifactCollectionProgress {
  userId: string;
  totalCollected: number;
  totalArtifacts: number;

  byPlanet: Record<string, {
    collected: number;
    total: number;
    percentage: number;
  }>;

  byRarity: Record<ArtifactRarity, number>;
  byCategory: Record<ArtifactCategory, number>;

  badges: string[];
  achievements: string[];

  rareFinds: string[]; // IDs of legendary/epic artifacts
  lastCollected?: {
    artifactId: string;
    planetId: string;
    timestamp: Date;
  };
}

export interface SpawnedArtifact extends Artifact {
  // Runtime properties for 3D scene
  mesh?: THREE.Mesh | THREE.Object3D;
  sprite?: THREE.Sprite;
  animationMixer?: THREE.AnimationMixer;
  isVisible: boolean;
  distanceFromCamera?: number;
}
