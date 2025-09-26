import React from "react";
import planets from "./planets";

interface PlanetMenuProps {
  onSelectPlanet: (position: [number, number, number]) => void;
}

export default function PlanetMenu({ onSelectPlanet }: PlanetMenuProps) {
  return (
    <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md p-4 rounded shadow text-white space-y-2 max-h-[90vh] overflow-y-auto">
      <h2 className="text-lg font-semibold mb-2">Solar system</h2>
      {planets.map((planet, index) => (
        <button
          key={index}
          onClick={() => {
            const [x, y, z] = planet.position as [number, number, number];
            onSelectPlanet([x, y, z + 5]); // thêm khoảng cách từ phía trước hành tinh
          }}
          className="block w-full text-left px-2 py-1 hover:bg-white/20 rounded transition"
        >
          {planet.name}
        </button>
      ))}
    </div>
  );
}
