# Archive Safety Hook v2.0 - Step-by-Step Testing Guide

**Purpose**: Test all 6 safety checks to verify hook is working correctly
**Time Required**: 15-20 minutes
**Difficulty**: Easy - Just follow the steps

---

## Pre-Testing Checklist

### Step 1: Verify Hook is Installed

```bash
# Check hook exists
ls -l /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/.claude/hooks/archive-safety.py

# Expected: -rwxr-xr-x (executable permissions)
```

**If file doesn't exist or isn't executable**:
```bash
chmod +x /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/.claude/hooks/archive-safety.py
```

### Step 2: Verify Hook is Configured

```bash
# Check settings.json
grep -A 15 "PreToolUse" /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/.claude/settings.json
```

**Expected output**:
```json
"PreToolUse": [
  {
    "matcher": "Bash",
    "hooks": [
      {
        "type": "command",
        "command": "/Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/.claude/hooks/archive-safety.py",
        "timeout": 10
      }
    ]
  }
]
```

**If not configured**: The hook was already added to settings.json in the implementation.

### Step 3: Create Test Environment

```bash
# Create test directories
mkdir -p /tmp/archive-safety-test/{working,docs,archive}

# Create test files
echo "Test content - temporary file" > /tmp/archive-safety-test/working/temp-file.md

cat > /tmp/archive-safety-test/working/permanent-file.md << 'EOF'
---
permanent_value: yes
report_type: analysis
---

# Important Analysis

This file has permanent value.
EOF

cat > /tmp/archive-safety-test/docs/outdated-guide.md << 'EOF'
---
permanent_value: yes
report_type: guide
---

# Old Guide (Outdated)

This guide is from version 1.0, now outdated.
EOF

# Create multiple files for batch test
echo "File 1" > /tmp/archive-safety-test/working/batch-1.md
echo "File 2" > /tmp/archive-safety-test/working/batch-2.md
echo "File 3" > /tmp/archive-safety-test/working/batch-3.md

# Verify files created
ls -la /tmp/archive-safety-test/working/
ls -la /tmp/archive-safety-test/docs/
```

### Step 4: Open Log File in New Terminal

**Open a second terminal window** and run:
```bash
tail -f /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/.claude/logs/archive-safety.log
```

**Keep this terminal open** - you'll see real-time hook activity.

---

## Test Suite

### Test 1: File Not Read (Should Block)

**Objective**: Verify hook blocks archival of unread files

**Steps**:
1. In Claude Code session, run this command **WITHOUT reading the file first**:

```bash
mv /tmp/archive-safety-test/working/temp-file.md /tmp/archive-safety-test/archive/
```

**Expected Result**: ❌ **BLOCKED**

**Expected Message**:
```
🛡️ **Archive Safety Check Failed**

Cannot archive file without reading its content first.

**File**: `/tmp/archive-safety-test/working/temp-file.md`
**Reason**: File content has not been read in this session

**Action Required**:
1. Use Read tool to review file content
2. Verify the file has no permanent value
3. Confirm archival is appropriate
4. Then retry: `mv /tmp/archive-safety-test/working/temp-file.md /tmp/archive-safety-test/archive/`
```

**In Log Window** (you should see):
```
[2025-10-01 HH:MM:SS] Hook triggered - tool: Bash
[2025-10-01 HH:MM:SS] Bash command: mv /tmp/archive-safety-test/working/temp-file.md /tmp/archive-safety-test/archive/
[2025-10-01 HH:MM:SS] Archive operation detected: ['/tmp/archive-safety-test/working/temp-file.md'] → /tmp/archive-safety-test/archive/
[2025-10-01 HH:MM:SS] BLOCKED: File not read in session - /tmp/archive-safety-test/working/temp-file.md
```

**Verify**: File still exists in working directory
```bash
ls /tmp/archive-safety-test/working/temp-file.md
# Should show: /tmp/archive-safety-test/working/temp-file.md
```

