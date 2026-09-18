# iOS Shortcuts Workflows for Go-Live Automation

These are iOS Shortcuts workflows that can automate parts of the go-live process. Each workflow can be created in the Shortcuts app on your iPhone or iPad.

---

## Shortcut 1: Generate Random Auth Secret

**Purpose:** Quickly generate a random secret string for the `BETTER_AUTH_SECRET` environment variable.

**Workflow Steps:**

1. **Action:** Get Text from Input
   - Or skip this if you want it fully automated

2. **Action:** Generate Random Number
   - Min: 0
   - Max: 9999999999

3. **Action:** Get Current Date
   - Format: Custom
   - Include: All details

4. **Action:** Text
   - Input: Combine the random number and date
   - Add some random letters for complexity

5. **Action:** Base64 Encode
   - This makes it look like a proper secret

6. **Action:** Copy to Clipboard
   - This copies the secret so you can paste it into Vercel

7. **Action:** Show Notification
   - Text: "Auth secret copied to clipboard!"

**Alternative (Simpler):**

1. **Action:** Get Contents of URL
   - URL: https://www.uuidgenerator.net/api/version4
2. **Action:** Get Text from Input
3. **Action:** Copy to Clipboard
4. **Action:** Show Notification
   - Text: "UUID copied to clipboard!"

**How to use:**
- Run this shortcut whenever you need a new `BETTER_AUTH_SECRET`
- Paste the result into Vercel environment variables

---

## Shortcut 2: Open All Dashboard Links

**Purpose:** Opens all the key dashboard links you need during deployment in Safari tabs.

**Workflow Steps:**

1. **Action:** Open in Safari
   - URL: https://vercel.com/dashboard

2. **Action:** Wait
   - Duration: 1 second

3. **Action:** Open in Safari
   - URL: https://supabase.com/dashboard

4. **Action:** Wait
   - Duration: 1 second

5. **Action:** Open in Safari
   - URL: https://console.neon.tech/

6. **Action:** Wait
   - Duration: 1 second

7. **Action:** Show Notification
   - Text: "All dashboards opened in Safari"

**How to use:**
- Run this at the start of your deployment session
- Switch between tabs as needed

---

## Shortcut 3: Environment Variables Checklist

**Purpose:** Shows you a checklist of environment variables to add to Vercel, based on your chosen database.

**Workflow Steps:**

1. **Action:** Choose from Menu
   - Title: "Which database are you using?"
   - Options:
     - Supabase
     - Neon
     - SQLite
     - PGLite

2. **Action:** If (Choose from Menu is "Supabase")
   - **Then:**
     - **Action:** Show Alert
       - Title: "Supabase Variables Needed"
       - Message: |
         Add these to Vercel Settings > Environment Variables:
         1. SUPABASE_URL = your project URL
         2. SUPABASE_ANON_KEY = your anon key
         3. SUPABASE_SERVICE_ROLE_KEY = your service key
         Add to ALL environments: Production, Preview, Development

3. **Action:** If (Choose from Menu is "Neon")
   - **Then:**
     - **Action:** Show Alert
       - Title: "Neon Variables Needed"
       - Message: |
         Add this to Vercel Settings > Environment Variables:
         1. DATABASE_URL = your connection string
         Add to ALL environments: Production, Preview, Development

4. **Action:** If (Choose from Menu is "SQLite")
   - **Then:**
     - **Action:** Show Alert
       - Title: "SQLite Variables Needed"
       - Message: |
         Add this to Vercel Settings > Environment Variables:
         1. SQLITE_PATH = ./data/app.db
         ⚠️ Warning: SQLite on Vercel is not recommended!
         Add to ALL environments: Production, Preview, Development

5. **Action:** If (Choose from Menu is "PGLite")
   - **Then:**
     - **Action:** Show Alert
       - Title: "PGLite - No Variables Needed"
       - Message: |
         PGLite is the default fallback.
         No database environment variables needed.
         ⚠️ Data is lost on server restart. Not for production.

6. **Action:** Choose from Menu
   - Title: "Do you need authentication?"
   - Options:
     - Yes, my app has user accounts
     - No, my app doesn't need auth

7. **Action:** If (Choose from Menu is "Yes, my app has user accounts")
   - **Then:**
     - **Action:** Show Alert
       - Title: "Auth Variables Needed"
       - Message: |
         Add these to Vercel Settings > Environment Variables:
         1. BETTER_AUTH_SECRET = (run "Generate Random Auth Secret" shortcut)
         2. BETTER_AUTH_URL = your Vercel app URL
         3. VITE_AUTH_ENABLED = true
         Add to ALL environments: Production, Preview, Development

**How to use:**
- Run this shortcut when you're adding environment variables to Vercel
- It will show you exactly what you need based on your choices

---

## Shortcut 4: Deployment Status Checker

**Purpose:** Helps you check if your deployment succeeded by opening the Vercel deployment page.

