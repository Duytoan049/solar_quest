# 🎮 ĐỀ XUẤT GAMEPLAY IMPACT CHO HIỆU ỨNG HÀNH TINH

## 📋 TỔNG QUAN

Document này liệt kê chi tiết các cách để hiệu ứng môi trường của từng hành tinh **TÁC ĐỘNG TRỰC TIẾP** lên gameplay, không chỉ là visual decoration. Mỗi đề xuất bao gồm:

- ✅ Mô tả chi tiết
- ✅ Tác động gameplay cụ thể
- ✅ Data/Config cần thiết
- ✅ Files cần sửa
- ✅ Contract (Input/Output)
- ✅ Ví dụ code

---

## 🌡️ **ĐỀ XUẤT 1: HEAT DAMAGE SYSTEM (Mercury)**

### **Mô tả:**

Khi Heat Wave effect đang active trên Mercury, phi thuyền sẽ **từ từ bị damage** nếu không di chuyển. Khuyến khích người chơi liên tục di chuyển thay vì đứng yên bắn.

### **Gameplay Impact:**

```
- Ship HP giảm dần: -1 HP mỗi 3 giây khi đứng yên
- Damage tăng theo thời gian: càng lâu càng nóng
- Phải di chuyển liên tục để reset heat meter
- Thêm yếu tố "kiting" vào gameplay
```

### **Data/Config Cần Thiết:**

```typescript
// Thêm vào PlanetGameConfig
interface EnvironmentHazard {
  type: 'heat_damage' | 'acid_damage' | 'freeze_slow' | 'gravity_pull';
  damagePerSecond: number;          // Damage rate
  onlyWhenStationary: boolean;      // Chỉ damage khi đứng yên?
  threshold: number;                // Khoảng cách tối thiểu phải di chuyển
  visualWarning: boolean;           // Hiện warning UI?
}

// Mercury config
environmentHazard: {
  type: 'heat_damage',
  damagePerSecond: 0.33,           // ~1 HP mỗi 3 giây
  onlyWhenStationary: true,
  threshold: 5,                     // Phải di chuyển >5px/frame
  visualWarning: true
}
```

### **Files Cần Sửa:**

1. `src/core/game/PlanetGameConfigs.ts` - Thêm `environmentHazard` field
2. `src/core/engine/GameScene.tsx` - Thêm heat damage logic trong game loop
3. `src/features/hud/HUDOverlay.tsx` - Hiển thị heat meter và warning

### **Contract:**

```typescript
// Input
interface HazardCheckInput {
  playerPosition: { x: number; y: number };
  lastPosition: { x: number; y: number };
  deltaTime: number;
  hazardConfig: EnvironmentHazard;
}

// Output
interface HazardCheckOutput {
  shouldApplyDamage: boolean;
  damageAmount: number;
  warningLevel: "none" | "low" | "medium" | "high";
  heatMeterPercent: number; // 0-100
}
```

### **Ví Dụ Code:**

```typescript
// Trong GameScene.tsx
const checkEnvironmentHazard = (): HazardCheckOutput => {
  if (!planetConfig.environmentHazard)
    return {
      shouldApplyDamage: false,
      damageAmount: 0,
      warningLevel: "none",
      heatMeterPercent: 0,
    };

  const hazard = planetConfig.environmentHazard;
  const moved = Math.abs(spaceshipX.current - lastShipX.current);

  if (hazard.onlyWhenStationary && moved < hazard.threshold) {
    heatMeter.current += deltaTime;
    const damageAmount = hazard.damagePerSecond * deltaTime;

    return {
      shouldApplyDamage: true,
      damageAmount,
      warningLevel:
        heatMeter.current > 2
          ? "high"
          : heatMeter.current > 1
          ? "medium"
          : "low",
      heatMeterPercent: Math.min((heatMeter.current / 3) * 100, 100),
    };
  } else {
    heatMeter.current = Math.max(0, heatMeter.current - deltaTime * 2); // Cool down nhanh hơn
    return {
      shouldApplyDamage: false,
      damageAmount: 0,
      warningLevel: "none",
      heatMeterPercent: 0,
    };
  }
};
```

---

