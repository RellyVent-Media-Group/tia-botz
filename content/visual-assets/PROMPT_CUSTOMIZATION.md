# Prompt Customization Guide

This guide helps you review and customize the AI generation prompts and settings for your visual assets.

## Current Prompt Overview

Your current prompts are organized across 8 platforms with 32 total images:

### Platform Breakdown
- **CRAKREVENUE** (4 images): Promotional content, cost comparisons, campaign scalability
- **TELEGRAM** (4 images): Bot interface, command system, revenue model, automation workflow
- **WHATSAPP** (4 images): Business interface, template system, engagement data, automation flow
- **GOOGLE** (4 images): Ads format coverage, performance data, campaign strategy, A/B testing
- **ADMOB** (4 images): Format coverage, engagement impact, revenue projection, app integration
- **INSTAGRAM** (4 images): Format coverage, growth strategy, engagement comparison, production workflow
- **TIKTOK** (4 images): Format coverage, viral probability, trend adaptation, production workflow
- **MULTI-PLATFORM** (4 images): Platform coverage, brand identity, growth projection, workflow system

## Character Design Elements

### Mac Nazarene
- **Aesthetic**: Professional craftsman
- **Lighting**: Warm amber golden hour
- **Expression**: Confident, trustworthy
- **Setting**: Promotional studio
- **Role**: Technical expert, reliable professional

### Mary Magnumbytes
- **Aesthetic**: Modern tech professional
- **Lighting**: Cool blue professional
- **Expression**: Confident, promotional
- **Setting**: Modern office
- **Role**: Business expert, tech-savvy professional

## Customization Options

### 1. Character Appearance
Modify character descriptions in prompts to match your brand:

**Example: Changing Mac's appearance**
```json
"prompt": "Split-screen composition for adult industry promotional content. Left side: Mac Nazarene character portrait - [YOUR CUSTOM DESCRIPTION], confident trustworthy expression, promotional studio setting..."
```

**Character Elements to Customize:**
- Hair color and style
- Skin tone
- Clothing style
- Accessories
- Age and appearance
- Body type
- Facial features

### 2. Color Schemes
Update color references in prompts:

**Current Examples:**
- "warm amber golden hour lighting"
- "cool blue professional lighting"
- "Instagram aesthetic design with gradient backgrounds"
- "TikTok aesthetic design with bold colors"

**Customization Examples:**
```json
// Brand-specific colors
"warm amber golden hour lighting" → "warm brand-color golden hour lighting"
"cool blue professional lighting" → "cool brand-color professional lighting"

// Platform-specific adaptations
"Instagram aesthetic design" → "Instagram aesthetic design with brand palette"
"TikTok bold colors" → "TikTok bold colors matching brand guidelines"
```

### 3. Text Overlays
Modify text content to match your messaging:

**Current Examples:**
- "25 Prompts • Professional Promotional Content • Brand Consistency"
- "Before: $3,000 shoot, 20 assets. After: $100 AI generation, 200+ assets"
- "Character Consistency: 200-400% Higher Engagement Rates"

**Customization Process:**
1. Open `prompts-organized.json`
2. Find the `prompt` field for the image you want to modify
3. Update the text overlay content
4. Save the file

### 4. Platform-Specific Adaptations
Customize for different platform requirements:

**Instagram Customization:**
```json
"prompt": "Grid layout showing Instagram format coverage with character content. 
Four cells displayed in Instagram style: Reels format with vertical character video thumbnail, 
Stories format with character narrative frames, Grid posts with character portrait squares, 
IGTV format with long-form character content. Each cell showing format-specific character 
integration with [YOUR BRAND] aesthetics. Text overlay: \"[YOUR BRAND MESSAGE]\"..."
```

