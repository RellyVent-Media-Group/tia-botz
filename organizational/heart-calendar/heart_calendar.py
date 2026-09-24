#!/usr/bin/env python3
"""
Heart Calendar System (Zori Calendar)
13 months, each with exactly 28.0 days
Year starts in month "Zori" on May 21

Every month name is a relative or life partner — this is a personal calendar.
Bryan and Byron are two distinct people, not a typo of each other.
The final "causing" / "effecting" pair (Justin → Terrell) is the year's closing turn.
"""

import json
import os
from datetime import datetime, timedelta, date
from typing import Dict, List, Optional, Tuple
from enum import Enum
from dataclasses import dataclass, asdict


class SeasonalTagType(Enum):
    """Types of seasonal tags"""
    EQUINOX = "equinox"
    SOLSTICE = "solstice"
    CAUSING = "causing"
    EFFECTING = "effecting"


@dataclass
class SeasonalTag:
    """Represents a seasonal tag for a month"""
    type: SeasonalTagType
    name: str
    meaning: Optional[str] = None


class HeartMonth(Enum):
    """The 13 months of the Zori Calendar (Heart Calendar)"""
    # Month 1 starts May 21 (Gregorian)
    ZORI = "Zori"              # May 21 - June 17
    MALIA = "Malia"            # June 18 - July 15
    BRYAN = "Bryan"            # July 16 - August 12
    JASMYNE = "Jasmyne"        # August 13 - September 9
    MATTEO = "Matteo"          # September 10 - October 7
    OLIVIA = "Olivia"          # October 8 - November 4
    JESSICA = "Jessica"        # November 5 - December 2
    BYRON = "Byron"            # December 3 - December 30
    BRANDON = "Brandon"        # December 31 - January 27
    EMAHNEY = "Emahney"        # January 28 - February 24
    REYNA = "Reyna"            # February 25 - March 24
    JUSTIN = "Justin"          # March 25 - April 21
    TERRELL = "Terrell"        # April 22 - May 20


class DepotType(Enum):
    """Depot types for scheduling"""
    CONSORT = "Consort"
    SCRIBE = "Scribe"
    CASHINGHOUSE = "CashingHouse"
    HOLDINGS = "Holdings"


class EventType(Enum):
    """Types of calendar events"""
    SOUL_DAY = "soul_day"
    AWARD = "award"
    SPECIAL = "special"
    PRODUCTION = "production"


@dataclass
class HeartDate:
    """Represents a date in the Heart Calendar system"""
    year: int
    month: HeartMonth
    day: int
    seasonal_tag: Optional[SeasonalTag] = None
    
    def __str__(self):
        return f"{self.month.value} {self.day}, {self.year}"
    
    def to_dict(self):
        return {
            "year": self.year,
            "month": self.month.value,
            "day": self.day,
            "seasonal_tag": {
                "type": self.seasonal_tag.type.value,
                "name": self.seasonal_tag.name,
                "meaning": self.seasonal_tag.meaning
            } if self.seasonal_tag else None
        }


@dataclass
class CalendarEvent:
    """Represents an event in the Heart Calendar"""
    id: str
    title: str
    heart_date: HeartDate
    gregorian_date: Optional[date] = None
    depot: Optional[DepotType] = None
    description: str = ""
    priority: str = "medium"  # low, medium, high
    completed: bool = False
    event_type: EventType = EventType.SPECIAL
    related_soul_id: Optional[str] = None
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "heart_date": self.heart_date.to_dict(),
            "gregorian_date": self.gregorian_date.isoformat() if self.gregorian_date else None,
            "depot": self.depot.value if self.depot else None,
            "description": self.description,
            "priority": self.priority,
            "completed": self.completed,
            "event_type": self.event_type.value,
            "related_soul_id": self.related_soul_id
        }


