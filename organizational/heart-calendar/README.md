# Heart Calendar System (Zori Calendar)

A custom 13-month calendar system with 28.0 days per month, starting May 21 (Gregorian). This is a personal calendar where every month name represents a relative or life partner. The system provides date conversion, event scheduling, depot-specific schedule generation, soul days, and festivals for the TZU organizational hierarchy.

## Dual Implementation

This directory contains **two implementations** of the calendar system:

1. **Python Implementation** (`heart_calendar.py`) - Original implementation with full organizational features including depot scheduling, event persistence, and reporting
2. **TypeScript Implementation** (`heart-calendar.ts`, `souls-registry.ts`, `sentenniel-calendar.ts`) - New type-safe implementation with:
   - Zori Calendar (personal 13-month calendar)
   - Sentenniel Calendar (show production calendar)
   - Souls Registry (typed cast database from THE_31_SOULS_CAST_BIBLE.md)
   - Shared type system across both calendars

Both implementations can coexist. Use Python for organizational/depot features, and TypeScript for type-safe calendar operations and show production scheduling.

## Features

- **Custom Calendar System**: 13-month calendar with 28.0 days per month (364 days per year)
- **Date Conversion**: Seamless conversion between Gregorian and Heart Calendar dates
- **Event Management**: Create, track, and complete calendar events
- **Soul Days**: Automatic generation of personal observances for each person
- **Festivals**: Seasonal festivals tied to specific months and their meanings
- **Seasonal Tags**: Special tags for equinox, solstice, causing, and effecting periods
- **Depot Scheduling**: Generate daily schedules for each depot (Consort, Scribe, CashingHouse, Holdings)
- **Monthly Views**: Generate comprehensive monthly calendar views
- **Upcoming Events**: View events for the next N days
- **Comprehensive Reporting**: Generate detailed calendar reports

## Calendar Structure

The Zori Calendar uses 13 unique months, each named after a relative or life partner:

1. **Zori** (May 21 - June 17) - *Glamour-Shine* (equinox)
2. **Malia** (June 18 - July 15)
3. **Bryan** (July 16 - August 12)
4. **Jasmyne** (August 13 - September 9) - *Glamour-Bean* (solstice)
5. **Matteo** (September 10 - October 7)
6. **Olivia** (October 8 - November 4)
7. **Jessica** (November 5 - December 2) - *Glamour-Shine* (equinox)
8. **Byron** (December 3 - December 30)
9. **Brandon** (December 31 - January 27)
10. **Emahney** (January 28 - February 24) - *Glamour-Bean* (solstice)
11. **Reyna** (February 25 - March 24)
12. **Justin** (March 25 - April 21) - *Qart'ng* (causing - making amends)
13. **Terrell** (April 22 - May 20) - *Weel'ng* (effecting - transitioning to new year)

**Note**: Bryan and Byron are two distinct people, not a typo of each other.

## Seasonal Tags and Festivals

The calendar includes special seasonal tags and associated festivals:

- **Zori's Dawning** (Zori, equinox: Glamour-Shine)
- **Jasmyne's Longlight** (Jasmyne, solstice: Glamour-Bean)
- **Jessica's Balance** (Jessica, equinox: Glamour-Shine)
- **Emahney's Stillnight** (Emahney, solstice: Glamour-Bean)
- **Justin's Mending** (Justin, causing: Qart'ng - making amends for the past year)
- **Terrell's Turning** (Terrell, effecting: Weel'ng - transitioning to the new year ahead)

The final "causing" / "effecting" pair (Justin → Terrell) represents the year's closing turn, marking the transition from the old year to the new year.

## Installation

### Python Implementation
No external dependencies required. Uses only Python standard library.

```bash
# Navigate to the heart-calendar directory
cd organizational/heart-calendar

# Run the system
python heart_calendar.py
```

### TypeScript Implementation
Requires Node.js and npm.

```bash
# Navigate to the heart-calendar directory
cd organizational/heart-calendar

# Install dependencies
npm install

# Build the TypeScript files
npm run build

# Run the integration test
npm test

# Type-check without building
npm run typecheck
```

## Usage

### Basic Usage

