import type { PlanetGameConfig } from "../game/PlanetGameConfigs";

export interface GraphicsConfig {
    shipColor: string;
    shipAccent: string;
    shipGlow: string;
    asteroidColor: string;
    asteroidAccent: string;
    bulletColor: string;
    bulletAccent: string;
    bulletGlow: string;
}

export const PLANET_GRAPHICS_CONFIGS: Record<string, GraphicsConfig> = {
    mercury: {
        // Hot metallic silver with orange glow
        shipColor: "#c0c0c0",
        shipAccent: "#e67e22",
        shipGlow: "#ffa500",
        asteroidColor: "#6b5b4b",
        asteroidAccent: "#d4af37",
        bulletColor: "#ff8c00",
        bulletAccent: "#ffd700",
        bulletGlow: "#ffe4b5"
    },
    venus: {
        // Toxic orange-red with sulfuric glow
        shipColor: "#e8b86d",
        shipAccent: "#d35400",
        shipGlow: "#f39c12",
        asteroidColor: "#c0392b",
        asteroidAccent: "#e74c3c",
        bulletColor: "#e74c3c",
        bulletAccent: "#f39c12",
        bulletGlow: "#ffa07a"
    },
    earth: {
        // Blue-white NASA style with green accents
        shipColor: "#ecf0f1",
        shipAccent: "#3498db",
        shipGlow: "#5dade2",
        asteroidColor: "#7f8c8d",
        asteroidAccent: "#95a5a6",
        bulletColor: "#2ecc71",
        bulletAccent: "#52de97",
        bulletGlow: "#a8e6cf"
    },
    mars: {
        // Rust red with dust orange
        shipColor: "#d35400",
        shipAccent: "#922b21",
        shipGlow: "#e67e22",
        asteroidColor: "#641e16",
        asteroidAccent: "#a04000",
        bulletColor: "#ff6b35",
        bulletAccent: "#ff8c42",
        bulletGlow: "#ffa07a"
    },
    jupiter: {
        // Cream-brown with orange storm bands
        shipColor: "#f4d03f",
        shipAccent: "#d68910",
        shipGlow: "#f8c471",
        asteroidColor: "#935116",
        asteroidAccent: "#ca6f1e",
        bulletColor: "#f39c12",
        bulletAccent: "#f8c471",
        bulletGlow: "#fdeaa8"
    },
    saturn: {
        // Pale gold with ring particle sparkle
        shipColor: "#f9e79f",
        shipAccent: "#d4af37",
        shipGlow: "#fef5e7",
        asteroidColor: "#9a7d0a",
        asteroidAccent: "#d4af37",
        bulletColor: "#f4d03f",
        bulletAccent: "#fef5e7",
        bulletGlow: "#fffbea"
    },
    uranus: {
        // Cyan-turquoise ice blue
        shipColor: "#48c9b0",
        shipAccent: "#117a65",
        shipGlow: "#a2d9ce",
        asteroidColor: "#1a5276",
        asteroidAccent: "#5dade2",
        bulletColor: "#17a2b8",
        bulletAccent: "#76d7c4",
        bulletGlow: "#d4f1f4"
    },
    neptune: {
        // Deep cobalt blue with electric highlights
        shipColor: "#5499c7",
        shipAccent: "#1a5490",
        shipGlow: "#85c1e9",
        asteroidColor: "#1b2631",
        asteroidAccent: "#2e86ab",
        bulletColor: "#3498db",
        bulletAccent: "#85c1e9",
        bulletGlow: "#d6eaf8"
    }
};

