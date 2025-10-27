// NASA API Service
const NASA_API_KEY = import.meta.env.VITE_NASA_API_KEY || 'DEMO_KEY';
const NASA_BASE_URL = 'https://api.nasa.gov';

// NASA Solar System API endpoints
const ENDPOINTS = {
    // NASA's EPIC (Earth Polychromatic Imaging Camera)
    EPIC: `${NASA_BASE_URL}/EPIC/api/natural`,

    // NASA's Mars Rover Photos
    MARS_ROVER: `${NASA_BASE_URL}/mars-photos/api/v1`,

    // NASA's Astronomy Picture of the Day (có thể lấy ảnh hành tinh)
    APOD: `${NASA_BASE_URL}/planetary/apod`,

    // NASA's Asteroids NeoWs
    NEO: `${NASA_BASE_URL}/neo/rest/v1`,

    // Mars Trek WMTS (Web Map Tile Service) - for Mars geographic features
    MARS_TREK: 'https://trek.nasa.gov/mars',

    // NASA Images API - High quality imagery search
    IMAGES: 'https://images-api.nasa.gov',
};

export interface PlanetInfo {
    id: string;
    name: string;
    description: string;
    stats: {
        temperature: string;
        gravity: string;
        diameter: string;
        dayLength: string;
        mass: string;
        distanceFromSun: string;
        moons: number;
        atmosphere: string;
    };
    imageUrl?: string;
    lastUpdated?: string;
}

// Interface for planetary geographic features (landmarks)
export interface PlanetaryFeature {
    id: number;
    name: string;
    type: string; // volcano, crater, canyon, mountain, etc.
    position: [number, number, number]; // 3D coordinates
    description: string;
    diameter?: string;
    height?: string;
    depth?: string;
    discoveryDate?: string;
    namedAfter?: string;
    coordinates?: {
        latitude: number;
        longitude: number;
    };
}

