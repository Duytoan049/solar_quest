import React from "react";
import { useTranslation } from "react-i18next";
import { ArrowUpRight, Gauge, Rocket, X } from "lucide-react";
import type { PlanetData } from "./PlanetScene1";

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
  const { t } = useTranslation();

  if (!planet) return null;

  return (
    <div className="absolute right-5 top-1/2 z-50 w-[min(390px,calc(100vw-2rem))] -translate-y-1/2">
      <div className="relative overflow-hidden rounded-3xl border border-white/12 bg-[#07101c]/78 p-6 text-white shadow-[0_30px_100px_rgba(0,0,0,0.48)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />

        <button
          onClick={onClose}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-white/8 bg-white/[0.03] text-white/45 transition hover:border-white/15 hover:bg-white/[0.07] hover:text-white"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="pr-12">
          <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-cyan-200/60">
            Planetary dossier
          </p>
          <div className="mt-2 flex items-end gap-3">
            <h2 className="font-display text-4xl font-bold tracking-tight text-white">
              {t(`planets.${planet.id}.name`)}
            </h2>
            <span className="mb-1 rounded-full border border-white/10 bg-white/[0.04] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/45">
              {planet.id}
            </span>
          </div>
        </div>

        <p className="mt-5 text-sm leading-7 text-white/65">
          {t(`planets.${planet.id}.description`)}
        </p>

        <div className="mt-6 grid grid-cols-2 gap-2">
          <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-3.5">
            <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
              <Gauge className="h-3.5 w-3.5 text-cyan-200/65" />
              Radius
            </div>
            <p className="mt-2 text-sm font-semibold text-white/85">
              {planet.radius ? `${planet.radius.toLocaleString()} km` : "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/8 bg-white/[0.025] p-3.5">
            <div className="flex items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/35">
              <OrbitIcon />
              Distance
            </div>
            <p className="mt-2 text-sm font-semibold text-white/85">
              {planet.distance ? `${planet.distance.toLocaleString()} AU` : "—"}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between border-y border-white/8 py-4">
          <div className="flex items-center gap-2.5">
            <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(74,222,128,0.55)]" />
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/35">
                Mission status
              </p>
              <p className="mt-1 text-xs font-medium text-emerald-200/85">
                Ready for expedition
              </p>
            </div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-white/25" />
        </div>

        <button
          onClick={onStartMission}
          className="group mt-5 flex w-full items-center justify-between rounded-2xl border border-cyan-200/20 bg-gradient-to-r from-cyan-300/[0.14] to-blue-300/[0.08] px-4 py-3.5 text-left shadow-[0_18px_50px_rgba(34,211,238,0.08)] transition-all duration-300 hover:border-cyan-200/40 hover:from-cyan-300/[0.2] hover:to-blue-300/[0.12]"
        >
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-200/15 bg-cyan-200/[0.08]">
              <Rocket className="h-4 w-4 text-cyan-100" />
            </span>
            <span>
              <span className="block text-[9px] font-semibold uppercase tracking-[0.22em] text-cyan-100/55">
                Mission control
              </span>
              <span className="mt-1 block text-sm font-semibold tracking-[0.05em] text-white">
                {t("planetInfo.startMission")}
              </span>
            </span>
          </span>
          <span className="text-white/35 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-cyan-100/80">
            →
          </span>
        </button>
      </div>
    </div>
  );
}

function OrbitIcon() {
  return (
    <span className="relative inline-flex h-3.5 w-3.5 items-center justify-center">
      <span className="absolute h-2 w-3 -rotate-12 rounded-full border border-cyan-200/55" />
      <span className="h-1 w-1 rounded-full bg-cyan-100" />
    </span>
  );
}
