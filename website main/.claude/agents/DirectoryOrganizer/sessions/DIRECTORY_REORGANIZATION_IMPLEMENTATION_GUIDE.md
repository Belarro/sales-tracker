# Directory Reorganization - Implementation Guide

**Purpose**: Step-by-step commands to execute the reorganization
**Prerequisites**: Read DIRECTORY_ORGANIZER_STRUCTURE_PROPOSAL.md first
**Time Required**: 4 weeks (or 20-30 hours total)
**Risk Level**: LOW (with git branch + validation)

---

## Quick Reference

**Branch**: `docs/claude-code-reorganization`
**Files Affected**: 87 documentation files
**Files Moved**: ~50 files
**New Files**: 8 index files
**Approach**: Git-safe migration with backward compatibility

---

## Phase 1: Setup (30 minutes)

### Step 1: Create Git Branch

```bash
cd /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence

# Create and switch to reorganization branch
git checkout -b docs/claude-code-reorganization

# Create safety tag
git tag pre-reorganization

# Verify
git branch
# Should show: * docs/claude-code-reorganization
```

### Step 2: Create Directory Structure

```bash
# Create all new folders at once
mkdir -p docs/integration/user-guides
mkdir -p docs/integration/validation
mkdir -p docs/integration/technical/architecture
mkdir -p docs/integration/technical/troubleshooting/subagentstop/agent-investigations
mkdir -p docs/integration/technical/troubleshooting/session-files
mkdir -p docs/integration/technical/troubleshooting/quick-fixes
mkdir -p docs/integration/technical/archive-safety/agent-guides
mkdir -p docs/integration/technical/analysis/multi-project
mkdir -p docs/integration/technical/api-reference
mkdir -p docs/integration/_INVENTORY_AND_ANALYSIS

# Verify structure created
tree docs/integration -d -L 4
```

---

## Phase 2: File Migration (2-3 hours)

### CRITICAL: Use `git mv` NOT `mv`

**Why**: Preserves git history across file moves

### Migration Batch 1: SubagentStop Files (11 files)

```bash
# Move from root to technical/troubleshooting/subagentstop/
git mv SUBAGENT_STOP_ROOT_CAUSE_ANALYSIS.md \
       docs/integration/technical/troubleshooting/subagentstop/

git mv SUBAGENT_STOP_DEBUG_SUMMARY.md \
       docs/integration/technical/troubleshooting/subagentstop/

git mv SUBAGENT_STOP_INVESTIGATION_SUMMARY.md \
       docs/integration/technical/troubleshooting/subagentstop/

git mv SUBAGENT_STOP_TIMELINE.md \
       docs/integration/technical/troubleshooting/subagentstop/

git mv SUBAGENT_STOP_ARCHITECTURE_MAP.md \
       docs/integration/technical/troubleshooting/subagentstop/

git mv SUBAGENT_STOP_WORKAROUND_IMPLEMENTATION.md \
       docs/integration/technical/troubleshooting/subagentstop/

git mv SUBAGENT_STOP_HOOK_INVESTIGATION.md \
       docs/integration/technical/troubleshooting/subagentstop/

git mv SUBAGENT_STOP_DEBUG_FINDINGS.md \
       docs/integration/technical/troubleshooting/subagentstop/

git mv SUBAGENT_STOP_ANALYSIS.md \
       docs/integration/technical/troubleshooting/subagentstop/

git mv SUBAGENT_STOP_TESTING_GUIDE.md \
       docs/integration/technical/troubleshooting/subagentstop/

# Verify
ls docs/integration/technical/troubleshooting/subagentstop/
# Should show 10 files (11th was already moved - SUBAGENT_STOP_INDEX.md exists)

# Commit this batch
git commit -m "docs: move SubagentStop investigation to technical/troubleshooting/subagentstop/"
```

### Migration Batch 2: SubagentStop Agent Investigations (4 files)

```bash
# Move agent-specific investigations with rename for clarity
git mv AGENTS/Debugger/SUBAGENT_STOP_DATA_INVESTIGATION.md \
       docs/integration/technical/troubleshooting/subagentstop/agent-investigations/Debugger_SUBAGENT_STOP_DATA_INVESTIGATION.md

git mv AGENTS/Researcher/SUBAGENT_STOP_TRIGGERING_CONDITIONS_RESEARCH.md \
       docs/integration/technical/troubleshooting/subagentstop/agent-investigations/Researcher_SUBAGENT_STOP_TRIGGERING_CONDITIONS_RESEARCH.md

git mv AGENTS/Developer/SUBAGENT_DUPLICATE_ENTRIES_FIX_2025-10-01.md \
       docs/integration/technical/troubleshooting/subagentstop/agent-investigations/Developer_SUBAGENT_DUPLICATE_ENTRIES_FIX_2025-10-01.md

git mv AGENTS/Developer/SUBAGENT_CAPTURE_FIX_COMPLETE_2025-10-01.md \
       docs/integration/technical/troubleshooting/subagentstop/agent-investigations/Developer_SUBAGENT_CAPTURE_FIX_COMPLETE_2025-10-01.md

# Commit
git commit -m "docs: move agent-specific SubagentStop investigations to technical/"
```