// Dữ liệu planet từ NASA và các nguồn khoa học chính thống
const NASA_PLANET_DATA: Record<string, PlanetInfo> = {
    mercury: {
        id: "mercury",
        name: "Mercury",
        description: "The smallest planet in our solar system and nearest to the Sun, Mercury is only slightly larger than Earth's Moon. From the surface, the Sun would appear more than three times as large.",
        stats: {
            temperature: "167°C (day) / -183°C (night)",
            gravity: "3.7 m/s² (38% of Earth)",
            diameter: "4,879 km",
            dayLength: "4,222.6 hours (175.9 Earth days)",
            mass: "3.285 × 10²³ kg",
            distanceFromSun: "57.9 million km",
            moons: 0,
            atmosphere: "Extremely thin (exosphere)"
        }
    },
    venus: {
        id: "venus",
        name: "Venus",
        description: "Venus is the second planet from the Sun and Earth's closest planetary neighbor. It's the hottest planet in our solar system due to its thick atmosphere trapping heat.",
        stats: {
            temperature: "464°C (surface average)",
            gravity: "8.87 m/s² (90% of Earth)",
            diameter: "12,104 km",
            dayLength: "2,802 hours (116.75 Earth days)",
            mass: "4.867 × 10²⁴ kg",
            distanceFromSun: "108.2 million km",
            moons: 0,
            atmosphere: "CO₂ 96.5%, N₂ 3.5%"
        }
    },
    earth: {
        id: "earth",
        name: "Earth",
        description: "Our home planet is the third from the Sun and the only known planet with life. Earth is the only planet with liquid water on its surface.",
        stats: {
            temperature: "15°C (average)",
            gravity: "9.807 m/s²",
            diameter: "12,742 km",
            dayLength: "24 hours",
            mass: "5.972 × 10²⁴ kg",
            distanceFromSun: "149.6 million km",
            moons: 1,
            atmosphere: "N₂ 78%, O₂ 21%, Ar 0.9%"
        }
    },
    mars: {
        id: "mars",
        name: "Mars",
        description: "Mars is the fourth planet from the Sun, known as the Red Planet due to iron oxide on its surface. It has the largest volcano and canyon in the solar system.",
        stats: {
            temperature: "-63°C (average)",
            gravity: "3.71 m/s² (38% of Earth)",
            diameter: "6,779 km",
            dayLength: "24.6 hours (1.03 Earth days)",
            mass: "6.39 × 10²³ kg",
            distanceFromSun: "227.9 million km",
            moons: 2,
            atmosphere: "CO₂ 95%, N₂ 2.8%, Ar 2%"
        }
    },
    jupiter: {
        id: "jupiter",
        name: "Jupiter",
        description: "Jupiter is the largest planet in our solar system. It's a gas giant with a mass more than twice that of all other planets combined. The Great Red Spot is a giant storm.",
        stats: {
            temperature: "-110°C (cloud tops)",
            gravity: "24.79 m/s² (2.5× Earth)",
            diameter: "139,820 km",
            dayLength: "9.93 hours",
            mass: "1.898 × 10²⁷ kg",
            distanceFromSun: "778.5 million km",
            moons: 95,
            atmosphere: "H₂ 90%, He 10%"
        }
    },
    saturn: {
        id: "saturn",
        name: "Saturn",
        description: "Saturn is the sixth planet from the Sun and the second-largest. It's adorned with thousands of beautiful ringlets made of ice and rock particles.",
        stats: {
            temperature: "-140°C (cloud tops)",
            gravity: "10.44 m/s² (1.07× Earth)",
            diameter: "116,460 km",
            dayLength: "10.7 hours",
            mass: "5.683 × 10²⁶ kg",
            distanceFromSun: "1.43 billion km",
            moons: 146,
            atmosphere: "H₂ 96%, He 3%"
        }
    },
    uranus: {
        id: "uranus",
        name: "Uranus",
        description: "Uranus is the seventh planet from the Sun with the third-largest diameter. It rotates at a nearly 90-degree angle from its orbital plane, making it unique.",
        stats: {
            temperature: "-195°C (cloud tops)",
            gravity: "8.69 m/s² (89% of Earth)",
            diameter: "50,724 km",
            dayLength: "17.2 hours",
            mass: "8.681 × 10²⁵ kg",
            distanceFromSun: "2.87 billion km",
            moons: 28,
            atmosphere: "H₂ 83%, He 15%, CH₄ 2%"
        }
    },
    neptune: {
        id: "neptune",
        name: "Neptune",
        description: "Neptune is the eighth and most distant planet. It's a dark, cold, and whipped by supersonic winds. It has the strongest winds in the solar system.",
        stats: {
            temperature: "-200°C (cloud tops)",
            gravity: "11.15 m/s² (1.14× Earth)",
            diameter: "49,244 km",
            dayLength: "16.1 hours",
            mass: "1.024 × 10²⁶ kg",
            distanceFromSun: "4.5 billion km",
            moons: 16,
            atmosphere: "H₂ 80%, He 19%, CH₄ 1%"
        }
    }
};

