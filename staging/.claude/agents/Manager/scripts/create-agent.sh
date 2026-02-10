#!/bin/bash

# Enhanced Agent Creation Script - Multi-Tier Memory Architecture
# Creates native agents compatible with Claude Code's assembly system
# Usage: ./create-agent.sh <agent_name> <agent_role> [description]

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to display usage
show_usage() {
    echo "Usage: $0 <agent_name> <agent_role> [description]"
    echo ""
    echo "Options:"
    echo "  <agent_name>   Name of the agent to create (e.g., Validator)"
    echo "  <agent_role>   Primary role/specialization of the agent"
    echo "  [description]  Optional detailed description of the agent's purpose"
    echo ""
    echo "Examples:"
    echo "  $0 Validator \"Input validation specialist\" \"Ensures data integrity across the system\""
    echo "  $0 Reporter \"System reporting agent\""
    echo ""
    echo "Multi-Tier Architecture:"
    echo "  This script creates agents using the three-tier memory system:"
    echo "  - TIER 1: {agent}-instructions.md (Immutable Identity)"
    echo "  - TIER 2: GLOBAL-CONTEXT.md (Cross-Project Knowledge)"
    echo "  - TIER 3: LOCAL-CONTEXT.md (Project-Specific Context)"
    exit 1
}

# Parse arguments
AGENT_NAME="$1"
AGENT_ROLE="$2"
AGENT_DESCRIPTION="${3:-$AGENT_ROLE}"

if [ -z "$AGENT_NAME" ] || [ -z "$AGENT_ROLE" ]; then
    show_usage
fi

# Set base paths using relative paths (not hardcoded)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CI_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
AGENTS_DIR="$CI_ROOT/AGENTS"
AGENT_DIR="$AGENTS_DIR/$AGENT_NAME"
AGENT_NAME_LOWER=$(echo "$AGENT_NAME" | tr '[:upper:]' '[:lower:]')
MANAGER_DIR="$AGENTS_DIR/Manager"

# Pre-creation validation
echo -e "${BLUE}Performing pre-creation validation...${NC}"

# Check if agent already exists
if [ -d "$AGENT_DIR" ]; then
    echo -e "${RED}Error: Agent '$AGENT_NAME' already exists at $AGENT_DIR${NC}"
    exit 1
fi

# Run similarity check using Manager's validation script
VALIDATION_SCRIPT="$MANAGER_DIR/scripts/validate-agent.sh"
if [ -x "$VALIDATION_SCRIPT" ]; then
    echo -e "${BLUE}Checking for similar existing agents...${NC}"
    if ! "$VALIDATION_SCRIPT" "$AGENT_NAME" "$AGENT_ROLE"; then
        echo -e "${RED}Validation failed. Please review warnings above.${NC}"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi

# Validate agent name format
if [[ ! "$AGENT_NAME" =~ ^[A-Z][A-Za-z0-9]*$ ]]; then
    echo -e "${RED}Error: Agent name must start with an uppercase letter and contain only alphanumeric characters${NC}"
    exit 1
fi

echo -e "${GREEN}Validation complete. Creating agent '$AGENT_NAME'...${NC}"

# Create directory structure
mkdir -p "$AGENT_DIR/Sessions"
mkdir -p "$CI_ROOT/.claude/agents/${AGENT_NAME_LOWER}"

# Get current date
CURRENT_DATE=$(date '+%Y-%m-%d')

# ============================================================================
# TIER 1: Create {agent}-instructions.md (Immutable Identity)
# ============================================================================
echo -e "${BLUE}Creating TIER 1: ${AGENT_NAME_LOWER}-instructions.md...${NC}"
cat > "$AGENT_DIR/${AGENT_NAME_LOWER}-instructions.md" << EOF
# $AGENT_NAME

## Core Identity & Purpose

$AGENT_DESCRIPTION

As $AGENT_NAME, I specialize in $AGENT_ROLE.

## Guiding Principles

