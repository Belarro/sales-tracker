# Report Metadata Template

**Purpose**: Standardized metadata format for reports to enable automated categorization by DirectoryOrganizer

**Version**: 1.0
**Last Updated**: 2025-10-01
**Used By**: Documenter, Analyst, and other agents creating reports

---

## 🏛️ Nuru-AI Compliance

**This template is COMPLIANT with Nuru-AI PROJECT_STRUCTURE_STANDARDS.md v3.0**

### Key Compliance Features:

✅ **MARKDOWN ONLY** - All reports are `.md` files (no .json, .py, .txt in docs/)
✅ **Structured Metadata** - YAML frontmatter for automated categorization
✅ **docs/reports/ Compliance** - Reports organized in standard subdirectories:
   - `docs/reports/analysis/`
   - `docs/reports/deployment/`
   - `docs/reports/implementation/`
   - `docs/reports/monitoring/`
   - `docs/reports/testing/`
   - `docs/reports/validation/`

✅ **Data Separation** - Non-markdown data files go to `archive/data/`
✅ **Lowercase Directories** - All directory names use lowercase with hyphens

**For Nuru-AI projects**: This template ensures reports are properly categorized according to enterprise standards.

**Reference**: `/Users/eladm/Projects/token/tokenhunter/docs/compliance/standards/PROJECT_STRUCTURE_STANDARDS.md`

---

## Standard Metadata Header

Place this at the **top** of every report file:

```markdown
---
report_type: [sprint|analysis|status|development|business]
status: [draft|review|final]
permanent_value: [yes|no]
created: YYYY-MM-DD
author: [Agent name]
related_sprint: [sprint-XXX] (optional, for sprint-related reports)
tags: [tag1, tag2, tag3] (optional)
---

# Report Title

Report content begins here...
```

---

## Field Definitions

### report_type (Required)

Determines the primary categorization and destination directory.

| Value | Description | Default Destination |
|-------|-------------|---------------------|
| `sprint` | Sprint planning, progress, or completion reports | `/docs/development/sprints/sprint-XXX/` |
| `analysis` | Technical investigations, assessments, deep dives | `/docs/reports/` (if permanent) or `/working/reports/` |
| `status` | Progress updates, system health, current state | `/working/reports/` → auto-archive after 30 days |
| `development` | Code reviews, testing reports, quality metrics | `/docs/development/[category]/` |
| `business` | Revenue, metrics, strategic analysis | `/docs/business/` or `/working/reports/` |

### status (Required)

Indicates the completion state of the report.

| Value | Description | Impact |
|-------|-------------|--------|
| `draft` | Work in progress, not ready for review | Stays in `/working/` |
| `review` | Complete but awaiting feedback | May stay in `/working/` or move to review location |
| `final` | Completed and approved | Ready for permanent placement |

### permanent_value (Required)

Determines long-term retention strategy.

| Value | Description | Impact |
|-------|-------------|--------|
| `yes` | Has long-term reference value | Moves to `/docs/` hierarchy |
| `no` | Temporary, time-sensitive only | Stays in `/working/`, auto-archives after retention period |

### created (Required)

Creation date in ISO format (YYYY-MM-DD).

**Example**: `2025-10-01`

### author (Required)

Name of the agent or person who created the report.

**Examples**:
- `Documenter`
- `Analyst`
- `Developer`
- `Human: Elad M`

### related_sprint (Optional)

For reports related to specific sprints, include sprint identifier.

**Format**: `sprint-XXX` where XXX is the sprint number

**Examples**:
- `sprint-005`
- `sprint-006.5`
- `sprint-007`

### tags (Optional)

Comma-separated list of descriptive tags for better discovery.

**Examples**:
- `[memory-system, crisis-resolution, agent-learning]`
- `[api-integration, authentication, security]`
- `[architecture, deployment, infrastructure]`

---

## Categorization Rules (DirectoryOrganizer)

DirectoryOrganizer applies these rules based on metadata:

### Sprint Reports
```yaml
report_type: sprint
status: final
```
**→ Destination**: `/docs/development/sprints/sprint-XXX/[REPORT_NAME].md`

**Naming Convention**:
- Completion reports: `COMPLETION_REPORT.md`
- Planning reports: `PLANNING.md`
- Progress reports: `PROGRESS_UPDATE_YYYY-MM-DD.md`

### Analysis Reports (Permanent)
```yaml
report_type: analysis
permanent_value: yes
```
**→ Destination**: `/docs/reports/[descriptive-name].md`

**Naming Convention**: `YYYY-MM-DD_[topic]_analysis.md`

**Example**: `2025-10-01_memory-architecture_analysis.md`

### Status Reports (Temporary)
```yaml
report_type: status
permanent_value: no
```
**→ Destination**: `/working/reports/[name].md` → Auto-archive after 30 days

**Naming Convention**: `status-[system]_YYYY-MM-DD.md`

### Development Reports (Permanent)
```yaml
report_type: development
permanent_value: yes
```
**→ Destination**: `/docs/development/[category]/[name].md`

**Category Examples**: testing, code-review, quality-metrics, performance

### Business Reports
```yaml
report_type: business
permanent_value: yes
```
**→ Destination**: `/docs/business/[category]/[name].md`

```yaml
report_type: business
permanent_value: no
```
**→ Destination**: `/working/reports/[name].md` → Archive after retention period

---

## Complete Examples

### Example 1: Sprint Completion Report

```markdown
---
report_type: sprint
status: final
permanent_value: yes
created: 2025-10-01
author: Analyst
related_sprint: sprint-006.5
tags: [sippar-integration, strategic-deployment, completion]
---

# Sprint 006.5 Completion Report

## Executive Summary
Sprint 006.5 focused on Sippar X402 integration and strategic deployment planning...

[Report content...]
```

