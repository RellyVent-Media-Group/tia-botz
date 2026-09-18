#!/usr/bin/env python3
"""
Heart Calendar Integration System
Integrates the Heart Calendar system with TZU depot operations
12 months × 28.0 days = 363.6 days per year • Year starts March 21
"""

import json
import datetime
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum
from dateutil.relativedelta import relativedelta


class HeartMonth(Enum):
    """Heart Calendar month names"""
    ZORI = "Zori"
    MALIA = "Malia"
    JESSICA = "Jessica"
    JASMYNE = "Jasmyne"
    OLIVIA = "Olivia"
    BRANDON = "Brandon"
    TERRELL = "Terrell"
    THE_CHILD = "The_Child"
    MATTEO = "Matteo"
    EMAHNEY = "Emahney"
    REYNA = "Reyna"
    JUSTIN = "Justin"


@dataclass
class HeartDate:
    """Heart Calendar date representation"""
    year: int
    month: HeartMonth
    day: float  # Day number (1-28.0)
    
    def __str__(self):
        return f"{self.month.value} {int(self.day)}, {self.year}"


@dataclass
class CalendarEvent:
    """Calendar event for depot operations"""
    event_id: str
    depot_id: str
    title: str
    description: str
    heart_date: HeartDate
    gregorian_date: str
    event_type: str  # "strategic", "operational", "review", "milestone"
    priority: str  # "high", "medium", "low"
    status: str  # "planned", "in_progress", "completed", "cancelled"
    participants: List[str]
    notes: str = ""