### Migration Batch 3: Other Troubleshooting Files (5 files)

```bash
# Session file fixes
git mv SESSION_FILE_CREATION_FIX_COMPLETE.md \
       docs/integration/technical/troubleshooting/session-files/

git mv HOOK_CONFIGURATION_FIX_SUMMARY.md \
       docs/integration/technical/troubleshooting/session-files/

git mv HOOK_FIX_COMPLETE.md \
       docs/integration/technical/troubleshooting/session-files/

git mv HOOK_FIX_TEST_RESULTS.md \
       docs/integration/technical/troubleshooting/session-files/

# Quick fixes
git mv QUICK_FIX_GUIDE.md \
       docs/integration/technical/troubleshooting/quick-fixes/

# Commit
git commit -m "docs: organize session-file and quick-fix troubleshooting docs"
```

### Migration Batch 4: Architecture Files (3 from root)

```bash
git mv INTEGRATION_VISUAL_DIAGRAM.md \
       docs/integration/technical/architecture/

git mv INTEGRATION_EXECUTIVE_SUMMARY.md \
       docs/integration/technical/architecture/

git mv CI_COLLABORATIVE_INTELLIGENCE_INTEGRATION_ANALYSIS.md \
       docs/integration/technical/analysis/multi-project/

# Commit
git commit -m "docs: move architecture and analysis docs to technical/"
```

### Migration Batch 5: From docs/architecture/ and docs/analysis/

```bash
# Architecture docs
git mv docs/architecture/CI_INTEGRATION_QUICK_REFERENCE.md \
       docs/integration/technical/architecture/

git mv docs/architecture/CI_COLLABORATIVEINTELLIGENCE_INTEGRATION_ARCHITECTURE.md \
       docs/integration/technical/architecture/

git mv docs/architecture/CI_COLLABORATIVEINTELLIGENCE_ARCHITECTURE_ANALYSIS.md \
       docs/integration/technical/architecture/

git mv docs/architecture/diagrams/MEMORY_ARCHITECTURE_VISUAL.md \
       docs/integration/technical/architecture/

# Analysis docs
git mv docs/analysis/CLAUDE_CODE_CONFIGURATION_INVESTIGATION.md \
       docs/integration/technical/analysis/

git mv docs/analysis/CLAUDE_CODE_AGENT_ARCHITECTURE.md \
       docs/integration/technical/analysis/

# Commit
git commit -m "docs: consolidate architecture and analysis into technical/"
```

### Migration Batch 6: From AGENTS/ folders

```bash
# Developer analysis
git mv AGENTS/Developer/CLAUDE_CODE_INTEGRATION_DISCOVERY.md \
       docs/integration/technical/analysis/

# Debugger analysis
git mv AGENTS/Debugger/CLAUDE_CODE_HOOKS_TECHNICAL_ANALYSIS.md \
       docs/integration/technical/analysis/

# Architect multi-project analysis
git mv AGENTS/Architect/CORRECTED_MULTI_PROJECT_ARCHITECTURE_ANALYSIS.md \
       docs/integration/technical/analysis/multi-project/

# Commit
git commit -m "docs: move agent technical analyses to technical/analysis/"
```

### Migration Batch 7: Archive Safety Docs

```bash
# Main archive safety docs
git mv docs/archive-safety/PROACTIVE_HOOK_DESIGN.md \
       docs/integration/technical/archive-safety/

git mv docs/archive-safety/PROACTIVE_HOOK_TESTING_GUIDE.md \
       docs/integration/technical/archive-safety/

git mv docs/archive-safety/V3.2_FINAL_UX_DESIGN.md \
       docs/integration/technical/archive-safety/

git mv docs/archive-safety/ANTI_LAZINESS_VALIDATION.md \
       docs/integration/technical/archive-safety/

# DirectoryOrganizer agent guides
git mv AGENTS/DirectoryOrganizer/TESTING_GUIDE.md \
       docs/integration/technical/archive-safety/agent-guides/DirectoryOrganizer_TESTING_GUIDE.md

git mv AGENTS/DirectoryOrganizer/ARCHIVE_SAFETY_V2_SUMMARY.md \
       docs/integration/technical/archive-safety/agent-guides/DirectoryOrganizer_ARCHIVE_SAFETY_V2_SUMMARY.md

git mv AGENTS/DirectoryOrganizer/QUICK_REFERENCE.md \
       docs/integration/technical/archive-safety/agent-guides/DirectoryOrganizer_QUICK_REFERENCE.md

git mv AGENTS/DirectoryOrganizer/ARCHIVE_SAFETY_CONFIGURATION_GUIDE.md \
       docs/integration/technical/archive-safety/agent-guides/DirectoryOrganizer_ARCHIVE_SAFETY_CONFIGURATION_GUIDE.md

git mv AGENTS/DirectoryOrganizer/ARCHIVE_SAFETY_IMPLEMENTATION_2025-10-01.md \
       docs/integration/technical/archive-safety/agent-guides/DirectoryOrganizer_ARCHIVE_SAFETY_IMPLEMENTATION_2025-10-01.md

git mv AGENTS/DirectoryOrganizer/ARCHIVE_SAFETY_HOOK_TEST_SCENARIOS.md \
       docs/integration/technical/archive-safety/agent-guides/DirectoryOrganizer_ARCHIVE_SAFETY_HOOK_TEST_SCENARIOS.md

# Commit
git commit -m "docs: consolidate archive safety documentation into technical/"
```

