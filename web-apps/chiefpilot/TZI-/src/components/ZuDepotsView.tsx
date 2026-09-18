import React, { useState } from "react";
import { ZU_DEPOTS } from "../data/universeBibleData";
import { 
  Building2, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  Layers, 
  Coins, 
  ChevronRight,
  Landmark
} from "lucide-react";

export const ZuDepotsView: React.FC = () => {
  const [selectedDepot, setSelectedDepot] = useState(ZU_DEPOTS[0]);

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#140b07] via-[#1a0f09] to-[#261309]/60 border border-[#f27d26]/30 rounded-2xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(242,125,38,0.1)] relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#f27d26]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#f27d26]/15 text-[#ffaa5e] border border-[#f27d26]/30 shadow-[0_0_12px_rgba(242,125,38,0.2)]">
            <Building2 className="w-3.5 h-3.5 text-[#f27d26]" />
            <span>501(c)(8) Fraternal Benefit Architecture</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#fcf8f5] tracking-tight font-cinzel">
            Zu Depots, Economic Self-Origination & Youth Apprenticeship Framework
          </h1>
          <p className="text-[#c8bbb0] text-sm max-w-3xl leading-relaxed">
            The self-originating organizational matrix establishing the 5 core depots,
            the 3x under-18 descendant intern roles (Apogee & Epigee), and the 9 Zu initiatives including Zu Clinics, Zu Grid, and Zu Factory Output.
          </p>
        </div>
      </div>

      {/* Depots Master Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Depot Selector Sidebar */}
        <div className="lg:col-span-4 space-y-2">
          <div className="text-xs font-mono text-[#96897e] uppercase font-semibold px-1 mb-2">
            The 5 Self-Originating Zu Depots
          </div>

          {ZU_DEPOTS.map((depot) => {
            const isSelected = depot.code === selectedDepot.code;
            return (
              <button
                key={depot.code}
                onClick={() => setSelectedDepot(depot)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-[#24130b] border-[#f27d26] text-[#fcf8f5] shadow-[0_0_15px_rgba(242,125,38,0.2)]"
                    : "bg-[#140b07]/90 border-[#f27d26]/15 text-[#b8aba0] hover:text-[#fcf8f5] hover:bg-[#1a0f0a]"
                }`}
              >
                <div>
                  <div className="text-xs font-mono text-[#ffaa5e] font-bold">{depot.code}</div>
                  <div className="text-sm font-bold text-[#fcf8f5] mt-0.5 font-cinzel">{depot.title}</div>
                  <div className="text-[10px] font-mono text-[#7e7065] mt-1">Type: {depot.depotType}</div>
                </div>
                <ChevronRight className={`w-4 h-4 ${isSelected ? "text-[#f27d26]" : "text-[#5e4f45]"}`} />
              </button>
            );
          })}
        </div>

        {/* Selected Depot Deep Dive */}
        <div className="lg:col-span-8 bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#f27d26]/15 pb-5">
            <div>
              <div className="text-xs font-mono text-[#ffaa5e] font-bold">{selectedDepot.code}</div>
              <h2 className="text-2xl font-bold text-[#fcf8f5] mt-1 font-cinzel">{selectedDepot.title}</h2>
              <div className="text-xs font-mono text-[#96897e] mt-1">Leadership: {selectedDepot.leadership}</div>
            </div>
            <div className="px-3 py-1 rounded-lg bg-[#24130b] border border-[#f27d26]/30 text-[#ffaa5e] text-xs font-mono shadow-sm">
              {selectedDepot.depotType}
            </div>
          </div>

          {/* Youth Interns & Apprenticeship Role */}
          <div className="bg-[#0c0603] p-4 rounded-xl border border-[#f27d26]/25 space-y-2 shadow-inner">
            <div className="text-xs font-mono text-[#ffaa5e] font-bold uppercase flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#f27d26]" />
              Youth Descendants Council (3x Under-18 Interns // Apogee x2 & Epigee x2)
            </div>
            <p className="text-xs text-[#d5c8be] font-mono leading-relaxed">
              {selectedDepot.descendantsRole}
            </p>
          </div>

          {/* Consorts or Scribes Officers */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono text-[#96897e] uppercase font-semibold">
              Consorts / Scribes / Officers Guild
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {selectedDepot.consortsOrScribes.map((officer, i) => (
                <div
                  key={i}
                  className="bg-[#0c0603] p-2.5 rounded-lg border border-[#f27d26]/15 text-xs font-mono text-[#e0d8d0]"
                >
                  {officer}
                </div>
              ))}
            </div>
          </div>

          {/* Active Initiatives & Subsidiaries */}
          <div className="space-y-3 pt-2">
            <h4 className="text-xs font-mono text-[#96897e] uppercase font-semibold">
              Active Zu Operational Initiatives
            </h4>
            <div className="flex flex-wrap gap-2">
              {selectedDepot.zuInitiatives.map((init, i) => (
                <span
                  key={i}
                  className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[#0c0603] border border-[#f27d26]/20 text-[#ffaa5e] font-medium shadow-sm"
                >
                  ● {init}
                </span>
              ))}
            </div>
          </div>

          {/* Tribute Flow & Financial Routing */}
          <div className="pt-4 border-t border-[#f27d26]/15 space-y-2">
            <div className="text-xs font-mono text-emerald-400 font-bold uppercase flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-emerald-400" />
              Tribute Routing & Revenue Mechanism
            </div>
            <p className="text-xs text-[#d5c8be] font-mono bg-[#0c0603] p-3 rounded-lg border border-[#f27d26]/15 shadow-inner leading-relaxed">
              {selectedDepot.tributeFlow}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
