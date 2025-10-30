# Directory Organization Proposal: Claude Code Integration Documentation

**Date**: 2025-10-02
**Author**: DirectoryOrganizer Agent
**Mission**: Optimize 87-file documentation structure using progressive disclosure
**Status**: EVIDENCE-BASED PROPOSAL

---

## Executive Summary

### The Challenge

Current state: **87 documentation files** scattered across multiple locations, with:
- ✅ **Partial organization started**: Level 1 navigation created (README.md, QUICK_START.md, KNOWN_ISSUES.md)
- ✅ **Technical directory initiated**: `/docs/integration/technical/troubleshooting/` with SubagentStop index
- ⚠️ **11 SubagentStop files** still in project root (not moved to technical folder)
- ⚠️ **No consolidation** implemented yet (Consolidator identified 25-30% duplication)
- ⚠️ **No status badges** on files to indicate Current/Historical/Archived

### My Recommendation: HYBRID APPROACH

**DO NOT consolidate 87 → 30 files** (too aggressive, loses valuable context)
**DO implement progressive disclosure** with clear information hierarchy
**DO add status classification** to solve "which doc is current" problem
**DO organize by purpose** (getting started vs. troubleshooting vs. deep investigation)

**Result**: Keep ~70-75 files, but make them **discoverable** and **clearly labeled**

---

## Proposed Directory Structure

### Final Target Structure

