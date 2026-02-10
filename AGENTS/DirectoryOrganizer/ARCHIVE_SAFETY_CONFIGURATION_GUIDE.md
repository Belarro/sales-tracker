# Archive Safety Hook - Configuration Guide

**Version**: 2.0
**Last Updated**: 2025-10-01
**Purpose**: Explain how the archive safety system is configured and how it works

---

## What is the Archive Safety System?

The Archive Safety System is an **automated protection layer** that prevents accidental archival of important files. It runs **before** any archive operation executes, checking safety rules and blocking unsafe operations.

### How It Works

```
You type: mv working/report.md archive/
           ↓
[Claude Code sees Bash command]
           ↓
[PreToolUse Hook Triggered] ← Archive Safety activates HERE
           ↓
[Safety Checks Run (Python script)]
           ↓
[Decision: Allow or Block]
           ↓
You see: "✅ Operation allowed" OR "🛡️ Operation blocked"
           ↓
[If allowed, command executes]
```

**Key Point**: The hook runs **BEFORE** the file is moved. If it blocks, the file never moves.

---

## Configuration File: `.claude/settings.json`

### What is `.claude/settings.json`?

This file tells Claude Code what hooks to run and when. It's like a list of "watchers" that monitor your actions.

**Location**: `/Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/.claude/settings.json`

### Archive Safety Hook Configuration

Here's the relevant section:

```json
{
  "hooks": {
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
  }
}
```

### Configuration Explanation (Line by Line)

```json
"PreToolUse": [
```
**Meaning**: Run hooks **BEFORE** a tool is used
**Why**: We want to check safety **before** files are moved

```json
"matcher": "Bash",
```
**Meaning**: Only run this hook when the `Bash` tool is used
**Why**: Archive operations use Bash commands (`mv`, `cp`)
**What this matches**: Any command run through Claude Code's Bash tool

```json
"type": "command",
```
**Meaning**: Run an external program (not JavaScript)
**Why**: Our hook is a Python script

```json
"command": "/path/to/archive-safety.py",
```
**Meaning**: The full path to our hook script
**Why**: Claude Code needs to know where the script is
**Your Path**: Adjust this to match your system

```json
"timeout": 10
```
**Meaning**: Hook has 10 seconds to respond
**Why**: Safety checks should be fast, but we allow generous time
**What happens if timeout**: Hook is killed, operation is allowed (fail-open)

---

## How the Hook Gets Information

### Input (What the Hook Receives)

When you run a Bash command, Claude Code sends this JSON to the hook:

```json
{
  "tool_name": "Bash",
  "tool_input": {
    "command": "mv working/report.md archive/",
    "description": "Archive report"
  },
  "transcript_path": "/path/to/session-transcript.json",
  "session_id": "abc123..."
}
```

**The hook reads this from `stdin`** (standard input).

### What the Hook Does With It

1. **Extracts the command**: `mv working/report.md archive/`
2. **Parses it**: Operation=mv, Source=working/report.md, Dest=archive/
3. **Checks if destination is archive**: Yes → Continue checks
4. **Reads transcript**: Opens session-transcript.json
5. **Searches for Read operations**: Was `working/report.md` read?
6. **Reads file metadata**: Opens `working/report.md` and checks YAML frontmatter
7. **Makes decision**: Allow or Block

### Output (What the Hook Returns)

**If Blocking**:
```json
{
  "hookSpecificOutput": {
    "permissionDecision": "deny",
    "permissionDecisionReason": "🛡️ **Archive Safety Check Failed**\n\nCannot archive file without reading it first..."
  }
}
```

**If Allowing**:
The hook exits with code `0` (success) and no JSON output.

**The hook writes this to `stdout`** (standard output), which Claude Code reads.

---

## The Session Transcript

### What is the Transcript?

The transcript is a **JSON file** that records everything in your conversation with Claude Code:
- Your messages
- Claude's responses
- Tool uses (Read, Write, Bash, etc.)
- Tool results

**Location Example**: `.claude/session/transcript-2025-10-01-14-30-00.json`

### Why the Hook Needs It

The hook reads the transcript to check:
- ✅ **Which files were read** → Safety Rule #1
- ✅ **Which agent is active** → Safety Rule #5 (delegation)
- ✅ **Context of the operation** → Better decision making

### Example Transcript Snippet

```json
{
  "messages": [
    {
      "role": "assistant",
      "content": [
        {
          "type": "tool_use",
          "name": "Read",
          "input": {
            "file_path": "/path/to/working/report.md"
          }
        }
      ]
    }
  ]
}
```

**The hook searches for**: `"name": "Read"` entries and extracts `file_path`.

---

## Safety Rules (v2.0)

### Rule 1: One-By-One Archival

**Check**: Is this a batch operation?

```bash
# ❌ BLOCKED - Batch operation
mv working/*.md archive/
mv working/file1.md working/file2.md archive/

# ✅ ALLOWED - Single file
mv working/file1.md archive/
```

**Why**: Ensures each file gets individual review.

### Rule 2: Read Before Archive

**Check**: Was file read in this session?

