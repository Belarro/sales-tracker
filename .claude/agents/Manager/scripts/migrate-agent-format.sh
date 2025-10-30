#!/bin/bash

# Agent Format Migration Script
# Converts old-format agents to multi-tier memory architecture
# Usage: ./migrate-agent-format.sh <AgentName>

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to display usage
show_usage() {
    echo "Usage: $0 <AgentName>"
    echo ""
    echo "Converts an old-format agent to multi-tier memory architecture"
    echo ""
    echo "Old Format:"
    echo "  - README.md (core identity)"
    echo "  - ContinuousLearning.md (learning)"
    echo "  - MEMORY.md (memory template)"
    echo ""
    echo "New Format:"
    echo "  - {agent}-instructions.md (TIER 1: Identity)"
    echo "  - GLOBAL-CONTEXT.md (TIER 2: Knowledge)"
    echo "  - LOCAL-CONTEXT.md (TIER 3: Context)"
    echo "  - metadata.json (Assembly metadata)"
    echo "  - MEMORY.md (Raw logging)"
    echo "  - README.md (Human docs)"
    echo ""
    echo "Examples:"
    echo "  $0 Validator"
    echo "  $0 TestAgent"
    echo ""
    echo "Options:"
    echo "  --dry-run    Show what would be done without making changes"
    echo "  --backup     Create backup before migration"
    exit 1
}

# Parse arguments
AGENT_NAME="$1"
DRY_RUN=false
BACKUP=false

if [ -z "$AGENT_NAME" ]; then
    show_usage
fi

# Check for flags
shift
while [ $# -gt 0 ]; do
    case "$1" in
        --dry-run)
            DRY_RUN=true
            ;;
        --backup)
            BACKUP=true
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            show_usage
            ;;
    esac
    shift
done

# Set base paths using relative paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CI_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
AGENTS_DIR="$CI_ROOT/AGENTS"
AGENT_DIR="$AGENTS_DIR/$AGENT_NAME"
AGENT_NAME_LOWER=$(echo "$AGENT_NAME" | tr '[:upper:]' '[:lower:]')