export function drawSpaceship(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    rotation: number,
    config: GraphicsConfig,
    planetConfig: PlanetGameConfig,
    time?: number
) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rotation);

    // Outer glow effect
    ctx.shadowColor = config.shipGlow;
    ctx.shadowBlur = 15;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Ship body with gradient
    const bodyGradient = ctx.createLinearGradient(0, -height / 2, 0, height / 2);
    bodyGradient.addColorStop(0, config.shipColor);
    bodyGradient.addColorStop(0.5, config.shipAccent);
    bodyGradient.addColorStop(1, config.shipColor);

    ctx.fillStyle = bodyGradient;
    ctx.strokeStyle = config.shipAccent;
    ctx.lineWidth = 2;

    // Main body (sleek triangle)
    ctx.beginPath();
    ctx.moveTo(0, -height / 2);
    ctx.lineTo(-width / 3, height / 2);
    ctx.lineTo(width / 3, height / 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Remove shadow for details
    ctx.shadowBlur = 0;

    // Wings based on planet type
    if (planetConfig.id === 'mercury' || planetConfig.id === 'venus') {
        drawHeatWings(ctx, width, height, config);
    } else if (planetConfig.id === 'jupiter' || planetConfig.id === 'saturn') {
        drawGasGiantWings(ctx, width, height, config);
    } else if (planetConfig.id === 'uranus' || planetConfig.id === 'neptune') {
        drawIceWings(ctx, width, height, config);
    } else {
        drawStandardWings(ctx, width, height, config);
    }

    // Engine glow with animation
    drawEngineGlow(ctx, width, height, config, time);

    // Cockpit with shine
    drawCockpit(ctx, width, height, config);

    // Special planet effects
    if (time !== undefined) {
        drawPlanetSpecificEffects(ctx, width, height, config, planetConfig, time);
    }

    ctx.restore();
}

function drawHeatWings(ctx: CanvasRenderingContext2D, width: number, height: number, config: GraphicsConfig) {
    // Heat-resistant angular wings
    ctx.fillStyle = config.shipAccent;
    ctx.beginPath();
    ctx.moveTo(-width / 2, height / 4);
    ctx.lineTo(-width / 2, height / 2);
    ctx.lineTo(-width / 4, height / 2);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(width / 2, height / 4);
    ctx.lineTo(width / 2, height / 2);
    ctx.lineTo(width / 4, height / 2);
    ctx.closePath();
    ctx.fill();
}

function drawGasGiantWings(ctx: CanvasRenderingContext2D, width: number, height: number, config: GraphicsConfig) {
    // Large curved wings for gas giants
    ctx.fillStyle = config.shipAccent;
    ctx.beginPath();
    ctx.arc(-width / 3, height / 3, width / 4, 0, Math.PI, true);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(width / 3, height / 3, width / 4, 0, Math.PI, true);
    ctx.fill();
}

function drawIceWings(ctx: CanvasRenderingContext2D, width: number, height: number, config: GraphicsConfig) {
    // Sharp ice-resistant wings
    ctx.fillStyle = config.shipAccent;
    ctx.beginPath();
    ctx.moveTo(-width / 2, height / 3);
    ctx.lineTo(-width / 2, height / 2);
    ctx.lineTo(-width / 6, height / 2);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(width / 2, height / 3);
    ctx.lineTo(width / 2, height / 2);
    ctx.lineTo(width / 6, height / 2);
    ctx.closePath();
    ctx.fill();
}

