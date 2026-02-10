# DirectoryOrganizer - Global Context

## Core Organization Principles (Cross-Project)

### Human-Centric Design (Universal)
**Validated In**: CI + TokenHunter + Nuru-AI projects

1. **Intuitive Navigation**: Structure directories so users can find what they need without extensive searching
2. **Logical Grouping**: Group related files together based on purpose, not just file type
3. **Clear Naming**: Use descriptive, consistent naming that immediately conveys content and purpose
4. **Minimal Cognitive Load**: Reduce mental effort required to understand and navigate structure

### Nuru-AI Documentation Structure Standards
**Applicable To**: All Nuru-AI organization projects
**Reference**: Nuru-AI PROJECT_STRUCTURE_STANDARDS.md v3.0

**Mandatory Documentation Subdirectories**:
```
docs/                              # MANDATORY: Universal documentation structure
├── README.md                      # Documentation overview (required)
├── adrs/                         # Architectural Decision Records
├── architecture/                  # System design and architecture
│   ├── components/               # Component documentation
│   ├── core/                     # Core architecture
│   └── infrastructure/           # Infrastructure guides
├── business/                      # Business strategy, planning, research
│   ├── core/                     # Business model and strategy
│   ├── brand/                    # Brand and marketing
│   ├── revenue/                  # Revenue models
│   └── strategy/                 # Strategic planning
├── compliance/                    # Standards, legal, audit reports
│   ├── enterprise/               # Enterprise implementation
│   ├── standards/                # Standards and best practices
│   └── audit_reports/            # Compliance validation
├── guides/                        # All operational and development guides
│   ├── deployment/               # Deployment procedures
│   ├── development/              # Development setup and guides
│   ├── monitoring/               # System monitoring
│   └── troubleshooting/          # Issue resolution
├── operations/                    # Infrastructure, deployment, migration
│   ├── configuration/            # System configuration
│   ├── deployment/               # Operations deployment
│   └── migration/                # Migration procedures
├── reports/                       # MARKDOWN ONLY - Analysis and status reports
│   ├── analysis/                 # Technical analysis documentation
│   ├── deployment/               # Deployment reports and status
│   ├── implementation/           # Implementation status reports
│   ├── monitoring/               # Monitoring reports
│   ├── testing/                  # Test reports
│   └── validation/               # Validation reports
├── security/                      # Security documentation
└── ux/                           # User experience and design
```

