#!/bin/bash
# Phase 2: Resource Consolidation Script
# This script moves existing content to the new directory structure

set -e  # Exit on error
BASE_DIR="/Users/joshkornreich/Documents/Projects/Nuru-AI/CollaborativeIntelligence"
cd "$BASE_DIR"

echo "Phase 2: Consolidating resources to new structure..."

# Function to safely copy while preserving directory structure
safe_copy() {
  mkdir -p "$(dirname "$2")"
  cp -r "$1" "$2"
  echo "Copied: $1 -> $2"
}

# 1. Agent Consolidation
echo "Moving agent content..."
# Core agents
safe_copy "$BASE_DIR/AGENTS/Athena" "$BASE_DIR/agents/core/athena"
safe_copy "$BASE_DIR/AGENTS/Gaia" "$BASE_DIR/agents/core/gaia"
safe_copy "$BASE_DIR/AGENTS/Manager" "$BASE_DIR/agents/core/manager"
safe_copy "$BASE_DIR/AGENTS/Hermes" "$BASE_DIR/agents/core/hermes"

# Development agents
safe_copy "$BASE_DIR/AGENTS/Developer" "$BASE_DIR/agents/development/developer"
safe_copy "$BASE_DIR/AGENTS/Engineer" "$BASE_DIR/agents/development/engineer"
safe_copy "$BASE_DIR/AGENTS/Refactorer" "$BASE_DIR/agents/development/refactorer"
safe_copy "$BASE_DIR/AGENTS/CLIImplementer" "$BASE_DIR/agents/development/cli-implementer"
safe_copy "$BASE_DIR/AGENTS/Debugger" "$BASE_DIR/agents/development/debugger"
safe_copy "$BASE_DIR/AGENTS/Tester" "$BASE_DIR/agents/development/tester"

# Knowledge agents
safe_copy "$BASE_DIR/AGENTS/Memory" "$BASE_DIR/agents/knowledge/memory"
safe_copy "$BASE_DIR/AGENTS/Mnemosyne" "$BASE_DIR/agents/knowledge/mnemosyne"
safe_copy "$BASE_DIR/AGENTS/SageKeeper" "$BASE_DIR/agents/knowledge/sage-keeper"
safe_copy "$BASE_DIR/AGENTS/Sage" "$BASE_DIR/agents/knowledge/sage"
safe_copy "$BASE_DIR/AGENTS/Scholar" "$BASE_DIR/agents/knowledge/scholar"

# Specialized agents
safe_copy "$BASE_DIR/AGENTS/Analyst" "$BASE_DIR/agents/specialized/analyst"
safe_copy "$BASE_DIR/AGENTS/Architect" "$BASE_DIR/agents/specialized/architect"
safe_copy "$BASE_DIR/AGENTS/Automator" "$BASE_DIR/agents/specialized/automator"
safe_copy "$BASE_DIR/AGENTS/Benchmarker" "$BASE_DIR/agents/specialized/benchmarker"
safe_copy "$BASE_DIR/AGENTS/Cacher" "$BASE_DIR/agents/specialized/cacher"
safe_copy "$BASE_DIR/AGENTS/Cartographer" "$BASE_DIR/agents/specialized/cartographer"
safe_copy "$BASE_DIR/AGENTS/Consolidator" "$BASE_DIR/agents/specialized/consolidator"
safe_copy "$BASE_DIR/AGENTS/Database" "$BASE_DIR/agents/specialized/database"
safe_copy "$BASE_DIR/AGENTS/Documenter" "$BASE_DIR/agents/specialized/documenter"
safe_copy "$BASE_DIR/AGENTS/Expert" "$BASE_DIR/agents/specialized/expert"
safe_copy "$BASE_DIR/AGENTS/Fixer" "$BASE_DIR/agents/specialized/fixer"
safe_copy "$BASE_DIR/AGENTS/Human" "$BASE_DIR/agents/specialized/human"
safe_copy "$BASE_DIR/AGENTS/Inspector" "$BASE_DIR/agents/specialized/inspector"
safe_copy "$BASE_DIR/AGENTS/Optimizer" "$BASE_DIR/agents/specialized/optimizer"
safe_copy "$BASE_DIR/AGENTS/Overviewer" "$BASE_DIR/agents/specialized/overviewer"
safe_copy "$BASE_DIR/AGENTS/Recommender" "$BASE_DIR/agents/specialized/recommender"
safe_copy "$BASE_DIR/AGENTS/SolutionArchitect" "$BASE_DIR/agents/specialized/solution-architect"
safe_copy "$BASE_DIR/AGENTS/Solver" "$BASE_DIR/agents/specialized/solver"
safe_copy "$BASE_DIR/AGENTS/Streamliner" "$BASE_DIR/agents/specialized/streamliner"
safe_copy "$BASE_DIR/AGENTS/Topologist" "$BASE_DIR/agents/specialized/topologist"
safe_copy "$BASE_DIR/AGENTS/UI" "$BASE_DIR/agents/specialized/ui"
safe_copy "$BASE_DIR/AGENTS/UX" "$BASE_DIR/agents/specialized/ux"
safe_copy "$BASE_DIR/AGENTS/User" "$BASE_DIR/agents/specialized/user"
safe_copy "$BASE_DIR/AGENTS/Verifier" "$BASE_DIR/agents/specialized/verifier"
safe_copy "$BASE_DIR/AGENTS/Visionary" "$BASE_DIR/agents/specialized/visionary"
safe_copy "$BASE_DIR/AGENTS/Wellness" "$BASE_DIR/agents/specialized/wellness"

