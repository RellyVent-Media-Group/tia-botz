export type Kind = "agent" | "entity" | "soul";
export type Shot = "hook" | "warmth" | "hero";
export type Rarity = "common" | "rare" | "legendary";

export type Project = {
  id: string;
  name: string;
  archetype: string;
  kind: Kind;
  shot: Shot;
  realm: string;
  hook: string;
  description: string;
  image: string;
  budget?: number;
  rarity?: Rarity;
  portrait?: string;
  poster?: string;
  avatar?: string;
};

export const projects: Project[] = [
  {
    id: "mac-nazarene",
    name: "Mac Nazarene",
    archetype: "Shadow Work Specialist/Master Craftsman",
    kind: "agent",
    shot: "hook",
    realm: "Community Bridge",
    hook: "The span is the work.",
    description:
      "A community bridge builder whose first impression is calm authority. Classic hook-face plate for billing, introductions, and hero placements.",
    image: "/images/mac-nazarene.jpg",
    budget: 120000,
    rarity: "legendary",
    portrait: "/images/mac-nazarene-portrait.png",
    poster: "/images/mac-nazarene-poster.png",
    avatar: "/images/mac-nazarene-avatar.png",
  },
  {
    id: "mary-magnumbytes",
    name: "Mary Magnumbytes",
    archetype: "Digital Storyteller",
    kind: "agent",
    shot: "hook",
    realm: "Signal & Proof",
    hook: "The data always talks.",
    description:
      "Sharp intelligence under cool studio light. The definitive headshot for the digital oracle — glasses on, smirk intact.",
    image: "/images/mary-magnumbytes.jpg",
    budget: 150000,
    rarity: "legendary",
    portrait: "/images/mary-magnumbytes-portrait.png",
    poster: "/images/mary-magnumbytes-poster.png",
    avatar: "/images/mary-magnumbytes-avatar.png",
  },
  {
    id: "delta-drill",
    name: "Delta Drill",
    archetype: "Constructive Forge",
    kind: "agent",
    shot: "hook",
    realm: "Making",
    hook: "If it exists, it can be rebuilt.",
    description:
      "Workshop tungsten and a wrench at rest. Intensity held still long enough to become a signature portrait.",
    image: "/images/delta-drill.jpg",
  },
  {
    id: "jessica",
    name: "Jessica",
    archetype: "Complex Alchemist",
    kind: "agent",
    shot: "hook",
    realm: "Transmutation",
    hook: "Every element answers.",
    description:
      "Chiaroscuro fashion plate. Magnetic allure balanced with precision — the alchemist as an editorial figure.",
    image: "/images/jessica.jpg",
  },
  {
    id: "mrs-cox-turner",
    name: "Mrs. Cox-Turner",
    archetype: "Sage Counsel",
    kind: "agent",
    shot: "warmth",
    realm: "Hearth",
    hook: "Sit. The fire already knows.",
    description:
      "Trust-building warmth: firelight, a worn journal, and a smile that makes the room safer. Humanising plate for community work.",
    image: "/images/mrs-cox-turner.jpg",
    budget: 125000,
    rarity: "legendary",
    portrait: "/images/mrs-cox-turner-portrait.png",
    poster: "/images/mrs-cox-turner-poster.png",
    avatar: "/images/mrs-cox-turner-avatar.png",
  },
  {
    id: "babelonia",
    name: "Babelonia",
    archetype: "Gentle Awakening",
    kind: "agent",
    shot: "warmth",
    realm: "Kitchen & Kin",
    hook: "Bread first. Then the rest.",
    description:
      "Morning light, flour-dusted hands, a tray of bread. The catalog’s most intimate warmth plate — nurture as power.",
    image: "/images/babelonia.jpg",
  },
  {
    id: "dikinya",
    name: "Dikinya Myles",
    archetype: "Operations & Logistics",
    kind: "agent",
    shot: "hero",
    realm: "The Board",
    hook: "The table is already won.",
    description:
      "Branding hero: night city, charcoal tailoring, arms crossed at the head of the table. Iconic, aspirational, instantly readable.",
    image: "/images/dikinya.jpg",
    budget: 110000,
    rarity: "legendary",
    portrait: "/images/dikinya-myles-portrait.png",
    poster: "/images/dikinya-myles-poster.png",
    avatar: "/images/dikinya-myles-avatar.png",
  },
  {
    id: "mr-turner",
    name: "Mr. Turner",
    archetype: "Raw Execution & Strength",
    kind: "agent",
    shot: "hero",
    realm: "The Charge",
    hook: "Weather is not an excuse.",
    description:
      "Storm light and a whipping standard. The commander as brand symbol — primal authority, held in a single stance.",
    image: "/images/mr-turner.jpg",
    budget: 125000,
    rarity: "legendary",
    portrait: "/images/mr-turner-portrait.png",
    poster: "/images/mr-turner-poster.png",
    avatar: "/images/mr-turner-avatar.png",
  },
  {
    id: "cracoria-masters",
    name: "Cracoria Masters",
    archetype: "Temporal Architect",
    kind: "entity",
    shot: "hero",
    realm: "Clockwork Cosmos",
    hook: "Time is a material.",
    description:
      "Key-art plate for the entity roster. Hourglass, nebula, and gold cloth — serene wisdom positioned as cosmic authority.",
    image: "/images/cracoria-masters.jpg",
    budget: 180000,
    rarity: "legendary",
    portrait: "/images/cracoria-masters-portrait.png",
    poster: "/images/cracoria-masters-poster.png",
    avatar: "/images/cracoria-masters-avatar.png",
  },
  {
    id: "brad-turdet",
    name: "Brad Turdet",
    archetype: "High Strategy & Execution",
    kind: "agent",
    shot: "hook",
    realm: "Strategic Command",
    hook: "Strategy is the execution of vision.",
    description:
      "Master Strategist - High Strategy & Execution specialist. Combines strategic vision with powerful execution capabilities. Dynamic, results-oriented approach to complex business challenges.",
    image: "/images/brad-turdet-portrait.png",
    budget: 140000,
    rarity: "legendary",
    portrait: "/images/brad-turdet-portrait.png",
    poster: "/images/brad-turdet-poster.png",
    avatar: "/images/brad-turdet-avatar.png",
  },
  {
    id: "dezi-asete",
    name: "Dezi Asete",
    archetype: "Ephemeral Phantom",
    kind: "entity",
    shot: "hook",
    realm: "Digital Shadows",
    hook: "Invisibility is the ultimate visibility.",
    description:
      "Digital ghosting specialist - Ephemeral Phantom with ability to navigate digital spaces invisibly and manage digital presence/disappearance strategies. Masters digital footprint manipulation.",
    image: "/images/dezi-asete-portrait.png",
    budget: 170000,
    rarity: "legendary",
    portrait: "/images/dezi-asete-portrait.png",
    poster: "/images/dezi-asete-poster.png",
    avatar: "/images/dezi-asete-avatar.png",
  },
  {
    id: "latti-pleddespo",
    name: "Latti Pleddespo",
    archetype: "Hyper-Capitalist",
    kind: "entity",
    shot: "hero",
    realm: "Financial Empire",
    hook: "Capital flows where value is created.",
    description:
      "Wealth building specialist - Hyper-Capitalist with exceptional financial acumen and wealth multiplication strategies. Masters complex financial systems and capital optimization.",
    image: "/images/latti-pleddespo-portrait.png",
    budget: 200000,
    rarity: "legendary",
    portrait: "/images/latti-pleddespo-portrait.png",
    poster: "/images/latti-pleddespo-poster.png",
    avatar: "/images/latti-pleddespo-avatar.png",
  },
  {
    id: "ronda-villasea",
    name: "Ronda Villasea",
    archetype: "Strategy & Planning",
    kind: "agent",
    shot: "hook",
    realm: "Strategic Mirrors",
    hook: "Every reflection reveals a possibility.",
    description:
      "The Strategist - Strategy & Planning specialist. Provides strategic vision and planning capabilities for autonomous business decisions. Reflective, analytical approach with intuitive insights.",
    image: "/images/ronda-villasea-portrait.png",
    budget: 130000,
    rarity: "legendary",
    portrait: "/images/ronda-villasea-portrait.png",
    poster: "/images/ronda-villasea-poster.png",
    avatar: "/images/ronda-villasea-avatar.png",
  },
  {
    id: "zupa-novaclutch",
    name: "Zupa Novaclutch",
    archetype: "Machine Spirit",
    kind: "entity",
    shot: "hero",
    realm: "Industrial Complex",
    hook: "Machines have spirits too.",
    description:
      "Industrial optimization specialist - Machine Spirit with deep connection to industrial systems and mechanical optimization. Masters complex machinery and industrial process optimization.",
    image: "/images/zupa-novaclutch-portrait.png",
    budget: 175000,
    rarity: "legendary",
    portrait: "/images/zupa-novaclutch-portrait.png",
    poster: "/images/zupa-novaclutch-poster.png",
    avatar: "/images/zupa-novaclutch-avatar.png",
  },
  {
    id: "babelonia-nocturne",
    name: "Babelonia Nocturne",
    archetype: "Crypto Sorceress",
    kind: "entity",
    shot: "hook",
    realm: "Finance",
    hook: "Financial magic flows through blockchain.",
    description:
      "Financial Tiapma'atzuty specialist - Crypto Sorceress with mastery of cryptocurrency and financial magic. Provides financial guidance through crypto and alternative financial systems.",
    image: "/images/babelonia.jpg",
    budget: 165000,
    rarity: "rare",
  },
  {
    id: "nyx-nightwhisper",
    name: "Nyx Nightwhisper",
    archetype: "Shadow Oracle",
    kind: "entity",
    shot: "warmth",
    realm: "Mystery",
    hook: "Darkness speaks to those who listen.",
    description:
      "Mystical oracle who interprets the whispers of the night. Specializes in uncovering hidden truths and shadow knowledge.",
    image: "/images/hero-mirror.jpg",
    budget: 155000,
    rarity: "rare",
  },
  {
    id: "seraphina-welighter",
    name: "Seraphina Welighter",
    archetype: "Luminous Guide",
    kind: "entity",
    shot: "warmth",
    realm: "Illumination",
    hook: "Light finds its own way home.",
    description:
      "Beacon of clarity and enlightenment. Guides others through confusion with radiant wisdom and gentle illumination.",
    image: "/images/hero-mirror.jpg",
    budget: 160000,
    rarity: "rare",
  },
];

