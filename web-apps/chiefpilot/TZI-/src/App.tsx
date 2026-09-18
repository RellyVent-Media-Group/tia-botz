import React, { useState } from "react";
import { WorkstreamType } from "./types";
import { Header } from "./components/Header";
import { UniverseBibleView } from "./components/UniverseBibleView";
import { CharacterBibleView } from "./components/CharacterBibleView";
import { PilotProductionView } from "./components/PilotProductionView";
import { PuppetFabricationView } from "./components/PuppetFabricationView";
import { FakeNewsDeskView } from "./components/FakeNewsDeskView";
import { ShadowEngineView } from "./components/ShadowEngineView";
import { AIStudioWorkspaceView } from "./components/AIStudioWorkspaceView";
import { ZuDepotsView } from "./components/ZuDepotsView";
import { ProjectBacklogView } from "./components/ProjectBacklogView";
import { ScreeningRoomView } from "./components/ScreeningRoomView";
import { PromptVaultView } from "./components/PromptVaultView";
import { SOULS_DATABASE } from "./data/soulsData";

export default function App() {
  const [activeWorkstream, setActiveWorkstream] = useState<WorkstreamType>("universe-bible");

  return (
    <div className="min-h-screen bg-[#0a0502] text-[#e0d8d0] selection:bg-[#f27d26] selection:text-black font-sans antialiased relative overflow-x-hidden">
      {/* Universal Studio Header */}
      <Header
        activeWorkstream={activeWorkstream}
        setActiveWorkstream={setActiveWorkstream}
        activeSoulCount={SOULS_DATABASE.length}
      />

      {/* Main Workspace Frame */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 relative z-10">
        {activeWorkstream === "universe-bible" && <UniverseBibleView />}
        {activeWorkstream === "character-bible" && <CharacterBibleView />}
        {activeWorkstream === "pilot-production" && <PilotProductionView />}
        {activeWorkstream === "puppet-fabrication" && <PuppetFabricationView />}
        {activeWorkstream === "fake-news-desk" && <FakeNewsDeskView />}
        {activeWorkstream === "shadow-engine" && <ShadowEngineView />}
        {activeWorkstream === "ai-content-pipeline" && <AIStudioWorkspaceView />}
        {activeWorkstream === "zu-depots" && <ZuDepotsView />}
        {activeWorkstream === "project-backlog" && <ProjectBacklogView />}
        {activeWorkstream === "screening-room" && <ScreeningRoomView />}
        {activeWorkstream === "prompt-vault" && <PromptVaultView />}
      </main>

      {/* Persistent Studio Footer */}
      <footer className="border-t border-[#f27d26]/15 bg-[#0d0704]/90 backdrop-blur-md py-8 px-4 text-center text-xs font-mono text-[#8a7c72] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-[#b8aba0]">
            <span className="text-[#f27d26] font-bold tracking-wide">ChiefPilot v3 // Gilded Mirrors OS</span>
            <span className="text-[#f27d26]/40">—</span>
            <span>Autonomous AI Studio & Stop-Motion Workshop</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#96897e]">
            <span className="hover:text-[#f27d26] transition-colors">501(c)(8) Zu Fraternal System</span>
            <span className="text-[#f27d26]/30">•</span>
            <span className="text-[#ffaa5e]">30 Souls Operational</span>
            <span className="text-[#f27d26]/30">•</span>
            <span className="text-emerald-400">Gemini 3.1 Multimodal Suite</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
