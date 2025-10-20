import React from "react";
import type { PlanetData } from "./PlanetScene1"; // Import the type

interface PlanetInfoPanelProps {
  planet: PlanetData | null;
  onClose: () => void;
  onStartMission: () => void;
}

export default function PlanetInfoPanel({
  planet,
  onClose,
  onStartMission,
}: PlanetInfoPanelProps) {
  if (!planet) return null;

  // A simple fade-in animation using Tailwind classes
  const animationClasses = "transition-opacity duration-500 ease-in-out";

  return (
    <div
      className={`absolute top-1/2 right-4 -translate-y-1/2 bg-black/60 backdrop-blur-md p-6 rounded-lg shadow-lg text-white w-80 max-w-sm z-50 ${animationClasses} ${
        planet ? "opacity-100" : "opacity-0"
      }`}
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-white/50 hover:text-white transition"
        aria-label="Close"
      >
        &times; {/* A simple 'x' for closing */}
      </button>
      <h2 className="text-3xl font-bold mb-2 text-cyan-300">{planet.name}</h2>
      <p className="text-base text-white/80 mb-6">{planet.description}</p>
      <button
        onClick={onStartMission}
        className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105"
      >
        Bắt đầu nhiệm vụ
      </button>
    </div>
  );
}
