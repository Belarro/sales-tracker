# Phase 6: Safe File Reorganization Plan

**Generated**: 2025-10-03
**Status**: READY FOR REVIEW
**Risk Level**: LOW (minimal moves, all with git history preservation)

---

## Executive Summary

**Recommendation**: **MINIMAL REORGANIZATION** - Current structure is functional and well-organized.

**Primary Actions**:
1. Create new progressive disclosure index (NEW file, no moves)
2. Update 3 outdated documents (content updates, NOT moves)
3. Archive 4 completed documents (with git history preservation)
4. No structural changes to current directory organization

---

## Part 1: New File Creation (NO MOVES)

### Action 1.1: Create Progressive Disclosure Index

**File**: `docs/integration/CLAUDE_CODE_DOCUMENTATION_INDEX.md`
**Type**: NEW file creation
**Purpose**: Replace `CLAUDE_CODE_DOCUMENTATION_COMPREHENSIVE_INVENTORY.md` with accurate navigation

**Content Structure**:
```markdown
# Claude Code Documentation Index

## Level 1: Quick Start (2-5 minutes)
- Quick access to get running
- 3 essential files

## Level 2: Installation & Setup (15-30 minutes)
- Complete setup guide
- 5 key files

## Level 3: User Guides & Workflows (1-2 hours)
- Feature mastery
- Organized by category

## Level 4: Architecture & Deep Dive (4+ hours)
- Complete system understanding
- For architects and contributors
```

**Source**: `progressive_disclosure_hierarchy.json` lines 10-558

**Git Commands**:
```bash
# No git commands needed - new file creation
# Will be added to git in next commit
```

---

## Part 2: Content Updates (NO MOVES)

### Action 2.1: Fix Critical Inventory File

**File**: `CLAUDE_CODE_DOCUMENTATION_COMPREHENSIVE_INVENTORY.md`
**Type**: Content update OR deprecation
**Severity**: CRITICAL
**Issue**: Contains hallucinated file counts and versions

**Specific Corrections Needed**:
1. Master plan: Claims v3.1 (792 lines) → Actual v2.0 (355 lines)
2. Archive safety: Claims 10 files → Actual 5 files
3. SubagentStop: Claims 14 files → Already corrected to 4 files

**Evidence**: `conflicts_analysis.json` lines 11-69

**Recommended Action**: **DEPRECATE** in favor of new index
```markdown
# DEPRECATED

This inventory has been superseded by:
- docs/integration/CLAUDE_CODE_DOCUMENTATION_INDEX.md (progressive disclosure index)
- AGENTS/ClaudeCodeIntegrator/file_catalog.json (complete catalog with evidence)

Archived: 2025-10-03
Reason: Contains outdated counts and hallucinated information
```

**Git Commands**:
```bash
# Option 1: Update content (if keeping)
git add CLAUDE_CODE_DOCUMENTATION_COMPREHENSIVE_INVENTORY.md
git commit -m "fix: correct hallucinated file counts in inventory"

# Option 2: Deprecate (recommended)
git add CLAUDE_CODE_DOCUMENTATION_COMPREHENSIVE_INVENTORY.md
git commit -m "docs: deprecate inventory in favor of progressive disclosure index"
```

---

### Action 2.2: Update Integration Status

**File**: `docs/integration/FINAL_INTEGRATION_STATUS.md`
**Type**: Content update
**Severity**: HIGH
**Issue**: Claims "85% complete, TrustWrapper pending" but TrustWrapper operational since Sep 15/18

**Evidence**:
- `document_status_classification.json` lines 526-537
- `conflicts_analysis.json` lines 138-169

**Correction Needed**:
```markdown
## Current Status: 95% Complete

### ✅ Completed Components
- Memory unification via symlinks (Sep 30, 2025)
- Hook system migration (Oct 1, 2025)
- SubagentStop reliability (100% - Oct 1, 2025)
- TrustWrapper integration (OPERATIONAL - Sep 18, 2025)
- Agent-driven memory system (96% noise reduction)

### ⏳ Remaining Work
- [Specify what the remaining 5% is]
```

**Git Commands**:
```bash
git add docs/integration/FINAL_INTEGRATION_STATUS.md
git commit -m "docs: update integration status - TrustWrapper operational"
```