## ☣️ **ĐỀ XUẤT 2: ACID SHIELD DEGRADATION (Venus)**

### **Mô tả:**

Mỗi giọt acid rain rơi trúng phi thuyền sẽ **làm suy giảm shield** (layer bảo vệ tạm thời). Shield có thể hồi phục khi tránh acid trong 5 giây.

### **Gameplay Impact:**

```
- Shield HP: 100 → 0 (riêng biệt với Ship HP)
- Acid drops làm giảm shield: -5 shield/hit
- Shield = 0 → bullets rơi trúng gây damage trực tiếp lên ship
- Khuyến khích dodging skill
- Tạo cảm giác nguy hiểm liên tục
```

### **Data/Config Cần Thiết:**

```typescript
interface ShieldSystem {
  enabled: boolean;
  maxShield: number;
  regenDelay: number;           // Giây chờ trước khi regen
  regenRate: number;            // Shield/giây
  damagePerHit: number;         // Damage từ environment
  visualEffect: boolean;
}

// Venus config
shieldSystem: {
  enabled: true,
  maxShield: 100,
  regenDelay: 5,
  regenRate: 10,                // 10 shield/giây
  damagePerHit: 5,
  visualEffect: true
}
```

### **Files Cần Sửa:**

1. `src/core/game/PlanetGameConfigs.ts` - Thêm `shieldSystem` config
2. `src/core/engine/GameScene.tsx` - Logic detect acid hits & shield damage
3. `src/features/hud/HUDOverlay.tsx` - Shield bar UI
4. `src/core/graphics/PlanetGraphics.ts` - Visual shield effect around ship

### **Contract:**

```typescript
// Input
interface ShieldDamageInput {
  acidDrops: Array<{ x: number; y: number }>;
  shipBounds: { x: number; y: number; width: number; height: number };
  currentShield: number;
}

// Output
interface ShieldDamageOutput {
  newShieldValue: number;
  hitsDetected: number;
  shieldBroken: boolean;
  playSound: "shield_hit" | "shield_break" | null;
}
```

### **Ví Dụ Code:**

```typescript
// Trong GameScene.tsx - detect acid hits
const checkAcidCollisions = (): ShieldDamageOutput => {
  if (!planetConfig.shieldSystem?.enabled)
    return {
      newShieldValue: 0,
      hitsDetected: 0,
      shieldBroken: false,
      playSound: null,
    };

  let hits = 0;
  const shipBounds = {
    x: spaceshipX.current - 20,
    y: canvas.height - 70,
    width: 40,
    height: 40,
  };

  // Giả sử có array acidDrops từ drawSpecialEffect
  acidDropsRef.current.forEach((drop) => {
    if (
      drop.x > shipBounds.x &&
      drop.x < shipBounds.x + shipBounds.width &&
      drop.y > shipBounds.y &&
      drop.y < shipBounds.y + shipBounds.height
    ) {
      hits++;
    }
  });

  const damage = hits * planetConfig.shieldSystem.damagePerHit;
  const newShield = Math.max(0, currentShield.current - damage);
  const wasBroken = currentShield.current > 0 && newShield === 0;

  currentShield.current = newShield;

  return {
    newShieldValue: newShield,
    hitsDetected: hits,
    shieldBroken: wasBroken,
    playSound: wasBroken ? "shield_break" : hits > 0 ? "shield_hit" : null,
  };
};
```

---

## 🌪️ **ĐỀ XUẤT 3: ACCURACY PENALTY SYSTEM (Mars Dust Storm)**

### **Mô tả:**

Khi Dust Storm active, bullets sẽ **bị lệch hướng ngẫu nhiên** do gió bão. Người chơi phải bắn nhiều hơn hoặc dự đoán trajectory.

### **Gameplay Impact:**

```
- Bullet deviation: ±15 pixels random offset
- Hit rate giảm ~40%
- Phải bắn leading shots
- Thêm challenge cho aiming skill
- Khuyến khích close-range combat
```

### **Data/Config Cần Thiết:**

