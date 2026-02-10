# Claude Code Documentation Progressive Disclosure Plan

**Date**: 2025-10-02
**Authors**: Athena, Strategist, Documenter, DirectoryOrganizer, Topologist
**Status**: EVIDENCE-BASED PROPOSAL

---

## Executive Summary

### The Real Problem

**You're right** - we haven't read all 87 files in detail. But based on:
1. ✅ Complete master plan analysis (677 lines)
2. ✅ Sampling 3 representative files from different categories
3. ✅ Progressive disclosure framework from Rabbi project
4. ✅ Your stated pain points (conflicting info, unclear authority, maintenance burden)

**The problem is NOT the number of files** - it's the **lack of information hierarchy**.

### Evidence-Based Findings

| Issue | Evidence | Impact |
|-------|----------|--------|
| **No clear entry point** | Master plan is 677 lines - too dense for quick questions | High |
| **Duplicate information** | 3 different "status" docs (master plan, FINAL_INTEGRATION_STATUS, FUNCTIONAL_MEMORY_BRIDGE_STATUS) | Medium |
| **Conflicting dates** | Some docs dated Sept 18, others Oct 1 - unclear which is current | Medium |
| **Wrong level docs** | SubagentStop debug (technical) mixed with user guides (conceptual) | Low |
| **No role-based routing** | Developer, DevOps, PM all get same 677-line doc | High |

### Proposed Solution: Progressive Disclosure, NOT Consolidation

**Do NOT reduce 87 → 30 files**. Instead:

1. **Create 4-level information hierarchy** (following Rabbi pattern)
2. **Add navigation hubs** for role-based discovery
3. **Establish single authoritative doc per topic**
4. **Keep specialized docs separate** (they serve different purposes)

---

## Evidence From File Sampling

### File 1: `docs/cli/claude-code-integration.md` (User Guide)

**Purpose**: Step-by-step setup guide
**Length**: 340 lines
**Level**: Should be Level 2-3 (Implementation)
**Analysis**:
- ✅ **Good**: Clear steps, command examples, expected outputs
- ✅ **Good**: Appropriate length for implementation guide
- ❌ **Missing**: Quick 5-minute version for experienced users
- ❌ **Missing**: Link to master plan for context
- ❌ **Missing**: "Continue Learning" section

**Verdict**: Keep as-is but add progressive disclosure elements

### File 2: `docs/integration/FINAL_INTEGRATION_STATUS.md` (Status Report)

**Purpose**: TrustWrapper integration status
**Length**: ~300 lines (partial read)
**Level**: Should be Level 3-4 (Expert Reference)
**Analysis**:
- ✅ **Good**: Detailed evidence and test results
- ❌ **Problem**: Overlaps with master plan section on TrustWrapper
- ❌ **Problem**: Dated Sept 18 - unclear if still current
- ❌ **Problem**: Title says "FINAL" but integration continues

**Verdict**: This is **technical validation evidence** - should be referenced from master plan, not duplicated

### File 3: `SUBAGENT_STOP_DEBUG_SUMMARY.md` (Investigation Report)

**Purpose**: Debug investigation findings
**Length**: ~400 lines (partial read)
**Level**: Level 4 (Expert Reference / Troubleshooting)
**Analysis**:
- ✅ **Good**: Detailed evidence, clear findings
- ✅ **Good**: Appropriate for troubleshooting reference
- ❌ **Missing**: Executive summary at top (2-3 sentences)
- ❌ **Missing**: Link from master plan "Known Issues" section

**Verdict**: Keep as specialized doc but improve discoverability

---

## Progressive Disclosure Framework Application

### Level 1: Essential (NEW - Create This)

**File**: `docs/integration/CLAUDE_CODE_QUICK_START.md` (NEW)

**Target**: 250-500 words, 5 minutes
**Purpose**: Get running immediately

```markdown
# Claude Code Integration - Quick Start

The CollaborativeIntelligence system integrates with Claude Code to provide:
- 🤖 Automatic agent activation when you mention them
- 🧠 18KB+ agent memory loaded automatically
- 🛡️ Real-time hallucination detection
- 📊 Session tracking across projects

## Setup (3 commands, 2 minutes)

1. Hook installation is already complete - see `.claude/settings.json`
2. Test it: Type `@Athena` or `@Developer` in any Claude Code session
3. Verify: Agent memory should load automatically

## How It Works

When you type `@AgentName`, hooks automatically:
1. Load agent's global 18KB MEMORY.md file
2. Apply project-specific context
3. Validate responses for hallucinations
4. Update agent learning after session

## Next Steps

- 📖 [Full Integration Guide](claude-code-integration-plan.md) → Complete architecture
- 🛠️ [Setup Guide](../cli/claude-code-integration.md) → Detailed installation
- 🐛 [Troubleshooting](KNOWN_ISSUES.md) → Common problems
```

### Level 2: Conceptual (ENHANCE EXISTING)

