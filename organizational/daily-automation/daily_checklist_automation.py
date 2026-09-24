#!/usr/bin/env python3
"""
Daily Checklist Automation System
3x daily checklists (morning, mid-day, evening) with Heart Calendar integration
"""

import json
import os
from datetime import datetime, date, timedelta
from typing import Dict, List, Optional
from enum import Enum
from dataclasses import dataclass, asdict
import sys
import os
# Add parent directory to path to import heart_calendar
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
heart_calendar_dir = os.path.join(parent_dir, 'heart-calendar')
sys.path.append(heart_calendar_dir)
from heart_calendar import HeartCalendar, HeartDate, DepotType


class TimeOfDay(Enum):
    """Time periods for daily checklists"""
    MORNING = "morning"
    MID_DAY = "mid_day"
    EVENING = "evening"


class TaskStatus(Enum):
    """Status of checklist tasks"""
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"


@dataclass
class ChecklistTask:
    """Represents a task in a daily checklist"""
    id: str
    title: str
    description: str = ""
    status: TaskStatus = TaskStatus.PENDING
    priority: str = "medium"  # low, medium, high
    depot: Optional[DepotType] = None
    estimated_minutes: int = 15
    completed_at: Optional[str] = None
    
    def to_dict(self):
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "status": self.status.value,
            "priority": self.priority,
            "depot": self.depot.value if self.depot else None,
            "estimated_minutes": self.estimated_minutes,
            "completed_at": self.completed_at
        }


@dataclass
class DailyChecklist:
    """Represents a daily checklist for a specific time period"""
    date: str  # ISO format date string
    time_period: TimeOfDay
    tasks: List[ChecklistTask]
    depot: Optional[DepotType] = None
    completion_percentage: float = 0.0
    notes: str = ""
    
    def to_dict(self):
        return {
            "date": self.date,
            "time_period": self.time_period.value,
            "tasks": [task.to_dict() for task in self.tasks],
            "depot": self.depot.value if self.depot else None,
            "completion_percentage": self.completion_percentage,
            "notes": self.notes
        }
    
    def calculate_completion(self):
        """Calculate completion percentage based on task statuses"""
        if not self.tasks:
            self.completion_percentage = 0.0
            return
        
        completed = sum(1 for task in self.tasks if task.status == TaskStatus.COMPLETED)
        self.completion_percentage = (completed / len(self.tasks)) * 100


