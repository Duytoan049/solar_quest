import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Audio System Hook
 * Quản lý âm thanh cho Solar Quest game
 * Hỗ trợ: Music, Sound Effects, UI Sounds, Achievements
 */

export type SoundCategory = 'music' | 'sfx' | 'ui' | 'achievement';

interface AudioOptions {
  volume?: number;
  loop?: boolean;
  category?: SoundCategory;
}

interface UseAudioReturn {
  // Playback controls
  play: (soundKey: string, options?: AudioOptions) => void;
  stop: (soundKey: string) => void;
  stopAll: () => void;
  
  // Music controls
  playMusic: (musicKey: string, fadeIn?: boolean) => void;
  stopMusic: (fadeOut?: boolean) => void;
  
  // Volume controls
  setMasterVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setSFXVolume: (volume: number) => void;
  
  // State
  isMuted: boolean;
  toggleMute: () => void;
  isLoading: boolean;
}

// Sound file paths mapping
const SOUND_PATHS: Record<string, string> = {
  // Game Effects
  'shoot': '/sounds/effects/shoot.mp3',
  'hit': '/sounds/effects/hit.mp3',
  'explosion': '/sounds/effects/explosion.mp3',
  'powerup': '/sounds/effects/powerup.mp3',
  'shield': '/sounds/effects/shield.mp3',
  'warning': '/sounds/effects/warning.mp3',
  
  // UI Sounds
  'click': '/sounds/ui/click.mp3',
  'hover': '/sounds/ui/hover.mp3',
  'success': '/sounds/ui/success.mp3',
  'error': '/sounds/ui/error.mp3',
  'collect': '/sounds/ui/collect.mp3',
  'notification': '/sounds/ui/notification.mp3',
  'transition': '/sounds/ui/transition.mp3',
  'whoosh': '/sounds/ui/whoosh.mp3',
  
  // Achievements
  'badge-unlock': '/sounds/achievements/badge-unlock.mp3',
  'level-up': '/sounds/achievements/level-up.mp3',
  'fanfare': '/sounds/achievements/fanfare.mp3',
  
  // Planet Themes
  'mercury_theme': '/sounds/music/mercury_theme.mp3',
  'venus_theme': '/sounds/music/venus_theme.mp3',
  'earth_theme': '/sounds/music/earth_theme.mp3',
  'mars_theme': '/sounds/music/mars_theme.mp3',
  'jupiter_theme': '/sounds/music/jupiter_theme.mp3',
  'saturn_theme': '/sounds/music/saturn_theme.mp3',
  'uranus_theme': '/sounds/music/uranus_theme.mp3',
  'neptune_theme': '/sounds/music/neptune_theme.mp3',
  
  // Menu Music
  'main-menu': '/sounds/music/main-menu.mp3',
  'solar-system': '/sounds/music/solar-system.mp3',
  'victory-theme': '/sounds/music/victory-theme.mp3',
};

