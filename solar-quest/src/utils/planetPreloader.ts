import * as THREE from "three";
import { getPlanetInfo, type PlanetInfo, getMarkerImagery } from "@/services/nasaApi";

// ===== TEXTURE CACHE =====
const textureCache = new Map<string, THREE.Texture>();
const textureLoader = new THREE.TextureLoader();

// ===== DATA CACHE =====
const planetDataCache = new Map<string, PlanetInfo>();

// ===== MARKER IMAGERY CACHE =====
interface MarkerImageryData {
    imageUrl: string;
    title?: string;
    explanation?: string;
    date?: string;
    caption?: string;
}
const markerImageryCache = new Map<string, MarkerImageryData | null>();

// ===== TEXTURE URLS =====
export const PLANET_TEXTURES: Record<string, string> = {
    mars: "/texture/mars-min.webp",
    mercury: "/texture/mercury-min.webp",
    venus: "/texture/venus-min.webp",
    earth: "/texture/Albedo-min.webp",
    jupiter: "/texture/jupiter-min.webp",
    saturn: "/texture/Saturno-min.webp",
    uranus: "/texture/Uranus-min.webp",
    neptune: "/texture/neptune-min.webp",
};

/**
 * Preload a single texture
 */
export function preloadTexture(url: string): Promise<THREE.Texture> {
    // Return cached if already loaded
    if (textureCache.has(url)) {
        console.log(`✅ Using cached texture: ${url}`);
        return Promise.resolve(textureCache.get(url)!);
    }

    console.log(`🔄 Preloading texture: ${url}`);

    return new Promise((resolve, reject) => {
        textureLoader.load(
            url,
            (texture) => {
                textureCache.set(url, texture);
                console.log(`✅ Texture loaded: ${url}`);
                resolve(texture);
            },
            undefined, // onProgress
            (error) => {
                console.error(`❌ Failed to load texture: ${url}`, error);
                reject(error);
            }
        );
    });
}

/**
 * Get cached texture (instant, no loading)
 */
export function getCachedTexture(url: string): THREE.Texture | null {
    return textureCache.get(url) || null;
}

/**
 * Check if texture is cached
 */
export function isTextureCached(url: string): boolean {
    return textureCache.has(url);
}

/**
 * Preload planet NASA data
 */
export async function preloadPlanetData(planetId: string): Promise<PlanetInfo | null> {
    const cacheKey = `planet-${planetId}`;

    // Return cached if available
    if (planetDataCache.has(cacheKey)) {
        console.log(`✅ Using cached planet data: ${planetId}`);
        return planetDataCache.get(cacheKey)!;
    }

    console.log(`🔄 Preloading planet data: ${planetId}`);

    try {
        const data = await getPlanetInfo(planetId);
        if (data) {
            planetDataCache.set(cacheKey, data);
            console.log(`✅ Planet data loaded: ${planetId}`);
            return data;
        }
        return null;
    } catch (error) {
        console.error(`❌ Failed to load planet data: ${planetId}`, error);
        return null;
    }
}

/**
 * Get cached planet data (instant, no API call)
 */
export function getCachedPlanetData(planetId: string): PlanetInfo | null {
    return planetDataCache.get(`planet-${planetId}`) || null;
}

/**
 * Check if planet data is cached
 */
export function isPlanetDataCached(planetId: string): boolean {
    return planetDataCache.has(`planet-${planetId}`);
}

/**
 * Preload marker imagery
 */