1. [Principle 1 - TO BE FILLED based on $AGENT_ROLE]
2. [Principle 2 - TO BE FILLED]
3. [Principle 3 - TO BE FILLED]

## Primary Responsibilities

- [Responsibility 1 - TO BE FILLED based on $AGENT_ROLE]
- [Responsibility 2 - TO BE FILLED]
- [Responsibility 3 - TO BE FILLED]

## Approach

[How this agent works - TO BE FILLED based on $AGENT_ROLE]

## Three-Tier Memory Architecture

**TIER 1**: Immutable core principles and identity (this file)
**TIER 2**: Cross-project patterns and frameworks validated in 2+ projects (GLOBAL-CONTEXT.md)
**TIER 3**: Session-specific context and active work in current project (LOCAL-CONTEXT.md)

---

**Core Identity**: Defined $CURRENT_DATE
**Architecture**: Multi-tier memory system
EOF

# ============================================================================
# TIER 2: Create GLOBAL-CONTEXT.md (Cross-Project Knowledge)
# ============================================================================
echo -e "${BLUE}Creating TIER 2: GLOBAL-CONTEXT.md...${NC}"
cat > "$AGENT_DIR/GLOBAL-CONTEXT.md" << EOF
# $AGENT_NAME - Global Context

## Core Principles (Universal)

**Applicable to**: All $AGENT_ROLE work across domains

[Cross-project principles - TO BE FILLED as patterns emerge]

## Pattern Library (Cross-Domain)

**Validated in**: [List projects where patterns proven]

### Effective Patterns

[Patterns that work across projects - TO BE FILLED]

### Anti-Patterns

[What to avoid - TO BE FILLED]

## Analytical Frameworks

[Frameworks used across projects - TO BE FILLED]

---

**Global Context**: Cross-project patterns validated in 2+ projects
**Last Updated**: $CURRENT_DATE
**Projects Validated**: [List projects]
**Architecture**: Three-tier memory system
EOF

# ============================================================================
# TIER 3: Create LOCAL-CONTEXT.md (Project-Specific Context)
# ============================================================================
echo -e "${BLUE}Creating TIER 3: LOCAL-CONTEXT.md...${NC}"
cat > "$CI_ROOT/.claude/agents/${AGENT_NAME_LOWER}/LOCAL-CONTEXT.md" << EOF
# $AGENT_NAME - Local Context

## Recent Work

[Project-specific work in CollaborativeIntelligence - TO BE FILLED by memory system]

## Active Focus Areas

[Current priorities in this project - TO BE FILLED]

## Project-Specific Patterns

[Patterns specific to CollaborativeIntelligence - TO BE FILLED]

---

**Local Context**: Project-specific work in CollaborativeIntelligence
**Last Updated**: $CURRENT_DATE
EOF

# ============================================================================
# Create metadata.json (Assembly metadata)
# ============================================================================
echo -e "${BLUE}Creating metadata.json...${NC}"
cat > "$AGENT_DIR/metadata.json" << EOF
{
  "name": "${AGENT_NAME_LOWER}",
  "description": "${AGENT_DESCRIPTION}",
  "model": "inherit",
  "color": "#9D4EDD"
}
EOF

# ============================================================================
# Create MEMORY.md (Raw logging, NOT assembled)
# ============================================================================
echo -e "${BLUE}Creating MEMORY.md (raw log)...${NC}"
cat > "$AGENT_DIR/MEMORY.md" << EOF
# $AGENT_NAME - Memory Log

## Recent Activity

[Raw memory log - automatically updated by PostToolUse hooks]
[Processed by Mnemosyne agent into GLOBAL-CONTEXT.md and LOCAL-CONTEXT.md]

---

**Purpose**: Raw memory logging (not assembled into native agent file)
**Processing**: Mnemosyne compresses this into GLOBAL/LOCAL-CONTEXT.md
**Last Updated**: $CURRENT_DATE
EOF

