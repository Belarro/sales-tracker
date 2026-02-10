#!/bin/bash
# Phase 4: Special Resources Script
# This script handles special cases and updates references in files

set -e  # Exit on error
BASE_DIR="/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence"
cd "$BASE_DIR"

echo "Phase 4: Handling special resources and updating references..."

# 1. Handle CLAUDE.md - special case due to its importance
echo "Handling CLAUDE.md..."
# Create a symlink to ensure it works in both locations during transition
ln -sf "$BASE_DIR/docs/CLAUDE.md" "$BASE_DIR/CLAUDE.md.symlink"

# 2. Update path references in key files
echo "Updating path references in documentation..."

# Function to update paths in markdown files
update_paths() {
  local file="$1"
  echo "Updating paths in $file"
  
  # Skip if file doesn't exist
  if [ ! -f "$file" ]; then
    echo "File $file does not exist, skipping"
    return
  fi
  
  # Update references from old to new paths
  sed -i.bak \
    -e 's|/AGENTS/|/agents/|g' \
    -e 's|/BENCHMARKS/|/data/benchmarks/|g' \
    -e 's|/CACHE/|/data/cache/|g' \
    -e 's|/Documentation/|/docs/guides/|g' \
    -e 's|/Protocols/|/docs/protocols/|g' \
    -e 's|/Architectures/|/docs/architecture/|g' \
    -e 's|/Sessions/|/data/sessions/|g' \
    -e 's|/ci-tools/|/cli/ci-tools/|g' \
    -e 's|/scripts/|/cli/scripts/|g' \
    "$file"
  
  # Remove backup files
  rm -f "${file}.bak"
}

# Update paths in key documentation files
for doc_file in $(find "$BASE_DIR/docs" -name "*.md"); do
  update_paths "$doc_file"
done

# Update paths in README files
for readme in $(find "$BASE_DIR" -name "README.md"); do
  update_paths "$readme"
done

# 3. Handle other special cases
echo "Handling agent activation commands..."

# Update agent activation scripts if they exist
if [ -f "$BASE_DIR/cli/ci-tools/cmd/agent.sh" ]; then
  echo "Updating agent activation script..."
  # Update agent path references in activation script
  sed -i.bak \
    -e 's|/AGENTS/|/agents/|g' \
    "$BASE_DIR/cli/ci-tools/cmd/agent.sh"
  rm -f "${BASE_DIR}/cli/ci-tools/cmd/agent.sh.bak"
fi

# 4. Create agent categorization mapping
echo "Creating agent categorization mapping..."
cat > "$BASE_DIR/core/agent_categories.md" << 'EOF'
# Agent Categorization Map

This file maps agents to their categories in the new directory structure.

## Core Agents
- Athena
- Gaia
- Manager
- Hermes

## Development Agents
- Developer
- Engineer
- Refactorer
- CLIImplementer
- Debugger
- Tester
- Rustist
- Basher
- Applicationer
- Linguist

## Knowledge Agents
- Memory
- Mnemosyne
- SageKeeper
- Sage
- Scholar

## Specialized Agents
- Analyst
- Architect
- Automator
- Benchmarker
- Cacher
- Cartographer
- Consolidator
- Database
- Documenter
- Expert
- Fixer
- Human
- Inspector
- Marketer
- Optimizer
- Overviewer
- Recommender
- SolutionArchitect
- Solver
- Streamliner
- Topologist
- UI
- UX
- User
- Verifier
- Visionary
- Wellness

This mapping is used by the repository restructuring process to organize agents into logical domains.
EOF

# 5. Create core/README.md
echo "Creating Core README..."
mkdir -p "$BASE_DIR/core"
cat > "$BASE_DIR/core/README.md" << 'EOF'
# Core System Components

This directory contains the core components of the Collaborative Intelligence system:

## Memory System
The memory architecture in `memory/`:
- Memory structure definitions
- Knowledge organization principles
- Integration mechanisms

## Protocols
System communication protocols in `protocols/`:
- Agent interaction standards
- Communication formats
- Protocol enforcement mechanisms

## Architecture
System design documents in `architecture/`:
- Core architectural patterns
- Component relationships
- System boundaries

## Core Files
- **AGENT_INDEX.md** - Definitive list of all available agents
- **docs/agent-system/claude-agents.md** - Core agent interaction framework
- **agent_categories.md** - Agent domain categorization

These components form the foundation of the Collaborative Intelligence system and define the standards that all other components follow.
EOF

# 6. Create tools/README.md
echo "Creating Tools README..."
mkdir -p "$BASE_DIR/tools"
cat > "$BASE_DIR/tools/README.md" << 'EOF'
# Development Tools

This directory contains tools for developing and maintaining the Collaborative Intelligence system:

## Testing Tools
Testing utilities in `testing/`:
- Test frameworks
- Test data generators
- Validation tools

## Development Utilities
Development helpers in `development/`:
- Code generators
- Development utilities
- Workflow tools

These tools support the development process but are not part of the core runtime system.
EOF

# 7. Create data/README.md
echo "Creating Data README..."
mkdir -p "$BASE_DIR/data"
cat > "$BASE_DIR/data/README.md" << 'EOF'
# Data Storage

This directory contains data storage for the Collaborative Intelligence system:

## Cache
System caches in `cache/`:
- API response caches
- Query results
- Temporary storage

## Sessions
Session records in `sessions/`:
- Conversation history
- Agent interaction records
- User session data

## Benchmarks
Performance benchmarks in `benchmarks/`:
- Agent performance metrics
- System benchmarks
- Comparison reports

These data resources support system operation and provide historical context for agent actions.
EOF

# 8. Create examples/README.md
echo "Creating Examples README..."
mkdir -p "$BASE_DIR/examples"
cat > "$BASE_DIR/examples/README.md" << 'EOF'
# Example Resources

This directory contains example resources for the Collaborative Intelligence system:

## Conversations
Example conversations in `conversations/`:
- Agent interaction examples
- Usage patterns
- Conversation flows

## Projects
Example projects in `projects/`:
- Sample implementations
- Reference projects
- Integration examples

These examples demonstrate system capabilities and provide reference implementations for common use cases.
EOF

echo "Special resources handling complete."
echo "Phase 4 complete."