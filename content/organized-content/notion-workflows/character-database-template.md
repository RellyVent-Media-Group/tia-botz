# Notion Character Database Template

## Overview
This Notion template provides a comprehensive system for managing the Gilded Mirrors Universe character database, including character profiles, relationships, budget allocations, and content production tracking.

## Template Structure

### 1. Character Database (Main Database)
**Properties:**
- **Name** (Title): Character name
- **Archetype** (Select): Content Creator, Character Actor, Vocal Talent, Stunt Performer, Motion Capture, etc.
- **Rarity** (Select): Common, Rare, Epic, Legendary, Mythic
- **Status** (Select): Active, In Development, Retired, On Hold
- **Entity Type** (Select): Human, AI-generated, Hybrid, Digital Avatar
- **Gender** (Select): Male, Female, Non-binary, Other, Not Specified
- **Age** (Number): Character age
- **Allocated Budget** (Currency): Production budget allocated
- **Budget Status** (Select): Funded, Partially Funded, Unfunded
- **Key Tool Categories** (Multi-select): Performance, Visual, Audio, Story, Technical
- **Platform Assignments** (Multi-select): TikTok, Instagram, YouTube, X/Twitter, Gumroad, Fiverr, AdMob, Linktree, WhatsApp, Telegram
- **Content Count** (Number): Total content pieces produced
- **Last Content Date** (Date): Most recent content creation
- **Relationship Status** (Select): Available, In Relationship, Complicated, Unknown
- **Soul Assignment** (Relation): Link to Souls database
- **Depot Assignment** (Relation): Link to Depot hierarchy
- **Creation Date** (Date): When character was created
- **Updated Date** (Date): Last modification
- **Owner** (Person): Responsible team member
- **Notes** (Text): Additional character notes

### 2. Character Profiles (Pages)
Each character has a dedicated page with:

**Sections:**
- **Character Overview**: Name, archetype, rarity, status
- **Visual Description**: Physical appearance, style, distinctive features
- **Backstory**: Character history, motivation, personality
- **Voice & Dialogue**: Speech patterns, catchphrases, dialogue examples
- **Relationships**: Connections to other characters
- **Content History**: All content pieces featuring this character
- **Budget Tracking**: Allocation, spending, remaining budget
- **Performance Metrics**: Engagement, views, conversion rates
- **Production Notes**: Technical requirements, special considerations
- **Brand Guidelines**: Visual consistency rules, dos and don'ts

### 3. Character Relationships Database
**Properties:**
- **Character A** (Relation): First character
- **Character B** (Relation): Second character
- **Relationship Type** (Select): Romantic, Familial, Professional, Rival, Mentor, Friend, Enemy
- **Relationship Status** (Select): Active, Past, Complicated, Secret
- **Description** (Text): Details about the relationship
- **Content Together** (Number): Number of joint content pieces
- **Last Joint Content** (Date): Most recent collaboration

### 4. Budget Allocation Database
**Properties:**
- **Character** (Relation): Link to character
- **Budget Type** (Select): Production, Marketing, Development, Licensing
- **Allocated Amount** (Currency): Total budget
- **Spent Amount** (Currency): Amount spent
- **Remaining Amount** (Formula): Allocated - Spent
- **Budget Period** (Select): Monthly, Quarterly, Yearly, Project-based
- **Start Date** (Date): Budget period start
- **End Date** (Date): Budget period end
- **Status** (Select): Active, Completed, Over Budget, On Hold
- **Approval Status** (Select): Approved, Pending, Rejected
- **Notes** (Text): Budget notes and justifications

### 5. Content Production Database
**Properties:**
- **Content Title** (Title): Name of content piece
- **Character** (Relation): Primary character
- **Secondary Characters** (Multi-relation): Supporting characters
- **Content Type** (Select): Video, Image, Post, Story, Reel, Thread, Article
- **Platform** (Select): TikTok, Instagram, YouTube, X/Twitter, etc.
- **Production Status** (Select): Planned, In Progress, Review, Published, Archived
- **Publication Date** (Date): When content was published
- **Views/Engagement** (Number): Performance metrics
- **Budget Used** (Currency): Production cost
- **Prompt Used** (Text): AI prompt if applicable
- **Technical Specs** (Text): Resolution, format, duration
- **Tags** (Multi-select): Campaign keywords, themes
- **Assigned To** (Person): Creator responsible
- **Review Status** (Select): Approved, Needs Revision, Rejected

### 6. Voice & Dialogue Database
**Properties:**
- **Character** (Relation): Link to character
- **Dialogue Type** (Select): Catchphrase, Sample Line, Scene Dialogue, Internal Monologue
- **Dialogue Text** (Text): The actual dialogue
- **Context** (Text): When/how this dialogue is used
- **Tone** (Select): Serious, Humorous, Dramatic, Casual, Formal
- **Emotion** (Select): Happy, Sad, Angry, Neutral, Excited
- **Usage Count** (Number): Times used in content
- **Last Used** (Date): Most recent usage