```
CollaborativeIntelligence/
│
├── docs/integration/
│   ├── README.md                                    ✅ EXISTS - Navigation hub (Level 1)
│   ├── CLAUDE_CODE_QUICK_START.md                   ✅ EXISTS - 5-minute setup (Level 1)
│   ├── KNOWN_ISSUES.md                              ✅ EXISTS - Quick troubleshooting (Level 1)
│   │
│   ├── claude-code-integration-plan.md              ✅ KEEP - Master plan (Level 2)
│   ├── claude-code-implementation-summary.md        ✅ KEEP - Implementation details (Level 2)
│   ├── CLAUDE_CODE_INSTALLATION_GUIDE.md            ✅ KEEP - Installation (Level 2)
│   │
│   ├── user-guides/                                 🆕 NEW FOLDER
│   │   ├── INDEX.md                                 🆕 Navigation hub
│   │   ├── ci-cli-integration-plan.md               📦 MOVE from /docs/integration/
│   │   ├── ci-cli-claude-integration-progress.md    📦 MOVE from /docs/integration/
│   │   ├── ci-cli-enhanced-commands.md              📦 MOVE from /docs/integration/
│   │   ├── ci-trustwrapper-integration.md           📦 MOVE from /docs/integration/
│   │   └── unified-workflow-guide.md                📦 MOVE from /docs/integration/
│   │
│   ├── validation/                                  🆕 NEW FOLDER - Historical evidence
│   │   ├── INDEX.md                                 🆕 Navigation hub
│   │   ├── FINAL_INTEGRATION_STATUS.md              📦 MOVE + 📅 Badge: Historical (Sept 18)
│   │   ├── FUNCTIONAL_MEMORY_BRIDGE_STATUS.md       📦 MOVE + 📅 Badge: Historical (Sept 18)
│   │   └── TRUSTWRAPPER_INTEGRATION_STATUS.md       📦 MOVE (if exists)
│   │
│   ├── technical/                                   ✅ EXISTS (started)
│   │   ├── INDEX.md                                 🆕 Navigation hub
│   │   │
│   │   ├── architecture/                            🆕 NEW FOLDER
│   │   │   ├── INDEX.md                             🆕 Navigation hub
│   │   │   ├── CI_INTEGRATION_QUICK_REFERENCE.md    📦 MOVE from /docs/architecture/
│   │   │   ├── CI_COLLABORATIVEINTELLIGENCE_INTEGRATION_ARCHITECTURE.md
│   │   │   ├── CI_COLLABORATIVEINTELLIGENCE_ARCHITECTURE_ANALYSIS.md
│   │   │   ├── MEMORY_ARCHITECTURE_VISUAL.md        📦 MOVE from /docs/architecture/diagrams/
│   │   │   ├── INTEGRATION_VISUAL_DIAGRAM.md        📦 MOVE from root
│   │   │   └── INTEGRATION_EXECUTIVE_SUMMARY.md     📦 MOVE from root
│   │   │
│   │   ├── troubleshooting/                         ✅ EXISTS
│   │   │   ├── SUBAGENT_STOP_INDEX.md               ✅ EXISTS - Keep and enhance
│   │   │   │
│   │   │   ├── subagentstop/                        🆕 NEW FOLDER
│   │   │   │   ├── SUBAGENT_STOP_ROOT_CAUSE_ANALYSIS.md         📦 MOVE + ⭐ Primary
│   │   │   │   ├── SUBAGENT_STOP_DEBUG_SUMMARY.md               📦 MOVE + 🔗 "See ROOT_CAUSE"
│   │   │   │   ├── SUBAGENT_STOP_INVESTIGATION_SUMMARY.md        📦 MOVE + 📅 Post-fix
│   │   │   │   ├── SUBAGENT_STOP_TIMELINE.md                    📦 MOVE + 🎨 Unique format
│   │   │   │   ├── SUBAGENT_STOP_ARCHITECTURE_MAP.md            📦 MOVE
│   │   │   │   ├── SUBAGENT_STOP_WORKAROUND_IMPLEMENTATION.md   📦 MOVE
│   │   │   │   ├── SUBAGENT_STOP_HOOK_INVESTIGATION.md          📦 MOVE
│   │   │   │   ├── SUBAGENT_STOP_DEBUG_FINDINGS.md              📦 MOVE
│   │   │   │   ├── SUBAGENT_STOP_ANALYSIS.md                    📦 MOVE
│   │   │   │   ├── SUBAGENT_STOP_TESTING_GUIDE.md               📦 MOVE
│   │   │   │   └── agent-investigations/            🆕 Agent-specific findings
│   │   │   │       ├── Debugger_SUBAGENT_STOP_DATA_INVESTIGATION.md      📦 MOVE
│   │   │   │       ├── Researcher_SUBAGENT_STOP_TRIGGERING_CONDITIONS.md 📦 MOVE
│   │   │   │       └── Developer_SUBAGENT_DUPLICATE_ENTRIES_FIX.md       📦 MOVE
│   │   │   │
│   │   │   ├── session-files/                      🆕 Historical fixes
│   │   │   │   ├── SESSION_FILE_CREATION_FIX.md    📦 MOVE from root
│   │   │   │   ├── HOOK_CONFIGURATION_FIX.md       📦 MOVE from root
│   │   │   │   ├── HOOK_FIX_COMPLETE.md            📦 MOVE from root
│   │   │   │   └── HOOK_FIX_TEST_RESULTS.md        📦 MOVE from root + 📅 Historical
│   │   │   │
│   │   │   └── quick-fixes/                        🆕 Quick reference
│   │   │       └── QUICK_FIX_GUIDE.md              📦 MOVE from root
│   │   │
│   │   ├── archive-safety/                         🆕 NEW FOLDER
│   │   │   ├── INDEX.md                            🆕 Navigation hub
│   │   │   ├── PROACTIVE_HOOK_DESIGN.md            📦 MOVE from /docs/archive-safety/
│   │   │   ├── PROACTIVE_HOOK_TESTING_GUIDE.md     📦 MOVE from /docs/archive-safety/
│   │   │   ├── V3.2_FINAL_UX_DESIGN.md             📦 MOVE from /docs/archive-safety/
│   │   │   ├── ANTI_LAZINESS_VALIDATION.md         📦 MOVE from /docs/archive-safety/
│   │   │   └── agent-guides/                       🆕 Agent-specific
│   │   │       ├── DirectoryOrganizer_*.md         📦 MOVE from AGENTS/DirectoryOrganizer/
│   │   │       └── [Other agent archive safety docs]
│   │   │
│   │   ├── analysis/                               🆕 NEW FOLDER
│   │   │   ├── INDEX.md                            🆕 Navigation hub
│   │   │   ├── CLAUDE_CODE_CONFIGURATION_INVESTIGATION.md   📦 MOVE from /docs/analysis/
│   │   │   ├── CLAUDE_CODE_AGENT_ARCHITECTURE.md            📦 MOVE from /docs/analysis/
│   │   │   ├── CLAUDE_CODE_INTEGRATION_DISCOVERY.md         📦 MOVE from AGENTS/Developer/
│   │   │   ├── CLAUDE_CODE_HOOKS_TECHNICAL_ANALYSIS.md      📦 MOVE from AGENTS/Debugger/
│   │   │   └── multi-project/                      🆕 Multi-project analysis
│   │   │       ├── CI_COLLABORATIVE_INTELLIGENCE_INTEGRATION.md  📦 MOVE from root
│   │   │       └── CORRECTED_MULTI_PROJECT_ARCHITECTURE.md      📦 MOVE from AGENTS/Architect/
│   │   │
│   │   └── api-reference/                          🆕 NEW FOLDER (to be created)
│   │       ├── INDEX.md                            🆕 Navigation hub
│   │       ├── hook-specifications.md              🆕 TO CREATE (extract from master plan)
│   │       ├── json-schemas.md                     🆕 TO CREATE (hook input/output)
│   │       └── environment-variables.md            🆕 TO CREATE
│   │
│   ├── coordination/                               ✅ EXISTS
│   │   └── MESSAGE_TO_TRUSTWRAPPER_TEAM.md         ✅ KEEP
│   │
│   ├── archive/                                    ✅ EXISTS
│   │   ├── claude-code-integration-plan-v1.md      ✅ KEEP - Historical
│   │   └── troubleshooting/                        ✅ EXISTS
│   │       ├── FUNCTIONAL_MEMORY_BRIDGE_COMPLETE.md
│   │       └── REAL_MEMORY_INTEGRATION_TEST.md
│   │
│   └── _INVENTORY_AND_ANALYSIS/                    🆕 Meta-documentation
│       ├── CLAUDE_CODE_DOCUMENTATION_COMPREHENSIVE_INVENTORY.md  📦 MOVE from root
│       ├── CONSOLIDATOR_CLAUDE_CODE_ANALYSIS.md                  📦 MOVE from root
│       ├── CLAUDE_CODE_DOCUMENTATION_PROGRESSIVE_DISCLOSURE_PLAN.md  📦 MOVE from root
│       ├── CLAUDE_CODE_DOCUMENTATION_ANALYSIS_TEAM_REPORT.md     📦 MOVE from root
│       └── DIRECTORY_ORGANIZER_STRUCTURE_PROPOSAL.md (this file) 📦 MOVE from root
│
├── docs/cli/                                       ✅ EXISTS
│   ├── claude-code-integration.md                  ✅ KEEP - Main CLI user guide
│   ├── CLI.md                                      ✅ KEEP - CLI reference
│   ├── claudeCliIntegration.md                     ⚠️ REVIEW (may be outdated)
│   ├── external_integration.md                     ✅ KEEP
│   ├── migration_guide.md                          ✅ KEEP
│   └── external-ci-architecture.md                 ✅ KEEP
│
├── docs/guides/                                    ✅ EXISTS
│   └── CI_INTEGRATION_SETUP_GUIDE.md               ✅ KEEP
│
├── docs/architecture/                              ✅ EXISTS (most files moved to technical/)
│   ├── decisions/
│   │   └── ADR-001-MEMORY-UNIFICATION-SYMLINK-APPROACH.md  ✅ KEEP
│   └── [Other non-Claude-Code files stay]
│
├── docs/archive-safety/                            📦 → technical/archive-safety/
│   [All files moved]
│
├── management/plans/Plans/                         ✅ EXISTS
│   ├── CLAUDE_CODE_SDK_INTEGRATION_HANDOFF.md      ✅ KEEP + 📅 Badge: Handoff doc
│   └── CLAUDE_CODE_HOOKS_OPTIMIZATION_SPRINT.md    ✅ KEEP + 📋 Badge: Sprint 004 plan
│
├── docs/development/sprints/                       ✅ EXISTS
│   ├── sprint-004/                                 ✅ KEEP - Hook optimization
│   │   ├── README.md
│   │   ├── planning/
│   │   └── progress/
│   │
│   └── sprint-005/                                 ✅ KEEP - Memory system
│       ├── README.md
│       ├── FINAL_COMPLETION_REPORT.md
│       ├── [All other sprint-005 docs]
│       └── [Total: 12 files - keep all as historical record]
│
├── AGENTS/{agent}/                                 ✅ EXISTS
│   ├── MEMORY.md                                   ✅ KEEP - Agent memories
│   ├── Sessions/                                   ✅ KEEP - Work logs
│   └── [Agent-specific technical docs]             📦 Some moved to technical/
│
├── interfaces/claude-bridge/scripts/               ✅ EXISTS
│   └── [56 hook scripts]                           ✅ KEEP - Active code
│
├── .claude/                                        ✅ EXISTS
│   ├── settings.json                               ✅ KEEP - Active config
│   ├── hooks/                                      ✅ KEEP - Hook scripts
│   └── commands/                                   ✅ KEEP - Slash commands
│
└── [Root level]
    ├── CLAUDE.local.md                             ✅ KEEP - Project config
    ├── ci/CLAUDE.md                                ✅ KEEP - CI system config
    └── [All investigation docs moved to technical/]
```

