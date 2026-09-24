# Documentation Standards and Style Guide

This guide establishes the standards, conventions, and best practices for all documentation produced by the Scribe Depot (TZI.SCR.DEP.BODY).

## Document Classification System

### Classification Levels

#### Public Documents
- **Definition**: Documents approved for external distribution
- **Examples**: Public announcements, published reports, marketing materials
- **Access Requirements**: No restrictions
- **Review Requirements**: Final approval by Key Operations
- **Distribution**: Public channels, website, press

#### Internal Documents
- **Definition**: Organization-wide access only
- **Examples**: Internal procedures, meeting minutes, operational reports
- **Access Requirements**: Organization login credentials
- **Review Requirements**: Standard review process
- **Distribution**: Internal portals, email lists

#### Confidential Documents
- **Definition**: Restricted access to authorized personnel
- **Examples**: Financial reports, legal documents, strategic plans
- **Access Requirements**: Role-based permissions, NDA required
- **Review Requirements**: Enhanced review process, legal review if applicable
- **Distribution**: Secure channels, access-controlled portals

#### Secret Documents
- **Definition**: Highest security level, limited access
- **Examples**: Security protocols, crisis plans, sensitive negotiations
- **Access Requirements**: Explicit authorization, enhanced security
- **Review Requirements**: Multi-level approval, security clearance verification
- **Distribution**: Encrypted channels, need-to-know basis

## Writing Standards

### General Principles

#### Clarity and Precision
- Use clear, concise language
- Avoid jargon unless technical terminology is necessary
- Define technical terms on first use
- Use active voice when possible
- Write for your intended audience

#### Consistency
- Maintain consistent terminology throughout documents
- Use standard abbreviations and acronyms
- Follow established formatting conventions
- Maintain consistent tone and style

#### Accuracy
- Verify all facts and figures
- Cite sources for external information
- Update information regularly
- Correct errors promptly

### Document Structure

#### Standard Document Structure
```markdown
# Document Title

**Document ID**: [ID]
**Classification**: [Level]
**Version**: [X.X.X]
**Last Updated**: [Date]
**Next Review**: [Date]
**Author**: [Name]

## Executive Summary
[Brief overview for quick understanding]

## Table of Contents
[Auto-generated or manual TOC]

## Main Content
[Primary document sections]

## Appendices
[Supporting materials, references]

---
*Document Control Information*
```

#### Section Organization
- Use hierarchical heading structure (H1, H2, H3, etc.)
- Each section should have a clear purpose
- Include transition text between sections
- Use lists for itemized information
- Group related information together

### Formatting Standards

#### Typography
- **Font**: Sans-serif for screen (Arial, Helvetica, system-ui), Serif for print (Times New Roman, Georgia)
- **Font Size**: 12pt body text, 14pt headings, 10pt footnotes
- **Line Spacing**: 1.5 for body text, single for headings
- **Margins**: 1 inch (2.54 cm) standard

#### Headings
```markdown
# Heading 1 - Document Title
## Heading 2 - Major Sections
### Heading 3 - Subsections
#### Heading 4 - Detailed divisions
```

#### Text Emphasis
- **Bold**: For key terms, emphasis, UI elements
- *Italic*: For titles, foreign words, variable names
- `Code`: For technical terms, commands, file names
- ~~Strikethrough~~: For deleted text (in revisions)

#### Lists
```markdown
## Bulleted Lists
- Item 1
- Item 2
  - Nested item
  - Another nested item

## Numbered Lists
1. First item
2. Second item
   1. Nested numbered item
   2. Another nested item

## Definition Lists
Term 1
: Definition 1

Term 2
: Definition 2
```

#### Tables
```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |

*Table Caption: Description of table contents*
```

### Citation and References

#### In-Text Citations
- **Format**: (Author, Year) or [Source]
- **Footnotes**: Use for additional explanatory information
- **Endnotes**: Use for comprehensive references

#### Reference List Format
```markdown
## References

### Books
Author, A. A. (Year). *Title of work*. Publisher.

### Articles
Author, A. A. (Year). Title of article. *Journal Name*, *Volume*(Issue), pages.

### Online Sources
Author, A. A. (Year). Title of document. Retrieved from URL

### Internal Documents
Document Title (Document ID). Department. Date.
```

## Specialty-Specific Standards

### Contract Documentation