// Fetch Mars images using APOD (Astronomy Picture of the Day)
// APOD is more reliable than Mars Rover API and has many Mars images
export async function getMarsRoverPhoto(_rover: string = 'curiosity', _camera: string = 'NAVCAM') {
    try {
        // Use APOD API to get Mars-related imagery
        // Fetch 50 random images to increase chance of finding Mars images
        const apodUrl = `${ENDPOINTS.APOD}?api_key=${NASA_API_KEY}&count=50`;
        console.log('🔴 Fetching Mars images from APOD:', apodUrl);

        const response = await fetch(apodUrl);

        if (!response.ok) {
            console.warn(`⚠️ APOD API error: ${response.status}, using fallback`);
            return {
                imageUrl: 'https://mars.nasa.gov/system/resources/detail_files/25964_PIA25287-web.jpg',
                earthDate: new Date().toISOString().split('T')[0],
                sol: 0,
                camera: 'NASA Mars Sample'
            };
        }

        const apodData = await response.json();
        console.log('🔴 APOD API response:', apodData);

        // Find a Mars-related image with comprehensive keywords
        interface APODItem {
            title?: string;
            explanation?: string;
            url?: string;
            hdurl?: string;
            date?: string;
        }

        const marsKeywords = ['mars', 'martian', 'red planet', 'phobos', 'deimos',
            'olympus mons', 'valles marineris', 'curiosity', 'perseverance',
            'opportunity', 'spirit', 'pathfinder', 'viking'];

        const marsImage = apodData.find((item: APODItem) => {
            const text = `${item.title || ''} ${item.explanation || ''}`.toLowerCase();
            return marsKeywords.some(keyword => text.includes(keyword));
        });

        if (marsImage && (marsImage.hdurl || marsImage.url)) {
            console.log('✅ Mars image found from APOD:', marsImage.title);
            return {
                imageUrl: marsImage.hdurl || marsImage.url || '',
                earthDate: marsImage.date || new Date().toISOString().split('T')[0],
                sol: 0,
                camera: `APOD: ${marsImage.title || 'Mars Image'}`
            };
        }

        // If no Mars image found in random sample, fetch a specific known Mars APOD
        console.warn('⚠️ No Mars images in random APOD sample, fetching specific Mars APOD');
        const specificDate = '2018-08-07'; // Known Mars opposition APOD
        const specificUrl = `${ENDPOINTS.APOD}?api_key=${NASA_API_KEY}&date=${specificDate}`;
        const specificResponse = await fetch(specificUrl);

        if (specificResponse.ok) {
            const specificData = await specificResponse.json();
            if (specificData.hdurl || specificData.url) {
                console.log('✅ Using specific Mars APOD:', specificData.title);
                return {
                    imageUrl: specificData.hdurl || specificData.url,
                    earthDate: specificData.date,
                    sol: 0,
                    camera: `APOD: ${specificData.title}`
                };
            }
        }

        // Final fallback
        return {
            imageUrl: 'https://mars.nasa.gov/system/resources/detail_files/25964_PIA25287-web.jpg',
            earthDate: new Date().toISOString().split('T')[0],
            sol: 0,
            camera: 'NASA Sample Image'
        };
    } catch (error) {
        console.error('❌ Error fetching Mars images from APOD:', error);
        return {
            imageUrl: 'https://mars.nasa.gov/system/resources/detail_files/25964_PIA25287-web.jpg',
            earthDate: new Date().toISOString().split('T')[0],
            sol: 0,
            camera: 'NASA Fallback Image'
        };
    }
}// Fetch Earth imagery from EPIC (with APOD fallback)
export async function getEarthImagery() {
    try {
        console.log('🌍 Fetching Earth imagery from EPIC...');
        const response = await fetch(`${ENDPOINTS.EPIC}?api_key=${NASA_API_KEY}`);

        // Check if EPIC API is available
        if (!response.ok) {
            console.warn(`⚠️ EPIC API unavailable (${response.status}), falling back to APOD`);
            // Fallback to APOD for Earth images
            return await getPlanetImagery('earth');
        }

        const data = await response.json();

        if (data && data.length > 0) {
            const latest = data[0];
            const date = latest.date.split(' ')[0].replaceAll('-', '/');
            const imageUrl = `https://epic.gsfc.nasa.gov/archive/natural/${date}/png/${latest.image}.png`;

            console.log('✅ Earth EPIC image found:', imageUrl);
            return {
                imageUrl,
                date: latest.date,
                caption: latest.caption
            };
        }

        console.warn('⚠️ No EPIC data available, falling back to APOD');
        return await getPlanetImagery('earth');
    } catch (error) {
        console.error('❌ Error fetching Earth EPIC imagery, falling back to APOD:', error);
        // Fallback to APOD on any error
        return await getPlanetImagery('earth');
    }
}

