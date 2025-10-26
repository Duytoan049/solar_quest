import { useState } from "react";
import { getPlanetConfig, getAllPlanetConfigs } from "../core/game/PlanetGameConfigs";
import { getGraphicsConfig } from "../core/graphics/PlanetGraphics";
import GameScene from "../core/engine/GameScene";
import GameMechanicsInfo from "./GameMechanicsInfo";
import { Info } from "lucide-react";

export default function PlanetGameDemo() {
  const [selectedPlanet, setSelectedPlanet] = useState("mars");
  const [showMechanics, setShowMechanics] = useState(false);
  const planetConfigs = getAllPlanetConfigs();
  const currentConfig = getPlanetConfig(selectedPlanet);
  const graphicsConfig = getGraphicsConfig(selectedPlanet);

  return (
    <div className="w-full h-screen bg-black">
      {/* Planet Selector */}
      <div className="absolute top-4 left-4 z-50 bg-black/80 backdrop-blur-md p-4 rounded-lg max-w-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-white text-lg font-bold">🚀 Chọn Hành Tinh</h3>
          <button
            onClick={() => setShowMechanics(true)}
            className="text-blue-400 hover:text-blue-300 transition-colors"
            title="Xem hướng dẫn"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {planetConfigs.map((config) => (
            <button
              key={config.id}
              onClick={() => setSelectedPlanet(config.id)}
              className={`px-3 py-2 rounded text-sm font-medium transition-all ${
                selectedPlanet === config.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {config.displayName}
            </button>
          ))}
        </div>
        
        {/* Planet Info */}
        <div className="mt-4 p-3 rounded bg-gray-800/50">
          <h4 className="text-sm font-bold text-white mb-2">{currentConfig.displayName}</h4>
          <p className="text-xs text-gray-300 mb-2">{currentConfig.description}</p>
          
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-400">
            <div>
              <span className="font-semibold">Độ khó:</span> {currentConfig.difficulty}
            </div>
            <div>
              <span className="font-semibold">Hiệu ứng:</span> {currentConfig.specialEffectType || "Không"}
            </div>
            <div>
              <span className="font-semibold">Điểm/Thiên thạch:</span> {currentConfig.pointsPerAsteroid}
            </div>
            <div>
              <span className="font-semibold">Tốc độ:</span> {currentConfig.asteroidSpeedMin}-{currentConfig.asteroidSpeedMax}
            </div>
          </div>
          
          {/* Color Preview */}
          <div className="mt-2 flex gap-2">
            <div 
              className="w-4 h-4 rounded border"
              style={{ backgroundColor: graphicsConfig.shipColor }}
              title="Màu phi thuyền"
            />
            <div 
              className="w-4 h-4 rounded border"
              style={{ backgroundColor: graphicsConfig.asteroidColor }}
              title="Màu thiên thạch"
            />
            <div 
              className="w-4 h-4 rounded border"
              style={{ backgroundColor: graphicsConfig.bulletColor }}
              title="Màu đạn"
            />
          </div>
        </div>

        {/* Controls */}
        <div className="mt-3 text-xs text-gray-400">
          <div>🖱️ Di chuyển chuột để điều khiển</div>
          <div>🖱️ Click hoặc Space để bắn</div>
          <div>⏸️ P để tạm dừng</div>
        </div>
      </div>

      {/* Game Scene */}
      <GameScene planetId={selectedPlanet} />

      {/* Game Mechanics Info Modal */}
      <GameMechanicsInfo 
        isOpen={showMechanics} 
        onClose={() => setShowMechanics(false)} 
      />
    </div>
  );
}
