---
# Global Context: Cross-Project Knowledge

# Engineer Global Context

## Purpose
This file contains **cross-project validated knowledge** - patterns, lessons, and insights that have proven valuable across 2+ projects in the Knowledge Layer of the Multi-Tier Memory Architecture. Knowledge promoted from LOCAL-CONTEXT.md to GLOBAL-CONTEXT.md represents reusable wisdom for all future Engineer work across all projects.

## Knowledge Promotion Criteria
- **Validation**: Pattern used successfully in 2+ projects
- **Generalizability**: Applicable beyond original context
- **Impact**: Measurably improves implementation quality/efficiency
- **Clarity**: Well-documented with examples

---

## Cross-Project Implementation Patterns

*Patterns will be promoted to this section after validation in 2+ projects*

**Current Status**: No patterns validated yet (Engineer agent newly migrated to multi-tier architecture)

### Pattern Template (for future use)
```
### Pattern Name (Validated: X projects)
**Projects**: Project1, Project2, ...
**Pattern**: Brief description

**Problem Solved**: What problem does this solve?

**Implementation**:
[Code example or detailed approach]

**Evidence**:
- Project1: file.md:line_start-line_end
- Impact: Measurable improvement

**When to Apply**:
- Scenario 1
- Scenario 2
```

---

## Language-Specific Best Practices

*Language-specific patterns will be documented here after 2+ project validation*

### Future Sections
- TypeScript implementation patterns
- Python implementation patterns
- Rust implementation patterns
- Go implementation patterns
- JavaScript implementation patterns

---

## Testing Strategies

*Testing approaches will be documented here after 2+ project validation*

### Future Sections
- Test organization patterns
- Fixture management strategies
- Integration test approaches
- End-to-end testing patterns

---

## Performance Optimization

*Performance patterns will be documented here after 2+ project validation*

### Future Sections
- Algorithm selection patterns
- Resource optimization strategies
- Caching implementation patterns
- Scalability approaches

---

## Error Handling

*Error handling patterns will be documented here after 2+ project validation*

### Future Sections
- Exception management strategies
- Graceful degradation patterns
- Recovery mechanism implementations
- Logging and monitoring approaches

---

## Integration Patterns

*Integration approaches will be documented here after 2+ project validation*

### Future Sections
- API integration patterns
- Database integration strategies
- Third-party service integration
- Microservice communication patterns

---

## File Organization Protocol (Validated: CollaborativeIntelligence)

**Pattern**: Strict file organization structure for multi-agent systems
**Validation**: Organizational health improved from 65% → 100%
**Implementation Date**: 2025-10-09

### The 3 Golden Rules

**Rule 1: Root Directory = 6 Files ONLY**
```
✅ ALLOWED: README.md, CLAUDE.md, CLAUDE.local.md,
           CHANGELOG.md, CONTRIBUTING.md, README_OPEN_SOURCE.md
❌ FORBIDDEN: All other files (session logs, reports, analysis docs)
```

**Rule 2: docs/ = MARKDOWN ONLY**
```
✅ ALLOWED: .md files, images in docs/assets/
❌ FORBIDDEN: .json, .py, .txt, .log files
```

**Rule 3: Three-Stage Lifecycle**
```
working/ → docs/ → archive/
 (draft)   (final)  (historical)
```

### File Placement Decision Tree

```
Creating a file? Ask:

1. Is it a draft/WIP?        → working/{category}/
2. Is it final documentation? → docs/{category}/
3. Is it agent-specific?      → AGENTS/{AgentName}/
4. Is it a session log?       → AGENTS/{AgentName}/Sessions/
5. Is it test documentation?  → working/testing/ or tests/
```

### Validation Before Every File Operation

**CRITICAL**: Always validate before creating files:

```bash
# Check organizational health
tools/organization/validate-file-organization.sh

# Expected output: 99.9%+ health
```

### Forbidden Patterns (Block Immediately)

