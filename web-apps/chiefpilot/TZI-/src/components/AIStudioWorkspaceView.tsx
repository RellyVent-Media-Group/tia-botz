import React, { useState } from "react";
import { SOULS_DATABASE } from "../data/soulsData";
import { 
  Bot, 
  Brain, 
  Volume2, 
  Image as ImageIcon, 
  Sparkles, 
  Loader2, 
  Send, 
  Play, 
  Check, 
  Layers, 
  Cpu 
} from "lucide-react";

export const AIStudioWorkspaceView: React.FC = () => {
  const [activeEngineTab, setActiveEngineTab] = useState<"thinking" | "tts" | "image" | "agent-dispatcher">("thinking");

  // High-Thinking State
  const [thinkingPrompt, setThinkingPrompt] = useState(
    "How does the shadow integration of Theron Voidweaver relate to the 530 area code message knot and the activation of the Royal Rhino's luminescent core?"
  );
  const [thinkingOutput, setThinkingOutput] = useState<string>("");
  const [isThinking, setIsThinking] = useState(false);

  // TTS State
  const [ttsText, setTtsText] = useState(
    "Citizens of the Seven Rooms: The Gilded Mirrors tribute ledger has been reconciled under the Hermetic Law of Rhythm."
  );
  const [ttsVoice, setTtsVoice] = useState<"Kore" | "Fenrir" | "Charon" | "Puck" | "Zephyr">("Fenrir");
  const [isGeneratingTts, setIsGeneratingTts] = useState(false);
  const [ttsSuccess, setTtsSuccess] = useState(false);

  // Image Generation State
  const [imagePrompt, setImagePrompt] = useState(
    "Stop-motion puppet of a majestic armored royal rhinoceros with a glowing amber horn standing inside an antique gold mirror hall, 3200K cinematic tungsten lighting, dark studio background, high detail miniature craftsmanship"
  );
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);

  // Autonomous Agent Dispatcher State
  const [selectedAgentSoul, setSelectedAgentSoul] = useState(SOULS_DATABASE[0]);
  const [agentPlatform, setAgentPlatform] = useState("Instagram");
  const [agentGeneratedPost, setAgentGeneratedPost] = useState<string>("");
  const [isDispatchingAgent, setIsDispatchingAgent] = useState(false);

  // Handlers
  const handleRunThinking = async () => {
    if (!thinkingPrompt.trim()) return;
    try {
      setIsThinking(true);
      setThinkingOutput("");
      const res = await fetch("/api/gemini/think", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: thinkingPrompt,
          domain: "Gilded Mirrors Autonomous Continuity & Lore Architecture",
        }),
      });
      const data = await res.json();
      setThinkingOutput(data.text || "No output returned.");
    } catch (err: any) {
      setThinkingOutput(`Thinking Error: ${err.message}`);
    } finally {
      setIsThinking(false);
    }
  };

  const handleRunTTS = async () => {
    if (!ttsText.trim()) return;
    try {
      setIsGeneratingTts(true);
      setTtsSuccess(false);
      const res = await fetch("/api/gemini/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: ttsText,
          voice: ttsVoice,
        }),
      });

      const data = await res.json();
      if (data.audioBase64) {
        const binaryString = atob(data.audioBase64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

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
          setIsGeneratingTts(false);
          setTtsSuccess(true);
        };
        source.start(0);
      }
    } catch (err) {
      console.error(err);
      setIsGeneratingTts(false);
    }
  };

  const handleRunImageGen = async () => {
    if (!imagePrompt.trim()) return;
    try {
      setIsGeneratingImage(true);
      setImageError(null);
      setGeneratedImageUrl(null);

      const res = await fetch("/api/gemini/image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: imagePrompt,
          aspectRatio: "1:1",
        }),
      });

      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImageUrl(data.imageUrl);
      } else {
        throw new Error(data.error || "Image generation failed");
      }
    } catch (err: any) {
      console.error(err);
      setImageError(err.message);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleDispatchAgent = async () => {
    try {
      setIsDispatchingAgent(true);
      setAgentGeneratedPost("");
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Create a viral ${agentPlatform} content drop as ${selectedAgentSoul.name} (${selectedAgentSoul.archetype}).
Persona Traits: ${selectedAgentSoul.personaTraits.join(", ")}
Shadow Polarity: ${selectedAgentSoul.shadowPolarityScore}%
Speaking Style: ${selectedAgentSoul.voiceProfile.speakingStyle}
Include engaging hooks, thematic lore, and a call-to-action for the self-originating tribute ledger.`,
          systemInstruction: "You are the autonomous AI Agent Dispatcher for the 30 Souls Gilded Mirrors content pipeline.",
        }),
      });

      const data = await res.json();
      setAgentGeneratedPost(data.text || "");
    } catch (err: any) {
      setAgentGeneratedPost(`Dispatch error: ${err.message}`);
    } finally {
      setIsDispatchingAgent(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#140b07] via-[#1a0f09] to-[#261309]/60 border border-[#f27d26]/30 rounded-2xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(242,125,38,0.1)] relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#f27d26]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#f27d26]/15 text-[#ffaa5e] border border-[#f27d26]/30 shadow-[0_0_12px_rgba(242,125,38,0.2)]">
            <Bot className="w-3.5 h-3.5 text-[#f27d26]" />
            <span>Multimodal AI Studio & 30 Souls Content Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#fcf8f5] tracking-tight font-cinzel">
            Gemini Multimodal Workspace: Reasoning, Voice TTS & Concept Art
          </h1>
          <p className="text-[#c8bbb0] text-sm max-w-3xl leading-relaxed">
            Unified production suite combining Gemini 3.1 Pro High-Thinking mode, Gemini 3.1 Flash Text-to-Speech audio synthesis, 
            Gemini Flash visual generation, and autonomous agent queues for 30 Souls.
          </p>
        </div>
      </div>

      {/* Engine Navigation */}
      <div className="flex items-center gap-2 bg-[#140b07]/90 p-2.5 rounded-xl border border-[#f27d26]/20 shadow-xl backdrop-blur-xl">
        {[
          { id: "thinking", label: "Gemini 3.1 Pro High-Thinking", icon: Brain },
          { id: "tts", label: "Gemini 3.1 Flash Voice TTS", icon: Volume2 },
          { id: "image", label: "Gemini Flash Concept Art", icon: ImageIcon },
          { id: "agent-dispatcher", label: "30 Souls Autonomous Agent Queue", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeEngineTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveEngineTab(tab.id as any)}
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

      {/* Mode 1: High Thinking */}
      {activeEngineTab === "thinking" && (
        <div className="bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#f27d26]/15 pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#fcf8f5] flex items-center gap-2 font-cinzel">
                <Brain className="w-5 h-5 text-[#f27d26]" />
                Gemini 3.1 Pro High-Thinking Reasoning Hub
              </h3>
              <p className="text-xs text-[#96897e] mt-1 font-mono">
                Model: <code className="text-[#ffaa5e]">gemini-3.1-pro-preview</code> | ThinkingLevel: <code className="text-[#ffaa5e]">HIGH</code> (Maximizes deep reasoning and alchemical continuity).
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <textarea
              value={thinkingPrompt}
              onChange={(e) => setThinkingPrompt(e.target.value)}
              rows={3}
              placeholder="Enter complex lore query, narrative paradox, or technical script continuity question..."
              className="w-full bg-[#0c0603] border border-[#f27d26]/20 rounded-xl p-4 text-xs text-[#fcf8f5] placeholder-[#6d5f54] focus:outline-none focus:border-[#f27d26] focus:ring-1 focus:ring-[#f27d26]/50 font-mono shadow-inner"
            />

            <button
              onClick={handleRunThinking}
              disabled={isThinking || !thinkingPrompt.trim()}
              className="px-6 py-2.5 rounded-xl glow-btn-primary text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isThinking ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Deep Reasoning (Thinking: HIGH)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Execute High-Thinking Analysis</span>
                </>
              )}
            </button>

            {thinkingOutput && (
              <div className="bg-[#0c0603] border border-[#f27d26]/30 rounded-xl p-5 text-xs text-[#d5c8be] font-mono leading-relaxed whitespace-pre-wrap shadow-inner">
                {thinkingOutput}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mode 2: Voice TTS */}
      {activeEngineTab === "tts" && (
        <div className="bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-[#f27d26]/15 pb-4">
            <h3 className="text-lg font-bold text-[#fcf8f5] flex items-center gap-2 font-cinzel">
              <Volume2 className="w-5 h-5 text-[#f27d26]" />
              Gemini 3.1 Flash Text-to-Speech (TTS) Studio
            </h3>
            <p className="text-xs text-[#96897e] mt-1 font-mono">
              Model: <code className="text-[#ffaa5e]">gemini-3.1-flash-tts-preview</code> | Direct 24kHz PCM Audio Playback
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <textarea
                value={ttsText}
                onChange={(e) => setTtsText(e.target.value)}
                rows={4}
                placeholder="Enter text to synthesize into spoken voice..."
                className="w-full bg-[#0c0603] border border-[#f27d26]/20 rounded-xl p-4 text-xs text-[#fcf8f5] placeholder-[#6d5f54] focus:outline-none focus:border-[#f27d26] focus:ring-1 focus:ring-[#f27d26]/50 font-mono shadow-inner"
              />

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleRunTTS}
                  disabled={isGeneratingTts || !ttsText.trim()}
                  className="px-6 py-2.5 rounded-xl glow-btn-primary text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingTts ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing 24kHz Audio...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Synthesize & Play Voice</span>
                    </>
                  )}
                </button>
                {ttsSuccess && <span className="text-xs font-mono text-emerald-400 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Played successfully</span>}
              </div>
            </div>

            {/* Voice Archetype Selector */}
            <div className="lg:col-span-4 bg-[#0c0603] p-4 rounded-xl border border-[#f27d26]/20 space-y-3 shadow-inner">
              <div className="text-xs font-mono text-[#ffaa5e] uppercase font-semibold">Prebuilt Voice Actor</div>
              <div className="space-y-1.5">
                {(["Fenrir", "Charon", "Kore", "Puck", "Zephyr"] as const).map((voice) => (
                  <button
                    key={voice}
                    onClick={() => setTtsVoice(voice)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                      ttsVoice === voice
                        ? "bg-gradient-to-r from-[#f27d26] to-[#e65c00] text-[#0a0502] font-bold shadow-md"
                        : "text-[#b8aba0] hover:bg-[#140b07] hover:text-[#fcf8f5]"
                    }`}
                  >
                    <span>{voice}</span>
                    <span className="text-[10px] opacity-80">
                      {voice === "Fenrir" && "Authoritative / Patriarch"}
                      {voice === "Charon" && "Deep Baritone / News Anchor"}
                      {voice === "Kore" && "Intimate / Velvet Oracle"}
                      {voice === "Puck" && "Energetic / Manic Muppet"}
                      {voice === "Zephyr" && "Harmonic / Merchant"}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mode 3: Image Concept Art Generator */}
      {activeEngineTab === "image" && (
        <div className="bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-[#f27d26]/15 pb-4">
            <h3 className="text-lg font-bold text-[#fcf8f5] flex items-center gap-2 font-cinzel">
              <ImageIcon className="w-5 h-5 text-[#f27d26]" />
              Gemini Flash Concept Art & Puppet Workshop Visualizer
            </h3>
            <p className="text-xs text-[#96897e] mt-1 font-mono">
              Model: <code className="text-[#ffaa5e]">gemini-3.1-flash-lite-image</code> | Aspect Ratio: <code className="text-[#ffaa5e]">1:1</code>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7 space-y-4">
              <textarea
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                rows={4}
                placeholder="Describe stop motion set, puppet armature, or character scene..."
                className="w-full bg-[#0c0603] border border-[#f27d26]/20 rounded-xl p-4 text-xs text-[#fcf8f5] placeholder-[#6d5f54] focus:outline-none focus:border-[#f27d26] focus:ring-1 focus:ring-[#f27d26]/50 font-mono shadow-inner"
              />

              <button
                onClick={handleRunImageGen}
                disabled={isGeneratingImage || !imagePrompt.trim()}
                className="px-6 py-2.5 rounded-xl glow-btn-primary text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isGeneratingImage ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Rendering Concept Art...</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-4 h-4" />
                    <span>Generate Puppet Concept</span>
                  </>
                )}
              </button>

              {imageError && <div className="text-xs text-rose-400 font-mono">{imageError}</div>}
            </div>

            {/* Rendered Output Frame */}
            <div className="lg:col-span-5 flex items-center justify-center bg-[#0c0603] rounded-2xl border border-[#f27d26]/20 p-4 min-h-[280px] shadow-inner">
              {generatedImageUrl ? (
                <img
                  src={generatedImageUrl}
                  alt="Generated Concept Art"
                  className="w-full h-auto max-h-72 object-contain rounded-xl shadow-2xl border border-[#f27d26]/40"
                />
              ) : (
                <div className="text-center text-[#6d5f54] space-y-2">
                  <ImageIcon className="w-10 h-10 mx-auto text-[#3d2417]" />
                  <p className="text-xs font-mono">Rendered concept art will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mode 4: Autonomous Agent Dispatcher */}
      {activeEngineTab === "agent-dispatcher" && (
        <div className="bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-[#f27d26]/15 pb-4">
            <h3 className="text-lg font-bold text-[#fcf8f5] flex items-center gap-2 font-cinzel">
              <Sparkles className="w-5 h-5 text-[#f27d26]" />
              Autonomous Soul Agent Dispatcher & Multi-Platform Post Queue
            </h3>
            <p className="text-xs text-[#96897e] mt-1">
              Connect the 30 Souls to OpenRouter/Gemini LLMs for automated content drops across Instagram, YouTube, LinkedIn, and encrypted Zu Relays.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 space-y-3">
              <div className="text-xs font-mono text-[#ffaa5e] uppercase font-semibold">Select Soul Entity</div>
              <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                {SOULS_DATABASE.map((soul) => (
                  <button
                    key={soul.id}
                    onClick={() => setSelectedAgentSoul(soul)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs font-mono transition-all flex items-center justify-between cursor-pointer ${
                      selectedAgentSoul.id === soul.id
                        ? "bg-gradient-to-r from-[#f27d26] to-[#e65c00] text-[#0a0502] font-bold shadow-md"
                        : "bg-[#0c0603] text-[#b8aba0] border border-[#f27d26]/15 hover:text-[#fcf8f5]"
                    }`}
                  >
                    <span>{soul.name}</span>
                    <span className="text-[10px] opacity-80">{soul.archetype}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-mono text-[#96897e]">Target Channel:</span>
                {["Instagram", "YouTube", "LinkedIn", "TikTok", "Substack", "Zu Relay"].map((platform) => (
                  <button
                    key={platform}
                    onClick={() => setAgentPlatform(platform)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono cursor-pointer transition-all ${
                      agentPlatform === platform
                        ? "bg-[#24130b] text-[#ffaa5e] border border-[#f27d26] font-bold shadow-sm"
                        : "bg-[#0c0603] text-[#96897e] border border-[#f27d26]/15 hover:text-[#fcf8f5]"
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>

              <button
                onClick={handleDispatchAgent}
                disabled={isDispatchingAgent}
                className="px-6 py-2.5 rounded-xl glow-btn-primary text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDispatchingAgent ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching Autonomous Agent...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate {agentPlatform} Post as {selectedAgentSoul.name}</span>
                  </>
                )}
              </button>

              {agentGeneratedPost && (
                <div className="bg-[#0c0603] border border-[#f27d26]/20 rounded-xl p-5 text-xs text-[#d5c8be] font-mono leading-relaxed whitespace-pre-wrap shadow-inner">
                  {agentGeneratedPost}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
