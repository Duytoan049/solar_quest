// ==================== GAMEPLAY MODIFIER INTERFACES ====================

export interface EnvironmentHazard {
    type: 'heat_damage' | 'acid_damage' | 'freeze_slow' | 'gravity_pull';
    damagePerSecond: number;
    onlyWhenStationary: boolean;
    threshold: number;
    visualWarning: boolean;
}

export interface MovementModifier {
    enabled: boolean;
    accelerationMultiplier: number;  // 0.0 - 1.0
    decelerationMultiplier: number;  // 0.0 - 1.0
    maxSpeedMultiplier: number;
    slidingEffect: boolean;
}

export interface AccuracyModifier {
    enabled: boolean;
    deviationX: number;
    deviationY: number;
    onlyDuringEffect: boolean;
    visualTrail: boolean;
}

export interface GravityField {
    enabled: boolean;
    centerX: number;  // 0-1 relative
    centerY: number;  // 0-1 relative
    strength: number;
    affectAsteroids: boolean;
    affectBullets: boolean;
    affectPlayer: boolean;
    visualField: boolean;
}

export interface ParticleCollision {
    enabled: boolean;
    blockChance: number;  // 0.0 - 1.0
    particleDensity: number;
    blockZoneY: [number, number];
    visualFeedback: boolean;
}

export interface ComboSystem {
    enabled: boolean;
    comboWindow: number;
    multipliers: number[];
    comboThresholds: number[];
    visualFeedback: boolean;
    soundFeedback: boolean;
}

// ==================== MAIN CONFIG INTERFACE ====================

export interface PlanetGameConfig {
    id: string;
    displayName: string;
    description: string;

    // Visual
    background: string;
    backgroundColor: string;
    particleColor: string;
    shipTint?: string;

    // Gameplay
    asteroidSpawnRate: number;
    maxAsteroids: number;
    asteroidSpeedMin: number;
    asteroidSpeedMax: number;
    asteroidSize: number;
    asteroidHealth: number;

    // Ship
    shipScale: number;
    shipSpeed: number;
    bulletSpeed: number;
    bulletDamage: number;

    // Special Effects
    hasSpecialEffect: boolean;
    specialEffectType?: 'dust_storm' | 'acid_rain' | 'gravity_well' | 'ice_storm' | 'ring_navigation' | 'heat_wave';
    specialEffectIntensity: number;

    // Environment
    hasRadar: boolean;
    hasFog: boolean;
    fogOpacity: number;
    visibility: number; // 0-1, 1 = full visibility

    // Audio
    musicKey?: string;
    ambientSound?: string;

    // Scoring
    pointsPerAsteroid: number;
    bonusMultiplier: number;

    // Difficulty
    difficulty: 'easy' | 'medium' | 'hard' | 'extreme';

    // ==================== NEW: GAMEPLAY MODIFIERS ====================
    environmentHazard?: EnvironmentHazard;
    movementModifier?: MovementModifier;
    accuracyModifier?: AccuracyModifier;
    gravityField?: GravityField;
    particleCollision?: ParticleCollision;
    comboSystem?: ComboSystem;
}