---

## File Migration Matrix

### Complete Migration Map (87 Files)

| Current Location | New Location | Action | Status Badge |
|-----------------|--------------|--------|--------------|
| **LEVEL 1 - NAVIGATION (Already Created)** | | | |
| `/docs/integration/README.md` | SAME | ✅ Keep | ✅ Current |
| `/docs/integration/CLAUDE_CODE_QUICK_START.md` | SAME | ✅ Keep | ✅ Current |
| `/docs/integration/KNOWN_ISSUES.md` | SAME | ✅ Keep | ✅ Current |
| **LEVEL 2 - MASTER DOCS** | | | |
| `/docs/integration/claude-code-integration-plan.md` | SAME | ✅ Keep | ✅ Current |
| `/docs/integration/claude-code-implementation-summary.md` | SAME | ✅ Keep | ✅ Current |
| `/docs/integration/CLAUDE_CODE_INSTALLATION_GUIDE.md` | SAME | ✅ Keep | ✅ Current |
| `/management/plans/Plans/CLAUDE_CODE_SDK_INTEGRATION_HANDOFF.md` | SAME | ✅ Keep | 📅 Historical (Handoff) |
| `/management/plans/Plans/CLAUDE_CODE_HOOKS_OPTIMIZATION_SPRINT.md` | SAME | ✅ Keep | 📋 Sprint Plan |
| **USER GUIDES** | | | |
| `/docs/integration/ci-cli-integration-plan.md` | `/docs/integration/user-guides/` | 📦 Move | ✅ Current |
| `/docs/integration/ci-cli-claude-integration-progress.md` | `/docs/integration/user-guides/` | 📦 Move | ✅ Current |
| `/docs/integration/ci-cli-enhanced-commands.md` | `/docs/integration/user-guides/` | 📦 Move | ✅ Current |
| `/docs/integration/ci-trustwrapper-integration.md` | `/docs/integration/user-guides/` | 📦 Move | ✅ Current |
| `/docs/integration/unified-workflow-guide.md` | `/docs/integration/user-guides/` | 📦 Move | ✅ Current |
| `/docs/cli/claude-code-integration.md` | SAME | ✅ Keep | ✅ Current |
| `/docs/cli/CLI.md` | SAME | ✅ Keep | ✅ Current |
| `/docs/cli/claudeCliIntegration.md` | SAME | ⚠️ Review | ⚠️ May need update |
| `/docs/cli/external_integration.md` | SAME | ✅ Keep | ✅ Current |
| `/docs/cli/migration_guide.md` | SAME | ✅ Keep | ✅ Current |
| `/docs/cli/external-ci-architecture.md` | SAME | ✅ Keep | ✅ Current |
| `/docs/guides/CI_INTEGRATION_SETUP_GUIDE.md` | SAME | ✅ Keep | ✅ Current |
| **VALIDATION EVIDENCE** | | | |
| `/docs/integration/FINAL_INTEGRATION_STATUS.md` | `/docs/integration/validation/` | 📦 Move | 📅 Historical (Sept 18) |
| `/docs/integration/FUNCTIONAL_MEMORY_BRIDGE_STATUS.md` | `/docs/integration/validation/` | 📦 Move | 📅 Historical (Sept 18) |
| **SUBAGENTSTOP INVESTIGATION (14 files)** | | | |
| `/SUBAGENT_STOP_ROOT_CAUSE_ANALYSIS.md` | `/docs/integration/technical/troubleshooting/subagentstop/` | 📦 Move | ⭐ Primary Doc |
| `/SUBAGENT_STOP_DEBUG_SUMMARY.md` | `/docs/integration/technical/troubleshooting/subagentstop/` | 📦 Move | 🔗 See ROOT_CAUSE |
| `/SUBAGENT_STOP_INVESTIGATION_SUMMARY.md` | `/docs/integration/technical/troubleshooting/subagentstop/` | 📦 Move | 📅 Post-Fix Analysis |
| `/SUBAGENT_STOP_TIMELINE.md` | `/docs/integration/technical/troubleshooting/subagentstop/` | 📦 Move | 🎨 Unique Visualization |
| `/SUBAGENT_STOP_ARCHITECTURE_MAP.md` | `/docs/integration/technical/troubleshooting/subagentstop/` | 📦 Move | 🔬 Technical Reference |
| `/SUBAGENT_STOP_WORKAROUND_IMPLEMENTATION.md` | `/docs/integration/technical/troubleshooting/subagentstop/` | 📦 Move | ✅ Implementation Guide |
| `/SUBAGENT_STOP_HOOK_INVESTIGATION.md` | `/docs/integration/technical/troubleshooting/subagentstop/` | 📦 Move | 🔬 Technical Reference |
| `/SUBAGENT_STOP_DEBUG_FINDINGS.md` | `/docs/integration/technical/troubleshooting/subagentstop/` | 📦 Move | 🔬 Technical Reference |
| `/SUBAGENT_STOP_ANALYSIS.md` | `/docs/integration/technical/troubleshooting/subagentstop/` | 📦 Move | 🔬 Technical Reference |
| `/SUBAGENT_STOP_TESTING_GUIDE.md` | `/docs/integration/technical/troubleshooting/subagentstop/` | 📦 Move | ✅ Testing Guide |
| `/AGENTS/Debugger/SUBAGENT_STOP_DATA_INVESTIGATION.md` | `/docs/integration/technical/troubleshooting/subagentstop/agent-investigations/` | 📦 Move | 🔬 Agent Analysis |
| `/AGENTS/Researcher/SUBAGENT_STOP_TRIGGERING_CONDITIONS_RESEARCH.md` | `/docs/integration/technical/troubleshooting/subagentstop/agent-investigations/` | 📦 Move | 🔬 Agent Analysis |
| `/AGENTS/Developer/SUBAGENT_DUPLICATE_ENTRIES_FIX_2025-10-01.md` | `/docs/integration/technical/troubleshooting/subagentstop/agent-investigations/` | 📦 Move | ✅ Fix Implementation |
| `/AGENTS/Developer/SUBAGENT_CAPTURE_FIX_COMPLETE_2025-10-01.md` | `/docs/integration/technical/troubleshooting/subagentstop/agent-investigations/` | 📦 Move | ✅ Fix Implementation |
| **OTHER TROUBLESHOOTING** | | | |
| `/SESSION_FILE_CREATION_FIX_COMPLETE.md` | `/docs/integration/technical/troubleshooting/session-files/` | 📦 Move | ✅ Fix Complete |
| `/HOOK_CONFIGURATION_FIX_SUMMARY.md` | `/docs/integration/technical/troubleshooting/session-files/` | 📦 Move | ✅ Fix Complete |
| `/HOOK_FIX_COMPLETE.md` | `/docs/integration/technical/troubleshooting/session-files/` | 📦 Move | ✅ Fix Complete |
| `/HOOK_FIX_TEST_RESULTS.md` | `/docs/integration/technical/troubleshooting/session-files/` | 📦 Move | 📅 Historical Results |
| `/QUICK_FIX_GUIDE.md` | `/docs/integration/technical/troubleshooting/quick-fixes/` | 📦 Move | ✅ Quick Reference |
| **ARCHITECTURE DOCS** | | | |
| `/docs/architecture/CI_INTEGRATION_QUICK_REFERENCE.md` | `/docs/integration/technical/architecture/` | 📦 Move | ✅ Current |
| `/docs/architecture/CI_COLLABORATIVEINTELLIGENCE_INTEGRATION_ARCHITECTURE.md` | `/docs/integration/technical/architecture/` | 📦 Move | ✅ Current |
| `/docs/architecture/CI_COLLABORATIVEINTELLIGENCE_ARCHITECTURE_ANALYSIS.md` | `/docs/integration/technical/architecture/` | 📦 Move | 🔬 Technical |
| `/docs/architecture/diagrams/MEMORY_ARCHITECTURE_VISUAL.md` | `/docs/integration/technical/architecture/` | 📦 Move | 🎨 Visualization |
| `/INTEGRATION_VISUAL_DIAGRAM.md` | `/docs/integration/technical/architecture/` | 📦 Move | 🎨 Visualization |
| `/INTEGRATION_EXECUTIVE_SUMMARY.md` | `/docs/integration/technical/architecture/` | 📦 Move | ✅ Executive View |
| **ANALYSIS DOCS** | | | |
| `/docs/analysis/CLAUDE_CODE_CONFIGURATION_INVESTIGATION.md` | `/docs/integration/technical/analysis/` | 📦 Move | 🔬 Investigation |
| `/docs/analysis/CLAUDE_CODE_AGENT_ARCHITECTURE.md` | `/docs/integration/technical/analysis/` | 📦 Move | 🔬 Analysis |
| `/AGENTS/Developer/CLAUDE_CODE_INTEGRATION_DISCOVERY.md` | `/docs/integration/technical/analysis/` | 📦 Move | 🔬 Discovery |
| `/AGENTS/Debugger/CLAUDE_CODE_HOOKS_TECHNICAL_ANALYSIS.md` | `/docs/integration/technical/analysis/` | 📦 Move | 🔬 Technical |
| `/CI_COLLABORATIVE_INTELLIGENCE_INTEGRATION_ANALYSIS.md` | `/docs/integration/technical/analysis/multi-project/` | 📦 Move | 🔬 Multi-Project |
| `/AGENTS/Architect/CORRECTED_MULTI_PROJECT_ARCHITECTURE_ANALYSIS.md` | `/docs/integration/technical/analysis/multi-project/` | 📦 Move | 🔬 Architecture |
| **ARCHIVE SAFETY** | | | |
| `/docs/archive-safety/PROACTIVE_HOOK_DESIGN.md` | `/docs/integration/technical/archive-safety/` | 📦 Move | ✅ Design Doc |
| `/docs/archive-safety/PROACTIVE_HOOK_TESTING_GUIDE.md` | `/docs/integration/technical/archive-safety/` | 📦 Move | ✅ Testing Guide |
| `/docs/archive-safety/V3.2_FINAL_UX_DESIGN.md` | `/docs/integration/technical/archive-safety/` | 📦 Move | ✅ UX Design |
| `/docs/archive-safety/ANTI_LAZINESS_VALIDATION.md` | `/docs/integration/technical/archive-safety/` | 📦 Move | ✅ Validation |
| `/AGENTS/DirectoryOrganizer/TESTING_GUIDE.md` | `/docs/integration/technical/archive-safety/agent-guides/` | 📦 Move | ✅ Agent Guide |
| `/AGENTS/DirectoryOrganizer/ARCHIVE_SAFETY_V2_SUMMARY.md` | `/docs/integration/technical/archive-safety/agent-guides/` | 📦 Move | 📅 V2 Summary |
| `/AGENTS/DirectoryOrganizer/QUICK_REFERENCE.md` | `/docs/integration/technical/archive-safety/agent-guides/` | 📦 Move | ✅ Quick Ref |
| `/AGENTS/DirectoryOrganizer/ARCHIVE_SAFETY_CONFIGURATION_GUIDE.md` | `/docs/integration/technical/archive-safety/agent-guides/` | 📦 Move | ✅ Config Guide |
| `/AGENTS/DirectoryOrganizer/ARCHIVE_SAFETY_IMPLEMENTATION_2025-10-01.md` | `/docs/integration/technical/archive-safety/agent-guides/` | 📦 Move | ✅ Implementation |
| `/AGENTS/DirectoryOrganizer/ARCHIVE_SAFETY_HOOK_TEST_SCENARIOS.md` | `/docs/integration/technical/archive-safety/agent-guides/` | 📦 Move | ✅ Test Scenarios |
| **META-DOCUMENTATION** | | | |
| `/CLAUDE_CODE_DOCUMENTATION_COMPREHENSIVE_INVENTORY.md` | `/docs/integration/_INVENTORY_AND_ANALYSIS/` | 📦 Move | 📊 Inventory |
| `/CONSOLIDATOR_CLAUDE_CODE_ANALYSIS.md` | `/docs/integration/_INVENTORY_AND_ANALYSIS/` | 📦 Move | 📊 Analysis |
| `/CLAUDE_CODE_DOCUMENTATION_PROGRESSIVE_DISCLOSURE_PLAN.md` | `/docs/integration/_INVENTORY_AND_ANALYSIS/` | 📦 Move | 📊 Plan |
| `/CLAUDE_CODE_DOCUMENTATION_ANALYSIS_TEAM_REPORT.md` | `/docs/integration/_INVENTORY_AND_ANALYSIS/` | 📦 Move | 📊 Team Report |
| **SPRINTS (Keep as-is)** | | | |
| `/docs/development/sprints/sprint-004/` (5 files) | SAME | ✅ Keep All | 📋 Sprint Docs |
| `/docs/development/sprints/sprint-005/` (12 files) | SAME | ✅ Keep All | 📋 Sprint Docs |
| `/docs/development/sprints/VERIFICATION_REPORT.md` | SAME | ✅ Keep | ✅ Current |
| `/docs/development/sprints/SPRINT_RENUMBERING.md` | SAME | ✅ Keep | ✅ Current |
| `/docs/development/sprint-management.md` | SAME | ✅ Keep | ✅ Current |
| **CONFIGURATION (Keep as-is)** | | | |
| `.claude/settings.json` | SAME | ✅ Keep | ✅ Active Config |
| `.claude/settings.local.json` | SAME | ✅ Keep | ✅ Local Config |
| `CLAUDE.local.md` | SAME | ✅ Keep | ✅ Project Config |
| `ci/CLAUDE.md` | SAME | ✅ Keep | ✅ CI Config |
| `.claude/commands/*.json` (12 files) | SAME | ✅ Keep All | ✅ Active Commands |
| **HOOK SCRIPTS (Keep as-is)** | | | |
| `interfaces/claude-bridge/scripts/` (56 files) | SAME | ✅ Keep All | ✅ Active Code |
| `.claude/hooks/` (3 Python scripts) | SAME | ✅ Keep All | ✅ Active Code |
| **ARCHIVED** | | | |
| `/docs/integration/archive/claude-code-integration-plan-v1.md` | SAME | ✅ Keep | 📅 V1 Archive |
| `/docs/integration/archive/troubleshooting/` (2 files) | SAME | ✅ Keep | 📅 Historical |

