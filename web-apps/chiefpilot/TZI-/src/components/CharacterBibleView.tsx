import React, { useState } from "react";
import { SoulEntity } from "../types";
import { SOULS_DATABASE } from "../data/soulsData";
import { 
  Users, 
  Search, 
  Sparkles, 
  Volume2, 
  Loader2, 
  Flame, 
  Compass, 
  Radio
} from "lucide-react";

export const CharacterBibleView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSoul, setSelectedSoul] = useState<SoulEntity>(SOULS_DATABASE[0]);
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>("All");

  // Audio Playback state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);

  const filteredSouls = SOULS_DATABASE.filter((soul) => {
    const matchesSearch =
      soul.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      soul.archetype.toLowerCase().includes(searchTerm.toLowerCase()) ||
      soul.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStage =
      selectedStageFilter === "All" || soul.consciousDialogueStage === selectedStageFilter;
    return matchesSearch && matchesStage;
  });

  const handlePlayVoice = async (soul: SoulEntity) => {
    try {
      setIsPlayingAudio(true);
      setAudioError(null);

      const sampleText = `${soul.name}, ${soul.title}. ${soul.bio}`;

      const res = await fetch("/api/gemini/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sampleText,
          voice: soul.voiceProfile.voiceName || "Kore",
        }),
      });

      const data = await res.json();
      if (data.audioBase64) {
        // Decode base64 PCM 24kHz audio
        const binaryString = atob(data.audioBase64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        // Convert 16-bit PCM to AudioBuffer
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
        const numSamples = bytes.length / 2;
        const audioBuffer = audioCtx.createBuffer(1, numSamples, 24000);
        const channelData = audioBuffer.getChannelData(0);
        const dataView = new DataView(bytes.buffer);

        for (let i = 0; i < numSamples; i++) {
          channelData[i] = dataView.getInt16(i * 2, true) / 32768.0;
        }

        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.onended = () => {
          setIsPlayingAudio(false);
        };
        source.start(0);
      } else {
        throw new Error(data.error || "Failed to receive audio stream");
      }
    } catch (err: any) {
      console.error("Audio playback error:", err);
      setAudioError(`Audio error: ${err.message}`);
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#140b07] via-[#1a0f09] to-[#261309]/60 border border-[#f27d26]/30 rounded-2xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(242,125,38,0.1)] relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#f27d26]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#f27d26]/15 text-[#ffaa5e] border border-[#f27d26]/30 shadow-[0_0_12px_rgba(242,125,38,0.2)]">
              <Users className="w-3.5 h-3.5 text-[#f27d26]" />
              <span>30 Souls & 28 Archetypes Directory</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#fcf8f5] tracking-tight font-cinzel">
              Character Production Sheets & Voice Profiles
            </h1>
            <p className="text-[#c8bbb0] text-sm max-w-2xl leading-relaxed">
              Complete production specifications for all primary puppets, anchors, and archetypal soul entities with live Gemini Flash TTS voice synthesis.
            </p>
          </div>
          <div className="text-right font-mono text-xs text-[#96897e] bg-[#0c0603]/80 p-3.5 rounded-xl border border-[#f27d26]/20 shadow-[0_0_15px_rgba(242,125,38,0.08)]">
            <div className="text-[#ffaa5e] font-bold text-lg">{SOULS_DATABASE.length} Profiled Entities</div>
            <div className="text-[#8a7c72]">28 Archetypal Masks</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#140b07]/90 p-4 rounded-xl border border-[#f27d26]/20 shadow-xl backdrop-blur-xl">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-[#8a7c72] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Soul name, title, or archetype..."
            className="w-full bg-[#0c0603] border border-[#f27d26]/20 rounded-lg pl-10 pr-4 py-2 text-xs text-[#fcf8f5] placeholder-[#7d7065] focus:outline-none focus:border-[#f27d26] focus:shadow-[0_0_15px_rgba(242,125,38,0.2)]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          <span className="text-xs font-mono text-[#8a7c72]">Stage:</span>
          {["All", "Unconscious", "Nigredo", "Albedo", "Citrinitas", "Rubedo"].map((stage) => (
            <button
              key={stage}
              onClick={() => setSelectedStageFilter(stage)}
              className={`px-3 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                selectedStageFilter === stage
                  ? "bg-gradient-to-r from-[#f27d26] to-[#e65c00] text-[#0a0502] font-bold shadow-[0_0_15px_rgba(242,125,38,0.3)]"
                  : "bg-[#0c0603] text-[#b8aba0] border border-[#f27d26]/20 hover:text-white hover:border-[#f27d26]/40"
              }`}
            >
              {stage}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Souls List + Detail Production Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Souls */}
        <div className="lg:col-span-4 space-y-2 max-h-[750px] overflow-y-auto pr-1">
          {filteredSouls.map((soul) => {
            const isSelected = soul.id === selectedSoul.id;
            return (
              <button
                key={soul.id}
                onClick={() => setSelectedSoul(soul)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                  isSelected
                    ? "bg-[#24130b] border-[#f27d26] text-white shadow-[0_0_20px_rgba(242,125,38,0.25)]"
                    : "bg-[#140b07]/80 border-[#f27d26]/15 text-[#b8aba0] hover:text-[#f4ece4] hover:bg-[#1c100a] hover:border-[#f27d26]/35"
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-[#ffaa5e] font-bold">{soul.id}</span>
                    <span className="text-sm font-bold text-[#fcf8f5]">{soul.name}</span>
                  </div>
                  <div className="text-xs text-[#96897e] line-clamp-1">{soul.archetype}</div>
                </div>

                <div className="text-right space-y-1">
                  <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-[#0c0603] text-[#ffaa5e] border border-[#f27d26]/25">
                    {soul.consciousDialogueStage}
                  </span>
                  <div className="text-[10px] font-mono text-[#8a7c72]">
                    Polarity: {soul.shadowPolarityScore}%
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Production Sheet */}
        <div className="lg:col-span-8 bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-xl">
          {/* Header Card */}
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#f27d26]/15 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[#ffaa5e] font-bold">{selectedSoul.id}</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#f27d26]/20 text-[#ffaa5e] border border-[#f27d26]/30">
                  {selectedSoul.rarity}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#24130b] text-[#d5c8be] border border-[#f27d26]/20">
                  Element: {selectedSoul.element}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-[#fcf8f5] font-cinzel">{selectedSoul.name}</h2>
              <div className="text-xs font-mono text-[#ffaa5e]/90 font-medium">{selectedSoul.title}</div>
            </div>

            {/* Voice Synthesis Button */}
            <div className="space-y-1 text-right">
              <button
                onClick={() => handlePlayVoice(selectedSoul)}
                disabled={isPlayingAudio}
                className="px-4 py-2 rounded-xl glow-btn-primary text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isPlayingAudio ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing Voice...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Audition Voice ({selectedSoul.voiceProfile.voiceName})</span>
                  </>
                )}
              </button>
              {audioError && <div className="text-[11px] text-rose-400">{audioError}</div>}
            </div>
          </div>

          {/* Bio & Voice Guide */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="text-xs font-mono text-[#96897e] uppercase tracking-wider">Soul Lore & Persona</h4>
              <p className="text-xs text-[#d5c8be] bg-[#0c0603]/80 p-3.5 rounded-xl border border-[#f27d26]/15 leading-relaxed">
                {selectedSoul.bio}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-mono text-[#96897e] uppercase tracking-wider">Vocal Direction & Speaking Style</h4>
              <div className="text-xs text-[#d5c8be] bg-[#0c0603]/80 p-3.5 rounded-xl border border-[#f27d26]/15 space-y-2">
                <div>
                  <span className="text-[#ffaa5e] font-mono font-semibold">Base Voice: </span>
                  {selectedSoul.voiceProfile.voiceName} (TTS Gemini 3.1)
                </div>
                <div>
                  <span className="text-[#96897e] font-mono">Performance Style: </span>
                  {selectedSoul.voiceProfile.speakingStyle}
                </div>
              </div>
            </div>
          </div>

          {/* Persona vs Shadow Traits & Polarity Gauge */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-mono text-[#ffaa5e] uppercase tracking-wider font-semibold flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[#f27d26]" />
                Conscious Persona vs Unconscious Shadow Split
              </h4>
              <span className="text-xs font-mono text-[#96897e]">
                Polarity Gauge: <strong className="text-[#ffaa5e]">{selectedSoul.shadowPolarityScore}%</strong>
              </span>
            </div>

            {/* Polarity Bar */}
            <div className="w-full bg-[#0c0603] h-2 rounded-full overflow-hidden border border-[#f27d26]/20">
              <div
                className="h-full bg-gradient-to-r from-blue-500 via-[#f27d26] to-rose-600 transition-all duration-500 shadow-[0_0_10px_rgba(242,125,38,0.4)]"
                style={{ width: `${selectedSoul.shadowPolarityScore}%` }}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
              {/* Persona Traits */}
              <div className="bg-[#0c0603]/90 border border-blue-500/25 rounded-xl p-3.5 space-y-2 shadow-inner">
                <div className="text-xs font-mono text-blue-400 font-bold uppercase flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  Public Persona Traits
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSoul.personaTraits.map((trait, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-blue-950/50 border border-blue-800/40 text-blue-200"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>

              {/* Shadow Traits */}
              <div className="bg-[#0c0603]/90 border border-rose-500/25 rounded-xl p-3.5 space-y-2 shadow-inner">
                <div className="text-xs font-mono text-rose-400 font-bold uppercase flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  Unconscious Shadow Traits
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedSoul.shadowTraits.map((trait, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md text-[11px] font-mono bg-rose-950/50 border border-rose-800/40 text-rose-200"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Temenos Practice & Economic Platforms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-[#f27d26]/15">
            <div className="space-y-2">
              <h4 className="text-xs font-mono text-[#96897e] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#f27d26]" />
                Prescribed Temenos Integration Ritual
              </h4>
              <p className="text-xs text-[#ffc58a] bg-[#24130b]/60 border border-[#f27d26]/30 p-3 rounded-xl leading-relaxed font-mono shadow-inner">
                {selectedSoul.temenosPractice}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-mono text-[#96897e] uppercase tracking-wider flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-[#f27d26]" />
                Active Broadcasting Relays & Tribute
              </h4>
              <div className="bg-[#0c0603]/80 p-3 rounded-xl border border-[#f27d26]/15 space-y-2">
                <div className="flex flex-wrap gap-1.5">
                  {selectedSoul.preferredPlatforms.map((p, i) => (
                    <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#140b07] text-[#d5c8be] border border-[#f27d26]/20">
                      {p}
                    </span>
                  ))}
                </div>
                <div className="text-xs font-mono text-emerald-400">
                  Annual Tribute Yield: ${selectedSoul.tributeRevenue.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
