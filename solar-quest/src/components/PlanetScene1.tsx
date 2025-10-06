import React, { useState, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useGameManager } from "@/core/engine/GameManager";
import { OrbitControls, Stars } from "@react-three/drei";
import Saturn from "./Saturn";
import planets from "./planets";
import PlanetMenu from "./PlanetMenu";
import CameraController from "./CameraController";
import Galaxy from "../ui/Galaxy";

function RotatingPlanet({
  textureUrl,
  position,
  size,
  speed,
  onSelect,
}: {
  textureUrl: string;
  position: [number, number, number];
  size: number;
  speed: number;
  onSelect: () => void;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ref.current) {
      const t = clock.getElapsedTime() * speed;
      ref.current.position.x =
        position[0] * Math.cos(t) - position[2] * Math.sin(t);
      ref.current.position.z =
        position[0] * Math.sin(t) + position[2] * Math.cos(t);
    }
  });

  return (
    <mesh
      ref={ref}
      onClick={onSelect}
      onPointerOver={(e) => (
        e.stopPropagation(), (document.body.style.cursor = "pointer")
      )}
      onPointerOut={(e) => (
        e.stopPropagation(), (document.body.style.cursor = "auto")
      )}
    >
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial map={new THREE.TextureLoader().load(textureUrl)} />
    </mesh>
  );
}

export default function PlanetScene() {
  const { setScene } = useGameManager();
  const [targetPosition, setTargetPosition] = useState<
    [number, number, number] | null
  >(null);

  const handlePlanetSelect = () => {
    setScene("game");
  };

  return (
    <div className="w-full h-screen bg-black relative">
      <div className="absolute inset-0 z-0">
        {/* <Galaxy
          mouseRepulsion={false}
          mouseInteraction={false}
          density={0.4}
          glowIntensity={0.1}
          saturation={0.3}
          hueShift={140}
          starSpeed={0.1}
          twinkleIntensity={0.1}
          rotationSpeed={0}
          repulsionStrength={2}
          autoCenterRepulsion={0}
          speed={0.1}
        /> */}
      </div>
      <PlanetMenu onSelectPlanet={setTargetPosition} />

      <Canvas
        camera={{ position: [0, 0, 20], fov: 60 }}
        className="relative z-10"
      >
        <CameraController targetPosition={targetPosition} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 2, 2]} />
        <Stars
          radius={100}
          depth={50}
          count={3000}
          factor={4}
          saturation={0.5} // Increase saturation for more vibrant stars
          fade
          speed={1} // Add subtle movement to stars
        />

        {planets.map((planet, index) =>
          planet.name === "Saturn" ? (
            <Saturn
              key={index}
              position={planet.position as [number, number, number]}
            />
          ) : (
            <RotatingPlanet
              key={index}
              textureUrl={planet.texture}
              position={planet.position as [number, number, number]}
              size={planet.size || 1}
              speed={planet.speed}
              onSelect={() => handlePlanetSelect()}
            />
          )
        )}

        <OrbitControls />
      </Canvas>
    </div>
  );
}