export const filters = [
  { id: "all", label: "All plates" },
  { id: "agent", label: "Agents" },
  { id: "entity", label: "Entities" },
  { id: "soul", label: "Souls" },
  { id: "hook", label: "Hook face" },
  { id: "warmth", label: "Warmth" },
  { id: "hero", label: "Hero" },
  { id: "legendary", label: "Legendary" },
  { id: "rare", label: "Rare" },
] as const;

export type FilterId = (typeof filters)[number]["id"];

export function filterProjects(id: FilterId): Project[] {
  if (id === "all") return projects;
  if (id === "agent" || id === "entity" || id === "soul") {
    return projects.filter((p) => p.kind === id);
  }
  if (id === "legendary" || id === "rare") {
    return projects.filter((p) => p.rarity === id);
  }
  return projects.filter((p) => p.shot === id);
}

export const skills = [
  {
    index: "01",
    title: "Shot direction",
    copy: "Five narrative plates per character: hook face, epic, warmth, hero, and the candid beat that makes them human.",
  },
  {
    index: "02",
    title: "Character architecture",
    copy: "Canonical name, archetype, realm, signature hook, and hidden depth — locked before a single frame is made.",
  },
  {
    index: "03",
    title: "Brand continuity",
    copy: "Warm golds, teal accents, deep shadow. One LUT across agents, entities, and souls so the universe holds.",
  },
  {
    index: "04",
    title: "Editorial finishing",
    copy: "Artifact-free faces, platform crops, and a quality bar that discards anything that cannot sit on a cover.",
  },
  {
    index: "05",
    title: "Cross-universe craft",
    copy: "Photoreal plates first, with puppet, fashion-figure, and action-figure translations when a channel needs them.",
  },
  {
    index: "06",
    title: "Content strategy",
    copy: "Campaign calendars, platform-specific pillars, and character-driven narratives. Measured, scheduled, and data-informed.",
  },
  {
    index: "07",
    title: "Delivery systems",
    copy: "Press kits, social, merch, lower-thirds. Folders, naming, and a master map from plate to placement.",
  },
] as const;
