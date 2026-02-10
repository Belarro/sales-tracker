# ClaudeCodeIntegrator - Verification Checklist Template

**Purpose**: Ensure every session follows anti-hallucination protocols
**Based on**: Sippar Development Best Practices (Sprint 009 Success)

---

## Pre-Session Checklist

Before starting work each session:

- [ ] Read MEMORY.md to understand current progress
- [ ] Verify progress counter (X of 87 files read)
- [ ] Review last session notes
- [ ] Clear understanding of today's goal (specific files to read)

---

## During File Analysis

For EACH file analyzed:

### File Reading Requirements
- [ ] File read COMPLETELY (not partially)
- [ ] Line count recorded: `wc -l [file]`
- [ ] File size recorded: `ls -lh [file]`
- [ ] Last modified date recorded: `ls -l [file]`
- [ ] Read timestamp recorded: `date`

### Content Documentation
- [ ] Purpose clearly identified (from file content, not assumptions)
- [ ] Status determined (Current/Historical/Outdated) with evidence
- [ ] Dependencies identified with specific references
- [ ] Cross-references cataloged (both incoming and outgoing)
- [ ] Duplicate content noted with LINE NUMBERS
- [ ] Conflicts documented with SPECIFIC QUOTES

### Evidence Requirements
**NEVER say**: "File contains information about X"
**ALWAYS say**: "File contains information about X (lines 45-67, verified 2025-10-02 14:30)"

**NEVER say**: "Files conflict on topic Y"
**ALWAYS say**: "Files conflict on topic Y: file1.md:45 says 'A', file2.md:67 says 'B'"

---

## Session Progress Tracking

Update MEMORY.md with:

### Progress Counter
```markdown
**Files Read**: X of 87 (Y%)
**Categories Complete**: Z of 12
**Last Updated**: [date and time]
```

### Evidence of Work
For each file read today, document:
```markdown
| File | Lines | Size | Modified | Purpose | Status | Dependencies | Conflicts |
|------|-------|------|----------|---------|--------|--------------|-----------|
| file.md | 792 | 25K | 2025-10-01 | Master plan | ✅ Current | All others | None found |
```

### Honest Assessment
```markdown
**Limitations**:
- Only X of 87 files read (cannot claim complete understanding)
- Categories Y and Z not yet analyzed
- Cannot verify cross-references for unread files

**Next Steps Required**:
- Read remaining N files in category Q
- Verify suspected conflict between files A and B
- Update dependency map after reading technical docs
```

---

## Anti-Hallucination Self-Check

Before making ANY claim, ask:

1. **Have I READ this file?**
   - ❌ NO → Do NOT make claims about its content
   - ✅ YES → Provide line numbers and quotes

2. **Is this CURRENT information?**
   - ❌ NO → Mark as "Historical (date)" or "Outdated"
   - ✅ YES → Verify with file modification date

3. **Do I have COMPLETE analysis?**
   - ❌ NO → State percentage complete (e.g., "12 of 87 files read")
   - ✅ YES → Document completion evidence

4. **Are my claims SPECIFIC?**
   - ❌ NO → Add file paths, line numbers, quotes
   - ✅ YES → Proceed with documentation

5. **Can I VERIFY this?**
   - ❌ NO → Mark as "TO BE VERIFIED" or remove claim
   - ✅ YES → Include verification command

---

## Conflict Documentation Template

When conflicts identified:

```markdown
## Conflict: [Topic Name]

### Conflicting Statements
**File 1**: `path/to/file1.md`
- **Line**: 45
- **Quote**: "System is 100% reliable"
- **Date Written**: 2025-09-28 (from git log)

**File 2**: `path/to/file2.md`
- **Line**: 67
- **Quote**: "System does NOT fire for every Task"
- **Date Written**: 2025-10-01 (from git log)

### Root Cause Analysis
- **Symptom**: Contradictory reliability claims
- **Investigation**: Check git history for changes
- **Finding**: Both correct - temporal difference (pre/post Oct 1 fix at 14:57:35)

### Resolution
- **Action**: Add temporal context to both files
- **Authority**: File 2 (most recent, post-fix)
- **Evidence**: git log shows fix commit on 2025-10-01 14:57:35
```