### Migration Batch 8: User Guides

```bash
git mv docs/integration/ci-cli-integration-plan.md \
       docs/integration/user-guides/

git mv docs/integration/ci-cli-claude-integration-progress.md \
       docs/integration/user-guides/

git mv docs/integration/ci-cli-enhanced-commands.md \
       docs/integration/user-guides/

git mv docs/integration/ci-trustwrapper-integration.md \
       docs/integration/user-guides/

git mv docs/integration/unified-workflow-guide.md \
       docs/integration/user-guides/

# Commit
git commit -m "docs: organize user guides into dedicated folder"
```

### Migration Batch 9: Validation Evidence

```bash
git mv docs/integration/FINAL_INTEGRATION_STATUS.md \
       docs/integration/validation/

git mv docs/integration/FUNCTIONAL_MEMORY_BRIDGE_STATUS.md \
       docs/integration/validation/

# Commit
git commit -m "docs: move historical validation evidence to validation/"
```

### Migration Batch 10: Meta-Documentation

```bash
git mv CLAUDE_CODE_DOCUMENTATION_COMPREHENSIVE_INVENTORY.md \
       docs/integration/_INVENTORY_AND_ANALYSIS/

git mv CONSOLIDATOR_CLAUDE_CODE_ANALYSIS.md \
       docs/integration/_INVENTORY_AND_ANALYSIS/

git mv CLAUDE_CODE_DOCUMENTATION_PROGRESSIVE_DISCLOSURE_PLAN.md \
       docs/integration/_INVENTORY_AND_ANALYSIS/

git mv CLAUDE_CODE_DOCUMENTATION_ANALYSIS_TEAM_REPORT.md \
       docs/integration/_INVENTORY_AND_ANALYSIS/

git mv DIRECTORY_ORGANIZER_STRUCTURE_PROPOSAL.md \
       docs/integration/_INVENTORY_AND_ANALYSIS/

git mv DIRECTORY_REORGANIZATION_VISUAL_SUMMARY.md \
       docs/integration/_INVENTORY_AND_ANALYSIS/

git mv DIRECTORY_REORGANIZATION_IMPLEMENTATION_GUIDE.md \
       docs/integration/_INVENTORY_AND_ANALYSIS/

# Commit
git commit -m "docs: archive meta-documentation about documentation organization"
```

### Verify All Migrations

```bash
# Check that root is clean (only expected files remain)
ls *.md | grep -i "subagent\|integration\|hook\|session\|claude_code"
# Should return nothing

# Verify new structure
tree docs/integration -L 3

# Check git status
git status
# Should show clean working directory (all changes committed)
```

---

## Phase 3: Create Index Files (2 hours)

### Index 1: User Guides

```bash
cat > docs/integration/user-guides/INDEX.md << 'EOF'
# Claude Code Integration - User Guides

**Purpose**: Comprehensive guides for different aspects of Claude Code integration

## Getting Started

- 📖 [Main Integration Plan](../claude-code-integration-plan.md) - Master plan overview
- ⚡ [Quick Start](../CLAUDE_CODE_QUICK_START.md) - 5-minute setup
- 💾 [Installation Guide](../CLAUDE_CODE_INSTALLATION_GUIDE.md) - Detailed installation

## CI CLI Integration

- 📋 [CLI Integration Plan](ci-cli-integration-plan.md) - CI CLI approach
- ⚙️ [Enhanced Commands](ci-cli-enhanced-commands.md) - CLI command specifications
- 📊 [Progress Tracking](ci-cli-claude-integration-progress.md) - Implementation progress

## Specialized Integrations

- 🛡️ [TrustWrapper Integration](ci-trustwrapper-integration.md) - AI safety integration
- 🔄 [Unified Workflow](unified-workflow-guide.md) - Complete workflow documentation

## External References

- [CLI Main Documentation](../../cli/claude-code-integration.md)
- [Setup Guide](../../guides/CI_INTEGRATION_SETUP_GUIDE.md)

**Last Updated**: 2025-10-02
**Maintainer**: Documenter
EOF

git add docs/integration/user-guides/INDEX.md
git commit -m "docs: create user-guides index"
```