// Fetch imagery for ANY planet using APOD
export async function getPlanetImagery(planetName: string) {
    try {
        // Define comprehensive keywords for each planet
        const planetKeywords: Record<string, string[]> = {
            mercury: ['mercury', 'messenger'],
            venus: ['venus', 'venusian', 'morning star', 'evening star', 'magellan'],
            earth: ['earth', 'terra', 'blue planet', 'earthrise'],
            mars: ['mars', 'martian', 'red planet', 'phobos', 'deimos', 'olympus mons', 'valles marineris',
                'curiosity', 'perseverance', 'opportunity', 'spirit', 'pathfinder', 'viking'],
            jupiter: ['jupiter', 'jovian', 'great red spot', 'io', 'europa', 'ganymede', 'callisto', 'galilean'],
            saturn: ['saturn', 'cassini', 'titan', 'enceladus', 'rings of saturn', 'saturnian'],
            uranus: ['uranus', 'uranian', 'miranda', 'ariel', 'umbriel', 'titania', 'oberon'],
            neptune: ['neptune', 'triton', 'neptunian', 'voyager 2']
        };

        const keywords = planetKeywords[planetName.toLowerCase()] || [planetName.toLowerCase()];

        // Fetch 50 random APOD images
        const apodUrl = `${ENDPOINTS.APOD}?api_key=${NASA_API_KEY}&count=50`;
        console.log(`🌍 Fetching ${planetName} images from APOD:`, apodUrl);

        const response = await fetch(apodUrl);

        if (!response.ok) {
            console.warn(`⚠️ APOD API error: ${response.status}, using fallback`);
            return null;
        }

        const apodData = await response.json();
        console.log(`🌍 APOD API response for ${planetName}:`, apodData);

        interface APODItem {
            title?: string;
            explanation?: string;
            url?: string;
            hdurl?: string;
            date?: string;
        }

        // Find a planet-related image
        const planetImage = apodData.find((item: APODItem) => {
            const text = `${item.title || ''} ${item.explanation || ''}`.toLowerCase();
            return keywords.some(keyword => text.includes(keyword));
        });

        if (planetImage && (planetImage.hdurl || planetImage.url)) {
            console.log(`✅ ${planetName} image found from APOD:`, planetImage.title);
            return {
                imageUrl: planetImage.hdurl || planetImage.url || '',
                date: planetImage.date || new Date().toISOString().split('T')[0],
                caption: `APOD: ${planetImage.title || `${planetName} Image`}`
            };
        }

        // If no image found in random sample, try specific known APOD dates for each planet
        const knownAPODDates: Record<string, string> = {
            mercury: '2013-03-30',
            venus: '2020-07-13',
            earth: '2015-07-20',
            mars: '2018-08-07',
            jupiter: '2019-09-12',
            saturn: '2017-04-26',
            uranus: '2015-01-19',
            neptune: '2014-08-25'
        };

        const specificDate = knownAPODDates[planetName.toLowerCase()];
        if (specificDate) {
            console.warn(`⚠️ No ${planetName} images in random APOD sample, fetching specific APOD`);
            const specificUrl = `${ENDPOINTS.APOD}?api_key=${NASA_API_KEY}&date=${specificDate}`;
            const specificResponse = await fetch(specificUrl);

            if (specificResponse.ok) {
                const specificData = await specificResponse.json();
                if (specificData.hdurl || specificData.url) {
                    console.log(`✅ Using specific ${planetName} APOD:`, specificData.title);
                    return {
                        imageUrl: specificData.hdurl || specificData.url,
                        date: specificData.date,
                        caption: `APOD: ${specificData.title}`
                    };
                }
            }
        }

        console.warn(`⚠️ No ${planetName} images found in APOD`);
        return null;
    } catch (error) {
        console.error(`❌ Error fetching ${planetName} images from APOD:`, error);
        return null;
    }
}

