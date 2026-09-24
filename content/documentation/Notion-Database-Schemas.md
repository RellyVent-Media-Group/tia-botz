# Notion Database Schemas

## Complete schemas for Content Calendar, Task List, and Character Sheets databases

---

## 1. Content Calendar

| Property Name | Property Type | Description |
|---------------|---------------|-------------|
| **Title** | Text | Post title or headline |
| **Date** | Date | Publication date |
| **Platform** | Select | Options: Instagram, X/Twitter, TikTok, YouTube, YouTube Shorts, Facebook, LinkedIn, Blog, Telegram, WhatsApp, FetLife, AFF, CrakRevenue, Gumroad, Fiverr, Email |
| **Status** | Select | Options: Idea, Drafting, Scheduled, Posted, Archived |
| **Pillar/Theme** | Select | Options: Character Introduction, Lore Drop, Behind-the-Scenes, Wisdom Post, Call-to-Action, Monetization, Community Highlight, Event Announcement, Product Launch, Educational, Humor, Transformation Story |
| **Universe** | Select | Options: Gilded Mirrors, Gobblers Knob, Horny Mythic Observations, Social Media, All |
| **AGENT Focus** | Multi-Select | Options: Mary Magnumbytes, Mac Nazarene, Delta Drill, Terrell, Jypsee72, Jessica, Mrs. Cox-Turner, Mr. Turner, Babelonia, Dikinya, Royal Rhino, Harlan, Rojas |
| **Content Type** | Select | Options: Text Post, Image, Video, Reel, Short, Article, Newsletter, Poll, Story |
| **Metric Target** | Number | Engagement target (e.g., 1000 likes, 10k views) |
| **Notes** | Text | Production notes, links, references |

### Database Views

- **Calendar View**: Grouped by Date
- **Board View**: Grouped by Status
- **Table View**: All properties visible for bulk editing

---

## 2. Task List

| Property Name | Property Type | Description |
|---------------|---------------|-------------|
| **Title** | Text | Task description |
| **Status** | Select | Options: Backlog, To Do, In Progress, In Review, Done, Blocked |
| **Due Date** | Date | Deadline |
| **Owner** | People | Person responsible |
| **Priority** | Select | Options: Critical, High, Medium, Low |
| **Depot** | Select | Options: Executive (Spirit), Consort (Mind), Scribe (Body), CashingHouse (Soul), Holdings (Gnosis) |
| **Project** | Select | Options: Content Production, Telegram Setup, Platform Integration, Dashboard Development, AGENT Portfolio, Entity Mapping, Soul Definition, CRM Setup, Analytics Implementation |
| **AGENT** | Select | Options: Alpha (Savant Build), Beta (Savant Build), Gamma (Red-Team) – or specific AGENT name |
| **Tags** | Multi-Select | Options: automation, design, development, marketing, compliance, content, audio, video, writing, strategy, research |
| **Notes** | Text | Details, links, blockers |
| **Epic** | Text | Parent epic/story |

### Database Views

- **Board View**: Grouped by Status
- **Timeline View**: Grouped by Due Date
- **Table View**: All properties visible for bulk editing

---

## 3. Character Sheets