### Index 2: Validation Evidence

```bash
cat > docs/integration/validation/INDEX.md << 'EOF'
# Claude Code Integration - Validation Evidence

**Purpose**: Historical validation evidence and test results

## Historical Status Reports

These documents are **frozen snapshots** from September 2025, preserved as evidence of successful integration phases:

### Phase 1-3 Integration Status

- 📅 [Final Integration Status](FINAL_INTEGRATION_STATUS.md) - September 18, 2025
  - **Status**: Historical Evidence
  - **Current Info**: See [Master Plan](../claude-code-integration-plan.md)
  - **Purpose**: Technical validation for Phase 1-3 completion

### Phase 2 Memory Bridge Achievement

- 📅 [Functional Memory Bridge Status](FUNCTIONAL_MEMORY_BRIDGE_STATUS.md) - September 18, 2025
  - **Status**: Breakthrough Achievement Documentation
  - **Current Info**: See [Implementation Summary](../claude-code-implementation-summary.md) Phase 2
  - **Purpose**: Memory bridge validation evidence

## Usage Notes

⚠️ **These documents are NOT updated** - they are historical records.

For current status, always refer to:
- ⭐ [Master Integration Plan](../claude-code-integration-plan.md)
- ⭐ [Implementation Summary](../claude-code-implementation-summary.md)

**Archive Date**: September 18, 2025
**Preserved By**: Documenter
EOF

git add docs/integration/validation/INDEX.md
git commit -m "docs: create validation evidence index"
```

### Index 3: Technical Overview

```bash
cat > docs/integration/technical/INDEX.md << 'EOF'
# Claude Code Integration - Technical Documentation

**Purpose**: Deep technical documentation for experts and troubleshooters

## Categories

### 🏗️ [Architecture](architecture/)
System design, integration architecture, memory architecture

### 🔧 [Troubleshooting](troubleshooting/)
Investigation reports, bug fixes, known issues

### 🛡️ [Archive Safety](archive-safety/)
Archive protection system design and implementation

### 📊 [Analysis](analysis/)
Technical analysis, configuration investigations

### 📖 [API Reference](api-reference/)
Hook specifications, JSON schemas, environment variables (to be created)

## Navigation

Each category has its own INDEX.md for detailed navigation.

**Last Updated**: 2025-10-02
**Maintainer**: Architect + Developer + Debugger
EOF

git add docs/integration/technical/INDEX.md
git commit -m "docs: create technical documentation index"
```

### Index 4: Architecture

```bash
cat > docs/integration/technical/architecture/INDEX.md << 'EOF'
# Claude Code Integration - Architecture Documentation

**Purpose**: Deep technical architecture documentation

## Quick Reference

- ⚡ [Quick Reference Guide](CI_INTEGRATION_QUICK_REFERENCE.md) - Fast architecture lookup

## Core Architecture

- 🏗️ [Integration Architecture](CI_COLLABORATIVEINTELLIGENCE_INTEGRATION_ARCHITECTURE.md) - Main architecture
- 📊 [Architecture Analysis](CI_COLLABORATIVEINTELLIGENCE_ARCHITECTURE_ANALYSIS.md) - Deep analysis
- 💾 [Memory Architecture](MEMORY_ARCHITECTURE_VISUAL.md) - Memory system design

## Visualizations

- 🎨 [Integration Diagram](INTEGRATION_VISUAL_DIAGRAM.md) - Visual architecture
- 📋 [Executive Summary](INTEGRATION_EXECUTIVE_SUMMARY.md) - High-level overview

## Multi-Project Architecture

- 🔗 [CI Integration Analysis](../analysis/multi-project/CI_COLLABORATIVE_INTELLIGENCE_INTEGRATION_ANALYSIS.md)
- 🏗️ [Multi-Project Architecture](../analysis/multi-project/CORRECTED_MULTI_PROJECT_ARCHITECTURE_ANALYSIS.md)

**Last Updated**: 2025-10-02
**Maintainer**: Architect
EOF

git add docs/integration/technical/architecture/INDEX.md
git commit -m "docs: create architecture index"
```

### Index 5: Enhanced SubagentStop Index

