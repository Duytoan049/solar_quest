
import { useGameManager } from "@/core/engine/GameManager";
import MainMenu from "@/features/menu/MainMenu";
import WarpScreen from "@/features/transition/WarpScreen";
import GameScene from "@/core/engine/GameScene";

export default function App() {
  const { scene } = useGameManager();

  if (scene === "menu") return <MainMenu />;
  if (scene === "warp") return <WarpScreen />;
  if (scene === "game") return <GameScene />;
  return null;
}
