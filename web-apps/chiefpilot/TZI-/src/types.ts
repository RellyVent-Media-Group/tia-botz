/**
 * ChiefPilot v3 / Gilded Mirrors Universe Types
 */

export type WorkstreamType =
  | "universe-bible"
  | "character-bible"
  | "pilot-production"
  | "puppet-fabrication"
  | "fake-news-desk"
  | "shadow-engine"
  | "ai-content-pipeline"
  | "project-backlog"
  | "screening-room"
  | "zu-depots"
  | "prompt-vault";

export interface SoulEntity {
  id: string;
  name: string;
  archetype: string;
  rarity: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary" | "Mythic";
  element: "Aether" | "Void" | "Sol" | "Luna" | "Terra" | "Ignis" | "Aqua" | "Aer";
  title: string;
  bio: string;
  personaTraits: string[];
  shadowTraits: string[];
  shadowPolarityScore: number; // 0 to 100
  consciousDialogueStage: "Unconscious" | "Nigredo" | "Albedo" | "Citrinitas" | "Rubedo";
  preferredPlatforms: string[];
  tributeRevenue: number;
  voiceProfile: {
    voiceName: "Puck" | "Charon" | "Kore" | "Fenrir" | "Zephyr";
    pitch: number;
    speed: number;
    speakingStyle: string;
  };
  promptTemplate: string;
  temenosPractice: string;
  avatarSeed: string;
}

export interface CharacterSheet {
  id: string;
  name: string;
  role: string;
  category: "Anchor" | "Correspondent" | "Muppet / Puppet" | "Shadow Entity" | "Zu Executive";
  performerVoice: string;
  visualDesign: string;
  fabricationSpecs?: {
    scale: string;
    armature: string;
    materials: string[];
    lightingRequirements: string;
    glowFeature?: string;
  };
  narrativeArc: string;
  keyQuotes: string[];
  audioSidesScript: string;
}

export interface BacklogItem {
  id: string;
  code: string;
  title: string;
  workstream: "Content Production" | "AI Generation" | "Shadow Engine" | "Technical Infra" | "Fabrication & Lighting" | "News & Lore";
  status: "Backlog" | "In Progress" | "Review" | "Completed" | "Blocked";
  priority: "Critical" | "High" | "Medium" | "Low";
  assignee: string;
  estimatedHours: number;
  completionPercentage: number;
  dependencies: string[];
  deliverableFile: string;
  notes: string;
}

export interface FakeNewsStory {
  id: string;
  headline: string;
  outlet: string;
  category: "Breaking" | "Conspiracy" | "Financial Tribute" | "Dimensional Drift" | "Celebrity Puppets";
  anchorA_Line: string; // Harlan
  anchorB_Line: string; // Rojas
  lowerThirdText: string;
  tickerHeadline: string;
  sponsorSlug: string;
  socialCutScript: string;
  loreLedgerRef: string;
}

export interface SponsorEntry {
  id: string;
  brandName: string;
  tagline: string;
  productType: string;
  fictionalSector: string;
  propFabricationNotes: string;
  commercialDialogue: string;
  tributeTier: "Bronze" | "Silver" | "Gold" | "Obsidian Zu";
}

export interface UniverseRoom {
  id: number;
  name: string;
  symbol: string;
  alchemicalPrinciple: string;
  description: string;
  visualAtmosphere: string;
  loreSecrets: string[];
  rulingDepot: string;
}

export interface ZuDepot {
  code: string;
  title: string;
  depotType: "Private Facing" | "Public Facing" | "Oracle" | "Estate" | "Media";
  leadership: string;
  descendantsRole: string;
  consortsOrScribes: string[];
  zuInitiatives: string[];
  tributeFlow: string;
}

export interface PuppetFabricationPlan {
  puppetName: string;
  scale: string;
  armatureType: string;
  glowMechanism: {
    powerSource: string;
    fiberOptics: string;
    luminescentResin: string;
    fadeTesting: string;
  };
  lightingPlot: {
    keyLight: string;
    fillLight: string;
    rimLight: string;
    gelColorTemp: string;
    frameRate: number;
    shutterAngle: string;
  };
  shotListBeats: {
    sceneNum: string;
    shotType: string;
    lightingCue: string;
    puppetMovement: string;
    audioCue: string;
  }[];
}

export interface ShadowDialogueTurn {
  speaker: "Persona" | "Shadow" | "Synthesizer";
  message: string;
  timestamp: string;
}