---

### Action 2.3: Update Installation Guide

**File**: `docs/integration/CLAUDE_CODE_INSTALLATION_GUIDE.md`
**Type**: Content update
**Severity**: MEDIUM
**Issue**: Pre-dates symlink architecture (Sep 30) and hook updates (Oct 1)

**Evidence**: `document_status_classification.json` lines 551-562

**Updates Needed**:
1. Add symlink architecture section (from ADR-001)
2. Update hook configuration to new array format
3. Reference new CLAUDE_CODE_DOCUMENTATION_INDEX.md

**Git Commands**:
```bash
git add docs/integration/CLAUDE_CODE_INSTALLATION_GUIDE.md
git commit -m "docs: update installation guide with symlink architecture and new hook format"
```

---

## Part 3: Archive Completed Documents (WITH GIT HISTORY)

### Action 3.1: Archive Integration Visual Diagram

**File**: `INTEGRATION_VISUAL_DIAGRAM.md` (root)
**Destination**: `archive/integration/INTEGRATION_VISUAL_DIAGRAM.md`
**Reason**: Before/after visual - problem resolved (Sep 30)
**Status**: HISTORICAL
**Evidence**: `document_status_classification.json` lines 402-412

**Git Commands**:
```bash
# Ensure archive directory exists
mkdir -p archive/integration

# Move with git to preserve history
git mv INTEGRATION_VISUAL_DIAGRAM.md archive/integration/

# Commit
git commit -m "archive: move INTEGRATION_VISUAL_DIAGRAM.md - problem resolved Sep 30"
```

---

### Action 3.2: Archive Executive Summary

**File**: `INTEGRATION_EXECUTIVE_SUMMARY.md` (root)
**Destination**: `archive/integration/INTEGRATION_EXECUTIVE_SUMMARY.md`
**Reason**: Resolution record (Sep 30) - historical value only
**Status**: HISTORICAL
**Evidence**: `document_status_classification.json` lines 390-401

**Git Commands**:
```bash
# Move with git to preserve history
git mv INTEGRATION_EXECUTIVE_SUMMARY.md archive/integration/

# Commit
git commit -m "archive: move INTEGRATION_EXECUTIVE_SUMMARY.md - historical resolution record"
```

---

### Action 3.3: Archive Functional Memory Bridge Status

**File**: `docs/integration/FUNCTIONAL_MEMORY_BRIDGE_STATUS.md`
**Destination**: `archive/integration/FUNCTIONAL_MEMORY_BRIDGE_STATUS.md`
**Reason**: Bridge approach superseded by symlink architecture
**Status**: OUTDATED - architectural evolution
**Evidence**: `document_status_classification.json` lines 563-575

**Git Commands**:
```bash
# Move with git to preserve history
git mv docs/integration/FUNCTIONAL_MEMORY_BRIDGE_STATUS.md archive/integration/

# Commit
git commit -m "archive: move FUNCTIONAL_MEMORY_BRIDGE_STATUS.md - superseded by symlink architecture"
```

---

### Action 3.4: Evaluate Quick Fix Guide (DECISION NEEDED)

**File**: `QUICK_FIX_GUIDE.md` (root)
**Options**:
1. Move to `docs/guides/QUICK_FIX_GUIDE.md` (if still current)
2. Move to `archive/fixes/QUICK_FIX_GUIDE.md` (if historical)

**Evidence**: `progressive_disclosure_hierarchy.json` lines 114-123

**Decision Criteria**:
- Is the 30-minute memory divergence fix still needed?
- Has symlink architecture (Sep 30) eliminated this issue?

**Recommended**: Keep in Level 2 (Installation) if still relevant for troubleshooting

**Git Commands** (if moving to docs/guides):
```bash
git mv QUICK_FIX_GUIDE.md docs/guides/

git commit -m "docs: move QUICK_FIX_GUIDE.md to guides for better discoverability"
```

---

## Part 4: Future Archive Candidates (NOT NOW)

**Recommendation**: Wait 2-3 months before archiving these

### Root-Level Fix Documents (Oct 1-2, 2025)
All are HISTORICAL but recent - keep accessible for now:

