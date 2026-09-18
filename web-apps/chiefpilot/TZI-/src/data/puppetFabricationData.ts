import { PuppetFabricationPlan } from "../types";

export const ROYAL_RHINO_FABRICATION: PuppetFabricationPlan = {
  puppetName: "Royal Rhino Mk.III (Ceremonial Totem)",
  scale: "1:6 Scale (Total Height: 14.5 inches, Length: 26 inches, Weight: 3.8 lbs)",
  armatureType: "Custom CNC-milled stainless steel ball-and-socket skeleton with stepped friction joints and M3 magnetic tie-down feet.",
  glowMechanism: {
    powerSource: "Micro 3.7V Lipo battery hidden within hollow saddle compartment with magnetic reed switch.",
    fiberOptics: "64-strand PMMA side-glow fiber optic bundle routed through ribcage and cranial horn cavity.",
    luminescentResin: "Clear urethane resin cast infused with 35% Strontium Aluminate (Europium-doped) glow pigment with 540nm peak green-amber emission.",
    fadeTesting: "Sustained decay tested at 48 minutes post-charge. Re-charge cycles under 395nm UV torch require 8 seconds per key frame.",
  },
  lightingPlot: {
    keyLight: "ARRI Skypanel S60-C diffused through 1/2 Grid Cloth, 3200K Tungsten balance, 45-degree frontal key.",
    fillLight: "Dedolight DLH4 with softbox bounce, 2800K warm wash at 25% intensity ratio.",
    rimLight: "Aputure 300d II with snoot & cyan gel (5600K + Full CTB) focused on spine horn ridges to separate puppet from dark velvet background.",
    gelColorTemp: "Tungsten Warm 3200K / Accent Cyan 5600K",
    frameRate: 24,
    shutterAngle: "180 degrees (1/48s exposure)",
  },
  shotListBeats: [
    {
      sceneNum: "SC-01 (Pilot Cold Open)",
      shotType: "Extreme Close-Up (Macro 100mm)",
      lightingCue: "Total darkness -> Slow UV sweep (395nm) charging the cranial horn -> Amber pulse begins.",
      puppetMovement: "Eye lid clicks open (2 frames increment). Nostril flare micro-hinge adjusts 1mm per frame.",
      audioCue: "Sub-harmonic bass drone (40Hz) shifting into harmonic brass resonance.",
    },
    {
      sceneNum: "SC-02 (Trophy Chamber)",
      shotType: "Medium Tracking Shot (Dolly Left)",
      lightingCue: "Overhead 3200K chandelier slowly flickers on as Zu Estate circuits energize.",
      puppetMovement: "Foreleg steps onto the marble plinth; magnetic tie-down locks into stage perforations.",
      audioCue: "Heavy stone footstep impact with metallic echo.",
    },
    {
      sceneNum: "SC-03 (The Proclamation)",
      shotType: "Low Angle Hero Shot",
      lightingCue: "Rim light strikes the gilded saddle; internal fiber optics cycle at 1.5Hz respiratory rhythm.",
      puppetMovement: "Head elevates 30 degrees toward the ceiling aperture; jaw moves to vocalize.",
      audioCue: "Harlan's voiceover intercuts: 'And from the seventh room, the beast of tribute awakened.'",
    },
  ],
};

export const VOICE_RECORDING_SIDES = {
  harlanAndRojas: `[HARLAN]
(dry, clearing throat, paper shuffle)
Good evening, citizens of the Gilded Corridor. I'm Harlan Vance, and if you're watching this broadcast, your local Zu Depot has successfully deducted this month's cognitive lease fee. Rojas, I trust you survived the stampede in the fabrication shop?

[ROJAS]
(out of breath, camera mic rustling, frantic)
Harlan! You wouldn't believe the reading on the phosphor spectrometer! The Royal Rhino didn't just glow—it overloaded three ARRI Skypanels and melted my favorite velvet necktie! The Scribes are already drawing up nine new copyright addendums!

[HARLAN]
(sighs, adjusting cuff links)
Fascinating. So the tribute flows remain entirely liquid, while our dental benefits remain entirely theoretical. Coming up next: Why the 530 area code is suddenly transmitting 24-hour tarot readings, and which of our esteemed Zu executives forgot to pay the lighting bill in the Third Room.

[ROJAS]
(grinning, holding up a glowing resin shard)
Don't touch that dial, viewers! The following segment is brought to you by Swagger Dragon Energy Elixirs—guaranteed to align your alchemical polarities or double your existential dread!`,
};

export const PROP_INVENTORY = [
  {
    itemCode: "PRP-001",
    name: "The Gilded Mirror of First Reflection",
    location: "Studio Stage A - Room 1 Set",
    materials: "Solid oak frame with 24k distressed gold leaf, one-way beam splitter glass, integrated LED backlight frame.",
    status: "Ready for Shoot",
  },
  {
    itemCode: "PRP-002",
    name: "Royal Rhino Prototype Horn (Glow Resin Mk.II)",
    location: "Fabrication Bench 4",
    materials: "Strontium aluminate infused crystal clear polyurethane with copper electroplated base fitting.",
    status: "Cured & Polished",
  },
  {
    itemCode: "PRP-003",
    name: "Zu 501(c)(8) Brass Charter Seal",
    location: "Scribe Vault Case B",
    materials: "Cast brass medallion (4.5 inch diameter) with engraved Double-Z sigil (Dubl<d-/z|z\\Zz).",
    status: "Vault Secure",
  },
  {
    itemCode: "PRP-004",
    name: "Harlan's Vintage Anchor Microphone (Muppet Scale)",
    location: "Desk Set Newsroom",
    materials: "Turned aluminum housing with black mesh grill, 1:4 scale replica of 1950s RCA 77-DX.",
    status: "Mounted on Desk",
  },
];