✅ **Test 1 PASSED** if operation was blocked and file wasn't moved.

---

### Test 2: File Read First (Should Allow)

**Objective**: Verify hook allows archival after file is read

**Steps**:
1. Read the file first:

```
Read: /tmp/archive-safety-test/working/temp-file.md
```

2. Now archive it:

```bash
mv /tmp/archive-safety-test/working/temp-file.md /tmp/archive-safety-test/archive/
```

**Expected Result**: ✅ **ALLOWED**

**In Log Window**:
```
[2025-10-01 HH:MM:SS] Archive operation detected
[2025-10-01 HH:MM:SS] ALLOWED: All safety checks passed - /tmp/archive-safety-test/working/temp-file.md
```

**Verify**: File was moved
```bash
ls /tmp/archive-safety-test/archive/temp-file.md
# Should show: /tmp/archive-safety-test/archive/temp-file.md

ls /tmp/archive-safety-test/working/temp-file.md
# Should show: No such file or directory
```

✅ **Test 2 PASSED** if file was successfully moved to archive.

---

### Test 3: Batch Operation (Should Block)

**Objective**: Verify hook blocks batch operations

**Steps**:
1. Read one of the batch files (important - we read one, but try to archive multiple):

```
Read: /tmp/archive-safety-test/working/batch-1.md
```

2. Try to archive all batch files at once:

```bash
mv /tmp/archive-safety-test/working/batch-*.md /tmp/archive-safety-test/archive/
```

**Expected Result**: ❌ **BLOCKED**

**Expected Message**:
```
🛡️ **Archive Safety Check Failed - Batch Operation Detected**

Files must be archived **one at a time** to ensure proper review.

**Detected**: Batch operation with wildcard pattern

**Action Required**:
1. Archive each file individually
2. Read each file before archiving
3. Make conscious decision for each file

**Example Correct Workflow**:
```
Read: working/batch-1.md
mv working/batch-1.md archive/
Read: working/batch-2.md
mv working/batch-2.md archive/
```
```

**Verify**: All batch files still in working directory
```bash
ls /tmp/archive-safety-test/working/batch-*.md
# Should show all 3 files
```

✅ **Test 3 PASSED** if batch operation was blocked.

---

### Test 4: Permanent Value in /working/ (Should Block)

**Objective**: Verify hook blocks archival of permanent value files from /working/

**Steps**:
1. Read the permanent file:

```
Read: /tmp/archive-safety-test/working/permanent-file.md
```

2. Try to archive it:

```bash
mv /tmp/archive-safety-test/working/permanent-file.md /tmp/archive-safety-test/archive/
```

**Expected Result**: ❌ **BLOCKED**

**Expected Message**:
```
🛡️ **Archive Safety Check Failed**

Cannot archive file marked with `permanent_value: yes`

**File**: `/tmp/archive-safety-test/working/permanent-file.md`
**Location**: Not in /docs/ directory
**Metadata**: permanent_value: yes
**Report Type**: analysis

**Files with permanent value should be in `/docs/`, not archived.**

**Action Required**:
1. Move to appropriate `/docs/` location (recommended)

**Example Correct Location**:
```
mv /tmp/archive-safety-test/working/permanent-file.md /tmp/archive-safety-test/docs/reports/analysis.md
```
```

**Verify**: File still in working directory
```bash
ls /tmp/archive-safety-test/working/permanent-file.md
# Should still exist
```

✅ **Test 4 PASSED** if operation was blocked with guidance to move to /docs/.

---

### Test 5: Permanent Value in /docs/ (Should Block Until Metadata Updated)

**Objective**: Verify hook blocks /docs/ permanent files until metadata is updated

**Steps**:

**Part A - Initial Block**:

1. Read the outdated guide:

```
Read: /tmp/archive-safety-test/docs/outdated-guide.md
```

2. Try to archive it:

