import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getAvailableArtifacts,
  collectArtifact,
  getArtifactProgress,
  isArtifactCollected
} from '../services/artifactService';
import type { Artifact } from '../types/artifact';

export const useArtifactCollection = (planetId: string) => {
  const { user } = useAuth();
  const [availableArtifacts, setAvailableArtifacts] = useState<Artifact[]>([]);
  const [collectedIds, setCollectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [collecting, setCollecting] = useState(false);

  const loadArtifacts = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get available artifacts (not collected)
      const artifacts = await getAvailableArtifacts(user.uid, planetId);
      setAvailableArtifacts(artifacts);

      // Get collection progress to know which are collected
      const progress = await getArtifactProgress(user.uid);
      if (progress) {
        const collected = Object.keys(progress)
          .filter(key => key.startsWith('collected.'))
          .map(key => key.replace('collected.', ''));
        setCollectedIds(collected);
      }
    } catch (error) {
      console.error('Error loading artifacts:', error);
    } finally {
      setLoading(false);
    }
  }, [user, planetId]);

  // Load available artifacts when planet changes
  useEffect(() => {
    if (!user || !planetId) return;

    loadArtifacts();
  }, [user, planetId, loadArtifacts]);

  const handleCollect = async (artifact: Artifact): Promise<boolean> => {
    if (!user || collecting) return false;

    try {
      setCollecting(true);

      // Collect the artifact
      const success = await collectArtifact(user.uid, artifact);

      if (success) {
        // Update local state
        setCollectedIds(prev => [...prev, artifact.id]);
        setAvailableArtifacts(prev =>
          prev.filter(a => a.id !== artifact.id)
        );

        return true;
      }

      return false;
    } catch (error) {
      console.error('Error collecting artifact:', error);
      return false;
    } finally {
      setCollecting(false);
    }
  };

  const checkIfCollected = async (artifactId: string): Promise<boolean> => {
    if (!user) return false;
    return await isArtifactCollected(user.uid, artifactId);
  };

  const refresh = () => {
    loadArtifacts();
  };

  return {
    availableArtifacts,
    collectedIds,
    loading,
    collecting,
    handleCollect,
    checkIfCollected,
    refresh
  };
};

export default useArtifactCollection;