### 7. Asset Library Database
**Properties:**
- **Asset Name** (Title): Name of asset
- **Character** (Relation): Associated character
- **Asset Type** (Select): Image, Video, Audio, 3D Model, Animation, Texture
- **File Format** (Select): PNG, JPG, MP4, MP3, GLB, FBX, etc.
- **Resolution/Quality** (Text): Technical specifications
- **Usage Rights** (Select): Exclusive, Non-exclusive, Royalty-free
- **License Expiry** (Date): If applicable
- **File Location** (URL): Link to asset storage
- **Created Date** (Date): Asset creation date
- **Last Modified** (Date): Last update
- **Tags** (Multi-select): Searchable keywords
- **Status** (Select): Available, In Use, Archived, Deleted

## Views and Filters

### Character Database Views
1. **All Characters**: Complete character list sorted by name
2. **By Archetype**: Grouped by character archetype
3. **By Rarity**: Sorted by rarity (Mythic to Common)
4. **Active Characters**: Filter to show only active characters
5. **By Budget Status**: Grouped by funding status
6. **Platform Assignment**: Filter by platform assignments
7. **Recent Updates**: Sorted by most recently modified

### Budget Views
1. **Budget Overview**: All budget allocations
2. **By Character**: Grouped by character
3. **Over Budget**: Filter to show budget overruns
4. **Pending Approval**: Filter for approval workflow
5. **Monthly Summary**: Budget tracking by month

### Content Production Views
1. **Content Calendar**: Calendar view by publication date
2. **By Platform**: Grouped by platform
3. **By Character**: Grouped by primary character
4. **Production Pipeline**: Kanban board by status
5. **Performance Tracking**: Sorted by engagement metrics

## Automation Rules

### Automated Properties
1. **Remaining Budget**: Formula calculation (Allocated - Spent)
2. **Content Count**: Rollup from Content Production database
3. **Last Content Date**: Rollup of most recent publication date
4. **Character Age**: Auto-calculate from creation date
5. **Budget Utilization**: Percentage formula (Spent / Allocated)

### Database Relations
1. **Character → Budget**: One-to-many relationship
2. **Character → Content**: One-to-many relationship
3. **Character → Relationships**: Many-to-many self-relation
4. **Character → Dialogue**: One-to-many relationship
5. **Character → Assets**: One-to-many relationship
6. **Content → Platform**: Many-to-one relationship

### Template Automations
1. **New Character**: Auto-create related budget entry
2. **Content Published**: Auto-update character's last content date
3. **Budget Update**: Auto-recalculate remaining amount
4. **Relationship Added**: Auto-create reciprocal relationship entry

## Integration Points

### External Integrations
1. **Character API**: Sync with depot automation character API
2. **Google Drive**: Link asset library to cloud storage
3. **Figma**: Link visual assets to design files
4. **Production Tools**: Connect to video editing, AI generation tools
5. **Analytics Platforms**: Import engagement data from social platforms

### Cross-Template Integration
1. **Content Calendar**: Link character database to content scheduling
2. **Task Management**: Link character updates to task assignments
3. **Platform Integration**: Link character assignments to platform-specific bots
4. **Analytics Dashboard**: Pull character performance metrics

## Usage Guidelines

### Adding New Characters
1. Create new entry in Character Database
2. Fill in required properties (Name, Archetype, Rarity, Status)
3. Create dedicated character page
4. Add visual description and backstory
5. Set up budget allocation
6. Assign to relevant platforms
7. Create initial relationships if applicable

### Managing Character Development
1. Update character pages as development progresses
2. Track budget spending in real-time
3. Log all content pieces in Content Production database
4. Update performance metrics after publication
5. Review and refine character voice/dialogue
6. Archive retired characters appropriately

### Budget Management
1. Create budget entry for each character
2. Track spending against allocation
3. Review budget utilization monthly
4. Adjust allocations based on performance
5. Document budget decisions and justifications

### Content Production Workflow
1. Plan content in Content Production database
2. Link to character and platform
3. Assign team member and set deadline
4. Track production status through pipeline
5. Record final metrics after publication
6. Analyze performance and iterate

## Best Practices

### Data Consistency
- Use consistent naming conventions
- Standardize archetype and rarity labels
- Maintain accurate budget tracking
- Update character pages regularly
- Archive unused characters properly

### Collaboration
- Assign clear ownership for each character
- Use comments for feedback and discussions
- Set up review workflows for major changes
- Document character development decisions
- Share relevant views with team members

### Performance Tracking
- Record all content metrics consistently
- Update engagement data regularly
- Analyze character performance trends
- Adjust strategies based on data
- Share insights with the team

## Template Setup Instructions

### Initial Setup
1. Copy this template structure to your Notion workspace
2. Customize property options to match your needs
3. Set up database relations and rollups
4. Configure automation rules
5. Create initial character entries
6. Set up integration with external tools

### Customization Options
- Add custom properties for specific needs
- Create additional views for different workflows
- Set up filtering and sorting preferences
- Configure notification settings
- Add template-specific branding
- Integrate with existing Notion workflows

---

*This template is designed to work seamlessly with the other Notion workflow templates in the Tiapmaatzu OS Toolkit.*