**File**: `docs/integration/claude-code-integration-plan.md` (CURRENT MASTER)

**Current**: 792 lines - too dense
**Target**: 500-1000 words overview + links to Level 3 details

**Changes Needed**:
1. ✅ Keep: Executive Summary (already good)
2. ✅ Keep: Table of Contents (already good)
3. ✅ Keep: Background & Architecture (compress to 400 words)
4. ❌ **Move to Level 3**: Detailed implementation status (Phase 1-3 details)
5. ❌ **Move to Level 3**: Integration architecture details
6. ❌ **Move to Level 4**: Technical reference sections
7. ➕ **Add**: Role-based navigation hub

### Level 3: Implementation (REORGANIZE EXISTING)

**Files**: Keep separate but improve cross-links

- `docs/cli/claude-code-integration.md` → Setup guide (keep)
- `FUNCTIONAL_MEMORY_BRIDGE_STATUS.md` → Phase 2 validation (keep)
- `TRUSTWRAPPER_INTEGRATION_STATUS.md` → Phase 3 validation (keep)
- `management/plans/Plans/CLAUDE_CODE_HOOKS_OPTIMIZATION_SPRINT.md` → Sprint 004 plan (keep)

**Changes**: Add "Return to Master Plan" links at bottom

### Level 4: Expert Reference (ORGANIZE EXISTING)

**Categories to maintain**:

1. **Troubleshooting** (14 SubagentStop docs)
   - Keep all - they document a real investigation
   - Add: `SUBAGENT_STOP_INDEX.md` as navigation hub

2. **Archive Safety** (10 docs)
   - Keep all - different versions and designs
   - Add: `ARCHIVE_SAFETY_INDEX.md` as navigation hub

3. **Technical Analysis** (16 docs)
   - Keep all - different perspectives valuable
   - Add: `TECHNICAL_ANALYSIS_INDEX.md` as navigation hub

---

## Maintenance Strategy

### The Real Issues (From Your Feedback)

**Issue 1: Conflicting Information**
**Evidence**: `FINAL_INTEGRATION_STATUS.md` (Sept 18) vs master plan (Oct 1) have different status
**Solution**:
- Master plan = ALWAYS current source of truth
- Other docs = timestamped validation evidence
- Add header to all status docs: "See master plan for current status"

**Issue 2: Unclear Authority**
**Evidence**: 3 "status" docs, unclear which is current
**Solution**:
- ONE authoritative doc per topic: Master plan
- All others labeled as "Historical Validation" or "Technical Reference"
- Add status badges: ✅ Current, 📅 Historical, 🔬 Technical

**Issue 3: Maintenance Burden**
**Evidence**: Updating 87 files when something changes is impossible
**Solution**:
- Only update master plan for status changes
- Technical docs are "frozen" as validation evidence
- Use symlinks/references instead of duplication

### File Status Classification

**CURRENT (Update regularly)**:
- ✅ `claude-code-integration-plan.md` (master)
- ✅ `.claude/settings.json` (config)
- ✅ Hook scripts in `interfaces/claude-bridge/scripts/`

**HISTORICAL (Never update)**:
- 📅 `FINAL_INTEGRATION_STATUS.md` (Sept 18 snapshot)
- 📅 `FUNCTIONAL_MEMORY_BRIDGE_STATUS.md` (Sept 18 snapshot)
- 📅 All SUBAGENT_STOP investigation docs (Oct 1 investigation)

**TECHNICAL (Update only if specs change)**:
- 🔬 Architecture diagrams
- 🔬 ADR documents
- 🔬 Sprint plans

---

## Proposed File Structure

```
docs/integration/
├── README.md                              # 🆕 Navigation Hub (Level 1)
├── CLAUDE_CODE_QUICK_START.md            # 🆕 5-minute guide (Level 1)
├── claude-code-integration-plan.md        # ✅ Master Plan (Level 2) - ENHANCE
├── KNOWN_ISSUES.md                        # 🆕 Common problems (Level 2)
│
├── setup/                                 # Level 3 - Implementation
│   ├── claude-code-integration.md         # Existing setup guide
│   ├── INSTALLATION_GUIDE.md
│   └── unified-workflow-guide.md
│
├── validation/                            # Level 3 - Evidence 📅
│   ├── FINAL_INTEGRATION_STATUS.md        # Historical (Sept 18)
│   ├── FUNCTIONAL_MEMORY_BRIDGE_STATUS.md # Historical (Sept 18)
│   └── TRUSTWRAPPER_INTEGRATION_STATUS.md # Historical (Sept 18)
│
└── technical/                             # Level 4 - Expert Reference
    ├── troubleshooting/
    │   ├── INDEX.md                       # 🆕 Navigation hub
    │   └── subagent-stop/                 # 14 investigation docs
    ├── architecture/
    │   ├── INDEX.md                       # 🆕 Navigation hub
    │   └── [16 analysis docs]
    └── archive-safety/
        ├── INDEX.md                       # 🆕 Navigation hub
        └── [10 safety docs]
```