| Property Name | Property Type | Description |
|---------------|---------------|-------------|
| **Name** | Text | Character name (e.g., Mary Magnumbytes) |
| **Short Name** | Text | Nickname or short reference |
| **Archetype** | Select | Options: Digital Storyteller, Community Bridge Builder, Constructive Forge, Focused Champion, Boundless Explorer, Complex Alchemist, Liberated Sage, Passionate Commander, Gentle Awakening, Strategic Sovereign, Temporal Architect, Revolutionary Warrior, etc. |
| **Universe** | Multi-Select | Options: Gilded Mirrors, Gobblers Knob, Horny Mythic Observations, Evening Distortion, AI Image Generator, All |
| **Face** | Text | Facial structure description (e.g., "Rounded jawline, confident smirk") |
| **Skin** | Text | Skin tone (e.g., "Smooth alabaster", "Copper") |
| **Hair** | Text | Hairstyle and colour (e.g., "Shoulder-length layered dark-brown with copper highlights") |
| **Eyes** | Text | Eye description (e.g., "Big bedroom hazel eyes") |
| **Attire** | Text | Signature clothing (e.g., "Tech-wear jacket with holographic trim, fitted turtleneck") |
| **Prop** | Text | Signature prop(s) (e.g., "Rugged tablet, smart glasses, LED wristband") |
| **Color Palette** | Text | Hex codes, comma-separated (e.g., "#0A0D10, #F0B35A, #8ACBD2") |
| **Rarity** | Select | Options: Mythic, Legendary, Rare, Uncommon, Common |
| **Readiness** | Number | Percentage (0–100) |
| **Action Figure Prompt** | Text | Full prompt for action-figure generation |
| **Photo-Realistic Prompt** | Text | Full prompt for photorealistic generation |
| **Muppet/Puppet Prompt** | Text | Full prompt for puppet generation |
| **Barbie-like Prompt** | Text | Full prompt for Barbie-like generation |
| **Voice Type** | Text | Voice description (e.g., "Bass, warm, resonant") |
| **Signature Line** | Text | Character's catchphrase |
| **Tags** | Multi-Select | Options: wisdom, digital, tech, community, seduction, chaos, investigation, security, poetic, cosmic, crypto, etc. |
| **Notes** | Text | Additional character lore, backstory, relationships |

### Database Views

- **Gallery View**: Display Name + Prop + Color Palette
- **Table View**: All properties visible for bulk editing
- **Board View**: Grouped by Universe or Archetype

---

## Quick Implementation Steps

### Notion Setup

1. **Create the three databases** in Notion with the schemas above.
2. **Add relation properties** between databases:
   - Content Calendar → AGENT Focus → relates to Character Sheets
   - Task List → AGENT → relates to Character Sheets
   - Task List → Project → can be its own database or select

3. **Create linked views**:
   - A dashboard view showing tasks by AGENT
   - A content calendar view grouped by Platform
   - A character sheet view with quick filters by Universe

---

## Database Relationships

```
Content Calendar
    ↓ (AGENT Focus → relates to)
Character Sheets

Task List
    ↓ (AGENT → relates to)
Character Sheets

Task List
    ↓ (Project → relates to)
Projects (optional separate database)
```

---

## Usage Examples

### Content Calendar Example

| Title | Date | Platform | Status | Pillar/Theme | Universe | AGENT Focus | Content Type | Metric Target |
|-------|------|----------|--------|--------------|----------|-------------|--------------|---------------|
| Mary's Digital Wisdom | 2024-01-15 | Instagram | Scheduled | Wisdom Post | Gilded Mirrors | Mary Magnumbytes | Image | 1000 likes |
| Mac's Community Bridge | 2024-01-16 | Twitter | Drafting | Character Introduction | Gilded Mirrors | Mac Nazarene | Text Post | 500 retweets |

### Task List Example

| Title | Status | Due Date | Priority | Depot | Project | AGENT | Tags |
|-------|--------|----------|----------|-------|---------|-------|------|
| Generate Mary action figure prompts | In Progress | 2024-01-20 | High | Scribe (Body) | AGENT Portfolio | Mary Magnumbytes | content, design |
| Set up Telegram bot | To Do | 2024-01-25 | Critical | Consort (Mind) | Telegram Setup | Alpha | automation, development |

### Character Sheets Example

| Name | Archetype | Universe | Skin | Hair | Eyes | Readiness | Color Palette |
|------|-----------|----------|------|------|------|-----------|---------------|
| Mary Magnumbytes | Digital Storyteller | Gilded Mirrors, Horny Mythic Observations | Smooth alabaster | Shoulder-length layered dark-brown with copper highlights | Big bedroom hazel eyes | 92 | #0A0D10, #F0B35A, #8ACBD2 |
| Mac Nazarene | Community Bridge Builder | Gilded Mirrors, Horny Mythic Observations | Copper | Long dreadlocks with subtle silver strands | Tired but perceptive, warm gaze | 90 | #0A0D10, #F0B35A, #8B5CF6 |

---

*RellyVent Media Group • HEART‑Tiapmaatzu OS • Gilded Mirrors Originals*