```typescript
interface AccuracyModifier {
  enabled: boolean;
  deviationX: number;           // Max horizontal deviation
  deviationY: number;           // Max vertical deviation
  onlyDuringEffect: boolean;    // Chỉ active khi effect on?
  visualTrail: boolean;         // Hiện bullet trail cong?
}

// Mars config
accuracyModifier: {
  enabled: true,
  deviationX: 15,
  deviationY: 5,
  onlyDuringEffect: true,
  visualTrail: true
}
```

### **Files Cần Sửa:**

1. `src/core/game/PlanetGameConfigs.ts` - Thêm `accuracyModifier`
2. `src/core/engine/GameScene.tsx` - Modify bullet trajectory khi spawn
3. `src/core/graphics/PlanetGraphics.ts` - Curved bullet trail effect

### **Contract:**

```typescript
// Input
interface BulletSpawnInput {
  baseX: number;
  baseY: number;
  baseSpeed: number;
  effectActive: boolean;
  modifier: AccuracyModifier;
}

// Output
interface BulletSpawnOutput {
  actualX: number;
  actualY: number;
  velocityX: number;
  velocityY: number;
  visualCurve: number;
}
```

### **Ví Dụ Code:**

```typescript
// Khi shoot bullet
const spawnBulletWithDeviation = (): BulletSpawnOutput => {
  const baseX = spaceshipX.current;
  const baseY = canvas.height - 70;

  if (isSpecialEffect && planetConfig.accuracyModifier?.enabled) {
    const mod = planetConfig.accuracyModifier;
    const deviationX = (Math.random() - 0.5) * mod.deviationX * 2;
    const deviationY = (Math.random() - 0.5) * mod.deviationY * 2;

    return {
      actualX: baseX + deviationX,
      actualY: baseY,
      velocityX: deviationX * 0.1, // Slight horizontal movement
      velocityY: -planetConfig.bulletSpeed + deviationY * 0.05,
      visualCurve: deviationX,
    };
  }

  return {
    actualX: baseX,
    actualY: baseY,
    velocityX: 0,
    velocityY: -planetConfig.bulletSpeed,
    visualCurve: 0,
  };
};
```

---

## ❄️ **ĐỀ XUẤT 4: MOVEMENT FRICTION SYSTEM (Uranus Ice Storm)**

### **Mô tả:**

Ice Storm tạo "ice friction" - phi thuyền **trượt khi di chuyển**, khó control. Giống như lái xe trên băng.

### **Gameplay Impact:**

```
- Ship acceleration giảm 50%
- Ship deceleration giảm 70% (trượt dài hơn)
- Over-steering effect
- Phải anticipate movements
- Skill ceiling cao hơn
```

### **Data/Config Cần Thiết:**

```typescript
interface MovementModifier {
  enabled: boolean;
  accelerationMultiplier: number;  // 0.0 - 1.0
  decelerationMultiplier: number;  // 0.0 - 1.0
  maxSpeedMultiplier: number;      // Speed cap modifier
  slidingEffect: boolean;
}

// Uranus config
movementModifier: {
  enabled: true,
  accelerationMultiplier: 0.5,    // 50% slower acceleration
  decelerationMultiplier: 0.3,    // 70% less friction
  maxSpeedMultiplier: 1.2,        // Can go 20% faster but hard to stop
  slidingEffect: true
}
```

### **Files Cần Sửa:**

1. `src/core/game/PlanetGameConfigs.ts` - Thêm `movementModifier`
2. `src/core/engine/GameScene.tsx` - Physics calculation cho ship movement
3. `src/core/entities/PlayerShip.ts` - Ship movement logic với velocity

### **Contract:**

```typescript
// Input
interface MovementInput {
  currentVelocity: { x: number; y: number };
  inputDirection: { x: number; y: number }; // -1, 0, 1
  deltaTime: number;
  modifier: MovementModifier;
}

// Output
interface MovementOutput {
  newVelocity: { x: number; y: number };
  actualPosition: { x: number; y: number };
  isSliding: boolean;
}
```

### **Ví Dụ Code:**

