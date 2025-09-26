import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import Planet from "./Planet";
import Saturn from "./Saturn";
import planets from "./planets";
import PlanetMenu from "./PlanetMenu";
import CameraController from "./CameraController";

export default function PlanetScene() {
  const [targetPosition, setTargetPosition] = useState<
    [number, number, number] | null
  >(null);

  return (
    <div className="w-full h-screen bg-black relative">
      <PlanetMenu onSelectPlanet={setTargetPosition} />

      <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
        <CameraController targetPosition={targetPosition} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 2, 2]} />
        <Stars
          radius={100}
          depth={50}
          count={3000}
          factor={4}
          saturation={0}
          fade
        />

        {planets.map((planet, index) =>
          planet.name === "Saturn" ? (
            <Saturn
              key={index}
              position={planet.position as [number, number, number]}
            />
          ) : (
            <Planet
              key={index}
              textureUrl={planet.texture}
              position={planet.position as [number, number, number]}
              size={planet.size || 1}
            />
          )
        )}

        <OrbitControls />
      </Canvas>
    </div>
  );
}
