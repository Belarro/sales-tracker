# Manager Agent Review - Executive Summary

**Date**: 2025-10-09
**Critical Finding**: Manager's agent creation scripts generate **wrong file format**

---

## The Problem

Manager's `create-agent.sh` creates:
```
❌ README.md              (should be: {agent}-instructions.md)
❌ ContinuousLearning.md  (should be: GLOBAL-CONTEXT.md)
❌ Missing metadata.json  (required by assembly)
❌ Missing LOCAL-CONTEXT.md (required by assembly)
```

**Result**: Created agents **cannot be assembled** by `assemble-agent-file.sh`

---

## What Native Agents Need

```
AGENTS/{AgentName}/
├── {agent}-instructions.md     ✅ Identity (Tier 1)
├── GLOBAL-CONTEXT.md           ✅ Knowledge (Tier 2)
├── metadata.json               ✅ Assembly metadata
└── MEMORY.md                   ✅ Raw logs

.claude/agents/{agent}/
└── LOCAL-CONTEXT.md            ✅ Context (Tier 3)
```

**Assembly**: `assemble-agent-file.sh` combines these → `~/.claude/agents/{agent}.md`

---

## Quick Fixes

### 1. Fix create-agent.sh (Lines to Change)

**Line 93** - Change filename:
```bash
# OLD:
cat > "$AGENT_DIR/README.md" << EOF

# NEW:
cat > "$AGENT_DIR/${AGENT_NAME_LOWER}-instructions.md" << EOF
```

**Line 172** - Change filename:
```bash
# OLD:
cat > "$AGENT_DIR/ContinuousLearning.md" << EOF

# NEW:
cat > "$AGENT_DIR/GLOBAL-CONTEXT.md" << EOF
```

**After line 203** - Add metadata.json:
```bash
cat > "$AGENT_DIR/metadata.json" << EOF
{
  "name": "${AGENT_NAME_LOWER}",
  "description": "${AGENT_DESCRIPTION}",
  "model": "inherit",
  "color": "#9D4EDD"
}
EOF
```

**After line 226** - Add LOCAL-CONTEXT.md:
```bash
mkdir -p "$CI_ROOT/.claude/agents/${AGENT_NAME_LOWER}"
cat > "$CI_ROOT/.claude/agents/${AGENT_NAME_LOWER}/LOCAL-CONTEXT.md" << EOF
# ${AGENT_NAME} - Local Context

## Recent Work
[Project-specific work]

---
**Last Updated**: $(date +%Y-%m-%d)
EOF
```

**After line 276** - Trigger assembly:
```bash
# Assemble native agent file
ASSEMBLY_SCRIPT="$CI_ROOT/interfaces/claude-bridge/scripts/assemble-agent-file.sh"
if [[ -x "$ASSEMBLY_SCRIPT" ]]; then
    "$ASSEMBLY_SCRIPT" "$AGENT_NAME"
    echo "✅ Agent assembled: ~/.claude/agents/${AGENT_NAME_LOWER}.md"
fi
```

### 2. Fix Hardcoded Path (Line 41)

```bash
# OLD:
BASE_DIR="/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence"

# NEW:
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CI_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
```

---

## Assessment Summary

| Component | Status | Notes |
|-----------|--------|-------|
| **create-agent.sh** | ❌ Broken | Creates wrong files |
| **validate-agent.sh** | ✅ Good | Similarity detection works |
| **batch-create-agents.sh** | ⚠️ Inherits Issues | Depends on create-agent.sh |
| **Intelligence Guide** | ⚠️ Outdated | Many features already in hooks |

---

## Three Priority Levels

### P1: Critical (Do Now)
- Fix create-agent.sh filenames
- Add metadata.json generation
- Add LOCAL-CONTEXT.md generation
- Remove hardcoded paths
- Trigger assembly after creation

### P2: Important (Do Soon)
- Create migration script for old agents
- Update Manager README.md
- Fix batch-create-agents.sh validation

### P3: Nice to Have (Do Later)
- Enhance similarity detection with semantic keywords
- Update Intelligence Guide
- Create agent template library

---

## Similarity Detection: Keep It Simple

**Current**: String-based with `SequenceMatcher` (70% name, 60% role threshold)
**Verdict**: ✅ **Appropriate - keep it**

Why?
- Fast and simple
- No external dependencies
- Catches most duplicates
- No API costs

Optional enhancement: Add keyword synonym groups for semantic overlap.

---

## Intelligence Guide Assessment

Many proposed features **already implemented** by hook system:

| Feature | Status |
|---------|--------|
| Tiered learning | ✅ Multi-tier memory |
| Auto learning triggers | ✅ PostToolUse hooks |
| Knowledge compression | ✅ Mnemosyne agent |
| Context awareness | ✅ LOCAL-CONTEXT.md |
| Multi-modal understanding | ❌ LLM capability (not agent-specific) |
| 5-layer semantic processing | ❌ LLM capability (not agent-specific) |

**Recommendation**: Update guide to document hook system, remove LLM features.

---

## Migration Path for Existing Agents

**Problem**: ~133 agents, many with old README.md format

**Solution**: Create migration script

```bash
#!/bin/bash
# migrate-agent-format.sh <AgentName>

# 1. Rename README.md → {agent}-instructions.md
# 2. Convert ContinuousLearning.md → GLOBAL-CONTEXT.md
# 3. Create metadata.json
# 4. Create LOCAL-CONTEXT.md
# 5. Run assemble-agent-file.sh
```

**Strategy**: Start with high-activity agents (Developer, Architect, Debugger), then batch migrate.

---

## Estimated Effort

- Fix create-agent.sh: **2-3 hours**
- Create migration script: **2-3 hours**
- Update documentation: **1-2 hours**
- Test and validate: **2-3 hours**

**Total**: **7-11 hours**

---

## Full Details

See: `MANAGER_NATIVE_AGENT_SYSTEM_REVIEW.md` (comprehensive 500+ line analysis)

---

**Bottom Line**: Manager scripts create wrong file format. Fix filenames, add missing files, trigger assembly. Simple fixes, high impact.