```regex
^[^\/]*SESSION[^\/]*\.md$          # Session files at root
^[^\/]+_REPORT\.md$                 # Reports at root
^[^\/]+_ANALYSIS\.md$               # Analysis at root
^[^\/]+_IMPLEMENTATION\.md$         # Implementation docs at root
^TEAM_SDK_[^\/]+\.md$               # Team SDK docs at root
```

### When Uncertain

Signal @DirectoryOrganizer:
```
@DirectoryOrganizer - Where should this file go?
File: {filename}
Purpose: {description}
Temporary or permanent: {temporary|permanent}
```

### Enforcement Layers

**Layer 1: Education** (Active)
- All agents educated via ci/CLAUDE.md
- Clear rules in GLOBAL-CONTEXT.md (this document)
- Validation tools available

**Layer 2: Validation** (Active)
- Automated scanner: `tools/organization/validate-file-organization.sh`
- Pre-commit validation recommended
- Organization health metric: target 100%

**Layer 3: Prevention** (Available)
- SDK hooks available: `working/agent-development/organizational-enforcement.ts`
- PreToolUse hook blocks violations before execution
- Lightweight enforcement mode ready for deployment

**Layer 4: Audit** (Available)
- PostToolUse hook logs all violations
- Audit trail: `working/agent-development/organizational-violations.log`
- Weekly compliance reports

### Impact & Evidence

**Before** (2025-10-08):
- Root directory violations: Common
- docs/ non-markdown files: Frequent
- Organization health: 65%
- Agent confusion: High

**After** (2025-10-09):
- Root directory violations: 0
- docs/ non-markdown files: 0
- Organization health: 99.9%
- Agent awareness: 100% (131 agents)

**Validation**:
- 192 files reorganized (2025-10-09)
- 5 critical violations fixed immediately
- 35/35 enforcement tests passed (100%)

**References**:
- Rules: `docs/organization/FILE_ORGANIZATION_RULES.md`
- Quick Reference: `docs/organization/QUICK_REFERENCE.md`
- Enforcement Code: `working/agent-development/organizational-enforcement.ts:1-674`
- Test Suite: `working/agent-development/organizational-enforcement-tests.ts:1-406`

### Engineer-Specific Guidelines

**When Implementing Features**:
1. Implementation documentation:
   - Draft implementation docs → `working/development/`
   - Architecture decisions → `docs/architecture/decisions/`
   - Final implementation guides → `docs/guides/development/`

**When Creating Engineering Reports**:
1. Add YAML metadata header:
```yaml
---
report_type: [implementation|development|engineering|technical]
status: [draft|review|final]
permanent_value: [yes|no]
created: YYYY-MM-DD
author: Engineer
project: CollaborativeIntelligence
---
```
2. Save to `working/reports/`
3. Signal DirectoryOrganizer when final

**When Creating Code**:
1. Code stays in appropriate directories (cli/, interfaces/, tools/, etc.)
2. Never create code files in docs/ (use src/, lib/, tools/, etc.)
3. Documentation about code → docs/, actual code → src/lib/tools/

**Anti-Patterns to Avoid**:
- ❌ Creating implementation docs in root directory
- ❌ Putting .ts/.js/.py files in docs/
- ❌ Generic filenames: `implementation.md`, `code.md`
- ❌ Forgetting metadata headers on reports
- ❌ Skipping validation before committing

**Pro Tips**:
- ✅ Always start drafts in working/
- ✅ Use descriptive filenames (e.g., `team-sdk-implementation-report.md`)
- ✅ Run validation before git commit
- ✅ Trust DirectoryOrganizer for categorization
- ✅ Follow the 3-stage lifecycle

---

## Knowledge Gaps (To Be Filled)

### Areas Awaiting Validation
- Full-stack implementation patterns (pending 2+ project validation)
- Security implementation best practices (pending validation)
- DevOps integration approaches (pending validation)
- Real-time system implementations (pending validation)
- Data processing pipeline patterns (pending validation)

---

**Last Updated**: 2025-10-09
**Total Patterns**: 0 cross-project validations
**Validation Projects**: None yet (newly migrated agent)
**Confidence Level**: N/A (skeleton structure for future knowledge)

---