export function useAudio(): UseAudioReturn {
  const audioInstancesRef = useRef<Map<string, HTMLAudioElement>>(new Map());
  const currentMusicRef = useRef<HTMLAudioElement | null>(null);
  const currentMusicKeyRef = useRef<string | null>(null);
  
  const [isMuted, setIsMuted] = useState(() => {
    const saved = localStorage.getItem('audio_muted');
    return saved === 'true';
  });
  
  // Volume state from localStorage
  const [masterVolume, setMasterVolumeState] = useState(() => {
    const saved = localStorage.getItem('audio_master_volume');
    return saved ? parseFloat(saved) : 0.7;
  });
  
  const [musicVolume, setMusicVolumeState] = useState(() => {
    const saved = localStorage.getItem('audio_music_volume');
    return saved ? parseFloat(saved) : 0.5;
  });
  
  const [sfxVolume, setSFXVolumeState] = useState(() => {
    const saved = localStorage.getItem('audio_sfx_volume');
    return saved ? parseFloat(saved) : 0.8;
  });

  // Load audio file with error handling
  const loadAudio = useCallback((soundKey: string): HTMLAudioElement | null => {
    try {
      const path = SOUND_PATHS[soundKey];
      if (!path) {
        console.warn(`[Audio] Sound key not found: ${soundKey}`);
        return null;
      }

      // Check if already loaded
      if (audioInstancesRef.current.has(soundKey)) {
        return audioInstancesRef.current.get(soundKey)!;
      }

      // Create new audio instance
      const audio = new Audio(path);
      audio.preload = 'auto';
      
      // Error handling
      audio.addEventListener('error', (e) => {
        console.warn(`[Audio] Failed to load: ${soundKey} (${path})`, e);
        audioInstancesRef.current.delete(soundKey);
      });

      audioInstancesRef.current.set(soundKey, audio);
      return audio;
    } catch (error) {
      console.error(`[Audio] Error loading ${soundKey}:`, error);
      return null;
    }
  }, []);

  // Calculate final volume based on category
  const calculateVolume = useCallback((category: SoundCategory, baseVolume: number): number => {
    if (isMuted) return 0;
    
    let categoryVolume = 1;
    if (category === 'music') {
      categoryVolume = musicVolume;
    } else if (category === 'sfx' || category === 'ui' || category === 'achievement') {
      categoryVolume = sfxVolume;
    }
    
    return masterVolume * categoryVolume * baseVolume;
  }, [isMuted, masterVolume, musicVolume, sfxVolume]);

  // Play sound effect
  const play = useCallback((soundKey: string, options: AudioOptions = {}) => {
    const {
      volume = 0.7,
      loop = false,
      category = 'sfx'
    } = options;

    try {
      const audio = loadAudio(soundKey);
      if (!audio) return;

      audio.currentTime = 0;
      audio.loop = loop;
      audio.volume = calculateVolume(category, volume);
      
      audio.play().catch((error) => {
        console.warn(`[Audio] Playback failed for ${soundKey}:`, error);
      });
    } catch (error) {
      console.error(`[Audio] Error playing ${soundKey}:`, error);
    }
  }, [loadAudio, calculateVolume]);

  // Stop sound
  const stop = useCallback((soundKey: string) => {
    try {
      const audio = audioInstancesRef.current.get(soundKey);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    } catch (error) {
      console.error(`[Audio] Error stopping ${soundKey}:`, error);
    }
  }, []);

  // Stop all sounds
  const stopAll = useCallback(() => {
    try {
      audioInstancesRef.current.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
    } catch (error) {
      console.error('[Audio] Error stopping all sounds:', error);
    }
  }, []);

  // Stop music with fade out - DEFINED BEFORE playMusic
  const stopMusic = useCallback((fadeOut: boolean = true) => {
    try {
      if (!currentMusicRef.current) return;

      const audio = currentMusicRef.current;

      if (fadeOut) {
        let currentVolume = audio.volume;
        const fadeInterval = setInterval(() => {
          currentVolume -= audio.volume / 20; // 20 steps = 1 second
          if (currentVolume <= 0) {
            currentVolume = 0;
            audio.pause();
            audio.currentTime = 0;
            clearInterval(fadeInterval);
          }
          audio.volume = Math.max(0, currentVolume);
        }, 50);
      } else {
        audio.pause();
        audio.currentTime = 0;
      }

      currentMusicRef.current = null;
      currentMusicKeyRef.current = null;
    } catch (error) {
      console.error('[Audio] Error stopping music:', error);
    }
  }, []);

  // Play music with fade in - DEFINED AFTER stopMusic
  const playMusic = useCallback((musicKey: string, fadeIn: boolean = true) => {
    try {
      // Stop current music if different
      if (currentMusicKeyRef.current === musicKey) return;
      
      if (currentMusicRef.current) {
        stopMusic(true);
      }

      const audio = loadAudio(musicKey);
      if (!audio) return;

      currentMusicRef.current = audio;
      currentMusicKeyRef.current = musicKey;

      audio.loop = true;
      
      if (fadeIn) {
        audio.volume = 0;
        audio.play().catch((error) => {
          console.warn(`[Audio] Music playback failed for ${musicKey}:`, error);
        });

        // Fade in over 2 seconds
        let currentVolume = 0;
        const targetVolume = calculateVolume('music', 0.5);
        const fadeInterval = setInterval(() => {
          currentVolume += targetVolume / 40; // 40 steps = 2 seconds at 50ms interval
          if (currentVolume >= targetVolume) {
            currentVolume = targetVolume;
            clearInterval(fadeInterval);
          }
          if (audio) audio.volume = currentVolume;
        }, 50);
      } else {
        audio.volume = calculateVolume('music', 0.5);
        audio.play().catch((error) => {
          console.warn(`[Audio] Music playback failed for ${musicKey}:`, error);
        });
      }
    } catch (error) {
      console.error(`[Audio] Error playing music ${musicKey}:`, error);
    }
  }, [loadAudio, calculateVolume, stopMusic]);

  // Volume controls
  const setMasterVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setMasterVolumeState(clampedVolume);
    localStorage.setItem('audio_master_volume', clampedVolume.toString());
    
    // Update current music volume
    if (currentMusicRef.current) {
      currentMusicRef.current.volume = calculateVolume('music', 0.5);
    }
  }, [calculateVolume]);

  const setMusicVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setMusicVolumeState(clampedVolume);
    localStorage.setItem('audio_music_volume', clampedVolume.toString());
    
    // Update current music volume
    if (currentMusicRef.current) {
      currentMusicRef.current.volume = calculateVolume('music', 0.5);
    }
  }, [calculateVolume]);

  const setSFXVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setSFXVolumeState(clampedVolume);
    localStorage.setItem('audio_sfx_volume', clampedVolume.toString());
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    setIsMuted(newMutedState);
    localStorage.setItem('audio_muted', newMutedState.toString());
    
    // Update all audio volumes
    if (currentMusicRef.current) {
      currentMusicRef.current.volume = newMutedState ? 0 : calculateVolume('music', 0.5);
    }
  }, [isMuted, calculateVolume]);

  // Cleanup on unmount
  useEffect(() => {
    const instances = audioInstancesRef.current;
    return () => {
      stopAll();
      stopMusic(false);
      instances.clear();
    };
  }, [stopAll, stopMusic]);

  return {
    play,
    stop,
    stopAll,
    playMusic,
    stopMusic,
    setMasterVolume,
    setMusicVolume,
    setSFXVolume,
    isMuted,
    toggleMute
  };
}
