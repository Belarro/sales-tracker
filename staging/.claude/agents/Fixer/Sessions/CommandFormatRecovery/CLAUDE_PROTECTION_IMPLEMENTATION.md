# CLAUDE.md Protection Implementation

## Vulnerability Assessment

The CLAUDE.md file is critical to the Collaborative Intelligence system as it contains:
1. Core system configuration
2. Agent activation patterns and processing instructions
3. Collaboration framework definitions
4. Memory management protocols

If this file is overridden or modified by external processes, it could break critical functionality including:
- Agent activation patterns
- Response formatting
- Command processing
- Memory structures

## Protection Mechanisms

To protect CLAUDE.md from unauthorized modifications, I recommend implementing the following complementary approaches:

### 1. Backup and Version Control

Create a protected backup of CLAUDE.md that can restore the file if it's modified:

```bash
# Create a hidden backup
cp /Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/CLAUDE.md /Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/.CLAUDE.md.backup

# Make the backup read-only
chmod 444 /Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/.CLAUDE.md.backup
```

### 2. Integrity Verification System

Implement an integrity check that runs when Claude Code starts to verify CLAUDE.md hasn't been tampered with:

```bash
# Create an integrity verification function in ci-tools/lib/common.sh
function verify_claude_integrity() {
  local claude_md="$1"
  local backup_claude_md="$(dirname "$claude_md")/.CLAUDE.md.backup"
  
  # Check if backup exists
  if [[ ! -f "$backup_claude_md" ]]; then
    echo "Creating backup of CLAUDE.md for integrity verification"
    cp "$claude_md" "$backup_claude_md"
    chmod 444 "$backup_claude_md"
    return 0
  fi
  
  # Compare files (use just size and modification time for quick check)
  if ! cmp -s "$claude_md" "$backup_claude_md"; then
    echo "WARNING: CLAUDE.md may have been modified"
    
    # Verify key sections exist
    if ! grep -q "Agent Activation and Response Format" "$claude_md"; then
      echo "CRITICAL: CLAUDE.md is missing essential sections"
      echo "Restoring from backup..."
      cp "$backup_claude_md" "$claude_md"
      echo "CLAUDE.md restored from backup"
    else
      # Update backup if changes look legitimate
      echo "CLAUDE.md has been modified but essential sections remain"
      echo "Updating backup..."
      cp "$claude_md" "$backup_claude_md"
      chmod 444 "$backup_claude_md"
    fi
  fi
}
```

### 3. CLAUDE.md.protected File

Create an additional protected file that contains only the critical command processing instructions:

```bash
# Extract critical sections to a protected file
cat > /Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/CLAUDE.md.protected << EOF
# Critical Protected Instructions - DO NOT MODIFY

## Agent Activation and Response Format

### Activating Agents

The system recognizes multiple formats for activating agents:

1. **Direct Name**: Simply type the agent's name at the beginning of your message:
   \`\`\`
   Athena
   \`\`\`

2. **Agent:NAME Format**: Use the Agent: prefix followed by the agent name:
   \`\`\`
   Agent:Athena
   \`\`\`

3. **Bracketed Format**: Use the agent name in square brackets:
   \`\`\`
   [Athena]
   \`\`\`

When you see any of these patterns at the beginning of a message, immediately:
1. Parse the agent name from the pattern
2. Switch to that named agent's context and capabilities
3. Process the rest of the message (if any) as that agent
4. Format your response with the proper agent name prefix in square brackets

### Agent Response Format

All agents should prefix their responses with their agent name in square brackets:

\`\`\`
[AGENT_NAME]: Response content goes here...
\`\`\`
EOF

# Make it read-only
chmod 444 /Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/CLAUDE.md.protected
```

### 4. CLAUDE.local.md.template Update

Modify the CLAUDE.local.md.template to include redundant instructions for critical functionality:

```bash
# Update the template to include critical instructions
cat > /Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/CLAUDE.local.md.template << EOF
# Load CollaborativeIntelligence System

When starting, immediately:
1. Load /Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/CLAUDE.md
2. Load /Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence/CLAUDE.md.protected
3. Use these as the primary configuration sources
4. Defer all project management functions to the CollaborativeIntelligence system

# Critical Functionality Redundancy
If you don't see instructions for agent activation patterns in CLAUDE.md, use these:

### Activating Agents

The system recognizes multiple formats for activating agents:

1. Direct Name: Example "Athena"
2. Agent:NAME Format: Example "Agent:Athena"
3. Bracketed Format: Example "[Athena]"

When you see any of these patterns at the beginning of a message, immediately:
1. Parse the agent name from the pattern
2. Switch to that named agent's context and capabilities
3. Process the rest of the message (if any) as that agent
4. Format your response with the proper agent name prefix in square brackets
EOF
```

### 5. CI Script Update to Check and Restore CLAUDE.md

Modify the CI script to check and restore CLAUDE.md if needed:

```bash
# Add to CI command early in execution
check_claude_md() {
  local ci_path="$1"
  local claude_md="$ci_path/CLAUDE.md"
  local claude_backup="$ci_path/.CLAUDE.md.backup"
  local claude_protected="$ci_path/CLAUDE.md.protected"
  
  # Create backup if it doesn't exist
  if [[ ! -f "$claude_backup" ]]; then
    cp "$claude_md" "$claude_backup"
    chmod 444 "$claude_backup"
  fi
  
  # Create protected file if it doesn't exist
  if [[ ! -f "$claude_protected" ]]; then
    extract_critical_sections "$claude_md" > "$claude_protected"
    chmod 444 "$claude_protected"
  fi
  
  # Check if CLAUDE.md is missing critical sections
  if ! grep -q "Agent Activation and Response Format" "$claude_md"; then
    echo "CRITICAL: CLAUDE.md is missing essential sections, restoring..."
    cp "$claude_backup" "$claude_md"
    echo "CLAUDE.md restored successfully"
  fi
}
```

## Implementation Plan

1. Create the backup file and make it read-only
2. Create the CLAUDE.md.protected file with critical sections
3. Update the CLAUDE.local.md.template
4. Implement the integrity verification function
5. Add the check_claude_md function to the CI scripts

## Monitoring and Response

To ensure continued protection:

1. Add a periodic check for CLAUDE.md integrity
2. Set up notifications if unauthorized modifications are detected
3. Create a recovery process for cases where both files are compromised

---

This multi-layered approach ensures that even if CLAUDE.md is modified, the critical functionality will persist through redundant protection mechanisms.