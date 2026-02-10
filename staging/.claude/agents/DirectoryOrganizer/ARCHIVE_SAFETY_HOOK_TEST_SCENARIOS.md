# Archive Safety Hook - Test Scenarios

**Purpose**: Validate that the archive-safety.py hook correctly prevents unsafe archival operations

**Hook**: `.claude/hooks/archive-safety.py`
**Configuration**: `.claude/settings.json` (PreToolUse → Bash)

---

## Test Scenario 1: Block Archive Without Reading

**Objective**: Verify hook blocks archival of unread files

**Setup**:
```bash
# Create test file in working directory
mkdir -p /tmp/test-archive-safety/working
echo "Important content here" > /tmp/test-archive-safety/working/test-report.md
```

**Test Steps**:
1. Start new Claude Code session
2. **Without reading the file**, attempt to archive:
   ```bash
   mv /tmp/test-archive-safety/working/test-report.md /tmp/test-archive-safety/archive/
   ```

**Expected Result**:
- ❌ Operation BLOCKED
- Message: "Cannot archive file without reading its content first"
- Guidance: "Use Read tool to review file content"

**Pass Criteria**: Hook blocks operation with clear message

---

## Test Scenario 2: Allow Archive After Reading

**Objective**: Verify hook allows archival after file is read

**Setup**:
```bash
# Use same test file from Scenario 1
# OR create new one
echo "Test content" > /tmp/test-archive-safety/working/test-report-2.md
```

**Test Steps**:
1. Read the file first:
   ```
   Read: /tmp/test-archive-safety/working/test-report-2.md
   ```
2. Then attempt to archive:
   ```bash
   mv /tmp/test-archive-safety/working/test-report-2.md /tmp/test-archive-safety/archive/
   ```

**Expected Result**:
- ✅ Operation ALLOWED
- File successfully moved to archive
- Log entry created

**Pass Criteria**: Hook allows operation after file read

---

## Test Scenario 3: Block Permanent Value Files

**Objective**: Verify hook blocks archival of files with permanent_value: yes

**Setup**:
```bash
# Create file with permanent_value metadata
cat > /tmp/test-archive-safety/working/permanent-doc.md << 'EOF'
---
report_type: analysis
status: final
permanent_value: yes
created: 2025-10-01
author: Test
---

# Important Analysis

This document has permanent reference value.
EOF
```

**Test Steps**:
1. Read the file:
   ```
   Read: /tmp/test-archive-safety/working/permanent-doc.md
   ```
2. Attempt to archive:
   ```bash
   mv /tmp/test-archive-safety/working/permanent-doc.md /tmp/test-archive-safety/archive/
   ```

**Expected Result**:
- ❌ Operation BLOCKED
- Message: "Cannot archive file marked with permanent_value: yes"
- Guidance: "Move to appropriate /docs/ location"

**Pass Criteria**: Hook blocks operation regardless of read status

---

## Test Scenario 4: Allow Non-Permanent Files

**Objective**: Verify hook allows archival of files with permanent_value: no

**Setup**:
```bash
# Create file with permanent_value: no
cat > /tmp/test-archive-safety/working/temporary-status.md << 'EOF'
---
report_type: status
status: final
permanent_value: no
created: 2025-10-01
author: Test
---

# Weekly Status Report

Temporary status information.
EOF
```

**Test Steps**:
1. Read the file:
   ```
   Read: /tmp/test-archive-safety/working/temporary-status.md
   ```
2. Attempt to archive:
   ```bash
   mv /tmp/test-archive-safety/working/temporary-status.md /tmp/test-archive-safety/archive/
   ```

**Expected Result**:
- ✅ Operation ALLOWED
- File successfully archived

**Pass Criteria**: Hook allows archival of non-permanent content

---

## Test Scenario 5: Warn on Critical Location

**Objective**: Verify hook warns but allows archival from critical locations

**Setup**:
```bash
# Create test docs structure
mkdir -p /tmp/test-archive-safety/docs/guides
cat > /tmp/test-archive-safety/docs/guides/old-guide.md << 'EOF'
---
permanent_value: no
---

# Old Guide (Outdated)

This guide is outdated and being archived.
EOF
```

**Test Steps**:
1. Read the file:
   ```
   Read: /tmp/test-archive-safety/docs/guides/old-guide.md
   ```
2. Attempt to archive:
   ```bash
   mv /tmp/test-archive-safety/docs/guides/old-guide.md /tmp/test-archive-safety/archive/
   ```

**Expected Result**:
- ✅ Operation ALLOWED (with warning)
- Message: "⚠️ Critical File Archive Detected"
- Warning: "Critical files should rarely be archived"

**Pass Criteria**: Hook allows but logs prominent warning

---

## Test Scenario 6: Non-Archive Operations Unaffected

**Objective**: Verify hook doesn't interfere with non-archive operations

**Test Steps**:
1. Move file within working directory:
   ```bash
   mv /tmp/test-archive-safety/working/file1.md /tmp/test-archive-safety/working/file2.md
   ```
