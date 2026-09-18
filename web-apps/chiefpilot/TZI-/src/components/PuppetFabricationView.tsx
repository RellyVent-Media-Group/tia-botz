import React, { useState } from "react";
import { PuppetFabricationPlan } from "../types";
import { ROYAL_RHINO_FABRICATION, VOICE_RECORDING_SIDES, PROP_INVENTORY } from "../data/puppetFabricationData";
import { Scissors, Hammer, Sparkles, Film, Mic, Package, Lightbulb, Settings, PlayCircle } from "lucide-react";

export const PuppetFabricationView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"fabrication" | "lighting" | "voice" | "inventory">("fabrication");
  const [selectedShot, setSelectedShot] = useState<number>(0);

  const tabConfig = [
    { id: "fabrication" as const, label: "Puppet Fabrication", icon: Hammer },
    { id: "lighting" as const, label: "Lighting Plot", icon: Lightbulb },
    { id: "voice" as const, label: "Voice Recording", icon: Mic },
    { id: "inventory" as const, label: "Prop Inventory", icon: Package },
  ];

  const fabrication = ROYAL_RHINO_FABRICATION;

  return (
    <div className="min-h-screen space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-[#f27d26] to-[#d94600] shadow-[0_0_30px_rgba(242,125,38,0.3)]">
            <Hammer className="w-6 h-6 text-[#0a0502]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Puppet Fabrication Workshop
            </h1>
            <p className="text-xs text-[#96897e] font-mono mt-1">
              ROYAL RHINO MK.III CEREMONIAL TOTEM // STOP-MOTION PRODUCTION PIPELINE
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-[#b8aba0] font-mono">
          <span className="px-2 py-1 bg-[#f27d26]/10 rounded border border-[#f27d26]/20">24 FPS</span>
          <span className="px-2 py-1 bg-emerald-950/20 rounded border border-emerald-500/20">180° SHUTTER</span>
          <span className="px-2 py-1 bg-amber-950/20 rounded border border-amber-500/20">3200K TUNGSTEN</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 overflow-x-auto pb-2 scrollbar-none">
        {tabConfig.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#f27d26] text-[#0a0502] font-bold shadow-[0_0_15px_rgba(242,125,38,0.3)]"
                  : "text-[#b8aba0] hover:text-white hover:bg-[#1f110a]/80 border border-transparent hover:border-[#f27d26]/30"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-[#0a0502]" : "text-[#f27d26]"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column - Puppet Specs */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#160c07]/80 rounded-2xl border border-[#f27d26]/10 p-4 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-4 h-4 text-[#f27d26]" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Royal Rhino Mk.III Specifications
              </h3>
            </div>
            
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[#96897e] mb-1">Scale</p>
                  <p className="font-mono text-[#e0d8d0] bg-[#2a180f] px-2 py-1 rounded">{fabrication.scale}</p>
                </div>
                <div>
                  <p className="text-[#96897e] mb-1">Armature</p>
                  <p className="font-mono text-[#e0d8d0] bg-[#2a180f] px-2 py-1 rounded">{fabrication.armatureType}</p>
                </div>
              </div>

              <div className="border-t border-[#f27d26]/10 pt-4">
                <h4 className="text-[#f27d26] font-semibold mb-3 uppercase tracking-wider text-[10px]">
                  Glow Mechanism
                </h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-[#96897e] mb-1">Power Source</p>
                    <p className="font-mono text-[#e0d8d0] bg-[#2a180f] px-2 py-1 rounded text-[11px]">{fabrication.glowMechanism.powerSource}</p>
                  </div>
                  <div>
                    <p className="text-[#96897e] mb-1">Fiber Optics</p>
                    <p className="font-mono text-[#e0d8d0] bg-[#2a180f] px-2 py-1 rounded text-[11px]">{fabrication.glowMechanism.fiberOptics}</p>
                  </div>
                  <div>
                    <p className="text-[#96897e] mb-1">Luminescent Resin</p>
                    <p className="font-mono text-[#e0d8d0] bg-[#2a180f] px-2 py-1 rounded text-[11px]">{fabrication.glowMechanism.luminescentResin}</p>
                  </div>
                  <div>
                    <p className="text-[#96897e] mb-1">Fade Testing</p>
                    <p className="font-mono text-[#e0d8d0] bg-[#2a180f] px-2 py-1 rounded text-[11px]">{fabrication.glowMechanism.fadeTesting}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Lighting Controls */}
          <div className="bg-[#160c07]/80 rounded-2xl border border-[#f27d26]/10 p-4 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Lighting Configuration
              </h3>
            </div>
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[#96897e] mb-1">Key Light</p>
                  <p className="font-mono text-amber-300 bg-amber-950/30 px-2 py-1 rounded text-[10px]">{fabrication.lightingPlot.keyLight}</p>
                </div>
                <div>
                  <p className="text-[#96897e] mb-1">Fill Light</p>
                  <p className="font-mono text-amber-300 bg-amber-950/30 px-2 py-1 rounded text-[10px]">{fabrication.lightingPlot.fillLight}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[#96897e] mb-1">Rim Light</p>
                  <p className="font-mono text-cyan-300 bg-cyan-950/30 px-2 py-1 rounded text-[10px]">{fabrication.lightingPlot.rimLight}</p>
                </div>
              </div>
              <div className="border-t border-[#f27d26]/10 pt-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-[#96897e] mb-1">Frame Rate</p>
                    <p className="font-mono text-[#e0d8d0] bg-[#2a180f] px-2 py-1 rounded">{fabrication.lightingPlot.frameRate} FPS</p>
                  </div>
                  <div>
                    <p className="text-[#96897e] mb-1">Shutter Angle</p>
                    <p className="font-mono text-[#e0d8d0] bg-[#2a180f] px-2 py-1 rounded">{fabrication.lightingPlot.shutterAngle}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center Column - Shot List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[#160c07]/80 rounded-2xl border border-[#f27d26]/10 p-4 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
            <div className="flex items-center gap-2 mb-4">
              <Film className="w-4 h-4 text-[#f27d26]" />
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                Shot List & Animation Beats
              </h3>
            </div>
            
            <div className="space-y-3">
              {fabrication.shotListBeats.map((shot, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedShot(index)}
                  className={`w-full p-3 rounded-xl text-left transition-all border ${
                    selectedShot === index
                      ? "border-[#f27d26] bg-[#f27d26]/5 ring-1 ring-[#f27d26]"
                      : "border-transparent hover:border-[#f27d26]/30 hover:bg-[#1f110a]/80"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`font-mono text-xs ${
                      selectedShot === index ? "text-[#f27d26]" : "text-[#96897e]"
                    }`}>
                      {shot.sceneNum}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-[12px] ${
                        selectedShot === index ? "text-white" : "text-[#b8aba0]"
                      }`}>
                        {shot.shotType}
                      </p>
                      <p className="text-[11px] text-[#96897e] mt-0.5 line-clamp-1">
                        {shot.lightingCue}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Shot Details */}
          {selectedShot < fabrication.shotListBeats.length && (
            <div className="bg-[#160c07]/80 rounded-2xl border border-[#f27d26]/10 p-4 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-2 mb-4">
                <PlayCircle className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Selected: {fabrication.shotListBeats[selectedShot].sceneNum}
                </h3>
              </div>
              
              <div className="space-y-4 text-xs">
                <div>
                  <p className="text-[#96897e] mb-1 uppercase tracking-wider">Lighting Cue</p>
                  <p className="font-mono text-[#e0d8d0] bg-[#2a180f] px-2 py-1 rounded">{fabrication.shotListBeats[selectedShot].lightingCue}</p>
                </div>
                <div>
                  <p className="text-[#96897e] mb-1 uppercase tracking-wider">Puppet Movement</p>
                  <p className="font-mono text-[#e0d8d0] bg-[#2a180f] px-2 py-1 rounded">{fabrication.shotListBeats[selectedShot].puppetMovement}</p>
                </div>
                <div>
                  <p className="text-[#96897e] mb-1 uppercase tracking-wider">Audio Cue</p>
                  <p className="font-mono text-[#e0d8d0] bg-[#2a180f] px-2 py-1 rounded">{fabrication.shotListBeats[selectedShot].audioCue}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Voice & Props */}
        <div className="lg:col-span-1 space-y-4">
          {activeTab === "voice" ? (
            <div className="bg-[#160c07]/80 rounded-2xl border border-[#f27d26]/10 p-4 shadow-[0_0_20px_rgba(0,0,0,0.3)] h-full">
              <div className="flex items-center gap-2 mb-4">
                <Mic className="w-4 h-4 text-[#f27d26]" />
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Harlan & Rojas Voice Sides
                </h3>
              </div>
              <div className="bg-[#0a0502] rounded-xl p-4 font-mono text-[11px] text-[#e0d8d0] overflow-y-auto h-[400px]">
                <pre className="whitespace-pre-wrap">{VOICE_RECORDING_SIDES.harlanAndRojas}</pre>
              </div>
              <div className="flex items-center gap-2 mt-4 text-[10px] text-[#96897e]">
                <Settings className="w-3 h-3" />
                <span>Voice Pitch: Standard | Speed: 1.0x | Style: Broadcast News</span>
              </div>
            </div>
          ) : activeTab === "inventory" ? (
            <div className="bg-[#160c07]/80 rounded-2xl border border-[#f27d26]/10 p-4 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                  Prop Inventory
                </h3>
              </div>
              <div className="space-y-3">
                {PROP_INVENTORY.map((prop, index) => (
                  <div key={index} className="p-3 rounded-xl bg-[#0a0502]/80 border border-[#f27d26]/10">
                    <div className="flex items-start gap-3">
                      <span className="font-mono text-[#f27d26] text-xs">{prop.itemCode}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white">{prop.name}</p>
                        <p className="text-[11px] text-[#96897e] line-clamp-1">{prop.materials}</p>
                        <p className="text-[10px] text-[#b8aba0] mt-1">{prop.location}</p>
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                        prop.status === "Ready for Shoot" 
                          ? "bg-emerald-950/30 text-emerald-300 border border-emerald-500/30"
                          : prop.status === "Vault Secure"
                          ? "bg-amber-950/30 text-amber-300 border border-amber-500/30"
                          : "bg-[#2a180f] text-[#b8aba0] border border-[#f27d26]/10"
                      }`}>
                        {prop.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-[#160c07]/80 rounded-2xl border border-[#f27d26]/10 p-4 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {activeTab === "fabrication" ? "Fabrication Notes" : "Lighting Notes"}
              </h3>
              <div className="space-y-3 text-xs text-[#b8aba0]">
                <p>
                  The Royal Rhino Mk.III represents the pinnacle of Temenos-infused stop-motion craftsmanship.
                  Each component is designed for both visual fidelity and alchemical resonance.
                </p>
                <p className="text-[#96897e]">
                  The glow mechanism integrates Strontium Aluminate phosphors with precision fiber optics,
                  creating a self-luminous puppet that requires no external lighting for certain sequences.
                </p>
                <p className="text-[#96897e]">
                  All movement is controlled via CNC-milled ball-and-socket joints with magnetic tie-downs,
                  allowing for frame-perfect animation with minimal drift.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Studio Control Footer */}
      <div className="border-t border-[#f27d26]/10 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs font-mono text-[#8a7c72]">
            <span className="flex items-center gap-1.5">
              <Scissors className="w-3.5 h-3.5 text-[#f27d26]" />
              FABRICATION WORKSHOP
            </span>
            <span className="text-[#3d2417]">|</span>
            <span className="flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              ARRI SKYPANEL x3
            </span>
            <span className="text-[#3d2417]">|</span>
            <span className="flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-[#f27d26]" />
              VOICE RECORDING BOOTH B
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button className="px-4 py-2 rounded-xl bg-[#f27d26]/10 border border-[#f27d26]/20 text-[#f27d26] text-xs font-medium hover:bg-[#f27d26]/20 transition-colors">
              Export Shot List
            </button>
            <button className="px-4 py-2 rounded-xl bg-[#f27d26] text-[#0a0502] text-xs font-bold hover:bg-[#e65c00] transition-colors shadow-[0_0_15px_rgba(242,125,38,0.3)]">
              Render Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
