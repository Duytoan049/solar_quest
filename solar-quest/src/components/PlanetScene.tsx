import React, { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import Planet from "./Planet";
import Saturn from "./Saturn";
import planets from "../data/planets";
import PlanetMenu from "./PlanetMenu";
import CameraFlyTo from "../core/engine/CameraFlyTo";
import Marker from "../features/planet-info/PlanetMarkers";
import { marsMarkers } from "../features/planet-info/planetMarkers";

export default function PlanetScene() {
  const [focus, setFocus] = useState<[number, number, number] | null>(null);

  return (
    <div className="w-full h-screen bg-black relative">
      <PlanetMenu onSelectPlanet={setFocus} />

      <Canvas camera={{ position: [0, 0, 20], fov: 60 }}>
        <CameraFlyTo target={focus} />

        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 2, 2]} />
        <Stars radius={100} depth={50} count={3000} factor={4} fade />

        {planets.map((p, i) =>
          p.name === "Saturn" ? (
            <Saturn key={i} position={p.position as [number, number, number]} />
          ) : (
            <Planet
              key={i}
              textureUrl={p.texture}
              position={p.position as [number, number, number]}
              size={p.size || 1}
            />
          )
        )}

        {/* 🔴 Thêm các marker cho Mars */}
        {marsMarkers.map((m) => (
          <Marker
            key={m.id}
            id={m.id}
            label={m.name}
            position={[
              m.position[0] + 15, // 15 là x của sao Hỏa trong planets.ts
              m.position[1],
              m.position[2],
            ]}
            onSelect={(pos) => setFocus([pos[0] + 15, pos[1], pos[2]])}
          />
        ))}

        <OrbitControls enableDamping />
      </Canvas>
    </div>
  );
}