// Fetch imagery for a specific landmark/marker
// Uses NASA Images API first (best quality), then falls back to APOD
export async function getMarkerImagery(markerName: string, planetName?: string) {
    try {
        console.log(`🏔️ Fetching imagery for landmark: ${markerName} on ${planetName || 'unknown planet'}`);

        // Strategy 1: Try NASA Images API first (BEST - real photos)
        const nasaImage = await getNASAImagerySearch(markerName, planetName);
        if (nasaImage) {
            return {
                imageUrl: nasaImage.imageUrl,
                title: nasaImage.title,
                explanation: nasaImage.description,
                date: nasaImage.date,
            };
        }

        console.log(`⚠️ NASA Images API found nothing, trying APOD fallback...`);

        // Strategy 2: Fallback to APOD (astronomy focused)
        const apodUrl = `${ENDPOINTS.APOD}?api_key=${NASA_API_KEY}&count=100`;
        const response = await fetch(apodUrl);

        if (!response.ok) {
            console.warn(`⚠️ APOD API error: ${response.status}`);
            return null;
        }

        const apodData = await response.json();

        interface APODItem {
            title?: string;
            explanation?: string;
            url?: string;
            hdurl?: string;
            date?: string;
        }

        const markerLower = markerName.toLowerCase();
        const planetLower = planetName?.toLowerCase() || '';

        // Strategy 1: EXACT full name + planet (highest priority)
        let markerImage = apodData.find((item: APODItem) => {
            const title = (item.title || '').toLowerCase();
            const explanation = (item.explanation || '').toLowerCase();
            const hasFullName = title.includes(markerLower) || explanation.includes(markerLower);
            const hasPlanet = planetLower ? (title.includes(planetLower) || explanation.includes(planetLower)) : true;
            return hasFullName && hasPlanet;
        });

        // Strategy 2: Full name only (no planet requirement - medium priority)
        if (!markerImage) {
            markerImage = apodData.find((item: APODItem) => {
                const text = `${item.title || ''} ${item.explanation || ''}`.toLowerCase();
                return text.includes(markerLower);
            });
        }

        // Strategy 3: Significant keywords + planet (relaxed - low priority)
        if (!markerImage && planetLower) {
            const commonWords = ['the', 'of', 'and', 'on', 'in', 'at', 'to', 'a', 'an'];
            const keywords = markerLower.split(' ').filter(word =>
                word.length > 3 && !commonWords.includes(word)
            );

            markerImage = apodData.find((item: APODItem) => {
                const text = `${item.title || ''} ${item.explanation || ''}`.toLowerCase();
                const hasPlanet = text.includes(planetLower);
                const matchedKeywords = keywords.filter(keyword => text.includes(keyword));
                // At least 1 keyword + planet
                return hasPlanet && matchedKeywords.length >= 1;
            });
        }

        // Strategy 4: Planet-only match (very relaxed - just show something)
        if (!markerImage && planetLower) {
            markerImage = apodData.find((item: APODItem) => {
                const text = `${item.title || ''} ${item.explanation || ''}`.toLowerCase();
                return text.includes(planetLower);
            });
            if (markerImage) {
                console.log(`ℹ️ No specific image for ${markerName}, showing general ${planetName} image:`, markerImage.title);
            }
        }

        if (markerImage && (markerImage.hdurl || markerImage.url)) {
            console.log(`✅ Found image for ${markerName}:`, markerImage.title);
            return {
                imageUrl: markerImage.hdurl || markerImage.url || '',
                date: markerImage.date || new Date().toISOString().split('T')[0],
                caption: `APOD: ${markerImage.title || markerName}`,
                title: markerImage.title,
                explanation: markerImage.explanation
            };
        }

        console.warn(`⚠️ No images found for landmark: ${markerName} on ${planetName}`);
        return null;
    } catch (error) {
        console.error(`❌ Error fetching imagery for ${markerName}:`, error);
        return null;
    }
}

// Fetch high-quality imagery from NASA Images API (better than APOD for landmarks)
export async function getNASAImagerySearch(markerName: string, planetName?: string) {
    try {
        // Build smart search query with multiple keywords
        const searchTerms = [markerName];
        if (planetName) {
            searchTerms.push(planetName);
        }

        // Create URL-encoded search query
        const query = searchTerms.join(' ');
        const searchUrl = `${ENDPOINTS.IMAGES}/search?q=${encodeURIComponent(query)}&media_type=image`;

        console.log(`🔍 NASA Images API search: "${query}"`, searchUrl);

        const response = await fetch(searchUrl);

        if (!response.ok) {
            console.warn(`⚠️ NASA Images API error: ${response.status}`);
            return null;
        }

        const data = await response.json();

        // NASA Images API response structure
        interface ImageItem {
            data: Array<{
                title?: string;
                description?: string;
                keywords?: string[];
                nasa_id?: string;
                date_created?: string;
                media_type?: string;
            }>;
            href?: string;
            links?: Array<{
                href: string;
                rel: string;
                render?: string;
            }>;
        }

        const items: ImageItem[] = data?.collection?.items || [];

        if (items.length === 0) {
            console.warn(`⚠️ No images found in NASA Images API for: ${query}`);
            return null;
        }

        // Filter and score results for relevance
        const scoredItems = items.map((item) => {
            const itemData = item.data?.[0];
            const title = (itemData?.title || '').toLowerCase();
            const description = (itemData?.description || '').toLowerCase();
            const keywords = (itemData?.keywords || []).map(k => k.toLowerCase());

            let score = 0;

            // Scoring logic for relevance
            const markerLower = markerName.toLowerCase();
            const planetLower = planetName?.toLowerCase() || '';

            // Exact marker name match in title = highest score
            if (title.includes(markerLower)) score += 100;

            // Marker name in description = high score
            if (description.includes(markerLower)) score += 50;

            // Planet name in title = good score
            if (planetLower && title.includes(planetLower)) score += 30;

            // Planet name in description = medium score
            if (planetLower && description.includes(planetLower)) score += 20;

            // Keywords match = bonus points
            if (keywords.some(k => k.includes(markerLower))) score += 40;
            if (planetLower && keywords.some(k => k.includes(planetLower))) score += 20;

            // Penalty for irrelevant terms
            const irrelevantTerms = ['artist', 'concept', 'illustration', 'animation', 'simulation'];
            if (irrelevantTerms.some(term => title.includes(term) || description.includes(term))) {
                score -= 30;
            }

            return { item, score, itemData };
        });

        // Sort by score descending and take the best match
        scoredItems.sort((a, b) => b.score - a.score);

        const bestMatch = scoredItems[0];

        if (bestMatch && bestMatch.score > 0) {
            // Get the image URL from links
            const imageLink = bestMatch.item.links?.find(link => link.rel === 'preview');

            if (imageLink?.href) {
                console.log(`✅ NASA Images API: Found "${bestMatch.itemData?.title}" (score: ${bestMatch.score})`);
                return {
                    imageUrl: imageLink.href,
                    title: bestMatch.itemData?.title,
                    description: bestMatch.itemData?.description,
                    date: bestMatch.itemData?.date_created,
                    nasa_id: bestMatch.itemData?.nasa_id,
                };
            }
        }

        console.warn(`⚠️ No relevant images found (best score: ${bestMatch?.score || 0})`);
        return null;
    } catch (error) {
        console.error(`❌ Error fetching from NASA Images API:`, error);
        return null;
    }
}