```bash
# This file already exists at docs/integration/technical/troubleshooting/SUBAGENT_STOP_INDEX.md
# Enhance it with better navigation and status
cat > docs/integration/technical/troubleshooting/SUBAGENT_STOP_INDEX.md << 'EOF'
# SubagentStop Investigation Index

**Status**: 📅 RESOLVED (October 1, 2025, 14:57:35 via commit 3a0eb11)
**Issue**: SubagentStop hook didn't fire consistently due to jq parsing bug
**Resolution**: Fixed jq syntax for parsing transcript files

## Investigation Timeline

**PRE-FIX Period** (Before Oct 1, 14:57:35): Universal jq bug
**FIX**: Commit 3a0eb11 - "fix: correct jq syntax"
**POST-FIX Period** (After Oct 1, 14:57:35): 100% reliability restored

## Primary Documents (Read These First)

1. ⭐ **[ROOT_CAUSE_ANALYSIS.md](subagentstop/SUBAGENT_STOP_ROOT_CAUSE_ANALYSIS.md)** - Main investigation findings
2. 🎨 **[TIMELINE.md](subagentstop/SUBAGENT_STOP_TIMELINE.md)** - Visual timeline showing before/after fix
3. ✅ **[WORKAROUND_IMPLEMENTATION.md](subagentstop/SUBAGENT_STOP_WORKAROUND_IMPLEMENTATION.md)** - Implementation guide

## Supporting Documents (Deep Dives)

4. 📅 [DEBUG_SUMMARY.md](subagentstop/SUBAGENT_STOP_DEBUG_SUMMARY.md) - Pre-fix analysis (overlaps with #1)
5. 📅 [INVESTIGATION_SUMMARY.md](subagentstop/SUBAGENT_STOP_INVESTIGATION_SUMMARY.md) - Post-fix validation
6. 🔬 [ARCHITECTURE_MAP.md](subagentstop/SUBAGENT_STOP_ARCHITECTURE_MAP.md) - System architecture
7. 🔬 [HOOK_INVESTIGATION.md](subagentstop/SUBAGENT_STOP_HOOK_INVESTIGATION.md) - Hook-specific analysis
8. 🔬 [DEBUG_FINDINGS.md](subagentstop/SUBAGENT_STOP_DEBUG_FINDINGS.md) - Detailed findings
9. 🔬 [ANALYSIS.md](subagentstop/SUBAGENT_STOP_ANALYSIS.md) - General analysis
10. ✅ [TESTING_GUIDE.md](subagentstop/SUBAGENT_STOP_TESTING_GUIDE.md) - Testing procedures

## Agent-Specific Investigations

11. 🔬 [Debugger - Data Investigation](subagentstop/agent-investigations/Debugger_SUBAGENT_STOP_DATA_INVESTIGATION.md)
12. 🔬 [Researcher - Triggering Conditions](subagentstop/agent-investigations/Researcher_SUBAGENT_STOP_TRIGGERING_CONDITIONS_RESEARCH.md)
13. ✅ [Developer - Duplicate Fix](subagentstop/agent-investigations/Developer_SUBAGENT_DUPLICATE_ENTRIES_FIX_2025-10-01.md)
14. ✅ [Developer - Capture Fix](subagentstop/agent-investigations/Developer_SUBAGENT_CAPTURE_FIX_COMPLETE_2025-10-01.md)

## Reading Strategy

**For Quick Understanding**: Read #1 (ROOT_CAUSE) + #2 (TIMELINE)
**For Implementation**: Read #3 (WORKAROUND) + #10 (TESTING)
**For Deep Investigation**: Read all supporting docs (#4-9)
**For Agent Perspectives**: Read agent-specific docs (#11-14)

**Last Updated**: 2025-10-02
**Maintained By**: Debugger
EOF

git add docs/integration/technical/troubleshooting/SUBAGENT_STOP_INDEX.md
git commit -m "docs: enhance SubagentStop index with navigation and status"
```

### Index 6: Archive Safety

```bash
cat > docs/integration/technical/archive-safety/INDEX.md << 'EOF'
# Archive Safety System Documentation

**Purpose**: Archive protection system preventing accidental deletion of important files

## Core Design Documents

- 🏗️ [Proactive Hook Design](PROACTIVE_HOOK_DESIGN.md) - System architecture and design
- 🧪 [Testing Guide](PROACTIVE_HOOK_TESTING_GUIDE.md) - Comprehensive testing procedures
- 🎨 [V3.2 UX Design](V3.2_FINAL_UX_DESIGN.md) - User experience design
- ✅ [Anti-Laziness Validation](ANTI_LAZINESS_VALIDATION.md) - Validation methodology

## Agent Implementation Guides

Located in `agent-guides/` subfolder - these are agent-specific implementation notes:

- 📋 [DirectoryOrganizer Testing Guide](agent-guides/DirectoryOrganizer_TESTING_GUIDE.md)
- 📅 [DirectoryOrganizer V2 Summary](agent-guides/DirectoryOrganizer_ARCHIVE_SAFETY_V2_SUMMARY.md)
- ⚡ [DirectoryOrganizer Quick Reference](agent-guides/DirectoryOrganizer_QUICK_REFERENCE.md)
- ⚙️ [DirectoryOrganizer Configuration Guide](agent-guides/DirectoryOrganizer_ARCHIVE_SAFETY_CONFIGURATION_GUIDE.md)
- 🔧 [DirectoryOrganizer Implementation (2025-10-01)](agent-guides/DirectoryOrganizer_ARCHIVE_SAFETY_IMPLEMENTATION_2025-10-01.md)
- 🧪 [DirectoryOrganizer Test Scenarios](agent-guides/DirectoryOrganizer_ARCHIVE_SAFETY_HOOK_TEST_SCENARIOS.md)

## Current Version

**Latest**: V3.2
**Status**: Production
**Hook**: `.claude/hooks/archive-safety.py`

**Last Updated**: 2025-10-01
**Maintainer**: DirectoryOrganizer
EOF

git add docs/integration/technical/archive-safety/INDEX.md
git commit -m "docs: create archive safety index"
```