class HeartCalendar:
    """Main Heart Calendar system (Zori Calendar) with conversion and scheduling capabilities"""
    
    DAYS_PER_MONTH = 28.0
    DAYS_PER_YEAR = 364  # 13 * 28
    MONTHS_PER_YEAR = 13
    GREGORIAN_START_MONTH = 5  # May
    GREGORIAN_START_DAY = 21
    
    # Seasonal tags for each month
    SEASONAL_TAGS = {
        HeartMonth.ZORI: SeasonalTag(SeasonalTagType.EQUINOX, "Glamour-Shine"),
        HeartMonth.JASMYNE: SeasonalTag(SeasonalTagType.SOLSTICE, "Glamour-Bean"),
        HeartMonth.JESSICA: SeasonalTag(SeasonalTagType.EQUINOX, "Glamour-Shine"),
        HeartMonth.EMAHNEY: SeasonalTag(SeasonalTagType.SOLSTICE, "Glamour-Bean"),
        HeartMonth.JUSTIN: SeasonalTag(SeasonalTagType.CAUSING, "Qart'ng", "Making amends for the past year"),
        HeartMonth.TERRELL: SeasonalTag(SeasonalTagType.EFFECTING, "Weel'ng", "Transitioning to the new year ahead")
    }
    
    # Festival names for each seasonal tag
    FESTIVAL_NAMES = {
        HeartMonth.ZORI: "Zori's Dawning",
        HeartMonth.JASMYNE: "Jasmyne's Longlight",
        HeartMonth.JESSICA: "Jessica's Balance",
        HeartMonth.EMAHNEY: "Emahney's Stillnight",
        HeartMonth.JUSTIN: "Justin's Mending",
        HeartMonth.TERRELL: "Terrell's Turning"
    }
    
    def __init__(self, data_dir: str = None):
        """Initialize the Heart Calendar system"""
        if data_dir is None:
            # Default to the heart-calendar directory
            self.data_dir = os.path.dirname(os.path.abspath(__file__))
        else:
            self.data_dir = data_dir
            
        self.events_file = os.path.join(self.data_dir, "events.json")
        self.events: Dict[str, CalendarEvent] = {}
        self._load_events()
    
    def _load_events(self):
        """Load events from JSON file"""
        if os.path.exists(self.events_file):
            try:
                with open(self.events_file, 'r') as f:
                    data = json.load(f)
                    for event_data in data:
                        # Handle seasonal tag
                        seasonal_tag = None
                        if event_data["heart_date"].get("seasonal_tag"):
                            tag_data = event_data["heart_date"]["seasonal_tag"]
                            seasonal_tag = SeasonalTag(
                                type=SeasonalTagType(tag_data["type"]),
                                name=tag_data["name"],
                                meaning=tag_data.get("meaning")
                            )
                        
                        heart_date = HeartDate(
                            year=event_data["heart_date"]["year"],
                            month=HeartMonth(event_data["heart_date"]["month"]),
                            day=event_data["heart_date"]["day"],
                            seasonal_tag=seasonal_tag
                        )
                        
                        # Handle gregorian date
                        gregorian_date = None
                        if event_data.get("gregorian_date"):
                            gregorian_date = date.fromisoformat(event_data["gregorian_date"])
                        
                        depot = DepotType(event_data["depot"]) if event_data.get("depot") else None
                        event_type = EventType(event_data.get("event_type", "special"))
                        
                        event = CalendarEvent(
                            id=event_data["id"],
                            title=event_data["title"],
                            heart_date=heart_date,
                            gregorian_date=gregorian_date,
                            depot=depot,
                            description=event_data.get("description", ""),
                            priority=event_data.get("priority", "medium"),
                            completed=event_data.get("completed", False),
                            event_type=event_type,
                            related_soul_id=event_data.get("related_soul_id")
                        )
                        self.events[event.id] = event
            except Exception as e:
                print(f"Error loading events: {e}")
    
    def _save_events(self):
        """Save events to JSON file"""
        try:
            events_data = [event.to_dict() for event in self.events.values()]
            with open(self.events_file, 'w') as f:
                json.dump(events_data, f, indent=2)
        except Exception as e:
            print(f"Error saving events: {e}")
    
    def gregorian_to_heart(self, gregorian_date: date) -> HeartDate:
        """Convert a Gregorian date to Heart Calendar date"""
        # Calculate days since May 21 of the current year
        year = gregorian_date.year
        
        # Start of Heart year (May 21)
        heart_year_start = date(year, self.GREGORIAN_START_MONTH, self.GREGORIAN_START_DAY)
        
        # If date is before May 21, it belongs to previous Heart year
        if gregorian_date < heart_year_start:
            heart_year_start = date(year - 1, self.GREGORIAN_START_MONTH, self.GREGORIAN_START_DAY)
            heart_year = year - 1
        else:
            heart_year = year
        
        # Calculate days since start of Heart year
        days_since_start = (gregorian_date - heart_year_start).days
        
        # Calculate month and day
        month_index = int(days_since_start // self.DAYS_PER_MONTH)
        day_in_month = int(days_since_start % self.DAYS_PER_MONTH) + 1
        
        # Get the Heart month (13 months)
        months = list(HeartMonth)
        month = months[month_index % self.MONTHS_PER_YEAR]
        
        # Get seasonal tag for this month
        seasonal_tag = self.SEASONAL_TAGS.get(month)
        
        return HeartDate(year=heart_year, month=month, day=day_in_month, seasonal_tag=seasonal_tag)
    
    def heart_to_gregorian(self, heart_date: HeartDate) -> date:
        """Convert a Heart Calendar date to Gregorian date"""
        # Calculate days since start of Heart year
        months = list(HeartMonth)
        month_index = months.index(heart_date.month)
        days_since_start = month_index * int(self.DAYS_PER_MONTH) + (heart_date.day - 1)
        
        # Start of Heart year (May 21)
        heart_year_start = date(heart_date.year, self.GREGORIAN_START_MONTH, self.GREGORIAN_START_DAY)
        
        # Add days to get Gregorian date
        gregorian_date = heart_year_start + timedelta(days=days_since_start)
        
        return gregorian_date
    
    def get_current_heart_date(self) -> HeartDate:
        """Get the current Heart Calendar date"""
        today = date.today()
        return self.gregorian_to_heart(today)
    
    def add_event(self, event: CalendarEvent):
        """Add an event to the calendar"""
        self.events[event.id] = event
        self._save_events()
    
    def get_events(self, heart_date: HeartDate = None, depot: DepotType = None) -> List[CalendarEvent]:
        """Get events, optionally filtered by date and/or depot"""
        events = list(self.events.values())
        
        if heart_date:
            events = [e for e in events if 
                     e.heart_date.year == heart_date.year and
                     e.heart_date.month == heart_date.month and
                     e.heart_date.day == heart_date.day]
        
        if depot:
            events = [e for e in events if e.depot == depot]
        
        return sorted(events, key=lambda x: (x.priority, x.title))
    
    def complete_event(self, event_id: str):
        """Mark an event as completed"""
        if event_id in self.events:
            self.events[event_id].completed = True
            self._save_events()
    
    def generate_monthly_view(self, heart_date: HeartDate) -> Dict:
        """Generate a monthly view of the calendar"""
        month_events = [e for e in self.events.values() if 
                       e.heart_date.year == heart_date.year and
                       e.heart_date.month == heart_date.month]
        
        # Group events by day
        events_by_day = {}
        for event in month_events:
            day = event.heart_date.day
            if day not in events_by_day:
                events_by_day[day] = []
            events_by_day[day].append(event.to_dict())
        
        return {
            "month": heart_date.month.value,
            "year": heart_date.year,
            "days_in_month": int(self.DAYS_PER_MONTH),
            "events": events_by_day,
            "total_events": len(month_events)
        }
    
    def generate_depot_schedule(self, depot: DepotType, heart_date: HeartDate) -> Dict:
        """Generate a daily schedule for a specific depot"""
        depot_events = self.get_events(heart_date, depot)
        
        # Default depot schedule template
        default_schedule = {
            "morning": [
                "Review stakeholder sentiment",
                "Check daily priorities",
                "Team sync (if applicable)"
            ],
            "mid_day": [
                "Execute primary tasks",
                "Progress updates",
                "Issue resolution"
            ],
            "evening": [
                "Daily review",
                "Plan tomorrow's priorities",
                "Update tracking systems"
            ]
        }
        
        # Customize based on depot type
        if depot == DepotType.CONSORT:
            default_schedule["morning"].extend([
                "Review content pipeline",
                "Check social media engagement"
            ])
            default_schedule["mid_day"].extend([
                "Content creation",
                "Platform posting",
                "Character consistency check"
            ])
        elif depot == DepotType.SCRIBE:
            default_schedule["morning"].extend([
                "Review document queue",
                "Check contract deadlines"
            ])
            default_schedule["mid_day"].extend([
                "Document processing",
                "Contract management",
                "Version control updates"
            ])
        elif depot == DepotType.CASHINGHOUSE:
            default_schedule["morning"].extend([
                "Review revenue metrics",
                "Check transaction status"
            ])
            default_schedule["mid_day"].extend([
                "Financial tracking",
                "Commission calculations",
                "Pricing analysis"
            ])
        elif depot == DepotType.HOLDINGS:
            default_schedule["morning"].extend([
                "Review portfolio performance",
                "Check asset status"
            ])
            default_schedule["mid_day"].extend([
                "Investment analysis",
                "ROI calculations",
                "Resource allocation"
            ])
        
        return {
            "depot": depot.value,
            "heart_date": str(heart_date),
            "scheduled_events": [e.to_dict() for e in depot_events],
            "default_schedule": default_schedule,
            "total_events": len(depot_events)
        }
    
    def get_upcoming_events(self, days: int = 7) -> List[CalendarEvent]:
        """Get events for the next N days"""
        current = self.get_current_heart_date()
        upcoming = []
        
        for i in range(days):
            # Calculate future heart date
            future_days = current.day - 1 + i
            future_month_index = list(HeartMonth).index(current.month) + (future_days // int(self.DAYS_PER_MONTH))
            future_month = list(HeartMonth)[future_month_index % self.MONTHS_PER_YEAR]
            future_day = (future_days % int(self.DAYS_PER_MONTH)) + 1
            future_year = current.year + (future_month_index // self.MONTHS_PER_YEAR)
            
            # Get seasonal tag for the future month
            seasonal_tag = self.SEASONAL_TAGS.get(future_month)
            future_date = HeartDate(year=future_year, month=future_month, day=future_day, seasonal_tag=seasonal_tag)
            events = self.get_events(future_date)
            upcoming.extend(events)
        
        return sorted(upcoming, key=lambda x: (x.heart_date.year, list(HeartMonth).index(x.heart_date.month), x.heart_date.day))
    
    def generate_calendar_report(self) -> Dict:
        """Generate a comprehensive calendar report"""
        current = self.get_current_heart_date()
        total_events = len(self.events)
        completed_events = len([e for e in self.events.values() if e.completed])
        upcoming_events = self.get_upcoming_events(30)
        
        # Events by depot
        events_by_depot = {}
        for depot in DepotType:
            depot_events = [e for e in self.events.values() if e.depot == depot]
            events_by_depot[depot.value] = len(depot_events)
        
        # Events by type
        events_by_type = {}
        for event_type in EventType:
            type_events = [e for e in self.events.values() if e.event_type == event_type]
            events_by_type[event_type.value] = len(type_events)
        
        return {
            "current_heart_date": str(current),
            "total_events": total_events,
            "completed_events": completed_events,
            "completion_rate": f"{(completed_events / total_events * 100):.1f}%" if total_events > 0 else "0%",
            "upcoming_events_30_days": len(upcoming_events),
            "events_by_depot": events_by_depot,
            "events_by_type": events_by_type,
            "monthly_view": self.generate_monthly_view(current)
        }
    
    def generate_soul_days(self, year: int) -> List[CalendarEvent]:
        """Generate soul day events for each person for a given year"""
        soul_days = []
        
        for month in HeartMonth:
            heart_date = HeartDate(
                year=year,
                month=month,
                day=1,
                seasonal_tag=self.SEASONAL_TAGS.get(month)
            )
            gregorian_date = self.heart_to_gregorian(heart_date)
            
            soul_day = CalendarEvent(
                id=f"soul_day_{month.value.lower()}_{year}",
                title=f"{month.value}'s Day",
                heart_date=heart_date,
                gregorian_date=gregorian_date,
                event_type=EventType.SOUL_DAY,
                related_soul_id=month.value.lower(),
                description=f"Soul day observance for {month.value}",
                priority="medium"
            )
            soul_days.append(soul_day)
        
        return soul_days
    
    def generate_festival_events(self, year: int) -> List[CalendarEvent]:
        """Generate festival events for seasonal tags for a given year"""
        festivals = []
        
        for month, festival_name in self.FESTIVAL_NAMES.items():
            seasonal_tag = self.SEASONAL_TAGS.get(month)
            if seasonal_tag:
                heart_date = HeartDate(
                    year=year,
                    month=month,
                    day=1,
                    seasonal_tag=seasonal_tag
                )
                gregorian_date = self.heart_to_gregorian(heart_date)
                
                description = seasonal_tag.meaning if seasonal_tag.meaning else f"{seasonal_tag.type.value} observance ({seasonal_tag.name})"
                
                festival = CalendarEvent(
                    id=f"festival_{month.value.lower()}_{seasonal_tag.type.value}_{year}",
                    title=festival_name,
                    heart_date=heart_date,
                    gregorian_date=gregorian_date,
                    event_type=EventType.SPECIAL,
                    related_soul_id=month.value.lower(),
                    description=description,
                    priority="high"
                )
                festivals.append(festival)
        
        return festivals
    
    def get_month_info(self, month: HeartMonth) -> Dict:
        """Get detailed information about a specific month"""
        seasonal_tag = self.SEASONAL_TAGS.get(month)
        festival_name = self.FESTIVAL_NAMES.get(month)
        
        return {
            "month": month.value,
            "days_in_month": int(self.DAYS_PER_MONTH),
            "seasonal_tag": {
                "type": seasonal_tag.type.value if seasonal_tag else None,
                "name": seasonal_tag.name if seasonal_tag else None,
                "meaning": seasonal_tag.meaning if seasonal_tag else None
            } if seasonal_tag else None,
            "festival": festival_name if festival_name else None
        }


def main():
    """Example usage of the Heart Calendar system (Zori Calendar)"""
    calendar = HeartCalendar()
    
    print("=== Heart Calendar System (Zori Calendar) ===")
    print(f"Current Heart Date: {calendar.get_current_heart_date()}")
    print(f"Calendar Structure: {calendar.MONTHS_PER_YEAR} months × {calendar.DAYS_PER_MONTH} days = {calendar.DAYS_PER_YEAR} days per year")
    print(f"Year Start: May 21 (Gregorian)")
    print()
    
    # Show all months with their seasonal tags
    print("=== Calendar Months ===")
    for month in HeartMonth:
        month_info = calendar.get_month_info(month)
        print(f"{month_info['month']}: {month_info['days_in_month']} days")
        if month_info['seasonal_tag']:
            print(f"  Seasonal Tag: {month_info['seasonal_tag']['name']} ({month_info['seasonal_tag']['type']})")
            if month_info['seasonal_tag']['meaning']:
                print(f"  Meaning: {month_info['seasonal_tag']['meaning']}")
        if month_info['festival']:
            print(f"  Festival: {month_info['festival']}")
    print()
    
    # Example: Add an event
    today = calendar.get_current_heart_date()
    sample_event = CalendarEvent(
        id=f"event_{datetime.now().strftime('%Y%m%d%H%M%S')}",
        title="Sample Strategic Review",
        heart_date=today,
        gregorian_date=calendar.heart_to_gregorian(today),
        depot=DepotType.CONSORT,
        description="Quarterly strategic review for Consort Depot",
        priority="high"
    )
    calendar.add_event(sample_event)
    print(f"Added event: {sample_event.title}")
    print()
    
    # Generate soul days for current year
    current_year = today.year
    soul_days = calendar.generate_soul_days(current_year)
    print(f"=== Soul Days for {current_year} ===")
    for soul_day in soul_days[:3]:  # Show first 3 as example
        print(f"{soul_day.title}: {soul_day.gregorian_date}")
    print(f"... ({len(soul_days)} total soul days)")
    print()
    
    # Generate festival events
    festivals = calendar.generate_festival_events(current_year)
    print(f"=== Festival Events for {current_year} ===")
    for festival in festivals:
        print(f"{festival.title}: {festival.gregorian_date} - {festival.description}")
    print()
    
    # Generate reports
    report = calendar.generate_calendar_report()
    print("=== Calendar Report ===")
    print(json.dumps(report, indent=2))
    print()
    
    # Depot schedule example
    schedule = calendar.generate_depot_schedule(DepotType.CONSORT, today)
    print("=== Consort Depot Schedule ===")
    print(json.dumps(schedule, indent=2))


# Export main classes for module import
__all__ = [
    'HeartCalendar',
    'HeartDate', 
    'HeartMonth',
    'CalendarEvent',
    'DepotType',
    'EventType',
    'SeasonalTag',
    'SeasonalTagType'
]


if __name__ == "__main__":
    main()