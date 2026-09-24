# Notion Content Calendar Template

## Overview
This Notion template provides a comprehensive multi-platform content scheduling and tracking system for the Gilded Mirrors Universe, enabling coordinated content creation across TikTok, Instagram, YouTube, X/Twitter, Gumroad, Fiverr, AdMob, Linktree, WhatsApp, and Telegram.

## Template Structure

### 1. Content Calendar (Main Database)
**Properties:**
- **Content Title** (Title): Name of content piece
- **Content Type** (Select): Video, Image, Post, Story, Reel, Thread, Article, Product Listing, Bot Message
- **Platform** (Select): TikTok, Instagram, YouTube, X/Twitter, Gumroad, Fiverr, AdMob, Linktree, WhatsApp, Telegram
- **Primary Character** (Relation): Link to Character Database
- **Secondary Characters** (Multi-relation): Supporting characters
- **Campaign** (Select): Ongoing, Seasonal, Product Launch, Brand Awareness, Engagement, Conversion
- **Content Theme** (Select): Educational, Entertainment, Promotional, Behind-the-Scenes, Q&A, Tutorial, Storytelling
- **Status** (Select): Idea, Planned, In Production, Review, Scheduled, Published, Archived
- **Publication Date** (Date): Scheduled or actual publication date
- **Publication Time** (Time): Optimal posting time
- **Duration/Length** (Text): Content length (e.g., "60 seconds", "500 words")
- **Hashtags** (Text): Platform-specific hashtags
- **Tags** (Multi-select): Internal organization tags
- **Assigned Creator** (Person): Content creator responsible
- **Reviewer** (Person): Quality approval
- **Priority** (Select): High, Medium, Low
- **Estimated Views** (Number): Performance projection
- **Actual Views** (Number): Post-publication metrics
- **Engagement Rate** (Number): Calculated engagement percentage
- **Budget Allocated** (Currency): Production budget
- **Budget Spent** (Currency): Actual cost
- **Prompt Used** (Text): AI prompt if applicable
- **Technical Specs** (Text): Resolution, format, file size
- **Notes** (Text): Additional context or instructions
- **Created Date** (Date): When content entry was created
- **Last Modified** (Date): Last update to entry

### 2. Campaign Database
**Properties:**
- **Campaign Name** (Title): Campaign identifier
- **Campaign Type** (Select): Brand Awareness, Product Launch, Seasonal, Ongoing, Engagement, Conversion
- **Start Date** (Date): Campaign start
- **End Date** (Date): Campaign end
- **Status** (Select): Planning, Active, Paused, Completed
- **Target Platforms** (Multi-select): TikTok, Instagram, YouTube, X/Twitter, etc.
- **Target Characters** (Multi-relation): Characters featured in campaign
- **Campaign Budget** (Currency): Total budget allocation
- **Budget Spent** (Currency): Actual spending
- **Content Count** (Number): Total content pieces in campaign
- **Published Count** (Number): Content pieces published
- **Total Views** (Number): Campaign-wide views
- **Total Engagement** (Number): Campaign-wide engagement
- **Goal** (Text): Campaign objective
- **Target Audience** (Text): Audience description
- **Success Metrics** (Text): KPIs and targets
- **Campaign Manager** (Person): Responsible team member
- **Notes** (Text): Campaign notes and updates

### 3. Platform-Specific Content Databases
Each platform has a dedicated database with platform-specific properties:

#### TikTok Content Database
**Additional Properties:**
- **Sound/Audio** (Text): Trending sound or custom audio
- **Video Format** (Select): 9:16, 1:1, 16:9
- **Duet/Stitch Enabled** (Checkbox): Allow interaction
- **Caption** (Text): Video caption
- **Effects/Filters** (Text): TikTok effects used

#### Instagram Content Database
**Additional Properties:**
- **Content Format** (Select): Post, Story, Reel, Carousel
- **Image Ratio** (Select): 1:1, 4:5, 9:16
- **Instagram Stories** (Checkbox): Part of story sequence
- **Location Tag** (Text): Geotag if applicable
- **Mentions** (Text): @mentions in post

#### YouTube Content Database
**Additional Properties:**
- **Video Type** (Select): Short, Long-form, Live Stream
- **Thumbnail** (URL): Link to thumbnail image
- **Video Description** (Text): Full description
- **Playlist** (Text): YouTube playlist assignment
- **Monetization** (Checkbox): Monetized content

