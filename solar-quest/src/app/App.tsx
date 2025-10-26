import { GameManagerProvider } from "../core/engine/GameManager";
import { useGameManager } from "../core/engine/GameContext";
import MainMenu from "../features/menu/MainMenu";
import PlanetScene from "../components/PlanetScene1";
import WarpScreen from "../features/transition/WarpScreen";
import GameScene from "../core/engine/GameScene";
import PlanetGameDemo from "../components/PlanetGameDemo";

function SceneController() {
  const { scene, setScene, sceneParams } = useGameManager(); // Thêm setScene và sceneParams vào destructure

  switch (scene) {
    case "menu":
      return <MainMenu />;
    case "warp":
      return <WarpScreen />;
    // FIX 2: Sử dụng đúng tên scene đã định nghĩa trong types.ts
    case "solar_system":
      return <PlanetScene />;
    case "game": {
      const planetId = (sceneParams?.planetId as string) ?? "earth";
      return (
        <GameScene
          planetId={planetId}
          onComplete={() => setScene("solar_system")} // Giờ setScene đã defined
        />
      );
    }
    case "demo": {
      return <PlanetGameDemo />;
    }
    default:
      return <MainMenu />;
  }
}

function App() {
  return (
    // Component này đến từ GameManager.tsx và nó hoạt động đúng
    <GameManagerProvider>
      <SceneController />
    </GameManagerProvider>
  );
}

export default App;
