import { useGameManager } from "@/core/engine/GameManager";
import MainMenu from "@/features/menu/MainMenu";
import WarpScreen from "@/features/transition/WarpScreen";
import GameScene from "@/core/engine/GameScene";
import PlanetScene from "@/components/PlanetScene1";

import PlanetDetail from "@/components/PlanetScene";
export default function App() {
  const { scene } = useGameManager();

  if (scene === "menu") return <MainMenu />;
  if (scene === "warp") return <WarpScreen />;
  if (scene === "game") return <GameScene />;
  if (scene === "3dlook") return <PlanetScene />;
  if (scene === "planetdetail") return <PlanetDetail />;
  return null;
}