```bash
# Transcript search:
files_read = ["working/report.md", "docs/guide.md"]
source_file = "working/report.md"

if source_file in files_read:
    ALLOW
else:
    BLOCK
```

**Why**: You can't make informed archival decision without reading content.

### Rule 3: Permanent Value Protection (Location-Aware)

**Check**: Does file have `permanent_value: yes`?

**Case 1 - File in /working/ or other non-docs**:
```yaml
# working/report.md
---
permanent_value: yes
---
```
**Result**: ❌ **BLOCKED** → Should go to `/docs/`, not archive

**Case 2 - File in /docs/**:
```yaml
# docs/analysis.md
---
permanent_value: yes
---
```
**Result**: ❌ **BLOCKED** → Requires metadata update to `permanent_value: no`

**Why Different Treatment?**
- `/working/` + permanent → Not yet in permanent location → Block
- `/docs/` + permanent → Already permanent, archiving requires explicit confirmation → Block until metadata updated

### Rule 4: Root Archive Preference

**Check**: Is destination root-level `/archive`?

```bash
# ⚠️ WARNING - Non-root archive
mv file.md project/subfolder/archive/

# ✅ PREFERRED - Root archive
mv file.md archive/
```

**Result**: ⚠️ **ALLOWED with WARNING** (not blocked)

**Why**: Encourages consistent archival location, but doesn't prevent flexibility.

### Rule 5: Agent Delegation

**Check**: Is DirectoryOrganizer performing the archive?

```bash
# Detected agent: Analyst
# Operation: mv report.md archive/
```

**Result**: ❌ **BLOCKED** → Analyst should signal DirectoryOrganizer

**Why**: Maintains consistent archival workflow and expertise.

---

## How to Modify Configuration

### Enable/Disable Hook

**Disable Temporarily**:
```json
{
  "hooks": {
    "PreToolUse": [
      // COMMENTED OUT - Hook disabled
      // {
      //   "matcher": "Bash",
      //   "hooks": [...]
      // }
    ]
  }
}
```

**Re-enable**: Remove the `//` comment markers

### Change Timeout

```json
"timeout": 30  // Increased from 10 to 30 seconds
```

**When to increase**:
- Very large transcript files
- Slow system performance
- Hook getting killed prematurely

### Add Multiple Hooks

```json
"PreToolUse": [
  {
    "matcher": "Bash",
    "hooks": [
      {
        "type": "command",
        "command": "/path/to/archive-safety.py",
        "timeout": 10
      }
    ]
  },
  {
    "matcher": "Write",
    "hooks": [
      {
        "type": "command",
        "command": "/path/to/write-safety.py",
        "timeout": 5
      }
    ]
  }
]
```

**Result**: Both hooks run for their respective tools.

---

## Troubleshooting

### Hook Not Running

**Symptom**: Archive operations succeed without safety checks

**Diagnosis**:
1. Check hook is configured:
   ```bash
   grep -A 10 "PreToolUse" .claude/settings.json
   ```

2. Verify script exists:
   ```bash
   ls -l .claude/hooks/archive-safety.py
   ```

3. Check script is executable:
   ```bash
   chmod +x .claude/hooks/archive-safety.py
   ```

4. Test hook manually:
   ```bash
   echo '{"tool_name":"Bash","tool_input":{"command":"mv test.md archive/"}}' | .claude/hooks/archive-safety.py
   ```

### Hook Timing Out

**Symptom**: Hook killed after 10 seconds, operation allowed

**Check logs**:
```bash
tail -f .claude/logs/archive-safety.log
```

**Look for**: "ERROR: timeout" or no recent entries

**Fix**: Increase timeout in settings.json

### Hook Blocking Everything

**Symptom**: All Bash commands blocked, not just archives

**Diagnosis**: Hook has a bug

**Check logs**:
```bash
grep "BLOCKED" .claude/logs/archive-safety.log
grep "ERROR" .claude/logs/archive-safety.log
```

**Emergency Fix**: Disable hook temporarily

### False Positives

**Symptom**: Legitimate archives blocked incorrectly

**Examples**:
- File was read but hook doesn't detect it
- Permanent file in /docs/ truly outdated

**Solution 1 - Verify Read**:
```bash
# Check transcript for Read operations
grep -A 5 '"name": "Read"' .claude/session/transcript-*.json
```

**Solution 2 - Update Metadata**:
```yaml
# Change in file
permanent_value: no  # Was yes, but document outdated
```

**Report Issue**: Add to CONTINUOUS_LEARNING.md for improvement

---

## Testing Configuration

### Verify Hook is Active

```bash
# Create test environment
mkdir -p /tmp/test-archive/{working,archive}
echo "Test content" > /tmp/test-archive/working/test.md

# Try to archive WITHOUT reading
# (In Claude Code session)
mv /tmp/test-archive/working/test.md /tmp/test-archive/archive/

# Expected: 🛡️ BLOCKED - "File not read in session"
```

### Check Log Output

```bash
# View real-time hook activity
tail -f /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/.claude/logs/archive-safety.log

# Expected output format:
# [2025-10-01 14:30:00] Hook triggered - tool: Bash
# [2025-10-01 14:30:00] Bash command: mv test.md archive/
# [2025-10-01 14:30:00] Archive operation detected: ['test.md'] → archive/
# [2025-10-01 14:30:00] BLOCKED: File not read in session - test.md
```

### Verify Hook Script Path

```bash
# Get absolute path
realpath .claude/hooks/archive-safety.py

# Compare to settings.json
grep "archive-safety.py" .claude/settings.json

# Paths should match exactly
```

---

## Advanced Configuration

### Custom Archive Patterns

Edit hook script to recognize custom archive directories:

```python
# In archive-safety.py, find is_archive_operation()
archive_patterns = [
    r'/archive/',
    r'\\archive\\',
    r'/archived/',
    r'/_archived/',
    r'/old/',        # ADD: Recognize /old/ as archive
    r'/deprecated/', # ADD: Recognize /deprecated/
]
```

### Environment-Specific Paths

Use environment variables for portability:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "command": "${CI_ROOT}/.claude/hooks/archive-safety.py"
      }
    ]
  }
}
```

### Hook Logging Levels

Add to hook script:

```python
LOG_LEVEL = os.environ.get("ARCHIVE_SAFETY_LOG_LEVEL", "INFO")

if LOG_LEVEL == "DEBUG":
    log_message(f"DEBUG: Parsed command: {parsed}", log_file)
```

---

## Integration with Other Systems

### CI/CD Pipelines

The hook can be used in automated environments:

```yaml
# .github/workflows/archive-check.yml
- name: Run archive safety check
  run: |
    .claude/hooks/archive-safety.py < input.json
```

### Custom Tools

Integrate hook with custom scripts:

```bash
#!/bin/bash
# safe-archive.sh - Wrapper for archive operations

FILE="$1"
DEST="$2"

# Check with hook first
echo "{\"tool_name\":\"Bash\",\"tool_input\":{\"command\":\"mv $FILE $DEST\"}}" | \
  .claude/hooks/archive-safety.py

if [ $? -eq 0 ]; then
    mv "$FILE" "$DEST"
fi
```

---

## Configuration Best Practices

### 1. Keep Paths Absolute

❌ **Bad**:
```json
"command": "./hooks/archive-safety.py"
```

✅ **Good**:
```json
"command": "/Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/.claude/hooks/archive-safety.py"
```

### 2. Set Reasonable Timeouts

- **Too short** (< 5s): Hook may be killed on slow systems
- **Too long** (> 30s): User waits too long for feedback
- **Recommended**: 10 seconds

### 3. Monitor Hook Performance

```bash
# Add timing to hook script
import time
start = time.time()
# ... hook logic ...
duration = time.time() - start
log_message(f"Hook completed in {duration:.2f}s", log_file)
```

### 4. Version Your Configuration

```bash
# Backup before changes
cp .claude/settings.json .claude/settings.json.backup

# Add version comment
{
  "hooks": {
    // Archive Safety v2.0 - Last updated 2025-10-01
    "PreToolUse": [...]
  }
}
```

### 5. Document Custom Changes

If you modify the hook, document in:
- `CONTINUOUS_LEARNING.md` - What you learned
- `MEMORY.md` - Updated behavior
- Git commit message - Why the change

---

## FAQ

### Q: Can I bypass the hook?

**A**: Yes, but not recommended:
1. Disable hook in settings.json
2. Use non-Bash operations (Python script, file manager)
3. Use `git mv` (doesn't trigger Bash hook)

**Better approach**: Fix the issue causing the block.

### Q: Does the hook slow down Claude Code?

**A**: No, only for archive operations:
- Non-archive Bash commands: No hook execution
- Archive operations: ~10-50ms overhead
- Timeout: 10 seconds (never reached in practice)

### Q: Can multiple hooks run together?

**A**: Yes, all hooks in PreToolUse array run:
- Run in order listed
- Each can block independently
- All must allow for operation to proceed

### Q: What if hook crashes?

**A**: Fail-open design:
- Hook error → Operation allowed
- Logged to archive-safety.log
- User not blocked by hook bugs

### Q: Can I use this for other operations?

**A**: Yes, create similar hooks for:
- File deletion (`rm` commands)
- Sensitive file modification
- Database operations
- API calls

---

## Summary

**Configuration Location**: `.claude/settings.json`

**What It Does**: Tells Claude Code to run archive-safety.py before Bash commands

**How It Works**:
1. You run Bash command
2. Claude Code checks settings.json
3. Finds PreToolUse hook for Bash
4. Runs archive-safety.py with command info
5. Hook checks safety rules
6. Returns allow/block decision
7. Claude Code proceeds or blocks

**Key Configuration Points**:
- `matcher: "Bash"` - Only Bash commands
- `command: "<path>"` - Full path to hook script
- `timeout: 10` - 10 second limit

**Logs**: `.claude/logs/archive-safety.log`

**Testing**: Try archiving without reading - should block

---

**Configuration Guide Version**: 2.0
**Created**: 2025-10-01
**Maintained By**: DirectoryOrganizer Agent
**Next Review**: After 1 month of production use
