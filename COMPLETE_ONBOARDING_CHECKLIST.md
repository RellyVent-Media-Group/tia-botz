# Complete Onboarding Checklist for Tiapmaatzu OS Toolkit.

**Welcome to the new digital toolkit!** This guide will help you understand and use everything in the Tiapmaatzu OS Toolkit. Think of this as the instruction manual for a set of powerful tools that work together to make the life easier.

---

## Table of Contents

1. [What You Have](#what-you-have)
2. [Getting Started](#getting-started-just-5-steps)
3. [The First Week Plan](#the-first-week-plan)
4. [Understanding Each System](#understanding-each-system)
5. [Setup Instructions](#setup-instructions)
6. [Daily Routine](#daily-routine)
7. [Weekly Routine](#weekly-routine)
8. [Monthly Routine](#monthly-routine)
9. [Troubleshooting](#troubleshooting)
10. [Quick Reference](#quick-reference)

---

## Eternity Calling...

This is **the complete toolkit** with many parts that work together. Here's everything in the most simple terms:

### The Big Picture

The toolkit has **6 main groups** of tools:

1. **Bot Systems** - Tools that talk to people on messaging apps
2. **Automation Systems** - Tools that do work for you automatically
3. **Core Systems** - The main brain and storage for everything
4. **Organizational Systems** - Tools to keep the work and life organized
5. **Content Systems** - Places to store and manage the creative work
6. **Web Applications** - Websites you can visit to use the tools

### What Each Group Contains

#### 1. Bot Systems (The Messaging Helpers)
- **Telegram Bot** - A helper that works on Telegram
- **WhatsApp Bot** - A helper that works on WhatsApp
- **Shared Bot Tools** - Common tools both bots use

#### 2. Automation Systems (The Automatic Workers)
- **Social Media Automation** - Posts things to Instagram and TikTok for you
- **Notion Sync** - Keeps the Notion databases updated automatically
- **Content Generation** - Creates content using AI

#### 3. Core Systems (The Main Brain)
- **Character Database** - Stores information about the characters (Mac and Mary)
- **Integration Hub** - The central place where all systems connect
- **Shared Config** - Settings that all systems use

#### 4. Organizational Systems (The Organization Helpers)
- **Heart Calendar** - A special calendar system
- **Daily Checklists** - Automatic to-do lists every day
- **Stakeholder Tracker** - Keeps track of important people you work with
- **Depot Automation** - Tools for different parts of the business

#### 5. Content Systems (The Creative Storage)
- **Mac Mary Vault** - Prompts and templates for the characters
- **Visual Assets** - Images and graphics you create
- **Documentation** - Guides and instructions
- **Marketing** - Content for selling the work
- **Organized Content** - Well-organized content libraries

#### 6. Web Applications (The Websites)
- **ChiefPilot** - The main website
- **Admin Dashboard** - A place to manage everything
- **Control Center** - Another management interface
- **Other specialized apps** - Various tools for specific needs

---

## Getting Started (Just 5 Steps)

### Step 1: Check The Computer (5 minutes)

**What to do:**
- Make sure you have Node.js installed (version 22.23.1 is best)
- Open the terminal or command prompt
- Type `node --version` to check
- If you don't have it, download it from nodejs.org

**Why it helps:** The tools need Node.js to work. It's like the engine that powers them.

### Step 2: Set Up The Secrets (10 minutes)

**What to do:**
- Find the `.env.example` file in each system folder
- Copy it to create a `.env` file
- Fill in the API keys, passwords, and settings
- Never share the `.env` files with anyone

**Why it helps:** The tools need secret codes to talk to other services. These codes keep the accounts safe.

### Step 3: Install the Tools (15 minutes)

**What to do:**
- Go to each system folder (bots, automation, core, etc.)
- Type `npm install` in each folder
- Wait for the installation to finish
- Do this for every system you want to use

**Why it helps:** This downloads all the pieces each tool needs to work.

### Step 4: Test One System (10 minutes)

**What to do:**
- Start with the Telegram Bot (it's the easiest)
- Go to `bots/telegram-bot`
- Type `npm start`
- See if it runs without errors
- If it works, great! If not, check the troubleshooting section

**Why it helps:** Testing one system first helps you learn how things work before trying everything.

### Step 5: Connect Notion Account (20 minutes)

**What to do:**
- Get the Notion API key <---first learn this!!!
- Add to `.env` files

**Why it helps:** The tool needs permission to access the accounts on other services.

---

## The First Week Plan

### Day 1: Foundation (30 minutes)
- ☐ Install Node.js
- ☐ Set up the first `.env` file
- ☐ Install dependencies for one system
- ☐ Test that system runs

### Day 2: Bot Setup (45 minutes)
- ☐ Test basic features

### Day 3: Core Systems (45 minutes)
- ☐ Set up Character Database
- ☐ Add the first character
- ☐ Set up Integration Hub
- ☐ Test the connection

### Day 4: Automation (45 minutes)
- ☐ Set up Social Media Automation
- ☐ Connect one social media account
- ☐ Set up Notion Sync
- ☐ Test the sync

### Day 5: Organization (45 minutes)
- ☐ Set up Heart Calendar
- ☐ Add the first event
- ☐ Set up Daily Checklists
- ☐ Complete the first checklist

### Day 6: Content (30 minutes)
- ☐ Explore the Mac Mary Vault
- ☐ Look at Visual Assets
- ☐ Read some documentation
- ☐ Organize one content folder

### Day 7: Integration (60 minutes)
- ☐ Test how systems work together
- ☐ Run all systems at once
- ☐ Check for any errors
- ☐ Celebrate the first week!

---

## Understanding Each System

### Bot Systems

#### Telegram Bot
**What it does:** A robot helper that lives on Telegram.

**Simple terms:** It's like having a helper inside Telegram that can do things for you when you type commands.

**Main commands:**
- `/prompt` - Get creative writing prompts
- `/random` - Get random character information
- `/character` - Learn about specific characters
- `/generate` - Create images with AI
- `/status` - Check how things are running

**How to use:**
1. Find the bot on Telegram
2. Type `/start` to begin
3. Type commands to make it do things
4. It responds with text or images

#### WhatsApp Bot
**What it does:** A robot helper that works on WhatsApp Business.

**Simple terms:** It's like the Telegram bot but for WhatsApp, with some special features for business.

**Main features:**
- Send template messages
- Track who engages with the messages
- Connect to the character database
- Generate prompts on demand

**How to use:**
1. Set up WhatsApp Business API
2. Connect the phone number
3. Send messages to the bot
4. It responds automatically

### Automation Systems

#### Social Media Automation
**What it does:** Posts content to Instagram and TikTok automatically.

**Simple terms:** Instead of posting manually, this tool schedules and posts for you at the best times.

**What it can do:**
- Schedule posts in advance
- Find the best times to post
- Track how well posts perform
- Create content calendars

**How to use:**
1. Connect the Instagram account
2. Connect the TikTok account
3. Create content ideas
4. Schedule when to post
5. Let it do the work

#### Notion Sync
**What it does:** Keeps the Notion databases in sync with the other systems.

**Simple terms:** When you update information in one place, it automatically updates everywhere else.

**What it can sync:**
- Character information
- Content calendars
- Task lists
- Project data

**How to use:**
1. Get the Notion API key
2. Connect the databases
3. Set up what to sync
4. Choose how often to sync
5. Let it run automatically

#### Content Generation
**What it does:** Creates content using AI.

**Simple terms:** It's like having a writer assistant that can create text for you.

**What it can create:**
- Social media posts
- Character descriptions
- Story ideas
- Marketing copy

**How to use:**
1. Choose what type of content you want
2. Give it some details
3. Let AI create the content
4. Review and edit if needed
5. Use or schedule the content

### Core Systems

#### Character Database
**What it does:** Stores all information about the characters (Mac and Mary).

**Simple terms:** It's like a filing cabinet for everything about the characters, all organized and easy to find.

**What it stores:**
- Character names and descriptions
- Personality traits
- Backstories
- Relationships
- Images and appearances

**How to use:**
1. Open the character database
2. Add a new character
3. Fill in their information
4. Save it
5. Access it anytime from any system

#### Integration Hub
**What it does:** The central place where all systems connect and talk to each other.

**Simple terms:** It's like a traffic controller that makes sure all the tools can work together smoothly.

**What it does:**
- Connects all the systems
- Shares data between them
- Provides a web interface
- Monitors system health

**How to use:**
1. Start the integration hub
2. Connect the other systems to it
3. Use the web interface to manage everything
4. Monitor how things are running

#### Shared Config
**What it does:** Stores settings that all systems use.

**Simple terms:** It's like a settings panel that controls multiple tools at once.

**What it contains:**
- File paths
- API endpoints
- Common settings
- System preferences

**How to use:**
1. Open the shared config file
2. Change settings as needed
3. All systems will use the new settings
4. Restart systems to apply changes

### Organizational Systems

#### Heart Calendar
**What it does:** A special calendar with 28-day months.

**Simple terms:** It's like a regular calendar, but every month is the same length, making planning easier.

**Why it's special:**
- Each month has exactly 28 days
- The year has 336 days (12 × 28)
- Year starts on March 21st
- Months have special names

**How to use:**
1. Open the Heart Calendar
2. See today's date
3. Add events and deadlines
4. Plan the schedule
5. Connect it to other systems

#### Daily Checklists
**What it does:** Creates to-do lists for you every day automatically.

**Simple terms:** You don't have to remember what to do each day. The system remembers for you.

**How it works:**
- Creates morning, mid-day, and evening lists
- Uses templates based on the work
- Checks off items when you complete calendar events
- Tracks the completion rate

**How to use:**
1. Open the daily checklist
2. See what tasks are waiting
3. Complete the tasks
4. Check them off
5. Feel good about the progress

#### Stakeholder Tracker
**What it does:** Keeps track of important people you work with and how the relationships are going.

**Simple terms:** It's like an address book that also tells you if the relationships are getting better or worse.

**What it tracks:**
- Contact information
- How important they are (influence level)
- How things are going (sentiment score)
- When you last talked to them
- Notes about interactions

**How to use:**
1. Add a person you work with
2. Set their importance level
3. Set how things are going (sentiment score)
4. Update after interactions
5. Get alerts when someone needs attention

#### Depot Automation
**What it does:** Specialized tools for different parts of the business (depots).

**Simple terms:** Different departments need different tools. These are custom tools for each department.

**The depots:**
- **Consort** - Content creation and management
- **Scribe** - Document and contract management
- **CashingHouse** - Financial tracking
- **Holdings** - Asset and investment management

**How to use:**
1. Choose which depot you work with
2. Use the tools for that depot
3. Each tool has specific features
4. They all connect to the main system

### Content Systems

#### Mac Mary Vault
**What it does:** Stores prompts and templates for the characters Mac and Mary.

**Simple terms:** It's a library of writing prompts and character information that you can use anytime.

**What it contains:**
- Character prompts
- Writing templates
- Story ideas
- Character development tools

**How to use:**
1. Browse the vault
2. Find a prompt you like
3. Use it for creative work
4. Add the own prompts
5. Organize by category

#### Visual Assets
**What it does:** Stores all the images and graphics.

**Simple terms:** It's like a photo album for all the pictures and graphics you create.

**What it contains:**
- Character images
- Social media graphics
- Marketing materials
- AI-generated images

**How to use:**
1. Upload images to the folder
2. Organize them by category
3. Access them from other systems
4. Use them in the content

#### Documentation
**What it does:** Contains guides and instructions for everything.

**Simple terms:** It's like a manual that explains how to use everything in the toolkit.

**What it contains:**
- System guides
- How-to instructions
- Troubleshooting tips
- Best practices

**How to use:**
1. Find the documentation folder
2. Look for the guide you need
3. Read the instructions
4. Follow the steps
5. Ask for help if stuck

#### Marketing
**What it does:** Contains content for selling and promoting the work.

**Simple terms:** It's the marketing materials library.

**What it contains:**
- Sales copy
- Product descriptions
- Ad templates
- Branding materials

**How to use:**
1. Browse marketing materials
2. Customize templates for the needs
3. Use them for promotions
4. Track what works best

#### Organized Content
**What it does:** Well-organized libraries of content.

**Simple terms:** It's like a library where everything is perfectly organized and easy to find.

**What it contains:**
- Starter kits
- Technical documentation
- Content templates
- Organized resources

**How to use:**
1. Navigate the organized folders
2. Find what you need
3. Use the templates
4. Add the own content
5. Keep it organized

### Web Applications

#### ChiefPilot
**What it does:** The main website for managing everything.

**Simple terms:** It's like a dashboard where you can see and control all the tools from one place.

**What it can do:**
- View all the systems
- Manage characters
- Access content
- Monitor performance

**How to use:**
1. Start the web application
2. Open it in the browser
3. Navigate the interface
4. Use the features
5. Manage everything from one place

#### Admin Dashboard
**What it does:** A special dashboard for administrative tasks.

**Simple terms:** It's like a control panel for managing the technical side of things.

**What it can do:**
- Monitor system health
- Manage users
- View logs
- Configure settings

**How to use:**
1. Access the admin dashboard
2. Log in with the credentials
3. Use the administrative tools
4. Monitor system performance
5. Make configuration changes

#### Other Web Apps
**What they do:** Specialized tools for specific needs.

**Simple terms:** Different websites for different jobs.

**Available apps:**
- Control Center - Another management interface
- Lockbox Quest - A specialized tool
- Master Dashboard - High-level overview
- Mind Forge - Creative tools
- PAATS System - Voice-related tools
- Tak-Zu0 Assistant - AI assistant interface

**How to use:**
1. Choose the app you need
2. Start it up
3. Use its specific features
4. Integrate with other systems if needed

---

## Setup Instructions

### Prerequisites Checklist

Before you start, make sure you have:

- ☐ A computer (Mac, Windows, or Linux)
- ☐ Internet connection
- ☐ Node.js version 22.23.1 (or close to it)
- ☐ npm (comes with Node.js)
- ☐ A code editor (VS Code is recommended)
- ☐ Git (optional, but helpful)
- ☐ Accounts on services you want to connect (Telegram, WhatsApp, Notion, etc.)

### Step-by-Step Setup

#### Phase 1: Core Setup (Day 1)

1. **Install Node.js**
   - Go to nodejs.org
   - Download the LTS version (22.23.1 recommended)
   - Run the installer
   - Restart the computer
   - Check with `node --version`

2. **Set Up Project**
   - Navigate to the project folder
   - Run `npm install` in the main folder
   - Copy `.env.example` to `.env`
   - Fill in basic settings

3. **Test the Setup**
   - Run `node --version`
   - Run `npm --version`
   - Check that everything works

#### Phase 2: Bot Setup (Day 2)

1. **Telegram Bot**
   - Go to `bots/telegram-bot`
   - Run `npm install`
   - Copy `.env.example` to `.env`
   - Get the bot token from BotFather on Telegram
   - Add the token to `.env`
   - Run `npm start`
   - Test with `/start` command

2. **WhatsApp Bot**
   - Go to `bots/whatsapp-bot`
   - Run `npm install`
   - Copy `.env.example` to `.env`
   - Get the WhatsApp Business API credentials
   - Add credentials to `.env`
   - Run `npm start`
   - Test with a message

#### Phase 3: Core Systems (Day 3)

1. **Character Database**
   - Go to `core/character-database`
   - Run `npm install`
   - Copy `.env.example` to `.env`
   - Set the database path
   - Add the first character
   - Test the database

2. **Integration Hub**
   - Go to `core/integration-hub`
   - Run `npm install`
   - Copy `.env.example` to `.env`
   - Configure the hub settings
   - Run `npm run dev`
   - Test the web interface

#### Phase 4: Automation (Day 4)

1. **Social Media Automation**
   - Go to `automation/social-media`
   - Run `npm install`
   - Copy `.env.example` to `.env`
   - Connect the social media accounts
   - Test the connection
   - Schedule a test post

2. **Notion Sync**
   - Go to `automation/notion-sync`
   - Run `npm install`
   - Copy `.env.example` to `.env`
   - Get the Notion API key
   - Connect the databases
   - Test the sync

#### Phase 5: Organization (Day 5)

1. **Heart Calendar**
   - Go to `organizational/heart-calendar`
   - Install Python if needed
   - Run `python heart_calendar.py`
   - Add the first event
   - Explore the calendar

2. **Daily Checklists**
   - Go to `organizational/daily-automation`
   - Run `python daily_checklist_automation.py`
   - Complete the first checklist
   - Customize templates if desired

3. **Stakeholder Tracker**
   - Go to `organizational/stakeholder-tracking`
   - Run `python stakeholder_tracker.py`
   - Add the first stakeholder
   - Set sentiment scores
   - Generate reports

#### Phase 6: Content (Day 6)

1. **Explore Content Systems**
   - Browse `content/mac-mary-vault`
   - Look at `content/visual-assets`
   - Read `content/documentation`
   - Explore `content/organized-content`

2. **Organize The Content**
   - Create folders if needed
   - Organize existing content
   - Add new content
   - Set up the structure

#### Phase 7: Web Apps (Day 7)

1. **ChiefPilot**
   - Go to `web-apps/chiefpilot`
   - Run `npm install`
   - Copy `.env.example` to `.env`
   - Run `npm run dev`
   - Open in browser
   - Explore the interface

2. **Admin Dashboard**
   - Go to `web-apps/admin-dashboard`
   - Run `npm install`
   - Copy `.env.example` to `.env`
   - Run `npm run dev`
   - Open in browser
   - Test administrative features

---

## Daily Routine

### Morning (10 minutes)

1. **Check The Systems** (3 minutes)
   - ☐ Make sure bots are running
   - ☐ Check for any error messages
   - ☐ Verify connections are working

2. **Review The Calendar** (2 minutes)
   - ☐ Check Heart Calendar for today
   - ☐ See what's scheduled
   - ☐ Plan the day

3. **Complete Morning Checklist** (3 minutes)
   - ☐ Open the daily checklist
   - ☐ Complete morning tasks
   - ☐ Check items off

4. **Check Messages** (2 minutes)
   - ☐ Review Telegram messages
   - ☐ Review WhatsApp messages
   - ☐ Respond if needed

### Mid-Day (5 minutes)

1. **Check Progress** (2 minutes)
   - ☐ See what you've completed
   - ☐ Check off finished tasks
   - ☐ Update status

2. **Quick System Check** (2 minutes)
   - ☐ Make sure automation is running
   - ☐ Check social media posts
   - ☐ Verify sync status

3. **Update Stakeholders** (1 minute)
   - ☐ If you talked to someone important
   - ☐ Update their sentiment score
   - ☐ Add notes if needed

### Evening (10 minutes)

1. **Finish Daily Tasks** (4 minutes)
   - ☐ Complete remaining checklist items
   - ☐ Check everything off
   - ☐ Review the progress

2. **Review Tomorrow** (3 minutes)
   - ☐ Check calendar for tomorrow
   - ☐ See what's coming up
   - ☐ Prepare for tomorrow

3. **System Health Check** (2 minutes)
   - ☐ Check for any errors
   - ☐ Backup important data
   - ☐ Schedule any maintenance

4. **Reflect** (1 minute)
   - ☐ Think about what went well
   - ☐ Note what could be better
   - ☐ Plan improvements

---

## Weekly Routine

### Day 1: System Review (20 minutes)

1. **Check All Systems**
   - ☐ Verify all bots are running
   - ☐ Check automation status
   - ☐ Review system logs
   - ☐ Fix any issues

2. **Review Performance**
   - ☐ Check completion rates
   - ☐ Review system performance
   - ☐ Look for bottlenecks
   - ☐ Plan optimizations

### Day 2: Content Review (20 minutes)

1. **Content Calendar**
   - ☐ Review upcoming content
   - ☐ Check character balance
   - ☐ Plan new content
   - ☐ Schedule posts

2. **Performance Check**
   - ☐ Review social media performance
   - ☐ Check engagement metrics
   - ☐ Identify best content types
   - ☐ Adjust strategy

### Day 3: Financial Review (15 minutes)

1. **Financial Tracker**
   - ☐ Review transactions
   - ☐ Check revenue
   - ☐ Look at platform performance
   - ☐ Plan payouts

2. **Asset Review**
   - ☐ Check portfolio performance
   - ☐ Review risk assessment
   - ☐ Plan rebalancing if needed
   - ☐ Update asset values

### Day 4: Stakeholder Review (15 minutes)

1. **Stakeholder Tracker**
   - ☐ Review sentiment trends
   - ☐ Check for alerts
   - ☐ Update contact information
   - ☐ Plan outreach

2. **Relationship Building**
   - ☐ Reach out to important stakeholders
   - ☐ Schedule meetings
   - ☐ Update sentiment scores
   - ☐ Document interactions

### Day 5: Document Review (15 minutes)

1. **Document Manager**
   - ☐ Check for expiring contracts
   - ☐ Review document status
   - ☐ Update versions
   - ☐ Plan renewals

2. **Cleanup**
   - ☐ Archive old documents
   - ☐ Remove duplicates
   - ☐ Organize folders
   - ☐ Update templates

### Day 6: Planning (20 minutes)

1. **Strategic Planning**
   - ☐ Review goals
   - ☐ Assess progress
   - ☐ Plan next week
   - ☐ Set priorities

2. **System Updates**
   - ☐ Check for updates
   - ☐ Plan maintenance
   - ☐ Schedule updates
   - ☐ Backup data

### Day 7: Weekly Summary (15 minutes)

1. **Generate Reports**
   - ☐ Run all system reports
   - ☐ Review performance
   - ☐ Identify trends
   - ☐ Document insights

2. **Celebration**
   - ☐ Acknowledge accomplishments
   - ☐ Note improvements
   - ☐ Plan rewards
   - ☐ Prepare for next week

---

## Monthly Routine

### Week 1: Deep Dive (1 hour)

1. **Full System Review**
   - ☐ Check all systems thoroughly
   - ☐ Review all logs
   - ☐ Test all integrations
   - ☐ Document issues

2. **Data Analysis**
   - ☐ Analyze all data
   - ☐ Look for patterns
   - ☐ Identify trends
   - ☐ Generate insights

### Week 2: Optimization (1 hour)

1. **System Optimization**
   - ☐ Improve performance
   - ☐ Fix bottlenecks
   - ☐ Optimize settings
   - ☐ Clean up data

2. **Template Review**
   - ☐ Review all templates
   - ☐ Update based on usage
   - ☐ Create new templates
   - ☐ Remove unused ones

### Week 3: Strategic Review (1 hour)

1. **Goal Review**
   - ☐ Review monthly goals
   - ☐ Assess progress
   - ☐ Adjust strategies
   - ☐ Set new goals

2. **Planning**
   - ☐ Plan next month
   - ☐ Schedule major tasks
   - ☐ Allocate resources
   - ☐ Set milestones

### Week 4: Maintenance (1 hour)

1. **System Maintenance**
   - ☐ Update all systems
   - ☐ Apply security patches
   - ☐ Test updates
   - ☐ Document changes

2. **Backup and Archive**
   - ☐ Backup all data
   - ☐ Archive old data
   - ☐ Clean up storage
   - ☐ Verify backups

---

## Troubleshooting

### Common Problems and Solutions

#### Problem: "The program won't start"

**Try these solutions:**
1. Check if Node.js is installed: `node --version`
2. Make sure you're in the right folder
3. Check if dependencies are installed: `npm install`
4. Look at the error message for clues
5. Check the `.env` file for missing settings

#### Problem: "I can't connect to my accounts"

**Try these solutions:**
1. Verify the API keys are correct
2. Check if the accounts have the right permissions
3. Make sure the internet connection is working
4. Check if the service is having problems
5. Try regenerating the API keys

#### Problem: "The bot isn't responding"

**Try these solutions:**
1. Check if the bot is running
2. Verify the bot token is correct
3. Check if Telegram/WhatsApp is working
4. Look at the bot logs for errors
5. Restart the bot

#### Problem: "My data isn't syncing"

**Try these solutions:**
1. Check if the sync service is running
2. Verify the API credentials
3. Check if the database is accessible
4. Look at sync logs for errors
5. Try manual sync

#### Problem: "The web app won't load"

**Try these solutions:**
1. Check if the server is running
2. Verify the port is correct
3. Check the browser console for errors
4. Clear the browser cache
5. Try a different browser

#### Problem: "I'm getting permission errors"

**Try these solutions:**
1. Check file permissions
2. Make sure you're using the right account
3. Verify API permissions
4. Check if directories exist
5. Create missing directories

#### Problem: "The system is running slowly"

**Try these solutions:**
1. Close other programs
2. Check if data files are too large
3. Archive old data
4. Restart the system
5. Check system resources

#### Problem: "I made a mistake and need to undo it"

**Try these solutions:**
1. Check for backup files
2. Look for version history
3. Edit data files directly if needed
4. Restore from backup
5. Ask for help if unsure

### Getting Help

**Where to find help:**
1. Check the README files in each folder
2. Look at the documentation in `content/documentation/`
3. Search for similar issues online
4. Check error messages for clues
5. Ask for help in the community

**What to include when asking for help:**
- What you were trying to do
- What happened instead
- Any error messages
- What you've already tried
- The system information

---

## Quick Reference

### File Locations

```
Tiapmaatzu-OS-Toolkit/
├── bots/
│   ├── telegram-bot/          # Telegram bot
│   ├── whatsapp-bot/          # WhatsApp bot
│   └── shared/                # Shared bot tools
├── automation/
│   ├── social-media/          # Social media automation
│   ├── notion-sync/           # Notion synchronization
│   └── content-generation/    # AI content creation
├── core/
│   ├── character-database/    # Character information
│   ├── integration-hub/       # Central connection point
│   └── shared-config/         # Shared settings
├── organizational/
│   ├── heart-calendar/        # Special calendar
│   ├── daily-automation/      # Daily checklists
│   ├── stakeholder-tracking/  # People tracking
│   └── depot-automation/      # Business tools
├── content/
│   ├── mac-mary-vault/        # Character prompts
│   ├── visual-assets/         # Images and graphics
│   ├── documentation/        # Guides and instructions
│   ├── marketing/             # Marketing materials
│   └── organized-content/     # Organized libraries
├── web-apps/
│   ├── chiefpilot/            # Main website
│   ├── admin-dashboard/       # Admin interface
│   └── [other apps]/          # Specialized tools
└── scripts/
    ├── setup/                 # Installation scripts
    ├── deployment/            # Deployment scripts
    └── maintenance/           # Maintenance tools
```

### Common Commands

**Node.js:**
```bash
node --version          # Check Node.js version
npm --version           # Check npm version
npm install             # Install dependencies
npm start               # Start a program
npm run dev             # Start in development mode
```

**Python:**
```bash
python --version        # Check Python version
python script.py        # Run a Python script
pip install package     # Install a Python package
```

**Git:**
```bash
git status              # Check git status
git add .               # Add all changes
git commit -m "message" # Commit changes
git push                # Push to remote
```

### Environment Variables

**Common variables you'll need to start:**
- `NOTION_API_KEY` - Notion integration key
- `INSTAGRAM_*` - Instagram API credentials
- `TIKTOK_*` - TikTok API credentials
- `XAI_*` - XAI API credentials
- `CHARACTER_DATABASE_PATH` - Path to character database
- `VISUAL_ASSETS_PATH` - Path to visual assets

### System Status Indicators

**What to look for:**
- ✅ Green/Running - System is working correctly
- ⚠️ Yellow/Warning - System has issues but is working
- ❌ Red/Error - System is not working
- 🔵 Blue/Idle - System is waiting for input
- 🟡 Purple/Maintenance - System is being updated

### Emergency Contacts

**System Issues:**
- Check documentation first
- Look at error logs
- Try basic troubleshooting
- Ask for help if needed

**Data Issues:**
- Check backup files
- Verify data integrity
- Restore from backup if needed
- Contact support for serious issues

---

## Final Notes

### Remember

This toolkit is designed to make the life easier, not harder. If something feels too complicated, that's a sign to simplify or ask for help.

### Keys to Success

1. **Start small** - Don't try to use everything at once
2. **Be consistent** - Use the tools regularly, even for just a few minutes
3. **Ask questions** - If something doesn't make sense, ask
4. **Customize** - Make the tools work for you, not the other way around
5. **Back up** - Always keep copies of the important data

### You Got This!

You now have a complete toolkit to organize the work, automate tasks, and manage the creative projects. Take it one step at a time, and you'll be amazed at what you SHALL accomplish.

**START TODAY. TO START EVERYDAY.** 
*Stay consistent. 
Compound productivity. 
Keep growing. 
Watch SPIRIT SOAR!* 🚀

---

* **Need more details? Check the README files in each folder for specific guidance. Or contact the ZI at zi.t@post.com**

*PRIVATE BETWEEN PARTIES. DO NOT SHARE! If sent to you by the ZI, it is only meant for YOU!!! ALL RIGHTS RESERVED (2026) RELLYVENT MEDIA GROUP | Rell.io | Tiapma'atzu OS | Gnostic Auto-Didactico*