1. `HOOK_FIX_COMPLETE.md` (Oct 1)
2. `HOOK_CONFIGURATION_FIX_SUMMARY.md` (Oct 1)
3. `SESSION_FILE_CREATION_FIX_COMPLETE.md` (Oct 1)
4. `ARCHIVE_SAFETY_JSONL_FIX.md` (Oct 2)
5. `ARCHIVE_HOOK_UX_FIXES.md` (Oct 2)

**Future Action** (after 3 months):
```bash
# Create fix archive directory
mkdir -p archive/fixes-oct-2025

# Move all fix documents
git mv HOOK_FIX_COMPLETE.md archive/fixes-oct-2025/
git mv HOOK_CONFIGURATION_FIX_SUMMARY.md archive/fixes-oct-2025/
git mv SESSION_FILE_CREATION_FIX_COMPLETE.md archive/fixes-oct-2025/
git mv ARCHIVE_SAFETY_JSONL_FIX.md archive/fixes-oct-2025/
git mv ARCHIVE_HOOK_UX_FIXES.md archive/fixes-oct-2025/

git commit -m "archive: move Oct 2025 fix documents to archive after 3 months"
```

---

## Part 5: NO MOVES NEEDED

### Well-Organized Directories (KEEP AS-IS)

**docs/architecture/**
- ✅ Well-organized
- ✅ Clear purpose
- ✅ decisions/ subdirectory for ADRs
- **Action**: NONE

**docs/development/sprints/**
- ✅ Chronological organization
- ✅ Clear sprint separation
- ✅ Valuable historical records
- **Action**: NONE (archive much later, if ever)

**docs/guides/**
- ✅ User-facing documentation
- ✅ Clear organization
- ✅ Referenced in progressive disclosure
- **Action**: NONE

**docs/cli/**
- ✅ CLI-specific documentation
- ✅ Well-scoped
- **Action**: NONE

**docs/integration/**
- ✅ Integration documentation hub
- ✅ Logical grouping
- **Action**: Add index, archive 1 file (see Part 3.3)

**docs/archive-safety/**
- ✅ Dedicated directory for archive safety evolution
- ✅ v3.2 Final design clearly marked
- **Action**: NONE

**AGENTS/[Agent]/Sessions/**
- ✅ Agent-specific session logs
- ✅ Proper separation by agent and date
- **Action**: NONE

---

## Part 6: Cross-Reference Validation

### Files Affected by Moves

**After Action 3.1** (INTEGRATION_VISUAL_DIAGRAM.md):
```bash
# Search for references
grep -r "INTEGRATION_VISUAL_DIAGRAM.md" --include="*.md" .
```

**Expected References**: Few or none (recent, localized document)

**If references found**: Update to new path `archive/integration/INTEGRATION_VISUAL_DIAGRAM.md`

---

**After Action 3.2** (INTEGRATION_EXECUTIVE_SUMMARY.md):
```bash
# Search for references
grep -r "INTEGRATION_EXECUTIVE_SUMMARY.md" --include="*.md" .
```

**Expected References**: Possibly in dependency maps or summaries

**If references found**: Update or add note "See archive/integration/ for historical record"

---

**After Action 3.3** (FUNCTIONAL_MEMORY_BRIDGE_STATUS.md):
```bash
# Search for references
grep -r "FUNCTIONAL_MEMORY_BRIDGE_STATUS.md" --include="*.md" .
```

**Expected References**: May be in integration guides or progress docs

**If references found**: Update with note "Superseded by symlink architecture - see ADR-001"

---

## Part 7: Rollback Procedures

### Rollback for Archived Files

**If archive was a mistake**:
```bash
# Example: Restore INTEGRATION_VISUAL_DIAGRAM.md
git mv archive/integration/INTEGRATION_VISUAL_DIAGRAM.md .

git commit -m "Revert: restore INTEGRATION_VISUAL_DIAGRAM.md from archive"
```

**Git history is preserved** - all moves use `git mv` which maintains full history

---

### Rollback for Content Updates

**If content update was incorrect**:
```bash
# Revert to previous version
git log -- [file_path]  # Find commit hash
git checkout [commit_hash] -- [file_path]

git commit -m "Revert: restore previous version of [file]"
```

---

### Rollback for New Files

**If new index needs removal**:
```bash
# Remove new index file
git rm docs/integration/CLAUDE_CODE_DOCUMENTATION_INDEX.md

git commit -m "Revert: remove progressive disclosure index"
```

---

## Part 8: Execution Order

### Phase 6A: Preparation (READ ONLY)
1. Review this plan
2. Validate all file paths exist
3. Check for unexpected references
4. **STOP FOR APPROVAL**

### Phase 6B: New Files (SAFE - no git history impact)
1. Create `docs/integration/CLAUDE_CODE_DOCUMENTATION_INDEX.md`
2. Commit new file
3. Validate accessibility

### Phase 6C: Content Updates (SAFE - git tracks changes)
1. Update/deprecate `CLAUDE_CODE_DOCUMENTATION_COMPREHENSIVE_INVENTORY.md`
2. Update `docs/integration/FINAL_INTEGRATION_STATUS.md`
3. Update `docs/integration/CLAUDE_CODE_INSTALLATION_GUIDE.md`
4. Commit all updates
5. Validate content accuracy

### Phase 6D: Archive Moves (SAFE - git mv preserves history)
1. Create `archive/integration/` directory
2. `git mv INTEGRATION_VISUAL_DIAGRAM.md archive/integration/`
3. `git mv INTEGRATION_EXECUTIVE_SUMMARY.md archive/integration/`
4. `git mv docs/integration/FUNCTIONAL_MEMORY_BRIDGE_STATUS.md archive/integration/`
5. Decide on `QUICK_FIX_GUIDE.md` - move or keep
6. Commit all moves
7. Search and update cross-references

### Phase 6E: Validation
1. Run cross-reference search
2. Update any broken links
3. Verify archive directory accessible
4. Validate progressive disclosure index links

---

## Part 9: Success Criteria

### Completion Checklist

- [ ] Progressive disclosure index created and accessible
- [ ] Inventory file corrected or deprecated
- [ ] Integration status reflects current state (TrustWrapper operational)
- [ ] Installation guide updated with symlink architecture
- [ ] 4 completed documents archived with git history preserved
- [ ] All cross-references validated and updated
- [ ] No broken links
- [ ] Git history intact for all moved files
- [ ] Rollback procedures documented and tested

---

## Part 10: Risk Assessment

### Risk Level: LOW

**Why LOW risk**:
1. **Minimal moves**: Only 3-4 files archived
2. **Git history preserved**: All moves use `git mv`
3. **No structural changes**: Existing directory organization untouched
4. **Reversible**: All actions can be rolled back
5. **Low reference count**: Archived files likely have few references

**Potential Issues**:
- Broken cross-references (mitigated by validation step)
- User confusion about archived files (mitigated by clear archive structure)

**Mitigation**:
- Cross-reference validation before and after
- Clear commit messages
- Rollback procedures documented
- User communication about new index

---

## Part 11: Alternative Approach (MINIMAL)

**If ZERO risk preferred**:

### Option: NO MOVES, INDEX ONLY

1. Create `docs/integration/CLAUDE_CODE_DOCUMENTATION_INDEX.md` (NEW)
2. Update 3 outdated documents (content only)
3. Mark completed documents as "HISTORICAL" in headers
4. **Do NOT move any files**

**Pros**:
- Zero risk of broken references
- No git history concerns
- Immediate value from index

**Cons**:
- Root directory remains cluttered
- Historical documents mixed with current

---

## Recommendation

**EXECUTE Phase 6B and 6C immediately** (new index + content updates):
- NEW file creation: `docs/integration/CLAUDE_CODE_DOCUMENTATION_INDEX.md`
- Content updates: 3 files corrected
- **Zero risk** - no files moved

**DEFER Phase 6D for user approval** (archive moves):
- 3-4 files to archive
- LOW risk but requires approval
- Can be done anytime after index creation

**DEFER Phase 6D completely** (future archive candidates):
- Wait 3 months for Oct 2025 fix documents
- Re-evaluate relevance before archiving

---

## Next Steps

**Awaiting User Decision**:
1. Approve new index creation? (Phase 6B)
2. Approve content updates? (Phase 6C)
3. Approve archive moves? (Phase 6D) OR defer
4. Approve alternative minimal approach? (index + updates only)

**Current Status**: Plan ready, awaiting approval to execute
