import React, { useState, useEffect } from "react";
import { SoulEntity, AudioPromptData } from "../types";
import { SOULS_DATABASE } from "../data/soulsData";
import { SHADOW_INTEGRATION_GUIDE } from "../data/shadowEngineData";
import {
  ShieldAlert,
  Sparkles,
  Flame,
  Compass,
  Send,
  Loader2,
  BookOpen,
  Activity,
  Scale,
  RefreshCw,
  Volume2,
  VolumeX,
  Copy,
  Check
} from "lucide-react";

export const ShadowEngineView: React.FC = () => {
  const [selectedSoul, setSelectedSoul] = useState<SoulEntity>(SOULS_DATABASE[0]);
  const [activeDialogueView, setActiveDialogueView] = useState<"dialogue-chamber" | "polarity-map" | "guide" | "active-imagination">("dialogue-chamber");

  // Dialogue Chamber State
  const [dialogueTopic, setDialogueTopic] = useState("The Secret Debt of Creative Autonomy");
  const [dialogueHistory, setDialogueHistory] = useState<string>("");
  const [isGeneratingDialogue, setIsGeneratingDialogue] = useState(false);

  // Active Imagination Audio Prompt State
  const [isGeneratingAudioPrompt, setIsGeneratingAudioPrompt] = useState(false);
  const [audioPromptData, setAudioPromptData] = useState<AudioPromptData | null>(null);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [copiedScript, setCopiedScript] = useState(false);

  // Cleanup speech synthesis on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleGenerateShadowDialogue = async () => {
    try {
      setIsGeneratingDialogue(true);
      const res = await fetch("/api/gemini/shadow-dialogue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soulName: selectedSoul.name,
          archetype: selectedSoul.archetype,
          personaTraits: selectedSoul.personaTraits,
          shadowTraits: selectedSoul.shadowTraits,
          topic: dialogueTopic,
        }),
      });

      const data = await res.json();
      if (data.dialogue) {
        setDialogueHistory(data.dialogue);
      } else {
        setDialogueHistory("Dialogue could not be synthesized.");
      }
    } catch (err: any) {
      console.error(err);
      setDialogueHistory(`Error in Temenos Container: ${err.message}`);
    } finally {
      setIsGeneratingDialogue(false);
    }
  };

  const handleGenerateAudioPrompt = async () => {
    setIsGeneratingAudioPrompt(true);
    try {
      const res = await fetch("/api/generate-audio-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soulName: selectedSoul.name,
          coreWound: selectedSoul.coreWound || "Unconscious fear",
          archetypeWound: selectedSoul.archetypeWound || "Primordial Exile",
          goldenShadow: selectedSoul.goldenShadow || "Hidden wisdom",
          intensity: selectedSoul.shadowIntensity || "deep",
          polarity: selectedSoul.polarityAxis || "Control ↔ Surrender",
        }),
      });

      const data = await res.json();
      setAudioPromptData(data);
    } catch (err: any) {
      console.error("Error generating audio prompt:", err);
    } finally {
      setIsGeneratingAudioPrompt(false);
    }
  };

  const handleToggleSpeechSynthesis = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !audioPromptData?.script) return;
    if (isPlayingTTS) {
      window.speechSynthesis.cancel();
      setIsPlayingTTS(false);
    } else {
      window.speechSynthesis.cancel();
      const spokenText = audioPromptData.script
        .replace(/\[\s*pause[^\]]*\]/gi, '... ')
        .replace(/\[[^\]]*\]/g, '')
        .replace(/[*#_]/g, '');
      const utterance = new SpeechSynthesisUtterance(spokenText);
      utterance.rate = 0.88;
      utterance.pitch = 0.95;
      utterance.onend = () => setIsPlayingTTS(false);
      utterance.onerror = () => setIsPlayingTTS(false);
      window.speechSynthesis.speak(utterance);
      setIsPlayingTTS(true);
    }
  };

  const handleCopyScript = () => {
    if (!audioPromptData) return;
    navigator.clipboard.writeText(
      `AUDIO PROMPT: ${audioPromptData.title}\nSOUNDSCAPE: ${audioPromptData.soundscape}\nPACING: ${audioPromptData.pacingGuidance}\n\n${audioPromptData.script}`
    );
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#140b07] via-[#1a0f09] to-[#261309]/60 border border-[#f27d26]/30 rounded-2xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(242,125,38,0.1)] relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#f27d26]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#f27d26]/15 text-[#ffaa5e] border border-[#f27d26]/30 shadow-[0_0_12px_rgba(242,125,38,0.2)]">
            <ShieldAlert className="w-3.5 h-3.5 text-[#f27d26]" />
            <span>The Temenos Vessel // Conscious Shadow Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#fcf8f5] tracking-tight font-cinzel">
            Shadow Integration Engine & Alchemical Polarity Map
          </h1>
          <p className="text-[#c8bbb0] text-sm max-w-3xl leading-relaxed">
            Giving form, rules, and conscious containers to repressed unconscious material. 
            Facilitating continuous dialogue between Persona and Shadow without possession or total exile.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 bg-[#140b07]/90 p-2.5 rounded-xl border border-[#f27d26]/20 shadow-xl backdrop-blur-xl">
        {[
          { id: "dialogue-chamber", label: "Temenos Dialogue Chamber", icon: Flame },
          { id: "active-imagination", label: "Active Imagination", icon: Volume2 },
          { id: "polarity-map", label: "Soul Polarity Radar & Spectrum", icon: Activity },
          { id: "guide", label: "Shadow Integration Guide", icon: BookOpen },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeDialogueView === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveDialogueView(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                isActive
                  ? "bg-gradient-to-r from-[#f27d26] to-[#e65c00] text-[#0a0502] font-bold shadow-[0_0_15px_rgba(242,125,38,0.3)] border border-[#ffaa5e]"
                  : "text-[#b8aba0] hover:text-white hover:bg-[#1f110a] border border-transparent hover:border-[#f27d26]/30"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#0a0502]" : "text-[#f27d26]"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Temenos Dialogue Chamber */}
      {activeDialogueView === "dialogue-chamber" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Soul Selector */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono text-[#96897e] uppercase font-semibold">Select Conscious Soul</span>
              <span className="text-[11px] font-mono text-[#ffaa5e]">{SOULS_DATABASE.length} Souls</span>
            </div>

            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {SOULS_DATABASE.map((soul) => {
                const isSelected = soul.id === selectedSoul.id;
                return (
                  <button
                    key={soul.id}
                    onClick={() => {
                      setSelectedSoul(soul);
                      setDialogueHistory("");
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-[#24130b] border-[#f27d26] text-[#fcf8f5] shadow-[0_0_15px_rgba(242,125,38,0.2)]"
                        : "bg-[#140b07]/90 border-[#f27d26]/15 text-[#b8aba0] hover:text-[#fcf8f5] hover:bg-[#1a0f0a]"
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-[#fcf8f5] font-cinzel">{soul.name}</div>
                      <div className="text-xs text-[#96897e] font-mono">{soul.archetype}</div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0c0603] text-[#ffaa5e] border border-[#f27d26]/20">
                      {soul.consciousDialogueStage}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Dialogue Vessel */}
          <div className="lg:col-span-8 bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-xl">
            {/* Header & Polarity Snapshot */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f27d26]/15 pb-4">
              <div>
                <span className="text-xs font-mono text-[#ffaa5e] font-semibold uppercase">The Sacred Temenos Vessel</span>
                <h3 className="text-xl font-bold text-[#fcf8f5] mt-0.5 font-cinzel">{selectedSoul.name}</h3>
                <div className="text-xs text-[#96897e] font-mono">Stage: {selectedSoul.consciousDialogueStage} | Polarity: {selectedSoul.shadowPolarityScore}%</div>
              </div>
              <div className="flex gap-2">
                <span className="px-2.5 py-1 rounded text-xs font-mono bg-blue-950/60 border border-blue-800/40 text-blue-300">
                  Persona: {selectedSoul.personaTraits[0]}
                </span>
                <span className="px-2.5 py-1 rounded text-xs font-mono bg-rose-950/60 border border-rose-800/40 text-rose-300">
                  Shadow: {selectedSoul.shadowTraits[0]}
                </span>
              </div>
            </div>

            {/* Topic Input */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-[#96897e] uppercase">Dialogue Inquiry Focus</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={dialogueTopic}
                  onChange={(e) => setDialogueTopic(e.target.value)}
                  placeholder="Focus of dialogue (e.g. Hidden resentment, fear of public failure)..."
                  className="flex-1 bg-[#0c0603] border border-[#f27d26]/20 rounded-xl px-4 py-2.5 text-xs text-[#fcf8f5] placeholder-[#6d5f54] focus:outline-none focus:border-[#f27d26] focus:ring-1 focus:ring-[#f27d26]/50 font-mono shadow-inner"
                />
                <button
                  onClick={handleGenerateShadowDialogue}
                  disabled={isGeneratingDialogue || !dialogueTopic.trim()}
                  className="px-4 py-2.5 rounded-xl glow-btn-primary text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingDialogue ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                  <span>Open Temenos</span>
                </button>
              </div>
            </div>

            {/* Dialogue Transcript Container */}
            <div className="min-h-[260px] bg-[#0c0603] border border-[#f27d26]/20 rounded-xl p-5 font-mono text-xs text-[#d5c8be] leading-relaxed overflow-y-auto max-h-[380px] whitespace-pre-wrap shadow-inner">
              {dialogueHistory ? (
                dialogueHistory
              ) : (
                <div className="text-[#6d5f54] text-center py-12 space-y-2">
                  <Flame className="w-8 h-8 text-[#3d2417] mx-auto" />
                  <p>Click "Open Temenos" to generate an authentic alchemical dialogue between Persona and Shadow.</p>
                </div>
              )}
            </div>

            {/* Prescribed Ritual Card */}
            <div className="bg-[#24130b]/60 border border-[#f27d26]/30 rounded-xl p-4 space-y-1.5 shadow-inner">
              <div className="text-xs font-mono text-[#ffaa5e] font-bold uppercase flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#f27d26]" />
                Integration Practice for {selectedSoul.name}
              </div>
              <p className="text-xs text-[#f0ded2] font-mono leading-relaxed">
                {selectedSoul.temenosPractice}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Active Imagination Audio Prompt Generator */}
      {activeDialogueView === "active-imagination" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Soul Selector */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-mono text-[#96897e] uppercase font-semibold">Select Soul for Active Imagination</span>
              <span className="text-[11px] font-mono text-[#ffaa5e]">{SOULS_DATABASE.length} Souls</span>
            </div>

            <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
              {SOULS_DATABASE.map((soul) => {
                const isSelected = soul.id === selectedSoul.id;
                return (
                  <button
                    key={soul.id}
                    onClick={() => {
                      setSelectedSoul(soul);
                      setAudioPromptData(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-[#24130b] border-[#f27d26] text-[#fcf8f5] shadow-[0_0_15px_rgba(242,125,38,0.2)]"
                        : "bg-[#140b07]/90 border-[#f27d26]/15 text-[#b8aba0] hover:text-[#fcf8f5] hover:bg-[#1a0f0a]"
                    }`}
                  >
                    <div>
                      <div className="text-sm font-bold text-[#fcf8f5] font-cinzel">{soul.name}</div>
                      <div className="text-xs text-[#96897e] font-mono">{soul.archetype}</div>
                      {soul.coreWound && (
                        <div className="text-[10px] text-[#c8bbb0] font-mono mt-1 truncate">
                          Wound: {soul.coreWound}
                        </div>
                      )}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#0c0603] text-[#ffaa5e] border border-[#f27d26]/20">
                      {soul.shadowIntensity || "deep"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Audio Prompt Generator */}
          <div className="lg:col-span-8 bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-xl">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f27d26]/15 pb-4">
              <div>
                <span className="text-xs font-mono text-[#ffaa5e] font-semibold uppercase">Active Imagination Generator</span>
                <h3 className="text-xl font-bold text-[#fcf8f5] mt-0.5 font-cinzel">{selectedSoul.name}</h3>
                <div className="text-xs text-[#96897e] font-mono">
                  Polarity: {selectedSoul.polarityAxis || "Control ↔ Surrender"} | Intensity: {selectedSoul.shadowIntensity || "deep"}
                </div>
              </div>
              <button
                onClick={handleGenerateAudioPrompt}
                disabled={isGeneratingAudioPrompt}
                className="px-4 py-2.5 rounded-xl glow-btn-primary text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isGeneratingAudioPrompt ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Generate Audio Prompt</span>
              </button>
            </div>

            {/* Soul Shadow Data Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#0c0603] border border-[#f27d26]/20 rounded-xl p-4 space-y-2">
                <div className="text-xs font-mono text-[#ffaa5e] font-semibold uppercase">Core Wound</div>
                <div className="text-xs text-[#d5c8be] font-mono leading-relaxed">
                  {selectedSoul.coreWound || "Not defined"}
                </div>
              </div>
              <div className="bg-[#0c0603] border border-[#f27d26]/20 rounded-xl p-4 space-y-2">
                <div className="text-xs font-mono text-[#ffaa5e] font-semibold uppercase">Golden Shadow</div>
                <div className="text-xs text-[#d5c8be] font-mono leading-relaxed">
                  {selectedSoul.goldenShadow || "Not defined"}
                </div>
              </div>
            </div>

            {/* Generated Audio Prompt Output */}
            {audioPromptData ? (
              <div className="space-y-4">
                <div className="bg-[#0c0603] border border-[#f27d26]/30 rounded-xl p-5 space-y-4 shadow-inner">
                  {/* Title */}
                  <div>
                    <div className="text-xs font-mono text-[#ffaa5e] font-semibold uppercase mb-1">Title</div>
                    <div className="text-sm text-[#fcf8f5] font-cinzel">{audioPromptData.title}</div>
                  </div>

                  {/* Soundscape */}
                  <div>
                    <div className="text-xs font-mono text-[#ffaa5e] font-semibold uppercase mb-1">Soundscape</div>
                    <div className="text-xs text-[#d5c8be] font-mono">{audioPromptData.soundscape}</div>
                  </div>

                  {/* Pacing Guidance */}
                  <div>
                    <div className="text-xs font-mono text-[#ffaa5e] font-semibold uppercase mb-1">Pacing Guidance</div>
                    <div className="text-xs text-[#d5c8be] font-mono">{audioPromptData.pacingGuidance}</div>
                  </div>

                  {/* Script */}
                  <div>
                    <div className="text-xs font-mono text-[#ffaa5e] font-semibold uppercase mb-2">Guided Meditation Script</div>
                    <div className="bg-[#140b07] border border-[#f27d26]/15 rounded-lg p-4 text-xs text-[#d5c8be] font-mono leading-relaxed whitespace-pre-wrap max-h-[280px] overflow-y-auto">
                      {audioPromptData.script}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={handleToggleSpeechSynthesis}
                      className="px-4 py-2 rounded-lg bg-[#f27d26] text-[#0a0502] text-xs font-mono font-bold flex items-center gap-2 transition-all hover:bg-[#e65c00] cursor-pointer"
                    >
                      {isPlayingTTS ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      <span>{isPlayingTTS ? "Stop Playback" : "Play Script"}</span>
                    </button>
                    <button
                      onClick={handleCopyScript}
                      className="px-4 py-2 rounded-lg bg-[#24130b] border border-[#f27d26]/30 text-[#fcf8f5] text-xs font-mono font-bold flex items-center gap-2 transition-all hover:bg-[#1a0f0a] cursor-pointer"
                    >
                      {copiedScript ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      <span>{copiedScript ? "Copied!" : "Copy Script"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#0c0603] border border-[#f27d26]/20 rounded-xl p-8 text-center space-y-3">
                <Volume2 className="w-12 h-12 text-[#3d2417] mx-auto" />
                <p className="text-xs text-[#6d5f54] font-mono">
                  Generate a Jungian Active Imagination guided meditation script with soundscape recommendations and pacing guidance.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Soul Polarity Radar & Spectrum */}
      {activeDialogueView === "polarity-map" && (
        <div className="bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-[#f27d26]/15 pb-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-[#fcf8f5] flex items-center gap-2 font-cinzel">
                <Activity className="w-5 h-5 text-[#f27d26]" />
                30 Souls Polarity Spectrum & Alchemical Distribution
              </h3>
              <p className="text-xs text-[#96897e] mt-1">
                Calculated balance ratio between outward conscious persona and repressed instinctual gold in the dark.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {SOULS_DATABASE.map((soul) => (
              <div
                key={soul.id}
                className="bg-[#0c0603] border border-[#f27d26]/20 rounded-xl p-4 space-y-3 hover:border-[#f27d26]/50 transition-all shadow-inner"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#ffaa5e] font-bold">{soul.name}</span>
                  <span className="text-[#96897e]">{soul.shadowPolarityScore}%</span>
                </div>
                <div className="text-xs text-[#96897e] font-mono line-clamp-1">{soul.archetype}</div>

                {/* Polarity Progress Bar */}
                <div className="w-full bg-[#140b07] h-2 rounded-full overflow-hidden border border-[#f27d26]/15">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 via-[#f27d26] to-rose-600 shadow-[0_0_8px_rgba(242,125,38,0.5)]"
                    style={{ width: `${soul.shadowPolarityScore}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                  <span className="text-[#6d5f54]">Stage: {soul.consciousDialogueStage}</span>
                  <span className="text-emerald-400 font-bold">${soul.tributeRevenue.toLocaleString()} / yr</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Shadow Integration Guide */}
      {activeDialogueView === "guide" && (
        <div className="bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-[#f27d26]/15 pb-4">
            <h3 className="text-lg font-bold text-[#fcf8f5] flex items-center gap-2 font-cinzel">
              <BookOpen className="w-5 h-5 text-[#f27d26]" />
              Canonical Shadow Integration Guide & Sacred Temenos Laws
            </h3>
            <p className="text-xs text-[#96897e] mt-1">
              The internal operational handbook for making unconscious shadow material conscious within protected containers.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-[#0c0603] p-5 rounded-xl border border-[#f27d26]/20 text-xs text-[#d5c8be] leading-relaxed font-mono whitespace-pre-wrap shadow-inner">
              {SHADOW_INTEGRATION_GUIDE.philosophy}
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-mono text-[#ffaa5e] uppercase font-semibold">The 4 Sacred Temenos Rules</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {SHADOW_INTEGRATION_GUIDE.temenosRules.map((rule, idx) => (
                  <div key={idx} className="bg-[#0c0603] p-4 rounded-xl border border-[#f27d26]/20 text-xs text-[#d5c8be] font-mono leading-relaxed shadow-inner">
                    {rule}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-mono text-[#ffaa5e] uppercase font-semibold">The Four Alchemical Transformation Stages</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SHADOW_INTEGRATION_GUIDE.alchemicalStages.map((stage, idx) => (
                  <div key={idx} className={`p-4 rounded-xl border space-y-2 ${stage.color} shadow-lg backdrop-blur-sm`}>
                    <div className="text-xs font-mono font-bold uppercase">{stage.stage}</div>
                    <p className="text-xs leading-relaxed opacity-90">{stage.description}</p>
                    <div className="text-[11px] font-mono pt-2 border-t border-white/10">
                      <strong>Ritual Practice: </strong>{stage.ritual}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