**TikTok Customization:**
```json
"prompt": "Vertical format showcase for TikTok with character content optimization. 
Four sections displayed vertically in TikTok style: Vertical video with character trend adaptation, 
Character storytime format with narrative, Tutorial content with character host, 
Duet/stitch compatibility indicators. Each section showing TikTok-specific character 
integration with [YOUR BRAND] trending aesthetics..."
```

### 5. Size and Format Adjustments
Modify image dimensions for specific needs:

**Current Sizes:**
- Standard platforms: 1280x769px
- Instagram: 1080x1080px, 1080x1350px
- TikTok: 1080x1920px, 1080x1080px

**To Change Sizes:**
1. Open `prompts-organized.json`
2. Find the `size` field for the image
3. Update the dimensions (e.g., "1920x1080px")
4. Save and regenerate

### 6. Performance Metrics
Update statistics and data visualizations:

**Current Examples:**
- "Brand recognition increase 40%"
- "Conversion rate improvement 35%"
- "Content production cost reduction 95%"

**Customization:**
```json
"prompt": "Professional infographic showing adult industry marketing performance metrics. 
Charts and statistics displaying: Brand recognition increase [YOUR %], 
Conversion rate improvement [YOUR %], Content production cost reduction [YOUR %], 
Campaign scalability [YOUR %] increase..."
```

## Step-by-Step Customization Process

### Step 1: Review Current Prompts
```bash
# Open the human-readable prompts file
open prompts-organized.txt

# Or review the JSON file
open prompts-organized.json
```

### Step 2: Identify Changes Needed
Make a list of:
- Character appearance changes
- Brand color adjustments
- Text overlay modifications
- Platform-specific requirements
- Performance metric updates

### Step 3: Edit the JSON File
```bash
# Open the JSON file in your preferred editor
code prompts-organized.json
# or
vim prompts-organized.json
# or
nano prompts-organized.json
```

### Step 4: Test Your Changes
```bash
# Generate a single test image with modified prompts
source venv/bin/activate
./generate-assets.sh -p crackrevenue -i 1 -m placeholder
```

### Step 5: Review and Iterate
- Check the generated image
- Assess if changes meet your needs
- Continue refining prompts as needed

### Step 6: Batch Generate
```bash
# Once satisfied, generate all assets with your customizations
source venv/bin/activate
./generate-assets.sh -m placeholder
```

## Advanced Customization Examples

### Example 1: Brand Color Integration
```json
{
  "id": 1,
  "name": "promotional-character-showcase",
  "title": "Promotional Character Showcase",
  "folder": "gallery-images",
  "filename": "crackrevenue_mac-mary_promo-showcase_01.jpg",
  "size": "1280x769px",
  "prompt": "Split-screen composition for adult industry promotional content. Left side: Mac Nazarene character portrait - professional craftsman aesthetic, warm brand-orange golden hour lighting, confident trustworthy expression, promotional studio setting with brand-blue accents. Right side: Mary Magnumbytes character portrait - modern tech aesthetic, cool brand-purple professional lighting, confident promotional expression, modern office setting with brand-green elements. Text overlay at bottom: \"[YOUR BRAND NAME] • Professional Promotional Content • Brand Consistency\". Professional high-contrast design with brand-color palette, 1280x769px."
}
```

### Example 2: Industry-Specific Adaptation
```json
{
  "id": 1,
  "name": "bot-interface-preview",
  "title": "Bot Interface Preview",
  "folder": "bot-interface",
  "filename": "telegram_bot-interface_preview_01.jpg",
  "size": "1280x769px",
  "prompt": "Mobile phone mockup showing Telegram bot interface for [YOUR INDUSTRY]. Clean app design with visible bot commands. Welcome message visible at top with [YOUR INDUSTRY] context. Command buttons: /prompt, /random, /batch, /subscribe. Sample prompt delivery showing [YOUR INDUSTRY-SPECIFIC] character prompt content. User interaction elements like buttons and message bubbles. Text overlay: \"[YOUR BRAND] Telegram Bot — Automated [YOUR SERVICE] Delivery\". Professional app interface design with [YOUR BRAND] colors, 1280x769px."
}
```

