# Manager Scripts - Quick Fix Checklist

**Goal**: Make Manager's create-agent.sh generate correct multi-tier native agents

---

## File: `scripts/create-agent.sh`

### Fix 1: Change Line 93 (README.md → instructions.md)

**Current (Line 93)**:
```bash
cat > "$AGENT_DIR/README.md" << EOF
```

**Replace with**:
```bash
AGENT_NAME_LOWER=$(echo "$AGENT_NAME" | tr '[:upper:]' '[:lower:]')
cat > "$AGENT_DIR/${AGENT_NAME_LOWER}-instructions.md" << EOF
```

---

### Fix 2: Update Template Content (Lines 94-133)

**Keep core sections, update format**:
```markdown
# ${AGENT_NAME}

## Core Identity & Purpose
${AGENT_DESCRIPTION}

## Guiding Principles
1. [Principle 1 - TO BE FILLED based on ${AGENT_ROLE}]
2. [Principle 2 - TO BE FILLED]
3. [Principle 3 - TO BE FILLED]

## Primary Responsibilities
- [Responsibility 1 - TO BE FILLED]
- [Responsibility 2 - TO BE FILLED]
- [Responsibility 3 - TO BE FILLED]

## Approach
[How this agent works - TO BE FILLED based on ${AGENT_ROLE}]

## Three-Tier Memory Architecture
**TIER 1**: Immutable core principles and identity
**TIER 2**: Cross-project patterns validated in 2+ projects
**TIER 3**: Session-specific context and active work
```

---

### Fix 3: Change Line 172 (ContinuousLearning.md → GLOBAL-CONTEXT.md)

**Current (Line 172)**:
```bash
cat > "$AGENT_DIR/ContinuousLearning.md" << EOF
# $AGENT_NAME Continuous Learning
```

**Replace with**:
```bash
cat > "$AGENT_DIR/GLOBAL-CONTEXT.md" << EOF
# ${AGENT_NAME} - Global Context

## Core Principles (Universal)
**Applicable to**: All ${AGENT_ROLE} work

[Cross-project principles - TO BE FILLED as patterns emerge]

## Pattern Library (Cross-Domain)
**Validated in**: [Projects where patterns proven]

[Patterns - TO BE FILLED as patterns validated across 2+ projects]

---
**Global Context**: Cross-project patterns
**Last Updated**: $CURRENT_DATE
**Architecture**: Three-tier memory system
EOF
```

---

### Fix 4: Add metadata.json (After Line 203)

**Add this new section**:
```bash
# Create metadata.json
cat > "$AGENT_DIR/metadata.json" << EOF
{
  "name": "${AGENT_NAME_LOWER}",
  "description": "${AGENT_DESCRIPTION}",
  "model": "inherit",
  "color": "#9D4EDD"
}
EOF
```

---

### Fix 5: Add LOCAL-CONTEXT.md (After metadata.json)

**Add this new section**:
```bash
# Create LOCAL-CONTEXT.md (Tier 3: Project Context)
mkdir -p "$CI_ROOT/.claude/agents/${AGENT_NAME_LOWER}"
cat > "$CI_ROOT/.claude/agents/${AGENT_NAME_LOWER}/LOCAL-CONTEXT.md" << EOF
# ${AGENT_NAME} - Local Context

## Recent Work
[Project-specific work - TO BE FILLED by memory system]

## Active Focus Areas
[Current priorities - TO BE FILLED]

---
**Local Context**: Project-specific work in CollaborativeIntelligence
**Last Updated**: $CURRENT_DATE
EOF
```

---

### Fix 6: Fix Hardcoded Path (Lines 41-42)

**Current (Lines 41-42)**:
```bash
BASE_DIR="/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence"
AGENTS_DIR="$BASE_DIR/AGENTS"
```

**Replace with**:
```bash
# Use relative paths from script location
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CI_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
AGENTS_DIR="$CI_ROOT/AGENTS"
```

---

### Fix 7: Trigger Assembly (After Line 276)