### Index 7: Analysis

```bash
cat > docs/integration/technical/analysis/INDEX.md << 'EOF'
# Claude Code Integration - Technical Analysis

**Purpose**: Deep technical investigations and configuration analysis

## Core Analysis Documents

- 🔍 [Configuration Investigation](CLAUDE_CODE_CONFIGURATION_INVESTIGATION.md) - Hook configuration deep-dive
- 🏗️ [Agent Architecture](CLAUDE_CODE_AGENT_ARCHITECTURE.md) - Agent system architecture analysis
- 🔬 [Integration Discovery](CLAUDE_CODE_INTEGRATION_DISCOVERY.md) - Initial discovery findings (Developer)
- 🔧 [Hooks Technical Analysis](CLAUDE_CODE_HOOKS_TECHNICAL_ANALYSIS.md) - Hook system analysis (Debugger)

## Multi-Project Integration

- 🔗 [CI Integration Analysis](multi-project/CI_COLLABORATIVE_INTELLIGENCE_INTEGRATION_ANALYSIS.md) - Multi-project integration
- 🏗️ [Multi-Project Architecture](multi-project/CORRECTED_MULTI_PROJECT_ARCHITECTURE_ANALYSIS.md) - Corrected architecture (Architect)

## Reading Strategy

**For Configuration**: Read Configuration Investigation
**For Architecture**: Read Agent Architecture + Multi-Project Architecture
**For Implementation**: Read Integration Discovery + Hooks Technical Analysis

**Last Updated**: 2025-10-02
**Maintainer**: Developer + Architect + Debugger
EOF

git add docs/integration/technical/analysis/INDEX.md
git commit -m "docs: create technical analysis index"
```

### Index 8: API Reference (Placeholder)

```bash
cat > docs/integration/technical/api-reference/INDEX.md << 'EOF'
# Claude Code Integration - API Reference

**Status**: 🚧 TO BE CREATED

This section will contain:

## Planned Documentation

- 📖 **Hook Specifications** - Complete hook API specs
- 📋 **JSON Schemas** - Hook input/output JSON schemas
- ⚙️ **Environment Variables** - All environment variables reference
- 🔢 **Exit Codes** - Standard exit codes and error handling

## Temporary Reference

Until this section is created, see:
- [Master Integration Plan](../../claude-code-integration-plan.md) - Section 6: Technical Reference
- [Hook Scripts](../../../../interfaces/claude-bridge/scripts/) - Actual implementation

**Creation Status**: Identified in inventory, not yet implemented
**Priority**: Medium
**Estimated Effort**: 6-8 hours
**Owner**: Developer
EOF

git add docs/integration/technical/api-reference/INDEX.md
git commit -m "docs: create API reference index (placeholder)"
```

---

## Phase 4: Add Status Badges (3-4 hours)

### Template Script

Create a helper script to add status headers:

```bash
cat > /tmp/add-status-header.sh << 'EOF'
#!/bin/bash
# Usage: ./add-status-header.sh <file> <status> <date> <maintainer> [current-link]

FILE="$1"
STATUS="$2"
DATE="$3"
MAINTAINER="$4"
CURRENT_LINK="$5"

# Read current file content
CONTENT=$(cat "$FILE")

# Create header
HEADER="---
**STATUS**: $STATUS
**LAST UPDATED**: $DATE
**MAINTAINER**: $MAINTAINER"

if [ -n "$CURRENT_LINK" ]; then
  HEADER="$HEADER
**CURRENT INFO**: See [$CURRENT_LINK]"
fi

HEADER="$HEADER
---

"

# Write new file with header
echo "$HEADER$CONTENT" > "$FILE"

echo "✅ Added status header to $FILE"
EOF

chmod +x /tmp/add-status-header.sh
```

### Apply Status Badges

