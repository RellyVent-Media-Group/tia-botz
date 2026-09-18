# Notion Content Calendar Template

## Database Structure

### Content Properties
- **Title**: Title property
- **Content Type**: Select (Reel, Story, Post, Video, Ad, etc.)
- **Platform**: Select (Instagram, TikTok, YouTube, Fiverr, etc.)
- **Character**: Relation to Character Database
- **Prompt Used**: Relation to Prompts Database
- **Status**: Select (Idea, Scheduled, In Progress, Published, Archived)
- **Publish Date**: Date
- **Due Date**: Date
- **Priority**: Select (High, Medium, Low)
- **Engagement Goal**: Number
- **Actual Engagement**: Number
- **Notes**: Text
- **Hashtags**: Text
- **Performance Rating**: Select (1-5 stars)

## Template Views

### 1. Calendar View
- Group by: Platform
- Filter: Status = Scheduled or In Progress
- Date range: Publish Date

### 2. Platform-Specific Calendars
- **Instagram Content**: Filter Platform = Instagram
- **TikTok Content**: Filter Platform = TikTok
- **Fiverr Deliverables**: Filter Platform = Fiverr
- **Telegram Bot Updates**: Filter Platform = Telegram

### 3. Production Pipeline
- Board view with statuses: Idea → Scripting → Production → Review → Scheduled → Published

### 4. Performance Tracking
- Table view showing: Content Type, Platform, Engagement Goal vs Actual, Performance Rating
- Filter: Status = Published
- Sort: Performance Rating (descending)

## Multi-Platform Workflows

### Weekly Content Production
```
Monday: Instagram Feed Posts
Tuesday: TikTok Videos
Wednesday: Instagram Stories
Thursday: YouTube Content
Friday: Fiverr Deliverables
Saturday: Telegram Bot Updates
Sunday: Content Planning & Review
```

### Character Rotation Schedule
```
Week 1: Mac Nazarene focus
Week 2: Mary Magnumbytes focus
Week 3: Duo scenarios
Week 4: Extended character universe
```

### Platform-Specific Optimization
- **Instagram**: Focus on visual consistency, hashtag strategy
- **TikTok**: Focus on trend adaptation, viral hooks
- **YouTube**: Focus on long-form content, SEO optimization
- **Fiverr**: Focus on deliverable quality, client communication
- **Telegram**: Focus on community engagement, prompt delivery

## Automation Rules

### Content Scheduling
1. Content marked as "Scheduled"
2. Auto-creates reminder 24 hours before due date
3. Notifies production team
4. Updates platform-specific calendars

### Performance Tracking
1. Content marked as "Published"
2. Auto-creates performance check task (7 days later)
3. Updates character performance metrics
4. Suggests content optimization

### Platform Cross-Posting
1. Content published on primary platform
2. Auto-creates adaptation tasks for secondary platforms
3. Maintains character consistency across platforms
4. Tracks cross-platform performance

## Integration Points

### Telegram Bot Integration
```
Content Calendar → Telegram Bot
- Scheduled content triggers bot announcements
- Published content automatically shared to channel
- Performance data updates bot statistics
```

### WhatsApp Business Integration
```
Content Calendar → WhatsApp Templates
- New content triggers template message creation
- Published content triggers announcement broadcasts
- Performance data informs content strategy
```

### Analytics Dashboard
```
Content Calendar → Analytics
- Automatic performance data collection
- Trend analysis and recommendations
- ROI calculations per platform
```

## Content Production Workflows

### 90-Minute Batch Production
```
0-20 min: Generate character images (linked to prompts)
20-50 min: Create video content (linked to calendar)
50-70 min: Format and edit (update status)
70-90 min: Schedule and caption (set publish date)
```

### Quality Control Process
1. Content created from approved prompts
2. Character consistency verified
3. Platform-specific formatting applied
4. Quality checklist completed
5. Approved for publication

### Content Repurposing Strategy
- Primary platform: Original content
- Secondary platforms: Adapted versions
- Archive: Educational content
- Lead magnet: Premium content examples