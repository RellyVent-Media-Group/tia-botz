/**
 * souls-registry.ts
 *
 * Typed registry of the Gobblers Knob universe's named cast, sourced
 * directly from THE_31_SOULS_CAST_BIBLE.md. This gives `relatedSoulId`
 * on CalendarEvent a real, checkable set of values instead of an
 * unconstrained string.
 *
 * DELIBERATELY EXCLUDED (per the Cast Bible's own notes, not an oversight):
 *   - "Dr. Johnson": listed once as a Tier 1 host, no bio anywhere in
 *     canon. Add him here once a decision is made to write one.
 *   - "Chip Wobblejaw": explicitly "held in reserve, not yet canon" per
 *     a Muppet Lab crossover note.
 *
 * 17 of the 31 total souls are individually named below (the 7 on-camera/
 * production humans + the Royal Rhino + 8 named Smurch). The remaining
 * 14 are unnamed background Assembly (2 Research Shed interns treated as
 * a pair, plus 16 unnamed Smurch minus the... see note at bottom for the
 * exact accounting) -- add entries here as spotlight bios get written.
 */

export type SoulCategory =
  | 'on_camera_talent'
  | 'the_royal_rhino'
  | 'research_shed'
  | 'control_booth'
  | 'continuity_police'
  | 'smurch_sentenniel';

export type SmurchCrew = 'Alpha' | 'Bravo' | 'Charlie' | 'Delta';

export interface Soul {
  id: string;             // slug, used as relatedSoulId
  name: string;
  category: SoulCategory;
  role: string;
  crew?: SmurchCrew;       // only set for Smurch Sentenniel members
  castNumber: number;      // # from THE_31_SOULS_CAST_BIBLE.md, for cross-reference
}

export const SOULS: Soul[] = [
  // On-camera talent
  { id: 'oliver-hardwood', name: 'Oliver Hardwood', category: 'on_camera_talent', role: 'Lead Critic, Curator of the Gazette', castNumber: 1 },
  { id: 'scarlett-st-clair', name: 'Scarlett St. Clair', category: 'on_camera_talent', role: 'Co-Host, Voice of Institutional Memory', castNumber: 2 },
  { id: 'vinny', name: 'Vinny', category: 'on_camera_talent', role: 'Academic Critic, Gazette Guest Columnist', castNumber: 3 },
  { id: 'madame-quill', name: 'Madame Quill', category: 'on_camera_talent', role: 'Guest Marginalia Columnist', castNumber: 4 },
  { id: 'gary-the-intern', name: 'Gary the Intern', category: 'on_camera_talent', role: 'Perpetual Underdog', castNumber: 5 },

  // The Royal Rhino
  { id: 'royal-rhino', name: 'The Royal Rhino', category: 'the_royal_rhino', role: 'Living Statuette, Sovereign of Critical Verdicts', castNumber: 7 },

  // Research Shed C / Academic Annex
  { id: 'dr-penrose-halliday', name: 'Dr. Penrose Halliday', category: 'research_shed', role: 'Head of Research Shed C', castNumber: 8 },

  // Control Booth / Production Staff
  { id: 'desk-two-dana', name: 'Desk Two Dana', category: 'control_booth', role: 'Control Booth Desk 2 Operator', castNumber: 10 },

  // Continuity Police
  { id: 'chief-marchetti', name: 'Chief Marchetti', category: 'continuity_police', role: 'Head of the Continuity Police', castNumber: 11 },

  // Smurch Sentenniel -- Crew Alpha
  { id: 'blotch', name: 'Blotch', category: 'smurch_sentenniel', role: 'Crew Lead, Rigging & Repair', crew: 'Alpha', castNumber: 12 },
  { id: 'torque', name: 'Torque', category: 'smurch_sentenniel', role: "Blotch's second", crew: 'Alpha', castNumber: 13 },

  // Smurch Sentenniel -- Crew Bravo
  { id: 'glisten', name: 'Glisten', category: 'smurch_sentenniel', role: 'Vintage & Assessment lead', crew: 'Bravo', castNumber: 18 },
  { id: 'dabber', name: 'Dabber', category: 'smurch_sentenniel', role: "Glisten's apprentice", crew: 'Bravo', castNumber: 19 },

  // Smurch Sentenniel -- Crew Charlie
  { id: 'ledger', name: 'Ledger', category: 'smurch_sentenniel', role: 'Continuity & Compliance lead', crew: 'Charlie', castNumber: 24 },
  { id: 'nub', name: 'Nub', category: 'smurch_sentenniel', role: "Ledger's second", crew: 'Charlie', castNumber: 25 },

  // Smurch Sentenniel -- Crew Delta
  { id: 'sarge', name: 'Sarge', category: 'smurch_sentenniel', role: 'Envelope & Logistics lead', crew: 'Delta', castNumber: 30 },
  { id: 'wick', name: 'Wick', category: 'smurch_sentenniel', role: "The Sentenniel's mystic", crew: 'Delta', castNumber: 31 },
];

export function getSoul(id: string): Soul | undefined {
  return SOULS.find((s) => s.id === id);
}

export function soulsByCrew(crew: SmurchCrew): Soul[] {
  return SOULS.filter((s) => s.crew === crew);
}

export function soulsByCategory(category: SoulCategory): Soul[] {
  return SOULS.filter((s) => s.category === category);
}
