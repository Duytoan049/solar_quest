import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

const markers = [
  {
    id: 1,
    label: "Olympus Mons",
    position: [2, 2, 0] as [number, number, number],
    description: "Largest volcano in the solar system.",
  },
  {
    id: 2,
    label: "Valles Marineris",
    position: [-2, 1, 0] as [number, number, number],
    description: "A vast canyon system.",
  },
  {
    id: 3,
    label: "Polar Ice Caps",
    position: [0, -2, 0] as [number, number, number],
    description: "Frozen water and CO2.",
  },
  {
    id: 4,
    label: "Tharsis Region",
    position: [3, -1, 0] as [number, number, number],
    description: "Volcanic plateau.",
  },
];

interface MarkerProps {
  id: number;
  label: string;
  position: [number, number, number];
  onClick: (id: number) => void;
}

function Marker({ id, label, position, onClick }: MarkerProps) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[0.1, 16, 16]} />
      <meshStandardMaterial color="yellow" />
      <Html position={[0, 0.2, 0]} center>
        <button
          onClick={() => onClick(id)}
          className="bg-black/70 text-white px-2 py-1 rounded text-xs"
          style={{ cursor: "pointer" }}
        >
          {label}
        </button>
      </Html>
    </mesh>
  );
}

export default function PlanetDetail() {
  const [activeMarker, setActiveMarker] = useState<number | null>(null);

  const handleMarkerClick = (id: number) => {
    setActiveMarker(id);
    const marker = markers.find((m) => m.id === id);
    if (marker) {
      const { position } = marker;
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.set(position[0], position[1], 5);
      camera.lookAt(new THREE.Vector3(...position));
    }
  };

  return (
    <div className="w-full h-screen bg-black relative">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} />

        <mesh>
          <sphereGeometry args={[2, 64, 64]} />
          <meshStandardMaterial
            map={new THREE.TextureLoader().load("src/assets/textures/mars.jpg")}
          />
        </mesh>

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            id={marker.id}
            label={marker.label}
            position={marker.position}
            onClick={handleMarkerClick}
          />
        ))}

        <OrbitControls />
      </Canvas>

      {activeMarker && (
        <div className="absolute bottom-10 left-10 bg-black/70 text-white p-4 rounded">
          <h2 className="text-lg font-bold">
            {markers.find((m) => m.id === activeMarker)?.label}
          </h2>
          <p>{markers.find((m) => m.id === activeMarker)?.description}</p>
        </div>
      )}
    </div>
  );
}