**Total File Count**:
- **Before**: 87 documentation files
- **After**: ~75 documentation files (moved, not deleted)
- **Reduction**: 12 files (meta-docs moved to hidden folder, no actual consolidation)
- **New Index Files**: +8 navigation hubs
- **Net Change**: 87 → 83 files (but vastly more organized)

---

## Status Badge Assignments

### Badge Legend

| Badge | Meaning | Update Frequency | Action on Change |
|-------|---------|------------------|------------------|
| ✅ **Current** | Actively maintained, source of truth | Weekly-Monthly | Update in place |
| 📅 **Historical** | Frozen snapshot, evidence | Never | Create new version |
| 🔬 **Technical** | Deep reference, stable | Quarterly | Update if specs change |
| 📋 **Sprint** | Sprint documentation | Per sprint | Keep as sprint record |
| ⭐ **Primary** | Main doc in category | Weekly | This is THE reference |
| 🔗 **See Also** | Duplicate/related content | Never | Points to primary |
| 🎨 **Unique Format** | Special visualization/format | As needed | Unique value preserved |
| ⚠️ **Review Needed** | Potentially outdated | ASAP | Verify currency |

### File-by-File Status Assignments

**LEVEL 1 - Navigation (✅ Current)**
- README.md → ✅ Current (update weekly)
- CLAUDE_CODE_QUICK_START.md → ✅ Current (update monthly)
- KNOWN_ISSUES.md → ✅ Current (update as issues arise)