### Example 3: Performance Metric Updates
```json
{
  "id": 4,
  "name": "industry-specific-results",
  "title": "Industry-Specific Results",
  "folder": "gallery-images",
  "filename": "crackrevenue_industry-results_infographic_01.jpg",
  "size": "1280x769px",
  "prompt": "Professional infographic showing [YOUR INDUSTRY] marketing performance metrics. Charts and statistics displaying: Brand recognition increase [YOUR %], Conversion rate improvement [YOUR %], Content production cost reduction [YOUR %], Campaign scalability [YOUR %] increase. Clean data visualization with bar charts and percentage indicators using [YOUR BRAND] colors. Text overlay: \"[YOUR INDUSTRY] Marketing Results with Character Consistency\". Professional data-driven design, 1280x769px."
}
```

## Prompt Engineering Best Practices

### 1. Be Specific
- Instead of "professional lighting", use "warm golden hour professional lighting"
- Instead of "modern setting", use "modern tech office with brand-colored accents"

### 2. Include Brand Elements
- Reference brand colors, fonts, and styles
- Include brand-specific terminology
- Maintain consistent brand voice

### 3. Consider Platform Requirements
- Instagram: Focus on aesthetics, grid layouts, engagement
- TikTok: Emphasize trends, vertical formats, viral potential
- Google Ads: Highlight performance metrics, ROAS, conversion data

### 4. Test and Iterate
- Start with small changes
- Generate test images
- Review results before full implementation

### 5. Maintain Consistency
- Keep character descriptions consistent across platforms
- Use similar color schemes within platform families
- Maintain brand voice in text overlays

## Common Customization Scenarios

### Scenario 1: Rebranding
1. Update all character descriptions with new brand elements
2. Replace color references with new brand palette
3. Modify text overlays with new brand messaging
4. Test with a few images before full regeneration

### Scenario 2: Industry Change
1. Update industry-specific references in prompts
2. Modify performance metrics to match new industry benchmarks
3. Adjust platform-specific content for new audience
4. Review and update all platform-specific adaptations

### Scenario 3: Platform Focus Change
1. Identify which platforms need more emphasis
2. Enhance prompts for priority platforms
3. Simplify prompts for less important platforms
4. Adjust size and format specifications

## Backup and Version Control

### Before Making Changes
```bash
# Create backup of original prompts
cp prompts-organized.json prompts-organized-backup.json
cp prompts-organized.txt prompts-organized-backup.txt
```

### After Customization
```bash
# Commit your changes to version control
git add prompts-organized.json prompts-organized.txt
git commit -m "Customized prompts for [YOUR BRAND]"
```

### Rollback if Needed
```bash
# Restore original prompts
cp prompts-organized-backup.json prompts-organized.json
cp prompts-organized-backup.txt prompts-organized.txt
```

## Validation Checklist

After customizing prompts, verify:

- [ ] Character descriptions are consistent across all platforms
- [ ] Brand colors are properly integrated
- [ ] Text overlays reflect current messaging
- [ ] Platform-specific requirements are met
- [ ] Performance metrics are realistic for your industry
- [ ] Image sizes match platform specifications
- [ ] JSON syntax is valid (no trailing commas, proper quotation marks)
- [ ] Test generation produces expected results

## Next Steps

1. **Review Current Prompts**: Open `prompts-organized.txt` to see all current prompts
2. **Plan Your Changes**: Identify what needs customization
3. **Make Incremental Changes**: Start with one platform or image type
4. **Test Thoroughly**: Generate test images to verify changes
5. **Scale Up**: Apply successful changes across all platforms
6. **Document Your Customizations**: Keep notes on what works best

## Support

For help with prompt customization:
- Review the original prompts in `prompts-organized.txt`
- Test changes with placeholder generation first
- Keep backups of working prompt versions
- Reference AI generation best practices for your chosen service