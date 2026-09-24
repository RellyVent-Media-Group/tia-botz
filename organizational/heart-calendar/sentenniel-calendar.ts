/**
 * sentenniel-calendar.ts
 *
 * The Gobblers Knob universe's own 13x28 production calendar, built on the
 * SAME type system as heart-calendar.ts (HeartMonth / HeartDate /
 * CalendarEvent) so both calendars can feed the same event pipeline without
 * a second parallel type hierarchy.
 *
 * KEY DIFFERENCE FROM THE HEART CALENDAR: this calendar's Day 1 is anchored
 * to the real astronomical spring equinox, which shifts by a day or so
 * year to year -- unlike the Heart Calendar's fixed May 21. That means
 * there's no single hardcoded "start date" here; the caller must supply
 * the actual observed equinox date for whichever year they're working
 * with (see `yearAnchor` parameter below). This mirrors the same design
 * decision made in lunar_calendar.py for the Python side of this system --
 * if the two ever drift out of sync, treat lunar_calendar.py's approach
 * as the reference, since it was built and tested first.
 *
 * Six month names are confirmed from the Brand Bible / Gazette continuity;
 * seven are still DRAFT proposals pending sign-off (see comments below).
 * This is a SEPARATE naming decision from the Heart Calendar's festival
 * names, which were confirmed in the previous step -- don't conflate the
 * two "lock-in" decisions.
 */

import { HeartMonth, HeartDate, CalendarEvent } from './heart-calendar';

export const SENTENNIEL_MONTHS_PER_YEAR = 13;
export const SENTENNIEL_DAYS_PER_MONTH = 28;
export const SENTENNIEL_DAYS_PER_YEAR = SENTENNIEL_MONTHS_PER_YEAR * SENTENNIEL_DAYS_PER_MONTH; // 364

export const SENTENNIEL_CALENDAR: HeartMonth[] = [
  { name: "Apzu's Threshold", days: 28.0 },   // I    - CONFIRMED: New Year, Day 1 = spring equinox
  { name: 'Thawmarch', days: 28.0 },           // II   - DRAFT, unconfirmed
  { name: "Verdant's Wake", days: 28.0 },      // III  - DRAFT, unconfirmed
  { name: 'Sunfire Recess', days: 28.0 },      // IV   - CONFIRMED: Solstice Gala month
  { name: 'Amber Zenith', days: 28.0 },        // V    - DRAFT, unconfirmed
  { name: 'Room of Silence', days: 28.0 },     // VI   - name confirmed; index placement not yet confirmed
  { name: "Reckoning's Balance", days: 28.0 }, // VII  - CONFIRMED: Equinox Gala + Continuity Audit
  { name: "Harvest's Toll", days: 28.0 },      // VIII - DRAFT, unconfirmed
  { name: 'Duskfall Recess', days: 28.0 },     // IX   - DRAFT, unconfirmed
  { name: "Long Night's Gala", days: 28.0 },   // X    - CONFIRMED: Winter Gala month
  { name: 'Rimefast', days: 28.0 },            // XI   - DRAFT, unconfirmed
  { name: "Hollow's Vigil", days: 28.0 },      // XII  - DRAFT, unconfirmed
  { name: 'Illumifluxing', days: 28.0 },       // XIII - CONFIRMED: dark/closing month, precedes New Year
];

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / MS_PER_DAY);
}

/**
 * Convert a Gregorian date to a Sentenniel HeartDate, given the actual
 * observed spring-equinox date (yearAnchor) for that calendar year.
 * Caller-supplied, deliberately -- see file header for why.
 */
export function gregorianToSentennielDate(date: Date, yearAnchor: Date): HeartDate {
  const offset = daysBetween(yearAnchor, date);
  if (offset < 0 || offset >= SENTENNIEL_DAYS_PER_YEAR) {
    throw new RangeError(
      `${date.toISOString().slice(0, 10)} is outside the 364-day Sentenniel year ` +
      `beginning ${yearAnchor.toISOString().slice(0, 10)} (offset=${offset})`
    );
  }
  const monthIndex = Math.floor(offset / SENTENNIEL_DAYS_PER_MONTH);
  const day = (offset % SENTENNIEL_DAYS_PER_MONTH) + 1;
  return {
    year: yearAnchor.getUTCFullYear(),
    month: SENTENNIEL_CALENDAR[monthIndex],
    day,
  };
}

