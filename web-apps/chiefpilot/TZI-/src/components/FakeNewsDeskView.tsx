import React, { useState } from "react";
import { FAKE_NEWS_STORIES, SPONSOR_REGISTRY } from "../data/fakeNewsData";
import { 
  Tv, 
  Sparkles, 
  Play, 
  Volume2, 
  Layers, 
  ShoppingBag, 
  Send, 
  Loader2, 
  Radio, 
  Share2 
} from "lucide-react";

export const FakeNewsDeskView: React.FC = () => {
  const [selectedStory, setSelectedStory] = useState(FAKE_NEWS_STORIES[0]);
  const [customTopic, setCustomTopic] = useState("");
  const [isGeneratingStory, setIsGeneratingStory] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<"teleprompter" | "sponsors" | "lower-thirds">("teleprompter");

  // Audio Playback
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleGenerateScript = async () => {
    if (!customTopic.trim()) return;
    try {
      setIsGeneratingStory(true);
      const res = await fetch("/api/gemini/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Write a hilarious high-stakes fake news script for Harlan Vance (cynical baritone anchor) and Rojas Bell (frantic felt muppet field reporter).
Topic: ${customTopic}
Format as:
HEADLINE: ...
HARLAN: ...
ROJAS: ...
LOWER_THIRD: ...
TICKER: ...
SOCIAL_CUT: ...`,
          systemInstruction: "You are the head comedy and lore writer for MirrorCast 24/7 Gilded Mirrors Fake News Desk.",
        }),
      });

      const data = await res.json();
      if (data.text) {
        const generatedStory = {
          id: `fn_${Date.now()}`,
          headline: `BREAKING: ${customTopic.toUpperCase()}`,
          outlet: "MirrorCast 24/7 Global",
          category: "Breaking" as const,
          anchorA_Line: data.text,
          anchorB_Line: "Live from the 530 relay corridor!",
          lowerThirdText: `BREAKING // ${customTopic.toUpperCase()} // MIRRORCAST EXCLUSIVE`,
          tickerHeadline: "ZU DEPOT SHARES SURGE 12% FOLLOWING UNEXPECTED LORE REVELATION",
          sponsorSlug: "SWAGGER_DRAGON",
          socialCutScript: `When the news desk breaks the story about ${customTopic}. #MirrorCast #PuppetNews`,
          loreLedgerRef: "lore_custom",
        };
        setSelectedStory(generatedStory);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingStory(false);
    }
  };

  const handlePlayAnchorAudio = async () => {
    try {
      setIsPlayingAudio(true);
      const res = await fetch("/api/gemini/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: selectedStory.anchorA_Line,
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
          setIsPlayingAudio(false);
        };
        source.start(0);
      }
    } catch (err) {
      console.error(err);
      setIsPlayingAudio(false);
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#140b07] via-[#1a0f09] to-[#261309]/60 border border-[#f27d26]/30 rounded-2xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(242,125,38,0.1)] relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#f27d26]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#f27d26]/15 text-[#ffaa5e] border border-[#f27d26]/30 shadow-[0_0_12px_rgba(242,125,38,0.2)]">
            <Tv className="w-3.5 h-3.5 text-[#f27d26]" />
            <span>MirrorCast 24/7 Global Broadcast Studio</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#fcf8f5] tracking-tight font-cinzel">
            Fake News Desk, Teleprompter & Fictional Sponsor Registry
          </h1>
          <p className="text-[#c8bbb0] text-sm max-w-3xl leading-relaxed">
            Dual-anchor satire broadcast system featuring Harlan Vance (cynical anchor) and Rojas Bell (felt field muppet). 
            Generate custom desk teleprompters, live broadcast lower-third graphics, and social short-form video scripts.
          </p>
        </div>
      </div>

      {/* Sub-Tabs */}
      <div className="flex items-center gap-2 bg-[#140b07]/90 p-2.5 rounded-xl border border-[#f27d26]/20 shadow-xl backdrop-blur-xl">
        {[
          { id: "teleprompter", label: "Anchor Teleprompter & Desk Broadcast", icon: Radio },
          { id: "lower-thirds", label: "Live Lower-Third Overlay Package", icon: Layers },
          { id: "sponsors", label: "Fictional Sponsor Registry", icon: ShoppingBag },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
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

      {/* Tab 1: Teleprompter & Live Broadcast */}
      {activeSubTab === "teleprompter" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Story Selector & Generator */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-[#140b07]/90 border border-[#f27d26]/20 rounded-xl p-4 space-y-3 shadow-xl backdrop-blur-xl">
              <span className="text-xs font-mono text-[#ffaa5e] font-bold uppercase">Generate New Fake News Beat</span>
              <div className="space-y-2">
                <input
                  type="text"
                  value={customTopic}
                  onChange={(e) => setCustomTopic(e.target.value)}
                  placeholder="e.g. Royal Rhino demands tribute in peanut butter..."
                  className="w-full bg-[#0c0603] border border-[#f27d26]/20 rounded-lg p-2.5 text-xs text-[#fcf8f5] placeholder-[#6d5f54] focus:outline-none focus:border-[#f27d26] focus:ring-1 focus:ring-[#f27d26]/50 font-mono shadow-inner"
                />
                <button
                  onClick={handleGenerateScript}
                  disabled={isGeneratingStory || !customTopic.trim()}
                  className="w-full py-2.5 rounded-lg glow-btn-primary text-xs font-bold font-mono flex items-center justify-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingStory ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Generate Newsroom Script</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-mono text-[#96897e] uppercase font-semibold px-1">Curated Broadcast Stories</span>
              {FAKE_NEWS_STORIES.map((story) => (
                <button
                  key={story.id}
                  onClick={() => setSelectedStory(story)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    story.id === selectedStory.id
                      ? "bg-[#24130b] border-[#f27d26] text-[#fcf8f5] shadow-[0_0_15px_rgba(242,125,38,0.2)]"
                      : "bg-[#140b07]/90 border-[#f27d26]/15 text-[#b8aba0] hover:text-[#fcf8f5] hover:bg-[#1a0f0a]"
                  }`}
                >
                  <div className="text-[10px] font-mono text-[#ffaa5e] font-bold">{story.category}</div>
                  <div className="text-xs font-bold text-[#fcf8f5] mt-0.5 line-clamp-2">{story.headline}</div>
                  <div className="text-[10px] font-mono text-[#8a7c72] mt-1">{story.outlet}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Broadcast Studio Teleprompter Screen */}
          <div className="lg:col-span-8 bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl p-6 space-y-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
            {/* Monitor Screen Frame */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#f27d26]/15 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-[0_0_8px_#f43f5e]" />
                  <span className="text-xs font-mono text-rose-400 font-bold uppercase tracking-wider">ON AIR // LIVE PROMPTER</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePlayAnchorAudio}
                    disabled={isPlayingAudio}
                    className="px-3.5 py-1.5 rounded-lg glow-btn-primary text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {isPlayingAudio ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>Read Harlan Line (TTS)</span>
                  </button>
                </div>
              </div>

              {/* Headline Banner */}
              <div className="bg-[#0c0603] p-4 rounded-xl border border-[#f27d26]/20 space-y-1 shadow-inner">
                <div className="text-[10px] font-mono text-[#ffaa5e] uppercase">{selectedStory.outlet}</div>
                <h3 className="text-base sm:text-lg font-bold text-[#fcf8f5] tracking-tight font-cinzel">{selectedStory.headline}</h3>
              </div>

              {/* Dialogue Beats */}
              <div className="space-y-3">
                {/* Harlan Desk Anchor */}
                <div className="bg-[#0c0603] border border-[#f27d26]/25 rounded-xl p-4 space-y-1 shadow-inner">
                  <div className="text-xs font-mono text-[#ffaa5e] font-bold uppercase flex items-center gap-1.5">
                    <span>🎙️ HARLAN VANCE (Senior Desk Anchor)</span>
                  </div>
                  <p className="text-xs text-[#d5c8be] leading-relaxed font-mono mt-1">
                    "{selectedStory.anchorA_Line}"
                  </p>
                </div>

                {/* Rojas Field Correspondent */}
                <div className="bg-[#0c0603] border border-[#f27d26]/15 rounded-xl p-4 space-y-1 shadow-inner">
                  <div className="text-xs font-mono text-[#f27d26] font-bold uppercase flex items-center gap-1.5">
                    <span>⚡ ROJAS BELL (Field Muppet Live)</span>
                  </div>
                  <p className="text-xs text-[#d5c8be] leading-relaxed font-mono mt-1">
                    "{selectedStory.anchorB_Line}"
                  </p>
                </div>
              </div>

              {/* Social Cut Short-Form Script */}
              <div className="bg-[#0c0603]/60 border border-[#f27d26]/15 rounded-xl p-3.5 space-y-1">
                <div className="text-[11px] font-mono text-[#96897e] font-bold uppercase flex items-center gap-1.5">
                  <Share2 className="w-3 h-3 text-[#f27d26]" />
                  Short-Form Video Derivative Cut (TikTok / Reels / YouTube Shorts)
                </div>
                <p className="text-xs text-[#b8aba0] font-mono leading-relaxed">
                  {selectedStory.socialCutScript}
                </p>
              </div>
            </div>

            {/* Simulated Live Lower Third Overlay */}
            <div className="mt-4 pt-4 border-t border-[#f27d26]/15">
              <div className="bg-gradient-to-r from-[#1f0f08] via-[#0c0603] to-[#24130b] border-l-4 border-[#f27d26] rounded-lg p-3 shadow-lg border-y border-r border-[#f27d26]/20">
                <div className="text-[10px] font-mono text-[#ffaa5e] font-bold tracking-wider uppercase">
                  {selectedStory.lowerThirdText}
                </div>
                <div className="text-[11px] font-mono text-[#d5c8be] mt-1 flex items-center gap-2">
                  <span className="text-rose-400 font-bold animate-pulse">TICKER:</span>
                  <span className="line-clamp-1">{selectedStory.tickerHeadline}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Lower-Third Graphics Package */}
      {activeSubTab === "lower-thirds" && (
        <div className="bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-[#f27d26]/15 pb-4">
            <h3 className="text-lg font-bold text-[#fcf8f5] flex items-center gap-2 font-cinzel">
              <Layers className="w-5 h-5 text-[#f27d26]" />
              After Effects / Premiere Pro Graphic Package & Lower-Third Templates
            </h3>
            <p className="text-xs text-[#96897e] mt-1">
              Text-based specifications for live DVE bugs, anchor super chyrons, and urgent ticker crawl animations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0c0603] p-5 rounded-xl border border-[#f27d26]/20 space-y-3 shadow-inner">
              <div className="text-xs font-mono text-[#ffaa5e] font-bold uppercase">Template A: Breaking Lore Super Chyron</div>
              <div className="bg-gradient-to-r from-red-950/80 to-neutral-950 border-l-4 border-rose-500 p-3.5 rounded text-xs font-mono text-white">
                <div className="text-[10px] text-rose-400 font-bold">MIRRORCAST // SPECIAL REPORT</div>
                <div className="font-bold text-sm mt-0.5">530 AREA RELAY FREQUENCY SPIKE DETECTED</div>
                <div className="text-[11px] text-neutral-400 mt-1">ZONING BOARD GRANTS IMMUNITY TO STOP-MOTION ASSET</div>
              </div>
              <p className="text-xs text-[#96897e] font-mono">
                Font: Compact Gothic Bold 24pt / Tracking +1.2 / Motion entry: Left-to-right snap with 0.15s bounce.
              </p>
            </div>

            <div className="bg-[#0c0603] p-5 rounded-xl border border-[#f27d26]/20 space-y-3 shadow-inner">
              <div className="text-xs font-mono text-[#ffaa5e] font-bold uppercase">Template B: Fictional Sponsor Segment Tag</div>
              <div className="bg-gradient-to-r from-[#261309] to-[#0c0603] border-l-4 border-[#f27d26] p-3.5 rounded text-xs font-mono text-white">
                <div className="text-[10px] text-[#ffaa5e] font-bold">SEGMENT SPONSORED BY SWAGGER DRAGON ELIXIRS</div>
                <div className="font-bold text-sm mt-0.5">ALCHEMICAL POTIONS (3200K TUNGSTEN APPROVED)</div>
                <div className="text-[11px] text-[#c8bbb0] mt-1">TRIBUTE DEPOSIT CONFIRMED // STRIPE CLEARANCE: 100%</div>
              </div>
              <p className="text-xs text-[#96897e] font-mono">
                Font: Mono Serif Display / Gold Foil Shimmer Loop / Motion exit: 4-frame alpha fade.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Sponsor Registry */}
      {activeSubTab === "sponsors" && (
        <div className="bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl backdrop-blur-xl">
          <div className="border-b border-[#f27d26]/15 pb-4">
            <h3 className="text-lg font-bold text-[#fcf8f5] flex items-center gap-2 font-cinzel">
              <ShoppingBag className="w-5 h-5 text-[#f27d26]" />
              Fictional Sponsor Registry & Commercial Prop Integration
            </h3>
            <p className="text-xs text-[#96897e] mt-1">
              In-universe commercial sponsors, product placement notes, and prop fabrication blueprints.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SPONSOR_REGISTRY.map((sponsor) => (
              <div
                key={sponsor.id}
                className="bg-[#0c0603] border border-[#f27d26]/20 rounded-xl p-5 space-y-3 hover:border-[#f27d26]/50 transition-all flex flex-col justify-between shadow-inner"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#ffaa5e] font-bold">{sponsor.fictionalSector}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#24130b] text-[#ffc58a] border border-[#f27d26]/40">
                      Tier: {sponsor.tributeTier}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-[#fcf8f5] font-cinzel">{sponsor.brandName}</h4>
                  <div className="text-xs text-[#ffaa5e]/80 font-mono">{sponsor.tagline}</div>
                  <div className="text-xs text-[#d5c8be] bg-[#140b07] p-3 rounded-lg border border-[#f27d26]/15 font-mono leading-relaxed">
                    <strong className="text-[#ffaa5e]">Prop Specs: </strong>{sponsor.propFabricationNotes}
                  </div>
                </div>

                <div className="text-xs text-[#b8aba0] bg-[#140b07]/60 p-2.5 rounded-lg border border-[#f27d26]/15 mt-2 font-mono">
                  <em>"{sponsor.commercialDialogue}"</em>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