**DirectoryOrganizer Action**:
- Reads metadata
- Identifies: Sprint report, final, permanent
- Destination: `/docs/development/sprints/sprint-006.5/COMPLETION_REPORT.md`
- Signals: "Placed in /docs/development/sprints/sprint-006.5/COMPLETION_REPORT.md"

---

### Example 2: Technical Analysis Report (Permanent)

```markdown
---
report_type: analysis
status: final
permanent_value: yes
created: 2025-10-01
author: Architect
tags: [memory-architecture, agent-structure, analysis]
---

# DirectoryOrganizer Memory Architecture Analysis

## Executive Summary
Analysis of DirectoryOrganizer agent's memory structure reveals redundancy...

[Report content...]
```

**DirectoryOrganizer Action**:
- Reads metadata
- Identifies: Analysis report, final, permanent value
- Applies naming: `2025-10-01_directoryorganizer-memory-architecture_analysis.md`
- Destination: `/docs/reports/2025-10-01_directoryorganizer-memory-architecture_analysis.md`
- Signals: "Placed in /docs/reports/..."

---

### Example 3: Weekly Status Report (Temporary)

```markdown
---
report_type: status
status: final
permanent_value: no
created: 2025-10-01
author: Analyst
tags: [weekly-status, agent-health, metrics]
---

# Weekly Agent Health Status - Week 40, 2025

## Current Status
As of October 1, 2025, the system health metrics show...

[Report content...]
```

**DirectoryOrganizer Action**:
- Reads metadata
- Identifies: Status report, final, NO permanent value
- Destination: `/working/reports/status-agent-health_2025-10-01.md`
- Sets auto-archive: After 30 days → `/archive/reports/2025/Q4/`
- Signals: "Placed in /working/reports/... (will archive 2025-10-31)"

---

### Example 4: Development Report - Code Review

```markdown
---
report_type: development
status: final
permanent_value: yes
created: 2025-10-01
author: Developer
related_sprint: sprint-006.5
tags: [code-review, quality, authentication]
---

# Authentication Module Code Review

## Review Summary
Code review of the authentication module implementation reveals...

[Report content...]
```

**DirectoryOrganizer Action**:
- Reads metadata
- Identifies: Development report, final, permanent
- Category: code-review (inferred from tags)
- Destination: `/docs/development/code-reviews/2025-10-01_authentication-module_review.md`
- Signals: "Placed in /docs/development/code-reviews/..."

---

### Example 5: Business Analysis (Strategic Planning)

```markdown
---
report_type: business
status: final
permanent_value: yes
created: 2025-10-01
author: Analyst
tags: [monetization, pricing-strategy, sippar-integration]
---

# Agent Monetization Strategy Analysis

## Executive Summary
Analysis of potential monetization strategies for CI agents...

[Report content...]
```

**DirectoryOrganizer Action**:
- Reads metadata
- Identifies: Business report, final, permanent
- Category: monetization (inferred from title/tags)
- Destination: `/docs/business/monetization/2025-10-01_agent-monetization-strategy_analysis.md`
- Signals: "Placed in /docs/business/monetization/..."

---

## Workflow Summary

### For Content Creators (Documenter, Analyst, etc.)

1. **Create report** with standard metadata header
2. **Save to** `/working/reports/[descriptive-name].md`
3. **Signal completion**: "Report ready for categorization"
4. **Receive confirmation** from DirectoryOrganizer with final location

### For DirectoryOrganizer

1. **Receive signal**: "Report ready for categorization"
2. **Read metadata** from file header
3. **Apply categorization rules** based on report_type and permanent_value
4. **Apply naming conventions** for consistency
5. **Move file** to determined location
6. **Signal completion**: "Placed in [final location]"

---

## Metadata Validation

### Required Fields Check

DirectoryOrganizer validates that all required fields are present:

```
✅ report_type: [value]
✅ status: [value]
✅ permanent_value: [value]
✅ created: [YYYY-MM-DD]
✅ author: [name]
```

### Invalid Metadata Handling

If metadata is missing or invalid:

1. DirectoryOrganizer returns: "Metadata incomplete or invalid"
2. Content creator fixes metadata
3. Signals again: "Report ready for categorization"

---

## Tips for Content Creators

### Choosing report_type

- **Sprint**: Anything directly related to sprint activities (planning, progress, completion)
- **Analysis**: Deep technical investigations, architectural assessments, system analysis
- **Status**: Current state updates, health reports, progress snapshots
- **Development**: Code quality, testing, reviews, metrics
- **Business**: Revenue, strategy, market analysis, business metrics

### Determining permanent_value

**Choose `yes` if**:
- Future developers will reference this
- Contains architectural decisions
- Documents important patterns
- Has long-term strategic value
- Part of project knowledge base

**Choose `no` if**:
- Time-sensitive only (weekly status)
- Superseded by newer information
- Temporary tracking purposes
- No reference value after completion

### Adding Useful Tags

Good tags improve discoverability:
- Use specific, descriptive terms
- Include technology names (authentication, api, database)
- Include domain areas (frontend, backend, infrastructure)
- Include themes (performance, security, scalability)

**Example**: `[authentication, api, security, oauth, implementation]`

---

## Version History

- **v1.0** (2025-10-01): Initial template with 5 report types and standard fields

---

## Support & Feedback

### Questions?
- DirectoryOrganizer: File system categorization, naming conventions
- Documenter: Content structure, writing best practices

### Suggest Improvements
- Add new fields to CONTINUOUS_LEARNING.md
- Propose new report_type values
- Share categorization edge cases

---

**Template Maintained By**: DirectoryOrganizer + Documenter
**Last Updated**: 2025-10-01
**Next Review**: After 3 months of usage (2025-12-31)
