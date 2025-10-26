# 🎮 Victory Sequence System

## 📖 Tổng quan

Hệ thống Victory Sequence tạo trải nghiệm cinematic khi người chơi hoàn thành game, bao gồm:

- ✨ Animation phi thuyền bay đến hành tinh
- 🤖 AI Companion giới thiệu hành tinh
- 🎬 Chuyển tiếp mượt mà sang PlanetDetail

---

## 🏗️ Kiến trúc

### **Components**

1. **VictorySequence.tsx**

   - Orchestrates toàn bộ victory flow
   - 5 phases: celebration → launch → travel → arrival → ai-intro
   - Animations: ship launch, warp effect, planet zoom
   - Duration: ~18-20 giây (có thể skip)

2. **AICompanion.tsx**
   - Hiển thị AI hologram
   - Typing effect cho dialogue
   - Performance-based messages
   - Smooth transitions

### **Data**

3. **aiCompanions.ts**
   - 8 AI characters (1 cho mỗi planet)
   - Unique personalities & dialogues
   - Planet-specific facts

### **Types**

4. **victory.d.ts**
   - VictoryPhase type
   - AICompanionData interface
   - VictoryStats interface

---

## 🎬 Animation Flow

```
┌─────────────┐
│  VICTORY!   │  2-3s: Celebration screen
│   Stats     │  - Score, combo, damage
└──────┬──────┘
       │
┌──────▼──────┐
│   LAUNCH    │  3-4s: Spaceship acceleration
│    ↑ 🚀    │  - Ship moves up
│  Particles  │  - Particle trail
└──────┬──────┘
       │
┌──────▼──────┐
│   TRAVEL    │  3-4s: Warp speed
│  ═══════    │  - Warp lines
│   ═════     │  - Speed effect
└──────┬──────┘
       │
┌──────▼──────┐
│  ARRIVAL    │  4-5s: Planet approach
│     🌍      │  - Planet grows
│   orbit 🚀  │  - Ship orbits
└──────┬──────┘
       │
┌──────▼──────┐
│  AI INTRO   │  Variable: AI dialogue
│   🤖 💬     │  - Hologram effect
│  Typing...  │  - Facts & intro
└──────┬──────┘
       │
┌──────▼──────┐
│   EXPLORE   │  Transition to PlanetDetail
│   Planet    │
└─────────────┘
```

---

## 🤖 AI Companions

Mỗi hành tinh có AI companion riêng:

| Planet  | AI Name  | Personality | Color  |
| ------- | -------- | ----------- | ------ |
| Mercury | HELIOS   | Scientific  | Orange |
| Venus   | AURORA   | Mysterious  | Gold   |
| Mars    | ARES     | Friendly    | Red    |
| Jupiter | ZEUS     | Scientific  | Golden |
| Saturn  | CRONOS   | Mysterious  | Sandy  |
| Uranus  | GAIA     | Scientific  | Cyan   |
| Neptune | POSEIDON | Friendly    | Blue   |

---

## 💻 Usage

### **In GameScene.tsx**

```typescript
// 1. Import
import VictorySequence from "@/features/victory/VictorySequence";
import { getAICompanion } from "@/data/aiCompanions";
import type { VictoryStats } from "@/types/victory";

// 2. State
const [victory, setVictory] = useState(false);
const aiCompanion = getAICompanion(planetId);

// 3. Track stats
const totalShots = useRef(0);
const hits = useRef(0);
const maxComboReached = useRef(0);
const startTime = useRef(Date.now());

// 4. Victory check
if (wave >= 3 && asteroidsCleared) {
  setVictory(true);
}

// 5. Render
{
  victory && (
    <VictorySequence
      planetId={planetId}
      planetName={planetConfig.displayName}
      planetColor={planetConfig.particleColor}
      stats={victoryStats}
      ai={aiCompanion}
      onComplete={() => {
        // Navigate to PlanetDetail
        if (onComplete) onComplete();
      }}
    />
  );
}
```

---

## 🎨 Customization

### **Add new AI**

```typescript
// In aiCompanions.ts
export const aiCompanions: Record<string, AICompanionData> = {
  pluto: {
    id: "pluto",
    name: "HADES",
    title: "Dwarf Planet Explorer",
    personality: "mysterious",
    color: "#B8860B",
    avatar: "🔮",
    dialogues: {
      intro: [
        "Welcome to Pluto!",
        "I am HADES, keeper of the outer realm.",
        "This dwarf planet holds many secrets...",
      ],
      performanceBased: {
        highScore: "Impressive navigation through the Kuiper Belt!",
        noDamage: "Flawless! You truly are a master pilot!",
        highCombo: "Your precision rivals the stars themselves!",
        default: "You have done well, traveler.",
      },
      facts: [
        "Pluto has 5 known moons",
        "Its largest moon Charon is half its size",
        "Surface temperature: -233°C",
      ],
      explore: "Explore the icy mysteries of the outer solar system!",
    },
  },
};
```

### **Adjust timing**

```typescript
// In VictorySequence.tsx
useEffect(() => {
  const timers: NodeJS.Timeout[] = [];

  if (phase === "celebration") {
    timers.push(setTimeout(() => setPhase("launch"), 2500)); // Change this
  }
  // ... more phases
}, [phase]);
```

---

## ⚡ Features

### **User Control**

- ✅ **ESC** to skip entire sequence
- ✅ **Click** to skip typing animation
- ✅ **Auto-progress** through phases
- ✅ **Progress bar** showing completion

### **Performance-based Messages**

AI responds differently based on performance:

- No damage taken → Special praise
- High combo → Combo-specific message
- High score → Score-specific message
- Default → Standard congratulations

### **Visual Effects**

- 🌟 Particle explosions
- ✨ Hologram glow
- 🌀 Warp speed lines
- 🎨 Gradient backgrounds
- 💫 Twinkling stars

---

## 📊 Victory Stats

```typescript
interface VictoryStats {
  score: number; // Final score
  maxCombo: number; // Highest combo achieved
  accuracy: number; // hits / shots * 100
  damagesTaken: number; // 3 - lives
  timeElapsed: number; // Seconds played
}
```

---

## 🔧 Integration với PlanetDetail

Victory Sequence tự động navigate đến PlanetDetail khi complete:

```typescript
<VictorySequence
  onComplete={() => {
    // This is called when user clicks "Explore"
    setScene("planet-detail");
  }}
/>
```

---

## 🎯 Future Enhancements

- [ ] **Voice Acting** cho AI companions
- [ ] **3D Planet Models** thay vì 2D circles
- [ ] **Achievements System** unlock special dialogues
- [ ] **Leaderboard Integration**
- [ ] **Social Sharing** của stats
- [ ] **Replay System** xem lại victory sequence

---

## 🐛 Troubleshooting

### **Victory không trigger**

- Check `wave >= 3` condition
- Verify `asteroidsCleared` logic
- Check `victory` state

### **Animation lag**

- Reduce particle count
- Optimize canvas rendering
- Check React.memo usage

### **AI dialogue không hiện**

- Verify `aiCompanion` được load
- Check `planetId` mapping
- Inspect console errors

---

## 📝 Notes

- Total sequence duration: ~18-20 seconds
- Skippable at any point
- Responsive design
- Mobile-friendly
- Accessible (keyboard controls)

---

**Created with ❤️ for Solar Quest**
