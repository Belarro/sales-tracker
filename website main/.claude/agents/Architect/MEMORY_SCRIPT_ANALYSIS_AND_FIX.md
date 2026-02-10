# Memory System Fix: Architectural Solution

## Immediate Action: Disable the Runaway Hooks

### Option 1: Complete Disable (Recommended for now)
```bash
# Backup current settings
cp .claude/settings.json .claude/settings.json.backup

# Clear the hooks
cat > .claude/settings.json << 'EOF'
{
  "hooks": {},
  "slashCommands": {}
}
EOF
```

### Option 2: Smart Filtering (Better long-term)
Create a new script: `memory-filter.sh`

```bash
#!/bin/bash
# Memory Filter - Only allows meaningful updates

# Read stdin
HOOK_DATA=$(cat)

# Extract tool name
TOOL_NAME=$(echo "$HOOK_DATA" | jq -r '.tool_name // "Unknown"' 2>/dev/null)

# Skip Read operations entirely
if [ "$TOOL_NAME" = "Read" ]; then
    exit 0
fi

# Skip certain file patterns
FILE_PATH=$(echo "$HOOK_DATA" | jq -r '.tool_input.file_path // ""' 2>/dev/null)
if [[ "$FILE_PATH" =~ \.(log|tmp|backup|cache)$ ]]; then
    exit 0
fi

# Only process significant operations
case "$TOOL_NAME" in
    Write|Edit|MultiEdit)
        # Pass through to actual updater
        echo "$HOOK_DATA" | /path/to/enhanced-memory-updater.sh
        ;;
    *)
        exit 0
        ;;
esac
```

## The Real Problem: Hook Design Flaws

### Current Issues:
1. **No Operation Filtering**: Every Read triggers updates
2. **No Size Limits**: Unbounded append growth
3. **No Deduplication**: Same updates repeated
4. **No Consolidation**: Without API key, just appends forever

### Evidence from Your System:
- Just during our investigation: 12+ memory updates triggered
- Each Read of settings.json → 2 agent updates
- Each Write → 2-4 agent updates
- Memory files grew by 40+ lines in 10 minutes!

## Architectural Fix Implementation

### Step 1: Add Size Limits to enhanced-memory-updater.sh
```bash
# Add this before appending to MEMORY.md
MEMORY_SIZE=$(wc -c < "$AGENT_MEMORY")
MAX_SIZE=100000  # 100KB limit

if [ $MEMORY_SIZE -gt $MAX_SIZE ]; then
    # Archive old memory
    mv "$AGENT_MEMORY" "$AGENT_MEMORY.$(date +%Y%m%d).archive"
    echo "# $agent Agent Memory - Rotated $(date)" > "$AGENT_MEMORY"
fi
```

### Step 2: Filter Operations
```bash
# Add at start of enhanced-memory-updater.sh
TOOL_NAME=$(echo "$HOOK_DATA" | jq -r '.tool_name // "Unknown"')

# Skip reads and trivial operations
if [[ "$TOOL_NAME" =~ ^(Read|Bash|Glob|Grep)$ ]]; then
    log_memory_update "Skipping $TOOL_NAME operation - not significant"
    exit 0
fi
```

### Step 3: Deduplicate Updates
```bash
# Check if similar update exists
LAST_UPDATE=$(tail -5 "$AGENT_MEMORY" | grep "Activity:")
if [[ "$LAST_UPDATE" == *"$AGENT_CONTEXT"* ]]; then
    log_memory_update "Skipping duplicate update for $AGENT_CONTEXT"
    exit 0
fi
```

## Root Cause Analysis

The system was designed with good intentions:
- Track all development activities
- Learn from every operation
- Maintain persistent memory

But it lacks basic engineering controls:
- No rate limiting
- No size management
- No intelligence without API
- No operation filtering

## The Screenshot Revelation

The `<user-prompt-submit-hook>[analyst]:` tags show:
1. Hooks are actively modifying prompts
2. Agent context is being injected
3. The system thinks agents are active
4. But it's just text manipulation!

## Recommendation

1. **Immediate**: Disable PostToolUse hooks
2. **Short-term**: Implement filtering and size limits
3. **Long-term**: Either:
   - Enable AI consolidation with API key
   - Redesign to use session-based memory only
   - Implement proper memory management

## Command to Fix Now

```bash
# Quick fix - disable the problematic hooks
cd /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence

# Backup
cp .claude/settings.json .claude/settings.json.$(date +%Y%m%d_%H%M%S).backup

# Remove PostToolUse hooks
jq '.hooks.PostToolUse = []' .claude/settings.json > .claude/settings.json.tmp
mv .claude/settings.json.tmp .claude/settings.json

echo "Hooks disabled. Memory growth should stop."
```

## Validation

After applying the fix:
1. Memory files should stop growing
2. Tool operations won't trigger updates
3. System performance should improve
4. No more spam in logs

---

**Architect's Assessment**: The system is cleverly designed but poorly governed. It's a classic case of "automation without limits" - every action triggers reactions, creating a cascade of updates. The fix is simple: add filters, limits, and intelligence to the update mechanism.