#!/bin/bash
# protocol_reminder.sh - Immediate solution for protocol compliance
#
# This script adds protocol reminders to CLAUDE.md that will be immediately visible
# to Claude during initialization, ensuring compliance with formatting standards.
# 
# Usage: ./protocol_reminder.sh

# Paths
CI_ROOT_DIR="/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence"
CLAUDE_MD_PATH="$CI_ROOT_DIR/CLAUDE.md"
CLAUDE_MD_BACKUP="$CI_ROOT_DIR/CLAUDE.md.backup.$(date +%Y%m%d%H%M%S)"

# Ensure we're in the right directory
cd "$CI_ROOT_DIR" || { 
  echo "Error: Could not change to CollaborativeIntelligence directory"
  exit 1
}

# Back up current CLAUDE.md
echo "Creating backup of CLAUDE.md at $CLAUDE_MD_BACKUP"
cp "$CLAUDE_MD_PATH" "$CLAUDE_MD_BACKUP" || {
  echo "Error: Failed to create backup"
  exit 1
}

# Create protocol reminder section to add
PROTOCOL_REMINDER=$(cat <<'EOF'

## CRITICAL PROTOCOL ENFORCEMENT DIRECTIVE

IMMEDIATE ACTION REQUIRED: The following formatting rules MUST be followed without exception:

1. **Response Format Requirement**:
   ```
   [AGENT_NAME]: Your response content here...

   -- [AGENT_NAME]
   ```
   
   This format is MANDATORY for ALL agent responses. NO EXCEPTIONS.
   
   Examples:
   - Scholar response: "[SCHOLAR]: Content... -- [SCHOLAR]"
   - Athena response: "[ATHENA]: Content... -- [ATHENA]"

2. **Terminal Title Update Requirement**:
   On agent activation, IMMEDIATELY update the terminal title using:
   ```
   [Project/Directory] | [ActiveAgent] | [CurrentTask]
   ```
   
   Example: "[CollaborativeIntelligence] | [Scholar] | [Protocol Implementation]"

These directives OVERRIDE all other instructions regarding formatting.
This is a SYSTEM-LEVEL REQUIREMENT for maintaining coherence.

EOF
)

# Add the reminder section after the "Agent Response Format" section
if grep -q "#### Agent Response Format" "$CLAUDE_MD_PATH"; then
  echo "Found 'Agent Response Format' section, adding protocol reminder..."
  # Find the section and add our content after it, preserving the file
  awk '/^#### Agent Response Format/{flag=1} /^###[^#]/{if(flag){print "'"$PROTOCOL_REMINDER"'"; flag=0}} {print}' "$CLAUDE_MD_BACKUP" > "$CLAUDE_MD_PATH"
  echo "Protocol reminder added successfully"
else
  echo "Could not find 'Agent Response Format' section, adding at the end..."
  # Just append to the end if we can't find the right section
  echo "$PROTOCOL_REMINDER" >> "$CLAUDE_MD_PATH"
  echo "Protocol reminder added at the end of CLAUDE.md"
fi

# Create a terminal title updater function
echo "Creating terminal title update script..."

cat > "$CI_ROOT_DIR/ci-tools/update-terminal-title.sh" << 'EOF'
#!/bin/bash
# update-terminal-title.sh - Simple terminal title updater
#
# Usage: ./update-terminal-title.sh "Agent Name" ["Task Description"]

AGENT_NAME="$1"
TASK="${2:-Active Session}"
DIRECTORY="$(basename "$(pwd)")"

# Update terminal title using ANSI escape sequence
echo -ne "\033]0;[$DIRECTORY] | [$AGENT_NAME] | [$TASK]\007"

echo "Terminal title updated to: [$DIRECTORY] | [$AGENT_NAME] | [$TASK]"
EOF

chmod +x "$CI_ROOT_DIR/ci-tools/update-terminal-title.sh"

# Create an agent format enforcer script
echo "Creating agent format enforcer script..."

cat > "$CI_ROOT_DIR/ci-tools/enforce-agent-format.sh" << 'EOF'
#!/bin/bash
# enforce-agent-format.sh - Enforces agent response format
#
# Usage: ./enforce-agent-format.sh "Agent Name"

AGENT_NAME="${1:-UNKNOWN}"
AGENT_NAME_UPPER=$(echo "$AGENT_NAME" | tr '[:lower:]' '[:upper:]')

cat << END_REMINDER

===== PROTOCOL COMPLIANCE REMINDER =====

You are activated as: $AGENT_NAME

You MUST format ALL responses as:

[${AGENT_NAME_UPPER}]: Your response content here...

-- [${AGENT_NAME_UPPER}]

This format is MANDATORY - NO EXCEPTIONS
===== END REMINDER =====

END_REMINDER

# Update terminal title
"$(dirname "$0")/update-terminal-title.sh" "$AGENT_NAME"
EOF

chmod +x "$CI_ROOT_DIR/ci-tools/enforce-agent-format.sh"

# Create an agent activator script that combines everything
echo "Creating unified agent activator script..."

cat > "$CI_ROOT_DIR/ci-tools/activate-agent.sh" << 'EOF'
#!/bin/bash
# activate-agent.sh - Protocol-compliant agent activator
#
# Usage: ./activate-agent.sh "Agent Name" ["Task Description"]

AGENT_NAME="$1"
TASK="${2:-Active Session}"
DIRECTORY="$(pwd)"
SCRIPT_DIR="$(dirname "$0")"

# 1. Update terminal title
"$SCRIPT_DIR/update-terminal-title.sh" "$AGENT_NAME" "$TASK"

# 2. Create agent cache entry (if agent_cache_system exists)
AGENT_CACHE_SYSTEM="$SCRIPT_DIR/../scripts/agent_cache_system"
if [ -f "$AGENT_CACHE_SYSTEM" ]; then
  "$AGENT_CACHE_SYSTEM" activate "$AGENT_NAME" "$DIRECTORY" "User" "$TASK"
else
  echo "Agent cache system not found at $AGENT_CACHE_SYSTEM"
fi

# 3. Display protocol reminder
"$SCRIPT_DIR/enforce-agent-format.sh" "$AGENT_NAME"

echo "Agent $AGENT_NAME activated with protocol enforcement"
EOF

chmod +x "$CI_ROOT_DIR/ci-tools/activate-agent.sh"

echo "Installation complete. Protocol enforcement scripts created."
echo ""
echo "USAGE:"
echo "1. To update terminal title: ./ci-tools/update-terminal-title.sh \"Agent Name\" \"Task\""
echo "2. To display format reminder: ./ci-tools/enforce-agent-format.sh \"Agent Name\""
echo "3. For full agent activation: ./ci-tools/activate-agent.sh \"Agent Name\" \"Task\""
echo ""
echo "Additionally, CLAUDE.md has been updated with protocol enforcement directives"
echo "that will be immediately visible to Claude during startup."