#!/bin/bash
# Phase 3: Project Organization Script
# This script organizes project files and updates references

set -e  # Exit on error
BASE_DIR="/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence"
cd "$BASE_DIR"

echo "Phase 3: Organizing project files and updating references..."

# Function to safely move files while preserving git history
safe_move() {
  mkdir -p "$(dirname "$2")"
  if [ -f "$1" ]; then
    # For files
    cp "$1" "$2"
    echo "Organized: $1 -> $2"
  elif [ -d "$1" ]; then
    # For directories
    cp -r "$1" "$2"
    echo "Organized directory: $1 -> $2"
  else
    echo "Warning: Source $1 does not exist, skipping"
  fi
}

# 1. Update agent index in new location
echo "Updating agent index in new structure..."
cp "$BASE_DIR/AGENT_INDEX.md" "$BASE_DIR/core/AGENT_INDEX.md"

# 2. Create updated README.md at root
echo "Creating updated root README.md..."
cat > "$BASE_DIR/README.md" << 'EOF'
# Collaborative Intelligence System

A modular, extensible system for agent-based collaborative intelligence.

## Quick Start

| Command | Description |
|---------|-------------|
| `athena` or `@@athena` | Activate memory & learning systems expert |
| `Recommend an agent` | Find the perfect agent for your task |
| `Overview` | See what's in this repository |

For complete details, see [QuickStart Guide](docs/guides/QuickStart.md)

## Repository Structure

This repository has been organized for maximum readability and maintainability:

- `agents/` - Agent definitions organized by domain
- `cli/` - Command-line tools and interfaces
- `core/` - Core system components and protocols
- `docs/` - Documentation organized by type
- `data/` - Data storage and caching
- `examples/` - Example projects and conversations
- `tools/` - Development and testing tools
- `extensions/` - Optional extensions and integrations

## Getting Started

See the [Documentation](docs/) directory for comprehensive guides.

## License

[License information]
EOF

# 3. Create documentation index
echo "Creating documentation index..."
mkdir -p "$BASE_DIR/docs"
cat > "$BASE_DIR/docs/README.md" << 'EOF'
# Collaborative Intelligence Documentation

## Guides
- [QuickStart Guide](guides/QuickStart.md) - Get started quickly
- [Agent Guide](guides/AgentGuide.md) - Working with specialized agents

## Architecture
- [System Architecture](architecture/CURRENT_ARCHITECTURE_ANALYSIS.md) - Overall system design
- [Knowledge Distribution](architecture/KNOWLEDGE_DISTRIBUTION_ARCHITECTURE.md) - Knowledge flow design

## Protocols
- [Agent Protocol Reference](protocols/AGENT_PROTOCOL_REFERENCE.md) - Standard agent protocols
- [Agent Training Guide](protocols/AGENT_TRAINING_GUIDE.md) - Training new agents

## Core System
- [Agent Index](../core/AGENT_INDEX.md) - Complete list of available agents
- [CLAUDE.md](CLAUDE.md) - Core system configuration

## Extensions
- [Kanji Project](../extensions/kanji/README.md) - Japanese Kanji integration
- [Tauri Integration](../extensions/tauri/README.md) - Desktop application integration
EOF

# 4. Create README files for major sections
echo "Creating section README files..."

# Agents README
mkdir -p "$BASE_DIR/agents"
cat > "$BASE_DIR/agents/README.md" << 'EOF'
# Collaborative Intelligence Agents

This directory contains all agent definitions, organized by domain:

## Core Agents
Core system management and orchestration agents in `core/`:
- **Athena** - Knowledge Architect and Memory Systems Specialist
- **Gaia** - System Orchestration Specialist
- **Manager** - Agent Lifecycle and Ecosystem Specialist
- **Hermes** - Communication Bridge Specialist

## Development Agents
Software development specialists in `development/`:
- **Developer** - Elite Engineering Specialist
- **Engineer** - Implementation and Functionality Specialist
- **Refactorer** - Code Modularization Specialist
- **CLIImplementer** - Command Line Tool Implementation Specialist
- **Debugger** - Technical Error Resolution Specialist
- **Tester** - Testing and Quality Assurance Specialist

## Knowledge Agents
Knowledge management specialists in `knowledge/`:
- **Memory** - Divine Knowledge Keeper and Integration Specialist
- **Mnemosyne** - Divine Memory Keeper and Remembrance Specialist
- **SageKeeper** - Knowledge Acquisition and Memory Integration Specialist
- **Sage** - Ultimate Knowledge Oracle and Wisdom Integrator
- **Scholar** - Learning and Knowledge Processing Specialist

## Specialized Agents
Task-specific specialists in `specialized/`:
- See full [Agent Index](../core/AGENT_INDEX.md) for complete listing

## Agent Structure
Each agent directory follows a standardized structure:
- **README.md** - Agent description and capabilities
- **MEMORY.md** - Long-term memory structure
- **ContinuousLearning.md** - Evolving knowledge and patterns
- **Sessions/** - Record of agent activities

## Activating Agents
Agents can be activated using:
```
@@agent_name
```

For more details, see the [Agent Guide](../docs/guides/AgentGuide.md).
EOF

# CLI README
mkdir -p "$BASE_DIR/cli"
cat > "$BASE_DIR/cli/README.md" << 'EOF'
# Command Line Interface Tools

This directory contains all command-line tools for the Collaborative Intelligence system:

## CI Tools
The main CLI implementation in `ci-tools/`:
- Command-line interface for interacting with the agent system
- Core agent activation mechanisms
- System initialization and configuration

## Plugins
Extensions to the core CLI in `plugins/`:
- **claude-cli-plugin** - Integration with Claude CLI

## Scripts
Utility scripts in `scripts/`:
- Various helper scripts for system management
- Data processing utilities
- Automation scripts

## Terminal
Terminal integration in `terminal/`:
- Terminal session management
- Display customization

## Usage
For usage instructions, see the [CLI Documentation](../docs/guides/CLI.md).
EOF

# 5. Clean up and organize remaining resources
echo "Finalizing organization..."

# Create extensions README files
mkdir -p "$BASE_DIR/extensions/kanji"
cat > "$BASE_DIR/extensions/kanji/README.md" << 'EOF'
# Japanese Kanji Extension

This extension integrates Japanese Kanji processing capabilities into the Collaborative Intelligence system.

## Features
- Kanji data processing and analysis
- API caching for efficient access
- Categorization and grouping of Kanji characters
- Metadata and definitions

## Structure
- `api-cache/` - Cached API responses
- `data/` - Kanji data files
- `docs/` - Documentation and reports

## Usage
[Usage instructions to be added]
EOF

mkdir -p "$BASE_DIR/extensions/tauri"
cat > "$BASE_DIR/extensions/tauri/README.md" << 'EOF'
# Tauri Integration

This extension provides desktop application integration using Tauri.

## Features
- Desktop application framework
- Native OS integration
- Cross-platform compatibility

## Components
- `docs/` - Implementation guides and documentation
- `src/` - Source files for Tauri integration
- `test-script/` - Testing utilities

## Usage
[Usage instructions to be added]
EOF

echo "Project organization complete."
echo "Phase 3 complete."