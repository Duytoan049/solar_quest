import { useEffect } from "react";
import { useGameManager } from "@/core/engine/GameManager";

export default function WarpScreen() {
  const { setScene } = useGameManager();

  useEffect(() => {
    // Sau 2 giây, tự chuyển sang game
    const timer = setTimeout(() => setScene("game"), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="warp text-white">
      <p>Đang bay vào vũ trụ...</p>
      {/* Ở đây bạn sẽ thêm hiệu ứng 3D hoặc nền sao */}
    </div>
  );
}
