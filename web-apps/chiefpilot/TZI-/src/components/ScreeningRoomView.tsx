import React from "react";
import { 
  Tv2, 
  Sparkles, 
  Clock, 
  PlayCircle, 
  FileText, 
  Layers, 
  CheckCircle2 
} from "lucide-react";

export const ScreeningRoomView: React.FC = () => {
  const episodeBeats = [
    {
      time: "00:00",
      title: "Opening 530 Corridor Frequency Alert",
      description: "Static burst over the 7 Rooms transmission grid. Harlan Vance prepares the teleprompter.",
      lighting: "3200K Tungsten Key with 5600K CTB rim light.",
    },
    {
      time: "01:15",
      title: "Harlan & Rojas Teleprompter Glitch",
      description: "Rojas Bell screams about the unmined gold in the shadow while Harlan dryly reads the Niiji REIT commercial.",
      lighting: "45-degree diffused softbox on felt fabric puppet armature.",
    },
    {
      time: "02:40",
      title: "The Royal Rhino Phosphor Test",
      description: "Practical glow test in the stop-motion dark stage. 395nm UV light charges the strontium aluminate horn.",
      lighting: "Total stage blackout with internal fiber-optic 540nm amber emission.",
    },
    {
      time: "04:10",
      title: "Zu Depots & Economic Tribute Ceremony",
      description: "The 3x under-18 descendant interns log tribute deposits into the Self-Originating Ledger under Hermetic Rhythm.",
      lighting: "Warm amber wash (2800K bounce).",
    },
    {
      time: "05:45",
      title: "Temenos Coronation & Alchemical Rubedo",
      description: "Conscious reconciliation of the Persona and Shadow. Endus Boverord yields to self-originating craft.",
      lighting: "Golden solar backlight with atmospheric hazing.",
    },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-[#140b07] via-[#1a0f09] to-[#261309]/60 border border-[#f27d26]/30 rounded-2xl p-6 sm:p-8 shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(242,125,38,0.1)] relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#f27d26]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-2 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-[#f27d26]/15 text-[#ffaa5e] border border-[#f27d26]/30 shadow-[0_0_12px_rgba(242,125,38,0.2)]">
            <Tv2 className="w-3.5 h-3.5 text-[#f27d26]" />
            <span>Pilot Screening & Production Dailies</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#fcf8f5] tracking-tight font-cinzel">
            Episode Screening Room & Stop-Motion Director Commentary
          </h1>
          <p className="text-[#c8bbb0] text-sm max-w-3xl leading-relaxed">
            Direct viewing portal for the ChiefPilot Pilot reel and puppet performances synchronized with real-time technical scene markers.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Video Player Frame */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl p-4 sm:p-6 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#f27d26]/15 pb-3 text-xs font-mono">
              <span className="text-[#ffaa5e] font-bold flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-[#f27d26]" />
                PILOT DAILIES REEL // GILDED MIRRORS v3
              </span>
              <span className="text-[#96897e]">HD 1080p // 24 FPS</span>
            </div>

            {/* Embedded Responsive YouTube Iframe */}
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black border border-[#f27d26]/25 shadow-2xl">
              <iframe
                className="w-full h-full absolute inset-0"
                src="https://www.youtube.com/embed/c7NcJjnYQTA?si=DO_B2rwORKzE066L"
                title="ChiefPilot Gilded Mirrors Universe Pilot"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>

            {/* Director Notes */}
            <div className="bg-[#0c0603] p-4 rounded-xl border border-[#f27d26]/20 space-y-2 text-xs font-mono shadow-inner">
              <div className="text-[#ffaa5e] font-bold uppercase flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#f27d26]" />
                Director Notes (TaK$HuN Master Archive)
              </div>
              <p className="text-[#d5c8be] leading-relaxed">
                The pilot captures the tension between the physical puppet armatures (handcrafted clay, aluminum ball-joints, strontium aluminate horn) 
                and the self-originating mythos of the 501(c)(8) Zu Fraternal structure. 
                Pay special attention to the transition at 02:40 where practical lighting switches to UV blacklight.
              </p>
            </div>
          </div>
        </div>

        {/* Synchronized Beat Sheet & Frame Markers */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#140b07]/90 border border-[#f27d26]/20 rounded-2xl p-5 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#f27d26]/15 pb-3">
              <h3 className="text-sm font-bold text-[#fcf8f5] font-cinzel uppercase flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#f27d26]" />
                Scene Beat Markers
              </h3>
              <span className="text-xs font-mono text-[#96897e]">5 Beats</span>
            </div>

            <div className="space-y-3">
              {episodeBeats.map((beat, i) => (
                <div
                  key={i}
                  className="bg-[#0c0603] border border-[#f27d26]/20 rounded-xl p-3.5 space-y-1.5 hover:border-[#f27d26]/50 transition-all shadow-inner"
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[#ffaa5e] font-bold">{beat.time}</span>
                    <span className="text-[#7e7065] text-[10px]">Beat {i + 1}</span>
                  </div>
                  <h4 className="text-xs font-bold text-[#fcf8f5]">{beat.title}</h4>
                  <p className="text-[11px] text-[#d5c8be] font-mono leading-relaxed">{beat.description}</p>
                  <div className="text-[10px] font-mono text-[#ffaa5e] bg-[#24130b] p-2 rounded border border-[#f27d26]/30 mt-1">
                    Lighting: {beat.lighting}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