---

## Implementation Plan

### Phase 1: Create Navigation (Week 1)

**Day 1-2**: Create new Level 1 docs
- [ ] `docs/integration/README.md` - Navigation hub
- [ ] `docs/integration/CLAUDE_CODE_QUICK_START.md` - 5-minute guide
- [ ] `docs/integration/KNOWN_ISSUES.md` - Common problems

**Day 3-4**: Add index files for Level 4 categories
- [ ] `technical/troubleshooting/INDEX.md`
- [ ] `technical/architecture/INDEX.md`
- [ ] `technical/archive-safety/INDEX.md`

**Day 5**: Enhance master plan
- [ ] Add role-based navigation section
- [ ] Compress detailed sections → link to Level 3
- [ ] Add status badges to Related Documentation

### Phase 2: File Classification (Week 2)

**Day 1-2**: Add status headers to all docs
```markdown
**STATUS**: 📅 Historical Evidence (Sept 18, 2025)
**CURRENT INFO**: See [Master Plan](claude-code-integration-plan.md) for current status
```

**Day 3-4**: Organize into subdirectories (validation/, technical/)

**Day 5**: Update all cross-references

### Phase 3: Validation (Week 3)

**Test with different user personas**:
- Developer: "How do I set up hooks?" → Should land on Quick Start
- Troubleshooter: "SubagentStop not firing" → Should find investigation docs
- Manager: "What's the integration status?" → Should find master plan Executive Summary

---

## Success Metrics

### Quantitative
- ✅ Time to first success: <5 minutes (Quick Start guide)
- ✅ Master plan reads: <10 minutes (compressed to 500 words + links)
- ✅ Navigation completeness: 100% docs have clear "return" links
- ✅ Authority clarity: 1 current doc per topic (not 3)

### Qualitative (User Feedback)
- ✅ "I found what I needed quickly"
- ✅ "I knew which doc to trust"
- ✅ "I understood the current status"
- ❌ "I had to read 677 lines to get started" (ELIMINATED)

---

## What We're NOT Doing

### ❌ NOT Consolidating 87 → 30 Files

**Why**: Different files serve different purposes
- SubagentStop investigation = 14 docs documenting a real debug process
- Archive safety = 10 docs showing design evolution
- These are **historical evidence**, not redundant content

### ❌ NOT Deleting Technical Validation Docs

**Why**: They provide evidence for decisions made
- `FINAL_INTEGRATION_STATUS.md` proves Phase 3 completion
- Investigation docs show debugging methodology
- Future developers need this context

### ❌ NOT Rewriting All 87 Files

**Why**: Most are fine as Level 3-4 reference docs
- Only need navigation improvements
- Only need status classification
- Only need better cross-linking

---

## Addressing Your Concerns

### "We don't know if content is conflicting or aligned"

**Solution**:
1. Master plan = single source of truth for current status
2. All other docs timestamped with status badges
3. If conflict exists, master plan wins

### "Which doc is authoritative?"

**Solution**:
```
Level 1 (Quick answers): Quick Start guide
Level 2 (Understanding): Master plan
Level 3 (Implementation): Setup guides
Level 4 (Troubleshooting): Investigation docs
```

### "80+ docs about one topic without clear hierarchy is impossible to manage"

**Solution**:
- NOT one topic - it's: Setup + Validation + Troubleshooting + Design + Investigation
- Create 4-level hierarchy with navigation hubs
- Most docs never need updating (historical evidence)
- Only master plan + config files need regular maintenance

---

## Specialized Agent Recommendation

### ❌ Do NOT Create "ClaudeCodeIntegration" Agent

**Why**:
1. Would create knowledge silo
2. Sets bad precedent (138 agents → each needs specialized sub-agent?)
3. Doesn't solve real problem (documentation hierarchy)

### ✅ DO Use Existing Agent Team

**Responsibilities**:
- **Athena**: Master plan maintenance, navigation architecture
- **Documenter**: Progressive disclosure implementation
- **DirectoryOrganizer**: File structure optimization
- **Architect**: Integration architecture updates
- **Debugger**: Troubleshooting doc maintenance

**Coordination**: Virtual "Claude Code Working Group" (not new agent)

---

## Next Steps

1. **This week**: Create Quick Start guide + navigation hubs
2. **Next week**: Add status badges and organize subdirectories
3. **Week 3**: Validate with user testing
4. **Week 4**: Refine based on feedback

**Estimated effort**: 3-4 weeks
**Maintenance reduction**: 80% (only 5 files need regular updates vs. 87)
**User satisfaction improvement**: 10x (clear entry points, role-based navigation)

---

**Key Insight**: The problem isn't too many files - it's missing navigation. Progressive disclosure solves this without deleting valuable technical evidence.
