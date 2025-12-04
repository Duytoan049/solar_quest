/**
 * Artifact Collection Service
 * Manages artifact collection progress and persistence
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import type { Artifact, ArtifactCollectionProgress } from '../types/artifact';
import { PLANET_ARTIFACTS } from '../data/planetArtifacts';

const COLLECTION_NAME = 'artifactCollections';

/**
 * Get user's artifact collection progress
 */
export async function getArtifactProgress(
  userId: string
): Promise<ArtifactCollectionProgress | null> {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as ArtifactCollectionProgress;
    }

    // Initialize new progress
    const newProgress = initializeProgress(userId);
    await setDoc(docRef, newProgress);
    return newProgress;
  } catch (error) {
    console.error('Error getting artifact progress:', error);
    return null;
  }
}

/**
 * Mark artifact as collected
 */
export async function collectArtifact(
  userId: string,
  artifact: Artifact
): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    const progress = await getArtifactProgress(userId);

    if (!progress) return false;

    // Check if already collected
    const collectedKey = `collected.${artifact.id}`;
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();

    if (data?.[collectedKey]) {
      console.log('Artifact already collected');
      return false;
    }

    // Update collection
    const updates: Record<string, unknown> = {
      totalCollected: progress.totalCollected + 1,
      [`collected.${artifact.id}`]: {
        artifactId: artifact.id,
        planetId: artifact.planetId,
        collectedAt: serverTimestamp(),
        points: artifact.points
      },
      lastCollected: {
        artifactId: artifact.id,
        planetId: artifact.planetId,
        timestamp: serverTimestamp()
      }
    };

    // Update planet stats
    const planetKey = `byPlanet.${artifact.planetId}`;
    if (progress.byPlanet[artifact.planetId]) {
      updates[`${planetKey}.collected`] =
        progress.byPlanet[artifact.planetId].collected + 1;
      updates[`${planetKey}.percentage`] =
        ((progress.byPlanet[artifact.planetId].collected + 1) /
          progress.byPlanet[artifact.planetId].total) * 100;
    }

    // Update rarity count
    updates[`byRarity.${artifact.rarity}`] =
      (progress.byRarity[artifact.rarity] || 0) + 1;

    // Update category count
    updates[`byCategory.${artifact.category}`] =
      (progress.byCategory[artifact.category] || 0) + 1;

    // Add rare finds
    if (artifact.rarity === 'epic' || artifact.rarity === 'legendary') {
      updates.rareFinds = [...(progress.rareFinds || []), artifact.id];
    }

    // Add badges
    if (artifact.badge) {
      const badges = new Set(progress.badges || []);
      badges.add(artifact.badge);
      updates.badges = Array.from(badges);
    }

    await updateDoc(docRef, updates);

    // Check and award achievements
    await checkAchievements(userId, progress.totalCollected + 1);

    return true;
  } catch (error) {
    console.error('Error collecting artifact:', error);
    return false;
  }
}

/**
 * Check if artifact is collected
 */
export async function isArtifactCollected(
  userId: string,
  artifactId: string
): Promise<boolean> {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return false;

    const data = docSnap.data();
    return !!data[`collected.${artifactId}`];
  } catch (error) {
    console.error('Error checking artifact:', error);
    return false;
  }
}

/**
 * Get collected artifacts for a planet
 */
export async function getCollectedArtifacts(
  userId: string,
  planetId: string
): Promise<Artifact[]> {
  try {
    const progress = await getArtifactProgress(userId);
    if (!progress) return [];

    const docRef = doc(db, COLLECTION_NAME, userId);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();

    if (!data) return [];

    const planetArtifacts = PLANET_ARTIFACTS[planetId] || [];
    const collected = planetArtifacts.filter(artifact =>
      data[`collected.${artifact.id}`]
    );

    return collected;
  } catch (error) {
    console.error('Error getting collected artifacts:', error);
    return [];
  }
}

/**
 * Get available (not collected) artifacts for a planet
 */
export async function getAvailableArtifacts(
  userId: string,
  planetId: string
): Promise<Artifact[]> {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data();

    const planetArtifacts = PLANET_ARTIFACTS[planetId] || [];

    if (!data) return planetArtifacts;

    const available = planetArtifacts.filter(artifact =>
      !data[`collected.${artifact.id}`]
    );

    // Apply spawn chance filter
    return available.filter(artifact =>
      Math.random() * 100 < artifact.spawnChance
    );
  } catch (error) {
    console.error('Error getting available artifacts:', error);
    return PLANET_ARTIFACTS[planetId] || [];
  }
}

/**
 * Initialize collection progress for new user
 */
function initializeProgress(userId: string): ArtifactCollectionProgress {
  const byPlanet: Record<string, { collected: number; total: number; percentage: number }> = {};
  let totalArtifacts = 0;

  Object.entries(PLANET_ARTIFACTS).forEach(([planetId, artifacts]) => {
    byPlanet[planetId] = {
      collected: 0,
      total: artifacts.length,
      percentage: 0
    };
    totalArtifacts += artifacts.length;
  });

  return {
    userId,
    totalCollected: 0,
    totalArtifacts,
    byPlanet,
    byRarity: {
      common: 0,
      uncommon: 0,
      rare: 0,
      epic: 0,
      legendary: 0
    },
    byCategory: {
      'spacecraft-debris': 0,
      'scientific-equipment': 0,
      'natural-object': 0,
      'mystery-artifact': 0,
      'historical-relic': 0
    },
    badges: [],
    achievements: [],
    rareFinds: []
  };
}

/**
 * Check and award achievements based on collection milestones
 */
async function checkAchievements(userId: string, totalCollected: number) {
  const achievements: string[] = [];

  if (totalCollected >= 1) achievements.push('first-discovery');
  if (totalCollected >= 10) achievements.push('novice-collector');
  if (totalCollected >= 25) achievements.push('solar-detective');
  if (totalCollected >= 50) achievements.push('master-explorer');
  if (totalCollected >= 100) achievements.push('legendary-collector');

  if (achievements.length > 0) {
    const docRef = doc(db, COLLECTION_NAME, userId);
    await updateDoc(docRef, {
      achievements: achievements
    });
  }
}

/**
 * Get total points from collected artifacts
 */
export async function getCollectionPoints(userId: string): Promise<number> {
  try {
    const docRef = doc(db, COLLECTION_NAME, userId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) return 0;

    const data = docSnap.data();
    let totalPoints = 0;

    Object.keys(data).forEach(key => {
      if (key.startsWith('collected.')) {
        totalPoints += data[key].points || 0;
      }
    });

    return totalPoints;
  } catch (error) {
    console.error('Error calculating collection points:', error);
    return 0;
  }
}

/**
 * Get collection statistics
 */
export async function getCollectionStats(userId: string) {
  const progress = await getArtifactProgress(userId);
  if (!progress) return null;

  const completionRate = (progress.totalCollected / progress.totalArtifacts) * 100;
  const totalPoints = await getCollectionPoints(userId);

  return {
    totalCollected: progress.totalCollected,
    totalArtifacts: progress.totalArtifacts,
    completionRate: Math.round(completionRate * 10) / 10,
    totalPoints,
    badges: progress.badges.length,
    achievements: progress.achievements.length,
    rareFinds: progress.rareFinds.length
  };
}