#### Contract Structure
```markdown
# [Contract Type] Agreement

**Contract ID**: [ID]
**Classification**: Confidential
**Version**: [X.X.X]
**Effective Date**: [Date]

## Parties
### Party A
- Name: [Legal Name]
- Address: [Address]
- Representative: [Name]

### Party B
- Name: [Legal Name]
- Address: [Address]
- Representative: [Name]

## Agreement Terms
1. **Purpose**: [Clear statement of agreement purpose]
2. **Duration**: [Start date to end date]
3. **Compensation**: [Detailed payment terms]
4. **Deliverables**: [Specific deliverables with timelines]
5. **Termination**: [Clear termination conditions]

## Legal Compliance
- [Applicable law 1]
- [Applicable law 2]
- [Regulatory requirement 1]

## Signatures
Party A: _______________________ Date: _______
Party B: _______________________ Date: _______

---
*Legal Review*: [Name] - [Date]
*Compliance Check*: [Name] - [Date]
```

#### Contract Language Standards
- Use clear, unambiguous language
- Avoid legalese where plain language suffices
- Define all terms used in the contract
- Use consistent terminology throughout
- Include dispute resolution procedures

### Technical Documentation

#### Technical Document Structure
```markdown
# [Technical Document Title]

**Document ID**: [ID]
**Classification**: Internal
**System**: [System Name]
**Component**: [Component Name]

## Overview
[Brief technical overview]

## System Architecture
[Architecture description and diagrams]

## Technical Specifications
[Detailed technical specifications]

## Implementation Details
[Implementation information]

## API Documentation
[API endpoints, parameters, responses]

## Troubleshooting
[Common issues and solutions]

## Maintenance
[Maintenance procedures and schedules]
```

#### Code Documentation Standards
```python
def function_name(param1, param2):
    """
    Brief description of function purpose.
    
    Args:
        param1 (type): Description of parameter 1
        param2 (type): Description of parameter 2
    
    Returns:
        type: Description of return value
    
    Raises:
        ExceptionType: Description of when exception is raised
    
    Example:
        >>> function_name(value1, value2)
        result
    """
    # Implementation details
    pass
```

### Report Documentation

#### Report Structure
```markdown
# [Report Type] Report

**Report ID**: [ID]
**Reporting Period**: [Date Range]
**Prepared By**: [Name/Department]
**Date**: [Date]

## Executive Summary
[Key findings and recommendations]

## Methodology
[Data collection and analysis methods]

## Findings
[Detailed findings with supporting data]

## Analysis
[Interpretation of findings]

## Recommendations
[Actionable recommendations with priorities]

## Appendices
[Detailed data, methodology details]
```

#### Report Data Presentation
- Use charts and graphs for visual data
- Include data tables for detailed information
- Provide context for all data presented
- Use consistent units and formats
- Include data sources and collection methods

## Quality Standards

### Quality Control Checklist

#### Pre-Publication Checklist
```markdown
## Document Quality Checklist

### Content Quality
- [ ] Content is accurate and factual
- [ ] Information is current and up-to-date
- [ ] Arguments are logical and well-supported
- [ ] Conclusions are justified by evidence
- [ ] Recommendations are actionable

### Writing Quality
- [ ] Language is clear and concise
- [ ] Grammar and spelling are correct
- [ ] Tone is appropriate for audience
- [ ] Structure is logical and organized
- [ ] Transitions are smooth and effective

### Formatting Quality
- [ ] Formatting follows standards
- [ ] Headings are consistent
- [ ] Lists are properly formatted
- [ ] Tables are clear and readable
- [ ] Images/charts are high quality

### Technical Quality
- [ ] Links are functional
- [ ] Code examples are accurate
- [ ] Technical terms are defined
- [ ] Measurements use consistent units
- [ ] Citations are complete and accurate

### Compliance Quality
- [ ] Classification is appropriate
- [ ] Legal requirements are met
- [ ] Security standards are followed
- [ ] Access permissions are correct
- [ ] Retention requirements are met
```

### Review Process

#### Standard Review Process
1. **Self-Review**: Author reviews against quality checklist
2. **Peer Review**: Colleague reviews for accuracy and clarity
3. **Specialty Review**: Subject matter expert reviews technical content
4. **Final Review**: Key Operations approves for publication

#### Review Timeline
- **Self-Review**: Complete before submission
- **Peer Review**: 2-3 business days
- **Specialty Review**: 3-5 business days
- **Final Review**: 2-3 business days

#### Review Feedback Process
```markdown
## Review Feedback Template

### Document Information
- Document ID: [ID]
- Reviewer: [Name]
- Review Date: [Date]
- Review Type: [Peer/Specialty/Final]

### Overall Assessment
- Quality Rating: [1-5]
- Recommendation: [Approve/Revise/Reject]
- Priority: [High/Medium/Low]

### Specific Feedback
#### Content
- [Issue]: [Description]
- [Issue]: [Description]

#### Writing
- [Issue]: [Description]
- [Issue]: [Description]

#### Formatting
- [Issue]: [Description]
- [Issue]: [Description]

### Required Changes
- [ ] [Change 1]
- [ ] [Change 2]

### Optional Suggestions
- [Suggestion 1]
- [Suggestion 2]

---
*Reviewer Signature*: [Name]
*Revision Required*: [Yes/No]
*Resubmit By*: [Date]
```