// Get planet information (NASA verified data)
export async function getPlanetInfo(planetId: string): Promise<PlanetInfo | null> {
    const normalizedId = planetId.toLowerCase();

    if (NASA_PLANET_DATA[normalizedId]) {
        const planetData = { ...NASA_PLANET_DATA[normalizedId] };

        console.log(`🌍 Fetching planet info for: ${planetId}`);

        // Fetch real images for Mars and Earth if available
        if (normalizedId === 'mars') {
            console.log('🔴 Attempting to fetch Mars Rover photo...');
            const marsPhoto = await getMarsRoverPhoto();
            if (marsPhoto) {
                planetData.imageUrl = marsPhoto.imageUrl;
                planetData.lastUpdated = marsPhoto.earthDate;
                console.log('✅ Mars image set:', marsPhoto.imageUrl);
            } else {
                console.warn('⚠️ No Mars Rover photo returned');
            }
        } else if (normalizedId === 'earth') {
            console.log('🌍 Attempting to fetch Earth imagery...');
            const earthImage = await getEarthImagery();
            if (earthImage) {
                planetData.imageUrl = earthImage.imageUrl;
                planetData.lastUpdated = earthImage.date;
                console.log('✅ Earth image set:', earthImage.imageUrl);
            } else {
                console.warn('⚠️ No Earth imagery returned');
            }
        }

        console.log('📊 Final planet data:', planetData);
        return planetData;
    }

    return null;
}// Get all planets info
export async function getAllPlanetsInfo(): Promise<Record<string, PlanetInfo>> {
    const planetsInfo: Record<string, PlanetInfo> = {};

    for (const planetId of Object.keys(NASA_PLANET_DATA)) {
        const info = await getPlanetInfo(planetId);
        if (info) {
            planetsInfo[planetId] = info;
        }
    }

    return planetsInfo;
}

// Fetch asteroid data (for AsteroidBelt component enhancement)
export async function getNearEarthAsteroids(startDate?: string, endDate?: string) {
    try {
        const start = startDate || new Date().toISOString().split('T')[0];
        const end = endDate || start;

        const response = await fetch(
            `${ENDPOINTS.NEO}/feed?start_date=${start}&end_date=${end}&api_key=${NASA_API_KEY}`
        );
        const data = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching asteroid data:', error);
    }
    return null;
}