export const PLANET_GAME_CONFIGS: Record<string, PlanetGameConfig> = {
    mercury: {
        id: "mercury",
        displayName: "Sao Thủy",
        description: "Hành tinh gần Mặt Trời nhất - thử thách tốc độ cực cao!",

        background: "linear-gradient(180deg, #1a1a1a 0%, #4a4a4a 30%, #6b5b4b 70%, #2a2a2a 100%)",
        backgroundColor: "#2a2a2a",
        particleColor: "#ffa500",
        shipTint: "#ff8c00",

        asteroidSpawnRate: 500, // Rất nhanh
        maxAsteroids: 30,
        asteroidSpeedMin: 4.0,
        asteroidSpeedMax: 8.0,
        asteroidSize: 35,
        asteroidHealth: 1,

        shipScale: 0.9,
        shipSpeed: 8,
        bulletSpeed: 10,
        bulletDamage: 1,

        hasSpecialEffect: true,
        specialEffectType: 'heat_wave',
        specialEffectIntensity: 0.7,

        hasRadar: true,
        hasFog: false,
        fogOpacity: 0,
        visibility: 0.8,

        musicKey: "mercury_theme",
        ambientSound: "solar_wind",

        pointsPerAsteroid: 100,
        bonusMultiplier: 1.5,

        difficulty: 'hard',

        // Heat Damage System
        environmentHazard: {
            type: 'heat_damage',
            damagePerSecond: 0.33,
            onlyWhenStationary: true,
            threshold: 5,
            visualWarning: true
        },

        // Combo system (all planets)
        comboSystem: {
            enabled: true,
            comboWindow: 3,
            multipliers: [2, 3, 4, 5],
            comboThresholds: [3, 7, 12, 20],
            visualFeedback: true,
            soundFeedback: true
        }
    },

    venus: {
        id: "venus",
        displayName: "Sao Kim",
        description: "Hành tinh với bầu khí quyển dày đặc - mưa axit nguy hiểm!",

        background: "linear-gradient(180deg, #3d2817 0%, #ff6b35 25%, #ffa726 50%, #ff8c42 75%, #d35400 100%)",
        backgroundColor: "#ff6b35",
        particleColor: "#f39c12",
        shipTint: "#e8b86d",

        asteroidSpawnRate: 700,
        maxAsteroids: 25,
        asteroidSpeedMin: 2.5,
        asteroidSpeedMax: 4.5,
        asteroidSize: 45,
        asteroidHealth: 2,

        shipScale: 1.0,
        shipSpeed: 6,
        bulletSpeed: 8,
        bulletDamage: 1,

        hasSpecialEffect: true,
        specialEffectType: 'acid_rain',
        specialEffectIntensity: 0.8,

        hasRadar: true,
        hasFog: true,
        fogOpacity: 0.6,
        visibility: 0.4,

        musicKey: "venus_theme",
        ambientSound: "acid_rain",

        pointsPerAsteroid: 80,
        bonusMultiplier: 1.2,

        difficulty: 'medium',

        // Venus doesn't use environment hazard (low visibility is enough challenge)
        // Combo system (all planets)
        comboSystem: {
            enabled: true,
            comboWindow: 3,
            multipliers: [2, 3, 4, 5],
            comboThresholds: [3, 7, 12, 20],
            visualFeedback: true,
            soundFeedback: true
        }
    },

    earth: {
        id: "earth",
        displayName: "Trái Đất",
        description: "Hành tinh xanh - dọn dẹp rác vũ trụ để bảo vệ ngôi nhà!",

        background: "linear-gradient(180deg, #000814 0%, #001d3d 30%, #003566 60%, #0a1128 100%)",
        backgroundColor: "#001f3f",
        particleColor: "#2ecc71",
        shipTint: "#3498db",

        asteroidSpawnRate: 900,
        maxAsteroids: 20,
        asteroidSpeedMin: 1.5,
        asteroidSpeedMax: 3.5,
        asteroidSize: 50,
        asteroidHealth: 1,

        shipScale: 1.0,
        shipSpeed: 7,
        bulletSpeed: 7,
        bulletDamage: 1,

        hasSpecialEffect: false,
        specialEffectIntensity: 0,

        hasRadar: true,
        hasFog: false,
        fogOpacity: 0,
        visibility: 1.0,

        musicKey: "earth_theme",
        ambientSound: "earth_ambient",

        pointsPerAsteroid: 50,
        bonusMultiplier: 1.0,

        difficulty: 'easy',

        // Earth: No modifiers (tutorial/easy planet)
        // Combo system (all planets)
        comboSystem: {
            enabled: true,
            comboWindow: 3,
            multipliers: [2, 3, 4, 5],
            comboThresholds: [3, 7, 12, 20],
            visualFeedback: true,
            soundFeedback: true
        }
    },

    mars: {
        id: "mars",
        displayName: "Sao Hỏa",
        description: "Hành tinh đỏ với bão cát khắc nghiệt!",

        background: "linear-gradient(180deg, #1a0a0a 0%, #3a0b0b 25%, #7a1f1f 60%, #4a0e0e 100%)",
        backgroundColor: "#3a0b0b",
        particleColor: "#e67e22",
        shipTint: "#d35400",

        asteroidSpawnRate: 800,
        maxAsteroids: 18,
        asteroidSpeedMin: 1.0,
        asteroidSpeedMax: 3.0,
        asteroidSize: 54,
        asteroidHealth: 1,

        shipScale: 1.05,
        shipSpeed: 6,
        bulletSpeed: 7,
        bulletDamage: 1,

        hasSpecialEffect: true,
        specialEffectType: 'dust_storm',
        specialEffectIntensity: 0.6,

        hasRadar: true,
        hasFog: true,
        fogOpacity: 0.4,
        visibility: 0.6,

        musicKey: "mars_theme",
        ambientSound: "dust_storm",

        pointsPerAsteroid: 60,
        bonusMultiplier: 1.1,

        difficulty: 'medium',

        // Accuracy Penalty System
        accuracyModifier: {
            enabled: true,
            deviationX: 15,
            deviationY: 5,
            onlyDuringEffect: true,
            visualTrail: true
        },

        // Combo system (all planets)
        comboSystem: {
            enabled: true,
            comboWindow: 3,
            multipliers: [2, 3, 4, 5],
            comboThresholds: [3, 7, 12, 20],
            visualFeedback: true,
            soundFeedback: true
        }
    },

    jupiter: {
        id: "jupiter",
        displayName: "Sao Mộc",
        description: "Hành tinh khí khổng lồ với lực hấp dẫn mạnh mẽ!",

        background: "linear-gradient(180deg, #2b1f0f 0%, #6b3a00 30%, #935116 50%, #5a3010 80%, #3b1f00 100%)",
        backgroundColor: "#3b1f00",
        particleColor: "#f39c12",
        shipTint: "#d68910",

        asteroidSpawnRate: 600,
        maxAsteroids: 35,
        asteroidSpeedMin: 2.0,
        asteroidSpeedMax: 5.0,
        asteroidSize: 64,
        asteroidHealth: 2,

        shipScale: 1.2,
        shipSpeed: 5,
        bulletSpeed: 6,
        bulletDamage: 2,

        hasSpecialEffect: true,
        specialEffectType: 'gravity_well',
        specialEffectIntensity: 0.9,

        hasRadar: true,
        hasFog: true,
        fogOpacity: 0.3,
        visibility: 0.7,

        musicKey: "jupiter_theme",
        ambientSound: "gas_giant",

        pointsPerAsteroid: 120,
        bonusMultiplier: 2.0,

        difficulty: 'hard',

        // Gravity Trajectory System
        gravityField: {
            enabled: true,
            centerX: 0.5,
            centerY: 0.5,
            strength: 0.3,
            affectAsteroids: true,
            affectBullets: true,
            affectPlayer: false,
            visualField: true
        },

        // Combo system (all planets)
        comboSystem: {
            enabled: true,
            comboWindow: 3,
            multipliers: [2, 3, 4, 5],
            comboThresholds: [3, 7, 12, 20],
            visualFeedback: true,
            soundFeedback: true
        }
    },

    saturn: {
        id: "saturn",
        displayName: "Sao Thổ",
        description: "Hành tinh với vành đai tuyệt đẹp - bay qua các mảnh vỡ!",

        background: "linear-gradient(180deg, #3d3520 0%, #f0e68c 20%, #daa520 50%, #b8860b 80%, #4d4020 100%)",
        backgroundColor: "#f0e68c",
        particleColor: "#d4af37",
        shipTint: "#f9e79f",

        asteroidSpawnRate: 750,
        maxAsteroids: 28,
        asteroidSpeedMin: 1.8,
        asteroidSpeedMax: 4.2,
        asteroidSize: 58,
        asteroidHealth: 1,

        shipScale: 1.1,
        shipSpeed: 6.5,
        bulletSpeed: 7.5,
        bulletDamage: 1,

        hasSpecialEffect: true,
        specialEffectType: 'ring_navigation',
        specialEffectIntensity: 0.7,

        hasRadar: true,
        hasFog: false,
        fogOpacity: 0,
        visibility: 0.9,

        musicKey: "saturn_theme",
        ambientSound: "ring_particles",

        pointsPerAsteroid: 90,
        bonusMultiplier: 1.3,

        difficulty: 'medium',

        // Bullet Blocking System
        particleCollision: {
            enabled: true,
            blockChance: 0.2,
            particleDensity: 0.05,
            blockZoneY: [0.4, 0.6],
            visualFeedback: true
        },

        // Combo system (all planets)
        comboSystem: {
            enabled: true,
            comboWindow: 3,
            multipliers: [2, 3, 4, 5],
            comboThresholds: [3, 7, 12, 20],
            visualFeedback: true,
            soundFeedback: true
        }
    },

    uranus: {
        id: "uranus",
        displayName: "Sao Thiên Vương",
        description: "Hành tinh nghiêng - thế giới xoay ngược!",

        background: "linear-gradient(180deg, #0d3b3b 0%, #aee5d8 30%, #87ceeb 50%, #5f9ea0 70%, #2c5f5f 100%)",
        backgroundColor: "#aee5d8",
        particleColor: "#17a2b8",
        shipTint: "#48c9b0",

        asteroidSpawnRate: 650,
        maxAsteroids: 22,
        asteroidSpeedMin: 2.2,
        asteroidSpeedMax: 4.8,
        asteroidSize: 52,
        asteroidHealth: 1,

        shipScale: 1.0,
        shipSpeed: 7,
        bulletSpeed: 8,
        bulletDamage: 1,

        hasSpecialEffect: true,
        specialEffectType: 'ice_storm',
        specialEffectIntensity: 0.5,

        hasRadar: true,
        hasFog: true,
        fogOpacity: 0.2,
        visibility: 0.8,

        musicKey: "uranus_theme",
        ambientSound: "ice_wind",

        pointsPerAsteroid: 70,
        bonusMultiplier: 1.4,

        difficulty: 'medium',

        // Movement Friction System (Ice Physics)
        movementModifier: {
            enabled: true,
            accelerationMultiplier: 0.5,
            decelerationMultiplier: 0.3,
            maxSpeedMultiplier: 1.2,
            slidingEffect: true
        },

        // Combo system (all planets)
        comboSystem: {
            enabled: true,
            comboWindow: 3,
            multipliers: [2, 3, 4, 5],
            comboThresholds: [3, 7, 12, 20],
            visualFeedback: true,
            soundFeedback: true
        }
    },

    neptune: {
        id: "neptune",
        displayName: "Sao Hải Vương",
        description: "Hành tinh xa nhất - bóng tối vũ trụ sâu thẳm!",

        background: "linear-gradient(180deg, #000814 0%, #001d3d 20%, #003566 40%, #4169e1 60%, #1a5490 80%, #000a1f 100%)",
        backgroundColor: "#5b5ddf",
        particleColor: "#3498db",
        shipTint: "#5499c7",

        asteroidSpawnRate: 1000,
        maxAsteroids: 15,
        asteroidSpeedMin: 0.8,
        asteroidSpeedMax: 2.5,
        asteroidSize: 70,
        asteroidHealth: 3,

        shipScale: 1.3,
        shipSpeed: 4,
        bulletSpeed: 5,
        bulletDamage: 2,

        hasSpecialEffect: true,
        specialEffectType: 'gravity_well',
        specialEffectIntensity: 0.8,

        hasRadar: true,
        hasFog: true,
        fogOpacity: 0.7,
        visibility: 0.3,

        musicKey: "neptune_theme",
        ambientSound: "deep_space",

        pointsPerAsteroid: 150,
        bonusMultiplier: 2.5,

        difficulty: 'extreme',

        // Gravity Trajectory System (same as Jupiter but stronger)
        gravityField: {
            enabled: true,
            centerX: 0.5,
            centerY: 0.5,
            strength: 0.4,  // Stronger than Jupiter
            affectAsteroids: true,
            affectBullets: true,
            affectPlayer: false,
            visualField: true
        },

        // Combo system (all planets)
        comboSystem: {
            enabled: true,
            comboWindow: 3,
            multipliers: [2, 3, 4, 5],
            comboThresholds: [3, 7, 12, 20],
            visualFeedback: true,
            soundFeedback: true
        }
    }
};

export function getPlanetConfig(planetId: string): PlanetGameConfig {
    return PLANET_GAME_CONFIGS[planetId.toLowerCase()] || PLANET_GAME_CONFIGS.earth;
}

export function getAllPlanetConfigs(): PlanetGameConfig[] {
    return Object.values(PLANET_GAME_CONFIGS);
}
