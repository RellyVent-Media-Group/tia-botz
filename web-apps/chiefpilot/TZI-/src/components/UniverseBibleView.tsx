import React, { useState } from "react";
import { SEVEN_ROOMS, LORE_LEDGER_ENTRIES } from "../data/universeBibleData";
import { 
  Sparkles, 
  Layers, 
  FileText, 
  Send, 
  Loader2, 
  CheckCircle2, 
  ChevronRight,
  Brain
} from "lucide-react";

export const UniverseBibleView: React.FC = () => {
  const [selectedRoomId, setSelectedRoomId] = useState<number>(1);
  const [loreEntries, setLoreEntries] = useState(LORE_LEDGER_ENTRIES);
  const [newTitle, setNewTitle] = useState("");
  const [newSummary, setNewSummary] = useState("");
  const [newCategory, setNewCategory] = useState("Forensic Matrix");

  // Gemini High Thinking State for Lore Inquiry
  const [lorePrompt, setLorePrompt] = useState("");
  const [loreThinkingResult, setLoreThinkingResult] = useState<string | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const selectedRoom = SEVEN_ROOMS.find((r) => r.id === selectedRoomId) || SEVEN_ROOMS[0];

  const handleAddLoreEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim()) return;

    const newEntry = {
      id: `lore_${Date.now()}`,
      entryDate: new Date().toISOString().split("T")[0],
      title: newTitle,
      author: "Master Architect (TaK$HuN)",
      summary: newSummary,
      category: newCategory,
      verified: true,
    };

    setLoreEntries([newEntry, ...loreEntries]);
    setNewTitle("");
    setNewSummary("");
  };

  const handleAskGeminiThinking = async () => {
    if (!lorePrompt.trim()) return;
    setIsThinking(true);
    setLoreThinkingResult(null);

    try {
      const res = await fetch("/api/gemini/think", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: lorePrompt,
          context: `Selected Room: ${selectedRoom.name}. Alchemical Principle: ${selectedRoom.alchemicalPrinciple}. Secrets: ${selectedRoom.loreSecrets.join("; ")}`,
          domain: "Gilded Mirrors Seven Rooms Architecture & Hermetic Law",
        }),
      });

      const data = await res.json();
      if (data.text) {
        setLoreThinkingResult(data.text);
      } else {
        setLoreThinkingResult("No response generated.");
      }
    } catch (err: any) {
      setLoreThinkingResult(`Error connecting to thinking engine: ${err.message}`);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-[#140b07] via-[#1a0f09] to-[#261309]/60 border border-[#f27d26]/30 rounded-2xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(242,125,38,0.1)] relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#f27d26]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#f27d26]/15 text-[#ffaa5e] border border-[#f27d26]/30 shadow-[0_0_12px_rgba(242,125,38,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-[#f27d26]" />
            <span>Master Universe Bible & Seven Rooms Matrix</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#fcf8f5] tracking-tight font-cinzel">
            The Gilded Mirrors Companion Universe Architecture
          </h1>
          <p className="text-[#c8bbb0] text-sm max-w-3xl leading-relaxed">
            The foundational cosmology governing all 30 Souls, stop-motion puppet performance spaces, 
            Hermetic alchemical polarities, and 501(c)(8) Zu Depots across the Northern California corridor.
          </p>
        </div>
      </div>

      {/* Seven Rooms Interactive Chamber Browser */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Room Navigation Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-semibold text-[#b8aba0] uppercase tracking-wider font-mono flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#f27d26]" />
              The Seven Rooms Hierarchy
            </h3>
            <span className="text-[11px] text-[#8a7c72] font-mono">7 Sacred Planes</span>
          </div>

          <div className="space-y-2">
            {SEVEN_ROOMS.map((room) => {
              const isSelected = room.id === selectedRoomId;
              return (
                <button
                  key={room.id}
                  onClick={() => setSelectedRoomId(room.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-[#24130b] border-[#f27d26] text-white shadow-[0_0_20px_rgba(242,125,38,0.25)]"
                      : "bg-[#140b07]/80 border-[#f27d26]/15 text-[#b8aba0] hover:text-[#f4ece4] hover:bg-[#1c100a] hover:border-[#f27d26]/35"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{room.symbol}</span>
                    <div>
                      <div className="text-xs font-mono text-[#ffaa5e]">Room {room.id}</div>
                      <div className="text-sm font-medium text-[#ebe2db] line-clamp-1">{room.name}</div>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 ${isSelected ? "text-[#f27d26]" : "text-[#695c52]"}`} />
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Room Deep Dive */}
        <div className="lg:col-span-8 bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f27d26]/15 pb-4">
            <div>
              <span className="text-xs font-mono text-[#ffaa5e] font-semibold uppercase">
                Chamber {selectedRoom.id} // {selectedRoom.rulingDepot}
              </span>
              <h2 className="text-xl font-bold text-[#fcf8f5] mt-1 flex items-center gap-2 font-cinzel">
                <span className="text-2xl">{selectedRoom.symbol}</span>
                {selectedRoom.name}
              </h2>
            </div>
            <div className="px-3 py-1 rounded-lg bg-[#24130b] border border-[#f27d26]/40 text-[#ffaa5e] text-xs font-mono shadow-[0_0_10px_rgba(242,125,38,0.15)]">
              Principle: {selectedRoom.alchemicalPrinciple}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-mono text-[#9c8e83] uppercase tracking-wider mb-1">Atmosphere & Visual Identity</h4>
              <p className="text-sm text-[#d5c8be] bg-[#0c0603]/80 border border-[#f27d26]/15 p-3.5 rounded-xl leading-relaxed">
                {selectedRoom.visualAtmosphere}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-mono text-[#9c8e83] uppercase tracking-wider mb-1">Cosmological Narrative Role</h4>
              <p className="text-sm text-[#d5c8be] leading-relaxed">
                {selectedRoom.description}
              </p>
            </div>

            <div>
              <h4 className="text-xs font-mono text-[#9c8e83] uppercase tracking-wider mb-2">Canonical Lore Secrets</h4>
              <ul className="space-y-2">
                {selectedRoom.loreSecrets.map((secret, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs text-[#d5c8be] bg-[#0c0603]/60 p-2.5 rounded-lg border border-[#f27d26]/15">
                    <CheckCircle2 className="w-4 h-4 text-[#f27d26] shrink-0 mt-0.5" />
                    <span>{secret}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Gemini High-Thinking Deep Lore Query */}
          <div className="mt-6 pt-6 border-t border-[#f27d26]/15 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono text-[#ffaa5e] font-semibold uppercase flex items-center gap-2">
                <Brain className="w-4 h-4 text-[#f27d26]" />
                Gemini 3.1 Pro High-Thinking Lore Synthesizer
              </h4>
              <span className="text-[11px] text-[#8a7c72] font-mono">ThinkingLevel: HIGH</span>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={lorePrompt}
                onChange={(e) => setLorePrompt(e.target.value)}
                placeholder={`Ask an alchemical or narrative inquiry regarding ${selectedRoom.name}...`}
                className="flex-1 bg-[#0c0603] border border-[#f27d26]/20 rounded-xl px-4 py-2.5 text-xs text-[#fcf8f5] placeholder-[#7d7065] focus:outline-none focus:border-[#f27d26] focus:shadow-[0_0_15px_rgba(242,125,38,0.2)]"
                onKeyDown={(e) => e.key === "Enter" && handleAskGeminiThinking()}
              />
              <button
                onClick={handleAskGeminiThinking}
                disabled={isThinking || !lorePrompt.trim()}
                className="px-4 py-2.5 rounded-xl glow-btn-primary text-xs font-bold disabled:opacity-50 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                {isThinking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Synthesize</span>
              </button>
            </div>

            {loreThinkingResult && (
              <div className="bg-[#0c0603] border border-[#f27d26]/40 rounded-xl p-4 text-xs text-[#e5dcd4] leading-relaxed font-mono whitespace-pre-wrap shadow-[0_0_20px_rgba(242,125,38,0.15)]">
                {loreThinkingResult}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lore Ledger Starter Entries & Registry */}
      <div className="bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#f27d26]/15 pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#fcf8f5] flex items-center gap-2 font-cinzel">
              <FileText className="w-5 h-5 text-[#f27d26]" />
              Canonical Lore Ledger & Forensic Records
            </h3>
            <p className="text-xs text-[#96897e] mt-1">
              Verified historical chronicle connecting real forensic timeline artifacts with self-originating mythology.
            </p>
          </div>
        </div>

        {/* Existing Ledger Entries */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loreEntries.map((entry) => (
            <div
              key={entry.id}
              className="bg-[#0e0704]/90 border border-[#f27d26]/15 rounded-xl p-4 space-y-2 hover:border-[#f27d26]/40 hover:shadow-[0_0_20px_rgba(242,125,38,0.12)] transition-all"
            >
              <div className="flex items-center justify-between text-xs font-mono text-[#8a7c72]">
                <span className="text-[#ffaa5e] font-semibold">{entry.category}</span>
                <span>{entry.entryDate}</span>
              </div>
              <h4 className="text-sm font-bold text-[#fcf8f5]">{entry.title}</h4>
              <p className="text-xs text-[#c8bbb0] leading-relaxed">{entry.summary}</p>
              <div className="text-[11px] font-mono text-[#7d7065] pt-2 border-t border-[#24140b]">
                Certified By: {entry.author}
              </div>
            </div>
          ))}
        </div>

        {/* Add New Lore Entry Form */}
        <form onSubmit={handleAddLoreEntry} className="bg-[#0c0603] border border-[#f27d26]/25 rounded-xl p-4 space-y-4 shadow-inner">
          <h4 className="text-xs font-mono text-[#ffaa5e] uppercase font-semibold">Log New Canonical Lore Entry</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Entry Title..."
              className="sm:col-span-2 bg-[#140b07] border border-[#f27d26]/20 rounded-lg px-3 py-2 text-xs text-[#fcf8f5] placeholder-[#7d7065] focus:outline-none focus:border-[#f27d26]"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="bg-[#140b07] border border-[#f27d26]/20 rounded-lg px-3 py-2 text-xs text-[#d5c8be] focus:outline-none focus:border-[#f27d26]"
            >
              <option value="Forensic Matrix">Forensic Matrix</option>
              <option value="Fabrication Specs">Fabrication Specs</option>
              <option value="Zu Self-Origination">Zu Self-Origination</option>
              <option value="Soul Entities">Soul Entities</option>
              <option value="Hermetic Law">Hermetic Law</option>
            </select>
          </div>
          <textarea
            value={newSummary}
            onChange={(e) => setNewSummary(e.target.value)}
            placeholder="Document the canon facts, message frequency knot, or alchemical event..."
            rows={2}
            className="w-full bg-[#140b07] border border-[#f27d26]/20 rounded-lg p-3 text-xs text-[#fcf8f5] placeholder-[#7d7065] focus:outline-none focus:border-[#f27d26]"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg glow-btn-primary text-xs font-bold transition-all cursor-pointer"
            >
              Append to Lore Ledger
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
