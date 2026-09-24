# Daily Checklist Automation System

A comprehensive daily task management system with 3x daily checklists (morning, mid-day, evening), Heart Calendar integration, and depot-specific task templates for the TZU organizational hierarchy.

## Features

- **3x Daily Checklists**: Morning, mid-day, and evening checklists with task templates
- **Heart Calendar Integration**: Auto-complete tasks based on calendar events
- **Depot-Specific Templates**: Customized task templates for each depot
- **Task Status Tracking**: Track task completion (pending, in_progress, completed, skipped)
- **Progress Reporting**: Generate daily, weekly, and completion reports
- **Priority Management**: Task prioritization (low, medium, high)
- **Time Estimation**: Estimated completion time for each task
- **Automated Scheduling**: Automatic checklist generation based on templates

## Installation

No external dependencies required. Uses only Python standard library.

```bash
# Navigate to the daily-automation directory
cd organizational/daily-automation

# Run the system
python daily_checklist_automation.py
```

## Usage

### Basic Usage

```python
from daily_checklist_automation import DailyChecklistAutomation, TimeOfDay, TaskStatus, DepotType

# Initialize the system
automation = DailyChecklistAutomation()

# Get today's checklists
todays_checklists = automation.get_todays_checklists()

# Get checklists for a specific depot
consort_checklists = automation.get_todays_checklists(depot=DepotType.CONSORT)

# Access specific time period checklist
morning_checklist = todays_checklists[TimeOfDay.MORNING]
```

### Task Management

```python
# Update task status
automation.update_task_status(
    date_str="2024-09-23",
    time_period=TimeOfDay.MORNING,
    task_id="2024-09-23_morning_task_0",
    status=TaskStatus.COMPLETED
)

# Complete a task (shortcut)
automation.complete_task(
    date_str="2024-09-23",
    time_period=TimeOfDay.MORNING,
    task_id="2024-09-23_morning_task_0"
)
```

### Heart Calendar Integration

```python
# Auto-complete tasks based on Heart Calendar events
automation.auto_complete_from_calendar()
```

### Reporting

```python
# Generate daily report
daily_report = automation.generate_daily_report()
print(f"Daily completion rate: {daily_report['overall_completion']}%")

# Generate weekly summary
weekly_summary = automation.get_weekly_summary(weeks=1)
print(f"Weekly completion rate: {weekly_summary['overall_completion_rate']}%")
```

## Checklist Templates

The system includes default templates for each depot:

### General Template
- **Morning**: Review priorities, check communications, review calendar, team sync
- **Mid-Day**: Execute primary tasks, progress updates, address issues, documentation
- **Evening**: Daily review, plan tomorrow, update tracking, workspace cleanup

### Consort Depot Template
- **Morning**: Content pipeline review, social media metrics, character consistency, content scheduling
- **Mid-Day**: Content creation, platform posting, audience engagement, performance tracking
- **Evening**: Content performance review, calendar updates, tomorrow's content planning, archiving

### Scribe Depot Template
- **Morning**: Document queue review, contract deadlines, documentation requests, processing schedule
- **Mid-Day**: Document processing, contract management, version control, document organization
- **Evening**: Completion status review, contract tracking, tomorrow's planning, backup

### CashingHouse Depot Template
- **Morning**: Revenue metrics review, transaction status, commission calculations, pricing analysis
- **Mid-Day**: Financial tracking, commission processing, pricing optimization, reporting preparation
- **Evening**: Daily financial review, tracking updates, revenue trends, tomorrow's priorities

### Holdings Depot Template
- **Morning**: Portfolio performance review, asset status, investment opportunities, market trends
- **Mid-Day**: Investment analysis, ROI calculations, portfolio rebalancing, resource allocation
- **Evening**: Investment performance review, portfolio tracking, tomorrow's activities, risk assessment

## Data Files

The system creates and manages the following data files:

- `checklists.json` - Stores all daily checklists
- `checklist_templates.json` - Stores checklist templates for each depot
- Files are automatically created on first run

## Integration

The Daily Checklist Automation integrates with other organizational systems:

- **Heart Calendar**: Auto-completes tasks based on calendar events
- **Depot Systems**: Provides depot-specific task templates
- **Stakeholder Tracking**: Aligns daily tasks with stakeholder interactions

## API Reference

### DailyChecklistAutomation Class

#### Methods

- `get_todays_checklists(depot)` - Get today's checklists, optionally filtered by depot
- `update_task_status(date_str, time_period, task_id, status)` - Update task status
- `complete_task(date_str, time_period, task_id)` - Mark task as completed
- `auto_complete_from_calendar()` - Auto-complete tasks based on Heart Calendar events
- `generate_daily_report(date_str)` - Generate comprehensive daily report
- `get_weekly_summary(weeks)` - Get weekly completion summary

### Data Classes

- `ChecklistTask` - Represents a task in a daily checklist
- `DailyChecklist` - Represents a daily checklist for a specific time period
- `TimeOfDay` - Enum of time periods (morning, mid_day, evening)
- `TaskStatus` - Enum of task statuses (pending, in_progress, completed, skipped)

## Example Output

```
=== Daily Checklist Automation System ===

Today's Checklists:

MORNING:
  - Review daily priorities (high)
  - Check email and communications (medium)
  - Review calendar and schedule (high)
  - Quick team sync (if applicable) (medium)

MID_DAY:
  - Execute primary tasks (high)
  - Progress update on key projects (medium)
  - Address urgent issues (high)
  - Documentation and notes (low)

EVENING:
  - Daily review and reflection (medium)
  - Plan tomorrow's priorities (high)
  - Update tracking systems (medium)
  - Clean up and organize workspace (low)

=== Daily Report ===
{
  "date": "2024-09-23",
  "heart_date": "Equinox 3, 2024",
  "overall_completion": 0.0,
  "total_tasks": 12,
  "completed_tasks": 0,
  "depot_breakdown": {
    "general": {
      "total_tasks": 12,
      "completed_tasks": 0
    }
  }
}
```

## Configuration

Daily automation settings can be configured in the `config.json` file:

```json
{
  "daily_automation": {
    "data_directory": "./daily-automation",
    "checklists_file": "checklists.json",
    "templates_file": "checklist_templates.json",
    "time_periods": ["morning", "mid_day", "evening"],
    "auto_complete_from_calendar": true
  }
}
```

## Customization

### Adding Custom Templates

You can customize templates by editing the `checklist_templates.json` file or by modifying the `_create_default_templates()` method in the script.

### Adding Custom Depots

To add custom depot templates, extend the `templates` dictionary in the system initialization.

## Future Enhancements

- Task dependencies and prerequisites
- Recurring task support
- Task delegation and assignment
- Integration with external task management systems
- Mobile app interface
- Task reminders and notifications

## Support

For issues or questions, refer to the main Tiapmaatzu OS Toolkit documentation or contact the system administrator.

---

*Daily Checklist Automation System v1.0*  
*Part of Tiapmaatzu OS Toolkit - Organizational Systems*