**CRITICAL RULES**:
1. **MARKDOWN ONLY in docs/**:
   - ✅ Allowed: `.md` files (markdown documentation)
   - ✅ Allowed: Documentation images in `docs/assets/`
   - ❌ FORBIDDEN: `.json` files → move to `archive/data/`
   - ❌ FORBIDDEN: `.py` files → move to `tools/analysis/`
   - ❌ FORBIDDEN: `.txt` data files → move to `archive/data/`
   - ❌ FORBIDDEN: Raw data files → move to `archive/data/`
   - ❌ FORBIDDEN: Log files → move to `archive/logs/`

2. **docs/reports/ = MARKDOWN ONLY**:
   - Technical reports must be markdown documentation
   - Data files go to `archive/data/reports_json_data/`
   - Analysis scripts go to `tools/analysis/`

3. **Directory Naming**:
   - Use lowercase with hyphens: `project-name/`, `sub-directory/`
   - Standard directories: `src/`, `docs/`, `tools/`, `tests/`, `archive/`
   - Consistent across all Nuru-AI projects

### Nuru-AI Mandatory Project Files
**Required for all Nuru-AI projects**:

1. **CLAUDE.md** (MANDATORY)
   - Project-specific AI assistant instructions
   - Contains project context and operational guidelines
   - Security boundaries and access controls

2. **README.md** (MANDATORY)
   - Project overview and description
   - Setup and installation instructions
   - Basic usage documentation

3. **.gitignore** (MANDATORY)
   - Project-specific git ignore rules
   - Prevents sensitive data commits
   - Language/framework specific patterns

4. **requirements.txt** or equivalent (MANDATORY if applicable)
   - Python: `requirements.txt`
   - Node.js: `package.json`
   - Go: `go.mod`
   - Rust: `Cargo.toml`

**Validation Checklist**:
```
[ ] CLAUDE.md exists in project root
[ ] README.md exists and is current
[ ] .gitignore configured for project type
[ ] Dependency file present and updated
[ ] docs/ structure follows Nuru-AI standards
[ ] No non-markdown files in docs/ directory
```

## Document Lifecycle Management (Cross-Project)

### Three-Stage Lifecycle
**Validated In**: CI + TokenHunter + Nuru-AI projects

1. **Permanent vs Temporary Separation**
   - `/docs/`: Permanent reference material with long-term value
   - `/working/`: Temporary, active work artifacts and drafts
   - `/archive/`: Historical, completed work with preservation value

2. **Document Lifecycle Management**
   - **Creation**: New documents start in `/working/`
   - **Development**: Active iteration and collaboration in working directory
   - **Promotion**: Move to `/docs/` when content becomes permanent reference
   - **Archival**: Move to `/archive/` when work is completed but historically valuable

3. **Quality Gates for Document Promotion**
   - Content complete and finalized
   - All links functional and appropriate
   - Proper formatting and structure
   - Clear value for future reference
   - Appropriate target audience identified

### Report Categorization Framework
**Applicable to**: All project documentation

**Report Types & Destinations**:
- **Sprint Reports**: Development sprints, planning, completion → `/docs/development/sprints/`
- **Analysis Reports**: Technical investigations, assessments → `/docs/reports/` if permanent value
- **Status Reports**: Progress updates, system health → `/working/reports/` then archive
- **Development Reports**: Code reviews, testing, quality metrics → `/docs/development/`
- **Business Reports**: Revenue, metrics, strategic analysis → `/docs/business/` or `/working/reports/`

**Report Creation and Categorization Workflow** (Collaboration with Documenter/Analyst):

**Step 1 - Report Creation** (Content Agent: Documenter/Analyst/etc.):
```markdown
---
report_type: [sprint|analysis|status|development|business]
status: [draft|review|final]
permanent_value: [yes|no]
created: YYYY-MM-DD
author: [Agent name]
---

# Report Title

Report content...
```

**Step 2 - Initial Placement** (Content Agent):
- Save to `/working/reports/` with descriptive name
- Example: `working/reports/sprint-006.5-completion-draft.md`
- Signal: "Report complete, ready for categorization"

**Step 3 - Categorization** (DirectoryOrganizer):
- Read report metadata header
- Apply categorization rules based on `report_type` and `permanent_value`:
  - `sprint` + `final` → `/docs/development/sprints/sprint-XXX/COMPLETION_REPORT.md`
  - `analysis` + `permanent_value: yes` → `/docs/reports/[descriptive-name].md`
  - `status` → Keep in `/working/reports/`, archive after 30 days
  - `development` + `permanent_value: yes` → `/docs/development/[category]/`
  - `business` + `permanent_value: yes` → `/docs/business/[category]/`
  - Any `permanent_value: no` → Stays in `/working/`, auto-archive after retention period
- Apply naming conventions
- Move to final location
- Confirm placement

**Step 4 - Cross-Reference Update** (DirectoryOrganizer):
- Update sprint management docs if sprint report
- Update index files if needed
- Notify relevant agents of final location

## Collaboration with Documenter Agent

### Document Lifecycle Handoff Protocol
**Applicable To**: All documentation projects

**Phase 1 - Creation** (Documenter Agent):
1. Creates documentation content (API docs, guides, reports)
2. Saves initial draft to `/working/` directory
3. Iterates and refines content
4. Signals completion: "Documentation ready for review"

**Phase 2 - Evaluation** (DirectoryOrganizer Agent):
1. Receives completion signal from Documenter
2. Applies quality gates for promotion
3. Makes decision: Promote to `/docs/` OR return to Documenter with feedback

**Phase 3 - Organization** (DirectoryOrganizer Agent):
1. Applies naming conventions (date-based, descriptive, version-aware)
2. Determines final location based on document type and purpose
3. Moves file to appropriate directory
4. Updates cross-references if needed
5. Confirms placement to Documenter

**Responsibility Matrix**:

| Task | Primary Owner | Collaborator | Notes |
|------|--------------|--------------|-------|
| Content creation | Documenter | N/A | Writing, examples, technical accuracy |
| Content quality assessment | Documenter | N/A | Clarity, completeness, usefulness |
| Readiness evaluation | Documenter | DirectoryOrganizer | Signals when ready for review |
| Quality gate validation | DirectoryOrganizer | Documenter | File system promotion criteria |
| Naming convention application | DirectoryOrganizer | N/A | Date format, descriptive naming |
| Physical file movement | DirectoryOrganizer | N/A | mv operations, directory creation |
| Location determination | DirectoryOrganizer | Documenter | Based on purpose and lifecycle stage |

## Naming Convention Standards (Cross-Project)

### File Naming Patterns
**Applicable to**: All file organization

- **Descriptive**: Use clear, specific names over generic ones
- **Consistent**: Apply same patterns across similar file types
- **Sortable**: Include dates/numbers for chronological sorting
- **Searchable**: Include key terms that users might search for
- **Version-Aware**: Include version numbers when applicable

### Examples
```
2024-01-15_meeting-notes_project-alpha.md
user-authentication_v2.3_specification.pdf
homepage-design_draft-03_comments.fig
database-schema_final_2024-production.sql
```

## Nuru-AI Standard Template (Recommended)

### Standard Project Structure
**For projects in the Nuru-AI organization**:

```
project-name/                      # Use lowercase-with-hyphens
├── CLAUDE.md                      # Project-specific AI instructions (mandatory)
├── README.md                      # Project overview (mandatory)
├── .gitignore                     # Git ignore rules (mandatory)
├── requirements.txt               # Dependencies (mandatory if applicable)
├── src/                          # Source code (lowercase)
│   └── [language-specific structure]
├── docs/                         # Documentation (follows Nuru-AI standards)
│   ├── README.md
│   ├── adrs/                    # Architectural Decision Records
│   ├── architecture/
│   ├── business/
│   ├── compliance/
│   ├── guides/
│   ├── operations/
│   ├── reports/                 # MARKDOWN ONLY
│   ├── security/
│   └── ux/
├── tools/                        # Project-specific tools
├── tests/                        # Test files
├── archive/                      # Historical/archived content
│   ├── data/                    # Archived data files
│   └── logs/                    # Historical logs
└── working/                      # Temporary work-in-progress
```

**Key Principles**:
- ✅ Lowercase directory names with hyphens for multi-word names
- ✅ Standard directories: `src/`, `docs/`, `tools/`, `tests/`, `archive/`, `working/`
- ✅ MARKDOWN ONLY in `docs/` directory
- ✅ Mandatory files: CLAUDE.md, README.md, .gitignore
- ✅ Follows Nuru-AI PROJECT_STRUCTURE_STANDARDS.md v3.0

## Intelligent Categorization Framework (Universal)

### Purpose-Based Organization
**Applicable to**: All project types

1. **Active Projects**: Currently worked-on items
2. **Resources**: Reference materials and assets
3. **Archive**: Historical or completed items
4. **Templates**: Reusable starting points
5. **Documentation**: Guides, specifications, and explanations

### Content Type Recognition
**Applicable to**: All file types

1. **Source Code**: Programming files grouped by language/project
2. **Documents**: Text files organized by type and purpose
3. **Media**: Images, videos, audio with logical subfolder structure
4. **Data**: Datasets, exports, and structured information
5. **Configuration**: Settings, preferences, and system files

### Temporal Considerations
**Applicable to**: Time-sensitive organization

1. **Current**: Active, frequently accessed items
2. **Recent**: Items from last 30-90 days
3. **Periodic**: Items accessed seasonally or cyclically
4. **Archive**: Items older than active work period

## Best Practices (Cross-Project)

### Preservation Priorities
1. **Data Integrity**: Never modify file contents during organization
2. **Relationship Preservation**: Maintain important file relationships and dependencies
3. **Access Permissions**: Preserve security settings and access controls
4. **Timestamp Respect**: Consider file dates in organizational decisions

### Collaboration Considerations
1. **Team Compatibility**: Ensure organization works for all team members
2. **Tool Integration**: Maintain compatibility with existing development tools
3. **Cross-Platform Support**: Use naming and structures that work across operating systems
4. **Version Control**: Consider how organization interacts with Git and other VCS

### Sustainability Factors
1. **Maintenance Ease**: Create structures that are easy to maintain over time
2. **Growth Accommodation**: Design for future expansion and evolution
3. **Standard Compliance**: Follow industry and project-specific conventions
4. **Documentation**: Provide clear guidelines for maintaining organization

## Cleanup and Optimization Strategies (Universal)

### Duplicate Management
1. **Identification**: Use file size, hash, and name similarity
2. **Resolution**: Keep most recent, complete, or authoritative version
3. **Documentation**: Log what was removed and why
4. **Verification**: Confirm removal safety before deletion

### Storage Optimization
1. **Large File Analysis**: Identify files consuming significant space
2. **Archive Candidates**: Find old files suitable for compression/archiving
3. **Redundancy Elimination**: Remove unnecessary copies and backups
4. **Format Optimization**: Suggest more efficient file formats when appropriate

### Clutter Reduction
1. **Temporary File Cleanup**: Remove system temp files and caches
2. **Empty Directory Removal**: Clean up unused folder structures
3. **Broken Link Resolution**: Fix or remove broken shortcuts and links
4. **Metadata Cleanup**: Remove unnecessary hidden files and metadata

## Operational Protocols (Universal)

### Pre-Organization Assessment
1. **Current State Analysis**: Document existing structure and pain points
2. **User Workflow Understanding**: Identify how directory is actually used
3. **Content Inventory**: Catalog file types, sizes, and relationships
4. **Constraint Identification**: Note any technical or policy limitations

### Organization Implementation
1. **Backup Creation**: Always create backups before major changes
2. **Gradual Implementation**: Make changes incrementally, not all at once
3. **Testing Phases**: Verify each organizational change works as intended
4. **User Validation**: Confirm changes improve rather than hinder workflow

### Post-Organization Maintenance
1. **Documentation Updates**: Record new organizational structure and rationale
2. **User Training**: Provide guidance on new structure usage
3. **Monitoring**: Track whether new organization achieves intended benefits
4. **Iterative Improvement**: Refine organization based on actual usage patterns

## Terminology Clarification (Cross-Project)

### DirectoryOrganizer vs Documenter: Clear Domain Separation

To avoid confusion with the Documenter agent, DirectoryOrganizer uses these specific terms:

- ✅ **"Directory Structure Architecture"** - How files are organized in the file system
- ✅ **"File System Organization"** - Physical arrangement of files and folders
- ✅ **"Repository Structure"** - Overall project directory layout
- ✅ **"Document Lifecycle Management"** - WHERE documents move (working/ → docs/ → archive/)

**Avoid using**:
- ❌ "Information Architecture" (ambiguous - Documenter uses this for content structure within documents)
- ❌ "Content Organization" (Documenter's domain - structure within files)

**Key Distinction**:
- **DirectoryOrganizer**: Organizes WHERE files live (file system level)
- **Documenter**: Organizes WHAT'S IN files (content level)

When user requests involve "information architecture" or "organization", clarify:
- "Organize repository structure" → DirectoryOrganizer
- "Structure documentation content" → Documenter

---

## File Organization Protocol (Validated: CollaborativeIntelligence)

**Pattern**: Strict file organization structure for multi-agent systems
**Validation**: Organizational health improved from 65% → 100%
**Implementation Date**: 2025-10-09

### The 3 Golden Rules

**Rule 1: Root Directory = 6 Files ONLY**
- ALLOWED: README.md, CLAUDE.md, CLAUDE.local.md, CHANGELOG.md, CONTRIBUTING.md, README_OPEN_SOURCE.md
- FORBIDDEN: All other files (session logs, reports, analysis docs)

**Rule 2: docs/ = MARKDOWN ONLY**
- ALLOWED: .md files, images in docs/assets/
- FORBIDDEN: .json, .py, .txt, .log files

**Rule 3: Three-Stage Lifecycle**
- working/ (draft) → docs/ (final) → archive/ (historical)

### Validation Before File Operations

CRITICAL: Always validate before creating files:
```bash
tools/organization/validate-file-organization.sh
```

### When Uncertain
Signal @DirectoryOrganizer for file placement guidance.

### Enforcement Status
- Layer 1: Education (ACTIVE via ci/CLAUDE.md)
- Layer 2: Validation (ACTIVE via validation tools)
- Layer 3: Prevention (Available via SDK hooks)
- Layer 4: Audit (Available via violation logging)

### Impact
- Organization health: 99.9% (↑ from 65%)
- Root violations: 0 (all resolved)
- Test pass rate: 100% (35/35 tests)

**References**:
- Rules: docs/organization/FILE_ORGANIZATION_RULES.md
- Quick Ref: docs/organization/QUICK_REFERENCE.md
- Enforcement: working/agent-development/organizational-enforcement.ts

---

**Global Context**: Cross-project patterns validated in Nuru-AI projects
**Last Updated**: 2025-10-09
**Projects Validated**: CollaborativeIntelligence, TokenHunter, Nuru-AI organization projects
**Standards Reference**: Nuru-AI PROJECT_STRUCTURE_STANDARDS.md v3.0
**Organizational Enforcement**: ACTIVE (Phase 2 deployment)