export function sentennielDateToGregorian(heartDate: HeartDate, yearAnchor: Date): Date {
  const monthIndex = SENTENNIEL_CALENDAR.findIndex((m) => m.name === heartDate.month.name);
  if (monthIndex === -1) {
    throw new Error(`Unknown Sentenniel month: ${heartDate.month.name}`);
  }
  const offset = monthIndex * SENTENNIEL_DAYS_PER_MONTH + (heartDate.day - 1);
  return new Date(yearAnchor.getTime() + offset * MS_PER_DAY);
}

// ---------------------------------------------------------------------------
// Gala schedule -- from the earlier calendar-integration pass. Each Gala is
// tied to a real Soul via relatedSoulId (souls-registry.ts) so production
// events can be filtered/queried the same way personal Soul Days are.
// ---------------------------------------------------------------------------

export interface GalaDefinition {
  label: string;
  monthIndex: number;
  dayInMonth: number;
  relatedSoulId: string; // who's the anchor figure for this Gala
}

export const GALA_SCHEDULE: GalaDefinition[] = [
  { label: 'Spring Gala', monthIndex: 0, dayInMonth: 1, relatedSoulId: 'royal-rhino' },
  { label: 'Solstice Gala', monthIndex: 3, dayInMonth: 9, relatedSoulId: 'royal-rhino' },
  { label: 'Equinox Gala', monthIndex: 6, dayInMonth: 18, relatedSoulId: 'ledger' }, // Equinox Gala shares its month with the Continuity Audit -- Ledger's busiest week, per earlier calendar integration notes
  { label: 'Winter Gala', monthIndex: 9, dayInMonth: 24, relatedSoulId: 'royal-rhino' },
];

export function generateGalaEvents(gregorianYearAnchor: Date): CalendarEvent[] {
  return GALA_SCHEDULE.map((gala) => {
    const month = SENTENNIEL_CALENDAR[gala.monthIndex];
    const heartDate: HeartDate = {
      year: gregorianYearAnchor.getUTCFullYear(),
      month,
      day: gala.dayInMonth,
    };
    return {
      id: `gala_${gala.label.toLowerCase().replace(/\s+/g, '_')}_${heartDate.year}`,
      title: gala.label,
      description: `Sovereign Golden Boner Grand Gala -- ${month.name}, Day ${gala.dayInMonth}`,
      heartDate,
      gregorianDate: sentennielDateToGregorian(heartDate, gregorianYearAnchor),
      type: 'award' as const,
      relatedSoulId: gala.relatedSoulId,
    };
  });
}

// ---------------------------------------------------------------------------
// Recurring production events -- Tier 3 Gazette (last Sunday of the month,
// per the Brand Bible -- approximated here to Day 28, the last day of each
// 28-day month, since the Sentenniel calendar doesn't have Gregorian
// weekdays to anchor "last Sunday" against directly).
// ---------------------------------------------------------------------------

export function generateGazetteEvents(gregorianYearAnchor: Date): CalendarEvent[] {
  return SENTENNIEL_CALENDAR.map((month, index) => {
    const heartDate: HeartDate = {
      year: gregorianYearAnchor.getUTCFullYear(),
      month,
      day: SENTENNIEL_DAYS_PER_MONTH, // last day of the month
    };
    return {
      id: `gazette_${month.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${heartDate.year}`,
      title: `Gobblers Knob Gazette -- ${month.name} Issue`,
      description: 'Monthly Lore Ledger publication, curated by Oliver Hardwood.',
      heartDate,
      gregorianDate: sentennielDateToGregorian(heartDate, gregorianYearAnchor),
      type: 'production' as const,
      relatedSoulId: 'oliver-hardwood',
    };
  });
}
