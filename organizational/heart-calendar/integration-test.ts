import { generateSoulDays, generateFestivalEvents } from './heart-calendar';
import {
  generateGalaEvents,
  generateGazetteEvents,
  gregorianToSentennielDate,
} from './sentenniel-calendar';
import { SOULS, getSoul, soulsByCrew } from './souls-registry';
import type { CalendarEvent } from './heart-calendar';

function printEvents(label: string, events: CalendarEvent[]) {
  console.log(`\n=== ${label} ===`);
  for (const e of events) {
    const soul = e.relatedSoulId ? getSoul(e.relatedSoulId) : undefined;
    const soulLabel = soul ? soul.name : e.relatedSoulId ?? '(none)';
    console.log(
      `${e.gregorianDate!.toISOString().slice(0, 10)}  [${e.type}]  ${e.title}  -- ${soulLabel}`
    );
  }
}

// --- Heart Calendar (personal) ---
printEvents('Heart Calendar: Soul Days, 2026', generateSoulDays(2026));
printEvents('Heart Calendar: Festivals, 2026', generateFestivalEvents(2026));

// --- Sentenniel Calendar (production) ---
const equinoxAnchor2026 = new Date(Date.UTC(2026, 2, 20)); // March 20, 2026
const galaEvents = generateGalaEvents(equinoxAnchor2026);
printEvents('Sentenniel Calendar: Galas, 2026', galaEvents);
printEvents('Sentenniel Calendar: Gazette issues, 2026', generateGazetteEvents(equinoxAnchor2026));

// --- Cross-check: relatedSoulId resolves correctly for every Gala ---
console.log('\n=== Soul resolution check ===');
for (const g of galaEvents) {
  const soul = getSoul(g.relatedSoulId!);
  console.log(
    `${g.title}: relatedSoulId="${g.relatedSoulId}" -> ${soul ? soul.name + ' (' + soul.role + ')' : 'UNRESOLVED'}`
  );
}

// --- Cross-check: every Soul has a resolvable ID (no dangling references) ---
console.log('\n=== Registry integrity check ===');
console.log(`Total registered Souls: ${SOULS.length}`);
console.log(`Smurch Sentenniel members: ${SOULS.filter((s) => s.category === 'smurch_sentenniel').length}`);
console.log(`Alpha crew: ${soulsByCrew('Alpha').map((s) => s.name).join(', ')}`);
console.log(`Bravo crew: ${soulsByCrew('Bravo').map((s) => s.name).join(', ')}`);
console.log(`Charlie crew: ${soulsByCrew('Charlie').map((s) => s.name).join(', ')}`);
console.log(`Delta crew: ${soulsByCrew('Delta').map((s) => s.name).join(', ')}`);

// --- Cross-check: Gala dates fall in the Sentenniel month we expect ---
console.log('\n=== Gala date sanity check ===');
for (const g of galaEvents) {
  const resolved = gregorianToSentennielDate(g.gregorianDate!, equinoxAnchor2026);
  console.log(
    `${g.title}: expected "${g.description}" -- resolved to ${resolved.month.name}, Day ${resolved.day}`
  );
}