**Workflow Steps:**

1. **Action:** Ask for Input
   - Prompt: "Enter your Vercel project name"
   - Input Type: Text

2. **Action:** Text
   - Input: `https://vercel.com/username/[Project Name]`
   - Replace `[Project Name]` with the input from step 1
   - Note: You'll need to customize the URL with your Vercel username

3. **Action:** Open in Safari
   - URL: Text from step 2

4. **Action:** Show Notification
   - Text: "Opening your Vercel project dashboard"

**How to use:**
- Run this shortcut to quickly open your Vercel project
- Check the Deployments tab for the latest status

---

## Shortcut 5: Test Live Site

**Purpose:** Opens your live site for testing.

**Workflow Steps:**

1. **Action:** Ask for Input
   - Prompt: "Enter your live site URL"
   - Input Type: Text
   - Default: `https://your-app.vercel.app`

2. **Action:** Open in Safari
   - URL: Input from step 1

3. **Action:** Wait
   - Duration: 2 seconds

4. **Action:** Show Alert
   - Title: "Testing Checklist"
       - Message: |
         Test these things:
         ✓ Does the page load?
         ✓ Can you create data?
         ✓ Does data persist after refresh?
         ✓ Does auth work (if enabled)?
         ✓ Does it look good on mobile?

**How to use:**
- Run this after each deployment
- Follow the checklist to verify everything works

---

## Shortcut 6: Weekly Maintenance Reminder

**Purpose:** A weekly reminder to check your app's health.

**Workflow Steps:**

1. **Action:** Choose from Menu
   - Title: "What do you want to check?"
   - Options:
     - Vercel Dashboard
     - Database Dashboard
     - Both

2. **Action:** If (Choose from Menu is "Vercel Dashboard" or "Both")
   - **Then:**
     - **Action:** Open in Safari
       - URL: https://vercel.com/dashboard

3. **Action:** If (Choose from Menu is "Database Dashboard" or "Both")
   - **Then:**
     - **Action:** Choose from Menu
       - Title: "Which database?"
       - Options:
         - Supabase
         - Neon

     - **Action:** If (Choose from Menu is "Supabase")
       - **Then:**
         - **Action:** Open in Safari
           - URL: https://supabase.com/dashboard

     - **Action:** If (Choose from Menu is "Neon")
       - **Then:**
         - **Action:** Open in Safari
           - URL: https://console.neon.tech/

4. **Action:** Show Alert
   - Title: "Weekly Maintenance Checklist"
   - Message: |
     Check these things:
     ✓ Any errors in Vercel dashboard?
     ✓ Database usage within limits?
     ✓ Any security updates needed?
     ✓ Backup status (if applicable)?

**How to use:**
- Set this to run weekly (Shortcuts > Automation > Time of Day)
- Pick a day and time that works for you
- Follow the checklist each week

---

## Shortcut 7: Quick Reference Card

**Purpose:** Shows you a quick reference of all environment variables at a glance.

**Workflow Steps:**

1. **Action:** Show Alert
   - Title: "Environment Variables Quick Reference"
   - Message: |
     🔵 Supabase:
     SUPABASE_URL
     SUPABASE_ANON_KEY
     SUPABASE_SERVICE_ROLE_KEY

     🟢 Neon:
     DATABASE_URL

     🟡 SQLite:
     SQLITE_PATH

     🟣 PGLite:
     (none needed)

     🔐 Auth (if needed):
     BETTER_AUTH_SECRET
     BETTER_AUTH_URL
     VITE_AUTH_ENABLED

2. **Action:** Choose from Menu
   - Title: "Want detailed setup guide?"
   - Options:
     - Yes, open the full guide
     - No, I'm good

3. **Action:** If (Choose from Menu is "Yes, open the full guide")
   - **Then:**
     - **Action:** Open in Safari
       - URL: (path to your GO_LIVE_GUIDE_NOTION.md in Notion)

**How to use:**
- Run this when you need a quick reminder of variable names
- Use it as a cheat sheet during setup

---

## Shortcut 8: Redeploy Helper

**Purpose:** Opens your Vercel deployment page and reminds you of the redeploy steps.

**Workflow Steps:**

1. **Action:** Ask for Input
   - Prompt: "Enter your Vercel project URL"
   - Input Type: Text
   - Default: `https://vercel.com/username/project`

2. **Action:** Open in Safari
   - URL: Input from step 1

3. **Action:** Wait
   - Duration: 2 seconds

4. **Action:** Show Alert
   - Title: "Redeploy Steps"
   - Message: |
     1. Click the "Deployments" tab
     2. Find the latest deployment
     3. Click the three dots (⋯) menu
     4. Click "Redeploy"
     5. Click "Redeploy" again in the popup
     6. Wait 1-3 minutes for rebuild
     7. Test your live site

