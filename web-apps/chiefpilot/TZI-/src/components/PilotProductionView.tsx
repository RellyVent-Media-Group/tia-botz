import React, { useState, useEffect } from "react";
import { 
  ROYAL_RHINO_FABRICATION, 
  VOICE_RECORDING_SIDES, 
  PROP_INVENTORY 
} from "../data/puppetFabricationData";
import { 
  Film, 
  Zap, 
  Sun, 
  Volume2, 
  Loader2, 
  CheckCircle, 
  Clock, 
  Layers, 
  Sliders, 
  Sparkles 
} from "lucide-react";

export const PilotProductionView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"script" | "rhino-glow" | "lighting" | "recording-sides" | "props">("rhino-glow");

  // Royal Rhino Luminescence simulation state
  const [glowCharged, setGlowCharged] = useState(false);
  const [glowIntensity, setGlowIntensity] = useState(85);
  const [isCharging, setIsCharging] = useState(false);
  const [chargeTimer, setChargeTimer] = useState(0);

  // Multi-Speaker Voice Recording State
  const [isSynthesizingSides, setIsSynthesizingSides] = useState(false);
  const [sidesAudioError, setSidesAudioError] = useState<string | null>(null);

  // Simulate luminescence decay
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (glowCharged && glowIntensity > 15) {
      interval = setInterval(() => {
        setGlowIntensity((prev) => Math.max(15, prev - 1));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [glowCharged, glowIntensity]);

  const handleChargeRhino = () => {
    setIsCharging(true);
    setChargeTimer(8);

    const countdown = setInterval(() => {
      setChargeTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          setIsCharging(false);
          setGlowCharged(true);
          setGlowIntensity(100);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handlePlayRecordingSides = async () => {
    try {
      setIsSynthesizingSides(true);
      setSidesAudioError(null);

      // Call TTS with Harlan (Charon voice)
      const res = await fetch("/api/gemini/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: `Good evening, citizens of the Gilded Corridor. I'm Harlan Vance, and this is MirrorCast News. Rojas, how is the Royal Rhino fabrication holding up under the 3200K Skypanels?`,
          voice: "Charon",
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
          setIsSynthesizingSides(false);
        };
        source.start(0);
      } else {
        throw new Error(data.error || "Failed to synthesize pilot sides");
      }
    } catch (err: any) {
      console.error(err);
      setSidesAudioError(`Synthesis failed: ${err.message}`);
      setIsSynthesizingSides(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#140b07] via-[#1a0f09] to-[#261309]/60 border border-[#f27d26]/30 rounded-2xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(242,125,38,0.1)] relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#f27d26]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#f27d26]/15 text-[#ffaa5e] border border-[#f27d26]/30 shadow-[0_0_12px_rgba(242,125,38,0.2)]">
            <Film className="w-3.5 h-3.5 text-[#f27d26]" />
            <span>Stop-Motion Workshop & Pilot Production Stage</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#fcf8f5] tracking-tight font-cinzel">
            Royal Rhino Fabrication Specs, Lighting Plot & Pilot Script
          </h1>
          <p className="text-[#c8bbb0] text-sm max-w-3xl leading-relaxed">
            Practical stop-motion armatures, strontium aluminate phosphorescent resin test plans, 
            3200K tungsten lighting plots, and pilot voice recording sides for Harlan & Rojas.
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto bg-[#140b07]/90 p-2.5 rounded-xl border border-[#f27d26]/20 shadow-xl backdrop-blur-xl">
        {[
          { id: "rhino-glow", label: "Royal Rhino Glow Specs & Test Plan", icon: Zap },
          { id: "lighting", label: "Stop-Motion Lighting Plot (3200K)", icon: Sun },
          { id: "script", label: "Shot-by-Shot Shooting Script", icon: Layers },
          { id: "recording-sides", label: "Harlan & Rojas Voice Sides", icon: Volume2 },
          { id: "props", label: "Prop Inventory Matrix", icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer whitespace-nowrap ${
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

      {/* Tab 1: Royal Rhino Practical Glow Fabrication & Simulator */}
      {activeTab === "rhino-glow" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Specs Overview */}
          <div className="lg:col-span-7 space-y-6 bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
            <div className="border-b border-[#f27d26]/15 pb-4">
              <span className="text-xs font-mono text-[#ffaa5e] uppercase font-semibold">Fabrication Blueprint Mk.III</span>
              <h2 className="text-xl font-bold text-[#fcf8f5] mt-1 font-cinzel">{ROYAL_RHINO_FABRICATION.puppetName}</h2>
              <div className="text-xs text-[#96897e] mt-1 font-mono">{ROYAL_RHINO_FABRICATION.scale}</div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-mono text-[#96897e] uppercase">Armature Skeleton</h4>
                <p className="text-xs text-[#d5c8be] bg-[#0c0603]/80 p-3 rounded-xl border border-[#f27d26]/15 leading-relaxed mt-1">
                  {ROYAL_RHINO_FABRICATION.armatureType}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-mono text-[#96897e] uppercase">Power & Switching</h4>
                  <p className="text-xs text-[#d5c8be] bg-[#0c0603]/80 p-3 rounded-xl border border-[#f27d26]/15 leading-relaxed mt-1">
                    {ROYAL_RHINO_FABRICATION.glowMechanism.powerSource}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-mono text-[#96897e] uppercase">Fiber-Optic Routing</h4>
                  <p className="text-xs text-[#d5c8be] bg-[#0c0603]/80 p-3 rounded-xl border border-[#f27d26]/15 leading-relaxed mt-1">
                    {ROYAL_RHINO_FABRICATION.glowMechanism.fiberOptics}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-mono text-[#96897e] uppercase">Phosphorescent Glow Compound</h4>
                <p className="text-xs text-[#d5c8be] bg-[#0c0603]/80 p-3 rounded-xl border border-[#f27d26]/15 leading-relaxed mt-1">
                  {ROYAL_RHINO_FABRICATION.glowMechanism.luminescentResin}
                </p>
              </div>

              <div>
                <h4 className="text-xs font-mono text-[#96897e] uppercase">Luminescence Decay & Re-charge Protocol</h4>
                <p className="text-xs text-[#d5c8be] bg-[#0c0603]/80 p-3 rounded-xl border border-[#f27d26]/15 leading-relaxed mt-1">
                  {ROYAL_RHINO_FABRICATION.glowMechanism.fadeTesting}
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Luminescence Test Chamber Simulator */}
          <div className="lg:col-span-5 bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#fcf8f5] font-mono uppercase flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#f27d26]" />
                  Dark Stage Phosphor Test Rig
                </h3>
                <span className="text-xs font-mono text-[#ffaa5e] bg-[#24130b] px-2.5 py-1 rounded-md border border-[#f27d26]/30">
                  {glowIntensity}% Emission
                </span>
              </div>
              <p className="text-xs text-[#96897e]">
                Simulate the 395nm UV blacklight charge cycle and observe the 540nm amber-amber luminescence decay.
              </p>
            </div>

            {/* Visual Simulation Canvas */}
            <div className="relative w-full h-64 bg-[#080402] rounded-2xl border border-[#f27d26]/20 flex items-center justify-center overflow-hidden shadow-inner">
              {/* Radial glow aura */}
              <div
                className="absolute w-48 h-48 rounded-full blur-2xl transition-all duration-700 pointer-events-none"
                style={{
                  backgroundColor: glowCharged ? "#f27d26" : "#451a03",
                  opacity: glowIntensity / 100,
                  transform: `scale(${0.8 + glowIntensity / 200})`,
                }}
              />

              {/* Puppet silhouette mock representation */}
              <div className="relative z-10 text-center space-y-2">
                <div
                  className="w-28 h-28 mx-auto rounded-3xl border-2 flex items-center justify-center transition-all duration-500 shadow-2xl"
                  style={{
                    borderColor: glowCharged ? "#ffaa5e" : "#3d2417",
                    backgroundColor: glowCharged ? "rgba(242, 125, 38, 0.25)" : "rgba(20, 12, 8, 0.8)",
                    boxShadow: glowCharged ? `0 0 ${glowIntensity / 2}px #f27d26` : "none",
                  }}
                >
                  <Sparkles
                    className="w-12 h-12 transition-all duration-500"
                    style={{
                      color: glowCharged ? "#ffc58a" : "#695c52",
                      transform: glowCharged ? "rotate(15deg) scale(1.1)" : "none",
                    }}
                  />
                </div>
                <div className="text-xs font-mono text-[#e5dcd4] font-semibold tracking-wide">
                  {glowCharged ? "ROYAL RHINO CORE: ACTIVE" : "DORMANT IN CLAY"}
                </div>
                <div className="text-[10px] font-mono text-[#8a7c72]">
                  {isCharging ? `Charging with 395nm UV... ${chargeTimer}s` : `Decay Rate: -1% / 2s`}
                </div>
              </div>
            </div>

            {/* Test Trigger Button */}
            <button
              onClick={handleChargeRhino}
              disabled={isCharging}
              className="w-full py-3 rounded-xl glow-btn-primary font-mono font-bold text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isCharging ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Charging with 395nm UV Torch ({chargeTimer}s)...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Initiate 8-Second UV Blacklight Charge</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Tab 2: Stop-Motion Lighting Plot */}
      {activeTab === "lighting" && (
        <div className="bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-[#f27d26]/15 pb-4">
            <h3 className="text-lg font-bold text-[#fcf8f5] flex items-center gap-2 font-cinzel">
              <Sun className="w-5 h-5 text-[#f27d26]" />
              Stop-Motion Stage Lighting Plot & DMX Configuration
            </h3>
            <p className="text-xs text-[#96897e] mt-1">
              Precision color temperature balancing to isolate luminescent resin from ambient tungsten spill.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#0c0603]/90 border border-[#f27d26]/25 rounded-xl p-4 space-y-3 shadow-inner">
              <div className="text-xs font-mono text-[#ffaa5e] font-bold uppercase">1. Key Light (Frontal 45°)</div>
              <div className="text-xs text-[#d5c8be] leading-relaxed">{ROYAL_RHINO_FABRICATION.lightingPlot.keyLight}</div>
              <div className="text-[11px] font-mono text-[#ffc58a] bg-[#24130b] px-2.5 py-1 rounded border border-[#f27d26]/30">
                Temp: 3200K Tungsten
              </div>
            </div>

            <div className="bg-[#0c0603]/90 border border-[#f27d26]/15 rounded-xl p-4 space-y-3 shadow-inner">
              <div className="text-xs font-mono text-[#b8aba0] font-bold uppercase">2. Fill Light (Soft Bounce)</div>
              <div className="text-xs text-[#d5c8be] leading-relaxed">{ROYAL_RHINO_FABRICATION.lightingPlot.fillLight}</div>
              <div className="text-[11px] font-mono text-[#96897e] bg-[#140b07] px-2.5 py-1 rounded border border-[#f27d26]/20">
                Temp: 2800K Warm Wash (25% Ratio)
              </div>
            </div>

            <div className="bg-[#0c0603]/90 border border-cyan-500/25 rounded-xl p-4 space-y-3 shadow-inner">
              <div className="text-xs font-mono text-cyan-400 font-bold uppercase">3. Rim Light (Snoot CTB)</div>
              <div className="text-xs text-[#d5c8be] leading-relaxed">{ROYAL_RHINO_FABRICATION.lightingPlot.rimLight}</div>
              <div className="text-[11px] font-mono text-cyan-300/80 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-800/30">
                Temp: 5600K Cool Cyan Accent
              </div>
            </div>
          </div>

          {/* Camera Specs & Exposure */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-[#0c0603] p-3.5 rounded-xl border border-[#f27d26]/15">
              <div className="text-[11px] font-mono text-[#8a7c72]">Capture Frame Rate</div>
              <div className="text-sm font-bold text-[#fcf8f5] mt-0.5">{ROYAL_RHINO_FABRICATION.lightingPlot.frameRate} FPS (24p Cinematic)</div>
            </div>
            <div className="bg-[#0c0603] p-3.5 rounded-xl border border-[#f27d26]/15">
              <div className="text-[11px] font-mono text-[#8a7c72]">Shutter Angle</div>
              <div className="text-sm font-bold text-[#fcf8f5] mt-0.5">{ROYAL_RHINO_FABRICATION.lightingPlot.shutterAngle}</div>
            </div>
            <div className="bg-[#0c0603] p-3.5 rounded-xl border border-[#f27d26]/15">
              <div className="text-[11px] font-mono text-[#8a7c72]">DMX Strobe Trigger</div>
              <div className="text-sm font-bold text-emerald-400 mt-0.5">Synchronized with Dragonframe</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Shot-by-Shot Shooting Script */}
      {activeTab === "script" && (
        <div className="bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-[#f27d26]/15 pb-4">
            <h3 className="text-lg font-bold text-[#fcf8f5] flex items-center gap-2 font-cinzel">
              <Layers className="w-5 h-5 text-[#f27d26]" />
              Pilot Episode: Shot-by-Shot Technical Shooting Beats
            </h3>
            <p className="text-xs text-[#96897e] mt-1">
              Synchronized lighting cues, puppet increment movements, and audio track stamps for the pilot opening sequence.
            </p>
          </div>

          <div className="space-y-4">
            {ROYAL_RHINO_FABRICATION.shotListBeats.map((beat, idx) => (
              <div key={idx} className="bg-[#0c0603] border border-[#f27d26]/20 rounded-xl p-5 space-y-3 shadow-inner">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#24140b] pb-2">
                  <span className="text-xs font-mono text-[#ffaa5e] font-bold">{beat.sceneNum}</span>
                  <span className="text-xs font-mono text-[#b8aba0] bg-[#140b07] px-2.5 py-0.5 rounded border border-[#f27d26]/20">
                    Shot Type: {beat.shotType}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <div className="font-mono text-[#8a7c72] uppercase text-[10px]">Lighting Cue</div>
                    <div className="text-[#d5c8be] mt-1">{beat.lightingCue}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[#8a7c72] uppercase text-[10px]">Puppet Movement (Dragonframe)</div>
                    <div className="text-[#d5c8be] mt-1">{beat.puppetMovement}</div>
                  </div>
                  <div>
                    <div className="font-mono text-[#8a7c72] uppercase text-[10px]">Audio & Dialogue Cue</div>
                    <div className="text-[#d5c8be] mt-1">{beat.audioCue}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Harlan & Rojas Voice Recording Sides */}
      {activeTab === "recording-sides" && (
        <div className="bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#f27d26]/15 pb-4">
            <div>
              <h3 className="text-lg font-bold text-[#fcf8f5] flex items-center gap-2 font-cinzel">
                <Volume2 className="w-5 h-5 text-[#f27d26]" />
                Harlan Vance & Rojas Bell Voice Recording Sides
              </h3>
              <p className="text-xs text-[#96897e] mt-1">
                Full script side for studio table read and audio recording session with live Gemini 3.1 Flash TTS.
              </p>
            </div>
            <button
              onClick={handlePlayRecordingSides}
              disabled={isSynthesizingSides}
              className="px-4 py-2 rounded-xl glow-btn-primary text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSynthesizingSides ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Voice Side...</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4" />
                  <span>Audition Harlan Anchor Side (TTS)</span>
                </>
              )}
            </button>
          </div>

          {sidesAudioError && <div className="text-xs text-rose-400">{sidesAudioError}</div>}

          {/* Script Text Display */}
          <div className="bg-[#0c0603] p-5 rounded-xl border border-[#f27d26]/20 text-xs font-mono text-[#d5c8be] leading-relaxed whitespace-pre-wrap shadow-inner">
            {VOICE_RECORDING_SIDES.harlanAndRojas}
          </div>
        </div>
      )}

      {/* Tab 5: Prop Inventory Matrix */}
      {activeTab === "props" && (
        <div className="bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-[#f27d26]/15 pb-4">
            <h3 className="text-lg font-bold text-[#fcf8f5] flex items-center gap-2 font-cinzel">
              <Sliders className="w-5 h-5 text-[#f27d26]" />
              Pilot Prop Inventory & Physical Fabrication Registry
            </h3>
            <p className="text-xs text-[#96897e] mt-1">
              Physical stage assets, resin prototypes, and miniature replicas curated for the stop-motion pilot shoot.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PROP_INVENTORY.map((prop) => (
              <div key={prop.itemCode} className="bg-[#0c0603] border border-[#f27d26]/20 rounded-xl p-4 space-y-2 shadow-inner">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#ffaa5e] font-bold">{prop.itemCode}</span>
                  <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                    <CheckCircle className="w-3 h-3" />
                    {prop.status}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#fcf8f5]">{prop.name}</h4>
                <div className="text-xs text-[#96897e] font-mono">Location: {prop.location}</div>
                <p className="text-xs text-[#d5c8be] leading-relaxed bg-[#140b07] p-2.5 rounded-lg border border-[#f27d26]/15">
                  {prop.materials}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