```typescript
// Ship movement với ice physics
const updateShipMovement = (input: MovementInput): MovementOutput => {
  const mod = planetConfig.movementModifier;
  const baseAccel = 0.5;
  const baseDecel = 0.8;

  let vx = shipVelocity.current.x;
  let vy = shipVelocity.current.y;

  if (mod?.enabled && isSpecialEffect) {
    // Apply ice physics
    if (input.inputDirection.x !== 0) {
      vx += input.inputDirection.x * baseAccel * mod.accelerationMultiplier;
    } else {
      vx *= mod.decelerationMultiplier; // Slide!
    }

    vx = Math.max(
      -planetConfig.shipSpeed * mod.maxSpeedMultiplier,
      Math.min(vx, planetConfig.shipSpeed * mod.maxSpeedMultiplier)
    );
  } else {
    // Normal physics
    if (input.inputDirection.x !== 0) {
      vx = input.inputDirection.x * planetConfig.shipSpeed;
    } else {
      vx *= baseDecel;
    }
  }

  const newX = spaceshipX.current + vx;
  const isSliding = Math.abs(vx) > 0.5 && input.inputDirection.x === 0;

  return {
    newVelocity: { x: vx, y: vy },
    actualPosition: { x: newX, y: canvas.height - 50 },
    isSliding,
  };
};
```

---

## 🌀 **ĐỀ XUẤT 5: GRAVITY TRAJECTORY SYSTEM (Jupiter/Neptune)**

### **Mô tả:**

Gravity Well làm **asteroids và bullets bị kéo về trung tâm**. Trajectory không còn thẳng, phải tính toán curved paths.

### **Gameplay Impact:**

```
- Asteroids di chuyển theo đường cong
- Bullets bị kéo lệch hướng
- Phải aim dự đoán curve
- Tạo dynamic unpredictable gameplay
- Khó dodge asteroids hơn
```

### **Data/Config Cần Thiết:**

```typescript
interface GravityField {
  enabled: boolean;
  centerX: number;              // Gravity center X (0-1 relative)
  centerY: number;              // Gravity center Y (0-1 relative)
  strength: number;             // Pull force multiplier
  affectAsteroids: boolean;
  affectBullets: boolean;
  affectPlayer: boolean;
  visualField: boolean;
}

// Jupiter config
gravityField: {
  enabled: true,
  centerX: 0.5,                 // Center of screen
  centerY: 0.5,
  strength: 0.3,
  affectAsteroids: true,
  affectBullets: true,
  affectPlayer: false,          // Player không bị kéo
  visualField: true
}
```

### **Files Cần Sửa:**

1. `src/core/game/PlanetGameConfigs.ts` - Thêm `gravityField`
2. `src/core/engine/GameScene.tsx` - Gravity physics cho asteroids/bullets
3. `src/core/graphics/PlanetGraphics.ts` - Visual gravity field overlay

### **Contract:**

```typescript
// Input
interface GravityInput {
  objectPosition: { x: number; y: number };
  objectVelocity: { x: number; y: number };
  gravityConfig: GravityField;
  canvasWidth: number;
  canvasHeight: number;
}

// Output
interface GravityOutput {
  newVelocity: { x: number; y: number };
  pullForce: { x: number; y: number };
  distanceToCenter: number;
}
```

### **Ví Dụ Code:**

```typescript
// Apply gravity to objects
const applyGravity = (input: GravityInput): GravityOutput => {
  const grav = input.gravityConfig;
  if (!grav.enabled)
    return {
      newVelocity: input.objectVelocity,
      pullForce: { x: 0, y: 0 },
      distanceToCenter: 0,
    };

  const centerX = input.canvasWidth * grav.centerX;
  const centerY = input.canvasHeight * grav.centerY;

  const dx = centerX - input.objectPosition.x;
  const dy = centerY - input.objectPosition.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < 10)
    return {
      newVelocity: input.objectVelocity,
      pullForce: { x: 0, y: 0 },
      distanceToCenter: distance,
    };

  // Gravity force inversely proportional to distance
  const force = grav.strength / (distance * 0.01);
  const forceX = (dx / distance) * force;
  const forceY = (dy / distance) * force;

  return {
    newVelocity: {
      x: input.objectVelocity.x + forceX,
      y: input.objectVelocity.y + forceY,
    },
    pullForce: { x: forceX, y: forceY },
    distanceToCenter: distance,
  };
};

// Update asteroid position
asteroidsRef.current.forEach((ast) => {
  const gravResult = applyGravity({
    objectPosition: { x: ast.x, y: ast.y },
    objectVelocity: { x: 0, y: ast.speed },
    gravityConfig: planetConfig.gravityField,
    canvasWidth: canvas.width,
    canvasHeight: canvas.height,
  });

  ast.x += gravResult.newVelocity.x;
  ast.y += gravResult.newVelocity.y;
});
```