```python
from heart_calendar import HeartCalendar, HeartDate, HeartMonth, DepotType

# Initialize the calendar
calendar = HeartCalendar()

# Get current Heart date
current_date = calendar.get_current_heart_date()
print(f"Current Heart Date: {current_date}")
print(f"Calendar Structure: {calendar.MONTHS_PER_YEAR} months × {calendar.DAYS_PER_MONTH} days = {calendar.DAYS_PER_YEAR} days per year")

# Convert Gregorian to Heart date
from datetime import date
gregorian_date = date(2024, 9, 23)
heart_date = calendar.gregorian_to_heart(gregorian_date)
print(f"Heart Date: {heart_date}")

# Convert Heart to Gregorian date
back_to_gregorian = calendar.heart_to_gregorian(heart_date)
print(f"Gregorian Date: {back_to_gregorian}")

# Get month information
month_info = calendar.get_month_info(HeartMonth.ZORI)
print(f"Month Info: {month_info}")
```

### Event Management

```python
from heart_calendar import CalendarEvent, EventType

# Create an event
event = CalendarEvent(
    id="strategic_review_001",
    title="Quarterly Strategic Review",
    heart_date=current_date,
    gregorian_date=calendar.heart_to_gregorian(current_date),
    depot=DepotType.CONSORT,
    description="Quarterly review for Consort Depot operations",
    priority="high",
    event_type=EventType.SPECIAL
)

# Add event to calendar
calendar.add_event(event)

# Get events for a specific date
events = calendar.get_events(current_date)

# Mark event as completed
calendar.complete_event(event.id)
```

### Depot Schedule Generation

```python
# Generate schedule for a specific depot
schedule = calendar.generate_depot_schedule(DepotType.CONSORT, current_date)
print(f"Consort Depot Schedule: {schedule['default_schedule']}")

# Generate monthly view
monthly_view = calendar.generate_monthly_view(current_date)
print(f"Monthly View: {monthly_view}")
```

### Reporting

```python
# Generate comprehensive calendar report
report = calendar.generate_calendar_report()
print(f"Calendar Report: {report}")

# Get upcoming events
upcoming = calendar.get_upcoming_events(days=7)
print(f"Upcoming Events: {len(upcoming)}")
```

### Soul Days

```python
# Generate soul days for a specific year
year = 2024
soul_days = calendar.generate_soul_days(year)

# Soul days are personal observances for each person
# Each person gets a soul day on day 1 of their named month
for soul_day in soul_days:
    print(f"{soul_day.title}: {soul_day.gregorian_date}")
    # Automatically add to calendar if desired
    calendar.add_event(soul_day)
```

### Festivals

```python
# Generate festival events for a specific year
year = 2024
festivals = calendar.generate_festival_events(year)

# Festivals are tied to seasonal tags (equinox, solstice, causing, effecting)
for festival in festivals:
    print(f"{festival.title}: {festival.gregorian_date}")
    print(f"Description: {festival.description}")
    # Automatically add to calendar if desired
    calendar.add_event(festival)
```

### TypeScript Usage

```typescript
import {
  generateSoulDays,
  generateFestivalEvents,
  gregorianToHeartDate,
  heartDateToGregorian,
  HEART_CALENDAR
} from './heart-calendar';
import { getSoul, soulsByCrew } from './souls-registry';
import {
  generateGalaEvents,
  generateGazetteEvents,
  gregorianToSentennielDate
} from './sentenniel-calendar';

// Heart Calendar (personal)
const soulDays2026 = generateSoulDays(2026);
const festivals2026 = generateFestivalEvents(2026);

// Convert dates
const today = new Date();
const heartDate = gregorianToHeartDate(today);
const backToGregorian = heartDateToGregorian(heartDate);

// Sentenniel Calendar (production)
const equinoxAnchor2026 = new Date(Date.UTC(2026, 2, 20)); // March 20, 2026
const galaEvents = generateGalaEvents(equinoxAnchor2026);
const gazetteEvents = generateGazetteEvents(equinoxAnchor2026);

// Query souls registry
const royalRhino = getSoul('royal-rhino');
const alphaCrew = soulsByCrew('Alpha');

// Cross-reference events with souls
for (const gala of galaEvents) {
  const soul = getSoul(gala.relatedSoulId!);
  console.log(`${gala.title}: anchored by ${soul?.name || 'Unknown'}`);
}
```

