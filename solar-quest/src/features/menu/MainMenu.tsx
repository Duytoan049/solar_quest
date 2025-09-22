import Button from "../../ui/Button";
import { useMenuState } from "./hooks/useMenuState";

export default function MainMenu() {
  const { startGame } = useMenuState();
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      <h1 className="text-4xl font-bold mb-6">🚀 Space Explorer</h1>
      <Button onClick={startGame}>Start Game</Button>
    </div>
  );
}
