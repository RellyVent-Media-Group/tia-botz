import React from "react";
import {
  WorkstreamType
} from "../types";
import {
  Sparkles,
  Film,
  BookOpen,
  Users,
  ShieldAlert,
  Tv,
  Bot,
  Table,
  Tv2,
  Building2,
  Cpu,
  Copy
} from "lucide-react";

interface HeaderProps {
  activeWorkstream: WorkstreamType;
  setActiveWorkstream: (stream: WorkstreamType) => void;
  activeSoulCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeWorkstream,
  setActiveWorkstream,
  activeSoulCount,
}) => {
  const navItems: { id: WorkstreamType; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: "universe-bible", label: "Universe Bible", icon: BookOpen },
    { id: "character-bible", label: "30 Souls & Archetypes", icon: Users },
    { id: "pilot-production", label: "Pilot & Stop-Motion", icon: Film },
    { id: "fake-news-desk", label: "Fake News Desk", icon: Tv },
    { id: "shadow-engine", label: "Shadow Engine & Temenos", icon: ShieldAlert },
    { id: "ai-content-pipeline", label: "AI Content Studio", icon: Bot },
    { id: "zu-depots", label: "501(c)(8) Zu Depots", icon: Building2 },
    { id: "project-backlog", label: "Master Backlog Matrix", icon: Table },
    { id: "screening-room", label: "Episode Screening", icon: Tv2 },
    { id: "prompt-vault", label: "Mac & Mary Prompt Vault", icon: Copy },
  ];

  return (
    <header className="bg-[#0e0704]/90 border-b border-[#f27d26]/20 sticky top-0 z-40 shadow-2xl backdrop-blur-xl">
      {/* Top Banner / Status Strip */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-[#f27d26]/10 text-xs text-[#96897e]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-mono text-[#f27d26] font-semibold uppercase tracking-wider text-[11px]">
            <Sparkles className="w-3.5 h-3.5 text-[#f27d26] animate-pulse" />
            ChiefPilot v3 // Gilded Mirrors OS
          </span>
          <span className="text-[#3d2417]">|</span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
            ● 13/13 Engine Tests Passed
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-medium bg-[#f27d26]/10 text-[#ffaa5e] border border-[#f27d26]/30 shadow-[0_0_10px_rgba(242,125,38,0.15)]">
            {activeSoulCount} Souls Active
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono">
          <div className="flex items-center gap-1 text-[#d5c8be]">
            <Cpu className="w-3.5 h-3.5 text-[#f27d26]" />
            <span>Gemini 3.1 Pro Thinking (HIGH)</span>
          </div>
          <span className="text-[#3d2417]">|</span>
          <span className="text-[#b8aba0] flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f27d26] animate-ping" />
            530-Relay: Online
          </span>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2.5">
        <div className="flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          <nav className="flex items-center gap-1.5 min-w-max">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeWorkstream === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveWorkstream(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-gradient-to-r from-[#f27d26] to-[#e65c00] text-[#0a0502] font-bold shadow-[0_0_20px_rgba(242,125,38,0.35)] border border-[#ffaa5e]"
                      : "text-[#b8aba0] hover:text-white hover:bg-[#1f110a]/80 border border-transparent hover:border-[#f27d26]/30"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#0a0502]" : "text-[#f27d26]"}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
