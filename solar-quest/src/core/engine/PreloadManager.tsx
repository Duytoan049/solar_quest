import { useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { planets as planetData } from "../../components/planets";
import { useGameManager } from "./GameManager";
import { useRef } from "react";

// Lấy tất cả các đường dẫn texture cần tải
const planetTextureUrls = planetData.map((p) => p.texture);
// Đừng quên texture của vành đai Sao Thổ!
planetTextureUrls.push("src/assets/textures/saturn_ring_alpha.png");

/**
 * Component này không render ra bất cứ thứ gì.
 * Nhiệm vụ duy nhất của nó là gọi useLoader để kích hoạt việc tải và cache tài nguyên.
 * Nó sẽ tự động báo cho GameManager khi hoàn tất.
 */
export default function PreloadManager() {
  // Gọi useLoader để thực sự tải và cache. React Suspense sẽ xử lý phần còn lại.
  useLoader(THREE.TextureLoader, planetTextureUrls);

  // Lấy hàm setter từ store
  const setPlanetSceneReady = useGameManager.getState().setPlanetSceneReady;

  // Sử dụng ref để đảm bảo hàm chỉ được gọi một lần duy nhất trong suốt vòng đời component
  const hasSignaled = useRef(false);

  // FIX: Gọi hàm setPlanetSceneReady ngay trong quá trình render
  // Khi đoạn code này chạy, điều đó có nghĩa là Suspense đã hoàn thành
  // và tất cả các texture đã được tải xong.
  if (!hasSignaled.current) {
    console.log(
      "PreloadManager has finished loading. Signaling readiness NOW."
    );
    setPlanetSceneReady(true);
    hasSignaled.current = true;
  }

  // Chúng ta không cần useEffect ở đây nữa.
  // useEffect(() => {
  //   console.log("PreloadManager has finished loading textures.");
  //   setPlanetSceneReady(true);
  // }, [setPlanetSceneReady]);

  return null; // Không render gì ra màn hình
}
