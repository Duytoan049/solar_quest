import { GameManagerProvider } from "../core/engine/GameManager";
import { AuthProvider } from "../contexts/AuthContext";
import { useGameManager } from "../core/engine/GameContext";
import { useAuth } from "../contexts/AuthContext";
import MainMenu from "../features/menu/MainMenu";
import PlanetScene from "../components/PlanetScene1";
import WarpScreen from "../features/transition/WarpScreen";
import GameScene from "../core/engine/GameScene";
import PlanetGameDemo from "../components/PlanetGameDemo";
import PlanetDetail from "../features/planet-info/PlanetDetail";
import AuthPage from "../features/auth/AuthPage";
import UserProfilePage from "../features/profile/UserProfilePage";
import LeaderboardPage from "../features/leaderboard/LeaderboardPage";
import { Loader2 } from "lucide-react";

function SceneController() {
  const { scene, setScene, sceneParams } = useGameManager();
  const { user, loading } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 mx-auto mb-4 animate-spin" />
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  // If user not logged in and on menu scene without guest mode, show auth first
  const isGuestMode = sceneParams?.guestMode === true;
  if (!user && scene === "menu" && !isGuestMode) {
    return <AuthPage />;
  }

  // Redirect to auth if not logged in (except for demo and other guest-allowed scenes)
  if (
    !user &&
    scene !== "demo" &&
    scene !== "menu" &&
    scene !== "warp" &&
    scene !== "solar_system" &&
    scene !== "game" &&
    scene !== "planet_detail"
  ) {
    return <AuthPage />;
  }

  switch (scene) {
    case "menu":
      return <MainMenu />;
    case "warp":
      return <WarpScreen />;
    case "solar_system":
      return <PlanetScene />;
    case "profile":
      return <UserProfilePage />;
    case "leaderboard":
      return <LeaderboardPage />;
    case "game": {
      const planetId = (sceneParams?.planetId as string) ?? "earth";
      return (
        <GameScene
          planetId={planetId}
          onComplete={() => setScene("planet_detail", { planetId })}
        />
      );
    }
    case "planet_detail": {
      return <PlanetDetail />;
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
    <AuthProvider>
      <GameManagerProvider>
        <SceneController />
      </GameManagerProvider>
    </AuthProvider>
  );
}

export default App;