**LEVEL 2 - Master Docs**
- claude-code-integration-plan.md → ⭐ Primary + ✅ Current
- claude-code-implementation-summary.md → ✅ Current
- CLAUDE_CODE_INSTALLATION_GUIDE.md → ✅ Current
- CLAUDE_CODE_SDK_INTEGRATION_HANDOFF.md → 📅 Historical (handoff document)
- CLAUDE_CODE_HOOKS_OPTIMIZATION_SPRINT.md → 📋 Sprint Plan

**User Guides (✅ Current)**
- All user guide files → ✅ Current (update as features change)

**Validation Evidence (📅 Historical)**
- FINAL_INTEGRATION_STATUS.md → 📅 Historical (Sept 18, 2025)
- FUNCTIONAL_MEMORY_BRIDGE_STATUS.md → 📅 Historical (Sept 18, 2025)

**SubagentStop Investigation**
- SUBAGENT_STOP_ROOT_CAUSE_ANALYSIS.md → ⭐ Primary + 📅 Historical (Oct 1, 2025 - Fixed)
- SUBAGENT_STOP_DEBUG_SUMMARY.md → 🔗 See ROOT_CAUSE + 📅 Pre-Fix
- SUBAGENT_STOP_INVESTIGATION_SUMMARY.md → 📅 Post-Fix (Oct 1, 2025)
- SUBAGENT_STOP_TIMELINE.md → 🎨 Unique Format + 📅 Historical
- Other SubagentStop files → 🔬 Technical Reference + 📅 Historical

**Architecture Docs (🔬 Technical)**
- All architecture files → 🔬 Technical (update quarterly or on major changes)

**Archive Safety (✅ Current + 📅 Historical)**
- Design docs → ✅ Current
- V2 summary → 📅 Historical (V2 specific)

**Sprint Docs (📋 Sprint)**
- All sprint documentation → 📋 Sprint Record (freeze per sprint)

---

## Consolidation Execution Plan

### My Recommendation: MINIMAL CONSOLIDATION

**Rationale**: After analyzing Consolidator's findings:
- **25-30% duplication exists** but mostly in investigation docs telling same story from different angles
- **Different perspectives have value** - Debugger view vs. Developer view vs. Timeline view
- **Historical context matters** - Investigation docs show problem-solving methodology
- **Consolidation risks information loss** - Each doc captures unique framing

**What I WILL Consolidate**:

#### Consolidation #1: Meta-Documentation (5 files → 1 folder)

**Action**: Move to hidden folder, don't consolidate content

**Files**:
- CLAUDE_CODE_DOCUMENTATION_COMPREHENSIVE_INVENTORY.md
- CONSOLIDATOR_CLAUDE_CODE_ANALYSIS.md
- CLAUDE_CODE_DOCUMENTATION_PROGRESSIVE_DISCLOSURE_PLAN.md
- CLAUDE_CODE_DOCUMENTATION_ANALYSIS_TEAM_REPORT.md
- DIRECTORY_ORGANIZER_STRUCTURE_PROPOSAL.md (this file)

**New Location**: `/docs/integration/_INVENTORY_AND_ANALYSIS/`

**Reason**: These are meta-docs about documentation organization, not user-facing content

---

#### Consolidation #2: Status Documents (Enhance Cross-References)

**DO NOT merge files**, instead:

**FINAL_INTEGRATION_STATUS.md** → Add header:
```markdown
**STATUS**: 📅 Historical Evidence (September 18, 2025)
**CURRENT STATUS**: See [Master Plan](../claude-code-integration-plan.md) for latest status
**PURPOSE**: Technical validation evidence for Phase 1-3 completion
```