```bash
mv /tmp/archive-safety-test/docs/outdated-guide.md /tmp/archive-safety-test/archive/
```

**Expected Result**: ❌ **BLOCKED**

**Expected Message**:
```
🛡️ **Archive Safety - Permanent Documentation Review Required**

You are attempting to archive a document from /docs/ with permanent value.

**File**: `/tmp/archive-safety-test/docs/outdated-guide.md`
**Location**: /docs/ directory (permanent documentation)
**Metadata**: permanent_value: yes
**Report Type**: guide

**This is a TRANSITION case** - Document may be outdated.

**Action Required**:
1. **If document is truly outdated**:
   - Update metadata: `permanent_value: no`
   - Add note: why it's no longer permanent
   - Then retry archive operation
```

**Part B - Update Metadata and Retry**:

3. Update the metadata:

```
Edit: /tmp/archive-safety-test/docs/outdated-guide.md
```

Change:
```yaml
permanent_value: yes
```

To:
```yaml
permanent_value: no  # Changed from yes - superseded by v2.0 guide
```

4. Read the file again (to register the change):

```
Read: /tmp/archive-safety-test/docs/outdated-guide.md
```

5. Retry archival:

```bash
mv /tmp/archive-safety-test/docs/outdated-guide.md /tmp/archive-safety-test/archive/
```

**Expected Result**: ✅ **ALLOWED**

**Verify**: File was moved
```bash
ls /tmp/archive-safety-test/archive/outdated-guide.md
# Should exist in archive

ls /tmp/archive-safety-test/docs/outdated-guide.md
# Should not exist (moved)
```

✅ **Test 5 PASSED** if:
- Initial attempt was blocked
- After metadata update, archival succeeded

---

### Test 6: Non-Root Archive Directory (Should Warn but Allow)

**Objective**: Verify hook warns about non-root archive but allows operation

**Steps**:
1. Create non-root archive directory:

```bash
mkdir -p /tmp/archive-safety-test/project/data/archive
echo "Non-root test file" > /tmp/archive-safety-test/working/non-root-test.md
```

2. Read the file:

```
Read: /tmp/archive-safety-test/working/non-root-test.md
```

3. Archive to non-root location:

```bash
mv /tmp/archive-safety-test/working/non-root-test.md /tmp/archive-safety-test/project/data/archive/
```

**Expected Result**: ⚠️ **ALLOWED WITH WARNING**

**Expected Message**:
```
⚠️ **Archive Location Notice**

You are archiving to a non-root archive directory.

**Destination**: `/tmp/archive-safety-test/project/data/archive/`
**Recommended**: Use root-level `/archive/` directory

**Why Use Root Archive?**
- Centralized archival location
- Easier to find archived content
- Consistent with project standards

Operation allowed, but consider using root-level archive.
```

**Verify**: File was moved (despite warning)
```bash
ls /tmp/archive-safety-test/project/data/archive/non-root-test.md
# Should exist
```

✅ **Test 6 PASSED** if operation succeeded with warning message.

---

### Test 7: Agent Delegation (Advanced)

**Objective**: Verify hook detects and blocks non-DirectoryOrganizer archival

**Note**: This test is harder to perform because it requires activating a different agent.

**Simplified Test**:

The hook checks the transcript for agent identification. In a real scenario:

1. If you activate Analyst agent
2. Analyst attempts: `mv file.md archive/`
3. Hook should detect "Analyst" and block

**For now**: This test can be validated through code review or will be tested in production use.

**Manual verification**:
```bash
# Check the agent detection logic exists
grep -A 10 "detect_active_agent" /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/.claude/hooks/archive-safety.py
```

---

## Test Results Summary

Record your results:

