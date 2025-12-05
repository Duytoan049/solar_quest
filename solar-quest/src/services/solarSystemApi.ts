// Solar System OpenData API Service
// https://api.le-systeme-solaire.net/

// Use proxy in both dev and production to bypass CORS
const SOLAR_SYSTEM_API_BASE = import.meta.env.DEV
    ? '/api/solar-system/rest'  // Development: Use Vite proxy
    : '/api/solar-system'; // Production: Use Vercel serverless function proxy

const API_TOKEN = import.meta.env.VITE_SOLAR_SYSTEM_API_KEY || ''; // Get free token from https://api.le-systeme-solaire.net/generatekey.html

// Planet name mapping (English to API ID)
const PLANET_ID_MAP: Record<string, string> = {
    mercury: 'mercure',
    venus: 'venus',
    earth: 'terre',
    mars: 'mars',
    jupiter: 'jupiter',
    saturn: 'saturne',
    uranus: 'uranus',
    neptune: 'neptune',
    sun: 'soleil',
};

export interface PlanetHistoryData {
    id: string;
    name: string;
    englishName: string;
    isPlanet: boolean;
    discoveredBy: string;
    discoveryDate: string;
    alternativeName: string;
    bodyType: string; // "Star", "Planet", "Dwarf Planet", etc.

    // Physical data
    mass: {
        massValue: number;
        massExponent: number;
    };
    volume: {
        volValue: number;
        volExponent: number;
    };
    density: number;
    gravity: number;
    meanRadius: number;

    // Orbital data
    semimajorAxis: number; // km
    perihelion: number; // km
    aphelion: number; // km
    eccentricity: number;
    inclination: number; // degrees
    sideralOrbit: number; // days
    sideralRotation: number; // hours

    // Additional
    axialTilt: number;
    avgTemp: number; // Kelvin
    moons: Array<{ moon: string; rel: string }>;
    aroundPlanet?: { planet: string; rel: string };
}

/**
 * Fetch planet history data from Solar System OpenData API
 */
export async function getPlanetHistory(planetId: string): Promise<PlanetHistoryData | null> {
    try {
        const apiId = PLANET_ID_MAP[planetId.toLowerCase()] || planetId.toLowerCase();

        // In production, use query parameter for Vercel serverless function
        // In dev, use direct path for Vite proxy
        const url = import.meta.env.DEV
            ? `${SOLAR_SYSTEM_API_BASE}/bodies/${apiId}`
            : `${SOLAR_SYSTEM_API_BASE}?path=bodies/${apiId}`;

        const headers: HeadersInit = {};
        if (API_TOKEN) {
            headers['Authorization'] = `Bearer ${API_TOKEN}`;
        }

        const response = await fetch(url, { headers });

        if (!response.ok) {
            console.error(`Solar System API error: ${response.status}`);
            return null;
        }

        const data = await response.json();

        return {
            id: data.id,
            name: data.name,
            englishName: data.englishName,
            isPlanet: data.isPlanet,
            discoveredBy: data.discoveredBy || 'Ancient',
            discoveryDate: data.discoveryDate || 'Prehistoric',
            alternativeName: data.alternativeName || '',
            bodyType: data.bodyType || 'Planet',

            mass: data.mass || { massValue: 0, massExponent: 0 },
            volume: data.vol || { volValue: 0, volExponent: 0 },
            density: data.density || 0,
            gravity: data.gravity || 0,
            meanRadius: data.meanRadius || 0,

            semimajorAxis: data.semimajorAxis || 0,
            perihelion: data.perihelion || 0,
            aphelion: data.aphelion || 0,
            eccentricity: data.eccentricity || 0,
            inclination: data.inclination || 0,
            sideralOrbit: data.sideralOrbit || 0,
            sideralRotation: data.sideralRotation || 0,

            axialTilt: data.axialTilt || 0,
            avgTemp: data.avgTemp || 0,
            moons: data.moons || [],
            aroundPlanet: data.aroundPlanet,
        };
    } catch (error) {
        console.error('Error fetching planet history:', error);
        return null;
    }
}

/**
 * Format mass in scientific notation
 */
export function formatMass(mass: { massValue: number; massExponent: number }): string {
    if (!mass || mass.massValue === 0) return 'Unknown';
    return `${mass.massValue} × 10^${mass.massExponent} kg`;
}

/**
 * Format volume in scientific notation
 */
export function formatVolume(volume: { volValue: number; volExponent: number }): string {
    if (!volume || volume.volValue === 0) return 'Unknown';
    return `${volume.volValue} × 10^${volume.volExponent} km³`;
}

/**
 * Convert Kelvin to Celsius
 */
export function kelvinToCelsius(kelvin: number): string {
    if (kelvin === 0) return 'Unknown';
    const celsius = kelvin - 273.15;
    return `${celsius.toFixed(1)}°C`;
}

/**
 * Format large numbers with commas
 */
export function formatNumber(num: number): string {
    if (num === 0) return 'Unknown';
    return num.toLocaleString('en-US');
}