#### X/Twitter Content Database
**Additional Properties:**
- **Post Type** (Select): Single Post, Thread, Reply, Quote Tweet
- **Thread Length** (Number): Number of tweets in thread
- **Poll** (Checkbox): Includes poll
- **Media Type** (Select): None, Image, Video, GIF
- **Reply Target** (Text): If replying to specific tweet

#### Gumroad Content Database
**Additional Properties:**
- **Product Type** (Select): Digital Product, Course, Template, Asset Pack
- **Price** (Currency): Product price
- **Product Description** (Text): Full product description
- **Cover Image** (URL): Product cover art
- **File Size** (Text): Download size
- **License Type** (Select): Personal, Commercial, Enterprise

#### Fiverr Content Database
**Additional Properties:**
- **Gig Type** (Select): Service, Product, Consultation
- **Service Category** (Select): Writing, Design, Video, Development
- **Pricing Tier** (Select): Basic, Standard, Premium
- **Delivery Time** (Text): Turnaround time
- **Gig Description** (Text): Full gig description
- **Portfolio Items** (Number): Number of portfolio pieces

### 4. Content Ideas Database
**Properties:**
- **Idea Title** (Title): Brief idea description
- **Idea Source** (Select): Team Brainstorm, Audience Request, Trend Analysis, Competitor Research, AI Generated
- **Platform Fit** (Multi-select): Best platforms for this idea
- **Character Fit** (Multi-relation): Characters suited for this idea
- **Idea Status** (Select): New, Approved, Rejected, On Hold, Implemented
- **Priority** (Select): High, Medium, Low
- **Estimated Effort** (Select): Low, Medium, High
- **Proposed By** (Person): Who suggested the idea
- **Approved By** (Person): Who approved the idea
- **Implementation Date** (Date): When implemented
- **Notes** (Text): Additional context
- **Tags** (Multi-select): Organization tags

### 5. Publishing Schedule Database
**Properties:**
- **Week Of** (Date): Start of the week
- **Platform** (Select): Platform name
- **Target Post Count** (Number): Planned posts for the week
- **Actual Post Count** (Number): Actual posts published
- **Content Types** (Multi-select): Types of content planned
- **Characters Featured** (Multi-relation): Characters scheduled
- **Themes** (Multi-select): Weekly themes
- **Status** (Select): Planning, Scheduled, In Progress, Completed
- **Notes** (Text): Weekly notes and adjustments

### 6. Analytics Database
**Properties:**
- **Content Entry** (Relation): Link to specific content
- **Platform** (Select): Platform name
- **Publication Date** (Date): When published
- **Views/Impressions** (Number): Total views
- **Likes/Reactions** (Number): Engagement metric
- **Comments** (Number): Comment count
- **Shares/Retweets** (Number): Share count
- **Saves/Bookmarks** (Number): Save count
- **Clicks/CTRs** (Number): Click-through rate
- **Conversions** (Number): Conversion count
- **Engagement Rate** (Formula): Calculated percentage
- **Reach** (Number): Unique users reached
- **Growth Rate** (Number): Follower growth
- **Revenue** (Currency): Direct revenue from content
- **ROI** (Formula): Return on investment
- **Notes** (Text): Analysis notes

## Views and Filters

### Calendar Views
1. **Monthly Calendar**: Calendar view by publication date
2. **Weekly Calendar**: Week view for detailed planning
3. **Daily Schedule**: Day view for precise timing
4. **Platform Calendar**: Filter by platform
5. **Character Calendar**: Filter by character

### Content Pipeline Views
1. **Idea Bank**: All content ideas by status
2. **Production Pipeline**: Kanban board by production status
3. **Review Queue**: Content awaiting review
4. **Scheduled Content**: Upcoming scheduled posts
5. **Published Archive**: Historical content record

### Platform-Specific Views
1. **TikTok Queue**: TikTok-specific content queue
2. **Instagram Grid**: Instagram content grid view
3. **YouTube Schedule**: YouTube upload schedule
4. **X/Twitter Feed**: Twitter posting schedule
5. **Product Releases**: Gumroad/Fiverr product launches

### Analytics Views
1. **Performance Dashboard**: Top-performing content
2. **Platform Comparison**: Cross-platform metrics
3. **Character Performance**: Character-specific analytics
4. **Campaign Performance**: Campaign-wide metrics
5. **Trend Analysis**: Performance over time