```
[ ] Test 1: File Not Read - BLOCKED ✅
[ ] Test 2: File Read First - ALLOWED ✅
[ ] Test 3: Batch Operation - BLOCKED ✅
[ ] Test 4: Permanent Value /working/ - BLOCKED ✅
[ ] Test 5: Permanent Value /docs/ - BLOCKED then ALLOWED ✅
[ ] Test 6: Non-Root Archive - WARNING but ALLOWED ✅
[ ] Test 7: Agent Delegation - (Production test) 🔄
```

---

## Troubleshooting

### Issue: Hook Not Triggering

**Symptom**: Commands execute without any messages from hook

**Check 1**: Is hook configured?
```bash
grep -A 10 "PreToolUse" /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/.claude/settings.json
```

**Check 2**: Is hook executable?
```bash
ls -l /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/.claude/hooks/archive-safety.py
# Should show: -rwxr-xr-x
```

**Check 3**: Test hook manually
```bash
echo '{"tool_name":"Bash","tool_input":{"command":"mv test.md archive/"},"transcript_path":"/dev/null"}' | \
  /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/.claude/hooks/archive-safety.py
```

**Expected**: Should output JSON with permissionDecision

**Fix**:
```bash
chmod +x /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/.claude/hooks/archive-safety.py
```

### Issue: Hook Blocking Everything

**Symptom**: All Bash commands blocked, not just archives

**Check logs**:
```bash
tail -50 /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/.claude/logs/archive-safety.log
```

**Look for**: ERROR messages or unexpected BLOCKED messages

**Temporary Fix**: Disable hook
```bash
# Edit settings.json and comment out PreToolUse section
# Then restart Claude Code
```

### Issue: False Positives (Wrong Blocks)

**Symptom**: Legitimate archives getting blocked

**Debug**:
1. Check what hook detected:
```bash
grep "BLOCKED" /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/.claude/logs/archive-safety.log | tail -5
```

2. Verify file was read:
```bash
# Check transcript for Read operation
grep -A 5 '"name": "Read"' /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/.claude/session/transcript-*.json | grep "file_path"
```

**Common Causes**:
- File path mismatch (relative vs absolute)
- File read in different session
- Metadata parsing issue

### Issue: Hook Timing Out

**Symptom**: Hook killed after 10 seconds

**Check logs**:
```bash
grep "timeout" /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/.claude/logs/archive-safety.log
```

**Fix**: Increase timeout in settings.json:
```json
"timeout": 30  // Changed from 10
```

---

## Cleanup After Testing

```bash
# Remove test directory
rm -rf /tmp/archive-safety-test

# Clear test logs (optional)
> /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/.claude/logs/archive-safety.log
```

---

## Next Steps After Testing

### If All Tests Pass ✅

**Hook is production-ready!**

1. **Document results**: Note any observations
2. **Monitor in production**: Watch for real-world issues
3. **Gather feedback**: Collect user experiences
4. **Update if needed**: Refine based on production use

### If Tests Fail ❌

1. **Document failures**: Note which tests failed and error messages
2. **Check logs**: Review archive-safety.log for details
3. **Debug**: Use troubleshooting section
4. **Report issue**: Add findings to CONTINUOUS_LEARNING.md
5. **Fix and retest**: Address issues and run tests again

---

## Quick Test (1 Minute)

**If you just want to verify hook is working**:

```bash
# 1. Create test file
echo "Quick test" > /tmp/quick-test.md
mkdir -p /tmp/archive

# 2. Try to archive WITHOUT reading
mv /tmp/quick-test.md /tmp/archive/
# Expected: BLOCKED ❌

# 3. Read first
Read: /tmp/quick-test.md

# 4. Try to archive again
mv /tmp/quick-test.md /tmp/archive/
# Expected: ALLOWED ✅

# 5. Cleanup
rm -rf /tmp/quick-test.md /tmp/archive
```

If step 2 blocks and step 4 allows → **Hook is working!**

---

**Testing Guide Version**: 1.0
**Created**: 2025-10-01
**Estimated Time**: 15-20 minutes for full test suite
**Difficulty**: Easy - Just follow the steps