// NASA-verified planetary features/landmarks data
// Source: NASA Planetary Nomenclature, IAU (International Astronomical Union)
const NASA_PLANETARY_FEATURES: Record<string, PlanetaryFeature[]> = {
    mars: [
        {
            id: 1,
            name: "Olympus Mons",
            type: "volcano",
            position: [2, 2, 0],
            description: "The largest volcano in the solar system, standing at 21.9 km high - nearly three times the height of Mount Everest. This massive shield volcano has a base diameter of 600 km.",
            height: "21.9 km",
            diameter: "600 km",
            coordinates: { latitude: 18.65, longitude: -133.8 },
            discoveryDate: "1971",
            namedAfter: "Mount Olympus in Greek mythology"
        },
        {
            id: 2,
            name: "Valles Marineris",
            type: "canyon",
            position: [-2, 1, 0],
            description: "A vast canyon system that stretches over 4,000 km long, 200 km wide and up to 7 km deep. It's one of the largest canyons in the solar system, making Earth's Grand Canyon look tiny in comparison.",
            depth: "7 km",
            diameter: "4,000 km long × 200 km wide",
            coordinates: { latitude: -13.9, longitude: -59.2 },
            discoveryDate: "1971-1972",
            namedAfter: "Mariner 9 spacecraft"
        },
        {
            id: 3,
            name: "Polar Ice Caps",
            type: "ice cap",
            position: [0, -2, 0],
            description: "Mars has permanent ice caps at both poles composed of water ice and frozen carbon dioxide (dry ice). The northern cap is larger, measuring about 1,000 km in diameter.",
            diameter: "~1,000 km (North)",
            coordinates: { latitude: 90, longitude: 0 },
            namedAfter: "Geographic poles"
        },
        {
            id: 4,
            name: "Tharsis Region",
            type: "volcanic plateau",
            position: [3, -1, 0],
            description: "A massive volcanic plateau home to some of Mars' largest volcanoes including Olympus Mons, Ascraeus Mons, Pavonis Mons, and Arsia Mons. This region is about 4,000 km across.",
            diameter: "~4,000 km",
            coordinates: { latitude: 0, longitude: -110 },
            discoveryDate: "1970s",
            namedAfter: "Tharsis in ancient geography"
        },
        {
            id: 5,
            name: "Gale Crater",
            type: "crater",
            position: [1, -1, 1],
            description: "A 154 km-diameter impact crater that is the landing site of NASA's Curiosity rover (August 2012). The crater contains Mount Sharp, a 5.5 km-high mountain of layered rocks.",
            diameter: "154 km",
            height: "Mount Sharp: 5.5 km",
            coordinates: { latitude: -5.4, longitude: 137.8 },
            discoveryDate: "Landing site: 2012",
            namedAfter: "Walter Frederick Gale, amateur astronomer"
        }
    ],
    mercury: [
        {
            id: 1,
            name: "Caloris Basin",
            type: "impact crater",
            position: [2, 0, 0],
            description: "One of the largest impact basins in the solar system, about 1,550 km in diameter. The impact that created it was so powerful it caused seismic waves that created hills on the opposite side of the planet.",
            diameter: "1,550 km",
            coordinates: { latitude: 30.5, longitude: -189.8 },
            discoveryDate: "1974",
            namedAfter: "Latin 'calor' meaning heat"
        },
        {
            id: 2,
            name: "Rachmaninoff Basin",
            type: "impact crater",
            position: [-1, 1, 1],
            description: "A peak-ring impact crater with a diameter of 306 km. It has a well-preserved interior with smooth volcanic plains and a distinctive double-ring structure.",
            diameter: "306 km",
            coordinates: { latitude: 27.6, longitude: -57.5 },
            namedAfter: "Sergei Rachmaninoff, Russian composer"
        }
    ],
    venus: [
        {
            id: 1,
            name: "Maxwell Montes",
            type: "mountain",
            position: [0, 2, 0],
            description: "The highest mountain on Venus, rising 11 km above the planet's mean radius. It is located on Ishtar Terra in the northern hemisphere.",
            height: "11 km",
            coordinates: { latitude: 65.2, longitude: 3.3 },
            namedAfter: "James Clerk Maxwell, physicist"
        },
        {
            id: 2,
            name: "Maat Mons",
            type: "volcano",
            position: [1, 1, 1],
            description: "The highest volcano on Venus at 8 km tall. It shows signs of recent volcanic activity and is named after the Egyptian goddess of truth and justice.",
            height: "8 km",
            diameter: "395 km base",
            coordinates: { latitude: 0.5, longitude: 194.6 },
            namedAfter: "Maat, Egyptian goddess"
        }
    ],
    earth: [
        {
            id: 1,
            name: "Mount Everest",
            type: "mountain",
            position: [0, 2, 0],
            description: "Earth's highest mountain above sea level at 8,849 meters. Located in the Himalayas on the border between Nepal and Tibet.",
            height: "8.849 km",
            coordinates: { latitude: 27.988, longitude: 86.925 },
            namedAfter: "Sir George Everest, British surveyor"
        },
        {
            id: 2,
            name: "Pacific Ocean",
            type: "ocean",
            position: [-2, 0, 0],
            description: "The largest ocean on Earth, covering approximately 46% of the water surface and about 32% of Earth's total surface area. Maximum depth: 10,911 meters (Mariana Trench).",
            depth: "~4,280 m average, 10,911 m max",
            diameter: "~15,000 km wide",
            coordinates: { latitude: 0, longitude: -160 }
        },
        {
            id: 3,
            name: "Amazon Rainforest",
            type: "biome",
            position: [1, -1, -1],
            description: "The world's largest tropical rainforest, covering approximately 5.5 million km². It produces 20% of Earth's oxygen and is home to 10% of all species.",
            diameter: "~5.5 million km²",
            coordinates: { latitude: -3, longitude: -60 }
        }
    ],
    jupiter: [
        {
            id: 1,
            name: "Great Red Spot",
            type: "storm",
            position: [0, 0, 2],
            description: "A persistent anticyclonic storm that has been observed for at least 350 years. It's large enough to swallow Earth whole and has wind speeds up to 432 km/h.",
            diameter: "~16,350 km (shrinking)",
            coordinates: { latitude: -22, longitude: 0 },
            namedAfter: "Its distinctive reddish color"
        }
    ],
    saturn: [
        {
            id: 1,
            name: "Ring System",
            type: "planetary rings",
            position: [0, 0, 3],
            description: "Saturn's spectacular ring system made up of countless particles of ice and rock. The rings extend up to 282,000 km from the planet but are only about 10 meters thick in most places.",
            diameter: "282,000 km diameter, ~10 m thick",
            coordinates: { latitude: 0, longitude: 0 },
            namedAfter: "Their ring-like appearance"
        },
        {
            id: 2,
            name: "Hexagonal Storm",
            type: "storm pattern",
            position: [0, 2, 0],
            description: "A persistent hexagonal cloud pattern at Saturn's north pole, about 32,000 km across. This unique feature has winds of 322 km/h and has been observed since the Voyager missions.",
            diameter: "32,000 km",
            coordinates: { latitude: 90, longitude: 0 }
        }
    ],
    uranus: [
        {
            id: 1,
            name: "Polar Region",
            type: "polar feature",
            position: [0, 2, 0],
            description: "Uranus is tilted at 98 degrees, essentially rolling on its side as it orbits the Sun. This unique orientation means its poles get 42 years of continuous sunlight, then 42 years of darkness.",
            coordinates: { latitude: 90, longitude: 0 },
            namedAfter: "Geographic orientation"
        }
    ],
    neptune: [
        {
            id: 1,
            name: "Great Dark Spot",
            type: "storm",
            position: [0, 1, 2],
            description: "A massive storm system first observed by Voyager 2 in 1989. Similar to Jupiter's Great Red Spot, it was about 13,000 × 6,600 km in size with winds reaching 2,400 km/h - the fastest in the solar system.",
            diameter: "13,000 × 6,600 km",
            coordinates: { latitude: -22, longitude: 0 },
            discoveryDate: "1989",
            namedAfter: "Similar to Jupiter's Great Red Spot"
        }
    ]
};

// Get planetary features/landmarks for a specific planet
export async function getPlanetaryFeatures(planetId: string): Promise<PlanetaryFeature[]> {
    // Return NASA-verified features from our database
    return NASA_PLANETARY_FEATURES[planetId.toLowerCase()] || [];
}

export default {
    getPlanetInfo,
    getAllPlanetsInfo,
    getMarsRoverPhoto,
    getEarthImagery,
    getNearEarthAsteroids,
    getPlanetaryFeatures
};