---

## 💍 **ĐỀ XUẤT 6: BULLET BLOCKING SYSTEM (Saturn Rings)**

### **Mô tả:**

Ring particles có **physical collision** - một số bullets sẽ **bị block** khi bắn qua vành đai. Phải time shots carefully.

### **Gameplay Impact:**

```
- ~20% bullets bị block
- Phải bắn khi gaps trong ring
- Timing challenge
- Bullet economy quan trọng hơn
- Risk/reward cho shooting patterns
```

### **Data/Config Cần Thiết:**

```typescript
interface ParticleCollision {
  enabled: boolean;
  blockChance: number;          // 0.0 - 1.0 chance to block
  particleDensity: number;      // Particles per pixel
  blockZoneY: [number, number]; // Y range where blocking happens
  visualFeedback: boolean;
}

// Saturn config
particleCollision: {
  enabled: true,
  blockChance: 0.2,             // 20% block rate
  particleDensity: 0.05,
  blockZoneY: [0.4, 0.6],       // Middle 20% of screen
  visualFeedback: true
}
```

### **Files Cần Sửa:**

1. `src/core/game/PlanetGameConfigs.ts` - Thêm `particleCollision`
2. `src/core/engine/GameScene.tsx` - Bullet collision detection với ring particles
3. `src/core/graphics/PlanetGraphics.ts` - Spark effect khi bullet bị block

### **Contract:**

```typescript
// Input
interface BulletCollisionInput {
  bullet: { x: number; y: number };
  collisionConfig: ParticleCollision;
  canvasHeight: number;
}

// Output
interface BulletCollisionOutput {
  wasBlocked: boolean;
  sparkPosition: { x: number; y: number } | null;
  playSound: boolean;
}
```

### **Ví Dụ Code:**

```typescript
// Check bullet vs ring particles
const checkBulletBlocking = (
  input: BulletCollisionInput
): BulletCollisionOutput => {
  const config = input.collisionConfig;
  if (!config.enabled)
    return { wasBlocked: false, sparkPosition: null, playSound: false };

  const blockZoneStart = input.canvasHeight * config.blockZoneY[0];
  const blockZoneEnd = input.canvasHeight * config.blockZoneY[1];

  if (input.bullet.y >= blockZoneStart && input.bullet.y <= blockZoneEnd) {
    // Inside blocking zone
    if (Math.random() < config.blockChance) {
      return {
        wasBlocked: true,
        sparkPosition: { x: input.bullet.x, y: input.bullet.y },
        playSound: true,
      };
    }
  }

  return { wasBlocked: false, sparkPosition: null, playSound: false };
};

// Trong game loop
bulletsRef.current = bulletsRef.current.filter((bullet) => {
  bullet.y -= bullet.speed;

  const blockResult = checkBulletBlocking({
    bullet,
    collisionConfig: planetConfig.particleCollision,
    canvasHeight: canvas.height,
  });

  if (blockResult.wasBlocked) {
    // Create spark effect
    createSparkEffect(
      blockResult.sparkPosition!.x,
      blockResult.sparkPosition!.y
    );
    return false; // Remove bullet
  }

  return bullet.y > 0; // Keep if still on screen
});
```

---

## 🎁 **ĐỀ XUẤT 7: POWER-UP COUNTERMEASURE SYSTEM**

### **Mô tả:**

Thêm **power-ups ngẫu nhiên rơi xuống** giúp counter các effect. Ví dụ: Heat Shield, Radar Boost, De-icer, Anti-Gravity.

### **Gameplay Impact:**