**FUNCTIONAL_MEMORY_BRIDGE_STATUS.md** → Add header:
```markdown
**STATUS**: 📅 Historical Evidence (September 18, 2025)
**CURRENT STATUS**: See [Implementation Summary](../claude-code-implementation-summary.md) Phase 2
**PURPOSE**: Breakthrough achievement documentation for memory bridge
```

**Result**: Files stay separate (valuable evidence) but clearly labeled as historical

---

#### Consolidation #3: SubagentStop Investigation (Add Context, Don't Merge)

**DO NOT consolidate 14 files into 1** - each serves a purpose:

**Instead, enhance SUBAGENT_STOP_INDEX.md**:

```markdown
# SubagentStop Investigation Index

**Status**: 📅 RESOLVED (October 1, 2025, 14:57:35 via commit 3a0eb11)
**Issue**: SubagentStop hook didn't fire consistently due to jq parsing bug
**Resolution**: Fixed jq syntax for parsing transcript files

## Investigation Timeline

**PRE-FIX Period** (Before Oct 1, 14:57:35): Universal jq bug
**FIX**: Commit 3a0eb11 - "fix: correct jq syntax"
**POST-FIX Period** (After Oct 1, 14:57:35): 100% reliability restored

## Primary Documents (Read These First)

1. ⭐ **[ROOT_CAUSE_ANALYSIS.md](SUBAGENT_STOP_ROOT_CAUSE_ANALYSIS.md)** - Main investigation findings
2. 🎨 **[TIMELINE.md](SUBAGENT_STOP_TIMELINE.md)** - Visual timeline showing before/after fix
3. ✅ **[WORKAROUND_IMPLEMENTATION.md](SUBAGENT_STOP_WORKAROUND_IMPLEMENTATION.md)** - Implementation guide

## Supporting Documents (Deep Dives)

4. 📅 [DEBUG_SUMMARY.md](SUBAGENT_STOP_DEBUG_SUMMARY.md) - Pre-fix analysis (overlaps with #1)
5. 📅 [INVESTIGATION_SUMMARY.md](SUBAGENT_STOP_INVESTIGATION_SUMMARY.md) - Post-fix validation
6. 🔬 [ARCHITECTURE_MAP.md](SUBAGENT_STOP_ARCHITECTURE_MAP.md) - System architecture
7. 🔬 [HOOK_INVESTIGATION.md](SUBAGENT_STOP_HOOK_INVESTIGATION.md) - Hook-specific analysis
8. 🔬 [DEBUG_FINDINGS.md](SUBAGENT_STOP_DEBUG_FINDINGS.md) - Detailed findings
9. 🔬 [ANALYSIS.md](SUBAGENT_STOP_ANALYSIS.md) - General analysis
10. ✅ [TESTING_GUIDE.md](SUBAGENT_STOP_TESTING_GUIDE.md) - Testing procedures

## Agent-Specific Investigations

11. 🔬 [Debugger - Data Investigation](agent-investigations/Debugger_SUBAGENT_STOP_DATA_INVESTIGATION.md)
12. 🔬 [Researcher - Triggering Conditions](agent-investigations/Researcher_SUBAGENT_STOP_TRIGGERING_CONDITIONS.md)
13. ✅ [Developer - Duplicate Fix](agent-investigations/Developer_SUBAGENT_DUPLICATE_ENTRIES_FIX.md)
14. ✅ [Developer - Capture Fix](agent-investigations/Developer_SUBAGENT_CAPTURE_FIX_COMPLETE.md)

## Reading Strategy

**For Quick Understanding**: Read #1 (ROOT_CAUSE) + #2 (TIMELINE)
**For Implementation**: Read #3 (WORKAROUND) + #10 (TESTING)
**For Deep Investigation**: Read all supporting docs (#4-9)
**For Agent Perspectives**: Read agent-specific docs (#11-14)
```

**Result**: All 14 files kept, but navigation makes them discoverable and understandable

---

### What I WON'T Consolidate

**WON'T Consolidate**: User guides (11 files)
- **Reason**: Different use cases (CLI vs. TrustWrapper vs. workflow vs. setup)
- **Action**: Organize into `/user-guides/` folder with index

**WON'T Consolidate**: Architecture docs (16 files)
- **Reason**: Different aspects (integration vs. agent vs. memory vs. multi-project)
- **Action**: Organize into `/technical/architecture/` with index

**WON'T Consolidate**: Sprint docs (23 files)
- **Reason**: Historical record of development process
- **Action**: Keep as-is (already well-organized by sprint)

**WON'T Consolidate**: Archive safety docs (10 files)
- **Reason**: Different versions and design iterations
- **Action**: Organize into `/technical/archive-safety/` with index

---

## Maintenance Classification

### Update Frequency Matrix

| Category | Update Frequency | Maintenance Owner | Trigger |
|----------|------------------|-------------------|---------|
| **Navigation (Level 1)** | Weekly | Documenter | New features, issues resolved |
| **Master Plan** | Bi-weekly | Athena + Architect | Status changes, new phases |
| **User Guides** | Monthly | Documenter + Developer | Feature changes, user feedback |
| **Validation Evidence** | NEVER | N/A | Frozen historical snapshots |
| **Troubleshooting** | As needed | Debugger | New issues discovered |
| **Architecture** | Quarterly | Architect | Major architectural changes |
| **Analysis Docs** | NEVER | N/A | Historical investigations |
| **Archive Safety** | Per version | DirectoryOrganizer | New versions released |
| **Sprint Docs** | NEVER | N/A | Sprint historical records |
| **Configuration** | As needed | Developer | Config changes |
| **Hook Scripts** | As needed | Developer | Bug fixes, features |

### "Freeze vs. Update" Classification

**FREEZE (Never Update - 40 files, 46%)**:
- ✅ All SubagentStop investigation docs (14 files) - Historical record
- ✅ All validation evidence (2 files) - Historical snapshots
- ✅ All sprint documentation (23 files) - Sprint records
- ✅ Archive safety V2 summary (1 file) - Version-specific

**UPDATE REGULARLY (15 files, 17%)**:
- ✅ README.md, QUICK_START.md, KNOWN_ISSUES.md (3 files)
- ✅ Master plan, implementation summary, installation guide (3 files)
- ✅ User guides (5 files)
- ✅ Troubleshooting quick-fixes (1 file)
- ✅ Configuration files (3 files)

