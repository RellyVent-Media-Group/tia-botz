#!/usr/bin/env python3
"""
Daily Checklist Automation System
Automates the 3x daily checklist system for all TZU depots
Integrates with Heart Calendar for scheduling and tracking
"""

import json
import datetime
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict
from enum import Enum
from heart_calendar_integration import HeartCalendar, HeartDate, DepotCalendarIntegration, HeartMonth


class ChecklistTime(Enum):
    MORNING = "morning"
    MID_DAY = "mid_day"
    EVENING = "evening"


class TaskStatus(Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"


@dataclass
class ChecklistTask:
    """Individual checklist task"""
    task_id: str
    depot_id: str
    time_period: ChecklistTime
    task_name: str
    description: str
    priority: str
    estimated_duration: int  # minutes
    status: TaskStatus
    completed_at: str
    notes: str
    assigned_to: str


@dataclass
class DailyChecklist:
    """Complete daily checklist for a depot"""
    checklist_id: str
    depot_id: str
    heart_date: HeartDate
    gregorian_date: str
    morning_tasks: List[ChecklistTask]
    mid_day_tasks: List[ChecklistTask]
    evening_tasks: List[ChecklistTask]
    overall_completion: float
    created_at: str
    updated_at: str


class DailyChecklistAutomation:
    """Main daily checklist automation system"""
    
    def __init__(self, data_path: str = "daily_checklist_data.json", 
                 calendar: HeartCalendar = None):
        self.data_path = data_path
        self.calendar = calendar or HeartCalendar()
        self.checklists: Dict[str, DailyChecklist] = {}
        self.depot_integration = DepotCalendarIntegration(self.calendar)
        
        # Default task templates for each depot and time period
        self.task_templates = {
            "TZI.TR.CON": {
                ChecklistTime.MORNING: [
                    {"task": "Review content calendar for today", "priority": "high", "duration": 15},
                    {"task": "Check social media engagement from previous day", "priority": "medium", "duration": 10},
                    {"task": "Plan creative production schedule", "priority": "high", "duration": 20},
                    {"task": "Review trend alerts and opportunities", "priority": "medium", "duration": 15}
                ],
                ChecklistTime.MID_DAY: [
                    {"task": "Execute content production schedule", "priority": "high", "duration": 60},
                    {"task": "Monitor real-time engagement", "priority": "medium", "duration": 10},
                    {"task": "Coordinate with other depots as needed", "priority": "low", "duration": 15},
                    {"task": "Address any operational issues", "priority": "high", "duration": 30}
                ],
                ChecklistTime.EVENING: [
                    {"task": "Review daily performance metrics", "priority": "high", "duration": 20},
                    {"task": "Plan tomorrow's content schedule", "priority": "high", "duration": 15},
                    {"task": "Update stakeholder sentiment tracking", "priority": "medium", "duration": 10},
                    {"task": "Document lessons learned", "priority": "low", "duration": 10}
                ]
            },
            "TZI.SCR.DEP.BODY": {
                ChecklistTime.MORNING: [
                    {"task": "Review documentation needs for today", "priority": "high", "duration": 15},
                    {"task": "Check contract status and deadlines", "priority": "high", "duration": 10},
                    {"task": "Review infrastructure performance", "priority": "medium", "duration": 15},
                    {"task": "Plan documentation updates", "priority": "medium", "duration": 20}
                ],
                ChecklistTime.MID_DAY: [
                    {"task": "Execute documentation tasks", "priority": "high", "duration": 90},
                    {"task": "Monitor system performance", "priority": "medium", "duration": 10},
                    {"task": "Process contract requests", "priority": "high", "duration": 30},
                    {"task": "Update knowledge base as needed", "priority": "low", "duration": 20}
                ],
                ChecklistTime.EVENING: [
                    {"task": "Review daily documentation output", "priority": "high", "duration": 15},
                    {"task": "Update contract status tracking", "priority": "medium", "duration": 10},
                    {"task": "Plan tomorrow's documentation priorities", "priority": "high", "duration": 15},
                    {"task": "Archive completed documents", "priority": "low", "duration": 10}
                ]
            },
            "TZI.CSH.DEP.SOUL": {
                ChecklistTime.MORNING: [
                    {"task": "Review revenue from previous day", "priority": "high", "duration": 15},
                    {"task": "Check payment processing status", "priority": "high", "duration": 10},
                    {"task": "Review financial alerts and anomalies", "priority": "high", "duration": 15},
                    {"task": "Plan financial optimization activities", "priority": "medium", "duration": 20}
                ],
                ChecklistTime.MID_DAY: [
                    {"task": "Monitor real-time revenue streams", "priority": "high", "duration": 15},
                    {"task": "Process payment requests", "priority": "high", "duration": 30},
                    {"task": "Update financial dashboards", "priority": "medium", "duration": 15},
                    {"task": "Coordinate with other depots on financial matters", "priority": "low", "duration": 20}
                ],
                ChecklistTime.EVENING: [
                    {"task": "Review daily financial performance", "priority": "high", "duration": 20},
                    {"task": "Reconcile daily transactions", "priority": "high", "duration": 15},
                    {"task": "Update financial forecasts", "priority": "medium", "duration": 15},
                    {"task": "Plan tomorrow's financial priorities", "priority": "high", "duration": 15}
                ]
            },
            "TZI.HLD.DEP.GNOSIS": {
                ChecklistTime.MORNING: [
                    {"task": "Review asset performance from previous day", "priority": "high", "duration": 15},
                    {"task": "Check investment opportunities and alerts", "priority": "high", "duration": 20},
                    {"task": "Review resource allocation status", "priority": "medium", "duration": 15},
                    {"task": "Plan investment activities", "priority": "high", "duration": 20}
                ],
                ChecklistTime.MID_DAY: [
                    {"task": "Execute investment decisions", "priority": "high", "duration": 30},
                    {"task": "Monitor real-time asset performance", "priority": "medium", "duration": 15},
                    {"task": "Coordinate resource allocation", "priority": "medium", "duration": 20},
                    {"task": "Address any investment issues", "priority": "high", "duration": 30}
                ],
                ChecklistTime.EVENING: [
                    {"task": "Review daily portfolio performance", "priority": "high", "duration": 20},
                    {"task": "Update asset valuations", "priority": "medium", "duration": 15},
                    {"task": "Plan tomorrow's investment priorities", "priority": "high", "duration": 15},
                    {"task": "Document investment decisions", "priority": "low", "duration": 10}
                ]
            }
        }
        
        self.load_data()
    
    def load_data(self):
        """Load checklist data from file"""
        try:
            with open(self.data_path, 'r') as f:
                data = json.load(f)
                for checklist_id, checklist_data in data.items():
                    self.checklists[checklist_id] = self._deserialize_checklist(checklist_data)
        except FileNotFoundError:
            pass  # Start with empty checklists
    
    def save_data(self):
        """Save checklist data to file"""
        data = {}
        for checklist_id, checklist in self.checklists.items():
            data[checklist_id] = self._serialize_checklist(checklist)
        
        with open(self.data_path, 'w') as f:
            json.dump(data, f, indent=2, default=str)
    
    def create_daily_checklist(self, depot_id: str, heart_date: HeartDate = None) -> str:
        """Create a daily checklist for a specific depot"""
        if heart_date is None:
            heart_date = self.calendar.get_current_heart_date()
        
        checklist_id = f"{depot_id}_{heart_date.year}_{heart_date.month.value}_{int(heart_date.day)}"
        
        # Create tasks based on templates
        morning_tasks = self._create_tasks_from_template(depot_id, ChecklistTime.MORNING, heart_date)
        mid_day_tasks = self._create_tasks_from_template(depot_id, ChecklistTime.MID_DAY, heart_date)
        evening_tasks = self._create_tasks_from_template(depot_id, ChecklistTime.EVENING, heart_date)
        
        gregorian_date = self.calendar.heart_to_gregorian(heart_date).strftime("%Y-%m-%d")
        
        checklist = DailyChecklist(
            checklist_id=checklist_id,
            depot_id=depot_id,
            heart_date=heart_date,
            gregorian_date=gregorian_date,
            morning_tasks=morning_tasks,
            mid_day_tasks=mid_day_tasks,
            evening_tasks=evening_tasks,
            overall_completion=0.0,
            created_at=datetime.datetime.now().isoformat(),
            updated_at=datetime.datetime.now().isoformat()
        )
        
        self.checklists[checklist_id] = checklist
        self.save_data()
        return checklist_id
    
    def _create_tasks_from_template(self, depot_id: str, time_period: ChecklistTime, 
                                   heart_date: HeartDate) -> List[ChecklistTask]:
        """Create tasks from template for a specific time period"""
        templates = self.task_templates.get(depot_id, {}).get(time_period, [])
        tasks = []
        
        for i, template in enumerate(templates):
            task_id = f"{depot_id}_{time_period.value}_{heart_date.month.value}_{int(heart_date.day)}_{i}"
            
            task = ChecklistTask(
                task_id=task_id,
                depot_id=depot_id,
                time_period=time_period,
                task_name=template["task"],
                description=f"Automated task: {template['task']}",
                priority=template["priority"],
                estimated_duration=template["duration"],
                status=TaskStatus.PENDING,
                completed_at="",
                notes="",
                assigned_to="auto"
            )
            
            tasks.append(task)
        
        return tasks
    
    def complete_task(self, checklist_id: str, task_id: str, notes: str = "") -> bool:
        """Mark a task as completed"""
        if checklist_id not in self.checklists:
            return False
        
        checklist = self.checklists[checklist_id]
        task = self._find_task(checklist, task_id)
        
        if not task:
            return False
        
        task.status = TaskStatus.COMPLETED
        task.completed_at = datetime.datetime.now().isoformat()
        if notes:
            task.notes = notes
        
        checklist.updated_at = datetime.datetime.now().isoformat()
        checklist.overall_completion = self._calculate_completion(checklist)
        
        self.save_data()
        return True
    
    def skip_task(self, checklist_id: str, task_id: str, notes: str = "") -> bool:
        """Skip a task"""
        if checklist_id not in self.checklists:
            return False
        
        checklist = self.checklists[checklist_id]
        task = self._find_task(checklist, task_id)
        
        if not task:
            return False
        
        task.status = TaskStatus.SKIPPED
        if notes:
            task.notes = notes
        
        checklist.updated_at = datetime.datetime.now().isoformat()
        checklist.overall_completion = self._calculate_completion(checklist)
        
        self.save_data()
        return True
    
    def _find_task(self, checklist: DailyChecklist, task_id: str) -> Optional[ChecklistTask]:
        """Find a task within a checklist"""
        all_tasks = checklist.morning_tasks + checklist.mid_day_tasks + checklist.evening_tasks
        for task in all_tasks:
            if task.task_id == task_id:
                return task
        return None
    
    def _calculate_completion(self, checklist: DailyChecklist) -> float:
        """Calculate overall completion percentage"""
        all_tasks = checklist.morning_tasks + checklist.mid_day_tasks + checklist.evening_tasks
        if not all_tasks:
            return 0.0
        
        completed = sum(1 for task in all_tasks if task.status == TaskStatus.COMPLETED)
        return (completed / len(all_tasks)) * 100
    
    def get_checklist_for_date(self, depot_id: str, heart_date: HeartDate) -> Optional[DailyChecklist]:
        """Get checklist for a specific depot and date"""
        checklist_id = f"{depot_id}_{heart_date.year}_{heart_date.month.value}_{int(heart_date.day)}"
        return self.checklists.get(checklist_id)
    
    def get_todays_checklists(self) -> Dict[str, DailyChecklist]:
        """Get all checklists for today"""
        current_heart = self.calendar.get_current_heart_date()
        todays_checklists = {}
        
        for depot_id in ["TZI.TR.CON", "TZI.SCR.DEP.BODY", "TZI.CSH.DEP.SOUL", "TZI.HLD.DEP.GNOSIS"]:
            checklist = self.get_checklist_for_date(depot_id, current_heart)
            if not checklist:
                # Create if doesn't exist
                checklist_id = self.create_daily_checklist(depot_id, current_heart)
                checklist = self.checklists[checklist_id]
            
            todays_checklists[depot_id] = checklist
        
        return todays_checklists
    
    def generate_daily_report(self) -> str:
        """Generate comprehensive daily checklist report"""
        todays_checklists = self.get_todays_checklists()
        
        report = []
        report.append("=" * 80)
        report.append("TZU DAILY CHECKLIST REPORT")
        report.append(f"Heart Date: {self.calendar.get_current_heart_date()}")
        report.append(f"Gregorian Date: {datetime.date.today().strftime('%Y-%m-%d')}")
        report.append(f"Generated: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append("=" * 80)
        report.append("")
        
        depot_names = {
            "TZI.TR.CON": "Consort Depot",
            "TZI.SCR.DEP.BODY": "Scribe Depot",
            "TZI.CSH.DEP.SOUL": "CashingHouse Depot",
            "TZI.HLD.DEP.GNOSIS": "Holdings Depot"
        }
        
        total_completion = 0
        depot_count = len(todays_checklists)
        
        for depot_id, checklist in todays_checklists.items():
            depot_name = depot_names.get(depot_id, depot_id)
            completion = checklist.overall_completion
            total_completion += completion
            
            report.append(f"{depot_name}:")
            report.append(f"  Overall Completion: {completion:.1f}%")
            report.append("")
            
            # Morning tasks
            report.append("  🌅 MORNING CHECKLIST:")
            for task in checklist.morning_tasks:
                status_emoji = "✅" if task.status == TaskStatus.COMPLETED else "⏳" if task.status == TaskStatus.IN_PROGRESS else "⏭️" if task.status == TaskStatus.SKIPPED else "☐"
                priority_emoji = "🔴" if task.priority == "high" else "🟡" if task.priority == "medium" else "🟢"
                report.append(f"    {status_emoji} {priority_emoji} {task.task_name} ({task.estimated_duration} min)")
            report.append("")
            
            # Mid-day tasks
            report.append("  ☀️ MID-DAY CHECKLIST:")
            for task in checklist.mid_day_tasks:
                status_emoji = "✅" if task.status == TaskStatus.COMPLETED else "⏳" if task.status == TaskStatus.IN_PROGRESS else "⏭️" if task.status == TaskStatus.SKIPPED else "☐"
                priority_emoji = "🔴" if task.priority == "high" else "🟡" if task.priority == "medium" else "🟢"
                report.append(f"    {status_emoji} {priority_emoji} {task.task_name} ({task.estimated_duration} min)")
            report.append("")
            
            # Evening tasks
            report.append("  🌙 EVENING CHECKLIST:")
            for task in checklist.evening_tasks:
                status_emoji = "✅" if task.status == TaskStatus.COMPLETED else "⏳" if task.status == TaskStatus.IN_PROGRESS else "⏭️" if task.status == TaskStatus.SKIPPED else "☐"
                priority_emoji = "🔴" if task.priority == "high" else "🟡" if task.priority == "medium" else "🟢"
                report.append(f"    {status_emoji} {priority_emoji} {task.task_name} ({task.estimated_duration} min)")
            report.append("")
            
            report.append("-" * 80)
            report.append("")
        
        # Overall summary
        overall_avg = total_completion / depot_count if depot_count > 0 else 0
        report.append(f"OVERALL COMPLETION: {overall_avg:.1f}%")
        report.append("")
        
        # Incomplete high-priority tasks
        report.append("⚠️  INCOMPLETE HIGH-PRIORITY TASKS:")
        incomplete_high_priority = []
        
        for depot_id, checklist in todays_checklists.items():
            all_tasks = checklist.morning_tasks + checklist.mid_day_tasks + checklist.evening_tasks
            for task in all_tasks:
                if task.priority == "high" and task.status == TaskStatus.PENDING:
                    incomplete_high_priority.append((depot_id, task))
        
        if incomplete_high_priority:
            for depot_id, task in incomplete_high_priority:
                depot_name = depot_names.get(depot_id, depot_id)
                report.append(f"  • {depot_name}: {task.task_name} ({task.time_period.value})")
        else:
            report.append("  All high-priority tasks completed!")
        
        report.append("")
        
        return "\n".join(report)
    
    def auto_complete_checklist(self, checklist_id: str) -> Dict:
        """Auto-complete routine tasks based on calendar events"""
        if checklist_id not in self.checklists:
            return {"success": False, "message": "Checklist not found"}
        
        checklist = self.checklists[checklist_id]
        auto_completed = []
        
        # Get calendar events for today
        todays_events = self.calendar.get_events_for_date(checklist.heart_date)
        
        # Auto-complete routine tasks that are covered by calendar events
        for event in todays_events:
            if event.event_type == "strategic":
                # Find and complete strategic planning tasks
                for task in checklist.morning_tasks:
                    if "strategic" in task.task_name.lower() and task.status == TaskStatus.PENDING:
                        task.status = TaskStatus.COMPLETED
                        task.completed_at = datetime.datetime.now().isoformat()
                        task.notes = f"Auto-completed via calendar event: {event.title}"
                        auto_completed.append(task.task_id)
        
        checklist.overall_completion = self._calculate_completion(checklist)
        checklist.updated_at = datetime.datetime.now().isoformat()
        self.save_data()
        
        return {
            "success": True,
            "auto_completed": auto_completed,
            "new_completion": checklist.overall_completion
        }
    
    def _serialize_checklist(self, checklist: DailyChecklist) -> dict:
        """Serialize checklist for JSON storage"""
        return {
            "checklist_id": checklist.checklist_id,
            "depot_id": checklist.depot_id,
            "heart_date": {
                "year": checklist.heart_date.year,
                "month": checklist.heart_date.month.value,
                "day": checklist.heart_date.day
            },
            "gregorian_date": checklist.gregorian_date,
            "morning_tasks": [self._serialize_task(t) for t in checklist.morning_tasks],
            "mid_day_tasks": [self._serialize_task(t) for t in checklist.mid_day_tasks],
            "evening_tasks": [self._serialize_task(t) for t in checklist.evening_tasks],
            "overall_completion": checklist.overall_completion,
            "created_at": checklist.created_at,
            "updated_at": checklist.updated_at
        }
    
    def _serialize_task(self, task: ChecklistTask) -> dict:
        """Serialize task for JSON storage"""
        return {
            "task_id": task.task_id,
            "depot_id": task.depot_id,
            "time_period": task.time_period.value,
            "task_name": task.task_name,
            "description": task.description,
            "priority": task.priority,
            "estimated_duration": task.estimated_duration,
            "status": task.status.value,
            "completed_at": task.completed_at,
            "notes": task.notes,
            "assigned_to": task.assigned_to
        }
    
    def _deserialize_checklist(self, data: dict) -> DailyChecklist:
        """Deserialize checklist from JSON storage"""
        heart_date_data = data["heart_date"]
        heart_date = HeartDate(
            year=heart_date_data["year"],
            month=HeartMonth(heart_date_data["month"]),
            day=heart_date_data["day"]
        )
        
        return DailyChecklist(
            checklist_id=data["checklist_id"],
            depot_id=data["depot_id"],
            heart_date=heart_date,
            gregorian_date=data["gregorian_date"],
            morning_tasks=[self._deserialize_task(t) for t in data["morning_tasks"]],
            mid_day_tasks=[self._deserialize_task(t) for t in data["mid_day_tasks"]],
            evening_tasks=[self._deserialize_task(t) for t in data["evening_tasks"]],
            overall_completion=data["overall_completion"],
            created_at=data["created_at"],
            updated_at=data["updated_at"]
        )
    
    def _deserialize_task(self, data: dict) -> ChecklistTask:
        """Deserialize task from JSON storage"""
        return ChecklistTask(
            task_id=data["task_id"],
            depot_id=data["depot_id"],
            time_period=ChecklistTime(data["time_period"]),
            task_name=data["task_name"],
            description=data["description"],
            priority=data["priority"],
            estimated_duration=data["estimated_duration"],
            status=TaskStatus(data["status"]),
            completed_at=data["completed_at"],
            notes=data["notes"],
            assigned_to=data["assigned_to"]
        )


def main():
    """Main function for testing and demonstration"""
    automation = DailyChecklistAutomation()
    
    # Create today's checklists for all depots
    todays_checklists = automation.get_todays_checklists()
    
    print(f"Created {len(todays_checklists)} daily checklists")
    print()
    
    # Generate daily report
    print(automation.generate_daily_report())
    
    # Simulate completing some tasks
    for depot_id, checklist in todays_checklists.items():
        # Complete first morning task
        if checklist.morning_tasks:
            first_task = checklist.morning_tasks[0]
            automation.complete_task(checklist.checklist_id, first_task.task_id, "Completed via automation")
    
    print("\nAfter completing first morning task for each depot:")
    print(automation.generate_daily_report())


if __name__ == "__main__":
    main()