```
- Risk/reward cho việc thu power-ups
- Tạo dynamic decision-making
- Buff tạm thời (10-15 giây)
- Multiple power-ups có thể stack
- Tăng replayability
```

### **Data/Config Cần Thiết:**

```typescript
interface PowerUp {
  id: string;
  type:
    | "heat_shield"
    | "radar_boost"
    | "de_icer"
    | "anti_gravity"
    | "rapid_fire";
  duration: number; // Seconds
  spawnChance: number; // Chance per wave
  icon: string;
  color: string;
  effect: PowerUpEffect;
}

interface PowerUpEffect {
  negateEnvironmentHazard?: boolean;
  visibilityBoost?: number; // +0.3 visibility
  movementBoost?: number; // +2 speed
  fireRateBoost?: number; // x2 fire rate
}

// Power-ups per planet
powerUps: [
  {
    id: "heat_shield",
    type: "heat_shield",
    duration: 12,
    spawnChance: 0.15,
    icon: "🛡️",
    color: "#ff6b35",
    effect: { negateEnvironmentHazard: true },
  },
  // ... more power-ups
];
```

### **Files Cần Sửa:**

1. `src/core/game/PlanetGameConfigs.ts` - Thêm `powerUps` array
2. `src/components/PowerUp.tsx` - NEW FILE - Power-up entity
3. `src/core/engine/GameScene.tsx` - Spawn, collect, apply power-ups
4. `src/features/hud/HUDOverlay.tsx` - Active power-ups display

### **Contract:**

```typescript
// Input
interface PowerUpCollectInput {
  powerUpType: string;
  currentActivePowerUps: ActivePowerUp[];
}

// Output
interface PowerUpCollectOutput {
  newActivePowerUps: ActivePowerUp[];
  effectApplied: PowerUpEffect;
  uiNotification: string;
}

interface ActivePowerUp {
  type: string;
  remainingTime: number;
  effect: PowerUpEffect;
}
```

### **Ví Dụ Code:**

```typescript
// Power-up entity
interface PowerUpEntity {
  id: string;
  x: number;
  y: number;
  speed: number;
  type: PowerUp;
  rotation: number;
}

// Spawn power-up
const spawnPowerUp = () => {
  const availablePowerUps = planetConfig.powerUps || [];
  const powerUp =
    availablePowerUps[Math.floor(Math.random() * availablePowerUps.length)];

  if (Math.random() < powerUp.spawnChance) {
    powerUpsRef.current.push({
      id: `powerup_${Date.now()}`,
      x: Math.random() * canvas.width,
      y: -30,
      speed: 2,
      type: powerUp,
      rotation: 0,
    });
  }
};

// Collect power-up
const collectPowerUp = (powerUp: PowerUpEntity) => {
  activePowerUps.current.push({
    type: powerUp.type.type,
    remainingTime: powerUp.type.duration,
    effect: powerUp.type.effect,
  });

  // Play sound + visual effect
  createCollectEffect(powerUp.x, powerUp.y);
};

// Update active power-ups
const updatePowerUps = (deltaTime: number) => {
  activePowerUps.current = activePowerUps.current
    .map((pu) => ({ ...pu, remainingTime: pu.remainingTime - deltaTime }))
    .filter((pu) => pu.remainingTime > 0);
};

// Check if power-up is active
const hasPowerUp = (type: string): boolean => {
  return activePowerUps.current.some((pu) => pu.type === type);
};
```

---

## 🎯 **ĐỀ XUẤT 8: COMBO MULTIPLIER SYSTEM**

### **Mô tả:**

Phá asteroids liên tiếp trong khoảng thời gian ngắn sẽ tạo **combo multiplier**. Effect environments làm khó duy trì combo hơn.

### **Gameplay Impact:**

```
- Combo x2, x3, x4, x5 cho points
- Combo reset nếu miss 3 giây
- Effects làm khó maintain combo
- Risk/reward cao hơn
- Skill expression tốt hơn
```

### **Data/Config Cần Thiết:**