## Data Files

The system creates and manages the following data files:

- `events.json` - Stores all calendar events
- Files are automatically created on first run

## Integration

The Heart Calendar integrates with other organizational systems:

- **Daily Automation**: Auto-completes checklist tasks based on calendar events
- **Depot Systems**: Provides scheduling context for depot operations
- **Stakeholder Tracking**: Aligns strategic events with stakeholder interactions
- **Content Pipeline**: Uses seasonal tags and festivals for content planning

## TypeScript-Specific Features

### Sentenniel Calendar (Show Production)

The TypeScript implementation includes a separate 13-month production calendar for the Gobblers Knob show universe:

- **Anchored to astronomical spring equinox** (shifts yearly, unlike Heart Calendar's fixed May 21)
- **Confirmed month names**: Apzu's Threshold, Sunfire Recess, Room of Silence, Reckoning's Balance, Long Night's Gala, Illumifluxing
- **Draft month names**: Thawmarch, Verdant's Wake, Amber Zenith, Harvest's Toll, Duskfall Recess, Rimefast, Hollow's Vigil
- **Gala events**: Spring Gala, Solstice Gala, Equinox Gala, Winter Gala (each tied to specific souls)
- **Gazette issues**: Monthly publication events on the last day of each month

### Souls Registry

Typed registry of named cast from THE_31_SOULS_CAST_BIBLE.md:

- **17 named souls**: 7 on-camera/production humans, the Royal Rhino, and 8 named Smurch
- **Crew assignments**: Alpha, Bravo, Charlie, Delta for Smurch Sentenniel
- **Type-safe queries**: `getSoul(id)`, `soulsByCrew(crew)`, `soulsByCategory(category)`
- **Deliberately excluded**: Dr. Johnson (no bio in canon), Chip Wobblejaw (held in reserve)

### Shared Type System

Both calendars share the same core types:
- `HeartMonth` - Month structure with days and optional seasonal tags
- `HeartDate` - Date representation with year, month, and day
- `CalendarEvent` - Event structure with soul references and event types

This allows events from both calendars to feed the same event pipeline without duplicate type hierarchies.

## API Reference

### Python: HeartCalendar Class

#### Methods

- `get_current_heart_date()` - Get current Heart Calendar date
- `gregorian_to_heart(gregorian_date)` - Convert Gregorian to Heart date
- `heart_to_gregorian(heart_date)` - Convert Heart to Gregorian date
- `add_event(event)` - Add an event to the calendar
- `get_events(heart_date, depot)` - Get events, optionally filtered
- `complete_event(event_id)` - Mark an event as completed
- `generate_monthly_view(heart_date)` - Generate monthly calendar view
- `generate_depot_schedule(depot, heart_date)` - Generate depot-specific schedule
- `get_upcoming_events(days)` - Get events for next N days
- `generate_calendar_report()` - Generate comprehensive report
- `generate_soul_days(year)` - Generate soul day events for a year
- `generate_festival_events(year)` - Generate festival events for a year
- `get_month_info(month)` - Get detailed information about a specific month

### Data Classes

- `HeartDate` - Represents a date in the Heart Calendar system
- `CalendarEvent` - Represents an event in the calendar
- `HeartMonth` - Enum of the 13 Heart Calendar months
- `DepotType` - Enum of depot types (Consort, Scribe, CashingHouse, Holdings)
- `EventType` - Enum of event types (soul_day, award, special, production)
- `SeasonalTag` - Represents seasonal tag information
- `SeasonalTagType` - Enum of seasonal tag types (equinox, solstice, causing, effecting)

### TypeScript: Heart Calendar Functions

#### Date Conversion
- `gregorianToHeartDate(date: Date): HeartDate` - Convert Gregorian to Heart date
- `heartDateToGregorian(heartDate: HeartDate): Date` - Convert Heart to Gregorian date
- `heartYearStart(gregorianStartYear: number): Date` - Get Heart year start date (May 21)

#### Event Generation
- `generateSoulDays(gregorianStartYear: number): CalendarEvent[]` - Generate soul day events
- `generateFestivalEvents(gregorianStartYear: number): CalendarEvent[]` - Generate festival events

#### Constants
- `HEART_CALENDAR: HeartMonth[]` - Array of 13 months with seasonal tags
- `FESTIVALS: Festival[]` - Array of festival definitions
- `MONTHS_PER_YEAR = 13`
- `DAYS_PER_MONTH = 28.0`
- `DAYS_PER_YEAR = 364.0`

### TypeScript: Sentenniel Calendar Functions

#### Date Conversion
- `gregorianToSentennielDate(date: Date, yearAnchor: Date): HeartDate` - Convert Gregorian to Sentenniel date
- `sentennielDateToGregorian(heartDate: HeartDate, yearAnchor: Date): Date` - Convert Sentenniel to Gregorian date

#### Event Generation
- `generateGalaEvents(gregorianYearAnchor: Date): CalendarEvent[]` - Generate gala events
- `generateGazetteEvents(gregorianYearAnchor: Date): CalendarEvent[]` - Generate Gazette publication events

#### Constants
- `SENTENNIEL_CALENDAR: HeartMonth[]` - Array of 13 production months
- `GALA_SCHEDULE: GalaDefinition[]` - Array of gala definitions
- `SENTENNIEL_MONTHS_PER_YEAR = 13`
- `SENTENNIEL_DAYS_PER_MONTH = 28`
- `SENTENNIEL_DAYS_PER_YEAR = 364`

### TypeScript: Souls Registry Functions

#### Queries
- `getSoul(id: string): Soul | undefined` - Get soul by ID
- `soulsByCrew(crew: SmurchCrew): Soul[]` - Get souls by crew assignment
- `soulsByCategory(category: SoulCategory): Soul[]` - Get souls by category

#### Constants
- `SOULS: Soul[]` - Array of 17 named souls from THE_31_SOULS_CAST_BIBLE.md

## Example Output

```
=== Heart Calendar System (Zori Calendar) ===

Current Heart Date: Reyna 15, 2024
Calendar Structure: 13 months × 28.0 days = 364 days per year
Year Start: May 21 (Gregorian)

=== Calendar Months ===
Zori: 28 days
  Seasonal Tag: Glamour-Shine (equinox)
  Festival: Zori's Dawning
Malia: 28 days
Bryan: 28 days
Jasmyne: 28 days
  Seasonal Tag: Glamour-Bean (solstice)
  Festival: Jasmyne's Longlight
...

=== Soul Days for 2024 ===
Zori's Day: 2024-05-21
Malia's Day: 2024-06-18
Bryan's Day: 2024-07-16
... (13 total soul days)

=== Festival Events for 2024 ===
Zori's Dawning: 2024-05-21 - equinox observance (Glamour-Shine)
Jasmyne's Longlight: 2024-08-13 - solstice observance (Glamour-Bean)
Jessica's Balance: 2024-11-05 - equinox observance (Glamour-Shine)
Emahney's Stillnight: 2025-01-28 - solstice observance (Glamour-Bean)
Justin's Mending: 2025-03-25 - Making amends for the past year
Terrell's Turning: 2025-04-22 - Transitioning to the new year ahead

=== Calendar Report ===
{
  "current_heart_date": "Reyna 15, 2024",
  "total_events": 1,
  "completed_events": 0,
  "completion_rate": "0.0%",
  "upcoming_events_30_days": 1,
  "events_by_depot": {
    "Consort": 1,
    "Scribe": 0,
    "CashingHouse": 0,
    "Holdings": 0
  },
  "events_by_type": {
    "soul_day": 0,
    "award": 0,
    "special": 1,
    "production": 0
  }
}
```

## Configuration

Calendar settings can be configured in the `config.json` file:

```json
{
  "heart_calendar": {
    "data_directory": "./heart-calendar",
    "events_file": "events.json",
    "days_per_month": 28.0,
    "months_per_year": 13,
    "gregorian_start_month": 5,
    "gregorian_start_day": 21
  }
}
```

## Future Enhancements

- Recurring event support
- Calendar export to iCal format
- Integration with external calendar APIs
- Multi-timezone support
- Calendar sharing and collaboration

## Support

For issues or questions, refer to the main Tiapmaatzu OS Toolkit documentation or contact the system administrator.

---

*Heart Calendar System (Zori Calendar) v2.0*  
*Part of Tiapmaatzu OS Toolkit - Organizational Systems*