2. Move file from working to docs:
   ```bash
   mv /tmp/test-archive-safety/working/promoted.md /tmp/test-archive-safety/docs/
   ```
3. Copy file to non-archive location:
   ```bash
   cp /tmp/test-archive-safety/working/draft.md /tmp/test-archive-safety/working/draft-copy.md
   ```

**Expected Result**:
- ✅ All operations pass through without hook intervention
- No safety checks triggered

**Pass Criteria**: Hook only activates for archive operations

---

## Test Scenario 7: Pattern Variations

**Objective**: Verify hook recognizes various archive directory patterns

**Test Cases**:

```bash
# Pattern 1: /archive/
mv file.md /path/to/archive/file.md         # Should trigger

# Pattern 2: /archived/
mv file.md /path/to/archived/file.md        # Should trigger

# Pattern 3: /_archived/
mv file.md /path/to/_archived/file.md       # Should trigger

# Pattern 4: Windows path
mv file.md C:\path\archive\file.md          # Should trigger

# Pattern 5: Not archive (should NOT trigger)
mv file.md /archives-project/file.md        # Should NOT trigger (archives in name only)
mv file.md /working/file.md                 # Should NOT trigger
```

**Expected Result**:
- Hook triggers for archive directory patterns
- Hook ignores non-archive operations

**Pass Criteria**: Correct pattern matching

---

## Test Scenario 8: Error Handling

**Objective**: Verify hook fails open on errors

**Test Cases**:

1. **Malformed transcript JSON**:
   - Expected: Hook allows operation (fail open)

2. **Missing transcript file**:
   - Expected: Hook allows operation

3. **Unreadable source file**:
   - Expected: Hook allows operation or provides clear error

4. **Permission errors**:
   - Expected: Hook doesn't crash, logs error

**Pass Criteria**: Hook never crashes Claude Code session

---

## Manual Testing Checklist

### Pre-Test Setup
```
[ ] Clone test directory structure
[ ] Verify hook is executable (chmod +x)
[ ] Verify hook is configured in .claude/settings.json
[ ] Start fresh Claude Code session
[ ] Clear .claude/logs/archive-safety.log
```

### During Tests
```
[ ] Run each scenario sequentially
[ ] Document actual results
[ ] Check log file after each test
[ ] Verify operation outcome (file location)
[ ] Record any unexpected behavior
```

### Post-Test Validation
```
[ ] Review all log entries
[ ] Verify no crashes or errors
[ ] Confirm expected blocks occurred
[ ] Confirm expected allows occurred
[ ] Document any edge cases discovered
```

---

## Integration Test

**Objective**: Validate hook in real DirectoryOrganizer workflow

**Scenario**: Sprint completion cleanup

1. Agent creates sprint completion report
2. Report saved to `/working/reports/sprint-completion-draft.md`
3. Analyst reviews and updates metadata:
   ```yaml
   permanent_value: yes
   ```
4. DirectoryOrganizer attempts to organize:
   - **Without reading**: Should BLOCK
   - **After reading**: Should recognize permanent_value and suggest `/docs/development/sprints/`
5. User corrects metadata to `permanent_value: no`
6. DirectoryOrganizer archives after reading: Should ALLOW

**Expected Workflow**:
```
Create → Draft → Review → Metadata Update → Read → Archive Decision → Move
         ↓                                    ↓
     /working/                           Safety Check
                                              ↓
                                    Permanent? → /docs/
                                    Temporary? → /archive/
```

---

## Performance Tests

### Response Time
- Hook should complete in < 100ms
- Timeout set to 10 seconds (safety margin)

### Log File Growth
- Monitor `.claude/logs/archive-safety.log`
- Should not exceed 10MB in normal usage
- Implement log rotation if needed

### Session Impact
- Hook should not slow down non-archive operations
- Verify other Bash commands unaffected

---

## Debugging

### Enable Verbose Logging

Add to hook script (line 15):
```python
import sys
sys.stderr.write(f"DEBUG: {message}\n")
```

### Check Hook Execution

```bash
# Verify hook is being called
tail -f /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/.claude/logs/archive-safety.log
```

### Manual Hook Test

```bash
# Test hook directly with sample input
echo '{
  "tool_name": "Bash",
  "tool_input": {"command": "mv test.md archive/"},
  "transcript_path": "/path/to/transcript.json"
}' | /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/.claude/hooks/archive-safety.py
```

---

## Success Criteria

**Hook is production-ready when**:

- ✅ All 8 test scenarios pass
- ✅ No false positives (legitimate archives blocked)
- ✅ No false negatives (unsafe archives allowed)
- ✅ Clear, actionable user messages
- ✅ Graceful error handling
- ✅ Acceptable performance (< 100ms)
- ✅ Integration test passes
- ✅ Documentation complete

---

**Test Plan Version**: 1.0
**Created**: 2025-10-01
**Author**: DirectoryOrganizer + Developer
**Next Review**: After 2 weeks of production use