```typescript
interface ComboSystem {
  enabled: boolean;
  comboWindow: number;          // Seconds to maintain
  multipliers: number[];        // [x2, x3, x4, x5]
  comboThresholds: number[];    // [3, 7, 12, 20] hits
  visualFeedback: boolean;
  soundFeedback: boolean;
}

// Default combo config
comboSystem: {
  enabled: true,
  comboWindow: 3,
  multipliers: [2, 3, 4, 5],
  comboThresholds: [3, 7, 12, 20],
  visualFeedback: true,
  soundFeedback: true
}
```

### **Files Cần Sửa:**

1. `src/core/game/PlanetGameConfigs.ts` - Thêm `comboSystem`
2. `src/core/engine/GameScene.tsx` - Combo tracking logic
3. `src/features/hud/HUDOverlay.tsx` - Combo display & animations

### **Contract:**

```typescript
// Input
interface ComboUpdateInput {
  hitRegistered: boolean;
  deltaTime: number;
  currentCombo: number;
  comboTimer: number;
}

// Output
interface ComboUpdateOutput {
  newCombo: number;
  newTimer: number;
  currentMultiplier: number;
  comboLevel: number; // 0-4
  showComboBreak: boolean;
}
```

### **Ví Dụ Code:**

```typescript
// Combo system
const updateCombo = (input: ComboUpdateInput): ComboUpdateOutput => {
  const config = planetConfig.comboSystem;
  if (!config.enabled)
    return {
      newCombo: 0,
      newTimer: 0,
      currentMultiplier: 1,
      comboLevel: 0,
      showComboBreak: false,
    };

  let combo = input.currentCombo;
  let timer = input.comboTimer;
  let comboBreak = false;

  if (input.hitRegistered) {
    combo++;
    timer = config.comboWindow;
  } else {
    timer -= input.deltaTime;
    if (timer <= 0 && combo > 0) {
      combo = 0;
      comboBreak = true;
    }
  }

  // Determine combo level
  let level = 0;
  for (let i = 0; i < config.comboThresholds.length; i++) {
    if (combo >= config.comboThresholds[i]) {
      level = i + 1;
    }
  }

  const multiplier = level > 0 ? config.multipliers[level - 1] : 1;

  return {
    newCombo: combo,
    newTimer: timer,
    currentMultiplier: multiplier,
    comboLevel: level,
    showComboBreak: comboBreak,
  };
};
```

---

## 📊 **TỔNG KẾT VÀ ƯU TIÊN**

### **Priority Level:**

**🔴 HIGH (Implement First):**

1. ✅ Movement Friction System (Uranus) - Simplest, biggest impact
2. ✅ Accuracy Penalty System (Mars) - Easy to implement
3. ✅ Heat Damage System (Mercury) - Clear gameplay change

**🟡 MEDIUM (Implement Second):** 4. ✅ Gravity Trajectory System (Jupiter) - Medium complexity 5. ✅ Bullet Blocking System (Saturn) - Unique mechanic 6. ✅ Combo Multiplier System - Universal benefit

**🟢 LOW (Polish Phase):** 7. ✅ Acid Shield System (Venus) - Complex but cool 8. ✅ Power-Up System - Nice to have, high dev time

### **Implementation Order:**

```
Week 1: Setup contracts & config structure
Week 2: Implement HIGH priority (3 systems)
Week 3: Implement MEDIUM priority (3 systems)
Week 4: Implement LOW priority (2 systems)
Week 5: Testing, balancing, polish
```

### **Testing Checklist:**

- [ ] Each effect feels different
- [ ] No effect is too frustrating
- [ ] Power-ups spawn appropriately
- [ ] Combo system is satisfying
- [ ] Performance remains 60fps
- [ ] UI clearly shows active effects
- [ ] Sound feedback is clear
- [ ] Tutorial explains new mechanics

---

## 🚀 **NEXT STEPS**

1. **Review & Approve** đề xuất này
2. **Choose priority** systems to implement first
3. **Update PlanetGameConfigs.ts** với interfaces
4. **Implement contracts** trong GameScene.tsx
5. **Build HUD components** cho feedback
6. **Test & iterate** từng system
7. **Balance gameplay** based on playtesting

---

**Version**: 1.0  
**Created**: October 26, 2025  
**Status**: 📋 Awaiting Approval  
**Estimated Dev Time**: 4-5 weeks full implementation
