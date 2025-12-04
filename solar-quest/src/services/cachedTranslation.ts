import { translateWithGemini } from './geminiTranslator';

const TRANSLATION_CACHE_KEY = 'nasa_translations_v1';
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

interface TranslationCache {
  [key: string]: {
    vi?: string;
    en?: string;
    timestamp: number;
  };
}

/**
 * Get translation cache from localStorage
 */
const getCache = (): TranslationCache => {
  try {
    const cached = localStorage.getItem(TRANSLATION_CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch (error) {
    console.error('Failed to load translation cache:', error);
    return {};
  }
};

/**
 * Save translation cache to localStorage
 */
const saveCache = (cache: TranslationCache): void => {
  try {
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to save translation cache:', error);
  }
};

/**
 * Generate a cache key from text
 */
const generateCacheKey = (text: string): string => {
  // Use first 100 chars + length as key to avoid huge keys
  const normalized = text.trim().toLowerCase().slice(0, 100);
  return `${btoa(normalized).slice(0, 50)}_${text.length}`;
};

/**
 * Get cached translation or translate with Gemini
 * @param originalText - Original text to translate
 * @param targetLang - Target language
 * @returns Translated text (from cache or fresh translation)
 */
export const getCachedTranslation = async (
  originalText: string,
  targetLang: 'vi' | 'en'
): Promise<string> => {
  if (!originalText || originalText.trim() === '') {
    return originalText;
  }

  const cache = getCache();
  const cacheKey = generateCacheKey(originalText);
  
  // Check if we have a valid cached translation
  const cached = cache[cacheKey];
  const isValid = cached && 
    cached[targetLang] && 
    (Date.now() - cached.timestamp < CACHE_DURATION);
  
  if (isValid) {
    console.log('✅ Using cached translation for:', originalText.slice(0, 50) + '...');
    return cached[targetLang]!;
  }
  
  // No valid cache, translate with Gemini
  console.log('🔄 Translating with Gemini:', originalText.slice(0, 50) + '...');
  
  try {
    const translated = await translateWithGemini(originalText, targetLang);
    
    // Save to cache
    cache[cacheKey] = {
      ...cache[cacheKey],
      [targetLang]: translated,
      timestamp: Date.now()
    };
    saveCache(cache);
    
    return translated;
  } catch (error) {
    console.error('Translation failed, using original text:', error);
    return originalText;
  }
};

/**
 * Clear old cache entries (older than CACHE_DURATION)
 */
export const clearOldCache = (): void => {
  const cache = getCache();
  const now = Date.now();
  let cleaned = 0;
  
  Object.keys(cache).forEach(key => {
    if (now - cache[key].timestamp > CACHE_DURATION) {
      delete cache[key];
      cleaned++;
    }
  });
  
  if (cleaned > 0) {
    console.log(`🧹 Cleaned ${cleaned} old cache entries`);
    saveCache(cache);
  }
};

/**
 * Clear all translation cache
 */
export const clearAllCache = (): void => {
  localStorage.removeItem(TRANSLATION_CACHE_KEY);
  console.log('🗑️ All translation cache cleared');
};