**UPDATE AS NEEDED (32 files, 37%)**:
- ✅ Architecture docs (16 files) - Only on major changes
- ✅ Archive safety current docs (6 files) - Per version
- ✅ Analysis docs (10 files) - Only if specs change

**Total**: 87 files
- **Regular maintenance burden**: 15 files (17%) - Manageable!
- **Frozen historical record**: 40 files (46%) - Zero maintenance
- **Occasional updates**: 32 files (37%) - Low burden

---

## Implementation Timeline

### Phase 1: Directory Structure (Week 1)

**Days 1-2: Create New Folders**
```bash
# Create technical subdirectories
mkdir -p docs/integration/technical/{architecture,troubleshooting/subagentstop/agent-investigations,troubleshooting/session-files,troubleshooting/quick-fixes,archive-safety/agent-guides,analysis/multi-project,api-reference}

# Create user guides folder
mkdir -p docs/integration/user-guides

# Create validation folder
mkdir -p docs/integration/validation

# Create meta-doc folder
mkdir -p docs/integration/_INVENTORY_AND_ANALYSIS
```

**Days 3-4: Create Index Files (8 new files)**
- [ ] `/docs/integration/user-guides/INDEX.md`
- [ ] `/docs/integration/validation/INDEX.md`
- [ ] `/docs/integration/technical/INDEX.md`
- [ ] `/docs/integration/technical/architecture/INDEX.md`
- [ ] `/docs/integration/technical/troubleshooting/SUBAGENT_STOP_INDEX.md` (enhance existing)
- [ ] `/docs/integration/technical/archive-safety/INDEX.md`
- [ ] `/docs/integration/technical/analysis/INDEX.md`
- [ ] `/docs/integration/technical/api-reference/INDEX.md`

**Day 5: Update Master README**
- [ ] Enhance `/docs/integration/README.md` with new structure

---

### Phase 2: File Migration (Week 2)

**Priority 1: SubagentStop Files (11 files from root)**
```bash
# Move SubagentStop investigation docs
mv SUBAGENT_STOP_*.md docs/integration/technical/troubleshooting/subagentstop/

# Move agent-specific investigations
mv AGENTS/Debugger/SUBAGENT_STOP_DATA_INVESTIGATION.md \
   docs/integration/technical/troubleshooting/subagentstop/agent-investigations/Debugger_SUBAGENT_STOP_DATA_INVESTIGATION.md

mv AGENTS/Researcher/SUBAGENT_STOP_TRIGGERING_CONDITIONS_RESEARCH.md \
   docs/integration/technical/troubleshooting/subagentstop/agent-investigations/Researcher_SUBAGENT_STOP_TRIGGERING_CONDITIONS.md

mv AGENTS/Developer/SUBAGENT_DUPLICATE_ENTRIES_FIX_2025-10-01.md \
   docs/integration/technical/troubleshooting/subagentstop/agent-investigations/Developer_SUBAGENT_DUPLICATE_ENTRIES_FIX.md

mv AGENTS/Developer/SUBAGENT_CAPTURE_FIX_COMPLETE_2025-10-01.md \
   docs/integration/technical/troubleshooting/subagentstop/agent-investigations/Developer_SUBAGENT_CAPTURE_FIX_COMPLETE.md
```

**Priority 2: Other Troubleshooting (5 files from root)**
```bash
mv SESSION_FILE_CREATION_FIX_COMPLETE.md docs/integration/technical/troubleshooting/session-files/
mv HOOK_CONFIGURATION_FIX_SUMMARY.md docs/integration/technical/troubleshooting/session-files/
mv HOOK_FIX_COMPLETE.md docs/integration/technical/troubleshooting/session-files/
mv HOOK_FIX_TEST_RESULTS.md docs/integration/technical/troubleshooting/session-files/
mv QUICK_FIX_GUIDE.md docs/integration/technical/troubleshooting/quick-fixes/
```

**Priority 3: Architecture Files (3 from root)**
```bash
mv INTEGRATION_VISUAL_DIAGRAM.md docs/integration/technical/architecture/
mv INTEGRATION_EXECUTIVE_SUMMARY.md docs/integration/technical/architecture/
mv CI_COLLABORATIVE_INTELLIGENCE_INTEGRATION_ANALYSIS.md docs/integration/technical/analysis/multi-project/
```

**Priority 4: Meta-Documentation (5 from root)**
```bash
mv CLAUDE_CODE_DOCUMENTATION_*.md docs/integration/_INVENTORY_AND_ANALYSIS/
mv CONSOLIDATOR_CLAUDE_CODE_ANALYSIS.md docs/integration/_INVENTORY_AND_ANALYSIS/
mv DIRECTORY_ORGANIZER_STRUCTURE_PROPOSAL.md docs/integration/_INVENTORY_AND_ANALYSIS/
```

---

### Phase 3: Status Badge Addition (Week 2)

**Template for Status Header**:
```markdown
---
**STATUS**: [Badge]
**LAST UPDATED**: [Date]
**MAINTAINER**: [Agent]
**CURRENT INFO**: [Link to current doc if historical]
---
```

**Badge Assignment Script** (apply to all 87 files):
```bash
# Add status badges to all files
for file in [list]; do
  # Prepend status header based on classification
done
```

**Manual Badge Assignment**:
- [ ] All SubagentStop docs → 📅 Historical (Oct 1, 2025)
- [ ] Validation evidence → 📅 Historical (Sept 18, 2025)
- [ ] User guides → ✅ Current
- [ ] Architecture → 🔬 Technical
- [ ] Sprint docs → 📋 Sprint Record

---

### Phase 4: Cross-Reference Updates (Week 3)

**Update Links in Key Documents**:
- [ ] Master plan links to new locations
- [ ] README navigation links
- [ ] Index files link to actual docs
- [ ] Agent MEMORY.md references updated
- [ ] Slash command documentation updated

**Automated Link Checker**:
```bash
# Create script to validate all internal links
find docs/integration -name "*.md" -exec grep -l "](/" {} \; | while read file; do
  # Check all markdown links are valid
done
```

---

### Phase 5: Backward Compatibility (Week 3)

**Symlinks for High-Traffic Files** (optional):
```bash
# Create symlinks from old locations to new locations for most-accessed files
ln -s docs/integration/technical/troubleshooting/subagentstop/SUBAGENT_STOP_ROOT_CAUSE_ANALYSIS.md \
      SUBAGENT_STOP_ROOT_CAUSE_ANALYSIS.md

# Benefit: Old links don't break
# Risk: Creates confusion about "real" location
```

**My Recommendation**: DON'T create symlinks
- **Reason**: Clean break is better than dual-location confusion
- **Alternative**: Update all references in Week 3, broken links will be caught