# Verify agent exists
if [ ! -d "$AGENT_DIR" ]; then
    echo -e "${RED}Error: Agent directory not found: $AGENT_DIR${NC}"
    exit 1
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}Agent Format Migration: $AGENT_NAME${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Check current format
echo -e "${BLUE}Analyzing current format...${NC}"

HAS_OLD_README=false
HAS_NEW_INSTRUCTIONS=false
HAS_CONTINUOUS_LEARNING=false
HAS_GLOBAL_CONTEXT=false
HAS_METADATA=false
HAS_LOCAL_CONTEXT=false

if [ -f "$AGENT_DIR/README.md" ]; then
    HAS_OLD_README=true
fi

if [ -f "$AGENT_DIR/${AGENT_NAME_LOWER}-instructions.md" ]; then
    HAS_NEW_INSTRUCTIONS=true
fi

if [ -f "$AGENT_DIR/ContinuousLearning.md" ]; then
    HAS_CONTINUOUS_LEARNING=true
fi

if [ -f "$AGENT_DIR/GLOBAL-CONTEXT.md" ]; then
    HAS_GLOBAL_CONTEXT=true
fi

if [ -f "$AGENT_DIR/metadata.json" ]; then
    HAS_METADATA=true
fi

if [ -f "$CI_ROOT/.claude/agents/${AGENT_NAME_LOWER}/LOCAL-CONTEXT.md" ]; then
    HAS_LOCAL_CONTEXT=true
fi

# Determine if migration is needed
NEEDS_MIGRATION=false

if [ "$HAS_OLD_README" = true ] && [ "$HAS_NEW_INSTRUCTIONS" = false ]; then
    echo "  ⚠️  README.md exists, ${AGENT_NAME_LOWER}-instructions.md missing"
    NEEDS_MIGRATION=true
fi

if [ "$HAS_CONTINUOUS_LEARNING" = true ] && [ "$HAS_GLOBAL_CONTEXT" = false ]; then
    echo "  ⚠️  ContinuousLearning.md exists, GLOBAL-CONTEXT.md missing"
    NEEDS_MIGRATION=true
fi

if [ "$HAS_METADATA" = false ]; then
    echo "  ⚠️  metadata.json missing"
    NEEDS_MIGRATION=true
fi

if [ "$HAS_LOCAL_CONTEXT" = false ]; then
    echo "  ⚠️  LOCAL-CONTEXT.md missing"
    NEEDS_MIGRATION=true
fi

if [ "$NEEDS_MIGRATION" = false ]; then
    echo -e "${GREEN}✅ Agent already using multi-tier architecture${NC}"
    echo ""
    echo "Current files:"
    [ -f "$AGENT_DIR/${AGENT_NAME_LOWER}-instructions.md" ] && echo "  ✅ ${AGENT_NAME_LOWER}-instructions.md"
    [ -f "$AGENT_DIR/GLOBAL-CONTEXT.md" ] && echo "  ✅ GLOBAL-CONTEXT.md"
    [ -f "$AGENT_DIR/metadata.json" ] && echo "  ✅ metadata.json"
    [ -f "$CI_ROOT/.claude/agents/${AGENT_NAME_LOWER}/LOCAL-CONTEXT.md" ] && echo "  ✅ LOCAL-CONTEXT.md"
    exit 0
fi

echo ""
echo -e "${YELLOW}Migration needed for $AGENT_NAME${NC}"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo -e "${BLUE}DRY RUN MODE - No changes will be made${NC}"
    echo ""
fi

# Create backup if requested
if [ "$BACKUP" = true ] && [ "$DRY_RUN" = false ]; then
    BACKUP_DIR="$AGENT_DIR/backup-$(date +%Y%m%d-%H%M%S)"
    echo -e "${BLUE}Creating backup: $BACKUP_DIR${NC}"
    mkdir -p "$BACKUP_DIR"
    [ -f "$AGENT_DIR/README.md" ] && cp "$AGENT_DIR/README.md" "$BACKUP_DIR/"
    [ -f "$AGENT_DIR/ContinuousLearning.md" ] && cp "$AGENT_DIR/ContinuousLearning.md" "$BACKUP_DIR/"
    [ -f "$AGENT_DIR/MEMORY.md" ] && cp "$AGENT_DIR/MEMORY.md" "$BACKUP_DIR/"
    echo -e "${GREEN}✅ Backup created${NC}"
    echo ""
fi

# Get current date
CURRENT_DATE=$(date '+%Y-%m-%d')

# Extract description from README if available
AGENT_DESCRIPTION="[TO BE FILLED - extracted from old README.md]"
if [ -f "$AGENT_DIR/README.md" ]; then
    # Try to extract first meaningful line after heading
    AGENT_DESCRIPTION=$(grep -A 5 "^## Purpose" "$AGENT_DIR/README.md" | grep -v "^##" | grep -v "^$" | head -1 || echo "$AGENT_DESCRIPTION")
fi

# ============================================================================
# MIGRATION STEP 1: Create {agent}-instructions.md from README.md
# ============================================================================

if [ "$HAS_OLD_README" = true ] && [ "$HAS_NEW_INSTRUCTIONS" = false ]; then
    echo -e "${BLUE}Step 1: Migrating README.md → ${AGENT_NAME_LOWER}-instructions.md${NC}"

    if [ "$DRY_RUN" = true ]; then
        echo "  Would create: ${AGENT_NAME_LOWER}-instructions.md"
    else
        cat > "$AGENT_DIR/${AGENT_NAME_LOWER}-instructions.md" << EOF
# $AGENT_NAME

## Core Identity & Purpose

$AGENT_DESCRIPTION

## Guiding Principles

[TO BE FILLED - Extract from old README.md Core Identity section]

## Primary Responsibilities

[TO BE FILLED - Extract from old README.md Primary Responsibilities section]

## Approach

[TO BE FILLED - Extract from old README.md Operational Guidelines section]

## Three-Tier Memory Architecture

**TIER 1**: Immutable core principles and identity (this file)
**TIER 2**: Cross-project patterns and frameworks validated in 2+ projects (GLOBAL-CONTEXT.md)
**TIER 3**: Session-specific context and active work in current project (LOCAL-CONTEXT.md)

---

**Core Identity**: Migrated $CURRENT_DATE from old format
**Architecture**: Multi-tier memory system
**Note**: Review and complete [TO BE FILLED] sections with content from old README.md
EOF
        echo -e "${GREEN}  ✅ Created ${AGENT_NAME_LOWER}-instructions.md${NC}"
        echo -e "${YELLOW}  ⚠️  Review file and fill in [TO BE FILLED] sections from old README.md${NC}"
    fi
fi

# ============================================================================
# MIGRATION STEP 2: Create GLOBAL-CONTEXT.md from ContinuousLearning.md
# ============================================================================

if [ "$HAS_CONTINUOUS_LEARNING" = true ] && [ "$HAS_GLOBAL_CONTEXT" = false ]; then
    echo -e "${BLUE}Step 2: Migrating ContinuousLearning.md → GLOBAL-CONTEXT.md${NC}"

    if [ "$DRY_RUN" = true ]; then
        echo "  Would create: GLOBAL-CONTEXT.md"
    else
        cat > "$AGENT_DIR/GLOBAL-CONTEXT.md" << EOF
# $AGENT_NAME - Global Context

## Core Principles (Universal)

**Applicable to**: All work across domains

[TO BE FILLED - Extract cross-project patterns from ContinuousLearning.md]

## Pattern Library (Cross-Domain)

**Validated in**: [List projects where patterns proven]

### Effective Patterns

[TO BE FILLED - Extract from ContinuousLearning.md Domain-Specific Patterns]

### Anti-Patterns

[TO BE FILLED - Extract from ContinuousLearning.md Lessons Learned]

## Analytical Frameworks

[TO BE FILLED - Extract from ContinuousLearning.md Best Practices]

---

**Global Context**: Cross-project patterns validated in 2+ projects
**Last Updated**: $CURRENT_DATE
**Migrated From**: ContinuousLearning.md
**Architecture**: Three-tier memory system
**Note**: Review and extract relevant content from old ContinuousLearning.md
EOF
        echo -e "${GREEN}  ✅ Created GLOBAL-CONTEXT.md${NC}"
        echo -e "${YELLOW}  ⚠️  Review file and extract content from old ContinuousLearning.md${NC}"
    fi
elif [ "$HAS_GLOBAL_CONTEXT" = false ]; then
    echo -e "${BLUE}Step 2: Creating GLOBAL-CONTEXT.md (no ContinuousLearning.md found)${NC}"

    if [ "$DRY_RUN" = true ]; then
        echo "  Would create: GLOBAL-CONTEXT.md"
    else
        cat > "$AGENT_DIR/GLOBAL-CONTEXT.md" << EOF
# $AGENT_NAME - Global Context

## Core Principles (Universal)

**Applicable to**: All work across domains

[TO BE FILLED as patterns emerge]

## Pattern Library (Cross-Domain)

**Validated in**: [List projects where patterns proven]

### Effective Patterns

[TO BE FILLED as patterns are identified]

### Anti-Patterns

[What to avoid - TO BE FILLED]

## Analytical Frameworks

[Frameworks used across projects - TO BE FILLED]

---

**Global Context**: Cross-project patterns validated in 2+ projects
**Last Updated**: $CURRENT_DATE
**Architecture**: Three-tier memory system
EOF
        echo -e "${GREEN}  ✅ Created GLOBAL-CONTEXT.md${NC}"
    fi
fi

# ============================================================================
# MIGRATION STEP 3: Create or cleanup metadata.json
# ============================================================================

if [ "$HAS_METADATA" = false ]; then
    echo -e "${BLUE}Step 3: Creating metadata.json${NC}"

    if [ "$DRY_RUN" = true ]; then
        echo "  Would create: metadata.json"
    else
        cat > "$AGENT_DIR/metadata.json" << EOF
{
  "name": "${AGENT_NAME_LOWER}",
  "description": "${AGENT_DESCRIPTION}",
  "model": "inherit",
  "color": "#9D4EDD"
}
EOF
        echo -e "${GREEN}  ✅ Created metadata.json${NC}"
    fi
else
    # metadata.json exists - check if it needs cleanup for multi-tier format
    echo -e "${BLUE}Step 3: Checking metadata.json format${NC}"

    if [ "$DRY_RUN" = true ]; then
        echo "  Would check and clean metadata.json format"
    else
        # Check if metadata.json has old format fields that need cleanup
        if grep -qE '"(expertise|focus|perspective|capabilities|activation)"' "$AGENT_DIR/metadata.json" 2>/dev/null; then
            # Backup old metadata
            cp "$AGENT_DIR/metadata.json" "$AGENT_DIR/metadata.json.old"

            # Extract only the required fields, clean format
            EXISTING_NAME=$(python3 -c "import json; f=open('$AGENT_DIR/metadata.json'); d=json.load(f); print(d.get('name', '${AGENT_NAME_LOWER}'))" 2>/dev/null || echo "${AGENT_NAME_LOWER}")
            EXISTING_DESC=$(python3 -c "import json; f=open('$AGENT_DIR/metadata.json'); d=json.load(f); print(d.get('description', '${AGENT_DESCRIPTION}'))" 2>/dev/null || echo "${AGENT_DESCRIPTION}")
            EXISTING_MODEL=$(python3 -c "import json; f=open('$AGENT_DIR/metadata.json'); d=json.load(f); print(d.get('model', 'inherit'))" 2>/dev/null || echo "inherit")
            EXISTING_COLOR=$(python3 -c "import json; f=open('$AGENT_DIR/metadata.json'); d=json.load(f); print(d.get('color', '#9D4EDD'))" 2>/dev/null || echo "#9D4EDD")

            # Create clean metadata.json with only required fields
            cat > "$AGENT_DIR/metadata.json" << EOF
{
  "name": "${EXISTING_NAME}",
  "description": "${EXISTING_DESC}",
  "model": "${EXISTING_MODEL}",
  "color": "${EXISTING_COLOR}"
}
EOF
            echo -e "${GREEN}  ✅ Cleaned metadata.json (removed old format fields)${NC}"
            echo -e "${YELLOW}  ⚠️  Old metadata.json saved as metadata.json.old${NC}"
        else
            echo -e "${GREEN}  ✅ metadata.json format already correct${NC}"
        fi
    fi
fi

# ============================================================================
# MIGRATION STEP 4: Create LOCAL-CONTEXT.md
# ============================================================================

if [ "$HAS_LOCAL_CONTEXT" = false ]; then
    echo -e "${BLUE}Step 4: Creating LOCAL-CONTEXT.md${NC}"

    if [ "$DRY_RUN" = true ]; then
        echo "  Would create: .claude/agents/${AGENT_NAME_LOWER}/LOCAL-CONTEXT.md"
    else
        mkdir -p "$CI_ROOT/.claude/agents/${AGENT_NAME_LOWER}"

        # Try to extract recent work from MEMORY.md if it exists
        RECENT_WORK="[Project-specific work - TO BE FILLED]"
        if [ -f "$AGENT_DIR/MEMORY.md" ]; then
            RECENT_WORK="[TO BE FILLED - Extract recent project-specific work from MEMORY.md]"
        fi

        cat > "$CI_ROOT/.claude/agents/${AGENT_NAME_LOWER}/LOCAL-CONTEXT.md" << EOF
# $AGENT_NAME - Local Context

## Recent Work

$RECENT_WORK

## Active Focus Areas

[Current priorities in CollaborativeIntelligence - TO BE FILLED]

## Project-Specific Patterns

[Patterns specific to CollaborativeIntelligence - TO BE FILLED]

---

**Local Context**: Project-specific work in CollaborativeIntelligence
**Last Updated**: $CURRENT_DATE
**Migrated**: $CURRENT_DATE
EOF
        echo -e "${GREEN}  ✅ Created LOCAL-CONTEXT.md${NC}"
    fi
fi

# ============================================================================
# MIGRATION STEP 5: Update MEMORY.md format if needed
# ============================================================================

if [ -f "$AGENT_DIR/MEMORY.md" ]; then
    echo -e "${BLUE}Step 5: Updating MEMORY.md format${NC}"

    if [ "$DRY_RUN" = true ]; then
        echo "  Would update: MEMORY.md"
    else
        # Check if MEMORY.md has old template format
        if grep -q "Long-Term Memory: Core Identity" "$AGENT_DIR/MEMORY.md"; then
            # Backup old MEMORY.md
            cp "$AGENT_DIR/MEMORY.md" "$AGENT_DIR/MEMORY.md.old"

            cat > "$AGENT_DIR/MEMORY.md" << EOF
# $AGENT_NAME - Memory Log

## Recent Activity

[Raw memory log - automatically updated by PostToolUse hooks]
[Processed by Mnemosyne agent into GLOBAL-CONTEXT.md and LOCAL-CONTEXT.md]

---

**Purpose**: Raw memory logging (not assembled into native agent file)
**Processing**: Mnemosyne compresses this into GLOBAL/LOCAL-CONTEXT.md
**Last Updated**: $CURRENT_DATE
**Migration Note**: Old MEMORY.md saved as MEMORY.md.old
EOF
            echo -e "${GREEN}  ✅ Updated MEMORY.md format${NC}"
            echo -e "${YELLOW}  ⚠️  Old MEMORY.md saved as MEMORY.md.old${NC}"
        else
            echo -e "${GREEN}  ✅ MEMORY.md format already correct${NC}"
        fi
    fi
fi

# ============================================================================
# MIGRATION STEP 6: Update README.md for humans
# ============================================================================

if [ "$HAS_OLD_README" = true ]; then
    echo -e "${BLUE}Step 6: Updating README.md for human readers${NC}"

    if [ "$DRY_RUN" = true ]; then
        echo "  Would rename: README.md → README.md.old"
        echo "  Would create: README.md (new human-readable format)"
    else
        # Backup old README
        mv "$AGENT_DIR/README.md" "$AGENT_DIR/README.md.old"

        cat > "$AGENT_DIR/README.md" << EOF
# $AGENT_NAME Agent

> **Note**: This README is for human readers. Claude Code loads from \`${AGENT_NAME_LOWER}-instructions.md\` + \`GLOBAL-CONTEXT.md\` + \`LOCAL-CONTEXT.md\`.

## Purpose

$AGENT_DESCRIPTION

## Files

- **${AGENT_NAME_LOWER}-instructions.md**: TIER 1 - Immutable identity (assembled by Claude Code)
- **GLOBAL-CONTEXT.md**: TIER 2 - Cross-project knowledge (assembled by Claude Code)
- **LOCAL-CONTEXT.md**: TIER 3 - Project-specific context (in \`.claude/agents/${AGENT_NAME_LOWER}/\`)
- **metadata.json**: Assembly metadata
- **MEMORY.md**: Raw memory log (not assembled, processed by Mnemosyne)
- **Sessions/**: Work history

## Activation

Activate with: \`@agent-${AGENT_NAME_LOWER}\`

## Architecture

This agent uses Claude Code's multi-tier memory architecture:
- Assembly script combines all tiers → \`~/.claude/agents/${AGENT_NAME_LOWER}.md\`
- PostToolUse hooks → memory updates → Mnemosyne compression
- Cross-project patterns in GLOBAL-CONTEXT.md
- Project-specific context in LOCAL-CONTEXT.md

## Migration Notes

**Migrated**: $CURRENT_DATE from old format
**Old README**: Saved as README.md.old
**Old ContinuousLearning**: ${HAS_CONTINUOUS_LEARNING}
**Review**: Check ${AGENT_NAME_LOWER}-instructions.md and GLOBAL-CONTEXT.md for [TO BE FILLED] sections

---

**Created**: $CURRENT_DATE
**Architecture**: Multi-tier memory system
**Assembly**: \`assemble-agent-file.sh ${AGENT_NAME}\`
EOF
        echo -e "${GREEN}  ✅ Updated README.md${NC}"
        echo -e "${YELLOW}  ⚠️  Old README.md saved as README.md.old${NC}"
    fi
fi

# ============================================================================
# MIGRATION STEP 7: Assemble native agent file
# ============================================================================

if [ "$DRY_RUN" = false ]; then
    echo ""
    echo -e "${BLUE}Step 7: Assembling native agent file...${NC}"

    ASSEMBLY_SCRIPT="$CI_ROOT/interfaces/claude-bridge/scripts/assemble-agent-file.sh"

    if [[ -x "$ASSEMBLY_SCRIPT" ]]; then
        if "$ASSEMBLY_SCRIPT" "$AGENT_NAME"; then
            echo -e "${GREEN}  ✅ Agent assembled: ~/.claude/agents/${AGENT_NAME_LOWER}.md${NC}"
        else
            echo -e "${RED}  ❌ Assembly failed - check source files${NC}"
            echo -e "${YELLOW}     Review [TO BE FILLED] sections and run:${NC}"
            echo -e "${YELLOW}     assemble-agent-file.sh $AGENT_NAME${NC}"
        fi
    else
        echo -e "${YELLOW}  ⚠️  Assembly script not found: $ASSEMBLY_SCRIPT${NC}"
        echo -e "${YELLOW}     Run manually: assemble-agent-file.sh $AGENT_NAME${NC}"
    fi
fi

# ============================================================================
# SUMMARY
# ============================================================================

echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Migration Complete for $AGENT_NAME${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""

if [ "$DRY_RUN" = true ]; then
    echo -e "${BLUE}DRY RUN - No changes were made${NC}"
    echo ""
    echo "Run without --dry-run to perform migration"
else
    echo -e "${BLUE}Files created/updated:${NC}"
    [ "$HAS_NEW_INSTRUCTIONS" = false ] && echo "  ✅ ${AGENT_NAME_LOWER}-instructions.md"
    [ "$HAS_GLOBAL_CONTEXT" = false ] && echo "  ✅ GLOBAL-CONTEXT.md"
    [ "$HAS_METADATA" = false ] && echo "  ✅ metadata.json"
    [ "$HAS_LOCAL_CONTEXT" = false ] && echo "  ✅ LOCAL-CONTEXT.md"
    echo "  ✅ MEMORY.md (updated format)"
    echo "  ✅ README.md (updated for humans)"
    echo ""

    echo -e "${BLUE}Backup files created:${NC}"
    [ "$BACKUP" = true ] && echo "  📦 backup-$(date +%Y%m%d)/"
    echo "  📦 README.md.old"
    [ -f "$AGENT_DIR/MEMORY.md.old" ] && echo "  📦 MEMORY.md.old"
    echo ""

    echo -e "${YELLOW}⚠️  IMPORTANT: Manual review required${NC}"
    echo ""
    echo "1. Review ${AGENT_NAME_LOWER}-instructions.md"
    echo "   - Fill in [TO BE FILLED] sections from README.md.old"
    echo "   - Extract core identity, principles, responsibilities"
    echo ""
    echo "2. Review GLOBAL-CONTEXT.md"
    echo "   - Fill in [TO BE FILLED] sections from ContinuousLearning.md"
    echo "   - Extract cross-project patterns and frameworks"
    echo ""
    echo "3. Reassemble after completing sections:"
    echo "   assemble-agent-file.sh $AGENT_NAME"
    echo ""
    echo "4. Restart Claude Code to load updated agent"
    echo ""
    echo "5. Test: @agent-${AGENT_NAME_LOWER}"
    echo ""
fi

echo -e "${BLUE}Migration report saved${NC}"
