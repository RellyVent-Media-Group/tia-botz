/**
 * Heart Calendar System (Zori Calendar)
 * 13 months, each with exactly 28.0 days
 * Year starts in month "Zori" on May 21
 *
 * Reconciled from Z_Heart.mdown's zori_calendar.json fragment — that source
 * had unquoted keys, a trailing comma, and an unmatched apostrophe inside
 * 'Qart'ng'. Values are unchanged; only the syntax is corrected here so it
 * type-checks. This supersedes the earlier 12-month version (which used
 * "March 21" and omitted Bryan/Byron/Terrell).
 */

export type SeasonalTagType = 'equinox' | 'solstice' | 'causing' | 'effecting';

export interface SeasonalTag {
  type: SeasonalTagType;
  name: string;
}

export interface HeartMonth {
  name: string;
  days: number;
  startDate?: string; // Gregorian date when the year begins (Zori only)
  seasonalTag?: SeasonalTag;
}

export interface HeartDate {
  year: number;
  month: HeartMonth;
  day: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  heartDate: HeartDate;
  gregorianDate?: Date;
  type?: 'soul_day' | 'award' | 'special' | 'production';
  relatedSoulId?: string;
}

// Zori Calendar months (13 × 28.0 days), in canonical order
export const HEART_CALENDAR: HeartMonth[] = [
  { name: 'Zori', days: 28.0, startDate: 'May 21', seasonalTag: { type: 'equinox', name: 'Glamour-Shine' } },
  { name: 'Malia', days: 28.0 },
  { name: 'Bryan', days: 28.0 },
  { name: 'Jasmyne', days: 28.0, seasonalTag: { type: 'solstice', name: 'Glamour-Bean' } },
  { name: 'Matteo', days: 28.0 },
  { name: 'Olivia', days: 28.0 },
  { name: 'Jessica', days: 28.0, seasonalTag: { type: 'equinox', name: 'Glamour-Shine' } },
  { name: 'Byron', days: 28.0 },
  { name: 'Brandon', days: 28.0 },
  { name: 'Emahney', days: 28.0, seasonalTag: { type: 'solstice', name: 'Glamour-Bean' } },
  { name: 'Reyna', days: 28.0 },
  { name: 'Justin', days: 28.0, seasonalTag: { type: 'causing', name: "Qart'ng" } },
  { name: 'Terrell', days: 28.0, seasonalTag: { type: 'effecting', name: "Weel'ng" } },
];

// Calendar constants
export const MONTHS_PER_YEAR = 13;
export const DAYS_PER_MONTH = 28.0;
export const DAYS_PER_YEAR = MONTHS_PER_YEAR * DAYS_PER_MONTH; // 364.0

// Sample events from Google Calendar import
// These represent production calendar events mapped to the Heart Calendar system
export const SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: "evt-001",
    title: "Justice Jams the Cane Corso's Primal Connect",
    description: "PRIMAL on Snapchat. Chaos fuels the order in every post. Ledger: Double-entry value: +1 submission to the empire.",
    heartDate: { year: 2026, month: HEART_CALENDAR[0], day: 1 },
    gregorianDate: new Date("2026-04-10T09:00:00"),
    type: "production",
  },
  {
    id: "evt-002",
    title: "Justice Jams the Cane Corso's Primal Seduce",
    description: "POWER on SwingTowns. Chaos fuels the order in every post.",
    heartDate: { year: 2026, month: HEART_CALENDAR[0], day: 2 },
    gregorianDate: new Date("2026-04-10T09:00:00"),
    type: "production",
  },
  {
    id: "evt-003",
    title: "Justice Jams the Cane Corso's Primal Seduce",
    description: "DOM on Instagram. Chaos fuels the order in every post.",
    heartDate: { year: 2026, month: HEART_CALENDAR[0], day: 3 },
    gregorianDate: new Date("2026-04-10T09:00:00"),
    type: "production",
  },
  {
    id: "evt-004",
    title: "Justice Jams the Cane Corso's Primal Tease",
    description: "HUMILIATION on Reddit. Chaos fuels the order in every post.",
    heartDate: { year: 2026, month: HEART_CALENDAR[0], day: 4 },
    gregorianDate: new Date("2026-04-10T09:00:00"),
    type: "production",
  },
  {
    id: "evt-005",
    title: "Justice Jams the Cane Corso's Primal Reveal",
    description: "BBC on AFF. Chaos fuels the order in every post.",
    heartDate: { year: 2026, month: HEART_CALENDAR[0], day: 5 },
    gregorianDate: new Date("2026-04-10T09:00:00"),
    type: "production",
  },
  {
    id: "evt-006",
    title: "Justice Jams the Cane Corso's Primal Tease",
    description: "PRIMAL on FetLife. Chaos fuels the order in every post.",
    heartDate: { year: 2026, month: HEART_CALENDAR[0], day: 6 },
    gregorianDate: new Date("2026-04-10T09:00:00"),
    type: "production",
  },
  {
    id: "evt-007",
    title: "Justice Jams the Cane Corso's Primal Connect",
    description: "TEASE on Pornhub. Chaos fuels the order in every post.",
    heartDate: { year: 2026, month: HEART_CALENDAR[0], day: 7 },
    gregorianDate: new Date("2026-04-10T09:00:00"),
    type: "production",
  },
  {
    id: "evt-008",
    title: "Justice Jams the Cane Corso's Primal Tease",
    description: "DOM on XHamster. Chaos fuels the order in every post.",
    heartDate: { year: 2026, month: HEART_CALENDAR[0], day: 8 },
    gregorianDate: new Date("2026-04-10T09:00:00"),
    type: "production",
  },
  {
    id: "evt-009",
    title: "Justice Jams the Cane Corso's Primal Explore",
    description: "BBC on XVideos. Chaos fuels the order in every post.",
    heartDate: { year: 2026, month: HEART_CALENDAR[0], day: 9 },
    gregorianDate: new Date("2026-04-10T09:00:00"),
    type: "production",
  },
  {
    id: "evt-010",
    title: "Justice Jams the Cane Corso's Primal Seduce",
    description: "HUMILIATION on Twitter. Chaos fuels the order in every post.",
    heartDate: { year: 2026, month: HEART_CALENDAR[0], day: 10 },
    gregorianDate: new Date("2026-04-10T09:00:00"),
    type: "production",
  },
];