class HeartCalendar:
    """Heart Calendar system with Gregorian conversion"""
    
    MONTHS = [
        HeartMonth.ZORI,
        HeartMonth.MALIA,
        HeartMonth.JESSICA,
        HeartMonth.JASMYNE,
        HeartMonth.OLIVIA,
        HeartMonth.BRANDON,
        HeartMonth.TERRELL,
        HeartMonth.THE_CHILD,
        HeartMonth.MATTEO,
        HeartMonth.EMAHNEY,
        HeartMonth.REYNA,
        HeartMonth.JUSTIN
    ]
    
    DAYS_PER_MONTH = 28.0
    YEAR_START_MONTH = 3  # March
    YEAR_START_DAY = 21
    
    def __init__(self, data_path: str = "heart_calendar_data.json"):
        self.data_path = data_path
        self.events: Dict[str, CalendarEvent] = {}
        self.load_data()
    
    def load_data(self):
        """Load calendar events from file"""
        try:
            with open(self.data_path, 'r') as f:
                data = json.load(f)
                for event_id, event_data in data.items():
                    self.events[event_id] = self._deserialize_event(event_data)
        except FileNotFoundError:
            self._initialize_default_events()
    
    def save_data(self):
        """Save calendar events to file"""
        data = {}
        for event_id, event in self.events.items():
            data[event_id] = self._serialize_event(event)
        
        with open(self.data_path, 'w') as f:
            json.dump(data, f, indent=2, default=str)
    
    def _initialize_default_events(self):
        """Initialize default strategic events"""
        current_heart_date = self.get_current_heart_date()
        
        # Quarterly review events
        default_events = [
            CalendarEvent(
                event_id="Q1_REVIEW",
                depot_id="ALL",
                title="Q1 Strategic Review",
                description="Quarterly performance review and strategic planning",
                heart_date=self.get_heart_date_by_offset(current_heart_date, 84),  # End of Q1
                gregorian_date="",
                event_type="review",
                priority="high",
                status="planned",
                participants=["ZI", "Depot_Heads"],
                notes="Review Q1 performance and plan Q2 strategy"
            ),
            CalendarEvent(
                event_id="Q2_REVIEW",
                depot_id="ALL",
                title="Q2 Strategic Review",
                description="Quarterly performance review and strategic planning",
                heart_date=self.get_heart_date_by_offset(current_heart_date, 168),  # End of Q2
                gregorian_date="",
                event_type="review",
                priority="high",
                status="planned",
                participants=["ZI", "Depot_Heads"],
                notes="Review Q2 performance and plan Q3 strategy"
            ),
            CalendarEvent(
                event_id="Q3_REVIEW",
                depot_id="ALL",
                title="Q3 Strategic Review",
                description="Quarterly performance review and strategic planning",
                heart_date=self.get_heart_date_by_offset(current_heart_date, 252),  # End of Q3
                gregorian_date="",
                event_type="review",
                priority="high",
                status="planned",
                participants=["ZI", "Depot_Heads"],
                notes="Review Q3 performance and plan Q4 strategy"
            ),
            CalendarEvent(
                event_id="ANNUAL_REVIEW",
                depot_id="ALL",
                title="Annual Strategic Review",
                description="Annual performance review and strategic planning",
                heart_date=self.get_heart_date_by_offset(current_heart_date, 336),  # End of year
                gregorian_date="",
                event_type="review",
                priority="high",
                status="planned",
                participants=["ZI", "Depot_Heads", "Stakeholders"],
                notes="Annual review and next year planning"
            )
        ]
        
        for event in default_events:
            event.gregorian_date = self.heart_to_gregorian(event.heart_date).strftime("%Y-%m-%d")
            self.events[event.event_id] = event
        
        self.save_data()
    
    def gregorian_to_heart(self, gregorian_date: datetime.date) -> HeartDate:
        """Convert Gregorian date to Heart Calendar date"""
        year = gregorian_date.year
        
        # Heart year starts on March 21
        year_start = datetime.date(year, self.YEAR_START_MONTH, self.YEAR_START_DAY)
        
        # If date is before March 21, it belongs to previous Heart year
        if gregorian_date < year_start:
            year -= 1
            year_start = datetime.date(year, self.YEAR_START_MONTH, self.YEAR_START_DAY)
        
        # Calculate days since year start
        days_since_start = (gregorian_date - year_start).days
        
        # Calculate month and day
        total_days = days_since_start
        month_index = int(total_days // self.DAYS_PER_MONTH)
        day_in_month = total_days % self.DAYS_PER_MONTH
        
        # Handle edge case for last day of year
        if month_index >= len(self.MONTHS):
            month_index = len(self.MONTHS) - 1
            day_in_month = self.DAYS_PER_MONTH
        
        return HeartDate(
            year=year,
            month=self.MONTHS[month_index],
            day=day_in_month + 1  # 1-indexed
        )
    
    def heart_to_gregorian(self, heart_date: HeartDate) -> datetime.date:
        """Convert Heart Calendar date to Gregorian date"""
        # Find the index of the month
        month_index = self.MONTHS.index(heart_date.month)
        
        # Calculate days from year start
        days_from_start = (month_index * int(self.DAYS_PER_MONTH)) + int(heart_date.day) - 1
        
        # Add to year start date
        year_start = datetime.date(heart_date.year, self.YEAR_START_MONTH, self.YEAR_START_DAY)
        gregorian_date = year_start + datetime.timedelta(days=days_from_start)
        
        return gregorian_date
    
    def get_current_heart_date(self) -> HeartDate:
        """Get current Heart Calendar date"""
        return self.gregorian_to_heart(datetime.date.today())
    
    def get_heart_date_by_offset(self, base_date: HeartDate, offset_days: int) -> HeartDate:
        """Get Heart date by offset from base date"""
        gregorian_base = self.heart_to_gregorian(base_date)
        gregorian_target = gregorian_base + datetime.timedelta(days=offset_days)
        return self.gregorian_to_heart(gregorian_target)
    
    def add_event(self, event: CalendarEvent) -> bool:
        """Add a new calendar event"""
        # Calculate Gregorian date if not provided
        if not event.gregorian_date:
            event.gregorian_date = self.heart_to_gregorian(event.heart_date).strftime("%Y-%m-%d")
        
        self.events[event.event_id] = event
        self.save_data()
        return True
    
    def update_event(self, event_id: str, **kwargs) -> bool:
        """Update an existing calendar event"""
        if event_id not in self.events:
            return False
        
        event = self.events[event_id]
        for key, value in kwargs.items():
            if hasattr(event, key):
                setattr(event, key, value)
        
        # Recalculate Gregorian date if heart date changed
        if 'heart_date' in kwargs:
            event.gregorian_date = self.heart_to_gregorian(event.heart_date).strftime("%Y-%m-%d")
        
        self.save_data()
        return True
    
    def get_events_for_depot(self, depot_id: str) -> List[CalendarEvent]:
        """Get all events for a specific depot"""
        return [event for event in self.events.values() if event.depot_id == depot_id or event.depot_id == "ALL"]
    
    def get_events_for_date(self, heart_date: HeartDate) -> List[CalendarEvent]:
        """Get all events for a specific Heart date"""
        return [event for event in self.events.values() 
                if event.heart_date.year == heart_date.year and 
                event.heart_date.month == heart_date.month and
                int(event.heart_date.day) == int(heart_date.day)]
    
    def get_events_for_month(self, heart_date: HeartDate) -> List[CalendarEvent]:
        """Get all events for a specific Heart month"""
        return [event for event in self.events.values()
                if event.heart_date.year == heart_date.year and
                event.heart_date.month == heart_date.month]
    
    def get_upcoming_events(self, days: int = 30) -> List[CalendarEvent]:
        """Get upcoming events within specified days"""
        current_heart = self.get_current_heart_date()
        target_heart = self.get_heart_date_by_offset(current_heart, days)
        
        upcoming = []
        for event in self.events.values():
            if event.status == "cancelled":
                continue
            
            event_gregorian = datetime.datetime.strptime(event.gregorian_date, "%Y-%m-%d").date()
            current_gregorian = datetime.date.today()
            target_gregorian = current_gregorian + datetime.timedelta(days=days)
            
            if current_gregorian <= event_gregorian <= target_gregorian:
                upcoming.append(event)
        
        return sorted(upcoming, key=lambda x: x.gregorian_date)
    
    def generate_calendar_view(self, heart_date: HeartDate) -> str:
        """Generate a formatted calendar view for a month"""
        events = self.get_events_for_month(heart_date)
        
        view = []
        view.append("=" * 80)
        view.append(f"HEART CALENDAR: {heart_date.month.value} {heart_date.year}")
        view.append("=" * 80)
        view.append("")
        
        # Day-by-day view
        for day in range(1, int(self.DAYS_PER_MONTH) + 1):
            day_events = [e for e in events if int(e.heart_date.day) == day]
            
            view.append(f"Day {day:2d}:")
            if day_events:
                for event in day_events:
                    priority_emoji = "🔴" if event.priority == "high" else "🟡" if event.priority == "medium" else "🟢"
                    status_emoji = "✅" if event.status == "completed" else "🔄" if event.status == "in_progress" else "📋"
                    view.append(f"  {priority_emoji} {status_emoji} {event.title} ({event.depot_id})")
            else:
                view.append("  (No events)")
            view.append("")
        
        return "\n".join(view)
    
    def _serialize_event(self, event: CalendarEvent) -> dict:
        """Serialize event for JSON storage"""
        return {
            "event_id": event.event_id,
            "depot_id": event.depot_id,
            "title": event.title,
            "description": event.description,
            "heart_date": {
                "year": event.heart_date.year,
                "month": event.heart_date.month.value,
                "day": event.heart_date.day
            },
            "gregorian_date": event.gregorian_date,
            "event_type": event.event_type,
            "priority": event.priority,
            "status": event.status,
            "participants": event.participants,
            "notes": event.notes
        }
    
    def _deserialize_event(self, data: dict) -> CalendarEvent:
        """Deserialize event from JSON storage"""
        heart_date_data = data["heart_date"]
        heart_date = HeartDate(
            year=heart_date_data["year"],
            month=HeartMonth(heart_date_data["month"]),
            day=heart_date_data["day"]
        )
        
        return CalendarEvent(
            event_id=data["event_id"],
            depot_id=data["depot_id"],
            title=data["title"],
            description=data["description"],
            heart_date=heart_date,
            gregorian_date=data["gregorian_date"],
            event_type=data["event_type"],
            priority=data["priority"],
            status=data["status"],
            participants=data["participants"],
            notes=data.get("notes", "")
        )


class DepotCalendarIntegration:
    """Integration between Heart Calendar and depot operations"""
    
    def __init__(self, calendar: HeartCalendar):
        self.calendar = calendar
        self.depot_schedules = {
            "TZI.TR.CON": "Consort Depot",
            "TZI.SCR.DEP.BODY": "Scribe Depot",
            "TZI.CSH.DEP.SOUL": "CashingHouse Depot",
            "TZI.HLD.DEP.GNOSIS": "Holdings Depot"
        }
    
    def create_depot_schedule(self, depot_id: str, heart_date: HeartDate) -> str:
        """Create daily schedule for a depot based on Heart Calendar"""
        events = self.calendar.get_events_for_depot(depot_id)
        month_events = [e for e in events if e.heart_date.month == heart_date.month]
        
        schedule = []
        schedule.append("=" * 80)
        schedule.append(f"{self.depot_schedules.get(depot_id, depot_id)} DAILY SCHEDULE")
        schedule.append(f"Heart Date: {heart_date}")
        schedule.append("=" * 80)
        schedule.append("")
        
        # Morning tasks
        schedule.append("🌅 MORNING CHECKLIST:")
        morning_tasks = self._get_morning_tasks(depot_id)
        for task in morning_tasks:
            schedule.append(f"  ☐ {task}")
        schedule.append("")
        
        # Mid-day tasks
        schedule.append("☀️ MID-DAY CHECKLIST:")
        midday_tasks = self._get_midday_tasks(depot_id)
        for task in midday_tasks:
            schedule.append(f"  ☐ {task}")
        schedule.append("")
        
        # Evening tasks
        schedule.append("🌙 EVENING CHECKLIST:")
        evening_tasks = self._get_evening_tasks(depot_id)
        for task in evening_tasks:
            schedule.append(f"  ☐ {task}")
        schedule.append("")
        
        # Today's events
        today_events = [e for e in month_events if int(e.heart_date.day) == int(heart_date.day)]
        if today_events:
            schedule.append("📅 TODAY'S EVENTS:")
            for event in today_events:
                schedule.append(f"  • {event.title} - {event.description}")
            schedule.append("")
        
        return "\n".join(schedule)
    
    def _get_morning_tasks(self, depot_id: str) -> List[str]:
        """Get morning checklist tasks for a depot"""
        tasks = {
            "TZI.TR.CON": [
                "Review content calendar for today",
                "Check social media engagement from previous day",
                "Plan creative production schedule",
                "Review trend alerts and opportunities"
            ],
            "TZI.SCR.DEP.BODY": [
                "Review documentation needs for today",
                "Check contract status and deadlines",
                "Review infrastructure performance",
                "Plan documentation updates"
            ],
            "TZI.CSH.DEP.SOUL": [
                "Review revenue from previous day",
                "Check payment processing status",
                "Review financial alerts and anomalies",
                "Plan financial optimization activities"
            ],
            "TZI.HLD.DEP.GNOSIS": [
                "Review asset performance from previous day",
                "Check investment opportunities and alerts",
                "Review resource allocation status",
                "Plan investment activities"
            ]
        }
        return tasks.get(depot_id, ["Review daily priorities", "Check system status"])
    
    def _get_midday_tasks(self, depot_id: str) -> List[str]:
        """Get mid-day checklist tasks for a depot"""
        tasks = {
            "TZI.TR.CON": [
                "Execute content production schedule",
                "Monitor real-time engagement",
                "Coordinate with other depots as needed",
                "Address any operational issues"
            ],
            "TZI.SCR.DEP.BODY": [
                "Execute documentation tasks",
                "Monitor system performance",
                "Process contract requests",
                "Update knowledge base as needed"
            ],
            "TZI.CSH.DEP.SOUL": [
                "Monitor real-time revenue streams",
                "Process payment requests",
                "Update financial dashboards",
                "Coordinate with other depots on financial matters"
            ],
            "TZI.HLD.DEP.GNOSIS": [
                "Execute investment decisions",
                "Monitor real-time asset performance",
                "Coordinate resource allocation",
                "Address any investment issues"
            ]
        }
        return tasks.get(depot_id, ["Execute scheduled tasks", "Monitor operations"])
    
    def _get_evening_tasks(self, depot_id: str) -> List[str]:
        """Get evening checklist tasks for a depot"""
        tasks = {
            "TZI.TR.CON": [
                "Review daily performance metrics",
                "Plan tomorrow's content schedule",
                "Update stakeholder sentiment tracking",
                "Document lessons learned"
            ],
            "TZI.SCR.DEP.BODY": [
                "Review daily documentation output",
                "Update contract status tracking",
                "Plan tomorrow's documentation priorities",
                "Archive completed documents"
            ],
            "TZI.CSH.DEP.SOUL": [
                "Review daily financial performance",
                "Reconcile daily transactions",
                "Update financial forecasts",
                "Plan tomorrow's financial priorities"
            ],
            "TZI.HLD.DEP.GNOSIS": [
                "Review daily portfolio performance",
                "Update asset valuations",
                "Plan tomorrow's investment priorities",
                "Document investment decisions"
            ]
        }
        return tasks.get(depot_id, ["Review daily performance", "Plan tomorrow's priorities"])


def main():
    """Main function for testing and demonstration"""
    calendar = HeartCalendar()
    integration = DepotCalendarIntegration(calendar)
    
    # Get current Heart date
    current_heart = calendar.get_current_heart_date()
    print(f"Current Heart Date: {current_heart}")
    print(f"Gregorian Equivalent: {calendar.heart_to_gregorian(current_heart)}")
    print()
    
    # Generate calendar view for current month
    print(calendar.generate_calendar_view(current_heart))
    print()
    
    # Generate depot schedules
    for depot_id in ["TZI.TR.CON", "TZI.SCR.DEP.BODY", "TZI.CSH.DEP.SOUL", "TZI.HLD.DEP.GNOSIS"]:
        print(integration.create_depot_schedule(depot_id, current_heart))
        print()


if __name__ == "__main__":
    main()