---

### Phase 6: Validation (Week 4)

**Quality Checks**:
- [ ] All 87 files accounted for (none lost)
- [ ] All status badges applied
- [ ] All index files complete
- [ ] All cross-references updated
- [ ] No broken links
- [ ] Git history preserved

**User Acceptance Testing**:
- [ ] New developer can find quick start in <2 minutes
- [ ] Troubleshooting SubagentStop findable in <5 minutes
- [ ] Architecture docs discoverable via index
- [ ] Historical vs. current distinction clear

**Git Validation**:
```bash
# Verify git history preserved
git log --follow docs/integration/technical/troubleshooting/subagentstop/SUBAGENT_STOP_ROOT_CAUSE_ANALYSIS.md

# Should show history from original location
```

---

## Backward Compatibility Strategy

### Approach: DOCUMENTATION REDIRECTS

**Instead of symlinks**, use redirect stubs:

**Example**: `/SUBAGENT_STOP_ROOT_CAUSE_ANALYSIS.md` (old location)
```markdown
# ⚠️ DOCUMENT MOVED

This file has been relocated to:

**New Location**: [`/docs/integration/technical/troubleshooting/subagentstop/SUBAGENT_STOP_ROOT_CAUSE_ANALYSIS.md`](docs/integration/technical/troubleshooting/subagentstop/SUBAGENT_STOP_ROOT_CAUSE_ANALYSIS.md)

**Reason**: Documentation reorganization (October 2025)

**Please update your bookmarks and links.**

---

This redirect stub will be removed in **November 2025** (30 days).
```

**Benefits**:
- ✅ Clear communication about move
- ✅ Clickable link to new location
- ✅ Temporary (can be removed after 30 days)
- ✅ No symlink confusion
- ✅ Git-friendly (text files, not symlinks)

**Implementation**:
```bash
# After moving files, create redirect stubs for high-traffic docs (10-15 files)
for file in SUBAGENT_STOP_ROOT_CAUSE_ANALYSIS.md [others]; do
  echo "# Document Moved..." > $file
done
```

---

## Risk Mitigation

### Risk 1: Information Loss During Migration

**Probability**: Low (10%)
**Impact**: High

**Mitigation**:
- ✅ Create git branch for reorganization
- ✅ Test migration on branch first
- ✅ Verify all 87 files accounted for before deleting originals
- ✅ Keep redirect stubs for 30 days
- ✅ Rollback plan: `git revert` to pre-migration state

---

### Risk 2: Link Breakage

**Probability**: Medium (40%)
**Impact**: Medium

**Mitigation**:
- ✅ Automated link checker script
- ✅ Manual review of high-traffic docs
- ✅ Search for old paths in entire codebase: `grep -r "SUBAGENT_STOP_ROOT_CAUSE" .`
- ✅ Update agent MEMORY.md references
- ✅ Update slash command docs

---

### Risk 3: User Confusion

**Probability**: Medium (30%)
**Impact**: Medium

**Mitigation**:
- ✅ Communication: Update project README with "Documentation Reorganized" notice
- ✅ Redirect stubs for 30 days
- ✅ Enhanced navigation (index files)
- ✅ Clear status badges
- ✅ Quick start guide unchanged (minimize disruption)

---

### Risk 4: Git History Loss

**Probability**: Low (5%) if using `git mv`
**Impact**: High

**Mitigation**:
- ✅ Use `git mv` instead of `mv` for all file moves
- ✅ Verify history preserved: `git log --follow [new-path]`
- ✅ Keep commit messages clear: "docs: move SubagentStop investigation to technical/"

---

## Success Metrics

### Quantitative Metrics

| Metric | Before | Target After | How to Measure |
|--------|--------|--------------|----------------|
| **Time to find quick start** | Unknown | <2 min | User test with new developer |
| **Files in project root** | 24 | 5 | Count `.md` files in root |
| **Avg. time to troubleshoot** | Unknown | <10 min | User test: "Find SubagentStop fix" |
| **Broken links** | Unknown | 0 | Automated link checker |
| **Files with status badges** | 0% | 100% | Count badges in all files |
| **Navigation index coverage** | 0% | 100% | All categories have index |

### Qualitative Metrics

**User Feedback Survey** (after Week 4):
- "I can find what I need quickly" → Target: 90% agree
- "I know which docs are current vs. historical" → Target: 95% agree
- "The organization makes sense" → Target: 85% agree
- "I miss the old structure" → Target: <10% agree

---

## Conclusion

### What This Proposal Delivers

✅ **Progressive Disclosure**: 4-level hierarchy (Navigation → Master → Detail → Archive)
✅ **Clear Authority**: Status badges on all files (Current/Historical/Technical)
✅ **Maintainability**: Only 15 files (17%) need regular updates
✅ **Discoverability**: 8 navigation index files
✅ **Preservation**: All 87 files kept (minimal consolidation)
✅ **Organization**: Logical folder structure by purpose

### What This Proposal DOESN'T Do

❌ **Aggressive consolidation**: Not reducing 87 → 30 (too risky)
❌ **Content rewriting**: Not changing file contents (preserves git history)
❌ **Deletion**: Not removing any valuable documentation
❌ **Symlinks**: Using redirect stubs instead (cleaner)

### Next Steps

**Immediate (This Week)**:
1. Review and approve this proposal
2. Create git branch: `git checkout -b docs/claude-code-reorganization`
3. Begin Phase 1: Directory structure creation

**Week 2**: File migration
**Week 3**: Cross-reference updates + backward compatibility
**Week 4**: Validation and merge to main

**Estimated Total Effort**: 20-30 hours across 4 weeks
**Risk Level**: LOW (with proper git workflow and validation)
**Expected Impact**: 10x improvement in documentation discoverability

---

**Proposal Status**: READY FOR APPROVAL
**Author**: DirectoryOrganizer Agent
**Reviewers Needed**: Athena, Documenter, Architect
**Implementation Start**: Upon approval

---

## Appendix: Sample Index Files

### Sample: `/docs/integration/user-guides/INDEX.md`

```markdown
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
```

### Sample: `/docs/integration/technical/architecture/INDEX.md`

```markdown
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

- 🔗 [CI Integration Analysis](../analysis/multi-project/CI_COLLABORATIVE_INTELLIGENCE_INTEGRATION.md)
- 🏗️ [Multi-Project Architecture](../analysis/multi-project/CORRECTED_MULTI_PROJECT_ARCHITECTURE.md)

**Last Updated**: 2025-10-02
**Maintainer**: Architect
```

---

**END OF PROPOSAL**