function drawStandardWings(ctx: CanvasRenderingContext2D, width: number, height: number, config: GraphicsConfig) {
    // Standard rounded wings
    ctx.fillStyle = config.shipAccent;
    ctx.beginPath();
    ctx.ellipse(-width / 3, height / 3, width / 6, height / 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(width / 3, height / 3, width / 6, height / 8, 0, 0, Math.PI * 2);
    ctx.fill();
}

function drawEngineGlow(ctx: CanvasRenderingContext2D, width: number, height: number, config: GraphicsConfig, time?: number) {
    // Engine exhaust with advanced pulsing effect
    const pulse = time ? (Math.sin(time * 0.15) * 0.3 + 0.8) : 0.8;

    // Outer glow
    const glowGradient = ctx.createRadialGradient(0, height / 2 + height / 5, 0, 0, height / 2 + height / 5, width / 4);
    glowGradient.addColorStop(0, config.shipGlow);
    glowGradient.addColorStop(0.5, config.shipAccent);
    glowGradient.addColorStop(1, 'transparent');

    ctx.fillStyle = glowGradient;
    ctx.globalAlpha = pulse * 0.7;
    ctx.beginPath();
    ctx.ellipse(0, height / 2 + height / 5, width / 4, height / 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner core
    ctx.fillStyle = config.shipGlow;
    ctx.globalAlpha = pulse;
    ctx.beginPath();
    ctx.ellipse(0, height / 2 + height / 6, width / 8, height / 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
}

function drawCockpit(ctx: CanvasRenderingContext2D, width: number, height: number, config: GraphicsConfig) {
    // Cockpit window with glass reflection
    const cockpitGradient = ctx.createRadialGradient(-width / 16, -height / 3, 0, 0, -height / 4, width / 6);
    cockpitGradient.addColorStop(0, 'rgba(255, 255, 255, 0.9)');
    cockpitGradient.addColorStop(0.5, config.shipGlow);
    cockpitGradient.addColorStop(1, config.shipAccent);

    ctx.fillStyle = cockpitGradient;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.ellipse(0, -height / 4, width / 7, height / 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Highlight reflection
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.ellipse(-width / 20, -height / 3, width / 16, height / 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
}

export function drawAsteroid(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    rotation: number,
    config: GraphicsConfig,
    planetConfig: PlanetGameConfig
) {
    ctx.save();
    ctx.translate(x + size / 2, y + size / 2);
    ctx.rotate(rotation);

    // Add shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;

    // Asteroid shape based on planet
    if (planetConfig.id === 'mercury' || planetConfig.id === 'venus') {
        drawHotAsteroid(ctx, size, config);
    } else if (planetConfig.id === 'jupiter' || planetConfig.id === 'saturn') {
        drawGasGiantAsteroid(ctx, size, config);
    } else if (planetConfig.id === 'uranus' || planetConfig.id === 'neptune') {
        drawIceAsteroid(ctx, size, config);
    } else {
        drawStandardAsteroid(ctx, size, config);
    }

    ctx.restore();
}

function drawHotAsteroid(ctx: CanvasRenderingContext2D, size: number, config: GraphicsConfig) {
    // Jagged, molten-looking asteroid with lava cracks
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, size / 2);
    gradient.addColorStop(0, config.asteroidAccent);
    gradient.addColorStop(0.6, config.asteroidColor);
    gradient.addColorStop(1, '#1a0a00');

    ctx.fillStyle = gradient;
    ctx.strokeStyle = config.asteroidAccent;
    ctx.lineWidth = 2;

    ctx.beginPath();
    const points = 8;
    for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const radius = size / 2 + (Math.random() - 0.5) * size / 4;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Lava cracks
    ctx.strokeStyle = config.asteroidAccent;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.8;
    for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * size / 3, Math.sin(angle) * size / 3);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

function drawGasGiantAsteroid(ctx: CanvasRenderingContext2D, size: number, config: GraphicsConfig) {
    // Large, rounded asteroid with gas swirls and bands
    const gradient = ctx.createRadialGradient(-size / 6, -size / 6, 0, 0, 0, size / 2);
    gradient.addColorStop(0, config.asteroidAccent);
    gradient.addColorStop(0.5, config.asteroidColor);
    gradient.addColorStop(1, '#2a1500');

    ctx.fillStyle = gradient;
    ctx.strokeStyle = config.asteroidAccent;
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Gas bands
    ctx.strokeStyle = config.asteroidAccent;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.4;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(0, -size / 8 + i * size / 6, size / 2.5, size / 12, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.globalAlpha = 1;
}

function drawIceAsteroid(ctx: CanvasRenderingContext2D, size: number, config: GraphicsConfig) {
    // Sharp, crystalline asteroid with ice shine
    const gradient = ctx.createRadialGradient(-size / 6, -size / 6, 0, 0, 0, size / 2);
    gradient.addColorStop(0, 'rgba(200, 240, 255, 0.9)');
    gradient.addColorStop(0.5, config.asteroidColor);
    gradient.addColorStop(1, '#0a1520');

    ctx.fillStyle = gradient;
    ctx.strokeStyle = config.asteroidAccent;
    ctx.lineWidth = 2;

    ctx.beginPath();
    const points = 6;
    for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const radius = size / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Ice crystal lines with glow
    ctx.strokeStyle = config.asteroidAccent;
    ctx.shadowColor = config.asteroidAccent;
    ctx.shadowBlur = 5;
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.8;
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * size / 2, Math.sin(angle) * size / 2);
        ctx.stroke();
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
}

function drawStandardAsteroid(ctx: CanvasRenderingContext2D, size: number, config: GraphicsConfig) {
    // Standard irregular asteroid with realistic shading
    const gradient = ctx.createRadialGradient(-size / 4, -size / 4, 0, 0, 0, size / 2);
    gradient.addColorStop(0, config.asteroidAccent);
    gradient.addColorStop(0.6, config.asteroidColor);
    gradient.addColorStop(1, '#0a0a0a');

    ctx.fillStyle = gradient;
    ctx.strokeStyle = config.asteroidAccent;
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    const points = 12;
    for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const radius = size / 2 + (Math.random() - 0.5) * size / 6;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Surface craters
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    for (let i = 0; i < 3; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.random() * size / 4;
        const x = Math.cos(angle) * dist;
        const y = Math.sin(angle) * dist;
        ctx.beginPath();
        ctx.arc(x, y, size / 10, 0, Math.PI * 2);
        ctx.fill();
    }
}

export function drawBullet(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    config: GraphicsConfig
) {
    ctx.save();

    // Outer glow halo
    const outerGlow = ctx.createRadialGradient(x, y, 0, x, y, width + 4);
    outerGlow.addColorStop(0, config.bulletGlow);
    outerGlow.addColorStop(0.5, config.bulletAccent);
    outerGlow.addColorStop(1, 'transparent');

    ctx.fillStyle = outerGlow;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.ellipse(x, y, width / 2 + 4, height / 2 + 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Main bullet with gradient
    const bulletGradient = ctx.createRadialGradient(x - width / 4, y - height / 4, 0, x, y, width / 2);
    bulletGradient.addColorStop(0, config.bulletGlow);
    bulletGradient.addColorStop(0.5, config.bulletColor);
    bulletGradient.addColorStop(1, config.bulletAccent);

    ctx.globalAlpha = 1;
    ctx.fillStyle = bulletGradient;
    ctx.shadowColor = config.bulletGlow;
    ctx.shadowBlur = 10;

    ctx.beginPath();
    ctx.ellipse(x, y, width / 2, height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner shine
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.ellipse(x - width / 6, y - height / 6, width / 6, height / 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bullet trail effect
    const trailGradient = ctx.createLinearGradient(x, y, x, y + height);
    trailGradient.addColorStop(0, config.bulletGlow);
    trailGradient.addColorStop(1, 'transparent');

    ctx.fillStyle = trailGradient;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.ellipse(x, y + height / 2, width / 3, height / 2, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}

function drawPlanetSpecificEffects(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    config: GraphicsConfig,
    planetConfig: PlanetGameConfig,
    time: number
) {
    ctx.save();

    switch (planetConfig.id) {
        case 'mercury':
            // Heat shimmer waves - more pronounced
            ctx.strokeStyle = config.shipGlow;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.3;
            for (let i = 0; i < 4; i++) {
                const offset = Math.sin(time * 0.03 + i * 0.5) * 2;
                ctx.beginPath();
                ctx.moveTo(-width / 2 + offset, -height / 2);
                ctx.quadraticCurveTo(offset, 0, width / 2 + offset, height / 2);
                ctx.stroke();
            }
            break;

        case 'venus':
            // Toxic bubbles floating
            ctx.fillStyle = config.shipAccent;
            ctx.globalAlpha = 0.25;
            for (let i = 0; i < 5; i++) {
                const x = Math.sin(time * 0.02 + i * 1.2) * width / 4;
                const y = Math.cos(time * 0.025 + i * 1.2) * height / 4;
                const radius = 2 + Math.sin(time * 0.05 + i) * 1;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
            }
            break;

        case 'jupiter':
            // Rotating storm bands
            ctx.strokeStyle = config.shipAccent;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.25;
            for (let i = 0; i < 3; i++) {
                const radius = width / 5 + i * width / 10;
                const angle = time * 0.015 + i * Math.PI / 3;
                ctx.beginPath();
                ctx.arc(0, 0, radius, angle, angle + Math.PI);
                ctx.stroke();
            }
            break;

        case 'saturn':
            // Orbiting ring particles
            ctx.fillStyle = config.shipAccent;
            ctx.globalAlpha = 0.4;
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2 + time * 0.008;
                const radius = width / 3.5;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius * 0.3; // Flattened orbit
                ctx.beginPath();
                ctx.arc(x, y, 1.2, 0, Math.PI * 2);
                ctx.fill();
            }

            // Ring glow
            ctx.strokeStyle = config.shipGlow;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.15;
            ctx.beginPath();
            ctx.ellipse(0, 0, width / 3.5, width / 10, 0, 0, Math.PI * 2);
            ctx.stroke();
            break;

        case 'uranus':
            // Rotating ice crystals
            ctx.strokeStyle = config.shipAccent;
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.35;
            ctx.shadowColor = config.shipGlow;
            ctx.shadowBlur = 4;
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2 + time * 0.01;
                const length = 8 + Math.sin(time * 0.03 + i) * 4;
                const baseRadius = width / 5;
                const x1 = Math.cos(angle) * baseRadius;
                const y1 = Math.sin(angle) * baseRadius;
                const x2 = Math.cos(angle) * (baseRadius + length);
                const y2 = Math.sin(angle) * (baseRadius + length);
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();

                // Crystal tips
                ctx.beginPath();
                ctx.arc(x2, y2, 1.5, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.shadowBlur = 0;
            break;

        case 'neptune':
            // Swirling deep space energy
            ctx.globalAlpha = 0.25;
            for (let i = 0; i < 4; i++) {
                const angle = time * 0.02 + i * Math.PI / 2;
                const radius = width / 4;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;

                const energyGradient = ctx.createRadialGradient(x, y, 0, x, y, 5);
                energyGradient.addColorStop(0, config.shipGlow);
                energyGradient.addColorStop(0.5, config.shipAccent);
                energyGradient.addColorStop(1, 'transparent');

                ctx.fillStyle = energyGradient;
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            }

            // Energy tendrils
            ctx.strokeStyle = config.shipGlow;
            ctx.lineWidth = 1;
            ctx.globalAlpha = 0.15;
            ctx.beginPath();
            for (let i = 0; i < 3; i++) {
                const angle = time * 0.015 + i * Math.PI * 2 / 3;
                const x = Math.cos(angle) * width / 6;
                const y = Math.sin(angle) * height / 6;
                if (i === 0) ctx.moveTo(0, 0);
                ctx.lineTo(x, y);
            }
            ctx.stroke();
            break;

        case 'mars':
            // Dust particles swirling
            ctx.fillStyle = config.shipAccent;
            ctx.globalAlpha = 0.2;
            for (let i = 0; i < 6; i++) {
                const x = Math.sin(time * 0.015 + i) * width / 3;
                const y = Math.cos(time * 0.02 + i * 0.7) * height / 3;
                ctx.beginPath();
                ctx.arc(x, y, 1, 0, Math.PI * 2);
                ctx.fill();
            }
            break;

        case 'earth':
            // Gentle atmospheric glow
            ctx.strokeStyle = config.shipGlow;
            ctx.lineWidth = 2;
            ctx.globalAlpha = 0.1 + Math.sin(time * 0.05) * 0.05;
            ctx.beginPath();
            ctx.arc(0, 0, width / 2.5, 0, Math.PI * 2);
            ctx.stroke();
            break;
    }

    ctx.restore();
}

export function getGraphicsConfig(planetId: string): GraphicsConfig {
    return PLANET_GRAPHICS_CONFIGS[planetId.toLowerCase()] || PLANET_GRAPHICS_CONFIGS.earth;
}