### Campaign Views
1. **Active Campaigns**: Currently running campaigns
2. **Campaign Calendar**: Campaign timeline view
3. **Campaign Budget**: Budget tracking by campaign
4. **Campaign Performance**: Campaign success metrics

## Automation Rules

### Automated Properties
1. **Engagement Rate**: Formula calculation (Total Engagement / Views × 100)
2. **ROI**: Formula calculation (Revenue / Budget Spent × 100)
3. **Budget Remaining**: Formula (Budget Allocated - Budget Spent)
4. **Content Count**: Rollup from Content Calendar database
5. **Published Count**: Rollup of published content entries

### Database Relations
1. **Content → Character**: Many-to-one relationship
2. **Content → Campaign**: Many-to-one relationship
3. **Content → Analytics**: One-to-one relationship
4. **Campaign → Content**: One-to-many relationship
5. **Idea → Content**: One-to-many relationship

### Template Automations
1. **New Content Idea**: Auto-create content calendar entry when approved
2. **Content Published**: Auto-create analytics entry
3. **Campaign Started**: Auto-generate content schedule
4. **Review Complete**: Auto-move to scheduled status
5. **Analytics Updated**: Auto-update performance metrics

## Integration Points

### External Integrations
1. **Social Media APIs**: Auto-import analytics from platforms
2. **Scheduling Tools**: Sync with Buffer, Hootsuite, Later
3. **Analytics Platforms**: Connect to Google Analytics, Meta Business Suite
4. **AI Tools**: Integrate with content generation AI
5. **Calendar Apps**: Sync with Google Calendar, Outlook

### Cross-Template Integration
1. **Character Database**: Link content to character profiles
2. **Task Management**: Create tasks for content production
3. **Platform Integration**: Sync with platform-specific bots
4. **Analytics Dashboard**: Pull comprehensive performance data

## Usage Guidelines

### Content Planning
1. Brainstorm ideas in Content Ideas database
2. Approve ideas and assign to campaigns
3. Create content calendar entries
4. Assign creators and set deadlines
5. Schedule optimal publication times
6. Set up reminders and notifications

### Content Production
1. Move content through production pipeline
2. Track progress with status updates
3. Assign reviewers for quality control
4. Update technical specifications
5. Record production costs
6. Link to asset library

### Publishing
1. Review content before publication
2. Verify platform-specific requirements
3. Schedule content in advance
4. Set up cross-platform coordination
5. Monitor publication success
6. Record actual publication time

### Analytics & Optimization
1. Import analytics data regularly
2. Calculate engagement rates
3. Compare performance across platforms
4. Identify top-performing content
5. Analyze character performance
6. Adjust strategy based on data

### Campaign Management
1. Define campaign goals and KPIs
2. Assign campaign manager
3. Schedule campaign content
4. Track campaign budget
5. Monitor campaign performance
6. Document campaign learnings

## Best Practices

### Content Consistency
- Maintain consistent posting schedule
- Use platform-specific optimal times
- Balance content types across platforms
- Coordinate character appearances
- Align with campaign themes

### Team Collaboration
- Assign clear ownership for each content piece
- Use comments for feedback and revisions
- Set up approval workflows
- Communicate deadlines clearly
- Share relevant views with team members

### Performance Optimization
- Track all relevant metrics consistently
- Analyze performance trends over time
- Test different content formats
- A/B test posting times
- Iterate based on data insights

### Platform-Specific Best Practices
- **TikTok**: Use trending sounds, participate in challenges
- **Instagram**: Maintain aesthetic feed, use Stories effectively
- **YouTube**: Optimize thumbnails, use SEO in descriptions
- **X/Twitter**: Engage with replies, use threads for long-form
- **Gumroad/Fiverr**: Update product descriptions, use customer reviews

## Template Setup Instructions

### Initial Setup
1. Copy this template structure to your Notion workspace
2. Customize property options for your platforms
3. Set up database relations and rollups
4. Configure automation rules
5. Create initial campaign entries
6. Set up external integrations

### Customization Options
- Add custom properties for specific needs
- Create additional views for different workflows
- Set up filtering and sorting preferences
- Configure notification settings
- Add template-specific branding
- Integrate with existing Notion workflows

### Workflow Configuration
1. Define your content production pipeline stages
2. Set up approval workflows
3. Configure notification triggers
4. Create template content entries
5. Set up recurring schedule templates
6. Configure analytics import automation

---

*This template is designed to work seamlessly with the other Notion workflow templates in the Tiapmaatzu OS Toolkit.*
