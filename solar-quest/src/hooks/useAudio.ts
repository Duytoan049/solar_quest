/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useCallback, useSyncExternalStore } from 'react';

/**
 * Audio System Hook
 * Quản lý âm thanh cho Solar Quest game
 * Hỗ trợ: Music, Sound Effects, UI Sounds, Achievements
 */

export type SoundCategory = 'music' | 'sfx' | 'ui' | 'achievement';

type AudioState = {
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;
  isMuted: boolean;
};

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
  playMusic: (musicKey: string, options?: { loop?: boolean }) => void;
  stopMusic: (fadeOut?: boolean) => void;

  // Volume controls
  setMasterVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setSFXVolume: (volume: number) => void;
  masterVolume: number;
  musicVolume: number;
  sfxVolume: number;

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

// Global audio store và tài nguyên chia sẻ
let audioState: AudioState = {
  masterVolume: (() => {
    const saved = localStorage.getItem('audio_master_volume');
    return saved ? parseFloat(saved) : 0.7;
  })(),
  musicVolume: (() => {
    const saved = localStorage.getItem('audio_music_volume');
    return saved ? parseFloat(saved) : 0.5;
  })(),
  sfxVolume: (() => {
    const saved = localStorage.getItem('audio_sfx_volume');
    return saved ? parseFloat(saved) : 0.8;
  })(),
  isMuted: (() => {
    const saved = localStorage.getItem('audio_muted');
    return saved === 'true';
  })()
};

const audioSubscribers = new Set<() => void>();
const notifyAudioSubscribers = () => {
  audioSubscribers.forEach((cb) => cb());
};

function subscribeAudio(callback: () => void) {
  audioSubscribers.add(callback);
  return () => audioSubscribers.delete(callback);
}

function getAudioSnapshot() {
  return audioState;
}

function setAudioState(partial: Partial<AudioState>) {
  audioState = { ...audioState, ...partial };
  applyVolumes();
  notifyAudioSubscribers();
}

const globalAudioInstances = new Map<string, HTMLAudioElement>();
const globalAudioMeta = new Map<string, { category: SoundCategory; baseVolume: number }>();
const globalCurrentMusic: { current: HTMLAudioElement | null } = { current: null };
const globalCurrentMusicKey: { current: string | null } = { current: null };

function calculateVolumeStatic(category: SoundCategory, baseVolume: number): number {
  const master = Number.isFinite(audioState.masterVolume) ? audioState.masterVolume : 0;
  const music = Number.isFinite(audioState.musicVolume) ? audioState.musicVolume : 0;
  const sfx = Number.isFinite(audioState.sfxVolume) ? audioState.sfxVolume : 0;
  const clampedBase = Math.max(0, Math.min(1, Number.isFinite(baseVolume) ? baseVolume : 1));
  if (audioState.isMuted) return 0;
  const categoryVolume = category === 'music' ? music : sfx;
  return Math.max(0, Math.min(1, master * categoryVolume * clampedBase));
}

function applyVolumes() {
  if (globalCurrentMusic.current && globalCurrentMusicKey.current) {
    const meta = globalAudioMeta.get(globalCurrentMusicKey.current) || { category: 'music', baseVolume: 0.5 };
    globalCurrentMusic.current.volume = calculateVolumeStatic(meta.category, meta.baseVolume);
  }

  globalAudioInstances.forEach((audio, key) => {
    if (key === globalCurrentMusicKey.current) return;
    const meta = globalAudioMeta.get(key) || { category: 'sfx', baseVolume: 1 };
    audio.volume = calculateVolumeStatic(meta.category, meta.baseVolume);
  });
}

