import React from "react";
import planets from "@/components/planets";

interface PlanetMenuProps {
  onSelectPlanet: (planetName: string) => void;
}

export default function PlanetMenu({ onSelectPlanet }: PlanetMenuProps) {
  return (
    <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md p-4 rounded-lg shadow-lg text-white space-y-2 max-h-[90vh] overflow-y-auto z-20">
      <h2 className="text-lg font-semibold mb-2 text-cyan-300">Hệ Mặt Trời</h2>
      {planets.map((planet) => (
        <button
          key={planet.name}
          onClick={() => onSelectPlanet(planet.name)}
          className="block w-full text-left px-3 py-2 hover:bg-white/10 rounded-md transition-colors"
        >
          {planet.name}
        </button>
      ))}
    </div>
  );
}