**Add before final echo statements**:
```bash
# Assemble native agent file
echo -e "${BLUE}Assembling native agent file...${NC}"
ASSEMBLY_SCRIPT="$CI_ROOT/interfaces/claude-bridge/scripts/assemble-agent-file.sh"

if [[ -x "$ASSEMBLY_SCRIPT" ]]; then
    if "$ASSEMBLY_SCRIPT" "$AGENT_NAME"; then
        echo -e "${GREEN}✅ Agent assembled: ~/.claude/agents/${AGENT_NAME_LOWER}.md${NC}"
        echo -e "${YELLOW}⚠️  Restart Claude Code to load new agent${NC}"
        echo -e "${BLUE}   Test in conversation: @agent-${AGENT_NAME_LOWER}${NC}"
    else
        echo -e "${RED}❌ Assembly failed - check source files${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Assembly script not found: $ASSEMBLY_SCRIPT${NC}"
    echo -e "${YELLOW}   Run manually: assemble-agent-file.sh $AGENT_NAME${NC}"
fi
```

---

## Testing Checklist

After making changes, test with:

```bash
# 1. Create test agent
cd /Users/eladm/Projects/Nuru-AI/CollaborativeIntelligence/AGENTS/Manager/scripts
./create-agent.sh TestAgent "Test agent for validation" "Testing multi-tier creation"

# 2. Verify files created
ls -la ../../TestAgent/
# Should see:
# - testagent-instructions.md ✓
# - GLOBAL-CONTEXT.md ✓
# - metadata.json ✓
# - MEMORY.md ✓
# - Sessions/ ✓

ls -la ../../../.claude/agents/testagent/
# Should see:
# - LOCAL-CONTEXT.md ✓

# 3. Verify assembly
cat ~/.claude/agents/testagent.md
# Should contain:
# - YAML frontmatter ✓
# - Tier 1: Instructions content ✓
# - Tier 2: Global context ✓
# - Tier 3: Local context ✓

# 4. Clean up test agent
rm -rf ../../TestAgent
rm -rf ../../../.claude/agents/testagent
rm -f ~/.claude/agents/testagent.md
```

---

## Validation Criteria

✅ **Success** if created agent has:
1. `{agent}-instructions.md` (NOT README.md)
2. `GLOBAL-CONTEXT.md` (NOT ContinuousLearning.md)
3. `metadata.json` with correct structure
4. `LOCAL-CONTEXT.md` in project `.claude/agents/{agent}/`
5. `~/.claude/agents/{agent}.md` assembled correctly
6. YAML frontmatter valid
7. All three tiers present in assembled file

❌ **Failure** if:
1. Still creates `README.md` instead of `{agent}-instructions.md`
2. Still creates `ContinuousLearning.md` instead of `GLOBAL-CONTEXT.md`
3. Missing `metadata.json`
4. Missing `LOCAL-CONTEXT.md`
5. Assembly script not called
6. Hardcoded paths still present

---

## Summary of Changes

| Line(s) | Change | Reason |
|---------|--------|--------|
| 41-42 | Fix hardcoded paths | Portability |
| 93 | `README.md` → `{agent}-instructions.md` | Assembly requirement |
| 94-133 | Update template format | Match current agents |
| 172 | `ContinuousLearning.md` → `GLOBAL-CONTEXT.md` | Assembly requirement |
| 173-203 | Update template content | Multi-tier architecture |
| After 203 | Add `metadata.json` generation | Assembly requirement |
| After 203 | Add `LOCAL-CONTEXT.md` generation | Assembly requirement |
| After 276 | Trigger assembly script | Complete agent creation |

**Total**: ~8 changes, ~50 lines modified/added

---

**Estimated Time**: 1-2 hours (includes testing)

**Next Steps After Fix**:
1. Update `batch-create-agents.sh` (inherits fixes)
2. Update Manager README.md
3. Create migration script for old agents
4. Test with real agent creation

---

**See Also**:
- `MANAGER_NATIVE_AGENT_SYSTEM_REVIEW.md` - Full analysis
- `MANAGER_REVIEW_EXECUTIVE_SUMMARY.md` - Executive overview