export async function preloadMarkerImagery(
    markerName: string,
    planetId: string
): Promise<MarkerImageryData | null> {
    const cacheKey = `${planetId}-${markerName}`;

    // Return cached if available
    if (markerImageryCache.has(cacheKey)) {
        const cached = markerImageryCache.get(cacheKey);
        console.log(`✅ Using cached marker imagery: ${markerName} (${planetId})`);
        return cached || null;
    }

    console.log(`🔄 Preloading marker imagery: ${markerName} (${planetId})`);

    try {
        const imagery = await getMarkerImagery(markerName, planetId);
        if (imagery) {
            const data: MarkerImageryData = {
                imageUrl: imagery.imageUrl,
                title: imagery.title,
                explanation: imagery.explanation,
                date: imagery.date,
                caption: imagery.caption,
            };
            markerImageryCache.set(cacheKey, data);
            console.log(`✅ Marker imagery loaded: ${markerName} (${planetId})`);
            return data;
        } else {
            // Cache null to avoid re-fetching failed requests
            markerImageryCache.set(cacheKey, null);
            console.log(`⚠️ No imagery found for: ${markerName} (${planetId})`);
            return null;
        }
    } catch (error) {
        console.error(`❌ Failed to load marker imagery: ${markerName}`, error);
        markerImageryCache.set(cacheKey, null);
        return null;
    }
}

/**
 * Get cached marker imagery (instant, no API call)
 */
export function getCachedMarkerImagery(
    markerName: string,
    planetId: string
): MarkerImageryData | null {
    const cacheKey = `${planetId}-${markerName}`;
    return markerImageryCache.get(cacheKey) || null;
}

/**
 * Check if marker imagery is cached
 */
export function isMarkerImageryCached(markerName: string, planetId: string): boolean {
    return markerImageryCache.has(`${planetId}-${markerName}`);
}

/**
 * Preload all markers for a planet
 */
export async function preloadAllMarkerImagery(
    markers: Array<{ name: string }>,
    planetId: string
): Promise<void> {
    console.log(`🚀 Preloading ${markers.length} marker images for ${planetId}`);

    try {
        // Preload all markers in parallel (but limit to 5 concurrent to avoid rate limits)
        const BATCH_SIZE = 5;
        for (let i = 0; i < markers.length; i += BATCH_SIZE) {
            const batch = markers.slice(i, i + BATCH_SIZE);
            await Promise.all(
                batch.map((marker) => preloadMarkerImagery(marker.name, planetId))
            );
        }

        console.log(`✅ All marker imagery preloaded for ${planetId}`);
    } catch (error) {
        console.error(`❌ Failed to preload marker imagery for ${planetId}`, error);
    }
}

/**
 * Preload complete planet (texture + data + marker imagery)
 */
export async function preloadPlanet(
    planetId: string,
    markers?: Array<{ name: string }>
): Promise<void> {
    console.log(`🚀 Preloading planet: ${planetId}`);

    const textureUrl = PLANET_TEXTURES[planetId.toLowerCase()];

    try {
        // Preload texture and data in parallel
        await Promise.all([
            textureUrl ? preloadTexture(textureUrl) : Promise.resolve(),
            preloadPlanetData(planetId.toLowerCase()),
        ]);

        // Preload marker imagery if markers provided
        if (markers && markers.length > 0) {
            await preloadAllMarkerImagery(markers, planetId.toLowerCase());
        }

        console.log(`✅ Planet fully preloaded: ${planetId}`);
    } catch (error) {
        console.error(`❌ Failed to preload planet: ${planetId}`, error);
    }
}

/**
 * Check if planet is fully preloaded
 */
export function isPlanetPreloaded(planetId: string): boolean {
    const textureUrl = PLANET_TEXTURES[planetId.toLowerCase()];
    const hasTexture = textureUrl ? isTextureCached(textureUrl) : true;
    const hasData = isPlanetDataCached(planetId.toLowerCase());

    return hasTexture && hasData;
}

/**
 * Clear all caches (for memory management)
 */
export function clearPlanetCaches(): void {
    textureCache.clear();
    planetDataCache.clear();
    markerImageryCache.clear();
    console.log("🗑️ All planet caches cleared");
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
    return {
        textures: textureCache.size,
        planetData: planetDataCache.size,
        markerImagery: markerImageryCache.size,
        total: textureCache.size + planetDataCache.size + markerImageryCache.size,
    };
}