```bash
# Example: SubagentStop files (Historical)
/tmp/add-status-header.sh \
  docs/integration/technical/troubleshooting/subagentstop/SUBAGENT_STOP_ROOT_CAUSE_ANALYSIS.md \
  "📅 Historical (October 1, 2025 - RESOLVED)" \
  "2025-10-01" \
  "N/A (frozen historical record)" \
  "../../../KNOWN_ISSUES.md"

# Repeat for all files needing badges
# (Or create batch script - see Appendix A)

# Commit badges in batches
git add docs/integration/technical/troubleshooting/subagentstop/
git commit -m "docs: add status badges to SubagentStop investigation docs"
```

---

## Phase 5: Update Cross-References (2 hours)

### Update Master Plan

Edit `/docs/integration/claude-code-integration-plan.md`:

```markdown
## Related Documentation

### Quick Access (Level 1)
- [Quick Start Guide](CLAUDE_CODE_QUICK_START.md) - 5-minute setup
- [Known Issues](KNOWN_ISSUES.md) - Common problems

### User Guides (Level 3)
- [User Guides Index](user-guides/INDEX.md) - All user documentation

### Technical Documentation (Level 4)
- [Technical Index](technical/INDEX.md) - Deep technical docs
- [Architecture](technical/architecture/INDEX.md)
- [Troubleshooting](technical/troubleshooting/SUBAGENT_STOP_INDEX.md)
- [Archive Safety](technical/archive-safety/INDEX.md)
- [Analysis](technical/analysis/INDEX.md)

### Historical Evidence
- [Validation Evidence](validation/INDEX.md) - Historical test results
```

### Update README.md

Edit `/docs/integration/README.md`:

```markdown
## Documentation Structure

### 📖 Level 1: Quick Access (Start Here!)
- [Quick Start](CLAUDE_CODE_QUICK_START.md) - Get running in 5 minutes
- [Known Issues](KNOWN_ISSUES.md) - Fix common problems

### 📚 Level 2: Understanding
- [Master Plan](claude-code-integration-plan.md) - Complete integration overview
- [Implementation Summary](claude-code-implementation-summary.md) - What's built
- [Installation Guide](CLAUDE_CODE_INSTALLATION_GUIDE.md) - Detailed setup

### 🛠️ Level 3: Implementation
- [User Guides](user-guides/INDEX.md) - All user-facing documentation
- [Validation Evidence](validation/INDEX.md) - Historical test results

### 🔬 Level 4: Expert Reference
- [Technical Documentation](technical/INDEX.md) - Deep technical docs
```

### Commit Updates

```bash
git add docs/integration/claude-code-integration-plan.md docs/integration/README.md
git commit -m "docs: update cross-references for new structure"
```

---

## Phase 6: Backward Compatibility (1 hour)

### Create Redirect Stubs

```bash
# Example redirect stub for high-traffic doc
cat > SUBAGENT_STOP_ROOT_CAUSE_ANALYSIS.md << 'EOF'
# ⚠️ DOCUMENT MOVED

This file has been relocated as part of documentation reorganization.

**New Location**: [`/docs/integration/technical/troubleshooting/subagentstop/SUBAGENT_STOP_ROOT_CAUSE_ANALYSIS.md`](docs/integration/technical/troubleshooting/subagentstop/SUBAGENT_STOP_ROOT_CAUSE_ANALYSIS.md)

**Reason**: Documentation reorganization (October 2025) - Technical docs moved to `/docs/integration/technical/`

**Please update your bookmarks and links.**

---

This redirect stub will be removed in **November 2025** (30 days).

For navigation, see: [Technical Documentation Index](docs/integration/technical/INDEX.md)
EOF

# Repeat for 10-15 high-traffic docs

git add SUBAGENT_STOP_*.md # (redirect stubs only)
git commit -m "docs: add backward compatibility redirect stubs"
```

---

## Phase 7: Validation (2 hours)

### Automated Checks

```bash
# 1. Link Checker
find docs/integration -name "*.md" -print0 | while IFS= read -r -d '' file; do
  echo "Checking: $file"
  # Extract markdown links: [text](path)
  grep -o '\](.*\.md)' "$file" | sed 's/](//' | while read -r link; do
    # Resolve relative path
    dir=$(dirname "$file")
    target="$dir/$link"
    if [ ! -f "$target" ]; then
      echo "❌ BROKEN LINK in $file: $link → $target"
    fi
  done
done

# 2. Verify all files moved
for file in SUBAGENT_STOP_*.md INTEGRATION_*.md HOOK_*.md; do
  if [ -f "$file" ] && [ ! -L "$file" ] && ! grep -q "DOCUMENT MOVED" "$file"; then
    echo "⚠️  File not moved or redirect stub not created: $file"
  fi
done

# 3. Check git history preserved
git log --follow docs/integration/technical/troubleshooting/subagentstop/SUBAGENT_STOP_ROOT_CAUSE_ANALYSIS.md | head -20
# Should show history from original location
```

### Manual Validation

