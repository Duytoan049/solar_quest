import React from "react";
import { useTranslation } from "react-i18next";
import { ChevronRight, Orbit } from "lucide-react";
import planets from "@/components/planets";

interface PlanetMenuProps {
  onSelectPlanet: (planetName: string) => void;
}

export default function PlanetMenu({ onSelectPlanet }: PlanetMenuProps) {
  const { t } = useTranslation();

  return (
    <aside className="absolute left-5 top-24 z-20 w-[270px] overflow-hidden rounded-2xl border border-white/10 bg-[#07101c]/65 p-3 text-white shadow-[0_24px_80px_rgba(0,0,0,0.42)] backdrop-blur-2xl">
      <div className="mb-2 flex items-center justify-between border-b border-white/8 px-2 pb-3">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-[0.28em] text-cyan-200/65">
            Navigation
          </p>
          <h2 className="mt-1 text-sm font-semibold tracking-[0.08em] text-white/95">
            {t("menu.title")}
          </h2>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.035]">
          <Orbit className="h-4 w-4 text-cyan-200/75" />
        </div>
      </div>

      <div className="max-h-[calc(90vh-9rem)] space-y-1.5 overflow-y-auto pr-1 scrollbar-thin">
        {planets.map((planet, index) => (
          <button
            key={planet.name}
            onClick={() => onSelectPlanet(planet.name)}
            className="group flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-left transition-all duration-300 hover:border-white/10 hover:bg-white/[0.055]"
          >
            <span className="w-5 text-[9px] font-mono text-white/25">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="relative flex h-7 w-7 items-center justify-center rounded-full border border-white/8 bg-white/[0.025]">
              <span className="h-2 w-2 rounded-full bg-cyan-200/65 shadow-[0_0_14px_rgba(103,232,249,0.45)] transition-transform duration-300 group-hover:scale-125" />
            </span>
            <span className="min-w-0 flex-1 truncate text-xs font-medium tracking-[0.08em] text-white/75 group-hover:text-white">
              {t(`planets.${planet.id}.name`)}
            </span>
            <ChevronRight className="h-3.5 w-3.5 text-white/20 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-cyan-200/70" />
          </button>
        ))}
      </div>
    </aside>
  );
}