---

## Post-Session Checklist

Before ending session:

### Documentation Updates
- [ ] MEMORY.md updated with today's progress
- [ ] Progress counter incremented accurately
- [ ] New conflicts added to conflicts section
- [ ] Dependencies mapped for files read today
- [ ] Session file created with detailed notes

### Verification
- [ ] All claims have line number references
- [ ] All file sizes/dates recorded
- [ ] All assumptions clearly marked "TO BE VERIFIED"
- [ ] Progress percentage calculated correctly
- [ ] No claims about unread files

### Honest Assessment
- [ ] Acknowledged what was NOT completed
- [ ] Documented remaining gaps in analysis
- [ ] Identified blockers or questions
- [ ] Planned next session goals

---

## Red Flags (Stop and Review)

If you notice yourself doing ANY of these, STOP immediately:

❌ **Describing a file you haven't read**
- Fix: Read the file first, then describe

❌ **Making claims without line numbers**
- Fix: Add specific line references

❌ **Saying "all files" when only some are read**
- Fix: Use exact counts (e.g., "12 of 87 files")

❌ **Assuming file content from filename**
- Fix: Read file to verify actual content

❌ **Moving files without reading them**
- Fix: Read, understand, then propose move

❌ **Claiming complete understanding with <100% files read**
- Fix: Acknowledge gaps, continue reading

---

## Success Criteria Validation

### Phase 1 Complete? (Self-Check)
- [ ] ALL 87 files read thoroughly (not 12, not 50, ALL)
- [ ] Every file has line count, size, date recorded
- [ ] Every file has purpose documented with quotes
- [ ] Every file has status (Current/Historical/Outdated) with evidence
- [ ] Every file has dependencies listed with line references
- [ ] All conflicts documented with specific quotes and line numbers
- [ ] Dependency graph complete and visualized
- [ ] NO assumptions or unverified claims in catalog

**If ANY checkbox is unchecked**: Phase 1 is NOT complete. Continue reading.

---

## Example of GOOD Documentation

```markdown
### File: SUBAGENT_STOP_DEBUG_SUMMARY.md

**Read**: 2025-10-02 15:45
**Location**: Project root (to be moved)
**Stats**: 442 lines, 15KB, last modified 2025-10-01 12:30

**Purpose**: Debug investigation summary for SubagentStop firing inconsistency
**Evidence**: Lines 1-20 contain executive summary and investigation overview

**Status**: ✅ CURRENT (referenced by master plan v3.1)
**Evidence**: Master plan line 722 lists this file as current

**Dependencies**:
- References SUBAGENT_STOP_ROOT_CAUSE_ANALYSIS.md (line 87)
- References session a6e3130d and 4698f087 (lines 25-28)
- Referenced by master plan (line 722)

**Conflicts**:
- CONFLICT with SUBAGENT_STOP_INVESTIGATION_SUMMARY.md:
  - This file (line 32): "SubagentStop does NOT fire for every Task"
  - Other file (line 45): "100% reliability achieved"
  - CAUSE: Temporal - this file post-fix (Oct 1), other pre-fix (Sept 28)

**Duplicate Content**:
- 85% overlap with SUBAGENT_STOP_ROOT_CAUSE_ANALYSIS.md
  - Same evidence (sessions a6e3130d, 4698f087)
  - Same conclusion (lines 89-95 vs other file lines 120-126)
  - Different framing (executive vs technical)

**Recommendation**: Keep both (different audiences) but add temporal note
```

---

**Remember**: Verification-driven development prevents hallucinations. Every claim needs evidence. Every file needs reading. Every percentage needs counting.

**Sprint 009 proved**: Systematic excellence delivers exceptional results ahead of schedule.