# 2. CLI Tools
echo "Moving CLI tools..."
safe_copy "$BASE_DIR/ci-tools" "$BASE_DIR/cli/ci-tools"
safe_copy "$BASE_DIR/claude-cli-plugin" "$BASE_DIR/cli/plugins/claude-cli-plugin"
safe_copy "$BASE_DIR/scripts" "$BASE_DIR/cli/scripts"
safe_copy "$BASE_DIR/Terminal" "$BASE_DIR/cli/terminal"

# 3. Documentation
echo "Moving documentation..."
safe_copy "$BASE_DIR/Documentation" "$BASE_DIR/docs/guides"
safe_copy "$BASE_DIR/CLAUDE.md" "$BASE_DIR/docs/CLAUDE.md"
safe_copy "$BASE_DIR/QuickStart.md" "$BASE_DIR/docs/guides/QuickStart.md"
safe_copy "$BASE_DIR/README.md" "$BASE_DIR/docs/README.md"
safe_copy "$BASE_DIR/AgentGuide.md" "$BASE_DIR/docs/guides/AgentGuide.md"
safe_copy "$BASE_DIR/Protocols" "$BASE_DIR/docs/protocols"
safe_copy "$BASE_DIR/Architectures" "$BASE_DIR/docs/architecture"

# 4. Data
echo "Moving data resources..."
safe_copy "$BASE_DIR/CACHE" "$BASE_DIR/data/cache"
safe_copy "$BASE_DIR/Sessions" "$BASE_DIR/data/sessions"
safe_copy "$BASE_DIR/BENCHMARKS" "$BASE_DIR/data/benchmarks"

# 5. Extensions
echo "Moving extension projects..."
# Move Kanji-related files to extensions/kanji
safe_copy "$BASE_DIR/CACHE/API_CACHE" "$BASE_DIR/extensions/kanji/api-cache"
safe_copy "$BASE_DIR/CACHE/JAPANESE_KANJI*.md" "$BASE_DIR/extensions/kanji/docs/"
safe_copy "$BASE_DIR/joyo_kanji_list.txt" "$BASE_DIR/extensions/kanji/data/joyo_kanji_list.txt"
# Move Tauri-related files
safe_copy "$BASE_DIR/tauri-test-script" "$BASE_DIR/extensions/tauri/test-script"
safe_copy "$BASE_DIR/TAURI_*.md" "$BASE_DIR/extensions/tauri/docs/"
safe_copy "$BASE_DIR/TAURI_*.ts" "$BASE_DIR/extensions/tauri/src/"
safe_copy "$BASE_DIR/TAURI_*.tsx" "$BASE_DIR/extensions/tauri/src/"

# 6. Core system components
echo "Moving core system components..."
safe_copy "$BASE_DIR/AGENT_INDEX.md" "$BASE_DIR/core/AGENT_INDEX.md"
safe_copy "$BASE_DIR/docs/agent-system/claude-agents.md" "$BASE_DIR/core/CLAUDE_AGENTS.md"
safe_copy "$BASE_DIR/docs/core-concepts/collaborative-intelligences.md" "$BASE_DIR/core/CollaborativeIntelligences.md"
safe_copy "$BASE_DIR/AGENT_PROACTIVE_BEHAVIOR.md" "$BASE_DIR/core/protocols/AGENT_PROACTIVE_BEHAVIOR.md"
safe_copy "$BASE_DIR/docs/architecture/database-schema.md" "$BASE_DIR/core/architecture/DATABASE_SCHEMA.md"

echo "Resource consolidation complete."
echo "Phase 2 complete."