**How to use:**
- Run this after adding or changing environment variables
- Follow the steps to trigger a redeploy

---

## Shortcut 9: Database Credentials Safe

**Purpose:** Securely store your database credentials in the iOS Keychain (simulated via input prompts).

**Workflow Steps:**

1. **Action:** Choose from Menu
   - Title: "What do you want to do?"
   - Options:
     - Save credentials
     - Retrieve credentials
     - Delete credentials

2. **Action:** If (Choose from Menu is "Save credentials")
   - **Then:**
     - **Action:** Ask for Input
       - Prompt: "Database type?"
       - Options: Supabase, Neon

     - **Action:** Ask for Input
       - Prompt: "Enter Project URL / Connection String"
       - Input Type: Text

     - **Action:** Ask for Input
       - Prompt: "Enter API Key / Password"
       - Input Type: Text
       - Is Secure: Yes

     - **Action:** Save to File
       - Path: iCloud Drive/Shortcuts/database-credentials.txt
       - Content: Combine the inputs

     - **Action:** Show Notification
       - Text: "Credentials saved to iCloud Drive"

3. **Action:** If (Choose from Menu is "Retrieve credentials")
   - **Then:**
     - **Action:** Get File from Folder
       - Path: iCloud Drive/Shortcuts/database-credentials.txt

     - **Action:** Show Alert
       - Title: "Your Credentials"
       - Message: File contents

4. **Action:** If (Choose from Menu is "Delete credentials")
   - **Then:**
     - **Action:** Delete File
       - Path: iCloud Drive/Shortcuts/database-credentials.txt

     - **Action:** Show Notification
       - Text: "Credentials deleted"

**How to use:**
- Use this to store your database credentials securely
- Note: This is a simple implementation using iCloud Drive
- For true security, consider using a dedicated password manager

---

## Shortcut 10: Deployment Health Check

**Purpose:** A comprehensive health check after deployment.

**Workflow Steps:**

1. **Action:** Ask for Input
   - Prompt: "Enter your live site URL"
   - Input Type: Text

2. **Action:** Open in Safari
   - URL: Input from step 1

3. **Action:** Wait
   - Duration: 3 seconds

4. **Action:** Show Alert
   - Title: "Health Check Questions"
   - Message: |
     Answer these questions honestly:

     1. Does the page load without errors?
     2. Can you navigate the app?
     3. Can you create new data?
     4. Does data persist after refresh?
     5. Does authentication work (if enabled)?
     6. Are there console errors (check via Web Inspector)?
     7. Does it load fast enough?
     8. Does it look good on mobile?

5. **Action:** Choose from Menu
   - Title: "How did it go?"
   - Options:
     - All checks passed
     - Some issues found
     - Major problems

6. **Action:** If (Choose from Menu is "All checks passed")
   - **Then:**
     - **Action:** Show Notification
       - Text: "🎉 Deployment successful!"

7. **Action:** If (Choose from Menu is "Some issues found")
   - **Then:**
     - **Action:** Show Alert
       - Title: "Common Fixes"
       - Message: |
         - Check environment variables for typos
         - Clear browser cache
         - Check Vercel build logs
         - Verify database connection

8. **Action:** If (Choose from Menu is "Major problems")
   - **Then:**
     - **Action:** Show Alert
       - Title: "Need Help?"
       - Message: |
         Check the troubleshooting section in the full guide.
         Common issues:
         - Database connection failed
         - Migration errors
         - Auth misconfiguration
         - Build failures

**How to use:**
- Run this after every deployment
- Be honest with your answers
- Use the suggested fixes if issues are found

---

## How to Create These Shortcuts

1. Open the **Shortcuts** app on your iPhone or iPad
2. Tap the **+** button to create a new shortcut
3. Tap the **...** to edit the shortcut
4. Add the actions listed above in order
5. Name your shortcut (use the names provided)
6. Add an icon if you want
7. Tap **Done** to save

**Tips:**
- You can add these shortcuts to your Home Screen for quick access
- Set up automations for recurring tasks (like weekly maintenance)
- Customize the shortcuts to match your specific project details
- Share shortcuts with team members if needed

---

## Automation Ideas

You can set up these shortcuts to run automatically:

### Weekly Maintenance Automation
1. Go to Shortcuts > Automation
2. Tap the **+** button
3. Choose "Time of Day"
4. Pick a day and time (e.g., Monday at 9 AM)
5. Add the "Weekly Maintenance Reminder" shortcut
6. Turn off "Ask Before Running" if you want it fully automatic

### Post-Deployment Automation
1. Create a Personal Automation
2. Trigger: When you open the Vercel app
3. Action: Run the "Test Live Site" shortcut
4. This reminds you to test after checking deployments

---

**Note:** These shortcuts are designed to be flexible. Customize them to fit your specific workflow and project needs. The key actions (Open in Safari, Show Alert, Choose from Menu) are all available in the standard Shortcuts app.