- [ ] Open docs/integration/README.md - navigation clear?
- [ ] Follow link to technical/INDEX.md - works?
- [ ] Navigate to SubagentStop investigation - findable?
- [ ] Check status badges visible on historical docs
- [ ] Test redirect stub - link works?

### User Acceptance Test

Simulate new developer:

```bash
# Test 1: Find quick start
# - Expected: README.md → QUICK_START.md in <2 minutes
time open docs/integration/README.md

# Test 2: Find SubagentStop info
# - Expected: technical/troubleshooting/SUBAGENT_STOP_INDEX.md in <5 minutes
# - Navigate: README → technical/INDEX.md → troubleshooting/SUBAGENT_STOP_INDEX.md

# Test 3: Understand current vs historical
# - Expected: Status badges clear on all docs
```

---

## Phase 8: Merge to Main (30 minutes)

### Final Checks

```bash
# 1. Verify clean commit history
git log --oneline docs/claude-code-reorganization | head -20

# 2. Run final validation
./validation-script.sh  # (from Phase 7)

# 3. Review changes
git diff main...docs/claude-code-reorganization --stat
```

### Merge

```bash
# Switch to main
git checkout main

# Merge reorganization branch
git merge docs/claude-code-reorganization

# Push to remote
git push origin main

# Tag the reorganization
git tag docs-reorganization-complete
git push origin docs-reorganization-complete
```

### Communication

Post in project README or Slack:

```
📢 Documentation Reorganization Complete!

Claude Code integration docs have been reorganized for better discoverability:

✅ 4-level progressive disclosure (Quick Start → Master → Implementation → Expert)
✅ 8 navigation index files for easy browsing
✅ Status badges on all files (Current / Historical / Technical)
✅ 50+ files moved from root to /docs/integration/technical/

⚠️ Some file paths changed - redirect stubs created for 30 days

📖 Start here: /docs/integration/README.md

Questions? See: /docs/integration/KNOWN_ISSUES.md
```

---

## Appendix A: Batch Status Badge Script

```bash
#!/bin/bash
# add-all-status-badges.sh

# SubagentStop files (Historical - Oct 1, 2025)
for file in docs/integration/technical/troubleshooting/subagentstop/SUBAGENT_STOP_*.md; do
  /tmp/add-status-header.sh "$file" \
    "📅 Historical (October 1, 2025 - RESOLVED)" \
    "2025-10-01" \
    "N/A (frozen historical record)" \
    "../../../../KNOWN_ISSUES.md"
done

# Validation files (Historical - Sept 18, 2025)
/tmp/add-status-header.sh \
  docs/integration/validation/FINAL_INTEGRATION_STATUS.md \
  "📅 Historical Evidence (September 18, 2025)" \
  "2025-09-18" \
  "N/A (frozen)" \
  "../claude-code-integration-plan.md"

/tmp/add-status-header.sh \
  docs/integration/validation/FUNCTIONAL_MEMORY_BRIDGE_STATUS.md \
  "📅 Historical Evidence (September 18, 2025)" \
  "2025-09-18" \
  "N/A (frozen)" \
  "../claude-code-implementation-summary.md#phase-2"

# Architecture files (Technical)
for file in docs/integration/technical/architecture/*.md; do
  [ "$file" = "docs/integration/technical/architecture/INDEX.md" ] && continue
  /tmp/add-status-header.sh "$file" \
    "🔬 Technical Reference" \
    "2025-10-02" \
    "Architect"
done

# Add more batches as needed...
```

---

## Appendix B: Rollback Procedure

If something goes wrong:

```bash
# Option 1: Revert to pre-reorganization state
git checkout main
git reset --hard pre-reorganization
git push origin main --force

# Option 2: Revert specific commits
git revert <commit-hash>

# Option 3: Restore from branch
git checkout docs/claude-code-reorganization
git checkout main
git reset --hard docs/claude-code-reorganization
```

---

## Appendix C: Validation Checklist

### Pre-Merge Checklist

- [ ] All 87 files accounted for (none lost)
- [ ] All 50+ moved files in correct locations
- [ ] 8 index files created
- [ ] Status badges on all appropriate files
- [ ] Cross-references updated in master plan
- [ ] README.md updated
- [ ] 10-15 redirect stubs created
- [ ] Link checker passed (0 broken links)
- [ ] Git history preserved (verified with `git log --follow`)
- [ ] User acceptance test passed

### Post-Merge Checklist

- [ ] Documentation builds successfully
- [ ] Team communication sent
- [ ] Feedback collected after 1 week
- [ ] Redirect stubs removed after 30 days
- [ ] Quarterly review scheduled

---

**Implementation Guide Complete**
**Estimated Total Time**: 20-30 hours across 4 weeks
**Risk Mitigation**: Git branch + tag + validation + redirect stubs
**Success Metric**: New developer can find quick start in <2 minutes