# ============================================================================
# Create Sessions directory
# ============================================================================
echo -e "${BLUE}Creating Sessions directory...${NC}"
cat > "$AGENT_DIR/Sessions/README.md" << EOF
# $AGENT_NAME Sessions

Session records for $AGENT_NAME agent's work.

## Organization

- \`ProjectName-YYYY-MM-DD.md\`: Individual sessions
- Each session contains work log and outcomes

## Active Sessions

[Currently active work]

## Completed Sessions

[Successfully completed work]

---

**Last Updated**: $CURRENT_DATE
EOF

# ============================================================================
# Optional: Create README.md for human readers (GitHub display)
# ============================================================================
echo -e "${BLUE}Creating README.md (human documentation)...${NC}"
cat > "$AGENT_DIR/README.md" << EOF
# $AGENT_NAME Agent

> **Note**: This README is for human readers. Claude Code loads from \`${AGENT_NAME_LOWER}-instructions.md\` + \`GLOBAL-CONTEXT.md\` + \`LOCAL-CONTEXT.md\`.

## Purpose

$AGENT_DESCRIPTION

## Core Identity

As $AGENT_NAME, I specialize in $AGENT_ROLE.

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

---

**Created**: $CURRENT_DATE
**Architecture**: Multi-tier memory system
**Assembly**: \`assemble-agent-file.sh ${AGENT_NAME}\`
EOF

# ============================================================================
# Assemble native agent file
# ============================================================================
echo -e "${BLUE}Assembling native agent file...${NC}"
ASSEMBLY_SCRIPT="$CI_ROOT/interfaces/claude-bridge/scripts/assemble-agent-file.sh"

if [[ -x "$ASSEMBLY_SCRIPT" ]]; then
    if "$ASSEMBLY_SCRIPT" "$AGENT_NAME"; then
        echo -e "${GREEN}✅ Agent assembled: ~/.claude/agents/${AGENT_NAME_LOWER}.md${NC}"
    else
        echo -e "${RED}❌ Assembly failed - check source files${NC}"
        echo -e "${YELLOW}   Debug: Check that all source files were created correctly${NC}"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠️  Assembly script not found: $ASSEMBLY_SCRIPT${NC}"
    echo -e "${YELLOW}   Run manually: assemble-agent-file.sh $AGENT_NAME${NC}"
fi

# ============================================================================
# Post-creation summary
# ============================================================================
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}Agent '$AGENT_NAME' created successfully!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Files created:${NC}"
echo "  ✅ ${AGENT_NAME_LOWER}-instructions.md (TIER 1: Identity)"
echo "  ✅ GLOBAL-CONTEXT.md (TIER 2: Knowledge)"
echo "  ✅ LOCAL-CONTEXT.md (TIER 3: Context)"
echo "  ✅ metadata.json (Assembly metadata)"
echo "  ✅ MEMORY.md (Raw logging)"
echo "  ✅ README.md (Human documentation)"
echo "  ✅ Sessions/README.md (Organization)"
echo ""
echo -e "${BLUE}Agent location:${NC}"
echo "  Source files: $AGENT_DIR"
echo "  Assembled file: ~/.claude/agents/${AGENT_NAME_LOWER}.md"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT: Restart Claude Code to load new agent${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Review and fill in [TO BE FILLED] sections in:"
echo "     - ${AGENT_NAME_LOWER}-instructions.md (principles, responsibilities)"
echo "     - GLOBAL-CONTEXT.md (will populate as agent gains experience)"
echo "  2. Restart Claude Code"
echo "  3. Test: @agent-${AGENT_NAME_LOWER}"
echo "  4. Update AGENTS.md with complete agent profile"
echo ""
echo -e "${BLUE}Architecture:${NC}"
echo "  Memory updates: PostToolUse hooks → MEMORY.md → Mnemosyne compression"
echo "  Assembly: assemble-agent-file.sh combines all tiers"
echo "  Reassemble: assemble-agent-file.sh $AGENT_NAME"
echo ""