export function useAudio(): UseAudioReturn {
  const audioInstancesRef = globalAudioInstances;
  const audioMetaRef = globalAudioMeta;
  const currentMusicRef = globalCurrentMusic;
  const currentMusicKeyRef = globalCurrentMusicKey;
  const isLoading = false;

  // Subscribe to shared audio state
  const { masterVolume, musicVolume, sfxVolume, isMuted } = useSyncExternalStore(
    subscribeAudio,
    getAudioSnapshot
  );

  // Load audio file with error handling
  const loadAudio = useCallback((soundKey: string): HTMLAudioElement | null => {
    try {
      const path = SOUND_PATHS[soundKey];
      if (!path) {
        console.warn(`[Audio] Sound key not found: ${soundKey}`);
        return null;
      }

      // Check if already loaded
      if (audioInstancesRef.has(soundKey)) {
        return audioInstancesRef.get(soundKey)!;
      }

      // Create new audio instance
      const audio = new Audio(path);
      audio.preload = 'auto';

      // Error handling
      audio.addEventListener('error', (e) => {
        console.warn(`[Audio] Failed to load: ${soundKey} (${path})`, e);
        audioInstancesRef.delete(soundKey);
      });

      audioInstancesRef.set(soundKey, audio);
      return audio;
    } catch (error) {
      console.error(`[Audio] Error loading ${soundKey}:`, error);
      return null;
    }
  }, []);

  // Calculate final volume based on category
  const calculateVolume = useCallback((category: SoundCategory, baseVolume: number): number => {
    return calculateVolumeStatic(category, baseVolume);
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
      audioMetaRef.set(soundKey, { category, baseVolume: volume });

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
      const audio = audioInstancesRef.get(soundKey);
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audioMetaRef.delete(soundKey);
      }
    } catch (error) {
      console.error(`[Audio] Error stopping ${soundKey}:`, error);
    }
  }, []);

  // Stop all sounds
  const stopAll = useCallback(() => {
    try {
      audioInstancesRef.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });
      audioMetaRef.clear();
    } catch (error) {
      console.error('[Audio] Error stopping all sounds:', error);
    }
  }, []);

  // Stop music with fade out - DEFINED BEFORE playMusic
  const stopMusic = useCallback((fadeOut: boolean = true) => {
    try {
      console.info('[Audio] stopMusic called', { fadeOut, currentMusicKey: currentMusicKeyRef.current });
      if (!currentMusicRef.current) return;

      const audio = currentMusicRef.current;

      // Không fade: dừng ngay để tránh pause lặp lại
      audio.pause();
      audio.currentTime = 0;
      audio.volume = 0;

      currentMusicRef.current = null;
      if (currentMusicKeyRef.current) {
        audioMetaRef.delete(currentMusicKeyRef.current);
      }
      currentMusicKeyRef.current = null;
    } catch (error) {
      console.error('[Audio] Error stopping music:', error);
    }
  }, []);

  // Play music with fade in - DEFINED AFTER stopMusic
  const playMusic = useCallback((musicKey: string, options: { loop?: boolean } = {}) => {
    const { loop = true } = options;
    try {
      console.info('[Audio] playMusic start', { musicKey, existingKey: currentMusicKeyRef.current, loop });
      // Stop current music if different
      if (currentMusicKeyRef.current === musicKey) return;

      if (currentMusicRef.current) {
        stopMusic(false);
      }

      const audio = loadAudio(musicKey);
      if (!audio) return;

      currentMusicRef.current = audio;
      currentMusicKeyRef.current = musicKey;
      audioMetaRef.set(musicKey, { category: 'music', baseVolume: 0.5 });

      audio.loop = loop;
      audio.onended = () => console.info('[Audio] music ended', { musicKey });
      audio.onpause = () => console.info('[Audio] music paused', { musicKey, t: audio.currentTime, d: audio.duration });
      audio.onplay = () => console.info('[Audio] music play', { musicKey, t: audio.currentTime, d: audio.duration });

      // Luôn bỏ fade để không bị pause lặp
      audio.volume = calculateVolume('music', 0.5);
      audio.currentTime = 0;
      audio.play().catch((error) => {
        console.warn(`[Audio] Music playback failed for ${musicKey}:`, error);
      });
    } catch (error) {
      console.error(`[Audio] Error playing music ${musicKey}:`, error);
    }
  }, [loadAudio, calculateVolume, stopMusic]);  // Volume controls
  const setMasterVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setAudioState({ masterVolume: clampedVolume });
    localStorage.setItem('audio_master_volume', clampedVolume.toString());

    // Update current music volume
    if (currentMusicRef.current) {
      currentMusicRef.current.volume = calculateVolume('music', 0.5);
    }
  }, [calculateVolume]);

  const setMusicVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setAudioState({ musicVolume: clampedVolume });
    localStorage.setItem('audio_music_volume', clampedVolume.toString());

    // Update current music volume
    if (currentMusicRef.current) {
      currentMusicRef.current.volume = calculateVolume('music', 0.5);
    }
  }, [calculateVolume]);

  const setSFXVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume));
    setAudioState({ sfxVolume: clampedVolume });
    localStorage.setItem('audio_sfx_volume', clampedVolume.toString());
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    const newMutedState = !isMuted;
    setAudioState({ isMuted: newMutedState });
    localStorage.setItem('audio_muted', newMutedState.toString());
    console.info('[Audio] toggleMute', { newMutedState, currentMusicKey: currentMusicKeyRef.current });

    if (newMutedState) {
      // Mute: đặt volume 0 và tạm dừng nhạc để tránh bị im lặng ngắt quãng
      if (currentMusicRef.current) {
        currentMusicRef.current.volume = 0;
        currentMusicRef.current.pause();
      }
      audioInstancesRef.forEach((audio) => {
        audio.volume = 0;
        audio.pause();
      });
    } else {
      // Unmute: áp volume mới và đảm bảo nhạc tiếp tục phát
      if (currentMusicRef.current) {
        const meta = currentMusicKeyRef.current
          ? audioMetaRef.get(currentMusicKeyRef.current) || { category: 'music', baseVolume: 0.5 }
          : { category: 'music', baseVolume: 0.5 };
        // Nếu đã gần cuối bài, tua về đầu để không dừng sau 1s
        if (
          Number.isFinite(currentMusicRef.current.duration) &&
          currentMusicRef.current.duration > 0 &&
          currentMusicRef.current.currentTime >= currentMusicRef.current.duration - 0.3
        ) {
          currentMusicRef.current.currentTime = 0;
        }
        currentMusicRef.current.volume = calculateVolume(meta.category as SoundCategory, meta.baseVolume);
        currentMusicRef.current.loop = true;
        currentMusicRef.current.play().catch((err) => {
          console.warn('[Audio] Resume music failed on unmute', err);
        });
      }
      audioInstancesRef.forEach((audio, key) => {
        if (key === currentMusicKeyRef.current) return;
        const meta = audioMetaRef.get(key) || { category: 'sfx', baseVolume: 1 };
        audio.volume = calculateVolume(meta.category, meta.baseVolume);
      });
    }
  }, [isMuted, calculateVolume]);

  // Recalculate volumes for all active audio when sliders or mute change
  useEffect(() => {
    // Update music volume
    if (currentMusicRef.current && currentMusicKeyRef.current) {
      const meta = audioMetaRef.get(currentMusicKeyRef.current) || { category: 'music', baseVolume: 0.5 };
      currentMusicRef.current.volume = calculateVolume(meta.category, meta.baseVolume);
    }

    // Update SFX/UI/achievement volumes
    audioInstancesRef.forEach((audio, key) => {
      // Skip if already handled as current music
      if (key === currentMusicKeyRef.current) return;

      const meta = audioMetaRef.get(key) || { category: 'sfx', baseVolume: 1 };
      audio.volume = calculateVolume(meta.category, meta.baseVolume);
    });
  }, [calculateVolume, isMuted, masterVolume, musicVolume, sfxVolume]);

  // Cleanup on unmount
  useEffect(() => {
    const instances = audioInstancesRef;
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
    masterVolume,
    musicVolume,
    sfxVolume,
    isMuted,
    toggleMute,
    isLoading
  };
}