## Version Control

### Version Numbering
- **Major Version (X.0.0)**: Significant changes, rewrites, structural changes
- **Minor Version (0.X.0)**: Additions, moderate modifications, new sections
- **Patch Version (0.0.X)**: Bug fixes, typos, minor corrections

### Change Documentation
```markdown
## Version History

### Version 2.0.0 - 2024-09-22
#### Major Changes
- Complete restructuring of document
- Added new sections on automation
- Updated security protocols

#### Modified by
- [Name], Scribe of Infrastructure

### Version 1.1.0 - 2024-06-15
#### Minor Changes
- Added integration documentation
- Updated contact information
- Expanded troubleshooting section

#### Modified by
- [Name], Scribe of Contracts

### Version 1.0.1 - 2024-03-10
#### Patch Changes
- Fixed typos in section 3.2
- Updated broken links
- Corrected formatting errors

#### Modified by
- [Name], Scribe of Light
```

### Version Control Procedures
```python
# version-control-procedures.py
class DocumentVersionController:
    def __init__(self, document_db, approval_system):
        self.db = document_db
        self.approval = approval_system
    
    def create_new_version(self, document_id, changes, author):
        """Create new version of document"""
        # Get current version
        current = self.db.get_current_version(document_id)
        
        # Determine new version number
        new_version = self.calculate_version_number(current, changes)
        
        # Create version record
        version = {
            'document_id': document_id,
            'version': new_version,
            'changes': changes,
            'author': author,
            'timestamp': datetime.now(),
            'previous_version': current['version']
        }
        
        # Store version
        self.db.store_version(version)
        
        # Archive previous version
        self.archive_version(current)
        
        return new_version
    
    def calculate_version_number(self, current, changes):
        """Calculate appropriate version number based on changes"""
        if changes['type'] == 'major':
            return f"{current['major'] + 1}.0.0"
        elif changes['type'] == 'minor':
            return f"{current['major']}.{current['minor'] + 1}.0"
        else:
            return f"{current['major']}.{current['minor']}.{current['patch'] + 1}"
```

## Accessibility Standards

### Document Accessibility

#### Visual Accessibility
- Use sufficient color contrast (4.5:1 for normal text, 3:1 for large text)
- Avoid color as the only means of conveying information
- Use readable font sizes (minimum 12pt)
- Provide adequate white space
- Use clear, simple fonts

#### Structural Accessibility
- Use proper heading hierarchy
- Include alt text for images
- Provide captions for videos
- Use descriptive link text
- Ensure proper table markup

#### Content Accessibility
- Write in plain language when possible
- Define technical terms
- Provide context for abbreviations
- Include summaries for complex content
- Offer multiple formats when appropriate

### Accessibility Checklist
```markdown
## Accessibility Checklist

### Visual Accessibility
- [ ] Color contrast meets WCAG AA standards
- [ ] Information not conveyed by color alone
- [ ] Font size is readable (12pt minimum)
- [ ] Adequate white space
- [ ] Clear, readable fonts

### Structural Accessibility
- [ ] Proper heading hierarchy used
- [ ] Alt text provided for all images
- [ ] Captions provided for videos
- [ ] Descriptive link text used
- [ ] Proper table structure

### Content Accessibility
- [ ] Plain language used where possible
- [ ] Technical terms defined
- [ ] Abbreviations explained
- [ ] Complex content summarized
- [ ] Multiple formats available

### Technical Accessibility
- [ ] Document is screen reader compatible
- [ ] Keyboard navigation supported
- [ ] PDF tags are correct
- [ ] Metadata is complete
- [ ] Language is specified
```

## Digital Standards

### File Formats

#### Preferred Formats
- **Text Documents**: Markdown (.md), PDF (.pdf)
- **Spreadsheets**: CSV (.csv), Excel (.xlsx)
- **Presentations**: PDF (.pdf), PowerPoint (.pptx)
- **Images**: PNG (.png), JPEG (.jpg), SVG (.svg)
- **Code**: Plain text (.txt), GitHub Flavored Markdown (.md)

#### Format Selection Guidelines
- Use Markdown for editable documentation
- Use PDF for final, immutable documents
- Use CSV for data interchange
- Use SVG for scalable graphics
- Avoid proprietary formats when possible

### File Naming Conventions

#### Standard Naming Convention
```
[document-type]-[subject]-[date]-[version].[extension]

Examples:
- report-monthly-scribe-2024-09-22-v1.0.0.md
- contract-services-consort-2024-09-15-v2.1.0.pdf
- manual-onboarding-scribe-2024-09-01-v1.0.0.md
```

