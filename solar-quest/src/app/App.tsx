import { useGameManager } from "../core/engine/GameManager";
import MainMenu from "../features/menu/MainMenu";
import PlanetScene from "../components/PlanetScene1";
import WarpScreen from "../features/transition/WarpScreen";
import GameScene from "../core/engine/GameScene";

export default function App() {
  const { scene } = useGameManager();

  switch (scene) {
    case "menu":
      return <MainMenu />;
    case "warp":
      // Khi ở màn hình warp, chúng ta render WarpScreen
      // WarpScreen sẽ tự xử lý việc chuyển cảnh khi tải xong
      return <WarpScreen />;
    case "planetdetail":
      return <PlanetScene />;
    case "game":
      return <GameScene />;
    default:
      return <MainMenu />;
  }
}