class DailyChecklistAutomation:
    """Main daily checklist automation system with Heart Calendar integration"""
    
    def __init__(self, data_dir: str = None):
        """Initialize the Daily Checklist Automation system"""
        if data_dir is None:
            self.data_dir = os.path.dirname(os.path.abspath(__file__))
        else:
            self.data_dir = data_dir
            
        self.checklists_file = os.path.join(self.data_dir, "checklists.json")
        self.templates_file = os.path.join(self.data_dir, "checklist_templates.json")
        self.checklists: Dict[str, DailyChecklist] = {}
        self.templates: Dict[str, Dict] = {}
        
        # Initialize Heart Calendar
        self.heart_calendar = HeartCalendar()
        
        self._load_data()
    
    def _load_data(self):
        """Load checklists and templates from JSON files"""
        # Load checklists
        if os.path.exists(self.checklists_file):
            try:
                with open(self.checklists_file, 'r') as f:
                    data = json.load(f)
                    for checklist_data in data:
                        tasks = []
                        for task_data in checklist_data["tasks"]:
                            depot = DepotType(task_data["depot"]) if task_data.get("depot") else None
                            task = ChecklistTask(
                                id=task_data["id"],
                                title=task_data["title"],
                                description=task_data.get("description", ""),
                                status=TaskStatus(task_data["status"]),
                                priority=task_data.get("priority", "medium"),
                                depot=depot,
                                estimated_minutes=task_data.get("estimated_minutes", 15),
                                completed_at=task_data.get("completed_at")
                            )
                            tasks.append(task)
                        
                        depot = DepotType(checklist_data["depot"]) if checklist_data.get("depot") else None
                        checklist = DailyChecklist(
                            date=checklist_data["date"],
                            time_period=TimeOfDay(checklist_data["time_period"]),
                            tasks=tasks,
                            depot=depot,
                            completion_percentage=checklist_data.get("completion_percentage", 0.0),
                            notes=checklist_data.get("notes", "")
                        )
                        key = f"{checklist.date}_{checklist.time_period.value}"
                        self.checklists[key] = checklist
            except Exception as e:
                print(f"Error loading checklists: {e}")
        
        # Load templates
        if os.path.exists(self.templates_file):
            try:
                with open(self.templates_file, 'r') as f:
                    self.templates = json.load(f)
            except Exception as e:
                print(f"Error loading templates: {e}")
        else:
            # Create default templates
            self._create_default_templates()
    
    def _save_data(self):
        """Save checklists and templates to JSON files"""
        try:
            # Save checklists
            checklists_data = [checklist.to_dict() for checklist in self.checklists.values()]
            with open(self.checklists_file, 'w') as f:
                json.dump(checklists_data, f, indent=2)
            
            # Save templates
            with open(self.templates_file, 'w') as f:
                json.dump(self.templates, f, indent=2)
        except Exception as e:
            print(f"Error saving data: {e}")
    
    def _create_default_templates(self):
        """Create default checklist templates for each depot and time period"""
        self.templates = {
            "general": {
                "morning": [
                    {"title": "Review daily priorities", "priority": "high", "estimated_minutes": 10},
                    {"title": "Check email and communications", "priority": "medium", "estimated_minutes": 15},
                    {"title": "Review calendar and schedule", "priority": "high", "estimated_minutes": 5},
                    {"title": "Quick team sync (if applicable)", "priority": "medium", "estimated_minutes": 15}
                ],
                "mid_day": [
                    {"title": "Execute primary tasks", "priority": "high", "estimated_minutes": 60},
                    {"title": "Progress update on key projects", "priority": "medium", "estimated_minutes": 15},
                    {"title": "Address urgent issues", "priority": "high", "estimated_minutes": 20},
                    {"title": "Documentation and notes", "priority": "low", "estimated_minutes": 10}
                ],
                "evening": [
                    {"title": "Daily review and reflection", "priority": "medium", "estimated_minutes": 15},
                    {"title": "Plan tomorrow's priorities", "priority": "high", "estimated_minutes": 10},
                    {"title": "Update tracking systems", "priority": "medium", "estimated_minutes": 10},
                    {"title": "Clean up and organize workspace", "priority": "low", "estimated_minutes": 5}
                ]
            },
            "Consort": {
                "morning": [
                    {"title": "Review content pipeline status", "priority": "high", "estimated_minutes": 15},
                    {"title": "Check social media engagement metrics", "priority": "medium", "estimated_minutes": 10},
                    {"title": "Review character consistency (Mac & Mary)", "priority": "high", "estimated_minutes": 10},
                    {"title": "Plan content creation schedule", "priority": "high", "estimated_minutes": 15}
                ],
                "mid_day": [
                    {"title": "Content creation and editing", "priority": "high", "estimated_minutes": 90},
                    {"title": "Platform posting and scheduling", "priority": "high", "estimated_minutes": 20},
                    {"title": "Engagement with audience", "priority": "medium", "estimated_minutes": 30},
                    {"title": "Performance tracking", "priority": "medium", "estimated_minutes": 15}
                ],
                "evening": [
                    {"title": "Review content performance", "priority": "medium", "estimated_minutes": 15},
                    {"title": "Update content calendar", "priority": "medium", "estimated_minutes": 10},
                    {"title": "Plan tomorrow's content", "priority": "high", "estimated_minutes": 15},
                    {"title": "Archive completed content", "priority": "low", "estimated_minutes": 10}
                ]
            },
            "Scribe": {
                "morning": [
                    {"title": "Review document queue", "priority": "high", "estimated_minutes": 15},
                    {"title": "Check contract deadlines", "priority": "high", "estimated_minutes": 10},
                    {"title": "Review documentation requests", "priority": "medium", "estimated_minutes": 10},
                    {"title": "Plan document processing schedule", "priority": "high", "estimated_minutes": 15}
                ],
                "mid_day": [
                    {"title": "Document processing and management", "priority": "high", "estimated_minutes": 90},
                    {"title": "Contract management and review", "priority": "high", "estimated_minutes": 30},
                    {"title": "Version control updates", "priority": "medium", "estimated_minutes": 15},
                    {"title": "Document search and organization", "priority": "low", "estimated_minutes": 15}
                ],
                "evening": [
                    {"title": "Review document completion status", "priority": "medium", "estimated_minutes": 15},
                    {"title": "Update contract tracking", "priority": "medium", "estimated_minutes": 10},
                    {"title": "Plan tomorrow's document work", "priority": "high", "estimated_minutes": 10},
                    {"title": "Backup critical documents", "priority": "medium", "estimated_minutes": 10}
                ]
            },
            "CashingHouse": {
                "morning": [
                    {"title": "Review revenue metrics across platforms", "priority": "high", "estimated_minutes": 15},
                    {"title": "Check transaction status and pending payments", "priority": "high", "estimated_minutes": 15},
                    {"title": "Review commission calculations", "priority": "medium", "estimated_minutes": 10},
                    {"title": "Analyze pricing and performance", "priority": "medium", "estimated_minutes": 15}
                ],
                "mid_day": [
                    {"title": "Financial tracking and updates", "priority": "high", "estimated_minutes": 60},
                    {"title": "Commission processing", "priority": "high", "estimated_minutes": 30},
                    {"title": "Pricing analysis and optimization", "priority": "medium", "estimated_minutes": 20},
                    {"title": "Financial reporting preparation", "priority": "medium", "estimated_minutes": 15}
                ],
                "evening": [
                    {"title": "Daily financial review", "priority": "high", "estimated_minutes": 15},
                    {"title": "Update financial tracking systems", "priority": "medium", "estimated_minutes": 10},
                    {"title": "Review revenue trends", "priority": "medium", "estimated_minutes": 15},
                    {"title": "Plan tomorrow's financial priorities", "priority": "high", "estimated_minutes": 10}
                ]
            },
            "Holdings": {
                "morning": [
                    {"title": "Review portfolio performance", "priority": "high", "estimated_minutes": 20},
                    {"title": "Check asset status and valuations", "priority": "high", "estimated_minutes": 15},
                    {"title": "Review investment opportunities", "priority": "medium", "estimated_minutes": 15},
                    {"title": "Analyze market trends", "priority": "medium", "estimated_minutes": 15}
                ],
                "mid_day": [
                    {"title": "Investment analysis and research", "priority": "high", "estimated_minutes": 60},
                    {"title": "ROI calculations and tracking", "priority": "high", "estimated_minutes": 30},
                    {"title": "Portfolio rebalancing", "priority": "medium", "estimated_minutes": 20},
                    {"title": "Resource allocation review", "priority": "medium", "estimated_minutes": 15}
                ],
                "evening": [
                    {"title": "Review investment performance", "priority": "high", "estimated_minutes": 15},
                    {"title": "Update portfolio tracking", "priority": "medium", "estimated_minutes": 10},
                    {"title": "Plan tomorrow's investment activities", "priority": "high", "estimated_minutes": 15},
                    {"title": "Risk assessment review", "priority": "medium", "estimated_minutes": 15}
                ]
            }
        }
        self._save_data()
    
    def get_todays_checklists(self, depot: DepotType = None) -> Dict[TimeOfDay, DailyChecklist]:
        """Get today's checklists, optionally filtered by depot"""
        today = date.today().isoformat()
        checklists = {}
        
        for time_period in TimeOfDay:
            key = f"{today}_{time_period.value}"
            if key not in self.checklists:
                # Create new checklist from template
                template_name = depot.value if depot else "general"
                template_tasks = self.templates.get(template_name, {}).get(time_period.value, [])
                
                tasks = []
                for i, task_template in enumerate(template_tasks):
                    task = ChecklistTask(
                        id=f"{today}_{time_period.value}_task_{i}",
                        title=task_template["title"],
                        priority=task_template.get("priority", "medium"),
                        estimated_minutes=task_template.get("estimated_minutes", 15),
                        depot=depot
                    )
                    tasks.append(task)
                
                checklist = DailyChecklist(
                    date=today,
                    time_period=time_period,
                    tasks=tasks,
                    depot=depot
                )
                self.checklists[key] = checklist
            
            # Filter by depot if specified
            if depot is None or self.checklists[key].depot == depot:
                checklists[time_period] = self.checklists[key]
        
        return checklists
    
    def update_task_status(self, date_str: str, time_period: TimeOfDay, task_id: str, status: TaskStatus):
        """Update the status of a specific task"""
        key = f"{date_str}_{time_period.value}"
        if key in self.checklists:
            for task in self.checklists[key].tasks:
                if task.id == task_id:
                    task.status = status
                    if status == TaskStatus.COMPLETED:
                        task.completed_at = datetime.now().isoformat()
                    self.checklists[key].calculate_completion()
                    self._save_data()
                    return True
        return False
    
    def complete_task(self, date_str: str, time_period: TimeOfDay, task_id: str):
        """Mark a task as completed"""
        return self.update_task_status(date_str, time_period, task_id, TaskStatus.COMPLETED)
    
    def auto_complete_from_calendar(self):
        """Automatically complete tasks based on Heart Calendar events"""
        current_heart_date = self.heart_calendar.get_current_heart_date()
        today = date.today().isoformat()
        
        # Get today's events from Heart Calendar
        events = self.heart_calendar.get_events(current_heart_date)
        
        # Auto-complete related tasks
        for event in events:
            if event.completed:
                # Find and complete related tasks
                for time_period in TimeOfDay:
                    key = f"{today}_{time_period.value}"
                    if key in self.checklists:
                        for task in self.checklists[key].tasks:
                            if event.title.lower() in task.title.lower():
                                self.complete_task(today, time_period, task.id)
        
        self._save_data()
    
    def generate_daily_report(self, date_str: str = None) -> Dict:
        """Generate a comprehensive daily report"""
        if date_str is None:
            date_str = date.today().isoformat()
        
        report = {
            "date": date_str,
            "heart_date": str(self.heart_calendar.get_current_heart_date()),
            "checklists": {},
            "overall_completion": 0.0,
            "total_tasks": 0,
            "completed_tasks": 0,
            "depot_breakdown": {}
        }
        
        total_tasks = 0
        completed_tasks = 0
        
        for time_period in TimeOfDay:
            key = f"{date_str}_{time_period.value}"
            if key in self.checklists:
                checklist = self.checklists[key]
                period_tasks = len(checklist.tasks)
                period_completed = sum(1 for t in checklist.tasks if t.status == TaskStatus.COMPLETED)
                
                total_tasks += period_tasks
                completed_tasks += period_completed
                
                report["checklists"][time_period.value] = {
                    "completion_percentage": checklist.completion_percentage,
                    "total_tasks": period_tasks,
                    "completed_tasks": period_completed,
                    "pending_tasks": period_tasks - period_completed,
                    "depot": checklist.depot.value if checklist.depot else None
                }
                
                # Track by depot
                depot_name = checklist.depot.value if checklist.depot else "general"
                if depot_name not in report["depot_breakdown"]:
                    report["depot_breakdown"][depot_name] = {
                        "total_tasks": 0,
                        "completed_tasks": 0
                    }
                report["depot_breakdown"][depot_name]["total_tasks"] += period_tasks
                report["depot_breakdown"][depot_name]["completed_tasks"] += period_completed
        
        report["total_tasks"] = total_tasks
        report["completed_tasks"] = completed_tasks
        report["overall_completion"] = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0.0
        
        return report
    
    def get_weekly_summary(self, weeks: int = 1) -> Dict:
        """Get a summary of checklist completion for the past N weeks"""
        summary = {
            "period": f"{weeks} week(s)",
            "total_checklists": 0,
            "overall_completion_rate": 0.0,
            "daily_breakdown": {},
            "depot_performance": {}
        }
        
        end_date = date.today()
        start_date = end_date - timedelta(weeks=weeks)
        
        total_completion = 0.0
        checklists_count = 0
        
        current_date = start_date
        while current_date <= end_date:
            date_str = current_date.isoformat()
            daily_report = self.generate_daily_report(date_str)
            
            if daily_report["total_tasks"] > 0:
                summary["daily_breakdown"][date_str] = {
                    "completion_rate": daily_report["overall_completion"],
                    "total_tasks": daily_report["total_tasks"],
                    "completed_tasks": daily_report["completed_tasks"]
                }
                total_completion += daily_report["overall_completion"]
                checklists_count += 1
                
                # Add depot performance
                for depot, data in daily_report["depot_breakdown"].items():
                    if depot not in summary["depot_performance"]:
                        summary["depot_performance"][depot] = {
                            "total_tasks": 0,
                            "completed_tasks": 0
                        }
                    summary["depot_performance"][depot]["total_tasks"] += data["total_tasks"]
                    summary["depot_performance"][depot]["completed_tasks"] += data["completed_tasks"]
            
            current_date += timedelta(days=1)
        
        summary["total_checklists"] = checklists_count
        summary["overall_completion_rate"] = (total_completion / checklists_count) if checklists_count > 0 else 0.0
        
        # Calculate depot completion rates
        for depot in summary["depot_performance"]:
            depot_data = summary["depot_performance"][depot]
            if depot_data["total_tasks"] > 0:
                depot_data["completion_rate"] = (depot_data["completed_tasks"] / depot_data["total_tasks"]) * 100
        
        return summary


def main():
    """Example usage of the Daily Checklist Automation system"""
    automation = DailyChecklistAutomation()
    
    print("=== Daily Checklist Automation System ===")
    print()
    
    # Get today's checklists
    print("Today's Checklists:")
    todays_checklists = automation.get_todays_checklists()
    for time_period, checklist in todays_checklists.items():
        print(f"\n{time_period.value.upper()}:")
        for task in checklist.tasks:
            print(f"  - {task.title} ({task.priority})")
    print()
    
    # Generate daily report
    report = automation.generate_daily_report()
    print("=== Daily Report ===")
    print(json.dumps(report, indent=2))
    print()
    
    # Auto-complete from calendar
    automation.auto_complete_from_calendar()
    print("Auto-completed tasks based on Heart Calendar events")
    print()
    
    # Weekly summary
    weekly = automation.get_weekly_summary(1)
    print("=== Weekly Summary ===")
    print(json.dumps(weekly, indent=2))


# Export main classes for module import
__all__ = [
    'DailyChecklistAutomation',
    'ChecklistTask',
    'DailyChecklist',
    'TimeOfDay',
    'TaskStatus'
]


if __name__ == "__main__":
    main()