#### Directory Structure
```
scribe-depot/
├── documents/
│   ├── contracts/
│   ├── reports/
│   ├── manuals/
│   └── templates/
├── archives/
│   ├── by-year/
│   └── by-type/
└── drafts/
    ├── in-review/
    └── pending-approval/
```

### Metadata Standards

#### Required Metadata
```yaml
document_metadata:
  basic:
    title: "Document Title"
    author: "Author Name"
    created: "2024-09-22"
    modified: "2024-09-22"
    version: "1.0.0"
  
  classification:
    level: "internal"
    embargo: false
    embargo_until: null
  
  content:
    language: "en"
    subject: "Document subject"
    keywords: ["keyword1", "keyword2"]
  
  technical:
    format: "markdown"
    software: "text editor"
    encoding: "UTF-8"
  
  rights:
    copyright: "Organization Name"
    license: "internal use only"
    restrictions: "confidential"
```

## Storage and Retention

### Storage Standards

#### Primary Storage
- **Location**: Centralized document management system
- **Access**: Role-based permissions
- **Backup**: Daily incremental, weekly full
- **Version Control**: Git-based versioning
- **Search**: Full-text search capability

#### Archive Storage
- **Location**: Secure archive system
- **Access**: Request-based access
- **Format**: PDF/A for long-term preservation
- **Compression**: Lossless compression
- **Metadata**: Complete metadata preservation

### Retention Schedule

#### Retention Periods
```yaml
retention_schedule:
  contracts:
    active: "7 years from expiration"
    expired: "10 years from expiration"
    templates: "permanent"
  
  reports:
    daily: "1 year"
    weekly: "3 years"
    monthly: "7 years"
    quarterly: "10 years"
    annual: "permanent"
  
  manuals:
    current: "as needed"
    obsolete: "5 years"
  
  meeting_minutes:
    operational: "3 years"
    strategic: "7 years"
    board: "permanent"
  
  correspondence:
    internal: "3 years"
    external: "7 years"
    legal: "permanent"
```

#### Disposal Procedures
- **Review**: Legal review before disposal
- **Notification**: Notify stakeholders before disposal
- **Secure Deletion**: Secure deletion methods
- **Verification**: Verify complete deletion
- **Documentation**: Document disposal process

## Templates and Standards

### Document Templates

#### Template Repository
- Location: Centralized template library
- Access: All scribes have read access
- Updates: Quarterly review and updates
- Versions: Version-controlled templates
- Usage: Required for standard documents

#### Template Standards
- Consistent formatting
- Placeholder text clearly marked
- Required fields identified
- Optional fields noted
- Example content provided

## Training and Compliance

### Training Requirements

#### New Scribe Training
- Documentation standards overview
- Style guide training
- Template usage training
- Quality control procedures
- Hands-on practice

#### Ongoing Training
- Quarterly refresher courses
- Annual comprehensive review
- Specialty-specific training
- New standard updates
- Best practice sharing

### Compliance Monitoring

#### Compliance Checks
- Monthly random quality audits
- Quarterly comprehensive reviews
- Annual compliance assessments
- User feedback collection
- System analytics review

#### Non-Compliance Procedures
1. Identify non-compliance issue
2. Document the issue
3. Notify responsible party
4. Provide correction guidance
5. Monitor correction
6. Follow-up verification

## Continuous Improvement

### Standards Review

#### Review Schedule
- **Minor Updates**: Monthly
- **Major Revisions**: Quarterly
- **Comprehensive Overhaul**: Annually

#### Review Process
1. Collect feedback from users
2. Analyze usage patterns
3. Identify improvement areas
4. Draft proposed changes
5. Review with stakeholders
6. Implement approved changes
7. Communicate updates
8. Train on changes

### Feedback Mechanisms

#### Feedback Collection
- User surveys
- Focus groups
- Usage analytics
- Help desk tickets
- Direct feedback

#### Feedback Processing
```python
# feedback-processor.py
class StandardsFeedbackProcessor:
    def __init__(self, feedback_db, standards_manager):
        self.feedback_db = feedback_db
        self.standards = standards_manager
    
    def process_feedback(self, feedback):
        """Process feedback on documentation standards"""
        # Categorize feedback
        category = self.categorize_feedback(feedback)
        
        # Assess priority
        priority = self.assess_priority(feedback)
        
        # Route for action
        if priority == 'high':
            self.immediate_action(feedback)
        elif priority == 'medium':
            self.scheduled_review(feedback)
        else:
            self.archive_for_consideration(feedback)
```

---

*Documentation Standards and Style Guide Last Updated: 2024-09-22*
*Next Review: 2024-12-22*