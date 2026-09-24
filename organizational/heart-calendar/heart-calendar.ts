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
 *
 * Every month name is a relative or life partner — this is a personal
 * calendar, not a randomly generated cast list. Bryan and Byron are two
 * distinct people, not a typo of each other.
 *
 * The final "causing" / "effecting" pair (Justin → Terrell) is the year's
 * closing turn, not a stray tag type: "causing: Qart'ng" marks making
 * amends for the past year, and "effecting: Weel'ng" marks transitioning
 * into the new year ahead. They're deliberately their own vocabulary,
 * separate from the equinox/solstice pairs earlier in the year.
 *
 * NOTE: this is a distinct system from the Sentenniel/show production
 * calendar (Apzu's Threshold, Sunfire Recess, etc. -- see lunar_calendar.py).
 * They share the 13x28 = 364 day structure by design choice, not by
 * accident, but the Heart Calendar's year start (fixed May 21) is NOT tied
 * to the real astronomical equinox the way the show calendar is. The
 * equinox/solstice tag *names* here are symbolic/thematic, not literal.
 */

export type SeasonalTagType = 'equinox' | 'solstice' | 'causing' | 'effecting';

export interface SeasonalTag {
  type: SeasonalTagType;
  /** In-universe name for the tag, e.g. 'Glamour-Shine', "Qart'ng" */
  name: string;
  /** Plain-language meaning, filled in for the causing/effecting pair */
  meaning?: string;
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

// Zori Calendar months (13 x 28.0 days), in canonical order
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
  { name: 'Justin', days: 28.0, seasonalTag: { type: 'causing', name: "Qart'ng", meaning: 'Making amends for the past year' } },
  { name: 'Terrell', days: 28.0, seasonalTag: { type: 'effecting', name: "Weel'ng", meaning: 'Transitioning to the new year ahead' } },
];

// Calendar constants
export const MONTHS_PER_YEAR = 13;
export const DAYS_PER_MONTH = 28.0;
export const DAYS_PER_YEAR = MONTHS_PER_YEAR * DAYS_PER_MONTH; // 364.0

// ---------------------------------------------------------------------------
// Festivals -- named observances tied to each seasonalTag occurrence.
// CONFIRMED. Same possessive-mythic / compound-descriptive register as the
// Sentenniel calendar's month names, built from these specific people.
// ---------------------------------------------------------------------------

export interface Festival {
  /** Index into HEART_CALENDAR for the month this festival falls in */
  monthIndex: number;
  /** The seasonal tag this festival is attached to */
  tag: SeasonalTag;
  /** Confirmed festival name */
  festivalName: string;
  /** Day within the month the festival is observed (defaults to Day 1) */
  dayInMonth: number;
}

export const FESTIVALS: Festival[] = HEART_CALENDAR.reduce<Festival[]>((acc, month, index) => {
  if (month.seasonalTag) {
    const confirmedNames: Record<string, string> = {
      Zori: "Zori's Dawning",
      Jasmyne: "Jasmyne's Longlight",
      Jessica: "Jessica's Balance",
      Emahney: "Emahney's Stillnight",
      Justin: "Justin's Mending",
      Terrell: "Terrell's Turning",
    };
    acc.push({
      monthIndex: index,
      tag: month.seasonalTag,
      festivalName: confirmedNames[month.name] ?? `${month.name}'s Observance`,
      dayInMonth: 1,
    });
  }
  return acc;
}, []);

// ---------------------------------------------------------------------------
// Gregorian <-> Heart date conversion
// ---------------------------------------------------------------------------

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/** Given the Gregorian year in which a Heart year begins, return the
 * Gregorian date of that Heart year's Day 1 (always May 21). */
export function heartYearStart(gregorianStartYear: number): Date {
  return new Date(Date.UTC(gregorianStartYear, 4, 21)); // month is 0-indexed: 4 = May
}

/** Determine which Heart year (identified by its Gregorian start year)
 * a given Gregorian date falls within. */
function resolveHeartStartYear(date: Date): number {
  const y = date.getUTCFullYear();
  const thisYearStart = heartYearStart(y);
  if (date.getTime() >= thisYearStart.getTime()) {
    return y;
  }
  return y - 1;
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / MS_PER_DAY);
}

export function gregorianToHeartDate(date: Date): HeartDate {
  const startYear = resolveHeartStartYear(date);
  const yearStart = heartYearStart(startYear);
  const offset = daysBetween(yearStart, date);

  if (offset < 0 || offset >= DAYS_PER_YEAR) {
    throw new RangeError(
      `Computed offset ${offset} is outside the 364-day Heart year beginning ${yearStart.toISOString()}`
    );
  }

  const monthIndex = Math.floor(offset / DAYS_PER_MONTH);
  const dayInMonth = (offset % DAYS_PER_MONTH) + 1;

  return {
    year: startYear,
    month: HEART_CALENDAR[monthIndex],
    day: dayInMonth,
  };
}

export function heartDateToGregorian(heartDate: HeartDate): Date {
  const monthIndex = HEART_CALENDAR.findIndex((m) => m.name === heartDate.month.name);
  if (monthIndex === -1) {
    throw new Error(`Unknown Heart month: ${heartDate.month.name}`);
  }
  const yearStart = heartYearStart(heartDate.year);
  const offset = monthIndex * DAYS_PER_MONTH + (heartDate.day - 1);
  return new Date(yearStart.getTime() + offset * MS_PER_DAY);
}

// ---------------------------------------------------------------------------
// Soul Days -- one personal observance per person, per year.
// DEFAULT: Day 1 of each person's named month. Swap in real birthdays
// (as a dayInMonth override) once/if you want to key it to those instead.
// ---------------------------------------------------------------------------

export function generateSoulDays(gregorianStartYear: number): CalendarEvent[] {
  return HEART_CALENDAR.map((month, index) => {
    const heartDate: HeartDate = { year: gregorianStartYear, month, day: 1 };
    return {
      id: `soul_day_${month.name.toLowerCase()}_${gregorianStartYear}`,
      title: `${month.name}'s Day`,
      heartDate,
      gregorianDate: heartDateToGregorian(heartDate),
      type: 'soul_day' as const,
      relatedSoulId: month.name.toLowerCase(),
    };
  });
}

export function generateFestivalEvents(gregorianStartYear: number): CalendarEvent[] {
  return FESTIVALS.map((f) => {
    const month = HEART_CALENDAR[f.monthIndex];
    const heartDate: HeartDate = { year: gregorianStartYear, month, day: f.dayInMonth };
    return {
      id: `festival_${month.name.toLowerCase()}_${f.tag.type}_${gregorianStartYear}`,
      title: f.festivalName,
      description: f.tag.meaning ?? `${f.tag.type} observance (${f.tag.name})`,
      heartDate,
      gregorianDate: heartDateToGregorian(heartDate),
      type: 'special' as const,
      relatedSoulId: month.name.toLowerCase(),
    };
  });
}
